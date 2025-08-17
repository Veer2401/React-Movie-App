# React-Movie-App
A deployable movie app built with React.js and Tailwind css to understand the basic fundamentals of React js and to learn react while creating the project

# ✨ Features

🔎 Search movies with debounced input and instant results

🔥 Trending/Popular feeds on the homepage

🗂️ Filter/Sort by rating, popularity, or release year (example presets)

📄 Movie Details page: poster, overview, genres, runtime, rating, trailers

📱 Responsive UI with Tailwind (mobile → desktop)

🧭 Client-side routing (e.g., /, /movie/:id, /search)

🧼 Loading & empty states (skeletons/placeholders)

♻️ Reusable UI building blocks (cards, grids, buttons, inputs)

🧩 Hooks & utilities for fetching, formatting, and state


# 🧰 Tech Stack

React 19 (functional components, hooks)

Vite (fast dev/build)

Tailwind CSS (utility-first styling)

React Router (routing)

Fetch/Axios (API calls)

TMDB API (movie data)

# 🚀 Quick Start
1) Prerequisites

Node.js 18+ and npm (or pnpm/yarn)

A free TMDB API key (v3) or Read Access Token (v4)
👉 Create it in your TMDB account and keep it secret. 
The Movie Database (TMDB)

2) Clone & Install
# if you already have the repo:
git clone <your-repo-url> react-movie-app
cd react-movie-app

# OR create from scratch with Vite:
npm create vite@latest react-movie-app -- --template react
cd react-movie-app

# install deps
npm install

3) Configure Environment Variables

Create a .env file in the project root:

# Use either the v3 key or v4 token (don’t commit this file!)
VITE_TMDB_API_KEY=YOUR_TMDB_V3_API_KEY
# or, alternatively:
VITE_TMDB_READ_ACCESS_TOKEN=YOUR_TMDB_V4_READ_TOKEN


The app can use VITE_TMDB_API_KEY as a query param (v3) or send a Bearer header with VITE_TMDB_READ_ACCESS_TOKEN (v4). See TMDB docs for full details. 
The Movie Database (TMDB)

4) Run Dev Server
npm run dev


Open the printed local URL (usually http://localhost:5173).

5) Build & Preview
npm run build
npm run preview

# 🗂️ Project Structure (suggested)

<img width="769" height="432" alt="Screenshot 2025-08-17 at 9 45 59 AM" src="https://github.com/user-attachments/assets/c3555356-0a08-4b56-8cb4-dea9d22db249" />




🧱 Core Concepts Implemented
Routing 🧭

/ — Home: Trending/Popular grids

/search?q=… — Search results

/movie/:id — Movie details (overview, cast, trailer)

Data Fetching 🔌

GET /search/movie for queries

GET /movie/{id} for details

GET /trending/movie/day or discover/movie for feeds

Images use https://image.tmdb.org/t/p/{size}{poster_path} (e.g., w500)

You can fetch /configuration to pull available sizes or use known presets. 
The Movie Database (TMDB)
+2
The Movie Database (TMDB)
+2

UI/UX 🎨

Tailwind utilities for layout, spacing, and dark mode

Skeletons while loading; empty state for no results

Accessible images (alt text) and semantic roles

🔐 TMDB API Setup Notes

API v3 (key in query):
https://api.themoviedb.org/3/search/movie?query=batman&api_key=YOUR_KEY 
The Movie Database (TMDB)

API v4 (Bearer token):
Send Authorization: Bearer YOUR_READ_ACCESS_TOKEN header.

Image URLs:
https://image.tmdb.org/t/p/w500/{poster_path} (or size of your choice). 
The Movie Database (TMDB)

Tip: If you need cast/crew (e.g., director), use append_to_response=credits on the details call. 
Reddit

🛠️ Example API Client (service)
// src/services/tmdb.ts
const API = 'https://api.themoviedb.org/3';
const KEY = import.meta.env.VITE_TMDB_API_KEY;
const TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;

const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

export async function searchMovies(query: string, page = 1) {
  const url = TOKEN
    ? `${API}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
    : `${API}/search/movie?query=${encodeURIComponent(query)}&page=${page}&api_key=${KEY}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('Failed to fetch movies');
  return res.json();
}

🧪 Scripts

dev — start Vite dev server

build — production build

preview — preview production build locally

lint (optional) — run ESLint/TS checks

📸 Screenshots

Add your screenshots here (after you run the app):

/public/screenshots/home.png
/public/screenshots/details.png

![Home](public/screenshots/home.png)
![Details](public/screenshots/details.png)



