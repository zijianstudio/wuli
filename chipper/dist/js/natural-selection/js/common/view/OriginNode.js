// Copyright 2020-2022, University of Colorado Boulder

/**
 * OriginNode is a debugging node used to show an object's origin. Enable via ?showOrigin.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Circle } from '../../../../scenery/js/imports.js';
import naturalSelection from '../../naturalSelection.js';
export default class OriginNode extends Circle {
  constructor(radius = 2) {
    super(radius, {
      fill: 'red'
    });
  }
}
naturalSelection.register('OriginNode', OriginNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaXJjbGUiLCJuYXR1cmFsU2VsZWN0aW9uIiwiT3JpZ2luTm9kZSIsImNvbnN0cnVjdG9yIiwicmFkaXVzIiwiZmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT3JpZ2luTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBPcmlnaW5Ob2RlIGlzIGEgZGVidWdnaW5nIG5vZGUgdXNlZCB0byBzaG93IGFuIG9iamVjdCdzIG9yaWdpbi4gRW5hYmxlIHZpYSA/c2hvd09yaWdpbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgeyBDaXJjbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yaWdpbk5vZGUgZXh0ZW5kcyBDaXJjbGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHJhZGl1cyA9IDIgKSB7XHJcbiAgICBzdXBlciggcmFkaXVzLCB7IGZpbGw6ICdyZWQnIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdPcmlnaW5Ob2RlJywgT3JpZ2luTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxNQUFNLFFBQVEsbUNBQW1DO0FBQzFELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUV4RCxlQUFlLE1BQU1DLFVBQVUsU0FBU0YsTUFBTSxDQUFDO0VBRXRDRyxXQUFXQSxDQUFFQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO0lBQy9CLEtBQUssQ0FBRUEsTUFBTSxFQUFFO01BQUVDLElBQUksRUFBRTtJQUFNLENBQUUsQ0FBQztFQUNsQztBQUNGO0FBRUFKLGdCQUFnQixDQUFDSyxRQUFRLENBQUUsWUFBWSxFQUFFSixVQUFXLENBQUMifQ==