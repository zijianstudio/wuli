// Copyright 2013-2022, University of Colorado Boulder

/**
 * Container for all components related to the graph feature.
 * It has an expand/collapse bar at the top of it, and can switch between 'concentration' and 'quantity'.
 * Logarithmic graph is the standard scale. Interactivity and a linear scale are optional.
 * Origin is at top-left of the expand/collapse bar.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import { Line, Node, NodeOptions } from '../../../../../scenery/js/imports.js';
import phScale from '../../../phScale.js';
import SolutionDerivedProperties from '../../model/SolutionDerivedProperties.js';
import GraphControlPanel from './GraphControlPanel.js';
import GraphScale from './GraphScale.js';
import GraphScaleSwitch from './GraphScaleSwitch.js';
import GraphUnits from './GraphUnits.js';
import LinearGraphNode from './LinearGraphNode.js';
import LogarithmicGraphNode, { LogarithmicGraphNodeOptions } from './LogarithmicGraphNode.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import optionize from '../../../../../phet-core/js/optionize.js';

type SelfOptions = {
  logScaleHeight?: number;
  linearScaleHeight?: number;
  units?: GraphUnits; // initial state of the units switch
  hasLinearFeature?: boolean; // add the linear graph feature?
  graphScale?: GraphScale; // initial state of the scale switch, meaningful only if hasLinearFeature === true
} & PickRequired<LogarithmicGraphNodeOptions, 'pHProperty'>;

type GraphNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class GraphNode extends Node {

  private readonly resetGraphNode: () => void;

  public constructor( totalVolumeProperty: TReadOnlyProperty<number>,
                      derivedProperties: SolutionDerivedProperties,
                      providedOptions: GraphNodeOptions ) {

    const options = optionize<GraphNodeOptions, SelfOptions, NodeOptions>()( {
      logScaleHeight: 500,
      linearScaleHeight: 500,
      units: GraphUnits.MOLES_PER_LITER,
      hasLinearFeature: false,
      graphScale: GraphScale.LOGARITHMIC
    }, providedOptions );

    super();

    const pdomOrder = [];

    // whether the graph is expanded or collapsed
    const expandedProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'expandedProperty' )
    } );

    // units used for the graph
    const graphUnitsProperty = new EnumerationProperty( options.units, {
      tandem: options.tandem.createTandem( 'graphUnitsProperty' )
    } );

    // control panel above the graph
    const graphControlPanel = new GraphControlPanel( graphUnitsProperty, expandedProperty, {
      tandem: options.tandem.createTandem( 'graphControlPanel' )
    } );
    this.addChild( graphControlPanel );
    pdomOrder.push( graphControlPanel );

    // vertical line that connects bottom of graphControlPanel to top of graph
    const lineToPanel = new Line( 0, 0, 0, 75, { stroke: 'black' } );
    graphControlPanel.visibleProperty.lazyLink( () => {
      lineToPanel.visible = graphControlPanel.visible;
    } );

    // logarithmic graph
    const logarithmicGraphNode = new LogarithmicGraphNode( totalVolumeProperty, derivedProperties, graphUnitsProperty, {
      pHProperty: options.pHProperty,
      scaleHeight: options.logScaleHeight,
      centerX: lineToPanel.centerX,
      y: 30, // y, not top
      tandem: options.tandem.createTandem( 'logarithmicGraphNode' )
    } );

    // parent for things whose visibility will be controlled by expandProperty
    const parentNode = new Node( {
      children: [ lineToPanel, logarithmicGraphNode ],
      centerX: graphControlPanel.centerX,
      y: graphControlPanel.bottom // y, not top
    } );
    this.addChild( parentNode );

    // controls the visibility of parentNode
    expandedProperty.link( expanded => {
      parentNode.visible = expanded;
    } );

    // optional linear graph
    let linearGraphNode: LinearGraphNode;
    let graphScaleProperty: EnumerationProperty<GraphScale>;
    if ( options.hasLinearFeature ) {

      // scale (log, linear) of the graph
      graphScaleProperty = new EnumerationProperty( options.graphScale, {
        tandem: options.tandem.createTandem( 'graphScaleProperty' )
      } );

      // linear graph
      linearGraphNode = new LinearGraphNode( derivedProperties, graphUnitsProperty, {
        scaleHeight: options.linearScaleHeight,
        y: logarithmicGraphNode.y, // y, not top
        centerX: logarithmicGraphNode.centerX,
        tandem: options.tandem.createTandem( 'linearGraphNode' )
      } );

      // scale switch (Logarithmic vs Linear)
      const graphScaleSwitch = new GraphScaleSwitch( graphScaleProperty, {
        tandem: options.tandem.createTandem( 'graphScaleSwitch' )
      } );
      graphScaleSwitch.boundsProperty.link( bounds => {
        graphScaleSwitch.centerX = lineToPanel.centerX;
        graphScaleSwitch.top = linearGraphNode.bottom + 15;
      } );
      pdomOrder.push( graphScaleSwitch );
      pdomOrder.push( linearGraphNode );

      // vertical line that connects bottom of graph to top of scale switch
      const lineToSwitchNode = new Line( 0, 0, 0, 200, {
        stroke: 'black',
        centerX: lineToPanel.centerX,
        bottom: graphScaleSwitch.top + 1
      } );

      graphScaleSwitch.visibleProperty.lazyLink( () => {
        lineToSwitchNode.visible = graphScaleSwitch.visible;
      } );

      // add everything to parentNode, since their visibility is controlled by expandedProperty
      parentNode.addChild( lineToSwitchNode );
      lineToSwitchNode.moveToBack();
      parentNode.addChild( linearGraphNode );
      parentNode.addChild( graphScaleSwitch );

      // handle scale changes
      graphScaleProperty.link( graphScale => {
        logarithmicGraphNode.visible = ( graphScale === GraphScale.LOGARITHMIC );
        linearGraphNode.visible = ( graphScale === GraphScale.LINEAR );
      } );
    }
    pdomOrder.push( logarithmicGraphNode );

    this.mutate( options );

    this.resetGraphNode = () => {
      expandedProperty.reset();
      graphUnitsProperty.reset();
      graphScaleProperty && graphScaleProperty.reset();
      linearGraphNode && linearGraphNode.reset();
    };

    // Link to concentration Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement( derivedProperties.concentrationH2OProperty, {
      tandem: options.tandem.createTandem( 'concentrationH2OProperty' )
    } );
    this.addLinkedElement( derivedProperties.concentrationH3OProperty, {
      tandem: options.tandem.createTandem( 'concentrationH3OProperty' )
    } );
    this.addLinkedElement( derivedProperties.concentrationOHProperty, {
      tandem: options.tandem.createTandem( 'concentrationOHProperty' )
    } );

    // Link to quantity Properties, see https://github.com/phetsims/ph-scale/issues/125
    this.addLinkedElement( derivedProperties.quantityH2OProperty, {
      tandem: options.tandem.createTandem( 'quantityH2OProperty' )
    } );
    this.addLinkedElement( derivedProperties.quantityH3OProperty, {
      tandem: options.tandem.createTandem( 'quantityH3OProperty' )
    } );
    this.addLinkedElement( derivedProperties.quantityOHProperty, {
      tandem: options.tandem.createTandem( 'quantityOHProperty' )
    } );

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    this.pdomOrder = pdomOrder;
  }

  public reset(): void {
    this.resetGraphNode();
  }
}

phScale.register( 'GraphNode', GraphNode );