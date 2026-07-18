"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import EditLeadModal from "./EditLeadModal";
import DeleteLeadButton from "./DeleteLeadButton";

export default function LeadRow({ lead }: { lead: any }) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/dashboard/leads/${lead.leadId}`);
  };

  return (
    <tr 
      className="hover:bg-zinc-50/50 transition-colors cursor-pointer group"
      onClick={handleRowClick}
    >
      <td className="px-6 py-4">
        <div className="font-bold text-black group-hover:text-[#0066FF] transition-colors">{lead.companyName}</div>
        {lead.website && (
          <a href={lead.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-500 hover:underline">
            {lead.website}
          </a>
        )}
      </td>
      <td className="px-6 py-4">
        {lead.contactName ? (
          <div>
            <div className="font-semibold text-zinc-900">{lead.contactName}</div>
            <div className="text-xs text-zinc-500">{lead.contactEmail}</div>
          </div>
        ) : (
          <span className="text-zinc-400 italic">No contact</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
          {lead.stage}
        </span>
      </td>
      <td className="px-6 py-4 hidden sm:table-cell">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          !lead.messageStatus ? 'bg-zinc-100 text-zinc-500' :
          lead.messageStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
          lead.messageStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
          lead.messageStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
          lead.messageStatus === 'SENT' ? 'bg-blue-100 text-blue-800' :
          'bg-zinc-100 text-zinc-800'
        }`}>
          {!lead.messageStatus ? 'NO DRAFT' : lead.messageStatus.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-xs font-medium hidden md:table-cell" suppressHydrationWarning>
        {new Date(lead.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/dashboard/leads/${lead.leadId}`}
            title="Draft Outreach Message"
            className="p-1.5 text-[#0066FF] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </Link>
          <EditLeadModal lead={lead} />
          <DeleteLeadButton leadId={lead.leadId} />
        </div>
      </td>
    </tr>
  );
}
