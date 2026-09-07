import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Layout from '../components/Layout';
import { getDashboardStats } from '../api/client';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const STAGE_LABELS = {
  PROSPECCION: 'Prospección',
  CALIFICACION: 'Calificación',
  PROPUESTA: 'Propuesta',
  NEGOCIACION: 'Negociación',
  GANADO: 'Ganado',
  PERDIDO: 'Perdido',
};

const STAGE_COLORS = {
  PROSPECCION: '#4C5E8A',
  CALIFICACION: '#2E3E63',
  PROPUESTA: '#C08A2E',
  NEGOCIACION: '#A5731F',
  GANADO: '#3F7A5C',
  PERDIDO: '#B5543C',
};

// Datos MOCK para desarrollo autónomo en Frontend
const MOCK_DASHBOARD_DATA = {
  wonAmount: 485000,
  wonCount: 12,
  openAmount: 320000,
  openCount: 8,
  conversionRate: 65,
  lostCount: 4,
  progressToGoal: 81,
  goal: {
    period: 'Q3',
    targetAmount: 600000,
  },
  monthly: [
    { month: 'Ene', amount: 120000 },
    { month: 'Feb', amount: 95000 },
    { month: 'Mar', amount: 140000 },
    { month: 'Abr', amount: 110000 },
    { month: 'May', amount: 180000 },
    { month: 'Jun', amount: 210000 },
  ],
  byStage: [
    { stage: 'PROSPECCION', count: 4, amount: 80000 },
    { stage: 'CALIFICACION', count: 3, amount: 65000 },
    { stage: 'PROPUESTA', count: 5, amount: 150000 },
    { stage: 'NEGOCIACION', count: 2, amount: 90000 },
    { stage: 'GANADO', count: 12, amount: 485000 },
    { stage: 'PERDIDO', count: 4, amount: 110000 },
  ],
};

function StatCard({ label, value, sublabel }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="font-display text-3xl font-semibold text-ink-950 mt-1">{value}</p>
      {sublabel && <p className="text-xs text-ink-500 mt-1">{sublabel}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <Layout title="Panel" subtitle="Cargando métricas…">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
        <div className="card p-5 h-28 bg-ink-950/5" />
        <div className="card p-5 h-28 bg-ink-950/5" />
        <div className="card p-5 h-28 bg-ink-950/5" />
        <div className="card p-5 h-28 bg-ink-950/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="card p-5 lg:col-span-2 h-80 bg-ink-950/5" />
        <div className="card p-5 h-80 bg-ink-950/5" />
      </div>
    </Layout>
  );
}

// Dashboard gráfico: ventas ganadas, pipeline abierto y tasa de conversión
export default function DashboardPage() {
  const { data: apiData, isLoading } = useQuery({ 
    queryKey: ['dashboard'], 
    queryFn: getDashboardStats 
  });

  // Usar datos de la API o recurrir al Mock si falla/está en desarrollo exclusivo de UI
  const data = apiData || MOCK_DASHBOARD_DATA;

  if (isLoading && !apiData) {
    return <DashboardSkeleton />;
  }

  const stageData = data.byStage.map((s) => ({ ...s, label: STAGE_LABELS[s.stage] }));
  const pieData = data.byStage.filter((s) => s.count > 0);

  return (
    <Layout title="Panel" subtitle="Resumen de ventas y conversión del equipo comercial">
      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Ventas ganadas" 
          value={currency.format(data.wonAmount)} 
          sublabel={`${data.wonCount} negocios cerrados`} 
        />
        <StatCard 
          label="Pipeline abierto" 
          value={currency.format(data.openAmount)} 
          sublabel={`${data.openCount} oportunidades activas`} 
        />
        <StatCard 
          label="Tasa de conversión" 
          value={`${data.conversionRate}%`} 
          sublabel={`${data.wonCount} ganados / ${data.lostCount} perdidos`} 
        />
        <StatCard
          label={`Meta ${data.goal?.period ?? ''}`}
          value={data.progressToGoal !== null ? `${data.progressToGoal}%` : '—'}
          sublabel={data.goal ? `Meta: ${currency.format(data.goal.targetAmount)}` : 'Sin meta definida'}
        />
      </div>

      {/* Rejilla de Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Líneas: Ventas Ganadas */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-ink-950 mb-4">Ventas ganadas por mes</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A4520" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#4C5E8A" />
              <YAxis tick={{ fontSize: 12 }} stroke="#4C5E8A" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => currency.format(v)} />
              <Line type="monotone" dataKey="amount" stroke="#C08A2E" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de Dona: Distribución */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-950 mb-4">Distribución por etapa</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="stage" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, STAGE_LABELS[n]]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
            {pieData.map((s) => (
              <div key={s.stage} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s.stage] }} />
                <span className="text-ink-700">{STAGE_LABELS[s.stage]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica de Barras: Monto por Etapa */}
        <div className="card p-5 lg:col-span-3">
          <h2 className="font-display font-semibold text-ink-950 mb-4">Monto por etapa del pipeline</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A4520" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#4C5E8A" />
              <YAxis tick={{ fontSize: 12 }} stroke="#4C5E8A" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => currency.format(v)} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {stageData.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
