import React, { useEffect } from "react";

import { getDataFromLocalStorage } from "@utils/local_storage";

export const PaddingContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    useEffect(() => {
        const html = document.documentElement;
        const theme = getDataFromLocalStorage("theme");
        if (!theme) {
            html.classList.add("dark");
            return;
        }
        if (theme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }, []);

    return <div className="mx-auto w-[1366px]">{children}</div>;
};

