import React, { useState } from 'react';
import { TRAINING_RUNSHEET } from '../data/initialData';
import { TrainingRunSheetItem } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  Printer,
  Download,
} from 'lucide-react';

export const TrainingRunSheetView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [runsheetItems, setRunsheetItems] = useState<TrainingRunSheetItem[]>(TRAINING_RUNSHEET);

  const days = [
    { day: 1, label: 'Hari 1: Orientasi & Fondasi Leadership', date: 'Senin, 14 Okt 2026' },
    { day: 2, label: 'Hari 2: Transformasi Digital & Simulasi AI', date: 'Selasa, 15 Okt 2026' },
    { day: 3, label: 'Hari 3: Action Plan, Evaluasi & Penutupan', date: 'Rabu, 16 Okt 2026' },
  ];

  const currentDayItems = runsheetItems.filter((i) => i.day === selectedDay);

  const toggleStatus = (id: string) => {
    setRunsheetItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: TrainingRunSheetItem['status'] =
          item.status === 'Completed'
            ? 'Upcoming'
            : item.status === 'Upcoming'
            ? 'In Session'
            : 'Completed';
        return { ...item, status: nextStatus };
      })
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-base font-bold text-slate-900">
              Jadwal &amp; Run-Sheet Operasional Pelatihan (35 Pax)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Rundown per jam, penugasan Master Trainer (POS 00), kesiapan ruangan hotel (POS 01),
            dan distribusi logistik kit peserta (POS 02).
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Run-Sheet</span>
          </button>
        </div>
      </div>

      {/* Day Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {days.map((d) => {
          const isActive = selectedDay === d.day;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                isActive
                  ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-600/10 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`text-[10px] font-bold block uppercase tracking-wider ${isActive ? 'text-teal-800' : 'text-slate-400'}`}>
                {d.date}
              </span>
              <span className={`text-xs font-bold block mt-0.5 ${isActive ? 'text-teal-950' : 'text-slate-800'}`}>
                {d.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            AGENDA OPERASIONAL HARI KE-{selectedDay}
          </div>
          <span className="text-xs text-slate-400">
            Klik status untuk memperbarui progres
          </span>
        </div>

        <div className="relative pl-5 space-y-3 border-l-2 border-slate-200 ml-2">
          {currentDayItems.map((item) => {
            const isCompleted = item.status === 'Completed';
            const isOngoing = item.status === 'In Session';

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition ${
                    isCompleted
                      ? 'border-emerald-600 bg-emerald-600'
                      : isOngoing
                      ? 'border-teal-700 ring-2 ring-teal-100 animate-pulse'
                      : 'border-slate-300'
                  }`}
                />

                <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl p-3 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs font-bold font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeSlot}</span>
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">{item.sessionTitle}</h3>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded cursor-pointer transition border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : isOngoing
                          ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isCompleted ? '✓ Selesai' : isOngoing ? '● Berlangsung' : '○ Dijadwalkan'}
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">PIC / Trainer: <strong className="text-slate-700 font-medium">{item.trainerOrPic}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Lokasi: <strong className="text-slate-700 font-medium">{item.venueRoom}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Kit: <strong className="text-slate-700 font-medium">{item.logisticsKitNeeded}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
