// Copyright 2013-2023, University of Colorado Boulder

/**
 * Class that defines the shape and common functionality for a 'bucket', which is a container into which some sort of
 * model objects may be placed.  This is a model object in the Model-View-Controller paradigm, and requires a
 * counterpart in the view in order to be presented to the user.
 *
 * In general, this is intended to be a base class, and subclasses should be used to add specific functionality, such as
 * how other model objects are added to and removed from the bucket.
 *
 * One other important note: The position of the bucket in model space is based on the center of the bucket's opening.
 *
 * @author John Blanco
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import phetcommon from '../phetcommon.js';
import optionize from '../../../phet-core/js/optionize.js';
// Proportion of the total height which the ellipse that represents the hole occupies.  It is assumed that the width
// of the hole is the same as the width specified at construction.
const HOLE_ELLIPSE_HEIGHT_PROPORTION = 0.25;
class Bucket extends PhetioObject {
  // The position is defined to be where the center of the hole is.

  // Base color of the bucket.

  // Caption to be shown on the bucket.

  // Color for the caption.

  // The size of the bucket.

  // Create the shape of the bucket's hole.

  // The shape of the front portion of the bucket.

  constructor(providedOptions) {
    const options = optionize()({
      position: Vector2.ZERO,
      size: new Dimension2(200, 50),
      baseColor: '#ff0000',
      captionText: '',
      captionColor: 'white',
      // The following flag controls whether the bucket shape should be essentially upside down.  This allows it to be
      // used in cases where the model uses the inverted-y scheme commonly associated with screen layouts.
      invertY: false
    }, providedOptions);
    super(options);
    this.position = options.position;
    this.baseColor = options.baseColor;
    this.captionText = options.captionText;
    this.captionColor = options.captionColor;
    this.size = options.size;
    const size = this.size;
    const holeRadiusX = size.width / 2;
    const holeRadiusY = size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION / 2;
    this.holeShape = Shape.ellipse(0, 0, holeRadiusX, holeRadiusY, 0);

    // Create the shape of the container.  This code is a bit 'tweaky', meaning that there are a lot of fractional
    // multipliers in here to try to achieve the desired pseudo-3D look.  The intent is that the 'tilt' of the bucket
    // can be changed without needing to rework this code.
    const containerHeight = size.height * (1 - HOLE_ELLIPSE_HEIGHT_PROPORTION / 2);
    const multiplier = options.invertY ? 1 : -1;
    this.containerShape = new Shape().moveTo(-size.width * 0.5, 0).lineTo(-size.width * 0.4, multiplier * containerHeight * 0.8).cubicCurveTo(-size.width * 0.3, multiplier * (containerHeight * 0.8 + size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6), size.width * 0.3, multiplier * (containerHeight * 0.8 + size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6), size.width * 0.4, multiplier * containerHeight * 0.8).lineTo(size.width * 0.5, 0)
    // Does not go to the exact endpoints, so there will be small lines at the endpoints.
    // See https://github.com/phetsims/build-an-atom/issues/173
    .ellipticalArc(0, 0, holeRadiusX, holeRadiusY, 0, -0.01 * Math.PI, -0.99 * Math.PI, !options.invertY).close();
  }
}
phetcommon.register('Bucket', Bucket);
export default Bucket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIlNoYXBlIiwiUGhldGlvT2JqZWN0IiwicGhldGNvbW1vbiIsIm9wdGlvbml6ZSIsIkhPTEVfRUxMSVBTRV9IRUlHSFRfUFJPUE9SVElPTiIsIkJ1Y2tldCIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBvc2l0aW9uIiwiWkVSTyIsInNpemUiLCJiYXNlQ29sb3IiLCJjYXB0aW9uVGV4dCIsImNhcHRpb25Db2xvciIsImludmVydFkiLCJob2xlUmFkaXVzWCIsIndpZHRoIiwiaG9sZVJhZGl1c1kiLCJoZWlnaHQiLCJob2xlU2hhcGUiLCJlbGxpcHNlIiwiY29udGFpbmVySGVpZ2h0IiwibXVsdGlwbGllciIsImNvbnRhaW5lclNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiY3ViaWNDdXJ2ZVRvIiwiZWxsaXB0aWNhbEFyYyIsIk1hdGgiLCJQSSIsImNsb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCdWNrZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2xhc3MgdGhhdCBkZWZpbmVzIHRoZSBzaGFwZSBhbmQgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIGEgJ2J1Y2tldCcsIHdoaWNoIGlzIGEgY29udGFpbmVyIGludG8gd2hpY2ggc29tZSBzb3J0IG9mXHJcbiAqIG1vZGVsIG9iamVjdHMgbWF5IGJlIHBsYWNlZC4gIFRoaXMgaXMgYSBtb2RlbCBvYmplY3QgaW4gdGhlIE1vZGVsLVZpZXctQ29udHJvbGxlciBwYXJhZGlnbSwgYW5kIHJlcXVpcmVzIGFcclxuICogY291bnRlcnBhcnQgaW4gdGhlIHZpZXcgaW4gb3JkZXIgdG8gYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxyXG4gKlxyXG4gKiBJbiBnZW5lcmFsLCB0aGlzIGlzIGludGVuZGVkIHRvIGJlIGEgYmFzZSBjbGFzcywgYW5kIHN1YmNsYXNzZXMgc2hvdWxkIGJlIHVzZWQgdG8gYWRkIHNwZWNpZmljIGZ1bmN0aW9uYWxpdHksIHN1Y2ggYXNcclxuICogaG93IG90aGVyIG1vZGVsIG9iamVjdHMgYXJlIGFkZGVkIHRvIGFuZCByZW1vdmVkIGZyb20gdGhlIGJ1Y2tldC5cclxuICpcclxuICogT25lIG90aGVyIGltcG9ydGFudCBub3RlOiBUaGUgcG9zaXRpb24gb2YgdGhlIGJ1Y2tldCBpbiBtb2RlbCBzcGFjZSBpcyBiYXNlZCBvbiB0aGUgY2VudGVyIG9mIHRoZSBidWNrZXQncyBvcGVuaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IHBoZXRjb21tb24gZnJvbSAnLi4vcGhldGNvbW1vbi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IFRDb2xvciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBQcm9wb3J0aW9uIG9mIHRoZSB0b3RhbCBoZWlnaHQgd2hpY2ggdGhlIGVsbGlwc2UgdGhhdCByZXByZXNlbnRzIHRoZSBob2xlIG9jY3VwaWVzLiAgSXQgaXMgYXNzdW1lZCB0aGF0IHRoZSB3aWR0aFxyXG4vLyBvZiB0aGUgaG9sZSBpcyB0aGUgc2FtZSBhcyB0aGUgd2lkdGggc3BlY2lmaWVkIGF0IGNvbnN0cnVjdGlvbi5cclxuY29uc3QgSE9MRV9FTExJUFNFX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4yNTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcG9zaXRpb24/OiBWZWN0b3IyO1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG4gIGJhc2VDb2xvcj86IFRDb2xvcjtcclxuICBjYXB0aW9uVGV4dD86IHN0cmluZztcclxuICBjYXB0aW9uQ29sb3I/OiBUQ29sb3I7XHJcbiAgaW52ZXJ0WT86IGJvb2xlYW47XHJcbn07XHJcbmV4cG9ydCB0eXBlIEJ1Y2tldE9wdGlvbnMgPSBQaGV0aW9PYmplY3RPcHRpb25zICYgU2VsZk9wdGlvbnM7XHJcblxyXG5jbGFzcyBCdWNrZXQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvLyBUaGUgcG9zaXRpb24gaXMgZGVmaW5lZCB0byBiZSB3aGVyZSB0aGUgY2VudGVyIG9mIHRoZSBob2xlIGlzLlxyXG4gIHB1YmxpYyBwb3NpdGlvbjogVmVjdG9yMjtcclxuXHJcbiAgLy8gQmFzZSBjb2xvciBvZiB0aGUgYnVja2V0LlxyXG4gIHB1YmxpYyByZWFkb25seSBiYXNlQ29sb3I6IFRDb2xvciB8IG51bGw7XHJcblxyXG4gIC8vIENhcHRpb24gdG8gYmUgc2hvd24gb24gdGhlIGJ1Y2tldC5cclxuICBwdWJsaWMgcmVhZG9ubHkgY2FwdGlvblRleHQ6IHN0cmluZztcclxuXHJcbiAgLy8gQ29sb3IgZm9yIHRoZSBjYXB0aW9uLlxyXG4gIHB1YmxpYyByZWFkb25seSBjYXB0aW9uQ29sb3I6IFRDb2xvcjtcclxuXHJcbiAgLy8gVGhlIHNpemUgb2YgdGhlIGJ1Y2tldC5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2l6ZTogRGltZW5zaW9uMjtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBzaGFwZSBvZiB0aGUgYnVja2V0J3MgaG9sZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgaG9sZVNoYXBlOiBTaGFwZTtcclxuXHJcbiAgLy8gVGhlIHNoYXBlIG9mIHRoZSBmcm9udCBwb3J0aW9uIG9mIHRoZSBidWNrZXQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRhaW5lclNoYXBlOiBTaGFwZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBCdWNrZXRPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QnVja2V0T3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgcG9zaXRpb246IFZlY3RvcjIuWkVSTyxcclxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDIwMCwgNTAgKSxcclxuICAgICAgYmFzZUNvbG9yOiAnI2ZmMDAwMCcsXHJcbiAgICAgIGNhcHRpb25UZXh0OiAnJyxcclxuICAgICAgY2FwdGlvbkNvbG9yOiAnd2hpdGUnLFxyXG5cclxuICAgICAgLy8gVGhlIGZvbGxvd2luZyBmbGFnIGNvbnRyb2xzIHdoZXRoZXIgdGhlIGJ1Y2tldCBzaGFwZSBzaG91bGQgYmUgZXNzZW50aWFsbHkgdXBzaWRlIGRvd24uICBUaGlzIGFsbG93cyBpdCB0byBiZVxyXG4gICAgICAvLyB1c2VkIGluIGNhc2VzIHdoZXJlIHRoZSBtb2RlbCB1c2VzIHRoZSBpbnZlcnRlZC15IHNjaGVtZSBjb21tb25seSBhc3NvY2lhdGVkIHdpdGggc2NyZWVuIGxheW91dHMuXHJcbiAgICAgIGludmVydFk6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xyXG4gICAgdGhpcy5iYXNlQ29sb3IgPSBvcHRpb25zLmJhc2VDb2xvcjtcclxuICAgIHRoaXMuY2FwdGlvblRleHQgPSBvcHRpb25zLmNhcHRpb25UZXh0O1xyXG4gICAgdGhpcy5jYXB0aW9uQ29sb3IgPSBvcHRpb25zLmNhcHRpb25Db2xvcjtcclxuICAgIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZTtcclxuICAgIGNvbnN0IHNpemUgPSB0aGlzLnNpemU7XHJcblxyXG4gICAgY29uc3QgaG9sZVJhZGl1c1ggPSBzaXplLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IGhvbGVSYWRpdXNZID0gc2l6ZS5oZWlnaHQgKiBIT0xFX0VMTElQU0VfSEVJR0hUX1BST1BPUlRJT04gLyAyO1xyXG5cclxuICAgIHRoaXMuaG9sZVNoYXBlID0gU2hhcGUuZWxsaXBzZSggMCwgMCwgaG9sZVJhZGl1c1gsIGhvbGVSYWRpdXNZLCAwICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzaGFwZSBvZiB0aGUgY29udGFpbmVyLiAgVGhpcyBjb2RlIGlzIGEgYml0ICd0d2Vha3knLCBtZWFuaW5nIHRoYXQgdGhlcmUgYXJlIGEgbG90IG9mIGZyYWN0aW9uYWxcclxuICAgIC8vIG11bHRpcGxpZXJzIGluIGhlcmUgdG8gdHJ5IHRvIGFjaGlldmUgdGhlIGRlc2lyZWQgcHNldWRvLTNEIGxvb2suICBUaGUgaW50ZW50IGlzIHRoYXQgdGhlICd0aWx0JyBvZiB0aGUgYnVja2V0XHJcbiAgICAvLyBjYW4gYmUgY2hhbmdlZCB3aXRob3V0IG5lZWRpbmcgdG8gcmV3b3JrIHRoaXMgY29kZS5cclxuICAgIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IHNpemUuaGVpZ2h0ICogKCAxIC0gKCBIT0xFX0VMTElQU0VfSEVJR0hUX1BST1BPUlRJT04gLyAyICkgKTtcclxuICAgIGNvbnN0IG11bHRpcGxpZXIgPSBvcHRpb25zLmludmVydFkgPyAxIDogLTE7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXJTaGFwZSA9IG5ldyBTaGFwZSgpLm1vdmVUbyggLXNpemUud2lkdGggKiAwLjUsIDAgKVxyXG4gICAgICAubGluZVRvKCAtc2l6ZS53aWR0aCAqIDAuNCwgbXVsdGlwbGllciAqIGNvbnRhaW5lckhlaWdodCAqIDAuOCApXHJcbiAgICAgIC5jdWJpY0N1cnZlVG8oIC1zaXplLndpZHRoICogMC4zLCBtdWx0aXBsaWVyICogKCBjb250YWluZXJIZWlnaHQgKiAwLjggKyBzaXplLmhlaWdodCAqIEhPTEVfRUxMSVBTRV9IRUlHSFRfUFJPUE9SVElPTiAqIDAuNiApLFxyXG4gICAgICAgIHNpemUud2lkdGggKiAwLjMsIG11bHRpcGxpZXIgKiAoIGNvbnRhaW5lckhlaWdodCAqIDAuOCArIHNpemUuaGVpZ2h0ICogSE9MRV9FTExJUFNFX0hFSUdIVF9QUk9QT1JUSU9OICogMC42ICksXHJcbiAgICAgICAgc2l6ZS53aWR0aCAqIDAuNCwgbXVsdGlwbGllciAqIGNvbnRhaW5lckhlaWdodCAqIDAuOCApXHJcbiAgICAgIC5saW5lVG8oIHNpemUud2lkdGggKiAwLjUsIDAgKVxyXG4gICAgICAvLyBEb2VzIG5vdCBnbyB0byB0aGUgZXhhY3QgZW5kcG9pbnRzLCBzbyB0aGVyZSB3aWxsIGJlIHNtYWxsIGxpbmVzIGF0IHRoZSBlbmRwb2ludHMuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYnVpbGQtYW4tYXRvbS9pc3N1ZXMvMTczXHJcbiAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCAwLCBob2xlUmFkaXVzWCwgaG9sZVJhZGl1c1ksIDAsIC0wLjAxICogTWF0aC5QSSwgLTAuOTkgKiBNYXRoLlBJLCAhb3B0aW9ucy5pbnZlcnRZIClcclxuICAgICAgLmNsb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5waGV0Y29tbW9uLnJlZ2lzdGVyKCAnQnVja2V0JywgQnVja2V0ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJ1Y2tldDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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