# Votes Routes

All routes are mounted under `/api/v1/votes` in [api/src/routes/votes/vote.routes.ts](../../../api/src/routes/votes/vote.routes.ts).

## API Endpoints

### 1. Toggle Vote
- **Method**: `POST`
- **Path**: `/api/v1/votes/:targetType/:targetId`
- **Auth Required**: Yes (`requireAuth: true`)
- **Controller Action**: `voteController.toggleVote`
- **Path Parameters**:
  - `targetType`: `'project' | 'solution' | 'roadmap' | 'resource'`
  - `targetId`: Target UUID, MongoDB ObjectId, or unique slug
- **Request Body**:
  ```json
  {
    "voteType": 1
  }
  ```
  *(1 for upvote / like, -1 for downvote)*
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "userVote": 1,
      "upvotes": 42,
      "downvotes": 3,
      "targetType": "project",
      "targetId": "fullstack-kanban-board"
    }
  }
  ```

---

### 2. Get Vote Stats & User Vote Status
- **Method**: `GET`
- **Path**: `/api/v1/votes/:targetType/:targetId`
- **Auth Required**: No (Soft auth: reads optional user credentials if present)
- **Controller Action**: `voteController.getVoteStats`
- **Path Parameters**:
  - `targetType`: Target discriminator
  - `targetId`: Target identifier
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "userVote": 0,
      "upvotes": 42,
      "downvotes": 3
    }
  }
  ```

