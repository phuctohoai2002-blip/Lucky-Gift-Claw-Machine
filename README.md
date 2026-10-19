# 20/10 Pixel Arcade — Lucky Gift Claw Machine

A mobile-first digital gift claw machine for Vietnamese Women's Day. Built with React, TypeScript, Vite, SVG and CSS; no backend, login, API key or paid service is required.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build and preview

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Deploy free

- **Netlify:** import this GitHub repository, set build command to `npm run build`, publish directory to `dist`.
- **Vercel:** import the repository; Vite is detected automatically. Use `npm run build` and `dist` if prompted.

## Customize rewards

Edit `src/rewards.ts`. The ten reward records contain name, rarity, weight, emoji, color and message. `validateRewardWeights()` checks that weights add up to 100%; `weightedRandomReward()` throws if configuration is invalid.

## Controls and game rules

- Hold the left/right touch buttons to move the claw, or use keyboard arrow keys.
- Press **GRAB**, Space or Enter to run the grab sequence.
- The claw must be aligned within 38 SVG units of a gift. A valid target has a 78% success chance; a miss does not award a reward.
- Reward weighted random is evaluated only after a successful grab.
- Sound is opt-in and synthesized using Web Audio API.
- Share uses the browser Web Share API when available, otherwise attempts clipboard copy.

## Notes

This is a client-only experience. Play count is local to the current page session; it is not a company-wide counter. Each visitor's outcome is independent. The current art uses native SVG and emoji glyphs, so emoji appearance can vary by operating system. Run `npm run build` before deployment.
