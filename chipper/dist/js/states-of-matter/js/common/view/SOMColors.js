// Copyright 2016-2022, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the States of Matter simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const GRAY = new Color(230, 230, 230);
const SOMColors = {
  backgroundProperty: new ProfileColorProperty(statesOfMatter, 'background', {
    default: 'black',
    projector: 'white'
  }),
  controlPanelBackgroundProperty: new ProfileColorProperty(statesOfMatter, 'controlPanelBackground', {
    default: 'black',
    projector: 'white'
  }),
  controlPanelStrokeProperty: new ProfileColorProperty(statesOfMatter, 'controlPanelStroke', {
    default: 'white',
    projector: 'black'
  }),
  controlPanelTextProperty: new ProfileColorProperty(statesOfMatter, 'controlPanelText', {
    default: GRAY,
    projector: 'black'
  }),
  navigationBarIconBackgroundProperty: new ProfileColorProperty(statesOfMatter, 'navigationBarIconBackground', {
    default: 'black',
    projector: 'white'
  }),
  ljGraphAxesAndGridColorProperty: new ProfileColorProperty(statesOfMatter, 'ljGraphAxesAndGridColor', {
    default: GRAY,
    projector: 'black'
  }),
  particleStrokeProperty: new ProfileColorProperty(statesOfMatter, 'particleStroke', {
    default: 'white',
    projector: 'black'
  }),
  removePairGroupProperty: new ProfileColorProperty(statesOfMatter, 'removePairGroup', {
    default: new Color('#d00')
  })
};
statesOfMatter.register('SOMColors', SOMColors);
export default SOMColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xvciIsIlByb2ZpbGVDb2xvclByb3BlcnR5Iiwic3RhdGVzT2ZNYXR0ZXIiLCJHUkFZIiwiU09NQ29sb3JzIiwiYmFja2dyb3VuZFByb3BlcnR5IiwiZGVmYXVsdCIsInByb2plY3RvciIsImNvbnRyb2xQYW5lbEJhY2tncm91bmRQcm9wZXJ0eSIsImNvbnRyb2xQYW5lbFN0cm9rZVByb3BlcnR5IiwiY29udHJvbFBhbmVsVGV4dFByb3BlcnR5IiwibmF2aWdhdGlvbkJhckljb25CYWNrZ3JvdW5kUHJvcGVydHkiLCJsakdyYXBoQXhlc0FuZEdyaWRDb2xvclByb3BlcnR5IiwicGFydGljbGVTdHJva2VQcm9wZXJ0eSIsInJlbW92ZVBhaXJHcm91cFByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTT01Db2xvcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIGNvbG9ycyB1c2VkIGZvciB2YXJpb3VzIG1ham9yIGNvbXBvbmVudHMgb2YgdGhlIFN0YXRlcyBvZiBNYXR0ZXIgc2ltdWxhdGlvbi4gIFRoaXNcclxuICogaXMgdXNlZCB0byBzdXBwb3J0IGRpZmZlcmVudCBjb2xvciBzY2hlbWVzLCBzdWNoIGFzIGEgZGVmYXVsdCB0aGF0IGxvb2tzIGdvb2Qgb24gYSBsYXB0b3Agb3IgdGFibGV0LCBhbmQgYVxyXG4gKiBcInByb2plY3RvciBtb2RlXCIgdGhhdCBsb29rcyBnb29kIHdoZW4gcHJvamVjdGVkIG9uIGEgbGFyZ2Ugc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgeyBDb2xvciwgUHJvZmlsZUNvbG9yUHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEdSQVkgPSBuZXcgQ29sb3IoIDIzMCwgMjMwLCAyMzAgKTtcclxuXHJcbmNvbnN0IFNPTUNvbG9ycyA9IHtcclxuICBiYWNrZ3JvdW5kUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc3RhdGVzT2ZNYXR0ZXIsICdiYWNrZ3JvdW5kJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuICBjb250cm9sUGFuZWxCYWNrZ3JvdW5kUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc3RhdGVzT2ZNYXR0ZXIsICdjb250cm9sUGFuZWxCYWNrZ3JvdW5kJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuICBjb250cm9sUGFuZWxTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBzdGF0ZXNPZk1hdHRlciwgJ2NvbnRyb2xQYW5lbFN0cm9rZScsIHtcclxuICAgIGRlZmF1bHQ6ICd3aGl0ZScsXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcbiAgY29udHJvbFBhbmVsVGV4dFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHN0YXRlc09mTWF0dGVyLCAnY29udHJvbFBhbmVsVGV4dCcsIHtcclxuICAgIGRlZmF1bHQ6IEdSQVksXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcbiAgbmF2aWdhdGlvbkJhckljb25CYWNrZ3JvdW5kUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc3RhdGVzT2ZNYXR0ZXIsICduYXZpZ2F0aW9uQmFySWNvbkJhY2tncm91bmQnLCB7XHJcbiAgICBkZWZhdWx0OiAnYmxhY2snLFxyXG4gICAgcHJvamVjdG9yOiAnd2hpdGUnXHJcbiAgfSApLFxyXG4gIGxqR3JhcGhBeGVzQW5kR3JpZENvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc3RhdGVzT2ZNYXR0ZXIsICdsakdyYXBoQXhlc0FuZEdyaWRDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6IEdSQVksXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcbiAgcGFydGljbGVTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBzdGF0ZXNPZk1hdHRlciwgJ3BhcnRpY2xlU3Ryb2tlJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuICByZW1vdmVQYWlyR3JvdXBQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBzdGF0ZXNPZk1hdHRlciwgJ3JlbW92ZVBhaXJHcm91cCcsIHtcclxuICAgIGRlZmF1bHQ6IG5ldyBDb2xvciggJyNkMDAnIClcclxuICB9IClcclxufTtcclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnU09NQ29sb3JzJywgU09NQ29sb3JzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTT01Db2xvcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssRUFBRUMsb0JBQW9CLFFBQVEsbUNBQW1DO0FBQy9FLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7O0FBRXBEO0FBQ0EsTUFBTUMsSUFBSSxHQUFHLElBQUlILEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztBQUV2QyxNQUFNSSxTQUFTLEdBQUc7RUFDaEJDLGtCQUFrQixFQUFFLElBQUlKLG9CQUFvQixDQUFFQyxjQUFjLEVBQUUsWUFBWSxFQUFFO0lBQzFFSSxPQUFPLEVBQUUsT0FBTztJQUNoQkMsU0FBUyxFQUFFO0VBQ2IsQ0FBRSxDQUFDO0VBQ0hDLDhCQUE4QixFQUFFLElBQUlQLG9CQUFvQixDQUFFQyxjQUFjLEVBQUUsd0JBQXdCLEVBQUU7SUFDbEdJLE9BQU8sRUFBRSxPQUFPO0lBQ2hCQyxTQUFTLEVBQUU7RUFDYixDQUFFLENBQUM7RUFDSEUsMEJBQTBCLEVBQUUsSUFBSVIsb0JBQW9CLENBQUVDLGNBQWMsRUFBRSxvQkFBb0IsRUFBRTtJQUMxRkksT0FBTyxFQUFFLE9BQU87SUFDaEJDLFNBQVMsRUFBRTtFQUNiLENBQUUsQ0FBQztFQUNIRyx3QkFBd0IsRUFBRSxJQUFJVCxvQkFBb0IsQ0FBRUMsY0FBYyxFQUFFLGtCQUFrQixFQUFFO0lBQ3RGSSxPQUFPLEVBQUVILElBQUk7SUFDYkksU0FBUyxFQUFFO0VBQ2IsQ0FBRSxDQUFDO0VBQ0hJLG1DQUFtQyxFQUFFLElBQUlWLG9CQUFvQixDQUFFQyxjQUFjLEVBQUUsNkJBQTZCLEVBQUU7SUFDNUdJLE9BQU8sRUFBRSxPQUFPO0lBQ2hCQyxTQUFTLEVBQUU7RUFDYixDQUFFLENBQUM7RUFDSEssK0JBQStCLEVBQUUsSUFBSVgsb0JBQW9CLENBQUVDLGNBQWMsRUFBRSx5QkFBeUIsRUFBRTtJQUNwR0ksT0FBTyxFQUFFSCxJQUFJO0lBQ2JJLFNBQVMsRUFBRTtFQUNiLENBQUUsQ0FBQztFQUNITSxzQkFBc0IsRUFBRSxJQUFJWixvQkFBb0IsQ0FBRUMsY0FBYyxFQUFFLGdCQUFnQixFQUFFO0lBQ2xGSSxPQUFPLEVBQUUsT0FBTztJQUNoQkMsU0FBUyxFQUFFO0VBQ2IsQ0FBRSxDQUFDO0VBQ0hPLHVCQUF1QixFQUFFLElBQUliLG9CQUFvQixDQUFFQyxjQUFjLEVBQUUsaUJBQWlCLEVBQUU7SUFDcEZJLE9BQU8sRUFBRSxJQUFJTixLQUFLLENBQUUsTUFBTztFQUM3QixDQUFFO0FBQ0osQ0FBQztBQUVERSxjQUFjLENBQUNhLFFBQVEsQ0FBRSxXQUFXLEVBQUVYLFNBQVUsQ0FBQztBQUVqRCxlQUFlQSxTQUFTIn0=