// Copyright 2018-2023, University of Colorado Boulder

/**
 * GQScreenView is the base class for ScreenViews in this sim.
 * It is responsible for creating Nodes that are common to all screens, and for common layout.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GraphContentsToggleButton from '../../../../graphing-lines/js/common/view/GraphContentsToggleButton.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GQModel from '../model/GQModel.js';
import GQViewProperties from './GQViewProperties.js';
import PointToolNode from './PointToolNode.js';

// constants
const X_SPACING = 15; // between graph and control panels

export default class GQScreenView extends ScreenView {

  public constructor( model: GQModel, viewProperties: GQViewProperties, graphNode: Node,
                      equationAccordionBox: Node, graphControlPanel: Node, tandem: Tandem ) {

    super( {
      layoutBounds: GQConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    } );

    // Point tools moveToFront when dragged, so give them a common parent to preserve rendering order.
    const pointToolsParent = new Node();
    pointToolsParent.addChild( new PointToolNode(
      model.leftPointTool,
      model.modelViewTransform,
      model.graph,
      viewProperties.graphContentsVisibleProperty, {
        tandem: tandem.createTandem( 'leftPointToolNode' )
      } ) );
    pointToolsParent.addChild( new PointToolNode(
      model.rightPointTool,
      model.modelViewTransform,
      model.graph,
      viewProperties.graphContentsVisibleProperty, {
        tandem: tandem.createTandem( 'rightPointToolNode' )
      } ) );

    // Toggle button for showing/hiding contents of graph
    const graphContentsToggleButton = new GraphContentsToggleButton( viewProperties.graphContentsVisibleProperty, {
      left: model.modelViewTransform.modelToViewX( model.graph.xRange.max ) + 21,
      bottom: model.modelViewTransform.modelToViewY( model.graph.yRange.min ),
      tandem: tandem.createTandem( 'graphContentsToggleButton' ),
      phetioDocumentation: 'button that shows/hides the contents of the graph'
    } );

    // Set maxWidth for each control panel individually
    const controlPanelMaxWidth = this.layoutBounds.width - graphNode.width - ( 2 * GQConstants.SCREEN_VIEW_X_MARGIN ) - X_SPACING;
    assert && assert( controlPanelMaxWidth > 0, `unexpected controlPanelMaxWidth: ${controlPanelMaxWidth}` );
    equationAccordionBox.maxWidth = controlPanelMaxWidth;
    graphControlPanel.maxWidth = controlPanelMaxWidth;

    // Parent for all control panels, to simplify layout
    const controlsParent = new VBox( {

      // set maxHeight to guard against font size differences across supported browsers
      maxHeight: this.layoutBounds.height - ( 2 * GQConstants.SCREEN_VIEW_Y_MARGIN ),
      resize: false,
      align: 'center',
      spacing: 10,
      children: [
        equationAccordionBox,
        graphControlPanel
      ]
    } );

    // rendering order
    this.addChild( controlsParent );
    this.addChild( graphContentsToggleButton );
    this.addChild( graphNode );
    this.addChild( pointToolsParent );

    // Horizontally center controls in the space to the right of the graph.
    controlsParent.centerX = graphNode.right + X_SPACING + ( controlPanelMaxWidth / 2 );
    controlsParent.top = GQConstants.SCREEN_VIEW_Y_MARGIN;

    // Reset All Button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // interrupt all listeners for this screen
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - GQConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - GQConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' ),
      phetioDocumentation: 'button that resets the screen to its initial state'
    } );
    this.addChild( resetAllButton );
  }
}

graphingQuadratics.register( 'GQScreenView', GQScreenView );