// Copyright 2013-2022, University of Colorado Boulder

/**
 * The PointerOverlay shows pointer locations in the scene.  This is useful when recording a session for interviews or when a teacher is broadcasting
 * a tablet session on an overhead projector.  See https://github.com/phetsims/scenery/issues/111
 *
 * Each pointer is rendered in a different <svg> so that CSS3 transforms can be used to make performance smooth on iPad.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import { PDOMPointer, scenery, svgns, Utils } from '../imports.js';
export default class PointerOverlay {
  constructor(display, rootNode) {
    this.display = display;
    this.rootNode = rootNode;

    // add element to show the pointers
    this.pointerSVGContainer = document.createElement('div');
    this.pointerSVGContainer.style.position = 'absolute';
    this.pointerSVGContainer.style.top = '0';
    this.pointerSVGContainer.style.left = '0';
    // @ts-expect-error
    this.pointerSVGContainer.style['pointer-events'] = 'none';
    const innerRadius = 10;
    const strokeWidth = 1;
    const diameter = (innerRadius + strokeWidth / 2) * 2;
    const radius = diameter / 2;

    // Resize the parent div when the rootNode is resized
    display.sizeProperty.lazyLink(dimension => {
      this.pointerSVGContainer.setAttribute('width', '' + dimension.width);
      this.pointerSVGContainer.setAttribute('height', '' + dimension.height);
      this.pointerSVGContainer.style.clip = `rect(0px,${dimension.width}px,${dimension.height}px,0px)`;
    });
    const scratchMatrix = Matrix3.IDENTITY.copy();

    //Display a pointer that was added.  Use a separate SVG layer for each pointer so it can be hardware accelerated, otherwise it is too slow just setting svg internal attributes
    this.pointerAdded = pointer => {
      const svg = document.createElementNS(svgns, 'svg');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      // @ts-expect-error
      svg.style['pointer-events'] = 'none';
      Utils.prepareForTransform(svg);

      //Fit the size to the display
      svg.setAttribute('width', '' + diameter);
      svg.setAttribute('height', '' + diameter);
      const circle = document.createElementNS(svgns, 'circle');

      //use css transform for performance?
      circle.setAttribute('cx', '' + (innerRadius + strokeWidth / 2));
      circle.setAttribute('cy', '' + (innerRadius + strokeWidth / 2));
      circle.setAttribute('r', '' + innerRadius);
      circle.setAttribute('style', 'fill:black;');
      circle.setAttribute('style', 'stroke:white;');
      circle.setAttribute('opacity', '0.4');
      const updateToPoint = point => Utils.applyPreparedTransform(scratchMatrix.setToTranslation(point.x - radius, point.y - radius), svg);

      //Add a move listener to the pointer to update position when it has moved
      const pointerRemoved = () => {
        // For touche-like events that get a touch up event, remove them.  But when the mouse button is released, don't stop
        // showing the mouse location
        if (pointer.isTouchLike()) {
          this.pointerSVGContainer.removeChild(svg);
          pointer.removeInputListener(moveListener);
        }
      };
      const moveListener = {
        // Mouse/Touch/Pen
        move: () => {
          pointer.point && updateToPoint(pointer.point);
        },
        up: pointerRemoved,
        cancel: pointerRemoved,
        // PDOMPointer
        focus: () => {
          if (pointer instanceof PDOMPointer && pointer.point) {
            updateToPoint(pointer.point);
            this.pointerSVGContainer.appendChild(svg);
          }
        },
        blur: () => {
          this.pointerSVGContainer.contains(svg) && this.pointerSVGContainer.removeChild(svg);
        }
      };
      pointer.addInputListener(moveListener);
      moveListener.move();
      svg.appendChild(circle);
      this.pointerSVGContainer.appendChild(svg);
    };
    display._input.pointerAddedEmitter.addListener(this.pointerAdded);

    //if there is already a mouse, add it here
    // TODO: if there already other non-mouse touches, could be added here
    if (display._input && display._input.mouse) {
      this.pointerAdded(display._input.mouse);
    }
    this.domElement = this.pointerSVGContainer;
  }

  /**
   * Releases references
   */
  dispose() {
    this.display._input.pointerAddedEmitter.removeListener(this.pointerAdded);
  }

  /**
   */
  update() {
    // Required for type 'TOverlay'
  }
}
scenery.register('PointerOverlay', PointerOverlay);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiUERPTVBvaW50ZXIiLCJzY2VuZXJ5Iiwic3ZnbnMiLCJVdGlscyIsIlBvaW50ZXJPdmVybGF5IiwiY29uc3RydWN0b3IiLCJkaXNwbGF5Iiwicm9vdE5vZGUiLCJwb2ludGVyU1ZHQ29udGFpbmVyIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJpbm5lclJhZGl1cyIsInN0cm9rZVdpZHRoIiwiZGlhbWV0ZXIiLCJyYWRpdXMiLCJzaXplUHJvcGVydHkiLCJsYXp5TGluayIsImRpbWVuc2lvbiIsInNldEF0dHJpYnV0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpcCIsInNjcmF0Y2hNYXRyaXgiLCJJREVOVElUWSIsImNvcHkiLCJwb2ludGVyQWRkZWQiLCJwb2ludGVyIiwic3ZnIiwiY3JlYXRlRWxlbWVudE5TIiwicHJlcGFyZUZvclRyYW5zZm9ybSIsImNpcmNsZSIsInVwZGF0ZVRvUG9pbnQiLCJwb2ludCIsImFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0iLCJzZXRUb1RyYW5zbGF0aW9uIiwieCIsInkiLCJwb2ludGVyUmVtb3ZlZCIsImlzVG91Y2hMaWtlIiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwibW92ZUxpc3RlbmVyIiwibW92ZSIsInVwIiwiY2FuY2VsIiwiZm9jdXMiLCJhcHBlbmRDaGlsZCIsImJsdXIiLCJjb250YWlucyIsImFkZElucHV0TGlzdGVuZXIiLCJfaW5wdXQiLCJwb2ludGVyQWRkZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJtb3VzZSIsImRvbUVsZW1lbnQiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJ1cGRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvaW50ZXJPdmVybGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBQb2ludGVyT3ZlcmxheSBzaG93cyBwb2ludGVyIGxvY2F0aW9ucyBpbiB0aGUgc2NlbmUuICBUaGlzIGlzIHVzZWZ1bCB3aGVuIHJlY29yZGluZyBhIHNlc3Npb24gZm9yIGludGVydmlld3Mgb3Igd2hlbiBhIHRlYWNoZXIgaXMgYnJvYWRjYXN0aW5nXHJcbiAqIGEgdGFibGV0IHNlc3Npb24gb24gYW4gb3ZlcmhlYWQgcHJvamVjdG9yLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTFcclxuICpcclxuICogRWFjaCBwb2ludGVyIGlzIHJlbmRlcmVkIGluIGEgZGlmZmVyZW50IDxzdmc+IHNvIHRoYXQgQ1NTMyB0cmFuc2Zvcm1zIGNhbiBiZSB1c2VkIHRvIG1ha2UgcGVyZm9ybWFuY2Ugc21vb3RoIG9uIGlQYWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IERpc3BsYXksIFRPdmVybGF5LCBOb2RlLCBQRE9NUG9pbnRlciwgUG9pbnRlciwgc2NlbmVyeSwgc3ZnbnMsIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludGVyT3ZlcmxheSBpbXBsZW1lbnRzIFRPdmVybGF5IHtcclxuXHJcbiAgcHJvdGVjdGVkIGRpc3BsYXk6IERpc3BsYXk7XHJcbiAgcHJvdGVjdGVkIHJvb3ROb2RlOiBOb2RlO1xyXG5cclxuICBwcm90ZWN0ZWQgcG9pbnRlclNWR0NvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gIHB1YmxpYyBkb21FbGVtZW50OiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgcHJpdmF0ZSBwb2ludGVyQWRkZWQ6ICggcG9pbnRlcjogUG9pbnRlciApID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgcm9vdE5vZGU6IE5vZGUgKSB7XHJcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG4gICAgdGhpcy5yb290Tm9kZSA9IHJvb3ROb2RlO1xyXG5cclxuICAgIC8vIGFkZCBlbGVtZW50IHRvIHNob3cgdGhlIHBvaW50ZXJzXHJcbiAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc3R5bGUubGVmdCA9ICcwJztcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5zdHlsZVsgJ3BvaW50ZXItZXZlbnRzJyBdID0gJ25vbmUnO1xyXG5cclxuICAgIGNvbnN0IGlubmVyUmFkaXVzID0gMTA7XHJcbiAgICBjb25zdCBzdHJva2VXaWR0aCA9IDE7XHJcbiAgICBjb25zdCBkaWFtZXRlciA9ICggaW5uZXJSYWRpdXMgKyBzdHJva2VXaWR0aCAvIDIgKSAqIDI7XHJcbiAgICBjb25zdCByYWRpdXMgPSBkaWFtZXRlciAvIDI7XHJcblxyXG4gICAgLy8gUmVzaXplIHRoZSBwYXJlbnQgZGl2IHdoZW4gdGhlIHJvb3ROb2RlIGlzIHJlc2l6ZWRcclxuICAgIGRpc3BsYXkuc2l6ZVByb3BlcnR5LmxhenlMaW5rKCBkaW1lbnNpb24gPT4ge1xyXG4gICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnJyArIGRpbWVuc2lvbi53aWR0aCApO1xyXG4gICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyBkaW1lbnNpb24uaGVpZ2h0ICk7XHJcbiAgICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5zdHlsZS5jbGlwID0gYHJlY3QoMHB4LCR7ZGltZW5zaW9uLndpZHRofXB4LCR7ZGltZW5zaW9uLmhlaWdodH1weCwwcHgpYDtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzY3JhdGNoTWF0cml4ID0gTWF0cml4My5JREVOVElUWS5jb3B5KCk7XHJcblxyXG4gICAgLy9EaXNwbGF5IGEgcG9pbnRlciB0aGF0IHdhcyBhZGRlZC4gIFVzZSBhIHNlcGFyYXRlIFNWRyBsYXllciBmb3IgZWFjaCBwb2ludGVyIHNvIGl0IGNhbiBiZSBoYXJkd2FyZSBhY2NlbGVyYXRlZCwgb3RoZXJ3aXNlIGl0IGlzIHRvbyBzbG93IGp1c3Qgc2V0dGluZyBzdmcgaW50ZXJuYWwgYXR0cmlidXRlc1xyXG4gICAgdGhpcy5wb2ludGVyQWRkZWQgPSAoIHBvaW50ZXI6IFBvaW50ZXIgKSA9PiB7XHJcblxyXG4gICAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICBzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICBzdmcuc3R5bGUudG9wID0gJzAnO1xyXG4gICAgICBzdmcuc3R5bGUubGVmdCA9ICcwJztcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBzdmcuc3R5bGVbICdwb2ludGVyLWV2ZW50cycgXSA9ICdub25lJztcclxuXHJcbiAgICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHN2ZyApO1xyXG5cclxuICAgICAgLy9GaXQgdGhlIHNpemUgdG8gdGhlIGRpc3BsYXlcclxuICAgICAgc3ZnLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgJycgKyBkaWFtZXRlciApO1xyXG4gICAgICBzdmcuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgJycgKyBkaWFtZXRlciApO1xyXG5cclxuICAgICAgY29uc3QgY2lyY2xlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2NpcmNsZScgKTtcclxuXHJcbiAgICAgIC8vdXNlIGNzcyB0cmFuc2Zvcm0gZm9yIHBlcmZvcm1hbmNlP1xyXG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCAnY3gnLCAnJyArICggaW5uZXJSYWRpdXMgKyBzdHJva2VXaWR0aCAvIDIgKSApO1xyXG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCAnY3knLCAnJyArICggaW5uZXJSYWRpdXMgKyBzdHJva2VXaWR0aCAvIDIgKSApO1xyXG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCAncicsICcnICsgaW5uZXJSYWRpdXMgKTtcclxuICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSggJ3N0eWxlJywgJ2ZpbGw6YmxhY2s7JyApO1xyXG4gICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCAnc3Ryb2tlOndoaXRlOycgKTtcclxuICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSggJ29wYWNpdHknLCAnMC40JyApO1xyXG5cclxuICAgICAgY29uc3QgdXBkYXRlVG9Qb2ludCA9ICggcG9pbnQ6IFZlY3RvcjIgKSA9PiBVdGlscy5hcHBseVByZXBhcmVkVHJhbnNmb3JtKCBzY3JhdGNoTWF0cml4LnNldFRvVHJhbnNsYXRpb24oIHBvaW50LnggLSByYWRpdXMsIHBvaW50LnkgLSByYWRpdXMgKSwgc3ZnICk7XHJcblxyXG4gICAgICAvL0FkZCBhIG1vdmUgbGlzdGVuZXIgdG8gdGhlIHBvaW50ZXIgdG8gdXBkYXRlIHBvc2l0aW9uIHdoZW4gaXQgaGFzIG1vdmVkXHJcbiAgICAgIGNvbnN0IHBvaW50ZXJSZW1vdmVkID0gKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBGb3IgdG91Y2hlLWxpa2UgZXZlbnRzIHRoYXQgZ2V0IGEgdG91Y2ggdXAgZXZlbnQsIHJlbW92ZSB0aGVtLiAgQnV0IHdoZW4gdGhlIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZCwgZG9uJ3Qgc3RvcFxyXG4gICAgICAgIC8vIHNob3dpbmcgdGhlIG1vdXNlIGxvY2F0aW9uXHJcbiAgICAgICAgaWYgKCBwb2ludGVyLmlzVG91Y2hMaWtlKCkgKSB7XHJcbiAgICAgICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIucmVtb3ZlQ2hpbGQoIHN2ZyApO1xyXG4gICAgICAgICAgcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCBtb3ZlTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IG1vdmVMaXN0ZW5lciA9IHtcclxuXHJcbiAgICAgICAgLy8gTW91c2UvVG91Y2gvUGVuXHJcbiAgICAgICAgbW92ZTogKCkgPT4ge1xyXG4gICAgICAgICAgcG9pbnRlci5wb2ludCAmJiB1cGRhdGVUb1BvaW50KCBwb2ludGVyLnBvaW50ICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cDogcG9pbnRlclJlbW92ZWQsXHJcbiAgICAgICAgY2FuY2VsOiBwb2ludGVyUmVtb3ZlZCxcclxuXHJcbiAgICAgICAgLy8gUERPTVBvaW50ZXJcclxuICAgICAgICBmb2N1czogKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCBwb2ludGVyIGluc3RhbmNlb2YgUERPTVBvaW50ZXIgJiYgcG9pbnRlci5wb2ludCApIHtcclxuICAgICAgICAgICAgdXBkYXRlVG9Qb2ludCggcG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIuYXBwZW5kQ2hpbGQoIHN2ZyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmx1cjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wb2ludGVyU1ZHQ29udGFpbmVyLmNvbnRhaW5zKCBzdmcgKSAmJiB0aGlzLnBvaW50ZXJTVkdDb250YWluZXIucmVtb3ZlQ2hpbGQoIHN2ZyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgcG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCBtb3ZlTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIG1vdmVMaXN0ZW5lci5tb3ZlKCk7XHJcbiAgICAgIHN2Zy5hcHBlbmRDaGlsZCggY2lyY2xlICk7XHJcbiAgICAgIHRoaXMucG9pbnRlclNWR0NvbnRhaW5lci5hcHBlbmRDaGlsZCggc3ZnICk7XHJcbiAgICB9O1xyXG4gICAgZGlzcGxheS5faW5wdXQhLnBvaW50ZXJBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMucG9pbnRlckFkZGVkICk7XHJcblxyXG4gICAgLy9pZiB0aGVyZSBpcyBhbHJlYWR5IGEgbW91c2UsIGFkZCBpdCBoZXJlXHJcbiAgICAvLyBUT0RPOiBpZiB0aGVyZSBhbHJlYWR5IG90aGVyIG5vbi1tb3VzZSB0b3VjaGVzLCBjb3VsZCBiZSBhZGRlZCBoZXJlXHJcbiAgICBpZiAoIGRpc3BsYXkuX2lucHV0ICYmIGRpc3BsYXkuX2lucHV0Lm1vdXNlICkge1xyXG4gICAgICB0aGlzLnBvaW50ZXJBZGRlZCggZGlzcGxheS5faW5wdXQubW91c2UgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnBvaW50ZXJTVkdDb250YWluZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICovXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3BsYXkuX2lucHV0IS5wb2ludGVyQWRkZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnBvaW50ZXJBZGRlZCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZSgpOiB2b2lkIHtcclxuICAgIC8vIFJlcXVpcmVkIGZvciB0eXBlICdUT3ZlcmxheSdcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdQb2ludGVyT3ZlcmxheScsIFBvaW50ZXJPdmVybGF5ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBRWhELFNBQWtDQyxXQUFXLEVBQVdDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxLQUFLLFFBQVEsZUFBZTtBQUVwRyxlQUFlLE1BQU1DLGNBQWMsQ0FBcUI7RUFXL0NDLFdBQVdBLENBQUVDLE9BQWdCLEVBQUVDLFFBQWMsRUFBRztJQUNyRCxJQUFJLENBQUNELE9BQU8sR0FBR0EsT0FBTztJQUN0QixJQUFJLENBQUNDLFFBQVEsR0FBR0EsUUFBUTs7SUFFeEI7SUFDQSxJQUFJLENBQUNDLG1CQUFtQixHQUFHQyxRQUFRLENBQUNDLGFBQWEsQ0FBRSxLQUFNLENBQUM7SUFDMUQsSUFBSSxDQUFDRixtQkFBbUIsQ0FBQ0csS0FBSyxDQUFDQyxRQUFRLEdBQUcsVUFBVTtJQUNwRCxJQUFJLENBQUNKLG1CQUFtQixDQUFDRyxLQUFLLENBQUNFLEdBQUcsR0FBRyxHQUFHO0lBQ3hDLElBQUksQ0FBQ0wsbUJBQW1CLENBQUNHLEtBQUssQ0FBQ0csSUFBSSxHQUFHLEdBQUc7SUFDekM7SUFDQSxJQUFJLENBQUNOLG1CQUFtQixDQUFDRyxLQUFLLENBQUUsZ0JBQWdCLENBQUUsR0FBRyxNQUFNO0lBRTNELE1BQU1JLFdBQVcsR0FBRyxFQUFFO0lBQ3RCLE1BQU1DLFdBQVcsR0FBRyxDQUFDO0lBQ3JCLE1BQU1DLFFBQVEsR0FBRyxDQUFFRixXQUFXLEdBQUdDLFdBQVcsR0FBRyxDQUFDLElBQUssQ0FBQztJQUN0RCxNQUFNRSxNQUFNLEdBQUdELFFBQVEsR0FBRyxDQUFDOztJQUUzQjtJQUNBWCxPQUFPLENBQUNhLFlBQVksQ0FBQ0MsUUFBUSxDQUFFQyxTQUFTLElBQUk7TUFDMUMsSUFBSSxDQUFDYixt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