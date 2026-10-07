class Player {
  constructor(x, y, w = 22, h = 28) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.onLadder = false;
    this.spawnX = x;
    this.spawnY = y;
  }

  getRect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
  }

  update(level, input, dt) {
    const moveSpeed = 220;
    const jumpPower = 440;

    if (input.left) this.vx = -moveSpeed;
    else if (input.right) this.vx = moveSpeed;
    else this.vx *= 0.75;

    if (input.jump && this.onGround) {
      this.vy = -jumpPower;
      this.onGround = false;
    }

    if (this.onLadder && (input.up || input.down)) {
      this.vy = (input.up ? -150 : 150);
      this.vy *= 0.9;
    } else {
      this.vy += 900 * dt;
      if (this.vy > 720) this.vy = 720;
    }

    PhysicsEngine.resolvePlayer(level, this, dt);
  }
}
