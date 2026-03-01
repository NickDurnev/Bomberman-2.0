import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { EmojiProvider } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@contexts/AuthContext";
import ErrorPage from "./error-page";
import Game from "./routes/game/Game";
import SelectMap from "./routes/map/SelectMap";
import Menu from "./routes/menu/Menu";
import Pending from "./routes/pending/Pending";
import Stats from "./routes/stats/Stats";

import {
  AuthCheck,
  BackgroundLines,
  PaddingContainer,
  Socket,
} from "@components/index";

import "./index.css";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <BackgroundLines>
        <Menu />
      </BackgroundLines>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/map",
    element: (
      <AuthCheck>
        <SelectMap />
      </AuthCheck>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pending/:gameId",
    element: (
      <AuthCheck>
        <Pending />
      </AuthCheck>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/game/:gameId",
    element: (
      <AuthCheck>
        <Game />
      </AuthCheck>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/stats",
    element: <Stats />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthProvider>
        <Socket>
          <PaddingContainer>
            <EmojiProvider data={emojiData}>
              <RouterProvider router={router} />
            </EmojiProvider>
          </PaddingContainer>
        </Socket>
      </AuthProvider>
    </GoogleOAuthProvider>
    <Toaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "bg-popover",
          title: "text-foreground",
        },
      }}
    />
  </React.StrictMode>,
);
