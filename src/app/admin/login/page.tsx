'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Lock, Mail, Eye, EyeOff, CalendarCheck } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <CalendarCheck className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Yönetici Girişi</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">BulutTakvim Admin Paneli</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                E-posta
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:border-black focus:outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-10 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white dark:focus:bg-zinc-900 focus:border-black focus:outline-none transition-all dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 dark:focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          <a href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
            ← Müşteri sayfasına dön
          </a>
        </p>
      </div>
    </div>
  )
}
