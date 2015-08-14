"use strict";

var r = require("react-wrapper");

var TILE_SIZE = 5;
var BORDER_SIZE = 1;

module.exports = {
  propTypes: function () {
    return {
      columnCount: r.propTypes.number.isRequired,
      rowCount: r.propTypes.number.isRequired
    };
  },

  render: function () {
    return (
      r.div({
          className: "scroller-map",
          style: {
            width: this.props.columnCount * TILE_SIZE + 5 * BORDER_SIZE + "px",
            height: this.props.rowCount * TILE_SIZE + 5 * BORDER_SIZE + "px",
            position: "absolute",
            left: 2 * TILE_SIZE + "px",
            bottom: 2 * TILE_SIZE + "px",
            border: BORDER_SIZE + "px #ccc solid",
            background: "#fff",
            opacity: 0.85,
            boxSizing: "border-box"
          }
        },
        this.props.children.map(function (tile) {
            var borderColor = tile.isVisible ? "#f0690f" : "#ccc";
            return (
              r.div({
                  key: "mt-" + tile.x + "-" + tile.y,
                  className: "scroller-map-tile",
                  style: {
                    width: TILE_SIZE - BORDER_SIZE,
                    height: TILE_SIZE - BORDER_SIZE,
                    position: "absolute",
                    left: tile.x * TILE_SIZE + BORDER_SIZE + "px",
                    top: tile.y * TILE_SIZE + BORDER_SIZE + "px",
                    border: BORDER_SIZE + "px " + borderColor + " solid",
                    zIndex: tile.isVisible ? 1 : 0
                  }
                }));
          }.bind(this))));
  }
};

r.makeComponent("ScrollerMap", module);
