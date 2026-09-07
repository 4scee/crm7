import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { search } from '../api/client';

// Módulo de filtros avanzados de búsqueda en tiempo real (cuentas, contactos y oportunidades)
export default function SearchBar() {
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => search({ q: debounced }),
    enabled: debounced.length >= 2,
  });

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const hasResults =
    data && (data.accounts.length > 0 || data.contacts.length > 0 || data.deals.length > 0);

  return (
    <div className="relative w-full max-w-md" ref={boxRef}>
      <input
        className="input"
        placeholder="Buscar cuentas, contactos u oportunidades…"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && debounced.length >= 2 && (
        <div className="absolute z-20 mt-1 w-full card p-2 max-h-96 overflow-auto">
          {isFetching && <p className="px-2 py-1.5 text-xs text-ink-500">Buscando…</p>}
          {!isFetching && !hasResults && (
            <p className="px-2 py-1.5 text-xs text-ink-500">Sin resultados para "{debounced}".</p>
          )}

          {data?.accounts.length > 0 && (
            <div className="mb-1">
              <p className="px-2 pt-1 text-[11px] font-medium text-ink-500">Cuentas</p>
              {data.accounts.map((a) => (
                <button
                  key={a.id}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-parchment-100 text-sm"
                  onClick={() => {
                    navigate(`/cuentas/${a.id}`);
                    setOpen(false);
                  }}
                >
                  {a.name} <span className="text-ink-500 text-xs">· {a.industry || 'Sin giro'}</span>
                </button>
              ))}
            </div>
          )}

          {data?.contacts.length > 0 && (
            <div className="mb-1">
              <p className="px-2 pt-1 text-[11px] font-medium text-ink-500">Contactos</p>
              {data.contacts.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-parchment-100 text-sm"
                  onClick={() => {
                    navigate(`/cuentas/${c.accountId}`);
                    setOpen(false);
                  }}
                >
                  {c.firstName} {c.lastName}{' '}
                  <span className="text-ink-500 text-xs">· {c.account?.name}</span>
                </button>
              ))}
            </div>
          )}

          {data?.deals.length > 0 && (
            <div>
              <p className="px-2 pt-1 text-[11px] font-medium text-ink-500">Oportunidades</p>
              {data.deals.map((d) => (
                <button
                  key={d.id}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-parchment-100 text-sm"
                  onClick={() => {
                    navigate('/oportunidades');
                    setOpen(false);
                  }}
                >
                  {d.title} <span className="text-ink-500 text-xs">· {d.account?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
