// Copyright 2014-2021, University of Colorado Boulder

/**
 * View for the 'Explore' screen of the Area Builder simulation.
 *
 * @author John Blanco
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderQueryParameters from '../../common/AreaBuilderQueryParameters.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import AreaBuilderControlPanel from '../../common/view/AreaBuilderControlPanel.js';
import BoardDisplayModePanel from './BoardDisplayModePanel.js';
import ExploreNode from './ExploreNode.js';

// constants
const SPACE_AROUND_SHAPE_PLACEMENT_BOARD = AreaBuilderSharedConstants.CONTROLS_INSET;

class AreaBuilderExploreView extends ScreenView {

  /**
   * @param {AreaBuilderExploreModel} model
   */
  constructor( model ) {

    super( { layoutBounds: AreaBuilderSharedConstants.LAYOUT_BOUNDS } );

    // Create the layers where the shapes will be placed.  The shapes are maintained in separate layers so that they
    // are over all of the shape placement boards in the z-order.
    const movableShapesLayer = new Node( { layerSplit: true } ); // Force the moving shape into a separate layer for improved performance.
    const singleBoardShapesLayer = new Node();
    movableShapesLayer.addChild( singleBoardShapesLayer );
    const dualBoardShapesLayer = new Node();
    movableShapesLayer.addChild( dualBoardShapesLayer );

    // Create the composite nodes that contain the shape placement board, the readout, the bucket, the shape creator
    // nodes, and the eraser button.
    const centerExploreNode = new ExploreNode(
      model.singleShapePlacementBoard,
      model.addUserCreatedMovableShape.bind( model ),
      model.movableShapes, model.singleModeBucket,
      {
        shapesLayer: singleBoardShapesLayer,
        shapeDragBounds: this.layoutBounds
      }
    );
    this.addChild( centerExploreNode );
    const leftExploreNode = new ExploreNode(
      model.leftShapePlacementBoard,
      model.addUserCreatedMovableShape.bind( model ),
      model.movableShapes,
      model.leftBucket,
      {
        shapesLayer: dualBoardShapesLayer,
        shapeDragBounds: this.layoutBounds
      }
    );
    this.addChild( leftExploreNode );
    const rightExploreNode = new ExploreNode(
      model.rightShapePlacementBoard,
      model.addUserCreatedMovableShape.bind( model ),
      model.movableShapes,
      model.rightBucket,
      {
        shapesLayer: dualBoardShapesLayer,
        shapeDragBounds: this.layoutBounds
      }
    );
    this.addChild( rightExploreNode );

    // Control which board(s), bucket(s), and shapes are visible.
    model.boardDisplayModeProperty.link( boardDisplayMode => {
      centerExploreNode.visible = boardDisplayMode === 'single';
      singleBoardShapesLayer.pickable = boardDisplayMode === 'single';
      leftExploreNode.visible = boardDisplayMode === 'dual';
      rightExploreNode.visible = boardDisplayMode === 'dual';
      dualBoardShapesLayer.pickable = boardDisplayMode === 'dual';
    } );

    // Create and add the panel that contains the ABSwitch.
    const switchPanel = new BoardDisplayModePanel( model.boardDisplayModeProperty );
    this.addChild( switchPanel );

    // Create and add the common control panel.
    const controlPanel = new AreaBuilderControlPanel( model.showShapeBoardGridsProperty, model.showDimensionsProperty );
    this.addChild( controlPanel );

    // Add the reset button.
    this.addChild( new ResetAllButton( {
      radius: AreaBuilderSharedConstants.RESET_BUTTON_RADIUS,
      right: this.layoutBounds.width - AreaBuilderSharedConstants.CONTROLS_INSET,
      bottom: this.layoutBounds.height - AreaBuilderSharedConstants.CONTROLS_INSET,
      listener: () => {
        this.interruptSubtreeInput();
        centerExploreNode.reset();
        leftExploreNode.reset();
        rightExploreNode.reset();
        model.reset();
      }
    } ) );

    // Add the layers where the movable shapes reside.
    this.addChild( movableShapesLayer );

    // Perform final layout adjustments
    const centerBoardBounds = model.singleShapePlacementBoard.bounds;
    controlPanel.top = centerBoardBounds.maxY + SPACE_AROUND_SHAPE_PLACEMENT_BOARD;
    controlPanel.left = centerBoardBounds.minX;
    switchPanel.top = centerBoardBounds.maxY + SPACE_AROUND_SHAPE_PLACEMENT_BOARD;
    switchPanel.right = centerBoardBounds.maxX;

    // If the appropriate query parameter is set, fill the boards.  This is useful for debugging.
    if ( AreaBuilderQueryParameters.prefillBoards ) {
      model.fillBoards();
    }
  }
}

areaBuilder.register( 'AreaBuilderExploreView', AreaBuilderExploreView );
export default AreaBuilderExploreView;