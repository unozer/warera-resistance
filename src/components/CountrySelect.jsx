import React, { useState, useRef, useEffect } from 'react';
import { Flag } from './Flag';
import './CountrySelect.css';

export function CountrySelect({ countries, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCountry = countries.find(c => c._id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`country-select-container ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      <div 
        className="country-select-trigger" 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedCountry ? (
          <div className="country-select-value">
            <Flag code={selectedCountry.code} title={selectedCountry.name} />
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="country-select-placeholder">Scegli una nazione...</span>
        )}
        <span className="country-select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="country-select-dropdown">
          <div className="country-select-search-wrapper">
            <input 
              ref={searchInputRef}
              type="text" 
              className="country-select-search" 
              placeholder="Cerca nazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="country-select-options">
            {filteredCountries.length === 0 ? (
              <div className="country-select-no-results">Nessun risultato</div>
            ) : (
              filteredCountries.map(c => (
                <div 
                  key={c._id} 
                  className={`country-select-option ${c._id === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(c._id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <Flag code={c.code} title={c.name} />
                  <span>{c.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
