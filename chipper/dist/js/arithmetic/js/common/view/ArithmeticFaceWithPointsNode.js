// Copyright 2014-2021, University of Colorado Boulder

/**
 * Node that represents a smiling or frowning face with the additional points gained for getting the answer correct
 * shown immediately below it.  When shown, this node appears at full opacity for a while, then fades out.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import FaceWithPointsNode from '../../../../scenery-phet/js/FaceWithPointsNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import arithmetic from '../../arithmetic.js';

// constants
const UPDATE_PERIOD = 1 / 60 * 1000; // milliseconds, intended to match the expected frame rate
const OPAQUE_TIME = 1000; // milliseconds
const FADE_TIME = 1000; // milliseconds

class ArithmeticFaceWithPointsNode extends FaceWithPointsNode {
  /**
   * @param {Object} faceModel model for smile face.
   * @param {Object} [options] for face node.
   */
  constructor(faceModel, options) {
    options = merge({
      pointsFont: new PhetFont({
        size: 26,
        weight: 'bold'
      }),
      visible: false // Initially invisible, must receive a showFace event to become visible.
    }, options);
    super(options);

    // set score of smile face
    faceModel.pointsToDisplayProperty.link(points => this.setPoints(points));

    // set the facial expression
    faceModel.isSmileProperty.link(isFaceSmile => {
      if (isFaceSmile) {
        this.smile();
      } else {
        this.frown();
      }
    });

    // Timer for fading the face.
    let timerID = null;

    // Handle the event that indicates that the face should be shown.
    faceModel.showFaceEmitter.addListener(() => {
      // make face fully visible
      this.visible = true;
      this.opacity = 1;

      // Set the countdown to the total for the opaque time and the fade time.
      let countdown = OPAQUE_TIME + FADE_TIME;

      // cancel previous timer if it exists
      if (timerID !== null) {
        stepTimer.clearInterval(timerID);
      }

      // start up the new timer
      timerID = stepTimer.setInterval(() => {
        countdown -= UPDATE_PERIOD;
        this.opacity = Utils.clamp(countdown / FADE_TIME, 0, 1);
        if (this.opacity === 0) {
          stepTimer.clearInterval(timerID);
          timerID = null;
          this.visible = false;
        }
      }, UPDATE_PERIOD);
    });

    // Handle the event that indicates that the face should be hidden.
    faceModel.hideFaceEmitter.addListener(() => {
      // Cancel the timer (if running)
      if (timerID !== null) {
        stepTimer.clearTimeout(timerID);
        timerID = null;
      }

      // Go completely invisible.
      this.visible = false;
    });
  }
}
arithmetic.register('ArithmeticFaceWithPointsNode', ArithmeticFaceWithPointsNode);
export default ArithmeticFaceWithPointsNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJVdGlscyIsIm1lcmdlIiwiRmFjZVdpdGhQb2ludHNOb2RlIiwiUGhldEZvbnQiLCJhcml0aG1ldGljIiwiVVBEQVRFX1BFUklPRCIsIk9QQVFVRV9USU1FIiwiRkFERV9USU1FIiwiQXJpdGhtZXRpY0ZhY2VXaXRoUG9pbnRzTm9kZSIsImNvbnN0cnVjdG9yIiwiZmFjZU1vZGVsIiwib3B0aW9ucyIsInBvaW50c0ZvbnQiLCJzaXplIiwid2VpZ2h0IiwidmlzaWJsZSIsInBvaW50c1RvRGlzcGxheVByb3BlcnR5IiwibGluayIsInBvaW50cyIsInNldFBvaW50cyIsImlzU21pbGVQcm9wZXJ0eSIsImlzRmFjZVNtaWxlIiwic21pbGUiLCJmcm93biIsInRpbWVySUQiLCJzaG93RmFjZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIm9wYWNpdHkiLCJjb3VudGRvd24iLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGFtcCIsImhpZGVGYWNlRW1pdHRlciIsImNsZWFyVGltZW91dCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQXJpdGhtZXRpY0ZhY2VXaXRoUG9pbnRzTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQgcmVwcmVzZW50cyBhIHNtaWxpbmcgb3IgZnJvd25pbmcgZmFjZSB3aXRoIHRoZSBhZGRpdGlvbmFsIHBvaW50cyBnYWluZWQgZm9yIGdldHRpbmcgdGhlIGFuc3dlciBjb3JyZWN0XHJcbiAqIHNob3duIGltbWVkaWF0ZWx5IGJlbG93IGl0LiAgV2hlbiBzaG93biwgdGhpcyBub2RlIGFwcGVhcnMgYXQgZnVsbCBvcGFjaXR5IGZvciBhIHdoaWxlLCB0aGVuIGZhZGVzIG91dC5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEZhY2VXaXRoUG9pbnRzTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZVdpdGhQb2ludHNOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBhcml0aG1ldGljIGZyb20gJy4uLy4uL2FyaXRobWV0aWMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFVQREFURV9QRVJJT0QgPSAxIC8gNjAgKiAxMDAwOyAvLyBtaWxsaXNlY29uZHMsIGludGVuZGVkIHRvIG1hdGNoIHRoZSBleHBlY3RlZCBmcmFtZSByYXRlXHJcbmNvbnN0IE9QQVFVRV9USU1FID0gMTAwMDsgLy8gbWlsbGlzZWNvbmRzXHJcbmNvbnN0IEZBREVfVElNRSA9IDEwMDA7IC8vIG1pbGxpc2Vjb25kc1xyXG5cclxuY2xhc3MgQXJpdGhtZXRpY0ZhY2VXaXRoUG9pbnRzTm9kZSBleHRlbmRzIEZhY2VXaXRoUG9pbnRzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmYWNlTW9kZWwgbW9kZWwgZm9yIHNtaWxlIGZhY2UuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBmb3IgZmFjZSBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBmYWNlTW9kZWwsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHBvaW50c0ZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZSAvLyBJbml0aWFsbHkgaW52aXNpYmxlLCBtdXN0IHJlY2VpdmUgYSBzaG93RmFjZSBldmVudCB0byBiZWNvbWUgdmlzaWJsZS5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHNldCBzY29yZSBvZiBzbWlsZSBmYWNlXHJcbiAgICBmYWNlTW9kZWwucG9pbnRzVG9EaXNwbGF5UHJvcGVydHkubGluayggcG9pbnRzID0+IHRoaXMuc2V0UG9pbnRzKCBwb2ludHMgKSApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgZmFjaWFsIGV4cHJlc3Npb25cclxuICAgIGZhY2VNb2RlbC5pc1NtaWxlUHJvcGVydHkubGluayggaXNGYWNlU21pbGUgPT4ge1xyXG4gICAgICBpZiAoIGlzRmFjZVNtaWxlICkge1xyXG4gICAgICAgIHRoaXMuc21pbGUoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmZyb3duKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaW1lciBmb3IgZmFkaW5nIHRoZSBmYWNlLlxyXG4gICAgbGV0IHRpbWVySUQgPSBudWxsO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgZXZlbnQgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgZmFjZSBzaG91bGQgYmUgc2hvd24uXHJcbiAgICBmYWNlTW9kZWwuc2hvd0ZhY2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBtYWtlIGZhY2UgZnVsbHkgdmlzaWJsZVxyXG4gICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLm9wYWNpdHkgPSAxO1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBjb3VudGRvd24gdG8gdGhlIHRvdGFsIGZvciB0aGUgb3BhcXVlIHRpbWUgYW5kIHRoZSBmYWRlIHRpbWUuXHJcbiAgICAgIGxldCBjb3VudGRvd24gPSBPUEFRVUVfVElNRSArIEZBREVfVElNRTtcclxuXHJcbiAgICAgIC8vIGNhbmNlbCBwcmV2aW91cyB0aW1lciBpZiBpdCBleGlzdHNcclxuICAgICAgaWYgKCB0aW1lcklEICE9PSBudWxsICkge1xyXG4gICAgICAgIHN0ZXBUaW1lci5jbGVhckludGVydmFsKCB0aW1lcklEICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHN0YXJ0IHVwIHRoZSBuZXcgdGltZXJcclxuICAgICAgdGltZXJJRCA9IHN0ZXBUaW1lci5zZXRJbnRlcnZhbCggKCkgPT4ge1xyXG4gICAgICAgIGNvdW50ZG93biAtPSBVUERBVEVfUEVSSU9EO1xyXG4gICAgICAgIHRoaXMub3BhY2l0eSA9IFV0aWxzLmNsYW1wKCBjb3VudGRvd24gLyBGQURFX1RJTUUsIDAsIDEgKTtcclxuICAgICAgICBpZiAoIHRoaXMub3BhY2l0eSA9PT0gMCApIHtcclxuICAgICAgICAgIHN0ZXBUaW1lci5jbGVhckludGVydmFsKCB0aW1lcklEICk7XHJcbiAgICAgICAgICB0aW1lcklEID0gbnVsbDtcclxuICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgVVBEQVRFX1BFUklPRCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgZXZlbnQgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgZmFjZSBzaG91bGQgYmUgaGlkZGVuLlxyXG4gICAgZmFjZU1vZGVsLmhpZGVGYWNlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG5cclxuICAgICAgLy8gQ2FuY2VsIHRoZSB0aW1lciAoaWYgcnVubmluZylcclxuICAgICAgaWYgKCB0aW1lcklEICE9PSBudWxsICkge1xyXG4gICAgICAgIHN0ZXBUaW1lci5jbGVhclRpbWVvdXQoIHRpbWVySUQgKTtcclxuICAgICAgICB0aW1lcklEID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR28gY29tcGxldGVseSBpbnZpc2libGUuXHJcbiAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuYXJpdGhtZXRpYy5yZWdpc3RlciggJ0FyaXRobWV0aWNGYWNlV2l0aFBvaW50c05vZGUnLCBBcml0aG1ldGljRmFjZVdpdGhQb2ludHNOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFyaXRobWV0aWNGYWNlV2l0aFBvaW50c05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxrQkFBa0IsTUFBTSxtREFBbUQ7QUFDbEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxVQUFVLE1BQU0scUJBQXFCOztBQUU1QztBQUNBLE1BQU1DLGFBQWEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3JDLE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRXhCLE1BQU1DLDRCQUE0QixTQUFTTixrQkFBa0IsQ0FBQztFQUU1RDtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRztJQUVoQ0EsT0FBTyxHQUFHVixLQUFLLENBQUU7TUFDZlcsVUFBVSxFQUFFLElBQUlULFFBQVEsQ0FBRTtRQUFFVSxJQUFJLEVBQUUsRUFBRTtRQUFFQyxNQUFNLEVBQUU7TUFBTyxDQUFFLENBQUM7TUFDeERDLE9BQU8sRUFBRSxLQUFLLENBQUM7SUFDakIsQ0FBQyxFQUFFSixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQUQsU0FBUyxDQUFDTSx1QkFBdUIsQ0FBQ0MsSUFBSSxDQUFFQyxNQUFNLElBQUksSUFBSSxDQUFDQyxTQUFTLENBQUVELE1BQU8sQ0FBRSxDQUFDOztJQUU1RTtJQUNBUixTQUFTLENBQUNVLGVBQWUsQ0FBQ0gsSUFBSSxDQUFFSSxXQUFXLElBQUk7TUFDN0MsSUFBS0EsV0FBVyxFQUFHO1FBQ2pCLElBQUksQ0FBQ0MsS0FBSyxDQUFDLENBQUM7TUFDZCxDQUFDLE1BQ0k7UUFDSCxJQUFJLENBQUNDLEtBQUssQ0FBQyxDQUFDO01BQ2Q7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJQyxPQUFPLEdBQUcsSUFBSTs7SUFFbEI7SUFDQWQsU0FBUyxDQUFDZSxlQUFlLENBQUNDLFdBQVcsQ0FBRSxNQUFNO01BRTNDO01BQ0EsSUFBSSxDQUFDWCxPQUFPLEdBQUcsSUFBSTtNQUNuQixJQUFJLENBQUNZLE9BQU8sR0FBRyxDQUFDOztNQUVoQjtNQUNBLElBQUlDLFNBQVMsR0FBR3RCLFdBQVcsR0FBR0MsU0FBUzs7TUFFdkM7TUFDQSxJQUFLaUIsT0FBTyxLQUFLLElBQUksRUFBRztRQUN0QnpCLFNBQVMsQ0FBQzhCLGFBQWEsQ0FBRUwsT0FBUSxDQUFDO01BQ3BDOztNQUVBO01BQ0FBLE9BQU8sR0FBR3pCLFNBQVMsQ0FBQytCLFdBQVcsQ0FBRSxNQUFNO1FBQ3JDRixTQUFTLElBQUl2QixhQUFhO1FBQzFCLElBQUksQ0FBQ3NCLE9BQU8sR0FBRzNCLEtBQUssQ0FBQytCLEtBQUssQ0FBRUgsU0FBUyxHQUFHckIsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7UUFDekQsSUFBSyxJQUFJLENBQUNvQixPQUFPLEtBQUssQ0FBQyxFQUFHO1VBQ3hCNUIsU0FBUyxDQUFDOEIsYUFBYSxDQUFFTCxPQUFRLENBQUM7VUFDbENBLE9BQU8sR0FBRyxJQUFJO1VBQ2QsSUFBSSxDQUFDVCxPQUFPLEdBQUcsS0FBSztRQUN0QjtNQUNGLENBQUMsRUFBRVYsYUFBYyxDQUFDO0lBQ3BCLENBQUUsQ0FBQzs7SUFFSDtJQUNBSyxTQUFTLENBQUNzQixlQUFlLENBQUNOLFdBQVcsQ0FBRSxNQUFNO01BRTNDO01BQ0EsSUFBS0YsT0FBTyxLQUFLLElBQUksRUFBRztRQUN0QnpCLFNBQVMsQ0FBQ2tDLFlBQVksQ0FBRVQsT0FBUSxDQUFDO1FBQ2pDQSxPQUFPLEdBQUcsSUFBSTtNQUNoQjs7TUFFQTtNQUNBLElBQUksQ0FBQ1QsT0FBTyxHQUFHLEtBQUs7SUFDdEIsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBWCxVQUFVLENBQUM4QixRQUFRLENBQUUsOEJBQThCLEVBQUUxQiw0QkFBNkIsQ0FBQztBQUNuRixlQUFlQSw0QkFBNEIifQ==