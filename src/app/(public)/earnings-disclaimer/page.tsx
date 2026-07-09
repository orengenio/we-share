import LegalDoc from "@/components/public/legal-doc";

export const metadata = {
  title: "Earnings Disclaimer | WeShare by OrenGen",
  description:
    "WeShare Referral Partner & Sales Partner Program — FTC-compliant income disclosure.",
};

export default function EarningsDisclaimerPage() {
  return (
    <LegalDoc
      title="Earnings Disclaimer"
      subtitle="WeShare Referral Partner & Sales Partner Program — FTC-Compliant Income Disclosure"
      effective="June 2026"
      pdfHref="/docs/earnings-disclaimer.pdf"
    >
      <p>
        <strong>
          IMPORTANT: Read this entire disclaimer before joining WeShare or making any income-based
          decision. The Federal Trade Commission (FTC) requires that we disclose this information
          clearly.
        </strong>
      </p>

      <h2>No Guarantee of Income</h2>
      <p>
        OrenGen Worldwide LLC (&quot;Company&quot;) makes no guarantee, representation, or
        warranty regarding the income you may earn as a WeShare Referral Partner or Sales Partner.
        Commissions are earned only when referred customers make qualified purchases and those
        purchases clear payment — they are never guaranteed in advance.
      </p>

      <h2>Individual Results Vary Substantially</h2>
      <p>
        Your results will depend entirely on your individual effort, skill, time invested, market
        conditions, the quality of your audience and outreach, adherence to program guidelines,
        and many other factors beyond Company&apos;s control. Some participants earn meaningful
        income. Many earn little or nothing. Your results may be substantially different — higher
        or lower — than anyone else&apos;s results.
      </p>

      <h2>Commission Rates Are Not Equivalent to Take-Home Income</h2>
      <p>
        The commission rates disclosed in program materials represent the percentage of gross
        customer payment that may be credited to you — before your own business expenses, taxes,
        platform fees, and other costs. Commission rates and dollar amounts shown are theoretical
        maximums based on completed, non-refunded sales. They do not account for:
      </p>
      <ul>
        <li>Self-employment and income taxes (which you are solely responsible for)</li>
        <li>Your cost of marketing, advertising, tools, or professional services</li>
        <li>Client refunds, which result in commission clawbacks</li>
        <li>Leads that do not convert to sales</li>
        <li>Client churn, which ends residual commissions</li>
        <li>The time required to build an audience or a client base</li>
      </ul>

      <h2>Past Results Are Not Indicative of Future Results</h2>
      <p>
        Any income figures, screenshots, testimonials, or case studies shared by Company or other
        participants represent individual outcomes and are not typical. They are provided for
        illustration only and should not be interpreted as likely or average outcomes. Past
        performance of the program or of any individual participant does not guarantee similar
        results for you.
      </p>

      <h2>Referral Partner-Specific Disclosures</h2>
      <p>
        WeShare Referral Partners earn commissions only when (a) a visitor uses their referral
        link, (b) the visitor becomes a paying customer, and (c) no disqualifying conditions
        apply. Referral Partner rank and override commissions are contingent on personal sales
        milestones that many participants may never reach.
      </p>

      <h2>Sales Partner-Specific Disclosures</h2>
      <p>
        Sales Partners earn commissions only on deals they personally close. Lead volume, quality,
        and close rate are not guaranteed. Residual income from client maintenance fees is
        dependent on client retention, which is not guaranteed.
      </p>

      <h2>FTC Compliance Statement</h2>
      <p>
        In compliance with the FTC&apos;s Guides Concerning the Use of Endorsements and
        Testimonials (16 CFR Part 255) and the FTC&apos;s Business Opportunity Rule (16 CFR Part
        437), all participants in the WeShare program are required to clearly and conspicuously
        disclose their referral partner or sales partner relationship when promoting OrenGen or
        WeShare in any public forum, social media, or communications.
      </p>
      <p>
        Failure to disclose is a violation of FTC regulations and of the WeShare program terms,
        and may result in account termination.
      </p>

      <h2>Not Financial or Legal Advice</h2>
      <p>
        Nothing in Company&apos;s program materials constitutes financial, legal, tax, or business
        advice. You should consult qualified professionals before making any business or financial
        decisions based on your potential participation in WeShare.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer:{" "}
        <a href="mailto:partners@orengen.io">partners@orengen.io</a>
        <br />
        Federal Trade Commission resources:{" "}
        <a
          href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers"
          rel="noopener noreferrer"
          target="_blank"
        >
          ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers
        </a>
      </p>
    </LegalDoc>
  );
}
