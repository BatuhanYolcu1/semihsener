'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyAvailability } from '../utils/storage';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability: WeeklyAvailability;
}

export default function Calendar({ selectedDate, onSelectDate, availability }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Ayın ilk gününün haftanın hangi gününe denk geldiği (0 = Pazartesi, ..., 6 = Pazar)
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // JS getDay()'de 0 = Pazar. Bunu 6 = Pazar, 0 = Pazartesi yapacağız.
  };

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const today = new Date();
    
    const isClickedDatePast = clickedDate.getFullYear() < today.getFullYear() ||
                              (clickedDate.getFullYear() === today.getFullYear() && clickedDate.getMonth() < today.getMonth()) ||
                              (clickedDate.getFullYear() === today.getFullYear() && clickedDate.getMonth() === today.getMonth() && clickedDate.getDate() < today.getDate());
    
    if (!isClickedDatePast) {
      onSelectDate(clickedDate);
    }
  };

  const renderDays = () => {
    const today = new Date();
    const dayCells = [];

    // Önceki aydan boşluklar
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const dateOfCell = new Date(year, month, day);
      
      const isPast = dateOfCell.getFullYear() < today.getFullYear() ||
                     (dateOfCell.getFullYear() === today.getFullYear() && dateOfCell.getMonth() < today.getMonth()) ||
                     (dateOfCell.getFullYear() === today.getFullYear() && dateOfCell.getMonth() === today.getMonth() && dateOfCell.getDate() < today.getDate());

      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;

      const dayOfWeek = dateOfCell.getDay(); // 0 = Pazar, 1 = Pazartesi...
      const isWorkingDay = availability.days?.[dayOfWeek]?.enabled ?? false;

      let cellClass = "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer relative ";
      
      if (isPast) {
        cellClass += "text-zinc-300 dark:text-zinc-700 cursor-not-allowed";
      } else if (!isWorkingDay) {
        cellClass += "text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800/50";
      } else if (isSelected) {
        cellClass += "bg-black text-white dark:bg-white dark:text-black shadow-md scale-105";
      } else {
        cellClass += "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:scale-105";
      }

      // Bugün işareti
      const isToday = today.getDate() === day && 
        today.getMonth() === month && 
        today.getFullYear() === year;

      dayCells.push(
        <button
          key={`day-${day}`}
          onClick={() => !isPast && handleDayClick(day)}
          disabled={isPast}
          className={cellClass}
          type="button"
        >
          <span>{day}</span>
          {isToday && !isSelected && (
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-800 dark:bg-zinc-200" />
          )}
          {!isPast && !isWorkingDay && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/70" title="Çalışma dışı gün" />
          )}
        </button>
      );
    }

    return dayCells;
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Gün İsimleri */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Gün Hücreleri */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {renderDays()}
      </div>

      {/* Bilgilendirme */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span>Uygunluk Dışı Gün</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-800 dark:bg-zinc-200" />
          <span>Bugün</span>
        </div>
      </div>
    </div>
  );
}
