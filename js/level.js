class Level {
  constructor() {
    this.width = GRID_WIDTH;
    this.height = GRID_HEIGHT;
    this.blocks = [];
  }

  addBlock(block) {
    if (!block) return;
    this.removeBlockAt(block.x, block.y);
    this.blocks.push(block);
  }

  removeBlockAt(x, y) {
    this.blocks = this.blocks.filter((block) => !(block.x === x && block.y === y));
  }

  getBlockAt(x, y) {
    return this.blocks.find((block) => block.x === x && block.y === y) ?? null;
  }

  getBlockById(id) {
    return this.blocks.find((block) => block.id === id) ?? null;
  }

  getSolidBlocksAtRect(x, y, w, h) {
    const minX = Math.floor(x / TILE_SIZE);
    const maxX = Math.floor((x + w - 1) / TILE_SIZE);
    const minY = Math.floor(y / TILE_SIZE);
    const maxY = Math.floor((y + h - 1) / TILE_SIZE);

    const results = [];
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) continue;
        const block = this.getBlockAt(cx, cy);
        if (block && block.isSolid()) {
          results.push(block);
        }
      }
    }
    return results;
  }

  getHazardsAtRect(x, y, w, h) {
    const minX = Math.floor(x / TILE_SIZE);
    const maxX = Math.floor((x + w - 1) / TILE_SIZE);
    const minY = Math.floor(y / TILE_SIZE);
    const maxY = Math.floor((y + h - 1) / TILE_SIZE);

    const results = [];
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        const block = this.getBlockAt(cx, cy);
        if (block && block.isHazard()) {
          results.push(block);
        }
      }
    }
    return results;
  }

  getLadderNear(player) {
    const rect = player.getRect();
    const minX = Math.floor(rect.x / TILE_SIZE);
    const maxX = Math.floor((rect.x + rect.w) / TILE_SIZE);
    const minY = Math.floor((rect.y - 4) / TILE_SIZE);
    const maxY = Math.floor((rect.y + rect.h + 4) / TILE_SIZE);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const block = this.getBlockAt(x, y);
        if (block && block.type === 'ladder') {
          return block;
        }
      }
    }
    return null;
  }

  getStartBlocks() {
    return this.blocks.filter((block) => block.type === 'start');
  }

  randomSpawnPoint() {
    const starts = this.getStartBlocks();
    if (!starts.length) {
      return { x: 1, y: 1 };
    }
    const start = starts[Math.floor(Math.random() * starts.length)];
    return {
      x: start.x * TILE_SIZE + 6,
      y: start.y * TILE_SIZE + 6
    };
  }

  clear() {
    this.blocks = [];
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      blocks: this.blocks.map((block) => block.toJSON())
    };
  }

  static fromJSON(data) {
    const level = new Level();
    level.width = data.width ?? level.width;
    level.height = data.height ?? level.height;
    level.blocks = (data.blocks || []).map((blockData) => Block.fromJSON(blockData));
    return level;
  }

  serialize() {
    const json = JSON.stringify(this.toJSON());
    return btoa(unescape(encodeURIComponent(json)));
  }

  static deserialize(code) {
    const json = decodeURIComponent(escape(atob(code)));
    return Level.fromJSON(JSON.parse(json));
  }
}
