import React, { useState } from 'react';
import { ApprovalQueueItem } from '../types';
import { APPROVAL_QUEUE_ITEMS } from '../data/initialData';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { NavigationTab } from './StarOfficeSidebar';

interface ApprovalQueueViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({ onNavigateTab }) => {
  const [items, setItems] = useState<ApprovalQueueItem[]>(APPROVAL_QUEUE_ITEMS);
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filters = [
    'Semua',
    'Margin Guardrail (Diskon)',
    'Verifikasi POS HPP',
    'Penguncian RAP v1.0',
    'Rilis PO Vendor',
    'SLA Kontrak Klien',
  ];

  const filtered = items.filter((item) => {
    if (selectedFilter === 'Semua') return true;
    return item.type === selectedFilter;
  });

  const handleApprove = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    showToast(`Otorisasi disetujui: "${title}" telah diverifikasi.`);
  };

  const handleReject = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Rejected' } : item))
    );
    showToast(`Pengajuan ditolak: "${title}" dikembalikan ke pemohon.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingCount = items.filter((i) => i.status === 'Pending').length;

  return (
    <div className="space-y-5 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Ruang Otorisasi &amp; Antrean Persetujuan TCMS
            </h1>
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-xs font-bold font-mono">
              {pendingCount} Tertunda
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Pusat kendali berjenjang 3 pihak untuk menjamin kepatuhan margin, batas diskon harga, dan integritas pengeluaran kas proyek.
          </p>
        </div>

        {/* Quick Tab Routing Shortcuts */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('estimator')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Review HPP
          </button>
          <button
            onClick={() => onNavigateTab('rap')}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            Otorisasi RAP
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              selectedFilter === f
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const isPending = item.status === 'Pending';
          const isApproved = item.status === 'Approved';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 shadow-2xs transition ${
                isPending
                  ? 'border-slate-200 hover:border-slate-300'
                  : isApproved
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Info */}
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.projectCode}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {item.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.urgentLevel === 'Tinggi'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Prioritas {item.urgentLevel}
                    </span>
                    <span className="text-xs text-slate-400">• {item.submittedAt}</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-600">{item.description}</p>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Pemohon: <strong className="text-slate-700 font-medium">{item.requestedBy}</strong> ({item.requestedRole})
                      </span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Klien: <strong className="text-slate-700 font-medium">{item.client}</strong></span>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex flex-col md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block md:text-right font-medium">
                      Nilai Transaksi
                    </span>
                    <span className="text-sm font-bold text-teal-800 font-mono block md:text-right">
                      Rp {item.impactAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Status & Actions */}
                  {isPending ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(item.id, item.title)}
                        className="px-2.5 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, item.title)}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                    </div>
                  ) : isApproved ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disetujui</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ditolak</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
