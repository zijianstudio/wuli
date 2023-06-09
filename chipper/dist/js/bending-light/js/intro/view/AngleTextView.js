// Copyright 2021-2023, University of Colorado Boulder
import { Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import bendingLight from '../../bendingLight.js';

/**
 * Shows text with background for the AngleNode.
 * @author Sam Reid (PhET Interactive Simulations)
 */
class AngleTextView extends Panel {
  constructor() {
    const textNode = new Text('', {
      fontSize: 12,
      fill: 'black'
    });
    super(textNode, {
      fill: 'white',
      opacity: 0.75,
      stroke: null,
      lineWidth: 0,
      // width of the background border
      xMargin: 3,
      yMargin: 3,
      cornerRadius: 6,
      // radius of the rounded corners on the background
      resize: true,
      // dynamically resize when content bounds change
      backgroundPickable: false,
      align: 'center',
      // {string} horizontal of content in the pane, left|center|right
      minWidth: 0 // minimum width of the panel
    });

    this.textNode = textNode;
  }
  setAngleText(text) {
    this.textNode.setString(text);
  }
}
bendingLight.register('AngleTextView', AngleTextView);
export default AngleTextView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiUGFuZWwiLCJiZW5kaW5nTGlnaHQiLCJBbmdsZVRleHRWaWV3IiwiY29uc3RydWN0b3IiLCJ0ZXh0Tm9kZSIsImZvbnRTaXplIiwiZmlsbCIsIm9wYWNpdHkiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNvcm5lclJhZGl1cyIsInJlc2l6ZSIsImJhY2tncm91bmRQaWNrYWJsZSIsImFsaWduIiwibWluV2lkdGgiLCJzZXRBbmdsZVRleHQiLCJ0ZXh0Iiwic2V0U3RyaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbmdsZVRleHRWaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuXHJcbi8qKlxyXG4gKiBTaG93cyB0ZXh0IHdpdGggYmFja2dyb3VuZCBmb3IgdGhlIEFuZ2xlTm9kZS5cclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcbmNsYXNzIEFuZ2xlVGV4dFZpZXcgZXh0ZW5kcyBQYW5lbCB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB0ZXh0Tm9kZTogVGV4dDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgdGV4dE5vZGUgPSBuZXcgVGV4dCggJycsIHsgZm9udFNpemU6IDEyLCBmaWxsOiAnYmxhY2snIH0gKTtcclxuXHJcbiAgICBzdXBlciggdGV4dE5vZGUsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgb3BhY2l0eTogMC43NSxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBsaW5lV2lkdGg6IDAsIC8vIHdpZHRoIG9mIHRoZSBiYWNrZ3JvdW5kIGJvcmRlclxyXG4gICAgICB4TWFyZ2luOiAzLFxyXG4gICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDYsIC8vIHJhZGl1cyBvZiB0aGUgcm91bmRlZCBjb3JuZXJzIG9uIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICAgIHJlc2l6ZTogdHJ1ZSwgLy8gZHluYW1pY2FsbHkgcmVzaXplIHdoZW4gY29udGVudCBib3VuZHMgY2hhbmdlXHJcbiAgICAgIGJhY2tncm91bmRQaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJywgLy8ge3N0cmluZ30gaG9yaXpvbnRhbCBvZiBjb250ZW50IGluIHRoZSBwYW5lLCBsZWZ0fGNlbnRlcnxyaWdodFxyXG4gICAgICBtaW5XaWR0aDogMCAvLyBtaW5pbXVtIHdpZHRoIG9mIHRoZSBwYW5lbFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGV4dE5vZGUgPSB0ZXh0Tm9kZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRBbmdsZVRleHQoIHRleHQ6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIHRoaXMudGV4dE5vZGUuc2V0U3RyaW5nKCB0ZXh0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iZW5kaW5nTGlnaHQucmVnaXN0ZXIoICdBbmdsZVRleHRWaWV3JywgQW5nbGVUZXh0VmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBBbmdsZVRleHRWaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQSxTQUFTQSxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsWUFBWSxNQUFNLHVCQUF1Qjs7QUFFaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxhQUFhLFNBQVNGLEtBQUssQ0FBQztFQUd6QkcsV0FBV0EsQ0FBQSxFQUFHO0lBQ25CLE1BQU1DLFFBQVEsR0FBRyxJQUFJTCxJQUFJLENBQUUsRUFBRSxFQUFFO01BQUVNLFFBQVEsRUFBRSxFQUFFO01BQUVDLElBQUksRUFBRTtJQUFRLENBQUUsQ0FBQztJQUVoRSxLQUFLLENBQUVGLFFBQVEsRUFBRTtNQUNmRSxJQUFJLEVBQUUsT0FBTztNQUNiQyxPQUFPLEVBQUUsSUFBSTtNQUNiQyxNQUFNLEVBQUUsSUFBSTtNQUNaQyxTQUFTLEVBQUUsQ0FBQztNQUFFO01BQ2RDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLFlBQVksRUFBRSxDQUFDO01BQUU7TUFDakJDLE1BQU0sRUFBRSxJQUFJO01BQUU7TUFDZEMsa0JBQWtCLEVBQUUsS0FBSztNQUN6QkMsS0FBSyxFQUFFLFFBQVE7TUFBRTtNQUNqQkMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNkLENBQUUsQ0FBQzs7SUFFSCxJQUFJLENBQUNaLFFBQVEsR0FBR0EsUUFBUTtFQUMxQjtFQUVPYSxZQUFZQSxDQUFFQyxJQUFZLEVBQVM7SUFDeEMsSUFBSSxDQUFDZCxRQUFRLENBQUNlLFNBQVMsQ0FBRUQsSUFBSyxDQUFDO0VBQ2pDO0FBQ0Y7QUFFQWpCLFlBQVksQ0FBQ21CLFFBQVEsQ0FBRSxlQUFlLEVBQUVsQixhQUFjLENBQUM7QUFDdkQsZUFBZUEsYUFBYSJ9