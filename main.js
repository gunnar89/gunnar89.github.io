/*
playerName
currentEnergy
currentStatus
food
trainPoints
zombiesKilled

vvar
//todo if zombie is not killed, save HP
 */

var globalThis = this
var mstore = window.localStorage

function ll(logMsg) {
  console.log(logMsg)
}


var plStatus = {
  sitting: {
    energyMod: 1.0
  },

  exploring: {
    energyMod: 1.5
  },

  training: {
    energyMod: 2
  },

  hunting: {
    energyMod: 2.5
  },

}

settings = {
  //admin
  increaseEnergyBy: 10000,

  //player
  maxEnergy:100,
  decreasingEnergyNormal:0.5,
  sleepEnergyIncrease:2,
  foodDecrease:1,
  energyIncreaePerFood: 5, //todo slightly randomized

}

function createRand(max) {
      return Math.floor(Math.random() * Math.floor(max))
    }

function a(where, what) {
  mstore.setItem(where, what)
}

function g(what) {
  return mstore.getItem(what)
}




var app = new Vue({
  el: '#app',

  data: {
    attackNow:0,
    randomZombieHP:100,
    attackMsg:'',

    gameIntervals: [],

    playerName:g('playerName'),
    plCurrLocation:'home',
    maxFood:100,
    currentEnergy:g('currentEnergy'),
    food: parseInt(g('food')) ? parseInt(g('food')) : 10,
    currentStatus:'sit',
    currentInterval: '',
    trainPoints: g('trainPoints') ? parseInt(g('trainPoints')) : 0,
    expPoints: g('expPoints') ? parseInt(g('expPoints')) : 0,
    zombiesKilled: g('zombiesKilled') ? parseInt(g('zombiesKilled')) : 0,
  },

  methods: {

    zombieFight() {

      this.currentStatus ='hunt'
      if(this.randomZombieHP > 0) {
        this.randomZombieHP -= createRand(10)
      } else {
          this.attackMsg = 'Zombie is now killed!'
        this.zombiesKilled += 1
          for(var inter of this.gameIntervals ) {
            clearInterval(inter)
          }
      this.currentStatus = 'sit'
      }

    },

    attackAZombieActivity() {
      for(var inter of this.gameIntervals ) {
            clearInterval(inter)
          }
      this.startHuntingActivity()
      this.randomZombieHP = 100
      this.zombieFightInterval = setInterval(this.zombieFight, 500)
      this.gameIntervals.push(this.zombieFightInterval)
    },

    saveName() {
      a('playerName', this.playerName )
    },

    addEnergy() {
      if (!this.currentEnergy) {
        this.currentEnergy = 100
        a('currentEnergy', this.currentEnergy)
      }

      this.currentEnergy += globalThis.settings.increaseEnergyBy
    },

    sitting() {
      if(this.currentEnergy>0) {
        this.currentEnergy -= globalThis.settings.decreasingEnergyNormal;
      } else {
        clearInterval(this.currentInterval)
      }
    },

    decreaseEnergy() {
      switch (this.currentStatus) {
        case 'sit':
          this.sitting()
          break;
        case 'explore':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal)*globalThis.plStatus.exploring.energyMod;
          break;
        case 'train':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.training.energyMod
          break;
        case 'walk':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.walking.energyMod
          break;
        case 'hunt':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.hunting.energyMod
          break;
        case 'sleep':
          this.sleeping()
          break;
      } //swi
    }, //decrtease

    addTrainPoints() {
      if(this.currentEnergy>10) {
        this.trainPoints += 0.5
      } else {
        clearInterval(this.currentInterval)
        ll('No Energy')
        this.currentStatus = 'sit'
      }

    },

    startTrainingActivity() {
      this.trainInterval = setInterval(this.addTrainPoints, 3000)
      this.currentInterval = this.trainInterval
    },

    exploreEnvironment() {
      ll('exploring environment')

      if(this.currentEnergy> 10) {
        var r = createRand(100)
        if(r>80) {
          this.food += 1
        }
      } else {
        ll('Going home..')
        clearInterval(this.currentInterval)
        this.currentStatus = 'sit'
      }



    },

    startExploreActivity() {
            for(var inter of this.gameIntervals ) {
            clearInterval(inter)
          }
      this.exploreInterval = setInterval(this.exploreEnvironment, 1000)
      this.gameIntervals.push(this.exploreInterval)
    },

    addKilledZombies() {
      this.zombiesKilled += 1
    },

    huntZombies() {
      this.expPoints += 1

    },

    startHuntingActivity() {
      ll('Started Passive Hunting activitry')
      this.huntInterval = setInterval(this.huntZombies, 1000)
      this.addKilledZombiesInterval = setInterval(this.addKilledZombies, 10000)
      this.gameIntervals.push(this.huntInterval)
      this.gameIntervals.push(this.addKilledZombiesInterval)
    },

    sleeping() {
     if(this.currentEnergy<101){
       this.currentEnergy += globalThis.settings.sleepEnergyIncrease

     } else {
       this.currentStatus = 'sit'
       clearInterval(this.currentInterval)
     }

    },

    startSleepActivity() {
      this.sleepInterval = setInterval(this.sleeping, 1000)
      this.currentInterval = this.sleepInterval
      this.currentStatus = 'sleep'
    },

    eatFood() {
      var f = parseInt(this.currentEnergy)
      if(f < globalThis.settings.maxEnergy) {
        this.food -= globalThis.settings.foodDecrease
        f += parseInt(globalThis.settings.energyIncreaePerFood)
        this.currentEnergy = f
      }
    },

    setActivity(activity) {
      switch (activity) {
        case 'sit':
          this.currentStatus = 'sit';
          for(var inter of this.gameIntervals ) {
            clearInterval(inter)
          }
          break;
        case 'explore':
          this.currentStatus = 'explore';
          this.startExploreActivity()
          break;
        case 'train':
          this.currentStatus = 'train';
           clearInterval(this.currentInterval)
          this.startTrainingActivity();
          break;
        case 'hunt':
          this.currentStatus = 'hunt';
            this.startHuntingActivity();
          break;
        case 'sleep':
          clearInterval(this.currentInterval)
          this.currentStatus = 'sleep';
          break;

      }

    },

    resetEnergy() {
      this.currentEnergy = 100
    },

    a_addFood() {
      this.food += 50
    },

    savePlayerData() {

      a('currentEnergy', this.currentEnergy)
      a('currentStatus', this.currentStatus)
      a('food', this.food)
      a('trainPoints', this.trainPoints)
      a('expPoints', this.expPoints)
      a('zombiesKilled', this.zombiesKilled)


    },

    moveDot() {
      ll(this.$refs['dot'].parentNode)
    }

  }, //methods

  computed: {

  },//computed

  mounted() {
    setInterval(this.decreaseEnergy, 5000)
    setInterval(this.savePlayerData, 3000)
  }//mounted






})
