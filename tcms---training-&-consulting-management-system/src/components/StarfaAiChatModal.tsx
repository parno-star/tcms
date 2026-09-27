import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Building2,
  Calculator,
  ShieldCheck,
  TrendingUp,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ProjectOpportunity, CostItem } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculator';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: string;
}

interface StarfaAiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectOpportunity;
  costItems: CostItem[];
  discountPercent: number;
  initialPrompt?: string;
}

const DEFAULT_SUGGESTIONS = [
  {
    label: 'Analisis Margin Proyek',
    icon: TrendingUp,
    prompt: 'Tolong analisis kondisi margin kotor dan net margin proyek pelatihan saat ini. Apakah diskon masih dalam batas aman perusahaan?',
  },
  {
    label: 'Rekomendasi Efisiensi POS HPP',
    icon: Calculator,
    prompt: 'Berikan rekomendasi efisiensi biaya pada POS HPP untuk proyek ini agar margin bisa naik tanpa mengurangi kepuasan peserta.',
  },
  {
    label: 'Perhitungan Pajak PPh 21/23',
    icon: FileText,
    prompt: 'Bagaimana aturan pemotongan pajak PPh 21 untuk narasumber non-pegawai dan PPh 23 untuk vendor sewa hotel/katering?',
  },
  {
    label: 'Strategi Negosiasi Klien BUMN',
    icon: ShieldCheck,
    prompt: 'Klien meminta diskon tambahan 10%. Bagaimana strategi negosiasi dan kompromi scope yang aman untuk diusulkan?',
  },
];

export const StarfaAiChatModal: React.FC<StarfaAiChatModalProps> = ({
  isOpen,
  onClose,
  project,
  costItems,
  discountPercent,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeProjectContext, setIncludeProjectContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'msg-welcome',
        role: 'model',
        content: `Halo! Saya **Starfa AI**, asisten cerdas berbasis **Gemini AI** untuk **Star TCMS** (Training & Consulting Management System).

Saya siap membantu Anda dalam:
- 📊 **Evaluasi Margin & Estimasi HPP:** Memastikan net margin proyek Anda tetap di zona sehat (≥ 30%).
- 🧮 **Rasionalisasi POS Biaya HPP:** POS 00 (Trainer), POS 01 (Venue & F&B), POS 02 (Modul & Kit), POS 03 (Logistik), POS 04 (Panitia), POS 05 (Overhead).
- 🔒 **Tata Kelola RAP v1.0 & PO Vendor:** Panduan penguncian anggaran dan pencegahan overbudget.
- 📑 **Perpajakan & Kasbon Lapangan:** Perhitungan PPh 21/23 dan rekonsiliasi kasbon tim.

*Silakan pilih topik di bawah atau ketikkan pertanyaan Anda.*`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-3.6-flash',
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length]);

  // Handle Initial Prompt trigger if provided
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentNetMargin = project.netMarginPercent ?? 32.5;

  const getProjectContextPayload = () => {
    if (!includeProjectContext) return null;

    return {
      projectName: project.name,
      client: project.clientName,
      clientType: project.clientType,
      headcount: project.headcount?.totalHeadcount || 30,
      participants: project.headcount?.participants || 30,
      durationDays: project.headcount?.days || 3,
      totalCost: project.totalProjectCost,
      normalPrice: project.normalSellingPrice,
      sellingPrice: project.actualSellingPrice,
      discount: discountPercent,
      grossMargin: project.grossMarginPercent,
      netMargin: currentNetMargin,
      status: project.status,
      costCategoriesCount: costItems.length,
      sampleItems: costItems.slice(0, 8).map((c) => ({
        pos: c.category,
        name: c.name,
        total: c.totalCost,
        unitPrice: c.unitPrice,
        qty: c.quantity,
      })),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let replyText = '';
      let replySource = 'gemini-3.6-flash';

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            context: getProjectContextPayload(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.reply) {
            replyText = data.reply;
            replySource = data.source || 'gemini-3.6-flash';
          }
        }
      } catch (fetchErr) {
        console.warn('Backend fetch failed, activating client domain fallback:', fetchErr);
      }

      // If replyText is still empty (due to network issue or rate limit)
      if (!replyText) {
        const lowerMsg = text.toLowerCase();
        if (lowerMsg.includes('margin') || lowerMsg.includes('profit') || lowerMsg.includes('untung')) {
          replyText = `### 📊 Analisis Kesehatan Margin Proyek — Starfa AI

Berdasarkan data proyek **"${project.name}"** saat ini:
- **Net Margin:** **${currentNetMargin.toFixed(1)}%** (${currentNetMargin >= 30 ? '✅ Zona Sehat / Hijau' : currentNetMargin >= 20 ? '⚠️ Zona Waspada / Kuning' : '🚨 Zona Kritis / Merah'})
- **Harga Penawaran Aktual:** Rp ${Number(project.actualSellingPrice || 0).toLocaleString('id-ID')}
- **Total Modal (COGS HPP):** Rp ${Number(project.totalProjectCost || 0).toLocaleString('id-ID')}

**Rekomendasi Strategi:**
1. Pertahankan Net Margin di atas 25-30% untuk menjaga arus kas operasional pelatihan.
2. Gunakan fasilitas penguncian RAP v1.0 sebelum menerbitkan PO Mitra / Vendor.`;
          replySource = 'starfa-tcms-client-core';
        } else if (lowerMsg.includes('pos') || lowerMsg.includes('biaya') || lowerMsg.includes('hpp') || lowerMsg.includes('hemat')) {
          replyText = `### 💡 Panduan Efisiensi POS HPP — Starfa AI

1. **POS 00 (Trainer):** Optimalkan honor dengan rate card terstandar BNSP.
2. **POS 01 (Venue & F&B):** Pilih *Fullday Package* jika peserta tidak memerlukan inap.
3. **POS 02 (Modul & Kits):** Kombinasikan E-Book PDF Interaktif + Ringkasan Cetak 15 Halaman.
4. **POS 03 (Logistik):** Konsolidasikan kargo dengan bagasi tim panitia.
5. **POS 04 (Panitia):** Rasio ideal 1 panitia per 10-15 peserta.
6. **POS 05 (Overhead):** Kontinjensi aman 3-5%.`;
          replySource = 'starfa-tcms-client-core';
        } else {
          replyText = `Halo! Saya **Starfa AI** (Powered by Gemini AI).

Saya telah menerima pertanyaan Anda mengenai **"${text}"**.

Ada yang ingin Anda analisis lebih lanjut mengenai **Net Margin (${currentNetMargin.toFixed(1)}%)**, efisiensi **POS HPP**, atau penguncian **RAP v1.0** proyek ini?`;
          replySource = 'starfa-tcms-client-core';
        }
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        source: replySource,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error sending message to Starfa AI:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Mohon maaf, terjadi kendala teknis (${err?.message || 'Koneksi terputus'}). Silakan coba kembali.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      role: 'model',
      content: `Riwayat percakapan telah dibersihkan. Ada yang ingin Anda diskusikan seputar estimasi HPP, margin, RAP v1.0, atau regulasi pajak pelatihan?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash',
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 overflow-hidden ${
          isFullScreen
            ? 'w-full h-full max-w-none rounded-none'
            : 'w-full max-w-3xl h-[88vh] max-h-[760px]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-teal-700/50 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Starfa Avatar with Pulsing Active Dot */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-xs border border-teal-400/40">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-teal-950" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white tracking-tight leading-tight">
                  Tanya Starfa AI
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-700/80 text-teal-100 border border-teal-500/40 font-mono">
                  Gemini AI (Free Tier)
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 truncate mt-0.5">
                Konsultan Finansial, HPP &amp; Tata Kelola Pelatihan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Reset chat button */}
            <button
              onClick={handleResetChat}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Bersihkan Riwayat Percakapan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer hidden sm:flex"
              title={isFullScreen ? 'Perkecil' : 'Layar Penuh'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-rose-600/80 rounded-lg transition cursor-pointer"
              title="Tutup Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Banner */}
        <div className="bg-teal-50/80 border-b border-teal-100/90 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-bold text-teal-900 flex items-center gap-1 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Proyek Aktif:</span>
            </span>
            <span className="text-teal-800 font-semibold truncate">
              {project.name}
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <span className="hidden sm:inline-block text-slate-600 font-medium">
              {project.headcount?.totalHeadcount || project.headcount?.participants || 30} Pax
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <span
              className={`font-bold font-mono px-1.5 py-0.2 rounded text-[11px] ${
                currentNetMargin >= 30
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentNetMargin >= 20
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              Net Margin {currentNetMargin.toFixed(1)}%
            </span>
          </div>

          <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-teal-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeProjectContext}
              onChange={(e) => setIncludeProjectContext(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Sertakan Data Proyek</span>
          </label>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isModel ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Bot Avatar */}
                {isModel && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5 border border-teal-600/30">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs transition-all shadow-2xs ${
                    isModel
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      : 'bg-teal-700 text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  {/* Sender Header */}
                  <div
                    className={`flex items-center justify-between gap-2 pb-1 mb-2 border-b text-[10px] font-semibold ${
                      isModel
                        ? 'border-slate-100 text-slate-400'
                        : 'border-teal-600/60 text-teal-100'
                    }`}
                  >
                    <span className="font-bold">
                      {isModel ? 'Starfa AI' : 'Anda'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{msg.timestamp}</span>
                      {isModel && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="hover:text-teal-700 transition cursor-pointer p-0.5"
                          title="Salin Pesan"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Body with Markdown */}
                  <div
                    className={`prose prose-xs max-w-none leading-relaxed break-words ${
                      isModel
                        ? 'text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-teal-700 prose-strong:text-slate-900 prose-table:border-slate-200'
                        : 'text-white prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white'
                    }`}
                  >
                    <div className="markdown-body">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>

                {/* User Avatar */}
                {!isModel && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-2.5 justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-700 to-teal-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                  </div>
                  <span>Starfa AI sedang menganalisis data dengan Gemini...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips */}
        <div className="bg-white border-t border-slate-100 px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            Topik Cepat:
          </span>
          {DEFAULT_SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(item.prompt)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Icon className="w-3 h-3 text-teal-600 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Input Area */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end space-x-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan analisis HPP, proteksi margin, pajak PPh 21/23, atau negosiasi tender..."
                rows={1}
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 transition resize-none min-h-[42px] max-h-[120px]"
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-[42px] px-4 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>
              Tekan <kbd className="font-mono bg-slate-100 px-1 rounded border border-slate-200">Enter</kbd> untuk kirim, <kbd className="font-mono bg-slate-100 px-1 rounded border border-slate-200">Shift+Enter</kbd> untuk baris baru.
            </span>
            <span className="font-medium text-teal-700">
              Star TCMS Enterprise • Gemini AI Core
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
