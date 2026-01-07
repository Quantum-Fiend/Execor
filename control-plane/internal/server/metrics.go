package server

import (
	"encoding/json"
	"net/http"
	"sync/atomic"
)

var (
	TotalJobsSubmitted uint64
	TotalJobsCompleted uint64
	TotalJobsFailed    uint64
	ActiveConnections  int64
)

func handleMetrics(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	metrics := map[string]interface{}{
		"jobs_submitted_total": atomic.LoadUint64(&TotalJobsSubmitted),
		"jobs_completed_total": atomic.LoadUint64(&TotalJobsCompleted),
		"jobs_failed_total":    atomic.LoadUint64(&TotalJobsFailed),
		"active_connections":   atomic.LoadInt64(&ActiveConnections),
		"nodes_alive":          len(registry.Nodes),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
