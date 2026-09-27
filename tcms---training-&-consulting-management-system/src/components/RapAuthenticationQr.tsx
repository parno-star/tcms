import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface RapAuthenticationQrProps {
  projectCode: string;
  rapVersion: string;
  size?: number;
  className?: string;
  showDetails?: boolean;
}

export const RapAuthenticationQr: React.FC<RapAuthenticationQrProps> = ({
  projectCode,
  rapVersion,
  size = 50,
  className = '',
  showDetails = false,
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');

  const targetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?rap=${encodeURIComponent(projectCode)}&version=${encodeURIComponent(rapVersion)}`
    : `https://tcms.staroffice.id/verify-rap?code=${encodeURIComponent(projectCode)}&version=${encodeURIComponent(rapVersion)}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toString(
      targetUrl,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, svgString) => {
        if (!err && svgString && isMounted) {
          setQrSvg(svgString);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  return (
    <div
      className={`inline-flex items-center justify-center p-1 bg-white border border-slate-300 rounded-lg shadow-2xs print:shadow-none shrink-0 ${className}`}
      title={`Otentikasi RAP Digital: ${projectCode} (${rapVersion})`}
    >
      {/* QR Code SVG */}
      {qrSvg ? (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
          className="w-full h-full text-slate-900"
        />
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="animate-pulse bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-500 font-mono"
        >
          QR
        </div>
      )}

      {showDetails && (
        <div className="flex flex-col text-left leading-tight shrink-0 ml-2">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
            <span className="text-[8.5px] font-black uppercase text-emerald-800 tracking-wider">
              OTENTIKASI DIGITAL
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-slate-900 font-mono">
            RAP-{projectCode}-{rapVersion}
          </span>
          <span className="text-[7.5px] text-slate-500 font-medium mt-0.5">
            Scan QR untuk verifikasi versi asli
          </span>
        </div>
      )}
    </div>
  );
};
