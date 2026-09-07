import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import AccountCard from '../components/AccountCard';
import { createAccount, getAccounts } from '../api/client';

const EMPTY_FORM = {
  name: '',
  industry: '',
  website: '',
  phone: '',
  billingAddress: '',
  employeesCount: '',
  annualRevenue: '',
  ownerName: '',
  status: 'PROSPECTO',
};

export default function AccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  const filtered = accounts.filter((a) => statusFilter === 'TODAS' || a.status === statusFilter);

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <Layout
      title="Cuentas"
      subtitle="Empresas clientes y prospectos"
      actions={
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva cuenta'}
        </button>
      }
    >
      <div className="flex items-center gap-2 mb-5">
        {['TODAS', 'PROSPECTO', 'ACTIVO', 'INACTIVO'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              statusFilter === s
                ? 'bg-ink-950 text-white border-ink-950'
                : 'border-ink-950/15 text-ink-700 bg-white hover:bg-parchment-100'
            }`}
          >
            {s === 'TODAS' ? 'Todas' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Nombre de la cuenta *</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Giro / Industria</label>
            <input
              className="input"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Estatus</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="PROSPECTO">Prospecto</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="label">Sitio web</label>
            <input
              className="input"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Ejecutivo responsable</label>
            <input
              className="input"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="label">Dirección de facturación</label>
            <input
              className="input"
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando…' : 'Guardar cuenta'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-500">Cargando cuentas…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-500">No hay cuentas para este filtro.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </Layout>
  );
}
