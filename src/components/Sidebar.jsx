import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Panel', icon: '◆' },
  { to: '/cuentas', label: 'Cuentas', icon: '▣' },
  { to: '/contactos', label: 'Contactos', icon: '◈' },
  { to: '/oportunidades', label: 'Oportunidades', icon: '◫' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-ink-950 text-parchment-100 flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-display text-xl font-semibold tracking-tight">NexusCRM</p>
        <p className="text-xs text-parchment-100/50 mt-0.5">Relaciones y pipeline comercial</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'text-parchment-100/70 hover:bg-white/5 hover:text-parchment-100'
              }`
            }
          >
            <span className="text-base leading-none">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-xs text-parchment-100/40">
        Sprint 4 · v1.0.0
      </div>
    </aside>
  );
}
