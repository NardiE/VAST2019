<template>
  <div>
    <b-container>
      <b-row class="mt-3">
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
                <b-button @click="setIncrement(5)">1x</b-button>
                <b-button @click="setIncrement(60)">12x</b-button>
                <b-button @click="setIncrement(300)">60x</b-button>
                <b-button @click="setIncrement(600)">120x</b-button>
                <b-button @click="setIncrement(3600)">720x</b-button>
              </b-button-group>
            </b-row>
          </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col>
          <NTimeComponent @update-timestamp = "updateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" 
          :endTimeStamp = "endTimeStamp" :increment=increment></NTimeComponent>
        </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col>
          <div style="height:500px">
            <NMap @add-neighbor = "addNeighbor" @remove-neighbor = "removeNeighbor" @remove-neighbors = "removeNeighbors" 
            @add-father = "addFather" @remove-father = "removeFather"
            :featureCollection="pointCollection" :selectedSensorCode="selectedSensorPoint.properties.SensorId" :neighborhoodSensorCodes=neighborhoodSensorCodes></NMap>
          </div>
        </b-col>
        <b-col cols="3" v-if="selectedSensorPoint.properties.SensorId != ''">
          <b-row style="margin-top:60px">
            <NInformation :sensorCode="selectedSensorPoint.properties.SensorId" :userName="selectedSensorPoint.properties.UserId" 
            :latitude ="selectedSensorPoint.geometry.coordinates[0]" :longitude="selectedSensorPoint.geometry.coordinates[1]" :sensorType ="selectedSensorPoint.properties.SensorType" 
            :timeStamp ="selectedSensorPoint.properties.Timestamp" :radiation ="selectedSensorPoint.properties.Radiation"></NInformation>
          </b-row>
        </b-col>
      </b-row><b-row class="mt-3">
        <b-col cols = "12">
           <NPlot v-if="selectedSensorPoint.properties.SensorId != ''"></NPlot>
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

// eslint-disable-next-line
import Vue from 'vue';

import crossfilter from 'crossfilter'
import * as d3 from 'd3'

let cf // crossfilter instance

// eslint-disable-next-line
let dSensorType // dimension for SensorType
let dTimeStamp

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
    NPlot
  },
  data () {
    return {
      // MEASURES
      numRecords: 0,
      sumRadiation: 0,
      avgRadiation: 0,

      // PROPERTIES
      timeStamp: '2020-04-06 00:00:05',
      baseTimeStamp: '2020-04-06 00:00:05',
      endTimeStamp: '2020-04-10 23:59:45',

      // DATA
      neighborhoodSensorCodes: [],

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
      increment: 5,
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
              SensorType: 'Default point'
            },
            geometry: {
              type: 'Point',
              coordinates: [1, 1]
            }
          }
        ]
      }
    }
  },

  mounted () {
    if (this.enableLoading) {
      d3.csv('/data/features.csv').then(data => {
        // coerce numbers to floats, empty strings to null
        data.forEach(function (d) {
          numerics.forEach(function (dim) {
            d[dim] = +d[dim]
          })
          d['Coords'] = [d['Longitude'], d['Latitude']]
        })

        cf = crossfilter(data)

        dSensorType = cf.dimension(function (d) { return d['SensorType'] })
        dTimeStamp = cf.dimension(function (d) { return d['Timestamp'] })

        // TODO gestire extent
        /*dSensorType.filter('static')
        var count = dSensorType.groupAll().reduceCount().value()
        var sum = dSensorType.groupAll().reduceSum(d=>d.Radiation).value()
        console.log(sum / count)

        dSensorType.filter('mobile')
        var count1 = dSensorType.groupAll().reduceCount().value()
        var sum1 = dSensorType.groupAll().reduceSum(d=>d.Radiation).value()
        console.log(sum1 / count1) */

        dSensorType.filter('static')

        // TODO gestire extent
        // this.timeStamp = dTimeStamp.bottom(1)['Timestamp']
        // this.baseTimeStamp = dTimeStamp.bottom(1)['Timestamp']
        // this.endTimeStamp = dTimeStamp.top(1)['Timestamp']
        // dTimeStamp.filter(this.timeStamp)

        this.refreshAll(dTimeStamp, this.timeStamp)
      })
    }
  },

  methods: {
    isNumber (n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },

    refreshCounters () {
      this.numRecords = cf.groupAll().reduceCount().value(),
      this.sumRadiation = cf.groupAll().reduceSum(d => d.Radiation).value()
    },

    refreshMap (cfDimension) {
      this.pointCollection = this.getGeoJsonFromReports(cfDimension.top(this.featureNumbers))
    },

    refreshAll (cfDimension, filter) {
      if (cfDimension && this.enableLoading) {
        cfDimension.filter(filter)
        this.refreshCounters()
        this.refreshMap(cfDimension)
      }
    },

    getGeoJsonFromReports (reports) {
      const fc = {
        type: 'FeatureCollection',
        features: reports
          .filter(d => d.Coords)
          .map(d => // for each entry in record dictionary
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

    updateTimeStamp (value) {
      this.timeStamp = value
      this.refreshAll(dTimeStamp, this.timeStamp)
    },

    setIncrement(value){
      this.increment = value
      this.settingVisible = false
    },

    // TO HANDLE disappearing Points
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
  },

  watch: {
  },
  computed: {
  }
}
</script>

<style scoped>
.container {
  margin-top: 40px;
  padding-top: 10px;
}
</style>
