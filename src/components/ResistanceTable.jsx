import React from 'react';
import { useSortableTable } from '../hooks/useSortableTable';
import { Flag } from './Flag';

const REL_COLORS = {
  casa: '#e2e8f0',
  amico: '#10b981',
  nemico: '#ef4444',
  'nemico del nemico': '#f59e0b',
  neutrale: '#64748b',
};

const RegionRow = ({ reg }) => (
  <tr className="res-row">
    <td><b>{reg.name}</b></td>
    <td className="res-manca">
      <span className="res-percent-bar">
        <span className="res-percent-fill" style={{ width: `${Math.min(100, Math.max(0, reg.percent))}%` }} />
        <span className="res-percent-text">{reg.percent}%</span>
      </span>
      {reg.manca > 0 && <span className="res-manca-pts">(-{reg.manca})</span>}
    </td>
    <td>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={reg.ownerCode} title={reg.owner} />
        <div>
          <span style={{ color: REL_COLORS[reg.ownerRel] || 'inherit' }}>{reg.owner}</span>
          <span className="res-rel-label">({reg.ownerRel})</span>
        </div>
      </div>
    </td>
    <td>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={reg.holderCode} title={reg.holder} />
        <div>
          <span style={{ color: REL_COLORS[reg.holderRel] || 'inherit' }}>{reg.holder}</span>
          <span className="res-rel-label">({reg.holderRel})</span>
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
