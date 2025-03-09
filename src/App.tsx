// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RootLayout } from "./layouts/RootLayout";
import { Home } from "./pages/Home";
import ProfilePage from "./pages/Profile";

export const App: React.FC = () => {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/search" element={<Home />} />
        </Routes>
      </RootLayout>
    </Router>
  );
};
