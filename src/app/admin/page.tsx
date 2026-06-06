'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AdminPanel from '@/components/AdminPanel'
import {
  WeeklyAvailability,
  Appointment,
  getAvailability,
  getAppointments,
  defaultAvailability,
} from '@/utils/storage'
import { CalendarCheck, ShieldAlert, LogOut, Moon, Sun } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [availability, setAvailability] = useState<WeeklyAvailability>(defaultAvailability)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const loadData = useCallback(async () => {
    const [avail, apps] = await Promise.all([getAvailability(), getAppointments()])
    setAvailability(avail)
    setAppointments(apps)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Dark mode
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(isDark)
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    loadData()
  }, [loadData])

  // Gerçek zamanlı randevu güncellemeleri
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => { loadData() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability' },
        () => { loadData() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-zinc-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-black dark:text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-150 dark:border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-sm">
            <CalendarCheck className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-sm tracking-tight">BulutTakvim</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all duration-200"
            type="button"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <a
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
          >
            Müşteri Sayfası
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Çıkış</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3 mb-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Yönetici Paneli</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Uygunluk saatlerinizi güncelleyin ve randevuları yönetin. Değişiklikler anında senkronize edilir.
              </p>
            </div>
          </div>

          <AdminPanel
            availability={availability}
            appointments={appointments}
            onUpdateAvailability={(newAvail) => setAvailability(newAvail)}
            onUpdateAppointments={(newApps) => setAppointments(newApps)}
          />
        </div>
      </main>

      <footer className="py-8 px-6 text-center text-[10px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-150 dark:border-zinc-900 mt-auto">
        <p>© 2026 BulutTakvim — Yönetici Paneli</p>
      </footer>
    </div>
  )
}
