import { useState, useEffect } from 'react';
import {
  FileText, ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  Building2, AlertOctagon, RefreshCw, FileCheck, Info, Scale
} from 'lucide-react';

interface PageCitation {
  page: number;
  excerpt: string;
}

interface TenderBasicInfo {
  tender_id: string;
  issuing_authority: string;
  title_of_work: string;
  estimated_cost_inr: number;
  tender_fee_inr: number;
  emd_amount_inr: number;
  emd_msme_exemption: boolean;
  submission_deadline: string;
  pre_bid_meeting?: string;
  tech_bid_opening?: string;
  citation?: PageCitation;
}

interface FinancialEligibility {
  min_average_turnover_inr: number;
  turnover_years: number;
  solvency_certificate_inr: number;
  net_worth_positive: boolean;
  audit_udin_mandatory: boolean;
  citation?: PageCitation;
}

interface TechnicalEligibility {
  similar_work_definition: string;
  one_work_value_inr: number;
  two_works_value_inr: number;
  three_works_value_inr: number;
  lookback_period_years: number;
  joint_venture_allowed: boolean;
  citation?: PageCitation;
}

interface ChecklistItem {
  doc_id: string;
  doc_name: string;
  is_mandatory: boolean;
  description: string;
  citation?: PageCitation;
}

interface RiskClause {
  category: string;
  severity: string;
  clause_summary: string;
  citation: PageCitation;
}

interface TenderAnalysisResult {
  basic_info: TenderBasicInfo;
  financial_eligibility: FinancialEligibility;
  technical_eligibility: TechnicalEligibility;
  mandatory_checklist: ChecklistItem[];
  risk_clauses: RiskClause[];
  pages_analyzed: number;
  summary_verdict: string;
}

interface GateVerdict {
  gate_name: string;
  passed: boolean;
  required: string;
  actual: string;
  notes: string;
}

interface ScreeningVerdict {
  overall_status: string;
  fit_score_percentage: number;
  gates: GateVerdict[];
  emd_action: string;
  missing_mandatory_docs: string[];
  readiness_percentage: number;
  actionable_recommendations: string[];
}

interface SampleRFP {
  id: string;
  title: string;
  authority: string;
  text: string;
}

const ALL_POSSIBLE_DOCS = [
  { id: 'gst_cert', label: 'GST Registration Certificate' },
  { id: 'pan_card', label: 'Income Tax PAN Card' },
  { id: 'epf_cert', label: 'EPF Registration & Challan' },
  { id: 'esic_cert', label: 'ESIC Registration' },
  { id: 'blacklisting_affidavit', label: 'Non-Blacklisting Affidavit' },
  { id: 'integrity_pact', label: 'Signed Integrity Pact' },
  { id: 'power_of_attorney', label: 'Power of Attorney' },
  { id: 'audited_balance_sheets', label: 'CA Audited Balance Sheets (UDIN)' },
  { id: 'contractor_enlistment', label: 'Contractor Enlistment Certificate' },
  { id: 'emd_receipt_or_msme', label: 'EMD Receipt / Udyam Certificate' }
];

export default function App() {
  const [rfpText, setRfpText] = useState<string>('');
  const [samples, setSamples] = useState<SampleRFP[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TenderAnalysisResult | null>(null);
  const [screeningResult, setScreeningResult] = useState<ScreeningVerdict | null>(null);

  // Contractor Profile
  const [contractorName, setContractorName] = useState<string>('Apex Infrastructure Projects Ltd');
  const [annualTurnover, setAnnualTurnover] = useState<number>(200000000); // 20 Cr
  const [singleLargestWork, setSingleLargestWork] = useState<number>(400000000); // 40 Cr
  const [solvencyAmount, setSolvencyAmount] = useState<number>(250000000); // 25 Cr
  const [isMsme, setIsMsme] = useState<boolean>(true);
  const [availableDocs, setAvailableDocs] = useState<string[]>([
    'gst_cert', 'pan_card', 'epf_cert', 'esic_cert', 'blacklisting_affidavit',
    'integrity_pact', 'power_of_attorney', 'audited_balance_sheets',
    'contractor_enlistment', 'emd_receipt_or_msme'
  ]);

  useEffect(() => {
    fetch('/api/v1/tenders/sample-rfps')
      .then(r => r.json())
      .then(data => {
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
          setSelectedSampleId(data.samples[0].id);
          setRfpText(data.samples[0].text);
        }
      })
      .catch(err => console.error("Failed to fetch sample RFPs", err));
  }, []);

  const handleSelectSample = (id: string) => {
    setSelectedSampleId(id);
    const found = samples.find(s => s.id === id);
    if (found) {
      setRfpText(found.text);
    }
  };

  const toggleDoc = (docId: string) => {
    if (availableDocs.includes(docId)) {
      setAvailableDocs(availableDocs.filter(d => d !== docId));
    } else {
      setAvailableDocs([...availableDocs, docId]);
    }
  };

  const handleAnalyze = async () => {
    if (!rfpText.trim()) return;
    setLoading(true);

    try {
      const payload = {
        rfp_text: rfpText,
        contractor_profile: {
          contractor_name: contractorName,
          annual_turnover_inr: annualTurnover,
          single_largest_work_inr: singleLargestWork,
          solvency_amount_inr: solvencyAmount,
          is_msme_registered: isMsme,
          available_doc_ids: availableDocs
        }
      };

      const res = await fetch('/api/v1/tenders/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
      setScreeningResult(data.screening);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Failed to analyze RFP. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val: number) => {
    if (!val) return '₹ 0';
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  TenderLens
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  GovProcure & RFP Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Public Tender Compliance Analyzer with Exact Page Citation Grounding & Bidder Eligibility Screener
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CPWD / GeM / Railways RFP Engine v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: RFP Intake & Contractor Profile */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset Tender Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Preset Procurement RFP Excerpt:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {samples.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s.id)}
                  className={`text-left text-xs p-2.5 rounded-lg border transition-all ${
                    selectedSampleId === s.id
                      ? 'bg-blue-600/15 border-blue-500 text-blue-200 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-[11px] text-slate-400">{s.authority}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tender RFP Text Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                RFP Document Text (With Page Breaks):
              </label>
              <span className="text-[11px] text-slate-500">
                {rfpText.length} chars | ~{Math.ceil(rfpText.length / 1500)} pages
              </span>
            </div>
            <textarea
              value={rfpText}
              onChange={(e) => setRfpText(e.target.value)}
              rows={9}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              placeholder="Paste tender notice (NIT) or RFP text with --- Page 1 --- dividers..."
            />
          </div>

          {/* Bidder / Contractor Qualification Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Contractor Fit Screener</h3>
              </div>
              <span className="text-[11px] text-slate-400">Pre-qualification gate check</span>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Company / Entity Name:</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">3-Yr Avg Turnover (INR):</label>
                <input
                  type="number"
                  value={annualTurnover}
                  onChange={(e) => setAnnualTurnover(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-blue-400 font-medium">{formatINR(annualTurnover)}</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Largest Single Work (INR):</label>
                <input
                  type="number"
                  value={singleLargestWork}
                  onChange={(e) => setSingleLargestWork(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-blue-400 font-medium">{formatINR(singleLargestWork)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bank Solvency (INR):</label>
                <input
                  type="number"
                  value={solvencyAmount}
                  onChange={(e) => setSolvencyAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-blue-400 font-medium">{formatINR(solvencyAmount)}</span>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-700/80 rounded-md p-2 hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={isMsme}
                    onChange={(e) => setIsMsme(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded bg-slate-800 border-slate-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">MSME / Udyam Registered</span>
                </label>
              </div>
            </div>

            {/* Document Readiness Checkboxes */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Available Bidder Attachments ({availableDocs.length}/{ALL_POSSIBLE_DOCS.length}):
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {ALL_POSSIBLE_DOCS.map(doc => (
                  <label
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`flex items-center gap-1.5 text-[11px] p-1.5 rounded border cursor-pointer select-none transition-all ${
                      availableDocs.includes(doc.id)
                        ? 'bg-blue-900/30 border-blue-500/40 text-blue-200'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={availableDocs.includes(doc.id)}
                      className="w-3 h-3 text-blue-500 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="truncate">{doc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !rfpText.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Clauses & Page Citations...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Run Full Tender Compliance Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Tender Intelligence & Screener Output */}
        <div className="lg:col-span-7 space-y-5">
          {!analysisResult ? (
            <div className="h-full bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">Ready to Analyze Tender RFP</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Click &quot;Run Full Tender Compliance Analysis&quot; to parse financial thresholds, technical experience rules, EMD exemptions, and document checklists with grounded page citations.
              </p>
            </div>
          ) : (
            <>
              {/* Screening Decision Banner */}
              {screeningResult && (
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
                  screeningResult.overall_status === 'ELIGIBLE'
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : screeningResult.overall_status === 'AT_RISK'
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {screeningResult.overall_status === 'ELIGIBLE' ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      ) : screeningResult.overall_status === 'AT_RISK' ? (
                        <AlertTriangle className="w-7 h-7 text-amber-400" />
                      ) : (
                        <XCircle className="w-7 h-7 text-rose-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${
                            screeningResult.overall_status === 'ELIGIBLE' ? 'text-emerald-400' :
                            screeningResult.overall_status === 'AT_RISK' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {screeningResult.overall_status === 'ELIGIBLE' && 'QUALIFIED TO BID'}
                            {screeningResult.overall_status === 'AT_RISK' && 'AT RISK (DOC SHORTFALL)'}
                            {screeningResult.overall_status === 'DISQUALIFIED' && 'CRITERIA NOT MET (DISQUALIFIED)'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-semibold">
                            {screeningResult.fit_score_percentage}% Fit Score
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium">
                          EMD Action: <span className="text-blue-300">{screeningResult.emd_action}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Document Readiness</div>
                      <div className="text-sm font-bold text-slate-200">{screeningResult.readiness_percentage}%</div>
                    </div>
                  </div>

                  {/* Gates Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
                    {screeningResult.gates.map((g, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold truncate text-slate-300">{g.gate_name}</span>
                          {g.passed ? (
                            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded">PASS</span>
                          ) : (
                            <span className="text-rose-400 font-bold text-[10px] bg-rose-950 px-1.5 py-0.2 rounded">FAIL</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Req: {g.required}</div>
                        <div className="text-[10px] text-slate-300">Act: {g.actual}</div>
                      </div>
                    ))}
                  </div>

                  {/* Missing Mandatory Documents Warning */}
                  {screeningResult.missing_mandatory_docs.length > 0 && (
                    <div className="bg-rose-950/70 border border-rose-800/80 p-2.5 rounded-lg text-xs text-rose-200">
                      <div className="font-semibold flex items-center gap-1.5 mb-1 text-rose-300">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Missing Mandatory Attachments ({screeningResult.missing_mandatory_docs.length}):
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-rose-300/90 space-y-0.5">
                        {screeningResult.missing_mandatory_docs.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Recommendations */}
                  {screeningResult.actionable_recommendations.length > 0 && (
                    <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-300">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        Actionable Bid Strategy Recommendations:
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                        {screeningResult.actionable_recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tender Metadata & Financial Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-mono bg-blue-900/40 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded">
                      {analysisResult.basic_info.tender_id}
                    </span>
                    <h2 className="text-sm font-bold text-slate-100 mt-1.5">
                      {analysisResult.basic_info.title_of_work}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Issuing Authority: <span className="text-slate-200 font-medium">{analysisResult.basic_info.issuing_authority}</span>
                    </p>
                  </div>
                  {analysisResult.basic_info.citation && (
                    <div className="text-[10px] bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded text-slate-300 max-w-[200px] text-right">
                      <div className="font-semibold text-blue-400">Page {analysisResult.basic_info.citation.page} Citation</div>
                      <div className="truncate text-slate-400">{analysisResult.basic_info.citation.excerpt}</div>
                    </div>
                  )}
                </div>

                {/* 4 Financial Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Value</span>
                    <div className="text-sm font-bold text-blue-400">
                      {formatINR(analysisResult.basic_info.estimated_cost_inr)}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">EMD / Bid Security</span>
                    <div className="text-sm font-bold text-indigo-400">
                      {formatINR(analysisResult.basic_info.emd_amount_inr)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {analysisResult.basic_info.emd_msme_exemption ? '✅ MSME Exempt' : '❌ No Exemption'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Min 3-Yr Turnover</span>
                    <div className="text-sm font-bold text-emerald-400">
                      {formatINR(analysisResult.financial_eligibility.min_average_turnover_inr)}
                    </div>
                    <span className="text-[10px] text-slate-400">UDIN Mandatory</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Bank Solvency</span>
                    <div className="text-sm font-bold text-amber-400">
                      {formatINR(analysisResult.financial_eligibility.solvency_certificate_inr)}
                    </div>
                  </div>
                </div>

                {/* Technical Criteria & Similar Work */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Technical Qualification Criteria:</span>
                    <span className="text-[11px] text-slate-400">
                      Joint Venture: {analysisResult.technical_eligibility.joint_venture_allowed ? '✅ Permitted' : '❌ Not Allowed'}
                    </span>
                  </div>
                  <div className="text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Similar Work Defined:</strong> {analysisResult.technical_eligibility.similar_work_definition}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                    <div>1 Work: <span className="text-blue-400 font-semibold">{formatINR(analysisResult.technical_eligibility.one_work_value_inr)}</span> (80%)</div>
                    <div>2 Works: <span className="text-blue-400 font-semibold">{formatINR(analysisResult.technical_eligibility.two_works_value_inr)}</span> (50%)</div>
                    <div>3 Works: <span className="text-blue-400 font-semibold">{formatINR(analysisResult.technical_eligibility.three_works_value_inr)}</span> (40%)</div>
                  </div>
                  {analysisResult.technical_eligibility.citation && (
                    <div className="text-[10px] text-slate-500 italic">
                      [Page {analysisResult.technical_eligibility.citation.page}] {analysisResult.technical_eligibility.citation.excerpt}
                    </div>
                  )}
                </div>

                {/* Mandatory Documents Checklist */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                    Mandatory Statutory Documents Checklist ({analysisResult.mandatory_checklist.length}):
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {analysisResult.mandatory_checklist.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 p-2 rounded-lg text-xs flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{item.doc_name}</div>
                          <div className="text-[11px] text-slate-400">{item.description}</div>
                        </div>
                        {item.citation && (
                          <span className="text-[10px] bg-slate-900 border border-slate-700/60 px-1.5 py-0.5 rounded text-blue-400 shrink-0 ml-2">
                            Page {item.citation.page}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Clauses Radar */}
                {analysisResult.risk_clauses.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                      Contractual Risk Flags & Penalties:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {analysisResult.risk_clauses.map((rc, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{rc.category}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              rc.severity === 'HIGH' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                            }`}>{rc.severity}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{rc.clause_summary}</p>
                          <div className="text-[10px] text-slate-500 mt-1 italic">
                            [Page {rc.citation.page}] {rc.citation.excerpt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 bg-slate-900/40 text-center text-xs text-slate-500">
        TenderLens Public Procurement Intelligence • Automated Page Citation Grounding & Eligibility Screener
      </footer>
    </div>
  );
}
