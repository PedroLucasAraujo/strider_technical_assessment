// src/layouts/RootLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { UserProvider } from "../lib/user-context";
import { ReduxProvider } from "../lib/redux-provider";

interface RootLayoutProps {
  children?: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div
      className={`font-inter bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen`}
    >
      <ReduxProvider>
        <UserProvider>{children || <Outlet />}</UserProvider>
      </ReduxProvider>
    </div>
  );
};
