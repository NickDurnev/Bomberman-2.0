import { useEffect, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import {
    addToLocalStorage,
    getDataFromLocalStorage,
} from "@utils/local_storage";
import { Button } from "@components/index";

export const ThemeBtn = () => {
    const [isLight, setIsLight] = useState(
        getDataFromLocalStorage("theme") === "light"
    );
    const html = document.documentElement;

    useEffect(() => {
        if (isLight) {
            html.classList.remove("dark");
            addToLocalStorage({ key: "theme", value: "light" });
        } else {
            html.classList.add("dark");
            addToLocalStorage({ key: "theme", value: "dark" });
        }
    }, [isLight]);

    return (
        <Button
            icon={
                isLight ? (
                    <FaMoon
                        size={30}
                        color="#e2e1e1"
                        className="motion-preset-pop motion-loop-once"
                    />
                ) : (
                    <IoSunny
                        size={30}
                        color="#ddd991"
                        className="motion-preset-pop motion-loop-once"
                    />
                )
            }
            onClick={() => setIsLight((prev) => !prev)}
            className="rounded-full p-2"
        />
    );
};

