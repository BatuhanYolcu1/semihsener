'use client';

import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, User, HelpCircle, MessageSquare } from 'lucide-react';

interface BookingFormProps {
  dateStr: string;
  timeStr: string;
  onBook: (name: string, reason: string, notes: string) => void;
  onReset: () => void;
}

export default function BookingForm({ dateStr, timeStr, onBook, onReset }: BookingFormProps) {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !reason) return;

    setIsSubmitting(true);
    // Simüle edilmiş kısa gecikme (animasyon hissi için)
    setTimeout(() => {
      onBook(name, reason, notes);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const getFormattedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts.map(Number);
    const localDate = new Date(y, m - 1, d);
    return localDate.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedDate = getFormattedDate(dateStr);

  const whatsappMessage = `Merhaba Semih, ben ${name}. ${formattedDate} günü saat ${timeStr} için "${reason}" konulu bir randevu oluşturdum. Görüşmek üzere!`;
  const whatsappUrl = `https://wa.me/905526990558?text=${encodeURIComponent(whatsappMessage)}`;

  if (isSuccess) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-6 shadow-sm text-center space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Randevunuz Onaylandı!
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Randevu detayları tarayıcınıza kaydedildi. Semih'e bildirmek için lütfen aşağıdaki butona tıklayın.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 text-left border border-zinc-100 dark:border-zinc-900 space-y-2.5">
          <div className="flex justify-between text-xs border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">Tarih</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">Saat</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{timeStr}</span>
          </div>
          <div className="flex justify-between text-xs border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <span className="text-zinc-400 dark:text-zinc-500">Kişi</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{name}</span>
          </div>
          <div className="flex justify-between text-xs pb-1">
            <span className="text-zinc-400 dark:text-zinc-500">Konu</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{reason}</span>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp ile Semih'e Bildir</span>
          </a>

          <button
            onClick={() => {
              setName('');
              setReason('');
              setNotes('');
              setIsSuccess(false);
              onReset();
            }}
            className="w-full py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all duration-200"
            type="button"
          >
            Yeni Randevu Al
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
        <CalendarCheck className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Randevu Formu
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formattedDate} saat {timeStr}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İsim */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-zinc-400" />
            Adınız Soyadınız *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Ahmet Yılmaz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:border-black focus:outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-white"
          />
        </div>

        {/* Buluşma Nedeni */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            Buluşma Nedeni / Konu *
          </label>
          <input
            type="text"
            required
            placeholder="Örn: Proje Detayları Görüşmesi"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:border-black focus:outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-white"
          />
        </div>

        {/* Notlar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
            Varsa Ek Notlar
          </label>
          <textarea
            placeholder="İletmek istediğiniz ek bilgiler..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full py-2 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:border-black focus:outline-none transition-all resize-none dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl text-xs transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 ${
            isSubmitting ? 'cursor-not-allowed opacity-75' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white dark:text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Onaylanıyor...</span>
            </>
          ) : (
            'Randevuyu Onayla'
          )}
        </button>
      </form>
    </div>
  );
}
