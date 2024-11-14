import type { Config } from "tailwindcss";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                accent: "#794c8a",
                secondary: "#6f4f7a",
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

