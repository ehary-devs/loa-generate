import React, { useMemo } from 'react';
import { T } from '../../utils/theme';

function qrModules(seed, size = 25) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      row.push(((h >>> 3) & 3) !== 0);
    }
    cells.push(row);
  }
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[oy + y][ox + x] = edge || core;
      }
    }
    for (let y = -1; y <= 7; y++) {
      for (let x = -1; x <= 7; x++) {
        const cy = oy + y, cx = ox + x;
        if (cy < 0 || cx < 0 || cy >= size || cx >= size) continue;
        if (x === -1 || y === -1 || x === 7 || y === 7) cells[cy][cx] = false;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return cells;
}

export function QrCode({ value, px = 96 }) {
  const size = 25;
  const cells = useMemo(() => qrModules(value || "kosong", size), [value]);
  
  return (
    <svg width={px} height={px} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`QR ${value}`}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={T.ink} /> : null
        )
      )}
    </svg>
  );
}
