<template>
  <div>
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
                <b-button @click="setIncrement(5)">1x</b-button>
                <b-button @click="setIncrement(60)">12x</b-button>
                <b-button @click="setIncrement(300)">60x</b-button>
                <b-button @click="setIncrement(600)">120x</b-button>
                <b-button @click="setIncrement(3600)">720x</b-button>
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
    NCounters
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
      d3.csv('/data/features.csv').then(data => {
        // coerce numbers to floats, empty strings to null
        data.forEach(function (d) {
          numerics.forEach(function (dim) {
            d[dim] = +d[dim]
          })
          d['Coords'] = [d['Longitude'], d['Latitude']]
        })

        cf = crossfilter(data)

        dTimeStamp = cf.dimension(function (d) { return d['Timestamp'] })

        this.refreshMap(dTimeStamp, this.timeStamp)
        this.refreshBarChart (dTimeStamp)
        this.refreshCounters()
      })
    }
  },

  methods: {
    isNumber (n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },

    refreshCounters(){
        
      this.pointNumber = cf.groupAll().reduceCount().value();
      this.totalRadiation = Number(parseFloat(cf.groupAll().reduceSum(d => d.Radiation).value()).toFixed(2));
      this.avgTotalRadiation = Number(parseFloat(cf.groupAll().reduceSum(d => d.Radiation).value() / cf.groupAll().reduceCount().value()).toFixed(2));
      
      this.avgMobileRadiation = Number(parseFloat(cf.groupAll().reduceSum(d => d.Radiation).value() / cf.groupAll().reduceCount().value()).toFixed(2));
      
      var staticGroup =
      cf.groupAll().reduce(
      function (p,v){
        p.Radiation += v['SensorType'] == 'static' ? +v["Radiation"] : 0; 
        p.count += v['SensorType'] == 'static' ? 1 : 0; 
        p.avg = v['SensorType'] == 'mobile' ? (p.Radiation / p.count) : 0;
        return p;
      },
      // remove
      function (p,v){
        p.Radiation -= v['SensorType'] == 'static' ? +v["Radiation"] : 0; 
        p.count -= v['SensorType'] == 'static' ? 1 : 0; 
        p.avg = v['SensorType'] == 'mobile' ? (p.Radiation / p.count) : 0;
        return p;
      },
      // init
      function init (){ 
        return {
          Radiation: 0, 
          count: 0,
          avg: 0
        };
      }
      )

      var mobileGroup =
      cf.groupAll().reduce(
      function (p,v){
        p.Radiation += v['SensorType'] == 'mobile' ? +v["Radiation"] : 0; 
        p.count += v['SensorType'] == 'mobile' ? 1 : 0; 
        p.avg = v['SensorType'] == 'mobile' ? (p.Radiation / p.count) : 0;
        return p;
      },
      // remove
      function (p,v){
        p.Radiation -= v['SensorType'] == 'mobile' ? +v["Radiation"] : 0; 
        p.count -= v['SensorType'] == 'mobile' ? 1 : 0; 
        p.avg = v['SensorType'] == 'mobile' ? (p.Radiation / p.count) : 0;
        return p;
      },
      // init
      function init (){ 
        return {
          Radiation: 0, 
          count: 0,
          avg: 0
        };
      }
      )

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

    getBarChartFromReport (data) {
      const tc = {
        x:[],
        y:[],
        text:[],
        color:[]
      }

      data.forEach( (d) => {
        tc.x.push(d.SensorId)
        tc.y.push(d.Radiation)
        tc.text.push(d.Units)
        
        if (d.SensorId == this.hoveredMapSensorCode)
          tc.color.push('rgba(0, 255, 0, 0.6)')
        else if(d.SensorId == this.selectedSensorPoint.properties.SensorId)
          tc.color.push('rgba(255, 0, 0, 0.6)')
        else if(this.neighborhoodSensorCodes.includes(d.SensorId))
          tc.color.push('rgba(0, 0, 255, 0.6)')
        else
          tc.color.push('rgba(255,255,255,1)')
      })


      // per ogni x se 

      return tc
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
      // qui non metto il refresh della TImeSeries risparmio tempo tanto non si vede
    },

    updateSensorPoint (...args) {
      const[value,array] = args
      this.selectedSensorPoint = value
      this.neighborhoodSensorCodes = array
    },

    hoverSensor (newVal) {
      this.hoveredSensorCode = newVal[0]
    },

    hoverSensorMap (newVal) {
      this.hoveredMapSensorCode = newVal
    },

    clickSensor(snsCode){
      if(snsCode){
        var sensCode = snsCode[0]
        // deseleziono padre
        if(this.selectedSensorPoint.properties.SensorId == sensCode){
            this.selectedSensorPoint.properties.SensorId = ''
            this.neighborhoodSensorCodes = []
        }
        // se non ho un padre aggiungo padre
        else if(this.selectedSensorPoint.properties.SensorId == ''){
          this.selectedSensorPoint.properties.SensorId = sensCode
        }
        // se è un neigh lo tolgo
        else if(this.neighborhoodSensorCodes.includes(sensCode)){
          var index = this.neighborhoodSensorCodes.indexOf(sensCode);
          if (index !== -1) this.neighborhoodSensorCodes.splice(index, 1);
        }
        else{
          this.neighborhoodSensorCodes.push(sensCode)
        }

        this.refreshMap(dTimeStamp, this.timeStamp)
        this.refreshBarChart(dTimeStamp)
      }
    }

  },

  watch: {
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
