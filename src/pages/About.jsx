import { Users, Sparkles, ShieldCheck, Rocket, Gem } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
     
        <h1 className="text-2xl mb-6 font-semibold tracking-[0.1em] text-emerald-600 flex items-center gap-2">
          About Us
        </h1>
   

      <div className="flex items-start gap-3 mb-6">
        <Users className="w-5 h-5 text-blue-600 mt-1" />
        <p className="text-gray-700 leading-7">
          We are a next-generation social media platform designed to help people
          connect, share ideas, and build meaningful digital relationships
          through posts, profiles, and interactive content.
        </p>
      </div>
      <div className="flex items-start gap-3 mb-6">
        <Rocket className="w-5 h-5 text-purple-600 mt-1" />
        <p className="text-gray-700 leading-7">
          Our platform is built for speed, simplicity, and engagement—offering
          real-time interactions, content sharing, and smooth user experience
          across all devices.
        </p>
      </div>
      <div className="flex items-start gap-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-green-600 mt-1" />
        <p className="text-gray-700 leading-7">
          We prioritize user privacy and security. All user data is handled with
          strict protection standards and is never shared without consent.
        </p>
      </div>

      <div className="mt-10 p-5 border rounded-xl bg-gray-50">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Gem className="w-5 h-5 text-emerald-600" />
          Premium Experience
        </h2>
        <p className="text-gray-600 leading-6">
          We offer optional premium plans that unlock advanced features such as
          enhanced visibility, exclusive tools, and a better personalized
          experience.
        </p>
      </div>
    </div>
  );
}
