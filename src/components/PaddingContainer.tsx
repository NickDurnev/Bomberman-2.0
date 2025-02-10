import { useEffect } from "react";
import { getDataFromLocalStorage } from "@utils/local_storage";

export const PaddingContainer = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    useEffect(() => {
        const html = document.documentElement;
        const theme = getDataFromLocalStorage("theme");
        if (theme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }, []);

    return <div className="w-[1366px] mx-auto">{children}</div>;
};

