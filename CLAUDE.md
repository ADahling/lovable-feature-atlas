# Project Instructions

## Design System

Always read `DESIGN.md` before making visual or UI decisions. Typography, colors, spacing, layout, motion, and performance constraints are defined there. Do not introduce a dark theme, blocking loader, custom cursor, or first-paint dependency on decorative JavaScript without explicit user approval.

## Protected Contracts

Preserve public URLs, MCP tools, SEO/schema, feature data, quiz, draw, digest, status, sitemap, accessibility behavior, and CI coverage during the controlled rebuild. Treat the live production site as the rollback baseline until the replacement passes browser QA and production canary checks.

