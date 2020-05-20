<template>
  <div>
    <b-container>
      <b-row class="mt-3">
        <b-col cols="3">
          <b-form-group label='Select a year'>
            <b-form-checkbox-group
              v-model="sensorType.value"
              :options="sensorType.options"
              name='sensorButton'
              buttons
            ></b-form-checkbox-group>
          </b-form-group>
        </b-col>
        <b-col cols="3">
        </b-col>
      </b-row>
      <b-row class="mt-3">
        <b-col cols="9">
          <div style="height:500px">
            <NMap @update-sensor-point = "updateSensorPoint" :featureCollection="pointCollection"></NMap>
          </div>
        </b-col>
        <b-col cols="3">
          <b-row>
            <NTimeComponent @update-timestamp = "updateTimeStamp" :timeStamp = "timeStamp" :baseTimeStamp = "baseTimeStamp" :endTimeStamp = "endTimeStamp" increment = 5></NTimeComponent>
          </b-row>
          <b-row>
            <NInformation v-if="isSelected"  :sensorCode="selectedSensorPoint.properties.SensorId" :userName="selectedSensorPoint.properties.User" 
            :latitude ="selectedSensorPoint.geometry.coordinates[0]" :longitude="selectedSensorPoint.geometry.coordinates[1]" :sensorType ="selectedSensorPoint.properties.SensorType" 
            :timeStamp ="selectedSensorPoint.properties.Timestamp" :radiation ="selectedSensorPoint.properties.Radiation"></NInformation>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import NMap from '@/components/NMap.vue'
import NTimeComponent from '@/components/NTimeComponent.vue'
import NInformation from '@/components/NInformation.vue'

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
    NInformation
  },
  data () {
    return {
      // DIMENSION
      sensorType: {
        value: 'All',
        options: ['All', 'Static', 'Mobile']
      },

      // MEASURES
      numRecords: 0,
      sumRadiation: 0,
      avgRadiation: 0,

      // PROPERTIES
      timeStamp: '2020-04-06 00:00:05',
      baseTimeStamp: '2020-04-06 00:00:05',
      endTimeStamp: '2020-04-10 23:59:55',

      // OTHERS
      selectedSensorPoint: {
        properties: {
          User: '',
          Latitude: '',
          Longitude: '',
          SensorId: '',
          SensorType: '',
          Timestamp: '',
          Units: '',
          Radiation: ''
        },
        geometry: {
          coordinates: ['0','0']
        }
      },
      isSelected : false,

      // FIXME DEVELOPEMENT PURPOSES
      enableLoading: true,
      featureNumbers: 5,

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
          d['User'] = d['UserId']
        })

        cf = crossfilter(data)

        dSensorType = cf.dimension(function (d) { return d['SensorType'] })
        dTimeStamp = cf.dimension(function (d) { return d['Timestamp'] })

        dSensorType.filter('static')
        var count = dSensorType.groupAll().reduceCount().value()
        var sum = dSensorType.groupAll().reduceSum(d=>d.Radiation).value()
        console.log(sum / count)

        dSensorType.filter('mobile')
        var count1 = dSensorType.groupAll().reduceCount().value()
        var sum1 = dSensorType.groupAll().reduceSum(d=>d.Radiation).value()
        console.log(sum1 / count1)

        dSensorType.filter(null)

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
      // eslint-disable-next-line
      this.numRecords = cf.groupAll().reduceCount().value(),
      // eslint-disable-next-line
      this.sumRadiation = cf.groupAll().reduceSum(d => d.Radiation).value()
    },

    refreshMap (cfDimension) {
      this.pointCollection = this.getGeoJsonFromReports(cfDimension.top(this.featureNumbers))
    },

    refreshAll (cfDimension, filter) {
      if (cfDimension && this.enableLoading) {
        cfDimension.filter(filter)
        console.log(filter)
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
                User: d.UserId,
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

    updateSensorPoint (value) {
      this.isSelected = true
      this.selectedSensorPoint = value
      console.log(this.selectedSensorPoint.geometry.coordinates[0])
      //this.refreshAll(dTimeStamp, this.timeStamp)
    }
  },

  watch: {
    sensorType: {
      immediate: true,
      deep: true,
      handler (newValue) {
        var filter
        // eslint-disable-next-line
        if (newValue.value == 'All') {
          filter = null
        } else {
          filter = newValue.value.toString().toLowerCase()
        }

        // TODO refreshing part
        this.refreshAll(dSensorType, filter)
      }
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
