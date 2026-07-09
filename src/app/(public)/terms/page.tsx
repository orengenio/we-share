import LegalDoc from "@/components/public/legal-doc";

export const metadata = {
  title: "Terms of Service | WeShare by OrenGen",
  description: "WeShare Program Terms of Service — platform terms governing all participants.",
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="WeShare Program Terms of Service"
      subtitle="Platform Terms Governing All Participants"
      effective="Effective June 2026 · v1.1"
      pdfHref="/docs/program-terms.pdf"
    >
      <p>
        These Program Terms of Service (&quot;Terms&quot;) govern use of the WeShare platform at
        weshare.orengen.io, operated by OrenGen Worldwide LLC (&quot;Company&quot;). By creating an
        account, you agree to these Terms in addition to any applicable program agreement
        (Referral Partner Agreement or Sales Partner Agreement).
      </p>

      <h2>1. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years of age.</li>
        <li>You must be legally authorized to work as an independent contractor in the United States.</li>
        <li>You must provide accurate, complete, and current information at registration and maintain its accuracy.</li>
        <li>One account per individual. Multiple accounts are grounds for immediate termination of all accounts.</li>
        <li>Prior termination for cause disqualifies you from re-enrollment.</li>
      </ul>

      <h2>2. Account Security</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your password and account credentials.</li>
        <li>Notify us immediately at <a href="mailto:partners@orengen.io">partners@orengen.io</a> if you suspect unauthorized access to your account.</li>
        <li>We are not liable for losses arising from unauthorized account access due to your failure to maintain credential security.</li>
        <li>Password reset links expire in 1 hour. All active sessions are invalidated upon password reset for security.</li>
      </ul>

      <h2>3. Platform Rules</h2>
      <ul>
        <li>Use the Platform only for lawful purposes and in accordance with your applicable program agreement.</li>
        <li>Do not attempt to reverse-engineer, scrape, or interfere with the Platform&apos;s technical operation.</li>
        <li>Do not attempt to access accounts, data, or systems not expressly authorized to you.</li>
        <li>Do not use the Platform in any way that could damage, disable, or impair the Platform or its servers.</li>
      </ul>

      <h2>4. Referral &amp; Lead Data</h2>
      <p>
        Click data, lead records, and customer data generated through your program activities are
        Company property. This data may not be exported, copied, or used outside the Platform for
        any purpose other than your authorized program activities.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>
        All Platform content, trademarks, logos, and software are Company&apos;s property or
        licensed to Company. You receive a limited, non-exclusive, revocable license to access and
        use the Platform solely for your authorized program activities. The WeShare name, logo,
        and &quot;OrenGen&quot; brand may not be used in domain names, social media handles, or
        paid advertising without prior written approval.
      </p>

      <h2>6. Payouts &amp; Stripe Connect</h2>
      <ul>
        <li>Payouts require a valid Stripe Connect account linked to your WeShare profile.</li>
        <li>Stripe&apos;s Terms of Service govern the Stripe Connect relationship. Company is not responsible for Stripe&apos;s acts or omissions.</li>
        <li>Weekly Friday payouts are processed for approved commissions earned through the prior Sunday. Processing times may vary by bank.</li>
        <li>Company reserves the right to hold payouts pending fraud investigation, dispute resolution, or regulatory compliance review.</li>
      </ul>

      <h2>7. Modifications to the Platform</h2>
      <p>
        Company reserves the right to modify, update, or discontinue the Platform or any feature at
        any time, with or without notice for non-material changes. Material changes that reduce
        your earned commission rates or eligibility will be communicated with at least 14
        days&apos; notice.
      </p>

      <h2>8. Suspension &amp; Termination</h2>
      <p>
        Company may suspend or terminate your account immediately for violations of these Terms,
        your program agreement, or applicable law. You may close your account at any time by
        contacting <a href="mailto:partners@orengen.io">partners@orengen.io</a>. Effect of
        termination on commissions is governed by your program agreement.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY
        OF ANY KIND. COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. COMPANY DOES NOT
        WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE AT ALL TIMES.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPANY&apos;S AGGREGATE LIABILITY TO YOU FOR ANY
        CLAIM ARISING FROM YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE TOTAL COMMISSIONS PAID TO
        YOU IN THE 90 DAYS PRECEDING THE CLAIM. IN NO EVENT SHALL COMPANY BE LIABLE FOR INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Company and its officers, members, employees, and
        agents from any third-party claims, damages, or costs (including reasonable
        attorneys&apos; fees) arising from your use of the Platform, your violation of these
        Terms, or your program activities.
      </p>

      <h2>12. Governing Law &amp; Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of the State of Texas. Any dispute arising under
        these Terms that is not resolved through Company&apos;s internal dispute process
        (described in your program agreement) shall be submitted to binding individual arbitration
        under AAA Commercial Rules in Tarrant County, Texas. Class actions and class arbitrations
        are waived.
      </p>

      <h2>13. Entire Agreement</h2>
      <p>
        These Terms, together with your applicable program agreement (Referral Partner Agreement
        or Sales Partner Agreement), the Independent Contractor Agreement, and the{" "}
        <a href="/privacy">Privacy Policy</a>, constitute the entire agreement between you and
        Company regarding your participation in WeShare.
      </p>

      <h2>14. Contact</h2>
      <p>
        Legal inquiries: <a href="mailto:partners@orengen.io">partners@orengen.io</a>
        <br />
        OrenGen Worldwide LLC · Mansfield, TX
      </p>
    </LegalDoc>
  );
}
