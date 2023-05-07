// Copyright 2017-2023, University of Colorado Boulder

/**
 * Common ScreenView used for both singular and multispring screen view.
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { AlignBox, AlignGroup, HBox, Node, PaintColorProperty, Plane } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import MutableOptionsNode from '../../../../sun/js/MutableOptionsNode.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsStrings from '../../MassesAndSpringsStrings.js';
import IndicatorVisibilityControlNode from '../../vectors/view/IndicatorVisibilityControlNode.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';
import DraggableRulerNode from './DraggableRulerNode.js';
import GravityAndDampingControlNode from './GravityAndDampingControlNode.js';
import MassNode from './MassNode.js';
import OscillatingSpringNode from './OscillatingSpringNode.js';
import ShelfNode from './ShelfNode.js';
import SpringControlPanel from './SpringControlPanel.js';
import StopperButtonNode from './StopperButtonNode.js';
import ToolboxPanel from './ToolboxPanel.js';
const springConstantPatternString = MassesAndSpringsStrings.springConstantPattern;
const springStrengthString = MassesAndSpringsStrings.springStrength;
class SpringScreenView extends ScreenView {
  /**
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, tandem, options) {
    super();
    options = merge({
      useSliderLabels: true,
      dampingVisible: false
    }, options);

    // @public {Plane} Support for expanding touchAreas near massNodes.
    this.backgroundDragPlane = new Plane();
    const closestDragForwardingListener = new ClosestDragForwardingListener(30, 0);
    this.backgroundDragPlane.addInputListener(closestDragForwardingListener);

    // @public {MassesAndSpringsModel}
    this.model = model;
    const viewOrigin = new Vector2(0, this.visibleBoundsProperty.get().height * (1 - MassesAndSpringsConstants.SHELF_HEIGHT));

    // @public {ModelViewTransform2}
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, viewOrigin, 397);

    // @public {PaintColorProperty} Colors for OscillatingSpringNode
    this.springFrontColorProperty = new PaintColorProperty('lightGray');
    this.springMiddleColorProperty = new PaintColorProperty('gray');
    this.springBackColorProperty = new PaintColorProperty('black');

    // @private {Array.<MutableOptionsNode>} Used to reference the created springs in the view.
    this.springNodes = model.springs.map(spring => {
      const springNode = new MutableOptionsNode(OscillatingSpringNode, [spring, this.modelViewTransform,
      // see https://github.com/phetsims/masses-and-springs-basics/issues/67
      Tandem.OPT_OUT], {
        leftEndLength: -10
      }, {
        frontColor: this.springFrontColorProperty,
        middleColor: this.springMiddleColorProperty,
        backColor: this.springBackColorProperty
      });
      this.addChild(springNode);
      return springNode;
    });

    // @protected {number} - Spacing used for the margin of layout bounds
    this.spacing = 10;

    // @public {Node} Specific layer for massNodes. Used for setting layering order of massNodes.
    this.massLayer = new Node({
      tandem: tandem.createTandem('massLayer'),
      preventFit: true
    });

    // @public {Array.<Node>}
    this.massNodes = [];
    this.massNodes = model.masses.map(mass => {
      const massNode = new MassNode(mass, this.modelViewTransform, this.visibleBoundsProperty, model, tandem.createTandem(`${mass.massTandem.name}Node`));
      this.massLayer.addChild(massNode);

      // If the mass is on the shelf reset the mass layers.
      mass.onShelfProperty.lazyLink(onShelf => {
        if (onShelf) {
          this.resetMassLayer();
        }
      });
      closestDragForwardingListener.addDraggableItem({
        startDrag: massNode.dragListener._start.bind(massNode.dragListener),
        // globalPoint is the position of our pointer.
        computeDistance: globalPoint => {
          // The mass position is recognized as being really far away.
          if (mass.userControlledProperty.value) {
            return Number.POSITIVE_INFINITY;
          } else {
            const cursorViewPosition = this.globalToLocalPoint(globalPoint);
            const massRectBounds = massNode.localToParentBounds(massNode.rect.bounds);
            const massHookBounds = massNode.localToParentBounds(massNode.hookNode.bounds);
            return Math.sqrt(Math.min(massRectBounds.minimumDistanceToPointSquared(cursorViewPosition), massHookBounds.minimumDistanceToPointSquared(cursorViewPosition)));
          }
        }
      });

      // Keeps track of the mass node to restore original Z order.
      return massNode;
    });

    // @public {Shelf} Add shelf for to house massNodes
    this.shelf = new ShelfNode(tandem, {
      rectHeight: 7
    });
    this.shelf.rectY = this.modelViewTransform.modelToViewY(MassesAndSpringsConstants.FLOOR_Y) - this.shelf.rectHeight;
    if (!model.basicsVersion) {
      this.addChild(this.shelf);
    }

    // @public {GravityAndDampingControlNode} Gravity Control Panel
    this.gravityAndDampingControlNode = new GravityAndDampingControlNode(model, this, tandem.createTandem('gravityAndDampingControlNode'), {
      maxWidth: MassesAndSpringsConstants.PANEL_MAX_WIDTH + 25,
      dampingVisible: options.dampingVisible,
      xMargin: 0,
      yMargin: 0,
      stroke: null,
      useSliderLabels: options.useSliderLabels
    });

    // @private
    this.stopwatchNode = new StopwatchNode(model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty,
      dragListenerOptions: {
        end: () => {
          // When a node is released, check if it is over the toolbox.  If so, drop it in.
          if (this.toolboxPanel.getGlobalBounds().intersectsBounds(this.stopwatchNode.getGlobalBounds())) {
            model.stopwatch.reset();
          }
        }
      },
      tandem: tandem.createTandem('stopwatchNode')
    });

    // @public {DraggableRulerNode}
    this.rulerNode = new DraggableRulerNode(this.modelViewTransform, this.visibleBoundsProperty.get(), Vector2.ZERO, model.rulerVisibleProperty, () => {
      // When a node is released, check if it is over the toolbox.  If so, drop it in.
      if (this.toolboxPanel.getGlobalBounds().intersectsBounds(this.rulerNode.getGlobalBounds())) {
        model.rulerVisibleProperty.set(false);
      }
    }, tandem.createTandem('rulerNode'));

    // @public {Node} Create specific layer for tools so they don't overlap the reset all button.
    this.toolsLayer = new Node({
      children: [this.stopwatchNode, this.rulerNode],
      tandem: tandem.createTandem('massLayer'),
      preventFit: true
    });

    // @public {ResetAllButton} Reset All button
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();

        // Done to preserve layering order to initial state. Prevents masses from stacking over each other.
        this.resetMassLayer();
      },
      tandem: tandem.createTandem('resetAllButton')
    });

    // @public {TimeControlNode} Sim speed controls
    this.timeControlNode = new TimeControlNode(model.playingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            model.stepForward(0.01);
          }
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    });

    // @public {AlignGroup}
    this.rightPanelAlignGroup = new AlignGroup({
      matchVertical: false
    });

    // @public {ToolboxPanel} Toolbox Panel
    this.toolboxPanel = new ToolboxPanel(model.stopwatch, this.visibleBoundsProperty.get(), this.rulerNode, this.stopwatchNode, model.rulerVisibleProperty, this.rightPanelAlignGroup, tandem.createTandem('toolboxPanel'), {
      minWidth: MassesAndSpringsConstants.PANEL_MIN_WIDTH + 32
    });

    // @public {HBox} Buttons controlling the speed of the sim, play/pause button, and the reset button
    this.simControlHBox = new HBox({
      spacing: this.spacing * 6,
      children: [this.timeControlNode, this.resetAllButton]
    });
    this.addChild(this.simControlHBox);

    // @protected {Node} Layer that gets moved to the back of the scene graph to handle z-ordering of subtypes.
    this.backLayer = new Node();
    this.addChild(this.backLayer);
    this.backLayer.moveToBack();
  }

  /**
   * Helper function to restore initial layering of the masses to prevent them from stacking over each other.
   * @public
   */
  resetMassLayer() {
    this.massNodes.forEach(massNode => {
      massNode.moveToFront();
    });
  }

  /**
   * Creates a stopper button that stops the oscillation of its referenced spring.
   * @public
   *
   * @param {Spring} spring
   * @param {Tandem} tandem
   * @returns {StopperButtonNode}
   */
  createStopperButton(spring, tandem) {
    return new StopperButtonNode(tandem.createTandem('secondSpringStopperButtonNode'), {
      listener: () => {
        spring.stopSpring();
      },
      top: this.spacing
    });
  }

  /**
   * Creates a panel that controls the designated spring's spring constant value.
   * @public
   *
   * @param {number} springIndex
   * @param {Array.<Text>} labels
   * @param {Tandem} tandem
   * @param {Object} [options]
   *
   * @returns {SpringControlPanel}
   */
  createSpringConstantPanel(springIndex, labels, tandem, options) {
    // Additional options for compatibility with Masses and Springs: Basics
    options = merge({
      string: this.model.basicsVersion ? springStrengthString : springConstantPatternString,
      sliderTrackSize: this.model.basicsVersion ? new Dimension2(140, 0.1) : new Dimension2(120, 0.1),
      yMargin: this.model.basicsVersion ? 7 : 5,
      spacing: this.model.basicsVersion ? 5 : 3,
      tickLabelSpacing: this.model.basicsVersion ? 7 : 6
    }, options);
    return new SpringControlPanel(this.model.springs[springIndex].springConstantProperty, MassesAndSpringsConstants.SPRING_CONSTANT_RANGE, StringUtils.fillIn(options.string, {
      spring: springIndex + 1,
      maxWidth: 40
    }), labels, tandem.createTandem('firstSpringConstantControlPanel'), {
      top: this.spacing,
      visible: true,
      fill: 'white',
      stroke: 'gray',
      spacing: options.spacing,
      yMargin: options.yMargin,
      sliderTrackSize: options.sliderTrackSize,
      tickLabelSpacing: options.tickLabelSpacing,
      constrainValue: value => +Utils.toFixed(value, 0)
    });
  }

  /**
   * Creates a panel that displays visible indicators for reference lines, displacement arrow, and period trace.
   * @public
   *
   * @param {MassesAndSpringsModel} model
   * @param {Boolean} displayPeriodTrace
   * @param {Tandem} tandem
   * @returns {IndicatorVisibilityControlNode}
   */
  createIndicatorVisibilityPanel(model, displayPeriodTrace, tandem) {
    return new IndicatorVisibilityControlNode(model, tandem.createTandem('indicatorVisibilityControlNode'), {
      periodTraceOption: displayPeriodTrace
    });
  }

  /**
   * Creates a panel that displays all of the right hand panels on the screen.
   * @public
   *
   * @param {Node} optionsContent
   * @param {AlignGroup} alignGroup
   * @param {Tandem } tandem
   * @returns {Panel}
   */
  createOptionsPanel(optionsContent, alignGroup, tandem) {
    const optionsContentAlignBox = new AlignBox(optionsContent, {
      group: alignGroup
    });
    const optionsPanel = new Panel(optionsContentAlignBox, {
      xMargin: 10,
      fill: MassesAndSpringsConstants.PANEL_FILL,
      align: 'center',
      cornerRadius: MassesAndSpringsConstants.PANEL_CORNER_RADIUS,
      tandem: tandem.createTandem('optionsPanel'),
      minWidth: MassesAndSpringsConstants.PANEL_MIN_WIDTH + 30
    });
    optionsPanel.moveToBack();
    return optionsPanel;
  }

  /**
   * Adjusting view components of panels and draggable objects based on visible bounds of the
   * one and two spring views.
   *
   * @param {Boolean} singleSpringView
   * @param {Bounds2} visibleBounds
   * @public
   */
  adjustViewComponents(singleSpringView, visibleBounds) {
    // Handle adjustments for single spring system
    if (singleSpringView) {
      this.panelRightSpacing = visibleBounds.right - this.spacing;

      // Alignment of layout
      this.springSystemControlsNode.centerX = this.springCenter * 0.855; // centering springHangerNode over spring
      this.springSystemControlsNode.top = this.spacing;
      this.springConstantControlPanel.top = this.springSystemControlsNode.top;
      this.springConstantControlPanel.left = this.springSystemControlsNode.right + this.spacing;
      this.springSystemControlsNode.top = this.spacing;
      this.simControlHBox.rightBottom = new Vector2(this.panelRightSpacing, this.shelf.bottom);
      this.movableLineNode.centerX = this.springCenter;
      if (!this.model.basicsVersion) {
        this.energyGraphAccordionBox.leftTop = new Vector2(visibleBounds.left + this.spacing, this.springSystemControlsNode.top);
      }
    }

    // Handle adjustments for two spring system
    else {
      // {number} Used in determining springSystemControlsNode's placement
      const distanceBetweenSprings = this.modelViewTransform.modelToViewX(this.model.firstSpring.positionProperty.value.distance(this.model.secondSpring.positionProperty.value)) / 2;
      const leftSpringXPosition = this.modelViewTransform.modelToViewX(this.model.firstSpring.positionProperty.value.x);

      // Update the bounds of view elements
      this.panelRightSpacing = visibleBounds.right - this.spacing;

      // Alignment of layout
      this.springSystemControlsNode.x = leftSpringXPosition + distanceBetweenSprings - this.springHangerNode.centerX;
      this.springSystemControlsNode.top = this.spacing;
      this.simControlHBox.rightBottom = new Vector2(this.panelRightSpacing, this.shelf.bottom);
    }

    // Adjusting drag bounds of draggable objects based on visible bounds.
    this.rulerNode.rulerNodeDragListener.dragBoundsProperty = visibleBounds.withOffsets(-this.rulerNode.width / 2, this.rulerNode.height / 2, this.rulerNode.width / 2, -this.rulerNode.height / 2);
    this.massNodes.forEach(function (massNode) {
      if (massNode.centerX > visibleBounds.maxX) {
        massNode.mass.positionProperty.set(new Vector2(this.modelViewTransform.viewToModelX(visibleBounds.maxX), massNode.mass.positionProperty.get().y));
      }
      if (massNode.centerX < visibleBounds.minX) {
        massNode.mass.positionProperty.set(new Vector2(this.modelViewTransform.viewToModelX(visibleBounds.minX), massNode.mass.positionProperty.get().y));
      }
    });
  }
}
massesAndSprings.register('SpringScreenView', SpringScreenView);
export default SpringScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiUmVzZXRBbGxCdXR0b24iLCJTdG9wd2F0Y2hOb2RlIiwiVGltZUNvbnRyb2xOb2RlIiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiSEJveCIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJQbGFuZSIsIkNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyIiwiTXV0YWJsZU9wdGlvbnNOb2RlIiwiUGFuZWwiLCJUYW5kZW0iLCJtYXNzZXNBbmRTcHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3MiLCJJbmRpY2F0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGUiLCJNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIiwiRHJhZ2dhYmxlUnVsZXJOb2RlIiwiR3Jhdml0eUFuZERhbXBpbmdDb250cm9sTm9kZSIsIk1hc3NOb2RlIiwiT3NjaWxsYXRpbmdTcHJpbmdOb2RlIiwiU2hlbGZOb2RlIiwiU3ByaW5nQ29udHJvbFBhbmVsIiwiU3RvcHBlckJ1dHRvbk5vZGUiLCJUb29sYm94UGFuZWwiLCJzcHJpbmdDb25zdGFudFBhdHRlcm5TdHJpbmciLCJzcHJpbmdDb25zdGFudFBhdHRlcm4iLCJzcHJpbmdTdHJlbmd0aFN0cmluZyIsInNwcmluZ1N0cmVuZ3RoIiwiU3ByaW5nU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJvcHRpb25zIiwidXNlU2xpZGVyTGFiZWxzIiwiZGFtcGluZ1Zpc2libGUiLCJiYWNrZ3JvdW5kRHJhZ1BsYW5lIiwiY2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwidmlld09yaWdpbiIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImdldCIsImhlaWdodCIsIlNIRUxGX0hFSUdIVCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nIiwiWkVSTyIsInNwcmluZ0Zyb250Q29sb3JQcm9wZXJ0eSIsInNwcmluZ01pZGRsZUNvbG9yUHJvcGVydHkiLCJzcHJpbmdCYWNrQ29sb3JQcm9wZXJ0eSIsInNwcmluZ05vZGVzIiwic3ByaW5ncyIsIm1hcCIsInNwcmluZyIsInNwcmluZ05vZGUiLCJPUFRfT1VUIiwibGVmdEVuZExlbmd0aCIsImZyb250Q29sb3IiLCJtaWRkbGVDb2xvciIsImJhY2tDb2xvciIsImFkZENoaWxkIiwic3BhY2luZyIsIm1hc3NMYXllciIsImNyZWF0ZVRhbmRlbSIsInByZXZlbnRGaXQiLCJtYXNzTm9kZXMiLCJtYXNzZXMiLCJtYXNzIiwibWFzc05vZGUiLCJtYXNzVGFuZGVtIiwibmFtZSIsIm9uU2hlbGZQcm9wZXJ0eSIsImxhenlMaW5rIiwib25TaGVsZiIsInJlc2V0TWFzc0xheWVyIiwiYWRkRHJhZ2dhYmxlSXRlbSIsInN0YXJ0RHJhZyIsImRyYWdMaXN0ZW5lciIsIl9zdGFydCIsImJpbmQiLCJjb21wdXRlRGlzdGFuY2UiLCJnbG9iYWxQb2ludCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ2YWx1ZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY3Vyc29yVmlld1Bvc2l0aW9uIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwibWFzc1JlY3RCb3VuZHMiLCJsb2NhbFRvUGFyZW50Qm91bmRzIiwicmVjdCIsImJvdW5kcyIsIm1hc3NIb29rQm91bmRzIiwiaG9va05vZGUiLCJNYXRoIiwic3FydCIsIm1pbiIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwic2hlbGYiLCJyZWN0SGVpZ2h0IiwicmVjdFkiLCJtb2RlbFRvVmlld1kiLCJGTE9PUl9ZIiwiYmFzaWNzVmVyc2lvbiIsImdyYXZpdHlBbmREYW1waW5nQ29udHJvbE5vZGUiLCJtYXhXaWR0aCIsIlBBTkVMX01BWF9XSURUSCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwic3Ryb2tlIiwic3RvcHdhdGNoTm9kZSIsInN0b3B3YXRjaCIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImRyYWdMaXN0ZW5lck9wdGlvbnMiLCJlbmQiLCJ0b29sYm94UGFuZWwiLCJnZXRHbG9iYWxCb3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwicmVzZXQiLCJydWxlck5vZGUiLCJydWxlclZpc2libGVQcm9wZXJ0eSIsInNldCIsInRvb2xzTGF5ZXIiLCJjaGlsZHJlbiIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJ0aW1lQ29udHJvbE5vZGUiLCJwbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zIiwic3RlcEZvcndhcmRCdXR0b25PcHRpb25zIiwic3RlcEZvcndhcmQiLCJyaWdodFBhbmVsQWxpZ25Hcm91cCIsIm1hdGNoVmVydGljYWwiLCJtaW5XaWR0aCIsIlBBTkVMX01JTl9XSURUSCIsInNpbUNvbnRyb2xIQm94IiwiYmFja0xheWVyIiwibW92ZVRvQmFjayIsImZvckVhY2giLCJtb3ZlVG9Gcm9udCIsImNyZWF0ZVN0b3BwZXJCdXR0b24iLCJzdG9wU3ByaW5nIiwidG9wIiwiY3JlYXRlU3ByaW5nQ29uc3RhbnRQYW5lbCIsInNwcmluZ0luZGV4IiwibGFiZWxzIiwic3RyaW5nIiwic2xpZGVyVHJhY2tTaXplIiwidGlja0xhYmVsU3BhY2luZyIsInNwcmluZ0NvbnN0YW50UHJvcGVydHkiLCJTUFJJTkdfQ09OU1RBTlRfUkFOR0UiLCJmaWxsSW4iLCJ2aXNpYmxlIiwiZmlsbCIsImNvbnN0cmFpblZhbHVlIiwidG9GaXhlZCIsImNyZWF0ZUluZGljYXRvclZpc2liaWxpdHlQYW5lbCIsImRpc3BsYXlQZXJpb2RUcmFjZSIsInBlcmlvZFRyYWNlT3B0aW9uIiwiY3JlYXRlT3B0aW9uc1BhbmVsIiwib3B0aW9uc0NvbnRlbnQiLCJhbGlnbkdyb3VwIiwib3B0aW9uc0NvbnRlbnRBbGlnbkJveCIsImdyb3VwIiwib3B0aW9uc1BhbmVsIiwiUEFORUxfRklMTCIsImFsaWduIiwiY29ybmVyUmFkaXVzIiwiUEFORUxfQ09STkVSX1JBRElVUyIsImFkanVzdFZpZXdDb21wb25lbnRzIiwic2luZ2xlU3ByaW5nVmlldyIsInZpc2libGVCb3VuZHMiLCJwYW5lbFJpZ2h0U3BhY2luZyIsInJpZ2h0Iiwic3ByaW5nU3lzdGVtQ29udHJvbHNOb2RlIiwiY2VudGVyWCIsInNwcmluZ0NlbnRlciIsInNwcmluZ0NvbnN0YW50Q29udHJvbFBhbmVsIiwibGVmdCIsInJpZ2h0Qm90dG9tIiwiYm90dG9tIiwibW92YWJsZUxpbmVOb2RlIiwiZW5lcmd5R3JhcGhBY2NvcmRpb25Cb3giLCJsZWZ0VG9wIiwiZGlzdGFuY2VCZXR3ZWVuU3ByaW5ncyIsIm1vZGVsVG9WaWV3WCIsImZpcnN0U3ByaW5nIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRpc3RhbmNlIiwic2Vjb25kU3ByaW5nIiwibGVmdFNwcmluZ1hQb3NpdGlvbiIsIngiLCJzcHJpbmdIYW5nZXJOb2RlIiwicnVsZXJOb2RlRHJhZ0xpc3RlbmVyIiwid2l0aE9mZnNldHMiLCJ3aWR0aCIsIm1heFgiLCJ2aWV3VG9Nb2RlbFgiLCJ5IiwibWluWCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3ByaW5nU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21tb24gU2NyZWVuVmlldyB1c2VkIGZvciBib3RoIHNpbmd1bGFyIGFuZCBtdWx0aXNwcmluZyBzY3JlZW4gdmlldy5cclxuICpcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCBUaW1lQ29udHJvbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBBbGlnbkdyb3VwLCBIQm94LCBOb2RlLCBQYWludENvbG9yUHJvcGVydHksIFBsYW5lIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBNdXRhYmxlT3B0aW9uc05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL011dGFibGVPcHRpb25zTm9kZS5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbWFzc2VzQW5kU3ByaW5ncyBmcm9tICcuLi8uLi9tYXNzZXNBbmRTcHJpbmdzLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzIGZyb20gJy4uLy4uL01hc3Nlc0FuZFNwcmluZ3NTdHJpbmdzLmpzJztcclxuaW1wb3J0IEluZGljYXRvclZpc2liaWxpdHlDb250cm9sTm9kZSBmcm9tICcuLi8uLi92ZWN0b3JzL3ZpZXcvSW5kaWNhdG9yVmlzaWJpbGl0eUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMgZnJvbSAnLi4vTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEcmFnZ2FibGVSdWxlck5vZGUgZnJvbSAnLi9EcmFnZ2FibGVSdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZERhbXBpbmdDb250cm9sTm9kZSBmcm9tICcuL0dyYXZpdHlBbmREYW1waW5nQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgTWFzc05vZGUgZnJvbSAnLi9NYXNzTm9kZS5qcyc7XHJcbmltcG9ydCBPc2NpbGxhdGluZ1NwcmluZ05vZGUgZnJvbSAnLi9Pc2NpbGxhdGluZ1NwcmluZ05vZGUuanMnO1xyXG5pbXBvcnQgU2hlbGZOb2RlIGZyb20gJy4vU2hlbGZOb2RlLmpzJztcclxuaW1wb3J0IFNwcmluZ0NvbnRyb2xQYW5lbCBmcm9tICcuL1NwcmluZ0NvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBTdG9wcGVyQnV0dG9uTm9kZSBmcm9tICcuL1N0b3BwZXJCdXR0b25Ob2RlLmpzJztcclxuaW1wb3J0IFRvb2xib3hQYW5lbCBmcm9tICcuL1Rvb2xib3hQYW5lbC5qcyc7XHJcblxyXG5jb25zdCBzcHJpbmdDb25zdGFudFBhdHRlcm5TdHJpbmcgPSBNYXNzZXNBbmRTcHJpbmdzU3RyaW5ncy5zcHJpbmdDb25zdGFudFBhdHRlcm47XHJcbmNvbnN0IHNwcmluZ1N0cmVuZ3RoU3RyaW5nID0gTWFzc2VzQW5kU3ByaW5nc1N0cmluZ3Muc3ByaW5nU3RyZW5ndGg7XHJcblxyXG5jbGFzcyBTcHJpbmdTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzZXNBbmRTcHJpbmdzTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHVzZVNsaWRlckxhYmVsczogdHJ1ZSxcclxuICAgICAgZGFtcGluZ1Zpc2libGU6IGZhbHNlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGxhbmV9IFN1cHBvcnQgZm9yIGV4cGFuZGluZyB0b3VjaEFyZWFzIG5lYXIgbWFzc05vZGVzLlxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kRHJhZ1BsYW5lID0gbmV3IFBsYW5lKCk7XHJcbiAgICBjb25zdCBjbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciA9IG5ldyBDbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lciggMzAsIDAgKTtcclxuXHJcbiAgICB0aGlzLmJhY2tncm91bmREcmFnUGxhbmUuYWRkSW5wdXRMaXN0ZW5lciggY2xvc2VzdERyYWdGb3J3YXJkaW5nTGlzdGVuZXIgKTtcclxuXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TWFzc2VzQW5kU3ByaW5nc01vZGVsfVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGNvbnN0IHZpZXdPcmlnaW4gPSBuZXcgVmVjdG9yMiggMCwgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkuaGVpZ2h0ICogKCAxIC0gTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5TSEVMRl9IRUlHSFQgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01vZGVsVmlld1RyYW5zZm9ybTJ9XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoIFZlY3RvcjIuWkVSTywgdmlld09yaWdpbiwgMzk3ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UGFpbnRDb2xvclByb3BlcnR5fSBDb2xvcnMgZm9yIE9zY2lsbGF0aW5nU3ByaW5nTm9kZVxyXG4gICAgdGhpcy5zcHJpbmdGcm9udENvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCAnbGlnaHRHcmF5JyApO1xyXG4gICAgdGhpcy5zcHJpbmdNaWRkbGVDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggJ2dyYXknICk7XHJcbiAgICB0aGlzLnNwcmluZ0JhY2tDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggJ2JsYWNrJyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48TXV0YWJsZU9wdGlvbnNOb2RlPn0gVXNlZCB0byByZWZlcmVuY2UgdGhlIGNyZWF0ZWQgc3ByaW5ncyBpbiB0aGUgdmlldy5cclxuICAgIHRoaXMuc3ByaW5nTm9kZXMgPSBtb2RlbC5zcHJpbmdzLm1hcCggc3ByaW5nID0+IHtcclxuICAgICAgY29uc3Qgc3ByaW5nTm9kZSA9IG5ldyBNdXRhYmxlT3B0aW9uc05vZGUoIE9zY2lsbGF0aW5nU3ByaW5nTm9kZSwgW1xyXG4gICAgICAgICAgc3ByaW5nLFxyXG4gICAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcblxyXG4gICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tYXNzZXMtYW5kLXNwcmluZ3MtYmFzaWNzL2lzc3Vlcy82N1xyXG4gICAgICAgICAgVGFuZGVtLk9QVF9PVVRcclxuICAgICAgICBdLFxyXG4gICAgICAgIHsgbGVmdEVuZExlbmd0aDogLTEwIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZnJvbnRDb2xvcjogdGhpcy5zcHJpbmdGcm9udENvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICBtaWRkbGVDb2xvcjogdGhpcy5zcHJpbmdNaWRkbGVDb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgYmFja0NvbG9yOiB0aGlzLnNwcmluZ0JhY2tDb2xvclByb3BlcnR5XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBzcHJpbmdOb2RlICk7XHJcbiAgICAgIHJldHVybiBzcHJpbmdOb2RlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge251bWJlcn0gLSBTcGFjaW5nIHVzZWQgZm9yIHRoZSBtYXJnaW4gb2YgbGF5b3V0IGJvdW5kc1xyXG4gICAgdGhpcy5zcGFjaW5nID0gMTA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZX0gU3BlY2lmaWMgbGF5ZXIgZm9yIG1hc3NOb2Rlcy4gVXNlZCBmb3Igc2V0dGluZyBsYXllcmluZyBvcmRlciBvZiBtYXNzTm9kZXMuXHJcbiAgICB0aGlzLm1hc3NMYXllciA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NMYXllcicgKSwgcHJldmVudEZpdDogdHJ1ZSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPE5vZGU+fVxyXG4gICAgdGhpcy5tYXNzTm9kZXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLm1hc3NOb2RlcyA9IG1vZGVsLm1hc3Nlcy5tYXAoIG1hc3MgPT4ge1xyXG4gICAgICBjb25zdCBtYXNzTm9kZSA9IG5ldyBNYXNzTm9kZShcclxuICAgICAgICBtYXNzLFxyXG4gICAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLFxyXG4gICAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oIGAke21hc3MubWFzc1RhbmRlbS5uYW1lfU5vZGVgICkgKTtcclxuICAgICAgdGhpcy5tYXNzTGF5ZXIuYWRkQ2hpbGQoIG1hc3NOb2RlICk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgbWFzcyBpcyBvbiB0aGUgc2hlbGYgcmVzZXQgdGhlIG1hc3MgbGF5ZXJzLlxyXG4gICAgICBtYXNzLm9uU2hlbGZQcm9wZXJ0eS5sYXp5TGluayggb25TaGVsZiA9PiB7XHJcbiAgICAgICAgaWYgKCBvblNoZWxmICkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldE1hc3NMYXllcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICBjbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5hZGREcmFnZ2FibGVJdGVtKCB7XHJcbiAgICAgICAgc3RhcnREcmFnOiBtYXNzTm9kZS5kcmFnTGlzdGVuZXIuX3N0YXJ0LmJpbmQoIG1hc3NOb2RlLmRyYWdMaXN0ZW5lciApLFxyXG5cclxuICAgICAgICAvLyBnbG9iYWxQb2ludCBpcyB0aGUgcG9zaXRpb24gb2Ygb3VyIHBvaW50ZXIuXHJcbiAgICAgICAgY29tcHV0ZURpc3RhbmNlOiBnbG9iYWxQb2ludCA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIG1hc3MgcG9zaXRpb24gaXMgcmVjb2duaXplZCBhcyBiZWluZyByZWFsbHkgZmFyIGF3YXkuXHJcbiAgICAgICAgICBpZiAoIG1hc3MudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJzb3JWaWV3UG9zaXRpb24gPSB0aGlzLmdsb2JhbFRvTG9jYWxQb2ludCggZ2xvYmFsUG9pbnQgKTtcclxuICAgICAgICAgICAgY29uc3QgbWFzc1JlY3RCb3VuZHMgPSBtYXNzTm9kZS5sb2NhbFRvUGFyZW50Qm91bmRzKCBtYXNzTm9kZS5yZWN0LmJvdW5kcyApO1xyXG4gICAgICAgICAgICBjb25zdCBtYXNzSG9va0JvdW5kcyA9IG1hc3NOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoIG1hc3NOb2RlLmhvb2tOb2RlLmJvdW5kcyApO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCggTWF0aC5taW4oXHJcbiAgICAgICAgICAgICAgbWFzc1JlY3RCb3VuZHMubWluaW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIGN1cnNvclZpZXdQb3NpdGlvbiApLFxyXG4gICAgICAgICAgICAgIG1hc3NIb29rQm91bmRzLm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkKCBjdXJzb3JWaWV3UG9zaXRpb24gKVxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG5cclxuICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIG1hc3Mgbm9kZSB0byByZXN0b3JlIG9yaWdpbmFsIFogb3JkZXIuXHJcbiAgICAgIHJldHVybiBtYXNzTm9kZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTaGVsZn0gQWRkIHNoZWxmIGZvciB0byBob3VzZSBtYXNzTm9kZXNcclxuICAgIHRoaXMuc2hlbGYgPSBuZXcgU2hlbGZOb2RlKCB0YW5kZW0sIHtcclxuICAgICAgcmVjdEhlaWdodDogN1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zaGVsZi5yZWN0WSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5GTE9PUl9ZICkgLSB0aGlzLnNoZWxmLnJlY3RIZWlnaHQ7XHJcblxyXG4gICAgaWYgKCAhbW9kZWwuYmFzaWNzVmVyc2lvbiApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zaGVsZiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwdWJsaWMge0dyYXZpdHlBbmREYW1waW5nQ29udHJvbE5vZGV9IEdyYXZpdHkgQ29udHJvbCBQYW5lbFxyXG4gICAgdGhpcy5ncmF2aXR5QW5kRGFtcGluZ0NvbnRyb2xOb2RlID0gbmV3IEdyYXZpdHlBbmREYW1waW5nQ29udHJvbE5vZGUoXHJcbiAgICAgIG1vZGVsLCB0aGlzLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3Jhdml0eUFuZERhbXBpbmdDb250cm9sTm9kZScgKSwge1xyXG4gICAgICAgIG1heFdpZHRoOiBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzLlBBTkVMX01BWF9XSURUSCArIDI1LFxyXG4gICAgICAgIGRhbXBpbmdWaXNpYmxlOiBvcHRpb25zLmRhbXBpbmdWaXNpYmxlLFxyXG4gICAgICAgIHhNYXJnaW46IDAsXHJcbiAgICAgICAgeU1hcmdpbjogMCxcclxuICAgICAgICBzdHJva2U6IG51bGwsXHJcbiAgICAgICAgdXNlU2xpZGVyTGFiZWxzOiBvcHRpb25zLnVzZVNsaWRlckxhYmVsc1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc3RvcHdhdGNoTm9kZSA9IG5ldyBTdG9wd2F0Y2hOb2RlKCBtb2RlbC5zdG9wd2F0Y2gsIHtcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9uczoge1xyXG4gICAgICAgIGVuZDogKCkgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFdoZW4gYSBub2RlIGlzIHJlbGVhc2VkLCBjaGVjayBpZiBpdCBpcyBvdmVyIHRoZSB0b29sYm94LiAgSWYgc28sIGRyb3AgaXQgaW4uXHJcbiAgICAgICAgICBpZiAoIHRoaXMudG9vbGJveFBhbmVsLmdldEdsb2JhbEJvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHRoaXMuc3RvcHdhdGNoTm9kZS5nZXRHbG9iYWxCb3VuZHMoKSApICkge1xyXG4gICAgICAgICAgICBtb2RlbC5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtEcmFnZ2FibGVSdWxlck5vZGV9XHJcbiAgICB0aGlzLnJ1bGVyTm9kZSA9IG5ldyBEcmFnZ2FibGVSdWxlck5vZGUoXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICBtb2RlbC5ydWxlclZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBXaGVuIGEgbm9kZSBpcyByZWxlYXNlZCwgY2hlY2sgaWYgaXQgaXMgb3ZlciB0aGUgdG9vbGJveC4gIElmIHNvLCBkcm9wIGl0IGluLlxyXG4gICAgICAgIGlmICggdGhpcy50b29sYm94UGFuZWwuZ2V0R2xvYmFsQm91bmRzKCkuaW50ZXJzZWN0c0JvdW5kcyggdGhpcy5ydWxlck5vZGUuZ2V0R2xvYmFsQm91bmRzKCkgKSApIHtcclxuICAgICAgICAgIG1vZGVsLnJ1bGVyVmlzaWJsZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdydWxlck5vZGUnIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZX0gQ3JlYXRlIHNwZWNpZmljIGxheWVyIGZvciB0b29scyBzbyB0aGV5IGRvbid0IG92ZXJsYXAgdGhlIHJlc2V0IGFsbCBidXR0b24uXHJcbiAgICB0aGlzLnRvb2xzTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aGlzLnN0b3B3YXRjaE5vZGUsIHRoaXMucnVsZXJOb2RlIF0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NMYXllcicgKSxcclxuICAgICAgcHJldmVudEZpdDogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Jlc2V0QWxsQnV0dG9ufSBSZXNldCBBbGwgYnV0dG9uXHJcbiAgICB0aGlzLnJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuXHJcbiAgICAgICAgLy8gRG9uZSB0byBwcmVzZXJ2ZSBsYXllcmluZyBvcmRlciB0byBpbml0aWFsIHN0YXRlLiBQcmV2ZW50cyBtYXNzZXMgZnJvbSBzdGFja2luZyBvdmVyIGVhY2ggb3RoZXIuXHJcbiAgICAgICAgdGhpcy5yZXNldE1hc3NMYXllcigpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1RpbWVDb250cm9sTm9kZX0gU2ltIHNwZWVkIGNvbnRyb2xzXHJcbiAgICB0aGlzLnRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLnBsYXlpbmdQcm9wZXJ0eSwge1xyXG4gICAgICB0aW1lU3BlZWRQcm9wZXJ0eTogbW9kZWwudGltZVNwZWVkUHJvcGVydHksXHJcbiAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc3RlcEZvcndhcmRCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4geyBtb2RlbC5zdGVwRm9yd2FyZCggMC4wMSApOyB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBbGlnbkdyb3VwfVxyXG4gICAgdGhpcy5yaWdodFBhbmVsQWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCB7IG1hdGNoVmVydGljYWw6IGZhbHNlIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtUb29sYm94UGFuZWx9IFRvb2xib3ggUGFuZWxcclxuICAgIHRoaXMudG9vbGJveFBhbmVsID0gbmV3IFRvb2xib3hQYW5lbChcclxuICAgICAgbW9kZWwuc3RvcHdhdGNoLFxyXG4gICAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5ydWxlck5vZGUsXHJcbiAgICAgIHRoaXMuc3RvcHdhdGNoTm9kZSxcclxuICAgICAgbW9kZWwucnVsZXJWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRoaXMucmlnaHRQYW5lbEFsaWduR3JvdXAsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b29sYm94UGFuZWwnICksIHtcclxuICAgICAgICBtaW5XaWR0aDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5QQU5FTF9NSU5fV0lEVEggKyAzMlxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0hCb3h9IEJ1dHRvbnMgY29udHJvbGxpbmcgdGhlIHNwZWVkIG9mIHRoZSBzaW0sIHBsYXkvcGF1c2UgYnV0dG9uLCBhbmQgdGhlIHJlc2V0IGJ1dHRvblxyXG4gICAgdGhpcy5zaW1Db250cm9sSEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IHRoaXMuc3BhY2luZyAqIDYsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMudGltZUNvbnRyb2xOb2RlLCB0aGlzLnJlc2V0QWxsQnV0dG9uIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc2ltQ29udHJvbEhCb3ggKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtOb2RlfSBMYXllciB0aGF0IGdldHMgbW92ZWQgdG8gdGhlIGJhY2sgb2YgdGhlIHNjZW5lIGdyYXBoIHRvIGhhbmRsZSB6LW9yZGVyaW5nIG9mIHN1YnR5cGVzLlxyXG4gICAgdGhpcy5iYWNrTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYWNrTGF5ZXIgKTtcclxuICAgIHRoaXMuYmFja0xheWVyLm1vdmVUb0JhY2soKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0byByZXN0b3JlIGluaXRpYWwgbGF5ZXJpbmcgb2YgdGhlIG1hc3NlcyB0byBwcmV2ZW50IHRoZW0gZnJvbSBzdGFja2luZyBvdmVyIGVhY2ggb3RoZXIuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0TWFzc0xheWVyKCkge1xyXG4gICAgdGhpcy5tYXNzTm9kZXMuZm9yRWFjaCggbWFzc05vZGUgPT4ge1xyXG4gICAgICBtYXNzTm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHN0b3BwZXIgYnV0dG9uIHRoYXQgc3RvcHMgdGhlIG9zY2lsbGF0aW9uIG9mIGl0cyByZWZlcmVuY2VkIHNwcmluZy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1NwcmluZ30gc3ByaW5nXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEByZXR1cm5zIHtTdG9wcGVyQnV0dG9uTm9kZX1cclxuICAgKi9cclxuICBjcmVhdGVTdG9wcGVyQnV0dG9uKCBzcHJpbmcsIHRhbmRlbSApIHtcclxuICAgIHJldHVybiBuZXcgU3RvcHBlckJ1dHRvbk5vZGUoXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZWNvbmRTcHJpbmdTdG9wcGVyQnV0dG9uTm9kZScgKSwge1xyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBzcHJpbmcuc3RvcFNwcmluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9wOiB0aGlzLnNwYWNpbmdcclxuICAgICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHBhbmVsIHRoYXQgY29udHJvbHMgdGhlIGRlc2lnbmF0ZWQgc3ByaW5nJ3Mgc3ByaW5nIGNvbnN0YW50IHZhbHVlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzcHJpbmdJbmRleFxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFRleHQ+fSBsYWJlbHNcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1NwcmluZ0NvbnRyb2xQYW5lbH1cclxuICAgKi9cclxuICBjcmVhdGVTcHJpbmdDb25zdGFudFBhbmVsKCBzcHJpbmdJbmRleCwgbGFiZWxzLCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gQWRkaXRpb25hbCBvcHRpb25zIGZvciBjb21wYXRpYmlsaXR5IHdpdGggTWFzc2VzIGFuZCBTcHJpbmdzOiBCYXNpY3NcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBzdHJpbmc6IHRoaXMubW9kZWwuYmFzaWNzVmVyc2lvbiA/IHNwcmluZ1N0cmVuZ3RoU3RyaW5nIDogc3ByaW5nQ29uc3RhbnRQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICBzbGlkZXJUcmFja1NpemU6IHRoaXMubW9kZWwuYmFzaWNzVmVyc2lvbiA/IG5ldyBEaW1lbnNpb24yKCAxNDAsIDAuMSApIDogbmV3IERpbWVuc2lvbjIoIDEyMCwgMC4xICksXHJcbiAgICAgIHlNYXJnaW46IHRoaXMubW9kZWwuYmFzaWNzVmVyc2lvbiA/IDcgOiA1LFxyXG4gICAgICBzcGFjaW5nOiB0aGlzLm1vZGVsLmJhc2ljc1ZlcnNpb24gPyA1IDogMyxcclxuICAgICAgdGlja0xhYmVsU3BhY2luZzogdGhpcy5tb2RlbC5iYXNpY3NWZXJzaW9uID8gNyA6IDZcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNwcmluZ0NvbnRyb2xQYW5lbChcclxuICAgICAgdGhpcy5tb2RlbC5zcHJpbmdzWyBzcHJpbmdJbmRleCBdLnNwcmluZ0NvbnN0YW50UHJvcGVydHksXHJcbiAgICAgIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuU1BSSU5HX0NPTlNUQU5UX1JBTkdFLFxyXG4gICAgICBTdHJpbmdVdGlscy5maWxsSW4oIG9wdGlvbnMuc3RyaW5nLCB7IHNwcmluZzogc3ByaW5nSW5kZXggKyAxLCBtYXhXaWR0aDogNDAgfSApLFxyXG4gICAgICBsYWJlbHMsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmaXJzdFNwcmluZ0NvbnN0YW50Q29udHJvbFBhbmVsJyApLFxyXG4gICAgICB7XHJcbiAgICAgICAgdG9wOiB0aGlzLnNwYWNpbmcsXHJcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHN0cm9rZTogJ2dyYXknLFxyXG4gICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuc3BhY2luZyxcclxuICAgICAgICB5TWFyZ2luOiBvcHRpb25zLnlNYXJnaW4sXHJcbiAgICAgICAgc2xpZGVyVHJhY2tTaXplOiBvcHRpb25zLnNsaWRlclRyYWNrU2l6ZSxcclxuICAgICAgICB0aWNrTGFiZWxTcGFjaW5nOiBvcHRpb25zLnRpY2tMYWJlbFNwYWNpbmcsXHJcbiAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+ICtVdGlscy50b0ZpeGVkKCB2YWx1ZSwgMCApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcGFuZWwgdGhhdCBkaXNwbGF5cyB2aXNpYmxlIGluZGljYXRvcnMgZm9yIHJlZmVyZW5jZSBsaW5lcywgZGlzcGxhY2VtZW50IGFycm93LCBhbmQgcGVyaW9kIHRyYWNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TWFzc2VzQW5kU3ByaW5nc01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZGlzcGxheVBlcmlvZFRyYWNlXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEByZXR1cm5zIHtJbmRpY2F0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlSW5kaWNhdG9yVmlzaWJpbGl0eVBhbmVsKCBtb2RlbCwgZGlzcGxheVBlcmlvZFRyYWNlLCB0YW5kZW0gKSB7XHJcbiAgICByZXR1cm4gbmV3IEluZGljYXRvclZpc2liaWxpdHlDb250cm9sTm9kZShcclxuICAgICAgbW9kZWwsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmRpY2F0b3JWaXNpYmlsaXR5Q29udHJvbE5vZGUnICksIHtcclxuICAgICAgICBwZXJpb2RUcmFjZU9wdGlvbjogZGlzcGxheVBlcmlvZFRyYWNlXHJcbiAgICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBwYW5lbCB0aGF0IGRpc3BsYXlzIGFsbCBvZiB0aGUgcmlnaHQgaGFuZCBwYW5lbHMgb24gdGhlIHNjcmVlbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IG9wdGlvbnNDb250ZW50XHJcbiAgICogQHBhcmFtIHtBbGlnbkdyb3VwfSBhbGlnbkdyb3VwXHJcbiAgICogQHBhcmFtIHtUYW5kZW0gfSB0YW5kZW1cclxuICAgKiBAcmV0dXJucyB7UGFuZWx9XHJcbiAgICovXHJcbiAgY3JlYXRlT3B0aW9uc1BhbmVsKCBvcHRpb25zQ29udGVudCwgYWxpZ25Hcm91cCwgdGFuZGVtICkge1xyXG4gICAgY29uc3Qgb3B0aW9uc0NvbnRlbnRBbGlnbkJveCA9IG5ldyBBbGlnbkJveCggb3B0aW9uc0NvbnRlbnQsIHsgZ3JvdXA6IGFsaWduR3JvdXAgfSApO1xyXG4gICAgY29uc3Qgb3B0aW9uc1BhbmVsID0gbmV3IFBhbmVsKFxyXG4gICAgICBvcHRpb25zQ29udGVudEFsaWduQm94LCB7XHJcbiAgICAgICAgeE1hcmdpbjogMTAsXHJcbiAgICAgICAgZmlsbDogTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5QQU5FTF9GSUxMLFxyXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuUEFORUxfQ09STkVSX1JBRElVUyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvcHRpb25zUGFuZWwnICksXHJcbiAgICAgICAgbWluV2lkdGg6IE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuUEFORUxfTUlOX1dJRFRIICsgMzBcclxuICAgICAgfSApO1xyXG4gICAgb3B0aW9uc1BhbmVsLm1vdmVUb0JhY2soKTtcclxuICAgIHJldHVybiBvcHRpb25zUGFuZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGp1c3RpbmcgdmlldyBjb21wb25lbnRzIG9mIHBhbmVscyBhbmQgZHJhZ2dhYmxlIG9iamVjdHMgYmFzZWQgb24gdmlzaWJsZSBib3VuZHMgb2YgdGhlXHJcbiAgICogb25lIGFuZCB0d28gc3ByaW5nIHZpZXdzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb29sZWFufSBzaW5nbGVTcHJpbmdWaWV3XHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSB2aXNpYmxlQm91bmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkanVzdFZpZXdDb21wb25lbnRzKCBzaW5nbGVTcHJpbmdWaWV3LCB2aXNpYmxlQm91bmRzICkge1xyXG5cclxuICAgIC8vIEhhbmRsZSBhZGp1c3RtZW50cyBmb3Igc2luZ2xlIHNwcmluZyBzeXN0ZW1cclxuICAgIGlmICggc2luZ2xlU3ByaW5nVmlldyApIHtcclxuICAgICAgdGhpcy5wYW5lbFJpZ2h0U3BhY2luZyA9IHZpc2libGVCb3VuZHMucmlnaHQgLSB0aGlzLnNwYWNpbmc7XHJcblxyXG4gICAgICAvLyBBbGlnbm1lbnQgb2YgbGF5b3V0XHJcbiAgICAgIHRoaXMuc3ByaW5nU3lzdGVtQ29udHJvbHNOb2RlLmNlbnRlclggPSB0aGlzLnNwcmluZ0NlbnRlciAqIDAuODU1OyAvLyBjZW50ZXJpbmcgc3ByaW5nSGFuZ2VyTm9kZSBvdmVyIHNwcmluZ1xyXG4gICAgICB0aGlzLnNwcmluZ1N5c3RlbUNvbnRyb2xzTm9kZS50b3AgPSB0aGlzLnNwYWNpbmc7XHJcbiAgICAgIHRoaXMuc3ByaW5nQ29uc3RhbnRDb250cm9sUGFuZWwudG9wID0gdGhpcy5zcHJpbmdTeXN0ZW1Db250cm9sc05vZGUudG9wO1xyXG4gICAgICB0aGlzLnNwcmluZ0NvbnN0YW50Q29udHJvbFBhbmVsLmxlZnQgPSB0aGlzLnNwcmluZ1N5c3RlbUNvbnRyb2xzTm9kZS5yaWdodCArIHRoaXMuc3BhY2luZztcclxuICAgICAgdGhpcy5zcHJpbmdTeXN0ZW1Db250cm9sc05vZGUudG9wID0gdGhpcy5zcGFjaW5nO1xyXG4gICAgICB0aGlzLnNpbUNvbnRyb2xIQm94LnJpZ2h0Qm90dG9tID0gbmV3IFZlY3RvcjIoIHRoaXMucGFuZWxSaWdodFNwYWNpbmcsIHRoaXMuc2hlbGYuYm90dG9tICk7XHJcbiAgICAgIHRoaXMubW92YWJsZUxpbmVOb2RlLmNlbnRlclggPSB0aGlzLnNwcmluZ0NlbnRlcjtcclxuXHJcbiAgICAgIGlmICggIXRoaXMubW9kZWwuYmFzaWNzVmVyc2lvbiApIHtcclxuICAgICAgICB0aGlzLmVuZXJneUdyYXBoQWNjb3JkaW9uQm94LmxlZnRUb3AgPSBuZXcgVmVjdG9yMiggdmlzaWJsZUJvdW5kcy5sZWZ0ICsgdGhpcy5zcGFjaW5nLCB0aGlzLnNwcmluZ1N5c3RlbUNvbnRyb2xzTm9kZS50b3AgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBhZGp1c3RtZW50cyBmb3IgdHdvIHNwcmluZyBzeXN0ZW1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8ge251bWJlcn0gVXNlZCBpbiBkZXRlcm1pbmluZyBzcHJpbmdTeXN0ZW1Db250cm9sc05vZGUncyBwbGFjZW1lbnRcclxuICAgICAgY29uc3QgZGlzdGFuY2VCZXR3ZWVuU3ByaW5ncyA9ICggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKFxyXG4gICAgICAgIHRoaXMubW9kZWwuZmlyc3RTcHJpbmcucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggdGhpcy5tb2RlbC5zZWNvbmRTcHJpbmcucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkgLyAyICk7XHJcbiAgICAgIGNvbnN0IGxlZnRTcHJpbmdYUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHRoaXMubW9kZWwuZmlyc3RTcHJpbmcucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGJvdW5kcyBvZiB2aWV3IGVsZW1lbnRzXHJcbiAgICAgIHRoaXMucGFuZWxSaWdodFNwYWNpbmcgPSB2aXNpYmxlQm91bmRzLnJpZ2h0IC0gdGhpcy5zcGFjaW5nO1xyXG5cclxuICAgICAgLy8gQWxpZ25tZW50IG9mIGxheW91dFxyXG4gICAgICB0aGlzLnNwcmluZ1N5c3RlbUNvbnRyb2xzTm9kZS54ID0gbGVmdFNwcmluZ1hQb3NpdGlvbiArIGRpc3RhbmNlQmV0d2VlblNwcmluZ3MgLSB0aGlzLnNwcmluZ0hhbmdlck5vZGUuY2VudGVyWDtcclxuICAgICAgdGhpcy5zcHJpbmdTeXN0ZW1Db250cm9sc05vZGUudG9wID0gdGhpcy5zcGFjaW5nO1xyXG4gICAgICB0aGlzLnNpbUNvbnRyb2xIQm94LnJpZ2h0Qm90dG9tID0gbmV3IFZlY3RvcjIoIHRoaXMucGFuZWxSaWdodFNwYWNpbmcsIHRoaXMuc2hlbGYuYm90dG9tICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkanVzdGluZyBkcmFnIGJvdW5kcyBvZiBkcmFnZ2FibGUgb2JqZWN0cyBiYXNlZCBvbiB2aXNpYmxlIGJvdW5kcy5cclxuICAgIHRoaXMucnVsZXJOb2RlLnJ1bGVyTm9kZURyYWdMaXN0ZW5lci5kcmFnQm91bmRzUHJvcGVydHkgPSB2aXNpYmxlQm91bmRzLndpdGhPZmZzZXRzKFxyXG4gICAgICAtdGhpcy5ydWxlck5vZGUud2lkdGggLyAyLCB0aGlzLnJ1bGVyTm9kZS5oZWlnaHQgLyAyLCB0aGlzLnJ1bGVyTm9kZS53aWR0aCAvIDIsIC10aGlzLnJ1bGVyTm9kZS5oZWlnaHQgLyAyXHJcbiAgICApO1xyXG4gICAgdGhpcy5tYXNzTm9kZXMuZm9yRWFjaCggZnVuY3Rpb24oIG1hc3NOb2RlICkge1xyXG4gICAgICBpZiAoIG1hc3NOb2RlLmNlbnRlclggPiB2aXNpYmxlQm91bmRzLm1heFggKSB7XHJcbiAgICAgICAgbWFzc05vZGUubWFzcy5wb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFgoIHZpc2libGVCb3VuZHMubWF4WCApLFxyXG4gICAgICAgICAgICBtYXNzTm9kZS5tYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueVxyXG4gICAgICAgICAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBtYXNzTm9kZS5jZW50ZXJYIDwgdmlzaWJsZUJvdW5kcy5taW5YICkge1xyXG4gICAgICAgIG1hc3NOb2RlLm1hc3MucG9zaXRpb25Qcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxYKCB2aXNpYmxlQm91bmRzLm1pblggKSxcclxuICAgICAgICAgICAgbWFzc05vZGUubWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnlcclxuICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5tYXNzZXNBbmRTcHJpbmdzLnJlZ2lzdGVyKCAnU3ByaW5nU2NyZWVuVmlldycsIFNwcmluZ1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgU3ByaW5nU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxtQkFBbUIsTUFBTSx1REFBdUQ7QUFDdkYsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxrQkFBa0IsRUFBRUMsS0FBSyxRQUFRLG1DQUFtQztBQUMvRyxPQUFPQyw2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