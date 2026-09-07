import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const STAGES = [
  { key: 'PROSPECCION', label: 'Prospección', accent: 'border-t-ink-500' },
  { key: 'CALIFICACION', label: 'Calificación', accent: 'border-t-ink-700' },
  { key: 'PROPUESTA', label: 'Propuesta', accent: 'border-t-amber-600' },
  { key: 'NEGOCIACION', label: 'Negociación', accent: 'border-t-amber-700' },
  { key: 'GANADO', label: 'Ganado', accent: 'border-t-sage-600' },
  { key: 'PERDIDO', label: 'Perdido', accent: 'border-t-rust-600' },
];

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function DealCard({ deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`card p-3 mb-2 cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <p className="text-sm font-medium text-ink-950 leading-snug">{deal.title}</p>
      <p className="text-xs text-ink-500 mt-1">{deal.account?.name}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-ink-950">{currency.format(deal.amount)}</span>
        <span className="text-[11px] text-ink-500">{deal.probability}%</span>
      </div>
    </div>
  );
}

function Column({ stage, deals, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const total = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 flex flex-col rounded-lg border-t-4 ${stage.accent} bg-parchment-50 border border-ink-950/10 ${
        isOver ? 'ring-2 ring-amber-600/50' : ''
      }`}
    >
      <div className="px-3 py-3 border-b border-ink-950/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-950">{stage.label}</p>
          <span className="text-xs text-ink-500 bg-ink-950/5 rounded-full px-2 py-0.5">{deals.length}</span>
        </div>
        <p className="text-xs text-ink-500 mt-1">{currency.format(total)}</p>
      </div>
      <div className="flex-1 p-2 overflow-y-auto min-h-[120px]">{children}</div>
    </div>
  );
}

// Interfaz Kanban Drag & Drop para Oportunidades (Deals)
export default function KanbanBoard({ deals, onStageChange }) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    for (const d of deals) {
      (map[d.stage] ??= []).push(d);
    }
    return map;
  }, [deals]);

  const activeDeal = deals.find((d) => d.id === activeId);

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const deal = deals.find((d) => d.id === active.id);
    const targetStage = over.id;
    if (!deal || deal.stage === targetStage) return;
    onStageChange(deal.id, targetStage);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Column key={stage.key} stage={stage} deals={grouped[stage.key]}>
            {grouped[stage.key].map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </Column>
        ))}
      </div>
      <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} /> : null}</DragOverlay>
    </DndContext>
  );
}
