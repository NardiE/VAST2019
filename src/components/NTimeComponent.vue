<template>
  <b-col cols="12">
    <b-row>
      <NClock :timeStamp = "timeStamp"></NClock>
    </b-row>
    <b-row>
      <NTimeSlider @update-timestamp = "propagateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" :endTimeStamp = "endTimeStamp" :increment = "increment"></NTimeSlider>
    </b-row>
  </b-col>
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
      type: String
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
