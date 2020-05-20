<template>
  <svg height="500" width="100%" class="map">
    <g class="world" ref="world"></g>
    <g class="features" ref="features"></g>
  </svg>
</template>

<script>
import MapWithLayers from '@/assets/js/Layers'

const d3 = require('d3')

const map = MapWithLayers()
  .featureClass('SensorType')
  .featureId('SensorId') // component to handle the map

export default {
  name: 'NMap',
  data() {
    return {
      mobile: []
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
    }
  },
  methods: {
    select(index, node) {
      console.log(index)
      console.log(node)
    }
  },
  mounted () {
    const gWorld = d3.select(this.$refs.world)
    const gFeatures = d3.select(this.$refs.features)
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
        this.$emit('update-sensor-point', d)
        d3.selectAll('.data').style('fill', null)
        d3.selectAll('#' + d.properties.SensorId).style('fill', 'black')
        d3.event.stopPropagation()
      })
  },
  watch: {
    featureCollection (newFC) {
      // const extentX = d3.extent(newFC.features, d => d.geometry.coordinates[0])
      // const extentY = d3.extent(newFC.features, d => d.geometry.coordinates[1])
      // const centroidY = [0, (extentY[0] + extentY[1]) / 2]
      // const centroidX = [-((extentX[0] + extentX[1]) / 2), 0]
      map // .centerX(centroidX).centerY(centroidY)
        .scale(100000)

      const gFeatures = d3.select(this.$refs.features)
      this.mobile = gFeatures.datum(newFC)
      .call(map)
      .selectAll('.data')
      .style('fill', null)
      .on("click", (d) => {
        this.$emit('update-sensor-point', d)
        d3.selectAll('.data').style('fill', null)
        d3.selectAll('#' + d.properties.SensorId).style('fill', 'black')
        d3.event.stopPropagation()
      })
      const gWorld = d3.select(this.$refs.world)
      this.mobile =  gWorld.call(map).call()

    }
  }
}
</script>
<style>
  svg.map{
    background-color: lightcyan;
  }

  g.world path{
    fill: lightgray;
  }

  g.features path {
    fill: green;
    fill-opacity: 0.60;
  }

  g.features path.static {
    fill: red;
  }
</style>
