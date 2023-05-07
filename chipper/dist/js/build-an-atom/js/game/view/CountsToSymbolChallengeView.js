// Copyright 2013-2021, University of Colorado Boulder

/**
 * View for game challenges where the user is presented with a set of particle
 * counts for an atom and must determine the total charge and enter it in an
 * interactive element symbol.
 *
 * @author John Blanco
 */

import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import buildAnAtom from '../../buildAnAtom.js';
import ChallengeView from './ChallengeView.js';
import InteractiveSymbolNode from './InteractiveSymbolNode.js';
import ParticleCountsNode from './ParticleCountsNode.js';
class CountsToSymbolChallengeView extends ChallengeView {
  /**
   * @param {CountsToSymbolChallenge} toSymbolChallenge
   * @param {Bounds2} layoutBounds
   * @param {Tandem} tandem
   */
  constructor(toSymbolChallenge, layoutBounds, tandem) {
    super(toSymbolChallenge, layoutBounds, tandem);

    // @public {read-only)
    this.interactiveSymbolNode = new InteractiveSymbolNode(toSymbolChallenge.answerAtom, tandem.createTandem('interactiveSymbolNode'), {
      interactiveProtonCount: toSymbolChallenge.configurableProtonCount,
      interactiveMassNumber: toSymbolChallenge.configurableMassNumber,
      interactiveCharge: toSymbolChallenge.configurableCharge
    });

    // Add the interactive symbol.
    this.interactiveSymbolNode.scale(0.75);
    this.interactiveAnswerNode.addChild(this.interactiveSymbolNode);

    // Particle counts
    const particleCountsNode = new ParticleCountsNode(toSymbolChallenge.answerAtom);
    this.challengePresentationNode.addChild(particleCountsNode);

    // Layout
    particleCountsNode.centerX = layoutBounds.width * 0.3;
    particleCountsNode.centerY = layoutBounds.height * 0.48;
    this.interactiveSymbolNode.centerX = layoutBounds.width * 0.745;
    this.interactiveSymbolNode.centerY = layoutBounds.height * 0.54;

    // @private called by dispose
    this.disposeCountsToSymbolChallengeView = function () {
      this.interactiveSymbolNode.dispose();
    };
  }

  // @public
  checkAnswer() {
    const userSubmittedAtom = new NumberAtom({
      protonCount: this.interactiveSymbolNode.protonCountProperty.value,
      neutronCount: this.interactiveSymbolNode.massNumberProperty.value - this.interactiveSymbolNode.protonCountProperty.value,
      electronCount: this.interactiveSymbolNode.protonCountProperty.value - this.interactiveSymbolNode.chargeProperty.value
    });
    this.challenge.checkAnswer(userSubmittedAtom);
  }

  // @public
  displayCorrectAnswer() {
    this.interactiveSymbolNode.protonCountProperty.value = this.challenge.answerAtom.protonCountProperty.get();
    this.interactiveSymbolNode.massNumberProperty.value = this.challenge.answerAtom.massNumberProperty.get();
    this.interactiveSymbolNode.chargeProperty.value = this.challenge.answerAtom.chargeProperty.get();
  }

  /**
   * release references
   * @public
   */
  dispose() {
    this.disposeCountsToSymbolChallengeView();
    super.dispose();
  }
}
buildAnAtom.register('CountsToSymbolChallengeView', CountsToSymbolChallengeView);
export default CountsToSymbolChallengeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJBdG9tIiwiYnVpbGRBbkF0b20iLCJDaGFsbGVuZ2VWaWV3IiwiSW50ZXJhY3RpdmVTeW1ib2xOb2RlIiwiUGFydGljbGVDb3VudHNOb2RlIiwiQ291bnRzVG9TeW1ib2xDaGFsbGVuZ2VWaWV3IiwiY29uc3RydWN0b3IiLCJ0b1N5bWJvbENoYWxsZW5nZSIsImxheW91dEJvdW5kcyIsInRhbmRlbSIsImludGVyYWN0aXZlU3ltYm9sTm9kZSIsImFuc3dlckF0b20iLCJjcmVhdGVUYW5kZW0iLCJpbnRlcmFjdGl2ZVByb3RvbkNvdW50IiwiY29uZmlndXJhYmxlUHJvdG9uQ291bnQiLCJpbnRlcmFjdGl2ZU1hc3NOdW1iZXIiLCJjb25maWd1cmFibGVNYXNzTnVtYmVyIiwiaW50ZXJhY3RpdmVDaGFyZ2UiLCJjb25maWd1cmFibGVDaGFyZ2UiLCJzY2FsZSIsImludGVyYWN0aXZlQW5zd2VyTm9kZSIsImFkZENoaWxkIiwicGFydGljbGVDb3VudHNOb2RlIiwiY2hhbGxlbmdlUHJlc2VudGF0aW9uTm9kZSIsImNlbnRlclgiLCJ3aWR0aCIsImNlbnRlclkiLCJoZWlnaHQiLCJkaXNwb3NlQ291bnRzVG9TeW1ib2xDaGFsbGVuZ2VWaWV3IiwiZGlzcG9zZSIsImNoZWNrQW5zd2VyIiwidXNlclN1Ym1pdHRlZEF0b20iLCJwcm90b25Db3VudCIsInByb3RvbkNvdW50UHJvcGVydHkiLCJ2YWx1ZSIsIm5ldXRyb25Db3VudCIsIm1hc3NOdW1iZXJQcm9wZXJ0eSIsImVsZWN0cm9uQ291bnQiLCJjaGFyZ2VQcm9wZXJ0eSIsImNoYWxsZW5nZSIsImRpc3BsYXlDb3JyZWN0QW5zd2VyIiwiZ2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb3VudHNUb1N5bWJvbENoYWxsZW5nZVZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgZ2FtZSBjaGFsbGVuZ2VzIHdoZXJlIHRoZSB1c2VyIGlzIHByZXNlbnRlZCB3aXRoIGEgc2V0IG9mIHBhcnRpY2xlXHJcbiAqIGNvdW50cyBmb3IgYW4gYXRvbSBhbmQgbXVzdCBkZXRlcm1pbmUgdGhlIHRvdGFsIGNoYXJnZSBhbmQgZW50ZXIgaXQgaW4gYW5cclxuICogaW50ZXJhY3RpdmUgZWxlbWVudCBzeW1ib2wuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9OdW1iZXJBdG9tLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IENoYWxsZW5nZVZpZXcgZnJvbSAnLi9DaGFsbGVuZ2VWaWV3LmpzJztcclxuaW1wb3J0IEludGVyYWN0aXZlU3ltYm9sTm9kZSBmcm9tICcuL0ludGVyYWN0aXZlU3ltYm9sTm9kZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUNvdW50c05vZGUgZnJvbSAnLi9QYXJ0aWNsZUNvdW50c05vZGUuanMnO1xyXG5cclxuY2xhc3MgQ291bnRzVG9TeW1ib2xDaGFsbGVuZ2VWaWV3IGV4dGVuZHMgQ2hhbGxlbmdlVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q291bnRzVG9TeW1ib2xDaGFsbGVuZ2V9IHRvU3ltYm9sQ2hhbGxlbmdlXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHNcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRvU3ltYm9sQ2hhbGxlbmdlLCBsYXlvdXRCb3VuZHMsIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggdG9TeW1ib2xDaGFsbGVuZ2UsIGxheW91dEJvdW5kcywgdGFuZGVtICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7cmVhZC1vbmx5KVxyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUgPSBuZXcgSW50ZXJhY3RpdmVTeW1ib2xOb2RlKFxyXG4gICAgICB0b1N5bWJvbENoYWxsZW5nZS5hbnN3ZXJBdG9tLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW50ZXJhY3RpdmVTeW1ib2xOb2RlJyApLCB7XHJcbiAgICAgICAgaW50ZXJhY3RpdmVQcm90b25Db3VudDogdG9TeW1ib2xDaGFsbGVuZ2UuY29uZmlndXJhYmxlUHJvdG9uQ291bnQsXHJcbiAgICAgICAgaW50ZXJhY3RpdmVNYXNzTnVtYmVyOiB0b1N5bWJvbENoYWxsZW5nZS5jb25maWd1cmFibGVNYXNzTnVtYmVyLFxyXG4gICAgICAgIGludGVyYWN0aXZlQ2hhcmdlOiB0b1N5bWJvbENoYWxsZW5nZS5jb25maWd1cmFibGVDaGFyZ2VcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGludGVyYWN0aXZlIHN5bWJvbC5cclxuICAgIHRoaXMuaW50ZXJhY3RpdmVTeW1ib2xOb2RlLnNjYWxlKCAwLjc1ICk7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlQW5zd2VyTm9kZS5hZGRDaGlsZCggdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUgKTtcclxuXHJcbiAgICAvLyBQYXJ0aWNsZSBjb3VudHNcclxuICAgIGNvbnN0IHBhcnRpY2xlQ291bnRzTm9kZSA9IG5ldyBQYXJ0aWNsZUNvdW50c05vZGUoIHRvU3ltYm9sQ2hhbGxlbmdlLmFuc3dlckF0b20gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlUHJlc2VudGF0aW9uTm9kZS5hZGRDaGlsZCggcGFydGljbGVDb3VudHNOb2RlICk7XHJcblxyXG4gICAgLy8gTGF5b3V0XHJcbiAgICBwYXJ0aWNsZUNvdW50c05vZGUuY2VudGVyWCA9IGxheW91dEJvdW5kcy53aWR0aCAqIDAuMztcclxuICAgIHBhcnRpY2xlQ291bnRzTm9kZS5jZW50ZXJZID0gbGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNDg7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5jZW50ZXJYID0gbGF5b3V0Qm91bmRzLndpZHRoICogMC43NDU7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5jZW50ZXJZID0gbGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNTQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgY2FsbGVkIGJ5IGRpc3Bvc2VcclxuICAgIHRoaXMuZGlzcG9zZUNvdW50c1RvU3ltYm9sQ2hhbGxlbmdlVmlldyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGNoZWNrQW5zd2VyKCkge1xyXG4gICAgY29uc3QgdXNlclN1Ym1pdHRlZEF0b20gPSBuZXcgTnVtYmVyQXRvbSgge1xyXG4gICAgICBwcm90b25Db3VudDogdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgbmV1dHJvbkNvdW50OiB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5tYXNzTnVtYmVyUHJvcGVydHkudmFsdWUgLSB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBlbGVjdHJvbkNvdW50OiB0aGlzLmludGVyYWN0aXZlU3ltYm9sTm9kZS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlIC0gdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUuY2hhcmdlUHJvcGVydHkudmFsdWVcclxuICAgIH0gKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlLmNoZWNrQW5zd2VyKCB1c2VyU3VibWl0dGVkQXRvbSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGRpc3BsYXlDb3JyZWN0QW5zd2VyKCkge1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuY2hhbGxlbmdlLmFuc3dlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuaW50ZXJhY3RpdmVTeW1ib2xOb2RlLm1hc3NOdW1iZXJQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuY2hhbGxlbmdlLmFuc3dlckF0b20ubWFzc051bWJlclByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZVN5bWJvbE5vZGUuY2hhcmdlUHJvcGVydHkudmFsdWUgPSB0aGlzLmNoYWxsZW5nZS5hbnN3ZXJBdG9tLmNoYXJnZVByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcmVsZWFzZSByZWZlcmVuY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VDb3VudHNUb1N5bWJvbENoYWxsZW5nZVZpZXcoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnQ291bnRzVG9TeW1ib2xDaGFsbGVuZ2VWaWV3JywgQ291bnRzVG9TeW1ib2xDaGFsbGVuZ2VWaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb3VudHNUb1N5bWJvbENoYWxsZW5nZVZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sMENBQTBDO0FBQ2pFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFDOUQsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBRXhELE1BQU1DLDJCQUEyQixTQUFTSCxhQUFhLENBQUM7RUFFdEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFX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