// Copyright 2022-2023, University of Colorado Boulder

/**
 * Logic that handles the creation and disposal of model-view pairs.
 *
 * This is helpful to use in cases where you've got to track model-view pairs, and you want to make sure that
 * the view is created/removed when the corresponding model element is created/removed.
 *
 * @author Agustín Vallejo
 * @author Jonathan Olson
 */

import sceneryPhet from './sceneryPhet.js';
export default class ViewSynchronizer {
  /**
   * @param container - The node that will contain the views.
   * @param factory - A function that creates a view for a given model.
   */
  constructor(container, factory) {
    this.map = new Map();
    this.container = container;
    this.factory = factory;
  }
  add(model) {
    const modelView = this.factory(model);
    this.map.set(model, modelView);
    this.container.addChild(modelView);
  }
  remove(model) {
    const modelView = this.map.get(model);
    this.map.delete(model);
    this.container.removeChild(modelView);
    modelView.dispose();
  }
  getView(model) {
    return this.map.get(model);
  }
  getViews() {
    return [...this.map.values()];
  }
  dispose() {
    for (const model of this.map.keys()) {
      this.remove(model);
    }
  }
}
sceneryPhet.register('ViewSynchronizer', ViewSynchronizer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5UGhldCIsIlZpZXdTeW5jaHJvbml6ZXIiLCJjb25zdHJ1Y3RvciIsImNvbnRhaW5lciIsImZhY3RvcnkiLCJtYXAiLCJNYXAiLCJhZGQiLCJtb2RlbCIsIm1vZGVsVmlldyIsInNldCIsImFkZENoaWxkIiwicmVtb3ZlIiwiZ2V0IiwiZGVsZXRlIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwiZ2V0VmlldyIsImdldFZpZXdzIiwidmFsdWVzIiwia2V5cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmlld1N5bmNocm9uaXplci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMb2dpYyB0aGF0IGhhbmRsZXMgdGhlIGNyZWF0aW9uIGFuZCBkaXNwb3NhbCBvZiBtb2RlbC12aWV3IHBhaXJzLlxyXG4gKlxyXG4gKiBUaGlzIGlzIGhlbHBmdWwgdG8gdXNlIGluIGNhc2VzIHdoZXJlIHlvdSd2ZSBnb3QgdG8gdHJhY2sgbW9kZWwtdmlldyBwYWlycywgYW5kIHlvdSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0XHJcbiAqIHRoZSB2aWV3IGlzIGNyZWF0ZWQvcmVtb3ZlZCB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIG1vZGVsIGVsZW1lbnQgaXMgY3JlYXRlZC9yZW1vdmVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFndXN0w61uIFZhbGxlam9cclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvblxyXG4gKi9cclxuXHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3U3luY2hyb25pemVyPE1vZGVsLCBWaWV3IGV4dGVuZHMgTm9kZT4ge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFwOiBNYXA8TW9kZWwsIFZpZXc+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY29udGFpbmVyOiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZmFjdG9yeTogKCB4OiBNb2RlbCApID0+IFZpZXc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBjb250YWluZXIgLSBUaGUgbm9kZSB0aGF0IHdpbGwgY29udGFpbiB0aGUgdmlld3MuXHJcbiAgICogQHBhcmFtIGZhY3RvcnkgLSBBIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIHZpZXcgZm9yIGEgZ2l2ZW4gbW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250YWluZXI6IE5vZGUsIGZhY3Rvcnk6ICggeDogTW9kZWwgKSA9PiBWaWV3ICkge1xyXG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwPE1vZGVsLCBWaWV3PigpO1xyXG4gICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgICB0aGlzLmZhY3RvcnkgPSBmYWN0b3J5O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZCggbW9kZWw6IE1vZGVsICk6IHZvaWQge1xyXG4gICAgY29uc3QgbW9kZWxWaWV3ID0gdGhpcy5mYWN0b3J5KCBtb2RlbCApO1xyXG4gICAgdGhpcy5tYXAuc2V0KCBtb2RlbCwgbW9kZWxWaWV3ICk7XHJcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZCggbW9kZWxWaWV3ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVtb3ZlKCBtb2RlbDogTW9kZWwgKTogdm9pZCB7XHJcbiAgICBjb25zdCBtb2RlbFZpZXcgPSB0aGlzLm1hcC5nZXQoIG1vZGVsICkhO1xyXG4gICAgdGhpcy5tYXAuZGVsZXRlKCBtb2RlbCApO1xyXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGQoIG1vZGVsVmlldyApO1xyXG4gICAgbW9kZWxWaWV3LmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRWaWV3KCBtb2RlbDogTW9kZWwgKTogVmlldyB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KCBtb2RlbCApITtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRWaWV3cygpOiBWaWV3W10ge1xyXG4gICAgcmV0dXJuIFsgLi4udGhpcy5tYXAudmFsdWVzKCkgXTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgZm9yICggY29uc3QgbW9kZWwgb2YgdGhpcy5tYXAua2V5cygpICkge1xyXG4gICAgICB0aGlzLnJlbW92ZSggbW9kZWwgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnVmlld1N5bmNocm9uaXplcicsIFZpZXdTeW5jaHJvbml6ZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sa0JBQWtCO0FBRzFDLGVBQWUsTUFBTUMsZ0JBQWdCLENBQTJCO0VBSzlEO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLFNBQWUsRUFBRUMsT0FBNkIsRUFBRztJQUNuRSxJQUFJLENBQUNDLEdBQUcsR0FBRyxJQUFJQyxHQUFHLENBQWMsQ0FBQztJQUNqQyxJQUFJLENBQUNILFNBQVMsR0FBR0EsU0FBUztJQUMxQixJQUFJLENBQUNDLE9BQU8sR0FBR0EsT0FBTztFQUN4QjtFQUVPRyxHQUFHQSxDQUFFQyxLQUFZLEVBQVM7SUFDL0IsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ0wsT0FBTyxDQUFFSSxLQUFNLENBQUM7SUFDdkMsSUFBSSxDQUFDSCxHQUFHLENBQUNLLEdBQUcsQ0FBRUYsS0FBSyxFQUFFQyxTQUFVLENBQUM7SUFDaEMsSUFBSSxDQUFDTixTQUFTLENBQUNRLFFBQVEsQ0FBRUYsU0FBVSxDQUFDO0VBQ3RDO0VBRU9HLE1BQU1BLENBQUVKLEtBQVksRUFBUztJQUNsQyxNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDSixHQUFHLENBQUNRLEdBQUcsQ0FBRUwsS0FBTSxDQUFFO0lBQ3hDLElBQUksQ0FBQ0gsR0FBRyxDQUFDUyxNQUFNLENBQUVOLEtBQU0sQ0FBQztJQUN4QixJQUFJLENBQUNMLFNBQVMsQ0FBQ1ksV0FBVyxDQUFFTixTQUFVLENBQUM7SUFDdkNBLFNBQVMsQ0FBQ08sT0FBTyxDQUFDLENBQUM7RUFDckI7RUFFT0MsT0FBT0EsQ0FBRVQsS0FBWSxFQUFTO0lBQ25DLE9BQU8sSUFBSSxDQUFDSCxHQUFHLENBQUNRLEdBQUcsQ0FBRUwsS0FBTSxDQUFDO0VBQzlCO0VBRU9VLFFBQVFBLENBQUEsRUFBVztJQUN4QixPQUFPLENBQUUsR0FBRyxJQUFJLENBQUNiLEdBQUcsQ0FBQ2MsTUFBTSxDQUFDLENBQUMsQ0FBRTtFQUNqQztFQUVPSCxPQUFPQSxDQUFBLEVBQVM7SUFDckIsS0FBTSxNQUFNUixLQUFLLElBQUksSUFBSSxDQUFDSCxHQUFHLENBQUNlLElBQUksQ0FBQyxDQUFDLEVBQUc7TUFDckMsSUFBSSxDQUFDUixNQUFNLENBQUVKLEtBQU0sQ0FBQztJQUN0QjtFQUNGO0FBQ0Y7QUFFQVIsV0FBVyxDQUFDcUIsUUFBUSxDQUFFLGtCQUFrQixFQUFFcEIsZ0JBQWlCLENBQUMifQ==