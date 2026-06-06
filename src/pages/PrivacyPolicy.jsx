export default function PrivacyPolicy() {
  const lastUpdated = "June 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 flex items-center text-2xl font-semibold tracking-[0.1em] text-emerald-600">
          Privacy Policy
        </h1>

        <p className="text-sm text-muted-foreground">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Introduction</h2>
          <p className="leading-7 text-muted-foreground">
            Welcome to our platform. We value your privacy and are committed to
            protecting your personal information. This Privacy Policy explains
            how we collect, use, store, and protect your information when you
            use our website and services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            2. Information We Collect
          </h2>

          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Name and profile information.</li>
            <li>Email address and login credentials.</li>
            <li>Profile pictures and user-generated content.</li>
            <li>Messages, posts, comments, and interactions.</li>
            <li>Device, browser, and usage information.</li>
            <li>Subscription and payment-related information.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            3. How We Use Your Information
          </h2>

          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>To create and manage your account.</li>
            <li>To provide and improve platform features.</li>
            <li>To process subscriptions and payments.</li>
            <li>To communicate important updates and notifications.</li>
            <li>To maintain platform security and prevent misuse.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            4. Sharing of Information
          </h2>

          <p className="leading-7 text-muted-foreground">
            We do not sell your personal information. We may share information
            with trusted service providers that help us operate the platform,
            process payments, provide hosting services, or comply with legal
            requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. Payment Information</h2>

          <p className="leading-7 text-muted-foreground">
            Payments are processed through secure third-party payment providers.
            We do not store your complete debit card, credit card, or banking
            information on our servers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. Data Security</h2>

          <p className="leading-7 text-muted-foreground">
            We implement reasonable technical and organizational measures to
            protect your information from unauthorized access, disclosure,
            alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            7. Cookies and Analytics
          </h2>

          <p className="leading-7 text-muted-foreground">
            We may use cookies and similar technologies to improve user
            experience, analyze traffic, remember preferences, and enhance
            platform functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">8. Your Rights</h2>

          <p className="leading-7 text-muted-foreground">
            You may request access to, correction of, or deletion of your
            personal information, subject to applicable legal requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">9. Account Deletion</h2>

          <p className="leading-7 text-muted-foreground">
            You may permanently delete your account at any time through your
            account settings. Upon deletion, your profile information, posts,
            comments, messages, subscriptions, and associated account data will
            be removed from our systems, subject to legal and operational
            requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            10. Changes to This Policy
          </h2>

          <p className="leading-7 text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  );
}
