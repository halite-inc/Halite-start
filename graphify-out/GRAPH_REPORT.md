# Graph Report - .  (2026-07-22)

## Corpus Check
- 57 files · ~229,121 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 234 nodes · 230 edges · 56 communities (16 shown, 40 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Dashboard and Statistics
- Sidebar Configuration and Cards
- External Library Dependencies
- TypeScript Compilation Options
- ESLint Linting Configurations
- App Layout and Fonts
- Favicon Retrieval and Caching
- Favicon Route API Handlers
- Project Manifest and Scripts
- Next.js Type Declarations
- Bookmark Sidebars and Actions
- Command Palette Search
- Liquid Glass Visual Effects
- Liquid Glass Removal Script
- CORS Search Suggestion API
- Liquid Glass Code Cleaning
- Liquid Glass Removal Script 2
- Next.js Webpack Config
- PostCSS Style Processing
- Image Asset: ggggg.png
- Image Asset: 361e4af5c6995898e1f2199b681e75d0.jpg
- Image Asset: 394e811daa951a2a30e0f19b25722e8c.jpg
- Image Asset: 4e74339f38795413a2e430ab49658200.jpg
- Image Asset: 5653043a08e6e352dde567710daedf88.jpg
- Image Asset: 58ac7fee727d398698a4c4ae9b1a1267.jpg
- Image Asset: 5f9f9055c52155395198972db01a3762.jpg
- Image Asset: 6290dd71200547f04787c46d8955a4d2.jpg
- Image Asset: 632c6d6ff804d08c45e4b01bf566692b.jpg
- Image Asset: 6477043ac97dee2f6cd23e3d51e10414.jpg
- Image Asset: 67af61339a0d65c4cf5b0b5b86c00452.jpg
- Image Asset: 6ba74365d655c2411f7b744d2476df63.jpg
- Image Asset: 73c65b061eae95a44174190f67c259d1.gif
- Image Asset: 92a75bd8c2f40f2091447be311f0d7c3.gif
- Image Asset: 978be530012bc92431343a1ef4befb15.jpg
- Image Asset: 9d7bfd9f4f90eada6427d80739f9e122.gif
- Image Asset: adbd0b6e8bd1e4fb6a14b03aab9c1c97.gif
- Image Asset: bc27c2d3c81c06bd3da4adb9f86dbe7e.gif
- Image Asset: c0467324cad02d02b66d89c74ed7e49f.jpg
- Image Asset: c1d7e41cec9bd996e09b39860e32e782.jpg
- Image Asset: c90c2587ff5134157801b7e5511e906e.jpg
- Image Asset: d612e199b0754540cb31d92e04828a49.jpg
- Image Asset: eebcaa10242a661b21a7349bce573160.jpg
- Image Asset: faceprep.png
- Image Asset: file.svg
- Image Asset: globe.svg
- Image Asset: next.svg
- Image Asset: raj.png
- Image Asset: rec.png
- Image Asset: vercel.svg
- Image Asset: videoframe_13462.png
- Image Asset: walp.png
- Image Asset: window.svg
- Tech Stack Documentation
- Dashboard Widgets Specification

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `fetchBestFavicon()` - 9 edges
3. `getImageObjectUrl()` - 8 edges
4. `getFaviconUrl()` - 7 edges
5. `GET()` - 6 edges
6. `saveImageBlob()` - 6 edges
7. `deleteImageBlob()` - 6 edges
8. `include` - 6 edges
9. `LeftSidebar()` - 5 edges
10. `Home()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `RightSidebar()` --references--> `react`  [EXTRACTED]
  app/components/RightSidebar.tsx → package.json
- `Home()` --calls--> `fetchBestFavicon()`  [EXTRACTED]
  app/page.tsx → app/lib/favicon.ts
- `SortableLinkCard()` --calls--> `getImageObjectUrl()`  [EXTRACTED]
  app/page.tsx → app/lib/idb.ts
- `LeftSidebar()` --calls--> `getFaviconUrl()`  [EXTRACTED]
  app/components/LeftSidebar.tsx → app/lib/favicon.ts
- `LeftSidebar()` --calls--> `deleteImageBlob()`  [EXTRACTED]
  app/components/LeftSidebar.tsx → app/lib/idb.ts

## Import Cycles
- None detected.

## Communities (56 total, 40 thin omitted)

### Community 0 - "App Dashboard and Statistics"
Cohesion: 0.07
Nodes (11): Border Radius Migration Logic, App, UsageStatisticsProps, App, Bookmark, defaultApps, defaultBookmarks, defaultWidgets (+3 more)

### Community 1 - "Sidebar Configuration and Cards"
Cohesion: 0.14
Nodes (18): App Card Border Radius Implementation, App, LeftSidebar(), LeftSidebarProps, ModernDropdownProps, SegmentedControlProps, Widget, getFaviconUrl() (+10 more)

### Community 2 - "External Library Dependencies"
Cohesion: 0.09
Nodes (23): @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, maath, next, dependencies, @dnd-kit/core, @dnd-kit/sortable (+15 more)

### Community 3 - "TypeScript Compilation Options"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 4 - "ESLint Linting Configurations"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 5 - "App Layout and Fonts"
Cohesion: 0.17
Nodes (10): bebasNeue, geistMono, geistSans, metadata, outfit, pacifico, playfair, poppins (+2 more)

### Community 6 - "Favicon Retrieval and Caching"
Cohesion: 0.31
Nodes (9): cache, extractHostname(), fetchBestFavicon(), fetchViaProxy(), prefetchFavicon(), probeImage(), raceAll(), IMPORTANT: Only include sources that ALWAYS return HTTP 200. (+1 more)

### Community 7 - "Favicon Route API Handlers"
Cohesion: 0.39
Nodes (8): BLOCKED_HOSTS, cdnCandidates(), extractFaviconUrls(), FETCH_HEADERS, GET(), isValidHostname(), isValidImageUrl(), readPartial()

### Community 8 - "Project Manifest and Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 9 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 10 - "Bookmark Sidebars and Actions"
Cohesion: 0.33
Nodes (5): Bookmark, RightSidebar(), RightSidebarProps, react, react

### Community 11 - "Command Palette Search"
Cohesion: 0.40
Nodes (3): App, Command, CommandPaletteProps

### Community 13 - "Liquid Glass Removal Script"
Cohesion: 0.40
Nodes (3): files, fs, path

### Community 14 - "CORS Search Suggestion API"
Cohesion: 0.83
Nodes (3): corsHeaders(), GET(), OPTIONS()

## Knowledge Gaps
- **129 isolated node(s):** `FETCH_HEADERS`, `fs`, `files`, `App`, `CommandPaletteProps` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `External Library Dependencies` to `Project Manifest and Scripts`, `Bookmark Sidebars and Actions`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `react` connect `Bookmark Sidebars and Actions` to `External Library Dependencies`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **What connects `FETCH_HEADERS`, `fs`, `files` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Dashboard and Statistics` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Sidebar Configuration and Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.1422924901185771 - nodes in this community are weakly interconnected._
- **Should `External Library Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `TypeScript Compilation Options` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._