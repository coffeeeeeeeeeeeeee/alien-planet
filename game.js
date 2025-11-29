const Game_State = {
	Playing: 1,
	Menu: 0,
	GameOver: 2,
	UpgradeSelection: 3,
};

const Tile = {
	Empty: 0,
	Indestructible: 1,
	Diamond: 2,
	Sand: 3,
	Dirt: 4,
	Brick: 5,
	Soil: 6,
	PowerBlock: 7,
	WormChunk: 8,
	Vegetation: 9,
	CityWall: 10,
	CityFloor: 11,
};

const Tile_Names = {
	[Tile.Indestructible]: "Indestructible",
	[Tile.Sand]: "Arena",
	[Tile.Dirt]: "Tierra",
	[Tile.Brick]: "Ladrillo",
	[Tile.Soil]: "Subsuelo",
	[Tile.Diamond]: "Diamante",
	[Tile.WormChunk]: "Carne de Gusano",
	[Tile.CityWall]: "City Wall",
	[Tile.CityFloor]: "City Floor",
};

const Tile_Properties = {
	[Tile.Indestructible]: { color: '#000000', maxHp: Infinity },
	[Tile.Sand]:           { color: '#d2b48c', maxHp: 80,  sides: 0 },
	[Tile.Dirt]:           { color: '#bc6c25', maxHp: 120, sides: 3 },
	[Tile.Brick]:          { color: '#b22222', maxHp: 300, sides: 4 },
	[Tile.Soil]:           { color: '#8B4513', maxHp: 200, sides: 5 },
	[Tile.Diamond]:        { color: '#00b4d8', maxHp: 800, sides: 6 },
	[Tile.PowerBlock]:     { color: '#8b8bd0', maxHp: 200 },
	[Tile.WormChunk]:      { color: '#C70039', maxHp: 0,   sides: 8 },
	[Tile.Vegetation]:     { color: '#84398c', maxHp: 1 },
	[Tile.CityWall]:       { color: '#4a4a6a', maxHp: 500, sides: 4 },
	[Tile.CityFloor]:      { color: '#3a3a5a', maxHp: 400, sides: 4 },
};


const laserSound = {
	frequency: 150,
	duration: 0.2,
	type: 'sawtooth',
	volume: 0.025,
	release: 0.15
};

const blockSound = {
	frequency: 880,
	duration: 0.05,
	type: 'square',
	volume: 0.2,
	attack: 0.005,
	release: 0.04
}

const inventorySound = {
	frequency: 1200,
	duration: 0.08,
	type: 'triangle',
	volume: 0.2,
	release: 0.05
}

const jumpSound = {
	frequency: 440,
	duration: 0.1,
	type: 'sine',
	volume: 0.4,
	attack: 0.01,
	release: 0.08
}

const wormDeathSound = {
	frequency: 50,
	duration: 0.5,
	type: 'sawtooth',
	volume: 0.2
}

const wormEatSound = {
	frequency: 100,
	duration: 0.2,
	type: 'sawtooth',
	volume: 0.08
}

const wormHitSound = {
	frequency: 200,
	duration: 0.3,
	type: 'square',
	volume: 0.25
}

const powerBlockSound = {
	frequency: 900,
	duration: 0.15,
	type: 'sine',
	volume: 0.1,
	release: 0.1
};

const powerBlockActivateSound = {
	frequency: 600,
	duration: 0.5,
	type: 'triangle',
	volume: 0.4,
	attack: 0.01,
	release: 0.4
};

const Upgrades = [
	{
		id: 'laser_damage',
		name: "Laser Power",
		info: "+20% Damage",
		image: "card1",
		apply: (game) => { game.player.laserDamage *= 1.2; }
	}, {
		id: 'laser_range',
		name: "Laser Range",
		info: "+15% Range",
		image: "card2",
		apply: (game) => { game.player.laserRange *= 1.15; }
	}, {
		id: 'max_energy',
		name: "Amplified Battery",
		info: "+25% Max Energy",
		image: "card3",
		apply: (game) => { game.player.maxEnergy *= 1.25; game.player.energy = game.player.maxEnergy; }
	}, {
		id: 'energy_regen',
		name: "Fast Charge",
		info: "+20% Regeneration",
		image: "card4",
		apply: (game) => { game.player.energyRegen *= 1.2; }
	}, {
		id: 'jump_force',
		name: "Power Jump",
		info: "+10% Height of the Jump",
		image: "card5",
		apply: (game) => { game.player.jumpForce *= 1.1; }
	}, {
		id: 'radar_range',
		name: "Far Reach Radar",
		info: "+10% Radar Range",
		image: "card6",
		apply: (game) => { game.RADAR_RANGE *= 1.1; }
	}, {
		id: 'health_regen',
		name: "Auto-Repair",
		info: "+0.1 Life per second",
		image: "card7",
		apply: (game) => { game.player.healthRegen += 0.01; }
	}, {
		id: 'max_health',
		name: "Reinforced armor",
		info: "+20% Max Life",
		image: "card8",
		apply: (game) => { game.player.maxHealth *= 1.2; game.player.health = game.player.maxHealth; }
	}, {
		id: 'turbo_speed',
		name: "Enhanced Turbo",
		info: "+10% Turbo Speed",
		image: "card9",
		apply: (game) => { game.player.turboMultiplier *= 1.1; }
	},
];

class Game {
	TILE_SIZE = 40;
	MAP_HEIGHT = 256;
	SPAWN_AREA_WIDTH = 100;
	INVINCIBILITY_TIME = 40;

	ITEM_SCALE = 6;
	ITEM_GRAVITY = 0.3;
	ITEM_FRICTION = 0.98;
	ITEM_BOUNCE = -0.3;
	ITEM_ANIMATION_SPEED = 0.2; // 0..1

	OVERLAP_FACTOR = 1.005;
	BACKGROUND_PARALLAX_SPEED = 0.3;

	SKY_COLOR = "#8ecae6";
	MENU_COLOR = '#141428';
	WORM_HEAD_COLOR = '#C70039';

	MAX_WORMS = 3;
	WORM_SPAWN_DEPTH = 10;
	WORM_MOVE_INTERVAL = 60;
	WORM_HEAD_DAMAGE = 50;
	WORM_SEGMENT_DAMAGE = 25;
	WORM_SEGMENT_RADIUS = 10;
	WORM_DISTANCE_PER_RADIUS = 1.6;
	WORM_SPEED = 0.1;
	WORM_HEAD_HEALTH = 220;
	WORM_BODY_HEALTH = 80;
	WORM_GROWTH_CHANCE = 1 / 3;
	WORM_RADIUS_GROWTH_FACTOR = 0.5;
	WORM_SOUND_MAX_DISTANCE = 10 * this.TILE_SIZE;

	POWER_CHANCE_FACTOR = 0.05;
	POWER_BLOCK_SOUND_INTERVAL = 120;

	PLAYER_HEALTH = 100;
	PLAYER_MAX_HEALTH = 100;
	PLAYER_ENERGY = 300;
	PLAYER_MAX_ENERGY = 300;
	PLAYER_ENERGY_REGEN = 3;
	PLAYER_LASER_ENERGY_COST = 0.5;
	PLAYER_TURBO_ENERGY_COST = 0.3;

	RADAR_RADIUS = 80;
	RADAR_MARGIN = 20;
	RADAR_BG_COLOR = '#0a1a0a';
	RADAR_LINE_COLOR = 'rgba(0, 255, 0, 0.5)';
	RADAR_BLIP_COLOR = '#00FF00';
	RADAR_ARROW_RADIUS_OFFSET = 15;
	RADAR_ARROW_SIZE = 12;
	RADAR_ARROW_COLOR = 'rgba(0, 255, 0, 0.7)';
	RADAR_ENEMY_COLOR = '#FF4444';

	CITY_LAYER = 100;
	CITY_HEIGHT = 30;
	CITY_ROOM_MIN_SIZE = 6;
	CITY_ROOM_MAX_SIZE = 12;
	CITY_CORRIDOR_WIDTH = 3;
	CITY_ROOMS_COUNT = 8;
	CITY_WIDTH = 150;
	cityRooms = null;

	engine = null;
	state = Game_State.Menu;

	customFont = null;
	titleImage = null;
	backgroundImage = null;
	averageBgColor = '#283618';

	gravity = 0.5;
	radarRange = 25 * this.TILE_SIZE;

	mousePos = { x: 0, y: 0 };
	isMouseDown = false;
	lastIsMouseDown = false;
	noiseOffsetX = 0;

	availableUpgrades = [];
	flyingItems = [];
	enemies = [];
	powerBlocks = [];

	tileChanges = {};
	inventory = {};
	uiItemRotation = 0;

	fogOfWar = {
		enabled: false,
		color: 'rgba(20, 20, 40, 0.95)',
		revealRadius: 250,
		blurSize: 100
	};
	
	tileFrameMap = {
		[Tile.Diamond]: 0,
		[Tile.Sand]: 1,
		[Tile.Dirt]: 2,
		[Tile.Brick]: 3,
		[Tile.Soil]: 4,
		[Tile.PowerBlock]: 5,
		[Tile.CityWall]: 3,
		[Tile.CityFloor]: 4,
	};

	camera = {
		x: 0,
		y: 0,
		lerp: 0.1,
		zoom: 1.0,
		minZoom: 0.5,
		maxZoom: 2.0
	};

	player = {
		x: 0,
		y: 0,
		velocityX: 0,
		velocityY: 0,
		isGrounded: false,
		isTurboActive: false,
		isOverheated: false,
		radius: 18,
		speed: 5,
		jumpForce: -12,
		acceleration: 0.5,
		friction: 0.95,
		rotation: 0,
		laserDamage: 10,
		laserRange: 300,
		pickupRadius: 50,
		turboMultiplier: 2,
		invincibilityTimer: 0,
		health: this.PLAYER_HEALTH,
		maxHealth: this.PLAYER_MAX_HEALTH,
		energy: this.PLAYER_ENERGY,
		maxEnergy: this.PLAYER_MAX_ENERGY,
		energyRegen: 3,
		healthRegen: 0,
	};
	
	laser = {
		isActive: false,
		startPoint: {x: 0, y: 0},
		endPoint: {x: 0, y: 0},
		hitParticles: []
	};
	
	selectedUpgradeIndex = 0;
	lastKeysPressed = {}; 

	constructor(engine) {
		this.engine = engine;
		this.noiseOffsetX = Math.random() * 10000;
		this.engine.setMasterVolume(0.5);
	}

	async start() {
		this.customFont = await this.engine.loadFont('pixelFont', 'assets/fonts/videotype.ttf');

		const tilesetImage = await this.engine.loadBase64Image(tileset_base64);
		const wheelImage = await this.engine.loadBase64Image(wheel_base64);
		const wormBodyImage = await this.engine.loadBase64Image(wormBody_base64);
		const wormHeadImage = await this.engine.loadBase64Image(wormHead_base64);
		const vegetationImage = await this.engine.loadBase64Image(vegetation_base64);

		const card1Image = await this.engine.loadBase64Image(card1_base64);
		const card2Image = await this.engine.loadBase64Image(card2_base64);
		const card3Image = await this.engine.loadBase64Image(card3_base64);
		const card4Image = await this.engine.loadBase64Image(card4_base64);
		const card5Image = await this.engine.loadBase64Image(card5_base64);
		const card6Image = await this.engine.loadBase64Image(card6_base64);
		const card7Image = await this.engine.loadBase64Image(card7_base64);
		const card8Image = await this.engine.loadBase64Image(card8_base64);
		const card9Image = await this.engine.loadBase64Image(card9_base64);
		
		this.titleImage = await this.engine.loadBase64Image(title_base64);
		this.backgroundImage = await this.engine.loadBase64Image(bg_base64);
		this.averageBgColor = await this.calculateAverageBgColor(this.backgroundImage);
		
		await this.engine.loadSprite('player_wheel', wheelImage);
		await this.engine.loadSprite('worm_body', wormBodyImage);
		await this.engine.loadSprite('worm_head', wormHeadImage);
		await this.engine.loadSprite('tileset', tilesetImage, 1, 16, 16);
		await this.engine.loadSprite('vegetation', vegetationImage, 4, 16, 16);

		await this.engine.loadSprite('card1', card1Image);
		await this.engine.loadSprite('card2', card2Image);
		await this.engine.loadSprite('card3', card3Image);
		await this.engine.loadSprite('card4', card4Image);
		await this.engine.loadSprite('card5', card5Image);
		await this.engine.loadSprite('card6', card6Image);
		await this.engine.loadSprite('card7', card7Image);
		await this.engine.loadSprite('card8', card8Image);
		await this.engine.loadSprite('card9', card9Image);

		this.initPlayerPosition();
		this.setupEventListeners();
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	async calculateAverageBgColor(image) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;
		ctx.drawImage(image, 0, 0);

		const lastRowData = ctx.getImageData(0, canvas.height - 1, canvas.width, 1).data;
		
		let totalR = 0, totalG = 0, totalB = 0;
		for (let i = 0; i < lastRowData.length; i += 4) {
			totalR += lastRowData[i];
			totalG += lastRowData[i + 1];
			totalB += lastRowData[i + 2];
		}

		const pixelCount = lastRowData.length / 4;
		const avgR = Math.floor(totalR / pixelCount);
		const avgG = Math.floor(totalG / pixelCount);
		const avgB = Math.floor(totalB / pixelCount);
		
		return this.engine.rgbToHex(avgR, avgG, avgB);
	}
	
	setupEventListeners() {
		const canvas = this.engine.canvas;
		canvas.addEventListener('mousemove', e => {
			const rect = canvas.getBoundingClientRect();
			this.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		});
		canvas.addEventListener('mousedown', e => { if (e.button === 0) this.isMouseDown = true; });
		canvas.addEventListener('mouseup', e => { if (e.button === 0) this.isMouseDown = false; });

		canvas.addEventListener('wheel', e => {
			e.preventDefault(); 
			this.handleZoom(e);
		}, { passive: false });
	}

	mainLoop(timestamp) {
		this.engine.tick(timestamp);
		this.update();
		this.drawGame();
		requestAnimationFrame(this.mainLoop.bind(this));
	}
	
	update() {
		const keys = this.engine.keysPressed;
		const justPressed = (key) => keys[key] && !this.lastKeysPressed[key];
		const justClicked = this.isMouseDown && !this.lastIsMouseDown;
		
		let isEnergyBeingSpentThisFrame = false;

		if (this.state === Game_State.Menu || this.state === Game_State.GameOver) {
			if (justPressed("Enter") || justPressed("Space")) {
				this.state = Game_State.Playing;
				this.resetGame();
			}
			this.lastKeysPressed = { ...keys };
			this.lastIsMouseDown = this.isMouseDown;
			return;
		}

		if (this.state === Game_State.UpgradeSelection) {
			const numUpgrades = this.availableUpgrades.length;
			let choice = -1;
			
			const cardData = this.getCardLayoutData();
			let mouseOverIndex = -1;
			
			cardData.cardRects.forEach((rect, index) => {
				if (this.isMouseOverCard(rect, this.mousePos)) {
					mouseOverIndex = index;
					this.selectedUpgradeIndex = index;
				}
			});

			if (justPressed("ArrowLeft") || justPressed("KeyA")) {
				this.selectedUpgradeIndex = (this.selectedUpgradeIndex - 1 + numUpgrades) % numUpgrades;
				mouseOverIndex = this.selectedUpgradeIndex;
			}
			if (justPressed("ArrowRight") || justPressed("KeyD")) {
				this.selectedUpgradeIndex = (this.selectedUpgradeIndex + 1) % numUpgrades;
				mouseOverIndex = this.selectedUpgradeIndex;
			}
			
			if (justPressed("Digit1")) choice = 0;
			if (justPressed("Digit2")) choice = 1;
			if (justPressed("Digit3")) choice = 2;
			
			if (justPressed("Space") || justPressed("Enter")) {
				choice = this.selectedUpgradeIndex;
			}
			
			if (justClicked && mouseOverIndex !== -1) {
				choice = mouseOverIndex;
			}

			if (choice !== -1 && this.availableUpgrades[choice]) {
				this.availableUpgrades[choice].apply(this);
				this.state = Game_State.Playing;
				this.availableUpgrades = [];
			} else if (justPressed("Escape")) {
				this.state = Game_State.Playing;
				this.availableUpgrades = [];
			}
			
			this.lastKeysPressed = { ...keys };
			this.lastIsMouseDown = this.isMouseDown;
			return;
		}

		this.manageInputs();

		if (this.player.isTurboActive) {
			isEnergyBeingSpentThisFrame = true;
		}

		this.updatePlayer();
		this.updateLaser();

		if (this.laser.isActive) {
			isEnergyBeingSpentThisFrame = true;
		}

		this.updateParticles();
		this.updateCamera();
		this.updateFlyingItems();
		this.updateEnemies();
		this.updatePowerBlocks();

		if (this.player.invincibilityTimer > 0) {
			this.player.invincibilityTimer--;
		}
		this.uiItemRotation += 0.5;

		if (!isEnergyBeingSpentThisFrame && this.player.energy < this.player.maxEnergy) {
			this.player.energy += this.player.energyRegen;
			
			if (this.player.energy > this.player.maxEnergy) {
				this.player.energy = this.player.maxEnergy;
			}

			if (this.player.isOverheated && this.player.energy > this.player.maxEnergy * 0.5) { 
				this.player.isOverheated = false;
			} else if (this.player.isOverheated && this.player.energy === this.player.maxEnergy) {
				this.player.isOverheated = false;
			}

		} else if (isEnergyBeingSpentThisFrame) {
			if (this.player.energy <= 0) {
				this.player.isOverheated = true;
			}
		}

		if (this.player.health < this.player.maxHealth && this.player.health > 0) {
			this.player.health += this.player.healthRegen;
			if (this.player.health > this.player.maxHealth) {
				this.player.health = this.player.maxHealth;
			}
		}

		if (this.player.health <= 0) {
			this.state = Game_State.GameOver;
		}

		this.lastKeysPressed = { ...keys };
		this.lastIsMouseDown = this.isMouseDown;
	}
	
	getCardLayoutData() {
		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();
		
		const cardWidth = 256;
		const cardHeight = 400;
		const cardGap = 30;

		const totalWidth = (cardWidth * 3) + (cardGap * 2);
		const startX = (canvasWidth - totalWidth) / 2;
		const startY = (canvasHeight - cardHeight) / 2;
		
		const cardRects = this.availableUpgrades.map((_, index) => ({
			x: startX + index * (cardWidth + cardGap),
			y: startY,
			width: cardWidth,
			height: cardHeight
		}));

		return { cardWidth, cardHeight, cardGap, totalWidth, startX, startY, cardRects };
	}
	
	isMouseOverCard(rect, mousePos) {
		return mousePos.x >= rect.x &&
			   mousePos.x <= rect.x + rect.width &&
			   mousePos.y >= rect.y &&
			   mousePos.y <= rect.y + rect.height;
	}

	triggerUpgradeSelection() {
		this.state = Game_State.UpgradeSelection;
		const shuffled = [...Upgrades].sort(() => 0.5 - Math.random());
		this.availableUpgrades = shuffled.slice(0, 3);
		this.selectedUpgradeIndex = 0; 
	}

	resetGame() {
		this.player.health = this.PLAYER_MAX_HEALTH;
		this.player.maxHealth = this.PLAYER_MAX_HEALTH;
		this.player.energy = this.PLAYER_MAX_ENERGY;
		this.player.maxEnergy = this.PLAYER_MAX_ENERGY;
		this.player.energyRegen = this.PLAYER_ENERGY_REGEN;
		this.player.healthRegen = 0;
		this.player.laserDamage = 10;
		this.player.laserRange = 300;
		this.player.jumpForce = -12;
		this.player.turboMultiplier = 2;
		this.radarRange = 25 * this.TILE_SIZE;

		this.player.isLaserOverheated = false;
		this.player.isTurboOverheated = false;
		this.player.invincibilityTimer = 0;
		this.initPlayerPosition();
		this.inventory = {};
		this.enemies = [];
		this.flyingItems = [];
		this.powerBlocks = [];
		this.tileChanges = {};
		this.availableUpgrades = [];
		this.camera.x = 0;
		this.camera.y = 0;
		this.generateInitialPowerBlocks(2);
	}

	manageInputs() {
		const keys = this.engine.keysPressed;

		const isMovingHorizontally = keys["KeyD"] || keys["ArrowRight"] || keys["KeyA"] || keys["ArrowLeft"];
		const shiftPressed = keys["ShiftLeft"] || keys["ShiftRight"];

		this.player.isTurboActive = isMovingHorizontally && shiftPressed && !this.player.isOverheated && this.player.energy > this.PLAYER_TURBO_ENERGY_COST;
		
		let maxSpeed = this.player.speed;
		if (this.player.isTurboActive) {
			maxSpeed = this.player.speed * this.player.turboMultiplier;
			this.player.energy -= this.PLAYER_TURBO_ENERGY_COST;

			if (this.player.energy <= 0) {
				this.player.energy = 0;
				this.player.isOverheated = true;
			}
		}

		if (keys["KeyD"] || keys["ArrowRight"]) {
			if (this.player.velocityX < maxSpeed) {
				this.player.velocityX += this.player.acceleration;
			}
		} else if (keys["KeyA"] || keys["ArrowLeft"]) {
			if (this.player.velocityX > -maxSpeed) {
				this.player.velocityX -= this.player.acceleration;
			}
		} else {
			this.player.velocityX *= this.player.friction;
			if (Math.abs(this.player.velocityX) < 0.1) {
				this.player.velocityX = 0;
			}
		}

		this.player.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, this.player.velocityX));

		if ((keys["KeyW"] || keys["ArrowUp"] || keys["Space"]) && this.player.isGrounded) {
			this.player.velocityY = this.player.jumpForce;
			this.player.isGrounded = false;
			this.playSoundAtLocation(jumpSound, this.player);
		}
	}
	
	updatePlayer() {
		this.player.velocityY += this.gravity;
		this.player.x += this.player.velocityX;
		this.handleCollisions('x');
		this.player.y += this.player.velocityY;
		this.handleCollisions('y');
		this.player.rotation += this.player.velocityX * 0.02;
	}

	handleCollisions(axis) {
		const gridX = Math.floor(this.player.x / this.TILE_SIZE);
		const gridY = Math.floor(this.player.y / this.TILE_SIZE);
		
		for (let y = gridY - 2; y < gridY + 3; y++) {
			for (let x = gridX - 2; x < gridX + 3; x++) {
				const tileData = this.getTileAt(x, y);
				if (tileData && tileData.type > Tile.Empty && tileData.type !== Tile.Vegetation) {
					const tileRect = { x: x * this.TILE_SIZE, y: y * this.TILE_SIZE, width: this.TILE_SIZE, height: this.TILE_SIZE };
					const closestX = Math.max(tileRect.x, Math.min(this.player.x, tileRect.x + tileRect.width));
					const closestY = Math.max(tileRect.y, Math.min(this.player.y, tileRect.y + tileRect.height));
					const distSq = ((this.player.x - closestX) ** 2) + ((this.player.y - closestY) ** 2);

					if (distSq < (this.player.radius * this.player.radius)) {
						const overlap = this.player.radius - Math.sqrt(distSq);
						const angle = Math.atan2(this.player.y - closestY, this.player.x - closestX);
						if (axis === 'x') {
							this.player.x += overlap * Math.cos(angle);
						} else {
							this.player.y += overlap * Math.sin(angle);
							if (this.player.velocityY > 0 && Math.sin(angle) < 0) this.player.isGrounded = true;
							this.player.velocityY = 0;
						}
					}
				}
			}
		}
	}

	updateLaser() {
		if (!this.isMouseDown || this.player.isOverheated) {
			this.laser.isActive = false;
			return;
		}

		this.laser.isActive = true;
		this.player.energy -= this.PLAYER_LASER_ENERGY_COST;

		if (this.player.energy <= 0) {
			this.player.energy = 0;
			this.player.isOverheated = true;
		}

		this.laser.startPoint = { x: this.player.x, y: this.player.y };
		const worldMouseX = (this.mousePos.x / this.camera.zoom) + this.camera.x;
		const worldMouseY = (this.mousePos.y / this.camera.zoom) + this.camera.y;
		const angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
		const dx = Math.cos(angle);
		const dy = Math.sin(angle);

		for (let i = 0; i < this.player.laserRange; i++) {
			const currentX = this.player.x + dx * i;
			const currentY = this.player.y + dy * i;
			this.laser.endPoint = { x: currentX, y: currentY };

			let enemyHit = false;
			for (const worm of this.enemies) {
				for (let j = 0; j < worm.segments.length; j++) {
					const segment = worm.segments[j];
					const segmentsBehind = (worm.segments.length - 1) - j;
					const segmentRadius = this.WORM_SEGMENT_RADIUS + segmentsBehind * this.WORM_RADIUS_GROWTH_FACTOR;

					const distSq = (currentX - segment.x)**2 + (currentY - segment.y)**2;
					if (distSq < segmentRadius**2) {
						segment.hp -= this.player.laserDamage;
						this.createImpactParticles(currentX, currentY, '#ff5733');
						this.playSoundAtLocation(laserSound, { x: currentX, y: currentY }); 
						enemyHit = true;
						break;
					}
				}
				if (enemyHit) break;
			}
			if (enemyHit) return;

			const gridX = Math.floor(currentX / this.TILE_SIZE);
			const gridY = Math.floor(currentY / this.TILE_SIZE);
			const tile = this.getTileAt(gridX, gridY);

			if (tile && tile.type > Tile.Empty) {
				if (tile.type > Tile.Indestructible) {
					const key = `${gridX},${gridY}`;
					if (!this.tileChanges[key]) {
						this.tileChanges[key] = { ...tile };
					}

					this.tileChanges[key].hp -= this.player.laserDamage;
					this.createImpactParticles(currentX, currentY, tile.color || '#FFD700');
					
					if (this.tileChanges[key].hp <= 0) {
						this.playSoundAtLocation(blockSound, { x: currentX, y: currentY });
						
						const tileType = this.tileChanges[key].type;

						if (tileType !== Tile.Vegetation) {
							this.flyingItems.push({
								x: (gridX * this.TILE_SIZE) + this.TILE_SIZE / 2,
								y: (gridY * this.TILE_SIZE) + this.TILE_SIZE / 2,
								vx: (Math.random() - 0.5) * 4,
								vy: -3 + (Math.random() * -2),
								tileType: tileType,
								state: 'falling',
								isGrounded: false,
								rotation: Math.random() * 360
							});
						}

						if (tileType === Tile.PowerBlock) {
							this.playSoundAtLocation(powerBlockActivateSound, this.player);
							this.powerBlocks = this.powerBlocks.filter(b => b.x !== gridX || b.y !== gridY);
							this.triggerUpgradeSelection();
						}
						
						const aboveGridX = gridX;
						const aboveGridY = gridY - 1;
						const aboveTile = this.getTileAt(aboveGridX, aboveGridY);
						
						if (aboveTile && aboveTile.type === Tile.Vegetation) {
							const aboveKey = `${aboveGridX},${aboveGridY}`;
							if (!this.tileChanges[aboveKey]) {
								this.tileChanges[aboveKey] = { ...aboveTile };
							}
							this.tileChanges[aboveKey].hp = 0;
						}
					} else {
						this.playSoundAtLocation(laserSound, { x: currentX, y: currentY });
					}
				}
				return;
			}
		}
	}

	updateFlyingItems() {
		for (let i = this.flyingItems.length - 1; i >= 0; i--) {
			const item = this.flyingItems[i];
			if (item.state === 'falling') {
				const checkAboveGridX = Math.floor(item.x / this.TILE_SIZE);
				const checkAboveGridY = Math.floor((item.y - 5) / this.TILE_SIZE);
				const tileAbove = this.getTileAt(checkAboveGridX, checkAboveGridY);

				if (tileAbove && tileAbove.type > Tile.Empty && item.vy < 0) {
					item.vy = 0;
				} else {
					if (!item.isGrounded) item.vy += this.ITEM_GRAVITY;
				}

				item.x += item.vx;
				item.y += item.vy;

				const itemBottomY = item.y + this.TILE_SIZE / 4;
				const gridX = Math.floor(item.x / this.TILE_SIZE);
				const gridY = Math.floor(itemBottomY / this.TILE_SIZE);
				const groundTile = this.getTileAt(gridX, gridY);

				if (groundTile && groundTile.type > Tile.Empty && groundTile.type !== Tile.Vegetation) {
					item.y = gridY * this.TILE_SIZE - this.TILE_SIZE / 4;
					item.vy *= this.ITEM_BOUNCE;
					item.vx = 0;
					if (Math.abs(item.vy) < 1) {
						item.vy = 0;
						item.isGrounded = true;
					}
				} else {
					item.isGrounded = false;
				}

				const dx = this.player.x - item.x;
				const dy = this.player.y - item.y;
				if (Math.sqrt(dx * dx + dy * dy) < this.player.pickupRadius) {
					item.state = 'attracting';
				}
			} else if (item.state === 'attracting') {
				item.x += (this.player.x - item.x) * this.ITEM_ANIMATION_SPEED;
				item.y += (this.player.y - item.y) * this.ITEM_ANIMATION_SPEED;
				const dx = this.player.x - item.x;
				const dy = this.player.y - item.y;

				if (Math.sqrt(dx * dx + dy * dy) < this.TILE_SIZE / 2) {
					if (!this.inventory[item.tileType]) this.inventory[item.tileType] = 0;
					this.inventory[item.tileType]++;
					this.playSoundAtLocation(inventorySound, this.player);
					this.flyingItems.splice(i, 1);
				}
			}
		}
	}

	updatePowerBlocks() {
		for (const block of this.powerBlocks) {
			const dx = this.player.x - (block.x * this.TILE_SIZE + this.TILE_SIZE / 2);
			const dy = this.player.y - (block.y * this.TILE_SIZE + this.TILE_SIZE / 2);
			if (Math.sqrt(dx * dx + dy * dy) <= 10 * this.TILE_SIZE) {
				block.soundTimer--;
				if (block.soundTimer <= 0) {
					this.playSoundAtLocation(powerBlockSound, { x: block.x * this.TILE_SIZE, y: block.y * this.TILE_SIZE });
					block.soundTimer = this.POWER_BLOCK_SOUND_INTERVAL;
				}
			}
		}
	}

	createImpactParticles(x, y, color) {
		for (let i = 0; i < 3; i++) {
			this.laser.hitParticles.push({
				x, y,
				vx: (Math.random() - 0.5) * 3,
				vy: (Math.random() - 0.5) * 3,
				life: 20 + Math.random() * 20,
				color
			});
		}
	}

	updateParticles() {
		for (let i = this.laser.hitParticles.length - 1; i >= 0; i--) {
			const p = this.laser.hitParticles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.life--;
			if (p.life <= 0) this.laser.hitParticles.splice(i, 1);
		}
	}
	
	updateCamera() {
		const targetX = this.player.x - this.engine.getCanvasWidth() / 2 / this.camera.zoom;
		const targetY = this.player.y - this.engine.getCanvasHeight() / 2 / this.camera.zoom;
		this.camera.x += (targetX - this.camera.x) * this.camera.lerp;
		this.camera.y += (targetY - this.camera.y) * this.camera.lerp;
	}

	handleZoom(e) {
		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();

		const oldZoom = this.camera.zoom;

		const zoomSpeed = 0.1;
		let newZoom = this.camera.zoom + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed);
		this.camera.zoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, newZoom));

		const worldCenterX_before = this.camera.x + canvasWidth / 2 / oldZoom;
		const worldCenterY_before = this.camera.y + canvasHeight / 2 / oldZoom;

		const newCameraX = worldCenterX_before - canvasWidth / 2 / this.camera.zoom;
		const newCameraY = worldCenterY_before - canvasHeight / 2 / this.camera.zoom;

		this.camera.x = newCameraX;
		this.camera.y = newCameraY;
	}

	drawGame() {
		if (this.state === Game_State.Menu) {
			this.drawMenu();
		} else if (this.state === Game_State.GameOver) {
			this.drawGameOverScreen();
		} else {
			this.drawWorld();
			if (this.state === Game_State.UpgradeSelection) {
				this.drawUpgradeScreen();
			}
		}
	}

	drawWorld() {
		this.engine.ctx.save();

		this.engine.ctx.scale(this.camera.zoom, this.camera.zoom);
		this.engine.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));
		this.drawParallaxBackground(this.backgroundImage);
		this.drawMap();
		this.drawPowerBlocks();
		this.drawPlayer();
		this.drawLaser();
		this.drawParticles();
		this.drawFlyingItems();
		this.drawEnemies();

		this.engine.ctx.restore();

		this.drawUI();
	}

	drawMenu() {
		this.engine.clearBg(this.MENU_COLOR);

		const titleScale = this.titleImage.width / this.titleImage.height;

		const titleWidth = this.engine.getCanvasWidth();
		const titleHeight = titleWidth / titleScale;



		this.engine.ctx.drawImage(this.titleImage, 0, 0, titleWidth, titleHeight);

		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();
		
		const titleText = 'Alien Planet';
		const titlePos = { x: canvasWidth / 2, y: canvasHeight / 2 - 40 };
		this.engine.drawTextCustom(this.customFont, titleText, 60, 'rgba(245, 245, 180, 1)', titlePos, "center");
		
		const instructionText = "Press ENTER to begin";
		const instructionPos = { x: canvasWidth / 2, y: canvasHeight - 50 };
		this.engine.drawTextCustom(this.customFont, instructionText, 24, Color.WHITE, instructionPos, "center");
	}

	drawUpgradeScreen() {
		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();
		
		this.engine.drawRectangle({x: 0, y: 0, width: canvasWidth, height: canvasHeight}, 'rgba(0, 0, 0, 0.7)');

		const { cardWidth, cardHeight, cardGap, startX, startY, cardRects } = this.getCardLayoutData();

		const font = this.customFont;

		const cardMargin = 12;
		const cardRoundedCorners = 8;
		const highlightColor = 'rgba(255, 255, 0, 1)';

		this.availableUpgrades.forEach((upgrade, index) => {
			const cardX = cardRects[index].x;
			
			const isSelected = index === this.selectedUpgradeIndex;
			const isHovered = this.isMouseOverCard(cardRects[index], this.mousePos);

			this.engine.drawRectangleRounded({x: cardX, y: startY, width: cardWidth, height: cardHeight}, cardRoundedCorners, '#1c1c2b');

			const cardSprite = this.engine.sprites[upgrade.image];
			const cardSpriteScale = 1;

			this.engine.drawSprite(cardSprite.image, 0, { x: cardX, y: startY + 80 }, cardSpriteScale, false, 0, Pivot.Top_Left);

			this.engine.drawRectangleRoundedLines({x: cardX, y: startY, width: cardWidth, height: cardHeight}, cardRoundedCorners, '#00b4d8', 2);
			
			if (isSelected || isHovered) {
				this.engine.drawRectangleRoundedLines({x: cardX, y: startY, width: cardWidth, height: cardHeight}, cardRoundedCorners, highlightColor, 4);
			}

			const upgradeNameSize = 20;
			const upgradeNameSpacing = 24;
			const upgradeNameY = startY + upgradeNameSize + cardMargin;

			this.engine.drawTextWrapped(font, upgrade.name, cardX, upgradeNameY, cardWidth, upgradeNameSize, upgradeNameSpacing, "center", Color.WHITE)

			const infoSize = 16;
			const infoSpacing = 20;
			const infoX = cardX + cardMargin;
			const infoY = startY + 370;
			
			this.engine.drawTextWrapped(font, upgrade.info, infoX, infoY, cardWidth - cardMargin * 2, infoSize, infoSpacing, "center", Color.WHITE);
		});

		const instructionText = "ESCAPE to skip";
		this.engine.drawTextCustom(this.customFont, instructionText, 20, Color.WHITE, { x: canvasWidth / 2, y: canvasHeight - 40 }, "center");
	}

	drawGameOverScreen() {
		this.engine.clearBg(this.MENU_COLOR);
		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();
		
		const mainText = "You died";
		const mainPos = { x: canvasWidth / 2, y: canvasHeight / 2 - 40 };
		this.engine.drawTextCustom(this.customFont, mainText, 60, Color.RED, mainPos, "center");
		
		const instructionText = "Press ENTER to retry";
		const instructionPos = { x: canvasWidth / 2, y: canvasHeight / 2 + 40 };
		this.engine.drawTextCustom(this.customFont, instructionText, 24, Color.WHITE, instructionPos, "center");
	}

	drawParallaxBackground(img) {
		const viewWidth = this.engine.getCanvasWidth() / this.camera.zoom;
		const viewHeight = this.engine.getCanvasHeight() / this.camera.zoom;
		const viewBottomY = this.camera.y + viewHeight;

		this.engine.clearBg(this.SKY_COLOR);

		const scale = viewWidth / img.width;
		const scaledHeight = img.height * scale;
		const drawX = this.camera.x;
		const initialY = (10 * this.TILE_SIZE) - (scaledHeight / 2);
		const parallaxOffsetY = this.camera.y * this.BACKGROUND_PARALLAX_SPEED;
		const drawY = initialY - parallaxOffsetY;
		
		const groundColor = this.averageBgColor;

		const groundStartY = drawY + scaledHeight;
		const groundHeight = viewBottomY - groundStartY;

		if (groundHeight > 0) {
			this.engine.ctx.fillStyle = groundColor;
			this.engine.ctx.fillRect(drawX, groundStartY, viewWidth, groundHeight);
		}

		if (img && img._loaded) {
			this.engine.ctx.drawImage(img, drawX, drawY, viewWidth, scaledHeight);
		}
		
		this.engine.ctx.save();
		const gradientHeight = 150;
		const gradientStartY = drawY + scaledHeight - gradientHeight;
		const gradientEndY = drawY + scaledHeight;

		const gradient = this.engine.ctx.createLinearGradient(0, gradientStartY, 0, gradientEndY);
		const rgb = this.engine.hexToRgb(groundColor);
		
		gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
		gradient.addColorStop(1, groundColor);

		this.engine.ctx.fillStyle = gradient;
		this.engine.ctx.fillRect(drawX, gradientStartY, viewWidth, gradientHeight + 5);
		this.engine.ctx.restore();
	}
	
	initPlayerPosition() {
		this.player.x = this.SPAWN_AREA_WIDTH * this.TILE_SIZE / 2;
		this.player.y = 8 * this.TILE_SIZE;
	}

	generateInitialPowerBlocks(count = 2) {
		const playerX = this.SPAWN_AREA_WIDTH * this.TILE_SIZE / 2;
		const playerY = 8 * this.TILE_SIZE;
		const MIN_DIST = 10 * this.TILE_SIZE;
		const MAX_DIST = 25 * this.TILE_SIZE;
		
		this.powerBlocks = this.powerBlocks.filter(b => b.y * this.TILE_SIZE < MAX_DIST); 

		for (let i = 0; i < count; i++) {
			let placed = false;
			let attempts = 0;
			
			while (!placed && attempts < 100) {
				const angle = Math.random() * Math.PI * 2;
				const dist = MIN_DIST + Math.random() * (MAX_DIST - MIN_DIST); 
				
				const worldX = playerX + Math.cos(angle) * dist;
				const worldY = playerY + Math.sin(angle) * dist;
				
				const gridX = Math.floor(worldX / this.TILE_SIZE);
				const gridY = Math.floor(worldY / this.TILE_SIZE);
				
				const surfaceLevel = 10;
				const key = `${gridX},${gridY}`;
				
				if (gridY >= surfaceLevel && 
					!this.powerBlocks.some(b => b.x === gridX && b.y === gridY) && 
					!this.tileChanges[key]
				) {
					const props = Tile_Properties[Tile.PowerBlock];
					this.tileChanges[key] = { ...props, type: Tile.PowerBlock, hp: props.maxHp, maxHp: props.maxHp };
					this.powerBlocks.push({ x: gridX, y: gridY, soundTimer: this.POWER_BLOCK_SOUND_INTERVAL });
					placed = true;
				}
				attempts++;
			}
		}
	}

	generateCityRooms() {
		if (this.cityRooms) return;
		
		const rooms = [];
		const cityStartX = -Math.floor(this.CITY_WIDTH / 2);
		const cityEndX = Math.floor(this.CITY_WIDTH / 2);
		
		for (let i = 0; i < this.CITY_ROOMS_COUNT; i++) {
			const roomWidth = this.CITY_ROOM_MIN_SIZE + Math.floor(Math.random() * (this.CITY_ROOM_MAX_SIZE - this.CITY_ROOM_MIN_SIZE));
			const roomHeight = this.CITY_ROOM_MIN_SIZE + Math.floor(Math.random() * (this.CITY_ROOM_MAX_SIZE - this.CITY_ROOM_MIN_SIZE));
			const roomX = cityStartX + Math.floor(Math.random() * (this.CITY_WIDTH - roomWidth));
			const roomY = this.CITY_LAYER + 2 + Math.floor(Math.random() * (this.CITY_HEIGHT - roomHeight - 4));
			
			rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight, centerX: roomX + Math.floor(roomWidth / 2), centerY: roomY + Math.floor(roomHeight / 2) });
		}
		
		rooms.sort((a, b) => a.centerX - b.centerX);
		
		const corridors = [];
		for (let i = 0; i < rooms.length - 1; i++) {
			const roomA = rooms[i];
			const roomB = rooms[i + 1];
			corridors.push({ x1: roomA.centerX, y1: roomA.centerY, x2: roomB.centerX, y2: roomB.centerY });
		}
		
		this.cityRooms = { rooms, corridors, startX: cityStartX, endX: cityEndX };
	}

	getCityTileAt(gridX, gridY) {
		if (gridY < this.CITY_LAYER || gridY >= this.CITY_LAYER + this.CITY_HEIGHT) return null;
		
		this.generateCityRooms();
		const { rooms, corridors, startX, endX } = this.cityRooms;
		
		if (gridX < startX - 2 || gridX > endX + 2) return null;
		
		const isInRoom = rooms.some(room => 
			gridX >= room.x && gridX < room.x + room.width &&
			gridY >= room.y && gridY < room.y + room.height
		);
		
		const isInCorridor = corridors.some(corridor => {
			const halfWidth = Math.floor(this.CITY_CORRIDOR_WIDTH / 2);
			
			const minX = Math.min(corridor.x1, corridor.x2);
			const maxX = Math.max(corridor.x1, corridor.x2);
			if (gridX >= minX - halfWidth && gridX <= maxX + halfWidth && 
				gridY >= corridor.y1 - halfWidth && gridY <= corridor.y1 + halfWidth) {
				return true;
			}
			
			const minY = Math.min(corridor.y1, corridor.y2);
			const maxY = Math.max(corridor.y1, corridor.y2);
			if (gridX >= corridor.x2 - halfWidth && gridX <= corridor.x2 + halfWidth &&
				gridY >= minY - halfWidth && gridY <= maxY + halfWidth) {
				return true;
			}
			
			return false;
		});
		
		if (isInRoom || isInCorridor) {
			return { type: Tile.Empty, hp: 0 };
		}
		
		const isRoomWall = rooms.some(room => 
			gridX >= room.x - 1 && gridX < room.x + room.width + 1 &&
			gridY >= room.y - 1 && gridY < room.y + room.height + 1
		);
		
		const isCorridorWall = corridors.some(corridor => {
			const halfWidth = Math.floor(this.CITY_CORRIDOR_WIDTH / 2) + 1;
			
			const minX = Math.min(corridor.x1, corridor.x2);
			const maxX = Math.max(corridor.x1, corridor.x2);
			if (gridX >= minX - halfWidth && gridX <= maxX + halfWidth && 
				gridY >= corridor.y1 - halfWidth - 1 && gridY <= corridor.y1 + halfWidth + 1) {
				return true;
			}
			
			const minY = Math.min(corridor.y1, corridor.y2);
			const maxY = Math.max(corridor.y1, corridor.y2);
			if (gridX >= corridor.x2 - halfWidth - 1 && gridX <= corridor.x2 + halfWidth + 1 &&
				gridY >= minY - halfWidth && gridY <= maxY + halfWidth) {
				return true;
			}
			
			return false;
		});
		
		if (isRoomWall || isCorridorWall) {
			const props = Tile_Properties[Tile.CityWall];
			return { ...props, type: Tile.CityWall, hp: props.maxHp, maxHp: props.maxHp };
		}
		
		return null;
	}

	getTileAt(gridX, gridY) {
		const key = `${gridX},${gridY}`;
		if (this.tileChanges[key]) {
			if (this.tileChanges[key].hp <= 0) return { type: Tile.Empty, hp: 0 };
			return this.tileChanges[key];
		}

		const cityTile = this.getCityTileAt(gridX, gridY);
		if (cityTile !== null) return cityTile;

		const surfaceLevel = 10;
		const surfaceVariation = 4;
		const surfaceNoiseScale = 50;
		const surfaceHeight = Math.round(surfaceLevel + this.engine.noise2D(gridX / surfaceNoiseScale, this.noiseOffsetX / surfaceNoiseScale) * surfaceVariation);
		
		if (gridY === surfaceHeight - 1) {
			const vegetationNoiseScale = 10;
			const vegetationThreshold = 0.4;
			const vegetationNoise = (this.engine.noise2D(gridX / vegetationNoiseScale + this.noiseOffsetX, 0) + 1) / 2;
			if (vegetationNoise > vegetationThreshold) {
				const properties = Tile_Properties[Tile.Vegetation];
				return { ...properties, type: Tile.Vegetation, hp: properties.maxHp };
			}
		}

		if (gridY < surfaceHeight) return { type: Tile.Empty, hp: 0 };

		if (gridY >= this.MAP_HEIGHT) return { type: Tile.Indestructible, color: '#000000', maxHp: Infinity, type: Tile.Indestructible };

		const bedrockNoiseScale = 80;
		const bedrockBaseHeight = this.MAP_HEIGHT - 10;
		const bedrockVariation = 8;
		let bedrockHeight = bedrockBaseHeight + this.engine.noise2D(gridX / bedrockNoiseScale, this.noiseOffsetX / bedrockNoiseScale) * bedrockVariation;
		if (gridY >= bedrockHeight) {
			return { type: Tile.Indestructible, color: '#000000', maxHp: Infinity, type: Tile.Indestructible };
		}
		
		const noiseScale = 25;
		const noiseValue = this.engine.noise2D((gridX + this.noiseOffsetX) / noiseScale, gridY / noiseScale);
		let tileType;
		const depthRatio = gridY / this.MAP_HEIGHT;

		if (depthRatio < 0.2) {
			tileType = (noiseValue > 0.3) ? Tile.Sand : Tile.Dirt;
		} else if (depthRatio < 0.6) {
			if (noiseValue > 0.5) tileType = Tile.Brick;
			else if (noiseValue > 0.2) tileType = Tile.Soil;
			else tileType = Tile.Dirt;
		} else {
			if (noiseValue > 0.6) tileType = Tile.Diamond;
			else if (noiseValue > 0.3) tileType = Tile.Brick;
			else tileType = Tile.Soil;
		}

        const dx = (gridX * this.TILE_SIZE + this.TILE_SIZE / 2) - this.player.x;
        const dy = (gridY * this.TILE_SIZE + this.TILE_SIZE / 2) - this.player.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy) / this.TILE_SIZE;

        const MIN_SAFE_DISTANCE = 10;
        const MAX_EFFECTIVE_DISTANCE = 50;
        
        let probabilityMultiplier = 0;
        
        if (distToPlayer > MIN_SAFE_DISTANCE) {
            probabilityMultiplier = Math.min(1, (distToPlayer - MIN_SAFE_DISTANCE) / (MAX_EFFECTIVE_DISTANCE - MIN_SAFE_DISTANCE));
        }

        const depthMultiplier = depthRatio * depthRatio; 
        
        const finalChance = this.POWER_CHANCE_FACTOR * probabilityMultiplier * (1 + depthMultiplier);
        
		const powerBlockNoiseScale = 150;
		const powerBlockNoise = this.engine.noise2D((gridX + 20000) / powerBlockNoiseScale, (gridY + 30000) / powerBlockNoiseScale);
		const normalizedNoise = (powerBlockNoise + 1) / 2;
        
		if (normalizedNoise < finalChance && tileType !== Tile.Sand && tileType !== Tile.Diamond) {
			tileType = Tile.PowerBlock;
			if (!this.powerBlocks.some(b => b.x === gridX && b.y === gridY)) {
				this.powerBlocks.push({ x: gridX, y: gridY, soundTimer: this.POWER_BLOCK_SOUND_INTERVAL });
			}
		}

		const properties = Tile_Properties[tileType];
		return { ...properties, type: tileType, hp: properties.maxHp, maxHp: properties.maxHp };
	}

	drawMap() {
		const cWidth = this.engine.getCanvasWidth() / this.camera.zoom;
		const cHeight = this.engine.getCanvasHeight() / this.camera.zoom;
		const startX = Math.floor(this.camera.x / this.TILE_SIZE);
		const startY = Math.floor(this.camera.y / this.TILE_SIZE);
		const endX = Math.ceil((this.camera.x + cWidth) / this.TILE_SIZE);
		const endY = Math.ceil((this.camera.y + cHeight) / this.TILE_SIZE);
		
		const tilesetSprite = this.engine.sprites['tileset'];
		const vegetationSprite = this.engine.sprites['vegetation'];

		const s = this.OVERLAP_FACTOR;
		const d = (this.TILE_SIZE * s - this.TILE_SIZE) / 2;

		for (let y = startY; y < endY; y++) {
			for (let x = startX; x < endX; x++) {
				const tile = this.getTileAt(x, y);

				if (tile && tile.type !== Tile.Empty) {
					const drawX = x * this.TILE_SIZE - d;
					const drawY = y * this.TILE_SIZE - d;
					const drawSize = this.TILE_SIZE * s;
					const scale = drawSize / 16;
					
					if (tile.type === Tile.Vegetation) {
						if (vegetationSprite && vegetationSprite.image._loaded) {
							const vegFrame = Math.floor(((this.engine.noise2D(x * 13 + this.noiseOffsetX, 5000) + 1) / 2) * 4);
							this.engine.drawSprite(vegetationSprite.image, vegFrame, { x: drawX, y: drawY }, scale, false, 0, Pivot.Top_Left);
						}
					} else {
						const frame = this.tileFrameMap[tile.type];
						if (frame !== undefined && tilesetSprite && tilesetSprite.image._loaded) {
							this.engine.drawSprite(tilesetSprite.image, frame, { x: drawX, y: drawY }, scale, false, 0, Pivot.Top_Left);
						} else if (tile.color) { 
							this.engine.drawRectangle({x: drawX, y: drawY, width: drawSize, height: drawSize}, tile.color);
						}
					}

					if (tile.hp < tile.maxHp) {
						const damageAlpha = (1 - (tile.hp / tile.maxHp)) * 0.6;
						this.engine.drawRectangle({x: drawX, y: drawY, width: drawSize, height: drawSize}, `rgba(0,0,0,${damageAlpha})`);
					}
				}
			}
		}
	}

	drawPowerBlocks() {
		const powerBlockSprite = this.engine.sprites['tileset'];
		if (!powerBlockSprite) return;

		for (const block of this.powerBlocks) {
			const pos = { x: block.x * this.TILE_SIZE, y: block.y * this.TILE_SIZE };
			const scale = this.TILE_SIZE / 16;
			const frame = this.tileFrameMap[Tile.PowerBlock];
			this.engine.drawSprite(powerBlockSprite.image, frame, pos, scale, false, 0, Pivot.Top_Left);
		}
	}

	drawFogOfWar() {
		if (!this.fogOfWar.enabled) return;
		const ctx = this.engine.ctx;
		ctx.fillStyle = this.fogOfWar.color;
		ctx.fillRect(this.camera.x, this.camera.y, this.engine.getCanvasWidth() / this.camera.zoom, this.engine.getCanvasHeight() / this.camera.zoom);
		const gradient = ctx.createRadialGradient(this.player.x, this.player.y, 0, this.player.x, this.player.y, this.fogOfWar.revealRadius);
		const blurStart = Math.max(0, (this.fogOfWar.revealRadius - this.fogOfWar.blurSize) / this.fogOfWar.revealRadius);
		const opaqueColor = this.fogOfWar.color.replace(/[\d\.]+\)$/, '1)');
		const transparentColor = this.fogOfWar.color.replace(/[\d\.]+\)$/, '0)');
		gradient.addColorStop(blurStart, opaqueColor);
		gradient.addColorStop(1, transparentColor);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(this.player.x, this.player.y, this.fogOfWar.revealRadius, 0, Math.PI * 2);
		ctx.fill();
		ctx.globalCompositeOperation = 'source-over';
	}

	drawPlayer() {
		const { player, engine } = this;
		
		if (!player.isGrounded && player.velocityY < 0) {
			const thrusterCenter = { x: player.x, y: player.y + player.radius * 0.9 };
			const tiltAngle = (player.velocityX / player.speed) * 25;
			engine.drawPolygon(thrusterCenter, 3, 12, 90 + tiltAngle, '#ffdd00');
		}

		if (player.isTurboActive && !player.isOverheated) { 
			const thrusterOffset = player.radius;
			let thrusterCenter = { x: player.x + (player.velocityX > 0 ? -thrusterOffset : thrusterOffset), y: player.y };
			let thrusterRotation = player.velocityX > 0 ? 180 : 0;
			engine.drawPolygon(thrusterCenter, 3, 16, thrusterRotation, '#ff8800');
		}

		const playerSprite = engine.sprites['player_wheel'];
		if (playerSprite && playerSprite.image._loaded) {
			const scale = (player.radius * 2) / playerSprite.frameWidth;
			engine.drawSprite(playerSprite.image, 0, { x: player.x, y: player.y }, scale, false, engine.toDegrees(player.rotation), Pivot.Center);
		}
	}

	drawLaser() {
		if (!this.laser.isActive) return;
		this.engine.drawCircleLines({x: this.player.x, y: this.player.y}, this.player.laserRange, 1.5, 'rgba(255, 255, 255, 0.5)', [2, 6]);
		this.engine.drawLine(this.laser.startPoint, this.laser.endPoint, 4, Color.WHITE, Line_Cap.Round);
		this.engine.drawLine(this.laser.startPoint, this.laser.endPoint, 2, Color.RED, Line_Cap.Round);
	}
	
	drawParticles() {
		const { ctx, laser } = this.engine;
		this.laser.hitParticles.forEach(p => {
			ctx.fillStyle = p.color;
			ctx.globalAlpha = p.life / 40;
			ctx.beginPath();
			ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.globalAlpha = 1.0;
	}

	playSoundAtLocation(soundEffect, sourcePos) {
		const dx = this.player.x - sourcePos.x;
		const dy = this.player.y - sourcePos.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance <= this.WORM_SOUND_MAX_DISTANCE) {
			const volumeMultiplier = 1.0 - (distance / this.WORM_SOUND_MAX_DISTANCE);
			const soundToPlay = { ...soundEffect, volume: Math.max(0, soundEffect.volume * volumeMultiplier) };
			this.engine.playSoundEffect(soundToPlay);
		}
	}

	spawnWorm() {
		for (let i = 0; i < 20; i++) {
			const angle = Math.random() * Math.PI * 2;
			const spawnDist = this.fogOfWar.revealRadius + this.TILE_SIZE * 5; 
			const spawnX = this.player.x + Math.cos(angle) * spawnDist;
			const spawnY = this.player.y + Math.sin(angle) * spawnDist;
			const gridX = Math.floor(spawnX / this.TILE_SIZE);
			const gridY = Math.floor(spawnY / this.TILE_SIZE);
			const tile = this.getTileAt(gridX, gridY);

			if (tile.type === Tile.Dirt || tile.type === Tile.Sand) {
				const head = { x: spawnX, y: spawnY, vx: 0, vy: 0, hp: this.WORM_HEAD_HEALTH, maxHp: this.WORM_HEAD_HEALTH };
				const body = { ...head, hp: this.WORM_BODY_HEALTH, maxHp: this.WORM_BODY_HEALTH };
				this.enemies.push({ segments: [head, { ...body }, { ...body }], moveTimer: this.WORM_MOVE_INTERVAL, isGrounded: false, consumedTiles: [] });
				return;
			}
		}
	}

	updateEnemies() {
		if (this.enemies.length < this.MAX_WORMS && this.player.y > this.WORM_SPAWN_DEPTH * this.TILE_SIZE) {
			this.spawnWorm();
		}

		for (let i = this.enemies.length - 1; i >= 0; i--) {
			const worm = this.enemies[i];
			
			for (let j = worm.segments.length - 1; j >= 0; j--) {
				const segment = worm.segments[j];
				if (segment.hp <= 0) {
					if (j === 0) {
						this.playSoundAtLocation(wormDeathSound, segment);
						
						worm.consumedTiles.forEach(consumed => this.flyingItems.push({
							x: segment.x,
							y: segment.y,
							vx: (Math.random() - 0.5) * 5,
							vy: -4,
							tileType: consumed.type,
							state: 'falling',
							isGrounded: false,
							rotation: Math.random() * 360
						}));

						this.enemies.splice(i, 1);
						break;
					} else {
						this.flyingItems.push({ x: segment.x, y: segment.y, vx: (Math.random() - 0.5) * 4, vy: -3, tileType: Tile.WormChunk, state: 'falling', isGrounded: false, rotation: Math.random() * 360 });
						worm.segments.splice(j, 1);

						if (worm.consumedTiles.length > 0) {
							worm.consumedTiles.shift();
						}
					}
				}
			}
			
			if (!this.enemies[i]) continue;
			const head = worm.segments[0];
			if (!head) continue;

			const headRadius = this.WORM_SEGMENT_RADIUS + (worm.segments.length - 1) * this.WORM_RADIUS_GROWTH_FACTOR;
			if (!worm.isGrounded) head.vy += this.gravity;
			head.x += head.vx; head.y += head.vy; head.vx *= this.ITEM_FRICTION;
			const groundGridY = Math.floor((head.y + headRadius) / this.TILE_SIZE);
			const groundTile = this.getTileAt(Math.floor(head.x / this.TILE_SIZE), groundGridY);
			if (groundTile.type > Tile.Empty) {
				head.y = groundGridY * this.TILE_SIZE - headRadius;
				head.vy = 0; head.vx = 0; worm.isGrounded = true;
			} else {
				worm.isGrounded = false;
			}

			worm.moveTimer--;
			if (worm.moveTimer <= 0) {
				worm.moveTimer = this.WORM_MOVE_INTERVAL;
				const move = [{dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:1}][Math.floor(Math.random() * 3)];
				const targetGridX = Math.floor(head.x / this.TILE_SIZE) + move.dx;
				const targetGridY = Math.floor(head.y / this.TILE_SIZE) + move.dy;
				const targetTile = this.getTileAt(targetGridX, targetGridY);
				if (targetTile.type > Tile.Indestructible) {
					worm.consumedTiles.push({ type: targetTile.type, x: targetGridX * this.TILE_SIZE + this.TILE_SIZE / 2, y: targetGridY * this.TILE_SIZE + this.TILE_SIZE / 2 });
					this.tileChanges[`${targetGridX},${targetGridY}`] = { hp: 0 };
					this.playSoundAtLocation(wormEatSound, head);
					head.x = targetGridX * this.TILE_SIZE + this.TILE_SIZE / 2;
					head.y = targetGridY * this.TILE_SIZE + this.TILE_SIZE / 2;
					if (Math.random() < this.WORM_GROWTH_CHANCE) {
						const tailPos = { ...worm.segments.slice(-1)[0], hp: this.WORM_BODY_HEALTH, maxHp: this.WORM_BODY_HEALTH };
						worm.segments.push(tailPos);
					}
				}
			}

			const targetSegmentDistance = headRadius * 1.8;
			for (let j = 1; j < worm.segments.length; j++) {
				const [prev, curr] = [worm.segments[j-1], worm.segments[j]];
				const dx = prev.x - curr.x, dy = prev.y - curr.y;
				if (Math.sqrt(dx*dx + dy*dy) > targetSegmentDistance) {
					curr.x += dx * this.WORM_SPEED;
					curr.y += dy * this.WORM_SPEED;
				}
			}

			if (this.player.invincibilityTimer <= 0) {
				for (let j = 0; j < worm.segments.length; j++) {
					const segment = worm.segments[j];
					const segmentRadius = this.WORM_SEGMENT_RADIUS + (worm.segments.length - 1 - j) * this.WORM_RADIUS_GROWTH_FACTOR;
					const dx = this.player.x - segment.x, dy = this.player.y - segment.y;
					if (Math.sqrt(dx*dx + dy*dy) < this.player.radius + segmentRadius) {
						this.player.health -= (j === 0) ? this.WORM_HEAD_DAMAGE : this.WORM_SEGMENT_DAMAGE;
						this.player.invincibilityTimer = this.INVINCIBILITY_TIME;
						this.playSoundAtLocation(wormHitSound, segment);
						break; 
					}
				}
			}
		}
	}

	drawEnemies() {
		const headSprite = this.engine.sprites['worm_head'];
		const bodySprite = this.engine.sprites['worm_body'];
		if (!headSprite?.image._loaded || !bodySprite?.image._loaded) return;

		this.enemies.forEach(worm => {
			for (let i = worm.segments.length - 1; i >= 0; i--) {
				const segment = worm.segments[i];
				const radius = this.WORM_SEGMENT_RADIUS + (worm.segments.length - 1 - i) * this.WORM_RADIUS_GROWTH_FACTOR;
				
				let rotation = 0;
				let spriteImage = (i === 0) ? headSprite.image : bodySprite.image;
				if (i > 0) {
					rotation = Math.atan2(worm.segments[i - 1].y - segment.y, worm.segments[i - 1].x - segment.x);
				} else if (worm.segments.length > 1) {
					rotation = Math.atan2(segment.y - worm.segments[1].y, segment.x - worm.segments[1].x);
				}
				
				this.engine.drawSprite(spriteImage, 0, segment, (radius * 2) / spriteImage.naturalWidth, false, this.engine.toDegrees(rotation) - 90, Pivot.Center);

				if (segment.hp < segment.maxHp) {
					const barY = segment.y - radius - 10;
					this.engine.drawRectangle({x: segment.x - radius, y: barY, width: radius*2, height: 4}, 'rgba(0,0,0,0.7)');
					this.engine.drawRectangle({x: segment.x - radius, y: barY, width: (Math.max(0, segment.hp) / segment.maxHp) * radius * 2, height: 4}, '#32CD32');
				}
			}
		});
	}

	drawUI() {
		const barWidth = 200, barHeight = 12, barRoundness = 4, barsX = 10, barGap = 8;
		
		let healthColor = this.player.health < this.player.maxHealth * 0.25 ? Color.RED : Color.GREEN;
		this.engine.drawRectangleRounded({x: barsX, y: 10, width: barWidth, height: barHeight}, barRoundness, 'rgba(0,0,0,0.5)');
		this.engine.drawRectangleRounded({x: barsX, y: 10, width: (this.player.health/this.player.maxHealth) * barWidth, height: barHeight}, barRoundness, healthColor);
		this.engine.drawRectangleRoundedLines({x: barsX, y: 10, width: barWidth, height: barHeight}, barRoundness, Color.WHITE);

		const energyBarY = 10 + barHeight + barGap;
		const energyWidth = 100, energyHeight = 8;
		let energyColor = this.player.isOverheated ? Color.MAGENTA : Color.BLUE;
		this.engine.drawRectangleRounded({x: barsX, y: energyBarY, width: energyWidth, height: energyHeight}, barRoundness, 'rgba(0,0,0,0.5)');
		this.engine.drawRectangleRounded({x: barsX, y: energyBarY, width: (this.player.energy/this.player.maxEnergy) * energyWidth, height: energyHeight}, barRoundness, energyColor);
		this.engine.drawRectangleRoundedLines({x: barsX, y: energyBarY, width: energyWidth, height: energyHeight}, barRoundness, Color.WHITE);
		
		const collected = Object.keys(this.inventory);
		
		if (collected.length > 0) {
			const slotSize = 40, padding = 6, invHeight = slotSize + padding*2, invWidth = collected.length * (slotSize + padding) + padding, invRadius = 8;
			const invX = (this.engine.getCanvasWidth() - invWidth) / 2, invY = this.engine.getCanvasHeight() - invHeight - padding;
			this.engine.drawRectangleRounded({x: invX, y: invY, width: invWidth, height: invHeight}, invRadius, 'rgba(0,0,0,0.6)');
			this.engine.drawRectangleRoundedLines({x: invX, y: invY, width: invWidth, height: invHeight}, invRadius, Color.WHITE);

			collected.forEach((type, i) => {
				const props = Tile_Properties[type];
				const centerX = invX + padding + i * (slotSize + padding) + slotSize / 2;
				const centerY = invY + invHeight / 2;
				const iconSize = slotSize * 0.4;

				if (props.sides === 0) {
					this.engine.drawCircle({x:centerX, y:centerY}, iconSize * 0.8, props.color)
				} else {
					this.engine.drawPolygon({x:centerX, y:centerY}, props.sides, iconSize, this.uiItemRotation, props.color);
				}
				
				const textPos = {x: centerX + slotSize/2 - padding/2, y: centerY + slotSize/2 - padding/2};
				this.engine.drawText(this.inventory[type].toString(), 16, Color.WHITE, textPos, "right");
			});
		}
		this.drawRadar();
	}

	drawRadar() {
		const canvasWidth = this.engine.getCanvasWidth();
		const canvasHeight = this.engine.getCanvasHeight();
		const radarCenterX = canvasWidth - this.RADAR_RADIUS - this.RADAR_MARGIN;
		const radarCenterY = canvasHeight - this.RADAR_RADIUS - this.RADAR_MARGIN;
		const centerPos = { x: radarCenterX, y: radarCenterY };

		this.engine.drawCircle(centerPos, this.RADAR_RADIUS, this.RADAR_BG_COLOR);
		this.engine.drawCircleLines(centerPos, this.RADAR_RADIUS, 2, this.RADAR_LINE_COLOR);
		this.engine.drawCircleLines(centerPos, this.RADAR_RADIUS * 0.66, 1, this.RADAR_LINE_COLOR);
		this.engine.drawCircleLines(centerPos, this.RADAR_RADIUS * 0.33, 1, this.RADAR_LINE_COLOR);
		
		this.engine.drawLine(
			{ x: radarCenterX - this.RADAR_RADIUS, y: radarCenterY },
			{ x: radarCenterX + this.RADAR_RADIUS, y: radarCenterY },
			1, this.RADAR_LINE_COLOR
		);
		this.engine.drawLine(
			{ x: radarCenterX, y: radarCenterY - this.RADAR_RADIUS },
			{ x: radarCenterX, y: radarCenterY + this.RADAR_RADIUS },
			1, this.RADAR_LINE_COLOR
		);

		const scaleFactor = this.RADAR_RADIUS / this.radarRange;
		const tileStep = 3;
		const playerGridX = Math.floor(this.player.x / this.TILE_SIZE);
		const playerGridY = Math.floor(this.player.y / this.TILE_SIZE);
		const radarTileRange = Math.ceil(this.radarRange / this.TILE_SIZE);
		
		for (let dy = -radarTileRange; dy <= radarTileRange; dy += tileStep) {
			for (let dx = -radarTileRange; dx <= radarTileRange; dx += tileStep) {
				const gridX = playerGridX + dx;
				const gridY = playerGridY + dy;
				const tile = this.getTileAt(gridX, gridY);
				
				if (tile && tile.type !== Tile.Empty) {
					const worldDx = dx * this.TILE_SIZE;
					const worldDy = dy * this.TILE_SIZE;
					const distance = Math.sqrt(worldDx * worldDx + worldDy * worldDy);
					
					if (distance < this.radarRange) {
						const blipX = radarCenterX + worldDx * scaleFactor;
						const blipY = radarCenterY + worldDy * scaleFactor;
						this.engine.drawRectangle({ x: blipX - 1, y: blipY - 1, width: 2, height: 2 }, 'rgba(80, 130, 80, 0.7)');
					}
				}
			}
		}

		this.powerBlocks.forEach(block => {
			const blockWorldX = block.x * this.TILE_SIZE + this.TILE_SIZE / 2;
			const blockWorldY = block.y * this.TILE_SIZE + this.TILE_SIZE / 2;
			const dx = blockWorldX - this.player.x;
			const dy = blockWorldY - this.player.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance < this.radarRange) {
				const scaleFactor = this.RADAR_RADIUS / this.radarRange;
				const blipX = radarCenterX + dx * scaleFactor;
				const blipY = radarCenterY + dy * scaleFactor;
				this.engine.drawCircle({ x: blipX, y: blipY }, 3, this.RADAR_BLIP_COLOR);
			}
		});

		this.enemies.forEach(worm => {
			for (let i = worm.segments.length - 1; i >= 0; i--) {
				const segment = worm.segments[i];
				const dx = segment.x - this.player.x;
				const dy = segment.y - this.player.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance < this.radarRange) {
					const scaleFactor = this.RADAR_RADIUS / this.radarRange;
					const blipX = radarCenterX + dx * scaleFactor;
					const blipY = radarCenterY + dy * scaleFactor;
					const blipSize = (i === 0) ? 4 : 2;
					this.engine.drawCircle({ x: blipX, y: blipY }, blipSize, this.RADAR_ENEMY_COLOR);
				}
			}
		});

		let closestBlock = null;
		let closestDistanceSq = Infinity;
		this.powerBlocks.forEach(block => {
			const blockWorldX = block.x * this.TILE_SIZE + this.TILE_SIZE / 2;
			const blockWorldY = block.y * this.TILE_SIZE + this.TILE_SIZE / 2;
			const dx = blockWorldX - this.player.x;
			const dy = blockWorldY - this.player.y;
			const distSq = dx * dx + dy * dy;

			if (distSq < closestDistanceSq) {
				closestDistanceSq = distSq;
				closestBlock = { x: blockWorldX, y: blockWorldY };
			}
		});

		if (closestBlock) {
			const dxToBlock = closestBlock.x - this.player.x;
			const dyToBlock = closestBlock.y - this.player.y;
			const angle = Math.atan2(dyToBlock, dxToBlock);

			const arrowRadius = this.RADAR_RADIUS + this.RADAR_ARROW_RADIUS_OFFSET;
			const arrowX = radarCenterX + Math.cos(angle) * arrowRadius;
			const arrowY = radarCenterY + Math.sin(angle) * arrowRadius;
			
			this.engine.drawPolygon(
				{ x: arrowX, y: arrowY },
				3,
				this.RADAR_ARROW_SIZE,
				this.engine.toDegrees(angle),
				this.RADAR_ARROW_COLOR
			);
		}
	}

	drawFlyingItems() {
		this.flyingItems.forEach(item => {
			const itemProps = Tile_Properties[item.tileType];
			if (!itemProps) return;

			const iconCenter = { x: item.x, y: item.y };
			const iconSize = this.TILE_SIZE / this.ITEM_SCALE;

			if (itemProps.sides === 0) {
				this.engine.drawCircle(iconCenter, iconSize, itemProps.color);
			} else {
				this.engine.drawPolygon(iconCenter, itemProps.sides, iconSize, item.rotation, itemProps.color);
			}
		});
	}
}