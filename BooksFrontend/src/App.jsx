import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthModal from "./components/AuthModal";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import BookPage from "./pages/BookPage";
import CartPage from "./pages/CartPage";
import CataloguePage from "./pages/CataloguePage";
import CheckoutPage from "./pages/CheckoutPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MainPage from "./pages/MainPage";
import PersonalPage from "./pages/PersonalPage";

function App() {
  const { isAuthOpen, closeAuth } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/books/:id" element={<BookPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/personal" element={<PersonalPage />} />
        </Route>
      </Routes>
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </BrowserRouter>
  );
}

export default App;
