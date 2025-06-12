# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `npm run dev` - Starts Nuxt 3 development server
- **Build**: `npm run build` - Builds the application for production
- **Preview**: `npm run preview` - Preview production build locally
- **Generate**: `npm run generate` - Generate static site

## Architecture Overview

This is a Nuxt 3 wedding photo wall application that uses MinIO for object storage and Element Plus for UI components.

### Key Components

- **Server API**: Handles file uploads and metadata storage in `/server/api/`
- **MinIO Integration**: Images and metadata stored in MinIO bucket `wedding-wall`
- **Real-time Wall**: Auto-rotating message display on `/wall` page
- **Photo Gallery**: Browsable gallery with vue3-photo-preview lightbox

### Data Flow

1. Users upload photos + messages via `/upload` page
2. Files stored as `wedding-wall/{timestamp}-{filename}.jpg` in MinIO
3. Metadata stored as JSON files in `wedding-wall/metadata/{timestamp}-{uuid}.json`
4. Wall page (`/wall`) fetches metadata and rotates messages every 3 seconds
5. Gallery page (`/gallery`) displays all photos with lightbox functionality

### Storage Structure

- Images: Direct file uploads to MinIO root
- Metadata: JSON files in `metadata/` subfolder containing `{name, text, photo}` objects
- Image serving: Dynamic route `/api/image/[name]` streams from MinIO

## MinIO Setup

For local development, run MinIO in Docker:

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -v $(pwd)/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

Create a `wedding-wall` bucket via MinIO Console at <http://localhost:9001>

## Key Composables

- `useMessages.ts`: Fetches and manages message metadata with error handling
- `useAuth.ts`: Simple authentication state management
- `useMinio.ts`: Client-side MinIO utilities for file validation and preview
- `useApi.ts`: Centralized API request handling with error management

## Recent Optimizations

- **Code Reusability**: Eliminated duplicate API calls and error handling
- **File Validation**: Client-side file type and size validation before upload
- **Error Handling**: Unified error messages using Element Plus notifications
- **User Experience**: Added loading states, file previews, and better feedback
- **Security**: Path traversal protection and file type restrictions
- **Performance**: Image caching and optimized error recovery