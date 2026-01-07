#include <stdio.h>
#include <stdlib.h>
#include "hydra.h"

int main() {
    printf("[HYDRA-X] Core Engine Starting...\n");
    printf("[HYDRA-X] Initializing Scheduler...\n");

    Scheduler sched;
    scheduler_init(&sched);

    printf("[HYDRA-X] Scheduler initialized. Waiting for jobs on port 5050...\n");

    // Start the IPC server (this will block in a real loop)
    // For now, we just simulate start
    ipc_start_server(5050, &sched);

    return 0;
}
