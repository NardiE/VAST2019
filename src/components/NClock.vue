<template>
  <b-row>
   <div v-if="!timeStamp" id="timedate">
      <a v-if="!timeStamp" id="d">{{ dayT }}</a> /
      <a v-if="!timeStamp" id="d">{{ monthT }}</a> /
      <a v-if="!timeStamp" id="mon">{{ yearT }}</a><br />
      <a v-if="!timeStamp" id="h">{{ hourT }}</a> :
      <a v-if="!timeStamp" id="m">{{ minuteT }}</a> :
      <a v-if="!timeStamp" id="s">{{ secondT }}</a>
   </div>
   <div v-if="timeStamp" id="timedate">
      <a v-if="timeStamp" id="d">{{ day }}</a> /
      <a v-if="timeStamp" id="d">{{ month }}</a> /
      <a v-if="timeStamp" id="mon">{{ year }}</a><br />
      <a v-if="timeStamp" id="h">{{ hour }}</a> :
      <a v-if="timeStamp" id="m">{{ minute }}</a> :
      <a v-if="timeStamp" id="s">{{ second }}</a>
   </div>
  </b-row>
</template>

<script>
export default {
  name: 'NClock',
  props: {
    yearT: {
      type: String
    },
    monthT: {
      type: String
    },
    dayT: {
      type: String
    },
    hourT: {
      type: String
    },
    minuteT: {
      type: String
    },
    secondT: {
      type: String
    },
    timeStamp: {
      type: String
    }
  },
  computed: {

    year () {
      var dt = new Date(this.timeStamp)
      return dt.getFullYear()
    },
    month () {
      var dt = new Date(this.timeStamp)
      return this.appendLeadingZeroes(dt.getMonth() + 1)
    },
    day () {
      var dt = new Date(this.timeStamp)
      return this.appendLeadingZeroes(dt.getDate())
    },
    hour () {
      var dt = new Date(this.timeStamp)
      return this.appendLeadingZeroes(dt.getHours())
    },
    minute () {
      var dt = new Date(this.timeStamp)
      return this.appendLeadingZeroes(dt.getMinutes())
    },
    second () {
      var dt = new Date(this.timeStamp)
      return this.appendLeadingZeroes(dt.getSeconds())
    }
  },
  methods: {
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

#timedate {
  font: small-caps lighter 43px/150% "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;
  text-align:left;
  color:#fff;
  border-left: 3px solid #ed1f24;
  padding: 20px;
}
</style>
