import type { Config } from "tailwindcss";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "light-blue": "#EFF8FF",
                "dark-blue": "#DEE9F1",
                "main-beige": "#D6CBC5",
                "add-beige": "#FBCAA4",
                "main-black": "#3A3A3A",
                "main-white": "#EDF4FA",
                "main-green": "#86C5AA",
                "main-yellow": "#FFB217",
                "sky-blue": "#C5DEF1",
                "add-blue": "#DFF0FC",
                "main-red": "#FF7676",
                "dark-gray": "#383838",
                "light-olive": "#B5C6C4",
                "main-gray": "#6E7071",
                "accent-color": "#E3E4E4",
                "circle-bg": "rgba(74, 84, 88, 0.80)",
                "main-brown": "#A57046",
                "main-black-text": "#3A3A3A",
                "bank-border": "#D3E0EB",
                "blue-gray": "#94A0AB",
                "pharmacy-black": "#303030",
            },
            padding: {
                basic: "15px",
            },
            margin: {
                basic: "15px",
            },
            maxWidth: {
                basic: "500px",
                web: "1366px",
            },
            height: {
                "image-height": "370px",
            },
            width: {
                basic: "430px",
                web: "1366px",
                "image-width": "310px",
            },
            fontSize: {
                large: "42px",
            },
            boxShadow: {
                basic: "0px 20px 20px 0px rgba(181, 198, 196, 0.20)",
                modal: "0px 0px 12px -1px",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            transitionProperty: {
                "font-size": "font-size",
            },
        },
        screens: {
            mobile: "430px",
            "se-height": { raw: "(max-height: 710px)" },
        },
    },
    plugins: [
        require("tailwindcss-motion"),
        require("autoprefixer"),
        require("tailwindcss"),
    ],
};
export default config;

