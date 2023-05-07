// Copyright 2014-2021, University of Colorado Boulder

/**
 * View of an individual electron in a cloud {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColors from '../MoleculeShapesColors.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';

// controls resolution for the sphere (number of samples in both directions)
const NUM_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.value ? 10 : 3;

// renderer-local access
const localElectronGeometry = new LocalGeometry(new THREE.SphereGeometry(0.25, NUM_SAMPLES, NUM_SAMPLES));
const localElectronMaterial = new LocalMaterial(new THREE.MeshLambertMaterial({
  overdraw: MoleculeShapesGlobals.useWebGLProperty.value ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
}), {
  color: MoleculeShapesColors.lonePairElectronProperty
});
class ElectronView extends THREE.Mesh {
  /*
   * @param {THREE.Renderer} renderer
   */
  constructor(renderer) {
    super(localElectronGeometry.get(renderer), localElectronMaterial.get(renderer));
  }
}
moleculeShapes.register('ElectronView', ElectronView);
export default ElectronView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzR2xvYmFscyIsIk1vbGVjdWxlU2hhcGVzQ29sb3JzIiwiTG9jYWxHZW9tZXRyeSIsIkxvY2FsTWF0ZXJpYWwiLCJOVU1fU0FNUExFUyIsInVzZVdlYkdMUHJvcGVydHkiLCJ2YWx1ZSIsImxvY2FsRWxlY3Ryb25HZW9tZXRyeSIsIlRIUkVFIiwiU3BoZXJlR2VvbWV0cnkiLCJsb2NhbEVsZWN0cm9uTWF0ZXJpYWwiLCJNZXNoTGFtYmVydE1hdGVyaWFsIiwib3ZlcmRyYXciLCJjb2xvciIsImxvbmVQYWlyRWxlY3Ryb25Qcm9wZXJ0eSIsIkVsZWN0cm9uVmlldyIsIk1lc2giLCJjb25zdHJ1Y3RvciIsInJlbmRlcmVyIiwiZ2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbGVjdHJvblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiBhbiBpbmRpdmlkdWFsIGVsZWN0cm9uIGluIGEgY2xvdWQge1RIUkVFLk9iamVjdDNEfVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IG1vbGVjdWxlU2hhcGVzIGZyb20gJy4uLy4uLy4uL21vbGVjdWxlU2hhcGVzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzR2xvYmFscyBmcm9tICcuLi8uLi9Nb2xlY3VsZVNoYXBlc0dsb2JhbHMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNDb2xvcnMgZnJvbSAnLi4vTW9sZWN1bGVTaGFwZXNDb2xvcnMuanMnO1xyXG5pbXBvcnQgTG9jYWxHZW9tZXRyeSBmcm9tICcuL0xvY2FsR2VvbWV0cnkuanMnO1xyXG5pbXBvcnQgTG9jYWxNYXRlcmlhbCBmcm9tICcuL0xvY2FsTWF0ZXJpYWwuanMnO1xyXG5cclxuLy8gY29udHJvbHMgcmVzb2x1dGlvbiBmb3IgdGhlIHNwaGVyZSAobnVtYmVyIG9mIHNhbXBsZXMgaW4gYm90aCBkaXJlY3Rpb25zKVxyXG5jb25zdCBOVU1fU0FNUExFUyA9IE1vbGVjdWxlU2hhcGVzR2xvYmFscy51c2VXZWJHTFByb3BlcnR5LnZhbHVlID8gMTAgOiAzO1xyXG5cclxuLy8gcmVuZGVyZXItbG9jYWwgYWNjZXNzXHJcbmNvbnN0IGxvY2FsRWxlY3Ryb25HZW9tZXRyeSA9IG5ldyBMb2NhbEdlb21ldHJ5KCBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIDAuMjUsIE5VTV9TQU1QTEVTLCBOVU1fU0FNUExFUyApICk7XHJcbmNvbnN0IGxvY2FsRWxlY3Ryb25NYXRlcmlhbCA9IG5ldyBMb2NhbE1hdGVyaWFsKCBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCgge1xyXG4gIG92ZXJkcmF3OiBNb2xlY3VsZVNoYXBlc0dsb2JhbHMudXNlV2ViR0xQcm9wZXJ0eS52YWx1ZSA/IDAgOiAwLjUgLy8gYW1vdW50IHRvIGV4dGVuZCBwb2x5Z29ucyB3aGVuIHVzaW5nIENhbnZhcyB0byBhdm9pZCBjcmFja3NcclxufSApLCB7XHJcbiAgY29sb3I6IE1vbGVjdWxlU2hhcGVzQ29sb3JzLmxvbmVQYWlyRWxlY3Ryb25Qcm9wZXJ0eVxyXG59ICk7XHJcblxyXG5jbGFzcyBFbGVjdHJvblZpZXcgZXh0ZW5kcyBUSFJFRS5NZXNoIHtcclxuICAvKlxyXG4gICAqIEBwYXJhbSB7VEhSRUUuUmVuZGVyZXJ9IHJlbmRlcmVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyICkge1xyXG4gICAgc3VwZXIoIGxvY2FsRWxlY3Ryb25HZW9tZXRyeS5nZXQoIHJlbmRlcmVyICksIGxvY2FsRWxlY3Ryb25NYXRlcmlhbC5nZXQoIHJlbmRlcmVyICkgKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlU2hhcGVzLnJlZ2lzdGVyKCAnRWxlY3Ryb25WaWV3JywgRWxlY3Ryb25WaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFbGVjdHJvblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSw0QkFBNEI7QUFDdkQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7O0FBRTlDO0FBQ0EsTUFBTUMsV0FBVyxHQUFHSixxQkFBcUIsQ0FBQ0ssZ0JBQWdCLENBQUNDLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQzs7QUFFekU7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJTCxhQUFhLENBQUUsSUFBSU0sS0FBSyxDQUFDQyxjQUFjLENBQUUsSUFBSSxFQUFFTCxXQUFXLEVBQUVBLFdBQVksQ0FBRSxDQUFDO0FBQzdHLE1BQU1NLHFCQUFxQixHQUFHLElBQUlQLGFBQWEsQ0FBRSxJQUFJSyxLQUFLLENBQUNHLG1CQUFtQixDQUFFO0VBQzlFQyxRQUFRLEVBQUVaLHFCQUFxQixDQUFDSyxnQkFBZ0IsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbkUsQ0FBRSxDQUFDLEVBQUU7RUFDSE8sS0FBSyxFQUFFWixvQkFBb0IsQ0FBQ2E7QUFDOUIsQ0FBRSxDQUFDO0FBRUgsTUFBTUMsWUFBWSxTQUFTUCxLQUFLLENBQUNRLElBQUksQ0FBQztFQUNwQztBQUNGO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBQ3RCLEtBQUssQ0FBRVgscUJBQXFCLENBQUNZLEdBQUcsQ0FBRUQsUUFBUyxDQUFDLEVBQUVSLHFCQUFxQixDQUFDUyxHQUFHLENBQUVELFFBQVMsQ0FBRSxDQUFDO0VBQ3ZGO0FBQ0Y7QUFFQW5CLGNBQWMsQ0FBQ3FCLFFBQVEsQ0FBRSxjQUFjLEVBQUVMLFlBQWEsQ0FBQztBQUV2RCxlQUFlQSxZQUFZIn0=