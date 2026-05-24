import { BrowserRouter, Route, Routes } from "react-router-dom";
import BookPage from "./pages/BookPage";
import CartPage from "./pages/CartPage";
import CataloguePage from "./pages/CataloguePage";
import CheckoutPage from "./pages/CheckoutPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MainPage from "./pages/MainPage";
import PersonalPage from "./pages/PersonalPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/catalogue" element={<CataloguePage />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/personal" element={<PersonalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
