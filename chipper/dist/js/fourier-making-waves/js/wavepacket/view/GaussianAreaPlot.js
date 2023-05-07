// Copyright 2021-2023, University of Colorado Boulder

/**
 * GaussianAreaPlot fills the area below a Gaussian curve. The client is responsible for providing a data set that
 * describes a Gaussian curve, with points ordered by increasing x value. This plot converts that data set to a
 * fillable Shape by (1) ensuring that the first and last points in the Shape have y=0, and (2) calling close on
 * the Shape.
 *
 * NOTE: Despite the general-sounding name, this implementation has only been tested for Fourier: Making Waves.
 * Moving it to bamboo for general use will require further design and generalization.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class GaussianAreaPlot extends Path {
  /**
   * @param {ChartTransform} chartTransform
   * @param {Vector2[]} dataSet
   * @param {Object} [options]
   */
  constructor(chartTransform, dataSet, options) {
    options = merge({
      // Path options
      fill: 'black'
    }, options);
    super(null, options);

    // @private {ChartTransform}
    this.chartTransform = chartTransform;

    // @public {Vector2[]} if you change this directly, you are responsible for calling update
    this.dataSet = dataSet;

    // Initialize
    this.update();

    // Update when the transform changes.
    const changedListener = () => this.update();
    chartTransform.changedEmitter.addListener(changedListener);

    // @private
    this.disposeLinePlot = () => chartTransform.changedEmitter.removeListener(changedListener);
  }

  /**
   * Sets the dataSet and redraws the plot.
   * If the dataSet is mutated directly, it is the client's responsibility to call update.
   * @param {Vector2[]} dataSet
   * @public
   */
  setDataSet(dataSet) {
    this.dataSet = dataSet;
    this.update();
  }

  /**
   * Recomputes the rendered Shape.
   * @public
   */
  update() {
    assert && assert(_.every(this.dataSet, (point, index, dataSet) => point !== null // null values (gaps) are not supported
    && point.isFinite() // all points must be finite
    && (index === 0 || dataSet[index - 1].x < point.x) // x values are unique and in ascending order
    && point.y >= 0 // all y values must be >= 0
    ));

    const shape = new Shape();
    const numberOfPoints = this.dataSet.length;
    if (numberOfPoints > 0) {
      assert && assert(numberOfPoints > 1, 'at least 2 points are required to have an area under a curve');
      const firstModelPoint = this.dataSet[0];
      const lastModelPoint = this.dataSet[numberOfPoints - 1];
      let startIndex = 0;
      let viewPoint;

      // Start at y=0
      if (firstModelPoint.y === 0) {
        viewPoint = this.chartTransform.modelToViewPosition(firstModelPoint);
        shape.moveToPoint(viewPoint);
        startIndex++;
      } else {
        viewPoint = this.chartTransform.modelToViewPosition(new Vector2(firstModelPoint.x, 0));
        shape.moveToPoint(viewPoint);
      }

      // Line segments to each point in the data set
      for (let i = startIndex; i < numberOfPoints; i++) {
        viewPoint = this.chartTransform.modelToViewPosition(this.dataSet[i]);
        shape.lineToPoint(viewPoint);
      }

      // End at y=0
      if (lastModelPoint.y !== 0) {
        viewPoint = this.chartTransform.modelToViewPosition(new Vector2(lastModelPoint.x, 0));
        shape.lineToPoint(viewPoint);
      }

      // Close the Shape, so the Path can be filled.
      shape.close();
    }
    this.shape = shape;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeLinePlot();
    super.dispose();
  }
}
fourierMakingWaves.register('GaussianAreaPlot', GaussianAreaPlot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIlBhdGgiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJHYXVzc2lhbkFyZWFQbG90IiwiY29uc3RydWN0b3IiLCJjaGFydFRyYW5zZm9ybSIsImRhdGFTZXQiLCJvcHRpb25zIiwiZmlsbCIsInVwZGF0ZSIsImNoYW5nZWRMaXN0ZW5lciIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlTGluZVBsb3QiLCJyZW1vdmVMaXN0ZW5lciIsInNldERhdGFTZXQiLCJhc3NlcnQiLCJfIiwiZXZlcnkiLCJwb2ludCIsImluZGV4IiwiaXNGaW5pdGUiLCJ4IiwieSIsInNoYXBlIiwibnVtYmVyT2ZQb2ludHMiLCJsZW5ndGgiLCJmaXJzdE1vZGVsUG9pbnQiLCJsYXN0TW9kZWxQb2ludCIsInN0YXJ0SW5kZXgiLCJ2aWV3UG9pbnQiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwibW92ZVRvUG9pbnQiLCJpIiwibGluZVRvUG9pbnQiLCJjbG9zZSIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhdXNzaWFuQXJlYVBsb3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2F1c3NpYW5BcmVhUGxvdCBmaWxscyB0aGUgYXJlYSBiZWxvdyBhIEdhdXNzaWFuIGN1cnZlLiBUaGUgY2xpZW50IGlzIHJlc3BvbnNpYmxlIGZvciBwcm92aWRpbmcgYSBkYXRhIHNldCB0aGF0XHJcbiAqIGRlc2NyaWJlcyBhIEdhdXNzaWFuIGN1cnZlLCB3aXRoIHBvaW50cyBvcmRlcmVkIGJ5IGluY3JlYXNpbmcgeCB2YWx1ZS4gVGhpcyBwbG90IGNvbnZlcnRzIHRoYXQgZGF0YSBzZXQgdG8gYVxyXG4gKiBmaWxsYWJsZSBTaGFwZSBieSAoMSkgZW5zdXJpbmcgdGhhdCB0aGUgZmlyc3QgYW5kIGxhc3QgcG9pbnRzIGluIHRoZSBTaGFwZSBoYXZlIHk9MCwgYW5kICgyKSBjYWxsaW5nIGNsb3NlIG9uXHJcbiAqIHRoZSBTaGFwZS5cclxuICpcclxuICogTk9URTogRGVzcGl0ZSB0aGUgZ2VuZXJhbC1zb3VuZGluZyBuYW1lLCB0aGlzIGltcGxlbWVudGF0aW9uIGhhcyBvbmx5IGJlZW4gdGVzdGVkIGZvciBGb3VyaWVyOiBNYWtpbmcgV2F2ZXMuXHJcbiAqIE1vdmluZyBpdCB0byBiYW1ib28gZm9yIGdlbmVyYWwgdXNlIHdpbGwgcmVxdWlyZSBmdXJ0aGVyIGRlc2lnbiBhbmQgZ2VuZXJhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZvdXJpZXJNYWtpbmdXYXZlcyBmcm9tICcuLi8uLi9mb3VyaWVyTWFraW5nV2F2ZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2F1c3NpYW5BcmVhUGxvdCBleHRlbmRzIFBhdGgge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NoYXJ0VHJhbnNmb3JtfSBjaGFydFRyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMltdfSBkYXRhU2V0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFydFRyYW5zZm9ybSwgZGF0YVNldCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIFBhdGggb3B0aW9uc1xyXG4gICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG51bGwsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q2hhcnRUcmFuc2Zvcm19XHJcbiAgICB0aGlzLmNoYXJ0VHJhbnNmb3JtID0gY2hhcnRUcmFuc2Zvcm07XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMltdfSBpZiB5b3UgY2hhbmdlIHRoaXMgZGlyZWN0bHksIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdXBkYXRlXHJcbiAgICB0aGlzLmRhdGFTZXQgPSBkYXRhU2V0O1xyXG5cclxuICAgIC8vIEluaXRpYWxpemVcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHdoZW4gdGhlIHRyYW5zZm9ybSBjaGFuZ2VzLlxyXG4gICAgY29uc3QgY2hhbmdlZExpc3RlbmVyID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgIGNoYXJ0VHJhbnNmb3JtLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBjaGFuZ2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5kaXNwb3NlTGluZVBsb3QgPSAoKSA9PiBjaGFydFRyYW5zZm9ybS5jaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggY2hhbmdlZExpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBkYXRhU2V0IGFuZCByZWRyYXdzIHRoZSBwbG90LlxyXG4gICAqIElmIHRoZSBkYXRhU2V0IGlzIG11dGF0ZWQgZGlyZWN0bHksIGl0IGlzIHRoZSBjbGllbnQncyByZXNwb25zaWJpbGl0eSB0byBjYWxsIHVwZGF0ZS5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJbXX0gZGF0YVNldFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXREYXRhU2V0KCBkYXRhU2V0ICkge1xyXG4gICAgdGhpcy5kYXRhU2V0ID0gZGF0YVNldDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNvbXB1dGVzIHRoZSByZW5kZXJlZCBTaGFwZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5kYXRhU2V0LCAoIHBvaW50LCBpbmRleCwgZGF0YVNldCApID0+XHJcbiAgICAoIHBvaW50ICE9PSBudWxsICkgLy8gbnVsbCB2YWx1ZXMgKGdhcHMpIGFyZSBub3Qgc3VwcG9ydGVkXHJcbiAgICAmJiAoIHBvaW50LmlzRmluaXRlKCkgKSAvLyBhbGwgcG9pbnRzIG11c3QgYmUgZmluaXRlXHJcbiAgICAmJiAoIGluZGV4ID09PSAwIHx8IGRhdGFTZXRbIGluZGV4IC0gMSBdLnggPCBwb2ludC54ICkgLy8geCB2YWx1ZXMgYXJlIHVuaXF1ZSBhbmQgaW4gYXNjZW5kaW5nIG9yZGVyXHJcbiAgICAmJiAoIHBvaW50LnkgPj0gMCApIC8vIGFsbCB5IHZhbHVlcyBtdXN0IGJlID49IDBcclxuICAgICkgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgY29uc3QgbnVtYmVyT2ZQb2ludHMgPSB0aGlzLmRhdGFTZXQubGVuZ3RoO1xyXG4gICAgaWYgKCBudW1iZXJPZlBvaW50cyA+IDAgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlck9mUG9pbnRzID4gMSwgJ2F0IGxlYXN0IDIgcG9pbnRzIGFyZSByZXF1aXJlZCB0byBoYXZlIGFuIGFyZWEgdW5kZXIgYSBjdXJ2ZScgKTtcclxuXHJcbiAgICAgIGNvbnN0IGZpcnN0TW9kZWxQb2ludCA9IHRoaXMuZGF0YVNldFsgMCBdO1xyXG4gICAgICBjb25zdCBsYXN0TW9kZWxQb2ludCA9IHRoaXMuZGF0YVNldFsgbnVtYmVyT2ZQb2ludHMgLSAxIF07XHJcbiAgICAgIGxldCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgbGV0IHZpZXdQb2ludDtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IGF0IHk9MFxyXG4gICAgICBpZiAoIGZpcnN0TW9kZWxQb2ludC55ID09PSAwICkge1xyXG4gICAgICAgIHZpZXdQb2ludCA9IHRoaXMuY2hhcnRUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggZmlyc3RNb2RlbFBvaW50ICk7XHJcbiAgICAgICAgc2hhcGUubW92ZVRvUG9pbnQoIHZpZXdQb2ludCApO1xyXG4gICAgICAgIHN0YXJ0SW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB2aWV3UG9pbnQgPSB0aGlzLmNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIG5ldyBWZWN0b3IyKCBmaXJzdE1vZGVsUG9pbnQueCwgMCApICk7XHJcbiAgICAgICAgc2hhcGUubW92ZVRvUG9pbnQoIHZpZXdQb2ludCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMaW5lIHNlZ21lbnRzIHRvIGVhY2ggcG9pbnQgaW4gdGhlIGRhdGEgc2V0XHJcbiAgICAgIGZvciAoIGxldCBpID0gc3RhcnRJbmRleDsgaSA8IG51bWJlck9mUG9pbnRzOyBpKysgKSB7XHJcbiAgICAgICAgdmlld1BvaW50ID0gdGhpcy5jaGFydFRyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0aGlzLmRhdGFTZXRbIGkgXSApO1xyXG4gICAgICAgIHNoYXBlLmxpbmVUb1BvaW50KCB2aWV3UG9pbnQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRW5kIGF0IHk9MFxyXG4gICAgICBpZiAoIGxhc3RNb2RlbFBvaW50LnkgIT09IDAgKSB7XHJcbiAgICAgICAgdmlld1BvaW50ID0gdGhpcy5jaGFydFRyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBuZXcgVmVjdG9yMiggbGFzdE1vZGVsUG9pbnQueCwgMCApICk7XHJcbiAgICAgICAgc2hhcGUubGluZVRvUG9pbnQoIHZpZXdQb2ludCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDbG9zZSB0aGUgU2hhcGUsIHNvIHRoZSBQYXRoIGNhbiBiZSBmaWxsZWQuXHJcbiAgICAgIHNoYXBlLmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUxpbmVQbG90KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdHYXVzc2lhbkFyZWFQbG90JywgR2F1c3NpYW5BcmVhUGxvdCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUU1RCxlQUFlLE1BQU1DLGdCQUFnQixTQUFTRixJQUFJLENBQUM7RUFFakQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxjQUFjLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFHO0lBRTlDQSxPQUFPLEdBQUdQLEtBQUssQ0FBRTtNQUVmO01BQ0FRLElBQUksRUFBRTtJQUNSLENBQUMsRUFBRUQsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFLElBQUksRUFBRUEsT0FBUSxDQUFDOztJQUV0QjtJQUNBLElBQUksQ0FB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