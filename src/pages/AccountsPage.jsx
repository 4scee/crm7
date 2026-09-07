import { useMemo, useState } from 'react';
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

// Datos MOCK locales para desarrollo exclusivo en Frontend
const MOCK_ACCOUNTS = [
  {
    id: '1',
    name: 'Acme Corp',
    industry: 'Tecnología',
    status: 'ACTIVO',
    website: 'acme.com',
    phone: '+52 55 1234 5678',
    ownerName: 'Ana García',
    employeesCount: 150,
    annualRevenue: 5000000,
    billingAddress: 'Av. Reforma 123, CDMX',
  },
  {
    id: '2',
    name: 'Tech Solutions',
    industry: 'Consultoría',
    status: 'PROSPECTO',
    website: 'techsolutions.io',
    phone: '+52 81 8765 4321',
    ownerName: 'Carlos López',
    employeesCount: 45,
    annualRevenue: 1200000,
    billingAddress: 'Av. Constitución 456, Monterrey',
  },
  {
    id: '3',
    name: 'Logística Global',
    industry: 'Transporte',
    status: 'INACTIVO',
    website: 'logisticaglobal.com',
    phone: '+52 33 5555 4444',
    ownerName: 'Ana García',
    employeesCount: 300,
    annualRevenue: 12000000,
    billingAddress: 'Av. Vallarta 789, Guadalajara',
  },
];

function AccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      <div className="card p-5 h-44 bg-ink-950/5 rounded-lg" />
      <div className="card p-5 h-44 bg-ink-950/5 rounded-lg" />
      <div className="card p-5 h-44 bg-ink-950/5 rounded-lg" />
    </div>
  );
}

export default function AccountsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  // Query con React Query y Fallback Mock
  const { data: apiAccounts, isLoading: loadingAccounts } = useQuery({ 
    queryKey: ['accounts'], 
    queryFn: getAccounts 
  });

  const accounts = apiAccounts || MOCK_ACCOUNTS;

  // Mutación para crear cuenta
  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  // Filtrado dinámico por estatus y búsqueda por texto
  const filtered = useMemo(() => {
    return accounts.filter((account) => {
      const matchesStatus = statusFilter === 'TODAS' || account.status === statusFilter;
      const matchesSearch =
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.industry && account.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (account.ownerName && account.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [accounts, statusFilter, searchTerm]);

  // Cálculos para KPIs
  const activeCount = useMemo(() => accounts.filter((a) => a.status === 'ACTIVO').length, [accounts]);
  const prospectCount = useMemo(() => accounts.filter((a) => a.status === 'PROSPECTO').length, [accounts]);

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
      {/* Tarjetas KPI Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Total de Cuentas</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{accounts.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Clientes Activos</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium font-medium">Prospectos</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{prospectCount}</p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['TODAS', 'PROSPECTO', 'ACTIVO', 'INACTIVO'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-ink-950 text-white border-ink-950'
                  : 'border-ink-950/15 text-ink-700 bg-white hover:bg-parchment-100'
              }`}
            >
              {s === 'TODAS' ? 'Todas' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre, giro o responsable..."
          className="input md:max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Formulario de Alta */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Nombre de la cuenta *</label>
            <input
              className="input w-full"
              required
              placeholder="Ej. Grupo Industrial MX"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Giro / Industria</label>
            <input
              className="input w-full"
              placeholder="Ej. Manufactura"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Estatus</label>
            <select
              className="input w-full"
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
              className="input w-full"
              placeholder="empresa.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input w-full"
              placeholder="+52 55 0000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Ejecutivo responsable</label>
            <input
              className="input w-full"
              placeholder="Nombre del vendedor"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="label">Dirección de facturación</label>
            <input
              className="input w-full"
              placeholder="Calle, número, colonia, ciudad"
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

      {/* Renderizado de Tarjetas o Estado Vació */}
      {loadingAccounts && !apiAccounts ? (
        <AccountsSkeleton />
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
