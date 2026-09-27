import React, { useState } from 'react';
import { ProjectOpportunity, PurchaseOrder } from '../types';
import { formatCurrency } from '../utils/calculator';
import { BarChart3, TrendingUp, AlertTriangle, Plus, ShieldCheck, DollarSign, Download, FileText } from 'lucide-react';
import { ExecutionReportPdfModal } from './ExecutionReportPdfModal';

interface ExecutionTrackerProps {
  project: ProjectOpportunity;
  purchaseOrders: PurchaseOrder[];
  onAddActualSpend: (poId: string, amount: number) => void;
}

export const ExecutionTracker: React.FC<ExecutionTrackerProps> = ({
  project,
  purchaseOrders,
  onAddActualSpend,
}) => {
  const [selectedPoForExpense, setSelectedPoForExpense] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(1000000);
  const [expenseNote, setExpenseNote] = useState<string>('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReportPdfModalOpen, setIsReportPdfModalOpen] = useState(false);

  const totalAllocated = purchaseOrders.reduce((sum, po) => sum + po.allocatedAmount, 0);
  const totalSpent = purchaseOrders.reduce((sum, po) => sum + po.actualSpentAmount, 0);
  const remainingBudget = totalAllocated - totalSpent;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForExpense || expenseAmount <= 0) return;

    onAddActualSpend(selectedPoForExpense, expenseAmount);
    setIsExpenseModalOpen(false);
    setExpenseAmount(1000000);
    setExpenseNote('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-slate-200 bg-teal-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-teal-700 rounded-xl border border-teal-600 text-teal-100 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Pemantauan Realisasi Belanja &amp; Varians Anggaran
            </h2>
            <p className="text-xs text-teal-100/80 font-medium mt-0.5">
              Pantau penggunaan anggaran aktual dibandingkan plafon RAP v1.0 yang telah dikunci secara real-time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportPdfModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs border border-slate-700 transition cursor-pointer"
            title="Preview & Unduh Laporan Realisasi Anggaran PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Unduh Laporan PDF</span>
          </button>

          <button
            onClick={() => {
              if (purchaseOrders.length > 0) {
                setSelectedPoForExpense(purchaseOrders[0].id);
                setIsExpenseModalOpen(true);
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs border border-teal-600 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-200" />
            <span>Catat Realisasi Belanja</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Anggaran RAP Terkunci</span>
            <span className="text-lg font-bold font-mono text-slate-800 mt-1 block">
              {formatCurrency(totalAllocated)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Realisasi Belanja</span>
            <span className="text-lg font-bold font-mono text-slate-800 mt-1 block">
              {formatCurrency(totalSpent)}
            </span>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs ${
            remainingBudget < 0 ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-700 block">Sisa Anggaran Proyek</span>
            <span className={`text-lg font-bold font-mono mt-1 block ${
              remainingBudget < 0 ? 'text-red-700' : 'text-emerald-800'
            }`}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
        </div>

        {/* Real-time Variance Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Pos &amp; Kategori Belanja Vendor</th>
                <th className="p-3 text-right">Budget RAP Terkunci</th>
                <th className="p-3 text-right">Realisasi Belanja</th>
                <th className="p-3 text-right">Sisa Anggaran</th>
                <th className="p-3 text-center w-40">Persentase Pakai</th>
                <th className="p-3 text-center">Indikator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {purchaseOrders.map((po) => {
                const percentUsed = po.allocatedAmount > 0 ? (po.actualSpentAmount / po.allocatedAmount) * 100 : 0;
                const isOver = po.actualSpentAmount > po.allocatedAmount;

                return (
                  <tr key={po.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{po.vendorCategory}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{po.vendorName} ({po.posCode})</span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(po.allocatedAmount)}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(po.actualSpentAmount)}
                    </td>

                    <td className={`p-3 text-right font-mono font-bold ${
                      isOver ? 'text-red-600' : 'text-emerald-700'
                    }`}>
                      {formatCurrency(po.allocatedAmount - po.actualSpentAmount)}
                    </td>

                    <td className="p-3 text-center">
                      <div className="w-full bg-slate-200 rounded h-2.5 overflow-hidden">
                        <div
                          className={`h-full ${isOver ? 'bg-red-600' : percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold block mt-0.5">{percentUsed.toFixed(1)}%</span>
                    </td>

                    <td className="p-3 text-center">
                      {isOver ? (
                        <span className="inline-flex items-center justify-center space-x-1 px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[9.5px] uppercase border border-red-300 leading-none">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>Overbudget</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9.5px] uppercase border border-emerald-300 leading-none">
                          Aman
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Input Realisasi / Claim Reimbursement</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Alokasi PO Vendor</label>
                <select
                  value={selectedPoForExpense}
                  onChange={(e) => setSelectedPoForExpense(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.vendorCategory} - {po.vendorName} ({formatCurrency(po.allocatedAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nominal Belanja Realisasi (Rp)</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Nota / Kuitansi</label>
                <input
                  type="text"
                  placeholder="Misal: Biaya ekstra bagasi penerbangan tim"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Simpan Realisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execution Report PDF Modal */}
      <ExecutionReportPdfModal
        isOpen={isReportPdfModalOpen}
        onClose={() => setIsReportPdfModalOpen(false)}
        project={project}
        purchaseOrders={purchaseOrders}
      />

    </div>
  );
};
