# Battle module integration

`battle.js` exposes a single browser global, `window.Battle`. It is dependency-free and draws into the caller's existing 240 × 160 canvas context. The game owns the animation loop, input mapping, and persistent player/inventory state.

## Loading

Load `battle.js` before the game code that calls it:

```html
<script src="battle.js" defer></script>
<script src="game.js" defer></script>
```

The current `index.html` is intentionally unchanged; the integrating game owner should add this script tag when wiring in battle.

## Start a battle

```js
Battle.start({
  player: { name: "Mage", hp: 30, maxHp: 30, magic: 8, attack: 4 },
  enemy: { name: "Mossback", hp: 18, maxHp: 18, attack: 4 },
  inventory: { potions: 2 },
  reward: { gold: 5 }
});
```

`player` and `enemy` are required objects. Names and combat values have defaults if omitted; HP is clamped to `0..maxHp`, max HP defaults to the supplied HP and then to 30/18, and attack/magic default to 4/8 for the player and 4 for the enemy. Potions default to zero. The optional reward object is copied into the result; if omitted, victory reward defaults to `{ gold: 5 }`. Starting with zero player HP immediately produces `defeat`; starting with zero enemy HP immediately produces `victory`.

The battle module copies these values. It never mutates the overworld's player or inventory objects.

## Main-loop calls

While the game state is `battle`, call these from the main game's existing loop:

```js
Battle.update(deltaSeconds); // seconds, e.g. (now - lastTime) / 1000
Battle.render(ctx);          // existing 240 × 160 canvas context
```

Keep `ctx.imageSmoothingEnabled = false` when scaling the canvas. `render` clears and paints the full battle view but saves/restores context state. The module does not create an animation loop or register keyboard listeners.

Translate the main game's discrete input events into one call each:

```js
Battle.handleAction("attack"); // physical strike
Battle.handleAction("spell");  // reliable magic damage; "magic" is an alias
Battle.handleAction("potion"); // restore up to 12 HP; consumes one potion
Battle.handleAction("run");    // escape immediately
```

`handleAction` returns `true` when an action was accepted and `false` for an unknown action or an unusable potion. An attack or spell deals the player's configured damage, then the enemy immediately counters if still alive. Potion heals then the enemy counters. The enemy attack value is deterministic. Run succeeds immediately; this small MVP does not simulate escape chance. Actions after battle completion are ignored.

## Status and result

`Battle.getStatus()` returns `"idle"` before the first battle, then `"active"`, `"victory"`, `"defeat"`, or `"escaped"`.

`Battle.getResult()` returns `null` before a battle and while it is active. Once complete it returns a fresh result object:

```js
{
  status: "victory", // "defeat" or "escaped" are also possible
  playerHp: 22,
  maxPlayerHp: 30,
  potionsRemaining: 1,
  enemyHp: 0,
  reward: { gold: 5 } // victory only; null otherwise
}
```

Poll after each update/action. When status leaves `active`, copy the returned HP, max HP, and potion count back into the main game's persistent state, apply a reward only for victory, and transition to the desired map/game state. Defeat currently returns `playerHp: 0`; safe respawn and map restoration belong to the overworld.

## Independent check

In a browser console with `battle.js` loaded, call `Battle.start(...)`, then `Battle.handleAction("attack")` or `Battle.handleAction("spell")`, and inspect `Battle.getStatus()` / `Battle.getResult()`. Render to the game's existing canvas. See the main game brief for a manual UI checklist.
