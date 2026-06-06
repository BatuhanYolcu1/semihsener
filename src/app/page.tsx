'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { CalendarCheck, Mail, Moon, Sun } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

import Calendar from '@/components/Calendar'
import TimeSlots from '@/components/TimeSlots'
import BookingForm from '@/components/BookingForm'
import {
  WeeklyAvailability,
  Appointment,
  getAvailability,
  getAppointments,
  addAppointment,
  defaultAvailability,
  getLocalDateString,
} from '@/utils/storage'

export default function Home() {
  const [availability, setAvailability] = useState<WeeklyAvailability>(defaultAvailability)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const loadData = useCallback(async () => {
    const [avail, apps] = await Promise.all([getAvailability(), getAppointments()])
    setAvailability(avail)
    setAppointments(apps)
  }, [])

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(isDark)
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    loadData()
  }, [loadData])

  // Gerçek zamanlı güncellemeler
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public-realtime')
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

  const toggleDarkMode = () => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleBook = async (name: string, reason: string, notes: string) => {
    if (!selectedDate || !selectedSlot) return
    const dateStr = getLocalDateString(selectedDate)
    const newApp = await addAppointment({ date: dateStr, time: selectedSlot, name, reason, notes })
    setAppointments((prev) => [...prev, newApp])
  }

  const selectedDateStr = selectedDate ? getLocalDateString(selectedDate) : ''
  const bookedSlots = selectedDate
    ? appointments.filter((a) => a.date === selectedDateStr).map((a) => a.time)
    : []

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
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Sol Sütun: Profil */}
          <div className="md:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 md:sticky md:top-24">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-inner bg-zinc-50">
                <Image
                  src="/profile.jpg"
                  alt="Semih Şener"
                  fill
                  sizes="(max-width: 112px) 100vw, 112px"
                  priority
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Semih Şener</h1>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Kişisel Randevu & Takvim
                </p>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed max-w-sm md:max-w-none">
                Merhaba! Benimle görüşmek, kahve içmek veya herhangi bir konuyu konuşmak için
                aşağıdaki takvim üzerinden uygun bir gün ve saat seçerek randevu oluşturabilirsiniz.
              </p>
            </div>

            {/* Sosyal Medya */}
            <div className="flex items-center justify-center md:justify-start gap-3 border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              <a
                href="https://wa.me/905526990558"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800/60 rounded-xl hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-emerald-400/30"
                title="WhatsApp ile İletişime Geç"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href="mailto:semih@example.com"
                className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800/60 rounded-xl hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                title="E-posta Gönder"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://github.com/semihsener"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800/60 rounded-xl hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                title="GitHub"
              >
                <GithubIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://linkedin.com/in/semihsener"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800/60 rounded-xl hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30"
                title="LinkedIn"
              >
                <LinkedinIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Sağ Sütun: Takvim & Randevu Akışı */}
          <div className="md:col-span-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                1. Görüşme Tarihi Seçin
              </h3>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                availability={availability}
              />
            </div>

            {selectedDate && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-350">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                  2. Saat Dilimi Seçin
                </h3>
                <TimeSlots
                  selectedDateStr={selectedDateStr}
                  availability={availability}
                  bookedSlots={bookedSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                />
              </div>
            )}

            {selectedDate && selectedSlot && (
              <div className="animate-in slide-in-from-bottom duration-350">
                <BookingForm
                  dateStr={selectedDateStr}
                  timeStr={selectedSlot}
                  onBook={handleBook}
                  onReset={() => setSelectedSlot(null)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 text-center text-[10px] text-zinc-400 dark:text-zinc-600 border-t border-zinc-150 dark:border-zinc-900 mt-auto">
        <p>© 2026 BulutTakvim. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  )
}
