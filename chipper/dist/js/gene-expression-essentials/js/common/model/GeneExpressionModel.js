// Copyright 2015-2020, University of Colorado Boulder

/**
 * abstract base class for some of the main models used in this simulation
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

//modules
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
class GeneExpressionModel {
  /**
   * @abstract
   */
  constructor() {
    // does nothing in base class
  }

  /**
   * Get the DNA molecule.
   * @returns {DnaMolecule} - DNA molecule, null if none exists.
   * @public
   */
  getDnaMolecule() {
    throw new Error('getDnaMolecule should be implemented in descendant classes of GeneExpressionModel');
  }

  /**
   * Add a mobile biomolecule to the model. The model must send out the appropriate notifications.
   * @param {MobileBiomolecule} mobileBiomolecule
   * @public
   */
  addMobileBiomolecule(mobileBiomolecule) {
    throw new Error('addMobileBiomolecule should be implemented in descendant classes of GeneExpressionModel');
  }

  /**
   * Add the specified messenger RNA strand to the model. The model must send out the appropriate notifications.
   * @param {MessengerRna} messengerRna
   * @public
   */
  addMessengerRna(messengerRna) {
    throw new Error('addMessengerRna should be implemented in descendant classes of GeneExpressionModel');
  }

  /**
   * Remove the specified messenger RNA from the model.
   * @param {MessengerRna} messengerRnaBeingDestroyed
   * @public
   */
  removeMessengerRna(messengerRnaBeingDestroyed) {
    throw new Error('removeMessengerRna should be implemented in descendant classes of GeneExpressionModel');
  }

  /**
   * Get a list of all messenger RNA strands that are currently in existence.
   * @returns {Array.<MessengerRna>}
   * @public
   */
  getMessengerRnaList() {
    throw new Error('getMessengerRnaList should be implemented in descendant classes of GeneExpressionModel');
  }

  /**
   * Get a list of all messenger biomolecules that overlap with the providedshape.
   * @param {Bounds2} testShapeBounds
   * @returns {Array.<MobileBiomolecule>}
   * @public
   */
  getOverlappingBiomolecules(testShapeBounds) {
    throw new Error('getOverlappingBiomolecules should be implemented in descendant classes of GeneExpressionModel');
  }
}
geneExpressionEssentials.register('GeneExpressionModel', GeneExpressionModel);
export default GeneExpressionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJHZW5lRXhwcmVzc2lvbk1vZGVsIiwiY29uc3RydWN0b3IiLCJnZXREbmFNb2xlY3VsZSIsIkVycm9yIiwiYWRkTW9iaWxlQmlvbW9sZWN1bGUiLCJtb2JpbGVCaW9tb2xlY3VsZSIsImFkZE1lc3NlbmdlclJuYSIsIm1lc3NlbmdlclJuYSIsInJlbW92ZU1lc3NlbmdlclJuYSIsIm1lc3NlbmdlclJuYUJlaW5nRGVzdHJveWVkIiwiZ2V0TWVzc2VuZ2VyUm5hTGlzdCIsImdldE92ZXJsYXBwaW5nQmlvbW9sZWN1bGVzIiwidGVzdFNoYXBlQm91bmRzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHZW5lRXhwcmVzc2lvbk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIHNvbWUgb2YgdGhlIG1haW4gbW9kZWxzIHVzZWQgaW4gdGhpcyBzaW11bGF0aW9uXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBNb2hhbWVkIFNhZmlcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5cclxuLy9tb2R1bGVzXHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuXHJcbmNsYXNzIEdlbmVFeHByZXNzaW9uTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIGRvZXMgbm90aGluZyBpbiBiYXNlIGNsYXNzXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIEROQSBtb2xlY3VsZS5cclxuICAgKiBAcmV0dXJucyB7RG5hTW9sZWN1bGV9IC0gRE5BIG1vbGVjdWxlLCBudWxsIGlmIG5vbmUgZXhpc3RzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXREbmFNb2xlY3VsZSgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldERuYU1vbGVjdWxlIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMgb2YgR2VuZUV4cHJlc3Npb25Nb2RlbCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIG1vYmlsZSBiaW9tb2xlY3VsZSB0byB0aGUgbW9kZWwuIFRoZSBtb2RlbCBtdXN0IHNlbmQgb3V0IHRoZSBhcHByb3ByaWF0ZSBub3RpZmljYXRpb25zLlxyXG4gICAqIEBwYXJhbSB7TW9iaWxlQmlvbW9sZWN1bGV9IG1vYmlsZUJpb21vbGVjdWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZE1vYmlsZUJpb21vbGVjdWxlKCBtb2JpbGVCaW9tb2xlY3VsZSApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2FkZE1vYmlsZUJpb21vbGVjdWxlIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMgb2YgR2VuZUV4cHJlc3Npb25Nb2RlbCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgc3BlY2lmaWVkIG1lc3NlbmdlciBSTkEgc3RyYW5kIHRvIHRoZSBtb2RlbC4gVGhlIG1vZGVsIG11c3Qgc2VuZCBvdXQgdGhlIGFwcHJvcHJpYXRlIG5vdGlmaWNhdGlvbnMuXHJcbiAgICogQHBhcmFtIHtNZXNzZW5nZXJSbmF9IG1lc3NlbmdlclJuYVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRNZXNzZW5nZXJSbmEoIG1lc3NlbmdlclJuYSApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2FkZE1lc3NlbmdlclJuYSBzaG91bGQgYmUgaW1wbGVtZW50ZWQgaW4gZGVzY2VuZGFudCBjbGFzc2VzIG9mIEdlbmVFeHByZXNzaW9uTW9kZWwnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlIHNwZWNpZmllZCBtZXNzZW5nZXIgUk5BIGZyb20gdGhlIG1vZGVsLlxyXG4gICAqIEBwYXJhbSB7TWVzc2VuZ2VyUm5hfSBtZXNzZW5nZXJSbmFCZWluZ0Rlc3Ryb3llZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVNZXNzZW5nZXJSbmEoIG1lc3NlbmdlclJuYUJlaW5nRGVzdHJveWVkICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAncmVtb3ZlTWVzc2VuZ2VyUm5hIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMgb2YgR2VuZUV4cHJlc3Npb25Nb2RlbCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGxpc3Qgb2YgYWxsIG1lc3NlbmdlciBSTkEgc3RyYW5kcyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gZXhpc3RlbmNlLlxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48TWVzc2VuZ2VyUm5hPn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWVzc2VuZ2VyUm5hTGlzdCgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldE1lc3NlbmdlclJuYUxpc3Qgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGRlc2NlbmRhbnQgY2xhc3NlcyBvZiBHZW5lRXhwcmVzc2lvbk1vZGVsJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbGlzdCBvZiBhbGwgbWVzc2VuZ2VyIGJpb21vbGVjdWxlcyB0aGF0IG92ZXJsYXAgd2l0aCB0aGUgcHJvdmlkZWRzaGFwZS5cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IHRlc3RTaGFwZUJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtBcnJheS48TW9iaWxlQmlvbW9sZWN1bGU+fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRPdmVybGFwcGluZ0Jpb21vbGVjdWxlcyggdGVzdFNoYXBlQm91bmRzICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnZ2V0T3ZlcmxhcHBpbmdCaW9tb2xlY3VsZXMgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGRlc2NlbmRhbnQgY2xhc3NlcyBvZiBHZW5lRXhwcmVzc2lvbk1vZGVsJyApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnR2VuZUV4cHJlc3Npb25Nb2RlbCcsIEdlbmVFeHByZXNzaW9uTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdlbmVFeHByZXNzaW9uTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQSxPQUFPQSx3QkFBd0IsTUFBTSxtQ0FBbUM7QUFFeEUsTUFBTUMsbUJBQW1CLENBQUM7RUFFeEI7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUEsRUFBRztJQUNaO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxjQUFjQSxDQUFBLEVBQUc7SUFDZixNQUFNLElBQUlDLEtBQUssQ0FBRSxtRkFBb0YsQ0FBQztFQUN4Rzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLG9CQUFvQkEsQ0FBRUMsaUJBQWlCLEVBQUc7SUFDeEMsTUFBTSxJQUFJRixLQUFLLENBQUUseUZBQTBGLENBQUM7RUFDOUc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxlQUFlQSxDQUFFQyxZQUFZLEVBQUc7SUFDOUIsTUFBTSxJQUFJSixLQUFLLENBQUUsb0ZBQXFGLENBQUM7RUFDekc7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxrQkFBa0JBLENBQUVDLDBCQUEwQixFQUFHO0lBQy9DLE1BQU0sSUFBSU4sS0FBSyxDQUFFLHVGQUF3RixDQUFDO0VBQzVHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sbUJBQW1CQSxDQUFBLEVBQUc7SUFDcEIsTUFBTSxJQUFJUCxLQUFLLENBQUUsd0ZBQXlGLENBQUM7RUFDN0c7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLDBCQUEwQkEsQ0FBRUMsZUFBZSxFQUFHO0lBQzVDLE1BQU0sSUFBSVQsS0FBSyxDQUFFLCtGQUFnRyxDQUFDO0VBQ3BIO0FBQ0Y7QUFFQUosd0JBQXdCLENBQUNjLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRWIsbUJBQW9CLENBQUM7QUFFL0UsZUFBZUEsbUJBQW1CIn0=