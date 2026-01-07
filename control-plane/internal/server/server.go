package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

// JobStore to track jobs in memory
type JobStore struct {
	sync.RWMutex
	Jobs map[string]*AdvancedJob
}

var store = &JobStore{
	Jobs: make(map[string]*AdvancedJob),
}

// JobInfo struct is no longer used, replaced by AdvancedJob
// type JobInfo struct {
// 	ID        string `json:"id"`
// 	Type      string `json:"type"`
// 	Status    string `json:"status"`
// 	Node      string `json:"node"`
// 	Priority  int32  `json:"priority"`
// 	Timestamp int64  `json:"timestamp"`
// }

// REST API Handlers
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func handleJobs(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	store.RLock()
	defer store.RUnlock()

	jobs := make([]*AdvancedJob, 0, len(store.Jobs))
	for _, job := range store.Jobs {
		jobs = append(jobs, job)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(jobs)
}

func handleSubmit(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method == "OPTIONS" {
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Command string `json:"command"`
		Type    string `json:"type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	jobID := fmt.Sprintf("job-%d", time.Now().UnixNano())
	log.Printf("Received job contract: %s", req.Command)

	newJob := NewJob(req.Command, req.Type)
	newJob.ID = jobID
	newJob.NodeID = "core-01"

	store.Lock()
	store.Jobs[jobID] = newJob
	store.Unlock()

	atomic.AddUint64(&TotalJobsSubmitted, 1)

	// Simulate State Transitions
	go func() {
		// PENDING -> RUNNING
		time.Sleep(2 * time.Second)
		store.Lock()
		if j, ok := store.Jobs[jobID]; ok {
			j.Status = JobRunning
			j.StartedAt = time.Now().Unix()
		}
		store.Unlock()

		time.Sleep(5 * time.Second)

		// RUNNING -> COMPLETED
		store.Lock()
		if j, ok := store.Jobs[jobID]; ok {
			j.Status = JobCompleted
			j.CompletedAt = time.Now().Unix()
			j.ExitCode = 0
		}
		store.Unlock()

		atomic.AddUint64(&TotalJobsCompleted, 1)
	}()

	json.NewEncoder(w).Encode(map[string]string{"job_id": jobID, "status": string(JobPending)})
}

// Middleware for Auth and CORS
func withAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == "OPTIONS" {
			return
		}

		// Simple Token Auth
		token := r.Header.Get("Authorization")
		if token != "Bearer hydra-admin-token" {
			// For demo purposes, we log warning but don't block OPTIONS or localhost dashboard without token yet
			// strictly enforcing for writes
			if r.Method == "POST" && token == "" {
				// Allow for now to not break existing dashboard without auth update
				// http.Error(w, "Unauthorized", http.StatusUnauthorized)
				// return
				log.Println("[AUTH] Warning: Request missing authorization header")
			}
		}

		next(w, r)
	}
}

func Start(port int, coreAddr string) error {
	// Start REST API
	mux := http.NewServeMux()

	// API v1 Routes
	mux.HandleFunc("/api/v1/jobs", withAuth(handleJobs))
	mux.HandleFunc("/api/v1/submit", withAuth(handleSubmit))
	mux.HandleFunc("/api/v1/heartbeat", withAuth(handleHeartbeat))
	mux.HandleFunc("/api/v1/metrics", withAuth(handleMetrics))

	// Legacy Routes (Redirect or Alias for backward compat)
	mux.HandleFunc("/api/jobs", withAuth(handleJobs))
	mux.HandleFunc("/api/submit", withAuth(handleSubmit))

	StartReaper()

	log.Printf("Control Plane (REST) listening on :%d", port)
	return http.ListenAndServe(fmt.Sprintf(":%d", port), mux)
}
