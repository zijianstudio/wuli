// Copyright 2013-2023, University of Colorado Boulder

/**
 * LineFormsGraphNode is the base class graphs in the 'Slope', 'Slope-Intercept' and 'Point-Slope' screens.
 *
 * Displays the following:
 * - one interactive line
 * - slope tool for interactive line
 * - zero or more 'saved' lines
 * - zero or more 'standard' lines
 *
 * Note: All properties of this type should be considered private.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import { Node } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import LineFormsModel from '../model/LineFormsModel.js';
import GraphNode from './GraphNode.js';
import LineNode, { CreateDynamicLabelFunction } from './LineNode.js';
import SlopeToolNode from './SlopeToolNode.js';
import LineFormsViewProperties from './LineFormsViewProperties.js';
import Line from '../model/Line.js';

export default class LineFormsGraphNode extends GraphNode {

  private readonly model: LineFormsModel;
  private readonly viewProperties: LineFormsViewProperties;
  private readonly createDynamicLabel: CreateDynamicLabelFunction;

  // Nodes for each category of line (interactive, standard, saved) to maintain rendering order
  private readonly interactiveLineNode: LineNode;
  private readonly standardLinesParentNode: Node;
  private readonly savedLinesParentNode: Node;

  private readonly slopeToolNode: SlopeToolNode;

  protected constructor( model: LineFormsModel,
                         viewProperties: LineFormsViewProperties,
                         createDynamicLabel: CreateDynamicLabelFunction ) {

    super( model.graph, model.modelViewTransform );

    this.model = model;
    this.viewProperties = viewProperties;
    this.createDynamicLabel = createDynamicLabel;

    this.interactiveLineNode = new LineNode( model.interactiveLineProperty, model.graph, model.modelViewTransform, {
      createDynamicLabel: createDynamicLabel
    } );
    this.standardLinesParentNode = new Node();
    this.savedLinesParentNode = new Node();

    this.slopeToolNode = new SlopeToolNode( model.interactiveLineProperty, model.modelViewTransform );

    // Rendering order. The order of lines should match the order of LineFormsModel.graph.lines.
    this.addChild( this.savedLinesParentNode );
    this.addChild( this.standardLinesParentNode );
    this.addChild( this.interactiveLineNode );
    this.addChild( this.slopeToolNode );

    // Add/remove standard lines
    // remove*Listener not needed because LineFormsGraphNode exists for the lifetime of the sim.
    model.standardLines.addItemAddedListener( this.standardLineAdded.bind( this ) );
    model.standardLines.addItemRemovedListener( this.standardLineRemoved.bind( this ) );

    // Add/remove saved lines
    // remove*Listener not needed because LineFormsGraphNode exists for the lifetime of the sim.
    model.savedLines.addItemAddedListener( this.savedLineAdded.bind( this ) );
    model.savedLines.addItemRemovedListener( this.savedLineRemoved.bind( this ) );

    // Visibility of lines
    // unmultilink is unnecessary since LineFormsGraphNode exists for the lifetime of the sim.
    Multilink.multilink( [ viewProperties.linesVisibleProperty, viewProperties.slopeToolVisibleProperty ],
      this.updateLinesVisibility.bind( this ) );

    // Visibility of the grid
    // unlink is unnecessary since LineFormsGraphNode exists for the lifetime of the sim.
    viewProperties.gridVisibleProperty.link( visible => {
      this.setGridVisible( visible );
    } );

    // Visibility of the equation on the interactive line
    // unlink is unnecessary since LineFormsGraphNode exists for the lifetime of the sim.
    this.viewProperties.interactiveEquationVisibleProperty.link( visible => {
      if ( this.interactiveLineNode ) {
        this.interactiveLineNode.setEquationVisible( visible );
      }
    } );
  }

  // Updates the visibility of lines and associated decorations.
  private updateLinesVisibility(): void {

    const linesVisible = this.viewProperties.linesVisibleProperty.value;

    // interactive line
    this.interactiveLineNode.visible = linesVisible;

    // saved & standard lines
    this.savedLinesParentNode.visible = linesVisible;
    this.standardLinesParentNode.visible = linesVisible;

    // slope tool
    this.slopeToolNode.visible = ( this.viewProperties.slopeToolVisibleProperty.value && linesVisible );
  }

  // Called when a standard line is added to the model.
  private standardLineAdded( line: Line ): void {
    const lineNode = new LineNode( new Property( line ), this.model.graph, this.model.modelViewTransform, {
      createDynamicLabel: this.createDynamicLabel
    } );
    this.standardLinesParentNode.addChild( lineNode );
  }

  // Called when a standard line is removed from the model.
  private standardLineRemoved( line: Line ): void {
    this.removeLineNode( line, this.standardLinesParentNode );
  }

  // Called when a saved line is added to the model.
  private savedLineAdded( line: Line ): void {
    const lineNode = new LineNode( new Property( line ), this.model.graph, this.model.modelViewTransform, {
      createDynamicLabel: this.createDynamicLabel
    } );
    this.savedLinesParentNode.addChild( lineNode );
  }

  // Called when a saved line is removed from the model.
  private savedLineRemoved( line: Line ): void {
    this.removeLineNode( line, this.savedLinesParentNode );
  }

  // Removes the LineNode that corresponds to the specified Line.
  private removeLineNode( line: Line, parentNode: Node ): void {
    let removed = false;
    for ( let i = 0; i < parentNode.getChildrenCount() && !removed; i++ ) {
      const node = parentNode.getChildAt( i ) as LineNode;
      assert && assert( node instanceof LineNode ); // eslint-disable-line no-simple-type-checking-assertions
      if ( line === node.lineProperty.value ) {
        parentNode.removeChild( node );
        node.dispose();
        removed = true;
      }
    }
    assert && assert( removed, `no Node found for line ${line.toString()}` );
  }
}

graphingLines.register( 'LineFormsGraphNode', LineFormsGraphNode );