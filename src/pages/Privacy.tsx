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
          <p className="text-lg text-gray-600">
          📜 Fingnet Privacy Policy

Effective Date: October 2025
Last Updated: October 2025

Fingnet (“we,” “our,” or “us”) provides a Chrome extension that helps users collect, organize, and explore text content from the web.
We respect your privacy and are committed to being transparent about how we handle your data.

By using Fingnet, you agree to the practices described in this policy.

1. Overview

Fingnet is designed with a local-first, user-consent-based architecture.
You decide whether to keep your data on your device or sync it securely to the cloud.
We never sell, rent, or use your data for advertising purposes.

2. Data We Collect

Fingnet only collects the minimum information necessary to provide its features.

a) Data You Explicitly Save

When you highlight and save text through Fingnet, we store:

Selected sentence or text snippet

Source webpage URL

Timestamp of when it was saved

Any optional tags, notes, or collection labels you add

These are stored locally in your browser by default.

b) Account Information (if you enable Cloud Sync)

If you choose to log in with Google for cloud synchronization, we collect:

Your Google account ID, name, and email (for authentication only)

Your saved sentences and metadata (URL, timestamp, tags)

This data is stored securely in our cloud database (Supabase) and linked to your account.

c) Optional AI Analysis Data (if you enable Smart Insights)

If you enable AI features, Fingnet may temporarily send only the selected text to third-party APIs (OpenAI or DeepSeek) for analysis.
No personal identifiers, email addresses, or browsing history are included.
These services process your data only to generate the requested insights.

d) Usage Logs (minimal)

We may collect basic, non-personal technical logs (e.g., error events, sync timestamps) to maintain functionality and diagnose issues.
These logs contain no user-generated content.

3. Data Storage and Security

Local Storage: All saved data is stored in your browser using Chrome’s secure local storage.

Cloud Storage: When you enable Cloud Sync, your data is securely stored in Supabase under your account.

Encryption:

Data in transit: encrypted via HTTPS.

Data at rest: protected by database access controls.

No Third-Party Ads or Trackers: Fingnet does not use advertising, analytics, or fingerprinting technologies.

4. Your Choices and Controls

Fingnet gives you full control over how your data is handled.

a) Consent at First Use

When you first use Fingnet, you must choose between:

Cloud Sync: Store your data in the cloud for cross-device access

Local Only: Keep everything on your device

Until you make a choice, cloud synchronization remains paused.

b) Switching Modes

You can change your choice anytime in Settings.
Switching to “Local Only” pauses all cloud sync and new data uploads.

c) Data Access and Deletion

At any time, you can:

View all stored data in your Fingnet library

Export your library as a file

Delete all cloud data (via the “Delete Cloud Data” button in Settings)

If you delete your Fingnet account or disable Cloud Sync, your cloud data will be permanently deleted from Supabase within 30 days.

d) AI Insights

AI features are disabled by default.
When enabled, they only process text you explicitly select and submit.

5. How We Use the Data

We use your data solely to deliver the features you choose to use:

To save, organize, and display your collected text

To synchronize your data across devices (if enabled)

To generate optional content summaries or recommendations (if enabled)

To provide technical support and improve performance

We do not:

Sell or share your data with advertisers

Track your browsing history

Use your data for profiling or behavioral advertising

6. Data Sharing

We do not share your personal or stored content with third parties, except:

Supabase (for secure cloud data storage)

Google (for authentication via OAuth)

OpenAI / DeepSeek (for optional AI text analysis)

Each of these providers processes data strictly under their privacy policies and only for functionality you have enabled.

We do not grant them permission to use your data for any other purpose.

7. Children's Privacy

Fingnet is not designed for children under 13 years of age.
We do not knowingly collect personal information from children.

8. Data Retention

Local data remains on your device until you delete the extension or clear your storage.

Cloud data remains stored while you have Cloud Sync enabled.

Upon account deletion, all cloud-stored data is erased within 30 days.

9. International Data Transfers

If you use Cloud Sync, your data may be processed and stored on servers located outside your country.
We use reputable third-party providers (Supabase, Google) that comply with GDPR and international data protection standards.

10. Your Rights

Depending on your jurisdiction, you may have the right to:

Access a copy of your data

Request correction or deletion

Withdraw consent to cloud sync or AI features

Lodge a complaint with your data protection authority

To exercise these rights, contact us at zfy3712z@gmail.com
.

11. Updates to This Policy

We may occasionally update this Privacy Policy to reflect new features or legal requirements.
When we make changes, we will update the “Last Updated” date above and notify users via the extension or our website.

12. Contact Us

If you have any questions or concerns about this policy or how Fingnet handles your data, please contact:

Fingnet Team
Email: zfy3712z@gmail.com

Website: https://fingnet.xyz
          </p>
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

