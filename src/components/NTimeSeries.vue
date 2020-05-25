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
         type: 'scatter',
         x: ['01-01-2020', '02-01-2020', '03-01-2020', '04-01-2020', '05-01-2020', '06-01-2020'],
         y: [1, 8, 7, 100, 9, 22],
         text: ['M_1', 'M_1', 'M_1', 'M_1', 'M_1', 'M_1'],
         hovertemplate: '<br><b>Time</b>: %{x}<br>' +
                        '<b>Sensor</b>: %{text}<br>' +
                        '<br><i>Radiation</i>: %{y:.2f} cpm',
      },
      {
         type: 'scatter',
         x: ['01-01-2020', '02-01-2020', '03-01-2020', '04-01-2020', '05-01-2020', '06-01-2020'],
         y: [2, 4, 1, 8, 6, 7],
      }
      ],
      layout: {
        showlegend: false,
        color: 'white',
        height: 250,
        hovermode:'closest',
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
          linewidth: 2,
          showgrid: false,
          showline: false,
          showticklabels: false,
          //showmarker: false
        },
        yaxis: {
            linecolor: '#2d2d2d',
            gridcolor: '#2d2d2d',
            linewidth: 2,
            showgrid: false,
            showline: false,
            showticklabels: false
         },
        plot_bgcolor: '#2d2d2d',
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
      // this.data[0].marker.color = newVal.color;


      // this.layout.xaxis.categoryorder = 'array'
      // this.layout.xaxis.categoryarray = ordX
    },
  },
  methods: {
    hover() {
    },
    unhover() {
    },
    click(){
    }
  },
};
</script>