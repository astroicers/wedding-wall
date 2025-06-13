# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `npm run dev` - Starts Nuxt 3 development server
- **Build**: `npm run build` - Builds the application for production
- **Preview**: `npm run preview` - Preview production build locally
- **Generate**: `npm run generate` - Generate static site
- **Docker full stack**: `docker-compose up --build` - Starts entire application with MinIO

## Architecture Overview

This is a Nuxt 3 wedding photo wall application using MinIO for object storage, Pinia for state management, and Element Plus for UI components.

### Technology Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Element Plus
- **State Management**: Pinia with persistence (localStorage/sessionStorage)
- **Storage**: MinIO S3-compatible object storage
- **File Processing**: Formidable for server-side uploads, JSZip for bulk downloads
- **Image Display**: vue3-photo-preview for lightbox functionality

### Pinia State Architecture

The application uses 5 main Pinia stores for centralized state management:

- **Background Store** (`stores/background.ts`): Manages wall background images with cache-busting
- **Messages Store** (`stores/messages.ts`): Handles blessing messages and metadata
- **Auth Store** (`stores/auth.ts`): User authentication with session management
- **Upload Store** (`stores/upload.ts`): File upload state and history tracking
- **UI Store** (`stores/ui.ts`): Global UI state, notifications, and device detection

### Critical Cache Management

The Background Store implements sophisticated cache-busting to solve Chromium browser caching issues:
- `cachedBackgroundUrl` getter automatically appends unique timestamps
- `cacheVersion` increments on every state change
- Manual DOM image cache clearing for complete refresh

### MinIO Storage Architecture

Two separate buckets handle different data types:
- **`wedding-wall`**: Main bucket for uploaded photos and message metadata
- **`wedding-background`**: Dedicated bucket for wall background images

### Data Flow

1. Users upload photos + messages via homepage forms
2. Files stored as `{timestamp}-{filename}` in MinIO with metadata JSON
3. Background images stored as `background-{timestamp}.{ext}` in separate bucket
4. Wall page fetches data via Pinia stores with automatic caching
5. Images served through `/api/image/[name]` with proper cache headers

### API Structure

Key server endpoints in `/server/api/`:
- `messages.get.ts`: Fetches all blessing messages with image path normalization
- `wall-background.ts`: Handles background CRUD with conflict prevention
- `upload.post.ts`: Processes photo uploads with metadata generation
- `image/[name].ts`: Streams images from MinIO with cache optimization

### Docker Deployment

Complete containerized setup via `docker-compose.yml`:
- MinIO service on ports 9000 (API) and 9001 (Console)
- Nuxt application service on port 3000
- Persistent volume for MinIO data
- Environment-based configuration for container networking

### Environment Configuration

Container environment variables for MinIO integration:
- `MINIO_ENDPOINT`: Service endpoint (localhost for dev, minio for containers)
- `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY`: Authentication credentials
- `MINIO_BUCKET_NAME`: Primary bucket identifier

### Browser Cache Resolution

Implemented multi-layer cache-busting for Chromium browsers:
1. Server-level: No-cache headers on background API endpoints
2. URL-level: Unique timestamps in MinIO presigned URLs
3. State-level: Pinia cache versioning system
4. DOM-level: Manual image element cache clearing