class PhysicsEngine {
  static resolvePlayer(level, player, dt) {
    player.x += player.vx * dt;
    const hit = this.getSolidCollisions(level, player);
    if (hit) {
      if (player.vx > 0) {
        player.x = hit.x - player.w;
      }
      if (player.vx < 0) {
        player.x = hit.x + hit.w;
      }
      player.vx = 0;
    }

    player.y += player.vy * dt;
    player.onGround = false;

    const verticalHits = this.getSolidCollisions(level, player);
    if (verticalHits) {
      if (player.vy > 0) {
        player.y = verticalHits.y - player.h;
        player.onGround = true;
      }
      if (player.vy < 0) {
        player.y = verticalHits.y + verticalHits.h;
      }
      player.vy = 0;
    }

    // Ladder climbing check.
    const ladder = level.getLadderNear(player);
    if (ladder) {
      player.onLadder = true;
    } else {
      player.onLadder = false;
    }

    if (player.y > level.height * TILE_SIZE + 120) {
      player.respawn();
    }
  }

  static getSolidCollisions(level, player) {
    const rect = player.getRect();
    const candidates = level.getSolidBlocksAtRect(rect.x, rect.y, rect.w, rect.h);

    if (!candidates.length) return null;

    const collided = candidates[0];
    const blockRect = collided.getRect();

    const overlapLeft = rect.x + rect.w - blockRect.x;
    const overlapRight = blockRect.x + blockRect.w - rect.x;
    const overlapTop = rect.y + rect.h - blockRect.y;
    const overlapBottom = blockRect.y + blockRect.h - rect.y;

    const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (min === overlapLeft) return { x: blockRect.x, y: blockRect.y, w: blockRect.w, h: blockRect.h };
    if (min === overlapRight) return { x: blockRect.x, y: blockRect.y, w: blockRect.w, h: blockRect.h };
    if (min === overlapTop) return { x: blockRect.x, y: blockRect.y, w: blockRect.w, h: blockRect.h };
    return { x: blockRect.x, y: blockRect.y, w: blockRect.w, h: blockRect.h };
  }
}
