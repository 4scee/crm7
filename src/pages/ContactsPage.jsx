import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import ContactCard from '../components/ContactCard';
import { getAccounts, getContacts, createContact, deleteContact } from '../api/client';

const EMPTY_FORM = { accountId: '', firstName: '', lastName: '', email: '', phone: '', jobTitle: '', isPrimary: false };

// Datos MOCK locales para desarrollo exclusivo de UI
const MOCK_ACCOUNTS = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Tech Solutions' },
];

const MOCK_CONTACTS = [
  {
    id: '101',
    accountId: '1',
    firstName: 'Sofía',
    lastName: 'Ramírez',
    jobTitle: 'Directora de Compras',
    email: 'sofia.ramirez@acme.com',
    phone: '+52 55 1234 5678',
    isPrimary: true,
  },
  {
    id: '102',
    accountId: '2',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    jobTitle: 'Líder de TI',
    email: 'carlos.m@techsolutions.com',
    phone: '+52 81 8765 4321',
    isPrimary: false,
  },
];

function ContactsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      <div className="card p-5 h-40 bg-ink-950/5 rounded-lg" />
      <div className="card p-5 h-40 bg-ink-950/5 rounded-lg" />
      <div className="card p-5 h-40 bg-ink-950/5 rounded-lg" />
    </div>
  );
}

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [accountFilter, setAccountFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  // Queries con React Query
  const { data: apiContacts, isLoading: loadingContacts } = useQuery({ 
    queryKey: ['contacts'], 
    queryFn: () => getContacts() 
  });
  
  const { data: apiAccounts } = useQuery({ 
    queryKey: ['accounts'], 
    queryFn: getAccounts 
  });

  const contacts = apiContacts || MOCK_CONTACTS;
  const accounts = apiAccounts || MOCK_ACCOUNTS;

  // Mutación para crear contacto
  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  // Mutación para eliminar contacto
  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  // Filtrado combinado: Cuenta y Búsqueda de Texto
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesAccount = !accountFilter || c.accountId === accountFilter;
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesAccount && matchesSearch;
    });
  }, [contacts, accountFilter, searchTerm]);

  // Contadores para Métricas
  const totalPrimary = useMemo(() => contacts.filter((c) => c.isPrimary).length, [contacts]);

  function handleSubmit(e) {
    e.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <Layout
      title="Contactos"
      subtitle="Personas de contacto en cada cuenta cliente"
      actions={
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nuevo contacto'}
        </button>
      }
    >
      {/* Resumen de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Total de Contactos</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{contacts.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Contactos Principales</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{totalPrimary}</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o puesto..."
          className="input sm:max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="input sm:max-w-xs" 
          value={accountFilter} 
          onChange={(e) => setAccountFilter(e.target.value)}
        >
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario de Alta */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="label">Cuenta *</label>
            <select
              className="input w-full"
              required
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">Selecciona una cuenta…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Nombre *</label>
            <input
              className="input w-full"
              required
              placeholder="Ej. María"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Apellido *</label>
            <input
              className="input w-full"
              required
              placeholder="Ej. López"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Puesto</label>
            <input
              className="input w-full"
              placeholder="Ej. Gerente de Operaciones"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              className="input w-full"
              type="email"
              placeholder="correo@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <div className="flex items-center gap-2 pt-6">
            <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              />
              Contacto principal de la cuenta
            </label>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando…' : 'Guardar contacto'}
            </button>
          </div>
        </form>
      )}

      {/* Grid de Tarjetas de Contacto */}
      {loadingContacts && !apiContacts ? (
        <ContactsSkeleton />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-500">No hay contactos para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={(c) => {
                if (confirm(`¿Eliminar a ${c.firstName} ${c.lastName}?`)) deleteMutation.mutate(c.id);
              }}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
