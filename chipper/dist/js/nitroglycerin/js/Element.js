// Copyright 2013-2022, University of Colorado Boulder

/**
 * Object for actual element properties (symbol, radius, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import nitroglycerin from './nitroglycerin.js';
export default class Element {
  // See constructor params for documentation.

  // static Element instances
  static Ar = new Element('Ar', 97, 188, null, 39.948, '#FFAFAF');
  static B = new Element('B', 85, 192, 2.04, 10.811, 'rgb(255,170,119)'); // peach/salmon colored, CPK coloring
  static Be = new Element('Be', 105, 153, 1.57, 9.012182, 'rgb(194,255,95)'); // beryllium
  static Br = new Element('Br', 114, 185, 2.96, 79.904, 'rgb(190,30,20)'); // brown
  static C = new Element('C', 77, 170, 2.55, 12.0107, 'rgb(178,178,178)');
  static Cl = new Element('Cl', 100, 175, 3.16, 35.4527, 'rgb(136,242,21)');
  static F = new Element('F', 72, 147, 3.98, 18.9984032, 'rgb(245,255,36)');
  static H = new Element('H', 37, 120, 2.20, 1.00794, '#ffffff');
  static I = new Element('I', 133, 198, 2.66, 126.90447, '#940094'); // dark violet, CPK coloring
  static N = new Element('N', 75, 155, 3.04, 14.00674, '#0000ff');
  static Ne = new Element('Ne', 69, 154, null, 20.1797, '#1AFFFB');
  static O = new Element('O', 73, 152, 3.44, 15.9994, PhetColorScheme.RED_COLORBLIND);
  static P = new Element('P', 110, 180, 2.19, 30.973762, 'rgb(255,154,0)');
  static S = new Element('S', 103, 180, 2.58, 32.066, 'rgb(212,181,59)');
  static Si = new Element('Si', 118, 210, 1.90, 28.0855, 'rgb(240,200,160)'); // tan, Jmol coloring listed from https://secure.wikimedia.org/wikipedia/en/wiki/CPK_coloring
  static Sn = new Element('Sn', 145, 217, 1.96, 118.710, '#668080'); // tin
  static Xe = new Element('Xe', 108, 216, 2.60, 131.293, '#429eb0'); // radius is based on calculated (not empirical) data

  static elements = [Element.Ar, Element.B, Element.Be, Element.Br, Element.C, Element.Cl, Element.F, Element.H, Element.I, Element.N, Element.Ne, Element.O, Element.P, Element.S, Element.Si, Element.Sn, Element.Xe];

  // Maps element.symbol to Element
  static elementMap = createElementMap(Element.elements);

  /**
   * @param symbol
   * @param covalentRadius - covalent radius, in picometers. For a quick chart,
   *        see http://en.wikipedia.org/wiki/Atomic_radii_of_the_elements_(data_page)
   * @param vanDerWaalsRadius - Van der Waals radius, in picometers. See chart at
   *        http://en.wikipedia.org/wiki/Atomic_radii_of_the_elements_(data_page)
   * @param electronegativity - in Pauling units, see https://secure.wikimedia.org/wikipedia/en/wiki/Electronegativity,
   *        is null when undefined for an element (as is the case for noble gasses)
   * @param atomicWeight - in atomic mass units (u). from http://www.webelements.com/periodicity/atomic_weight/
   * @param color - color used in visual representations
   */
  constructor(symbol, covalentRadius, vanDerWaalsRadius, electronegativity, atomicWeight, color) {
    this.symbol = symbol;
    this.covalentRadius = covalentRadius;
    this.vanDerWaalsRadius = vanDerWaalsRadius;
    this.electronegativity = electronegativity;
    this.atomicWeight = atomicWeight;
    this.color = color;
  }
  static getElementBySymbol(symbol) {
    const element = Element.elementMap.get(symbol);
    assert && assert(element, `Element not found for symbol=${symbol}`);
    return element;
  }
  isSameElement(element) {
    return element.symbol === this.symbol;
  }
  isHydrogen() {
    return this.isSameElement(Element.H);
  }
  isCarbon() {
    return this.isSameElement(Element.C);
  }
  isOxygen() {
    return this.isSameElement(Element.O);
  }
  toString() {
    return this.symbol;
  }
}
function createElementMap(elements) {
  const map = new Map();
  elements.forEach(element => map.set(element.symbol, element));
  return map;
}
nitroglycerin.register('Element', Element);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJuaXRyb2dseWNlcmluIiwiRWxlbWVudCIsIkFyIiwiQiIsIkJlIiwiQnIiLCJDIiwiQ2wiLCJGIiwiSCIsIkkiLCJOIiwiTmUiLCJPIiwiUkVEX0NPTE9SQkxJTkQiLCJQIiwiUyIsIlNpIiwiU24iLCJYZSIsImVsZW1lbnRzIiwiZWxlbWVudE1hcCIsImNyZWF0ZUVsZW1lbnRNYXAiLCJjb25zdHJ1Y3RvciIsInN5bWJvbCIsImNvdmFsZW50UmFkaXVzIiwidmFuRGVyV2FhbHNSYWRpdXMiLCJlbGVjdHJvbmVnYXRpdml0eSIsImF0b21pY1dlaWdodCIsImNvbG9yIiwiZ2V0RWxlbWVudEJ5U3ltYm9sIiwiZWxlbWVudCIsImdldCIsImFzc2VydCIsImlzU2FtZUVsZW1lbnQiLCJpc0h5ZHJvZ2VuIiwiaXNDYXJib24iLCJpc094eWdlbiIsInRvU3RyaW5nIiwibWFwIiwiTWFwIiwiZm9yRWFjaCIsInNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRWxlbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBPYmplY3QgZm9yIGFjdHVhbCBlbGVtZW50IHByb3BlcnRpZXMgKHN5bWJvbCwgcmFkaXVzLCBldGMuKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbml0cm9nbHljZXJpbiBmcm9tICcuL25pdHJvZ2x5Y2VyaW4uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlbWVudCB7XHJcblxyXG4gIC8vIFNlZSBjb25zdHJ1Y3RvciBwYXJhbXMgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgcHVibGljIHJlYWRvbmx5IHN5bWJvbDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb3ZhbGVudFJhZGl1czogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB2YW5EZXJXYWFsc1JhZGl1czogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBlbGVjdHJvbmVnYXRpdml0eTogbnVtYmVyIHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgYXRvbWljV2VpZ2h0OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yOiBDb2xvciB8IHN0cmluZztcclxuXHJcbiAgLy8gc3RhdGljIEVsZW1lbnQgaW5zdGFuY2VzXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBciA9IG5ldyBFbGVtZW50KCAnQXInLCA5NywgMTg4LCBudWxsLCAzOS45NDgsICcjRkZBRkFGJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQiA9IG5ldyBFbGVtZW50KCAnQicsIDg1LCAxOTIsIDIuMDQsIDEwLjgxMSwgJ3JnYigyNTUsMTcwLDExOSknICk7IC8vIHBlYWNoL3NhbG1vbiBjb2xvcmVkLCBDUEsgY29sb3JpbmdcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEJlID0gbmV3IEVsZW1lbnQoICdCZScsIDEwNSwgMTUzLCAxLjU3LCA5LjAxMjE4MiwgJ3JnYigxOTQsMjU1LDk1KScgKTsgLy8gYmVyeWxsaXVtXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCciA9IG5ldyBFbGVtZW50KCAnQnInLCAxMTQsIDE4NSwgMi45NiwgNzkuOTA0LCAncmdiKDE5MCwzMCwyMCknICk7IC8vIGJyb3duXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDID0gbmV3IEVsZW1lbnQoICdDJywgNzcsIDE3MCwgMi41NSwgMTIuMDEwNywgJ3JnYigxNzgsMTc4LDE3OCknICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDbCA9IG5ldyBFbGVtZW50KCAnQ2wnLCAxMDAsIDE3NSwgMy4xNiwgMzUuNDUyNywgJ3JnYigxMzYsMjQyLDIxKScgKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEYgPSBuZXcgRWxlbWVudCggJ0YnLCA3MiwgMTQ3LCAzLjk4LCAxOC45OTg0MDMyLCAncmdiKDI0NSwyNTUsMzYpJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSCA9IG5ldyBFbGVtZW50KCAnSCcsIDM3LCAxMjAsIDIuMjAsIDEuMDA3OTQsICcjZmZmZmZmJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSSA9IG5ldyBFbGVtZW50KCAnSScsIDEzMywgMTk4LCAyLjY2LCAxMjYuOTA0NDcsICcjOTQwMDk0JyApOyAvLyBkYXJrIHZpb2xldCwgQ1BLIGNvbG9yaW5nXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOID0gbmV3IEVsZW1lbnQoICdOJywgNzUsIDE1NSwgMy4wNCwgMTQuMDA2NzQsICcjMDAwMGZmJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTmUgPSBuZXcgRWxlbWVudCggJ05lJywgNjksIDE1NCwgbnVsbCwgMjAuMTc5NywgJyMxQUZGRkInICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPID0gbmV3IEVsZW1lbnQoICdPJywgNzMsIDE1MiwgMy40NCwgMTUuOTk5NCwgUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5EICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQID0gbmV3IEVsZW1lbnQoICdQJywgMTEwLCAxODAsIDIuMTksIDMwLjk3Mzc2MiwgJ3JnYigyNTUsMTU0LDApJyApO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUyA9IG5ldyBFbGVtZW50KCAnUycsIDEwMywgMTgwLCAyLjU4LCAzMi4wNjYsICdyZ2IoMjEyLDE4MSw1OSknICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTaSA9IG5ldyBFbGVtZW50KCAnU2knLCAxMTgsIDIxMCwgMS45MCwgMjguMDg1NSwgJ3JnYigyNDAsMjAwLDE2MCknICk7IC8vIHRhbiwgSm1vbCBjb2xvcmluZyBsaXN0ZWQgZnJvbSBodHRwczovL3NlY3VyZS53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9lbi93aWtpL0NQS19jb2xvcmluZ1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU24gPSBuZXcgRWxlbWVudCggJ1NuJywgMTQ1LCAyMTcsIDEuOTYsIDExOC43MTAsICcjNjY4MDgwJyApOyAvLyB0aW5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFhlID0gbmV3IEVsZW1lbnQoICdYZScsIDEwOCwgMjE2LCAyLjYwLCAxMzEuMjkzLCAnIzQyOWViMCcgKTsgLy8gcmFkaXVzIGlzIGJhc2VkIG9uIGNhbGN1bGF0ZWQgKG5vdCBlbXBpcmljYWwpIGRhdGFcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbGVtZW50cyA9IFtcclxuICAgIEVsZW1lbnQuQXIsIEVsZW1lbnQuQiwgRWxlbWVudC5CZSwgRWxlbWVudC5CciwgRWxlbWVudC5DLCBFbGVtZW50LkNsLCBFbGVtZW50LkYsIEVsZW1lbnQuSCwgRWxlbWVudC5JLCBFbGVtZW50Lk4sXHJcbiAgICBFbGVtZW50Lk5lLCBFbGVtZW50Lk8sIEVsZW1lbnQuUCwgRWxlbWVudC5TLCBFbGVtZW50LlNpLCBFbGVtZW50LlNuLCBFbGVtZW50LlhlXHJcbiAgXTtcclxuXHJcbiAgLy8gTWFwcyBlbGVtZW50LnN5bWJvbCB0byBFbGVtZW50XHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgZWxlbWVudE1hcDogTWFwPHN0cmluZywgRWxlbWVudD4gPSBjcmVhdGVFbGVtZW50TWFwKCBFbGVtZW50LmVsZW1lbnRzICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzeW1ib2xcclxuICAgKiBAcGFyYW0gY292YWxlbnRSYWRpdXMgLSBjb3ZhbGVudCByYWRpdXMsIGluIHBpY29tZXRlcnMuIEZvciBhIHF1aWNrIGNoYXJ0LFxyXG4gICAqICAgICAgICBzZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BdG9taWNfcmFkaWlfb2ZfdGhlX2VsZW1lbnRzXyhkYXRhX3BhZ2UpXHJcbiAgICogQHBhcmFtIHZhbkRlcldhYWxzUmFkaXVzIC0gVmFuIGRlciBXYWFscyByYWRpdXMsIGluIHBpY29tZXRlcnMuIFNlZSBjaGFydCBhdFxyXG4gICAqICAgICAgICBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0F0b21pY19yYWRpaV9vZl90aGVfZWxlbWVudHNfKGRhdGFfcGFnZSlcclxuICAgKiBAcGFyYW0gZWxlY3Ryb25lZ2F0aXZpdHkgLSBpbiBQYXVsaW5nIHVuaXRzLCBzZWUgaHR0cHM6Ly9zZWN1cmUud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvZW4vd2lraS9FbGVjdHJvbmVnYXRpdml0eSxcclxuICAgKiAgICAgICAgaXMgbnVsbCB3aGVuIHVuZGVmaW5lZCBmb3IgYW4gZWxlbWVudCAoYXMgaXMgdGhlIGNhc2UgZm9yIG5vYmxlIGdhc3NlcylcclxuICAgKiBAcGFyYW0gYXRvbWljV2VpZ2h0IC0gaW4gYXRvbWljIG1hc3MgdW5pdHMgKHUpLiBmcm9tIGh0dHA6Ly93d3cud2ViZWxlbWVudHMuY29tL3BlcmlvZGljaXR5L2F0b21pY193ZWlnaHQvXHJcbiAgICogQHBhcmFtIGNvbG9yIC0gY29sb3IgdXNlZCBpbiB2aXN1YWwgcmVwcmVzZW50YXRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzeW1ib2w6IHN0cmluZywgY292YWxlbnRSYWRpdXM6IG51bWJlciwgdmFuRGVyV2FhbHNSYWRpdXM6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIGVsZWN0cm9uZWdhdGl2aXR5OiBudW1iZXIgfCBudWxsLCBhdG9taWNXZWlnaHQ6IG51bWJlciwgY29sb3I6IENvbG9yIHwgc3RyaW5nICkge1xyXG5cclxuICAgIHRoaXMuc3ltYm9sID0gc3ltYm9sO1xyXG4gICAgdGhpcy5jb3ZhbGVudFJhZGl1cyA9IGNvdmFsZW50UmFkaXVzO1xyXG4gICAgdGhpcy52YW5EZXJXYWFsc1JhZGl1cyA9IHZhbkRlcldhYWxzUmFkaXVzO1xyXG4gICAgdGhpcy5lbGVjdHJvbmVnYXRpdml0eSA9IGVsZWN0cm9uZWdhdGl2aXR5O1xyXG4gICAgdGhpcy5hdG9taWNXZWlnaHQgPSBhdG9taWNXZWlnaHQ7XHJcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIGdldEVsZW1lbnRCeVN5bWJvbCggc3ltYm9sOiBzdHJpbmcgKTogRWxlbWVudCB7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gRWxlbWVudC5lbGVtZW50TWFwLmdldCggc3ltYm9sICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbGVtZW50LCBgRWxlbWVudCBub3QgZm91bmQgZm9yIHN5bWJvbD0ke3N5bWJvbH1gICk7XHJcbiAgICByZXR1cm4gZWxlbWVudCE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNTYW1lRWxlbWVudCggZWxlbWVudDogRWxlbWVudCApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBlbGVtZW50LnN5bWJvbCA9PT0gdGhpcy5zeW1ib2w7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNIeWRyb2dlbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzU2FtZUVsZW1lbnQoIEVsZW1lbnQuSCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzQ2FyYm9uKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNTYW1lRWxlbWVudCggRWxlbWVudC5DICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNPeHlnZW4oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1NhbWVFbGVtZW50KCBFbGVtZW50Lk8gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuc3ltYm9sO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE1hcCggZWxlbWVudHM6IEVsZW1lbnRbXSApOiBNYXA8c3RyaW5nLCBFbGVtZW50PiB7XHJcbiAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xyXG4gIGVsZW1lbnRzLmZvckVhY2goIGVsZW1lbnQgPT4gbWFwLnNldCggZWxlbWVudC5zeW1ib2wsIGVsZW1lbnQgKSApO1xyXG4gIHJldHVybiBtYXA7XHJcbn1cclxuXHJcbm5pdHJvZ2x5Y2VyaW4ucmVnaXN0ZXIoICdFbGVtZW50JywgRWxlbWVudCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMENBQTBDO0FBRXRFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsZUFBZSxNQUFNQyxPQUFPLENBQUM7RUFFM0I7O0VBUUE7RUFDQSxPQUF1QkMsRUFBRSxHQUFHLElBQUlELE9BQU8sQ0FBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVUsQ0FBQztFQUNqRixPQUF1QkUsQ0FBQyxHQUFHLElBQUlGLE9BQU8sQ0FBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGtCQUFtQixDQUFDLENBQUMsQ0FBQztFQUMxRixPQUF1QkcsRUFBRSxHQUFHLElBQUlILE9BQU8sQ0FBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGlCQUFrQixDQUFDLENBQUMsQ0FBQztFQUM5RixPQUF1QkksRUFBRSxHQUFHLElBQUlKLE9BQU8sQ0FBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFpQixDQUFDLENBQUMsQ0FBQztF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