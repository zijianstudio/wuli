// Copyright 2019-2023, University of Colorado Boulder

/**
 * A specific place a piece can be "stored" (either a target, a scale, or a source spot near the bottom).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import fractionsCommon from '../../fractionsCommon.js';
class MatchSpot {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      scale: 1,
      isTarget: false,
      isScale: false
    }, options);

    // @public - To be updated by the view when its position changes (usually just initially)
    this.positionProperty = new Vector2Property(Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction'
    });

    // @public {number} - How piece nodes should be scaled when placed in this spot
    this.scale = options.scale;

    // @public {boolean}
    this.isTarget = options.isTarget;
    this.isScale = options.isScale;

    // @public {Property.<MatchingPiece|null>}
    this.pieceProperty = new Property(null);

    // If we move, our piece should move (if we have one)
    this.positionProperty.lazyLink(position => {
      if (this.pieceProperty.value && !options.isScale) {
        this.pieceProperty.value.positionProperty.value = position;
      }
    });
  }

  /**
   * Attaches the given piece to this spot.
   * @public
   *
   * @param {MatchPiece} piece
   */
  attachPiece(piece) {
    this.pieceProperty.value = piece;
    piece.spotProperty.value = this;
  }

  /**
   * Detaches the given piece from this spot.
   * @public
   *
   * @param {MatchPiece} piece
   */
  detachPiece(piece) {
    this.pieceProperty.value = null;
    piece.spotProperty.value = null;
  }
}
fractionsCommon.register('MatchSpot', MatchSpot);
export default MatchSpot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJtZXJnZSIsImZyYWN0aW9uc0NvbW1vbiIsIk1hdGNoU3BvdCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInNjYWxlIiwiaXNUYXJnZXQiLCJpc1NjYWxlIiwicG9zaXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsInBpZWNlUHJvcGVydHkiLCJsYXp5TGluayIsInBvc2l0aW9uIiwidmFsdWUiLCJhdHRhY2hQaWVjZSIsInBpZWNlIiwic3BvdFByb3BlcnR5IiwiZGV0YWNoUGllY2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hdGNoU3BvdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHNwZWNpZmljIHBsYWNlIGEgcGllY2UgY2FuIGJlIFwic3RvcmVkXCIgKGVpdGhlciBhIHRhcmdldCwgYSBzY2FsZSwgb3IgYSBzb3VyY2Ugc3BvdCBuZWFyIHRoZSBib3R0b20pLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcblxyXG5jbGFzcyBNYXRjaFNwb3Qge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgc2NhbGU6IDEsXHJcbiAgICAgIGlzVGFyZ2V0OiBmYWxzZSxcclxuICAgICAgaXNTY2FsZTogZmFsc2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gVG8gYmUgdXBkYXRlZCBieSB0aGUgdmlldyB3aGVuIGl0cyBwb3NpdGlvbiBjaGFuZ2VzICh1c3VhbGx5IGp1c3QgaW5pdGlhbGx5KVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIEhvdyBwaWVjZSBub2RlcyBzaG91bGQgYmUgc2NhbGVkIHdoZW4gcGxhY2VkIGluIHRoaXMgc3BvdFxyXG4gICAgdGhpcy5zY2FsZSA9IG9wdGlvbnMuc2NhbGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cclxuICAgIHRoaXMuaXNUYXJnZXQgPSBvcHRpb25zLmlzVGFyZ2V0O1xyXG4gICAgdGhpcy5pc1NjYWxlID0gb3B0aW9ucy5pc1NjYWxlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxNYXRjaGluZ1BpZWNlfG51bGw+fVxyXG4gICAgdGhpcy5waWVjZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gSWYgd2UgbW92ZSwgb3VyIHBpZWNlIHNob3VsZCBtb3ZlIChpZiB3ZSBoYXZlIG9uZSlcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5sYXp5TGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICBpZiAoIHRoaXMucGllY2VQcm9wZXJ0eS52YWx1ZSAmJiAhb3B0aW9ucy5pc1NjYWxlICkge1xyXG4gICAgICAgIHRoaXMucGllY2VQcm9wZXJ0eS52YWx1ZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGFjaGVzIHRoZSBnaXZlbiBwaWVjZSB0byB0aGlzIHNwb3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRjaFBpZWNlfSBwaWVjZVxyXG4gICAqL1xyXG4gIGF0dGFjaFBpZWNlKCBwaWVjZSApIHtcclxuICAgIHRoaXMucGllY2VQcm9wZXJ0eS52YWx1ZSA9IHBpZWNlO1xyXG4gICAgcGllY2Uuc3BvdFByb3BlcnR5LnZhbHVlID0gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGFjaGVzIHRoZSBnaXZlbiBwaWVjZSBmcm9tIHRoaXMgc3BvdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01hdGNoUGllY2V9IHBpZWNlXHJcbiAgICovXHJcbiAgZGV0YWNoUGllY2UoIHBpZWNlICkge1xyXG4gICAgdGhpcy5waWVjZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIHBpZWNlLnNwb3RQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdNYXRjaFNwb3QnLCBNYXRjaFNwb3QgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWF0Y2hTcG90O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLFNBQVMsQ0FBQztFQUNkO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR0osS0FBSyxDQUFFO01BQ2ZLLEtBQUssRUFBRSxDQUFDO01BQ1JDLFFBQVEsRUFBRSxLQUFLO01BQ2ZDLE9BQU8sRUFBRTtJQUNYLENBQUMsRUFBRUgsT0FBUSxDQUFDOztJQUVaO0lBQ0EsSUFBSSxDQUFDSSxnQkFBZ0IsR0FBRyxJQUFJVCxlQUFlLENBQUVELE9BQU8sQ0FBQ1csSUFBSSxFQUFFO01BQ3pEQyx1QkFBdUIsRUFBRTtJQUMzQixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNMLEtBQUssR0FBR0QsT0FBTyxDQUFDQyxLQUFLOztJQUUxQjtJQUNBLElBQUksQ0FBQ0MsUUFBUSxHQUFHRixPQUFPLENBQUNFLFFBQVE7SUFDaEMsSUFBSSxDQUFDQyxPQUFPLEdBQUdILE9BQU8sQ0FBQ0csT0FBTzs7SUFFOUI7SUFDQSxJQUFJLENBQUNJLGFBQWEsR0FBRyxJQUFJZCxRQUFRLENBQUUsSUFBSyxDQUFDOztJQUV6QztJQUNBLElBQUksQ0FBQ1csZ0JBQWdCLENBQUNJLFFBQVEsQ0FBRUMsUUFBUSxJQUFJO01BQzFDLElBQUssSUFBSSxDQUFDRixhQUFhLENBQUNHLEtBQUssSUFBSSxDQUFDVixPQUFPLENBQUNHLE9BQU8sRUFBRztRQUNsRCxJQUFJLENBQUNJLGFBQWEsQ0FBQ0csS0FBSyxDQUFDTixnQkFBZ0IsQ0FBQ00sS0FBSyxHQUFHRCxRQUFRO01BQzVEO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLEtBQUssRUFBRztJQUNuQixJQUFJLENBQUNMLGFBQWEsQ0FBQ0csS0FBSyxHQUFHRSxLQUFLO0lBQ2hDQSxLQUFLLENBQUNDLFlBQVksQ0FBQ0gsS0FBSyxHQUFHLElBQUk7RUFDakM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVGLEtBQUssRUFBRztJQUNuQixJQUFJLENBQUNMLGFBQWEsQ0FBQ0csS0FBSyxHQUFHLElBQUk7SUFDL0JFLEtBQUssQ0FBQ0MsWUFBWSxDQUFDSCxLQUFLLEdBQUcsSUFBSTtFQUNqQztBQUNGO0FBRUFiLGVBQWUsQ0FBQ2tCLFFBQVEsQ0FBRSxXQUFXLEVBQUVqQixTQUFVLENBQUM7QUFDbEQsZUFBZUEsU0FBUyJ9