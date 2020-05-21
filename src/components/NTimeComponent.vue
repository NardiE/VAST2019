<template>
    <div>
      <b-row>
        <b-col cols = "10">
        <NClock :timeStamp = "timeStamp"></NClock>
        </b-col>
        <b-col>
          <div>
            <b-button-group vertical style ="margin-top : 10px">
              <b-button>Top</b-button>
              <b-button>Middle</b-button>
              <b-button>Bottom</b-button>
            </b-button-group>
          </div>
        </b-col>
      </b-row>  
      <b-row>
        <NTimeSlider @update-timestamp = "propagateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" :endTimeStamp = "endTimeStamp" :increment = 600></NTimeSlider>
      </b-row>
    </div>
</template>

<script>
import NClock from '@/components/NClock.vue'
import NTimeSlider from '@/components/NTimeSlider.vue'

export default {
  name: 'NTimeComponent',
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

</style>
