class LightingSystem {
  static computeLightMap(level) {
    const lightMap = [];
    for (let y = 0; y < level.height; y += 1) {
      const row = [];
      for (let x = 0; x < level.width; x += 1) {
        row.push(this.getTileLight(level, x, y));
      }
      lightMap.push(row);
    }
    return lightMap;
  }

  static getTileLight(level, tileX, tileY) {
    const centerX = tileX + 0.5;
    const centerY = tileY + 0.5;

    let bestResult = { lit: false, color: '#ffffff', strength: 0 };

    for (const block of level.blocks) {
      if (!block.isLightSource()) continue;

      const sx = block.getRenderX() + 0.5;
      const sy = block.getRenderY() + 0.5;
      const dx = centerX - sx;
      const dy = centerY - sy;
      const dist = Math.hypot(dx, dy);

      if (dist > MAX_LIGHT_DISTANCE) continue;

      if (this.hasLineOfSight(level, sx, sy, centerX, centerY)) {
        const brightness = 1 - dist / MAX_LIGHT_DISTANCE;
        if (brightness > bestResult.strength) {
          bestResult = {
            lit: true,
            color: block.color || '#ffffff',
            strength: brightness
          };
        }
      }
    }

    return bestResult;
  }

  static hasLineOfSight(level, x1, y1, x2, y2) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 3;

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      if (tileX < 0 || tileY < 0 || tileX >= level.width || tileY >= level.height) continue;

      const block = level.getBlockAt(tileX, tileY);
      if (block && block.isSolid()) {
        return false;
      }
    }

    return true;
  }
}
