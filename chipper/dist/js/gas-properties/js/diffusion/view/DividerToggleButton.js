// Copyright 2019-2022, University of Colorado Boulder

/**
 * DividerToggleButton is used to toggle the container's vertical divider. It is color-coded to the divider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, Text } from '../../../../scenery/js/imports.js';
import BooleanRectangularToggleButton from '../../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import GasPropertiesConstants from '../../common/GasPropertiesConstants.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';
export default class DividerToggleButton extends BooleanRectangularToggleButton {
  constructor(hasDividerProperty, providedOptions) {
    const options = optionize()({
      // BooleanRectangularToggleButtonOptions
      baseColor: GasPropertiesColors.dividerColorProperty
    }, providedOptions);
    const textOptions = {
      font: GasPropertiesConstants.CONTROL_FONT,
      fill: 'black',
      maxWidth: 150 // determined empirically
    };

    const alignGroup = new AlignGroup();
    const trueNode = new AlignBox(new Text(GasPropertiesStrings.removeDividerStringProperty, textOptions), {
      group: alignGroup
    });
    const falseNode = new AlignBox(new Text(GasPropertiesStrings.resetDividerStringProperty, textOptions), {
      group: alignGroup
    });
    super(hasDividerProperty, trueNode, falseNode, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('DividerToggleButton', DividerToggleButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJUZXh0IiwiQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIiwiR2FzUHJvcGVydGllc0NvbG9ycyIsIkdhc1Byb3BlcnRpZXNDb25zdGFudHMiLCJnYXNQcm9wZXJ0aWVzIiwiR2FzUHJvcGVydGllc1N0cmluZ3MiLCJEaXZpZGVyVG9nZ2xlQnV0dG9uIiwiY29uc3RydWN0b3IiLCJoYXNEaXZpZGVyUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmFzZUNvbG9yIiwiZGl2aWRlckNvbG9yUHJvcGVydHkiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJDT05UUk9MX0ZPTlQiLCJmaWxsIiwibWF4V2lkdGgiLCJhbGlnbkdyb3VwIiwidHJ1ZU5vZGUiLCJyZW1vdmVEaXZpZGVyU3RyaW5nUHJvcGVydHkiLCJncm91cCIsImZhbHNlTm9kZSIsInJlc2V0RGl2aWRlclN0cmluZ1Byb3BlcnR5IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGl2aWRlclRvZ2dsZUJ1dHRvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEaXZpZGVyVG9nZ2xlQnV0dG9uIGlzIHVzZWQgdG8gdG9nZ2xlIHRoZSBjb250YWluZXIncyB2ZXJ0aWNhbCBkaXZpZGVyLiBJdCBpcyBjb2xvci1jb2RlZCB0byB0aGUgZGl2aWRlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24sIHsgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HYXNQcm9wZXJ0aWVzQ29sb3JzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dhc1Byb3BlcnRpZXNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEdhc1Byb3BlcnRpZXNTdHJpbmdzIGZyb20gJy4uLy4uL0dhc1Byb3BlcnRpZXNTdHJpbmdzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBEaXZpZGVyVG9nZ2xlQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcclxuICBQaWNrT3B0aW9uYWw8Qm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucywgJ2xheW91dE9wdGlvbnMnPiAmXHJcbiAgUGlja1JlcXVpcmVkPEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpdmlkZXJUb2dnbGVCdXR0b24gZXh0ZW5kcyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGhhc0RpdmlkZXJQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9uczogRGl2aWRlclRvZ2dsZUJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXZpZGVyVG9nZ2xlQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnNcclxuICAgICAgYmFzZUNvbG9yOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLmRpdmlkZXJDb2xvclByb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHtcclxuICAgICAgZm9udDogR2FzUHJvcGVydGllc0NvbnN0YW50cy5DT05UUk9MX0ZPTlQsXHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIG1heFdpZHRoOiAxNTAgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBhbGlnbkdyb3VwID0gbmV3IEFsaWduR3JvdXAoKTtcclxuICAgIGNvbnN0IHRydWVOb2RlID0gbmV3IEFsaWduQm94KCBuZXcgVGV4dCggR2FzUHJvcGVydGllc1N0cmluZ3MucmVtb3ZlRGl2aWRlclN0cmluZ1Byb3BlcnR5LCB0ZXh0T3B0aW9ucyApLCB7XHJcbiAgICAgIGdyb3VwOiBhbGlnbkdyb3VwXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBmYWxzZU5vZGUgPSBuZXcgQWxpZ25Cb3goIG5ldyBUZXh0KCBHYXNQcm9wZXJ0aWVzU3RyaW5ncy5yZXNldERpdmlkZXJTdHJpbmdQcm9wZXJ0eSwgdGV4dE9wdGlvbnMgKSwge1xyXG4gICAgICBncm91cDogYWxpZ25Hcm91cFxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBoYXNEaXZpZGVyUHJvcGVydHksIHRydWVOb2RlLCBmYWxzZU5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5nYXNQcm9wZXJ0aWVzLnJlZ2lzdGVyKCAnRGl2aWRlclRvZ2dsZUJ1dHRvbicsIERpdmlkZXJUb2dnbGVCdXR0b24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFHbkYsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUUsT0FBT0MsOEJBQThCLE1BQWlELDhEQUE4RDtBQUNwSixPQUFPQyxtQkFBbUIsTUFBTSxxQ0FBcUM7QUFDckUsT0FBT0Msc0JBQXNCLE1BQU0sd0NBQXdDO0FBQzNFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBUWhFLGVBQWUsTUFBTUMsbUJBQW1CLFNBQVNMLDhCQUE4QixDQUFDO0VBRXZFTSxXQUFXQSxDQUFFQyxrQkFBcUMsRUFBRUMsZUFBMkMsRUFBRztJQUV2RyxNQUFNQyxPQUFPLEdBQUdiLFNBQVMsQ0FBaUYsQ0FBQyxDQUFFO01BRTNHO01BQ0FjLFNBQVMsRUFBRVQsbUJBQW1CLENBQUNVO0lBQ2pDLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQztJQUVwQixNQUFNSSxXQUFXLEdBQUc7TUFDbEJDLElBQUksRUFBRVgsc0JBQXNCLENBQUNZLFlBQVk7TUFDekNDLElBQUksRUFBRSxPQUFPO01BQ2JDLFFBQVEsRUFBRSxHQUFHLENBQUM7SUFDaEIsQ0FBQzs7SUFFRCxNQUFNQyxVQUFVLEdBQUcsSUFBSW5CLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLE1BQU1vQixRQUFRLEdBQUcsSUFBSXJCLFFBQVEsQ0FBRSxJQUFJRSxJQUFJLENBQUVLLG9CQUFvQixDQUFDZSwyQkFBMkIsRUFBRVAsV0FBWSxDQUFDLEVBQUU7TUFDeEdRLEtBQUssRUFBRUg7SUFDVCxDQUFFLENBQUM7SUFDSCxNQUFNSSxTQUFTLEdBQUcsSUFBSXhCLFFBQVEsQ0FBRSxJQUFJRSxJQUFJLENBQUVLLG9CQUFvQixDQUFDa0IsMEJBQTBCLEVBQUVWLFdBQVksQ0FBQyxFQUFFO01BQ3hHUSxLQUFLLEVBQUVIO0lBQ1QsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFVixrQkFBa0IsRUFBRVcsUUFBUSxFQUFFRyxTQUFTLEVBQUVaLE9BQVEsQ0FBQztFQUMzRDtFQUVnQmMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFwQixhQUFhLENBQUNzQixRQUFRLENBQUUscUJBQXFCLEVBQUVwQixtQkFBb0IsQ0FBQyJ9