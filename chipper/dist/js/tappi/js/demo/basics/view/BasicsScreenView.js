// Copyright 2019-2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Dimension2 from '../../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../../scenery/js/imports.js';
import ABSwitch from '../../../../../sun/js/ABSwitch.js';
import BooleanRectangularToggleButton from '../../../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import tappi from '../../../tappi.js';
import vibrationManager, { Intensity } from '../../../vibrationManager.js';

// constants
const LABEL_FONT = new PhetFont({
  size: 100
});
const SWITCH_TEXT_FONT = new PhetFont({
  size: 80
});
class BasicsScreenView extends ScreenView {
  /**
   * @param {BasicsModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super();

    // button that initiates vibration - adapterProperty required because the button shouldn't set the
    // vibration property directly
    const adapterProperty = new BooleanProperty(vibrationManager.vibratingProperty.get());
    const trueNode = new Text('Stop Vibrate', {
      font: LABEL_FONT
    });
    const falseNode = new Text('Start Vibrate', {
      font: LABEL_FONT
    });
    const vibrationToggleButton = new BooleanRectangularToggleButton(adapterProperty, trueNode, falseNode);

    // switch that changes between high and low vibration
    const intensityAdapterProperty = new EnumerationProperty(Intensity.HIGH);
    const intensitySwitch = new ABSwitch(intensityAdapterProperty, Intensity.HIGH, new Text('High', {
      font: SWITCH_TEXT_FONT
    }), Intensity.LOW, new Text('Low', {
      font: SWITCH_TEXT_FONT
    }), {
      toggleSwitchOptions: {
        size: new Dimension2(180, 90)
      },
      spacing: 20
    });
    const intensityLabel = new Text('Intensity', {
      font: LABEL_FONT
    });
    adapterProperty.lazyLink(vibrating => {
      if (vibrating) {
        vibrationManager.startVibrate();
      } else {
        vibrationManager.stopVibrate();
      }
    });

    // NOTE: It would be cool if this wasn't necessary, but it feels weird that all of the API goes through the
    // Property
    intensityAdapterProperty.lazyLink(intensity => {
      vibrationManager.setVibrationIntensity(intensity);
    });

    // layout
    const switchContainer = new Node({
      children: [intensitySwitch, intensityLabel]
    });
    intensityLabel.centerTop = intensitySwitch.centerBottom;
    switchContainer.centerBottom = this.layoutBounds.centerBottom;
    vibrationToggleButton.centerTop = this.layoutBounds.centerTop;

    // add to view
    this.addChild(vibrationToggleButton);
    this.addChild(switchContainer);
  }

  // @public
  step(dt) {}
}
tappi.register('BasicsScreenView', BasicsScreenView);
export default BasicsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlNjcmVlblZpZXciLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiQUJTd2l0Y2giLCJCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24iLCJ0YXBwaSIsInZpYnJhdGlvbk1hbmFnZXIiLCJJbnRlbnNpdHkiLCJMQUJFTF9GT05UIiwic2l6ZSIsIlNXSVRDSF9URVhUX0ZPTlQiLCJCYXNpY3NTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImFkYXB0ZXJQcm9wZXJ0eSIsInZpYnJhdGluZ1Byb3BlcnR5IiwiZ2V0IiwidHJ1ZU5vZGUiLCJmb250IiwiZmFsc2VOb2RlIiwidmlicmF0aW9uVG9nZ2xlQnV0dG9uIiwiaW50ZW5zaXR5QWRhcHRlclByb3BlcnR5IiwiSElHSCIsImludGVuc2l0eVN3aXRjaCIsIkxPVyIsInRvZ2dsZVN3aXRjaE9wdGlvbnMiLCJzcGFjaW5nIiwiaW50ZW5zaXR5TGFiZWwiLCJsYXp5TGluayIsInZpYnJhdGluZyIsInN0YXJ0VmlicmF0ZSIsInN0b3BWaWJyYXRlIiwiaW50ZW5zaXR5Iiwic2V0VmlicmF0aW9uSW50ZW5zaXR5Iiwic3dpdGNoQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJjZW50ZXJUb3AiLCJjZW50ZXJCb3R0b20iLCJsYXlvdXRCb3VuZHMiLCJhZGRDaGlsZCIsInN0ZXAiLCJkdCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFzaWNzU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBQlN3aXRjaCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQUJTd2l0Y2guanMnO1xyXG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCB0YXBwaSBmcm9tICcuLi8uLi8uLi90YXBwaS5qcyc7XHJcbmltcG9ydCB2aWJyYXRpb25NYW5hZ2VyLCB7IEludGVuc2l0eSB9IGZyb20gJy4uLy4uLy4uL3ZpYnJhdGlvbk1hbmFnZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTAwIH0gKTtcclxuY29uc3QgU1dJVENIX1RFWFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiA4MCB9ICk7XHJcblxyXG5jbGFzcyBCYXNpY3NTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QmFzaWNzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gYnV0dG9uIHRoYXQgaW5pdGlhdGVzIHZpYnJhdGlvbiAtIGFkYXB0ZXJQcm9wZXJ0eSByZXF1aXJlZCBiZWNhdXNlIHRoZSBidXR0b24gc2hvdWxkbid0IHNldCB0aGVcclxuICAgIC8vIHZpYnJhdGlvbiBwcm9wZXJ0eSBkaXJlY3RseVxyXG4gICAgY29uc3QgYWRhcHRlclByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdmlicmF0aW9uTWFuYWdlci52aWJyYXRpbmdQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgY29uc3QgdHJ1ZU5vZGUgPSBuZXcgVGV4dCggJ1N0b3AgVmlicmF0ZScsIHsgZm9udDogTEFCRUxfRk9OVCB9ICk7XHJcbiAgICBjb25zdCBmYWxzZU5vZGUgPSBuZXcgVGV4dCggJ1N0YXJ0IFZpYnJhdGUnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApO1xyXG4gICAgY29uc3QgdmlicmF0aW9uVG9nZ2xlQnV0dG9uID0gbmV3IEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiggYWRhcHRlclByb3BlcnR5LCB0cnVlTm9kZSwgZmFsc2VOb2RlICk7XHJcblxyXG4gICAgLy8gc3dpdGNoIHRoYXQgY2hhbmdlcyBiZXR3ZWVuIGhpZ2ggYW5kIGxvdyB2aWJyYXRpb25cclxuICAgIGNvbnN0IGludGVuc2l0eUFkYXB0ZXJQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBJbnRlbnNpdHkuSElHSCApO1xyXG4gICAgY29uc3QgaW50ZW5zaXR5U3dpdGNoID0gbmV3IEFCU3dpdGNoKFxyXG4gICAgICBpbnRlbnNpdHlBZGFwdGVyUHJvcGVydHksXHJcbiAgICAgIEludGVuc2l0eS5ISUdILCBuZXcgVGV4dCggJ0hpZ2gnLCB7IGZvbnQ6IFNXSVRDSF9URVhUX0ZPTlQgfSApLFxyXG4gICAgICBJbnRlbnNpdHkuTE9XLCBuZXcgVGV4dCggJ0xvdycsIHsgZm9udDogU1dJVENIX1RFWFRfRk9OVCB9ICksXHJcbiAgICAgIHtcclxuICAgICAgICB0b2dnbGVTd2l0Y2hPcHRpb25zOiB7IHNpemU6IG5ldyBEaW1lbnNpb24yKCAxODAsIDkwICkgfSxcclxuICAgICAgICBzcGFjaW5nOiAyMFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY29uc3QgaW50ZW5zaXR5TGFiZWwgPSBuZXcgVGV4dCggJ0ludGVuc2l0eScsIHsgZm9udDogTEFCRUxfRk9OVCB9ICk7XHJcblxyXG4gICAgYWRhcHRlclByb3BlcnR5LmxhenlMaW5rKCB2aWJyYXRpbmcgPT4ge1xyXG4gICAgICBpZiAoIHZpYnJhdGluZyApIHtcclxuICAgICAgICB2aWJyYXRpb25NYW5hZ2VyLnN0YXJ0VmlicmF0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHZpYnJhdGlvbk1hbmFnZXIuc3RvcFZpYnJhdGUoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE5PVEU6IEl0IHdvdWxkIGJlIGNvb2wgaWYgdGhpcyB3YXNuJ3QgbmVjZXNzYXJ5LCBidXQgaXQgZmVlbHMgd2VpcmQgdGhhdCBhbGwgb2YgdGhlIEFQSSBnb2VzIHRocm91Z2ggdGhlXHJcbiAgICAvLyBQcm9wZXJ0eVxyXG4gICAgaW50ZW5zaXR5QWRhcHRlclByb3BlcnR5LmxhenlMaW5rKCBpbnRlbnNpdHkgPT4ge1xyXG4gICAgICB2aWJyYXRpb25NYW5hZ2VyLnNldFZpYnJhdGlvbkludGVuc2l0eSggaW50ZW5zaXR5ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbGF5b3V0XHJcbiAgICBjb25zdCBzd2l0Y2hDb250YWluZXIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBpbnRlbnNpdHlTd2l0Y2gsIGludGVuc2l0eUxhYmVsIF0gfSApO1xyXG4gICAgaW50ZW5zaXR5TGFiZWwuY2VudGVyVG9wID0gaW50ZW5zaXR5U3dpdGNoLmNlbnRlckJvdHRvbTtcclxuICAgIHN3aXRjaENvbnRhaW5lci5jZW50ZXJCb3R0b20gPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJCb3R0b207XHJcblxyXG4gICAgdmlicmF0aW9uVG9nZ2xlQnV0dG9uLmNlbnRlclRvcCA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclRvcDtcclxuXHJcbiAgICAvLyBhZGQgdG8gdmlld1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmlicmF0aW9uVG9nZ2xlQnV0dG9uICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzd2l0Y2hDb250YWluZXIgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzdGVwKCBkdCApIHtcclxuICB9XHJcbn1cclxuXHJcbnRhcHBpLnJlZ2lzdGVyKCAnQmFzaWNzU2NyZWVuVmlldycsIEJhc2ljc1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmFzaWNzU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMkNBQTJDO0FBQ3ZFLE9BQU9DLG1CQUFtQixNQUFNLCtDQUErQztBQUMvRSxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLFVBQVUsTUFBTSx1Q0FBdUM7QUFDOUQsT0FBT0MsUUFBUSxNQUFNLDRDQUE0QztBQUNqRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDakUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyw4QkFBOEIsTUFBTSxpRUFBaUU7QUFDNUcsT0FBT0MsS0FBSyxNQUFNLG1CQUFtQjtBQUNyQyxPQUFPQyxnQkFBZ0IsSUFBSUMsU0FBUyxRQUFRLDhCQUE4Qjs7QUFFMUU7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSVIsUUFBUSxDQUFFO0VBQUVTLElBQUksRUFBRTtBQUFJLENBQUUsQ0FBQztBQUNoRCxNQUFNQyxnQkFB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