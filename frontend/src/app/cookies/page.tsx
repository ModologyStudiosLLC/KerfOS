import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy | KerfOS',
  description: 'KerfOS cookie policy - How we use cookies on our website.',
}

export default async function CookiesPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/gdpr/cookie-policy`, {
    cache: 'no-store',
  })
  const policy = await response.json()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{policy.title}</h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {policy.last_updated} | Version {policy.version}
          </p>

          <div className="prose prose-blue max-w-none">
            {/* Introduction */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-yellow-800">
                This policy explains how we use cookies and similar technologies on KerfOS.
                You can manage your cookie preferences at any time through our{' '}
                <Link href="/gdpr" className="underline">GDPR settings</Link>.
              </p>
            </div>

            {/* Cookie Table */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies We Use</h2>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Can Disable</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policy.cookies?.map((cookie: {
                    name: string
                    type: string
                    purpose: string
                    duration: string
                    can_disable: boolean
                  }, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{cookie.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          cookie.type === 'essential' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {cookie.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cookie.purpose}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cookie.duration}</td>
                      <td className="px-4 py-3 text-sm">
                        {cookie.can_disable ? (
                          <span className="text-green-600">✓ Yes</span>
                        ) : (
                          <span className="text-red-600">✗ No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cookie Categories */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie Categories</h2>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">Essential Cookies</h3>
                <p className="text-sm text-blue-700 mt-1">
                  These cookies are necessary for the website to function and cannot be switched off.
                  They include session cookies, authentication tokens, and security cookies.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900">Analytics Cookies</h3>
                <p className="text-sm text-green-700 mt-1">
                  These cookies help us understand how visitors interact with our website by collecting
                  and reporting information anonymously. You can opt out of these cookies.
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900">Marketing Cookies</h3>
                <p className="text-sm text-purple-700 mt-1">
                  These cookies are used to track visitors across websites for advertising purposes.
                  They are not used on KerfOS at this time.
                </p>
              </div>
            </div>

            {/* Managing Cookies */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-4">
              You can manage your cookie preferences in the following ways:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-8">
              <li>Use our <Link href="/gdpr" className="text-blue-600 hover:underline">cookie consent manager</Link></li>
              <li>Clear cookies in your browser settings</li>
              <li>Use browser extensions to block specific cookies</li>
              <li>Use incognito/private browsing mode</li>
            </ul>

            {/* Links */}
            <div className="border-t pt-6 flex gap-4 text-sm">
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              <Link href="/gdpr" className="text-blue-600 hover:underline">GDPR Rights</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
