// Copyright 2016-2021, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 */

import moleculeShapes from '../moleculeShapes.js';
const MoleculeShapesQueryParameters = QueryStringMachine.getAll({
  // Determines the default for whether outer lone pairs are shown.
  showOuterLonePairs: {
    type: 'flag',
    public: true
  },
  // Constrains the maximum number of connections to the central atom allowed
  maxConnections: {
    type: 'number',
    defaultValue: 6,
    public: true
  }
});
moleculeShapes.register('MoleculeShapesQueryParameters', MoleculeShapesQueryParameters);
export default MoleculeShapesQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlU2hhcGVzUXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwic2hvd091dGVyTG9uZVBhaXJzIiwidHlwZSIsInB1YmxpYyIsIm1heENvbm5lY3Rpb25zIiwiZGVmYXVsdFZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb2xlY3VsZVNoYXBlc1F1ZXJ5UGFyYW1ldGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGlzIHNpbXVsYXRpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1vbGVjdWxlU2hhcGVzIGZyb20gJy4uL21vbGVjdWxlU2hhcGVzLmpzJztcclxuXHJcbmNvbnN0IE1vbGVjdWxlU2hhcGVzUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG4gIC8vIERldGVybWluZXMgdGhlIGRlZmF1bHQgZm9yIHdoZXRoZXIgb3V0ZXIgbG9uZSBwYWlycyBhcmUgc2hvd24uXHJcbiAgc2hvd091dGVyTG9uZVBhaXJzOiB7IHR5cGU6ICdmbGFnJywgcHVibGljOiB0cnVlIH0sXHJcblxyXG4gIC8vIENvbnN0cmFpbnMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGNvbm5lY3Rpb25zIHRvIHRoZSBjZW50cmFsIGF0b20gYWxsb3dlZFxyXG4gIG1heENvbm5lY3Rpb25zOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogNixcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH1cclxufSApO1xyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdNb2xlY3VsZVNoYXBlc1F1ZXJ5UGFyYW1ldGVycycsIE1vbGVjdWxlU2hhcGVzUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2xlY3VsZVNoYXBlc1F1ZXJ5UGFyYW1ldGVyczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sc0JBQXNCO0FBRWpELE1BQU1DLDZCQUE2QixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBQy9EO0VBQ0FDLGtCQUFrQixFQUFFO0lBQUVDLElBQUksRUFBRSxNQUFNO0lBQUVDLE1BQU0sRUFBRTtFQUFLLENBQUM7RUFFbEQ7RUFDQUMsY0FBYyxFQUFFO0lBQ2RGLElBQUksRUFBRSxRQUFRO0lBQ2RHLFlBQVksRUFBRSxDQUFDO0lBQ2ZGLE1BQU0sRUFBRTtFQUNWO0FBQ0YsQ0FBRSxDQUFDO0FBRUhOLGNBQWMsQ0FBQ1MsUUFBUSxDQUFFLCtCQUErQixFQUFFUiw2QkFBOEIsQ0FBQztBQUV6RixlQUFlQSw2QkFBNkIifQ==