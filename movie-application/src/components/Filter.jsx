import React, { useState, useRef, useEffect } from 'react';

const Filter = ({ selectedLanguages, setSelectedLanguages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'other', name: 'Other Languages' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (languageCode) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageCode)) {
        return prev.filter(lang => lang !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedLanguages([]);
  };

  return (
    <div className="filter-container" ref={filterRef}>
      <button
        className="filter-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Filter by language"
      >
        <svg 
          className="filter-icon" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" 
          />
        </svg>
        {selectedLanguages.length > 0 && (
          <span className="filter-badge">{selectedLanguages.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h3>Filter by Language</h3>
            {selectedLanguages.length > 0 && (
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="filter-options">
            {languages.map((language) => (
              <label key={language.code} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(language.code)}
                  onChange={() => toggleLanguage(language.code)}
                />
                <span className="checkmark"></span>
                <span className="language-name">{language.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
