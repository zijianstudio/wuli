// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class which renders a Node for the SoccerBall.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import centerAndVariability from '../../centerAndVariability.js';
import { Circle, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import SoccerBall from '../model/SoccerBall.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { AnimationMode } from '../model/AnimationMode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import CAVColors from '../CAVColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Multilink from '../../../../axon/js/Multilink.js';

export type CAVObjectNodeOptions =

// Take all options from NodeOptions, but do not allow passing through inputEnabledProperty since it requires special handling in multilink
  & StrictOmit<NodeOptions, 'inputEnabledProperty'>
  & PickRequired<NodeOptions, 'tandem'>;

// for debugging with ?dev
let index = 0;

export default abstract class CAVObjectNode extends Node {

  protected readonly medianHighlight: Circle;

  public constructor( soccerBall: SoccerBall, isShowingPlayAreaMedianProperty: TReadOnlyProperty<boolean>,
                      modelViewTransform: ModelViewTransform2,
                      modelRadius: number,
                      providedOptions?: CAVObjectNodeOptions ) {

    const options = optionize<CAVObjectNodeOptions, EmptySelfOptions, NodeOptions>()( {
      cursor: 'pointer'
    }, providedOptions );
    super( options );

    const viewRadius = modelViewTransform.modelToViewDeltaX( modelRadius );

    // Visibilty controlled by subclass logic. Also this whole node is moved to front when the medianHighlight is shown
    // so it will appear in front (unless the user drags another object on top of it).
    this.medianHighlight = new Circle( viewRadius + 1.75, {
      fill: CAVColors.medianColorProperty
    } );
    this.addChild( this.medianHighlight );

    soccerBall.positionProperty.link( position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    } );

    // The initial ready-to-kick ball is full opacity. The rest of the balls waiting to be kicked are lower opacity so
    // they don't look like part of the data set, but still look kickable.
    Multilink.multilink( [ soccerBall.valueProperty, soccerBall.animationModeProperty ],
      ( value, animationMode ) => {
        this.opacity = value === null && animationMode === AnimationMode.NONE && !soccerBall.isFirstObject ? 0.4 : 1;
      } );

    // Show index when debugging with ?dev
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Text( index++ + '', {
        font: new PhetFont( 14 ),
        fill: 'red',
        x: this.width / 2 + 1
      } ) );
    }
  }
}

centerAndVariability.register( 'CAVObjectNode', CAVObjectNode );