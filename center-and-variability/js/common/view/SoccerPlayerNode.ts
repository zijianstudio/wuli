// Copyright 2022-2023, University of Colorado Boulder

/**
 * Shows a cartoon representation of a soccer player which will kick a ball.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import { Image, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';

import player01Standing_png from '../../../images/player01Standing_png.js';
import player01PoisedToKick_png from '../../../images/player01PoisedToKick_png.js';
import player01Kicking_png from '../../../images/player01Kicking_png.js';
import player02Standing_png from '../../../images/player02Standing_png.js';
import player02PoisedToKick_png from '../../../images/player02PoisedToKick_png.js';
import player02Kicking_png from '../../../images/player02Kicking_png.js';
import player03Standing_png from '../../../images/player03Standing_png.js';
import player03PoisedToKick_png from '../../../images/player03PoisedToKick_png.js';
import player03Kicking_png from '../../../images/player03Kicking_png.js';
import player04Standing_png from '../../../images/player04Standing_png.js';
import player04PoisedToKick_png from '../../../images/player04PoisedToKick_png.js';
import player04Kicking_png from '../../../images/player04Kicking_png.js';
import player05Standing_png from '../../../images/player05Standing_png.js';
import player05PoisedToKick_png from '../../../images/player05PoisedToKick_png.js';
import player06Kicking_png from '../../../images/player06Kicking_png.js';
import player06Standing_png from '../../../images/player06Standing_png.js';
import player06PoisedToKick_png from '../../../images/player06PoisedToKick_png.js';
import player07Kicking_png from '../../../images/player07Kicking_png.js';
import player07Standing_png from '../../../images/player07Standing_png.js';
import player07PoisedToKick_png from '../../../images/player07PoisedToKick_png.js';
import player08Kicking_png from '../../../images/player08Kicking_png.js';
import player08Standing_png from '../../../images/player08Standing_png.js';
import player08PoisedToKick_png from '../../../images/player08PoisedToKick_png.js';
import player09Kicking_png from '../../../images/player09Kicking_png.js';
import player09Standing_png from '../../../images/player09Standing_png.js';
import player09PoisedToKick_png from '../../../images/player09PoisedToKick_png.js';
import player10Kicking_png from '../../../images/player10Kicking_png.js';
import player10Standing_png from '../../../images/player10Standing_png.js';
import player10PoisedToKick_png from '../../../images/player10PoisedToKick_png.js';
import player11Kicking_png from '../../../images/player11Kicking_png.js';
import player11Standing_png from '../../../images/player11Standing_png.js';
import player11PoisedToKick_png from '../../../images/player11PoisedToKick_png.js';
import player12Kicking_png from '../../../images/player12Kicking_png.js';
import player12Standing_png from '../../../images/player12Standing_png.js';
import player12PoisedToKick_png from '../../../images/player12PoisedToKick_png.js';
import player13Kicking_png from '../../../images/player13Kicking_png.js';
import player13Standing_png from '../../../images/player13Standing_png.js';
import player13PoisedToKick_png from '../../../images/player13PoisedToKick_png.js';
import player14Kicking_png from '../../../images/player14Kicking_png.js';
import player14Standing_png from '../../../images/player14Standing_png.js';
import player14PoisedToKick_png from '../../../images/player14PoisedToKick_png.js';
import player15Kicking_png from '../../../images/player15Kicking_png.js';
import player15Standing_png from '../../../images/player15Standing_png.js';
import player15PoisedToKick_png from '../../../images/player15PoisedToKick_png.js';
import player05Kicking_png from '../../../images/player05Kicking_png.js';
import SoccerPlayer from '../model/SoccerPlayer.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Pose from '../model/Pose.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

type SelfOptions = EmptySelfOptions;
type SoccerPlayerNodeOptions = SelfOptions & NodeOptions;

const playerGroups = [ {
  standing: player01Standing_png,
  poisedToKick: player01PoisedToKick_png,
  kicking: player01Kicking_png
}, {
  standing: player02Standing_png,
  poisedToKick: player02PoisedToKick_png,
  kicking: player02Kicking_png
}, {
  standing: player03Standing_png,
  poisedToKick: player03PoisedToKick_png,
  kicking: player03Kicking_png
}, {
  standing: player04Standing_png,
  poisedToKick: player04PoisedToKick_png,
  kicking: player04Kicking_png
}, {
  standing: player05Standing_png,
  poisedToKick: player05PoisedToKick_png,
  kicking: player05Kicking_png
}, {
  standing: player06Standing_png,
  poisedToKick: player06PoisedToKick_png,
  kicking: player06Kicking_png
}, {
  standing: player07Standing_png,
  poisedToKick: player07PoisedToKick_png,
  kicking: player07Kicking_png
}, {
  standing: player08Standing_png,
  poisedToKick: player08PoisedToKick_png,
  kicking: player08Kicking_png
}, {
  standing: player09Standing_png,
  poisedToKick: player09PoisedToKick_png,
  kicking: player09Kicking_png
}, {
  standing: player10Standing_png,
  poisedToKick: player10PoisedToKick_png,
  kicking: player10Kicking_png
}, {
  standing: player11Standing_png,
  poisedToKick: player11PoisedToKick_png,
  kicking: player11Kicking_png
}, {
  standing: player12Standing_png,
  poisedToKick: player12PoisedToKick_png,
  kicking: player12Kicking_png
}, {
  standing: player13Standing_png,
  poisedToKick: player13PoisedToKick_png,
  kicking: player13Kicking_png
}, {
  standing: player14Standing_png,
  poisedToKick: player14PoisedToKick_png,
  kicking: player14Kicking_png
}, {
  standing: player15Standing_png,
  poisedToKick: player15PoisedToKick_png,
  kicking: player15Kicking_png
} ];

const SCALE = 0.155;

export default class SoccerPlayerNode extends Node {
  public readonly soccerPlayer: SoccerPlayer;

  public constructor( soccerPlayer: SoccerPlayer, modelViewTransform: ModelViewTransform2, isSceneVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: SoccerPlayerNodeOptions ) {
    super();

    this.soccerPlayer = soccerPlayer;

    const imageNumber = soccerPlayer.initialPlaceInLine;

    const standingNode = new Image( playerGroups[ imageNumber ].standing );
    this.addChild( standingNode );

    const poisedToKickNode = new Image( playerGroups[ imageNumber ].poisedToKick );
    this.addChild( poisedToKickNode );

    const kickingNode = new Image( playerGroups[ imageNumber ].kicking );
    this.addChild( kickingNode );

    this.setScaleMagnitude( SCALE );

    // Show index when debugging with ?dev
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Text( soccerPlayer.initialPlaceInLine, {
        x: 130,
        y: 380,
        scale: 13
      } ) );
    }

    soccerPlayer.poseProperty.link( pose => {
      standingNode.visible = pose === Pose.STANDING;
      poisedToKickNode.visible = pose === Pose.POISED_TO_KICK;
      kickingNode.visible = pose === Pose.KICKING;
      this.centerBottom = modelViewTransform.modelToViewPosition( new Vector2( 0, 0 ) ).plusXY( -28, 8.5 );
    } );

    Multilink.multilink( [ soccerPlayer.isActiveProperty, isSceneVisibleProperty ], ( isActive, isSceneVisible ) => {
      this.visible = isActive && isSceneVisible;
    } );

    const options = optionize<SoccerPlayerNodeOptions, SelfOptions, NodeOptions>()( {
      excludeInvisibleChildrenFromBounds: false,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    this.mutate( options );
  }
}

centerAndVariability.register( 'SoccerPlayerNode', SoccerPlayerNode );