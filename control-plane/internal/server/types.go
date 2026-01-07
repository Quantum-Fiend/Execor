package server

import "time"

// Strict Job State Enum
type JobState string

const (
	JobPending   JobState = "PENDING"
	JobScheduled JobState = "SCHEDULED"
	JobRunning   JobState = "RUNNING"
	JobCompleted JobState = "COMPLETED"
	JobFailed    JobState = "FAILED"
	JobCancelled JobState = "CANCELLED"
)

// Failure Semantics
type FailureReason string

const (
	ReasonNone         FailureReason = ""
	ReasonTimeout      FailureReason = "TIMEOUT"
	ReasonProcessCrash FailureReason = "PROCESS_CRASH"
	ReasonNodeFailure  FailureReason = "NODE_FAILURE"
	ReasonOOM          FailureReason = "OUT_OF_MEMORY"
)

// Enhanced Job Model
type AdvancedJob struct {
	ID          string        `json:"id"`
	Type        string        `json:"type"`
	Command     string        `json:"command"`
	Status      JobState      `json:"status"`
	Reason      FailureReason `json:"failure_reason,omitempty"`
	NodeID      string        `json:"node_id,omitempty"`
	ExitCode    int           `json:"exit_code,omitempty"`
	Retries     int           `json:"retries"`
	MaxRetries  int           `json:"max_retries"`
	CreatedAt   int64         `json:"created_at"`
	StartedAt   int64         `json:"started_at,omitempty"`
	CompletedAt int64         `json:"completed_at,omitempty"`
}

func NewJob(command, jobType string) *AdvancedJob {
	return &AdvancedJob{
		Command:    command,
		Type:       jobType,
		Status:     JobPending,
		CreatedAt:  time.Now().Unix(),
		MaxRetries: 3, // Default policy
	}
}
