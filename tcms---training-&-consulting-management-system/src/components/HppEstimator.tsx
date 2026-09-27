import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CostItem, CostCategoryKey, UserRole, ConsumptionHeadcount, CostCategoryInfo } from '../types';
import { COST_CATEGORIES, INITIAL_COST_ITEMS, MANDIRI_WORKSHOP_COST_ITEMS } from '../data/initialData';
import { formatCurrency, calculateHeadcount } from '../utils/calculator';
import {
  Plus,
  Trash2,
  Edit3,
  Utensils,
  Users,
  Package,
  Building2,
  ShieldCheck,
  FileSearch,
  CheckCircle,
  Calculator,
  Layers,
  Grid,
  Percent,
  Receipt,
  FileSpreadsheet,
  FileSignature,
  Printer,
  X,
} from 'lucide-react';

interface HppEstimatorProps {
  costItems: CostItem[];
  headcount: ConsumptionHeadcount;
  activeRole: UserRole;
  onUpdateCostItems: (items: CostItem[]) => void;
  onUpdateHeadcount: (headcount: ConsumptionHeadcount) => void;
  verifiedItems: Record<string, boolean>;
  onToggleVerifyItem: (itemId: string) => void;
  isSimulationMode?: boolean;
  onNavigateToProposal?: () => void;
}

export const HppEstimator: React.FC<HppEstimatorProps> = ({
  costItems,
  headcount,
  activeRole,
  onUpdateCostItems,
  onUpdateHeadcount,
  verifiedItems,
  onToggleVerifyItem,
  isSimulationMode,
  onNavigateToProposal,
}) => {
  const [activeCategoryTab, setActiveCategoryTab] = useState<CostCategoryKey>('presales');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all');
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  // Categories & Add POS state
  const [categoriesList, setCategoriesList] = useState<CostCategoryInfo[]>(COST_CATEGORIES);
  const [isAddPosModalOpen, setIsAddPosModalOpen] = useState(false);
  const [newPosLabel, setNewPosLabel] = useState('');
  const [newPosCode, setNewPosCode] = useState(`POS 0${COST_CATEGORIES.length}`);
  const [newPosDesc, setNewPosDesc] = useState('');

  // Print PDF Settings Modal State
  const [isPrintSettingsModalOpen, setIsPrintSettingsModalOpen] = useState(false);
  const [selectedPrintSections, setSelectedPrintSections] = useState<string[]>([
    'summary',
    'presales',
    'labor',
    'hospitality',
    'materials',
    'venue',
    'overhead',
    'taxes',
  ]);

  const triggerHppPdfDownload = () => {
    setIsPrintSettingsModalOpen(false);

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');

      // Title & Subtitle Header
      doc.setFontSize(13);
      doc.setTextColor(15, 118, 110); // Teal-700
      doc.text('RINCIAN ESTIMASI BIAYA PELATIHAN (KELOMPOK POS HPP)', 14, 15);

      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const programTitle = activeHppName || 'In-House Training Service Excellence & Leadership';
      const clientTitle = activeClientName || 'PT Telkom Indonesia (Persero) Tbk';
      doc.text(
        `Program: ${programTitle} • Klien: ${clientTitle} | Dicetak: ${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        14,
        21
      );

      let currentY = 25;

      // Summary Header Card
      if (selectedPrintSections.includes('summary')) {
        const totalCostSum = costItems.reduce((a, b) => a + b.totalCost, 0);
        autoTable(doc, {
          startY: currentY,
          head: [['Parameter HPP & Kapasitas', 'Rincian Nilai']],
          body: [
            ['Nama Program / Proyek', programTitle],
            ['Klien / Mitra Kerja', clientTitle],
            ['Total Estimasi HPP', formatCurrency(totalCostSum)],
            ['Kapasitas Personel', `${derivedHeadcount.participants} Peserta, ${derivedHeadcount.trainers} Trainer, ${derivedHeadcount.organizers} Panitia (Total Headcount: ${derivedHeadcount.totalHeadcount} Pax)`],
          ],
          theme: 'grid',
          headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
          styles: { cellPadding: 2 },
          margin: { left: 14, right: 14 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 6;
      }

      // Filter POS Categories selected by user
      const posToPrint = categoriesList.filter((cat) => selectedPrintSections.includes(cat.key));

      if (posToPrint.length > 0) {
        const tableHead = [['POS', 'Kelompok Biaya POS', 'Komponen Rincian Biaya', 'Tarif Satuan (Rp)', 'Vol/Qty', 'Durasi', 'Total Biaya (Rp)', 'Pajak']];
        const tableBody: any[] = [];

        posToPrint.forEach((cat) => {
          const catItems = costItems.filter((i) => i.category === cat.key);
          if (catItems.length === 0) {
            tableBody.push([
              cat.posCode,
              cat.label,
              '(Belum ada item biaya di POS ini)',
              '—',
              '—',
              '—',
              'Rp0',
              '—',
            ]);
          } else {
            catItems.forEach((item, idx) => {
              let taxText = 'Non-Tax';
              if (item.taxType === 'PPH21_TRAINER') taxText = 'PPh 21 (2.5%)';
              else if (item.taxType === 'PPH23_JASA') taxText = 'PPh 23 (2%)';
              else if (item.taxType === 'PB1_HOTEL_10') taxText = 'PB1 (10%)';
              else if (item.taxType === 'PPN_11') taxText = 'PPN (11%)';

              tableBody.push([
                idx === 0 ? cat.posCode : '',
                idx === 0 ? cat.label : '',
                item.name + (item.notes ? ` (${item.notes})` : ''),
                formatCurrency(item.unitPrice),
                `${item.quantity} ${item.unit}`,
                item.daysOrDuration ? `${item.daysOrDuration} Hari` : '—',
                formatCurrency(item.totalCost),
                taxText,
              ]);
            });

            const catSubtotal = catItems.reduce((acc, curr) => acc + curr.totalCost, 0);
            tableBody.push([
              { content: `SUBTOTAL ${cat.posCode} - ${cat.label}`, colSpan: 6, styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
              { content: formatCurrency(catSubtotal), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
              { content: '', styles: { fillColor: [241, 245, 249] } },
            ]);
          }
        });

        const grandTotalCost = costItems.reduce((acc, curr) => acc + curr.totalCost, 0);
        tableBody.push([
          { content: 'GRAND TOTAL HPP KELOMPOK POS', colSpan: 6, styles: { fontStyle: 'bold', halign: 'right', fillColor: [15, 118, 110], textColor: [255, 255, 255] } },
          { content: formatCurrency(grandTotalCost), styles: { fontStyle: 'bold', fillColor: [15, 118, 110], textColor: [255, 255, 255] } },
          { content: '', styles: { fillColor: [15, 118, 110] } },
        ]);

        autoTable(doc, {
          startY: currentY,
          head: tableHead,
          body: tableBody,
          theme: 'grid',
          headStyles: {
            fillColor: [15, 118, 110],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 7.5,
            textColor: [30, 41, 59],
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250],
          },
          styles: {
            cellPadding: 2,
            overflow: 'linebreak',
          },
          margin: { left: 14, right: 14, top: 25, bottom: 15 },
          didDrawPage: (data) => {
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Halaman ${data.pageNumber} dari ${pageCount}`,
              doc.internal.pageSize.width - 25,
              doc.internal.pageSize.height - 8
            );
          },
        });
      }

      doc.save(`Rincian_HPP_${(programTitle || 'Pelatihan').replace(/[\/\\]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Gagal mencetak PDF HPP:', err);
      alert('Terjadi kesalahan saat memproses file PDF HPP.');
    }
  };

  const handleAddPosCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosLabel.trim()) return;

    const newKey = `pos_${Date.now()}` as CostCategoryKey;
    const newCatInfo: CostCategoryInfo = {
      key: newKey,
      label: newPosLabel,
      posCode: newPosCode || `POS 0${categoriesList.length}`,
      description: newPosDesc || 'Kategori POS Biaya tambahan',
      iconName: 'Layers',
    };

    setCategoriesList([...categoriesList, newCatInfo]);
    setActiveCategoryTab(newKey);
    setIsAddPosModalOpen(false);
    setNewPosLabel('');
    setNewPosDesc('');
  };

  // Buat HPP Baru & Arsip Riwayat HPP state
  const [isCreateHppModalOpen, setIsCreateHppModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveSuccessMessage, setArchiveSuccessMessage] = useState<string | null>(null);

  const [activeClientName, setActiveClientName] = useState(isSimulationMode ? 'PT Telkom Indonesia (Persero) Tbk' : '');
  const [activeClientType, setActiveClientType] = useState('BUMN');

  const [hppArchives, setHppArchives] = useState<Array<{
    id: string;
    name: string;
    clientName: string;
    clientType: string;
    createdAt: string;
    totalCost: number;
    participants: number;
    days: number;
    costItems: CostItem[];
    headcount: ConsumptionHeadcount;
  }>>(() => {
    try {
      const stored = localStorage.getItem('tcms_hpp_archives_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Auto-repair any archives that had empty costItems
          return parsed.map((arch: any) => {
            if (!arch.costItems || arch.costItems.length === 0) {
              if (arch.id === 'archive-1' || arch.name?.includes('Service Excellence')) {
                return {
                  ...arch,
                  costItems: INITIAL_COST_ITEMS.map((item) => ({ ...item })),
                  totalCost: INITIAL_COST_ITEMS.reduce((a, b) => a + b.totalCost, 0),
                };
              }
              if (arch.id === 'archive-2' || arch.name?.includes('Financial Management')) {
                return {
                  ...arch,
                  costItems: MANDIRI_WORKSHOP_COST_ITEMS.map((item) => ({ ...item })),
                  totalCost: MANDIRI_WORKSHOP_COST_ITEMS.reduce((a, b) => a + b.totalCost, 0),
                };
              }
            }
            return arch;
          });
        }
      }
    } catch {
      // ignore
    }

    const telkomItems = INITIAL_COST_ITEMS.map((i) => ({ ...i }));
    const mandiriItems = MANDIRI_WORKSHOP_COST_ITEMS.map((i) => ({ ...i }));

    return isSimulationMode
      ? [
          {
            id: 'archive-1',
            name: 'In-House Training Service Excellence & Leadership Batch 1',
            clientName: 'PT Telkom Indonesia (Persero) Tbk',
            clientType: 'BUMN',
            createdAt: '15/09/2026 10:30',
            totalCost: telkomItems.reduce((acc, c) => acc + c.totalCost, 0),
            participants: 35,
            days: 3,
            costItems: telkomItems,
            headcount: { participants: 35, trainers: 2, organizers: 3, extraBufferPercent: 5, totalHeadcount: 42, days: 3 },
          },
          {
            id: 'archive-2',
            name: 'In-House Workshop Strategic Financial Management Batch 2',
            clientName: 'PT Bank Mandiri (Persero) Tbk',
            clientType: 'BUMN',
            createdAt: '18/09/2026 14:15',
            totalCost: mandiriItems.reduce((acc, c) => acc + c.totalCost, 0),
            participants: 40,
            days: 4,
            costItems: mandiriItems,
            headcount: { participants: 40, trainers: 2, organizers: 4, extraBufferPercent: 5, totalHeadcount: 48, days: 4 },
          },
        ]
      : [];
  });

  // Save archives to localStorage whenever changed
  React.useEffect(() => {
    try {
      localStorage.setItem('tcms_hpp_archives_v2', JSON.stringify(hppArchives));
    } catch {
      // ignore
    }
  }, [hppArchives]);

  const [newHppName, setNewHppName] = useState('');
  const [newHppClient, setNewHppClient] = useState('');
  const [newHppClientType, setNewHppClientType] = useState('BUMN');
  const [newHppParticipants, setNewHppParticipants] = useState(headcount.participants || 30);
  const [newHppDays, setNewHppDays] = useState(headcount.days || 3);
  const [newHppLocation, setNewHppLocation] = useState('Jakarta / Hotel Bintang 4');
  const [newHppMargin, setNewHppMargin] = useState(35);
  const [newHppNotes, setNewHppNotes] = useState('');
  const [activeHppName, setActiveHppName] = useState(isSimulationMode ? 'In-House Training Service Excellence & Leadership Batch 1' : '');

  const handleCreateNewHpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHppName.trim()) return;

    // 1. Archive current HPP first automatically if there was existing data or an active name
    const currentTotalCost = costItems.reduce((acc, c) => acc + c.totalCost, 0);
    const hasExistingData = costItems.length > 0 || activeHppName.trim() !== '';

    let archivedTitle = '';
    if (hasExistingData) {
      archivedTitle = activeHppName.trim() || `HPP Pelatihan & Konsultansi (${new Date().toLocaleDateString('id-ID')})`;
      const archived = {
        id: `archive-${Date.now()}`,
        name: archivedTitle,
        clientName: activeClientName.trim() || 'Klien Umum',
        clientType: activeClientType || 'BUMN',
        createdAt: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        totalCost: currentTotalCost,
        participants: derivedHeadcount.participants || headcount.participants || 0,
        days: headcount.days || 1,
        costItems: [...costItems],
        headcount: { ...headcount }
      };

      setHppArchives(prev => [archived, ...prev]);
    }

    // 2. Set new HPP parameters
    setActiveHppName(newHppName.trim());
    setActiveClientName(newHppClient.trim() || 'Klien Baru');
    setActiveClientType(newHppClientType);

    // 3. Set default cost items with POS 01 Trainer & Panitia (volume 1)
    const timestamp = Date.now();
    const defaultPos01Items: CostItem[] = [
      {
        id: `labor-default-trainer-${timestamp}-1`,
        category: 'labor',
        name: 'Trainer',
        unitPrice: 0,
        quantity: 1,
        daysOrDuration: newHppDays || 1,
        unit: 'orang',
        totalCost: 0,
        notes: 'Honorarium Trainer (Volume: 1 Orang)',
        taxType: 'PPH21_TRAINER',
        taxRatePercent: 2.5,
        taxAmount: 0,
      },
      {
        id: `labor-default-panitia-${timestamp}-2`,
        category: 'labor',
        name: 'Panitia',
        unitPrice: 0,
        quantity: 1,
        daysOrDuration: newHppDays || 1,
        unit: 'orang',
        totalCost: 0,
        notes: 'Honorarium Panitia / EO (Volume: 1 Orang)',
        taxType: 'PPH21_TRAINER',
        taxRatePercent: 2.5,
        taxAmount: 0,
      },
    ];
    onUpdateCostItems(defaultPos01Items);

    // 4. Update headcount for new HPP
    const updatedHeadcount = {
      ...headcount,
      participants: newHppParticipants,
      trainers: 1,
      organizers: 1,
      days: newHppDays,
      totalHeadcount: Math.ceil((newHppParticipants + 1 + 1) * (1 + (headcount.extraBufferPercent || 5) / 100)),
    };
    onUpdateHeadcount(updatedHeadcount);

    // 5. Notification
    if (hasExistingData) {
      setArchiveSuccessMessage(`HPP sebelumnya "${archivedTitle}" otomatis tersimpan ke Arsip HPP (${costItems.length} item). HPP baru "${newHppName.trim()}" aktif dengan 2 item default POS 01 (Trainer & Panitia, Volume 1).`);
    } else {
      setArchiveSuccessMessage(`HPP baru "${newHppName.trim()}" berhasil dibuat dengan 2 item default POS 01 (Trainer & Panitia, Volume 1).`);
    }

    // 6. Reset modal state & form
    setIsCreateHppModalOpen(false);
    setNewHppName('');
    setNewHppClient('');
    setNewHppNotes('');
  };

  const handleRestoreArchive = (archive: (typeof hppArchives)[0]) => {
    // 1. Auto-archive current HPP if it has data and is not identical to the archive being restored
    const currentTotalCost = costItems.reduce((acc, c) => acc + c.totalCost, 0);
    const currentTitle = activeHppName.trim() || `HPP Pelatihan (${new Date().toLocaleDateString('id-ID')})`;
    const hasCurrentData = costItems.length > 0 || activeHppName.trim() !== '';

    if (hasCurrentData && currentTitle !== archive.name) {
      const alreadyExists = hppArchives.some((a) => a.name === currentTitle);
      if (!alreadyExists) {
        const autoArchived = {
          id: `archive-${Date.now()}`,
          name: currentTitle,
          clientName: activeClientName || 'Klien Umum',
          clientType: activeClientType || 'BUMN',
          createdAt: new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          totalCost: currentTotalCost,
          participants: derivedHeadcount.participants || headcount.participants,
          days: headcount.days,
          costItems: costItems.map((item) => ({ ...item })),
          headcount: { ...headcount },
        };
        setHppArchives((prev) => [autoArchived, ...prev]);
      }
    }

    // 2. Resolve items to restore (ensure items are never empty)
    let itemsToRestore: CostItem[] = [];
    if (archive.costItems && archive.costItems.length > 0) {
      itemsToRestore = archive.costItems.map((item) => ({ ...item }));
    } else if (archive.id === 'archive-1' || archive.name?.includes('Service Excellence')) {
      itemsToRestore = INITIAL_COST_ITEMS.map((item) => ({ ...item }));
    } else if (archive.id === 'archive-2' || archive.name?.includes('Financial Management')) {
      itemsToRestore = MANDIRI_WORKSHOP_COST_ITEMS.map((item) => ({ ...item }));
    } else {
      const timestamp = Date.now();
      itemsToRestore = [
        {
          id: `labor-default-trainer-${timestamp}-1`,
          category: 'labor',
          name: 'Trainer',
          unitPrice: 0,
          quantity: 1,
          daysOrDuration: archive.days || 1,
          unit: 'orang',
          totalCost: 0,
          notes: 'Honorarium Trainer (Volume: 1 Orang)',
          taxType: 'PPH21_TRAINER',
          taxRatePercent: 2.5,
          taxAmount: 0,
        },
        {
          id: `labor-default-panitia-${timestamp}-2`,
          category: 'labor',
          name: 'Panitia',
          unitPrice: 0,
          quantity: 1,
          daysOrDuration: archive.days || 1,
          unit: 'orang',
          totalCost: 0,
          notes: 'Honorarium Panitia / EO (Volume: 1 Orang)',
          taxType: 'PPH21_TRAINER',
          taxRatePercent: 2.5,
          taxAmount: 0,
        },
      ];
    }

    // 3. Update active state & parent components
    onUpdateCostItems(itemsToRestore);
    if (archive.headcount) {
      onUpdateHeadcount({ ...archive.headcount });
    }
    setActiveHppName(archive.name);
    setActiveClientName(archive.clientName);
    setActiveClientType(archive.clientType);

    // 4. Set view mode to 'all' so all POS category cards and tables are fully visible
    setViewMode('all');

    // 5. Close dialog and notify
    setIsArchiveModalOpen(false);
    setArchiveSuccessMessage(
      `HPP "${archive.name}" (${itemsToRestore.length} item biaya POS, ${archive.participants} Pax, ${archive.days} Hari) berhasil ditampilkan dan dimuat ke lembar kerja.`
    );
  };

  const handleDeleteArchive = (id: string, name: string) => {
    setHppArchives((prev) => prev.filter((a) => a.id !== id));
    setArchiveSuccessMessage(`Arsip HPP "${name}" telah dihapus.`);
  };

  // Pastikan secara default muncul 2 item POS 01: Trainer & Panitia (volume 1)
  const handleAddDefaultPos01Items = () => {
    const timestamp = Date.now();
    const defaultLaborItems: CostItem[] = [
      {
        id: `labor-default-trainer-${timestamp}-1`,
        category: 'labor',
        name: 'Trainer',
        unitPrice: 0,
        quantity: 1,
        daysOrDuration: headcount.days || 1,
        unit: 'orang',
        totalCost: 0,
        notes: 'Honorarium Trainer (Volume: 1 Orang)',
        taxType: 'PPH21_TRAINER',
        taxRatePercent: 2.5,
        taxAmount: 0,
      },
      {
        id: `labor-default-panitia-${timestamp}-2`,
        category: 'labor',
        name: 'Panitia',
        unitPrice: 0,
        quantity: 1,
        daysOrDuration: headcount.days || 1,
        unit: 'orang',
        totalCost: 0,
        notes: 'Honorarium Panitia / EO (Volume: 1 Orang)',
        taxType: 'PPH21_TRAINER',
        taxRatePercent: 2.5,
        taxAmount: 0,
      },
    ];
    onUpdateCostItems([...costItems, ...defaultLaborItems]);
  };

  // Pastikan saat inisialisasi / mount jika POS 01 kosong, muncul 2 item default: Trainer & Panitia (Vol 1)
  React.useEffect(() => {
    const hasLabor = costItems.some((i) => i.category === 'labor');
    if (!hasLabor) {
      const timestamp = Date.now();
      const defaultLaborItems: CostItem[] = [
        {
          id: `labor-default-trainer-${timestamp}-1`,
          category: 'labor',
          name: 'Trainer',
          unitPrice: 0,
          quantity: 1,
          daysOrDuration: headcount.days || 1,
          unit: 'orang',
          totalCost: 0,
          notes: 'Honorarium Trainer (Volume: 1 Orang)',
          taxType: 'PPH21_TRAINER',
          taxRatePercent: 2.5,
          taxAmount: 0,
        },
        {
          id: `labor-default-panitia-${timestamp}-2`,
          category: 'labor',
          name: 'Panitia',
          unitPrice: 0,
          quantity: 1,
          daysOrDuration: headcount.days || 1,
          unit: 'orang',
          totalCost: 0,
          notes: 'Honorarium Panitia / EO (Volume: 1 Orang)',
          taxType: 'PPH21_TRAINER',
          taxRatePercent: 2.5,
          taxAmount: 0,
        },
      ];
      onUpdateCostItems([...costItems, ...defaultLaborItems]);
    }
  }, []); // Run on initial load if labor items are absent

  // Edit item state
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState(0);
  const [editItemQty, setEditItemQty] = useState(1);
  const [editItemDays, setEditItemDays] = useState(1);
  const [editItemUnit, setEditItemUnit] = useState('pax');
  const [editItemNotes, setEditItemNotes] = useState('');
  const [editItemTaxType, setEditItemTaxType] = useState<CostItem['taxType']>('NON_TAX');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(1000000);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemDays, setNewItemDays] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('pax');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemTaxType, setNewItemTaxType] = useState<CostItem['taxType']>('NON_TAX');

  const isEditable = true;
  const isChecker = activeRole === 'pemeriksa';

  // Pajak Indonesia Calculations
  const taxSummary = React.useMemo(() => {
    let pph21Total = 0; // Trainer & experts (2.5% tarif efektif atau 5% x 50% PKP)
    let pph23Total = 0; // Jasa cetak / vendor jasa (2%)
    let pb1Total = 0;   // Pajak Daerah Hotel & Resto (10%)
    let ppnTotal = 0;   // PPN Barang ATK / Plakat (11%)

    costItems.forEach((item) => {
      const total = item.totalCost || 0;
      if (item.taxType === 'PPH21_TRAINER') {
        pph21Total += item.taxAmount ?? Math.round(total * 0.025);
      } else if (item.taxType === 'PPH23_JASA') {
        pph23Total += item.taxAmount ?? Math.round(total * 0.02);
      } else if (item.taxType === 'PB1_HOTEL_10') {
        pb1Total += item.taxAmount ?? Math.round(total * 0.10);
      } else if (item.taxType === 'PPN_11') {
        ppnTotal += item.taxAmount ?? Math.round(total * 0.11);
      }
    });

    const totalWithholdingTax = pph21Total + pph23Total; // Pajak potong/pungut
    const totalLocalAndIndirectTax = pb1Total + ppnTotal;

    return {
      pph21Total,
      pph23Total,
      pb1Total,
      ppnTotal,
      totalWithholdingTax,
      totalLocalAndIndirectTax,
      grandTotalTax: totalWithholdingTax + totalLocalAndIndirectTax,
    };
  }, [costItems]);

  // Derived Headcount Statistics directly calculated from Cost Items
  const derivedHeadcount = React.useMemo(() => {
    if (costItems.length === 0) {
      return {
        participants: headcount.participants || 0,
        trainers: headcount.trainers || 0,
        organizers: headcount.organizers || 0,
        totalHeadcount: 0,
      };
    }

    let trainersCount = 0;
    let organizersCount = 0;
    let participantsCount = 0;

    costItems.forEach((item) => {
      const text = `${item.name} ${item.notes || ''}`.toLowerCase();
      const qty = item.quantity || 0;

      // Labor: Trainers vs Panitia
      if (item.category === 'labor') {
        if (text.includes('panitia') || text.includes('eo') || text.includes('organizer') || text.includes('lo ') || text.includes('liaison')) {
          organizersCount += qty;
        } else if (
          text.includes('trainer') ||
          text.includes('narasumber') ||
          text.includes('fasilitator') ||
          text.includes('instruktur') ||
          text.includes('assessor') ||
          text.includes('coach') ||
          text.includes('co-trainer')
        ) {
          trainersCount += qty;
        } else {
          trainersCount += qty;
        }
      }

      // Panitia in other categories (e.g. uang makan organiser)
      if (item.category !== 'labor' && (text.includes('panitia') || text.includes('organiser') || text.includes('organizer'))) {
        if (organizersCount === 0 && qty > 0) {
          organizersCount = qty;
        }
      }

      // Peserta indicators
      if (text.includes('peserta') || text.includes('participant')) {
        const match = text.match(/(\d+)\s*(?:pax|peserta|orang)/i);
        if (match) {
          const parsed = parseInt(match[1], 10);
          if (parsed > participantsCount) participantsCount = parsed;
        } else if (qty > participantsCount) {
          participantsCount = qty;
        }
      } else if (item.category === 'materials' && (item.unit === 'pax' || item.unit === 'set' || item.unit === 'paket') && qty > participantsCount) {
        participantsCount = qty;
      } else if (item.category === 'hospitality' && (item.unit === 'pax' || item.isVariablePerPax) && qty > participantsCount) {
        participantsCount = qty;
      }
    });

    // If hospitality package included trainers and organizers (e.g., 35 pax total = 30 peserta + 2 trainer + 3 panitia)
    if (participantsCount > 0 && trainersCount > 0 && organizersCount > 0 && participantsCount > (trainersCount + organizersCount)) {
      const fullPackageItem = costItems.find(
        (i) => i.category === 'hospitality' && `${i.name} ${i.notes || ''}`.toLowerCase().includes('peserta') && `${i.name} ${i.notes || ''}`.toLowerCase().includes('trainer')
      );
      if (fullPackageItem) {
        const noteMatch = (fullPackageItem.notes || '').match(/(\d+)\s*peserta/i);
        if (noteMatch) {
          participantsCount = parseInt(noteMatch[1], 10);
        } else {
          participantsCount = participantsCount - trainersCount - organizersCount;
        }
      }
    }

    if (participantsCount === 0 && headcount.participants > 0) {
      participantsCount = headcount.participants;
    }
    if (trainersCount === 0 && headcount.trainers > 0) {
      trainersCount = headcount.trainers;
    }
    if (organizersCount === 0 && headcount.organizers > 0) {
      organizersCount = headcount.organizers;
    }

    const bufferPercent = headcount.extraBufferPercent ?? 5;
    const totalHeadcount = Math.ceil((participantsCount + trainersCount + organizersCount) * (1 + bufferPercent / 100));

    return {
      participants: participantsCount,
      trainers: trainersCount,
      organizers: organizersCount,
      totalHeadcount,
    };
  }, [costItems, headcount]);

  // Synchronize derived headcount to parent if values differ
  React.useEffect(() => {
    if (
      derivedHeadcount.participants !== headcount.participants ||
      derivedHeadcount.trainers !== headcount.trainers ||
      derivedHeadcount.organizers !== headcount.organizers ||
      derivedHeadcount.totalHeadcount !== headcount.totalHeadcount
    ) {
      onUpdateHeadcount({
        ...headcount,
        participants: derivedHeadcount.participants,
        trainers: derivedHeadcount.trainers,
        organizers: derivedHeadcount.organizers,
        totalHeadcount: derivedHeadcount.totalHeadcount,
      });
    }
  }, [derivedHeadcount, headcount, onUpdateHeadcount]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const days = newItemDays || 1;
    const total = newItemPrice * newItemQty * days;

    let taxRate = 0;
    let taxType = newItemTaxType || 'NON_TAX';
    if (taxType === 'PPH21_TRAINER') taxRate = 2.5;
    else if (taxType === 'PPH23_JASA') taxRate = 2.0;
    else if (taxType === 'PB1_HOTEL_10') taxRate = 10.0;
    else if (taxType === 'PPN_11') taxRate = 11.0;

    const taxAmount = Math.round((total * taxRate) / 100);

    const newItem: CostItem = {
      id: `item-${Date.now()}`,
      category: activeCategoryTab,
      name: newItemName,
      unitPrice: newItemPrice,
      quantity: newItemQty,
      daysOrDuration: days,
      unit: newItemUnit,
      totalCost: total,
      isPresalesOverhead: activeCategoryTab === 'presales',
      notes: newItemNotes,
      taxType,
      taxRatePercent: taxRate,
      taxAmount,
    };

    onUpdateCostItems([...costItems, newItem]);

    // Reset form
    setNewItemName('');
    setNewItemPrice(1000000);
    setNewItemQty(1);
    setNewItemDays(1);
    setNewItemNotes('');
    setNewItemTaxType('NON_TAX');
    setIsAddingModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateCostItems(costItems.filter((item) => item.id !== id));
  };

  const handleOpenEditItem = (item: CostItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.unitPrice);
    setEditItemQty(item.quantity);
    setEditItemDays(item.daysOrDuration || 1);
    setEditItemUnit(item.unit || 'pax');
    setEditItemNotes(item.notes || '');
    setEditItemTaxType(item.taxType || 'NON_TAX');
    setIsEditModalOpen(true);
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const days = editItemDays || 1;
    const total = editItemPrice * editItemQty * days;

    let taxRate = 0;
    let taxType = editItemTaxType || 'NON_TAX';
    if (taxType === 'PPH21_TRAINER') taxRate = 2.5;
    else if (taxType === 'PPH23_JASA') taxRate = 2.0;
    else if (taxType === 'PB1_HOTEL_10') taxRate = 10.0;
    else if (taxType === 'PPN_11') taxRate = 11.0;

    const taxAmount = Math.round((total * taxRate) / 100);

    const updated = costItems.map((item) => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          name: editItemName,
          unitPrice: editItemPrice,
          quantity: editItemQty,
          daysOrDuration: days,
          unit: editItemUnit,
          totalCost: total,
          notes: editItemNotes,
          taxType,
          taxRatePercent: taxRate,
          taxAmount,
        };
      }
      return item;
    });

    onUpdateCostItems(updated);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleClearCategory = (catKey: CostCategoryKey) => {
    const catInfo = categoriesList.find((c) => c.key === catKey);
    if (window.confirm(`Hapus semua item pada ${catInfo?.label || catKey}?`)) {
      onUpdateCostItems(costItems.filter((item) => item.category !== catKey));
    }
  };

  const handleUpdateItemPrice = (id: string, price: number) => {
    onUpdateCostItems(
      costItems.map((item) => {
        if (item.id === id) {
          const days = item.daysOrDuration || 1;
          const newPrice = Math.max(0, price);
          return {
            ...item,
            unitPrice: newPrice,
            totalCost: newPrice * item.quantity * days,
          };
        }
        return item;
      })
    );
  };

  const filteredItems = costItems.filter((i) => i.category === activeCategoryTab);

  const getCategoryIcon = (key: CostCategoryKey) => {
    switch (key) {
      case 'presales': return <FileSearch className="w-4 h-4" />;
      case 'labor': return <Users className="w-4 h-4" />;
      case 'hospitality': return <Utensils className="w-4 h-4" />;
      case 'materials': return <Package className="w-4 h-4" />;
      case 'venue': return <Building2 className="w-4 h-4" />;
      case 'overhead': return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const renderCategorySection = (catKey: CostCategoryKey) => {
    const currentCatInfo = categoriesList.find((c) => c.key === catKey);
    const catItems = costItems.filter((i) => i.category === catKey);
    const categorySubtotal = catItems.reduce((acc, curr) => acc + curr.totalCost, 0);

    return (
      <div key={catKey} className="mb-6 last:mb-0">
        {/* Category Description Banner */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-teal-700 text-white">
                {currentCatInfo?.posCode}
              </span>
              <span className="text-sm font-bold text-slate-800">{currentCatInfo?.label}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{currentCatInfo?.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Subtotal POS</span>
              <span className="text-base font-bold text-teal-800 font-mono">
                {formatCurrency(categorySubtotal)}
              </span>
            </div>

            {isEditable && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveCategoryTab(catKey);
                    setIsAddingModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Item</span>
                </button>
                <button
                  onClick={() => handleClearCategory(catKey)}
                  className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg transition cursor-pointer"
                  title="Hapus Semua Item di POS ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cost Items Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                {isChecker && <th className="p-3 w-12 text-center">Audit</th>}
                <th className="p-3">Rincian Komponen Biaya</th>
                <th className="p-3 text-right">Tarif Satuan (Rp)</th>
                <th className="p-3 text-center">Volume/Qty</th>
                <th className="p-3 text-center">Durasi (Hari)</th>
                <th className="p-3 text-right">Total Biaya (Rp)</th>
                <th className="p-3 text-center">Pajak (Tax)</th>
                <th className="p-3">Keterangan</th>
                {isEditable && <th className="p-3 w-14 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium bg-white">
              {catItems.length === 0 ? (
                <tr>
                  <td colSpan={isChecker ? 9 : 8} className="p-6 text-center text-slate-400 italic">
                    {catKey === 'labor' ? (
                      <div className="flex flex-col items-center justify-center space-y-2.5 py-2">
                        <span className="text-slate-500 font-medium">Belum ada item biaya pada POS 01 (Direct Labor & Experts).</span>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={handleAddDefaultPos01Items}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition cursor-pointer not-italic shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Munculkan Default POS 01 (Trainer & Panitia, Volume 1)</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      'Belum ada item biaya pada kelompok POS ini.'
                    )}
                  </td>
                </tr>
              ) : (
                catItems.map((item) => {
                  const isVerified = verifiedItems[item.id] || false;

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition ${isVerified ? 'bg-emerald-50/40' : ''}`}>
                      
                      {/* Checker Verification Toggle */}
                      {isChecker && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onToggleVerifyItem(item.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                            }`}
                            title={isVerified ? 'Terverifikasi' : 'Klik untuk memverifikasi'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </td>
                      )}

                      <td className="p-3 font-bold text-slate-800">
                        {item.name}
                        {item.isVariablePerPax && (
                          <span className="ml-2 inline-flex items-center justify-center py-0.5 px-2 rounded font-bold text-[9px] uppercase leading-none bg-teal-50 text-teal-800 border border-teal-200">
                            Pax Auto-Calc
                          </span>
                        )}
                        {item.isPresalesOverhead && (
                          <span className="ml-2 inline-flex items-center justify-center py-0.5 px-2 rounded font-bold text-[9px] uppercase leading-none bg-amber-50 text-amber-800 border border-amber-200">
                            Presales
                          </span>
                        )}
                      </td>

                      {/* Unit Price (Editable in Konseptor mode) */}
                      <td className="p-3 text-right font-mono text-slate-700">
                        {isEditable ? (
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                            className="w-28 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono focus:bg-white focus:outline-teal-600 font-bold"
                          />
                        ) : (
                          formatCurrency(item.unitPrice)
                        )}
                      </td>

                      <td className="p-3 text-center font-mono font-medium text-slate-700">
                        {item.quantity} {item.unit}
                      </td>

                      <td className="p-3 text-center font-mono font-medium text-slate-700">
                        {item.daysOrDuration ? `${item.daysOrDuration} Hari` : '-'}
                      </td>

                      <td className="p-3 text-right font-bold font-mono text-slate-800">
                        {formatCurrency(item.totalCost)}
                      </td>

                      {/* Tax Treatment Tag */}
                      <td className="p-3 text-center">
                        {item.taxType === 'PPH21_TRAINER' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            PPh 21 (2.5%)
                          </span>
                        )}
                        {item.taxType === 'PPH23_JASA' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            PPh 23 (2%)
                          </span>
                        )}
                        {item.taxType === 'PB1_HOTEL_10' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            PB1 (10%)
                          </span>
                        )}
                        {item.taxType === 'PPN_11' && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            PPN (11%)
                          </span>
                        )}
                        {(!item.taxType || item.taxType === 'NON_TAX') && (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            Non-Tax
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-500 text-[11px]">
                        {item.notes || '-'}
                      </td>

                      {isEditable && (
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="text-teal-600 hover:text-teal-800 p-1 hover:bg-teal-50 rounded transition cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Hapus Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden transition-all">
      
      {/* Section Header */}
      <div className="p-5 border-b border-teal-800/40 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-xs border border-white/20 shrink-0">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-xs">
              Rincian Estimasi Biaya Pelatihan
            </h2>
            {activeHppName && (
              <p className="text-xs text-teal-100 font-medium mt-0.5">
                <span className="font-semibold text-white">{activeHppName}</span>
                {activeClientName && <span className="text-teal-200"> • {activeClientName}</span>}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isEditable && (
            <div className="flex items-center space-x-2">
              {onNavigateToProposal && (
                <button
                  type="button"
                  onClick={onNavigateToProposal}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 border border-emerald-500/50 shadow-xs text-xs sm:text-sm"
                  title="Ke Halaman Proposal Penawaran Klien"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Proposal Penawaran</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPrintSettingsModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 border border-slate-700 shadow-xs text-xs sm:text-sm"
                title="Cetak / Download PDF Estimasi Biaya HPP"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>Cetak PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateHppModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-md text-xs sm:text-sm"
                title="Buat HPP Baru (Arsipkan HPP Saat Ini)"
              >
                <Calculator className="w-4 h-4" />
                <span>Buat HPP Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-3.5 py-2 bg-teal-900 hover:bg-teal-950 text-teal-100 rounded-xl font-bold transition cursor-pointer flex items-center space-x-1.5 border border-teal-600 text-xs sm:text-sm"
                title="Arsip & Riwayat HPP"
              >
                <Layers className="w-4 h-4" />
                <span>Arsip HPP ({hppArchives.length})</span>
              </button>
            </div>
          )}

          {isChecker && (
            <div className="bg-teal-700/80 border border-teal-500 text-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Mode Verifikasi: Centang item yang sudah diaudit.</span>
            </div>
          )}
        </div>
      </div>

      {/* Archive Notification Banner */}
      {archiveSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 text-xs text-emerald-800 flex items-center justify-between transition-all">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{archiveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setArchiveSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold text-sm px-1 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Streamlined Headcount & Capacity Toolbar */}
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">
              Statistik Personel & Kapasitas (Hasil Isian Item):
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              (+5% Buffer Otomatis)
            </span>
          </div>

          {/* Info Statistics Cards (Non-editable) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between space-x-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Peserta</span>
              <span className="text-slate-800 font-bold font-mono">
                {derivedHeadcount.participants} Orang
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between space-x-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Trainer</span>
              <span className="text-slate-800 font-bold font-mono">
                {derivedHeadcount.trainers} Orang
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between space-x-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Panitia</span>
              <span className="text-slate-800 font-bold font-mono">
                {derivedHeadcount.organizers} Orang
              </span>
            </div>

            <div className="bg-teal-700 text-white px-3 py-1.5 rounded-lg border border-teal-800 flex items-center justify-between space-x-2 font-mono font-bold">
              <span className="text-[10px] text-teal-200 uppercase font-sans">Total Porsi</span>
              <span>{derivedHeadcount.totalHeadcount} Pax</span>
            </div>
          </div>
        </div>
      </div>

      {/* POS Category Tabs & View Switcher */}
      <div className="bg-white p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Kelompok Biaya HPP:
            </span>
            <span className="text-xs bg-teal-50 text-teal-800 font-mono font-bold px-2.5 py-0.5 rounded border border-teal-200">
              Total {formatCurrency(costItems.reduce((a, b) => a + b.totalCost, 0))}
            </span>
          </div>

          {/* View Mode Switcher & POS Actions */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
              className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center space-x-1 ${
                showTaxBreakdown
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Analisis Pajak</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'all'
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua POS</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'single'
                  ? 'bg-teal-700 text-white font-bold shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fokus 1 POS</span>
            </button>

            {isEditable && (
              <div className="flex items-center space-x-1 pl-1 ml-1 border-l border-slate-300">
                <button
                  type="button"
                  onClick={() => setIsAddPosModalOpen(true)}
                  className="px-2 py-1 bg-teal-800 hover:bg-teal-700 text-white rounded font-bold transition cursor-pointer flex items-center space-x-1"
                  title="Tambah Kelompok POS Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleClearCategory(activeCategoryTab)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold transition cursor-pointer flex items-center space-x-1"
                  title={`Hapus Semua Item di POS Aktif (${activeCategoryTab})`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus POS</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Indonesian Tax Intelligence Breakdown Panel */}
        {showTaxBreakdown && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-950 uppercase">
                  Estimasi Kewajiban Pajak (Withholding &amp; Indirect Tax)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                Total Pajak: {formatCurrency(taxSummary.grandTotalTax)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-slate-600 font-bold block text-[11px]">PPh 21 (Trainer - 2.5%)</span>
                <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(taxSummary.pph21Total)}</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-slate-600 font-bold block text-[11px]">PPh 23 (Jasa Cetak - 2%)</span>
                <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(taxSummary.pph23Total)}</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-slate-600 font-bold block text-[11px]">PB1 (Hotel &amp; Resto - 10%)</span>
                <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(taxSummary.pb1Total)}</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-slate-600 font-bold block text-[11px]">PPN Masukan (11%)</span>
                <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{formatCurrency(taxSummary.ppnTotal)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 6 Category Grid Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {categoriesList.map((cat) => {
            const isActive = viewMode === 'single' && activeCategoryTab === cat.key;
            const categoryItems = costItems.filter((i) => i.category === cat.key);
            const subtotal = categoryItems.reduce((acc, curr) => acc + curr.totalCost, 0);

            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategoryTab(cat.key);
                  setViewMode('single');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isActive
                    ? 'bg-teal-700 border-teal-700 text-white shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cat.posCode}
                  </span>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-teal-200' : 'text-slate-500'}`}>
                    {categoryItems.length} item
                  </span>
                </div>

                <div>
                  <div className={`text-xs font-bold truncate flex items-center space-x-1 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    <span className={isActive ? 'text-teal-200' : 'text-teal-700'}>{getCategoryIcon(cat.key)}</span>
                    <span className="truncate">{cat.label.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                  <p className={`text-[11px] font-mono font-bold mt-0.5 ${isActive ? 'text-emerald-300' : 'text-slate-700'}`}>
                    {formatCurrency(subtotal)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Content Area */}
      <div className="p-6">
        {viewMode === 'all' ? (
          <div className="space-y-8">
            {categoriesList.map((cat) => renderCategorySection(cat.key))}
          </div>
        ) : (
          renderCategorySection(activeCategoryTab)
        )}
      </div>

      {/* Add New Item Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Komponen Biaya HPP</h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Item / Rincian Biaya
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Sewa Laptop & Sound System 3 Hari"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tarif Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Satuan (Unit)
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600"
                  >
                    <option value="pax">pax</option>
                    <option value="orang">orang</option>
                    <option value="hari">hari</option>
                    <option value="kamar">kamar</option>
                    <option value="ruang">ruang</option>
                    <option value="paket">paket</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Volume / Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemDays}
                    onChange={(e) => setNewItemDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kategori Perlakuan Pajak (Indonesia Compliance)
                </label>
                <select
                  value={newItemTaxType}
                  onChange={(e) => setNewItemTaxType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600 font-medium"
                >
                  <option value="NON_TAX">Bukan Objek Pajak / Non-Tax</option>
                  <option value="PPH21_TRAINER">PPh 21 Tenaga Ahli / Trainer (2.5% tarif efektif)</option>
                  <option value="PPH23_JASA">PPh 23 Jasa Cetak &amp; Vendor (2.0%)</option>
                  <option value="PB1_HOTEL_10">PB1 / Pajak Daerah Hotel &amp; Resto (10.0%)</option>
                  <option value="PPN_11">PPN Masukan Pembelian Barang (11.0%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Catatan spesifikasi vendor..."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Komponen Biaya HPP</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEditedItem} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Item / Rincian Biaya
                </label>
                <input
                  type="text"
                  required
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tarif Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={editItemPrice}
                    onChange={(e) => setEditItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Volume / Qty
                  </label>
                  <input
                    type="number"
                    required
                    value={editItemQty}
                    onChange={(e) => setEditItemQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    value={editItemDays}
                    onChange={(e) => setEditItemDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Satuan Unit (pax/hari/org)
                  </label>
                  <input
                    type="text"
                    value={editItemUnit}
                    onChange={(e) => setEditItemUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kategori Perlakuan Pajak (Indonesia Compliance)
                </label>
                <select
                  value={editItemTaxType}
                  onChange={(e) => setEditItemTaxType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600 font-medium"
                >
                  <option value="NON_TAX">Bukan Objek Pajak / Non-Tax</option>
                  <option value="PPH21_TRAINER">PPh 21 Tenaga Ahli / Trainer (2.5%)</option>
                  <option value="PPH23_JASA">PPh 23 Jasa Cetak &amp; Vendor (2.0%)</option>
                  <option value="PB1_HOTEL_10">PB1 / Pajak Daerah Hotel &amp; Resto (10.0%)</option>
                  <option value="PPN_11">PPN Masukan Pembelian Barang (11.0%)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Keterangan Tambahan
                </label>
                <input
                  type="text"
                  value={editItemNotes}
                  onChange={(e) => setEditItemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Perbarui Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New POS Category Modal */}
      {isAddPosModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Kelompok POS Biaya Baru</h3>
              <button
                onClick={() => setIsAddPosModalOpen(false)}
                className="text-teal-200 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPosCategory} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama POS / Kelompok Biaya
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 6. Logistik & Transportasi Darat"
                  value={newPosLabel}
                  onChange={(e) => setNewPosLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Kode POS (misal: POS 05, POS 06)
                </label>
                <input
                  type="text"
                  required
                  value={newPosCode}
                  onChange={(e) => setNewPosCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-teal-600 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Deskripsi POS
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat tentang kelompok pos anggaran ini..."
                  value={newPosDesc}
                  onChange={(e) => setNewPosDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPosModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan POS Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buat HPP Baru */}
      {isCreateHppModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Buat HPP Pelatihan / Konsultansi Baru</span>
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  HPP saat ini akan otomatis diarsipkan ke Riwayat HPP agar tidak hilang.
                </p>
              </div>
              <button
                onClick={() => setIsCreateHppModalOpen(false)}
                className="text-emerald-200 hover:text-white text-xl font-bold cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewHpp} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Training / Konsultansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: In-House Training Good Corporate Governance (GCG) Batch 2"
                  value={newHppName}
                  onChange={(e) => setNewHppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Klien / Instansi
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: PT PLN (Persero)"
                    value={newHppClient}
                    onChange={(e) => setNewHppClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kategori Klien
                  </label>
                  <select
                    value={newHppClientType}
                    onChange={(e) => setNewHppClientType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-emerald-600 font-medium"
                  >
                    <option value="BUMN">BUMN / BUMD</option>
                    <option value="Swasta Nasional">Swasta Nasional / Tbk</option>
                    <option value="Multinasional">Perusahaan Multinasional</option>
                    <option value="Kementerian / Lembaga">Kementerian / Lembaga Pemerintah</option>
                    <option value="Non-Profit">Non-Profit / Yayasan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jumlah Peserta (Pax)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newHppParticipants}
                    onChange={(e) => setNewHppParticipants(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newHppDays}
                    onChange={(e) => setNewHppDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Margin (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={newHppMargin}
                    onChange={(e) => setNewHppMargin(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lokasi / Kota Pelaksanaan & Venue
                </label>
                <input
                  type="text"
                  placeholder="Misal: Jakarta / Hotel Grand Sahid Jaya"
                  value={newHppLocation}
                  onChange={(e) => setNewHppLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan / Ruang Lingkup Proyek
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan, misal: Termasuk sertifikasi BNSP, modul cetak eksklusif, dan konsumsi."
                  value={newHppNotes}
                  onChange={(e) => setNewHppNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-teal-800">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Otomatisasi Penyimpanan Arsip & Default POS 01:</span>
                </div>
                <p className="text-[11px] text-teal-700 leading-relaxed">
                  {costItems.length > 0 || activeHppName ? (
                    <>
                      HPP saat ini{' '}
                      <strong>
                        "{activeHppName || 'HPP Pelatihan & Konsultansi'}"
                      </strong>{' '}
                      ({costItems.length} item, Total:{' '}
                      {formatCurrency(costItems.reduce((a, b) => a + b.totalCost, 0))}){' '}
                      akan <strong>otomatis tersimpan sebagai arsip</strong>.
                    </>
                  ) : (
                    'HPP sebelumnya masih kosong. HPP baru akan langsung dibuat.'
                  )}
                </p>
                <p className="text-[11px] text-teal-800 font-semibold pt-1 border-t border-teal-200/60">
                  Secara default, POS 01 (Direct Labor & Experts) akan langsung memuat 2 item: <strong>Trainer</strong> (Volume: 1 Orang) dan <strong>Panitia</strong> (Volume: 1 Orang).
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateHppModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Buat HPP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Arsip & Riwayat HPP */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-teal-300" />
                  <span>Arsip & Riwayat HPP ({hppArchives.length})</span>
                </h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  Daftar HPP yang pernah dibuat dan diarsipkan otomatis. Anda dapat menampilkan HPP kembali kapan saja.
                </p>
              </div>
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="text-teal-200 hover:text-white text-xl font-bold cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {hppArchives.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada HPP yang diarsipkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {hppArchives.map((archive) => (
                    <div
                      key={archive.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-800 text-white rounded-full">
                            {archive.clientType}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {archive.createdAt}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {archive.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Klien: <strong className="text-slate-800">{archive.clientName}</strong> • {archive.participants} Pax • {archive.days} Hari • <span className="text-teal-700 font-bold">{archive.costItems?.length || 0} Item POS</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-medium">Total HPP</span>
                          <span className="text-xs font-mono font-bold text-teal-800">
                            {formatCurrency(archive.totalCost)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {activeHppName === archive.name ? (
                            <span className="px-2.5 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold inline-flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sedang Aktif</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestoreArchive(archive)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                              title="Tampilkan HPP ini ke Lembar Kerja"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Tampilkan</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteArchive(archive.id, archive.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus Arsip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PENGATURAN CETAK PDF HPP */}
      {/* ========================================================================= */}
      {isPrintSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" /> Pengaturan Cetak PDF Estimasi HPP
              </h3>
              <button
                type="button"
                onClick={() => setIsPrintSettingsModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih bagian dan kelompok POS biaya yang ingin disertakan saat mencetak Laporan Estimasi Biaya HPP:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'summary', label: 'Ringkasan & Kapasitas Personel' },
                  { id: 'presales', label: 'POS 00 - Overhead & Pitching' },
                  { id: 'labor', label: 'POS 01 - Expert & Trainer Labor' },
                  { id: 'hospitality', label: 'POS 02 - Konsumsi & Hospitality' },
                  { id: 'materials', label: 'POS 03 - ATK, Modul & Kit' },
                  { id: 'venue', label: 'POS 04 - Venue & Akomodasi' },
                  { id: 'overhead', label: 'POS 05 - Legal & Management Overhead' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center space-x-2.5 cursor-pointer hover:bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <input
                      type="checkbox"
                      checked={selectedPrintSections.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPrintSections([...selectedPrintSections, item.id]);
                        else setSelectedPrintSections(selectedPrintSections.filter((s) => s !== item.id));
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsPrintSettingsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={triggerHppPdfDownload}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
