// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main view for FractionChallenges
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import VegasStrings from '../../../../vegas/js/VegasStrings.js';
import NumberGroupStack from '../../building/model/NumberGroupStack.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroupStack from '../../building/model/ShapeGroupStack.js';
import ShapeStack from '../../building/model/ShapeStack.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import FractionChallengePanel from './FractionChallengePanel.js';
import GameLayerNode from './GameLayerNode.js';
import TargetNode from './TargetNode.js';

const levelTitlePatternString = FractionsCommonStrings.levelTitlePattern;
const nextString = VegasStrings.next;

// constants
const PANEL_MARGIN = FractionsCommonConstants.PANEL_MARGIN;

class FractionChallengeNode extends Node {
  /**
   * @param {FractionChallenge} challenge
   * @param {Bounds2} layoutBounds
   * @param {function|null} nextLevelCallback - Called with no arguments, forwards to the next level (if there is one)
   * @param {Emitter} incorrectAttemptEmitter
   * @param {Property.<boolean>} allLevelsCompleteProperty
   */
  constructor( challenge, layoutBounds, nextLevelCallback, incorrectAttemptEmitter, allLevelsCompleteProperty ) {
    super();

    // @private {FractionChallenge}
    this.challenge = challenge;

    // @private {Property.<Bounds2>}
    this.shapeDragBoundsProperty = new Property( layoutBounds );
    this.numberDragBoundsProperty = new Property( layoutBounds );

    // @private {Node}
    this.panel = new FractionChallengePanel( challenge, ( event, stack ) => {
      if ( !stack.array.length ) { return; }
      const modelPoint = this.modelViewTransform.viewToModelPosition( this.globalToLocalPoint( event.pointer.point ) );
      if ( stack instanceof ShapeStack ) {
        const shapePiece = challenge.pullShapePieceFromStack( stack, modelPoint );
        const shapePieceNode = this.layerNode.getShapePieceNode( shapePiece );
        shapePieceNode.dragListener.press( event, shapePieceNode );
      }
      else if ( stack instanceof NumberStack ) {
        const numberPiece = challenge.pullNumberPieceFromStack( stack, modelPoint );
        const numberPieceNode = this.layerNode.getNumberPieceNode( numberPiece );
        numberPieceNode.dragListener.press( event, numberPieceNode );
      }
      else if ( stack instanceof ShapeGroupStack ) {
        const shapeGroup = challenge.pullGroupFromStack( stack, modelPoint );
        const shapeGroupNode = this.layerNode.getShapeGroupNode( shapeGroup );
        shapeGroupNode.dragListener.press( event, shapeGroupNode );
      }
      else if ( stack instanceof NumberGroupStack ) {
        const numberGroup = challenge.pullGroupFromStack( stack, modelPoint );
        const numberGroupNode = this.layerNode.getNumberGroupNode( numberGroup );
        numberGroupNode.dragListener.press( event, numberGroupNode );
      }
      else {
        throw new Error( 'unknown stack type' );
      }
    } );

    // @private {Array.<Node>}
    this.targetNodes = challenge.targets.map( target => new TargetNode( target, challenge ) );

    // @private {Node}
    this.targetsContainer = new VBox( {
      spacing: 0,
      align: 'left',
      children: this.targetNodes
    } );

    // @private {Node}
    this.levelText = new Text( StringUtils.fillIn( levelTitlePatternString, { number: challenge.levelNumber } ), {
      font: new PhetFont( { size: 30, weight: 'bold' } ),
      maxWidth: 400
    } );

    // @private {TextPushButton}
    this.nextLevelButton = new TextPushButton( nextString, {
      listener: nextLevelCallback,
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      font: new PhetFont( 24 ),
      maxTextWidth: 150
    } );

    // @private {Node}
    this.levelCompleteNode = new VBox( {
      spacing: 10,
      children: [
        new FaceNode( 180 ),
        ...( nextLevelCallback ? [ this.nextLevelButton ] : [] )
      ]
    } );

    // @private {function}
    this.levelCompleteListener = score => {
      this.levelCompleteNode.visible = score === this.challenge.targets.length && !allLevelsCompleteProperty.value;
    };
    this.challenge.scoreProperty.link( this.levelCompleteListener );

    // layout
    this.panel.bottom = layoutBounds.bottom - PANEL_MARGIN;
    this.targetsContainer.right = layoutBounds.right - PANEL_MARGIN;
    const horizontalCenter = ( layoutBounds.left + this.targetsContainer.left ) / 2;
    this.targetsContainer.centerY = 234; // Tuned so that this should be just high enough to work for stacks of 10
    this.panel.centerX = horizontalCenter;
    if ( this.panel.left < PANEL_MARGIN ) {
      this.panel.left = PANEL_MARGIN;
    }
    this.levelText.centerX = horizontalCenter;
    this.levelText.top = layoutBounds.top + PANEL_MARGIN;
    const verticalCenter = ( this.levelText.bottom + this.panel.top ) / 2;
    const center = new Vector2( horizontalCenter, verticalCenter );
    // @public {Vector2}
    this.challengeCenter = center;
    this.levelCompleteNode.center = center;

    // @public {ModelViewTransform2}
    this.modelViewTransform = new ModelViewTransform2( Matrix3.translationFromVector( center ) );

    this.panel.updateModelPositions( this.modelViewTransform );
    this.targetNodes.forEach( targetNode => targetNode.updateModelPositions( this.modelViewTransform, this.targetsContainer ) );

    this.shapeDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds( layoutBounds );
    this.numberDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds( layoutBounds );

    // @private {GameLayerNode}
    this.layerNode = new GameLayerNode( challenge, this.modelViewTransform, this.shapeDragBoundsProperty, this.numberDragBoundsProperty, this.targetsContainer, this.panel, incorrectAttemptEmitter );

    this.children = [
      this.panel,
      this.targetsContainer,
      this.levelText,
      this.layerNode,
      this.levelCompleteNode
    ];
  }

  /**
   * Checks whether the given pointer is the last pointer actively manipulating a group.
   * @public
   *
   * @param {Pointer} pointer
   * @returns {boolean}
   */
  isPointerActive( pointer ) {
    return this.layerNode.activePointerProperty.value === pointer;
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.layerNode.dispose();
    this.challenge.scoreProperty.unlink( this.levelCompleteListener );
    this.nextLevelButton.dispose();
    this.targetNodes.forEach( targetNode => targetNode.dispose() );
    this.panel.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'FractionChallengeNode', FractionChallengeNode );
export default FractionChallengeNode;
