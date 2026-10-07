class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = new Level();
    this.player = new Player(100, 100);
    this.keys = { left: false, right: false, jump: false, up: false, down: false };
    this.lightMap = [];
    this.lastTime = 0;
    this.running = false;
    this.initInput();
  }

  initInput() {
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
          this.keys.right = true;
          break;
        case 'ArrowUp':
        case 'w':
          this.keys.up = true;
          break;
        case 'ArrowDown':
        case 's':
          this.keys.down = true;
          break;
        case ' ':
          this.keys.jump = true;
          event.preventDefault();
          break;
        default:
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
          this.keys.right = false;
          break;
        case 'ArrowUp':
        case 'w':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
          this.keys.down = false;
          break;
        case ' ':
          this.keys.jump = false;
          break;
        default:
          break;
      }
    });
  }

  resize() {
    this.canvas.width = GRID_WIDTH * TILE_SIZE;
    this.canvas.height = GRID_HEIGHT * TILE_SIZE;
  }

  loadLevel(levelData) {
    if (levelData instanceof Level) {
      this.level = levelData;
    } else {
      this.level = Level.fromJSON(levelData);
    }
    this.resetPlayer();
    this.updateLighting();
  }

  resetPlayer() {
    const spawn = this.level.randomSpawnPoint();
    this.player = new Player(spawn.x, spawn.y, 22, 28);
    this.player.spawnX = spawn.x;
    this.player.spawnY = spawn.y;
  }

  updateLighting() {
    this.lightMap = LightingSystem.computeLightMap(this.level);
  }

  updateTriggers() {
    const triggerBlocks = this.level.blocks.filter((block) => block.type === 'button' || block.type === 'pressure');
    const playerRect = this.player.getRect();

    for (const trigger of triggerBlocks) {
      const rect = trigger.getRect();
      const touchingPlayer =
        playerRect.x < rect.x + rect.w &&
        playerRect.x + playerRect.w > rect.x &&
        playerRect.y < rect.y + rect.h &&
        playerRect.y + playerRect.h > rect.y;

      const nextState = trigger.type === 'button' ? touchingPlayer : touchingPlayer;
      trigger.active = nextState;

      if (trigger.connectToId !== null) {
        const target = this.level.getBlockById(trigger.connectToId);
        if (target) {
          target.active = nextState;
          if (target.type === 'moving') {
            target.moveOffsetX = nextState ? 1 : 0;
            target.moveOffsetY = nextState ? 0 : 0;
          }
          if (target.type === 'lightbulb') {
            target.color = trigger.color || DEFAULT_BULB_COLOR;
          }
        }
      }
    }

    for (const block of this.level.blocks) {
      if (block.type === 'lightbulb' && block.connectToId !== null) {
        const source = this.level.getBlockById(block.connectToId);
        if (source) {
          block.active = source.active;
        }
      }
    }
  }

  checkHazards() {
    const hazards = this.level.getHazardsAtRect(this.player.x, this.player.y, this.player.w, this.player.h);
    if (hazards.length) {
      this.resetPlayer();
    }
  }

  start() {
    this.running = true;
    const loop = (time) => {
      if (!this.running) return;
      const dt = Math.min((time - this.lastTime) / 1000 || 0.016, 0.032);
      this.lastTime = time;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    this.lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  update(dt) {
    this.updateTriggers();
    this.player.update(this.level, this.keys, dt);
    this.checkHazards();
    this.updateLighting();
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const light = this.lightMap[y]?.[x] ?? { lit: false, color: '#ffffff', strength: 0 };
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (!light.lit) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    for (const block of this.level.blocks) {
      this.drawBlock(block, ctx);
    }

    this.drawPlayer();
  }

  drawBlock(block, ctx) {
    const x = block.getRenderX() * TILE_SIZE;
    const y = block.getRenderY() * TILE_SIZE;

    ctx.save();
    ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);

    if (block.type === 'rotating') {
      ctx.rotate((Date.now() / 250) % (Math.PI * 2));
    }

    if (block.type === 'spike') {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = '#ffd0d0';
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-TILE_SIZE / 2 + i * 10, TILE_SIZE / 2);
        ctx.lineTo(-TILE_SIZE / 2 + 5 + i * 10, -TILE_SIZE / 2);
        ctx.lineTo(-TILE_SIZE / 2 + 10 + i * 10, TILE_SIZE / 2);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    if (block.type === 'ladder') {
      ctx.fillStyle = '#d39d5f';
      for (let i = 0; i < 5; i += 1) {
        ctx.fillRect(-TILE_SIZE / 2 + 4, -TILE_SIZE / 2 + i * 6, 4, 3);
        ctx.fillRect(TILE_SIZE / 2 - 8, -TILE_SIZE / 2 + i * 6, 4, 3);
      }
      ctx.restore();
      return;
    }

    if (block.type === 'torch') {
      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(-8, -TILE_SIZE / 2 + 3, 16, TILE_SIZE - 8);
      ctx.beginPath();
      ctx.arc(0, -12, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeb99';
      ctx.fill();
      ctx.restore();
      return;
    }

    if (block.type === 'lightbulb') {
      ctx.fillStyle = block.active ? block.color : '#7a7a7a';
      ctx.fillRect(-TILE_SIZE / 2 + 8, -TILE_SIZE / 2 + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      ctx.strokeStyle = '#d7d7d7';
      ctx.strokeRect(-TILE_SIZE / 2 + 8, -TILE_SIZE / 2 + 8, TILE_SIZE - 16, TILE_SIZE - 16);
      ctx.restore();
      return;
    }

    if (block.type === 'button') {
      ctx.fillStyle = block.active ? '#6fe7ff' : '#b1b1ff';
    } else if (block.type === 'pressure') {
      ctx.fillStyle = block.active ? '#ffb5ff' : '#dbb0ff';
    } else if (block.type === 'platform') {
      ctx.fillStyle = '#7d7d7d';
    } else if (block.type === 'start') {
      ctx.fillStyle = '#6ee7b7';
    } else if (block.type === 'lava') {
      ctx.fillStyle = '#ff8a3d';
    } else if (block.type === 'moving') {
      ctx.fillStyle = '#7ac7ff';
    } else if (block.type === 'rotating') {
      ctx.fillStyle = '#9cf49c';
    } else {
      ctx.fillStyle = '#ffffff';
    }

    ctx.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    ctx.restore();
  }

  drawPlayer() {
    const { x, y, w, h } = this.player;
    this.ctx.fillStyle = '#f8f8ff';
    this.ctx.fillRect(x, y, w, h);
  }
}
