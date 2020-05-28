<template>
  <vue-plotly @click="click" style="overflow:auto;" :data="data" :layout="layout" :options="options"/>
</template>

<script>
import VuePlotly from '@statnett/vue-plotly';

export default {
  name: 'NTimeSeries',
  components: {
    VuePlotly,
  },
  props: {
    cfAggregation: Object,
  },
  data() {
    return {
      data: [{
      }
      ],
      layout: {
        height: 800,
        autosize: true,
        showlegend: false,
        color: 'white',
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
          showmarker: true
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
        
        scrollZoom: false,
        
        // responsive: true
        //
      },
      config: {
      }
    };
  },
  watch: {
    cfAggregation(newVal) {
      var i = 0
      var myData = [{}]
      for (var val in newVal)
      {
        myData[i] = {
          x:[], 
          y:[], 
          text:[], 
          type: 'scatter',
          hovertemplate: '<br><b>Time</b>: %{x}<br>' +
                          '<b>Sensor</b>: %{text}<br>' +
                          '<br><i>Radiation</i>: %{y:.2f} cpm',
          name: '',
          
          mode: 'lines+markers',
          marker: {
            color:  'white',
            symbol: 'circle-dot',
            line: {
              color: '#2d2d2d',
              width: 1
            },
            size: 9
          },
          line: {
            color:  'white',
            width: 1
         }
        }
        var tmpIdx = newVal[val].y.map(function(e,i){return {ind: i, val: e}});
        // sort index/value couples, based on values
        tmpIdx.sort(function(a, b){return a.val > b.val ? 1 : a.val == b.val ? 0 : -1});
        // make list keeping only indices
        var idx = tmpIdx.map(function(e){return e.ind});

        var ordX = []
        idx.forEach(function (value, i) {
          ordX[i] = newVal[val].x[value]
        });

        myData[i].x = newVal[val].x;
        myData[i].y = newVal[val].y;
        myData[i].text = newVal[val].text;
        myData[i].node = newVal[val].node
        myData[i].marker.symbol = newVal[val].symbol

        i += 1
      }

      // Updating directly internal data does not trigger redraw
      this.data = myData
    },
  },
  methods: {
    click(data){
      var timestamp = data.points.map(function(d){
        return (d.x + ':00');
      })
      var sensor = data.points.map(function(d){
        return (d.data.node);
      })
      this.$emit('click-inside',timestamp, sensor)
    }
  },
};
</script>