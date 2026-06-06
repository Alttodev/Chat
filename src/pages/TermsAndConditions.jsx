export default function TermsAndConditions() {
  const lastUpdated = "June 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl mb-2 font-semibold tracking-[0.1em] text-emerald-600 flex items-center ">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our platform, you agree to be bound by these
            Terms & Conditions. If you do not agree with any part of these
            terms, you should discontinue use of the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">2. User Accounts</h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            account credentials and for all activities that occur under their
            accounts. You agree to provide accurate and up-to-date information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. Acceptable Use</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Do not post unlawful, harmful, or abusive content.</li>
            <li>Do not impersonate other individuals or organizations.</li>
            <li>
              Do not attempt to gain unauthorized access to accounts or systems.
            </li>
            <li>Do not engage in spam, fraud, or misleading activities.</li>
            <li>Respect other users and community guidelines.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">4. User Content</h2>
          <p>
            Users retain ownership of the content they post. By submitting
            content to the platform, you grant us a limited license to display,
            distribute, and make the content available as required to operate
            the service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            5. Premium Subscriptions
          </h2>
          <p>
            We may offer premium plans that provide additional features and
            benefits. Subscription fees, billing periods, and available features
            are displayed before purchase.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. Payments</h2>
          <p>
            All payments are processed through secure third-party payment
            providers. By purchasing a premium plan, you authorize the
            applicable charges associated with your selected subscription.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            7. Refund & Cancellation Policy
          </h2>

          <p>
            Premium subscriptions provide immediate access to digital features
            and services. Due to the nature of digital products, payments are
            generally non-refundable once a subscription has been activated.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            8. Account Suspension and Termination
          </h2>
          <p>
            We reserve the right to suspend, restrict, or terminate accounts
            that violate these Terms & Conditions, community standards, or
            applicable laws.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            9. Limitation of Liability
          </h2>
          <p>
            The platform is provided on an "as is" and "as available" basis. We
            are not liable for indirect, incidental, or consequential damages
            arising from the use of our services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">10. Changes to Terms</h2>
          <p>
            We may update these Terms & Conditions from time to time. Continued
            use of the platform after updates constitutes acceptance of the
            revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            11. Contact Information
          </h2>

          <div className="mt-3 rounded-lg border p-4">
            <p>
              Email:{" "}
              <a href="mailto:alttoamal@gmail.com" className="text-blue-600">
                alttoamal@gmail.com
              </a>
            </p>

            <p>
              Phone:{" "}
              <a href="tel:+919361249705" className="text-blue-600 ">
                +91 9361249705
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
