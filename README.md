# 🎬 CinematicX - The React Movie Library

Hey there 👋 I’m **Veer**, and this is my Movie Explorer app!  
I built this while learning React 19 to get hands-on practice with components, hooks, routing, and API integration.  

The idea was simple → **search for movies, check details, explore trending titles**… but I wanted it to feel modern and clean, so I styled everything with Tailwind CSS.  

---

## ✨ What this app does
- 🔎 Search for movies using TMDB API  
- 📄 View details like overview, genres, runtime, and ratings  
- 🔥 See trending & popular movies on the homepage  
- 🧭 Navigate between pages with React Router  
- 📱 Fully responsive (works on mobile too)  
- 🧼 Smooth UX with loading states & empty states
- 🍿 Shows information about the movie and trailers

---

## 🛠️ Tech Stack I Used
- ⚛️ **React 19** (with hooks & components)  
- ⚡ **Vite** (super fast dev server)  
- 🎨 **Tailwind CSS** (styling made easy)  
- 🌐 **TMDB API** (movie data source)  
- 🧭 **React Router** (routing between pages)  

---

## 🚀 How to Run This App

1. **Clone the repo**  
   ```bash
   git clone <your-repo-url> movie-explorer
   cd movie-explorer
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root and add your TMDB API key:  
   ```bash
   VITE_TMDB_API_KEY=your_api_key_here
   ```

   👉 You can grab a free key from [The Movie Database](https://www.themoviedb.org/documentation/api).

4. **Start the dev server**  
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` and start exploring movies 🎉  

---

## 🗂️ My Project Structure
```
src/
  ├─ components/    # Reusable UI (cards, buttons, rating stars, etc.)
  ├─ pages/         # Routes (Home, Search, MovieDetails)
  ├─ services/      # API calls (TMDB client)
  ├─ hooks/         # Custom hooks (like useDebounce)
  ├─ utils/         # Helpers for formatting dates, runtime, images
  ├─ App.jsx        # Root app
  └─ main.jsx       # Entry point
```

---

## 📸 Screenshots (Coming Soon)
*(I’ll add real screenshots here later)*  

---

## 🌟 What I Learned
Building this project taught me a bunch of cool stuff:
- How to structure a React app with components & pages  
- Using **React Router** for navigation  
- Fetching data from an external API (and handling errors)  
- Creating **loading & empty states** for a polished UX  
- Styling fast & clean with Tailwind  

---

## 🛠️ Future Plans
- ⭐ Add favorites/watchlist (save in localStorage)  
- 👥 Show cast & crew for each movie  
- 🎞️ Embed trailers directly in the details page  
- 🔄 Add infinite scroll for search results  

---

## 🙌 Thanks
Big thanks to **TMDB** for providing the movie API 🙏  
And also, shoutout to the tutorial that inspired me to make this—but I customized the flow and README in my own way.  

---

## 📜 License
This project is free to use. Do whatever you want with it.  

---

👉 So yeah, that’s my little movie app. Hope you like it! 🎥🍿  
