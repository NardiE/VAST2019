const d3 = require('d3');

export default function buildingBitmap() {
  let cellSize = 7.5;
  function me(selection) {
    const gr = selection.selectAll('g.row')
      .data(selection.datum())
      .enter()
      .append('g')
      .classed('row', true)
      .attr('transform', (d, i) => `translate(0,${i * cellSize})`);

    const wallColor = d3.scaleOrdinal()
      .domain([0, 1])
      .range(['white', 'lightgray']);

    gr.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', d => wallColor(d));
  }

  me.cellSize = function _cellSize(_) {
    if (!arguments.length) return cellSize;
    cellSize = _;

    return me;
  };

  return me;
}
