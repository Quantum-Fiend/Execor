#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include "hydra.h"

#ifdef _WIN32
#include <winsock2.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#endif

void* connection_handler(void* socket_desc) {
    int new_socket = *(int*)socket_desc;
    free(socket_desc);

    char buffer[1024] = {0};
    int valread = recv(new_socket, buffer, 1024, 0);
    if (valread > 0) {
        printf("[IPC-Thread] Received job: %s\n", buffer);
        
        // In a real system we would access the shared scheduler here
        // For this demo, we can just execute immediately in this thread
        // to show concurrency
        Job* job = (Job*)malloc(sizeof(Job));
        strcpy(job->id, "worker-job");
        strcpy(job->command, buffer);
        executor_run(job);
        free(job);
    }

    #ifdef _WIN32
    closesocket(new_socket);
    #else
    close(new_socket);
    #endif
    return NULL;
}

void ipc_start_server(int port, Scheduler* sched) {
    #ifdef _WIN32
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2,2), &wsa) != 0) {
        printf("[IPC] Failed to initialize Winsock.\n");
        return;
    }
    #endif

    int server_fd, new_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("[IPC] Socket failed");
        return;
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("[IPC] Bind failed");
        return;
    }

    if (listen(server_fd, 10) < 0) {
        perror("[IPC] Listen failed");
        return;
    }

    printf("[IPC] Multi-threaded Server listening on port %d\n", port);

    while (1) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen)) < 0) {
            perror("[IPC] Accept failed");
            continue;
        }

        pthread_t thread_id;
        int *pclient = malloc(sizeof(int));
        *pclient = new_socket;
        
        if (pthread_create(&thread_id, NULL, connection_handler, (void*)pclient) < 0) {
            perror("[IPC] Could not create thread");
            free(pclient);
            continue;
        }
        
        pthread_detach(thread_id); // Don't wait for it to join
    }
}
