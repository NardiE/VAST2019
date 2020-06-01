<template>
  <vue-plotly @click="click" @hover="hover" @unhover="unhover" style="overflow:auto;" :data="data" :layout="layout" :options="options"/>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly';

export default {
  name: 'NPlot',
  components: {
    VuePlotly,
  },
  props: {
    cfAggregation: Object,
  },
  data() {
    return {
      data: [{
         type: 'bar',
         x: ['M1', 'S2', 'M3', 'M4', 'S5', 'M6'],
         y: [2, 4, 1, 8, 6, 7],
         name: '',
         // TEXT USED TO STORE MEASUREMENT UNITS
         text: ['cpm', 'cpm', 'cpm', 'cpm', 'cpm', 'cpm'],
         hovertemplate: '<br><b>Sensor</b>: %{x}<br>' +
                        '<i>Radiation</i>: %{y:.2f} %{text}',
         marker: {
            color:  ['white', 'white', 'white', 'white', 'white', 'white'],
            line: {
              color: '#2d2d2d',
              width: 2
            },
            // size: 8
         },
         line: {
            color:  '#2d2d2d',
            width: 0
         }
      }],
      layout: {
         color: 'white',
         height: 250,
         margin: {
            t: 6,
            l: 6,
            b: 6,
            r: 6,
            pad: 1,
         },
         xaxis: {
            linecolor: '#2d2d2d',
            gridcolor: '#2d2d2d',
            categoryorder: 'array',
            categoryarray: [],
            linewidth: 2,
            showgrid: false,
            showline: false,
            showticklabels: false,
            showmarker: false
         },
         yaxis: {
            linecolor: '#2d2d2d',
            gridcolor: '#2d2d2d',
            linewidth: 2,
            showgrid: false,
            showline: false,
            showticklabels: false
         },
        plot_bgcolor: 'rgba(45,45,45,0.4)',
        paper_bgcolor: 'white'
      },
      options: {
        displayModeBar: false,
        showSendToCloud:true,
        
        scrollZoom: false
      },
    };
  },
  mounted () {
    if(this.cfAggregation){
      // TO HANDLE WATCH BEFORE MOUNTED
      this.refreshChart (this.cfAggregation)
    }
  },
  watch: {
    cfAggregation(newVal) {
      this.refreshChart (newVal)
    },
  },
  methods: {
    // EVENT CALLS CALLBACK TO PARENT (PARTITIONEDPOSTER)
    hover(data) {
      var infotext = data.points.map(function(d){
        return (d.x);
      })
      this.$emit('hover-sensor', infotext)
    },
    unhover() {
      this.$emit('hover-sensor', '')
    },
    click(data){
      var infotext = data.points.map(function(d){
        return (d.x);
      })
      var sensor = data.points.map(function(d){
        return (d.data.node);
      })
      var index = data.points.map(function(d){
        return (d.pointIndex);
      })
      this.$emit('click-sensor', infotext, sensor[0][index[0]])
    },
    refreshChart (newVal) {
      // SORT X BASED ON Y VALUES
      var myData = [...this.data]

      var tmpIdx = newVal.y.map(function(e,i){return {ind: i, val: e}});
      tmpIdx.sort(function(a, b){return a.val > b.val ? 1 : a.val == b.val ? 0 : -1});
      var idx = tmpIdx.map(function(e){return e.ind});
      var ordX = []
      idx.forEach(function (value, i) {
        ordX[i] = newVal.x[value]
      });
      // USINF CATEGORICYORDER TO DO THIS
      this.layout.xaxis.categoryorder = 'array'
      this.layout.xaxis.categoryarray = ordX

      myData[0].x = newVal.x;
      myData[0].y = newVal.y;
      myData[0].text = newVal.text;
      myData[0].marker.color = newVal.color;
      myData[0].node = newVal.node
      this.data = myData      
    }

  },
};
</script>