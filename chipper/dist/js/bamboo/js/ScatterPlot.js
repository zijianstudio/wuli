// Copyright 2020-2023, University of Colorado Boulder

/**
 * Renders a dataset of Vector2[] using circles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import bamboo from './bamboo.js';

//TODO https://github.com/phetsims/bamboo/issues/63 If 'fill' and 'stroke' are different, overlapping points will not look correct.

class ScatterPlot extends Path {
  // if you change this directly, you are responsible for calling update

  constructor(chartTransform, dataSet, providedOptions) {
    const options = optionize()({
      // SelfOptions
      radius: 2,
      // Path options
      fill: 'black'
    }, providedOptions);
    super(null, options);
    this.chartTransform = chartTransform;
    this.dataSet = dataSet;
    this.radius = options.radius;

    // Initialize
    this.update();

    // Update when the transform changes.
    const changedListener = () => this.update();
    chartTransform.changedEmitter.addListener(changedListener);
    this.disposeScatterPlot = () => chartTransform.changedEmitter.removeListener(changedListener);
  }

  /**
   * Sets the dataSet and redraws the plot. If instead the dataSet array is mutated, it is the client's responsibility
   * to call `update` or make sure `update` is called elsewhere (say, if the chart scrolls in that frame).
   */
  setDataSet(dataSet) {
    this.dataSet = dataSet;
    this.update();
  }

  // Recomputes the rendered shape.
  update() {
    const shape = new Shape();
    const length = this.dataSet.length;
    for (let i = 0; i < length; i++) {
      // NaN or Infinite components draw nothing
      const dataPoint = this.dataSet[i];
      if (dataPoint.isFinite()) {
        const viewPoint = this.chartTransform.modelToViewPosition(dataPoint);
        shape.moveTo(viewPoint.x + this.radius, viewPoint.y); // need to move to where circle actually starts
        shape.circle(viewPoint.x, viewPoint.y, this.radius);
      }
    }
    this.shape = shape.makeImmutable();
  }
  dispose() {
    this.disposeScatterPlot();
    super.dispose();
  }
}
bamboo.register('ScatterPlot', ScatterPlot);
export default ScatterPlot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm9wdGlvbml6ZSIsIlBhdGgiLCJiYW1ib28iLCJTY2F0dGVyUGxvdCIsImNvbnN0cnVjdG9yIiwiY2hhcnRUcmFuc2Zvcm0iLCJkYXRhU2V0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJhZGl1cyIsImZpbGwiLCJ1cGRhdGUiLCJjaGFuZ2VkTGlzdGVuZXIiLCJjaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGlzcG9zZVNjYXR0ZXJQbG90IiwicmVtb3ZlTGlzdGVuZXIiLCJzZXREYXRhU2V0Iiwic2hhcGUiLCJsZW5ndGgiLCJpIiwiZGF0YVBvaW50IiwiaXNGaW5pdGUiLCJ2aWV3UG9pbnQiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwibW92ZVRvIiwieCIsInkiLCJjaXJjbGUiLCJtYWtlSW1tdXRhYmxlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NhdHRlclBsb3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVuZGVycyBhIGRhdGFzZXQgb2YgVmVjdG9yMltdIHVzaW5nIGNpcmNsZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IFBhdGgsIFBhdGhPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbWJvbyBmcm9tICcuL2JhbWJvby5qcyc7XHJcbmltcG9ydCBDaGFydFRyYW5zZm9ybSBmcm9tICcuL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcmFkaXVzPzogbnVtYmVyO1xyXG59O1xyXG5cclxuLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYW1ib28vaXNzdWVzLzYzIElmICdmaWxsJyBhbmQgJ3N0cm9rZScgYXJlIGRpZmZlcmVudCwgb3ZlcmxhcHBpbmcgcG9pbnRzIHdpbGwgbm90IGxvb2sgY29ycmVjdC5cclxuZXhwb3J0IHR5cGUgU2NhdHRlclBsb3RPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXRoT3B0aW9ucztcclxuXHJcbmNsYXNzIFNjYXR0ZXJQbG90IGV4dGVuZHMgUGF0aCB7XHJcbiAgcHJpdmF0ZSBjaGFydFRyYW5zZm9ybTogQ2hhcnRUcmFuc2Zvcm07XHJcblxyXG4gIC8vIGlmIHlvdSBjaGFuZ2UgdGhpcyBkaXJlY3RseSwgeW91IGFyZSByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB1cGRhdGVcclxuICBwdWJsaWMgZGF0YVNldDogVmVjdG9yMltdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmFkaXVzOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2NhdHRlclBsb3Q6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2hhcnRUcmFuc2Zvcm06IENoYXJ0VHJhbnNmb3JtLCBkYXRhU2V0OiBWZWN0b3IyW10sIHByb3ZpZGVkT3B0aW9ucz86IFNjYXR0ZXJQbG90T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjYXR0ZXJQbG90T3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhdGhPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICByYWRpdXM6IDIsXHJcblxyXG4gICAgICAvLyBQYXRoIG9wdGlvbnNcclxuICAgICAgZmlsbDogJ2JsYWNrJ1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG51bGwsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmNoYXJ0VHJhbnNmb3JtID0gY2hhcnRUcmFuc2Zvcm07XHJcblxyXG4gICAgdGhpcy5kYXRhU2V0ID0gZGF0YVNldDtcclxuXHJcbiAgICB0aGlzLnJhZGl1cyA9IG9wdGlvbnMucmFkaXVzO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemVcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHdoZW4gdGhlIHRyYW5zZm9ybSBjaGFuZ2VzLlxyXG4gICAgY29uc3QgY2hhbmdlZExpc3RlbmVyID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgIGNoYXJ0VHJhbnNmb3JtLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBjaGFuZ2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTY2F0dGVyUGxvdCA9ICgpID0+IGNoYXJ0VHJhbnNmb3JtLmNoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBjaGFuZ2VkTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGRhdGFTZXQgYW5kIHJlZHJhd3MgdGhlIHBsb3QuIElmIGluc3RlYWQgdGhlIGRhdGFTZXQgYXJyYXkgaXMgbXV0YXRlZCwgaXQgaXMgdGhlIGNsaWVudCdzIHJlc3BvbnNpYmlsaXR5XHJcbiAgICogdG8gY2FsbCBgdXBkYXRlYCBvciBtYWtlIHN1cmUgYHVwZGF0ZWAgaXMgY2FsbGVkIGVsc2V3aGVyZSAoc2F5LCBpZiB0aGUgY2hhcnQgc2Nyb2xscyBpbiB0aGF0IGZyYW1lKS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0RGF0YVNldCggZGF0YVNldDogVmVjdG9yMltdICk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhU2V0ID0gZGF0YVNldDtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBSZWNvbXB1dGVzIHRoZSByZW5kZXJlZCBzaGFwZS5cclxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuZGF0YVNldC5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIE5hTiBvciBJbmZpbml0ZSBjb21wb25lbnRzIGRyYXcgbm90aGluZ1xyXG4gICAgICBjb25zdCBkYXRhUG9pbnQgPSB0aGlzLmRhdGFTZXRbIGkgXTtcclxuICAgICAgaWYgKCBkYXRhUG9pbnQuaXNGaW5pdGUoKSApIHtcclxuICAgICAgICBjb25zdCB2aWV3UG9pbnQgPSB0aGlzLmNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGRhdGFQb2ludCApO1xyXG4gICAgICAgIHNoYXBlLm1vdmVUbyggdmlld1BvaW50LnggKyB0aGlzLnJhZGl1cywgdmlld1BvaW50LnkgKTsgLy8gbmVlZCB0byBtb3ZlIHRvIHdoZXJlIGNpcmNsZSBhY3R1YWxseSBzdGFydHNcclxuICAgICAgICBzaGFwZS5jaXJjbGUoIHZpZXdQb2ludC54LCB2aWV3UG9pbnQueSwgdGhpcy5yYWRpdXMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zaGFwZSA9IHNoYXBlLm1ha2VJbW11dGFibGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlU2NhdHRlclBsb3QoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbWJvby5yZWdpc3RlciggJ1NjYXR0ZXJQbG90JywgU2NhdHRlclBsb3QgKTtcclxuZXhwb3J0IGRlZmF1bHQgU2NhdHRlclBsb3Q7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFF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