// Copyright 2017-2022, University of Colorado Boulder

/**
 * Represents a bar in a bar chart for a specific set of composite values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import Range from '../../dot/js/Range.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import { Node, Rectangle } from '../../scenery/js/imports.js';
import griddle from './griddle.js';

/**
 * @deprecated - please use BAMBOO/BarPlot
 */
class BarNode extends Node {
  /**
   * NOTE: This is provided in the "mathematical" coordinate frame, where +y is up. For visual handling, rotate it by
   * Math.PI.
   *
   * NOTE: update() should be called between when the bars change and a Display.updateDisplay(). This node does not
   * otherwise update its view.
   *
   * @param {Array.<Object>} barEntries - Objects of the type {
   *                                        property: {Property.<number>},
   *                                        color: {paint}
   *                                      }
   * @param {Property.<Range>} totalRangeProperty - Range of visual values displayed (note negative values for min are
   *                           supported).
   * @param {Object} [options]
   */
  constructor(barEntries, totalRangeProperty, options) {
    assert && assert(barEntries.length > 0);
    assert && deprecationWarning('Please use BAMBOO/BarPlot');
    options = merge({
      // {paint} - The color of the border (along the sides and top of the bar)
      borderColor: 'black',
      // {number} - Width of the border (along the sides and top of the bar)
      borderWidth: 1,
      // {number} - The visual width of the bar (excluding the stroke)
      barWidth: 15,
      // {boolean} - Whether off-scale arrows should be shown
      showOffScaleArrow: true,
      // {paint} - Fill for the off-scale arrows
      offScaleArrowFill: '#bbb',
      // {number} - Distance between the top of a bar and the bottom of the off-scale arrow
      offScaleArrowOffset: 5,
      // {paint} - If any of the bar properties are negative (and this is non-null) and we have multiple bars, this
      // color will be used instead.
      invalidBarColor: 'gray',
      // {Property.<number>} - If provided, the given entries' values will be scaled by this number before display.
      scaleProperty: new NumberProperty(1)
    }, options);
    super();

    // @private {Array.<BarProperty>}
    this.barEntries = barEntries;

    // @private {Property.<Range>}
    this.totalRangeProperty = totalRangeProperty;

    // @private
    this.borderWidth = options.borderWidth;
    this.scaleProperty = options.scaleProperty;
    this.showOffScaleArrow = options.showOffScaleArrow;
    this.offScaleArrowOffset = options.offScaleArrowOffset;
    this.invalidBarColor = options.invalidBarColor;

    // @private {Array.<Rectangle>}
    this.bars = this.barEntries.map(barEntry => {
      return new Rectangle(0, 0, options.barWidth, 0, {
        centerX: 0
      });
    });

    // @private {Rectangle}
    this.borderRectangle = new Rectangle(0, 0, options.barWidth + 2 * options.borderWidth, 0, {
      fill: options.borderColor,
      centerX: 0
    });

    // @private {ArrowNode}
    this.offScaleArrow = new ArrowNode(0, 0, 0, options.barWidth, {
      fill: options.offScaleArrowFill,
      stroke: 'black',
      headHeight: options.barWidth / 2,
      headWidth: options.barWidth,
      tailWidth: options.barWidth * 3 / 5,
      centerX: 0
    });
    const children = [this.borderRectangle].concat(this.bars);
    if (options.showOffScaleArrow) {
      children.push(this.offScaleArrow);
    }
    options.children = children;
    this.mutate(options);
    this.update();
  }

  /**
   * Updates all of the bars to the correct values.
   * @public
   */
  update() {
    const scale = this.scaleProperty.value;

    // How much of our "range" we need to take away, to be able to show an out-of-scale arrow.
    const arrowPadding = this.offScaleArrow.height + this.offScaleArrowOffset;

    // How far our actual bar rectangles can go (minimum and maximum). If our bars reach this limit (on either side),
    // an off-scale arrow will be shown.
    let effectiveRange = this.totalRangeProperty.value;

    // Reduce the effective range to compensate with the borderWidth, so we don't overshoot the range.
    effectiveRange = new Range(effectiveRange.min < 0 ? effectiveRange.min + this.borderWidth : effectiveRange.min, effectiveRange.max - this.borderWidth);
    if (this.showOffScaleArrow) {
      effectiveRange = new Range(effectiveRange.min < 0 ? effectiveRange.min + arrowPadding : effectiveRange.min, effectiveRange.max - arrowPadding);
    }

    // Total (scaled) sum of values for all bars
    let total = 0;

    // Whether we have any negative-value bars
    let hasNegative = false;

    // Check for whether we have an "invalid bar" case with the total and hasNegative
    for (let i = 0; i < this.barEntries.length; i++) {
      const value = this.barEntries[i].property.value * scale;
      if (value < 0) {
        hasNegative = true;
      }
      total += value;
    }

    // Start with the first bar at the origin.
    let currentY = 0;

    // Composite bars are represented by one bar with multiple entries stacked on top of each other.
    // If a composite bar contains an entry with a negative value, only the first entry is used to display the effective
    // range and the remaining entries are hidden. Also the color of the composite bar is updated.
    if (hasNegative && this.barEntries.length > 1) {
      // Use only the first entry to display the effective range
      currentY = effectiveRange.constrainValue(total);
      const firstBar = this.bars[0];

      // Change the color of the displayed bar.
      firstBar.fill = this.invalidBarColor;
      setBarYValues(firstBar, 0, currentY);
      firstBar.visible = true;

      // Hide the other bars
      for (let i = 1; i < this.barEntries.length; i++) {
        this.bars[i].visible = false;
      }
    } else {
      for (let i = 0; i < this.barEntries.length; i++) {
        const barEntry = this.barEntries[i];
        const bar = this.bars[i];
        bar.fill = barEntry.color;

        // The bar would be displayed between currentY and nextY
        const barValue = barEntry.property.value * scale;
        const nextY = effectiveRange.constrainValue(currentY + barValue);

        // Set the bar to the next stacked position
        if (nextY !== currentY) {
          setBarYValues(bar, currentY, nextY);
          bar.visible = true;
        }

        // Quell bars that are extremely small.
        else {
          bar.visible = false;
        }
        currentY = nextY;
      }
    }

    // Off-scale arrow visible on the top (max)
    if (currentY === effectiveRange.max) {
      this.offScaleArrow.visible = true;
      this.offScaleArrow.rotation = 0;
      this.offScaleArrow.y = effectiveRange.max + this.offScaleArrowOffset; // mathematical top
    }
    // Off-scale arrow visible on the bottom (min)
    else if (currentY === effectiveRange.min && currentY < 0) {
      this.offScaleArrow.visible = true;
      this.offScaleArrow.rotation = Math.PI;
      this.offScaleArrow.y = effectiveRange.min - this.offScaleArrowOffset; // mathematical bottom
    }
    // No off-scale arrow visible
    else {
      this.offScaleArrow.visible = false;
    }
    setBarYValues(this.borderRectangle, 0, currentY + this.borderWidth * Math.sign(currentY));
    this.borderRectangle.visible = currentY !== 0;
  }
}

/**
 * Sets a rectangle's y and height such that it goes between the two y values given.
 *
 * @param {Rectangle} rectangle
 * @param {number} y1
 * @param {number} y2
 */
function setBarYValues(rectangle, y1, y2) {
  rectangle.rectY = Math.min(y1, y2);
  rectangle.rectHeight = Math.abs(y1 - y2);
}
griddle.register('BarNode', BarNode);
export default BarNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJBcnJvd05vZGUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiZ3JpZGRsZSIsIkJhck5vZGUiLCJjb25zdHJ1Y3RvciIsImJhckVudHJpZXMiLCJ0b3RhbFJhbmdlUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwibGVuZ3RoIiwiYm9yZGVyQ29sb3IiLCJib3JkZXJXaWR0aCIsImJhcldpZHRoIiwic2hvd09mZlNjYWxlQXJyb3ciLCJvZmZTY2FsZUFycm93RmlsbCIsIm9mZlNjYWxlQXJyb3dPZmZzZXQiLCJpbnZhbGlkQmFyQ29sb3IiLCJzY2FsZVByb3BlcnR5IiwiYmFycyIsIm1hcCIsImJhckVudHJ5IiwiY2VudGVyWCIsImJvcmRlclJlY3RhbmdsZSIsImZpbGwiLCJvZmZTY2FsZUFycm93Iiwic3Ryb2tlIiwiaGVhZEhlaWdodCIsImhlYWRXaWR0aCIsInRhaWxXaWR0aCIsImNoaWxkcmVuIiwiY29uY2F0IiwicHVzaCIsIm11dGF0ZSIsInVwZGF0ZSIsInNjYWxlIiwidmFsdWUiLCJhcnJvd1BhZGRpbmciLCJoZWlnaHQiLCJlZmZlY3RpdmVSYW5nZSIsIm1pbiIsIm1heCIsInRvdGFsIiwiaGFzTmVnYXRpdmUiLCJpIiwicHJvcGVydHkiLCJjdXJyZW50WSIsImNvbnN0cmFpblZhbHVlIiwiZmlyc3RCYXIiLCJzZXRCYXJZVmFsdWVzIiwidmlzaWJsZSIsImJhciIsImNvbG9yIiwiYmFyVmFsdWUiLCJuZXh0WSIsInJvdGF0aW9uIiwieSIsIk1hdGgiLCJQSSIsInNpZ24iLCJyZWN0YW5nbGUiLCJ5MSIsInkyIiwicmVjdFkiLCJyZWN0SGVpZ2h0IiwiYWJzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBiYXIgaW4gYSBiYXIgY2hhcnQgZm9yIGEgc3BlY2lmaWMgc2V0IG9mIGNvbXBvc2l0ZSB2YWx1ZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmlkZGxlIGZyb20gJy4vZ3JpZGRsZS5qcyc7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgLSBwbGVhc2UgdXNlIEJBTUJPTy9CYXJQbG90XHJcbiAqL1xyXG5jbGFzcyBCYXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IFRoaXMgaXMgcHJvdmlkZWQgaW4gdGhlIFwibWF0aGVtYXRpY2FsXCIgY29vcmRpbmF0ZSBmcmFtZSwgd2hlcmUgK3kgaXMgdXAuIEZvciB2aXN1YWwgaGFuZGxpbmcsIHJvdGF0ZSBpdCBieVxyXG4gICAqIE1hdGguUEkuXHJcbiAgICpcclxuICAgKiBOT1RFOiB1cGRhdGUoKSBzaG91bGQgYmUgY2FsbGVkIGJldHdlZW4gd2hlbiB0aGUgYmFycyBjaGFuZ2UgYW5kIGEgRGlzcGxheS51cGRhdGVEaXNwbGF5KCkuIFRoaXMgbm9kZSBkb2VzIG5vdFxyXG4gICAqIG90aGVyd2lzZSB1cGRhdGUgaXRzIHZpZXcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxPYmplY3Q+fSBiYXJFbnRyaWVzIC0gT2JqZWN0cyBvZiB0aGUgdHlwZSB7XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IHtQcm9wZXJ0eS48bnVtYmVyPn0sXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHtwYWludH1cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFJhbmdlPn0gdG90YWxSYW5nZVByb3BlcnR5IC0gUmFuZ2Ugb2YgdmlzdWFsIHZhbHVlcyBkaXNwbGF5ZWQgKG5vdGUgbmVnYXRpdmUgdmFsdWVzIGZvciBtaW4gYXJlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0ZWQpLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYmFyRW50cmllcywgdG90YWxSYW5nZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFyRW50cmllcy5sZW5ndGggPiAwICk7XHJcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnUGxlYXNlIHVzZSBCQU1CT08vQmFyUGxvdCcgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgLy8ge3BhaW50fSAtIFRoZSBjb2xvciBvZiB0aGUgYm9yZGVyIChhbG9uZyB0aGUgc2lkZXMgYW5kIHRvcCBvZiB0aGUgYmFyKVxyXG4gICAgICBib3JkZXJDb2xvcjogJ2JsYWNrJyxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gV2lkdGggb2YgdGhlIGJvcmRlciAoYWxvbmcgdGhlIHNpZGVzIGFuZCB0b3Agb2YgdGhlIGJhcilcclxuICAgICAgYm9yZGVyV2lkdGg6IDEsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIFRoZSB2aXN1YWwgd2lkdGggb2YgdGhlIGJhciAoZXhjbHVkaW5nIHRoZSBzdHJva2UpXHJcbiAgICAgIGJhcldpZHRoOiAxNSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIFdoZXRoZXIgb2ZmLXNjYWxlIGFycm93cyBzaG91bGQgYmUgc2hvd25cclxuICAgICAgc2hvd09mZlNjYWxlQXJyb3c6IHRydWUsXHJcblxyXG4gICAgICAvLyB7cGFpbnR9IC0gRmlsbCBmb3IgdGhlIG9mZi1zY2FsZSBhcnJvd3NcclxuICAgICAgb2ZmU2NhbGVBcnJvd0ZpbGw6ICcjYmJiJyxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gRGlzdGFuY2UgYmV0d2VlbiB0aGUgdG9wIG9mIGEgYmFyIGFuZCB0aGUgYm90dG9tIG9mIHRoZSBvZmYtc2NhbGUgYXJyb3dcclxuICAgICAgb2ZmU2NhbGVBcnJvd09mZnNldDogNSxcclxuXHJcbiAgICAgIC8vIHtwYWludH0gLSBJZiBhbnkgb2YgdGhlIGJhciBwcm9wZXJ0aWVzIGFyZSBuZWdhdGl2ZSAoYW5kIHRoaXMgaXMgbm9uLW51bGwpIGFuZCB3ZSBoYXZlIG11bHRpcGxlIGJhcnMsIHRoaXNcclxuICAgICAgLy8gY29sb3Igd2lsbCBiZSB1c2VkIGluc3RlYWQuXHJcbiAgICAgIGludmFsaWRCYXJDb2xvcjogJ2dyYXknLFxyXG5cclxuICAgICAgLy8ge1Byb3BlcnR5LjxudW1iZXI+fSAtIElmIHByb3ZpZGVkLCB0aGUgZ2l2ZW4gZW50cmllcycgdmFsdWVzIHdpbGwgYmUgc2NhbGVkIGJ5IHRoaXMgbnVtYmVyIGJlZm9yZSBkaXNwbGF5LlxyXG4gICAgICBzY2FsZVByb3BlcnR5OiBuZXcgTnVtYmVyUHJvcGVydHkoIDEgKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxCYXJQcm9wZXJ0eT59XHJcbiAgICB0aGlzLmJhckVudHJpZXMgPSBiYXJFbnRyaWVzO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48UmFuZ2U+fVxyXG4gICAgdGhpcy50b3RhbFJhbmdlUHJvcGVydHkgPSB0b3RhbFJhbmdlUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYm9yZGVyV2lkdGggPSBvcHRpb25zLmJvcmRlcldpZHRoO1xyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5ID0gb3B0aW9ucy5zY2FsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5zaG93T2ZmU2NhbGVBcnJvdyA9IG9wdGlvbnMuc2hvd09mZlNjYWxlQXJyb3c7XHJcbiAgICB0aGlzLm9mZlNjYWxlQXJyb3dPZmZzZXQgPSBvcHRpb25zLm9mZlNjYWxlQXJyb3dPZmZzZXQ7XHJcbiAgICB0aGlzLmludmFsaWRCYXJDb2xvciA9IG9wdGlvbnMuaW52YWxpZEJhckNvbG9yO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48UmVjdGFuZ2xlPn1cclxuICAgIHRoaXMuYmFycyA9IHRoaXMuYmFyRW50cmllcy5tYXAoIGJhckVudHJ5ID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoIDAsIDAsIG9wdGlvbnMuYmFyV2lkdGgsIDAsIHtcclxuICAgICAgICBjZW50ZXJYOiAwXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UmVjdGFuZ2xlfVxyXG4gICAgdGhpcy5ib3JkZXJSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBvcHRpb25zLmJhcldpZHRoICsgMiAqIG9wdGlvbnMuYm9yZGVyV2lkdGgsIDAsIHtcclxuICAgICAgZmlsbDogb3B0aW9ucy5ib3JkZXJDb2xvcixcclxuICAgICAgY2VudGVyWDogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJvd05vZGV9XHJcbiAgICB0aGlzLm9mZlNjYWxlQXJyb3cgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCAwLCBvcHRpb25zLmJhcldpZHRoLCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMub2ZmU2NhbGVBcnJvd0ZpbGwsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgaGVhZEhlaWdodDogb3B0aW9ucy5iYXJXaWR0aCAvIDIsXHJcbiAgICAgIGhlYWRXaWR0aDogb3B0aW9ucy5iYXJXaWR0aCxcclxuICAgICAgdGFpbFdpZHRoOiBvcHRpb25zLmJhcldpZHRoICogMyAvIDUsXHJcbiAgICAgIGNlbnRlclg6IDBcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IFsgdGhpcy5ib3JkZXJSZWN0YW5nbGUgXS5jb25jYXQoIHRoaXMuYmFycyApO1xyXG4gICAgaWYgKCBvcHRpb25zLnNob3dPZmZTY2FsZUFycm93ICkge1xyXG4gICAgICBjaGlsZHJlbi5wdXNoKCB0aGlzLm9mZlNjYWxlQXJyb3cgKTtcclxuICAgIH1cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIGFsbCBvZiB0aGUgYmFycyB0byB0aGUgY29ycmVjdCB2YWx1ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZSgpIHtcclxuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY2FsZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIEhvdyBtdWNoIG9mIG91ciBcInJhbmdlXCIgd2UgbmVlZCB0byB0YWtlIGF3YXksIHRvIGJlIGFibGUgdG8gc2hvdyBhbiBvdXQtb2Ytc2NhbGUgYXJyb3cuXHJcbiAgICBjb25zdCBhcnJvd1BhZGRpbmcgPSB0aGlzLm9mZlNjYWxlQXJyb3cuaGVpZ2h0ICsgdGhpcy5vZmZTY2FsZUFycm93T2Zmc2V0O1xyXG5cclxuICAgIC8vIEhvdyBmYXIgb3VyIGFjdHVhbCBiYXIgcmVjdGFuZ2xlcyBjYW4gZ28gKG1pbmltdW0gYW5kIG1heGltdW0pLiBJZiBvdXIgYmFycyByZWFjaCB0aGlzIGxpbWl0IChvbiBlaXRoZXIgc2lkZSksXHJcbiAgICAvLyBhbiBvZmYtc2NhbGUgYXJyb3cgd2lsbCBiZSBzaG93bi5cclxuICAgIGxldCBlZmZlY3RpdmVSYW5nZSA9IHRoaXMudG90YWxSYW5nZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIFJlZHVjZSB0aGUgZWZmZWN0aXZlIHJhbmdlIHRvIGNvbXBlbnNhdGUgd2l0aCB0aGUgYm9yZGVyV2lkdGgsIHNvIHdlIGRvbid0IG92ZXJzaG9vdCB0aGUgcmFuZ2UuXHJcbiAgICBlZmZlY3RpdmVSYW5nZSA9IG5ldyBSYW5nZSggZWZmZWN0aXZlUmFuZ2UubWluIDwgMCA/IGVmZmVjdGl2ZVJhbmdlLm1pbiArIHRoaXMuYm9yZGVyV2lkdGggOiBlZmZlY3RpdmVSYW5nZS5taW4sIGVmZmVjdGl2ZVJhbmdlLm1heCAtIHRoaXMuYm9yZGVyV2lkdGggKTtcclxuICAgIGlmICggdGhpcy5zaG93T2ZmU2NhbGVBcnJvdyApIHtcclxuICAgICAgZWZmZWN0aXZlUmFuZ2UgPSBuZXcgUmFuZ2UoIGVmZmVjdGl2ZVJhbmdlLm1pbiA8IDAgPyBlZmZlY3RpdmVSYW5nZS5taW4gKyBhcnJvd1BhZGRpbmcgOiBlZmZlY3RpdmVSYW5nZS5taW4sXHJcbiAgICAgICAgZWZmZWN0aXZlUmFuZ2UubWF4IC0gYXJyb3dQYWRkaW5nICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVG90YWwgKHNjYWxlZCkgc3VtIG9mIHZhbHVlcyBmb3IgYWxsIGJhcnNcclxuICAgIGxldCB0b3RhbCA9IDA7XHJcblxyXG4gICAgLy8gV2hldGhlciB3ZSBoYXZlIGFueSBuZWdhdGl2ZS12YWx1ZSBiYXJzXHJcbiAgICBsZXQgaGFzTmVnYXRpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBDaGVjayBmb3Igd2hldGhlciB3ZSBoYXZlIGFuIFwiaW52YWxpZCBiYXJcIiBjYXNlIHdpdGggdGhlIHRvdGFsIGFuZCBoYXNOZWdhdGl2ZVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYXJFbnRyaWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuYmFyRW50cmllc1sgaSBdLnByb3BlcnR5LnZhbHVlICogc2NhbGU7XHJcbiAgICAgIGlmICggdmFsdWUgPCAwICkge1xyXG4gICAgICAgIGhhc05lZ2F0aXZlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICB0b3RhbCArPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdGFydCB3aXRoIHRoZSBmaXJzdCBiYXIgYXQgdGhlIG9yaWdpbi5cclxuICAgIGxldCBjdXJyZW50WSA9IDA7XHJcblxyXG4gICAgLy8gQ29tcG9zaXRlIGJhcnMgYXJlIHJlcHJlc2VudGVkIGJ5IG9uZSBiYXIgd2l0aCBtdWx0aXBsZSBlbnRyaWVzIHN0YWNrZWQgb24gdG9wIG9mIGVhY2ggb3RoZXIuXHJcbiAgICAvLyBJZiBhIGNvbXBvc2l0ZSBiYXIgY29udGFpbnMgYW4gZW50cnkgd2l0aCBhIG5lZ2F0aXZlIHZhbHVlLCBvbmx5IHRoZSBmaXJzdCBlbnRyeSBpcyB1c2VkIHRvIGRpc3BsYXkgdGhlIGVmZmVjdGl2ZVxyXG4gICAgLy8gcmFuZ2UgYW5kIHRoZSByZW1haW5pbmcgZW50cmllcyBhcmUgaGlkZGVuLiBBbHNvIHRoZSBjb2xvciBvZiB0aGUgY29tcG9zaXRlIGJhciBpcyB1cGRhdGVkLlxyXG4gICAgaWYgKCBoYXNOZWdhdGl2ZSAmJiB0aGlzLmJhckVudHJpZXMubGVuZ3RoID4gMSApIHtcclxuXHJcbiAgICAgIC8vIFVzZSBvbmx5IHRoZSBmaXJzdCBlbnRyeSB0byBkaXNwbGF5IHRoZSBlZmZlY3RpdmUgcmFuZ2VcclxuICAgICAgY3VycmVudFkgPSBlZmZlY3RpdmVSYW5nZS5jb25zdHJhaW5WYWx1ZSggdG90YWwgKTtcclxuICAgICAgY29uc3QgZmlyc3RCYXIgPSB0aGlzLmJhcnNbIDAgXTtcclxuXHJcbiAgICAgIC8vIENoYW5nZSB0aGUgY29sb3Igb2YgdGhlIGRpc3BsYXllZCBiYXIuXHJcbiAgICAgIGZpcnN0QmFyLmZpbGwgPSB0aGlzLmludmFsaWRCYXJDb2xvcjtcclxuICAgICAgc2V0QmFyWVZhbHVlcyggZmlyc3RCYXIsIDAsIGN1cnJlbnRZICk7XHJcbiAgICAgIGZpcnN0QmFyLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gSGlkZSB0aGUgb3RoZXIgYmFyc1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCB0aGlzLmJhckVudHJpZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgdGhpcy5iYXJzWyBpIF0udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYXJFbnRyaWVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGJhckVudHJ5ID0gdGhpcy5iYXJFbnRyaWVzWyBpIF07XHJcbiAgICAgICAgY29uc3QgYmFyID0gdGhpcy5iYXJzWyBpIF07XHJcbiAgICAgICAgYmFyLmZpbGwgPSBiYXJFbnRyeS5jb2xvcjtcclxuXHJcbiAgICAgICAgLy8gVGhlIGJhciB3b3VsZCBiZSBkaXNwbGF5ZWQgYmV0d2VlbiBjdXJyZW50WSBhbmQgbmV4dFlcclxuICAgICAgICBjb25zdCBiYXJWYWx1ZSA9IGJhckVudHJ5LnByb3BlcnR5LnZhbHVlICogc2NhbGU7XHJcbiAgICAgICAgY29uc3QgbmV4dFkgPSBlZmZlY3RpdmVSYW5nZS5jb25zdHJhaW5WYWx1ZSggY3VycmVudFkgKyBiYXJWYWx1ZSApO1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGJhciB0byB0aGUgbmV4dCBzdGFja2VkIHBvc2l0aW9uXHJcbiAgICAgICAgaWYgKCBuZXh0WSAhPT0gY3VycmVudFkgKSB7XHJcbiAgICAgICAgICBzZXRCYXJZVmFsdWVzKCBiYXIsIGN1cnJlbnRZLCBuZXh0WSApO1xyXG4gICAgICAgICAgYmFyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUXVlbGwgYmFycyB0aGF0IGFyZSBleHRyZW1lbHkgc21hbGwuXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBiYXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXJyZW50WSA9IG5leHRZO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT2ZmLXNjYWxlIGFycm93IHZpc2libGUgb24gdGhlIHRvcCAobWF4KVxyXG4gICAgaWYgKCBjdXJyZW50WSA9PT0gZWZmZWN0aXZlUmFuZ2UubWF4ICkge1xyXG4gICAgICB0aGlzLm9mZlNjYWxlQXJyb3cudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIHRoaXMub2ZmU2NhbGVBcnJvdy5yb3RhdGlvbiA9IDA7XHJcbiAgICAgIHRoaXMub2ZmU2NhbGVBcnJvdy55ID0gZWZmZWN0aXZlUmFuZ2UubWF4ICsgdGhpcy5vZmZTY2FsZUFycm93T2Zmc2V0OyAvLyBtYXRoZW1hdGljYWwgdG9wXHJcbiAgICB9XHJcbiAgICAvLyBPZmYtc2NhbGUgYXJyb3cgdmlzaWJsZSBvbiB0aGUgYm90dG9tIChtaW4pXHJcbiAgICBlbHNlIGlmICggY3VycmVudFkgPT09IGVmZmVjdGl2ZVJhbmdlLm1pbiAmJiBjdXJyZW50WSA8IDAgKSB7XHJcbiAgICAgIHRoaXMub2ZmU2NhbGVBcnJvdy52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5vZmZTY2FsZUFycm93LnJvdGF0aW9uID0gTWF0aC5QSTtcclxuICAgICAgdGhpcy5vZmZTY2FsZUFycm93LnkgPSBlZmZlY3RpdmVSYW5nZS5taW4gLSB0aGlzLm9mZlNjYWxlQXJyb3dPZmZzZXQ7IC8vIG1hdGhlbWF0aWNhbCBib3R0b21cclxuICAgIH1cclxuICAgIC8vIE5vIG9mZi1zY2FsZSBhcnJvdyB2aXNpYmxlXHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5vZmZTY2FsZUFycm93LnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRCYXJZVmFsdWVzKCB0aGlzLmJvcmRlclJlY3RhbmdsZSwgMCwgY3VycmVudFkgKyB0aGlzLmJvcmRlcldpZHRoICogTWF0aC5zaWduKCBjdXJyZW50WSApICk7XHJcbiAgICB0aGlzLmJvcmRlclJlY3RhbmdsZS52aXNpYmxlID0gY3VycmVudFkgIT09IDA7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2V0cyBhIHJlY3RhbmdsZSdzIHkgYW5kIGhlaWdodCBzdWNoIHRoYXQgaXQgZ29lcyBiZXR3ZWVuIHRoZSB0d28geSB2YWx1ZXMgZ2l2ZW4uXHJcbiAqXHJcbiAqIEBwYXJhbSB7UmVjdGFuZ2xlfSByZWN0YW5nbGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gKi9cclxuZnVuY3Rpb24gc2V0QmFyWVZhbHVlcyggcmVjdGFuZ2xlLCB5MSwgeTIgKSB7XHJcbiAgcmVjdGFuZ2xlLnJlY3RZID0gTWF0aC5taW4oIHkxLCB5MiApO1xyXG4gIHJlY3RhbmdsZS5yZWN0SGVpZ2h0ID0gTWF0aC5hYnMoIHkxIC0geTIgKTtcclxufVxyXG5cclxuZ3JpZGRsZS5yZWdpc3RlciggJ0Jhck5vZGUnLCBCYXJOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLGlDQUFpQztBQUM1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