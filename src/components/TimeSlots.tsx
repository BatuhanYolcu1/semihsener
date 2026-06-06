'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { WeeklyAvailability, generateSlotsForDate, isSlotInPast } from '../utils/storage';

interface TimeSlotsProps {
  selectedDateStr: string;
  availability: WeeklyAvailability;
  bookedSlots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export default function TimeSlots({
  selectedDateStr,
  availability,
  bookedSlots,
  selectedSlot,
  onSelectSlot,
}: TimeSlotsProps) {
  const slots = generateSlotsForDate(selectedDateStr, availability);

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
        <Clock className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mb-2" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Bu gün için belirlenmiş bir çalışma saat aralığı bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Mevcut Saat Dilimleri
        </h3>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isBooked = bookedSlots.includes(slot);
          const isPast = isSlotInPast(selectedDateStr, slot);
          const isDisabled = isBooked || isPast;
          const isSelected = selectedSlot === slot;

          let btnClass = "py-3 px-2 text-center text-xs font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white ";

          if (isDisabled) {
            btnClass += "bg-zinc-50 border-zinc-150 text-zinc-300 cursor-not-allowed dark:bg-zinc-950 dark:border-zinc-900 dark:text-zinc-700";
          } else if (isSelected) {
            btnClass += "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-sm scale-[1.02]";
          } else {
            btnClass += "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50";
          }

          return (
            <button
              key={slot}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectSlot(slot)}
              className={btnClass}
            >
              <span>{slot}</span>
              {isBooked && (
                <span className="block text-[9px] font-normal text-zinc-400 dark:text-zinc-600 mt-0.5">
                  Dolu
                </span>
              )}
              {!isBooked && isPast && (
                <span className="block text-[9px] font-normal text-zinc-400 dark:text-zinc-600 mt-0.5">
                  Geçti
                </span>
              )}
              {!isDisabled && (
                <span className="block text-[9px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Uygun
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
