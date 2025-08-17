import React, { use, useEffect, useState } from 'react'
import Search from './components/Search'

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

  const fetchMovies = async () => {

    setIsLoading(true);
    setErrorMessage('');
    try{
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

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
    } catch(error) {
      console.error(`Error fetching movies:, ${error}`);
      setErrorMessage('Failed to fetch movies');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <main>

      <div className="pattern" />
      <div className='wrapper'>
          <header>
            <img src="./hero.png" alt="Hero-Banner" className="w-[800px] h-auto" />
            <br></br>
            <h1>Find your <span className="text-gradient">favourite </span>movies !</h1>
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
                  <p key={movie.id} className='text-white'>{movie.title}</p>
                ))}
              </ul>
            )}
          
          </section>

          
      </div>
    </main>
  )
}

export default App
