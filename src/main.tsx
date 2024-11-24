import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./error-page";

import Menu from "./routes/menu/Menu";
import SelectMap from "./routes/map/SelectMap";
import Game from "./routes/game/Game";

import { Socket, PaddingContainer, BackgroundLines } from "@components/index";

import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Menu />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/map",
        element: <SelectMap />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/game/:id",
        element: <Game />,
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
                    <BackgroundLines>
                        <RouterProvider router={router} />
                    </BackgroundLines>
                </PaddingContainer>
            </Socket>
        </Auth0Provider>
    </React.StrictMode>
);

