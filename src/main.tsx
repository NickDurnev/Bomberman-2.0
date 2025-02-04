import React from "react";
import { Toaster } from "sonner";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";

import Menu from "./routes/menu/Menu";
import SelectMap from "./routes/map/SelectMap";
import Game from "./routes/game/Game";
import Pending from "./routes/pending/Pending";
import Stats from "./routes/stats/Stats";

import { Socket, PaddingContainer, BackgroundLines } from "@components/index";

import "./index.css";

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
        element: <SelectMap />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/pending/:gameId",
        element: <Pending />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/game/:gameId",
        element: <Game />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/stats",
        element: <Stats />,
        errorElement: <ErrorPage />,
    },
]);

const DOMAIN = import.meta.env.VITE_AUTH_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Auth0Provider
            domain={DOMAIN}
            clientId={CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
        >
            <Socket>
                <PaddingContainer>
                    <RouterProvider router={router} />
                </PaddingContainer>
            </Socket>
        </Auth0Provider>
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

