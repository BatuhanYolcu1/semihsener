import { createClient } from '@/lib/supabase'

export interface Appointment {
  id: string
  date: string
  time: string
  name: string
  reason: string
  notes?: string
  createdAt: string
}

export interface DaySchedule {
  enabled: boolean
  startTime: string  // HH:MM
  endTime: string    // HH:MM
}

export interface WeeklyAvailability {
  days: Record<number, DaySchedule>  // 0=Pazar … 6=Cumartesi
  slotDuration: number
}

const makeDay = (enabled: boolean, start = '09:00', end = '18:00'): DaySchedule =>
  ({ enabled, startTime: start, endTime: end })

export const defaultAvailability: WeeklyAvailability = {
  days: {
    0: makeDay(false), // Pazar
    1: makeDay(true),  // Pazartesi
    2: makeDay(true),  // Salı
    3: makeDay(true),  // Çarşamba
    4: makeDay(true),  // Perşembe
    5: makeDay(true),  // Cuma
    6: makeDay(false), // Cumartesi
  },
  slotDuration: 60,
}

export const getLocalDateString = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function rowToAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    date: row.date as string,
    time: row.time as string,
    name: row.name as string,
    reason: row.reason as string,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

export const getAppointments = async (): Promise<Appointment[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  if (error || !data) return []
  return data.map(rowToAppointment)
}

export const addAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<Appointment> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      date: appointment.date,
      time: appointment.time,
      name: appointment.name,
      reason: appointment.reason,
      notes: appointment.notes ?? null,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Randevu eklenemedi')
  return rowToAppointment(data)
}

export const cancelAppointment = async (id: string): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const getAvailability = async (): Promise<WeeklyAvailability> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('availability')
    .select('schedule, slot_duration')
    .eq('id', 1)
    .single()

  if (error || !data) return defaultAvailability

  // Yeni JSONB schedule varsa onu kullan
  if (data.schedule && Object.keys(data.schedule).length > 0) {
    return {
      days: data.schedule as Record<number, DaySchedule>,
      slotDuration: (data.slot_duration as number) ?? 60,
    }
  }

  // Yoksa varsayılana dön
  return { ...defaultAvailability, slotDuration: (data.slot_duration as number) ?? 60 }
}

export const saveAvailability = async (availability: WeeklyAvailability): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from('availability')
    .update({
      schedule: availability.days,
      slot_duration: availability.slotDuration,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
  if (error) throw new Error(error.message)
}

// Tek günün slotlarını üretir
function slotsFromSchedule(schedule: DaySchedule, slotDuration: number): string[] {
  const slots: string[] = []
  const [sh, sm] = schedule.startTime.split(':').map(Number)
  const [eh, em] = schedule.endTime.split(':').map(Number)
  let cur = sh * 60 + sm
  // 00:00 bitiş saati gece yarısı (1440 dk) anlamına gelir
  let end = eh * 60 + em
  if (end === 0) end = 1440
  // Bitiş başlangıçtan küçük veya eşitse slot üretemeyiz
  if (end <= cur) return []
  while (cur + slotDuration <= end) {
    slots.push(
      `${Math.floor(cur / 60).toString().padStart(2, '0')}:${(cur % 60).toString().padStart(2, '0')}`
    )
    cur += slotDuration
  }
  return slots
}

export const generateSlotsForDate = (
  dateStr: string,
  availability: WeeklyAvailability
): string[] => {
  // Önizleme için (dateStr boş) → ilk aktif günün slotlarını göster
  if (!dateStr) {
    const first = Object.values(availability.days).find((d) => d.enabled)
    return first ? slotsFromSchedule(first, availability.slotDuration) : []
  }
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  const schedule = availability.days[dow]
  if (!schedule?.enabled) return []
  return slotsFromSchedule(schedule, availability.slotDuration)
}

export const isSlotInPast = (dateStr: string, timeStr: string): boolean => {
  const now = new Date()
  const [sy, sm, sd] = dateStr.split('-').map(Number)
  const [sh, smin] = timeStr.split(':').map(Number)
  if (sy < now.getFullYear()) return true
  if (sy > now.getFullYear()) return false
  const cm = now.getMonth() + 1
  if (sm < cm) return true
  if (sm > cm) return false
  if (sd < now.getDate()) return true
  if (sd > now.getDate()) return false
  return sh * 60 + smin <= now.getHours() * 60 + now.getMinutes()
}
