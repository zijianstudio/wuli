// Copyright 2019-2022, University of Colorado Boulder

/**
 * Comparison chart for the 'Fraction Matcher'.
 * Contains signs shapes (more, equal, less), scale, indicators.
 *
 * @author Anton Ulyanov (Mlearner)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import fractionsCommon from '../../fractionsCommon.js';

// constants
const symbolFill = '#FFFF00';
const symbolWidth = 2;
const symbolStroke = 'black';
const lineHeight = 140;
const lineWeight = 70;
const lineBaseWidth = 2;
const lineOtherWidth = 1;
const stroke = '#000';
class MatchChartNode extends Node {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    super();
    const lessShape = new Shape().moveTo(-lineWeight / 8, 0).lineTo(lineWeight / 4, -lineWeight / 8).lineTo(lineWeight / 4, -lineWeight / 4).lineTo(-lineWeight / 4, -lineWeight / 16).lineTo(-lineWeight / 4, lineWeight / 16).lineTo(lineWeight / 4, lineWeight / 4).lineTo(lineWeight / 4, lineWeight / 8).close();
    const eqShape = new Shape().moveTo(-3 * lineWeight / 8, -3 * lineWeight / 16).lineTo(3 * lineWeight / 8, -3 * lineWeight / 16).lineTo(3 * lineWeight / 8, -lineWeight / 16).lineTo(-3 * lineWeight / 8, -lineWeight / 16).lineTo(-3 * lineWeight / 8, -3 * lineWeight / 16).moveTo(-3 * lineWeight / 8, 3 * lineWeight / 16).lineTo(3 * lineWeight / 8, 3 * lineWeight / 16).lineTo(3 * lineWeight / 8, lineWeight / 16).lineTo(-3 * lineWeight / 8, lineWeight / 16).lineTo(-3 * lineWeight / 8, 3 * lineWeight / 16);

    // @private {Path}
    this.less = new Path(lessShape, {
      y: lineWeight / 4 + 10,
      stroke: symbolStroke,
      lineWidth: symbolWidth,
      fill: symbolFill
    });
    this.eq = new Path(eqShape, {
      y: lineWeight / 4 + 10,
      stroke: symbolStroke,
      lineWidth: symbolWidth,
      fill: symbolFill
    });
    this.more = new Node({
      children: [new Path(lessShape, {
        y: lineWeight / 4 + 10,
        stroke: symbolStroke,
        lineWidth: symbolWidth,
        fill: symbolFill
      })]
    });
    this.more.scale(-1, 1);

    // Maps from a value to the local view coordinate in the chart
    const mapY = y => -y * lineWeight;

    // Initial vertical line
    const thickLineShape = new Shape().moveTo(0, 0).lineTo(0, -lineHeight - 20);
    const thinLineShape = new Shape();

    // Ticks
    for (let i = 0; i <= 2; i += 0.25) {
      const y = mapY(i);
      const tickOffset = i % 1 === 0 ? lineWeight / 2 : i % 0.5 === 0 ? 3 * lineWeight / 8 : lineWeight / 4;
      const shape = i % 1 === 0 ? thickLineShape : thinLineShape;
      shape.moveTo(-tickOffset, y).lineTo(tickOffset, y);
    }
    this.addChild(new Path(thickLineShape, {
      stroke: stroke,
      lineWidth: lineBaseWidth
    }));
    this.addChild(new Path(thinLineShape, {
      stroke: stroke,
      lineWidth: lineOtherWidth
    }));

    // Labels (on each side of a tick)
    [0, 1, 2].forEach(i => {
      [-1, 1].forEach(direction => {
        this.addChild(new Text(i, {
          font: new PhetFont({
            size: 18,
            weight: 'normal'
          }),
          centerX: direction * (lineWeight / 2 + 10),
          centerY: mapY(i)
        }));
      });
    });
    const rectWidth = lineWeight / 4 * 0.6;

    // @private {Rectangle} compare rectangles
    this.rectLeft = new Rectangle(-lineWeight / 8 - rectWidth / 2, 0, rectWidth, 0, {
      stroke: stroke,
      lineWidth: lineOtherWidth,
      fill: '#F00'
    });
    this.rectRight = new Rectangle(lineWeight / 8 - rectWidth / 2, 0, rectWidth, 0, {
      stroke: stroke,
      lineWidth: lineOtherWidth,
      fill: '#0F0'
    });
    this.addChild(this.rectLeft);
    this.addChild(this.rectRight);
    this.addChild(this.less);
    this.addChild(this.eq);
    this.addChild(this.more);

    // @private {Animation|null} - Set when an animation starts
    this.animation = null;
    this.reset();
    this.mutate(options);
  }

  /**
   * Starts a comparison between two values (with the given fills).
   * @public
   *
   * @param {number} leftValue
   * @param {number} rightValue
   * @param {ColorDef} leftFill
   * @param {ColorDef} rightFill
   */
  compare(leftValue, rightValue, leftFill, rightFill) {
    this.rectLeft.fill = leftFill;
    this.rectRight.fill = rightFill;

    // Sanity check so we don't have multiple animations running at once.
    this.animation && this.animation.stop();
    this.animation = new Animation({
      duration: 0.5,
      targets: [{
        object: this.rectLeft,
        attribute: 'rectHeight',
        from: 0,
        to: leftValue * lineWeight,
        easing: Easing.CUBIC_IN_OUT
      }, {
        object: this.rectRight,
        attribute: 'rectHeight',
        from: 0,
        to: rightValue * lineWeight,
        easing: Easing.CUBIC_IN_OUT
      }, {
        object: this.rectLeft,
        attribute: 'y',
        from: 0,
        to: -leftValue * lineWeight,
        easing: Easing.CUBIC_IN_OUT
      }, {
        object: this.rectRight,
        attribute: 'y',
        from: 0,
        to: -rightValue * lineWeight,
        easing: Easing.CUBIC_IN_OUT
      }]
    });
    this.animation.start();
    this.less.visible = leftValue < rightValue;
    this.eq.visible = leftValue === rightValue;
    this.more.visible = leftValue > rightValue;
    this.visible = true;
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.animation && this.animation.step(dt);
  }

  /**
   * Resets the state
   * @public
   */
  reset() {
    this.rectLeft.y = 0;
    this.rectRight.y = 0;
    this.rectLeft.rectHeight = 0;
    this.rectRight.rectHeight = 0;
    this.less.visible = false;
    this.eq.visible = false;
    this.more.visible = false;
    this.visible = false;
  }
}
fractionsCommon.register('MatchChartNode', MatchChartNode);
export default MatchChartNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIlBoZXRGb250IiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiZnJhY3Rpb25zQ29tbW9uIiwic3ltYm9sRmlsbCIsInN5bWJvbFdpZHRoIiwic3ltYm9sU3Ryb2tlIiwibGluZUhlaWdodCIsImxpbmVXZWlnaHQiLCJsaW5lQmFzZVdpZHRoIiwibGluZU90aGVyV2lkdGgiLCJzdHJva2UiLCJNYXRjaENoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImxlc3NTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwiZXFTaGFwZSIsImxlc3MiLCJ5IiwibGluZVdpZHRoIiwiZmlsbCIsImVxIiwibW9yZSIsImNoaWxkcmVuIiwic2NhbGUiLCJtYXBZIiwidGhpY2tMaW5lU2hhcGUiLCJ0aGluTGluZVNoYXBlIiwiaSIsInRpY2tPZmZzZXQiLCJzaGFwZSIsImFkZENoaWxkIiwiZm9yRWFjaCIsImRpcmVjdGlvbiIsImZvbnQiLCJzaXplIiwid2VpZ2h0IiwiY2VudGVyWCIsImNlbnRlclkiLCJyZWN0V2lkdGgiLCJyZWN0TGVmdCIsInJlY3RSaWdodCIsImFuaW1hdGlvbiIsInJlc2V0IiwibXV0YXRlIiwiY29tcGFyZSIsImxlZnRWYWx1ZSIsInJpZ2h0VmFsdWUiLCJsZWZ0RmlsbCIsInJpZ2h0RmlsbCIsInN0b3AiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJvYmplY3QiLCJhdHRyaWJ1dGUiLCJmcm9tIiwidG8iLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJzdGFydCIsInZpc2libGUiLCJzdGVwIiwiZHQiLCJyZWN0SGVpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXRjaENoYXJ0Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJpc29uIGNoYXJ0IGZvciB0aGUgJ0ZyYWN0aW9uIE1hdGNoZXInLlxyXG4gKiBDb250YWlucyBzaWducyBzaGFwZXMgKG1vcmUsIGVxdWFsLCBsZXNzKSwgc2NhbGUsIGluZGljYXRvcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW50b24gVWx5YW5vdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IGZyYWN0aW9uc0NvbW1vbiBmcm9tICcuLi8uLi9mcmFjdGlvbnNDb21tb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHN5bWJvbEZpbGwgPSAnI0ZGRkYwMCc7XHJcbmNvbnN0IHN5bWJvbFdpZHRoID0gMjtcclxuY29uc3Qgc3ltYm9sU3Ryb2tlID0gJ2JsYWNrJztcclxuY29uc3QgbGluZUhlaWdodCA9IDE0MDtcclxuY29uc3QgbGluZVdlaWdodCA9IDcwO1xyXG5jb25zdCBsaW5lQmFzZVdpZHRoID0gMjtcclxuY29uc3QgbGluZU90aGVyV2lkdGggPSAxO1xyXG5jb25zdCBzdHJva2UgPSAnIzAwMCc7XHJcblxyXG5jbGFzcyBNYXRjaENoYXJ0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgbGVzc1NoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggLWxpbmVXZWlnaHQgLyA4LCAwIClcclxuICAgICAgLmxpbmVUbyggbGluZVdlaWdodCAvIDQsIC1saW5lV2VpZ2h0IC8gOCApXHJcbiAgICAgIC5saW5lVG8oIGxpbmVXZWlnaHQgLyA0LCAtbGluZVdlaWdodCAvIDQgKVxyXG4gICAgICAubGluZVRvKCAtbGluZVdlaWdodCAvIDQsIC1saW5lV2VpZ2h0IC8gMTYgKVxyXG4gICAgICAubGluZVRvKCAtbGluZVdlaWdodCAvIDQsIGxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5saW5lVG8oIGxpbmVXZWlnaHQgLyA0LCBsaW5lV2VpZ2h0IC8gNCApXHJcbiAgICAgIC5saW5lVG8oIGxpbmVXZWlnaHQgLyA0LCBsaW5lV2VpZ2h0IC8gOCApLmNsb3NlKCk7XHJcblxyXG4gICAgY29uc3QgZXFTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIC0zICogbGluZVdlaWdodCAvIDgsIC0zICogbGluZVdlaWdodCAvIDE2IClcclxuICAgICAgLmxpbmVUbyggMyAqIGxpbmVXZWlnaHQgLyA4LCAtMyAqIGxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5saW5lVG8oIDMgKiBsaW5lV2VpZ2h0IC8gOCwgLWxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5saW5lVG8oIC0zICogbGluZVdlaWdodCAvIDgsIC1saW5lV2VpZ2h0IC8gMTYgKVxyXG4gICAgICAubGluZVRvKCAtMyAqIGxpbmVXZWlnaHQgLyA4LCAtMyAqIGxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5tb3ZlVG8oIC0zICogbGluZVdlaWdodCAvIDgsIDMgKiBsaW5lV2VpZ2h0IC8gMTYgKVxyXG4gICAgICAubGluZVRvKCAzICogbGluZVdlaWdodCAvIDgsIDMgKiBsaW5lV2VpZ2h0IC8gMTYgKVxyXG4gICAgICAubGluZVRvKCAzICogbGluZVdlaWdodCAvIDgsIGxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5saW5lVG8oIC0zICogbGluZVdlaWdodCAvIDgsIGxpbmVXZWlnaHQgLyAxNiApXHJcbiAgICAgIC5saW5lVG8oIC0zICogbGluZVdlaWdodCAvIDgsIDMgKiBsaW5lV2VpZ2h0IC8gMTYgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGF0aH1cclxuICAgIHRoaXMubGVzcyA9IG5ldyBQYXRoKCBsZXNzU2hhcGUsIHtcclxuICAgICAgeTogbGluZVdlaWdodCAvIDQgKyAxMCxcclxuICAgICAgc3Ryb2tlOiBzeW1ib2xTdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogc3ltYm9sV2lkdGgsXHJcbiAgICAgIGZpbGw6IHN5bWJvbEZpbGxcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZXEgPSBuZXcgUGF0aCggZXFTaGFwZSwge1xyXG4gICAgICB5OiBsaW5lV2VpZ2h0IC8gNCArIDEwLFxyXG4gICAgICBzdHJva2U6IHN5bWJvbFN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBzeW1ib2xXaWR0aCxcclxuICAgICAgZmlsbDogc3ltYm9sRmlsbFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tb3JlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUGF0aCggbGVzc1NoYXBlLCB7XHJcbiAgICAgICAgICB5OiBsaW5lV2VpZ2h0IC8gNCArIDEwLFxyXG4gICAgICAgICAgc3Ryb2tlOiBzeW1ib2xTdHJva2UsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IHN5bWJvbFdpZHRoLFxyXG4gICAgICAgICAgZmlsbDogc3ltYm9sRmlsbFxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm1vcmUuc2NhbGUoIC0xLCAxICk7XHJcblxyXG4gICAgLy8gTWFwcyBmcm9tIGEgdmFsdWUgdG8gdGhlIGxvY2FsIHZpZXcgY29vcmRpbmF0ZSBpbiB0aGUgY2hhcnRcclxuICAgIGNvbnN0IG1hcFkgPSB5ID0+IC15ICogbGluZVdlaWdodDtcclxuXHJcbiAgICAvLyBJbml0aWFsIHZlcnRpY2FsIGxpbmVcclxuICAgIGNvbnN0IHRoaWNrTGluZVNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkubGluZVRvKCAwLCAtbGluZUhlaWdodCAtIDIwICk7XHJcbiAgICBjb25zdCB0aGluTGluZVNoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgLy8gVGlja3NcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSAyOyBpICs9IDAuMjUgKSB7XHJcbiAgICAgIGNvbnN0IHkgPSBtYXBZKCBpICk7XHJcbiAgICAgIGNvbnN0IHRpY2tPZmZzZXQgPSAoIGkgJSAxID09PSAwICkgPyBsaW5lV2VpZ2h0IC8gMiA6ICggKCBpICUgMC41ID09PSAwICkgPyAzICogbGluZVdlaWdodCAvIDggOiBsaW5lV2VpZ2h0IC8gNCApO1xyXG4gICAgICBjb25zdCBzaGFwZSA9ICggaSAlIDEgPT09IDAgKSA/IHRoaWNrTGluZVNoYXBlIDogdGhpbkxpbmVTaGFwZTtcclxuICAgICAgc2hhcGUubW92ZVRvKCAtdGlja09mZnNldCwgeSApLmxpbmVUbyggdGlja09mZnNldCwgeSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCB0aGlja0xpbmVTaGFwZSwge1xyXG4gICAgICBzdHJva2U6IHN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBsaW5lQmFzZVdpZHRoXHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCB0aGluTGluZVNoYXBlLCB7XHJcbiAgICAgIHN0cm9rZTogc3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IGxpbmVPdGhlcldpZHRoXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBMYWJlbHMgKG9uIGVhY2ggc2lkZSBvZiBhIHRpY2spXHJcbiAgICBbIDAsIDEsIDIgXS5mb3JFYWNoKCBpID0+IHtcclxuICAgICAgWyAtMSwgMSBdLmZvckVhY2goIGRpcmVjdGlvbiA9PiB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFRleHQoIGksIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCwgd2VpZ2h0OiAnbm9ybWFsJyB9ICksXHJcbiAgICAgICAgICBjZW50ZXJYOiBkaXJlY3Rpb24gKiAoIGxpbmVXZWlnaHQgLyAyICsgMTAgKSxcclxuICAgICAgICAgIGNlbnRlclk6IG1hcFkoIGkgKVxyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVjdFdpZHRoID0gbGluZVdlaWdodCAvIDQgKiAwLjY7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1JlY3RhbmdsZX0gY29tcGFyZSByZWN0YW5nbGVzXHJcbiAgICB0aGlzLnJlY3RMZWZ0ID0gbmV3IFJlY3RhbmdsZSggLWxpbmVXZWlnaHQgLyA4IC0gcmVjdFdpZHRoIC8gMiwgMCwgcmVjdFdpZHRoLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogc3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IGxpbmVPdGhlcldpZHRoLFxyXG4gICAgICBmaWxsOiAnI0YwMCdcclxuICAgIH0gKTtcclxuICAgIHRoaXMucmVjdFJpZ2h0ID0gbmV3IFJlY3RhbmdsZSggbGluZVdlaWdodCAvIDggLSByZWN0V2lkdGggLyAyLCAwLCByZWN0V2lkdGgsIDAsIHtcclxuICAgICAgc3Ryb2tlOiBzdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogbGluZU90aGVyV2lkdGgsXHJcbiAgICAgIGZpbGw6ICcjMEYwJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucmVjdExlZnQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucmVjdFJpZ2h0ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmxlc3MgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZXEgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubW9yZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBbmltYXRpb258bnVsbH0gLSBTZXQgd2hlbiBhbiBhbmltYXRpb24gc3RhcnRzXHJcbiAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFydHMgYSBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyAod2l0aCB0aGUgZ2l2ZW4gZmlsbHMpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0VmFsdWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmlnaHRWYWx1ZVxyXG4gICAqIEBwYXJhbSB7Q29sb3JEZWZ9IGxlZnRGaWxsXHJcbiAgICogQHBhcmFtIHtDb2xvckRlZn0gcmlnaHRGaWxsXHJcbiAgICovXHJcbiAgY29tcGFyZSggbGVmdFZhbHVlLCByaWdodFZhbHVlLCBsZWZ0RmlsbCwgcmlnaHRGaWxsICkge1xyXG4gICAgdGhpcy5yZWN0TGVmdC5maWxsID0gbGVmdEZpbGw7XHJcbiAgICB0aGlzLnJlY3RSaWdodC5maWxsID0gcmlnaHRGaWxsO1xyXG5cclxuICAgIC8vIFNhbml0eSBjaGVjayBzbyB3ZSBkb24ndCBoYXZlIG11bHRpcGxlIGFuaW1hdGlvbnMgcnVubmluZyBhdCBvbmNlLlxyXG4gICAgdGhpcy5hbmltYXRpb24gJiYgdGhpcy5hbmltYXRpb24uc3RvcCgpO1xyXG5cclxuICAgIHRoaXMuYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBkdXJhdGlvbjogMC41LFxyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgb2JqZWN0OiB0aGlzLnJlY3RMZWZ0LFxyXG4gICAgICAgICAgYXR0cmlidXRlOiAncmVjdEhlaWdodCcsXHJcbiAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgdG86IGxlZnRWYWx1ZSAqIGxpbmVXZWlnaHQsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG9iamVjdDogdGhpcy5yZWN0UmlnaHQsXHJcbiAgICAgICAgICBhdHRyaWJ1dGU6ICdyZWN0SGVpZ2h0JyxcclxuICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICB0bzogcmlnaHRWYWx1ZSAqIGxpbmVXZWlnaHQsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG9iamVjdDogdGhpcy5yZWN0TGVmdCxcclxuICAgICAgICAgIGF0dHJpYnV0ZTogJ3knLFxyXG4gICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgIHRvOiAtbGVmdFZhbHVlICogbGluZVdlaWdodCxcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgb2JqZWN0OiB0aGlzLnJlY3RSaWdodCxcclxuICAgICAgICAgIGF0dHJpYnV0ZTogJ3knLFxyXG4gICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgIHRvOiAtcmlnaHRWYWx1ZSAqIGxpbmVXZWlnaHQsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYW5pbWF0aW9uLnN0YXJ0KCk7XHJcblxyXG4gICAgdGhpcy5sZXNzLnZpc2libGUgPSBsZWZ0VmFsdWUgPCByaWdodFZhbHVlO1xyXG4gICAgdGhpcy5lcS52aXNpYmxlID0gbGVmdFZhbHVlID09PSByaWdodFZhbHVlO1xyXG4gICAgdGhpcy5tb3JlLnZpc2libGUgPSBsZWZ0VmFsdWUgPiByaWdodFZhbHVlO1xyXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuYW5pbWF0aW9uICYmIHRoaXMuYW5pbWF0aW9uLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIHN0YXRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZWN0TGVmdC55ID0gMDtcclxuICAgIHRoaXMucmVjdFJpZ2h0LnkgPSAwO1xyXG4gICAgdGhpcy5yZWN0TGVmdC5yZWN0SGVpZ2h0ID0gMDtcclxuICAgIHRoaXMucmVjdFJpZ2h0LnJlY3RIZWlnaHQgPSAwO1xyXG5cclxuICAgIHRoaXMubGVzcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmVxLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMubW9yZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ01hdGNoQ2hhcnROb2RlJywgTWF0Y2hDaGFydE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWF0Y2hDaGFydE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMvRSxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjs7QUFFdEQ7QUFDQSxNQUFNQyxVQUFVLEdBQUcsU0FBUztBQUM1QixNQUFNQyxXQUFXLEdBQUcsQ0FBQztBQUNyQixNQUFNQyxZQUFZLEdBQUcsT0FBTztBQUM1QixNQUFNQyxVQUFVLEdBQUcsR0FBRztBQUN0QixNQUFNQyxVQUFVLEdBQUcsRUFBRTtBQUNyQixNQUFNQyxhQUFhLEdBQUcsQ0FBQztBQUN2QixNQUFNQyxjQUFjLEdBQUcsQ0FBQztBQUN4QixNQUFNQyxNQUFNLEdBQUcsTUFBTTtBQUVyQixNQUFNQyxjQUFjLFNBQVNmLElBQUksQ0FBQztFQUNoQztBQUNGO0FBQ0E7RUFDRWdCLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQixLQUFLLENBQUMsQ0FBQztJQUVQLE1BQU1DLFNBQVMsR0FBRyxJQUFJcEIsS0FBSyxDQUFDLENBQUMsQ0FDMUJxQixNQUFNLENBQUUsQ0FBQ1IsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDNUJTLE1BQU0sQ0FBRVQsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDQSxVQUFVLEdBQUcsQ0FBRSxDQUFDLENBQ3pDUyxNQUFNLENBQUVULFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQ0EsVUFBVSxHQUFHLENBQUUsQ0FBQyxDQUN6Q1MsTUFBTSxDQUFFLENBQUNULFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQ0EsVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUMzQ1MsTUFBTSxDQUFFLENBQUNULFVBQVUsR0FBRyxDQUFDLEVBQUVBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDMUNTLE1BQU0sQ0FBRVQsVUFBVSxHQUFHLENBQUMsRUFBRUEsVUFBVSxHQUFHLENBQUUsQ0FBQyxDQUN4Q1MsTUFBTSxDQUFFVCxVQUFVLEdBQUcsQ0FBQyxFQUFFQSxVQUFVLEdBQUcsQ0FBRSxDQUFDLENBQUNVLEtBQUssQ0FBQyxDQUFDO0lBRW5ELE1BQU1DLE9BQU8sR0FBRyxJQUFJeEIsS0FBSyxDQUFDLENBQUMsQ0FDeEJxQixNQUFNLENBQUUsQ0FBQyxDQUFDLEdBQUdSLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUdBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDbkRTLE1BQU0sQ0FBRSxDQUFDLEdBQUdULFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUdBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDbERTLE1BQU0sQ0FBRSxDQUFDLEdBQUdULFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQ0EsVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUM5Q1MsTUFBTSxDQUFFLENBQUMsQ0FBQyxHQUFHVCxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUNBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDL0NTLE1BQU0sQ0FBRSxDQUFDLENBQUMsR0FBR1QsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBR0EsVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUNuRFEsTUFBTSxDQUFFLENBQUMsQ0FBQyxHQUFHUixVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBR0EsVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUNsRFMsTUFBTSxDQUFFLENBQUMsR0FBR1QsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUdBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDakRTLE1BQU0sQ0FBRSxDQUFDLEdBQUdULFVBQVUsR0FBRyxDQUFDLEVBQUVBLFVBQVUsR0FBRyxFQUFHLENBQUMsQ0FDN0NTLE1BQU0sQ0FBRSxDQUFDLENBQUMsR0FBR1QsVUFBVSxHQUFHLENBQUMsRUFBRUEsVUFBVSxHQUFHLEVBQUcsQ0FBQyxDQUM5Q1MsTUFBTSxDQUFFLENBQUMsQ0FBQyxHQUFHVCxVQUFV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