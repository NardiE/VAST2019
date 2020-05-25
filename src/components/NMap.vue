<template>
  <svg height="380" width="100%" class="map">
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
  .scale(110000)
  .featureClass('SensorType')
  .featureId('SensorId')

const pt = Point()
.scale(110000)
.featureId('SensorId')
.featureClass('SensorType')

export default {
  name: 'NMap',
  data() {
    return {
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
              SensorType: 'mobile',
              Radiation: 1            
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
    },
    hoveredSensorCode: {
      type: String
    }
  },
  methods: { 

    restoreOnClick(){ 
      let self = this

      d3  
      .selectAll('.data')
      .on("click", (d) => {
        // SELEZIONE PER TUTTI
        // se ho un padre seleziono i vicini
        var selected = d3
        .select('path.selected')

        if(!selected.empty()) {
          // add & mark & emit
          this.$emit('add-neighbor', d.properties.SensorId)
        }
        // se non ho un padre seleziono padre
        else {
          // push & mark & emit
          this.$emit('add-father', d)
        }
      })
      .on("mouseenter", function (d){
        d3.select(this).style('fill', 'green')
        self.$emit('hover-sensor', d.properties.SensorId)
        console.log(d)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        d3.event.stopPropagation()
        d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        
        d3.select(this).style('fill', null)
        self.$emit('hover-sensor', '')        
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })
      .attr('pointer-events', 'all')

      d3
      .selectAll('path.neighborhood')
      .on("click", (d) => {
        // pop & unmark & emit
        this.$emit('remove-neighbor', d.properties.SensorId)
      })
      .on("mouseenter", function (d){
        self.$emit('hover-sensor', d.properties.SensorId)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        self.$emit('hover-sensor', '')        
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })

      d3
      .select('path.selected')
        .on("click", () => {
          // delete & unmark & emit
          this.$emit('remove-neighbors')
          this.$emit('remove-father')
        })
      .on("mouseenter", function (d){
        self.$emit('hover-sensor', d.properties.SensorId)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        self.$emit('hover-sensor', '')        
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })
      
    },

    // markSensor
    markSensor (idSensor, clas) {
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor
      var el = d3.selectAll(selector)
      if (!el.empty()){
      // prendo classi preesistenti e aggiungo la mia
        var classes = el.attr('class') + ' ' + clas
        el.attr('class', classes)
        this.restoreOnClick()
      }
    },

    unMarkSensor (idSensor, clas) {
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor
      var el = d3.selectAll(selector)
      if (!el.empty()){
        var classes = el.attr('class').replace(clas, '')
        d3.selectAll(selector).attr('class', classes)
        this.restoreOnClick()
      }
    },

    unMarkAllSensors(clas){
      var selector = clas == '' ? 'path#FAKEID' : 'path.' + clas
      var el = d3.selectAll(selector)
      if (!el.empty()){
        var classes = el.attr('class').replace(clas, '')
        d3.selectAll(selector).attr('class', classes)
        this.restoreOnClick()
      }
    },

    setUpSensors(){
      // sistemo il selected
      this.unMarkAllSensors('neighborhood')
      this.unMarkAllSensors('selected')

      if(this.selectedSensorCode != '')
        this.markSensor(this.selectedSensorCode, 'selected')
      if(this.neighborhoodSensorCodes.length > 0)
        this.neighborhoodSensorCodes.forEach((d) => {
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
        const fWorld = {
          ...world,
          features: world.features 
        }
        gWorld.datum(fWorld)
          .call(map)
      })

    gFeatures
      .datum(this.featureCollection)
      .call(map)

    gPoint
      .datum(this.featureCollection)
      .call(pt)
    
    this.restoreOnClick()

  },
  watch: {
    featureCollection (newFC, oldFC) {

      map
      .scale(110000)

      pt
      .scale(110000)

      if(newFC !== oldFC) {
        const gFeatures = d3.select(this.$refs.features)
        gFeatures.datum(newFC)
        .call(map)
        .selectAll('.data')
        .style('fill', null)

        const gPoint = d3.select(this.$refs.points)
        gPoint.datum(newFC)
        .call(pt)
      }

      const gWorld = d3.select(this.$refs.world)
      gWorld.call(map)

      const gPoint = d3.select(this.$refs.points)
      gPoint.datum(newFC)
      .call(pt)

      this.setUpSensors()
      this.restoreOnClick()

      // the collection change so I need to re-emit the father
      var selected = d3.select('path.selected')
      if(!selected.empty()){
        var data = selected.data()[0]
        this.$emit('add-father', data)
      }
    },

    selectedSensorCode (newValue, oldValue) {
      if(newValue!=null & newValue != oldValue){
        // per centrare mappa
        map.scale(110000) // .centerX(centroidX).centerY(centroidY)
        pt.scale(110000)

        const gWorld = d3.select(this.$refs.world)
        gWorld.call(map)

        const gPoint = d3.select(this.$refs.points)
        gPoint.call(pt)

        const gFeatures = d3.select(this.$refs.features)
        gFeatures.call(map)

        this.setUpSensors()
        this.restoreOnClick()
      }
    },

    neighborhoodSensorCodes () {
      //if(newValue.length > 0){
        // per centrare mappa
        map.scale(110000) // .centerX(centroidX).centerY(centroidY)
        pt.scale(110000)

        const gWorld = d3.select(this.$refs.world)
        gWorld.call(map)

        const gPoint = d3.select(this.$refs.points)
        gPoint.call(pt)

        const gFeatures = d3.select(this.$refs.features)
        gFeatures.call(map)

        this.setUpSensors()
        this.restoreOnClick()
      // }
    },
    hoveredSensorCode (newValue, oldValue){
      // rimuovo dal vechhio ed aggiungo al nuovo
      var oldSelector = 'path#' + oldValue
      var newSelector = 'path#' + newValue
      var classes = ''
      var selected

      if(oldValue != null & oldValue != '') {
        selected = d3.selectAll(oldSelector)
        if(selected != null){
          classes = selected.attr('class')
          d3.selectAll(oldSelector).attr('class', classes.replace('hover', ''))
        }
      }
      
      if(newValue != null & newValue != '') {
        selected = d3.selectAll(newSelector)
        if(selected != null){
          classes = selected.attr('class')
          d3.selectAll(newSelector).attr('class', classes + ' hover')
        }
      }
      this.restoreOnClick()
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
    pointer-events: none;
  }

  g.features path {
    fill: black;
    stroke: black;
    stroke-width: 2px;
    fill-opacity: 0.60;
    pointer-events: all;
  }

  g.features path.static {
    fill: white;
    pointer-events: all;
  }

  g.features path.static.selected  {
    fill: red;
    pointer-events: all;
  }

  g.features path.mobile.selected  {
    fill: red;
    pointer-events: all;
  }

  g.features path.static.neighborhood  {
    fill: blue;
    pointer-events: all;
  }

  g.features path.mobile.neighborhood  {
    fill: blue;
    pointer-events: all;
  }

  g.features path.static.hover  {
    fill: green;
    pointer-events: all;
  }

  g.features path.mobile.hover  {
    fill: green;
    pointer-events: all;
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

  g.world {
    pointer-events: none;
  }

  g.world path{
    pointer-events: none;
  }

  path.none {
    pointer-events: none;
  }

  g{
    pointer-events: none;
  }
</style>
