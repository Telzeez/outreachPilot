"use client";

import { useState } from "react";
import AddLeadModal from "./AddLeadModal";
import CsvImportModal from "./CsvImportModal";
import AutoScraperModal from "./AutoScraperModal";
import LeadList from "./LeadList";
import PipelineBoard from "./PipelineBoard";
import DashboardStats from "./DashboardStats";

export default function DashboardClient({ initialLeads, initialStats }: { initialLeads: any[], initialStats: any }) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  
  return (
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Leads Pipeline</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage your reverse-outreach targets.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="hidden sm:flex bg-zinc-200/50 p-1 rounded-xl mr-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === "board" ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black"}`}
            >
              Board
            </button>
          </div>
          <AutoScraperModal />
          <CsvImportModal />
          <AddLeadModal />
        </div>
      </div>

      <DashboardStats stats={initialStats} />

      {viewMode === "list" ? (
        <LeadList leads={initialLeads} />
      ) : (
        <PipelineBoard initialLeads={initialLeads} />
      )}
    </div>
  );
}
