// Copyright 2019-2023, University of Colorado Boulder

/**
 * Shows the water level numerically next to the top-left of the pool's water. Lives for the lifetime of the sim.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ManualConstraint, Node, Path, RichText } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';

export default class WaterLevelIndicator extends Node {
  public constructor( volumeProperty: TReadOnlyProperty<number> ) {
    super();

    const highlightShape = new Shape().moveTo( 0, 0 ).lineTo( -20, -10 ).lineTo( -20, 10 ).close();
    const highlightPath = new Path( highlightShape, {
      fill: DensityBuoyancyCommonColors.waterIndicatorHighlightProperty
    } );
    this.addChild( highlightPath );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    const readoutText = new RichText( new PatternStringProperty( DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY, {
      value: volumeProperty
    }, {
      maps: {
        value: ( volume: number ) => 1000 * volume
      },
      decimalPlaces: 2
    } ), {
      font: new PhetFont( { size: 18 } ),
      maxWidth: 200
    } );

    const readoutPanel = new Panel( readoutText, {
      // Not using the typical margins for UI panels in this sim
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS
    } );
    this.addChild( readoutPanel );

    ManualConstraint.create( this, [ readoutPanel, highlightPath ], ( readoutWrapper, highlightWrapper ) => {
      readoutWrapper.rightCenter = highlightWrapper.leftCenter;
    } );
  }
}

densityBuoyancyCommon.register( 'WaterLevelIndicator', WaterLevelIndicator );
