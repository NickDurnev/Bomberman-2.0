import { useEffect, useState } from "react";
import { BROWSERS } from "../utils/constants";

export const useBrowser = () => {
    const [userBrowser, setUserBrowser] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userAgent = window.navigator.userAgent;

            const isChrome =
                /chrome/i.test(navigator.userAgent) &&
                !/Edge/i.test(userAgent) &&
                !/Edg/i.test(userAgent);
            const isEdge = /Edge/i.test(userAgent) || /Edg/i.test(userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);

            if (isSafari) {
                setUserBrowser(BROWSERS.safari);
            } else if (isChrome) {
                setUserBrowser(BROWSERS.chrome);
            } else if (isEdge) {
                setUserBrowser(BROWSERS.edge);
            } else {
                setUserBrowser(BROWSERS.other);
            }
        }
    }, []);

    return { userBrowser };
};

