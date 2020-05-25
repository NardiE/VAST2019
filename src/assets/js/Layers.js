/**
 *
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */
/* eslint-disable */ 
const d3 = require('d3');

export default function MapWithLayers() {
  let projection = d3.geoMercator();
  let scale = 120; // default value for scale
  let centerX = [119.8466,0]; // default value for centering the map X axes
  let centerY = [0, 0.1159]; // default value for centering the map Y axes
  let path;
  let minRadiation = -20;
  let maxRadiation = 2419;
  let featureClass = 'SensorType'; // define a property whose value is used as class
  let featureId = 'SensorId';

  function me(selection) {
    const boundaries = selection.node().parentNode.getBoundingClientRect();

    var myScale = d3.scaleLinear()
      .domain([minRadiation, maxRadiation])
      .range([7, 200]);

    projection = d3.geoAlbers()
      .scale(scale)
      .rotate(centerX)
      .center(centerY)
      .translate([boundaries.width / 2, boundaries.height / 2]);
      
    // FIXME add scale
    path = d3.geoPath().projection(projection).pointRadius(function(d) { 
      return myScale(d.properties.Radiation); 
    });

    // create a group container for map
    const paths = selection.selectAll('path')
      .data(selection.datum().features);

    paths.exit().remove();

    paths.enter()
      .append('path')
      .append("svg:title")
      .attr('class', 'tooltip');

    selection.selectAll('path')
      .attr('class', (d) => {
        if (d.properties[featureClass]) {
          return "data " + d.properties[featureClass];
        }
        return 'none';
      })
      .attr('id', (d) => {
        if (d.properties[featureId]) {
          return d.properties[featureId];
        }
        return 'none';
      })
      .attr('radius', (d) => {return d.properties.Radiation ? d.properties.Radiation /2 : 0;})
      .attr('d', path)
      .sort(function (a, b) { // select the parent and sort the path's
        if (+a.properties.Radiation >= +b.properties.Radiation) return -1;               // a is not the hovered element, send "a" to the back
        else return 1;                             // a is the hovered element, bring "a" to the front
      });
  }



  // getter and setter for variable scale
  me.scale = function _scale(_) {
    if (!arguments.length) return scale;
    scale = _;
    projection.scale(scale);

    return me;
  };

  // getter and setter for variable center
  me.centerX = function _centerX(_) {
    if (!arguments.length) return centerX;
    centerX = _;
    projection.rotate(centerX);
    return me;
  };

  me.centerY = function _centerY(_) {
    if (!arguments.length) return centerY;
    centerY = _;
    projection.center(centerY);
    return me;
  };

  // getter and setter for variable center
  me.featureClass = function _featureClass(_) {
    if (!arguments.length) return featureClass;
    featureClass = _;
    return me;
  };


  // getter and setter for variable center
  me.featureId= function _featureId(_) {
    if (!arguments.length) return featureId;
    featureId = _;
    return me;
  };

  //
  // getter and setter for variable center
  me.projection = function _path(_) {
    if (!arguments.length) return projection
  };

  return me;
}
