// Copyright 2019-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * Base type for Scenes in the diffraction screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import waveInterference from '../../waveInterference.js';
class DiffractionScene {
  constructor(properties) {
    // @protected {Property.<*>[]} - tunable characteristics of this scene
    this.properties = properties;

    // The diffraction pattern is computed as a 2D discrete fourier transform of the aperture pattern, which is
    // represented as a 2d floating point Matrix.  In order to efficiently compute the aperture pattern, we render the
    // shapes to a canvas in the model, then sample points from the canvas using canvas.context.getImageData(), see
    // paintMatrix().  We previously tried other approaches for populating the aperture Matrix (such as using kite
    // Shape.containsPoint), but they were too inefficient to be practical.
    // @private
    this.canvas = document.createElement('canvas');
    this.canvas.width = WaveInterferenceConstants.DIFFRACTION_MATRIX_DIMENSION;
    this.canvas.height = WaveInterferenceConstants.DIFFRACTION_MATRIX_DIMENSION;

    // @private
    this.context = this.canvas.getContext('2d');
    assert && assert(this.renderToContext, 'Subclass must define renderToContext');
  }

  /**
   * Add our pattern to the matrix.
   *
   * @param matrix
   * @param scaleFactor - zoom factor to account for frequency difference
   */
  paintMatrix(matrix, scaleFactor) {
    // clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    const rowDimension = matrix.getRowDimension();
    const columnDimension = matrix.getColumnDimension();
    assert && assert(rowDimension % 2 === 0, 'matrix should be even');
    assert && assert(columnDimension % 2 === 0, 'matrix should be even');
    this.context.fillStyle = 'white';
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.context.scale(scaleFactor, scaleFactor);
    this.context.translate(-this.canvas.width / 2, -this.canvas.height / 2);

    // Each scene paints its aperture pattern to the canvas context.  This has good performance and unifies the code
    // Disable image smoothing for the data to ensure for all platforms compute the same, see https://github.com/phetsims/wave-interference/issues/405
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;
    this.renderToContext(this.context);
    const canvasData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const canvasDataWidth = canvasData.width;
    for (let x = 0; x <= columnDimension; x++) {
      for (let y = 0; y <= rowDimension; y++) {
        const pixelIndex = y * canvasDataWidth + x;
        const arrayIndex = pixelIndex * 4;
        const a = canvasData.data[arrayIndex + 3]; // R=0, G=1, B=2, A=3
        matrix.set(y, x, a / 255);
      }
    }
    this.context.restore();
  }

  /**
   * Render the aperture shape(s) to the canvas context.
   */

  /**
   * Restore the initial values for all Property instances.
   */
  reset() {
    this.properties.forEach(property => property.reset());
  }

  /**
   * Link to each Property instance
   */
  linkToAllProperties(listener) {
    this.properties.forEach(property => property.link(listener));
  }
}
waveInterference.register('DiffractionScene', DiffractionScene);
export default DiffractionScene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwid2F2ZUludGVyZmVyZW5jZSIsIkRpZmZyYWN0aW9uU2NlbmUiLCJjb25zdHJ1Y3RvciIsInByb3BlcnRpZXMiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsIkRJRkZSQUNUSU9OX01BVFJJWF9ESU1FTlNJT04iLCJoZWlnaHQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsImFzc2VydCIsInJlbmRlclRvQ29udGV4dCIsInBhaW50TWF0cml4IiwibWF0cml4Iiwic2NhbGVGYWN0b3IiLCJjbGVhclJlY3QiLCJzYXZlIiwicm93RGltZW5zaW9uIiwiZ2V0Um93RGltZW5zaW9uIiwiY29sdW1uRGltZW5zaW9uIiwiZ2V0Q29sdW1uRGltZW5zaW9uIiwiZmlsbFN0eWxlIiwidHJhbnNsYXRlIiwic2NhbGUiLCJtb3pJbWFnZVNtb290aGluZ0VuYWJsZWQiLCJ3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQiLCJtc0ltYWdlU21vb3RoaW5nRW5hYmxlZCIsImltYWdlU21vb3RoaW5nRW5hYmxlZCIsImNhbnZhc0RhdGEiLCJnZXRJbWFnZURhdGEiLCJjYW52YXNEYXRhV2lkdGgiLCJ4IiwieSIsInBpeGVsSW5kZXgiLCJhcnJheUluZGV4IiwiYSIsImRhdGEiLCJzZXQiLCJyZXN0b3JlIiwicmVzZXQiLCJmb3JFYWNoIiwicHJvcGVydHkiLCJsaW5rVG9BbGxQcm9wZXJ0aWVzIiwibGlzdGVuZXIiLCJsaW5rIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaWZmcmFjdGlvblNjZW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogQmFzZSB0eXBlIGZvciBTY2VuZXMgaW4gdGhlIGRpZmZyYWN0aW9uIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgRGlmZnJhY3Rpb25TY2VuZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydGllcyApIHtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtQcm9wZXJ0eS48Kj5bXX0gLSB0dW5hYmxlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGlzIHNjZW5lXHJcbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xyXG5cclxuICAgIC8vIFRoZSBkaWZmcmFjdGlvbiBwYXR0ZXJuIGlzIGNvbXB1dGVkIGFzIGEgMkQgZGlzY3JldGUgZm91cmllciB0cmFuc2Zvcm0gb2YgdGhlIGFwZXJ0dXJlIHBhdHRlcm4sIHdoaWNoIGlzXHJcbiAgICAvLyByZXByZXNlbnRlZCBhcyBhIDJkIGZsb2F0aW5nIHBvaW50IE1hdHJpeC4gIEluIG9yZGVyIHRvIGVmZmljaWVudGx5IGNvbXB1dGUgdGhlIGFwZXJ0dXJlIHBhdHRlcm4sIHdlIHJlbmRlciB0aGVcclxuICAgIC8vIHNoYXBlcyB0byBhIGNhbnZhcyBpbiB0aGUgbW9kZWwsIHRoZW4gc2FtcGxlIHBvaW50cyBmcm9tIHRoZSBjYW52YXMgdXNpbmcgY2FudmFzLmNvbnRleHQuZ2V0SW1hZ2VEYXRhKCksIHNlZVxyXG4gICAgLy8gcGFpbnRNYXRyaXgoKS4gIFdlIHByZXZpb3VzbHkgdHJpZWQgb3RoZXIgYXBwcm9hY2hlcyBmb3IgcG9wdWxhdGluZyB0aGUgYXBlcnR1cmUgTWF0cml4IChzdWNoIGFzIHVzaW5nIGtpdGVcclxuICAgIC8vIFNoYXBlLmNvbnRhaW5zUG9pbnQpLCBidXQgdGhleSB3ZXJlIHRvbyBpbmVmZmljaWVudCB0byBiZSBwcmFjdGljYWwuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkRJRkZSQUNUSU9OX01BVFJJWF9ESU1FTlNJT047XHJcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLkRJRkZSQUNUSU9OX01BVFJJWF9ESU1FTlNJT047XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnJlbmRlclRvQ29udGV4dCwgJ1N1YmNsYXNzIG11c3QgZGVmaW5lIHJlbmRlclRvQ29udGV4dCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBvdXIgcGF0dGVybiB0byB0aGUgbWF0cml4LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG1hdHJpeFxyXG4gICAqIEBwYXJhbSBzY2FsZUZhY3RvciAtIHpvb20gZmFjdG9yIHRvIGFjY291bnQgZm9yIGZyZXF1ZW5jeSBkaWZmZXJlbmNlXHJcbiAgICovXHJcbiAgcHVibGljIHBhaW50TWF0cml4KCBtYXRyaXgsIHNjYWxlRmFjdG9yICk6IHZvaWQge1xyXG5cclxuICAgIC8vIGNsZWFyIGNhbnZhc1xyXG4gICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCggMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApO1xyXG4gICAgdGhpcy5jb250ZXh0LnNhdmUoKTtcclxuICAgIGNvbnN0IHJvd0RpbWVuc2lvbiA9IG1hdHJpeC5nZXRSb3dEaW1lbnNpb24oKTtcclxuICAgIGNvbnN0IGNvbHVtbkRpbWVuc2lvbiA9IG1hdHJpeC5nZXRDb2x1bW5EaW1lbnNpb24oKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByb3dEaW1lbnNpb24gJSAyID09PSAwLCAnbWF0cml4IHNob3VsZCBiZSBldmVuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sdW1uRGltZW5zaW9uICUgMiA9PT0gMCwgJ21hdHJpeCBzaG91bGQgYmUgZXZlbicgKTtcclxuXHJcbiAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcclxuICAgIHRoaXMuY29udGV4dC50cmFuc2xhdGUoIHRoaXMuY2FudmFzLndpZHRoIC8gMiwgdGhpcy5jYW52YXMuaGVpZ2h0IC8gMiApO1xyXG4gICAgdGhpcy5jb250ZXh0LnNjYWxlKCBzY2FsZUZhY3Rvciwgc2NhbGVGYWN0b3IgKTtcclxuICAgIHRoaXMuY29udGV4dC50cmFuc2xhdGUoIC10aGlzLmNhbnZhcy53aWR0aCAvIDIsIC10aGlzLmNhbnZhcy5oZWlnaHQgLyAyICk7XHJcblxyXG4gICAgLy8gRWFjaCBzY2VuZSBwYWludHMgaXRzIGFwZXJ0dXJlIHBhdHRlcm4gdG8gdGhlIGNhbnZhcyBjb250ZXh0LiAgVGhpcyBoYXMgZ29vZCBwZXJmb3JtYW5jZSBhbmQgdW5pZmllcyB0aGUgY29kZVxyXG4gICAgLy8gRGlzYWJsZSBpbWFnZSBzbW9vdGhpbmcgZm9yIHRoZSBkYXRhIHRvIGVuc3VyZSBmb3IgYWxsIHBsYXRmb3JtcyBjb21wdXRlIHRoZSBzYW1lLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy80MDVcclxuICAgIHRoaXMuY29udGV4dC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY29udGV4dC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY29udGV4dC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5yZW5kZXJUb0NvbnRleHQoIHRoaXMuY29udGV4dCApO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc0RhdGEgPSB0aGlzLmNvbnRleHQuZ2V0SW1hZ2VEYXRhKCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7XHJcbiAgICBjb25zdCBjYW52YXNEYXRhV2lkdGggPSBjYW52YXNEYXRhLndpZHRoO1xyXG5cclxuICAgIGZvciAoIGxldCB4ID0gMDsgeCA8PSBjb2x1bW5EaW1lbnNpb247IHgrKyApIHtcclxuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDw9IHJvd0RpbWVuc2lvbjsgeSsrICkge1xyXG4gICAgICAgIGNvbnN0IHBpeGVsSW5kZXggPSB5ICogY2FudmFzRGF0YVdpZHRoICsgeDtcclxuICAgICAgICBjb25zdCBhcnJheUluZGV4ID0gcGl4ZWxJbmRleCAqIDQ7XHJcbiAgICAgICAgY29uc3QgYSA9IGNhbnZhc0RhdGEuZGF0YVsgYXJyYXlJbmRleCArIDMgXTsgLy8gUj0wLCBHPTEsIEI9MiwgQT0zXHJcbiAgICAgICAgbWF0cml4LnNldCggeSwgeCwgYSAvIDI1NSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvbnRleHQucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVuZGVyIHRoZSBhcGVydHVyZSBzaGFwZShzKSB0byB0aGUgY2FudmFzIGNvbnRleHQuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlbmRlclRvQ29udGV4dCggY29udGV4dCApOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlIHRoZSBpbml0aWFsIHZhbHVlcyBmb3IgYWxsIFByb3BlcnR5IGluc3RhbmNlcy5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnByb3BlcnRpZXMuZm9yRWFjaCggcHJvcGVydHkgPT4gcHJvcGVydHkucmVzZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGluayB0byBlYWNoIFByb3BlcnR5IGluc3RhbmNlXHJcbiAgICovXHJcbiAgcHVibGljIGxpbmtUb0FsbFByb3BlcnRpZXMoIGxpc3RlbmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5wcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHByb3BlcnR5LmxpbmsoIGxpc3RlbmVyICkgKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVJbnRlcmZlcmVuY2UucmVnaXN0ZXIoICdEaWZmcmFjdGlvblNjZW5lJywgRGlmZnJhY3Rpb25TY2VuZSApO1xyXG5leHBvcnQgZGVmYXVsdCBEaWZmcmFjdGlvblNjZW5lOyJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EseUJBQXlCLE1BQU0sMkNBQTJDO0FBQ2pGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUV4RCxNQUFlQyxnQkFBZ0IsQ0FBQztFQUV2QkMsV0FBV0EsQ0FBRUMsVUFBVSxFQUFHO0lBRS9CO0lBQ0EsSUFBSSxDQUFDQSxVQUFVLEdBQUdBLFVBQVU7O0lBRTVCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ0MsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxRQUFTLENBQUM7SUFDaEQsSUFBSSxDQUFDRixNQUFNLENBQUNHLEtBQUssR0FBR1IseUJBQXlCLENBQUNTLDRCQUE0QjtJQUMxRSxJQUFJLENBQUNKLE1BQU0sQ0FBQ0ssTUFBTSxHQUFHVix5QkFBeUIsQ0FBQ1MsNEJBQTRCOztJQUUzRTtJQUNBLElBQUksQ0FBQ0UsT0FBTyxHQUFHLElBQUksQ0FBQ04sTUFBTSxDQUFDTyxVQUFVLENBQUUsSUFBSyxDQUFDO0lBRTdDQyxNQUFNLElBQUlBLE1BQU0s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