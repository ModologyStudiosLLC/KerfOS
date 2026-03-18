'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CookieConsentProps {
  onAccept?: (consents: Record<string, boolean>) => void
  onDecline?: () => void
}

interface CookieCategory {
  id: string
  name: string
  description: string
  required: boolean
  enabled: boolean
}

const defaultCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the app to function properly. These cannot be disabled.',
    required: true,
    enabled: true,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how you use KerfOS so we can improve the experience.',
    required: false,
    enabled: false,
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Allow us to show you relevant content and offers.',
    required: false,
    enabled: false,
  },
]

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [categories, setCategories] = useState<CookieCategory[]>(defaultCategories)

  useEffect(() => {
    // Check if consent was already given
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = async () => {
    const consents: Record<string, boolean> = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    
    localStorage.setItem('cookie_consent', JSON.stringify(consents))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    
    // Send to backend
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous'
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          consents,
          confirm: true,
        }),
      })
    } catch (error) {
      console.error('Failed to save consent:', error)
    }
    
    onAccept?.(consents)
    setIsVisible(false)
  }

  const handleAcceptSelected = async () => {
    const consents: Record<string, boolean> = {}
    categories.forEach((cat) => {
      consents[cat.id] = cat.enabled
    })
    
    localStorage.setItem('cookie_consent', JSON.stringify(consents))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    
    // Send to backend
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous'
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          consents,
          confirm: true,
        }),
      })
    } catch (error) {
      console.error('Failed to save consent:', error)
    }
    
    onAccept?.(consents)
    setIsVisible(false)
  }

  const handleDecline = async () => {
    const consents: Record<string, boolean> = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    
    localStorage.setItem('cookie_consent', JSON.stringify(consents))
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    
    onDecline?.()
    setIsVisible(false)
  }

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id && !cat.required ? { ...cat, enabled: !cat.enabled } : cat
      )
    )
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 sm:items-center">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            🍪 Cookie Preferences
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We use cookies to improve your experience. Choose which cookies you allow us to use.
          </p>
        </div>

        {/* Categories */}
        <div className="p-6 space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.required && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </div>
              <button
                onClick={() => toggleCategory(category.id)}
                disabled={category.required}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  category.enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    category.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* More Info */}
        <div className="px-6 pb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showDetails ? '▼ Hide Details' : '▶ Show Cookie Details'}
          </button>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <h4 className="font-medium text-gray-900 mb-2">Cookies We Use:</h4>
              <ul className="space-y-2">
                <li><strong>session</strong> - Maintains your login session (Essential)</li>
                <li><strong>preferences</strong> - Stores your preferences (Essential)</li>
                <li><strong>csrf_token</strong> - Security token (Essential)</li>
                <li><strong>_ga, _gid</strong> - Google Analytics (Analytics)</li>
              </ul>
              <p className="mt-3">
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  View our Privacy Policy
                </Link>
                {' | '}
                <Link href="/cookies" className="text-blue-600 hover:underline">
                  Cookie Policy
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Decline Non-Essential
          </button>
          <button
            onClick={handleAcceptSelected}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Accept Selected
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
