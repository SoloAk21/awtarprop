import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header.js";
import { BottomNav } from "./components/BottomNav.js";
import { ToastContainer } from "./components/ToastContainer.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";
import { HomePage } from "./pages/HomePage.js";
import { FavoritesPage } from "./pages/FavoritesPage.js";
import { PostPropertyPage } from "./pages/PostPropertyPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { useAuthStore } from "./store/useAuthStore.js";

export function App() {
  const authenticateTelegram = useAuthStore(
    (state) => state.authenticateTelegram,
  );

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    authenticateTelegram();
  }, [authenticateTelegram]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col max-w-md mx-auto relative border-x border-slate-200/80">
        <Header />
        <ToastContainer />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<Navigate to="/" replace />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <PostPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
