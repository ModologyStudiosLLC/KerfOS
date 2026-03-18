import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Cookie, BarChart3, Mail, ExternalLink, X, Check, Settings } from 'lucide-react';

// Types
interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  third_party: boolean;
}

interface CookieCategory {
  id: keyof ConsentPreferences;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  cookies: { name: string; purpose: string; duration: string }[];
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the app to function properly. Cannot be disabled.',
    icon: <Shield className="w-5 h-5" />,
    required: true,
    cookies: [
      { name: 'session', purpose: 'Maintains your login session', duration: '24 hours' },
      { name: 'preferences', purpose: 'Stores your preferences (units, theme)', duration: '1 year' },
      { name: 'csrf_token', purpose: 'Prevents cross-site request forgery', duration: 'Session' },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us improve by tracking usage patterns anonymously.',
    icon: <BarChart3 className="w-5 h-5" />,
    required: false,
    cookies: [
      { name: '_ga', purpose: 'Distinguishes users (Google Analytics)', duration: '2 years' },
      { name: '_gid', purpose: 'Distinguishes users (Google Analytics)', duration: '24 hours' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Allow us to send you updates about new features and offers.',
    icon: <Mail className="w-5 h-5" />,
    required: false,
    cookies: [
      { name: 'marketing_opt_in', purpose: 'Tracks marketing consent', duration: '1 year' },
    ],
  },
  {
    id: 'third_party',
    name: 'Third-Party Cookies',
    description: 'Used by integrated services like Stripe for payments.',
    icon: <ExternalLink className="w-5 h-5" />,
    required: false,
    cookies: [
      { name: 'stripe_csrf', purpose: 'Stripe payment security', duration: 'Session' },
    ],
  },
];

// Storage key for consent
const CONSENT_STORAGE_KEY = 'kerfos_consent';

// Default consent (only essential enabled)
const defaultConsent: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  third_party: false,
};

// Cookie Consent Banner Component
export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentPreferences>(defaultConsent);

  useEffect(() => {
    // Check if consent already given
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(async () => {
    const allAccepted: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      third_party: true,
    };
    
    await saveConsent(allAccepted);
    setShowBanner(false);
  }, []);

  const handleRejectNonEssential = useCallback(async () => {
    await saveConsent(defaultConsent);
    setShowBanner(false);
  }, []);

  const handleSavePreferences = useCallback(async () => {
    await saveConsent(consent);
    setShowBanner(false);
  }, [consent]);

  const saveConsent = async (preferences: ConsentPreferences) => {
    // Save to localStorage
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
      preferences,
      timestamp: new Date().toISOString(),
    }));

    // Send to backend
    try {
      const userId = localStorage.getItem('kerfos_user_id') || 'anonymous';
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          consents: preferences,
          confirm: true,
        }),
      });
    } catch (error) {
      console.error('Failed to save consent to backend:', error);
    }

    // Apply consent settings
    applyConsentSettings(preferences);
  };

  const applyConsentSettings = (preferences: ConsentPreferences) => {
    // In a real app, this would enable/disable tracking scripts
    if (preferences.analytics) {
      // Enable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
    
    if (preferences.marketing) {
      // Enable marketing tracking
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowBanner(false)} />
      
      {/* Banner */}
      <div className="relative bg-white border-t border-gray-200 shadow-2xl">
        {!showDetails ? (
          // Simple Banner
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">
                    We use cookies to enhance your experience
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    We use essential cookies to make KerfOS work, and optional cookies to improve our service.
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <button
                      onClick={() => setShowDetails(true)}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Customize
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Detailed View
          <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Choose which cookies you want to accept. Essential cookies are required for the app to function.
            </p>

            <div className="space-y-4">
              {cookieCategories.map((category) => (
                <div
                  key={category.id}
                  className={`border rounded-lg p-4 ${
                    consent[category.id] ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${consent[category.id] ? 'text-blue-600' : 'text-gray-400'}`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent[category.id]}
                        disabled={category.required}
                        onChange={(e) => setConsent({ ...consent, [category.id]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer ${
                        category.required
                          ? 'bg-blue-600 cursor-not-allowed'
                          : 'bg-gray-200 peer-checked:bg-blue-600'
                      } peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors`}>
                        <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${
                          consent[category.id] ? 'translate-x-full' : ''
                        }`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Cookies list */}
                  <div className="mt-4 pl-12">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="pb-2">Cookie</th>
                          <th className="pb-2">Purpose</th>
                          <th className="pb-2 text-right">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.cookies.map((cookie) => (
                          <tr key={cookie.name} className="text-gray-700">
                            <td className="py-1 font-mono text-xs">{cookie.name}</td>
                            <td className="py-1 px-2">{cookie.purpose}</td>
                            <td className="py-1 text-right text-gray-500">{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </a>
                {' · '}
                <a href="/cookies" className="text-blue-600 hover:text-blue-700">
                  Cookie Policy
                </a>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Privacy Settings Component (for Settings page)
export const PrivacySettings: React.FC = () => {
  const [consent, setConsent] = useState<ConsentPreferences>(defaultConsent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current consent
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedConsent) {
      setConsent(JSON.parse(storedConsent).preferences);
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = localStorage.getItem('kerfos_user_id') || 'anonymous';
      await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          consents: consent,
          confirm: true,
        }),
      });

      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        preferences: consent,
        timestamp: new Date().toISOString(),
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save consent:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
      </div>

      <div className="space-y-4">
        {cookieCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={consent[category.id] ? 'text-blue-600' : 'text-gray-400'}>
                {category.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent[category.id]}
                disabled={category.required}
                onChange={(e) => setConsent({ ...consent, [category.id]: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer ${
                category.required
                  ? 'bg-blue-600 cursor-not-allowed'
                  : 'bg-gray-200 peer-checked:bg-blue-600'
              } peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors`}>
                <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${
                  consent[category.id] ? 'translate-x-full' : ''
                }`}></div>
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <a href="/privacy" className="text-sm text-blue-600 hover:text-blue-700">
          View Privacy Policy
        </a>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
        >
          {saving ? (
            <>Saving...</>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Data Export Component
export const DataExportPanel: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const userId = localStorage.getItem('kerfos_user_id') || 'anonymous';
      const response = await fetch('/api/gdpr/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          email: localStorage.getItem('kerfos_user_email') || '',
          export_format: 'json',
        }),
      });

      const data = await response.json();
      if (data.download_url) {
        setDownloadUrl(data.download_url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Data</h3>
      <p className="text-gray-600 mb-4">
        Download a copy of all your data in JSON format. This includes your projects, cabinets, materials, and settings.
      </p>
      
      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Check className="w-4 h-4" />
          Download Export
        </a>
      ) : (
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export Data'}
        </button>
      )}
    </div>
  );
};

// Data Deletion Component
export const DataDeletionPanel: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    setDeleting(true);
    try {
      const userId = localStorage.getItem('kerfos_user_id') || 'anonymous';
      const response = await fetch('/api/gdpr/data/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          email: localStorage.getItem('kerfos_user_email') || '',
          confirm: true,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setDeleted(true);
        localStorage.clear();
      }
    } catch (error) {
      console.error('Deletion failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Account Deleted</h3>
        <p className="text-green-700">
          Your data has been scheduled for deletion. You have 30 days to recover your account by contacting support.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-red-900 mb-4">Delete Your Data</h3>
      <p className="text-red-700 mb-4">
        This will permanently delete all your data including projects, cabinets, and settings. This action cannot be undone.
      </p>
      
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
        >
          Delete My Data
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-red-800">
            Type <strong>DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="DELETE"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Combined Privacy Dashboard
export const PrivacyDashboard: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
        <p className="text-gray-600 mt-1">Manage your data and privacy settings</p>
      </div>

      <PrivacySettings />
      <DataExportPanel />
      <DataDeletionPanel />

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rights (GDPR)</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
          <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
          <li><strong>Right to Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          For any privacy concerns, contact us at{' '}
          <a href="mailto:privacy@kerfos.com" className="text-blue-600 hover:text-blue-700">
            privacy@kerfos.com
          </a>
        </p>
      </div>
    </div>
  );
};

// Add gtag type for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
