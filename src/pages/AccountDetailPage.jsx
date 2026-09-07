import { useMemo, useState } from 'react';
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

// Datos MOCK locales para desarrollo exclusivo en Frontend
const MOCK_ACCOUNT_DETAIL = {
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
  contacts: [
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
  ],
  deals: [
    {
      id: 'd1',
      title: 'Renovación Licencias Enterprise',
      stage: 'NEGOCIACION',
      amount: 450000,
    },
    {
      id: 'd2',
      title: 'Módulo Adicional Analítica',
      stage: 'PROPUESTA',
      amount: 120000,
    },
  ],
  activities: [
    {
      id: 'a1',
      type: 'NOTA',
      title: 'Llamada de seguimiento',
      description: 'Se revisaron los términos de la propuesta técnica.',
      createdAt: new Date().toISOString(),
    },
  ],
};

function AccountDetailSkeleton() {
  return (
    <Layout title="Cargando cuenta...">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 h-64 bg-ink-950/5 rounded-lg" />
          <div className="card p-5 h-48 bg-ink-950/5 rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <div className="card p-5 h-96 bg-ink-950/5 rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <div className="card p-5 h-96 bg-ink-950/5 rounded-lg" />
        </div>
      </div>
    </Layout>
  );
}

export default function AccountDetailPage() {
  const { id } = useParams();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
  
  const queryClient = useQueryClient();

  // Query con React Query y Fallback Mock
  const { data: apiAccount, isLoading } = useQuery({
    queryKey: ['account', id],
    queryFn: () => getAccount(id),
  });

  const account = apiAccount || MOCK_ACCOUNT_DETAIL;

  // Garantizar arreglos seguros
  const contacts = account?.contacts || [];
  const deals = account?.deals || [];
  const activities = account?.activities || [];

  // Cálculos de métricas
  const totalPipelineValue = useMemo(() => {
    return deals.reduce((acc, deal) => acc + (deal.amount || 0), 0);
  }, [deals]);

  // Mutación para agregar contacto
  const addContact = useMutation({
    mutationFn: (data) => createContact({ ...data, accountId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' });
      setShowContactForm(false);
    },
  });

  // Mutación para agregar actividad
  const addActivity = useMutation({
    mutationFn: (data) => createActivity({ ...data, accountId: id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account', id] }),
  });

  if (isLoading && !apiAccount) {
    return <AccountDetailSkeleton />;
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
      {/* Resumen Superior de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Contactos Vinculados</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{contacts.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Oportunidades</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{deals.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-500 font-medium">Valor Total Pipeline</p>
          <p className="text-xl font-bold text-ink-950 mt-1">{currency.format(totalPipelineValue)}</p>
        </div>
      </div>

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
                Contactos ({contacts.length})
              </h2>
              <button className="text-xs text-amber-700 font-medium hover:underline" onClick={() => setShowContactForm((v) => !v)}>
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
                    className="input w-full"
                    placeholder="Nombre"
                    required
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  />
                  <input
                    className="input w-full"
                    placeholder="Apellido"
                    required
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  />
                </div>
                <input
                  className="input w-full"
                  placeholder="Puesto"
                  value={contactForm.jobTitle}
                  onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                />
                <input
                  className="input w-full"
                  placeholder="Correo"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
                <input
                  className="input w-full"
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
              {contacts.length === 0 && (
                <p className="text-sm text-ink-500">Esta cuenta aún no tiene contactos.</p>
              )}
              {contacts.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </div>
        </div>

        {/* Columna central: oportunidades */}
        <div className="lg:col-span-1">
          <h2 className="font-display font-semibold text-ink-950 mb-3">
            Oportunidades ({deals.length})
          </h2>
          <div className="space-y-3">
            {deals.length === 0 && (
              <p className="text-sm text-ink-500">Sin oportunidades registradas todavía.</p>
            )}
            {deals.map((deal) => (
              <div key={deal.id} className="card p-4">
                <p className="text-sm font-medium text-ink-950">{deal.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ink-950/5 text-ink-700">
                    {STAGE_LABELS[deal.stage] || deal.stage}
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
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </Layout>
  );
}
