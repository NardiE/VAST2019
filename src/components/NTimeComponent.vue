<template>
    <div>
      <b-row>
        <b-col >
        <NClock :timeStamp = "timeStamp"></NClock>
        </b-col>
      </b-row>  
      <b-row>
        <NTimeSlider @update-timestamp = "propagateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" :endTimeStamp = "endTimeStamp" :increment = increment></NTimeSlider>
      </b-row>
    </div>
</template>

<script>
import NClock from '@/components/NClock.vue'
import NTimeSlider from '@/components/NTimeSlider.vue'

export default {
  name: 'NTimeComponent',
  data() {
    return {
    }
  },
  components: {
    NClock,
    NTimeSlider
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

  methods: {
    propagateTimeStamp (value) {
      this.$emit('update-timestamp', value)
    },

    // FIXME use library
    appendLeadingZeroes (n) {
      if (n <= 9) {
        return '0' + n
      }
      return n
    }
  }
}
</script>

<style scoped>
.mt-10{
  margin-top: 0px;
  text-align: right;
}


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
</style>
