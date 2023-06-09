// Copyright 2014-2023, University of Colorado Boulder

/**
 * Horizontal bar for selecting an equation.
 *
 * @author Vasily Shakhov (MLearner)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import HorizontalAquaRadioButtonGroup from '../../../../sun/js/HorizontalAquaRadioButtonGroup.js';
import balancingChemicalEquations from '../../balancingChemicalEquations.js';
// constants
const BAR_HEIGHT = 50; //height of control node
const TEXT_OPTIONS = {
  font: new PhetFont(16),
  fill: 'white'
};
export default class EquationChoiceNode extends Node {
  constructor(screenWidth, equationProperty, choices, providedOptions) {
    super();

    // background, extra wide so that it will appear to fill the entire screen for all but extreme window sizes
    this.addChild(new Rectangle(0, 0, 4 * screenWidth, BAR_HEIGHT, {
      fill: '#3376c4',
      centerX: screenWidth / 2
    }));

    // radio button descriptions, one button for each equation
    const radioButtonItems = choices.map(choice => {
      return {
        createNode: () => new Text(choice.labelStringProperty, TEXT_OPTIONS),
        value: choice.equation
      };
    });

    // radio button group, horizontally layout
    const radioButtonGroup = new HorizontalAquaRadioButtonGroup(equationProperty, radioButtonItems, {
      radioButtonOptions: {
        radius: 8
      },
      touchAreaYDilation: 15,
      spacing: 30,
      left: 50,
      centerY: BAR_HEIGHT / 2,
      maxWidth: 0.8 * screenWidth
    });
    this.addChild(radioButtonGroup);
    this.mutate(providedOptions);
  }
}
balancingChemicalEquations.register('EquationChoiceNode', EquationChoiceNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiSG9yaXpvbnRhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMiLCJCQVJfSEVJR0hUIiwiVEVYVF9PUFRJT05TIiwiZm9udCIsImZpbGwiLCJFcXVhdGlvbkNob2ljZU5vZGUiLCJjb25zdHJ1Y3RvciIsInNjcmVlbldpZHRoIiwiZXF1YXRpb25Qcm9wZXJ0eSIsImNob2ljZXMiLCJwcm92aWRlZE9wdGlvbnMiLCJhZGRDaGlsZCIsImNlbnRlclgiLCJyYWRpb0J1dHRvbkl0ZW1zIiwibWFwIiwiY2hvaWNlIiwiY3JlYXRlTm9kZSIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsImVxdWF0aW9uIiwicmFkaW9CdXR0b25Hcm91cCIsInJhZGlvQnV0dG9uT3B0aW9ucyIsInJhZGl1cyIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInNwYWNpbmciLCJsZWZ0IiwiY2VudGVyWSIsIm1heFdpZHRoIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVhdGlvbkNob2ljZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSG9yaXpvbnRhbCBiYXIgZm9yIHNlbGVjdGluZyBhbiBlcXVhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTUxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgSG9yaXpvbnRhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9Ib3Jpem9udGFsQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb24gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VxdWF0aW9uLmpzJztcclxuaW1wb3J0IHsgRXF1YXRpb25DaG9pY2UgfSBmcm9tICcuLi9tb2RlbC9JbnRyb2R1Y3Rpb25Nb2RlbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFSX0hFSUdIVCA9IDUwOyAvL2hlaWdodCBvZiBjb250cm9sIG5vZGVcclxuY29uc3QgVEVYVF9PUFRJT05TID0geyBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksIGZpbGw6ICd3aGl0ZScgfTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBFcXVhdGlvbkNob2ljZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YXRpb25DaG9pY2VOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuV2lkdGg6IG51bWJlciwgZXF1YXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8RXF1YXRpb24+LCBjaG9pY2VzOiBFcXVhdGlvbkNob2ljZVtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogRXF1YXRpb25DaG9pY2VOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGJhY2tncm91bmQsIGV4dHJhIHdpZGUgc28gdGhhdCBpdCB3aWxsIGFwcGVhciB0byBmaWxsIHRoZSBlbnRpcmUgc2NyZWVuIGZvciBhbGwgYnV0IGV4dHJlbWUgd2luZG93IHNpemVzXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA0ICogc2NyZWVuV2lkdGgsIEJBUl9IRUlHSFQsIHtcclxuICAgICAgZmlsbDogJyMzMzc2YzQnLFxyXG4gICAgICBjZW50ZXJYOiBzY3JlZW5XaWR0aCAvIDJcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIHJhZGlvIGJ1dHRvbiBkZXNjcmlwdGlvbnMsIG9uZSBidXR0b24gZm9yIGVhY2ggZXF1YXRpb25cclxuICAgIGNvbnN0IHJhZGlvQnV0dG9uSXRlbXM6IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbTxFcXVhdGlvbj5bXSA9IGNob2ljZXMubWFwKCBjaG9pY2UgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBjaG9pY2UubGFiZWxTdHJpbmdQcm9wZXJ0eSwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgdmFsdWU6IGNob2ljZS5lcXVhdGlvblxyXG4gICAgICB9O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJhZGlvIGJ1dHRvbiBncm91cCwgaG9yaXpvbnRhbGx5IGxheW91dFxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25Hcm91cCA9IG5ldyBIb3Jpem9udGFsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIGVxdWF0aW9uUHJvcGVydHksIHJhZGlvQnV0dG9uSXRlbXMsIHtcclxuICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7IHJhZGl1czogOCB9LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDE1LFxyXG4gICAgICBzcGFjaW5nOiAzMCxcclxuICAgICAgbGVmdDogNTAsXHJcbiAgICAgIGNlbnRlclk6IEJBUl9IRUlHSFQgLyAyLFxyXG4gICAgICBtYXhXaWR0aDogMC44ICogc2NyZWVuV2lkdGhcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJhZGlvQnV0dG9uR3JvdXAgKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucy5yZWdpc3RlciggJ0VxdWF0aW9uQ2hvaWNlTm9kZScsIEVxdWF0aW9uQ2hvaWNlTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBMEJDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUVqRyxPQUFPQyw4QkFBOEIsTUFBTSxzREFBc0Q7QUFDakcsT0FBT0MsMEJBQTBCLE1BQU0scUNBQXFDO0FBSTVFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLE1BQU1DLFlBQVksR0FBRztFQUFFQyxJQUFJLEVBQUUsSUFBSVIsUUFBUSxDQUFFLEVBQUcsQ0FBQztFQUFFUyxJQUFJLEVBQUU7QUFBUSxDQUFDO0FBTWhFLGVBQWUsTUFBTUMsa0JBQWtCLFNBQVNULElBQUksQ0FBQztFQUU1Q1UsV0FBV0EsQ0FBRUMsV0FBbUIsRUFBRUMsZ0JBQW9DLEVBQUVDLE9BQXlCLEVBQ3BGQyxlQUEyQyxFQUFHO0lBRWhFLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSWQsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHVSxXQUFXLEVBQUVOLFVBQVUsRUFBRTtNQUMvREcsSUFBSSxFQUFFLFNBQVM7TUFDZlEsT0FBTyxFQUFFTCxXQUFXLEdBQUc7SUFDekIsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNTSxnQkFBc0QsR0FBR0osT0FBTyxDQUFDSyxHQUFHLENBQUVDLE1BQU0sSUFBSTtNQUNwRixPQUFPO1FBQ0xDLFVBQVUsRUFBRUEsQ0FBQSxLQUFNLElBQUlsQixJQUFJLENBQUVpQixNQUFNLENBQUNFLG1CQUFtQixFQUFFZixZQUFhLENBQUM7UUFDdEVnQixLQUFLLEVBQUVILE1BQU0sQ0FBQ0k7TUFDaEIsQ0FBQztJQUNILENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLGdCQUFnQixHQUFHLElBQUlyQiw4QkFBOEIsQ0FBRVMsZ0JBQWdCLEVBQUVLLGdCQUFnQixFQUFFO01BQy9GUSxrQkFBa0IsRUFBRTtRQUFFQyxNQUFNLEVBQUU7TUFBRSxDQUFDO01BQ2pDQyxrQkFBa0IsRUFBRSxFQUFFO01BQ3RCQyxPQUFPLEVBQUUsRUFBRTtNQUNYQyxJQUFJLEVBQUUsRUFBRTtNQUNSQyxPQUFPLEVBQUV6QixVQUFVLEdBQUcsQ0FBQztNQUN2QjBCLFFBQVEsRUFBRSxHQUFHLEdBQUdwQjtJQUNsQixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNJLFFBQVEsQ0FBRVMsZ0JBQWlCLENBQUM7SUFFakMsSUFBSSxDQUFDUSxNQUFNLENBQUVsQixlQUFnQixDQUFDO0VBQ2hDO0FBQ0Y7QUFFQVYsMEJBQTBCLENBQUM2QixRQUFRLENBQUUsb0JBQW9CLEVBQUV4QixrQkFBbUIsQ0FBQyJ9