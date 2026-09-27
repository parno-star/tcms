import React from 'react';
import { UserRole } from '../types';
import { USER_ROLES } from '../data/initialData';
import { ShieldCheck, UserCheck, AlertCircle, Edit3, CheckCircle2, Lock, FlaskConical, Activity, RefreshCw } from 'lucide-react';

interface RoleBannerProps {
  activeRole: UserRole;
  projectStatus: string;
  isSimulationMode?: boolean;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  activeRole,
  projectStatus,
  isSimulationMode = false,
}) => {
  const currentRole = USER_ROLES.find((r) => r.id === activeRole) || USER_ROLES[0];

  return (
    <div className="bg-slate-100/90 border-b border-slate-300 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 rounded-xl border border-teal-200/80 bg-teal-50 shadow-2xs shrink-0">
              {activeRole === 'super_admin' && <ShieldCheck className="w-5 h-5 text-teal-800" />}
              {activeRole === 'administrator' && <UserCheck className="w-5 h-5 text-teal-700" />}
              {activeRole === 'konseptor' && <Edit3 className="w-5 h-5 text-teal-700" />}
              {activeRole === 'pemeriksa' && <CheckCircle2 className="w-5 h-5 text-teal-700" />}
              {activeRole === 'penyetuju' && <Lock className="w-5 h-5 text-teal-800" />}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  Otorisasi Tata Kelola:
                </span>
                <span className="inline-flex items-center justify-center py-0.5 px-2.5 rounded-md font-bold text-[10px] uppercase leading-none border bg-teal-100/80 text-teal-900 border-teal-200">
                  {currentRole.title}
                </span>

                {/* Mode Tag */}
                {isSimulationMode && (
                  <span className="inline-flex items-center space-x-1 py-0.5 px-2 rounded-md font-bold text-[10px] uppercase bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <FlaskConical className="w-3 h-3 text-amber-700" />
                    <span>Mode Simulasi Training Aktif</span>
                  </span>
                )}
              </div>
              
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {currentRole.actorName} <span className="text-xs font-semibold text-slate-500">({currentRole.subtitle})</span>
              </p>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {currentRole.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Status Proyek:</span>
              <span className="inline-flex items-center justify-center py-0.5 px-2.5 rounded-md font-bold text-[10px] uppercase leading-none bg-emerald-50 text-emerald-800 border border-emerald-200">
                {projectStatus}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
