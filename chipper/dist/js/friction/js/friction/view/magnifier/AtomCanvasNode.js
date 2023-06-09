// Copyright 2016-2021, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import { CanvasNode } from '../../../../../scenery/js/imports.js';
import friction from '../../../friction.js';
import FrictionConstants from '../../FrictionConstants.js';

// constants
const PARTICLE_IMAGE_SIZE = 32; // pixels, square
const ATOM_NODE_LINE_WIDTH = 2;
const HIGHLIGHT_FACTOR = 0.7;
const ATOM_STROKE = 'black';

// image size - this is tweaked slightly to account for stroke and to get behavior that is consistent with
// previous versions of the sim
const PARTICLE_IMAGE_SIZE_FOR_RENDERING = FrictionConstants.ATOM_RADIUS * 2 * 1.2;
const PARTICLE_RENDERING_OFFSET = -PARTICLE_IMAGE_SIZE_FOR_RENDERING / 2;
class AtomCanvasNode extends CanvasNode {
  /**
   * @param {Atom[]} atoms
   * @param {Object} [options]
   */
  constructor(atoms, options) {
    super(options);

    // create the Scenery image nodes that will be drawn onto the canvas in order to render the atoms
    const topBookAtomNode = new ShadedSphereNode(PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR.colorUtilsBrighter(HIGHLIGHT_FACTOR),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    });
    topBookAtomNode.toCanvas(image => {
      this.topBookAtomImage = image;
    });
    const bottomBookAtomNode = new ShadedSphereNode(PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR.colorUtilsBrighter(HIGHLIGHT_FACTOR),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    });
    bottomBookAtomNode.toCanvas(image => {
      this.bottomBookAtomImage = image;
    });

    // @private {Atom[]} - array that holds the atoms to be rendered
    this.atoms = atoms;

    // @private - reusable position values, saves memory allocations
    this.axomPositionX = 0;
    this.atomPositionY = 0;
  }

  /**
   * @override
   * @protected
   * paints the particles on the canvas node
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas(context) {
    // render each of the atoms to the canvas
    for (let i = 0; i < this.atoms.length; i++) {
      const atom = this.atoms[i];
      const atomPosition = atom.positionProperty.get();
      const sourceImage = atom.isTopAtom ? this.topBookAtomImage : this.bottomBookAtomImage;
      context.drawImage(sourceImage, atomPosition.x + PARTICLE_RENDERING_OFFSET, atomPosition.y + PARTICLE_RENDERING_OFFSET, PARTICLE_IMAGE_SIZE_FOR_RENDERING, PARTICLE_IMAGE_SIZE_FOR_RENDERING);
    }
  }
}
friction.register('AtomCanvasNode', AtomCanvasNode);
export default AtomCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFkZWRTcGhlcmVOb2RlIiwiQ2FudmFzTm9kZSIsImZyaWN0aW9uIiwiRnJpY3Rpb25Db25zdGFudHMiLCJQQVJUSUNMRV9JTUFHRV9TSVpFIiwiQVRPTV9OT0RFX0xJTkVfV0lEVEgiLCJISUdITElHSFRfRkFDVE9SIiwiQVRPTV9TVFJPS0UiLCJQQVJUSUNMRV9JTUFHRV9TSVpFX0ZPUl9SRU5ERVJJTkciLCJBVE9NX1JBRElVUyIsIlBBUlRJQ0xFX1JFTkRFUklOR19PRkZTRVQiLCJBdG9tQ2FudmFzTm9kZSIsImNvbnN0cnVjdG9yIiwiYXRvbXMiLCJvcHRpb25zIiwidG9wQm9va0F0b21Ob2RlIiwibWFpbkNvbG9yIiwiVE9QX0JPT0tfQVRPTVNfQ09MT1IiLCJoaWdobGlnaHRDb2xvciIsImNvbG9yVXRpbHNCcmlnaHRlciIsInN0cm9rZSIsImxpbmVXaWR0aCIsInRvQ2FudmFzIiwiaW1hZ2UiLCJ0b3BCb29rQXRvbUltYWdlIiwiYm90dG9tQm9va0F0b21Ob2RlIiwiQk9UVE9NX0JPT0tfQVRPTVNfQ09MT1IiLCJib3R0b21Cb29rQXRvbUltYWdlIiwiYXhvbVBvc2l0aW9uWCIsImF0b21Qb3NpdGlvblkiLCJwYWludENhbnZhcyIsImNvbnRleHQiLCJpIiwibGVuZ3RoIiwiYXRvbSIsImF0b21Qb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJzb3VyY2VJbWFnZSIsImlzVG9wQXRvbSIsImRyYXdJbWFnZSIsIngiLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBdG9tQ2FudmFzTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIGFuIG9wdGltaXphdGlvbiB0aGF0IHVzZXMgYSBDYW52YXNOb2RlIHRvIGRyYXcgdGhlIGF0b21zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi8uLi9mcmljdGlvbi5qcyc7XHJcbmltcG9ydCBGcmljdGlvbkNvbnN0YW50cyBmcm9tICcuLi8uLi9GcmljdGlvbkNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgUEFSVElDTEVfSU1BR0VfU0laRSA9IDMyOyAvLyBwaXhlbHMsIHNxdWFyZVxyXG5jb25zdCBBVE9NX05PREVfTElORV9XSURUSCA9IDI7XHJcbmNvbnN0IEhJR0hMSUdIVF9GQUNUT1IgPSAwLjc7XHJcbmNvbnN0IEFUT01fU1RST0tFID0gJ2JsYWNrJztcclxuXHJcbi8vIGltYWdlIHNpemUgLSB0aGlzIGlzIHR3ZWFrZWQgc2xpZ2h0bHkgdG8gYWNjb3VudCBmb3Igc3Ryb2tlIGFuZCB0byBnZXQgYmVoYXZpb3IgdGhhdCBpcyBjb25zaXN0ZW50IHdpdGhcclxuLy8gcHJldmlvdXMgdmVyc2lvbnMgb2YgdGhlIHNpbVxyXG5jb25zdCBQQVJUSUNMRV9JTUFHRV9TSVpFX0ZPUl9SRU5ERVJJTkcgPSBGcmljdGlvbkNvbnN0YW50cy5BVE9NX1JBRElVUyAqIDIgKiAxLjI7XHJcbmNvbnN0IFBBUlRJQ0xFX1JFTkRFUklOR19PRkZTRVQgPSAtUEFSVElDTEVfSU1BR0VfU0laRV9GT1JfUkVOREVSSU5HIC8gMjtcclxuXHJcbmNsYXNzIEF0b21DYW52YXNOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbVtdfSBhdG9tc1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYXRvbXMsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIFNjZW5lcnkgaW1hZ2Ugbm9kZXMgdGhhdCB3aWxsIGJlIGRyYXduIG9udG8gdGhlIGNhbnZhcyBpbiBvcmRlciB0byByZW5kZXIgdGhlIGF0b21zXHJcbiAgICBjb25zdCB0b3BCb29rQXRvbU5vZGUgPSBuZXcgU2hhZGVkU3BoZXJlTm9kZSggUEFSVElDTEVfSU1BR0VfU0laRSwge1xyXG4gICAgICBtYWluQ29sb3I6IEZyaWN0aW9uQ29uc3RhbnRzLlRPUF9CT09LX0FUT01TX0NPTE9SLFxyXG4gICAgICBoaWdobGlnaHRDb2xvcjogRnJpY3Rpb25Db25zdGFudHMuVE9QX0JPT0tfQVRPTVNfQ09MT1IuY29sb3JVdGlsc0JyaWdodGVyKCBISUdITElHSFRfRkFDVE9SICksXHJcbiAgICAgIHN0cm9rZTogQVRPTV9TVFJPS0UsXHJcbiAgICAgIGxpbmVXaWR0aDogQVRPTV9OT0RFX0xJTkVfV0lEVEhcclxuICAgIH0gKTtcclxuICAgIHRvcEJvb2tBdG9tTm9kZS50b0NhbnZhcyggaW1hZ2UgPT4ge1xyXG4gICAgICB0aGlzLnRvcEJvb2tBdG9tSW1hZ2UgPSBpbWFnZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib3R0b21Cb29rQXRvbU5vZGUgPSBuZXcgU2hhZGVkU3BoZXJlTm9kZSggUEFSVElDTEVfSU1BR0VfU0laRSwge1xyXG4gICAgICBtYWluQ29sb3I6IEZyaWN0aW9uQ29uc3RhbnRzLkJPVFRPTV9CT09LX0FUT01TX0NPTE9SLFxyXG4gICAgICBoaWdobGlnaHRDb2xvcjogRnJpY3Rpb25Db25zdGFudHMuQk9UVE9NX0JPT0tfQVRPTVNfQ09MT1IuY29sb3JVdGlsc0JyaWdodGVyKCBISUdITElHSFRfRkFDVE9SICksXHJcbiAgICAgIHN0cm9rZTogQVRPTV9TVFJPS0UsXHJcbiAgICAgIGxpbmVXaWR0aDogQVRPTV9OT0RFX0xJTkVfV0lEVEhcclxuICAgIH0gKTtcclxuICAgIGJvdHRvbUJvb2tBdG9tTm9kZS50b0NhbnZhcyggaW1hZ2UgPT4ge1xyXG4gICAgICB0aGlzLmJvdHRvbUJvb2tBdG9tSW1hZ2UgPSBpbWFnZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXRvbVtdfSAtIGFycmF5IHRoYXQgaG9sZHMgdGhlIGF0b21zIHRvIGJlIHJlbmRlcmVkXHJcbiAgICB0aGlzLmF0b21zID0gYXRvbXM7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSByZXVzYWJsZSBwb3NpdGlvbiB2YWx1ZXMsIHNhdmVzIG1lbW9yeSBhbGxvY2F0aW9uc1xyXG4gICAgdGhpcy5heG9tUG9zaXRpb25YID0gMDtcclxuICAgIHRoaXMuYXRvbVBvc2l0aW9uWSA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogcGFpbnRzIHRoZSBwYXJ0aWNsZXMgb24gdGhlIGNhbnZhcyBub2RlXHJcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcclxuICAgKi9cclxuICBwYWludENhbnZhcyggY29udGV4dCApIHtcclxuXHJcbiAgICAvLyByZW5kZXIgZWFjaCBvZiB0aGUgYXRvbXMgdG8gdGhlIGNhbnZhc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5hdG9tcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYXRvbSA9IHRoaXMuYXRvbXNbIGkgXTtcclxuICAgICAgY29uc3QgYXRvbVBvc2l0aW9uID0gYXRvbS5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICBjb25zdCBzb3VyY2VJbWFnZSA9IGF0b20uaXNUb3BBdG9tID8gdGhpcy50b3BCb29rQXRvbUltYWdlIDogdGhpcy5ib3R0b21Cb29rQXRvbUltYWdlO1xyXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShcclxuICAgICAgICBzb3VyY2VJbWFnZSxcclxuICAgICAgICBhdG9tUG9zaXRpb24ueCArIFBBUlRJQ0xFX1JFTkRFUklOR19PRkZTRVQsXHJcbiAgICAgICAgYXRvbVBvc2l0aW9uLnkgKyBQQVJUSUNMRV9SRU5ERVJJTkdfT0ZGU0VULFxyXG4gICAgICAgIFBBUlRJQ0xFX0lNQUdFX1NJWkVfRk9SX1JFTkRFUklORyxcclxuICAgICAgICBQQVJUSUNMRV9JTUFHRV9TSVpFX0ZPUl9SRU5ERVJJTkdcclxuICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmZyaWN0aW9uLnJlZ2lzdGVyKCAnQXRvbUNhbnZhc05vZGUnLCBBdG9tQ2FudmFzTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXRvbUNhbnZhc05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLG9EQUFvRDtBQUNqRixTQUFTQyxVQUFVLFFBQVEsc0NBQXNDO0FBQ2pFLE9BQU9DLFFBQVEsTUFBTSxzQkFBc0I7QUFDM0MsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCOztBQUUxRDtBQUNBLE1BQU1DLG1CQUFtQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLE1BQU1DLG9CQUFvQixHQUFHLENBQUM7QUFDOUIsTUFBTUMsZ0JBQWdCLEdBQUcsR0FBRztBQUM1QixNQUFNQyxXQUFXLEdBQUcsT0FBTzs7QUFFM0I7QUFDQTtBQUNBLE1BQU1DLGlDQUFpQyxHQUFHTCxpQkFBaUIsQ0FBQ00sV0FBVyxHQUFHLENBQUMsR0FBRyxHQUFHO0FBQ2pGLE1BQU1DLHlCQUF5QixHQUFHLENBQUNGLGlDQUFpQyxHQUFHLENBQUM7QUFFeEUsTUFBTUcsY0FBYyxTQUFTVixVQUFVLENBQUM7RUFFdEM7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUc7SUFFNUIsS0FBSyxDQUFFQSxPQUFRLENBQUM7O0lBRWhCO0lBQ0EsTUFBTUMsZUFBZSxHQUFHLElBQUlmLGdCQUFnQixDQUFFSSxtQkFBbUIsRUFBRTtNQUNqRVksU0FBUyxFQUFFYixpQkFBaUIsQ0FBQ2Msb0JBQW9CO01BQ2pEQyxjQUFjLEVBQUVmLGlCQUFpQixDQUFDYyxvQkFBb0IsQ0FBQ0Usa0JBQWtCLENBQUViLGdCQUFpQixDQUFDO01BQzdGYyxNQUFNLEVBQUViLFdBQVc7TUFDbkJjLFNBQVMsRUFBRWhCO0lBQ2IsQ0FBRSxDQUFDO0lBQ0hVLGVBQWUsQ0FBQ08sUUFBUSxDQUFFQyxLQUFLLElBQUk7TUFDakMsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0QsS0FBSztJQUMvQixDQUFFLENBQUM7SUFFSCxNQUFNRSxrQkFBa0IsR0FBRyxJQUFJekIsZ0JBQWdCLENBQUVJLG1CQUFtQixFQUFFO01BQ3BFWSxTQUFTLEVBQUViLGlCQUFpQixDQUFDdUIsdUJBQXVCO01BQ3BEUixjQUFjLEVBQUVmLGlCQUFpQixDQUFDdUIsdUJBQXVCLENBQUNQLGtCQUFrQixDQUFFYixnQkFBaUIsQ0FBQztNQUNoR2MsTUFBTSxFQUFFYixXQUFXO01BQ25CYyxTQUFTLEVBQUVoQjtJQUNiLENBQUUsQ0FBQztJQUNIb0Isa0JBQWtCLENBQUNILFFBQVEsQ0FBRUMsS0FBSyxJQUFJO01BQ3BDLElBQUksQ0FBQ0ksbUJBQW1CLEdBQUdKLEtBQUs7SUFDbEMsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDVixLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDZSxhQUFhLEdBQUcsQ0FBQztJQUN0QixJQUFJLENBQUNDLGFBQWEsR0FBRyxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckI7SUFDQSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNuQixLQUFLLENBQUNvQixNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQzVDLE1BQU1FLElBQUksR0FBRyxJQUFJLENBQUNyQixLQUFLLENBQUVtQixDQUFDLENBQUU7TUFDNUIsTUFBTUcsWUFBWSxHQUFHRCxJQUFJLENBQUNFLGdCQUFnQixDQUFDQyxHQUFHLENBQUMsQ0FBQztNQUNoRCxNQUFNQyxXQUFXLEdBQUdKLElBQUksQ0FBQ0ssU0FBUyxHQUFHLElBQUksQ0FBQ2YsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDRyxtQkFBbUI7TUFDckZJLE9BQU8sQ0FBQ1MsU0FBUyxDQUNmRixXQUFXLEVBQ1hILFlBQVksQ0FBQ00sQ0FBQyxHQUFHL0IseUJBQXlCLEVBQzFDeUIsWUFBWSxDQUFDTyxDQUFDLEdBQUdoQyx5QkFBeUIsRUFDMUNGLGlDQUFpQyxFQUNqQ0EsaUNBQ0YsQ0FBQztJQUNIO0VBQ0Y7QUFDRjtBQUVBTixRQUFRLENBQUN5QyxRQUFRLENBQUUsZ0JBQWdCLEVBQUVoQyxjQUFlLENBQUM7QUFFckQsZUFBZUEsY0FBYyJ9