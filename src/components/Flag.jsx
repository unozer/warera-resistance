import React from 'react';

export const Flag = ({ code, title, style, className }) => {
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt={code.toUpperCase()}
      title={title || code.toUpperCase()}
      loading="lazy"
      className={className}
      style={{ width: '20px', height: '14px', objectFit: 'cover', verticalAlign: 'middle', marginRight: '6px', borderRadius: '2px', ...style }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
};
