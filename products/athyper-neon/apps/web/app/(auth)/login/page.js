"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var ui_1 = require("@neon/ui");
function LoginPage() {
    var _this = this;
    var router = (0, navigation_1.useRouter)();
    var _a = (0, react_1.useState)("admin1"), username = _a[0], setUsername = _a[1];
    var _b = (0, react_1.useState)("admin1"), password = _b[0], setPassword = _b[1];
    var _c = (0, react_1.useState)("admin"), workbench = _c[0], setWorkbench = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    function onSubmit(e) {
        return __awaiter(this, void 0, void 0, function () {
            var res, txt, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        e.preventDefault();
                        setError(null);
                        setLoading(true);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, 6, 7]);
                        return [4 /*yield*/, fetch("/api/auth/login", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ username: username, password: password, workbench: workbench })
                            })];
                    case 2:
                        res = _b.sent();
                        if (!!res.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, res.text()];
                    case 3:
                        txt = _b.sent();
                        throw new Error(txt || "Login failed");
                    case 4:
                        router.push("/dashboard");
                        router.refresh();
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _b.sent();
                        setError((_a = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) !== null && _a !== void 0 ? _a : "Login failed");
                        return [3 /*break*/, 7];
                    case 6:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    return (<main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
      <ui_1.Card className="w-full">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-black/60">Enter your credentials and choose a workbench.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">User ID</label>
            <ui_1.Input value={username} onChange={function (e) { return setUsername(e.target.value); }} placeholder="e.g. user1"/>
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <ui_1.Input type="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} placeholder="••••••••"/>
          </div>

          <div>
            <label className="text-sm font-medium">Type of Workbench</label>
            <ui_1.Select value={workbench} onChange={function (e) { return setWorkbench(e.target.value); }}>
              <option value="admin">Admin Workbench</option>
              <option value="user">User Workbench</option>
              <option value="partner">Partner Workbench</option>
            </ui_1.Select>
            <p className="mt-1 text-xs text-black/50">
              This selection controls the dashboard redirect (you can later derive it from Keycloak roles).
            </p>
          </div>

          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <ui_1.Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</ui_1.Button>
            <ui_1.Button type="button" variant="ghost" onClick={function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("/api/auth/logout", { method: "POST" })];
                    case 1:
                        _a.sent();
                        router.refresh();
                        return [2 /*return*/];
                }
            });
        }); }}>
              Clear Session
            </ui_1.Button>
          </div>
        </form>
      </ui_1.Card>
    </main>);
}
