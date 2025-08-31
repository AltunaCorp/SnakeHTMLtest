const CELL = 20; // tamaño de cada celda
const COLS = Math.floor(window.innerWidth / CELL);
const ROWS = Math.floor(window.innerHeight / CELL);

const snakeColors = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#a855f7"];
let currentColorIndex = 0;

class SnakeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SnakeScene' });
  }

  preload() {}

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD = this.input.keyboard.addKeys('W,A,S,D');

    this.score = 0;
    this.snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    this.food = this.randomFreeCell();
    this.obstacles = Array.from({ length: 10 }, () => this.randomFreeCell());

    this.running = true;
    this.gameOver = false;

    this.gfx = this.add.graphics();

    this.timer = this.time.addEvent({
      delay: 150,
      loop: true,
      callback: this.updateSnake,
      callbackScope: this
    });
  }

  randomFreeCell() {
    let p;
    do {
      p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (this.snake.some(s => s.x === p.x && s.y === p.y) ||
             this.obstacles.some(o => o.x === p.x && o.y === p.y));
    return p;
  }

  updateSnake() {
    if (!this.running) return;

    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // wrap alrededor de bordes
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;

    // colisiones
    if (this.snake.some(s => s.x === head.x && s.y === head.y) ||
        this.obstacles.some(o => o.x === head.x && o.y === head.y)) {
      this.running = false;
      this.gameOver = true;
    }

    // comer comida
    let ateFood = (head.x === this.food.x && head.y === this.food.y);

    this.snake.unshift(head);
    if (!ateFood) this.snake.pop();

    if (ateFood) {
      this.score++;
      if (this.score % 5 === 0) {
        currentColorIndex = (currentColorIndex + 1) % snakeColors.length;
      }
      this.food = this.randomFreeCell();
    }

    this.drawGame();
  }

  drawGame() {
    this.gfx.clear();
    this.cameras.main.setBackgroundColor('#0b1220');

    // Obstáculos
    this.gfx.fillStyle(0x64748b, 1);
    this.obstacles.forEach(o => this.gfx.fillRect(o.x * CELL, o.y * CELL, CELL, CELL));

    // Comida
    this.gfx.fillStyle(0xf43f5e, 1);
    this.gfx.fillCircle(this.food.x * CELL + CELL/2, this.food.y * CELL + CELL/2, CELL/2);

    // Serpiente
    this.gfx.fillStyle(snakeColors[currentColorIndex], 1);
    this.snake.forEach(s => this.gfx.fillRect(s.x * CELL, s.y * CELL, CELL, CELL));

    // Game Over
    if (this.gameOver) {
      this.add.text(window.innerWidth/2, window.innerHeight/2, "GAME OVER", { font:"32px Arial", color:"#fff" }).setOrigin(0.5);
    }
  }

  update() {
    if (!this.running) return;

    if (this.cursors.left.isDown || this.WASD.A.isDown) if (this.dir.x !== 1) this.nextDir = { x: -1, y: 0 };
    if (this.cursors.right.isDown || this.WASD.D.isDown) if (this.dir.x !== -1) this.nextDir = { x: 1, y: 0 };
    if (this.cursors.up.isDown || this.WASD.W.isDown) if (this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };
    if (this.cursors.down.isDown || this.WASD.S.isDown) if (this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  scene: [SnakeScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);
