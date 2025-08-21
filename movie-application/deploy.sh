#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the movie-application directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Ready for Vercel deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. Deploy to Vercel:"
    echo "   - Go to vercel.com"
    echo "   - Import your GitHub repository"
    echo "   - Set Root Directory to: movie-application"
    echo "   - Add your environment variables"
    echo ""
    echo "3. Or use Vercel CLI:"
    echo "   npm i -g vercel"
    echo "   vercel"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
