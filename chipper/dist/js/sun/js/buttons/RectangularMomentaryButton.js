// Copyright 2015-2022, University of Colorado Boulder

/**
 * RectangularMomentaryButton is a rectangular momentary button that toggles a Property between 2 values.
 * The 'off value' is the value when the button is not pressed.
 * The 'on value' is the value when the button is pressed.
 *
 * TODO: Not supported with alternative input, see https://github.com/phetsims/scenery/issues/1117
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import MomentaryButtonInteractionStateProperty from './MomentaryButtonInteractionStateProperty.js';
import MomentaryButtonModel from './MomentaryButtonModel.js';
import RectangularButton from './RectangularButton.js';
export default class RectangularMomentaryButton extends RectangularButton {
  /**
   * @param property
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param [providedOptions?]
   */
  constructor(property, valueOff, valueOn, providedOptions) {
    const options = optionize()({
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
    }, providedOptions);

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const buttonModel = new MomentaryButtonModel(valueOff, valueOn, property, options);
    super(buttonModel, new MomentaryButtonInteractionStateProperty(buttonModel), options);
    this.disposeRectangularMomentaryButton = () => {
      buttonModel.dispose();
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'RectangularMomentaryButton', this);
  }
  dispose() {
    this.disposeRectangularMomentaryButton();
    super.dispose();
  }
}
sun.register('RectangularMomentaryButton', RectangularMomentaryButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiVGFuZGVtIiwic3VuIiwiTW9tZW50YXJ5QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5IiwiTW9tZW50YXJ5QnV0dG9uTW9kZWwiLCJSZWN0YW5ndWxhckJ1dHRvbiIsIlJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uIiwiY29uc3RydWN0b3IiLCJwcm9wZXJ0eSIsInZhbHVlT2ZmIiwidmFsdWVPbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJidXR0b25Nb2RlbCIsImRpc3Bvc2VSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbiIsImRpc3Bvc2UiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24gaXMgYSByZWN0YW5ndWxhciBtb21lbnRhcnkgYnV0dG9uIHRoYXQgdG9nZ2xlcyBhIFByb3BlcnR5IGJldHdlZW4gMiB2YWx1ZXMuXHJcbiAqIFRoZSAnb2ZmIHZhbHVlJyBpcyB0aGUgdmFsdWUgd2hlbiB0aGUgYnV0dG9uIGlzIG5vdCBwcmVzc2VkLlxyXG4gKiBUaGUgJ29uIHZhbHVlJyBpcyB0aGUgdmFsdWUgd2hlbiB0aGUgYnV0dG9uIGlzIHByZXNzZWQuXHJcbiAqXHJcbiAqIFRPRE86IE5vdCBzdXBwb3J0ZWQgd2l0aCBhbHRlcm5hdGl2ZSBpbnB1dCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTE3XHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xyXG5pbXBvcnQgTW9tZW50YXJ5QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5IGZyb20gJy4vTW9tZW50YXJ5QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LmpzJztcclxuaW1wb3J0IE1vbWVudGFyeUJ1dHRvbk1vZGVsIGZyb20gJy4vTW9tZW50YXJ5QnV0dG9uTW9kZWwuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJCdXR0b24sIHsgUmVjdGFuZ3VsYXJCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9SZWN0YW5ndWxhckJ1dHRvbi5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIFJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUmVjdGFuZ3VsYXJCdXR0b25PcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b248VD4gZXh0ZW5kcyBSZWN0YW5ndWxhckJ1dHRvbiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcHJvcGVydHlcclxuICAgKiBAcGFyYW0gdmFsdWVPZmYgLSB2YWx1ZSB3aGVuIHRoZSBidXR0b24gaXMgaW4gdGhlIG9mZiBzdGF0ZVxyXG4gICAqIEBwYXJhbSB2YWx1ZU9uIC0gdmFsdWUgd2hlbiB0aGUgYnV0dG9uIGlzIGluIHRoZSBvbiBzdGF0ZVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zP11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBUUHJvcGVydHk8VD4sIHZhbHVlT2ZmOiBULCB2YWx1ZU9uOiBULCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhckJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdCdXR0b24nXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBOb3RlIGl0IHNoYXJlcyBhIHRhbmRlbSB3aXRoIHRoaXMsIHNvIHRoZSBlbWl0dGVyIHdpbGwgYmUgaW5zdHJ1bWVudGVkIGFzIGEgY2hpbGQgb2YgdGhlIGJ1dHRvblxyXG4gICAgY29uc3QgYnV0dG9uTW9kZWwgPSBuZXcgTW9tZW50YXJ5QnV0dG9uTW9kZWwoIHZhbHVlT2ZmLCB2YWx1ZU9uLCBwcm9wZXJ0eSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBidXR0b25Nb2RlbCwgbmV3IE1vbWVudGFyeUJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSggYnV0dG9uTW9kZWwgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICBidXR0b25Nb2RlbC5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxyXG4gICAgYXNzZXJ0ICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc3VuJywgJ1JlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uJywgdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc3VuLnJlZ2lzdGVyKCAnUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24nLCBSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLGdCQUFnQixNQUFNLHlEQUF5RDtBQUN0RixPQUFPQyxTQUFTLE1BQTRCLG9DQUFvQztBQUNoRixPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLEdBQUcsTUFBTSxXQUFXO0FBQzNCLE9BQU9DLHVDQUF1QyxNQUFNLDhDQUE4QztBQUNsRyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsaUJBQWlCLE1BQW9DLHdCQUF3QjtBQU1wRixlQUFlLE1BQU1DLDBCQUEwQixTQUFZRCxpQkFBaUIsQ0FBQztFQUkzRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0UsV0FBV0EsQ0FBRUMsUUFBc0IsRUFBRUMsUUFBVyxFQUFFQyxPQUFVLEVBQUVDLGVBQW1ELEVBQUc7SUFFekgsTUFBTUMsT0FBTyxHQUFHWixTQUFTLENBQTJFLENBQUMsQ0FBRTtNQUNyR2EsTUFBTSxFQUFFWixNQUFNLENBQUNhLFFBQVE7TUFDdkJDLGdCQUFnQixFQUFFO0lBQ3BCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNSyxXQUFXLEdBQUcsSUFBSVosb0JBQW9CLENBQUVLLFFBQVEsRUFBRUMsT0FBTyxFQUFFRixRQUFRLEVBQUVJLE9BQVEsQ0FBQztJQUVwRixLQUFLLENBQUVJLFdBQVcsRUFBRSxJQUFJYix1Q0FBdUMsQ0FBRWEsV0FBWSxDQUFDLEVBQUVKLE9BQVEsQ0FBQztJQUV6RixJQUFJLENBQUNLLGlDQUFpQyxHQUFHLE1BQU07TUFDN0NELFdBQVcsQ0FBQ0UsT0FBTyxDQUFDLENBQUM7SUFDdkIsQ0FBQzs7SUFFRDtJQUNBQyxNQUFNLElBQUlDLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxlQUFlLENBQUNDLE1BQU0sSUFBSXhCLGdCQUFnQixDQUFDeUIsZUFBZSxDQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxJQUFLLENBQUM7RUFDaEk7RUFFZ0JOLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNELGlDQUFpQyxDQUFDLENBQUM7SUFDeEMsS0FBSyxDQUFDQyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFoQixHQUFHLENBQUN1QixRQUFRLENBQUUsNEJBQTRCLEVBQUVuQiwwQkFBMkIsQ0FBQyJ9