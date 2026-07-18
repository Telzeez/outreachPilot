import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

async function getLeads() {
  try {
    const res = await fetch("http://localhost:3001/leads", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch leads", error);
    return [];
  }
}

async function getStats() {
  try {
    const res = await fetch("http://localhost:3001/leads/stats", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch stats", error);
    return null;
  }
}

export default async function DashboardPage() {
  const [leads, stats] = await Promise.all([getLeads(), getStats()]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAFA] p-8 lg:p-12 relative overflow-hidden">
      {/* Background Pastel Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-200/40 blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-200/40 blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />

      <DashboardClient initialLeads={leads} initialStats={stats} />
    </div>
  );
}
