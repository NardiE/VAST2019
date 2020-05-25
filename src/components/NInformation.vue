<template>
   <b-card-group deck>
      <b-card :header="cSensorCode" class="">
        <b-card-text>
          <b-row class="">
            <b-col cols="4"  class="text-left"> User: </b-col>
            <b-col cols="8"  class="text-left"> {{ userName }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="4"  class="text-left"> Pos: </b-col>
            <b-col cols="8"  class="text-left"> {{ cCoordinates }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="4"  class="text-left"> Type: </b-col>
            <b-col cols="8"  class="text-left"> {{ cSensorType }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="4"  class="text-left"> Time: </b-col>
            <b-col cols="8"  class="text-left"> {{ cTimeStamp }} </b-col>
          </b-row>
        </b-card-text>
        <b-card-text>
          <b-row class="">
            <b-col cols="4"  class="text-left"> Value: </b-col>
            <b-col cols="8"  class="text-left"> {{ cRadiation }} </b-col>
          </b-row>
        </b-card-text>
      </b-card>
    </b-card-group>
</template>

<script>

// SIMPLE COMPONENT CART TO STORE INFORMATION
export default {
  name: 'NInformation',
  data () {
    return {
    }
  },
  props: {
     sensorCode: {
      type: String
    },
     userName: {
      type: String
    },
     latitude: {
      type: Number
    },
     longitude: {
      type: Number
    },
     sensorType: {
      type: String
    },
     timeStamp: {
      type: String
    },
     radiation: {
      type: Number
    },
  },
  computed: {
    cCoordinates () {
      return '(' + this.latitude.toString().substr(0,7) + ', ' + this.longitude.toString().substr(0,7) + ')'
    },
    cSensorCode (){
      return this.sensorCode.toString()
    },
    cUserName (){
      return this.userName.toString()
    },
    cSensorType (){
      return this.sensorType.toString()
    },
    cTimeStamp (){
      return this.timeStamp.toString()
    },
    cRadiation (){
      return this.radiation.toString()
    }
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
</style>
