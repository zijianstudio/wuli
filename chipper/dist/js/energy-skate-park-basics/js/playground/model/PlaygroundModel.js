// Copyright 2018-2022, University of Colorado Boulder

/**
 * Playground model for Energy Skate Park: Basics.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnergySkateParkPlaygroundModel from '../../../../energy-skate-park/js/playground/model/EnergySkateParkPlaygroundModel.js';
import energySkateParkBasics from '../../energySkateParkBasics.js';
import EnergySkateParkBasicsConstants from '../../EnergySkateParkBasicsConstants.js';
class PlaygroundModel extends EnergySkateParkPlaygroundModel {
  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor(preferencesModel, tandem) {
    super(preferencesModel, tandem.createTandem('playgroundModel'), EnergySkateParkBasicsConstants.BASICS_MODEL_OPTIONS);
  }
}
energySkateParkBasics.register('PlaygroundModel', PlaygroundModel);
export default PlaygroundModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwiLCJlbmVyZ3lTa2F0ZVBhcmtCYXNpY3MiLCJFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NDb25zdGFudHMiLCJQbGF5Z3JvdW5kTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByZWZlcmVuY2VzTW9kZWwiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJCQVNJQ1NfTU9ERUxfT1BUSU9OUyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxheWdyb3VuZE1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBsYXlncm91bmQgbW9kZWwgZm9yIEVuZXJneSBTa2F0ZSBQYXJrOiBCYXNpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vZW5lcmd5LXNrYXRlLXBhcmsvanMvcGxheWdyb3VuZC9tb2RlbC9FbmVyZ3lTa2F0ZVBhcmtQbGF5Z3JvdW5kTW9kZWwuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrQmFzaWNzIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFya0Jhc2ljcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtCYXNpY3NDb25zdGFudHMgZnJvbSAnLi4vLi4vRW5lcmd5U2thdGVQYXJrQmFzaWNzQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFBsYXlncm91bmRNb2RlbCBleHRlbmRzIEVuZXJneVNrYXRlUGFya1BsYXlncm91bmRNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5U2thdGVQYXJrUHJlZmVyZW5jZXNNb2RlbH0gcHJlZmVyZW5jZXNNb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcHJlZmVyZW5jZXNNb2RlbCwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHByZWZlcmVuY2VzTW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5Z3JvdW5kTW9kZWwnICksIEVuZXJneVNrYXRlUGFya0Jhc2ljc0NvbnN0YW50cy5CQVNJQ1NfTU9ERUxfT1BUSU9OUyApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5U2thdGVQYXJrQmFzaWNzLnJlZ2lzdGVyKCAnUGxheWdyb3VuZE1vZGVsJywgUGxheWdyb3VuZE1vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBsYXlncm91bmRNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsOEJBQThCLE1BQU0scUZBQXFGO0FBQ2hJLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyw4QkFBOEIsTUFBTSx5Q0FBeUM7QUFFcEYsTUFBTUMsZUFBZSxTQUFTSCw4QkFBOEIsQ0FBQztFQUUzRDtBQUNGO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxnQkFBZ0IsRUFBRUMsTUFBTSxFQUFHO0lBQ3RDLEtBQUssQ0FBRUQsZ0JBQWdCLEVBQUVDLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGlCQUFrQixDQUFDLEVBQUVMLDhCQUE4QixDQUFDTSxvQkFBcUIsQ0FBQztFQUMxSDtBQUNGO0FBRUFQLHFCQUFxQixDQUFDUSxRQUFRLENBQUUsaUJBQWlCLEVBQUVOLGVBQWdCLENBQUM7QUFDcEUsZUFBZUEsZUFBZSJ9