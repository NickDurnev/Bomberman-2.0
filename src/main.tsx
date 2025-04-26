import React from "react";
import { Toaster } from "sonner";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { EmojiProvider, Emoji } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";

import { useBrowser } from "./hooks/use-browser";
import ErrorPage from "./error-page";
import Menu from "./routes/menu/Menu";
import SelectMap from "./routes/map/SelectMap";
import Game from "./routes/game/Game";
import Pending from "./routes/pending/Pending";
import Stats from "./routes/stats/Stats";

import {
    Socket,
    PaddingContainer,
    BackgroundLines,
    AuthCheck,
} from "@components/index";

import "./index.css";

const DOMAIN = import.meta.env.VITE_AUTH_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { userBrowser } = useBrowser();

    return (
        <Auth0Provider
            domain={DOMAIN}
            clientId={CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
            useRefreshTokens={userBrowser !== "chrome"}
            cacheLocation={userBrowser === "chrome" ? "memory" : "localstorage"}
        >
            {children}
        </Auth0Provider>
    );
};

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
        <AuthProvider>
            <Socket>
                <PaddingContainer>
                    <EmojiProvider data={emojiData}>
                        <RouterProvider router={router} />
                    </EmojiProvider>
                </PaddingContainer>
            </Socket>
        </AuthProvider>
        <Toaster
            position="top-center"
            toastOptions={{
                classNames: {
                    toast: "bg-popover",
                    title: "text-foreground",
                },
            }}
        />
    </React.StrictMode>
);


