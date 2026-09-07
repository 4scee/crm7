const TYPE_META = {
  LLAMADA: { icon: '☎', label: 'Llamada', color: 'bg-ink-700' },
  CORREO: { icon: '✉', label: 'Correo', color: 'bg-amber-600' },
  NOTA: { icon: '✎', label: 'Nota', color: 'bg-sage-600' },
  REUNION: { icon: '◷', label: 'Reunión', color: 'bg-ink-500' },
};

const formatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

// Registro histórico cronológico de llamadas, correos, notas y reuniones
export default function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return <p className="text-sm text-ink-500 py-6 text-center">Aún no hay actividad registrada.</p>;
  }

  return (
    <ol className="relative border-l border-ink-950/10 ml-3">
      {activities.map((activity) => {
        const meta = TYPE_META[activity.type] ?? TYPE_META.NOTA;
        return (
          <li key={activity.id} className="mb-5 ml-5">
            <span
              className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full text-white text-xs ${meta.color}`}
            >
              {meta.icon}
            </span>
            <div className="card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink-950">{activity.subject}</p>
                <span className="text-[11px] text-ink-500 whitespace-nowrap">
                  {formatter.format(new Date(activity.occurredAt))}
                </span>
              </div>
              {activity.content && <p className="text-xs text-ink-700 mt-1">{activity.content}</p>}
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wide text-ink-500">
                {meta.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
