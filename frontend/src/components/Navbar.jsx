import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full bg-[#0C1C26] border-b border-[#0F5F5C] px-10 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1
        className="text-2xl font-bold text-[#3FA66B] cursor-pointer"
        onClick={() => navigate("/")}
      >
        Revival
      </h1>

      {/* Profile Section */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-[#220878] flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-[#3FA66B] transition"
        >
          U
        </div>

        {open && (
          <div className="absolute right-0 mt-3 w-48 bg-[#0F5F5C] border border-[#3FA66B] rounded-xl shadow-xl overflow-hidden animate-fadeIn">
            <button
              onClick={() => navigate("/")}
              className="w-full text-left px-4 py-3 text-[#BEE6D5] hover:bg-[#220878] transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full text-left px-4 py-3 text-[#BEE6D5] hover:bg-[#220878] transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
