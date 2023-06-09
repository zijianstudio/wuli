// Copyright 2014-2022, University of Colorado Boulder

/**
 * RectangularToggleButton is a rectangular toggle button that toggles the value of a Property between 2 values.
 * It has the same look for both values.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import toggleOffSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOffSoundPlayer.js';
import toggleOnSoundPlayer from '../../../tambo/js/shared-sound-players/toggleOnSoundPlayer.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import RectangularButton from './RectangularButton.js';
import ToggleButtonInteractionStateProperty from './ToggleButtonInteractionStateProperty.js';
import ToggleButtonModel from './ToggleButtonModel.js';
export default class RectangularToggleButton extends RectangularButton {
  /**
   * @param property - axon Property that can be either valueOff or valueOn
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param providedOptions?
   */
  constructor(property, valueOff, valueOn, providedOptions) {
    const options = optionize()({
      // {TSoundPlayer} - sounds to be played on toggle transitions
      valueOffSoundPlayer: toggleOffSoundPlayer,
      valueOnSoundPlayer: toggleOnSoundPlayer,
      // phet-io support
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
    }, providedOptions);

    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    const toggleButtonModel = new ToggleButtonModel(valueOff, valueOn, property, options);
    const toggleButtonInteractionStateProperty = new ToggleButtonInteractionStateProperty(toggleButtonModel);
    super(toggleButtonModel, toggleButtonInteractionStateProperty, options);
    this.addLinkedElement(property, {
      tandem: options.tandem.createTandem('property')
    });

    // sound generation
    const playSounds = () => {
      if (property.value === valueOff) {
        options.valueOffSoundPlayer.play();
      } else if (property.value === valueOn) {
        options.valueOnSoundPlayer.play();
      }
    };
    this.buttonModel.produceSoundEmitter.addListener(playSounds);
    this.disposeRectangularToggleButton = () => {
      this.buttonModel.produceSoundEmitter.removeListener(playSounds);
      toggleButtonModel.dispose();
    };
  }
  dispose() {
    this.disposeRectangularToggleButton();
    super.dispose();
  }
}
sun.register('RectangularToggleButton', RectangularToggleButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJ0b2dnbGVPZmZTb3VuZFBsYXllciIsInRvZ2dsZU9uU291bmRQbGF5ZXIiLCJUYW5kZW0iLCJzdW4iLCJSZWN0YW5ndWxhckJ1dHRvbiIsIlRvZ2dsZUJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsIlRvZ2dsZUJ1dHRvbk1vZGVsIiwiUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24iLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwidmFsdWVPZmYiLCJ2YWx1ZU9uIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZhbHVlT2ZmU291bmRQbGF5ZXIiLCJ2YWx1ZU9uU291bmRQbGF5ZXIiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJ0b2dnbGVCdXR0b25Nb2RlbCIsInRvZ2dsZUJ1dHRvbkludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsImFkZExpbmtlZEVsZW1lbnQiLCJjcmVhdGVUYW5kZW0iLCJwbGF5U291bmRzIiwidmFsdWUiLCJwbGF5IiwiYnV0dG9uTW9kZWwiLCJwcm9kdWNlU291bmRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24iLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIGlzIGEgcmVjdGFuZ3VsYXIgdG9nZ2xlIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdGhlIHZhbHVlIG9mIGEgUHJvcGVydHkgYmV0d2VlbiAyIHZhbHVlcy5cclxuICogSXQgaGFzIHRoZSBzYW1lIGxvb2sgZm9yIGJvdGggdmFsdWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB0b2dnbGVPZmZTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy90b2dnbGVPZmZTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCB0b2dnbGVPblNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL3NoYXJlZC1zb3VuZC1wbGF5ZXJzL3RvZ2dsZU9uU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyQnV0dG9uLCB7IFJlY3Rhbmd1bGFyQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vUmVjdGFuZ3VsYXJCdXR0b24uanMnO1xyXG5pbXBvcnQgVG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5IGZyb20gJy4vVG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRvZ2dsZUJ1dHRvbk1vZGVsIGZyb20gJy4vVG9nZ2xlQnV0dG9uTW9kZWwuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBzb3VuZHMgdG8gYmUgcGxheWVkIG9uIHRvZ2dsZSB0cmFuc2l0aW9uc1xyXG4gIHZhbHVlT2ZmU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XHJcbiAgdmFsdWVPblNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBSZWN0YW5ndWxhckJ1dHRvbk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbjxUPiBleHRlbmRzIFJlY3Rhbmd1bGFyQnV0dG9uIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b246ICgpID0+IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBwcm9wZXJ0eSAtIGF4b24gUHJvcGVydHkgdGhhdCBjYW4gYmUgZWl0aGVyIHZhbHVlT2ZmIG9yIHZhbHVlT25cclxuICAgKiBAcGFyYW0gdmFsdWVPZmYgLSB2YWx1ZSB3aGVuIHRoZSBidXR0b24gaXMgaW4gdGhlIG9mZiBzdGF0ZVxyXG4gICAqIEBwYXJhbSB2YWx1ZU9uIC0gdmFsdWUgd2hlbiB0aGUgYnV0dG9uIGlzIGluIHRoZSBvbiBzdGF0ZVxyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnM/XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogUHJvcGVydHk8VD4sIHZhbHVlT2ZmOiBULCB2YWx1ZU9uOiBULCBwcm92aWRlZE9wdGlvbnM/OiBSZWN0YW5ndWxhckJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhckJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHtUU291bmRQbGF5ZXJ9IC0gc291bmRzIHRvIGJlIHBsYXllZCBvbiB0b2dnbGUgdHJhbnNpdGlvbnNcclxuICAgICAgdmFsdWVPZmZTb3VuZFBsYXllcjogdG9nZ2xlT2ZmU291bmRQbGF5ZXIsXHJcbiAgICAgIHZhbHVlT25Tb3VuZFBsYXllcjogdG9nZ2xlT25Tb3VuZFBsYXllcixcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gc3VwcG9ydFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0J1dHRvbidcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIE5vdGUgaXQgc2hhcmVzIGEgdGFuZGVtIHdpdGggdGhpcywgc28gdGhlIGVtaXR0ZXIgd2lsbCBiZSBpbnN0cnVtZW50ZWQgYXMgYSBjaGlsZCBvZiB0aGUgYnV0dG9uXHJcbiAgICBjb25zdCB0b2dnbGVCdXR0b25Nb2RlbCA9IG5ldyBUb2dnbGVCdXR0b25Nb2RlbCggdmFsdWVPZmYsIHZhbHVlT24sIHByb3BlcnR5LCBvcHRpb25zICk7XHJcbiAgICBjb25zdCB0b2dnbGVCdXR0b25JbnRlcmFjdGlvblN0YXRlUHJvcGVydHkgPSBuZXcgVG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5KCB0b2dnbGVCdXR0b25Nb2RlbCApO1xyXG5cclxuICAgIHN1cGVyKCB0b2dnbGVCdXR0b25Nb2RlbCwgdG9nZ2xlQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBwcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvblxyXG4gICAgY29uc3QgcGxheVNvdW5kcyA9ICgpID0+IHtcclxuICAgICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWVPZmYgKSB7XHJcbiAgICAgICAgb3B0aW9ucy52YWx1ZU9mZlNvdW5kUGxheWVyLnBsYXkoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcHJvcGVydHkudmFsdWUgPT09IHZhbHVlT24gKSB7XHJcbiAgICAgICAgb3B0aW9ucy52YWx1ZU9uU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5idXR0b25Nb2RlbC5wcm9kdWNlU291bmRFbWl0dGVyLmFkZExpc3RlbmVyKCBwbGF5U291bmRzICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYnV0dG9uTW9kZWwucHJvZHVjZVNvdW5kRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcGxheVNvdW5kcyApO1xyXG4gICAgICB0b2dnbGVCdXR0b25Nb2RlbC5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc3VuLnJlZ2lzdGVyKCAnUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24nLCBSZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxvQ0FBb0M7QUFDMUQsT0FBT0Msb0JBQW9CLE1BQU0sZ0VBQWdFO0FBQ2pHLE9BQU9DLG1CQUFtQixNQUFNLCtEQUErRDtBQUUvRixPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLEdBQUcsTUFBTSxXQUFXO0FBQzNCLE9BQU9DLGlCQUFpQixNQUFvQyx3QkFBd0I7QUFDcEYsT0FBT0Msb0NBQW9DLE1BQU0sMkNBQTJDO0FBQzVGLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQVl0RCxlQUFlLE1BQU1DLHVCQUF1QixTQUFZSCxpQkFBaUIsQ0FBQztFQUl4RTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0ksV0FBV0EsQ0FBRUMsUUFBcUIsRUFBRUMsUUFBVyxFQUFFQyxPQUFVLEVBQUVDLGVBQTBDLEVBQUc7SUFFL0csTUFBTUMsT0FBTyxHQUFHZCxTQUFTLENBQXdFLENBQUMsQ0FBRTtNQUVsRztNQUNBZSxtQkFBbUIsRUFBRWQsb0JBQW9CO01BQ3pDZSxrQkFBa0IsRUFBRWQsbUJBQW1CO01BRXZDO01BQ0FlLE1BQU0sRUFBRWQsTUFBTSxDQUFDZSxRQUFRO01BQ3ZCQyxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLEVBQUVOLGVBQWdCLENBQUM7O0lBRXBCO0lBQ0EsTUFBTU8saUJBQWlCLEdBQUcsSUFBSWIsaUJBQWlCLENBQUVJLFFBQVEsRUFBRUMsT0FBTyxFQUFFRixRQUFRLEVBQUVJLE9BQVEsQ0FBQztJQUN2RixNQUFNTyxvQ0FBb0MsR0FBRyxJQUFJZixvQ0FBb0MsQ0FBRWMsaUJBQWtCLENBQUM7SUFFMUcsS0FBSyxDQUFFQSxpQkFBaUIsRUFBRUMsb0NBQW9DLEVBQUVQLE9BQVEsQ0FBQztJQUV6RSxJQUFJLENBQUNRLGdCQUFnQixDQUFFWixRQUFRLEVBQUU7TUFDL0JPLE1BQU0sRUFBRUgsT0FBTyxDQUFDRyxNQUFNLENBQUNNLFlBQVksQ0FBRSxVQUFXO0lBQ2xELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLFVBQVUsR0FBR0EsQ0FBQSxLQUFNO01BQ3ZCLElBQUtkLFFBQVEsQ0FBQ2UsS0FBSyxLQUFLZCxRQUFRLEVBQUc7UUFDakNHLE9BQU8sQ0FBQ0MsbUJBQW1CLENBQUNXLElBQUksQ0FBQyxDQUFDO01BQ3BDLENBQUMsTUFDSSxJQUFLaEIsUUFBUSxDQUFDZSxLQUFLLEtBQUtiLE9BQU8sRUFBRztRQUNyQ0UsT0FBTyxDQUFDRSxrQkFBa0IsQ0FBQ1UsSUFBSSxDQUFDLENBQUM7TUFDbkM7SUFDRixDQUFDO0lBQ0QsSUFBSSxDQUFDQyxXQUFXLENBQUNDLG1CQUFtQixDQUFDQyxXQUFXLENBQUVMLFVBQVcsQ0FBQztJQUU5RCxJQUFJLENBQUNNLDhCQUE4QixHQUFHLE1BQU07TUFDMUMsSUFBSSxDQUFDSCxXQUFXLENBQUNDLG1CQUFtQixDQUFDRyxjQUFjLENBQUVQLFVBQVcsQ0FBQztNQUNqRUosaUJBQWlCLENBQUNZLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0YsOEJBQThCLENBQUMsQ0FBQztJQUNyQyxLQUFLLENBQUNFLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQTVCLEdBQUcsQ0FBQzZCLFFBQVEsQ0FBRSx5QkFBeUIsRUFBRXpCLHVCQUF3QixDQUFDIn0=