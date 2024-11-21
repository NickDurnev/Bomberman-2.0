import { useEffect, useState } from "react";
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { Button } from "@components/index";

const DarkModeComponent = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }, [isDark]);

    return (
        <Button
            icon={
                isDark ? (
                    <FaMoon
                        size={30}
                        color="#fff"
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
            onClick={() => setIsDark((prev) => !prev)}
            className="rounded-full p-2"
        />
    );
};

export default DarkModeComponent;

