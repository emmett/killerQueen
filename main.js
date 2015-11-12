var mainState = {
    preload : function () {
      game.load.spritesheet('blueworker', 'assets/blueworker.png', 20, 20);
      game.load.spritesheet('bluequeen', 'assets/bluequeen.png', 20, 20);
      game.load.spritesheet('bluewarrior', 'assets/bluewarrior.png', 20, 20);
      game.load.spritesheet('redworker', 'assets/redworker.png', 20, 20);
      game.load.spritesheet('redqueen', 'assets/redqueen.png', 20, 20);
      game.load.spritesheet('redwarrior', 'assets/redwarrior.png', 20, 20);
      game.load.image('wallV', 'assets/wallVertical.png');
      game.load.image('wallH', 'assets/wallHorizontal.png');
      game.load.image('coin', 'assets/coin.png')
      game.load.image('pixel', 'assets/pixel.png')
    },

    create : function () {
      var classes = ['warrior', 'queen', 'worker'];
      var team = ['red', 'blue'];
      game.stage.backgroundColor = '#3498db';
      game.physics.startSystem(Phaser.Physics.ARCADE);
      this.emitter = game.add.emitter(0, 0, 15);
      this.emitter.makeParticles('pixel');
      this.emitter.setYSpeed(-150, 150);
      this.emitter.setXSpeed(-150, 150);
      this.emitter.gravity = 0
      this.berry = game.add.sprite(game.world.centerX - 20, game.world.centerY, 'coin');
      this.berry.anchor.setTo(0.5, 0.5);


      var randClass = classes[Math.floor(Math.random()*classes.length)];
      var randTeam = team[Math.floor(Math.random()*team.length)];
      this.character = game.add.sprite(game.world.centerX, game.world.centerY, randTeam + randClass);
      // set up phys shit
      game.physics.enable(this.berry);
      game.physics.arcade.enable(this.character);
      this.character.anchor.setTo(0.5, 0.5);
      this.characterSpawn(this.character, randClass, randTeam)
      this.character.body.gravity.y = 500;

      this.character.animations.add('right', [1, 2], 8, true);
      this.character.animations.add('left', [3, 4], 8, true);

      this.createWorld();

      this.cursor = game.input.keyboard.createCursorKeys();
      this.berryLabel = game.add.text(30, 80, 'Berry: ' + this.character.hasBerry)
      this.classLabel = game.add.text(30, 30, 'Class: ' + this.character.class)
      this.teamLabel = game.add.text(30, 55, 'Team: ' + this.character.team)
    },

    characterSpawn :  function (character, characterClass, characterTeam) {
        switch (characterClass) {
          case 'warrior':
            character.class = 'warrior';
            character.flight = true;
            character.grabBerry = false;
            character.swing = true;
            character.diveBomb = false;
            character.transform = false;
            character.score = false;
            character.speed = 1.00;
            character.hasBerry = false;
            break;

          case 'queen':
            character.class = 'queen'
            character.flight = true;
            character.grabBerry = false;
            character.swing = true;
            character.diveBomb = true;
            character.transform = false;
            character.score = false;
            character.speed = 1.10;
            character.hasBerry = false;
            break;

          case 'worker':
            character.class = 'worker'
            character.flight = false;
            character.grabBerry = true;
            character.swing = false;
            character.diveBomb = false;
            character.transform = true;
            character.score = true;
            character.speed = 1.00;
            character.hasBerry = false;
            break;
        }
        character.team = characterTeam
    },

    createWorld : function () {
      this.walls = game.add.group();
      this.walls.enableBody = true;

      game.add.sprite(0, 0, 'wallV', 0, this.walls);
      game.add.sprite(480, 0, 'wallV', 0, this.walls);

      game.add.sprite(0, 0, 'wallH', 0, this.walls);
      game.add.sprite(300, 0, 'wallH', 0, this.walls);
      game.add.sprite(0, 320, 'wallH', 0, this.walls);
      game.add.sprite(300, 320, 'wallH', 0, this.walls);

      game.add.sprite(-100, 160, 'wallH', 0, this.walls);
      game.add.sprite(400, 160, 'wallH', 0, this.walls);
      var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
      middleTop.scale.setTo(1.5, 1);
      var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
      middleBottom.scale.setTo(1.5, 1)
      this.walls.setAll('body.immovable', true)
    },

    takeBerry : function (character, berry) {
      if (character.grabBerry && !character.hasBerry) {
        this.berry.kill()
        character.hasBerry = true
      }
      this.berryLabel.text = 'Berry: ' + character.hasBerry

    },

    update : function () {
      game.physics.arcade.collide(this.character, this.walls);
      game.physics.arcade.overlap(this.character, this.berry, this.takeBerry, null, this)
      this.movecharacter(this.character);
      if (!this.character.inWorld){
        this.characterDie(this.character);
      }
    },

    characterDie : function (character) {
      character.kill()
      this.emitter.x = character.x;
      this.emitter.y = character.y;
      this.emitter.start =(true, 600, null, 15)
      game.state.start('main');
    },

    movecharacter : function (character) {
      if (this.cursor.left.isDown) {
        character.body.velocity.x = -200 * character.speed;
        character.animations.play('left')
      }
      else if (this.cursor.right.isDown) {
        character.body.velocity.x = 200 * character.speed;
        character.animations.play('right')
      }
      else {
        character.body.velocity.x = 0;
        character.animations.stop()
        character.frame = 0
      }

      if (this.cursor.down.isDown && character.diveBomb) {
        character.body.velocity.y = 400 * character.speed;
      }
      if (this.cursor.up.isDown && character.body.touching.down && character.releasedUp) {
        character.flap = false;
        character.releasedUp = false;
        character.body.velocity.y = -200;
      }
      else if (this.cursor.up.isDown && character.flight && character.releasedUp){
        character.body.velocity.y = -200 * character.speed;
        character.releasedUp = false;
      }

      if (this.cursor.up.isUp){
        this.character.releasedUp = true
      }
    }
}

var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');

game.state.add('main', mainState);
game.state.start('main');
