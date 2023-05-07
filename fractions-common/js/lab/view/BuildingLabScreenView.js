// Copyright 2018-2022, University of Colorado Boulder

/**
 * ScreenView for the "Lab" screen of Build a Fraction
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { AlignBox, HBox } from '../../../../scenery/js/imports.js';
import BuildingRepresentation from '../../building/model/BuildingRepresentation.js';
import NumberGroup from '../../building/model/NumberGroup.js';
import NumberGroupStack from '../../building/model/NumberGroupStack.js';
import NumberPiece from '../../building/model/NumberPiece.js';
import NumberStack from '../../building/model/NumberStack.js';
import ShapeGroup from '../../building/model/ShapeGroup.js';
import ShapeGroupStack from '../../building/model/ShapeGroupStack.js';
import ShapePiece from '../../building/model/ShapePiece.js';
import ShapeStack from '../../building/model/ShapeStack.js';
import NumberGroupNode from '../../building/view/NumberGroupNode.js';
import ShapeGroupNode from '../../building/view/ShapeGroupNode.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonGlobals from '../../common/FractionsCommonGlobals.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import BuildingLabLayerNode from './BuildingLabLayerNode.js';
import LabNumberPanel from './LabNumberPanel.js';
import LabShapePanel from './LabShapePanel.js';

// constants
const PANEL_MARGIN = FractionsCommonConstants.PANEL_MARGIN;

class BuildingLabScreenView extends ScreenView {
  /**
   * @param {BuildingLabModel} model
   */
  constructor( model ) {
    super();

    // @private
    this.model = model;

    // @public {ModelViewTransform2}
    this.modelViewTransform = new ModelViewTransform2( Matrix3.translationFromVector( this.layoutBounds.center ) );

    // @private {Property.<Bounds2>}
    this.shapeDragBoundsProperty = new Property( this.visibleBounds );
    this.numberDragBoundsProperty = new Property( this.visibleBounds );

    // @private {Node}
    this.shapePanel = new LabShapePanel( model, ( event, stack ) => {
      const modelPoint = this.modelViewTransform.viewToModelPosition( this.globalToLocalPoint( event.pointer.point ) );
      if ( stack instanceof ShapeStack ) {
        const shapePiece = new ShapePiece( stack.fraction, stack.representation, stack.color );
        shapePiece.positionProperty.value = modelPoint;
        model.dragShapePieceFromStack( shapePiece );
        const shapePieceNode = this.layerNode.getShapePieceNode( shapePiece );
        shapePieceNode.dragListener.press( event, shapePieceNode );
      }
      else if ( stack instanceof ShapeGroupStack ) {
        const shapeGroup = model.addShapeGroup( stack.representation );
        shapeGroup.positionProperty.value = modelPoint;
        const shapeGroupNode = this.layerNode.getShapeGroupNode( shapeGroup );
        shapeGroupNode.dragListener.press( event, shapeGroupNode );
      }
      else {
        throw new Error( 'unknown stack type' );
      }
    } );

    // @private {Node}
    this.numberPanel = new LabNumberPanel( model, ( event, stack ) => {
      const modelPoint = this.modelViewTransform.viewToModelPosition( this.globalToLocalPoint( event.pointer.point ) );
      if ( stack instanceof NumberStack ) {
        const numberPiece = new NumberPiece( stack.number );
        numberPiece.positionProperty.value = modelPoint;
        model.dragNumberPieceFromStack( numberPiece );
        const numberPieceNode = this.layerNode.getNumberPieceNode( numberPiece );
        numberPieceNode.dragListener.press( event, numberPieceNode );
      }
      else if ( stack instanceof NumberGroupStack ) {
        const numberGroup = model.addNumberGroup( stack.isMixedNumber );
        numberGroup.positionProperty.value = modelPoint;
        const numberGroupNode = this.layerNode.getNumberGroupNode( numberGroup );
        numberGroupNode.dragListener.press( event, numberGroupNode );
      }
      else {
        throw new Error( 'unknown stack type' );
      }
    } );

    phet.joist.display.addInputListener( {
      down: event => {
        const screen = phet.joist.sim.selectedScreenProperty.value;
        if ( screen && screen.view === this ) {

          const isActive = this.layerNode.activePointerProperty.value === event.pointer;

          // See if our press was a "miss" (trail length 1) or a hit on our screen (screen.view in the trail).
          // We really want to exclude home-screen clicks so that things start focused.
          const doesTrailMatch = _.includes( event.trail.nodes, screen.view ) || event.trail.length <= 1;

          if ( !isActive && doesTrailMatch ) {
            // Any event on a shape group should handle it.
            model.selectedGroupProperty.value = null;
          }
        }
      }
    } );

    // @private {Node}
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      }
    } );

    const topAlignBox = new AlignBox( this.shapePanel, {
      xAlign: 'center',
      yAlign: 'top',
      margin: PANEL_MARGIN
    } );

    const bottomAlignBox = new AlignBox( this.numberPanel, {
      xAlign: 'center',
      yAlign: 'bottom',
      margin: PANEL_MARGIN
    } );

    const bottomRightAlignBox = new AlignBox( resetAllButton, {
      xAlign: 'right',
      yAlign: 'bottom',
      margin: PANEL_MARGIN
    } );

    // dynamic layout
    this.visibleBoundsProperty.link( visibleBounds => {
      topAlignBox.alignBounds = visibleBounds;
      bottomAlignBox.alignBounds = visibleBounds;
      // Don't compensate for the right side expanding out, see https://github.com/phetsims/fractions-common/issues/51
      bottomRightAlignBox.alignBounds = visibleBounds.withMaxX( this.layoutBounds.right );
      this.shapePanel.updateModelPositions( this.modelViewTransform );
      this.numberPanel.updateModelPositions( this.modelViewTransform );

      this.shapeDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds( new Bounds2(
        visibleBounds.left,
        visibleBounds.top,
        visibleBounds.right,
        this.numberPanel.top
      ) );
      this.numberDragBoundsProperty.value = this.modelViewTransform.viewToModelBounds( new Bounds2(
        visibleBounds.left,
        this.shapePanel.bottom,
        visibleBounds.right,
        visibleBounds.bottom
      ) );
    } );

    // @private {BuildingLabLayerNode}
    this.layerNode = new BuildingLabLayerNode( model, this.modelViewTransform, this.shapeDragBoundsProperty, this.numberDragBoundsProperty, this.shapePanel, this.numberPanel );

    this.children = [
      bottomRightAlignBox,
      topAlignBox,
      bottomAlignBox,
      this.layerNode
    ];
  }

  /**
   * Creates the icon for the unmixed lab screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenIcon() {

    const numberGroup = new NumberGroup( false );
    numberGroup.numeratorSpot.pieceProperty.value = new NumberPiece( 7 );
    numberGroup.denominatorSpot.pieceProperty.value = new NumberPiece( 8 );

    const numberGroupNode = new NumberGroupNode( numberGroup, {
      isIcon: true,
      positioned: false,
      scale: 0.8
    } );

    const shapeGroup = new ShapeGroup( BuildingRepresentation.PIE );
    [
      new Fraction( 1, 2 ),
      new Fraction( 1, 4 ),
      new Fraction( 1, 8 )
    ].forEach( fraction => {
      shapeGroup.shapeContainers.get( 0 ).shapePieces.push( new ShapePiece( fraction, BuildingRepresentation.PIE, FractionsCommonColors.shapeRedProperty ) );
    } );

    const shapeGroupNode = new ShapeGroupNode( shapeGroup, {
      hasButtons: false,
      isIcon: true,
      positioned: false
    } );

    return FractionsCommonGlobals.wrapIcon( new HBox( {
      spacing: 20,
      children: [
        numberGroupNode,
        shapeGroupNode
      ],
      scale: 2.3
    } ), FractionsCommonColors.otherScreenBackgroundProperty );
  }

  /**
   * Creates the icon for the mixed lab screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenIcon() {

    const shapeGroup = new ShapeGroup( BuildingRepresentation.PIE );
    shapeGroup.increaseContainerCount();
    shapeGroup.shapeContainers.get( 0 ).shapePieces.push( new ShapePiece( Fraction.ONE, BuildingRepresentation.PIE, FractionsCommonColors.shapeRedProperty ) );
    [
      new Fraction( 1, 2 ),
      new Fraction( 1, 4 ),
      new Fraction( 1, 8 )
    ].forEach( fraction => {
      shapeGroup.shapeContainers.get( 1 ).shapePieces.push( new ShapePiece( fraction, BuildingRepresentation.PIE, FractionsCommonColors.shapeRedProperty ) );
    } );

    const shapeGroupNode = new ShapeGroupNode( shapeGroup, {
      hasButtons: false,
      isIcon: true,
      positioned: false,
      scale: 2.1
    } );

    return FractionsCommonGlobals.wrapIcon( shapeGroupNode, FractionsCommonColors.otherScreenBackgroundProperty );
  }
}

fractionsCommon.register( 'BuildingLabScreenView', BuildingLabScreenView );
export default BuildingLabScreenView;
