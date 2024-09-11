import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
          colors:{
            dark: "#1b1b1b",
            light: "#f5f5f5",
            primary: "#B63E96", // 240,86,199
            primaryDark: "#58E6D9", // 80,230,217
            green: "#008000", // 0,128,0
            roseQuartz: "#BFACB5", // 191,172,181
            pale: "#E5D0CC", // 229,208,204
            charcoal: "#444554", // 68,69,84
            sage: "#CDC6A5", 
            sage2: "#fefbf5",
            green2: "#9abe26",
            orange: "#eba607",
          },
        },
      },

    plugins: [],
};
export default config;
