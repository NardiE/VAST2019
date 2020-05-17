<template>
    <b-input-group class = "row">
      <b-input-group-prepend>
        <b-button
          v-if="!isPlaying"
          variant="outline-danger firstbtn"
          @click="playTime()"
          aria-pressed="true"
        >
          <font-awesome-icon class="fa-x" icon="play" style="color:'white'" />
        </b-button>
        <b-button
          v-if="isPlaying"
          variant="outline-danger firstbtn"
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
        <b-button @click="decrementTimeStamp()" variant="outline-danger">
          <font-awesome-icon class="fa-x" icon="minus" style="color:'white'" />
        </b-button>
        <b-button @click="incrementTimeStamp()" variant="outline-danger" aria-pressed="true">
          <font-awesome-icon class="fa-x" icon="plus" style="color:'white'" />
        </b-button>
      </b-input-group-append>
    </b-input-group>
</template>

<script>
export default {
  name: 'NTimeSlider',
  data () {
    return {
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
      type: String
    }
  },
  computed: {
    maxValue () {
      return this.timeDifference(this.endTimeStamp, this.baseTimeStamp)
    },
    rangeValue () {
      return this.timeDifference(this.timeStamp, this.baseTimeStamp)
    }
  },
  methods: {
    incrementTimeStamp () {
      // calcolo nuovo valore timestamp
      var dt = new Date(this.timeStamp)
      dt.setSeconds(dt.getSeconds() + 5)
      this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
    },

    decrementTimeStamp () {
      // calcolo nuovo valore timestamp
      var dt = new Date(this.timeStamp)
      dt.setSeconds(dt.getSeconds() - 5)
      this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
    },

    updateTimeStampByRange () {
      var dt = new Date(this.baseTimeStamp)
      dt.setSeconds(dt.getSeconds() + 5 * this.internalRange)
      this.$emit('update-timestamp', dt.getFullYear() + '-' + this.appendLeadingZeroes(dt.getMonth() + 1) + '-' + this.appendLeadingZeroes(dt.getDate()) + ' ' + this.appendLeadingZeroes(dt.getHours()) + ':' + this.appendLeadingZeroes(dt.getMinutes()) + ':' + this.appendLeadingZeroes(dt.getSeconds()))
    },

    playTime () {
      this.isPlaying = true
      this.startTimer()
    },

    stopTime () {
      this.isPlaying = false
      this.startTimer()
    },

    startTimer () {
      var diff = this.timeDifference(this.endTimeStamp, this.timeStamp)
      if (diff !== 0 && this.isPlaying) {
        this.intervalT = setInterval(() => {
          this.incrementTimeStamp()
        }, 250)
      } else {
        clearInterval(this.intervalT)
      }
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
  border-top: 1px solid#ed1f24;
  border-bottom: 1px solid#ed1f24;
  background: #024069;
  border-radius: 2px;
  background-image: -webkit-gradient(
    linear,
    left top,
    right top,
    color-stop(0.2, #2c3e50),
    color-stop(0.2, #2c3e50)
  );
}

input[type="range"]::-webkit-slider-thumb{
    background-image:-webkit-gradient(linear, left top, left bottom, color-stop(0, #ed1f24), color-stop(0.49, #ed1f24), color-stop(0.51, #ed1f24), color-stop(1, #ed1f24) );
    opacity: 1;
    border: 1px solid #2c3e50;
}

.form-control:focus {
  border-color: #ed1f24;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(255, 0, 0, 0.6);
}

input[type="range"]:focus {
  border-color: rgba(237, 31, 36, 0.8);
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.075) inset, 0 0 8px rgba(237, 31, 36, 0.6);
  outline: 0 none;
}

.firstbtn {
  border-left: 3px solid#ed1f24;
  border-radius: 0;
}
</style>
