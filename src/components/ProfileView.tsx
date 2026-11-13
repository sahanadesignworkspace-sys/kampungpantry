import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Thermometer,
  Trash2,
  UserCheck,
} from 'lucide-react';
import type {
  ActivityRecord,
  Announcement,
  FoodItem,
  FridgeLog,
  LanguageCode,
  ResidentProfile,
} from '../types/pantry';

interface ProfileViewProps {
  profile: ResidentProfile;
  onUpdateProfile: (next: ResidentProfile) => void;
  recentActivities: ActivityRecord[];
  announcements: Announcement[];
  onRefreshData: () => void;
}

interface AdminOverviewData {
  items: FoodItem[];
  fridgeLogs: FridgeLog[];
  activities: ActivityRecord[];
  smsSubscribersCount: number;
}

export function ProfileView({
  profile,
  onUpdateProfile,
  recentActivities,
  announcements,
  onRefreshData,
}: ProfileViewProps) {
  // Resident profile edit
  const [nameInput, setNameInput] = useState(profile.name);
  const [blockInput, setBlockInput] = useState(profile.block);
  const [profileSaved, setProfileSaved] = useState(false);

  // SMS Opt-In
  const [smsPhone, setSmsPhone] = useState('');
  const [smsStatus, setSmsStatus] = useState('');
  const [smsError, setSmsError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  // Volunteer Admin Portal
  const [adminPin, setAdminPin] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminData, setAdminData] = useState<AdminOverviewData | null>(null);
  const [adminError, setAdminError] = useState('');
  const [adminActionMsg, setAdminActionMsg] = useState('');

  // New Fridge Temperature & Cleaning Log
  const [tempInput, setTempInput] = useState('3.2');
  const [volunteerName, setVolunteerName] = useState('Volunteer Siti');
  const [sanitised, setSanitised] = useState(true);
  const [logNotes, setLogNotes] = useState('');

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: nameInput.trim() || 'Kind Neighbour',
      block: blockInput.trim() || 'Blk 412',
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleSmsSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSmsError('');
    setSmsStatus('');
    setSmsLoading(true);
    try {
      const res = await fetch('/api/sms-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.trim() || profile.name || 'Neighbour',
          phone: smsPhone,
          block: blockInput.trim() || profile.block || 'Blk 412',
          preferredLang: profile.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSmsError(data.error || 'Could not save SMS opt-in.');
      } else {
        setSmsStatus(data.message);
        setSmsPhone('');
      }
    } catch {
      setSmsError('Network error while subscribing to SMS alerts.');
    } finally {
      setSmsLoading(false);
    }
  }

  async function loadAdminOverview(pinToUse: string) {
    setAdminError('');
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-pin': pinToUse },
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Incorrect Volunteer PIN.');
        setAdminUnlocked(false);
      } else {
        setAdminData(data);
        setAdminUnlocked(true);
      }
    } catch {
      setAdminError('Unable to reach server for volunteer dashboard.');
    }
  }

  async function handleUnlockAdmin(e: React.FormEvent) {
    e.preventDefault();
    await loadAdminOverview(adminPin.trim());
  }

  async function handleAdminItemAction(
    itemId: string,
    action: 'mark_removed' | 'mark_inspected'
  ) {
    setAdminActionMsg('');
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin.trim(),
        },
        body: JSON.stringify({
          action,
          volunteerName: volunteerName.trim() || 'Community Volunteer',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminActionMsg(
          action === 'mark_removed'
            ? `Removed ${data.item.name} from public fridge inventory.`
            : `Verified ${data.item.name} as inspected.`
        );
        await loadAdminOverview(adminPin.trim());
        onRefreshData();
      }
    } catch {
      setAdminError('Failed to update listing.');
    }
  }

  async function handleFridgeLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdminActionMsg('');
    setAdminError('');
    try {
      const res = await fetch('/api/admin/fridge-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin.trim(),
        },
        body: JSON.stringify({
          temperatureC: Number(tempInput),
          cleanedBy: volunteerName.trim(),
          sanitisedChecklist: sanitised,
          notes: logNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Could not record temperature log.');
      } else {
        setAdminActionMsg(`Logged ${data.log.temperatureC}°C fridge check by ${data.log.cleanedBy}.`);
        setLogNotes('');
        await loadAdminOverview(adminPin.trim());
        onRefreshData();
      }
    } catch {
      setAdminError('Network error saving fridge log.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#14241B]">
          My Profile &amp; Community Care
        </h1>
        <p className="mt-1 text-base text-[#4B5B51]">
          Lightweight account with zero unnecessary personal details — plus SMS updates and volunteer fridge safety tools.
        </p>
      </div>

      {/* Resident Profile + Appreciation Points */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-7 rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#14241B]">Resident Preferences</h2>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1B5E3A] tabular-nums">
              <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{profile.appreciationPoints} Appreciation Points</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-name" className="block text-sm font-semibold text-[#14241B] mb-1">
                First Name or Nickname
              </label>
              <input
                id="prof-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Auntie Mei"
                className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-3.5 text-base text-[#1A241E]"
              />
            </div>
            <div>
              <label htmlFor="prof-block" className="block text-sm font-semibold text-[#14241B] mb-1">
                HDB Block
              </label>
              <input
                id="prof-block"
                type="text"
                value={blockInput}
                onChange={(e) => setBlockInput(e.target.value)}
                placeholder="e.g. Blk 412"
                className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-3.5 text-base text-[#1A241E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-lang" className="block text-sm font-semibold text-[#14241B] mb-1">
                Preferred Greeting Language
              </label>
              <select
                id="prof-lang"
                value={profile.language}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, language: e.target.value as LanguageCode })
                }
                className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-white px-3.5 text-base text-[#1A241E]"
              >
                <option value="en">English</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ms">Bahasa Melayu</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="w-full min-h-[48px] flex items-center justify-between gap-3 rounded-xl border border-[#CFD7CC] px-4 cursor-pointer">
                <span className="text-sm font-semibold text-[#14241B]">Large Text Mode (A+)</span>
                <input
                  type="checkbox"
                  checked={profile.largeText}
                  onChange={(e) =>
                    onUpdateProfile({ ...profile, largeText: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-[#94A39B] text-[#1B5E3A]"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="min-h-[44px] px-5 rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] cursor-pointer"
            >
              Save Preferences
            </button>
            {profileSaved && (
              <span className="text-sm font-semibold text-[#1B5E3A]">Saved locally</span>
            )}
          </div>
        </form>

        {/* SMS Daily Digest Opt-In */}
        <form
          onSubmit={handleSmsSubscribe}
          className="lg:col-span-5 rounded-2xl border border-[#E2E6DF] bg-white p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#1B5E3A]">
              <MessageSquareText className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#14241B]">SMS Daily Digest Opt-In</h2>
            </div>
            <p className="text-sm text-[#4B5B51]">
              For neighbours or elderly relatives who prefer simple morning SMS updates instead of using a smartphone app.
            </p>
            <div>
              <label htmlFor="sms-phone" className="block text-sm font-semibold text-[#14241B] mb-1">
                Singapore Mobile Number (8 digits)
              </label>
              <input
                id="sms-phone"
                type="tel"
                inputMode="numeric"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                placeholder="e.g. 91234567"
                className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base font-mono-tabular text-[#1A241E]"
              />
            </div>
            {smsError && (
              <p className="text-xs font-medium text-[#991B1B]">{smsError}</p>
            )}
            {smsStatus && (
              <p className="text-xs font-semibold text-[#1B5E3A] bg-[#F2F7F3] border border-[#D4DFD5] rounded-xl p-3">
                {smsStatus}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={smsLoading}
            className="w-full min-h-[44px] rounded-xl border border-[#1B5E3A] bg-[#F2F7F3] text-sm font-semibold text-[#1B5E3A] hover:bg-[#E4EFE6] cursor-pointer"
          >
            {smsLoading ? 'Subscribing...' : 'Enable Morning SMS Updates'}
          </button>
        </form>
      </section>

      {/* Community Announcements & Recent Sharing Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#14241B]">Estate Announcements</h2>
          <div className="divide-y divide-[#EAECE7]">
            {announcements.map((ann) => (
              <div key={ann.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="text-xs font-semibold text-[#1B5E3A]">
                  {ann.category} · {ann.date}
                </div>
                <div className="font-bold text-sm text-[#14241B]">{ann.title}</div>
                <p className="text-sm text-[#4B5B51] leading-relaxed">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-[#14241B]">Recent Fridge Activity</h2>
          <div className="divide-y divide-[#EAECE7]">
            {recentActivities.slice(0, 8).map((act) => (
              <div
                key={act.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm"
              >
                <div>
                  <span className="font-semibold text-[#14241B]">
                    {act.type === 'donation'
                      ? 'Shared'
                      : act.type === 'collection'
                        ? 'Collected'
                        : 'Volunteer Check'}
                  </span>{' '}
                  · {act.itemName} ({act.quantityText})
                  <div className="text-xs text-[#59695F]">
                    {act.residentName} ({act.block}) · {act.method}
                  </div>
                </div>
                <div className="font-mono-tabular text-xs text-[#59695F] shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protected Community Volunteer / Admin Safety Dashboard */}
      <section className="rounded-2xl border border-[#DCE2DA] bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#1B5E3A] shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-[#14241B]">
                Community Volunteer &amp; Fridge Safety Admin
              </h2>
              <p className="text-sm text-[#4B5B51]">
                Authorised volunteers log chiller temperatures, clean shelves, and remove expired or unsuitable food.
              </p>
            </div>
          </div>
          {adminUnlocked && (
            <button
              type="button"
              onClick={() => {
                setAdminUnlocked(false);
                setAdminData(null);
                setAdminPin('');
              }}
              className="min-h-[40px] px-3.5 rounded-xl border border-[#CFD7CC] text-xs font-semibold text-[#35443B] hover:bg-[#F4F6F3] cursor-pointer"
            >
              Lock Admin View
            </button>
          )}
        </div>

        {!adminUnlocked ? (
          <form onSubmit={handleUnlockAdmin} className="max-w-md space-y-3">
            <label htmlFor="admin-pin-input" className="block text-sm font-semibold text-[#14241B]">
              Enter Volunteer Passcode (Demo PIN: 2026)
            </label>
            <div className="flex gap-2">
              <input
                id="admin-pin-input"
                type="password"
                inputMode="numeric"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter PIN"
                className="flex-1 min-h-[48px] rounded-xl border border-[#CFD7CC] px-4 text-base font-mono-tabular text-[#1A241E]"
              />
              <button
                type="submit"
                className="min-h-[48px] inline-flex items-center gap-2 px-5 rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] cursor-pointer"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Unlock</span>
              </button>
            </div>
            {adminError && <p className="text-sm font-medium text-[#991B1B]">{adminError}</p>}
          </form>
        ) : (
          adminData && (
            <div className="space-y-6 pt-2">
              {adminActionMsg && (
                <div className="rounded-xl border border-[#D4DFD5] bg-[#F2F7F3] px-4 py-3 text-sm font-semibold text-[#1B5E3A]">
                  {adminActionMsg}
                </div>
              )}

              {/* Log Fridge Temperature & Cleaning */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={handleFridgeLogSubmit}
                  className="lg:col-span-5 rounded-xl border border-[#E2E6DF] bg-[#FBFBF8] p-5 space-y-3"
                >
                  <div className="flex items-center gap-2 font-bold text-[#14241B]">
                    <Thermometer className="w-4 h-4 text-[#1B5E3A]" aria-hidden="true" />
                    <span>Log Chiller Temp &amp; Cleaning</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="log-temp" className="block text-xs font-semibold text-[#4B5B51] mb-1">
                        Temp (°C)
                      </label>
                      <input
                        id="log-temp"
                        type="number"
                        step="0.1"
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-[#CFD7CC] bg-white px-3 text-sm font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label htmlFor="log-vol" className="block text-xs font-semibold text-[#4B5B51] mb-1">
                        Volunteer Name
                      </label>
                      <input
                        id="log-vol"
                        type="text"
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-[#CFD7CC] bg-white px-3 text-sm"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#1A241E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sanitised}
                      onChange={(e) => setSanitised(e.target.checked)}
                      className="h-4 w-4 rounded text-[#1B5E3A]"
                    />
                    <span>Shelves wiped &amp; Halal/No-Pork labels checked</span>
                  </label>
                  <input
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Optional inspection note"
                    className="w-full min-h-[44px] rounded-xl border border-[#CFD7CC] bg-white px-3 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[44px] rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] cursor-pointer"
                  >
                    Save Safety Log
                  </button>
                </form>

                {/* Recent Temperature & Cleaning Records */}
                <div className="lg:col-span-7 rounded-xl border border-[#E2E6DF] bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#14241B]">Fridge Temperature &amp; Cleaning Logs</h3>
                    <span className="text-xs text-[#4B5B51] tabular-nums">
                      SMS Subscribers: {adminData.smsSubscribersCount}
                    </span>
                  </div>
                  <div className="divide-y divide-[#EAECE7]">
                    {adminData.fridgeLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono-tabular text-[#1B5E3A]">
                            {log.temperatureC.toFixed(1)}°C
                          </span>
                          <span className="text-xs text-[#59695F] tabular-nums">
                            {new Date(log.recordedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-[#35443B]">
                          {log.cleanedBy} · {log.sanitisedChecklist ? 'Sanitised ✓' : 'Temp check only'} —{' '}
                          {log.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* All Food Listings Moderation Table */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#14241B]">
                  All Fridge Listings (Including Expired &amp; Collected)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[#E2E6DF]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-[#F6F8F5] text-xs font-semibold text-[#4B5B51]">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Qty</th>
                        <th className="py-3 px-4">Expiry</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Volunteer Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECE7] bg-white">
                      {adminData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-mono-tabular text-xs">{item.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#14241B]">{item.name}</div>
                            <div className="text-xs text-[#59695F]">{item.inspectedBy}</div>
                          </td>
                          <td className="py-3 px-4 tabular-nums">
                            {item.remainingQty}/{item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-xs">{item.expiryDate}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-semibold ${
                                item.status === 'expired' || item.status === 'removed'
                                  ? 'text-[#991B1B]'
                                  : item.status === 'collected'
                                    ? 'text-[#59695F]'
                                    : 'text-[#1B5E3A]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              {item.status === 'available' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminItemAction(item.id, 'mark_inspected')}
                                  className="min-h-[36px] inline-flex items-center gap-1 px-2.5 rounded-lg border border-[#1B5E3A] text-xs font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Verify</span>
                                </button>
                              )}
                              {item.status !== 'removed' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminItemAction(item.id, 'mark_removed')}
                                  className="min-h-[36px] inline-flex items-center gap-1 px-2.5 rounded-lg border border-[#DC2626] text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2] cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
