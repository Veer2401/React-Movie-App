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
  const { id, title, vote_average, poster_path, release_date, original_language, overview } = movie || {};

  const [isFlipped, setIsFlipped] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState('');

  useEffect(() => {
    let isCancelled = false;
    const fetchTrailer = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/movie/${id}/videos`, API_OPTIONS);
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
  }, [id]);

  const watchHref = trailerUrl || (id ? `https://www.themoviedb.org/movie/${id}` : '#');

  return (
    <li
      className={`movie-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div className="card-inner">
        <div className="card-front">
          {/* Front content */}
          <img src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'} alt={title} />
          <h3>{title}</h3>
        </div>
        <div className="card-back">
          {/* Back content */}
          <div className='mt-2 text-left'>
            <h3 className='mb-2'>{title}</h3>
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
              <p className='year'>{release_date ? release_date.split('-')[0] : 'N/A'}</p>
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
    </li>
  )
}

export default MovieCard
