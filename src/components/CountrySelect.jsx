import React, { useState, useRef, useEffect } from 'react';
import { Flag } from './Flag';
import './CountrySelect.css';

export function CountrySelect({ countries, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedCountry = countries.find(c => c._id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          {countries.map(c => (
            <div 
              key={c._id} 
              className={`country-select-option ${c._id === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(c._id);
                setIsOpen(false);
              }}
            >
              <Flag code={c.code} title={c.name} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
