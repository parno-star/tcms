import { CostItem, ConsumptionHeadcount, MarginStatus, ProjectOpportunity } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateHeadcount(
  participants: number,
  trainers: number,
  organizers: number,
  extraBufferPercent: number = 5
): ConsumptionHeadcount {
  const base = participants + trainers + organizers;
  // Extra buffer e.g. +5% extra portion
  const buffered = Math.ceil(base * (1 + extraBufferPercent / 100));
  
  return {
    participants,
    trainers,
    organizers,
    extraBufferPercent,
    totalHeadcount: buffered,
    days: 3,
  };
}

export function calculateProjectTotals(
  items: CostItem[],
  discountPercent: number,
  targetGrossMarginPercent: number = 35
) {
  let directHpp = 0;
  let presalesOverhead = 0;

  items.forEach((item) => {
    if (item.category === 'presales' || item.isPresalesOverhead) {
      presalesOverhead += item.totalCost;
    } else {
      directHpp += item.totalCost;
    }
  });

  const totalProjectCost = directHpp + presalesOverhead;

  // Formula Harga Penawaran Normal = Total Cost Proyek / (1 - Target Gross Margin %)
  const targetMarginDecimal = Math.min(Math.max(targetGrossMarginPercent, 10), 80) / 100;
  const normalSellingPrice = totalProjectCost / (1 - targetMarginDecimal);

  // Harga setelah diskon
  const discountDecimal = Math.min(Math.max(discountPercent, 0), 60) / 100;
  const actualSellingPrice = normalSellingPrice * (1 - discountDecimal);

  // Gross Profit = Selling Price - Direct HPP
  const grossProfit = actualSellingPrice - directHpp;
  const grossMarginPercent = actualSellingPrice > 0 ? (grossProfit / actualSellingPrice) * 100 : 0;

  // Net Profit = Selling Price - Total Cost Proyek (Direct HPP + Presales)
  const netProfit = actualSellingPrice - totalProjectCost;
  const netMarginPercent = actualSellingPrice > 0 ? (netProfit / actualSellingPrice) * 100 : 0;

  // Margin Status Guardrail Rules:
  // Green: Net Margin >= 30% (Auto-Approved)
  // Yellow: 20% <= Net Margin < 30% (VP Approval Required)
  // Red: Net Margin < 20% (CEO Escalation & Locked)
  let marginStatus: MarginStatus = 'GREEN';
  if (netMarginPercent < 20) {
    marginStatus = 'RED';
  } else if (netMarginPercent < 30) {
    marginStatus = 'YELLOW';
  } else {
    marginStatus = 'GREEN';
  }

  return {
    directHpp,
    presalesOverhead,
    totalProjectCost,
    normalSellingPrice,
    actualSellingPrice,
    grossProfit,
    grossMarginPercent,
    netProfit,
    netMarginPercent,
    marginStatus,
  };
}

export function getApprovalRequirement(netMarginPercent: number) {
  if (netMarginPercent >= 30) {
    return {
      status: 'GREEN',
      level: 'Auto-Approve',
      approverTitle: 'Sales Manager / Cost Control',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconEmoji: '🟢',
      description: 'Margin aman (≥ 30%). Sistem langsung menyetujui penawaran ini.',
    };
  } else if (netMarginPercent >= 20) {
    return {
      status: 'YELLOW',
      level: 'Butuh Otorisasi VP',
      approverTitle: 'VP Commercial & Director',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      iconEmoji: '🟡',
      description: 'Margin agak tipis (20% – 29.9%). Diperlukan persetujuan khusus dari VP Commercial.',
    };
  } else {
    return {
      status: 'RED',
      level: 'KUNCI - Wajib CEO',
      approverTitle: 'CEO / Managing Director',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      iconEmoji: '🔴',
      description: 'Margin KRITIS (< 20%). Proposal DIKUNCI. Membutuhkan otorisasi langsung CEO & rekomendasi penyesuaian scope.',
    };
  }
}
