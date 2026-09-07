import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import KanbanBoard from '../components/KanbanBoard';
import { getAccounts, getDeals, createDeal, updateDealStage } from '../api/client';

const EMPTY_FORM = { accountId: '', title: '', amount: '', stage: 'PROSPECCION', probability: 20 };

export default function DealsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({ queryKey: ['deals'], queryFn: getDeals });
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });

  const createMutation = useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  // Actualización optimista: el Kanban se siente instantáneo al soltar la tarjeta
  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => updateDealStage(id, { stage }),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previous = queryClient.getQueryData(['deals']);
      queryClient.setQueryData(['deals'], (old) =>
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
    createMutation.mutate(form);
  }

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
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="label">Título *</label>
            <input
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Cuenta *</label>
            <select
              className="input"
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
              className="input"
              type="number"
              min="0"
              required
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

      {isLoading ? (
        <p className="text-sm text-ink-500">Cargando pipeline…</p>
      ) : (
        <KanbanBoard
          deals={deals}
          onStageChange={(id, stage) => stageMutation.mutate({ id, stage })}
        />
      )}
    </Layout>
  );
}
