import LegalDoc from "@/components/public/legal-doc";

export const metadata = {
  title: "Privacy Policy | WeShare by OrenGen",
  description: "WeShare by OrenGen — data collection, use, and your rights.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      subtitle="WeShare by OrenGen — Data Collection, Use & Your Rights"
      effective="Effective June 2026 · Last Updated June 2026"
      pdfHref="/docs/privacy-policy.pdf"
    >
      <p>
        OrenGen Worldwide LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us&quot;) operates
        weshare.orengen.io (&quot;Platform&quot;). This Privacy Policy explains what personal
        information we collect, how we use it, and your rights regarding that information.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Registration &amp; Account Data</h3>
      <ul>
        <li>Name, email address, phone number</li>
        <li>Password (stored as a cryptographic hash — we never store plaintext passwords)</li>
        <li>Tax identification information (collected by Stripe for 1099 purposes)</li>
        <li>Payment/banking information (collected and stored by Stripe; we do not store financial account numbers)</li>
      </ul>
      <h3>1.2 Activity &amp; Performance Data</h3>
      <ul>
        <li>Referral link clicks, lead submissions attributed to your link, and sales conversions</li>
        <li>Commission ledger entries, payout history, and statement data</li>
        <li>CRM activity logs (Sales Partners), including lead touch records</li>
        <li>Rank progression and program activity</li>
      </ul>
      <h3>1.3 Technical Data</h3>
      <ul>
        <li>IP address, browser type, device identifiers</li>
        <li>Authentication tokens (session cookies, JWT) stored in encrypted browser cookies</li>
        <li>Server access logs retained for up to 90 days</li>
      </ul>
      <h3>1.4 Communications</h3>
      <p>
        Email and in-platform messages you send to us or receive from us regarding your program
        participation.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li><strong>Program Operation:</strong> Tracking referrals, calculating commissions, managing leads, processing payouts, and administering your account.</li>
        <li><strong>Compliance:</strong> Identity verification, fraud prevention, tax reporting (1099s via Stripe), and compliance with applicable law.</li>
        <li><strong>Communications:</strong> Account notifications, payout statements, program updates, and support responses. You may opt out of non-essential communications.</li>
        <li><strong>Security:</strong> Detecting, investigating, and preventing fraudulent activity, unauthorized access, and program abuse.</li>
        <li><strong>Platform Improvement:</strong> Aggregated, de-identified analytics to improve the Platform&apos;s features and performance.</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do not sell personal information. We share data only as follows:</p>
      <ul>
        <li><strong>Stripe:</strong> Payment processing, Stripe Connect onboarding, and 1099 tax form issuance. Stripe&apos;s privacy policy governs data Stripe collects.</li>
        <li><strong>GoHighLevel / LeadConnector (HighLevel):</strong> CRM platform used for lead management and the on-site chat widget. All leads captured through our forms — including name, email, phone, company, and message — are synced to GoHighLevel to operate the program, and the LeadConnector chat widget loaded on our pages transmits chat and visitor data to HighLevel.</li>
        <li><strong>Service Providers:</strong> Hosting, email delivery (SMTP), and analytics providers under confidentiality obligations and with no right to use your data for their own purposes.</li>
        <li><strong>Legal Requirements:</strong> When required by valid legal process (court order, subpoena) or to protect rights, property, or safety.</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of substantially all assets, with notice to you.</li>
      </ul>

      <h2>4. Cookies &amp; Tracking</h2>
      <p>
        We use first-party cookies to maintain authenticated sessions (a session cookie) and to
        attribute referral traffic to a referral partner link. The referral attribution cookie
        (ws_vid) persists for 90 days; a short-lived session-tracking cookie (ws_sid) lasts 24
        hours. We also load the LeadConnector (HighLevel) chat widget, a third-party script that
        sets its own cookies/identifiers to provide live chat. Non-essential cookies (including
        the chat widget) load only after you accept them via our cookie banner; essential cookies
        (sign-in and referral attribution) are required for the service to function. You may
        disable cookies in your browser, but this will prevent login and accurate referral
        attribution.
      </p>

      <h2>5. Data Retention</h2>
      <ul>
        <li>Active account data: retained for the life of your account.</li>
        <li>Commission ledger records: retained for 7 years (tax compliance).</li>
        <li>Server logs: 90 days.</li>
        <li>Closed accounts: data retained for 3 years after closure for legal and compliance purposes, then deleted or anonymized.</li>
      </ul>

      <h2>6. Security</h2>
      <p>
        We implement industry-standard security measures including: HTTPS/TLS for all data in
        transit; bcrypt password hashing with a work factor of 12; JWT authentication with
        expiring tokens stored in HttpOnly cookies; session invalidation on password reset; and
        infrastructure-level access controls. No security measure is perfect; we cannot guarantee
        absolute security.
      </p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        The Platform is not directed to persons under 18 years of age. We do not knowingly collect
        personal information from minors. If you believe a minor has registered, contact us
        immediately at <a href="mailto:partners@orengen.io">partners@orengen.io</a>.
      </p>

      <h2>8. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of personal information we hold about you.</li>
        <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
        <li><strong>Deletion:</strong> Request deletion of your data (subject to retention obligations).</li>
        <li><strong>Portability:</strong> Receive your data in a machine-readable format.</li>
        <li><strong>Opt-Out:</strong> Opt out of non-essential marketing communications.</li>
      </ul>
      <p>
        To exercise any right, email <a href="mailto:partners@orengen.io">partners@orengen.io</a>{" "}
        with subject line &quot;Privacy Request.&quot; We will respond within 30 days.
      </p>

      <h2>9. California Residents (CCPA)</h2>
      <p>
        California residents have specific rights under the California Consumer Privacy Act. We do
        not sell personal information. You may submit a verifiable consumer request to know,
        delete, or opt out by emailing{" "}
        <a href="mailto:partners@orengen.io">partners@orengen.io</a>. We will not discriminate
        against you for exercising CCPA rights.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Policy periodically. We will notify you of material changes by email
        and by posting the updated Policy on the Platform with a new effective date. Continued use
        after notice constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy inquiries: <a href="mailto:partners@orengen.io">partners@orengen.io</a>
        <br />
        OrenGen Worldwide LLC · Mansfield, TX
      </p>
    </LegalDoc>
  );
}
