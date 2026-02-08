// config/reserved-entities.ts
//
// Re-exports reserved slug validation for convenience.
// Entity slugs registered in core.module must not collide with these.

export { RESERVED_SLUGS, isReservedSlug } from "@/lib/nav/reserved-keywords";
