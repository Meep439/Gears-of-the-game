class Editor {
  constructor(canvas, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = level;
    this.selectedBlock = 'platform';
    this.properties = {
      connectToId: 0,
      lightColor: '#ffff00',
      actionType: 'move'
    };
    this.pointer = null;
    this.init();
  }

  init() {
    this.resize();
    const blockButtons = document.querySelectorAll('.block-btn');
    blockButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.selectedBlock = button.dataset.block;
        this.updateSelectedText();
        this.updatePropertyPanel();
      });
    });

    this.canvas.addEventListener('mousedown', (event) => this.handleClick(event));
    this.canvas.addEventListener('mousemove', (event) => this.handlePointerMove(event));

    document.getElementById('apply-properties-btn').addEventListener('click', () => {
      const connectValue = Number(document.getElementById('connect-to-input').value || 0);
      const colorValue = document.getElementById('light-color-input').value;
      const actionTypeValue = document.getElementById('action-type-select').value;
      this.properties = {
        connectToId: connectValue,
        lightColor: colorValue,
        actionType: actionTypeValue
      };
    });

    document.getElementById('clear-level-btn').addEventListener('click', () => {
      this.level.clear();
      this.render();
    });

    this.updateSelectedText();
    this.updatePropertyPanel();
  }

  resize() {
    const width = GRID_WIDTH * TILE_SIZE;
    const height = GRID_HEIGHT * TILE_SIZE;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  handlePointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * this.canvas.width;
    const y = (event.clientY - rect.top) / rect.height * this.canvas.height;
    this.pointer = {
      x: Math.floor(x / TILE_SIZE),
      y: Math.floor(y / TILE_SIZE)
    };
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * this.canvas.width;
    const y = (event.clientY - rect.top) / rect.height * this.canvas.height;
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (this.selectedBlock === 'erase') {
      this.level.removeBlockAt(tileX, tileY);
      this.render();
      return;
    }

    const block = new Block(this.selectedBlock, tileX, tileY, {
      color: this.selectedBlock === 'lightbulb' ? this.properties.lightColor : this.getBlockColor(this.selectedBlock),
      connectToId: this.properties.connectToId,
      actionType: this.properties.actionType,
      moveOffsetX: this.selectedBlock === 'moving' ? 1 : 0,
      moveOffsetY: this.selectedBlock === 'moving' ? 0 : 0
    });

    if (this.selectedBlock === 'lightbulb') {
      block.color = this.properties.lightColor;
    }

    if (this.selectedBlock === 'torch') {
      block.color = '#f9d66b';
    }

    if (this.selectedBlock === 'moving' || this.selectedBlock === 'rotating') {
      block.moveOffsetX = 0;
      block.moveOffsetY = 0;
      block.color = '#8ac7ff';
    }

    this.level.addBlock(block);
    this.render();
  }

  getBlockColor(type) {
    const palette = {
      platform: '#7d7d7d',
      start: '#6ee7b7',
      button: '#b1b1ff',
      pressure: '#dbb0ff',
      spike: '#ff6b6b',
      lava: '#ff8a3d',
      lightbulb: '#ffd966',
      ladder: '#d3a15d',
      torch: '#ffb84d',
      moving: '#7ac7ff',
      rotating: '#9cf49c'
    };
    return palette[type] || '#ffffff';
  }

  updateSelectedText() {
    const text = BLOCK_LABELS[this.selectedBlock] || 'None';
    document.getElementById('selected-block').textContent = text;
  }

  updatePropertyPanel() {
    const shouldShow = ['lightbulb', 'button', 'pressure', 'moving', 'rotating'].includes(this.selectedBlock);
    const panel = document.getElementById('block-properties');
    panel.classList.toggle('hidden', !shouldShow);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#121826';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let x = 0; x <= GRID_WIDTH; x += 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_HEIGHT; y += 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }

    for (const block of this.level.blocks) {
      this.drawBlock(block, ctx);
    }

    if (this.pointer) {
      const px = this.pointer.x * TILE_SIZE;
      const py = this.pointer.y * TILE_SIZE;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
    }
  }

  drawBlock(block, ctx) {
    const x = block.getRenderX() * TILE_SIZE;
    const y = block.getRenderY() * TILE_SIZE;

    ctx.save();
    ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);

    if (block.type === 'rotating' && block.active) {
      ctx.rotate((Date.now() / 200) % (Math.PI * 2));
    }

    switch (block.type) {
      case 'platform':
        ctx.fillStyle = '#7d7d7d';
        break;
      case 'start':
        ctx.fillStyle = '#6ee7b7';
        break;
      case 'button':
        ctx.fillStyle = block.active ? '#6fe7ff' : '#b1b1ff';
        break;
      case 'pressure':
        ctx.fillStyle = block.active ? '#ffb5ff' : '#dbb0ff';
        break;
      case 'spike':
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#f2d7d5';
        for (let i = 0; i < 4; i += 1) {
          ctx.beginPath();
          ctx.moveTo(-TILE_SIZE / 2 + i * 10, TILE_SIZE / 2);
          ctx.lineTo(-TILE_SIZE / 2 + 5 + i * 10, -TILE_SIZE / 2);
          ctx.lineTo(-TILE_SIZE / 2 + 10 + i * 10, TILE_SIZE / 2);
          ctx.fill();
        }
        ctx.restore();
        return;
      case 'lava':
        ctx.fillStyle = '#ff8a3d';
        break;
      case 'lightbulb':
        ctx.fillStyle = block.active ? block.color : '#8d8d8d';
        break;
      case 'ladder':
        ctx.fillStyle = '#d3a15d';
        for (let i = 0; i < 5; i += 1) {
          ctx.fillRect(-TILE_SIZE / 2 + 4, -TILE_SIZE / 2 + i * 6, 4, 3);
          ctx.fillRect(TILE_SIZE / 2 - 8, -TILE_SIZE / 2 + i * 6, 4, 3);
        }
        ctx.restore();
        return;
      case 'torch':
        ctx.fillStyle = block.active ? '#ffb84d' : '#c99634';
        break;
      case 'moving':
        ctx.fillStyle = block.active ? '#41b7ff' : '#7ac7ff';
        break;
      case 'rotating':
        ctx.fillStyle = '#9cf49c';
        break;
      default:
        ctx.fillStyle = '#ffffff';
    }

    ctx.fillRect(-TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    ctx.restore();
  }
}
