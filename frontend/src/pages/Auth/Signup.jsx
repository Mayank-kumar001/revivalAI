import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/auth/signup", form);
      alert("Account created 🎉");
      navigate("/login");
    } catch (err) {
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1C26] px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-[#BEE6D5] text-sm mb-8">
          Join <span className="text-[#3FA66B] font-semibold">Revival</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-[#0F5F5C]/20 border border-[#0F5F5C] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#3FA66B] focus:outline-none transition"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-[#0F5F5C]/20 border border-[#0F5F5C] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#3FA66B] focus:outline-none transition"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-[#0F5F5C]/20 border border-[#0F5F5C] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#3FA66B] focus:outline-none transition"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#220878] hover:bg-[#3FA66B] text-white font-semibold transition duration-300 shadow-lg"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#BEE6D5]">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#3FA66B] font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
