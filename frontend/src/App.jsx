import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Upload from "./pages/Auth/Upload";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/Home";
import AuthPage from "./pages/Auth/AuthPage";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            
              <PageWrapper>
                <LandingPage />
              </PageWrapper>
            
          }
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Upload />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        <Route
          path="/signup"
          element={
            <PageWrapper>
              <Signup />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
