import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const APP_NAME = "Clix";

const COLOR = {
  bg: "#FFFFFF",
  surface: "#F5F3EE", // warm light-gray card background
  surface2: "#EAE6DC", // icon chip background
  text: "#170F26", // near-black, slight violet tint to echo the brand
  dim: "#6B7280", // gray-500
  amber: "#059669", // emerald-600
  mint: "#0D9488", // teal-600 (darkened for contrast on white)
  pink: "#E11D48", // rose-600 (darkened for contrast on white)
  button: "#170F26", // solid dark button reads clearly on white
  buttonHover: "#2E2540",
};

const displayFont = { fontFamily: "'Space Grotesk', 'Inter', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };
const monoFont = { fontFamily: "'IBM Plex Mono', monospace" };

const FEATURES = [
  {
    tag: "REELS",
    title: "Reels that don't need an audience to feel alive",
    body: "Post short video the moment it happens. No editing suite, no waiting — just tap, shoot, share.",
    color: COLOR.amber,
    icon: <path d="M8 5v14l11-7-11-7z" />,
  },
  {
    tag: "HASHTAGS",
    title: "Follow a topic, not just a person",
    body: "Hashtags surface the conversation in real time, so you can drop into a moment as it's unfolding.",
    color: COLOR.mint,
    icon: <path d="M10 3L8 21M16 3l-2 18M4 8h17M3 16h17" />,
  },
  {
    tag: "FRIENDS",
    title: "A friends list that's actually a list of friends",
    body: "See who's following whom, find people you already know, and build a circle that isn't algorithm-picked.",
    color: COLOR.pink,
    icon: (
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    tag: "MESSAGES",
    title: "Direct messages that stay direct",
    body: "One-to-one and group chats, without turning your inbox into another feed you have to scroll.",
    color: COLOR.amber,
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  {
    tag: "BOOKMARKS",
    title: "Save it for later, actually find it later",
    body: "Bookmark posts as you scroll and come back to a shelf that's organized, not a black hole.",
    color: COLOR.mint,
    icon: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  },
  {
    tag: "SUBSCRIPTION",
    title: "Support the people you follow",
    body: "Subscribe directly to creators you care about — no ads standing between you and what you came for.",
    color: COLOR.pink,
    icon: <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" />,
  },
];

const TRENDING_TAGS = [
  "#firstlight",
  "#buildinpublic",
  "#latenight",
  "#studiovisit",
  "#weekendrun",
  "#newmusic",
  "#homecooking",
  "#sketchbook",
  "#roadtrip",
  "#launchday",
];

function Icon({ children, color }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      {children}
    </svg>
  );
}

function ReelCard({ rotate, translate, gradient, delay, z }) {
  return (
    <div
      className="absolute w-40 h-64 sm:w-48 sm:h-72 rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5"
      style={{
        transform: `rotate(${rotate}deg) translate(${translate})`,
        background: gradient,
        zIndex: z,
        animation: `float 6s ease-in-out ${delay}s infinite`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm" />
        <div className="h-1.5 w-16 rounded-full bg-white/40" />
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
          <path d="M8 5v14l11-7-11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: COLOR.bg, color: COLOR.text, ...bodyFont }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { margin-top: 0px; }
          50% { margin-top: -14px; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 28s linear infinite; }
      `}</style>

      {/* ---------------------------------------------------------------- */}
      {/* Nav                                                              */}
      {/* ---------------------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md  border-black/5"
        style={{ background: `${COLOR.bg}CC` }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="Clix Logo" className="w-8 h-8" />
            <span className="text-xl md:text-2xl font-bold text-emerald-600">
              {APP_NAME}
            </span>
          </Link>
          <nav
            className="hidden sm:flex items-center gap-8 text-sm"
            style={{ color: COLOR.dim }}
          >
            {/* <Link to="/explore">Explore</Link> */}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-full transition-colors"
              style={{ color: COLOR.text }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium px-4 py-2 rounded-full transition-colors hover:bg-[--btn-hover]"
              style={{
                background: COLOR.button,
                color: "#FFFFFF",
                "--btn-hover": COLOR.buttonHover,
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span
            className="inline-block text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-6"
            style={{
              background: COLOR.surface,
              color: COLOR.mint,
              ...monoFont,
            }}
          >
            Now in open signup
          </span>
          <h1
            className="text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-6"
            style={displayFont}
          >
            Where your people
            <br />
            <span style={{ color: COLOR.amber }}>show up</span>, not scroll by.
          </h1>
          <p className="text-lg mb-10 max-w-md" style={{ color: COLOR.dim }}>
            {APP_NAME} is a feed built around friends, reels and the hashtags
            you actually care about — without the noise.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-full font-medium transition-colors hover:bg-[--btn-hover]"
              style={{
                background: COLOR.button,
                color: "#FFFFFF",
                "--btn-hover": COLOR.buttonHover,
              }}
            >
              Create your account
            </Link>
          </div>
        </div>

        <div className="relative h-[420px] hidden sm:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <ReelCard
              rotate={-14}
              translate="-90px, 10px"
              gradient="linear-gradient(160deg, #3B2E63, #1E1733)"
              delay={0}
              z={1}
            />
            <ReelCard
              rotate={6}
              translate="70px, -6px"
              gradient="linear-gradient(160deg, #7A5C3E, #241C3A)"
              delay={0.8}
              z={2}
            />
            <ReelCard
              rotate={-3}
              translate="-8px, -30px"
              gradient="linear-gradient(160deg, #3E6B63, #1E1733)"
              delay={1.4}
              z={3}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Trending marquee                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section
        className="border-y border-black/5 py-5 overflow-hidden"
        style={{ background: COLOR.surface }}
      >
        <div className="flex gap-3 w-max marquee-track">
          {[...TRENDING_TAGS, ...TRENDING_TAGS].map((tag, i) => (
            <Link
              key={i}
              to={`/hashtags/${tag.slice(1)}`}
              className="text-sm px-4 py-1.5 rounded-full whitespace-nowrap border border-black/10 hover:border-black/30 transition-colors"
              style={{ ...monoFont, color: COLOR.dim }}
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <h2
          className="text-3xl sm:text-4xl mb-14 max-w-lg tracking-tight"
          style={displayFont}
        >
          Everything a feed needs. Nothing it doesn't.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.tag}
              className="p-6 rounded-2xl border border-black/5 transition-colors hover:border-black/15"
              style={{ background: COLOR.surface }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: COLOR.surface2 }}
              >
                <Icon color={f.color}>{f.icon}</Icon>
              </div>
              <span
                className="text-sm tracking-[0.2em]"
                style={{ ...monoFont, color: f.color }}
              >
                {f.tag}
              </span>
              <h3 className="text-lg mt-2 mb-2" style={displayFont}>
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: COLOR.dim }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div
          className="rounded-3xl px-8 py-16 sm:py-20 text-center relative overflow-hidden"
          style={{ background: COLOR.surface }}
        >
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: COLOR.amber }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: COLOR.mint }}
          />
          <h2
            className="relative text-3xl sm:text-4xl mb-4 tracking-tight"
            style={displayFont}
          >
            Your feed is waiting.
          </h2>
          <p className="relative mb-8" style={{ color: COLOR.dim }}>
            Takes less than a minute to set up.
          </p>
          <Link
            to="/signup"
            className="relative inline-block px-7 py-3 rounded-full font-medium transition-colors hover:bg-[--btn-hover]"
            style={{
              background: COLOR.button,
              color: "#FFFFFF",
              "--btn-hover": COLOR.buttonHover,
            }}
          >
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer>
        <div
          className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm"
          style={{ color: COLOR.dim }}
        >
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-md md:text-xl font-bold text-emerald-600">
              {APP_NAME}
            </span>
          </Link>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-black transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="hover:text-black transition-colors">
              Sign up
            </Link>
          </div>
          <span style={monoFont}>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
