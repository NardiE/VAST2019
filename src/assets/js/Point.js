/**
 *
 *  This module will display a map with a symbol encoding for a set of geographical elements
 */
/* eslint-disable */ 
const d3 = require('d3');

export default function MapWithLayers() {
  let projection = d3.geoMercator();
  let scale = 100; // default value for scale
  let centerX = [119.8466,0]; // default value for centering the map X axes
  let centerY = [0, 0.1159]; // default value for centering the map Y axes
  let path;
  let featureClass = 'SensorType'; // define a property whose value is used as class
  let featureId = 'SensoreId';

  function me(selection) {
    const boundaries = selection.node().parentNode.getBoundingClientRect();

    projection = d3.geoAlbers()
      .scale(scale)
      .rotate(centerX)
      .center(centerY)
      .translate([boundaries.width / 2, boundaries.height / 2]);
      
    // FIXME add scale
    path = d3.geoPath().projection(projection).pointRadius(function(d) { return d.properties.Radiation ? d.properties.Radiation /2 : 0; });

    // create a group container for map
    const paths = selection.selectAll('text')
      .data(selection.datum().features);

    paths.exit().remove();

    paths.enter()
      .append('text');

      selection.selectAll('text')
      .attr('class', (d) => {
         if (d.properties[featureClass]) {
            return "point " + d.properties[featureClass];
          }
          return 'none';
       })
       .attr('id', (d) => {
         if (d.properties[featureId]) {
           return d.properties[featureId];
         }
         return 'none';
       })
      .attr("text-anchor", "middle")
      .text( (d) => {return d.properties[featureId][0]})
      .attr("x", (d) => {return path.centroid(d)[0]})
      .attr("y", (d) => {return path.centroid(d)[1] + 3})
      .attr("text", (d) => {return d.properties[featureId].substring(1, 1)})
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
