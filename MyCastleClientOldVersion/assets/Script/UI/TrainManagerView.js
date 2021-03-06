// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        head: {
            default: null,
            type: cc.Sprite,
        },
        mName: {
            default: null,
            type: cc.Label,
        },
        mLevel: {
            default: null,
            type: cc.Label,
        },
        desc: {
            default: null,
            type: cc.Label,
        },
        sPic: {
            default: null,
            type: cc.Sprite,
        },
        sCd: {
            default: null,
            type: cc.Label,
        },
        sDesc: {
            default: null,
            type: cc.Label,
        },
        prosList: {
            default: [],
            type: [cc.ProgressBar],
        },
        valList: {
            default: [],
            type: [cc.Label],
        },
        levelList: {
            default: [],
            type: [cc.Label],
        },
        trainBtn: {
            default: null,
            type: cc.Node,
        },
        trainCost: {
            default: null,
            type: cc.Label,
        },
        trainCostOutLine: {
            default: null,
            type: cc.LabelOutline,
        },
        trainBtnList: {
            default: [],
            type: [cc.Button],
        },
        trainCostList: {
            default: [],
            type: [cc.Label],
        },
        curManagerIdx: {
            default: null,
            visible: false,
        },
        curInfo: {
            default: null,
            visible: false,
        },
        isDataInit: {
            default: false,
            visible: false,
        },
        maxLevel: {
            default: 9,
            visible: false,
        },
        isTrain: {
            default: false,
            visible: false,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        window.trainScript = this;
        this.maxLevel = 9;
    },
    onEnable() {
        this.schedule(this.refreashData, 0.25);
    },
    onDisable() {
        this.unschedule(this.refreashData);
    },

    start() { },

    loadInfo(idx) {
        this.curManagerIdx = idx;
        this.curInfo = managerScript.managerInfoList[idx];

        var picName = managerScript.managerCof[idx].pic;
        if (player.worldId == 0 || player.worldId == 1 || player.worldId == 2) {
            if (idx == 0 || idx == 2 || idx == 4) {
                picName = "UIManager.m" + idx + "-" + player.worldId;
            }
        }
        resManager.loadSprite(picName, function (spriteFrame) {
            this.head.spriteFrame = spriteFrame;
        }.bind(this));

        this.mName.string = managerScript.managerCof[idx].name;

        this.desc.getComponent("LocalizedLabel").dataID = managerScript.managerCof[idx].desc;

        this.sDesc.getComponent("LocalizedLabel").dataID = managerScript.managerCof[idx].sDesc;

        //设置店面图片
        resManager.loadSprite(this.curInfo[11], function (spriteFrame) {
            this.sPic.spriteFrame = spriteFrame;
        }.bind(this));


        for (var i = 0; i < 3; i = i + 1) {
            this.prosList[i].totalLength = this.prosList[i].node.width - 10.5;
        }

        this.refreashData()
        this.isDataInit = true;
    },

    refreashData() {
        if (!this.isDataInit) {
            return;
        }
        this.mLevel.string = "LV." + managerScript.judgeLevel(this.curInfo);

        this.sCd.string = managerScript.countSkillCd(this.curInfo[9]);

        if (this.curInfo[5] < this.maxLevel) {
            this.initTrainBtn();
            var cost = this.countCost(5) * 3;
            this.trainCost.string = gameApplication.countUnit(cost)[2];
            if (cost > player.itemArrayGet("pCurrency", 0)) {
                this.trainBtn.interactable = false;
                this.trainCostOutLine.enabled = true;
            } else {
                this.trainBtn.interactable = true;
                this.trainCostOutLine.enabled = false;
            }
        }

        for (var i = 0; i < 3; i = i + 1) {
            this.prosList[i].progress = this.curInfo[5 + i] / this.maxLevel;

            this.levelList[i].string = "LV." + (this.curInfo[5 + i] + 1);

            if (i == 1) {
                var eLV = this.curInfo[6];
                var val = 3600 * Math.pow(0.9, eLV);
                var nexVal = 3600 * Math.pow(0.9, (eLV + 1));
                this.valList[i].string = val.toFixed(2) + "s (" + (nexVal - val).toFixed(2) + "s)";
            } else if (i == 2) {
                var sLV = this.curInfo[7];
                var val = 60 * Math.pow(1.1, sLV);
                var nexVal = 60 * Math.pow(1.1, (sLV + 1));
                this.valList[i].string = val.toFixed(2) + "s (+" + (nexVal - val).toFixed(2) + "s)";
            }

            /* if (this.curInfo[5 + i] < this.maxLevel) {
                this.initTrainBtn(i);
                var cost = this.countCost(5 + i);
                this.trainCostList[i].string = gameApplication.countUnit(cost)[2];
                if (cost > player.itemArrayGet("pCurrency", 0)) {
                    this.trainBtnList[i].interactable = false;
                } else {
                    this.trainBtnList[i].interactable = true;
                }
            } else {
                this.trainBtnList[i].interactable = false;
                this.trainCostList[i].string = "MAX";
            } */
        }
    },

    //初始化训练按钮
    initTrainBtn(idx) {
        /* this.trainBtnList[idx].node.off('click');
        this.trainBtnList[idx].node.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.trainSkill(idx + 5);
        }.bind(this), this) */

        this.trainBtn.off('click');
        this.trainBtn.on('click', function (event) {
            gameApplication.soundManager.playSound("btnClick");
            this.trainSkill();
        }.bind(this), this)
    },

    //管家训练
    trainSkill(/* type */) {
        if (this.isTrain) {
            return;
        }
        this.isTrain = true;
        var cost = this.countCost(5/* type */)*3;
        if (cost < player.itemArrayGet("pCurrency", 0) && this.curInfo[5/* type */] < this.maxLevel) {
            player.itemArrayAdd("pCurrency", 0, -cost, function () {
                //升级管家成就
                player.itemArrayAdd("pAchievement", 2, 1);

                this.curInfo[5] = this.curInfo[5] + 1;
                this.curInfo[6] = this.curInfo[6] + 1;
                this.curInfo[7] = this.curInfo[7] + 1;
                managerScript.managerInfoList[this.curManagerIdx] = this.curInfo;
                player.itemArraySet("myManagers", this.curManagerIdx, this.curInfo, function () {
                    this.isTrain = false;
                    managerScript.initManagerList();
                }.bind(this));
            }.bind(this));
        } else {
            gameApplication.popVideoCash();
            this.isTrain = false;
        }
    },

    //计算训练价格
    countCost(type) {
        if (this.curInfo[type] == 0 && this.curManagerIdx == 0) {
            return 10;
        }
        return 10 * Math.pow(10, Math.floor(this.curInfo[type]) * 3);
    },

    // update (dt) {},
});
