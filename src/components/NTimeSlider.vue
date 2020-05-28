<template>
    <b-input-group>
      <b-input-group-prepend>
        <b-button
          v-if="!isPlaying"
          class="firstbtn"
          @click="playTime()"
          aria-pressed="true"
        >
          <font-awesome-icon class="fa-x" icon="play" style="color:'white'" />
        </b-button>
        <b-button
          v-if="isPlaying"
          class="firstbtn"
          @click="stopTime()"
          aria-pressed="true"
        >
          <font-awesome-icon class="fa-x" icon="pause" style="color:'white'" />
        </b-button>
      </b-input-group-prepend>
      <b-form-input
        type="range"
        class="slider"
        id="myRange"
        min="0"
        :max="maxValue"
        v-model="internalRange"
        aria-pressed="true"
      ></b-form-input>
      <b-input-group-append>
        <b-button @click="decrementTimeStamp()" class="firstbtn">
          <font-awesome-icon class="fa-x" icon="minus" style="color:'white'" />
        </b-button>
        <b-button @click="incrementTimeStamp()" class="firstbtn" aria-pressed="">
          <font-awesome-icon class="fa-x" icon="plus" style="color:'white'" />
        </b-button>
      </b-input-group-append>
    </b-input-group>
</template>

<script>
// TO THIS COMPONENT IS DELEGATE ALL THE TIME INTERACTION
export default {
  name: 'NTimeSlider',
  data () {
    return {
      // DEVELOPMENT
      verbose: true,

      // PROPERTIES
      isPlaying: false,
      intervalT: null,
      internalRange: 0
    }
  },
  props: {
    baseTimeStamp: {
      type: String
    },
    endTimeStamp: {
      type: String
    },
    timeStamp: {
      type: String
    },
    increment: {
      type: Number
    }
  },
  computed: {
    maxValue () {
      return Math.ceil(this.timeDifference(this.endTimeStamp, this.baseTimeStamp))
    },
    rangeValue () {
      return this.timeDifference(this.timeStamp, this.baseTimeStamp)
    }
  },
  methods: {
    // TIMER FUNCTION
    playTimeStamp () {
      if(this.verbose) console.log('TS QUI')
      // calcolo nuovo valore timestamp
      var diff = this.timeDifference(this.endTimeStamp, this.timeStamp)
      if (diff > 0 && this.isPlaying) {
        this.incrementTimeStamp()
      }  
      else {
        this.isPlaying = false
        clearInterval(this.intervalT)
      }
    },
    incrementTimeStamp () {
      if(this.verbose) console.log('TS QUI')
      var dt = new Date(this.timeStamp)
      dt.setSeconds(dt.getSeconds() + this.increment)
      var diff = this.timeDifference(this.endTimeStamp, dt)
      if (diff > 0){
        this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))  
      }
      else{
        dt = new Date(this.endTimeStamp)
        this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))  
      }
    },
    decrementTimeStamp () {
      if(this.verbose) console.log('TS QUI')
      var dt = new Date(this.timeStamp)
      dt.setSeconds(dt.getSeconds() - this.increment)
      var diff = this.timeDifference(this.timeStamp, this.baseTimeStamp)
      // calcolo nuovo valore timestamp
      if (diff > 0){
        this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
      }
      else{
        dt = new Date(this.baseTimeStamp)
        this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))  
      }
    },
    // THIS FUNCTION UPDATE TIMESTAMP USING RANGE SLIDER
    updateTimeStampByRange () {
      var dt = new Date(this.baseTimeStamp)
      dt.setSeconds(dt.getSeconds() + this.increment * this.internalRange)
      this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
    
      if(this.verbose) console.log('OLD: '+ this.timeStamp)
      if(this.verbose) console.log('NEW: ' + dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
      if(this.verbose) console.log('TS QUI')
      },

    // EVENT FUNCTION
    playTime () {
      this.isPlaying = true
      this.startTimer()
    },
    stopTime () {
      this.isPlaying = false
      clearInterval(this.intervalT)
    },
    startTimer () {
      this.intervalT = setInterval(() => {
          this.playTimeStamp()
      }, 250)
    },

    // FIXME use library
    appendLeadingZeroes (n) {
      if (n <= 9) {
        return '0' + n
      }
      return n
    },
    timeDifference (endTime, startTime) {
      var endT = new Date(endTime)
      var baseT = new Date(startTime)
      return ((endT - baseT) / 1000 / this.increment)
    }
  },
  watch: {
    rangeValue: {
      immediate: true,
      deep: true,
      handler (newValue, oldValue) {
        if (newValue !== oldValue) {
          if(this.verbose) console.log('INT:' + newValue)
          this.internalRange = newValue
        }
      }
    },
    internalRange: {
      immediate: true,
      deep: true,
      handler (newValue, oldValue) {
        if (newValue !== oldValue) {
          this.updateTimeStampByRange()
        }
      }
    }
  }
}
</script>

<style scoped>
input[type="range"]{
  -webkit-appearance: none;
  -moz-apperance: none;
  border-top: 0px solid white;
  border-bottom: 0px solid white;
  background: #2d2d2d;
  border-radius: 0px;
  background-image: -webkit-gradient(
    linear,
    left top,
    right top,
    color-stop(0.2, #2d2d2d),
    color-stop(0.2, #2d2d2d)
  );
}

input[type="range"]::-webkit-slider-thumb{
    background-image:-webkit-gradient(linear, left top, left bottom, color-stop(0,  white), color-stop(0.49,  white), color-stop(0.51,  white), color-stop(1, white) );
    opacity: 1;
    border: 0px solid #2c3e50;
}

.form-control:focus {
  border-color:  white;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 0, 0, 0.6);
}

input[type="range"]:focus {
  border-color:  white;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.075) inset, 0 0 8px rgba(237, 31, 36, 0.6);
  outline: 0 none;
}

.firstbtn {
  margin-bottom: 0px;
}
</style>
