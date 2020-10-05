/*

//todo if zombie is not killed, save HP
 */

var globalThat = this
var mstore = window.localStorage

function ll(logMsg) {
  console.log(logMsg)
}

function ld(logMsg) {
  console.error(logMsg)
}
function lw(logMsg) {
  console.warn(logMsg)
}

function randNumBetw(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//todo mouse down intervals not clearing.
var activityModifiers = {
  healing:{
    sleeping:2,
  },
  sitting: {
    energy:0.05,
    hp:1,
  },
  sleeping: {
    energy:0.5,
    hp:1,
  },
  exploring: {
    energy:1,
    hp:1,
  },
  training: {
    energy:0.2,
    hp:1,
  },
  hunting: {
    energy:0.3,
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
    bossHp: 500,
    loot: 10,
    url:'https://i.imgur.com/QtpjvKh.png',
    food:10,
    exp:50,
  },
  {
    name: 'Undead Demon 2',
    bossHp: 700,
    loot: 10,
    url:'https://i.imgur.com/QtpjvKh.png',
    food:15,
    exp:70,
  },
  {
    name: 'Undead Demon 3',
    bossHp: 1000,
    loot: 10,
    url:'https://i.imgur.com/QtpjvKh.png',
    food:30,
    exp:90,
  },
  {
    name: 'Archangel Halipus',
    bossHp: 300,
    loot: 4,
    url:'https://i.imgur.com/1CS1R8D.png',
    food:8,
    exp:40,
  },
  {
    name: 'Burharmad',
    bossHp: 2000,
    loot: 30,
    url:'https://i.imgur.com/PCUAcal.png',
    food:30,
    exp:80,
  },
  {
    name: 'Burharmad 2',
    bossHp: 4000,
    loot: 50,
    url:'https://i.imgur.com/PCUAcal.png',
    food:60,
    exp:120,
  },
  {
    name: 'Burharmad 3',
    bossHp: 6000,
    loot: 100,
    url:'https://i.imgur.com/PCUAcal.png',
    food:100,
    exp:120,
  },
]
//todo energy resets whe refreshing..
//todo sleeping activity does not reset when going from sleep to hunt

var settings = {
  //admin

  activityIntervals: 1000,

  //activities
  trainingPointsPerTick:5,

  //hunting
  expPointsWhileHunting:5,
  maxZombiesKilledWhileHunting: 3,

  //exploring
  maxFoodFoundWhileExploring: 3,

  //player
  plCurrLocation: 'home',
  maxHp: 100,
  lowEnergy:0.01,
  energyIncreaseWhileSleeping: function () {return createRand(3)},

  energyIncreasePerFood: [15,35], //min - max
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


//todo clearing intevals not working..

var currentMonster = ''

var app = new Vue({
  el: '#app',
  data: {

    //player
    plHp: (get('plHp')) ? parseInt(get('plHp')) :100,
    plEn: (get('plEn')) ? parseInt(get('plEn')) :100,
    plCurrActivity: (get('plCurrActivity')) ? get('plCurrActivity') :'sleep',
    plExp: (get('plExp')) ? parseInt(get('plExp')) : 0,
    plTrain: (get('plTrain')) ? parseInt(get('plTrain')) : 0,
    plFood:(get('plFood')) ? parseInt(get('plFood')) :10,
    isHealing:false,

    //statistics
    plZombiesKilled: (get('plZombiesKilled')) ? parseInt(get('plZombiesKilled')) : 0,
    plBossesKilledCount: (get('plBossesKilledCount')) ? parseInt(get('plBossesKilledCount')) : 0,




    //boss

    bossMenuActive: false,
    currentFightingBoss: '',
    mouseDownIntervals:[],
    bossStatusMsg:'',
    bossHp: NaN,
    bossImageUrl:'',
    bossIsNowDead:false,



    //script
    healingIntervals: [],
    activityIntervals: [],
    plTimeAway: 'asdas',
    showTimeAway:true,


    //logging
    currentTime: '',

  },

  methods: {

    eatFood() {
      this.plFood -= 1
      var min = globalThat.settings.energyIncreasePerFood[0]
      var max = globalThat.settings.energyIncreasePerFood[1]
      this.increaseEnergy(randNumBetw(min, max))
    },

    increaseEnergy(energyPoints) {
      var energyLeftToFull = parseFloat(100) - parseFloat(this.plEn)
      if(parseFloat(energyPoints) > energyLeftToFull.toFixed(2)) {
        this.plEn = 100
      } else {
        this.plEn = parseFloat(this.plEn) + energyPoints
      }
    },

    decreaseEnergy(energyPoints) {
       var decimaled = parseFloat(this.plEn).toFixed(6)
      if(energyPoints > decimaled) {
        this.plEn = 0
        return
      }
      decimaled -= energyPoints.toFixed(6)
      this.plEn = decimaled.toFixed(2)
    },

    healHp(healingActivity) {
      /*
      healing activities per tick in activityModifiers
       */
      switch (healingActivity) {

        case 'sleep':
          var pointsToHeal = globalThat.activityModifiers.healing.sleeping
          this.plHp += pointsToHeal
      }
    },

    sit() {
      if(this.plEn > 0) {
        ll('Sitting..')
        this.decreaseEnergy(parseFloat(globalThat.activityModifiers.sitting.energy))
      } else {
        this.plCurrActivity = 'sleep'
        this.startActivity()
      }

    },
    //todo sleep interval does not clear



    sleep() {

      if(this.plEn < 100) {
        this.increaseEnergy(globalThat.activityModifiers.sleeping.energy)

      } else {
        this.plCurrActivity = 'sit'
        this.startActivity()
      }

    },

    explore() {
      ll('Im exploring now')
      if(this.plEn > globalThat.settings.lowEnergy) {
        this.decreaseEnergy(globalThat.activityModifiers.exploring.energy)
        var rand = randNumBetw(0,150)
        if(rand>=145) {
          this.plFood += 1
        }
      } else {
        ll('I dont have any energy left... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }

    },

    train() {
      ll('training now...')
      if(this.plEn > globalThat.settings.lowEnergy) {
        this.decreaseEnergy(globalThat.activityModifiers.training.energy)
        this.plTrain += createRand(globalThat.settings.trainingPointsPerTick)

      } else {
        ll('I dont have any energy left to train... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },

    hunt() {
      ll('Happy hunting')
      if(this.plEn > 10) {
        this.plHp -= randNumBetw(1,4)
        this.decreaseEnergy(globalThat.activityModifiers.hunting.energy)
        this.plZombiesKilled += createRand(globalThat.settings.maxZombiesKilledWhileHunting)
        this.plExp += globalThat.settings.expPointsWhileHunting

      } else {
        ll('I dont have any energy left to hunt... i have to sit')

        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },


  healingActivity() {

      var healingInterval = setInterval(this.healHp, globalThat.settings.activityIntervals)
      this.healingIntervals.push(healingInterval)

    },

  sittingActivity() {
      this.bossMenuActive = false
      var sittingInterval = setInterval(this.sit, globalThat.settings.activityIntervals)
      this.activityIntervals.push(sittingInterval)
    },

  sleepingActivity() {
    this.bossMenuActive = false
    var sleepingInterval = setInterval(this.sleep, globalThat.settings.activityIntervals)
    this.activityIntervals.push(sleepingInterval)
  },

  exploringActivity() {
      this.bossMenuActive = false
      var exploringInterval = setInterval(this.explore, globalThat.settings.activityIntervals)
      this.activityIntervals.push(exploringInterval)
    },

  trainingActivity() {
      this.bossMenuActive = false
      var trainingInterval = setInterval(this.train, globalThat.settings.activityIntervals)
      this.activityIntervals.push(trainingInterval)
    },

  huntingActivity() {

      var huntingInterval = setInterval(this.hunt, globalThat.settings.activityIntervals)
      this.activityIntervals.push(huntingInterval)
    },

  clearActivityIntervals() {
    if (this.activityIntervals) {
      for (var inter of this.activityIntervals) {
        clearInterval(inter)
        this.activityIntervals = []
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

        this.plCurrActivity = 'fight'
        break;
    }

  },

  writeLog() {
    var n = new Date()
    var seconds = n.getSeconds()
    var minutes = n.getMinutes()
    var hours = n.getHours()

    this.currentTime = hours + ':' + minutes+ ':'+ seconds +'| '+ this.plCurrActivity +' ' + this.plEn
    var ullist = this.$refs['ullist']
    var lii = document.createElement('li')
    lii.appendChild(document.createTextNode(this.currentTime))
    ullist.prepend(lii)




  },


  //after user returns
  //todo distribute ticks
  howManyTimes() {

    var secondsSinceLastLogin = Math.floor(this.plTimeAwayMilli / 1000)
    lw('seconds since last: ' + secondsSinceLastLogin)
    this.plTimeAway = secondsSinceLastLogin
    var updateInterval = globalThat.settings.activityIntervals
    var ticksWhileAway = parseFloat(secondsSinceLastLogin / (updateInterval/1000))



  switch (this.plCurrActivity) {

  case "sit":
      ld('Sit ticks while away: '+ticksWhileAway)
      var enLost = this.convertEnergyDecreaseWhileAwayToPoints('sit', ticksWhileAway)
      var lastEnergySaved = globalThat.get('plEn')
      var plNewEnergy = lastEnergySaved - enLost
      ld('New Energy after sitting should be: ' + plNewEnergy)

      //start sleep
      if(plNewEnergy<0) {
        var sleepTicksLeft = this.convertFromPointsToTicks('sit', ticksWhileAway)
        ld('ticks to use on sleep: '+sleepPoints)
      }


      this.plEn = plNewEnergy
      this.plCurrActivity = 'sit'
    break;

    case 'sleep':



    case "explore":

      ld('Explore ticks while away: '+ticksWhileAway)

        var enLost = this.convertEnergyDecreaseWhileAwayToPoints('explore', ticksWhileAway)

        ld('Energy lost while exploring: ' + enLost)

        var lastEnergySaved = globalThat.get('plEn')

        ld('Last energy save: ' + lastEnergySaved)

        var plNewEnergy = lastEnergySaved - enLost

        ld('New Energy should be: ' + plNewEnergy)


      if(plNewEnergy>0) {

        this.plEn = plNewEnergy.toFixed(2)

      } else {

          var sleepTicksLeft = this.convertFromPointsToTicks('explore', Math.abs(plNewEnergy))
          ld('ticks left after exploring to use on sleep: '+sleepTicksLeft)
          ld('converting to sleep..')
          var sleepEnergy = this.convertEnergyIncreaseWhileAwayToPoints('sleep', sleepTicksLeft)
          ld('These ticks converted to energy by sleep: ' + sleepEnergy)
          this.plEn = sleepEnergy.toFixed(2)

          if(sleepEnergy <101) {
            this.plCurrActivity = 'sleep'
          } else {
            this.plCurrActivity = 'sit'
          }

          //Vue.set('plEn', sleepEnergy.toFixed(2))


      }





    break;

  case "train":
    ld('Train ticks while away: '+ticksWhileAway)

    var enLost = this.convertEnergyDecreaseWhileAwayToPoints('train', ticksWhileAway)

    ld(' lost while exploring: ' + enLost)

    var lastEnergySaved = globalThat.get('plEn')

    ld('Last energy save: ' + lastEnergySaved)

    var plNewEnergy = lastEnergySaved - enLost

    ld('New Energy should be: ' + plNewEnergy)

    this.plEn = plNewEnergy
    this.plCurrActivity = 'train'
    break;

  case "hunt":
    ld('Hunt ticks while away: '+ticksWhileAway)

    var enLost = this.convertEnergyDecreaseWhileAwayToPoints('hunt', ticksWhileAway)

    ld('Energy lost while hunting: ' + enLost)

    var lastEnergySaved = globalThat.get('plEn')

    ld('Last energy save: ' + lastEnergySaved)

    var plNewEnergy = lastEnergySaved - enLost

    ld('New Energy should be: ' + plNewEnergy)

    this.plEn = plNewEnergy
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

  runActivitiesSinceLastTime() {
      var lastSaveTime = (parseInt(get('lastActivity')) == null) ? Date.now() : (parseInt(get('lastActivity')))

      var timeStampNow = parseInt(Date.now())
      this.plTimeAwayMilli = timeStampNow - lastSaveTime  //how many millis since last save


      this.howManyTimes()
      this.startActivity()
      var that = this
        setTimeout(function () {
          that.showTimeAway = false
        },20000)
  },

  convertEnergyDecreaseWhileAwayToPoints(activity, ticksWhileAway) {
  switch (activity) {
    case 'sit':
      var sittingEnergyPerTick = parseFloat(globalThat.activityModifiers.sitting.energy.toFixed(2))
      return sittingEnergyPerTick * ticksWhileAway

    case 'explore':
      var exploringEnergyPerTick = parseFloat(globalThat.activityModifiers.exploring.energy.toFixed(2))
      return exploringEnergyPerTick * ticksWhileAway

    case 'train':
      var trainingEnergyPerTick = parseFloat(globalThat.activityModifiers.training.energy.toFixed(2))
      return trainingEnergyPerTick * ticksWhileAway

    case 'hunt':
      var huntingEnergyPerTick = parseFloat(globalThat.activityModifiers.hunting.energy.toFixed(2))
      return huntingEnergyPerTick * ticksWhileAway








  } //switch
}, //convert

  convertEnergyIncreaseWhileAwayToPoints(activity, ticksWhileAway) {
  switch (activity) {
    case 'sleep':
      var sleepingEnergyPerTick = parseFloat(globalThat.activityModifiers.sleeping.energy.toFixed(2))
      return sleepingEnergyPerTick * ticksWhileAway










  } //switch
}, //convert

  convertFromPointsToTicks(activity, points) {
  switch (activity) {
    case 'sit':
      var sitTicks = parseFloat(globalThat.activityModifiers.sitting.energy.toFixed(2))
      return points / sitTicks

    case 'explore':
      var exploreTicks = parseFloat(globalThat.activityModifiers.exploring.energy.toFixed(2))
      return points / exploreTicks

    case 'train':
      var trainingTicks = parseFloat(globalThat.activityModifiers.training.energy.toFixed(2))
      return points / trainingTicks

    case 'hunt':
      var huntTicks = parseFloat(globalThat.activityModifiers.hunting.energy.toFixed(2))
      return points * huntTicks








  } //switch
}, //convert


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

  //boss
    //cancel killing activity
  buttonUp() {
    clearInterval(this.mouseDownIntervals[0])
    //this.mouseDownIntervals = []

  },
     //start killing activity
  buttonDown() {
    this.clearActivityIntervals()
    this.plCurrActivity = 'hunt'
    this.startActivity()
    for(var inter of this.mouseDownIntervals) {
      clearInterval(inter)
    }

    this.mouseDownIntervals = []
    var killingInterval = setInterval(this.killBoss,500)
    this.mouseDownIntervals.push(killingInterval)
  },

  searchAgain() {
      this.clearActivityIntervals()
    this.plCurrActivity = 'hunt'
    this.startActivity()
    this.bossHp = NaN
    this.bossImageUrl = 'https://i.imgur.com/ZXbQorx.png'
    this.$refs["searchBoss"].removeAttribute('value')
    this.createBoss()

    },
  //todo Uncaught TypeError: Cannot read property 'setAttribute' of undefined
    //     at main.js:702 when not enough energy
  killBoss() {
    var that = this
    var aHit = createRand(200)

    if(aHit >  this.bossHp) {
      this.bossHp = 0
      this.buttonUp()
      this.bossIsNowDead = true
      this.plBossesKilledCount += 1
      this.plExp += parseInt(globalThat.currentMonster.exp)
      this.plFood += parseInt(globalThat.currentMonster.food)

      setTimeout(function () {
        ll('Searching again...')
        that.searchAgain()
      },200)


    } else {
      this.bossHp -= aHit
    }
  },

  createBoss() {
      var that = this
      this.bossStatusMsg = 'Searching for boss monster...'
      setTimeout(function () {
          var randBoss = globalThat.bosses[createRand(6)]
          globalThat.currentMonster = randBoss
          this.currentFightingBoss = globalThat.currentMonster

          that.bossStatusMsg = 'Boss found: ' + randBoss.name
          that.bossHp = randBoss.bossHp
          that.bossImageUrl = randBoss.url
          that.$refs["searchBoss"].setAttribute('value', that.bossHp)
          that.$refs["searchBoss"].setAttribute('max', that.bossHp)
          that.bossIsNowDead = false
      }, randNumBetw(3000,15000))
  },

  bossFighting() {

    this.bossMenuActive = (!this.bossMenuActive);
    if(this.bossMenuActive) {
      this.plCurrActivity = 'hunt'
    }
    this.createBoss()
    },





  saveData() {
  this.writeLog()
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
      ll('reseting...')
    this.plEn = 100;
  },


    a_resetPlHp() {
      this.plHp = 100;
    },
  a_resetFood() {
    this.plFood = 20
  },

  a_energyMinus10() {
    this.decreaseEnergy(10)
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
    setInterval(this.saveData, 1000)
    this.runActivitiesSinceLastTime()




  }//mounted






})
