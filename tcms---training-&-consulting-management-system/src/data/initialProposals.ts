import { ProposalDocument } from '../types';

export const INITIAL_PROPOSALS: ProposalDocument[] = [
  {
    id: 'prop-trn-001',
    proposalNumber: 'PROP-TCMS/TRN/2026/09/018',
    projectType: 'training',
    title: 'Service Excellence & Transformational Leadership Batch 1',
    clientName: 'PT Telkom Indonesia (Persero) Tbk',
    clientType: 'BUMN',
    clientPicName: 'Bambang Sudarmono, S.Psi., M.M.',
    clientPicPosition: 'VP Human Capital Development & Learning Academy',
    dateCreated: '15/09/2026',
    validityDays: 30,
    startDateEst: '25 Oktober 2026',
    durationText: '3 Hari Intensif (24 Jam Pelajaran)',
    participantsCount: 35,
    internalHppCost: 145000000,
    proposedSellingPrice: 223000000,
    targetMarginPercent: 34.98,
    includePpn11: false,
    taxNotes: 'Harga penawaran belum termasuk PPN 11%. Pajak PPh 23 (2%) dipotong oleh klien sesuai ketentuan perpajakan BUMN.',
    paymentTerms: 'Termin I DP 50% saat konfirmasi SPK/PO, Termin II Pelunasan 50% maksimal 14 hari kerja setelah penyerahan Laporan Evaluasi.',
    status: 'Terkirim ke Klien',
    signatoryName: 'Rian Pratama, S.E., M.M.',
    signatoryTitle: 'Head of Business Development & Commercial Star Office',
    trainingDetails: {
      targetAudience: 'Level Asisten Manajer, Supervisor, dan Team Leader Lini Depan Pelayanan Enterprise (35 Pax).',
      trainingMethod: 'Residential Hotel Workshop',
      learningObjectives: [
        'Membangun paradigma Service Mindset 4.0 yang berorientasi pada kepuasan pelanggan loyal dan pemecahan masalah proaktif.',
        'Menguasai metodologi Service Recovery untuk menangani keluhan pelanggan tier-1 secara cepat, empatik, dan beretika tinggi.',
        'Menerapkan gaya kepemimpinan transformasional dalam menggerakkan tim kerja di tengah disrupsi teknologi digital.',
        'Menyusun Rencana Aksi Individu (Individual Action Plan) yang terukur dan berdampak langsung pada Key Performance Indicator (KPI) unit kerja.',
      ],
      modules: [
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
            'Protokol HEAR (Hear, Empathize, Apologize, Resolve) dalam Penanganan Komplain',
            'Simulasi Menghadapi Situasi Kritis & Pelanggan Menuntut',
            'Praktik Role-Play Langsung di Depan Kamera dengan Feedback Instan dari Trainer',
          ],
          interactiveMethod: 'Simulasi Role-Play dengan Rekaman Video & Umpan Balik Personal',
        },
        {
          dayNumber: 3,
          title: 'Hari 3: Transformational Leadership & Action Learning Execution',
          durationHours: 8,
          topics: [
            'Prinsip Kepemimpinan Transformasional: Lead by Example & Coaching Tim',
            'Membangun Iklim Kerja Kolaboratif Berdaya Tahan Tinggi (Resilience)',
            'Penyusunan Individual Service Action Plan (ISAP) untuk 90 Hari ke Depan',
            'Presentasi Kelompok Rencana Aksi, Evaluasi Level 2, dan Komitmen Bersama',
          ],
          interactiveMethod: 'Lokakarya Rencana Aksi (Action Planning Workshop) & Post-Test Terstandar',
        },
      ],
      trainers: [
        {
          name: 'Dr. Hendra Gunawan, MBA',
          role: 'Master Trainer & Culture Specialist',
          credentials: 'Certified International Master Trainer (ATD), Penasihat Transformasi Budaya BUMN.',
          specialization: 'Strategic Leadership & Corporate Culture Transformation',
        },
        {
          name: 'Rina Marlina, M.Psi., Psikolog',
          role: 'Lead Facilitator Service Excellence',
          credentials: 'Psikolog Industri & Organisasi, Certified Customer Experience Professional (CCXP).',
          specialization: 'Customer Service Psychology, Emotional Intelligence & Communication',
        },
      ],
      facilitiesIncluded: [
        'Paket Fullboard Meeting Hotel Bintang 4 selama 3 hari (2x Coffee Break, 1x Lunch Buffet setiap hari).',
        'Buku Modul Eksklusif Full Color, Leatherette Binder, dan Luxury Executive Pen.',
        'Sertifikat Kelulusan Resmi berseri nomor unik dari Star Office TCMS.',
        'Pre-Test & Post-Test terstandar dengan analisis statistik peningkatan kompetensi.',
        'Laporan Evaluasi Pelatihan Komprehensif (Kirkpatrick Level 1 & Level 2) untuk Direksi Telkom.',
      ],
      evaluationModel: 'Evaluasi Kirkpatrick 3-Level: Level 1 (Reaction Index kepuasan min. 85%), Level 2 (Post-Test peningkatan skor min. 25%), Level 3 (Review Implementasi Action Plan 60 hari pasca-pelatihan).',
    },
    termsAndConditions: [
      'Penawaran harga ini berlaku selama 30 (tiga puluh) hari kalender sejak tanggal proposal diterbitkan.',
      'Konfirmasi pelaksanaan dilakukan dengan menerbitkan Surat Perintah Kerja (SPK) atau Purchase Order (PO) resmi dari PT Telkom Indonesia (Persero) Tbk.',
      'Perubahan tanggal pelaksanaan paling lambat diinformasikan 10 hari kerja sebelum jadwal untuk penyesuaian reservasi hotel & jadwal instruktur.',
      'Materi modul, lembar kerja, dan hak cipta pelatihan merupakan milik bersama Star Office TCMS dan klien untuk kepentingan internal organisasi.',
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
          'Membangun paradigma Service Mindset 4.0 yang berorientasi pada kepuasan pelanggan loyal dan pemecahan masalah proaktif.',
          'Menguasai metodologi Service Recovery untuk menangani keluhan pelanggan tier-1 secara cepat, empatik, dan beretika tinggi.',
          'Menerapkan gaya kepemimpinan transformasional dalam menggerakkan tim kerja di tengah disrupsi teknologi digital.',
          'Menyusun Rencana Aksi Individu (Individual Action Plan) yang terukur dan berdampak langsung pada Key Performance Indicator (KPI) unit kerja.'
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
    ],
  },
  {
    id: 'prop-cns-002',
    proposalNumber: 'PROP-TCMS/CNS/2026/09/024',
    projectType: 'consulting',
    title: 'Penyusunan Standar Operasional Prosedur (SOP) & Framework Tata Kelola Manajemen Risiko Terintegrasi',
    clientName: 'PT Bank Mandiri (Persero) Tbk',
    clientType: 'BUMN',
    clientPicName: 'Hj. Kartika Wulandari, S.E., Ak., CA',
    clientPicPosition: 'Senior Vice President Enterprise Risk Management & Compliance Directorate',
    dateCreated: '18/09/2026',
    validityDays: 30,
    startDateEst: '01 November 2026',
    durationText: '8 Pekan Kerja (2 Bulan Kalender)',
    internalHppCost: 185000000,
    proposedSellingPrice: 285000000,
    targetMarginPercent: 35.08,
    includePpn11: false,
    taxNotes: 'Nilai penawaran belum termasuk PPN 11%. PPh 23 (2%) dipotong oleh Bank Mandiri pada saat pembayaran setiap termin.',
    paymentTerms: 'Termin I (DP 30% setelah SPK), Termin II (40% setelah penyerahan Draf SOP Tahap 2), Termin III (30% setelah Berita Acara Serah Terima Final).',
    status: 'Negosiasi (BAFO)',
    signatoryName: 'Dr. Ir. Hendra Gunawan, MBA',
    signatoryTitle: 'Managing Partner & Direktur Eksekutif Konsultansi TCMS',
    consultingDetails: {
      consultingType: 'Tata Kelola & SOP',
      problemStatement: 'Kebutuhan standardisasi proses operasional perkreditan dan mitigasi risiko kepatuhan terhadap regulasi POJK terkini serta implementasi framework Basel III yang memerlukan manual SOP terpadu dan matriks RCSA yang mutakhir.',
      approachFramework: 'Pendekatan 4-Stage Consultative Lifecycle: (1) Asesmen Diagnostik As-Is, (2) Redesain Proses & Formulasi SOP To-Be, (3) Uji Coba Simulasi (Pilot Walkthrough) & Alignment, (4) Final Handover & ToT.',
      milestones: [
        {
          phase: 'Tahap 1',
          phaseTitle: 'Diagnostik Proses Eksisting & Kajian Kepatuhan Regulasi',
          durationWeeks: 'Pekan 1 - 2',
          keyActivities: [
            'Wawancara mendalam dengan 12 Head of Unit & Risk Champions',
            'Telaah regulasi POJK, SEOJK, dan kebijakan internal perkreditan',
            'Pemetaan gap kepatuhan dan inventarisasi inefisiensi alur operasional',
          ],
          deliverables: 'Laporan Diagnostik As-Is Process & Gap Analysis Matrix',
          paymentPercentage: 30,
        },
        {
          phase: 'Tahap 2',
          phaseTitle: 'Desain Arsitektur Proses Bisnis & Penyusunan Draf SOP',
          durationWeeks: 'Pekan 3 - 5',
          keyActivities: [
            'Penyusunan 24 dokumen SOP teknis berbasis format standar BPMN 2.0',
            'Penyusunan matriks Risk and Control Self-Assessment (RCSA)',
            'Penyusunan Key Risk Indicators (KRI) dan Service Level Agreement (SLA)',
          ],
          deliverables: 'Draf Lengkap 24 SOP Operasional, Form Kendali, dan Matriks RCSA',
          paymentPercentage: 40,
        },
        {
          phase: 'Tahap 3',
          phaseTitle: 'Walkthrough Validation & Training of Trainers (ToT)',
          durationWeeks: 'Pekan 6 - 7',
          keyActivities: [
            'Simulasi alur operasional bersama tim pelaksana cabang percontohan',
            'Penyempurnaan feedback dari unit audit internal dan divisi kepatuhan',
            'Pelaksanaan workshop Training of Trainers (ToT) untuk 20 Internal Auditors',
          ],
          deliverables: 'Berita Acara Walkthrough & Dokumentasi ToT',
          paymentPercentage: 0,
        },
        {
          phase: 'Tahap 4',
          phaseTitle: 'Finalisasi Master Policy & Executive Handover',
          durationWeeks: 'Pekan 8',
          keyActivities: [
            'Penerbitan Buku Panduan Master Kebijakan SOP & Tata Kelola Risiko',
            'Executive Briefing kepada Direksi & Dewan Komisaris',
            'Penandatanganan Berita Acara Serah Terima Pekerjaan (BAST)',
          ],
          deliverables: 'Buku Master Policy SOP, Softcopy Editable Source, BAST Resmi',
          paymentPercentage: 30,
        },
      ],
      expertTeam: [
        {
          name: 'Prof. Dr. Ir. Soegiharto, M.Sc., QRMO',
          role: 'Lead Consultant / Project Director',
          manDays: 20,
          billingRateDaily: 5000000,
        },
        {
          name: 'Farhan Zulkarnaen, S.E., M.Fin, FRM',
          role: 'Senior Subject Matter Expert',
          manDays: 25,
          billingRateDaily: 3500000,
        },
        {
          name: 'Anindya Putri, S.Kom., M.T.',
          role: 'Senior Management Consultant',
          manDays: 30,
          billingRateDaily: 2500000,
        },
        {
          name: 'Dwi Wicaksono, S.Stat.',
          role: 'Business & Data Analyst',
          manDays: 25,
          billingRateDaily: 1500000,
        },
      ],
      finalDeliverables: [
        '1 Dokumen Master Policy & Kerangka Kerja Tata Kelola Risiko Terintegrasi.',
        '24 Dokumen Standar Operasional Prosedur (SOP) lengkap dengan diagram BPMN 2.0.',
        '1 Matriks Risk & Control Self-Assessment (RCSA) beserta lembar instrumen audit internal.',
        'Pelaksanaan 1 Sesi Workshop Training of Trainers (ToT) untuk 20 Risk Officers.',
        'Executive Summary & Paparan Presentasi Strategis untuk Jajaran Direksi.',
      ],
    },
    termsAndConditions: [
      'Masa berlaku penawaran adalah 30 (tiga puluh) hari kerja sejak tanggal penerbitan.',
      'Bank Mandiri menyediakan data dokumen eksisting, akses wawancara personel kunci, dan ruang koordinasi kerja selama masa penugasan konsultan.',
      'Seluruh tenaga ahli konsultan menandatangani Perjanjian Kerahasiaan Informasi (Non-Disclosure Agreement) sebelum dimulainya penugasan.',
      'Pembayaran dilakukan melalui transfer bank resmi atas nama rekening PT Cipta Perdana Enterprise (Star Office TCMS).',
    ],
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
    ],
  },
];
