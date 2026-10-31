# SlaveCode Architecture & Documentation

Welcome to the SlaveCode Architecture documentation. This directory contains a comprehensive suite of dynamically rendered Mermaid.js diagrams that accurately map out the physical codebase, infrastructure, and business logic of the entire platform.

Because these are built with Mermaid, they render natively in GitHub and markdown viewers, ensuring they remain version-controlled and easy to maintain.

---

## 🏗️ Structural Diagrams (The "What")
These diagrams explain how the code is physically structured, how modules are wired, where things are deployed, and the data schema.

- **[System Architecture](system_architecture.md)**
  High-level overview of how the Next.js Frontend, Node (Hono) API, Go WebSockets, Redis, and Databases all communicate across Problem Solving, Developer Roadmaps, Projects, Community Resources, and Arenas.
  
- **[Component Diagram](component_diagram.md)**
  Shows the internal wiring of the Node API (Controllers -> Services -> DB/Queue) across all domain engines including the Roadmaps, Projects & Resources subsystem.

- **[Deployment Diagram](deployment_diagram.md)**
  Maps out the physical infrastructure (Docker, Google VMs, Vercel, Neon Postgres, MongoDB Atlas, Aiven Valkey/Redis, New API Gateway).

- **[Database ERD](database_erd.md)**
  Massive, 100% accurate Entity-Relationship Diagram detailing the PostgreSQL schema (users, stats, social, polymorphic votes) and MongoDB Document structures (problems, academy, roadmaps, topics, projects, resources).

- **[Class Diagram](class_diagram.md)**
  Deep-dive Object-Oriented overview detailing all 80+ classes, controllers, services, repositories, models, and multi-tier caches across 8 domain boundaries.

---

## ⚡ Behavioral Diagrams (The "How")
These diagrams explain how data flows over time, the branching logic of background workers, and how state transitions occur.

- **[Sequence Diagram](sequence_diagram.md)**
  Step-by-step mapping of the asynchronous BullMQ code submission flow, real-time WebSocket connection sync, and the Community Resource Submission & Voting flow.

- **[Activity Diagram](activity_diagram.md)**
  Flowcharts documenting complex `if/else` logic, such as the Submission AI Audit Fallback mechanism, DSA Taxonomy locking logic, and Community Resource & Project submission and moderation.

- **[State Machine Diagram](state_machine_diagram.md)**
  Visualizes the exact lifecycle and statuses of a Code Submission (`PENDING` -> `ACCEPTED`), an Arena Multiplayer Match (`WAITING` -> `PLAYING` -> `FINISHED`), and Community Resource & Project moderation (`PENDING` -> `APPROVED` / `REJECTED` / `UPDATED` / `ARCHIVED`).

- **[Use Case Diagram](use_case_diagram.md)**
  Defines the exact permissions and platform capabilities split between unauthenticated Guests (exploring problems, roadmaps, projects) and authenticated Users (submitting code, upvoting, contributing resources).

---

## 🛠️ Tech Stack Overview
- **Frontend**: Next.js (App Router), React, TailwindCSS, Zustand, TanStack Query, React Flow, Monaco Editor
- **Core API Backend**: Node.js / Bun, Hono, Drizzle ORM, Mongoose, BullMQ
- **Real-Time Multiplayer**: Golang, Fiber WebSockets
- **Execution & AI Engine**: Judge0 (Dockerized), New API Gateway (High-performance LLM reverse proxy routing to Gemini, GPT, Groq, DeepSeek)
- **Databases**: PostgreSQL (Relational data, user profiles, polymorphic votes), MongoDB (Problems, academy, roadmaps, projects, resources), Redis / Valkey (Pub/Sub messaging & multi-tier caching)
