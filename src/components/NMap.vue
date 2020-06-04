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

var myScale = d3.scaleLinear()
  .domain([200, 2000])
  .range([60000, 110000]);

var scale = myScale(window.innerWidth)

console.log('SCALA: ' + scale)
console.log('WIDTH: ' + window.innerWidth)

// MAP + FEATURE LAYER
const map = MapWithLayers()
  .scale(scale)
  .featureClass('SensorType')
  .featureId('SensorId')

// TEXT LAYER
const pt = Point()
  .scale(scale)
  .featureId('SensorId')
  .featureClass('SensorType')

export default {
  name: 'NMap',
  beforeDestroy () {
    window.removeEventListener("resize", this.ResizeMap());
  },
  data() {
    return {
      // DEVELOPEMENT
      verbose: false,

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
    // USED IN THE SETUP TO DRAW COMPONENTS (USED TO HANDLE DISEAPPEARING POINTS)
    markSensor (idSensor, clas) {
      
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor
      var el = d3.select(selector)
      if (!el.empty()){
        if(this.verbose) console.log('NMAP - Marco il sensore: ' + idSensor + ' da ' + el.attr('class') +' a ' + (el.attr('class').trim() + ' ').replace('  ',' ') + clas)
      // prendo classi preesistenti e aggiungo la mia
        var classes = (el.attr('class').trim() + ' ').replace('  ',' ') + clas
        el.attr('class', classes)
        this.restoreOnClick()
      }
    },
    // USED IN THE SETUP TO DRAW COMPONENTS (USED TO HANDLE DISEAPPEARING POINTS)
    unMarkSensor (idSensor, clas) {
      var selector = idSensor == '' ? 'path#FAKEID' : 'path#' + idSensor
      var el = d3.selectAll(selector)
      if (!el.empty()){
        var classes = el.attr('class').trim().replace(clas, '').trim()
        d3.selectAll(selector).attr('class', classes)
        this.restoreOnClick()
      }
    },
    // USED IN THE SETUP TO DRAW COMPONENTS (USED TO HANDLE DISEAPPEARING POINTS)
    unMarkAllSensors(clas){
      var selector = clas == '' ? 'path#FAKEID' : 'path.' + clas
      var el = d3.selectAll(selector)
      var classes = ''
      if (!el.empty()){
        el.forEach((d) => {
          classes = d.attr('class').trim().replace(clas, '').trim()
          d.attr('class', classes)
        })
        
        this.restoreOnClick()
      }
    },

    // SETTING UP SENSORS ON MAP
    setUpSensors(){
      this.unMarkAllSensors('neighborhood')
      this.unMarkAllSensors('selected')

      if(this.selectedSensorCode != '')
        this.markSensor(this.selectedSensorCode, 'selected')
      if(this.neighborhoodSensorCodes.length > 0)
        this.neighborhoodSensorCodes.forEach((d) => {
          this.markSensor(d, 'neighborhood')
        })

      this.restoreOnClick()
    },

    // THIS IS THE RESPONSABLE TO RESTORE ON CLICK WHEN SOMETHING CHANGE
    restoreOnClick(){ 
      // USE TO HANDLE THE FACT THAT STOP PROPAGATION AND PREVENT DEFAULT NOT WORK WITH ARROW FUNCTION (NOT SO BEAUTIFUL SAVE CONTEXT)
      let self = this
      // EVENTS FOR ALL DATA
      d3  
      .selectAll('.data')
      .on("click", (d) => {
        var selected = d3
        .select('path.selected')
        if(!selected.empty()) {
        // IF I HAVE A FATHER I SELECT A NEIGHBOR (USING FATHER COMPONENT CALLBACK (PARTITIONEDPOSTER))
          this.$emit('add-neighbor', d.properties.SensorId)
        }
        else {
        // IF I HAVEN'T A FATHER I SELECT IT 
          this.$emit('add-father', d)
        }
      })
      .on("mouseenter", function (d){
        self.$emit('hover-sensor', d.properties.SensorId)
        if(this.verbose) console.log(d)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        d3.event.stopPropagation()
        d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        self.$emit('hover-sensor', '')        
        d3.event.stopPropagation();
        d3.event.preventDefault()
      })
      
      // EVENT FOR NEIGHBORS
      d3
      .selectAll('path.neighborhood')
      .on("click", (d) => {
        // REMOVE NEIGHBOR
        this.$emit('remove-neighbor', d.properties.SensorId)
      })
      .on("mouseenter", function (d){
        // I DON'T CHANGE COLOR IF IS A FATHER OR A NEIGHBOR
        self.$emit('hover-sensor', d.properties.SensorId)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        // d3.event.stopPropagation();
        // d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        self.$emit('hover-sensor', '')        
        // d3.event.stopPropagation();
        // d3.event.preventDefault()
      })

      d3
      .select('path.selected')
        .on("click", () => {
          // delete & unmark & emit
          this.$emit('remove-neighbors')
          this.$emit('remove-father')
        })
      .on("mouseenter", function (d){
        // I DON'T CHANGE COLOR IF IS A FATHER OR A NEIGHBOR
        self.$emit('hover-sensor', d.properties.SensorId)
        d3.select(this).select('title').text(function(d) {return 'Sensor Id: ' + d.properties.SensorId + ' Radiation: ' + Number(d.properties.Radiation).toFixed(2)})
        // d3.event.stopPropagation();
        // d3.event.preventDefault()
      })
      .on("mouseleave", function (){
        self.$emit('hover-sensor', '')        
        // d3.event.stopPropagation();
        // d3.event.preventDefault()
      })
      
    },
    // // THIS IS THE RESPONSABLE TO RESTORE MAP SCALE
    ResizeMap(){
      console.log("CULOOOOOOOOOOOOOOOOOOOOOOOO")
      scale = myScale(window.innerWidth)
      map.scale(scale)
      pt.scale(scale)

      const gFeatures = d3.select(this.$refs.features)
      gFeatures.call(map)
        
      const gPoint = d3.select(this.$refs.points)
      gPoint.call(pt)

      const gWorld = d3.select(this.$refs.world)
      gWorld.call(map)

      this.setUpSensors()
    }
  },
  mounted () {
    if(this.verbose) console.log('NMAP: entrato MOUNTED (FC) ')
    if(this.verbose) console.log(this.featureCollection)
    window.addEventListener("resize", this.ResizeMap);  
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
    
    this.setUpSensors()

  },
  watch: {
    featureCollection (newFC, oldFC) {
    if(this.verbose) console.log('NMAP: entrato WATCH-FC')
      // FIXED SCALE ON HOUR PURPOSES, NO NEED TO ADD A DYNAMIC ONE
      scale = myScale(window.innerWidth)
      map.scale(scale)
      pt.scale(scale)

      if(newFC !== oldFC) {

        const gFeatures = d3.select(this.$refs.features)
        gFeatures.datum(newFC)
        .call(map)
        .selectAll('.data')
        .style('fill', null)
        
        const gPoint = d3.select(this.$refs.points)
        gPoint.datum(newFC)
        .call(pt)

        const gWorld = d3.select(this.$refs.world)
        gWorld.call(map)

        this.setUpSensors()

        // the collection change so I need to re-emit the father
        var selected = d3.select('path.selected')
        if(!selected.empty()){
          var data = selected.data()[0]
          this.$emit('add-father', data)
        }
      }
    },

    selectedSensorCode (newValue, oldValue) {
      if(newValue!=null & newValue != oldValue){
        if(this.verbose) console.log('NMAP: entrato WATCH-SSC')
        // NO NEED TO CENTER MAP ACCORDING TO THE FEATURES
        scale = myScale(window.innerWidth)
        map.scale(scale)
        pt.scale(scale)

        const gWorld = d3.select(this.$refs.world)
        gWorld.call(map)
        const gPoint = d3.select(this.$refs.points)
        gPoint.call(pt)
        const gFeatures = d3.select(this.$refs.features)
        gFeatures.call(map)

        this.setUpSensors()
      }
    },

    neighborhoodSensorCodes () {
      if(this.verbose) console.log('NMAP: entrato WATCH-NSC')
      scale = myScale(window.innerWidth)
      map.scale(scale)
      pt.scale(scale)

      const gWorld = d3.select(this.$refs.world)
      gWorld.call(map)
      const gPoint = d3.select(this.$refs.points)
      gPoint.call(pt)
      const gFeatures = d3.select(this.$refs.features)
      gFeatures.call(map)

      this.setUpSensors()
    },
    hoveredSensorCode (newValue, oldValue){
      if(this.verbose) console.log('NMAP: entrato WATCH-HSC')
      // ADDED TO INTERACTION BETWEEN BAR AND MAP
      var oldSelector = 'path#' + oldValue
      var newSelector = 'path#' + newValue
      var classes = ''
      var selected

      if(oldValue != null & oldValue != '') {
        selected = d3.selectAll(oldSelector)
        if(selected != null){
          classes = selected.attr('class')
          d3.select(oldSelector).attr('class', classes.trim().replace('hover', '').trim())
        }
      }
      
      if(newValue != null & newValue != '') {
        selected = d3.selectAll(newSelector)
        if(selected != null){
          classes = selected.attr('class')
          d3.select(newSelector).attr('class', (classes.trim() + ' hover').replace('  ', ' '))
        }
      }

      this.setUpSensors()
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
  g.features path.static.hover  {
    fill: green;
  }
  g.features path.mobile.hover  {
    fill: green;
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
