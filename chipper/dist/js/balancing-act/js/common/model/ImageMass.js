// Copyright 2013-2021, University of Colorado Boulder

/**
 * This class defines a mass in the model that carries with it an associated image that should be presented in the view.
 * The image can change at times, such as when it is dropped on the balance.
 * <p/>
 * IMPORTANT: All images used by this class are assumed to have their center of mass in the horizontal direction in the
 * center of the image.  In order to make this work for an image, it may be necessary to have some blank transparent
 * space on one side.
 * <p/>
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';
import Mass from './Mass.js';
class ImageMass extends Mass {
  /**
   * @param mass
   * @param image
   * @param height
   * @param initialPosition
   * @param isMystery
   * @param {Object} [options]
   */
  constructor(mass, image, height, initialPosition, isMystery, options) {
    super(mass, initialPosition, isMystery, options);

    // Property that contains the current image.
    this.imageProperty = new Property(image);

    // Property that contains the current height of the corresponding model object.  Only height is used, as opposed to
    // both height and width, because the aspect ratio of the image is expected to be maintained, so the model element's
    // width can be derived from a combination of its height and the aspect ratio of the image that represents it.
    // A property is used because the size may change during animations.
    this.heightProperty = new Property(height);

    // Flag that indicates whether this node should be represented by a reversed version of the current image, must be
    // set prior to image updates.
    this.reverseImage = false;

    // Expected duration of the current animation.
    this.expectedAnimationTime = 0;
  }

  /**
   * @public
   */
  reset() {
    this.heightProperty.reset();
    this.imageProperty.reset();
    super.reset();
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getMiddlePoint() {
    const position = this.positionProperty.get();
    return new Vector2(position.x, position.y + this.heightProperty.get() / 2);
  }

  /**
   * @returns {ImageMass}
   * @public
   * TODO: this seems too tricky, see https://github.com/phetsims/balancing-act/issues/107
   */
  createCopy() {
    // This clever invocation supports the creation of subclassed instances.
    return new this.constructor(this.positionProperty.get().copy(), this.isMystery);
  }
}
balancingAct.register('ImageMass', ImageMass);
export default ImageMass;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJiYWxhbmNpbmdBY3QiLCJNYXNzIiwiSW1hZ2VNYXNzIiwiY29uc3RydWN0b3IiLCJtYXNzIiwiaW1hZ2UiLCJoZWlnaHQiLCJpbml0aWFsUG9zaXRpb24iLCJpc015c3RlcnkiLCJvcHRpb25zIiwiaW1hZ2VQcm9wZXJ0eSIsImhlaWdodFByb3BlcnR5IiwicmV2ZXJzZUltYWdlIiwiZXhwZWN0ZWRBbmltYXRpb25UaW1lIiwicmVzZXQiLCJnZXRNaWRkbGVQb2ludCIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsIngiLCJ5IiwiY3JlYXRlQ29weSIsImNvcHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkltYWdlTWFzcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGRlZmluZXMgYSBtYXNzIGluIHRoZSBtb2RlbCB0aGF0IGNhcnJpZXMgd2l0aCBpdCBhbiBhc3NvY2lhdGVkIGltYWdlIHRoYXQgc2hvdWxkIGJlIHByZXNlbnRlZCBpbiB0aGUgdmlldy5cclxuICogVGhlIGltYWdlIGNhbiBjaGFuZ2UgYXQgdGltZXMsIHN1Y2ggYXMgd2hlbiBpdCBpcyBkcm9wcGVkIG9uIHRoZSBiYWxhbmNlLlxyXG4gKiA8cC8+XHJcbiAqIElNUE9SVEFOVDogQWxsIGltYWdlcyB1c2VkIGJ5IHRoaXMgY2xhc3MgYXJlIGFzc3VtZWQgdG8gaGF2ZSB0aGVpciBjZW50ZXIgb2YgbWFzcyBpbiB0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24gaW4gdGhlXHJcbiAqIGNlbnRlciBvZiB0aGUgaW1hZ2UuICBJbiBvcmRlciB0byBtYWtlIHRoaXMgd29yayBmb3IgYW4gaW1hZ2UsIGl0IG1heSBiZSBuZWNlc3NhcnkgdG8gaGF2ZSBzb21lIGJsYW5rIHRyYW5zcGFyZW50XHJcbiAqIHNwYWNlIG9uIG9uZSBzaWRlLlxyXG4gKiA8cC8+XHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgTWFzcyBmcm9tICcuL01hc3MuanMnO1xyXG5cclxuY2xhc3MgSW1hZ2VNYXNzIGV4dGVuZHMgTWFzcyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtYXNzXHJcbiAgICogQHBhcmFtIGltYWdlXHJcbiAgICogQHBhcmFtIGhlaWdodFxyXG4gICAqIEBwYXJhbSBpbml0aWFsUG9zaXRpb25cclxuICAgKiBAcGFyYW0gaXNNeXN0ZXJ5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtYXNzLCBpbWFnZSwgaGVpZ2h0LCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBtYXNzLCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFByb3BlcnR5IHRoYXQgY29udGFpbnMgdGhlIGN1cnJlbnQgaW1hZ2UuXHJcbiAgICB0aGlzLmltYWdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGltYWdlICk7XHJcblxyXG4gICAgLy8gUHJvcGVydHkgdGhhdCBjb250YWlucyB0aGUgY3VycmVudCBoZWlnaHQgb2YgdGhlIGNvcnJlc3BvbmRpbmcgbW9kZWwgb2JqZWN0LiAgT25seSBoZWlnaHQgaXMgdXNlZCwgYXMgb3Bwb3NlZCB0b1xyXG4gICAgLy8gYm90aCBoZWlnaHQgYW5kIHdpZHRoLCBiZWNhdXNlIHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGlzIGV4cGVjdGVkIHRvIGJlIG1haW50YWluZWQsIHNvIHRoZSBtb2RlbCBlbGVtZW50J3NcclxuICAgIC8vIHdpZHRoIGNhbiBiZSBkZXJpdmVkIGZyb20gYSBjb21iaW5hdGlvbiBvZiBpdHMgaGVpZ2h0IGFuZCB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBpbWFnZSB0aGF0IHJlcHJlc2VudHMgaXQuXHJcbiAgICAvLyBBIHByb3BlcnR5IGlzIHVzZWQgYmVjYXVzZSB0aGUgc2l6ZSBtYXkgY2hhbmdlIGR1cmluZyBhbmltYXRpb25zLlxyXG4gICAgdGhpcy5oZWlnaHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gRmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoaXMgbm9kZSBzaG91bGQgYmUgcmVwcmVzZW50ZWQgYnkgYSByZXZlcnNlZCB2ZXJzaW9uIG9mIHRoZSBjdXJyZW50IGltYWdlLCBtdXN0IGJlXHJcbiAgICAvLyBzZXQgcHJpb3IgdG8gaW1hZ2UgdXBkYXRlcy5cclxuICAgIHRoaXMucmV2ZXJzZUltYWdlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gRXhwZWN0ZWQgZHVyYXRpb24gb2YgdGhlIGN1cnJlbnQgYW5pbWF0aW9uLlxyXG4gICAgdGhpcy5leHBlY3RlZEFuaW1hdGlvblRpbWUgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5oZWlnaHRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pbWFnZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1pZGRsZVBvaW50KCkge1xyXG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyB0aGlzLmhlaWdodFByb3BlcnR5LmdldCgpIC8gMiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0ltYWdlTWFzc31cclxuICAgKiBAcHVibGljXHJcbiAgICogVE9ETzogdGhpcyBzZWVtcyB0b28gdHJpY2t5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGFuY2luZy1hY3QvaXNzdWVzLzEwN1xyXG4gICAqL1xyXG4gIGNyZWF0ZUNvcHkoKSB7XHJcbiAgICAvLyBUaGlzIGNsZXZlciBpbnZvY2F0aW9uIHN1cHBvcnRzIHRoZSBjcmVhdGlvbiBvZiBzdWJjbGFzc2VkIGluc3RhbmNlcy5cclxuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvciggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLmNvcHkoKSwgdGhpcy5pc015c3RlcnkgKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGFuY2luZ0FjdC5yZWdpc3RlciggJ0ltYWdlTWFzcycsIEltYWdlTWFzcyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VNYXNzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFFNUIsTUFBTUMsU0FBUyxTQUFTRCxJQUFJLENBQUM7RUFFM0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0lBQ3RFLEtBQUssQ0FBRUwsSUFBSSxFQUFFRyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsT0FBUSxDQUFDOztJQUVsRDtJQUNBLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUlaLFFBQVEsQ0FBRU8sS0FBTSxDQUFDOztJQUUxQztJQUNBO0lBQ0E7SUFDQTtJQUNBLElBQUksQ0FBQ00sY0FBYyxHQUFHLElBQUliLFFBQVEsQ0FBRVEsTUFBTyxDQUFDOztJQUU1QztJQUNBO0lBQ0EsSUFBSSxDQUFDTSxZQUFZLEdBQUcsS0FBSzs7SUFFekI7SUFDQSxJQUFJLENBQUNDLHFCQUFxQixHQUFHLENBQUM7RUFDaEM7O0VBRUE7QUFDRjtBQUNBO0VBQ0VDLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ0gsY0FBYyxDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUNKLGFBQWEsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7SUFDMUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztFQUNmOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLGNBQWNBLENBQUEsRUFBRztJQUNmLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLGdCQUFnQixDQUFDQyxHQUFHLENBQUMsQ0FBQztJQUM1QyxPQUFPLElBQUluQixPQUFPLENBQUVpQixRQUFRLENBQUNHLENBQUMsRUFBRUgsUUFBUSxDQUFDSSxDQUFDLEdBQUcsSUFBSSxDQUFDVCxjQUFjLENBQUNPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxDQUFDO0VBQzlFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUcsVUFBVUEsQ0FBQSxFQUFHO0lBQ1g7SUFDQSxPQUFPLElBQUksSUFBSSxDQUFDbEIsV0FBVyxDQUFFLElBQUksQ0FBQ2MsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBQyxDQUFDLENBQUNJLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDZCxTQUFVLENBQUM7RUFDbkY7QUFDRjtBQUVBUixZQUFZLENBQUN1QixRQUFRLENBQUUsV0FBVyxFQUFFckIsU0FBVSxDQUFDO0FBRS9DLGVBQWVBLFNBQVMifQ==