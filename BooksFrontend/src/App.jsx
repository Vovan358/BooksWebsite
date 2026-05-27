import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminGuard from "./components/AdminGuard";
import AuthRedirectHandler from "./components/AuthRedirectHandler";
import AuthModal from "./components/AuthModal";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import AdminPlaceholderPage from "./pages/AdminPlaceholderPage";
import AuthPage from "./pages/AuthPage";
import BookPage from "./pages/BookPage";
import CartPage from "./pages/CartPage";
import CataloguePage from "./pages/CataloguePage";
import CheckoutPage from "./pages/CheckoutPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MainPage from "./pages/MainPage";
import PersonalPage from "./pages/PersonalPage";
import UserPage from "./pages/UserPage";

function App() {
  const { isAuthOpen, closeAuth } = useAuth();

  return (
    <BrowserRouter>
      <AuthRedirectHandler />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/books/:id" element={<BookPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/users/:id" element={<UserPage />} />
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminPlaceholderPage />} />
            <Route path="/admin/users" element={<AdminPlaceholderPage />} />
            <Route path="/admin/orders" element={<AdminPlaceholderPage />} />
            <Route path="/admin/comments" element={<AdminPlaceholderPage />} />
            <Route path="/admin/books" element={<AdminPlaceholderPage />} />
          </Route>
        </Route>
      </Routes>
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </BrowserRouter>
  );
}

export default App;
