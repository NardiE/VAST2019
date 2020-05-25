<template>
  <div>
    <b-container>
      <b-row class="">
        <b-col>
          <NTimeSeries></NTimeSeries>
        </b-col>
      </b-row>
    </b-container>
    <b-container>
      <b-row class="">
        <b-col cols = '3'>
            <b-row>
              <b-button @click="settingVisible = !settingVisible"
                aria-pressed="true"
              >
                <font-awesome-icon class="fa-x" icon="sliders-h" style="color:'white'" />
              </b-button>
            </b-row>
            <b-row>
              <b-button-group v-if="settingVisible">
                <b-button @click="setIncrement(3600)">1x</b-button>
                <b-button @click="setIncrement(7200)">2x</b-button>
                <b-button @click="setIncrement(10800)">3x</b-button>
                <b-button @click="setIncrement(14400)">4x</b-button>
                <b-button @click="setIncrement(43200)">12x</b-button>
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
          <div style="height: 380px">
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
           <NPlot @click-sensor="clickSensor" @hover-sensor="hoverSensor" :cfAggregation="barCollection"></NPlot>
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

import crossfilter from 'crossfilter'
import * as d3 from 'd3'

let cf // crossfilter instance

// eslint-disable-next-line
let dTimeStamp

// let cf2 // crossfilter instance


var numerics = ['Latitude', 'Longitude', 'Radiation']
/* var columns = [
  'UserId',
  'Latitude',
  'Longitude',
  'SensorId',
  'SensorType',
  'Timestamp',
  'Units',
  'Radiation'
] */

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
      // MEASURES
      numRecords: 0,
      sumRadiation: 0,
      avgRadiation: 0,

      // PROPERTIES
      timeStamp: '2020-04-06 00:00:00',
      baseTimeStamp: '2020-04-06 00:00:00',
      endTimeStamp: '2020-04-10 23:00:00',

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

      // SETTINGS
      increment: 3600,
      settingVisible: false,

      // FIXME DEVELOPEMENT PURPOSES
      enableLoading: true,
      featureNumbers: Infinity,

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
      }
    }
  },

  mounted () {
    if (this.enableLoading) {

      // LOAD DATA AGGREGATE 1H
      d3.csv('/data/newFeatures.csv').then(data => {
        // coerce numbers to floats, empty strings to null
        data.forEach(function (d) {
          numerics.forEach(function (dim) {
            d[dim] = +d[dim]
          })
          d['Coords'] = [d['Longitude'], d['Latitude']]
        })

        // CROSS FILTER SETUP
        cf = crossfilter(data)
        dTimeStamp = cf.dimension(function (d) { return d['Timestamp'] })

        // REFRESHING COMPONENT
        this.refreshMap(dTimeStamp, this.timeStamp)
        this.refreshBarChart (dTimeStamp)
        this.refreshCounters()
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
      this.pointNumber = cf.groupAll().reduceCount().value();
      this.totalRadiation = Number(parseFloat(cf.groupAll().reduceSum(d => d.Radiation).value()).toFixed(2));
      
      // CUSTOMIZED AGGREGATION TO AVOID NEW CF DIMENSION (SAVE SPACE)
      var staticGroup = this.customAggregation(cf, 'static')
      var mobileGroup = this.customAggregation(cf, 'mobile')
      this.staticSensorNumber =  Number(parseFloat(staticGroup.value().count).toFixed(2))
      this.staticTotalRadiation =  Number(parseFloat(staticGroup.value().Radiation).toFixed(2))
      this.avgStaticRadiation =  Number(parseFloat(this.staticTotalRadiation/this.staticSensorNumber).toFixed(2))
      this.mobileSensorNumber =  Number(parseFloat(mobileGroup.value().count).toFixed(2))
      this.mobileTotalRadiation =  Number(parseFloat(mobileGroup.value().Radiation).toFixed(2))
      this.avgMobileRadiation =  Number(parseFloat(this.mobileTotalRadiation/this.mobileSensorNumber).toFixed(2))
    },
    refreshBarChart (cfDimension) {
      this.barCollection = this.getBarChartFromReport(cfDimension.top(this.featureNumbers))
    },
    refreshMap (cfDimension, filter) {
      if (cfDimension && this.enableLoading) {
        cfDimension.filter(filter)
        this.pointCollection = this.getGeoJsonFromReports(cfDimension.top(this.featureNumbers))
      }
    },

    // COLLECTION STANDARIZATION FUNCTIONS
    getBarChartFromReport (data) {
      const tc = {x:[], y:[], text:[], color:[]}
      data.forEach( (d) => {
        tc.x.push(d.SensorId)
        tc.y.push(d.Radiation)
        tc.text.push(d.Units)
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
                SensorId: d['SensorId'],
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
      this.timeStamp = value
    },
    setIncrement(value){
      this.increment = value
      this.settingVisible = false
    },
    /* MAPCOMPONENT (HANDLE DISAPPEARING POINTS)*/
    addNeighbor(value){
      if(value != null) this.neighborhoodSensorCodes.push(value)
    },
    removeNeighbor(value){
      if(value != null){
        var idx = this.neighborhoodSensorCodes.indexOf(value)
        if(idx > -1) this.neighborhoodSensorCodes.splice(idx,1)
      }
    },
    removeNeighbors(){
      this.neighborhoodSensorCodes = []
    },
    addFather(node){
      this.selectedSensorPoint = node
    },
    removeFather(){
      this.selectedSensorPoint = this.fakeSensorPoint
    },
    updateSensorPoint (...args) {
      const[value,array] = args
      this.selectedSensorPoint = value
      this.neighborhoodSensorCodes = array
    },
    hoverSensorMap (newVal) {
      this.hoveredMapSensorCode = newVal
    },
    /* PLOTCOMPONENT (BARCHART)*/
    hoverSensor (newVal) {
      this.hoveredSensorCode = newVal[0]
    },
    clickSensor(snsCode){
      if(snsCode){
        var sensCode = snsCode[0]
        // IF I REMOVE FATHER, I NEED TO REMOVE NEIGHBORS TOO
        if(this.selectedSensorPoint.properties.SensorId == sensCode){
            this.selectedSensorPoint.properties.SensorId = ''
            this.neighborhoodSensorCodes = []
        }
        // IF I HAVE NOT A FATHER, NEW SENSOR MAY BE A FATHER
        else if(this.selectedSensorPoint.properties.SensorId == ''){
          this.selectedSensorPoint.properties.SensorId = sensCode
        }
        // IF THE SELECTED BAR SENSOR IS A NEIGHBORS I REMOVE IT
        else if(this.neighborhoodSensorCodes.includes(sensCode)){
          var index = this.neighborhoodSensorCodes.indexOf(sensCode);
          if (index !== -1) this.neighborhoodSensorCodes.splice(index, 1);
        }
        // ELSE I ADD IT AS A NEIGHBORS
        else{
          this.neighborhoodSensorCodes.push(sensCode)
        }
      }
    },

    // OTHER FUNCTIONS
    customAggregation (cf, filter) {
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
    }
  },

  watch: {
    // ALL WATCHED FUNCTION, EVERY LOGICS INSERTED HERE TO NOT MAKE HEAVY ONCLICK COMPONENT ACTIONS
    selectedSensorPoint () {
      this.refreshBarChart (dTimeStamp)
    },
    neighborhoodSensorCodes (){
      this.refreshBarChart (dTimeStamp)
    },
    timeStamp (){
      this.refreshMap(dTimeStamp, this.timeStamp)
      this.refreshBarChart (dTimeStamp)
      this.refreshCounters()
    },
    hoveredMapSensorCode (){
      this.refreshBarChart (dTimeStamp)
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
</style>
