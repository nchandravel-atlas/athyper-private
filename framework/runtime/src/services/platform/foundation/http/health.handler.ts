
import type { HttpHandlerContext, RouteHandler } from "./types";
import type { Request, Response } from "express";

export class HealthHandler implements RouteHandler {
    async handle(_req: Request, res: Response, _ctx: HttpHandlerContext) {
        res.status(200).json({ ok: true });
    }
}