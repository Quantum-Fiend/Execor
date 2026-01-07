cmake_minimum_required(VERSION 3.10)
project(HydraXCore C)

set(CMAKE_C_STANDARD 11)

include_directories(include)

# Source files
set(SOURCES
    src/main.c
    src/scheduler.c
    src/executor.c
    src/ipc.c
)

# Output executable
add_executable(hydra_core ${SOURCES})

# Windows specific (Winsock)
if(WIN32)
    target_link_libraries(hydra_core ws2_32)
endif()
