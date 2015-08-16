"use strict";

var assign = require("object-assign");
var r = require("react-wrapper");
var scrollerMap = r.wrap(require("./scroller-map"));
var scrollerTile = r.wrap(require("./scroller-tile"));

module.exports = {
  propTypes: function () {
    return {
      columnCount: r.propTypes.number,
      columnWidth: r.propTypes.number,
      rowCount: r.propTypes.number,
      rowHeight: r.propTypes.number,
      tileValidity: r.propTypes.number,
      tileChild: r.propTypes.func.isRequired
    };
  },

  getDefaultProps: function () {
    return {
      columnCount: 1,
      columnWidth: 1000,
      rowCount: 1,
      rowHeight: 1000,
      tileValidity: 5
    };
  },

  getInitialState: function () {
    return {
      firstVisibleColumn: 0,
      lastVisibleColumn: 0,
      firstVisibleRow: 0,
      lastVisibleRow: 0
    };
  },

  componentDidMount: function () {
    var node = r.domNode(this).firstChild;
    node.addEventListener("scroll", this.onRefresh);
    addEventListener("resize", this.onRefresh);
    this.updateTileExpiry();
  },

  componentWillUnmount: function () {
    var node = r.domNode(this).firstChild;
    node.removeEventListener("scroll", this.onRefresh);
    removeEventListener("resize", this.onRefresh);
  },

  onRefresh: function (event) {
    window.requestAnimationFrame(function () {
        if (this.isMounted()) {
          this.updateTileExpiry();
        }
      }.bind(this));
  },

  updateTileExpiry: function () {
    var tileExpiry = Date.now() + this.props.tileValidity * 1000;
    var state = this.computeTileVisibility();
    for (var x = state.firstVisibleColumn; x <= state.lastVisibleColumn; x += 1) {
      for (var y = state.firstVisibleRow; y <= state.lastVisibleRow; y += 1) {
        state["tileExpiry-" + x + "-" + y] = tileExpiry;
      }
    }
    this.setState(state);
  },

  computeTileVisibility: function () {
    var node = r.domNode(this).firstChild;
    var firstVisibleColumn = this.computeColumn(node.scrollLeft);
    var lastVisibleColumn = this.computeColumn(node.scrollLeft + node.clientWidth);
    var firstVisibleRow = this.computeRow(node.scrollTop);
    var lastVisibleRow = this.computeRow(node.scrollTop + node.clientHeight);
    return {
      firstVisibleColumn: firstVisibleColumn,
      lastVisibleColumn: lastVisibleColumn,
      firstVisibleRow: firstVisibleRow,
      lastVisibleRow: lastVisibleRow
    };
  },

  computeColumn: function (x) {
    return (
      Math.min(
        Math.floor(x / this.props.columnWidth),
        this.props.columnCount - 1));
  },

  computeRow: function (y) {
    return (
      Math.min(
        Math.floor(y / this.props.rowHeight),
        this.props.rowCount - 1));
  },

  render: function () {
    var now = Date.now();
    var tiles = [];
    var mapTiles = [];
    for (var x = 0; x < this.props.columnCount; x += 1) {
      for (var y = 0; y < this.props.rowCount; y += 1) {
        var tileExpiry = this.state["tileExpiry-" + x + "-" + y];
        if (tileExpiry > now) {
          var isTileVisible = (
            x >= this.state.firstVisibleColumn &&
            x <= this.state.lastVisibleColumn &&
            y >= this.state.firstVisibleRow &&
            y <= this.state.lastVisibleRow);
          tiles.push(
            scrollerTile(assign({}, this.props, {
                key: "t-" + x + "-" + y,
                x: x,
                y: y
              })));
          mapTiles.push({
              x: x,
              y: y,
              isVisible: isTileVisible
            });
        }
      }
    }
    return (
      r.div({
          className: "scroller",
          style: {
            width: "100%",
            height: "100%",
            position: "relative"
          }
        },
        r.div({
            className: "scroller-window",
            style: {
              width: "100%",
              height: "100%",
              overflow: "scroll",
              WebkitOverflowScrolling: "touch"
            }
          },
          r.div({
              className: "scroller-frame",
              style: {
                width: this.props.columnCount * this.props.columnWidth,
                height: this.props.rowCount * this.props.rowHeight,
                position: "relative",
                zIndex: -1
              }
            },
            tiles)),
        scrollerMap({
            columnCount: this.props.columnCount,
            rowCount: this.props.rowCount
          },
          mapTiles)));
  }
};

r.makeComponent("App", module);
