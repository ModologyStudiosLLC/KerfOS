'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GDPRPage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (action: string) => {
    if (!userId || !email) {
      setError('Please enter both User ID and Email')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      let response
      
      switch (action) {
        case 'access':
          response = await fetch(`/api/gdpr/data/access/${userId}`)
          break
        case 'export':
          response = await fetch('/api/gdpr/data/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, email, export_format: 'json' }),
          })
          break
        case 'delete':
          response = await fetch('/api/gdpr/data/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, email, confirm: true }),
          })
          break
        case 'consent':
          response = await fetch(`/api/gdpr/consent/${userId}`)
          break
        case 'audit':
          response = await fetch(`/api/gdpr/audit-logs/${userId}`)
          break
        default:
          throw new Error('Unknown action')
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed')
      }
      
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GDPR Data Rights</h1>
          <p className="text-gray-600 mb-8">
            Exercise your data protection rights under the General Data Protection Regulation (GDPR).
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">📋 Right to Access</h3>
              <p className="text-sm text-blue-700 mt-1">See what data we hold about you</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">📤 Right to Export</h3>
              <p className="text-sm text-green-700 mt-1">Download your data in a portable format</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-900">🗑️ Right to Delete</h3>
              <p className="text-sm text-red-700 mt-1">Request erasure of your personal data</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user_123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSubmit('access')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '📋 Access My Data'}
              </button>
              <button
                onClick={() => handleSubmit('export')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '📤 Export My Data'}
              </button>
              <button
                onClick={() => handleSubmit('consent')}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '⚙️ View Consent'}
              </button>
              <button
                onClick={() => handleSubmit('audit')}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '📜 Audit Logs'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete your data? This action cannot be undone during the 30-day recovery period.')) {
                    handleSubmit('delete')
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🗑️ Delete My Data'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Response:</h3>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Links */}
          <div className="mt-8 pt-6 border-t flex gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
