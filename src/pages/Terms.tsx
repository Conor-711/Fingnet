import { Link } from 'react-router-dom';
import logo from '@/assets/logo/logo.png';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="Fingnet Logo" 
              className="w-8 h-8 object-contain"
            />
            <div className="text-xl font-outfit text-gray-900">
              Fingnet
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-outfit font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>
          <div className="max-w-4xl mx-auto text-left space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-3xl font-outfit font-bold text-gray-900 mb-4">
                Fingnet Terms of Service
              </h2>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Effective Date: October 2025</p>
                <p>Last Updated: October 2025</p>
              </div>
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Welcome to Fingnet, a Chrome extension that helps you collect, organize, and explore meaningful sentences from the web.
                These Terms of Service ("Terms") govern your use of Fingnet ("the Service") operated by the Fingnet Team ("we," "our," or "us").
              </p>
              <p className="text-gray-700 leading-relaxed font-medium">
                By installing or using Fingnet, you agree to these Terms. If you do not agree, please do not use the Service.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Overview of the Service</h3>
                <p className="text-gray-700 mb-4">Fingnet allows users to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Save selected text from web pages</li>
                  <li>Organize and search collected sentences</li>
                  <li>Optionally sync data securely across devices</li>
                  <li>Optionally analyze saved text using AI integrations (OpenAI / DeepSeek)</li>
                  <li>Optionally explore shared content themes with other users</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  The Service is provided as-is to help you manage and explore knowledge efficiently, while maintaining full control over your data.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility</h3>
                <p className="text-gray-700">
                  You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use Fingnet.
                  By using Fingnet, you represent that you meet this requirement.
                </p>
              </section>

              {/* Section 3 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Authentication</h3>
                <p className="text-gray-700 mb-4">
                  Certain features, such as Cloud Sync, require signing in with a Google account.
                  By signing in, you authorize Fingnet to access your basic Google account information (name, email, profile image) for authentication only.
                </p>
                <p className="text-gray-700 mb-2">You are responsible for:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your credentials</li>
                  <li>Ensuring that your account is used in accordance with these Terms</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  We reserve the right to suspend or terminate accounts that violate these Terms or our Privacy Policy.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4. User Content</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">a. Ownership</h4>
                    <p className="text-gray-700">
                      All content you save or create within Fingnet ("User Content") — including text, tags, and notes — remains your property.
                      We do not claim ownership of your content.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">b. License to Operate the Service</h4>
                    <p className="text-gray-700 mb-4">
                      By saving or uploading content to Fingnet, you grant us a limited, non-exclusive, revocable license to store and process that content solely for the purpose of operating the Service, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Synchronizing data across your devices (if Cloud Sync is enabled)</li>
                      <li>Providing AI insights (if you manually trigger analysis)</li>
                      <li>Backing up data for recovery purposes</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      This license ends when you delete your account or data.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Data Storage and Security</h3>
                <p className="text-gray-700 mb-4">Fingnet offers two storage modes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Local Mode:</strong> All data is stored locally on your device and never leaves your browser.</li>
                  <li><strong>Cloud Sync:</strong> Your data is securely uploaded to our cloud database (Supabase) for cross-device access.</li>
                </ul>
                <p className="text-gray-700">
                  All data transmissions are encrypted via HTTPS.
                  We apply strict access controls and do not share your content with third parties except for the services necessary to operate Fingnet.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Optional Features</h3>
                <p className="text-gray-700 mb-4">Fingnet includes several optional, opt-in features:</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">a. Cloud Sync</h4>
                    <p className="text-gray-700">
                      Requires Google authentication. You can enable or disable Cloud Sync anytime in Settings.
                      When disabled, no new data is uploaded to the cloud.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">b. AI Insights</h4>
                    <p className="text-gray-700">
                      When enabled, selected text may be processed by third-party APIs (OpenAI or DeepSeek) to provide summaries or recommendations.
                      These features are disabled by default and only activate when you manually request them.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">c. Interactive Discovery</h4>
                    <p className="text-gray-700">
                      An optional feature allowing users to explore shared content themes with others who have opted in.
                      Participation is voluntary, and you can disable or delete connections at any time.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Acceptable Use</h3>
                <p className="text-gray-700 mb-4">You agree not to use Fingnet to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Violate any applicable law or regulation</li>
                  <li>Infringe intellectual property rights</li>
                  <li>Upload or distribute harmful, illegal, or abusive content</li>
                  <li>Attempt to gain unauthorized access to the Service or related systems</li>
                  <li>Reverse engineer, copy, or redistribute Fingnet for commercial purposes without permission</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  Violation of these rules may result in account suspension or termination.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h3>
                <p className="text-gray-700">
                  Fingnet, including its logo, codebase, design, and all associated materials, are the property of the Fingnet Team and protected by intellectual property laws.
                  You may not reproduce, modify, or distribute Fingnet except as permitted under open-source or fair-use terms.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h3>
                <p className="text-gray-700 mb-4">Fingnet integrates with trusted third-party providers to deliver functionality:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li><strong>Supabase</strong> - Cloud data storage</li>
                  <li><strong>Google</strong> - Account authentication</li>
                  <li><strong>OpenAI / DeepSeek</strong> - Optional AI text processing</li>
                </ul>
                <p className="text-gray-700">
                  By enabling related features, you agree to their respective privacy policies and terms of service.
                  We are not responsible for any third-party service outages or policy changes.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">10. Privacy</h3>
                <p className="text-gray-700">
                  Your use of Fingnet is also governed by our{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </Link>
                  . The Privacy Policy explains in detail what data we collect, how we process it, and how you can control it.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h3>
                <p className="text-gray-700 mb-4">
                  You may stop using Fingnet at any time by uninstalling the extension or deleting your account.
                  We may suspend or terminate your access if you:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Breach these Terms</li>
                  <li>Misuse the Service</li>
                  <li>Engage in behavior that harms other users or the platform</li>
                </ul>
                <p className="text-gray-700">
                  Upon termination, we may delete your associated cloud data according to our retention policy.
                </p>
              </section>

              {/* Section 12 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">12. Disclaimer of Warranties</h3>
                <p className="text-gray-700">
                  Fingnet is provided "as is" and "as available" without warranties of any kind, express or implied.
                  We do not guarantee uninterrupted or error-free operation, nor the accuracy of AI-generated insights.
                </p>
                <p className="text-gray-700 mt-4">
                  To the maximum extent permitted by law, we disclaim all implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </section>

              {/* Section 13 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">13. Limitation of Liability</h3>
                <p className="text-gray-700 mb-4">
                  To the fullest extent permitted by law, Fingnet and its developers shall not be liable for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                  <li>Any indirect, incidental, consequential, or punitive damages</li>
                  <li>Any loss of data, profits, or business arising from your use of the Service</li>
                </ul>
                <p className="text-gray-700">
                  In all cases, Fingnet's total liability shall not exceed the amount (if any) you paid for the Service — which is typically $0 (free).
                </p>
              </section>

              {/* Section 14 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">14. Changes to the Service</h3>
                <p className="text-gray-700">
                  We may modify, update, or discontinue parts of Fingnet at any time, including adding or removing features, to improve functionality or comply with new policies.
                  Major changes will be announced via our website or extension updates.
                </p>
              </section>

              {/* Section 15 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">15. Changes to These Terms</h3>
                <p className="text-gray-700">
                  We may revise these Terms periodically to reflect new features or legal requirements.
                  When changes occur, the updated version will be posted on our website with a revised "Last Updated" date.
                  Continued use after an update means you accept the revised Terms.
                </p>
              </section>

              {/* Section 16 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">16. Governing Law</h3>
                <p className="text-gray-700">
                  These Terms are governed by and construed in accordance with the laws of Singapore, without regard to its conflict of law principles.
                  You agree that any disputes shall be resolved in competent courts located in Singapore.
                </p>
              </section>

              {/* Section 17 */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">17. Contact Us</h3>
                <p className="text-gray-700 mb-4">For questions about these Terms or the Service, please contact:</p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 font-medium mb-2">Fingnet Team</p>
                  <p className="text-gray-700 mb-2">
                    Email: <a href="mailto:zfy3712z@gmail.com" className="text-blue-600 hover:text-blue-800 underline">zfy3712z@gmail.com</a>
                  </p>
                  <p className="text-gray-700">
                    Website: <a href="https://fingnet.xyz" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://fingnet.xyz</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Terms;

