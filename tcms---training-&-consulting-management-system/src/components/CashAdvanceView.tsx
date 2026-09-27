import React, { useState } from 'react';
import { CashAdvance, UserRole } from '../types';
import { formatCurrency } from '../utils/calculator';
import {
  Wallet,
  Plus,
  CheckCircle,
  Clock,
  FileCheck,
  AlertCircle,
  Receipt,
  ArrowRight,
  TrendingDown,
  Building,
  User,
  Search,
  Filter,
} from 'lucide-react';

interface CashAdvanceViewProps {
  cashAdvances: CashAdvance[];
  activeRole: UserRole;
  onAddCashAdvance: (item: CashAdvance) => void;
  onUpdateStatus: (id: string, status: CashAdvance['status'], actualSpent?: number) => void;
}

export const CashAdvanceView: React.FC<CashAdvanceViewProps> = ({
  cashAdvances,
  activeRole,
  onAddCashAdvance,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CashAdvance['status']>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [settleModalItem, setSettleModalItem] = useState<CashAdvance | null>(null);
  const [settleActualAmount, setSettleActualAmount] = useState<number>(0);
  const [settleNotes, setSettleNotes] = useState<string>('');

  // New Kasbon Form State
  const [purpose, setPurpose] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number>(2000000);
  const [targetCategory, setTargetCategory] = useState('POS 02 (Konsumsi) & POS 04 (Logistik)');
  const [requestorName, setRequestorName] = useState('Budi Raharjo');
  const [requestorRole, setRequestorRole] = useState('Sales & Field Event Lead');

  const filteredItems = cashAdvances.filter((ca) => {
    const matchesSearch =
      ca.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.requestorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ca.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRequested = cashAdvances.reduce((acc, curr) => acc + curr.requestedAmount, 0);
  const totalApproved = cashAdvances.reduce((acc, curr) => acc + curr.approvedAmount, 0);
  const totalRealized = cashAdvances.reduce((acc, curr) => acc + curr.actualRealizedAmount, 0);
  const totalVarianceSettled = cashAdvances
    .filter((ca) => ca.status === 'Settled (Lunas / Selesai Rekonsiliasi)')
    .reduce((acc, curr) => acc + curr.varianceAmount, 0);

  const handleCreateKasbon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    const newKasbon: CashAdvance = {
      id: `ca-${Date.now()}`,
      code: `KASBON-2026-${Math.floor(100 + Math.random() * 900)}/LAP`,
      requestorName,
      requestorRole,
      purpose,
      targetPosCategory: targetCategory,
      requestedAmount,
      approvedAmount: requestedAmount,
      actualRealizedAmount: 0,
      varianceAmount: requestedAmount,
      status: 'Draft',
      requestDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      receiptNotes: 'Menunggu persetujuan pemeriksa/finance sebelum pencairan kas lapangan.',
    };

    onAddCashAdvance(newKasbon);
    setIsModalOpen(false);
    setPurpose('');
    setRequestedAmount(2000000);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalItem) return;

    onUpdateStatus(
      settleModalItem.id,
      'Settled (Lunas / Selesai Rekonsiliasi)',
      settleActualAmount
    );
    setSettleModalItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-50 text-teal-800 rounded-lg">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Kasbon Operasional Lapangan (Field Cash Advance)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Pencairan uang muka tim lapangan hari-H dan rekonsiliasi struk
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Kasbon</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
            Total Kasbon Diajukan
          </span>
          <p className="text-base font-bold font-mono text-slate-900">{formatCurrency(totalRequested)}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{cashAdvances.length} Pengajuan</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
            Dana Cair Disbursed
          </span>
          <p className="text-base font-bold font-mono text-teal-800">{formatCurrency(totalApproved)}</p>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">Uang muka tim lapangan</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
            Realisasi Struk Fisik
          </span>
          <p className="text-base font-bold font-mono text-emerald-800">{formatCurrency(totalRealized)}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Nota diaudit finance</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
            Sisa Dana Kembali
          </span>
          <p className="text-base font-bold font-mono text-amber-800">{formatCurrency(totalVarianceSettled)}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Disetor ke bendahara</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, pemohon, tujuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 focus:bg-white bg-slate-50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-teal-600 font-medium bg-slate-50"
          >
            <option value="All">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Approved - Disbursed">Approved - Disbursed</option>
            <option value="Settled (Lunas / Selesai Rekonsiliasi)">Settled (Lunas)</option>
          </select>
        </div>
      </div>

      {/* Cash Advance Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs italic">
            Tidak ada data kasbon operasional yang cocok dengan pencarian.
          </div>
        ) : (
          filteredItems.map((ca) => {
            const isSettled = ca.status === 'Settled (Lunas / Selesai Rekonsiliasi)';
            const isDisbursed = ca.status === 'Approved - Disbursed';

            return (
              <div
                key={ca.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition p-4 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {ca.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isSettled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isDisbursed
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {ca.status}
                    </span>
                    <span className="text-xs text-slate-400">{ca.requestDate}</span>
                  </div>

                  {/* Actions based on role and status */}
                  <div className="flex items-center space-x-2">
                    {ca.status === 'Draft' && (
                      <button
                        onClick={() => onUpdateStatus(ca.id, 'Approved - Disbursed')}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                      >
                        Setujui &amp; Cairkan
                      </button>
                    )}

                    {ca.status === 'Approved - Disbursed' && (
                      <button
                        onClick={() => {
                          setSettleModalItem(ca);
                          setSettleActualAmount(ca.approvedAmount);
                          setSettleNotes('');
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer flex items-center space-x-1"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Rekonsiliasi (Settle)</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Left Column: Purpose & Details */}
                  <div className="md:col-span-2 space-y-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800">{ca.purpose}</h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">{ca.requestorName}</span>
                        <span className="text-slate-400">({ca.requestorRole})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {ca.targetPosCategory}
                        </span>
                      </div>
                    </div>

                    {ca.receiptNotes && (
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p>{ca.receiptNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Financial Breakdown */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Uang Muka Diberikan:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(ca.approvedAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Realisasi Struk Fisik:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {formatCurrency(ca.actualRealizedAmount)}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-slate-700 font-bold">Selisih Kas / Sisa:</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          ca.varianceAmount > 0
                            ? 'text-amber-800'
                            : ca.varianceAmount < 0
                            ? 'text-rose-800'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatCurrency(ca.varianceAmount)}
                      </span>
                    </div>

                    {isSettled && (
                      <div className="text-[10px] text-emerald-800 font-medium text-right flex items-center justify-end space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Selesai ({ca.settlementDate})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Ajukan Kasbon Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-teal-200" />
                <span>Pengajuan Kasbon Lapangan Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateKasbon} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan &amp; Rincian Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Biaya Parkir & Konsumsi Lembur Hari-H"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-teal-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nominal Uang Muka (Rp)</label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alokasi Beban POS</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-teal-600 font-medium"
                  >
                    <option value="POS 02 (Konsumsi & Hospitality)">POS 02: Konsumsi &amp; Hospitality</option>
                    <option value="POS 03 (ATK, Kits & Materials)">POS 03: ATK &amp; Training Kit</option>
                    <option value="POS 04 (Venue, Hotel & Logistics)">POS 04: Venue &amp; Logistik</option>
                    <option value="POS 05 (Direct Overhead)">POS 05: Direct Overhead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Pemohon (PIC)</label>
                  <input
                    type="text"
                    required
                    value={requestorName}
                    onChange={(e) => setRequestorName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan Pemohon</label>
                  <input
                    type="text"
                    required
                    value={requestorRole}
                    onChange={(e) => setRequestorRole(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-teal-50/50 rounded-lg border border-teal-200 text-[11px] text-teal-900 leading-relaxed">
                <strong>Catatan Prosedural:</strong> Kasbon operasional wajib dipertanggungjawabkan (settle) selambat-lambatnya <strong>H+2 setelah pelatihan selesai</strong> beserta bukti nota asli / struk fisik.
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold shadow-2xs cursor-pointer"
                >
                  Kirim Pengajuan Kasbon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rekonsiliasi Struk (Settlement) */}
      {settleModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-teal-200" />
                <span>Rekonsiliasi Struk ({settleModalItem.code})</span>
              </h3>
              <button
                onClick={() => setSettleModalItem(null)}
                className="text-teal-200 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block">Tujuan Pengeluaran:</span>
                <p className="font-bold text-slate-800">{settleModalItem.purpose}</p>
                <div className="flex justify-between items-center text-slate-600 pt-1 font-mono">
                  <span>Pagu Uang Muka:</span>
                  <span className="font-bold">{formatCurrency(settleModalItem.approvedAmount)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Total Nominal Struk Terlampir (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={settleActualAmount}
                  onChange={(e) => setSettleActualAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 focus:outline-teal-600"
                />
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center">
                <span className="text-amber-900 font-bold">
                  {settleModalItem.approvedAmount - settleActualAmount >= 0
                    ? 'Sisa Uang Kembali:'
                    : 'Kekurangan (Reimburse):'}
                </span>
                <span className="font-mono font-bold text-xs text-amber-900">
                  {formatCurrency(Math.abs(settleModalItem.approvedAmount - settleActualAmount))}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Struk / Berita Acara</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Nota parkir dan struk porter hotel telah diverifikasi..."
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSettleModalItem(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold shadow-2xs cursor-pointer"
                >
                  Tutup Kasbon (Settle)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
