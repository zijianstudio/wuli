// Copyright 2016-2023, University of Colorado Boulder

/**
 * Plus function.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../../phet-core/js/merge.js';
import functionBuilder from '../../../functionBuilder.js';
import FBSymbols from '../../FBSymbols.js';
import MathFunction from './MathFunction.js';
export default class Plus extends MathFunction {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      fill: 'rgb( 246, 203, 144 )',
      pickerColor: 'rgb( 227, 114, 42 )'
    }, options);
    super(FBSymbols.PLUS, (input, operand) => input.plus(operand), options);
  }
}
functionBuilder.register('Plus', Plus);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImZ1bmN0aW9uQnVpbGRlciIsIkZCU3ltYm9scyIsIk1hdGhGdW5jdGlvbiIsIlBsdXMiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJmaWxsIiwicGlja2VyQ29sb3IiLCJQTFVTIiwiaW5wdXQiLCJvcGVyYW5kIiwicGx1cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGx1cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQbHVzIGZ1bmN0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBGQlN5bWJvbHMgZnJvbSAnLi4vLi4vRkJTeW1ib2xzLmpzJztcclxuaW1wb3J0IE1hdGhGdW5jdGlvbiBmcm9tICcuL01hdGhGdW5jdGlvbi5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbHVzIGV4dGVuZHMgTWF0aEZ1bmN0aW9uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiAncmdiKCAyNDYsIDIwMywgMTQ0ICknLFxyXG4gICAgICBwaWNrZXJDb2xvcjogJ3JnYiggMjI3LCAxMTQsIDQyICknXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIEZCU3ltYm9scy5QTFVTLFxyXG4gICAgICAoIGlucHV0LCBvcGVyYW5kICkgPT4gaW5wdXQucGx1cyggb3BlcmFuZCApLFxyXG4gICAgICBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdQbHVzJywgUGx1cyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLGVBQWUsTUFBTUMsSUFBSSxTQUFTRCxZQUFZLENBQUM7RUFFN0M7QUFDRjtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUVyQkEsT0FBTyxHQUFHTixLQUFLLENBQUU7TUFDZk8sSUFBSSxFQUFFLHNCQUFzQjtNQUM1QkMsV0FBVyxFQUFFO0lBQ2YsQ0FBQyxFQUFFRixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVKLFNBQVMsQ0FBQ08sSUFBSSxFQUNuQixDQUFFQyxLQUFLLEVBQUVDLE9BQU8sS0FBTUQsS0FBSyxDQUFDRSxJQUFJLENBQUVELE9BQVEsQ0FBQyxFQUMzQ0wsT0FBUSxDQUFDO0VBQ2I7QUFDRjtBQUVBTCxlQUFlLENBQUNZLFFBQVEsQ0FBRSxNQUFNLEVBQUVULElBQUssQ0FBQyJ9