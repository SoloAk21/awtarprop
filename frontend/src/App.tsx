import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header.js';
import { BottomNav } from './components/BottomNav.js';
import { HomePage } from './pages/HomePage.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { PostPropertyPage } from './pages/PostPropertyPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { useAuthStore } from './store/useAuthStore.js';

export function App() {
  const authenticateTelegram = useAuthStore(
    (state) => state.authenticateTelegram
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col max-w-md mx-auto relative border-x border-slate-200">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/post" element={<PostPropertyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
