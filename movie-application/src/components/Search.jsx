import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const Search = ({ searchTerm, setSearchTerm }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Debounced suggestions for better performance
  useEffect(() => {
    if (searchTerm.length > 1) {
      const timeoutId = setTimeout(async () => {
        try {
          const movieRes = await fetch(`${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=1`, API_OPTIONS);
          const tvRes = await fetch(`${API_BASE_URL}/search/tv?query=${encodeURIComponent(searchTerm)}&page=1`, API_OPTIONS);
          
          if (!movieRes.ok || !tvRes.ok) {
            throw new Error('API request failed');
          }
          
          const movieData = await movieRes.json();
          const tvData = await tvRes.json();
          const allResults = [
            ...(movieData.results || []),
            ...(tvData.results || [])
          ];
          const unique = [];
          const seen = new Set();
          for (const item of allResults) {
            const title = item.title || item.name;
            if (title && !seen.has(title)) {
              unique.push(title);
              seen.add(title);
            }
          }
          // Sort: exact match first, then startsWith, then contains, then others
          const queryLower = searchTerm.toLowerCase();
          unique.sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            if (aLower === queryLower && bLower !== queryLower) return -1;
            if (aLower !== queryLower && bLower === queryLower) return 1;
            if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower)) return -1;
            if (!aLower.startsWith(queryLower) && bLower.startsWith(queryLower)) return 1;
            if (aLower.includes(queryLower) && !bLower.includes(queryLower)) return -1;
            if (!aLower.includes(queryLower) && bLower.includes(queryLower)) return 1;
            return 0;
          });
          setSuggestions(unique.slice(0, 6));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Suggestions API error:', error);
          setSuggestions(['Suggestions unavailable']);
        }
      }, 200); // 200ms debounce for suggestions

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search" ref={inputRef} style={{ position: 'relative' }}>
      <div>
        <img src="search.svg" alt="Search Icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Search movies, series..."
          className="cursor-pointer"
          autoComplete="off"
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestion-dropdown">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="suggestion-item"
              onClick={() => {
                setSearchTerm(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
