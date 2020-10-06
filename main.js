/*

//todo if zombie is not killed, save HP
 */

var globalThat = this
var mstore = window.localStorage

//todo mouse down intervals not clearing.
var activityModifiers = {
  healing:{
    sleeping:2,
  },
  sitting: {
    energy:1,
    hp:1,
  },
  sleeping: {
    energy:1,
    hp:1,
  },
  exploring: {
    energy:1,
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
//zset
var settings = {
  //admin

  activityIntervals: 1000,

  //activities
  trainingPointsPerTick:1,

  //hunting
  expPointsWhileHunting:1,
  maxZombiesKilledWhileHunting: 1,

  //exploring
  maxFoodFoundWhileExploring: 1,

  //player
  plCurrLocation: 'home',
  maxHp: 100,
  lowEnergy:1,
  energyIncreaseWhileSleeping: function () {return createRand(3)},

  energyIncreasePerFood:2, //min - max
}




//wrappers
function ll(logMsg) {
  console.log(logMsg)
}
function ld(logMsg) {
  console.error(logMsg)
}
function lw(logMsg) {
  console.warn(logMsg)
}
function set(where, what) {
  mstore.setItem(where, what)
}
function get(what) {
  return mstore.getItem(what)
}



function randNumBetw(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function createRand(max) {
      return Math.floor(Math.random() * Math.floor(max))
    }








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
    notEnoughFood: false,

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
    lootMsg: '',



    //script
    healingIntervals: [],
    activityIntervals: [],
    plTimeAway: 'asdas',
    showTimeAway:true,


    //logging
    currentTime: '',

  },

  methods: {

    monsterHit() {
      ld('Monster was hit!')

      var that = this
      var aHit = createRand(1000)

      if(aHit >  this.bossHp) {

        this.bossHp = 0
        this.bossIsNowDead = true
        this.plBossesKilledCount += 1
        this.loot()
      } else {
        this.bossHp -= aHit
      }
    },


    eatFood() {

      this.plFood -= 1
      this.increaseEnergy(globalThat.settings.energyIncreasePerFood)

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
        //todo return?!
       return
      }
      decimaled -= energyPoints.toFixed(6)
      this.plEn = decimaled.toFixed(2)
    },



    sit() {
      if(this.plEn > 0) {
        ll('Sitting..')
        this.decreaseEnergy(parseFloat(globalThat.activityModifiers.sitting.energy))
      } else {
        this.startSleepingActivity()
      }

    },

    sleep() {
      if(this.plEn < 101) {
        this.increaseEnergy(globalThat.activityModifiers.sleeping.energy)
        ld('Im sleeping now')
      } else {
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },

    explore() {

      ll('Im exploring now')
      if(this.plEn > 0 ) {
        this.decreaseEnergy(globalThat.activityModifiers.exploring.energy)
        //todo items found while exploring
        this.plFood += 1
        //todo food check
        if(this.plFood<1 ) {
          this.notEnoughFood = true
        }
      } else {
        ll('No energy, i have to sleep')
        this.plCurrActivity = 'sleep'
        this.startActivity()
      }

    },

    train() {
      ll('training now...')
      if(this.plEn > 0) {
        this.decreaseEnergy(globalThat.activityModifiers.training.energy)
        this.plTrain += 1

      } else {
        ll('I dont have any energy left to train... i have to sit')
        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },

    hunt() {
      ll('Happy hunting')
      if(this.plEn > 0) {
        this.plHp -= 1
        this.decreaseEnergy(globalThat.activityModifiers.hunting.energy)
        this.plZombiesKilled += 1
        this.plExp += 1

      } else {
        ll('I dont have any energy left to hunt... i have to sit')

        this.plCurrActivity = 'sit'
        this.startActivity()
      }
    },

    fight() {
      ll('Fighting a boss')
      //todo minimum energy to fight a boss
      if(this.plEn > 29) {
        this.plHp -= 1
        //todo boss fighting energy decrease
        this.decreaseEnergy(globalThat.activityModifiers.fighting.energy)

        //todo experience while boss fighjting
        this.plExp += 1

      } else {
        ll('No energy to fight a boss.  i have to sit')
        this.startSittingActivity()
        this.bossIsNowDead = true
      }
    },


    healingActivity() {

      var healingInterval = setInterval(this.healHp, globalThat.settings.activityIntervals)
      this.healingIntervals.push(healingInterval)

    },


    /*      ------------------------- INTERVALS ----------------------------------- */

    sittingActivityInterval() {

        var sittingInterval = setInterval(this.sit, globalThat.settings.activityIntervals)
        this.activityIntervals.push(sittingInterval)
      },

    sleepingActivityInterval() {

      var sleepingInterval = setInterval(this.sleep, globalThat.settings.activityIntervals)
      this.activityIntervals.push(sleepingInterval)
    },

    exploringActivityInterval() {

        var exploringInterval = setInterval(this.explore, globalThat.settings.activityIntervals)
        this.activityIntervals.push(exploringInterval)
      },

    trainingActivityInterval() {

        var trainingInterval = setInterval(this.train, globalThat.settings.activityIntervals)
        this.activityIntervals.push(trainingInterval)
      },

    huntingActivityInterval() {

        var huntingInterval = setInterval(this.hunt, globalThat.settings.activityIntervals)
        this.activityIntervals.push(huntingInterval)
      },

    bossFightingInterval() {

        var bossFightingInterval = setInterval(this.fight, globalThat.settings.activityIntervals)
        this.activityIntervals.push(bossFightingInterval)
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
          this.sittingActivityInterval()
          this.plCurrActivity = 'sit'
          break;
        case 'sleep':
          this.clearActivityIntervals()
          this.sleepingActivityInterval();
          this.plCurrActivity = 'sleep'
          break;
        case 'explore':
          this.clearActivityIntervals()
          this.exploringActivityInterval()
          this.plCurrActivity = 'explore'
          break;
        case 'train':!
          this.clearActivityIntervals()
          this.trainingActivityInterval()
          this.plCurrActivity = 'train'
          break;
        case 'hunt':
          this.clearActivityIntervals()
          this.huntingActivityInterval()
          this.plCurrActivity = 'hunt'
          break;
        case 'fight':
          this.bossFighting()
          break;

        case 'eat':
          if(this.plFood>0) {
            this.notEnoughFood = false
            this.eatFood()
          } else {
            this.notEnoughFood = true
          }

          break;

      }

    },

    startSleepingActivity() {
        this.clearActivityIntervals()
        this.plCurrActivity = 'sleep'
        this.startActivity()
    },

    startSittingActivity() {
        this.clearActivityIntervals()
        this.plCurrActivity = 'sit'
        this.startActivity()
    },

    startExploringActivity() {
        this.clearActivityIntervals()
        this.plCurrActivity = 'explore'
        this.startActivity()
    },

    startTrainingActivity() {
        this.clearActivityIntervals()
        this.plCurrActivity = 'train'
        this.startActivity()
    },

    startHuntingActivity() {
        this.clearActivityIntervals()
        this.plCurrActivity = 'hunt'
        this.startActivity()
    },

    startBossFightingActivity() {
      if(this.plCurrActivity !== 'fight') {
        this.plCurrActivity ='fight'
        this.clearActivityIntervals()
        this.startActivity()
      }
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

            //todo randomize foods after away ticks
          if(plNewEnergy>0) {
            ld('food before ticks: ' + this.plFood )
            this.plEn = plNewEnergy.toFixed(2)
            this.plFood += (ticksWhileAway * globalThat.settings.maxFoodFoundWhileExploring)*0.5
            ld('food After ticks: ' + this.plFood )
            this.plCurrActivity = 'explore'
            this.startActivity()


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
          } //else





        break;

        case "train":
          ld('Train ticks while away: '+ticksWhileAway)

          var enLost = this.convertEnergyDecreaseWhileAwayToPoints('train', ticksWhileAway)

          ld(' lost while exploring: ' + enLost)

          var lastEnergySaved = globalThat.get('plEn')

          ld('Last energy save: ' + lastEnergySaved)

          var plNewEnergy = lastEnergySaved - enLost

          ld('New Energy should be: ' + plNewEnergy)


          if(plNewEnergy>0) {
            ld('energy before ticks: ' + this.plEn )
            this.plEn = plNewEnergy.toFixed(2)
            ld('energy after ticks: ' + this.plEn )
            ld('-------------------')
            ld('train before ticks: ' + this.plTrain )
            this.plTrain += (ticksWhileAway * globalThat.settings.trainingPointsPerTick)*0.5
            ld('train After ticks: ' + this.plTrain )
            this.plCurrActivity = 'train'
            this.startActivity()

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
                this.startActivity()
              }

              //Vue.set('plEn', sleepEnergy.toFixed(2))
          } //else
          break;

        case "hunt":
          ld('Hunt ticks while away: '+ticksWhileAway)

          var enLost = this.convertEnergyDecreaseWhileAwayToPoints('hunt', ticksWhileAway)

          ld('Energy lost while hunting: ' + enLost)

          var lastEnergySaved = globalThat.get('plEn')

          ld('Last energy save: ' + lastEnergySaved)

          var plNewEnergy = lastEnergySaved - enLost

          ld('New Energy should be: ' + plNewEnergy)
          //todo points while hunting while away
         if(plNewEnergy>0) {
            ld('energy before ticks: ' + this.plEn )
            this.plEn = plNewEnergy.toFixed(2)
            ld('energy after ticks: ' + this.plEn )
            ld('-------------------')
            ld('exp before ticks: ' + this.plExp )
            this.plExp += (ticksWhileAway * globalThat.settings.expPointsWhileHunting)*0.5
            ld('exp After ticks: ' + this.plExp )
            this.plCurrActivity = 'hunt'
            this.startActivity()

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
                this.startActivity()
              }


          } //else
          break;

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



    switch (this.plCurrActivity) {

      case "sit":
        this.sittingActivityInterval()
        ll('Sitting activity Started')
        break;

      case "sleep":
        this.sleepingActivityInterval()
        ll('sleep activity Started')
        break;

      case "explore":
        this.exploringActivityInterval()
        ll('exploring activity Started')
        break;

      case "train":
        this.trainingActivityInterval()
        ll('training activity Started')
        break;

      case "hunt":
        this.huntingActivityInterval()
        ll('hunting activity Started')
        break;

      case "fight":
        this.bossFightingInterval()
        ll('fighting activity Started')
        break;

    } //swith
    },



    //boss
      //cancel killing activity
    buttonUp() {
      clearInterval(this.mouseDownIntervals[0])
      this.startSittingActivity()
    },


       //start killing activity
    buttonDown() {
      this.startBossFightingActivity()

      //clear any mouse intervals
      for(var inter of this.mouseDownIntervals) {
        clearInterval(inter)
      }

      this.mouseDownIntervals = []
      var killingInterval = setInterval(this.killBoss,500)
      this.mouseDownIntervals.push(killingInterval)
    },

    searchAgain() {
      if(this.plEn > 29) {
        this.startBossFightingActivity()
        this.bossHp = NaN
        this.bossImageUrl = 'https://i.imgur.com/ZXbQorx.png'
        this.$refs["searchBoss"].removeAttribute('value')
        this.lootMsg = ''
        this.createBoss()
      } else {
        this.bossIsNowDead = true
         this.bossStatusMsg = 'Not enough energy...'
      }


      },
    //todo Uncaught TypeError: Cannot read property 'setAttribute' of undefined
      //     at main.js:702 when not enough energy

    loot() {
      var exp =  parseInt(globalThat.currentMonster.exp)
      var food =  parseInt(globalThat.currentMonster.food)
      this.lootMsg = 'Exp: ' + exp + '  Food: ' + food
      this.plFood += food
      this.plExp += exp
    },

    killBoss() {
      var that = this
      var aHit = createRand(1000)

      if(aHit >  this.bossHp) {
        this.buttonUp()
        this.bossHp = 0
        this.bossIsNowDead = true
        this.plBossesKilledCount += 1

        this.loot()

      } else {
        this.bossHp -= aHit
      }
    },

    createBoss() {
        //todo extract minimum energy to ffight a boss
        if(this.plEn > 29) {
          var that = this
          this.bossStatusMsg = 'Searching for boss monster...'
          this.startBossFightingActivity()
          setTimeout(function () {
              var self = this
              var randBoss = globalThat.bosses[createRand(6)]
              globalThat.currentMonster = randBoss
            //why do i assign rand boss to globalthat?
              this.currentFightingBoss = globalThat.currentMonster

              that.bossStatusMsg = 'Boss found: ' + randBoss.name
              that.bossHp = randBoss.bossHp
              that.bossImageUrl = randBoss.url
              that.$refs["searchBoss"].setAttribute('value', that.bossHp)
              that.$refs["searchBoss"].setAttribute('max', that.bossHp)
              that.bossIsNowDead = false

              that.startSittingActivity()

          }, randNumBetw(1000,3000))
        } else {
          //todo extract errors messages
          this.bossStatusMsg = 'Not enough energy'
          this.bossIsNowDead = true
          this.startSittingActivity()
        }


    },

    bossFighting() {

      this.bossMenuActive = (!this.bossMenuActive);

      this.createBoss()
      },





      //sys

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

    a_energyMinus2() {
      this.decreaseEnergy(2)
    },

    a_energyPlus10() {
      this.plEn += 10
    },
    a_energyPlus2() {
      this.plEn += 2
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
