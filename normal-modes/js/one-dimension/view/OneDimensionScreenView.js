// Copyright 2020-2022, University of Colorado Boulder

/**
 * The view for the 'One Dimension' Screen.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NormalModesColors from '../../common/NormalModesColors.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import NormalModesQueryParameters from '../../common/NormalModesQueryParameters.js';
import NormalModesControlPanel from '../../common/view/NormalModesControlPanel.js';
import SpringNode from '../../common/view/SpringNode.js';
import normalModes from '../../normalModes.js';
import MassNode1D from './MassNode1D.js';
import NormalModesAccordionBox from './NormalModesAccordionBox.js';
import NormalModeSpectrumAccordionBox from './NormalModeSpectrumAccordionBox.js';
import WallNode from './WallNode.js';

// constants
const VIEW_SPRING_WIDTH = 745; // width of the spring, in view coordinates

class OneDimensionScreenView extends ScreenView {

  /**
   * @param {OneDimensionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // TODO https://github.com/phetsims/normal-modes/issues/38 magic numbers
    // The midpoint between leftWall and rightWall
    const viewOrigin = new Vector2(
      VIEW_SPRING_WIDTH / 2 + NormalModesConstants.SCREEN_VIEW_X_MARGIN + 4,
      ( this.layoutBounds.maxY - 300 ) / 2
    );

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewOrigin, VIEW_SPRING_WIDTH / 2
    );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        resetView();
      },
      right: this.layoutBounds.maxX - NormalModesConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NormalModesConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );

    // Untitled control panel
    const controlPanel = new NormalModesControlPanel( model, merge( {
      right: this.layoutBounds.maxX - NormalModesConstants.SCREEN_VIEW_X_MARGIN - resetAllButton.width - 10,
      top: NormalModesConstants.SCREEN_VIEW_Y_MARGIN,
      cornerRadius: 5,
      xMargin: 8,
      yMargin: 8
    }, NormalModesColors.PANEL_COLORS ) );

    // Normal Mode Spectrum accordion box
    const normalModeSpectrumAccordionBox = new NormalModeSpectrumAccordionBox( model, merge( {
      bottom: this.layoutBounds.maxY - NormalModesConstants.SCREEN_VIEW_Y_MARGIN,
      cornerRadius: 5,
      centerX: viewOrigin.x
    }, NormalModesColors.PANEL_COLORS ) );

    // Springs
    const springNodesParent = new Node( {
      children: model.springs.map( spring => new SpringNode(
        spring, modelViewTransform, model.springsVisibleProperty, options.tandem.createTandem( 'springNodes' )
      ) )
    } );

    // Left and right walls
    const leftWallNode = new WallNode(
      model.masses[ 0 ], modelViewTransform, options.tandem.createTandem( 'leftWallNode' )
    );
    const rightWallNode = new WallNode(
      model.masses[ model.masses.length - 1 ], modelViewTransform, options.tandem.createTandem( 'rightWallNode' )
    );

    // Drag bounds for the masses, centered on the walls. Height is adjustable via ?dragBoundsHeight1D.
    // See https://github.com/phetsims/normal-modes/issues/68
    const dragBoundsView = new Bounds2(
      leftWallNode.right,
      leftWallNode.centerY - NormalModesQueryParameters.dragBoundsHeight1D / 2,
      rightWallNode.left,
      leftWallNode.centerY + NormalModesQueryParameters.dragBoundsHeight1D / 2
    );
    const dragBoundsModel = modelViewTransform.viewToModelBounds( dragBoundsView );

    // Masses - use slice to ignore the virtual stationary masses at the walls
    const massNodesParent = new Node( {
      children: model.masses
        .slice( 1, model.masses.length - 1 )
        .map( mass =>
          new MassNode1D( mass, modelViewTransform, model, dragBoundsModel, options.tandem.createTandem( 'massNodes' ) ) )
    } );

    // Normal Modes accordion box
    const normalModesAccordionBox = new NormalModesAccordionBox( model, merge( {
      top: controlPanel.bottom + 8,
      right: this.layoutBounds.maxX - NormalModesConstants.SCREEN_VIEW_X_MARGIN - resetAllButton.width - 10
    }, NormalModesColors.PANEL_COLORS ) );

    const screenViewRootNode = new Node( {
      children: [
        controlPanel,
        normalModesAccordionBox,
        normalModeSpectrumAccordionBox,
        resetAllButton,
        springNodesParent,
        leftWallNode,
        rightWallNode,
        massNodesParent
      ]
    } );
    this.addChild( screenViewRootNode );

    // Render the drag bounds
    if ( NormalModesQueryParameters.showDragBounds1D ) {
      console.log( 'drawing drag bounds' );
      this.addChild( new Rectangle( dragBoundsView, {
        stroke: 'red'
      } ) );
    }

    // When the number of masses is changed, interrupt any dragging that may be in progress.
    model.numberOfMassesProperty.link( numberOfMasses => {
      massNodesParent.interruptSubtreeInput();
    } );

    const resetView = () => {
      normalModeSpectrumAccordionBox.expandedProperty.reset();
      normalModesAccordionBox.expandedProperty.reset();
    };
  }
}

normalModes.register( 'OneDimensionScreenView', OneDimensionScreenView );
export default OneDimensionScreenView;