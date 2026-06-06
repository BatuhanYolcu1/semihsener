'use client'

import React, { useState } from 'react'
import { Trash2, Save, Info, CheckCircle2, CalendarRange, Clock } from 'lucide-react'
import {
  WeeklyAvailability,
  DaySchedule,
  Appointment,
  saveAvailability,
  cancelAppointment,
  generateSlotsForDate,
} from '@/utils/storage'

interface AdminPanelProps {
  availability: WeeklyAvailability
  appointments: Appointment[]
  onUpdateAvailability: (a: WeeklyAvailability) => void
  onUpdateAppointments: (a: Appointment[]) => void
}

const DAYS = [
  { label: 'Pazartesi', value: 1 },
  { label: 'Salı',      value: 2 },
  { label: 'Çarşamba',  value: 3 },
  { label: 'Perşembe',  value: 4 },
  { label: 'Cuma',      value: 5 },
  { label: 'Cumartesi', value: 6 },
  { label: 'Pazar',     value: 0 },
]

const DURATIONS = [
  { label: '15 dk', value: 15 },
  { label: '30 dk', value: 30 },
  { label: '45 dk', value: 45 },
  { label: '1 sa',  value: 60 },
  { label: '1.5 sa', value: 90 },
  { label: '2 sa',  value: 120 },
]

export default function AdminPanel({
  availability,
  appointments,
  onUpdateAvailability,
  onUpdateAppointments,
}: AdminPanelProps) {
  const [days, setDays]             = useState<Record<number, DaySchedule>>(availability.days)
  const [slotDuration, setSlot]     = useState(availability.slotDuration)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [cancellingId, setCancel]   = useState<string | null>(null)

  const toggleDay = (val: number) =>
    setDays((p) => ({ ...p, [val]: { ...p[val], enabled: !p[val].enabled } }))

  const updateTime = (val: number, field: 'startTime' | 'endTime', time: string) =>
    setDays((p) => ({ ...p, [val]: { ...p[val], [field]: time } }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    // Validasyon: başlangıç < bitiş olmalı (00:00 = 24:00 kabul edilir)
    for (const d of DAYS) {
      const sch = days[d.value]
      if (!sch?.enabled) continue
      const [sh, sm] = sch.startTime.split(':').map(Number)
      const [eh, em] = sch.endTime.split(':').map(Number)
      const start = sh * 60 + sm
      const end   = (eh === 0 && em === 0) ? 1440 : eh * 60 + em
      if (end <= start) {
        setSaveError(`${d.label}: Bitiş saati başlangıçtan büyük olmalı (00:00 = gece yarısı).`)
        return
      }
    }

    setSaving(true)
    const updated: WeeklyAvailability = { days, slotDuration }
    try {
      await saveAvailability(updated)
      onUpdateAvailability(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return
    setCancel(id)
    try {
      await cancelAppointment(id)
      onUpdateAppointments(appointments.filter((a) => a.id !== id))
    } finally {
      setCancel(null)
    }
  }

  // Etkin günlerin toplam slotunu hesapla
  const totalSlots = DAYS.filter((d) => days[d.value]?.enabled).reduce((sum, d) => {
    return sum + generateSlotsForDate('', { days: { [d.value]: days[d.value] }, slotDuration }).length
  }, 0)
  const activeDays = DAYS.filter((d) => days[d.value]?.enabled).length

  const now = new Date()
  const sorted = [...appointments].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  )
  const upcoming = sorted.filter((a) => new Date(`${a.date}T${a.time}`) >= now)
  const past     = sorted.filter((a) => new Date(`${a.date}T${a.time}`) < now)

  const fmtDate = (ds: string) => {
    const [y, m, d] = ds.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ─── Uygunluk Ayarları ─── */}
      <form
        onSubmit={handleSave}
        className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800"
      >
        {/* Başlık */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Uygunluk Ayarları</h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {activeDays} aktif gün · haftada{' '}
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">{totalSlots} slot</span>
          </p>
        </div>

        {/* Günler */}
        <div className="px-5 py-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Çalışma Takvimi
          </p>
          {DAYS.map((day) => {
            const sch = days[day.value] ?? { enabled: false, startTime: '09:00', endTime: '18:00' }
            return (
              <div key={day.value} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                sch.enabled ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
              }`}>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 ${
                    sch.enabled ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform duration-200 ${
                    sch.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>

                {/* Gün adı */}
                <span className={`text-sm font-semibold w-20 shrink-0 ${
                  sch.enabled ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-300 dark:text-zinc-600'
                }`}>
                  {day.label}
                </span>

                {/* Saat */}
                {sch.enabled ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="time"
                      value={sch.startTime}
                      onChange={(e) => updateTime(day.value, 'startTime', e.target.value)}
                      className="flex-1 py-1.5 px-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-zinc-900 dark:focus:border-white focus:outline-none transition-all dark:text-zinc-100"
                    />
                    <span className="text-zinc-300 dark:text-zinc-600 text-xs">—</span>
                    <input
                      type="time"
                      value={sch.endTime}
                      onChange={(e) => updateTime(day.value, 'endTime', e.target.value)}
                      className="flex-1 py-1.5 px-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-zinc-900 dark:focus:border-white focus:outline-none transition-all dark:text-zinc-100"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-zinc-300 dark:text-zinc-600">Kapalı</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Randevu Süresi */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Randevu Süresi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSlot(d.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  slotDuration === d.value
                    ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black'
                    : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kaydet */}
        <div className="px-5 py-4 space-y-3">
          {saveError && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl px-3 py-2">
              {saveError}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Kaydediliyor...</>
              : saved ? <><CheckCircle2 className="h-4 w-4 text-emerald-400"/>Kaydedildi</>
              :         <><Save className="h-4 w-4"/>Kaydet</>}
          </button>
        </div>
      </form>


      {/* ─── Randevular ─── */}
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Randevular</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {upcoming.length > 0 && (
              <span className="bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                {upcoming.length} yaklaşan
              </span>
            )}
            {past.length > 0 && (
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {past.length} geçmiş
              </span>
            )}
          </div>
        </div>

        <div className="p-4 max-h-[600px] overflow-y-auto space-y-5">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="h-10 w-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                <Info className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Henüz randevu yok</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Yenileri burada anında görünür</p>
              </div>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Yaklaşan</p>
                  {upcoming.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/50 transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{fmtDate(a.date)}</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate mt-0.5">{a.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{a.reason}</p>
                        {a.notes && <p className="text-[11px] italic text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-1">{a.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="flex items-center gap-1 bg-zinc-900 dark:bg-white text-white dark:text-black font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                          <Clock className="h-3 w-3"/>{a.time}
                        </span>
                        <button
                          onClick={() => handleCancel(a.id)}
                          disabled={cancellingId === a.id}
                          className="text-[10px] text-red-400 hover:text-red-600 dark:hover:text-red-300 font-semibold flex items-center gap-0.5 disabled:opacity-40 transition-colors"
                          type="button"
                        >
                          <Trash2 className="h-3 w-3"/>
                          {cancellingId === a.id ? 'İptal...' : 'İptal et'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {past.length > 0 && (
                <div className="space-y-2 opacity-50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Geçmiş</p>
                  {past.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-400">{fmtDate(a.date)}</p>
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">{a.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{a.reason}</p>
                      </div>
                      <span className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-mono text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                        <Clock className="h-3 w-3"/>{a.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
