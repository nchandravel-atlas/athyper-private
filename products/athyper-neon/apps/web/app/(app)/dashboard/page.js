"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
var navigation_1 = require("next/navigation");
var session_1 = require("@neon/auth/session");
function Dashboard() {
    var wb = (0, session_1.getWorkbenchFromSession)();
    if (!wb)
        (0, navigation_1.redirect)("/login");
    if (wb === "admin")
        (0, navigation_1.redirect)("/wb/admin");
    if (wb === "user")
        (0, navigation_1.redirect)("/wb/user");
    if (wb === "partner")
        (0, navigation_1.redirect)("/wb/partner");
    (0, navigation_1.redirect)("/login");
}
