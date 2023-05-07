// Copyright 2016-2023, University of Colorado Boulder

/**
 * Different methods of detection of text bounds.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import { CanvasContextWrapper, Font, scenery, svgns, Utils } from '../imports.js';

// @private {string} - ID for a container for our SVG test element (determined to find the size of text elements with SVG)
const TEXT_SIZE_CONTAINER_ID = 'sceneryTextSizeContainer';

// @private {string} - ID for our SVG test element (determined to find the size of text elements with SVG)
const TEXT_SIZE_ELEMENT_ID = 'sceneryTextSizeElement';

// @private {SVGElement} - Container for our SVG test element (determined to find the size of text elements with SVG)
let svgTextSizeContainer;

// @private {SVGElement} - Test SVG element (determined to find the size of text elements with SVG)
let svgTextSizeElement;

// Maps CSS {string} => {Bounds2}, so that we can cache the vertical font sizes outside of the Font objects themselves.
const hybridFontVerticalCache = {};
let deliveredWarning = false;
const TextBounds = {
  /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font and renderedText.
   * @public
   *
   * This method uses an SVG Text element, sets its text, and then determines its size to estimate the size of rendered text.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {Bounds2}
   */
  approximateSVGBounds(font, renderedText) {
    assert && assert(font instanceof Font, 'Font required');
    assert && assert(typeof renderedText === 'string', 'renderedText required');
    if (!svgTextSizeContainer.parentNode) {
      if (document.body) {
        document.body.appendChild(svgTextSizeContainer);
      } else {
        throw new Error('No document.body and trying to get approximate SVG bounds of a Text node');
      }
    }
    TextBounds.setSVGTextAttributes(svgTextSizeElement, font, renderedText);
    const rect = svgTextSizeElement.getBBox();
    if (rect.width === 0 && rect.height === 0 && renderedText.length > 0) {
      if (!deliveredWarning) {
        deliveredWarning = true;
        console.log('WARNING: Guessing text bounds, is the simulation hidden? See https://github.com/phetsims/chipper/issues/768');
      }
      return TextBounds.guessSVGBounds(font, renderedText);
    }
    return new Bounds2(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
  },
  /**
   * Returns a guess for what the SVG bounds of a font would be, based on PhetFont as an example.
   * @public
   *
   * @param {Font} font
   * @param {string} renderedText
   * @returns {Bounds2}
   */
  guessSVGBounds(font, renderedText) {
    const px = font.getNumericSize();
    const isBold = font.weight === 'bold';

    // Our best guess, based on PhetFont in macOS Chrome. Things may differ, but hopefully this approximation
    // is useful.
    return new Bounds2(0, -0.9 * px, (isBold ? 0.435 : 0.4) * px * renderedText.length, 0.22 * px);
  },
  /**
   * Returns a new Bounds2 that is the approximate bounds of the specified Text node.
   * @public
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {scenery.Text} text - The Text node
   * @returns {Bounds2}
   */
  accurateCanvasBounds(text) {
    const context = scenery.scratchContext;
    context.font = text._font.toCSS();
    context.direction = 'ltr';
    const metrics = context.measureText(text.renderedText);
    return new Bounds2(-metrics.actualBoundingBoxLeft, -metrics.actualBoundingBoxAscent, metrics.actualBoundingBoxRight, metrics.actualBoundingBoxDescent);
  },
  /**
   * Returns a new Bounds2 that is the approximate bounds of the specified Text node.
   * @public
   *
   * This method repeatedly renders the text into a Canvas and checks for what pixels are filled. Iteratively doing this for each bound
   * (top/left/bottom/right) until a tolerance results in very accurate bounds of what is displayed.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {scenery.Text} text - The Text node
   * @returns {Bounds2}
   */
  accurateCanvasBoundsFallback(text) {
    // this seems to be slower than expected, mostly due to Font getters
    const svgBounds = TextBounds.approximateSVGBounds(text._font, text.renderedText);

    //If svgBounds are zero, then return the zero bounds
    if (!text.renderedText.length || svgBounds.width === 0) {
      return svgBounds;
    }

    // NOTE: should return new instance, so that it can be mutated later
    const accurateBounds = Utils.canvasAccurateBounds(context => {
      context.font = text._font.toCSS();
      context.direction = 'ltr';
      context.fillText(text.renderedText, 0, 0);
      if (text.hasPaintableStroke()) {
        const fakeWrapper = new CanvasContextWrapper(null, context);
        text.beforeCanvasStroke(fakeWrapper);
        context.strokeText(text.renderedText, 0, 0);
        text.afterCanvasStroke(fakeWrapper);
      }
    }, {
      precision: 0.5,
      resolution: 128,
      initialScale: 32 / Math.max(Math.abs(svgBounds.minX), Math.abs(svgBounds.minY), Math.abs(svgBounds.maxX), Math.abs(svgBounds.maxY))
    });
    // Try falling back to SVG bounds if our accurate bounds are not finite
    return accurateBounds.isFinite() ? accurateBounds : svgBounds;
  },
  /**
   * Returns a possibly-cached (treat as immutable) Bounds2 for use mainly for vertical parameters, given a specific Font.
   * @public
   *
   * Uses SVG bounds determination for this value.
   *
   * @param {Font} font - The font of the text
   * @returns {Bounds2}
   */
  getVerticalBounds(font) {
    assert && assert(font instanceof Font, 'Font required');
    const css = font.toCSS();

    // Cache these, as it's more expensive
    let verticalBounds = hybridFontVerticalCache[css];
    if (!verticalBounds) {
      verticalBounds = hybridFontVerticalCache[css] = TextBounds.approximateSVGBounds(font, 'm');
    }
    return verticalBounds;
  },
  /**
   * Returns an approximate width for text, determined by using Canvas' measureText().
   * @public
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {number}
   */
  approximateCanvasWidth(font, renderedText) {
    assert && assert(font instanceof Font, 'Font required');
    assert && assert(typeof renderedText === 'string', 'renderedText required');
    const context = scenery.scratchContext;
    context.font = font.toCSS();
    context.direction = 'ltr';
    return context.measureText(renderedText).width;
  },
  /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font and renderedText.
   * @public
   *
   * This method uses a hybrid approach, using SVG measurement to determine the height, but using Canvas to determine the width.
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   * @returns {Bounds2}
   */
  approximateHybridBounds(font, renderedText) {
    assert && assert(font instanceof Font, 'Font required');
    assert && assert(typeof renderedText === 'string', 'renderedText required');
    const verticalBounds = TextBounds.getVerticalBounds(font);
    const canvasWidth = TextBounds.approximateCanvasWidth(font, renderedText);

    // it seems that SVG bounds generally have x=0, so we hard code that here
    return new Bounds2(0, verticalBounds.minY, canvasWidth, verticalBounds.maxY);
  },
  /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font, given a DOM element
   * @public
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {Element} element - DOM element created for the text. This is required, as the text handles HTML and non-HTML text differently.
   * @returns {Bounds2}
   */
  approximateDOMBounds(font, element) {
    assert && assert(font instanceof Font, 'Font required');
    const maxHeight = 1024; // technically this will fail if the font is taller than this!

    // <div style="position: absolute; left: 0; top: 0; padding: 0 !important; margin: 0 !important;"><span id="baselineSpan" style="font-family: Verdana; font-size: 25px;">QuipTaQiy</span><div style="vertical-align: baseline; display: inline-block; width: 0; height: 500px; margin: 0 important!; padding: 0 important!;"></div></div>

    const div = document.createElement('div');
    $(div).css({
      position: 'absolute',
      left: 0,
      top: 0,
      padding: '0 !important',
      margin: '0 !important',
      display: 'hidden'
    });
    const span = document.createElement('span');
    $(span).css('font', font.toCSS());
    span.appendChild(element);
    span.setAttribute('direction', 'ltr');
    const fakeImage = document.createElement('div');
    $(fakeImage).css({
      'vertical-align': 'baseline',
      display: 'inline-block',
      width: 0,
      height: `${maxHeight}px`,
      margin: '0 !important',
      padding: '0 !important'
    });
    div.appendChild(span);
    div.appendChild(fakeImage);
    document.body.appendChild(div);
    const rect = span.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    // add 1 pixel to rect.right to prevent HTML text wrapping
    const result = new Bounds2(rect.left, rect.top - maxHeight, rect.right + 1, rect.bottom - maxHeight).shiftedXY(-divRect.left, -divRect.top);
    document.body.removeChild(div);
    return result;
  },
  /**
   * Returns a new Bounds2 that is the approximate bounds of a Text node displayed with the specified font, given a DOM element
   * @public
   *
   * TODO: Can we use this? What are the differences?
   *
   * NOTE: Calling code relies on the new Bounds2 instance, as they mutate it.
   *
   * @param {Font} font - The font of the text
   * @param {Element} element - DOM element created for the text. This is required, as the text handles HTML and non-HTML text differently.
   * @returns {Bounds2}
   */
  approximateImprovedDOMBounds(font, element) {
    assert && assert(font instanceof Font, 'Font required');

    // TODO: reuse this div?
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.font = font.toCSS();
    div.style.color = 'transparent';
    div.style.padding = '0 !important';
    div.style.margin = '0 !important';
    div.style.position = 'absolute';
    div.style.left = '0';
    div.style.top = '0';
    div.setAttribute('direction', 'ltr');
    div.appendChild(element);
    document.body.appendChild(div);
    const bounds = new Bounds2(div.offsetLeft, div.offsetTop, div.offsetLeft + div.offsetWidth + 1, div.offsetTop + div.offsetHeight + 1);
    document.body.removeChild(div);

    // Compensate for the baseline alignment
    const verticalBounds = TextBounds.getVerticalBounds(font);
    return bounds.shiftedY(verticalBounds.minY);
  },
  /**
   * Modifies an SVG text element's properties to match the specified font and text.
   * @public
   *
   * @param {SVGTextElement} textElement
   * @param {Font} font - The font of the text
   * @param {string} renderedText - Text to display (with any special characters replaced)
   */
  setSVGTextAttributes(textElement, font, renderedText) {
    assert && assert(font instanceof Font, 'Font required');
    assert && assert(typeof renderedText === 'string', 'renderedText required');
    textElement.setAttribute('direction', 'ltr');
    textElement.setAttribute('font-family', font.getFamily());
    textElement.setAttribute('font-size', font.getSize());
    textElement.setAttribute('font-style', font.getStyle());
    textElement.setAttribute('font-weight', font.getWeight());
    textElement.setAttribute('font-stretch', font.getStretch());
    textElement.lastChild.nodeValue = renderedText;
  },
  /**
   * Initializes containers and elements required for SVG text measurement.
   * @public
   */
  initializeTextBounds() {
    svgTextSizeContainer = document.getElementById(TEXT_SIZE_CONTAINER_ID);
    if (!svgTextSizeContainer) {
      // set up the container and text for testing text bounds quickly (using approximateSVGBounds)
      svgTextSizeContainer = document.createElementNS(svgns, 'svg');
      svgTextSizeContainer.setAttribute('width', '2');
      svgTextSizeContainer.setAttribute('height', '2');
      svgTextSizeContainer.setAttribute('id', TEXT_SIZE_CONTAINER_ID);
      svgTextSizeContainer.setAttribute('style', 'visibility: hidden; pointer-events: none; position: absolute; left: -65535px; right: -65535px;'); // so we don't flash it in a visible way to the user
    }

    svgTextSizeElement = document.getElementById(TEXT_SIZE_ELEMENT_ID);

    // NOTE! copies createSVGElement
    if (!svgTextSizeElement) {
      svgTextSizeElement = document.createElementNS(svgns, 'text');
      svgTextSizeElement.appendChild(document.createTextNode(''));
      svgTextSizeElement.setAttribute('dominant-baseline', 'alphabetic'); // to match Canvas right now
      svgTextSizeElement.setAttribute('text-rendering', 'geometricPrecision');
      svgTextSizeElement.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
      svgTextSizeElement.setAttribute('id', TEXT_SIZE_ELEMENT_ID);
      svgTextSizeContainer.appendChild(svgTextSizeElement);
    }
  }
};
scenery.register('TextBounds', TextBounds);
export default TextBounds;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiQ2FudmFzQ29udGV4dFdyYXBwZXIiLCJGb250Iiwic2NlbmVyeSIsInN2Z25zIiwiVXRpbHMiLCJURVhUX1NJWkVfQ09OVEFJTkVSX0lEIiwiVEVYVF9TSVpFX0VMRU1FTlRfSUQiLCJzdmdUZXh0U2l6ZUNvbnRhaW5lciIsInN2Z1RleHRTaXplRWxlbWVudCIsImh5YnJpZEZvbnRWZXJ0aWNhbENhY2hlIiwiZGVsaXZlcmVkV2FybmluZyIsIlRleHRCb3VuZHMiLCJhcHByb3hpbWF0ZVNWR0JvdW5kcyIsImZvbnQiLCJyZW5kZXJlZFRleHQiLCJhc3NlcnQiLCJwYXJlbnROb2RlIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJFcnJvciIsInNldFNWR1RleHRBdHRyaWJ1dGVzIiwicmVjdCIsImdldEJCb3giLCJ3aWR0aCIsImhlaWdodCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJndWVzc1NWR0JvdW5kcyIsIngiLCJ5IiwicHgiLCJnZXROdW1lcmljU2l6ZSIsImlzQm9sZCIsIndlaWdodCIsImFjY3VyYXRlQ2FudmFzQm91bmRzIiwidGV4dCIsImNvbnRleHQiLCJzY3JhdGNoQ29udGV4dCIsIl9mb250IiwidG9DU1MiLCJkaXJlY3Rpb24iLCJtZXRyaWNzIiwibWVhc3VyZVRleHQiLCJhY3R1YWxCb3VuZGluZ0JveExlZnQiLCJhY3R1YWxCb3VuZGluZ0JveEFzY2VudCIsImFjdHVhbEJvdW5kaW5nQm94UmlnaHQiLCJhY3R1YWxCb3VuZGluZ0JveERlc2NlbnQiLCJhY2N1cmF0ZUNhbnZhc0JvdW5kc0ZhbGxiYWNrIiwic3ZnQm91bmRzIiwiYWNjdXJhdGVCb3VuZHMiLCJjYW52YXNBY2N1cmF0ZUJvdW5kcyIsImZpbGxUZXh0IiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwiZmFrZVdyYXBwZXIiLCJiZWZvcmVDYW52YXNTdHJva2UiLCJzdHJva2VUZXh0IiwiYWZ0ZXJDYW52YXNTdHJva2UiLCJwcmVjaXNpb24iLCJyZXNvbHV0aW9uIiwiaW5pdGlhbFNjYWxlIiwiTWF0aCIsIm1heCIsImFicyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJpc0Zpbml0ZSIsImdldFZlcnRpY2FsQm91bmRzIiwiY3NzIiwidmVydGljYWxCb3VuZHMiLCJhcHByb3hpbWF0ZUNhbnZhc1dpZHRoIiwiYXBwcm94aW1hdGVIeWJyaWRCb3VuZHMiLCJjYW52YXNXaWR0aCIsImFwcHJveGltYXRlRE9NQm91bmRzIiwiZWxlbWVudCIsIm1heEhlaWdodCIsImRpdiIsImNyZWF0ZUVsZW1lbnQiLCIkIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwicGFkZGluZyIsIm1hcmdpbiIsImRpc3BsYXkiLCJzcGFuIiwic2V0QXR0cmlidXRlIiwiZmFrZUltYWdlIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiZGl2UmVjdCIsInJlc3VsdCIsInJpZ2h0IiwiYm90dG9tIiwic2hpZnRlZFhZIiwicmVtb3ZlQ2hpbGQiLCJhcHByb3hpbWF0ZUltcHJvdmVkRE9NQm91bmRzIiwic3R5bGUiLCJjb2xvciIsImJvdW5kcyIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJvZmZzZXRXaWR0aCIsIm9mZnNldEhlaWdodCIsInNoaWZ0ZWRZIiwidGV4dEVsZW1lbnQiLCJnZXRGYW1pbHkiLCJnZXRTaXplIiwiZ2V0U3R5bGUiLCJnZXRXZWlnaHQiLCJnZXRTdHJldGNoIiwibGFzdENoaWxkIiwibm9kZVZhbHVlIiwiaW5pdGlhbGl6ZVRleHRCb3VuZHMiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0ZVRleHROb2RlIiwic2V0QXR0cmlidXRlTlMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRleHRCb3VuZHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlmZmVyZW50IG1ldGhvZHMgb2YgZGV0ZWN0aW9uIG9mIHRleHQgYm91bmRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgRm9udCwgc2NlbmVyeSwgc3ZnbnMsIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBAcHJpdmF0ZSB7c3RyaW5nfSAtIElEIGZvciBhIGNvbnRhaW5lciBmb3Igb3VyIFNWRyB0ZXN0IGVsZW1lbnQgKGRldGVybWluZWQgdG8gZmluZCB0aGUgc2l6ZSBvZiB0ZXh0IGVsZW1lbnRzIHdpdGggU1ZHKVxyXG5jb25zdCBURVhUX1NJWkVfQ09OVEFJTkVSX0lEID0gJ3NjZW5lcnlUZXh0U2l6ZUNvbnRhaW5lcic7XHJcblxyXG4vLyBAcHJpdmF0ZSB7c3RyaW5nfSAtIElEIGZvciBvdXIgU1ZHIHRlc3QgZWxlbWVudCAoZGV0ZXJtaW5lZCB0byBmaW5kIHRoZSBzaXplIG9mIHRleHQgZWxlbWVudHMgd2l0aCBTVkcpXHJcbmNvbnN0IFRFWFRfU0laRV9FTEVNRU5UX0lEID0gJ3NjZW5lcnlUZXh0U2l6ZUVsZW1lbnQnO1xyXG5cclxuLy8gQHByaXZhdGUge1NWR0VsZW1lbnR9IC0gQ29udGFpbmVyIGZvciBvdXIgU1ZHIHRlc3QgZWxlbWVudCAoZGV0ZXJtaW5lZCB0byBmaW5kIHRoZSBzaXplIG9mIHRleHQgZWxlbWVudHMgd2l0aCBTVkcpXHJcbmxldCBzdmdUZXh0U2l6ZUNvbnRhaW5lcjtcclxuXHJcbi8vIEBwcml2YXRlIHtTVkdFbGVtZW50fSAtIFRlc3QgU1ZHIGVsZW1lbnQgKGRldGVybWluZWQgdG8gZmluZCB0aGUgc2l6ZSBvZiB0ZXh0IGVsZW1lbnRzIHdpdGggU1ZHKVxyXG5sZXQgc3ZnVGV4dFNpemVFbGVtZW50O1xyXG5cclxuLy8gTWFwcyBDU1Mge3N0cmluZ30gPT4ge0JvdW5kczJ9LCBzbyB0aGF0IHdlIGNhbiBjYWNoZSB0aGUgdmVydGljYWwgZm9udCBzaXplcyBvdXRzaWRlIG9mIHRoZSBGb250IG9iamVjdHMgdGhlbXNlbHZlcy5cclxuY29uc3QgaHlicmlkRm9udFZlcnRpY2FsQ2FjaGUgPSB7fTtcclxuXHJcbmxldCBkZWxpdmVyZWRXYXJuaW5nID0gZmFsc2U7XHJcblxyXG5jb25zdCBUZXh0Qm91bmRzID0ge1xyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiB0aGF0IGlzIHRoZSBhcHByb3hpbWF0ZSBib3VuZHMgb2YgYSBUZXh0IG5vZGUgZGlzcGxheWVkIHdpdGggdGhlIHNwZWNpZmllZCBmb250IGFuZCByZW5kZXJlZFRleHQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBtZXRob2QgdXNlcyBhbiBTVkcgVGV4dCBlbGVtZW50LCBzZXRzIGl0cyB0ZXh0LCBhbmQgdGhlbiBkZXRlcm1pbmVzIGl0cyBzaXplIHRvIGVzdGltYXRlIHRoZSBzaXplIG9mIHJlbmRlcmVkIHRleHQuXHJcbiAgICpcclxuICAgKiBOT1RFOiBDYWxsaW5nIGNvZGUgcmVsaWVzIG9uIHRoZSBuZXcgQm91bmRzMiBpbnN0YW5jZSwgYXMgdGhleSBtdXRhdGUgaXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZW5kZXJlZFRleHQgLSBUZXh0IHRvIGRpc3BsYXkgKHdpdGggYW55IHNwZWNpYWwgY2hhcmFjdGVycyByZXBsYWNlZClcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBhcHByb3hpbWF0ZVNWR0JvdW5kcyggZm9udCwgcmVuZGVyZWRUZXh0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZm9udCBpbnN0YW5jZW9mIEZvbnQsICdGb250IHJlcXVpcmVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHJlbmRlcmVkVGV4dCA9PT0gJ3N0cmluZycsICdyZW5kZXJlZFRleHQgcmVxdWlyZWQnICk7XHJcblxyXG4gICAgaWYgKCAhc3ZnVGV4dFNpemVDb250YWluZXIucGFyZW50Tm9kZSApIHtcclxuICAgICAgaWYgKCBkb2N1bWVudC5ib2R5ICkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHN2Z1RleHRTaXplQ29udGFpbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTm8gZG9jdW1lbnQuYm9keSBhbmQgdHJ5aW5nIHRvIGdldCBhcHByb3hpbWF0ZSBTVkcgYm91bmRzIG9mIGEgVGV4dCBub2RlJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBUZXh0Qm91bmRzLnNldFNWR1RleHRBdHRyaWJ1dGVzKCBzdmdUZXh0U2l6ZUVsZW1lbnQsIGZvbnQsIHJlbmRlcmVkVGV4dCApO1xyXG4gICAgY29uc3QgcmVjdCA9IHN2Z1RleHRTaXplRWxlbWVudC5nZXRCQm94KCk7XHJcblxyXG4gICAgaWYgKCByZWN0LndpZHRoID09PSAwICYmIHJlY3QuaGVpZ2h0ID09PSAwICYmIHJlbmRlcmVkVGV4dC5sZW5ndGggPiAwICkge1xyXG4gICAgICBpZiAoICFkZWxpdmVyZWRXYXJuaW5nICkge1xyXG4gICAgICAgIGRlbGl2ZXJlZFdhcm5pbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyggJ1dBUk5JTkc6IEd1ZXNzaW5nIHRleHQgYm91bmRzLCBpcyB0aGUgc2ltdWxhdGlvbiBoaWRkZW4/IFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNzY4JyApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBUZXh0Qm91bmRzLmd1ZXNzU1ZHQm91bmRzKCBmb250LCByZW5kZXJlZFRleHQgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIHJlY3QueCwgcmVjdC55LCByZWN0LnggKyByZWN0LndpZHRoLCByZWN0LnkgKyByZWN0LmhlaWdodCApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBndWVzcyBmb3Igd2hhdCB0aGUgU1ZHIGJvdW5kcyBvZiBhIGZvbnQgd291bGQgYmUsIGJhc2VkIG9uIFBoZXRGb250IGFzIGFuIGV4YW1wbGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGb250fSBmb250XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlbmRlcmVkVGV4dFxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGd1ZXNzU1ZHQm91bmRzKCBmb250LCByZW5kZXJlZFRleHQgKSB7XHJcbiAgICBjb25zdCBweCA9IGZvbnQuZ2V0TnVtZXJpY1NpemUoKTtcclxuICAgIGNvbnN0IGlzQm9sZCA9IGZvbnQud2VpZ2h0ID09PSAnYm9sZCc7XHJcblxyXG4gICAgLy8gT3VyIGJlc3QgZ3Vlc3MsIGJhc2VkIG9uIFBoZXRGb250IGluIG1hY09TIENocm9tZS4gVGhpbmdzIG1heSBkaWZmZXIsIGJ1dCBob3BlZnVsbHkgdGhpcyBhcHByb3hpbWF0aW9uXHJcbiAgICAvLyBpcyB1c2VmdWwuXHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIDAsIC0wLjkgKiBweCwgKCBpc0JvbGQgPyAwLjQzNSA6IDAuNCApICogcHggKiByZW5kZXJlZFRleHQubGVuZ3RoLCAwLjIyICogcHggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgdGhhdCBpcyB0aGUgYXBwcm94aW1hdGUgYm91bmRzIG9mIHRoZSBzcGVjaWZpZWQgVGV4dCBub2RlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c2NlbmVyeS5UZXh0fSB0ZXh0IC0gVGhlIFRleHQgbm9kZVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGFjY3VyYXRlQ2FudmFzQm91bmRzKCB0ZXh0ICkge1xyXG4gICAgY29uc3QgY29udGV4dCA9IHNjZW5lcnkuc2NyYXRjaENvbnRleHQ7XHJcbiAgICBjb250ZXh0LmZvbnQgPSB0ZXh0Ll9mb250LnRvQ1NTKCk7XHJcbiAgICBjb250ZXh0LmRpcmVjdGlvbiA9ICdsdHInO1xyXG4gICAgY29uc3QgbWV0cmljcyA9IGNvbnRleHQubWVhc3VyZVRleHQoIHRleHQucmVuZGVyZWRUZXh0ICk7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoXHJcbiAgICAgIC1tZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94TGVmdCxcclxuICAgICAgLW1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQsXHJcbiAgICAgIG1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hSaWdodCxcclxuICAgICAgbWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveERlc2NlbnRcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIHRoYXQgaXMgdGhlIGFwcHJveGltYXRlIGJvdW5kcyBvZiB0aGUgc3BlY2lmaWVkIFRleHQgbm9kZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCByZXBlYXRlZGx5IHJlbmRlcnMgdGhlIHRleHQgaW50byBhIENhbnZhcyBhbmQgY2hlY2tzIGZvciB3aGF0IHBpeGVscyBhcmUgZmlsbGVkLiBJdGVyYXRpdmVseSBkb2luZyB0aGlzIGZvciBlYWNoIGJvdW5kXHJcbiAgICogKHRvcC9sZWZ0L2JvdHRvbS9yaWdodCkgdW50aWwgYSB0b2xlcmFuY2UgcmVzdWx0cyBpbiB2ZXJ5IGFjY3VyYXRlIGJvdW5kcyBvZiB3aGF0IGlzIGRpc3BsYXllZC5cclxuICAgKlxyXG4gICAqIE5PVEU6IENhbGxpbmcgY29kZSByZWxpZXMgb24gdGhlIG5ldyBCb3VuZHMyIGluc3RhbmNlLCBhcyB0aGV5IG11dGF0ZSBpdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c2NlbmVyeS5UZXh0fSB0ZXh0IC0gVGhlIFRleHQgbm9kZVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2soIHRleHQgKSB7XHJcbiAgICAvLyB0aGlzIHNlZW1zIHRvIGJlIHNsb3dlciB0aGFuIGV4cGVjdGVkLCBtb3N0bHkgZHVlIHRvIEZvbnQgZ2V0dGVyc1xyXG4gICAgY29uc3Qgc3ZnQm91bmRzID0gVGV4dEJvdW5kcy5hcHByb3hpbWF0ZVNWR0JvdW5kcyggdGV4dC5fZm9udCwgdGV4dC5yZW5kZXJlZFRleHQgKTtcclxuXHJcbiAgICAvL0lmIHN2Z0JvdW5kcyBhcmUgemVybywgdGhlbiByZXR1cm4gdGhlIHplcm8gYm91bmRzXHJcbiAgICBpZiAoICF0ZXh0LnJlbmRlcmVkVGV4dC5sZW5ndGggfHwgc3ZnQm91bmRzLndpZHRoID09PSAwICkge1xyXG4gICAgICByZXR1cm4gc3ZnQm91bmRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE5PVEU6IHNob3VsZCByZXR1cm4gbmV3IGluc3RhbmNlLCBzbyB0aGF0IGl0IGNhbiBiZSBtdXRhdGVkIGxhdGVyXHJcbiAgICBjb25zdCBhY2N1cmF0ZUJvdW5kcyA9IFV0aWxzLmNhbnZhc0FjY3VyYXRlQm91bmRzKCBjb250ZXh0ID0+IHtcclxuICAgICAgY29udGV4dC5mb250ID0gdGV4dC5fZm9udC50b0NTUygpO1xyXG4gICAgICBjb250ZXh0LmRpcmVjdGlvbiA9ICdsdHInO1xyXG4gICAgICBjb250ZXh0LmZpbGxUZXh0KCB0ZXh0LnJlbmRlcmVkVGV4dCwgMCwgMCApO1xyXG4gICAgICBpZiAoIHRleHQuaGFzUGFpbnRhYmxlU3Ryb2tlKCkgKSB7XHJcbiAgICAgICAgY29uc3QgZmFrZVdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIG51bGwsIGNvbnRleHQgKTtcclxuICAgICAgICB0ZXh0LmJlZm9yZUNhbnZhc1N0cm9rZSggZmFrZVdyYXBwZXIgKTtcclxuICAgICAgICBjb250ZXh0LnN0cm9rZVRleHQoIHRleHQucmVuZGVyZWRUZXh0LCAwLCAwICk7XHJcbiAgICAgICAgdGV4dC5hZnRlckNhbnZhc1N0cm9rZSggZmFrZVdyYXBwZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSwge1xyXG4gICAgICBwcmVjaXNpb246IDAuNSxcclxuICAgICAgcmVzb2x1dGlvbjogMTI4LFxyXG4gICAgICBpbml0aWFsU2NhbGU6IDMyIC8gTWF0aC5tYXgoIE1hdGguYWJzKCBzdmdCb3VuZHMubWluWCApLCBNYXRoLmFicyggc3ZnQm91bmRzLm1pblkgKSwgTWF0aC5hYnMoIHN2Z0JvdW5kcy5tYXhYICksIE1hdGguYWJzKCBzdmdCb3VuZHMubWF4WSApIClcclxuICAgIH0gKTtcclxuICAgIC8vIFRyeSBmYWxsaW5nIGJhY2sgdG8gU1ZHIGJvdW5kcyBpZiBvdXIgYWNjdXJhdGUgYm91bmRzIGFyZSBub3QgZmluaXRlXHJcbiAgICByZXR1cm4gYWNjdXJhdGVCb3VuZHMuaXNGaW5pdGUoKSA/IGFjY3VyYXRlQm91bmRzIDogc3ZnQm91bmRzO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBwb3NzaWJseS1jYWNoZWQgKHRyZWF0IGFzIGltbXV0YWJsZSkgQm91bmRzMiBmb3IgdXNlIG1haW5seSBmb3IgdmVydGljYWwgcGFyYW1ldGVycywgZ2l2ZW4gYSBzcGVjaWZpYyBGb250LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFVzZXMgU1ZHIGJvdW5kcyBkZXRlcm1pbmF0aW9uIGZvciB0aGlzIHZhbHVlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cclxuICAgKi9cclxuICBnZXRWZXJ0aWNhbEJvdW5kcyggZm9udCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcclxuXHJcbiAgICBjb25zdCBjc3MgPSBmb250LnRvQ1NTKCk7XHJcblxyXG4gICAgLy8gQ2FjaGUgdGhlc2UsIGFzIGl0J3MgbW9yZSBleHBlbnNpdmVcclxuICAgIGxldCB2ZXJ0aWNhbEJvdW5kcyA9IGh5YnJpZEZvbnRWZXJ0aWNhbENhY2hlWyBjc3MgXTtcclxuICAgIGlmICggIXZlcnRpY2FsQm91bmRzICkge1xyXG4gICAgICB2ZXJ0aWNhbEJvdW5kcyA9IGh5YnJpZEZvbnRWZXJ0aWNhbENhY2hlWyBjc3MgXSA9IFRleHRCb3VuZHMuYXBwcm94aW1hdGVTVkdCb3VuZHMoIGZvbnQsICdtJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZXJ0aWNhbEJvdW5kcztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFwcHJveGltYXRlIHdpZHRoIGZvciB0ZXh0LCBkZXRlcm1pbmVkIGJ5IHVzaW5nIENhbnZhcycgbWVhc3VyZVRleHQoKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByZW5kZXJlZFRleHQgLSBUZXh0IHRvIGRpc3BsYXkgKHdpdGggYW55IHNwZWNpYWwgY2hhcmFjdGVycyByZXBsYWNlZClcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGFwcHJveGltYXRlQ2FudmFzV2lkdGgoIGZvbnQsIHJlbmRlcmVkVGV4dCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByZW5kZXJlZFRleHQgPT09ICdzdHJpbmcnLCAncmVuZGVyZWRUZXh0IHJlcXVpcmVkJyApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRleHQgPSBzY2VuZXJ5LnNjcmF0Y2hDb250ZXh0O1xyXG4gICAgY29udGV4dC5mb250ID0gZm9udC50b0NTUygpO1xyXG4gICAgY29udGV4dC5kaXJlY3Rpb24gPSAnbHRyJztcclxuICAgIHJldHVybiBjb250ZXh0Lm1lYXN1cmVUZXh0KCByZW5kZXJlZFRleHQgKS53aWR0aDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbmV3IEJvdW5kczIgdGhhdCBpcyB0aGUgYXBwcm94aW1hdGUgYm91bmRzIG9mIGEgVGV4dCBub2RlIGRpc3BsYXllZCB3aXRoIHRoZSBzcGVjaWZpZWQgZm9udCBhbmQgcmVuZGVyZWRUZXh0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIHVzZXMgYSBoeWJyaWQgYXBwcm9hY2gsIHVzaW5nIFNWRyBtZWFzdXJlbWVudCB0byBkZXRlcm1pbmUgdGhlIGhlaWdodCwgYnV0IHVzaW5nIENhbnZhcyB0byBkZXRlcm1pbmUgdGhlIHdpZHRoLlxyXG4gICAqXHJcbiAgICogTk9URTogQ2FsbGluZyBjb2RlIHJlbGllcyBvbiB0aGUgbmV3IEJvdW5kczIgaW5zdGFuY2UsIGFzIHRoZXkgbXV0YXRlIGl0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVuZGVyZWRUZXh0IC0gVGV4dCB0byBkaXNwbGF5ICh3aXRoIGFueSBzcGVjaWFsIGNoYXJhY3RlcnMgcmVwbGFjZWQpXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgYXBwcm94aW1hdGVIeWJyaWRCb3VuZHMoIGZvbnQsIHJlbmRlcmVkVGV4dCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiByZW5kZXJlZFRleHQgPT09ICdzdHJpbmcnLCAncmVuZGVyZWRUZXh0IHJlcXVpcmVkJyApO1xyXG5cclxuICAgIGNvbnN0IHZlcnRpY2FsQm91bmRzID0gVGV4dEJvdW5kcy5nZXRWZXJ0aWNhbEJvdW5kcyggZm9udCApO1xyXG5cclxuICAgIGNvbnN0IGNhbnZhc1dpZHRoID0gVGV4dEJvdW5kcy5hcHByb3hpbWF0ZUNhbnZhc1dpZHRoKCBmb250LCByZW5kZXJlZFRleHQgKTtcclxuXHJcbiAgICAvLyBpdCBzZWVtcyB0aGF0IFNWRyBib3VuZHMgZ2VuZXJhbGx5IGhhdmUgeD0wLCBzbyB3ZSBoYXJkIGNvZGUgdGhhdCBoZXJlXHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczIoIDAsIHZlcnRpY2FsQm91bmRzLm1pblksIGNhbnZhc1dpZHRoLCB2ZXJ0aWNhbEJvdW5kcy5tYXhZICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBCb3VuZHMyIHRoYXQgaXMgdGhlIGFwcHJveGltYXRlIGJvdW5kcyBvZiBhIFRleHQgbm9kZSBkaXNwbGF5ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGZvbnQsIGdpdmVuIGEgRE9NIGVsZW1lbnRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBOT1RFOiBDYWxsaW5nIGNvZGUgcmVsaWVzIG9uIHRoZSBuZXcgQm91bmRzMiBpbnN0YW5jZSwgYXMgdGhleSBtdXRhdGUgaXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIERPTSBlbGVtZW50IGNyZWF0ZWQgZm9yIHRoZSB0ZXh0LiBUaGlzIGlzIHJlcXVpcmVkLCBhcyB0aGUgdGV4dCBoYW5kbGVzIEhUTUwgYW5kIG5vbi1IVE1MIHRleHQgZGlmZmVyZW50bHkuXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgYXBwcm94aW1hdGVET01Cb3VuZHMoIGZvbnQsIGVsZW1lbnQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb250IGluc3RhbmNlb2YgRm9udCwgJ0ZvbnQgcmVxdWlyZWQnICk7XHJcblxyXG4gICAgY29uc3QgbWF4SGVpZ2h0ID0gMTAyNDsgLy8gdGVjaG5pY2FsbHkgdGhpcyB3aWxsIGZhaWwgaWYgdGhlIGZvbnQgaXMgdGFsbGVyIHRoYW4gdGhpcyFcclxuXHJcbiAgICAvLyA8ZGl2IHN0eWxlPVwicG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyB0b3A6IDA7IHBhZGRpbmc6IDAgIWltcG9ydGFudDsgbWFyZ2luOiAwICFpbXBvcnRhbnQ7XCI+PHNwYW4gaWQ9XCJiYXNlbGluZVNwYW5cIiBzdHlsZT1cImZvbnQtZmFtaWx5OiBWZXJkYW5hOyBmb250LXNpemU6IDI1cHg7XCI+UXVpcFRhUWl5PC9zcGFuPjxkaXYgc3R5bGU9XCJ2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgd2lkdGg6IDA7IGhlaWdodDogNTAwcHg7IG1hcmdpbjogMCBpbXBvcnRhbnQhOyBwYWRkaW5nOiAwIGltcG9ydGFudCE7XCI+PC9kaXY+PC9kaXY+XHJcblxyXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICQoIGRpdiApLmNzcygge1xyXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgbGVmdDogMCxcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICBwYWRkaW5nOiAnMCAhaW1wb3J0YW50JyxcclxuICAgICAgbWFyZ2luOiAnMCAhaW1wb3J0YW50JyxcclxuICAgICAgZGlzcGxheTogJ2hpZGRlbidcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NwYW4nICk7XHJcbiAgICAkKCBzcGFuICkuY3NzKCAnZm9udCcsIGZvbnQudG9DU1MoKSApO1xyXG4gICAgc3Bhbi5hcHBlbmRDaGlsZCggZWxlbWVudCApO1xyXG4gICAgc3Bhbi5zZXRBdHRyaWJ1dGUoICdkaXJlY3Rpb24nLCAnbHRyJyApO1xyXG5cclxuICAgIGNvbnN0IGZha2VJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAkKCBmYWtlSW1hZ2UgKS5jc3MoIHtcclxuICAgICAgJ3ZlcnRpY2FsLWFsaWduJzogJ2Jhc2VsaW5lJyxcclxuICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgIHdpZHRoOiAwLFxyXG4gICAgICBoZWlnaHQ6IGAke21heEhlaWdodH1weGAsXHJcbiAgICAgIG1hcmdpbjogJzAgIWltcG9ydGFudCcsXHJcbiAgICAgIHBhZGRpbmc6ICcwICFpbXBvcnRhbnQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgZGl2LmFwcGVuZENoaWxkKCBzcGFuICk7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoIGZha2VJbWFnZSApO1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xyXG4gICAgY29uc3QgcmVjdCA9IHNwYW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBjb25zdCBkaXZSZWN0ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgLy8gYWRkIDEgcGl4ZWwgdG8gcmVjdC5yaWdodCB0byBwcmV2ZW50IEhUTUwgdGV4dCB3cmFwcGluZ1xyXG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEJvdW5kczIoIHJlY3QubGVmdCwgcmVjdC50b3AgLSBtYXhIZWlnaHQsIHJlY3QucmlnaHQgKyAxLCByZWN0LmJvdHRvbSAtIG1heEhlaWdodCApLnNoaWZ0ZWRYWSggLWRpdlJlY3QubGVmdCwgLWRpdlJlY3QudG9wICk7XHJcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBuZXcgQm91bmRzMiB0aGF0IGlzIHRoZSBhcHByb3hpbWF0ZSBib3VuZHMgb2YgYSBUZXh0IG5vZGUgZGlzcGxheWVkIHdpdGggdGhlIHNwZWNpZmllZCBmb250LCBnaXZlbiBhIERPTSBlbGVtZW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVE9ETzogQ2FuIHdlIHVzZSB0aGlzPyBXaGF0IGFyZSB0aGUgZGlmZmVyZW5jZXM/XHJcbiAgICpcclxuICAgKiBOT1RFOiBDYWxsaW5nIGNvZGUgcmVsaWVzIG9uIHRoZSBuZXcgQm91bmRzMiBpbnN0YW5jZSwgYXMgdGhleSBtdXRhdGUgaXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0ZvbnR9IGZvbnQgLSBUaGUgZm9udCBvZiB0aGUgdGV4dFxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIERPTSBlbGVtZW50IGNyZWF0ZWQgZm9yIHRoZSB0ZXh0LiBUaGlzIGlzIHJlcXVpcmVkLCBhcyB0aGUgdGV4dCBoYW5kbGVzIEhUTUwgYW5kIG5vbi1IVE1MIHRleHQgZGlmZmVyZW50bHkuXHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICovXHJcbiAgYXBwcm94aW1hdGVJbXByb3ZlZERPTUJvdW5kcyggZm9udCwgZWxlbWVudCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvbnQgaW5zdGFuY2VvZiBGb250LCAnRm9udCByZXF1aXJlZCcgKTtcclxuXHJcbiAgICAvLyBUT0RPOiByZXVzZSB0aGlzIGRpdj9cclxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xyXG4gICAgZGl2LnN0eWxlLmZvbnQgPSBmb250LnRvQ1NTKCk7XHJcbiAgICBkaXYuc3R5bGUuY29sb3IgPSAndHJhbnNwYXJlbnQnO1xyXG4gICAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMCAhaW1wb3J0YW50JztcclxuICAgIGRpdi5zdHlsZS5tYXJnaW4gPSAnMCAhaW1wb3J0YW50JztcclxuICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICBkaXYuc3R5bGUubGVmdCA9ICcwJztcclxuICAgIGRpdi5zdHlsZS50b3AgPSAnMCc7XHJcbiAgICBkaXYuc2V0QXR0cmlidXRlKCAnZGlyZWN0aW9uJywgJ2x0cicgKTtcclxuICAgIGRpdi5hcHBlbmRDaGlsZCggZWxlbWVudCApO1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xyXG4gICAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoIGRpdi5vZmZzZXRMZWZ0LCBkaXYub2Zmc2V0VG9wLCBkaXYub2Zmc2V0TGVmdCArIGRpdi5vZmZzZXRXaWR0aCArIDEsIGRpdi5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0SGVpZ2h0ICsgMSApO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggZGl2ICk7XHJcblxyXG4gICAgLy8gQ29tcGVuc2F0ZSBmb3IgdGhlIGJhc2VsaW5lIGFsaWdubWVudFxyXG4gICAgY29uc3QgdmVydGljYWxCb3VuZHMgPSBUZXh0Qm91bmRzLmdldFZlcnRpY2FsQm91bmRzKCBmb250ICk7XHJcbiAgICByZXR1cm4gYm91bmRzLnNoaWZ0ZWRZKCB2ZXJ0aWNhbEJvdW5kcy5taW5ZICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXMgYW4gU1ZHIHRleHQgZWxlbWVudCdzIHByb3BlcnRpZXMgdG8gbWF0Y2ggdGhlIHNwZWNpZmllZCBmb250IGFuZCB0ZXh0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U1ZHVGV4dEVsZW1lbnR9IHRleHRFbGVtZW50XHJcbiAgICogQHBhcmFtIHtGb250fSBmb250IC0gVGhlIGZvbnQgb2YgdGhlIHRleHRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVuZGVyZWRUZXh0IC0gVGV4dCB0byBkaXNwbGF5ICh3aXRoIGFueSBzcGVjaWFsIGNoYXJhY3RlcnMgcmVwbGFjZWQpXHJcbiAgICovXHJcbiAgc2V0U1ZHVGV4dEF0dHJpYnV0ZXMoIHRleHRFbGVtZW50LCBmb250LCByZW5kZXJlZFRleHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmb250IGluc3RhbmNlb2YgRm9udCwgJ0ZvbnQgcmVxdWlyZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcmVuZGVyZWRUZXh0ID09PSAnc3RyaW5nJywgJ3JlbmRlcmVkVGV4dCByZXF1aXJlZCcgKTtcclxuXHJcbiAgICB0ZXh0RWxlbWVudC5zZXRBdHRyaWJ1dGUoICdkaXJlY3Rpb24nLCAnbHRyJyApO1xyXG4gICAgdGV4dEVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZm9udC1mYW1pbHknLCBmb250LmdldEZhbWlseSgpICk7XHJcbiAgICB0ZXh0RWxlbWVudC5zZXRBdHRyaWJ1dGUoICdmb250LXNpemUnLCBmb250LmdldFNpemUoKSApO1xyXG4gICAgdGV4dEVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZm9udC1zdHlsZScsIGZvbnQuZ2V0U3R5bGUoKSApO1xyXG4gICAgdGV4dEVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZm9udC13ZWlnaHQnLCBmb250LmdldFdlaWdodCgpICk7XHJcbiAgICB0ZXh0RWxlbWVudC5zZXRBdHRyaWJ1dGUoICdmb250LXN0cmV0Y2gnLCBmb250LmdldFN0cmV0Y2goKSApO1xyXG4gICAgdGV4dEVsZW1lbnQubGFzdENoaWxkLm5vZGVWYWx1ZSA9IHJlbmRlcmVkVGV4dDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyBjb250YWluZXJzIGFuZCBlbGVtZW50cyByZXF1aXJlZCBmb3IgU1ZHIHRleHQgbWVhc3VyZW1lbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGluaXRpYWxpemVUZXh0Qm91bmRzKCkge1xyXG4gICAgc3ZnVGV4dFNpemVDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggVEVYVF9TSVpFX0NPTlRBSU5FUl9JRCApO1xyXG5cclxuICAgIGlmICggIXN2Z1RleHRTaXplQ29udGFpbmVyICkge1xyXG4gICAgICAvLyBzZXQgdXAgdGhlIGNvbnRhaW5lciBhbmQgdGV4dCBmb3IgdGVzdGluZyB0ZXh0IGJvdW5kcyBxdWlja2x5ICh1c2luZyBhcHByb3hpbWF0ZVNWR0JvdW5kcylcclxuICAgICAgc3ZnVGV4dFNpemVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcyJyApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCAnMicgKTtcclxuICAgICAgc3ZnVGV4dFNpemVDb250YWluZXIuc2V0QXR0cmlidXRlKCAnaWQnLCBURVhUX1NJWkVfQ09OVEFJTkVSX0lEICk7XHJcbiAgICAgIHN2Z1RleHRTaXplQ29udGFpbmVyLnNldEF0dHJpYnV0ZSggJ3N0eWxlJywgJ3Zpc2liaWxpdHk6IGhpZGRlbjsgcG9pbnRlci1ldmVudHM6IG5vbmU7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogLTY1NTM1cHg7IHJpZ2h0OiAtNjU1MzVweDsnICk7IC8vIHNvIHdlIGRvbid0IGZsYXNoIGl0IGluIGEgdmlzaWJsZSB3YXkgdG8gdGhlIHVzZXJcclxuICAgIH1cclxuXHJcbiAgICBzdmdUZXh0U2l6ZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggVEVYVF9TSVpFX0VMRU1FTlRfSUQgKTtcclxuXHJcbiAgICAvLyBOT1RFISBjb3BpZXMgY3JlYXRlU1ZHRWxlbWVudFxyXG4gICAgaWYgKCAhc3ZnVGV4dFNpemVFbGVtZW50ICkge1xyXG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAndGV4dCcgKTtcclxuICAgICAgc3ZnVGV4dFNpemVFbGVtZW50LmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSggJycgKSApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZG9taW5hbnQtYmFzZWxpbmUnLCAnYWxwaGFiZXRpYycgKTsgLy8gdG8gbWF0Y2ggQ2FudmFzIHJpZ2h0IG5vd1xyXG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCAndGV4dC1yZW5kZXJpbmcnLCAnZ2VvbWV0cmljUHJlY2lzaW9uJyApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQuc2V0QXR0cmlidXRlTlMoICdodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2UnLCAneG1sOnNwYWNlJywgJ3ByZXNlcnZlJyApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUVsZW1lbnQuc2V0QXR0cmlidXRlKCAnaWQnLCBURVhUX1NJWkVfRUxFTUVOVF9JRCApO1xyXG4gICAgICBzdmdUZXh0U2l6ZUNvbnRhaW5lci5hcHBlbmRDaGlsZCggc3ZnVGV4dFNpemVFbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1RleHRCb3VuZHMnLCBUZXh0Qm91bmRzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXh0Qm91bmRzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELFNBQVNDLG9CQUFvQixFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsS0FB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