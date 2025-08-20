import React, { useEffect, useState } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const MovieCard = ({ movie }) => {
  const { id, title, name, vote_average, poster_path, release_date, first_air_date, original_language, overview, media_type, isHindi } = movie || {};

  const [isFlipped, setIsFlipped] = useState(false);
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
    <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped((prev) => !prev)}>
      <div className='flip-inner'>
        <div className='flip-front'>
          <div className={`movie-card ${isHindi ? 'hindi-movie' : ''}`}>
            <img src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'} alt={displayTitle} />
            <div className='mt-4'>
              <h3>{displayTitle}</h3>
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
          </div>
        </div>

        <div className='flip-back'>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
