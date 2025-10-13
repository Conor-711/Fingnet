import { Link } from 'react-router-dom';
import logo from '@/assets/logo/logo.png';

const Privacy = () => {
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
            Privacy Policy
          </h1>
          <div className="max-w-4xl mx-auto text-left space-y-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-outfit font-bold text-gray-900 mb-4">
                📜 Fingnet Privacy Policy
              </h1>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Effective Date: October 2025</p>
                <p>Last Updated: October 2025</p>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Fingnet ("we," "our," or "us") provides a Chrome extension that helps users collect, organize, and explore text content from the web. We respect your privacy and are committed to being transparent about how we handle your data.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                By using Fingnet, you agree to the practices described in this policy.
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Fingnet is designed with a local-first, user-consent-based architecture.</p>
                  <p>You decide whether to keep your data on your device or sync it securely to the cloud.</p>
                  <p>We never sell, rent, or use your data for advertising purposes.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>
                <p className="text-gray-700 mb-4">Fingnet only collects the minimum information necessary to provide its features.</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">a) Data You Explicitly Save</h3>
                    <p className="text-gray-700 mb-3">When you highlight and save text through Fingnet, we store:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Selected sentence or text snippet</li>
                      <li>Source webpage URL</li>
                      <li>Timestamp of when it was saved</li>
                      <li>Any optional tags, notes, or collection labels you add</li>
                    </ul>
                    <p className="text-gray-700 mt-3">These are stored locally in your browser by default.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">b) Account Information (if you enable Cloud Sync)</h3>
                    <p className="text-gray-700 mb-3">If you choose to log in with Google for cloud synchronization, we collect:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Your Google account ID, name, and email (for authentication only)</li>
                      <li>Your saved sentences and metadata (URL, timestamp, tags)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">This data is stored securely in our cloud database (Supabase) and linked to your account.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">c) Optional AI Analysis Data (if you enable Smart Insights)</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>If you enable AI features, Fingnet may temporarily send only the selected text to third-party APIs (OpenAI or DeepSeek) for analysis.</p>
                      <p>No personal identifiers, email addresses, or browsing history are included.</p>
                      <p>These services process your data only to generate the requested insights.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">d) Usage Logs (minimal)</h3>
                    <p className="text-gray-700">We may collect basic, non-personal technical logs (e.g., error events, sync timestamps) to maintain functionality and diagnose issues. These logs contain no user-generated content.</p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <strong>Local Storage:</strong> All saved data is stored in your browser using Chrome's secure local storage.
                  </div>
                  <div>
                    <strong>Cloud Storage:</strong> When you enable Cloud Sync, your data is securely stored in Supabase under your account.
                  </div>
                  <div>
                    <strong>Encryption:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Data in transit: encrypted via HTTPS</li>
                      <li>Data at rest: protected by database access controls</li>
                    </ul>
                  </div>
                  <div>
                    <strong>No Third-Party Ads or Trackers:</strong> Fingnet does not use advertising, analytics, or fingerprinting technologies.
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Your Choices and Controls</h2>
                <p className="text-gray-700 mb-4">Fingnet gives you full control over how your data is handled.</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">a) Consent at First Use</h3>
                    <p className="text-gray-700 mb-3">When you first use Fingnet, you must choose between:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li><strong>Cloud Sync:</strong> Store your data in the cloud for cross-device access</li>
                      <li><strong>Local Only:</strong> Keep everything on your device</li>
                    </ul>
                    <p className="text-gray-700 mt-3">Until you make a choice, cloud synchronization remains paused.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">b) Switching Modes</h3>
                    <p className="text-gray-700">You can change your choice anytime in Settings. Switching to "Local Only" pauses all cloud sync and new data uploads.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">c) Data Access and Deletion</h3>
                    <p className="text-gray-700 mb-3">At any time, you can:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>View all stored data in your Fingnet library</li>
                      <li>Export your library as a file</li>
                      <li>Delete all cloud data (via the "Delete Cloud Data" button in Settings)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">If you delete your Fingnet account or disable Cloud Sync, your cloud data will be permanently deleted from Supabase within 30 days.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">d) AI Insights</h3>
                    <div className="space-y-2 text-gray-700">
                      <p>AI features are disabled by default.</p>
                      <p>When enabled, they only process text you explicitly select and submit.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Use the Data</h2>
                <p className="text-gray-700 mb-4">We use your data solely to deliver the features you choose to use:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                  <li>To save, organize, and display your collected text</li>
                  <li>To synchronize your data across devices (if enabled)</li>
                  <li>To generate optional content summaries or recommendations (if enabled)</li>
                  <li>To provide technical support and improve performance</li>
                </ul>
                
                <p className="text-gray-700 mb-2">We do not:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Sell or share your data with advertisers</li>
                  <li>Track your browsing history</li>
                  <li>Use your data for profiling or behavioral advertising</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing</h2>
                <p className="text-gray-700 mb-4">We do not share your personal or stored content with third parties, except:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                  <li>Supabase (for secure cloud data storage)</li>
                  <li>Google (for authentication via OAuth)</li>
                  <li>OpenAI / DeepSeek (for optional AI text analysis)</li>
                </ul>
                <div className="space-y-2 text-gray-700">
                  <p>Each of these providers processes data strictly under their privacy policies and only for functionality you have enabled.</p>
                  <p>We do not grant them permission to use your data for any other purpose.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
                <div className="space-y-2 text-gray-700">
                  <p>Fingnet is not designed for children under 13 years of age.</p>
                  <p>We do not knowingly collect personal information from children.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
                <div className="space-y-2 text-gray-700">
                  <p>Local data remains on your device until you delete the extension or clear your storage.</p>
                  <p>Cloud data remains stored while you have Cloud Sync enabled.</p>
                  <p>Upon account deletion, all cloud-stored data is erased within 30 days.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
                <div className="space-y-2 text-gray-700">
                  <p>If you use Cloud Sync, your data may be processed and stored on servers located outside your country.</p>
                  <p>We use reputable third-party providers (Supabase, Google) that comply with GDPR and international data protection standards.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Your Rights</h2>
                <p className="text-gray-700 mb-4">Depending on your jurisdiction, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-4">
                  <li>Access a copy of your data</li>
                  <li>Request correction or deletion</li>
                  <li>Withdraw consent to cloud sync or AI features</li>
                  <li>Lodge a complaint with your data protection authority</li>
                </ul>
                <p className="text-gray-700">To exercise these rights, contact us at <a href="mailto:zfy3712z@gmail.com" className="text-blue-600 hover:underline">zfy3712z@gmail.com</a>.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Updates to This Policy</h2>
                <div className="space-y-2 text-gray-700">
                  <p>We may occasionally update this Privacy Policy to reflect new features or legal requirements.</p>
                  <p>When we make changes, we will update the "Last Updated" date above and notify users via the extension or our website.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 mb-4">If you have any questions or concerns about this policy or how Fingnet handles your data, please contact:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Fingnet Team</p>
                  <p className="text-gray-700">Email: <a href="mailto:zfy3712z@gmail.com" className="text-blue-600 hover:underline">zfy3712z@gmail.com</a></p>
                  <p className="text-gray-700">Website: <a href="https://fingnet.xyz" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://fingnet.xyz</a></p>
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

export default Privacy;

