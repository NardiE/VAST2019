<template>
  <div>
    <b-container fluid class="" v-show="mode=='timeseries'">
      <b-row  class="mt-3">
        <b-col class cols = "12">
          <div style="height:400px" >
            <div>
                <NTimeSeries :cfAggregation="tsCollection" @click-inside = "switchToMap"></NTimeSeries>
            </div>>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-container v-if="mode=='map'">
      <b-row class="">
        <b-col cols = '3'>
            <b-row>
              <b-button @click="settingVisible = !settingVisible" aria-pressed="true">
                <font-awesome-icon class="fa-x" icon="sliders-h" style="color:'white'" />
              </b-button>
              <b-button @click="switchToTimeSeries()" aria-pressed="true">
                <font-awesome-icon class="fa-x" icon="chart-line" style="color:'white'" />
              </b-button>
            </b-row>
            <b-row>
              <b-button-group v-if="settingVisible">
                <b-button @click="setIncrement(baseIncrement)">1x</b-button>
                <b-button @click="setIncrement(2*baseIncrement)">2x</b-button>
                <b-button @click="setIncrement(3*baseIncrement)">3x</b-button>
                <b-button @click="setIncrement(4*baseIncrement)">4x</b-button>
                <b-button @click="setIncrement(12*baseIncrement)">12x</b-button>
              </b-button-group>
            </b-row>
          </b-col>
      </b-row>
      <b-row class="">
        <b-col>
          <NTimeComponent @update-timestamp = "updateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" 
          :endTimeStamp = "endTimeStamp" :increment=increment></NTimeComponent>
        </b-col>
      </b-row>
      <b-row class="">
        <b-col>
          <div style="height: 400px">
            <NMap @hover-sensor="hoverSensorMap" @add-neighbor = "addNeighbor" @remove-neighbor = "removeNeighbor" @remove-neighbors = "removeNeighbors" 
            @add-father = "addFather" @remove-father = "removeFather"
            :featureCollection="pointCollection" :selectedSensorCode="selectedSensorPoint.properties.SensorId" :neighborhoodSensorCodes=neighborhoodSensorCodes
            :hoveredSensorCode="hoveredSensorCode"
            ></NMap>
          </div>
        </b-col>
        <b-col cols="5" v-if="selectedSensorPoint.properties.SensorId == ''">
          <b-row  class="ml-0" style="margin-top:10px">
            <NCounters :pointNumber=pointNumber :totalRadiation=totalRadiation :avgTotalRadiation=avgTotalRadiation :avgStaticRadiation=avgStaticRadiation
            :avgMobileRadiation=avgMobileRadiation :mobileSensorNumber=mobileSensorNumber :staticSensorNumber=staticSensorNumber :mobileTotalRadiation=mobileTotalRadiation
            :staticTotalRadiation=staticTotalRadiation
            ></NCounters>
          </b-row>
        </b-col>
        <b-col cols="3" v-if="selectedSensorPoint.properties.SensorId != ''">
          <b-row style="margin-top:10px">
            <NInformation :sensorCode="selectedSensorPoint.properties.SensorId" :userName="selectedSensorPoint.properties.UserId" 
            :latitude ="selectedSensorPoint.geometry.coordinates[0]" :longitude="selectedSensorPoint.geometry.coordinates[1]" :sensorType ="selectedSensorPoint.properties.SensorType" 
            :timeStamp ="selectedSensorPoint.properties.Timestamp" :radiation ="Number(Number(selectedSensorPoint.properties.Radiation).toFixed(2))"></NInformation>
          </b-row>
        </b-col>
      </b-row>
      <b-row  class="mt-3">
        <b-col class cols = "12">
          <div style="height:100px">
           <NPlot :cfAggregation="barCollection" @click-sensor="clickSensor" @hover-sensor="hoverSensor"></NPlot>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import NMap from '@/components/NMap.vue'
import NTimeComponent from '@/components/NTimeComponent.vue'
import NInformation from '@/components/NInformation.vue'
import NPlot from '@/components/NPlot.vue'
import NCounters from '@/components/NCounters.vue'
import NTimeSeries from '@/components/NTimeSeries.vue'

// eslint-disable-next-line
import Vue from 'vue';
import axios from 'axios';

import crossfilter from 'crossfilter'
import * as d3 from 'd3'

let cf // crossfilter instance

// eslint-disable-next-line
let dTimeStamp

// let cf2 // crossfilter instance


var numerics = ['Latitude', 'Longitude', 'Radiation']

var modes = ['timeseries', 'map'];

export default {
  name: 'NPartitionedPoster',
  components: {
    NMap,
    NTimeComponent,
    NInformation,
    NPlot,
    NCounters,
    NTimeSeries
  },
  data () {
    return {

      // SETTINGS
      increment: 3600,
      settingVisible: false,

      // MEASURES
      numRecords: 0,
      sumRadiation: 0,
      avgRadiation: 0,

      // PROPERTIES
      baseIncrement: 3600,
      timeStamp: '2020-04-06 00:00:00',
      baseTimeStamp: '2020-04-06 00:00:00',
      endTimeStamp: '2020-04-10 23:00:00',
      /* USED TO SWITCH FROM TIMESERIES VISUALITATION TO MAP VISUALIZATION AND VICEVERSA */
      mode : null,

      // DATA
      neighborhoodSensorCodes: [],
      hoveredSensorCode: '',
      hoveredMapSensorCode: '',
      pointNumber: 0,
      totalRadiation: 0,
      avgTotalRadiation: 0,
      avgStaticRadiation: 0,
      avgMobileRadiation: 0,
      staticSensorNumber: 0,
      mobileSensorNumber: 0,
      mobileTotalRadiation: 0,
      staticTotalRadiation: 0,

      // OTHERS
      selectedSensorPoint: {
        properties: {
          SensorId: '',
          UserId: '',
          SensorType: '',
          Timestamp: '',
          Units: '',
          Radiation: 0
        },
        geometry: {
          coordinates: [0,0]
        }
      },

      fakeSensorPoint: {
        properties: {
          SensorId: '',
          UserId: 'Not Defined',
          SensorType: 'Not Defined',
          Timestamp: '(Not Defined,Not Defined)',
          Units: 'Not Defined',
          Radiation: -100
        },
        geometry: {
          coordinates: [999,999]
        }
      },

      // FIXME DEVELOPEMENT PURPOSES
      enableLoading: true,
      featureNumbers: Infinity,
      verbose: true,

      // COLLECTIONS
      pointCollection: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              SensorType: 'Default point',
              Radiation: 0
            },
            geometry: {
              type: 'Point',
              coordinates: [1, 1]
            }
          }
        ]
      },

      barCollection: {
        x: [0],
        y: [0],
        text: [''],
        color:['rgba(255,255,255,1)']
      },

      tsCollection:{
        S_1:
        [ {
        x: [0],
        y: [0],
        text: [''],
        color :'#2d2d2d'
      }]}
    }
  },

  mounted () {
    if (this.enableLoading) {
      axios.get(`http://localhost:3000/features/hours`)
      .then(response => {
        if(this.verbose) console.log('NPP - Data Loaded from Web Server')
        // JSON responses are automatically parsed.
        this.baseIncrement = 3600
        this.initalizeData(response.data)
      })
      .catch((e) => {// LOAD DATA AGGREGATE 1H
        if(this.verbose) console.log('NPP - Data Loaded from File' + e)
        d3.csv('/data/newFeatures.csv').then(data => {
          this.initalizeData(data)
        })
      })   
    }
  },

  methods: {
    // FIXME EXTERNAL LIBRARY
    isNumber (n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },

    // REFRESHING FUNCTIONS
    refreshCounters(){
      if(this.verbose) console.log('NPP - I refresh the Counters')
      this.pointNumber = cf.groupAll().reduceCount().value();
      this.totalRadiation = Number(parseFloat(cf.groupAll().reduceSum(d => d.Radiation).value()).toFixed(2));
      this.avgTotalRadiation = Number((this.totalRadiation/this.pointNumber).toFixed(2))
      // CUSTOMIZED AGGREGATION TO AVOID NEW CF DIMENSION (SAVE SPACE)
      var staticGroup = this.customAggregation('static')
      var mobileGroup = this.customAggregation('mobile')
      this.staticSensorNumber =  Number(parseFloat(staticGroup.value().count).toFixed(2))
      this.staticTotalRadiation =  Number(parseFloat(staticGroup.value().Radiation).toFixed(2))
      this.avgStaticRadiation =  Number(parseFloat(this.staticTotalRadiation/this.staticSensorNumber).toFixed(2))
      this.mobileSensorNumber =  Number(parseFloat(mobileGroup.value().count).toFixed(2))
      this.mobileTotalRadiation =  Number(parseFloat(mobileGroup.value().Radiation).toFixed(2))
      this.avgMobileRadiation =  Number(parseFloat(this.mobileTotalRadiation/this.mobileSensorNumber).toFixed(2))
    },
    refreshBarChart (cfDimension) {
      if(this.verbose) console.log('NPP - I refresh the Bar Chart')
      this.barCollection = this.getBarChartFromReport(cfDimension.top(this.featureNumbers))
    },
    refreshMap (cfDimension, filter) {
      if (cfDimension && this.enableLoading) {
      if(this.verbose) console.log('NPP - I refresh the Map with Date: ' + filter)
        cfDimension.filter(filter)
        this.pointCollection = this.getGeoJsonFromReports(cfDimension.top(this.featureNumbers))
      }
    },
    refreshTimeSeries(cfDimension){
      cfDimension.filter(null)
      if(this.verbose) console.log('NPP - I refresh the TimeSeries')
      this.tsCollection = this.getTsFromReport(cfDimension.top(this.featureNumbers))
      console.log(this.tsCollection)
    },

    // COLLECTION STANDARIZATION FUNCTIONS
    getTsFromReport (data) {
      var ts = {}
      data.forEach( (d) => {
        if(d.SensorId.trim() != ''){
          // IF SENSOR NOT EXISTS
          if(!ts[d.SensorId]){
            ts[d.SensorId] = {x:[], y:[], text:[], color:'#2d2d2d', node : {}, borderColor: 'white'}
          }
          if(d.SensorType == 'static'){
            ts[d.SensorId].color = 'white'
            ts[d.SensorId].borderColor = '#2d2d2d'
          } 
          else if(d.SensorType == 'mobile'){
            ts[d.SensorId].color = '#2d2d2d'
            ts[d.SensorId].borderColor = 'white'
          }
          ts[d.SensorId].x.push(d.Timestamp)
          ts[d.SensorId].y.push(d.Radiation)
          ts[d.SensorId].text.push(d.SensorId)
          ts[d.SensorId].node = d
        }
      })
      return ts
    },
    getBarChartFromReport (data) {
      const tc = {x:[], y:[], text:[], color:[], node: []}
      data.forEach( (d) => {
        tc.x.push(d.SensorId)
        tc.y.push(d.Radiation)
        tc.text.push(d.Units)
        tc.node.push(d)
        // ADDING COLOR WITH RESERVE TO SENSOR STATUS (HOVERED, FATHER, NEIGHBOR)    
        if (d.SensorId == this.hoveredMapSensorCode)
          tc.color.push('rgba(0, 255, 0, 0.6)')
        else if(d.SensorId == this.selectedSensorPoint.properties.SensorId)
          tc.color.push('rgba(255, 0, 0, 0.6)')
        else if(this.neighborhoodSensorCodes.includes(d.SensorId))
          tc.color.push('rgba(0, 0, 255, 0.6)')
        else
          tc.color.push('rgba(255,255,255,1)')
      })
      return tc
    },

    getGeoJsonFromReports (reports) {
      const fc = {
        type: 'FeatureCollection',
        features: reports
          .filter(d => d.Coords)
          .map(d =>
            ({
              type: 'Feature',
              properties: {
                UserId: d.UserId,
                SensorId: d.SensorId,
                SensorType: d.SensorType,
                Timestamp: d.Timestamp,
                Units: d.Units,
                Radiation: +d.Radiation
              },
              geometry: {
                type: 'Point',
                coordinates: d.Coords
              }
            })
          )
      }
      return fc
    },

    // CALLBACK FUNCTIONS (RECEIVE UPDATE FROM CHILD COMPONENTS)
    /* TIMECOMPONENT */
    updateTimeStamp (value) {
      if(this.verbose) console.log('NPP - Time Component change the Date to: ' + value)
      this.timeStamp = value
    },
    setIncrement(value){
      if(this.verbose) console.log('NPP - Time increment changed to: ' + value)
      this.increment = value
      this.settingVisible = false
    },
    /* MAPCOMPONENT (HANDLE DISAPPEARING POINTS)*/
    addNeighbor(value){
      if(this.verbose) console.log('NPP - The Map Component want to add a neighbor: ' + value)
      if(value != null) this.neighborhoodSensorCodes.push(value)
    },
    removeNeighbor(value){
      if(this.verbose) console.log('NPP - The Map Component want to remove a neighbor: ' + value)
      if(value != null){
        var idx = this.neighborhoodSensorCodes.indexOf(value)
        if(idx > -1) this.neighborhoodSensorCodes.splice(idx,1)
      }
    },
    removeNeighbors(){
      if(this.verbose) console.log('NPP - The Map Component want to remove all neighbors')
      this.neighborhoodSensorCodes = []
    },
    addFather(node){
      if(this.verbose) console.log('NPP - The Map Component want to add a Father: ' + node.properties.SensorId)
      this.selectedSensorPoint = node
    },
    removeFather(){
      this.selectedSensorPoint = JSON.parse(JSON.stringify(this.fakeSensorPoint))
      if(this.verbose) console.log('NPP - The Map Component want to remove the Father, so the Father is: ' + this.selectedSensorPoint.properties.SensorId)
    },
    updateSensorPoint (...args) {
      const[value,array] = args
      this.selectedSensorPoint = value
      this.neighborhoodSensorCodes = array
    },
    hoverSensorMap (newVal) { 
      if(this.verbose) console.log('NPP - The Map Component indicate the hover Sensor: ' + newVal)
      this.hoveredMapSensorCode = newVal
    },
    /* PLOTCOMPONENT (BARCHART)*/
    hoverSensor (newVal) {
      if(this.verbose) console.log('NPP - The Plot Component indicate the hover Sensor: ' + newVal[0])
      this.hoveredSensorCode = newVal[0]
    },
    clickSensor(...args){
      const[snsCode,sensor] = args
      console.log('PORCO DIO')
      console.log(snsCode)
      console.log(sensor[0])
      if(this.verbose) console.log('NPP - The Plot Component trigger a Click on: ' + snsCode)
      if(snsCode){
        var sensCode = snsCode[0]
        // IF I REMOVE FATHER, I NEED TO REMOVE NEIGHBORS TOO
        if(this.selectedSensorPoint.properties.SensorId == sensCode){
          if(this.verbose) console.log('so the Father is: ' +  this.selectedSensorPoint.properties.SensorId)
          this.selectedSensorPoint = JSON.parse(JSON.stringify(this.fakeSensorPoint)) // FIXME can cause problem
          this.neighborhoodSensorCodes = []
        }
        // IF I HAVE NOT A FATHER, NEW SENSOR MAY BE A FATHER
        else if(this.selectedSensorPoint.properties.SensorId == ''){
          if(this.verbose) console.log('so the Father is: ' + sensCode)
          if(sensor){
            // use to DEEP COPY
            var tmpSensorPoint = JSON.parse(JSON.stringify(this.selectedSensorPoint))
            tmpSensorPoint.properties.SensorId = sensor.SensorId
            tmpSensorPoint.properties.UserId = sensor.UserId
            tmpSensorPoint.properties.SensorType = sensor.SensorType
            tmpSensorPoint.properties.Timestamp = sensor.Timestamp
            tmpSensorPoint.properties.Units = sensor.Units
            tmpSensorPoint.properties.Radiation = sensor.Radiation
            var coordinates = [sensor.Latitude,sensor.Longitude]
            tmpSensorPoint.geometry.coordinates = [...coordinates]
            this.selectedSensorPoint = JSON.parse(JSON.stringify(tmpSensorPoint))
          }
        }
        // IF THE SELECTED BAR SENSOR IS A NEIGHBORS I REMOVE IT
        else if(this.neighborhoodSensorCodes.includes(sensCode)){
          if(this.verbose) console.log('so I remove the Neigbhor: ' + sensCode)
          var index = this.neighborhoodSensorCodes.indexOf(sensCode);
          if (index !== -1) this.neighborhoodSensorCodes.splice(index, 1);
        }
        // ELSE I ADD IT AS A NEIGHBORS
        else{
          if(this.verbose) console.log('so I add the Neigbhor: ' + sensCode)
          this.neighborhoodSensorCodes.push(sensCode)
        }
      }
    },
    /* TIMESERIES COMPONENT (TIMESERIES) */
    switchToMap (...args) {
      const[timeStamp,sensor] = args
      console.log(sensor)
      if(this.verbose){ console.log('NPP - Passing to Map Visualization with Date: ' + sensor.Timestamp + ' for Sensor: ' + sensor.SensorId)}
      if(sensor){
        // use to DEEP COPY
        var tmpSensorPoint = JSON.parse(JSON.stringify(this.selectedSensorPoint))
        
        tmpSensorPoint.properties.SensorId = sensor.SensorId
        tmpSensorPoint.properties.UserId = sensor.UserId
        tmpSensorPoint.properties.SensorType = sensor.SensorType
        tmpSensorPoint.properties.Timestamp = sensor.Timestamp
        tmpSensorPoint.properties.Units = sensor.Units
        tmpSensorPoint.properties.Radiation = sensor.Radiation
        var coordinates = [sensor.Latitude,sensor.Longitude]
        tmpSensorPoint.geometry.coordinates = [...coordinates]

        this.selectedSensorPoint = JSON.parse(JSON.stringify(tmpSensorPoint))
      }
      if(timeStamp){
        if(this.verbose) console.log('NPP: entrato STM (timestamp) ' + timeStamp[0])
        this.timeStamp = timeStamp[0]
        this.mode = modes[1]
      }
    },

    // VISUALIZATION MODES
    switchToTimeSeries () {
      if(this.verbose) console.log('NPP - Passing to Time Series Visualization')
      this.selectedSensorPoint = JSON.parse(JSON.stringify(this.fakeSensorPoint))
      this.removeNeighbors()
      this.mode = modes[0]
    },
    // OTHER FUNCTIONS
    customAggregation (filter) {
      return cf.groupAll().reduce( 
      // Add
      function (p,v){
        p.Radiation += v['SensorType'] == filter ? +v["Radiation"] : 0; 
        p.count += v['SensorType'] == filter ? 1 : 0; 
        p.avg = v['SensorType'] == filter ? (p.Radiation / p.count) : 0;
        return p;
      },// remove
      function (p,v){
        p.Radiation -= v['SensorType'] == filter ? +v["Radiation"] : 0; 
        p.count -= v['SensorType'] == filter ? 1 : 0; 
        p.avg = v['SensorType'] == filter ? (p.Radiation / p.count) : 0;
        return p;
      },
      // Initialize
      function init (){ 
        return {
          Radiation: 0, 
          count: 0,
          avg: 0
        };
      })
    },
    initalizeData(data){
      // coerce numbers to floats, empty strings to null
      if(this.verbose){ console.log('NPP - I readed data: '); console.log(data)}
      
      data.forEach((d) => {
        numerics.forEach(function (dim) {
          d[dim] = +d[dim]
        })
        d['Coords'] = [d['Longitude'], d['Latitude']]
      })

      // CROSS FILTER SETUP
      cf = crossfilter(data)
      dTimeStamp = cf.dimension(function (d) { return d['Timestamp'] })
      // REFRESHING COMPONENT
      if(this.verbose) console.log('NPP: Aggiorno i componenti')
      this.refreshMap(dTimeStamp, null)
      this.refreshBarChart (dTimeStamp)
      this.refreshCounters()
      this.refreshTimeSeries(dTimeStamp)
      
      if(this.verbose) console.log('NPP-MOUNTED: Aggiungo modalità visualizzazione una volta finito il caricamento')
      this.mode = modes[0]
    }
  },

  watch: {
    // ALL WATCHED FUNCTION, EVERY LOGICS INSERTED HERE TO NOT MAKE HEAVY ONCLICK COMPONENT ACTIONS
    selectedSensorPoint:{
      deep: true,
      handler() {
        if(this.verbose) console.log('NPP-WATCH - Sensor change to: ' + this.selectedSensorPoint.properties.SensorId)
        this.refreshBarChart (dTimeStamp)
        this.refreshCounters()
      }
    },
    neighborhoodSensorCodes (){
      if(this.verbose){ console.log('NPP-WATCH - Neighboors change to :'); console.log(this.neighborhoodSensorCodes)}
      this.refreshBarChart (dTimeStamp)
      this.refreshCounters()
    },
    timeStamp (newVal) {
      if(this.verbose) console.log('NPP-WATCH - Time Stamp change to: ' + newVal)
      this.refreshMap(dTimeStamp, newVal)
      this.refreshBarChart (dTimeStamp)
      this.refreshCounters()
    },
    hoveredMapSensorCode (newVal){
      if(this.verbose) console.log('NPP-WATCH - Hovered Sensor change to: ' + newVal)
      this.refreshBarChart (dTimeStamp)
      this.refreshCounters()
      //this.refreshMap(dTimeStamp, newVal)
    }
  },
  computed: {
  }
}
</script>

<style scoped>
.container {
  margin-top: 40px;
  padding-top: 10px;
  margin-bottom:20px;
}


.container-fluid {
  margin-top: 40px;
  padding-top: 10px;
  margin-bottom:20px;
}
</style>
