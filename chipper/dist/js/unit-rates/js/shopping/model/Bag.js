// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a bag that contains shopping items.
 * Origin is at the bottom center of the bag.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import URMovable from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';
export default class Bag extends URMovable {
  /**
   * @param {string} name - for internal use
   * @param {HTMLImageElement} image - image used by the view to represent this bag
   * @param {Object} [options]
   */
  constructor(name, image, options) {
    options = merge({
      visible: true,
      // {boolean} is the bag initially visible?

      // {ShoppingItem[]|null} items in the bag, null means the bag does not open when placed on the scale
      items: null,
      // URMovable options
      animationSpeed: 400 // distance/second
    }, options);
    super(options);

    // @public (read-only)
    this.name = name;
    this.image = image;
    this.items = options.items;

    // @public
    this.visibleProperty = new BooleanProperty(options.visible);
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.visibleProperty.reset();
    super.reset();
  }
}
unitRates.register('Bag', Bag);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJtZXJnZSIsIlVSTW92YWJsZSIsInVuaXRSYXRlcyIsIkJhZyIsImNvbnN0cnVjdG9yIiwibmFtZSIsImltYWdlIiwib3B0aW9ucyIsInZpc2libGUiLCJpdGVtcyIsImFuaW1hdGlvblNwZWVkIiwidmlzaWJsZVByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJhZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBvZiBhIGJhZyB0aGF0IGNvbnRhaW5zIHNob3BwaW5nIGl0ZW1zLlxyXG4gKiBPcmlnaW4gaXMgYXQgdGhlIGJvdHRvbSBjZW50ZXIgb2YgdGhlIGJhZy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBVUk1vdmFibGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1VSTW92YWJsZS5qcyc7XHJcbmltcG9ydCB1bml0UmF0ZXMgZnJvbSAnLi4vLi4vdW5pdFJhdGVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhZyBleHRlbmRzIFVSTW92YWJsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gZm9yIGludGVybmFsIHVzZVxyXG4gICAqIEBwYXJhbSB7SFRNTEltYWdlRWxlbWVudH0gaW1hZ2UgLSBpbWFnZSB1c2VkIGJ5IHRoZSB2aWV3IHRvIHJlcHJlc2VudCB0aGlzIGJhZ1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbmFtZSwgaW1hZ2UsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyB7Ym9vbGVhbn0gaXMgdGhlIGJhZyBpbml0aWFsbHkgdmlzaWJsZT9cclxuXHJcbiAgICAgIC8vIHtTaG9wcGluZ0l0ZW1bXXxudWxsfSBpdGVtcyBpbiB0aGUgYmFnLCBudWxsIG1lYW5zIHRoZSBiYWcgZG9lcyBub3Qgb3BlbiB3aGVuIHBsYWNlZCBvbiB0aGUgc2NhbGVcclxuICAgICAgaXRlbXM6IG51bGwsXHJcblxyXG4gICAgICAvLyBVUk1vdmFibGUgb3B0aW9uc1xyXG4gICAgICBhbmltYXRpb25TcGVlZDogNDAwIC8vIGRpc3RhbmNlL3NlY29uZFxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmltYWdlID0gaW1hZ2U7XHJcbiAgICB0aGlzLml0ZW1zID0gb3B0aW9ucy5pdGVtcztcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMudmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdCYWcnLCBCYWcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBRTFDLGVBQWUsTUFBTUMsR0FBRyxTQUFTRixTQUFTLENBQUM7RUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFHO0lBRWxDQSxPQUFPLEdBQUdQLEtBQUssQ0FBRTtNQUVmUSxPQUFPLEVBQUUsSUFBSTtNQUFFOztNQUVmO01BQ0FDLEtBQUssRUFBRSxJQUFJO01BRVg7TUFDQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztJQUV0QixDQUFDLEVBQUVILE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUEsT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ0YsSUFBSSxHQUFHQSxJQUFJO0lBQ2hCLElBQUksQ0FBQ0MsS0FBSyxHQUFHQSxLQUFLO0lBQ2xCLElBQUksQ0FBQ0csS0FBSyxHQUFHRixPQUFPLENBQUNFLEtBQUs7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDRSxlQUFlLEdBQUcsSUFBSVosZUFBZSxDQUFFUSxPQUFPLENBQUNDLE9BQVEsQ0FBQztFQUMvRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFSSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNELGVBQWUsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7SUFDNUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztFQUNmO0FBQ0Y7QUFFQVYsU0FBUyxDQUFDVyxRQUFRLENBQUUsS0FBSyxFQUFFVixHQUFJLENBQUMifQ==