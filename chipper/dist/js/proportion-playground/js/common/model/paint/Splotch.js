// Copyright 2016-2022, University of Colorado Boulder

/**
 * The model for a single paint splotch. Colors are combined in the view.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import SceneRatio from '../SceneRatio.js';
import Side from '../Side.js';
import PaintBalloon from './PaintBalloon.js';
import PaintDrip from './PaintDrip.js';
import PaintQuantity from './PaintQuantity.js';
class Splotch extends SceneRatio {
  /**
   * @param {number} initialLeftCount - Initial quantity of the left paint
   * @param {number} initialRightCount - Initial quantity of the right paint
   * @param {Property.<boolean>} visibleProperty - Whether our visual representation is visible
   * @param {Property.<boolean>} controlsVisibleProperty - Whether our controls are visible
   * @param {Tandem} tandem
   */
  constructor(initialLeftCount, initialRightCount, visibleProperty, controlsVisibleProperty, tandem) {
    const balloons = createObservableArray();
    const drips = createObservableArray();
    const leftQuantity = createPaintQuantity(initialLeftCount, Side.LEFT, balloons, drips, () => this.visibleLeftColorProperty, tandem.createTandem('leftQuantity'));
    const rightQuantity = createPaintQuantity(initialRightCount, Side.RIGHT, balloons, drips, () => this.visibleRightColorProperty, tandem.createTandem('rightQuantity'));
    super(visibleProperty, controlsVisibleProperty, leftQuantity.realCountProperty, rightQuantity.realCountProperty, tandem);

    // @public {PaintQuantity} - For each side
    this.leftQuantity = leftQuantity;
    this.rightQuantity = rightQuantity;

    // @public {ObservableArrayDef.<PaintBalloon>}
    this.balloons = balloons;

    // @public {ObservableArrayDef.<PaintDrip>}
    this.drips = drips;

    // @public {NumberProperty} - Amount of paint from the color choice on the left (after resulting balloons have landed)
    this.leftColorCountProperty = this.leftQuantity.realCountProperty;

    // @public {NumberProperty} - Amount of paint form the color choice on the right (after resulting balloons have landed)
    this.rightColorCountProperty = this.rightQuantity.realCountProperty;

    // @private {NumberProperty} - Amount of displayed paint (can increase after balloons hit). Can go negative.
    this.currentLeftColorProperty = this.leftQuantity.currentCountProperty;
    this.currentRightColorProperty = this.rightQuantity.currentCountProperty;

    // @public {Property.<number>} - Non-negative version of our internal count, with maximums designed to limit the
    // temporary appearance of https://github.com/phetsims/proportion-playground/issues/101.
    this.visibleLeftColorProperty = new DerivedProperty([this.leftQuantity.paintAreaProperty], value => Math.min(value, ProportionPlaygroundConstants.PAINT_COUNT_RANGE.max));
    this.visibleRightColorProperty = new DerivedProperty([this.rightQuantity.paintAreaProperty], value => Math.min(value, ProportionPlaygroundConstants.PAINT_COUNT_RANGE.max));

    // Clear balloons/drips in progress when visibility changes, see https://github.com/phetsims/proportion-playground/issues/100
    visibleProperty.lazyLink(visible => {
      this.step(10000); // Just step a really big number (but not infinity, since we rely on finite numbers)
    });
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt - Time to move forward in seconds
   */
  step(dt) {
    // Step balloons in reverse order, since they can remove themselves
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      this.balloons.get(i).step(dt);
    }
    for (let i = this.drips.length - 1; i >= 0; i--) {
      this.drips.get(i).step(dt);
    }
  }

  /**
   * Resets the model
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.leftQuantity.reset();
    this.rightQuantity.reset();
    this.balloons.clear();
    this.drips.clear();

    // Additional reset needed, as balloons/drips can potentially change the quantity when removed.
    this.leftQuantity.reset();
    this.rightQuantity.reset();
  }
}
proportionPlayground.register('Splotch', Splotch);

/**
 * Creates a PaintQuantity given an initialCount / side.
 * @private
 *
 * @param {number} initialCount
 * @param {Side} side
 * @param {Array.<PaintBallon>} balloons
 * @param {Array.<PaintDrip>} drips
 * @param {function} getVisibleColorProperty
 * @param {Tandem} tandem
 * @returns {PaintQuantity}
 */
function createPaintQuantity(initialCount, side, balloons, drips, getVisibleColorProperty, tandem) {
  return new PaintQuantity(initialCount, hitCallback => {
    balloons.push(new PaintBalloon(side, balloon => {
      balloons.remove(balloon);
      hitCallback();
    }));
  }, (amountToDrip, removeCallback) => {
    const visibleColorProperty = getVisibleColorProperty();
    drips.push(new PaintDrip(side, drip => {
      drips.remove(drip);
    }, amountToDrip, removeCallback, visibleColorProperty.value));
  }, tandem);
}
export default Splotch;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIiwiU2NlbmVSYXRpbyIsIlNpZGUiLCJQYWludEJhbGxvb24iLCJQYWludERyaXAiLCJQYWludFF1YW50aXR5IiwiU3Bsb3RjaCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbExlZnRDb3VudCIsImluaXRpYWxSaWdodENvdW50IiwidmlzaWJsZVByb3BlcnR5IiwiY29udHJvbHNWaXNpYmxlUHJvcGVydHkiLCJ0YW5kZW0iLCJiYWxsb29ucyIsImRyaXBzIiwibGVmdFF1YW50aXR5IiwiY3JlYXRlUGFpbnRRdWFudGl0eSIsIkxFRlQiLCJ2aXNpYmxlTGVmdENvbG9yUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJyaWdodFF1YW50aXR5IiwiUklHSFQiLCJ2aXNpYmxlUmlnaHRDb2xvclByb3BlcnR5IiwicmVhbENvdW50UHJvcGVydHkiLCJsZWZ0Q29sb3JDb3VudFByb3BlcnR5IiwicmlnaHRDb2xvckNvdW50UHJvcGVydHkiLCJjdXJyZW50TGVmdENvbG9yUHJvcGVydHkiLCJjdXJyZW50Q291bnRQcm9wZXJ0eSIsImN1cnJlbnRSaWdodENvbG9yUHJvcGVydHkiLCJwYWludEFyZWFQcm9wZXJ0eSIsInZhbHVlIiwiTWF0aCIsIm1pbiIsIlBBSU5UX0NPVU5UX1JBTkdFIiwibWF4IiwibGF6eUxpbmsiLCJ2aXNpYmxlIiwic3RlcCIsImR0IiwiaSIsImxlbmd0aCIsImdldCIsInJlc2V0IiwiY2xlYXIiLCJyZWdpc3RlciIsImluaXRpYWxDb3VudCIsInNpZGUiLCJnZXRWaXNpYmxlQ29sb3JQcm9wZXJ0eSIsImhpdENhbGxiYWNrIiwicHVzaCIsImJhbGxvb24iLCJyZW1vdmUiLCJhbW91bnRUb0RyaXAiLCJyZW1vdmVDYWxsYmFjayIsInZpc2libGVDb2xvclByb3BlcnR5IiwiZHJpcCJdLCJzb3VyY2VzIjpbIlNwbG90Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1vZGVsIGZvciBhIHNpbmdsZSBwYWludCBzcGxvdGNoLiBDb2xvcnMgYXJlIGNvbWJpbmVkIGluIHRoZSB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIGZyb20gJy4uLy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNjZW5lUmF0aW8gZnJvbSAnLi4vU2NlbmVSYXRpby5qcyc7XHJcbmltcG9ydCBTaWRlIGZyb20gJy4uL1NpZGUuanMnO1xyXG5pbXBvcnQgUGFpbnRCYWxsb29uIGZyb20gJy4vUGFpbnRCYWxsb29uLmpzJztcclxuaW1wb3J0IFBhaW50RHJpcCBmcm9tICcuL1BhaW50RHJpcC5qcyc7XHJcbmltcG9ydCBQYWludFF1YW50aXR5IGZyb20gJy4vUGFpbnRRdWFudGl0eS5qcyc7XHJcblxyXG5jbGFzcyBTcGxvdGNoIGV4dGVuZHMgU2NlbmVSYXRpbyB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWxMZWZ0Q291bnQgLSBJbml0aWFsIHF1YW50aXR5IG9mIHRoZSBsZWZ0IHBhaW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWxSaWdodENvdW50IC0gSW5pdGlhbCBxdWFudGl0eSBvZiB0aGUgcmlnaHQgcGFpbnRcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gdmlzaWJsZVByb3BlcnR5IC0gV2hldGhlciBvdXIgdmlzdWFsIHJlcHJlc2VudGF0aW9uIGlzIHZpc2libGVcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gY29udHJvbHNWaXNpYmxlUHJvcGVydHkgLSBXaGV0aGVyIG91ciBjb250cm9scyBhcmUgdmlzaWJsZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbExlZnRDb3VudCwgaW5pdGlhbFJpZ2h0Q291bnQsIHZpc2libGVQcm9wZXJ0eSwgY29udHJvbHNWaXNpYmxlUHJvcGVydHksIHRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBiYWxsb29ucyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgY29uc3QgZHJpcHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICBjb25zdCBsZWZ0UXVhbnRpdHkgPSBjcmVhdGVQYWludFF1YW50aXR5KCBpbml0aWFsTGVmdENvdW50LCBTaWRlLkxFRlQsIGJhbGxvb25zLCBkcmlwcywgKCkgPT4gdGhpcy52aXNpYmxlTGVmdENvbG9yUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWZ0UXVhbnRpdHknICkgKTtcclxuICAgIGNvbnN0IHJpZ2h0UXVhbnRpdHkgPSBjcmVhdGVQYWludFF1YW50aXR5KCBpbml0aWFsUmlnaHRDb3VudCwgU2lkZS5SSUdIVCwgYmFsbG9vbnMsIGRyaXBzLCAoKSA9PiB0aGlzLnZpc2libGVSaWdodENvbG9yUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyaWdodFF1YW50aXR5JyApICk7XHJcblxyXG4gICAgc3VwZXIoIHZpc2libGVQcm9wZXJ0eSwgY29udHJvbHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIGxlZnRRdWFudGl0eS5yZWFsQ291bnRQcm9wZXJ0eSxcclxuICAgICAgcmlnaHRRdWFudGl0eS5yZWFsQ291bnRQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGFpbnRRdWFudGl0eX0gLSBGb3IgZWFjaCBzaWRlXHJcbiAgICB0aGlzLmxlZnRRdWFudGl0eSA9IGxlZnRRdWFudGl0eTtcclxuICAgIHRoaXMucmlnaHRRdWFudGl0eSA9IHJpZ2h0UXVhbnRpdHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxQYWludEJhbGxvb24+fVxyXG4gICAgdGhpcy5iYWxsb29ucyA9IGJhbGxvb25zO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge09ic2VydmFibGVBcnJheURlZi48UGFpbnREcmlwPn1cclxuICAgIHRoaXMuZHJpcHMgPSBkcmlwcztcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBBbW91bnQgb2YgcGFpbnQgZnJvbSB0aGUgY29sb3IgY2hvaWNlIG9uIHRoZSBsZWZ0IChhZnRlciByZXN1bHRpbmcgYmFsbG9vbnMgaGF2ZSBsYW5kZWQpXHJcbiAgICB0aGlzLmxlZnRDb2xvckNvdW50UHJvcGVydHkgPSB0aGlzLmxlZnRRdWFudGl0eS5yZWFsQ291bnRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBBbW91bnQgb2YgcGFpbnQgZm9ybSB0aGUgY29sb3IgY2hvaWNlIG9uIHRoZSByaWdodCAoYWZ0ZXIgcmVzdWx0aW5nIGJhbGxvb25zIGhhdmUgbGFuZGVkKVxyXG4gICAgdGhpcy5yaWdodENvbG9yQ291bnRQcm9wZXJ0eSA9IHRoaXMucmlnaHRRdWFudGl0eS5yZWFsQ291bnRQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7TnVtYmVyUHJvcGVydHl9IC0gQW1vdW50IG9mIGRpc3BsYXllZCBwYWludCAoY2FuIGluY3JlYXNlIGFmdGVyIGJhbGxvb25zIGhpdCkuIENhbiBnbyBuZWdhdGl2ZS5cclxuICAgIHRoaXMuY3VycmVudExlZnRDb2xvclByb3BlcnR5ID0gdGhpcy5sZWZ0UXVhbnRpdHkuY3VycmVudENvdW50UHJvcGVydHk7XHJcbiAgICB0aGlzLmN1cnJlbnRSaWdodENvbG9yUHJvcGVydHkgPSB0aGlzLnJpZ2h0UXVhbnRpdHkuY3VycmVudENvdW50UHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gTm9uLW5lZ2F0aXZlIHZlcnNpb24gb2Ygb3VyIGludGVybmFsIGNvdW50LCB3aXRoIG1heGltdW1zIGRlc2lnbmVkIHRvIGxpbWl0IHRoZVxyXG4gICAgLy8gdGVtcG9yYXJ5IGFwcGVhcmFuY2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb3BvcnRpb24tcGxheWdyb3VuZC9pc3N1ZXMvMTAxLlxyXG4gICAgdGhpcy52aXNpYmxlTGVmdENvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubGVmdFF1YW50aXR5LnBhaW50QXJlYVByb3BlcnR5IF0sIHZhbHVlID0+IE1hdGgubWluKCB2YWx1ZSwgUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMuUEFJTlRfQ09VTlRfUkFOR0UubWF4ICkgKTtcclxuICAgIHRoaXMudmlzaWJsZVJpZ2h0Q29sb3JQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5yaWdodFF1YW50aXR5LnBhaW50QXJlYVByb3BlcnR5IF0sIHZhbHVlID0+IE1hdGgubWluKCB2YWx1ZSwgUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMuUEFJTlRfQ09VTlRfUkFOR0UubWF4ICkgKTtcclxuXHJcbiAgICAvLyBDbGVhciBiYWxsb29ucy9kcmlwcyBpbiBwcm9ncmVzcyB3aGVuIHZpc2liaWxpdHkgY2hhbmdlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wcm9wb3J0aW9uLXBsYXlncm91bmQvaXNzdWVzLzEwMFxyXG4gICAgdmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgdGhpcy5zdGVwKCAxMDAwMCApOyAvLyBKdXN0IHN0ZXAgYSByZWFsbHkgYmlnIG51bWJlciAoYnV0IG5vdCBpbmZpbml0eSwgc2luY2Ugd2UgcmVseSBvbiBmaW5pdGUgbnVtYmVycylcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBUaW1lIHRvIG1vdmUgZm9yd2FyZCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICAvLyBTdGVwIGJhbGxvb25zIGluIHJldmVyc2Ugb3JkZXIsIHNpbmNlIHRoZXkgY2FuIHJlbW92ZSB0aGVtc2VsdmVzXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuYmFsbG9vbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIHRoaXMuYmFsbG9vbnMuZ2V0KCBpICkuc3RlcCggZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuZHJpcHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XHJcbiAgICAgIHRoaXMuZHJpcHMuZ2V0KCBpICkuc3RlcCggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgbW9kZWxcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMubGVmdFF1YW50aXR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJpZ2h0UXVhbnRpdHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmJhbGxvb25zLmNsZWFyKCk7XHJcbiAgICB0aGlzLmRyaXBzLmNsZWFyKCk7XHJcblxyXG4gICAgLy8gQWRkaXRpb25hbCByZXNldCBuZWVkZWQsIGFzIGJhbGxvb25zL2RyaXBzIGNhbiBwb3RlbnRpYWxseSBjaGFuZ2UgdGhlIHF1YW50aXR5IHdoZW4gcmVtb3ZlZC5cclxuICAgIHRoaXMubGVmdFF1YW50aXR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJpZ2h0UXVhbnRpdHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnByb3BvcnRpb25QbGF5Z3JvdW5kLnJlZ2lzdGVyKCAnU3Bsb3RjaCcsIFNwbG90Y2ggKTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgUGFpbnRRdWFudGl0eSBnaXZlbiBhbiBpbml0aWFsQ291bnQgLyBzaWRlLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbENvdW50XHJcbiAqIEBwYXJhbSB7U2lkZX0gc2lkZVxyXG4gKiBAcGFyYW0ge0FycmF5LjxQYWludEJhbGxvbj59IGJhbGxvb25zXHJcbiAqIEBwYXJhbSB7QXJyYXkuPFBhaW50RHJpcD59IGRyaXBzXHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGdldFZpc2libGVDb2xvclByb3BlcnR5XHJcbiAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICogQHJldHVybnMge1BhaW50UXVhbnRpdHl9XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVQYWludFF1YW50aXR5KCBpbml0aWFsQ291bnQsIHNpZGUsIGJhbGxvb25zLCBkcmlwcywgZ2V0VmlzaWJsZUNvbG9yUHJvcGVydHksIHRhbmRlbSApIHtcclxuICByZXR1cm4gbmV3IFBhaW50UXVhbnRpdHkoIGluaXRpYWxDb3VudCwgKCBoaXRDYWxsYmFjayA9PiB7XHJcbiAgICBiYWxsb29ucy5wdXNoKCBuZXcgUGFpbnRCYWxsb29uKCBzaWRlLCBiYWxsb29uID0+IHtcclxuICAgICAgYmFsbG9vbnMucmVtb3ZlKCBiYWxsb29uICk7XHJcbiAgICAgIGhpdENhbGxiYWNrKCk7XHJcbiAgICB9ICkgKTtcclxuICB9ICksICggKCBhbW91bnRUb0RyaXAsIHJlbW92ZUNhbGxiYWNrICkgPT4ge1xyXG4gICAgY29uc3QgdmlzaWJsZUNvbG9yUHJvcGVydHkgPSBnZXRWaXNpYmxlQ29sb3JQcm9wZXJ0eSgpO1xyXG4gICAgZHJpcHMucHVzaCggbmV3IFBhaW50RHJpcCggc2lkZSwgZHJpcCA9PiB7XHJcbiAgICAgIGRyaXBzLnJlbW92ZSggZHJpcCApO1xyXG4gICAgfSwgYW1vdW50VG9EcmlwLCByZW1vdmVDYWxsYmFjaywgdmlzaWJsZUNvbG9yUHJvcGVydHkudmFsdWUgKSApO1xyXG4gIH0gKSwgdGFuZGVtICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNwbG90Y2g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLGlEQUFpRDtBQUNuRixPQUFPQyxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLG9CQUFvQixNQUFNLGtDQUFrQztBQUNuRSxPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0MsVUFBVSxNQUFNLGtCQUFrQjtBQUN6QyxPQUFPQyxJQUFJLE1BQU0sWUFBWTtBQUM3QixPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyxPQUFPLFNBQVNMLFVBQVUsQ0FBQztFQUMvQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFTSxXQUFXQSxDQUFFQyxnQkFBZ0IsRUFBRUMsaUJBQWlCLEVBQUVDLGVBQWUsRUFBRUMsdUJBQXVCLEVBQUVDLE1BQU0sRUFBRztJQUVuRyxNQUFNQyxRQUFRLEdB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