import React, { use, useEffect, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import { updateSearchCount } from './appwrite';
// React-Movie-App
// This is a React application that fetches and displays movies from The Movie Database (TMDB).
// It allows users to search for movies and view details about them.
// The application uses the TMDB API to fetch movie data.
// The API key is stored in a .env.local file and accessed using the VITE_TMDB_API_KEY environment variable.
// The application also uses Appwrite to update the search count for each movie searched.


// API - Application Programming Interface
// The API key is stored in the .env.local file
// We will use the VITE_TMDB_API_KEY environment variable to access the API key

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

// Helper function for robust fetch with retries
const robustFetch = async (url, options, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
      return data;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise(res => setTimeout(res, 500 * (attempt + 1))); // Exponential backoff
    }
  }
};

// Simple number-to-words map for 0-99 (expand as needed)
const numberWords = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
  20: 'twenty', 21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five', 26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight', 29: 'twenty-nine',
  30: 'thirty', 31: 'thirty-one'
  // ...add more if needed
};

function numbersToWords(str) {
  return str.replace(/\b\d+\b/g, (num) => {
    const n = parseInt(num, 10);
    return numberWords[n] || num;
  });
}

const fetchContent = async (query = '') => {
  setIsLoading(true);
  setErrorMessage('');
  try {
    // Convert numbers in query to words
    const queryWithWords = numbersToWords(query);

    // If query and queryWithWords are different, search with both
    const searchQueries = [query];
    if (queryWithWords !== query) searchQueries.push(queryWithWords);

    let allResults = [];
    for (const q of searchQueries) {
      if (q) {
        const isNetflixQuery = q.toLowerCase().includes('netflix');
        let netflixShows = [];
        if (isNetflixQuery) {
          const netflixData = await robustFetch(
            `${API_BASE_URL}/discover/tv?with_networks=213&sort_by=popularity.desc&page_size=20`,
            API_OPTIONS
          );
          netflixShows = (netflixData.results || []).map(item => ({
            ...item,
            media_type: 'tv',
            priority: 0,
            isNetflix: true
          }));
        }

        const [hindiData, regionalData, movieData, tvData] = await Promise.all([
          robustFetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(q)}&region=IN&with_origin_country=IN&page_size=20`, API_OPTIONS),
          robustFetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(q)}&with_origin_country=IN&page_size=20`, API_OPTIONS),
          robustFetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(q)}&page_size=20`, API_OPTIONS),
          robustFetch(`${API_BASE_URL}/search/tv?query=${encodeURIComponent(q)}&page_size=20`, API_OPTIONS)
        ]);

        const hindiMovies = (hindiData.results || []).map(item => ({
          ...item,
          media_type: 'movie',
          priority: 1,
          isHindi: true
        }));

        const regionalMovies = (regionalData.results || []).map(item => ({
          ...item,
          media_type: 'movie',
          priority: 2,
          isHindi: true
        }));

        const movies = (movieData.results || []).map(item => ({
          ...item,
          media_type: 'movie',
          priority: 3,
          isHindi: false
        }));

        const tvShows = (tvData.results || []).map(item => ({
          ...item,
          media_type: 'tv',
          priority: 4,
          isHindi: false
        }));

        allResults = [
          ...allResults,
          ...netflixShows,
          ...hindiMovies,
          ...regionalMovies,
          ...movies,
          ...tvShows
        ];
      }
    }

    // Remove duplicates
    const uniqueResults = allResults.filter((item, index, arr) =>
      arr.findIndex(x => x.id === item.id) === index
    );

    // Sort as before
    const queryLower = query.toLowerCase();
    const sortedResults = uniqueResults.sort((a, b) => {
      if ((a.isNetflix ? 0 : a.priority) !== (b.isNetflix ? 0 : b.priority)) {
        return (a.isNetflix ? 0 : a.priority) - (b.isNetflix ? 0 : b.priority);
      }
      const aTitle = (a.title || a.name || '').toLowerCase();
      const bTitle = (b.title || b.name || '').toLowerCase();
      const aExactMatch = aTitle === queryLower;
      const bExactMatch = bTitle === queryLower;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      const aContains = aTitle.includes(queryLower);
      const bContains = bTitle.includes(queryLower);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    const filteredResults = sortedResults.filter(item => item.original_language !== 'ko');
    setContentList(filteredResults);

    if (filteredResults.length > 0) {
      await updateSearchCount(query, filteredResults[0]);
    }
  } catch (error) {
    console.error(`Error fetching content: ${error}`);
    setErrorMessage('Failed to fetch content. Please try again later.');
  } finally {
    setIsLoading(false);
  }
}

function App() {
  
  const [searchTerm,setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [contentList, setContentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContent(searchTerm);
  }, [searchTerm]);

  return (
    <main className="fade-in-screen">

      {/* <div className="logo">
        <img src="./logo.png" alt="Logo" className="w-[400px] h-[400px]" />
      </div> */}

      <div className="pattern" />
      <div className='wrapper'>
          <header>
           <img src="./logo.png" alt="Hero-Banner" className="w-[400px] h-[270px]" />
            {/* <img
              src="./cinematicX.png"
              alt="Hero-Banner"
              className="w-[1000px] h-auto"
            /> */}
            <h1 className="main-heading">Your <span className='text-gradient'>movie  </span> dictionary 🎬</h1>
            <div className="center">
            <h1 className='content-center'>Type it. Find it.</h1>
            {/* <h1 className='content-center'>Watch it. Enjoy it.</h1>  */}
            </div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <br>
          </br>
          <h1 className='search-term'> <span className='text-gradient'>{searchTerm}</span></h1>
          </header>

          <section className='all-movies'>
  <h2 className='mt-[40px]'>Movies, TV Shows & More!</h2>
  
  {isLoading ? (
    <div className="flex justify-center items-center h-32">
      <span className="loader"></span>
    </div>
  ) : errorMessage ? (
    <p className='text-red-500'>{errorMessage}</p>
  ) : (
    <ul>
      {contentList.map((content) => (
        <MovieCard key={`${content.media_type}-${content.id}`} movie={content} />
      ))}
    </ul>
  )}
</section>

          
      </div>
    </main>
  )
}

export default App
