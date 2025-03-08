// src/layouts/RootLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { UserProvider } from "@/lib/UserContext";
import { ReduxProvider } from "@/lib/ReduxProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const RootLayout: React.FC = () => {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen`}
      >
        <ReduxProvider>
          <UserProvider>
            <Outlet />
          </UserProvider>
        </ReduxProvider>
      </body>
    </html>
  );
};
