const datasetCards = [
  {
    name: "opa_properties",
    description: "Parcel, ownership, valuation, and assessment context from OPA records.",
    meta: ["Parcels", "OPA", "Geo"],
  },
  {
    name: "permits",
    description: "Building and zoning permits linked to addresses, dates, and work types.",
    meta: ["L&I", "Address", "History"],
  },
  {
    name: "311_requests",
    description: "Service requests, case status, locations, categories, and civic response signals.",
    meta: ["311", "Status", "Time"],
  },
  {
    name: "zoning_overlays",
    description: "Base zoning, overlay districts, planning constraints, and review context.",
    meta: ["Zoning", "Planning", "Map"],
  },
  {
    name: "crime_incidents",
    description: "Public safety records prepared for careful, source-aware neighborhood analysis.",
    meta: ["Safety", "Public", "Spatial"],
  },
  {
    name: "septa_routes",
    description: "Transit route geometry and access context for mobility-aware applications.",
    meta: ["Transit", "Routes", "Access"],
  },
  {
    name: "neighborhoods",
    description: "Neighborhood, district, ZIP, and council boundaries for local joins.",
    meta: ["Boundaries", "Local", "Join"],
  },
  {
    name: "census_context",
    description: "Census-style indicators structured for research, reporting, and civic workflows.",
    meta: ["Context", "Demographics", "Area"],
  },
];

const toolNames = [
  "search_properties",
  "get_permits_by_address",
  "query_311_requests",
  "lookup_zoning_overlay",
  "find_neighborhood_context",
];

const trustPoints = [
  "Philadelphia-first coverage across parcels, permits, boundaries, and public service records.",
  "Transparent source notes and query limits designed for public-data reliability.",
  "Structured tool calls for AI agents, dashboards, research workflows, and civic applications.",
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
    { label: "opa_properties", className: "left-[3%] top-[10%] md:left-[2%] md:top-[18%]" },
    { label: "permits", className: "right-[8%] top-[7%] md:right-[5%] md:top-[16%]" },
    { label: "311_requests", className: "left-[0%] top-[45%] md:left-[4%]" },
    { label: "zoning_overlays", className: "right-[0%] top-[39%] md:right-[2%]" },
    { label: "crime_incidents", className: "left-[12%] bottom-[7%] md:left-[14%]" },
    { label: "septa_routes", className: "right-[15%] bottom-[5%] md:right-[14%]" },
    { label: "neighborhoods", className: "left-[36%] bottom-[0%]" },
  ];

  return (
    <div className="hero-object relative mx-auto h-[440px] w-full max-w-[760px] sm:h-[520px]" aria-label="Pennsylvania civic data network illustration">
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
          <radialGradient id="phillyGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(508 326) rotate(90) scale(68)">
            <stop stopColor="#fff7cc" />
            <stop offset="0.35" stopColor="#f2d28a" stopOpacity="0.92" />
            <stop offset="1" stopColor="#c9972e" stopOpacity="0" />
          </radialGradient>
          <filter id="premiumShadow" x="110" y="58" width="520" height="392" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="30" stdDeviation="28" floodColor="#112748" floodOpacity="0.24" />
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.42" />
          </filter>
          <clipPath id="paClip">
            <path d="M191 154 565 126 586 196 556 215 568 265 535 286 522 340 487 377 405 363 320 389 228 358 214 293 180 268 193 218 178 190Z" />
          </clipPath>
        </defs>

        <path className="connector connector-a" d="M507 326 C420 205 289 158 122 128" />
        <path className="connector connector-b" d="M507 326 C560 210 618 152 681 116" />
        <path className="connector connector-c" d="M507 326 C385 312 226 302 91 269" />
        <path className="connector connector-d" d="M507 326 C587 285 646 252 721 232" />
        <path className="connector connector-e" d="M507 326 C400 386 266 414 149 456" />
        <path className="connector connector-f" d="M507 326 C555 388 608 433 663 468" />
        <path className="connector connector-g" d="M507 326 C484 392 430 452 380 498" />

        <g filter="url(#premiumShadow)">
          <path
            d="M209 172 583 144 604 214 574 233 586 283 553 304 540 358 505 395 423 381 338 407 246 376 232 311 198 286 211 236 196 208Z"
            fill="#071a32"
            opacity="0.24"
          />
          <path
            d="M191 154 565 126 586 196 556 215 568 265 535 286 522 340 487 377 405 363 320 389 228 358 214 293 180 268 193 218 178 190Z"
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
            d="M204 166 561 138 574 178 C463 167 331 176 205 206Z"
            fill="#fffdf7"
            opacity="0.28"
          />
          <circle cx="508" cy="326" r="70" fill="url(#phillyGlow)" />
          <circle cx="508" cy="326" r="11" fill="#f2d28a" stroke="#fffaf0" strokeWidth="4" />
          <circle cx="508" cy="326" r="22" fill="none" stroke="#f2d28a" strokeWidth="2" opacity="0.74" />
          <circle cx="508" cy="326" r="35" fill="none" stroke="#112748" strokeWidth="1.5" opacity="0.32" />
          <path d="M496 315 509 307 522 316 521 331 508 340 495 331Z" fill="#112748" opacity="0.88" />
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

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#" className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-parchment text-sm font-bold text-navy shadow-sm">
            PA
          </span>
          <span className="font-semibold tracking-[0.01em] text-navy">Philadelphia Data MCP</span>
        </a>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm font-medium text-navy/70 md:flex">
          {["Datasets", "Tools", "Docs", "Access"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="transition hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {link}
            </a>
          ))}
        </nav>
        <a
          href="#access"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Start querying
          <ArrowIcon />
        </a>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:pt-12">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <div className="mb-7 inline-flex items-center rounded-full border border-gold/40 bg-white/42 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-navy/72 shadow-sm backdrop-blur">
            Philadelphia civic data, agent-ready.
          </div>
          <h1 className="font-display text-5xl leading-[0.95] text-navy sm:text-6xl lg:text-7xl xl:text-[6.5rem]">
            Access <em className="text-civicred">Philadelphia&apos;s</em> public data through one powerful MCP.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-navy/72 lg:mx-0">
            Search, query, and connect property, permits, 311, zoning, transit, and neighborhood data from a single developer-friendly interface.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#datasets"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy shadow-card transition hover:-translate-y-0.5 hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:w-auto"
            >
              Explore datasets
              <ArrowIcon />
            </a>
            <a
              href="#docs"
              className="inline-flex w-full items-center justify-center rounded-full border border-navy/16 bg-white/48 px-6 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-navy/34 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:w-auto"
            >
              View docs
            </a>
          </div>
          <div className="mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-2xl border border-white/70 bg-white/62 p-3 text-left shadow-card backdrop-blur-xl lg:mx-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy text-gold-soft">
              <SearchIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy/48">Ask for a parcel, permit, address, or neighborhood...</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-civicred/80">MCP query console</p>
            </div>
          </div>
        </div>

        <HeroObject />
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
            Premium cards, practical metadata, and source-aware datasets for applications that need local context without brittle scraping.
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
            The civic data layer for Philadelphia agents and applications, shaped as predictable calls your product can inspect, compose, and trust.
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
  "tool": "search_properties",
  "input": {
    "address": "1400 John F Kennedy Blvd",
    "include": ["opa", "permits", "zoning", "311"]
  }
}`}</code></pre>
            <pre className="overflow-x-auto rounded-md border border-white/10 bg-black/24 p-4 text-xs leading-6 text-white/86"><code>{`{
  "city": "Philadelphia",
  "state": "PA",
  "datasets": [
    "opa_properties",
    "permits",
    "zoning_overlays"
  ],
  "status": "ready"
}`}</code></pre>
          </div>
          <div className="mt-5 rounded-md border border-gold/24 bg-gold/10 p-4">
            <p className="text-sm leading-7 text-gold-soft">
              Local context, structured for AI-native workflows: parcels, public records, spatial joins, and source-aware caveats in one endpoint.
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
          One MCP interface for parcels, permits, neighborhoods, and public records, ready for developers, researchers, journalists, and civic builders.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Start querying
            <ArrowIcon />
          </a>
          <a
            href="#docs"
            className="inline-flex items-center justify-center rounded-full border border-navy/16 bg-white/58 px-6 py-3 text-sm font-bold text-navy shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/84 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Read documentation
          </a>
        </div>
      </section>
    </main>
  );
}
