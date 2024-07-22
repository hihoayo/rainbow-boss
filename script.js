const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  color: 'blue',
  speed: 7.5, // 1.5배 빠르게 설정
  dx: 0,
  dy: 0,
};

const bullets = [];
const enemies = [];
const bosses = [];
const enemySpawnInterval = 500; // 0.5 second (적의 수를 두 배로 증가시키기 위한 설정)
let lastEnemySpawn = 0;
let gameOver = false;
let enemyCount = 0;
let score = 0;
let bossColorPhase = 0; // 보스의 색상을 무지개색으로 변경하기 위한 변수

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) {
      bullets.splice(index, 1);
    } else {
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });
}

function drawEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
    } else {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
  });
}

function drawBosses() {
  bosses.forEach((boss, index) => {
    boss.y += boss.speed;
    if (boss.y > canvas.height) {
      bosses.splice(index, 1);
    } else {
      ctx.fillStyle = boss.color;
      ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    }
  });
}

function drawScore() {
  ctx.fillStyle = 'white'; // 점수판 색상을 흰색으로 설정
  ctx.font = '40px Arial'; // 폰트 크기를 40px로 설정하여 점수판을 크게 만듭니다.
  ctx.fillText(`Score: ${score}`, canvas.width - 200, 50); // 점수판 위치 조정
}

function getRainbowColor(phase) {
  const colors = [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF', // Blue
    '#4B0082', // Indigo
    '#8B00FF', // Violet
  ];
  return colors[phase % colors.length];
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 50);
  enemies.push({
    x: x,
    y: 0,
    width: 50,
    height: 50,
    color: 'red',
    speed: 3,
  });
  enemyCount++;

  if (enemyCount % 10 === 0) {
    spawnBoss();
  }
}

function spawnBoss() {
  const x = Math.random() * (canvas.width - 100);
  bosses.push({
    x: x,
    y: 0,
    width: 100,
    height: 100,
    color: getRainbowColor(bossColorPhase),
    speed: 1.5, // 다른 적보다 0.5배 느림
    health: 7, // 7번 맞아야 죽음
  });
  bossColorPhase++;
}

function update() {
  if (!gameOver) {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    const now = Date.now();
    if (now - lastEnemySpawn > enemySpawnInterval) {
      spawnEnemy();
      lastEnemySpawn = now;
    }

    checkCollision();
    checkBulletCollision();
  }
}

function checkCollision() {
  enemies.forEach((enemy, index) => {
    if (player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y) {
      gameOver = true;
      alert('Game Over!');
    }
  });

  bosses.forEach((boss, index) => {
    if (player.x < boss.x + boss.width &&
      player.x + player.width > boss.x &&
      player.y < boss.y + boss.height &&
      player.y + player.height > boss.y) {
      gameOver = true;
      alert('Game Over!');
    }
  });
}

function checkBulletCollision() {
  bullets.forEach((bullet, bIndex) => {
    enemies.forEach((enemy, eIndex) => {
      if (bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y) {
        bullets.splice(bIndex, 1); // 총알 제거
        enemies.splice(eIndex, 1); // 적 제거
        score += 1; // 적을 죽일 때마다 1점 추가
      }
    });

    bosses.forEach((boss, boIndex) => {
      if (bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y) {
        bullets.splice(bIndex, 1); // 총알 제거
        boss.health -= 1; // 보스 체력 감소
        if (boss.health <= 0) {
          bosses.splice(boIndex, 1); // 보스 제거
          score += 3; // 보스를 죽일 때마다 3점 추가
        }
      }
    });
  });
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clear();
  drawPlayer();
  drawBullets();
  drawEnemies();
  drawBosses();
  drawScore(); // 점수 표시
}

function loop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

function keyDown(e) {
  if (e.key === 'ArrowRight' || e.key === 'd') {
    player.dx = player.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.dx = -player.speed;
  } else if (e.key === 'ArrowUp' || e.key === 'w') {
    player.dy = -player.speed;
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    player.dy = player.speed;
  } else if (e.key === ' ') {
    bullets.push({
      x: player.x + player.width / 2 - 5,
      y: player.y,
      width: 10,
      height: 40, // 레이저를 더 길게 설정
      color: 'lime', // 레이저 색상
      speed: 10,
    });
  }
}

function keyUp(e) {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
    player.dx = 0;
  } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ArrowDown' || e.key === 's') {
    player.dy = 0;
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

loop();
