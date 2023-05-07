// Copyright 2015-2023, University of Colorado Boulder

/**
 * Single point node in 'Curve Fitting' simulation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { ButtonListener, Circle, Color, DragListener, Line, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import curveFitting from '../../curveFitting.js';
import CurveFittingStrings from '../../CurveFittingStrings.js';
import CurveFittingConstants from '../CurveFittingConstants.js';
import CurveFittingQueryParameters from '../CurveFittingQueryParameters.js';
const deltaEqualsPatternString = CurveFittingStrings.deltaEqualsPattern;
const pointCoordinatesPatternString = CurveFittingStrings.pointCoordinatesPattern;
const ySymbolString = CurveFittingStrings.ySymbol;

// constants
const Y_PATTERN = `<i style='font-family:${CurveFittingConstants.EQUATION_SYMBOL_FONT.family}'>{{y}}</i>`;

// range for delta
const MIN_DELTA = 1E-3; // arbitrarily small non-zero number for minimum delta, 0 causes divide-by-0 errors
const MAX_DELTA = 10;

// point (circle)
const POINT_COLOR = Color.toColor(CurveFittingConstants.POINT_FILL);
const POINT_OPTIONS = {
  fill: POINT_COLOR,
  stroke: CurveFittingConstants.POINT_STROKE,
  lineWidth: CurveFittingConstants.POINT_LINE_WIDTH
};
const POINT_HALO_OPTIONS = {
  fill: POINT_COLOR.withAlpha(0.3),
  pickable: false,
  visible: false
};

// displayed values (delta, coordinates)
const VALUE_TEXT_OPTIONS = {
  font: CurveFittingConstants.POINT_VALUE_FONT,
  maxWidth: 100 // determined empirically
};

const VALUE_MARGIN = 2;
const VALUE_BACKGROUND_CORNER_RADIUS = 4;

// error bars
const ERROR_BAR_COLOR = Color.toColor(CurveFittingConstants.BLUE_COLOR);
const ERROR_BAR_DILATION_X = 14;
const ERROR_BAR_DILATION_Y = 2;
const ERROR_BAR_BOUNDS = new Bounds2(-10, 0, 10, 2);
const ERROR_BAR_OPTIONS = {
  fill: ERROR_BAR_COLOR
};
const ERROR_BAR_HALO_BOUNDS = new Bounds2(-12, -2, 12, 4);
const ERROR_BAR_HALO_OPTIONS = {
  fill: ERROR_BAR_COLOR.withAlpha(0.3),
  pickable: false,
  visible: false
};

// Vertical line that connects the error bars
const CENTRAL_LINE_OPTIONS = {
  stroke: ERROR_BAR_COLOR,
  lineWidth: 1
};

// spacing
const DELTA_COORDINATES_Y_SPACING = 1; // vertical spacing between delta and coordinates
const POINT_COORDINATES_X_SPACING = 5; // horizontal space between point and coordinates
const ERROR_BAR_DELTA_X_SPACING = 2; // horizontal space between error bar and delta display

class PointNode extends Node {
  /**
   * @param {Point} point - Model for single point
   * @param {function} bumpOutFunction - a function that bumps this point out of invalid positions (see #131)
   * @param {Point[]} currentlyInteractingPoints - an array of points that are being interacted with currently
   *  is used to determine when points should be displaying their halos (see #133)
   * @param {Property.<boolean>} residualsVisibleProperty
   * @param {Property.<boolean>} valuesVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] for graph node.
   */
  constructor(point, bumpOutFunction, currentlyInteractingPoints, residualsVisibleProperty, valuesVisibleProperty, modelViewTransform, options) {
    super(merge({
      cursor: 'pointer'
    }, options));

    // bottom error bar
    const errorBarBottomRectangle = new Rectangle(ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS);
    const errorBarBottomHaloRectangle = new Rectangle(ERROR_BAR_HALO_BOUNDS, ERROR_BAR_HALO_OPTIONS);
    const errorBarBottomNode = new Node({
      children: [errorBarBottomRectangle, errorBarBottomHaloRectangle]
    });
    this.addChild(errorBarBottomNode);

    // top error bar
    const errorBarTopRectangle = new Rectangle(ERROR_BAR_BOUNDS, ERROR_BAR_OPTIONS);
    const errorBarTopHaloRectangle = new Rectangle(ERROR_BAR_HALO_BOUNDS, ERROR_BAR_HALO_OPTIONS);
    const errorBarTopNode = new Node({
      children: [errorBarTopRectangle, errorBarTopHaloRectangle]
    });
    this.addChild(errorBarTopNode);

    // central line, of length zero initially
    const centralLine = new Line(0, 0, 0, 0, CENTRAL_LINE_OPTIONS);
    this.addChild(centralLine);

    // delta text label
    const deltaTextLabel = new RichText('', VALUE_TEXT_OPTIONS); // text to be set by updateDelta
    const deltaTextBackground = new Rectangle(0, 0, 1, 1, {
      fill: 'white',
      opacity: 0.75,
      cornerRadius: VALUE_BACKGROUND_CORNER_RADIUS
    });
    this.addChild(deltaTextBackground);
    this.addChild(deltaTextLabel);

    // handler for delta halos
    const barHaloHandler = new ButtonListener({
      up: () => {
        errorBarTopHaloRectangle.visible = false;
        errorBarBottomHaloRectangle.visible = false;
      },
      down: () => {
        errorBarTopHaloRectangle.visible = true;
        errorBarBottomHaloRectangle.visible = true;
      },
      over: () => {
        errorBarTopHaloRectangle.visible = currentlyInteractingPoints.length === 0;
        errorBarBottomHaloRectangle.visible = currentlyInteractingPoints.length === 0;
      }
    });
    errorBarBottomRectangle.addInputListener(barHaloHandler);
    errorBarTopRectangle.addInputListener(barHaloHandler);

    // point view
    const circleView = new Circle(CurveFittingConstants.POINT_RADIUS, POINT_OPTIONS);
    circleView.touchArea = circleView.bounds.dilated(5);
    circleView.mouseArea = circleView.bounds.dilated(5);
    this.addChild(circleView);

    // utility functions that record this point in the currentlyInteractingPoints array as being interacted with or not
    const addPointAsCurrentlyInteracting = () => {
      if (!_.includes(currentlyInteractingPoints, point)) {
        currentlyInteractingPoints.push(point);
      }
    };
    const removePointFromCurrentlyInteracting = () => {
      if (_.includes(currentlyInteractingPoints, point)) {
        currentlyInteractingPoints.splice(currentlyInteractingPoints.indexOf(point), 1);
      }
    };

    // variables that allow for the top bar to be dragged in either direction when it covers the bottom bar; see #127
    // initialTopBarDragPosition is null unless it is relevant for choosing a dragging direction
    let shouldTopBarActLikeBottomBar = false;
    let initialTopBarDragPosition = null;

    // handling for error bar dragging
    let isDraggingDeltaTop = false;
    let isDraggingDeltaBottom = false;
    errorBarTopRectangle.addInputListener(new DragListener({
      start: event => {
        isDraggingDeltaTop = !isDraggingDeltaBottom;

        // the top bar is currently covering the bottom bar so initialTopBarDragPosition is set to be non-null
        // initialTopBarDragPosition is now set to the current mouse position because it is now relevant
        //  for choosing a drag direction
        if (point.deltaProperty.value === MIN_DELTA) {
          initialTopBarDragPosition = event.pointer.point;
        }
        addPointAsCurrentlyInteracting();
      },
      drag: event => {
        if (!isDraggingDeltaTop) {
          return;
        }

        // necessary because button listener doesn't activate for touch snag
        errorBarTopHaloRectangle.visible = true;
        errorBarBottomHaloRectangle.visible = true;
        let newUnclampedDelta = modelViewTransform.viewToModelDeltaY(this.globalToLocalPoint(event.pointer.point).y - circleView.centerY);

        // If initialTopBarDragPosition has a value, that means that it is intentionally so because the user can
        // choose a drag direction the allowed direction of the top bar drag is now set by whether the user dragged
        // up or down. If the user dragged down, the top bar acts like the bottom bar because that is how the user
        // interacted with it for this case, the user couldn't have interacted with the actual bottom bar because
        // it was covered by this top one.
        if (initialTopBarDragPosition !== null) {
          shouldTopBarActLikeBottomBar = event.pointer.point.y > initialTopBarDragPosition.y;
          initialTopBarDragPosition = null;
        }
        if (shouldTopBarActLikeBottomBar) {
          newUnclampedDelta = modelViewTransform.viewToModelDeltaY(circleView.centerY - this.globalToLocalPoint(event.pointer.point).y);
        }
        point.deltaProperty.value = Utils.clamp(newUnclampedDelta, MIN_DELTA, MAX_DELTA);
      },
      end: () => {
        isDraggingDeltaTop = false;
        shouldTopBarActLikeBottomBar = false;
        initialTopBarDragPosition = null;
        removePointFromCurrentlyInteracting();

        // necessary because button listener doesn't activate for touch snag
        errorBarTopHaloRectangle.visible = false;
        errorBarBottomHaloRectangle.visible = false;
      }
    }));
    errorBarBottomRectangle.addInputListener(new DragListener({
      start: () => {
        isDraggingDeltaBottom = !isDraggingDeltaTop;
        addPointAsCurrentlyInteracting();
      },
      drag: event => {
        if (!isDraggingDeltaBottom) {
          return;
        }

        // necessary because button listener doesn't activate for touch snag
        errorBarTopHaloRectangle.visible = true;
        errorBarBottomHaloRectangle.visible = true;
        point.deltaProperty.value = Utils.clamp(modelViewTransform.viewToModelDeltaY(circleView.centerY - this.globalToLocalPoint(event.pointer.point).y), MIN_DELTA, MAX_DELTA);
      },
      end: () => {
        isDraggingDeltaBottom = false;
        removePointFromCurrentlyInteracting();

        // necessary because button listener doesn't activate for touch snag
        errorBarTopHaloRectangle.visible = false;
        errorBarBottomHaloRectangle.visible = false;
      }
    }));

    // value text label
    const valueTextLabel = new Text(StringUtils.fillIn(pointCoordinatesPatternString, {
      xCoordinate: Utils.toFixed(point.positionProperty.value.x, 1),
      yCoordinate: Utils.toFixed(point.positionProperty.value.y, 1)
    }), VALUE_TEXT_OPTIONS);
    const valueTextBackground = new Rectangle(0, 0, 1, 1, {
      fill: CurveFittingConstants.POINT_FILL,
      opacity: 0.75,
      cornerRadius: VALUE_BACKGROUND_CORNER_RADIUS
    });
    this.addChild(valueTextBackground);
    this.addChild(valueTextLabel);

    // add drag handler for point
    circleView.addInputListener(new DragListener({
      allowTouchSnag: true,
      start: () => {
        point.draggingProperty.value = true;
        this.moveToFront();
        addPointAsCurrentlyInteracting();
      },
      drag: event => {
        if (!point.draggingProperty.value) {
          return;
        }
        point.positionProperty.value = modelViewTransform.viewToModelPosition(this.globalToLocalPoint(event.pointer.point));
      },
      end: () => {
        point.draggingProperty.value = false;
        bumpOutFunction();
        if (CurveFittingQueryParameters.snapToGrid) {
          point.positionProperty.value = new Vector2(Utils.toFixedNumber(point.positionProperty.value.x, 0), Utils.toFixedNumber(point.positionProperty.value.y, 0));
        }
        removePointFromCurrentlyInteracting();
      }
    }));

    /**
     * updates the error bars and corresponding text
     */
    function updateDelta() {
      // update text
      deltaTextLabel.string = StringUtils.fillIn(deltaEqualsPatternString, {
        y: StringUtils.fillIn(Y_PATTERN, {
          y: ySymbolString
        }),
        deltaValue: Utils.toFixed(point.deltaProperty.value, 1)
      });
      const lineHeight = modelViewTransform.modelToViewDeltaY(point.deltaProperty.value);

      // update top error bar
      errorBarTopNode.setTranslation(circleView.centerX, circleView.centerY + lineHeight - ERROR_BAR_BOUNDS.height / 2);
      errorBarTopRectangle.touchArea = errorBarTopNode.localBounds.dilatedXY(ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y);
      errorBarTopRectangle.mouseArea = errorBarTopNode.localBounds.dilatedXY(ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y);

      // update central line
      centralLine.setX1(circleView.centerX);
      centralLine.setX2(circleView.centerX);
      centralLine.setY1(circleView.centerY + lineHeight);
      centralLine.setY2(circleView.centerY - lineHeight);

      // update bottom error bar
      errorBarBottomNode.setTranslation(circleView.centerX, circleView.centerY - lineHeight - ERROR_BAR_BOUNDS.height / 2);
      errorBarBottomRectangle.touchArea = errorBarBottomNode.localBounds.dilatedXY(ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y);
      errorBarBottomRectangle.mouseArea = errorBarBottomNode.localBounds.dilatedXY(ERROR_BAR_DILATION_X, ERROR_BAR_DILATION_Y);

      // update text background positioning
      deltaTextBackground.centerY = errorBarTopNode.centerY;
      deltaTextBackground.left = errorBarTopNode.right + ERROR_BAR_DELTA_X_SPACING;
      deltaTextBackground.setRect(0, 0, deltaTextLabel.width + 2 * VALUE_MARGIN, deltaTextLabel.height + 2 * VALUE_MARGIN);

      // update label and background and ensure that coordinate and delta backgrounds do not intersect
      if (deltaTextBackground.bottom > valueTextBackground.top - DELTA_COORDINATES_Y_SPACING) {
        deltaTextBackground.bottom = valueTextBackground.top - DELTA_COORDINATES_Y_SPACING;
      }

      // set text position to final background position
      deltaTextLabel.center = deltaTextBackground.center;
    }

    // must be unlinked in dispose
    point.deltaProperty.link(updateDelta);

    /**
     * updates the value text for the coordinates and the position of the labels
     */
    function updateValue() {
      // update text
      valueTextLabel.string = StringUtils.fillIn(pointCoordinatesPatternString, {
        xCoordinate: Utils.toFixed(point.positionProperty.value.x, 1),
        yCoordinate: Utils.toFixed(point.positionProperty.value.y, 1)
      });

      // update visibility
      valueTextLabel.visible = valuesVisibleProperty.value && point.isInsideGraphProperty.value;
      valueTextBackground.visible = valueTextLabel.visible;

      // update positionings
      valueTextBackground.left = circleView.right + POINT_COORDINATES_X_SPACING;
      valueTextBackground.centerY = circleView.centerY;
      valueTextBackground.setRect(0, 0, valueTextLabel.width + 2 * VALUE_MARGIN, valueTextLabel.height + 2 * VALUE_MARGIN);
      valueTextLabel.center = valueTextBackground.center;
    }

    // these require unlink in dispose
    const valueBackgroundHandle = visible => {
      valueTextBackground.visible = visible;
    };
    const valueTextHandle = visible => {
      valueTextLabel.visible = visible;
    };
    const deltaBackgroundHandle = visible => {
      deltaTextBackground.visible = visible;
    };
    const deltaTextHandle = visible => {
      deltaTextLabel.visible = visible;
    };
    valuesVisibleProperty.link(valueBackgroundHandle);
    valuesVisibleProperty.link(valueTextHandle);
    valuesVisibleProperty.link(deltaBackgroundHandle);
    valuesVisibleProperty.link(deltaTextHandle);

    /**
     * updates how the error bars look based on whether the residuals are visible or not
     * @param {boolean} residualsVisible
     */
    function updateErrorBarsBasedOnResidualsVisibility(residualsVisible) {
      if (residualsVisible) {
        centralLine.visible = false;
        errorBarTopRectangle.setFill(CurveFittingConstants.LIGHT_GRAY_COLOR);
        errorBarBottomRectangle.setFill(CurveFittingConstants.LIGHT_GRAY_COLOR);
      } else {
        centralLine.visible = true;
        errorBarTopRectangle.setFill(CurveFittingConstants.BLUE_COLOR);
        errorBarBottomRectangle.setFill(CurveFittingConstants.BLUE_COLOR);
      }
    }

    // must be unlinked in dispose
    residualsVisibleProperty.link(updateErrorBarsBasedOnResidualsVisibility);

    // point halo
    const haloPointNode = new Circle(1.75 * CurveFittingConstants.POINT_RADIUS, POINT_HALO_OPTIONS);
    this.addChild(haloPointNode);
    circleView.addInputListener(new ButtonListener({
      up: () => {
        haloPointNode.visible = false;
      },
      down: () => {
        haloPointNode.visible = true;
      },
      over: () => {
        haloPointNode.visible = currentlyInteractingPoints.length === 0 || _.includes(currentlyInteractingPoints, point);
      }
    }));

    /**
     * updates all the view positions and texts whenever the point model's position changes
     * @param {Vector2} position
     */
    function centerPositionListener(position) {
      circleView.center = modelViewTransform.modelToViewPosition(position);
      haloPointNode.center = circleView.center;
      updateValue();
      updateDelta();
    }

    // must be unlinked in dispose
    point.positionProperty.link(centerPositionListener);

    // @private
    this.disposePointNode = () => {
      point.deltaProperty.unlink(updateDelta);
      point.positionProperty.unlink(centerPositionListener);
      residualsVisibleProperty.unlink(updateErrorBarsBasedOnResidualsVisibility);
      valuesVisibleProperty.unlink(deltaTextHandle);
      valuesVisibleProperty.unlink(valueTextHandle);
      valuesVisibleProperty.unlink(deltaBackgroundHandle);
      valuesVisibleProperty.unlink(valueBackgroundHandle);
    };
  }

  // @public
  dispose() {
    this.disposePointNode();
    super.dispose();
  }
}
curveFitting.register('PointNode', PointNode);
export default PointNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIkJ1dHRvbkxpc3RlbmVyIiwiQ2lyY2xlIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJMaW5lIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVGV4dCIsImN1cnZlRml0dGluZyIsIkN1cnZlRml0dGluZ1N0cmluZ3MiLCJDdXJ2ZUZpdHRpbmdDb25zdGFudHMiLCJDdXJ2ZUZpdHRpbmdRdWVyeVBhcmFtZXRlcnMiLCJkZWx0YUVxdWFsc1BhdHRlcm5TdHJpbmciLCJkZWx0YUVxdWFsc1BhdHRlcm4iLCJwb2ludENvb3JkaW5hdGVzUGF0dGVyblN0cmluZyIsInBvaW50Q29vcmRpbmF0ZXNQYXR0ZXJuIiwieVN5bWJvbFN0cmluZyIsInlTeW1ib2wiLCJZX1BBVFRFUk4iLCJFUVVBVElPTl9TWU1CT0xfRk9OVCIsImZhbWlseSIsIk1JTl9ERUxUQSIsIk1BWF9ERUxUQSIsIlBPSU5UX0NPTE9SIiwidG9Db2xvciIsIlBPSU5UX0ZJTEwiLCJQT0lOVF9PUFRJT05TIiwiZmlsbCIsInN0cm9rZSIsIlBPSU5UX1NUUk9LRSIsImxpbmVXaWR0aCIsIlBPSU5UX0xJTkVfV0lEVEgiLCJQT0lOVF9IQUxPX09QVElPTlMiLCJ3aXRoQWxwaGEiLCJwaWNrYWJsZSIsInZpc2libGUiLCJWQUxVRV9URVhUX09QVElPTlMiLCJmb250IiwiUE9JTlRfVkFMVUVfRk9OVCIsIm1heFdpZHRoIiwiVkFMVUVfTUFSR0lOIiwiVkFMVUVfQkFDS0dST1VORF9DT1JORVJfUkFESVVTIiwiRVJST1JfQkFSX0NPTE9SIiwiQkxVRV9DT0xPUiIsIkVSUk9SX0JBUl9ESUxBVElPTl9YIiwiRVJST1JfQkFSX0RJTEFUSU9OX1kiLCJFUlJPUl9CQVJfQk9VTkRTIiwiRVJST1JfQkFSX09QVElPTlMiLCJFUlJPUl9CQVJfSEFMT19CT1VORFMiLCJFUlJPUl9CQVJfSEFMT19PUFRJT05TIiwiQ0VOVFJBTF9MSU5FX09QVElPTlMiLCJERUxUQV9DT09SRElOQVRFU19ZX1NQQUNJTkciLCJQT0lOVF9DT09SRElOQVRFU19YX1NQQUNJTkciLCJFUlJPUl9CQVJfREVMVEFfWF9TUEFDSU5HIiwiUG9pbnROb2RlIiwiY29uc3RydWN0b3IiLCJwb2ludCIsImJ1bXBPdXRGdW5jdGlvbiIsImN1cnJlbnRseUludGVyYWN0aW5nUG9pbnRzIiwicmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5IiwidmFsdWVzVmlzaWJsZVByb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwib3B0aW9ucyIsImN1cnNvciIsImVycm9yQmFyQm90dG9tUmVjdGFuZ2xlIiwiZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlIiwiZXJyb3JCYXJCb3R0b21Ob2RlIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImVycm9yQmFyVG9wUmVjdGFuZ2xlIiwiZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlIiwiZXJyb3JCYXJUb3BOb2RlIiwiY2VudHJhbExpbmUiLCJkZWx0YVRleHRMYWJlbCIsImRlbHRhVGV4dEJhY2tncm91bmQiLCJvcGFjaXR5IiwiY29ybmVyUmFkaXVzIiwiYmFySGFsb0hhbmRsZXIiLCJ1cCIsImRvd24iLCJvdmVyIiwibGVuZ3RoIiwiYWRkSW5wdXRMaXN0ZW5lciIsImNpcmNsZVZpZXciLCJQT0lOVF9SQURJVVMiLCJ0b3VjaEFyZWEiLCJib3VuZHMiLCJkaWxhdGVkIiwibW91c2VBcmVhIiwiYWRkUG9pbnRBc0N1cnJlbnRseUludGVyYWN0aW5nIiwiXyIsImluY2x1ZGVzIiwicHVzaCIsInJlbW92ZVBvaW50RnJvbUN1cnJlbnRseUludGVyYWN0aW5nIiwic3BsaWNlIiwiaW5kZXhPZiIsInNob3VsZFRvcEJhckFjdExpa2VCb3R0b21CYXIiLCJpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uIiwiaXNEcmFnZ2luZ0RlbHRhVG9wIiwiaXNEcmFnZ2luZ0RlbHRhQm90dG9tIiwic3RhcnQiLCJldmVudCIsImRlbHRhUHJvcGVydHkiLCJ2YWx1ZSIsInBvaW50ZXIiLCJkcmFnIiwibmV3VW5jbGFtcGVkRGVsdGEiLCJ2aWV3VG9Nb2RlbERlbHRhWSIsImdsb2JhbFRvTG9jYWxQb2ludCIsInkiLCJjZW50ZXJZIiwiY2xhbXAiLCJlbmQiLCJ2YWx1ZVRleHRMYWJlbCIsImZpbGxJbiIsInhDb29yZGluYXRlIiwidG9GaXhlZCIsInBvc2l0aW9uUHJvcGVydHkiLCJ4IiwieUNvb3JkaW5hdGUiLCJ2YWx1ZVRleHRCYWNrZ3JvdW5kIiwiYWxsb3dUb3VjaFNuYWciLCJkcmFnZ2luZ1Byb3BlcnR5IiwibW92ZVRvRnJvbnQiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwic25hcFRvR3JpZCIsInRvRml4ZWROdW1iZXIiLCJ1cGRhdGVEZWx0YSIsInN0cmluZyIsImRlbHRhVmFsdWUiLCJsaW5lSGVpZ2h0IiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJzZXRUcmFuc2xhdGlvbiIsImNlbnRlclgiLCJoZWlnaHQiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsInNldFgxIiwic2V0WDIiLCJzZXRZMSIsInNldFkyIiwibGVmdCIsInJpZ2h0Iiwic2V0UmVjdCIsIndpZHRoIiwiYm90dG9tIiwidG9wIiwiY2VudGVyIiwibGluayIsInVwZGF0ZVZhbHVlIiwiaXNJbnNpZGVHcmFwaFByb3BlcnR5IiwidmFsdWVCYWNrZ3JvdW5kSGFuZGxlIiwidmFsdWVUZXh0SGFuZGxlIiwiZGVsdGFCYWNrZ3JvdW5kSGFuZGxlIiwiZGVsdGFUZXh0SGFuZGxlIiwidXBkYXRlRXJyb3JCYXJzQmFzZWRPblJlc2lkdWFsc1Zpc2liaWxpdHkiLCJyZXNpZHVhbHNWaXNpYmxlIiwic2V0RmlsbCIsIkxJR0hUX0dSQVlfQ09MT1IiLCJoYWxvUG9pbnROb2RlIiwiY2VudGVyUG9zaXRpb25MaXN0ZW5lciIsInBvc2l0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImRpc3Bvc2VQb2ludE5vZGUiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2luZ2xlIHBvaW50IG5vZGUgaW4gJ0N1cnZlIEZpdHRpbmcnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IEJ1dHRvbkxpc3RlbmVyLCBDaXJjbGUsIENvbG9yLCBEcmFnTGlzdGVuZXIsIExpbmUsIE5vZGUsIFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY3VydmVGaXR0aW5nIGZyb20gJy4uLy4uL2N1cnZlRml0dGluZy5qcyc7XHJcbmltcG9ydCBDdXJ2ZUZpdHRpbmdTdHJpbmdzIGZyb20gJy4uLy4uL0N1cnZlRml0dGluZ1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ3VydmVGaXR0aW5nQ29uc3RhbnRzIGZyb20gJy4uL0N1cnZlRml0dGluZ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDdXJ2ZUZpdHRpbmdRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQ3VydmVGaXR0aW5nUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuXHJcbmNvbnN0IGRlbHRhRXF1YWxzUGF0dGVyblN0cmluZyA9IEN1cnZlRml0dGluZ1N0cmluZ3MuZGVsdGFFcXVhbHNQYXR0ZXJuO1xyXG5jb25zdCBwb2ludENvb3JkaW5hdGVzUGF0dGVyblN0cmluZyA9IEN1cnZlRml0dGluZ1N0cmluZ3MucG9pbnRDb29yZGluYXRlc1BhdHRlcm47XHJcbmNvbnN0IHlTeW1ib2xTdHJpbmcgPSBDdXJ2ZUZpdHRpbmdTdHJpbmdzLnlTeW1ib2w7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgWV9QQVRURVJOID0gYDxpIHN0eWxlPSdmb250LWZhbWlseToke0N1cnZlRml0dGluZ0NvbnN0YW50cy5FUVVBVElPTl9TWU1CT0xfRk9OVC5mYW1pbHl9Jz57e3l9fTwvaT5gO1xyXG5cclxuLy8gcmFuZ2UgZm9yIGRlbHRhXHJcbmNvbnN0IE1JTl9ERUxUQSA9IDFFLTM7IC8vIGFyYml0cmFyaWx5IHNtYWxsIG5vbi16ZXJvIG51bWJlciBmb3IgbWluaW11bSBkZWx0YSwgMCBjYXVzZXMgZGl2aWRlLWJ5LTAgZXJyb3JzXHJcbmNvbnN0IE1BWF9ERUxUQSA9IDEwO1xyXG5cclxuLy8gcG9pbnQgKGNpcmNsZSlcclxuY29uc3QgUE9JTlRfQ09MT1IgPSBDb2xvci50b0NvbG9yKCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuUE9JTlRfRklMTCApO1xyXG5jb25zdCBQT0lOVF9PUFRJT05TID0ge1xyXG4gIGZpbGw6IFBPSU5UX0NPTE9SLFxyXG4gIHN0cm9rZTogQ3VydmVGaXR0aW5nQ29uc3RhbnRzLlBPSU5UX1NUUk9LRSxcclxuICBsaW5lV2lkdGg6IEN1cnZlRml0dGluZ0NvbnN0YW50cy5QT0lOVF9MSU5FX1dJRFRIXHJcbn07XHJcbmNvbnN0IFBPSU5UX0hBTE9fT1BUSU9OUyA9IHtcclxuICBmaWxsOiBQT0lOVF9DT0xPUi53aXRoQWxwaGEoIDAuMyApLFxyXG4gIHBpY2thYmxlOiBmYWxzZSxcclxuICB2aXNpYmxlOiBmYWxzZVxyXG59O1xyXG5cclxuLy8gZGlzcGxheWVkIHZhbHVlcyAoZGVsdGEsIGNvb3JkaW5hdGVzKVxyXG5jb25zdCBWQUxVRV9URVhUX09QVElPTlMgPSB7XHJcbiAgZm9udDogQ3VydmVGaXR0aW5nQ29uc3RhbnRzLlBPSU5UX1ZBTFVFX0ZPTlQsXHJcbiAgbWF4V2lkdGg6IDEwMCAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbn07XHJcbmNvbnN0IFZBTFVFX01BUkdJTiA9IDI7XHJcbmNvbnN0IFZBTFVFX0JBQ0tHUk9VTkRfQ09STkVSX1JBRElVUyA9IDQ7XHJcblxyXG4vLyBlcnJvciBiYXJzXHJcbmNvbnN0IEVSUk9SX0JBUl9DT0xPUiA9IENvbG9yLnRvQ29sb3IoIEN1cnZlRml0dGluZ0NvbnN0YW50cy5CTFVFX0NPTE9SICk7XHJcbmNvbnN0IEVSUk9SX0JBUl9ESUxBVElPTl9YID0gMTQ7XHJcbmNvbnN0IEVSUk9SX0JBUl9ESUxBVElPTl9ZID0gMjtcclxuY29uc3QgRVJST1JfQkFSX0JPVU5EUyA9IG5ldyBCb3VuZHMyKCAtMTAsIDAsIDEwLCAyICk7XHJcbmNvbnN0IEVSUk9SX0JBUl9PUFRJT05TID0ge1xyXG4gIGZpbGw6IEVSUk9SX0JBUl9DT0xPUlxyXG59O1xyXG5jb25zdCBFUlJPUl9CQVJfSEFMT19CT1VORFMgPSBuZXcgQm91bmRzMiggLTEyLCAtMiwgMTIsIDQgKTtcclxuY29uc3QgRVJST1JfQkFSX0hBTE9fT1BUSU9OUyA9IHtcclxuICBmaWxsOiBFUlJPUl9CQVJfQ09MT1Iud2l0aEFscGhhKCAwLjMgKSxcclxuICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgdmlzaWJsZTogZmFsc2VcclxufTtcclxuXHJcbi8vIFZlcnRpY2FsIGxpbmUgdGhhdCBjb25uZWN0cyB0aGUgZXJyb3IgYmFyc1xyXG5jb25zdCBDRU5UUkFMX0xJTkVfT1BUSU9OUyA9IHtcclxuICBzdHJva2U6IEVSUk9SX0JBUl9DT0xPUixcclxuICBsaW5lV2lkdGg6IDFcclxufTtcclxuXHJcbi8vIHNwYWNpbmdcclxuY29uc3QgREVMVEFfQ09PUkRJTkFURVNfWV9TUEFDSU5HID0gMTsgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIGRlbHRhIGFuZCBjb29yZGluYXRlc1xyXG5jb25zdCBQT0lOVF9DT09SRElOQVRFU19YX1NQQUNJTkcgPSA1OyAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gcG9pbnQgYW5kIGNvb3JkaW5hdGVzXHJcbmNvbnN0IEVSUk9SX0JBUl9ERUxUQV9YX1NQQUNJTkcgPSAyOyAvLyBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gZXJyb3IgYmFyIGFuZCBkZWx0YSBkaXNwbGF5XHJcblxyXG5jbGFzcyBQb2ludE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQb2ludH0gcG9pbnQgLSBNb2RlbCBmb3Igc2luZ2xlIHBvaW50XHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gYnVtcE91dEZ1bmN0aW9uIC0gYSBmdW5jdGlvbiB0aGF0IGJ1bXBzIHRoaXMgcG9pbnQgb3V0IG9mIGludmFsaWQgcG9zaXRpb25zIChzZWUgIzEzMSlcclxuICAgKiBAcGFyYW0ge1BvaW50W119IGN1cnJlbnRseUludGVyYWN0aW5nUG9pbnRzIC0gYW4gYXJyYXkgb2YgcG9pbnRzIHRoYXQgYXJlIGJlaW5nIGludGVyYWN0ZWQgd2l0aCBjdXJyZW50bHlcclxuICAgKiAgaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hlbiBwb2ludHMgc2hvdWxkIGJlIGRpc3BsYXlpbmcgdGhlaXIgaGFsb3MgKHNlZSAjMTMzKVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSByZXNpZHVhbHNWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gdmFsdWVzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIGZvciBncmFwaCBub2RlLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwb2ludCwgYnVtcE91dEZ1bmN0aW9uLCBjdXJyZW50bHlJbnRlcmFjdGluZ1BvaW50cywgcmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5LCB2YWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggbWVyZ2UoIHsgY3Vyc29yOiAncG9pbnRlcicgfSwgb3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gYm90dG9tIGVycm9yIGJhclxyXG4gICAgY29uc3QgZXJyb3JCYXJCb3R0b21SZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCBFUlJPUl9CQVJfQk9VTkRTLCBFUlJPUl9CQVJfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggRVJST1JfQkFSX0hBTE9fQk9VTkRTLCBFUlJPUl9CQVJfSEFMT19PUFRJT05TICk7XHJcbiAgICBjb25zdCBlcnJvckJhckJvdHRvbU5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBlcnJvckJhckJvdHRvbVJlY3RhbmdsZSwgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlIF0gfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZXJyb3JCYXJCb3R0b21Ob2RlICk7XHJcblxyXG4gICAgLy8gdG9wIGVycm9yIGJhclxyXG4gICAgY29uc3QgZXJyb3JCYXJUb3BSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCBFUlJPUl9CQVJfQk9VTkRTLCBFUlJPUl9CQVJfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggRVJST1JfQkFSX0hBTE9fQk9VTkRTLCBFUlJPUl9CQVJfSEFMT19PUFRJT05TICk7XHJcbiAgICBjb25zdCBlcnJvckJhclRvcE5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBlcnJvckJhclRvcFJlY3RhbmdsZSwgZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlIF0gfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZXJyb3JCYXJUb3BOb2RlICk7XHJcblxyXG4gICAgLy8gY2VudHJhbCBsaW5lLCBvZiBsZW5ndGggemVybyBpbml0aWFsbHlcclxuICAgIGNvbnN0IGNlbnRyYWxMaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIDAsIENFTlRSQUxfTElORV9PUFRJT05TICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjZW50cmFsTGluZSApO1xyXG5cclxuICAgIC8vIGRlbHRhIHRleHQgbGFiZWxcclxuICAgIGNvbnN0IGRlbHRhVGV4dExhYmVsID0gbmV3IFJpY2hUZXh0KCAnJywgVkFMVUVfVEVYVF9PUFRJT05TICk7IC8vIHRleHQgdG8gYmUgc2V0IGJ5IHVwZGF0ZURlbHRhXHJcbiAgICBjb25zdCBkZWx0YVRleHRCYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMSwgMSwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBvcGFjaXR5OiAwLjc1LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IFZBTFVFX0JBQ0tHUk9VTkRfQ09STkVSX1JBRElVU1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZGVsdGFUZXh0QmFja2dyb3VuZCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZGVsdGFUZXh0TGFiZWwgKTtcclxuXHJcbiAgICAvLyBoYW5kbGVyIGZvciBkZWx0YSBoYWxvc1xyXG4gICAgY29uc3QgYmFySGFsb0hhbmRsZXIgPSBuZXcgQnV0dG9uTGlzdGVuZXIoIHtcclxuICAgICAgdXA6ICgpID0+IHtcclxuICAgICAgICBlcnJvckJhclRvcEhhbG9SZWN0YW5nbGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIGVycm9yQmFyQm90dG9tSGFsb1JlY3RhbmdsZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRvd246ICgpID0+IHtcclxuICAgICAgICBlcnJvckJhclRvcEhhbG9SZWN0YW5nbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICBvdmVyOiAoKSA9PiB7XHJcbiAgICAgICAgZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlLnZpc2libGUgPSBjdXJyZW50bHlJbnRlcmFjdGluZ1BvaW50cy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlLnZpc2libGUgPSBjdXJyZW50bHlJbnRlcmFjdGluZ1BvaW50cy5sZW5ndGggPT09IDA7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGVycm9yQmFyQm90dG9tUmVjdGFuZ2xlLmFkZElucHV0TGlzdGVuZXIoIGJhckhhbG9IYW5kbGVyICk7XHJcbiAgICBlcnJvckJhclRvcFJlY3RhbmdsZS5hZGRJbnB1dExpc3RlbmVyKCBiYXJIYWxvSGFuZGxlciApO1xyXG5cclxuICAgIC8vIHBvaW50IHZpZXdcclxuICAgIGNvbnN0IGNpcmNsZVZpZXcgPSBuZXcgQ2lyY2xlKCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuUE9JTlRfUkFESVVTLCBQT0lOVF9PUFRJT05TICk7XHJcbiAgICBjaXJjbGVWaWV3LnRvdWNoQXJlYSA9IGNpcmNsZVZpZXcuYm91bmRzLmRpbGF0ZWQoIDUgKTtcclxuICAgIGNpcmNsZVZpZXcubW91c2VBcmVhID0gY2lyY2xlVmlldy5ib3VuZHMuZGlsYXRlZCggNSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2lyY2xlVmlldyApO1xyXG5cclxuICAgIC8vIHV0aWxpdHkgZnVuY3Rpb25zIHRoYXQgcmVjb3JkIHRoaXMgcG9pbnQgaW4gdGhlIGN1cnJlbnRseUludGVyYWN0aW5nUG9pbnRzIGFycmF5IGFzIGJlaW5nIGludGVyYWN0ZWQgd2l0aCBvciBub3RcclxuICAgIGNvbnN0IGFkZFBvaW50QXNDdXJyZW50bHlJbnRlcmFjdGluZyA9ICgpID0+IHtcclxuICAgICAgaWYgKCAhXy5pbmNsdWRlcyggY3VycmVudGx5SW50ZXJhY3RpbmdQb2ludHMsIHBvaW50ICkgKSB7XHJcbiAgICAgICAgY3VycmVudGx5SW50ZXJhY3RpbmdQb2ludHMucHVzaCggcG9pbnQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IHJlbW92ZVBvaW50RnJvbUN1cnJlbnRseUludGVyYWN0aW5nID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIF8uaW5jbHVkZXMoIGN1cnJlbnRseUludGVyYWN0aW5nUG9pbnRzLCBwb2ludCApICkge1xyXG4gICAgICAgIGN1cnJlbnRseUludGVyYWN0aW5nUG9pbnRzLnNwbGljZSggY3VycmVudGx5SW50ZXJhY3RpbmdQb2ludHMuaW5kZXhPZiggcG9pbnQgKSwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHZhcmlhYmxlcyB0aGF0IGFsbG93IGZvciB0aGUgdG9wIGJhciB0byBiZSBkcmFnZ2VkIGluIGVpdGhlciBkaXJlY3Rpb24gd2hlbiBpdCBjb3ZlcnMgdGhlIGJvdHRvbSBiYXI7IHNlZSAjMTI3XHJcbiAgICAvLyBpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uIGlzIG51bGwgdW5sZXNzIGl0IGlzIHJlbGV2YW50IGZvciBjaG9vc2luZyBhIGRyYWdnaW5nIGRpcmVjdGlvblxyXG4gICAgbGV0IHNob3VsZFRvcEJhckFjdExpa2VCb3R0b21CYXIgPSBmYWxzZTtcclxuICAgIGxldCBpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBoYW5kbGluZyBmb3IgZXJyb3IgYmFyIGRyYWdnaW5nXHJcbiAgICBsZXQgaXNEcmFnZ2luZ0RlbHRhVG9wID0gZmFsc2U7XHJcbiAgICBsZXQgaXNEcmFnZ2luZ0RlbHRhQm90dG9tID0gZmFsc2U7XHJcbiAgICBlcnJvckJhclRvcFJlY3RhbmdsZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHN0YXJ0OiBldmVudCA9PiB7XHJcbiAgICAgICAgaXNEcmFnZ2luZ0RlbHRhVG9wID0gIWlzRHJhZ2dpbmdEZWx0YUJvdHRvbTtcclxuXHJcbiAgICAgICAgLy8gdGhlIHRvcCBiYXIgaXMgY3VycmVudGx5IGNvdmVyaW5nIHRoZSBib3R0b20gYmFyIHNvIGluaXRpYWxUb3BCYXJEcmFnUG9zaXRpb24gaXMgc2V0IHRvIGJlIG5vbi1udWxsXHJcbiAgICAgICAgLy8gaW5pdGlhbFRvcEJhckRyYWdQb3NpdGlvbiBpcyBub3cgc2V0IHRvIHRoZSBjdXJyZW50IG1vdXNlIHBvc2l0aW9uIGJlY2F1c2UgaXQgaXMgbm93IHJlbGV2YW50XHJcbiAgICAgICAgLy8gIGZvciBjaG9vc2luZyBhIGRyYWcgZGlyZWN0aW9uXHJcbiAgICAgICAgaWYgKCBwb2ludC5kZWx0YVByb3BlcnR5LnZhbHVlID09PSBNSU5fREVMVEEgKSB7XHJcbiAgICAgICAgICBpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uID0gZXZlbnQucG9pbnRlci5wb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFkZFBvaW50QXNDdXJyZW50bHlJbnRlcmFjdGluZygpO1xyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiBldmVudCA9PiB7XHJcbiAgICAgICAgaWYgKCAhaXNEcmFnZ2luZ0RlbHRhVG9wICkge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2UgYnV0dG9uIGxpc3RlbmVyIGRvZXNuJ3QgYWN0aXZhdGUgZm9yIHRvdWNoIHNuYWdcclxuICAgICAgICBlcnJvckJhclRvcEhhbG9SZWN0YW5nbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlLnZpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgbmV3VW5jbGFtcGVkRGVsdGEgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVkoXHJcbiAgICAgICAgICB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnkgLSBjaXJjbGVWaWV3LmNlbnRlcllcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBJZiBpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uIGhhcyBhIHZhbHVlLCB0aGF0IG1lYW5zIHRoYXQgaXQgaXMgaW50ZW50aW9uYWxseSBzbyBiZWNhdXNlIHRoZSB1c2VyIGNhblxyXG4gICAgICAgIC8vIGNob29zZSBhIGRyYWcgZGlyZWN0aW9uIHRoZSBhbGxvd2VkIGRpcmVjdGlvbiBvZiB0aGUgdG9wIGJhciBkcmFnIGlzIG5vdyBzZXQgYnkgd2hldGhlciB0aGUgdXNlciBkcmFnZ2VkXHJcbiAgICAgICAgLy8gdXAgb3IgZG93bi4gSWYgdGhlIHVzZXIgZHJhZ2dlZCBkb3duLCB0aGUgdG9wIGJhciBhY3RzIGxpa2UgdGhlIGJvdHRvbSBiYXIgYmVjYXVzZSB0aGF0IGlzIGhvdyB0aGUgdXNlclxyXG4gICAgICAgIC8vIGludGVyYWN0ZWQgd2l0aCBpdCBmb3IgdGhpcyBjYXNlLCB0aGUgdXNlciBjb3VsZG4ndCBoYXZlIGludGVyYWN0ZWQgd2l0aCB0aGUgYWN0dWFsIGJvdHRvbSBiYXIgYmVjYXVzZVxyXG4gICAgICAgIC8vIGl0IHdhcyBjb3ZlcmVkIGJ5IHRoaXMgdG9wIG9uZS5cclxuICAgICAgICBpZiAoIGluaXRpYWxUb3BCYXJEcmFnUG9zaXRpb24gIT09IG51bGwgKSB7XHJcbiAgICAgICAgICBzaG91bGRUb3BCYXJBY3RMaWtlQm90dG9tQmFyID0gZXZlbnQucG9pbnRlci5wb2ludC55ID4gaW5pdGlhbFRvcEJhckRyYWdQb3NpdGlvbi55O1xyXG4gICAgICAgICAgaW5pdGlhbFRvcEJhckRyYWdQb3NpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIHNob3VsZFRvcEJhckFjdExpa2VCb3R0b21CYXIgKSB7XHJcbiAgICAgICAgICBuZXdVbmNsYW1wZWREZWx0YSA9IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWShcclxuICAgICAgICAgICAgY2lyY2xlVmlldy5jZW50ZXJZIC0gdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS55XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwb2ludC5kZWx0YVByb3BlcnR5LnZhbHVlID0gVXRpbHMuY2xhbXAoXHJcbiAgICAgICAgICBuZXdVbmNsYW1wZWREZWx0YSxcclxuICAgICAgICAgIE1JTl9ERUxUQSxcclxuICAgICAgICAgIE1BWF9ERUxUQVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIGlzRHJhZ2dpbmdEZWx0YVRvcCA9IGZhbHNlO1xyXG4gICAgICAgIHNob3VsZFRvcEJhckFjdExpa2VCb3R0b21CYXIgPSBmYWxzZTtcclxuICAgICAgICBpbml0aWFsVG9wQmFyRHJhZ1Bvc2l0aW9uID0gbnVsbDtcclxuICAgICAgICByZW1vdmVQb2ludEZyb21DdXJyZW50bHlJbnRlcmFjdGluZygpO1xyXG5cclxuICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBidXR0b24gbGlzdGVuZXIgZG9lc24ndCBhY3RpdmF0ZSBmb3IgdG91Y2ggc25hZ1xyXG4gICAgICAgIGVycm9yQmFyVG9wSGFsb1JlY3RhbmdsZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgZXJyb3JCYXJCb3R0b21IYWxvUmVjdGFuZ2xlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcbiAgICBlcnJvckJhckJvdHRvbVJlY3RhbmdsZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIHN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgICAgaXNEcmFnZ2luZ0RlbHRhQm90dG9tID0gIWlzRHJhZ2dpbmdEZWx0YVRvcDtcclxuICAgICAgICBhZGRQb2ludEFzQ3VycmVudGx5SW50ZXJhY3RpbmcoKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIWlzRHJhZ2dpbmdEZWx0YUJvdHRvbSApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIGJ1dHRvbiBsaXN0ZW5lciBkb2Vzbid0IGFjdGl2YXRlIGZvciB0b3VjaCBzbmFnXHJcbiAgICAgICAgZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGVycm9yQmFyQm90dG9tSGFsb1JlY3RhbmdsZS52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcG9pbnQuZGVsdGFQcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmNsYW1wKFxyXG4gICAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFZKCBjaXJjbGVWaWV3LmNlbnRlclkgLSB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnkgKSxcclxuICAgICAgICAgIE1JTl9ERUxUQSxcclxuICAgICAgICAgIE1BWF9ERUxUQVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIGlzRHJhZ2dpbmdEZWx0YUJvdHRvbSA9IGZhbHNlO1xyXG4gICAgICAgIHJlbW92ZVBvaW50RnJvbUN1cnJlbnRseUludGVyYWN0aW5nKCk7XHJcblxyXG4gICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIGJ1dHRvbiBsaXN0ZW5lciBkb2Vzbid0IGFjdGl2YXRlIGZvciB0b3VjaCBzbmFnXHJcbiAgICAgICAgZXJyb3JCYXJUb3BIYWxvUmVjdGFuZ2xlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICBlcnJvckJhckJvdHRvbUhhbG9SZWN0YW5nbGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyB2YWx1ZSB0ZXh0IGxhYmVsXHJcbiAgICBjb25zdCB2YWx1ZVRleHRMYWJlbCA9IG5ldyBUZXh0KFxyXG4gICAgICBTdHJpbmdVdGlscy5maWxsSW4oIHBvaW50Q29vcmRpbmF0ZXNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgeENvb3JkaW5hdGU6IFV0aWxzLnRvRml4ZWQoIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgMSApLFxyXG4gICAgICAgIHlDb29yZGluYXRlOiBVdGlscy50b0ZpeGVkKCBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnksIDEgKVxyXG4gICAgICB9ICksXHJcbiAgICAgIFZBTFVFX1RFWFRfT1BUSU9OU1xyXG4gICAgKTtcclxuICAgIGNvbnN0IHZhbHVlVGV4dEJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxLCB7XHJcbiAgICAgIGZpbGw6IEN1cnZlRml0dGluZ0NvbnN0YW50cy5QT0lOVF9GSUxMLFxyXG4gICAgICBvcGFjaXR5OiAwLjc1LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IFZBTFVFX0JBQ0tHUk9VTkRfQ09STkVSX1JBRElVU1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmFsdWVUZXh0QmFja2dyb3VuZCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmFsdWVUZXh0TGFiZWwgKTtcclxuXHJcbiAgICAvLyBhZGQgZHJhZyBoYW5kbGVyIGZvciBwb2ludFxyXG4gICAgY2lyY2xlVmlldy5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgIHBvaW50LmRyYWdnaW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICBhZGRQb2ludEFzQ3VycmVudGx5SW50ZXJhY3RpbmcoKTtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIXBvaW50LmRyYWdnaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGhpcy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKSApO1xyXG4gICAgICB9LFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBwb2ludC5kcmFnZ2luZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgYnVtcE91dEZ1bmN0aW9uKCk7XHJcbiAgICAgICAgaWYgKCBDdXJ2ZUZpdHRpbmdRdWVyeVBhcmFtZXRlcnMuc25hcFRvR3JpZCApIHtcclxuICAgICAgICAgIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgVXRpbHMudG9GaXhlZE51bWJlciggcG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54LCAwICksXHJcbiAgICAgICAgICAgIFV0aWxzLnRvRml4ZWROdW1iZXIoIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueSwgMCApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZW1vdmVQb2ludEZyb21DdXJyZW50bHlJbnRlcmFjdGluZygpO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZXMgdGhlIGVycm9yIGJhcnMgYW5kIGNvcnJlc3BvbmRpbmcgdGV4dFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVEZWx0YSgpIHtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0ZXh0XHJcbiAgICAgIGRlbHRhVGV4dExhYmVsLnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggZGVsdGFFcXVhbHNQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgeTogU3RyaW5nVXRpbHMuZmlsbEluKCBZX1BBVFRFUk4sIHtcclxuICAgICAgICAgIHk6IHlTeW1ib2xTdHJpbmdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgZGVsdGFWYWx1ZTogVXRpbHMudG9GaXhlZCggcG9pbnQuZGVsdGFQcm9wZXJ0eS52YWx1ZSwgMSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIHBvaW50LmRlbHRhUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0b3AgZXJyb3IgYmFyXHJcbiAgICAgIGVycm9yQmFyVG9wTm9kZS5zZXRUcmFuc2xhdGlvbiggY2lyY2xlVmlldy5jZW50ZXJYLCBjaXJjbGVWaWV3LmNlbnRlclkgKyBsaW5lSGVpZ2h0IC0gRVJST1JfQkFSX0JPVU5EUy5oZWlnaHQgLyAyICk7XHJcbiAgICAgIGVycm9yQmFyVG9wUmVjdGFuZ2xlLnRvdWNoQXJlYSA9IGVycm9yQmFyVG9wTm9kZS5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIEVSUk9SX0JBUl9ESUxBVElPTl9YLCBFUlJPUl9CQVJfRElMQVRJT05fWSApO1xyXG4gICAgICBlcnJvckJhclRvcFJlY3RhbmdsZS5tb3VzZUFyZWEgPSBlcnJvckJhclRvcE5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBFUlJPUl9CQVJfRElMQVRJT05fWCwgRVJST1JfQkFSX0RJTEFUSU9OX1kgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSBjZW50cmFsIGxpbmVcclxuICAgICAgY2VudHJhbExpbmUuc2V0WDEoIGNpcmNsZVZpZXcuY2VudGVyWCApO1xyXG4gICAgICBjZW50cmFsTGluZS5zZXRYMiggY2lyY2xlVmlldy5jZW50ZXJYICk7XHJcbiAgICAgIGNlbnRyYWxMaW5lLnNldFkxKCBjaXJjbGVWaWV3LmNlbnRlclkgKyBsaW5lSGVpZ2h0ICk7XHJcbiAgICAgIGNlbnRyYWxMaW5lLnNldFkyKCBjaXJjbGVWaWV3LmNlbnRlclkgLSBsaW5lSGVpZ2h0ICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgYm90dG9tIGVycm9yIGJhclxyXG4gICAgICBlcnJvckJhckJvdHRvbU5vZGUuc2V0VHJhbnNsYXRpb24oIGNpcmNsZVZpZXcuY2VudGVyWCwgY2lyY2xlVmlldy5jZW50ZXJZIC0gbGluZUhlaWdodCAtIEVSUk9SX0JBUl9CT1VORFMuaGVpZ2h0IC8gMiApO1xyXG4gICAgICBlcnJvckJhckJvdHRvbVJlY3RhbmdsZS50b3VjaEFyZWEgPSBlcnJvckJhckJvdHRvbU5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBFUlJPUl9CQVJfRElMQVRJT05fWCwgRVJST1JfQkFSX0RJTEFUSU9OX1kgKTtcclxuICAgICAgZXJyb3JCYXJCb3R0b21SZWN0YW5nbGUubW91c2VBcmVhID0gZXJyb3JCYXJCb3R0b21Ob2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggRVJST1JfQkFSX0RJTEFUSU9OX1gsIEVSUk9SX0JBUl9ESUxBVElPTl9ZICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgdGV4dCBiYWNrZ3JvdW5kIHBvc2l0aW9uaW5nXHJcbiAgICAgIGRlbHRhVGV4dEJhY2tncm91bmQuY2VudGVyWSA9IGVycm9yQmFyVG9wTm9kZS5jZW50ZXJZO1xyXG4gICAgICBkZWx0YVRleHRCYWNrZ3JvdW5kLmxlZnQgPSBlcnJvckJhclRvcE5vZGUucmlnaHQgKyBFUlJPUl9CQVJfREVMVEFfWF9TUEFDSU5HO1xyXG4gICAgICBkZWx0YVRleHRCYWNrZ3JvdW5kLnNldFJlY3QoXHJcbiAgICAgICAgMCxcclxuICAgICAgICAwLFxyXG4gICAgICAgIGRlbHRhVGV4dExhYmVsLndpZHRoICsgMiAqIFZBTFVFX01BUkdJTixcclxuICAgICAgICBkZWx0YVRleHRMYWJlbC5oZWlnaHQgKyAyICogVkFMVUVfTUFSR0lOXHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgbGFiZWwgYW5kIGJhY2tncm91bmQgYW5kIGVuc3VyZSB0aGF0IGNvb3JkaW5hdGUgYW5kIGRlbHRhIGJhY2tncm91bmRzIGRvIG5vdCBpbnRlcnNlY3RcclxuICAgICAgaWYgKCBkZWx0YVRleHRCYWNrZ3JvdW5kLmJvdHRvbSA+IHZhbHVlVGV4dEJhY2tncm91bmQudG9wIC0gREVMVEFfQ09PUkRJTkFURVNfWV9TUEFDSU5HICkge1xyXG4gICAgICAgIGRlbHRhVGV4dEJhY2tncm91bmQuYm90dG9tID0gdmFsdWVUZXh0QmFja2dyb3VuZC50b3AgLSBERUxUQV9DT09SRElOQVRFU19ZX1NQQUNJTkc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHNldCB0ZXh0IHBvc2l0aW9uIHRvIGZpbmFsIGJhY2tncm91bmQgcG9zaXRpb25cclxuICAgICAgZGVsdGFUZXh0TGFiZWwuY2VudGVyID0gZGVsdGFUZXh0QmFja2dyb3VuZC5jZW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbXVzdCBiZSB1bmxpbmtlZCBpbiBkaXNwb3NlXHJcbiAgICBwb2ludC5kZWx0YVByb3BlcnR5LmxpbmsoIHVwZGF0ZURlbHRhICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGVzIHRoZSB2YWx1ZSB0ZXh0IGZvciB0aGUgY29vcmRpbmF0ZXMgYW5kIHRoZSBwb3NpdGlvbiBvZiB0aGUgbGFiZWxzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVZhbHVlKCkge1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRleHRcclxuICAgICAgdmFsdWVUZXh0TGFiZWwuc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICAgIHBvaW50Q29vcmRpbmF0ZXNQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHhDb29yZGluYXRlOiBVdGlscy50b0ZpeGVkKCBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIDEgKSxcclxuICAgICAgICAgIHlDb29yZGluYXRlOiBVdGlscy50b0ZpeGVkKCBwb2ludC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnksIDEgKVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB2aXNpYmlsaXR5XHJcbiAgICAgIHZhbHVlVGV4dExhYmVsLnZpc2libGUgPSB2YWx1ZXNWaXNpYmxlUHJvcGVydHkudmFsdWUgJiYgcG9pbnQuaXNJbnNpZGVHcmFwaFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB2YWx1ZVRleHRCYWNrZ3JvdW5kLnZpc2libGUgPSB2YWx1ZVRleHRMYWJlbC52aXNpYmxlO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHBvc2l0aW9uaW5nc1xyXG4gICAgICB2YWx1ZVRleHRCYWNrZ3JvdW5kLmxlZnQgPSBjaXJjbGVWaWV3LnJpZ2h0ICsgUE9JTlRfQ09PUkRJTkFURVNfWF9TUEFDSU5HO1xyXG4gICAgICB2YWx1ZVRleHRCYWNrZ3JvdW5kLmNlbnRlclkgPSBjaXJjbGVWaWV3LmNlbnRlclk7XHJcbiAgICAgIHZhbHVlVGV4dEJhY2tncm91bmQuc2V0UmVjdChcclxuICAgICAgICAwLFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgdmFsdWVUZXh0TGFiZWwud2lkdGggKyAyICogVkFMVUVfTUFSR0lOLFxyXG4gICAgICAgIHZhbHVlVGV4dExhYmVsLmhlaWdodCArIDIgKiBWQUxVRV9NQVJHSU5cclxuICAgICAgKTtcclxuICAgICAgdmFsdWVUZXh0TGFiZWwuY2VudGVyID0gdmFsdWVUZXh0QmFja2dyb3VuZC5jZW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGhlc2UgcmVxdWlyZSB1bmxpbmsgaW4gZGlzcG9zZVxyXG4gICAgY29uc3QgdmFsdWVCYWNrZ3JvdW5kSGFuZGxlID0gdmlzaWJsZSA9PiB7dmFsdWVUZXh0QmFja2dyb3VuZC52aXNpYmxlID0gdmlzaWJsZTt9O1xyXG4gICAgY29uc3QgdmFsdWVUZXh0SGFuZGxlID0gdmlzaWJsZSA9PiB7dmFsdWVUZXh0TGFiZWwudmlzaWJsZSA9IHZpc2libGU7fTtcclxuICAgIGNvbnN0IGRlbHRhQmFja2dyb3VuZEhhbmRsZSA9IHZpc2libGUgPT4ge2RlbHRhVGV4dEJhY2tncm91bmQudmlzaWJsZSA9IHZpc2libGU7fTtcclxuICAgIGNvbnN0IGRlbHRhVGV4dEhhbmRsZSA9IHZpc2libGUgPT4ge2RlbHRhVGV4dExhYmVsLnZpc2libGUgPSB2aXNpYmxlO307XHJcblxyXG4gICAgdmFsdWVzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZhbHVlQmFja2dyb3VuZEhhbmRsZSApO1xyXG4gICAgdmFsdWVzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZhbHVlVGV4dEhhbmRsZSApO1xyXG4gICAgdmFsdWVzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGRlbHRhQmFja2dyb3VuZEhhbmRsZSApO1xyXG4gICAgdmFsdWVzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGRlbHRhVGV4dEhhbmRsZSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlcyBob3cgdGhlIGVycm9yIGJhcnMgbG9vayBiYXNlZCBvbiB3aGV0aGVyIHRoZSByZXNpZHVhbHMgYXJlIHZpc2libGUgb3Igbm90XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2lkdWFsc1Zpc2libGVcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlRXJyb3JCYXJzQmFzZWRPblJlc2lkdWFsc1Zpc2liaWxpdHkoIHJlc2lkdWFsc1Zpc2libGUgKSB7XHJcbiAgICAgIGlmICggcmVzaWR1YWxzVmlzaWJsZSApIHtcclxuICAgICAgICBjZW50cmFsTGluZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgZXJyb3JCYXJUb3BSZWN0YW5nbGUuc2V0RmlsbCggQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkxJR0hUX0dSQVlfQ09MT1IgKTtcclxuICAgICAgICBlcnJvckJhckJvdHRvbVJlY3RhbmdsZS5zZXRGaWxsKCBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuTElHSFRfR1JBWV9DT0xPUiApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNlbnRyYWxMaW5lLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGVycm9yQmFyVG9wUmVjdGFuZ2xlLnNldEZpbGwoIEN1cnZlRml0dGluZ0NvbnN0YW50cy5CTFVFX0NPTE9SICk7XHJcbiAgICAgICAgZXJyb3JCYXJCb3R0b21SZWN0YW5nbGUuc2V0RmlsbCggQ3VydmVGaXR0aW5nQ29uc3RhbnRzLkJMVUVfQ09MT1IgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG11c3QgYmUgdW5saW5rZWQgaW4gZGlzcG9zZVxyXG4gICAgcmVzaWR1YWxzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUVycm9yQmFyc0Jhc2VkT25SZXNpZHVhbHNWaXNpYmlsaXR5ICk7XHJcblxyXG4gICAgLy8gcG9pbnQgaGFsb1xyXG4gICAgY29uc3QgaGFsb1BvaW50Tm9kZSA9IG5ldyBDaXJjbGUoIDEuNzUgKiBDdXJ2ZUZpdHRpbmdDb25zdGFudHMuUE9JTlRfUkFESVVTLCBQT0lOVF9IQUxPX09QVElPTlMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGhhbG9Qb2ludE5vZGUgKTtcclxuICAgIGNpcmNsZVZpZXcuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEJ1dHRvbkxpc3RlbmVyKCB7XHJcbiAgICAgIHVwOiAoKSA9PiB7IGhhbG9Qb2ludE5vZGUudmlzaWJsZSA9IGZhbHNlOyB9LFxyXG4gICAgICBkb3duOiAoKSA9PiB7IGhhbG9Qb2ludE5vZGUudmlzaWJsZSA9IHRydWU7IH0sXHJcbiAgICAgIG92ZXI6ICgpID0+IHtcclxuICAgICAgICBoYWxvUG9pbnROb2RlLnZpc2libGUgPSBjdXJyZW50bHlJbnRlcmFjdGluZ1BvaW50cy5sZW5ndGggPT09IDAgfHwgXy5pbmNsdWRlcyggY3VycmVudGx5SW50ZXJhY3RpbmdQb2ludHMsIHBvaW50ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlcyBhbGwgdGhlIHZpZXcgcG9zaXRpb25zIGFuZCB0ZXh0cyB3aGVuZXZlciB0aGUgcG9pbnQgbW9kZWwncyBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNlbnRlclBvc2l0aW9uTGlzdGVuZXIoIHBvc2l0aW9uICkge1xyXG4gICAgICBjaXJjbGVWaWV3LmNlbnRlciA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgICBoYWxvUG9pbnROb2RlLmNlbnRlciA9IGNpcmNsZVZpZXcuY2VudGVyO1xyXG4gICAgICB1cGRhdGVWYWx1ZSgpO1xyXG4gICAgICB1cGRhdGVEZWx0YSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG11c3QgYmUgdW5saW5rZWQgaW4gZGlzcG9zZVxyXG4gICAgcG9pbnQucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBjZW50ZXJQb3NpdGlvbkxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZVBvaW50Tm9kZSA9ICgpID0+IHtcclxuICAgICAgcG9pbnQuZGVsdGFQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZURlbHRhICk7XHJcbiAgICAgIHBvaW50LnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBjZW50ZXJQb3NpdGlvbkxpc3RlbmVyICk7XHJcbiAgICAgIHJlc2lkdWFsc1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZUVycm9yQmFyc0Jhc2VkT25SZXNpZHVhbHNWaXNpYmlsaXR5ICk7XHJcbiAgICAgIHZhbHVlc1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIGRlbHRhVGV4dEhhbmRsZSApO1xyXG4gICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHkudW5saW5rKCB2YWx1ZVRleHRIYW5kbGUgKTtcclxuICAgICAgdmFsdWVzVmlzaWJsZVByb3BlcnR5LnVubGluayggZGVsdGFCYWNrZ3JvdW5kSGFuZGxlICk7XHJcbiAgICAgIHZhbHVlc1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlQmFja2dyb3VuZEhhbmRsZSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlUG9pbnROb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuY3VydmVGaXR0aW5nLnJlZ2lzdGVyKCAnUG9pbnROb2RlJywgUG9pbnROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBvaW50Tm9kZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLFNBQVNDLGNBQWMsRUFBRUMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RJLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQywyQkFBMkIsTUFBTSxtQ0FBbUM7QUFFM0UsTUFBTUMsd0JBQXdCLEdBQUdILG1CQUFtQixDQUFDSSxrQkFBa0I7QUFDdkUsTUFBTUMsNkJBQTZCLEdBQUdMLG1CQUFtQixDQUFDTSx1QkFBdUI7QUFDakYsTUFBTUMsYUFBYSxHQUFHUCxtQkFBbUIsQ0FBQ1EsT0FBTzs7QUFFakQ7QUFDQSxNQUFNQyxTQUFTLEdBQUkseUJBQXdCUixxQkFBcUIsQ0FBQ1Msb0JBQW9CLENBQUNDLE1BQU8sYUFBWTs7QUFFekc7QUFDQSxNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDeEIsTUFBTUMsU0FBUyxHQUFHLEVBQUU7O0FBRXBCO0FBQ0EsTUFBTUMsV0FBVyxHQUFHdEIsS0FBSyxDQUFDdUIsT0FBTyxDQUFFZCxxQkFBcUIsQ0FBQ2UsVUFBVyxDQUFDO0FBQ3JFLE1BQU1DLGFBQWEsR0FBRztFQUNwQkMsSUFBSSxFQUFFSixXQUFXO0VBQ2pCSyxNQUFNLEVBQUVsQixxQkFBcUIsQ0FBQ21CLFlBQVk7RUFDMUNDLFNBQVMsRUFBRXBCLHFCQUFxQixDQUFDcUI7QUFDbkMsQ0FBQztBQUNELE1BQU1DLGtCQUFrQixHQUFHO0VBQ3pCTCxJQUFJLEVBQUVKLFdBQVcsQ0FBQ1UsU0FBUyxDQUFFLEdBQUksQ0FBQztFQUNsQ0MsUUFBUSxFQUFFLEtBQUs7RUFDZkMsT0FBTyxFQUFFO0FBQ1gsQ0FBQzs7QUFFRDtBQUNBLE1BQU1DLGtCQUFrQixHQUFHO0VBQ3pCQyxJQUFJLEVBQUUzQixxQkFBcUIsQ0FBQzRCLGdCQUFnQjtFQUM1Q0MsUUFBUSxFQUFFLEdBQUcsQ0FBQztBQUNoQixDQUFDOztBQUNELE1BQU1DLFlBQVksR0FBRyxDQUFDO0FBQ3RCLE1BQU1DLDhCQUE4QixHQUFHLENBQUM7O0FBRXhDO0FBQ0EsTUFBTUMsZUFBZSxHQUFHekMsS0FBSyxDQUFDdUIsT0FBTyxDQUFFZCxxQkFBcUIsQ0FBQ2lDLFVBQVcsQ0FBQztBQUN6RSxNQUFNQyxvQkFBb0IsR0FBRyxFQUFFO0FBQy9CLE1BQU1DLG9CQUFvQixHQUFHLENBQUM7QUFDOUIsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSXBELE9BQU8sQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQztBQUNyRCxNQUFNcUQsaUJBQWlCLEdBQUc7RUFDeEJwQixJQUFJLEVBQUVlO0FBQ1IsQ0FBQztBQUNELE1BQU1NLHFCQUFxQixHQUFHLElBQUl0RCxPQUFPLENBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUUsQ0FBQztBQUMzRCxNQUFNdUQsc0JBQXNCLEdBQUc7RUFDN0J0QixJQUFJLEVBQUVlLGVBQWUsQ0FBQ1QsU0FBUyxDQUFFLEdBQUksQ0FBQztFQUN0Q0MsUUFBUSxFQUFFLEtBQUs7RUFDZkMsT0FBTyxFQUFFO0FBQ1gsQ0FBQzs7QUFFRDtBQUNBLE1BQU1lLG9CQUFvQixHQUFHO0VBQzNCdEIsTUFBTSxFQUFFYyxlQUFlO0VBQ3ZCWixTQUFTLEVBQUU7QUFDYixDQUFDOztBQUVEO0FBQ0EsTUFBTXFCLDJCQUEyQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU1DLDJCQUEyQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU1DLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVyQyxNQUFNQyxTQUFTLFNBQVNsRCxJQUFJLENBQUM7RUFFM0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRW1ELFdBQVdBLENBQUVDLEtBQUssRUFBRUMsZUFBZSxFQUFFQywwQkFBMEIsRUFBRUMsd0JBQXdCLEVBQUVDLHFCQUFxQixFQUNuR0Msa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUV6QyxLQUFLLENBQUVqRSxLQUFLLENBQUU7TUFBRWtFLE1BQU0sRUFBRTtJQUFVLENBQUMsRUFBRUQsT0FBUSxDQUFFLENBQUM7O0lBRWhEO0lBQ0EsTUFBTUUsdUJBQXVCLEdBQUcsSUFBSTNELFNBQVMsQ0FBRXlDLGdCQUFnQixFQUFFQyxpQkFBa0IsQ0FBQztJQUNwRixNQUFNa0IsMkJBQTJCLEdBQUcsSUFBSTVELFNBQVMsQ0FBRTJDLHFCQUFxQixFQUFFQyxzQkFBdUIsQ0FBQztJQUNsRyxNQUFNaUIsa0JBQWtCLEdBQUcsSUFBSTlELElBQUksQ0FBRTtNQUFFK0QsUUFBUSxFQUFFLENBQUVILHVCQUF1QixFQUFFQywyQkFBMkI7SUFBRyxDQUFFLENBQUM7SUFDN0csSUFBSSxDQUFDRyxRQUFRLENBQUVGLGtCQUFtQixDQUFDOztJQUVuQztJQUNBLE1BQU1HLG9CQUFvQixHQUFHLElBQUloRSxTQUFTLENBQUV5QyxnQkFBZ0IsRUFBRUMsaUJBQWtCLENBQUM7SUFDakYsTUFBTXVCLHdCQUF3QixHQUFHLElBQUlqRSxTQUFTLENBQUUyQyxxQkFBcUIsRUFBRUMsc0JBQXVCLENBQUM7SUFDL0YsTUFBTXNCLGVBQWUsR0FBRyxJQUFJbkUsSUFBSSxDQUFFO01BQUUrRCxRQUFRLEVBQUUsQ0FBRUUsb0JBQW9CLEVBQUVDLHdCQUF3QjtJQUFHLENBQUUsQ0FBQztJQUNwRyxJQUFJLENBQUNGLFFBQVEsQ0FBRUcsZUFBZ0IsQ0FBQzs7SUFFaEM7SUFDQSxNQUFNQyxXQUFXLEdBQUcsSUFBSXJFLElBQUksQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUrQyxvQkFBcUIsQ0FBQztJQUNoRSxJQUFJLENBQUNrQixRQUFRLENBQUVJLFdBQVksQ0FBQzs7SUFFNUI7SUFDQSxNQUFNQyxjQUFjLEdBQUcsSUFBSW5FLFFBQVEsQ0FBRSxFQUFFLEVBQUU4QixrQkFBbUIsQ0FBQyxDQUFDLENBQUM7SUFDL0QsTUFBTXNDLG1CQUFtQixHQUFHLElBQUlyRSxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQ3JEc0IsSUFBSSxFQUFFLE9BQU87TUFDYmdELE9BQU8sRUFBRSxJQUFJO01BQ2JDLFlBQVksRUFBRW5DO0lBQ2hCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQzJCLFFBQVEsQ0FBRU0sbUJBQW9CLENBQUM7SUFDcEMsSUFBSSxDQUFDTixRQUFRLENBQUVLLGNBQWUsQ0FBQzs7SUFFL0I7SUFDQSxNQUFNSSxjQUFjLEdBQUcsSUFBSTlFLGNBQWMsQ0FBRTtNQUN6QytFLEVBQUUsRUFBRUEsQ0FBQSxLQUFNO1FBQ1JSLHdCQUF3QixDQUFDbkMsT0FBTyxHQUFHLEtBQUs7UUFDeEM4QiwyQkFBMkIsQ0FBQzlCLE9BQU8sR0FBRyxLQUFLO01BQzdDLENBQUM7TUFDRDRDLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQ1ZULHdCQUF3QixDQUFDbkMsT0FBTyxHQUFHLElBQUk7UUFDdkM4QiwyQkFBMkIsQ0FBQzlCLE9BQU8sR0FBRyxJQUFJO01BQzVDLENBQUM7TUFDRDZDLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQ1ZWLHdCQUF3QixDQUFDbkMsT0FBTyxHQUFHdUIsMEJBQTBCLENBQUN1QixNQUFNLEtBQUssQ0FBQztRQUMxRWhCLDJCQUEyQixDQUFDOUIsT0FBTyxHQUFHdUIsMEJBQTBCLENBQUN1QixNQUFNLEtBQUssQ0FBQztNQUMvRTtJQUNGLENBQUUsQ0FBQztJQUNIakIsdUJBQXVCLENBQUNrQixnQkFBZ0IsQ0FBRUwsY0FBZSxDQUFDO0lBQzFEUixvQkFBb0IsQ0FBQ2EsZ0JBQWdCLENBQUVMLGNBQWUsQ0FBQzs7SUFFdkQ7SUFDQSxNQUFNTSxVQUFVLEdBQUcsSUFBSW5GLE1BQU0sQ0FBRVUscUJBQXFCLENBQUMwRSxZQUFZLEVBQUUxRCxhQUFjLENBQUM7SUFDbEZ5RCxVQUFVLENBQUNFLFNBQVMsR0FBR0YsVUFBVSxDQUFDRyxNQUFNLENBQUNDLE9BQU8sQ0FBRSxDQUFFLENBQUM7SUFDckRKLFVBQVUsQ0FBQ0ssU0FBUyxHQUFHTCxVQUFVLENBQUNHLE1BQU0sQ0FBQ0MsT0FBTyxDQUFFLENBQUUsQ0FBQztJQUNyRCxJQUFJLENBQUNuQixRQUFRLENBQUVlLFVBQVcsQ0FBQzs7SUFFM0I7SUFDQSxNQUFNTSw4QkFBOEIsR0FBR0EsQ0FBQSxLQUFNO01BQzNDLElBQUssQ0FBQ0MsQ0FBQyxDQUFDQyxRQUFRLENBQUVqQywwQkFBMEIsRUFBRUYsS0FBTSxDQUFDLEVBQUc7UUFDdERFLDBCQUEwQixDQUFDa0MsSUFBSSxDQUFFcEMsS0FBTSxDQUFDO01BQzFDO0lBQ0YsQ0FBQztJQUNELE1BQU1xQyxtQ0FBbUMsR0FBR0EsQ0FBQSxLQUFNO01BQ2hELElBQUtILENBQUMsQ0FBQ0MsUUFBUSxDQUFFakMsMEJBQTBCLEVBQUVGLEtBQU0sQ0FBQyxFQUFHO1FBQ3JERSwwQkFBMEIsQ0FBQ29DLE1BQU0sQ0FBRXBDLDBCQUEwQixDQUFDcUMsT0FBTyxDQUFFdkMsS0FBTSxDQUFDLEVBQUUsQ0FBRSxDQUFDO01BQ3JGO0lBQ0YsQ0FBQzs7SUFFRDtJQUNBO0lBQ0EsSUFBSXdDLDRCQUE0QixHQUFHLEtBQUs7SUFDeEMsSUFBSUMseUJBQXlCLEdBQUcsSUFBSTs7SUFFcEM7SUFDQSxJQUFJQyxrQkFBa0IsR0FBRyxLQUFLO0lBQzlCLElBQUlDLHFCQUFxQixHQUFHLEtBQUs7SUFDakM5QixvQkFBb0IsQ0FBQ2EsZ0JBQWdCLENBQUUsSUFBSWhGLFlBQVksQ0FBRTtNQUN2RGtHLEtBQUssRUFBRUMsS0FBSyxJQUFJO1FBQ2RILGtCQUFrQixHQUFHLENBQUNDLHFCQUFxQjs7UUFFM0M7UUFDQTtRQUNBO1FBQ0EsSUFBSzNDLEtBQUssQ0FBQzhDLGFBQWEsQ0FBQ0MsS0FBSyxLQUFLbEYsU0FBUyxFQUFHO1VBQzdDNEUseUJBQXlCLEdBQUdJLEtBQUssQ0FBQ0csT0FBTyxDQUFDaEQsS0FBSztRQUNqRDtRQUVBaUMsOEJBQThCLENBQUMsQ0FBQztNQUNsQyxDQUFDO01BQ0RnQixJQUFJLEVBQUVKLEtBQUssSUFBSTtRQUNiLElBQUssQ0FBQ0gsa0JBQWtCLEVBQUc7VUFDekI7UUFDRjs7UUFFQTtRQUNBNUIsd0JBQXdCLENBQUNuQyxPQUFPLEdBQUcsSUFBSTtRQUN2QzhCLDJCQUEyQixDQUFDOUIsT0FBTyxHQUFHLElBQUk7UUFFMUMsSUFBSXVFLGlCQUFpQixHQUFHN0Msa0JBQWtCLENBQUM4QyxpQkFBaUIsQ0FDMUQsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRVAsS0FBSyxDQUFDRyxPQUFPLENBQUNoRCxLQUFNLENBQUMsQ0FBQ3FELENBQUMsR0FBRzFCLFVBQVUsQ0FBQzJCLE9BQ2hFLENBQUM7O1FBRUQ7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLElBQUtiLHlCQUF5QixLQUFLLElBQUksRUFBRztVQUN4Q0QsNEJBQTRCLEdBQUdLLEtBQUssQ0FBQ0csT0FBTyxDQUFDaEQsS0FBSyxDQUFDcUQsQ0FBQyxHQUFHWix5QkFBeUIsQ0FBQ1ksQ0FBQztVQUNsRloseUJBQXlCLEdBQUcsSUFBSTtRQUNsQztRQUVBLElBQUtELDRCQUE0QixFQUFHO1VBQ2xDVSxpQkFBaUIsR0FBRzdDLGtCQUFrQixDQUFDOEMsaUJBQWlCLENBQ3REeEIsVUFBVSxDQUFDMkIsT0FBTyxHQUFHLElBQUksQ0FBQ0Ysa0JBQWtCLENBQUVQLEtBQUssQ0FBQ0csT0FBTyxDQUFDaEQsS0FBTSxDQUFDLENBQUNxRCxDQUN0RSxDQUFDO1FBQ0g7UUFDQXJELEtBQUssQ0FBQzhDLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHNUcsS0FBSyxDQUFDb0gsS0FBSyxDQUNyQ0wsaUJBQWlCLEVBQ2pCckYsU0FBUyxFQUNUQyxTQUNGLENBQUM7TUFDSCxDQUFDO01BQ0QwRixHQUFHLEVBQUVBLENBQUEsS0FBTTtRQUNUZCxrQkFBa0IsR0FBRyxLQUFLO1FBQzFCRiw0QkFBNEIsR0FBRyxLQUFLO1FBQ3BDQyx5QkFBeUIsR0FBRyxJQUFJO1FBQ2hDSixtQ0FBbUMsQ0FBQyxDQUFDOztRQUVyQztRQUNBdkIsd0JBQXdCLENBQUNuQyxPQUFPLEdBQUcsS0FBSztRQUN4QzhCLDJCQUEyQixDQUFDOUIsT0FBTyxHQUFHLEtBQUs7TUFDN0M7SUFDRixDQUFFLENBQUUsQ0FBQztJQUNMNkIsdUJBQXVCLENBQUNrQixnQkFBZ0IsQ0FBRSxJQUFJaEYsWUFBWSxDQUFFO01BQzFEa0csS0FBSyxFQUFFQSxDQUFBLEtBQU07UUFDWEQscUJBQXFCLEdBQUcsQ0FBQ0Qsa0JBQWtCO1FBQzNDVCw4QkFBOEIsQ0FBQyxDQUFDO01BQ2xDLENBQUM7TUFDRGdCLElBQUksRUFBRUosS0FBSyxJQUFJO1FBQ2IsSUFBSyxDQUFDRixxQkFBcUIsRUFBRztVQUM1QjtRQUNGOztRQUVBO1FBQ0E3Qix3QkFBd0IsQ0FBQ25DLE9BQU8sR0FBRyxJQUFJO1FBQ3ZDOEIsMkJBQTJCLENBQUM5QixPQUFPLEdBQUcsSUFBSTtRQUUxQ3FCLEtBQUssQ0FBQzhDLGFBQWEsQ0FBQ0MsS0FBSyxHQUFHNUcsS0FBSyxDQUFDb0gsS0FBSyxDQUNyQ2xELGtCQUFrQixDQUFDOEMsaUJBQWlCLENBQUV4QixVQUFVLENBQUMyQixPQUFPLEdBQUcsSUFBSSxDQUFDRixrQkFBa0IsQ0FBRVAsS0FBSyxDQUFDRyxPQUFPLENBQUNoRCxLQUFNLENBQUMsQ0FBQ3FELENBQUUsQ0FBQyxFQUM3R3hGLFNBQVMsRUFDVEMsU0FDRixDQUFDO01BQ0gsQ0FBQztNQUNEMEYsR0FBRyxFQUFFQSxDQUFBLEtBQU07UUFDVGIscUJBQXFCLEdBQUcsS0FBSztRQUM3Qk4sbUNBQW1DLENBQUMsQ0FBQzs7UUFFckM7UUFDQXZCLHdCQUF3QixDQUFDbkMsT0FBTyxHQUFHLEtBQUs7UUFDeEM4QiwyQkFBMkIsQ0FBQzlCLE9BQU8sR0FBRyxLQUFLO01BQzdDO0lBQ0YsQ0FBRSxDQUFFLENBQUM7O0lBRUw7SUFDQSxNQUFNOEUsY0FBYyxHQUFHLElBQUkxRyxJQUFJLENBQzdCVCxXQUFXLENBQUNvSCxNQUFNLENBQUVwRyw2QkFBNkIsRUFBRTtNQUNqRHFHLFdBQVcsRUFBRXhILEtBQUssQ0FBQ3lILE9BQU8sQ0FBRTVELEtBQUssQ0FBQzZELGdCQUFnQixDQUFDZCxLQUFLLENBQUNlLENBQUMsRUFBRSxDQUFFLENBQUM7TUFDL0RDLFdBQVcsRUFBRTVILEtBQUssQ0FBQ3lILE9BQU8sQ0FBRTVELEtBQUssQ0FBQzZELGdCQUFnQixDQUFDZCxLQUFLLENBQUNNLENBQUMsRUFBRSxDQUFFO0lBQ2hFLENBQUUsQ0FBQyxFQUNIekUsa0JBQ0YsQ0FBQztJQUNELE1BQU1vRixtQkFBbUIsR0FBRyxJQUFJbkgsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUNyRHNCLElBQUksRUFBRWpCLHFCQUFxQixDQUFDZSxVQUFVO01BQ3RDa0QsT0FBTyxFQUFFLElBQUk7TUFDYkMsWUFBWSxFQUFFbkM7SUFDaEIsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDMkIsUUFBUSxDQUFFb0QsbUJBQW9CLENBQUM7SUFDcEMsSUFBSSxDQUFDcEQsUUFBUSxDQUFFNkMsY0FBZSxDQUFDOztJQUUvQjtJQUNBOUIsVUFBVSxDQUFDRCxnQkFBZ0IsQ0FBRSxJQUFJaEYsWUFBWSxDQUFFO01BQzdDdUgsY0FBYyxFQUFFLElBQUk7TUFDcEJyQixLQUFLLEVBQUVBLENBQUEsS0FBTTtRQUNYNUMsS0FBSyxDQUFDa0UsZ0JBQWdCLENBQUNuQixLQUFLLEdBQUcsSUFBSTtRQUNuQyxJQUFJLENBQUNvQixXQUFXLENBQUMsQ0FBQztRQUNsQmxDLDhCQUE4QixDQUFDLENBQUM7TUFDbEMsQ0FBQztNQUNEZ0IsSUFBSSxFQUFFSixLQUFLLElBQUk7UUFDYixJQUFLLENBQUM3QyxLQUFLLENBQUNrRSxnQkFBZ0IsQ0FBQ25CLEtBQUssRUFBRztVQUNuQztRQUNGO1FBQ0EvQyxLQUFLLENBQUM2RCxnQkFBZ0IsQ0FBQ2QsS0FBSyxHQUFHMUMsa0JBQWtCLENBQUMrRCxtQkFBbUIsQ0FBRSxJQUFJLENBQUNoQixrQkFBa0IsQ0FBRVAsS0FBSyxDQUFDRyxPQUFPLENBQUNoRCxLQUFNLENBQUUsQ0FBQztNQUN6SCxDQUFDO01BQ0R3RCxHQUFHLEVBQUVBLENBQUEsS0FBTTtRQUNUeEQsS0FBSyxDQUFDa0UsZ0JBQWdCLENBQUNuQixLQUFLLEdBQUcsS0FBSztRQUNwQzlDLGVBQWUsQ0FBQyxDQUFDO1FBQ2pCLElBQUs5QywyQkFBMkIsQ0FBQ2tILFVBQVUsRUFBRztVQUM1Q3JFLEtBQUssQ0FBQzZELGdCQUFnQixDQUFDZCxLQUFLLEdBQUcsSUFBSTNHLE9BQU8sQ0FDeENELEtBQUssQ0FBQ21JLGFBQWEsQ0FBRXRFLEtBQUssQ0FBQzZELGdCQUFnQixDQUFDZCxLQUFLLENBQUNlLENBQUMsRUFBRSxDQUFFLENBQUMsRUFDeEQzSCxLQUFLLENBQUNtSSxhQUFhLENBQUV0RSxLQUFLLENBQUM2RCxnQkFBZ0IsQ0FBQ2QsS0FBSyxDQUFDTSxDQUFDLEVBQUUsQ0FBRSxDQUN6RCxDQUFDO1FBQ0g7UUFDQWhCLG1DQUFtQyxDQUFDLENBQUM7TUFDdkM7SUFDRixDQUFFLENBQUUsQ0FBQzs7SUFFTDtBQUNKO0FBQ0E7SUFDSSxTQUFTa0MsV0FBV0EsQ0FBQSxFQUFHO01BRXJCO01BQ0F0RCxjQUFjLENBQUN1RCxNQUFNLEdBQUdsSSxXQUFXLENBQUNvSCxNQUFNLENBQUV0Ryx3QkFBd0IsRUFBRTtRQUNwRWlHLENBQUMsRUFBRS9HLFdBQVcsQ0FBQ29ILE1BQU0sQ0FBRWhHLFNBQVMsRUFBRTtVQUNoQzJGLENBQUMsRUFBRTdGO1FBQ0wsQ0FBRSxDQUFDO1FBQ0hpSCxVQUFVLEVBQUV0SSxLQUFLLENBQUN5SCxPQUFPLENBQUU1RCxLQUFLLENBQUM4QyxhQUFhLENBQUNDLEtBQUssRUFBRSxDQUFFO01BQzFELENBQUUsQ0FBQztNQUVILE1BQU0yQixVQUFVLEdBQUdyRSxrQkFBa0IsQ0FBQ3NFLGlCQUFpQixDQUFFM0UsS0FBSyxDQUFDOEMsYUFBYSxDQUFDQyxLQUFNLENBQUM7O01BRXBGO01BQ0FoQyxlQUFlLENBQUM2RCxjQUFjLENBQUVqRCxVQUFVLENBQUNrRCxPQUFPLEVBQUVsRCxVQUFVLENBQUMyQixPQUFPLEdBQUdvQixVQUFVLEdBQUdwRixnQkFBZ0IsQ0FBQ3dGLE1BQU0sR0FBRyxDQUFFLENBQUM7TUFDbkhqRSxvQkFBb0IsQ0FBQ2dCLFNBQVMsR0FBR2QsZUFBZSxDQUFDZ0UsV0FBVyxDQUFDQyxTQUFTLENBQUU1RixvQkFBb0IsRUFBRUMsb0JBQXFCLENBQUM7TUFDcEh3QixvQkFBb0IsQ0FBQ21CLFNBQVMsR0FBR2pCLGVBQWUsQ0FBQ2dFLFdBQVcsQ0FBQ0MsU0FBUyxDQUFFNUYsb0JBQW9CLEVBQUVDLG9CQUFxQixDQUFDOztNQUVwSDtNQUNBMkIsV0FBVyxDQUFDaUUsS0FBSyxDQUFFdEQsVUFBVSxDQUFDa0QsT0FBUSxDQUFDO01BQ3ZDN0QsV0FBVyxDQUFDa0UsS0FBSyxDQUFFdkQsVUFBVSxDQUFDa0QsT0FBUSxDQUFDO01BQ3ZDN0QsV0FBVyxDQUFDbUUsS0FBSyxDQUFFeEQsVUFBVSxDQUFDMkIsT0FBTyxHQUFHb0IsVUFBVyxDQUFDO01BQ3BEMUQsV0FBVyxDQUFDb0UsS0FBSyxDQUFFekQsVUFBVSxDQUFDMkIsT0FBTyxHQUFHb0IsVUFBVyxDQUFDOztNQUVwRDtNQUNBaEUsa0JBQWtCLENBQUNrRSxjQUFjLENBQUVqRCxVQUFVLENBQUNrRCxPQUFPLEVBQUVsRCxVQUFVLENBQUMyQixPQUFPLEdBQUdvQixVQUFVLEdBQUdwRixnQkFBZ0IsQ0FBQ3dGLE1BQU0sR0FBRyxDQUFFLENBQUM7TUFDdEh0RSx1QkFBdUIsQ0FBQ3FCLFNBQVMsR0FBR25CLGtCQUFrQixDQUFDcUUsV0FBVyxDQUFDQyxTQUFTLENBQUU1RixvQkFBb0IsRUFBRUMsb0JBQXFCLENBQUM7TUFDMUhtQix1QkFBdUIsQ0FBQ3dCLFNBQVMsR0FBR3RCLGtCQUFrQixDQUFDcUUsV0FBVyxDQUFDQyxTQUFTLENBQUU1RixvQkFBb0IsRUFBRUMsb0JBQXFCLENBQUM7O01BRTFIO01BQ0E2QixtQkFBbUIsQ0FBQ29DLE9BQU8sR0FBR3ZDLGVBQWUsQ0FBQ3VDLE9BQU87TUFDckRwQyxtQkFBbUIsQ0FBQ21FLElBQUksR0FBR3RFLGVBQWUsQ0FBQ3VFLEtBQUssR0FBR3pGLHlCQUF5QjtNQUM1RXFCLG1CQUFtQixDQUFDcUUsT0FBTyxDQUN6QixDQUFDLEVBQ0QsQ0FBQyxFQUNEdEUsY0FBYyxDQUFDdUUsS0FBSyxHQUFHLENBQUMsR0FBR3hHLFlBQVksRUFDdkNpQyxjQUFjLENBQUM2RCxNQUFNLEdBQUcsQ0FBQyxHQUFHOUYsWUFDOUIsQ0FBQzs7TUFFRDtNQUNBLElBQUtrQyxtQkFBbUIsQ0FBQ3VFLE1BQU0sR0FBR3pCLG1CQUFtQixDQUFDMEIsR0FBRyxHQUFHL0YsMkJBQTJCLEVBQUc7UUFDeEZ1QixtQkFBbUIsQ0FBQ3VFLE1BQU0sR0FBR3pCLG1CQUFtQixDQUFDMEIsR0FBRyxHQUFHL0YsMkJBQTJCO01BQ3BGOztNQUVBO01BQ0FzQixjQUFjLENBQUMwRSxNQUFNLEdBQUd6RSxtQkFBbUIsQ0FBQ3lFLE1BQU07SUFDcEQ7O0lBRUE7SUFDQTNGLEtBQUssQ0FBQzhDLGFBQWEsQ0FBQzhDLElBQUksQ0FBRXJCLFdBQVksQ0FBQzs7SUFFdkM7QUFDSjtBQUNBO0lBQ0ksU0FBU3NCLFdBQVdBLENBQUEsRUFBRztNQUVyQjtNQUNBcEMsY0FBYyxDQUFDZSxNQUFNLEdBQUdsSSxXQUFXLENBQUNvSCxNQUFNLENBQ3hDcEcsNkJBQTZCLEVBQzdCO1FBQ0VxRyxXQUFXLEVBQUV4SCxLQUFLLENBQUN5SCxPQUFPLENBQUU1RCxLQUFLLENBQUM2RCxnQkFBZ0IsQ0FBQ2QsS0FBSyxDQUFDZSxDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBQy9EQyxXQUFXLEVBQUU1SCxLQUFLLENBQUN5SCxPQUFPLENBQUU1RCxLQUFLLENBQUM2RCxnQkFBZ0IsQ0FBQ2QsS0FBSyxDQUFDTSxDQUFDLEVBQUUsQ0FBRTtNQUNoRSxDQUNGLENBQUM7O01BRUQ7TUFDQUksY0FBYyxDQUFDOUUsT0FBTyxHQUFHeUIscUJBQXFCLENBQUMyQyxLQUFLLElBQUkvQyxLQUFLLENBQUM4RixxQkFBcUIsQ0FBQy9DLEtBQUs7TUFDekZpQixtQkFBbUIsQ0FBQ3JGLE9BQU8sR0FBRzhFLGNBQWMsQ0FBQzlFLE9BQU87O01BRXBEO01BQ0FxRixtQkFBbUIsQ0FBQ3FCLElBQUksR0FBRzFELFVBQVUsQ0FBQzJELEtBQUssR0FBRzFGLDJCQUEyQjtNQUN6RW9FLG1CQUFtQixDQUFDVixPQUFPLEdBQUczQixVQUFVLENBQUMyQixPQUFPO01BQ2hEVSxtQkFBbUIsQ0FBQ3VCLE9BQU8sQ0FDekIsQ0FBQyxFQUNELENBQUMsRUFDRDlCLGNBQWMsQ0FBQytCLEtBQUssR0FBRyxDQUFDLEdBQUd4RyxZQUFZLEVBQ3ZDeUUsY0FBYyxDQUFDcUIsTUFBTSxHQUFHLENBQUMsR0FBRzlGLFlBQzlCLENBQUM7TUFDRHlFLGNBQWMsQ0FBQ2tDLE1BQU0sR0FBRzNCLG1CQUFtQixDQUFDMkIsTUFBTTtJQUNwRDs7SUFFQTtJQUNBLE1BQU1JLHFCQUFxQixHQUFHcEgsT0FBTyxJQUFJO01BQUNxRixtQkFBbUIsQ0FBQ3JGLE9BQU8sR0FBR0EsT0FBTztJQUFDLENBQUM7SUFDakYsTUFBTXFILGVBQWUsR0FBR3JILE9BQU8sSUFBSTtNQUFDOEUsY0FBYyxDQUFDOUUsT0FBTyxHQUFHQSxPQUFPO0lBQUMsQ0FBQztJQUN0RSxNQUFNc0gscUJBQXFCLEdBQUd0SCxPQUFPLElBQUk7TUFBQ3VDLG1CQUFtQixDQUFDdkMsT0FBTyxHQUFHQSxPQUFPO0lBQUMsQ0FBQztJQUNqRixNQUFNdUgsZUFBZSxHQUFHdkgsT0FBTyxJQUFJO01BQUNzQyxjQUFjLENBQUN0QyxPQUFPLEdBQUdBLE9BQU87SUFBQyxDQUFDO0lBRXRFeUIscUJBQXFCLENBQUN3RixJQUFJLENBQUVHLHFCQUFzQixDQUFDO0lBQ25EM0YscUJBQXFCLENBQUN3RixJQUFJLENBQUVJLGVBQWdCLENBQUM7SUFDN0M1RixxQkFBcUIsQ0FBQ3dGLElBQUksQ0FBRUsscUJBQXNCLENBQUM7SUFDbkQ3RixxQkFBcUIsQ0FBQ3dGLElBQUksQ0FBRU0sZUFBZ0IsQ0FBQzs7SUFFN0M7QUFDSjtBQUNBO0FBQ0E7SUFDSSxTQUFTQyx5Q0FBeUNBLENBQUVDLGdCQUFnQixFQUFHO01BQ3JFLElBQUtBLGdCQUFnQixFQUFHO1FBQ3RCcEYsV0FBVyxDQUFDckMsT0FBTyxHQUFHLEtBQUs7UUFDM0JrQyxvQkFBb0IsQ0FBQ3dGLE9BQU8sQ0FBRW5KLHFCQUFxQixDQUFDb0osZ0JBQWlCLENBQUM7UUFDdEU5Rix1QkFBdUIsQ0FBQzZGLE9BQU8sQ0FBRW5KLHFCQUFxQixDQUFDb0osZ0JBQWlCLENBQUM7TUFDM0UsQ0FBQyxNQUNJO1FBQ0h0RixXQUFXLENBQUNyQyxPQUFPLEdBQUcsSUFBSTtRQUMxQmtDLG9CQUFvQixDQUFDd0YsT0FBTyxDQUFFbkoscUJBQXFCLENBQUNpQyxVQUFXLENBQUM7UUFDaEVxQix1QkFBdUIsQ0FBQzZGLE9BQU8sQ0FBRW5KLHFCQUFxQixDQUFDaUMsVUFBVyxDQUFDO01BQ3JFO0lBQ0Y7O0lBRUE7SUFDQWdCLHdCQUF3QixDQUFDeUYsSUFBSSxDQUFFTyx5Q0FBMEMsQ0FBQzs7SUFFMUU7SUFDQSxNQUFNSSxhQUFhLEdBQUcsSUFBSS9KLE1BQU0sQ0FBRSxJQUFJLEdBQUdVLHFCQUFxQixDQUFDMEUsWUFBWSxFQUFFcEQsa0JBQW1CLENBQUM7SUFDakcsSUFBSSxDQUFDb0MsUUFBUSxDQUFFMkYsYUFBYyxDQUFDO0lBQzlCNUUsVUFBVSxDQUFDRCxnQkFBZ0IsQ0FBRSxJQUFJbkYsY0FBYyxDQUFFO01BQy9DK0UsRUFBRSxFQUFFQSxDQUFBLEtBQU07UUFBRWlGLGFBQWEsQ0FBQzVILE9BQU8sR0FBRyxLQUFLO01BQUUsQ0FBQztNQUM1QzRDLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQUVnRixhQUFhLENBQUM1SCxPQUFPLEdBQUcsSUFBSTtNQUFFLENBQUM7TUFDN0M2QyxJQUFJLEVBQUVBLENBQUEsS0FBTTtRQUNWK0UsYUFBYSxDQUFDNUgsT0FBTyxHQUFHdUIsMEJBQTBCLENBQUN1QixNQUFNLEtBQUssQ0FBQyxJQUFJUyxDQUFDLENBQUNDLFFBQVEsQ0FBRWpDLDBCQUEwQixFQUFFRixLQUFNLENBQUM7TUFDcEg7SUFDRixDQUFFLENBQUUsQ0FBQzs7SUFFTDtBQUNKO0FBQ0E7QUFDQTtJQUNJLFNBQVN3RyxzQkFBc0JBLENBQUVDLFFBQVEsRUFBRztNQUMxQzlFLFVBQVUsQ0FBQ2dFLE1BQU0sR0FBR3RGLGtCQUFrQixDQUFDcUcsbUJBQW1CLENBQUVELFFBQVMsQ0FBQztNQUN0RUYsYUFBYSxDQUFDWixNQUFNLEdBQUdoRSxVQUFVLENBQUNnRSxNQUFNO01BQ3hDRSxXQUFXLENBQUMsQ0FBQztNQUNidEIsV0FBVyxDQUFDLENBQUM7SUFDZjs7SUFFQTtJQUNBdkUsS0FBSyxDQUFDNkQsZ0JBQWdCLENBQUMrQixJQUFJLENBQUVZLHNCQUF1QixDQUFDOztJQUVyRDtJQUNBLElBQUksQ0FBQ0csZ0JBQWdCLEdBQUcsTUFBTTtNQUM1QjNHLEtBQUssQ0FBQzhDLGFBQWEsQ0FBQzhELE1BQU0sQ0FBRXJDLFdBQVksQ0FBQztNQUN6Q3ZFLEtBQUssQ0FBQzZELGdCQUFnQixDQUFDK0MsTUFBTSxDQUFFSixzQkFBdUIsQ0FBQztNQUN2RHJHLHdCQUF3QixDQUFDeUcsTUFBTSxDQUFFVCx5Q0FBMEMsQ0FBQztNQUM1RS9GLHFCQUFxQixDQUFDd0csTUFBTSxDQUFFVixlQUFnQixDQUFDO01BQy9DOUYscUJBQXFCLENBQUN3RyxNQUFNLENBQUVaLGVBQWdCLENBQUM7TUFDL0M1RixxQkFBcUIsQ0FBQ3dHLE1BQU0sQ0FBRVgscUJBQXNCLENBQUM7TUFDckQ3RixxQkFBcUIsQ0FBQ3dHLE1BQU0sQ0FBRWIscUJBQXNCLENBQUM7SUFDdkQsQ0FBQztFQUNIOztFQUVBO0VBQ0FjLE9BQU9BLENBQUEsRUFBRztJQUNSLElBQUksQ0FBQ0YsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUNFLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBRUY7QUFFQTdKLFlBQVksQ0FBQzhKLFFBQVEsQ0FBRSxXQUFXLEVBQUVoSCxTQUFVLENBQUM7QUFDL0MsZUFBZUEsU0FBUyJ9