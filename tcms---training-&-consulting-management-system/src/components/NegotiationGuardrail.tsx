import React from 'react';
import { UserRole, ProjectOpportunity } from '../types';
import { formatCurrency, formatPercent, getApprovalRequirement } from '../utils/calculator';
import { Shield, Sparkles, AlertOctagon, CheckCircle2, Lock, ArrowRight, XCircle, Percent } from 'lucide-react';

interface NegotiationGuardrailProps {
  project: ProjectOpportunity;
  activeRole: UserRole;
  onDiscountChange: (discountPercent: number) => void;
  onSubmitForReview: () => void;
  onVerifyByChecker: () => void;
  onApproveByExecutive: (note: string) => void;
  onRejectProposal: (reason: string) => void;
  onTriggerAiOptimizer: () => void;
  isAiLoading: boolean;
}

export const NegotiationGuardrail: React.FC<NegotiationGuardrailProps> = ({
  project,
  activeRole,
  onDiscountChange,
  onSubmitForReview,
  onVerifyByChecker,
  onApproveByExecutive,
  onRejectProposal,
  onTriggerAiOptimizer,
  isAiLoading,
}) => {
  const approvalRule = getApprovalRequirement(project.netMarginPercent);
  const isRedLocked = project.netMarginPercent < 20;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-teal-800/40 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-xs border border-white/20 shrink-0">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-xs">
              Batas Keamanan Margin &amp; Negosiasi Diskon
            </h2>
            <p className="text-xs text-teal-100 font-medium mt-0.5">
              Simulasi guardrail diskon komersial (Target Net Margin ≥ 30%)
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Col: Discount Slider & Commercial Pricing (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Interactive Discount Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
                <Percent className="w-4 h-4 text-teal-700" />
                <span>Simulasi Diskon Negosiasi Klien</span>
              </label>
              <span className="text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                Diskon {project.discountPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="35"
              step="1"
              disabled={activeRole !== 'konseptor' && activeRole !== 'penyetuju'}
              value={project.discountPercent}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-teal-700 disabled:opacity-50"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1 font-medium">
              <span>0% (Normal)</span>
              <span>5% (Auto)</span>
              <span>15% (VP Approval)</span>
              <span>25%+ (CEO Lock)</span>
            </div>
          </div>

          {/* Pricing Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Modal Proyek</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 block mt-1">
                {formatCurrency(project.totalProjectCost)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Direct HPP + Presales</span>
            </div>

            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200">
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Harga Normal</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-teal-900 block mt-1">
                {formatCurrency(project.normalSellingPrice)}
              </span>
              <span className="text-[10px] text-teal-700 block mt-0.5 font-medium">Target Gross {project.targetGrossMarginPercent}%</span>
            </div>

            <div className={`p-3 rounded-xl border ${
              project.discountPercent > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Harga Kesepakatan</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 block mt-1">
                {formatCurrency(project.actualSellingPrice)}
              </span>
              <span className="text-[10px] font-medium text-slate-600 block mt-0.5">
                {project.discountPercent > 0 ? `Setelah Diskon ${project.discountPercent}%` : 'Sebelum PPN'}
              </span>
            </div>

          </div>

          {/* Dual Margin Visibility Box */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-teal-900/5 rounded-xl border border-teal-200/80">
            <div className="border-r border-teal-200/80 pr-3">
              <span className="text-[10px] text-teal-900 font-bold uppercase block">
                Gross Margin
              </span>
              <span className="text-lg font-bold text-teal-800 font-mono mt-0.5 block">
                {formatPercent(project.grossMarginPercent)}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-0.5 block font-mono">
                Laba Kotor: {formatCurrency(project.grossProfit)}
              </span>
            </div>

            <div className="pl-3">
              <span className="text-[10px] text-slate-700 font-bold uppercase block">
                Net Margin (Bersih)
              </span>
              <span className={`text-lg font-bold font-mono mt-0.5 block ${
                project.netMarginPercent >= 30 ? 'text-emerald-700' : project.netMarginPercent >= 20 ? 'text-amber-700' : 'text-red-700'
              }`}>
                {formatPercent(project.netMarginPercent)}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-0.5 block font-mono">
                Laba Bersih: {formatCurrency(project.netProfit)}
              </span>
            </div>
          </div>

        </div>

        {/* Right Col: Approval Matrix Status & Escalation Lock (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Status Otorisasi</span>
              <span className={`inline-flex items-center justify-center py-0.5 px-2.5 rounded font-bold text-[10px] uppercase border ${approvalRule.badgeClass}`}>
                {approvalRule.level}
              </span>
            </div>

            {/* Threshold Explanation Indicator */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block">Persyaratan Otorisasi Diskon:</span>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  {approvalRule.description}
                </p>
              </div>

              {/* Threshold Progress Bar */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Net Margin Progress</span>
                  <span className="font-mono">{project.netMarginPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-500 w-[20%]" title="Kritis (<20%)"></div>
                  <div className="h-full bg-amber-400 w-[10%]" title="Peringatan (20-30%)"></div>
                  <div className="h-full bg-emerald-500 flex-1" title="Aman (>=30%)"></div>
                </div>
              </div>

              {/* Critical Alert Banner if Red */}
              {isRedLocked && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg flex items-start space-x-2">
                  <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs block">Margin di Bawah Batas Aman</span>
                    <p className="text-[11px] text-red-800 mt-0.5">
                      Margin bersih ({project.netMarginPercent.toFixed(1)}%) di bawah 20%. Proposal membutuhkan otorisasi khusus.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Action Buttons for Current Role */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
            
            {activeRole === 'super_admin' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-teal-800 uppercase bg-teal-50 p-1.5 rounded border border-teal-200 text-center">
                  Otoritas Super Admin
                </div>
                <button
                  onClick={() => onApproveByExecutive('Otorisasi Penuh Super Admin: RAP v1.0 Disetujui & Dikunci')}
                  className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Setujui Penawaran &amp; Kunci RAP</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onVerifyByChecker}
                    className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verifikasi POS HPP</span>
                  </button>
                  <button
                    onClick={() => onRejectProposal('Ditolak oleh Super Admin untuk penyesuaian ulang parameter margin.')}
                    className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Tolak Proposal</span>
                  </button>
                </div>
              </div>
            )}

            {activeRole === 'administrator' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-teal-800 uppercase bg-teal-50 p-1.5 rounded border border-teal-200 text-center">
                  Otoritas Administrator
                </div>
                <button
                  onClick={onVerifyByChecker}
                  className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verifikasi Pos Biaya (Admin)</span>
                </button>
                <button
                  onClick={() => onRejectProposal('Catatan Administrator: Penyesuaian pos biaya diperlukan sebelum diserahkan ke Penyetuju.')}
                  className="w-full py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Minta Revisi Estimator</span>
                </button>
              </div>
            )}

            {activeRole === 'konseptor' && (
              <button
                onClick={onSubmitForReview}
                className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
              >
                <span>Ajukan Proposal ke Pemeriksa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {activeRole === 'pemeriksa' && (
              <button
                onClick={onVerifyByChecker}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifikasi HPP &amp; Teruskan</span>
              </button>
            )}

            {activeRole === 'penyetuju' && (
              <div className="space-y-2">
                <button
                  onClick={() => onApproveByExecutive('Disetujui oleh Penyetuju & RAP v1.0 Dikunci')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Setujui Penawaran &amp; Kunci RAP</span>
                </button>

                <button
                  onClick={() => onRejectProposal('Margin terlalu kecil. Minta penyesuaian scope terlebih dahulu.')}
                  className="w-full py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Tolak &amp; Minta Revisi</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
