'use client'

import { useMemo } from 'react'
import { Star, BadgeCheck, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import type { Review } from '@/lib/single-product-types'

interface ReviewSectionProps {
  reviews: Review[]
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  const stats = useMemo(() => {
    if (!reviews.length) return null
    const dist = [0, 0, 0, 0, 0] // index 0 = 1★, index 4 = 5★
    let sum = 0
    for (const r of reviews) {
      const idx = Math.min(4, Math.max(0, r.rating - 1))
      dist[idx]++
      sum += r.rating
    }
    return {
      average: sum / reviews.length,
      total: reviews.length,
      distribution: dist.reverse(), // 5★ en premier
    }
  }, [reviews])

  if (!reviews.length) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Résumé + distribution */}
      {stats && (
        <div className="grid gap-6 rounded-2xl border border-gray-100 bg-white p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {/* Note moyenne */}
          <div className="text-center sm:border-r sm:border-gray-100 sm:pr-6">
            <p className="text-4xl font-black text-gray-900">{stats.average.toFixed(1)}</p>
            <div className="mt-1 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(stats.average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{stats.total} avis</p>
          </div>
          {/* Barres de distribution */}
          <div className="space-y-1.5">
            {stats.distribution.map((count, i) => {
              const stars = 5 - i
              const pct = stats.total ? (count / stats.total) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-gray-500">{stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs text-gray-400">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.slice(0, 10).map((r) => (
          <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                {initials(r.customerName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{r.customerName}</p>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <BadgeCheck className="h-3 w-3" /> Achat vérifié
                    </span>
                  )}
                  {r.source !== 'MANUAL' && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {r.source === 'FACEBOOK' ? 'Facebook' : 'TikTok'}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{r.comment}</p>
                )}
                {/* Photos jointes */}
                {r.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-2">
                    {r.photos.slice(0, 4).map((url, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                        <Image src={url} alt="" fill unoptimized className="object-cover" sizes="120px" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
