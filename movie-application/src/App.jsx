import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import { updateSearchCount } from './appwrite';

// API config
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
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      if (!query) {
        // Fetch popular Hindi movies and general popular movies
        const [hindiRes, generalRes] = await Promise.all([
          fetch(`${API_BASE_URL}/discover/movie?with_origin_country=IN&sort_by=popularity.desc`, API_OPTIONS),
          fetch(`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`, API_OPTIONS),
        ])

        if (!hindiRes.ok || !generalRes.ok) {
          throw new Error('Failed to fetch movies')
        }

        const [hindiData, generalData] = await Promise.all([
          hindiRes.json(),
          generalRes.json(),
        ])

        const hindiMovies = (hindiData.results || [])
        const generalMovies = (generalData.results || [])

        // Merge with Hindi first, then general, removing duplicates by id
        const merged = [...hindiMovies, ...generalMovies]
        const seen = new Set()
        const unique = []
        for (const m of merged) {
          if (!seen.has(m.id)) {
            seen.add(m.id)
            unique.push(m)
          }
        }

        setMovieList(unique.slice(0, 20))
        return
      }

      const endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      const response = await fetch(endpoint, API_OPTIONS)
      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Unknown error occurred')
        setMovieList([])
        return
      }

      setMovieList(data.results || [])

      if (query && (data.results || []).length > 0) {
        await updateSearchCount(query, data.results[0])
      }
    } catch (error) {
      console.error(`Error fetching movies:, ${error}`)
      setErrorMessage('Failed to fetch movies')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies(searchTerm)
  }, [searchTerm])

  return (
    <main>
      <div className="pattern" />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero-Banner" className="w-[800px] h-auto" />
          <br />
          <h1>Cinematic<span className='text-gradient'>X</span></h1>
          <h1>Your <span className="text-gradient">movie </span> dictionary 🎬</h1>
          <div className="center">
            <h1 className='content-center'>Type it. Find it.</h1>
          </div>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <br />
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
