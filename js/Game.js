(function(){
    //构造函数
    var Game = window.Game = function(){
        //得到画布
        this.mycanvas = document.getElementById("mycanvas");
        //设置上下文，也设置成为Game的属性
        this.ctx = this.mycanvas.getContext("2d");
        //时间流逝的比例
        this.rate = 1;
        //希望总共能玩多少秒
        this.alltime = 60;
        //设置一下各种数值
        this.rowamount = 7;//行总数
        this.colamount = 7;//列总数
        this.paddingLeftRight = 20; //左右补白
        this.paddingBottom = 30;    //下补白
        //参与游戏的精灵的种类个数
        this.spriteTypeAmount = 6;
        //最后一次消除的帧编号
        this.xiaochufno = 0;
        //当前的联销等级
        this.lianxiaodengji = 0;
        //分数
        this.score = 0;
        //决定参与游戏的精灵的文件名
        this.spriteTypes = _.sample(["i0","i1","i2","i3","i4","i5","i6","i7","i8","i9","i10","i11","i12","i13","i14"],this.spriteTypeAmount);
        //设置画布的宽度和高度
        this.init();
        //有限状态机
        this.fsm = "消除检测";
        //预约器
        this.appointment = [];
        //读取所有资源
        this.loadResource(function(){
            //回调函数
            this.start();
            //绑定事件
            this.bindEvent();
        });
    }
    //设置画布的宽度和高度
    Game.prototype.init = function(){
        //设置canvas的宽度和高度，适配当前的视口
        this.mycanvas.width = document.documentElement.clientWidth;
        this.mycanvas.height = document.documentElement.clientHeight;
        //要验收，因为要把宽度、高度卡在一个区间内。
        if(this.mycanvas.width > 500){
             this.mycanvas.width = 500;
        }
        if(this.mycanvas.height > 800){
             this.mycanvas.height = 800;
        }


        //精灵宽度
        this.spriteW = (this.mycanvas.width - 2 * this.paddingLeftRight) / this.colamount;
        //精灵高度
        this.spriteH =  this.spriteW ; //正方形
        //0号精灵的x
        this.spriteBaseX = this.paddingLeftRight;
        //0号精灵的y
        this.spriteBaseY = this.mycanvas.height - this.paddingBottom - this.rowamount * this.spriteH;
    }
    //读取资源
    Game.prototype.loadResource = function(callback){
        //设置R对象
        this.R = {
            "bg1" : "images/bg1.png",
            "logo" : "images/logo.png",
            "i0" : "images/i0.png",
            "i1" : "images/i1.png",
            "i2" : "images/i2.png",
            "i3" : "images/i3.png",
            "i4" : "images/i4.png",
            "i5" : "images/i5.png",
            "i6" : "images/i6.png",
            "i7" : "images/i7.png",
            "i8" : "images/i8.png",
            "i9" : "images/i9.png",
            "i10" : "images/i10.png",
            "i11" : "images/i11.png",
            "i12" : "images/i12.png",
            "i13" : "images/i13.png",
            "i14" : "images/i14.png",
            "bomb" : "images/bomb.png"
        };
        //现在要得到图片的总数
        var imagesAmount = Object.keys(this.R).length;
        //备份this
        var self = this;
        //计数器，加载好的图片个数
        var count = 0;
        //遍历R对象，加载图片
        for(var k in this.R){
            (function(k){
                var image = new Image();
                image.src = self.R[k];
                //监听图片加载完成
                image.onload = function(){
                    //计数
                    count++;
                    //改变R对象，让R对象对应的k的值变为这个图片对象
                    self.R[k] = this;
                    //提示用户
                    self.ctx.textAlign = "center";
                    self.ctx.font = "20px 黑体";
                    //清屏
                    self.clear();
                    self.ctx.fillText("正在加载图片" + count + "/" + imagesAmount , self.mycanvas.width/2 , self.mycanvas.height/2 * 0.618);
                    //如果加载好的数量等于总数，说明全都加载好了
                    if(count == imagesAmount){
                        //全部加载完毕，执行回调函数。
                        callback.call(self);
                    }
                }
            })(k);
        }
    }
    //清屏
    Game.prototype.clear = function(){
        this.ctx.clearRect(0,0,this.mycanvas.width,this.mycanvas.height);
    }
    //开始游戏
    Game.prototype.start = function(){
        //start的调用是在loadResource之后
        //设置帧编号
        this.fno = 0;
        //实例化地图
        this.map = new Map();
        //主循环，bind表示设置上下文，但是不调用，call会调用函数
        this.timer = setInterval(this.loop.bind(this),20);
    }
    //主循环的内容，这个函数中的所有语句都是每帧要执行的
    Game.prototype.loop = function(){
        //清屏
        this.clear();
        //帧编号加1
        this.fno++;
        //重新计算已经流逝了的比例，一秒50帧
        this.rate = 1 - ((this.fno / 50) / this.alltime);
        //检查是否吻合了某个预约器
        for(var i = this.appointment.length - 1 ; i >= 0 ; i--){
            if(this.appointment[i].fno == this.fno){
                this.appointment[i].fn.call(this);
                //删除这项
                this.appointment.splice(i,1);
            }
        }

        //状态机的工作
        if(this.fsm == "消除检测"){
            if(this.map.check().length > 0){
                this.fsm = "爆炸";
            }else{
                this.fsm = "静稳状态";
            }
        }else if(this.fsm == "爆炸"){
            this.map.bomb();
            //临时切换为动画时间避讳一下
            this.fsm = "动画时间";
            //同时预约8帧之后为下落
            this.makeAppointment(this.fno + 6 , function(){
                this.fsm = "下落";
            });
        }else if(this.fsm == "下落"){
            this.map.drop();
            //临时切换为动画时间避讳一下
            this.fsm = "动画时间";
            //同时预约8帧之后为补充新的
            this.makeAppointment(this.fno + 6 , function(){
                this.fsm = "补充新的";
            });
        }else if(this.fsm == "补充新的"){
            this.map.supplement();
            //临时切换为动画时间避讳一下
            this.fsm = "动画时间";
            //同时预约8帧之后为消除检测
            this.makeAppointment(this.fno + 6 , function(){
                this.fsm = "消除检测";
            });
        }


        //显示背景，背景现在不是类，直接显示就行了
        this.ctx.drawImage(this.R["bg1"],0,0,this.mycanvas.width,this.mycanvas.height);

        //显示logo
        var logow = this.mycanvas.width/1.3;
        this.ctx.drawImage(this.R["logo"],(this.mycanvas.width - logow)/2,0,logow,392*(logow / 531));

        //渲染半透明的黑色矩形
        this.ctx.fillStyle = "rgba(0,0,0,.6)";
        this.ctx.fillRect(this.spriteBaseX - this.paddingLeftRight / 2 , this.spriteBaseY - this.paddingLeftRight / 2 , this.mycanvas.width - this.paddingLeftRight , this.rowamount * this.spriteH + this.paddingBottom / 2);

        //渲染地图
        this.map.render();

        if(this.rate < 0){
            //改变场景管理器
            this.fsm = "时间到了";
            //显示一个东西
            this.ctx.fillStyle = "orange";
            this.ctx.fillRect(0,200,this.mycanvas.width , 200);
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "white";
            this.ctx.font = "60px 微软雅黑";
            this.ctx.textBaseLine = "middle";
            this.ctx.fillText("分数：" + this.score ,this.mycanvas.width/2,200);
            this.ctx.font = "30px 微软雅黑";
            this.ctx.fillText("点击屏幕重玩",this.mycanvas.width/2,300);
            this.ctx.fillText("彭蒙善出品",this.mycanvas.width/2,340);
            return;
        }


        //渲染时间轴
        this.ctx.fillStyle = "#333";
        this.ctx.fillRect(this.spriteBaseX - this.paddingLeftRight / 2, this.spriteBaseY - 50 , this.spriteW * this.colamount + this.paddingLeftRight, 30);
        this.ctx.fillStyle = "gold";
        this.ctx.fillRect(this.spriteBaseX - this.paddingLeftRight / 2, this.spriteBaseY - 50 , (this.spriteW * this.colamount + this.paddingLeftRight) * this.rate, 30);

        //显示帧编号，方便我们测试
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";
        this.ctx.font = "16px consolas";
        this.ctx.fillStyle = "#333";
        this.ctx.fillText("帧编号：" + this.fno , 10 ,10);
        this.ctx.fillText("状态机：" + this.fsm , 10 ,30);
        this.ctx.fillText("分数：" + this.score , 10 ,50);
    }
    Game.prototype.bindEvent = function(){
        var self = this;
        var startrow , startcol;

        function touchmovehandler(event){
            var x = event.touches[0].clientX;
            var y = event.touches[0].clientY;

            var endcol = parseInt((x - self.spriteBaseX) / self.spriteW);
            var endrow = parseInt((y - self.spriteBaseY) / self.spriteH);

            //验收
            if(endcol < 0 || endrow < 0 || endcol > self.colamount - 1 || endrow > self.rowamount - 1) {
                this.removeEventListener("touchmove",touchmovehandler , false);
                return;
            }


            if(
                startrow == endrow && Math.abs(startcol - endcol) == 1
                ||
                startcol == endcol && Math.abs(startrow - endrow) == 1
            ){
                //命令运动
                self.map.sprites[startrow][startcol].moveTo(endrow,endcol);
                self.map.sprites[endrow][endcol].moveTo(startrow,startcol);

                self.fsm = "交换运动中请等待";

                self.makeAppointment(self.fno + 8 , function(){

                    //交换数组矩阵，交换A、B的值需要C帮忙。
                    var temp = self.map.matrix[startrow][startcol];
                    self.map.matrix[startrow][startcol] = self.map.matrix[endrow][endcol];
                    self.map.matrix[endrow][endcol] = temp;
                    //检查是否能消除
                    if(self.map.check().length == 0){
                        //可以消除
                        //再次交换回来，因为不能消除，所以刚刚的交换数组矩阵要再次交换回来。
                        var temp = self.map.matrix[startrow][startcol];
                        self.map.matrix[startrow][startcol] = self.map.matrix[endrow][endcol];
                        self.map.matrix[endrow][endcol] = temp;
                        //如果不能消除，那么8帧之后执行返回动画
                        self.map.sprites[startrow][startcol].moveTo(startrow,startcol);
                        self.map.sprites[endrow][endcol].moveTo(endrow,endcol);
                        self.makeAppointment(self.fno + 8 , function(){
                             self.fsm = "静稳状态";
                         });
                    }else{
                        //让两个矩阵进行匹配
                        self.map.createSpritesByMatrix();  //重新根据matrix矩阵来生成一个sprites的矩阵
                        self.fsm = "消除检测";
                    }
                 });

                //剥夺事件，否则事件会再一次触发
                this.removeEventListener("touchmove",touchmovehandler , false);

            }
        }

        //绑定事件
        this.mycanvas.addEventListener("touchstart", function(event){
            event.preventDefault();
            //在静稳状态
            if(self.fsm == "静稳状态"){
                var x = event.touches[0].clientX;
                var y = event.touches[0].clientY;

                startcol = parseInt((x - self.spriteBaseX) / self.spriteW);
                startrow = parseInt((y - self.spriteBaseY) / self.spriteH);

                if(startcol < 0 || startrow < 0 || startcol > self.colamount - 1 || startrow > self.rowamount - 1) {
                   this.removeEventListener("touchmove",touchmovehandler , false);
                    return;
                }

                //注册一个事件
                this.addEventListener("touchmove" , touchmovehandler , false);
            }else if(self.fsm == "时间到了"){
                self.map = new Map();
                self.rate = 1;
                self.fno = 0;
                self.score = 0;
                self.fsm = "消除检测";
            }
        },false);

        document.addEventListener("touchend",function(){
            this.removeEventListener("touchmove" , touchmovehandler , false);
        },false);
    }
    //做一个预约
    Game.prototype.makeAppointment = function(fno,fn){
        this.appointment.push({"fno" : fno , "fn" : fn});
    }
})();