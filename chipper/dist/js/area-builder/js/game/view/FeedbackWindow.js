// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base class for a node that looks like a window and provides the user with feedback about what they have entered
 * during the challenge.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import areaBuilder from '../../areaBuilder.js';

// constants
const X_MARGIN = 8;
const TITLE_FONT = new PhetFont({
  size: 20,
  weight: 'bold'
});
const NORMAL_TEXT_FONT = new PhetFont({
  size: 18
});
const CORRECT_ANSWER_BACKGROUND_COLOR = 'white';
const INCORRECT_ANSWER_BACKGROUND_COLOR = PhetColorScheme.PHET_LOGO_YELLOW;
class FeedbackWindow extends Panel {
  /**
   * Constructor for the window that shows the user what they built.  It is constructed with no contents, and the
   * contents are added later when the build spec is set.
   *
   * @param {string} title
   * @param {number} maxWidth
   * @param {Object} [options]
   */
  constructor(title, maxWidth, options) {
    options = merge({
      fill: INCORRECT_ANSWER_BACKGROUND_COLOR,
      stroke: 'black',
      xMargin: X_MARGIN
    }, options);
    const contentNode = new Node();

    // @protected subclasses will do layout relative to this.titleNode
    const titleNode = new Text(title, {
      font: TITLE_FONT
    });
    titleNode.scale(Math.min((maxWidth - 2 * X_MARGIN) / titleNode.width, 1));
    titleNode.top = 5;
    contentNode.addChild(titleNode);

    // Invoke super constructor - called here because content with no bounds doesn't work.  This does not pass through
    // position options - that needs to be handled in descendant classes.
    super(contentNode, options);

    // @protected subclasses will addChild and removeChild
    this.contentNode = contentNode;

    // @protected subclasses will do layout relative to this.titleNode
    this.titleNode = titleNode;
  }

  /**
   * Set the background color of this window based on whether or not the information being displayed is the correct
   * answer.
   *
   * @param userAnswerIsCorrect
   * @public
   */
  setColorBasedOnAnswerCorrectness(userAnswerIsCorrect) {
    this.setFill(userAnswerIsCorrect ? CORRECT_ANSWER_BACKGROUND_COLOR : INCORRECT_ANSWER_BACKGROUND_COLOR);
  }
}

// @protected for use by subclasses
FeedbackWindow.X_MARGIN = X_MARGIN; // Must be visible to subtypes so that max width can be calculated and, if necessary, scaled.
FeedbackWindow.NORMAL_TEXT_FONT = NORMAL_TEXT_FONT; // Font used in this window for text that is not the title.

areaBuilder.register('FeedbackWindow', FeedbackWindow);
export default FeedbackWindow;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJQYW5lbCIsImFyZWFCdWlsZGVyIiwiWF9NQVJHSU4iLCJUSVRMRV9GT05UIiwic2l6ZSIsIndlaWdodCIsIk5PUk1BTF9URVhUX0ZPTlQiLCJDT1JSRUNUX0FOU1dFUl9CQUNLR1JPVU5EX0NPTE9SIiwiSU5DT1JSRUNUX0FOU1dFUl9CQUNLR1JPVU5EX0NPTE9SIiwiUEhFVF9MT0dPX1lFTExPVyIsIkZlZWRiYWNrV2luZG93IiwiY29uc3RydWN0b3IiLCJ0aXRsZSIsIm1heFdpZHRoIiwib3B0aW9ucyIsImZpbGwiLCJzdHJva2UiLCJ4TWFyZ2luIiwiY29udGVudE5vZGUiLCJ0aXRsZU5vZGUiLCJmb250Iiwic2NhbGUiLCJNYXRoIiwibWluIiwid2lkdGgiLCJ0b3AiLCJhZGRDaGlsZCIsInNldENvbG9yQmFzZWRPbkFuc3dlckNvcnJlY3RuZXNzIiwidXNlckFuc3dlcklzQ29ycmVjdCIsInNldEZpbGwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZlZWRiYWNrV2luZG93LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIGEgbm9kZSB0aGF0IGxvb2tzIGxpa2UgYSB3aW5kb3cgYW5kIHByb3ZpZGVzIHRoZSB1c2VyIHdpdGggZmVlZGJhY2sgYWJvdXQgd2hhdCB0aGV5IGhhdmUgZW50ZXJlZFxyXG4gKiBkdXJpbmcgdGhlIGNoYWxsZW5nZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFhfTUFSR0lOID0gODtcclxuY29uc3QgVElUTEVfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBOT1JNQUxfVEVYVF9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDE4IH0gKTtcclxuY29uc3QgQ09SUkVDVF9BTlNXRVJfQkFDS0dST1VORF9DT0xPUiA9ICd3aGl0ZSc7XHJcbmNvbnN0IElOQ09SUkVDVF9BTlNXRVJfQkFDS0dST1VORF9DT0xPUiA9IFBoZXRDb2xvclNjaGVtZS5QSEVUX0xPR09fWUVMTE9XO1xyXG5cclxuY2xhc3MgRmVlZGJhY2tXaW5kb3cgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgd2luZG93IHRoYXQgc2hvd3MgdGhlIHVzZXIgd2hhdCB0aGV5IGJ1aWx0LiAgSXQgaXMgY29uc3RydWN0ZWQgd2l0aCBubyBjb250ZW50cywgYW5kIHRoZVxyXG4gICAqIGNvbnRlbnRzIGFyZSBhZGRlZCBsYXRlciB3aGVuIHRoZSBidWlsZCBzcGVjIGlzIHNldC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhXaWR0aFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGl0bGUsIG1heFdpZHRoLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiBJTkNPUlJFQ1RfQU5TV0VSX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgeE1hcmdpbjogWF9NQVJHSU5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCBzdWJjbGFzc2VzIHdpbGwgZG8gbGF5b3V0IHJlbGF0aXZlIHRvIHRoaXMudGl0bGVOb2RlXHJcbiAgICBjb25zdCB0aXRsZU5vZGUgPSBuZXcgVGV4dCggdGl0bGUsIHsgZm9udDogVElUTEVfRk9OVCB9ICk7XHJcbiAgICB0aXRsZU5vZGUuc2NhbGUoIE1hdGgubWluKCAoIG1heFdpZHRoIC0gMiAqIFhfTUFSR0lOICkgLyB0aXRsZU5vZGUud2lkdGgsIDEgKSApO1xyXG4gICAgdGl0bGVOb2RlLnRvcCA9IDU7XHJcbiAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggdGl0bGVOb2RlICk7XHJcblxyXG4gICAgLy8gSW52b2tlIHN1cGVyIGNvbnN0cnVjdG9yIC0gY2FsbGVkIGhlcmUgYmVjYXVzZSBjb250ZW50IHdpdGggbm8gYm91bmRzIGRvZXNuJ3Qgd29yay4gIFRoaXMgZG9lcyBub3QgcGFzcyB0aHJvdWdoXHJcbiAgICAvLyBwb3NpdGlvbiBvcHRpb25zIC0gdGhhdCBuZWVkcyB0byBiZSBoYW5kbGVkIGluIGRlc2NlbmRhbnQgY2xhc3Nlcy5cclxuICAgIHN1cGVyKCBjb250ZW50Tm9kZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgc3ViY2xhc3NlcyB3aWxsIGFkZENoaWxkIGFuZCByZW1vdmVDaGlsZFxyXG4gICAgdGhpcy5jb250ZW50Tm9kZSA9IGNvbnRlbnROb2RlO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgc3ViY2xhc3NlcyB3aWxsIGRvIGxheW91dCByZWxhdGl2ZSB0byB0aGlzLnRpdGxlTm9kZVxyXG4gICAgdGhpcy50aXRsZU5vZGUgPSB0aXRsZU5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGJhY2tncm91bmQgY29sb3Igb2YgdGhpcyB3aW5kb3cgYmFzZWQgb24gd2hldGhlciBvciBub3QgdGhlIGluZm9ybWF0aW9uIGJlaW5nIGRpc3BsYXllZCBpcyB0aGUgY29ycmVjdFxyXG4gICAqIGFuc3dlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB1c2VyQW5zd2VySXNDb3JyZWN0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldENvbG9yQmFzZWRPbkFuc3dlckNvcnJlY3RuZXNzKCB1c2VyQW5zd2VySXNDb3JyZWN0ICkge1xyXG4gICAgdGhpcy5zZXRGaWxsKCB1c2VyQW5zd2VySXNDb3JyZWN0ID8gQ09SUkVDVF9BTlNXRVJfQkFDS0dST1VORF9DT0xPUiA6IElOQ09SUkVDVF9BTlNXRVJfQkFDS0dST1VORF9DT0xPUiApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gQHByb3RlY3RlZCBmb3IgdXNlIGJ5IHN1YmNsYXNzZXNcclxuRmVlZGJhY2tXaW5kb3cuWF9NQVJHSU4gPSBYX01BUkdJTjsgLy8gTXVzdCBiZSB2aXNpYmxlIHRvIHN1YnR5cGVzIHNvIHRoYXQgbWF4IHdpZHRoIGNhbiBiZSBjYWxjdWxhdGVkIGFuZCwgaWYgbmVjZXNzYXJ5LCBzY2FsZWQuXHJcbkZlZWRiYWNrV2luZG93Lk5PUk1BTF9URVhUX0ZPTlQgPSBOT1JNQUxfVEVYVF9GT05UOyAvLyBGb250IHVzZWQgaW4gdGhpcyB3aW5kb3cgZm9yIHRleHQgdGhhdCBpcyBub3QgdGhlIHRpdGxlLlxyXG5cclxuYXJlYUJ1aWxkZXIucmVnaXN0ZXIoICdGZWVkYmFja1dpbmRvdycsIEZlZWRiYWNrV2luZG93ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZlZWRiYWNrV2luZG93OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7O0FBRTlDO0FBQ0EsTUFBTUMsUUFBUSxHQUFHLENBQUM7QUFDbEIsTUFBTUMsVUFBVSxHQUFHLElBQUlOLFFBQVEsQ0FBRTtFQUFFTyxJQUFJLEVBQUUsRUFBRTtFQUFFQyxNQUFNLEVBQUU7QUFBTyxDQUFFLENBQUM7QUFDL0QsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSVQsUUFBUSxDQUFFO0VBQUVPLElBQUksRUFBRTtBQUFHLENBQUUsQ0FBQztBQUNyRCxNQUFNRywrQkFBK0IsR0FBRyxPQUFPO0FBQy9DLE1BQU1DLGlDQUFpQyxHQUFHWixlQUFlLENBQUNhLGdCQUFnQjtBQUUxRSxNQUFNQyxjQUFjLFNBQVNWLEtBQUssQ0FBQztFQUVqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VXLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUc7SUFFdENBLE9BQU8sR0FBR25CLEtBQUssQ0FBRTtNQUNmb0IsSUFBSSxFQUFFUCxpQ0FBaUM7TUFDdkNRLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLE9BQU8sRUFBRWY7SUFDWCxDQUFDLEVBQUVZLE9BQVEsQ0FBQztJQUVaLE1BQU1JLFdBQVcsR0FBRyxJQUFJcEIsSUFBSSxDQUFDLENBQUM7O0lBRTlCO0lBQ0EsTUFBTXFCLFNBQVMsR0FBRyxJQUFJcEIsSUFBSSxDQUFFYSxLQUFLLEVBQUU7TUFBRVEsSUFBSSxFQUFFakI7SUFBVyxDQUFFLENBQUM7SUFDekRnQixTQUFTLENBQUNFLEtBQUssQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUUsQ0FBRVYsUUFBUSxHQUFHLENBQUMsR0FBR1gsUUFBUSxJQUFLaUIsU0FBUyxDQUFDSyxLQUFLLEVBQUUsQ0FBRSxDQUFFLENBQUM7SUFDL0VMLFNBQVMsQ0FBQ00sR0FBRyxHQUFHLENBQUM7SUFDakJQLFdBQVcsQ0FBQ1EsUUFBUSxDQUFFUCxTQUFVLENBQUM7O0lBRWpDO0lBQ0E7SUFDQSxLQUFLLENBQUVELFdBQVcsRUFBRUosT0FBUSxDQUFDOztJQUU3QjtJQUNBLElBQUksQ0FBQ0ksV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHQSxTQUFTO0VBQzVCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLGdDQUFnQ0EsQ0FBRUMsbUJBQW1CLEVBQUc7SUFDdEQsSUFBSSxDQUFDQyxPQUFPLENBQUVELG1CQUFtQixHQUFHckIsK0JBQStCLEdBQUdDLGlDQUFrQyxDQUFDO0VBQzNHO0FBQ0Y7O0FBRUE7QUFDQUUsY0FBYyxDQUFDUixRQUFRLEdBQUdBLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDUSxjQUFjLENBQUNKLGdCQUFnQixHQUFHQSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVwREwsV0FBVyxDQUFDNkIsUUFBUSxDQUFFLGdCQUFnQixFQUFFcEIsY0FBZSxDQUFDO0FBQ3hELGVBQWVBLGNBQWMifQ==