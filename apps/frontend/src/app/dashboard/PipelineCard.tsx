"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PipelineCard({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.leadId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-zinc-200 rounded-xl p-4 shadow-sm mb-3 cursor-grab active:cursor-grabbing hover:border-zinc-300 transition-colors ${isDragging ? 'shadow-lg border-black ring-1 ring-black' : ''}`}
    >
      <div className="font-bold text-black text-sm mb-1">{lead.companyName}</div>
      <div className="text-xs text-zinc-500 mb-3">{lead.contactName || "No Contact"}</div>
      
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
          lead.draftStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
          lead.draftStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
          lead.draftStatus === 'SENT' ? 'bg-blue-100 text-blue-700' :
          lead.draftStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
          'bg-zinc-100 text-zinc-600'
        }`}>
          {lead.draftStatus?.replace('_', ' ') || 'NO DRAFT'}
        </span>
      </div>
    </div>
  );
}
