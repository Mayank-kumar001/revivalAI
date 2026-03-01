import { useState, useContext } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/login", form);
      login(res.data.token);
      navigate("/upload");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1C26] px-4">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-2xl">

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-[#BEE6D5] text-sm mb-8">
          Continue to <span className="text-[#3FA66B] font-semibold">Revival</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

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
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#BEE6D5]">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#3FA66B] font-semibold cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;