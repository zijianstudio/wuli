// Copyright 2017-2023, University of Colorado Boulder

/**
 * Displays the value of some generic Property.
 * Client specifies how the value is converted to a string via options.valueToString.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import unitRates from '../../unitRates.js';
export default class ValueNode extends Text {
  /**
   * @param {Property.<number>} valueProperty
   * @param {Object} [options]
   */
  constructor(valueProperty, options) {
    options = merge({
      font: new PhetFont(20),
      valueToString: value => `${value}`
    }, options);
    super(''); // string will be filled in by valueObserver

    // update value display
    const valueObserver = value => {
      this.string = options.valueToString(value);
    };
    valueProperty.link(valueObserver); // unlink in dispose

    // @private
    this.disposeValueNode = () => {
      valueProperty.unlink(valueObserver);
    };
    this.mutate(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeValueNode();
    super.dispose();
  }
}
unitRates.register('ValueNode', ValueNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsInVuaXRSYXRlcyIsIlZhbHVlTm9kZSIsImNvbnN0cnVjdG9yIiwidmFsdWVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJmb250IiwidmFsdWVUb1N0cmluZyIsInZhbHVlIiwidmFsdWVPYnNlcnZlciIsInN0cmluZyIsImxpbmsiLCJkaXNwb3NlVmFsdWVOb2RlIiwidW5saW5rIiwibXV0YXRlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFsdWVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIHRoZSB2YWx1ZSBvZiBzb21lIGdlbmVyaWMgUHJvcGVydHkuXHJcbiAqIENsaWVudCBzcGVjaWZpZXMgaG93IHRoZSB2YWx1ZSBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgdmlhIG9wdGlvbnMudmFsdWVUb1N0cmluZy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYWx1ZU5vZGUgZXh0ZW5kcyBUZXh0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gdmFsdWVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmFsdWVQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgICB2YWx1ZVRvU3RyaW5nOiB2YWx1ZSA9PiAoIGAke3ZhbHVlfWAgKVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCAnJyApOyAvLyBzdHJpbmcgd2lsbCBiZSBmaWxsZWQgaW4gYnkgdmFsdWVPYnNlcnZlclxyXG5cclxuICAgIC8vIHVwZGF0ZSB2YWx1ZSBkaXNwbGF5XHJcbiAgICBjb25zdCB2YWx1ZU9ic2VydmVyID0gdmFsdWUgPT4ge1xyXG4gICAgICB0aGlzLnN0cmluZyA9IG9wdGlvbnMudmFsdWVUb1N0cmluZyggdmFsdWUgKTtcclxuICAgIH07XHJcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTsgLy8gdW5saW5rIGluIGRpc3Bvc2VcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5kaXNwb3NlVmFsdWVOb2RlID0gKCkgPT4ge1xyXG4gICAgICB2YWx1ZVByb3BlcnR5LnVubGluayggdmFsdWVPYnNlcnZlciApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VWYWx1ZU5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnVuaXRSYXRlcy5yZWdpc3RlciggJ1ZhbHVlTm9kZScsIFZhbHVlTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFFMUMsZUFBZSxNQUFNQyxTQUFTLFNBQVNGLElBQUksQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLE9BQU8sRUFBRztJQUVwQ0EsT0FBTyxHQUFHUCxLQUFLLENBQUU7TUFDZlEsSUFBSSxFQUFFLElBQUlQLFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJRLGFBQWEsRUFBRUMsS0FBSyxJQUFPLEdBQUVBLEtBQU07SUFDckMsQ0FBQyxFQUFFSCxPQUFRLENBQUM7SUFFWixLQUFLLENBQUUsRUFBRyxDQUFDLENBQUMsQ0FBQzs7SUFFYjtJQUNBLE1BQU1JLGFBQWEsR0FBR0QsS0FBSyxJQUFJO01BQzdCLElBQUksQ0FBQ0UsTUFBTSxHQUFHTCxPQUFPLENBQUNFLGFBQWEsQ0FBRUMsS0FBTSxDQUFDO0lBQzlDLENBQUM7SUFDREosYUFBYSxDQUFDTyxJQUFJLENBQUVGLGFBQWMsQ0FBQyxDQUFDLENBQUM7O0lBRXJDO0lBQ0EsSUFBSSxDQUFDRyxnQkFBZ0IsR0FBRyxNQUFNO01BQzVCUixhQUFhLENBQUNTLE1BQU0sQ0FBRUosYUFBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLENBQUNLLE1BQU0sQ0FBRVQsT0FBUSxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VVLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ0gsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUNHLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWQsU0FBUyxDQUFDZSxRQUFRLENBQUUsV0FBVyxFQUFFZCxTQUFVLENBQUMifQ==