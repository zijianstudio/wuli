// Copyright 2013-2022, University of Colorado Boulder

/**
 * Atoms look like shaded spheres.
 * Origin is at geometric center of bounding rectangle.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../phet-core/js/optionize.js';
import ShadedSphereNode from '../../../scenery-phet/js/ShadedSphereNode.js';
import Element from '../Element.js';
import nitroglycerin from '../nitroglycerin.js';

// constants
const RATE_OF_CHANGE = 0.75; // >0 and <1, increase this to make small atoms appear smaller
const MAX_RADIUS = Element.P.covalentRadius; // not actually the maximum, but this is a constant from the previous version
const MODEL_TO_VIEW_SCALE = 0.11;
export default class AtomNode extends ShadedSphereNode {
  constructor(element, providedOptions) {
    const options = optionize()({
      mainColor: element.color
    }, providedOptions);
    super(2 * scaleRadius(element.covalentRadius), options);
  }
}

/*
 * There is a large difference between the radii of the smallest and largest atoms.
 * This function adjusts scaling so that the difference is still noticeable, but not as large.
 */
function scaleRadius(radius) {
  const adjustedRadius = MAX_RADIUS - RATE_OF_CHANGE * (MAX_RADIUS - radius);
  return MODEL_TO_VIEW_SCALE * adjustedRadius;
}
nitroglycerin.register('AtomNode', AtomNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJTaGFkZWRTcGhlcmVOb2RlIiwiRWxlbWVudCIsIm5pdHJvZ2x5Y2VyaW4iLCJSQVRFX09GX0NIQU5HRSIsIk1BWF9SQURJVVMiLCJQIiwiY292YWxlbnRSYWRpdXMiLCJNT0RFTF9UT19WSUVXX1NDQUxFIiwiQXRvbU5vZGUiLCJjb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibWFpbkNvbG9yIiwiY29sb3IiLCJzY2FsZVJhZGl1cyIsInJhZGl1cyIsImFkanVzdGVkUmFkaXVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdG9tTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBdG9tcyBsb29rIGxpa2Ugc2hhZGVkIHNwaGVyZXMuXHJcbiAqIE9yaWdpbiBpcyBhdCBnZW9tZXRyaWMgY2VudGVyIG9mIGJvdW5kaW5nIHJlY3RhbmdsZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFNoYWRlZFNwaGVyZU5vZGUsIHsgU2hhZGVkU3BoZXJlTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2hhZGVkU3BoZXJlTm9kZS5qcyc7XHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4uL0VsZW1lbnQuanMnO1xyXG5pbXBvcnQgbml0cm9nbHljZXJpbiBmcm9tICcuLi9uaXRyb2dseWNlcmluLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBSQVRFX09GX0NIQU5HRSA9IDAuNzU7IC8vID4wIGFuZCA8MSwgaW5jcmVhc2UgdGhpcyB0byBtYWtlIHNtYWxsIGF0b21zIGFwcGVhciBzbWFsbGVyXHJcbmNvbnN0IE1BWF9SQURJVVMgPSBFbGVtZW50LlAuY292YWxlbnRSYWRpdXM7IC8vIG5vdCBhY3R1YWxseSB0aGUgbWF4aW11bSwgYnV0IHRoaXMgaXMgYSBjb25zdGFudCBmcm9tIHRoZSBwcmV2aW91cyB2ZXJzaW9uXHJcbmNvbnN0IE1PREVMX1RPX1ZJRVdfU0NBTEUgPSAwLjExO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIEF0b21Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU2hhZGVkU3BoZXJlTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tTm9kZSBleHRlbmRzIFNoYWRlZFNwaGVyZU5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVsZW1lbnQ6IEVsZW1lbnQsIHByb3ZpZGVkT3B0aW9ucz86IEF0b21Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEF0b21Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFNoYWRlZFNwaGVyZU5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIG1haW5Db2xvcjogZWxlbWVudC5jb2xvclxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIDIgKiBzY2FsZVJhZGl1cyggZWxlbWVudC5jb3ZhbGVudFJhZGl1cyApLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKlxyXG4gKiBUaGVyZSBpcyBhIGxhcmdlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgcmFkaWkgb2YgdGhlIHNtYWxsZXN0IGFuZCBsYXJnZXN0IGF0b21zLlxyXG4gKiBUaGlzIGZ1bmN0aW9uIGFkanVzdHMgc2NhbGluZyBzbyB0aGF0IHRoZSBkaWZmZXJlbmNlIGlzIHN0aWxsIG5vdGljZWFibGUsIGJ1dCBub3QgYXMgbGFyZ2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBzY2FsZVJhZGl1cyggcmFkaXVzOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICBjb25zdCBhZGp1c3RlZFJhZGl1cyA9ICggTUFYX1JBRElVUyAtIFJBVEVfT0ZfQ0hBTkdFICogKCBNQVhfUkFESVVTIC0gcmFkaXVzICkgKTtcclxuICByZXR1cm4gTU9ERUxfVE9fVklFV19TQ0FMRSAqIGFkanVzdGVkUmFkaXVzO1xyXG59XHJcblxyXG5uaXRyb2dseWNlcmluLnJlZ2lzdGVyKCAnQXRvbU5vZGUnLCBBdG9tTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBNEIsb0NBQW9DO0FBQ2hGLE9BQU9DLGdCQUFnQixNQUFtQyw4Q0FBOEM7QUFDeEcsT0FBT0MsT0FBTyxNQUFNLGVBQWU7QUFDbkMsT0FBT0MsYUFBYSxNQUFNLHFCQUFxQjs7QUFFL0M7QUFDQSxNQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDN0IsTUFBTUMsVUFBVSxHQUFHSCxPQUFPLENBQUNJLENBQUMsQ0FBQ0MsY0FBYyxDQUFDLENBQUM7QUFDN0MsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSTtBQUtoQyxlQUFlLE1BQU1DLFFBQVEsU0FBU1IsZ0JBQWdCLENBQUM7RUFFOUNTLFdBQVdBLENBQUVDLE9BQWdCLEVBQUVDLGVBQWlDLEVBQUc7SUFFeEUsTUFBTUMsT0FBTyxHQUFHYixTQUFTLENBQXdELENBQUMsQ0FBRTtNQUNsRmMsU0FBUyxFQUFFSCxPQUFPLENBQUNJO0lBQ3JCLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUUsQ0FBQyxHQUFHSSxXQUFXLENBQUVMLE9BQU8sQ0FBQ0osY0FBZSxDQUFDLEVBQUVNLE9BQVEsQ0FBQztFQUM3RDtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0csV0FBV0EsQ0FBRUMsTUFBYyxFQUFXO0VBQzdDLE1BQU1DLGNBQWMsR0FBS2IsVUFBVSxHQUFHRCxjQUFjLElBQUtDLFVBQVUsR0FBR1ksTUFBTSxDQUFJO0VBQ2hGLE9BQU9ULG1CQUFtQixHQUFHVSxjQUFjO0FBQzdDO0FBRUFmLGFBQWEsQ0FBQ2dCLFFBQVEsQ0FBRSxVQUFVLEVBQUVWLFFBQVMsQ0FBQyJ9