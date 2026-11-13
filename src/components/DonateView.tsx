import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Minus,
  Plus,
  Printer,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  APPROVED_CATEGORIES,
  STORAGE_ZONES,
  type ApprovedCategory,
  type FoodItem,
  type ResidentProfile,
  type StorageZone,
} from '../types/pantry';
import { compressImageFile } from '../utils/imageAssets';
import { QrCodeDisplay } from './QrCodeDisplay';

interface DonateViewProps {
  profile: ResidentProfile;
  onDonated: (item: FoodItem, pointsEarned: number) => void;
  onGoToFind: () => void;
}

interface PresetItem {
  label: string;
  name: string;
  category: ApprovedCategory;
  unit: string;
  zone: StorageZone;
  daysValid: number;
  allergens: string;
  instructions: string;
}

const QUICK_PRESETS: PresetItem[] = [
  {
    label: 'Leafy Greens',
    name: 'Fresh Choy Sum',
    category: 'Vegetables',
    unit: 'bunches',
    zone: 'Crisper Drawer',
    daysValid: 2,
    allergens: 'None declared',
    instructions: 'Place in breathable bag inside Crisper Drawer.',
  },
  {
    label: 'Bananas / Fruit',
    name: 'Fresh Bananas',
    category: 'Fruits',
    unit: 'bunches',
    zone: 'Chiller Fridge (2°C–4°C)',
    daysValid: 3,
    allergens: 'None declared',
    instructions: 'Place on upper fruit tray inside fridge.',
  },
  {
    label: 'Rice / Noodles',
    name: 'Unopened Jasmine Rice',
    category: 'Dried Goods',
    unit: 'packs',
    zone: 'Dry Pantry Shelf',
    daysValid: 90,
    allergens: 'None declared',
    instructions: 'Place sealed packet on dry pantry shelf.',
  },
  {
    label: 'Bread Loaf',
    name: 'Wholemeal Bread Loaf',
    category: 'Bakery & Bread',
    unit: 'loaves',
    zone: 'Dry Pantry Shelf',
    daysValid: 2,
    allergens: 'Contains Wheat / Gluten',
    instructions: 'Keep bag clip sealed tightly on bread shelf.',
  },
  {
    label: 'Eggs (Halal)',
    name: 'Fresh Kampung Eggs',
    category: 'Dairy & Eggs',
    unit: 'half-trays',
    zone: 'Chiller Fridge (2°C–4°C)',
    daysValid: 7,
    allergens: 'Contains Egg',
    instructions: 'Place safely on middle chiller shelf.',
  },
];

function datePlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function DonateView({ profile, onDonated, onGoToFind }: DonateViewProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApprovedCategory>('Vegetables');
  const [quantity, setQuantity] = useState(2);
  const [unit, setUnit] = useState('packs');
  const [expiryDate, setExpiryDate] = useState(datePlusDays(2));
  const [storageZone, setStorageZone] = useState<StorageZone>('Crisper Drawer');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [allergens, setAllergens] = useState('None declared');
  const [donorName, setDonorName] = useState(profile.name || '');
  const [donorBlock, setDonorBlock] = useState(profile.block || '');
  const [photoPreview, setPhotoPreview] = useState('');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdItem, setCreatedItem] = useState<FoodItem | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  function applyPreset(preset: PresetItem) {
    setName(preset.name);
    setCategory(preset.category);
    setUnit(preset.unit);
    setStorageZone(preset.zone);
    setExpiryDate(datePlusDays(preset.daysValid));
    setAllergens(preset.allergens);
    setStorageInstructions(preset.instructions);
    setErrorMsg('');
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setPhotoPreview(compressed);
      setErrorMsg('');
    } catch {
      setErrorMsg('Could not process that photo. Please try a JPG or PNG image.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter or tap a food name.');
      return;
    }
    if (!safetyConfirmed) {
      setErrorMsg('Please confirm the food safety and Halal-friendly guidelines before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          quantity,
          unit: unit.trim() || 'packs',
          expiryDate,
          storageZone,
          storageInstructions: storageInstructions.trim(),
          allergens: allergens.trim() || 'None declared',
          donorName: donorName.trim() || 'Kind Neighbour',
          donorBlock: donorBlock.trim() || 'HDB Estate',
          imageUrl: photoPreview,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Unable to register donation.');
      } else {
        setCreatedItem(data.item);
        setPointsAwarded(data.pointsEarned || 15);
        onDonated(data.item, data.pointsEarned || 15);
      }
    } catch {
      setErrorMsg('Network error while saving donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setCreatedItem(null);
    setName('');
    setQuantity(2);
    setPhotoPreview('');
    setStorageInstructions('');
    setSafetyConfirmed(false);
    setErrorMsg('');
  }

  if (createdItem) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-[#DCE2DA] bg-white p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F3EB] text-[#1B5E3A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#14241B]">
              Thank You! Donation Registered
            </h1>
            <p className="text-sm text-[#4B5B51]">
              Your listing is live for neighbours (+{pointsAwarded} Community Appreciation Points).
            </p>
          </div>
        </div>

        {/* Scannable QR Label Card */}
        <div className="rounded-2xl border border-[#DCE2DA] bg-[#FBFBF8] p-6 flex flex-col sm:flex-row items-center gap-6">
          <QrCodeDisplay value={createdItem.qrPayload} size={160} label={createdItem.name} />
          <div className="space-y-2 text-center sm:text-left">
            <div className="text-xs font-semibold text-[#4B5B51]">
              Donation Label ID
            </div>
            <div className="text-2xl font-bold font-mono-tabular text-[#14241B]">
              {createdItem.id}
            </div>
            <div className="text-base font-semibold text-[#1B5E3A]">
              {createdItem.name} ({createdItem.quantity} {createdItem.unit})
            </div>
            <div className="text-sm text-[#35443B] tabular-nums">
              Use By: <strong>{createdItem.expiryDate}</strong> · {createdItem.storageZone}
            </div>
            <div className="text-xs text-[#59695F]">
              Allergens: {createdItem.allergens}
            </div>
          </div>
        </div>

        {/* Clear Visual 3-Step Placement Instructions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#14241B]">
            How to Place Food in the Community Fridge
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E2E6DF] bg-[#F7FAF7] p-4 space-y-1">
              <div className="text-xs font-bold text-[#1B5E3A]">Step 1</div>
              <div className="font-semibold text-sm text-[#14241B]">Write ID on Sticker</div>
              <p className="text-xs text-[#4B5B51]">
                Write <strong className="font-mono-tabular">{createdItem.id}</strong> and use-by date{' '}
                <strong>{createdItem.expiryDate}</strong> on a masking tape label at the fridge.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E6DF] bg-[#F7FAF7] p-4 space-y-1">
              <div className="text-xs font-bold text-[#1B5E3A]">Step 2</div>
              <div className="font-semibold text-sm text-[#14241B]">Place in Right Zone</div>
              <p className="text-xs text-[#4B5B51]">
                Put item neatly inside <strong>{createdItem.storageZone}</strong> so neighbours spot it easily.
              </p>
            </div>
            <div className="rounded-xl border border-[#E2E6DF] bg-[#F7FAF7] p-4 space-y-1">
              <div className="text-xs font-bold text-[#1B5E3A]">Step 3</div>
              <div className="font-semibold text-sm text-[#14241B]">Close Door Firmly</div>
              <p className="text-xs text-[#4B5B51]">
                Keep chiller temperature safe (2°C–4°C). Volunteers will inspect on their next round.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#CFD7CC] px-5 text-sm font-semibold text-[#1A241E] hover:bg-[#F4F6F3] cursor-pointer"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print Label</span>
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="min-h-[48px] flex-1 rounded-xl border border-[#1B5E3A] bg-[#F2F7F3] px-5 text-sm font-semibold text-[#1B5E3A] hover:bg-[#E4EFE6] cursor-pointer"
          >
            Donate Another Item
          </button>
          <button
            type="button"
            onClick={onGoToFind}
            className="min-h-[48px] flex-1 rounded-xl bg-[#1B5E3A] px-5 text-sm font-semibold text-white hover:bg-[#154A2D] cursor-pointer"
          >
            View Live Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#14241B]">
          Donate Surplus Food
        </h1>
        <p className="mt-1 text-base text-[#4B5B51]">
          Tap a quick item below or fill in the simple steps. Every single bundle helps a neighbour.
        </p>
      </div>

      {/* Food Safety Rules Banner (NO thick border-l-4; crisp bordered surface) */}
      <div className="rounded-2xl border border-[#E6D5B8] bg-[#FFFBEB] p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-6 h-6 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-sm text-[#452708]">
          <div className="font-bold">Community Fridge Food Safety &amp; Halal-Friendly Rules</div>
          <p>
            Accepted: fresh vegetables, whole fruits, unopened dry goods, sealed bread, and intact eggs.
            <strong> Strictly NO pork, raw meat/seafood, alcohol, or unlabelled home-cooked leftovers.</strong>
          </p>
        </div>
      </div>

      {/* Quick 1-Tap Presets for Minimal Typing */}
      <div className="rounded-2xl border border-[#E2E6DF] bg-white p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#14241B]">
          <Sparkles className="w-4 h-4 text-[#1B5E3A]" aria-hidden="true" />
          <span>Quick Fill (Tap to Pre-fill Common Items)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#CFD7CC] bg-[#FBFBF8] text-sm font-semibold text-[#1A241E] hover:border-[#1B5E3A] hover:bg-[#F2F7F3] transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Donation Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="donate-name" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Food Name *
            </label>
            <input
              id="donate-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Choy Sum, Papaya, Unopened Rice"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E] focus:border-[#1B5E3A] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="donate-category" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Approved Category *
            </label>
            <select
              id="donate-category"
              value={category}
              onChange={(e) => {
                const cat = e.target.value as ApprovedCategory;
                setCategory(cat);
                if (cat === 'Dried Goods' || cat === 'Bakery & Bread' || cat === 'Condiments & Spices') {
                  setStorageZone('Dry Pantry Shelf');
                } else if (cat === 'Vegetables') {
                  setStorageZone('Crisper Drawer');
                } else {
                  setStorageZone('Chiller Fridge (2°C–4°C)');
                }
              }}
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-white px-3.5 text-base text-[#1A241E]"
            >
              {APPROVED_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="donate-zone" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Storage Location *
            </label>
            <select
              id="donate-zone"
              value={storageZone}
              onChange={(e) => setStorageZone(e.target.value as StorageZone)}
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-white px-3.5 text-base text-[#1A241E]"
            >
              {STORAGE_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#E2E6DF] p-3.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#14241B]">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease donation quantity"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#CFD7CC] hover:bg-[#F2F5F1] cursor-pointer"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-8 text-center text-lg font-bold font-mono-tabular">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                aria-label="Increase donation quantity"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#CFD7CC] hover:bg-[#F2F5F1] cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="donate-unit" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Unit (e.g. bunches, packs, loaves)
            </label>
            <input
              id="donate-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E]"
            />
          </div>
        </div>

        {/* Expiry Date + Quick Buttons */}
        <div className="space-y-2">
          <label htmlFor="donate-expiry" className="block text-sm font-semibold text-[#14241B]">
            Use-By / Best-Before Date *
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Today', days: 0 },
              { label: '+2 Days', days: 2 },
              { label: '+5 Days', days: 5 },
              { label: '+14 Days', days: 14 },
              { label: '+90 Days (Dry)', days: 90 },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setExpiryDate(datePlusDays(opt.days))}
                className={`min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  expiryDate === datePlusDays(opt.days)
                    ? 'border-[#1B5E3A] bg-[#1B5E3A] text-white'
                    : 'border-[#CFD7CC] bg-[#FBFBF8] text-[#1A241E]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            id="donate-expiry"
            type="date"
            required
            min={datePlusDays(0)}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full sm:w-64 min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base font-mono-tabular text-[#1A241E]"
          />
        </div>

        {/* Allergens & Storage Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="donate-allergens" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Allergen Information
            </label>
            <input
              id="donate-allergens"
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="None declared / Wheat / Egg / Peanuts"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E]"
            />
          </div>
          <div>
            <label htmlFor="donate-storage" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Storage Instructions (optional)
            </label>
            <input
              id="donate-storage"
              type="text"
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
              placeholder="e.g. Keep refrigerated, wash before cooking"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E]"
            />
          </div>
        </div>

        {/* Optional Photo Upload */}
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-[#14241B]">
            Food Photograph (optional)
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-[#CFD7CC] bg-[#FBFBF8] px-4 py-2.5 text-sm font-semibold text-[#1A241E] hover:bg-[#F0F4EF] cursor-pointer">
              <Camera className="w-4 h-4 text-[#1B5E3A]" aria-hidden="true" />
              <span>{photoPreview ? 'Change Photo' : 'Upload or Take Photo'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview of donated food"
                className="w-16 h-16 rounded-xl object-cover border border-[#DCE2DA]"
              />
            )}
          </div>
        </div>

        {/* Donor Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="donor-name" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              Your Name / Nickname
            </label>
            <input
              id="donor-name"
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Auntie Mei Ling"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E]"
            />
          </div>
          <div>
            <label htmlFor="donor-block" className="block text-sm font-semibold text-[#14241B] mb-1.5">
              HDB Block
            </label>
            <input
              id="donor-block"
              type="text"
              value={donorBlock}
              onChange={(e) => setDonorBlock(e.target.value)}
              placeholder="e.g. Blk 412"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base text-[#1A241E]"
            />
          </div>
        </div>

        {/* Mandatory Food Safety Confirmation */}
        <label className="flex items-start gap-3 rounded-xl border border-[#DCE2DA] bg-[#F8FAF7] p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={safetyConfirmed}
            onChange={(e) => setSafetyConfirmed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-[#94A39B] text-[#1B5E3A] shrink-0"
          />
          <span className="text-sm text-[#1A241E]">
            I confirm this food is clean, unspoiled, within its use-by date, contains <strong>no pork or alcohol</strong>, and is safe for neighbours to enjoy.
          </span>
        </label>

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
          disabled={submitting}
          className="w-full min-h-[52px] rounded-xl bg-[#1B5E3A] text-white text-base font-semibold hover:bg-[#154A2D] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {submitting ? 'Generating QR Code...' : 'Register Donation & Generate QR Label'}
        </button>
      </form>
    </div>
  );
}
