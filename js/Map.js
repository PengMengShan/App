(function(){
	var Map = window.Map = function(){
		//矩阵，先写死，后面变为随机的
		this.matrix =(function(){
				var arr = [];
				for(var i = 0 ; i < game.rowamount ; i++){
					var a = [];
					for(var j = 0 ; j < game.colamount ;j++){
						a.push(_.random(0,game.spriteTypeAmount - 1));
					}
					arr.push(a);
				}
				arr.push([]);
				console.log(arr);
				return arr;
			})();
		//调用函数，生成精灵
		this.createSpritesByMatrix();

	}
	//根据矩阵创建精灵，创建出的也是一个二维数组。
	Map.prototype.createSpritesByMatrix = function(){
		this.sprites = [];	//二维数组
		//遍历每一行
		for(var r = 0 ; r < game.rowamount ; r++){
			var _temp = [];
			for(var c = 0 ; c < game.colamount ; c++){
				_temp.push(new Sprite(r,c,this.matrix[r][c]));
			}
			this.sprites.push(_temp);
		}
	}
	//渲染
	Map.prototype.render = function(){
		//渲染自己精灵矩阵中的所有精灵
		for(var r = 0 ; r < game.rowamount ; r++){
			for(var c = 0 ; c < game.colamount ; c++){
				//只要是精灵的实例，就能调用精灵的方法
				this.sprites[r][c].render();
			}
		}
	}
	//检查是否能消除，这个函数将返回所有能够消除的元素sprite的实例数组。
	Map.prototype.check = function(){
		var results = [];
		//先去按行检查
		for(var r = 0 ; r < game.rowamount ; r++){
			//用i、j法去检查therowarr中是否存在连续3项或者更多的相同
			var i = 0;
			var j = 1;
			while(j <= game.rowamount){
				if(this.matrix[r][i] != this.matrix[r][j]){
					//不一样
					//此时看看差的间隔
					if(j - i >= 3){
						for(var m = i ; m < j ; m++){
							results.push(this.sprites[r][m]);
						}
					}
					i = j;
				}
				j++;
			}
		}

		//然后按列检查
		//先去按行检查
		for(var c = 0 ; c < game.colamount ; c++){
			//用i、j法去检查therowarr中是否存在连续3项或者更多的相同
			var i = 0;
			var j = 1;
			while(j <= game.rowamount){
				if(this.matrix[i][c] != this.matrix[j][c]){
					//不一样
					//此时看看差的间隔
					if(j - i >= 3){
						for(var m = i ; m < j ; m++){
							results.push(this.sprites[m][c]);
						}
					}
					i = j;
				}
				j++;
			}
		}

		var results = _.uniq(results);
		return results;
	}
	//爆炸
	Map.prototype.bomb = function(){
		var needbomb = this.check();
		for(var i = 0 ; i < needbomb.length ; i++){
			needbomb[i].bomb();
			//让爆炸的元素在matrix阵上变为■
			this.matrix[needbomb[i].row][needbomb[i].col] = "■";
		}
	}
	//下落
	Map.prototype.drop = function(){
		//【计算下落行数】
		//下落行数阵
		this.dropnumber = [[],[],[],[],[],[],[],[]];
		//看看当前的matrix，依次遍历每一个元素，计算这个元素应该下落的行数。就是统计这个元素下面的■的个数。
		for(var row = game.rowamount - 1 ; row >= 0; row--){
			for (var col = 0; col < game.colamount; col++) {
				var sum = 0;
				for(var _row = row + 1 ; _row < game.rowamount ; _row++){
					if(this.matrix[_row][col] == "■"){
						sum++;
					}
				}
				//写入矩阵
				this.dropnumber[row][col] = sum;

 				//命令动画
				this.sprites[row][col].moveTo(row + sum , col);
				//紧凑编码矩阵
				if(sum != 0){
					this.matrix[row + sum][col] = this.matrix[row][col];
					this.matrix[row][col] = "■";
				}
			}
		}

		//计算联销
		if(game.fno - game.xiaochufno < 50 * 10){
			game.lianxiaodengji++;
			game.score += game.lianxiaodengji;
			//让最后一次的消除帧号为当前帧号
			game.xiaochufno = game.fno;

			if(game.lianxiaodengji > 8){
				game.lianxiaodengji = 8;

			}
		}else{
			game.lianxiaodengji = 1;
			game.score += game.lianxiaodengji;
		}

		document.getElementById("e" + game.lianxiaodengji).load();
		document.getElementById("e" + game.lianxiaodengji).play();
	}
	//补充新的
	Map.prototype.supplement = function(){
		//全员重new
		this.createSpritesByMatrix();
		//遍历当前的matrix，遇见一个■就new一个新的，同时命令动画
		for(var row = 0 ; row < game.rowamount ; row++){
			for (var col = 0; col < game.colamount; col++) {
				if(this.matrix[row][col] == "■"){
					var stype = _.random(0,5);
					//遇见一个■就补充一个新的
					this.sprites[row][col] = new Sprite(row , col , stype);
					//在天上就位
					this.sprites[row][col].y = 0;
					//然后下落
					this.sprites[row][col].moveTo(row, col);
					//写matrix
					this.matrix[row][col] = stype;
				}
			}
		}
	}
})();