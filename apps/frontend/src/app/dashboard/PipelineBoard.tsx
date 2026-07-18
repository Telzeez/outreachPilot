"use client";

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import PipelineColumn from "./PipelineColumn";
import PipelineCard from "./PipelineCard";

const STAGES = [
  { id: "NEW", title: "New" },
  { id: "CONTACTED", title: "Contacted" },
  { id: "REPLIED", title: "Replied" },
  { id: "CALL_BOOKED", title: "Call Booked" },
  { id: "WON", title: "Won" },
  { id: "LOST", title: "Lost" }
];

export default function PipelineBoard({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    const lead = leads.find(l => l.leadId === leadId);
    if (!lead) return;

    let newStage = STAGES.find(s => s.id === overId)?.id;
    if (!newStage) {
      const overLead = leads.find(l => l.leadId === overId);
      if (overLead) {
        newStage = overLead.stage;
      }
    }

    if (!newStage || newStage === lead.stage) return;

    setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, stage: newStage } : l));

    try {
      const res = await fetch(`http://localhost:3001/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage })
      });
      if (!res.ok) throw new Error("Failed to update lead stage");
    } catch (err) {
      console.error(err);
      setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, stage: lead.stage } : l));
    }
  };

  const handleMoveLead = async (leadId: string, newStage: string) => {
    const lead = leads.find(l => l.leadId === leadId);
    if (!lead || lead.stage === newStage) return;

    setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, stage: newStage } : l));

    try {
      const res = await fetch(`http://localhost:3001/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage })
      });
      if (!res.ok) throw new Error("Failed to update lead stage");
    } catch (err) {
      console.error(err);
      setLeads(prev => prev.map(l => l.leadId === leadId ? { ...l, stage: lead.stage } : l));
    }
  };

  const activeLead = activeId ? leads.find(l => l.leadId === activeId) : null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl p-6 overflow-x-auto">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-max pb-4">
          {STAGES.map(stage => (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              leads={leads.filter(l => l.stage === stage.id)}
              onMoveLead={handleMoveLead}
            />
          ))}
        </div>
        
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
          {activeLead ? <PipelineCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
