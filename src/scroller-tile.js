"use strict";

var r = require("react-wrapper");

module.exports = {
  propTypes: function () {
    return {
      columnCount: r.propTypes.number.isRequired,
      columnWidth: r.propTypes.number.isRequired,
      rowCount: r.propTypes.number.isRequired,
      rowHeight: r.propTypes.number.isRequired,
      tileValidity: r.propTypes.number.isRequired,
      tileChild: r.propTypes.func.isRequired,
      x: r.propTypes.number.isRequired,
      y: r.propTypes.number.isRequired
    };
  },

  render: function () {
    var width = (
      this.props.columnCount === 1 ? "100%" :
        this.props.columnWidth);
    var height = (
      this.props.rowCount === 1 ? "100%" :
        this.props.rowHeight);
    return (
      r.div({
          className: "scroller-tile",
          style: {
            width: width,
            height: height,
            position: "absolute",
            left: this.props.x * this.props.columnWidth,
            top: this.props.y * this.props.rowHeight,
          }
        },
        this.props.tileChild(this.props)));
  }
};

r.makeComponent("ScrollerTile", module);
