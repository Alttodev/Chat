import { Mail, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "June 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl mb-2 font-semibold tracking-[0.1em] text-emerald-600 flex items-center ">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
      </div>

      <div className="space-y-8 text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-semibold">1. Introduction</h2>
          <p>
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
          <ul className="list-disc space-y-2 pl-6">
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
          <ul className="list-disc space-y-2 pl-6">
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
          <p>
            We do not sell your personal information. We may share information
            with trusted service providers that help us operate the platform,
            process payments, provide hosting services, or comply with legal
            requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">5. Payment Information</h2>
          <p>
            Payments are processed through secure third-party payment providers.
            We do not store your complete debit card, credit card, or banking
            information on our servers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">6. Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to
            protect your information from unauthorized access, disclosure,
            alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            7. Cookies and Analytics
          </h2>
          <p>
            We may use cookies and similar technologies to improve user
            experience, analyze traffic, remember preferences, and enhance
            platform functionality.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">8. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal information, subject to applicable legal requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>

          <div className="mt-3 rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:alttoamal@gmail.com" className="text-blue-600 ">
                  alttoamal@gmail.com
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              <p>
                <span className="font-medium">Phone:</span>{" "}
                <a href="tel:+919361249705" className="text-blue-600 ">
                  +91 9361249705
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
