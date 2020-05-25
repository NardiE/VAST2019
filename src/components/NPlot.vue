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
         text: ['M1', 'S2', 'M3', 'M4', 'S5', 'M6'],
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
         // orientation: 'h',
      }],
      layout: {
         color: 'white',
         height: 250,
         margin: {
            t: 9,
            l: 9,
            b: 0,
            r: 9,
            pad: 1,
         },
         /*yaxis: {
            type: 'category',
         }, */
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
  watch: {
    cfAggregation(newVal) {

      var tmpIdx = newVal.y.map(function(e,i){return {ind: i, val: e}});
      // sort index/value couples, based on values
      tmpIdx.sort(function(a, b){return a.val > b.val ? 1 : a.val == b.val ? 0 : -1});
      // make list keeping only indices
      var idx = tmpIdx.map(function(e){return e.ind});

      var ordX = []
      idx.forEach(function (value, i) {
        ordX[i] = newVal.x[value]
      });
      this.data[0].x = newVal.x;
      this.data[0].y = newVal.y;
      this.data[0].text = newVal.text;
      this.data[0].marker.color = newVal.color;


      this.layout.xaxis.categoryorder = 'array'
      this.layout.xaxis.categoryarray = ordX
    },
  },
  methods: {
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
      console.log(infotext)
      this.$emit('click-sensor', infotext)
    }
  },
};
</script>