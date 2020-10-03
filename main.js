/*
playerName
currentEnergy
currentStatus
food
trainPoints

vvar

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
  energyIncreaePerFood: 50, //todo slightly randomized

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
    playerName:g('playerName'),
    plCurrLocation:'home',
    currentEnergy:g('currentEnergy'),
    food: parseInt(g('food')),
    currentStatus:'sit',
    currentInterval: '',
    trainPoints: parseInt(g('trainPoints')),
    expPoints: 0,
  },

  methods: {

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

    decreaseEnergy() {
      switch (this.currentStatus) {
        case 'sit':
          this.currentEnergy -= globalThis.settings.decreasingEnergyNormal;
          break;
      case 'explore':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal)*globalThis.plStatus.exploring.energyMod;
          break;
        case "hunt":
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.hunting.energyMod
          break;

        case 'train':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.training.energyMod
          break;

        case 'walk':
          this.currentEnergy -= (globalThis.settings.decreasingEnergyNormal) * globalThis.plStatus.walking.energyMod
          break;

        case 'sleep':
          this.currentEnergy += (globalThis.settings.sleepEnergyIncrease)
          break;


      }

    },

    addTrainPoints() {
      if(this.currentEnergy>80) {
        this.trainPoints += 1
      } else {
        clearInterval(this.currentInterval)
        ll('No Energy')
        this.currentStatus = 'sit'
      }

    },

    startTrainingActivity() {
      this.trainInterval = setInterval(this.addTrainPoints, 1000)
      this.currentInterval = this.trainInterval
    },

    exploreEnvironment() {

      if(this.currentEnergy> 10) {
        var r = createRand(100)
        if(r>50) {
          this.food += 1
        }
      } else {
        ll('Going home..')
        clearInterval(this.currentInterval)
        this.currentStatus = 'sit'
      }



    },

    checkEnergy() {
      var howMuchLeft = 0
      if(this.currentEnergy < globalThis.settings.maxEnergy) {
        howMuchLeft = globalThis.settings.maxEnergy - this.currentEnergy


      }
    },

    startExploreActivity() {
      this.exploreInterval = setInterval(this.exploreEnvironment, 1000)
      this.currentInterval = this.exploreInterval
    },

    huntZombies() {
      ll('1 zombie hunted')
    },

    startHuntingActivity() {
      this.huntInterval = setInterval(this.huntZombies, 1000)
      this.currentInterval = this.huntInterval
    },

    sleeping() {
     if(this.currentEnergy<101){
       this.currentEnergy += globalThis.settings.sleepEnergyIncrease
       ll('sleeping..')
     } else {
       ll('i slept enough')
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
      if(this.currentEnergy < globalThis.settings.maxEnergy) {
        this.food -= globalThis.settings.foodDecrease
        this.currentEnergy += globalThis.settings.energyIncreaePerFood
      }
    },

    setActivity(activity) {
      switch (activity) {
        case 'sit':
          this.currentStatus = 'sit';
          clearInterval(this.currentInterval)
          break;
        case 'explore':
          this.currentStatus = 'explore';
          clearInterval(this.currentInterval)
          this.startExploreActivity()
          break;
        case 'train':
          this.currentStatus = 'train';
           clearInterval(this.currentInterval)
          this.startTrainingActivity();
          break;
        case 'hunt':
          this.currentStatus = 'hunt';
          clearInterval(this.currentInterval)
          this.startHuntingActivity();
          break;
        case 'sleep':
          clearInterval(this.currentInterval)
          this.startSleepActivity();
          break;

      }

    },

    resetEnergy() {
      this.currentEnergy = 100
    },

    savePlayerData() {

      a('currentEnergy', this.currentEnergy)
      a('currentStatus', this.currentStatus)
      a('food', this.food)
      a('trainPoints', this.trainPoints)


    }

  }, //methods

  computed: {

  },//computed

  mounted() {
    setInterval(this.decreaseEnergy, 1000)
    setInterval(this.savePlayerData, 3000)
  }//mounted






})
