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
    propagateSelectedSensor (node) {
      var tmp_node = null
      // var  neighbors = []
      // Node deselected
      if(node == null){
        this.fakeSensorPoint.properties.SensorId = this.selectedSensorCode
        tmp_node = this.fakeSensorPoint
      }
      else {tmp_node = node}
      this.$emit('update-sensor-point', tmp_node)
    },

    drawSelectSensor() {
    var selector = this.selectedSensorCode == '' ? 'path#FAKEID' : 'path#' + this.selectedSensorCode
      this.eraseSelectSensor()
      // FIXME change with class seleceted
      d3.selectAll(selector).style('fill', 'red').style('fill-opacity', 0.6)
      if(selector != 'path#FAKEID' ) this.propagateSelectedSensor(d3.selectAll(selector).data()[0])
      //d3.event.stopPropagation()
    },

    eraseSelectSensor() {
      d3.selectAll('.data').style('fill', null)
      //d3.event.stopPropagation()
    }
  },
  mounted () {
    var selector = this.selectedSensorCode == '' ? 'path#FAKEID' : 'path#' + this.selectedSensorCode

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

    gFeatures.datum(this.featureCollection)
      .call(map).selectAll('.data')
      .style('fill', null)
      .on("click", (d) => {
        console.log('entrato1')
        if(d.properties.SensorId == this.selectedSensorCode){
          this.fakeSensorPoint.properties.SensorId = ''
          console.log(this.fakeSensorPoint)
          this.propagateSelectedSensor(this.fakeSensorPoint)
        }
        else
          this.propagateSelectedSensor(d)
        })
      .selectAll(selector)
      .on("click", () => {
        console.log('entrato2')
        this.fakeSensorPoint.properties.SensorId = ''
        this.propagateSelectedSensor(this.fakeSensorPoint)
      })

      gPoint.datum(this.featureCollection).call(pt)

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

      this.drawSelectSensor()
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

      if(newValue!=null & newValue != oldValue) this.drawSelectSensor()
      else this.eraseSelectSensor()
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
