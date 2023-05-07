// Copyright 2020-2022, University of Colorado Boulder

/**
 * The view for the 'Two Dimensions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Franco Barpp Gomes (UTFPR)
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
import NormalModesControlPanel from '../../common/view/NormalModesControlPanel.js';
import SpringNode from '../../common/view/SpringNode.js';
import normalModes from '../../normalModes.js';
import MassNode2D from './MassNode2D.js';
import NormalModeAmplitudesAccordionBox from './NormalModeAmplitudesAccordionBox.js';

class TwoDimensionsScreenView extends ScreenView {

  /**
   * @param {TwoDimensionsModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // TODO https://github.com/phetsims/normal-modes/issues/38 magic numbers
    // The center point of borderWalls
    const viewOrigin = new Vector2(
      ( this.layoutBounds.maxX - 420 ) / 2,
      ( this.layoutBounds.maxY ) / 2
    );

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      viewOrigin,
      ( this.layoutBounds.maxX - 2 * NormalModesConstants.SCREEN_VIEW_X_MARGIN - 420 ) / 2
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
      yMargin: 8,
      numberOfMassesFormatter: value => Math.pow( value, 2 ) // See https://github.com/phetsims/normal-modes/issues/69
    }, NormalModesColors.PANEL_COLORS ) );

    // Springs
    const xSpringNodes = [];
    model.springsX.forEach( springArray => {
      springArray.forEach( spring => {
        const springNode = new SpringNode(
          spring, modelViewTransform, model.springsVisibleProperty, options.tandem.createTandem( 'springNodes' )
        );
        xSpringNodes.push( springNode );
      } );
    } );
    const ySpringNodes = [];
    model.springsY.forEach( springArray => {
      springArray.forEach( spring => {
        const springNode = new SpringNode(
          spring, modelViewTransform, model.springsVisibleProperty, options.tandem.createTandem( 'springNodes' )
        );
        ySpringNodes.push( springNode );
      } );
    } );
    const springNodesParent = new Node( {
      children: [ ...xSpringNodes, ...ySpringNodes ]
    } );

    // Walls (box)
    const topLeftPoint = modelViewTransform.modelToViewPosition( new Vector2( -1, 1 ) );
    const bottomRightPoint = modelViewTransform.modelToViewPosition( new Vector2( 1, -1 ) );
    const borderWalls = new Rectangle(
      new Bounds2( topLeftPoint.x, topLeftPoint.y, bottomRightPoint.x, bottomRightPoint.y ), {
        stroke: NormalModesColors.WALL_COLORS.stroke,
        lineWidth: 2
      } );

    // Normal Mode Amplitudes accordion box
    const normalModeAmplitudesAccordionBox = new NormalModeAmplitudesAccordionBox( model, merge( {
      right: controlPanel.right,
      bottom: borderWalls.bottom,
      cornerRadius: 5
    }, NormalModesColors.PANEL_COLORS ) );

    // Drag bounds for the masses is defined by borderWalls.
    // See https://github.com/phetsims/normal-modes/issues/68
    const massDragBounds = modelViewTransform.viewToModelBounds( borderWalls.bounds );

    // Masses - use slice to ignore the virtual stationary masses at the walls
    const massNodes = [];
    model.masses.slice( 1, model.masses.length - 1 ).forEach( massArray => {
      massArray.slice( 1, massArray.length - 1 ).forEach( mass => {
        const massNode = new MassNode2D( mass, modelViewTransform, model, massDragBounds, options.tandem.createTandem( 'massNodes' ) );
        massNodes.push( massNode );
      } );
    } );
    const massNodesParent = new Node( {
      children: massNodes
    } );

    const screenViewRootNode = new Node( {
      children: [
        controlPanel,
        normalModeAmplitudesAccordionBox,
        resetAllButton,
        springNodesParent,
        borderWalls,
        massNodesParent
      ]
    } );
    this.addChild( screenViewRootNode );

    // When the number of masses is changed, interrupt any dragging that may be in progress.
    model.numberOfMassesProperty.link( numberOfMasses => {
      massNodesParent.interruptSubtreeInput();
    } );

    const resetView = () => {
      normalModeAmplitudesAccordionBox.expandedProperty.reset();
    };
  }
}

normalModes.register( 'TwoDimensionsScreenView', TwoDimensionsScreenView );
export default TwoDimensionsScreenView;