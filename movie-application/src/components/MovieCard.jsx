import React, { useEffect, useState } from 'react'
import { isProduction } from '../utils/env.js';

// API config - TMDB always uses HTTPS
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const MovieCard = ({ movie, isFlipped: isFlippedProp, onCardClick }) => {
  const { id, title, name, vote_average, poster_path, release_date, first_air_date, original_language, overview, media_type, isHindi, isNetflix, isPrime } = movie || {};

  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (typeof isFlippedProp === 'boolean') {
      setIsFlipped(isFlippedProp)
    }
  }, [isFlippedProp])
  const [trailerUrl, setTrailerUrl] = useState('');

  // Use title for movies, name for TV shows
  const displayTitle = title || name;
  // Use release_date for movies, first_air_date for TV shows
  const displayDate = release_date || first_air_date;

  useEffect(() => {
    let isCancelled = false;
    const fetchTrailer = async () => {
      if (!id || !media_type) return;
      try {
        const response = await fetch(`${API_BASE_URL}/${media_type}/${id}/videos`, API_OPTIONS);
        if (!response.ok) return;
        const data = await response.json();
        const trailer = (data.results || []).find(
          (v) => v.site === 'YouTube' && v.type === 'Trailer'
        ) || (data.results || []).find((v) => v.site === 'YouTube');
        if (!isCancelled && trailer && trailer.key) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
        }
      } catch (e) {
        // no-op; fallback link will be used
      }
    };
    fetchTrailer();
    return () => {
      isCancelled = true;
    };
  }, [id, media_type]);

  const watchHref = trailerUrl || (id ? `https://www.themoviedb.org/${media_type}/${id}` : '#');

  return (
    <li className={`movie-card flip-card${isFlipped ? ' flipped' : ''}`}>
      <div className="flip-inner">
        <div
          className="flip-front"
          onClick={(e) => { e.stopPropagation(); onCardClick && onCardClick(); }}
          style={{ cursor: 'pointer' }}
        >
          {/* Poster and other content */}
          {movie.isNetflix && <div className="netflix-badge">Netflix</div>}
          {movie.isPrime && <div className="prime-badge">Prime video</div>}
          <img 
            src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'} 
            alt={displayTitle || "No Title"} 
            onError={(e) => {
              e.target.src = '/no-movie.png';
              e.target.alt = 'Poster not available';
            }}
          />
          <h3>{displayTitle || "No Title"}</h3>
          <div className='content'>
            <div className='rating'>
              <img src="star.svg" alt="Star Icon" />
              <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <span>•</span>
            <p className='lang'>{original_language}</p>
            <span>•</span>
            <p className='year'>{displayDate ? displayDate.split('-')[0] : 'N/A'}</p>
            <span>•</span>
            <p className='media-type'>{media_type === 'tv' ? 'TV Series' : 'Movie'}</p>
          </div>
        </div>
        <div
          className="flip-back"
          onClick={(e) => { e.stopPropagation(); onCardClick && onCardClick(); }}
          style={{ cursor: 'pointer' }}
        >
          <div className={`movie-card ${isHindi ? 'hindi-movie' : ''}`}>
            <div className='mt-2 text-left'>
              <h3 className='mb-2'>{displayTitle}</h3>
              <p className='text-gray-100 text-sm line-clamp-[10]'>
                {overview || 'No description available.'}
              </p>
              <div className='content mt-4'>
                <div className='rating'>
                  <img src="star.svg" alt="Star Icon" />
                  <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
                </div>
                <span>•</span>
                <p className='lang'>{original_language}</p>
                <span>•</span>
                <p className='year'>{displayDate ? displayDate.split('-')[0] : 'N/A'}</p>
                <span>•</span>
                <p className='media-type'>{media_type === 'tv' ? 'TV Series' : 'Movie'}</p>
              </div>
              <a
                className='mt-4 inline-block bg-white text-black font-semibold px-4 py-2 rounded-md'
                href={watchHref}
                target='_blank'
                rel='noreferrer'
                onClick={(e) => e.stopPropagation()}
              >
                Watch trailer
              </a>

              {/* Watch on section - only for Netflix */}
              {isNetflix && (
                <div className='mt-4'>
                  <p className='text-gray-100 text-sm mb-2'>Watch on:</p>
                  <div className='flex gap-2'>
                    <a
                      href={`https://www.netflix.com/search?q=${encodeURIComponent(displayTitle)}`}
                      target='_blank'
                      rel='noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer'
                    >
                      Netflix
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default MovieCard
