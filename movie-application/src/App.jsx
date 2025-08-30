import React, { useEffect, useRef, useState } from 'react'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import Filter from './components/Filter';
import DetailsDrawer from './components/DetailsDrawer';
// import SongCard from './components/SongCard';
import { updateSearchCount } from './appwrite';
import { isProduction } from './utils/env.js';

// API config - TMDB always uses HTTPS
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// TMDB watch provider ids
const PROVIDER = {
  NETFLIX: 8,
  PRIME: 9,
  HOTSTAR: 122, // Disney+ Hotstar (IN)
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [filteredMovieList, setFilteredMovieList] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [credits, setCredits] = useState(null)
  const [isCreditsLoading, setIsCreditsLoading] = useState(false)
  const [flippedItemKey, setFlippedItemKey] = useState(null)

  // Abort controller for in-flight search
  const searchAbortRef = useRef(null)

  // Enhanced in-memory cache for search results in this session
  const searchCacheRef = useRef(new Map())
  
  // Daily movie rotation with 80% Hindi, 20% English mix
  const getDailyMovieMix = async () => {
    try {
      const today = new Date().toDateString();
      const cacheKey = `daily_mix_${today}`;
      
      // Check if we already have today's mix in cache
      if (searchCacheRef.current.has(cacheKey)) {
        return searchCacheRef.current.get(cacheKey);
      }

      // Fetch Hindi movies (80% of total)
      const hindiResponse = await fetch(
        `${API_BASE_URL}/discover/movie?with_origin_country=IN&sort_by=popularity.desc&page=1&include_adult=false`, 
        { 
          method: 'GET', 
          headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` } 
        }
      );
      
      // Fetch English movies (20% of total)
      const englishResponse = await fetch(
        `${API_BASE_URL}/discover/movie?with_original_language=en&sort_by=popularity.desc&page=1&include_adult=false`, 
        { 
          method: 'GET', 
          headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` } 
        }
      );

      if (!hindiResponse.ok || !englishResponse.ok) {
        throw new Error('Failed to fetch daily movie mix');
      }

      const [hindiData, englishData] = await Promise.all([
        hindiResponse.json(),
        englishResponse.json()
      ]);

      // Create mix: 80% Hindi, 20% English (total 20 movies)
      const hindiMovies = (hindiData.results || []).slice(0, 16).map(m => ({ 
        ...m, 
        media_type: 'movie', 
        isHindi: true 
      }));
      
      const englishMovies = (englishData.results || []).slice(0, 4).map(m => ({ 
        ...m, 
        media_type: 'movie' 
      }));

      // Interleave for better mix
      const dailyMix = [];
      let hindiIndex = 0;
      let englishIndex = 0;
      
      for (let i = 0; i < 20; i++) {
        if (i % 5 === 0 && englishIndex < englishMovies.length) {
          // Every 5th movie is English (20%)
          dailyMix.push(englishMovies[englishIndex]);
          englishIndex++;
        } else if (hindiIndex < hindiMovies.length) {
          // Rest are Hindi (80%)
          dailyMix.push(hindiMovies[hindiIndex]);
          hindiIndex++;
        }
      }

      // Fast path: skip provider checks on initial load for speed
      searchCacheRef.current.set(cacheKey, dailyMix);
      return dailyMix;
    } catch (error) {
      console.error('Error fetching daily movie mix:', error);
      return [];
    }
  };

  // Pre-warm cache with popular searches
  useEffect(() => {
    const popularSearches = ['action', 'comedy', 'drama', 'horror', 'romance']
    popularSearches.forEach(term => {
      if (!searchCacheRef.current.has(term)) {
        // Pre-fetch popular searches in background
        fetch(`${API_BASE_URL}/search/movie?query=${term}&page=1`, { 
          method: 'GET', 
          headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` } 
        })
        .then(res => res.json())
        .then(data => {
          const movies = (data.results || []).slice(0, 10).map(m => ({ ...m, media_type: 'movie' }))
          searchCacheRef.current.set(term, movies)
        })
        .catch(() => {}) // Silent fail for pre-warming
      }
    })
  }, [])

  const markNetflixForTvItems = async (tvItems) => {
    const controller = new AbortController()
    const toCheck = tvItems.slice(0, 8)
    try {
      const marked = await Promise.all(
        toCheck.map(async (item) => {
          try {
            const res = await fetch(`${API_BASE_URL}/tv/${item.id}/watch/providers`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal })
            if (!res.ok) return item
            const data = await res.json()
            const providers = data?.results?.IN?.flatrate || data?.results?.IN?.ads || []
            const isNetflix = Array.isArray(providers) && providers.some((p) => p.provider_id === PROVIDER.NETFLIX)
            return { ...item, isNetflix }
          } catch {
            return item
          }
        })
      )
      return [...marked, ...tvItems.slice(8)]
    } catch {
      return tvItems
    }
  }

  const fetchMovies = async (query = '') => {
    // cancel previous
    if (searchAbortRef.current) {
      searchAbortRef.current.abort()
    }
    const controller = new AbortController()
    searchAbortRef.current = controller

    setIsLoading(true)
    setErrorMessage('')

    try {
      const normalizedKey = query.trim().toLowerCase()

      // Serve from cache if available (only for non-empty queries)
      if (normalizedKey && searchCacheRef.current.has(normalizedKey)) {
        setMovieList(searchCacheRef.current.get(normalizedKey))
        setIsLoading(false)
        return
      }

      if (!query) {
        // Default feed: Daily movie mix with 80% Hindi, 20% English
        // Show loading state immediately
        setMovieList([])
        
        try {
          const dailyMix = await getDailyMovieMix();
          
          if (controller.signal.aborted) return;
          
          if (dailyMix.length > 0) {
            setMovieList(dailyMix);
          } else {
            // Fallback to original logic if daily mix fails
            const [hindiRes, moviesRes, hotstarRes, primeRes, netflixRes] = await Promise.all([
              fetch(`${API_BASE_URL}/discover/movie?with_origin_country=IN&sort_by=popularity.desc&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
              fetch(`${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
              fetch(`${API_BASE_URL}/discover/tv?with_watch_providers=${PROVIDER.HOTSTAR}&watch_region=IN&sort_by=popularity.desc&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
              fetch(`${API_BASE_URL}/discover/tv?with_watch_providers=${PROVIDER.PRIME}&watch_region=IN&sort_by=popularity.desc&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
              fetch(`${API_BASE_URL}/discover/tv?with_watch_providers=${PROVIDER.NETFLIX}&watch_region=IN&sort_by=popularity.desc&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
            ])

            if (controller.signal.aborted) return

            if (!hindiRes.ok || !moviesRes.ok || !hotstarRes.ok || !primeRes.ok || !netflixRes.ok) {
              throw new Error('Failed to fetch default feed')
            }

            const [hindiData, moviesData, hotstarData, primeData, netflixData] = await Promise.all([
              hindiRes.json(), moviesRes.json(), hotstarRes.json(), primeRes.json(), netflixRes.json()
            ])

            const hindiMovies = (hindiData.results || []).map((m) => ({ ...m, media_type: 'movie', isHindi: true }))
            const movies = (moviesData.results || []).map((m) => ({ ...m, media_type: 'movie' }))
            const hotstarTv = (hotstarData.results || []).map((t) => ({ ...t, media_type: 'tv' }))
            const primeTv = (primeData.results || []).map((t) => ({ ...t, media_type: 'tv' }))
            const netflixTv = (netflixData.results || []).map((t) => ({ ...t, media_type: 'tv', isNetflix: true }))

            // Interleave to ensure a balanced mix at the top
            const buckets = [hindiMovies, netflixTv, movies, hotstarTv, primeTv]
            const interleaved = []
            let i = 0
            let added = 0
            const seen = new Set()
            while (added < 20) {
              let progressed = false
              for (const bucket of buckets) {
                const item = bucket[i]
                if (item) {
                  const key = `${item.media_type}-${item.id}`
                  if (!seen.has(key)) {
                    interleaved.push(item)
                    seen.add(key)
                    added++
                    if (added >= 20) break
                  }
                  progressed = true
                }
              }
              if (!progressed) break
              i++
            }

            setMovieList(interleaved)
          }
        } catch (error) {
          console.error('Error fetching daily mix:', error);
          // Fallback to empty list
          setMovieList([])
        }
        
        setIsLoading(false)
        return
      }
      

      // Search: movies + TV concurrently (fast); label Netflix in background
      const [movieRes, tvRes] = await Promise.all([
        fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
        fetch(`${API_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=1`, { method: 'GET', headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }, signal: controller.signal }),
      ])

      if (controller.signal.aborted) return
      if (!movieRes.ok || !tvRes.ok) {
        throw new Error('Failed to fetch search results')
      }

      const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()])
      const movies = (movieData.results || []).map((m) => ({ ...m, media_type: 'movie' }))
      const tvShows = (tvData.results || []).map((t) => ({ ...t, media_type: 'tv' }))

      // Show first 10 results immediately for faster perceived performance
      const immediateResults = [...movies.slice(0, 6), ...tvShows.slice(0, 4)]
      setMovieList(immediateResults)
      setIsLoading(false) // Stop loading early

      // Check Netflix availability for all search results
      const allResults = [...tvShows, ...movies];
      const resultsWithNetflix = await Promise.all(
        allResults.map(async (item) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/${item.media_type}/${item.id}/watch/providers`, 
              { 
                method: 'GET', 
                headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` } 
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const providers = data?.results?.IN?.flatrate || data?.results?.IN?.ads || [];
              const isNetflix = Array.isArray(providers) && providers.some((p) => p.provider_id === PROVIDER.NETFLIX);
              return { ...item, isNetflix };
            }
            return item;
          } catch (error) {
            return item;
          }
        })
      );

      // Then show full results
      const quickBuckets = [resultsWithNetflix.slice(0, 6), resultsWithNetflix.slice(6, 16), resultsWithNetflix.slice(16, 22)]
      const mixed = []
      let j = 0
      const seenMix = new Set()
      while (mixed.length < 20) {
        let progressed = false
        for (const bucket of quickBuckets) {
          const item = bucket[j]
          if (item) {
            const key = `${item.media_type}-${item.id}`
            if (!seenMix.has(key)) {
              mixed.push(item)
              seenMix.add(key)
              if (mixed.length >= 20) break
            }
            progressed = true
          }
        }
        if (!progressed) break
        j++
      }

      setMovieList(mixed.length ? mixed : resultsWithNetflix)

      // Cache the results for this query for faster subsequent loads
      if (normalizedKey) {
        searchCacheRef.current.set(normalizedKey, mixed.length ? mixed : resultsWithNetflix)
      }

      if (query && (mixed.length ? mixed : [...tvShows, ...movies]).length > 0) {
        try {
          await updateSearchCount(query, (mixed.length ? mixed : [...tvShows, ...movies])[0]);
        } catch (error) {
          console.error('Appwrite API error:', error);
          // Not critical for UX
        }
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      console.error(`Error fetching movies:, ${error}`)
      setErrorMessage('Failed to fetch movies')
    } finally {
      if (!searchAbortRef.current?.signal.aborted) setIsLoading(false)
    }
  }

  const openDetails = async (item) => {
    if (!item?.id) return
    setSelectedItem(item)
    setIsDrawerOpen(true)
    setIsCreditsLoading(true)
    setCredits(null)
    try {
      const res = await fetch(`${API_BASE_URL}/${item.media_type}/${item.id}/credits`, {
        method: 'GET',
        headers: { accept: 'application/json', Authorization: `Bearer ${API_KEY}` }
      })
      if (!res.ok) throw new Error('Failed to fetch credits')
      const data = await res.json()
      setCredits(data)
    } catch (e) {
      console.error('Error fetching credits:', e)
      setCredits({ cast: [], crew: [] })
    } finally {
      setIsCreditsLoading(false)
    }
  }

  const closeDetails = () => {
    setIsDrawerOpen(false)
    // keep selected to allow exit animation; clear later if needed
  }

  const handleCardClick = (item) => {
    if (!item) return
    const key = `${item.media_type || 'movie'}-${item.id}`
    if (flippedItemKey === key) {
      setFlippedItemKey(null)
      closeDetails()
    } else {
      setFlippedItemKey(key)
      openDetails(item)
    }
  }

  // Click outside to reset flipped card and close drawer
  useEffect(() => {
    const handleGlobalClick = () => {
      if (flippedItemKey) setFlippedItemKey(null)
      if (isDrawerOpen) closeDetails()
    }
    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [flippedItemKey, isDrawerOpen])

  // Filter movies based on selected languages
  useEffect(() => {
    if (selectedLanguages.length === 0) {
      setFilteredMovieList(movieList);
    } else {
      const filtered = movieList.filter(movie => {
        const movieLanguage = movie.original_language?.toLowerCase();
        
        // Check if movie language matches any selected language
        return selectedLanguages.some(selectedLang => {
          if (selectedLang === 'other') {
            // For "other languages", include languages not in the main list
            const mainLanguages = ['en', 'hi', 'mr', 'ko', 'zh'];
            return !mainLanguages.includes(movieLanguage);
          }
          return movieLanguage === selectedLang;
        });
      });
      setFilteredMovieList(filtered);
    }
  }, [movieList, selectedLanguages]);

  // Check for date change and refresh daily mix
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toDateString();
      const lastCheck = localStorage.getItem('lastDailyMixDate');
      
      if (lastCheck !== today) {
        // Date changed, clear daily mix cache and refresh
        localStorage.setItem('lastDailyMixDate', today);
        
        // Clear daily mix from cache
        const cacheKeys = Array.from(searchCacheRef.current.keys());
        cacheKeys.forEach(key => {
          if (key.startsWith('daily_mix_')) {
            searchCacheRef.current.delete(key);
          }
        });
        
        // Refresh movies if no search term
        if (!searchTerm) {
          fetchMovies('');
        }
      }
    };

    // Check on mount and set up interval
    checkDateChange();
    const interval = setInterval(checkDateChange, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [searchTerm]);

  // Debounce search for better performance (300ms delay)
  useEffect(() => {
    const id = setTimeout(() => {
      fetchMovies(searchTerm)
    }, 300)
    return () => clearTimeout(id)
  }, [searchTerm])

  return (
    <main>
      {/* <div className="top-logo">
        <img src="./cinematicX.png" alt="CinematicX" className="top-logo-image" />
      </div> */}
      <div className="pattern" />
      <div className='wrapper fade-in'>
        <header>
          <img 
            src="./cinematic.png" 
            alt="Hero-Banner" 
            className="w-[400px] h-[200px] cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => window.location.reload()}
            title="Click to refresh page"
          />
          <br />
          {/* <h1>Cinematic<span className='text-gradient'>X</span></h1> */}
          <h1>Your <span className="text-gradient">Content </span> Dictionary 🎬</h1>
          <div className="center">
            <h1 className='content-center'>Type it. Find it.</h1>
          </div>
          <div className="search-filter-container">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <Filter selectedLanguages={selectedLanguages} setSelectedLanguages={setSelectedLanguages} />
          </div>
          <br />
          <h1 className='search-term'> <span className='text-gradient'>{searchTerm}</span></h1>
        </header>

        <section className='all-movies'>
          <h2 className='mt-[40px]'>Movies, TV Shows & More!</h2>

          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="text-center mt-4 text-gray-300">Searching for "{searchTerm}"...</p>
            </div>
          ) : errorMessage ? (
            <div className="error-container">
              <p className='text-red-500 mb-4'>{errorMessage}</p>
              <button 
                onClick={() => fetchMovies(searchTerm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md  transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredMovieList.length === 0 && (searchTerm || selectedLanguages.length > 0) ? (
            <div className="no-results">
              <p className='text-gray-300 text-center text-lg'>
                {searchTerm ? `No results found for "${searchTerm}"` : 'No movies found'}
                {selectedLanguages.length > 0 && ` in selected languages`}
              </p>
              <p className='text-gray-500 text-center mt-2'>
                {searchTerm ? 'Try searching with different keywords' : 'Try adjusting your language filters'}
              </p>
            </div>
          ) : (
            <ul>
              {filteredMovieList.map((item) => {
                const key = `${item.media_type || 'movie'}-${item.id}`
                return (
                  <MovieCard
                    key={key}
                    movie={item}
                    isFlipped={flippedItemKey === key}
                    onCardClick={() => handleCardClick(item)}
                  />
                )
              })}
            </ul>
          )}
        </section>
        <DetailsDrawer
          isOpen={isDrawerOpen}
          onClose={closeDetails}
          item={selectedItem}
          credits={credits}
          isLoading={isCreditsLoading}
        />
        <div className="footer">
          <h2>Made with ❤️ by <a href="https://github.com/Veer2401" target="_blank" rel="noopener noreferrer">Veer </a></h2>
          <p>Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a></p>
          <p>Source code on <a href="https://github.com/Veer2401/React-Movie-App" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          {/* <p>Copyright © 2025 Veer Harischandrakar</p> */}
        </div>
      </div>
    </main>
  )
}

export default App
