import React from 'react';
import { Shield, FileText, Cookie, ArrowLeft, Mail, Globe, Lock, Clock, Database, Eye, Trash2, Download } from 'lucide-react';

// Privacy Policy Page
export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </a>

      <div className="prose prose-gray max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 m-0">Privacy Policy</h1>
        </div>

        <p className="text-gray-500 mb-8">
          Last updated: March 17, 2026 · Version 1.0.0
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Who We Are</h2>
          <p>
            KerfOS is a cabinet design software platform operated by KerfOS. Our contact details are:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Email: <a href="mailto:privacy@kerfos.com" className="text-blue-600">privacy@kerfos.com</a></li>
            <li>Data Protection Officer: <a href="mailto:dpo@kerfos.com" className="text-blue-600">dpo@kerfos.com</a></li>
            <li>Website: <a href="https://kerfos.com" className="text-blue-600">kerfos.com</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Account Data</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Name and email address</li>
                <li>Account preferences</li>
                <li>Login history</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Project Data</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Cabinet designs</li>
                <li>Cut lists and materials</li>
                <li>Templates and presets</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Usage Data</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Feature usage (with consent)</li>
                <li>Performance metrics</li>
                <li>Error logs</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Payment Data</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Processed by Stripe</li>
                <li>Subscription status</li>
                <li>Payment history</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Provide Services:</strong> Store your cabinet designs, generate cut lists, sync across devices</li>
            <li><strong>Process Payments:</strong> Handle subscriptions via Stripe</li>
            <li><strong>Improve Our Service:</strong> Analyze usage patterns (with your consent)</li>
            <li><strong>Communicate:</strong> Send account updates, support responses</li>
            <li><strong>Protect Your Account:</strong> Detect fraud, secure login</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contract:</strong> To provide the services you signed up for</li>
            <li><strong>Consent:</strong> For analytics and marketing communications</li>
            <li><strong>Legitimate Interest:</strong> To improve our service and prevent fraud</li>
            <li><strong>Legal Obligation:</strong> To comply with tax and regulatory requirements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
          <p>We share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" className="text-blue-600">Stripe Privacy Policy</a>)</li>
            <li><strong>Railway:</strong> Cloud hosting and database services</li>
            <li><strong>Analytics Providers:</strong> Only with your consent</li>
          </ul>
          <p className="mt-4 text-red-600 font-medium">We never sell your personal data.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Right to Access</h4>
                <p className="text-sm text-gray-600">Get a copy of your personal data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Right to Rectification</h4>
                <p className="text-sm text-gray-600">Correct inaccurate data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Trash2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Right to Erasure</h4>
                <p className="text-sm text-gray-600">Delete your personal data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Right to Portability</h4>
                <p className="text-sm text-gray-600">Export data in machine-readable format</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Data Type</th>
                  <th className="text-left py-2">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Account & Project Data</td>
                  <td className="py-2">2 years after account closure</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Audit Logs</td>
                  <td className="py-2">1 year</td>
                </tr>
                <tr>
                  <td className="py-2">Deleted Data</td>
                  <td className="py-2">30-day recovery period</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Encryption at rest (AES-256) and in transit (TLS 1.3)</li>
            <li>Regular security audits and penetration testing</li>
            <li>Role-based access controls</li>
            <li>Audit logging for all data access</li>
            <li>CSRF and XSS protection</li>
            <li>Rate limiting to prevent abuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
          <p>
            Your data may be processed in the United States. We use standard contractual clauses (SCCs) 
            and other appropriate safeguards for transfers outside the EEA.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We'll notify you of any material changes via email 
            or in-app notification. Continued use of KerfOS after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p>
            For any privacy-related questions or to exercise your rights, contact us at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Data Protection Officer</p>
            <p>Email: <a href="mailto:dpo@kerfos.com" className="text-blue-600">dpo@kerfos.com</a></p>
            <p className="mt-2 text-sm text-gray-600">
              You also have the right to lodge a complaint with your local data protection authority.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

// Terms of Service Page
export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </a>

      <div className="prose prose-gray max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 m-0">Terms of Service</h1>
        </div>

        <p className="text-gray-500 mb-8">
          Last updated: March 17, 2026 · Version 1.0.0
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using KerfOS ("the Service"), you agree to be bound by these Terms of Service 
            and our Privacy Policy. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
          <p>
            KerfOS provides cabinet design software for woodworkers and DIY enthusiasts. The Service includes:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>Cabinet design and visualization tools</li>
            <li>Cut list optimization</li>
            <li>Material and hardware tracking</li>
            <li>Project templates and sharing</li>
            <li>3D export capabilities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>You must be at least 13 years old to use the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Subscription & Payments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Subscriptions are billed monthly or annually in advance</li>
            <li>Prices may change with 30 days notice</li>
            <li>You may cancel your subscription at any time</li>
            <li>No refunds for partial subscription periods</li>
            <li>Payments are processed securely by Stripe</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Your Content</h4>
            <p className="text-sm text-gray-600">
              You retain all rights to your cabinet designs, projects, and other content you create. 
              By using the Service, you grant KerfOS a limited license to store and display your content 
              as part of the Service.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Our Content</h4>
            <p className="text-sm text-gray-600">
              The KerfOS software, templates, and platform are owned by KerfOS. You may not copy, 
              modify, or distribute our software without permission.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Use the Service for illegal purposes</li>
            <li>Attempt to reverse engineer or hack the Service</li>
            <li>Upload malicious content or code</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers</h2>
          <p>
            KerfOS is provided "as is" without warranties of any kind. We do not guarantee that:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>The Service will be uninterrupted or error-free</li>
            <li>Your data will always be available</li>
            <li>Cut lists and calculations will be 100% accurate</li>
          </ul>
          <p className="mt-4">
            Always verify measurements and calculations before cutting materials. KerfOS is a design tool, 
            not a substitute for proper measurement and verification.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, KerfOS shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Termination</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You may delete your account at any time through the app or by contacting us</li>
            <li>We may suspend or terminate accounts that violate these Terms</li>
            <li>Upon termination, your right to use the Service ceases immediately</li>
            <li>We will retain your data for the period specified in our Privacy Policy</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States. Any disputes shall be resolved 
            in the courts of the applicable jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p>For questions about these Terms:</p>
            <p className="mt-2">Email: <a href="mailto:legal@kerfos.com" className="text-blue-600">legal@kerfos.com</a></p>
          </div>
        </section>
      </div>
    </div>
  );
};

// Cookie Policy Page
export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to App
      </a>

      <div className="prose prose-gray max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 m-0">Cookie Policy</h1>
        </div>

        <p className="text-gray-500 mb-8">
          Last updated: March 17, 2026 · Version 1.0.0
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help us 
            provide a better experience by remembering your preferences and understanding how you use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
          
          <div className="space-y-4">
            {/* Essential Cookies */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">Essential Cookies</h3>
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Required</span>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                These cookies are necessary for the app to function. They cannot be disabled.
              </p>
              <table className="w-full text-sm bg-white rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">session</td>
                    <td className="p-2">Maintains your login session</td>
                    <td className="p-2">24 hours</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">preferences</td>
                    <td className="p-2">Stores your preferences (units, theme)</td>
                    <td className="p-2">1 year</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">csrf_token</td>
                    <td className="p-2">Prevents cross-site request forgery</td>
                    <td className="p-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Help us understand how you use KerfOS so we can improve our service.
              </p>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">_ga</td>
                    <td className="p-2">Google Analytics - distinguishes users</td>
                    <td className="p-2">2 years</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">_gid</td>
                    <td className="p-2">Google Analytics - distinguishes users</td>
                    <td className="p-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Allow us to send you relevant updates about new features and offers.
              </p>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">marketing_opt_in</td>
                    <td className="p-2">Tracks marketing consent</td>
                    <td className="p-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Third-Party Cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Third-Party Cookies</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Set by integrated services like Stripe for payment processing.
              </p>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Cookie</th>
                    <th className="text-left p-2">Purpose</th>
                    <th className="text-left p-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-mono text-xs">stripe_csrf</td>
                    <td className="p-2">Stripe payment security</td>
                    <td className="p-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p>
            You can manage your cookie preferences at any time through our Cookie Consent Banner or in your 
            Account Settings. You can also configure your browser to block cookies, but this may affect 
            the functionality of KerfOS.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Browser Settings</p>
            <p className="text-sm text-gray-600 mt-1">
              Most browsers allow you to manage cookie settings. Here are links for popular browsers:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600" target="_blank" rel="noopener">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-blue-600" target="_blank" rel="noopener">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-blue-600" target="_blank" rel="noopener">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-blue-600" target="_blank" rel="noopener">Microsoft Edge</a></li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p>
            For questions about our use of cookies, contact us at:{' '}
            <a href="mailto:privacy@kerfos.com" className="text-blue-600">privacy@kerfos.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};
