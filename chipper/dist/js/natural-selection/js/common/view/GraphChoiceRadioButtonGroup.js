// Copyright 2019-2022, University of Colorado Boulder

/**
 * GraphsRadioButtonGroup is the radio button group for selecting which of the graphs is visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Text } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionStrings from '../../NaturalSelectionStrings.js';
import NaturalSelectionConstants from '../NaturalSelectionConstants.js';
import GraphChoice from './GraphChoice.js';

// constants
const TEXT_OPTIONS = {
  font: NaturalSelectionConstants.RADIO_BUTTON_FONT,
  maxWidth: 175 // determined empirically
};

export default class GraphChoiceRadioButtonGroup extends VerticalAquaRadioButtonGroup {
  constructor(graphChoiceProperty, providedOptions) {
    const options = optionize()({
      // VerticalAquaRadioButtonGroupOptions
      spacing: 12,
      touchAreaXDilation: 8,
      mouseAreaXDilation: 8
    }, providedOptions);

    // Create the description of the buttons
    const items = [
    // Population
    {
      value: GraphChoice.POPULATION,
      createNode: tandem => new Text(NaturalSelectionStrings.populationStringProperty, combineOptions({
        tandem: tandem.createTandem('labelText')
      }, TEXT_OPTIONS)),
      tandemName: `population${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    },
    // Proportions
    {
      value: GraphChoice.PROPORTIONS,
      createNode: tandem => new Text(NaturalSelectionStrings.proportionsStringProperty, combineOptions({
        tandem: tandem.createTandem('labelText')
      }, TEXT_OPTIONS)),
      tandemName: `proportions${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    },
    // Pedigree
    {
      value: GraphChoice.PEDIGREE,
      createNode: tandem => new Text(NaturalSelectionStrings.pedigreeStringProperty, combineOptions({
        tandem: tandem.createTandem('labelText')
      }, TEXT_OPTIONS)),
      tandemName: `pedigree${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    },
    // None
    {
      value: GraphChoice.NONE,
      createNode: tandem => new Text(NaturalSelectionStrings.noneStringProperty, combineOptions({
        tandem: tandem.createTandem('labelText')
      }, TEXT_OPTIONS)),
      tandemName: `none${AquaRadioButton.TANDEM_NAME_SUFFIX}`
    }];
    super(graphChoiceProperty, items, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
naturalSelection.register('GraphChoiceRadioButtonGroup', GraphChoiceRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlRleHQiLCJBcXVhUmFkaW9CdXR0b24iLCJWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwibmF0dXJhbFNlbGVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzIiwiTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cyIsIkdyYXBoQ2hvaWNlIiwiVEVYVF9PUFRJT05TIiwiZm9udCIsIlJBRElPX0JVVFRPTl9GT05UIiwibWF4V2lkdGgiLCJHcmFwaENob2ljZVJhZGlvQnV0dG9uR3JvdXAiLCJjb25zdHJ1Y3RvciIsImdyYXBoQ2hvaWNlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic3BhY2luZyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIml0ZW1zIiwidmFsdWUiLCJQT1BVTEFUSU9OIiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsInBvcHVsYXRpb25TdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInRhbmRlbU5hbWUiLCJUQU5ERU1fTkFNRV9TVUZGSVgiLCJQUk9QT1JUSU9OUyIsInByb3BvcnRpb25zU3RyaW5nUHJvcGVydHkiLCJQRURJR1JFRSIsInBlZGlncmVlU3RyaW5nUHJvcGVydHkiLCJOT05FIiwibm9uZVN0cmluZ1Byb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JhcGhDaG9pY2VSYWRpb0J1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdyYXBoc1JhZGlvQnV0dG9uR3JvdXAgaXMgdGhlIHJhZGlvIGJ1dHRvbiBncm91cCBmb3Igc2VsZWN0aW5nIHdoaWNoIG9mIHRoZSBncmFwaHMgaXMgdmlzaWJsZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHsgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BcXVhUmFkaW9CdXR0b24uanMnO1xyXG5pbXBvcnQgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCwgeyBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzIGZyb20gJy4uL05hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgR3JhcGhDaG9pY2UgZnJvbSAnLi9HcmFwaENob2ljZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVEVYVF9PUFRJT05TOiBTdHJpY3RPbWl0PFRleHRPcHRpb25zLCAndGFuZGVtJz4gPSB7XHJcbiAgZm9udDogTmF0dXJhbFNlbGVjdGlvbkNvbnN0YW50cy5SQURJT19CVVRUT05fRk9OVCxcclxuICBtYXhXaWR0aDogMTc1IC8vIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBHcmFwaENob2ljZVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFwaENob2ljZVJhZGlvQnV0dG9uR3JvdXAgZXh0ZW5kcyBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwPEdyYXBoQ2hvaWNlPiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZ3JhcGhDaG9pY2VQcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxHcmFwaENob2ljZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEdyYXBoQ2hvaWNlUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmFwaENob2ljZVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zLCBTZWxmT3B0aW9ucywgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zXHJcbiAgICAgIHNwYWNpbmc6IDEyLFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDgsXHJcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogOFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgYnV0dG9uc1xyXG4gICAgY29uc3QgaXRlbXMgPSBbXHJcblxyXG4gICAgICAvLyBQb3B1bGF0aW9uXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogR3JhcGhDaG9pY2UuUE9QVUxBVElPTixcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLnBvcHVsYXRpb25TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgICAgICAgIH0sIFRFWFRfT1BUSU9OUyApICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHBvcHVsYXRpb24ke0FxdWFSYWRpb0J1dHRvbi5UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gUHJvcG9ydGlvbnNcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBHcmFwaENob2ljZS5QUk9QT1JUSU9OUyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLnByb3BvcnRpb25zU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApXHJcbiAgICAgICAgICB9LCBURVhUX09QVElPTlMgKSApLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6IGBwcm9wb3J0aW9ucyR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBQZWRpZ3JlZVxyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IEdyYXBoQ2hvaWNlLlBFRElHUkVFLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MucGVkaWdyZWVTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgICAgICAgIH0sIFRFWFRfT1BUSU9OUyApICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogYHBlZGlncmVlJHtBcXVhUmFkaW9CdXR0b24uVEFOREVNX05BTUVfU1VGRklYfWBcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIE5vbmVcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBHcmFwaENob2ljZS5OT05FLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggTmF0dXJhbFNlbGVjdGlvblN0cmluZ3Mubm9uZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgICAgICAgfSwgVEVYVF9PUFRJT05TICkgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgbm9uZSR7QXF1YVJhZGlvQnV0dG9uLlRBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIGdyYXBoQ2hvaWNlUHJvcGVydHksIGl0ZW1zLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ0dyYXBoQ2hvaWNlUmFkaW9CdXR0b25Hcm91cCcsIEdyYXBoQ2hvaWNlUmFkaW9CdXR0b25Hcm91cCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLElBQUlDLGNBQWMsUUFBMEIsdUNBQXVDO0FBR25HLFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ3JFLE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsNEJBQTRCLE1BQStDLG9EQUFvRDtBQUV0SSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCOztBQUUxQztBQUNBLE1BQU1DLFlBQStDLEdBQUc7RUFDdERDLElBQUksRUFBRUgseUJBQXlCLENBQUNJLGlCQUFpQjtFQUNqREMsUUFBUSxFQUFFLEdBQUcsQ0FBQztBQUNoQixDQUFDOztBQU9ELGVBQWUsTUFBTUMsMkJBQTJCLFNBQVNULDRCQUE0QixDQUFjO0VBRTFGVSxXQUFXQSxDQUFFQyxtQkFBcUQsRUFDckRDLGVBQW1ELEVBQUc7SUFFeEUsTUFBTUMsT0FBTyxHQUFHakIsU0FBUyxDQUF1RixDQUFDLENBQUU7TUFFakg7TUFDQWtCLE9BQU8sRUFBRSxFQUFFO01BQ1hDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFO0lBQ3RCLENBQUMsRUFBRUosZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNSyxLQUFLLEdBQUc7SUFFWjtJQUNBO01BQ0VDLEtBQUssRUFBRWQsV0FBVyxDQUFDZSxVQUFVO01BQzdCQyxVQUFVLEVBQUlDLE1BQWMsSUFBTSxJQUFJdkIsSUFBSSxDQUFFSSx1QkFBdUIsQ0FBQ29CLHdCQUF3QixFQUMxRnpCLGNBQWMsQ0FBZTtRQUMzQndCLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWTtNQUMzQyxDQUFDLEVBQUVsQixZQUFhLENBQUUsQ0FBQztNQUNyQm1CLFVBQVUsRUFBRyxhQUFZekIsZUFBZSxDQUFDMEIsa0JBQW1CO0lBQzlELENBQUM7SUFFRDtJQUNBO01BQ0VQLEtBQUssRUFBRWQsV0FBVyxDQUFDc0IsV0FBVztNQUM5Qk4sVUFBVSxFQUFJQyxNQUFjLElBQU0sSUFBSXZCLElBQUksQ0FBRUksdUJBQXVCLENBQUN5Qix5QkFBeUIsRUFDM0Y5QixjQUFjLENBQWU7UUFDM0J3QixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLFdBQVk7TUFDM0MsQ0FBQyxFQUFFbEIsWUFBYSxDQUFFLENBQUM7TUFDckJtQixVQUFVLEVBQUcsY0FBYXpCLGVBQWUsQ0FBQzBCLGtCQUFtQjtJQUMvRCxDQUFDO0lBRUQ7SUFDQTtNQUNFUCxLQUFLLEVBQUVkLFdBQVcsQ0FBQ3dCLFFBQVE7TUFDM0JSLFVBQVUsRUFBSUMsTUFBYyxJQUFNLElBQUl2QixJQUFJLENBQUVJLHVCQUF1QixDQUFDMkIsc0JBQXNCLEVBQ3hGaEMsY0FBYyxDQUFlO1FBQzNCd0IsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSxXQUFZO01BQzNDLENBQUMsRUFBRWxCLFlBQWEsQ0FBRSxDQUFDO01BQ3JCbUIsVUFBVSxFQUFHLFdBQVV6QixlQUFlLENBQUMwQixrQkFBbUI7SUFDNUQsQ0FBQztJQUVEO0lBQ0E7TUFDRVAsS0FBSyxFQUFFZCxXQUFXLENBQUMwQixJQUFJO01BQ3ZCVixVQUFVLEVBQUlDLE1BQWMsSUFBTSxJQUFJdkIsSUFBSSxDQUFFSSx1QkFBdUIsQ0FBQzZCLGtCQUFrQixFQUNwRmxDLGNBQWMsQ0FBZTtRQUMzQndCLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWTtNQUMzQyxDQUFDLEVBQUVsQixZQUFhLENBQUUsQ0FBQztNQUNyQm1CLFVBQVUsRUFBRyxPQUFNekIsZUFBZSxDQUFDMEIsa0JBQW1CO0lBQ3hELENBQUMsQ0FDRjtJQUVELEtBQUssQ0FBRWQsbUJBQW1CLEVBQUVNLEtBQUssRUFBRUosT0FBUSxDQUFDO0VBQzlDO0VBRWdCbUIsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUEvQixnQkFBZ0IsQ0FBQ2lDLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRXpCLDJCQUE0QixDQUFDIn0=