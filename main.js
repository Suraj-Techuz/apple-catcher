import "./style.css";
import Phaser from "phaser";

const sizes = {
    width: 500,
    height: 500,
};

const initialSpeedDown = 200;

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn")
const gameEndDiv = document.querySelector("#gameEndDiv")
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan")
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan")

class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.player;
        this.cursor;
        this.playerSpeed = this.speedDown ? this.speedDown + 100 : initialSpeedDown + 50;
        this.target;
        this.points = 0;
        this.textScore;
        this.textTime;
        this.timedEvent;
        this.remainingTime;
        this.coinMusic;
        this.bgMusic;
        this.emitter;
        this.speedDown = initialSpeedDown;
    }

    preload() {
        this.load.image("bg", "/assets/bg.png");
        this.load.image("basket", "/assets/basket.png");
        this.load.image("apple", "/assets/apple.png");
        this.load.image("money", "assets/money.png")

        this.load.audio("coin", "/assets/coin.mp3");
        this.load.audio("bgMusic", "/assets/bgMusic.mp3");
    }

    create() {
        this.scene.pause("scene-game")

        this.coinMusic = this.sound.add("coin");
        this.bgMusic = this.sound.add("bgMusic");
        // this.bgMusic.play();
        // this.bgMusic.stop();

        this.add.image(0, 0, "bg").setOrigin(0, 0);
        this.target = this.physics.add.image(getRandomNumber(100, 400), getRandomNumber(50, 100), "apple").setOrigin(0, 0);
        this.player = this.physics.add.image(0, sizes.height - 100, "basket").setOrigin(0, 0);
        this.target.setMaxVelocity(0, this.speedDown);

        this.player.setImmovable(true);
        this.player.body.allowGravity = false;
        this.player.setCollideWorldBounds(true);
        this.player.setSize(60, 15).setOffset(18, 70)

        // Pass the targetHit function as a callback
        this.physics.add.overlap(this.target, this.player, this.targetHit, null, this);

        this.cursor = this.input.keyboard.createCursorKeys();

        this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
            font: "25px Arial",
            fill: "#000000"
        });
        this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
            font: "25px Arial",
            fill: "#000000"
        });

        this.timedEvent = this.time.delayedCall(15000, this.gameOver, [], this)
        this.emitter = this.add.particles(0, 0, "money", {
            speed: 100,
            gravityY: this.speedDown - 200,
            scale: 0.04,
            duration: 100,
            emitting: false
        })
        this.emitter.startFollow(this.player, this.player.width / 2, this.player.height / 2, true)
    }

    update() {
        this.remainingTime = this.timedEvent.getRemainingSeconds()
        this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`)

        if (this.target.y >= sizes.height) {
            this.target.setY(getRandomNumber(50, 200));
            this.target.setX(getRandomNumber(100, 400));
        }

        const { left, right } = this.cursor;

        if (left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }
    }

    targetHit() {
        this.coinMusic.play();
        this.emitter.start();

        this.points++;
        this.textScore.setText(`Score: ${this.points}`);

        // Increment the speed
        this.speedDown += 25;
        this.target.setMaxVelocity(0, this.speedDown);

        // Reset target position
        this.target.setY(getRandomNumber(50, 200));
        this.target.setX(getRandomNumber(100, 400));
    }

    gameOver() {
        this.sys.game.destroy(true);
        if (this.points >= 10) {
            gameEndScoreSpan.textContent = this.points;
            gameWinLoseSpan.textContent = "Win! 🏆";
        } else {
            gameEndScoreSpan.textContent = this.points;
            gameWinLoseSpan.textContent = "Lose! 💔"
        }

        gameEndDiv.style.display = 'flex'
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: document.getElementById('gameCanvas'),
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: initialSpeedDown },
            debug: false,
        },
    },
    scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
    gameStartDiv.style.display = "none";
    const gameScene = game.scene.getScene("scene-game");
    gameScene.bgMusic.play();
    game.scene.resume("scene-game");
});
