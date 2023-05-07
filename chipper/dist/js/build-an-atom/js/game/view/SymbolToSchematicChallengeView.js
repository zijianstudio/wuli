// Copyright 2013-2022, University of Colorado Boulder

/**
 * View for game challenges where the user is presented with a chemical symbol
 * including atomic number, mass number, and charge, and needs to determine
 * the number of protons, neutrons, and electrons that comprise the atom.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import InteractiveSchematicAtom from '../../../../shred/js/view/InteractiveSchematicAtom.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAAGlobalPreferences from '../../common/BAAGlobalPreferences.js';
import ChallengeView from './ChallengeView.js';
import InteractiveSymbolNode from './InteractiveSymbolNode.js';
class SymbolToSchematicChallengeView extends ChallengeView {
  /**
   * @param {SymbolToSchematicChallenge} challenge
   * @param {Bounds2} layoutBounds
   * @param {Tandem} tandem
   */
  constructor(challenge, layoutBounds, tandem) {
    // Create the model-view transform used by the schematic atom.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(layoutBounds.width * 0.275, layoutBounds.height * 0.45), 0.75);
    super(challenge, layoutBounds, tandem);
    this.interactiveSchematicAtom = new InteractiveSchematicAtom(challenge.buildAnAtomModel, modelViewTransform, {
      highContrastProperty: BAAGlobalPreferences.highContrastParticlesProperty,
      tandem: tandem.createTandem('interactiveSchematicAtom')
    });
    this.interactiveSchematicAtom.scale(0.95);

    // Add interactive schematic atom.
    this.interactiveAnswerNode.addChild(this.interactiveSchematicAtom);

    // Symbol
    const interactiveSymbolNode = new InteractiveSymbolNode(challenge.answerAtom, tandem.createTandem('interactiveSymbolNode'));
    interactiveSymbolNode.scale(0.75);
    this.challengePresentationNode.addChild(interactiveSymbolNode);

    // Layout
    interactiveSymbolNode.centerX = layoutBounds.width * 0.27;
    interactiveSymbolNode.centerY = layoutBounds.height * 0.52;
    this.interactiveSchematicAtom.centerX = layoutBounds.width * 0.745;
    this.interactiveSchematicAtom.centerY = layoutBounds.height * 0.51;

    // @private called by dispose
    this.disposeSymbolToSchematicChallengeView = function () {
      interactiveSymbolNode.dispose();
      this.interactiveSchematicAtom.dispose();
    };
  }

  // @public
  checkAnswer() {
    const submittedAtom = new NumberAtom({
      protonCount: this.challenge.buildAnAtomModel.particleAtom.protonCountProperty.value,
      neutronCount: this.challenge.buildAnAtomModel.particleAtom.neutronCountProperty.value,
      electronCount: this.challenge.buildAnAtomModel.particleAtom.electronCountProperty.value
    });
    this.challenge.checkAnswer(submittedAtom);
  }

  // @public
  displayCorrectAnswer() {
    this.challenge.buildAnAtomModel.setAtomConfiguration(this.challenge.answerAtom);
  }

  // @public
  dispose() {
    this.disposeSymbolToSchematicChallengeView();
    super.dispose();
  }
}
buildAnAtom.register('SymbolToSchematicChallengeView', SymbolToSchematicChallengeView);
export default SymbolToSchematicChallengeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIk51bWJlckF0b20iLCJJbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b20iLCJidWlsZEFuQXRvbSIsIkJBQUdsb2JhbFByZWZlcmVuY2VzIiwiQ2hhbGxlbmdlVmlldyIsIkludGVyYWN0aXZlU3ltYm9sTm9kZSIsIlN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldyIsImNvbnN0cnVjdG9yIiwiY2hhbGxlbmdlIiwibGF5b3V0Qm91bmRzIiwidGFuZGVtIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJaRVJPIiwid2lkdGgiLCJoZWlnaHQiLCJpbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b20iLCJidWlsZEFuQXRvbU1vZGVsIiwiaGlnaENvbnRyYXN0UHJvcGVydHkiLCJoaWdoQ29udHJhc3RQYXJ0aWNsZXNQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInNjYWxlIiwiaW50ZXJhY3RpdmVBbnN3ZXJOb2RlIiwiYWRkQ2hpbGQiLCJpbnRlcmFjdGl2ZVN5bWJvbE5vZGUiLCJhbnN3ZXJBdG9tIiwiY2hhbGxlbmdlUHJlc2VudGF0aW9uTm9kZSIsImNlbnRlclgiLCJjZW50ZXJZIiwiZGlzcG9zZVN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldyIsImRpc3Bvc2UiLCJjaGVja0Fuc3dlciIsInN1Ym1pdHRlZEF0b20iLCJwcm90b25Db3VudCIsInBhcnRpY2xlQXRvbSIsInByb3RvbkNvdW50UHJvcGVydHkiLCJ2YWx1ZSIsIm5ldXRyb25Db3VudCIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwiZWxlY3Ryb25Db3VudCIsImVsZWN0cm9uQ291bnRQcm9wZXJ0eSIsImRpc3BsYXlDb3JyZWN0QW5zd2VyIiwic2V0QXRvbUNvbmZpZ3VyYXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBnYW1lIGNoYWxsZW5nZXMgd2hlcmUgdGhlIHVzZXIgaXMgcHJlc2VudGVkIHdpdGggYSBjaGVtaWNhbCBzeW1ib2xcclxuICogaW5jbHVkaW5nIGF0b21pYyBudW1iZXIsIG1hc3MgbnVtYmVyLCBhbmQgY2hhcmdlLCBhbmQgbmVlZHMgdG8gZGV0ZXJtaW5lXHJcbiAqIHRoZSBudW1iZXIgb2YgcHJvdG9ucywgbmV1dHJvbnMsIGFuZCBlbGVjdHJvbnMgdGhhdCBjb21wcmlzZSB0aGUgYXRvbS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgTnVtYmVyQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9OdW1iZXJBdG9tLmpzJztcclxuaW1wb3J0IEludGVyYWN0aXZlU2NoZW1hdGljQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L0ludGVyYWN0aXZlU2NoZW1hdGljQXRvbS5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcbmltcG9ydCBCQUFHbG9iYWxQcmVmZXJlbmNlcyBmcm9tICcuLi8uLi9jb21tb24vQkFBR2xvYmFsUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlVmlldyBmcm9tICcuL0NoYWxsZW5nZVZpZXcuanMnO1xyXG5pbXBvcnQgSW50ZXJhY3RpdmVTeW1ib2xOb2RlIGZyb20gJy4vSW50ZXJhY3RpdmVTeW1ib2xOb2RlLmpzJztcclxuXHJcbmNsYXNzIFN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldyBleHRlbmRzIENoYWxsZW5nZVZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1N5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlfSBjaGFsbGVuZ2VcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kc1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2hhbGxlbmdlLCBsYXlvdXRCb3VuZHMsIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtIHVzZWQgYnkgdGhlIHNjaGVtYXRpYyBhdG9tLlxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyhcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICBuZXcgVmVjdG9yMiggbGF5b3V0Qm91bmRzLndpZHRoICogMC4yNzUsIGxheW91dEJvdW5kcy5oZWlnaHQgKiAwLjQ1ICksXHJcbiAgICAgIDAuNzVcclxuICAgICk7XHJcblxyXG4gICAgc3VwZXIoIGNoYWxsZW5nZSwgbGF5b3V0Qm91bmRzLCB0YW5kZW0gKTtcclxuXHJcbiAgICB0aGlzLmludGVyYWN0aXZlU2NoZW1hdGljQXRvbSA9IG5ldyBJbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b20oIGNoYWxsZW5nZS5idWlsZEFuQXRvbU1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgaGlnaENvbnRyYXN0UHJvcGVydHk6IEJBQUdsb2JhbFByZWZlcmVuY2VzLmhpZ2hDb250cmFzdFBhcnRpY2xlc1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b20nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuaW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tLnNjYWxlKCAwLjk1ICk7XHJcblxyXG5cclxuICAgIC8vIEFkZCBpbnRlcmFjdGl2ZSBzY2hlbWF0aWMgYXRvbS5cclxuICAgIHRoaXMuaW50ZXJhY3RpdmVBbnN3ZXJOb2RlLmFkZENoaWxkKCB0aGlzLmludGVyYWN0aXZlU2NoZW1hdGljQXRvbSApO1xyXG5cclxuICAgIC8vIFN5bWJvbFxyXG4gICAgY29uc3QgaW50ZXJhY3RpdmVTeW1ib2xOb2RlID0gbmV3IEludGVyYWN0aXZlU3ltYm9sTm9kZSggY2hhbGxlbmdlLmFuc3dlckF0b20sIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnRlcmFjdGl2ZVN5bWJvbE5vZGUnICkgKTtcclxuICAgIGludGVyYWN0aXZlU3ltYm9sTm9kZS5zY2FsZSggMC43NSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcmVzZW50YXRpb25Ob2RlLmFkZENoaWxkKCBpbnRlcmFjdGl2ZVN5bWJvbE5vZGUgKTtcclxuXHJcbiAgICAvLyBMYXlvdXRcclxuICAgIGludGVyYWN0aXZlU3ltYm9sTm9kZS5jZW50ZXJYID0gbGF5b3V0Qm91bmRzLndpZHRoICogMC4yNztcclxuICAgIGludGVyYWN0aXZlU3ltYm9sTm9kZS5jZW50ZXJZID0gbGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNTI7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlU2NoZW1hdGljQXRvbS5jZW50ZXJYID0gbGF5b3V0Qm91bmRzLndpZHRoICogMC43NDU7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlU2NoZW1hdGljQXRvbS5jZW50ZXJZID0gbGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNTE7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgY2FsbGVkIGJ5IGRpc3Bvc2VcclxuICAgIHRoaXMuZGlzcG9zZVN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpbnRlcmFjdGl2ZVN5bWJvbE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmludGVyYWN0aXZlU2NoZW1hdGljQXRvbS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGNoZWNrQW5zd2VyKCkge1xyXG4gICAgY29uc3Qgc3VibWl0dGVkQXRvbSA9IG5ldyBOdW1iZXJBdG9tKCB7XHJcbiAgICAgIHByb3RvbkNvdW50OiB0aGlzLmNoYWxsZW5nZS5idWlsZEFuQXRvbU1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBuZXV0cm9uQ291bnQ6IHRoaXMuY2hhbGxlbmdlLmJ1aWxkQW5BdG9tTW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBlbGVjdHJvbkNvdW50OiB0aGlzLmNoYWxsZW5nZS5idWlsZEFuQXRvbU1vZGVsLnBhcnRpY2xlQXRvbS5lbGVjdHJvbkNvdW50UHJvcGVydHkudmFsdWVcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlLmNoZWNrQW5zd2VyKCBzdWJtaXR0ZWRBdG9tICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZGlzcGxheUNvcnJlY3RBbnN3ZXIoKSB7XHJcbiAgICB0aGlzLmNoYWxsZW5nZS5idWlsZEFuQXRvbU1vZGVsLnNldEF0b21Db25maWd1cmF0aW9uKCB0aGlzLmNoYWxsZW5nZS5hbnN3ZXJBdG9tICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZVN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldygpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdTeW1ib2xUb1NjaGVtYXRpY0NoYWxsZW5nZVZpZXcnLCBTeW1ib2xUb1NjaGVtYXRpY0NoYWxsZW5nZVZpZXcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN5bWJvbFRvU2NoZW1hdGljQ2hhbGxlbmdlVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFVBQVUsTUFBTSwwQ0FBMEM7QUFDakUsT0FBT0Msd0JBQXdCLE1BQU0sdURBQXVEO0FBQzVGLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msb0JBQW9CLE1BQU0sc0NBQXNDO0FBQ3ZFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRTlELE1BQU1DLDhCQUE4QixTQUFTRixhQUFhLENBQUM7RUFFekQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLFlBQVksRUFBRUMsTUFBTSxFQUFHO0lBRTdDO0lBQ0EsTUFBTUMsa0JBQWtCLEdBQUdaLG1CQUFtQixDQUFDYSxzQ0FBc0MsQ0FDbkZkLE9BQU8sQ0FBQ2UsSUFBSSxFQUNaLElBQUlmLE9BQU8sQ0FBRVcsWUFBWSxDQUFDSyxLQUFLLEdBQUcsS0FBSyxFQUFFTCxZQUFZLENBQUNNLE1BQU0sR0FBRyxJQUFLLENBQUMsRUFDckUsSUFDRixDQUFDO0lBRUQsS0FBSyxDQUFFUCxTQUFTLEVBQUVDLFlBQVksRUFBRUMsTUFBTyxDQUFDO0lBRXhDLElBQUksQ0FBQ00sd0JBQXdCLEdBQUcsSUFBSWYsd0JBQXdCLENBQUVPLFNBQVMsQ0FBQ1MsZ0JBQWdCLEVBQUVOLGtCQUFrQixFQUFFO01BQzVHTyxvQkFBb0IsRUFBRWYsb0JBQW9CLENBQUNnQiw2QkFBNkI7TUFDeEVULE1BQU0sRUFBRUEsTUFBTSxDQUFDVSxZQUFZLENBQUUsMEJBQTJCO0lBQzFELENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0osd0JBQXdCLENBQUNLLEtBQUssQ0FBRSxJQUFLLENBQUM7O0lBRzNDO0lBQ0EsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ1Asd0JBQXlCLENBQUM7O0lBRXBFO0lBQ0EsTUFBTVEscUJBQXFCLEdBQUcsSUFBSW5CLHFCQUFxQixDQUFFRyxTQUFTLENBQUNpQixVQUFVLEVBQUVmLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLHVCQUF3QixDQUFFLENBQUM7SUFDL0hJLHFCQUFxQixDQUFDSCxLQUFLLENBQUUsSUFBSyxDQUFDO0lBQ25DLElBQUksQ0FBQ0sseUJBQXlCLENBQUNILFFBQVEsQ0FBRUMscUJBQXNCLENBQUM7O0lBRWhFO0lBQ0FBLHFCQUFxQixDQUFDRyxPQUFPLEdBQUdsQixZQUFZLENBQUNLLEtBQUssR0FBRyxJQUFJO0lBQ3pEVSxxQkFBcUIsQ0FBQ0ksT0FBTyxHQUFHbkIsWUFBWSxDQUFDTSxNQUFNLEdBQUcsSUFBSTtJQUMxRCxJQUFJLENBQUNDLHdCQUF3QixDQUFDVyxPQUFPLEdBQUdsQixZQUFZLENBQUNLLEtBQUssR0FBRyxLQUFLO0lBQ2xFLElBQUksQ0FBQ0Usd0JBQXdCLENBQUNZLE9BQU8sR0FBR25CLFlBQVksQ0FBQ00sTUFBTSxHQUFHLElBQUk7O0lBRWxFO0lBQ0EsSUFBSSxDQUFDYyxxQ0FBcUMsR0FBRyxZQUFXO01BQ3RETCxxQkFBcUIsQ0FBQ00sT0FBTyxDQUFDLENBQUM7TUFDL0IsSUFBSSxDQUFDZCx3QkFBd0IsQ0FBQ2MsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztFQUNIOztFQUVBO0VBQ0FDLFdBQVdBLENBQUEsRUFBRztJQUNaLE1BQU1DLGFBQWEsR0FBRyxJQUFJaEMsVUFBVSxDQUFFO01BQ3BDaUMsV0FBVyxFQUFFLElBQUksQ0FBQ3pCLFNBQVMsQ0FBQ1MsZ0JBQWdCLENBQUNpQixZQUFZLENBQUNDLG1CQUFtQixDQUFDQyxLQUFLO01BQ25GQyxZQUFZLEVBQUUsSUFBSSxDQUFDN0IsU0FBUyxDQUFDUyxnQkFBZ0IsQ0FBQ2lCLFlBQVksQ0FBQ0ksb0JBQW9CLENBQUNGLEtBQUs7TUFDckZHLGFBQWEsRUFBRSxJQUFJLENBQUMvQixTQUFTLENBQUNTLGdCQUFnQixDQUFDaUIsWUFBWSxDQUFDTSxxQkFBcUIsQ0FBQ0o7SUFDcEYsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDNUIsU0FBUyxDQUFDdUIsV0FBVyxDQUFFQyxhQUFjLENBQUM7RUFDN0M7O0VBRUE7RUFDQVMsb0JBQW9CQSxDQUFBLEVBQUc7SUFDckIsSUFBSSxDQUFDakMsU0FBUyxDQUFDUyxnQkFBZ0IsQ0FBQ3lCLG9CQUFvQixDQUFFLElBQUksQ0FBQ2xDLFNBQVMsQ0FBQ2lCLFVBQVcsQ0FBQztFQUNuRjs7RUFFQTtFQUNBSyxPQUFPQSxDQUFBLEVBQUc7SUFDUixJQUFJLENBQUNELHFDQUFxQyxDQUFDLENBQUM7SUFDNUMsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUE1QixXQUFXLENBQUN5QyxRQUFRLENBQUUsZ0NBQWdDLEVBQUVyQyw4QkFBK0IsQ0FBQztBQUV4RixlQUFlQSw4QkFBOEIifQ==