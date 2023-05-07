// Copyright 2013-2023, University of Colorado Boulder

/**
 * Base ScreenView for the various screens that deal with line forms (Slope, Slope-Intercept, Point-Slope).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import GLConstants from '../GLConstants.js';
import LineFormsModel from '../model/LineFormsModel.js';
import GraphContentsToggleButton from './GraphContentsToggleButton.js';
import PointToolNode from './PointToolNode.js';
import LineFormsViewProperties from './LineFormsViewProperties.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class LineFormsScreenView extends ScreenView {

  private readonly viewProperties: LineFormsViewProperties;

  public constructor( model: LineFormsModel, viewProperties: LineFormsViewProperties,
                      graphNode: Node, graphControlPanel: Node, equationAccordionBox: Node,
                      tandem: Tandem ) {

    super( {
      layoutBounds: GLConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      tandem: tandem
    } );

    this.viewProperties = viewProperties;

    // Create point tool nodes
    const pointTool1 = new PointToolNode( model.pointTool1, model.modelViewTransform, model.graph, viewProperties.linesVisibleProperty );
    const pointTool2 = new PointToolNode( model.pointTool2, model.modelViewTransform, model.graph, viewProperties.linesVisibleProperty );
    const pointToolParent = new Node(); // Point tools moveToFront when dragged, so we give them a common parent to preserve rendering order.
    pointToolParent.addChild( pointTool1 );
    pointToolParent.addChild( pointTool2 );

    // Toggle button for showing/hiding contents of graph
    const graphContentsToggleButton = new GraphContentsToggleButton( viewProperties.linesVisibleProperty );

    // Reset All button, at bottom-right
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      scale: GLConstants.RESET_ALL_BUTTON_SCALE
    } );
    resetAllButton.right = this.layoutBounds.width - GLConstants.SCREEN_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.height - GLConstants.SCREEN_Y_MARGIN;

    // Parent for all controls, to simplify layout
    const controlsParent = new Node();
    controlsParent.addChild( equationAccordionBox );
    controlsParent.addChild( graphControlPanel );

    // rendering order
    this.addChild( controlsParent );
    this.addChild( graphContentsToggleButton );
    this.addChild( graphNode );
    this.addChild( pointToolParent );
    this.addChild( resetAllButton );

    // layout - position of graphNode is determined by model

    // position of control panels:
    const xMargin = 10;
    const yMargin = 20;
    const ySpacing = 15;

    // get the amount of canvas width that's available for the control panels
    const availableControlPanelWidth = this.layoutBounds.width - graphNode.right - ( 2 * xMargin );

    // if either control panel is too wide, scale it
    if ( equationAccordionBox.width > availableControlPanelWidth ) {
      equationAccordionBox.setScaleMagnitude( availableControlPanelWidth / equationAccordionBox.width );
    }
    if ( graphControlPanel.width > availableControlPanelWidth ) {
      graphControlPanel.setScaleMagnitude( availableControlPanelWidth / graphControlPanel.width );
    }

    // vertically stack controls, horizontally align centers
    equationAccordionBox.centerX = availableControlPanelWidth / 2;
    equationAccordionBox.y = 0;
    graphControlPanel.centerX = equationAccordionBox.centerX;
    graphControlPanel.top = equationAccordionBox.bottom + ySpacing;

    // center controls in the space to the right of the graph
    controlsParent.centerX = graphNode.right + xMargin + ( availableControlPanelWidth / 2 );
    controlsParent.top = yMargin;

    // graphContentsToggleButton at lower right of graph
    graphContentsToggleButton.left = model.modelViewTransform.modelToViewX( model.graph.xRange.max ) + 21;
    graphContentsToggleButton.bottom = model.modelViewTransform.modelToViewY( model.graph.yRange.min );
  }
}

graphingLines.register( 'LineFormsScreenView', LineFormsScreenView );