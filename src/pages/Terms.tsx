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
          <p className="text-lg text-gray-600">
          📄 Fingnet Terms of Service

Effective Date: October 2025
Last Updated: October 2025

Welcome to Fingnet, a Chrome extension that helps you collect, organize, and explore meaningful sentences from the web.
These Terms of Service (“Terms”) govern your use of Fingnet (“the Service”) operated by the Fingnet Team (“we,” “our,” or “us”).

By installing or using Fingnet, you agree to these Terms.
If you do not agree, please do not use the Service.

1. Overview of the Service

Fingnet allows users to:

Save selected text from web pages

Organize and search collected sentences

Optionally sync data securely across devices

Optionally analyze saved text using AI integrations (OpenAI / DeepSeek)

Optionally explore shared content themes with other users

The Service is provided as-is to help you manage and explore knowledge efficiently, while maintaining full control over your data.

2. Eligibility

You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use Fingnet.
By using Fingnet, you represent that you meet this requirement.

3. User Accounts and Authentication

Certain features, such as Cloud Sync, require signing in with a Google account.
By signing in, you authorize Fingnet to access your basic Google account information (name, email, profile image) for authentication only.

You are responsible for:

Maintaining the confidentiality of your credentials

Ensuring that your account is used in accordance with these Terms

We reserve the right to suspend or terminate accounts that violate these Terms or our Privacy Policy.

4. User Content
a. Ownership

All content you save or create within Fingnet ("User Content") — including text, tags, and notes — remains your property.
We do not claim ownership of your content.

b. License to Operate the Service

By saving or uploading content to Fingnet, you grant us a limited, non-exclusive, revocable license to store and process that content solely for the purpose of operating the Service, including:

Synchronizing data across your devices (if Cloud Sync is enabled)

Providing AI insights (if you manually trigger analysis)

Backing up data for recovery purposes

This license ends when you delete your account or data.

5. Data Storage and Security

Fingnet offers two storage modes:

Local Mode: All data is stored locally on your device and never leaves your browser.

Cloud Sync: Your data is securely uploaded to our cloud database (Supabase) for cross-device access.

All data transmissions are encrypted via HTTPS.
We apply strict access controls and do not share your content with third parties except for the services necessary to operate Fingnet.

6. Optional Features

Fingnet includes several optional, opt-in features:

a. Cloud Sync

Requires Google authentication.
You can enable or disable Cloud Sync anytime in Settings.
When disabled, no new data is uploaded to the cloud.

b. AI Insights

When enabled, selected text may be processed by third-party APIs (OpenAI or DeepSeek) to provide summaries or recommendations.
These features are disabled by default and only activate when you manually request them.

c. Interactive Discovery

An optional feature allowing users to explore shared content themes with others who have opted in.
Participation is voluntary, and you can disable or delete connections at any time.

7. Acceptable Use

You agree not to use Fingnet to:

Violate any applicable law or regulation

Infringe intellectual property rights

Upload or distribute harmful, illegal, or abusive content

Attempt to gain unauthorized access to the Service or related systems

Reverse engineer, copy, or redistribute Fingnet for commercial purposes without permission

Violation of these rules may result in account suspension or termination.

8. Intellectual Property

Fingnet, including its logo, codebase, design, and all associated materials, are the property of the Fingnet Team and protected by intellectual property laws.
You may not reproduce, modify, or distribute Fingnet except as permitted under open-source or fair-use terms.

9. Third-Party Services

Fingnet integrates with trusted third-party providers to deliver functionality:

Supabase - Cloud data storage

Google - Account authentication

OpenAI / DeepSeek - Optional AI text processing

By enabling related features, you agree to their respective privacy policies and terms of service.
We are not responsible for any third-party service outages or policy changes.

10. Privacy

Your use of Fingnet is also governed by our Privacy Policy
.
The Privacy Policy explains in detail what data we collect, how we process it, and how you can control it.

11. Termination

You may stop using Fingnet at any time by uninstalling the extension or deleting your account.
We may suspend or terminate your access if you:

Breach these Terms

Misuse the Service

Engage in behavior that harms other users or the platform

Upon termination, we may delete your associated cloud data according to our retention policy.

12. Disclaimer of Warranties

Fingnet is provided "as is" and "as available" without warranties of any kind, express or implied.
We do not guarantee uninterrupted or error-free operation, nor the accuracy of AI-generated insights.

To the maximum extent permitted by law, we disclaim all implied warranties of merchantability, fitness for a particular purpose, and non-infringement.

13. Limitation of Liability

To the fullest extent permitted by law, Fingnet and its developers shall not be liable for:

Any indirect, incidental, consequential, or punitive damages

Any loss of data, profits, or business arising from your use of the Service

In all cases, Fingnet's total liability shall not exceed the amount (if any) you paid for the Service — which is typically $0 (free).

14. Changes to the Service

We may modify, update, or discontinue parts of Fingnet at any time, including adding or removing features, to improve functionality or comply with new policies.
Major changes will be announced via our website or extension updates.

15. Changes to These Terms

We may revise these Terms periodically to reflect new features or legal requirements.
When changes occur, the updated version will be posted on our website with a revised "Last Updated" date.
Continued use after an update means you accept the revised Terms.

16. Governing Law

These Terms are governed by and construed in accordance with the laws of Singapore, without regard to its conflict of law principles.
You agree that any disputes shall be resolved in competent courts located in Singapore.

17. Contact Us

For questions about these Terms or the Service, please contact:

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

export default Terms;

