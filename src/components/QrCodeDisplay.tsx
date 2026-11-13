import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QrCodeDisplay({ value, size = 176, label }: QrCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#14241B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) {
          setDataUrl(url);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (failed || !dataUrl) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-[#DCE2DA] bg-white p-4 text-center"
        style={{ width: size, height: size }}
      >
        <span className="font-mono-tabular text-sm font-semibold text-[#1A241E]">{value}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center rounded-xl border border-[#DCE2DA] bg-white p-3">
      <img
        src={dataUrl}
        alt={label ? `QR code for ${label}` : `QR code ${value}`}
        width={size}
        height={size}
        className="block rounded-lg"
      />
    </div>
  );
}
