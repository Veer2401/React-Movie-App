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


const App = () => {
  
  const [searchTerm,setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [contentList, setContentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');
    try{
      if (query) {
        // Enhanced search with Hindi movies as top priority
        const [hindiMovieResponse, regionalMovieResponse, movieResponse, tvResponse] = await Promise.all([
          // First priority: Hindi movies with exact title match
          fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&region=IN&with_origin_country=IN&page_size=20`, API_OPTIONS),
          // Second priority: Regional Indian movies
          fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&with_origin_country=IN&page_size=20`, API_OPTIONS),
          // Third priority: General movie search
          fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page_size=20`, API_OPTIONS),
          // Fourth priority: TV shows
          fetch(`${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page_size=20`, API_OPTIONS)
        ]);

        const [hindiData, regionalData, movieData, tvData] = await Promise.all([
          hindiMovieResponse.json(),
          regionalMovieResponse.json(),
          movieResponse.json(),
          tvResponse.json()
        ]);

        // Process and prioritize Hindi content
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
        
        // Combine all results and remove duplicates
        const allResults = [...hindiMovies, ...regionalMovies, ...movies, ...tvShows];
        const uniqueResults = allResults.filter((item, index, arr) => 
          arr.findIndex(x => x.id === item.id) === index
        );
        
        // Smart sorting: prioritize Hindi content, then relevance, then popularity
        const sortedResults = uniqueResults.sort((a, b) => {
          // First: Priority level (Hindi movies first)
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          
          // Second: Exact title match gets higher priority
          const queryLower = query.toLowerCase();
          const aTitle = (a.title || a.name || '').toLowerCase();
          const bTitle = (b.title || b.name || '').toLowerCase();
          
          const aExactMatch = aTitle === queryLower;
          const bExactMatch = bTitle === queryLower;
          
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
          
          // Third: Starts with query gets higher priority
          const aStartsWith = aTitle.startsWith(queryLower);
          const bStartsWith = bTitle.startsWith(queryLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Fourth: Contains query
          const aContains = aTitle.includes(queryLower);
          const bContains = bTitle.includes(queryLower);
          
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;
          
          // Finally: Sort by popularity
          return (b.popularity || 0) - (a.popularity || 0);
        });

        setContentList(sortedResults);

        if (sortedResults.length > 0) {
          await updateSearchCount(query, sortedResults[0]);
        }
      } else {
        // Default: show popular movies and TV shows with enhanced Indian content
        const [movieResponse, tvResponse, indianMovieResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page_size=20`, API_OPTIONS),
          fetch(`${API_BASE_URL}/discover/tv?sort_by=popularity.desc&page_size=20`, API_OPTIONS),
          // Get popular Indian movies
          fetch(`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&with_origin_country=IN&page_size=20`, API_OPTIONS)
        ]);

        const [movieData, tvData, indianData] = await Promise.all([
          movieResponse.json(),
          tvResponse.json(),
          indianMovieResponse.json()
        ]);

        const movies = (movieData.results || []).map(item => ({ ...item, media_type: 'movie' }));
        const tvShows = (tvData.results || []).map(item => ({ ...item, media_type: 'tv' }));
        const indianMovies = (indianData.results || []).map(item => ({ ...item, media_type: 'movie', isRegional: true }));
        
        // Combine and sort by popularity, prioritizing Indian content
        const combinedResults = [...indianMovies, ...movies, ...tvShows]
          .filter((item, index, arr) => arr.findIndex(x => x.id === item.id) === index) // Remove duplicates
          .sort((a, b) => {
            // Prioritize Indian content
            if (a.isRegional && !b.isRegional) return -1;
            if (!a.isRegional && b.isRegional) return 1;
            // Then sort by popularity
            return (b.popularity || 0) - (a.popularity || 0);
          });

        setContentList(combinedResults);
      }

    } catch(error) {
      console.error(`Error fetching content: ${error}`);
      setErrorMessage('Failed to fetch content');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchContent(searchTerm);
  }, [searchTerm]);

  return (
    <main>

      {/* <div className="logo">
        <img src="./logo.png" alt="Logo" className="w-[400px] h-[400px]" />
      </div> */}

      <div className="pattern" />
      <div className='wrapper'>
          <header>
           <img src="./logo.png" alt="Hero-Banner" className="w-[400px] h-[400px]" />
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
            <h2 className='mt-[40px]'>Movies, TV Shows & Bollywood</h2>
            
            {isLoading ? (
              <p className='text-white'>Loading...</p>
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
