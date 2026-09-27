import { ProjectOpportunity, CostItem } from '../types';
import { formatCurrency } from './calculator';

const CATEGORY_POS_MAP: Record<string, { posCode: string; label: string }> = {
  presales: { posCode: 'POS 00', label: 'Presales Overhead & Pitching' },
  labor: { posCode: 'POS 01', label: 'Direct Labor & Experts' },
  hospitality: { posCode: 'POS 02', label: 'Akomodasi & Event Venue' },
  materials: { posCode: 'POS 03', label: 'Konsumsi & Training Kit' },
  venue: { posCode: 'POS 04', label: 'Sewa Alat & Tempat' },
  overhead: { posCode: 'POS 05', label: 'Subkon Vendor & Lainnya' },
};

export function exportRapToCsv(project: ProjectOpportunity, costItems: CostItem[]) {
  const headers = ['POS Code', 'Kategori POS', 'Detail Komponen', 'Tarif Unit (Rp)', 'Vol / Durasi', 'Total Biaya (Rp)'];
  const rows: string[][] = [];

  costItems.forEach((item) => {
    const posInfo = CATEGORY_POS_MAP[item.category] || { posCode: 'POS 00', label: item.category };
    const volStr = `${item.quantity} ${item.unit}${item.daysOrDuration && item.daysOrDuration > 1 ? ` x ${item.daysOrDuration} hari` : ''}`;

    rows.push([
      posInfo.posCode,
      `"${posInfo.label.replace(/"/g, '""')}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.unitPrice.toString(),
      `"${volStr.replace(/"/g, '""')}"`,
      item.totalCost.toString()
    ]);
  });

  const totalModal = project.totalProjectCost || (project.directHpp + project.presalesOverhead);
  const grossProfit = project.grossProfit;
  const netProfit = project.netProfit;

  let csvContent = 'DATA RINGKASAN PROYEK & EXPORT RAP TERKUNCI\n';
  csvContent += `Nama Proyek,${project.name}\n`;
  csvContent += `Nama Klien,${project.clientName}\n`;
  csvContent += `Kode Proyek,${project.code}\n`;
  csvContent += `Versi RAP,${project.rapVersion || 'v1.0'}\n`;
  csvContent += `Status,Approved & Locked\n`;
  csvContent += `Target Margin,${project.targetGrossMarginPercent}%\n`;
  csvContent += `Harga Penawaran Final,${project.actualSellingPrice}\n`;
  csvContent += `Total Modal RAP (HPP + Presales),${totalModal}\n`;
  csvContent += `Gross Profit,${grossProfit}\n`;
  csvContent += `Net Profit,${netProfit}\n\n`;

  csvContent += 'STRUKTUR BIAYA ANGGARAN RAP (KATEGORI POS HPP)\n';
  csvContent += headers.join(',') + '\n';
  csvContent += rows.map((e) => e.join(',')).join('\n');

  if (project.auditTrail && project.auditTrail.length > 0) {
    csvContent += '\n\nJEJAK AUDIT & HISTORI OTORISASI RAP\n';
    csvContent += 'Timestamp,Aktor,Role,Aktivitas,Status\n';
    project.auditTrail.forEach((log) => {
      csvContent += `"${log.timestamp}","${log.actorName}","${log.role}","${log.action.replace(/"/g, '""')}","${log.statusBadge || 'Recorded'}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `RAP-Laporan-Resmi-${project.code}-${project.rapVersion || 'v1.0'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
