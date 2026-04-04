// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react'

const CONSENT_STORAGE_KEY = 'kerfos_cookie_consent'

export default function PrivacySettings() {
  const [consents, setConsents] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    third_party: false
  })
  const [userData, setUserData] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)
  const [deleteStatus, setDeleteStatus] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [retentionPolicy, setRetentionPolicy] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    setLoading(true)
    try {
      // Load stored consent
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConsents(parsed.consents || consents)
      }
      
      // Load user data
      const userDataStr = localStorage.getItem('kerfos_user_data')
      if (userDataStr) {
        const user = JSON.parse(userDataStr)
        setUserData(user)
        
        // Fetch consent status from backend
        const consentRes = await fetch(`/api/gdpr/consent/${user.user_id}`)
        if (consentRes.ok) {
          const data = await consentRes.json()
          setConsents(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(data.consent_status).map(([k, v]) => [k, v.granted])
            )
          }))
        }
        
        // Fetch audit logs
        const auditRes = await fetch(`/api/gdpr/audit-logs/${user.user_id}?limit=20`)
        if (auditRes.ok) {
          const data = await auditRes.json()
          setAuditLogs(data.logs || [])
        }
      }
      
      // Fetch retention policy
      const retentionRes = await fetch('/api/gdpr/data-retention')
      if (retentionRes.ok) {
        const data = await retentionRes.json()
        setRetentionPolicy(data.policy)
      }
    } catch (e) {
      console.error('Failed to load privacy data:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConsent = async (category, value) => {
    if (category === 'essential') return
    
    const newConsents = { ...consents, [category]: value }
    setConsents(newConsents)
    
    if (userData?.user_id) {
      try {
        await fetch('/api/gdpr/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userData.user_id,
            consents: newConsents,
            confirm: true
          })
        })
        
        // Update local storage
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
          version: '1.0.0',
          consents: newConsents,
          timestamp: new Date().toISOString()
        }))
      } catch (e) {
        console.error('Failed to update consent:', e)
      }
    }
  }

  const handleExportData = async () => {
    if (!userData?.user_id) return
    
    setExportStatus('exporting')
    try {
      const response = await fetch('/api/gdpr/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id,
          email: userData.email,
          export_format: 'json'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setExportStatus('success')
        
        // Trigger download
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kerfos-data-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        setExportStatus('error')
      }
    } catch (e) {
      console.error('Export failed:', e)
      setExportStatus('error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!userData?.user_id || !showDeleteConfirm) return
    
    setDeleteStatus('deleting')
    try {
      const response = await fetch('/api/gdpr/data/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user_id,
          email: userData.email,
          reason: 'User requested deletion',
          confirm: true
        })
      })
      
      if (response.ok) {
        setDeleteStatus('success')
        // Clear local data
        localStorage.clear()
        // Redirect to home after delay
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        setDeleteStatus('error')
      }
    } catch (e) {
      console.error('Deletion failed:', e)
      setDeleteStatus('error')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your data and privacy preferences for KerfOS
          </p>
        </div>

        {/* Consent Preferences */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie & Consent Preferences</h2>
          
          <div className="space-y-4">
            {[
              { id: 'essential', name: 'Essential Cookies', desc: 'Required for the app to function', required: true },
              { id: 'analytics', name: 'Analytics', desc: 'Help us improve KerfOS', required: false },
              { id: 'marketing', name: 'Marketing', desc: 'Receive updates and offers', required: false },
              { id: 'third_party', name: 'Third-Party Services', desc: 'Integrations like Stripe', required: false }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents[item.id]}
                    disabled={item.required}
                    onChange={(e) => handleUpdateConsent(item.id, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`
                    w-11 h-6 rounded-full peer
                    ${item.required 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300'
                    }
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full
                  `}></div>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Data Export */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Your Data</h2>
          <p className="text-gray-600 mb-4">
            Download a copy of all your data stored in KerfOS (GDPR Article 20 - Right to Data Portability).
          </p>
          
          <button
            onClick={handleExportData}
            disabled={exportStatus === 'exporting' || !userData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {exportStatus === 'exporting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download My Data
              </>
            )}
          </button>
          
          {exportStatus === 'success' && (
            <p className="text-green-600 text-sm mt-2">✓ Data exported successfully!</p>
          )}
          {exportStatus === 'error' && (
            <p className="text-red-600 text-sm mt-2">✗ Export failed. Please try again.</p>
          )}
        </section>

        {/* Data Retention */}
        {retentionPolicy && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention Policy</h2>
            
            <div className="space-y-3">
              {Object.entries(retentionPolicy).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-500">
                    {value.retention_days} days
                    <span className="text-xs ml-2">({value.description})</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audit Logs */}
        {auditLogs.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-2">
              {auditLogs.slice(0, 10).map((log, index) => (
                <div key={index} className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Danger Zone */}
        <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Your Account</h2>
          <p className="text-gray-600 mb-4">
            Permanently delete your account and all associated data (GDPR Article 17 - Right to Erasure).
            This action cannot be undone after the 30-day recovery period.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete My Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-4">
                ⚠️ Are you sure? This will delete all your projects, cabinets, and data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteStatus === 'deleting'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg"
                >
                  {deleteStatus === 'deleting' ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </div>
          )}
          
          {deleteStatus === 'success' && (
            <p className="text-green-600 text-sm mt-2">
              ✓ Account deletion scheduled. Redirecting...
            </p>
          )}
        </section>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
          <span>•</span>
          <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>
          <span>•</span>
          <a href="/api/gdpr/dpa" className="text-blue-600 hover:underline">Data Processing Agreement</a>
        </div>
      </div>
    </div>
  )
}
