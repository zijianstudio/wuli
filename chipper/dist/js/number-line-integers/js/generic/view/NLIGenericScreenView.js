// Copyright 2019-2022, University of Colorado Boulder

/**
 * view of the "Generic" screen for the Number Line Integers simulation
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import NLCheckbox from '../../../../number-line-common/js/common/view/NLCheckbox.js';
import NLCheckboxGroup from '../../../../number-line-common/js/common/view/NLCheckboxGroup.js';
import NumberLineOrientationSelector from '../../../../number-line-common/js/common/view/NumberLineOrientationSelector.js';
import NumberLineRangeSelector from '../../../../number-line-common/js/common/view/NumberLineRangeSelector.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import SpatializedNumberLineNode from '../../../../number-line-common/js/common/view/SpatializedNumberLineNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import ComparisonStatementAccordionBox from '../../common/view/ComparisonStatementAccordionBox.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import NumberLineIntegersStrings from '../../NumberLineIntegersStrings.js';
import NLIGenericModel from '../model/NLIGenericModel.js';

// constants
const absoluteValueString = NumberLineIntegersStrings.absoluteValue;
const labelsString = NumberLineIntegersStrings.labels;
const tickMarksString = NumberLineIntegersStrings.tickMarks;
const oppositeString = NumberLineIntegersStrings.opposite;

// constants
const MAX_CHECKBOX_TEXT_WIDTH = 190; // empirically determined to stay within dev bounds
const CHECKBOX_OPTIONS = {
  textOptions: {
    maxWidth: MAX_CHECKBOX_TEXT_WIDTH
  }
};
class NLIGenericScreenView extends ScreenView {
  /**
   * @param {NLIGenericModel} model
   * @public
   */
  constructor(model) {
    super({
      layoutBounds: NLIConstants.NLI_LAYOUT_BOUNDS
    });

    // layer where controls are added
    const controlsLayer = new Node();
    this.addChild(controlsLayer);

    // Add the display of the inequality.
    const comparisonStatementAccordionBox = new ComparisonStatementAccordionBox(model.numberLine, {
      centerX: this.layoutBounds.centerX,
      top: 10
    });
    controlsLayer.addChild(comparisonStatementAccordionBox);

    // Add the check boxes that will control the number line's presentation.
    const checkboxes = [new NLCheckbox(model.numberLine.showPointLabelsProperty, labelsString, CHECKBOX_OPTIONS), new NLCheckbox(model.numberLine.showTickMarksProperty, tickMarksString, CHECKBOX_OPTIONS), new NLCheckbox(model.numberLine.showOppositesProperty, oppositeString, CHECKBOX_OPTIONS), new NLCheckbox(model.numberLine.showAbsoluteValuesProperty, absoluteValueString, CHECKBOX_OPTIONS)];
    const checkboxGroup = new NLCheckboxGroup(checkboxes, {
      // position - empirically determined to look decent
      left: this.layoutBounds.maxX - 220,
      top: this.layoutBounds.minY + 10
    });
    controlsLayer.addChild(checkboxGroup);

    // NOTE: There is no model-view transform for this sim. Model and view space use the same coordinate system.

    // root node on which the point controllers will live
    const pointControllerLayer = new Node();
    this.addChild(pointControllerLayer);

    // Add the point controller nodes.
    model.pointControllers.forEach(pointController => {
      pointControllerLayer.addChild(new PointControllerNode(pointController));
    });

    // Add the number line node.
    this.addChild(new SpatializedNumberLineNode(model.numberLine, {
      showAbsoluteValueSpans: true,
      displayedRangeInset: NLIConstants.GENERIC_SCREEN_DISPLAYED_RANGE_INSET,
      pointNodeOptions: {
        labelFont: new PhetFont(18)
      }
    }));
    let pointControllerBoxNode = null;
    model.pointControllerBoxProperty.link(pointControllerBox => {
      pointControllerBoxNode && this.removeChild(pointControllerBoxNode);

      // Add the box where the point controllers hang out when not in use.
      pointControllerBoxNode = new Rectangle(pointControllerBox, {
        fill: 'white',
        stroke: 'black',
        cornerRadius: 6
      });
      this.addChild(pointControllerBoxNode);
      pointControllerBoxNode.moveToBack();
    });

    // reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        comparisonStatementAccordionBox.reset();
      },
      right: this.layoutBounds.maxX - NLCConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLCConstants.SCREEN_VIEW_Y_MARGIN
    });
    controlsLayer.addChild(resetAllButton);
    const orientationSelector = new NumberLineOrientationSelector(model.numberLine.orientationProperty, {
      left: checkboxGroup.left,
      bottom: resetAllButton.centerY
    });
    controlsLayer.addChild(orientationSelector);

    // number line range selector
    controlsLayer.addChild(new NumberLineRangeSelector(model.numberLine.displayedRangeProperty, NLIGenericModel.NUMBER_LINE_RANGES, this, {
      left: orientationSelector.left,
      bottom: orientationSelector.top - 12
    }));
  }
}
numberLineIntegers.register('NLIGenericScreenView', NLIGenericScreenView);
export default NLIGenericScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiTkxDQ29uc3RhbnRzIiwiTkxDaGVja2JveCIsIk5MQ2hlY2tib3hHcm91cCIsIk51bWJlckxpbmVPcmllbnRhdGlvblNlbGVjdG9yIiwiTnVtYmVyTGluZVJhbmdlU2VsZWN0b3IiLCJQb2ludENvbnRyb2xsZXJOb2RlIiwiU3BhdGlhbGl6ZWROdW1iZXJMaW5lTm9kZSIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiTkxJQ29uc3RhbnRzIiwiQ29tcGFyaXNvblN0YXRlbWVudEFjY29yZGlvbkJveCIsIm51bWJlckxpbmVJbnRlZ2VycyIsIk51bWJlckxpbmVJbnRlZ2Vyc1N0cmluZ3MiLCJOTElHZW5lcmljTW9kZWwiLCJhYnNvbHV0ZVZhbHVlU3RyaW5nIiwiYWJzb2x1dGVWYWx1ZSIsImxhYmVsc1N0cmluZyIsImxhYmVscyIsInRpY2tNYXJrc1N0cmluZyIsInRpY2tNYXJrcyIsIm9wcG9zaXRlU3RyaW5nIiwib3Bwb3NpdGUiLCJNQVhfQ0hFQ0tCT1hfVEVYVF9XSURUSCIsIkNIRUNLQk9YX09QVElPTlMiLCJ0ZXh0T3B0aW9ucyIsIm1heFdpZHRoIiwiTkxJR2VuZXJpY1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibGF5b3V0Qm91bmRzIiwiTkxJX0xBWU9VVF9CT1VORFMiLCJjb250cm9sc0xheWVyIiwiYWRkQ2hpbGQiLCJjb21wYXJpc29uU3RhdGVtZW50QWNjb3JkaW9uQm94IiwibnVtYmVyTGluZSIsImNlbnRlclgiLCJ0b3AiLCJjaGVja2JveGVzIiwic2hvd1BvaW50TGFiZWxzUHJvcGVydHkiLCJzaG93VGlja01hcmtzUHJvcGVydHkiLCJzaG93T3Bwb3NpdGVzUHJvcGVydHkiLCJzaG93QWJzb2x1dGVWYWx1ZXNQcm9wZXJ0eSIsImNoZWNrYm94R3JvdXAiLCJsZWZ0IiwibWF4WCIsIm1pblkiLCJwb2ludENvbnRyb2xsZXJMYXllciIsInBvaW50Q29udHJvbGxlcnMiLCJmb3JFYWNoIiwicG9pbnRDb250cm9sbGVyIiwic2hvd0Fic29sdXRlVmFsdWVTcGFucyIsImRpc3BsYXllZFJhbmdlSW5zZXQiLCJHRU5FUklDX1NDUkVFTl9ESVNQTEFZRURfUkFOR0VfSU5TRVQiLCJwb2ludE5vZGVPcHRpb25zIiwibGFiZWxGb250IiwicG9pbnRDb250cm9sbGVyQm94Tm9kZSIsInBvaW50Q29udHJvbGxlckJveFByb3BlcnR5IiwibGluayIsInBvaW50Q29udHJvbGxlckJveCIsInJlbW92ZUNoaWxkIiwiZmlsbCIsInN0cm9rZSIsImNvcm5lclJhZGl1cyIsIm1vdmVUb0JhY2siLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJyaWdodCIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwiYm90dG9tIiwibWF4WSIsIlNDUkVFTl9WSUVXX1lfTUFSR0lOIiwib3JpZW50YXRpb25TZWxlY3RvciIsIm9yaWVudGF0aW9uUHJvcGVydHkiLCJjZW50ZXJZIiwiZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSIsIk5VTUJFUl9MSU5FX1JBTkdFUyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTkxJR2VuZXJpY1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogdmlldyBvZiB0aGUgXCJHZW5lcmljXCIgc2NyZWVuIGZvciB0aGUgTnVtYmVyIExpbmUgSW50ZWdlcnMgc2ltdWxhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTkxDQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vTkxDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE5MQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi92aWV3L05MQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgTkxDaGVja2JveEdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vdmlldy9OTENoZWNrYm94R3JvdXAuanMnO1xyXG5pbXBvcnQgTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3IgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi92aWV3L051bWJlckxpbmVPcmllbnRhdGlvblNlbGVjdG9yLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVSYW5nZVNlbGVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vdmlldy9OdW1iZXJMaW5lUmFuZ2VTZWxlY3Rvci5qcyc7XHJcbmltcG9ydCBQb2ludENvbnRyb2xsZXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vdmlldy9Qb2ludENvbnRyb2xsZXJOb2RlLmpzJztcclxuaW1wb3J0IFNwYXRpYWxpemVkTnVtYmVyTGluZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi92aWV3L1NwYXRpYWxpemVkTnVtYmVyTGluZU5vZGUuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE5MSUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTkxJQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvbXBhcmlzb25TdGF0ZW1lbnRBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQ29tcGFyaXNvblN0YXRlbWVudEFjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lSW50ZWdlcnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZUludGVnZXJzLmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVJbnRlZ2Vyc1N0cmluZ3MgZnJvbSAnLi4vLi4vTnVtYmVyTGluZUludGVnZXJzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOTElHZW5lcmljTW9kZWwgZnJvbSAnLi4vbW9kZWwvTkxJR2VuZXJpY01vZGVsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBhYnNvbHV0ZVZhbHVlU3RyaW5nID0gTnVtYmVyTGluZUludGVnZXJzU3RyaW5ncy5hYnNvbHV0ZVZhbHVlO1xyXG5jb25zdCBsYWJlbHNTdHJpbmcgPSBOdW1iZXJMaW5lSW50ZWdlcnNTdHJpbmdzLmxhYmVscztcclxuY29uc3QgdGlja01hcmtzU3RyaW5nID0gTnVtYmVyTGluZUludGVnZXJzU3RyaW5ncy50aWNrTWFya3M7XHJcbmNvbnN0IG9wcG9zaXRlU3RyaW5nID0gTnVtYmVyTGluZUludGVnZXJzU3RyaW5ncy5vcHBvc2l0ZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfQ0hFQ0tCT1hfVEVYVF9XSURUSCA9IDE5MDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBzdGF5IHdpdGhpbiBkZXYgYm91bmRzXHJcbmNvbnN0IENIRUNLQk9YX09QVElPTlMgPSB7IHRleHRPcHRpb25zOiB7IG1heFdpZHRoOiBNQVhfQ0hFQ0tCT1hfVEVYVF9XSURUSCB9IH07XHJcblxyXG5jbGFzcyBOTElHZW5lcmljU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge05MSUdlbmVyaWNNb2RlbH0gbW9kZWxcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsICkge1xyXG5cclxuICAgIHN1cGVyKCB7IGxheW91dEJvdW5kczogTkxJQ29uc3RhbnRzLk5MSV9MQVlPVVRfQk9VTkRTIH0gKTtcclxuXHJcbiAgICAvLyBsYXllciB3aGVyZSBjb250cm9scyBhcmUgYWRkZWRcclxuICAgIGNvbnN0IGNvbnRyb2xzTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29udHJvbHNMYXllciApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZGlzcGxheSBvZiB0aGUgaW5lcXVhbGl0eS5cclxuICAgIGNvbnN0IGNvbXBhcmlzb25TdGF0ZW1lbnRBY2NvcmRpb25Cb3ggPSBuZXcgQ29tcGFyaXNvblN0YXRlbWVudEFjY29yZGlvbkJveCggbW9kZWwubnVtYmVyTGluZSwge1xyXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYLFxyXG4gICAgICB0b3A6IDEwXHJcbiAgICB9ICk7XHJcbiAgICBjb250cm9sc0xheWVyLmFkZENoaWxkKCBjb21wYXJpc29uU3RhdGVtZW50QWNjb3JkaW9uQm94ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBjaGVjayBib3hlcyB0aGF0IHdpbGwgY29udHJvbCB0aGUgbnVtYmVyIGxpbmUncyBwcmVzZW50YXRpb24uXHJcbiAgICBjb25zdCBjaGVja2JveGVzID0gW1xyXG4gICAgICBuZXcgTkxDaGVja2JveCggbW9kZWwubnVtYmVyTGluZS5zaG93UG9pbnRMYWJlbHNQcm9wZXJ0eSwgbGFiZWxzU3RyaW5nLCBDSEVDS0JPWF9PUFRJT05TICksXHJcbiAgICAgIG5ldyBOTENoZWNrYm94KCBtb2RlbC5udW1iZXJMaW5lLnNob3dUaWNrTWFya3NQcm9wZXJ0eSwgdGlja01hcmtzU3RyaW5nLCBDSEVDS0JPWF9PUFRJT05TICksXHJcbiAgICAgIG5ldyBOTENoZWNrYm94KCBtb2RlbC5udW1iZXJMaW5lLnNob3dPcHBvc2l0ZXNQcm9wZXJ0eSwgb3Bwb3NpdGVTdHJpbmcsIENIRUNLQk9YX09QVElPTlMgKSxcclxuICAgICAgbmV3IE5MQ2hlY2tib3goIG1vZGVsLm51bWJlckxpbmUuc2hvd0Fic29sdXRlVmFsdWVzUHJvcGVydHksIGFic29sdXRlVmFsdWVTdHJpbmcsIENIRUNLQk9YX09QVElPTlMgKVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGNoZWNrYm94R3JvdXAgPSBuZXcgTkxDaGVja2JveEdyb3VwKCBjaGVja2JveGVzLCB7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiAtIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gbG9vayBkZWNlbnRcclxuICAgICAgbGVmdDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDIyMCxcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy5taW5ZICsgMTBcclxuICAgIH0gKTtcclxuICAgIGNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIGNoZWNrYm94R3JvdXAgKTtcclxuXHJcbiAgICAvLyBOT1RFOiBUaGVyZSBpcyBubyBtb2RlbC12aWV3IHRyYW5zZm9ybSBmb3IgdGhpcyBzaW0uIE1vZGVsIGFuZCB2aWV3IHNwYWNlIHVzZSB0aGUgc2FtZSBjb29yZGluYXRlIHN5c3RlbS5cclxuXHJcbiAgICAvLyByb290IG5vZGUgb24gd2hpY2ggdGhlIHBvaW50IGNvbnRyb2xsZXJzIHdpbGwgbGl2ZVxyXG4gICAgY29uc3QgcG9pbnRDb250cm9sbGVyTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcG9pbnRDb250cm9sbGVyTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHBvaW50IGNvbnRyb2xsZXIgbm9kZXMuXHJcbiAgICBtb2RlbC5wb2ludENvbnRyb2xsZXJzLmZvckVhY2goIHBvaW50Q29udHJvbGxlciA9PiB7XHJcbiAgICAgIHBvaW50Q29udHJvbGxlckxheWVyLmFkZENoaWxkKCBuZXcgUG9pbnRDb250cm9sbGVyTm9kZSggcG9pbnRDb250cm9sbGVyICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG51bWJlciBsaW5lIG5vZGUuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgU3BhdGlhbGl6ZWROdW1iZXJMaW5lTm9kZSggbW9kZWwubnVtYmVyTGluZSwge1xyXG4gICAgICBzaG93QWJzb2x1dGVWYWx1ZVNwYW5zOiB0cnVlLFxyXG4gICAgICBkaXNwbGF5ZWRSYW5nZUluc2V0OiBOTElDb25zdGFudHMuR0VORVJJQ19TQ1JFRU5fRElTUExBWUVEX1JBTkdFX0lOU0VULFxyXG4gICAgICBwb2ludE5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgbGFiZWxGb250OiBuZXcgUGhldEZvbnQoIDE4IClcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgbGV0IHBvaW50Q29udHJvbGxlckJveE5vZGUgPSBudWxsO1xyXG4gICAgbW9kZWwucG9pbnRDb250cm9sbGVyQm94UHJvcGVydHkubGluayggcG9pbnRDb250cm9sbGVyQm94ID0+IHtcclxuICAgICAgcG9pbnRDb250cm9sbGVyQm94Tm9kZSAmJiB0aGlzLnJlbW92ZUNoaWxkKCBwb2ludENvbnRyb2xsZXJCb3hOb2RlICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGJveCB3aGVyZSB0aGUgcG9pbnQgY29udHJvbGxlcnMgaGFuZyBvdXQgd2hlbiBub3QgaW4gdXNlLlxyXG4gICAgICBwb2ludENvbnRyb2xsZXJCb3hOb2RlID0gbmV3IFJlY3RhbmdsZSggcG9pbnRDb250cm9sbGVyQm94LCB7XHJcbiAgICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiA2XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHBvaW50Q29udHJvbGxlckJveE5vZGUgKTtcclxuICAgICAgcG9pbnRDb250cm9sbGVyQm94Tm9kZS5tb3ZlVG9CYWNrKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVzZXQgYWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgY29tcGFyaXNvblN0YXRlbWVudEFjY29yZGlvbkJveC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIE5MQ0NvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gTkxDQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOXHJcbiAgICB9ICk7XHJcbiAgICBjb250cm9sc0xheWVyLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IG9yaWVudGF0aW9uU2VsZWN0b3IgPSBuZXcgTnVtYmVyTGluZU9yaWVudGF0aW9uU2VsZWN0b3IoIG1vZGVsLm51bWJlckxpbmUub3JpZW50YXRpb25Qcm9wZXJ0eSwge1xyXG4gICAgICBsZWZ0OiBjaGVja2JveEdyb3VwLmxlZnQsXHJcbiAgICAgIGJvdHRvbTogcmVzZXRBbGxCdXR0b24uY2VudGVyWVxyXG4gICAgfSApO1xyXG4gICAgY29udHJvbHNMYXllci5hZGRDaGlsZCggb3JpZW50YXRpb25TZWxlY3RvciApO1xyXG5cclxuICAgIC8vIG51bWJlciBsaW5lIHJhbmdlIHNlbGVjdG9yXHJcbiAgICBjb250cm9sc0xheWVyLmFkZENoaWxkKCBuZXcgTnVtYmVyTGluZVJhbmdlU2VsZWN0b3IoXHJcbiAgICAgIG1vZGVsLm51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgTkxJR2VuZXJpY01vZGVsLk5VTUJFUl9MSU5FX1JBTkdFUyxcclxuICAgICAgdGhpcyxcclxuICAgICAge1xyXG4gICAgICAgIGxlZnQ6IG9yaWVudGF0aW9uU2VsZWN0b3IubGVmdCxcclxuICAgICAgICBib3R0b206IG9yaWVudGF0aW9uU2VsZWN0b3IudG9wIC0gMTJcclxuICAgICAgfVxyXG4gICAgKSApO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZUludGVnZXJzLnJlZ2lzdGVyKCAnTkxJR2VuZXJpY1NjcmVlblZpZXcnLCBOTElHZW5lcmljU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBOTElHZW5lcmljU2NyZWVuVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsWUFBWSxNQUFNLDBEQUEwRDtBQUNuRixPQUFPQyxVQUFVLE1BQU0sNkRBQTZEO0FBQ3BGLE9BQU9DLGVBQWUsTUFBTSxrRUFBa0U7QUFDOUYsT0FBT0MsNkJBQTZCLE1BQU0sZ0ZBQWdGO0FBQzFILE9BQU9DLHVCQUF1QixNQUFNLDBFQUEwRTtBQUM5RyxPQUFPQyxtQkFBbUIsTUFBTSxzRUFBc0U7QUFDdEcsT0FBT0MseUJBQXlCLE1BQU0sNEVBQTRFO0FBQ2xILE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQywrQkFBK0IsTUFBTSxzREFBc0Q7QUFDbEcsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLHlCQUF5QixNQUFNLG9DQUFvQztB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