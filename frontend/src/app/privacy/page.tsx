import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | KerfOS',
  description: 'KerfOS privacy policy - How we collect, use, and protect your data.',
}

export default async function PrivacyPage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/gdpr/privacy-policy`, {
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
            {/* Summary */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Summary</h2>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium text-blue-900">Data Controller:</dt>
                  <dd className="text-blue-700">{policy.summary?.data_controller}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-blue-900">Contact:</dt>
                  <dd className="text-blue-700">{policy.summary?.contact_email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-blue-900">Data Protection Officer:</dt>
                  <dd className="text-blue-700">{policy.summary?.dpo_email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-blue-900">GDPR Compliant:</dt>
                  <dd className="text-blue-700">{policy.summary?.gdpr_compliant ? '✓ Yes' : '✗ No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-blue-900">CCPA Compliant:</dt>
                  <dd className="text-blue-700">{policy.summary?.ccpa_compliant ? '✓ Yes' : '✗ No'}</dd>
                </div>
              </dl>
            </div>

            {/* Sections */}
            {policy.sections?.map((section: { title: string; content: string }, index: number) => (
              <div key={index} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}

            {/* Your Rights */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to access your data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to correct your data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to delete your data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to export your data
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to withdraw consent
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Right to object to processing
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this privacy policy or our data practices, 
                please contact us at:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {policy.summary?.contact_email || 'privacy@kerfos.com'}</p>
                <p><strong>Data Protection Officer:</strong> {policy.summary?.dpo_email || 'dpo@kerfos.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
