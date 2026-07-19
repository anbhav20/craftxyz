import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.js';
import {
  fetchSettings,
  saveSettings,
  selectSettings,
  selectSettingsStatus,
  selectSettingsSaveStatus,
} from '../../features/admin/settingsSlice.js';

function AdminSettings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const status = useAppSelector(selectSettingsStatus);
  const saveStatus = useAppSelector(selectSettingsSaveStatus);
  const [form, setForm] = useState(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (status === 'loading' || !form) {
    return <p className="text-sm text-[#141311]/50">Loading…</p>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(
      saveSettings({
        websiteName: form.websiteName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        shippingCharge: form.shippingCharge,
        freeShippingThreshold: form.freeShippingThreshold || null,
      })
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-.03em]">Settings</h1>

      <form className="mt-6 max-w-md space-y-4 rounded-2xl border border-[#141311]/10 bg-white p-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-[#141311]/70">Website name</label>
          <input
            className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
            value={form.websiteName}
            onChange={(event) => setForm({ ...form, websiteName: event.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#141311]/70">Contact email</label>
          <input
            className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
            type="email"
            value={form.contactEmail}
            onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#141311]/70">Contact phone</label>
          <input
            className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
            value={form.contactPhone}
            onChange={(event) => setForm({ ...form, contactPhone: event.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#141311]/70">Shipping charge ($)</label>
          <input
            className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
            type="number"
            min="0"
            step="0.01"
            value={form.shippingCharge}
            onChange={(event) => setForm({ ...form, shippingCharge: event.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#141311]/70">
            Free shipping above ($) — leave blank to never offer free shipping
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[#141311]/15 px-3 py-2 text-sm focus:border-[#6F9E23] focus:outline-none"
            type="number"
            min="0"
            step="0.01"
            value={form.freeShippingThreshold ?? ''}
            onChange={(event) => setForm({ ...form, freeShippingThreshold: event.target.value })}
          />
        </div>
        <button
          className="w-full rounded-full bg-[#141311] px-4 py-3 text-sm font-bold text-white hover:bg-[#6F9E23] disabled:opacity-50"
          type="submit"
          disabled={saveStatus === 'loading'}
        >
          {saveStatus === 'loading' ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;
