// Copyright 2013-2022, University of Colorado Boulder

/**
 * Object for actual element properties (symbol, radius, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Element from './Element.js';
import nitroglycerin from './nitroglycerin.js';
let idCounter = 1;
export default class Atom {
  // These are field of Element, unpacked here for convenience. See Element for documentation of these fields.

  // IDs for uniqueness and fast lookups

  constructor(element) {
    this.element = element;

    // Unpack Element, for convenience.
    this.symbol = element.symbol;
    this.covalentRadius = element.covalentRadius;
    this.covalentDiameter = element.covalentRadius * 2;
    this.electronegativity = element.electronegativity;
    this.atomicWeight = element.atomicWeight;
    this.color = element.color;
    this.reference = (idCounter++).toString(16);
    this.id = `${this.symbol}_${this.reference}`;
  }
  static createAtomFromSymbol(symbol) {
    return new Atom(Element.getElementBySymbol(symbol));
  }
  hasSameElement(atom) {
    return this.element.isSameElement(atom.element);
  }
  isHydrogen() {
    return this.element.isHydrogen();
  }
  isCarbon() {
    return this.element.isCarbon();
  }
  isOxygen() {
    return this.element.isOxygen();
  }
  toString() {
    return this.symbol;
  }
}
nitroglycerin.register('Atom', Atom);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbGVtZW50Iiwibml0cm9nbHljZXJpbiIsImlkQ291bnRlciIsIkF0b20iLCJjb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJzeW1ib2wiLCJjb3ZhbGVudFJhZGl1cyIsImNvdmFsZW50RGlhbWV0ZXIiLCJlbGVjdHJvbmVnYXRpdml0eSIsImF0b21pY1dlaWdodCIsImNvbG9yIiwicmVmZXJlbmNlIiwidG9TdHJpbmciLCJpZCIsImNyZWF0ZUF0b21Gcm9tU3ltYm9sIiwiZ2V0RWxlbWVudEJ5U3ltYm9sIiwiaGFzU2FtZUVsZW1lbnQiLCJhdG9tIiwiaXNTYW1lRWxlbWVudCIsImlzSHlkcm9nZW4iLCJpc0NhcmJvbiIsImlzT3h5Z2VuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdG9tLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE9iamVjdCBmb3IgYWN0dWFsIGVsZW1lbnQgcHJvcGVydGllcyAoc3ltYm9sLCByYWRpdXMsIGV0Yy4pXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4vRWxlbWVudC5qcyc7XHJcbmltcG9ydCBuaXRyb2dseWNlcmluIGZyb20gJy4vbml0cm9nbHljZXJpbi5qcyc7XHJcblxyXG5sZXQgaWRDb3VudGVyID0gMTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0b20ge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudDtcclxuXHJcbiAgLy8gVGhlc2UgYXJlIGZpZWxkIG9mIEVsZW1lbnQsIHVucGFja2VkIGhlcmUgZm9yIGNvbnZlbmllbmNlLiBTZWUgRWxlbWVudCBmb3IgZG9jdW1lbnRhdGlvbiBvZiB0aGVzZSBmaWVsZHMuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN5bWJvbDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb3ZhbGVudFJhZGl1czogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb3ZhbGVudERpYW1ldGVyOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZWN0cm9uZWdhdGl2aXR5OiBudW1iZXIgfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBhdG9taWNXZWlnaHQ6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29sb3I6IENvbG9yIHwgc3RyaW5nO1xyXG5cclxuICAvLyBJRHMgZm9yIHVuaXF1ZW5lc3MgYW5kIGZhc3QgbG9va3Vwc1xyXG4gIHB1YmxpYyByZWFkb25seSByZWZlcmVuY2U6IHN0cmluZztcclxuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbGVtZW50OiBFbGVtZW50ICkge1xyXG5cclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblxyXG4gICAgLy8gVW5wYWNrIEVsZW1lbnQsIGZvciBjb252ZW5pZW5jZS5cclxuICAgIHRoaXMuc3ltYm9sID0gZWxlbWVudC5zeW1ib2w7XHJcbiAgICB0aGlzLmNvdmFsZW50UmFkaXVzID0gZWxlbWVudC5jb3ZhbGVudFJhZGl1cztcclxuICAgIHRoaXMuY292YWxlbnREaWFtZXRlciA9IGVsZW1lbnQuY292YWxlbnRSYWRpdXMgKiAyO1xyXG4gICAgdGhpcy5lbGVjdHJvbmVnYXRpdml0eSA9IGVsZW1lbnQuZWxlY3Ryb25lZ2F0aXZpdHk7XHJcbiAgICB0aGlzLmF0b21pY1dlaWdodCA9IGVsZW1lbnQuYXRvbWljV2VpZ2h0O1xyXG4gICAgdGhpcy5jb2xvciA9IGVsZW1lbnQuY29sb3I7XHJcblxyXG4gICAgdGhpcy5yZWZlcmVuY2UgPSAoIGlkQ291bnRlcisrICkudG9TdHJpbmcoIDE2ICk7XHJcbiAgICB0aGlzLmlkID0gYCR7dGhpcy5zeW1ib2x9XyR7dGhpcy5yZWZlcmVuY2V9YDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlQXRvbUZyb21TeW1ib2woIHN5bWJvbDogc3RyaW5nICk6IEF0b20ge1xyXG4gICAgcmV0dXJuIG5ldyBBdG9tKCBFbGVtZW50LmdldEVsZW1lbnRCeVN5bWJvbCggc3ltYm9sICkgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNTYW1lRWxlbWVudCggYXRvbTogQXRvbSApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaXNTYW1lRWxlbWVudCggYXRvbS5lbGVtZW50ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNIeWRyb2dlbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaXNIeWRyb2dlbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzQ2FyYm9uKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pc0NhcmJvbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzT3h5Z2VuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pc094eWdlbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5zeW1ib2w7XHJcbiAgfVxyXG59XHJcblxyXG5uaXRyb2dseWNlcmluLnJlZ2lzdGVyKCAnQXRvbScsIEF0b20gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxJQUFJQyxTQUFTLEdBQUcsQ0FBQztBQUVqQixlQUFlLE1BQU1DLElBQUksQ0FBQztFQUl4Qjs7RUFRQTs7RUFJT0MsV0FBV0EsQ0FBRUMsT0FBZ0IsRUFBRztJQUVyQyxJQUFJLENBQUNBLE9BQU8sR0FBR0EsT0FBTzs7SUFFdEI7SUFDQSxJQUFJLENBQUNDLE1BQU0sR0FBR0QsT0FBTyxDQUFDQyxNQUFNO0lBQzVCLElBQUksQ0FBQ0MsY0FBYyxHQUFHRixPQUFPLENBQUNFLGNBQWM7SUFDNUMsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0gsT0FBTyxDQUFDRSxjQUFjLEdBQUcsQ0FBQztJQUNsRCxJQUFJLENBQUNFLGlCQUFpQixHQUFHSixPQUFPLENBQUNJLGlCQUFpQjtJQUNsRCxJQUFJLENBQUNDLFlBQVksR0FBR0wsT0FBTyxDQUFDSyxZQUFZO0lBQ3hDLElBQUksQ0FBQ0MsS0FBSyxHQUFHTixPQUFPLENBQUNNLEtBQUs7SUFFMUIsSUFBSSxDQUFDQyxTQUFTLEdBQUcsQ0FBRVYsU0FBUyxFQUFFLEVBQUdXLFFBQVEsQ0FBRSxFQUFHLENBQUM7SUFDL0MsSUFBSSxDQUFDQyxFQUFFLEdBQUksR0FBRSxJQUFJLENBQUNSLE1BQU8sSUFBRyxJQUFJLENBQUNNLFNBQVUsRUFBQztFQUM5QztFQUVBLE9BQWNHLG9CQUFvQkEsQ0FBRVQsTUFBYyxFQUFTO0lBQ3pELE9BQU8sSUFBSUgsSUFBSSxDQUFFSCxPQUFPLENBQUNnQixrQkFBa0IsQ0FBRVYsTUFBTyxDQUFFLENBQUM7RUFDekQ7RUFFT1csY0FBY0EsQ0FBRUMsSUFBVSxFQUFZO0lBQzNDLE9BQU8sSUFBSSxDQUFDYixPQUFPLENBQUNjLGFBQWEsQ0FBRUQsSUFBSSxDQUFDYixPQUFRLENBQUM7RUFDbkQ7RUFFT2UsVUFBVUEsQ0FBQSxFQUFZO0lBQzNCLE9BQU8sSUFBSSxDQUFDZixPQUFPLENBQUNlLFVBQVUsQ0FBQyxDQUFDO0VBQ2xDO0VBRU9DLFFBQVFBLENBQUEsRUFBWTtJQUN6QixPQUFPLElBQUksQ0FBQ2hCLE9BQU8sQ0FBQ2dCLFFBQVEsQ0FBQyxDQUFDO0VBQ2hDO0VBRU9DLFFBQVFBLENBQUEsRUFBWTtJQUN6QixPQUFPLElBQUksQ0FBQ2pCLE9BQU8sQ0FBQ2lCLFFBQVEsQ0FBQyxDQUFDO0VBQ2hDO0VBRU9ULFFBQVFBLENBQUEsRUFBVztJQUN4QixPQUFPLElBQUksQ0FBQ1AsTUFBTTtFQUNwQjtBQUNGO0FBRUFMLGFBQWEsQ0FBQ3NCLFFBQVEsQ0FBRSxNQUFNLEVBQUVwQixJQUFLLENBQUMifQ==