<template>
  <svg height="500" width="100%" class="map">
    <g class="world" ref="world"></g>
    <g class="features" ref="features"></g>
    <g class="points" ref="points"></g>
  </svg>
</template>

<script>
import MapWithLayers from '@/assets/js/Layers'
import Point from '@/assets/js/Point'

const d3 = require('d3')

const map = MapWithLayers()
  .scale(140000)
  .featureClass('SensorType')
  .featureId('SensorId') // component to handle the map

const pt = Point()
.scale(140000)
.featureId('SensorId')
.featureClass('SensorType')

export default {
  name: 'NMap',
  data() {
    return {
      fakeSensorPoint: {
        properties: {
          SensorId: 'Not Defined',
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
    }
  },
  props: {
    featureCollection: {
      type: Object,
      default: () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              SensorType: 'mobile'
            },
            geometry: {
              type: 'Point',
              coordinates: [0, 0]
            }
          }
        ]
      })
    },
    selectedSensorCode: {
      type: String
    },
    neighborhoodSensorCodes: {
      type: Array
    }
  },
  methods: { 

    restoreOnClick(){ 
      d3  
      .selectAll('.data')
      .on("click", (d) => {
        // SELEZIONE PER TUTTI

        // se ho un padre seleziono i vicini
        var selected = d3
        .select('path.selected')

        if(!selected.empty()) {
          // add & mark & emit
          this.markSensor(d.properties.SensorId, 'neighborhood');
          this.sendBackSensors()
        }
        // se non ho un padre seleziono padre
        else {
          // push & mark & emit
          this.markSensor(d.properties.SensorId, 'selected');
          this.sendBackSensors()
        }
      })

      d3
      .selectAll('path.neighborhood')
      .on("click", (d) => {
      // pop & unmark & emit
        this.unMarkSensor(d.properties.SensorId, 'neighborhood');
        this.sendBackSensors()
      })

      d3
      .select('path.selected')
        .on("click", (d) => {
          // delete & unmark & emit
          this.deleteNeighborhoods()
          this.unMarkSensor(d.properties.SensorId, 'selected');
          this.sendBackSensors()
        })

    },

    // markSensor
    markSensor (idSensor, clas) {
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor
      // prendo classi preesistenti e aggiungo la mia
      var myClasses = d3.selectAll(selector).attr('class')

      console.log(idSensor)
      d3.selectAll(selector).attr('class', myClasses + ' ' + clas)
      this.restoreOnClick()
    },

    unMarkSensor (idSensor, clas) {
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor

      // prendo classi preesistenti e aggiungo la mia
      var classes = d3.selectAll(selector).attr('class').replace(clas, '')

      d3.selectAll(selector).attr('class', classes)
      this.restoreOnClick()
    },

    deleteNeighborhoods(){
      var neigh = d3.select('.neighborhood')
      if(!neigh.empty()){
        var classes = neigh.attr('class').replace('neighborhood', '')
        d3.selectAll('.neighborhood').attr('class', classes)
      }
    },

    sendBackSensors () {
      // seleziono il padre se esiste, se non esiste mando il fakeSensor
      var node = d3.select('.selected').empty() ? this.fakeSensorPoint : d3.select('.selected').data()[0]

      // seleziono i vicini se esistono, array di array 
      var neigh = []
      
      d3.selectAll('.neighborhood').data().forEach ( (d) => {
        neigh.push(d.properties.SensorId)
      })
      console.log()
      console.log(neigh)
      console.log()
      this.$emit('update-sensor-point', node, neigh)
    },

    setUpSensors(){
      // sistemo il selected
      if(this.selectedSensorCode != '')
        this.markSensor(this.selectedSensorCode, 'selected')
      if(this.neighborhoodSensorCodes != null)
        this.neighborhoodSensorCodes.forEach((d) => {
          console.log(d)
          this.markSensor(d, 'neighborhood')
        })

      this.restoreOnClick()
    }
  },
  mounted () {

    const gWorld = d3.select(this.$refs.world)
    const gFeatures = d3.select(this.$refs.features)
    const gPoint = d3.select(this.$refs.points)

    d3.json('data/StHimark.json')
      .then((world) => {
        // removing Antartide since there is a problem with the contour geometry
        const fWorld = {
          ...world,
          features: world.features // .filter(d => d.properties.CNTR_ID !== 'AQ')
        }
        gWorld.datum(fWorld)
          .call(map)
      })

    gFeatures
      .datum(this.featureCollection)
      .call(map)

    gPoint.datum(this.featureCollection).call(pt)
    
    this.restoreOnClick()

  },
  watch: {
    featureCollection (newFC, oldFC) {
      // var selector = this.selectedSensorCode == '' ? 'path#FAKEID' : 'path#' + this.selectedSensorCode
      //const extentX = d3.extent(newFC.features, d => d.geometry.coordinates[0])
      //const extentY = d3.extent(newFC.features, d => d.geometry.coordinates[1])
      // const centroidY = [0, (extentY[0] + extentY[1]) / 2]
      // const centroidX = [-((extentX[0] + extentX[1]) / 2), 0]

      // const extentX = d3.extent(newFC.features, d => d.geometry.coordinates[0])

      map // .centerX(centroidX).centerY(centroidY)
      .scale(140000)

      pt
      .scale(140000)

      if(newFC !== oldFC) {
        const gFeatures = d3.select(this.$refs.features)
        gFeatures.datum(newFC)
        .call(map)
        .selectAll('.data')
        .style('fill', null)
      }

      const gWorld = d3.select(this.$refs.world)
      gWorld.call(map)

      const gPoint = d3.select(this.$refs.points)
      gPoint.datum(newFC)
      .call(pt)

      this.setUpSensors()
      
      this.restoreOnClick()
    },

    selectedSensorCode (newValue, oldValue) {
      map // .centerX(centroidX).centerY(centroidY)
        .scale(140000)
      pt
        .scale(140000)

      const gWorld = d3.select(this.$refs.world)
      gWorld.call(map)

      const gPoint = d3.select(this.$refs.points)
      gPoint.call(pt)

      const gFeatures = d3.select(this.$refs.features)
      gFeatures.call(map)

      if(newValue!=null & newValue != oldValue){ 
        this.setUpSensors()
        this.restoreOnClick()
      }
    }
  }
}
</script>
<style>
  svg.map{
    background-color: #2d2d2d;
  }

  g.world path{
    fill: white;
    stroke: black;
  }

  g.features path {
    fill: black;
    stroke: black;
    stroke-width: 2px;
    fill-opacity: 0.60;
  }

  g.features path.static {
    fill: white;
  }

  g.features path.static.selected  {
    fill: red;
  }

  g.features path.mobile.selected  {
    fill: red;
  }

  g.features path.static.neighborhood  {
    fill: blue;
  }

  g.features path.mobile.neighborhood  {
    fill: blue;
  }

  g.points text.point {
    cursor: pointer; /* decoration */
    pointer-events: none; /* let thru all cursor events */
    fill: white;
    font-size: 10px;
    stroke-width: 1px;
  }

  g.points text.static {
    fill: black;
    stroke: black;
    font-size: 10px;
  }
</style>
