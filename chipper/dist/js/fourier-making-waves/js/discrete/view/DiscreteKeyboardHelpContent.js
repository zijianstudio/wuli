// Copyright 2021-2023, University of Colorado Boulder

/**
 * DiscreteKeyboardHelpContent is the content for the keyboard-help dialog in the 'Discrete' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import MeasurementToolsKeyboardHelpSection from '../../common/view/MeasurementToolsKeyboardHelpSection.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
export default class DiscreteKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {
    const leftSections = [new MeasurementToolsKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()];
    const rightSections = [new BasicActionsKeyboardHelpSection({
      withCheckboxContent: true
    })];
    super(leftSections, rightSections);
    this.disposeDiscreteKeyboardHelpContent = () => {
      leftSections.forEach(section => section.dispose());
      rightSections.forEach(section => section.dispose());
    };
  }

  // @public @override
  dispose() {
    this.disposeDiscreteKeyboardHelpContent();
    super.dispose();
  }
}
fourierMakingWaves.register('DiscreteKeyboardHelpContent', DiscreteKeyboardHelpContent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwiVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCIsIk1lYXN1cmVtZW50VG9vbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwiZm91cmllck1ha2luZ1dhdmVzIiwiRGlzY3JldGVLZXlib2FyZEhlbHBDb250ZW50IiwiY29uc3RydWN0b3IiLCJsZWZ0U2VjdGlvbnMiLCJyaWdodFNlY3Rpb25zIiwid2l0aENoZWNrYm94Q29udGVudCIsImRpc3Bvc2VEaXNjcmV0ZUtleWJvYXJkSGVscENvbnRlbnQiLCJmb3JFYWNoIiwic2VjdGlvbiIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpc2NyZXRlS2V5Ym9hcmRIZWxwQ29udGVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXNjcmV0ZUtleWJvYXJkSGVscENvbnRlbnQgaXMgdGhlIGNvbnRlbnQgZm9yIHRoZSBrZXlib2FyZC1oZWxwIGRpYWxvZyBpbiB0aGUgJ0Rpc2NyZXRlJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBTbGlkZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcclxuaW1wb3J0IFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudC5qcyc7XHJcbmltcG9ydCBNZWFzdXJlbWVudFRvb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9NZWFzdXJlbWVudFRvb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBmb3VyaWVyTWFraW5nV2F2ZXMgZnJvbSAnLi4vLi4vZm91cmllck1ha2luZ1dhdmVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc2NyZXRlS2V5Ym9hcmRIZWxwQ29udGVudCBleHRlbmRzIFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBjb25zdCBsZWZ0U2VjdGlvbnMgPSBbXHJcbiAgICAgIG5ldyBNZWFzdXJlbWVudFRvb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbigpLFxyXG4gICAgICBuZXcgU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uKClcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgcmlnaHRTZWN0aW9ucyA9IFtcclxuICAgICAgbmV3IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24oIHtcclxuICAgICAgICB3aXRoQ2hlY2tib3hDb250ZW50OiB0cnVlXHJcbiAgICAgIH0gKVxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggbGVmdFNlY3Rpb25zLCByaWdodFNlY3Rpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlRGlzY3JldGVLZXlib2FyZEhlbHBDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgICBsZWZ0U2VjdGlvbnMuZm9yRWFjaCggc2VjdGlvbiA9PiBzZWN0aW9uLmRpc3Bvc2UoKSApO1xyXG4gICAgICByaWdodFNlY3Rpb25zLmZvckVhY2goIHNlY3Rpb24gPT4gc2VjdGlvbi5kaXNwb3NlKCkgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIEBvdmVycmlkZVxyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VEaXNjcmV0ZUtleWJvYXJkSGVscENvbnRlbnQoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0Rpc2NyZXRlS2V5Ym9hcmRIZWxwQ29udGVudCcsIERpc2NyZXRlS2V5Ym9hcmRIZWxwQ29udGVudCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSwrQkFBK0IsTUFBTSw4RUFBOEU7QUFDMUgsT0FBT0MsaUNBQWlDLE1BQU0sZ0ZBQWdGO0FBQzlILE9BQU9DLDRCQUE0QixNQUFNLDJFQUEyRTtBQUNwSCxPQUFPQyxtQ0FBbUMsTUFBTSwwREFBMEQ7QUFDMUcsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELGVBQWUsTUFBTUMsMkJBQTJCLFNBQVNILDRCQUE0QixDQUFDO0VBRXBGSSxXQUFXQSxDQUFBLEVBQUc7SUFFWixNQUFNQyxZQUFZLEdBQUcsQ0FDbkIsSUFBSUosbUNBQW1DLENBQUMsQ0FBQyxFQUN6QyxJQUFJRixpQ0FBaUMsQ0FBQyxDQUFDLENBQ3hDO0lBRUQsTUFBTU8sYUFBYSxHQUFHLENBQ3BCLElBQUlSLCtCQUErQixDQUFFO01BQ25DUyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUMsQ0FDSjtJQUVELEtBQUssQ0FBRUYsWUFBWSxFQUFFQyxhQUFjLENBQUM7SUFFcEMsSUFBSSxDQUFDRSxrQ0FBa0MsR0FBRyxNQUFNO01BQzlDSCxZQUFZLENBQUNJLE9BQU8sQ0FBRUMsT0FBTyxJQUFJQSxPQUFPLENBQUNDLE9BQU8sQ0FBQyxDQUFFLENBQUM7TUFDcERMLGFBQWEsQ0FBQ0csT0FBTyxDQUFFQyxPQUFPLElBQUlBLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLENBQUUsQ0FBQztJQUN2RCxDQUFDO0VBQ0g7O0VBRUE7RUFDQUEsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsSUFBSSxDQUFDSCxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ3pDLEtBQUssQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBVCxrQkFBa0IsQ0FBQ1UsUUFBUSxDQUFFLDZCQUE2QixFQUFFVCwyQkFBNEIsQ0FBQyJ9