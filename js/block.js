class Block {
  constructor(type, x, y, options = {}) {
    this.id = options.id ?? Block.nextId();
    this.type = type;
    this.x = x;
    this.y = y;
    this.color = options.color ?? '#ffffff';
    this.active = Boolean(options.active);
    this.connectToId = options.connectToId ?? null;
    this.actionType = options.actionType ?? 'move';
    this.moveOffsetX = options.moveOffsetX ?? 0;
    this.moveOffsetY = options.moveOffsetY ?? 0;
    this.rotation = options.rotation ?? 0;
    this.originX = x;
    this.originY = y;
  }

  static nextId() {
    if (!Block._nextId) Block._nextId = 1;
    const id = Block._nextId;
    Block._nextId += 1;
    return id;
  }

  isSolid() {
    return ['platform', 'start', 'button', 'pressure', 'moving', 'rotating', 'lightbulb'].includes(this.type);
  }

  isHazard() {
    return ['spike', 'lava'].includes(this.type);
  }

  isLightSource() {
    return this.type === 'torch' || (this.type === 'lightbulb' && this.active);
  }

  getRenderX() {
    if (this.type === 'moving') {
      return this.x + (this.active ? this.moveOffsetX : 0);
    }
    return this.x;
  }

  getRenderY() {
    if (this.type === 'moving') {
      return this.y + (this.active ? this.moveOffsetY : 0);
    }
    return this.y;
  }

  getRect() {
    return {
      x: this.getRenderX() * TILE_SIZE,
      y: this.getRenderY() * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE
    };
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      color: this.color,
      active: this.active,
      connectToId: this.connectToId,
      actionType: this.actionType,
      moveOffsetX: this.moveOffsetX,
      moveOffsetY: this.moveOffsetY,
      rotation: this.rotation,
      originX: this.originX,
      originY: this.originY
    };
  }

  static fromJSON(data) {
    return new Block(data.type, data.x, data.y, {
      id: data.id,
      color: data.color,
      active: data.active,
      connectToId: data.connectToId,
      actionType: data.actionType,
      moveOffsetX: data.moveOffsetX,
      moveOffsetY: data.moveOffsetY,
      rotation: data.rotation,
      originX: data.originX,
      originY: data.originY
    });
  }
}
