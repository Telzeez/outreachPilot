"use client";

import LeadRow from "./LeadRow";

export default function LeadList({ leads }: { leads: any[] }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50/50 text-xs uppercase font-bold text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4 hidden sm:table-cell">Draft Status</th>
              <th className="px-6 py-4 text-right hidden md:table-cell">Added</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads.map((lead: any) => (
              <LeadRow key={lead.leadId} lead={lead} />
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                  No leads found. Add one manually or import a CSV.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
