# Environment Setup & HTTPS Configuration

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# TMDB API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Appwrite Configuration
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=your_appwrite_collection_id

# Appwrite Endpoint
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
```

## HTTPS Enforcement

### Development Mode
- **HTTP allowed**: You can use `http://localhost:8080/v1` for local Appwrite
- **HTTPS recommended**: But not required for local development
- **TMDB API**: Always uses HTTPS (`https://api.themoviedb.org/3`)

### Production Mode
- **HTTPS required**: All endpoints must use HTTPS
- **Automatic fallback**: If HTTP endpoint is provided, falls back to `https://cloud.appwrite.io/v1`
- **Console warnings**: Logs warnings when non-HTTPS endpoints are used

## Local Development with Self-Hosted Appwrite

If you're running Appwrite locally:

```bash
# .env.local
VITE_APPWRITE_ENDPOINT=http://localhost:8080/v1
```

This will work in development but will automatically use HTTPS in production.

## Production Deployment

Ensure your `.env.local` or environment variables use HTTPS:

```bash
VITE_APPWRITE_ENDPOINT=https://your-domain.com/v1
```

## HTTP to HTTPS Redirect

The app automatically redirects HTTP to HTTPS in production (excluding localhost and 127.0.0.1).
