# Distributed Rate Limiter Lab 🚀

A high-performance, distributed rate-limiting laboratory built to analyze and compare industry-standard algorithms. This project simulates a production-grade environment using **Nginx**, **Node.js**, and **Redis** to solve the "shared-state" problem in distributed systems.



## 📌 Project Overview

In a distributed architecture, local in-memory rate limiting is insufficient as users hit different server instances. This project implements a **Global Rate Limiter** where multiple application replicas synchronize their state via a central Redis store.

The lab includes a **Python-driven automated testing suite** that swaps algorithms, restarts the Docker cluster, and generates a comparative performance report using **k6** load testing.

### Algorithms Implemented
* **Fixed Window:** Simple, low-overhead counter.
* **Sliding Window Log:** Maximum precision using Redis Sorted Sets (`ZSET`).
* **Token Bucket:** Hybrid approach allowing for bursty traffic with steady refills.
* **Leaky Bucket:** Constant-flow "traffic shaper" that smooths out spikes.

---

## 🏗️ System Architecture

The infrastructure is fully containerized to replicate a real-world data center environment on a single machine.

* **Load Balancer:** Nginx (Round-robin distribution across app replicas).
* **Application Layer:** 3x Node.js instances running the rate-limiting middleware.
* **Central State:** Redis (Atomic state management via Lua scripting).
* **Stress Testing:** k6 (Go-based tool) simulating high-concurrency "bot attacks."
* **Orchestration:** Docker Compose.

---

## 🛠️ Getting Started

### Prerequisites
* Docker & Docker Compose
* Python 3.10+
* [k6](https://k6.io/docs/getting-started/installation/)

### Running the Experiment
1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/yourusername/distributed-rate-limiter.git](https://github.com/yourusername/distributed-rate-limiter.git)
    cd distributed-rate-limiter
    ```

2.  **Execute the Automated Lab:**
    The Python script will handle the container lifecycle and run tests for all algorithms:
    ```bash
    python3 lab.py
    ```

---

## 🧪 Experiments & Results

Each algorithm is tested against a **Burst Attack** (50 requests/sec with a limit of 10).



| Algorithm | Consistency | Memory | Latency | Key Characteristic |
| :--- | :--- | :--- | :--- | :--- |
| **Fixed Window** | Medium | Very Low | < 2ms | High throughput, boundary issues. |
| **Sliding Log** | Perfect | High | ~5ms | Extremely accurate; memory intensive. |
| **Token Bucket** | High | Low | ~3ms | Best for user experience (allows bursts). |
| **Leaky Bucket** | High | Medium | ~10ms | Best for protecting fragile backends. |

---

## 💡 Engineering Highlights

### 1. Atomic Lua Scripting
To prevent **Race Conditions** where two instances read/write to Redis simultaneously, all logic is encapsulated in **Lua scripts**. Redis executes these scripts atomically, ensuring that counters are updated correctly even under massive concurrency.

### 2. Distributed Synchronization
By using a central Redis instance, the rate limit remains consistent regardless of which server instance Nginx routes the request to. This demonstrates an understanding of **Distributed Coordination**.

### 3. Automated Observability
The `lab.py` script parses JSON summaries from k6, demonstrating a data-driven approach to performance engineering.

---

## 🚀 Future Roadmap
* **Sliding Window Counter:** Implement a memory-optimized version of the Sliding Log.
* **Failure Injection:** Test "Fail-Open" vs "Fail-Closed" logic by manually killing the Redis container.
* **Dashboarding:** Integrate Prometheus and Grafana for real-time visualization.

---