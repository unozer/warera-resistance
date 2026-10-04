import React from 'react';
import { useSortableTable } from '../hooks/useSortableTable';
import { Flag } from './Flag';

const getBadgeClass = (rel) => {
  if (rel === 'casa') return 'badge-casa';
  if (rel === 'amico') return 'badge-amico';
  if (rel === 'nemico') return 'badge-nemico';
  if (rel === 'nemico del nemico') return 'badge-nemico-del-nemico';
  return 'badge-neutrale';
};

const RegionRow = ({ reg }) => (
  <tr className="res-row">
    <td>
      <b>
        <a href={`https://play.warera.com/region/${reg.regionId}`} target="_blank" rel="noreferrer" className="external-link">
          {reg.name}
        </a>
      </b>
    </td>
    <td>
      <div className="res-manca">
        <span className="res-percent-bar">
          <span className="res-percent-fill" style={{ width: `${Math.min(100, Math.max(0, reg.percent))}%` }} />
          <span className="res-percent-text">{reg.percent}%</span>
        </span>
        {reg.manca > 0 && <span className="res-manca-pts">(-{reg.manca})</span>}
      </div>
    </td>
    <td>
      <div className="country-cell">
        <Flag code={reg.ownerCode} title={reg.owner} style={{ width: '24px', height: '18px', borderRadius: '3px' }} />
        <div className="country-info">
          <a href={`https://play.warera.com/country/${reg.ownerId}`} target="_blank" rel="noreferrer" className="country-name external-link">
            {reg.owner}
          </a>
          <span className={`badge ${getBadgeClass(reg.ownerRel)}`}>{reg.ownerRel}</span>
        </div>
      </div>
    </td>
    <td>
      <div className="country-cell">
        <Flag code={reg.holderCode} title={reg.holder} style={{ width: '24px', height: '18px', borderRadius: '3px' }} />
        <div className="country-info">
          <a href={`https://play.warera.com/country/${reg.holderId}`} target="_blank" rel="noreferrer" className="country-name external-link">
            {reg.holder}
          </a>
          <span className={`badge ${getBadgeClass(reg.holderRel)}`}>{reg.holderRel}</span>
        </div>
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
