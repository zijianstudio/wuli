// Copyright 2018-2022, University of Colorado Boulder

/**
 * Shows a container with a given visual representation of the target (what should go in it).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import GradientRectangle from '../../../../scenery-phet/js/GradientRectangle.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import { Color, HBox, Node, Rectangle } from '../../../../scenery/js/imports.js';
import NumberGroup from '../../building/model/NumberGroup.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import NumberGroupNode from '../../building/view/NumberGroupNode.js';
import ShapeGroupNode from '../../building/view/ShapeGroupNode.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FilledPartition from '../model/FilledPartition.js';
import ShapePartition from '../model/ShapePartition.js';
import ShapeTarget from '../model/ShapeTarget.js';
import FilledPartitionNode from './FilledPartitionNode.js';

// constants
const CORNER_RADIUS = 5;
const CORNER_OFFSET = 1;

const MIXED_SCALE = 0.6;
const UNMIXED_IMPROPER_SCALE = 0.9;
const UNMIXED_PROPER_SCALE = 1;

// compute the maximum width for our different scales
const maxPartitionWidthMap = {};
[ MIXED_SCALE, UNMIXED_IMPROPER_SCALE, UNMIXED_PROPER_SCALE ].forEach( scale => {
  maxPartitionWidthMap[ scale ] = Math.max( ...ShapePartition.GAME_PARTITIONS.map( partition => {
    const filledPartition = new FilledPartition( partition, _.range( 0, partition.length ).map( () => true ), Color.RED );
    return new FilledPartitionNode( filledPartition, {
      layoutScale: scale,
      adaptiveScale: true,
      primaryFill: Color.RED
    } ).width;
  } ) );
} );

class TargetNode extends HBox {
  /**
   * @param {Target} target
   * @param {FractionChallenge} challenge
   */
  constructor( target, challenge ) {
    super( {
      spacing: 10
    } );

    // @private {Target}
    this.target = target;

    // @private {ModelViewTransform2|null}
    this.modelViewTransform = null;

    // @private {Node|null}
    this.parentContainer = null;

    const isShapeTarget = target instanceof ShapeTarget;

    // @private {Node|null}
    this.placeholder = null;
    if ( challenge.hasShapes ) {
      const shapeGroup = new ShapeGroup( challenge.representation );
      _.times( challenge.maxTargetWholes - 1, () => shapeGroup.increaseContainerCount() );
      this.placeholder = new ShapeGroupNode( shapeGroup, {
        isIcon: true,
        hasButtons: false,
        scale: FractionsCommonConstants.SHAPE_COLLECTION_SCALE
      } );
    }
    else {
      const numberGroup = new NumberGroup( challenge.hasMixedTargets );
      numberGroup.numeratorSpot.pieceProperty.value = new NumberPiece( challenge.maxNumber );
      numberGroup.denominatorSpot.pieceProperty.value = new NumberPiece( challenge.maxNumber );
      if ( challenge.hasMixedTargets ) {
        numberGroup.wholeSpot.pieceProperty.value = new NumberPiece( challenge.maxNumber );
      }
      this.placeholder = new NumberGroupNode( numberGroup, {
        isIcon: true,
        hasCardBackground: false,
        scale: FractionsCommonConstants.NUMBER_COLLECTION_SCALE
      } );
    }

    this.background = new Rectangle( 0, 0, this.placeholder.width + ( challenge.hasShapes ? 20 : challenge.hasMixedTargets ? 60 : 80 ), 100, {
      cornerRadius: CORNER_RADIUS,
      fill: FractionsCommonColors.collectionBackgroundProperty,
      stroke: FractionsCommonColors.collectionBorderProperty
    } );
    this.placeholder.dispose();
    this.placeholder = null;

    // @private {GradientRectangle}
    this.highlight = new GradientRectangle( {
      fill: 'yellow'
    } );
    this.highlight.rectBounds = this.background.bounds.eroded( 5 );
    this.highlight.extension = 0.5;
    this.highlight.margin = 10;
    this.highlightListener = hoveringCount => {
      this.highlight.visible = hoveringCount > 0;
    };
    this.target.hoveringGroups.lengthProperty.link( this.highlightListener );

    // @private {Rectangle}
    this.container = new Node( {
      children: [
        this.highlight,
        this.background
      ]
    } );

    // @private {Vector2}
    this.groupCenter = this.background.center.plusXY( 0, challenge.hasShapes ? 10 : 0 );

    // @private {Node|null}
    this.groupNode = null;

    // @private {Node}
    this.returnButton = new ReturnButton( () => {
      if ( this.groupNode ) {
        challenge.returnTarget( target );
      }
    }, {
      cornerRadius: CORNER_RADIUS - CORNER_OFFSET,
      leftTop: this.background.leftTop.plus( new Vector2( CORNER_OFFSET, CORNER_OFFSET ) )
    } );
    this.returnButton.touchArea = this.returnButton.localBounds.dilated( 12 );
    this.container.addChild( this.returnButton );

    // @private {function}
    this.groupListener = group => {
      this.returnButton.visible = !!group;

      this.groupNode && this.groupNode.dispose();
      this.groupNode = null;

      if ( group ) {
        if ( challenge.hasShapes ) {
          this.groupNode = new ShapeGroupNode( group, {
            isIcon: true,
            hasButtons: false,
            scale: FractionsCommonConstants.SHAPE_COLLECTION_SCALE,
            positioned: false
          } );
        }
        else {
          this.groupNode = new NumberGroupNode( group, {
            isIcon: true,
            hasCardBackground: false,
            scale: FractionsCommonConstants.NUMBER_COLLECTION_SCALE,
            positioned: false
          } );
        }
        this.groupNode.center = this.groupCenter;
        this.container.addChild( this.groupNode );

        if ( this.modelViewTransform ) {
          // Whenever we get a group placed, we need to update the target position so that the subsequent animation
          // goes to the right place.
          target.positionProperty.value = this.modelViewTransform.viewToModelPosition(
            this.groupNode.getUniqueTrailTo( this.parentContainer ).localToGlobalPoint( Vector2.ZERO )
          );
        }
      }
    };
    this.target.groupProperty.link( this.groupListener );

    this.addChild( this.container );

    if ( isShapeTarget ) {
      const scale = challenge.hasMixedTargets ? 0.6 : ( challenge.maxTargetWholes > 1 ? 0.9 : 1 );
      const padding = 10;
      const maxWidth = maxPartitionWidthMap[ scale ];
      const box = new HBox( {
        spacing: padding,
        children: target.filledPartitions.map( filledPartition => new FilledPartitionNode( filledPartition, {
          layoutScale: scale,
          adaptiveScale: true
        } ) )
      } );
      const quantity = target.filledPartitions.length;
      const combinedMaxWidth = maxWidth * quantity + padding * ( quantity - 1 );
      this.addChild( new Node( {
        children: [ box ],
        localBounds: box.localBounds.withMaxX( box.localBounds.minX + combinedMaxWidth )
      } ) );
    }
    else {
      const whole = challenge.hasMixedTargets ? Math.floor( target.fraction.value ) : null;
      const numerator = whole ? target.fraction.minus( new Fraction( whole, 1 ) ).numerator : target.fraction.numerator;
      const denominator = target.fraction.denominator;
      this.addChild( new MixedFractionNode( {
        whole: whole === 0 ? null : whole,
        numerator: numerator === 0 ? ( whole === null ? 0 : null ) : numerator,
        denominator: denominator,
        scale: 1.2
      } ) );
    }
  }

  /**
   * Sets the model positions of our model objects corresponding to their displayed (view) positions.
   * @public
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Node} parentContainer - A parent node that contains this node, and has no transform relative to the
   *                                 screenView.
   */
  updateModelPositions( modelViewTransform, parentContainer ) {
    this.modelViewTransform = modelViewTransform;
    this.parentContainer = parentContainer;

    // Initialize with an approximate position so we can compute the closest target
    this.target.positionProperty.value = modelViewTransform.viewToModelPosition(
      this.container.getUniqueTrailTo( parentContainer ).localToGlobalPoint( this.groupCenter )
    );
  }

  /**
   * Disposes the node
   * @public
   * @override
   */
  dispose() {
    this.target.groupProperty.unlink( this.groupListener );
    this.target.hoveringGroups.lengthProperty.unlink( this.highlightListener );

    this.groupNode && this.groupNode.dispose();
    this.highlight.dispose();
    this.returnButton.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'TargetNode', TargetNode );
export default TargetNode;
