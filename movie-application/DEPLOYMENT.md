# Deploying to Vercel

## Prerequisites
1. Make sure you have a GitHub account
2. Your project should be pushed to a GitHub repository
3. You need your TMDB API key and Appwrite credentials

## Step 1: Prepare Your Repository
1. Push your code to GitHub if you haven't already:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Vite
   - **Root Directory**: `movie-application` (since your React app is in this subfolder)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Navigate to your project directory:
   ```bash
   cd movie-application
   ```
3. Deploy:
   ```bash
   vercel
   ```

## Step 3: Configure Environment Variables
In your Vercel project dashboard, go to Settings → Environment Variables and add:

### Required Variables:
- `VITE_TMDB_API_KEY`: Your TMDB API key
- `VITE_APPWRITE_ENDPOINT`: Your Appwrite endpoint (e.g., https://cloud.appwrite.io/v1)
- `VITE_APPWRITE_PROJECT_ID`: Your Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID`: Your Appwrite database ID
- `VITE_APPWRITE_COLLECTION_ID`: Your Appwrite collection ID

## Step 4: Build and Deploy
1. Vercel will automatically build your project
2. If the build succeeds, your app will be deployed
3. You'll get a URL like: `https://your-project-name.vercel.app`

## Step 5: Custom Domain (Optional)
1. In your Vercel project dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

## Troubleshooting

### Build Errors
- Make sure all dependencies are in `package.json`
- Check that your TMDB API key is valid
- Verify Appwrite credentials are correct

### Environment Variables
- All environment variables must start with `VITE_` to be accessible in the browser
- Make sure to redeploy after adding environment variables

### CORS Issues
- Vercel automatically handles CORS for your domain
- If you're still having issues, check your API endpoints

## Post-Deployment
1. Test your app thoroughly
2. Check that search functionality works
3. Verify that movie cards display correctly
4. Test the flip functionality and trailer links

## Performance Tips
- Your app already has the `vercel.json` configuration for optimal performance
- Static assets are cached for 1 year
- Client-side routing is properly configured

## Monitoring
- Vercel provides built-in analytics and performance monitoring
- Check your project dashboard for deployment status and logs
