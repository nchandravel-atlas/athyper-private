"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tailwind_preset_1 = require("@neon/theme/tailwind.preset");
exports.default = {
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
    presets: [tailwind_preset_1.default],
    theme: { extend: {} },
    plugins: []
};
