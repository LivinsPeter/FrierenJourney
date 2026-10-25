# Codex Build Brief: Frieren-Inspired GBA-Style RPG

## Project goal

Build a small, playable browser RPG inspired by the world, atmosphere, and journey structure of *Frieren: Beyond Journey's End*, presented with authentic low-resolution Game Boy Advance-era pixel-art aesthetics.

This is a **one-hour MVP**, not a full RPG. Prioritize a complete playable loop and a convincing atmosphere over a large map or many systems.

The game should feel quiet, wistful, exploratory, and occasionally funny. The central experience is travelling through a fantasy world after the great evil has already been defeated: visiting small settlements, speaking with people, finding unusual spells, helping with modest problems, and encountering monsters on the road.

For this personal fan-project prototype, use original, programmatically drawn placeholder pixel art. Do not download, reproduce, or embed ripped sprites, music, screenshots, logos, or other assets from the anime or manga. Keep the project local and non-commercial. If the project is ever published, clearly label it as an unofficial fan project and review applicable rights and platform rules.

---

## 1. Technology and setup

Use only:
- HTML5
- CSS3
- Vanilla JavaScript
- HTML Canvas API

Do not use React, TypeScript, npm, bundlers, external APIs, or a game engine for this MVP.

The game must run in Chrome or Edge. It should work by opening `index.html`; if browser restrictions make that unreliable, provide a simple local-server command in the README.

### Project folder

Create the project in:

`D:\Projects\FrierenJourney`

### Required files

```text
FrierenJourney/
├── index.html
├── style.css
├── game.js
└── README.md
```

Create all files in the opened workspace. Do not merely print code in chat.

### Rendering requirements

- Internal canvas resolution: **240 × 160 pixels**.
- Scale the canvas up without changing its aspect ratio.
- Use nearest-neighbor / crisp pixel rendering.
- Use a restrained fantasy palette: muted greens, warm stone, soft sky blues, forest greens, brown timber, and gentle sunset tones.
- Use tile-based environments, compact character sprites, readable outlines, and minimal but purposeful animation.
- Avoid modern dashboard-like UI, gradients, emoji characters, 3D effects, and overly bright neon colours.
- Draw original placeholder sprites and scenery using Canvas primitives or small pixel arrays. Keep art functions separate so sprites can be replaced later.

---

## 2. Creative direction

### Working title

**Beyond the Long Road**

Subtitle: *A quiet fantasy journey*

### Tone

Aim for:
- Peaceful travel through a world recovering from a past conflict.
- Small, human stories rather than constant high-stakes combat.
- A sense that old memories and forgotten places matter.
- Gentle humour in conversations and optional discoveries.
- Magic that feels mysterious, practical, and sometimes delightfully mundane.

Do not make every interaction about fighting. Exploration, conversations, and a small side quest should be equally important.

### Player character

For the fastest MVP, the player controls an **original elf mage inspired by classic fantasy anime RPGs**, rather than requiring a complex recreation of every canonical character. Give the character:
- Pale hair, a dark outfit, and a small staff.
- Four-direction movement.
- A simple 2–3-frame walking animation if feasible.
- A facing direction used for interaction.
- A short opening introduction explaining that the character is travelling through the continent after the Demon King’s defeat.

If the implementation can reliably support a recognisable fan-game protagonist without delaying the MVP, the player may instead be Frieren. Use a simple original placeholder sprite and do not copy official art. The game should not depend on detailed sprite animation to be playable.

### Companions

Represent a small travelling party using simple sprites or compact status portraits:
- A serious young mage companion.
- A brave but nervous warrior companion.

For a one-hour build, they can appear as party portraits and battle participants, or follow the player as simple overworld sprites if this is straightforward. Do not spend most of the hour implementing party-following behaviour.

### Narrative premise

The great Demon King has already been defeated. The player is travelling north along an old road, visiting settlements and learning about the people who live there. In a quiet village, a resident asks for help finding a lost keepsake near an old stone shrine. Along the way, the player can talk to travellers, discover a small practical spell, and fight one or two monsters.

Use short, original dialogue. Capture the themes of long-lived travellers, fleeting human lives, memories, and small everyday discoveries without copying dialogue from the anime or manga.

---

## 3. MVP gameplay and completion criteria

The game is complete when a player can:

1. Start from a title screen.
2. Explore a small village and a connecting forest road.
3. Walk in four directions and collide with obstacles.
4. Speak to at least three NPCs.
5. Accept and complete one simple side quest.
6. Find one spell scroll or magical item.
7. Trigger a wild monster encounter.
8. Finish a turn-based battle using at least two actions.
9. Return safely to the overworld.
10. Reach a clear end point for the short demo.

If time is running short, preserve these core functions and simplify art or map size. Do not add complex systems before the core loop works.

---

## 4. World map

Build one compact, connected map with two areas:

### Area A: Linden Village

Include:
- A central dirt or cobblestone path.
- Four to six small timber-and-stone houses.
- A notice board or village well.
- A few trees, flower patches, fences, and decorative objects.
- Three NPCs with distinct dialogue.
- An exit path leading north or east to the forest road.

The village should feel inhabited and calm. Use small decorative details like flowers, chimney smoke if easy, and a few varied roof colours. Keep all decorations readable at 240 × 160.

### Area B: Old Forest Road

Include:
- A narrow winding path.
- Tall grass, trees, rocks, and a small stone shrine.
- A chest or magical object.
- One or two monster encounter zones.
- A return path to the village.

Make the route easy to understand. The player must not become trapped behind scenery or blocked by decorative tiles.

### Map implementation

Use a tile grid. A tile size of 16 pixels is recommended, yielding a 15 × 10 visible grid at the target resolution.

Represent map tiles and collision properties in arrays or a similarly clear structure. Separate:
- Ground tiles.
- Solid obstacles.
- Interactable objects.
- Encounter tiles.
- Map transitions.

Use a simple camera only if needed. A fixed viewport is acceptable if the maps are small and the player remains visible. Avoid building a large scrolling world in this MVP.

---

## 5. Movement and controls

Implement:
- Arrow keys or WASD to move.
- Space or Enter to interact / advance dialogue.
- Escape to close an overlay or open the help panel.
- Keyboard controls for all battle choices.

Requirements:
- Prevent walking through walls, trees, buildings, water, rocks, and fences.
- Use a consistent movement speed.
- Prevent diagonal movement unless deliberately implemented and tested.
- Avoid repeated interactions while a key is held.
- Track the direction the player is facing.
- Interact with the object or NPC directly in front of the player.
- Pause movement during dialogue, menus, and battle.
- Ensure window resizing does not distort the pixel-art canvas.

---

## 6. NPCs and dialogue

Create at least three NPCs:

### NPC 1: Village elder
Explains that the world has been peaceful for years, but travellers still pass through the village. Mentions an old shrine on the forest road.

### NPC 2: Young villager
Provides a small humorous exchange about a mundane spell or a peculiar local rumour. The humour should be gentle and brief.

### NPC 3: Travelling merchant or guard
Gives a practical hint about monsters and the magical item found on the road.

Use original dialogue rather than lines copied from the source material.

### Dialogue box behaviour
- Place a dark, bordered dialogue box along the bottom of the screen.
- Use a readable pixel-style font if available locally; otherwise use a crisp system font.
- Show a short speaker label.
- Display text in manageable chunks.
- Space or Enter advances to the next line.
- A visible marker indicates when the player can continue.
- Close the dialogue after the final line.
- Do not allow movement or a second interaction while dialogue is open.

NPCs should turn toward the player when practical, but this is optional if it risks delaying core functionality.

---

## 7. Small side quest: The Lost Keepsake

Create one simple, complete side quest.

1. The village elder or villager explains that a keepsake has been lost near the old shrine.
2. The player travels along the forest road.
3. The player interacts with a glowing or distinctive object near the shrine.
4. The game updates the quest state.
5. The player returns to the NPC and receives a reward: a potion, a small amount of gold, or a useful spell scroll.
6. The NPC’s dialogue changes to confirm completion.

Display a small quest hint only when useful. Avoid building a full quest-log interface; a short objective line is enough.

The quest must be testable from beginning to end and must not reset when the player enters a battle.

---

## 8. Magic and collectables

Include one collectible item: **Minor Utility Spell Scroll**.

When collected, show a brief description such as:
“A simple spell used to make small everyday tasks easier.”

This should evoke the setting’s interest in unusual, practical magic without copying a specific canonical spell description.

Optional: add one environmental interaction where the spell reveals a hidden flower patch or lights an old shrine. Only implement this after the quest and battle loop work.

Track collected items in JavaScript state. Do not require a complex inventory screen; a short notification is sufficient.

---

## 9. Monster encounters and combat

### Encounters

Use one or two original fantasy monsters, such as:
- A small moss-covered forest beast.
- A floating shadow wisp.

Create simple, distinct silhouettes using original pixel art. Encounters should happen only in designated tall-grass or forest tiles, with a modest random chance after movement. Avoid triggering battles on every step.

### Battle screen

Switch from the overworld to a dedicated turn-based battle view. Display:
- Player party member or mage portrait/sprite.
- Enemy monster sprite.
- Names and health bars.
- A short battle message.
- A compact menu with the following actions:
  - **Magic** — deals reliable magical damage.
  - **Staff Strike** — weaker physical damage.
  - **Potion** — restores health and consumes one potion.
  - **Run** — attempts to escape from an ordinary encounter.

If the party system is simple enough, allow the mage and warrior companion to have different attacks. Otherwise, use the player mage alone and represent the companion in the party status UI.

### Combat rules
- Turns alternate clearly.
- Damage values are deterministic or use a small random range.
- HP bars update immediately.
- The enemy attacks after the player's action, unless the enemy is defeated or the player escapes.
- Potions cannot be used when inventory is empty.
- Defeat should show a clear message and return the player to the village or another safe point.
- Victory should grant a small reward and return the player to the same overworld area.
- Keep quest progress and collected items intact after combat.
- Add a short pause between actions if necessary to make messages readable, but avoid long delays.

No complex elemental charts, experience grind, party AI, capture system, or extensive bestiary is needed for the MVP.

---

## 10. Atmosphere and polish

Once the game works, add only low-cost details that noticeably improve the mood:

- Gentle two-frame grass or flower animation.
- Slightly varied tree and roof tiles.
- A subtle sparkle around the quest item.
- A small magical flash during a spell attack.
- Soft shifts in the palette between village and forest.
- A quiet title screen showing a road leading toward distant mountains.
- Short text transitions when moving between areas.

Audio is optional. Do not spend time sourcing music or sound effects. If no suitable original audio can be generated quickly, keep the game silent and make sure the experience still feels complete.

---

## 11. UI and presentation

### Title screen
Display:
- “BEYOND THE LONG ROAD”
- “A quiet fantasy journey”
- Start Journey
- Controls

### In-game HUD
Keep the HUD minimal. Show the current area name briefly when entering an area. Display health or party status only when useful.

### Help overlay
Show:
- Move: Arrow keys / WASD
- Interact / advance: Space or Enter
- Close overlay: Escape

### Visual consistency
The title screen, overworld, dialogue, and battle screen must look like parts of the same retro RPG. Use consistent borders, spacing, colours, and text sizing.

---

## 12. Code structure

Organize `game.js` into clear sections or functions for:
- Constants and palette.
- Game state.
- Map data and tile definitions.
- Input handling.
- Player movement.
- Collision checks.
- NPC interactions.
- Dialogue state.
- Quest and item state.
- Encounter logic.
- Battle logic.
- Drawing tiles and sprites.
- Drawing the HUD and menus.
- Main update/render loop.

Use one `requestAnimationFrame` loop. Avoid repeated event listeners, conflicting input handling, or multiple animation loops.

Keep the current game state explicit, for example:
- `title`
- `overworld`
- `dialogue`
- `battle`
- `gameOver`
- `ending`

Use clear functions for transitions between states. Keep gameplay data separate from rendering where practical.

---

## 13. Testing checklist

Before declaring completion, test the following:

- [ ] `index.html` opens without a fatal error.
- [ ] The title screen and Start Journey work.
- [ ] The canvas is crisp and not distorted when resized.
- [ ] The player moves in all four directions.
- [ ] Solid objects block movement.
- [ ] NPCs can be interacted with from the correct direction.
- [ ] Dialogue advances and closes correctly.
- [ ] The forest road can be reached and exited.
- [ ] Encounters can trigger in the intended area.
- [ ] Every battle action works.
- [ ] HP, potions, victory, escape, and defeat work.
- [ ] The player can return to exploration after battle.
- [ ] The Lost Keepsake quest can be completed.
- [ ] Quest progress and collected items persist through battles.
- [ ] No key gets stuck or repeatedly activates a menu.
- [ ] The player cannot become trapped in the map.
- [ ] The demo has a clear ending or completion message.

Use available browser testing tools if the environment supports them. Otherwise, run static checks and provide a short manual test checklist in the README. Do not claim a test passed unless it was actually performed.

---

## 14. README requirements

Write a concise `README.md` containing:
- Game title and short description.
- How to launch the game.
- Controls.
- Main objectives.
- Implemented features.
- Known limitations.
- A brief manual testing checklist.

---

## 15. One-hour implementation order

Work in this order:

### Phase 1 — First 10 minutes
Create the files, canvas, title screen, tile map, player sprite, and movement.

### Phase 2 — Minutes 10–20
Add collision detection, the village, forest path, and map transitions.

### Phase 3 — Minutes 20–30
Add NPC interactions, dialogue, and the Lost Keepsake quest.

### Phase 4 — Minutes 30–45
Add encounters, the battle screen, magic, potions, escape, victory, and defeat.

### Phase 5 — Minutes 45–55
Add the collectible spell scroll, quest completion, and small visual effects.

### Phase 6 — Minutes 55–60
Fix the most important bugs, test the complete loop, and update the README.

These are time targets, not permission to skip essential tests. If implementation is slower than expected, reduce the map and simplify the artwork rather than leaving movement or combat broken.

---

## Final instruction to Codex

Start implementing the game in the currently opened project folder now.

Do not respond with a plan alone. Create the actual files, run the checks available in this environment, fix obvious bugs, and report:
1. Which files were created.
2. How to launch the game.
3. Which features were implemented.
4. Which features could not be completed.
5. Any tests actually performed and their results.

Make sensible decisions without asking unnecessary questions. The target is a small, atmospheric, playable demo—not a full-length RPG.
