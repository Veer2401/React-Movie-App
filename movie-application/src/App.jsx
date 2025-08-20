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
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = async (query = '') => {

    setIsLoading(true);
    setErrorMessage('');
    try{
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Unknown error occurred');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }

    } catch(error) {
      console.error(`Error fetching movies:, ${error}`);
      setErrorMessage('Failed to fetch movies');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies(searchTerm);
  }, [searchTerm]);

  return (
    <main>

      {/* <div className="logo">
        <img src="./logo.png" alt="Logo" className="w-[400px] h-[400px]" />
      </div> */}

      <div className="pattern" />
      <div className='wrapper'>
          <header>
           {/* <img src="./logo.png" alt="Hero-Banner" className="w-[400px] h-[300px]" /> */}
            <img src="./hero.png" alt="Hero-Banner" className="w-[800px] h-auto" />
            <br></br>
            <h1>Cinematic<span className='text-gradient'>X</span></h1>
            <h1>Your <span className="text-gradient">movie </span> dictionary 🎬</h1>
            <div className="center">
            <h1 className='content-center'>Type it. Find it. And enjoy </h1>
            {/* <h1 className='content-center'>Watch it. Enjoy it.</h1>  */}
            </div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <br>
          </br>
          <h1 className='search-term'> <span className='text-gradient'>{searchTerm}</span></h1>
          </header>

          <section className='all-movies'>
            <h2 className='mt-[40px]'>All Movies</h2>
            
            {isLoading ? (
              <p className='text-white'>Loading...</p>
            ) : errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          
          </section>

          
      </div>
    </main>
  )
}

export default App
