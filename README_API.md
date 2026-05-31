Siberta Backend API
===================

This document summarizes the primary API endpoints defined in `openapi.yaml`.

Key endpoints:

- `POST /api/auth/login` - obtain JWT
- `GET /api/auth/me` - current user
- `POST /api/submissions` - create / submit a TA title (student)
- `POST /api/submissions/{id}/simulate` - call ML service for SBERT similarity
- `POST /api/submissions/{id}/upload` - upload supporting file
- `POST /api/submissions/{id}/reviews` - dosen review (decision & comment)
- `POST /api/admin/validate/{submissionId}` - department syncs approved submission into official TA data

See `openapi.yaml` for full request/response contract and schemas.

Security: APIs use `Authorization: Bearer <token>` (JWT). Implement role-based middleware (mahasiswa/dosen/admin/departemen).
