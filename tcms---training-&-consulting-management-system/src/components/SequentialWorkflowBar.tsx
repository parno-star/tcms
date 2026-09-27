import React from 'react';
import { ProjectOpportunity, Employee, UserRole } from '../types';
import { EMPLOYEES } from '../data/initialData';
import { Edit3, CheckCircle2, ShieldCheck, Lock, UserCheck, ArrowRight, AlertCircle, FileCheck2, Clock, Check } from 'lucide-react';

interface SequentialWorkflowBarProps {
  project: ProjectOpportunity;
  currentEmployee: Employee;
  isSimulationMode?: boolean;
  onSelectEmployee: (emp: Employee) => void;
  onSubmitForReview: () => void;
  onVerifyByChecker: () => void;
  onApproveByExecutive: (note: string) => void;
  onRejectProposal: (reason: string) => void;
}

export const SequentialWorkflowBar: React.FC<SequentialWorkflowBarProps> = ({
  project,
  currentEmployee,
  isSimulationMode = false,
  onSelectEmployee,
  onSubmitForReview,
  onVerifyByChecker,
  onApproveByExecutive,
  onRejectProposal,
}) => {
  // Determine current active stage index (0-based)
  const getStageIndex = (status: ProjectOpportunity['status']) => {
    switch (status) {
      case 'Draft':
        return 0;
      case 'Pending Review':
        return 1;
      case 'Verified':
      case 'Pending Approval - VP':
      case 'Pending Approval - CEO':
        return 2;
      case 'Approved & Locked':
        return 3;
      case 'Rejected':
        return 0; // Return to draft phase
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(project.status);

  // Target responsible employee for current stage
  const getResponsibleEmployee = (): { employee: Employee; requiredRole: UserRole; taskTitle: string } => {
    const status = project?.status || 'Draft';

    if (status === 'Pending Review' || status.includes('Review')) {
      const pemeriksa = EMPLOYEES.find((e) => e.role === 'pemeriksa') || EMPLOYEES[3] || EMPLOYEES[0];
      return {
        employee: pemeriksa,
        requiredRole: 'pemeriksa',
        taskTitle: 'Verifikasi HPP & Audit Rasio Keuangan',
      };
    }

    if (
      status === 'Verified' ||
      status === 'Pending Approval - VP' ||
      status === 'Pending Approval - CEO' ||
      status.includes('Approval') ||
      status.includes('Verified')
    ) {
      const penyetuju = EMPLOYEES.find((e) => e.role === 'penyetuju') || EMPLOYEES[5] || EMPLOYEES[0];
      return {
        employee: penyetuju,
        requiredRole: 'penyetuju',
        taskTitle: 'Evaluasi Margin, Diskon & Kunci RAP v1.0',
      };
    }

    if (status === 'Approved & Locked' || status.includes('Approved') || status.includes('Locked')) {
      const exec = EMPLOYEES.find((e) => e.role === 'penyetuju') || EMPLOYEES[5] || EMPLOYEES[0];
      return {
        employee: exec,
        requiredRole: 'penyetuju',
        taskTitle: 'RAP locked, Eksekusi PO Vendor Aktif',
      };
    }

    // Default for Draft, Rejected, or any unknown status
    const konseptor = EMPLOYEES.find((e) => e.role === 'konseptor') || EMPLOYEES[0];
    return {
      employee: konseptor,
      requiredRole: 'konseptor',
      taskTitle: 'Penyusunan Proposal Penawaran & Rincian Modal HPP',
    };
  };

  const responsible = getResponsibleEmployee();
  const isMatchingUser = currentEmployee?.role === responsible.requiredRole;

  const steps = [
    {
      id: 'step-1',
      number: '1',
      title: 'Proposal & HPP',
      roleLabel: 'Level 1: Perancang',
      actor: 'Sales / Program Designer',
      icon: <Edit3 className="w-4 h-4" />,
    },
    {
      id: 'step-2',
      number: '2',
      title: 'Verifikasi Finance',
      roleLabel: 'Level 2: Pemeriksa',
      actor: 'Finance & Cost Control',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: 'step-3',
      number: '3',
      title: 'Persetujuan VP/CEO',
      roleLabel: 'Level 3: Penyetuju',
      actor: 'VP Commercial / Director',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'step-4',
      number: '4',
      title: 'Lock RAP & PO',
      roleLabel: 'Penerbitan PO',
      actor: 'Vendor & Procurement',
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        
        {/* Stepper Progress Visualizer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center space-x-2.5 ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : isCurrent
                    ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-tight truncate ${isCurrent ? 'text-teal-950 font-bold' : ''}`}>
                      {step.title}
                    </span>
                  </div>
                  <p className={`text-[10px] font-medium truncate ${isCurrent ? 'text-teal-700' : 'text-slate-500'}`}>
                    {step.actor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hand-Off Action Banner - ONLY rendered during Simulation Mode */}
        {isSimulationMode && (
          <div className="bg-slate-50 border border-slate-200/90 text-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            
            <div className="flex items-start sm:items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs ${currentEmployee.avatarBg || 'bg-teal-600 text-white'}`}>
                {currentEmployee.avatarText}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    {currentEmployee.name} ({currentEmployee.title})
                  </span>
                  <span className="text-[9.5px] px-2 py-0.5 rounded font-bold bg-teal-100 border border-teal-200 text-teal-800 uppercase">
                    Status: {project.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {project.status === 'Approved & Locked' ? (
                      <strong className="text-emerald-700">Proyek Disetujui & RAP v1.0 Dikunci! PO Vendor Siap Diterbitkan.</strong>
                    ) : (
                      <>
                        Tugas Berjenjang Saat Ini: <strong className="text-slate-900">{responsible.taskTitle}</strong> ({responsible.employee.name} - {responsible.employee.title})
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action or Switch Button */}
            <div className="flex items-center space-x-2 shrink-0">
              {project.status === 'Approved & Locked' ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>RAP v1.0 Locked</span>
                </span>
              ) : isMatchingUser ? (
                /* Logged in user matches current workflow step */
                <div className="flex items-center space-x-2">
                  {currentEmployee.role === 'konseptor' && (
                    <button
                      onClick={onSubmitForReview}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Kirim ke Finance (Siska Amanda)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {currentEmployee.role === 'pemeriksa' && (
                    <button
                      onClick={onVerifyByChecker}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verifikasi & Kirim ke VP (Hendra Wijaya)</span>
                    </button>
                  )}

                  {currentEmployee.role === 'penyetuju' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onApproveByExecutive('Disetujui oleh Executive & RAP v1.0 Dikunci')}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Setujui & Kunci RAP v1.0</span>
                      </button>
                      <button
                        onClick={() => onRejectProposal('Minta revisi penyesuaian scope')}
                        className="bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs px-3 py-2 rounded-lg border border-rose-200 transition cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged in user does NOT match needed role -> Offer quick switch button */
                <button
                  onClick={() => onSelectEmployee(responsible.employee)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  title={`Pindah login ke ${responsible.employee.name} untuk memproses langkah ini`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Switch Akun ke {responsible.employee.name}</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
