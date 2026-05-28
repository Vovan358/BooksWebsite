import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./styles/pages.css";
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <ToastProvider>
          <FavoritesProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </FavoritesProvider>
        </ToastProvider>
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>
)
