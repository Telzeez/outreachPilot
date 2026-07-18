export default function DashboardStats({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 relative z-10">
      {/* Weekly Volume */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-zinc-100 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Weekly Volume</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <h3 className="text-xl md:text-2xl sm:text-4xl font-black text-black">{stats.weeklyVolume}</h3>
            <p className="text-[10px] sm:text-sm text-zinc-500 font-medium mb-1">/ {stats.weeklyTarget}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <div className="h-1.5 sm:h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0066FF] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Response Rate */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-zinc-100 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Response Rate</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <h3 className="text-xl md:text-2xl sm:text-4xl font-black text-black">{stats.responseRate}%</h3>
          </div>
        </div>
        <p className="text-[10px] sm:text-sm text-zinc-500 font-medium mt-3 sm:mt-6">Based on contacted leads</p>
      </div>

      {/* Target Progress */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-zinc-100 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Target Progress</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <h3 className="text-xl md:text-2xl sm:text-4xl font-black text-black">{stats.targetProgress}%</h3>
          </div>
        </div>
        <p className="text-[10px] sm:text-sm text-zinc-500 font-medium mt-3 sm:mt-6">Of weekly goal achieved</p>
      </div>

      {/* Leads by Source */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-zinc-100 flex flex-col">
        <p className="text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 sm:mb-4">Top Sources</p>
        <div className="space-y-1 sm:space-y-3 flex-grow">
          {stats.leadsBySource?.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-semibold text-zinc-700 capitalize">{item.source.replace('_', ' ')}</span>
              <span className="text-xs sm:text-sm font-bold text-black bg-zinc-100 px-1.5 sm:px-2 py-0.5 rounded-md">{item.count}</span>
            </div>
          ))}
          {(!stats.leadsBySource || stats.leadsBySource.length === 0) && (
            <p className="text-xs sm:text-sm text-zinc-400 font-medium italic">No leads yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
