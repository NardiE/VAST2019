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

  function me(selection) {
    const boundaries = selection.node().parentNode.getBoundingClientRect();

    projection = d3.geoAlbers()
      .scale(100000)
      .rotate(centerX)
      .center(centerY)
      .translate([boundaries.width / 2, boundaries.height / 2]);
      
    // FIXME add scale
    path = d3.geoPath().projection(projection).pointRadius(function(d) { return d.properties.Radiation ? d.properties.Radiation /4 : 1; });

    // create a group container for map
    const paths = selection.selectAll('path')
      .data(selection.datum().features);

    paths.exit().remove();

    paths.enter()
      .append('path');

    selection.selectAll('path')
      .attr('class', (d) => {
        if (d.properties[featureClass]) {
          return d.properties[featureClass];
        }
        return 'none';
      })
      .attr('d', path);
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

  return me;
}
