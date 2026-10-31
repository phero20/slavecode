# Redis Architecture & Data Flow

Redis serves as the central nervous system for Coding Arena. It acts as an ultra-fast cache, a state store for real-time multiplayer arenas, an event bus (Pub/Sub) for microservices, and a highly resilient job queue manager for background workers.

## Redis Key Structure & Usage

| Key Pattern / Prefix | Data Type | Owner Service | TTL / Expiry | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `arena:room:{roomId}` | JSON String | Arena (Go) & API | 24 Hours | Stores the entire JSON state of a multiplayer room (players, host, settings, match state). Updates are handled via Atomic Lua scripts in Go to prevent race conditions during concurrent updates. |
| `arena:user_room:{userId}` | String | Arena (Go) | 24 Hours | O(1) lookup to find which room a user is currently in. Automatically prevents users from joining multiple rooms at the same time. |
| `leaderboard:global` | Sorted Set (ZSET) | API (Hono) | Persistent | Stores all user scores and IDs for `O(log N)` global rank lookups and high-speed paginated range queries (`zrevrange`). |
| `user:meta:{userId}` | Hash | API (Hono) | 7 Days | Caches essential user metadata (username, avatarUrl, fullName, totalSolved) to enrich leaderboard listings in a single round-trip without touching PostgreSQL. |
| `resource:roadmaps:*`, `resource:roadmap:*`, `resource:categories`, `resource:topic:*` | JSON String | API (Hono) | 24 Hours | Caches full developer roadmaps, React Flow graph node definitions, topic details, and roadmap categories to serve `/resources` with sub-millisecond response times. |
| `projects:catalog:*`, `projects:roadmap:*`, `projects:detail:*`, `projects:categories`, `projects:popular:*` | JSON String | API (Hono) | 30m – 1 Hour | Caches paginated developer project directories, difficulty filter results, and project specs. Invalidated non-blockingly via `redis.scanStream` upon user submission or admin approval. |
| `resources:roadmap:*`, `resources:detail:*`, `resources:popular:*` | JSON String | API (Hono) | 30m – 1 Hour | Caches curated external learning resources, video playlists, and documentation links. Automatically refreshed on upvotes and moderation events. |
| `academy:solved:{userId}:*` | String | API (Hono) | Cleared on solve | Caches which academy tracks a user has solved to significantly speed up profile and track loading times. |
| `company:*` | JSON String | API (Hono) | 24 Hours | Caches aggregated company problems and tags to relieve database pressure. |
| `bull:submission-evaluation:*`| List / Hash | API Workers | Removed on complete | BullMQ queue for processing code executions. Configured with a Smart Backoff Strategy to handle Azure VM cold starts. |
| `bull:arena-cleanup:*` | List / Hash | API Workers | Removed on complete | BullMQ queue for sweeping dead/abandoned rooms asynchronously. |
| `bull:contest-sync:*` | List / Hash | API Workers | Removed on complete | BullMQ queue for periodically scraping Clist.by programming contests. |
| `llm:*`, `diagram:*` | JSON String | API (Hono) | 24h - 7 Days | Caches LLM AI responses and system diagram generations to dramatically reduce API costs and latency. |

<br/>

> [!TIP]
> **Lua Scripting in Arena**
> The Go Arena service uses embedded Lua scripts to update the `arena:room:*` keys. This guarantees atomicity. For example, when two users submit code at the exact same millisecond, Lua ensures both leaderboard scores are updated correctly without overwriting each other.

---

## Pub/Sub Channels (Cross-Service Communication)

The API service uses Redis Pub/Sub to trigger real-time events that the Arena Go service instantly broadcasts to users via WebSockets.

| Channel Pattern | Publisher | Subscriber | Purpose |
| :--- | :--- | :--- | :--- |
| `arena:events:{roomId}` | API (Hono) | Arena (Go) | General room updates (e.g., player joined, player left, host updated settings). |
| `arena:match:started:{roomId}`| API (Hono) | Arena (Go) | Signals to all players that the match has officially begun and the countdown should start. |
| `arena:submission:{roomId}` | API (Hono) | Arena (Go) | Broadcasts a player's real-time progress (e.g., passing 3/5 test cases) to update the live multiplayer leaderboard. |

<br/>

> [!NOTE]
> **Microservice Decoupling**
> By using Redis Pub/Sub, the Bun (Hono) API never has to know the IPs or locations of the Go WebSocket servers. It just shouts into Redis, and Go instantly forwards the message to the correct users.

---

## Architecture Diagram

```mermaid
graph TD
    %% Styling
    classDef api fill:#4ade80,stroke:#22c55e,stroke-width:2px,color:#000
    classDef arena fill:#60a5fa,stroke:#3b82f6,stroke-width:2px,color:#000
    classDef worker fill:#facc15,stroke:#eab308,stroke-width:2px,color:#000
    classDef queue fill:#f472b6,stroke:#db2777,stroke-width:2px,color:#000
    classDef cache fill:#a78bfa,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef pubsub fill:#fb923c,stroke:#ea580c,stroke-width:2px,color:#fff
    classDef state fill:#2dd4bf,stroke:#0d9488,stroke-width:2px,color:#000

    %% Nodes
    API[Bun Hono API Service]:::api
    Arena[Go Arena WebSockets]:::arena
    Worker[BullMQ Background Workers]:::worker
    
    %% Redis Cluster Container
    subgraph RedisCluster [Redis Environment]
        
        subgraph Caching [Key-Value Caches & Rankings]
            CacheLeaderboard[leaderboard:global<br/>ZSET + user:meta:*]:::cache
            CacheRes[resource:* / projects:* / resources:*<br/>Roadmaps & Projects Cache]:::cache
            CacheLLM[llm:* / diagram:*]:::cache
            CacheAc[academy:solved:*]:::cache
            CacheCo[company:*]:::cache
        end

        subgraph State [Arena State]
            RoomState[arena:room:*<br/>Lua Atomic JSON]:::state
            UserRoom[arena:user_room:*]:::state
        end

        subgraph Queues [BullMQ Job Queues]
            QSub[bull:submission-evaluation]:::queue
            QClean[bull:arena-cleanup]:::queue
            QSync[bull:contest-sync]:::queue
        end
        
        subgraph PubSub [Pub/Sub Channels]
            PSEvents((arena:events:*)):::pubsub
            PSMatch((arena:match:*)):::pubsub
            PSSubmit((arena:submission:*)):::pubsub
        end
    end

    %% Connections
    API -->|Reads/Writes Cache| Caching
    API -->|Pushes Async Jobs| Queues
    API -->|Publishes Events| PubSub
    
    Worker -->|Pulls Jobs| Queues
    Worker -->|Publishes Eval Updates| PubSub
    
    Arena -->|Subscribes & Broadcasts| PubSub
    Arena -->|Reads/Writes Lua Scripts| State
    
    API -->|Reads Lobby Data| State
```
