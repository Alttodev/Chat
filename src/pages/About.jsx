import { Users, Rocket, ShieldCheck, Gem, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-[0.1em] text-emerald-600">
          About Us
        </h1>

        <p className="mt-3 text-muted-foreground leading-7">
          Connecting people through meaningful conversations, shared
          experiences, and engaging content in a secure and modern social
          platform.
        </p>
      </div>

      {/* Mission */}
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
          <Users className="w-6 h-6 shrink-0 text-blue-500 mt-1" />

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Build Meaningful Connections
            </h3>

            <p className="text-muted-foreground leading-7">
              Our platform helps people connect, communicate, and build
              authentic relationships through posts, profiles, stories, and
              real-time interactions.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
          <Rocket className="w-6 h-6 shrink-0 text-purple-500 mt-1" />

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Fast & Modern Experience
            </h3>

            <p className="text-muted-foreground leading-7">
              Designed with performance and simplicity in mind, our platform
              delivers a smooth experience across desktop and mobile devices.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
          <ShieldCheck className="w-6 h-6 shrink-0 text-green-500 mt-1" />

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Privacy & Security
            </h3>

            <p className="text-muted-foreground leading-7">
              Protecting user privacy is a core priority. We implement strong
              security practices and handle user information responsibly.
            </p>
          </div>
        </div>
      </div>

      {/* Premium Section */}
      <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Gem className="w-5 h-5 text-emerald-500 shrink-0" />

          <h2 className="text-lg font-semibold text-foreground">
            Premium Experience
          </h2>
        </div>

        <p className="text-muted-foreground leading-7">
          Unlock additional features with our Premium plans, including enhanced
          visibility, exclusive tools, and a more personalized experience
          designed for active users.
        </p>
      </div>
    </div>
  );
}
