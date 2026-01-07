#ifndef HYDRA_H
#define HYDRA_H

#include <stdint.h>
#include <stdbool.h>

// Job Status Enum
typedef enum {
    JOB_PENDING,
    JOB_RUNNING,
    JOB_COMPLETED,
    JOB_FAILED
} JobStatus;

// Job Structure
typedef struct Job {
    char id[64];
    char command[256];
    char** args;
    int priority;
    JobStatus status;
    struct Job* next; // Linked list for queue
} Job;

// Scheduler Context
typedef struct {
    Job* head;
    Job* tail;
    int job_count;
    // Mutex/Lock would go here
} Scheduler;

// Function Prototypes
void scheduler_init(Scheduler* sched);
void scheduler_submit(Scheduler* sched, Job* job);
Job* scheduler_pop(Scheduler* sched);

void executor_run(Job* job);

void ipc_start_server(int port, Scheduler* sched);

#endif
