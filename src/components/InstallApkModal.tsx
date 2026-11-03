import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck,
  Zap,
  AlertTriangle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'why_error' | 'apk_steps'>('direct');

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl bg-[#0c1424] border border-[#1e2f4c] shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#142033] border-b border-[#1c2c47] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#0084ff] text-slate-950 font-black flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Fametrahana ho Fampiharana Finday (APK / App)</span>
              </h2>
              <p className="text-[11px] text-[#00e5ff] font-medium">
                Vahaolana haingana ho an'ny Android & Finday
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a273e] hover:bg-[#223554] border border-[#2a3f62] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-[#1c2c47] bg-[#0f1929] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'direct' 
                ? 'border-[#00e5ff] text-[#00e5ff]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fomba Haingana (Mandeha 100%)</span>
          </button>
          <button
            onClick={() => setActiveTab('why_error')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'why_error' 
                ? 'border-amber-400 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Nahoana no nisy "Error"?</span>
          </button>
          <button
            onClick={() => setActiveTab('apk_steps')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'apk_steps' 
                ? 'border-purple-400 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fakana Fichier .APK</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">

          {/* TAB 1: Direct Install */}
          {activeTab === 'direct' && (
            <div className="flex flex-col gap-4">
              {/* Alert: Easiest path */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-[#00e5ff]/10 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 text-xs leading-relaxed">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold mb-1">
                    Tsy mila mandalo mpanova APK sarotra ianao!
                  </strong>
                  Ity studio ity dia efa manana ny teknolojia <strong>WebAPK (Progressive Web App)</strong>. Afaka mivadika ho fampiharana finday feno mitsatoka amin'ny findainao miaraka amin'ny logo-ny sy ny efijery feno tsy misy rohy na navigateur.
                </div>
              </div>

              {/* Install button if available */}
              {isInstallable && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#00e5ff]/20 to-[#0084ff]/25 border border-[#00e5ff] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#00e5ff]" />
                      Tsindrio ity bokotra ity izao:
                    </span>
                    <span className="text-[10px] bg-[#00e5ff] text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                      Tsindrio Eto
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Avy hatrany dia hapetraky ny Android eo amin'ny efijerim-pindainao toy ny fampiharana voaray avy amin'ny Play Store ny Studio.
                  </p>
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full py-3 px-4 rounded-xl bg-[#00e5ff] hover:bg-[#00c8e0] text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(0,229,255,0.7)] flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-wider"
                  >
                    <Download className="w-4 h-4" />
                    <span>Apetraho amin'ny Finday Izao (Install App)</span>
                  </button>
                </div>
              )}

              {/* Step by step in Chrome */}
              <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1e2f4c] flex flex-col gap-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00e5ff] text-slate-950 text-[11px] font-black flex items-center justify-center">1</span>
                  Dingana 3 tsotra amin'ny Google Chrome (Android):
                </span>
                
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 bg-[#0a111e] p-2.5 rounded-lg border border-[#18273d]">
                    <span className="font-bold text-[#00e5ff]">a.</span>
                    <span>Sokafy eto amin'ny <strong>Google Chrome</strong> amin'ny finday ity pejy ity (midira amin'ny kaonty Google-nao).</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-[#0a111e] p-2.5 rounded-lg border border-[#18273d]">
                    <span className="font-bold text-[#00e5ff]">b.</span>
                    <span>Tsindrio ireo <strong>teboka telo (⋮)</strong> eo amin'ny ankavanana ambony amin'ny Chrome.</span>
                  </div>
                  <div className="flex items-start gap-2.5 bg-[#0a111e] p-2.5 rounded-lg border border-[#18273d]">
                    <span className="font-bold text-[#00e5ff]">d.</span>
                    <span>Tsindrio ny <strong>"Installer l'application" (na "Ajouter à l'écran d'accueil")</strong>.</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-black/40 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vita! Misy icon <strong>SoundStudio</strong> miseho eo amin'ny findainao, misokatra toy ny APK tsy misy baran'ny Chrome!</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Why error happened */}
          {activeTab === 'why_error' && (
            <div className="flex flex-col gap-3.5">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold mb-1">
                    Nahoana no nisy "Error" rehefa nanao Copier-Coller ny rohy ianao?
                  </strong>
                  Ny rohy eto amin'ny Google AI Studio (ohatra: <code>ais-pre-...run.app</code>) dia <strong>voaro amin'ny fiarovana Google Cloud (IAM Security)</strong>.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1e2f4c] text-xs text-slate-300 flex flex-col gap-2.5">
                <h4 className="font-bold text-white text-xs">Ny antony nahatonga ny fahadisoana:</h4>
                <ul className="space-y-2 pl-4 list-disc text-slate-300">
                  <li>
                    <strong>Sakanan'ny Google ny tranokala mpanova APK:</strong> Rehefa alainao ny rohy ka apetaka ao amin'ny tranokala mpanova APK (toy ny PWABuilder na Web2Apk), dia mandefa robot izy ireo hakana ny pejy. Sakanan'ny Google avy hatrany ilay robot (<strong>Error 403 Forbidden</strong>) satria tsy manana alalana amin'ny kaontinao izy.
                  </li>
                  <li>
                    <strong>Chrome amin'ny finday tsy tafiditra amin'ny Google:</strong> Raha sokafana amin'ny navigateur finday tsy mifandray amin'ny kaonty Google-nao ilay rohy, dia manome <em>"Access Denied"</em> na <em>"Error"</em> koa.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e1a2d] border border-[#00e5ff]/40 text-xs text-slate-200 flex flex-col gap-2">
                <span className="font-bold text-[#00e5ff] flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4" />
                  Inona ary ny fomba tsara indrindra?
                </span>
                <p>
                  Aza mampiasa mpanova APK amin'io rohy <code>ais-pre</code> io. Ampiasao mivantana ny bokotra <strong>"Apetraho amin'ny Finday Izao"</strong> na ny <strong>"Installer l'application"</strong> ao amin'ny Google Chrome amin'ny findainao!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: How to get real APK */}
          {activeTab === 'apk_steps' && (
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200">
                <strong className="text-white block font-bold mb-1">
                  Raha tena mila ilay fichier .APK (fichier alaina ao anaty finday) ianao:
                </strong>
                Mba hahafahan'ny PWABuilder na converter mamorona fichier APK, dia mila rohy misokatra ho an'ny daholobe (Public URL) tsy misy fiarovana Google Cloud.
              </div>

              <div className="p-4 rounded-xl bg-[#121c2e] border border-[#1e2f4c] flex flex-col gap-3">
                <span className="font-bold text-white">Dingana hahazoana APK maimaim-poana:</span>
                <ol className="space-y-2.5 pl-5 list-decimal text-slate-300">
                  <li>
                    <strong>Apetraho amin'ny fampiantranoana maimaim-poana (Deploy):</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ampidiro amin'ny Vercel na Netlify na Render (maka 2 minitra maimaim-poana). Hahazo rohy ho an'ny daholobe ianao (ohatra: <code>https://mon-studio.vercel.app</code>).
                    </p>
                  </li>
                  <li>
                    <strong>Sokafy ny PWABuilder:</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mandehana ao amin'ny <strong className="text-[#00e5ff]">pwabuilder.com</strong>, apetaho io rohy public io. Koa satria tsy voasakan'ny Google intsony izy, dia hamoaka ny fichier <strong>.apk</strong> avy hatrany ilay tranokala!
                    </p>
                  </li>
                  <li>
                    <strong>Fomba amin'ny Capacitor / Android Studio:</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Azonao atao koa ny manambatra ity tetikasa ity amin'ny alalan'ny <code>npx @capacitor/android</code> mba hahazoana fichier APK avy amin'ny Android Studio.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Rohy fampiharana (Link to copy) */}
          <div className="p-3 rounded-xl bg-[#090e1a] border border-[#18263d] flex items-center justify-between gap-2">
            <div className="flex-1 truncate text-[11px] font-mono text-slate-300">
              {appUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-[#18263e] hover:bg-[#223554] text-xs font-bold text-[#00e5ff] flex items-center gap-1.5 shrink-0 border border-[#233857] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Adika soa aman-tsara!' : 'Adikao ny rohy'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#111c2e] border-t border-[#1c2c47] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Torohevitra: Tsindrio ny "Fomba Haingana" raha hampiasa azy avy hatrany.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#18263e] hover:bg-[#223554] text-xs font-bold text-slate-200 transition-colors"
          >
            Akatona (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

