#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "hydra.h"

void scheduler_init(Scheduler* sched) {
    sched->head = NULL;
    sched->tail = NULL;
    sched->job_count = 0;
}

void scheduler_submit(Scheduler* sched, Job* job) {
    if (sched->tail == NULL) {
        sched->head = job;
        sched->tail = job;
    } else {
        sched->tail->next = job;
        sched->tail = job;
    }
    sched->job_count++;
    printf("[SCHEDULER] Job %s submitted. Total jobs: %d\n", job->id, sched->job_count);
}

Job* scheduler_pop(Scheduler* sched) {
    if (sched->head == NULL) {
        return NULL;
    }
    Job* job = sched->head;
    sched->head = job->next;
    if (sched->head == NULL) {
        sched->tail = NULL;
    }
    sched->job_count--;
    return job;
}
