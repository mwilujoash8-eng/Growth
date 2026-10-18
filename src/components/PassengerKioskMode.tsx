import React, { useState } from 'react';
import { PassengerBooking } from '../types/index.ts';
import { 
  Scan, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Plane, 
  Globe, 
  Sparkles,
  Luggage,
  X
} from 'lucide-react';

interface PassengerKioskModeProps {
  passengers: PassengerBooking[];
  onExitKiosk: () => void;
  onUpdatePassenger: (p: PassengerBooking) => void;
}

type KioskLanguage = 'en' | 'sw' | 'fr' | 'pt';

const I18N: Record<KioskLanguage, {
  welcome: string;
  tagline: string;
  step1: string;
  step2: string;
  step3: string;
  enterPnr: string;
  orScanPassport: string;
  lookAtCamera: string;
  faceCaptureDesc: string;
  clearanceGranted: string;
  clearanceWithheld: string;
  proceedToGate: string;
  speakToAgent: string;
  seat: string;
  gate: string;
  flight: string;
  scanNow: string;
}> = {
  en: {
    welcome: 'Welcome to FaceFly AI',
    tagline: 'One Identity. A Smarter Journey.',
    step1: 'Identify Travel Booking',
    step2: 'Biometric Face Verification',
    step3: 'Gate Boarding Clearance',
    enterPnr: 'Enter Your 6-Letter Booking Reference (PNR)',
    orScanPassport: 'Or place physical passport on the glass scanner below',
    lookAtCamera: 'Please look directly at the biometric camera',
    faceCaptureDesc: 'Keep a neutral expression. Glasses are fine. Verifying in under 200 milliseconds.',
    clearanceGranted: 'Biometric Clearance Approved',
    clearanceWithheld: 'Additional Assistance Required',
    proceedToGate: 'You are cleared for automated e-gate boarding.',
    speakToAgent: 'Please proceed to your airline counter for document inspection.',
    seat: 'Seat',
    gate: 'Departure Gate',
    flight: 'Flight',
    scanNow: 'Start Biometric Scan',
  },
  sw: {
    welcome: 'Karibu FaceFly AI',
    tagline: 'Utambulisho Mmoja. Safari Rahisi Zaidi.',
    step1: 'Thibitisha Tiketi Yako',
    step2: 'Uthibitishaji wa Uso',
    step3: 'Ruhusa ya Kuingia Ndege',
    enterPnr: 'Weka Nambari Yako ya Tiketi (PNR)',
    orScanPassport: 'Au weka pasipoti yako kwenye kioo cha skana hapa chini',
    lookAtCamera: 'Tafadhali tazama moja kwa moja kwenye kamera',
    faceCaptureDesc: 'Tuliza uso wako. Miwani inaruhusiwa. Inathibitishwa chini ya milisekunde 200.',
    clearanceGranted: 'Uthibitisho wa Uso Umekubaliwa',
    clearanceWithheld: 'Msaada wa Ziada Unahitajika',
    proceedToGate: 'Umeruhusiwa kuingia kwenye lango la kielektroniki.',
    speakToAgent: 'Tafadhali nenda kwenye meza ya ndege kwa ukaguzi wa stakabadhi.',
    seat: 'Kiti',
    gate: 'Lango la Kupanda',
    flight: 'Ndege',
    scanNow: 'Anza Kukagua Uso',
  },
  fr: {
    welcome: 'Bienvenue chez FaceFly AI',
    tagline: 'Une Identité. Un Voyage Intelligent.',
    step1: 'Identification du Voyage',
    step2: 'Vérification Faciale',
    step3: 'Autorisation d’Embarquement',
    enterPnr: 'Entrez votre référence de réservation (PNR)',
    orScanPassport: 'Ou placez votre passeport sur le lecteur optique',
    lookAtCamera: 'Veuillez regarder directement la caméra',
    faceCaptureDesc: 'Gardez une expression neutre. Traitement instantané en moins de 200 ms.',
    clearanceGranted: 'Autorisation Biométrique Confirmée',
    clearanceWithheld: 'Assistance Agent Requise',
    proceedToGate: 'Vous pouvez vous présenter aux portes électroniques.',
    speakToAgent: 'Veuillez vous adresser au comptoir de la compagnie.',
    seat: 'Siège',
    gate: 'Porte',
    flight: 'Vol',
    scanNow: 'Démarrer le Scan',
  },
  pt: {
    welcome: 'Bem-vindo ao FaceFly AI',
    tagline: 'Uma Identidade. Uma Viagem Mais Inteligente.',
    step1: 'Identifique sua Reserva',
    step2: 'Verificação Biométrica',
    step3: 'Autorização de Embarque',
    enterPnr: 'Insira sua Referência de Reserva (PNR)',
    orScanPassport: 'Ou coloque o passaporte no leitor óptico',
    lookAtCamera: 'Por favor, olhe diretamente para a câmera',
    faceCaptureDesc: 'Mantenha expressão neutra. Verificação segura em menos de 200 ms.',
    clearanceGranted: 'Autorização Biométrica Concluída',
    clearanceWithheld: 'Apoio de Agente Necessário',
    proceedToGate: 'Autorizado para embarque automatizado.',
    speakToAgent: 'Por favor, dirija-se ao balcão da companhia aérea.',
    seat: 'Assento',
    gate: 'Portão',
    flight: 'Voo',
    scanNow: 'Iniciar Verificação',
  },
};

export const PassengerKioskMode: React.FC<PassengerKioskModeProps> = ({
  passengers,
  onExitKiosk,
  onUpdatePassenger,
}) => {
  const [lang, setLang] = useState<KioskLanguage>('en');
  const [kioskStep, setKioskStep] = useState<'ENTER_PNR' | 'SCAN_FACE' | 'RESULT'>('ENTER_PNR');
  const [pnrInput, setPnrInput] = useState('');
  const [activePax, setActivePax] = useState<PassengerBooking | null>(null);
  const [scanningFace, setScanningFace] = useState(false);

  const t = I18N[lang];

  // Select passenger by PNR
  const handleProceedToFace = (targetPnr?: string) => {
    const code = (targetPnr || pnrInput).trim().toUpperCase();
    const found = passengers.find(p => p.pnr.toUpperCase() === code);
    if (found) {
      setActivePax(found);
      setKioskStep('SCAN_FACE');
    } else {
      // Default to first if sample clicked
      setActivePax(passengers[0]);
      setKioskStep('SCAN_FACE');
    }
  };

  // Run face capture
  const handleCaptureFace = () => {
    if (!activePax) return;
    setScanningFace(true);

    setTimeout(() => {
      setScanningFace(false);
      setKioskStep('RESULT');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto p-6 sm:p-10">
      {/* Kiosk Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30">
            <Plane className="w-6 h-6 -rotate-45 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">FaceFly AI</h1>
            <p className="text-xs text-cyan-400 font-mono">{t.tagline}</p>
          </div>
        </div>

        {/* Language selector & Exit Kiosk Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'en' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('sw')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'sw' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Kiswahili
            </button>
            <button
              onClick={() => setLang('fr')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'fr' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Français
            </button>
            <button
              onClick={() => setLang('pt')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${lang === 'pt' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Português
            </button>
          </div>

          <button
            onClick={onExitKiosk}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Exit Kiosk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Step Body */}
      <div className="max-w-2xl mx-auto w-full py-8">
        {kioskStep === 'ENTER_PNR' && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                STEP 01 / 03 · {t.step1}
              </span>
              <h2 className="text-3xl font-extrabold">{t.enterPnr}</h2>
              <p className="text-sm text-slate-400">{t.orScanPassport}</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. KQ9041"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                className="w-full text-center text-3xl font-mono font-bold tracking-widest py-4 bg-slate-900 border-2 border-slate-700 rounded-2xl focus:border-cyan-400 focus:outline-none uppercase"
              />

              <button
                onClick={() => handleProceedToFace()}
                className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition-colors shadow-xl shadow-cyan-500/20"
              >
                Confirm Booking Reference →
              </button>
            </div>

            {/* Quick Demo PNR Selectors */}
            <div className="pt-6 border-t border-slate-800/80 text-left">
              <span className="text-xs text-slate-400 block mb-2 font-mono">
                Touch below to test ready sample passenger bookings:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {passengers.slice(0, 4).map((p) => (
                  <button
                    key={p.pnr}
                    onClick={() => handleProceedToFace(p.pnr)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs transition-colors"
                  >
                    <div className="font-bold text-cyan-300 font-mono">{p.pnr}</div>
                    <div className="text-slate-300">{p.passengerName}</div>
                    <div className="text-[11px] text-slate-500">{p.flightNumber} · {p.destinationAirport}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {kioskStep === 'SCAN_FACE' && activePax && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                STEP 02 / 03 · {t.step2}
              </span>
              <h2 className="text-3xl font-extrabold">{t.lookAtCamera}</h2>
              <p className="text-sm text-slate-400">{t.faceCaptureDesc}</p>
            </div>

            {/* Simulated Live Face Scanner Ring */}
            <div className="relative w-64 h-64 mx-auto rounded-full border-4 border-cyan-400/50 flex items-center justify-center overflow-hidden bg-slate-900 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
              <img
                src={activePax.photoUrl}
                alt="Subject"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {scanningFace && (
                <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scanline" />
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setKioskStep('ENTER_PNR')}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 transition-colors"
              >
                Back
              </button>

              <button
                onClick={handleCaptureFace}
                disabled={scanningFace}
                className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20"
              >
                {scanningFace ? 'Verifying 3D Biometrics...' : t.scanNow}
              </button>
            </div>
          </div>
        )}

        {kioskStep === 'RESULT' && activePax && (
          <div className="space-y-6 text-center">
            {activePax.boardingStatus === 'PASSED' ? (
              <div className="p-8 rounded-2xl border-2 border-emerald-500 bg-emerald-950/20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t.clearanceGranted}</h2>
                <p className="text-sm text-emerald-300">{t.proceedToGate}</p>

                {/* Digital Boarding Pass Slip */}
                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-left font-mono space-y-3">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-400">PASSENGER:</span>
                    <span className="font-bold text-white">{activePax.passengerName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">{t.flight}:</span>
                      <span className="text-white font-bold">{activePax.flightNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t.seat}:</span>
                      <span className="text-cyan-400 font-bold text-base">{activePax.seat}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t.gate}:</span>
                      <span className="text-emerald-400 font-bold text-base">{activePax.gate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-amber-500 bg-amber-950/20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white">{t.clearanceWithheld}</h2>
                <p className="text-sm text-amber-300">{t.speakToAgent}</p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 text-left">
                  {activePax.agentNotes || 'Pending physical travel document or check-in verification.'}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setKioskStep('ENTER_PNR');
                setPnrInput('');
                setActivePax(null);
              }}
              className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-semibold text-sm border border-slate-800 transition-colors"
            >
              Finished · Process Next Passenger
            </button>
          </div>
        )}
      </div>

      {/* Kiosk Footer Accessibility Bar */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <span>FaceFly Touchpoint Terminal #01 · Lusaka KKIA T2 Concourse</span>
        <span>Assistance Call: Press Yellow Desk Button</span>
      </div>
    </div>
  );
};
