// Copyright 2017-2022, University of Colorado Boulder

/**
 * Creates an SVG pattern element for a given pattern.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Pool from '../../../phet-core/js/Pool.js';
import { scenery, svgns, xlinkns } from '../imports.js';
export default class SVGPattern {
  // persistent

  constructor(pattern) {
    this.initialize(pattern);
  }
  initialize(pattern) {
    sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGPattern] initialize: ${pattern.id}`);
    sceneryLog && sceneryLog.Paints && sceneryLog.push();
    const hasPreviousDefinition = this.definition !== undefined;
    this.definition = this.definition || document.createElementNS(svgns, 'pattern');
    if (!hasPreviousDefinition) {
      // so we don't depend on the bounds of the object being drawn with the pattern
      this.definition.setAttribute('patternUnits', 'userSpaceOnUse');

      //TODO: is this needed?
      this.definition.setAttribute('patternContentUnits', 'userSpaceOnUse');
    }
    if (pattern.transformMatrix) {
      this.definition.setAttribute('patternTransform', pattern.transformMatrix.getSVGTransform());
    } else {
      this.definition.removeAttribute('patternTransform');
    }
    this.definition.setAttribute('x', '0');
    this.definition.setAttribute('y', '0');
    this.definition.setAttribute('width', '' + pattern.image.width);
    this.definition.setAttribute('height', '' + pattern.image.height);
    this.imageElement = this.imageElement || document.createElementNS(svgns, 'image');
    this.imageElement.setAttribute('x', '0');
    this.imageElement.setAttribute('y', '0');
    this.imageElement.setAttribute('width', `${pattern.image.width}px`);
    this.imageElement.setAttribute('height', `${pattern.image.height}px`);
    this.imageElement.setAttributeNS(xlinkns, 'xlink:href', pattern.image.src);
    if (!hasPreviousDefinition) {
      this.definition.appendChild(this.imageElement);
    }
    sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    return this;
  }

  /**
   * Called from SVGBlock, matches other paints.
   */
  update() {
    // Nothing
  }

  /**
   * Disposes, so that it can be reused from the pool.
   */
  dispose() {
    this.freeToPool();
  }
  freeToPool() {
    SVGPattern.pool.freeToPool(this);
  }
  static pool = new Pool(SVGPattern);
}
scenery.register('SVGPattern', SVGPattern);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQb29sIiwic2NlbmVyeSIsInN2Z25zIiwieGxpbmtucyIsIlNWR1BhdHRlcm4iLCJjb25zdHJ1Y3RvciIsInBhdHRlcm4iLCJpbml0aWFsaXplIiwic2NlbmVyeUxvZyIsIlBhaW50cyIsImlkIiwicHVzaCIsImhhc1ByZXZpb3VzRGVmaW5pdGlvbiIsImRlZmluaXRpb24iLCJ1bmRlZmluZWQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsInNldEF0dHJpYnV0ZSIsInRyYW5zZm9ybU1hdHJpeCIsImdldFNWR1RyYW5zZm9ybSIsInJlbW92ZUF0dHJpYnV0ZSIsImltYWdlIiwid2lkdGgiLCJoZWlnaHQiLCJpbWFnZUVsZW1lbnQiLCJzZXRBdHRyaWJ1dGVOUyIsInNyYyIsImFwcGVuZENoaWxkIiwicG9wIiwidXBkYXRlIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJwb29sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTVkdQYXR0ZXJuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gU1ZHIHBhdHRlcm4gZWxlbWVudCBmb3IgYSBnaXZlbiBwYXR0ZXJuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xyXG5pbXBvcnQgeyBQYXR0ZXJuLCBzY2VuZXJ5LCBzdmducywgeGxpbmtucyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU1ZHUGF0dGVybiBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XHJcblxyXG4gIC8vIHBlcnNpc3RlbnRcclxuICBwdWJsaWMgZGVmaW5pdGlvbiE6IFNWR1BhdHRlcm5FbGVtZW50O1xyXG4gIHByaXZhdGUgaW1hZ2VFbGVtZW50ITogU1ZHSW1hZ2VFbGVtZW50O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBhdHRlcm46IFBhdHRlcm4gKSB7XHJcbiAgICB0aGlzLmluaXRpYWxpemUoIHBhdHRlcm4gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpbml0aWFsaXplKCBwYXR0ZXJuOiBQYXR0ZXJuICk6IHRoaXMge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdQYXR0ZXJuXSBpbml0aWFsaXplOiAke3BhdHRlcm4uaWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBjb25zdCBoYXNQcmV2aW91c0RlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb24gIT09IHVuZGVmaW5lZDtcclxuXHJcbiAgICB0aGlzLmRlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb24gfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3BhdHRlcm4nICk7XHJcblxyXG4gICAgaWYgKCAhaGFzUHJldmlvdXNEZWZpbml0aW9uICkge1xyXG4gICAgICAvLyBzbyB3ZSBkb24ndCBkZXBlbmQgb24gdGhlIGJvdW5kcyBvZiB0aGUgb2JqZWN0IGJlaW5nIGRyYXduIHdpdGggdGhlIHBhdHRlcm5cclxuICAgICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ3BhdHRlcm5Vbml0cycsICd1c2VyU3BhY2VPblVzZScgKTtcclxuXHJcbiAgICAgIC8vVE9ETzogaXMgdGhpcyBuZWVkZWQ/XHJcbiAgICAgIHRoaXMuZGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdwYXR0ZXJuQ29udGVudFVuaXRzJywgJ3VzZXJTcGFjZU9uVXNlJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggcGF0dGVybi50cmFuc2Zvcm1NYXRyaXggKSB7XHJcbiAgICAgIHRoaXMuZGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdwYXR0ZXJuVHJhbnNmb3JtJywgcGF0dGVybi50cmFuc2Zvcm1NYXRyaXguZ2V0U1ZHVHJhbnNmb3JtKCkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmRlZmluaXRpb24ucmVtb3ZlQXR0cmlidXRlKCAncGF0dGVyblRyYW5zZm9ybScgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRlZmluaXRpb24uc2V0QXR0cmlidXRlKCAneCcsICcwJyApO1xyXG4gICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ3knLCAnMCcgKTtcclxuICAgIHRoaXMuZGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcnICsgcGF0dGVybi5pbWFnZS53aWR0aCApO1xyXG4gICAgdGhpcy5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsICcnICsgcGF0dGVybi5pbWFnZS5oZWlnaHQgKTtcclxuXHJcbiAgICB0aGlzLmltYWdlRWxlbWVudCA9IHRoaXMuaW1hZ2VFbGVtZW50IHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdpbWFnZScgKTtcclxuICAgIHRoaXMuaW1hZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSggJ3gnLCAnMCcgKTtcclxuICAgIHRoaXMuaW1hZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSggJ3knLCAnMCcgKTtcclxuICAgIHRoaXMuaW1hZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgYCR7cGF0dGVybi5pbWFnZS53aWR0aH1weGAgKTtcclxuICAgIHRoaXMuaW1hZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIGAke3BhdHRlcm4uaW1hZ2UuaGVpZ2h0fXB4YCApO1xyXG4gICAgdGhpcy5pbWFnZUVsZW1lbnQuc2V0QXR0cmlidXRlTlMoIHhsaW5rbnMsICd4bGluazpocmVmJywgcGF0dGVybi5pbWFnZS5zcmMgKTtcclxuICAgIGlmICggIWhhc1ByZXZpb3VzRGVmaW5pdGlvbiApIHtcclxuICAgICAgdGhpcy5kZWZpbml0aW9uLmFwcGVuZENoaWxkKCB0aGlzLmltYWdlRWxlbWVudCApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBmcm9tIFNWR0Jsb2NrLCBtYXRjaGVzIG90aGVyIHBhaW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgLy8gTm90aGluZ1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMsIHNvIHRoYXQgaXQgY2FuIGJlIHJldXNlZCBmcm9tIHRoZSBwb29sLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcclxuICAgIFNWR1BhdHRlcm4ucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggU1ZHUGF0dGVybiApO1xyXG59XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU1ZHUGF0dGVybicsIFNWR1BhdHRlcm4gKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLElBQUksTUFBcUIsK0JBQStCO0FBQy9ELFNBQWtCQyxPQUFPLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFFaEUsZUFBZSxNQUFNQyxVQUFVLENBQXNCO0VBRW5EOztFQUlPQyxXQUFXQSxDQUFFQyxPQUFnQixF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