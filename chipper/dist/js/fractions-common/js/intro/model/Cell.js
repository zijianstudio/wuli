// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a filled cell (of 1/N, for whatever denominator).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import fractionsCommon from '../../fractionsCommon.js';
import Piece from './Piece.js';
class Cell {
  /**
   * @param {Container} container
   * @param {number} index
   */
  constructor(container, index) {
    assert && assert(typeof index === 'number');

    // @public {Container} - Sometimes this is easier to access when stored on the cell
    this.container = container;

    // @public {number} - Which cell is it? (Can determine rotation/position from this)
    this.index = index;

    // @public {Piece|null>} - The piece that is on its way to us.
    this.targetedPiece = null;

    // @public {Property.<boolean>} - Whether it is "logically" filled. Includes cells that have pieces animation to them.
    this.isFilledProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} - Whether it is "visually" filled. Means isFilled and no piece animating to it.
    this.appearsFilledProperty = new BooleanProperty(false);
  }

  /**
   * Fills a totally empty cell (no piece incoming).
   * @public
   */
  fill() {
    assert && assert(!this.isFilledProperty.value && !this.appearsFilledProperty.value && !this.targetedPiece);
    this.isFilledProperty.value = true;
    this.appearsFilledProperty.value = true;
  }

  /**
   * Empties a totally full cell (no piece incoming).
   * @public
   */
  empty() {
    assert && assert(this.isFilledProperty.value && this.appearsFilledProperty.value && !this.targetedPiece);
    this.isFilledProperty.value = false;
    this.appearsFilledProperty.value = false;
  }

  /**
   * Switches between a fully empty or full cell (with no piece incoming)
   * @public
   *
   * @param {boolean} filled
   */
  setFilled(filled) {
    assert && assert(typeof filled === 'boolean');
    assert && assert(this.isFilledProperty.value === this.appearsFilledProperty.value && !this.targetedPiece);
    this.isFilledProperty.value = filled;
    this.appearsFilledProperty.value = filled;
  }

  /**
   * "Fills" the cell by noting that this piece will now be animating to us.
   * @public
   *
   * @param {Piece} piece
   */
  targetWithPiece(piece) {
    assert && assert(piece instanceof Piece);
    assert && assert(!this.isFilledProperty.value && !this.appearsFilledProperty.value && !this.targetedPiece);
    piece.destinationCell = this;
    this.targetedPiece = piece;
    this.isFilledProperty.value = true;
  }

  /**
   * "Unfills" the cell by noting that this piece will not be animating to us anymore.
   * @public
   *
   * @param {Piece} piece
   */
  untargetFromPiece(piece) {
    assert && assert(piece instanceof Piece);
    assert && assert(this.isFilledProperty.value && !this.appearsFilledProperty.value && this.targetedPiece);
    piece.destinationCell = null;
    this.targetedPiece = null;
    this.isFilledProperty.value = false;
  }

  /**
   * The piece that was animating to us finally "hit" us and filled us visually.
   * @public
   *
   * @param {Piece} piece
   */
  fillWithPiece(piece) {
    assert && assert(piece instanceof Piece);
    assert && assert(this.isFilledProperty.value && !this.appearsFilledProperty.value && this.targetedPiece);
    piece.destinationCell = null;
    this.targetedPiece = null;
    this.appearsFilledProperty.value = true;
  }
}
fractionsCommon.register('Cell', Cell);
export default Cell;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJmcmFjdGlvbnNDb21tb24iLCJQaWVjZSIsIkNlbGwiLCJjb25zdHJ1Y3RvciIsImNvbnRhaW5lciIsImluZGV4IiwiYXNzZXJ0IiwidGFyZ2V0ZWRQaWVjZSIsImlzRmlsbGVkUHJvcGVydHkiLCJhcHBlYXJzRmlsbGVkUHJvcGVydHkiLCJmaWxsIiwidmFsdWUiLCJlbXB0eSIsInNldEZpbGxlZCIsImZpbGxlZCIsInRhcmdldFdpdGhQaWVjZSIsInBpZWNlIiwiZGVzdGluYXRpb25DZWxsIiwidW50YXJnZXRGcm9tUGllY2UiLCJmaWxsV2l0aFBpZWNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDZWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBmaWxsZWQgY2VsbCAob2YgMS9OLCBmb3Igd2hhdGV2ZXIgZGVub21pbmF0b3IpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IFBpZWNlIGZyb20gJy4vUGllY2UuanMnO1xyXG5cclxuY2xhc3MgQ2VsbCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb250YWluZXJ9IGNvbnRhaW5lclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb250YWluZXIsIGluZGV4ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGluZGV4ID09PSAnbnVtYmVyJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0NvbnRhaW5lcn0gLSBTb21ldGltZXMgdGhpcyBpcyBlYXNpZXIgdG8gYWNjZXNzIHdoZW4gc3RvcmVkIG9uIHRoZSBjZWxsXHJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gV2hpY2ggY2VsbCBpcyBpdD8gKENhbiBkZXRlcm1pbmUgcm90YXRpb24vcG9zaXRpb24gZnJvbSB0aGlzKVxyXG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1BpZWNlfG51bGw+fSAtIFRoZSBwaWVjZSB0aGF0IGlzIG9uIGl0cyB3YXkgdG8gdXMuXHJcbiAgICB0aGlzLnRhcmdldGVkUGllY2UgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBXaGV0aGVyIGl0IGlzIFwibG9naWNhbGx5XCIgZmlsbGVkLiBJbmNsdWRlcyBjZWxscyB0aGF0IGhhdmUgcGllY2VzIGFuaW1hdGlvbiB0byB0aGVtLlxyXG4gICAgdGhpcy5pc0ZpbGxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gV2hldGhlciBpdCBpcyBcInZpc3VhbGx5XCIgZmlsbGVkLiBNZWFucyBpc0ZpbGxlZCBhbmQgbm8gcGllY2UgYW5pbWF0aW5nIHRvIGl0LlxyXG4gICAgdGhpcy5hcHBlYXJzRmlsbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlsbHMgYSB0b3RhbGx5IGVtcHR5IGNlbGwgKG5vIHBpZWNlIGluY29taW5nKS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZmlsbCgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmICF0aGlzLnRhcmdldGVkUGllY2UgKTtcclxuXHJcbiAgICB0aGlzLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgdGhpcy5hcHBlYXJzRmlsbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW1wdGllcyBhIHRvdGFsbHkgZnVsbCBjZWxsIChubyBwaWVjZSBpbmNvbWluZykuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGVtcHR5KCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmICF0aGlzLnRhcmdldGVkUGllY2UgKTtcclxuXHJcbiAgICB0aGlzLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTd2l0Y2hlcyBiZXR3ZWVuIGEgZnVsbHkgZW1wdHkgb3IgZnVsbCBjZWxsICh3aXRoIG5vIHBpZWNlIGluY29taW5nKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZmlsbGVkXHJcbiAgICovXHJcbiAgc2V0RmlsbGVkKCBmaWxsZWQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZmlsbGVkID09PSAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNGaWxsZWRQcm9wZXJ0eS52YWx1ZSA9PT0gdGhpcy5hcHBlYXJzRmlsbGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMudGFyZ2V0ZWRQaWVjZSApO1xyXG5cclxuICAgIHRoaXMuaXNGaWxsZWRQcm9wZXJ0eS52YWx1ZSA9IGZpbGxlZDtcclxuICAgIHRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlID0gZmlsbGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogXCJGaWxsc1wiIHRoZSBjZWxsIGJ5IG5vdGluZyB0aGF0IHRoaXMgcGllY2Ugd2lsbCBub3cgYmUgYW5pbWF0aW5nIHRvIHVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGllY2V9IHBpZWNlXHJcbiAgICovXHJcbiAgdGFyZ2V0V2l0aFBpZWNlKCBwaWVjZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBpZWNlIGluc3RhbmNlb2YgUGllY2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmICF0aGlzLnRhcmdldGVkUGllY2UgKTtcclxuXHJcbiAgICBwaWVjZS5kZXN0aW5hdGlvbkNlbGwgPSB0aGlzO1xyXG4gICAgdGhpcy50YXJnZXRlZFBpZWNlID0gcGllY2U7XHJcblxyXG4gICAgdGhpcy5pc0ZpbGxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFwiVW5maWxsc1wiIHRoZSBjZWxsIGJ5IG5vdGluZyB0aGF0IHRoaXMgcGllY2Ugd2lsbCBub3QgYmUgYW5pbWF0aW5nIHRvIHVzIGFueW1vcmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQaWVjZX0gcGllY2VcclxuICAgKi9cclxuICB1bnRhcmdldEZyb21QaWVjZSggcGllY2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaWVjZSBpbnN0YW5jZW9mIFBpZWNlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzRmlsbGVkUHJvcGVydHkudmFsdWUgJiYgIXRoaXMuYXBwZWFyc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMudGFyZ2V0ZWRQaWVjZSApO1xyXG5cclxuICAgIHBpZWNlLmRlc3RpbmF0aW9uQ2VsbCA9IG51bGw7XHJcbiAgICB0aGlzLnRhcmdldGVkUGllY2UgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaXNGaWxsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHBpZWNlIHRoYXQgd2FzIGFuaW1hdGluZyB0byB1cyBmaW5hbGx5IFwiaGl0XCIgdXMgYW5kIGZpbGxlZCB1cyB2aXN1YWxseS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BpZWNlfSBwaWVjZVxyXG4gICAqL1xyXG4gIGZpbGxXaXRoUGllY2UoIHBpZWNlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcGllY2UgaW5zdGFuY2VvZiBQaWVjZSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0ZpbGxlZFByb3BlcnR5LnZhbHVlICYmICF0aGlzLmFwcGVhcnNGaWxsZWRQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLnRhcmdldGVkUGllY2UgKTtcclxuXHJcbiAgICBwaWVjZS5kZXN0aW5hdGlvbkNlbGwgPSBudWxsO1xyXG4gICAgdGhpcy50YXJnZXRlZFBpZWNlID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmFwcGVhcnNGaWxsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdDZWxsJywgQ2VsbCApO1xyXG5leHBvcnQgZGVmYXVsdCBDZWxsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxZQUFZO0FBRTlCLE1BQU1DLElBQUksQ0FB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