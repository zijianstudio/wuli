// Copyright 2014-2020, University of Colorado Boulder

/**
 * A simple, level horizontal surface in a 2D model space.  This is represented by a range of x values and a single y
 * value.  The best way to thing of this is that it is much like a Vector2 in that it represents a small piece of
 * information that is generally immutable and is often wrapped in a Property.
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ModelElement from './ModelElement.js';
class HorizontalSurface {
  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {ModelElement} owner
   * @param {ModelElement} [initialElementOnSurface] - model element that is already on this surface
   */
  constructor(initialPosition, width, owner, initialElementOnSurface) {
    // @public (read-write)
    this.positionProperty = new Vector2Property(initialPosition);

    // @public (read-only) {Property.<ModelElement>|null} - the model element that is currently on the surface of this
    // one, null if nothing there, use the API below to update
    this.elementOnSurfaceProperty = new Property(initialElementOnSurface ? initialElementOnSurface : null, {
      valueType: [ModelElement, null]
    });

    // monitor the element on the surface for legitimate settings
    assert && this.elementOnSurfaceProperty.link((elementOnSurface, previousElementOnSurface) => {
      assert(elementOnSurface === null || elementOnSurface instanceof ModelElement);
      assert(elementOnSurface !== this, 'can\'t sit on top of ourself');
    });

    // @public (read-only) {number}
    this.width = width;

    // @public (read-only) {Range} - the range of space in the horizontal direction occupied by this surface
    this.xRange = new Range(initialPosition.x - this.width / 2, initialPosition.x + this.width / 2);
    this.positionProperty.link(position => {
      this.xRange.setMinMax(position.x - this.width / 2, position.x + this.width / 2);
    });

    // @public (read-only) {ModelElement} - this should be accessed through getter/setter methods
    this.owner = owner;
  }
}
energyFormsAndChanges.register('HorizontalSurface', HorizontalSurface);
export default HorizontalSurface;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMlByb3BlcnR5IiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiTW9kZWxFbGVtZW50IiwiSG9yaXpvbnRhbFN1cmZhY2UiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsIndpZHRoIiwib3duZXIiLCJpbml0aWFsRWxlbWVudE9uU3VyZmFjZSIsInBvc2l0aW9uUHJvcGVydHkiLCJlbGVtZW50T25TdXJmYWNlUHJvcGVydHkiLCJ2YWx1ZVR5cGUiLCJhc3NlcnQiLCJsaW5rIiwiZWxlbWVudE9uU3VyZmFjZSIsInByZXZpb3VzRWxlbWVudE9uU3VyZmFjZSIsInhSYW5nZSIsIngiLCJwb3NpdGlvbiIsInNldE1pbk1heCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSG9yaXpvbnRhbFN1cmZhY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzaW1wbGUsIGxldmVsIGhvcml6b250YWwgc3VyZmFjZSBpbiBhIDJEIG1vZGVsIHNwYWNlLiAgVGhpcyBpcyByZXByZXNlbnRlZCBieSBhIHJhbmdlIG9mIHggdmFsdWVzIGFuZCBhIHNpbmdsZSB5XHJcbiAqIHZhbHVlLiAgVGhlIGJlc3Qgd2F5IHRvIHRoaW5nIG9mIHRoaXMgaXMgdGhhdCBpdCBpcyBtdWNoIGxpa2UgYSBWZWN0b3IyIGluIHRoYXQgaXQgcmVwcmVzZW50cyBhIHNtYWxsIHBpZWNlIG9mXHJcbiAqIGluZm9ybWF0aW9uIHRoYXQgaXMgZ2VuZXJhbGx5IGltbXV0YWJsZSBhbmQgaXMgb2Z0ZW4gd3JhcHBlZCBpbiBhIFByb3BlcnR5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBNb2RlbEVsZW1lbnQgZnJvbSAnLi9Nb2RlbEVsZW1lbnQuanMnO1xyXG5cclxuY2xhc3MgSG9yaXpvbnRhbFN1cmZhY2Uge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEBwYXJhbSB7TW9kZWxFbGVtZW50fSBvd25lclxyXG4gICAqIEBwYXJhbSB7TW9kZWxFbGVtZW50fSBbaW5pdGlhbEVsZW1lbnRPblN1cmZhY2VdIC0gbW9kZWwgZWxlbWVudCB0aGF0IGlzIGFscmVhZHkgb24gdGhpcyBzdXJmYWNlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxQb3NpdGlvbiwgd2lkdGgsIG93bmVyLCBpbml0aWFsRWxlbWVudE9uU3VyZmFjZSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLXdyaXRlKVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbFBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPE1vZGVsRWxlbWVudD58bnVsbH0gLSB0aGUgbW9kZWwgZWxlbWVudCB0aGF0IGlzIGN1cnJlbnRseSBvbiB0aGUgc3VyZmFjZSBvZiB0aGlzXHJcbiAgICAvLyBvbmUsIG51bGwgaWYgbm90aGluZyB0aGVyZSwgdXNlIHRoZSBBUEkgYmVsb3cgdG8gdXBkYXRlXHJcbiAgICB0aGlzLmVsZW1lbnRPblN1cmZhY2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggaW5pdGlhbEVsZW1lbnRPblN1cmZhY2UgPyBpbml0aWFsRWxlbWVudE9uU3VyZmFjZSA6IG51bGwsIHtcclxuICAgICAgdmFsdWVUeXBlOiBbIE1vZGVsRWxlbWVudCwgbnVsbCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbW9uaXRvciB0aGUgZWxlbWVudCBvbiB0aGUgc3VyZmFjZSBmb3IgbGVnaXRpbWF0ZSBzZXR0aW5nc1xyXG4gICAgYXNzZXJ0ICYmIHRoaXMuZWxlbWVudE9uU3VyZmFjZVByb3BlcnR5LmxpbmsoICggZWxlbWVudE9uU3VyZmFjZSwgcHJldmlvdXNFbGVtZW50T25TdXJmYWNlICkgPT4ge1xyXG4gICAgICBhc3NlcnQoIGVsZW1lbnRPblN1cmZhY2UgPT09IG51bGwgfHwgZWxlbWVudE9uU3VyZmFjZSBpbnN0YW5jZW9mIE1vZGVsRWxlbWVudCApO1xyXG4gICAgICBhc3NlcnQoIGVsZW1lbnRPblN1cmZhY2UgIT09IHRoaXMsICdjYW5cXCd0IHNpdCBvbiB0b3Agb2Ygb3Vyc2VsZicgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtudW1iZXJ9XHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UmFuZ2V9IC0gdGhlIHJhbmdlIG9mIHNwYWNlIGluIHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbiBvY2N1cGllZCBieSB0aGlzIHN1cmZhY2VcclxuICAgIHRoaXMueFJhbmdlID0gbmV3IFJhbmdlKCBpbml0aWFsUG9zaXRpb24ueCAtIHRoaXMud2lkdGggLyAyLCBpbml0aWFsUG9zaXRpb24ueCArIHRoaXMud2lkdGggLyAyICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnhSYW5nZS5zZXRNaW5NYXgoIHBvc2l0aW9uLnggLSB0aGlzLndpZHRoIC8gMiwgcG9zaXRpb24ueCArIHRoaXMud2lkdGggLyAyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TW9kZWxFbGVtZW50fSAtIHRoaXMgc2hvdWxkIGJlIGFjY2Vzc2VkIHRocm91Z2ggZ2V0dGVyL3NldHRlciBtZXRob2RzXHJcbiAgICB0aGlzLm93bmVyID0gb3duZXI7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdIb3Jpem9udGFsU3VyZmFjZScsIEhvcml6b250YWxTdXJmYWNlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEhvcml6b250YWxTdXJmYWNlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUU1QyxNQUFNQyxpQkFBaUIsQ0FBQztFQUV0QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsdUJBQXVCLEVBQUc7SUFFcEU7SUFDQSxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlULGVBQWUsQ0FBRUssZUFBZ0IsQ0FBQzs7SUFFOUQ7SUFDQTtJQUNBLElBQUksQ0FBQ0ssd0JBQXdCLEdBQUcsSUFBSVosUUFBUSxDQUFFVSx1QkFBdUIsR0FBR0EsdUJBQXVCLEdBQUcsSUFBSSxFQUFFO01BQ3RHRyxTQUFTLEVBQUUsQ0FBRVQsWUFBWSxFQUFFLElBQUk7SUFDakMsQ0FBRSxDQUFDOztJQUVIO0lBQ0FVLE1BQU0sSUFBSSxJQUFJLENBQUNGLHdCQUF3QixDQUFDRyxJQUFJLENBQUUsQ0FBRUMsZ0JBQWdCLEVBQUVDLHdCQUF3QixLQUFNO01BQzlGSCxNQUFNLENBQUVFLGdCQUFnQixLQUFLLElBQUksSUFBSUEsZ0JBQWdCLFlBQVlaLFlBQWEsQ0FBQztNQUMvRVUsTUFBTSxDQUFFRSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUUsOEJBQStCLENBQUM7SUFDckUsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDUixLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDVSxNQUFNLEdBQUcsSUFBSWpCLEtBQUssQ0FBRU0sZUFBZSxDQUFDWSxDQUFDLEdBQUcsSUFBSSxDQUFDWCxLQUFLLEdBQUcsQ0FBQyxFQUFFRCxlQUFlLENBQUNZLENBQUMsR0FBRyxJQUFJLENBQUNYLEtBQUssR0FBRyxDQUFFLENBQUM7SUFDakcsSUFBSSxDQUFDRyxnQkFBZ0IsQ0FBQ0ksSUFBSSxDQUFFSyxRQUFRLElBQUk7TUFDdEMsSUFBSSxDQUFDRixNQUFNLENBQUNHLFNBQVMsQ0FBRUQsUUFBUSxDQUFDRCxDQUFDLEdBQUcsSUFBSSxDQUFDWCxLQUFLLEdBQUcsQ0FBQyxFQUFFWSxRQUFRLENBQUNELENBQUMsR0FBRyxJQUFJLENBQUNYLEtBQUssR0FBRyxDQUFFLENBQUM7SUFDbkYsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDQyxLQUFLLEdBQUdBLEtBQUs7RUFDcEI7QUFDRjtBQUVBTixxQkFBcUIsQ0FBQ21CLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWpCLGlCQUFrQixDQUFDO0FBQ3hFLGVBQWVBLGlCQUFpQiJ9