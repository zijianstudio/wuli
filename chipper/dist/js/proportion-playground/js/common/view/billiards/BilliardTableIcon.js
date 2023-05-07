// Copyright 2016-2022, University of Colorado Boulder

/**
 * This shows an iconic representation of a billiards table.  It is non-dynamic and simplified.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node, Rectangle } from '../../../../../scenery/js/imports.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundColors from '../ProportionPlaygroundColors.js';
class BilliardTableIcon extends Node {
  /**
   * @param {number} width - the width of the icon
   * @param {number} height - the height of the icon (called length in the model)
   * @param {Object} [options] - node options
   */
  constructor(width, height, options) {
    const inset = width * 0.15;
    super({
      children: [new Rectangle(-inset, -inset, width, height, {
        fill: ProportionPlaygroundColors.billiardsBorderProperty,
        cornerRadius: inset
      }), new Rectangle(0, 0, width - inset * 2, height - inset * 2, {
        fill: ProportionPlaygroundColors.billiardsInsideProperty
      })]
    });
    this.mutate(options);
  }
}
proportionPlayground.register('BilliardTableIcon', BilliardTableIcon);
export default BilliardTableIcon;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiUmVjdGFuZ2xlIiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJQcm9wb3J0aW9uUGxheWdyb3VuZENvbG9ycyIsIkJpbGxpYXJkVGFibGVJY29uIiwiY29uc3RydWN0b3IiLCJ3aWR0aCIsImhlaWdodCIsIm9wdGlvbnMiLCJpbnNldCIsImNoaWxkcmVuIiwiZmlsbCIsImJpbGxpYXJkc0JvcmRlclByb3BlcnR5IiwiY29ybmVyUmFkaXVzIiwiYmlsbGlhcmRzSW5zaWRlUHJvcGVydHkiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJpbGxpYXJkVGFibGVJY29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgc2hvd3MgYW4gaWNvbmljIHJlcHJlc2VudGF0aW9uIG9mIGEgYmlsbGlhcmRzIHRhYmxlLiAgSXQgaXMgbm9uLWR5bmFtaWMgYW5kIHNpbXBsaWZpZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzIGZyb20gJy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLmpzJztcclxuXHJcbmNsYXNzIEJpbGxpYXJkVGFibGVJY29uIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gdGhlIHdpZHRoIG9mIHRoZSBpY29uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIHRoZSBoZWlnaHQgb2YgdGhlIGljb24gKGNhbGxlZCBsZW5ndGggaW4gdGhlIG1vZGVsKVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBub2RlIG9wdGlvbnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggd2lkdGgsIGhlaWdodCwgb3B0aW9ucyApIHtcclxuICAgIGNvbnN0IGluc2V0ID0gd2lkdGggKiAwLjE1O1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUmVjdGFuZ2xlKCAtaW5zZXQsIC1pbnNldCwgd2lkdGgsIGhlaWdodCwge1xyXG4gICAgICAgICAgZmlsbDogUHJvcG9ydGlvblBsYXlncm91bmRDb2xvcnMuYmlsbGlhcmRzQm9yZGVyUHJvcGVydHksXHJcbiAgICAgICAgICBjb3JuZXJSYWRpdXM6IGluc2V0XHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIHdpZHRoIC0gaW5zZXQgKiAyLCBoZWlnaHQgLSBpbnNldCAqIDIsIHtcclxuICAgICAgICAgIGZpbGw6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29sb3JzLmJpbGxpYXJkc0luc2lkZVByb3BlcnR5XHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ0JpbGxpYXJkVGFibGVJY29uJywgQmlsbGlhcmRUYWJsZUljb24gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJpbGxpYXJkVGFibGVJY29uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLEVBQUVDLFNBQVMsUUFBUSxzQ0FBc0M7QUFDdEUsT0FBT0Msb0JBQW9CLE1BQU0sa0NBQWtDO0FBQ25FLE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQztBQUV6RSxNQUFNQyxpQkFBaUIsU0FBU0osSUFBSSxDQUFDO0VBQ25DO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUNwQyxNQUFNQyxLQUFLLEdBQUdILEtBQUssR0FBRyxJQUFJO0lBQzFCLEtBQUssQ0FBRTtNQUNMSSxRQUFRLEVBQUUsQ0FDUixJQUFJVCxTQUFTLENBQUUsQ0FBQ1EsS0FBSyxFQUFFLENBQUNBLEtBQUssRUFBRUgsS0FBSyxFQUFFQyxNQUFNLEVBQUU7UUFDNUNJLElBQUksRUFBRVIsMEJBQTBCLENBQUNTLHVCQUF1QjtRQUN4REMsWUFBWSxFQUFFSjtNQUNoQixDQUFFLENBQUMsRUFDSCxJQUFJUixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUssS0FBSyxHQUFHRyxLQUFLLEdBQUcsQ0FBQyxFQUFFRixNQUFNLEdBQUdFLEtBQUssR0FBRyxDQUFDLEVBQUU7UUFDMURFLElBQUksRUFBRVIsMEJBQTBCLENBQUNXO01BQ25DLENBQUUsQ0FBQztJQUVQLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MsTUFBTSxDQUFFUCxPQUFRLENBQUM7RUFDeEI7QUFDRjtBQUVBTixvQkFBb0IsQ0FBQ2MsUUFBUSxDQUFFLG1CQUFtQixFQUFFWixpQkFBa0IsQ0FBQztBQUV2RSxlQUFlQSxpQkFBaUIifQ==