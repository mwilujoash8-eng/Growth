import React from 'react';
import { BiometricStationNode, SystemBenchmark } from '../types/index.ts';
import { BENCHMARKS } from '../data/seedData.ts';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Zap,
  Activity
} from 'lucide-react';

interface ReportsAnalyticsViewProps {
  stations: BiometricStationNode[];
  selectedAirport: string;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  stations,
  selectedAirport,
}) => {
  const totalScans = stations.reduce((acc, s) => acc + s.totalScansToday, 0);
  const totalMismatches = stations.reduce((acc, s) => acc + s.mismatchesToday, 0);
  const accuracyRate = (((totalScans - totalMismatches) / (totalScans || 1)) * 100).toFixed(2);

  // Generate downloadable CSV report
  const handleDownloadCsv = () => {
    const csvContent = 
      "data:text/csv;charset=utf-8," +
      "Station ID,Name,Type,Throughput_PPH,Avg_Latency_ms,Today_Scans,Mismatches\n" +
      stations.map(s => `${s.id},${s.name},${s.stationType},${s.throughputPerHour},${s.averageLatencyMs},${s.totalScansToday},${s.mismatchesToday}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FaceFly_Analytics_${selectedAirport}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>AIRPORT IDENTITY PERFORMANCE ANALYTICS · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Reports & Telemetry Analytics</h1>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export ICAO Compliance CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
          <span className="text-xs text-slate-400 block mb-1">Total Biometric Passenger Scans Today</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalScans.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">99.98% Gateway Uptime</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
          <span className="text-xs text-slate-400 block mb-1">Algorithmic True Match Accuracy</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {accuracyRate}%
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">False Acceptance Rate &lt; 0.00001%</span>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
          <span className="text-xs text-slate-400 block mb-1">Average Turnstile Latency</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            172 ms
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">-208ms vs China Daxing (380ms)</span>
        </div>
      </div>

      {/* Station Efficiency Breakdown Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Biometric Station Efficiency & Latency Breakdown</h2>
          <span className="text-xs font-mono text-slate-400">Real-time edge telemetry</span>
        </div>

        <div className="divide-y divide-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 text-[11px]">
                <th className="py-2.5 px-4 font-semibold font-sans">Station Name</th>
                <th className="py-2.5 px-3 font-semibold font-sans">Type</th>
                <th className="py-2.5 px-3 font-semibold font-sans">Throughput</th>
                <th className="py-2.5 px-3 font-semibold font-sans">Latency</th>
                <th className="py-2.5 px-3 font-semibold font-sans">Today's Scans</th>
                <th className="py-2.5 px-4 font-semibold font-sans text-right">Mismatches / Rejections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {stations.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    {s.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {s.stationType}
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">
                    {s.throughputPerHour} pax/hr
                  </td>
                  <td className="py-3 px-3 text-white">
                    {s.averageLatencyMs} ms
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {s.totalScansToday.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      s.mismatchesToday > 0 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                    }`}>
                      {s.mismatchesToday} rejected
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
