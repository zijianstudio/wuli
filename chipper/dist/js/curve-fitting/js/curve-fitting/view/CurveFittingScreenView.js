// Copyright 2015-2023, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveFittingQueryParameters from '../CurveFittingQueryParameters.js';
import BucketNode from './BucketNode.js';
import ControlPanels from './ControlPanels.js';
import CurveNode from './CurveNode.js';
import DeviationsAccordionBox from './DeviationsAccordionBox.js';
import EquationAccordionBox from './EquationAccordionBox.js';
import GraphAreaNode from './GraphAreaNode.js';
import ResidualsNode from './ResidualsNode.js';

// constants
const EXPAND_COLLAPSE_PUSH_BOUNDS_DILATION = 0.45; // in model coordinates

class CurveFittingScreenView extends ScreenView {
  /**
   * @param {CurveFittingModel} model
   */
  constructor(model) {
    super();

    // view-specific Properties
    // @public {Property.<boolean>} determines visibility of the "Deviations" accordion box (upper left hand side panel)
    const deviationsAccordionBoxExpandedProperty = new BooleanProperty(true);

    // @public {Property.<boolean>} determines expansion status of the equation node on graph
    const equationPanelExpandedProperty = new BooleanProperty(true);

    // @public {Property.<boolean>} determines visibility of residuals
    const residualsVisibleProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} determines visibility of values
    const valuesVisibleProperty = new BooleanProperty(false);

    // @public {Property.<boolean>} determines visibility of the curve fit
    const curveVisibleProperty = new BooleanProperty(false);

    // create a model view transform, graph is centered and fills the ScreenView height
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(this.layoutBounds.centerX, this.layoutBounds.centerY), 25.5 // set empirically, see https://github.com/phetsims/curve-fitting/issues/157
    );

    // create the graph area node - responsible for the rendering of the axes, ticks and background.
    const graphAreaNode = new GraphAreaNode(modelViewTransform);
    const graphViewBounds = modelViewTransform.modelToViewBounds(CurveFittingConstants.GRAPH_BACKGROUND_MODEL_BOUNDS);

    // deviations accordion box, at left of screen
    const deviationsAccordionBox = new DeviationsAccordionBox(deviationsAccordionBoxExpandedProperty, model.points, model.curve.chiSquaredProperty, model.curve.rSquaredProperty, curveVisibleProperty, {
      centerX: this.layoutBounds.left + (graphAreaNode.left - this.layoutBounds.left) / 2,
      top: graphViewBounds.minY
    });

    // all other controls, at right of screen
    const controlPanels = new ControlPanels(model.sliderPropertyArray, model.orderProperty, model.fitProperty, curveVisibleProperty, residualsVisibleProperty, valuesVisibleProperty, {
      centerX: this.layoutBounds.right - (this.layoutBounds.right - graphAreaNode.right) / 2,
      top: graphViewBounds.minY
    });

    // create the equation node (accordion box) in the upper left corner of the graph
    const equationBoxLeft = modelViewTransform.modelToViewX(-10) + 10;
    const equationAccordionBox = new EquationAccordionBox(model.curve, model.orderProperty, equationPanelExpandedProperty, curveVisibleProperty, {
      left: equationBoxLeft,
      top: modelViewTransform.modelToViewY(10) + 10,
      equationNodeMaxWidth: modelViewTransform.modelToViewX(10) - equationBoxLeft - 65
    });

    // create the panel that serves as an opaque background for the equationAccordionBox; see #126
    // no dispose or removeListener necessary because equationAccordionBox is present for the lifetime of the sim
    const graphEquationBackground = new Rectangle(0, 0, 0, 0, 0, 0, {
      cornerRadius: CurveFittingConstants.PANEL_CORNER_RADIUS,
      fill: 'white'
    });
    equationAccordionBox.updatedEmitter.addListener(() => {
      graphEquationBackground.visible = equationAccordionBox.visible;
      graphEquationBackground.rectBounds = equationAccordionBox.bounds;
    });

    // Whenever the curve becomes visible, points below the EquationAccordionBox's expand/collapse button get
    // pushed out from under the button; see #131
    const bumpOutPointsUnderExpandCollapseButton = () => {
      if (!curveVisibleProperty.value) {
        return;
      }
      const pointPushBounds = modelViewTransform.viewToModelBounds(graphAreaNode.globalToLocalBounds(equationAccordionBox.expandCollapseButton.localToGlobalBounds(equationAccordionBox.expandCollapseButton.localBounds))).dilated(EXPAND_COLLAPSE_PUSH_BOUNDS_DILATION);

      // Gets points that intersect with the expand/collapse button and pushes them until they don't intersect
      let pointsUnder = [];
      do {
        pointsUnder = model.points.filter(point => pointPushBounds.containsPoint(point.positionProperty.value));
        pointsUnder.forEach(point => {
          let directionToPush = point.positionProperty.value.minus(pointPushBounds.center);
          while (directionToPush.equals(Vector2.ZERO)) {
            directionToPush = new Vector2(dotRandom.nextDouble(), dotRandom.nextDouble());
          }
          directionToPush.setMagnitude(0.05);
          point.positionProperty.value = point.positionProperty.value.plus(directionToPush);
        });
      } while (pointsUnder.length > 0);

      // Rounds point positions if snapToGrid is enabled
      if (CurveFittingQueryParameters.snapToGrid) {
        model.points.forEach(point => {
          point.positionProperty.value = new Vector2(Utils.toFixedNumber(point.positionProperty.value.x, 0), Utils.toFixedNumber(point.positionProperty.value.y, 0));
        });
      }
    };

    // unlink unnecessary, present for the lifetime of the sim
    curveVisibleProperty.link(bumpOutPointsUnderExpandCollapseButton);

    // create the curve and the residual lines
    const curveNode = new CurveNode(model.curve, curveVisibleProperty, modelViewTransform);

    // create the residual lines
    const residualsNode = new ResidualsNode(model.points, model.curve, residualsVisibleProperty, modelViewTransform);

    // create bucket
    const bucketNode = new BucketNode(model.points, bumpOutPointsUnderExpandCollapseButton, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform);

    // create reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        controlPanels.reset();
        deviationsAccordionBoxExpandedProperty.reset();
        equationPanelExpandedProperty.reset();
        residualsVisibleProperty.reset();
        valuesVisibleProperty.reset();
        curveVisibleProperty.reset();
      },
      right: this.layoutBounds.right - CurveFittingConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.bottom - CurveFittingConstants.SCREEN_VIEW_Y_MARGIN
    });

    // add the children to the scene graph
    this.addChild(deviationsAccordionBox);
    this.addChild(controlPanels);
    this.addChild(graphAreaNode);
    this.addChild(resetAllButton);
    this.addChild(graphEquationBackground);
    this.addChild(curveNode);
    this.addChild(residualsNode);
    this.addChild(bucketNode);
    this.addChild(equationAccordionBox);
  }
}
curveFitting.register('CurveFittingScreenView', CurveFittingScreenView);
export default CurveFittingScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJkb3RSYW5kb20iLCJVdGlscyIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiUmVjdGFuZ2xlIiwiY3VydmVGaXR0aW5nIiwiQ3VydmVGaXR0aW5nQ29uc3RhbnRzIiwiQ3VydmVGaXR0aW5nUXVlcnlQYXJhbWV0ZXJzIiwiQnVja2V0Tm9kZSIsIkNvbnRyb2xQYW5lbHMiLCJDdXJ2ZU5vZGUiLCJEZXZpYXRpb25zQWNjb3JkaW9uQm94IiwiRXF1YXRpb25BY2NvcmRpb25Cb3giLCJHcmFwaEFyZWFOb2RlIiwiUmVzaWR1YWxzTm9kZSIsIkVYUEFORF9DT0xMQVBTRV9QVVNIX0JPVU5EU19ESUxBVElPTiIsIkN1cnZlRml0dGluZ1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiZGV2aWF0aW9uc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJlcXVhdGlvblBhbmVsRXhwYW5kZWRQcm9wZXJ0eSIsInJlc2lkdWFsc1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsImN1cnZlVmlzaWJsZVByb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJsYXlvdXRCb3VuZHMiLCJjZW50ZXJYIiwiY2VudGVyWSIsImdyYXBoQXJlYU5vZGUiLCJncmFwaFZpZXdCb3VuZHMiLCJtb2RlbFRvVmlld0JvdW5kcyIsIkdSQVBIX0JBQ0tHUk9VTkRfTU9ERUxfQk9VTkRTIiwiZGV2aWF0aW9uc0FjY29yZGlvbkJveCIsInBvaW50cyIsImN1cnZlIiwiY2hpU3F1YXJlZFByb3BlcnR5IiwiclNxdWFyZWRQcm9wZXJ0eSIsImxlZnQiLCJ0b3AiLCJtaW5ZIiwiY29udHJvbFBhbmVscyIsInNsaWRlclByb3BlcnR5QXJyYXkiLCJvcmRlclByb3BlcnR5IiwiZml0UHJvcGVydHkiLCJyaWdodCIsImVxdWF0aW9uQm94TGVmdCIsIm1vZGVsVG9WaWV3WCIsImVxdWF0aW9uQWNjb3JkaW9uQm94IiwibW9kZWxUb1ZpZXdZIiwiZXF1YXRpb25Ob2RlTWF4V2lkdGgiLCJncmFwaEVxdWF0aW9uQmFja2dyb3VuZCIsImNvcm5lclJhZGl1cyIsIlBBTkVMX0NPUk5FUl9SQURJVVMiLCJmaWxsIiwidXBkYXRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInZpc2libGUiLCJyZWN0Qm91bmRzIiwiYm91bmRzIiwiYnVtcE91dFBvaW50c1VuZGVyRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJ2YWx1ZSIsInBvaW50UHVzaEJvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsImV4cGFuZENvbGxhcHNlQnV0dG9uIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImxvY2FsQm91bmRzIiwiZGlsYXRlZCIsInBvaW50c1VuZGVyIiwiZmlsdGVyIiwicG9pbnQiLCJjb250YWluc1BvaW50IiwicG9zaXRpb25Qcm9wZXJ0eSIsImZvckVhY2giLCJkaXJlY3Rpb25Ub1B1c2giLCJtaW51cyIsImNlbnRlciIsImVxdWFscyIsIlpFUk8iLCJuZXh0RG91YmxlIiwic2V0TWFnbml0dWRlIiwicGx1cyIsImxlbmd0aCIsInNuYXBUb0dyaWQiLCJ0b0ZpeGVkTnVtYmVyIiwieCIsInkiLCJsaW5rIiwiY3VydmVOb2RlIiwicmVzaWR1YWxzTm9kZSIsImJ1Y2tldE5vZGUiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwicmVzZXQiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsImJvdHRvbSIsIlNDUkVFTl9WSUVXX1lfTUFSR0lOIiwiYWRkQ2hpbGQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkN1cnZlRml0dGluZ1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBTY3JlZW5WaWV3IG5vZGUgdGhhdCBjb250YWlucyBhbGwgb3RoZXIgbm9kZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjdXJ2ZUZpdHRpbmcgZnJvbSAnLi4vLi4vY3VydmVGaXR0aW5nLmpzJztcclxuaW1wb3J0IEN1cnZlRml0dGluZ0NvbnN0YW50cyBmcm9tICcuLi9DdXJ2ZUZpdHRpbmdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ3VydmVGaXR0aW5nUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0N1cnZlRml0dGluZ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCdWNrZXROb2RlIGZyb20gJy4vQnVja2V0Tm9kZS5qcyc7XHJcbmltcG9ydCBDb250cm9sUGFuZWxzIGZyb20gJy4vQ29udHJvbFBhbmVscy5qcyc7XHJcbmltcG9ydCBDdXJ2ZU5vZGUgZnJvbSAnLi9DdXJ2ZU5vZGUuanMnO1xyXG5pbXBvcnQgRGV2aWF0aW9uc0FjY29yZGlvbkJveCBmcm9tICcuL0RldmlhdGlvbnNBY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgRXF1YXRpb25BY2NvcmRpb25Cb3ggZnJvbSAnLi9FcXVhdGlvbkFjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBHcmFwaEFyZWFOb2RlIGZyb20gJy4vR3JhcGhBcmVhTm9kZS5qcyc7XHJcbmltcG9ydCBSZXNpZHVhbHNOb2RlIGZyb20gJy4vUmVzaWR1YWxzTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRVhQQU5EX0NPTExBUFNFX1BVU0hfQk9VTkRTX0RJTEFUSU9OID0gMC40NTsgLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuXHJcbmNsYXNzIEN1cnZlRml0dGluZ1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDdXJ2ZUZpdHRpbmdNb2RlbH0gbW9kZWxcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyB2aWV3LXNwZWNpZmljIFByb3BlcnRpZXNcclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIHRoZSBcIkRldmlhdGlvbnNcIiBhY2NvcmRpb24gYm94ICh1cHBlciBsZWZ0IGhhbmQgc2lkZSBwYW5lbClcclxuICAgIGNvbnN0IGRldmlhdGlvbnNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyBleHBhbnNpb24gc3RhdHVzIG9mIHRoZSBlcXVhdGlvbiBub2RlIG9uIGdyYXBoXHJcbiAgICBjb25zdCBlcXVhdGlvblBhbmVsRXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGRldGVybWluZXMgdmlzaWJpbGl0eSBvZiByZXNpZHVhbHNcclxuICAgIGNvbnN0IHJlc2lkdWFsc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHZpc2liaWxpdHkgb2YgdmFsdWVzXHJcbiAgICBjb25zdCB2YWx1ZXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIHRoZSBjdXJ2ZSBmaXRcclxuICAgIGNvbnN0IGN1cnZlVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBtb2RlbCB2aWV3IHRyYW5zZm9ybSwgZ3JhcGggaXMgY2VudGVyZWQgYW5kIGZpbGxzIHRoZSBTY3JlZW5WaWV3IGhlaWdodFxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyhcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclgsIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclkgKSxcclxuICAgICAgMjUuNSAvLyBzZXQgZW1waXJpY2FsbHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY3VydmUtZml0dGluZy9pc3N1ZXMvMTU3XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZ3JhcGggYXJlYSBub2RlIC0gcmVzcG9uc2libGUgZm9yIHRoZSByZW5kZXJpbmcgb2YgdGhlIGF4ZXMsIHRpY2tzIGFuZCBiYWNrZ3JvdW5kLlxyXG4gICAgY29uc3QgZ3JhcGhBcmVhTm9kZSA9IG5ldyBHcmFwaEFyZWFOb2RlKCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuXHJcbiAgICBjb25zdCBncmFwaFZpZXdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIEN1cnZlRml0dGluZ0NvbnN0YW50cy5HUkFQSF9CQUNLR1JPVU5EX01PREVMX0JPVU5EUyApO1xyXG5cclxuICAgIC8vIGRldmlhdGlvbnMgYWNjb3JkaW9uIGJveCwgYXQgbGVmdCBvZiBzY3JlZW5cclxuICAgIGNvbnN0IGRldmlhdGlvbnNBY2NvcmRpb25Cb3ggPSBuZXcgRGV2aWF0aW9uc0FjY29yZGlvbkJveChcclxuICAgICAgZGV2aWF0aW9uc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnBvaW50cyxcclxuICAgICAgbW9kZWwuY3VydmUuY2hpU3F1YXJlZFByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5jdXJ2ZS5yU3F1YXJlZFByb3BlcnR5LFxyXG4gICAgICBjdXJ2ZVZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICAgIGNlbnRlclg6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAoIGdyYXBoQXJlYU5vZGUubGVmdCAtIHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKSAvIDIsXHJcbiAgICAgICAgdG9wOiBncmFwaFZpZXdCb3VuZHMubWluWVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGFsbCBvdGhlciBjb250cm9scywgYXQgcmlnaHQgb2Ygc2NyZWVuXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWxzID0gbmV3IENvbnRyb2xQYW5lbHMoXHJcbiAgICAgIG1vZGVsLnNsaWRlclByb3BlcnR5QXJyYXksXHJcbiAgICAgIG1vZGVsLm9yZGVyUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmZpdFByb3BlcnR5LFxyXG4gICAgICBjdXJ2ZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgcmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtICggdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBncmFwaEFyZWFOb2RlLnJpZ2h0ICkgLyAyLFxyXG4gICAgICAgIHRvcDogZ3JhcGhWaWV3Qm91bmRzLm1pbllcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZXF1YXRpb24gbm9kZSAoYWNjb3JkaW9uIGJveCkgaW4gdGhlIHVwcGVyIGxlZnQgY29ybmVyIG9mIHRoZSBncmFwaFxyXG4gICAgY29uc3QgZXF1YXRpb25Cb3hMZWZ0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggLTEwICkgKyAxMDtcclxuICAgIGNvbnN0IGVxdWF0aW9uQWNjb3JkaW9uQm94ID0gbmV3IEVxdWF0aW9uQWNjb3JkaW9uQm94KFxyXG4gICAgICBtb2RlbC5jdXJ2ZSxcclxuICAgICAgbW9kZWwub3JkZXJQcm9wZXJ0eSxcclxuICAgICAgZXF1YXRpb25QYW5lbEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGN1cnZlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGVmdDogZXF1YXRpb25Cb3hMZWZ0LFxyXG4gICAgICAgIHRvcDogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggMTAgKSArIDEwLFxyXG4gICAgICAgIGVxdWF0aW9uTm9kZU1heFdpZHRoOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCAxMCApIC0gZXF1YXRpb25Cb3hMZWZ0IC0gNjVcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHBhbmVsIHRoYXQgc2VydmVzIGFzIGFuIG9wYXF1ZSBiYWNrZ3JvdW5kIGZvciB0aGUgZXF1YXRpb25BY2NvcmRpb25Cb3g7IHNlZSAjMTI2XHJcbiAgICAvLyBubyBkaXNwb3NlIG9yIHJlbW92ZUxpc3RlbmVyIG5lY2Vzc2FyeSBiZWNhdXNlIGVxdWF0aW9uQWNjb3JkaW9uQm94IGlzIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBjb25zdCBncmFwaEVxdWF0aW9uQmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAsIDAsIDAsIDAsIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVUyxcclxuICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgfSApO1xyXG4gICAgZXF1YXRpb25BY2NvcmRpb25Cb3gudXBkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgZ3JhcGhFcXVhdGlvbkJhY2tncm91bmQudmlzaWJsZSA9IGVxdWF0aW9uQWNjb3JkaW9uQm94LnZpc2libGU7XHJcbiAgICAgIGdyYXBoRXF1YXRpb25CYWNrZ3JvdW5kLnJlY3RCb3VuZHMgPSBlcXVhdGlvbkFjY29yZGlvbkJveC5ib3VuZHM7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbmV2ZXIgdGhlIGN1cnZlIGJlY29tZXMgdmlzaWJsZSwgcG9pbnRzIGJlbG93IHRoZSBFcXVhdGlvbkFjY29yZGlvbkJveCdzIGV4cGFuZC9jb2xsYXBzZSBidXR0b24gZ2V0XHJcbiAgICAvLyBwdXNoZWQgb3V0IGZyb20gdW5kZXIgdGhlIGJ1dHRvbjsgc2VlICMxMzFcclxuICAgIGNvbnN0IGJ1bXBPdXRQb2ludHNVbmRlckV4cGFuZENvbGxhcHNlQnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICBpZiAoICFjdXJ2ZVZpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBvaW50UHVzaEJvdW5kcyA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyhcclxuICAgICAgICBncmFwaEFyZWFOb2RlLmdsb2JhbFRvTG9jYWxCb3VuZHMoXHJcbiAgICAgICAgICBlcXVhdGlvbkFjY29yZGlvbkJveC5leHBhbmRDb2xsYXBzZUJ1dHRvbi5sb2NhbFRvR2xvYmFsQm91bmRzKFxyXG4gICAgICAgICAgICBlcXVhdGlvbkFjY29yZGlvbkJveC5leHBhbmRDb2xsYXBzZUJ1dHRvbi5sb2NhbEJvdW5kc1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgIClcclxuICAgICAgKS5kaWxhdGVkKCBFWFBBTkRfQ09MTEFQU0VfUFVTSF9CT1VORFNfRElMQVRJT04gKTtcclxuXHJcbiAgICAgIC8vIEdldHMgcG9pbnRzIHRoYXQgaW50ZXJzZWN0IHdpdGggdGhlIGV4cGFuZC9jb2xsYXBzZSBidXR0b24gYW5kIHB1c2hlcyB0aGVtIHVudGlsIHRoZXkgZG9uJ3QgaW50ZXJzZWN0XHJcbiAgICAgIGxldCBwb2ludHNVbmRlciA9IFtdO1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgcG9pbnRzVW5kZXIgPSBtb2RlbC5wb2ludHMuZmlsdGVyKCBwb2ludCA9PiBwb2ludFB1c2hCb3VuZHMuY29udGFpbnNQb2ludCggcG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICAgICAgcG9pbnRzVW5kZXIuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICAgICAgbGV0IGRpcmVjdGlvblRvUHVzaCA9IHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWludXMoIHBvaW50UHVzaEJvdW5kcy5jZW50ZXIgKTtcclxuICAgICAgICAgIHdoaWxlICggZGlyZWN0aW9uVG9QdXNoLmVxdWFscyggVmVjdG9yMi5aRVJPICkgKSB7XHJcbiAgICAgICAgICAgIGRpcmVjdGlvblRvUHVzaCA9IG5ldyBWZWN0b3IyKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBkaXJlY3Rpb25Ub1B1c2guc2V0TWFnbml0dWRlKCAwLjA1ICk7XHJcbiAgICAgICAgICBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBkaXJlY3Rpb25Ub1B1c2ggKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gd2hpbGUgKCBwb2ludHNVbmRlci5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgICAvLyBSb3VuZHMgcG9pbnQgcG9zaXRpb25zIGlmIHNuYXBUb0dyaWQgaXMgZW5hYmxlZFxyXG4gICAgICBpZiAoIEN1cnZlRml0dGluZ1F1ZXJ5UGFyYW1ldGVycy5zbmFwVG9HcmlkICkge1xyXG4gICAgICAgIG1vZGVsLnBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7XHJcbiAgICAgICAgICBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgIFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgMCApLFxyXG4gICAgICAgICAgICBVdGlscy50b0ZpeGVkTnVtYmVyKCBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnksIDAgKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gdW5saW5rIHVubmVjZXNzYXJ5LCBwcmVzZW50IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbVxyXG4gICAgY3VydmVWaXNpYmxlUHJvcGVydHkubGluayggYnVtcE91dFBvaW50c1VuZGVyRXhwYW5kQ29sbGFwc2VCdXR0b24gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGN1cnZlIGFuZCB0aGUgcmVzaWR1YWwgbGluZXNcclxuICAgIGNvbnN0IGN1cnZlTm9kZSA9IG5ldyBDdXJ2ZU5vZGUoXHJcbiAgICAgIG1vZGVsLmN1cnZlLFxyXG4gICAgICBjdXJ2ZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcmVzaWR1YWwgbGluZXNcclxuICAgIGNvbnN0IHJlc2lkdWFsc05vZGUgPSBuZXcgUmVzaWR1YWxzTm9kZShcclxuICAgICAgbW9kZWwucG9pbnRzLFxyXG4gICAgICBtb2RlbC5jdXJ2ZSxcclxuICAgICAgcmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGJ1Y2tldFxyXG4gICAgY29uc3QgYnVja2V0Tm9kZSA9IG5ldyBCdWNrZXROb2RlKFxyXG4gICAgICBtb2RlbC5wb2ludHMsXHJcbiAgICAgIGJ1bXBPdXRQb2ludHNVbmRlckV4cGFuZENvbGxhcHNlQnV0dG9uLFxyXG4gICAgICByZXNpZHVhbHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHZhbHVlc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSByZXNldCBhbGwgYnV0dG9uXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgY29udHJvbFBhbmVscy5yZXNldCgpO1xyXG4gICAgICAgIGRldmlhdGlvbnNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgICAgZXF1YXRpb25QYW5lbEV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICByZXNpZHVhbHNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICBjdXJ2ZVZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU4sXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gQ3VydmVGaXR0aW5nQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBjaGlsZHJlbiB0byB0aGUgc2NlbmUgZ3JhcGhcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGRldmlhdGlvbnNBY2NvcmRpb25Cb3ggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRyb2xQYW5lbHMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyYXBoQXJlYU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmFwaEVxdWF0aW9uQmFja2dyb3VuZCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY3VydmVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNpZHVhbHNOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBidWNrZXROb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlcXVhdGlvbkFjY29yZGlvbkJveCApO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ0N1cnZlRml0dGluZ1NjcmVlblZpZXcnLCBDdXJ2ZUZpdHRpbmdTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEN1cnZlRml0dGluZ1NjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLFNBQVNDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDN0QsT0FBT0MsWUFBWSxNQUFNLHVCQUF1QjtBQUNoRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsMkJBQTJCLE1BQU0sbUNBQW1DO0FBQzNFLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFDeEMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxhQUFhLE1BQU0sb0JBQW9COztBQUU5QztBQUNBLE1BQU1DLG9DQUFvQyxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUVuRCxNQUFNQyxzQkFBc0IsU0FBU2YsVUFBVSxDQUFDO0VBRTlDO0FBQ0Y7QUFDQTtFQUNFZ0IsV0FBV0EsQ0FBRUMsS0FBSyxFQUFHO0lBRW5CLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0E7SUFDQSxNQUFNQyxzQ0FBc0MsR0FBRyxJQUFJdEIsZUFBZSxDQUFFLElBQUssQ0FBQzs7SUFFMUU7SUFDQSxNQUFNdUIsNkJBQTZCLEdBQUcsSUFBSXZC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