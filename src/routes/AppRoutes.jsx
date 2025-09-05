import LoginFormComponent from "@/components/Auth/Login";
import { CenterFeed } from "@/components/CenterFeed";
import HomeLayout from "@/layouts/HomeLayout";
import Friends from "@/pages/Friends";
import Message from "@/pages/Message";
import Profile from "@/pages/Profile";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function AppRoutes() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginFormComponent />} />
          <Route element={<HomeLayout />}>
            <Route path="/home" element={<CenterFeed />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Message />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default AppRoutes;
