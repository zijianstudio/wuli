// Copyright 2013-2022, University of Colorado Boulder

/**
 * Visual representation of a beaker that is filled to the top with a solution.
 * Origin is at the bottom center.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, NodeOptions, Path, Text } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import Beaker from '../model/Beaker.js';

// constants
const RIM_OFFSET = 20;
const MINOR_TICK_SPACING = 0.1; // L
const MINOR_TICKS_PER_MAJOR_TICK = 5;
const MAJOR_TICK_LENGTH = 30;
const MINOR_TICK_LENGTH = 15;
const TICK_LABEL_X_SPACING = 8;
const MAJOR_TICK_LABELS = [ '\u00bd', '1' ]; // 1/2, 1
const MAJOR_TICK_FONT = new PhetFont( 24 );

type SelfOptions = EmptySelfOptions;

type BeakerNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class BeakerNode extends Node {

  public constructor( beaker: Beaker, modelViewTransform: ModelViewTransform2, providedOptions: BeakerNodeOptions ) {

    const options = optionize<BeakerNodeOptions, SelfOptions, NodeOptions>()( {

      // BeakerNode should not be hideable, but its subcomponents are.
      // See https://github.com/phetsims/ph-scale/issues/108
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions );

    super( options );

    // outline of the beaker, starting from upper left
    const beakerWidth = modelViewTransform.modelToViewDeltaX( beaker.size.width );
    const beakerHeight = modelViewTransform.modelToViewDeltaY( beaker.size.height );
    const outlineShape = new Shape()
      .moveTo( -( beakerWidth / 2 ) - RIM_OFFSET, -beakerHeight - RIM_OFFSET )
      .lineTo( -( beakerWidth / 2 ), -beakerHeight )
      .lineTo( -( beakerWidth / 2 ), 0 )
      .lineTo( beakerWidth / 2, 0 )
      .lineTo( beakerWidth / 2, -beakerHeight )
      .lineTo( ( beakerWidth / 2 ) + RIM_OFFSET, -beakerHeight - RIM_OFFSET );
    this.addChild( new Path( outlineShape, {
      stroke: 'black',
      lineWidth: 3,
      lineCap: 'round',
      lineJoin: 'round'
    } ) );

    // horizontal tick marks on left and right edges, labels on right ticks, from bottom up
    const tickMarksTandem = options.tandem.createTandem( 'tickMarks' );
    const tickMarks = new Node( {
      tandem: tickMarksTandem
    } );
    this.addChild( tickMarks );

    // tickLabels are a child of tickMarks so that hiding tickMarks also hides labels
    const tickLabels = new Node( {
      tandem: tickMarksTandem.createTandem( 'tickLabels' )
    } );
    tickMarks.addChild( tickLabels );

    const numberOfTicks = Utils.roundSymmetric( beaker.volume / MINOR_TICK_SPACING );
    const deltaY = beakerHeight / numberOfTicks;
    const beakerLeft = -beakerWidth / 2;
    const beakerRight = beakerWidth / 2;
    for ( let i = 1; i <= numberOfTicks; i++ ) {

      const isMajorTick = ( i % MINOR_TICKS_PER_MAJOR_TICK === 0 );
      const tickLength = ( isMajorTick ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH );
      const y = -( i * deltaY );

      // left tick
      tickMarks.addChild( new Path(
        new Shape().moveTo( beakerLeft, y ).lineTo( beakerLeft + tickLength, y ),
        { stroke: 'black', lineWidth: 2, lineCap: 'butt', lineJoin: 'bevel' } ) );

      // right tick
      tickMarks.addChild( new Path(
        new Shape().moveTo( beakerRight, y ).lineTo( beakerRight - tickLength, y ),
        { stroke: 'black', lineWidth: 2, lineCap: 'butt', lineJoin: 'bevel' } ) );

      // label on right 'major' tick
      if ( isMajorTick ) {
        const labelIndex = ( i / MINOR_TICKS_PER_MAJOR_TICK ) - 1;
        if ( labelIndex < MAJOR_TICK_LABELS.length ) {

          const labelStringProperty = new DerivedProperty(
            [ PhScaleStrings.pattern[ '0value' ][ '1unitsStringProperty' ], PhScaleStrings.units.litersStringProperty ],
            ( pattern, litersString ) => StringUtils.format( pattern, MAJOR_TICK_LABELS[ labelIndex ], litersString )
          );

          const labelText = new Text( labelStringProperty, {
            font: MAJOR_TICK_FONT,
            fill: 'black',
            right: beakerRight - tickLength - TICK_LABEL_X_SPACING,
            centerY: y,
            maxWidth: 80 // determined empirically
          } );

          tickLabels.addChild( labelText );

          const labelY = y; // closure
          labelText.boundsProperty.link( bounds => {
            labelText.right = beakerRight - tickLength - TICK_LABEL_X_SPACING;
            labelText.centerY = labelY;
          } );
        }
      }
    }

    this.translation = modelViewTransform.modelToViewPosition( beaker.position );
  }
}

phScale.register( 'BeakerNode', BeakerNode );