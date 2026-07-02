import { DecorativePhillyObjects } from "./components/DecorativePhillyObjects";

const datasetCards = [
  {
    name: "311_service_requests",
    description: "Philly311 service and information requests with status, category, date, ZIP, and location fields.",
    meta: ["CARTO", "311", "Daily"],
  },
  {
    name: "property_assessments",
    description: "OPA property characteristics and assessment records for parcel-level civic context.",
    meta: ["CARTO", "OPA", "Property"],
  },
  {
    name: "building_permits",
    description: "L&I building and zoning permits with permit types, statuses, dates, and addresses.",
    meta: ["CARTO", "L&I", "Permits"],
  },
  {
    name: "li_violations",
    description: "Licenses and Inspections code violations with case, status, date, address, and district fields.",
    meta: ["CARTO", "L&I", "Violations"],
  },
  {
    name: "building_demolitions",
    description: "Private and city-related demolition records with permit, status, date, and address context.",
    meta: ["CARTO", "Demolition", "Spatial"],
  },
  {
    name: "vacant_property_indicators_points",
    description: "Likely vacant property indicators from city administrative sources, returned with clear caveats.",
    meta: ["ArcGIS", "Vacancy", "Points"],
  },
  {
    name: "neighborhood_boundaries",
    description: "OpenDataPhilly neighborhood polygons for boundary lookup and civic geography planning.",
    meta: ["GeoJSON", "Neighborhood", "Boundary"],
  },
  {
    name: "council_districts_2024",
    description: "City Council district boundaries for 2024 with ArcGIS FeatureServer support.",
    meta: ["ArcGIS", "Council", "Boundary"],
  },
  {
    name: "zip_code_boundaries",
    description: "Philadelphia ZIP Code polygon areas for ZIP-scoped civic questions.",
    meta: ["ArcGIS", "ZIP", "Boundary"],
  },
  {
    name: "police_district_boundaries",
    description: "Philadelphia Police District boundaries for public safety geography questions.",
    meta: ["ArcGIS", "Police", "Boundary"],
  },
];

const toolNames = [
  "search_datasets",
  "get_dataset_schema",
  "query_dataset",
  "query_nearby",
  "get_boundary",
  "civic_question_helper",
  "aggregate_dataset",
  "query_within_boundary",
];

const trustPoints = [
  "Read-only MCP access to curated Philadelphia datasets from OpenDataPhilly, CARTO, ArcGIS, and static GeoJSON sources.",
  "Every result includes source attribution, warnings, limits, and retrieved timestamps so clients can reason about uncertainty.",
  "Provider capabilities describe what the server can safely do, including schema, query, nearby, aggregation, and boundary paths.",
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

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="m20 20-4.7-4.7m2.2-5.05a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KeystoneMark() {
  return (
    <svg aria-hidden="true" className="h-12 w-12" viewBox="0 0 96 96" fill="none">
      <path
        d="M23 14h50v22l-9 8v18L48 82 32 62V44l-9-8V14Z"
        fill="url(#keystoneGradient)"
        stroke="#c9972e"
        strokeWidth="2"
      />
      <circle cx="60" cy="56" r="5" fill="#f2d28a" />
      <defs>
        <linearGradient id="keystoneGradient" x1="24" y1="17" x2="76" y2="81" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff7df" />
          <stop offset="0.46" stopColor="#d8a94d" />
          <stop offset="1" stopColor="#112748" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HeroObject() {
  const floatingCards = [
    { label: "311_service_requests", className: "left-[3%] top-[10%] md:left-[2%] md:top-[18%]" },
    { label: "building_permits", className: "right-[8%] top-[7%] md:right-[5%] md:top-[16%]" },
    { label: "property_assessments", className: "left-[0%] top-[45%] md:left-[4%]" },
    { label: "li_violations", className: "right-[0%] top-[39%] md:right-[2%]" },
    { label: "neighborhood_boundaries", className: "left-[12%] bottom-[7%] md:left-[14%]" },
    { label: "zip_code_boundaries", className: "right-[15%] bottom-[5%] md:right-[14%]" },
    { label: "query_nearby", className: "left-[36%] bottom-[0%]" },
  ];
  const paPath =
    "M178 150 L553 150 L566 181 L558 204 L580 228 L560 252 L572 283 L549 306 L540 338 L506 366 L220 366 L210 318 L178 300 Z";
  const paShadowPath =
    "M198 172 L573 172 L586 203 L578 226 L600 250 L580 274 L592 305 L569 328 L560 360 L526 388 L240 388 L230 340 L198 322 Z";

  return (
    <div className="hero-object relative mx-auto h-[420px] w-full max-w-[760px] sm:h-[480px]" aria-label="Pennsylvania civic data network illustration">
      <div className="absolute inset-x-8 top-14 h-[330px] rounded-full bg-gold-soft/30 blur-3xl" />
      <div className="absolute left-1/2 top-[47%] h-[280px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/10 blur-3xl" />

      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 760 520" role="img">
        <title>Philadelphia data object connected to civic datasets</title>
        <defs>
          <linearGradient id="paFace" x1="212" y1="89" x2="538" y2="394" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff8e9" />
            <stop offset="0.28" stopColor="#efd59b" />
            <stop offset="0.58" stopColor="#c9972e" />
            <stop offset="1" stopColor="#163052" />
          </linearGradient>
          <linearGradient id="paEdge" x1="230" y1="120" x2="520" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="0.55" stopColor="#d6b566" stopOpacity="0.74" />
            <stop offset="1" stopColor="#071a32" stopOpacity="0.78" />
          </linearGradient>
          <radialGradient id="phillyGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(516 343) rotate(90) scale(68)">
            <stop stopColor="#fff7cc" />
            <stop offset="0.35" stopColor="#f2d28a" stopOpacity="0.92" />
            <stop offset="1" stopColor="#c9972e" stopOpacity="0" />
          </radialGradient>
          <filter id="premiumShadow" x="110" y="58" width="520" height="392" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="30" stdDeviation="28" floodColor="#112748" floodOpacity="0.24" />
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.42" />
          </filter>
          <clipPath id="paClip">
            <path d={paPath} />
          </clipPath>
        </defs>

        <path className="connector connector-a" d="M516 343 C420 205 289 158 122 128" />
        <path className="connector connector-b" d="M516 343 C560 210 618 152 681 116" />
        <path className="connector connector-c" d="M516 343 C385 312 226 302 91 269" />
        <path className="connector connector-d" d="M516 343 C587 285 646 252 721 232" />
        <path className="connector connector-e" d="M516 343 C400 386 266 414 149 456" />
        <path className="connector connector-f" d="M516 343 C555 388 608 433 663 468" />
        <path className="connector connector-g" d="M516 343 C484 392 430 452 380 498" />

        <g filter="url(#premiumShadow)">
          <path
            d={paShadowPath}
            fill="#071a32"
            opacity="0.24"
          />
          <path
            d={paPath}
            fill="url(#paFace)"
            stroke="url(#paEdge)"
            strokeWidth="3"
          />
          <g clipPath="url(#paClip)">
            <path d="M178 190 586 196" stroke="#fff8e9" strokeOpacity="0.32" />
            <path d="M170 240 575 244" stroke="#fff8e9" strokeOpacity="0.2" />
            <path d="M207 300 543 303" stroke="#fff8e9" strokeOpacity="0.22" />
            <path d="M245 358 512 356" stroke="#fff8e9" strokeOpacity="0.2" />
            <path d="M252 151 266 374" stroke="#fff8e9" strokeOpacity="0.22" />
            <path d="M324 144 333 389" stroke="#fff8e9" strokeOpacity="0.24" />
            <path d="M395 137 405 366" stroke="#fff8e9" strokeOpacity="0.22" />
            <path d="M468 132 486 377" stroke="#fff8e9" strokeOpacity="0.2" />
            <path d="M537 128 535 338" stroke="#fff8e9" strokeOpacity="0.22" />
            <path d="M200 184 C300 225 360 250 441 330 C473 361 504 375 541 378" stroke="#ffffff" strokeOpacity="0.28" fill="none" />
            <path d="M221 342 C305 300 392 290 486 324" stroke="#102847" strokeOpacity="0.28" fill="none" />
          </g>
          <path
            d="M193 163 H545 L554 185 C436 172 309 174 190 192Z"
            fill="#fffdf7"
            opacity="0.28"
          />
          <circle cx="516" cy="343" r="70" fill="url(#phillyGlow)" />
          <path d="M516 343 L548 326" stroke="#f2d28a" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
          <text x="552" y="328" className="fill-navy text-[13px] font-bold tracking-[0.08em]">
            Philly
          </text>
          <circle cx="516" cy="343" r="11" fill="#f2d28a" stroke="#fffaf0" strokeWidth="4" />
          <circle cx="516" cy="343" r="22" fill="none" stroke="#f2d28a" strokeWidth="2" opacity="0.74" />
          <circle cx="516" cy="343" r="35" fill="none" stroke="#112748" strokeWidth="1.5" opacity="0.32" />
          <path d="M504 332 517 324 530 333 529 348 516 357 503 348Z" fill="#112748" opacity="0.88" />
        </g>
      </svg>

      {floatingCards.map((card) => (
        <div
          key={card.label}
          className={`absolute ${card.className} data-chip rounded-md border border-white/70 bg-white/62 px-3 py-2 text-[0.7rem] font-semibold text-navy shadow-card backdrop-blur-xl sm:px-4 sm:text-xs`}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle shadow-glow" />
          {card.label}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
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
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-navy/70 md:flex">
          <a href="#datasets" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Datasets
          </a>
          <a href="#tools" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Tools
          </a>
          <a href="/docs" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Docs
          </a>
          <a href="#access" className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Access
          </a>
        </nav>
        <a
          href="#access"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Connect MCP
          <ArrowIcon />
        </a>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-8 px-5 pb-8 pt-10 sm:px-8 sm:pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pt-14">
        <div className="mx-auto w-full min-w-0 max-w-3xl text-center lg:mx-0 lg:text-left">
          <h1 className="mx-auto max-w-full break-words font-display text-5xl leading-[0.95] text-navy [text-wrap:balance] sm:text-6xl lg:mx-0 lg:text-[4rem] xl:text-[4.25rem]">
            Access <em className="text-civicred">Philadelphia&apos;s</em> public data through one powerful MCP.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-navy/72 [text-wrap:pretty] lg:mx-0">
            Discover schemas, query records, aggregate counts, and resolve Philadelphia civic boundaries through a read-only Model Context Protocol server.
          </p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroObject />
        </div>

        <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#datasets"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy shadow-card transition hover:-translate-y-0.5 hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:w-auto"
            >
              Explore datasets
              <ArrowIcon />
            </a>
            <a
              href="/docs"
              className="inline-flex w-full items-center justify-center rounded-full border border-navy/16 bg-white/48 px-6 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-navy/34 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:w-auto"
            >
              View docs
            </a>
          </div>
          <div className="mx-auto mt-9 flex w-full items-center gap-3 rounded-2xl border border-white/70 bg-white/62 p-3 text-left shadow-card backdrop-blur-xl lg:mx-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold-soft">
              <SearchIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy/48">Ask for a dataset, schema, boundary, trend, or nearby record...</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-civicred/80">MCP server surface</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-7 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">What is an MCP?</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
              A shared language between AI clients and civic data.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-navy/68">
              Model Context Protocol gives AI clients a standard way to discover tools, call them with structured inputs, and read resources. The MCP server is the product; this website is documentation and discovery for developers building assistants, research workflows, and civic applications.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            {[
              ["AI client", "An assistant, app, or research workflow asks a local civic question."],
              ["MCP tools", "Structured calls validate inputs, inspect schemas, and query data with safe limits."],
              ["Philadelphia datasets", "Records return with source attribution, warnings, limits, and retrieved timestamps."],
            ].map(([title, body], index) => (
              <div key={title} className="contents">
                <article className="rounded-lg border border-white/70 bg-white/56 p-5 shadow-card backdrop-blur-xl">
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold-soft">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-navy">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-navy/64">{body}</p>
                </article>
                {index < 2 ? (
                  <div className="hidden text-gold sm:block">
                    <ArrowIcon />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="datasets" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Curated civic coverage</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-navy sm:text-5xl">
              One interface for the records Philadelphia builders reach for first.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-navy/66">
            Real registry IDs, practical metadata, and source-aware datasets for AI clients that need local context without brittle scraping.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {datasetCards.map((dataset) => (
            <article key={dataset.name} className="group rounded-lg border border-white/70 bg-white/54 p-5 shadow-card backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/76">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="break-words font-mono text-sm font-bold text-navy">{dataset.name}</h3>
                <span className="h-2.5 w-2.5 rounded-full bg-gold shadow-glow" />
              </div>
              <p className="min-h-[84px] text-sm leading-6 text-navy/68">{dataset.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {dataset.meta.map((item) => (
                  <span key={item} className="rounded-full border border-navy/10 bg-parchment/76 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.11em] text-navy/60">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="tools" className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div className="rounded-lg border border-navy/10 bg-navy p-7 text-white shadow-luxe">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-soft">MCP tools</p>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Agent-ready functions with local precision.</h2>
          <p className="mt-5 text-sm leading-7 text-white/72">
            The read-only civic data layer for Philadelphia AI clients, shaped as predictable calls your product can inspect, compose, and trust.
          </p>
          <div className="mt-8 grid gap-3">
            {toolNames.map((tool) => (
              <div key={tool} className="flex items-center justify-between rounded-md border border-white/12 bg-white/[0.06] px-4 py-3 font-mono text-sm text-white/86">
                <span>{tool}</span>
                <span className="text-gold-soft">ready</span>
              </div>
            ))}
          </div>
        </div>

        <div id="docs" className="code-panel rounded-lg border border-white/70 bg-[#111f38] p-4 shadow-luxe sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">Tool preview</p>
              <p className="mt-1 text-sm text-white/56">Structured MCP request and response</p>
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-civicred" />
              <span className="h-3 w-3 rounded-full bg-gold" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/24 p-4 text-xs leading-6 text-white/86"><code>{`{
  "tool": "query_within_boundary",
  "input": {
    "dataset_id": "building_permits",
    "boundary_type": "zip",
    "boundary_id": "19120",
    "fields": ["permitnumber", "status", "address"],
    "limit": 25
  }
}`}</code></pre>
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/24 p-4 text-xs leading-6 text-white/86"><code>{`{
  "dataset_id": "building_permits",
  "source": {
    "name": "OpenDataPhilly"
  },
  "records": [],
  "warnings": [],
  "retrieved_at": "..."
}`}</code></pre>
          </div>
          <div className="mt-5 rounded-md border border-gold/24 bg-gold/10 p-4">
            <p className="text-sm leading-7 text-gold-soft">
              Local context, structured for AI-native workflows: dataset discovery, schema inspection, safe limits, spatial queries, and source-aware caveats.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-8 rounded-lg border border-white/70 bg-white/48 p-6 shadow-card backdrop-blur-xl md:grid-cols-[0.7fr_1.3fr] md:p-9">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-gold/36 bg-parchment p-3 shadow-sm">
              <KeystoneMark />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Local-first trust</p>
              <h2 className="mt-3 font-display text-4xl leading-tight text-navy">Built for Philadelphia, Pennsylvania public data.</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {trustPoints.map((point) => (
              <p key={point} className="rounded-md border border-navy/10 bg-parchment/60 p-4 text-sm leading-7 text-navy/70">
                {point}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="relative z-10 mx-auto w-full max-w-6xl px-5 py-20 text-center sm:px-8 lg:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-civicred">Access</p>
        <h2 className="mx-auto mt-4 max-w-4xl font-display text-5xl leading-tight text-navy sm:text-6xl">
          Build with Philadelphia&apos;s civic data layer.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-navy/68">
          One MCP interface for Philadelphia 311, properties, permits, violations, demolitions, vacancy indicators, and boundaries.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/docs"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Connect MCP
            <ArrowIcon />
          </a>
          <a
            href="/docs"
            className="inline-flex items-center justify-center rounded-full border border-navy/16 bg-white/58 px-6 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/84 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Read documentation
          </a>
        </div>
      </section>
    </main>
  );
}
