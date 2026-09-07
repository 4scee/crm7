import { useState } from 'react';

const TYPES = [
  { key: 'NOTA', label: 'Nota' },
  { key: 'LLAMADA', label: 'Llamada' },
  { key: 'CORREO', label: 'Correo' },
  { key: 'REUNION', label: 'Reunión' },
];

// Componente reactivo para inserción rápida de notas/llamadas/correos/reuniones
export default function NoteQuickAdd({ onSubmit, isSubmitting }) {
  const [type, setType] = useState('NOTA');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!subject.trim()) return;
    onSubmit({ type, subject: subject.trim(), content: content.trim() || null });
    setSubject('');
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="flex gap-1.5 mb-3">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setType(t.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              type === t.key
                ? 'bg-ink-950 text-white border-ink-950'
                : 'border-ink-950/15 text-ink-700 hover:bg-parchment-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input
        className="input mb-2"
        placeholder="Asunto (ej. Seguimiento de propuesta)"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="input mb-3 resize-none"
        rows={2}
        placeholder="Detalle (opcional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit" className="btn-primary" disabled={isSubmitting || !subject.trim()}>
        {isSubmitting ? 'Guardando…' : 'Registrar actividad'}
      </button>
    </form>
  );
}
