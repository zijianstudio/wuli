// Copyright 2018-2023, University of Colorado Boulder

/**
 * Model of the point tool. Knows when it is placed on one of the quadratics.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQQueryParameters from '../GQQueryParameters.js';
import Quadratic from './Quadratic.js';

// which side of the point tool's body the probe is on

export default class PointTool extends PhetioObject {
  /**
   * @param quadraticsProperty - Quadratics that the tool might intersect
   * @param graph
   * @param providedOptions
   */
  constructor(quadraticsProperty, graph, providedOptions) {
    const options = optionize()({
      // SelfOptions
      position: Vector2.ZERO,
      probeSide: 'left',
      dragBounds: Bounds2.EVERYTHING,
      // PhetioObjectOptions
      phetioState: false // this is a PhetioObject only to add phetioDocumentation
    }, providedOptions);
    super(options);
    this.probeSide = options.probeSide;
    this.dragBounds = options.dragBounds;
    this.quadraticsProperty = quadraticsProperty;
    this.positionProperty = new Vector2Property(options.position, {
      tandem: options.tandem.createTandem('positionProperty'),
      phetioDocumentation: 'position of this point tool’s crosshairs'
    });
    this.quadraticProperty = new DerivedProperty([this.positionProperty, quadraticsProperty], (position, quadratics) => {
      if (graph.contains(position)) {
        return this.getQuadraticNear(position, GQQueryParameters.pointToolThreshold, GQQueryParameters.pointToolThreshold);
      } else {
        return null;
      }
    }, {
      valueType: [Quadratic, null],
      tandem: options.tandem.createTandem('quadraticProperty'),
      phetioDocumentation: 'the curve that this point tool is on, null if it is not on a curve',
      phetioValueType: NullableIO(Quadratic.QuadraticIO)
    });
  }

  /**
   * Gets the quadratic that is close to a specified position, within a specified distance.
   * This algorithm prefers to return the quadratic that the point tool is already on.
   * If that quadratic is too far away, then examine all quadratics, in foreground-to-background order.
   * See https://github.com/phetsims/graphing-quadratics/issues/47.
   * @param position - the point tool's position
   * @param offDistance - if <= to this distance, snaps ON to a curve
   * @param onDistance - if > this distance, snaps OFF of a curve
   * @returns null if no quadratic is close enough
   */
  getQuadraticNear(position, offDistance, onDistance) {
    let onQuadratic = this.quadraticProperty && this.quadraticProperty.value;
    const quadratics = this.quadraticsProperty.value;
    if (!onQuadratic || quadratics.includes(onQuadratic) || !onQuadratic.hasSolution(position, offDistance)) {
      onQuadratic = null;
      for (let i = 0; i < quadratics.length && !onQuadratic; i++) {
        const quadratic = quadratics[i];
        if (quadratic.hasSolution(position, onDistance)) {
          onQuadratic = quadratic;
        }
      }
    }
    return onQuadratic;
  }
  reset() {
    this.positionProperty.reset();
  }
}
graphingQuadratics.register('PointTool', PointTool);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIk51bGxhYmxlSU8iLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJHUVF1ZXJ5UGFyYW1ldGVycyIsIlF1YWRyYXRpYyIsIlBvaW50VG9vbCIsImNvbnN0cnVjdG9yIiwicXVhZHJhdGljc1Byb3BlcnR5IiwiZ3JhcGgiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicG9zaXRpb24iLCJaRVJPIiwicHJvYmVTaWRlIiwiZHJhZ0JvdW5kcyIsIkVWRVJZVEhJTkciLCJwaGV0aW9TdGF0ZSIsInBvc2l0aW9uUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicXVhZHJhdGljUHJvcGVydHkiLCJxdWFkcmF0aWNzIiwiY29udGFpbnMiLCJnZXRRdWFkcmF0aWNOZWFyIiwicG9pbnRUb29sVGhyZXNob2xkIiwidmFsdWVUeXBlIiwicGhldGlvVmFsdWVUeXBlIiwiUXVhZHJhdGljSU8iLCJvZmZEaXN0YW5jZSIsIm9uRGlzdGFuY2UiLCJvblF1YWRyYXRpYyIsInZhbHVlIiwiaW5jbHVkZXMiLCJoYXNTb2x1dGlvbiIsImkiLCJsZW5ndGgiLCJxdWFkcmF0aWMiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9pbnRUb29sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIHRoZSBwb2ludCB0b29sLiBLbm93cyB3aGVuIGl0IGlzIHBsYWNlZCBvbiBvbmUgb2YgdGhlIHF1YWRyYXRpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uLy4uLy4uLy4uL2dyYXBoaW5nLWxpbmVzL2pzL2NvbW1vbi9tb2RlbC9HcmFwaC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IEdRUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0dRUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IFF1YWRyYXRpYyBmcm9tICcuL1F1YWRyYXRpYy5qcyc7XHJcblxyXG4vLyB3aGljaCBzaWRlIG9mIHRoZSBwb2ludCB0b29sJ3MgYm9keSB0aGUgcHJvYmUgaXMgb25cclxudHlwZSBQcm9iZVNpZGUgPSAnbGVmdCcgfCAncmlnaHQnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBwb3NpdGlvbj86IFZlY3RvcjI7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICBwcm9iZVNpZGU/OiBQcm9iZVNpZGU7IC8vIHdoaWNoIHNpZGUgdGhlIHByb2JlIGlzIG9uXHJcbiAgZHJhZ0JvdW5kcz86IEJvdW5kczI7IC8vIGRyYWcgYm91bmRzLCBpbiBtb2RlbCBjb29yZGluYXRlIGZyYW1lXHJcbn07XHJcblxyXG50eXBlIFBvaW50VG9vbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja09wdGlvbmFsPFBoZXRpb09iamVjdE9wdGlvbnMsICdwaGV0aW9Eb2N1bWVudGF0aW9uJz4gJlxyXG4gIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludFRvb2wgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvYmVTaWRlOiBQcm9iZVNpZGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRyYWdCb3VuZHM6IEJvdW5kczI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBxdWFkcmF0aWNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFF1YWRyYXRpY1tdPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcG9zaXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHF1YWRyYXRpY1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxRdWFkcmF0aWMgfCBudWxsPjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHF1YWRyYXRpY3NQcm9wZXJ0eSAtIFF1YWRyYXRpY3MgdGhhdCB0aGUgdG9vbCBtaWdodCBpbnRlcnNlY3RcclxuICAgKiBAcGFyYW0gZ3JhcGhcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBxdWFkcmF0aWNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFF1YWRyYXRpY1tdPiwgZ3JhcGg6IEdyYXBoLCBwcm92aWRlZE9wdGlvbnM6IFBvaW50VG9vbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb2ludFRvb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgcG9zaXRpb246IFZlY3RvcjIuWkVSTyxcclxuICAgICAgcHJvYmVTaWRlOiAnbGVmdCcsXHJcbiAgICAgIGRyYWdCb3VuZHM6IEJvdW5kczIuRVZFUllUSElORyxcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlIC8vIHRoaXMgaXMgYSBQaGV0aW9PYmplY3Qgb25seSB0byBhZGQgcGhldGlvRG9jdW1lbnRhdGlvblxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnByb2JlU2lkZSA9IG9wdGlvbnMucHJvYmVTaWRlO1xyXG4gICAgdGhpcy5kcmFnQm91bmRzID0gb3B0aW9ucy5kcmFnQm91bmRzO1xyXG4gICAgdGhpcy5xdWFkcmF0aWNzUHJvcGVydHkgPSBxdWFkcmF0aWNzUHJvcGVydHk7XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggb3B0aW9ucy5wb3NpdGlvbiwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwb3NpdGlvbiBvZiB0aGlzIHBvaW50IHRvb2zigJlzIGNyb3NzaGFpcnMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5xdWFkcmF0aWNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5wb3NpdGlvblByb3BlcnR5LCBxdWFkcmF0aWNzUHJvcGVydHkgXSxcclxuICAgICAgKCBwb3NpdGlvbiwgcXVhZHJhdGljcyApID0+IHtcclxuICAgICAgICBpZiAoIGdyYXBoLmNvbnRhaW5zKCBwb3NpdGlvbiApICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UXVhZHJhdGljTmVhciggcG9zaXRpb24sXHJcbiAgICAgICAgICAgIEdRUXVlcnlQYXJhbWV0ZXJzLnBvaW50VG9vbFRocmVzaG9sZCwgR1FRdWVyeVBhcmFtZXRlcnMucG9pbnRUb29sVGhyZXNob2xkICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdmFsdWVUeXBlOiBbIFF1YWRyYXRpYywgbnVsbCBdLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncXVhZHJhdGljUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBjdXJ2ZSB0aGF0IHRoaXMgcG9pbnQgdG9vbCBpcyBvbiwgbnVsbCBpZiBpdCBpcyBub3Qgb24gYSBjdXJ2ZScsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBRdWFkcmF0aWMuUXVhZHJhdGljSU8gKVxyXG4gICAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBxdWFkcmF0aWMgdGhhdCBpcyBjbG9zZSB0byBhIHNwZWNpZmllZCBwb3NpdGlvbiwgd2l0aGluIGEgc3BlY2lmaWVkIGRpc3RhbmNlLlxyXG4gICAqIFRoaXMgYWxnb3JpdGhtIHByZWZlcnMgdG8gcmV0dXJuIHRoZSBxdWFkcmF0aWMgdGhhdCB0aGUgcG9pbnQgdG9vbCBpcyBhbHJlYWR5IG9uLlxyXG4gICAqIElmIHRoYXQgcXVhZHJhdGljIGlzIHRvbyBmYXIgYXdheSwgdGhlbiBleGFtaW5lIGFsbCBxdWFkcmF0aWNzLCBpbiBmb3JlZ3JvdW5kLXRvLWJhY2tncm91bmQgb3JkZXIuXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmFwaGluZy1xdWFkcmF0aWNzL2lzc3Vlcy80Ny5cclxuICAgKiBAcGFyYW0gcG9zaXRpb24gLSB0aGUgcG9pbnQgdG9vbCdzIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIG9mZkRpc3RhbmNlIC0gaWYgPD0gdG8gdGhpcyBkaXN0YW5jZSwgc25hcHMgT04gdG8gYSBjdXJ2ZVxyXG4gICAqIEBwYXJhbSBvbkRpc3RhbmNlIC0gaWYgPiB0aGlzIGRpc3RhbmNlLCBzbmFwcyBPRkYgb2YgYSBjdXJ2ZVxyXG4gICAqIEByZXR1cm5zIG51bGwgaWYgbm8gcXVhZHJhdGljIGlzIGNsb3NlIGVub3VnaFxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRRdWFkcmF0aWNOZWFyKCBwb3NpdGlvbjogVmVjdG9yMiwgb2ZmRGlzdGFuY2U6IG51bWJlciwgb25EaXN0YW5jZTogbnVtYmVyICk6IFF1YWRyYXRpYyB8IG51bGwge1xyXG4gICAgbGV0IG9uUXVhZHJhdGljID0gdGhpcy5xdWFkcmF0aWNQcm9wZXJ0eSAmJiB0aGlzLnF1YWRyYXRpY1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgcXVhZHJhdGljcyA9IHRoaXMucXVhZHJhdGljc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgaWYgKCAhb25RdWFkcmF0aWMgfHxcclxuICAgICAgICAgcXVhZHJhdGljcy5pbmNsdWRlcyggb25RdWFkcmF0aWMgKSB8fFxyXG4gICAgICAgICAhb25RdWFkcmF0aWMuaGFzU29sdXRpb24oIHBvc2l0aW9uLCBvZmZEaXN0YW5jZSApICkge1xyXG4gICAgICBvblF1YWRyYXRpYyA9IG51bGw7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHF1YWRyYXRpY3MubGVuZ3RoICYmICFvblF1YWRyYXRpYzsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHF1YWRyYXRpYyA9IHF1YWRyYXRpY3NbIGkgXTtcclxuICAgICAgICBpZiAoIHF1YWRyYXRpYy5oYXNTb2x1dGlvbiggcG9zaXRpb24sIG9uRGlzdGFuY2UgKSApIHtcclxuICAgICAgICAgIG9uUXVhZHJhdGljID0gcXVhZHJhdGljO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9uUXVhZHJhdGljO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmFwaGluZ1F1YWRyYXRpY3MucmVnaXN0ZXIoICdQb2ludFRvb2wnLCBQb2ludFRvb2wgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUVuRSxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELE9BQU9DLFlBQVksTUFBK0IsdUNBQXVDO0FBQ3pGLE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FB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