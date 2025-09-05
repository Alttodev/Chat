import LoginFormComponent from "@/components/Auth/Login";
import HomeComponent from "@/pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function AppRoutes() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginFormComponent />} />
          <Route path="/home" element={<HomeComponent />} />
          {/* <Route path="/signin" element={<Signin />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/reset-password" element={<ResetPassword />} /> */}

          {/* <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Home />} />
            </Route>
          </Route> */}
          {/* <Route path="*" element={<ErrorPage />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default AppRoutes;
