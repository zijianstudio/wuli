// Copyright 2013-2021, University of Colorado Boulder

/**
 * Model for the 8 knots that appear on the rope.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
class Knot extends PhetioObject {
  /**
   * Constructor for the 8 knots that appear along the rope.
   *
   * @param {number} x - the horizontal position (in meters) of the knot
   * // TODO: Fix JSDoc
   * @param {string} type - whether the knot is for red or blue pullers
   * @param ropeStart
   * @param {number} ropeLength - the length of the rope in model coordinates
   * @param {Object} [options]
   */
  constructor(x, type, ropeStart, ropeLength, options) {
    options = merge({
      // {Tandem}
      tandem: Tandem.REQUIRED,
      phetioType: Knot.KnotIO,
      phetioState: false // Because IO Type extends ReferenceIO
    }, options);
    const tandem = options.tandem;
    super(options);
    this.initX = x;
    this.type = type;

    // @public {number} - the 1-D x position of the knot
    this.xProperty = new NumberProperty(x, {
      tandem: tandem.createTandem('xProperty'),
      units: 'm'
    });

    // @public {boolean} - whether or not the know is visible
    this.visibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('visibleProperty')
    });

    // the knot needs a unique ID so that it can be easily found by pullers in the Parallel DOM.
    this.acessibleKnotId = `knot-${type}-${this.initX}`;

    // Constant value for the y position (in screen coordinates)
    this.y = 285;
  }

  /**
   * Reset this knot by resetting its associated model Properties.
   *
   * @public
   */
  reset() {
    this.xProperty.reset();
    this.visibleProperty.reset();
  }

  /**
   * Get the 2-D position of the knot
   *
   * @returns {Vector2}
   */
  get position() {
    return new Vector2(this.xProperty.get(), this.y);
  }
}
forcesAndMotionBasics.register('Knot', Knot);
Knot.KnotIO = new IOType('KnotIO', {
  valueType: Knot,
  supertype: ReferenceIO(IOType.ObjectIO)
});
export default Knot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJtZXJnZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiZm9yY2VzQW5kTW90aW9uQmFzaWNzIiwiS25vdCIsImNvbnN0cnVjdG9yIiwieCIsInR5cGUiLCJyb3BlU3RhcnQiLCJyb3BlTGVuZ3RoIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhldGlvVHlwZSIsIktub3RJTyIsInBoZXRpb1N0YXRlIiwiaW5pdFgiLCJ4UHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJ1bml0cyIsInZpc2libGVQcm9wZXJ0eSIsImFjZXNzaWJsZUtub3RJZCIsInkiLCJyZXNldCIsInBvc2l0aW9uIiwiZ2V0IiwicmVnaXN0ZXIiLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJPYmplY3RJTyJdLCJzb3VyY2VzIjpbIktub3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSA4IGtub3RzIHRoYXQgYXBwZWFyIG9uIHRoZSByb3BlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgZm9yY2VzQW5kTW90aW9uQmFzaWNzIGZyb20gJy4uLy4uL2ZvcmNlc0FuZE1vdGlvbkJhc2ljcy5qcyc7XHJcblxyXG5jbGFzcyBLbm90IGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIHRoZSA4IGtub3RzIHRoYXQgYXBwZWFyIGFsb25nIHRoZSByb3BlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSB0aGUgaG9yaXpvbnRhbCBwb3NpdGlvbiAoaW4gbWV0ZXJzKSBvZiB0aGUga25vdFxyXG4gICAqIC8vIFRPRE86IEZpeCBKU0RvY1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gd2hldGhlciB0aGUga25vdCBpcyBmb3IgcmVkIG9yIGJsdWUgcHVsbGVyc1xyXG4gICAqIEBwYXJhbSByb3BlU3RhcnRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm9wZUxlbmd0aCAtIHRoZSBsZW5ndGggb2YgdGhlIHJvcGUgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHgsIHR5cGUsIHJvcGVTdGFydCwgcm9wZUxlbmd0aCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtUYW5kZW19XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBwaGV0aW9UeXBlOiBLbm90Lktub3RJTyxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlIC8vIEJlY2F1c2UgSU8gVHlwZSBleHRlbmRzIFJlZmVyZW5jZUlPXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBjb25zdCB0YW5kZW0gPSBvcHRpb25zLnRhbmRlbTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuaW5pdFggPSB4O1xyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gdGhlIDEtRCB4IHBvc2l0aW9uIG9mIHRoZSBrbm90XHJcbiAgICB0aGlzLnhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggeCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd4UHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnbSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIHdoZXRoZXIgb3Igbm90IHRoZSBrbm93IGlzIHZpc2libGVcclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIGtub3QgbmVlZHMgYSB1bmlxdWUgSUQgc28gdGhhdCBpdCBjYW4gYmUgZWFzaWx5IGZvdW5kIGJ5IHB1bGxlcnMgaW4gdGhlIFBhcmFsbGVsIERPTS5cclxuICAgIHRoaXMuYWNlc3NpYmxlS25vdElkID0gYGtub3QtJHt0eXBlfS0ke3RoaXMuaW5pdFh9YDtcclxuXHJcbiAgICAvLyBDb25zdGFudCB2YWx1ZSBmb3IgdGhlIHkgcG9zaXRpb24gKGluIHNjcmVlbiBjb29yZGluYXRlcylcclxuICAgIHRoaXMueSA9IDI4NTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGlzIGtub3QgYnkgcmVzZXR0aW5nIGl0cyBhc3NvY2lhdGVkIG1vZGVsIFByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnhQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgMi1EIHBvc2l0aW9uIG9mIHRoZSBrbm90XHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKi9cclxuICBnZXQgcG9zaXRpb24oKSB7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMueFByb3BlcnR5LmdldCgpLCB0aGlzLnkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZvcmNlc0FuZE1vdGlvbkJhc2ljcy5yZWdpc3RlciggJ0tub3QnLCBLbm90ICk7XHJcblxyXG5Lbm90Lktub3RJTyA9IG5ldyBJT1R5cGUoICdLbm90SU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBLbm90LFxyXG4gIHN1cGVydHlwZTogUmVmZXJlbmNlSU8oIElPVHlwZS5PYmplY3RJTyApXHJcbn0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEtub3Q7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxNQUFNLE1BQU0sdUNBQXVDO0FBQzFELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBRWxFLE1BQU1DLElBQUksU0FBU0wsWUFBWSxDQUFDO0VBRTlCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLFdBQVdBLENBQUVDLENBQUMsRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFVBQVUsRUFBRUMsT0FBTyxFQUFHO0lBRXJEQSxPQUFPLEdBQUdaLEtBQUssQ0FBRTtNQUVmO01BQ0FhLE1BQU0sRUFBRVgsTUFBTSxDQUFDWSxRQUFRO01BQ3ZCQyxVQUFVLEVBQUVULElBQUksQ0FBQ1UsTUFBTTtNQUN2QkMsV0FBVyxFQUFFLEtBQUssQ0FBQztJQUNyQixDQUFDLEVBQUVMLE9BQVEsQ0FBQztJQUNaLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFDQyxNQUFNO0lBRTdCLEtBQUssQ0FBRUQsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ00sS0FBSyxHQUFHVixDQUFDO0lBQ2QsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDVSxTQUFTLEdBQUcsSUFBSXJCLGNBQWMsQ0FBRVUsQ0FBQyxFQUFFO01BQ3RDSyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFdBQVksQ0FBQztNQUMxQ0MsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxlQUFlLEdBQUcsSUFBSXpCLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDakRnQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLGlCQUFrQjtJQUNqRCxDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNHLGVBQWUsR0FBSSxRQUFPZCxJQUFLLElBQUcsSUFBSSxDQUFDUyxLQUFNLEVBQUM7O0lBRW5EO0lBQ0EsSUFBSSxDQUFDTSxDQUFDLEdBQUcsR0FBRztFQUNkOztFQUdBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDTixTQUFTLENBQUNNLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQ0gsZUFBZSxDQUFDRyxLQUFLLENBQUMsQ0FBQztFQUM5Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsSUFBSUMsUUFBUUEsQ0FBQSxFQUFHO0lBQ2IsT0FBTyxJQUFJM0IsT0FBTyxDQUFFLElBQUksQ0FBQ29CLFNBQVMsQ0FBQ1EsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNILENBQUUsQ0FBQztFQUNwRDtBQUNGO0FBRUFuQixxQkFBcUIsQ0FBQ3VCLFFBQVEsQ0FBRSxNQUFNLEVBQUV0QixJQUFLLENBQUM7QUFFOUNBLElBQUksQ0FBQ1UsTUFBTSxHQUFHLElBQUliLE1BQU0sQ0FBRSxRQUFRLEVBQUU7RUFDbEMwQixTQUFTLEVBQUV2QixJQUFJO0VBQ2Z3QixTQUFTLEVBQUUxQixXQUFXLENBQUVELE1BQU0sQ0FBQzRCLFFBQVM7QUFDMUMsQ0FBRSxDQUFDO0FBRUgsZUFBZXpCLElBQUkifQ==