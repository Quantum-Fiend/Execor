package main

import (
	"log"
	"os"

	"github.com/hydra-x/control-plane/internal/server"
)

func main() {
	log.Println("[HYDRA-X] Control Plane Starting...")

	coreAddr := os.Getenv("CORE_ADDR")
	if coreAddr == "" {
		coreAddr = "localhost:5050"
	}

	if err := server.Start(9090, coreAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
