package server

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// Node Registry
type Node struct {
	ID       string `json:"id"`
	LastPing int64  `json:"last_ping"`
	Status   string `json:"status"` // "ALIVE", "DEAD"
	CPUUsage int    `json:"cpu_usage"`
	RAMUsage int    `json:"ram_usage"`
}

var registry = struct {
	Nodes map[string]*Node
}{
	Nodes: make(map[string]*Node),
}

const NodeTimeout = 15 // Seconds

// Handle Heartbeat from Workers
func handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if r.Method != "POST" {
		return
	}

	var req struct {
		ID  string `json:"id"`
		CPU int    `json:"cpu"`
		RAM int    `json:"ram"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	store.Lock() // Reusing the global lock for simplicity or use specific one
	if _, exists := registry.Nodes[req.ID]; !exists {
		log.Printf("[REGISTRY] New node registered: %s", req.ID)
	}
	registry.Nodes[req.ID] = &Node{
		ID:       req.ID,
		LastPing: time.Now().Unix(),
		Status:   "ALIVE",
		CPUUsage: req.CPU,
		RAMUsage: req.RAM,
	}
	store.Unlock()

	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Background Reaper: Finds dead nodes and handles their jobs
func StartReaper() {
	go func() {
		for {
			time.Sleep(5 * time.Second)
			now := time.Now().Unix()

			store.Lock()
			for id, node := range registry.Nodes {
				if now-node.LastPing > NodeTimeout && node.Status == "ALIVE" {
					log.Printf("[REAPER] Node %s is DEAD (Last ping: %ds ago)", id, now-node.LastPing)
					node.Status = "DEAD"

					// Re-schedule jobs assigned to this node
					for _, job := range store.Jobs {
						if job.NodeID == id && job.Status == JobRunning {
							log.Printf("[REAPER] Rescheduling Job %s from dead node %s", job.ID, id)
							job.Status = JobPending
							job.NodeID = ""
							job.Retries++
						}
					}
				}
			}
			store.Unlock()
		}
	}()
}

// Add to handlers main function
/*
	mux.HandleFunc("/api/heartbeat", handleHeartbeat)
	StartReaper()
*/
