/* ============================================================================
   Athyper — Bootstrap: Schemas + Extensions
   PostgreSQL 16+
   ============================================================================ */

-- Schemas
create schema if not exists core;
create schema if not exists meta;
create schema if not exists ref;
create schema if not exists ent;
create schema if not exists ui;
create schema if not exists wf;
create schema if not exists audit;
create schema if not exists collab;
create schema if not exists doc;
create schema if not exists sec;
create schema if not exists notify;

-- Extensions
create extension if not exists pgcrypto;
