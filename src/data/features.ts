// Lovable Features Dataset — regenerated from Lovable Cloud (production data).
// Static fallback used when the live DB read fails. Do not edit by hand;
// re-run the export from src/lib/features.functions.ts source table instead.

export interface Feature {
  id: string;
  name: string;
  category: string;
  status: "GA" | "Beta" | "Removed";
  releaseDate: string;
  pricing: string;
  icon: string;
  tagline: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  source: string;
}

export const features: Feature[] = [
  {
    "id": "mapbox-connector",
    "icon": "✨",
    "name": "Mapbox Connector",
    "source": "https://docs.lovable.dev/integrations/mapbox",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Maps, geocoding, directions, and location search for apps.",
    "category": "App Connectors",
    "useCases": [
      "Store locators and service-area maps",
      "Delivery and field-service routing",
      "Address autocomplete in signup and checkout forms"
    ],
    "description": "Mapbox lets apps render interactive maps and call location services — geocoding addresses, routing between points, searching places, and generating static map images — using the workspace-connected Mapbox account.",
    "releaseDate": "2026-07-14",
    "capabilities": [
      "Render interactive maps",
      "Forward and reverse geocoding",
      "Directions and routing",
      "Places and POI search",
      "Static map image generation"
    ]
  },
  {
    "id": "klipy-connector",
    "icon": "✨",
    "name": "Klipy Connector",
    "source": "https://docs.lovable.dev/integrations/klipy",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "GIF, sticker, clip, and emoji search for apps.",
    "category": "App Connectors",
    "useCases": [
      "Chat and messaging apps",
      "Reaction pickers",
      "Content creation tools"
    ],
    "description": "Klipy lets apps search and embed GIFs, stickers, video clips, and emoji from Klipy's family-safe media library.",
    "releaseDate": "2026-07-08",
    "capabilities": [
      "Search GIFs and stickers",
      "Fetch video clips",
      "Return trending media",
      "Filter by content rating",
      "Embed media in messages"
    ]
  },
  {
    "id": "logo-dev-connector",
    "icon": "✨",
    "name": "Logo.dev Connector",
    "source": "https://docs.lovable.dev/integrations/logo-dev",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Fetch brand logos and company metadata by domain.",
    "category": "App Connectors",
    "useCases": [
      "Integration directories",
      "CRM enrichment",
      "Company pickers"
    ],
    "description": "Logo.dev lets apps fetch high-resolution brand logos and company metadata for any domain, so directories, CRMs, and integration lists always render the correct brand mark.",
    "releaseDate": "2026-07-08",
    "capabilities": [
      "Fetch logos by domain",
      "Return multiple logo formats",
      "Read company metadata",
      "Serve cached assets",
      "Query brand search"
    ]
  },
  {
    "id": "quickbooks-connector",
    "icon": "✨",
    "name": "QuickBooks Connector",
    "source": "https://docs.lovable.dev/integrations/quickbooks",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Sync customers, invoices, and accounting data with QuickBooks Online.",
    "category": "App Connectors",
    "useCases": [
      "Client billing dashboards",
      "Accounting automation",
      "Bookkeeping tools"
    ],
    "description": "QuickBooks lets apps read and write customers, invoices, bills, payments, vendors, and general-ledger data in a connected QuickBooks Online company.",
    "releaseDate": "2026-07-08",
    "capabilities": [
      "Manage customers and vendors",
      "Create invoices and bills",
      "Record payments",
      "Read chart of accounts",
      "Query reports"
    ]
  },
  {
    "id": "wordpress-self-hosted-connector",
    "icon": "✨",
    "name": "WordPress (self-hosted) Connector",
    "source": "https://docs.lovable.dev/integrations/wordpress",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and manage posts, pages, and media on self-hosted WordPress sites.",
    "category": "App Connectors",
    "useCases": [
      "Content dashboards",
      "Editorial tooling",
      "Multi-site publishing workflows"
    ],
    "description": "WordPress (self-hosted) lets apps read and manage posts, pages, media, users, and custom post types on any self-hosted WordPress site through the REST API.",
    "releaseDate": "2026-07-08",
    "capabilities": [
      "Read posts and pages",
      "Publish and update content",
      "Manage media",
      "Read users and taxonomies",
      "Work with custom post types"
    ]
  },
  {
    "id": "x-connector",
    "icon": "✨",
    "name": "X Connector",
    "source": "https://docs.lovable.dev/integrations/x",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read profiles and timelines and post to X on the connected user's behalf.",
    "category": "App Connectors",
    "useCases": [
      "Post schedulers",
      "Social listening tools",
      "Creator dashboards"
    ],
    "description": "X (formerly Twitter) lets apps read profile data, timelines, and engagement metrics, and post on behalf of the connected user.",
    "releaseDate": "2026-07-08",
    "capabilities": [
      "Read profile data",
      "Read timelines",
      "Fetch engagement metrics",
      "Post updates",
      "Reply and repost"
    ]
  },
  {
    "id": "app-connector-calendly",
    "icon": "✨",
    "name": "App connector: Calendly",
    "source": "https://docs.lovable.dev/changelog#app-connector-calendly",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Integrate your apps with Calendly for seamless scheduling.",
    "category": "App Connectors",
    "useCases": [
      "Add booking flows to an app using a client's Calendly account.",
      "Pull scheduled events into a dashboard for a services business.",
      "Let users cancel a booked meeting from inside the app."
    ],
    "description": "Calendly allows your apps to build booking and scheduling flows using connected user and organization data. Apps can manage events and fetch invitee details easily through the integration.",
    "releaseDate": "2026-06-24",
    "capabilities": [
      "Read user profile data",
      "List event types",
      "Fetch scheduled events",
      "Create scheduling links",
      "Cancel scheduled events",
      "Interact with user calendars"
    ]
  },
  {
    "id": "lovable-mcp-updates",
    "icon": "✨",
    "name": "Lovable MCP updates",
    "source": "https://docs.lovable.dev/changelog#lovable-mcp-updates",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easier integration with Microsoft tools.",
    "category": "Integrations",
    "useCases": [
      "Find the Lovable MCP server through Azure API Center.",
      "Set up Lovable access for a Microsoft-centric enterprise team.",
      "Connect Lovable to Copilot Studio for enterprise workflows."
    ],
    "description": "Lovable MCP server is now listed in the Azure API Center directory, improving access for enterprise teams using Microsoft products.",
    "releaseDate": "2026-06-24",
    "capabilities": [
      "Connect easily with Microsoft tools",
      "Enhanced discoverability",
      "Improved integration",
      "Support for enterprise needs",
      "Seamless setup in Azure",
      "Access from Copilot Studio"
    ]
  },
  {
    "id": "manage-scheduled-jobs-in-lovable-cloud",
    "icon": "✨",
    "name": "Manage scheduled jobs in Lovable Cloud",
    "source": "https://docs.lovable.dev/changelog#manage-scheduled-jobs-in-lovable-cloud",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Effortlessly manage your app's scheduled jobs in Lovable Cloud.",
    "category": "Cloud",
    "useCases": [
      "Check whether a nightly cron job ran successfully.",
      "Disable a scheduled job temporarily without deleting it.",
      "Review run history for every scheduled job in one tab."
    ],
    "description": "If your app uses Lovable Cloud, you can manage scheduled jobs from the new Jobs tab in your project’s Cloud panel. View every scheduled job's status, last run time, and run history while enabling or disabling jobs right from the page.",
    "releaseDate": "2026-06-24",
    "capabilities": [
      "View scheduled jobs",
      "Enable/disable jobs",
      "Monitor job status and history",
      "Administer job settings via SQL",
      "Understand credit usage",
      "Manage multiple jobs from a single interface"
    ]
  },
  {
    "id": "cleaner-preview-error-messages",
    "icon": "✨",
    "name": "Cleaner preview error messages",
    "source": "https://docs.lovable.dev/changelog#cleaner-preview-error-messages",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Improve debugging with clearer error visuals.",
    "category": "Testing",
    "useCases": [
      "Understand a preview error without digging through logs.",
      "Guide a teammate toward a fix using a clearer error message.",
      "Debug faster with consistent, readable error formatting."
    ],
    "description": "Error messages during the preview state have been redesigned to be cleaner and more consistent, making it easier for users to understand and address issues.",
    "releaseDate": "2026-06-23",
    "capabilities": [
      "Identify error types easily",
      "Provide detailed error feedback",
      "Improve user experience during testing",
      "Manage error handling efficiently",
      "Guide users towards solutions",
      "Streamline debugging process"
    ]
  },
  {
    "id": "better-standard-image-generation-while-building",
    "icon": "✨",
    "name": "Better standard image generation while building",
    "source": "https://docs.lovable.dev/changelog#better-standard-image-generation-while-building",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "High-quality image generation at your fingertips.",
    "category": "AI Models",
    "useCases": [
      "Generate cleaner app icons with accurate embedded text.",
      "Produce polished mockup visuals during the build process.",
      "Create marketing assets with sharper detail than before."
    ],
    "description": "Lovable now uses GPT Image 2 for creating standard-quality images while building assets for your app, resulting in better text and detail accuracy.",
    "releaseDate": "2026-06-22",
    "capabilities": [
      "Generate images automatically",
      "Enhance visual content quality",
      "Streamline asset creation process",
      "Support design mockups",
      "Produce polished visuals",
      "Integrate with existing workflows"
    ]
  },
  {
    "id": "linking-email-tasks-to-projects",
    "icon": "✨",
    "name": "Linking Email Tasks to Projects",
    "source": "https://docs.lovable.dev/changelog#linking-email-tasks-to-projects",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Connect tasks from emails directly to your projects.",
    "category": "Workflow",
    "useCases": [
      "Link a client's email request directly to its project task.",
      "Track a task from inbox to project without losing context.",
      "Keep email-driven work connected to the right build."
    ],
    "description": "Users can now create direct links between tasks in emails and corresponding projects in Lovable, enhancing workflow and project management efficiency.",
    "releaseDate": "2026-06-21",
    "capabilities": [
      "Create tasks from email",
      "Link emails to projects",
      "Enhance task management",
      "Streamline workflow between channels",
      "Improve tracking of tasks",
      "Facilitate better collaboration"
    ]
  },
  {
    "id": "gatewayapi-connector",
    "icon": "✨",
    "name": "GatewayAPI Connector",
    "source": "https://docs.lovable.dev/integrations/gatewayapi",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send SMS and RCS messages, track delivery, and receive replies.",
    "category": "App Connectors",
    "useCases": [
      "Transactional notifications",
      "Two-factor codes",
      "Customer messaging workflows"
    ],
    "description": "GatewayAPI lets apps send SMS and RCS messages, track delivery status, and handle inbound messages through a connected GatewayAPI account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Send SMS messages",
      "Send RCS messages",
      "Track delivery status",
      "Receive inbound messages",
      "Manage sender IDs"
    ]
  },
  {
    "id": "improve-database-performance-detection",
    "icon": "✨",
    "name": "Improve Database Performance Detection",
    "source": "https://docs.lovable.dev/changelog#find-and-fix-database-performance-problems",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Detect and fix slow database queries effectively.",
    "category": "Cloud",
    "useCases": [
      "Spot the query slowing down the app before users notice.",
      "Get an index recommendation based on real call counts.",
      "Review execution time trends to catch a regression early."
    ],
    "description": "Now you can identify the slowest database queries within your app's backend and receive insights for optimizations that can significantly improve performance.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Identify slow database queries",
      "Propose targeted indexes",
      "Inspect query plans",
      "Analyze execution time",
      "Monitor call counts"
    ]
  },
  {
    "id": "improved-sharing-links",
    "icon": "✨",
    "name": "Improved sharing links",
    "source": "https://docs.lovable.dev/changelog#cleaner-preview-links",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Cleaner and shorter preview links.",
    "category": "Editor",
    "useCases": [
      "Send a short, view-only link to a client for feedback.",
      "Share in-progress work without exposing full project access.",
      "Rely on a link that stays valid for a week of review."
    ],
    "description": "New preview links are now easier to share with a cleaner format. These links are public, view-only, and valid for 7 days, enabling effortless sharing of ongoing work without granting full project access.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Shortened URLs",
      "Public view-only access",
      "7-day validity",
      "Easily share with clients"
    ]
  },
  {
    "id": "lexware-connector",
    "icon": "✨",
    "name": "Lexware Connector",
    "source": "https://docs.lovable.dev/integrations/lexware",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Contacts, invoices, quotations, and accounting data in Lexware.",
    "category": "App Connectors",
    "useCases": [
      "Client billing dashboards",
      "Accounting automation",
      "Invoice tracking"
    ],
    "description": "Lexware lets apps work with contacts, invoices, quotations, vouchers, and accounting data inside a connected Lexware Office account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage contacts",
      "Create invoices",
      "Send quotations",
      "Post vouchers",
      "Read accounting data"
    ]
  },
  {
    "id": "pipedrive-connector",
    "icon": "✨",
    "name": "Pipedrive Connector",
    "source": "https://docs.lovable.dev/integrations/pipedrive",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Manage deals, people, activities, leads, and pipelines in Pipedrive.",
    "category": "App Connectors",
    "useCases": [
      "Sales dashboards",
      "Pipeline reporting",
      "Lead capture tools"
    ],
    "description": "Pipedrive lets apps manage deals, people, organizations, activities, leads, and pipelines from a connected Pipedrive account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage deals",
      "Manage people and organizations",
      "Log activities",
      "Track leads",
      "Update pipelines",
      "Read reports"
    ]
  },
  {
    "id": "prestashop-connector",
    "icon": "✨",
    "name": "PrestaShop Connector",
    "source": "https://docs.lovable.dev/integrations/prestashop",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and manage PrestaShop catalog, order, and customer data.",
    "category": "App Connectors",
    "useCases": [
      "Merchant dashboards",
      "Inventory tools",
      "Order management apps"
    ],
    "description": "PrestaShop lets apps read and manage catalog, order, customer, and inventory data from a connected PrestaShop store.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage products",
      "Read and update orders",
      "Manage customers",
      "Track inventory",
      "Handle returns"
    ]
  },
  {
    "id": "sevdesk-connector",
    "icon": "✨",
    "name": "Sevdesk Connector",
    "source": "https://docs.lovable.dev/integrations/sevdesk",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Contacts, invoices, orders, and bookkeeping in Sevdesk.",
    "category": "App Connectors",
    "useCases": [
      "Small-business billing tools",
      "Accounting dashboards",
      "Invoice automation"
    ],
    "description": "Sevdesk lets apps manage contacts, invoices, orders, vouchers, and bookkeeping workflows from a connected Sevdesk account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage contacts",
      "Create invoices",
      "Track orders",
      "Post vouchers",
      "Reconcile bookkeeping"
    ]
  },
  {
    "id": "wave-connector",
    "icon": "✨",
    "name": "Wave Connector",
    "source": "https://docs.lovable.dev/integrations/wave",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Customers, products, invoices, estimates, and accounting in Wave.",
    "category": "App Connectors",
    "useCases": [
      "Freelancer billing tools",
      "Small-business dashboards",
      "Estimate-to-invoice flows"
    ],
    "description": "Wave lets apps manage customers, products, invoices, estimates, vendors, and accounting data from a connected Wave account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage customers and vendors",
      "Create invoices",
      "Send estimates",
      "Track products",
      "Read accounting data"
    ]
  },
  {
    "id": "wix-connector",
    "icon": "✨",
    "name": "Wix Connector",
    "source": "https://docs.lovable.dev/integrations/wix",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Sites, e-commerce, bookings, CRM, and CMS data from Wix.",
    "category": "App Connectors",
    "useCases": [
      "Merchant tooling",
      "Booking dashboards",
      "Content management add-ons"
    ],
    "description": "Wix lets apps work with Wix sites, e-commerce, bookings, CRM, CMS content, and other business resources from a connected Wix account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Read site data",
      "Manage e-commerce orders",
      "Handle bookings",
      "Query CRM records",
      "Manage CMS content"
    ]
  },
  {
    "id": "woocommerce-connector",
    "icon": "✨",
    "name": "WooCommerce Connector",
    "source": "https://docs.lovable.dev/integrations/woocommerce",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Manage WooCommerce products, orders, customers, and coupons.",
    "category": "App Connectors",
    "useCases": [
      "Store dashboards",
      "Fulfillment tools",
      "Customer-facing order status pages"
    ],
    "description": "WooCommerce lets apps manage products, orders, customers, coupons, and store data from a connected WooCommerce store.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage products",
      "Process orders",
      "Manage customers",
      "Issue coupons",
      "Read store data"
    ]
  },
  {
    "id": "zoho-books-connector",
    "icon": "✨",
    "name": "Zoho Books Connector",
    "source": "https://docs.lovable.dev/integrations/zoho-books",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Customers, invoices, bills, expenses, and accounting in Zoho Books.",
    "category": "App Connectors",
    "useCases": [
      "Client billing dashboards",
      "Expense tracking",
      "Financial reporting tools"
    ],
    "description": "Zoho Books lets apps manage customers, invoices, bills, expenses, projects, and accounting records from a connected Zoho Books account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage customers",
      "Create invoices",
      "Log bills",
      "Track expenses",
      "Manage projects",
      "Read accounting reports"
    ]
  },
  {
    "id": "zoho-crm-connector",
    "icon": "✨",
    "name": "Zoho CRM Connector",
    "source": "https://docs.lovable.dev/integrations/zoho-crm",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read, search, create, and update leads, contacts, accounts, and deals.",
    "category": "App Connectors",
    "useCases": [
      "Sales dashboards",
      "Lead capture tools",
      "Pipeline reporting"
    ],
    "description": "Zoho CRM lets apps read, search, create, and update leads, contacts, accounts, and deals from a connected Zoho CRM account.",
    "releaseDate": "2026-06-16",
    "capabilities": [
      "Manage leads",
      "Manage contacts and accounts",
      "Create and update deals",
      "Search records",
      "Read pipeline data"
    ]
  },
  {
    "id": "find-and-fix-database-performance-problems",
    "icon": "✨",
    "name": "Find and fix database performance problems",
    "source": "https://docs.lovable.dev/changelog#find-and-fix-database-performance-problems",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Identify slow queries and optimize performance.",
    "category": "Testing",
    "useCases": [
      "Find the slowest query before it becomes a production issue.",
      "Get an indexing suggestion for a query causing app lag.",
      "Rank database queries by impact before optimizing anything."
    ],
    "description": "Lovable now analyzes the slowest database queries affecting your app’s performance, reading PostgreSQL query statistics to rank the heaviest queries and suggest optimizations.",
    "releaseDate": "2026-06-10",
    "capabilities": [
      "Analyze query execution times",
      "Identify high-impact database queries",
      "Suggest targeted indexing opportunities",
      "Inspect and suggest query plans",
      "Visualize database performance metrics",
      "Help prevent bottlenecks preemptively"
    ]
  },
  {
    "id": "preview-toolbar",
    "icon": "✨",
    "name": "Preview toolbar",
    "source": "https://docs.lovable.dev/features/preview-toolbar",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "A faster way to edit your app directly from the preview.",
    "category": "Workflow",
    "useCases": [
      "Edit text inline directly from the live preview.",
      "Annotate a UI element without switching to the code editor.",
      "Leave a contextual comment for a collaborator on the preview."
    ],
    "description": "The new preview toolbar replaces Visual edits, allowing you to edit content directly from the preview. Select elements, edit text inline, draw annotations, and add comments, all while keeping context with your collaborators.",
    "releaseDate": "2026-06-10",
    "capabilities": [
      "Select elements for context",
      "Edit text inline",
      "Draw annotations",
      "Add contextual comments",
      "Minimize toolbar to edge tab",
      "Auto, Light, or Dark theme"
    ]
  },
  {
    "id": "reference-exact-lines-of-code-in-chat",
    "icon": "✨",
    "name": "Reference exact lines of code in chat",
    "source": "https://docs.lovable.dev/features/code-mode",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Point to precise lines of code in discussions.",
    "category": "Workflow",
    "useCases": [
      "Point the agent to the exact line causing a bug.",
      "Discuss a specific code change without describing it in words.",
      "Select a block of lines and reference them in one message."
    ],
    "description": "You can now reference exact code lines in chat, enhancing clarity and reducing confusion when discussing code changes. Simply click on the line number in the code editor and reference it in chat.",
    "releaseDate": "2026-06-10",
    "capabilities": [
      "Add line references in chat",
      "Drag to select multiple lines",
      "Use shortcut keys for reference",
      "Jump to code lines from messages",
      "Contextual reference management",
      "Enhanced collaboration on code discussions"
    ]
  },
  {
    "id": "user-insights-for-workspace-members",
    "icon": "✨",
    "name": "User insights for workspace members",
    "source": "https://docs.lovable.dev/features/people#user-insights",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Get detailed insights about your workspace members.",
    "category": "Community",
    "useCases": [
      "Check a member's role and project involvement before an audit.",
      "Review credit usage per team member across the workspace.",
      "Sort the member list by activity to spot who's inactive."
    ],
    "description": "Workspace admins and owners can now access user insights profiles, detailing member identities, roles, project involvement, and credit usage, aiding better management.",
    "releaseDate": "2026-06-10",
    "capabilities": [
      "View member identity and role",
      "Credit usage tracking",
      "Project creation details",
      "Collaboration history",
      "Pending project invitations",
      "Sort project lists by various metrics"
    ]
  },
  {
    "id": "markdown-preview-in-the-code-editor",
    "icon": "✨",
    "name": "Markdown preview in the code editor",
    "source": "https://docs.lovable.dev/features/code-mode",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Toggle markdown previews for easier reading.",
    "category": "Editor",
    "useCases": [
      "Read formatted documentation without leaving the code editor.",
      "Preview a README's tables and links before committing it.",
      "Toggle between raw markdown and rendered view while editing."
    ],
    "description": "Users can now toggle a preview for Markdown files in the code editor, enhancing the reading experience for documents by displaying formatted text without leaving the editor.",
    "releaseDate": "2026-06-08",
    "capabilities": [
      "Toggle preview on/off",
      "Readability enhancement",
      "Support for tables and links",
      "Inline preview for various markdown formats",
      "Seamless navigation in editor"
    ]
  },
  {
    "id": "transfer-a-domain-to-lovable",
    "icon": "✨",
    "name": "Transfer a domain to Lovable",
    "source": "https://docs.lovable.dev/features/transfer-domain",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily transfer your domain for centralized management.",
    "category": "Workspace",
    "useCases": [
      "Consolidate an outside domain's DNS management into Lovable.",
      "Move an existing domain in without any site downtime.",
      "Manage renewals and DNS records in one place after transfer."
    ],
    "description": "Workspace admins and owners can now transfer domains from another registrar into Lovable, allowing renewals, DNS records, and registration details to be managed in one place. The process is guided and takes about 5 to 7 days.",
    "releaseDate": "2026-06-08",
    "capabilities": [
      "Domain eligibility check",
      "Guided transfer details",
      "Choose DNS records",
      "Centralized management",
      "No downtime during transfer"
    ]
  },
  {
    "id": "toggle-whois-privacy-after-purchase",
    "icon": "✨",
    "name": "Toggle WHOIS privacy after purchase",
    "source": "https://docs.lovable.dev/changelog#toggle-whois-privacy-after-purchase",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily manage WHOIS privacy settings post-domain purchase.",
    "category": "Workspace",
    "useCases": [
      "Turn WHOIS privacy on for a domain bought without it.",
      "Adjust domain privacy settings after the initial purchase.",
      "Manage privacy for multiple domain types from one settings page."
    ],
    "description": "Now, users can disable or re-enable WHOIS privacy for their domains after purchase directly through workspace settings. This flexibility allows better management of domain privacy according to user needs.",
    "releaseDate": "2026-06-05",
    "capabilities": [
      "Toggle WHOIS privacy setting",
      "Access through workspace settings",
      "User-friendly interface",
      "Supports multiple TLDs",
      "Centralized domain management",
      "Real-time updates"
    ]
  },
  {
    "id": "buy-a-domain-without-connecting-it-to-a-project",
    "icon": "✨",
    "name": "Buy a domain without connecting it to a project",
    "source": "https://docs.lovable.dev/changelog#buy-a-domain-without-connecting-it-to-a-project",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Purchase domains independently from project connections.",
    "category": "Workspace",
    "useCases": [
      "Reserve a domain before deciding which project it belongs to.",
      "Buy several domains up front and assign them to projects later.",
      "Manage all workspace domains from one central settings page."
    ],
    "description": "Users can now buy domains directly from workspace settings and keep them unconnected to any project, allowing greater flexibility in workspace management. Domains can be linked to any project later as needed.",
    "releaseDate": "2026-06-04",
    "capabilities": [
      "Purchase domains without immediate project linkage",
      "Manage domains centrally",
      "Flexible domain connections",
      "User-friendly purchasing process",
      "Supports multiple TLDs",
      "Simplified workspace settings"
    ]
  },
  {
    "id": "transfer-a-domain-out-to-another-registrar",
    "icon": "✨",
    "name": "Transfer a domain out to another registrar",
    "source": "https://docs.lovable.dev/changelog#transfer-a-domain-out-to-another-registrar",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily transfer your domains to other registrars.",
    "category": "Workspace",
    "useCases": [
      "Move a Lovable-registered domain to a different registrar.",
      "Track a domain transfer's status until it completes.",
      "Revoke a transfer lock when a domain needs to move elsewhere."
    ],
    "description": "Users can now transfer domains registered through Lovable to another registrar, enhancing flexibility in domain management. This feature includes convenient management tools for admins to oversee the transfer process.",
    "releaseDate": "2026-06-04",
    "capabilities": [
      "Initiate transfer to any registrar",
      "Track transfer status",
      "Revoke transfer locks",
      "Supports EPP authorization codes",
      "Admin management tools",
      "User-friendly interface"
    ]
  },
  {
    "id": "configure-who-can-create-app-connector-connections",
    "icon": "✨",
    "name": "Configure who can create app connector connections",
    "source": "https://docs.lovable.dev/changelog#configure-who-can-create-app-connector-connections",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Control access to app connector creation in your workspace.",
    "category": "Security",
    "useCases": [
      "Restrict connector setup to a trusted subset of the team.",
      "Centralize app connector management under one admin role.",
      "Audit who is allowed to create new connector connections."
    ],
    "description": "Workspace admins can now set permissions for who can create app connector connections, providing enhanced security and management options. This feature helps in controlling workspace resources more effectively.",
    "releaseDate": "2026-06-03",
    "capabilities": [
      "Set permissions for app connector creation",
      "Flexible roles for workspace members",
      "Centralized management of connectors",
      "Improved security controls",
      "User-friendly permission settings",
      "Auditing capabilities"
    ]
  },
  {
    "id": "connector-sidebar",
    "icon": "✨",
    "name": "Connector sidebar",
    "source": "https://docs.lovable.dev/changelog#connector-sidebar",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Explore connectors easier with a new sidebar experience.",
    "category": "Editor",
    "useCases": [
      "Find the right app connector fast, grouped by category.",
      "Manage connector settings without leaving the editor view.",
      "Discover available connectors while building a new feature."
    ],
    "description": "The new connector sidebar allows users to navigate and discover various connectors quickly, grouping them under specific categories for easier access. This enhancement improves usability for managing app connectors.",
    "releaseDate": "2026-06-03",
    "capabilities": [
      "Sidebar navigation for connectors",
      "Grouped connectors by type",
      "Enhanced user experience",
      "Quick access to connector settings",
      "Improved usability",
      "Real-time updates"
    ]
  },
  {
    "id": "smarter-pwa-support",
    "icon": "✨",
    "name": "Smarter PWA support",
    "source": "https://docs.lovable.dev/changelog#smarter-pwa-support",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Optimized PWA setup tailored to your needs.",
    "category": "Mobile",
    "useCases": [
      "Make an app installable and usable offline without full PWA setup.",
      "Get faster performance from a leaner progressive web app.",
      "Prompt users to install the app only when it makes sense."
    ],
    "description": "Lovable now intelligently manages PWA setup, making your app installable and operable offline without applying the entire PWA stack each time. This tailored approach enhances performance and usability.",
    "releaseDate": "2026-06-03",
    "capabilities": [
      "Optimized PWA setups",
      "Supports offline functionality",
      "Customizable installation prompts",
      "Faster performance",
      "User-friendly experience",
      "Real-time feedback"
    ]
  },
  {
    "id": "cleaner-project-collaborator-icons",
    "icon": "✨",
    "name": "Cleaner project collaborator icons",
    "source": "https://docs.lovable.dev/changelog#cleaner-project-collaborator-icons",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easier to manage collaborators at a glance.",
    "category": "Workspace",
    "useCases": [
      "Keep the top bar tidy on a project with many active editors.",
      "Click one avatar to see the full list of active collaborators.",
      "Avoid a cluttered header on a heavily collaborative project."
    ],
    "description": "When a project has more active collaborators than fit cleanly in the top bar, the extras now collapse behind a single avatar. Click it to see the rest.",
    "releaseDate": "2026-06-02",
    "capabilities": [
      "Collapsing icons",
      "Manage visibility",
      "Quick access",
      "Streamlined UI",
      "User-friendly",
      "Enhanced collaboration views"
    ]
  },
  {
    "id": "move-projects-to-folders-from-chat",
    "icon": "✨",
    "name": "Move projects to folders from chat",
    "source": "https://docs.lovable.dev/changelog#move-projects-to-folders-from-chat",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily organize projects using folder commands in chat.",
    "category": "Workflow",
    "useCases": [
      "Ask Lovable to move a project into a shared folder.",
      "Reorganize project visibility without opening folder settings.",
      "Sort projects into personal folders through a chat command."
    ],
    "description": "Now you can ask Lovable in chat to move your projects directly into personal or shared folders. Simply ask Lovable to show your folders or execute the move command, and it will navigate the visibility settings for you.",
    "releaseDate": "2026-06-02",
    "capabilities": [
      "Folder management in chat",
      "Visibility adjustment for projects",
      "Personalized folder navigation",
      "Streamlined organization",
      "User-friendly commands",
      "Direct project manipulation via chat"
    ]
  },
  {
    "id": "a-refreshed-color-palette",
    "icon": "✨",
    "name": "A refreshed color palette",
    "source": "https://docs.lovable.dev/changelog#a-refreshed-color-palette",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Experience Lovable with a visually pleasing new color palette.",
    "category": "Editor",
    "useCases": [
      "Give the editor a cleaner look without changing any functionality.",
      "Improve text readability with better color contrast in the UI.",
      "Keep visual style consistent across every screen in the editor."
    ],
    "description": "The updated color scheme in Lovable enhances the interface, providing a cleaner and more consistent look that improves overall readability and aesthetic appeal.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Improved visual aesthetics",
      "Consistent color usage",
      "Enhances readability",
      "Clean interface design",
      "User-friendly color scheme"
    ]
  },
  {
    "id": "add-voice-to-your-app-with-text-to-speech-and-speech-to-text",
    "icon": "✨",
    "name": "Add voice to your app with text-to-speech and speech-to-text",
    "source": "https://docs.lovable.dev/changelog#add-voice-to-your-app-with-text-to-speech-and-speech-to-text",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Empower your apps with voice features effortlessly.",
    "category": "AI Models",
    "useCases": [
      "Turn written content into narrated audio for accessibility.",
      "Transcribe user voice input into text for a support tool.",
      "Build a voice assistant that speaks and listens in-app."
    ],
    "description": "The Lovable AI gateway can now turn text into spoken audio and transcribe audio into text, facilitating the integration of voice capabilities into your applications. Enhance user engagement and accessibility with these powerful features.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Text-to-speech for narration",
      "Speech-to-text for transcription",
      "Build interactive voice assistants",
      "Create AI-generated audio content",
      "Support for multiple languages",
      "Integrate voice commands easily"
    ]
  },
  {
    "id": "aikido-penetration-testing-is-now-available-on-all-plans",
    "icon": "✨",
    "name": "Aikido penetration testing is now available on all plans",
    "source": "https://docs.lovable.dev/changelog#aikido-penetration-testing-is-now-available-on-all-plans",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Run AI-powered penetration testing on any plan.",
    "category": "Security",
    "useCases": [
      "Run AI-driven vulnerability testing without upgrading plans.",
      "Check a small project for exploitable flaws before launch.",
      "Pull a compliance-ready security report on any plan tier."
    ],
    "description": "Aikido provides capabilities for identifying vulnerabilities using advanced AI techniques, now accessible to all Lovable plans.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Identify exploitable vulnerabilities",
      "Generate downloadable reports",
      "Sync findings into the Security view",
      "Support compliance workflows",
      "Facilitate stakeholder communication",
      "Run dynamic tests"
    ]
  },
  {
    "id": "app-connector-chargebee",
    "icon": "✨",
    "name": "App connector: Chargebee",
    "source": "https://docs.lovable.dev/changelog#app-connectors-chargebee",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Manage billing workflows with Chargebee.",
    "category": "App Connectors",
    "useCases": [
      "Manage SaaS subscriptions and invoices from inside the app.",
      "Sync billing workflows into a CRM without custom code.",
      "Analyze billing data to spot revenue trends."
    ],
    "description": "Integrate Chargebee to manage customers, subscriptions, invoices, and billing workflows directly within your apps. This enhances the billing experience for SaaS and e-commerce applications.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Manage subscriptions",
      "Handle invoices",
      "Automate billing workflows",
      "Integrate with CRM",
      "Analyze billing data",
      "Customize billing logic"
    ]
  },
  {
    "id": "app-connector-lightspeed",
    "icon": "✨",
    "name": "App connector: Lightspeed",
    "source": "https://docs.lovable.dev/changelog#app-connector-lightspeed",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Integrate and work with Lightspeed Retail data.",
    "category": "App Connectors",
    "useCases": [
      "Build a retail dashboard on top of Lightspeed inventory data.",
      "Pull product and inventory data into a reporting tool.",
      "Streamline store reporting without manual data exports."
    ],
    "description": "The Lightspeed app connector allows your applications to integrate with Lightspeed Retail store data, facilitating retail dashboards, inventory tools, and reporting functionalities.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Access Lightspeed store data",
      "Manage products and inventory",
      "Create retail dashboards",
      "Streamline reporting",
      "Enhance data integration"
    ]
  },
  {
    "id": "app-connector-salesforce",
    "icon": "✨",
    "name": "App connector: Salesforce",
    "source": "https://docs.lovable.dev/changelog#app-connector-salesforce",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Connect your apps directly to Salesforce.",
    "category": "App Connectors",
    "useCases": [
      "Query and update Salesforce Accounts from inside a custom app.",
      "Build a CRM dashboard fed by live Salesforce Opportunities data.",
      "Let admins control which teams can access Salesforce records."
    ],
    "description": "With the new Salesforce connector, your applications can now query and update CRM records directly within Lovable. It supports various objects like Accounts, Contacts, and Opportunities, making CRM data easily accessible for your apps.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Direct Salesforce integration",
      "Live data manipulation",
      "Support for multiple Salesforce objects",
      "Admin configuration for workspaces",
      "Automated data synchronization",
      "Enhanced CRM dashboards"
    ]
  },
  {
    "id": "ask-lovable-about-your-workspace-s-credit-usage",
    "icon": "✨",
    "name": "Ask Lovable about your workspace’s credit usage",
    "source": "https://docs.lovable.dev/changelog#ask-lovable-about-your-workspace%E2%80%99s-credit-usage",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Get real-time insights into your credit consumption via chat.",
    "category": "AI Models",
    "useCases": [
      "Ask which project burned through the most credits this month.",
      "Get a plain-language breakdown of workspace AI spend.",
      "Check per-project usage before deciding what to archive."
    ],
    "description": "You can now inquire about your workspace’s credit usage directly in chat. Ask questions about credits, spend, or specific project usage, and receive detailed answers based on your access levels.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Inquire about total credits used",
      "Ask about specific project usage",
      "Receive AI-powered insights",
      "Understand credit spending patterns",
      "Get visibility based on user roles",
      "Track usage by time range"
    ]
  },
  {
    "id": "automatic-fixes-for-basic-scan-findings",
    "icon": "✨",
    "name": "Automatic fixes for Basic scan findings",
    "source": "https://docs.lovable.dev/changelog#automatic-fixes-for-basic-scan-findings",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Automatically resolve common security issues.",
    "category": "Security",
    "useCases": [
      "Auto-resolve common security findings without a manual patch.",
      "Keep a project compliant between scheduled security reviews.",
      "Cut the manual cleanup work after a Basic security scan."
    ],
    "description": "Lovable can now automatically fix eligible critical findings from Basic scans during normal operations. This feature aims to improve security compliance without manual intervention, simplifying project management.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Automatic issue resolution",
      "Real-time security improvements",
      "Basic finding fixes",
      "Workspace settings integration",
      "User-friendly automation",
      "Reduction of manual labor for fixes"
    ]
  },
  {
    "id": "aws-athena-connector",
    "icon": "✨",
    "name": "AWS Athena Connector",
    "source": "https://docs.lovable.dev/integrations/aws-athena",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Query data in Amazon S3 with SQL, no data movement required.",
    "category": "App Connectors",
    "useCases": [
      "Analytics dashboards",
      "Internal data explorers",
      "On-demand reports"
    ],
    "description": "AWS Athena browses databases and table schemas, runs serverless SQL queries against data in Amazon S3, and returns results without moving your data.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Browse databases and schemas",
      "Run SQL queries",
      "Return typed results",
      "Paginate large results",
      "Authenticate via IAM"
    ]
  },
  {
    "id": "browser-testing-is-more-integrated",
    "icon": "✨",
    "name": "Browser testing is more integrated",
    "source": "https://docs.lovable.dev/changelog#browser-testing-is-more-integrated",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Seamlessly integrate browser testing into your app-building flow.",
    "category": "Testing",
    "useCases": [
      "Test a form flow against the live preview before shipping.",
      "Capture a screenshot of a UI bug directly from the build flow.",
      "Inspect network requests while debugging a broken feature."
    ],
    "description": "Browser testing now integrates directly into Lovable’s app-building flow, enabling effortless testing against live previews before confirming changes.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Run browser tests easily",
      "Test UI elements",
      "Capture screenshots",
      "Fill out forms in tests",
      "Inspect network requests",
      "Debug changes with real-time feedback"
    ]
  },
  {
    "id": "build-in-lovable-from-claude",
    "icon": "✨",
    "name": "Build in Lovable from Claude",
    "source": "https://docs.lovable.dev/changelog#build-in-lovable-from-claude",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Seamless integration with Claude for building and managing projects.",
    "category": "Integrations",
    "useCases": [
      "Ship a Lovable project without leaving the Claude interface.",
      "Manage an app build directly from a Claude conversation.",
      "Cut tool-switching time between chat and app development."
    ],
    "description": "Now, Lovable connects natively to Claude, empowering users to build, ship, and manage Lovable projects directly from Claude's environment without any interruptions.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Native integration with Claude",
      "Manage projects effortlessly",
      "Build and ship directly from Claude",
      "Increases productivity",
      "Streamlines project management"
    ]
  },
  {
    "id": "change-nameservers-for-a-domain-bought-through-lovable",
    "icon": "✨",
    "name": "Change nameservers for a domain bought through Lovable",
    "source": "https://docs.lovable.dev/changelog#change-nameservers-for-a-domain-bought-through-lovable",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Gain more control over your custom domains' DNS.",
    "category": "Cloud",
    "useCases": [
      "Point a Lovable-purchased domain at a custom DNS provider.",
      "Recover from a DNS misconfiguration without losing the domain.",
      "Keep full control of DNS records outside Lovable's system."
    ],
    "description": "Workspace admins can now point domains purchased through Lovable to their own custom nameservers, enhancing flexibility and control over DNS management while using Lovable's infrastructure for domains.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Manage nameserver settings",
      "Switch to custom DNS providers",
      "Recover from DNS misconfigurations",
      "Streamline domain handling",
      "Retain control of domain records",
      "Enable custom integrations easily"
    ]
  },
  {
    "id": "choose-your-interface-language",
    "icon": "✨",
    "name": "Choose your interface language",
    "source": "https://docs.lovable.dev/changelog#choose-your-interface-language",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Select your preferred language in Lovable.",
    "category": "Workspace",
    "useCases": [
      "Set the Lovable interface to a team member's native language.",
      "Keep the chosen language applied automatically on every sign-in.",
      "Work in one of 11 supported languages instead of English only."
    ],
    "description": "Users can choose the language used across Lovable settings. The choice is saved to your account and will be applied automatically on sign-in. Currently available in 11 languages including English, French, German, and more.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Select from 11 languages",
      "Automatic setting on sign-in",
      "Supports multiple languages",
      "User-friendly settings",
      "Enhances user experience"
    ]
  },
  {
    "id": "cleaner-inbox-notifications",
    "icon": "✨",
    "name": "Cleaner inbox notifications",
    "source": "https://docs.lovable.dev/changelog#clearer-inbox-notifications",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhanced notifications for quicker scanning.",
    "category": "Workflow",
    "useCases": [
      "Spot a collaborator's comment instantly by their avatar icon.",
      "Respond to a notification with the right action button, faster.",
      "Scan a busy inbox without hunting for the relevant update."
    ],
    "description": "Notifications in your inbox now include icons for type indications and user avatars for direct visibility. Action buttons have been tailored to each notification type, ensuring you can respond precisely and quickly.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "User icons in notifications",
      "Specific action buttons",
      "Streamlined notification layout",
      "Easier to manage collaborations",
      "Improved overall user experience"
    ]
  },
  {
    "id": "cleaner-preview-links",
    "icon": "✨",
    "name": "Cleaner preview links",
    "source": "https://docs.lovable.dev/changelog#cleaner-preview-links",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Share cleaner, shorter project preview links.",
    "category": "Workflow",
    "useCases": [
      "Share a short preview link with a client instead of a raw URL.",
      "Give a reviewer public access without granting project login.",
      "Send a link that stays valid for a week of feedback."
    ],
    "description": "Preview links are now shorter and easier to share. Users can now send links that are more manageable and user-friendly while ensuring viewer access remains valid.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Shortened preview links",
      "Public access without login",
      "Cleaner sharing experience",
      "Easier project management",
      "Links valid for 7 days"
    ]
  },
  {
    "id": "clearer-personal-folder-access-management",
    "icon": "✨",
    "name": "Clearer personal folder access management",
    "source": "https://docs.lovable.dev/changelog#clearer-personal-folder-access-management",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Simplify how you manage folder accesses.",
    "category": "Security",
    "useCases": [
      "Understand who can see a personal folder before sharing it.",
      "Grant project visibility without guessing at role permissions.",
      "Explain access inheritance to a new Enterprise team member."
    ],
    "description": "Enterprise users now have clearer options for access management of personal folders, including intuitive labels and tooltips explaining access inheritance and role permissions.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Manage access for personal folders",
      "Understand folder access dynamics",
      "Visualize role permissions clearly",
      "Grant or restrict project visibility",
      "Improve user collaboration",
      "Facilitate team dynamics"
    ]
  },
  {
    "id": "inspect-your-app-s-ai-activity",
    "icon": "✨",
    "name": "Inspect your app’s AI activity",
    "source": "https://docs.lovable.dev/changelog#inspect-your-app%E2%80%99s-ai-activity",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Monitor your AI usage with detailed activity reports.",
    "category": "AI Models",
    "useCases": [
      "Track how much an in-app AI feature is costing per month.",
      "Spot a slow AI request by reviewing individual call status.",
      "Audit token usage across every AI-powered feature in the app."
    ],
    "description": "Every project now features an AI activity dashboard that displays costs and performance metrics of built-in AI features, allowing users to track spending and identify performance issues, ensuring better management of AI resources.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Track AI feature costs",
      "Monitor the performance of AI calls",
      "View individual request statuses",
      "Analyze token usage",
      "Access activity for free and paid plans",
      "Capture detailed request history"
    ]
  },
  {
    "id": "linkedin-skills",
    "icon": "✨",
    "name": "LinkedIn skills",
    "source": "https://docs.lovable.dev/changelog#linkedin-skills",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Show your Lovable skills on LinkedIn profiles.",
    "category": "Community",
    "useCases": [
      "Show a qualifying Lovable skill badge on a LinkedIn profile.",
      "Replace an old Vibe coding level with a current skill display.",
      "Disconnect a displayed skill from settings when it's outdated."
    ],
    "description": "You can now display your skill on LinkedIn if your projects qualify you for a LinkedIn skill based on how you use Lovable. This replaces the previous Vibe coding level and connects your skill to your Lovable account details.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Display skills on LinkedIn profiles",
      "Connects with Lovable account",
      "One skill display at a time",
      "Disconnect skills easily",
      "Skill management in settings"
    ]
  },
  {
    "id": "linking-projects-using-public-web-pages",
    "icon": "✨",
    "name": "Linking projects using public web pages",
    "source": "https://docs.lovable.dev/changelog#reference-web-pages-in-a-%E2%80%9Cbuild-with-url%E2%80%9D-link",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Reference web pages seamlessly in your projects.",
    "category": "Integrations",
    "useCases": [
      "Reference a live competitor page while designing a new layout.",
      "Point a project at an existing site for style guidance.",
      "Speed up setup by reusing a public page as a starting reference."
    ],
    "description": "Enable your projects to refer to public web pages by simply adding a URL, facilitating easier project collaboration and design iterations.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Use public web pages as references",
      "Integrate with existing designs",
      "Simplify project setup",
      "Enhance design flexibility",
      "Support multiple types of links",
      "Streamline project inputs"
    ]
  },
  {
    "id": "one-credit-balance-and-clearer-usage-insights",
    "icon": "✨",
    "name": "One credit balance and clearer usage insights",
    "source": "https://docs.lovable.dev/changelog#one-credit-balance-and-clearer-usage-insights",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Simplify your credit management with a unified balance.",
    "category": "Cloud",
    "useCases": [
      "Track build, hosting, and AI spend from one credit balance.",
      "See exactly which project is consuming the most credits.",
      "Check credit expiry dates before planning next month's usage."
    ],
    "description": "Lovable now uses one credit balance for building your app, hosting it with Lovable Cloud, and AI features your deployed app uses. Easily manage and track your usage through a centralized interface, enhancing clarity on your resource allocation and credits spent.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Manage one-time top-ups",
      "See usage metrics",
      "Track AI and Cloud expenses",
      "Understand credit types",
      "Review recent credit activity",
      "Access credit expiry dates"
    ]
  },
  {
    "id": "publish-and-install-private-npm-packages",
    "icon": "✨",
    "name": "Publish and install private npm packages",
    "source": "https://docs.lovable.dev/changelog#publish-and-install-private-npm-packages",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Securely host your internal npm packages.",
    "category": "Cloud",
    "useCases": [
      "Share an internal component library across Enterprise projects.",
      "Install a private package without exposing it outside the org.",
      "Publish an internal utility for reuse across every project."
    ],
    "description": "Enterprise workspaces can now host a private npm registry within Lovable, enabling the publishing and installation of internal packages while ensuring they remain secure and accessible only to authorized members of the workspace.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Host private npm packages",
      "Install packages in all projects",
      "Manage registry settings easily",
      "Create service account keys",
      "Ensure compliance with enterprise security",
      "Streamline package sharing among teams"
    ]
  },
  {
    "id": "publish-from-chat",
    "icon": "✨",
    "name": "Publish from chat",
    "source": "https://docs.lovable.dev/changelog#publish-from-chat",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily publish apps directly through chat commands.",
    "category": "Workflow",
    "useCases": [
      "Publish an app to production with a single chat message.",
      "Let the agent confirm permissions before deploying a change.",
      "Deploy to a custom domain without leaving the chat window."
    ],
    "description": "The agent can now publish your app while respecting workspace settings. It checks permissions, confirms page information, runs security checks, and logs the deployment without leaving chat. This streamlines the publishing process.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Publish through chat commands",
      "Confirm necessary permissions",
      "Automate deployment",
      "Check visibility settings",
      "Support for custom domains",
      "Streamline publishing process"
    ]
  },
  {
    "id": "reference-web-pages-in-a-build-with-url-link",
    "icon": "✨",
    "name": "Reference web pages in a 'Build with URL' link",
    "source": "https://docs.lovable.dev/changelog#reference-web-pages-in-a-%E2%80%9Cbuild-with-url%E2%80%9D-link",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Reference external web pages in your project.",
    "category": "Integrations",
    "useCases": [
      "Match a new page's layout to an existing site by URL.",
      "Combine a reference image and a web link for design context.",
      "Speed up styling decisions using an existing page as a guide."
    ],
    "description": "With this feature, users can reference public web pages via links which allows them to use the page as a styling and content reference for their current project, simplifying the building process.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Supports HTML URLs",
      "Reference layouts and designs",
      "Combine images and web pages",
      "Generate insights from existing pages",
      "Facilitates quicker project development"
    ]
  },
  {
    "id": "replicate-connector",
    "icon": "✨",
    "name": "Replicate Connector",
    "source": "https://docs.lovable.dev/integrations/replicate",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Run open-source AI models for image, video, audio, and text.",
    "category": "App Connectors",
    "useCases": [
      "Creative and media tools",
      "Model playgrounds",
      "AI editing workflows"
    ],
    "description": "Replicate lets apps run thousands of open-source AI models, including image generation, video generation, transcription, upscaling, background removal, and text generation. Bring your own fine-tuned models or use the public catalog.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Run public models",
      "Run fine-tuned models",
      "Stream long-running jobs",
      "Generate images and video",
      "Transcribe audio",
      "Return structured predictions"
    ]
  },
  {
    "id": "require-workspace-editor-role-to-edit-projects",
    "icon": "✨",
    "name": "Require workspace editor role to edit projects",
    "source": "https://docs.lovable.dev/changelog#require-the-workspace-editor-role-to-edit-projects",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Restrict project edits to authorized roles.",
    "category": "Security",
    "useCases": [
      "Lock project edits to users with editor role or higher.",
      "Let viewers see a project without risking accidental changes.",
      "Tighten edit permissions across an Enterprise workspace."
    ],
    "description": "Enterprise workspace admins can now set a requirement for project edits, allowing only users with the workspace editor role or higher to make changes to projects. This strengthens security by limiting edit permissions.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Control editing permissions",
      "Maintain project integrity",
      "Set maximum security roles",
      "Manage viewer access",
      "Adapt settings at any time",
      "Easily adjust collaboration levels"
    ]
  },
  {
    "id": "restrict-external-collaborators-without-enforcing-sso",
    "icon": "✨",
    "name": "Restrict external collaborators without enforcing SSO",
    "source": "https://docs.lovable.dev/features/privacy-and-security-settings#external-project-collaborators",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Limit access of external collaborators without SSO enforcement.",
    "category": "Security",
    "useCases": [
      "Limit an external contractor's access without requiring SSO.",
      "Control collaborator permissions on a Business plan workspace.",
      "Adjust project role definitions for occasional outside reviewers."
    ],
    "description": "Workspace admins and owners on Business and Enterprise plans can restrict access for external project collaborators without the need for SSO, offering more flexibility with project role definitions.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Access role definition",
      "External collaborator management",
      "Flexible security settings",
      "User-friendly controls",
      "No SSO requirement",
      "Easier project governance"
    ]
  },
  {
    "id": "scheduled-security-scans-enterprise",
    "icon": "✨",
    "name": "Scheduled security scans (Enterprise)",
    "source": "https://docs.lovable.dev/changelog#scheduled-security-scans-enterprise",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Automate your security checks with scheduling.",
    "category": "Security",
    "useCases": [
      "Run a security scan automatically every week across projects.",
      "Get notified of scan results without triggering a manual run.",
      "Schedule monthly compliance scans across selected projects."
    ],
    "description": "Enterprise plan users can schedule Deep security scans across selected projects to run either weekly or monthly. This allows easier management of security tasks and provides options to trigger scans manually.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Automated scheduling",
      "Project-wide security checks",
      "Manual trigger options",
      "Notification of scan results",
      "Flexible scheduling options",
      "Enhanced admin controls"
    ]
  },
  {
    "id": "security-scan-profiles",
    "icon": "✨",
    "name": "Security scan profiles",
    "source": "https://docs.lovable.dev/changelog#security-scan-profiles",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhanced security checks now available.",
    "category": "Security",
    "useCases": [
      "Run a Basic scan for common issues before every publish.",
      "Trigger a Deep scan for a comprehensive pre-launch review.",
      "Get instant security feedback the moment an app is published."
    ],
    "description": "Lovable introduces two built-in security scan profiles: Basic and Deep scan. Basic checks for common security issues while Deep scan includes comprehensive reviews. Both scans provide instant feedback on project security upon publishing.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Automatic security checks",
      "Customizable scan profiles",
      "In-depth security assessments",
      "Real-time feedback on findings",
      "Integrations with publish workflow",
      "Enhanced security reporting"
    ]
  },
  {
    "id": "see-when-you-have-unpublished-changes",
    "icon": "✨",
    "name": "See when you have unpublished changes",
    "source": "https://docs.lovable.dev/changelog#see-when-you-have-unpublished-changes",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Get notifications for unpublished project updates.",
    "category": "Editor",
    "useCases": [
      "Notice unsaved edits before accidentally publishing over them.",
      "Know at a glance whether the live app matches the latest build.",
      "Avoid losing work by tracking pending changes visually."
    ],
    "description": "The Publish button now provides visual cues indicating pending changes, enhancing the editing experience in Lovable and reminding users of their latest unsaved work, streamlining the publishing process.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Visual change notifications",
      "Simplifies project updates",
      "More intuitive editing experience",
      "Reduces chances of mixed versions",
      "Prevents loss of work"
    ]
  },
  {
    "id": "set-up-okta-sso-and-scim-from-the-okta-app-catalog",
    "icon": "✨",
    "name": "Set up Okta SSO and SCIM from the Okta app catalog",
    "source": "https://docs.lovable.dev/features/business/sso",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Integrate Okta SSO into Lovable seamlessly.",
    "category": "Security",
    "useCases": [
      "Set up Okta SSO for a workspace directly from Okta's catalog.",
      "Automate user provisioning with SCIM through Okta.",
      "Cut manual setup time for enterprise identity management."
    ],
    "description": "Workspace admins can now set up single sign-on and SCIM provisioning through a guided flow directly from the Okta app catalog, simplifying the integration process.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Okta SSO integration",
      "SCIM provisioning setup",
      "Simplified configuration process",
      "Automated workflow",
      "Centralized user management",
      "Security enhancements"
    ]
  },
  {
    "id": "svg-previews-in-chat",
    "icon": "✨",
    "name": "SVG previews in chat",
    "source": "https://docs.lovable.dev/changelog#svg-previews-in-chat",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Improved rendering for SVG files within chat.",
    "category": "Editor",
    "useCases": [
      "View an SVG icon correctly instead of a broken image in chat.",
      "Share a logo file with a collaborator without a rendering glitch.",
      "Confirm a graphic asset looks right before using it in the build."
    ],
    "description": "SVG attachments now render correctly from the full-screen attachment viewer, resolving previous issues of blanks or broken images. This enhancement improves user experience when sharing graphic elements via chat.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Render SVG files in chat",
      "Improve user experience",
      "Facilitate sharing graphic elements",
      "Support for visual context",
      "Enhance collaboration",
      "Increase file compatibility"
    ]
  },
  {
    "id": "workspace-insights-for-enterprise-governance",
    "icon": "✨",
    "name": "Workspace insights for Enterprise governance",
    "source": "https://docs.lovable.dev/features/workspace-insights",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Review and govern every project in the workspace from one place.",
    "category": "Workspace",
    "useCases": [
      "Prioritize which projects need a security review first.",
      "Track PII findings across every project in an Enterprise workspace.",
      "Review activity logs to assess a project's overall risk."
    ],
    "description": "Workspace admins and owners on Enterprise plans can now use Workspace insights to review security findings, PII findings, and project activity with prioritized review cues to manage their workspace effectively.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Centralized project review",
      "Security findings tracking",
      "Automated PII detection",
      "Lifecycle and cost assessment",
      "Activity logs",
      "Priority management"
    ]
  },
  {
    "id": "workspace-view-only-sharing",
    "icon": "✨",
    "name": "Workspace view-only sharing",
    "source": "https://docs.lovable.dev/changelog#workspace-view-only-sharing",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Share projects in read-only mode for improved collaboration.",
    "category": "Workspace",
    "useCases": [
      "Share a finished project as a reference without edit risk.",
      "Show a portfolio piece to the team without exposing the source.",
      "Hand off a project for review without granting edit access."
    ],
    "description": "Business and Enterprise workspaces can now share a project with everyone as read-only, allowing members to reference without editing. This facilitates sharing examples or showcasing work without risk of accidental changes.",
    "releaseDate": "2026-06-01",
    "capabilities": [
      "Share projects with read-only permissions",
      "Facilitate collaboration",
      "Prevent accidental edits",
      "Enhance project visibility",
      "Support example sharing",
      "Simplify handoff context"
    ]
  },
  {
    "id": "more-consistent-project-action-buttons",
    "icon": "✨",
    "name": "More consistent project action buttons",
    "source": "https://docs.lovable.dev/changelog#more-consistent-project-action-buttons",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Comment, share, and publish buttons now have matching styles.",
    "category": "Workspace",
    "useCases": [
      "Recognize the comment, share, and publish buttons at a glance.",
      "Navigate a project's toolbar with a more polished layout.",
      "Reduce visual clutter around common project actions."
    ],
    "description": "The buttons for commenting, sharing, and publishing have been redesigned for a more consistent look, featuring refined avatars and an overall more polished layout.",
    "releaseDate": "2026-05-29",
    "capabilities": [
      "Refined layouts",
      "Improved user interface consistency",
      "Enhanced user engagement"
    ]
  },
  {
    "id": "algolia-connector",
    "icon": "✨",
    "name": "Algolia Connector",
    "source": "https://docs.lovable.dev/integrations/algolia",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Fast, typo-tolerant search with faceting, ranking, and analytics.",
    "category": "App Connectors",
    "useCases": [
      "Product and marketplace search",
      "Documentation search",
      "Location finders"
    ],
    "description": "Algolia adds search-as-you-type, faceted filtering, indexing, ranking rules, recommendations, and search analytics to any app. Apps read and write indices directly through the connector.",
    "releaseDate": "2026-05-28",
    "capabilities": [
      "Index and update records",
      "Run search queries",
      "Configure ranking rules",
      "Apply faceted filters",
      "Serve recommendations",
      "Read search analytics"
    ]
  },
  {
    "id": "linkedin-connector",
    "icon": "✨",
    "name": "LinkedIn Connector",
    "source": "https://docs.lovable.dev/integrations/linkedin",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read profile data and publish posts on behalf of the connected member.",
    "category": "App Connectors",
    "useCases": [
      "Post schedulers",
      "Personal brand dashboards",
      "Sales outreach workflows"
    ],
    "description": "LinkedIn lets apps read basic profile details, retrieve the connected member's primary email, and publish posts on their behalf.",
    "releaseDate": "2026-05-28",
    "capabilities": [
      "Read profile details",
      "Read primary email",
      "Publish posts",
      "Attach media to posts",
      "Authenticate members"
    ]
  },
  {
    "id": "faster-app-previews-across-regions",
    "icon": "✨",
    "name": "Faster app previews across regions",
    "source": "https://docs.lovable.dev/changelog#faster-app-previews-across-regions",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhanced app loading speeds for better user experience.",
    "category": "Cloud",
    "useCases": [
      "Get a faster live preview for users outside Europe.",
      "Rely on more consistent load times regardless of user location.",
      "Improve the review experience for a globally distributed team."
    ],
    "description": "Infrastructure enhancements improve latency for live previews across regions, making apps load faster, especially for users farther from Europe.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "Reduced latency for app previews.",
      "Improved infrastructure performance.",
      "Consistent app performance across regions.",
      "Enhanced user experience.",
      "Faster loading times.",
      "Localized performance optimizations."
    ]
  },
  {
    "id": "new-openai-image-models",
    "icon": "✨",
    "name": "New OpenAI image models",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Now use two new OpenAI image models for app features.",
    "category": "AI Models",
    "useCases": [
      "Generate a marketing image in-app without managing an API key.",
      "Edit an existing product image directly within the app.",
      "Add image generation to an app's creative workflow."
    ],
    "description": "Lovable’s built-in AI connector now supports two OpenAI image models, facilitating image generation and editing workflows directly in your app without the hassle of managing API keys.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "Image generation functionalities.",
      "Image editing capabilities.",
      "No API key management required.",
      "Seamless integration into apps.",
      "Enhanced creative assets creation.",
      "Optimized for marketing visuals."
    ]
  },
  {
    "id": "new-openai-image-models-for-ai-features-in-your-app",
    "icon": "✨",
    "name": "New OpenAI image models for AI features in your app",
    "source": "https://docs.lovable.dev/changelog#new-openai-image-models-for-ai-features-in-your-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Lovable introduces new OpenAI image models for enhanced app features.",
    "category": "AI Models",
    "useCases": [
      "Let end users generate custom images inside a deployed app.",
      "Add photo editing to an app without a separate image API.",
      "Ship visual content features faster with built-in image models."
    ],
    "description": "The built-in AI connector now supports two new OpenAI image models, allowing users to generate and edit images directly within their applications. With this capability, users can create visual content without managing complex API keys, enabling faster and simpler implementation.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "Create images directly in-app",
      "Edit existing images",
      "No API key management required",
      "Support for various image workflows",
      "Enhance visual engagement in apps",
      "Integrate quickly with existing projects"
    ]
  },
  {
    "id": "project-monitoring",
    "icon": "✨",
    "name": "Project Monitoring",
    "source": "https://docs.lovable.dev/features/project-monitoring",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Runtime errors, performance, and health for published apps.",
    "category": "Testing",
    "useCases": [
      "Post-launch reliability monitoring",
      "Regression detection",
      "On-call triage"
    ],
    "description": "Project Monitoring tracks runtime errors, request performance, and infrastructure health for published Lovable apps, and surfaces issues Lovable can help diagnose from chat. Currently in beta.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "Track runtime errors",
      "Group errors by stack trace",
      "Measure request performance",
      "Alert on regressions",
      "Investigate issues from chat"
    ]
  },
  {
    "id": "sensitive-data-scanning",
    "icon": "✨",
    "name": "Sensitive data scanning",
    "source": "https://docs.lovable.dev/changelog#sensitive-data-scanning",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Detect personally identifiable information easily.",
    "category": "Security",
    "useCases": [
      "Scan chat history for exposed PII before an audit.",
      "Run an on-demand check for sensitive data across a project.",
      "Configure scanning modes to match a workspace's privacy policy."
    ],
    "description": "Enterprise workspaces can enable sensitive data scanning to detect PII across projects. Admins can configure scanning modes and run on-demand scans to check chat histories and project files.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "PII detection across projects.",
      "Customizable admin settings.",
      "On-demand scanning availability.",
      "Chat history review capabilities.",
      "Privacy settings management.",
      "Configuration of scanning modes."
    ]
  },
  {
    "id": "subagents",
    "icon": "✨",
    "name": "Subagents",
    "source": "https://docs.lovable.dev/features/subagents",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Subagents enhance Lovable’s ability to tackle complex tasks.",
    "category": "Agent",
    "useCases": [
      "Split a complex investigation into parallel research tasks.",
      "Let a read-only subagent check documentation before a change.",
      "Speed up a code review by delegating exploration in parallel."
    ],
    "description": "Subagents help Lovable investigate complex tasks faster by splitting research, code exploration, and review into focused parallel work. When a request needs more context, Lovable can start temporary, read-only subagents for inspections, documentation lookups, work reviews, and findings return.",
    "releaseDate": "2026-05-27",
    "capabilities": [
      "Parallel processing of tasks.",
      "Temporary, read-only agents.",
      "Automatic task delegation.",
      "Contextual understanding.",
      "Project inspection capabilities.",
      "Documentation lookup."
    ]
  },
  {
    "id": "delete-a-workspace",
    "icon": "✨",
    "name": "Delete a workspace",
    "source": "https://docs.lovable.dev/introduction/delete-workspace",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Workspace owners can delete workspaces directly from Settings.",
    "category": "Workspace",
    "useCases": [
      "Shut down an unused workspace while keeping a recovery window.",
      "Cancel workspace subscriptions cleanly at period end.",
      "Restore a workspace within 60 days after accidental deletion."
    ],
    "description": "Admins can now delete workspaces, which enter a 60-day grace period for potential restoration. Members lose immediate access, and any active subscriptions are canceled at the end of the billing period.",
    "releaseDate": "2026-05-26",
    "capabilities": [
      "Immediate deletion by workspace owners",
      "60-day grace period",
      "Restore options available",
      "Subscription management"
    ]
  },
  {
    "id": "project-toolbar-navigation-improvements",
    "icon": "✨",
    "name": "Project toolbar navigation improvements",
    "source": "https://docs.lovable.dev/changelog#project-toolbar-navigation-improvements",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Improved view switcher and keyboard navigation.",
    "category": "Workspace",
    "useCases": [
      "Switch between project views faster with keyboard navigation.",
      "Tell which view is active at a glance in the toolbar.",
      "Navigate a project's menu with fewer clicks."
    ],
    "description": "The project toolbar has been enhanced with a cleaner interface, clearer active states, and improved keyboard navigation for better user experience.",
    "releaseDate": "2026-05-26",
    "capabilities": [
      "Polished view switcher",
      "Clearer active states",
      "Improvements in keyboard navigation",
      "Simplified menu for easy access"
    ]
  },
  {
    "id": "custom-mcp-servers-available-on-all-plans",
    "icon": "✨",
    "name": "Custom MCP servers available on all plans",
    "source": "https://docs.lovable.dev/integrations/mcp-servers#custom-mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Connect custom MCP servers across all plans.",
    "category": "MCP Connectors",
    "useCases": [
      "Connect a custom MCP server on the free plan.",
      "Add an internal tool integration without a plan upgrade.",
      "Manage custom servers from the Connectors section directly."
    ],
    "description": "Users can now connect custom MCP servers from Connectors section without needing to be on a paid plan.",
    "releaseDate": "2026-05-25",
    "capabilities": [
      "Connect custom MCPs",
      "Available across all subscription plans",
      "Seamless integration",
      "Easier management of custom servers"
    ]
  },
  {
    "id": "group-members-now-show-only-active-and-pending-users",
    "icon": "✨",
    "name": "Group members now show only active and pending users",
    "source": "https://docs.lovable.dev/changelog#group-members-now-show-only-active-and-pending-users",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Streamlined visibility of group member statuses.",
    "category": "Community",
    "useCases": [
      "Export a clean group member list without inactive accounts.",
      "Manage a group roster without noise from removed users.",
      "Review pending invitations separately from active members."
    ],
    "description": "Updates to the Groups feature now ensure that the members page and CSV exports only display active and pending users, simplifying group management for workspace admins.",
    "releaseDate": "2026-05-25",
    "capabilities": [
      "Focused user management",
      "Elimination of inactive displays",
      "Improved group efficiency"
    ]
  },
  {
    "id": "auto-compress-large-images-on-upload",
    "icon": "✨",
    "name": "Auto-compress large images on upload",
    "source": "https://docs.lovable.dev/changelog#auto-compress-large-images-on-upload",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Large images are now automatically compressed during upload.",
    "category": "Cloud",
    "useCases": [
      "Upload high-resolution photos without hitting the size limit.",
      "Keep image quality while cutting file size automatically.",
      "Get a clear error only when a file truly exceeds the limit."
    ],
    "description": "When uploading large images that exceed the size limit, Lovable compresses them, while clearly indicating when compression is applied.",
    "releaseDate": "2026-05-24",
    "capabilities": [
      "Automatic image compression",
      "Quality preservation",
      "Clear feedback on compression",
      "User-friendly error messages for overly large files"
    ]
  },
  {
    "id": "database-health-check",
    "icon": "✨",
    "name": "Database health check",
    "source": "https://docs.lovable.dev/integrations/cloud#database-health-check",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Troubleshoot database issues quickly from chat.",
    "category": "Cloud",
    "useCases": [
      "Ask in chat whether the database is running efficiently.",
      "Get a quick performance summary before a launch.",
      "Troubleshoot a slow app by checking database health first."
    ],
    "description": "Users can directly request health checks for their Lovable Cloud databases via chat, receiving a concise report on their database's performance states. This feature aids in troubleshooting and optimizing database operations.",
    "releaseDate": "2026-05-24",
    "capabilities": [
      "On-demand health check",
      "Immediate status summary",
      "Performance insights",
      "Ease of use through chat command"
    ]
  },
  {
    "id": "admin-and-security-updates",
    "icon": "✨",
    "name": "Admin and security updates",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhanced tools for workspace admins and security management.",
    "category": "Security",
    "useCases": [
      "Audit group membership before an Enterprise plan renewal.",
      "Enforce authentication policy from a single security center.",
      "Filter projects to review access across a growing workspace."
    ],
    "description": "New updates provide better visibility and management tools for admins in Business or Enterprise plans, making it easier to enforce authentication policies and manage user groups effectively.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Improved security center access",
      "Group export capabilities",
      "Search within groups",
      "SCIM provisioning audit logs",
      "Enhanced project filtering",
      "Organized privacy and security settings"
    ]
  },
  {
    "id": "build-and-plan-mode-switch",
    "icon": "✨",
    "name": "Build and Plan mode switch",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Seamlessly switch between design and build modes.",
    "category": "Workflow",
    "useCases": [
      "Switch into Plan mode to sketch architecture before coding.",
      "Keep design discussion separate from implementation work.",
      "Move between planning and building without losing context."
    ],
    "description": "A clearer dropdown for switching between Build and Plan modes enhances the user experience. This intuitive design keeps users focused on either implementation or discussion without interrupting their workflow.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Easy mode switching",
      "Dedicated architecture discussions",
      "Focused design planning",
      "User-friendly interface",
      "Maintain project organization",
      "Streamlined project development"
    ]
  },
  {
    "id": "chat-with-lovable-in-telegram",
    "icon": "✨",
    "name": "Chat with Lovable in Telegram",
    "source": "https://docs.lovable.dev/tips-tricks/lovable-telegram-bot",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Interact with Lovable directly from Telegram for seamless project management.",
    "category": "Mobile",
    "useCases": [
      "Fix a bug in an app from Telegram while away from a laptop.",
      "Check project analytics without opening a browser.",
      "Review a change history from a phone via Telegram chat."
    ],
    "description": "Users can now chat with Lovable directly through the Telegram app, allowing for project management on-the-go. The feature enables building new apps, assessing project analytics, and reviewing change histories directly from within Telegram.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Build new apps",
      "Update existing projects",
      "Fix bugs through chat",
      "Manage project databases",
      "View project analytics",
      "Search across workspace code"
    ]
  },
  {
    "id": "database-backup-restoration",
    "icon": "✨",
    "name": "Database backup restoration",
    "source": "https://docs.lovable.dev/integrations/cloud#database",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Restore your project database from daily backups effortlessly.",
    "category": "Cloud",
    "useCases": [
      "Undo an accidental data change with a one-click restore.",
      "Recover from a bad migration using yesterday's daily backup.",
      "Restore a project database without waiting on support."
    ],
    "description": "Users can now restore their Lovable Cloud project databases to recent daily backups without needing support intervention. This feature simplifies recovering from accidental changes or migrations.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "One-click database restoration",
      "Access to daily backup history",
      "Quick recovery from data issues",
      "User control over restore points",
      "Maintain project uptime during restores",
      "Simplified data management"
    ]
  },
  {
    "id": "domain-management-updates",
    "icon": "✨",
    "name": "Domain management updates",
    "source": "https://docs.lovable.dev/features/custom-domain",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Streamline your custom domain management process.",
    "category": "Cloud",
    "useCases": [
      "Set up a custom domain with fewer configuration steps.",
      "Recover SSL provisioning after a domain hiccup.",
      "Move a purchased domain between workspaces easily."
    ],
    "description": "Custom domain setup and management have been improved for clarity and ease of use, enhancing users' ability to manage their domains effectively within Lovable's environment.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Easier custom domain setup",
      "Centralized domain management",
      "SSL provisioning recovery",
      "Move domains between workspaces",
      "Clearer purchasing workflows",
      "Improved domain ownership validation"
    ]
  },
  {
    "id": "draw-on-images",
    "icon": "✨",
    "name": "Draw on images",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Annotate images before sending to Lovable for clearer guidance.",
    "category": "Editor",
    "useCases": [
      "Circle the exact UI element that needs to change in a screenshot.",
      "Give the agent visual context instead of a written description.",
      "Cut back-and-forth by annotating a design mockup directly."
    ],
    "description": "Users can now draw directly on uploaded images, highlighting specific details for the Lovable agent to focus on. This visual context enhances communication and project clarity.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Annotate images easily",
      "Highlight specific areas",
      "Improves agent responses",
      "Enhances user guidance",
      "Facilitates clearer communication",
      "Saves time in project explanations"
    ]
  },
  {
    "id": "google-search-console-connector",
    "icon": "✨",
    "name": "Google Search Console Connector",
    "source": "https://docs.lovable.dev/integrations/google-search-console",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Verify domains, submit sitemaps, and read Search Console analytics.",
    "category": "App Connectors",
    "useCases": [
      "SEO dashboards",
      "Indexing monitors",
      "Client-facing SEO reports"
    ],
    "description": "Google Search Console lets apps verify domains, submit and manage sitemaps, inspect URLs, and read search analytics. Lovable can also use the connection in chat to answer SEO questions with live GSC data.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Verify domain ownership",
      "Submit sitemaps",
      "Inspect URLs",
      "Read search analytics",
      "Track indexing coverage",
      "Query performance data"
    ]
  },
  {
    "id": "improved-github-integration",
    "icon": "✨",
    "name": "Improved GitHub integration",
    "source": "https://docs.lovable.dev/integrations/github",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Connect Lovable to GitHub for enhanced project management.",
    "category": "Integrations",
    "useCases": [
      "Reconnect a GitHub sync fast after a connectivity drop.",
      "Support a team using GitHub Enterprise Cloud hosting.",
      "Check GitHub connection settings from inside the project."
    ],
    "description": "The updated GitHub integration now supports more hosting setups and offers clearer connection management. Enhanced recovery options during connectivity issues streamline project management for teams using GitHub Enterprise.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Support for GitHub Enterprise Cloud",
      "Recovery from sync failures",
      "Improved connection clarity",
      "Access project GitHub settings easily",
      "Fast reconnection prompts",
      "Multi-hosting setup"
    ]
  },
  {
    "id": "lovable-ai-models-for-app-features",
    "icon": "✨",
    "name": "Lovable AI models for app features",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Access advanced AI models for enhanced apps.",
    "category": "AI Models",
    "useCases": [
      "Build a semantic search feature using new embedding models.",
      "Power a reasoning-heavy in-app feature with a stronger model.",
      "Manage token spend with tiered pricing across model options."
    ],
    "description": "New Lovable AI models are now available for powering app features, offering improved context and functionality. This includes support for advanced embeddings and powerful reasoning tasks.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Access GPT-5.5 family",
      "Leverage Gemini 3.1 Flash Lite",
      "Utilize embedding models for semantic search",
      "Build advanced knowledge bases",
      "Generate high-quality text outputs",
      "Manage tokens effectively with tiered pricing"
    ]
  },
  {
    "id": "lovable-mobile-app",
    "icon": "✨",
    "name": "Lovable mobile app",
    "source": "https://lovable.dev/blog/mobile-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Build and manage your projects on the go with the Lovable mobile app.",
    "category": "Mobile",
    "useCases": [
      "Check a project's status from a phone between meetings.",
      "Send a build message to Lovable without opening a laptop.",
      "Review analytics on iOS or Android while away from a desk."
    ],
    "description": "The Lovable mobile app is now available globally on iOS and Android, providing users the ability to manage their projects from their phones. Users can send messages, check analytics, and stay updated with project activities without being at their computers.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Manage projects remotely",
      "Send messages to Lovable",
      "Review project updates",
      "Check analytics on-the-go",
      "Access project history",
      "Easy interface for mobile users"
    ]
  },
  {
    "id": "redesigned-dashboard-organization",
    "icon": "✨",
    "name": "Redesigned dashboard organization",
    "source": "https://docs.lovable.dev/introduction/project-search-and-find",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "A freshly organized dashboard for improved navigation.",
    "category": "Workspace",
    "useCases": [
      "Find a recently viewed project faster from the dashboard.",
      "Filter dozens of projects down to the ones that matter.",
      "Reorganize the project list with drag-and-drop sorting."
    ],
    "description": "The dashboard features an enhanced user experience with improved project categorization, filtering options, and navigation, making project management easier than ever before.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Project categorization",
      "Improved filtering options",
      "Quick access to recently viewed projects",
      "Navigable sidebar upgrades",
      "Enhanced sorting mechanisms",
      "Drag-and-drop project organization"
    ]
  },
  {
    "id": "security-memory",
    "icon": "✨",
    "name": "Security memory",
    "source": "https://docs.lovable.dev/features/security-view",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Customize your security scanning context with memory documents.",
    "category": "Security",
    "useCases": [
      "Document an accepted risk so future scans stop flagging it.",
      "Keep security scans focused on issues that haven't been reviewed.",
      "Maintain continuous validation without re-litigating old findings."
    ],
    "description": "Every project now includes a dedicated security memory document that informs scans, adjusting focus based on risks already evaluated and accepted by the team.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Customizable memory document",
      "Focused security scanning",
      "Document risk acceptance",
      "Automated conditions for scans",
      "Enhanced project security",
      "Supports continuous validation"
    ]
  },
  {
    "id": "seo-and-ai-search",
    "icon": "✨",
    "name": "SEO and AI search",
    "source": "https://docs.lovable.dev/features/seo-aeo",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhance your SEO and AI search capabilities with on-demand audits.",
    "category": "Cloud",
    "useCases": [
      "Run an SEO audit before launching a marketing site.",
      "Set up Google Search Console without leaving the project.",
      "Check site performance and accessibility from one tab."
    ],
    "description": "Lovable includes a dedicated SEO and AI search tab that offers comprehensive features for auditing web presence. Users can run audits on various SEO parameters including sitemap and performance checks. With integrated Google Search Console setup, this feature simplifies the SEO management process.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "On-demand audits for SEO parameters",
      "Integrated SEO recommendations",
      "Custom domain management",
      "Google Search Console setup",
      "Semrush-powered SEO insights",
      "Performance and accessibility checks"
    ]
  },
  {
    "id": "tanstack-start-is-now-the-default-for-new-apps",
    "icon": "✨",
    "name": "TanStack Start is now the default for new apps",
    "source": "https://docs.lovable.dev/changelog#tanstack-start-is-now-the-default-for-new-apps",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Faster web apps from the start with default server-side rendering.",
    "category": "Workflow",
    "useCases": [
      "Launch a new app with server-side rendering enabled by default.",
      "Get better SEO out of the box on a freshly created project.",
      "Load dynamic content faster on a newly built app."
    ],
    "description": "New apps created from this date will default to TanStack Start with server-side rendering enabled. This improves SEO and ensures applications are more performant right from the launch.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Default server-side rendering",
      "Better SEO from launch",
      "Supports dynamic content loading",
      "Improves initial load speed",
      "Expands performance features",
      "Enhances search engine indexing"
    ]
  },
  {
    "id": "wiz-security-scanning",
    "icon": "✨",
    "name": "Wiz security scanning",
    "source": "https://docs.lovable.dev/integrations/wiz",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Ensure your projects are secure with Wiz integration.",
    "category": "Security",
    "useCases": [
      "Scan project dependencies for known vulnerabilities.",
      "Catch an insecure code pattern before it ships.",
      "Centralize findings from multiple projects in one security view."
    ],
    "description": "Wiz adds a layer of security to Lovable by providing software composition analysis and static application security testing. This integration aids workspace admins in scanning for vulnerabilities directly within projects.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Dependency vulnerabilities analysis",
      "Static code pattern testing",
      "Centralized security findings",
      "Integration with existing workflows",
      "Real-time vulnerability alerts",
      "Support for multiple projects"
    ]
  },
  {
    "id": "workspace-skills",
    "icon": "✨",
    "name": "Workspace skills",
    "source": "https://docs.lovable.dev/features/skills",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Create reusable skills that standardize workflows across your projects.",
    "category": "Workflow",
    "useCases": [
      "Turn a recurring task into a reusable playbook for the team.",
      "Import a public GitHub repo as a skill for common workflows.",
      "Invoke a saved skill from chat instead of repeating instructions."
    ],
    "description": "Workspace admins can now develop skills that teach Lovable how to perform recurring tasks. These skills can be used to automate processes within projects, streamlining operations and ensuring consistency across tasks.",
    "releaseDate": "2026-05-18",
    "capabilities": [
      "Create markdown playbooks for workflows",
      "Apply skills automatically based on tasks",
      "Import public GitHub repositories as skills",
      "Invoke skills from chat",
      "Share skills across projects",
      "Customize initial setup for new skills"
    ]
  },
  {
    "id": "design-guidance",
    "icon": "",
    "name": "Design Guidance",
    "source": "https://docs.lovable.dev/features/design-guidance",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Pick three design directions or steer typography, color, and layout before Lovable builds.",
    "category": "Editor",
    "useCases": [
      "Landing pages and marketing sites",
      "Portfolios and blogs",
      "Exploring visual identity before committing",
      "Redesigning a hero, navbar, pricing card, or footer"
    ],
    "description": "Design Guidance shapes the visual direction before the build. Lovable either renders three lightweight HTML/Tailwind design directions side-by-side (refinable up to six times), asks a short set of design questions covering typography pairs, curated color palettes, and layout wireframes, or builds directly when the brief is already explicit. Works on new projects and on sections of existing projects (hero, navbar, pricing, footer).",
    "releaseDate": "2026-05-12",
    "capabilities": [
      "Three parallel design directions",
      "Side-by-side preview + fullscreen",
      "Up to 6 refinements per round",
      "Typography pair picker",
      "Curated color palette picker",
      "Layout wireframe picker (bento, split, magazine, etc.)",
      "Section-level variations on existing projects",
      "Screenshot-based redesign"
    ]
  },
  {
    "id": "code-mode",
    "icon": "💻",
    "name": "Code Mode",
    "source": "https://docs.lovable.dev/features/code-mode",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Inspect and edit project code directly inside Lovable.",
    "category": "Editor",
    "useCases": [
      "Tweak a single Tailwind class without a prompt",
      "Read a generated Supabase migration before approving"
    ],
    "description": "View and edit your project's underlying codebase from inside Lovable — inspect files, make targeted edits, troubleshoot without exporting or switching tools. Available on paid plans.",
    "releaseDate": "2026-05-07",
    "capabilities": [
      "File tree browser with diff view",
      "In-place text editing with syntax highlighting",
      "Round-trip safe with Agent Mode"
    ]
  },
  {
    "id": "lovable-mcp-server",
    "icon": "🔌",
    "name": "Lovable MCP Server",
    "source": "https://docs.lovable.dev/integrations/lovable-mcp-server",
    "status": "GA",
    "pricing": "Research Preview",
    "tagline": "Connect external AI agents to Lovable via MCP.",
    "category": "Agent",
    "useCases": [
      "Trigger builds from a custom agent",
      "Wire Lovable into an internal AI workflow"
    ],
    "description": "The Lovable MCP Server exposes project creation, agent messaging, code inspection, Cloud Postgres queries, analytics, and workspace governance to MCP-compatible clients (Claude Desktop, claude.ai, Cursor, Windsurf, Claude Code). OAuth, not API keys. Now available on all plans as of June 2026.",
    "releaseDate": "2026-05-07",
    "capabilities": [
      "Streamable HTTP MCP transport",
      "Drive Lovable from external agents",
      "Composable with other MCP clients"
    ]
  },
  {
    "id": "wiz-findings-integration",
    "icon": "",
    "name": "Wiz Findings in Lovable",
    "source": "https://lovable.dev/blog/wiz-findings-now-in-lovable",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Native Wiz security scans inside Lovable's Security view.",
    "category": "Security",
    "useCases": [
      "Enterprise security governance",
      "SOC 2 compliance posture",
      "Org-wide policy enforcement"
    ],
    "description": "Wiz security scanning runs automatically alongside Lovable's built-in checks. Findings map to existing Wiz policies and flow back into Wiz's Code and Build scans page, so organization-wide security standards apply to every Lovable project without separate tooling. Distinct from the basic Wiz connector — this is the tighter Findings integration.",
    "releaseDate": "2026-05-07",
    "capabilities": [
      "Software composition analysis",
      "Secrets detection",
      "Environment configuration scanning",
      "Wiz policy mapping",
      "Centralized Wiz dashboard sync"
    ]
  },
  {
    "id": "collaboration",
    "icon": "👥",
    "name": "Real-Time Collaboration",
    "source": "https://docs.lovable.dev/features/collaboration",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Invite collaborators by email — real-time co-editing.",
    "category": "Workspace",
    "useCases": [
      "Pair-build with a teammate",
      "Async design + dev handoffs"
    ],
    "description": "Press Share in the project editor and invite collaborators by email. Lovable supports real-time multi-user editing with live presence. Folder-level collaborator scoping added April 2026.",
    "releaseDate": "2026-05-05",
    "capabilities": [
      "Email-based invites",
      "Real-time presence and co-editing",
      "Folder-level collaborator scoping"
    ]
  },
  {
    "id": "branded-app-urls",
    "icon": "✨",
    "name": "Branded app URLs",
    "source": "https://docs.lovable.dev/changelog#branded-app-urls",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Publish apps under custom branded URLs for a professional look.",
    "category": "Publishing",
    "useCases": [
      "Publish every client app under one branded subdomain.",
      "Keep workspace branding consistent across published apps.",
      "Republish an old app under the new branded URL format."
    ],
    "description": "Business and Enterprise workspaces can now configure a branded URL for all apps in their workspace. This feature allows for a unified branding approach with custom subdomains. Admins can enable this in the workspace settings, ensuring that every newly published app uses the branded URL format.",
    "releaseDate": "2026-05-01",
    "capabilities": [
      "Custom subdomains for apps",
      "Unified branding across workspace",
      "Easily configurable by admins",
      "Maintains existing URLs for old apps",
      "Supports republishing for URL updates"
    ]
  },
  {
    "id": "gemini-3-5-flash",
    "icon": "✨",
    "name": "Gemini 3.5 Flash",
    "source": "https://docs.lovable.dev/integrations/ai#gemini-flash",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "New model for faster AI features in your apps.",
    "category": "AI Models",
    "useCases": [
      "Add fast AI-generated responses to a coding assistant feature.",
      "Run reasoning-heavy workflows without slowing the app down.",
      "Power an in-app AI feature with a quicker model option."
    ],
    "description": "Lovable's integrated AI connector now supports the Gemini 3.5 Flash model, allowing developers to integrate advanced AI features within their applications efficiently. This model facilitates quick coding and intelligent workflows.",
    "releaseDate": "2026-05-01",
    "capabilities": [
      "Faster coding responses.",
      "Improved reasoning tasks.",
      "Algorithmic efficiency improvements.",
      "Direct application enhancements.",
      "Streamlined implementation of features.",
      "Supports more complex workflows."
    ]
  },
  {
    "id": "google-maps-platform-connector",
    "icon": "✨",
    "name": "Google Maps Platform Connector",
    "source": "https://docs.lovable.dev/integrations/google-maps",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Geocoding, routes, places, and embedded maps in one connector.",
    "category": "App Connectors",
    "useCases": [
      "Store locators",
      "Delivery and routing tools",
      "Location-aware dashboards"
    ],
    "description": "Google Maps Platform supports geocoding, routes, places, embedded maps, address validation, weather, air quality, and other Google Maps APIs. Choose Managed by Lovable for the fastest setup or provide your own credentials.",
    "releaseDate": "2026-05-01",
    "capabilities": [
      "Geocode addresses",
      "Compute routes",
      "Search places",
      "Embed maps",
      "Validate addresses",
      "Query weather and air quality"
    ]
  },
  {
    "id": "semrush-connector",
    "icon": "✨",
    "name": "Semrush Connector",
    "source": "https://docs.lovable.dev/integrations/semrush",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Keyword research, domain analytics, backlinks, and paid search data.",
    "category": "App Connectors",
    "useCases": [
      "SEO dashboards",
      "Competitor tracking",
      "Client-facing SEO reports"
    ],
    "description": "Semrush lets apps read keyword research, domain analytics, backlinks, paid search data, project data, and position tracking from a connected Semrush account.",
    "releaseDate": "2026-05-01",
    "capabilities": [
      "Read keyword data",
      "Pull domain analytics",
      "Query backlinks",
      "Track positions",
      "Access paid search data",
      "Load project data"
    ]
  },
  {
    "id": "tiktok-connector",
    "icon": "✨",
    "name": "TikTok Connector",
    "source": "https://docs.lovable.dev/integrations/tiktok",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read TikTok profile, follower, and video statistics.",
    "category": "App Connectors",
    "useCases": [
      "Creator dashboards",
      "Content performance tracking",
      "Social reporting tools"
    ],
    "description": "TikTok lets apps read profile information, follower counts, like counts, video statistics, and published video metadata from a connected TikTok account. Read-only. Does not support publishing content.",
    "releaseDate": "2026-05-01",
    "capabilities": [
      "Read profile details",
      "Read follower counts",
      "Read like counts",
      "Fetch video statistics",
      "List published videos"
    ]
  },
  {
    "id": "mobile-app",
    "icon": "📱",
    "name": "Lovable Mobile App (iOS + Android)",
    "source": "https://techcrunch.com/2026/04/28/lovable-launches-its-vibe-coding-app-on-ios-and-android/",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Build, edit, and ship from your phone.",
    "category": "Mobile",
    "useCases": [
      "Sketch a build on the go and finish on desktop",
      "Approve a Plan Mode plan from your phone"
    ],
    "description": "Lovable launched its no-code AI app builder as a native mobile app on Apple's App Store and Google Play in late April 2026 — survived Apple's recent vibe-coding crackdown.",
    "releaseDate": "2026-04-28",
    "capabilities": [
      "Build and edit projects from iOS/Android",
      "Native mobile experience with sheets/menus",
      "Folders visible in mobile dashboard search (Apr 2026)"
    ]
  },
  {
    "id": "add-payments-to-your-app",
    "icon": "✨",
    "name": "Add payments to your app",
    "source": "https://docs.lovable.dev/changelog#add-payments-to-your-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Easily integrate subscriptions and payments into your app.",
    "category": "Integrations",
    "useCases": [
      "Launch subscription billing for a SaaS app without a payments team.",
      "Add one-time checkout for a digital product in an afternoon.",
      "Sell membership access using Stripe or Paddle inside the app."
    ],
    "description": "Lovable payments allows you to add subscriptions and one-time payments to any app using Paddle or Stripe integrations. The setup process is simplified to focus on your product development while Lovable manages the back-end infrastructure.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Set up a checkout in minutes",
      "Create products and pricing",
      "Support for SaaS and memberships",
      "Handle subscription data",
      "Live implementation same day",
      "Use physical product integrations with Stripe"
    ]
  },
  {
    "id": "asana-connector",
    "icon": "",
    "name": "Asana Connector",
    "source": "https://docs.lovable.dev/integrations/asana",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and write Asana projects, tasks, and assignments.",
    "category": "App Connectors",
    "useCases": [
      "Internal apps that surface Asana work"
    ],
    "description": "Asana business connector enables apps to read and write Asana projects, tasks, and assignments.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Read/write tasks and projects"
    ]
  },
  {
    "id": "ashby-connector",
    "icon": "",
    "name": "Ashby Connector",
    "source": "https://docs.lovable.dev/integrations/ashby",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Manage jobs, candidates, applications, and hiring workflows.",
    "category": "App Connectors",
    "useCases": [
      "Custom recruiting dashboards"
    ],
    "description": "Ashby ATS connector enables hiring-workflow apps to manage jobs, candidates, and applications.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Job, candidate, application management"
    ]
  },
  {
    "id": "auth-policy",
    "icon": "",
    "name": "Workspace Authentication Policy",
    "source": "https://docs.lovable.dev/features/security-center",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Configure which sign-in methods (email, Google, Apple, SAML) are allowed.",
    "category": "Security",
    "useCases": [
      "Forcing SSO-only org sign-in"
    ],
    "description": "Workspace Authentication Policy controls which sign-in methods (email, phone, Google, Apple, SAML) are permitted across the workspace. Surfaced in Security Center.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Method-level allow/deny",
      "SAML enforcement"
    ]
  },
  {
    "id": "bigquery-connector",
    "icon": "",
    "name": "BigQuery Connector",
    "source": "https://docs.lovable.dev/integrations/bigquery",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Query datasets and build analytics on Google BigQuery.",
    "category": "App Connectors",
    "useCases": [
      "Internal BI tools",
      "Customer-facing analytics"
    ],
    "description": "BigQuery data warehouse connector enables querying datasets and building analytics dashboards on top of BigQuery.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Query BigQuery datasets",
      "Analytics dashboards"
    ]
  },
  {
    "id": "chat-history-search",
    "icon": "🔎",
    "name": "Chat History Search",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Keyword and semantic search across full project history.",
    "category": "Editor",
    "useCases": [
      "Find the prompt that produced a specific component",
      "Audit decision history for a feature"
    ],
    "description": "Search and reference your full project conversation history with keyword search and semantic question answering. Find why you made a decision, what prompt produced a result, or jump back into an old thread.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Keyword search across all conversations",
      "Semantic Q&A grounded on prior messages",
      "Reference prior threads in new prompts"
    ]
  },
  {
    "id": "claude-opus-4-7",
    "icon": "",
    "name": "Claude Opus 4.7",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Anthropic Opus 4.7 available in Lovable chat.",
    "category": "AI Models",
    "useCases": [
      "Architecturally heavy code generation"
    ],
    "description": "The integration of Claude Opus 4.7 brings significant improvements in code quality, instruction following, and performance for complex, multi-step tasks within Lovable. This update is aimed at enhancing the overall user experience and efficiency during development.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Premium reasoning for complex builds"
    ]
  },
  {
    "id": "cloud-saml-sso-for-apps",
    "icon": "",
    "name": "Cloud SAML SSO (Per-App)",
    "source": "https://docs.lovable.dev/features/cloud-saml-sso",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "Let end users of your Cloud app sign in through their IdP.",
    "category": "Cloud",
    "useCases": [
      "B2B apps requiring customer SSO",
      "Enterprise procurement requirements"
    ],
    "description": "Per-project SAML 2.0 SSO for end users of Cloud apps. Supports Okta, Microsoft Entra ID, Google Workspace, OneLogin, JumpCloud, and Auth0 via metadata URL. Includes JIT provisioning and domain-based routing. One SAML provider per project; SP-initiated only; no SCIM or attribute mapping UI.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Any SAML 2.0 IdP via metadata URL",
      "JIT user provisioning on first login",
      "Domain-based routing",
      "Certificate auto-rotation"
    ]
  },
  {
    "id": "code-execution",
    "icon": "▶️",
    "name": "Code Execution in Chat",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Enterprise",
    "tagline": "Run code and analyze data without modifying your project.",
    "category": "Agent",
    "useCases": [
      "Ad-hoc data analysis on a sales CSV",
      "Produce a one-off report PDF for a client",
      "Prototype a script without committing it"
    ],
    "description": "On Enterprise plans, Lovable can analyze data, generate files, and execute code directly in chat without touching project source. Pair with File Generation to produce PDF/Excel/PPT artifacts on demand.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Sandboxed code execution in-thread",
      "Analyze attached datasets",
      "Generate downloadable PDF, Excel, PPT files",
      "No project source modification"
    ]
  },
  {
    "id": "databricks-connector",
    "icon": "",
    "name": "Databricks Connector",
    "source": "https://docs.lovable.dev/integrations/databricks",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Run SQL and call Databricks workspace APIs.",
    "category": "App Connectors",
    "useCases": [
      "Apps on top of Databricks data"
    ],
    "description": "Databricks connector runs SQL and calls Databricks workspace APIs from Lovable apps.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "SQL queries",
      "Workspace API calls"
    ]
  },
  {
    "id": "domain-jit",
    "icon": "🏢",
    "name": "Domain JIT Provisioning",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Business+",
    "tagline": "Auto-add verified-email users into the right workspace.",
    "category": "Workspace",
    "useCases": [
      "Frictionless org onboarding",
      "Self-serve access"
    ],
    "description": "New users signing up with a verified company email are auto-placed into the correct workspaces with the configured default role. Workspace discovery lets users request access during onboarding.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "JIT placement",
      "Default role on join",
      "Workspace discovery"
    ]
  },
  {
    "id": "export-secrets-csv",
    "icon": "",
    "name": "Export Secrets (CSV)",
    "source": "https://docs.lovable.dev/features/security-center",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Export secret inventory as CSV for audits (names only, no values).",
    "category": "Security",
    "useCases": [
      "Compliance audits",
      "Secret inventory reviews"
    ],
    "description": "Export Secrets exports the workspace's secret inventory as CSV — names and project usage only, values never leave Lovable.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "CSV export of secret names",
      "Project usage mapping"
    ]
  },
  {
    "id": "fireflies-connector",
    "icon": "",
    "name": "Fireflies Connector",
    "source": "https://docs.lovable.dev/integrations/fireflies",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read Fireflies meeting transcripts, summaries, and conversation intelligence.",
    "category": "App Connectors",
    "useCases": [
      "Meeting-aware CRMs",
      "Sales coaching tools"
    ],
    "description": "Fireflies connector reads meeting transcripts, summaries, and conversation intelligence into Lovable apps.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Transcript and summary access",
      "Conversation intelligence"
    ]
  },
  {
    "id": "folder-collaborators",
    "icon": "",
    "name": "Folder Collaborators",
    "source": "https://docs.lovable.dev/features/groups",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Share folders with groups or people — grants access to all projects inside.",
    "category": "Workspace",
    "useCases": [
      "Team-level project bundles"
    ],
    "description": "Folder Collaborators grants group or individual access to all projects within a folder, including folder visibility controls.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Folder-level access controls",
      "Group or individual sharing"
    ]
  },
  {
    "id": "gemini-enterprise-connector",
    "icon": "",
    "name": "Gemini Enterprise Connector",
    "source": "https://docs.lovable.dev/integrations/gemini-enterprise",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Access Gemini Enterprise knowledge from inside your app.",
    "category": "App Connectors",
    "useCases": [
      "Enterprise knowledge-grounded apps"
    ],
    "description": "Gemini Enterprise connector pulls in enterprise Gemini knowledge as a source for Lovable apps.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Gemini Enterprise knowledge access"
    ]
  },
  {
    "id": "google-workspace-connector",
    "icon": "",
    "name": "Google Workspace Connector",
    "source": "https://docs.lovable.dev/integrations/google-workspace",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Gmail, Drive, Docs, Sheets, Slides, and Calendar access.",
    "category": "App Connectors",
    "useCases": [
      "Apps that read Drive documents",
      "Calendar-aware tools"
    ],
    "description": "Google Workspace productivity connector bundles Gmail, Drive, Docs, Sheets, Slides, and Calendar in one connection.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Gmail, Drive, Docs, Sheets, Slides, Calendar",
      "Single OAuth connection"
    ]
  },
  {
    "id": "google-workspace-document-editing",
    "icon": "✨",
    "name": "Google Workspace Document Editing",
    "source": "https://docs.lovable.dev/tips-tricks/google-workspace-editing",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Embed live, editable Docs, Sheets, and Slides via iframe.",
    "category": "Integrations",
    "useCases": [
      "Client-facing spreadsheets",
      "Collaborative writing tools",
      "Slide presentation embeds"
    ],
    "description": "Embed Google Docs, Sheets, and Slides as live, editable iframes inside a Lovable app so users can co-author documents without leaving the product. Distinct from the Google Workspace Connector, which reads and writes through the API.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Embed Docs iframes",
      "Embed Sheets iframes",
      "Embed Slides iframes",
      "Preserve edit permissions",
      "Support view-only embeds"
    ]
  },
  {
    "id": "granola-connector",
    "icon": "",
    "name": "Granola App Connector",
    "source": "https://docs.lovable.dev/integrations/granola",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Access AI-generated meeting notes from Granola.",
    "category": "App Connectors",
    "useCases": [
      "Knowledge bases from meetings"
    ],
    "description": "Granola app connector accesses meeting notes, summaries, and transcripts — distinct from the Granola MCP chat connector.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Meeting notes and summaries"
    ]
  },
  {
    "id": "granular-publishing",
    "icon": "",
    "name": "Granular Publishing Access",
    "source": "https://docs.lovable.dev/features/publish",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Restrict published-app access to specific people or groups.",
    "category": "Publishing",
    "useCases": [
      "Internal-only apps for one team",
      "Tight launch control"
    ],
    "description": "Granular Publishing restricts published-app access to specific workspace members or groups rather than the entire workspace or public. Enterprise can additionally restrict who can trigger publishes.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Member- and group-level access",
      "Per-app restriction lists",
      "Enterprise: restrict who can publish"
    ]
  },
  {
    "id": "group-based-access-and-granular-publishing",
    "icon": "✨",
    "name": "Group-based access and granular publishing",
    "source": "https://docs.lovable.dev/changelog#group-based-access-and-granular-publishing",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Control access to projects and manage team workflows effectively.",
    "category": "Security",
    "useCases": [
      "Limit publishing rights to a specific team within the workspace.",
      "Sync workspace groups automatically through SCIM.",
      "Keep sensitive projects visible only to the assigned group."
    ],
    "description": "Groups enable workspace admins to organize team members and manage access permissions across projects and folders, ensuring only relevant users have access to sensitive projects or publishing options.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Organize members by role",
      "Control access to published apps",
      "Manage project folders",
      "Supports SCIM sync",
      "Available on Business and Enterprise plans",
      "Facilitates workflow optimization"
    ]
  },
  {
    "id": "groups",
    "icon": "",
    "name": "Groups",
    "source": "https://docs.lovable.dev/features/groups",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Team-based access controls with SCIM sync.",
    "category": "Workspace",
    "useCases": [
      "Granting whole teams access at once",
      "Restricting published apps to a department"
    ],
    "description": "Groups organize workspace members for project sharing, folder sharing, and published-app visibility. Sync from identity providers via SCIM with a SCIM badge. Higher of individual vs group permission applies. Audit-logged on Enterprise.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Group-based project and folder sharing",
      "Published-app visibility",
      "SCIM sync"
    ]
  },
  {
    "id": "groups-scim-sso",
    "icon": "🔐",
    "name": "Groups, SCIM & SAML SSO",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Business / Enterprise",
    "tagline": "Enterprise identity: groups, auto-provisioning, SAML.",
    "category": "Workspace",
    "useCases": [
      "Roll Lovable out to a 500-person org",
      "Tie access to corporate IdP groups"
    ],
    "description": "Group-based Access (with SCIM sync), SCIM provisioning, and SAML 2.0 SSO (Okta, Azure AD, OneLogin). Workspace provisioning bulk-adds users from a verified email domain.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Group-based access control",
      "SCIM auto-provisioning / deprovisioning",
      "SAML 2.0 SSO (Okta, Azure AD, OneLogin)",
      "Workspace bulk provisioning from a domain"
    ]
  },
  {
    "id": "hubspot-connector",
    "icon": "",
    "name": "HubSpot Connector",
    "source": "https://docs.lovable.dev/integrations/hubspot",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Work with HubSpot CRM contacts, companies, deals, and service data.",
    "category": "App Connectors",
    "useCases": [
      "Sales-team internal tools"
    ],
    "description": "HubSpot connector reads and writes CRM contacts, companies, deals, and service data.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "CRM contacts, companies, deals",
      "Service data"
    ]
  },
  {
    "id": "inngest-connector",
    "icon": "",
    "name": "Inngest Connector",
    "source": "https://docs.lovable.dev/integrations/inngest",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Durable background jobs, schedules, and event-driven workflows.",
    "category": "App Connectors",
    "useCases": [
      "Long-running data pipelines",
      "Reliable cron alternatives"
    ],
    "description": "Inngest workflow connector runs durable background jobs, schedules, and event-driven workflows from Lovable apps.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Durable background jobs",
      "Scheduled tasks",
      "Event-driven workflows"
    ]
  },
  {
    "id": "lovable-desktop-app",
    "icon": "",
    "name": "Lovable Desktop App",
    "source": "https://docs.lovable.dev/integrations/desktop-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Native macOS app with local MCP support and multi-project tabs.",
    "category": "Workspace",
    "useCases": [
      "Designers connecting Figma Desktop while building",
      "Power users managing several projects at once"
    ],
    "description": "The Lovable Desktop App runs natively on macOS (Apple Silicon and Intel) with Windows support announced as coming soon. It is the only surface that supports local MCP servers — connecting to tools running directly on the machine like Figma Desktop and Paper — and adds tab-based multi-project management with keyboard shortcuts.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Local MCP server connections (Figma Desktop, Paper)",
      "Multi-project tabs with Cmd+T and Cmd+1-9",
      "Command palette and keyboard shortcuts"
    ]
  },
  {
    "id": "lovable-desktop-windows",
    "icon": "🪟",
    "name": "Lovable Desktop for Windows",
    "source": "https://docs.lovable.dev/integrations/desktop-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Native Windows build of Lovable Desktop — coming soon.",
    "category": "Workflow",
    "useCases": [
      "Windows-based teams",
      "Local Figma/Paper workflows"
    ],
    "description": "macOS Lovable Desktop is GA; the Windows build is rolling out next, with the same multi-project tabs, keyboard shortcuts, and local MCP support (Figma Desktop, Paper).",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Multi-project tabs",
      "Local MCP servers",
      "Keyboard shortcuts"
    ]
  },
  {
    "id": "lovable-payments",
    "icon": "",
    "name": "Lovable Payments",
    "source": "https://docs.lovable.dev/features/payments",
    "status": "GA",
    "pricing": "Pro and Business plans",
    "tagline": "Built-in subscriptions and one-time payments via Paddle or Stripe.",
    "category": "Cloud",
    "useCases": [
      "SaaS subscription billing",
      "One-time digital purchases"
    ],
    "description": "Lovable Payments handles account creation, webhooks, and subscription management for monetized apps. Developers choose Paddle (Merchant of Record handling tax and invoicing) or Stripe (standard PSP pricing with lower per-transaction fees). Requires Lovable Cloud for webhook data.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Subscription tiers and one-time purchases",
      "Free trials and discount codes",
      "Customer portal and revenue analytics",
      "Test and live environment isolation"
    ]
  },
  {
    "id": "microsoft-365-connector",
    "icon": "",
    "name": "Microsoft 365 Connector",
    "source": "https://docs.lovable.dev/integrations/microsoft",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Outlook, Teams, OneDrive, Word, Excel, PowerPoint, OneNote.",
    "category": "App Connectors",
    "useCases": [
      "Enterprise apps integrating with M365",
      "Email and calendar automation"
    ],
    "description": "Microsoft 365 productivity connector bundles Outlook, Teams, OneDrive, Word, Excel, PowerPoint, and OneNote in one connection.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Outlook, Teams, OneDrive",
      "Word, Excel, PowerPoint, OneNote"
    ]
  },
  {
    "id": "paddle-payments",
    "icon": "💳",
    "name": "Paddle Payments",
    "source": "https://docs.lovable.dev/features/payments",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "One-click subscriptions and one-time checkout via Paddle.",
    "category": "Integrations",
    "useCases": [
      "SaaS billing",
      "Memberships",
      "Digital product sales"
    ],
    "description": "Lovable Payments adds Paddle alongside Stripe — handles account creation, webhooks, subscription data, and a working test checkout in minutes. Supports SaaS, subscriptions, memberships, and digital products.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Hosted checkout",
      "Subscriptions + one-time",
      "Auto webhook wiring",
      "Same-day go-live"
    ]
  },
  {
    "id": "project-folders",
    "icon": "✨",
    "name": "Project Folders",
    "source": "https://docs.lovable.dev/introduction/project-folders",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Organize projects into personal and shared workspace folders.",
    "category": "Workspace",
    "useCases": [
      "Workspace organization",
      "Client project separation",
      "Team access control"
    ],
    "description": "Project Folders group projects into personal and shared folders, with collaborator access and inherited permissions on shared folders. Move projects between folders from the dashboard or from chat.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Create personal folders",
      "Create shared folders",
      "Add folder collaborators",
      "Move projects into folders",
      "Inherit access from folders"
    ]
  },
  {
    "id": "project-visibility",
    "icon": "👁️",
    "name": "Project Visibility & Public Remixing",
    "source": "https://docs.lovable.dev/features/project-visibility",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Workspace-default visibility with opt-in public remixing.",
    "category": "Publishing",
    "useCases": [
      "Safer defaults",
      "Templates and showcases"
    ],
    "description": "Public project visibility was removed; all projects default to workspace visibility with access controlled via project access settings. Enable Public Remixing in Project Settings to let others copy and remix your project.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Workspace-only by default",
      "Per-project access controls",
      "Opt-in remix"
    ]
  },
  {
    "id": "resend-connector",
    "icon": "",
    "name": "Resend Connector",
    "source": "https://docs.lovable.dev/integrations/resend",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send transactional and marketing email via Resend.",
    "category": "App Connectors",
    "useCases": [
      "Order confirmations",
      "Newsletter delivery"
    ],
    "description": "Resend connector sends transactional and marketing emails from app workflows. Promoted to a first-class connector in the April 2026 connector wave.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Transactional email",
      "Marketing email"
    ]
  },
  {
    "id": "saml-2-0-single-sign-on-for-your-apps",
    "icon": "✨",
    "name": "SAML 2.0 single sign-on for your apps",
    "source": "https://docs.lovable.dev/changelog#saml-2-0-single-sign-on-for-your-apps",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Simplify authentication with seamless SAML integration.",
    "category": "Security",
    "useCases": [
      "Add Okta-based single sign-on to a customer-facing app.",
      "Centralize login credentials for an app's enterprise customers.",
      "Support Azure AD authentication in a Lovable Cloud app."
    ],
    "description": "The new SAML 2.0 SSO feature enables users to easily incorporate single sign-on capabilities into their Lovable Cloud applications, streamlining the user login process across platforms.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Configure authentication automatically",
      "Support for Okta and Azure AD",
      "Enhance security with SSO",
      "Seamless integration with Identity Providers",
      "Simplifies user management",
      "Centralized credential management"
    ]
  },
  {
    "id": "saml-sso-apps",
    "icon": "🪪",
    "name": "SAML 2.0 SSO for Your Apps",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Cloud apps",
    "tagline": "Add enterprise SSO to apps you build.",
    "category": "Security",
    "useCases": [
      "Sell to enterprise",
      "Internal tools with corp SSO"
    ],
    "description": "Add SAML 2.0 SSO to Cloud apps from Lovable Cloud → Users → Auth, or just ask the agent. Works with Okta, Azure AD / Entra ID, OneLogin, and other SAML 2.0 providers — Lovable collects metadata and configures auth automatically.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Okta, Entra, OneLogin",
      "Auto IdP metadata setup",
      "Domain-bound auth"
    ]
  },
  {
    "id": "sentry-mcp-connector",
    "icon": "",
    "name": "Sentry MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Error tracking and performance monitoring for the agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Bug fixing with full error context"
    ],
    "description": "Sentry MCP connector exposes error tracking and performance monitoring data to the agent.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Error and performance context"
    ]
  },
  {
    "id": "snowflake-connector",
    "icon": "",
    "name": "Snowflake Connector",
    "source": "https://docs.lovable.dev/integrations/snowflake",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Query data and run SQL against Snowflake.",
    "category": "App Connectors",
    "useCases": [
      "Customer-facing analytics dashboards"
    ],
    "description": "Snowflake connector runs SQL and queries data warehouses against Snowflake.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Snowflake SQL queries"
    ]
  },
  {
    "id": "stripe",
    "icon": "💳",
    "name": "Stripe Payments",
    "source": "https://docs.lovable.dev/integrations/stripe",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Chat-driven Stripe (and Paddle) setup for subs and one-time.",
    "category": "Integrations",
    "useCases": [
      "Launch a paid SaaS with tiers in an afternoon",
      "Add a one-time digital purchase to a landing page"
    ],
    "description": "Lovable Payments adds subscriptions and one-time payments via Paddle or Stripe. The agent handles account creation, webhooks, and data. Stripe-only flow available since April 2026 via chat-driven auto-setup once Supabase + Stripe Secret Key are configured.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Subscriptions and one-time payments",
      "Webhook handling generated automatically",
      "Paddle or Stripe provider choice",
      "Chat-driven, no manual Payment Links"
    ]
  },
  {
    "id": "wordpress-connector",
    "icon": "",
    "name": "WordPress.com Connector",
    "source": "https://docs.lovable.dev/integrations/wordpress-com",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and manage WordPress.com sites and content.",
    "category": "App Connectors",
    "useCases": [
      "Content dashboards over WP.com sites"
    ],
    "description": "WordPress.com connector reads and manages content on WordPress.com sites.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Read and manage WP.com content"
    ]
  },
  {
    "id": "workspace-provisioning",
    "icon": "✨",
    "name": "Workspace provisioning",
    "source": "https://docs.lovable.dev/changelog#workspace-provisioning",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Bulk-provision users smoothly and efficiently.",
    "category": "Security",
    "useCases": [
      "Bulk-add new hires to a workspace from a verified email domain.",
      "Assign a default role automatically during onboarding.",
      "Preview provisioned users before finalizing an import."
    ],
    "description": "Admins can now bulk-provision users from verified email domains into their workspace, simplifying the onboarding process and ensuring correct user roles.",
    "releaseDate": "2026-04-24",
    "capabilities": [
      "Bulk provisioning of users",
      "Assign default roles",
      "Preview provisioned users",
      "Streamlines onboarding process",
      "Supports verified domains",
      "User management capability"
    ]
  },
  {
    "id": "airtable-connector",
    "icon": "",
    "name": "Airtable Connector",
    "source": "https://docs.lovable.dev/integrations/airtable",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and write Airtable bases, tables, and records.",
    "category": "App Connectors",
    "useCases": [
      "Airtable-backed internal tools"
    ],
    "description": "Airtable connector reads and writes bases, tables, and records — appears in the integrations index.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Read/write Airtable records"
    ]
  },
  {
    "id": "attention-connector",
    "icon": "",
    "name": "Attention Connector",
    "source": "https://docs.lovable.dev/integrations/attention",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Sales conversations, transcripts, and scorecards.",
    "category": "App Connectors",
    "useCases": [
      "Revenue ops dashboards"
    ],
    "description": "Attention sales-intelligence connector accesses conversations, transcripts, and scorecards.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Sales transcript and scorecard access"
    ]
  },
  {
    "id": "brevo-connector",
    "icon": "",
    "name": "Brevo Connector",
    "source": "https://docs.lovable.dev/integrations/brevo",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Transactional and marketing email via Brevo.",
    "category": "App Connectors",
    "useCases": [
      "Newsletter tools",
      "Notification email"
    ],
    "description": "Brevo connector sends transactional and marketing email and manages contacts.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Transactional + marketing email",
      "Contact management"
    ]
  },
  {
    "id": "gpt-5-4",
    "icon": "",
    "name": "GPT-5.4",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "GPT-5.4 standard, Pro, Mini, and Nano variants.",
    "category": "AI Models",
    "useCases": [
      "Tuning cost-per-build across teams"
    ],
    "description": "GPT-5.4 family — including Pro, standard, Mini, and Nano variants — is selectable in Lovable AI for builds requiring OpenAI-class reasoning.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Multiple cost/quality tiers (Pro, standard, Mini, Nano)"
    ]
  },
  {
    "id": "gpt-5-5",
    "icon": "",
    "name": "GPT-5.5 (Pro and Standard)",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "OpenAI GPT-5.5 Pro and standard tiers in Lovable AI.",
    "category": "AI Models",
    "useCases": [
      "Top-tier OpenAI generation"
    ],
    "description": "GPT-5.5 Pro and standard tiers are documented as supported in Lovable AI alongside the rest of the OpenAI lineup.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Pro and standard tiers selectable"
    ]
  },
  {
    "id": "heygen-mcp-connector",
    "icon": "",
    "name": "HeyGen MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Generate AI avatars, voiceovers, and videos.",
    "category": "MCP Connectors",
    "useCases": [
      "In-app video generation"
    ],
    "description": "HeyGen MCP connector generates AI avatars, voiceovers, and videos from inside the agent.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "AI avatars, voice, video"
    ]
  },
  {
    "id": "mailgun-connector",
    "icon": "",
    "name": "Mailgun Connector",
    "source": "https://docs.lovable.dev/integrations/mailgun",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send transactional email from a verified Mailgun domain.",
    "category": "App Connectors",
    "useCases": [
      "Order confirmations",
      "Password resets"
    ],
    "description": "Mailgun connector sends transactional email from a verified domain.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Transactional email sending"
    ]
  },
  {
    "id": "notion-app-connector",
    "icon": "",
    "name": "Notion App Connector",
    "source": "https://docs.lovable.dev/integrations/notion",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and write Notion pages and databases.",
    "category": "App Connectors",
    "useCases": [
      "Notion-backed apps",
      "Content migration"
    ],
    "description": "Notion app connector reads and writes pages and queries databases — distinct from the Notion MCP chat connector.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Read/write pages",
      "Query Notion databases"
    ]
  },
  {
    "id": "wiz-connector",
    "icon": "",
    "name": "Wiz Connector",
    "source": "https://docs.lovable.dev/integrations/wiz",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Scan project dependencies for known vulnerabilities.",
    "category": "App Connectors",
    "useCases": [
      "Compliance-driven dependency audits"
    ],
    "description": "Wiz connector scans project dependencies for known vulnerabilities.",
    "releaseDate": "2026-04-15",
    "capabilities": [
      "Dependency vulnerability scanning"
    ]
  },
  {
    "id": "ai-powered-visual-edits",
    "icon": "",
    "name": "AI-Powered Visual Edits",
    "source": "https://docs.lovable.dev/features/design",
    "status": "GA",
    "pricing": "All plans (with daily free limits)",
    "tagline": "Multi-element visual editing with AI image generation and text editing.",
    "category": "Editor",
    "useCases": [
      "Designer-friendly tweaks",
      "Marketer copy edits"
    ],
    "description": "Visual Edits v2 supports multi-selection, text/color/font edits, individual margin/padding, image replacement, and AI image generation inline. Free up to 100 edits/user/24h and 500/IP/24h; additional edits use credits.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Multi-element selection",
      "AI image generation in-place",
      "Text, color, font, layout edits"
    ]
  },
  {
    "id": "ai-visual-edits",
    "icon": "✨",
    "name": "AI Visual Edits",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Free (within daily limits)",
    "tagline": "Visual edits that propagate across dynamic data.",
    "category": "Editor",
    "useCases": [
      "Rebrand a product card list without rewriting JSX",
      "Restyle every row in a data table consistently"
    ],
    "description": "AI-powered Visual Edits now update UI elements across the entire app, including dynamic content rendered from databases and APIs. Includes zoom and crop tools for inspecting specific image regions.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Edit a card style once → applies everywhere the component renders",
      "Works against dynamic data from Supabase/Lovable Cloud",
      "Image zoom and crop inspection tools"
    ]
  },
  {
    "id": "aikido-penetration-testing",
    "icon": "✨",
    "name": "Aikido penetration testing",
    "source": "https://docs.lovable.dev/changelog#aikido-penetration-testing-is-now-available-on-all-plans",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Enhance your security with AI-powered penetration testing.",
    "category": "Security",
    "useCases": [
      "Run dynamic penetration tests before a compliance review.",
      "Surface exploitable vulnerabilities directly in the project view.",
      "Generate a downloadable security report for a stakeholder."
    ],
    "description": "Aikido empowers workspaces to conduct dynamic penetration testing to identify vulnerabilities, sync findings to security views, and generate reports for compliance and reviews, enhancing project security.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "AI-powered testing",
      "Identify vulnerabilities",
      "Sync findings into project security view",
      "Generate downloadable reports"
    ]
  },
  {
    "id": "app-emails",
    "icon": "✉️",
    "name": "App Emails (Transactional)",
    "source": "https://docs.lovable.dev/features/custom-emails",
    "status": "GA",
    "pricing": "Paid plans (Cloud)",
    "tagline": "Branded transactional email from your own domain.",
    "category": "Cloud",
    "useCases": [
      "Order confirmations",
      "User notifications",
      "Receipts"
    ],
    "description": "Send order confirmations, receipts, shipping updates, and security notices from your verified domain. Branded templates, automatic unsubscribe handling, suppression lists, and delivery infra all built-in — no external email provider required.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Custom domain sender",
      "Branded templates",
      "Auto unsubscribe",
      "Suppression lists"
    ]
  },
  {
    "id": "aws-s3-connector",
    "icon": "",
    "name": "AWS S3 Connector",
    "source": "https://docs.lovable.dev/integrations/aws-s3",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read and write files to AWS S3 buckets.",
    "category": "App Connectors",
    "useCases": [
      "Apps with existing S3 storage",
      "Hybrid storage architectures"
    ],
    "description": "AWS S3 connector enables read/write access to S3 buckets directly from app workflows.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "S3 read and write",
      "Bucket access"
    ]
  },
  {
    "id": "browser-perf",
    "icon": "⚡",
    "name": "Browser Performance Tools",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Profile Core Web Vitals, CPU, memory, and long tasks.",
    "category": "Testing",
    "useCases": [
      "Catch a regression that tanks LCP",
      "Investigate a memory leak in a dashboard"
    ],
    "description": "Extends Browser Testing with performance profiling: Core Web Vitals (LCP/CLS/INP), CPU usage, long tasks, and memory.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Core Web Vitals capture",
      "CPU and long-task profiling",
      "Memory inspection",
      "Per-route performance baselines"
    ]
  },
  {
    "id": "cdn-reverse-proxy",
    "icon": "🌐",
    "name": "CDN / Reverse Proxy Domains",
    "source": "https://docs.lovable.dev/features/custom-domain",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Connect domains routed through Cloudflare, CloudFront, or Fastly.",
    "category": "Publishing",
    "useCases": [
      "Apps behind Cloudflare",
      "Multi-region edge"
    ],
    "description": "Reintroduced support for custom domains routed through your own CDN or reverse proxy, with a CNAME-based config and Lovable-handled SSL once the record is live.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "CNAME-based setup",
      "Auto SSL",
      "Cloudflare/CloudFront/Fastly compatible"
    ]
  },
  {
    "id": "code-execution-generate-files",
    "icon": "",
    "name": "Generate Files and Data Analysis",
    "source": "https://docs.lovable.dev/features/generate-files",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Run Python/Node in chat to analyze data and produce downloadable files.",
    "category": "Workflow",
    "useCases": [
      "Ad-hoc data analysis on uploaded CSVs",
      "Generating one-off reports as PDF"
    ],
    "description": "Generate Files runs scripts in an isolated Linux environment with pandas, matplotlib, and psql preinstalled, returning downloadable outputs (PDF, DOCX, PPTX, XLSX, CSV, MP4, MP3, etc.) without modifying the project's source code. Max 20 MB per file. Cloud database access available when permissions are set to Always allow.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Python and Node code execution",
      "Output PDF, DOCX, PPTX, XLSX, images, MP4, MP3",
      "Query Cloud database from chat"
    ]
  },
  {
    "id": "command-palette",
    "icon": "⌘",
    "name": "Command Palette (⌘K)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Search projects, settings, and Cloud from the keyboard.",
    "category": "Workflow",
    "useCases": [
      "Power-user navigation",
      "Fast project switching"
    ],
    "description": "Redesigned ⌘K palette: search projects, tools, settings, switch workspaces, browse folders, and access Lovable Cloud features without leaving the keyboard.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Project + folder search",
      "Workspace switcher",
      "Cloud actions",
      "Connector access"
    ]
  },
  {
    "id": "confidence-mcp-connector",
    "icon": "",
    "name": "Confidence MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Feature flags and experiment results in the agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Experiment-aware app building"
    ],
    "description": "Confidence MCP connector evaluates feature flags and accesses experiment results for the agent.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Feature flag and experiment context"
    ]
  },
  {
    "id": "custom-app-emails",
    "icon": "",
    "name": "Custom App Emails",
    "source": "https://docs.lovable.dev/features/custom-emails",
    "status": "GA",
    "pricing": "Lovable Cloud (paid)",
    "tagline": "Branded transactional emails — 50K/month included on paid Cloud workspaces.",
    "category": "Cloud",
    "useCases": [
      "Order and shipping notifications",
      "Account event emails"
    ],
    "description": "App emails are transactional emails (order confirmations, shipping updates, account notifications) auto-branded from your app's CSS variables, fonts, and logo. 50,000 emails per month included; $1 per 1,000 above that. Mandatory unsubscribe footer.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Auto-branded templates from app CSS and logo",
      "50K/month included",
      "Suppression lists"
    ]
  },
  {
    "id": "custom-domain",
    "icon": "🌐",
    "name": "Custom Domains + In-App Purchase",
    "source": "https://docs.lovable.dev/features/custom-domain",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Search, buy, and connect domains entirely in-app.",
    "category": "Deploy",
    "useCases": [
      "Launch a marketing site on a fresh domain in 10 minutes",
      "Manage a portfolio of brand domains in one place"
    ],
    "description": "Buy or connect custom domains directly inside Lovable. Stripe-powered checkout, automatic DNS configuration, automatic SSL via Let's Encrypt, optional www. subdomain setup, and workspace-level domain management. Updated May 6, 2026 with multi-domain primary controls.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "In-app domain search + Stripe checkout",
      "Auto DNS + SSL provisioning",
      "Workspace-level domain pool",
      "Set primary / connect multiple domains per project",
      "Auto-renew toggle, transfer between projects"
    ]
  },
  {
    "id": "file-gen",
    "icon": "📄",
    "name": "File Generation & Data Analysis",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Free, Pro, Business",
    "tagline": "Generate PDF, Excel, PPT files directly in chat.",
    "category": "Deploy",
    "useCases": [
      "Hand a client a one-off PDF report",
      "Produce a quick Excel breakdown from a CSV"
    ],
    "description": "Run code and generate downloadable files (PDF, Excel, PPT) inside the chat. Available on Free, Pro, and Business plans.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "PDF, Excel, PPT generation",
      "Inline data analysis on attached datasets",
      "No project source changes"
    ]
  },
  {
    "id": "gitlab-connector",
    "icon": "",
    "name": "GitLab Connector",
    "source": "https://docs.lovable.dev/integrations/gitlab",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Two-way sync with GitLab.com and self-managed GitLab.",
    "category": "App Connectors",
    "useCases": [
      "Teams on GitLab self-managed",
      "Hybrid Lovable + IDE workflows"
    ],
    "description": "GitLab integration supports both GitLab.com and self-managed instances with bidirectional sync on the default branch only. Export-only — existing GitLab repos cannot be imported into Lovable.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "GitLab.com and self-managed support",
      "Default-branch bidirectional sync",
      "Merge requests and reviews"
    ]
  },
  {
    "id": "hex-mcp-connector",
    "icon": "",
    "name": "Hex MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Notebooks and analyses as grounding for app generation.",
    "category": "MCP Connectors",
    "useCases": [
      "Analytics-backed internal tools"
    ],
    "description": "Hex MCP connector uses notebooks and data workflows to build apps grounded in analyses.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Notebook and workflow context"
    ]
  },
  {
    "id": "image-tools",
    "icon": "🔍",
    "name": "Image Tools (Zoom & Crop)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Zoom and crop uploaded images directly in chat.",
    "category": "Agent",
    "useCases": [
      "Pinpoint a UI bug",
      "Reference an icon detail"
    ],
    "description": "The agent can zoom into and crop specific regions of uploaded images so you can reference UI details and guide it with precise visual context.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "In-chat zoom",
      "Crop to region",
      "Pass cropped context to agent"
    ]
  },
  {
    "id": "posthog-mcp-connector",
    "icon": "",
    "name": "PostHog MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "PostHog product analytics inside the Lovable agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Building features informed by usage data"
    ],
    "description": "PostHog MCP connector brings product analytics and user behavior insights into agent context.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Analytics-driven feature suggestions"
    ]
  },
  {
    "id": "project-comments",
    "icon": "💬",
    "name": "Project Comments",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Annotate the preview — @Lovable to trigger the agent.",
    "category": "Editor",
    "useCases": [
      "PM review pass on a staging build",
      "Designer leaves spacing notes for the agent to action"
    ],
    "description": "Leave inline annotations on the project preview. Use @Lovable or 'Send to chat' to convert a comment into an agent task.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Pin comments to elements on the preview",
      "Mention @Lovable to trigger Agent Mode",
      "Collaborator-friendly review flow"
    ]
  },
  {
    "id": "security-center-updates",
    "icon": "✨",
    "name": "Security center updates",
    "source": "https://docs.lovable.dev/changelog#security-updates",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Management tools for stronger security.",
    "category": "Security",
    "useCases": [
      "Review security findings across every project in one place.",
      "Export audit logs for a compliance review.",
      "Restrict which sign-in methods a workspace allows."
    ],
    "description": "New controls and visibility tools help workspace admins enforce stronger security policies and manage identity at scale.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Access security findings across projects",
      "Audit logs improvements",
      "Export audit logs",
      "Control sign-in methods"
    ]
  },
  {
    "id": "workspace-discovery",
    "icon": "",
    "name": "Workspace Discovery (Domain JIT)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Auto-discover workspaces by verified company email domain.",
    "category": "Workspace",
    "useCases": [
      "Self-serve workspace joins at companies"
    ],
    "description": "Workspace Discovery auto-routes users with verified company email domains into the matching workspace. Bulk Domain JIT provisioning shipped April 2026.",
    "releaseDate": "2026-04-02",
    "capabilities": [
      "Domain-verified discovery",
      "Bulk JIT provisioning"
    ]
  },
  {
    "id": "aikido-connector",
    "icon": "✨",
    "name": "Aikido Connector",
    "source": "https://docs.lovable.dev/integrations/aikido",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "AI-driven penetration testing wired into the project Security view.",
    "category": "App Connectors",
    "useCases": [
      "Pre-launch security review",
      "Compliance evidence for audits",
      "Continuous vulnerability tracking"
    ],
    "description": "Aikido runs AI-powered dynamic penetration tests against Lovable apps, surfaces exploitable vulnerabilities, and syncs findings into the project Security view. Available on all plans since June 2026.",
    "releaseDate": "2026-04-01",
    "capabilities": [
      "Run AI penetration tests",
      "Detect exploitable vulnerabilities",
      "Sync findings into Security view",
      "Generate compliance reports",
      "Trigger scans from chat"
    ]
  },
  {
    "id": "generate-files-and-analyze-data",
    "icon": "✨",
    "name": "Generate files and analyze data",
    "source": "https://docs.lovable.dev/features/generate-files",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Run code and generate outputs directly in chat.",
    "category": "Testing",
    "useCases": [
      "Turn a chat request into a downloadable Excel report.",
      "Generate a PDF summary without leaving the chat interface.",
      "Run a quick data transformation and export the result."
    ],
    "description": "Lovable can now run code directly in the chat, generating downloadable files such as PDFs, Excel spreadsheets, and PowerPoint presentations on the fly, improving data analysis.",
    "releaseDate": "2026-04-01",
    "capabilities": [
      "Code execution in chat",
      "File generation",
      "Data transformation",
      "Instant output creation",
      "No need to switch environments",
      "Supports multiple file formats"
    ]
  },
  {
    "id": "lovable-affiliate-program",
    "icon": "",
    "name": "Lovable Affiliate Program",
    "source": "https://lovable.dev/affiliates",
    "status": "GA",
    "pricing": "Free to join",
    "tagline": "Refer Lovable, earn rewards (launching soon).",
    "category": "Community",
    "useCases": [
      "Content creators",
      "Community builders",
      "Newsletter operators"
    ],
    "description": "Referral-based affiliate program for content creators and community members. Interested parties email affiliates@lovable.dev. Not yet fully open — listed as Beta until full launch.",
    "releaseDate": "2026-04-01",
    "capabilities": [
      "Unique referral links",
      "Real-time tracking",
      "Payout on conversion"
    ]
  },
  {
    "id": "slack-available-as-an-app-connector",
    "icon": "✨",
    "name": "Slack available as an app connector",
    "source": "https://docs.lovable.dev/integrations/slack",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Integrate Slack for enhanced communication in your apps.",
    "category": "App Connectors",
    "useCases": [
      "Send a Slack alert when a project event fires.",
      "Read a Slack channel's messages from inside a custom app.",
      "Notify a team in Slack the moment a deploy completes."
    ],
    "description": "Integrate Slack into your applications to send notifications and stay updated with project alerts and communications, improving response times and team collaboration.",
    "releaseDate": "2026-04-01",
    "capabilities": [
      "Send channel updates",
      "Read messages",
      "Structured alerts",
      "Real-time notifications",
      "Easy integration setup",
      "Enhanced team communication"
    ]
  },
  {
    "id": "twenty-first-dev-integration",
    "icon": "✨",
    "name": "21st.dev Integration",
    "source": "https://docs.lovable.dev/tips-tricks/21stdev",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Drop 21st.dev components into a Lovable project from chat.",
    "category": "Editor",
    "useCases": [
      "Rapid landing-page assembly",
      "Marketing site building",
      "Component-driven prototyping"
    ],
    "description": "The 21st.dev integration pulls curated, production-ready React components from 21st.dev into a project, so teams compose polished UIs without hand-building each block.",
    "releaseDate": "2026-04-01",
    "capabilities": [
      "Browse 21st.dev components",
      "Import components into a project",
      "Preview blocks before install",
      "Compose UIs from proven patterns"
    ]
  },
  {
    "id": "beyond-apps",
    "icon": "",
    "name": "Beyond Apps (Data, Docs, Media)",
    "source": "https://lovable.dev/blog/go-beyond-building-full-stack-apps-with-lovable",
    "status": "GA",
    "pricing": "Included with paid plans",
    "tagline": "Lovable now runs data analysis, generates docs, and creates media — not just apps.",
    "category": "Workflow",
    "useCases": [
      "Marketing reports",
      "Investor decks",
      "Changelogs",
      "Invoices",
      "Data dashboards from CSVs"
    ],
    "description": "Lovable expanded past app building to handle data analysis (CSV, PDF, Amplitude metrics), document generation (PowerPoint, Word, PDF, Excel reports, investor decks, invoices), file editing across formats, and text-to-image/video media generation. The agent runs code and executes scripts in a secure sandbox to process files inline with app-building.",
    "releaseDate": "2026-03-19",
    "capabilities": [
      "CSV/PDF data analysis",
      "PowerPoint/Word/Excel/PDF generation",
      "Image generation",
      "Video generation",
      "Inline code execution in sandbox"
    ]
  },
  {
    "id": "app-connectors",
    "icon": "✨",
    "name": "App connectors",
    "source": "https://docs.lovable.dev/integrations/introduction",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Integrate with essential services for optimized workflows.",
    "category": "App Connectors",
    "useCases": [
      "Pull Airtable data into an app without custom API code.",
      "Send marketing emails through Brevo from inside the app.",
      "Fetch Google Search Console data for an SEO dashboard."
    ],
    "description": "The latest app connectors allow Lovable apps to connect with multiple platforms, enhancing content management, communication and workflow automation.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Connect with Airtable",
      "Work with customer conversation data",
      "Manage marketing emails via Brevo",
      "Fetch data from Google Search Console",
      "Work with AI-generated meeting insights",
      "Integrate with email delivery systems"
    ]
  },
  {
    "id": "audit-logs",
    "icon": "",
    "name": "Audit Logs",
    "source": "https://docs.lovable.dev/features/audit-logs",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Searchable record of workspace actions, retained ~90 days.",
    "category": "Security",
    "useCases": [
      "Compliance audits",
      "Investigating anomalies"
    ],
    "description": "Audit Logs track membership, workspace management, groups, identity and access, secrets and integrations, projects, and authentication events. Retained ~13 weeks. Export to JSONL added April 2026 for Enterprise.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Track membership, identity, integrations, projects, auth",
      "~90 day retention",
      "JSONL export"
    ]
  },
  {
    "id": "auth-emails",
    "icon": "🔐",
    "name": "Authentication Emails",
    "source": "https://docs.lovable.dev/features/custom-emails",
    "status": "GA",
    "pricing": "Paid plans (Cloud)",
    "tagline": "Send signup, magic link, and reset emails from your domain.",
    "category": "Cloud",
    "useCases": [
      "Brand-consistent login",
      "Improved deliverability"
    ],
    "description": "Send authentication emails from your own domain instead of the default Cloud sender. Lovable manages DNS, SPF, DKIM, and DMARC automatically. Covers signup confirmations, password resets, magic links, invitations, email-change confirmations, and reauthentication.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Auto DNS/SPF/DKIM/DMARC",
      "Custom branding",
      "Magic links + OTP",
      "All auth flows"
    ]
  },
  {
    "id": "authentication-emails-custom-domain",
    "icon": "",
    "name": "Authentication Emails from Custom Domain",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Lovable Cloud (paid)",
    "tagline": "Send auth emails from your domain with auto-managed DNS.",
    "category": "Cloud",
    "useCases": [
      "Deliverability for transactional auth",
      "Brand-consistent magic-link emails"
    ],
    "description": "Authentication emails (password reset, email verification) ship from your custom domain with automatic DNS management. Email rate-limit configuration controls send velocity.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Auth emails from custom domain",
      "Automatic DNS management",
      "Rate-limit configuration"
    ]
  },
  {
    "id": "build-with-url",
    "icon": "🔗",
    "name": "Lovable API: Build with URL",
    "source": "https://docs.lovable.dev/integrations/build-with-url",
    "status": "Beta",
    "pricing": "All plans",
    "tagline": "Kick off a Lovable build from a URL with prefilled context.",
    "category": "Agent",
    "useCases": [
      "Branded 'Build in Lovable' buttons",
      "Curated template launchers"
    ],
    "description": "A URL-based API that lets external apps and tools deep-link into Lovable with a prompt, repo, or attached context preloaded — useful for templates, partner integrations, and link-based onboarding.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Prefilled prompt + parameters",
      "Lovable Link Generator helper",
      "Optional auth flow handoff"
    ]
  },
  {
    "id": "bulk-member-mgmt",
    "icon": "👥",
    "name": "Bulk Member Management",
    "source": "https://docs.lovable.dev/features/workspace",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Select-mode for editing many members at once.",
    "category": "Workspace",
    "useCases": [
      "Quarterly access reviews",
      "Large workspace cleanups"
    ],
    "description": "Workspace admins and owners can change roles, set credit limits, remove users, or revoke invitations for many members in a single action.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Select mode",
      "Bulk role change",
      "Bulk credit limits"
    ]
  },
  {
    "id": "contentful-connector",
    "icon": "",
    "name": "Contentful Connector",
    "source": "https://docs.lovable.dev/integrations/contentful",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Fetch and manage Contentful CMS content.",
    "category": "App Connectors",
    "useCases": [
      "Marketing sites backed by Contentful"
    ],
    "description": "Contentful connector fetches and manages content from Contentful CMS for content-driven apps.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Fetch published content",
      "Manage entries"
    ]
  },
  {
    "id": "gemini-3-1-pro",
    "icon": "",
    "name": "Gemini 3.1 Pro",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Latest Google Gemini 3.1 Pro tier in Lovable AI.",
    "category": "AI Models",
    "useCases": [
      "High-quality Google-model generations"
    ],
    "description": "Gemini 3.1 Pro is listed as a selectable model in the Lovable AI integration.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Selectable in Lovable AI"
    ]
  },
  {
    "id": "linear-app-connector",
    "icon": "",
    "name": "Linear App Connector",
    "source": "https://docs.lovable.dev/integrations/linear",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Work with Linear issues from your app — distinct from the Linear MCP.",
    "category": "App Connectors",
    "useCases": [
      "Customer-feedback-to-issue flows"
    ],
    "description": "Linear app connector lets apps create and update Linear issues. Separate from the Linear MCP chat connector which feeds issues into the agent.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Create and update issues",
      "Read issue data"
    ]
  },
  {
    "id": "nano-banana-2",
    "icon": "🍌",
    "name": "Nano Banana 2 (Image Gen)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Gemini 3.1 Flash Image — fast, transparent backgrounds, real in-image text.",
    "category": "AI Models",
    "useCases": [
      "Logos and badges with real text",
      "Asset generation for landing pages"
    ],
    "description": "Google's Gemini 3.1 Flash Image model with transparent backgrounds and accurate in-image text rendering.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Transparent background output",
      "Accurate text rendering inside images",
      "Fast turnaround"
    ]
  },
  {
    "id": "polar-mcp-connector",
    "icon": "",
    "name": "Polar MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Billing, products, and subscription data for SaaS scaffolding.",
    "category": "MCP Connectors",
    "useCases": [
      "SaaS scaffolding grounded in real plans"
    ],
    "description": "Polar MCP connector uses billing, products, and subscription data to scaffold SaaS apps.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Billing and subscription data access"
    ]
  },
  {
    "id": "sanity-mcp-connector",
    "icon": "",
    "name": "Sanity MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Access Sanity CMS content and schemas.",
    "category": "MCP Connectors",
    "useCases": [
      "Headless-CMS-driven sites"
    ],
    "description": "Sanity MCP connector accesses CMS content and structured schemas to drive content-aware prototypes.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "CMS content and schema access"
    ]
  },
  {
    "id": "storyblok-connector",
    "icon": "📚",
    "name": "Storyblok CMS",
    "source": "https://docs.lovable.dev/integrations/storyblok",
    "status": "GA",
    "pricing": "Connector",
    "tagline": "Headless CMS via Storyblok Content Delivery API.",
    "category": "Integrations",
    "useCases": [
      "Marketing site CMS",
      "Catalog content",
      "Docs"
    ],
    "description": "Connect a Storyblok space to fetch published stories, drafts, and assets through the gateway. Great for landing pages, blogs, product catalogs, and docs powered by your CMS.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Stories + drafts",
      "Pagination + filters",
      "Auto-handled tokens via gateway"
    ]
  },
  {
    "id": "telegram-connector",
    "icon": "",
    "name": "Telegram App Connector",
    "source": "https://docs.lovable.dev/integrations/telegram",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send messages and receive commands through Telegram bots.",
    "category": "App Connectors",
    "useCases": [
      "Customer-facing Telegram bots"
    ],
    "description": "Telegram app connector lets apps send messages and receive commands through Telegram bots — distinct from the standalone Lovable Telegram Bot for building projects.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Send messages",
      "Receive bot commands"
    ]
  },
  {
    "id": "twilio-connector",
    "icon": "",
    "name": "Twilio Connector",
    "source": "https://docs.lovable.dev/integrations/twilio",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send SMS, MMS, and make voice calls via Twilio.",
    "category": "App Connectors",
    "useCases": [
      "2FA codes",
      "Appointment reminders"
    ],
    "description": "Twilio connector enables SMS, MMS, and voice calls from Lovable apps.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "SMS and MMS sending",
      "Voice calls"
    ]
  },
  {
    "id": "twitch-connector",
    "icon": "",
    "name": "Twitch Connector",
    "source": "https://docs.lovable.dev/integrations/twitch",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Interact with Twitch streams from your app.",
    "category": "App Connectors",
    "useCases": [
      "Streamer-facing dashboards"
    ],
    "description": "Twitch connector lets apps interact with Twitch streams, chat, and metadata.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Stream and chat interactions"
    ]
  },
  {
    "id": "workspace-invite-links",
    "icon": "🔗",
    "name": "Workspace Invite Links",
    "source": "https://docs.lovable.dev/features/workspace",
    "status": "GA",
    "pricing": "Free / Pro / Business",
    "tagline": "Share role-based, time-limited invite links.",
    "category": "Workspace",
    "useCases": [
      "Onboard a class or cohort",
      "Bulk team invites"
    ],
    "description": "Editors and above can invite people via shareable role-based links instead of typing emails. Links expire after 5 days; one active link per role at a time.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Role-based links",
      "5-day expiry",
      "Regenerate / disable"
    ]
  },
  {
    "id": "workspace-knowledge",
    "icon": "📚",
    "name": "Workspace Knowledge",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Define shared coding standards once for every project.",
    "category": "Workspace",
    "useCases": [
      "Enforce a house design system across an agency",
      "Codify accessibility standards once"
    ],
    "description": "Set workspace-level rules, standards, and reference docs the agent applies across every project in the workspace.",
    "releaseDate": "2026-03-16",
    "capabilities": [
      "Workspace-scoped rule book",
      "Applies to every project automatically",
      "Pair with Knowledge Connectors (Fireflies, Gemini Enterprise, WordPress)"
    ]
  },
  {
    "id": "branded-email-domain",
    "icon": "✉️",
    "name": "Branded Emails from Your Domain",
    "source": "https://lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send branded emails from your own domain.",
    "category": "Email",
    "useCases": [
      "Authentication emails from your own domain",
      "Branded transactional notifications",
      "Marketing-grade sender reputation"
    ],
    "description": "Connect a custom domain to Lovable and send transactional and auth emails from your own address. Every email builds trust by arriving from your brand instead of a generic Lovable sender.",
    "releaseDate": "2026-03-12",
    "capabilities": [
      "Connect a custom email domain",
      "Branded transactional and auth emails",
      "Custom from-address per project",
      "Domain verification flow"
    ]
  },
  {
    "id": "beyond-building-apps",
    "icon": "📊",
    "name": "Beyond Building Apps",
    "source": "https://lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Analyze data, create files, and turn spreadsheets into working apps.",
    "category": "Productivity",
    "useCases": [
      "Turn a CSV into a working dashboard",
      "Generate reports and PDFs from chat",
      "Quick data exploration without scaffolding a UI"
    ],
    "description": "Lovable now goes beyond building apps. Analyze data, generate docs, create files, and turn spreadsheets into functional apps — all without leaving the chat.",
    "releaseDate": "2026-03-05",
    "capabilities": [
      "Data analysis in chat",
      "File and document generation",
      "Spreadsheet-to-app conversion",
      "One-off scripts and exports"
    ]
  },
  {
    "id": "amplitude-mcp-connector",
    "icon": "",
    "name": "Amplitude MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Product analytics and user feedback into the agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Data-informed feature planning"
    ],
    "description": "Amplitude MCP connector brings product analytics and user feedback into the agent to inform feature decisions.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Analytics-grounded suggestions"
    ]
  },
  {
    "id": "claude-opus-4-6",
    "icon": "",
    "name": "Claude Opus 4.6",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Anthropic Opus 4.6 model option in Lovable.",
    "category": "AI Models",
    "useCases": [
      "High-quality code edits"
    ],
    "description": "Opus 4.6 was added as a model option in the Feb 23 2026 release. Routed through Lovable's agent for complex code generation.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Selectable in agent and chat"
    ]
  },
  {
    "id": "cloud-region-selection",
    "icon": "",
    "name": "Cloud Region Selection",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "Pick Americas, Europe, or Asia Pacific hosting region for Cloud projects.",
    "category": "Cloud",
    "useCases": [
      "EU data residency requirements",
      "Latency optimization"
    ],
    "description": "Cloud Region Selection lets workspace admins pick the hosting region (Americas, Europe, or Asia Pacific) for a Cloud project. Region defaults to user location.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Three regions: Americas, Europe, Asia Pacific",
      "Automatic default by user location"
    ]
  },
  {
    "id": "cross-project-ref",
    "icon": "🔗",
    "name": "Cross-Project Referencing",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Reuse implementations from other projects via @ mentions.",
    "category": "Editor",
    "useCases": [
      "Carry a design system across multiple client builds",
      "Clone an auth flow you already perfected"
    ],
    "description": "Reference and reuse components, schemas, or patterns from your other Lovable projects using @ mentions. The agent fetches the referenced context to inform the build.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "@-mention any project in your workspace",
      "Reuse components, schemas, and config",
      "Inherits design system across a portfolio"
    ]
  },
  {
    "id": "granola-mcp-connector",
    "icon": "",
    "name": "Granola MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Turn Granola meeting notes into specs for the agent.",
    "category": "MCP Connectors",
    "useCases": [
      "From a discovery call to a prototype"
    ],
    "description": "Granola MCP connector turns meeting notes, decisions, and action items into specs the agent can use.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Meeting notes as spec input"
    ]
  },
  {
    "id": "mcp-connectors",
    "icon": "🔌",
    "name": "MCP Chat Connectors",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans (custom MCP)",
    "tagline": "Custom MCP servers + Hex, PostHog, Sentry, Sanity, Granola, Amplitude, Polar, Confidence, Fireflies, Gemini Enterprise, WordPress.",
    "category": "MCP Connectors",
    "useCases": [
      "Pull live Sentry errors into a debugging session",
      "Reference PostHog analytics while building",
      "Surface meeting notes from Fireflies/Granola"
    ],
    "description": "Lovable supports Model Context Protocol chat connectors that bring external tools into the agent's context. Custom MCP servers are available on all paid plans (previously Business/Enterprise only).",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Custom MCP on all paid plans",
      "First-party MCPs: Hex, Confidence, PostHog, Sentry, Sanity, Polar, Granola, Amplitude, Fireflies, Gemini Enterprise, WordPress",
      "Chat-side context, no code changes required"
    ]
  },
  {
    "id": "project-ownership-transfer",
    "icon": "",
    "name": "Project Ownership Transfer",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Transfer projects between workspaces with editor permissions.",
    "category": "Workspace",
    "useCases": [
      "Moving a freelance project to a client workspace"
    ],
    "description": "Project Ownership Transfer moves a project between workspaces. Editors can transfer projects, with name choice and dropdown access from project cards.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Cross-workspace transfer",
      "Editor-permitted transfer"
    ]
  },
  {
    "id": "publishing-flow",
    "icon": "🚀",
    "name": "Guided Publishing Flow",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Multi-step publish with auto favicon and SEO.",
    "category": "Deploy",
    "useCases": [
      "Launch-ready SEO without manual config",
      "Polished social previews out of the box"
    ],
    "description": "Guided multi-step publishing flow: automatic favicon cropping/conversion, reliable published-app links, and auto-generated SEO descriptions used for search results and link previews (Apr 2026).",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Auto favicon crop + format conversion",
      "Auto SEO description generation",
      "Reliable production URLs"
    ]
  },
  {
    "id": "scim-provisioning",
    "icon": "",
    "name": "SCIM Provisioning",
    "source": "https://docs.lovable.dev/features/business/scim",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Automated user provisioning and lifecycle via Okta or Entra ID.",
    "category": "Security",
    "useCases": [
      "Lifecycle automation for large orgs",
      "Group-driven access control"
    ],
    "description": "SCIM 2.0 provisioning automates user creation, role assignment, and deprovisioning through Okta, Microsoft Entra ID, or any compliant provider. Highest-privilege role wins when groups overlap. Requires active SSO.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "SCIM 2.0 with Okta, Entra ID",
      "Auto-provision and deprovision",
      "Group-based role mapping",
      "Activity overview"
    ]
  },
  {
    "id": "slack-app-connector",
    "icon": "",
    "name": "Slack App Connector",
    "source": "https://docs.lovable.dev/integrations/slack",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Send alerts, read channels, and post updates to Slack.",
    "category": "App Connectors",
    "useCases": [
      "App notifications to internal channels",
      "Slack-based ops dashboards"
    ],
    "description": "Slack app connector lets Lovable apps send alerts, read channels, and post updates — distinct from the Slack MCP chat connector.",
    "releaseDate": "2026-02-23",
    "capabilities": [
      "Send messages and alerts",
      "Read channel content"
    ]
  },
  {
    "id": "autonomous-complex-builds",
    "icon": "🛠️",
    "name": "Autonomous Complex Builds",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Multi-step builds handled end-to-end without hand-holding.",
    "category": "Agent",
    "useCases": [
      "Ship a full feature from a single prompt",
      "Run multi-table schema changes safely"
    ],
    "description": "The agent now plans, executes, and verifies multi-step builds autonomously — chaining edits, migrations, and integrations across the codebase before reporting back.",
    "releaseDate": "2026-02-15",
    "capabilities": [
      "Long-horizon task planning",
      "Cross-file edits and migrations",
      "Self-verification before completion",
      "Mid-build error recovery"
    ]
  },
  {
    "id": "browser-testing",
    "icon": "🧪",
    "name": "Browser Testing",
    "source": "https://docs.lovable.dev/features/browser-testing",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Real-browser interaction with screenshots and network logs.",
    "category": "Testing",
    "useCases": [
      "Verify a checkout flow after a refactor",
      "Confirm auth still works for a logged-in user",
      "Catch a mobile-only regression"
    ],
    "description": "Browser Testing runs your app in a real, remote browser in a virtual environment. The agent can click buttons, fill forms, navigate pages, capture screenshots, read console + network logs, and detect runtime errors — at desktop, tablet, and mobile sizes.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Real-browser clicks, inputs, navigation",
      "Screenshot capture and visual diffs",
      "Console + network log reads",
      "Runtime error detection",
      "Desktop / tablet / mobile viewports",
      "Runs against the project preview you're viewing"
    ]
  },
  {
    "id": "cloud-auth-apple",
    "icon": "",
    "name": "Cloud Apple Authentication",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "Apple Sign-In for Cloud apps.",
    "category": "Cloud",
    "useCases": [
      "iOS-facing app login"
    ],
    "description": "Apple Sign-In was added alongside Google authentication in the Feb 5, 2026 release as a seamless social login option for Cloud apps.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Apple OAuth sign-in"
    ]
  },
  {
    "id": "cloud-auth-google",
    "icon": "",
    "name": "Cloud Google Authentication",
    "source": "https://docs.lovable.dev/features/google-auth",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "OAuth 2.0 Google sign-in — managed by Lovable or BYO credentials.",
    "category": "Cloud",
    "useCases": [
      "Frictionless social login",
      "Enterprise consent-screen branding"
    ],
    "description": "Google OAuth sign-in for Cloud apps. Default 'Managed by Lovable' mode requires no Google Cloud setup; an advanced mode lets developers bring their own OAuth credentials with custom consent branding and scopes.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Lovable-managed OAuth (zero config)",
      "Self-managed credentials option",
      "Custom scopes in self-managed mode"
    ]
  },
  {
    "id": "custom-mcp-servers",
    "icon": "",
    "name": "Custom MCP Servers",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Bring your own MCP server — internal or third-party systems.",
    "category": "MCP Connectors",
    "useCases": [
      "Internal APIs available to the agent",
      "Vendor-specific tools"
    ],
    "description": "Custom MCP Servers let paid-plan workspaces add their own MCP servers to connect internal or third-party systems to the agent.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "BYO MCP server",
      "Unauthenticated MCP support",
      "Tool permission controls"
    ]
  },
  {
    "id": "design-templates",
    "icon": "",
    "name": "Design Templates",
    "source": "https://docs.lovable.dev/features/business/design-templates",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Reusable project blueprints workspace-wide.",
    "category": "Editor",
    "useCases": [
      "Brand-consistent app starts",
      "Internal architectural baselines"
    ],
    "description": "Design Templates copy an entire project codebase as the foundation for new projects in the same workspace. Workspace admins can set one default template. Requires public or workspace project visibility.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Full codebase copy as starting point",
      "Default template per workspace"
    ]
  },
  {
    "id": "linkedin-vibe",
    "icon": "💼",
    "name": "LinkedIn Vibe Coding Badge",
    "source": "https://docs.lovable.dev/tips-tricks/linkedin-certification",
    "status": "Removed",
    "pricing": "All plans",
    "tagline": "L1–L5 vibe coding levels for your LinkedIn profile.",
    "category": "Community",
    "useCases": [
      "Signal builder credibility on LinkedIn",
      "Recruiter discovery of vibe coders"
    ],
    "description": "Beta feature: vibe coding levels (L1 through L5) that can be added to your LinkedIn profile as a verified Lovable skill marker. NOTE: LinkedIn discontinued support for the Vibe Coding Badge; Lovable replaced it with LinkedIn Skills (June 17, 2026).",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "L1–L5 progression",
      "LinkedIn profile badge",
      "Verified by Lovable activity"
    ]
  },
  {
    "id": "linkedin-vibe-coding-levels",
    "icon": "",
    "name": "LinkedIn Vibe Coding Levels",
    "source": "https://docs.lovable.dev/tips-tricks/linkedin-certification",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Bronze through Diamond certification tracked from real building.",
    "category": "Community",
    "useCases": [
      "Public credentials for builders",
      "Hiring signals"
    ],
    "description": "Five vibe-coding tiers (Bronze, Silver, Gold, Platinum, Diamond) tracked automatically by activity and surfaced on LinkedIn under Licenses & Certifications. Non-expiring, real-time, opt-in to display.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Five tiers (Bronze, Silver, Gold, Platinum, Diamond)",
      "Activity-based progression",
      "Non-expiring"
    ]
  },
  {
    "id": "plan-mode",
    "icon": "🗺️",
    "name": "Plan Mode",
    "source": "https://docs.lovable.dev/features/plan-mode",
    "status": "GA",
    "pricing": "1 credit per message",
    "tagline": "Brainstorm and design before any code is written.",
    "category": "Agent",
    "useCases": [
      "Scope a new feature before spending build credits",
      "Investigate a tricky bug and decide on a fix",
      "Architect a database schema with the agent as a thought partner"
    ],
    "description": "Plan Mode is Lovable's planning and reasoning mode. It reasons across multiple steps, inspects files/logs/context, and proposes a formal plan you can inspect, edit, and approve. Plan Mode never modifies code — the latest approved plan is saved to .lovable/plan.md and earlier plans remain in chat history.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Multi-step reasoning across files and logs",
      "Clarifying questions before proposing changes",
      "Editable, markdown-rendered plans",
      "Approve to hand off to Agent Mode",
      "Plans persisted to .lovable/plan.md"
    ]
  },
  {
    "id": "prompt-queue",
    "icon": "📥",
    "name": "Prompt Queue",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Queue, reorder, and repeat prompts while the agent works.",
    "category": "Agent",
    "useCases": [
      "Batch a series of UI tweaks while the agent is in a long build",
      "Generate 20 variations of a marketing component",
      "Walk away — return to a completed multi-step sprint"
    ],
    "description": "Queue prompts while Lovable is mid-task. The agent processes one at a time, and you can pause, resume, reorder, edit, or repeat a prompt up to 50× — useful for batching small follow-ups or chaining smart suggestions.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "One-at-a-time sequential execution",
      "Reorder, edit, pause, or resume queued prompts",
      "Repeat a prompt up to 50× (great for fanned-out generation)",
      "Queue smart suggestions automatically surfaced by Lovable"
    ]
  },
  {
    "id": "smarter-agent",
    "icon": "⏱️",
    "name": "Smarter Agent (15-min sessions)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Processing extended to 15 minutes per request.",
    "category": "Agent",
    "useCases": [
      "Long browser-testing flows that span many pages",
      "Big refactors that span dozens of files",
      "Generate a promo video as part of a build"
    ],
    "description": "The Lovable agent's per-request processing time was extended to 15 minutes, supporting longer browser-testing sessions and more complex, multi-file tasks. The agent can also generate videos, suggest publishing, clean up unused edge functions, and understand TypeScript projects at IDE level.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Up to 15-minute single-request runs",
      "Video generation in-thread",
      "Edge-function hygiene (cleans up unused functions)",
      "IDE-level TypeScript awareness"
    ]
  },
  {
    "id": "test-and-live-environments",
    "icon": "",
    "name": "Test and Live Environments",
    "source": "https://docs.lovable.dev/features/environments",
    "status": "Removed",
    "pricing": "Lovable Cloud only",
    "tagline": "Separate dev and production Cloud environments — removed 2026-03-24.",
    "category": "Cloud",
    "useCases": [
      "Staging schema changes before production",
      "Testing without touching live data"
    ],
    "description": "Test and Live Environments provided isolated dev and prod databases inside Lovable Cloud with one-way data copies and automatic backups before each publish. Discontinued for new projects as of March 24, 2026; existing Cloud projects retained access but cannot re-enable once removed.",
    "releaseDate": "2026-02-05",
    "capabilities": [
      "Isolated test and live databases",
      "Automatic Live backups before publish",
      "Safe schema migrations"
    ]
  },
  {
    "id": "prompt-queuing",
    "icon": "",
    "name": "Prompt Queuing",
    "source": "https://lovable.dev/blog/a-smarter-lovable",
    "status": "GA",
    "pricing": "All paid plans",
    "tagline": "Stack tasks in the background and reprioritize on the fly.",
    "category": "Workflow",
    "useCases": [
      "Long build sessions",
      "Background QA + fixes",
      "Working async with the agent"
    ],
    "description": "Prompt queuing lets users stack multiple tasks for the agent to execute sequentially in the background. Queued prompts can be reordered or reprioritized while the agent works, enabling fire-and-forget batching of changes rather than waiting between each turn.",
    "releaseDate": "2026-01-28",
    "capabilities": [
      "Background task execution",
      "Live reprioritization",
      "Stacked multi-step builds"
    ]
  },
  {
    "id": "build-credits-topup",
    "icon": "💰",
    "name": "Build Credit Top-ups",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Pro / Business",
    "tagline": "Buy 50-credit packs, valid 12 months.",
    "category": "Community",
    "useCases": [
      "Burst capacity for a launch sprint"
    ],
    "description": "Top up Pro and Business plans in 50-credit increments. Credits valid for 12 months.",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "50-credit packs",
      "12-month validity"
    ]
  },
  {
    "id": "dependency-vulnerability-scanning",
    "icon": "",
    "name": "Dependency Vulnerability Scanning",
    "source": "https://docs.lovable.dev/features/security-center",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Auto-detect npm dependency vulnerabilities by severity.",
    "category": "Security",
    "useCases": [
      "Pre-launch dependency hygiene"
    ],
    "description": "Automatic supply-chain scanning ranks dependency vulnerabilities by severity (critical, high, medium), shows which packages are affected, and surfaces available fixes.",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "Severity ranking",
      "Affected-package visibility",
      "Fix suggestions"
    ]
  },
  {
    "id": "gemini-3-flash",
    "icon": "",
    "name": "Gemini 3 Flash",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Default Lovable AI model — Gemini 3 Flash.",
    "category": "AI Models",
    "useCases": [
      "AI features inside published apps"
    ],
    "description": "Google Gemini 3 Flash added and set as the default model. Pair with Nano Banana 2 (Gemini 3.1 Flash Image) for fast image generation (Mar 2026).",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "Default Lovable AI model",
      "Free tier compatible"
    ]
  },
  {
    "id": "gpt-5-2",
    "icon": "",
    "name": "GPT-5.2",
    "source": "https://docs.lovable.dev/integrations/ai",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "OpenAI GPT-5.2 support in Lovable.",
    "category": "AI Models",
    "useCases": [
      "OpenAI-optimized prompts"
    ],
    "description": "GPT-5.2 became available as a selectable model on Jan 16, 2026 alongside Gemini 3 Flash. Accessible via Lovable AI usage-based pricing.",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "Selectable in chat and agent"
    ]
  },
  {
    "id": "security-center",
    "icon": "",
    "name": "Security Center",
    "source": "https://docs.lovable.dev/features/security-center",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Workspace-wide dashboard for code scans, dependencies, secrets, auth policy.",
    "category": "Security",
    "useCases": [
      "Workspace-wide security posture",
      "Compliance reporting"
    ],
    "description": "Security Center unifies four scan domains (code, supply chain, secrets, authentication policy) across all workspace projects. Includes CSV export, scan timestamps, and filtering by severity/status/project visibility. Auto-runs scans before publishing.",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "Code, dependency, secrets, auth-policy scanning",
      "CSV export",
      "Pre-publish gating on critical findings"
    ]
  },
  {
    "id": "two-factor-authentication",
    "icon": "",
    "name": "Two-Factor Authentication (2FA)",
    "source": "https://docs.lovable.dev/introduction/two-factor-authentication-2-fa",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Authenticator app or SMS 2FA on every Lovable account.",
    "category": "Security",
    "useCases": [
      "Account hardening",
      "Shared workspace protection"
    ],
    "description": "Two-factor authentication via TOTP authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password) or SMS. Works across all sign-in methods (email, Google, GitHub, Apple, SSO). Multi-method recommended to prevent lockout.",
    "releaseDate": "2026-01-16",
    "capabilities": [
      "TOTP authenticator app",
      "SMS codes",
      "Multi-method enrollment"
    ]
  },
  {
    "id": "claude-code-mcp",
    "icon": "✦",
    "name": "Lovable MCP for Claude Code",
    "source": "https://docs.lovable.dev/integrations/lovable-mcp-server#claude-code",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Use Lovable as an MCP server inside Claude Code so the agent can build, edit, and deploy your projects directly.",
    "category": "MCP Connectors",
    "useCases": [
      "Have Claude Code orchestrate a Lovable build from your local repo",
      "Wire Lovable into a multi-agent IDE workflow",
      "Trigger Lovable deploys from a CLI agent"
    ],
    "description": "The Lovable MCP server lets external AI agents — including Claude Code, Cursor, and any MCP-compatible client — call Lovable as a tool. Configure it once with your Lovable API key, then have the agent create or modify Lovable projects, run tasks, and ship deploys from the same conversation where it edits your local code.",
    "releaseDate": "2026-01-15",
    "capabilities": [
      "Run Lovable as an MCP server inside Claude Code",
      "Bidirectional context between Claude Code and Lovable",
      "Authenticated with a per-user Lovable API key",
      "Compatible with any MCP-spec client (Cursor, Windsurf, OpenAI Agents)"
    ]
  },
  {
    "id": "lovable-bonuses",
    "icon": "🎁",
    "name": "Lovable Bonuses (Credits)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Earn credits — daily messaging, custom domains, invites.",
    "category": "Community",
    "useCases": [
      "Stretch credits while learning",
      "Onboarding incentive for new workspaces"
    ],
    "description": "Earn extra credits: send 25 daily messages for 5 credits, plus one-time 5-credit bonuses for adding a custom domain or inviting a collaborator (new users since Jan 15, 2026).",
    "releaseDate": "2026-01-15",
    "capabilities": [
      "Daily 5-credit bonus (25 messages)",
      "5-credit custom domain bonus",
      "5-credit collaborator invite bonus"
    ]
  },
  {
    "id": "lovable-telegram-bot",
    "icon": "",
    "name": "Lovable Telegram Bot",
    "source": "https://docs.lovable.dev/tips-tricks/lovable-telegram-bot",
    "status": "GA",
    "pricing": "Free and Pro workspaces",
    "tagline": "Build and manage Lovable projects from Telegram DMs.",
    "category": "Integrations",
    "useCases": [
      "Mobile-first iteration",
      "Off-laptop bug fixes"
    ],
    "description": "The Lovable Telegram Bot lets users build, modify, fix, publish, and analyze projects via natural-language Telegram DMs. Read-only DB access, no group chats, one Telegram account per Lovable user. Available on Free and Pro workspaces.",
    "releaseDate": "2026-01-01",
    "capabilities": [
      "Build, modify, publish from DMs",
      "Read-only DB queries",
      "Cross-project search",
      "Web search"
    ]
  },
  {
    "id": "elevenlabs-connector",
    "icon": "",
    "name": "ElevenLabs Connector",
    "source": "https://docs.lovable.dev/integrations/eleven-labs",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Audio generation and text-to-speech via ElevenLabs.",
    "category": "App Connectors",
    "useCases": [
      "Voice features in apps",
      "Audio narration"
    ],
    "description": "ElevenLabs app connector adds audio generation and TTS to Lovable apps. ElevenLabs Scribe V2 transcription added Jan 2026.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Text-to-speech generation",
      "Audio generation",
      "Scribe V2 transcription"
    ]
  },
  {
    "id": "file-references-at-mentions",
    "icon": "",
    "name": "File References (@ Mentions)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Mention code files directly in chat with @ to scope agent context.",
    "category": "Editor",
    "useCases": [
      "Refactoring a single component",
      "Asking targeted questions about one file"
    ],
    "description": "Typing @ in chat lets users pick specific code files to reference, scoping the agent's reads and edits to the chosen files rather than the whole project.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "@-mention any file in the project",
      "Scope agent reads to selected files"
    ]
  },
  {
    "id": "firecrawl-connector",
    "icon": "",
    "name": "Firecrawl Connector",
    "source": "https://docs.lovable.dev/integrations/firecrawl",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Scrape, crawl, and extract website content via Firecrawl.",
    "category": "App Connectors",
    "useCases": [
      "Data ingestion for analytics",
      "Content extraction pipelines"
    ],
    "description": "Firecrawl scrapes, crawls, and extracts website content. Used to feed web data into Lovable apps and AI features.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Website scraping",
      "Crawling and extraction"
    ]
  },
  {
    "id": "gift-cards",
    "icon": "",
    "name": "Lovable Gift Cards",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Gift Lovable credits or subscriptions.",
    "category": "Workflow",
    "useCases": [
      "Gifting builds to friends",
      "Education incentives"
    ],
    "description": "Lovable Gift Cards let users gift credits or subscriptions to other Lovable users.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Gift credits or subscriptions"
    ]
  },
  {
    "id": "ionos-domain-discovery",
    "icon": "",
    "name": "Verified Domain Workspace Discovery",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Verified domains help users find their workspace at signup.",
    "category": "Workspace",
    "useCases": [
      "Self-serve company joins"
    ],
    "description": "Verified domain workspace discovery routes signups from a company email domain into the matching workspace.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Email-domain-based workspace routing"
    ]
  },
  {
    "id": "lovable-chatgpt-app",
    "icon": "",
    "name": "Lovable ChatGPT App",
    "source": "https://docs.lovable.dev/tips-tricks/chatgpt-app",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Tag @Lovable in ChatGPT to turn brainstorms into full-stack apps.",
    "category": "Integrations",
    "useCases": [
      "Idea-to-prototype in one tool",
      "Non-coder app starts"
    ],
    "description": "The Lovable ChatGPT App lets users tag @Lovable inside ChatGPT to convert conversations into Lovable projects. Initial build happens in ChatGPT; iteration moves to Lovable. Credits only charge when the build kicks off.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Tag @Lovable in ChatGPT",
      "Build from conversation context",
      "Account connection flow"
    ]
  },
  {
    "id": "perplexity-connector",
    "icon": "",
    "name": "Perplexity Connector",
    "source": "https://docs.lovable.dev/integrations/perplexity",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Web-backed AI research and Q&A via Perplexity.",
    "category": "App Connectors",
    "useCases": [
      "Research assistants in apps",
      "Up-to-date data lookups"
    ],
    "description": "Perplexity connector answers questions and runs web-backed research from inside Lovable apps.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Web-backed Q&A",
      "Research with citations"
    ]
  },
  {
    "id": "tasks-agent-transparency",
    "icon": "",
    "name": "Tasks (Agent Transparency)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Live task list showing what the agent is doing during a run.",
    "category": "Agent",
    "useCases": [
      "Following along during long autonomous runs",
      "Debugging where an agent got stuck"
    ],
    "description": "Tasks surfaces the agent's working plan as a live, structured list so users can watch which step the agent is on and what is queued. Improves transparency during multi-step generations.",
    "releaseDate": "2025-12-23",
    "capabilities": [
      "Live task list rendered during agent runs",
      "Visibility into multi-step plans"
    ]
  },
  {
    "id": "chat-mode-clarifying-questions",
    "icon": "❓",
    "name": "Plan Before You Build — Chat Mode Questions",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "1 credit per message",
    "tagline": "Chat Mode now asks clarifying questions to reduce guessing.",
    "category": "Agent",
    "useCases": [
      "Scope features before kicking off Agent Mode",
      "Avoid rebuilds caused by misread intent"
    ],
    "description": "Chat Mode interrogates ambiguous prompts before the agent commits to an approach — surfacing missing context, conflicting requirements, and edge cases up front.",
    "releaseDate": "2025-12-15",
    "capabilities": [
      "Targeted clarifying questions",
      "Context gap detection",
      "Lower wasted credits on rework"
    ]
  },
  {
    "id": "community-discovery",
    "icon": "",
    "name": "Community Discovery and Categorization",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Browse community projects by category and themes.",
    "category": "Community",
    "useCases": [
      "Finding templates and inspiration"
    ],
    "description": "Community Discovery surfaces projects shared by other builders, organized into categories with theming options for browsing.",
    "releaseDate": "2025-12-10",
    "capabilities": [
      "Categorized community feed"
    ]
  },
  {
    "id": "dashboard-redesign",
    "icon": "🧭",
    "name": "Dashboard Redesign",
    "source": "https://lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "A redesigned dashboard for managing every project.",
    "category": "Platform",
    "useCases": [
      "Manage many projects in one workspace",
      "Quickly jump between active builds",
      "Find recent work without digging"
    ],
    "description": "Lovable redesigned the dashboard from the ground up. Faster project switching, clearer workspace organization, and a more focused home for everything you build.",
    "releaseDate": "2025-12-10",
    "capabilities": [
      "Redesigned project list and switcher",
      "Clearer workspace organization",
      "Faster navigation between projects",
      "Improved project metadata at a glance"
    ]
  },
  {
    "id": "miro-mcp-connector",
    "icon": "",
    "name": "Miro MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Read Miro boards, wireframes, and diagrams.",
    "category": "MCP Connectors",
    "useCases": [
      "Wireframe-to-UI workflows"
    ],
    "description": "Miro MCP connector lets the agent access boards, wireframes, and diagrams to ground UI generation in design source material.",
    "releaseDate": "2025-12-10",
    "capabilities": [
      "Access boards and wireframes"
    ]
  },
  {
    "id": "starred-projects-folders",
    "icon": "",
    "name": "Starred Projects and Folders",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Star projects, nest folders, drag-drop organization.",
    "category": "Workspace",
    "useCases": [
      "Organizing dozens of projects"
    ],
    "description": "Dashboard supports starred projects, nested folders, drag-drop reorganization, persistent filters, server-side search across folders, and recently-viewed sorting.",
    "releaseDate": "2025-12-10",
    "capabilities": [
      "Starring",
      "Nested folders with drag-drop",
      "Server-side search across folders"
    ]
  },
  {
    "id": "atlassian-mcp-connector",
    "icon": "",
    "name": "Atlassian MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Jira issues and Confluence docs in the Lovable agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Building features from existing tickets",
      "Spec-driven prototypes"
    ],
    "description": "Atlassian MCP connector lets the agent read Jira issues and Confluence documentation to ground prototype generation in real tickets and specs.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Read Jira issues",
      "Read Confluence docs"
    ]
  },
  {
    "id": "cloud-storage",
    "icon": "",
    "name": "Cloud Storage",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Usage-based (paid plans)",
    "tagline": "Secure bucket storage up to 2 GB per file.",
    "category": "Cloud",
    "useCases": [
      "User-uploaded images and documents",
      "Media-heavy apps"
    ],
    "description": "Lovable Cloud Storage provides secure file storage with public or private bucket controls and a 2 GB per-file limit. Bucket and folder deletion shipped April 2026.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Public or private buckets",
      "2 GB per-file limit",
      "Bucket and folder deletion"
    ]
  },
  {
    "id": "education-logins",
    "icon": "",
    "name": "Education Logins",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Education",
    "tagline": "Temporary education login flow for classrooms.",
    "category": "Community",
    "useCases": [
      "Workshop and classroom usage"
    ],
    "description": "Education Logins provide a temporary, lightweight login experience for classroom and education contexts.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Temporary classroom logins"
    ]
  },
  {
    "id": "gemini-3-pro",
    "icon": "",
    "name": "Gemini 3 Pro",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Gemini 3 Pro model support.",
    "category": "AI Models",
    "useCases": [
      "Long-context tasks"
    ],
    "description": "Gemini 3 Pro support was added in the Nov 26, 2025 release for higher-quality Google-model builds.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Google-class reasoning"
    ]
  },
  {
    "id": "linear-mcp-connector",
    "icon": "",
    "name": "Linear MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Import Linear issues and specs into the Lovable agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Issue-driven prototyping"
    ],
    "description": "Linear MCP connector imports issues and specs to generate features — distinct from the Linear app connector.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Import Linear issues",
      "Generate features from specs"
    ]
  },
  {
    "id": "low-credit-alert",
    "icon": "",
    "name": "Low Credit Alert",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "In-product alert when credits run low.",
    "category": "Workflow",
    "useCases": [
      "Avoiding mid-build credit exhaustion"
    ],
    "description": "Low Credit Alerts notify users before credits run out, with rollover and top-up reminders surfaced alongside.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Low-balance notifications",
      "Top-up prompts"
    ]
  },
  {
    "id": "n8n-mcp-connector",
    "icon": "",
    "name": "n8n MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Mirror or plug into existing n8n automation workflows.",
    "category": "MCP Connectors",
    "useCases": [
      "Building UIs over n8n flows"
    ],
    "description": "n8n MCP connector lets the agent mirror or plug into existing n8n automation workflows.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Workflow context",
      "Automation integration"
    ]
  },
  {
    "id": "notion-mcp-connector",
    "icon": "",
    "name": "Notion MCP Connector",
    "source": "https://docs.lovable.dev/integrations/mcp-servers",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Reference Notion docs and pages in the agent.",
    "category": "MCP Connectors",
    "useCases": [
      "Spec-driven generation",
      "Wiki-aware prototyping"
    ],
    "description": "Notion MCP connector lets the agent reference docs and pages to guide app behavior — distinct from the Notion app connector for in-app integrations.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Reference Notion pages",
      "Ground agent in Notion docs"
    ]
  },
  {
    "id": "questions-feature",
    "icon": "",
    "name": "Questions (Agent Clarification Tool)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Agent asks structured clarifying questions before building.",
    "category": "Agent",
    "useCases": [
      "Reducing wasted credits on ambiguous prompts"
    ],
    "description": "The Questions feature lets the agent ask structured clarifying questions before starting work, captured separately from chat for explicit answers.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Structured agent clarification"
    ]
  },
  {
    "id": "remix-experience",
    "icon": "",
    "name": "Remix Experience",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Remix any project — choose workspace, folder, and new name.",
    "category": "Workflow",
    "useCases": [
      "Starting from a community template"
    ],
    "description": "The Remix Experience copies any public/community project into the user's workspace, with workspace + folder choice and a custom name during remix.",
    "releaseDate": "2025-11-26",
    "capabilities": [
      "Workspace/folder choice on remix",
      "Custom name during remix"
    ]
  },
  {
    "id": "workspace-publishing",
    "icon": "🏢",
    "name": "Workspace Publishing",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Authenticated org-scoped publishing without extra setup.",
    "category": "Workspace",
    "useCases": [
      "Ship internal tools safely",
      "Share work-in-progress with the team only"
    ],
    "description": "Publish projects behind workspace authentication — only members of the org can access the published app, with no custom auth wiring required.",
    "releaseDate": "2025-11-25",
    "capabilities": [
      "Org-only access by default",
      "Zero auth configuration",
      "Member-managed visibility"
    ]
  },
  {
    "id": "revert-edit-messages",
    "icon": "↩️",
    "name": "Revert and Edit Messages",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Roll back to any prior message or edit and re-run.",
    "category": "Editor",
    "useCases": [
      "Recover from a wrong agent decision",
      "Try alternate prompts from the same baseline"
    ],
    "description": "Restore is now Revert — jump back to any earlier point in a conversation, edit the prompt, and re-run from that state without losing later context.",
    "releaseDate": "2025-11-22",
    "capabilities": [
      "Revert to any message",
      "Edit prompts in place",
      "Branch from prior states"
    ]
  },
  {
    "id": "themes-design-view",
    "icon": "🎨",
    "name": "Themes and Design View",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Themes and Visual Edits unified in the new Design view.",
    "category": "Editor",
    "useCases": [
      "Restyle an entire app in seconds",
      "Iterate brand systems without code"
    ],
    "description": "A consolidated Design surface where theme tokens, typography, and visual edits live in one place — switch palettes, tweak components, and preview live.",
    "releaseDate": "2025-11-15",
    "capabilities": [
      "Unified theme + visual edits",
      "Live preview across the app",
      "Token-driven design system"
    ]
  },
  {
    "id": "claude-opus-45-chat",
    "icon": "🧠",
    "name": "Claude Opus 4.5 Early Access in Chat Mode",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Pro and Business plans",
    "tagline": "Test Anthropic's newest reasoning model in Chat Mode.",
    "category": "AI Models",
    "useCases": [
      "Architect complex features",
      "Diagnose subtle bugs across many files"
    ],
    "description": "Opt-in early access to Claude Opus 4.5 inside Chat Mode for deeper reasoning, longer-horizon planning, and stronger code understanding on complex projects.",
    "releaseDate": "2025-11-12",
    "capabilities": [
      "Frontier reasoning quality",
      "Available in Chat Mode only",
      "Switchable per conversation"
    ]
  },
  {
    "id": "cloud-auto-top-up",
    "icon": "",
    "name": "Cloud Auto Top-Up",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "Automatic Cloud and AI top-ups with monthly caps.",
    "category": "Cloud",
    "useCases": [
      "Production apps that can't run out of credits",
      "Bounded auto-replenishment"
    ],
    "description": "Auto Top-Up keeps Cloud and AI usage running without manual intervention. Workspace admins set monthly caps to bound spend; top-ups can be one-time ($10–$1,000) or automatic.",
    "releaseDate": "2025-11-05",
    "capabilities": [
      "Automatic balance top-ups",
      "Monthly spend caps",
      "One-time top-ups $10–$1,000"
    ]
  },
  {
    "id": "shopify-connector",
    "icon": "",
    "name": "Shopify Connector",
    "source": "https://docs.lovable.dev/integrations/shopify",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Build Shopify stores conversationally with per-user connections.",
    "category": "App Connectors",
    "useCases": [
      "Spinning up branded storefronts",
      "Custom Shopify frontends"
    ],
    "description": "Shopify app connector lets users build online stores through conversational AI with integrated Shopify setup, per-user connections with auto-refresh, and a disconnect option.",
    "releaseDate": "2025-11-05",
    "capabilities": [
      "Conversational store building",
      "Per-user connections with auto-refresh",
      "Store disconnect"
    ]
  },
  {
    "id": "claude-sonnet-4-5",
    "icon": "",
    "name": "Claude Sonnet 4.5",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Sonnet 4.5 model support for faster, cheaper builds.",
    "category": "AI Models",
    "useCases": [
      "Everyday agent prompts"
    ],
    "description": "Sonnet 4.5 support was added alongside the Lovable Cloud launch on Oct 6, 2025 as a balanced cost/quality option.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "Balanced cost and quality"
    ]
  },
  {
    "id": "cloud-auth-email-phone",
    "icon": "",
    "name": "Cloud Authentication (Email and Phone)",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Usage-based (paid plans)",
    "tagline": "Built-in email and phone sign-in for Cloud apps.",
    "category": "Cloud",
    "useCases": [
      "Standing up a user system without writing auth code"
    ],
    "description": "Lovable Cloud provides built-in signup and login flows supporting email and phone authentication out of the box, with managed user accounts and encryption.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "Email-based auth",
      "Phone-based auth",
      "Managed user accounts"
    ]
  },
  {
    "id": "cloud-database",
    "icon": "",
    "name": "Cloud Database",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Usage-based (paid plans)",
    "tagline": "Managed Postgres with natural-language schema generation.",
    "category": "Cloud",
    "useCases": [
      "Persisting user data without SQL",
      "Multi-region deployment"
    ],
    "description": "Lovable Cloud's database service provides managed Postgres with auto-generated schemas from plain-language descriptions and a UI for managing data without SQL. Available in three hosting regions with instance scaling.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "Natural-language schema generation",
      "UI-based data management",
      "Three regions (Americas, Europe, Asia Pacific)"
    ]
  },
  {
    "id": "cloud-edge-functions",
    "icon": "",
    "name": "Cloud Edge Functions",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Usage-based (paid plans)",
    "tagline": "Serverless compute for APIs, webhooks, and scheduled tasks.",
    "category": "Cloud",
    "useCases": [
      "Stripe webhooks",
      "Cron jobs in apps"
    ],
    "description": "Edge Functions provide serverless compute for custom logic — APIs, webhooks, email notifications, payment processing, and scheduled tasks — that scales automatically.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "API and webhook endpoints",
      "Scheduled tasks",
      "Auto-scaling"
    ]
  },
  {
    "id": "cloud-instance-scaling",
    "icon": "",
    "name": "Cloud Instance Scaling",
    "source": "https://docs.lovable.dev/integrations/cloud",
    "status": "GA",
    "pricing": "Lovable Cloud only",
    "tagline": "Scale Cloud database/compute from Tiny to Large.",
    "category": "Cloud",
    "useCases": [
      "Scaling production apps under load",
      "Cost-tuning small projects"
    ],
    "description": "Cloud instances scale across size tiers (Tiny to Large) for performance needs. Real-time monitoring, debugging logs, and alerts when resource limits approach are included.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "Tiny to Large instance tiers",
      "Real-time monitoring and logs",
      "Resource-limit alerts"
    ]
  },
  {
    "id": "stripe-connector",
    "icon": "",
    "name": "Stripe Connector",
    "source": "https://docs.lovable.dev/integrations/stripe",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Handle payments and subscriptions through Stripe.",
    "category": "App Connectors",
    "useCases": [
      "E-commerce checkout",
      "SaaS subscriptions"
    ],
    "description": "Stripe app connector enables payment processing, subscription billing, and webhook handling. Updated integration shipped with the Lovable Cloud release.",
    "releaseDate": "2025-10-06",
    "capabilities": [
      "Payment processing",
      "Subscription billing",
      "Webhook handling"
    ]
  },
  {
    "id": "new-project-layout",
    "icon": "🧭",
    "name": "New Project Layout",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Analytics, Speed, and Security live in the project view switcher.",
    "category": "Editor",
    "useCases": [
      "Monitor app health in one place",
      "Triage performance and security findings"
    ],
    "description": "The project view reorganized so Analytics, Speed, and Security each get a dedicated surface — switch contexts without leaving the project.",
    "releaseDate": "2025-10-05",
    "capabilities": [
      "Dedicated Analytics view",
      "Dedicated Speed view",
      "Dedicated Security view"
    ]
  },
  {
    "id": "voice-mode",
    "icon": "🎙️",
    "name": "Voice Mode",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Describe what you want to build in speech instead of typing.",
    "category": "Editor",
    "useCases": [
      "Brainstorm a build hands-free",
      "Dictate long product specs"
    ],
    "description": "Press to talk — Voice Mode transcribes and routes your spoken intent directly into the agent, ideal for long descriptions and on-the-go iteration.",
    "releaseDate": "2025-09-20",
    "capabilities": [
      "Push-to-talk capture",
      "Real-time transcription",
      "Routes into Chat or Agent mode"
    ]
  },
  {
    "id": "multi-format-file-uploads",
    "icon": "📎",
    "name": "Multi-Format File Uploads",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "CSV, PDF, TTF, MP4, and image uploads as build context.",
    "category": "Editor",
    "useCases": [
      "Seed a build from a spec PDF",
      "Generate UI from a font and brand assets"
    ],
    "description": "Drop files of any common format into a prompt — the agent reads them as first-class context for builds, designs, and data work.",
    "releaseDate": "2025-09-12",
    "capabilities": [
      "CSV, PDF, TTF, MP4, image support",
      "Files become agent context",
      "Drag-and-drop into chat"
    ]
  },
  {
    "id": "data-opt-out",
    "icon": "",
    "name": "Data Training Opt-Out",
    "source": "https://docs.lovable.dev/features/business/data-opt-out",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Self-serve opt-out from AI model training for workspace data.",
    "category": "Security",
    "useCases": [
      "Compliance with internal data policies",
      "Protecting proprietary code"
    ],
    "description": "Workspace admins on Business and Enterprise plans can self-serve disable use of workspace data for model training. Free and Pro plans must request opt-out through Lovable Support. Lovable commits to never using identifiable PII for training.",
    "releaseDate": "2025-09-01",
    "capabilities": [
      "Self-serve workspace opt-out (Business/Enterprise)",
      "Support-driven opt-out (Free/Pro)"
    ]
  },
  {
    "id": "lovable-ai-gateway",
    "icon": "🧠",
    "name": "Lovable AI Gateway",
    "source": "https://docs.lovable.dev/features/ai",
    "status": "GA",
    "pricing": "Usage-based, free tier",
    "tagline": "Built-in access to frontier models — no API keys needed.",
    "category": "AI Models",
    "useCases": [
      "AI summaries",
      "Conversational chatbots",
      "Doc Q&A",
      "Image generation in-app"
    ],
    "description": "Lovable AI lets your app call leading LLMs and image models without managing API keys or provider accounts. Powers chatbots, summaries, sentiment, document Q&A, multilingual translation, and image/document analysis. Requires Lovable Cloud.",
    "releaseDate": "2025-09-01",
    "capabilities": [
      "No API keys",
      "Frontier text + image models",
      "Free monthly usage",
      "Server-side from Cloud functions"
    ]
  },
  {
    "id": "credit-rollovers",
    "icon": "🔄",
    "name": "Credit Rollovers",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Monthly rollover up to your limit; annual rollover up to 12x.",
    "category": "Workspace",
    "useCases": [
      "Save credits for big build pushes",
      "Smooth out uneven usage months"
    ],
    "description": "Unused credits now roll forward — monthly up to your plan's credit limit and annually up to 12x your monthly allotment.",
    "releaseDate": "2025-08-25",
    "capabilities": [
      "Monthly rollover up to plan limit",
      "Annual rollover up to 12x monthly",
      "Automatic, no action needed"
    ]
  },
  {
    "id": "student-discount-50",
    "icon": "🎓",
    "name": "Student Discount 50%",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "50% off paid plans with student verification.",
    "category": "Community",
    "useCases": [
      "Build production projects on a student budget",
      "Class and club projects"
    ],
    "description": "Verified students get 50% off any paid Lovable plan — verification handled inline at checkout.",
    "releaseDate": "2025-08-20",
    "capabilities": [
      "Inline student verification",
      "Applies to all paid plans",
      "Renewable annually"
    ]
  },
  {
    "id": "realtime-security-protection",
    "icon": "🛡️",
    "name": "Real-Time Security Protection",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Real-time risk detection plus SOC 2 Type II and ISO 27001 certified.",
    "category": "Security",
    "useCases": [
      "Meet enterprise security requirements",
      "Catch risky patterns before publish"
    ],
    "description": "Continuous risk detection across builds and runtime, backed by SOC 2 Type II and ISO 27001 certifications for the platform.",
    "releaseDate": "2025-08-15",
    "capabilities": [
      "Real-time threat detection",
      "SOC 2 Type II certified",
      "ISO 27001 certified"
    ]
  },
  {
    "id": "automatic-in-app-seo",
    "icon": "🔍",
    "name": "Automatic In-App SEO",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Auto-optimized meta, structured data, alt text, URLs, and sitemap.",
    "category": "Publishing",
    "useCases": [
      "Rank a marketing site without manual SEO work",
      "Ship indexable content from day one"
    ],
    "description": "Published apps ship with sane SEO defaults out of the box — meta tags, JSON-LD, image alt text, clean URLs, and a generated sitemap update as the app changes.",
    "releaseDate": "2025-08-12",
    "capabilities": [
      "Auto meta and Open Graph",
      "Structured data (JSON-LD)",
      "Image alt text generation",
      "Sitemap and clean URLs"
    ]
  },
  {
    "id": "analytics",
    "icon": "",
    "name": "Real-Time App Analytics",
    "source": "https://docs.lovable.dev/features/analytics",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Visitors, pageviews, bounce rate, sources, and devices in real time.",
    "category": "Workflow",
    "useCases": [
      "Launch-day traffic monitoring",
      "Source-of-truth public analytics"
    ],
    "description": "Real-Time App Analytics tracks visitors, pageviews, bounce rate, visit duration, traffic sources, and device usage for published apps. Time ranges from today through 90 days plus monthly views.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Visitors, pageviews, bounce rate",
      "Traffic sources and devices",
      "Real-time updates"
    ]
  },
  {
    "id": "branded-workspace-urls",
    "icon": "",
    "name": "Branded Workspace URLs",
    "source": "https://docs.lovable.dev/features/branded-workspace-urls",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Publish apps at app-name.workspace.lovable.app.",
    "category": "Publishing",
    "useCases": [
      "Internal app portals",
      "Branded staging links"
    ],
    "description": "Branded Workspace URLs publish workspace apps under a consistent subdomain pattern derived from a verified domain. Coexists with custom domains (custom domains take precedence). Preview URLs use preview--{app}.{workspace}.lovable.app.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Unified workspace URL pattern",
      "Auto-derived from verified domain",
      "Preview URL support"
    ]
  },
  {
    "id": "business-plan",
    "icon": "",
    "name": "Business Plan",
    "source": "https://docs.lovable.dev/introduction/plans-and-credits",
    "status": "GA",
    "pricing": "$50-$4,300/month or $500-$43,000/year",
    "tagline": "SSO, restricted projects, data opt-out, design templates.",
    "category": "Workspace",
    "useCases": [
      "Mid-sized teams",
      "Companies requiring SSO"
    ],
    "description": "Business plan adds SSO (OIDC + SAML), restricted project access, data training opt-out, design template creation, and granular publishing controls on top of Pro.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "SSO (OIDC + SAML)",
      "Restricted projects",
      "Data opt-out",
      "Design templates"
    ]
  },
  {
    "id": "custom-connectors-enterprise",
    "icon": "",
    "name": "Custom Connectors (Enterprise)",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Build and deploy your own connectors beyond Lovable's catalog.",
    "category": "MCP Connectors",
    "useCases": [
      "Connect proprietary internal APIs",
      "Industry-specific integrations"
    ],
    "description": "Enterprise feature allowing organizations to author and deploy private connectors that aren't part of Lovable's public integration catalog. Distinct from public MCP integrations because it implies a customer-authored extension surface.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Custom integration authoring",
      "Private connector deployment",
      "Internal API bridging"
    ]
  },
  {
    "id": "design-systems-enterprise",
    "icon": "",
    "name": "Design Systems (Enterprise)",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Enterprise-grade reusable design systems across all org projects.",
    "category": "Editor",
    "useCases": [
      "Enterprise brand governance",
      "Cross-team design consistency"
    ],
    "description": "Enterprise-tier feature distinct from per-project Themes — a centralized, org-wide design system applied across every workspace project. Couples with Themes but managed at org level.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Org-wide design system",
      "Cross-project component reuse",
      "Centralized brand enforcement"
    ]
  },
  {
    "id": "internal-publish",
    "icon": "",
    "name": "Internal Publish",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Publish apps internally to your workspace, not the public web.",
    "category": "Publishing",
    "useCases": [
      "Internal tools",
      "HR/finance dashboards",
      "Private prototypes for stakeholders"
    ],
    "description": "Internal Publish lets Business and Enterprise workspaces ship apps to an internal audience (org-only access) rather than the public lovable.app domain. Distinct from custom domains — this is access-controlled internal distribution, useful for internal tools.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Workspace-scoped publishing",
      "Org-only access",
      "Separate from public publishing"
    ]
  },
  {
    "id": "publishing-controls",
    "icon": "",
    "name": "Publishing Controls",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Admin policy controls over who can publish what, where.",
    "category": "Publishing",
    "useCases": [
      "Regulated industries",
      "Pre-publish approval gates",
      "Brand-safety policies"
    ],
    "description": "Enterprise-only governance feature controlling publishing behavior across the org — who can ship to which audience (public, internal, custom domain), and approval flows. Distinct from per-user roles.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Publish policy enforcement",
      "Approval workflows",
      "Audience restrictions"
    ]
  },
  {
    "id": "sharing-controls",
    "icon": "",
    "name": "Sharing Controls",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Enterprise plans",
    "tagline": "Admin controls over project sharing inside the org.",
    "category": "Security",
    "useCases": [
      "Data-sensitive industries",
      "IP protection",
      "Limiting external collaborator exposure"
    ],
    "description": "Enterprise admin policy layer governing how projects can be shared across the workspace and externally. Pairs with Publishing Controls and Audit Logs for a full governance stack.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Share policy enforcement",
      "External-share restrictions",
      "Workspace-scoped sharing"
    ]
  },
  {
    "id": "user-roles-permissions",
    "icon": "",
    "name": "User Roles and Permissions",
    "source": "https://lovable.dev/pricing",
    "status": "GA",
    "pricing": "Pro, Business, Enterprise plans",
    "tagline": "Assign roles and permissions to workspace members.",
    "category": "Workspace",
    "useCases": [
      "Team collaboration",
      "Limiting publish rights",
      "Agency client management"
    ],
    "description": "Workspace-level user roles and permissions controlling who can build, edit, publish, or manage projects. Available from Pro tier upward. Distinct from SSO/SCIM (Business/Enterprise only) which handles identity, not authorization scopes.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "Role assignment",
      "Permission scoping",
      "Member management"
    ]
  },
  {
    "id": "workspace-sso",
    "icon": "",
    "name": "Workspace SSO (OIDC + SAML 2.0)",
    "source": "https://docs.lovable.dev/features/business/sso",
    "status": "GA",
    "pricing": "Business and Enterprise plans",
    "tagline": "Sign in to Lovable workspaces via Okta, Auth0, Entra ID, and more.",
    "category": "Security",
    "useCases": [
      "Enterprise identity centralization",
      "Compliance-mandated auth"
    ],
    "description": "OIDC and SAML 2.0 SSO for workspace access. Supports any compliant IdP, JIT provisioning with configurable default roles, and enforceable session durations (24-48h or 7 days). Service-provider initiated only.",
    "releaseDate": "2025-08-11",
    "capabilities": [
      "OIDC and SAML 2.0",
      "JIT provisioning",
      "Configurable session durations",
      "SSO enforcement"
    ]
  },
  {
    "id": "capacitor-expo",
    "icon": "📦",
    "name": "Mobile App Export (Capacitor / Expo)",
    "source": "https://capgo.app/blog/transform-lovable-dev-app-to-mobile-with-capacitor/",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Wrap a Lovable web app as a native iOS/Android binary.",
    "category": "Mobile",
    "useCases": [
      "Ship a PWA-like app to the App Store",
      "Add push notifications via Capacitor plugins"
    ],
    "description": "Lovable projects can be wrapped as native mobile apps via Capacitor (most common) or Expo. The agent will install Capacitor CLI, initialize iOS/Android platforms, and configure the bundle ID.",
    "releaseDate": "2025-08-01",
    "capabilities": [
      "Capacitor + iOS/Android native shells",
      "Expo flow for React Native paths",
      "Reuses your existing Lovable UI"
    ]
  },
  {
    "id": "lovable-2-agent-default",
    "icon": "🌟",
    "name": "Agent Mode Default in Lovable 2.0",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Lovable 2.0 makes Agent Mode the default agent-first interface.",
    "category": "Agent",
    "useCases": [
      "Run an entire project from a single agent thread",
      "Hand off ongoing maintenance to the agent"
    ],
    "description": "Lovable 2.0 ships Agent Mode as the default experience — an agent-first interface for deploying, managing, and evolving projects end-to-end.",
    "releaseDate": "2025-07-20",
    "capabilities": [
      "Agent Mode default for new projects",
      "Unified deploy and manage flows",
      "Foundation for autonomous workflows"
    ]
  },
  {
    "id": "series-a-200m",
    "icon": "🚀",
    "name": "Lovable $200M Series A",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "$200M Series A led by Accel.",
    "category": "Community",
    "useCases": [
      "Build with confidence on a well-capitalized platform"
    ],
    "description": "Lovable raised a $200M Series A led by Accel, with Creandum, 20VC, Hummingbird, byFounders, and Visionaries participating — fueling the next phase of the platform.",
    "releaseDate": "2025-07-15",
    "capabilities": [
      "Accelerated platform investment",
      "Expanded team and infra",
      "Long-term roadmap funded"
    ]
  },
  {
    "id": "global-search",
    "icon": "",
    "name": "Global Project Search",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Fuzzy search across projects, files, and folders.",
    "category": "Workspace",
    "useCases": [
      "Finding a project by partial name",
      "Code search across the workspace"
    ],
    "description": "Global Project Search supports fuzzy matching, combined filename + content search, command palette (cmd+K) entry, and rich folder results.",
    "releaseDate": "2025-06-26",
    "capabilities": [
      "Fuzzy search",
      "Filename + content combined search",
      "Command palette integration"
    ]
  },
  {
    "id": "mermaid-diagrams",
    "icon": "",
    "name": "Mermaid Diagrams in Chat",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Chat renders Mermaid diagrams for architectures and flows.",
    "category": "Editor",
    "useCases": [
      "Architectural reviews in chat"
    ],
    "description": "Chat mode renders Mermaid diagrams inline so the agent can show architectures, sequence flows, and data models without external tools.",
    "releaseDate": "2025-06-04",
    "capabilities": [
      "Inline Mermaid rendering"
    ]
  },
  {
    "id": "security-view",
    "icon": "",
    "name": "Security View (Per-Project)",
    "source": "https://docs.lovable.dev/features/security",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Per-project security review with RLS, code, and dependency scans.",
    "category": "Security",
    "useCases": [
      "Pre-launch hardening",
      "Catching RLS misconfigurations"
    ],
    "description": "Security View runs RLS analysis, database security checks, code security review, and npm dependency audits per project. Scans trigger automatically on file changes and before publishing, and can be run on-demand.",
    "releaseDate": "2025-06-04",
    "capabilities": [
      "RLS analysis",
      "Code security review",
      "npm dependency audit",
      "Pre-publish blocking"
    ]
  },
  {
    "id": "lovable-cloud",
    "icon": "☁️",
    "name": "Lovable Cloud",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Managed backend with region choice and transactional email.",
    "category": "Deploy",
    "useCases": [
      "EU data-residency for GDPR builds",
      "Production-ready hosting without DevOps"
    ],
    "description": "Managed backend hosting (Supabase-compatible) with region selection (Americas, Europe, Asia Pacific), non-code deployments for secrets/storage, transactional app emails from your own domain, and CDN/proxy support (Cloudflare/CloudFront/Fastly).",
    "releaseDate": "2025-06-01",
    "capabilities": [
      "Region selection (US / EU / APAC)",
      "Secrets and storage management UI",
      "Transactional + auth emails from your domain",
      "CDN proxy support via CNAME",
      "Hourly resource alerts"
    ]
  },
  {
    "id": "claude-4",
    "icon": "",
    "name": "Claude 4",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Initial Claude 4 integration — 91% error reduction and 40% faster.",
    "category": "AI Models",
    "useCases": [
      "General app builds"
    ],
    "description": "Claude 4 landed on May 24, 2025 as the new default coding model and was credited with a 91% error reduction and 40% speed improvement over the prior model.",
    "releaseDate": "2025-05-24",
    "capabilities": [
      "Default for full-stack generation"
    ]
  },
  {
    "id": "image-understanding",
    "icon": "",
    "name": "Image Understanding (Multimodal Input)",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Attach images for the agent to interpret as design context.",
    "category": "Editor",
    "useCases": [
      "Designs to working UI"
    ],
    "description": "Image Understanding lets users attach images (mockups, screenshots, wireframes) and have the agent interpret them as guidance for implementation.",
    "releaseDate": "2025-05-09",
    "capabilities": [
      "Image-as-input for builds"
    ]
  },
  {
    "id": "project-knowledge",
    "icon": "",
    "name": "Project Knowledge",
    "source": "https://docs.lovable.dev/features/knowledge",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Project-specific agent context — schema, terminology, persona (10K chars).",
    "category": "Workspace",
    "useCases": [
      "Onboarding the agent to a domain",
      "Schema and terminology stability"
    ],
    "description": "Project Knowledge stores app purpose, schema, domain terminology, and architectural decisions for a single project. Any editor can update. Wins over workspace knowledge on conflict. Up to 10,000 characters.",
    "releaseDate": "2025-04-25",
    "capabilities": [
      "Project-specific persistent context",
      "10,000-character capacity",
      "Wins over workspace knowledge on conflict"
    ]
  },
  {
    "id": "ionos-domain-purchasing",
    "icon": "",
    "name": "Domain Purchasing (IONOS)",
    "source": "https://docs.lovable.dev/features/custom-domain",
    "status": "GA",
    "pricing": "Paid plans",
    "tagline": "Buy a domain inside Lovable via IONOS partnership.",
    "category": "Publishing",
    "useCases": [
      "Buying a domain at launch without leaving Lovable"
    ],
    "description": "IONOS partnership lets users purchase a domain directly inside Lovable. DNS and SSL are configured automatically. Supports major gTLDs and selected ccTLDs (.ai, .io, .co, .me). Redesigned April 2026.",
    "releaseDate": "2025-04-11",
    "capabilities": [
      "In-product domain purchase via IONOS",
      "Automatic DNS and SSL",
      "Major gTLD + select ccTLD support"
    ]
  },
  {
    "id": "edge-function-logging",
    "icon": "",
    "name": "Edge Function Logging",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Inline logs for Edge Functions runs.",
    "category": "Cloud",
    "useCases": [
      "Debugging Stripe webhooks"
    ],
    "description": "Edge Function Logging surfaces serverless run logs inside the Lovable UI for debugging custom server-side code.",
    "releaseDate": "2025-03-28",
    "capabilities": [
      "In-product Edge Function logs"
    ]
  },
  {
    "id": "status-page",
    "icon": "",
    "name": "Lovable Status Page",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Public uptime and incident status page.",
    "category": "Workflow",
    "useCases": [
      "Checking during a suspected outage"
    ],
    "description": "The Lovable Status Page surfaces uptime and incident updates for the platform.",
    "releaseDate": "2025-03-28",
    "capabilities": [
      "Real-time platform status"
    ]
  },
  {
    "id": "versioning-v2",
    "icon": "🕓",
    "name": "Versioning 2.0",
    "source": "https://lovable.dev/blog/product-updates/versioning-with-lovable-two-point-zero",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Improved history, restore points, and version tracking.",
    "category": "Workflow",
    "useCases": [
      "Recover from bad edits",
      "Compare iterations"
    ],
    "description": "Versioning 2.0 brings better history, named restore points, and clearer tracking across iterations so you can move fast without losing work.",
    "releaseDate": "2025-03-03",
    "capabilities": [
      "Restore points",
      "Inline diff history",
      "Stable rollback"
    ]
  },
  {
    "id": "lovable-experts",
    "icon": "",
    "name": "Lovable Experts Marketplace",
    "source": "https://lovable.dev/experts",
    "status": "GA",
    "pricing": "Free to browse; partners set their own rates",
    "tagline": "Hire vetted Lovable agencies to build for you.",
    "category": "Community",
    "useCases": [
      "Hire someone to build for you",
      "Agency engagements",
      "Larger custom builds"
    ],
    "description": "Live partner marketplace connecting Lovable users with independent expert agencies for paid build engagements. Partners publish hourly rates, minimum project budgets, hire counts, and portfolios. Partners are independent entities, not Lovable employees.",
    "releaseDate": "2025-03-01",
    "capabilities": [
      "Partner directory",
      "Hourly rates visible",
      "Hire counts and portfolios",
      "Direct partner contact"
    ]
  },
  {
    "id": "visual-edits",
    "icon": "🎨",
    "name": "Visual Edits",
    "source": "https://docs.lovable.dev/features/design",
    "status": "GA",
    "pricing": "Free (within daily limits)",
    "tagline": "Figma-like, Tailwind-native direct manipulation.",
    "category": "Editor",
    "useCases": [
      "Tighten spacing on a hero section",
      "Swap a placeholder image for a generated one",
      "Designers fix copy and color without burning credits"
    ],
    "description": "Select any element in the live preview and edit text, colors, fonts, spacing, layout, and images directly — no prompts required. Free, fast, and credit-friendly with undo always available.",
    "releaseDate": "2025-02-12",
    "capabilities": [
      "Click to select any element (multi-select with Shift)",
      "Edit text, colors, fonts, line-height, weight",
      "Layout, alignment, per-side margins/padding",
      "Replace images by upload or URL; generate AI images",
      "Tailwind-native output — no design drift"
    ]
  },
  {
    "id": "agent-mode",
    "icon": "🤖",
    "name": "Agent Mode",
    "source": "https://docs.lovable.dev/features/agent-mode",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Autonomous, end-to-end execution mode.",
    "category": "Agent",
    "useCases": [
      "Ship a complete CRUD feature from a single prompt",
      "Diagnose and fix a flaky auth flow",
      "Refactor a component library to a new design system"
    ],
    "description": "Agent Mode takes ownership of a task end-to-end — understands intent, explores the codebase, applies changes across files, resolves issues mid-implementation, and verifies results. All changes surface as file diffs and a step-by-step Details view.",
    "releaseDate": "2025-02-11",
    "capabilities": [
      "Implement features once an approach is decided",
      "Fix bugs end-to-end across frontend, backend, and config",
      "Refactor across multiple files",
      "Inspect logs and network activity to identify problems",
      "Fetch external docs or assets, generate or edit images and video",
      "Verify results before finishing"
    ]
  },
  {
    "id": "community-templates-gallery",
    "icon": "",
    "name": "Community Templates Gallery",
    "source": "https://lovable.dev/templates",
    "status": "GA",
    "pricing": "Free",
    "tagline": "100+ production-ready community templates as starting points.",
    "category": "Community",
    "useCases": [
      "Project kickstart",
      "Pattern reference",
      "Showcasing your build"
    ],
    "description": "Public gallery of 100+ user-created Lovable templates spanning portfolios, SaaS landing pages, ecommerce, dashboards, project management, resume builders, wedding sites, and more. Distinct from the in-product Design Templates Business-plan feature — this is the public community surface.",
    "releaseDate": "2025-02-07",
    "capabilities": [
      "Public template directory",
      "Forkable starting points",
      "Category browsing"
    ]
  },
  {
    "id": "lovable-launched-directory",
    "icon": "",
    "name": "Lovable Launched Directory",
    "source": "https://www.producthunt.com/products/lovable",
    "status": "GA",
    "pricing": "Free",
    "tagline": "Public directory to launch and discover apps built on Lovable.",
    "category": "Community",
    "useCases": [
      "Showcase your build",
      "Browse community apps",
      "Find templates and inspiration"
    ],
    "description": "App-discovery directory where Lovable builders publish their apps to a public catalog and browse what others have shipped. Launched February 2025 alongside Lovable's Product Hunt debut.",
    "releaseDate": "2025-02-07",
    "capabilities": [
      "Public app directory",
      "App discovery",
      "Social proof for builders"
    ]
  },
  {
    "id": "enterprise-plan",
    "icon": "",
    "name": "Enterprise Plan",
    "source": "https://docs.lovable.dev/introduction/plans-and-credits",
    "status": "GA",
    "pricing": "Custom",
    "tagline": "SCIM, audit logs, code execution, SSO enforcement, per-member credit limits.",
    "category": "Workspace",
    "useCases": [
      "Regulated industries",
      "Large orgs needing IdP-driven lifecycle"
    ],
    "description": "Enterprise plan adds SCIM provisioning, audit logs with JSONL export, SSO-only enforcement, per-member credit limits, GitHub Enterprise (Cloud and Server), and code execution. Custom-priced.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "SCIM provisioning",
      "Audit logs and JSONL export",
      "GitHub Enterprise Cloud/Server",
      "SSO enforcement"
    ]
  },
  {
    "id": "free-plan",
    "icon": "",
    "name": "Free Plan",
    "source": "https://docs.lovable.dev/introduction/plans-and-credits",
    "status": "GA",
    "pricing": "Free",
    "tagline": "5 daily credits (30/month cap), unlimited members, private projects.",
    "category": "Workspace",
    "useCases": [
      "Hobby builds",
      "Trial usage"
    ],
    "description": "The Free plan provides 5 daily credits (capped at 30/month), unlimited workspace members, and private projects. Daily credits do not roll over.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "5 daily credits (30/month cap)",
      "Unlimited members",
      "Private projects"
    ]
  },
  {
    "id": "github-connector",
    "icon": "",
    "name": "GitHub Connector",
    "source": "https://docs.lovable.dev/integrations/github",
    "status": "GA",
    "pricing": "All plans (Enterprise Cloud/Server: Enterprise plan)",
    "tagline": "Two-way sync between Lovable and GitHub repositories.",
    "category": "App Connectors",
    "useCases": [
      "Local IDE development",
      "Code review workflows"
    ],
    "description": "Bidirectional sync with github.com (all plans), GitHub Enterprise Cloud, and GitHub Enterprise Server (both Enterprise plan). Supports branching, PRs, code reviews, repository transfer, and co-author tracking.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "Bidirectional sync",
      "Pull requests and branches",
      "GitHub Enterprise Cloud/Server (Enterprise plan)",
      "Co-author tracking"
    ]
  },
  {
    "id": "lovable-api",
    "icon": "",
    "name": "Lovable API",
    "source": "https://docs.lovable.dev/integrations/lovable-api",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Programmatic project creation, starting with Build with URL.",
    "category": "Integrations",
    "useCases": [
      "Templated app launches",
      "Embedding Lovable in other products"
    ],
    "description": "The Lovable API enables programmatic project creation and distribution. First-class endpoint is Build with URL; more endpoints are landing over time. Powers Build-with-Lovable buttons and link-driven workflows.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "Build with URL",
      "Programmatic project creation",
      "Embeddable buttons"
    ]
  },
  {
    "id": "pro-plan",
    "icon": "",
    "name": "Pro Plan",
    "source": "https://docs.lovable.dev/introduction/plans-and-credits",
    "status": "GA",
    "pricing": "$25-$2,250/month or $250-$22,500/year",
    "tagline": "100-10,000 credits/month, custom domains, code mode, badge removal.",
    "category": "Workspace",
    "useCases": [
      "Solo builders and freelancers",
      "Small production apps"
    ],
    "description": "Pro plan offers 100 to 10,000 monthly credits, workspace roles, custom domains, Code mode access, and 'Edit with Lovable' badge removal. Annual billing saves 20%.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "100-10,000 monthly credits",
      "Custom domains",
      "Code mode",
      "Badge removal"
    ]
  },
  {
    "id": "publish-snapshot-deployment",
    "icon": "",
    "name": "Publish (Snapshot Deployment)",
    "source": "https://docs.lovable.dev/features/publish",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Deploy project snapshots to live URLs with metadata controls.",
    "category": "Publishing",
    "useCases": [
      "Shipping a project publicly",
      "Updating a live app on demand"
    ],
    "description": "Publish deploys a project snapshot to a live shareable URL with favicon, title, meta description, and social sharing image configuration. Changes require explicit republishing. Security scans gate publishes.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "Snapshot deployment to live URL",
      "Metadata controls (favicon, title, OG image)",
      "Security scans before publish"
    ]
  },
  {
    "id": "share-project",
    "icon": "",
    "name": "Share Project",
    "source": "https://docs.lovable.dev/features/share-project",
    "status": "GA",
    "pricing": "All plans (Viewer/restricted: paid plans)",
    "tagline": "Email invites, 5-day invite links, 7-day public preview links.",
    "category": "Workspace",
    "useCases": [
      "External collaborator access",
      "Stakeholder previews without accounts"
    ],
    "description": "Share Project supports email invitations with role assignment, 5-day invite links, and 7-day public preview links. Viewer role requires paid plans. Business and Enterprise add restricted projects and SSO enforcement.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "Email invites with roles",
      "Invite links (5-day) and preview links (7-day)",
      "Viewer role on paid plans"
    ]
  },
  {
    "id": "supabase-connector",
    "icon": "",
    "name": "Supabase Connector",
    "source": "https://docs.lovable.dev/integrations/supabase",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Managed Postgres, auth, storage, realtime, and Edge Functions via Supabase.",
    "category": "App Connectors",
    "useCases": [
      "Apps needing more than Lovable Cloud offers",
      "Real-time chat and dashboards"
    ],
    "description": "Supabase integration provides a fully managed backend — PostgreSQL with SQL Assistant, OAuth and email auth, 50MB file uploads on free tier, real-time subscriptions, and Edge Functions for custom server logic.",
    "releaseDate": "2025-01-01",
    "capabilities": [
      "Postgres with natural-language schema",
      "Auth (email + OAuth)",
      "Storage and real-time subscriptions",
      "Edge Functions"
    ]
  },
  {
    "id": "github-sync",
    "icon": "🐙",
    "name": "GitHub Sync",
    "source": "https://docs.lovable.dev/changelog",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Two-way GitHub sync with branch switching and co-author commits.",
    "category": "Integrations",
    "useCases": [
      "Hand-off to a human dev team mid-project",
      "Wire up Vercel/Netlify deploy previews",
      "Run automated QA on every PR"
    ],
    "description": "Bi-directional sync between Lovable and GitHub. Branch switching is enabled by default. As of March 2026, commits include the user's GitHub identity as a co-author for clean attribution.",
    "releaseDate": "2024-12-01",
    "capabilities": [
      "Two-way sync (push/pull)",
      "Branch switching from the editor",
      "Co-author attribution on commits (Mar 2026)",
      "Pair with CI/CD or QA tech agents"
    ]
  },
  {
    "id": "supabase",
    "icon": "🟩",
    "name": "Supabase Integration",
    "source": "https://docs.lovable.dev/tips-tricks/external-deployment-hosting",
    "status": "GA",
    "pricing": "All plans",
    "tagline": "Auth, Postgres, storage, edge functions — wired in.",
    "category": "Integrations",
    "useCases": [
      "Full-stack SaaS MVPs with login",
      "Migrate from Lovable Cloud to managed/self-hosted Supabase"
    ],
    "description": "Native Supabase integration backs Lovable Cloud and supports BYO Supabase projects. The agent can test authenticated edge functions, and resource exhaustion alerts now run hourly. Self-hosting and migration paths are documented.",
    "releaseDate": "2024-11-01",
    "capabilities": [
      "Auth (email, OAuth, magic link)",
      "Postgres with row-level security",
      "Storage buckets with management UI",
      "Edge functions — agent tests authenticated calls",
      "Hourly resource alerts"
    ]
  }
];
