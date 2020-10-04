/*

//todo if zombie is not killed, save HP
 */

var globalThat = this
var mstore = window.localStorage

function ll(logMsg) {
  console.log(logMsg)
}

function randNumBetw(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var activityModifiers = {
  sitting: {
    energy:0.2,
    hp:1,
  },
  sleeping: {
    energy:1,
    hp:1,
  },
  exploring: {
    energy:0.5,
    hp:1,
  },
  training: {
    energy:1,
    hp:1,
  },
  hunting: {
    energy:1,
    hp:1,
  },
  fighting: {
    energy:1,
    hp:1,
  },
}

var bosses = [
  {
    name: 'Undead Demon',
    bossHp: 2000,
    loot: 10,
    url:'https://i.imgur.com/QtpjvKh.png'
  },
  {
    name: 'Archangel Halipus',
    bossHp: 800,
    loot: 4,
    url:'https://i.imgur.com/1CS1R8D.png'
  },
  {
    name: 'Burharmad',
    bossHp: 8000,
    loot: 30,
    url:'https://i.imgur.com/PCUAcal.png'
  },
]


var settings = {
  //admin
  increaseEnergyBy: 10000,
  activityIntervals: 1000,
  //player
  plCurrLocation: 'home',
  maxHp: 100,
  energyIncreaseWhileSleeping: function () {return createRand(3)},
  energyIncreasePerFood : 5,
}

function createRand(max) {
      return Math.floor(Math.random() * Math.floor(max))
    }

function set(where, what) {
  mstore.setItem(where, what)
}

function get(what) {
  return mstore.getItem(what)
}






var app = new Vue({
  el: '#app',
  data: {
    plZombiesKilled: (get('plZombiesKilled')) ? parseInt(get('plZombiesKilled')) : 0,
    activityIntervals: [],
    plCurrActivity: (get('plCurrActivity')) ? get('plCurrActivity') :'sleep',
    plHp: (get('plHp')) ? parseInt(get('plHp')) :100,
    plEn: (get('plEn')) ? parseInt(get('plEn')) :100,
    plExp: (get('plExp')) ? parseInt(get('plExp')) : 0,
    plTrain: (get('plTrain')) ? parseInt(get('plTrain')) : 0,
    plFood:(get('plFood')) ? parseInt(get('plFood')) :10,
    plTimeAway: '',
    showTimeAway:true,


    bossMenuActive: false,
    mouseDownIntervals:[],
    plBossesKilledCount: (get('plBossesKilledCount')) ? parseInt(get('plBossesKilledCount')) : 0,

    bossStatusMsg:'',
    bossHp: NaN,
    bossImageUrl:'',
    bossIsNowDead:false,

  },

  methods: {



    eatFood() {
      this.plFood -= 1
      this.increaseEnergy(globalThat.settings.energyIncreasePerFood)
    },

    increaseEnergy(energyPoints) {
      var plEnergy = parseInt(this.plEn)
      plEnergy += energyPoints
      this.plEn =plEnergy
    },

    decreaseEnergy(energyPoints) {
      var plEnergy = parseFloat(this.plEn)
      plEnergy -= energyPoints
      this.plEn = plEnergy.toFixed(2)
    },



    sit() {
      if(this.plEn > 0) {
        ll('Sitting..')
        this.decreaseEnergy(parseFloat(globalThat.activityModifiers.sitting.energy))
      } else {
        ll('I have no energy... I have to sleep')
        this.plCurrActivity = 'sleep'
        this.startActivity()
      }

    },

    sleep() {
      if(this.plEn < 101) {
        this.increaseEnergy(globalThat.activityModifiers.sleeping.energy)
      } else {
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
      ll('Im now sleeping')

    },

    explore() {

      if(this.plEn > 0) {
        ll('Im now exploring')
        this.decreaseEnergy(globalThat.activityModifiers.exploring.energy)
        this.plFood += createRand(3)
      } else {
        ll('I dont have any energy left... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }





    },

    train() {
      if(this.plEn > 10) {
        ll('Im now training')
        this.decreaseEnergy(globalThat.activityModifiers.training.energy)
        this.plTrain += createRand(5)
      } else {
        ll('I dont have any energy left to train... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },

    hunt() {
           if(this.plEn > 10) {
        ll('Im now hunting')
        this.decreaseEnergy(globalThat.activityModifiers.hunting.energy)
        this.plZombiesKilled += createRand(2)
        this.plExp += createRand(5)
      } else {
        ll('I dont have any energy left to hunt... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },







  sittingActivity() {
      ll('Begin sitting..')
      var sittingInterval = setInterval(this.sit, globalThat.settings.activityIntervals)
      this.activityIntervals.push(sittingInterval)
    },

  sleepingActivity() {
    ll('Begin sleeping..')
    var sleepingInterval = setInterval(this.sleep, globalThat.settings.activityIntervals)
    this.activityIntervals.push(sleepingInterval)
  },

  exploringActivity() {
      ll('Begin Exploring..')
      var exploringInterval = setInterval(this.explore, globalThat.settings.activityIntervals)
      this.activityIntervals.push(exploringInterval)
    },

  trainingActivity() {
      ll('Begin training..')
      var trainingInterval = setInterval(this.train, globalThat.settings.activityIntervals)
      this.activityIntervals.push(trainingInterval)
    },

  huntingActivity() {
      ll('Begin hunting..')
      var huntingInterval = setInterval(this.hunt, globalThat.settings.activityIntervals)
      this.activityIntervals.push(huntingInterval)
    },

  clearActivityIntervals() {
    if (this.activityIntervals) {
      for (var inter of this.activityIntervals) {
        clearInterval(inter)
        ll('Interval cleared')
      }
    }


  },

  setActivity(activity) {
    switch (activity) {
      case 'sit':
        this.clearActivityIntervals()
        this.sittingActivity()
        this.plCurrActivity = 'sit'
        break;
      case 'sleep':
        this.clearActivityIntervals()
        this.sleepingActivity();
        this.plCurrActivity = 'sleep'
        break;
      case 'explore':
        this.clearActivityIntervals()
        this.exploringActivity()
        this.plCurrActivity = 'explore'
        break;
      case 'train':
        this.clearActivityIntervals()
        this.trainingActivity()
        this.plCurrActivity = 'train'
        break;
      case 'hunt':
        this.clearActivityIntervals()
        this.huntingActivity()
        this.plCurrActivity = 'hunt'
        break;
      case 'fight':
        this.clearActivityIntervals()
        this.fightingActivity()
        this.plCurrActivity = 'fight'
        break;
    }

  },

    searchAgain() {
    this.bossHp = NaN
      this.bossImageUrl = 'https://i.imgur.com/JcImZPt.gif'
    this.$refs["searchBoss"].removeAttribute('value')
    this.createBoss()

    },

  killBoss() {
    this.bossHp -= createRand(200)
    var that = this
    if(this.bossHp<0) {
      this.bossIsNowDead = true
      this.plBossesKilledCount += 1
      this.plExp += 100
      this.plFood += 500
      setTimeout(function () {
        that.searchAgain()
      },200)

    }

  },

  createBoss() {
      var that = this
      this.bossStatusMsg = 'Searching for boss monster...'

      setTimeout(function () {
         var randBoss = globalThat.bosses[createRand(3)]
        that.bossStatusMsg = 'Boss found: ' + randBoss.name
        that.bossHp = randBoss.bossHp
        that.bossImageUrl = randBoss.url
         that.$refs["searchBoss"].setAttribute('value', that.bossHp)
         that.$refs["searchBoss"].setAttribute('max', that.bossHp)
        that.bossIsNowDead = false
      }, randNumBetw(500,5000))

      ll('Im here')
  },

  bossFighting() {
    this.bossMenuActive = (!this.bossMenuActive);
    this.createBoss()
    },



  howManyTimes() {
  var secondsSinceLastLogin = Math.floor(this.plTimeAwayMilli / 1000)

    if(secondsSinceLastLogin > 100) {
      secondsSinceLastLogin = 50
    }

  switch (this.plCurrActivity) {

  case "sit":
    ll('I was sitting this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.sit()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done sitting..')
      this.plCurrActivity = 'sit'
    break;

  case "sleep":
    ll('I was sleeping this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.sleep()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done sleeping..')
      this.plCurrActivity = 'sleep'
    break;

  case "explore":
    ll('I was exploring this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.explore()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done sleeping..')
      this.plCurrActivity = 'explore'
    break;

  case "train":
    ll('I was training this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.train()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done sleeping..')
      this.plCurrActivity = 'train'
    break;

  case "hunt":
    ll('I was hunting this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.hunt()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done hunting..')
      this.plCurrActivity = 'hunt'
    break;

  case "fight":
    ll('I was fight this many times: ' + secondsSinceLastLogin)
    while (secondsSinceLastLogin > 0) {
      this.fight()
      secondsSinceLastLogin -= 1
    }
    ll('Now im done fighting..')
      this.plCurrActivity = 'fight'
    break;
  s
  }



  },

  startActivity() {
  this.clearActivityIntervals()

  switch (this.plCurrActivity) {

    case "sit":
      this.sittingActivity()
      ll('Sitting activity Started')
      break;

    case "sleep":
      this.sleepingActivity()
      ll('sleep activity Started')
      break;

    case "explore":
      this.exploringActivity()
      ll('exploring activity Started')
      break;

    case "train":
      this.trainingActivity()
      ll('training activity Started')
      break;

    case "hunt":
      this.huntingActivity()
      ll('hunting activity Started')
      break;

    case "fight":
      this.fightingActivity()
      ll('fighting activity Started')
      break;

  } //swith
  },

  runActivitiesSinceLastTime() {
      var lastSaveTime = (parseInt(get('lastActivity')) == null) ? Date.now() : (parseInt(get('lastActivity')))


      var timeStampNow = parseInt(Date.now())
      this.plTimeAwayMilli = timeStampNow - lastSaveTime
      var energyBefore = this.plEn

      this.howManyTimes()
      var that = this
        setTimeout(function () {
          that.showTimeAway = false
        },20000)
  },




  saveData() {
  ll('Saving...')
  set('plHp', this.plHp)
  set('plEn', this.plEn)
  set('plCurrActivity', this.plCurrActivity)
  set('plFood', this.plFood)
  set('lastActivity', Date.now())
  set('plZombiesKilled', this.plZombiesKilled)
  set('plExp', this.plExp)
  set('plTrain', this.plTrain)
  set('plBossesKilledCount', this.plBossesKilledCount)
  },

  a_resetPlEnergy() {
    this.plEn = 100;
  },

  a_resetFood() {
    this.plFood = 20
  },

  a_energyMinus10() {
    this.plEn -= 10
  },

  a_energyPlus10() {
    this.plEn += 10
  },

  a_resetTrain() {
    this.plTrain = 0
  },

  a_resetExp() {
    set('plExp',0)
    this.plExp = 0
  },

  a_resetZombies() {
    set('plZombiesKilled',0)
    this.plZombiesKilled = 0
  },

}, //methods


  computed: {






  },


  mounted() {
    //setInterval(this.saveData, 2000)
    //this.runActivitiesSinceLastTime()
    this.startActivity()



  }//mounted






})
