// Copyright 2019-2022, University of Colorado Boulder

/**
 * Factory for creating the various icons that appear in the sim.
 *
 * ## Creates the following icons (annotated in the file):
 *  1. Screen icons
 *  2. Vector Creator Panel icons
 *  3. Checkbox icons (i.e. sum icon, angle icon, grid icon)
 *  4. Component Style Icons
 *  5. Coordinate Snap Mode Icons (polar and Cartesian)
 *  6. Graph Orientation icons (horizontal and vertical - on the 'Explore 1D' screen)
 *  7. Equation Type icons (On the 'Equations' Screen)
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import interleave from '../../../../phet-core/js/interleave.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { Color, HBox, Line, Node, Path, Spacer, Text, VBox } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import EquationTypes from '../../equations/model/EquationTypes.js';
import vectorAddition from '../../vectorAddition.js';
import ComponentVectorStyles from '../model/ComponentVectorStyles.js';
import GraphOrientations from '../model/GraphOrientations.js';
import VectorColorPalette from '../model/VectorColorPalette.js';
import VectorAdditionColors from '../VectorAdditionColors.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import ArrowOverSymbolNode from './ArrowOverSymbolNode.js';
import CurvedArrowNode from './CurvedArrowNode.js';
import DashedArrowNode from './DashedArrowNode.js';

// constants
const SCREEN_ICON_WIDTH = 70;
const SCREEN_ICON_HEIGHT = SCREEN_ICON_WIDTH / Screen.HOME_SCREEN_ICON_ASPECT_RATIO; // w/h = ratio <=> h = w/ratio
const RADIO_BUTTON_ICON_SIZE = 45;
const VectorAdditionIconFactory = {
  //========================================================================================
  // Screen icons, see https://github.com/phetsims/vector-addition/issues/76
  //========================================================================================

  /**
   * Creates the icon for the 'Explore 1D' Screen.
   * @public
   * @returns {ScreenIcon}
   */
  createExplore1DScreenIcon() {
    const colorPalette = VectorAdditionColors.BLUE_COLOR_PALETTE;
    const vectorOptions = merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: colorPalette.mainFill,
      stroke: colorPalette.mainStroke
    });

    // Vector pointing to the right, the full width of the icon
    const rightVectorNode = new ArrowNode(0, 0, SCREEN_ICON_WIDTH, 0, vectorOptions);

    // Vector pointing to the left, partial width of the icon
    const leftVectorNode = new ArrowNode(0.5 * SCREEN_ICON_WIDTH, 0, 0, 0, vectorOptions);
    const vBox = new VBox({
      align: 'right',
      spacing: SCREEN_ICON_HEIGHT * 0.20,
      children: [rightVectorNode, leftVectorNode]
    });
    return createScreenIcon([vBox]);
  },
  /**
   * Creates the icon for the 'Explore 2D' Screen.
   * @public
   * @returns {ScreenIcon}
   */
  createExplore2DScreenIcon() {
    const vector = new Vector2(SCREEN_ICON_WIDTH, -SCREEN_ICON_HEIGHT * 0.8);
    const colorPalette = VectorAdditionColors.PINK_COLOR_PALETTE;

    // vector
    const vectorNode = new ArrowNode(0, 0, vector.x, vector.y, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: colorPalette.mainFill,
      stroke: colorPalette.mainStroke
    }));

    // component vectors
    const componentArrowOptions = merge({}, VectorAdditionConstants.COMPONENT_VECTOR_ARROW_OPTIONS, {
      fill: colorPalette.componentFill
    });
    const xComponentNode = new DashedArrowNode(0, 0, vector.x, 0, componentArrowOptions);
    const yComponentNode = new DashedArrowNode(vector.x, 0, vector.x, vector.y, componentArrowOptions);
    return createScreenIcon([xComponentNode, yComponentNode, vectorNode]);
  },
  /**
   * Creates the icon for the 'Lab' Screen.
   * @public
   * @returns {ScreenIcon}
   */
  createLabScreenIcon() {
    // {Vector2[]} the tip positions of the group 1 (blue) arrows (aligned tip to tail)
    const group1TipPositions = [new Vector2(SCREEN_ICON_WIDTH * 0.63, 0), new Vector2(SCREEN_ICON_WIDTH, -SCREEN_ICON_HEIGHT)];

    // {Vector2[]} the tip positions of the group 2 (orange) arrows (aligned tip to tail)
    const group2TipPositions = [new Vector2(0, -SCREEN_ICON_HEIGHT * 0.7), new Vector2(SCREEN_ICON_WIDTH, -SCREEN_ICON_HEIGHT)];

    // starting tail position of 1st vector
    const startingTailPosition = new Vector2(SCREEN_ICON_WIDTH / 4, 0);
    const group1ArrowNodes = createTipToTailArrowNodes(group1TipPositions, startingTailPosition, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: VectorAdditionColors.BLUE_COLOR_PALETTE.mainFill,
      stroke: VectorAdditionColors.BLUE_COLOR_PALETTE.mainStroke
    }));
    const group2ArrowNodes = createTipToTailArrowNodes(group2TipPositions, startingTailPosition, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: VectorAdditionColors.ORANGE_COLOR_PALETTE.mainFill,
      stroke: VectorAdditionColors.ORANGE_COLOR_PALETTE.mainStroke
    }));
    return createScreenIcon(group2ArrowNodes.concat(group1ArrowNodes));
  },
  /**
   * Creates the icon for the 'Equations' Screen.
   * @public
   * @returns {ScreenIcon}
   */
  createEquationsScreenIcon() {
    // {Vector2[]} the tip positions of the vectors on the icon (vectors are aligned tip to tail)
    const tipPositions = [new Vector2(SCREEN_ICON_WIDTH * 0.15, -SCREEN_ICON_HEIGHT * 0.75), new Vector2(SCREEN_ICON_WIDTH * 0.85, -SCREEN_ICON_HEIGHT)];
    const startTail = Vector2.ZERO;
    const lastTip = _.last(tipPositions);
    const colorPalette = VectorAdditionColors.EQUATIONS_BLUE_COLOR_PALETTE;

    // vectors, tip to tail
    const arrowNodes = createTipToTailArrowNodes(tipPositions, startTail, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: colorPalette.mainFill,
      stroke: colorPalette.mainStroke
    }));

    // sum
    arrowNodes.push(new ArrowNode(startTail.x, startTail.y, lastTip.x, lastTip.y, merge({}, VectorAdditionConstants.SUM_VECTOR_ARROW_OPTIONS, {
      fill: colorPalette.sumFill,
      stroke: colorPalette.sumStroke
    })));
    return createScreenIcon(arrowNodes);
  },
  //========================================================================================
  // VectorCreatorPanel icons
  //========================================================================================

  /**
   * @public
   * @param {Vector2} initialVectorComponents - vector components (in view coordinates)
   * @param {VectorColorPalette} vectorColorPalette - color palette for this icon's vector
   * @param {number} arrowLength
   * @returns {Node}
   */
  createVectorCreatorPanelIcon(initialVectorComponents, vectorColorPalette, arrowLength) {
    assert && assert(initialVectorComponents instanceof Vector2, `invalid initialVectorComponents: ${initialVectorComponents}`);
    assert && assert(vectorColorPalette instanceof VectorColorPalette, `invalid vectorColorPalette: ${vectorColorPalette}`);
    assert && assert(typeof arrowLength === 'number' && arrowLength > 0, `invalid arrowLength: ${arrowLength}`);
    const arrowComponents = initialVectorComponents.normalized().timesScalar(arrowLength);
    return new ArrowNode(0, 0, arrowComponents.x, arrowComponents.y, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      arrowLength: arrowLength,
      cursor: 'move',
      fill: vectorColorPalette.mainFill,
      stroke: vectorColorPalette.mainStroke
    }));
  },
  //========================================================================================
  // Checkbox icons (i.e. sum icon, angle icon)
  //========================================================================================

  /**
   * Creates a vector icon that points to the right, used with various checkboxes.
   * @public
   * @param {Object} [options]
   * @returns {Node}
   */
  createVectorIcon(options) {
    options = merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: Color.BLACK,
      stroke: null,
      lineWidth: 1,
      length: 50
    }, options);
    return new ArrowNode(0, 0, options.length, 0, options);
  },
  /**
   * Creates the icon that appears next to the checkbox that toggles the 'Angle' visibility
   * @public
   * @returns {Node}
   */
  createAngleIcon() {
    // values determined empirically
    const wedgeLength = 20;
    const angle = Utils.toRadians(50);
    const curvedArrowRadius = 16;
    const wedgeShape = new Shape().moveTo(wedgeLength, 0).horizontalLineTo(0).lineTo(Math.cos(angle) * wedgeLength, -Math.sin(angle) * wedgeLength);
    const wedgeNode = new Path(wedgeShape, {
      stroke: Color.BLACK
    });
    const curvedArrowNode = new CurvedArrowNode(curvedArrowRadius, angle);
    const thetaNode = new Text(MathSymbols.THETA, {
      font: VectorAdditionConstants.EQUATION_SYMBOL_FONT,
      scale: 0.75,
      left: curvedArrowNode.right + 4,
      centerY: wedgeNode.centerY
    });
    return new Node({
      children: [wedgeNode, curvedArrowNode, thetaNode]
    });
  },
  //========================================================================================
  // ComponentVectorStyles icons, used on Component radio buttons
  //========================================================================================

  /**
   * Creates the icons that go on the Component Style Radio Button based on a component style
   * @public
   * @param {ComponentVectorStyles} componentStyle
   * @returns {Node}
   */
  createComponentStyleRadioButtonIcon(componentStyle) {
    assert && assert(ComponentVectorStyles.enumeration.includes(componentStyle), `invalid componentStyle: ${componentStyle}`);
    const iconSize = RADIO_BUTTON_ICON_SIZE; // size of the icon (square)

    if (componentStyle === ComponentVectorStyles.INVISIBLE) {
      return createEyeCloseIcon(iconSize);
    }
    const subBoxSize = RADIO_BUTTON_ICON_SIZE / 3; // size of the sub-box the leader lines create
    assert && assert(subBoxSize < iconSize, `subBoxSize ${subBoxSize} must be < iconSize ${iconSize}`);

    // Options for main and component arrows
    const mainOptions = merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: VectorAdditionColors.BLUE_COLOR_PALETTE.mainFill,
      stroke: VectorAdditionColors.BLUE_COLOR_PALETTE.mainStroke
    });
    const componentOptions = merge({}, VectorAdditionConstants.COMPONENT_VECTOR_ARROW_OPTIONS, {
      fill: VectorAdditionColors.BLUE_COLOR_PALETTE.componentFill
    });

    // Initialize arrows for the PARALLELOGRAM component style (will be adjusted for different component styles)
    const vectorArrow = new ArrowNode(0, 0, iconSize, -iconSize, mainOptions);
    const xComponentArrow = new DashedArrowNode(0, 0, iconSize, 0, componentOptions);
    const yComponentArrow = new DashedArrowNode(0, 0, 0, -iconSize, componentOptions);
    let iconChildren = [xComponentArrow, yComponentArrow, vectorArrow]; // children of the icon children

    if (componentStyle === ComponentVectorStyles.TRIANGLE) {
      yComponentArrow.setTailAndTip(iconSize, 0, iconSize, -iconSize);
    } else if (componentStyle === ComponentVectorStyles.PROJECTION) {
      vectorArrow.setTailAndTip(subBoxSize, -subBoxSize, iconSize, -iconSize);
      xComponentArrow.setTailAndTip(subBoxSize, 0, iconSize, 0);
      yComponentArrow.setTailAndTip(0, -subBoxSize, 0, -iconSize);

      // Create the leader lines
      const leaderLinesShape = new Shape().moveTo(0, -subBoxSize).horizontalLineTo(subBoxSize).verticalLineToRelative(subBoxSize).moveTo(0, -iconSize).horizontalLineTo(iconSize).verticalLineToRelative(iconSize);
      const leaderLinesPath = new Path(leaderLinesShape, {
        lineDash: [2.9, 2],
        stroke: 'black'
      });
      iconChildren = [leaderLinesPath, xComponentArrow, yComponentArrow, vectorArrow];
    }
    return new Node({
      children: iconChildren,
      maxWidth: iconSize,
      maxHeight: iconSize
    });
  },
  //=========================================================================================================
  // CoordinateSnapModes icons, used on scene radio buttons,
  // see https://github.com/phetsims/vector-addition/issues/21)
  //=========================================================================================================

  /**
   * Creates the icon for the Cartesian snap mode radio button.
   * @param {VectorColorPalette} vectorColorPalette
   * @returns {Node}
   */
  createCartesianSnapModeIcon(vectorColorPalette) {
    const iconSize = RADIO_BUTTON_ICON_SIZE;

    // Arrow that is 45 degrees to the right and up
    const vectorNode = new ArrowNode(0, 0, iconSize, -iconSize, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: vectorColorPalette.mainFill,
      stroke: vectorColorPalette.mainStroke
    }));

    // x and y, Cartesian coordinates
    const xyArrowOptions = {
      fill: 'black',
      tailWidth: 1,
      headWidth: 6,
      headHeight: 6
    };
    const xNode = new ArrowNode(0, 0, iconSize, 0, xyArrowOptions);
    const yNode = new ArrowNode(iconSize, 0, iconSize, -iconSize, xyArrowOptions);
    return new Node({
      children: [vectorNode, xNode, yNode],
      maxWidth: iconSize,
      maxHeight: iconSize
    });
  },
  /**
   * Creates the icon for the Polar snap mode radio button.
   * @param {VectorColorPalette} vectorColorPalette
   * @returns {Node}
   */
  createPolarSnapModeIcon(vectorColorPalette) {
    const iconSize = RADIO_BUTTON_ICON_SIZE;
    const arcRadius = 30; // arc radius of the curved arrow

    // Arrow that is 45 degrees to the right and up
    const arrow = new ArrowNode(0, 0, iconSize, -iconSize, merge({}, VectorAdditionConstants.VECTOR_ARROW_OPTIONS, {
      fill: vectorColorPalette.mainFill,
      stroke: vectorColorPalette.mainStroke
    }));

    // Curved arrow that indicates the angle
    const curvedArrow = new CurvedArrowNode(arcRadius, Utils.toRadians(45));

    // horizontal line
    const line = new Line(0, 0, iconSize, 0, {
      stroke: Color.BLACK
    });
    return new Node({
      children: [arrow, curvedArrow, line],
      maxWidth: iconSize,
      maxHeight: iconSize
    });
  },
  //================================================================================================
  // GraphOrientations icons (horizontal/vertical), used on scene radio buttons in Explore 1D screen
  //================================================================================================

  /**
   * Creates the icon used on the radio buttons on 'Explore 1D' screen that toggles the graph orientation.
   * @public
   * @param {GraphOrientations} graphOrientation - orientation of the graph (has to be horizontal or vertical)
   * @returns {Node}
   */
  createGraphOrientationIcon(graphOrientation) {
    assert && assert(_.includes([GraphOrientations.HORIZONTAL, GraphOrientations.VERTICAL], graphOrientation), `invalid graphOrientation: ${graphOrientation}`);
    const iconSize = RADIO_BUTTON_ICON_SIZE;
    const tipX = graphOrientation === GraphOrientations.HORIZONTAL ? iconSize : 0;
    const tipY = graphOrientation === GraphOrientations.HORIZONTAL ? 0 : iconSize;
    return new ArrowNode(0, 0, tipX, tipY, merge({}, VectorAdditionConstants.AXES_ARROW_OPTIONS, {
      maxWidth: iconSize,
      maxHeight: iconSize
    }));
  },
  //========================================================================================
  // EquationTypes icons, used on radio buttons in Equations screen
  //========================================================================================

  /**
   * Creates the Icon that appears on the EquationTypes radio button icons on the 'Equations' screen.
   * @public
   * @param {EquationTypes} equationType
   * @param {string[]} vectorSymbols - symbols on the buttons (the last symbol is the sum's symbol)
   * @returns {Node}
   */
  createEquationTypeIcon(equationType, vectorSymbols) {
    assert && assert(EquationTypes.enumeration.includes(equationType), `invalid equationType: ${equationType}`);
    assert && assert(_.every(vectorSymbols, symbol => typeof symbol === 'string') && vectorSymbols.length > 1, `invalid vectorSymbols: ${vectorSymbols}`);
    let children = [];
    const textOptions = {
      font: VectorAdditionConstants.EQUATION_FONT
    };

    // Gather all the symbols for the left side of the equation into an array.
    // For NEGATION, all symbols are on the left side of the equation
    const equationLeftSideSymbols = _.dropRight(vectorSymbols, equationType === EquationTypes.NEGATION ? 0 : 1);

    // Create a vector symbol for each symbol on the left side of the equation.
    equationLeftSideSymbols.forEach(symbol => {
      children.push(new ArrowOverSymbolNode(symbol));
    });

    // Interleave operators (i.e. '+'|'-') in between each symbol on the left side of the equation
    children = interleave(children, () => {
      const operator = equationType === EquationTypes.SUBTRACTION ? MathSymbols.MINUS : MathSymbols.PLUS;
      return new Text(operator, textOptions);
    });

    // '='
    children.push(new Text(MathSymbols.EQUAL_TO, textOptions));

    // Right side of the equation, which is either '0' or the last of the symbols (which is the sum).
    children.push(equationType === EquationTypes.NEGATION ? new Text('0', textOptions) : new ArrowOverSymbolNode(_.last(vectorSymbols)));
    return new HBox({
      children: children,
      spacing: 8,
      align: 'origin' // so that text baselines are aligned
    });
  }
};

//========================================================================================
// Helper functions
//========================================================================================

/**
 * Creates Vector Icons (ArrowNode) tip to tail based on an array of tip positions along with the tail position of the
 * first Vector. ArrowNodes are created and pushed to a given array.
 *
 * @param {Vector2[]} tipPositions - tip positions of all vectors (vectors are aligned tip to tail)
 * @param {Vector2} startingTailPosition - tail position of the first vector
 * @param {Object} [arrowOptions] - passed to arrow nodes
 * @returns {ArrowNode[]}
 */
function createTipToTailArrowNodes(tipPositions, startingTailPosition, arrowOptions) {
  assert && assert(_.every(tipPositions, tip => tip instanceof Vector2), `invalid tipPositions: ${tipPositions}`);
  assert && assert(startingTailPosition instanceof Vector2, `invalid startingTailPosition: ${startingTailPosition}`);
  const arrowNodes = [];
  for (let i = 0; i < tipPositions.length; i++) {
    const tailPosition = i === 0 ? startingTailPosition : tipPositions[i - 1];
    const tipPosition = tipPositions[i];
    arrowNodes.push(new ArrowNode(tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y, arrowOptions));
  }
  return arrowNodes;
}

/**
 * See https://github.com/phetsims/vector-addition/issues/76#issuecomment-515197547 for context.
 * Helper function that creates a ScreenIcon but adds a Spacer to fill extra space. This ensures all screen icons are
 * the same width and height which ensures that they are all scaled the same. Thus, this keeps all Arrow Nodes inside
 * of screen icons the same 'dimensions' (i.e. tailWidth, headWidth, headHeight, etc. ).
 *
 * @param {Node[]} children - the children of the icon
 * @returns {ScreenIcon}
 */
function createScreenIcon(children) {
  assert && assert(_.every(children, child => child instanceof Node), `invalid children: ${children}`);

  // Create the icon, adding a Spacer to fill extra space if needed (Equivalent to setting a minimum width/height)
  const iconNode = new Node().addChild(new Spacer(SCREEN_ICON_WIDTH, SCREEN_ICON_HEIGHT, {
    pickable: false
  }));
  iconNode.addChild(new Node({
    // Wrap the icon content in a Node
    children: children,
    center: iconNode.center,
    maxWidth: SCREEN_ICON_WIDTH,
    // Ensures the icon doesn't get wider than the fixed screen icon dimensions
    maxHeight: SCREEN_ICON_HEIGHT // Ensures the icon doesn't get taller than the fixed screen icon dimensions
  }));

  return new ScreenIcon(iconNode);
}

/**
 * Create the close eye icon, for ComponentVectorStyles.INVISIBLE.
 * @param {number} iconSize
 * @returns {Node}
 */
function createEyeCloseIcon(iconSize) {
  const spacer = new Spacer(iconSize, iconSize);
  const eyeIcon = new Path(eyeSlashSolidShape, {
    scale: 0.068,
    // determined empirically
    fill: 'black',
    center: spacer.center
  });
  return new Node({
    children: [spacer, eyeIcon],
    maxWidth: iconSize,
    maxHeight: iconSize
  });
}
vectorAddition.register('VectorAdditionIconFactory', VectorAdditionIconFactory);
export default VectorAdditionIconFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJTY3JlZW4iLCJTY3JlZW5JY29uIiwiU2hhcGUiLCJpbnRlcmxlYXZlIiwibWVyZ2UiLCJBcnJvd05vZGUiLCJNYXRoU3ltYm9scyIsIkNvbG9yIiwiSEJveCIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlNwYWNlciIsIlRleHQiLCJWQm94IiwiZXllU2xhc2hTb2xpZFNoYXBlIiwiRXF1YXRpb25UeXBlcyIsInZlY3RvckFkZGl0aW9uIiwiQ29tcG9uZW50VmVjdG9yU3R5bGVzIiwiR3JhcGhPcmllbnRhdGlvbnMiLCJWZWN0b3JDb2xvclBhbGV0dGUiLCJWZWN0b3JBZGRpdGlvbkNvbG9ycyIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiQXJyb3dPdmVyU3ltYm9sTm9kZSIsIkN1cnZlZEFycm93Tm9kZSIsIkRhc2hlZEFycm93Tm9kZSIsIlNDUkVFTl9JQ09OX1dJRFRIIiwiU0NSRUVOX0lDT05fSEVJR0hUIiwiSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8iLCJSQURJT19CVVRUT05fSUNPTl9TSVpFIiwiVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeSIsImNyZWF0ZUV4cGxvcmUxRFNjcmVlbkljb24iLCJjb2xvclBhbGV0dGUiLCJCTFVFX0NPTE9SX1BBTEVUVEUiLCJ2ZWN0b3JPcHRpb25zIiwiVkVDVE9SX0FSUk9XX09QVElPTlMiLCJmaWxsIiwibWFpbkZpbGwiLCJzdHJva2UiLCJtYWluU3Ryb2tlIiwicmlnaHRWZWN0b3JOb2RlIiwibGVmdFZlY3Rvck5vZGUiLCJ2Qm94IiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjcmVhdGVTY3JlZW5JY29uIiwiY3JlYXRlRXhwbG9yZTJEU2NyZWVuSWNvbiIsInZlY3RvciIsIlBJTktfQ09MT1JfUEFMRVRURSIsInZlY3Rvck5vZGUiLCJ4IiwieSIsImNvbXBvbmVudEFycm93T3B0aW9ucyIsIkNPTVBPTkVOVF9WRUNUT1JfQVJST1dfT1BUSU9OUyIsImNvbXBvbmVudEZpbGwiLCJ4Q29tcG9uZW50Tm9kZSIsInlDb21wb25lbnROb2RlIiwiY3JlYXRlTGFiU2NyZWVuSWNvbiIsImdyb3VwMVRpcFBvc2l0aW9ucyIsImdyb3VwMlRpcFBvc2l0aW9ucyIsInN0YXJ0aW5nVGFpbFBvc2l0aW9uIiwiZ3JvdXAxQXJyb3dOb2RlcyIsImNyZWF0ZVRpcFRvVGFpbEFycm93Tm9kZXMiLCJncm91cDJBcnJvd05vZGVzIiwiT1JBTkdFX0NPTE9SX1BBTEVUVEUiLCJjb25jYXQiLCJjcmVhdGVFcXVhdGlvbnNTY3JlZW5JY29uIiwidGlwUG9zaXRpb25zIiwic3RhcnRUYWlsIiwiWkVSTyIsImxhc3RUaXAiLCJfIiwibGFzdCIsIkVRVUFUSU9OU19CTFVFX0NPTE9SX1BBTEVUVEUiLCJhcnJvd05vZGVzIiwicHVzaCIsIlNVTV9WRUNUT1JfQVJST1dfT1BUSU9OUyIsInN1bUZpbGwiLCJzdW1TdHJva2UiLCJjcmVhdGVWZWN0b3JDcmVhdG9yUGFuZWxJY29uIiwiaW5pdGlhbFZlY3RvckNvbXBvbmVudHMiLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJhcnJvd0xlbmd0aCIsImFzc2VydCIsImFycm93Q29tcG9uZW50cyIsIm5vcm1hbGl6ZWQiLCJ0aW1lc1NjYWxhciIsImN1cnNvciIsImNyZWF0ZVZlY3Rvckljb24iLCJvcHRpb25zIiwiQkxBQ0siLCJsaW5lV2lkdGgiLCJsZW5ndGgiLCJjcmVhdGVBbmdsZUljb24iLCJ3ZWRnZUxlbmd0aCIsImFuZ2xlIiwidG9SYWRpYW5zIiwiY3VydmVkQXJyb3dSYWRpdXMiLCJ3ZWRnZVNoYXBlIiwibW92ZVRvIiwiaG9yaXpvbnRhbExpbmVUbyIsImxpbmVUbyIsIk1hdGgiLCJjb3MiLCJzaW4iLCJ3ZWRnZU5vZGUiLCJjdXJ2ZWRBcnJvd05vZGUiLCJ0aGV0YU5vZGUiLCJUSEVUQSIsImZvbnQiLCJFUVVBVElPTl9TWU1CT0xfRk9OVCIsInNjYWxlIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWSIsImNyZWF0ZUNvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25JY29uIiwiY29tcG9uZW50U3R5bGUiLCJlbnVtZXJhdGlvbiIsImluY2x1ZGVzIiwiaWNvblNpemUiLCJJTlZJU0lCTEUiLCJjcmVhdGVFeWVDbG9zZUljb24iLCJzdWJCb3hTaXplIiwibWFpbk9wdGlvbnMiLCJjb21wb25lbnRPcHRpb25zIiwidmVjdG9yQXJyb3ciLCJ4Q29tcG9uZW50QXJyb3ciLCJ5Q29tcG9uZW50QXJyb3ciLCJpY29uQ2hpbGRyZW4iLCJUUklBTkdMRSIsInNldFRhaWxBbmRUaXAiLCJQUk9KRUNUSU9OIiwibGVhZGVyTGluZXNTaGFwZSIsInZlcnRpY2FsTGluZVRvUmVsYXRpdmUiLCJsZWFkZXJMaW5lc1BhdGgiLCJsaW5lRGFzaCIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiY3JlYXRlQ2FydGVzaWFuU25hcE1vZGVJY29uIiwieHlBcnJvd09wdGlvbnMiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwieE5vZGUiLCJ5Tm9kZSIsImNyZWF0ZVBvbGFyU25hcE1vZGVJY29uIiwiYXJjUmFkaXVzIiwiYXJyb3ciLCJjdXJ2ZWRBcnJvdyIsImxpbmUiLCJjcmVhdGVHcmFwaE9yaWVudGF0aW9uSWNvbiIsImdyYXBoT3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwiVkVSVElDQUwiLCJ0aXBYIiwidGlwWSIsIkFYRVNfQVJST1dfT1BUSU9OUyIsImNyZWF0ZUVxdWF0aW9uVHlwZUljb24iLCJlcXVhdGlvblR5cGUiLCJ2ZWN0b3JTeW1ib2xzIiwiZXZlcnkiLCJzeW1ib2wiLCJ0ZXh0T3B0aW9ucyIsIkVRVUFUSU9OX0ZPTlQiLCJlcXVhdGlvbkxlZnRTaWRlU3ltYm9scyIsImRyb3BSaWdodCIsIk5FR0FUSU9OIiwiZm9yRWFjaCIsIm9wZXJhdG9yIiwiU1VCVFJBQ1RJT04iLCJNSU5VUyIsIlBMVVMiLCJFUVVBTF9UTyIsImFycm93T3B0aW9ucyIsInRpcCIsImkiLCJ0YWlsUG9zaXRpb24iLCJ0aXBQb3NpdGlvbiIsImNoaWxkIiwiaWNvbk5vZGUiLCJhZGRDaGlsZCIsInBpY2thYmxlIiwiY2VudGVyIiwic3BhY2VyIiwiZXllSWNvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGYWN0b3J5IGZvciBjcmVhdGluZyB0aGUgdmFyaW91cyBpY29ucyB0aGF0IGFwcGVhciBpbiB0aGUgc2ltLlxyXG4gKlxyXG4gKiAjIyBDcmVhdGVzIHRoZSBmb2xsb3dpbmcgaWNvbnMgKGFubm90YXRlZCBpbiB0aGUgZmlsZSk6XHJcbiAqICAxLiBTY3JlZW4gaWNvbnNcclxuICogIDIuIFZlY3RvciBDcmVhdG9yIFBhbmVsIGljb25zXHJcbiAqICAzLiBDaGVja2JveCBpY29ucyAoaS5lLiBzdW0gaWNvbiwgYW5nbGUgaWNvbiwgZ3JpZCBpY29uKVxyXG4gKiAgNC4gQ29tcG9uZW50IFN0eWxlIEljb25zXHJcbiAqICA1LiBDb29yZGluYXRlIFNuYXAgTW9kZSBJY29ucyAocG9sYXIgYW5kIENhcnRlc2lhbilcclxuICogIDYuIEdyYXBoIE9yaWVudGF0aW9uIGljb25zIChob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCAtIG9uIHRoZSAnRXhwbG9yZSAxRCcgc2NyZWVuKVxyXG4gKiAgNy4gRXF1YXRpb24gVHlwZSBpY29ucyAoT24gdGhlICdFcXVhdGlvbnMnIFNjcmVlbilcclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgaW50ZXJsZWF2ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW50ZXJsZWF2ZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEhCb3gsIExpbmUsIE5vZGUsIFBhdGgsIFNwYWNlciwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleWVTbGFzaFNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvZXllU2xhc2hTb2xpZFNoYXBlLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uVHlwZXMgZnJvbSAnLi4vLi4vZXF1YXRpb25zL21vZGVsL0VxdWF0aW9uVHlwZXMuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgQ29tcG9uZW50VmVjdG9yU3R5bGVzIGZyb20gJy4uL21vZGVsL0NvbXBvbmVudFZlY3RvclN0eWxlcy5qcyc7XHJcbmltcG9ydCBHcmFwaE9yaWVudGF0aW9ucyBmcm9tICcuLi9tb2RlbC9HcmFwaE9yaWVudGF0aW9ucy5qcyc7XHJcbmltcG9ydCBWZWN0b3JDb2xvclBhbGV0dGUgZnJvbSAnLi4vbW9kZWwvVmVjdG9yQ29sb3JQYWxldHRlLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29sb3JzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFycm93T3ZlclN5bWJvbE5vZGUgZnJvbSAnLi9BcnJvd092ZXJTeW1ib2xOb2RlLmpzJztcclxuaW1wb3J0IEN1cnZlZEFycm93Tm9kZSBmcm9tICcuL0N1cnZlZEFycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBEYXNoZWRBcnJvd05vZGUgZnJvbSAnLi9EYXNoZWRBcnJvd05vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNDUkVFTl9JQ09OX1dJRFRIID0gNzA7XHJcbmNvbnN0IFNDUkVFTl9JQ09OX0hFSUdIVCA9IFNDUkVFTl9JQ09OX1dJRFRIIC8gU2NyZWVuLkhPTUVfU0NSRUVOX0lDT05fQVNQRUNUX1JBVElPOyAvLyB3L2ggPSByYXRpbyA8PT4gaCA9IHcvcmF0aW9cclxuY29uc3QgUkFESU9fQlVUVE9OX0lDT05fU0laRSA9IDQ1O1xyXG5cclxuY29uc3QgVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeSA9IHtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gU2NyZWVuIGljb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvNzZcclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlICdFeHBsb3JlIDFEJyBTY3JlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtTY3JlZW5JY29ufVxyXG4gICAqL1xyXG4gIGNyZWF0ZUV4cGxvcmUxRFNjcmVlbkljb24oKSB7XHJcblxyXG4gICAgY29uc3QgY29sb3JQYWxldHRlID0gVmVjdG9yQWRkaXRpb25Db2xvcnMuQkxVRV9DT0xPUl9QQUxFVFRFO1xyXG5cclxuICAgIGNvbnN0IHZlY3Rvck9wdGlvbnMgPSBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgIGZpbGw6IGNvbG9yUGFsZXR0ZS5tYWluRmlsbCxcclxuICAgICAgc3Ryb2tlOiBjb2xvclBhbGV0dGUubWFpblN0cm9rZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZlY3RvciBwb2ludGluZyB0byB0aGUgcmlnaHQsIHRoZSBmdWxsIHdpZHRoIG9mIHRoZSBpY29uXHJcbiAgICBjb25zdCByaWdodFZlY3Rvck5vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCBTQ1JFRU5fSUNPTl9XSURUSCwgMCwgdmVjdG9yT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFZlY3RvciBwb2ludGluZyB0byB0aGUgbGVmdCwgcGFydGlhbCB3aWR0aCBvZiB0aGUgaWNvblxyXG4gICAgY29uc3QgbGVmdFZlY3Rvck5vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLjUgKiBTQ1JFRU5fSUNPTl9XSURUSCwgMCwgMCwgMCwgdmVjdG9yT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgc3BhY2luZzogU0NSRUVOX0lDT05fSEVJR0hUICogMC4yMCxcclxuICAgICAgY2hpbGRyZW46IFsgcmlnaHRWZWN0b3JOb2RlLCBsZWZ0VmVjdG9yTm9kZSBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZVNjcmVlbkljb24oIFsgdkJveCBdICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlICdFeHBsb3JlIDJEJyBTY3JlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtTY3JlZW5JY29ufVxyXG4gICAqL1xyXG4gIGNyZWF0ZUV4cGxvcmUyRFNjcmVlbkljb24oKSB7XHJcblxyXG4gICAgY29uc3QgdmVjdG9yID0gbmV3IFZlY3RvcjIoIFNDUkVFTl9JQ09OX1dJRFRILCAtU0NSRUVOX0lDT05fSEVJR0hUICogMC44ICk7XHJcbiAgICBjb25zdCBjb2xvclBhbGV0dGUgPSBWZWN0b3JBZGRpdGlvbkNvbG9ycy5QSU5LX0NPTE9SX1BBTEVUVEU7XHJcblxyXG4gICAgLy8gdmVjdG9yXHJcbiAgICBjb25zdCB2ZWN0b3JOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCwgdmVjdG9yLngsIHZlY3Rvci55LFxyXG4gICAgICBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgICAgZmlsbDogY29sb3JQYWxldHRlLm1haW5GaWxsLFxyXG4gICAgICAgIHN0cm9rZTogY29sb3JQYWxldHRlLm1haW5TdHJva2VcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgLy8gY29tcG9uZW50IHZlY3RvcnNcclxuICAgIGNvbnN0IGNvbXBvbmVudEFycm93T3B0aW9ucyA9IG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQ09NUE9ORU5UX1ZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgIGZpbGw6IGNvbG9yUGFsZXR0ZS5jb21wb25lbnRGaWxsXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB4Q29tcG9uZW50Tm9kZSA9IG5ldyBEYXNoZWRBcnJvd05vZGUoIDAsIDAsIHZlY3Rvci54LCAwLCBjb21wb25lbnRBcnJvd09wdGlvbnMgKTtcclxuICAgIGNvbnN0IHlDb21wb25lbnROb2RlID0gbmV3IERhc2hlZEFycm93Tm9kZSggdmVjdG9yLngsIDAsIHZlY3Rvci54LCB2ZWN0b3IueSwgY29tcG9uZW50QXJyb3dPcHRpb25zICk7XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZVNjcmVlbkljb24oIFsgeENvbXBvbmVudE5vZGUsIHlDb21wb25lbnROb2RlLCB2ZWN0b3JOb2RlIF0gKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgJ0xhYicgU2NyZWVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7U2NyZWVuSWNvbn1cclxuICAgKi9cclxuICBjcmVhdGVMYWJTY3JlZW5JY29uKCkge1xyXG5cclxuICAgIC8vIHtWZWN0b3IyW119IHRoZSB0aXAgcG9zaXRpb25zIG9mIHRoZSBncm91cCAxIChibHVlKSBhcnJvd3MgKGFsaWduZWQgdGlwIHRvIHRhaWwpXHJcbiAgICBjb25zdCBncm91cDFUaXBQb3NpdGlvbnMgPSBbXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBTQ1JFRU5fSUNPTl9XSURUSCAqIDAuNjMsIDAgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIFNDUkVFTl9JQ09OX1dJRFRILCAtU0NSRUVOX0lDT05fSEVJR0hUIClcclxuICAgIF07XHJcblxyXG4gICAgLy8ge1ZlY3RvcjJbXX0gdGhlIHRpcCBwb3NpdGlvbnMgb2YgdGhlIGdyb3VwIDIgKG9yYW5nZSkgYXJyb3dzIChhbGlnbmVkIHRpcCB0byB0YWlsKVxyXG4gICAgY29uc3QgZ3JvdXAyVGlwUG9zaXRpb25zID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgLVNDUkVFTl9JQ09OX0hFSUdIVCAqIDAuNyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggU0NSRUVOX0lDT05fV0lEVEgsIC1TQ1JFRU5fSUNPTl9IRUlHSFQgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBzdGFydGluZyB0YWlsIHBvc2l0aW9uIG9mIDFzdCB2ZWN0b3JcclxuICAgIGNvbnN0IHN0YXJ0aW5nVGFpbFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIFNDUkVFTl9JQ09OX1dJRFRIIC8gNCwgMCApO1xyXG5cclxuICAgIGNvbnN0IGdyb3VwMUFycm93Tm9kZXMgPSBjcmVhdGVUaXBUb1RhaWxBcnJvd05vZGVzKCBncm91cDFUaXBQb3NpdGlvbnMsIHN0YXJ0aW5nVGFpbFBvc2l0aW9uLFxyXG4gICAgICBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgICAgZmlsbDogVmVjdG9yQWRkaXRpb25Db2xvcnMuQkxVRV9DT0xPUl9QQUxFVFRFLm1haW5GaWxsLFxyXG4gICAgICAgIHN0cm9rZTogVmVjdG9yQWRkaXRpb25Db2xvcnMuQkxVRV9DT0xPUl9QQUxFVFRFLm1haW5TdHJva2VcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgZ3JvdXAyQXJyb3dOb2RlcyA9IGNyZWF0ZVRpcFRvVGFpbEFycm93Tm9kZXMoIGdyb3VwMlRpcFBvc2l0aW9ucywgc3RhcnRpbmdUYWlsUG9zaXRpb24sXHJcbiAgICAgIG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiBWZWN0b3JBZGRpdGlvbkNvbG9ycy5PUkFOR0VfQ09MT1JfUEFMRVRURS5tYWluRmlsbCxcclxuICAgICAgICBzdHJva2U6IFZlY3RvckFkZGl0aW9uQ29sb3JzLk9SQU5HRV9DT0xPUl9QQUxFVFRFLm1haW5TdHJva2VcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZVNjcmVlbkljb24oIGdyb3VwMkFycm93Tm9kZXMuY29uY2F0KCBncm91cDFBcnJvd05vZGVzICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgJ0VxdWF0aW9ucycgU2NyZWVuLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7U2NyZWVuSWNvbn1cclxuICAgKi9cclxuICBjcmVhdGVFcXVhdGlvbnNTY3JlZW5JY29uKCkge1xyXG5cclxuICAgIC8vIHtWZWN0b3IyW119IHRoZSB0aXAgcG9zaXRpb25zIG9mIHRoZSB2ZWN0b3JzIG9uIHRoZSBpY29uICh2ZWN0b3JzIGFyZSBhbGlnbmVkIHRpcCB0byB0YWlsKVxyXG4gICAgY29uc3QgdGlwUG9zaXRpb25zID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggU0NSRUVOX0lDT05fV0lEVEggKiAwLjE1LCAtU0NSRUVOX0lDT05fSEVJR0hUICogMC43NSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggU0NSRUVOX0lDT05fV0lEVEggKiAwLjg1LCAtU0NSRUVOX0lDT05fSEVJR0hUIClcclxuICAgIF07XHJcbiAgICBjb25zdCBzdGFydFRhaWwgPSBWZWN0b3IyLlpFUk87XHJcbiAgICBjb25zdCBsYXN0VGlwID0gXy5sYXN0KCB0aXBQb3NpdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjb2xvclBhbGV0dGUgPSBWZWN0b3JBZGRpdGlvbkNvbG9ycy5FUVVBVElPTlNfQkxVRV9DT0xPUl9QQUxFVFRFO1xyXG5cclxuICAgIC8vIHZlY3RvcnMsIHRpcCB0byB0YWlsXHJcbiAgICBjb25zdCBhcnJvd05vZGVzID0gY3JlYXRlVGlwVG9UYWlsQXJyb3dOb2RlcyggdGlwUG9zaXRpb25zLCBzdGFydFRhaWwsXHJcbiAgICAgIG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiBjb2xvclBhbGV0dGUubWFpbkZpbGwsXHJcbiAgICAgICAgc3Ryb2tlOiBjb2xvclBhbGV0dGUubWFpblN0cm9rZVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBzdW1cclxuICAgIGFycm93Tm9kZXMucHVzaCggbmV3IEFycm93Tm9kZSggc3RhcnRUYWlsLngsIHN0YXJ0VGFpbC55LCBsYXN0VGlwLngsIGxhc3RUaXAueSxcclxuICAgICAgbWVyZ2UoIHt9LCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TVU1fVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiBjb2xvclBhbGV0dGUuc3VtRmlsbCxcclxuICAgICAgICBzdHJva2U6IGNvbG9yUGFsZXR0ZS5zdW1TdHJva2VcclxuICAgICAgfSApICkgKTtcclxuXHJcbiAgICByZXR1cm4gY3JlYXRlU2NyZWVuSWNvbiggYXJyb3dOb2RlcyApO1xyXG4gIH0sXHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFZlY3RvckNyZWF0b3JQYW5lbCBpY29uc1xyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsVmVjdG9yQ29tcG9uZW50cyAtIHZlY3RvciBjb21wb25lbnRzIChpbiB2aWV3IGNvb3JkaW5hdGVzKVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yQ29sb3JQYWxldHRlfSB2ZWN0b3JDb2xvclBhbGV0dGUgLSBjb2xvciBwYWxldHRlIGZvciB0aGlzIGljb24ncyB2ZWN0b3JcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXJyb3dMZW5ndGhcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBjcmVhdGVWZWN0b3JDcmVhdG9yUGFuZWxJY29uKCBpbml0aWFsVmVjdG9yQ29tcG9uZW50cywgdmVjdG9yQ29sb3JQYWxldHRlLCBhcnJvd0xlbmd0aCApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbml0aWFsVmVjdG9yQ29tcG9uZW50cyBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIGluaXRpYWxWZWN0b3JDb21wb25lbnRzOiAke2luaXRpYWxWZWN0b3JDb21wb25lbnRzfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3RvckNvbG9yUGFsZXR0ZSBpbnN0YW5jZW9mIFZlY3RvckNvbG9yUGFsZXR0ZSwgYGludmFsaWQgdmVjdG9yQ29sb3JQYWxldHRlOiAke3ZlY3RvckNvbG9yUGFsZXR0ZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgYXJyb3dMZW5ndGggPT09ICdudW1iZXInICYmIGFycm93TGVuZ3RoID4gMCwgYGludmFsaWQgYXJyb3dMZW5ndGg6ICR7YXJyb3dMZW5ndGh9YCApO1xyXG5cclxuICAgIGNvbnN0IGFycm93Q29tcG9uZW50cyA9IGluaXRpYWxWZWN0b3JDb21wb25lbnRzLm5vcm1hbGl6ZWQoKS50aW1lc1NjYWxhciggYXJyb3dMZW5ndGggKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEFycm93Tm9kZSggMCwgMCwgYXJyb3dDb21wb25lbnRzLngsIGFycm93Q29tcG9uZW50cy55LFxyXG4gICAgICBtZXJnZSgge30sIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgICAgYXJyb3dMZW5ndGg6IGFycm93TGVuZ3RoLFxyXG4gICAgICAgIGN1cnNvcjogJ21vdmUnLFxyXG4gICAgICAgIGZpbGw6IHZlY3RvckNvbG9yUGFsZXR0ZS5tYWluRmlsbCxcclxuICAgICAgICBzdHJva2U6IHZlY3RvckNvbG9yUGFsZXR0ZS5tYWluU3Ryb2tlXHJcbiAgICAgIH0gKSApO1xyXG4gIH0sXHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENoZWNrYm94IGljb25zIChpLmUuIHN1bSBpY29uLCBhbmdsZSBpY29uKVxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgdmVjdG9yIGljb24gdGhhdCBwb2ludHMgdG8gdGhlIHJpZ2h0LCB1c2VkIHdpdGggdmFyaW91cyBjaGVja2JveGVzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlVmVjdG9ySWNvbiggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHt9LCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5WRUNUT1JfQVJST1dfT1BUSU9OUywge1xyXG4gICAgICBmaWxsOiBDb2xvci5CTEFDSyxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGxlbmd0aDogNTBcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEFycm93Tm9kZSggMCwgMCwgb3B0aW9ucy5sZW5ndGgsIDAsIG9wdGlvbnMgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIHRoYXQgYXBwZWFycyBuZXh0IHRvIHRoZSBjaGVja2JveCB0aGF0IHRvZ2dsZXMgdGhlICdBbmdsZScgdmlzaWJpbGl0eVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBjcmVhdGVBbmdsZUljb24oKSB7XHJcblxyXG4gICAgLy8gdmFsdWVzIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuICAgIGNvbnN0IHdlZGdlTGVuZ3RoID0gMjA7XHJcbiAgICBjb25zdCBhbmdsZSA9IFV0aWxzLnRvUmFkaWFucyggNTAgKTtcclxuICAgIGNvbnN0IGN1cnZlZEFycm93UmFkaXVzID0gMTY7XHJcblxyXG4gICAgY29uc3Qgd2VkZ2VTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIHdlZGdlTGVuZ3RoLCAwIClcclxuICAgICAgLmhvcml6b250YWxMaW5lVG8oIDAgKVxyXG4gICAgICAubGluZVRvKCBNYXRoLmNvcyggYW5nbGUgKSAqIHdlZGdlTGVuZ3RoLCAtTWF0aC5zaW4oIGFuZ2xlICkgKiB3ZWRnZUxlbmd0aCApO1xyXG4gICAgY29uc3Qgd2VkZ2VOb2RlID0gbmV3IFBhdGgoIHdlZGdlU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDS1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGN1cnZlZEFycm93Tm9kZSA9IG5ldyBDdXJ2ZWRBcnJvd05vZGUoIGN1cnZlZEFycm93UmFkaXVzLCBhbmdsZSApO1xyXG5cclxuICAgIGNvbnN0IHRoZXRhTm9kZSA9IG5ldyBUZXh0KCBNYXRoU3ltYm9scy5USEVUQSwge1xyXG4gICAgICBmb250OiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5FUVVBVElPTl9TWU1CT0xfRk9OVCxcclxuICAgICAgc2NhbGU6IDAuNzUsXHJcbiAgICAgIGxlZnQ6IGN1cnZlZEFycm93Tm9kZS5yaWdodCArIDQsXHJcbiAgICAgIGNlbnRlclk6IHdlZGdlTm9kZS5jZW50ZXJZXHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHdlZGdlTm9kZSwgY3VydmVkQXJyb3dOb2RlLCB0aGV0YU5vZGUgXVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIENvbXBvbmVudFZlY3RvclN0eWxlcyBpY29ucywgdXNlZCBvbiBDb21wb25lbnQgcmFkaW8gYnV0dG9uc1xyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29ucyB0aGF0IGdvIG9uIHRoZSBDb21wb25lbnQgU3R5bGUgUmFkaW8gQnV0dG9uIGJhc2VkIG9uIGEgY29tcG9uZW50IHN0eWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Q29tcG9uZW50VmVjdG9yU3R5bGVzfSBjb21wb25lbnRTdHlsZVxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUNvbXBvbmVudFN0eWxlUmFkaW9CdXR0b25JY29uKCBjb21wb25lbnRTdHlsZSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBDb21wb25lbnRWZWN0b3JTdHlsZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIGNvbXBvbmVudFN0eWxlICksIGBpbnZhbGlkIGNvbXBvbmVudFN0eWxlOiAke2NvbXBvbmVudFN0eWxlfWAgKTtcclxuXHJcbiAgICBjb25zdCBpY29uU2l6ZSA9IFJBRElPX0JVVFRPTl9JQ09OX1NJWkU7IC8vIHNpemUgb2YgdGhlIGljb24gKHNxdWFyZSlcclxuXHJcbiAgICBpZiAoIGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuSU5WSVNJQkxFICkge1xyXG4gICAgICByZXR1cm4gY3JlYXRlRXllQ2xvc2VJY29uKCBpY29uU2l6ZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1YkJveFNpemUgPSBSQURJT19CVVRUT05fSUNPTl9TSVpFIC8gMzsgLy8gc2l6ZSBvZiB0aGUgc3ViLWJveCB0aGUgbGVhZGVyIGxpbmVzIGNyZWF0ZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3ViQm94U2l6ZSA8IGljb25TaXplLCBgc3ViQm94U2l6ZSAke3N1YkJveFNpemV9IG11c3QgYmUgPCBpY29uU2l6ZSAke2ljb25TaXplfWAgKTtcclxuXHJcbiAgICAvLyBPcHRpb25zIGZvciBtYWluIGFuZCBjb21wb25lbnQgYXJyb3dzXHJcbiAgICBjb25zdCBtYWluT3B0aW9ucyA9IG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgZmlsbDogVmVjdG9yQWRkaXRpb25Db2xvcnMuQkxVRV9DT0xPUl9QQUxFVFRFLm1haW5GaWxsLFxyXG4gICAgICBzdHJva2U6IFZlY3RvckFkZGl0aW9uQ29sb3JzLkJMVUVfQ09MT1JfUEFMRVRURS5tYWluU3Ryb2tlXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gbWVyZ2UoIHt9LCBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5DT01QT05FTlRfVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgZmlsbDogVmVjdG9yQWRkaXRpb25Db2xvcnMuQkxVRV9DT0xPUl9QQUxFVFRFLmNvbXBvbmVudEZpbGxcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBJbml0aWFsaXplIGFycm93cyBmb3IgdGhlIFBBUkFMTEVMT0dSQU0gY29tcG9uZW50IHN0eWxlICh3aWxsIGJlIGFkanVzdGVkIGZvciBkaWZmZXJlbnQgY29tcG9uZW50IHN0eWxlcylcclxuICAgIGNvbnN0IHZlY3RvckFycm93ID0gbmV3IEFycm93Tm9kZSggMCwgMCwgaWNvblNpemUsIC1pY29uU2l6ZSwgbWFpbk9wdGlvbnMgKTtcclxuICAgIGNvbnN0IHhDb21wb25lbnRBcnJvdyA9IG5ldyBEYXNoZWRBcnJvd05vZGUoIDAsIDAsIGljb25TaXplLCAwLCBjb21wb25lbnRPcHRpb25zICk7XHJcbiAgICBjb25zdCB5Q29tcG9uZW50QXJyb3cgPSBuZXcgRGFzaGVkQXJyb3dOb2RlKCAwLCAwLCAwLCAtaWNvblNpemUsIGNvbXBvbmVudE9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgaWNvbkNoaWxkcmVuID0gWyB4Q29tcG9uZW50QXJyb3csIHlDb21wb25lbnRBcnJvdywgdmVjdG9yQXJyb3cgXTsgLy8gY2hpbGRyZW4gb2YgdGhlIGljb24gY2hpbGRyZW5cclxuXHJcbiAgICBpZiAoIGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuVFJJQU5HTEUgKSB7XHJcbiAgICAgIHlDb21wb25lbnRBcnJvdy5zZXRUYWlsQW5kVGlwKCBpY29uU2l6ZSwgMCwgaWNvblNpemUsIC1pY29uU2l6ZSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNvbXBvbmVudFN0eWxlID09PSBDb21wb25lbnRWZWN0b3JTdHlsZXMuUFJPSkVDVElPTiApIHtcclxuICAgICAgdmVjdG9yQXJyb3cuc2V0VGFpbEFuZFRpcCggc3ViQm94U2l6ZSwgLXN1YkJveFNpemUsIGljb25TaXplLCAtaWNvblNpemUgKTtcclxuICAgICAgeENvbXBvbmVudEFycm93LnNldFRhaWxBbmRUaXAoIHN1YkJveFNpemUsIDAsIGljb25TaXplLCAwICk7XHJcbiAgICAgIHlDb21wb25lbnRBcnJvdy5zZXRUYWlsQW5kVGlwKCAwLCAtc3ViQm94U2l6ZSwgMCwgLWljb25TaXplICk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlIGxlYWRlciBsaW5lc1xyXG4gICAgICBjb25zdCBsZWFkZXJMaW5lc1NoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAtc3ViQm94U2l6ZSApXHJcbiAgICAgICAgLmhvcml6b250YWxMaW5lVG8oIHN1YkJveFNpemUgKVxyXG4gICAgICAgIC52ZXJ0aWNhbExpbmVUb1JlbGF0aXZlKCBzdWJCb3hTaXplIClcclxuICAgICAgICAubW92ZVRvKCAwLCAtaWNvblNpemUgKVxyXG4gICAgICAgIC5ob3Jpem9udGFsTGluZVRvKCBpY29uU2l6ZSApXHJcbiAgICAgICAgLnZlcnRpY2FsTGluZVRvUmVsYXRpdmUoIGljb25TaXplICk7XHJcblxyXG4gICAgICBjb25zdCBsZWFkZXJMaW5lc1BhdGggPSBuZXcgUGF0aCggbGVhZGVyTGluZXNTaGFwZSwge1xyXG4gICAgICAgIGxpbmVEYXNoOiBbIDIuOSwgMiBdLFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBpY29uQ2hpbGRyZW4gPSBbIGxlYWRlckxpbmVzUGF0aCwgeENvbXBvbmVudEFycm93LCB5Q29tcG9uZW50QXJyb3csIHZlY3RvckFycm93IF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBpY29uQ2hpbGRyZW4sXHJcbiAgICAgIG1heFdpZHRoOiBpY29uU2l6ZSxcclxuICAgICAgbWF4SGVpZ2h0OiBpY29uU2l6ZVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gQ29vcmRpbmF0ZVNuYXBNb2RlcyBpY29ucywgdXNlZCBvbiBzY2VuZSByYWRpbyBidXR0b25zLFxyXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy8yMSlcclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGUgQ2FydGVzaWFuIHNuYXAgbW9kZSByYWRpbyBidXR0b24uXHJcbiAgICogQHBhcmFtIHtWZWN0b3JDb2xvclBhbGV0dGV9IHZlY3RvckNvbG9yUGFsZXR0ZVxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUNhcnRlc2lhblNuYXBNb2RlSWNvbiggdmVjdG9yQ29sb3JQYWxldHRlICkge1xyXG5cclxuICAgIGNvbnN0IGljb25TaXplID0gUkFESU9fQlVUVE9OX0lDT05fU0laRTtcclxuXHJcbiAgICAvLyBBcnJvdyB0aGF0IGlzIDQ1IGRlZ3JlZXMgdG8gdGhlIHJpZ2h0IGFuZCB1cFxyXG4gICAgY29uc3QgdmVjdG9yTm9kZSA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIGljb25TaXplLCAtaWNvblNpemUsXHJcbiAgICAgIG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiB2ZWN0b3JDb2xvclBhbGV0dGUubWFpbkZpbGwsXHJcbiAgICAgICAgc3Ryb2tlOiB2ZWN0b3JDb2xvclBhbGV0dGUubWFpblN0cm9rZVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyB4IGFuZCB5LCBDYXJ0ZXNpYW4gY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IHh5QXJyb3dPcHRpb25zID0ge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICB0YWlsV2lkdGg6IDEsXHJcbiAgICAgIGhlYWRXaWR0aDogNixcclxuICAgICAgaGVhZEhlaWdodDogNlxyXG4gICAgfTtcclxuICAgIGNvbnN0IHhOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCwgaWNvblNpemUsIDAsIHh5QXJyb3dPcHRpb25zICk7XHJcbiAgICBjb25zdCB5Tm9kZSA9IG5ldyBBcnJvd05vZGUoIGljb25TaXplLCAwLCBpY29uU2l6ZSwgLWljb25TaXplLCB4eUFycm93T3B0aW9ucyApO1xyXG5cclxuICAgIHJldHVybiBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyB2ZWN0b3JOb2RlLCB4Tm9kZSwgeU5vZGUgXSxcclxuICAgICAgbWF4V2lkdGg6IGljb25TaXplLFxyXG4gICAgICBtYXhIZWlnaHQ6IGljb25TaXplXHJcbiAgICB9ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiBmb3IgdGhlIFBvbGFyIHNuYXAgbW9kZSByYWRpbyBidXR0b24uXHJcbiAgICogQHBhcmFtIHtWZWN0b3JDb2xvclBhbGV0dGV9IHZlY3RvckNvbG9yUGFsZXR0ZVxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZVBvbGFyU25hcE1vZGVJY29uKCB2ZWN0b3JDb2xvclBhbGV0dGUgKSB7XHJcblxyXG4gICAgY29uc3QgaWNvblNpemUgPSBSQURJT19CVVRUT05fSUNPTl9TSVpFO1xyXG4gICAgY29uc3QgYXJjUmFkaXVzID0gMzA7IC8vIGFyYyByYWRpdXMgb2YgdGhlIGN1cnZlZCBhcnJvd1xyXG5cclxuICAgIC8vIEFycm93IHRoYXQgaXMgNDUgZGVncmVlcyB0byB0aGUgcmlnaHQgYW5kIHVwXHJcbiAgICBjb25zdCBhcnJvdyA9IG5ldyBBcnJvd05vZGUoIDAsIDAsIGljb25TaXplLCAtaWNvblNpemUsXHJcbiAgICAgIG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX0FSUk9XX09QVElPTlMsIHtcclxuICAgICAgICBmaWxsOiB2ZWN0b3JDb2xvclBhbGV0dGUubWFpbkZpbGwsXHJcbiAgICAgICAgc3Ryb2tlOiB2ZWN0b3JDb2xvclBhbGV0dGUubWFpblN0cm9rZVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBDdXJ2ZWQgYXJyb3cgdGhhdCBpbmRpY2F0ZXMgdGhlIGFuZ2xlXHJcbiAgICBjb25zdCBjdXJ2ZWRBcnJvdyA9IG5ldyBDdXJ2ZWRBcnJvd05vZGUoIGFyY1JhZGl1cywgVXRpbHMudG9SYWRpYW5zKCA0NSApICk7XHJcblxyXG4gICAgLy8gaG9yaXpvbnRhbCBsaW5lXHJcbiAgICBjb25zdCBsaW5lID0gbmV3IExpbmUoIDAsIDAsIGljb25TaXplLCAwLCB7XHJcbiAgICAgIHN0cm9rZTogQ29sb3IuQkxBQ0tcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgYXJyb3csIGN1cnZlZEFycm93LCBsaW5lIF0sXHJcbiAgICAgIG1heFdpZHRoOiBpY29uU2l6ZSxcclxuICAgICAgbWF4SGVpZ2h0OiBpY29uU2l6ZVxyXG4gICAgfSApO1xyXG4gIH0sXHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gR3JhcGhPcmllbnRhdGlvbnMgaWNvbnMgKGhvcml6b250YWwvdmVydGljYWwpLCB1c2VkIG9uIHNjZW5lIHJhZGlvIGJ1dHRvbnMgaW4gRXhwbG9yZSAxRCBzY3JlZW5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBpY29uIHVzZWQgb24gdGhlIHJhZGlvIGJ1dHRvbnMgb24gJ0V4cGxvcmUgMUQnIHNjcmVlbiB0aGF0IHRvZ2dsZXMgdGhlIGdyYXBoIG9yaWVudGF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge0dyYXBoT3JpZW50YXRpb25zfSBncmFwaE9yaWVudGF0aW9uIC0gb3JpZW50YXRpb24gb2YgdGhlIGdyYXBoIChoYXMgdG8gYmUgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbClcclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKi9cclxuICBjcmVhdGVHcmFwaE9yaWVudGF0aW9uSWNvbiggZ3JhcGhPcmllbnRhdGlvbiApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBbIEdyYXBoT3JpZW50YXRpb25zLkhPUklaT05UQUwsIEdyYXBoT3JpZW50YXRpb25zLlZFUlRJQ0FMIF0sIGdyYXBoT3JpZW50YXRpb24gKSxcclxuICAgICAgYGludmFsaWQgZ3JhcGhPcmllbnRhdGlvbjogJHtncmFwaE9yaWVudGF0aW9ufWAgKTtcclxuXHJcbiAgICBjb25zdCBpY29uU2l6ZSA9IFJBRElPX0JVVFRPTl9JQ09OX1NJWkU7XHJcbiAgICBjb25zdCB0aXBYID0gKCBncmFwaE9yaWVudGF0aW9uID09PSBHcmFwaE9yaWVudGF0aW9ucy5IT1JJWk9OVEFMICkgPyBpY29uU2l6ZSA6IDA7XHJcbiAgICBjb25zdCB0aXBZID0gKCBncmFwaE9yaWVudGF0aW9uID09PSBHcmFwaE9yaWVudGF0aW9ucy5IT1JJWk9OVEFMICkgPyAwIDogaWNvblNpemU7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBBcnJvd05vZGUoIDAsIDAsIHRpcFgsIHRpcFksIG1lcmdlKCB7fSwgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuQVhFU19BUlJPV19PUFRJT05TLCB7XHJcbiAgICAgIG1heFdpZHRoOiBpY29uU2l6ZSxcclxuICAgICAgbWF4SGVpZ2h0OiBpY29uU2l6ZVxyXG4gICAgfSApICk7XHJcbiAgfSxcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRXF1YXRpb25UeXBlcyBpY29ucywgdXNlZCBvbiByYWRpbyBidXR0b25zIGluIEVxdWF0aW9ucyBzY3JlZW5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgSWNvbiB0aGF0IGFwcGVhcnMgb24gdGhlIEVxdWF0aW9uVHlwZXMgcmFkaW8gYnV0dG9uIGljb25zIG9uIHRoZSAnRXF1YXRpb25zJyBzY3JlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7RXF1YXRpb25UeXBlc30gZXF1YXRpb25UeXBlXHJcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gdmVjdG9yU3ltYm9scyAtIHN5bWJvbHMgb24gdGhlIGJ1dHRvbnMgKHRoZSBsYXN0IHN5bWJvbCBpcyB0aGUgc3VtJ3Mgc3ltYm9sKVxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUVxdWF0aW9uVHlwZUljb24oIGVxdWF0aW9uVHlwZSwgdmVjdG9yU3ltYm9scyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBFcXVhdGlvblR5cGVzLmVudW1lcmF0aW9uLmluY2x1ZGVzKCBlcXVhdGlvblR5cGUgKSwgYGludmFsaWQgZXF1YXRpb25UeXBlOiAke2VxdWF0aW9uVHlwZX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB2ZWN0b3JTeW1ib2xzLCBzeW1ib2wgPT4gdHlwZW9mIHN5bWJvbCA9PT0gJ3N0cmluZycgKSAmJiB2ZWN0b3JTeW1ib2xzLmxlbmd0aCA+IDEsXHJcbiAgICAgIGBpbnZhbGlkIHZlY3RvclN5bWJvbHM6ICR7dmVjdG9yU3ltYm9sc31gICk7XHJcblxyXG4gICAgbGV0IGNoaWxkcmVuID0gW107XHJcblxyXG4gICAgY29uc3QgdGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGZvbnQ6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkVRVUFUSU9OX0ZPTlRcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2F0aGVyIGFsbCB0aGUgc3ltYm9scyBmb3IgdGhlIGxlZnQgc2lkZSBvZiB0aGUgZXF1YXRpb24gaW50byBhbiBhcnJheS5cclxuICAgIC8vIEZvciBORUdBVElPTiwgYWxsIHN5bWJvbHMgYXJlIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGVxdWF0aW9uXHJcbiAgICBjb25zdCBlcXVhdGlvbkxlZnRTaWRlU3ltYm9scyA9IF8uZHJvcFJpZ2h0KCB2ZWN0b3JTeW1ib2xzLCBlcXVhdGlvblR5cGUgPT09IEVxdWF0aW9uVHlwZXMuTkVHQVRJT04gPyAwIDogMSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHZlY3RvciBzeW1ib2wgZm9yIGVhY2ggc3ltYm9sIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGVxdWF0aW9uLlxyXG4gICAgZXF1YXRpb25MZWZ0U2lkZVN5bWJvbHMuZm9yRWFjaCggc3ltYm9sID0+IHtcclxuICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IEFycm93T3ZlclN5bWJvbE5vZGUoIHN5bWJvbCApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSW50ZXJsZWF2ZSBvcGVyYXRvcnMgKGkuZS4gJysnfCctJykgaW4gYmV0d2VlbiBlYWNoIHN5bWJvbCBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBlcXVhdGlvblxyXG4gICAgY2hpbGRyZW4gPSBpbnRlcmxlYXZlKCBjaGlsZHJlbiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCBvcGVyYXRvciA9ICggZXF1YXRpb25UeXBlID09PSBFcXVhdGlvblR5cGVzLlNVQlRSQUNUSU9OICkgPyBNYXRoU3ltYm9scy5NSU5VUyA6IE1hdGhTeW1ib2xzLlBMVVM7XHJcbiAgICAgIHJldHVybiBuZXcgVGV4dCggb3BlcmF0b3IsIHRleHRPcHRpb25zICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJz0nXHJcbiAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVGV4dCggTWF0aFN5bWJvbHMuRVFVQUxfVE8sIHRleHRPcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyBSaWdodCBzaWRlIG9mIHRoZSBlcXVhdGlvbiwgd2hpY2ggaXMgZWl0aGVyICcwJyBvciB0aGUgbGFzdCBvZiB0aGUgc3ltYm9scyAod2hpY2ggaXMgdGhlIHN1bSkuXHJcbiAgICBjaGlsZHJlbi5wdXNoKCBlcXVhdGlvblR5cGUgPT09IEVxdWF0aW9uVHlwZXMuTkVHQVRJT04gP1xyXG4gICAgICAgICAgICAgICAgICAgbmV3IFRleHQoICcwJywgdGV4dE9wdGlvbnMgKSA6XHJcbiAgICAgICAgICAgICAgICAgICBuZXcgQXJyb3dPdmVyU3ltYm9sTm9kZSggXy5sYXN0KCB2ZWN0b3JTeW1ib2xzICkgKSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgIHNwYWNpbmc6IDgsXHJcbiAgICAgIGFsaWduOiAnb3JpZ2luJyAvLyBzbyB0aGF0IHRleHQgYmFzZWxpbmVzIGFyZSBhbGlnbmVkXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEhlbHBlciBmdW5jdGlvbnNcclxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBWZWN0b3IgSWNvbnMgKEFycm93Tm9kZSkgdGlwIHRvIHRhaWwgYmFzZWQgb24gYW4gYXJyYXkgb2YgdGlwIHBvc2l0aW9ucyBhbG9uZyB3aXRoIHRoZSB0YWlsIHBvc2l0aW9uIG9mIHRoZVxyXG4gKiBmaXJzdCBWZWN0b3IuIEFycm93Tm9kZXMgYXJlIGNyZWF0ZWQgYW5kIHB1c2hlZCB0byBhIGdpdmVuIGFycmF5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJbXX0gdGlwUG9zaXRpb25zIC0gdGlwIHBvc2l0aW9ucyBvZiBhbGwgdmVjdG9ycyAodmVjdG9ycyBhcmUgYWxpZ25lZCB0aXAgdG8gdGFpbClcclxuICogQHBhcmFtIHtWZWN0b3IyfSBzdGFydGluZ1RhaWxQb3NpdGlvbiAtIHRhaWwgcG9zaXRpb24gb2YgdGhlIGZpcnN0IHZlY3RvclxyXG4gKiBAcGFyYW0ge09iamVjdH0gW2Fycm93T3B0aW9uc10gLSBwYXNzZWQgdG8gYXJyb3cgbm9kZXNcclxuICogQHJldHVybnMge0Fycm93Tm9kZVtdfVxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlVGlwVG9UYWlsQXJyb3dOb2RlcyggdGlwUG9zaXRpb25zLCBzdGFydGluZ1RhaWxQb3NpdGlvbiwgYXJyb3dPcHRpb25zICkge1xyXG5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aXBQb3NpdGlvbnMsIHRpcCA9PiB0aXAgaW5zdGFuY2VvZiBWZWN0b3IyICksIGBpbnZhbGlkIHRpcFBvc2l0aW9uczogJHt0aXBQb3NpdGlvbnN9YCApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0aW5nVGFpbFBvc2l0aW9uIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgc3RhcnRpbmdUYWlsUG9zaXRpb246ICR7c3RhcnRpbmdUYWlsUG9zaXRpb259YCApO1xyXG5cclxuICBjb25zdCBhcnJvd05vZGVzID0gW107XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGlwUG9zaXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgdGFpbFBvc2l0aW9uID0gKCBpID09PSAwICkgPyBzdGFydGluZ1RhaWxQb3NpdGlvbiA6IHRpcFBvc2l0aW9uc1sgaSAtIDEgXTtcclxuICAgIGNvbnN0IHRpcFBvc2l0aW9uID0gdGlwUG9zaXRpb25zWyBpIF07XHJcbiAgICBhcnJvd05vZGVzLnB1c2goIG5ldyBBcnJvd05vZGUoIHRhaWxQb3NpdGlvbi54LCB0YWlsUG9zaXRpb24ueSwgdGlwUG9zaXRpb24ueCwgdGlwUG9zaXRpb24ueSwgYXJyb3dPcHRpb25zICkgKTtcclxuICB9XHJcbiAgcmV0dXJuIGFycm93Tm9kZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvNzYjaXNzdWVjb21tZW50LTUxNTE5NzU0NyBmb3IgY29udGV4dC5cclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIFNjcmVlbkljb24gYnV0IGFkZHMgYSBTcGFjZXIgdG8gZmlsbCBleHRyYSBzcGFjZS4gVGhpcyBlbnN1cmVzIGFsbCBzY3JlZW4gaWNvbnMgYXJlXHJcbiAqIHRoZSBzYW1lIHdpZHRoIGFuZCBoZWlnaHQgd2hpY2ggZW5zdXJlcyB0aGF0IHRoZXkgYXJlIGFsbCBzY2FsZWQgdGhlIHNhbWUuIFRodXMsIHRoaXMga2VlcHMgYWxsIEFycm93IE5vZGVzIGluc2lkZVxyXG4gKiBvZiBzY3JlZW4gaWNvbnMgdGhlIHNhbWUgJ2RpbWVuc2lvbnMnIChpLmUuIHRhaWxXaWR0aCwgaGVhZFdpZHRoLCBoZWFkSGVpZ2h0LCBldGMuICkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Tm9kZVtdfSBjaGlsZHJlbiAtIHRoZSBjaGlsZHJlbiBvZiB0aGUgaWNvblxyXG4gKiBAcmV0dXJucyB7U2NyZWVuSWNvbn1cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVNjcmVlbkljb24oIGNoaWxkcmVuICkge1xyXG5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBjaGlsZHJlbiwgY2hpbGQgPT4gY2hpbGQgaW5zdGFuY2VvZiBOb2RlICksIGBpbnZhbGlkIGNoaWxkcmVuOiAke2NoaWxkcmVufWAgKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBpY29uLCBhZGRpbmcgYSBTcGFjZXIgdG8gZmlsbCBleHRyYSBzcGFjZSBpZiBuZWVkZWQgKEVxdWl2YWxlbnQgdG8gc2V0dGluZyBhIG1pbmltdW0gd2lkdGgvaGVpZ2h0KVxyXG4gIGNvbnN0IGljb25Ob2RlID0gbmV3IE5vZGUoKS5hZGRDaGlsZCggbmV3IFNwYWNlciggU0NSRUVOX0lDT05fV0lEVEgsIFNDUkVFTl9JQ09OX0hFSUdIVCwgeyBwaWNrYWJsZTogZmFsc2UgfSApICk7XHJcblxyXG4gIGljb25Ob2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyAvLyBXcmFwIHRoZSBpY29uIGNvbnRlbnQgaW4gYSBOb2RlXHJcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICBjZW50ZXI6IGljb25Ob2RlLmNlbnRlcixcclxuICAgIG1heFdpZHRoOiBTQ1JFRU5fSUNPTl9XSURUSCwgLy8gRW5zdXJlcyB0aGUgaWNvbiBkb2Vzbid0IGdldCB3aWRlciB0aGFuIHRoZSBmaXhlZCBzY3JlZW4gaWNvbiBkaW1lbnNpb25zXHJcbiAgICBtYXhIZWlnaHQ6IFNDUkVFTl9JQ09OX0hFSUdIVCAvLyBFbnN1cmVzIHRoZSBpY29uIGRvZXNuJ3QgZ2V0IHRhbGxlciB0aGFuIHRoZSBmaXhlZCBzY3JlZW4gaWNvbiBkaW1lbnNpb25zXHJcbiAgfSApICk7XHJcblxyXG4gIHJldHVybiBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSB0aGUgY2xvc2UgZXllIGljb24sIGZvciBDb21wb25lbnRWZWN0b3JTdHlsZXMuSU5WSVNJQkxFLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gaWNvblNpemVcclxuICogQHJldHVybnMge05vZGV9XHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVFeWVDbG9zZUljb24oIGljb25TaXplICkge1xyXG5cclxuICBjb25zdCBzcGFjZXIgPSBuZXcgU3BhY2VyKCBpY29uU2l6ZSwgaWNvblNpemUgKTtcclxuXHJcbiAgY29uc3QgZXllSWNvbiA9IG5ldyBQYXRoKCBleWVTbGFzaFNvbGlkU2hhcGUsIHtcclxuICAgIHNjYWxlOiAwLjA2OCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgZmlsbDogJ2JsYWNrJyxcclxuICAgIGNlbnRlcjogc3BhY2VyLmNlbnRlclxyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBOb2RlKCB7XHJcbiAgICBjaGlsZHJlbjogWyBzcGFjZXIsIGV5ZUljb24gXSxcclxuICAgIG1heFdpZHRoOiBpY29uU2l6ZSxcclxuICAgIG1heEhlaWdodDogaWNvblNpemVcclxuICB9ICk7XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeScsIFZlY3RvckFkZGl0aW9uSWNvbkZhY3RvcnkgKTtcclxuZXhwb3J0IGRlZmF1bHQgVmVjdG9yQWRkaXRpb25JY29uRmFjdG9yeTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSx3Q0FBd0M7QUFDL0QsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JHLE9BQU9DLGtCQUFrQixNQUFNLDJEQUEyRDtBQUMxRixPQUFPQyxhQUFhLE1BQU0sd0NBQXdDO0FBQ2xFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sbUNBQW1DO0FBQ3JFLE9BQU9DLGlCQUFpQixNQUFNLCtCQUErQjtBQUM3RCxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFDL0QsT0FBT0Msb0JBQW9CLE1BQU0sNEJBQTRCO0FBQzdE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