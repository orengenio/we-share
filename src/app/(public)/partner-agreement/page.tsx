import LegalDoc from "@/components/public/legal-doc";

export const metadata = {
  title: "Sales Representative Agreement | WeShare by OrenGen",
  description:
    "The OrenGen Sales Representative Agreement — commission terms, obligations, and acceptance record.",
};

export default function PartnerAgreementPage() {
  return (
    <LegalDoc
      title="Sales Representative Agreement"
      subtitle="OrenGen Sales Partner Program — accepted electronically from your dashboard"
      effective="Version v2-2026-07-09"
    >
      <p>
        This Sales Representative Agreement (the &quot;Agreement&quot;) is made and effective
        upon the Sales Representative&apos;s electronic acceptance, recorded with version, date,
        and time,
      </p>
      <p>
        <strong>BETWEEN:</strong> <strong>OrenGen Worldwide LLC</strong> (the
        &quot;Company&quot;), a limited liability company organized and existing under the laws
        of the State of Texas, with its head office located in Mansfield, Texas,
      </p>
      <p>
        <strong>AND:</strong> the <strong>Sales Representative</strong> — the individual
        identified by the WeShare account through which this Agreement is accepted, an
        independent contractor with the contact address provided at registration.
      </p>

      <h2>Sales Representative agrees to:</h2>
      <ul>
        <li>Represent and sell the Company&apos;s website services in the geographic area known as the United States (non-exclusive; no exclusive territory is granted).</li>
        <li>Accurately represent and state Company policies to all potential and present customers, including fixed pricing of $997 setup + $247/month collected only through the Company&apos;s official checkout, and to make no claims beyond the Company&apos;s approved claims.</li>
        <li>Promptly log all leads and orders in the Company&apos;s WeShare platform — same-day logging; the platform record is the system of record for commissions.</li>
        <li>Inform the Company of all problems concerning Company customers within the sales territory, via the platform or partners@orengen.io.</li>
        <li>Inform the Company if the Sales Representative is representing, or plans to represent, any other business firm. In no event shall the Sales Representative represent a competitive company or product line either within or outside the designated sales area.</li>
        <li>Maintain reasonable contact with the Company, including making first contact with each assigned lead within four (4) hours of assignment per the Partner Handbook.</li>
        <li>Provide the Company fourteen (14) days&apos; notice should the Representative intend to terminate this Agreement.</li>
        <li>Cease use of, and where applicable return, all materials and access provided by the Company — including scripts, the Partner Handbook, CRM access, marketing materials, and any Company-assigned phone number — if either party terminates this Agreement.</li>
      </ul>

      <h2>The Company agrees to:</h2>
      <ul>
        <li>
          Pay the following commissions to the Sales Representative: <strong>25% of the setup
          fee</strong> on each completed sale closed by the Representative, and{" "}
          <strong>25% of the monthly maintenance fee</strong> for each such client,{" "}
          <strong>for the life of the client account</strong>, subject to the refund and
          non-commissioned provisions below. Commissions become payout-eligible fifteen (15)
          days after the underlying payment clears (NET-15 maturity) and are paid via Stripe
          Connect on the Company&apos;s scheduled payout runs.
        </li>
        <li>To negotiate in advance of sale the commission treatment of any order on which the Company allows a discount or other trade concession. (Company pricing is currently fixed; no discounts are offered.)</li>
        <li>Commissions on refunds to customers in which a commission has already been paid to the Representative shall be deducted from future commissions to be paid to the Representative by the Company — including negative adjustments netted against subsequent payouts. Refunds within thirty (30) days of payment void the associated commission.</li>
        <li>Except by special arrangement, the following shall not be commissioned: sales not completed through the Company&apos;s official checkout; purchases made by the Representative on their own behalf; refunded sales; and amounts attributable to taxes or payment-processing adjustments.</li>
        <li>To provide the Sales Representative with reasonable sales materials in digital form — the Partner Handbook, approved scripts, CRM access, the marketing materials library, and, upon certification, a Company-assigned business phone number.</li>
        <li>To set minimum activity standards after consultation with the Sales Representative, as published in the Partner Handbook (including the four-hour first-touch standard and same-day logging). Lead assignments begin upon certification.</li>
        <li>To grant the Representative fourteen (14) days&apos; notice should the Company wish to terminate this Agreement — except that the Company may terminate immediately for cause, meaning fraud, client circumvention, or material breach of this Agreement, the Program Terms of Service, or the Partner Handbook (§§9–12).</li>
        <li>To pay commissions to the Representative on sales from existing clients after this Agreement is terminated as follows: where the Representative exits in good standing, residual commissions continue for the life of each client account closed by the Representative; where the Company terminates for cause, unpaid and future commissions are forfeited.</li>
      </ul>

      <h2>Additional provisions</h2>
      <ul>
        <li>
          <strong>Independent contractor.</strong> The Representative is an independent
          contractor, not an employee, and is solely responsible for their own taxes. Taxpayer
          information (W-9/TIN) is collected and certified through Stripe Connect, and tax forms
          (e.g., Form 1099) are issued through Stripe where thresholds are met.
        </li>
        <li>
          <strong>Incorporation by reference.</strong> The WeShare{" "}
          <a href="/terms">Program Terms of Service</a> (including its Texas governing-law and
          Tarrant County arbitration provisions, limitation of liability, and indemnification)
          and the Partner Handbook are incorporated into and form part of this Agreement. In
          case of conflict, this Agreement controls as to commission terms.
        </li>
        <li>
          <strong>Confidentiality and non-circumvention.</strong> Client relationships, lead
          data, scripts, and pricing strategy are Company property; the Representative shall not
          divert clients or leads off-platform or use Company data outside authorized program
          activities.
        </li>
        <li>
          <strong>Electronic acceptance.</strong> This Agreement is accepted electronically
          through the Representative&apos;s WeShare dashboard; the Company records the agreement
          version, acceptance timestamp, account identity, and IP address as the signature
          record.
        </li>
      </ul>

      <p>
        This constitutes the entire Agreement, together with the documents incorporated by
        reference above. This Agreement shall be binding upon the parties and their successors
        and assigns.
      </p>
    </LegalDoc>
  );
}
