KillDemAll.XShip = function(time, assets, ammo) {
	this.time = time;
	this.ammo = ammo;
	// ship
	this.ship = new KillDemAll.Ship();
	// base
	this.base = {sprite:assets.sprite(52, 5, 22, 22)};
	// reactors
	this.reactors = [];
	for (var i = 0; i < 4; ++i)
		this.reactors[i] = {anim:assets.anim(18, 77, 12, 24, 9, 5, true, 0.04)};
	// armors
	this.armors = {
		sprite  : assets.sprite(5, 5, 23, 23),
		openMax : 8,
		open    : [0,0,0,0]
	};
	// turrets
	this.turretsDelayInc = 0.025;
	this.turretsDelayMin = 0.100;
	this.turretsDelayMax = 0.500;
	this.turretsCouples  = [];
	for (var i = 0; i < 4; ++i) {
		this.turretsCouples[i] = {side:0, delay:0, time:0, turrets:[]};
		for (var j = 0; j < 2; ++j) {
			this.turretsCouples[i].turrets[j] = {
				anim : assets.anim(137, 86, 10, 11, 7, 0, false),
				rad  : Math.PI / 2 * i
			};
		}
	}
	// top
	this.top = {sprite:assets.sprite(33, 5, 14, 14)};
	// cannon
	this.cannon = {
		rad  : 0,
		anim : assets.anim(122, 21, 12, 50, 8, 0, false, 0.02)
	};
};
KillDemAll.XShip.prototype = {
	userMove: function(key, press) {
		var dir = this.ship.userMove(key, press);
		if (dir !== -1) {
			var anim = this.reactors[(dir + 2) % 4].anim;
			press ? anim.play() : anim.stop();
		}
	},
	userMoveCannon: function(x, y) {
		this.ship.calcMouseRad(x, y);
	},
	userShootCannon: function() {
		if (!this.cannon.anim.playing) {
			this.cannon.anim.play();
			var shotPos = new Vector2D(
				this.ship.vPos.x + 40 * +Math.sin(this.cannon.rad),
				this.ship.vPos.y + 40 * -Math.cos(this.cannon.rad)
			);
			this.ammo.createShot('roquet', shotPos, this.cannon.rad, this.ship.vMove);
		}
	},
	userShootTurrets: function(key, press) {
		var dir = this.ship.userShoot(key, press);
		if (dir !== -1) {
			this.turretsCouples[dir].delay = this.turretsDelayMin;
			this.turretsCouples[dir].time  = this.time.realTime;
		}
	},
	shootTurret: function(turretsCouple, ind) {
		var turret = turretsCouple.turrets[turretsCouple.side];
		if (!turret.anim.playing) {
			turret.anim.play();
			var side   = turretsCouple.side ? +1 : -1;
			var sinRad = Math.sin(turret.rad);
			var cosRad = Math.cos(turret.rad);
			var x = side * (6 + this.armors.open[ind]);
			var y = -33 - this.armors.open[(4 + ind + side) % 4];
			var shotPos = new Vector2D(
				this.ship.vPos.x + x * cosRad - y * sinRad,
				this.ship.vPos.y + x * sinRad + y * cosRad
			);
			this.ammo.createShot('bullet', shotPos, turret.rad, this.ship.vMove);
			if (turretsCouple.delay < this.turretsDelayMax)
				turretsCouple.delay += this.turretsDelayInc;
			turretsCouple.time = this.time.realTime;
			turretsCouple.side = turretsCouple.side ? 0 : 1;
		}
	},
	update: function(time) {
		// ship
		this.ship.update(time);
		// armors
		var speedArmor  = 15;
		for (var i = 0; i < 4; ++i) {
			var aInd = (i + 2) % 4;
			if (this.ship.moveKeys[i]) {
				this.armors.open[aInd] += (this.armors.openMax - this.armors.open[aInd]) * speedArmor * time.frameTime;
				if (this.armors.open[aInd] > this.armors.openMax)
					this.armors.open[aInd] = this.armors.openMax;
			} else {
				this.armors.open[aInd] -= this.armors.open[aInd] * speedArmor * time.frameTime;
				if (this.armors.open[aInd] < 0)
					this.armors.open[aInd] = 0;
			}
		}
		// turets
		for (var i = 0, turret; turret = this.turretsCouples[i]; ++i)
			if (this.ship.shotKeys[i] && time.realTime - turret.time >= turret.delay)
				this.shootTurret(turret, i);
		// cannon
		var speedCannon = 10;
		var diffRad = this.ship.mouseRad - this.cannon.rad;
		if (diffRad > Math.PI)
			diffRad -= Math.PI * 2;
		else if (diffRad < -Math.PI)
			diffRad += Math.PI * 2;
		this.cannon.rad += diffRad * speedCannon * time.frameTime;
		this.cannon.rad = (Math.PI * 2 + this.cannon.rad) % (Math.PI * 2);
	},
	render: function(ctx) {
		ctx.save();
			ctx.translate(this.ship.vPos.x, this.ship.vPos.y);

				// base
				this.base.sprite.draw(-11, -11);
				// reactors
				ctx.save();
					this.reactors[0].anim.draw(-6, -35); ctx.rotate(Math.PI / 2);
					this.reactors[1].anim.draw(-6, -35); ctx.rotate(Math.PI / 2);
					this.reactors[2].anim.draw(-6, -35); ctx.rotate(Math.PI / 2);
					this.reactors[3].anim.draw(-6, -35);
				ctx.restore();
				// armors / turrets
				ctx.save();
					this.armors.sprite.draw(-23 - this.armors.open[0], -23 - this.armors.open[3]);
					this.turretsCouples[0].turrets[0].anim.draw(-11 - this.armors.open[0], -33 - this.armors.open[3]);
					this.turretsCouples[0].turrets[1].anim.draw( +1 + this.armors.open[0], -33 - this.armors.open[1]);
					ctx.rotate(Math.PI / 2);
					this.armors.sprite.draw(-23 - this.armors.open[1], -23 - this.armors.open[0]);
					this.turretsCouples[1].turrets[0].anim.draw(-11 - this.armors.open[1], -33 - this.armors.open[0]);
					this.turretsCouples[1].turrets[1].anim.draw( +1 + this.armors.open[1], -33 - this.armors.open[2]);
					ctx.rotate(Math.PI / 2);
					this.armors.sprite.draw(-23 - this.armors.open[2], -23 - this.armors.open[1]);
					this.turretsCouples[2].turrets[0].anim.draw(-11 - this.armors.open[2], -33 - this.armors.open[1]);
					this.turretsCouples[2].turrets[1].anim.draw( +1 + this.armors.open[2], -33 - this.armors.open[3]);
					ctx.rotate(Math.PI / 2);
					this.armors.sprite.draw(-23 - this.armors.open[3], -23 - this.armors.open[2]);
					this.turretsCouples[3].turrets[0].anim.draw(-11 - this.armors.open[3], -33 - this.armors.open[2]);
					this.turretsCouples[3].turrets[1].anim.draw( +1 + this.armors.open[3], -33 - this.armors.open[0]);
				ctx.restore();
				// top
				this.top.sprite.draw(-7, -7);
				// cannon
				ctx.save();
					ctx.rotate(this.cannon.rad);
						this.cannon.anim.draw(-6, -47);
				ctx.restore();

		ctx.restore();
	}
};
