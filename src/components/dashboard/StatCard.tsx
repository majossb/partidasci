import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  link: string;
  colorHex: string;
  iconBgClass: string;
  sparklinePoints?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function StatCard({ title, count, icon, link, colorHex, sparklinePoints }: StatCardProps) {
  return (
    <Link
      to={link}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px -8px rgba(15,23,42,0.08)',
        padding: '22px 22px 18px 22px',
        borderTop: `3.5px solid ${colorHex}`,
        borderLeft: '1px solid #E2E8F0',
        borderRight: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(15,23,42,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px -8px rgba(15,23,42,0.08)';
      }}
    >
      {/* Header: label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          color: '#64748B',
          margin: 0,
        }}>
          {title}
        </p>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: hexToRgba(colorHex, 0.12),
          color: colorHex,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Number */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '36px',
        fontWeight: 700,
        color: '#0F172A',
        marginTop: '12px',
        lineHeight: 1.1,
      }}>
        {count.toLocaleString('es-CO')}
      </div>

      {/* Sparkline */}
      {sparklinePoints && (
        <div style={{ marginTop: '10px', marginBottom: '6px' }}>
          <svg width="100%" height="28" viewBox="0 0 220 28" preserveAspectRatio="none">
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke={colorHex}
              strokeWidth="2.5"
              opacity={0.65}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Footer link */}
      <div style={{
        display: 'flex',
        justify: 'flex-end',
        marginTop: '8px',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: colorHex,
        }}>
          Ver registros →
        </span>
      </div>
    </Link>
  );
}
