// @ts-nocheck
'use client';
import React, { useState, useEffect, useCallback } from 'react'

const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the app to function. Includes session, preferences, and security cookies.',
    required: true,
    cookies: ['session', 'preferences', 'csrf_token']
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how you use KerfOS so we can improve the experience.',
    required: false,
    cookies: ['_ga', '_gid', '_gat']
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to deliver relevant ads and track campaign performance.',
    required: false,
    cookies: ['_fbp', 'fr', 'ads_prefs']
  },
  {
    id: 'third_party',
    name: 'Third-Party Integrations',
    description: 'Enable integrations with services like Stripe for payments.',
    required: false,
    cookies: ['stripe_mid', 'stripe_sid']
  }
]

const CONSENT_STORAGE_KEY = 'kerfos_cookie_consent'
const CONSENT_VERSION = '1.0.0'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consents, setConsents] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    third_party: false
  })
  const [hasConsented, setHasConsented] = useState(false)

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.version === CONSENT_VERSION) {
          setConsents(parsed.consents)
          setHasConsented(true)
          return
        }
      } catch (e) {
        console.error('Failed to parse consent:', e)
      }
    }
    
    // No valid consent found, show banner
    setShowBanner(true)
  }, [])

  const saveConsent = useCallback(async (newConsents) => {
    const consentData = {
      version: CONSENT_VERSION,
      consents: newConsents,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    // Save locally
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
    
    // Send to backend
    try {
      const user = localStorage.getItem('kerfos_user_data')
      const userData = user ? JSON.parse(user) : null
      
      if (userData?.user_id) {
        await fetch('/api/gdpr/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userData.user_id,
            consents: newConsents,
            confirm: true
          })
        })
      }
    } catch (e) {
      console.error('Failed to sync consent to backend:', e)
    }
    
    setConsents(newConsents)
    setHasConsented(true)
    setShowBanner(false)
    setShowDetails(false)
    
    // Apply consent (enable/disable tracking)
    applyConsent(newConsents)
  }, [])

  const applyConsent = (consents) => {
    // In production, this would enable/disable tracking scripts
    if (!consents.analytics) {
      // Disable Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }
    
    if (!consents.marketing) {
      // Disable marketing pixels
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'ad_storage': 'denied'
        })
      }
    }
  }

  const handleAcceptAll = () => {
    const allConsents = {
      essential: true,
      analytics: true,
      marketing: true,
      third_party: true
    }
    saveConsent(allConsents)
  }

  const handleRejectAll = () => {
    const minimalConsents = {
      essential: true,
      analytics: false,
      marketing: false,
      third_party: false
    }
    saveConsent(minimalConsents)
  }

  const handleSavePreferences = () => {
    saveConsent(consents)
  }

  const handleToggleConsent = (categoryId) => {
    if (categoryId === 'essential') return // Can't toggle essential
    setConsents(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleManagePreferences = () => {
    setShowDetails(true)
  }

  // Don't render if already consented and not showing details
  if (!showBanner && !showDetails) {
    return null
  }

  // Compact banner (initial view)
  if (showBanner && !showDetails) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">🍪 Cookie Preferences</h3>
              <p className="text-gray-300 text-sm">
                We use cookies to improve your experience. Some are essential, others help us understand how you use KerfOS.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleManagePreferences}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
              >
                Manage Preferences
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Detailed preferences modal
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
          <p className="text-gray-600 mt-1">
            Choose which cookies you want to accept. Essential cookies are always enabled.
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          {COOKIE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents[category.id]}
                    disabled={category.required}
                    onChange={() => handleToggleConsent(category.id)}
                    className="sr-only peer"
                  />
                  <div className={`
                    w-11 h-6 rounded-full peer
                    ${category.required 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300'
                    }
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full
                  `}></div>
                </label>
              </div>
              
              {category.cookies && category.cookies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Cookies used:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.cookies.map((cookie) => (
                      <span
                        key={cookie}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {cookie}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowDetails(false)}
              className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reject All Optional
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Preferences
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              By accepting cookies, you agree to our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for checking consent status in other components
export function useCookieConsent() {
  const [consents, setConsents] = useState(null)
  
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConsents(parsed.consents)
      } catch (e) {
        setConsents(null)
      }
    }
  }, [])
  
  const hasConsent = useCallback((category) => {
    if (!consents) return false
    return consents[category] === true
  }, [consents])
  
  const openPreferences = useCallback(() => {
    // Dispatch custom event to open preferences
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'))
  }, [])
  
  return { consents, hasConsent, openPreferences }
}
