import { Navigate, Outlet } from "react-router";

function Protected({ isSignedIn, children }) {
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
}

export default Protected;