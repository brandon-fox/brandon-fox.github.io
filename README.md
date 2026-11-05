# brandon-fox.github.io

> **Status:** live at https://brandon-fox.github.io — personal site, maintained; custom domain pending.

The source of my personal site: who I am as an engineer, the method I work by (Axiom-Driven Engineering), the projects that demonstrate it, and what I write.

Built with [Astro](https://astro.build) as plain static HTML. No analytics, no cookies, no client-side framework.

## Invariants this repository enforces on itself

- `npm run check` fails the build if any essay is missing a title, description, date or draft flag.
- The ADE axioms (A1–A9) run on every pull request through [First-ADE/.github](https://github.com/First-ADE/.github).
- Every outbound link in the built site is checked on every pull request.
- Every commit is signed.

## Run it

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # writes dist/
npm run check    # front-matter check
```

## Layout

```
src/pages/            index, about, writing/
src/content/writing/  essays as Markdown with front matter (draft: true keeps one out of the build)
src/layouts/          the one page layout
src/styles/           global.css: tokens, type scale, light and dark
scripts/              check-frontmatter.mjs
.github/workflows/    deploy.yml (GitHub Pages), checks.yml (axioms, links, front matter)
```

## Independence

This is a personal project by Brandon Fox, built on my own time and equipment. It is not affiliated with, endorsed by, or derived from the work of any employer, current or former, and does not represent their views, products or practices. Licensed under the MIT License; principles at [First-ADE/PRINCIPLES.md](https://github.com/First-ADE/.github/blob/main/PRINCIPLES.md).
