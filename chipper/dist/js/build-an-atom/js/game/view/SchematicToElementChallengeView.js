// Copyright 2013-2021, University of Colorado Boulder

/**
 * Visual representation of a challenge where the user is presented with a
 * schematic representation of an atom (which looks much like the atoms
 * constructed on the 1st tab), and must find the represented element on a
 * periodic table.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import buildAnAtom from '../../buildAnAtom.js';
import NonInteractiveSchematicAtomNode from './NonInteractiveSchematicAtomNode.js';
import ToElementChallengeView from './ToElementChallengeView.js';
class SchematicToElementChallengeView extends ToElementChallengeView {
  /**
   * @param {SchematicToElementChallenge} schematicToElementChallenge
   * @param {Bounds2} layoutBounds
   * @param {Tandem} tandem
   */
  constructor(schematicToElementChallenge, layoutBounds, tandem) {
    super(schematicToElementChallenge, layoutBounds, tandem);

    // Create the model-view transform used by the schematic atom.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(layoutBounds.width * 0.275, layoutBounds.height * 0.5), 0.8);

    // Add the schematic representation of the atom.
    const nonInteractiveSchematicNode = new NonInteractiveSchematicAtomNode(schematicToElementChallenge.answerAtom, modelViewTransform, tandem.createTandem('noninteractiveSchematicAtomNode'));
    this.challengePresentationNode.addChild(nonInteractiveSchematicNode);
    nonInteractiveSchematicNode.centerX = this.periodicTable.left / 2;
    nonInteractiveSchematicNode.centerY = this.periodicTable.centerY;
    this.disposeSchematicToElementChallengeView = () => {
      nonInteractiveSchematicNode.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeSchematicToElementChallengeView();
    super.dispose();
  }
}
buildAnAtom.register('SchematicToElementChallengeView', SchematicToElementChallengeView);
export default SchematicToElementChallengeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsImJ1aWxkQW5BdG9tIiwiTm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tTm9kZSIsIlRvRWxlbWVudENoYWxsZW5nZVZpZXciLCJTY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IiwiY29uc3RydWN0b3IiLCJzY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2UiLCJsYXlvdXRCb3VuZHMiLCJ0YW5kZW0iLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJ3aWR0aCIsImhlaWdodCIsIm5vbkludGVyYWN0aXZlU2NoZW1hdGljTm9kZSIsImFuc3dlckF0b20iLCJjcmVhdGVUYW5kZW0iLCJjaGFsbGVuZ2VQcmVzZW50YXRpb25Ob2RlIiwiYWRkQ2hpbGQiLCJjZW50ZXJYIiwicGVyaW9kaWNUYWJsZSIsImxlZnQiLCJjZW50ZXJZIiwiZGlzcG9zZVNjaGVtYXRpY1RvRWxlbWVudENoYWxsZW5nZVZpZXciLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiBhIGNoYWxsZW5nZSB3aGVyZSB0aGUgdXNlciBpcyBwcmVzZW50ZWQgd2l0aCBhXHJcbiAqIHNjaGVtYXRpYyByZXByZXNlbnRhdGlvbiBvZiBhbiBhdG9tICh3aGljaCBsb29rcyBtdWNoIGxpa2UgdGhlIGF0b21zXHJcbiAqIGNvbnN0cnVjdGVkIG9uIHRoZSAxc3QgdGFiKSwgYW5kIG11c3QgZmluZCB0aGUgcmVwcmVzZW50ZWQgZWxlbWVudCBvbiBhXHJcbiAqIHBlcmlvZGljIHRhYmxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcbmltcG9ydCBOb25JbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b21Ob2RlIGZyb20gJy4vTm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tTm9kZS5qcyc7XHJcbmltcG9ydCBUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IGZyb20gJy4vVG9FbGVtZW50Q2hhbGxlbmdlVmlldy5qcyc7XHJcblxyXG5jbGFzcyBTY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2VWaWV3IGV4dGVuZHMgVG9FbGVtZW50Q2hhbGxlbmdlVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7U2NoZW1hdGljVG9FbGVtZW50Q2hhbGxlbmdlfSBzY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kc1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NoZW1hdGljVG9FbGVtZW50Q2hhbGxlbmdlLCBsYXlvdXRCb3VuZHMsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBzY2hlbWF0aWNUb0VsZW1lbnRDaGFsbGVuZ2UsIGxheW91dEJvdW5kcywgdGFuZGVtICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBtb2RlbC12aWV3IHRyYW5zZm9ybSB1c2VkIGJ5IHRoZSBzY2hlbWF0aWMgYXRvbS5cclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoIGxheW91dEJvdW5kcy53aWR0aCAqIDAuMjc1LCBsYXlvdXRCb3VuZHMuaGVpZ2h0ICogMC41ICksXHJcbiAgICAgIDAuOCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgc2NoZW1hdGljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhdG9tLlxyXG4gICAgY29uc3Qgbm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNOb2RlID0gbmV3IE5vbkludGVyYWN0aXZlU2NoZW1hdGljQXRvbU5vZGUoXHJcbiAgICAgIHNjaGVtYXRpY1RvRWxlbWVudENoYWxsZW5nZS5hbnN3ZXJBdG9tLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdub25pbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b21Ob2RlJyApXHJcbiAgICApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcmVzZW50YXRpb25Ob2RlLmFkZENoaWxkKCBub25JbnRlcmFjdGl2ZVNjaGVtYXRpY05vZGUgKTtcclxuXHJcbiAgICBub25JbnRlcmFjdGl2ZVNjaGVtYXRpY05vZGUuY2VudGVyWCA9IHRoaXMucGVyaW9kaWNUYWJsZS5sZWZ0IC8gMjtcclxuICAgIG5vbkludGVyYWN0aXZlU2NoZW1hdGljTm9kZS5jZW50ZXJZID0gdGhpcy5wZXJpb2RpY1RhYmxlLmNlbnRlclk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU2NoZW1hdGljVG9FbGVtZW50Q2hhbGxlbmdlVmlldyA9ICgpID0+IHtcclxuICAgICAgbm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNOb2RlLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZVNjaGVtYXRpY1RvRWxlbWVudENoYWxsZW5nZVZpZXcoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnU2NoZW1hdGljVG9FbGVtZW50Q2hhbGxlbmdlVmlldycsIFNjaGVtYXRpY1RvRWxlbWVudENoYWxsZW5nZVZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVtYXRpY1RvRWxlbWVudENoYWxsZW5nZVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsK0JBQStCLE1BQU0sc0NBQXNDO0FBQ2xGLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUVoRSxNQUFNQywrQkFBK0IsU0FBU0Qsc0JBQXNCLENBQUM7RUFFbkU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQywyQkFBMkIsRUFBRUMsWUFBWSxFQUFFQyxNQUFNLEVBQUc7SUFDL0QsS0FBSyxDQUFFRiwyQkFBMkIsRUFBRUMsWUFBWSxFQUFFQyxNQUFPLENBQUM7O0lBRTFEO0lBQ0EsTUFBTUMsa0JBQWtCLEdBQUdULG1CQUFtQixDQUFDVSxzQ0FBc0MsQ0FDbkZYLE9BQU8sQ0FBQ1ksSUFBSSxFQUNaLElBQUlaLE9BQU8sQ0FBRVEsWUFBWSxDQUFDSyxLQUFLLEdBQUcsS0FBSyxFQUFFTCxZQUFZLENBQUNNLE1BQU0sR0FBRyxHQUFJLENBQUMsRUFDcEUsR0FBSSxDQUFDOztJQUVQO0lBQ0EsTUFBTUMsMkJBQTJCLEdBQUcsSUFBSVosK0JBQStCLENBQ3JFSSwyQkFBMkIsQ0FBQ1MsVUFBVSxFQUN0Q04sa0JBQWtCLEVBQ2xCRCxNQUFNLENBQUNRLFlBQVksQ0FBRSxpQ0FBa0MsQ0FDekQsQ0FBQztJQUNELElBQUksQ0FBQ0MseUJBQXlCLENBQUNDLFFBQVEsQ0FBRUosMkJBQTRCLENBQUM7SUFFdEVBLDJCQUEyQixDQUFDSyxPQUFPLEdBQUcsSUFBSSxDQUFDQyxhQUFhLENBQUNDLElBQUksR0FBRyxDQUFDO0lBQ2pFUCwyQkFBMkIsQ0FBQ1EsT0FBTyxHQUFHLElBQUksQ0FBQ0YsYUFBYSxDQUFDRSxPQUFPO0lBRWhFLElBQUksQ0FBQ0Msc0NBQXNDLEdBQUcsTUFBTTtNQUNsRFQsMkJBQTJCLENBQUNVLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7RUFDSDs7RUFFQTtFQUNBQSxPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJLENBQUNELHNDQUFzQyxDQUFDLENBQUM7SUFDN0MsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUF2QixXQUFXLENBQUN3QixRQUFRLENBQUUsaUNBQWlDLEVBQUVyQiwrQkFBZ0MsQ0FBQztBQUUxRixlQUFlQSwrQkFBK0IifQ==