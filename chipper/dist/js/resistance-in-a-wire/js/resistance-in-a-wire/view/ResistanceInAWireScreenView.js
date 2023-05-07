// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main View for the "ResistanceInAWire" screen.
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { FocusHighlightPath } from '../../../../scenery/js/imports.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';
import ControlPanel from './ControlPanel.js';
import FormulaNode from './FormulaNode.js';
import ResistanceInAWireScreenSummaryNode from './ResistanceInAWireScreenSummaryNode.js';
import WireNode from './WireNode.js';
class ResistanceInAWireScreenView extends ScreenView {
  /**
   * @param {ResistanceInAWireModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem,
      screenSummaryContent: new ResistanceInAWireScreenSummaryNode(model)
    });

    // Create the control panel with sliders that change the values of the equation's variables. Hard coded
    const controlPanel = new ControlPanel(model, tandem.createTandem('controlPanel'), {
      right: this.layoutBounds.right - 30,
      top: 40
    });

    // Create the formula node that holds the equation with size changing variables.
    const formulaNode = new FormulaNode(model, tandem.createTandem('formulaNode'), {
      centerX: controlPanel.left / 2,
      centerY: 190
    });
    this.pdomPlayAreaNode.addChild(formulaNode);

    // Create the wire display to represent the formula
    const wireNode = new WireNode(model, tandem.createTandem('wireNode'), {
      centerX: formulaNode.centerX,
      centerY: formulaNode.centerY + 270
    });
    this.pdomPlayAreaNode.addChild(wireNode);
    const tailX = wireNode.centerX - ResistanceInAWireConstants.TAIL_LENGTH / 2;
    const tipX = wireNode.centerX + ResistanceInAWireConstants.TAIL_LENGTH / 2;
    const arrowHeight = this.layoutBounds.bottom - 47;

    // create static arrow below the wire
    const arrowNode = new ArrowNode(tailX, arrowHeight, tipX, arrowHeight, {
      headHeight: ResistanceInAWireConstants.HEAD_HEIGHT,
      headWidth: ResistanceInAWireConstants.HEAD_WIDTH,
      tailWidth: ResistanceInAWireConstants.TAIL_WIDTH,
      fill: ResistanceInAWireConstants.WHITE_COLOR,
      stroke: ResistanceInAWireConstants.BLACK_COLOR,
      lineWidth: 1,
      tandem: tandem.createTandem('arrowNode')
    });
    this.pdomPlayAreaNode.addChild(arrowNode);
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
      },
      radius: 30,
      right: controlPanel.right,
      bottom: this.layoutBounds.bottom - 20,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.pdomControlAreaNode.addChild(resetAllButton);

    // the outer stroke of the ResetAllButton focus highlight is black so that it is visible when the equation
    // resistance letter grows too large
    const highlightShape = resetAllButton.focusHighlight;
    assert && assert(highlightShape instanceof Shape, 'highlightShape must be a Shape');
    resetAllButton.focusHighlight = new FocusHighlightPath(highlightShape, {
      outerStroke: 'black'
    });

    // add the control panel last so it is always on top.
    this.pdomPlayAreaNode.addChild(controlPanel);
  }
}
resistanceInAWire.register('ResistanceInAWireScreenView', ResistanceInAWireScreenView);
export default ResistanceInAWireScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiU2hhcGUiLCJBcnJvd05vZGUiLCJSZXNldEFsbEJ1dHRvbiIsIkZvY3VzSGlnaGxpZ2h0UGF0aCIsInJlc2lzdGFuY2VJbkFXaXJlIiwiUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMiLCJDb250cm9sUGFuZWwiLCJGb3JtdWxhTm9kZSIsIlJlc2lzdGFuY2VJbkFXaXJlU2NyZWVuU3VtbWFyeU5vZGUiLCJXaXJlTm9kZSIsIlJlc2lzdGFuY2VJbkFXaXJlU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJzY3JlZW5TdW1tYXJ5Q29udGVudCIsImNvbnRyb2xQYW5lbCIsImNyZWF0ZVRhbmRlbSIsInJpZ2h0IiwibGF5b3V0Qm91bmRzIiwidG9wIiwiZm9ybXVsYU5vZGUiLCJjZW50ZXJYIiwibGVmdCIsImNlbnRlclkiLCJwZG9tUGxheUFyZWFOb2RlIiwiYWRkQ2hpbGQiLCJ3aXJlTm9kZSIsInRhaWxYIiwiVEFJTF9MRU5HVEgiLCJ0aXBYIiwiYXJyb3dIZWlnaHQiLCJib3R0b20iLCJhcnJvd05vZGUiLCJoZWFkSGVpZ2h0IiwiSEVBRF9IRUlHSFQiLCJoZWFkV2lkdGgiLCJIRUFEX1dJRFRIIiwidGFpbFdpZHRoIiwiVEFJTF9XSURUSCIsImZpbGwiLCJXSElURV9DT0xPUiIsInN0cm9rZSIsIkJMQUNLX0NPTE9SIiwibGluZVdpZHRoIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwicmFkaXVzIiwicGRvbUNvbnRyb2xBcmVhTm9kZSIsImhpZ2hsaWdodFNoYXBlIiwiZm9jdXNIaWdobGlnaHQiLCJhc3NlcnQiLCJvdXRlclN0cm9rZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVzaXN0YW5jZUluQVdpcmVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gVmlldyBmb3IgdGhlIFwiUmVzaXN0YW5jZUluQVdpcmVcIiBzY3JlZW4uXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IEZvY3VzSGlnaGxpZ2h0UGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCByZXNpc3RhbmNlSW5BV2lyZSBmcm9tICcuLi8uLi9yZXNpc3RhbmNlSW5BV2lyZS5qcyc7XHJcbmltcG9ydCBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cyBmcm9tICcuLi9SZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb250cm9sUGFuZWwgZnJvbSAnLi9Db250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgRm9ybXVsYU5vZGUgZnJvbSAnLi9Gb3JtdWxhTm9kZS5qcyc7XHJcbmltcG9ydCBSZXNpc3RhbmNlSW5BV2lyZVNjcmVlblN1bW1hcnlOb2RlIGZyb20gJy4vUmVzaXN0YW5jZUluQVdpcmVTY3JlZW5TdW1tYXJ5Tm9kZS5qcyc7XHJcbmltcG9ydCBXaXJlTm9kZSBmcm9tICcuL1dpcmVOb2RlLmpzJztcclxuXHJcbmNsYXNzIFJlc2lzdGFuY2VJbkFXaXJlU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Jlc2lzdGFuY2VJbkFXaXJlTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBzY3JlZW5TdW1tYXJ5Q29udGVudDogbmV3IFJlc2lzdGFuY2VJbkFXaXJlU2NyZWVuU3VtbWFyeU5vZGUoIG1vZGVsIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNvbnRyb2wgcGFuZWwgd2l0aCBzbGlkZXJzIHRoYXQgY2hhbmdlIHRoZSB2YWx1ZXMgb2YgdGhlIGVxdWF0aW9uJ3MgdmFyaWFibGVzLiBIYXJkIGNvZGVkXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgQ29udHJvbFBhbmVsKCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKSwge1xyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSAzMCxcclxuICAgICAgdG9wOiA0MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgZm9ybXVsYSBub2RlIHRoYXQgaG9sZHMgdGhlIGVxdWF0aW9uIHdpdGggc2l6ZSBjaGFuZ2luZyB2YXJpYWJsZXMuXHJcbiAgICBjb25zdCBmb3JtdWxhTm9kZSA9IG5ldyBGb3JtdWxhTm9kZSggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb3JtdWxhTm9kZScgKSwge1xyXG4gICAgICBjZW50ZXJYOiBjb250cm9sUGFuZWwubGVmdCAvIDIsXHJcbiAgICAgIGNlbnRlclk6IDE5MFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wZG9tUGxheUFyZWFOb2RlLmFkZENoaWxkKCBmb3JtdWxhTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgd2lyZSBkaXNwbGF5IHRvIHJlcHJlc2VudCB0aGUgZm9ybXVsYVxyXG4gICAgY29uc3Qgd2lyZU5vZGUgPSBuZXcgV2lyZU5vZGUoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2lyZU5vZGUnICksIHtcclxuICAgICAgY2VudGVyWDogZm9ybXVsYU5vZGUuY2VudGVyWCxcclxuICAgICAgY2VudGVyWTogZm9ybXVsYU5vZGUuY2VudGVyWSArIDI3MFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wZG9tUGxheUFyZWFOb2RlLmFkZENoaWxkKCB3aXJlTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IHRhaWxYID0gd2lyZU5vZGUuY2VudGVyWCAtIFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLlRBSUxfTEVOR1RIIC8gMjtcclxuICAgIGNvbnN0IHRpcFggPSB3aXJlTm9kZS5jZW50ZXJYICsgUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuVEFJTF9MRU5HVEggLyAyO1xyXG4gICAgY29uc3QgYXJyb3dIZWlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSA0NztcclxuXHJcbiAgICAvLyBjcmVhdGUgc3RhdGljIGFycm93IGJlbG93IHRoZSB3aXJlXHJcbiAgICBjb25zdCBhcnJvd05vZGUgPSBuZXcgQXJyb3dOb2RlKCB0YWlsWCwgYXJyb3dIZWlnaHQsIHRpcFgsIGFycm93SGVpZ2h0LCB7XHJcbiAgICAgIGhlYWRIZWlnaHQ6IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLkhFQURfSEVJR0hULFxyXG4gICAgICBoZWFkV2lkdGg6IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLkhFQURfV0lEVEgsXHJcbiAgICAgIHRhaWxXaWR0aDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuVEFJTF9XSURUSCxcclxuICAgICAgZmlsbDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuV0hJVEVfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuQkxBQ0tfQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXJyb3dOb2RlJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBkb21QbGF5QXJlYU5vZGUuYWRkQ2hpbGQoIGFycm93Tm9kZSApO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7IG1vZGVsLnJlc2V0KCk7IH0sXHJcbiAgICAgIHJhZGl1czogMzAsXHJcbiAgICAgIHJpZ2h0OiBjb250cm9sUGFuZWwucmlnaHQsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMjAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBkb21Db250cm9sQXJlYU5vZGUuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gdGhlIG91dGVyIHN0cm9rZSBvZiB0aGUgUmVzZXRBbGxCdXR0b24gZm9jdXMgaGlnaGxpZ2h0IGlzIGJsYWNrIHNvIHRoYXQgaXQgaXMgdmlzaWJsZSB3aGVuIHRoZSBlcXVhdGlvblxyXG4gICAgLy8gcmVzaXN0YW5jZSBsZXR0ZXIgZ3Jvd3MgdG9vIGxhcmdlXHJcbiAgICBjb25zdCBoaWdobGlnaHRTaGFwZSA9IHJlc2V0QWxsQnV0dG9uLmZvY3VzSGlnaGxpZ2h0O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGlnaGxpZ2h0U2hhcGUgaW5zdGFuY2VvZiBTaGFwZSwgJ2hpZ2hsaWdodFNoYXBlIG11c3QgYmUgYSBTaGFwZScgKTtcclxuICAgIHJlc2V0QWxsQnV0dG9uLmZvY3VzSGlnaGxpZ2h0ID0gbmV3IEZvY3VzSGlnaGxpZ2h0UGF0aCggaGlnaGxpZ2h0U2hhcGUsIHsgb3V0ZXJTdHJva2U6ICdibGFjaycgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgY29udHJvbCBwYW5lbCBsYXN0IHNvIGl0IGlzIGFsd2F5cyBvbiB0b3AuXHJcbiAgICB0aGlzLnBkb21QbGF5QXJlYU5vZGUuYWRkQ2hpbGQoIGNvbnRyb2xQYW5lbCApO1xyXG4gIH1cclxufVxyXG5cclxucmVzaXN0YW5jZUluQVdpcmUucmVnaXN0ZXIoICdSZXNpc3RhbmNlSW5BV2lyZVNjcmVlblZpZXcnLCBSZXNpc3RhbmNlSW5BV2lyZVNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgUmVzaXN0YW5jZUluQVdpcmVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsU0FBU0Msa0JBQWtCLFFBQVEsbUNBQW1DO0FBQ3RFLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQywwQkFBMEIsTUFBTSxrQ0FBa0M7QUFDekUsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLGtDQUFrQyxNQUFNLHlDQUF5QztBQUN4RixPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUVwQyxNQUFNQywyQkFBMkIsU0FBU1gsVUFBVSxDQUFDO0VBRW5EO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VZLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBRTNCLEtBQUssQ0FBRTtNQUNMQSxNQUFNLEVBQUVBLE1BQU07TUFDZEMsb0JBQW9CLEVB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