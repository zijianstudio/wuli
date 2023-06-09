// Copyright 2015-2020, University of Colorado Boulder

/**
 * Class the defines the shape, color, polarity, etc. of a transcription factor.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import geneExpressionEssentials from '../../geneExpressionEssentials.js';

/**
 * @param {Shape} shape
 * @param {Vector2} positive
 * @param {Color} baseColor
 * @constructor
 */
function TranscriptionFactorConfig(shape, positive, baseColor) {
  this.shape = shape; // @public
  this.baseColor = baseColor; // @public
  this.isPositive = positive; // @public
}

geneExpressionEssentials.register('TranscriptionFactorConfig', TranscriptionFactorConfig);
export default TranscriptionFactorConfig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnIiwic2hhcGUiLCJwb3NpdGl2ZSIsImJhc2VDb2xvciIsImlzUG9zaXRpdmUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ2xhc3MgdGhlIGRlZmluZXMgdGhlIHNoYXBlLCBjb2xvciwgcG9sYXJpdHksIGV0Yy4gb2YgYSB0cmFuc2NyaXB0aW9uIGZhY3Rvci5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aXZlXHJcbiAqIEBwYXJhbSB7Q29sb3J9IGJhc2VDb2xvclxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbmZ1bmN0aW9uIFRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcoIHNoYXBlLCBwb3NpdGl2ZSwgYmFzZUNvbG9yICkge1xyXG4gIHRoaXMuc2hhcGUgPSBzaGFwZTsgLy8gQHB1YmxpY1xyXG4gIHRoaXMuYmFzZUNvbG9yID0gYmFzZUNvbG9yOyAvLyBAcHVibGljXHJcbiAgdGhpcy5pc1Bvc2l0aXZlID0gcG9zaXRpdmU7IC8vIEBwdWJsaWNcclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnVHJhbnNjcmlwdGlvbkZhY3RvckNvbmZpZycsIFRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYW5zY3JpcHRpb25GYWN0b3JDb25maWc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSx3QkFBd0IsTUFBTSxtQ0FBbUM7O0FBRXhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLHlCQUF5QkEsQ0FBRUMsS0FBSyxFQUFFQyxRQUFRLEVBQUVDLFNBQVMsRUFBRztFQUMvRCxJQUFJLENBQUNGLEtBQUssR0FBR0EsS0FBSyxDQUFDLENBQUM7RUFDcEIsSUFBSSxDQUFDRSxTQUFTLEdBQUdBLFNBQVMsQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQ0MsVUFBVSxHQUFHRixRQUFRLENBQUMsQ0FBQztBQUM5Qjs7QUFFQUgsd0JBQXdCLENBQUNNLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRUwseUJBQTBCLENBQUM7QUFFM0YsZUFBZUEseUJBQXlCIn0=