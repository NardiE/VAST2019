<template>
   <b-card-group deck style="width:100%;">
      <b-card header="Global Stats" class="">
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Total Sensor Number: </b-col>
            <b-col cols="3"  class="text-left"> {{ pointNumber }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Total Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ totalRadiation }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Total Average Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ avgTotalRadiation }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Static Sensor Number: </b-col>
            <b-col cols="3"  class="text-left"> {{ staticSensorNumber }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Static Total Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ staticTotalRadiation }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Static Average Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ avgStaticRadiation }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Mobile Sensor Number: </b-col>
            <b-col cols="3"  class="text-left"> {{ mobileSensorNumber }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Mobile Total Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ mobileTotalRadiation }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="9"  class="text-left"> Mobile Average Radiation: </b-col>
            <b-col cols="3"  class="text-left"> {{ avgMobileRadiation }} </b-col>
          </b-row>
        </b-card-text>
      </b-card>
    </b-card-group>
</template>

<script>
export default {
  name: 'NCounters',
  data () {
    return {
    }
  },
  props: {
     pointNumber: {
      type: Number
    },
     totalRadiation: {
      type: Number
    },
     avgTotalRadiation: {
      type: Number
    },
     avgStaticRadiation: {
      type: Number
    },
     avgMobileRadiation: {
      type: Number
    },
    staticSensorNumber:{
      type: Number
    },
    mobileSensorNumber:{
      type: Number
    },
    staticTotalRadiation:{
      type: Number
    },
    mobileTotalRadiation:{
      type: Number
    }
  },
  computed: {
    
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
.card-header{
  background-color: #2d2d2d;
  border: 2px solid white
}
.card-body{
  background-color: #2d2d2d;
  border: 2px solid white
}
.card-body p{
  color: white;
  stroke: white;
  font-weight: bold;
}
.card-header div{
  color: white;
  stroke: white;
  font-weight: bold;
}
p{
  margin-bottom: 4px;
  font-size: 17px !important;
}
</style>
