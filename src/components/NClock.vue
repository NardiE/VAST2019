<template>
<div>
  <div id ="date">{{ date }}</div>
  <div id ="time">{{ time }}</div>
</div>
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
    date () {
      return this.day + '-' + this.month + '-' + this.year
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
    },
    time () {
      return this.hour + ':' + this.minute + ':' + this.second
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


div#time {
    width:100%;
    border-radius:15px;
    color:#ecf0f1;
    text-align:center;
    font-size:35px
}
div#date {
    width:100%;
    border-radius:15px;
    color:#ecf0f1;
    text-align:center;
    font-size:18px
}
</style>
