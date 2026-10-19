# 20/10 Pixel Arcade — Lucky Gift Claw Machine

A small mobile-friendly pixel-art claw machine for Vietnamese Women's Day. Built with plain **HTML, CSS, JavaScript and JSON**. No Node.js, npm, React, TypeScript, build tools, API keys or backend.

## Run it

1. Open this repository in GitHub Codespaces or download the files.
2. Use the VS Code **Live Server** extension to open `index.html`.
3. If using GitHub Pages, publish the repository from **Settings → Pages**. The game is static and can run without a build step.

> Do not open `index.html` as a direct `file://` URL if the browser blocks loading JSON. Use Live Server or a static web host so `rewards.json` can be fetched.

## Customize the gifts

Edit `rewards.json`. Each item has:
- `name`: gift title
- `emoji`: icon shown in the reward popup
- `rarity` and `rarityLabel`: category labels
- `weight`: relative chance of being selected
- `message`: the greeting shown to the player

The weights currently total 100. They are relative probabilities; update them as you like.

## Controls

- Move the claw with the on-screen left/right buttons or keyboard arrow keys / A and D.
- Press **GRAB** (or Space) to try to catch a gift.
- A successful catch opens a gift and its greeting.
- Use **Sao chép lời chúc** to copy the greeting.

Everything runs in the visitor's browser. Play counts are per page session; there is no shared counter or database.
