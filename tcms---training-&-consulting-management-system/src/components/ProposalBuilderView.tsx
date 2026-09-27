import React, { useState } from 'react';
import {
  ProposalDocument,
  ProposalProjectType,
  TrainingProposalDetails,
  ConsultingProposalDetails,
  ProjectOpportunity,
  CostItem,
  TrainingSyllabus,
  ProposalTemplate,
  ProposalSection,
} from '../types';
import { INITIAL_PROPOSALS } from '../data/initialProposals';
import { ProposalOfficialPrintView } from './ProposalOfficialPrintView';
import { formatCurrency } from '../utils/calculator';
import { generateDirectProposalPdf } from '../utils/directProposalPdfGenerator';
import {
  FileText,
  FileSignature,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Users,
  Award,
  Layers,
  Sparkles,
  Printer,
  Download,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Sliders,
  DollarSign,
  ChevronRight,
  Briefcase,
  BookOpen,
  Edit3,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';

const INITIAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'tpl-training-manajerial',
    name: 'Template Pelatihan Manajerial BUMN',
    description: 'Format proposal formal untuk pelatihan tingkat supervisor & asisten manajer BUMN.',
    projectType: 'training',
    title: 'Pengembangan Kapabilitas Manajerial & Kepemimpinan Adaptif',
    durationText: '3 Hari (24 Jam Pelajaran)',
    taxNotes: 'Harga belum termasuk PPN 11%. PPh 23 (2%) dipotong oleh klien.',
    paymentTerms: 'Termin I (DP 50% setelah SPK), Termin II (Pelunasan 50% setelah BAST).',
    signatoryName: 'Rian Pratama, S.E., M.M.',
    signatoryTitle: 'Head of Commercial TCMS',
    termsAndConditions: [
      'Harga penawaran berlaku selama 30 hari kalender sejak tanggal terbit proposal.',
      'Jumlah peserta maksimum adalah 30 pax per kelas untuk menjaga efektivitas.',
      'Pembatalan sepihak < 7 hari pelaksanaan dikenakan biaya kompensasi 20%.'
    ],
    learningObjectives: [
      'Menguasai metodologi komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
      'Peningkatan efektivitas koordinasi lintas divisi dan resolusi hambatan operasional.'
    ],
    sections: [
      {
        id: 'sec-1',
        title: '1. Pendahuluan & Latar Belakang',
        type: 'text',
        content: 'Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, kami berkomitmen untuk membina dan melatih kompetensi berkelanjutan untuk menghasilkan talenta unggul siap pakai.'
      },
      {
        id: 'sec-2',
        title: '2. Output & Sasaran Pelatihan',
        type: 'bullet_list',
        content: 'Berikut adalah butir-butir kompetensi pembelajaran yang akan diraih oleh para peserta setelah mengikuti program pelatihan:',
        items: [
          'Menguasai komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
          'Peningkatan efektivitas koordinasi lintas divisi.'
        ]
      },
      {
        id: 'sec-3',
        title: '3. Agenda & Kurikulum Pelatihan (Syllabus)',
        type: 'table_syllabus',
        content: 'Berikut adalah jadwal dan pembagian jam pelajaran materi silabus terintegrasi:'
      },
      {
        id: 'sec-4',
        title: '4. Komersial & Struktur Investasi',
        type: 'table_costs',
        content: 'Berikut adalah rincian biaya penawaran komersial resmi yang kami usulkan berdasarkan kalkulasi HPP internal:'
      },
      {
        id: 'sec-5',
        title: '5. Klausul Penutup & Tanda Tangan',
        type: 'signatory',
        content: 'Demikian proposal penawaran ini kami ajukan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.'
      }
    ]
  },
  {
    id: 'tpl-consulting-governance',
    name: 'Template Konsultansi Tata Kelola & SOP',
    description: 'Format proposal kajian kelayakan, pengembangan struktur SOP, dan manajemen risiko komersial.',
    projectType: 'consulting',
    title: 'Redesain Struktur Organisasi & Standardisasi SOP Operasional',
    durationText: '8 Pekan Kerja',
    taxNotes: 'Harga penawaran bersifat net setelah dikurangi PPh 23 terkait jasa konsultan.',
    paymentTerms: 'Termin 1 (DP 30%), Termin 2 (Draft SOP 40%), Termin 3 (Pelunasan 30% pasca-BAST).',
    signatoryName: 'Dra. Sri Wahyuni, M.B.A.',
    signatoryTitle: 'Lead Partner Management Consulting',
    termsAndConditions: [
      'Seluruh hak cipta modul, kajian analisis, dan dokumen SOP final dilindungi undang-undang.',
      'Klien wajib menunjuk narahubung internal untuk kelancaran pengumpulan data kajian.',
      'Perpanjangan masa kajian karena keterlambatan feedback klien dikenakan biaya tambahan.'
    ],
    consultingProblemStatement: 'Kebutuhan integrasi tata kelola operasional dan perbaikan alur birokrasi pembiayaan untuk memitigasi deviasi audit.',
    consultingFramework: '5-Stage Strategic Consulting: (1) As-Is Assessment, (2) Gap Analysis & Benchmarking, (3) To-Be Architecture, (4) Pilot Rollout, (5) Handover & BAST.',
    sections: [
      {
        id: 'sec-1',
        title: '1. Executive Summary & Masalah Utama',
        type: 'text',
        content: 'Menghadapi kompleksitas tata kelola dan tantangan operasional, rancangan perbaikan ini dirancang untuk menyelesaikan ketidaksesuaian SOP dan meningkatkan transparansi.'
      },
      {
        id: 'sec-2',
        title: '2. Tahapan Kerja (Milestone & Termin)',
        type: 'table_milestones',
        content: 'Pekerjaan konsultansi dilaksanakan dengan kerangka kerja yang terbagi menjadi fase-fase berikut:'
      },
      {
        id: 'sec-3',
        title: '3. Rincian Biaya & Investasi Jasa Konsultan',
        type: 'table_costs',
        content: 'Berikut adalah rincian nilai penawaran jasa konsultansi profesional yang mencakup tim ahli:'
      },
      {
        id: 'sec-4',
        title: '4. Otorisasi Lembar Pengesahan',
        type: 'signatory',
        content: 'Demikian penawaran program konsultansi ini kami sampaikan. Kami sangat menantikan kolaborasi konstruktif ini.'
      }
    ]
  }
];

interface ProposalBuilderViewProps {
  currentProject?: ProjectOpportunity;
  currentCostItems?: CostItem[];
  onNavigateToHpp?: () => void;
  onSyncProposalToHpp?: (proposal: ProposalDocument) => void;
  initialSyllabus?: TrainingSyllabus | null;
  onClearInitialSyllabus?: () => void;
}

export const ProposalBuilderView: React.FC<ProposalBuilderViewProps> = ({
  currentProject,
  currentCostItems,
  onNavigateToHpp,
  onSyncProposalToHpp,
  initialSyllabus,
  onClearInitialSyllabus,
}) => {
  const [proposals, setProposals] = useState<ProposalDocument[]>(INITIAL_PROPOSALS);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'training' | 'consulting'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Preview / Print Modal
  const [selectedProposalForPrint, setSelectedProposalForPrint] = useState<ProposalDocument | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  // Direct native PDF download: Pure vector bytecode, ZERO image/canvas conversion
  const handleDirectDownloadProposalPdf = async (prop: ProposalDocument) => {
    setDownloadingPdfId(prop.id);
    try {
      const cleanNumber = prop.proposalNumber.replace(/[\/\\]/g, '-');
      const filename = `Dokumen-Proposal-${cleanNumber}.pdf`;

      const success = await generateDirectProposalPdf(prop, filename);

      if (success) {
        showNotification(`📄 Proposal PDF "${cleanNumber}" berhasil diunduh (Murni PDF Vektor, Tanpa Gambar)!`);
      } else {
        showNotification('⚠️ Terjadi kendala saat memproses file PDF.');
      }
    } catch (err) {
      console.error('Direct PDF Download Error:', err);
      showNotification('❌ Terjadi kesalahan teknis saat mengunduh PDF proposal.');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  // Form State
  const [formProjectType, setFormProjectType] = useState<ProposalProjectType>('training');
  const [formProposalNumber, setFormProposalNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientType, setFormClientType] = useState<ProposalDocument['clientType']>('BUMN');
  const [formClientPicName, setFormClientPicName] = useState('');
  const [formClientPicPosition, setFormClientPicPosition] = useState('');
  const [formValidityDays, setFormValidityDays] = useState(30);
  const [formStartDateEst, setFormStartDateEst] = useState('10 November 2026');
  const [formDurationText, setFormDurationText] = useState('3 Hari Intensif (24 JP)');
  const [formParticipantsCount, setFormParticipantsCount] = useState<number>(30);
  const [formInternalHppCost, setFormInternalHppCost] = useState<number>(120000000);
  const [formProposedSellingPrice, setFormProposedSellingPrice] = useState<number>(185000000);
  const [formTaxNotes, setFormTaxNotes] = useState('Harga belum termasuk PPN 11%. PPh 23 (2%) dipotong oleh klien.');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Termin I (DP 50%), Termin II (Pelunasan 50% setelah Laporan Evaluasi).');
  const [formSignatoryName, setFormSignatoryName] = useState('Rian Pratama, S.E., M.M.');
  const [formSignatoryTitle, setFormSignatoryTitle] = useState('Head of Commercial TCMS');

  // Specific state for Training
  const [trainingTargetAudience, setTrainingTargetAudience] = useState('Level Supervisor & Asisten Manajer (30 Pax)');
  const [trainingMethod, setTrainingMethod] = useState<TrainingProposalDetails['trainingMethod']>('Residential Hotel Workshop');
  const [trainingLearningObjectives, setTrainingLearningObjectives] = useState<string[]>([
    'Menguasai metodologi komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
    'Peningkatan efektivitas koordinasi lintas divisi dan resolusi hambatan operasional.',
  ]);
  const [newObjectiveText, setNewObjectiveText] = useState('');

  // Specific state for Consulting
  const [consultingProblemStatement, setConsultingProblemStatement] = useState(
    'Kebutuhan integrasi tata kelola operasional dan perbaikan alur birokrasi pembiayaan untuk memitigasi deviasi audit.'
  );
  const [consultingFramework, setConsultingFramework] = useState(
    '4-Stage Consultative Lifecycle: (1) Diagnostik As-Is, (2) Redesain To-Be, (3) Uji Coba Pilot, (4) Handover & BAST.'
  );

  // Active View Tab: 'pipeline' | 'editor' | 'templates'
  const [activeViewTab, setActiveViewTab] = useState<'pipeline' | 'editor' | 'templates'>('pipeline');
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>('');

  // Dynamic Proposal Sections State for Custom Template editor
  const [formSections, setFormSections] = useState<ProposalSection[]>([]);

  // Helper to build a full ProposalDocument from current editor form state
  const buildDocFromFormState = (): ProposalDocument => {
    const existingProp = proposals.find((p) => p.id === editingProposalId);
    return {
      id: editingProposalId || `prop-${Date.now()}`,
      proposalNumber: formProposalNumber || 'PROP-TCMS/TRN/2026/09/DRAFT',
      projectType: formProjectType,
      title: formTitle,
      clientName: formClientName,
      clientType: formClientType,
      clientPicName: formClientPicName || 'Bapak/Ibu Pimpinan Divisi',
      clientPicPosition: formClientPicPosition || 'Kepala Divisi',
      dateCreated: existingProp?.dateCreated || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      validityDays: formValidityDays,
      startDateEst: formStartDateEst,
      durationText: formDurationText,
      participantsCount: formProjectType === 'training' ? formParticipantsCount : undefined,
      internalHppCost: formInternalHppCost,
      proposedSellingPrice: formProposedSellingPrice,
      targetMarginPercent: formProposedSellingPrice > 0 ? Number((((formProposedSellingPrice - formInternalHppCost) / formProposedSellingPrice) * 100).toFixed(1)) : 0,
      includePpn11: false,
      taxNotes: formTaxNotes,
      paymentTerms: formPaymentTerms,
      status: existingProp?.status || 'Draf Penawaran',
      signatoryName: formSignatoryName,
      signatoryTitle: formSignatoryTitle,
      termsAndConditions: [
        `Penawaran harga ini berlaku selama ${formValidityDays} hari kalender sejak tanggal proposal diterbitkan.`,
        `Konfirmasi pelaksanaan dilakukan dengan menerbitkan Surat Perintah Kerja (SPK) atau Purchase Order (PO) resmi dari ${formClientName || 'klien'}.`,
        'Jadwal definitif disepakati selambat-lambatnya 7 hari kerja sebelum tanggal pelaksanaan.',
        'Pembatalan sepihak setelah penandatanganan SPK/PO akan dikenakan biaya persiapan operasional.',
      ],
      trainingDetails: formProjectType === 'training' ? {
        targetAudience: trainingTargetAudience,
        trainingMethod: trainingMethod,
        learningObjectives: trainingLearningObjectives,
        modules: existingProp?.trainingDetails?.modules || [
          {
            dayNumber: 1,
            title: 'Hari 1: Customer-Centric Culture & Customer Journey Mapping',
            durationHours: 8,
            topics: [
              'Paradigma Baru Service Excellence di Era B2B Digital',
              'Memetakan Customer Touchpoints & Momen Kritis (Moments of Truth)',
              'Identifikasi Kebutuhan Tersembunyi (Customer Empathy Mapping)',
              'Studi Kasus: Anatomi Kegagalan Layanan & Pelajaran Kritis',
            ],
            interactiveMethod: 'Kuliah Interaktif, Pemetaan Kanvas Persona, Diskusi Kelompok',
          },
          {
            dayNumber: 2,
            title: 'Hari 2: High-Impact Communication & Advanced Service Recovery',
            durationHours: 8,
            topics: [
              'Teknik Komunikasi Asertif & De-eskalasi Ketegangan dengan Klien Strategis',
              'Protokol HEAR (Hear, Empathize, Apologize, Resolve) dalam Komplain',
              'Simulasi Menghadapi Situasi Kritis & Pelanggan Menuntut',
              'Praktik Role-Play Langsung di Depan Kamera dengan Feedback Instan',
            ],
            interactiveMethod: 'Simulasi Role-Play dengan Rekaman Video & Umpan Balik Personal',
          },
        ],
        trainers: existingProp?.trainingDetails?.trainers || [
          {
            name: 'Dr. Hendra Gunawan, MBA',
            role: 'Master Trainer & Konsultan Senior',
            credentials: 'Certified International Trainer, 20+ Tahun Pengalaman BUMN.',
            specialization: 'Strategic Leadership & Corporate Performance',
          },
        ],
        facilitiesIncluded: existingProp?.trainingDetails?.facilitiesIncluded || [
          'Paket Meeting Hotel & Konsumsi Lengkap.',
          'Buku Modul Eksklusif & Seminar Kit Premium.',
          'Sertifikat Kelulusan Resmi Star Office TCMS.',
        ],
        evaluationModel: existingProp?.trainingDetails?.evaluationModel || 'Evaluasi Kirkpatrick Level 1 & 2',
      } : undefined,
      consultingDetails: formProjectType === 'consulting' ? {
        consultingType: existingProp?.consultingDetails?.consultingType || 'Tata Kelola & SOP',
        problemStatement: consultingProblemStatement,
        approachFramework: consultingFramework,
        milestones: existingProp?.consultingDetails?.milestones || [
          {
            phase: 'Fase I',
            phaseTitle: 'Diagnostik As-Is & Gap Analysis',
            durationWeeks: 'Pekan 1–2',
            keyActivities: ['Wawancara pemangku kepentingan', 'Audit SOP berjalan'],
            deliverables: 'Laporan Diagnostik Kesenjangan Proses Bisnis',
            paymentPercentage: 30,
          },
          {
            phase: 'Fase II',
            phaseTitle: 'Redesain Arsitektur & SOP To-Be',
            durationWeeks: 'Pekan 3–4',
            keyActivities: ['Penyusunan matriks RACI', 'Perumusan pedoman tata kelola'],
            deliverables: 'Draft Buku Pedoman SOP & Dokumen Kebijakan Baru',
            paymentPercentage: 40,
          },
        ],
        expertTeam: existingProp?.consultingDetails?.expertTeam || [
          {
            name: 'Dra. Sri Wahyuni, M.B.A.',
            role: 'Lead Consultant / Project Director',
            manDays: 20,
            billingRateDaily: 5000000,
          },
        ],
        finalDeliverables: existingProp?.consultingDetails?.finalDeliverables || [
          'Dokumen SOP Final Terbukti & Berita Acara BAST.',
        ],
      } : undefined,
      sections: formSections,
    };
  };

  // Helper to construct default dynamic proposal sections by type
  const getDefaultSectionsForType = (type: ProposalProjectType): ProposalSection[] => {
    if (type === 'training') {
      return [
        {
          id: 'sec-1',
          title: '1. Pendahuluan & Latar Belakang',
          type: 'text',
          content: 'Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, kami berkomitmen untuk membina dan melatih kompetensi berkelanjutan untuk menghasilkan talenta unggul siap pakai.'
        },
        {
          id: 'sec-2',
          title: '2. Output & Sasaran Pelatihan',
          type: 'bullet_list',
          content: 'Berikut adalah butir-butir kompetensi pembelajaran yang akan diraih oleh para peserta setelah mengikuti program pelatihan:',
          items: [
            'Menguasai komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
            'Peningkatan efektivitas koordinasi lintas divisi.'
          ]
        },
        {
          id: 'sec-3',
          title: '3. Agenda & Kurikulum Pelatihan (Syllabus)',
          type: 'table_syllabus',
          content: 'Berikut adalah jadwal dan pembagian jam pelajaran materi silabus terintegrasi:'
        },
        {
          id: 'sec-4',
          title: '4. Komersial & Struktur Investasi',
          type: 'table_costs',
          content: 'Berikut adalah rincian biaya penawaran komersial resmi yang kami usulkan berdasarkan kalkulasi HPP internal:'
        },
        {
          id: 'sec-5',
          title: '5. Klausul Penutup & Tanda Tangan',
          type: 'signatory',
          content: 'Demikian proposal penawaran ini kami ajukan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.'
        }
      ];
    } else {
      return [
        {
          id: 'sec-1',
          title: '1. Executive Summary & Masalah Utama',
          type: 'text',
          content: 'Menghadapi kompleksitas tata kelola dan tantangan operasional, rancangan perbaikan ini dirancang untuk menyelesaikan ketidaksesuaian SOP dan meningkatkan transparansi.'
        },
        {
          id: 'sec-2',
          title: '2. Tahapan Kerja (Milestone & Termin)',
          type: 'table_milestones',
          content: 'Pekerjaan konsultansi dilaksanakan dengan kerangka kerja yang terbagi menjadi fase-fase berikut:'
        },
        {
          id: 'sec-3',
          title: '3. Rincian Biaya & Investasi Jasa Konsultan',
          type: 'table_costs',
          content: 'Berikut adalah rincian nilai penawaran jasa konsultansi profesional yang mencakup tim ahli:'
        },
        {
          id: 'sec-4',
          title: '4. Otorisasi Lembar Pengesahan',
          type: 'signatory',
          content: 'Demikian penawaran program konsultansi ini kami sampaikan. Kami sangat menantikan kolaborasi konstruktif ini.'
        }
      ];
    }
  };

  // Open any proposal or template directly into the Dynamic Proposal Editor Workspace Tab
  const handleOpenInDynamicEditor = (target: ProposalDocument | ProposalTemplate) => {
    if ('proposalNumber' in target) {
      const prop = target as ProposalDocument;
      setEditingProposalId(prop.id);
      setFormProjectType(prop.projectType);
      setFormProposalNumber(prop.proposalNumber);
      setFormTitle(prop.title);
      setFormClientName(prop.clientName);
      setFormClientType(prop.clientType);
      setFormClientPicName(prop.clientPicName);
      setFormClientPicPosition(prop.clientPicPosition);
      setFormValidityDays(prop.validityDays);
      setFormStartDateEst(prop.startDateEst);
      setFormDurationText(prop.durationText);
      setFormParticipantsCount(prop.participantsCount || 30);
      setFormInternalHppCost(prop.internalHppCost);
      setFormProposedSellingPrice(prop.proposedSellingPrice);
      setFormTaxNotes(prop.taxNotes);
      setFormPaymentTerms(prop.paymentTerms);
      setFormSignatoryName(prop.signatoryName);
      setFormSignatoryTitle(prop.signatoryTitle);
      if (prop.trainingDetails) {
        setTrainingTargetAudience(prop.trainingDetails.targetAudience);
        setTrainingMethod(prop.trainingDetails.trainingMethod);
        setTrainingLearningObjectives(prop.trainingDetails.learningObjectives);
      }
      if (prop.consultingDetails) {
        setConsultingProblemStatement(prop.consultingDetails.problemStatement);
        setConsultingFramework(prop.consultingDetails.approachFramework);
      }
      setFormSections(prop.sections && prop.sections.length > 0 ? prop.sections : getDefaultSectionsForType(prop.projectType));
      setSelectedBaselineId(`prop:${prop.id}`);
    } else {
      const tpl = target as ProposalTemplate;
      setEditingProposalId(null);
      setFormProjectType(tpl.projectType);
      const randomCode = Math.floor(100 + Math.random() * 900);
      const codePrefix = tpl.projectType === 'training' ? 'TRN' : 'CNS';
      setFormProposalNumber(`PROP-TCMS/${codePrefix}/2026/09/${randomCode}`);
      setFormTitle(tpl.title);
      setFormClientName(currentProject?.clientName || 'PT Client Enterprise BUMN');
      setFormClientType('BUMN');
      setFormClientPicName('Bapak / Ibu Kepala Divisi');
      setFormClientPicPosition('Kepala Divisi Human Capital & Learning Academy');
      setFormDurationText(tpl.durationText);
      setFormTaxNotes(tpl.taxNotes);
      setFormPaymentTerms(tpl.paymentTerms);
      setFormSignatoryName(tpl.signatoryName);
      setFormSignatoryTitle(tpl.signatoryTitle);
      if (tpl.learningObjectives) setTrainingLearningObjectives(tpl.learningObjectives);
      if (tpl.consultingProblemStatement) setConsultingProblemStatement(tpl.consultingProblemStatement);
      if (tpl.consultingFramework) setConsultingFramework(tpl.consultingFramework);
      setFormSections(tpl.sections && tpl.sections.length > 0 ? tpl.sections : getDefaultSectionsForType(tpl.projectType));
      setSelectedBaselineId(`tpl:${tpl.id}`);
    }
    setActiveViewTab('editor');
    showNotification('⚡ Draf proposal telah dimuat ke Editor Dinamis! Anda dapat menyesuaikan bab, narasi, dan pratinjau langsung.');
  };

  // Load templates from localStorage or INITIAL_TEMPLATES
  const [templates, setTemplates] = useState<ProposalTemplate[]>(() => {
    const saved = localStorage.getItem('staroffice_proposal_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProposalTemplate[];
        // Auto-upgrade system templates if they are missing the "sections" field or have empty sections
        return parsed.map(tpl => {
          const sysTpl = INITIAL_TEMPLATES.find(t => t.id === tpl.id);
          if (sysTpl && (!tpl.sections || tpl.sections.length === 0)) {
            return sysTpl;
          }
          return tpl;
        });
      } catch (e) {
        return INITIAL_TEMPLATES;
      }
    }
    return INITIAL_TEMPLATES;
  });

  // Save templates to localStorage whenever templates state changes
  React.useEffect(() => {
    localStorage.setItem('staroffice_proposal_templates', JSON.stringify(templates));
  }, [templates]);

  // Template Manager UI Modal/Form States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateFormName, setTemplateFormName] = useState('');
  const [templateFormDesc, setTemplateFormDesc] = useState('');
  const [isTemplateViewOpen, setIsTemplateViewOpen] = useState(false);

  // Save current design as template state helper
  const [isSaveAsTemplateOpen, setIsSaveAsTemplateOpen] = useState(false);
  const [newTemplateNameInput, setNewTemplateNameInput] = useState('');
  const [newTemplateDescInput, setNewTemplateDescInput] = useState('');

  // Apply template values directly to current active form
  const handleApplyTemplate = (tpl: ProposalTemplate) => {
    setFormProjectType(tpl.projectType);
    setFormTitle(tpl.title);
    setFormDurationText(tpl.durationText);
    setFormTaxNotes(tpl.taxNotes);
    setFormPaymentTerms(tpl.paymentTerms);
    setFormSignatoryName(tpl.signatoryName);
    setFormSignatoryTitle(tpl.signatoryTitle);

    if (tpl.projectType === 'training') {
      if (tpl.learningObjectives) {
        setTrainingLearningObjectives(tpl.learningObjectives);
      }
    } else {
      if (tpl.consultingProblemStatement) {
        setConsultingProblemStatement(tpl.consultingProblemStatement);
      }
      if (tpl.consultingFramework) {
        setConsultingFramework(tpl.consultingFramework);
      }
    }

    if (tpl.sections && tpl.sections.length > 0) {
      setFormSections(tpl.sections);
    } else {
      setFormSections([]);
    }

    showNotification(`✨ Berhasil menerapkan tata letak dari templat: "${tpl.name}"!`);
  };

  // Save current proposal form as a new template
  const handleSaveCurrentAsTemplate = (name: string, desc: string) => {
    if (!name.trim()) return;

    const newTpl: ProposalTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      description: desc || 'Templat kustom yang disimpan dari rancangan aktif.',
      projectType: formProjectType,
      title: formTitle,
      durationText: formDurationText,
      taxNotes: formTaxNotes,
      paymentTerms: formPaymentTerms,
      signatoryName: formSignatoryName,
      signatoryTitle: formSignatoryTitle,
      termsAndConditions: [
        'Harga penawaran berlaku selama 30 hari kalender sejak tanggal terbit proposal.',
        'Jumlah peserta maksimum disesuaikan untuk menjaga efektivitas kelas.'
      ],
      sections: formSections,
      ...(formProjectType === 'training'
        ? { learningObjectives: trainingLearningObjectives }
        : {
            consultingProblemStatement: consultingProblemStatement,
            consultingFramework: consultingFramework,
          })
    };

    setTemplates((prev) => [newTpl, ...prev]);
    showNotification(`💾 Templat kustom "${name}" berhasil disimpan untuk penggunaan berulang!`);
  };

  // Delete Template
  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showNotification('🗑️ Templat berhasil dihapus!');
  };

  // Create or Update Template
  const handleSaveTemplateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormName.trim()) return;

    if (editingTemplateId) {
      // Edit existing
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== editingTemplateId) return t;
          return {
            ...t,
            name: templateFormName,
            description: templateFormDesc,
            projectType: formProjectType,
            title: formTitle,
            durationText: formDurationText,
            taxNotes: formTaxNotes,
            paymentTerms: formPaymentTerms,
            signatoryName: formSignatoryName,
            signatoryTitle: formSignatoryTitle,
            learningObjectives: formProjectType === 'training' ? trainingLearningObjectives : undefined,
            consultingProblemStatement: formProjectType === 'consulting' ? consultingProblemStatement : undefined,
            consultingFramework: formProjectType === 'consulting' ? consultingFramework : undefined,
            sections: formSections,
          };
        })
      );
      showNotification(`💾 Perubahan templat "${templateFormName}" disimpan!`);
    } else {
      // Create fresh template from form
      const newTpl: ProposalTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateFormName,
        description: templateFormDesc || 'Templat kustom baru.',
        projectType: formProjectType,
        title: formTitle,
        durationText: formDurationText,
        taxNotes: formTaxNotes,
        paymentTerms: formPaymentTerms,
        signatoryName: formSignatoryName,
        signatoryTitle: formSignatoryTitle,
        termsAndConditions: [
          'Harga penawaran berlaku selama 30 hari kalender sejak tanggal terbit proposal.',
          'Klien wajib menunjuk narahubung internal untuk kelancaran pengerjaan.'
        ],
        learningObjectives: formProjectType === 'training' ? trainingLearningObjectives : undefined,
        consultingProblemStatement: formProjectType === 'consulting' ? consultingProblemStatement : undefined,
        consultingFramework: formProjectType === 'consulting' ? consultingFramework : undefined,
        sections: formSections,
      };
      setTemplates((prev) => [newTpl, ...prev]);
      showNotification(`✨ Templat kustom baru "${templateFormName}" berhasil dibuat!`);
    }

    setIsTemplateModalOpen(false);
    setEditingTemplateId(null);
  };

  // Open Edit Template Form Modal
  const handleOpenEditTemplateModal = (tpl: ProposalTemplate) => {
    setEditingTemplateId(tpl.id);
    setTemplateFormName(tpl.name);
    setTemplateFormDesc(tpl.description);
    setFormProjectType(tpl.projectType);
    setFormTitle(tpl.title);
    setFormDurationText(tpl.durationText);
    setFormTaxNotes(tpl.taxNotes);
    setFormPaymentTerms(tpl.paymentTerms);
    setFormSignatoryName(tpl.signatoryName);
    setFormSignatoryTitle(tpl.signatoryTitle);

    if (tpl.projectType === 'training' && tpl.learningObjectives) {
      setTrainingLearningObjectives(tpl.learningObjectives);
    } else if (tpl.projectType === 'consulting') {
      setConsultingProblemStatement(tpl.consultingProblemStatement || '');
      setConsultingFramework(tpl.consultingFramework || '');
    }

    if (tpl.sections && tpl.sections.length > 0) {
      setFormSections(tpl.sections);
    } else {
      setFormSections([]);
    }

    setIsTemplateModalOpen(true);
  };

  // Open Create Template Modal
  const handleOpenCreateTemplateModal = () => {
    setEditingTemplateId(null);
    setTemplateFormName('');
    setTemplateFormDesc('');
    // prefill with whatever is currently in the active form
    setIsTemplateModalOpen(true);
  };

  // Notification Banner
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Handle pre-fill from selected syllabus
  React.useEffect(() => {
    if (initialSyllabus) {
      setEditingProposalId(null);
      setFormProjectType('training');
      const randomCode = Math.floor(100 + Math.random() * 900);
      setFormProposalNumber(`PROP-TCMS/TRN/2026/09/${randomCode}`);
      setFormTitle(`Proposal Penawaran Program Pelatihan: ${initialSyllabus.title}`);
      setFormClientName(currentProject?.clientName || 'PT Mitra Korporasi / BUMN');
      setFormClientType('BUMN');
      setFormClientPicName('Bapak / Ibu Kepala Divisi Human Capital');
      setFormClientPicPosition('Head of Learning & Development');
      setFormDurationText(`${initialSyllabus.durationDays} Hari (${initialSyllabus.durationDays * 8} Jam Pelajaran)`);
      const pax = initialSyllabus.recommendedPax || 30;
      setFormParticipantsCount(pax);
      setTrainingTargetAudience(`Target: Peserta Tingkat Manajerial & Staf Relevan (${pax} Pax)`);
      setTrainingMethod('Residential Hotel Workshop');
      setTrainingLearningObjectives(
        initialSyllabus.learningOutcomes && initialSyllabus.learningOutcomes.length > 0
          ? initialSyllabus.learningOutcomes
          : [
              'Penguasaan kompetensi inti modul kurikulum berbasis standar industri.',
              'Implementasi terapan pada studi kasus operasional organisasi.',
            ]
      );

      // Estimasi biaya otomatis dari rate card silabus
      const trainerCost = initialSyllabus.trainerDailyRate * initialSyllabus.durationDays;
      const hospitalityCost = pax * 550000 * initialSyllabus.durationDays;
      const materialsCost = pax * 250000;
      const overheadCost = (trainerCost + hospitalityCost + materialsCost) * 0.12;
      const estHpp = Math.round(trainerCost + hospitalityCost + materialsCost + overheadCost);
      const estSelling = Math.round(estHpp / 0.65); // 35% margin target
      setFormInternalHppCost(estHpp);
      setFormProposedSellingPrice(estSelling);
      setIsModalOpen(true);
      showNotification(`Proposal otomatis disiapkan dari silabus "${initialSyllabus.title}". Silakan sesuaikan dan simpan.`);
      if (onClearInitialSyllabus) {
        onClearInitialSyllabus();
      }
    }
  }, [initialSyllabus]);

  // Starfa AI Proposal Polisher
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const handleAiOptimizeProposal = () => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      setIsAiOptimizing(false);
      if (formProjectType === 'training') {
        setFormTitle(
          formTitle.includes('Proposal')
            ? formTitle
            : `Proposal Penawaran Program In-House Training: ${formTitle}`
        );
        setTrainingLearningObjectives((prev) => [
          ...prev,
          'Evaluasi dampak pembelajaran menggunakan metode Kirkpatrick Level 1–3 pasca-pelatihan.',
          'Penyusunan Action Learning Plan (ALP) individu yang dievaluasi langsung oleh pimpinan unit kerja.',
        ]);
        setFormPaymentTerms('Termin 1 (DP 50% saat konfirmasi SPK/PO), Termin 2 (50% setelah Laporan Evaluasi & BAST).');
        showNotification('✨ Starfa AI telah memperkaya narasi tujuan pembelajaran & klausul pembayaran!');
      } else {
        setConsultingFramework(
          '5-Stage Strategic Consulting: (1) As-Is Assessment, (2) Gap Analysis & Benchmarking, (3) To-Be Architecture, (4) Pilot Rollout, (5) Handover & BAST.'
        );
        setFormPaymentTerms('Termin 1 (DP 30%), Termin 2 (Mid-Project Progress 40%), Termin 3 (Pelunasan 30% setelah Final BAST).');
        showNotification('✨ Starfa AI telah mengoptimalkan kerangka kerja konsultansi & skema termin!');
      }
    }, 600);
  };

  // Quick Sync with current HPP
  const handlePullCurrentHppData = () => {
    if (currentProject) {
      setFormClientName(currentProject.clientName);
      setFormInternalHppCost(currentProject.totalProjectCost || 115000000);
      setFormProposedSellingPrice(currentProject.actualSellingPrice || 175000000);
      setFormParticipantsCount(currentProject.headcount?.participants || 30);
      setFormDurationText(`${currentProject.headcount?.days || 3} Hari Pelaksanaan`);
      showNotification('Berhasil menarik data nilai HPP, harga jual, dan jumlah peserta dari proyek aktif!');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (type: ProposalProjectType = 'training') => {
    setEditingProposalId(null);
    setFormProjectType(type);
    const randomCode = Math.floor(100 + Math.random() * 900);
    const codePrefix = type === 'training' ? 'TRN' : 'CNS';
    setFormProposalNumber(`PROP-TCMS/${codePrefix}/2026/09/${randomCode}`);

    if (type === 'training') {
      setFormTitle('Pengembangan Kapabilitas Manajerial & Budaya Kerja');
      setFormClientName(currentProject?.clientName || 'PT Bank Rakyat Indonesia (Persero) Tbk');
      setFormDurationText('3 Hari (24 Jam Pelajaran)');
      setFormParticipantsCount(30);
      setFormInternalHppCost(currentProject ? currentProject.totalProjectCost : 125000000);
      setFormProposedSellingPrice(currentProject ? currentProject.actualSellingPrice : 192000000);
    } else {
      setFormTitle('Transformasi Model Bisnis & Arsitektur Tata Kelola');
      setFormClientName(currentProject?.clientName || 'PT Semen Indonesia (Persero) Tbk');
      setFormDurationText('6 Pekan Kerja');
      setFormParticipantsCount(0);
      setFormInternalHppCost(160000000);
      setFormProposedSellingPrice(250000000);
    }

    const defaultSecs: ProposalSection[] = type === 'training' ? [
      {
        id: 'sec-1',
        title: '1. Pendahuluan & Latar Belakang',
        type: 'text',
        content: 'Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, kami berkomitmen untuk membina dan melatih kompetensi berkelanjutan untuk menghasilkan talenta unggul siap pakai.'
      },
      {
        id: 'sec-2',
        title: '2. Output & Sasaran Pelatihan',
        type: 'bullet_list',
        content: 'Berikut adalah butir-butir kompetensi pembelajaran yang akan diraih oleh para peserta setelah mengikuti program pelatihan:',
        items: [
          'Menguasai komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
          'Peningkatan efektivitas koordinasi lintas divisi.'
        ]
      },
      {
        id: 'sec-3',
        title: '3. Agenda & Kurikulum Pelatihan (Syllabus)',
        type: 'table_syllabus',
        content: 'Berikut adalah jadwal dan pembagian jam pelajaran materi silabus terintegrasi:'
      },
      {
        id: 'sec-4',
        title: '4. Komersial & Struktur Investasi',
        type: 'table_costs',
        content: 'Berikut adalah rincian biaya penawaran komersial resmi yang kami usulkan berdasarkan kalkulasi HPP internal:'
      },
      {
        id: 'sec-5',
        title: '5. Klausul Penutup & Tanda Tangan',
        type: 'signatory',
        content: 'Demikian proposal penawaran ini kami ajukan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.'
      }
    ] : [
      {
        id: 'sec-1',
        title: '1. Executive Summary & Masalah Utama',
        type: 'text',
        content: 'Menghadapi kompleksitas tata kelola dan tantangan operasional, rancangan perbaikan ini dirancang untuk menyelesaikan ketidaksesuaian SOP dan meningkatkan transparansi.'
      },
      {
        id: 'sec-2',
        title: '2. Tahapan Kerja (Milestone & Termin)',
        type: 'table_milestones',
        content: 'Pekerjaan konsultansi dilaksanakan dengan kerangka kerja yang terbagi menjadi fase-fase berikut:'
      },
      {
        id: 'sec-3',
        title: '3. Rincian Biaya & Investasi Jasa Konsultan',
        type: 'table_costs',
        content: 'Berikut adalah rincian nilai penawaran jasa konsultansi profesional yang mencakup tim ahli:'
      },
      {
        id: 'sec-4',
        title: '4. Otorisasi Lembar Pengesahan',
        type: 'signatory',
        content: 'Demikian penawaran program konsultansi ini kami sampaikan. Kami sangat menantikan kolaborasi konstruktif ini.'
      }
    ];
    setFormSections(defaultSecs);

    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (prop: ProposalDocument) => {
    setEditingProposalId(prop.id);
    setFormProjectType(prop.projectType);
    setFormProposalNumber(prop.proposalNumber);
    setFormTitle(prop.title);
    setFormClientName(prop.clientName);
    setFormClientType(prop.clientType);
    setFormClientPicName(prop.clientPicName);
    setFormClientPicPosition(prop.clientPicPosition);
    setFormValidityDays(prop.validityDays);
    setFormStartDateEst(prop.startDateEst);
    setFormDurationText(prop.durationText);
    setFormParticipantsCount(prop.participantsCount || 0);
    setFormInternalHppCost(prop.internalHppCost);
    setFormProposedSellingPrice(prop.proposedSellingPrice);
    setFormTaxNotes(prop.taxNotes);
    setFormPaymentTerms(prop.paymentTerms);
    setFormSignatoryName(prop.signatoryName);
    setFormSignatoryTitle(prop.signatoryTitle);

    if (prop.trainingDetails) {
      setTrainingTargetAudience(prop.trainingDetails.targetAudience);
      setTrainingMethod(prop.trainingDetails.trainingMethod);
      setTrainingLearningObjectives(prop.trainingDetails.learningObjectives);
    }

    if (prop.consultingDetails) {
      setConsultingProblemStatement(prop.consultingDetails.problemStatement);
      setConsultingFramework(prop.consultingDetails.approachFramework);
    }

    if (prop.sections && prop.sections.length > 0) {
      setFormSections(prop.sections);
    } else {
      const defaultSecs: ProposalSection[] = prop.projectType === 'training' ? [
        {
          id: 'sec-1',
          title: '1. Pendahuluan & Latar Belakang',
          type: 'text',
          content: 'Dalam rangka akselerasi kapabilitas organisasi dan pemenuhan standar kinerja industri terdepan, kami berkomitmen untuk membina dan melatih kompetensi berkelanjutan untuk menghasilkan talenta unggul siap pakai.'
        },
        {
          id: 'sec-2',
          title: '2. Output & Sasaran Pelatihan',
          type: 'bullet_list',
          content: 'Berikut adalah butir-butir kompetensi pembelajaran yang akan diraih oleh para peserta setelah mengikuti program pelatihan:',
          items: prop.trainingDetails?.learningObjectives || [
            'Menguasai komunikasi kepemimpinan adaptif dan motivasi tim kerja.',
            'Peningkatan efektivitas koordinasi lintas divisi.'
          ]
        },
        {
          id: 'sec-3',
          title: '3. Agenda & Kurikulum Pelatihan (Syllabus)',
          type: 'table_syllabus',
          content: 'Berikut adalah jadwal dan pembagian jam pelajaran materi silabus terintegrasi:'
        },
        {
          id: 'sec-4',
          title: '4. Komersial & Struktur Investasi',
          type: 'table_costs',
          content: 'Berikut adalah rincian biaya penawaran komersial resmi yang kami usulkan berdasarkan kalkulasi HPP internal:'
        },
        {
          id: 'sec-5',
          title: '5. Klausul Penutup & Tanda Tangan',
          type: 'signatory',
          content: 'Demikian proposal penawaran ini kami ajukan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.'
        }
      ] : [
        {
          id: 'sec-1',
          title: '1. Executive Summary & Masalah Utama',
          type: 'text',
          content: prop.consultingDetails?.problemStatement || 'Menghadapi kompleksitas tata kelola dan tantangan operasional, rancangan perbaikan ini dirancang untuk menyelesaikan ketidaksesuaian SOP dan meningkatkan transparansi.'
        },
        {
          id: 'sec-2',
          title: '2. Tahapan Kerja (Milestone & Termin)',
          type: 'table_milestones',
          content: 'Pekerjaan konsultansi dilaksanakan dengan kerangka kerja yang terbagi menjadi fase-fase berikut:'
        },
        {
          id: 'sec-3',
          title: '3. Rincian Biaya & Investasi Jasa Konsultan',
          type: 'table_costs',
          content: 'Berikut adalah rincian nilai penawaran jasa konsultansi profesional yang mencakup tim ahli:'
        },
        {
          id: 'sec-4',
          title: '4. Otorisasi Lembar Pengesahan',
          type: 'signatory',
          content: 'Demikian penawaran program konsultansi ini kami sampaikan. Kami sangat menantikan kolaborasi konstruktif ini.'
        }
      ];
      setFormSections(defaultSecs);
    }

    setIsModalOpen(true);
  };

  // Save Proposal (Create or Update)
  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();

    const marginPercent =
      formProposedSellingPrice > 0
        ? ((formProposedSellingPrice - formInternalHppCost) / formProposedSellingPrice) * 100
        : 35;

    if (editingProposalId) {
      // Update existing
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== editingProposalId) return p;
          return {
            ...p,
            proposalNumber: formProposalNumber,
            projectType: formProjectType,
            title: formTitle,
            clientName: formClientName,
            clientType: formClientType,
            clientPicName: formClientPicName,
            clientPicPosition: formClientPicPosition,
            validityDays: formValidityDays,
            startDateEst: formStartDateEst,
            durationText: formDurationText,
            participantsCount: formProjectType === 'training' ? formParticipantsCount : undefined,
            internalHppCost: formInternalHppCost,
            proposedSellingPrice: formProposedSellingPrice,
            targetMarginPercent: marginPercent,
            taxNotes: formTaxNotes,
            paymentTerms: formPaymentTerms,
            signatoryName: formSignatoryName,
            signatoryTitle: formSignatoryTitle,
            trainingDetails:
              formProjectType === 'training'
                ? {
                    ...(p.trainingDetails || {
                      modules: [],
                      trainers: [],
                      facilitiesIncluded: [],
                      evaluationModel: 'Evaluasi Kirkpatrick Level 1 & 2',
                    }),
                    targetAudience: trainingTargetAudience,
                    trainingMethod: trainingMethod,
                    learningObjectives: trainingLearningObjectives,
                  }
                : undefined,
            consultingDetails:
              formProjectType === 'consulting'
                ? {
                    ...(p.consultingDetails || {
                      consultingType: 'Tata Kelola & SOP',
                      milestones: [],
                      expertTeam: [],
                      finalDeliverables: [],
                    }),
                    problemStatement: consultingProblemStatement,
                    approachFramework: consultingFramework,
                  }
                : undefined,
            sections: formSections,
          };
        })
      );
      showNotification(`Proposal "${formProposalNumber}" berhasil diperbarui.`);
    } else {
      // Create new
      const newDoc: ProposalDocument = {
        id: `prop-${Date.now()}`,
        proposalNumber: formProposalNumber,
        projectType: formProjectType,
        title: formTitle,
        clientName: formClientName,
        clientType: formClientType,
        clientPicName: formClientPicName || 'Bapak/Ibu Pimpinan Divisi',
        clientPicPosition: formClientPicPosition || 'Kepala Divisi / Pengadaan',
        dateCreated: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        validityDays: formValidityDays,
        startDateEst: formStartDateEst,
        durationText: formDurationText,
        participantsCount: formProjectType === 'training' ? formParticipantsCount : undefined,
        internalHppCost: formInternalHppCost,
        proposedSellingPrice: formProposedSellingPrice,
        targetMarginPercent: marginPercent,
        includePpn11: false,
        taxNotes: formTaxNotes,
        paymentTerms: formPaymentTerms,
        status: 'Draf Penawaran',
        signatoryName: formSignatoryName,
        signatoryTitle: formSignatoryTitle,
        termsAndConditions: [
          'Masa berlaku penawaran harga ini adalah 30 hari kalender sejak tanggal diterbitkan.',
          'Konfirmasi persetujuan resmi dilakukan dengan penerbitan SPK atau Purchase Order (PO) bermaterai.',
          'Biaya penawaran mencakup seluruh fasilitas deliverable yang tercantum dalam proposal ini.',
        ],
        trainingDetails:
          formProjectType === 'training'
            ? {
                targetAudience: trainingTargetAudience,
                trainingMethod: trainingMethod,
                learningObjectives: trainingLearningObjectives,
                modules: [
                  {
                    dayNumber: 1,
                    title: 'Hari 1: Fondasi Kompetensi & Pemetaan Tantangan Bisnis',
                    durationHours: 8,
                    topics: ['Tantangan Industri Kontemporer', 'Prinsip Kunci Efektivitas Kinerja', 'Diskusi Studi Kasus Terapan'],
                    interactiveMethod: 'Kuliah Interaktif & Diskusi Kasus Kelompok',
                  },
                  {
                    dayNumber: 2,
                    title: 'Hari 2: Simulasi Praktik & Penerapan Perilaku Kunci',
                    durationHours: 8,
                    topics: ['Roleplay Skenario Kerja', 'Teknik Pemecahan Masalah Sistematis', 'Umpan Balik Instruktur'],
                    interactiveMethod: 'Simulasi Terpandu & Uji Kompetensi Langsung',
                  },
                ],
                trainers: [
                  {
                    name: 'Dr. Hendra Gunawan, MBA',
                    role: 'Master Trainer & Konsultan Senior',
                    credentials: 'Certified International Trainer, 20+ Tahun Pengalaman BUMN.',
                    specialization: 'Strategic Leadership & Corporate Performance',
                  },
                ],
                facilitiesIncluded: [
                  'Paket Meeting Hotel & Konsumsi Lengkap.',
                  'Buku Modul Eksklusif & Seminar Kit Premium.',
                  'Sertifikat Kelulusan Resmi Star Office TCMS.',
                  'Laporan Evaluasi Pelatihan Komprehensif.',
                ],
                evaluationModel: 'Evaluasi Kirkpatrick Level 1 (Reaction) & Level 2 (Learning Post-Test).',
              }
            : undefined,
        consultingDetails:
          formProjectType === 'consulting'
            ? {
                consultingType: 'Tata Kelola & SOP',
                problemStatement: consultingProblemStatement,
                approachFramework: consultingFramework,
                milestones: [
                  {
                    phase: 'Tahap 1',
                    phaseTitle: 'Diagnostik Proses Eksisting & Gap Analysis',
                    durationWeeks: 'Pekan 1 - 2',
                    keyActivities: ['Wawancara Pemangku Kepentingan', 'Telaah Regulasi & SOP Lama'],
                    deliverables: 'Laporan Diagnostik & Matriks Kesenjangan (Gap Matrix)',
                    paymentPercentage: 30,
                  },
                  {
                    phase: 'Tahap 2',
                    phaseTitle: 'Redesain Solusi & Penyusunan Dokumen Manual',
                    durationWeeks: 'Pekan 3 - 5',
                    keyActivities: ['Formulasi Blueprint Kebijakan', 'Penyusunan Pedoman Kerja Teknis'],
                    deliverables: 'Draf Dokumen SOP & Pedoman Kerja Final',
                    paymentPercentage: 40,
                  },
                  {
                    phase: 'Tahap 3',
                    phaseTitle: 'Sosialisasi, Handover & Berita Acara Final',
                    durationWeeks: 'Pekan 6',
                    keyActivities: ['Executive Briefing Direksi', 'Serah Terima Pekerjaan (BAST)'],
                    deliverables: 'Buku Pedoman Resmi & Softcopy Editable Source',
                    paymentPercentage: 30,
                  },
                ],
                expertTeam: [
                  {
                    name: 'Dr. Ir. Hendra Gunawan, MBA',
                    role: 'Lead Consultant / Project Director',
                    manDays: 15,
                    billingRateDaily: 5000000,
                  },
                  {
                    name: 'Anindya Putri, S.Kom., M.T.',
                    role: 'Senior Management Consultant',
                    manDays: 20,
                    billingRateDaily: 3000000,
                  },
                ],
                finalDeliverables: [
                  'Buku Panduan Kebijakan & Tata Kelola Perusahaan.',
                  'Set Lengkap Standar Operasional Prosedur (SOP) dengan Diagram BPMN.',
                  'Laporan Akhir Rekomendasi Strategis dan Rencana Transisi.',
                ],
              }
            : undefined,
        sections: formSections,
      };

      setProposals([newDoc, ...proposals]);
      showNotification(`Proposal baru "${newDoc.proposalNumber}" berhasil dibuat!`);
    }

    setIsModalOpen(false);
  };

  // Change Proposal Pipeline Status
  const handleUpdateStatus = (id: string, newStatus: ProposalDocument['status']) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showNotification(`Status proposal diperbarui menjadi: "${newStatus}".`);
  };

  // Duplicate / Clone Proposal
  const handleDuplicateProposal = (prop: ProposalDocument) => {
    const duplicated: ProposalDocument = {
      ...prop,
      id: `prop-${Date.now()}`,
      proposalNumber: `${prop.proposalNumber}-REV`,
      title: `${prop.title} (Salinan / Revisi)`,
      status: 'Draf Penawaran',
      dateCreated: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    setProposals([duplicated, ...proposals]);
    showNotification(`Proposal disalin sebagai draf baru: "${duplicated.proposalNumber}".`);
  };

  // Delete Proposal
  const handleDeleteProposal = (id: string) => {
    const p = proposals.find((x) => x.id === id);
    if (confirm(`Yakin ingin menghapus proposal ${p?.proposalNumber}?`)) {
      setProposals((prev) => prev.filter((x) => x.id !== id));
      showNotification(`Proposal telah dihapus.`);
    }
  };

  // Filtered list
  const filteredProposals = proposals.filter((p) => {
    if (selectedTypeFilter !== 'all' && p.projectType !== selectedTypeFilter) return false;
    if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = p.proposalNumber.toLowerCase().includes(q);
      const matchClient = p.clientName.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      if (!matchNumber && !matchClient && !matchTitle) return false;
    }
    return true;
  });

  // Calculate High-level Pipeline Stats
  const totalPipelineValue = proposals.reduce((acc, curr) => acc + curr.proposedSellingPrice, 0);
  const totalTrainingCount = proposals.filter((p) => p.projectType === 'training').length;
  const totalConsultingCount = proposals.filter((p) => p.projectType === 'consulting').length;
  const avgMargin =
    proposals.length > 0
      ? proposals.reduce((acc, curr) => acc + curr.targetMarginPercent, 0) / proposals.length
      : 35;

  const getStatusBadge = (status: ProposalDocument['status']) => {
    switch (status) {
      case 'Draf Penawaran':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Review Internal':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Terkirim ke Klien':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Negosiasi (BAFO)':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Disetujui / Menang':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case 'Ditolak / Batal':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Success Alert Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Banner / Breadcrumb & Stage Indicator */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white rounded-2xl border border-teal-800/40 p-5 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center space-x-2.5">
          <span className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-xs shadow-xs border border-white/20 shrink-0">
            <FileSignature className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-xs">
              Penyusunan Proposal Penawaran
            </h1>
            <p className="text-xs text-amber-300 font-bold mt-0.5">
              Pelatihan &amp; Konsultansi
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenCreateModal('training')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer border border-emerald-400/30"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-100" />
            <span>+ Proposal Pelatihan</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('consulting')}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer border border-teal-400/30"
          >
            <Briefcase className="w-3.5 h-3.5 text-teal-100" />
            <span>+ Proposal Konsultansi</span>
          </button>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'pipeline'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>📋 Pipeline & Daftar Proposal ({proposals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (formSections.length === 0) setFormSections(getDefaultSectionsForType(formProjectType));
              setActiveViewTab('editor');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'editor'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Editor Proposal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsTemplateViewOpen(true);
              setActiveViewTab('templates');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
              activeViewTab === 'templates'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-100" />
            <span>🛠️ Pusat Templat Standard ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: PIPELINE & DAFTAR PROPOSAL */}
      {activeViewTab === 'pipeline' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Total Proposal Aktif</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {proposals.length} Dokumen
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {totalTrainingCount} Pelatihan • {totalConsultingCount} Konsultansi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nilai Pipeline Penawaran</span>
          </div>
          <div className="text-xl font-extrabold text-teal-900 mt-1">
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            Estimasi Nilai Kontrak Potensial
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Rata-Rata Target Margin</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {avgMargin.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Sesuai Standar Guardrail TCMS (≥30%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>HPP Link Status</span>
          </div>
          <div className="text-sm font-extrabold text-emerald-800 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Terhubung ke HPP 5 POS</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Sinkronisasi instan ke Kalkulator HPP
          </div>
        </div>
      </div>

      {/* TEMPLATE MANAGEMENT BOARD */}
      {isTemplateViewOpen && (
        <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 space-y-4 animate-fade-in shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4.5 h-4.5 text-amber-700" />
                <span>Pusat Tata Kelola Templat Proposal Resmi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan, buat, edit, atau hapus format penawaran standar Anda agar proses penawaran ke klien berjalan lebih konsisten dan cepat.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateTemplateModal}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Templat Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-sm hover:border-slate-200 transition-all duration-300 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                        tpl.projectType === 'training'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {tpl.projectType === 'training' ? 'Training' : 'Consulting'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {tpl.id === 'tpl-training-manajerial' || tpl.id === 'tpl-consulting-governance' ? 'System Def' : 'Custom'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{tpl.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.description}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[10.5px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate"><span className="font-medium text-slate-400">Durasi:</span> {tpl.durationText}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate"><span className="font-medium text-slate-400">Termin:</span> {tpl.paymentTerms}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenInDynamicEditor(tpl);
                    }}
                    className="flex-1 py-1.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-3xs"
                    title="Buka & Edit di Editor Proposal Dinamis"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Edit di Editor Dinamis</span>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTemplateModal(tpl)}
                      className="p-1.5 hover:bg-amber-50 text-amber-800 rounded-lg border border-amber-200 hover:border-amber-300 transition cursor-pointer"
                      title="Edit template detail"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {tpl.id !== 'tpl-training-manajerial' && tpl.id !== 'tpl-consulting-governance' ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:border-rose-300 transition cursor-pointer"
                        title="Hapus template kustom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Action Toolbars */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1.5 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Jenis:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedTypeFilter === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua ({proposals.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('training')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTypeFilter === 'training'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Pelatihan / Training ({totalTrainingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('consulting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              selectedTypeFilter === 'consulting'
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Konsultansi / Advisory ({totalConsultingCount})</span>
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">Semua Status Pipeline</option>
            <option value="Draf Penawaran">Draf Penawaran</option>
            <option value="Review Internal">Review Internal</option>
            <option value="Terkirim ke Klien">Terkirim ke Klien</option>
            <option value="Negosiasi (BAFO)">Negosiasi (BAFO)</option>
            <option value="Disetujui / Menang">Disetujui / Menang</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari proposal, klien, nomor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Proposals Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProposals.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada proposal yang sesuai dengan filter pencarian.</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter jenis proposal.</p>
          </div>
        ) : (
          filteredProposals.map((prop) => {
            const isTrn = prop.projectType === 'training';
            const grossProfitNominal = prop.proposedSellingPrice - prop.internalHppCost;

            return (
              <div
                key={prop.id}
                onClick={() => setSelectedProposalForPrint(prop)}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-sm hover:border-slate-200/80 hover:bg-slate-50/10 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between space-y-5 cursor-pointer group"
              >
                {/* Proposal Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          isTrn
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-teal-50 text-teal-800 border-teal-300'
                        }`}
                      >
                        {isTrn ? <BookOpen className="w-3 h-3 mr-1" /> : <Briefcase className="w-3 h-3 mr-1" />}
                        {isTrn ? 'Pelatihan (Training)' : 'Konsultansi (Advisory)'}
                      </span>

                      <span className="font-mono text-[11px] font-bold text-slate-500">
                        {prop.proposalNumber}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${getStatusBadge(
                          prop.status
                        )}`}
                      >
                        {prop.status}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-teal-800 leading-snug transition">
                      {prop.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                      <span className="flex items-center space-x-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{prop.clientName} ({prop.clientType})</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>U.p. <strong>{prop.clientPicName}</strong> ({prop.clientPicPosition})</span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Est: {prop.startDateEst}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing Box on Card */}
                  <div className="bg-slate-50 group-hover:bg-teal-50/40 p-3 rounded-xl border border-slate-200/90 shrink-0 text-right sm:min-w-[210px] transition">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Nilai Penawaran Resmi
                    </div>
                    <div className="text-base sm:text-lg font-black text-teal-950">
                      {formatCurrency(prop.proposedSellingPrice)}
                    </div>
                    <div className="flex items-center justify-end space-x-2 text-[10px] mt-1">
                      <span className="text-slate-500">HPP: {formatCurrency(prop.internalHppCost)}</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        Margin {prop.targetMarginPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Highlights based on Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {isTrn && prop.trainingDetails && (
                    <>
                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-teal-700" />
                          <span>Spesifikasi Pelatihan ({prop.durationText})</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Target:</strong> {prop.trainingDetails.targetAudience}
                        </p>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Metode:</strong> {prop.trainingDetails.trainingMethod}
                        </p>
                        <div className="text-[10.5px] text-slate-500 mt-1">
                          {prop.trainingDetails.modules.length} Modul Silabus • Termasuk Evaluasi Level 1-3
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                          <Award className="w-3.5 h-3.5 text-teal-700" />
                          <span>Tim Instruktur & Fasilitator</span>
                        </div>
                        <div className="space-y-1">
                          {prop.trainingDetails.trainers.map((tr, tidx) => (
                            <div key={tidx} className="text-[11px]">
                              <span className="font-bold text-slate-800">{tr.name}</span>{' '}
                              <span className="text-slate-500">({tr.role})</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          Termasuk: Paket Hotel, Kit Eksklusif, Modul, Sertifikat Resmi
                        </div>
                      </div>
                    </>
                  )}

                  {!isTrn && prop.consultingDetails && (
                    <>
                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                          <Layers className="w-3.5 h-3.5 text-teal-700" />
                          <span>Tahapan Pekerjaan (Milestone WBS)</span>
                        </div>
                        <div className="space-y-1">
                          {prop.consultingDetails.milestones.slice(0, 3).map((m, midx) => (
                            <div key={midx} className="flex justify-between text-[11px]">
                              <span className="text-slate-700 font-medium truncate max-w-[220px]">
                                {m.phase}: {m.phaseTitle}
                              </span>
                              <span className="font-bold text-teal-900 shrink-0">
                                {m.paymentPercentage > 0 ? `Termin ${m.paymentPercentage}%` : '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                          <Briefcase className="w-3.5 h-3.5 text-teal-700" />
                          <span>Tim Ahli Konsultan ({prop.durationText})</span>
                        </div>
                        <div className="space-y-0.5">
                          {prop.consultingDetails.expertTeam.slice(0, 3).map((exp, eidx) => (
                            <div key={eidx} className="flex justify-between text-[11px]">
                              <span className="text-slate-800 font-medium truncate max-w-[200px]">
                                {exp.name}
                              </span>
                              <span className="text-slate-500 text-[10px]">{exp.manDays} Man-Days</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Controls & Integration */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* Status update dropdown */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-medium text-slate-500">Ubah Status:</span>
                    <select
                      value={prop.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleUpdateStatus(prop.id, e.target.value as ProposalDocument['status'])
                      }
                      className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="Draf Penawaran">Draf Penawaran</option>
                      <option value="Review Internal">Review Internal</option>
                      <option value="Terkirim ke Klien">Terkirim ke Klien</option>
                      <option value="Negosiasi (BAFO)">Negosiasi (BAFO)</option>
                      <option value="Disetujui / Menang">Disetujui / Menang</option>
                      <option value="Ditolak / Batal">Ditolak / Batal</option>
                    </select>
                  </div>

                  {/* Actions: Duplicate, Delete */}
                  <div className="flex items-center gap-1.5">
                    {/* Duplicate button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateProposal(prop);
                      }}
                      className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg transition cursor-pointer"
                      title="Duplikasi Proposal (Salin / Revisi)"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProposal(prop.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                      title="Hapus Proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </div>
      )}

      {/* VIEW TAB 2: EDITOR PROPOSAL DINAMIS (LIVE WORKSPACE) */}
      {activeViewTab === 'editor' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Control Bar: Baseline Selector & AI Quick Actions */}
          <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-4 rounded-2xl text-white shadow-md border border-teal-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-400/30 text-teal-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Pusat Editor Proposal Penawaran Dinamis</span>
                  <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.5 rounded-full font-mono border border-teal-400/30">
                    Live Template Engine
                  </span>
                </h2>
                <p className="text-[11px] text-slate-300">
                  Pilih templat atau proposal draf eksisting sebagai baseline, sesuaikan bab dinamis & HPP, dan unduh PDF vektor langsung.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Baseline Selector */}
              <div className="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                <span className="text-[10.5px] font-bold text-slate-300 px-2">Baseline:</span>
                <select
                  value={selectedBaselineId}
                  onChange={(e) => setSelectedBaselineId(e.target.value)}
                  className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-teal-400 cursor-pointer max-w-[220px] truncate"
                >
                  <option value="" disabled>-- Pilih Baseline --</option>
                  <optgroup label="Templat Proposal Standard">
                    {templates.map((t) => (
                      <option key={t.id} value={`tpl:${t.id}`}>
                        [Templat] {t.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Proposal Pipeline Eksisting">
                    {proposals.map((p) => (
                      <option key={p.id} value={`prop:${p.id}`}>
                        [Draf] {p.proposalNumber} - {p.clientName}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedBaselineId) return;
                    if (selectedBaselineId.startsWith('tpl:')) {
                      const tplId = selectedBaselineId.replace('tpl:', '');
                      const tpl = templates.find((t) => t.id === tplId);
                      if (tpl) handleApplyTemplate(tpl);
                    } else if (selectedBaselineId.startsWith('prop:')) {
                      const propId = selectedBaselineId.replace('prop:', '');
                      const prop = proposals.find((p) => p.id === propId);
                      if (prop) handleOpenInDynamicEditor(prop);
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-extrabold transition cursor-pointer shrink-0"
                >
                  Muat Baseline
                </button>
              </div>

              {/* HPP Pull Button */}
              <button
                type="button"
                onClick={handlePullCurrentHppData}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-200 rounded-xl text-xs font-extrabold border border-teal-500/40 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Tarik HPP & Harga Jual Aktif"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Sync HPP</span>
              </button>

              {/* AI Polisher Button */}
              <button
                type="button"
                onClick={handleAiOptimizeProposal}
                disabled={isAiOptimizing}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>{isAiOptimizing ? 'Memproses...' : 'Starfa AI Polisher'}</span>
              </button>
            </div>
          </div>

          {/* Editor & Real-Time Preview Workspace Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Controls & Dynamic Section Editor (col-span-6) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 1: Project Type & Metadata */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>1. Rumpun Proyek & Legitimasi Surat</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {editingProposalId || 'DRAFT-NEW'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormProjectType('training');
                      if (formSections.length === 0) setFormSections(getDefaultSectionsForType('training'));
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition cursor-pointer ${
                      formProjectType === 'training'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 mt-0.5 shrink-0 ${formProjectType === 'training' ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">Training (Pelatihan)</div>
                      <div className="text-[10px] text-slate-500">Silabus & Pax</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormProjectType('consulting');
                      if (formSections.length === 0) setFormSections(getDefaultSectionsForType('consulting'));
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition cursor-pointer ${
                      formProjectType === 'consulting'
                        ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 mt-0.5 shrink-0 ${formProjectType === 'consulting' ? 'text-teal-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">Consulting (Konsultansi)</div>
                      <div className="text-[10px] text-slate-500">Milestone & WBS</div>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nomor Surat Proposal</label>
                    <input
                      type="text"
                      value={formProposalNumber}
                      onChange={(e) => setFormProposalNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Perusahaan Klien</label>
                    <input
                      type="text"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tipe Entitas Klien</label>
                    <select
                      value={formClientType}
                      onChange={(e) => setFormClientType(e.target.value as ProposalDocument['clientType'])}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800"
                    >
                      <option value="BUMN">BUMN</option>
                      <option value="Kementerian / Lembaga">Kementerian / Lembaga</option>
                      <option value="Swasta Enterprise">Swasta Enterprise</option>
                      <option value="Pemerintah Daerah">Pemerintah Daerah</option>
                      <option value="Perbankan">Perbankan & Lembaga Keuangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama PIC Penerima</label>
                    <input
                      type="text"
                      value={formClientPicName}
                      onChange={(e) => setFormClientPicName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Jabatan PIC Klien</label>
                    <input
                      type="text"
                      value={formClientPicPosition}
                      onChange={(e) => setFormClientPicPosition(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Perihal Title & Schedule */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>2. Judul Program & Operational Schedule</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Perihal / Judul Proposal Resmi</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Durasi</label>
                      <input
                        type="text"
                        value={formDurationText}
                        onChange={(e) => setFormDurationText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Estimasi Tanggal</label>
                      <input
                        type="text"
                        value={formStartDateEst}
                        onChange={(e) => setFormStartDateEst(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Masa Berlaku (Hari)</label>
                      <input
                        type="number"
                        value={formValidityDays}
                        onChange={(e) => setFormValidityDays(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {formProjectType === 'training' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jumlah Peserta (Pax)</label>
                        <input
                          type="number"
                          value={formParticipantsCount}
                          onChange={(e) => setFormParticipantsCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Metode Pelatihan</label>
                        <select
                          value={trainingMethod}
                          onChange={(e) => setTrainingMethod(e.target.value as TrainingProposalDetails['trainingMethod'])}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                        >
                          <option value="Residential Hotel Workshop">Residential Hotel Workshop</option>
                          <option value="In-House Training (Offline)">In-House Training (Offline di Kantor Klien)</option>
                          <option value="Online Virtual Interactive">Online Virtual Interactive</option>
                          <option value="Blended Learning Hybrid">Blended Learning Hybrid</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Financial & HPP 5 POS */}
              <div className="bg-teal-50/70 p-5 rounded-2xl border-2 border-teal-600/30 space-y-4">
                <div className="flex items-center justify-between border-b border-teal-200/80 pb-2.5">
                  <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-teal-700" />
                    <span>3. Integrasi Komersial & HPP 5 POS</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                    Margin: {formProposedSellingPrice > 0 ? (((formProposedSellingPrice - formInternalHppCost) / formProposedSellingPrice) * 100).toFixed(1) : 0}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">HPP Modal Internal (Rp)</label>
                    <input
                      type="number"
                      step={500000}
                      value={formInternalHppCost}
                      onChange={(e) => setFormInternalHppCost(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-teal-900 block mb-1">Harga Penawaran Resmi (Rp)</label>
                    <input
                      type="number"
                      step={500000}
                      value={formProposedSellingPrice}
                      onChange={(e) => setFormProposedSellingPrice(Number(e.target.value))}
                      className="w-full bg-white border-2 border-teal-500 rounded-lg px-3 py-2 font-mono font-extrabold text-teal-950 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2 pt-1 border-t border-teal-200">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Catatan Ketentuan Perpajakan</label>
                      <input
                        type="text"
                        value={formTaxNotes}
                        onChange={(e) => setFormTaxNotes(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Termin Pembayaran</label>
                      <input
                        type="text"
                        value={formPaymentTerms}
                        onChange={(e) => setFormPaymentTerms(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Dynamic Proposal Section Builder (Bab Custom) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-teal-600" />
                      <span>4. Pusat Bab & Seksi Proposal Dinamis</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Kelola bab, narasi pendahuluan, daftar poin, dan penyisipan objek tabel biaya/silabus/milestone secara dinamis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSec: ProposalSection = {
                        id: `sec-${Date.now()}`,
                        title: `${formSections.length + 1}. Bab Kustom Baru`,
                        type: 'text',
                        content: 'Tuliskan narasi bab baru di sini...',
                      };
                      setFormSections([...formSections, newSec]);
                      showNotification('➕ Bab kustom baru ditambahkan ke struktur proposal.');
                    }}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bab</span>
                  </button>
                </div>

                {formSections.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center text-slate-400 text-xs">
                    Belum ada seksi proposal. Klik tombol "Tambah Bab" untuk menambahkan bab baru.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {formSections.map((sec, index) => (
                      <div key={sec.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <div className="flex items-center space-x-2 w-full max-w-[75%]">
                            <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center font-extrabold text-[10px]">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormSections(formSections.map((s) => (s.id === sec.id ? { ...s, title: val } : s)));
                              }}
                              className="font-bold text-slate-900 text-xs bg-white border border-slate-300 rounded-md px-2 py-1 w-full"
                            />
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                if (index === 0) return;
                                const updated = [...formSections];
                                const temp = updated[index];
                                updated[index] = updated[index - 1];
                                updated[index - 1] = temp;
                                setFormSections(updated);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer text-xs"
                              title="Pindahkan ke atas"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={index === formSections.length - 1}
                              onClick={() => {
                                if (index === formSections.length - 1) return;
                                const updated = [...formSections];
                                const temp = updated[index];
                                updated[index] = updated[index + 1];
                                updated[index + 1] = temp;
                                setFormSections(updated);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30 cursor-pointer text-xs"
                              title="Pindahkan ke bawah"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormSections(formSections.filter((s) => s.id !== sec.id));
                                showNotification('🗑️ Seksi bab proposal dihapus.');
                              }}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600 cursor-pointer text-xs font-bold"
                              title="Hapus seksi ini"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                          <div>
                            <label className="font-bold text-slate-600 block mb-1">Tipe / Objek Bab</label>
                            <select
                              value={sec.type}
                              onChange={(e) => {
                                const newType = e.target.value as ProposalSection['type'];
                                setFormSections(
                                  formSections.map((s) => {
                                    if (s.id !== sec.id) return s;
                                    return {
                                      ...s,
                                      type: newType,
                                      items: newType === 'bullet_list' && !s.items ? ['Butir poin pembelajaran pertama...'] : s.items,
                                    };
                                  })
                                );
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium"
                            >
                              <option value="text">Teks Narasi / Deskripsi</option>
                              <option value="bullet_list">Daftar Poin (Bullet List)</option>
                              <option value="table_costs">Objek: Tabel Biaya Komersial (HPP)</option>
                              <option value="table_syllabus">Objek: Tabel Silabus Kurikulum (Training)</option>
                              <option value="table_milestones">Objek: Tabel Milestone & Tahapan (Consulting)</option>
                              <option value="signatory">Objek: Blok Tanda Tangan Pengesahan</option>
                            </select>
                          </div>
                        </div>

                        {/* Content Input depending on type */}
                        {sec.type === 'text' && (
                          <div>
                            <label className="font-semibold text-slate-600 block mb-1 text-[10.5px]">Isi Narasi Bab</label>
                            <textarea
                              rows={3}
                              value={sec.content}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormSections(formSections.map((s) => (s.id === sec.id ? { ...s, content: val } : s)));
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                            />
                          </div>
                        )}

                        {sec.type === 'bullet_list' && (
                          <div className="space-y-2">
                            <label className="font-semibold text-slate-600 block text-[10.5px]">Butir-butir Poin List</label>
                            {(sec.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center space-x-2">
                                <span className="text-teal-700 font-bold">•</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const newItems = [...(sec.items || [])];
                                    newItems[itemIdx] = val;
                                    setFormSections(formSections.map((s) => (s.id === sec.id ? { ...s, items: newItems } : s)));
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newItems = (sec.items || []).filter((_, idx) => idx !== itemIdx);
                                    setFormSections(formSections.map((s) => (s.id === sec.id ? { ...s, items: newItems } : s)));
                                  }}
                                  className="text-rose-500 hover:text-rose-700 text-xs px-1 cursor-pointer font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(sec.items || []), 'Poin tambahan baru...'];
                                setFormSections(formSections.map((s) => (s.id === sec.id ? { ...s, items: newItems } : s)));
                              }}
                              className="text-[10.5px] font-bold text-teal-800 hover:text-teal-900 cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Tambah Poin List
                            </button>
                          </div>
                        )}

                        {sec.type !== 'text' && sec.type !== 'bullet_list' && (
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[10.5px] text-slate-600 font-medium">
                            {sec.type === 'table_costs' && '📊 Otomatis merender tabel nilai penawaran komersial berdasarkan kalkulasi HPP aktif.'}
                            {sec.type === 'table_syllabus' && '📚 Otomatis merender modul silabus harian kurikulum pelatihan.'}
                            {sec.type === 'table_milestones' && '🚩 Otomatis merender tabel tahapan kerja milestone konsultansi.'}
                            {sec.type === 'signatory' && '✍️ Otomatis merender blok tanda tangan resmi pengesahan.'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 5: Signatory Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  5. Otorisasi Tanda Tangan Resmi
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Penandatangan TCMS</label>
                    <input
                      type="text"
                      value={formSignatoryName}
                      onChange={(e) => setFormSignatoryName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jabatan Penandatangan</label>
                    <input
                      type="text"
                      value={formSignatoryTitle}
                      onChange={(e) => setFormSignatoryTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Live Proposal Preview & Quick Actions (col-span-6) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Sticky Action Toolbar */}
              <div className="sticky top-4 z-20 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-md flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <span>Pratinjau Lembar Proposal (Real-Time Live)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const docToExport = buildDocFromFormState();
                      handleDirectDownloadProposalPdf(docToExport);
                    }}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>Cetak PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const docToPreview = buildDocFromFormState();
                      setSelectedProposalForPrint(docToPreview);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Pratinjau Cetak</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveProposal(e);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const namePrompt = prompt('Masukkan nama templat proposal baru:', formTitle);
                      if (namePrompt) {
                        handleSaveCurrentAsTemplate(namePrompt, `Templat kustom dibuat dari proposal ${formProposalNumber}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                    title="Simpan struktur dan narasi ini sebagai Templat Baru"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Simpan sbg Templat</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Live Proposal Document Paper View */}
              <div className="bg-white border-2 border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 text-slate-900 font-sans space-y-5 text-xs">
                {/* Official Kop Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm tracking-wide">
                      PT CIPTA PERDANA ENTERPRISE (TCMS)
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Center for Management Studies & Human Capital Excellence
                    </div>
                    <div className="text-[9.5px] text-slate-500 mt-0.5">
                      Gedung Star Office Lt. 8, Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan • Hotline: (021) 555-8899
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-extrabold text-[9px] uppercase tracking-wider border border-teal-300">
                      {formProjectType === 'training' ? 'Proposal Pelatihan' : 'Proposal Konsultansi'}
                    </span>
                    <div className="font-mono text-[10px] font-bold text-slate-700 mt-1">
                      {formProposalNumber || 'PROP-TCMS/TRN/2026/09/XXX'}
                    </div>
                  </div>
                </div>

                {/* Title & Metadata Sheet */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wide">PERIHAL PROPOSAL RESMI:</div>
                  <div className="text-sm font-extrabold text-slate-900">{formTitle || 'Judul Program Penawaran'}</div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-medium">Klien:</span>{' '}
                      <span className="font-bold text-slate-800">{formClientName || 'PT Klien Enterprise'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Penerima:</span>{' '}
                      <span className="font-bold text-slate-800">{formClientPicName || 'Bapak/Ibu PIC'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Durasi:</span>{' '}
                      <span className="font-bold text-slate-800">{formDurationText}</span>
                    </div>
                  </div>
                </div>

                {/* Live Sections Render */}
                <div className="space-y-4">
                  {formSections.map((sec) => (
                    <div key={sec.id} className="space-y-1.5">
                      <div className="font-extrabold text-slate-900 text-xs tracking-tight uppercase border-b border-slate-200 pb-1">
                        {sec.title}
                      </div>

                      {sec.type === 'text' && (
                        <p className="text-slate-700 leading-relaxed text-[11.5px] whitespace-pre-line">
                          {sec.content}
                        </p>
                      )}

                      {sec.type === 'bullet_list' && (
                        <ul className="space-y-1 pl-4 text-slate-700 text-[11.5px]">
                          {(sec.items || []).map((it, iIdx) => (
                            <li key={iIdx} className="list-disc leading-relaxed">
                              {it}
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.type === 'table_costs' && (
                        <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Total Nilai Penawaran Resmi:</span>
                            <span className="font-extrabold text-teal-950 text-sm font-mono">
                              {formatCurrency(formProposedSellingPrice)}
                            </span>
                          </div>
                          {formProjectType === 'training' && formParticipantsCount > 0 && (
                            <div className="text-[10.5px] font-semibold text-emerald-800 border-t border-teal-200/80 pt-1 flex justify-between">
                              <span>Setara Nilai per Peserta ({formParticipantsCount} Pax):</span>
                              <span className="font-mono font-bold">
                                {formatCurrency(Math.round(formProposedSellingPrice / formParticipantsCount))} / Pax
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {sec.type === 'table_syllabus' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                          <div className="font-bold text-teal-900">Kurikulum Pelatihan Terintegrasi:</div>
                          <div className="text-slate-600">
                            3 Hari Intensif (Hari 1: Customer-Centric Culture, Hari 2: Service Recovery, Hari 3: Action Learning Leadership).
                          </div>
                        </div>
                      )}

                      {sec.type === 'table_milestones' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                          <div className="font-bold text-teal-900">Milestone Pekerjaan Konsultansi:</div>
                          <div className="text-slate-600">
                            Fase I: Diagnostik (30%), Fase II: Redesain SOP (40%), Fase III: Sosialisasi & BAST (30%).
                          </div>
                        </div>
                      )}

                      {sec.type === 'signatory' && (
                        <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[11px]">
                          <div className="space-y-8">
                            <div className="text-slate-500">Diajukan Secara Resmi Oleh:</div>
                            <div className="font-bold text-slate-900">{formSignatoryName}</div>
                            <div className="text-[10px] text-slate-500">{formSignatoryTitle}</div>
                          </div>
                          <div className="space-y-8">
                            <div className="text-slate-500">Disetujui Oleh Klien:</div>
                            <div className="font-bold text-slate-900">{formClientPicName || '( ........................ )'}</div>
                            <div className="text-[10px] text-slate-500">{formClientPicPosition || 'Pejabat Berwenang'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tax Notes & Terms Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10.5px] space-y-1 text-slate-700">
                  <div>
                    <span className="font-bold">Ketentuan Pajak:</span> {formTaxNotes}
                  </div>
                  <div>
                    <span className="font-bold">Termin Pembayaran:</span> {formPaymentTerms}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat / Edit Proposal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-200/90 text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-300 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProposalId ? 'Perbarui Dokumen Proposal' : 'Buat Proposal Penawaran Baru'}
                </h3>
                <p className="text-xs text-slate-600">
                  Penyusunan penawaran standar yang terintegrasi dengan struktur HPP internal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-300/60 transition cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProposal} className="overflow-y-auto p-6 space-y-5 text-xs">
              {/* Quick AI & HPP Action Bar */}
              <div className="bg-gradient-to-r from-teal-600 via-slate-600 to-emerald-600 p-3.5 rounded-xl border border-teal-400/40 flex flex-wrap items-center justify-between gap-2.5 text-white shadow-xs">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-white/15 text-teal-100 border border-white/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-xs text-white">Asisten Cerdas Starfa AI & Integrasi HPP</div>
                    <div className="text-[10.5px] text-teal-100">
                      Otomatisasi pengisian draf proposal & sinkronisasi harga pokok internal.
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePullCurrentHppData}
                    className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-teal-100 rounded-lg font-bold transition flex items-center space-x-1.5 border border-teal-300/40 cursor-pointer"
                    title="Tarik nilai total HPP, harga jual, dan peserta dari kalkulator"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Tarik Data HPP</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAiOptimizeProposal}
                    disabled={isAiOptimizing}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 rounded-lg font-extrabold transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>{isAiOptimizing ? 'Mengoptimalkan...' : 'Optimalkan via AI'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Template Selector dropdown */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-800">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Terapkan Layout dari Templat</div>
                    <div className="text-[10.5px] text-slate-500">Isi otomatis klausul, durasi, pajak, dan termin pembayaran.</div>
                  </div>
                </div>
                <select
                  onChange={(e) => {
                    const selected = templates.find((t) => t.id === e.target.value);
                    if (selected) {
                      handleApplyTemplate(selected);
                    }
                  }}
                  defaultValue=""
                  className="text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-bold focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Templat Tersimpan --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.projectType === 'training' ? 'Training' : 'Consulting'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Pilih Template Rumpun Bisnis Proyek:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormProjectType('training')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                      formProjectType === 'training'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        formProjectType === 'training' ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-slate-900">Corporate Training (Pelatihan)</div>
                      <div className="text-[10.5px] text-slate-500">
                        Silabus harian, peserta/pax, venue fullboard, kit modul, trainer master.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormProjectType('consulting')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                      formProjectType === 'consulting'
                        ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        formProjectType === 'consulting' ? 'text-teal-700' : 'text-slate-500'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-slate-900">Management Consulting (Konsultansi)</div>
                      <div className="text-[10.5px] text-slate-500">
                        Metodologi, WBS & milestone bertahap, alokasi Man-Days konsultan ahli, SOP.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Data Klien & Nomor Proposal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-teal-900">
                  1. Informasi Klien & Legalitas Surat
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nomor Surat Proposal Resmi</label>
                    <input
                      type="text"
                      required
                      value={formProposalNumber}
                      onChange={(e) => setFormProposalNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nama Perusahaan / Institusi Klien</label>
                    <input
                      type="text"
                      required
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tipe Entitas Klien</label>
                    <select
                      value={formClientType}
                      onChange={(e) => setFormClientType(e.target.value as ProposalDocument['clientType'])}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    >
                      <option value="BUMN">BUMN</option>
                      <option value="Kementerian / Lembaga">Kementerian / Lembaga</option>
                      <option value="Swasta Enterprise">Swasta Enterprise</option>
                      <option value="Pemerintah Daerah">Pemerintah Daerah</option>
                      <option value="Perbankan">Perbankan & Lembaga Keuangan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nama PIC Klien (Penerima Surat)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bambang Sudarmono, S.Psi."
                      value={formClientPicName}
                      onChange={(e) => setFormClientPicName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Jabatan PIC Klien</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP Human Capital Development"
                      value={formClientPicPosition}
                      onChange={(e) => setFormClientPicPosition(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Judul & Timeline */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-teal-900">
                  2. Judul Program & Jadwal Pelaksanaan
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Perihal / Judul Proposal Resmi</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Durasi Pelaksanaan</label>
                    <input
                      type="text"
                      required
                      placeholder={formProjectType === 'training' ? '3 Hari (24 JP)' : '8 Pekan Kerja'}
                      value={formDurationText}
                      onChange={(e) => setFormDurationText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Estimasi Tanggal Mulai</label>
                    <input
                      type="text"
                      required
                      value={formStartDateEst}
                      onChange={(e) => setFormStartDateEst(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Masa Berlaku Penawaran</label>
                    <input
                      type="number"
                      required
                      min={7}
                      max={90}
                      value={formValidityDays}
                      onChange={(e) => setFormValidityDays(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>

                {formProjectType === 'training' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Jumlah Peserta (Pax)</label>
                      <input
                        type="number"
                        min={1}
                        value={formParticipantsCount}
                        onChange={(e) => setFormParticipantsCount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Metode Pelatihan</label>
                      <select
                        value={trainingMethod}
                        onChange={(e) =>
                          setTrainingMethod(
                            e.target.value as TrainingProposalDetails['trainingMethod']
                          )
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                      >
                        <option value="Residential Hotel Workshop">Residential Hotel Workshop</option>
                        <option value="In-House Training (Offline)">In-House Training (Offline di Kantor Klien)</option>
                        <option value="Online Virtual Interactive">Online Virtual Interactive</option>
                        <option value="Blended Learning Hybrid">Blended Learning Hybrid</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Integrasi Finansial & HPP */}
              <div className="bg-teal-50/70 p-4 rounded-xl border-2 border-teal-600/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-teal-950 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-teal-700" />
                    <span>3. Integrasi Finansial & Kalkulasi HPP Internal</span>
                  </div>
                  {currentProject && (
                    <button
                      type="button"
                      onClick={handlePullCurrentHppData}
                      className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tarik Nilai HPP Aktif</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      HPP Modal Internal Proyek (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      step={500000}
                      value={formInternalHppCost}
                      onChange={(e) => setFormInternalHppCost(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Akumulasi biaya 5 POS (Tenaga Ahli, Venue, Kit, Transport, Overhead).
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-teal-900 block mb-1">
                      Harga Penawaran Resmi ke Klien (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      step={500000}
                      value={formProposedSellingPrice}
                      onChange={(e) => setFormProposedSellingPrice(Number(e.target.value))}
                      className="w-full bg-white border border-teal-400 rounded-lg px-3 py-1.5 font-mono font-bold text-teal-950 text-sm"
                    />
                    <div className="text-[10.5px] font-semibold text-emerald-700 mt-1">
                      Estimasi Gross Margin: {formProposedSellingPrice > 0 ? (((formProposedSellingPrice - formInternalHppCost) / formProposedSellingPrice) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-teal-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Catatan Ketentuan Perpajakan</label>
                    <input
                      type="text"
                      value={formTaxNotes}
                      onChange={(e) => setFormTaxNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Termin Pembayaran</label>
                    <input
                      type="text"
                      value={formPaymentTerms}
                      onChange={(e) => setFormPaymentTerms(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Proposal Section Editor */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-teal-900">
                      4. Struktur, Sistematika, & Narasi Proposal (Editor Dinamis)
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Kelola bab, narasi pendahuluan, daftar poin, dan penyisipan objek tabel biaya/silabus/milestone secara dinamis.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSec: ProposalSection = {
                        id: `sec-${Date.now()}`,
                        title: `${formSections.length + 1}. Bab Kustom Baru`,
                        type: 'text',
                        content: 'Tuliskan deskripsi narasi bab baru di sini...',
                      };
                      setFormSections([...formSections, newSec]);
                      showNotification('➕ Seksi bab kustom baru berhasil ditambahkan!');
                    }}
                    className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-lg text-[10.5px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Bab</span>
                  </button>
                </div>

                {formSections.length === 0 ? (
                  <div className="p-4 bg-white rounded-lg border border-slate-200 border-dashed text-center text-slate-400">
                    Belum ada seksi proposal yang dibuat. Klik tombol di atas untuk menambah sitematika kustom.
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {formSections.map((sec, index) => (
                      <div key={sec.id} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                        {/* Header Seksi */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center space-x-2 w-full max-w-[70%]">
                            <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormSections(formSections.map(s => s.id === sec.id ? { ...s, title: val } : s));
                              }}
                              placeholder="Nama Bab / Seksi..."
                              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-hidden font-bold text-slate-800 text-xs py-0.5 w-full"
                            />
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {/* Reorder Up */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                if (index === 0) return;
                                const updated = [...formSections];
                                const temp = updated[index];
                                updated[index] = updated[index - 1];
                                updated[index - 1] = temp;
                                setFormSections(updated);
                              }}
                              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Pindahkan ke atas"
                            >
                              ▲
                            </button>
                            {/* Reorder Down */}
                            <button
                              type="button"
                              disabled={index === formSections.length - 1}
                              onClick={() => {
                                if (index === formSections.length - 1) return;
                                const updated = [...formSections];
                                const temp = updated[index];
                                updated[index] = updated[index + 1];
                                updated[index + 1] = temp;
                                setFormSections(updated);
                              }}
                              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Pindahkan ke bawah"
                            >
                              ▼
                            </button>
                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setFormSections(formSections.filter(s => s.id !== sec.id));
                                showNotification('🗑️ Bab seksi proposal dihapus.');
                              }}
                              className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Hapus seksi ini"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Pengaturan Tipe Objek */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                          <div>
                            <label className="font-semibold text-slate-500 block mb-1">Tipe / Objek Konten</label>
                            <select
                              value={sec.type}
                              onChange={(e) => {
                                const newType = e.target.value as ProposalSection['type'];
                                setFormSections(formSections.map(s => {
                                  if (s.id !== sec.id) return s;
                                  return {
                                    ...s,
                                    type: newType,
                                    // if changing to bullet_list, ensure we have initial items
                                    items: newType === 'bullet_list' && !s.items ? ['Butir poin pertama...'] : s.items
                                  };
                                }));
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer"
                            >
                              <option value="text">Teks Narasi / Deskripsi</option>
                              <option value="bullet_list">Daftar Poin (Bullet List)</option>
                              <option value="table_costs">Objek: Tabel Biaya Komersial (Dari HPP)</option>
                              <option value="table_syllabus">Objek: Tabel Silabus & Kurikulum (Training)</option>
                              <option value="table_milestones">Objek: Tabel Milestone & Tahapan (Consulting)</option>
                              <option value="signatory">Objek: Blok Tanda Tangan Pengesahan</option>
                            </select>
                          </div>

                          <div className="flex items-end text-[10px] text-slate-400 pb-1 italic">
                            {sec.type === 'text' && '✨ Tipe teks naratif mendukung penulisan latar belakang atau penutup bebas.'}
                            {sec.type === 'bullet_list' && '✨ Tipe daftar poin untuk rincian sasaran, metodologi, atau benefit.'}
                            {sec.type === 'table_costs' && '✨ Otomatis merender tabel rincian penawaran investasi dari kalkulator HPP.'}
                            {sec.type === 'table_syllabus' && '✨ Otomatis menarik draf silabus harian kurikulum yang dipilih.'}
                            {sec.type === 'table_milestones' && '✨ Otomatis merender linimasa dan persentase pembayaran (Consulting).'}
                            {sec.type === 'signatory' && '✨ Merender kolom otorisasi resmi penandatangan di halaman akhir.'}
                          </div>
                        </div>

                        {/* Teks Pendahuluan / Pembuka */}
                        <div className="space-y-2">
                          <label className="font-semibold text-slate-500 block mb-1">Narasi Pengantar / Teks Pembuka Bab</label>
                          <textarea
                            rows={sec.type === 'text' ? 3 : 2}
                            value={sec.content}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormSections(formSections.map(s => s.id === sec.id ? { ...s, content: val } : s));
                            }}
                            placeholder="Tulis narasi atau instruksi pengantar bab..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white text-xs font-medium"
                          />
                        </div>

                        {/* Editor Item khusus untuk bullet_list */}
                        {sec.type === 'bullet_list' && (
                          <div className="bg-slate-50 p-2.5 rounded-lg space-y-2 text-[10.5px]">
                            <span className="font-semibold text-slate-600 block">Daftar Butir Poin:</span>
                            <div className="space-y-1.5">
                              {(sec.items || []).map((bullet, bIdx) => (
                                <div key={bIdx} className="flex items-center space-x-1.5">
                                  <span className="text-slate-400">•</span>
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      setFormSections(formSections.map(s => {
                                        if (s.id !== sec.id) return s;
                                        const newBullets = [...(s.items || [])];
                                        newBullets[bIdx] = newVal;
                                        return { ...s, items: newBullets };
                                      }));
                                    }}
                                    className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs w-full font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormSections(formSections.map(s => {
                                        if (s.id !== sec.id) return s;
                                        return { ...s, items: (s.items || []).filter((_, i) => i !== bIdx) };
                                      }));
                                    }}
                                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md cursor-pointer"
                                    title="Hapus poin ini"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormSections(formSections.map(s => {
                                  if (s.id !== sec.id) return s;
                                  return { ...s, items: [...(s.items || []), 'Butir poin baru...'] };
                                }));
                              }}
                              className="text-teal-700 hover:text-teal-900 font-bold transition flex items-center space-x-1 pt-1 cursor-pointer"
                            >
                              <span>➕ Tambah Butir Poin</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Signatory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Nama Pejabat Penandatangan TCMS</label>
                  <input
                    type="text"
                    required
                    value={formSignatoryName}
                    onChange={(e) => setFormSignatoryName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Jabatan Resmi Penandatangan</label>
                  <input
                    type="text"
                    required
                    value={formSignatoryTitle}
                    onChange={(e) => setFormSignatoryTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5"
                  />
                </div>
              </div>

              {/* Optional: Save current configuration as a new Template */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    <span>Butuh Menggunakan Struktur Ini Lagi Nanti?</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSaveAsTemplateOpen(!isSaveAsTemplateOpen)}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1 rounded-lg font-bold transition cursor-pointer border border-amber-300/60"
                  >
                    {isSaveAsTemplateOpen ? 'Batal Simpan Templat' : 'Simpan sebagai Templat Baru'}
                  </button>
                </div>

                {isSaveAsTemplateOpen && (
                  <div className="bg-white p-3 rounded-lg border border-amber-200/80 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Nama Templat Baru *</label>
                        <input
                          type="text"
                          placeholder="Contoh: Template Diklat Kepemimpinan"
                          value={newTemplateNameInput}
                          onChange={(e) => setNewTemplateNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Deskripsi Ringkas</label>
                        <input
                          type="text"
                          placeholder="Format modul pelatihan kepemimpinan supervisor..."
                          value={newTemplateDescInput}
                          onChange={(e) => setNewTemplateDescInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newTemplateNameInput.trim()) {
                            alert('Silakan masukkan nama templat terlebih dahulu.');
                            return;
                          }
                          handleSaveCurrentAsTemplate(newTemplateNameInput, newTemplateDescInput);
                          setIsSaveAsTemplateOpen(false);
                          setNewTemplateNameInput('');
                          setNewTemplateDescInput('');
                        }}
                        className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-[11px] transition cursor-pointer shadow-3xs"
                      >
                        Konfirmasi Simpan Templat
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const originalProp = proposals.find((p) => p.id === editingProposalId);
                    const currentProp: ProposalDocument = {
                      id: editingProposalId || `prop-${Date.now()}`,
                      proposalNumber: formProposalNumber || originalProp?.proposalNumber || 'PROP-DRAFT/2026',
                      title: formTitle,
                      clientName: formClientName || 'Nama Klien',
                      clientType: formClientType,
                      clientPicName: formClientPicName || 'Narahubung Klien',
                      clientPicPosition: formClientPicPosition || 'Jabatan',
                      projectType: formProjectType,
                      validityDays: formValidityDays,
                      startDateEst: formStartDateEst,
                      durationText: formDurationText,
                      participantsCount: formProjectType === 'training' ? formParticipantsCount : undefined,
                      internalHppCost: formInternalHppCost,
                      proposedSellingPrice: formProposedSellingPrice,
                      targetMarginPercent: formProposedSellingPrice > 0 ? ((formProposedSellingPrice - formInternalHppCost) / formProposedSellingPrice) * 100 : 35,
                      taxNotes: formTaxNotes,
                      paymentTerms: formPaymentTerms,
                      signatoryName: formSignatoryName,
                      signatoryTitle: formSignatoryTitle,
                      status: originalProp?.status || 'Draf Penawaran',
                      dateCreated: originalProp?.dateCreated || new Date().toISOString(),
                      includePpn11: true,
                      termsAndConditions: originalProp?.termsAndConditions || ['Penawaran berlaku selama 30 hari kalender sejak tanggal diterbitkan.'],
                      sections: formSections,
                      trainingDetails: formProjectType === 'training' ? {
                        targetAudience: trainingTargetAudience,
                        trainingMethod: trainingMethod,
                        learningObjectives: trainingLearningObjectives,
                        modules: originalProp?.trainingDetails?.modules || [],
                        trainers: originalProp?.trainingDetails?.trainers || [],
                        facilitiesIncluded: originalProp?.trainingDetails?.facilitiesIncluded || ['Modul Cetak', 'Sertifikat Kelulusan'],
                        evaluationModel: 'Kirkpatrick Level 1-3',
                      } : undefined,
                      consultingDetails: formProjectType === 'consulting' ? {
                        problemStatement: consultingProblemStatement,
                        approachFramework: consultingFramework,
                        milestones: originalProp?.consultingDetails?.milestones || [],
                        expertTeam: originalProp?.consultingDetails?.expertTeam || [],
                        consultingType: 'Tata Kelola & SOP',
                        finalDeliverables: ['Dokumen Rekomendasi & Standard Operating Procedures'],
                      } : undefined,
                    };
                    setIsModalOpen(false);
                    setSelectedProposalForPrint(currentProp);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
                  title="Kembali ke tampilan preview dokumen sebelumnya"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-600" />
                  <span>Kembali</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    {editingProposalId ? 'Simpan Perubahan Proposal' : 'Terbitkan Dokumen Proposal'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat / Edit Templat Kustom */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-amber-800 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingTemplateId ? 'Edit Templat Proposal' : 'Buat Templat Proposal Kustom'}
                </h3>
                <p className="text-xs text-amber-200">
                  Desain struktur default, klausul, termin, dan tanda tangan tanda terima.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTemplateModalOpen(false);
                  setEditingTemplateId(null);
                }}
                className="text-amber-200 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTemplateForm} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Templat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Format Penawaran BUMN Swasta"
                    value={templateFormName}
                    onChange={(e) => setTemplateFormName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Ringkas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Khusus program pelatihan intensif 3 hari"
                    value={templateFormDesc}
                    onChange={(e) => setTemplateFormDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Utama Proposal (Template)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proposal Penawaran Program In-House Training"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Proyek</label>
                  <select
                    value={formProjectType}
                    onChange={(e) => setFormProjectType(e.target.value as ProposalProjectType)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="training">Training (Pelatihan)</option>
                    <option value="consulting">Consultation (Konsultansi)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi Default</label>
                  <input
                    type="text"
                    required
                    placeholder="3 Hari Intensif / 6 Pekan"
                    value={formDurationText}
                    onChange={(e) => setFormDurationText(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ketentuan Pajak</label>
                  <input
                    type="text"
                    required
                    placeholder="Belum termasuk PPN 11%"
                    value={formTaxNotes}
                    onChange={(e) => setFormTaxNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ketentuan Pembayaran / Termin</label>
                <input
                  type="text"
                  required
                  placeholder="Termin I (DP 50%), Termin II (Pelunasan 50%)"
                  value={formPaymentTerms}
                  onChange={(e) => setFormPaymentTerms(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Penandatangan Otoritas</label>
                  <input
                    type="text"
                    required
                    placeholder="Rian Pratama, S.E., M.M."
                    value={formSignatoryName}
                    onChange={(e) => setFormSignatoryName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan Penandatangan</label>
                  <input
                    type="text"
                    required
                    placeholder="Head of Commercial TCMS"
                    value={formSignatoryTitle}
                    onChange={(e) => setFormSignatoryTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsTemplateModalOpen(false);
                    setEditingTemplateId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Simpan Format Templat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Print & PDF Export Modal */}
      {selectedProposalForPrint && (
        <ProposalOfficialPrintView
          isOpen={!!selectedProposalForPrint}
          onClose={() => setSelectedProposalForPrint(null)}
          proposal={selectedProposalForPrint}
          onEdit={() => handleOpenEditModal(selectedProposalForPrint)}
        />
      )}
    </div>
  );
};
