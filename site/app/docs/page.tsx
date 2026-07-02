import type { Metadata } from "next";
import { DecorativePhillyObjects } from "../components/DecorativePhillyObjects";

export const metadata: Metadata = {
  title: "Documentation | Philadelphia Data MCP",
  description:
    "Connect AI clients and civic applications to Philadelphia public data through structured MCP tools and resources.",
};

const datasetCoverage = [
  {
    name: "311_service_requests",
    description: "Philly311 service and information requests with status, type, dates, ZIP, and coordinates.",
    example: "Review service request counts by service name, status, or ZIP.",
  },
  {
    name: "property_assessments",
    description: "OPA property characteristics and assessment records.",
    example: "Inspect property fields and query selected parcel attributes.",
  },
  {
    name: "building_permits",
    description: "L&I building and zoning permits with permit type, status, date, and address context.",
    example: "Find recent permit activity by date, ZIP, or council district.",
  },
  {
    name: "li_violations",
    description: "L&I code violations with case, violation, status, address, and district fields.",
    example: "Query open violations by violation status or ZIP.",
  },
  {
    name: "building_demolitions",
    description: "Private and city-related demolition records.",
    example: "Aggregate demolition records by status or date bucket.",
  },
  {
    name: "vacant_property_indicators_points",
    description: "Likely vacant property point indicators from city administrative datasets.",
    example: "Find likely vacant indicators near a coordinate with caveats.",
  },
  {
    name: "neighborhood_boundaries",
    description: "OpenDataPhilly neighborhood GeoJSON boundaries.",
    example: "Resolve a neighborhood boundary before boundary-scoped queries.",
  },
  {
    name: "council_districts_2024",
    description: "Philadelphia City Council district boundaries for 2024.",
    example: "Fetch a council district geometry by district number.",
  },
  {
    name: "zip_code_boundaries",
    description: "Philadelphia ZIP Code polygon boundaries.",
    example: "Query supported records within ZIP 19120.",
  },
  {
    name: "police_district_boundaries",
    description: "Philadelphia Police District boundaries.",
    example: "Resolve police district geography for public safety context.",
  },
];

const implementedTools = [
  ["search_datasets", "Search the curated Philadelphia civic dataset registry."],
  ["get_dataset_schema", "Inspect fields, geometry type, filters, and sample records."],
  ["query_dataset", "Query records with filters, selected fields, limits, offsets, and ordering."],
  ["query_nearby", "Find nearby records for supported spatial datasets."],
  ["aggregate_dataset", "Count or count-distinct records by group fields and date buckets where supported."],
  ["query_within_boundary", "Query supported spatial records inside a resolved civic boundary."],
  ["get_boundary", "Fetch neighborhood, council district, ZIP, or police district boundaries."],
  ["civic_question_helper", "Recommend datasets, joins, caveats, and follow-up tool calls."],
];

const providerNotes = [
  "CARTO SQL API",
  "ArcGIS FeatureServer",
  "Static GeoJSON fallback",
  "Source attribution",
  "Warnings",
  "Safe limits",
  "retrieved_at",
  "Provider capabilities",
];

const plannedExamples = [
  "list_datasets",
  "query_records",
  "nearby_records",
  "recommend_civic_data_workflow",
  "search_properties",
  "get_permits_by_address",
  "query_311_requests",
  "lookup_zoning_overlay",
  "find_neighborhood_context",
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 10h11m0 0-4.25-4.25M15 10l-4.25 4.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ivory text-ink">
      <div className="site-background" />
      <DecorativePhillyObjects />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="/" className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-parchment text-sm font-bold text-navy shadow-sm">
            PA
          </span>
          <span className="font-semibold tracking-[0.01em] text-navy">Philadelphia Civic Data MCP</span>
        </a>
        <nav aria-label="Documentation navigation" className="hidden items-center gap-8 text-sm font-medium text-navy/70 md:flex">
          <a href="/#datasets" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Datasets
          </a>
          <a href="/#tools" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Tools
          </a>
          <a href="/docs" className="text-navy transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Docs
          </a>
          <a href="/#access" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Access
          </a>
        </nav>
        <a
          href="/#access"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Connect MCP
          <ArrowIcon />
        </a>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-12 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl leading-tight text-navy sm:text-6xl">
            Philadelphia Data MCP documentation
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-navy/70">
            Connect AI clients and civic applications to Philadelphia public data through structured MCP tools and resources.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
        <article className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-card backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">What is MCP?</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-navy">A standard interface for AI context.</h2>
          <p className="mt-4 text-sm leading-7 text-navy/70">
            MCP, or Model Context Protocol, gives AI clients a standard way to discover tools, call them with structured inputs, and read resources. Philadelphia Data MCP wraps local civic datasets behind predictable read-only tools so agents and applications can query public records without brittle scraping.
          </p>
        </article>

        <article className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-card backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">How this server helps</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Discovering datasets",
              "Inspecting schemas",
              "Querying records",
              "Filtering fields, limits, offsets, and ordering",
              "Running nearby/geospatial queries",
              "Fetching civic boundaries",
              "Aggregating supported datasets",
              "Querying supported records within boundaries",
              "Recommending datasets, joins, caveats, and tool calls",
            ].map((item) => (
              <div key={item} className="rounded-md border border-navy/10 bg-parchment/62 px-4 py-3 text-sm font-medium text-navy/72">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Dataset coverage</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-navy">Civic records documented for agent workflows.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-navy/66">
            Coverage uses the actual registry dataset IDs exposed by the MCP server.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {datasetCoverage.map((dataset) => (
            <article key={dataset.name} className="rounded-lg border border-white/70 bg-white/56 p-5 shadow-card backdrop-blur-xl">
              <h3 className="break-words font-mono text-sm font-bold text-navy">{dataset.name}</h3>
              <p className="mt-4 text-sm leading-6 text-navy/68">{dataset.description}</p>
              <p className="mt-4 rounded-md border border-gold/24 bg-gold/10 p-3 text-xs font-semibold leading-5 text-navy/68">
                Example use: {dataset.example}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <article className="rounded-lg border border-navy/10 bg-navy p-6 text-white shadow-luxe">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-soft">Implemented tools</p>
          <div className="mt-5 grid gap-3">
            {implementedTools.map(([name, description]) => (
              <div key={name} className="rounded-md border border-white/12 bg-white/[0.06] p-4">
                <div className="font-mono text-sm font-bold text-white">{name}</div>
                <p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-card backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Provider behavior</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-navy">Clear caveats instead of invented certainty.</h2>
          <p className="mt-4 text-sm leading-7 text-navy/68">
            The server reports source attribution, warnings, provider capabilities, and retrieved timestamps so clients can plan around what each source supports.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {providerNotes.map((note) => (
              <span key={note} className="rounded-full border border-navy/10 bg-parchment/70 px-3 py-2 font-mono text-xs font-semibold text-navy/68">
                {note}
              </span>
            ))}
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-civicred/80">Planned/example aliases</p>
          <p className="mt-3 text-sm leading-7 text-navy/64">
            These friendly names are documentation examples only until matching aliases are registered by the server.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {plannedExamples.map((tool) => (
              <span key={tool} className="rounded-full border border-navy/10 bg-white/58 px-3 py-2 font-mono text-xs font-semibold text-navy/64">
                {tool}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="code-panel rounded-lg border border-white/70 bg-[#111f38] p-5 shadow-luxe sm:p-7">
          <div className="mb-5 border-b border-white/10 pb-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-soft">Example request and response</p>
            <p className="mt-2 text-sm text-white/58">Illustrative JSON for real MCP tool calls.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/24 p-4 text-xs leading-6 text-white/86"><code>{`{
  "tool": "aggregate_dataset",
  "input": {
    "dataset_id": "311_service_requests",
    "group_by": ["service_name"],
    "metrics": [{ "op": "count", "as": "case_count" }],
    "limit": 25
  }
}`}</code></pre>
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/24 p-4 text-xs leading-6 text-white/86"><code>{`{
  "dataset_id": "311_service_requests",
  "source": { "name": "OpenDataPhilly" },
  "rows": [{ "service_name": "Graffiti", "case_count": 42 }],
  "warnings": [],
  "retrieved_at": "..."
}`}</code></pre>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
        <article className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-card backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Source notes and caveats</p>
          <p className="mt-4 text-sm leading-7 text-navy/70">
            Public civic datasets can have update delays, schema changes, missing coordinates, inconsistent addresses, and source-specific definitions. Treat results as structured public-data context, then inspect source notes before publishing findings or making decisions.
          </p>
        </article>
        <article className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-card backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Local development</p>
          <div className="mt-4 grid gap-3 font-mono text-xs text-navy/72">
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm install</code>
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm run build</code>
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm start</code>
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm run dev</code>
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm test</code>
            <code className="rounded-md border border-navy/10 bg-parchment/70 p-3">npm run typecheck</code>
          </div>
        </article>
      </section>
    </main>
  );
}
