# Beyond the Long Road — Two-Person Codex Work Plan

## Purpose

This document divides the work for a small, playable, Frieren-inspired fantasy RPG with authentic GBA-era pixel-art visuals between two developers using separate Codex sessions.

The goal is to let both people work **in parallel on separate branches and separate files**, then combine the work through GitHub without overwriting each other.

**Important:** Two Codex sessions can work simultaneously, but not safely if both modify the same working tree or the same files. Use separate Git branches and preferably separate local clones/folders. Keep file ownership strict until integration.

This is a small MVP. Prioritize a complete playable loop over content volume.

---

## 1. Recommended division of work

### Developer A — You: Game Engine, Overworld, and Integration

**Primary ownership:** `game.js`, `index.html`, and core gameplay integration.

You are responsible for making the game actually playable: the canvas, game states, player movement, collision, map transitions, dialogue flow, quest state, and final integration.

#### Tasks

1. Set up the repository and project skeleton.
2. Implement the HTML canvas at a logical resolution of 240 × 160.
3. Implement crisp scaling and keyboard input.
4. Create the main game loop using `requestAnimationFrame`.
5. Define the explicit game states: `title`, `overworld`, `dialogue`, `battle`, and `ending`.
6. Implement the player character, four-direction movement, facing direction, and collision detection.
7. Implement the village and forest-road map data, including solid tiles, interactable objects, encounter tiles, and map exits.
8. Implement NPC interaction and the dialogue system.
9. Implement the Lost Keepsake quest state and collectible tracking.
10. Integrate the battle module supplied by Developer B.
11. Test the entire gameplay loop and resolve integration issues.
12. Keep `README.md` and the final controls consistent with the actual game.

#### Files you own

- `index.html`
- `game.js`
- `README.md`
- `docs/INTEGRATION.md` (optional integration notes)

Avoid asking Developer B to edit these files directly. If an interface change is needed, agree on it first and then make one coordinated change.

#### Acceptance criteria

- The title screen starts a game.
- The player moves in four directions and cannot pass through solid objects.
- The player can enter and leave the village and forest road.
- NPC dialogue opens, advances, and closes reliably.
- The quest can be accepted, completed, and remembered.
- Battle can be entered and exited without losing the player's map position or quest state.
- The project launches from the documented instructions.

---

### Developer B — Your Friend: Pixel Art, Battle System, and Visual Polish

**Primary ownership:** `style.css` and a self-contained `battle.js` module.

Your friend should work on separate files that can be integrated into the main game without repeatedly changing `game.js`.

#### Tasks

1. Create the CSS for the pixel-art canvas, responsive scaling, title screen, and any surrounding page layout.
2. Establish a compact, coherent palette inspired by classic GBA fantasy RPGs.
3. Create original pixel-art sprite drawing functions for:
   - The elf mage player character.
   - A young mage companion.
   - A warrior companion.
   - One forest beast.
   - One floating magical wisp.
4. Create reusable drawing functions for the battle background, dialogue/menu panels, HP bars, and simple magical effects.
5. Implement the battle system in `battle.js` as a self-contained module.
6. Include the battle menu actions:
   - Magic
   - Staff Strike
   - Potion
   - Run
7. Implement turn order, damage, enemy attacks, HP updates, potion inventory use, victory, escape, and defeat.
8. Make the battle UI keyboard-friendly and prevent one key press from triggering multiple actions.
9. Add small effects only after the core battle system works.
10. Provide integration instructions and a short test checklist.

#### Files you own

- `style.css`
- `battle.js`
- `docs/BATTLE_API.md`
- `docs/ART_API.md` (optional, if sprite drawing functions need documentation)

Avoid editing `game.js` or `index.html` unless Developer A explicitly agrees to a specific change. If you need a new script tag, tell Developer A; do not independently restructure the main HTML.

#### Acceptance criteria

- Battle can start with supplied player/enemy data.
- All four battle actions work.
- HP and potion counts update correctly.
- Victory, escape, and defeat return clear results to the caller.
- The module does not create its own animation loop or register duplicate global keyboard listeners.
- Visual functions can be called by the main game without changing the main game architecture.
- The CSS does not make the canvas blurry or distort its aspect ratio.

---

## 2. Agree on the interface before coding in parallel

This is the most important coordination step. Both developers should agree on function names and data shapes before independently implementing their parts.

Use this proposed contract.

### Main game owns

- The single `requestAnimationFrame` loop.
- The global game state.
- The player's overworld position and facing direction.
- Map data, collision, NPCs, dialogue, quest progress, and item collection.
- The transition into and out of battles.
- Global keyboard input while in the overworld.

### Battle module owns

- Battle-local state, including the current enemy, turn, battle messages, and temporary animation state.
- Rendering the battle screen when asked.
- Processing battle actions.
- Returning a final result to the main game.

### Suggested `battle.js` API

Ask Developer B to implement this interface unless both agree to a change:

```js
window.Battle = {
  start(options) {
    // Initialize one battle from options.
  },

  update(deltaTime) {
    // Update battle-only animation or timing if required.
  },

  render(ctx) {
    // Draw the battle screen to the supplied canvas context.
  },

  handleAction(action) {
    // Handle a selected menu action.
  },

  getStatus() {
    // Return "active", "victory", "escaped", or "defeat".
  },

  getResult() {
    // Return the final result and relevant rewards.
  }
};
```

The battle module should expose its public API through `window.Battle` for simple browser script integration. It must not assume it owns the global game loop.

Suggested `start` options:

```js
{
  player: {
    name: "Mage",
    hp: 30,
    maxHp: 30,
    magic: 8,
    attack: 4
  },
  enemy: {
    name: "Forest Wisp",
    hp: 18,
    maxHp: 18,
    attack: 4
  },
  inventory: {
    potions: 2
  }
}
```

Suggested result:

```js
{
  status: "victory",
  potionsRemaining: 1,
  playerHp: 22,
  reward: {
    gold: 5
  }
}
```

These are examples of the contract, not hard-coded outcomes. The battle code must calculate the actual result.

**Important:** Decide whether player HP and potions are owned by the main game or the battle module. Recommended approach: the main game owns persistent player HP and inventory; battle receives initial values and returns updated values through `getResult()`. This avoids duplicated persistent state.

### Suggested art API

Developer B can expose drawing helpers through `window.GameArt`, or keep them inside `battle.js` if they are battle-only.

Example:

```js
window.GameArt = {
  drawPlayer(ctx, x, y, direction, frame),
  drawCompanion(ctx, x, y, kind),
  drawEnemy(ctx, x, y, kind),
  drawBattleBackground(ctx, variant),
  drawHpBar(ctx, x, y, width, hp, maxHp)
};
```

If the sprites are only used inside battle, keep the functions private to the battle module instead. Avoid building an unnecessarily complex asset framework.

### Keyboard ownership

- The main game handles movement and interactions only in the title, overworld, and dialogue states.
- The battle module exposes `handleAction()` and does not register its own global key listener.
- The main game translates keys into battle actions while in the `battle` state.
- Ignore movement inputs while dialogue, menus, or battles block movement.
- Prevent key-repeat from accidentally selecting multiple battle actions.

This avoids both scripts responding to the same key press.

---

## 3. GitHub workflow to avoid conflicts

### Recommended: separate branches and separate folders

Do **not** have two Codex agents editing the same project folder at the same time.

Each developer should have their own clone or working folder, for example:

```text
D:\Projects\FrierenJourney-You\
D:\Projects\FrierenJourney-Friend\
```

Both folders connect to the same GitHub repository but use different branches.

### Branch plan

- `main` — stable, playable version only.
- `feature/overworld-engine` — Developer A.
- `feature/battle-art` — Developer B.

Create the repository and first commit with the shared file structure before starting parallel work. If the project already exists, use its current repository rather than creating a second unrelated repository.

### Initial setup (Developer A)

Create the project folder, initialize Git, and make the starter commit:

```bash
git init
git branch -M main
git add index.html style.css game.js README.md
git commit -m "Set up RPG project skeleton"
```

Create an empty GitHub repository and connect it:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace the placeholder with the real repository URL. Do not commit secrets or personal credentials.

### Create Developer A's branch

```bash
git switch -c feature/overworld-engine
git push -u origin feature/overworld-engine
```

### Create Developer B's branch

Your friend should clone the repository into a separate folder:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL FrierenJourney-Friend
cd FrierenJourney-Friend
git switch -c feature/battle-art
git push -u origin feature/battle-art
```

Developer A should work in the first folder and Developer B in the second. Each opens their own folder in their own Codex session.

### Daily working loop

Before starting work:

```bash
git status
git pull
```

After completing a small working chunk:

```bash
git add style.css battle.js docs/BATTLE_API.md
git commit -m "Implement battle module and pixel art"
git push
```

Use only the files that actually changed in `git add`; the example assumes those are the files you edited.

Developer A should use the appropriate file list for their own changes:

```bash
git add index.html game.js README.md
git commit -m "Implement overworld and dialogue"
git push
```

Commit small, working changes instead of one enormous final commit. If a developer is working on a feature branch, pull that branch's upstream changes before continuing when appropriate.

### Integration through pull requests

1. Developer B pushes `feature/battle-art`.
2. Developer B opens a pull request targeting `main` and requests a review from Developer A.
3. Developer A checks that the API matches the agreed contract and tests the branch.
4. Merge the pull request once it works.
5. Developer A updates their local `main` and merges or rebases `main` into `feature/overworld-engine`.
6. Developer A integrates and tests the battle module.
7. Developer A opens a pull request for `feature/overworld-engine`.
8. Merge only after the game works as a complete loop.

For a tiny student project, the team can choose to merge directly into `main`, but pull requests are safer and make changes easier to review.

### Keep branches updated

Before integration, use:

```bash
git fetch origin
git status
```

To bring the latest `main` into your feature branch, choose either merge or rebase; do not run both blindly.

Merge option:

```bash
git merge origin/main
```

If conflicts occur, resolve them, test the game, then commit the resolution. Do not overwrite the other developer's changes just to remove a conflict.

---

## 4. Which conflicts are likely?

| Situation | Risk | Prevention |
|---|---|---|
| Both edit `game.js` | High | Developer A owns it; Developer B supplies the battle module separately. |
| Both edit `index.html` | Medium | Developer A owns it; agree before adding script tags. |
| Both edit the same CSS file | Medium | Developer B owns `style.css`; Developer A describes visual needs instead of editing it. |
| Both edit separate files on separate branches | Low | Keep interfaces stable and merge through pull requests. |
| Both run Codex in the same working folder | High | Use separate clones/folders and branches. |
| One developer changes the agreed API | Medium–high | Update `docs/BATTLE_API.md` and notify the other developer before relying on the change. |
| Both merge at once without testing | Medium | One person, preferably Developer A, owns final integration. |

Git can merge different files cleanly, but a clean merge does not guarantee the game works. Always test the combined version.

---

## 5. Suggested one-hour schedule

The hour is a target for a small MVP. Two people working in parallel may finish faster, but integration and debugging still take time.

| Elapsed time | Developer A | Developer B |
|---|---|---|
| 0–5 min | Create repo, starter commit, branches, agree on API | Clone repo, read brief, confirm API |
| 5–20 min | Canvas, title screen, movement, map, collision | CSS, palette, sprite helpers, battle layout |
| 20–35 min | NPCs, dialogue, map transitions, quest state | Battle state, actions, HP, potion, escape |
| 35–45 min | Connect battle API, preserve map and quest state | Test battle module and fix issues on own branch |
| 45–55 min | Test integrated gameplay loop | Review integrated game and fix only agreed issues in owned files |
| 55–60 min | Final bug fixes and README | Check visuals and report known limitations |

Do not wait until the final five minutes to merge. Integrate as soon as the battle API is usable.

---

## 6. Prompts to give each Codex

### Prompt for Developer A (you)

> Read `TEAM_WORK_PLAN.md` and the project's game brief. You are Developer A, responsible for the overworld engine and final integration. Work only on `index.html`, `game.js`, and `README.md`, plus your own integration notes. Implement the title screen, canvas rendering, game loop, player movement, collisions, village/forest maps, NPC dialogue, quest state, and transitions. Follow the agreed `window.Battle` contract. Do not implement the battle system inside `game.js`; load `battle.js` as a separate module. Do not overwrite or reformat files owned by Developer B. Make small commits on `feature/overworld-engine`, test your work, and document any interface changes before depending on them.

### Prompt for Developer B (your friend)

> Read `TEAM_WORK_PLAN.md` and the project's game brief. You are Developer B, responsible for pixel-art visuals and a self-contained battle module. Work only on `style.css`, `battle.js`, and `docs/BATTLE_API.md` / `docs/ART_API.md`. Implement the agreed `window.Battle` interface and optional `window.GameArt` helpers. Do not edit `game.js` or `index.html` without explicit agreement. Do not create a second global animation loop or global keyboard listener. The main game will call your module's `start`, `update`, `render`, `handleAction`, `getStatus`, and `getResult` functions. Keep persistent player HP and inventory updates compatible with the main game receiving a result. Commit and push small changes on `feature/battle-art`; report the exact integration steps and tests performed.

---

## 7. Final integration checklist

Before calling the MVP finished:

- [ ] Both branches are pushed to GitHub.
- [ ] The battle API and data contract match on both branches.
- [ ] `index.html` loads scripts in the correct order.
- [ ] Only one main animation loop runs.
- [ ] Keyboard input does not conflict between overworld and battle.
- [ ] The battle result updates persistent player HP and potions.
- [ ] The player returns to the same map after victory or escape.
- [ ] Quest progress and collected items survive battles.
- [ ] The game can be started, explored, battled, and completed from a fresh launch.
- [ ] The README describes how to run the current combined version.

## Final recommendation

**Yes, build simultaneously.** The safest arrangement is separate clones, separate feature branches, strict file ownership, a small agreed API, and one designated integrator (Developer A). The biggest danger is not GitHub itself; it is both Codex sessions independently changing the same architecture or API.

Keep the first version deliberately small. Once the integrated game runs reliably, add more areas, story scenes, spells, and character details in later branches.
