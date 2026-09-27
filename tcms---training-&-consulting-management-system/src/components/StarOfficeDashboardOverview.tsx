import React from 'react';
import { ProjectOpportunity, Employee, UserRole, CostItem, CostCategoryKey } from '../types';
import { NavigationTab } from './StarOfficeSidebar';
import {
  LayoutGrid,
  ShieldCheck,
  Calculator,
  Lock,
  BarChart3,
  Users,
  ChevronRight,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Award,
  CheckCircle2,
  Building2,
  FileSignature,
  PieChart,
  DollarSign,
  Wallet,
  AlertTriangle,
  Sliders,
  FileSpreadsheet,
  Package,
  Utensils,
  FileSearch,
  Leaf,
  ShieldAlert,
  Scale,
  TreePine,
  Activity,
  HeartHandshake,
  BookOpen,
  Target,
  Layers,
  Coins,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { COST_CATEGORIES } from '../data/initialData';

interface StarOfficeDashboardOverviewProps {
  project: ProjectOpportunity;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onTriggerAiOptimizer: () => void;
  currentEmployee: Employee;
  activeRole?: UserRole;
  costItems?: CostItem[];
  layoutTheme?: 'classic' | 'modern' | 'flat';
}

export const StarOfficeDashboardOverview: React.FC<StarOfficeDashboardOverviewProps> = ({
  project,
  activeTab,
  onSelectTab,
  onTriggerAiOptimizer,
  currentEmployee,
  costItems = [],
  layoutTheme = 'classic',
}) => {
  const isDashboardView = activeTab === 'dashboard';
  const [dashboardPerspective, setDashboardPerspective] = React.useState<'financial' | 'sustainability'>('financial');

  // Calculate POS breakdown totals
  const posTotals = costItems.reduce<Record<CostCategoryKey, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.totalCost;
      return acc;
    },
    {
      presales: 0,
      labor: 0,
      hospitality: 0,
      materials: 0,
      venue: 0,
      overhead: 0,
    }
  );

  const totalCogs = project.totalProjectCost > 0 ? project.totalProjectCost : 1;
  const paxCount = project.headcount.totalHeadcount > 0 ? project.headcount.totalHeadcount : 35;
  const hppPerPax = Math.round(project.totalProjectCost / paxCount);
  const sellingPerPax = Math.round(project.actualSellingPrice / paxCount);
  const profitPerPax = sellingPerPax - hppPerPax;
  const grossProfitPerPax = Math.round(project.grossProfit / paxCount);
  
  // Break-even pax: when sellingPerPax is zero or less, break-even cannot be calculated
  const breakEvenPax = sellingPerPax > 0 ? Math.ceil(project.totalProjectCost / sellingPerPax) : 0;
  const breakEvenRatio = paxCount > 0 ? Math.min(100, Math.round((breakEvenPax / paxCount) * 100)) : 0;

  // Financial structure percentages
  const sellingPrice = project.actualSellingPrice > 0 ? project.actualSellingPrice : 1;
  const cogsPercent = (project.totalProjectCost / sellingPrice) * 100;
  const taxAndOverheadAmount = Math.max(0, project.grossProfit - project.netProfit);
  const taxAndOverheadPercent = (taxAndOverheadAmount / sellingPrice) * 100;
  const netMarginPercent = (project.netProfit / sellingPrice) * 100;

  // Health assessment
  const isHealthyMargin = project.grossMarginPercent >= 35;
  const isWarningMargin = project.grossMarginPercent >= 25 && project.grossMarginPercent < 35;
  const isCriticalMargin = project.grossMarginPercent < 25;

  const healthStatus = isHealthyMargin
    ? {
        label: 'Sangat Sehat & Optimal',
        tag: 'OPTIMAL (≥ 35%)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dotClass: 'bg-emerald-500 ring-emerald-200',
        textColor: 'text-emerald-700',
        desc: 'Margin kotor melampaui target standar 35.0%',
      }
    : isWarningMargin
    ? {
        label: 'Perlu Pengawasan (Waspada)',
        tag: 'WASPADA (25-34%)',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
        dotClass: 'bg-amber-500 ring-amber-200',
        textColor: 'text-amber-700',
        desc: 'Margin berada di zona negosiasi minimum (25% - 34.9%)',
      }
    : {
        label: 'Kritis / Di Bawah Batas Aman',
        tag: 'KRITIS (< 25%)',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
        dotClass: 'bg-rose-500 ring-rose-200',
        textColor: 'text-rose-700',
        desc: 'Margin kotor di bawah ambang batas minimal korporat (< 25%)',
      };

  const posColors: Record<CostCategoryKey, { bg: string; text: string; bar: string }> = {
    presales: { bg: 'bg-sky-50 text-sky-700 border-sky-200', text: 'text-sky-700', bar: 'bg-sky-500' },
    labor: { bg: 'bg-teal-50 text-teal-700 border-teal-200', text: 'text-teal-700', bar: 'bg-teal-500' },
    hospitality: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
    materials: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', bar: 'bg-indigo-500' },
    venue: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    overhead: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', bar: 'bg-purple-500' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Header Banner */}
      {isDashboardView ? (
        layoutTheme === 'modern' ? (
          <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/25 p-6 text-slate-800 shadow-2xs border border-slate-200/60 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-700 shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-lg border border-teal-300/30">
                      DASHBOARD FINANSIAL
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-bold">
                      Ref: {project.id.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                    Analisis Finansial, HPP &amp; Struktur Margin Proyek
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {project.name} • Klien: <strong className="text-slate-800">{project.clientName}</strong> • {paxCount} Pax
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onSelectTab('estimator')}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-3xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Buka Kalkulator HPP</span>
                </button>
                <button
                  onClick={() => onSelectTab('negotiation')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-3xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Simulasi BAFO</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-900 to-slate-800 p-6 text-white shadow-xs border border-teal-900/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-13 h-13 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 bg-teal-800/80 px-2 py-0.5 rounded border border-teal-600/40">
                      DASHBOARD FINANSIAL &amp; MARGIN
                    </span>
                    <span className="text-xs text-teal-200/90 font-mono font-bold">
                      Ref: {project.id.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                    Analisis Finansial, HPP &amp; Struktur Margin Proyek
                  </h1>
                  <p className="text-xs text-teal-100/90 font-medium">
                    {project.name} • Klien: <strong className="text-white">{project.clientName}</strong> • {paxCount} Pax
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onSelectTab('estimator')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Buka Kalkulator HPP</span>
                </button>
                <button
                  onClick={() => onSelectTab('negotiation')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-200 border border-teal-600/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Simulasi BAFO</span>
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        layoutTheme === 'modern' ? (
          <div className="rounded-3xl bg-gradient-to-br from-teal-50/70 via-slate-50 to-emerald-50/60 p-6 text-slate-800 shadow-2xs border border-teal-100/50 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative shrink-0">
                  {currentEmployee.avatarUrl ? (
                    <img
                      src={currentEmployee.avatarUrl}
                      alt={currentEmployee.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm animate-fade-in"
                    />
                  ) : (
                    <div
                      className={`w-13 h-13 rounded-2xl font-black text-base flex items-center justify-center border-2 border-white shadow-sm ${currentEmployee.avatarBg}`}
                    >
                      {currentEmployee.avatarText}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-lg border border-teal-300/30">
                      STAR TCMS ENTERPRISE
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">PT CIPTA PERDANA ENTERPRISE</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                    Selamat Datang, {currentEmployee.name}
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Pusat Tata Kelola Proyek Pelatihan &amp; Jasa Konsultasi — Standar RAP &amp; HPP
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 p-6 text-white shadow-xs border border-teal-900/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative shrink-0">
                  {currentEmployee.avatarUrl ? (
                    <img
                      src={currentEmployee.avatarUrl}
                      alt={currentEmployee.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-xs"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-full font-bold text-base flex items-center justify-center border-2 border-white/80 shadow-xs ${currentEmployee.avatarBg}`}
                    >
                      {currentEmployee.avatarText}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-teal-900" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 bg-teal-900/60 px-2 py-0.5 rounded border border-teal-600/40">
                      STAR TCMS ENTERPRISE
                    </span>
                    <span className="text-xs text-teal-100 font-medium">PT CIPTA PERDANA ENTERPRISE</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                    Selamat Datang, {currentEmployee.name}
                  </h1>
                  <p className="text-xs text-teal-100/90 font-medium">
                    Pusat Tata Kelola Proyek Pelatihan &amp; Jasa Konsultasi — Standar RAP &amp; HPP
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* KARTU RINGKASAN EKSEKUTIF FINANSIAL & KESEHATAN PROYEK */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 sm:p-7 space-y-6 transition-all duration-300">
        {/* Header Ringkasan Eksekutif */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Ringkasan Eksekutif Finansial
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Kesehatan Finansial &amp; Struktur Margin Proyek
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 shadow-2xs ${healthStatus.badgeClass}`}>
              <span className={`w-2.5 h-2.5 rounded-full ring-4 animate-pulse ${healthStatus.dotClass}`} />
              <span className="text-xs font-bold font-mono">
                {healthStatus.tag}
              </span>
              <span className="text-[11px] font-medium hidden md:inline">
                ({healthStatus.label})
              </span>
            </div>
          </div>
        </div>

        {/* 3 Kartu Pilar Utama: Total Biaya, Margin Kotor, Proyeksi Keuntungan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilar 1: Total Biaya (COGS / HPP) */}
          <div className="p-6 transition-all duration-300 flex flex-col justify-between space-y-4 border rounded-3xl border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 shadow-xs hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span>Total Biaya Pokok (HPP)</span>
                </span>
                <span className="text-[11px] font-bold font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cogsPercent.toFixed(1)}% dari Selling
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
                  {formatCurrency(project.totalProjectCost)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Alokasi 6 POS Anggaran Pokok (POS 00 – POS 05)
                </p>
              </div>

              {/* Mini visual ratio bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10.5px] text-slate-500 font-medium">
                  <span>Rasio Beban Modal</span>
                  <span className="font-mono font-bold text-slate-700">{formatCurrency(hppPerPax)} / Pax</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, cogsPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Kapasitas: <strong>{paxCount} Pax</strong></span>
              <button
                onClick={() => onSelectTab('estimator')}
                className="text-teal-700 hover:text-teal-800 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Rincian POS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pilar 2: Margin Kotor (Gross Margin & Profit) */}
          <div className="p-6 transition-all duration-300 flex flex-col justify-between space-y-4 border rounded-3xl border-teal-100 bg-teal-50/10 hover:bg-teal-50/30 shadow-xs hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-700" />
                  <span>Margin Kotor (Gross)</span>
                </span>
                <span className="text-xs font-bold font-mono text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-300">
                  {formatPercent(project.grossMarginPercent)}
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-teal-900 tracking-tight">
                  {formatCurrency(project.grossProfit)}
                </div>
                <p className="text-xs text-teal-800/80 mt-1">
                  Gross Profit Margin sebelum beban kantor &amp; pajak
                </p>
              </div>

              {/* Visual Margin vs Guardrail Target (35%) */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10.5px] text-teal-900 font-medium">
                  <span>Target Guardrail (≥ 35.0%)</span>
                  <span className="font-mono font-bold text-teal-800">{formatCurrency(grossProfitPerPax)} / Pax</span>
                </div>
                <div className="relative w-full h-2 bg-teal-200/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isHealthyMargin ? 'bg-teal-600' : isWarningMargin ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, project.grossMarginPercent)}%` }}
                  />
                  {/* Target 35% marker line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                    style={{ left: '35%' }}
                    title="Batas Minimum Guardrail: 35.0%"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-[11px]">
              <span className="text-teal-900 font-medium">
                {isHealthyMargin ? '✓ Memenuhi Guardrail' : '⚠️ Di Bawah Standar'}
              </span>
              <button
                onClick={() => onSelectTab('negotiation')}
                className="text-teal-800 hover:text-teal-950 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Guardrail Diskon</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pilar 3: Proyeksi Keuntungan (Net Profit & Return) */}
          <div className="p-6 transition-all duration-300 flex flex-col justify-between space-y-4 border rounded-3xl border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/30 shadow-xs hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Proyeksi Laba Bersih</span>
                </span>
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {formatPercent(project.netMarginPercent)} Net
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 tracking-tight">
                  {formatCurrency(project.netProfit)}
                </div>
                <p className="text-xs text-emerald-800/80 mt-1">
                  Hasil bersih setelah pajak &amp; alokasi beban operasional
                </p>
              </div>

              {/* Visual Break-Even Progress */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10.5px] text-emerald-900 font-medium">
                  <span>Titik Impas (BEP): <strong>{breakEvenPax} Pax</strong> ({breakEvenRatio}%)</span>
                  <span className="font-mono font-bold text-emerald-800">{formatCurrency(profitPerPax)} / Pax</span>
                </div>
                <div className="w-full h-2 bg-emerald-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, 100 - breakEvenRatio))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
              <span className="text-emerald-900 font-medium">
                Status: <strong>{project.marginStatus}</strong>
              </span>
              <button
                onClick={() => onSelectTab('rap')}
                className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <span>Otorisasi RAP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Komposisi Alokasi Finansial Kontrak */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">
                Distribusi Visual Alokasi Nilai Kontrak Penawaran
              </span>
            </div>
            <div className="text-xs font-mono text-slate-700">
              Nilai Penawaran (Selling): <strong className="text-slate-900">{formatCurrency(project.actualSellingPrice)}</strong>
              {project.discountPercent > 0 && (
                <span className="text-rose-600 font-bold ml-1.5">(Diskon {project.discountPercent}%)</span>
              )}
            </div>
          </div>

          {/* Stacked Bar Distribution */}
          <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.min(100, cogsPercent)}%` }}
              className="bg-slate-600 h-full transition-all duration-500"
              title={`Total Biaya Pokok (HPP): ${formatCurrency(project.totalProjectCost)} (${cogsPercent.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.min(100, taxAndOverheadPercent)}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Pajak & Biaya Kantor Pusat: ${formatCurrency(taxAndOverheadAmount)} (${taxAndOverheadPercent.toFixed(1)}%)`}
            />
            <div
              style={{ width: `${Math.min(100, netMarginPercent)}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Proyeksi Laba Bersih: ${formatCurrency(project.netProfit)} (${netMarginPercent.toFixed(1)}%)`}
            />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
              <span>Biaya Pokok (HPP): <strong>{formatCurrency(project.totalProjectCost)}</strong> ({cogsPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>Pajak &amp; Head Office: <strong>{formatCurrency(taxAndOverheadAmount)}</strong> ({taxAndOverheadPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>Proyeksi Laba Bersih: <strong>{formatCurrency(project.netProfit)}</strong> ({netMarginPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Switcher */}
      {isDashboardView && (
        <div className="flex border-b border-slate-200 gap-6 mb-2">
          <button
            onClick={() => setDashboardPerspective('financial')}
            className={`pb-3 text-xs font-bold transition-all relative px-1 cursor-pointer flex items-center space-x-2 ${
              dashboardPerspective === 'financial'
                ? 'text-teal-700 font-extrabold border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analisis Finansial &amp; Margin Proyek</span>
          </button>
          <button
            onClick={() => setDashboardPerspective('sustainability')}
            className={`pb-3 text-xs font-bold transition-all relative px-1 cursor-pointer flex items-center space-x-2 ${
              dashboardPerspective === 'sustainability'
                ? 'text-teal-700 font-extrabold border-b-2 border-teal-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Tata Kelola &amp; Keberlanjutan Enterprise (ESG)</span>
          </button>
        </div>
      )}

      {/* DASHBOARD VIEW KHUSUS: Analitik Komposisi POS & Unit Economics */}
      {isDashboardView && dashboardPerspective === 'financial' && (
        <div className="space-y-5 animate-fade-in">
          {/* Komposisi Biaya Modal 5 POS HPP */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-teal-700" />
                  <span>Komposisi Alokasi Modal HPP (POS 00 – POS 05)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi proporsi anggaran pokok proyek berdasarkan kelompok pengadaan
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                Total COGS: {formatCurrency(project.totalProjectCost)}
              </span>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {COST_CATEGORIES.map((cat) => {
                const amount = posTotals[cat.key] || 0;
                const percent = Math.max(0, (amount / totalCogs) * 100);
                if (percent <= 0) return null;
                return (
                  <div
                    key={cat.key}
                    style={{ width: `${percent}%` }}
                    className={`${posColors[cat.key]?.bar || 'bg-teal-500'} h-full transition-all duration-500`}
                    title={`${cat.posCode} (${cat.label}): ${formatCurrency(amount)} (${percent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Grid 6 POS Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {COST_CATEGORIES.map((cat) => {
                const amount = posTotals[cat.key] || 0;
                const percent = totalCogs > 0 ? (amount / totalCogs) * 100 : 0;
                const style = posColors[cat.key] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-700', bar: 'bg-slate-500' };

                return (
                  <div key={cat.key} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${style.bg}`}>
                        {cat.posCode}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">
                      {cat.label}
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                      {formatCurrency(amount)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2 Kolom: Waterfall Profitabilitas & Unit Economics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Waterfall Finansial (7 Kolom) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Waterfall Pembentukan Margin &amp; Profitabilitas</span>
              </h3>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/80">
                  <div className="text-xs font-bold text-teal-950">
                    Nilai Penawaran / Selling Price (100%)
                  </div>
                  <div className="text-xs font-bold font-mono text-teal-800">
                    {formatCurrency(project.actualSellingPrice)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-200/80">
                  <div className="text-xs font-medium text-rose-900">
                    (-) Biaya Modal HPP (POS 00 - POS 05)
                  </div>
                  <div className="text-xs font-bold font-mono text-rose-700">
                    - {formatCurrency(project.totalProjectCost)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                  <div className="text-xs font-bold text-emerald-950">
                    (=) Target Laba Kotor (Gross Margin {formatPercent(project.grossMarginPercent)})
                  </div>
                  <div className="text-xs font-bold font-mono text-emerald-800">
                    {formatCurrency(project.grossProfit)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-medium text-slate-700">
                    (-) Estimasi Beban Pajak &amp; Biaya Kantor Pusat
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-600">
                    - {formatCurrency(project.grossProfit - project.netProfit)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs">
                  <div>
                    <div className="text-xs font-bold">Laba Bersih Proyek (Net Profit)</div>
                    <div className="text-[10px] text-emerald-100">Status Keamanan: {project.marginStatus}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono">
                      {formatCurrency(project.netProfit)}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-200 font-mono">
                      {formatPercent(project.netMarginPercent)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Economics & Break-Even (5 Kolom) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Users className="w-4 h-4 text-teal-700" />
                <span>Unit Economics ({paxCount} Pax)</span>
              </h3>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-600">HPP per Peserta:</span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    {formatCurrency(hppPerPax)} / Pax
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-600">Harga Jual per Peserta:</span>
                  <span className="text-xs font-bold font-mono text-teal-700">
                    {formatCurrency(sellingPerPax)} / Pax
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 flex justify-between items-center">
                  <span className="text-xs text-emerald-800 font-medium">Laba per Peserta:</span>
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    {formatCurrency(profitPerPax)} / Pax
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-teal-900">Titik Impas (Break-Even):</span>
                    <span className="text-sm font-extrabold font-mono text-teal-800">
                      {breakEvenPax} Pax
                    </span>
                  </div>
                  <p className="text-[10.5px] text-teal-700">
                    Minimal kuota peserta agar proyek menutup seluruh modal pokok (COGS).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW KHUSUS: ESG & Sustainability Tata Kelola Enterprise */}
      {isDashboardView && dashboardPerspective === 'sustainability' && (
        <div className="space-y-5 animate-fade-in">
          {/* ESG Dashboard Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Matriks ESG &amp; Keberlanjutan Tata Kelola Enterprise</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standar pelaporan akuntabilitas sosial, dampak lingkungan, dan stabilitas finansial jangka panjang PT Cipta Perdana Enterprise
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Kepatuhan ISO 26000: Terverifikasi
              </span>
            </div>

            {/* Grid 3 Pilar Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* E - LINGKUNGAN */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <TreePine className="w-4 h-4 text-emerald-600" />
                    <span>Pilar Lingkungan (E)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-700">85.0% Index</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Paperless Kit &amp; Digital Module</span>
                      <span className="font-bold">90% (Hulu POS 03)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '90%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Mitigasi Emisi Akomodasi Hotel</span>
                      <span className="font-bold">80% (Mitra POS 04)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Pengurangan penggunaan kertas hingga 90% melalui e-handout interaktif dan penunjukan hotel mitra yang memiliki sertifikasi hemat energi (*Green Lodging*).
                </p>
              </div>

              {/* S - SOSIAL */}
              <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-sky-600" />
                    <span>Pilar Sosial &amp; Komunitas (S)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-sky-700">86.0% Index</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Pengadaan Kuliner Lokal (Katering)</span>
                      <span className="font-bold">92% (POS 02)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Fasilitator &amp; Panitia Regional</span>
                      <span className="font-bold">80% (POS 01)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Mendorong ekonomi regional dengan menyerap kuliner UMKM lokal dan memperkerjakan asisten pengawas ujian lokal untuk meminimalkan biaya perjalanan dinas dari pusat.
                </p>
              </div>

              {/* G - TATA KELOLA */}
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-teal-600" />
                    <span>Pilar Tata Kelola (G)</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-teal-700">100% Index</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Penyetoran Pajak PPh 21/23 &amp; PPN</span>
                      <span className="font-bold">100% Validated</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Kepatuhan Audit SPH vs RAP</span>
                      <span className="font-bold">100% Compliance</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Semua transaksi dipotong pajak di muka secara legal, menjaga rekam jejak kepatuhan pajak korporasi tetap bersih tanpa risiko denda administrasi negara.
                </p>
              </div>
            </div>
          </div>

          {/* Stabilitas Finansial & Kapasitas SDM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Keberlanjutan Finansial: Retained Overhead & Risk Reserves (7 Kolom) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Building2 className="w-4.5 h-4.5 text-teal-700" />
                <span>Ketahanan Finansial Korporat (Head Office Retention)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setiap proyek wajib menyumbang minimal 5% nilai penawaran untuk kas cadangan kantor pusat (*Overhead POS 05* dan *Management Fee*) guna mendukung keberlangsungan operasional perusahaan di luar biaya langsung proyek.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cadangan Kontinjensi (POS 05)</span>
                  <span className="text-sm font-bold font-mono text-slate-800 block mt-1">
                    {formatCurrency(posTotals.overhead || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500">Dana proteksi tak terduga proyek</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 bg-teal-50/30">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">Kontribusi Ekuitas Korporat</span>
                  <span className="text-sm font-bold font-mono text-teal-700 block mt-1">
                    {formatCurrency(Math.round(project.actualSellingPrice * 0.05))}
                  </span>
                  <span className="text-[10px] text-teal-600">Head Office Fee (Penyusutan &amp; Cadangan Kas)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Kebijakan Kas Berkelanjutan</h4>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1">
                    Perusahaan menerapkan sistem penahanan dana 10% dari nilai penawaran sampai Berita Acara Serah Terima (BAST) ditandatangani oleh klien guna menjamin kelancaran arus kas tanpa mengandalkan pinjaman luar.
                  </p>
                </div>
              </div>
            </div>

            {/* Kapasitas SDM & Kontinuitas Operasional (5 Kolom) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Activity className="w-4.5 h-4.5 text-teal-700" />
                <span>Kontinuitas &amp; Kapasitas SDM</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mencegah kelelahan panitia lapangan (*burnout*) dan memastikan ketersediaan pengajar bersertifikasi secara berkelanjutan.
              </p>

              <div className="space-y-3.5 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-600">Rasio Jam Kerja Trainer Utama:</span>
                    <span className="font-bold text-teal-700">68.0% (Normal)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: '68%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Standar maksimum beban mengajar adalah 15 jam per minggu.</p>
                </div>

                <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">Sertifikasi Trainer</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">100% Certified</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-medium text-slate-700">Lisensi Materi Pelatihan</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Hak Cipta Terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BERANDA VIEW: Kartu Sorotan Proyek & 6 Modul Utama */}
      {!isDashboardView && (
        <>
          {/* 3. Kartu Sorotan Proyek Aktif */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full">
                    Proyek Aktif
                  </span>
                  <span className="text-xs font-bold text-slate-800">{project.name}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klien: <strong className="text-slate-700">{project.clientName}</strong> | Headcount: <strong className="text-slate-700">{project.headcount.totalHeadcount} Pax</strong> (Peserta: {project.headcount.participants}, Trainer: {project.headcount.trainers}, Buffer: {project.headcount.extraBufferPercent}%)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                  RAP Ref: {project.id.toUpperCase()}
                </span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200">
                  {project.status}
                </span>
              </div>
            </div>

            {/* 4. Navigasi Modul Utama (Hulu ke Hilir) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              <button
                onClick={() => onSelectTab('proposal')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  activeTab === 'proposal'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200/80 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'proposal' ? 'bg-teal-800 text-teal-100' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <FileSignature className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">0. Proposal</div>
                  <div className={`text-[10px] ${activeTab === 'proposal' ? 'text-teal-200' : 'text-emerald-700 font-medium'}`}>
                    Hulu Penawaran
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('estimator')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  activeTab === 'estimator'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'estimator' ? 'bg-teal-800 text-teal-100' : 'bg-teal-50 text-teal-700'
                }`}>
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">1. Estimasi HPP</div>
                  <div className={`text-[10px] ${activeTab === 'estimator' ? 'text-teal-200' : 'text-slate-500'}`}>
                    POS 00-05
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('negotiation')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  activeTab === 'negotiation'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'negotiation' ? 'bg-teal-800 text-teal-100' : 'bg-teal-50 text-teal-700'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">2. Guardrail Margin</div>
                  <div className={`text-[10px] ${activeTab === 'negotiation' ? 'text-teal-200' : 'text-slate-500'}`}>
                    Diskon &amp; Proteksi
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('rap')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  activeTab === 'rap'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'rap' ? 'bg-teal-800 text-teal-100' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">3. Lock RAP &amp; PO</div>
                  <div className={`text-[10px] ${activeTab === 'rap' ? 'text-teal-200' : 'text-slate-500'}`}>
                    Otorisasi v1.0
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('execution')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  activeTab === 'execution'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'execution' ? 'bg-teal-800 text-teal-100' : 'bg-teal-50 text-teal-700'
                }`}>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">4. Realisasi Biaya</div>
                  <div className={`text-[10px] ${activeTab === 'execution' ? 'text-teal-200' : 'text-slate-500'}`}>
                    Audit Aktual
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectTab('directory')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1 ${
                  activeTab === 'directory'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeTab === 'directory' ? 'bg-teal-800 text-teal-100' : 'bg-teal-50 text-teal-700'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">5. Direktori SDM</div>
                  <div className={`text-[10px] ${activeTab === 'directory' ? 'text-teal-200' : 'text-slate-500'}`}>
                    Tata Kelola 3 Pihak
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
