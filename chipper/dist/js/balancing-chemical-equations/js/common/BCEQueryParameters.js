// Copyright 2014-2023, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import balancingChemicalEquations from '../balancingChemicalEquations.js';
const BCEQueryParameters = QueryStringMachine.getAll({
  // Play all challenges for each level of the game, to get 100% test coverage.
  // For internal use only.
  playAll: {
    type: 'flag'
  },
  // Show the game reward regardless of score.
  // For internal use only.
  showReward: {
    type: 'flag'
  }
});
balancingChemicalEquations.register('BCEQueryParameters', BCEQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.balancingChemicalEquations.BCEQueryParameters');
export default BCEQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJsb2dHbG9iYWwiLCJiYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucyIsIkJDRVF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsInBsYXlBbGwiLCJ0eXBlIiwic2hvd1Jld2FyZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQkNFUXVlcnlQYXJhbWV0ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbG9nR2xvYmFsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9sb2dHbG9iYWwuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMgZnJvbSAnLi4vYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMuanMnO1xyXG5cclxuY29uc3QgQkNFUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBQbGF5IGFsbCBjaGFsbGVuZ2VzIGZvciBlYWNoIGxldmVsIG9mIHRoZSBnYW1lLCB0byBnZXQgMTAwJSB0ZXN0IGNvdmVyYWdlLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cclxuICBwbGF5QWxsOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAvLyBTaG93IHRoZSBnYW1lIHJld2FyZCByZWdhcmRsZXNzIG9mIHNjb3JlLlxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seS5cclxuICBzaG93UmV3YXJkOiB7IHR5cGU6ICdmbGFnJyB9XHJcbn0gKTtcclxuXHJcbmJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zLnJlZ2lzdGVyKCAnQkNFUXVlcnlQYXJhbWV0ZXJzJywgQkNFUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG4vLyBMb2cgcXVlcnkgcGFyYW1ldGVyc1xyXG5sb2dHbG9iYWwoICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0LnByZWxvYWRzLnBoZXRpby5xdWVyeVBhcmFtZXRlcnMnICk7XHJcbmxvZ0dsb2JhbCggJ3BoZXQuYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMuQkNFUXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQkNFUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQztBQUV6RSxNQUFNQyxrQkFBa0IsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUVwRDtFQUNBO0VBQ0FDLE9BQU8sRUFBRTtJQUFFQyxJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRXpCO0VBQ0E7RUFDQUMsVUFBVSxFQUFFO0lBQUVELElBQUksRUFBRTtFQUFPO0FBQzdCLENBQUUsQ0FBQztBQUVITCwwQkFBMEIsQ0FBQ08sUUFBUSxDQUFFLG9CQUFvQixFQUFFTixrQkFBbUIsQ0FBQzs7QUFFL0U7QUFDQUYsU0FBUyxDQUFFLDhCQUErQixDQUFDO0FBQzNDQSxTQUFTLENBQUUsc0NBQXVDLENBQUM7QUFDbkRBLFNBQVMsQ0FBRSxvREFBcUQsQ0FBQztBQUVqRSxlQUFlRSxrQkFBa0IifQ==