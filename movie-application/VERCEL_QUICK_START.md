# 🚀 Vercel Deployment - Quick Start

## ⚡ Fast Track (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click "New Project"
3. Import your GitHub repo
4. **Important**: Set Root Directory to `movie-application`
5. Click "Deploy"

### 3. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
VITE_TMDB_API_KEY=your_tmdb_key
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_db_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

### 4. Redeploy
After adding env vars, go to Deployments → Redeploy

## 🎯 Your App Will Be Live At:
`https://your-project-name.vercel.app`

## ✅ What's Already Configured:
- ✅ `vercel.json` for optimal performance
- ✅ Build scripts in `package.json`
- ✅ Proper `.gitignore`
- ✅ Deployment script (`./deploy.sh`)

## 🆘 Need Help?
- Run `./deploy.sh` for guided deployment
- Check `DEPLOYMENT.md` for detailed instructions
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
