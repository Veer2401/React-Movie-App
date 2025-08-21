# 🎬 CinematicX - The React Movie App

A React-based movie and TV show discovery app powered by [TMDB
API](https://www.themoviedb.org/).\
Users can search movies/series, view trailers, see ratings, and filter
popular Hindi, Netflix, Prime, and Hotstar titles.\
Includes **Appwrite integration** to track search trends.

------------------------------------------------------------------------

## ✨ Features

-   🔍 **Smart Search with Suggestions** (auto-complete as you type)\
-   🎬 **Mixed Feed**: Popular Hindi movies + Netflix, Prime, Hotstar TV
    shows interleaved\
-   ⭐ **Movie Cards**: Show poster, ratings, language, year, type\
-   🎞️ **Flip Animation**: Card flips to reveal description and trailer
    link\
-   📺 **Provider Badges**: "Netflix" / "Prime" tag on shows\
-   ⏳ **Loading Spinner** (custom + fallback)\
-   📊 **Search Tracking** with Appwrite (stores search terms, counts,
    and poster)\
-   🎨 **Modern UI** with TailwindCSS + animations\
-   🌗 **Responsive Design**

------------------------------------------------------------------------

## 🛠 Tech Stack

-   **Frontend:** React (Vite)\
-   **Styling:** TailwindCSS + Custom CSS (`index.css`, `App.css`)\
-   **API:** TMDB (Movies + TV Shows)\
-   **Backend/DB:** Appwrite (for storing search history & counts)\
-   **Deployment:** Works with Vercel/Netlify

------------------------------------------------------------------------

## 🔑 Environment Variables

Create a `.env` file in the root with the following:

``` bash
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

------------------------------------------------------------------------

## 🚀 Installation & Setup

``` bash
# Clone repo
git clone https://github.com/Veer2401/React-Movie-App.git
cd React-Movie-App

# Install dependencies
npm install

# Setup environment variables (see above)

# Run locally
npm run dev
```

------------------------------------------------------------------------

## 🎮 Usage


-   Start typing in the search bar → Suggestions dropdown will appear\
-   Click a suggestion or press enter to fetch results\
-   Hover on a card to flip and see details/trailer\
-   Footer shows credits (Made by Veer, Powered by TMDB)

------------------------------------------------------------------------

## 📸 Screenshots / Demo

(Add screenshots or GIFs here for homepage, search, flip-card view)

------------------------------------------------------------------------

## 🤝 Contributing

-   Fork, create a branch, make your changes, and submit a PR

------------------------------------------------------------------------

## 🙏 Acknowledgements

-   [TMDB](https://www.themoviedb.org/) for free API\
-   [Appwrite](https://appwrite.io/) for backend DB\
-   [TailwindCSS](https://tailwindcss.com/)

------------------------------------------------------------------------



------------------------------------------------------------------------

### 👨‍💻 Author

Made with ❤️ by [Veer Harischandrakar](https://github.com/Veer2401)
