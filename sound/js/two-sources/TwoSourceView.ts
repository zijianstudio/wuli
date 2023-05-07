// Copyright 2022, University of Colorado Boulder
/**
 * View for the two source screen.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Image } from '../../../scenery/js/imports.js';
import girl_png from '../../images/girl_png.js';
import SoundConstants from '../common/SoundConstants.js';
import MovableNode from '../common/view/MovableNode.js';
import SpeakerNode from '../common/view/SpeakerNode.js';
import sound from '../sound.js';
import TwoSourceModel from '../two-sources/TwoSourceModel.js';
import SoundScreenView from '../common/view/SoundScreenView.js';

export default class TwoSourceView extends SoundScreenView {
  private readonly listener: MovableNode;
  private readonly speakerNode2: MovableNode;

  public constructor( model: TwoSourceModel ) {
    super( model );

    // Second speaker
    const bounds = new Bounds2( model.speaker1Position.x, 0, 1, model.getWaveAreaBounds().height );
    const speaker = new SpeakerNode( model.oscillatorProperty );
    this.speakerNode2 = new MovableNode( model.speaker2PositionProperty, bounds, model.modelViewTransform!, speaker );
    speaker.setRightCenter( new Vector2( SoundConstants.SPEAKER_OFFSET, 0 ) );
    this.addChild( this.speakerNode2 );

    // Listener
    const child = new Image( girl_png, {
      center: new Vector2( 0, 0 )
    } );
    const listenerBounds = new Bounds2( SoundConstants.LISTENER_BOUNDS_X.min, child.height, SoundConstants.LISTENER_BOUNDS_X.max, model.getWaveAreaBounds().height - child.bottom );
    this.listener = new MovableNode( model.listenerPositionProperty, listenerBounds, model.modelViewTransform!, child );
    this.addChild( this.listener );

    model.speaker2PositionProperty.link( value => {
      this.canvasNode.source2PositionY = model.modelToLatticeTransform.modelToViewY( value.y );
    } );
  }
}

sound.register( 'TwoSourceView', TwoSourceView );