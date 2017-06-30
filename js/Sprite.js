(function(){
	var Sprite = window.Sprite = function(row,col,type){
		//行号
		this.row = row;
		//列号
		this.col = col;
		//类型编号，注意type0不一定用图是i0.png，因为要看随机样本
		this.type = type;
		//计算x和w
		this.x = game.spriteBaseX + this.col * game.spriteW;
		this.y = game.spriteBaseY + this.row * game.spriteH;
		//小状态，是否处于爆炸状态
		this.isBombing = false;
		//爆炸切片序号0~7
		this.bombNumber = 0;
		//小状态，自己是否隐藏
		this.hide = false;
		//小状态，自己是否正在移动
		this.isMoving = false;
		//增量
		this.dx = 1;
		this.dy = 1;
		//小帧号
		this.animateFrame = 0;
	}
	Sprite.prototype.render = function(){
		//如果自己是隐藏状态，此时不需要渲染任何东西
		if(this.hide) return;

		//根据自己是否处于爆炸状态，来决定渲染什么
		if(!this.isBombing){
			game.ctx.drawImage(game.R[game.spriteTypes[this.type]],this.x,this.y,game.spriteW * 0.9,game.spriteH * 0.9);
		}else{
			//处于爆炸状态
			game.ctx.drawImage(game.R["bomb"],200 * this.bombNumber,0,200,200,this.x,this.y,game.spriteW,game.spriteH);
			//让爆炸动画序列加1
			game.fno % 2 == 0 && this.bombNumber++;
			//图片只有0~7，所以当渲染完毕之后隐藏自己
			if(this.bombNumber > 7){
				//隐藏自己
				this.hide = true;
			}
		}

		//根据自己是否正在移动，改变x、y
		if(this.isMoving){
			this.x += this.dx;
			this.y += this.dy;
			//如果已经到了8帧，停止运动
			this.animateFrame++;
			if(this.animateFrame == 6) this.isMoving = false;
		}
	}
	//爆炸
	Sprite.prototype.bomb = function(){
		this.isBombing = true;
	}
	//移动
	Sprite.prototype.moveTo = function(targetRow , targetCol){
		//计算目标行列所在的x、y：
		var targetX = game.spriteBaseX + targetCol * game.spriteW;
		var targetY = game.spriteBaseY + targetRow * game.spriteH;
		//与现在的x、y进行比对，计算出distanceX、distanceY
		var distanceX = targetX - this.x;
		var distanceY = targetY - this.y;
		//我们设置一个总运动帧数
		var animateDuring = 6;
		//此时就能计算dx和dy
		this.dx = distanceX / animateDuring;
		this.dy = distanceY / animateDuring;
		//小帧号清零
		this.animateFrame = 0;
		//运动
		this.isMoving = true;
	}
})();