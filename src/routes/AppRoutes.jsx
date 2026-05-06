import LoginFormComponent from "@/components/Auth/Login";
import ResetFormComponent from "@/components/Auth/Reset";
import ResetMailFormComponent from "@/components/Auth/ResetMail";
import SignupFormComponent from "@/components/Auth/Signup";
import { CenterFeed } from "@/components/CenterFeed";
import ProfileCreateForm from "@/components/form/UserForm";
import HomeLayout from "@/layouts/HomeLayout";
import Friends from "@/pages/Friends";
import Message from "@/pages/Message";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import UsersInfo from "@/pages/UsersInfo";
import SettingsComponent from "@/pages/Setting";
import Profile from "@/pages/Profile";
import UsersList from "@/pages/UsersList";
import UsersFriendsList from "@/pages/UsersFriendsList";
import Survey from "@/pages/Survey";
import PostLikes from "@/pages/PostLikes";

function AppRoutes() {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LoginFormComponent />} />
            <Route path="/signup" element={<SignupFormComponent />} />
            <Route path="/profile/create" element={<ProfileCreateForm />} />
            <Route path="/reset" element={<ResetFormComponent />} />
            <Route path="/reset-password" element={<ResetMailFormComponent />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<HomeLayout />}>
              <Route path="/home" element={<CenterFeed />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/friends/:id" element={<UsersFriendsList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Message />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/settings" element={<SettingsComponent />} />
              <Route path="/users/:id" element={<UsersInfo />} />
              <Route path="/userslist" element={<UsersList />} />
              <Route path="/posts/:id/likes" element={<PostLikes />} />
              <Route path="/posts/:id/liked-users" element={<PostLikes />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default AppRoutes;
