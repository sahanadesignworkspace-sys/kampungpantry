import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, ClipboardCheck, Minus, Plus, QrCode, X } from 'lucide-react';
import type { FoodItem, ResidentProfile } from '../types/pantry';
import { formatDaysUntilExpiry } from '../utils/i18n';

interface CollectModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: FoodItem[];
  initialItem: FoodItem | null;
  profile: ResidentProfile;
  onCollected: (message: string) => void;
}

export function CollectModal({
  isOpen,
  onClose,
  availableItems,
  initialItem,
  profile,
  onCollected,
}: CollectModalProps) {
  const [mode, setMode] = useState<'qr' | 'manual'>(initialItem ? 'manual' : 'qr');
  const [codeInput, setCodeInput] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [collectorName, setCollectorName] = useState(profile.name || '');
  const [collectorBlock, setCollectorBlock] = useState(profile.block || '');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setCameraError('');
      setQuantity(1);
      setCollectorName(profile.name || '');
      setCollectorBlock(profile.block || '');
      if (initialItem) {
        setSelectedId(initialItem.id);
        setCodeInput(initialItem.id);
        setMode('manual');
      } else {
        setSelectedId(availableItems[0]?.id || '');
        setCodeInput('');
        setMode('qr');
      }
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, initialItem, profile.name, profile.block]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  async function startCameraScan() {
    setCameraError('');
    setErrorMsg('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera scanning is unavailable on this browser. Please type or select the Item ID below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Use native BarcodeDetector if available (Chrome / Android / Edge)
      const Win = window as unknown as {
        BarcodeDetector?: new (opts: { formats: string[] }) => {
          detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
        };
      };
      if (Win.BarcodeDetector) {
        const detector = new Win.BarcodeDetector({ formats: ['qr_code'] });
        const poll = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              const scanned = codes[0].rawValue.replace(/^KAMPUNG-PANTRY:/i, '').trim();
              setCodeInput(scanned);
              const matched = availableItems.find(
                (i) => i.id.toUpperCase() === scanned.toUpperCase()
              );
              if (matched) setSelectedId(matched.id);
              stopCamera();
              return;
            }
          } catch {
            // Continue scanning frames quietly
          }
          if (streamRef.current) {
            requestAnimationFrame(poll);
          }
        };
        requestAnimationFrame(poll);
      }
    } catch {
      setCameraError('Camera permission was denied or unavailable. Enter the Item ID printed on the food container below.');
      setCameraActive(false);
    }
  }

  if (!isOpen) return null;

  const targetItem =
    mode === 'qr'
      ? availableItems.find(
          (i) =>
            i.id.toUpperCase() ===
            codeInput.replace(/^KAMPUNG-PANTRY:/i, '').trim().toUpperCase()
        ) || null
      : availableItems.find((i) => i.id === selectedId) || null;

  const maxQty = targetItem ? targetItem.remainingQty : 1;

  async function handleCollectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const codeOrId = mode === 'qr' ? codeInput.trim() : selectedId;
    if (!codeOrId) {
      setErrorMsg('Please scan a QR code or select a food item first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeOrId,
          quantity,
          residentName: collectorName.trim() || 'Neighbour',
          block: collectorBlock.trim() || 'Estate Resident',
          method: mode === 'qr' ? 'QR Scan' : 'Manual Entry',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not record collection.');
      } else {
        stopCamera();
        setSuccessMsg(data.message);
        onCollected(data.message);
      }
    } catch {
      setErrorMsg('Network error while updating inventory. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collect-modal-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl md:rounded-2xl bg-white border border-[#DCE2DA] max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 md:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#D1D8CE]" />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-[#EAECE7]">
          <div>
            <h2 id="collect-modal-title" className="text-xl font-bold text-[#1A241E]">
              Collect Food Item
            </h2>
            <p className="text-sm text-[#4B5B51]">
              Scan a QR label or choose manually — free for all residents.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close collection dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4B5B51] hover:bg-[#F2F5F1] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {successMsg ? (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#E7F3EB] text-[#1B5E3A] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1A241E]">Collection Confirmed</h3>
                <p className="text-base text-[#35443B]">{successMsg}</p>
                <p className="text-xs text-[#59695F]">
                  Remember to inspect food freshness visually and close the fridge door firmly.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] rounded-xl bg-[#1B5E3A] text-white text-base font-semibold hover:bg-[#154A2D] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleCollectSubmit} className="space-y-5">
              {/* Mode Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F2F5F1]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('qr');
                    setErrorMsg('');
                  }}
                  className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'qr'
                      ? 'bg-white text-[#1B5E3A] border border-[#DCE2DA]'
                      : 'text-[#4B5B51] hover:text-[#1A241E]'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Scan QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('manual');
                    stopCamera();
                    setErrorMsg('');
                  }}
                  className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'manual'
                      ? 'bg-white text-[#1B5E3A] border border-[#DCE2DA]'
                      : 'text-[#4B5B51] hover:text-[#1A241E]'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Manual Selection</span>
                </button>
              </div>

              {mode === 'qr' ? (
                <div className="space-y-4">
                  {cameraActive ? (
                    <div className="space-y-2">
                      <div className="relative overflow-hidden rounded-xl border border-[#DCE2DA] bg-black aspect-video">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="w-full min-h-[44px] rounded-xl border border-[#DCE2DA] text-sm font-semibold text-[#35443B] hover:bg-[#F5F7F4] cursor-pointer"
                      >
                        Stop Camera
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startCameraScan}
                      className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl border border-[#1B5E3A] bg-[#F2F7F3] text-[#1B5E3A] text-sm font-semibold hover:bg-[#E5EFE7] transition-colors cursor-pointer"
                    >
                      <Camera className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>Open Camera to Scan Label QR</span>
                    </button>
                  )}

                  {cameraError && (
                    <p className="text-xs text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-3.5 py-2.5">
                      {cameraError}
                    </p>
                  )}

                  <div>
                    <label
                      htmlFor="qr-code-input"
                      className="block text-sm font-semibold text-[#1A241E] mb-1.5"
                    >
                      Or type Donation ID printed under QR (e.g. KP-2026-0101)
                    </label>
                    <input
                      id="qr-code-input"
                      type="text"
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        setQuantity(1);
                      }}
                      placeholder="KP-2026-0101"
                      className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-white px-4 text-base font-mono-tabular text-[#1A241E] focus:border-[#1B5E3A] focus:outline-none"
                    />
                    {availableItems.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {availableItems.slice(0, 3).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCodeInput(item.id);
                              setQuantity(1);
                            }}
                            className="min-h-[36px] px-3 py-1 rounded-lg border border-[#DCE2DA] bg-[#F8FAF7] text-xs font-medium text-[#2F4136] hover:border-[#1B5E3A] cursor-pointer"
                          >
                            Try {item.id} ({item.name.split(' ')[0]})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="manual-item-select"
                    className="block text-sm font-semibold text-[#1A241E] mb-1.5"
                  >
                    Select Item from Community Fridge (No QR Needed)
                  </label>
                  <select
                    id="manual-item-select"
                    value={selectedId}
                    onChange={(e) => {
                      setSelectedId(e.target.value);
                      setQuantity(1);
                    }}
                    className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-white px-3.5 text-base text-[#1A241E] focus:border-[#1B5E3A] focus:outline-none"
                  >
                    {availableItems.length === 0 && (
                      <option value="">No items currently available</option>
                    )}
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.remainingQty} {item.unit} left ({item.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetItem && (
                <div className="rounded-xl border border-[#DCE2DA] bg-[#F7FAF7] p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-[#1A241E]">{targetItem.name}</div>
                    <span className="font-mono-tabular text-xs text-[#4B5B51] shrink-0">
                      {targetItem.id}
                    </span>
                  </div>
                  <div className="text-sm text-[#4B5B51]">
                    {targetItem.storageZone} · {targetItem.remainingQty} {targetItem.unit} left ·{' '}
                    {formatDaysUntilExpiry(targetItem.expiryDate).label}
                  </div>
                  {targetItem.allergens && targetItem.allergens !== 'None declared' && (
                    <div className="text-xs font-medium text-[#92400E]">
                      Allergen note: {targetItem.allergens}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2E6DF] p-3.5">
                <div>
                  <div className="text-sm font-semibold text-[#1A241E]">Quantity to Take</div>
                  <div className="text-xs text-[#59695F]">
                    {targetItem ? `Max ${maxQty} ${targetItem.unit}` : 'Select item first'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#CFD7CC] bg-white text-[#1A241E] hover:bg-[#F2F5F1] cursor-pointer"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-8 text-center text-lg font-bold font-mono-tabular text-[#1A241E]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    aria-label="Increase quantity"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#CFD7CC] bg-white text-[#1A241E] hover:bg-[#F2F5F1] cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Optional First Name / Block */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="collector-name" className="block text-xs font-medium text-[#4B5B51] mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    id="collector-name"
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="e.g. Uncle Tan"
                    className="w-full min-h-[44px] rounded-xl border border-[#CFD7CC] px-3 text-sm text-[#1A241E]"
                  />
                </div>
                <div>
                  <label htmlFor="collector-block" className="block text-xs font-medium text-[#4B5B51] mb-1">
                    HDB Block (optional)
                  </label>
                  <input
                    id="collector-block"
                    type="text"
                    value={collectorBlock}
                    onChange={(e) => setCollectorBlock(e.target.value)}
                    placeholder="e.g. Blk 412"
                    className="w-full min-h-[44px] rounded-xl border border-[#CFD7CC] px-3 text-sm text-[#1A241E]"
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#991B1B]"
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || availableItems.length === 0}
                className="w-full min-h-[48px] rounded-xl bg-[#1B5E3A] text-white text-base font-semibold hover:bg-[#154A2D] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Updating Fridge Inventory...' : 'Confirm Collection'}
              </button>

              <p className="text-xs text-center text-[#59695F]">
                Food safety note: QR tracking records stock only. Please visually check produce before consuming.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
