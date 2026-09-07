import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import ContactCard from '../components/ContactCard';
import ActivityTimeline from '../components/ActivityTimeline';
import NoteQuickAdd from '../components/NoteQuickAdd';
import { getAccount, createContact, createActivity } from '../api/client';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const STAGE_LABELS = {
  PROSPECCION: 'Prospección',
  CALIFICACION: 'Calificación',
  PROPUESTA: 'Propuesta',
  NEGOCIACION: 'Negociación',
  GANADO: 'Ganado',
  PERDIDO: 'Perdido',
};

// Perfil detallado por cuenta de cliente: datos generales, contactos, oportunidades y actividad
export default function AccountDetailPage() {
  const { id } = useParams();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
  const queryClient = useQueryClient();

  const { data: account, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccount(id),
  });

  const addContact = useMutation({
    mutationFn: (data) => createContact({ ...data, accountId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
      setShowContactForm(false);
    },
  });

  const addActivity = useMutation({
    mutationFn: (data) => createActivity({ ...data, accountId: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account', id] }),
  });

  if (isLoading || !account) {
    return (
      <Layout title="Perfil de cuenta">
        <p className="text-sm text-ink-500">Cargando información de la cuenta…</p>
      </Layout>
    );
  }

  return (
    <Layout
      title={account.name}
      subtitle={account.industry || 'Giro no especificado'}
      actions={
        <Link to="/cuentas" className="btn-secondary">
          ← Volver a cuentas
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: datos generales + contactos */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="card p-5">
            <h2 className="font-display font-semibold text-ink-950 mb-3">Datos generales</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Estatus</dt>
                <dd className="font-medium">{account.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Teléfono</dt>
                <dd className="font-medium">{account.phone || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Sitio web</dt>
                <dd className="font-medium truncate max-w-[160px]">{account.website || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Empleados</dt>
                <dd className="font-medium">{account.employeesCount ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Ingresos anuales</dt>
                <dd className="font-medium">
                  {account.annualRevenue ? currency.format(account.annualRevenue) : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Ejecutivo</dt>
                <dd className="font-medium">{account.ownerName || '—'}</dd>
              </div>
              <div className="pt-2 border-t border-ink-950/10">
                <dt className="text-ink-500 mb-1">Dirección</dt>
                <dd className="font-medium">{account.billingAddress || '—'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-ink-950">
                Contactos ({account.contacts.length})
              </h2>
              <button className="text-xs text-amber-700 font-medium" onClick={() => setShowContactForm((v) => !v)}>
                {showContactForm ? 'Cancelar' : '+ Agregar'}
              </button>
            </div>

            {showContactForm && (
              <form
                className="card p-4 mb-3 space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addContact.mutate(contactForm);
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input"
                    placeholder="Nombre"
                    required
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Apellido"
                    required
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  />
                </div>
                <input
                  className="input"
                  placeholder="Puesto"
                  value={contactForm.jobTitle}
                  onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Correo"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Teléfono"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
                <button className="btn-primary w-full justify-center" disabled={addContact.isPending}>
                  {addContact.isPending ? 'Guardando…' : 'Guardar contacto'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {account.contacts.length === 0 && (
                <p className="text-sm text-ink-500">Esta cuenta aún no tiene contactos.</p>
              )}
              {account.contacts.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </div>
        </div>

        {/* Columna central: oportunidades */}
        <div className="lg:col-span-1">
          <h2 className="font-display font-semibold text-ink-950 mb-3">
            Oportunidades ({account.deals.length})
          </h2>
          <div className="space-y-3">
            {account.deals.length === 0 && (
              <p className="text-sm text-ink-500">Sin oportunidades registradas todavía.</p>
            )}
            {account.deals.map((deal) => (
              <div key={deal.id} className="card p-4">
                <p className="text-sm font-medium text-ink-950">{deal.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ink-950/5 text-ink-700">
                    {STAGE_LABELS[deal.stage]}
                  </span>
                  <span className="font-display text-sm font-semibold">{currency.format(deal.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha: actividad */}
        <div className="lg:col-span-1">
          <h2 className="font-display font-semibold text-ink-950 mb-3">Actividad reciente</h2>
          <div className="mb-4">
            <NoteQuickAdd onSubmit={addActivity.mutate} isSubmitting={addActivity.isPending} />
          </div>
          <ActivityTimeline activities={account.activities} />
        </div>
      </div>
    </Layout>
  );
}
