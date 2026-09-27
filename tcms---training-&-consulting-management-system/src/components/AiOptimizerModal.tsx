import React from 'react';
import { AiRecommendation } from '../types';
import { formatCurrency } from '../utils/calculator';
import { Sparkles, Lightbulb, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AiOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: AiRecommendation | null;
  isLoading: boolean;
  onApplyRecommendation?: (rec: any) => void;
}

export const AiOptimizerModal: React.FC<AiOptimizerModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  isLoading,
  onApplyRecommendation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 text-amber-400 shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide text-white">AI Scope & Margin Optimizer (Gemini)</h3>
              <p className="text-xs text-slate-300 font-medium">
                Rekomendasi rasionalisasi scope tanpa merusak kualitas utama pelatihan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-black text-slate-900">Gemini AI sedang menganalisis rincian 6 kategori HPP...</p>
              <p className="text-slate-500 text-[11px] font-medium">Membandingkan efisiensi konsumsi, venue, modul cetak, dan honor ahli.</p>
            </div>
          ) : recommendation ? (
            <>
              {/* Summary Box */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 flex items-start space-x-3 shadow-xs">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-slate-900 block text-xs uppercase tracking-wide">Analisis Strategis Gemini AI:</span>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed font-medium">
                    {recommendation.summary}
                  </p>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                <span className="font-black text-slate-800 uppercase tracking-wider block text-[11px]">
                  Rekomendasi Tindakan Rasionalisasi Biaya:
                </span>

                {recommendation.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-slate-300 hover:border-slate-500 transition space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-xs">{rec.category}</span>
                      <span className="inline-flex items-center justify-center font-black font-mono text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300 text-xs leading-none">
                        Potensi Hemat ~ {formatCurrency(rec.estimatedSavings)}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium leading-relaxed">
                      {rec.action}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Dampak Kualitas: <strong className="text-slate-800">{rec.impactOnQuality}</strong></span>
                      {onApplyRecommendation && (
                        <button
                          onClick={() => onApplyRecommendation(rec)}
                          className="text-slate-900 font-black hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Terapkan Penyesuaian</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-slate-500 font-medium">
              Gagal memuat rekomendasi AI. Pastikan GEMINI_API_KEY sudah dikonfigurasi.
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-300 flex justify-between items-center text-xs">
          <span className="text-slate-600 font-medium">PT CIPTA PERDANA ENTERPRISE — TCMS Guardrail Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-black rounded-lg hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            Tutup Dialog
          </button>
        </div>

      </div>
    </div>
  );
};
