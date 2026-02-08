/* ============================================================================
   Athyper — Bootstrap: Schemas + Extensions
   PostgreSQL 16+
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- SCHEMAS
-- ----------------------------------------------------------------------------
create schema if not exists core;
create schema if not exists meta;
create schema if not exists ref;
create schema if not exists ent;
create schema if not exists ui;

-- ----------------------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()
