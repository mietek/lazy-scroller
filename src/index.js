"use strict";

var assign = require("object-assign");
var r = require("react-wrapper");
var targetHistoryMixin = require("target-history-mixin");
var scrollerMap = r.wrap(require("./scroller-map"));
var scrollerTile = r.wrap(require("./scroller-tile"));

module.exports = {
  mixins: [targetHistoryMixin],

  propTypes: function () {
    return {
      columnCount: r.propTypes.number,
      columnWidth: r.propTypes.number,
      rowCount: r.propTypes.number,
      rowHeight: r.propTypes.number,
      tileValidity: r.propTypes.number,
      tileChild: r.propTypes.func.isRequired,
      tileChildProps: r.propTypes.object,
      initialTarget: r.propTypes.object,
      encodeTarget: r.propTypes.func,
      decodeTarget: r.propTypes.func,
      onRetarget: r.propTypes.func
    };
  },

  getDefaultProps: function () {
    return {
      columnCount: 1,
      columnWidth: 1000,
      rowCount: 1,
      rowHeight: 1000,
      tileValidity: 5,
      tileChildProps: {},
      initialTarget: {
        x: 0,
        y: 0
      }
    };
  },

  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
    var node = r.domNode(this).firstChild;
    node.addEventListener("scroll", this.onScroll);
    addEventListener("resize", this.onResize);
    var target = this.getCurrentTarget();
    if (!this.scrollTo(target)) {
      this.updateState();
    }
    if (this.props.onRetarget) {
      this.props.onRetarget(target);
    }
  },

  componentWillUnmount: function () {
    var node = r.domNode(this).firstChild;
    node.removeEventListener("scroll", this.onScroll);
    removeEventListener("resize", this.onResize);
  },

  componentDidUpdate: function (prevProps, prevState) {
    var isChanged = (
      prevState.firstVisibleColumn !== this.state.firstVisibleColumn ||
      prevState.firstVisibleRow !== this.state.firstVisibleRow);
    if (isChanged) {
      var target = {
        x: this.state.firstVisibleColumn,
        y: this.state.firstVisibleRow
      };
      this.pushTarget(target);
      if (this.props.onRetarget) {
        this.props.onRetarget(target);
      }
    }
  },

  onScroll: function (event) {
    window.requestAnimationFrame(function () {
        if (this.isMounted()) {
          this.updateState();
        }
      }.bind(this));
  },

  onResize: function (event) {
    window.requestAnimationFrame(function () {
        if (this.isMounted()) {
          var target = this.getCurrentTarget();
          if (!this.scrollTo(target)) {
            this.updateState();
          }
          if (this.props.onRetarget) {
            this.props.onRetarget(target);
          }
        }
      }.bind(this));
  },

  onPopTarget: function (target) {
    window.requestAnimationFrame(function () {
        if (this.isMounted()) {
          this.scrollTo(target);
          if (this.props.onRetarget) {
            this.props.onRetarget(target);
          }
        }
      }.bind(this));
  },

  scrollTo: function (target) {
    var node = r.domNode(this).firstChild;
    var scrollLeft = this.computeScrollLeft(node, target.x);
    var scrollTop = this.computeScrollTop(node, target.y);
    var isChanged = (
      node.scrollLeft !== scrollLeft ||
      node.scrollTop !== scrollTop);
    if (isChanged) {
      node.scrollLeft = scrollLeft;
      node.scrollTop = scrollTop;
    }
    return isChanged;
  },

  computeScrollLeft: function (node, x) {
    var maxScrollLeft = this.props.columnCount * this.props.columnWidth - node.clientWidth;
    return (
      Math.max(0,
        Math.min(
          Math.floor(x * this.props.columnWidth),
          maxScrollLeft)));
  },

  computeScrollTop: function (node, y) {
    var maxScrollTop = this.props.rowCount * this.props.rowHeight - node.clientHeight;
    return (
      Math.max(0,
        Math.min(
          Math.floor(y * this.props.rowHeight),
          maxScrollTop)));
  },

  updateState: function () {
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
    var frameWidth = (
      this.props.columnCount === 1 ? "100%" :
        this.props.columnCount * this.props.columnWidth);
    var frameHeight = (
      this.props.rowCount === 1 ? "100%" :
        this.props.rowCount * this.props.rowHeight);
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
                width: frameWidth,
                height: frameHeight,
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

r.makeComponent("Scroller", module);
