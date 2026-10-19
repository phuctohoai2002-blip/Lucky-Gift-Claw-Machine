# Lucky Pixel — 20/10 Pixel-Art Claw Machine

A small, mobile-friendly pixel-art claw machine for Vietnamese Women's Day. Built with plain **HTML, CSS, JavaScript and JSON**. No Node.js, npm, React, TypeScript, build tools, API keys or backend.

## Files

- `index.html` — page structure
- `style.css` — retro pixel-art styling, custom fonts, responsive no-scroll layout, and popup styling
- `font/kvn-97.ttf` — display font for the main headings
- `font/0307-LNTH-TwistyPixel.ttf` — interface font for all other text
- `game.js` — canvas drawing, randomized prize appearance, claw controls, pickup animation, and randomized reward reveal
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

The current machine displays a mix of prize shapes, not just gift boxes. Prize size, color, placement, and tilt vary randomly each load. The result greeting is selected independently on every successful grab, so the same visible object can lead to different results. Keep ten entries to fill all display positions.

## Controls

Use the left/right buttons or keyboard arrow keys to position the claw, then press **GẮP QUÀ** or Space. The claw moves to the nearest item, descends, picks it up, lifts it, and reveals a randomized greeting in a popup. Use **? CÁCH GẮP QUÀ** for the instruction popup. The interface fits the viewport without page scrolling.

All gameplay runs in the visitor's browser. There is no shared score counter or database.
