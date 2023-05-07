// Copyright 2022, University of Colorado Boulder

/**
 * Tricks Safari into forcing SVG rendering, see https://github.com/phetsims/geometric-optics-basics/issues/31
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dotRandom from '../../../dot/js/dotRandom.js';
import { scenery, svgns } from '../imports.js';
export default class SafariWorkaroundOverlay {
  constructor(display) {
    this.display = display;

    // Create an SVG element that will be in front
    const svg = document.createElementNS(svgns, 'svg');
    this.domElement = svg;
    svg.style.position = 'absolute';
    svg.setAttribute('class', 'safari-workaround');
    svg.style.top = '0';
    svg.style.left = '0';
    // @ts-expect-error
    svg.style['pointer-events'] = 'none';

    // Make sure it covers our full size
    display.sizeProperty.link(dimension => {
      svg.setAttribute('width', '' + dimension.width);
      svg.setAttribute('height', '' + dimension.height);
      svg.style.clip = `rect(0px,${dimension.width}px,${dimension.height}px,0px)`;
    });
    this.rect = document.createElementNS(svgns, 'rect');
    svg.appendChild(this.rect);
    this.update();
  }
  update() {
    const random = dotRandom.nextDouble();

    // Position the rectangle to take up the full display width/height EXCEPT for being eroded by a random
    // less-than-pixel amount.
    this.rect.setAttribute('x', '' + random);
    this.rect.setAttribute('y', '' + random);
    this.rect.setAttribute('style', 'fill: rgba(255,200,100,0); stroke: none;');
    if (this.display.width) {
      this.rect.setAttribute('width', '' + (this.display.width - random * 2));
    }
    if (this.display.height) {
      this.rect.setAttribute('height', '' + (this.display.height - random * 2));
    }
  }
}
scenery.register('SafariWorkaroundOverlay', SafariWorkaroundOverlay);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJzY2VuZXJ5Iiwic3ZnbnMiLCJTYWZhcmlXb3JrYXJvdW5kT3ZlcmxheSIsImNvbnN0cnVjdG9yIiwiZGlzcGxheSIsInN2ZyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwiZG9tRWxlbWVudCIsInN0eWxlIiwicG9zaXRpb24iLCJzZXRBdHRyaWJ1dGUiLCJ0b3AiLCJsZWZ0Iiwic2l6ZVByb3BlcnR5IiwibGluayIsImRpbWVuc2lvbiIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpcCIsInJlY3QiLCJhcHBlbmRDaGlsZCIsInVwZGF0ZSIsInJhbmRvbSIsIm5leHREb3VibGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNhZmFyaVdvcmthcm91bmRPdmVybGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUcmlja3MgU2FmYXJpIGludG8gZm9yY2luZyBTVkcgcmVuZGVyaW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MtYmFzaWNzL2lzc3Vlcy8zMVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IHsgRGlzcGxheSwgc2NlbmVyeSwgc3ZnbnMsIFRPdmVybGF5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYWZhcmlXb3JrYXJvdW5kT3ZlcmxheSBpbXBsZW1lbnRzIFRPdmVybGF5IHtcclxuXHJcbiAgcHVibGljIGRvbUVsZW1lbnQ6IFNWR0VsZW1lbnQ7XHJcbiAgcHJpdmF0ZSByZWN0OiBTVkdQYXRoRWxlbWVudDtcclxuICBwcml2YXRlIGRpc3BsYXk6IERpc3BsYXk7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSApIHtcclxuXHJcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBTVkcgZWxlbWVudCB0aGF0IHdpbGwgYmUgaW4gZnJvbnRcclxuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdzdmcnICk7XHJcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBzdmc7XHJcbiAgICBzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgc3ZnLnNldEF0dHJpYnV0ZSggJ2NsYXNzJywgJ3NhZmFyaS13b3JrYXJvdW5kJyApO1xyXG4gICAgc3ZnLnN0eWxlLnRvcCA9ICcwJztcclxuICAgIHN2Zy5zdHlsZS5sZWZ0ID0gJzAnO1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgc3ZnLnN0eWxlWyAncG9pbnRlci1ldmVudHMnIF0gPSAnbm9uZSc7XHJcblxyXG4gICAgLy8gTWFrZSBzdXJlIGl0IGNvdmVycyBvdXIgZnVsbCBzaXplXHJcbiAgICBkaXNwbGF5LnNpemVQcm9wZXJ0eS5saW5rKCBkaW1lbnNpb24gPT4ge1xyXG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnJyArIGRpbWVuc2lvbi53aWR0aCApO1xyXG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyBkaW1lbnNpb24uaGVpZ2h0ICk7XHJcbiAgICAgIHN2Zy5zdHlsZS5jbGlwID0gYHJlY3QoMHB4LCR7ZGltZW5zaW9uLndpZHRofXB4LCR7ZGltZW5zaW9uLmhlaWdodH1weCwwcHgpYDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncmVjdCcgKTtcclxuXHJcbiAgICBzdmcuYXBwZW5kQ2hpbGQoIHRoaXMucmVjdCApO1xyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgY29uc3QgcmFuZG9tID0gZG90UmFuZG9tLm5leHREb3VibGUoKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgcmVjdGFuZ2xlIHRvIHRha2UgdXAgdGhlIGZ1bGwgZGlzcGxheSB3aWR0aC9oZWlnaHQgRVhDRVBUIGZvciBiZWluZyBlcm9kZWQgYnkgYSByYW5kb21cclxuICAgIC8vIGxlc3MtdGhhbi1waXhlbCBhbW91bnQuXHJcbiAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAneCcsICcnICsgcmFuZG9tICk7XHJcbiAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAneScsICcnICsgcmFuZG9tICk7XHJcbiAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAnc3R5bGUnLCAnZmlsbDogcmdiYSgyNTUsMjAwLDEwMCwwKTsgc3Ryb2tlOiBub25lOycgKTtcclxuICAgIGlmICggdGhpcy5kaXNwbGF5LndpZHRoICkge1xyXG4gICAgICB0aGlzLnJlY3Quc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnJyArICggdGhpcy5kaXNwbGF5LndpZHRoIC0gcmFuZG9tICogMiApICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuZGlzcGxheS5oZWlnaHQgKSB7XHJcbiAgICAgIHRoaXMucmVjdC5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCAnJyArICggdGhpcy5kaXNwbGF5LmhlaWdodCAtIHJhbmRvbSAqIDIgKSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1NhZmFyaVdvcmthcm91bmRPdmVybGF5JywgU2FmYXJpV29ya2Fyb3VuZE92ZXJsYXkgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSw4QkFB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