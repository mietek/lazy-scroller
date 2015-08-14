"use strict";

var r = require("react-wrapper");

module.exports = {
  propTypes: function () {
    return {
      columnWidth: r.propTypes.number.isRequired,
      rowHeight: r.propTypes.number.isRequired,
      tileChild: r.propTypes.func.isRequired,
      x: r.propTypes.number.isRequired,
      y: r.propTypes.number.isRequired
    };
  },

  render: function () {
    return (
      r.div({
          className: "scroller-tile",
          style: {
            width: this.props.columnWidth,
            height: this.props.rowHeight,
            position: "absolute",
            left: this.props.x * this.props.columnWidth,
            top: this.props.y * this.props.rowHeight,
          }
        },
        this.props.tileChild({
            x: this.props.x,
            y: this.props.y
          })));
  }
};

r.makeComponent("ScrollerTile", module);
