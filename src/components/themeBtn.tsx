import { useEffect, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import {
    addToLocalStorage,
    getDataFromLocalStorage,
} from "@utils/local_storage";
import { Button } from "@components/index";

export const ThemeBtn = () => {
    const [isDark, setIsDark] = useState(
        getDataFromLocalStorage("theme") === "dark"
    );
    const html = document.documentElement;

    useEffect(() => {
        if (isDark) {
            html.classList.add("dark");
            addToLocalStorage({ key: "theme", value: "dark" });
        } else {
            html.classList.remove("dark");
            addToLocalStorage({ key: "theme", value: "light" });
        }
    }, [isDark]);

    return (
        <Button
            icon={
                isDark ? (
                    <IoSunny
                        size={30}
                        color="#ddd991"
                        className="motion-preset-pop motion-loop-once"
                    />
                ) : (
                    <FaMoon
                        size={30}
                        color="#e2e1e1"
                        className="motion-preset-pop motion-loop-once"
                    />
                )
            }
            onClick={() => setIsDark((prev) => !prev)}
            className="rounded-full p-2"
        />
    );
};

