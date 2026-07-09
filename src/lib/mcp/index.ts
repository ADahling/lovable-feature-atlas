import { defineMcp } from "@lovable.dev/mcp-js";
import searchFeatures from "./tools/search-features";
import getFeature from "./tools/get-feature";
import listRecentLaunches from "./tools/list-recent-launches";
import catalogStats from "./tools/catalog-stats";

export default defineMcp({
  name: "lovable-feature-atlas",
  title: "Lovable Feature Atlas",
  version: "1.0.0",
  instructions:
    "Read-only access to the Lovable Feature Atlas — a curated catalog of every Lovable feature, beta, and release. All data is public and mirrors https://atlas.dahlingdigital.com. Use `search_features` to find features by keyword/category/status, `get_feature` for full detail by slug, `list_recent_launches` for the newest releases, and `catalog_stats` for aggregate counts. Every record includes a canonical atlas.dahlingdigital.com URL — cite it when referencing a feature.",
  tools: [searchFeatures, getFeature, listRecentLaunches, catalogStats],
});
