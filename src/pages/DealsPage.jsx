import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import KanbanBoard from '../components/KanbanBoard';
import { getAccounts, getDeals, createDeal, updateDealStage } from '../api/client';

const EMPTY_FORM = { accountId: '', title: '', amount: '', stage: 'PROSPECCION', probability: 20 };

// Formateador de moneda en MXN
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

// Datos de prueba opcionales por si estás probando solo Frontend sin Backend conectado
const MOCK_ACCOUNTS = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Tech Solutions' },
];

const MOCK_DEALS = [
  { id: '101', title: 'Licencias Enterprise', accountId: '1', amount: 120000, stage: 'PROSPECCION' },
  { id: '102', title: 'Consultoría Cloud', accountId: '2', amount: 45000, stage: 'PROPUESTA' },
];

export default function DealsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('');
  
  const queryClient = useQueryClient();

  // Queries de TanStack React Query
  const { data: deals = MOCK_DEALS, isLoading: loadingDeals } = useQuery({ 
    queryKey: ['deals'], 
    queryFn: getDeals 
  });
  
  const { data: accounts = MOCK_ACCOUNTS } = useQuery({ 
    queryKey: ['accounts'], 
    queryFn: getAccounts 
  });

  // Mutación para crear nueva oportunidad
  const createMutation = useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  // Mutación con actualización optimista para mover tarjetas en el Kanban
  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => updateDealStage(id, { stage }),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previous = queryClient.getQueryData(['deals']);
      
      queryClient.setQueryData(['deals'], (old = []) =>
        old.map((d) => (d.id === id ? { ...d, stage } : d))
      );
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) queryClient.setQueryData(['deals'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: Number(form.amount) });
  }

  // Filtrado dinámico local
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = selectedAccountFilter ? deal.accountId === selectedAccountFilter : true;
    return matchesSearch && matchesAccount;
  });

  // Cálculo de KPIs
  const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

  return (
    <Layout
      title="Oportunidades"
      subtitle="Pipeline de ventas — arrastra las tarjetas para cambiar de etapa"
      actions={
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva oportunidad'}
        </button>
      }
    >
      {/* Formulario de Alta */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="label">Título *</label>
            <input
              className="input w-full"
              required
              placeholder="Ej. Implementación CRM"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Cuenta *</label>
            <select
              className="input w-full"
              required
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monto (MXN) *</label>
            <input
              className="input w-full"
              type="number"
              min="0"
              required
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando…' : 'Guardar oportunidad'}
            </button>
          </div>
        </form>
      )}

      {/* Tarjetas de Métricas de Alto Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Valor Total en Pipeline</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{currency.format(totalPipelineValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Oportunidades Activas</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{filteredDeals.length}</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por título..."
          className="input sm:max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input sm:max-w-xs"
          value={selectedAccountFilter}
          onChange={(e) => setSelectedAccountFilter(e.target.value)}
        >
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tablero Kanban */}
      {loadingDeals ? (
        <p className="text-sm text-ink-500">Cargando pipeline…</p>
      ) : (
        <KanbanBoard
          deals={filteredDeals}
          onStageChange={(id, stage) => stageMutation.mutate({ id, stage })}
        />
      )}
    </Layout>
  );
}
