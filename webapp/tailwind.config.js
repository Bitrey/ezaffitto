/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/react-tailwindcss-select/dist/index.esm.js"
    ],
    theme: {
        extend: {
            colors: {
                "red-500-transparent": "rgba(220, 38, 38, 0.69)",
                "green-500-transparent": "rgba(34, 197, 94, 0.69)",
                "blue-500-transparent": "rgba(59, 130, 246, 0.69)"
            },
            keyframes: {
                slideIn: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(-10px)"
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)"
                    }
                }
            },
            animation: {
                slideIn: "slideIn 0.3s ease-out"
            }
        }
    },
    important: true,
    plugins: []
};
