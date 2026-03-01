import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import {
  Scissors,
  Sparkles,
  Rocket,
  BarChart3,
  Zap,
  Flame,
  Heart,
  Brain,
  Laugh,
  TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0C1C26] text-white overflow-hidden scroll-smooth">
      {/* ✅ PUBLIC NAVBAR */}
      <PublicNavbar />

      {/* Main Content Wrapper */}
      <div className="pt-32">
        {/* ================= HERO ================= */}
        <section className="text-center px-6 max-w-5xl mx-auto">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-bold leading-tight"
          >
            Transform Long-Form Videos into{" "}
            <span className="bg-linear-to-r from-[#3FA66B] to-[#220878] bg-clip-text text-transparent">
              Engaging Reels
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="text-gray-400 mt-6 text-lg"
          >
            Automatically transcribe, intelligently chunk and generate viral
            short-form clips.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-6 mt-10"
          >
            <button
              onClick={() => navigate("/auth")}
              className="bg-[#3FA66B] text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition"
            >
              Get Started Free
            </button>

            <button className="border border-gray-600 px-8 py-3 rounded-full hover:bg-white/10 transition">
              Watch Demo
            </button>
          </motion.div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="mt-40 px-12">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Powerful Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles />,
                title: "AI Transcription",
                desc: "Transcribe long videos instantly.",
              },
              {
                icon: <Scissors />,
                title: "Smart Chunking",
                desc: "Automatically segment engaging clips.",
              },
              {
                icon: <Rocket />,
                title: "One Click Publishing",
                desc: "Export to Reels & Shorts instantly.",
              },
              {
                icon: <BarChart3 />,
                title: "Performance Analytics",
                desc: "Track what performs best.",
              },
              {
                icon: <Zap />,
                title: "Lightning Fast",
                desc: "Process hours in minutes.",
              },
              {
                icon: <TrendingUp />,
                title: "Smart Ratings",
                desc: "Reels scored by engagement type.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
              >
                <div className="text-[#3FA66B] mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how" className="mt-40 px-12">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12 text-gray-400">
            {[
              "Upload Your Video",
              "AI Transcription & Analysis",
              "Generate Reels",
              "Review & Rate",
              "Save Favorites",
              "Publish Everywhere",
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 border border-white/10 p-8 rounded-xl"
              >
                <span className="text-[#3FA66B] font-bold text-2xl">
                  0{i + 1}
                </span>
                <h3 className="text-white mt-3 font-semibold">{step}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= REEL CATEGORIES ================= */}
        <section className="mt-40 px-12 mb-40">
          <h2 className="text-4xl font-bold text-center mb-16">
            Reel Categories
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Flame />, title: "Controversial" },
              { icon: <Heart />, title: "Emotional" },
              { icon: <Brain />, title: "Educational" },
              { icon: <Laugh />, title: "Entertaining" },
              { icon: <TrendingUp />, title: "Trending" },
              { icon: <Zap />, title: "Motivational" },
            ].map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
              >
                <div className="text-[#3FA66B] mb-4">{cat.icon}</div>
                <h3 className="text-xl font-semibold">{cat.title}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-white/10 py-10 px-12 text-gray-400">
          <div className="flex justify-between flex-wrap gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Revival AI</h3>
              <p>Transform your videos into viral content with AI.</p>
            </div>

            <div>
              <h4 className="text-white mb-2">Product</h4>
              <p>Features</p>
              <p>Pricing</p>
              <p>Blog</p>
            </div>

            <div>
              <h4 className="text-white mb-2">Company</h4>
              <p>About</p>
              <p>Privacy</p>
              <p>Contact</p>
            </div>
          </div>

          <div className="mt-10 text-sm text-center">
            © 2026 Revival AI. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;