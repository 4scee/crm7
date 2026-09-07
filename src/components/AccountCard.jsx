import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  PROSPECTO: 'bg-ink-500/10 text-ink-700',
  ACTIVO: 'bg-sage-600/10 text-sage-700',
  INACTIVO: 'bg-rust-600/10 text-rust-700',
};

const STATUS_LABELS = {
  PROSPECTO: 'Prospecto',
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
};

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

// Componente reutilizable: tarjeta de cuenta (usado en listados y en búsquedas)
export default function AccountCard({ account }) {
  return (
    <Link to={`/cuentas/${account.id}`} className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-semibold text-ink-950">{account.name}</p>
          <p className="text-xs text-ink-500">{account.industry || 'Giro no especificado'}</p>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${STATUS_STYLES[account.status]}`}>
          {STATUS_LABELS[account.status]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-ink-700">
        <div>
          <p className="text-ink-500">Contactos</p>
          <p className="font-medium">{account._count?.contacts ?? 0}</p>
        </div>
        <div>
          <p className="text-ink-500">Oportunidades</p>
          <p className="font-medium">{account._count?.deals ?? 0}</p>
        </div>
      </div>
      <div className="pt-2 border-t border-ink-950/10 flex items-center justify-between">
        <span className="text-xs text-ink-500">Pipeline abierto</span>
        <span className="font-display font-semibold text-ink-950">{currency.format(account.totalPipeline || 0)}</span>
      </div>
    </Link>
  );
}
