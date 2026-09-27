import React from 'react';
import { UserRole } from '../types';
import { USER_ROLES } from '../data/initialData';
import { ShieldAlert, UserCheck, RefreshCw, Calculator, FileCheck, Award } from 'lucide-react';

interface HeaderProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onResetCaseStudy: () => void;
  currentProjectCode: string;
  marginStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onSelectRole,
  onResetCaseStudy,
  currentProjectCode,
  marginStatus,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-xs border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 shadow-xs">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  PT CIPTA PERDANA ENTERPRISE <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">TCMS</span>
                </h1>
                <span className="text-xs text-slate-400 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline-block">
                  {currentProjectCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Kalkulator Anggaran & Profitabilitas Proyek Pelatihan
              </p>
            </div>
          </div>

          {/* Role Governance Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <span className="text-xs font-bold text-slate-300 hidden xl:flex items-center gap-1 mr-1">
              <span>Pilih Peran Tim:</span>
            </span>
            
            <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xs gap-1">
              {USER_ROLES.map((role) => {
                const isActive = activeRole === role.id;
                let activeColorClass = 'bg-white text-slate-900 shadow-xs';

                const roleLabel = role.id === 'konseptor' ? 'Perancang (Sales)' : role.id === 'pemeriksa' ? 'Pemeriksa (Keuangan)' : 'Penyetuju (Pimpinan)';

                return (
                  <button
                    key={role.id}
                    onClick={() => onSelectRole(role.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? activeColorClass
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <span>{roleLabel}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onResetCaseStudy}
              title="Reset Simulasi Proyek Pelatihan"
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-xs transition duration-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Ulangi Contoh Proyek</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
