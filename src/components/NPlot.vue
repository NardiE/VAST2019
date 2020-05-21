<template>
  <vue-plotly :data="data" :layout="layout" :options="options"/>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly';

export default {
  name: 'NPlot',
  components: {
    VuePlotly,
  },
  props: {
    cfAggregation: Array,
  },
  data() {
    return {
      data: [{
         type: 'scatter',
         x: [1, 2, 3, 4, 5, 6],
         y: [2, 4, 1, 8, 6, 7],
         marker: {
            color:  'white',
            size: 8
         },
         line: {
            color:  'white',
            width: 1
         }
         // orientation: 'h',
      }],
      layout: {
         color: 'white',
         // height: 250,
         margin: {
            t: 8,
            l: 30,
            b: 8,
            r: 8,
            pad: 5,
         },
         /*yaxis: {
            type: 'category',
         }, */
         xaxis: {
            linecolor: 'white',
            linewidth: 2,
            showgrid: false,
            showline: true
         },
         yaxis: {
            linecolor: 'white',
            linewidth: 2,
            showgrid: false,
            showline: true
         },
        plot_bgcolor: '#2d2d2d',
        paper_bgcolor: 'white'
      },
      options: {
        displayModeBar: false
      },
    };
  },
  watch: {
    cfAggregation(datum) {
      this.data[0].y = datum.map(d => d.key);
      this.data[0].x = datum.map(d => d.value);
    },
  },
};
</script>