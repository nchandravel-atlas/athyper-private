"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
exports.metadata = {
    title: "Neon",
    description: "athyper Neon Workbench"
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>);
}
