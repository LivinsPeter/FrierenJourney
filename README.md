# Beyond the Long Road

A small browser RPG prototype built with a 240 × 160 HTML5 Canvas and crisp, original pixel-style scenery. Explore Linden Village, follow the forest road, and return a lost keepsake to its owner.

## Run

Open `index.html` directly in Chrome or Microsoft Edge. If local file restrictions interfere, run `python -m http.server 8000` from this folder and open <http://localhost:8000>.

## Controls

- Move: Arrow keys or WASD
- Talk, inspect, or advance dialogue: E, Enter, or Space
- Battle: A / 1 Attack, S / 2 Spell, P / 3 Potion, R / 4 Run, Escape to run
- Movement pauses during dialogue and battle

## Objectives

Talk to Mara in Linden Village, search beside the old shrine on the forest road, then bring the keepsake back. Toma and the road warden have optional conversations.

## Implemented

- Title screen and Enter/Space start
- Connected village and forest maps with camera following, original scenery, and collision
- Three NPCs, advancing dialogue, quest status, keepsake collection, and a five-gold reward
- Shared persistent HP, inventory, and item data prepared for battle integration
- Explicit title, overworld, dialogue, and battle states
- Integrated Mossback encounter with shared HP/potions, victory rewards, defeat recovery, and escape

## Limitations

The battle system is a small deterministic prototype with Attack, Spell, Potion, and Run. There is no sound or gamepad support.

## Manual check list

- Start at the title screen; walk in each direction and confirm trees, buildings, and the well block movement.
- Speak to Mara, advance/close her dialogue, and confirm movement resumes afterward.
- Walk east to the forest, inspect the keepsake beside the shrine, return west, and speak to Mara again.
- Confirm the quest status changes to completed and gold increases by five.

- Walk east to the forest beast, approach, and press E/Enter/Space. Use Attack or Spell until victory; confirm HP and gold update and the defeated beast does not respawn.
- To test Potion and Run, reload after victory, enter battle, take a hit with Attack, use Potion, then Run; approach the beast again to verify it can be retried after escape. Reload and choose Attack repeatedly to test defeat recovery in the village.
