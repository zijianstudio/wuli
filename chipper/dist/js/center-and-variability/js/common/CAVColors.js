// Copyright 2022-2023, University of Colorado Boulder

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
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { ProfileColorProperty } from '../../../scenery/js/imports.js';
import centerAndVariability from '../centerAndVariability.js';
const CAVColors = {
  // Background color for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty(centerAndVariability, 'background', {
    default: 'white'
  }),
  medianQuestionBarFillColorProperty: new ProfileColorProperty(centerAndVariability, 'medianQuestionBarFill', {
    default: '#58c662'
  }),
  meanAndMedianQuestionBarFillColorProperty: new ProfileColorProperty(centerAndVariability, 'meanAndMedianQuestionBarFill', {
    default: '#955fc4'
  }),
  variabilityQuestionBarFillColorProperty: new ProfileColorProperty(centerAndVariability, 'variabilityQuestionBarFill', {
    default: '#fdd10b'
  }),
  kickButtonFillColorProperty: new ProfileColorProperty(centerAndVariability, 'kickButtonFillColor', {
    default: '#dae6f7'
  }),
  dragIndicatorColorProperty: new ProfileColorProperty(centerAndVariability, 'dragIndicatorColor', {
    default: '#6bc6ff'
  }),
  // sky gradient, sampled from a screenshot
  skyGradientTopColorProperty: new ProfileColorProperty(centerAndVariability, 'skyGradientTop', {
    default: '#365b9b'
  }),
  skyGradientMiddleColorProperty: new ProfileColorProperty(centerAndVariability, 'skyGradientMiddle', {
    default: '#81b5ea'
  }),
  skyGradientBottomColorProperty: new ProfileColorProperty(centerAndVariability, 'skyGradientBottom', {
    default: '#c9d9ef'
  }),
  // the ground
  groundColorProperty: new ProfileColorProperty(centerAndVariability, 'groundColor', {
    default: '#009245'
  }),
  medianColorProperty: new ProfileColorProperty(centerAndVariability, 'medianColor', {
    default: '#f03000'
  }),
  meanColorProperty: new ProfileColorProperty(centerAndVariability, 'meanColor', {
    default: '#8500bd'
  }),
  iqrColorProperty: new ProfileColorProperty(centerAndVariability, 'iqrColor', {
    default: 'black'
  }),
  quartileColorProperty: new ProfileColorProperty(centerAndVariability, 'quartileColor', {
    default: '#99ffff'
  }),
  arrowStrokeProperty: new ProfileColorProperty(centerAndVariability, 'arrowStroke', {
    default: 'black'
  }),
  boxWhiskerStrokeColorProperty: new ProfileColorProperty(centerAndVariability, 'boxWhiskerStrokeColor', {
    default: 'black'
  }),
  grayDataPointFill: new ProfileColorProperty(centerAndVariability, 'grayDataPointFill', {
    default: '#8f8f8f'
  })
};
centerAndVariability.register('CAVColors', CAVColors);
export default CAVColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9maWxlQ29sb3JQcm9wZXJ0eSIsImNlbnRlckFuZFZhcmlhYmlsaXR5IiwiQ0FWQ29sb3JzIiwic2NyZWVuQmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJkZWZhdWx0IiwibWVkaWFuUXVlc3Rpb25CYXJGaWxsQ29sb3JQcm9wZXJ0eSIsIm1lYW5BbmRNZWRpYW5RdWVzdGlvbkJhckZpbGxDb2xvclByb3BlcnR5IiwidmFyaWFiaWxpdHlRdWVzdGlvbkJhckZpbGxDb2xvclByb3BlcnR5Iiwia2lja0J1dHRvbkZpbGxDb2xvclByb3BlcnR5IiwiZHJhZ0luZGljYXRvckNvbG9yUHJvcGVydHkiLCJza3lHcmFkaWVudFRvcENvbG9yUHJvcGVydHkiLCJza3lHcmFkaWVudE1pZGRsZUNvbG9yUHJvcGVydHkiLCJza3lHcmFkaWVudEJvdHRvbUNvbG9yUHJvcGVydHkiLCJncm91bmRDb2xvclByb3BlcnR5IiwibWVkaWFuQ29sb3JQcm9wZXJ0eSIsIm1lYW5Db2xvclByb3BlcnR5IiwiaXFyQ29sb3JQcm9wZXJ0eSIsInF1YXJ0aWxlQ29sb3JQcm9wZXJ0eSIsImFycm93U3Ryb2tlUHJvcGVydHkiLCJib3hXaGlza2VyU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsImdyYXlEYXRhUG9pbnRGaWxsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDQVZDb2xvcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVmaW5lcyB0aGUgY29sb3JzIGZvciB0aGlzIHNpbS5cclxuICpcclxuICogQWxsIHNpbXVsYXRpb25zIHNob3VsZCBoYXZlIGEgQ29sb3JzLmpzIGZpbGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy82NDIuXHJcbiAqXHJcbiAqIEZvciBzdGF0aWMgY29sb3JzIHRoYXQgYXJlIHVzZWQgaW4gbW9yZSB0aGFuIG9uZSBwbGFjZSwgYWRkIHRoZW0gaGVyZS5cclxuICpcclxuICogRm9yIGR5bmFtaWMgY29sb3JzIHRoYXQgY2FuIGJlIGNvbnRyb2xsZWQgdmlhIGNvbG9yUHJvZmlsZVByb3BlcnR5LmpzLCBhZGQgaW5zdGFuY2VzIG9mIFByb2ZpbGVDb2xvclByb3BlcnR5IGhlcmUsXHJcbiAqIGVhY2ggb2Ygd2hpY2ggaXMgcmVxdWlyZWQgdG8gaGF2ZSBhIGRlZmF1bHQgY29sb3IuIE5vdGUgdGhhdCBkeW5hbWljIGNvbG9ycyBjYW4gYmUgZWRpdGVkIGJ5IHJ1bm5pbmcgdGhlIHNpbSBmcm9tXHJcbiAqIHBoZXRtYXJrcyB1c2luZyB0aGUgXCJDb2xvciBFZGl0XCIgbW9kZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFByb2ZpbGVDb2xvclByb3BlcnR5IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNlbnRlckFuZFZhcmlhYmlsaXR5IGZyb20gJy4uL2NlbnRlckFuZFZhcmlhYmlsaXR5LmpzJztcclxuXHJcbmNvbnN0IENBVkNvbG9ycyA9IHtcclxuXHJcbiAgLy8gQmFja2dyb3VuZCBjb2xvciBmb3Igc2NyZWVucyBpbiB0aGlzIHNpbVxyXG4gIHNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnYmFja2dyb3VuZCcsIHtcclxuICAgIGRlZmF1bHQ6ICd3aGl0ZSdcclxuICB9ICksXHJcbiAgbWVkaWFuUXVlc3Rpb25CYXJGaWxsQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ21lZGlhblF1ZXN0aW9uQmFyRmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6ICcjNThjNjYyJ1xyXG4gIH0gKSxcclxuICBtZWFuQW5kTWVkaWFuUXVlc3Rpb25CYXJGaWxsQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ21lYW5BbmRNZWRpYW5RdWVzdGlvbkJhckZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnIzk1NWZjNCdcclxuICB9ICksXHJcbiAgdmFyaWFiaWxpdHlRdWVzdGlvbkJhckZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAndmFyaWFiaWxpdHlRdWVzdGlvbkJhckZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnI2ZkZDEwYidcclxuICB9ICksXHJcbiAga2lja0J1dHRvbkZpbGxDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAna2lja0J1dHRvbkZpbGxDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICcjZGFlNmY3J1xyXG4gIH0gKSxcclxuICBkcmFnSW5kaWNhdG9yQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ2RyYWdJbmRpY2F0b3JDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICcjNmJjNmZmJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8gc2t5IGdyYWRpZW50LCBzYW1wbGVkIGZyb20gYSBzY3JlZW5zaG90XHJcbiAgc2t5R3JhZGllbnRUb3BDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnc2t5R3JhZGllbnRUb3AnLCB7IGRlZmF1bHQ6ICcjMzY1YjliJyB9ICksXHJcbiAgc2t5R3JhZGllbnRNaWRkbGVDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnc2t5R3JhZGllbnRNaWRkbGUnLCB7IGRlZmF1bHQ6ICcjODFiNWVhJyB9ICksXHJcbiAgc2t5R3JhZGllbnRCb3R0b21Db2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnc2t5R3JhZGllbnRCb3R0b20nLCB7IGRlZmF1bHQ6ICcjYzlkOWVmJyB9ICksXHJcblxyXG4gIC8vIHRoZSBncm91bmRcclxuICBncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnZ3JvdW5kQ29sb3InLCB7IGRlZmF1bHQ6ICcjMDA5MjQ1JyB9ICksXHJcblxyXG4gIG1lZGlhbkNvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggY2VudGVyQW5kVmFyaWFiaWxpdHksICdtZWRpYW5Db2xvcicsIHsgZGVmYXVsdDogJyNmMDMwMDAnIH0gKSxcclxuICBtZWFuQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ21lYW5Db2xvcicsIHsgZGVmYXVsdDogJyM4NTAwYmQnIH0gKSxcclxuICBpcXJDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnaXFyQ29sb3InLCB7IGRlZmF1bHQ6ICdibGFjaycgfSApLFxyXG4gIHF1YXJ0aWxlQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ3F1YXJ0aWxlQ29sb3InLCB7IGRlZmF1bHQ6ICcjOTlmZmZmJyB9ICksXHJcbiAgYXJyb3dTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ2Fycm93U3Ryb2tlJywgeyBkZWZhdWx0OiAnYmxhY2snIH0gKSxcclxuICBib3hXaGlza2VyU3Ryb2tlQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBjZW50ZXJBbmRWYXJpYWJpbGl0eSwgJ2JveFdoaXNrZXJTdHJva2VDb2xvcicsIHsgZGVmYXVsdDogJ2JsYWNrJyB9ICksXHJcblxyXG4gIGdyYXlEYXRhUG9pbnRGaWxsOiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIGNlbnRlckFuZFZhcmlhYmlsaXR5LCAnZ3JheURhdGFQb2ludEZpbGwnLCB7IGRlZmF1bHQ6ICcjOGY4ZjhmJyB9IClcclxufTtcclxuXHJcbmNlbnRlckFuZFZhcmlhYmlsaXR5LnJlZ2lzdGVyKCAnQ0FWQ29sb3JzJywgQ0FWQ29sb3JzICk7XHJcbmV4cG9ydCBkZWZhdWx0IENBVkNvbG9yczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0Esb0JBQW9CLFFBQVEsZ0NBQWdDO0FBQ3JFLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUU3RCxNQUFNQyxTQUFTLEdBQUc7RUFFaEI7RUFDQUMsNkJBQTZCLEVBQUUsSUFBSUgsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLFlBQVksRUFBRTtJQUMzRkcsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hDLGtDQUFrQyxFQUFFLElBQUlMLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSx1QkFBdUIsRUFBRTtJQUMzR0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hFLHlDQUF5QyxFQUFFLElBQUlOLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSw4QkFBOEIsRUFBRTtJQUN6SEcsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hHLHVDQUF1QyxFQUFFLElBQUlQLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSw0QkFBNEIsRUFBRTtJQUNySEcsT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hJLDJCQUEyQixFQUFFLElBQUlSLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSxxQkFBcUIsRUFBRTtJQUNsR0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBQ0hLLDBCQUEwQixFQUFFLElBQUlULG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRTtJQUNoR0csT0FBTyxFQUFFO0VBQ1gsQ0FBRSxDQUFDO0VBRUg7RUFDQU0sMkJBQTJCLEVBQUUsSUFBSVYsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFVLENBQUUsQ0FBQztFQUN2SE8sOEJBQThCLEVBQUUsSUFBSVgsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFVLENBQUUsQ0FBQztFQUM3SFEsOEJBQThCLEVBQUUsSUFBSVosb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFVLENBQUUsQ0FBQztFQUU3SDtFQUNBUyxtQkFBbUIsRUFBRSxJQUFJYixvQkFBb0IsQ0FBRUMsb0JBQW9CLEVBQUUsYUFBYSxFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFVLENBQUUsQ0FBQztFQUU1R1UsbUJBQW1CLEVBQUUsSUFBSWQsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLGFBQWEsRUFBRTtJQUFFRyxPQUFPLEVBQUU7RUFBVSxDQUFFLENBQUM7RUFDNUdXLGlCQUFpQixFQUFFLElBQUlmLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSxXQUFXLEVBQUU7SUFBRUcsT0FBTyxFQUFFO0VBQVUsQ0FBRSxDQUFDO0VBQ3hHWSxnQkFBZ0IsRUFBRSxJQUFJaEIsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLFVBQVUsRUFBRTtJQUFFRyxPQUFPLEVBQUU7RUFBUSxDQUFFLENBQUM7RUFDcEdhLHFCQUFxQixFQUFFLElBQUlqQixvQkFBb0IsQ0FBRUMsb0JBQW9CLEVBQUUsZUFBZSxFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFVLENBQUUsQ0FBQztFQUNoSGMsbUJBQW1CLEVBQUUsSUFBSWxCLG9CQUFvQixDQUFFQyxvQkFBb0IsRUFBRSxhQUFhLEVBQUU7SUFBRUcsT0FBTyxFQUFFO0VBQVEsQ0FBRSxDQUFDO0VBQzFHZSw2QkFBNkIsRUFBRSxJQUFJbkIsb0JBQW9CLENBQUVDLG9CQUFvQixFQUFFLHVCQUF1QixFQUFFO0lBQUVHLE9BQU8sRUFBRTtFQUFRLENBQUUsQ0FBQztFQUU5SGdCLGlCQUFpQixFQUFFLElBQUlwQixvQkFBb0IsQ0FBRUMsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUU7SUFBRUcsT0FBTyxFQUFFO0VBQVUsQ0FBRTtBQUNqSCxDQUFDO0FBRURILG9CQUFvQixDQUFDb0IsUUFBUSxDQUFFLFdBQVcsRUFBRW5CLFNBQVUsQ0FBQztBQUN2RCxlQUFlQSxTQUFTIn0=