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
import PostLikes from "@/pages/PostLikes";
import NotFound from "@/pages/NotFound";
import InProgress from "@/pages/InProgress";
import ProfileViews from "@/pages/ProfileViews";
import UsersFollowingList from "@/pages/UsersFollowingList";
import Reels from "@/pages/Reels";
import VerifyAccountPage from "@/pages/VerifyAccountPage";
import ProfileRoute from "./profileRoute";
import HashtagPosts from "@/pages/HashtagPosts";
import BookmarkedPosts from "@/pages/BookmarkedPosts";
import Subscription from "@/pages/Subscription";

function AppRoutes() {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LoginFormComponent />} />
            <Route path="/signup" element={<SignupFormComponent />} />
            <Route path="/reset" element={<ResetFormComponent />} />
            <Route
              path="/reset-password"
              element={<ResetMailFormComponent />}
            />
            <Route path="/verify-account" element={<VerifyAccountPage />} />
          </Route>
          <Route element={<ProfileRoute />}>
            <Route path="/profile/create" element={<ProfileCreateForm />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<HomeLayout />}>
              <Route path="/home" element={<CenterFeed />} />
              {/* <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} /> */}
              <Route path="/friends" element={<Friends />} />
              <Route path="/friends/:id" element={<UsersFriendsList />} />
              <Route path="/following/:id" element={<UsersFollowingList />} />
              <Route path="/profileViews" element={<ProfileViews />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Message />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/settings" element={<SettingsComponent />} />
              <Route path="/bookmarked-posts" element={<BookmarkedPosts />} />
              <Route path="/users/:id" element={<UsersInfo />} />
              <Route path="/userslist" element={<UsersList />} />
              <Route path="/posts/:id/likes" element={<PostLikes />} />
              <Route path="/posts/:id/liked-users" element={<PostLikes />} />
              <Route path="/hashtags/:tag" element={<HashtagPosts />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/inprogress" element={<InProgress />} />
        </Routes>
      </Router>
    </div>
  );
}

export default AppRoutes;
