// Copyright 2021-2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import quadrilateral from './quadrilateral.js';
const SCREEN_TEXT_FONT = new PhetFont({
  size: 18
});
const VERTEX_WIDTH = 0.1;
const BOUNDS_WIDTH = 3 + VERTEX_WIDTH;
const BOUNDS_HEIGHT = 2 + VERTEX_WIDTH;
const QuadrilateralConstants = {
  //----------------------------------------------------------------------------------------------------------
  // MODEL CONSTANTS
  //----------------------------------------------------------------------------------------------------------

  // Width of a square vertex in model coordinates.
  VERTEX_WIDTH: VERTEX_WIDTH,
  // Amount of spacing in model coordinates between major grid lines in the visual grid.
  GRID_SPACING: 0.25,
  // Dimensions of model bounds - base size extended by VERTEX_WIDTH so that the edge of a Vertex can get flush
  // against the model bounds as the vertex center snaps to grid lines.
  BOUNDS_WIDTH: BOUNDS_WIDTH,
  BOUNDS_HEIGHT: BOUNDS_HEIGHT,
  // The bounds of the simulation in model coordinates. Origin (0,0) is at the center. The shape and
  // vertices can be positioned within these bounds.
  MODEL_BOUNDS: new Bounds2(-BOUNDS_WIDTH / 2, -BOUNDS_HEIGHT / 2, BOUNDS_WIDTH / 2, BOUNDS_HEIGHT / 2),
  // ONLY FOR ?reducedStepSize.
  MAJOR_REDUCED_SIZE_VERTEX_INTERVAL: 0.0625,
  MINOR_REDUCED_SIZE_VERTEX_INTERVAL: 0.015625,
  //----------------------------------------------------------------------------------------------------------
  // VIEW CONSTANTS
  //----------------------------------------------------------------------------------------------------------
  SCREEN_VIEW_X_MARGIN: 25,
  SCREEN_VIEW_Y_MARGIN: 15,
  // spacing between different groups of components in the ScreenView
  VIEW_GROUP_SPACING: 45,
  // additional spacing in the ScreenView between components (generally in the same group)
  VIEW_SPACING: 15,
  // corner radius used in many rectangles in this sim
  CORNER_RADIUS: 5,
  // dilation frequently used for interactive components in this sim
  POINTER_AREA_DILATION: 5,
  // spacing between grouped controls
  CONTROLS_SPACING: 15,
  // horizontal spacing between a UI component and its label (such as between a checkbox and its label or a button
  // and its label)
  CONTROL_LABEL_SPACING: 10,
  // Font for text that appears on screen
  SCREEN_TEXT_FONT: SCREEN_TEXT_FONT,
  SCREEN_TEXT_OPTIONS: {
    font: SCREEN_TEXT_FONT
  },
  // Text options for titles for panels and dialogs.
  PANEL_TITLE_TEXT_OPTIONS: {
    font: new PhetFont({
      size: 18,
      weight: 'bold'
    })
  },
  // Text options for the "Shape Name" display.
  SHAPE_NAME_TEXT_OPTIONS: {
    font: new PhetFont({
      size: 22
    }),
    maxWidth: 250
  }
};
quadrilateral.register('QuadrilateralConstants', QuadrilateralConstants);
export default QuadrilateralConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUGhldEZvbnQiLCJxdWFkcmlsYXRlcmFsIiwiU0NSRUVOX1RFWFRfRk9OVCIsInNpemUiLCJWRVJURVhfV0lEVEgiLCJCT1VORFNfV0lEVEgiLCJCT1VORFNfSEVJR0hUIiwiUXVhZHJpbGF0ZXJhbENvbnN0YW50cyIsIkdSSURfU1BBQ0lORyIsIk1PREVMX0JPVU5EUyIsIk1BSk9SX1JFRFVDRURfU0laRV9WRVJURVhfSU5URVJWQUwiLCJNSU5PUl9SRURVQ0VEX1NJWkVfVkVSVEVYX0lOVEVSVkFMIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsIlZJRVdfR1JPVVBfU1BBQ0lORyIsIlZJRVdfU1BBQ0lORyIsIkNPUk5FUl9SQURJVVMiLCJQT0lOVEVSX0FSRUFfRElMQVRJT04iLCJDT05UUk9MU19TUEFDSU5HIiwiQ09OVFJPTF9MQUJFTF9TUEFDSU5HIiwiU0NSRUVOX1RFWFRfT1BUSU9OUyIsImZvbnQiLCJQQU5FTF9USVRMRV9URVhUX09QVElPTlMiLCJ3ZWlnaHQiLCJTSEFQRV9OQU1FX1RFWFRfT1BUSU9OUyIsIm1heFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnN0YW50cyB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgcXVhZHJpbGF0ZXJhbCBmcm9tICcuL3F1YWRyaWxhdGVyYWwuanMnO1xyXG5cclxuY29uc3QgU0NSRUVOX1RFWFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCB9ICk7XHJcbmNvbnN0IFZFUlRFWF9XSURUSCA9IDAuMTtcclxuXHJcbmNvbnN0IEJPVU5EU19XSURUSCA9IDMgKyBWRVJURVhfV0lEVEg7XHJcbmNvbnN0IEJPVU5EU19IRUlHSFQgPSAyICsgVkVSVEVYX1dJRFRIO1xyXG5cclxuXHJcbmNvbnN0IFF1YWRyaWxhdGVyYWxDb25zdGFudHMgPSB7XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIE1PREVMIENPTlNUQU5UU1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBXaWR0aCBvZiBhIHNxdWFyZSB2ZXJ0ZXggaW4gbW9kZWwgY29vcmRpbmF0ZXMuXHJcbiAgVkVSVEVYX1dJRFRIOiBWRVJURVhfV0lEVEgsXHJcblxyXG4gIC8vIEFtb3VudCBvZiBzcGFjaW5nIGluIG1vZGVsIGNvb3JkaW5hdGVzIGJldHdlZW4gbWFqb3IgZ3JpZCBsaW5lcyBpbiB0aGUgdmlzdWFsIGdyaWQuXHJcbiAgR1JJRF9TUEFDSU5HOiAwLjI1LFxyXG5cclxuICAvLyBEaW1lbnNpb25zIG9mIG1vZGVsIGJvdW5kcyAtIGJhc2Ugc2l6ZSBleHRlbmRlZCBieSBWRVJURVhfV0lEVEggc28gdGhhdCB0aGUgZWRnZSBvZiBhIFZlcnRleCBjYW4gZ2V0IGZsdXNoXHJcbiAgLy8gYWdhaW5zdCB0aGUgbW9kZWwgYm91bmRzIGFzIHRoZSB2ZXJ0ZXggY2VudGVyIHNuYXBzIHRvIGdyaWQgbGluZXMuXHJcbiAgQk9VTkRTX1dJRFRIOiBCT1VORFNfV0lEVEgsXHJcbiAgQk9VTkRTX0hFSUdIVDogQk9VTkRTX0hFSUdIVCxcclxuXHJcbiAgLy8gVGhlIGJvdW5kcyBvZiB0aGUgc2ltdWxhdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlcy4gT3JpZ2luICgwLDApIGlzIGF0IHRoZSBjZW50ZXIuIFRoZSBzaGFwZSBhbmRcclxuICAvLyB2ZXJ0aWNlcyBjYW4gYmUgcG9zaXRpb25lZCB3aXRoaW4gdGhlc2UgYm91bmRzLlxyXG4gIE1PREVMX0JPVU5EUzogbmV3IEJvdW5kczIoXHJcbiAgICAtQk9VTkRTX1dJRFRIIC8gMixcclxuICAgIC1CT1VORFNfSEVJR0hUIC8gMixcclxuICAgIEJPVU5EU19XSURUSCAvIDIsXHJcbiAgICBCT1VORFNfSEVJR0hUIC8gMlxyXG4gICksXHJcblxyXG4gIC8vIE9OTFkgRk9SID9yZWR1Y2VkU3RlcFNpemUuXHJcbiAgTUFKT1JfUkVEVUNFRF9TSVpFX1ZFUlRFWF9JTlRFUlZBTDogMC4wNjI1LFxyXG4gIE1JTk9SX1JFRFVDRURfU0laRV9WRVJURVhfSU5URVJWQUw6IDAuMDE1NjI1LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBWSUVXIENPTlNUQU5UU1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIFNDUkVFTl9WSUVXX1hfTUFSR0lOOiAyNSxcclxuICBTQ1JFRU5fVklFV19ZX01BUkdJTjogMTUsXHJcblxyXG4gIC8vIHNwYWNpbmcgYmV0d2VlbiBkaWZmZXJlbnQgZ3JvdXBzIG9mIGNvbXBvbmVudHMgaW4gdGhlIFNjcmVlblZpZXdcclxuICBWSUVXX0dST1VQX1NQQUNJTkc6IDQ1LFxyXG5cclxuICAvLyBhZGRpdGlvbmFsIHNwYWNpbmcgaW4gdGhlIFNjcmVlblZpZXcgYmV0d2VlbiBjb21wb25lbnRzIChnZW5lcmFsbHkgaW4gdGhlIHNhbWUgZ3JvdXApXHJcbiAgVklFV19TUEFDSU5HOiAxNSxcclxuXHJcbiAgLy8gY29ybmVyIHJhZGl1cyB1c2VkIGluIG1hbnkgcmVjdGFuZ2xlcyBpbiB0aGlzIHNpbVxyXG4gIENPUk5FUl9SQURJVVM6IDUsXHJcblxyXG4gIC8vIGRpbGF0aW9uIGZyZXF1ZW50bHkgdXNlZCBmb3IgaW50ZXJhY3RpdmUgY29tcG9uZW50cyBpbiB0aGlzIHNpbVxyXG4gIFBPSU5URVJfQVJFQV9ESUxBVElPTjogNSxcclxuXHJcbiAgLy8gc3BhY2luZyBiZXR3ZWVuIGdyb3VwZWQgY29udHJvbHNcclxuICBDT05UUk9MU19TUEFDSU5HOiAxNSxcclxuXHJcbiAgLy8gaG9yaXpvbnRhbCBzcGFjaW5nIGJldHdlZW4gYSBVSSBjb21wb25lbnQgYW5kIGl0cyBsYWJlbCAoc3VjaCBhcyBiZXR3ZWVuIGEgY2hlY2tib3ggYW5kIGl0cyBsYWJlbCBvciBhIGJ1dHRvblxyXG4gIC8vIGFuZCBpdHMgbGFiZWwpXHJcbiAgQ09OVFJPTF9MQUJFTF9TUEFDSU5HOiAxMCxcclxuXHJcbiAgLy8gRm9udCBmb3IgdGV4dCB0aGF0IGFwcGVhcnMgb24gc2NyZWVuXHJcbiAgU0NSRUVOX1RFWFRfRk9OVDogU0NSRUVOX1RFWFRfRk9OVCxcclxuICBTQ1JFRU5fVEVYVF9PUFRJT05TOiB7XHJcbiAgICBmb250OiBTQ1JFRU5fVEVYVF9GT05UXHJcbiAgfSxcclxuXHJcbiAgLy8gVGV4dCBvcHRpb25zIGZvciB0aXRsZXMgZm9yIHBhbmVscyBhbmQgZGlhbG9ncy5cclxuICBQQU5FTF9USVRMRV9URVhUX09QVElPTlM6IHtcclxuICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCwgd2VpZ2h0OiAnYm9sZCcgfSApXHJcbiAgfSxcclxuXHJcbiAgLy8gVGV4dCBvcHRpb25zIGZvciB0aGUgXCJTaGFwZSBOYW1lXCIgZGlzcGxheS5cclxuICBTSEFQRV9OQU1FX1RFWFRfT1BUSU9OUzoge1xyXG4gICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDIyIH0gKSxcclxuICAgIG1heFdpZHRoOiAyNTBcclxuICB9XHJcbn07XHJcblxyXG5xdWFkcmlsYXRlcmFsLnJlZ2lzdGVyKCAnUXVhZHJpbGF0ZXJhbENvbnN0YW50cycsIFF1YWRyaWxhdGVyYWxDb25zdGFudHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgUXVhZHJpbGF0ZXJhbENvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLHlCQUF5QjtBQUM3QyxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBQ3hELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSUYsUUFBUSxDQUFFO0VBQUVHLElBQUksRUFBRTtBQUFHLENBQUUsQ0FBQztBQUNyRCxNQUFNQyxZQUFZLEdBQUcsR0FBRztBQUV4QixNQUFNQyxZQUFZLEdBQUcsQ0FBQyxHQUFHRCxZQUFZO0FBQ3JDLE1BQU1FLGFBQWEsR0FBRyxDQUFDLEdBQUdGLFlBQVk7QUFHdEMsTUFBTUcsc0JBQXNCLEdBQUc7RUFFN0I7RUFDQTtFQUNBOztFQUVBO0VBQ0FILFlBQVksRUFBRUEsWUFBWTtFQUUxQjtFQUNBSSxZQUFZLEVBQUUsSUFBSTtFQUVsQjtFQUNBO0VBQ0FILFlBQVksRUFBRUEsWUFBWTtFQUMxQkMsYUFBYSxFQUFFQSxhQUFhO0VBRTVCO0VBQ0E7RUFDQUcsWUFBWSxFQUFFLElBQUlWLE9BQU8sQ0FDdkIsQ0FBQ00sWUFBWSxHQUFHLENBQUMsRUFDakIsQ0FBQ0MsYUFBYSxHQUFHLENBQUMsRUFDbEJELFlBQVksR0FBRyxDQUFDLEVBQ2hCQyxhQUFhLEdBQUcsQ0FDbEIsQ0FBQztFQUVEO0VBQ0FJLGtDQUFrQyxFQUFFLE1BQU07RUFDMUNDLGtDQUFrQyxFQUFFLFFBQVE7RUFFNUM7RUFDQTtFQUNBO0VBQ0FDLG9CQUFvQixFQUFFLEVBQUU7RUFDeEJDLG9CQUFvQixFQUFFLEVBQUU7RUFFeEI7RUFDQUMsa0JBQWtCLEVBQUUsRUFBRTtFQUV0QjtFQUNBQyxZQUFZLEVBQUUsRUFBRTtFQUVoQjtFQUNBQyxhQUFhLEVBQUUsQ0FBQztFQUVoQjtFQUNBQyxxQkFBcUIsRUFBRSxDQUFDO0VBRXhCO0VBQ0FDLGdCQUFnQixFQUFFLEVBQUU7RUFFcEI7RUFDQTtFQUNBQyxxQkFBcUIsRUFBRSxFQUFFO0VBRXpCO0VBQ0FqQixnQkFBZ0IsRUFBRUEsZ0JBQWdCO0VBQ2xDa0IsbUJBQW1CLEVBQUU7SUFDbkJDLElBQUksRUFBRW5CO0VBQ1IsQ0FBQztFQUVEO0VBQ0FvQix3QkFBd0IsRUFBRTtJQUN4QkQsSUFBSSxFQUFFLElBQUlyQixRQUFRLENBQUU7TUFBRUcsSUFBSSxFQUFFLEVBQUU7TUFBRW9CLE1BQU0sRUFBRTtJQUFPLENBQUU7RUFDbkQsQ0FBQztFQUVEO0VBQ0FDLHVCQUF1QixFQUFFO0lBQ3ZCSCxJQUFJLEVBQUUsSUFBSXJCLFFBQVEsQ0FBRTtNQUFFRyxJQUFJLEVBQUU7SUFBRyxDQUFFLENBQUM7SUFDbENzQixRQUFRLEVBQUU7RUFDWjtBQUNGLENBQUM7QUFFRHhCLGFBQWEsQ0FBQ3lCLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRW5CLHNCQUF1QixDQUFDO0FBQzFFLGVBQWVBLHNCQUFzQiJ9