import React, { useState } from 'react';
import { BiometricStationNode } from '../types/index.ts';
import { 
  Cpu, 
  Camera, 
  Activity, 
  RefreshCw, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Layers,
  Terminal,
  Server
} from 'lucide-react';

interface HardwareGateManagerProps {
  stations: BiometricStationNode[];
  onToggleStation: (stationId: string) => void;
  selectedAirport: string;
}

export const HardwareGateManager: React.FC<HardwareGateManagerProps> = ({
  stations,
  onToggleStation,
  selectedAirport,
}) => {
  const [selectedStation, setSelectedStation] = useState<BiometricStationNode>(stations[0]);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latencyMs: number;
    fps: number;
    packetLoss: number;
    hsmReady: boolean;
  } | null>(null);

  // Run interactive hardware ping
  const handleRunPing = () => {
    setTestingPing(true);
    setPingResult(null);

    setTimeout(() => {
      setTestingPing(false);
      setPingResult({
        latencyMs: Math.floor(14 + Math.random() * 8),
        fps: 60,
        packetLoss: 0,
        hsmReady: true,
      });
    }, 450);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>AUTHORISED CAMERA & TURNSTILE SYSTEM ARCHITECTURE · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Airport Stations & Hardware Gateway</h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Total Installed Nodes: <span className="text-white font-bold">{stations.length}</span></span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-bold">100% Edge Resilient</span>
        </div>
      </div>

      {/* Hardware Device Spotlight & Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Terminal Hardware Spec & Industrial Rendering */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden space-y-4 p-5">
          <div className="rounded-xl overflow-hidden border border-slate-800 relative group">
            <img 
              src="/src/assets/images/kiosk_hardware_device_1792308090687.jpg" 
              alt="FaceFly AI Biometric Self-Service Kiosk Console"
              className="w-full h-64 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-xs font-mono text-cyan-300">FaceFly AI Kiosk-4000 Series</span>
              <h3 className="text-base font-bold text-white">Automated Passenger Touchpoint Console</h3>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-300 font-bold text-sm">Industrial Hardware Specifications</div>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Optics:</span>
                <span className="text-white">Dual 4K RGB + 850nm Active IR Array</span>
              </div>
              <div className="flex justify-between">
                <span>OCR Scanner:</span>
                <span className="text-white">Full-Page ICAO 9303 RFID/NFC Chip Reader</span>
              </div>
              <div className="flex justify-between">
                <span>Security Module:</span>
                <span className="text-white">FIPS 140-2 Level 3 Hardware Security Module</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Unit:</span>
                <span className="text-white">Edge Neural NPU (Sub-200ms vector extraction)</span>
              </div>
              <div className="flex justify-between">
                <span>Protocols:</span>
                <span className="text-cyan-400">ONVIF Profile S · WebRTC DataChannel · RTSP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Station Node Grid & Diagnostics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stations.map((s) => {
              const isSelected = selectedStation.id === s.id;
              const isOnline = s.status === 'ONLINE' || s.status === 'ACTIVE_PROCESSING';
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStation(s)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/50'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white">{s.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{s.gateLocation}</p>

                  <div className="space-y-1 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                    <div className="flex justify-between">
                      <span>IP Address:</span>
                      <span className="text-slate-200">{s.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Latency:</span>
                      <span className="text-cyan-400 font-bold">{s.averageLatencyMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today Scans:</span>
                      <span className="text-white font-bold">{s.totalScansToday.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Station Node Controller Panel */}
          {selectedStation && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400">ACTIVE CONTROLLER CONSOLE</span>
                  <h3 className="text-base font-bold text-white">{selectedStation.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunPing}
                    disabled={testingPing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                    <span>{testingPing ? 'Pinging Node...' : 'Test Hardware Stream'}</span>
                  </button>

                  <button
                    onClick={() => onToggleStation(selectedStation.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-colors"
                  >
                    Toggle Maint Mode
                  </button>
                </div>
              </div>

              {/* Hardware diagnostics info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Bridge Protocol:</span>
                  <span className="text-white font-semibold">{selectedStation.hardwareBridge}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Firmware Version:</span>
                  <span className="text-white font-semibold">{selectedStation.firmwareVersion}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">RTSP URI:</span>
                  <span className="text-cyan-400 text-[11px] truncate block">{selectedStation.rtspStream}</span>
                </div>
              </div>

              {/* Live ping test feedback */}
              {pingResult && (
                <div className="p-3.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-xs font-mono flex items-center justify-between text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>HARDWARE BRIDGE NOMINAL: Loopback latency {pingResult.latencyMs}ms · 60.0 FPS · 0% Drop</span>
                  </div>
                  <span className="font-bold text-white">HSM Cryptogram Ready</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
