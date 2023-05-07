// Copyright 2017-2020, University of Colorado Boulder

/**
 * Models the quantity of a specific color/choice of paint, that can be added (with balloons) and removed (with drips)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
class PaintQuantity {
  /**
   * @param {number} initialCount - Initial quantity of the paint
   * @param {function} createBalloon - function( callbackWhenHits() )
   * @param {function} createDrip - function( amountToRemove: number, dripCallback( amount ) )
   * @param {Tandem} tandem
   */
  constructor(initialCount, createBalloon, createDrip, tandem) {
    // @private
    this.createBalloon = createBalloon;
    this.createDrip = createDrip;

    // @public {NumberProperty} - The real model value (ignoring balloons, drips, etc.), changes instantly on toggles.
    this.realCountProperty = new NumberProperty(initialCount, {
      range: ProportionPlaygroundConstants.PAINT_COUNT_RANGE,
      numberType: 'Integer',
      tandem: tandem.createTandem('realCountProperty')
    });

    // @public {NumberProperty} - The model value that increases instantly when balloons hit. Can go negative.
    this.currentCountProperty = new NumberProperty(initialCount, {
      numberType: 'Integer',
      phetioReadOnly: true,
      phetioState: false,
      tandem: tandem.createTandem('currentCountProperty')
    });

    // @public {NumberProperty} - The visual amount of paint for the meter and splotch.
    this.paintAreaProperty = new NumberProperty(initialCount, {
      phetioReadOnly: true,
      phetioState: false,
      tandem: tandem.createTandem('paintAreaProperty')
    });

    // @private {NumberProperty} - Pending drips that will occur when a balloon hit happens.
    this.pendingDripsProperty = new NumberProperty(0, {
      phetioReadOnly: true,
      phetioState: false,
      tandem: tandem.createTandem('pendingDripsProperty')
    });
    this.realCountProperty.lazyLink(this.realCountChange.bind(this));
  }

  /**
   * Resets the amount of paint.
   * @public
   */
  reset() {
    this.realCountProperty.reset();
    this.currentCountProperty.reset();
    this.paintAreaProperty.reset();
    this.pendingDripsProperty.reset();
  }

  /**
   * Called when the real amount of paint changes. This either kicks off a balloon being thrown (increase), or queues
   * a drip (decrease).
   * @private
   *
   * @param {number} newCount
   * @param {number} oldCount
   */
  realCountChange(newCount, oldCount) {
    const delta = Math.abs(newCount - oldCount);
    if (newCount > oldCount) {
      this.createBalloon(this.addCurrent.bind(this, delta));
    } else {
      this.removeCurrent(delta);
    }
  }

  /**
   * Removes a certain amount of paint area.
   * @private
   *
   * @param {number} amount - Amount to remove
   */
  removeArea(amount) {
    assert && assert(typeof amount === 'number' && isFinite(amount) && amount >= 0);
    this.paintAreaProperty.value -= amount;
  }

  /**
   * Callback for when a balloon hits that adds a certain count to the current count.
   * @private
   *
   * @param {number} count
   */
  addCurrent(count) {
    assert && assert(typeof count === 'number' && isFinite(count) && count > 0);
    const amountToDrip = Math.min(count, this.pendingDripsProperty.value);
    const amountToAdd = count - amountToDrip;
    this.paintAreaProperty.value += count;
    this.currentCountProperty.value += amountToAdd;
    this.pendingDripsProperty.value -= amountToDrip;
    if (amountToDrip) {
      this.createDrip(amountToDrip, this.removeArea.bind(this));
    }
  }

  /**
   * Called when an amount of paint is removed (immediately), so we can potentially create drips.
   * @private
   *
   * @param {number} count
   */
  removeCurrent(count) {
    assert && assert(typeof count === 'number' && isFinite(count) && count >= 0);
    const amountToDrip = Math.min(count, this.currentCountProperty.value);
    const amountToQueue = count - amountToDrip;
    this.pendingDripsProperty.value += amountToQueue;
    this.currentCountProperty.value -= amountToDrip;
    if (amountToDrip) {
      this.createDrip(amountToDrip, this.removeArea.bind(this));
    }
  }
}
proportionPlayground.register('PaintQuantity', PaintQuantity);
export default PaintQuantity;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMiLCJQYWludFF1YW50aXR5IiwiY29uc3RydWN0b3IiLCJpbml0aWFsQ291bnQiLCJjcmVhdGVCYWxsb29uIiwiY3JlYXRlRHJpcCIsInRhbmRlbSIsInJlYWxDb3VudFByb3BlcnR5IiwicmFuZ2UiLCJQQUlOVF9DT1VOVF9SQU5HRSIsIm51bWJlclR5cGUiLCJjcmVhdGVUYW5kZW0iLCJjdXJyZW50Q291bnRQcm9wZXJ0eSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvU3RhdGUiLCJwYWludEFyZWFQcm9wZXJ0eSIsInBlbmRpbmdEcmlwc1Byb3BlcnR5IiwibGF6eUxpbmsiLCJyZWFsQ291bnRDaGFuZ2UiLCJiaW5kIiwicmVzZXQiLCJuZXdDb3VudCIsIm9sZENvdW50IiwiZGVsdGEiLCJNYXRoIiwiYWJzIiwiYWRkQ3VycmVudCIsInJlbW92ZUN1cnJlbnQiLCJyZW1vdmVBcmVhIiwiYW1vdW50IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJ2YWx1ZSIsImNvdW50IiwiYW1vdW50VG9EcmlwIiwibWluIiwiYW1vdW50VG9BZGQiLCJhbW91bnRUb1F1ZXVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYWludFF1YW50aXR5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVscyB0aGUgcXVhbnRpdHkgb2YgYSBzcGVjaWZpYyBjb2xvci9jaG9pY2Ugb2YgcGFpbnQsIHRoYXQgY2FuIGJlIGFkZGVkICh3aXRoIGJhbGxvb25zKSBhbmQgcmVtb3ZlZCAod2l0aCBkcmlwcylcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuaW1wb3J0IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIGZyb20gJy4uLy4uL1Byb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFBhaW50UXVhbnRpdHkge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsQ291bnQgLSBJbml0aWFsIHF1YW50aXR5IG9mIHRoZSBwYWludFxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUJhbGxvb24gLSBmdW5jdGlvbiggY2FsbGJhY2tXaGVuSGl0cygpIClcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjcmVhdGVEcmlwIC0gZnVuY3Rpb24oIGFtb3VudFRvUmVtb3ZlOiBudW1iZXIsIGRyaXBDYWxsYmFjayggYW1vdW50ICkgKVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbENvdW50LCBjcmVhdGVCYWxsb29uLCBjcmVhdGVEcmlwLCB0YW5kZW0gKSB7XHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jcmVhdGVCYWxsb29uID0gY3JlYXRlQmFsbG9vbjtcclxuICAgIHRoaXMuY3JlYXRlRHJpcCA9IGNyZWF0ZURyaXA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyUHJvcGVydHl9IC0gVGhlIHJlYWwgbW9kZWwgdmFsdWUgKGlnbm9yaW5nIGJhbGxvb25zLCBkcmlwcywgZXRjLiksIGNoYW5nZXMgaW5zdGFudGx5IG9uIHRvZ2dsZXMuXHJcbiAgICB0aGlzLnJlYWxDb3VudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsQ291bnQsIHtcclxuICAgICAgcmFuZ2U6IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLlBBSU5UX0NPVU5UX1JBTkdFLFxyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlYWxDb3VudFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyUHJvcGVydHl9IC0gVGhlIG1vZGVsIHZhbHVlIHRoYXQgaW5jcmVhc2VzIGluc3RhbnRseSB3aGVuIGJhbGxvb25zIGhpdC4gQ2FuIGdvIG5lZ2F0aXZlLlxyXG4gICAgdGhpcy5jdXJyZW50Q291bnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbENvdW50LCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VycmVudENvdW50UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBUaGUgdmlzdWFsIGFtb3VudCBvZiBwYWludCBmb3IgdGhlIG1ldGVyIGFuZCBzcGxvdGNoLlxyXG4gICAgdGhpcy5wYWludEFyZWFQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbENvdW50LCB7XHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhaW50QXJlYVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge051bWJlclByb3BlcnR5fSAtIFBlbmRpbmcgZHJpcHMgdGhhdCB3aWxsIG9jY3VyIHdoZW4gYSBiYWxsb29uIGhpdCBoYXBwZW5zLlxyXG4gICAgdGhpcy5wZW5kaW5nRHJpcHNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwZW5kaW5nRHJpcHNQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucmVhbENvdW50UHJvcGVydHkubGF6eUxpbmsoIHRoaXMucmVhbENvdW50Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBhbW91bnQgb2YgcGFpbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZWFsQ291bnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jdXJyZW50Q291bnRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wYWludEFyZWFQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wZW5kaW5nRHJpcHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlYWwgYW1vdW50IG9mIHBhaW50IGNoYW5nZXMuIFRoaXMgZWl0aGVyIGtpY2tzIG9mZiBhIGJhbGxvb24gYmVpbmcgdGhyb3duIChpbmNyZWFzZSksIG9yIHF1ZXVlc1xyXG4gICAqIGEgZHJpcCAoZGVjcmVhc2UpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3Q291bnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkQ291bnRcclxuICAgKi9cclxuICByZWFsQ291bnRDaGFuZ2UoIG5ld0NvdW50LCBvbGRDb3VudCApIHtcclxuICAgIGNvbnN0IGRlbHRhID0gTWF0aC5hYnMoIG5ld0NvdW50IC0gb2xkQ291bnQgKTtcclxuICAgIGlmICggbmV3Q291bnQgPiBvbGRDb3VudCApIHtcclxuICAgICAgdGhpcy5jcmVhdGVCYWxsb29uKCB0aGlzLmFkZEN1cnJlbnQuYmluZCggdGhpcywgZGVsdGEgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlQ3VycmVudCggZGVsdGEgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBjZXJ0YWluIGFtb3VudCBvZiBwYWludCBhcmVhLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW1vdW50IC0gQW1vdW50IHRvIHJlbW92ZVxyXG4gICAqL1xyXG4gIHJlbW92ZUFyZWEoIGFtb3VudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBhbW91bnQgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBhbW91bnQgKSAmJiBhbW91bnQgPj0gMCApO1xyXG5cclxuICAgIHRoaXMucGFpbnRBcmVhUHJvcGVydHkudmFsdWUgLT0gYW1vdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGJhY2sgZm9yIHdoZW4gYSBiYWxsb29uIGhpdHMgdGhhdCBhZGRzIGEgY2VydGFpbiBjb3VudCB0byB0aGUgY3VycmVudCBjb3VudC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XHJcbiAgICovXHJcbiAgYWRkQ3VycmVudCggY291bnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY291bnQgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBjb3VudCApICYmIGNvdW50ID4gMCApO1xyXG5cclxuICAgIGNvbnN0IGFtb3VudFRvRHJpcCA9IE1hdGgubWluKCBjb3VudCwgdGhpcy5wZW5kaW5nRHJpcHNQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgY29uc3QgYW1vdW50VG9BZGQgPSBjb3VudCAtIGFtb3VudFRvRHJpcDtcclxuICAgIHRoaXMucGFpbnRBcmVhUHJvcGVydHkudmFsdWUgKz0gY291bnQ7XHJcbiAgICB0aGlzLmN1cnJlbnRDb3VudFByb3BlcnR5LnZhbHVlICs9IGFtb3VudFRvQWRkO1xyXG4gICAgdGhpcy5wZW5kaW5nRHJpcHNQcm9wZXJ0eS52YWx1ZSAtPSBhbW91bnRUb0RyaXA7XHJcbiAgICBpZiAoIGFtb3VudFRvRHJpcCApIHtcclxuICAgICAgdGhpcy5jcmVhdGVEcmlwKCBhbW91bnRUb0RyaXAsIHRoaXMucmVtb3ZlQXJlYS5iaW5kKCB0aGlzICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCB3aGVuIGFuIGFtb3VudCBvZiBwYWludCBpcyByZW1vdmVkIChpbW1lZGlhdGVseSksIHNvIHdlIGNhbiBwb3RlbnRpYWxseSBjcmVhdGUgZHJpcHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxyXG4gICAqL1xyXG4gIHJlbW92ZUN1cnJlbnQoIGNvdW50ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNvdW50ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY291bnQgKSAmJiBjb3VudCA+PSAwICk7XHJcblxyXG4gICAgY29uc3QgYW1vdW50VG9EcmlwID0gTWF0aC5taW4oIGNvdW50LCB0aGlzLmN1cnJlbnRDb3VudFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICBjb25zdCBhbW91bnRUb1F1ZXVlID0gY291bnQgLSBhbW91bnRUb0RyaXA7XHJcbiAgICB0aGlzLnBlbmRpbmdEcmlwc1Byb3BlcnR5LnZhbHVlICs9IGFtb3VudFRvUXVldWU7XHJcbiAgICB0aGlzLmN1cnJlbnRDb3VudFByb3BlcnR5LnZhbHVlIC09IGFtb3VudFRvRHJpcDtcclxuICAgIGlmICggYW1vdW50VG9EcmlwICkge1xyXG4gICAgICB0aGlzLmNyZWF0ZURyaXAoIGFtb3VudFRvRHJpcCwgdGhpcy5yZW1vdmVBcmVhLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdQYWludFF1YW50aXR5JywgUGFpbnRRdWFudGl0eSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFpbnRRdWFudGl0eTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLDBDQUEwQztBQUNyRSxPQUFPQyxvQkFBb0IsTUFBTSxrQ0FBa0M7QUFDbkUsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBRWxGLE1BQU1DLGFBQWEsQ0FBQztFQUNsQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsWUFBWSxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFHO0lBQzdEO0lBQ0EsSUFBSSxDQUFDRixhQUFhLEdBQUdBLGFBQWE7SUFDbEMsSUFBSSxDQUFDQyxVQUFVLEdBQUdBLFVBQVU7O0lBRTVCO0lBQ0EsSUFBSSxDQUFDRSxpQkFBaUIsR0FBRyxJQUFJVCxjQUFjLENBQUVLLFlBQVksRUFBRTtNQUN6REssS0FBSyxFQUFFUiw2QkFBNkIsQ0FBQ1MsaUJBQWlCO01BQ3REQyxVQUFVLEVBQUUsU0FBUztNQUNyQkosTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSxtQkFBb0I7SUFDbkQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxJQUFJZCxjQUFjLENBQUVLLFlBQVksRUFBRTtNQUM1RE8sVUFBVSxFQUFFLFNBQVM7TUFDckJHLGNBQWMsRUFBRSxJQUFJO01BQ3BCQyxXQUFXLEVBQUUsS0FBSztNQUNsQlIsTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSxzQkFBdUI7SUFDdEQsQ0FBRSxDQUFDOztJ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