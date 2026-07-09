// Client-safe server function wrappers for public digest archive.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ArchiveDetail, ArchiveListItem } from "./digest-archive.server";

export type { ArchiveDetail, ArchiveFeature, ArchiveListItem } from "./digest-archive.server";

export const listPublishedDigests = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArchiveListItem[]> => {
    const { listPublishedDigestsImpl } = await import("./digest-archive.server");
    return listPublishedDigestsImpl();
  },
);

export const getPublishedDigest = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<ArchiveDetail | null> => {
    const { getPublishedDigestImpl } = await import("./digest-archive.server");
    return getPublishedDigestImpl(data.id);
  });
