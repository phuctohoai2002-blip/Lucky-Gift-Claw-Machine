# Lucky Pixel — 20/10 Pixel-Art Claw Machine

A small, mobile-friendly pixel-art claw machine for Vietnamese Women's Day. Built with plain **HTML, CSS, JavaScript and JSON**. No Node.js, npm, React, TypeScript, build tools, API keys or backend.

## Files

- `index.html` — page structure
- `style.css` — retro pixel-art styling and responsive layout
- `game.js` — canvas drawing, claw controls, pickup animation and reward reveal
- `rewards.json` — editable prize types, colors, sizes, probabilities and greetings

## Run it

Open `index.html` with the VS Code **Live Server** extension, or publish the repository using GitHub Pages. Use a local/static web server because the game loads `rewards.json` with `fetch()`; opening the HTML directly as a `file://` URL may block the JSON request.

## Customize prizes

Edit `rewards.json`. Each prize has:
- `name`: title shown after a successful grab
- `detail`: greeting text
- `type`: visual style such as `box`, `envelope`, `ticket`, `cup`, `star`, `flower`, `handbag`, `perfume`, `cupcake` or `gem`
- `color`: pixel-art color in hex format
- `size`: approximate size in pixels
- `weight`: relative selection chance
- `rarity`: `common` or `rare`

The current machine displays a mix of prize shapes, not just gift boxes. Keep ten entries to fill all display positions.

## Controls

Use the left/right buttons or keyboard arrow keys to position the claw, then press **GẮP QUÀ** or Space. The claw moves to the nearest item, descends, picks it up, lifts it, and reveals the greeting. **CHƠI LẠI** resets the game.

All gameplay runs in the visitor's browser. There is no shared score counter or database.
