// Copyright 2015-2022, University of Colorado Boulder

/**
 * This node can be used to display a pie chart
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants
const INITIAL_ANGLE = 0;
const DEFAULT_CENTER_X = 0;
const DEFAULT_CENTER_Y = 0;
class PieChartNode extends Node {
  /**
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * Values can be any amount and pie chart will size the slice based on total value of all slices
   * @param {number} radius
   */
  constructor(slices, radius) {
    super();
    this.slices = slices;
    this.radius = radius;
    this.centerXCord = DEFAULT_CENTER_X;
    this.centerYCord = DEFAULT_CENTER_Y;
    this.initialAngle = INITIAL_ANGLE;
    this.sliceEdgeCenterPoints = []; // Useful for labeling.

    // validate the radius
    assert && assert(this.radius > 0, 'Pie Chart needs a non-negative radius');

    // validate the slices value
    for (let i = 0; i < this.slices.length; i++) {
      assert && assert(this.slices[i].value >= 0, 'Pie Chart Slice needs a non-negative value');
    }
    this.update();
  }

  /**
   * Set the initial angle for drawing the pie slices.  Zero (the default) means that the first slice will start at
   * the right middle. A value of PI/2 would start at the bottom of the pie.  And so on.
   *
   * @param initialAngle - In radians.
   * @public
   */
  setInitialAngle(initialAngle) {
    this.initialAngle = initialAngle;
    this.update();
  }

  /**
   * Set the center for drawing the pie slices. ( 0, 0 ) is the default
   *
   * @param {number} centerX
   * @param {number} centerY
   * @public
   */
  setCenter(centerX, centerY) {
    this.centerXCord = centerX;
    this.centerYCord = centerY;
    this.update();
  }

  /**
   * Set the initial angle pie slices
   *
   * @param initialAngle - In radians.
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * @public
   */
  setAngleAndValues(initialAngle, slices) {
    this.initialAngle = initialAngle;
    this.slices = slices;
    this.update();
  }

  /**
   * Returns the total of each slice value
   *
   * @returns {number} total
   * @public
   */
  getTotal() {
    let total = 0;
    this.slices.forEach(slice => {
      total += slice.value;
    });
    return total;
  }

  // @private
  update() {
    this.removeAllChildren();
    this.sliceEdgeCenterPoints = [];
    const total = this.getTotal();
    if (total === 0) {
      // if there are no values then there is no chart
      return;
    }

    // Draw each pie slice
    let curValue = 0.0;
    this.slices.forEach((slice, index) => {
      // Compute the start and end angles
      const startAngle = curValue * Math.PI * 2 / total + this.initialAngle;
      let endAngle = slice.value * Math.PI * 2 / total + startAngle;

      // Ensure that rounding errors do not leave a gap between the first and last slice
      if (index === this.slices.length - 1) {
        endAngle = Math.PI * 2 + this.initialAngle;
      }

      // If the slice has a non-zero value, set the color and draw a filled arc.
      const shape = new Shape();
      if (slice.value > 0) {
        if (slice.value === total) {
          const circle = new Circle(this.radius, {
            fill: slice.color,
            stroke: slice.stroke
          });
          this.addChild(circle);
          circle.centerX = this.centerXCord;
          circle.centerY = this.centerYCord;
          // Assume, arbitrarily, that the center point is on the left side.
          this.sliceEdgeCenterPoints.push(new Vector2(this.centerXCord - this.radius, circle.centerY));
        } else {
          shape.moveTo(this.centerXCord, this.centerYCord);
          shape.arc(this.centerXCord, this.centerYCord, this.radius, startAngle, endAngle);
          shape.close();
          this.addChild(new Path(shape, {
            fill: slice.color,
            stroke: slice.stroke,
            lineWidth: slice.lineWidth
          }));
          const angle = startAngle + (endAngle - startAngle) / 2;
          this.sliceEdgeCenterPoints.push(new Vector2(Math.cos(angle) * this.radius + this.centerXCord, Math.sin(angle) * this.radius + this.centerYCord));
        }
      } else {
        // No slice drawn, so add null to indicate that there is no center point.
        this.sliceEdgeCenterPoints.push(null);
      }
      curValue += slice.value;
    });
  }

  /**
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * @public
   */
  setPieValues(slices) {
    this.slices = slices;
    this.update();
  }

  /**
   * @param {number} radius
   * @public
   */
  setRadius(radius) {
    this.radius = radius;
    this.update();
  }

  /**
   * Get the center edge point, meaning the point on the outside edge of the pie chart that represents the center, for
   * the specified slice.  This is useful for adding labels that are outside of the chart.
   *
   * @param {number} sliceNumber
   * @public
   */
  getCenterEdgePtForSlice(sliceNumber) {
    if (sliceNumber < this.sliceEdgeCenterPoints.length) {
      return this.sliceEdgeCenterPoints[sliceNumber];
    } else {
      return null;
    }
  }
}
isotopesAndAtomicMass.register('PieChartNode', PieChartNode);
export default PieChartNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJDaXJjbGUiLCJOb2RlIiwiUGF0aCIsImlzb3RvcGVzQW5kQXRvbWljTWFzcyIsIklOSVRJQUxfQU5HTEUiLCJERUZBVUxUX0NFTlRFUl9YIiwiREVGQVVMVF9DRU5URVJfWSIsIlBpZUNoYXJ0Tm9kZSIsImNvbnN0cnVjdG9yIiwic2xpY2VzIiwicmFkaXVzIiwiY2VudGVyWENvcmQiLCJjZW50ZXJZQ29yZCIsImluaXRpYWxBbmdsZSIsInNsaWNlRWRnZUNlbnRlclBvaW50cyIsImFzc2VydCIsImkiLCJsZW5ndGgiLCJ2YWx1ZSIsInVwZGF0ZSIsInNldEluaXRpYWxBbmdsZSIsInNldENlbnRlciIsImNlbnRlclgiLCJjZW50ZXJZIiwic2V0QW5nbGVBbmRWYWx1ZXMiLCJnZXRUb3RhbCIsInRvdGFsIiwiZm9yRWFjaCIsInNsaWNlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJjdXJWYWx1ZSIsImluZGV4Iiwic3RhcnRBbmdsZSIsIk1hdGgiLCJQSSIsImVuZEFuZ2xlIiwic2hhcGUiLCJjaXJjbGUiLCJmaWxsIiwiY29sb3IiLCJzdHJva2UiLCJhZGRDaGlsZCIsInB1c2giLCJtb3ZlVG8iLCJhcmMiLCJjbG9zZSIsImxpbmVXaWR0aCIsImFuZ2xlIiwiY29zIiwic2luIiwic2V0UGllVmFsdWVzIiwic2V0UmFkaXVzIiwiZ2V0Q2VudGVyRWRnZVB0Rm9yU2xpY2UiLCJzbGljZU51bWJlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGllQ2hhcnROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgbm9kZSBjYW4gYmUgdXNlZCB0byBkaXNwbGF5IGEgcGllIGNoYXJ0XHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBpc290b3Blc0FuZEF0b21pY01hc3MgZnJvbSAnLi4vLi4vaXNvdG9wZXNBbmRBdG9taWNNYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBJTklUSUFMX0FOR0xFID0gMDtcclxuY29uc3QgREVGQVVMVF9DRU5URVJfWCA9IDA7XHJcbmNvbnN0IERFRkFVTFRfQ0VOVEVSX1kgPSAwO1xyXG5cclxuY2xhc3MgUGllQ2hhcnROb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPE9iamVjdD59IHNsaWNlcyBFYWNoIHNsaWNlIGlzIGRlc2NyaWJlZCBieSBvYmplY3QgbGl0ZXJhbCB3aGljaCBsb29rcyBsaWtlIHsgdmFsdWU6IHgsIGNvbG9yOiBjb2xvciB9XHJcbiAgICogVmFsdWVzIGNhbiBiZSBhbnkgYW1vdW50IGFuZCBwaWUgY2hhcnQgd2lsbCBzaXplIHRoZSBzbGljZSBiYXNlZCBvbiB0b3RhbCB2YWx1ZSBvZiBhbGwgc2xpY2VzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzbGljZXMsIHJhZGl1cyApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnNsaWNlcyA9IHNsaWNlcztcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgdGhpcy5jZW50ZXJYQ29yZCA9IERFRkFVTFRfQ0VOVEVSX1g7XHJcbiAgICB0aGlzLmNlbnRlcllDb3JkID0gREVGQVVMVF9DRU5URVJfWTtcclxuICAgIHRoaXMuaW5pdGlhbEFuZ2xlID0gSU5JVElBTF9BTkdMRTtcclxuICAgIHRoaXMuc2xpY2VFZGdlQ2VudGVyUG9pbnRzID0gW107IC8vIFVzZWZ1bCBmb3IgbGFiZWxpbmcuXHJcblxyXG4gICAgLy8gdmFsaWRhdGUgdGhlIHJhZGl1c1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5yYWRpdXMgPiAwLCAnUGllIENoYXJ0IG5lZWRzIGEgbm9uLW5lZ2F0aXZlIHJhZGl1cycgKTtcclxuXHJcbiAgICAvLyB2YWxpZGF0ZSB0aGUgc2xpY2VzIHZhbHVlXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNsaWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zbGljZXNbIGkgXS52YWx1ZSA+PSAwLCAnUGllIENoYXJ0IFNsaWNlIG5lZWRzIGEgbm9uLW5lZ2F0aXZlIHZhbHVlJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGluaXRpYWwgYW5nbGUgZm9yIGRyYXdpbmcgdGhlIHBpZSBzbGljZXMuICBaZXJvICh0aGUgZGVmYXVsdCkgbWVhbnMgdGhhdCB0aGUgZmlyc3Qgc2xpY2Ugd2lsbCBzdGFydCBhdFxyXG4gICAqIHRoZSByaWdodCBtaWRkbGUuIEEgdmFsdWUgb2YgUEkvMiB3b3VsZCBzdGFydCBhdCB0aGUgYm90dG9tIG9mIHRoZSBwaWUuICBBbmQgc28gb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaW5pdGlhbEFuZ2xlIC0gSW4gcmFkaWFucy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0SW5pdGlhbEFuZ2xlKCBpbml0aWFsQW5nbGUgKSB7XHJcbiAgICB0aGlzLmluaXRpYWxBbmdsZSA9IGluaXRpYWxBbmdsZTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNlbnRlciBmb3IgZHJhd2luZyB0aGUgcGllIHNsaWNlcy4gKCAwLCAwICkgaXMgdGhlIGRlZmF1bHRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjZW50ZXJYXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNlbnRlcllcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0Q2VudGVyKCBjZW50ZXJYLCBjZW50ZXJZICkge1xyXG4gICAgdGhpcy5jZW50ZXJYQ29yZCA9IGNlbnRlclg7XHJcbiAgICB0aGlzLmNlbnRlcllDb3JkID0gY2VudGVyWTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGluaXRpYWwgYW5nbGUgcGllIHNsaWNlc1xyXG4gICAqXHJcbiAgICogQHBhcmFtIGluaXRpYWxBbmdsZSAtIEluIHJhZGlhbnMuXHJcbiAgICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gc2xpY2VzIEVhY2ggc2xpY2UgaXMgZGVzY3JpYmVkIGJ5IG9iamVjdCBsaXRlcmFsIHdoaWNoIGxvb2tzIGxpa2UgeyB2YWx1ZTogeCwgY29sb3I6IGNvbG9yIH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0QW5nbGVBbmRWYWx1ZXMoIGluaXRpYWxBbmdsZSwgc2xpY2VzICkge1xyXG4gICAgdGhpcy5pbml0aWFsQW5nbGUgPSBpbml0aWFsQW5nbGU7XHJcbiAgICB0aGlzLnNsaWNlcyA9IHNsaWNlcztcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0b3RhbCBvZiBlYWNoIHNsaWNlIHZhbHVlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0b3RhbFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUb3RhbCgpIHtcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIHRvdGFsICs9IHNsaWNlLnZhbHVlO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHRvdGFsO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICB1cGRhdGUoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICB0aGlzLnNsaWNlRWRnZUNlbnRlclBvaW50cyA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHRvdGFsID0gdGhpcy5nZXRUb3RhbCgpO1xyXG5cclxuICAgIGlmICggdG90YWwgPT09IDAgKSB7XHJcbiAgICAgIC8vIGlmIHRoZXJlIGFyZSBubyB2YWx1ZXMgdGhlbiB0aGVyZSBpcyBubyBjaGFydFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRHJhdyBlYWNoIHBpZSBzbGljZVxyXG4gICAgbGV0IGN1clZhbHVlID0gMC4wO1xyXG4gICAgdGhpcy5zbGljZXMuZm9yRWFjaCggKCBzbGljZSwgaW5kZXggKSA9PiB7XHJcbiAgICAgIC8vIENvbXB1dGUgdGhlIHN0YXJ0IGFuZCBlbmQgYW5nbGVzXHJcbiAgICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSBjdXJWYWx1ZSAqIE1hdGguUEkgKiAyIC8gdG90YWwgKyB0aGlzLmluaXRpYWxBbmdsZTtcclxuICAgICAgbGV0IGVuZEFuZ2xlID0gc2xpY2UudmFsdWUgKiBNYXRoLlBJICogMiAvIHRvdGFsICsgc3RhcnRBbmdsZTtcclxuXHJcbiAgICAgIC8vIEVuc3VyZSB0aGF0IHJvdW5kaW5nIGVycm9ycyBkbyBub3QgbGVhdmUgYSBnYXAgYmV0d2VlbiB0aGUgZmlyc3QgYW5kIGxhc3Qgc2xpY2VcclxuICAgICAgaWYgKCBpbmRleCA9PT0gdGhpcy5zbGljZXMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICBlbmRBbmdsZSA9IE1hdGguUEkgKiAyICsgdGhpcy5pbml0aWFsQW5nbGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIHRoZSBzbGljZSBoYXMgYSBub24temVybyB2YWx1ZSwgc2V0IHRoZSBjb2xvciBhbmQgZHJhdyBhIGZpbGxlZCBhcmMuXHJcbiAgICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICAgIGlmICggc2xpY2UudmFsdWUgPiAwICkge1xyXG4gICAgICAgIGlmICggc2xpY2UudmFsdWUgPT09IHRvdGFsICkge1xyXG4gICAgICAgICAgY29uc3QgY2lyY2xlID0gbmV3IENpcmNsZSggdGhpcy5yYWRpdXMsIHsgZmlsbDogc2xpY2UuY29sb3IsIHN0cm9rZTogc2xpY2Uuc3Ryb2tlIH0gKTtcclxuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoIGNpcmNsZSApO1xyXG4gICAgICAgICAgY2lyY2xlLmNlbnRlclggPSB0aGlzLmNlbnRlclhDb3JkO1xyXG4gICAgICAgICAgY2lyY2xlLmNlbnRlclkgPSB0aGlzLmNlbnRlcllDb3JkO1xyXG4gICAgICAgICAgLy8gQXNzdW1lLCBhcmJpdHJhcmlseSwgdGhhdCB0aGUgY2VudGVyIHBvaW50IGlzIG9uIHRoZSBsZWZ0IHNpZGUuXHJcbiAgICAgICAgICB0aGlzLnNsaWNlRWRnZUNlbnRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggdGhpcy5jZW50ZXJYQ29yZCAtIHRoaXMucmFkaXVzLCBjaXJjbGUuY2VudGVyWSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgc2hhcGUubW92ZVRvKCB0aGlzLmNlbnRlclhDb3JkLCB0aGlzLmNlbnRlcllDb3JkICk7XHJcbiAgICAgICAgICBzaGFwZS5hcmMoIHRoaXMuY2VudGVyWENvcmQsIHRoaXMuY2VudGVyWUNvcmQsIHRoaXMucmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSApO1xyXG4gICAgICAgICAgc2hhcGUuY2xvc2UoKTtcclxuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBzaGFwZSwgeyBmaWxsOiBzbGljZS5jb2xvciwgc3Ryb2tlOiBzbGljZS5zdHJva2UsIGxpbmVXaWR0aDogc2xpY2UubGluZVdpZHRoIH0gKSApO1xyXG4gICAgICAgICAgY29uc3QgYW5nbGUgPSBzdGFydEFuZ2xlICsgKCBlbmRBbmdsZSAtIHN0YXJ0QW5nbGUgKSAvIDI7XHJcbiAgICAgICAgICB0aGlzLnNsaWNlRWRnZUNlbnRlclBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggTWF0aC5jb3MoIGFuZ2xlICkgKiB0aGlzLnJhZGl1cyArIHRoaXMuY2VudGVyWENvcmQsXHJcbiAgICAgICAgICAgIE1hdGguc2luKCBhbmdsZSApICogdGhpcy5yYWRpdXMgKyB0aGlzLmNlbnRlcllDb3JkICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gTm8gc2xpY2UgZHJhd24sIHNvIGFkZCBudWxsIHRvIGluZGljYXRlIHRoYXQgdGhlcmUgaXMgbm8gY2VudGVyIHBvaW50LlxyXG4gICAgICAgIHRoaXMuc2xpY2VFZGdlQ2VudGVyUG9pbnRzLnB1c2goIG51bGwgKTtcclxuICAgICAgfVxyXG4gICAgICBjdXJWYWx1ZSArPSBzbGljZS52YWx1ZTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPE9iamVjdD59IHNsaWNlcyBFYWNoIHNsaWNlIGlzIGRlc2NyaWJlZCBieSBvYmplY3QgbGl0ZXJhbCB3aGljaCBsb29rcyBsaWtlIHsgdmFsdWU6IHgsIGNvbG9yOiBjb2xvciB9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBpZVZhbHVlcyggc2xpY2VzICkge1xyXG4gICAgdGhpcy5zbGljZXMgPSBzbGljZXM7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1c1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRSYWRpdXMoIHJhZGl1cyApIHtcclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgY2VudGVyIGVkZ2UgcG9pbnQsIG1lYW5pbmcgdGhlIHBvaW50IG9uIHRoZSBvdXRzaWRlIGVkZ2Ugb2YgdGhlIHBpZSBjaGFydCB0aGF0IHJlcHJlc2VudHMgdGhlIGNlbnRlciwgZm9yXHJcbiAgICogdGhlIHNwZWNpZmllZCBzbGljZS4gIFRoaXMgaXMgdXNlZnVsIGZvciBhZGRpbmcgbGFiZWxzIHRoYXQgYXJlIG91dHNpZGUgb2YgdGhlIGNoYXJ0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNsaWNlTnVtYmVyXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENlbnRlckVkZ2VQdEZvclNsaWNlKCBzbGljZU51bWJlciApIHtcclxuICAgIGlmICggc2xpY2VOdW1iZXIgPCB0aGlzLnNsaWNlRWRnZUNlbnRlclBvaW50cy5sZW5ndGggKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNsaWNlRWRnZUNlbnRlclBvaW50c1sgc2xpY2VOdW1iZXIgXTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmlzb3RvcGVzQW5kQXRvbWljTWFzcy5yZWdpc3RlciggJ1BpZUNoYXJ0Tm9kZScsIFBpZUNoYXJ0Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQaWVDaGFydE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQzs7QUFFbEU7QUFDQSxNQUFNQyxhQUFhLEdBQUcsQ0FBQztBQUN2QixNQUFNQyxnQkFBZ0IsR0FBRyxDQUFDO0FBQzFCLE1BQU1DLGdCQUFnQixHQUFHLENBQUM7QUFFMUIsTUFBTUMsWUFBWSxTQUFTTixJQUFJLENBQUM7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