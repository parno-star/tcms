import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Building2,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
  Crown,
  ChevronDown,
  UserPlus,
  Briefcase,
  Layers,
  Shield,
  Phone,
  Hash,
  Award,
  Clock,
  Check,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Employee, UserRole, Organization } from '../types';

interface PresetAccount {
  id: string;
  email: string;
  name: string;
  role: string;
}

const DEFAULT_PRESET_ACCOUNTS: PresetAccount[] = [
  {
    id: 'cipkai',
    email: 'cipkai2017@gmail.com',
    name: 'CIP 2017',
    role: 'Super Admin',
  },
  {
    id: 'fajar',
    email: 'fajar.admin@staroffice.id',
    name: 'Fajar Pratama',
    role: 'Administrator',
  },
  {
    id: 'budi',
    email: 'budi.raharjo@ciptaperdana.co.id',
    name: 'Budi',
    role: 'Konseptor / Sales',
  },
  {
    id: 'siti',
    email: 'siti.aminah@ciptaperdana.co.id',
    name: 'Siti',
    role: 'Pemeriksa / Finance',
  },
  {
    id: 'hendra',
    email: 'hendra.wijaya@ciptaperdana.co.id',
    name: 'Hendra',
    role: 'VP / Penyetuju',
  },
];

interface AuthSignInViewProps {
  onLoginSuccess: (employee: Employee, role: UserRole) => void;
  employees: Employee[];
  activeOrganization: Organization;
  organizations?: Organization[];
  onRegisterUser?: (newEmployee: Employee) => void;
  onBackToApp?: () => void;
}

export const AuthSignInView: React.FC<AuthSignInViewProps> = ({
  onLoginSuccess,
  employees,
  activeOrganization,
  organizations = [],
  onRegisterUser,
  onBackToApp,
}) => {
  // Step state: 'email' | 'otp' | 'register' | 'registered_success'
  const [step, setStep] = useState<'email' | 'otp' | 'register' | 'registered_success'>('email');
  
  // Selected email state - Default to Super Admin email matching screenshot
  const [email, setEmail] = useState<string>('cipkai2017@gmail.com');
  const [rememberEmail, setRememberEmail] = useState<boolean>(true);
  const [customEmailMode, setCustomEmailMode] = useState<boolean>(false);

  // Preset accounts state with local storage persistence
  const [presetAccounts, setPresetAccounts] = useState<PresetAccount[]>(() => {
    try {
      const saved = localStorage.getItem('tcms_login_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((acc: PresetAccount) => {
            if (acc.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com' && (acc.role === 'Super Admin' || acc.role === 'super_admin')) {
              return { ...acc, role: 'Administrator' };
            }
            return acc;
          });
        }
      }
    } catch {
      // fallback to defaults
    }
    return DEFAULT_PRESET_ACCOUNTS;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presetAccounts.filter((acc) => acc.id !== id);
    setPresetAccounts(updated);
    try {
      localStorage.setItem('tcms_login_presets', JSON.stringify(updated));
    } catch {
      // ignore
    }

    const deletedAcc = presetAccounts.find((acc) => acc.id === id);
    if (deletedAcc && email === deletedAcc.email) {
      if (updated.length > 0) {
        setEmail(updated[0].email);
      } else {
        setCustomEmailMode(true);
        setEmail('');
      }
    }
  };

  const handleResetPresets = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPresetAccounts(DEFAULT_PRESET_ACCOUNTS);
    try {
      localStorage.setItem('tcms_login_presets', JSON.stringify(DEFAULT_PRESET_ACCOUNTS));
    } catch {
      // ignore
    }
    if (DEFAULT_PRESET_ACCOUNTS.length > 0) {
      setEmail(DEFAULT_PRESET_ACCOUNTS[0].email);
    }
  };

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('809335');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(58);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration Form State - Simplified to exact 7 requested fields:
  // 1. Nama, 2. No. Telp, 3. email, 4. Nama perusahaan, 5. No telpon Perusahaan, 6. Alamat Perusahaan, 7. email perusahaan
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regCompanyName, setRegCompanyName] = useState<string>('');
  const [regCompanyPhone, setRegCompanyPhone] = useState<string>('');
  const [regCompanyAddress, setRegCompanyAddress] = useState<string>('');
  const [regCompanyEmail, setRegCompanyEmail] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessEmp, setRegSuccessEmp] = useState<Employee | null>(null);

  // Refs for 6-box input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate 6 digit OTP when entering OTP step
  const generateNewOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(59);
    setErrorMessage(null);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Handle submit email -> go to OTP step
  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }
    setErrorMessage(null);

    // Automatically save the email to the device's presets
    const targetEmail = email.trim().toLowerCase();
    const alreadySaved = presetAccounts.some((acc) => acc.email.toLowerCase() === targetEmail);
    if (!alreadySaved) {
      const matched = employees.find((emp) => emp.email?.toLowerCase() === targetEmail);
      const name = matched ? matched.name : targetEmail.split('@')[0].toUpperCase();
      let roleLabel = 'Pengguna';
      if (targetEmail === 'cipkai2017@gmail.com') {
        roleLabel = 'Super Admin';
      } else if (matched) {
        roleLabel = matched.role === 'administrator' ? 'Administrator' : 'Pengguna';
      }
      
      const newPreset: PresetAccount = {
        id: `custom-${Date.now()}`,
        email: targetEmail,
        name: name,
        role: roleLabel,
      };

      const updated = [...presetAccounts, newPreset];
      setPresetAccounts(updated);
      try {
        localStorage.setItem('tcms_login_presets', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    generateNewOtp();
    setStep('otp');
  };

  // Auto fill OTP from Dev Mode helper
  const handleAutoFillOtp = () => {
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setErrorMessage(null);
    if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
  };

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...otpDigits];
    
    // If pasted multiple digits
    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedDigits[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto advance focus to next box
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyOtp();
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Mohon masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setErrorMessage('Kode OTP tidak sesuai. Silakan periksa kembali simulasi kode OTP.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find matching employee or default to Super Admin if cipkal2017
      const targetEmail = email.trim().toLowerCase();
      let matchedEmp = employees.find(
        (emp) => emp.email?.toLowerCase() === targetEmail
      );

      // Special case: Only CIP 2017 is Super Admin
      if (targetEmail === 'cipkai2017@gmail.com') {
        matchedEmp = employees.find((e) => e.email?.toLowerCase().trim() === 'cipkai2017@gmail.com') || employees[0];
      }

      // If still not matched, construct a safe fallback profile
      if (!matchedEmp) {
        matchedEmp = {
          id: `emp-usr-${Date.now()}`,
          id_organization: activeOrganization.id_organization,
          nik: `NIK-${new Date().getFullYear()}-888`,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          title: 'Pengguna Terdaftar',
          department: 'Operasional Pelatihan',
          level: 'Staff / Specialist',
          role: 'pengguna',
          avatarBg: 'bg-teal-600 text-white',
          avatarText: email.substring(0, 2).toUpperCase(),
          email: email.trim(),
          phone: '+62 812-0000-8888',
          status: 'Aktif / Online',
          companyName: activeOrganization.name,
          institution: activeOrganization.name,
          institutionOrCompany: activeOrganization.name,
          description: 'Pengguna terverifikasi melalui autentikasi OTP.',
          createdDate: new Date().toISOString().split('T')[0],
        };
      }

      let assignedRole: UserRole = matchedEmp.role || 'pengguna';
      if (matchedEmp.email?.toLowerCase().trim() === 'cipkai2017@gmail.com') {
        assignedRole = 'super_admin';
        matchedEmp = { ...matchedEmp, role: 'super_admin', level: 'Super Admin' };
      } else if (assignedRole === 'super_admin') {
        // Enforce: ONLY cipkai2017@gmail.com can be Super Admin
        assignedRole = 'administrator';
        matchedEmp = { ...matchedEmp, role: 'administrator', level: matchedEmp.level === 'Super Admin' ? 'Administrator' : matchedEmp.level };
      }

      setSuccessMessage(`Berhasil diverifikasi! Masuk sebagai ${matchedEmp.name} (${assignedRole.toUpperCase()})`);
      
      setTimeout(() => {
        setIsVerifying(false);
        onLoginSuccess(matchedEmp!, assignedRole);
      }, 500);
    }, 400);
  };

  // Google SSO Simulation (Instant login)
  const handleGoogleSso = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const targetEmail = email.trim().toLowerCase();
      
      // Automatically save the email to the device's presets
      if (targetEmail && targetEmail.includes('@')) {
        const alreadySaved = presetAccounts.some((acc) => acc.email.toLowerCase() === targetEmail);
        if (!alreadySaved) {
          const matched = employees.find((emp) => emp.email?.toLowerCase() === targetEmail);
          const name = matched ? matched.name : targetEmail.split('@')[0].toUpperCase();
          let roleLabel = 'Pengguna';
          if (targetEmail === 'cipkai2017@gmail.com') {
            roleLabel = 'Super Admin';
          } else if (matched) {
            roleLabel = matched.role === 'administrator' ? 'Administrator' : 'Pengguna';
          }
          
          const newPreset: PresetAccount = {
            id: `custom-${Date.now()}`,
            email: targetEmail,
            name: name,
            role: roleLabel,
          };

          const updated = [...presetAccounts, newPreset];
          setPresetAccounts(updated);
          try {
            localStorage.setItem('tcms_login_presets', JSON.stringify(updated));
          } catch {
            // ignore
          }
        }
      }

      let matchedEmp = employees.find(
        (emp) => emp.email?.toLowerCase().trim() === targetEmail
      );
      if (!matchedEmp) {
        if (targetEmail === 'cipkai2017@gmail.com') {
          matchedEmp = employees.find((e) => e.email?.toLowerCase().trim() === 'cipkai2017@gmail.com') || employees[0];
        } else {
          matchedEmp = employees.find((e) => e.email?.toLowerCase().trim() !== 'cipkai2017@gmail.com') || employees[1] || employees[0];
        }
      }
      let finalRole: UserRole = targetEmail === 'cipkai2017@gmail.com' ? 'super_admin' : (matchedEmp.role === 'super_admin' ? 'administrator' : (matchedEmp.role || 'pengguna'));
      if (finalRole === 'super_admin' && targetEmail !== 'cipkai2017@gmail.com') {
        finalRole = 'administrator';
      }
      onLoginSuccess(matchedEmp, finalRole);
    }, 600);
  };

  // Handle Registration Submit - Simplified to exactly 7 requested fields:
  // 1. Nama, 2. No. Telp, 3. email, 4. Nama perusahaan, 5. No telpon Perusahaan, 6. Alamat Perusahaan, 7. email perusahaan
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Nama wajib diisi.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('No. Telp wajib diisi.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Email pendaftar tidak valid.');
      return;
    }
    if (!regCompanyName.trim()) {
      setRegError('Nama perusahaan wajib diisi.');
      return;
    }
    if (!regCompanyPhone.trim()) {
      setRegError('No telpon Perusahaan wajib diisi.');
      return;
    }
    if (!regCompanyAddress.trim()) {
      setRegError('Alamat Perusahaan wajib diisi.');
      return;
    }
    if (!regCompanyEmail.trim() || !regCompanyEmail.includes('@')) {
      setRegError('Email perusahaan tidak valid.');
      return;
    }

    // Avatar initials
    const nameParts = regName.trim().split(' ');
    const initials = nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : regName.substring(0, 2).toUpperCase();

    const newRegisteredEmployee: Employee = {
      id: `emp-reg-${Date.now()}`,
      id_organization: activeOrganization.id_organization,
      nik: `NIK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim().toLowerCase(),
      companyName: regCompanyName.trim(),
      institution: regCompanyName.trim(),
      institutionOrCompany: regCompanyName.trim(),
      companyPhone: regCompanyPhone.trim(),
      companyAddress: regCompanyAddress.trim(),
      companyEmail: regCompanyEmail.trim().toLowerCase(),
      department: 'Operasional',
      title: 'Pendaftar Akun Perusahaan',
      level: 'Staff / Specialist',
      role: 'pengguna',
      status: 'Menunggu Persetujuan',
      registrationStatus: 'Menunggu Persetujuan',
      signupSource: 'Form Pendaftaran Web',
      registeredAt: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      avatarBg: 'bg-teal-600 text-white',
      avatarText: initials,
      description: `Perusahaan: ${regCompanyName.trim()} | Telp: ${regCompanyPhone.trim()} | Alamat: ${regCompanyAddress.trim()}`,
    };

    if (onRegisterUser) {
      onRegisterUser(newRegisteredEmployee);
    }

    setRegSuccessEmp(newRegisteredEmployee);
    setStep('registered_success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col justify-between items-center py-8 px-4 font-sans select-none">
      
      {/* Top Header / Branding */}
      <div className="w-full max-w-2xl mx-auto text-center pt-2 pb-4">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-500/20">
            TC
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">STAR TCMS</span>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200">
                Enterprise
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium leading-none">
              TRAINING &amp; CONSULTING MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {step === 'register' ? 'Pendaftaran Akun Lembaga Baru' : step === 'registered_success' ? 'Pendaftaran Berhasil Dikirim' : 'Selamat Datang Kembali'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {step === 'register'
            ? 'Lengkapi data profil instansi Anda untuk mendapatkan akses ke ekosistem STAR TCMS'
            : step === 'registered_success'
            ? 'Data pendaftaran Anda telah tercatat dan masuk ke antrean verifikasi'
            : 'Satu pintu untuk seluruh ekosistem TCMS & Star e-Office Anda'}
        </p>
      </div>

      {/* Main Authentication / Registration Card */}
      <div className={`w-full ${step === 'register' ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden relative transition-all duration-300`}>
        
        {/* Step 1: Email Form (Sign In) */}
        {step === 'email' && (
          <div className="p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold text-slate-900">
                Masuk ke Akun
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan email Anda untuk masuk dengan Kode OTP
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Alamat Email</span>
                  </label>
                </div>

                {/* Email Input / Quick Preset Selector */}
                <div className="relative" ref={dropdownRef}>
                  {!customEmailMode ? (
                    <div>
                      {/* Trigger Box */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-2.5 transition text-left focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                      >
                        <div className="flex items-center min-w-0 mr-2">
                          <UserCheck className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {(() => {
                              const found = presetAccounts.find((a) => a.email === email);
                              if (found) {
                                return `${found.email} (${found.name} - ${found.role})`;
                              }
                              return email || 'Pilih akun untuk masuk...';
                            })()}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-teal-600' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100">
                          {/* Header */}
                          <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Akun Utama TCMS (Pilihan Instan)
                            </span>
                            {presetAccounts.length < DEFAULT_PRESET_ACCOUNTS.length && (
                              <button
                                type="button"
                                onClick={handleResetPresets}
                                className="text-[10px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                title="Pulihkan semua akun bawaan"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Pulihkan</span>
                              </button>
                            )}
                          </div>

                          {/* List of preset accounts */}
                          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 py-1">
                            {presetAccounts.length === 0 ? (
                              <div className="p-4 text-center">
                                <p className="text-xs text-slate-400">Semua akun bawaan telah dihapus.</p>
                                <button
                                  type="button"
                                  onClick={handleResetPresets}
                                  className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Pulihkan Akun Bawaan</span>
                                </button>
                              </div>
                            ) : (
                              presetAccounts.map((acc) => {
                                const isSelected = email === acc.email;
                                return (
                                  <div
                                    key={acc.id}
                                    onClick={() => {
                                      setEmail(acc.email);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`group flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition ${
                                      isSelected
                                        ? 'bg-teal-50/80 text-teal-900 font-semibold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                                      <div className="shrink-0">
                                        {isSelected ? (
                                          <Check className="w-3.5 h-3.5 text-teal-600" />
                                        ) : (
                                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 group-hover:border-slate-400" />
                                        )}
                                      </div>
                                      <div className="truncate">
                                        <div className="font-semibold text-slate-800 truncate leading-snug">
                                          {acc.email}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                          ({acc.name} - {acc.role})
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tombol Hapus Baris */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeletePreset(acc.id, e)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 ml-1 cursor-pointer group/btn"
                                      title={`Hapus ${acc.email} dari daftar`}
                                      aria-label={`Hapus ${acc.email}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Option to input custom email */}
                          <div className="p-1.5 bg-slate-50/50">
                            <button
                              type="button"
                              onClick={() => {
                                setCustomEmailMode(true);
                                setEmail('');
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg flex items-center space-x-2 transition cursor-pointer"
                            >
                              <span>✏️</span>
                              <span>Masukkan Email Kustom Lainnya...</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition">
                        <UserCheck className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh: user@perusahaan.com"
                          className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden placeholder-slate-400"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomEmailMode(false);
                          if (presetAccounts.length > 0) {
                            setEmail(presetAccounts[0].email);
                          }
                        }}
                        className="text-[10px] text-teal-600 hover:text-teal-800 font-semibold mt-1 inline-block cursor-pointer"
                      >
                        ← Kembali ke daftar akun tersimpan
                      </button>
                    </div>
                  )}
                </div>


              </div>

              {/* Clear Text button in custom mode */}
              {customEmailMode && email && (
                <div className="flex justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    Hapus Teks
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Masuk dengan Kode OTP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
                  ATAU
                </span>
              </div>

              {/* Google SSO Simulated Button */}
              <button
                type="button"
                onClick={handleGoogleSso}
                disabled={isVerifying}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              {/* Registration Link */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Belum punya akun lembaga? </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('register');
                    setRegError(null);
                  }}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline cursor-pointer inline-block"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'otp' && (
          <div className="p-6 sm:p-8 animate-fade-in">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Verifikasi Kode OTP
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan 6 digit kode yang dikirim ke <span className="font-semibold text-slate-700">{email}</span>
              </p>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMessage(null);
                }}
                className="mt-1.5 inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ubah Email</span>
              </button>
            </div>

            {/* Simulasi Pengiriman Email (Dev Mode) Box */}
            <div className="mb-5 p-3.5 bg-sky-50/90 border border-sky-200 rounded-xl text-left">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-900">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Simulasi Pengiriman Email (Dev Mode):</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Kode OTP Anda adalah: </span>
                  <span className="font-mono font-black text-sm text-sky-700 tracking-wider">
                    {generatedOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 bg-white hover:bg-sky-100/70 border border-sky-300 rounded-md text-[11px] font-bold text-sky-800 shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>👉 Klik untuk isi otomatis</span>
                </button>
              </div>
            </div>

            {/* 6 Digit OTP Inputs */}
            <div className="mb-4">
              <label className="block text-center text-xs font-bold text-slate-700 mb-2.5">
                Masukkan 6 Digit Kode OTP
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-mono font-bold bg-white border-2 border-slate-200 rounded-xl focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition shadow-2xs"
                  />
                ))}
              </div>

              <div className="text-center mt-2 text-[11px] text-slate-400">
                Kode verifikasi berlaku selama 10 menit.
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium text-center">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'Memverifikasi...' : 'Verifikasi & Masuk ke Sistem'}</span>
            </button>

            {/* Resend Countdown Timer */}
            <div className="text-center mt-4">
              {countdown > 0 ? (
                <span className="text-xs text-slate-400">
                  Kirim ulang kode dalam <span className="font-semibold text-slate-700">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={generateNewOtp}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kirim Ulang Kode OTP Sekarang</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* Step 3: Registration Form (Sederhana: 7 Data yang Dibutuhkan) */}
        {step === 'register' && (
          <div className="p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Form Pendaftaran
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Lengkapi data diri dan profil perusahaan Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setRegError(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            </div>

            {regError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
              {/* Field 1: Nama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>

              {/* Field 2 & 3: No. Telp & email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="cth. 081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="cth. nama@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>
              </div>

              {/* Field 4: Nama perusahaan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  placeholder="Masukkan nama perusahaan / instansi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>

              {/* Field 5 & 7: No telpon Perusahaan & email perusahaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No telpon Perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regCompanyPhone}
                    onChange={(e) => setRegCompanyPhone(e.target.value)}
                    placeholder="cth. (021) 7890123 / 0811..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    email perusahaan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regCompanyEmail}
                    onChange={(e) => setRegCompanyEmail(e.target.value)}
                    placeholder="cth. info@perusahaan.co.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>
              </div>

              {/* Field 6: Alamat Perusahaan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Perusahaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={regCompanyAddress}
                  onChange={(e) => setRegCompanyAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap kantor / perusahaan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Registered Success Banner & Instant OTP Login */}
        {step === 'registered_success' && regSuccessEmp && (
          <div className="p-6 sm:p-8 animate-fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 mb-1">
              Pendaftaran Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Data pendaftaran akun Anda telah tersimpan dan siap diproses di sistem.
            </p>

            {/* User Data Summary Card (Displaying 7 fields) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Status Akun:</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>Menunggu Persetujuan</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div>
                  <div className="text-slate-400">1. Nama:</div>
                  <div className="font-bold text-slate-900 mt-0.5">{regSuccessEmp.name}</div>
                </div>
                <div>
                  <div className="text-slate-400">2. No. Telp:</div>
                  <div className="font-semibold text-slate-800 mt-0.5 font-mono">{regSuccessEmp.phone}</div>
                </div>
                <div>
                  <div className="text-slate-400">3. Email:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{regSuccessEmp.email}</div>
                </div>
                <div>
                  <div className="text-slate-400">4. Nama Perusahaan:</div>
                  <div className="font-bold text-teal-800 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>{regSuccessEmp.companyName}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">5. No Telpon Perusahaan:</div>
                  <div className="font-semibold text-slate-800 mt-0.5 font-mono">{regSuccessEmp.companyPhone}</div>
                </div>
                <div>
                  <div className="text-slate-400">6. Email Perusahaan:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{regSuccessEmp.companyEmail}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-400">7. Alamat Perusahaan:</div>
                  <div className="text-slate-700 mt-0.5">{regSuccessEmp.companyAddress}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setEmail(regSuccessEmp.email);
                  setCustomEmailMode(true);
                  generateNewOtp();
                  setStep('otp');
                }}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>👉 Coba Masuk dengan Akun Ini (Simulasi OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                }}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                ← Kembali ke Halaman Masuk
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Option to Return to Dashboard or Quick Demo */}
      {onBackToApp && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToApp}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center space-x-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda TCMS (Mode Demo)</span>
          </button>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-[11px] text-slate-400 text-center mt-6">
        © 2026 STAR TCMS - Platform Manajemen Pelatihan &amp; Tata Kelola Biaya Terpadu
      </div>

    </div>
  );
};

