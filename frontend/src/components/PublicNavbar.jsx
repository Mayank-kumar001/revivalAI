import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import RevivalLogo from "../assets/RevivalLogo.png";

const PublicNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[92%] max-w-6xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-xl rounded-2xl px-8 py-3 flex justify-between items-center"
      >
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src={RevivalLogo} alt="Revival Logo" className="w-8 h-8" />
          <span className="text-white font-semibold text-lg">Revival AI</span>
        </div>

        <div className="flex gap-8 items-center text-sm text-white">
          <a href="#features" className="hover:text-[#3FA66B] transition">
            Features
          </a>
          <a href="#how" className="hover:text-[#3FA66B] transition">
            How It Works
          </a>
          <Link to="/auth" className="hover:text-[#3FA66B] transition">
            Login
          </Link>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-[#220878] to-[#3FA66B] px-5 py-2 rounded-full font-medium hover:scale-105 transition"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicNavbar;