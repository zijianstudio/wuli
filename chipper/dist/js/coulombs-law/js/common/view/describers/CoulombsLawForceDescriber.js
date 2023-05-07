// Copyright 2019-2021, University of Colorado Boulder

import ForceDescriber from '../../../../../inverse-square-law-common/js/view/describers/ForceDescriber.js';
import coulombsLaw from '../../../coulombsLaw.js';
class CoulombsLawForceDescriber extends ForceDescriber {
  /**
   * @param {ISLCModel} model
   * @param {string} object1Label
   * @param {string} object2Label
   * @param {PositionDescriber} positionDescriber
   */
  constructor(model, object1Label, object2Label, positionDescriber) {
    super(model, object1Label, object2Label, positionDescriber);
  }

  /**
   * @param {number} force in newtons
   * @param {number} numberOfRegions - for crosscheck
   * @returns {number}
   * @override
   * @protected
   */
  getForceVectorIndex(force, numberOfRegions) {
    // TODO: implement when working on CL descriptions.
    return 0;
  }
}
coulombsLaw.register('CoulombsLawForceDescriber', CoulombsLawForceDescriber);
export default CoulombsLawForceDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JjZURlc2NyaWJlciIsImNvdWxvbWJzTGF3IiwiQ291bG9tYnNMYXdGb3JjZURlc2NyaWJlciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvYmplY3QxTGFiZWwiLCJvYmplY3QyTGFiZWwiLCJwb3NpdGlvbkRlc2NyaWJlciIsImdldEZvcmNlVmVjdG9ySW5kZXgiLCJmb3JjZSIsIm51bWJlck9mUmVnaW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ291bG9tYnNMYXdGb3JjZURlc2NyaWJlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcblxyXG5pbXBvcnQgRm9yY2VEZXNjcmliZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L2Rlc2NyaWJlcnMvRm9yY2VEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgY291bG9tYnNMYXcgZnJvbSAnLi4vLi4vLi4vY291bG9tYnNMYXcuanMnO1xyXG5cclxuY2xhc3MgQ291bG9tYnNMYXdGb3JjZURlc2NyaWJlciBleHRlbmRzIEZvcmNlRGVzY3JpYmVyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9iamVjdDFMYWJlbFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvYmplY3QyTGFiZWxcclxuICAgKiBAcGFyYW0ge1Bvc2l0aW9uRGVzY3JpYmVyfSBwb3NpdGlvbkRlc2NyaWJlclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgb2JqZWN0MUxhYmVsLCBvYmplY3QyTGFiZWwsIHBvc2l0aW9uRGVzY3JpYmVyICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCBvYmplY3QxTGFiZWwsIG9iamVjdDJMYWJlbCwgcG9zaXRpb25EZXNjcmliZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmb3JjZSBpbiBuZXd0b25zXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mUmVnaW9ucyAtIGZvciBjcm9zc2NoZWNrXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgZ2V0Rm9yY2VWZWN0b3JJbmRleCggZm9yY2UsIG51bWJlck9mUmVnaW9ucyApIHtcclxuXHJcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgd2hlbiB3b3JraW5nIG9uIENMIGRlc2NyaXB0aW9ucy5cclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxufVxyXG5cclxuY291bG9tYnNMYXcucmVnaXN0ZXIoICdDb3Vsb21ic0xhd0ZvcmNlRGVzY3JpYmVyJywgQ291bG9tYnNMYXdGb3JjZURlc2NyaWJlciApO1xyXG5leHBvcnQgZGVmYXVsdCBDb3Vsb21ic0xhd0ZvcmNlRGVzY3JpYmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0EsT0FBT0EsY0FBYyxNQUFNLCtFQUErRTtBQUMxRyxPQUFPQyxXQUFXLE1BQU0seUJBQXlCO0FBRWpELE1BQU1DLHlCQUF5QixTQUFTRixjQUFjLENBQUM7RUFFckQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFFQyxZQUFZLEVBQUVDLGlCQUFpQixFQUFHO0lBQ2xFLEtBQUssQ0FBRUgsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLFlBQVksRUFBRUMsaUJBQWtCLENBQUM7RUFDL0Q7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsbUJBQW1CQSxDQUFFQyxLQUFLLEVBQUVDLGVBQWUsRUFBRztJQUU1QztJQUNBLE9BQU8sQ0FBQztFQUNWO0FBQ0Y7QUFFQVQsV0FBVyxDQUFDVSxRQUFRLENBQUUsMkJBQTJCLEVBQUVULHlCQUEwQixDQUFDO0FBQzlFLGVBQWVBLHlCQUF5QiJ9