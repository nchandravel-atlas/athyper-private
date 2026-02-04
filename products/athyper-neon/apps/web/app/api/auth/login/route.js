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
exports.POST = POST;
var server_1 = require("next/server");
var keycloak_1 = require("@neon/auth/keycloak");
var session_1 = require("@neon/auth/session");
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, username, password, workbench, baseUrl, realm, clientId, session, e_1;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, req.json()];
                case 1:
                    _a = _f.sent(), username = _a.username, password = _a.password, workbench = _a.workbench;
                    if (!username || !password || !workbench) {
                        return [2 /*return*/, new server_1.NextResponse("Missing username/password/workbench", { status: 400 })];
                    }
                    baseUrl = (_b = process.env.KEYCLOAK_BASE_URL) !== null && _b !== void 0 ? _b : "http://keycloak.local";
                    realm = (_c = process.env.KEYCLOAK_REALM) !== null && _c !== void 0 ? _c : "neon-dev";
                    clientId = (_d = process.env.KEYCLOAK_CLIENT_ID) !== null && _d !== void 0 ? _d : "neon-web";
                    return [4 /*yield*/, (0, keycloak_1.keycloakPasswordGrant)({
                            baseUrl: baseUrl,
                            realm: realm,
                            clientId: clientId,
                            username: username,
                            password: password,
                            workbench: workbench
                        })];
                case 2:
                    session = _f.sent();
                    (0, session_1.setSession)(session);
                    return [2 /*return*/, server_1.NextResponse.json({ ok: true })];
                case 3:
                    e_1 = _f.sent();
                    return [2 /*return*/, new server_1.NextResponse((_e = e_1 === null || e_1 === void 0 ? void 0 : e_1.message) !== null && _e !== void 0 ? _e : "Login error", { status: 401 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
