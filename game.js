(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const TILE = 16;
  const MAP_W = 24;
  const MAP_H = 16;
  const WORLD_W = MAP_W * TILE;
  const WORLD_H = MAP_H * TILE;
  const COLORS = {
    grass: "#66805a", lightGrass: "#789367", darkGrass: "#4e694b",
    path: "#b39a70", pathLight: "#c4ad81", dirt: "#927b5d",
    wall: "#b8a782", roof: "#805c4b", roof2: "#657268",
    wood: "#684b3d", leaf: "#365542", leafLight: "#55724b",
    water: "#6f9691", ink: "#17251f", cream: "#eee3c4", gold: "#e4c875"
  };
  const game = {
    state: "title", // title, overworld, dialogue, battle
    player: { x: 6 * TILE + 4, y: 8 * TILE + 3, w: 9, h: 11, speed: 72, facing: "down", step: 0 },
    persistent: { hp: 30, maxHp: 30, inventory: { potions: 1, gold: 0, items: [] } },
    quest: { state: "not started", keepsakeFound: false },
    area: "village", dialogue: null, notice: "", noticeTime: 0,
    keys: new Set(), pressed: new Set(), elapsed: 0
  };

  // Maps use simple ground identifiers plus separate solid and interaction data.
  const areas = {
    village: {
      name: "Linden Village", ground: "village", solids: [], npcs: [], objects: [], exits: []
    },
    forest: {
      name: "Old Forest Road", ground: "forest", solids: [], npcs: [], objects: [], exits: []
    }
  };
  function box(x, y, w, h, type = "solid") { return { x, y, w, h, type }; }
  function house(area, tx, ty, roof = COLORS.roof) {
    area.solids.push(box(tx * TILE + 1, ty * TILE + 2, 34, 28, "building"));
    area.objects.push({ kind: "house", x: tx * TILE, y: ty * TILE, roof });
  }
  const village = areas.village;
  house(village, 2, 2); house(village, 8, 2, COLORS.roof2); house(village, 16, 2);
  house(village, 2, 11, COLORS.roof2); house(village, 17, 11);
  // Tree rows frame the village while leaving a clear central route.
  for (const [x, y] of [[0,0],[1,0],[4,0],[5,0],[11,0],[12,0],[19,0],[20,0],[22,0],[23,0],
    [0,4],[0,5],[0,9],[1,9],[0,13],[0,14],[5,5],[11,5],[20,5],[22,7],[21,9],[23,10],
    [7,13],[12,13],[14,14],[22,14],[23,14]]) village.solids.push(box(x*TILE+3,y*TILE+2,10,13,"tree"));
  village.solids.push(box(14*TILE, 7*TILE, 16, 16, "well"));
  village.objects.push({ kind: "well", x: 14*TILE, y: 7*TILE });
  village.npcs.push(
    { id: "elder", name: "Mara, village elder", x: 7*TILE, y: 7*TILE+2, lines: () => {
      if (game.quest.state === "completed") return ["You brought the keepsake home.", "Thank you. I have added a little gold to your purse."];
      if (game.quest.keepsakeFound) return ["You found it! That little brass star belonged to my sister.", "Please, take these coins for the journey."];
      if (game.quest.state === "in progress") return ["The keepsake was lost beside the old shrine in the forest.", "I hope the road treats you kindly."];
      return ["The village is quieter since the long war ended.", "A brass keepsake was lost near the old forest shrine. Would you look for it?", "The path leaves to the east, beyond the well."];
    } },
    { id: "toma", name: "Toma", x: 12*TILE, y: 9*TILE, lines: () => ["I learned a spell that folds laundry by itself.", "It works beautifully, except on socks. The socks have opinions."] },
    { id: "guard", name: "Road warden", x: 18*TILE, y: 8*TILE, lines: () => ["The forest path bends around the old shrine.", "Watch your step near the tall grass. It hides more than beetles."] }
  );
  village.exits.push({ x: WORLD_W-12, y: 6*TILE, w: 12, h: 4*TILE, to: "forest", spawn: { x: 2*TILE, y: 7*TILE } });

  const forest = areas.forest;
  forest.solids.push(box(0,0,WORLD_W,12), box(0,WORLD_H-12,WORLD_W,12));
  // Forest trees border a winding, walkable trail.
  for (const [x,y] of [[1,1],[3,1],[5,1],[8,1],[10,1],[13,1],[16,1],[19,1],[22,1],[1,4],[4,4],[7,3],[10,4],[13,4],[16,4],[19,3],[22,4],[2,8],[5,8],[8,8],[11,8],[14,8],[18,8],[21,8],[1,12],[4,12],[7,12],[10,12],[14,12],[18,12],[21,12],[23,12]]) forest.solids.push(box(x*TILE+3,y*TILE+2,10,13,"tree"));
  forest.solids.push(box(17*TILE, 6*TILE, 20, 18, "shrine"), box(20*TILE, 6*TILE, 10, 12, "rock"));
  forest.objects.push({ kind: "shrine", x: 17*TILE, y: 6*TILE });
  forest.objects.push({ kind: "keepsake", x: 15*TILE, y: 7*TILE });
  forest.objects.push({ kind: "beast", x: 11*TILE, y: 7*TILE });
  forest.exits.push({ x: 0, y: 6*TILE, w: 10, h: 4*TILE, to: "village", spawn: { x: WORLD_W-30, y: 7*TILE } });

  function beginGame() { game.state = "overworld"; sayNotice("Linden Village"); }
  function sayNotice(text) { game.notice = text; game.noticeTime = 2.4; }
  function openDialogue(speaker, lines, npcId = null) {
    game.dialogue = { speaker, lines, index: 0, npcId };
    game.state = "dialogue";
  }
  function endDialogue() { game.dialogue = null; game.state = "overworld"; }
  function nearPlayer(obj, distance = 21) {
    const px = game.player.x + game.player.w/2, py = game.player.y + game.player.h/2;
    const ox = obj.x + (obj.w || 10)/2, oy = obj.y + (obj.h || 10)/2;
    return Math.hypot(px-ox, py-oy) < distance;
  }
  function interact() {
    const area = areas[game.area];
    // NPC interactions have priority, then quest object and exits.
    const npc = area.npcs.find(person => nearPlayer(person, 23));
    if (npc) {
      if (npc.id === "elder") {
        if (game.quest.state === "not started") game.quest.state = "in progress";
        if (game.quest.keepsakeFound && game.quest.state !== "completed") {
          game.quest.state = "completed"; game.persistent.inventory.gold += 5;
        }
      }
      openDialogue(npc.name, npc.lines(), npc.id); return;
    }
    const beast = area.objects.find(object => object.kind === "beast");
    if (beast && nearPlayer(beast, 25)) {
      game.state = "battle"; sayNotice("Battle system not connected yet");
      window.setTimeout(() => { if (game.state === "battle") game.state = "overworld"; }, 1400);
      return;
    }
    const keepsake = area.objects.find(object => object.kind === "keepsake");
    if (keepsake && nearPlayer(keepsake, 24)) {
      if (game.quest.state === "in progress" && !game.quest.keepsakeFound) {
        game.quest.keepsakeFound = true;
        openDialogue("A small glimmer", ["You found a brass star keepsake, half-buried beside the shrine.", "Return it to Mara in Linden Village." ]);
      } else if (game.quest.state === "not started") openDialogue("A small glimmer", ["A brass keepsake rests beside the old shrine.", "It might belong to someone in the village."]);
      else openDialogue("A small glimmer", ["Only a few bright flecks of moss remain here."]);
      return;
    }
    const exit = area.exits.find(item => nearPlayer(item, 27));
    if (exit) { changeArea(exit.to, exit.spawn); return; }
    const object = area.objects.find(item => item.kind === "well" && nearPlayer(item, 24));
    if (object) { openDialogue("Village well", ["The water reflects a little square of sky."]); return; }
    // Reserved seam for future battle integration; no battle code is loaded here.
    if (game.area === "forest" && nearPlayer({x: 11*TILE, y: 7*TILE}, 25)) {
      game.state = "battle"; sayNotice("Battle system not connected yet");
      window.setTimeout(() => { if (game.state === "battle") game.state = "overworld"; }, 1400);
    }
  }
  function changeArea(name, spawn) {
    game.area = name; game.player.x = spawn.x; game.player.y = spawn.y;
    sayNotice(areas[name].name);
  }
  function rectsOverlap(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function blocked(x,y) {
    const player = { x, y, w: game.player.w, h: game.player.h };
    return areas[game.area].solids.some(solid => rectsOverlap(player,solid));
  }
  function updateMovement(dt) {
    let dx = 0, dy = 0;
    if (game.keys.has("ArrowLeft") || game.keys.has("KeyA")) { dx = -1; game.player.facing = "left"; }
    else if (game.keys.has("ArrowRight") || game.keys.has("KeyD")) { dx = 1; game.player.facing = "right"; }
    else if (game.keys.has("ArrowUp") || game.keys.has("KeyW")) { dy = -1; game.player.facing = "up"; }
    else if (game.keys.has("ArrowDown") || game.keys.has("KeyS")) { dy = 1; game.player.facing = "down"; }
    const amount = game.player.speed * dt;
    if (dx) { const nx = game.player.x + dx*amount; if (!blocked(nx,game.player.y)) game.player.x = nx; }
    if (dy) { const ny = game.player.y + dy*amount; if (!blocked(game.player.x,ny)) game.player.y = ny; }
    if (dx || dy) game.player.step += dt * 10;
    for (const exit of areas[game.area].exits) {
      if (rectsOverlap(game.player,exit)) { changeArea(exit.to,exit.spawn); break; }
    }
  }
  function drawGround(area, camX, camY) {
    ctx.fillStyle = area.ground === "village" ? COLORS.grass : COLORS.darkGrass;
    ctx.fillRect(0,0,240,160);
    for (let y=0; y<WORLD_H; y+=TILE) for (let x=0; x<WORLD_W; x+=TILE) {
      if (area.ground === "village") {
        // A broad path joins the homes and eastern forest road.
        if ((y >= 6*TILE && y <= 10*TILE && x >= TILE && x < WORLD_W) || (x >= 13*TILE && x < 17*TILE && y >= 4*TILE && y < 13*TILE)) {
          ctx.fillStyle = ((x/TILE+y/TILE)%3===0) ? COLORS.pathLight : COLORS.path;
          ctx.fillRect(x-camX,y-camY,TILE,TILE);
        } else if ((x/TILE+y/TILE)%4===0) {
          ctx.fillStyle = COLORS.lightGrass; ctx.fillRect(x-camX+5,y-camY+7,2,2);
        }
      } else {
        // The trail winds east toward the shrine, then turns north.
        const trail = (y > 6*TILE && y < 10*TILE && x < 18*TILE) ||
          (x >= 14*TILE && x < 18*TILE && y >= 5*TILE && y <= 10*TILE);
        if (trail) { ctx.fillStyle = ((x/TILE+y/TILE)%3===0) ? COLORS.pathLight : COLORS.path; ctx.fillRect(x-camX,y-camY,TILE,TILE); }
        else if ((x/TILE+y/TILE)%3===0) { ctx.fillStyle="#81945d";ctx.fillRect(x-camX+4,y-camY+6,2,4);ctx.fillRect(x-camX+9,y-camY+9,2,4); }
      }
    }
  }
  function drawTree(solid, camX, camY) {
    const x=solid.x-camX,y=solid.y-camY;
    ctx.fillStyle="#4d3c30";ctx.fillRect(x+4,y+9,5,8);
    ctx.fillStyle=COLORS.leaf;ctx.fillRect(x,y+3,13,9);ctx.fillRect(x+2,y,9,11);
    ctx.fillStyle=COLORS.leafLight;ctx.fillRect(x+2,y+3,4,3);ctx.fillRect(x+8,y+6,3,2);
  }
  function drawObject(object, camX, camY) {
    const x=object.x-camX,y=object.y-camY;
    if (object.kind === "house") {
      ctx.fillStyle="#d1c49d";ctx.fillRect(x+2,y+7,30,20);
      ctx.fillStyle=object.roof;ctx.fillRect(x,y+3,34,8);ctx.fillRect(x+4,y,26,5);
      ctx.fillStyle=COLORS.wood;ctx.fillRect(x+5,y+12,4,5);ctx.fillRect(x+24,y+12,4,5);ctx.fillRect(x+14,y+17,6,10);
      ctx.fillStyle="#5c7973";ctx.fillRect(x+4,y+20,4,5);
    } else if (object.kind === "well") {
      ctx.fillStyle="#827c68";ctx.fillRect(x+2,y+5,12,9);ctx.fillStyle=COLORS.water;ctx.fillRect(x+4,y+7,8,4);
      ctx.fillStyle="#584c3e";ctx.fillRect(x+1,y+3,14,2);ctx.fillRect(x+4,y+1,2,5);
    } else if (object.kind === "shrine") {
      ctx.fillStyle="#9e9b83";ctx.fillRect(x,y+8,20,10);ctx.fillRect(x+3,y+3,14,7);
      ctx.fillStyle="#d2c99f";ctx.fillRect(x+7,y+5,6,2);ctx.fillRect(x+8,y+10,4,5);
    } else if (object.kind === "beast") {
      ctx.fillStyle="#3b493c";ctx.fillRect(x+1,y+6,12,7);ctx.fillRect(x+3,y+3,7,6);
      ctx.fillStyle="#81905f";ctx.fillRect(x+4,y+4,5,3);ctx.fillRect(x+2,y+5,2,2);
      ctx.fillStyle="#d8c77e";ctx.fillRect(x+8,y+5,1,1);ctx.fillRect(x+3,y+12,2,2);ctx.fillRect(x+9,y+12,2,2);
    } else if (object.kind === "keepsake" && !game.quest.keepsakeFound) {
      ctx.fillStyle=COLORS.gold;ctx.fillRect(x+3,y+2,5,5);ctx.fillRect(x+1,y+4,9,2);
      if (Math.floor(game.elapsed*4)%2===0) { ctx.fillStyle="#f4e8b4";ctx.fillRect(x+10,y,2,2); }
    }
  }
  function drawPerson(person, camX, camY, isPlayer=false) {
    const x=Math.round(person.x-camX), y=Math.round(person.y-camY);
    if (isPlayer) {
      const bob=(game.player.step%2>1)?1:0;
      ctx.fillStyle="#eee3c4";ctx.fillRect(x+2,y+bob,6,4);ctx.fillRect(x+1,y+2+bob,2,4);ctx.fillRect(x+7,y+2+bob,2,4);
      ctx.fillStyle="#d8d1bd";ctx.fillRect(x+3,y+2+bob,4,3);
      ctx.fillStyle="#343c3a";ctx.fillRect(x+2,y+5+bob,6,5);ctx.fillRect(x+1,y+10+bob,3,2);ctx.fillRect(x+6,y+10+bob,3,2);
      ctx.fillStyle="#8f795a"; if(game.player.facing==="right") ctx.fillRect(x+9,y+5,1,7); else ctx.fillRect(x,y+5,1,7);
    } else {
      ctx.fillStyle="#d4b38a";ctx.fillRect(x+3,y,5,5);ctx.fillStyle=person.id==="elder"?"#64705d":"#40534c";
      ctx.fillRect(x+2,y+5,7,7);ctx.fillStyle="#483c32";ctx.fillRect(x+2,y+11,3,2);ctx.fillRect(x+6,y+11,3,2);
    }
  }
  function drawPanel(x,y,w,h) { ctx.fillStyle=COLORS.ink;ctx.fillRect(x,y,w,h);ctx.strokeStyle=COLORS.cream;ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1); }
  function drawHud() {
    drawPanel(3,3,108,18);
    ctx.textAlign="left";ctx.textBaseline="top";ctx.fillStyle=COLORS.cream;ctx.font="7px monospace";
    ctx.fillText("HP " + game.persistent.hp + "/" + game.persistent.maxHp + "   Gold " + game.persistent.inventory.gold,7,6);
    const quest = game.quest.state === "not started" ? "Quest: Ask Mara about the keepsake" : game.quest.state === "in progress" ? (game.quest.keepsakeFound ? "Quest: Return keepsake to Mara" : "Quest: Search the forest shrine") : "Quest: Keepsake returned";
    drawPanel(3,137,234,20);ctx.fillStyle=COLORS.cream;ctx.font="6px monospace";ctx.fillText(quest,7,144);
    if (game.noticeTime > 0) { drawPanel(75,24,90,15);ctx.textAlign="center";ctx.font="7px monospace";ctx.fillText(game.notice,120,28); }
  }
  function drawDialogue() {
    drawPanel(5,105,230,51);ctx.textAlign="left";ctx.textBaseline="top";ctx.fillStyle=COLORS.gold;ctx.font="bold 8px monospace";ctx.fillText(game.dialogue.speaker,11,111);
    ctx.fillStyle=COLORS.cream;ctx.font="7px monospace";
    const line=game.dialogue.lines[game.dialogue.index]||"";
    const words=line.split(" ");let row="", rows=[];
    for(const word of words){if((row+" "+word).length>48){rows.push(row);row=word;}else row+=(row?" ":"")+word;}if(row)rows.push(row);
    rows.slice(0,3).forEach((text,index)=>ctx.fillText(text,11,123+index*9));
    ctx.textAlign="right";ctx.fillStyle=COLORS.gold;ctx.fillText("E / ENTER  ▾",230,145);
  }
  function drawWorld() {
    const player=game.player;
    const camX=Math.max(0,Math.min(WORLD_W-240,Math.round(player.x+player.w/2-120)));
    const camY=Math.max(0,Math.min(WORLD_H-160,Math.round(player.y+player.h/2-80)));
    const area=areas[game.area];drawGround(area,camX,camY);
    area.objects.forEach(object=>drawObject(object,camX,camY));
    area.solids.filter(s=>s.type==="tree").forEach(s=>drawTree(s,camX,camY));
    area.npcs.forEach(npc=>drawPerson(npc,camX,camY));drawPerson(player,camX,camY,true);
    // Area name sits in the top corner; shared player data remains available for battle integration.
    ctx.fillStyle=COLORS.ink;ctx.fillRect(168,3,69,12);ctx.fillStyle=COLORS.cream;ctx.textAlign="right";ctx.textBaseline="top";ctx.font="6px monospace";ctx.fillText(area.name,234,6);
    drawHud();if(game.state==="dialogue")drawDialogue();
    if(game.state==="battle"){drawPanel(48,61,144,34);ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=COLORS.cream;ctx.font="7px monospace";ctx.fillText(game.notice,120,78);}
  }
  function renderTitle() {
    ctx.fillStyle="#263d35";ctx.fillRect(0,0,240,160);ctx.fillStyle="#78918a";ctx.fillRect(0,0,240,76);ctx.fillStyle="#c5b98d";ctx.fillRect(180,24,12,12);
    ctx.fillStyle="#526d58";ctx.fillRect(0,76,240,34);ctx.fillStyle="#394f3d";ctx.fillRect(0,110,240,50);ctx.fillStyle="#b7a47c";ctx.fillRect(104,76,34,84);ctx.fillStyle="#d9d0ae";ctx.fillRect(108,76,3,84);
    ctx.fillStyle="#17251f";ctx.fillRect(37,39,166,38);ctx.strokeStyle="#d4c7a1";ctx.strokeRect(37.5,39.5,165,37);
    ctx.fillStyle="#f0e6c8";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold 13px Georgia,serif";ctx.fillText("BEYOND THE",120,52);ctx.fillText("LONG ROAD",120,67);
    ctx.font="8px Georgia,serif";ctx.fillText("Press Enter or Space",120,132);ctx.fillStyle="#c9c09f";ctx.font="6px Georgia,serif";ctx.fillText("A QUIET FANTASY JOURNEY",120,146);
  }
  function update(dt) {
    game.elapsed+=dt;game.noticeTime=Math.max(0,game.noticeTime-dt);
    if(game.state==="overworld") updateMovement(dt);
  }
  function frame(time) {
    const dt=Math.min((time-game.lastTime)/1000||0,.05);game.lastTime=time;update(dt);
    if(game.state==="title")renderTitle();else drawWorld();
    game.pressed.clear();requestAnimationFrame(frame);
  }
  window.addEventListener("keydown",event=>{
    const code=event.code;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(code))event.preventDefault();
    const wasDown = game.keys.has(code);
    if (!wasDown) game.pressed.add(code);
    game.keys.add(code);
    if (wasDown) return;
    const action=code==="KeyE"||code==="Enter"||code==="Space";
    if(game.state==="title"&&action){beginGame();return;}
    if(game.state==="dialogue"&&action){
      if(game.dialogue.index+1<game.dialogue.lines.length)game.dialogue.index++;else endDialogue();return;
    }
    if(game.state==="overworld"&&action)interact();
  });
  window.addEventListener("keyup",event=>game.keys.delete(event.code));
  window.addEventListener("blur",()=>game.keys.clear());
  requestAnimationFrame(frame);
})();
