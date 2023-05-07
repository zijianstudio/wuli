// Copyright 2020-2022, University of Colorado Boulder

/**
 * GraphControlPanel is the control panel that appears above the graph.  It contains controls to collapse the graph,
 * and change units.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../../axon/js/Property.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';
import { Node, Rectangle } from '../../../../../scenery/js/imports.js';
import ExpandCollapseButton, { ExpandCollapseButtonOptions } from '../../../../../sun/js/ExpandCollapseButton.js';
import Panel, { PanelOptions } from '../../../../../sun/js/Panel.js';
import phScale from '../../../phScale.js';
import PHScaleColors from '../../PHScaleColors.js';
import PHScaleConstants from '../../PHScaleConstants.js';
import GraphUnits from './GraphUnits.js';
import GraphUnitsSwitch from './GraphUnitsSwitch.js';

const MIN_HEIGHT = 50;

type SelfOptions = EmptySelfOptions;

type GraphControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class GraphControlPanel extends Panel {

  public constructor( graphUnitsProperty: EnumerationProperty<GraphUnits>,
                      expandedProperty: Property<boolean>,
                      providedOptions: GraphControlPanelOptions ) {

    const options = optionize<GraphControlPanelOptions, SelfOptions, PanelOptions>()( {

      // PanelOptions
      fill: PHScaleColors.PANEL_FILL,
      lineWidth: 2,
      cornerRadius: 6,
      xMargin: 8,
      yMargin: 8,
      minWidth: 330,
      align: 'right',
      phetioDocumentation: 'control panel that appears above the graph'
    }, providedOptions );

    // Invisible rectangle, for layout of switch and button.
    const rectangle = new Rectangle( 0, 0, options.minWidth, MIN_HEIGHT );

    const graphUnitsSwitch = new GraphUnitsSwitch( graphUnitsProperty, {
      tandem: options.tandem.createTandem( 'graphUnitsSwitch' )
    } );
    graphUnitsSwitch.boundsProperty.link( bounds => {
      graphUnitsSwitch.center = rectangle.center;
    } );

    const expandCollapseButton = new ExpandCollapseButton( expandedProperty,
      combineOptions<ExpandCollapseButtonOptions>( {}, PHScaleConstants.EXPAND_COLLAPSE_BUTTON_OPTIONS, {
        right: rectangle.right,
        top: rectangle.top,
        tandem: options.tandem.createTandem( 'expandCollapseButton' )
      } ) );

    const content = new Node( {
      children: [ rectangle, graphUnitsSwitch, expandCollapseButton ]
    } );

    super( content, options );

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    this.pdomOrder = [
      graphUnitsSwitch,
      expandCollapseButton
    ];
  }
}

phScale.register( 'GraphControlPanel', GraphControlPanel );