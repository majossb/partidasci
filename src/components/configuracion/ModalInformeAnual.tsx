import { useState, useEffect } from 'react';
import { FileSpreadsheet, X, Loader2, CheckCircle2 } from 'lucide-react';
import { generarInformeAnual } from '@/utils/generarInformeAnual';

interface Props {
  onClose: () => void;
}

export default function ModalInformeAnual({ onClose }: Props) {
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [generando, setGenerando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleGenerar = async () => {
    setGenerando(true);
    setError(null);
    try {
      await generarInformeAnual(anio);
      setListo(true);
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setError('Error al generar el informe: ' + (err?.message || 'Intenta de nuevo.'));
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(43,35,32,0.50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '28px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 24px 64px rgba(74,20,40,0.22)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: '#EAF1F8', color: '#185FA5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#4A1428', margin: 0 }}>
                Informe Parroquial Anual
              </h2>
              <p style={{ fontSize: '12px', color: '#8A7F76', marginTop: '3px' }}>
                Exporta un Excel completo con todos los sacramentos del año
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7F76', padding: '4px', flexShrink: 0 }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de año */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: 700,
            color: '#8A7F76', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px',
          }}>
            Año del informe
          </label>
          <select
            value={anio}
            onChange={e => setAnio(Number(e.target.value))}
            disabled={generando || listo}
            style={{
              width: '100%', height: '44px', borderRadius: '10px',
              border: '1.5px solid #E9E1D6', background: '#FAF7F1',
              padding: '0 14px', fontSize: '16px', fontWeight: 600,
              color: '#2B2320', cursor: 'pointer', outline: 'none',
              appearance: 'auto',
            }}
          >
            {Array.from({ length: 10 }, (_, i) => anioActual - i).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Descripción del contenido */}
        <div style={{
          background: '#FAF7F1', borderRadius: '10px',
          padding: '14px 16px', marginBottom: '20px',
          borderLeft: '3px solid #6B1E2E',
        }}>
          <p style={{ fontSize: '12px', color: '#6B5E56', fontWeight: 600, marginBottom: '6px' }}>
            El informe incluye 6 hojas:
          </p>
          <ul style={{ fontSize: '12px', color: '#2B2320', paddingLeft: '16px', lineHeight: 1.9, margin: 0 }}>
            <li>Resumen estadístico con distribución mensual</li>
            <li>Tablas completas de Bautismos, Confirmaciones, Matrimonios y Defunciones</li>
            <li>Comparativo mensual con resaltado del sacramento más activo por mes</li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FBEBEE', border: '1px solid #F4C0C0',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '13px', color: '#B4485B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Éxito */}
        {listo && (
          <div style={{
            background: '#E8F5E9', border: '1px solid #A5D6A7',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <CheckCircle2 size={16} color="#2E7D32" />
            <p style={{ fontSize: '13px', color: '#2E7D32', margin: 0 }}>
              Informe generado y descargado correctamente.
            </p>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={generando}
            style={{
              flex: 1, height: '44px', borderRadius: '10px',
              border: '1.5px solid #E9E1D6', background: '#FFFFFF',
              fontSize: '14px', fontWeight: 600, color: '#2B2320',
              cursor: generando ? 'not-allowed' : 'pointer',
              opacity: generando ? 0.6 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerar}
            disabled={generando || listo}
            style={{
              flex: 2, height: '44px', borderRadius: '10px',
              border: 'none',
              background: listo ? '#2E7D32' : generando ? '#C0B8B0' : '#6B1E2E',
              color: '#FFFFFF', fontSize: '14px', fontWeight: 600,
              cursor: generando || listo ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            {generando
              ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Generando informe...</>
              : listo
              ? <><CheckCircle2 size={16} /> Descargado</>
              : '↓ Descargar informe Excel'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
