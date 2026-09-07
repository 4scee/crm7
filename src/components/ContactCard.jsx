// Componente reutilizable: tarjeta de contacto (usada en el perfil de cuenta y en el listado general)
export default function ContactCard({ contact, onEdit, onDelete }) {
  const initials = `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="h-10 w-10 shrink-0 rounded-full bg-ink-900 text-parchment-100 flex items-center justify-center font-display text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-ink-950 truncate">
            {contact.firstName} {contact.lastName}
          </p>
          {contact.isPrimary && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-600/10 text-amber-700">
              Principal
            </span>
          )}
        </div>
        <p className="text-xs text-ink-500 truncate">{contact.jobTitle || 'Puesto no especificado'}</p>
        {contact.account?.name && (
          <p className="text-xs text-ink-500 truncate">{contact.account.name}</p>
        )}
        <div className="mt-2 flex flex-col gap-0.5 text-xs text-ink-700">
          {contact.email && <span className="truncate">✉ {contact.email}</span>}
          {contact.phone && <span className="truncate">☎ {contact.phone}</span>}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex flex-col gap-1 text-xs">
          {onEdit && (
            <button className="text-ink-500 hover:text-amber-700" onClick={() => onEdit(contact)}>
              Editar
            </button>
          )}
          {onDelete && (
            <button className="text-ink-500 hover:text-rust-600" onClick={() => onDelete(contact)}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
