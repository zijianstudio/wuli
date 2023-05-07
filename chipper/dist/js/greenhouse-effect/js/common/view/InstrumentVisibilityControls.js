// Copyright 2021-2022, University of Colorado Boulder

/**
 * Visibility controls for components in the observation window of this sim.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import EnergyDescriber from './describers/EnergyDescriber.js';
import GreenhouseEffectCheckbox from './GreenhouseEffectCheckbox.js';
class InstrumentVisibilityControls extends Panel {
  /**
   * @param model
   * @param [providedOptions]
   */
  constructor(model, providedOptions) {
    const options = optionize()({
      // SelfOptions
      vBoxOptions: {
        align: 'left',
        spacing: 5
      },
      includeFluxMeterCheckbox: true,
      // panel options
      fill: 'rgba(255,255,255,0.5)',
      cornerRadius: 5,
      stroke: null,
      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions);
    assert && assert(options.vBoxOptions.children === undefined, 'InstrumentVisibilityControls sets children through options');
    const checkedUtterance = new Utterance();
    Multilink.multilink([model.netInflowOfEnergyProperty, model.inRadiativeBalanceProperty, model.sunEnergySource.isShiningProperty], (netInflowOfEnergy, inRadiativeBalance, sunIsShining) => {
      if (sunIsShining) {
        checkedUtterance.alert = StringUtils.fillIn(GreenhouseEffectStrings.a11y.energyBalanceCheckedPatternStringProperty, {
          checkedResponse: GreenhouseEffectStrings.a11y.energyBalanceCheckedAlertStringProperty,
          outgoingEnergyDescription: EnergyDescriber.getNetEnergyAtAtmosphereDescription(netInflowOfEnergy, inRadiativeBalance)
        });
      } else {
        // If the sun isn't shining, don't include a description of the energy balance.  See
        // https://github.com/phetsims/greenhouse-effect/issues/176 for justification.
        checkedUtterance.alert = GreenhouseEffectStrings.a11y.energyBalanceCheckedAlertStringProperty;
      }
    });

    // add controls to children
    const children = [];
    if (model.energyBalanceVisibleProperty) {
      children.push(new GreenhouseEffectCheckbox(model.energyBalanceVisibleProperty, GreenhouseEffectStrings.energyBalanceStringProperty, {
        // phet-io
        tandem: options.tandem.createTandem('energyBalanceCheckbox'),
        // pdom
        helpText: GreenhouseEffectStrings.a11y.energyBalance.helpTextStringProperty,
        checkedContextResponse: checkedUtterance,
        uncheckedContextResponse: GreenhouseEffectStrings.a11y.energyBalanceUncheckedAlertStringProperty
      }));
    }
    if (options.includeFluxMeterCheckbox) {
      children.push(new GreenhouseEffectCheckbox(model.fluxMeterVisibleProperty, GreenhouseEffectStrings.fluxMeter.titleStringProperty, {
        // phet-io
        tandem: options.tandem.createTandem('fluxMeterCheckbox')
      }));
    }

    // layout
    options.vBoxOptions.children = children;
    const vBox = new VBox(options.vBoxOptions);
    super(vBox, options);
  }
}
greenhouseEffect.register('InstrumentVisibilityControls', InstrumentVisibilityControls);
export default InstrumentVisibilityControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIlZCb3giLCJQYW5lbCIsIlRhbmRlbSIsIlV0dGVyYW5jZSIsImdyZWVuaG91c2VFZmZlY3QiLCJHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyIsIkVuZXJneURlc2NyaWJlciIsIkdyZWVuaG91c2VFZmZlY3RDaGVja2JveCIsIkluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHMiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZCb3hPcHRpb25zIiwiYWxpZ24iLCJzcGFjaW5nIiwiaW5jbHVkZUZsdXhNZXRlckNoZWNrYm94IiwiZmlsbCIsImNvcm5lclJhZGl1cyIsInN0cm9rZSIsInRhbmRlbSIsIlJFUVVJUkVEIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJ1bmRlZmluZWQiLCJjaGVja2VkVXR0ZXJhbmNlIiwibXVsdGlsaW5rIiwibmV0SW5mbG93T2ZFbmVyZ3lQcm9wZXJ0eSIsImluUmFkaWF0aXZlQmFsYW5jZVByb3BlcnR5Iiwic3VuRW5lcmd5U291cmNlIiwiaXNTaGluaW5nUHJvcGVydHkiLCJuZXRJbmZsb3dPZkVuZXJneSIsImluUmFkaWF0aXZlQmFsYW5jZSIsInN1bklzU2hpbmluZyIsImFsZXJ0IiwiZmlsbEluIiwiYTExeSIsImVuZXJneUJhbGFuY2VDaGVja2VkUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiY2hlY2tlZFJlc3BvbnNlIiwiZW5lcmd5QmFsYW5jZUNoZWNrZWRBbGVydFN0cmluZ1Byb3BlcnR5Iiwib3V0Z29pbmdFbmVyZ3lEZXNjcmlwdGlvbiIsImdldE5ldEVuZXJneUF0QXRtb3NwaGVyZURlc2NyaXB0aW9uIiwiZW5lcmd5QmFsYW5jZVZpc2libGVQcm9wZXJ0eSIsInB1c2giLCJlbmVyZ3lCYWxhbmNlU3RyaW5nUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJoZWxwVGV4dCIsImVuZXJneUJhbGFuY2UiLCJoZWxwVGV4dFN0cmluZ1Byb3BlcnR5IiwiY2hlY2tlZENvbnRleHRSZXNwb25zZSIsInVuY2hlY2tlZENvbnRleHRSZXNwb25zZSIsImVuZXJneUJhbGFuY2VVbmNoZWNrZWRBbGVydFN0cmluZ1Byb3BlcnR5IiwiZmx1eE1ldGVyVmlzaWJsZVByb3BlcnR5IiwiZmx1eE1ldGVyIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInZCb3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlzaWJpbGl0eSBjb250cm9scyBmb3IgY29tcG9uZW50cyBpbiB0aGUgb2JzZXJ2YXRpb24gd2luZG93IG9mIHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTGF5ZXJzTW9kZWwgZnJvbSAnLi4vbW9kZWwvTGF5ZXJzTW9kZWwuanMnO1xyXG5pbXBvcnQgRW5lcmd5RGVzY3JpYmVyIGZyb20gJy4vZGVzY3JpYmVycy9FbmVyZ3lEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94IGZyb20gJy4vR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIG9wdGlvbnMgcGFzc2VkIGFsb25nIHRvIHRoZSBWQm94IGNvbnRhaW5pbmcgdGhlIGNvbnRyb2xzXHJcbiAgdkJveE9wdGlvbnM/OiBWQm94T3B0aW9ucztcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgYSBjaGVja2JveCBmb3IgdGhlIGZsdXggbWV0ZXIgd2lsbCBiZSBpbmNsdWRlZCBpbiB0aGUgY29udHJvbHMuXHJcbiAgaW5jbHVkZUZsdXhNZXRlckNoZWNrYm94PzogYm9vbGVhbjtcclxufTtcclxuZXhwb3J0IHR5cGUgSW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9sc09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcclxuXHJcbmNsYXNzIEluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHMgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtb2RlbFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IExheWVyc01vZGVsLCBwcm92aWRlZE9wdGlvbnM/OiBJbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHNPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICB2Qm94T3B0aW9uczoge1xyXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgICAgc3BhY2luZzogNVxyXG4gICAgICB9LFxyXG4gICAgICBpbmNsdWRlRmx1eE1ldGVyQ2hlY2tib3g6IHRydWUsXHJcblxyXG4gICAgICAvLyBwYW5lbCBvcHRpb25zXHJcbiAgICAgIGZpbGw6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNSknLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDUsXHJcbiAgICAgIHN0cm9rZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICBvcHRpb25zLnZCb3hPcHRpb25zLmNoaWxkcmVuID09PSB1bmRlZmluZWQsXHJcbiAgICAgICdJbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzIHNldHMgY2hpbGRyZW4gdGhyb3VnaCBvcHRpb25zJ1xyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBjaGVja2VkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgpO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIG1vZGVsLm5ldEluZmxvd09mRW5lcmd5UHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuaW5SYWRpYXRpdmVCYWxhbmNlUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuc3VuRW5lcmd5U291cmNlLmlzU2hpbmluZ1Byb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggbmV0SW5mbG93T2ZFbmVyZ3ksIGluUmFkaWF0aXZlQmFsYW5jZSwgc3VuSXNTaGluaW5nICkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoIHN1bklzU2hpbmluZyApIHtcclxuICAgICAgICAgIGNoZWNrZWRVdHRlcmFuY2UuYWxlcnQgPSBTdHJpbmdVdGlscy5maWxsSW4oXHJcbiAgICAgICAgICAgIEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZW5lcmd5QmFsYW5jZUNoZWNrZWRQYXR0ZXJuU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBjaGVja2VkUmVzcG9uc2U6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZW5lcmd5QmFsYW5jZUNoZWNrZWRBbGVydFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgICAgIG91dGdvaW5nRW5lcmd5RGVzY3JpcHRpb246IEVuZXJneURlc2NyaWJlci5nZXROZXRFbmVyZ3lBdEF0bW9zcGhlcmVEZXNjcmlwdGlvbihcclxuICAgICAgICAgICAgICAgIG5ldEluZmxvd09mRW5lcmd5LFxyXG4gICAgICAgICAgICAgICAgaW5SYWRpYXRpdmVCYWxhbmNlXHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgc3VuIGlzbid0IHNoaW5pbmcsIGRvbid0IGluY2x1ZGUgYSBkZXNjcmlwdGlvbiBvZiB0aGUgZW5lcmd5IGJhbGFuY2UuICBTZWVcclxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmVlbmhvdXNlLWVmZmVjdC9pc3N1ZXMvMTc2IGZvciBqdXN0aWZpY2F0aW9uLlxyXG4gICAgICAgICAgY2hlY2tlZFV0dGVyYW5jZS5hbGVydCA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZW5lcmd5QmFsYW5jZUNoZWNrZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBhZGQgY29udHJvbHMgdG8gY2hpbGRyZW5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcbiAgICBpZiAoIG1vZGVsLmVuZXJneUJhbGFuY2VWaXNpYmxlUHJvcGVydHkgKSB7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBHcmVlbmhvdXNlRWZmZWN0Q2hlY2tib3goIG1vZGVsLmVuZXJneUJhbGFuY2VWaXNpYmxlUHJvcGVydHksIEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmVuZXJneUJhbGFuY2VTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lCYWxhbmNlQ2hlY2tib3gnICksXHJcblxyXG4gICAgICAgICAgLy8gcGRvbVxyXG4gICAgICAgICAgaGVscFRleHQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZW5lcmd5QmFsYW5jZS5oZWxwVGV4dFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogY2hlY2tlZFV0dGVyYW5jZSxcclxuICAgICAgICAgIHVuY2hlY2tlZENvbnRleHRSZXNwb25zZTogR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5lbmVyZ3lCYWxhbmNlVW5jaGVja2VkQWxlcnRTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICAgIH1cclxuICAgICAgKSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBvcHRpb25zLmluY2x1ZGVGbHV4TWV0ZXJDaGVja2JveCApIHtcclxuICAgICAgY2hpbGRyZW4ucHVzaChcclxuICAgICAgICBuZXcgR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94KFxyXG4gICAgICAgICAgbW9kZWwuZmx1eE1ldGVyVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuZmx1eE1ldGVyLnRpdGxlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmbHV4TWV0ZXJDaGVja2JveCcgKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIG9wdGlvbnMudkJveE9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgIGNvbnN0IHZCb3ggPSBuZXcgVkJveCggb3B0aW9ucy52Qm94T3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB2Qm94LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnSW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scycsIEluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHM7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxTQUFTQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNyRSxPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSw2Q0FBNkM7QUFDbkUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1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