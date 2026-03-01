import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { userToken } = useContext(AuthContext);

  if (!userToken) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;