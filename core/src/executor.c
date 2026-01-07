#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hydra.h"

#ifdef _WIN32
#include <direct.h>
#include <windows.h>
#define popen _popen
#define pclose _pclose
#define mkdir(path, mode) _mkdir(path)
#define chdir _chdir
#else
#include <unistd.h>
#include <sys/stat.h>
#include <sys/types.h>
#endif

// Helper to create sandbox directory
void setup_sandbox(const char* job_id, char* cwd_buffer) {
    char path[256];
    
    // Base sandbox path
    #ifdef _WIN32
        sprintf(path, "sandbox_%s", job_id);
    #else
        sprintf(path, "/tmp/hydra_jobs/%s", job_id);
    #endif

    // Create directory
    if (mkdir(path, 0777) == 0) {
        printf("[SANDBOX] Created workspace: %s\n", path);
    } else {
        printf("[SANDBOX] Workspace already exists or failed: %s\n", path);
    }
    
    strcpy(cwd_buffer, path);
}

void executor_run(Job* job) {
    printf("[EXECUTOR] Initializing Sandbox for Job %s\n", job->id);
    
    char sandbox_path[256];
    setup_sandbox(job->id, sandbox_path);

    // Change directory to sandbox (Logical isolation)
    #ifdef _WIN32
        // On Windows, we just print intent or use chdir if single threaded. 
        // For distinct processes, we'd pass CWD to CreateProcess.
        // For this demo with popen, we prepend "cd path &&"
        char cmd[1024];
        sprintf(cmd, "cd %s && %s", sandbox_path, job->command);
    #else
        char cmd[1024];
        sprintf(cmd, "cd %s && %s", sandbox_path, job->command);
    #endif

    printf("[EXECUTOR] Running Job Verified Command: %s\n", cmd);
    job->status = JOB_RUNNING;
    
    // Real Execution
    FILE *fp;
    char output_buffer[1035];

    // Open the command for reading
    fp = popen(cmd, "r");
    if (fp == NULL) {
        printf("[EXECUTOR] Failed to run command\n");
        job->status = JOB_FAILED;
        return;
    }

    // Read the output a line at a time
    while (fgets(output_buffer, sizeof(output_buffer), fp) != NULL) {
        printf("[JOB-OUTPUT] %s", output_buffer);
    }

    // close
    int status = pclose(fp);
    
    if (status == 0) {
        printf("[EXECUTOR] Job %s completed successfully.\n", job->id);
        job->status = JOB_COMPLETED;
    } else {
        printf("[EXECUTOR] Job %s failed with exit code %d.\n", job->id, status);
        job->status = JOB_FAILED;
    }
}
