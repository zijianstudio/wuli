// Copyright 2013-2023, University of Colorado Boulder

/**
 * Container for cover of book.  Only used in BookNode.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import friction from '../../../friction.js';
import FrictionConstants from '../../FrictionConstants.js';

// constants
const FONT = new PhetFont(22);
const BINDING_LENGTH = 200; // dimension of the binding inline with the text of the book.
const BINDING_WIDTH = 30; // thickness of the book
const ROUND = 5;
const PAGES = 8;
const BOOK_COVER_WIDTH = 75; // How "wide" the book is, if you were looking at the cover of a book, the width of it.
const ANGLE = Math.PI / 12;
class CoverNode extends Node {
  /**
   * @param {string} title
   * @param {Tandem} tandemParent - not passed to Node and instrumented!
   * @param {Object} [options]
   */
  constructor(title, tandemParent, options) {
    options = merge({
      stroke: 'gray',
      color: 'black'
    }, options);
    super({
      x: options.x,
      y: options.y
    });

    // add white background for pages
    this.addChild(new Path(new Shape().moveTo(BINDING_LENGTH, 0).lineTo(BINDING_LENGTH + Math.cos(ANGLE) * BOOK_COVER_WIDTH, -Math.sin(ANGLE) * BOOK_COVER_WIDTH).lineTo(BINDING_LENGTH + Math.cos(ANGLE) * BOOK_COVER_WIDTH, BINDING_WIDTH + 2 - Math.sin(ANGLE) * BOOK_COVER_WIDTH - 2).lineTo(BINDING_LENGTH, BINDING_WIDTH - 1), {
      fill: 'white'
    }));
    const rightSideOfSpine = BINDING_LENGTH - ROUND / 2 + Math.cos(ANGLE) * BOOK_COVER_WIDTH;

    // add last page
    this.addChild(new Path(new Shape().moveTo(BINDING_LENGTH - ROUND / 2, BINDING_WIDTH).lineTo(rightSideOfSpine, BINDING_WIDTH - Math.sin(ANGLE) * BOOK_COVER_WIDTH), {
      stroke: options.stroke,
      lineWidth: 1,
      pickable: false
    }));

    // add front cover
    this.addChild(new Path(new Shape().moveTo(ROUND / 2, 0).lineTo(ROUND / 2 + Math.cos(ANGLE) * BOOK_COVER_WIDTH, -Math.sin(ANGLE) * BOOK_COVER_WIDTH).lineTo(rightSideOfSpine, -Math.sin(ANGLE) * BOOK_COVER_WIDTH).lineTo(BINDING_LENGTH - ROUND / 2, 0), {
      stroke: options.stroke,
      lineWidth: 1,
      fill: options.color
    }));

    // add binding, scaling the title to fit if necessary
    const bindingRectangle = new Rectangle(0, 0, BINDING_LENGTH, BINDING_WIDTH, ROUND, ROUND, {
      fill: options.color,
      stroke: options.stroke
    });
    this.addChild(bindingRectangle);
    const titleText = new Text(title, {
      font: FONT,
      fill: FrictionConstants.BOOK_TEXT_COLOR,
      pickable: false,
      maxWidth: BINDING_LENGTH * 0.97,
      // for a bit of margin
      tandem: tandemParent.createTandem('titleText'),
      boundsMethod: 'accurate'
    });
    titleText.center = bindingRectangle.center;

    // If updated via PhET-iO, recenter it
    titleText.boundsProperty.lazyLink(() => {
      titleText.center = bindingRectangle.center;
    });

    // add remaining pages
    for (let i = 0, dy = (BINDING_WIDTH - ROUND) / PAGES, dl = BOOK_COVER_WIDTH / 5, offset = 5; i < PAGES; i++) {
      const amplitude = BOOK_COVER_WIDTH - offset + dl * (Math.pow(1 / 2 - i / PAGES, 2) - 1 / 4);
      const x2 = BINDING_LENGTH + ROUND / 2 + Math.cos(ANGLE) * amplitude;
      const y2 = ROUND / 2 + dy * i - Math.sin(ANGLE) * amplitude;
      this.addChild(new Path(new Shape().moveTo(BINDING_LENGTH + ROUND / 2, ROUND / 2 + dy * i).lineTo(x2, y2), {
        stroke: 'gray',
        pickable: false
      }));
    }

    // Keep title on top, as a workaround for kn and km locales in https://github.com/phetsims/scenery/issues/1458
    this.addChild(titleText);
  }
}
friction.register('CoverNode', CoverNode);
export default CoverNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwiUGhldEZvbnQiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJmcmljdGlvbiIsIkZyaWN0aW9uQ29uc3RhbnRzIiwiRk9OVCIsIkJJTkRJTkdfTEVOR1RIIiwiQklORElOR19XSURUSCIsIlJPVU5EIiwiUEFHRVMiLCJCT09LX0NPVkVSX1dJRFRIIiwiQU5HTEUiLCJNYXRoIiwiUEkiLCJDb3Zlck5vZGUiLCJjb25zdHJ1Y3RvciIsInRpdGxlIiwidGFuZGVtUGFyZW50Iiwib3B0aW9ucyIsInN0cm9rZSIsImNvbG9yIiwieCIsInkiLCJhZGRDaGlsZCIsIm1vdmVUbyIsImxpbmVUbyIsImNvcyIsInNpbiIsImZpbGwiLCJyaWdodFNpZGVPZlNwaW5lIiwibGluZVdpZHRoIiwicGlja2FibGUiLCJiaW5kaW5nUmVjdGFuZ2xlIiwidGl0bGVUZXh0IiwiZm9udCIsIkJPT0tfVEVYVF9DT0xPUiIsIm1heFdpZHRoIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYm91bmRzTWV0aG9kIiwiY2VudGVyIiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsImkiLCJkeSIsImRsIiwib2Zmc2V0IiwiYW1wbGl0dWRlIiwicG93IiwieDIiLCJ5MiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ292ZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRhaW5lciBmb3IgY292ZXIgb2YgYm9vay4gIE9ubHkgdXNlZCBpbiBCb29rTm9kZS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZnJpY3Rpb24gZnJvbSAnLi4vLi4vLi4vZnJpY3Rpb24uanMnO1xyXG5pbXBvcnQgRnJpY3Rpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vRnJpY3Rpb25Db25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcbmNvbnN0IEJJTkRJTkdfTEVOR1RIID0gMjAwOyAvLyBkaW1lbnNpb24gb2YgdGhlIGJpbmRpbmcgaW5saW5lIHdpdGggdGhlIHRleHQgb2YgdGhlIGJvb2suXHJcbmNvbnN0IEJJTkRJTkdfV0lEVEggPSAzMDsgLy8gdGhpY2tuZXNzIG9mIHRoZSBib29rXHJcbmNvbnN0IFJPVU5EID0gNTtcclxuY29uc3QgUEFHRVMgPSA4O1xyXG5jb25zdCBCT09LX0NPVkVSX1dJRFRIID0gNzU7IC8vIEhvdyBcIndpZGVcIiB0aGUgYm9vayBpcywgaWYgeW91IHdlcmUgbG9va2luZyBhdCB0aGUgY292ZXIgb2YgYSBib29rLCB0aGUgd2lkdGggb2YgaXQuXHJcbmNvbnN0IEFOR0xFID0gTWF0aC5QSSAvIDEyO1xyXG5cclxuY2xhc3MgQ292ZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1QYXJlbnQgLSBub3QgcGFzc2VkIHRvIE5vZGUgYW5kIGluc3RydW1lbnRlZCFcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRpdGxlLCB0YW5kZW1QYXJlbnQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICBjb2xvcjogJ2JsYWNrJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB7IHg6IG9wdGlvbnMueCwgeTogb3B0aW9ucy55IH0gKTtcclxuXHJcbiAgICAvLyBhZGQgd2hpdGUgYmFja2dyb3VuZCBmb3IgcGFnZXNcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAubW92ZVRvKCBCSU5ESU5HX0xFTkdUSCwgMCApXHJcbiAgICAgIC5saW5lVG8oIEJJTkRJTkdfTEVOR1RIICsgTWF0aC5jb3MoIEFOR0xFICkgKiBCT09LX0NPVkVSX1dJRFRILCAtTWF0aC5zaW4oIEFOR0xFICkgKiBCT09LX0NPVkVSX1dJRFRIIClcclxuICAgICAgLmxpbmVUbyggQklORElOR19MRU5HVEggKyBNYXRoLmNvcyggQU5HTEUgKSAqIEJPT0tfQ09WRVJfV0lEVEgsIEJJTkRJTkdfV0lEVEggKyAyIC0gTWF0aC5zaW4oIEFOR0xFICkgKiBCT09LX0NPVkVSX1dJRFRIIC0gMiApXHJcbiAgICAgIC5saW5lVG8oIEJJTkRJTkdfTEVOR1RILCBCSU5ESU5HX1dJRFRIIC0gMSApLCB7XHJcbiAgICAgIGZpbGw6ICd3aGl0ZSdcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IHJpZ2h0U2lkZU9mU3BpbmUgPSBCSU5ESU5HX0xFTkdUSCAtIFJPVU5EIC8gMiArIE1hdGguY29zKCBBTkdMRSApICogQk9PS19DT1ZFUl9XSURUSDtcclxuXHJcbiAgICAvLyBhZGQgbGFzdCBwYWdlXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggQklORElOR19MRU5HVEggLSBST1VORCAvIDIsIEJJTkRJTkdfV0lEVEggKVxyXG4gICAgICAubGluZVRvKCByaWdodFNpZGVPZlNwaW5lLCBCSU5ESU5HX1dJRFRIIC0gTWF0aC5zaW4oIEFOR0xFICkgKiBCT09LX0NPVkVSX1dJRFRIICksIHtcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIGFkZCBmcm9udCBjb3ZlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIFJPVU5EIC8gMiwgMCApXHJcbiAgICAgIC5saW5lVG8oIFJPVU5EIC8gMiArIE1hdGguY29zKCBBTkdMRSApICogQk9PS19DT1ZFUl9XSURUSCwgLU1hdGguc2luKCBBTkdMRSApICogQk9PS19DT1ZFUl9XSURUSCApXHJcbiAgICAgIC5saW5lVG8oIHJpZ2h0U2lkZU9mU3BpbmUsIC1NYXRoLnNpbiggQU5HTEUgKSAqIEJPT0tfQ09WRVJfV0lEVEggKVxyXG4gICAgICAubGluZVRvKCBCSU5ESU5HX0xFTkdUSCAtIFJPVU5EIC8gMiwgMCApLCB7XHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgZmlsbDogb3B0aW9ucy5jb2xvclxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gYWRkIGJpbmRpbmcsIHNjYWxpbmcgdGhlIHRpdGxlIHRvIGZpdCBpZiBuZWNlc3NhcnlcclxuICAgIGNvbnN0IGJpbmRpbmdSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBCSU5ESU5HX0xFTkdUSCwgQklORElOR19XSURUSCwgUk9VTkQsIFJPVU5ELCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJpbmRpbmdSZWN0YW5nbGUgKTtcclxuXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggdGl0bGUsIHtcclxuICAgICAgZm9udDogRk9OVCxcclxuICAgICAgZmlsbDogRnJpY3Rpb25Db25zdGFudHMuQk9PS19URVhUX0NPTE9SLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIG1heFdpZHRoOiBCSU5ESU5HX0xFTkdUSCAqIDAuOTcsIC8vIGZvciBhIGJpdCBvZiBtYXJnaW5cclxuICAgICAgdGFuZGVtOiB0YW5kZW1QYXJlbnQuY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApLFxyXG4gICAgICBib3VuZHNNZXRob2Q6ICdhY2N1cmF0ZSdcclxuICAgIH0gKTtcclxuICAgIHRpdGxlVGV4dC5jZW50ZXIgPSBiaW5kaW5nUmVjdGFuZ2xlLmNlbnRlcjtcclxuXHJcbiAgICAvLyBJZiB1cGRhdGVkIHZpYSBQaEVULWlPLCByZWNlbnRlciBpdFxyXG4gICAgdGl0bGVUZXh0LmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRpdGxlVGV4dC5jZW50ZXIgPSBiaW5kaW5nUmVjdGFuZ2xlLmNlbnRlcjtcclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgLy8gYWRkIHJlbWFpbmluZyBwYWdlc1xyXG4gICAgZm9yICggbGV0IGkgPSAwLCBkeSA9ICggQklORElOR19XSURUSCAtIFJPVU5EICkgLyBQQUdFUywgZGwgPSBCT09LX0NPVkVSX1dJRFRIIC8gNSwgb2Zmc2V0ID0gNTsgaSA8IFBBR0VTOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGFtcGxpdHVkZSA9ICggQk9PS19DT1ZFUl9XSURUSCAtIG9mZnNldCArIGRsICogKCBNYXRoLnBvdyggMSAvIDIgLSBpIC8gUEFHRVMsIDIgKSAtIDEgLyA0ICkgKTtcclxuICAgICAgY29uc3QgeDIgPSBCSU5ESU5HX0xFTkdUSCArIFJPVU5EIC8gMiArIE1hdGguY29zKCBBTkdMRSApICogYW1wbGl0dWRlO1xyXG4gICAgICBjb25zdCB5MiA9IFJPVU5EIC8gMiArIGR5ICogaSAtIE1hdGguc2luKCBBTkdMRSApICogYW1wbGl0dWRlO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgICAgIC5tb3ZlVG8oIEJJTkRJTkdfTEVOR1RIICsgUk9VTkQgLyAyLCBST1VORCAvIDIgKyBkeSAqIGkgKVxyXG4gICAgICAgICAgLmxpbmVUbyggeDIsIHkyICksIHtcclxuICAgICAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2VlcCB0aXRsZSBvbiB0b3AsIGFzIGEgd29ya2Fyb3VuZCBmb3Iga24gYW5kIGttIGxvY2FsZXMgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE0NThcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpdGxlVGV4dCApO1xyXG4gIH1cclxufVxyXG5cclxuZnJpY3Rpb24ucmVnaXN0ZXIoICdDb3Zlck5vZGUnLCBDb3Zlck5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvdmVyTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsS0FBSyxNQUFNLHNDQUFzQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDbEYs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