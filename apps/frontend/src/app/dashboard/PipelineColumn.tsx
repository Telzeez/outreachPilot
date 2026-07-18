"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import PipelineCard from "./PipelineCard";

export default function PipelineColumn({ id, title, leads, onMoveLead }: { id: string, title: string, leads: any[], onMoveLead: (leadId: string, newStage: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-zinc-50/50 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-[calc(100vh-16rem)]">
      <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-100/50 flex justify-between items-center sticky top-0 z-10">
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">{title}</h3>
        <span className="text-xs font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded-full">{leads.length}</span>
      </div>
      
      <div 
        ref={setNodeRef} 
        className={`flex-1 overflow-y-auto p-3 transition-colors ${isOver ? 'bg-zinc-100/80' : ''}`}
      >
        <SortableContext items={leads.map(l => l.leadId)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <PipelineCard key={lead.leadId} lead={lead} onMoveLead={onMoveLead} />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs font-medium text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
