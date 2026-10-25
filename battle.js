/* Self-contained battle renderer and turn resolver for the 240 × 160 game canvas. */
(() => {
  "use strict";

  const WIDTH = 240;
  const HEIGHT = 160;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeName = (value, fallback) => String(value || fallback).slice(0, 18);

  let battle = null;

  function start(options = {}) {
    const player = options.player || {};
    const enemy = options.enemy || {};
    const playerMax = Math.max(1, number(player.maxHp, number(player.hp, 30)));
    const enemyMax = Math.max(1, number(enemy.maxHp, number(enemy.hp, 18)));
    battle = {
      status: "active",
      player: {
        name: safeName(player.name, "Wandering Mage"), maxHp: playerMax,
        hp: clamp(number(player.hp, playerMax), 0, playerMax),
        attack: Math.max(1, number(player.attack, 4)),
        magic: Math.max(1, number(player.magic, 8))
      },
      enemy: {
        name: safeName(enemy.name, "Mossback"), maxHp: enemyMax,
        hp: clamp(number(enemy.hp, enemyMax), 0, enemyMax),
        attack: Math.max(1, number(enemy.attack, 4))
      },
      potions: Math.max(0, Math.floor(number(options.inventory && options.inventory.potions, 0))),
      reward: options.reward ? { ...options.reward } : { gold: 5 },
      message: "A quiet rustle breaks the silence.",
      effect: null,
      elapsed: 0,
      messageTimer: 0,
      lastAction: ""
    };
    if (battle.player.hp <= 0) finish("defeat");
    else if (battle.enemy.hp <= 0) finish("victory");
    return battle.status;
  }

  function finish(status) {
    battle.status = status;
    if (status === "victory") battle.message = `${battle.enemy.name} retreats. The road is quiet.`;
    if (status === "defeat") battle.message = "Your strength gives out...";
    if (status === "escaped") battle.message = "You slip away along the road.";
  }

  function hitEnemy(amount, label, color) {
    const dealt = Math.min(battle.enemy.hp, Math.max(1, Math.floor(amount)));
    battle.enemy.hp -= dealt;
    battle.message = `${label} deals ${dealt} damage!`;
    battle.effect = { side: "enemy", color, time: 0.32, damage: dealt };
    if (battle.enemy.hp <= 0) finish("victory");
  }

  function enemyTurn() {
    if (battle.status !== "active") return;
    const dealt = Math.min(battle.player.hp, Math.max(1, Math.floor(battle.enemy.attack)));
    battle.player.hp -= dealt;
    battle.message = `${battle.enemy.name} strikes for ${dealt}!`;
    battle.effect = { side: "player", color: "#e7a17b", time: 0.32, damage: dealt };
    if (battle.player.hp <= 0) finish("defeat");
  }

  function handleAction(action) {
    if (!battle || battle.status !== "active") return false;
    const choice = String(action || "").toLowerCase();
    battle.lastAction = choice;
    battle.messageTimer = 0.45;
    if (choice === "attack") hitEnemy(battle.player.attack, "Staff strike", "#f0d18a");
    else if (choice === "spell" || choice === "magic") hitEnemy(battle.player.magic, "Moonlit spell", "#b5c9e5");
    else if (choice === "potion") {
      if (battle.potions <= 0) {
        battle.message = "No potions remain.";
        return false;
      }
      const restored = Math.min(12, battle.player.maxHp - battle.player.hp);
      if (restored <= 0) {
        battle.message = "Your health is already full.";
        return false;
      }
      battle.potions -= 1;
      battle.player.hp += restored;
      battle.message = `A potion restores ${restored} HP.`;
      battle.effect = { side: "player", color: "#a8c99a", time: 0.32, damage: 0 };
    } else if (choice === "run") {
      finish("escaped");
      return true;
    } else return false;

    if (battle.status === "active") enemyTurn();
    return true;
  }

  function update(deltaTime) {
    if (!battle) return;
    const dt = clamp(number(deltaTime, 0), 0, 0.1);
    battle.elapsed += dt;
    battle.messageTimer = Math.max(0, battle.messageTimer - dt);
    if (battle.effect) {
      battle.effect.time -= dt;
      if (battle.effect.time <= 0) battle.effect = null;
    }
  }

  function box(ctx, x, y, w, h, fill = "#17251f", border = "#d4c7a1") {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function hpBar(ctx, x, y, w, hp, maxHp) {
    ctx.fillStyle = "#101a17";
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = "#53604a";
    ctx.fillRect(x + 1, y + 1, w - 2, 3);
    const ratio = clamp(hp / maxHp, 0, 1);
    ctx.fillStyle = ratio > 0.5 ? "#98b879" : ratio > 0.25 ? "#d3b96f" : "#cf796c";
    ctx.fillRect(x + 1, y + 1, Math.floor((w - 2) * ratio), 3);
  }

  function drawMage(ctx, x, y) {
    // Original 16 × 24 pixel silhouette: pale-haired traveler in a dark coat.
    ctx.fillStyle = "#17251f"; ctx.fillRect(x + 4, y + 20, 10, 3);
    ctx.fillStyle = "#34443c"; ctx.fillRect(x + 4, y + 13, 10, 8);
    ctx.fillStyle = "#28362f"; ctx.fillRect(x + 2, y + 15, 3, 6);
    ctx.fillStyle = "#d8d0b5"; ctx.fillRect(x + 5, y + 4, 8, 8);
    ctx.fillRect(x + 3, y + 2, 10, 4); ctx.fillRect(x + 2, y + 5, 4, 5);
    ctx.fillStyle = "#b4aa91"; ctx.fillRect(x + 6, y + 7, 1, 1); ctx.fillRect(x + 11, y + 7, 1, 1);
    ctx.fillStyle = "#9a8662"; ctx.fillRect(x + 13, y + 11, 1, 12);
    ctx.fillStyle = "#e2d39b"; ctx.fillRect(x + 12, y + 9, 3, 3);
    ctx.fillStyle = "#bdc7bd"; ctx.fillRect(x + 5, y + 21, 3, 2); ctx.fillRect(x + 11, y + 21, 3, 2);
  }

  function drawBeast(ctx, x, y) {
    // Original mossy forest beast, assembled from chunky pixel shapes.
    ctx.fillStyle = "#17251f"; ctx.fillRect(x + 5, y + 21, 24, 3);
    ctx.fillStyle = "#425a43"; ctx.fillRect(x + 5, y + 11, 24, 11);
    ctx.fillRect(x + 2, y + 14, 6, 7); ctx.fillRect(x + 25, y + 12, 7, 8);
    ctx.fillStyle = "#607b50"; ctx.fillRect(x + 8, y + 7, 16, 8);
    ctx.fillRect(x + 10, y + 4, 4, 5); ctx.fillRect(x + 20, y + 5, 4, 5);
    ctx.fillStyle = "#9aab70"; ctx.fillRect(x + 7, y + 12, 5, 3); ctx.fillRect(x + 21, y + 12, 5, 3);
    ctx.fillStyle = "#edcf8b"; ctx.fillRect(x + 12, y + 10, 2, 2); ctx.fillRect(x + 21, y + 10, 2, 2);
    ctx.fillStyle = "#293d31"; ctx.fillRect(x + 15, y + 17, 7, 2);
    ctx.fillStyle = "#71865a"; ctx.fillRect(x + 1, y + 10, 4, 3); ctx.fillRect(x + 27, y + 8, 4, 3);
  }

  function draw(ctx) {
    if (!battle || !ctx) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // Dusk forest clearing, kept within the game's logical canvas.
    ctx.fillStyle = "#81958c"; ctx.fillRect(0, 0, WIDTH, 77);
    ctx.fillStyle = "#677e70"; ctx.fillRect(0, 50, WIDTH, 34);
    ctx.fillStyle = "#344c3a"; ctx.fillRect(0, 70, WIDTH, 28);
    ctx.fillStyle = "#26392f"; ctx.fillRect(0, 88, WIDTH, 72);
    ctx.fillStyle = "#536047"; ctx.fillRect(0, 101, WIDTH, 2); ctx.fillRect(0, 127, WIDTH, 2);
    ctx.fillStyle = "#766b50"; ctx.fillRect(44, 91, 151, 48);
    ctx.fillStyle = "#887a59"; ctx.fillRect(58, 96, 123, 36);
    // Far trees and a few quiet stars.
    ctx.fillStyle = "#293c32";
    for (let i = 0; i < 8; i++) {
      const tx = i * 35 - 10;
      ctx.fillRect(tx + 6, 45, 5, 48); ctx.fillRect(tx, 42, 17, 18); ctx.fillRect(tx + 3, 35, 12, 12);
    }
    ctx.fillStyle = "#e1d5aa";
    [[28, 24], [73, 18], [153, 26], [214, 17]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 1, 1));

    // Characters.
    drawMage(ctx, 54, 63);
    drawBeast(ctx, 164, 68);
    // Soft action sparkles and visible damage numbers.
    if (battle.effect) {
      const isEnemy = battle.effect.side === "enemy";
      const cx = isEnemy ? 178 : 62;
      const cy = isEnemy ? 77 : 69;
      ctx.globalAlpha = clamp(battle.effect.time / 0.32, 0, 1);
      ctx.fillStyle = battle.effect.color;
      ctx.fillRect(cx - 8, cy, 3, 3); ctx.fillRect(cx + 6, cy - 5, 2, 2);
      ctx.fillRect(cx + 2, cy + 7, 3, 3);
      if (battle.effect.damage > 0) {
        ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`-${battle.effect.damage}`, cx + 2, cy - 8);
      }
      ctx.globalAlpha = 1;
    }

    // Compact status plates.
    box(ctx, 7, 8, 92, 31);
    ctx.fillStyle = "#f0e6c8"; ctx.font = "8px monospace"; ctx.textAlign = "left";
    ctx.fillText(battle.player.name, 12, 18);
    hpBar(ctx, 12, 23, 62, battle.player.hp, battle.player.maxHp);
    ctx.fillStyle = "#c9c09f"; ctx.font = "6px monospace";
    ctx.fillText(`HP ${battle.player.hp}/${battle.player.maxHp}`, 12, 35);
    box(ctx, 141, 8, 92, 31);
    ctx.fillStyle = "#f0e6c8"; ctx.font = "8px monospace";
    ctx.fillText(battle.enemy.name, 146, 18);
    hpBar(ctx, 146, 23, 62, battle.enemy.hp, battle.enemy.maxHp);
    ctx.fillStyle = "#c9c09f"; ctx.font = "6px monospace";
    ctx.fillText(`HP ${battle.enemy.hp}/${battle.enemy.maxHp}`, 146, 35);

    box(ctx, 7, 116, 226, 36, "#17251f", "#d4c7a1");
    ctx.fillStyle = "#f0e6c8"; ctx.font = "7px monospace"; ctx.textAlign = "left";
    ctx.fillText(battle.message.slice(0, 37), 13, 127);
    if (battle.status === "active") {
      ctx.fillStyle = "#c9c09f"; ctx.font = "6px monospace";
      ctx.fillText("ATTACK   SPELL   POTION   RUN", 13, 141);
      ctx.fillText(`Potions ${battle.potions}`, 176, 141);
    } else {
      const title = battle.status === "victory" ? "VICTORY" : battle.status === "defeat" ? "DEFEAT" : "ESCAPED";
      ctx.fillStyle = battle.status === "victory" ? "#e2d39b" : "#d7a28c";
      ctx.font = "bold 8px monospace"; ctx.textAlign = "right";
      ctx.fillText(title, 225, 142);
    }
    ctx.restore();
  }

  function getStatus() { return battle ? battle.status : "idle"; }
  function getResult() {
    if (!battle) return null;
    if (battle.status === "active") return null;
    return {
      status: battle.status,
      playerHp: battle.player.hp,
      maxPlayerHp: battle.player.maxHp,
      potionsRemaining: battle.potions,
      enemyHp: battle.enemy.hp,
      reward: battle.status === "victory" ? { ...battle.reward } : null
    };
  }

  window.Battle = { start, update, render: draw, handleAction, getStatus, getResult };
})();
