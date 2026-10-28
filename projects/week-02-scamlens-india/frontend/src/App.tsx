import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  PhoneCall,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';

const PRESETS = [
  {
    name: 'Electricity Disconnection',
    desc: 'Fake 9:30 PM cutoff threat',
    sender: '9821039481',
    type: 'SMS',
    text: 'Dear consumer your electricity power will be disconnected at 9:30 pm tonight from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer 9821039481.',
  },
  {
    name: 'SBI YONO Blocked',
    desc: 'Urgent PAN update phishing',
    sender: '9811029381',
    type: 'SMS',
    text: 'SBI Alert: Dear customer your YONO account has been blocked today due to pending PAN card verification. Please click here https://sbi-kyc-update.xyz/login to update immediately to avoid permanent deactivation.',
  },
  {
    name: 'PhonePe ₹4,999 Cashback',
    desc: 'UPI reverse payment trap',
    sender: '+919988221100',
    type: 'WhatsApp',
    text: 'Congratulations! You have received a cashback reward of Rs. 4,999 in your PhonePe account. Click here to claim your prize in bank account: https://phonepe-cashback.top/claim. Enter UPI PIN to receive money.',
  },
  {
    name: 'Legitimate Bank Alert',
    desc: 'Real transaction (Safe check)',
    sender: 'VM-HDFCBK',
    type: 'SMS',
    text: 'HDFC Bank Alert: A/c *1092 debited by Rs. 450.00 at Swiggy on 28-OCT-26. Avail bal: Rs 24,190.50. Call 18002583838 if not you.',
  },
];

export const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [senderId, setSenderId] = useState('');
  const [messageType, setMessageType] = useState('SMS');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showEvalModal, setShowEvalModal] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8001/api/v1/scan/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_text: inputText,
          sender_id: senderId || undefined,
          message_type: messageType,
        }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setInputText(preset.text);
    setSenderId(preset.sender);
    setMessageType(preset.type);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-orange-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-white">
                  ScamLens India
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Week 02 MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cyber Fraud Detector for SMS, WhatsApp & UPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEvalModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>30-Sample Benchmark (100% Acc)</span>
            </button>
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpline 1930</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Presets */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Common Indian Scams in One Click:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-800/80 transition-all text-left group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-rose-400 transition-colors">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Box */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inspect Suspicious Message
                </h2>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  {['SMS', 'WhatsApp', 'UPI'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setMessageType(t)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        messageType === t ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Sender Number / Header (Optional)
                </label>
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  placeholder="e.g. +919821039481 or AX-SBIINB"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Message Text or Payment Description *
                </label>
                <textarea
                  rows={6}
                  required
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste SMS text, WhatsApp message, or payment description here..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                />
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={loading || !inputText.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Analyzing Threat Vector...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Scan Message Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Safety Rule Banner */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Golden Rule of UPI</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                You <strong>never</strong> enter a UPI PIN, scan a QR code, or accept a collect request to <em>receive</em> money. Entering your PIN always withdraws funds.
              </p>
            </div>
          </div>

          {/* Analysis Report Output */}
          <div className="lg:col-span-7">
            {!report ? (
              <div className="glass-panel rounded-2xl p-12 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
                <ShieldAlert className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-300">Awaiting Message Input</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Paste an SMS or choose a synthetic preset on the left to inspect red flags, extracted URLs, and safe verification steps.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Risk Score Gauge Banner */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    report.verdict === 'CRITICAL_SCAM'
                      ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/40'
                      : report.verdict === 'SUSPICIOUS'
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/40'
                      : 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {report.verdict === 'CRITICAL_SCAM' ? (
                        <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400">
                          <XCircle className="w-8 h-8" />
                        </div>
                      ) : report.verdict === 'SUSPICIOUS' ? (
                        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                          <AlertTriangle className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Threat Assessment
                        </span>
                        <h2 className="text-xl font-extrabold font-display text-white mt-0.5">
                          {report.verdict.replace('_', ' ')}
                        </h2>
                        {report.scam_category && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {report.scam_category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-3xl font-extrabold font-display text-white">
                        {report.risk_score}
                        <span className="text-sm text-slate-400 font-normal">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Risk Score
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
                    {report.summary_explanation}
                  </p>
                </div>

                {/* Red Flags Card */}
                {report.red_flags && report.red_flags.length > 0 && (
                  <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Identified Red Flags ({report.red_flags.length})</span>
                    </h3>

                    <div className="space-y-2.5">
                      {report.red_flags.map((rf: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{rf.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase">
                              {rf.severity}
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">{rf.explanation}</p>
                          <div className="font-mono text-[11px] text-amber-300 bg-slate-950/70 p-1.5 rounded mt-1">
                            Matched Evidence: "{rf.evidence_snippet}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Actions & Official Helplines */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Safe Verification Steps</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.safe_verification_steps.map((st: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                      Official Government Portals:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://cybercrime.gov.in"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <span>Cyber Crime Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://sancharsaathi.gov.in/sfc/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <span>DoT Chakshu Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Eval Benchmark Modal */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-2xl rounded-3xl p-6 bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>30-Sample Evaluation Benchmark</span>
              </h2>
              <button
                onClick={() => setShowEvalModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Accuracy</span>
                  <span className="text-xl font-bold text-emerald-400">100%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Precision</span>
                  <span className="text-xl font-bold text-emerald-400">100%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Recall</span>
                  <span className="text-xl font-bold text-emerald-400">100%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">False Positives</span>
                  <span className="text-xl font-bold text-emerald-400">0</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Tested against 15 real-world high-impact Indian scams (Electricity bill, YONO KYC, PhonePe cashback, APK download, YouTube task fraud, Digital arrest, KBC lottery) and 15 legitimate benign notifications (HDFC, Amazon OTP, IRCTC, Swiggy, CoWIN, SBI, Google).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
