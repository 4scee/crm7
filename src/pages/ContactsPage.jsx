import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import ContactCard from '../components/ContactCard';
import { getAccounts, getContacts, createContact, deleteContact } from '../api/client';

const EMPTY_FORM = { accountId: '', firstName: '', lastName: '', email: '', phone: '', jobTitle: '', isPrimary: false };

export default function ContactsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [accountFilter, setAccountFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({ queryKey: ['contacts'], queryFn: () => getContacts() });
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setForm(EMPTY_FORM);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const filtered = useMemo(
    () => contacts.filter((c) => !accountFilter || c.accountId === accountFilter),
    [contacts, accountFilter]
  );

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
      <div className="mb-5 flex items-center gap-3">
        <select className="input max-w-xs" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="label">Cuenta *</label>
            <select
              className="input"
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
              className="input"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Apellido *</label>
            <input
              className="input"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Puesto</label>
            <input
              className="input"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Correo</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            />
            Contacto principal de la cuenta
          </label>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando…' : 'Guardar contacto'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-500">Cargando contactos…</p>
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
