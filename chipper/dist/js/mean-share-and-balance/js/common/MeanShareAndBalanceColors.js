// Copyright 2022, University of Colorado Boulder

/**
 * Defines the colors for this sim.
 *
 * All simulations should have a Colors.js file, see https://github.com/phetsims/scenery-phet/issues/642.
 *
 * For static colors that are used in more than one place, add them here.
 *
 * For dynamic colors that can be controlled via colorProfileProperty.js, add instances of ProfileColorProperty here,
 * each of which is required to have a default color. Note that dynamic colors can be edited by running the sim from
 * phetmarks using the "Color Edit" mode.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import meanShareAndBalance from '../meanShareAndBalance.js';
const meanShareAndBalanceColors = {
  // Background color for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty(meanShareAndBalance, 'background', {
    default: '#FFF9F0'
  }),
  introQuestionBarColorProperty: new ProfileColorProperty(meanShareAndBalance, 'introQuestionBar', {
    default: '#2496D6'
  }),
  waterFillColorProperty: new ProfileColorProperty(meanShareAndBalance, 'waterSide3DFill', {
    default: '#A5D9F2'
  }),
  waterCup2DBackgroundFillColorProperty: new ProfileColorProperty(meanShareAndBalance, 'waterCup2DBackgroundFill', {
    default: 'white'
  }),
  showMeanLineStrokeColorProperty: new ProfileColorProperty(meanShareAndBalance, 'showMeanLineStroke', {
    default: '#8500bd'
  }),
  predictMeanSliderStrokeColorProperty: new ProfileColorProperty(meanShareAndBalance, 'predictMeanSlider', {
    default: '#666666'
  }),
  waterShadowFillColorProperty: new ProfileColorProperty(meanShareAndBalance, 'waterShadowFill', {
    default: '#8EC6DD'
  }),
  cupWaterLevelLineColorProperty: new ProfileColorProperty(meanShareAndBalance, 'cupWaterLevelLine', {
    default: '#85BBCC'
  }),
  emptyWaterCup3DColorProperty: new ProfileColorProperty(meanShareAndBalance, 'emptyWaterCup3D', {
    default: new Color(249, 253, 255, 0.4)
  }),
  water3DCrescentFillColorProperty: new ProfileColorProperty(meanShareAndBalance, 'water3DCrescentFill', {
    default: '#B4E5F9'
  }),
  waterCup3DGlareFillColorProperty: new ProfileColorProperty(meanShareAndBalance, 'waterCup3DGlareFill', {
    default: new Color(255, 255, 255, 0.4)
  }),
  pipeGradientLightColorProperty: new ProfileColorProperty(meanShareAndBalance, 'pipeGradientLight', {
    default: 'white'
  }),
  pipeGradientDarkColorProperty: new ProfileColorProperty(meanShareAndBalance, 'pipeGradientDark', {
    default: '#4d4d4d'
  }),
  handleGradientLightColorProperty: new ProfileColorProperty(meanShareAndBalance, 'handleGradientLight', {
    default: 'red'
  }),
  handleGradientDarkColorProperty: new ProfileColorProperty(meanShareAndBalance, 'handleGradientDark', {
    default: 'firebrick'
  }),
  levelingOutQuestionBarColorProperty: new ProfileColorProperty(meanShareAndBalance, 'levelingOutQuestionBar', {
    default: '#F97A69'
  }),
  chocolateColorProperty: new ProfileColorProperty(meanShareAndBalance, 'chocolate', {
    default: '#613912'
  }),
  chocolateHighlightColorProperty: new ProfileColorProperty(meanShareAndBalance, 'chocolateHighlight', {
    default: '#7F5039'
  }),
  paperColorProperty: new ProfileColorProperty(meanShareAndBalance, 'paper', {
    default: '#F0F0F0'
  })
};
meanShareAndBalance.register('meanShareAndBalanceColors', meanShareAndBalanceColors);
export default meanShareAndBalanceColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsIlByb2ZpbGVDb2xvclByb3BlcnR5IiwibWVhblNoYXJlQW5kQmFsYW5jZSIsIm1lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnMiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImRlZmF1bHQiLCJpbnRyb1F1ZXN0aW9uQmFyQ29sb3JQcm9wZXJ0eSIsIndhdGVyRmlsbENvbG9yUHJvcGVydHkiLCJ3YXRlckN1cDJEQmFja2dyb3VuZEZpbGxDb2xvclByb3BlcnR5Iiwic2hvd01lYW5MaW5lU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsInByZWRpY3RNZWFuU2xpZGVyU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsIndhdGVyU2hhZG93RmlsbENvbG9yUHJvcGVydHkiLCJjdXBXYXRlckxldmVsTGluZUNvbG9yUHJvcGVydHkiLCJlbXB0eVdhdGVyQ3VwM0RDb2xvclByb3BlcnR5Iiwid2F0ZXIzRENyZXNjZW50RmlsbENvbG9yUHJvcGVydHkiLCJ3YXRlckN1cDNER2xhcmVGaWxsQ29sb3JQcm9wZXJ0eSIsInBpcGVHcmFkaWVudExpZ2h0Q29sb3JQcm9wZXJ0eSIsInBpcGVHcmFkaWVudERhcmtDb2xvclByb3BlcnR5IiwiaGFuZGxlR3JhZGllbnRMaWdodENvbG9yUHJvcGVydHkiLCJoYW5kbGVHcmFkaWVudERhcmtDb2xvclByb3BlcnR5IiwibGV2ZWxpbmdPdXRRdWVzdGlvbkJhckNvbG9yUHJvcGVydHkiLCJjaG9jb2xhdGVDb2xvclByb3BlcnR5IiwiY2hvY29sYXRlSGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSIsInBhcGVyQ29sb3JQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWVhblNoYXJlQW5kQmFsYW5jZUNvbG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVmaW5lcyB0aGUgY29sb3JzIGZvciB0aGlzIHNpbS5cclxuICpcclxuICogQWxsIHNpbXVsYXRpb25zIHNob3VsZCBoYXZlIGEgQ29sb3JzLmpzIGZpbGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy82NDIuXHJcbiAqXHJcbiAqIEZvciBzdGF0aWMgY29sb3JzIHRoYXQgYXJlIHVzZWQgaW4gbW9yZSB0aGFuIG9uZSBwbGFjZSwgYWRkIHRoZW0gaGVyZS5cclxuICpcclxuICogRm9yIGR5bmFtaWMgY29sb3JzIHRoYXQgY2FuIGJlIGNvbnRyb2xsZWQgdmlhIGNvbG9yUHJvZmlsZVByb3BlcnR5LmpzLCBhZGQgaW5zdGFuY2VzIG9mIFByb2ZpbGVDb2xvclByb3BlcnR5IGhlcmUsXHJcbiAqIGVhY2ggb2Ygd2hpY2ggaXMgcmVxdWlyZWQgdG8gaGF2ZSBhIGRlZmF1bHQgY29sb3IuIE5vdGUgdGhhdCBkeW5hbWljIGNvbG9ycyBjYW4gYmUgZWRpdGVkIGJ5IHJ1bm5pbmcgdGhlIHNpbSBmcm9tXHJcbiAqIHBoZXRtYXJrcyB1c2luZyB0aGUgXCJDb2xvciBFZGl0XCIgbW9kZS5cclxuICpcclxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ29sb3IsIFByb2ZpbGVDb2xvclByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lYW5TaGFyZUFuZEJhbGFuY2UgZnJvbSAnLi4vbWVhblNoYXJlQW5kQmFsYW5jZS5qcyc7XHJcblxyXG5jb25zdCBtZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzID0ge1xyXG4gIC8vIEJhY2tncm91bmQgY29sb3IgZm9yIHNjcmVlbnMgaW4gdGhpcyBzaW1cclxuICBzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtZWFuU2hhcmVBbmRCYWxhbmNlLCAnYmFja2dyb3VuZCcsIHtcclxuICAgIGRlZmF1bHQ6ICcjRkZGOUYwJ1xyXG4gIH0gKSxcclxuICBpbnRyb1F1ZXN0aW9uQmFyQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtZWFuU2hhcmVBbmRCYWxhbmNlLCAnaW50cm9RdWVzdGlvbkJhcicsIHtcclxuICAgIGRlZmF1bHQ6ICcjMjQ5NkQ2J1xyXG4gIH0gKSxcclxuICB3YXRlckZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICd3YXRlclNpZGUzREZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnI0E1RDlGMidcclxuICB9ICksXHJcbiAgd2F0ZXJDdXAyREJhY2tncm91bmRGaWxsQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtZWFuU2hhcmVBbmRCYWxhbmNlLCAnd2F0ZXJDdXAyREJhY2tncm91bmRGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJ1xyXG4gIH0gKSxcclxuICBzaG93TWVhbkxpbmVTdHJva2VDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdzaG93TWVhbkxpbmVTdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiAnIzg1MDBiZCdcclxuICB9ICksXHJcbiAgcHJlZGljdE1lYW5TbGlkZXJTdHJva2VDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdwcmVkaWN0TWVhblNsaWRlcicsIHtcclxuICAgIGRlZmF1bHQ6ICcjNjY2NjY2J1xyXG4gIH0gKSxcclxuICB3YXRlclNoYWRvd0ZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICd3YXRlclNoYWRvd0ZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnIzhFQzZERCdcclxuICB9ICksXHJcbiAgY3VwV2F0ZXJMZXZlbExpbmVDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdjdXBXYXRlckxldmVsTGluZScsIHtcclxuICAgIGRlZmF1bHQ6ICcjODVCQkNDJ1xyXG4gIH0gKSxcclxuICBlbXB0eVdhdGVyQ3VwM0RDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdlbXB0eVdhdGVyQ3VwM0QnLCB7XHJcbiAgICBkZWZhdWx0OiBuZXcgQ29sb3IoIDI0OSwgMjUzLCAyNTUsIDAuNCApXHJcbiAgfSApLFxyXG4gIHdhdGVyM0RDcmVzY2VudEZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICd3YXRlcjNEQ3Jlc2NlbnRGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJyNCNEU1RjknXHJcbiAgfSApLFxyXG4gIHdhdGVyQ3VwM0RHbGFyZUZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICd3YXRlckN1cDNER2xhcmVGaWxsJywge1xyXG4gICAgZGVmYXVsdDogbmV3IENvbG9yKCAyNTUsIDI1NSwgMjU1LCAwLjQgKVxyXG4gIH0gKSxcclxuICBwaXBlR3JhZGllbnRMaWdodENvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbWVhblNoYXJlQW5kQmFsYW5jZSwgJ3BpcGVHcmFkaWVudExpZ2h0Jywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJ1xyXG4gIH0gKSxcclxuICBwaXBlR3JhZGllbnREYXJrQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtZWFuU2hhcmVBbmRCYWxhbmNlLCAncGlwZUdyYWRpZW50RGFyaycsIHtcclxuICAgIGRlZmF1bHQ6ICcjNGQ0ZDRkJ1xyXG4gIH0gKSxcclxuICBoYW5kbGVHcmFkaWVudExpZ2h0Q29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtZWFuU2hhcmVBbmRCYWxhbmNlLCAnaGFuZGxlR3JhZGllbnRMaWdodCcsIHtcclxuICAgIGRlZmF1bHQ6ICdyZWQnXHJcbiAgfSApLFxyXG4gIGhhbmRsZUdyYWRpZW50RGFya0NvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbWVhblNoYXJlQW5kQmFsYW5jZSwgJ2hhbmRsZUdyYWRpZW50RGFyaycsIHtcclxuICAgIGRlZmF1bHQ6ICdmaXJlYnJpY2snXHJcbiAgfSApLFxyXG4gIGxldmVsaW5nT3V0UXVlc3Rpb25CYXJDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdsZXZlbGluZ091dFF1ZXN0aW9uQmFyJywge1xyXG4gICAgZGVmYXVsdDogJyNGOTdBNjknXHJcbiAgfSApLFxyXG4gIGNob2NvbGF0ZUNvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbWVhblNoYXJlQW5kQmFsYW5jZSwgJ2Nob2NvbGF0ZScsIHtcclxuICAgIGRlZmF1bHQ6ICcjNjEzOTEyJ1xyXG4gIH0gKSxcclxuICBjaG9jb2xhdGVIaWdobGlnaHRDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdjaG9jb2xhdGVIaWdobGlnaHQnLCB7XHJcbiAgICBkZWZhdWx0OiAnIzdGNTAzOSdcclxuICB9ICksXHJcbiAgcGFwZXJDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1lYW5TaGFyZUFuZEJhbGFuY2UsICdwYXBlcicsIHtcclxuICAgIGRlZmF1bHQ6ICcjRjBGMEYwJ1xyXG4gIH0gKVxyXG59O1xyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ21lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnMnLCBtZWFuU2hhcmVBbmRCYWxhbmNlQ29sb3JzICk7XHJcbmV4cG9ydCBkZWZhdWx0IG1lYW5TaGFyZUFuZEJhbGFuY2VDb2xvcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssRUFBRUMsb0JBQW9CLFFBQVEsZ0NBQWdDO0FBQzVFLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUUzRCxNQUFNQyx5QkFBeUIsR0FBRztFQUNoQztFQUNBQyw2QkFBNkIsRUFBRSxJQUFJSCxvQkFBb0IsQ0FBRUMsbUJBQW1CLEVBQUUsWUFBWSxFQUFFO0lBQzFGRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSEMsNkJBQTZCLEVBQUUsSUFBSUwsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLGtCQUFrQixFQUFFO0lBQ2hHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSEUsc0JBQXNCLEVBQUUsSUFBSU4sb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFO0lBQ3hGRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSEcscUNBQXFDLEVBQUUsSUFBSVAsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLDBCQUEwQixFQUFFO0lBQ2hIRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSEksK0JBQStCLEVBQUUsSUFBSVIsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG9CQUFvQixFQUFFO0lBQ3BHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSEssb0NBQW9DLEVBQUUsSUFBSVQsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFO0lBQ3hHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSE0sNEJBQTRCLEVBQUUsSUFBSVYsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFO0lBQzlGRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSE8sOEJBQThCLEVBQUUsSUFBSVgsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFO0lBQ2xHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSFEsNEJBQTRCLEVBQUUsSUFBSVosb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFO0lBQzlGRyxPQUFPLEVBQUUsSUFBSUwsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUk7RUFDekMsQ0FBRSxDQUFDO0VBQ0hjLGdDQUFnQyxFQUFFLElBQUliLG9CQUFvQixDQUFFQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRTtJQUN0R0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hVLGdDQUFnQyxFQUFFLElBQUlkLG9CQUFvQixDQUFFQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRTtJQUN0R0csT0FBTyxFQUFFLElBQUlMLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJO0VBQ3pDLENBQUUsQ0FBQztFQUNIZ0IsOEJBQThCLEVBQUUsSUFBSWYsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFO0lBQ2xHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSFksNkJBQTZCLEVBQUUsSUFBSWhCLG9CQUFvQixDQUFFQyxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRTtJQUNoR0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hhLGdDQUFnQyxFQUFFLElBQUlqQixvQkFBb0IsQ0FBRUMsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUU7SUFDdEdHLE9BQU8sRUFBRTtFQUNYLENBQUUsQ0FBQztFQUNIYywrQkFBK0IsRUFBRSxJQUFJbEIsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG9CQUFvQixFQUFFO0lBQ3BHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSGUsbUNBQW1DLEVBQUUsSUFBSW5CLG9CQUFvQixDQUFFQyxtQkFBbUIsRUFBRSx3QkFBd0IsRUFBRTtJQUM1R0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hnQixzQkFBc0IsRUFBRSxJQUFJcEIsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLFdBQVcsRUFBRTtJQUNsRkcsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hpQiwrQkFBK0IsRUFBRSxJQUFJckIsb0JBQW9CLENBQUVDLG1CQUFtQixFQUFFLG9CQUFvQixFQUFFO0lBQ3BHRyxPQUFPLEVBQUU7RUFDWCxDQUFFLENBQUM7RUFDSGtCLGtCQUFrQixFQUFFLElBQUl0QixvQkFBb0IsQ0FBRUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFO0lBQzFFRyxPQUFPLEVBQUU7RUFDWCxDQUFFO0FBQ0osQ0FBQztBQUVESCxtQkFBbUIsQ0FBQ3NCLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRXJCLHlCQUEwQixDQUFDO0FBQ3RGLGVBQWVBLHlCQUF5QiJ9