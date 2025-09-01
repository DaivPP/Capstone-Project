import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("authToken"); // fake auth check
  return isAuth ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
