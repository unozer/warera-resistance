import React from 'react';
import { useSortableTable } from '../hooks/useSortableTable';
import { Flag } from './Flag';

const getBadgeClass = (rel) => {
  if (rel === 'casa') return 'badge-casa';
  if (rel === 'alleato') return 'badge-alleato';
  if (rel === 'nemico') return 'badge-nemico';
  if (rel === 'nemico comune') return 'badge-nemico-comune';
  return 'badge-neutrale';
};

const RegionRow = ({ reg }) => (
  <tr className="res-row">
    <td>
      <b>
        <a href={`https://app.warera.io/region/${reg.regionId}`} target="_blank" rel="noreferrer" className="external-link">
          {reg.name}
        </a>
      </b>
    </td>
    <td>
      <div className="res-manca">
        <span className="res-percent-bar">
          <span className="res-percent-fill" style={{ width: `${Math.min(100, Math.max(0, reg.percent))}%` }} />
          <span className="res-percent-text">{reg.percent}%</span>
          {reg.manca > 0 && <span className="res-manca-pts-inside">-{reg.manca}</span>}
        </span>
      </div>
    </td>
    <td>
      <div className="country-cell">
        <div className="country-name-row">
          <Flag code={reg.ownerCode} title={reg.owner} style={{ width: '18px', height: '13.5px', borderRadius: '2px', marginRight: '6px' }} />
          <a href={`https://app.warera.io/country/${reg.ownerId}`} target="_blank" rel="noreferrer" className="country-name external-link">
            {reg.owner}
          </a>
        </div>
        <span className={`badge ${getBadgeClass(reg.ownerRel)}`}>{reg.ownerRel}</span>
      </div>
    </td>
    <td>
      <div className="country-cell">
        <div className="country-name-row">
          <Flag code={reg.holderCode} title={reg.holder} style={{ width: '18px', height: '13.5px', borderRadius: '2px', marginRight: '6px' }} />
          <a href={`https://app.warera.io/country/${reg.holderId}`} target="_blank" rel="noreferrer" className="country-name external-link">
            {reg.holder}
          </a>
        </div>
        <span className={`badge ${getBadgeClass(reg.holderRel)}`}>{reg.holderRel}</span>
      </div>
    </td>
  </tr>
);

export function ResistanceTable({ data }) {
  const { items, requestSort, getSortIndicator } = useSortableTable(data);

  if (items.length === 0) {
    return (
      <div className="state-message empty" style={{ marginTop: '2rem' }}>
        Nessuna regione utile trovata al momento.
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ marginTop: '2rem' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
              Regione{getSortIndicator('name')}
            </th>
            <th onClick={() => requestSort('manca')} style={{ cursor: 'pointer' }}>
              Resistenza{getSortIndicator('manca')}
            </th>
            <th onClick={() => requestSort('owner')} style={{ cursor: 'pointer' }}>
              Proprietario{getSortIndicator('owner')}
            </th>
            <th onClick={() => requestSort('holder')} style={{ cursor: 'pointer' }}>
              Invasore{getSortIndicator('holder')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(reg => <RegionRow key={reg.regionId} reg={reg} />)}
        </tbody>
      </table>
    </div>
  );
}
