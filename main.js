'use strict';

var Game = {
    config: {
        x: 4, //行
        y: 4  //列
    },
    data: [],
    boxes: [],
    elScore: null,
    elTips: null,
    isOver: false,
    score: 0,

    /**
     * 数据初始化（全是0）
     */
    _dataInit(){
        let x = this.config.x, y;
        //构造每一行的数组（填充为0）
        while (x--) {
            this.data[x] = [];
            y = this.config.y;
            while (y--) {
                this.data[x][y] = 0;
            }
        }
    },

    /**
     * 数据扁平化
     */
    _dataSimply (){
        return this.data.reduce((p, n)=> {
            return p.concat(n);
        }, []);
    },

    /**
     * 数据空格子个数
     */
    _dataZeroLength(){
        return this._dataSimply().filter(i=> i === 0).length;
    },

    /**
     * 指定范围生成随机整数
     * @param min
     * @param max
     */
    _random(min, max){
        return ~~(Math.random() * (max - min + 1) + min);
    },

    /**
     * 寻找随机的空格子
     */
    _findEmptyBox(){
        let y = this.config.y;
        //数组一维化
        let list = this._dataSimply();
        let listNotZeroLength = this._dataZeroLength();

        //增加时候,没有新的空格子,游戏结束
        if (listNotZeroLength === 0) this._gameOver();

        //生成随机位置编号
        var rnd = this._random(0, listNotZeroLength - 1);//0~15
        //计算编号对应的真实坐标位置
        let count = 0;//1~16
        var i = list.findIndex(value => {
            value === 0 && count++;
            return count - 1 === rnd;
        });
        return {x: (~~(i / y)), y: (i % y), pos: i};
    },

    /**
     * 还能有移动的位置
     */
    _canMove(){
        //1.所有格子不能都填满数字
        if (this._dataZeroLength() !== 0) return true;
        //2.相邻格子数字相同
        //行
        let x = this.config.x;
        while (x--) {
            for (let i = 0; i < this.config.y - 1; i++) {
                if (this.data[x][i] === this.data[x][i + 1]) return true;
            }
        }

        //列
        let y = this.config.y;
        while (y--) {
            for (let i = 0; i < this.config.x - 1; i++) {
                if (this.data[i][y] === this.data[i + 1][y]) return true;
            }
        }
        //找不到可以移动的
        return false;
    },

    /**
     * 在其中一个格子内随机添加2/4
     */
    _randomNum(){
        //随机选取位置
        let {x:x, y:y} =this._findEmptyBox();
        this.data[x][y] = Math.random() < 0.5 ? 2 : 4;
    },

    /**
     * 游戏结束控制
     */
    _gameOver(){
        console.log('游戏结束');
        this.elTips.innerText = '游戏结束';
    },

    /**
     * 向左移动
     */
    moveLeft(){
        let x = this.config.x,
            y = this.config.y;
        // 观察每一行的数据
        // 从第一位开始，不为空，进行比较
        //      |- 下一位非空，是否相等
        //      |   |- 相等，第一位累加，本位置改为空
        //      |   |- 不等，break
        //      |- 下一位是空，跳过，继续比较下一位
        // 第一位开始，为空，找到下一位不为空数据，交换

        /**
         * 查找及合并下一个可以合并的数字
         * @param pointerX
         * @param pointerY
         */
        let _sumWithNext = (pointerX, pointerY)=> {
            for (let newPointer = pointerY + 1; newPointer < y; newPointer++) {
                if (this.data[pointerX][newPointer] === 0) {
                    //如果是0,继续查找
                    continue;
                } else {
                    //不是0,比较操作后,跳出循环
                    if (this.data[pointerX][newPointer] === this.data[pointerX][pointerY]) {
                        this.data[pointerX][pointerY] = this.data[pointerX][pointerY] * 2;
                        this.data[pointerX][newPointer] = 0;
                        this.score += this.data[pointerX][pointerY];
                    }
                    break;
                }
            }
        };

        let pointerX = 0;
        while (pointerX < x) {
            let pointerY = 0;
            while (pointerY < y) {
                if (this.data[pointerX][pointerY] === 0) {
                    //找到下一个不为空的位置
                    for (let newPointer = pointerY + 1; newPointer < y; newPointer++) {
                        if (this.data[pointerX][newPointer] !== 0) {
                            this.data[pointerX][pointerY] = this.data[pointerX][newPointer];
                            this.data[pointerX][newPointer] = 0;
                            //合并之后的数字
                            _sumWithNext(pointerX, pointerY);
                            break;
                        }
                    }
                } else {
                    //不为空,直接合并之后数字
                    _sumWithNext(pointerX, pointerY);
                }
                pointerY++;
            }
            pointerX++;
        }
    },

    /**
     * 向右移动
     */
    moveRight(){
        let x = this.config.x,
            y = this.config.y;
        // 观察每一行的数据
        // 从最后一位开始，不为空，进行比较
        //      |- 下一位非空，是否相等
        //      |   |- 相等，第一位累加，本位置改为空
        //      |   |- 不等，break
        //      |- 下一位是空，跳过，继续比较下一位
        // 最后一位开始，为空，找到下一位不为空数据，交换

        /**
         * 查找及合并下一个可以合并的数字
         * @param pointerX
         * @param pointerY
         */
        let _sumWithNext = (pointerX, pointerY)=> {
            for (let newPointer = pointerY - 1; newPointer >= 0; newPointer--) {
                if (this.data[pointerX][newPointer] === 0) {
                    //如果是0,继续查找
                    continue;
                } else {
                    //不是0,比较操作后,跳出循环
                    if (this.data[pointerX][newPointer] === this.data[pointerX][pointerY]) {
                        this.data[pointerX][pointerY] = this.data[pointerX][pointerY] * 2;
                        this.data[pointerX][newPointer] = 0;
                        this.score += this.data[pointerX][pointerY];
                    }
                    break;
                }
            }
        };

        let pointerX = 0;
        while (pointerX < x) {
            let pointerY = y - 1;
            while (pointerY >= 0) {
                if (this.data[pointerX][pointerY] === 0) {
                    //找到下一个不为空的位置
                    for (let newPointer = pointerY - 1; newPointer >= 0; newPointer--) {
                        if (this.data[pointerX][newPointer] !== 0) {
                            this.data[pointerX][pointerY] = this.data[pointerX][newPointer];
                            this.data[pointerX][newPointer] = 0;
                            //合并之后的数字
                            _sumWithNext(pointerX, pointerY);
                            break;
                        }
                    }
                } else {
                    //不为空,直接合并之后数字
                    _sumWithNext(pointerX, pointerY);
                }
                pointerY--;
            }
            pointerX++;
        }
    },

    /**
     * 向上移动
     */
    moveUp(){
        let x = this.config.x,
            y = this.config.y;

        /**
         * 查找及合并下一个可以合并的数字
         * @param pointerX
         * @param pointerY
         */
        let _sumWithNext = (pointerX, pointerY)=> {
            for (let newPointer = pointerX + 1; newPointer < x; newPointer++) {
                if (this.data[pointerX][newPointer] === 0) {
                    //如果是0,继续查找
                    continue;
                } else {
                    //不是0,比较操作后,跳出循环
                    if (this.data[newPointer][pointerY] === this.data[pointerX][pointerY]) {
                        this.data[pointerX][pointerY] = this.data[pointerX][pointerY] * 2;
                        this.data[newPointer][pointerY] = 0;
                        this.score += this.data[pointerX][pointerY];
                    }
                    break;
                }
            }
        };

        let pointerY = 0;
        while (pointerY < y) {
            let pointerX = 0;
            while (pointerX < x) {
                if (this.data[pointerX][pointerY] === 0) {
                    //找到下一个不为空的位置
                    for (let newPointer = pointerX + 1; newPointer < x; newPointer++) {
                        if (this.data[newPointer][pointerY] !== 0) {
                            this.data[pointerX][pointerY] = this.data[newPointer][pointerY];
                            this.data[newPointer][pointerY] = 0;
                            //合并之后的数字
                            _sumWithNext(pointerX, pointerY);
                            break;
                        }
                    }
                } else {
                    //不为空,直接合并之后数字
                    _sumWithNext(pointerX, pointerY);
                }
                pointerX++;
            }
            pointerY++;
        }
    },

    /**
     * 向下移动
     */
    moveDown(){
        let x = this.config.x,
            y = this.config.y;

        /**
         * 查找及合并下一个可以合并的数字
         * @param pointerX
         * @param pointerY
         */
        let _sumWithNext = (pointerX, pointerY)=> {
            for (let newPointer = pointerX - 1; newPointer >= 0; newPointer--) {
                if (this.data[pointerX][newPointer] === 0) {
                    //如果是0,继续查找
                    continue;
                } else {
                    //不是0,比较操作后,跳出循环
                    if (this.data[newPointer][pointerY] === this.data[pointerX][pointerY]) {
                        this.data[pointerX][pointerY] = this.data[pointerX][pointerY] * 2;
                        this.data[newPointer][pointerY] = 0;
                        this.score += this.data[pointerX][pointerY];
                    }
                    break;
                }
            }
        };

        let pointerY = 0;
        while (pointerY < y) {
            let pointerX = x - 1;
            while (pointerX >= 0) {
                if (this.data[pointerX][pointerY] === 0) {
                    //找到下一个不为空的位置
                    for (let newPointer = pointerX - 1; newPointer >= 0; newPointer--) {
                        if (this.data[newPointer][pointerY] !== 0) {
                            this.data[pointerX][pointerY] = this.data[newPointer][pointerY];
                            this.data[newPointer][pointerY] = 0;
                            //合并之后的数字
                            _sumWithNext(pointerX, pointerY);
                            break;
                        }
                    }
                } else {
                    //不为空,直接合并之后数字
                    _sumWithNext(pointerX, pointerY);
                }
                pointerX--;
            }
            pointerY++;
        }
    },

    /**
     * 启动函数
     */
    init(){
        this.isOver = false;
        this.score = 0;
        this.elTips.innerText = '';
        this._dataInit();
        //随机生成2个位置数字
        this._randomNum();
        this._randomNum();
        this.render();
    },

    /**
     * 键盘事件绑定
     */
    event(){
        document.addEventListener('keydown', e => {
            if (this.isOver) {
                this._gameOver();
                return;
            }

            if (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
                let oldStatus = JSON.stringify(this.data);
                switch (e.which) {
                    case 37:
                        //left
                        this.moveLeft();
                        break;
                    case 39:
                        //right
                        this.moveRight();
                        break;
                    case 38:
                        //up
                        this.moveUp();
                        break;
                    case 40:
                        //down
                        this.moveDown();
                        break;
                    default:
                        break;
                }
                let newStatus = JSON.stringify(this.data);
                //移动前和移动后不一致,说明有挪动的格子,此时需要增加随机格子
                if (oldStatus !== newStatus) this._randomNum();

                //判断是否还可以移动
                this.isOver = !this._canMove();

                this.render();
            }

        }, false);


        document.querySelector('#J_Start').addEventListener('click', e => {
            this.init();
        }, false);


    },

    /**
     * 建立页面网格
     * @param selector
     */
    createGrid(selector){
        let el = document.querySelector(selector);

        let l1temp = '';
        let l1temp2 = '';
        for (let i = 0; i < this.config.y; i++) l1temp += '<div class="box"></div>';
        for (let i = 0; i < this.config.x; i++) l1temp2 += '<div class="line">' + l1temp + '</div>';

        let l2temp = '';
        let l2temp2 = '';
        for (let i = 0; i < this.config.y; i++) l2temp += '<div class="box"></div>';
        for (let i = 0; i < this.config.x; i++) l2temp2 += '<div class="line">' + l2temp + '</div>';

        el.innerHTML = '<div class="bg"><div class="layer1">' + l1temp2 + '</div><div class="layer2" id="J_Boxes">' + l2temp2 + '</div></div>';

        let lines = document.querySelectorAll('#J_Boxes .line');
        lines.forEach(line => {
            let arr = [];
            line.querySelectorAll('.box').forEach(box => {
                arr.push(box);
            });
            this.boxes.push(arr);
        });

        this.elScore = document.querySelector('#J_Score');
        this.elTips = document.querySelector('#J_Tips');
    },

    /**
     * 页面渲染
     */
    render(){
        this.data.forEach((x, indexX) => {
            x.forEach((y, indexY) => {
                let curBox = this.boxes[indexX][indexY];
                //清理数据
                curBox.innerText = '';
                curBox.dataset.value = '';
                //渲染新数据
                if (y === 0) return;
                curBox.innerText = y;
                curBox.dataset.value = y;
            });
        });

        this.elScore.innerText = this.score;

        this.printArray();

    },

    printArray(){
        console.log(this.data.reduce((p, n)=> (p += n.join('\t\t') + '\n\n', p), ''));
    }
};


window.onload = () => {
    Game.createGrid('#J_Body');
    Game.init();
    Game.event();
};

