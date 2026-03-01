import { useState, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RevivalLogo from "../../assets/RevivalLogo.png";
import API from "../../api/axios";
import { Mail, Lock, User } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isLogin) {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        login(res.data.token);
        navigate("/upload"); // 🔥 FIXED
      } else {
        await API.post("/auth/signup", form);
        alert("Account created 🎉 Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(isLogin ? "Invalid credentials" : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1C26] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute w-96 h-96 bg-[#220878] opacity-30 blur-[150px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-[#3FA66B] opacity-20 blur-[150px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={RevivalLogo}
            alt="Revival Logo"
            className="w-20 h-20 drop-shadow-xl"
          />
        </div>

        {/* Title */}
        <motion.h2
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white text-center mb-2"
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </motion.h2>

        <p className="text-center text-[#BEE6D5] mb-8">
          {isLogin
            ? "Login to continue to Revival"
            : "Join Revival and start creating"}
        </p>

        {/* Toggle */}
        <div className="relative flex bg-[#0F5F5C]/40 rounded-full p-1 mb-8">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-[#220878] to-[#3FA66B] rounded-full"
            style={{ left: isLogin ? "4px" : "50%" }}
          />

          <button
            onClick={() => setIsLogin(true)}
            className="relative z-10 flex-1 py-2 text-sm font-medium text-white"
          >
            Sign in
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className="relative z-10 flex-1 py-2 text-sm font-medium text-white"
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "loginForm" : "signupForm"}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm text-[#BEE6D5]">Full Name</label>
                <div className="flex items-center bg-[#0F5F5C]/20 border border-[#0F5F5C] rounded-xl px-4 py-3">
                  <User size={18} className="text-[#BEE6D5] mr-3" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm text-[#BEE6D5]">Email address</label>
              <div className="flex items-center bg-[#0F5F5C]/20 border border-[#0F5F5C] rounded-xl px-4 py-3">
                <Mail size={18} className="text-[#BEE6D5] mr-3" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#BEE6D5]">Password</label>
              <div className="flex items-center bg-[#0F5F5C]/20 border border-[#0F5F5C] rounded-xl px-4 py-3">
                <Lock size={18} className="text-[#BEE6D5] mr-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#220878] to-[#3FA66B] text-white py-3 rounded-xl font-medium hover:scale-[1.02] transition shadow-xl"
            >
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating..."
                : isLogin
                  ? "Sign in →"
                  : "Create Account →"}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
