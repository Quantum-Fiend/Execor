<div align="center">
  <img src="docs/assets/banner.png" alt="HYDRA-X Banner" width="100%" />

  # HYDRA-X
  ### Advanced Distributed Orchestration Engine
  
  [![Go](https://img.shields.io/badge/Backend-Go_1.21-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
  [![C](https://img.shields.io/badge/Core-C_17-A8B9CC?style=for-the-badge&logo=c&logoColor=white)](https://en.cppreference.com/)
  [![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

  <p align="center">
    <b>Fault-Tolerant</b> • <b>High-Performance</b> • <b>Observable</b> • <b>Extensible</b>
  </p>
</div>

---

## 🚀 Overview

**HYDRA-X** is a next-generation distributed compute engine designed to bridge the gap between high-level orchestration and low-level execution. It provides a unified control plane for managing distributed workloads with millisecond-level latency, leveraging a hybrid architecture of **Go** for orchestration and **C** for raw execution power.

> *"Hydra-X is not just a tool; it's the nervous system for your distributed workloads."*

---

## 📸 Dashboard

<div align="center">
  <img src="docs/assets/dashboard.png" alt="HYDRA-X Dashboard" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(0,0,0,0.5);" />
  <p><i>Real-time "Dark Void" Observation Deck with Live Execution Feed and Diagnostics</i></p>
</div>

---

## 🏗️ Architecture

HYDRA-X employs a **Hybrid Tripartite Architecture** to maximize both developer productivity and execution efficiency.

```mermaid
graph TD
    subgraph "Control Plane (Go)"
        API[API Gateway] -->|Auth & Validation| Manager[Job Manager]
        Manager -->|State Sync| Store[(In-Memory Store)]
        Manager -->|Health Check| Reaper[Failure Reaper]
    end

    subgraph "Execution Layer (C)"
        Plugin[C Core Engine] -->|ABI Call| Shell[OS Shell]
        Shell -->|Stdout/Stderr| Plugin
    end

    subgraph "Presentation (React)"
        UI[Dashboard] -->|REST / SSE| API
    end

    Manager <-->|CGO Bindings| Plugin
```

### Key Components

| Component | Tech Stack | Responsibility |
|-----------|------------|----------------|
| **Control Plane** | Go (Golang) | Job scheduling, state management, API gateway, and fault tolerance (Heartbeat/Reaper). |
| **Core Engine** | C / C++ | Low-level process isolation, resource sandboxing, and direct OS verification. |
| **Dashboard** | React, Framer Motion | Real-time visualization, manual intervention, and cluster observability. |

---

## 📂 Folder Structure

The project follows a "Monorepo" pattern for seamless integration.

```text
hydra-x/
├── control-plane/          # 🧠 The Brain (Go)
│   ├── cmd/server/         # Entry point
│   ├── internal/server/    # Core logic (Reaper, Registry, API)
│   └── api/v1/             # OpenAPI Specifications
├── core-engine/            # 💪 The Muscle (C)
│   ├── src/                # Implementation of the execution runtime
│   └── include/            # Shared headers & ABI definitions
├── dashboard/              # 👁️ The Eyes (React + Vite)
│   ├── src/                # Frontend source code
│   └── public/             # Static assets
├── docs/                   # 📚 Documentation & Assets
├── sdk/                    # 🐍 Python SDK for job submission
└── scripts/                # ⚙️ Build & DevOps automations
```

---

## ⚡ n8n Workflow Integration

HYDRA-X is designed to be the "Active Core" of a larger automation mesh. It integrates natively with **n8n** for event-driven workflows.

**Typical Workflow:**

1.  **Ingest**: An **n8n Webhook** receives a payload (e.g., "New User Signup").
2.  **Process**: n8n formats the data and makes a secure **POST** request to Hydra-X:
    ```json
    POST /api/v1/submit
    {
      "type": "DATA_PIPELINE",
      "command": "./process_user_data.sh --id=123"
    }
    ```
3.  **Execute**: Hydra-X runs the heavy compute task via the C-Core.
4.  **Notify**: Upon completion, Hydra-X triggers a callback webhook to n8n to send a Slack notification or update a database.

> *Note: By offloading heavy compute to Hydra-X, your n8n workflows remain lightweight and non-blocking.*

---

## 🛠️ Getting Started

### Prerequisites
*   **Go** 1.21+
*   **Node.js** 18+
*   **GCC/Clang** (for C Core compilation)
*   *Optional:* Docker

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/hydra-x.git
    cd hydra-x
    ```

2.  **One-Click Build (Windows)**
    Run the automated build script to compile the backend and install frontend dependencies.
    ```powershell
    .\build_system.bat
    ```

3.  **Manual Start**
    *   **Backend**: `cd control-plane && go run ./cmd/server/main.go`
    *   **Frontend**: `cd dashboard && npm run dev`

### Access
Open your browser to `http://localhost:5173` to access the command center.

---

## 🔒 Security

*   **Token Authentication**: All API endpoints are protected via `Authorization: Bearer` tokens.
*   **Isolation**: The C-Core provides logical separation for executing processes, preventing runtime crashes from affecting the control plane.

---

<div align="center">
  <sub>Built with ❤️ by Tushar</sub>
</div>
