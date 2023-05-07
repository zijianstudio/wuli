// Copyright 2023, University of Colorado Boulder

/**
 * Used to show the draggable velocity vectors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, DragListener, InteractiveHighlighting, KeyboardDragListener, Node, Path, PathOptions, Text } from '../../../scenery/js/imports.js';
import VectorNode, { VectorNodeOptions } from './VectorNode.js';
import Body from '../model/Body.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import TProperty from '../../../axon/js/TProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import soundManager from '../../../tambo/js/soundManager.js';

type SelfOptions = {
  snapToZero?: boolean; // When the user sets the vector's magnitude to less than minimumMagnitude, it snaps to zero
  minimumMagnitude?: number; // The minimum magnitude of the vector
  maxMagnitudeProperty?: TReadOnlyProperty<number> | null;

  // If a soundViewNode is provided, we'll hook up a soundClip to it and play sounds when it is visible
  soundViewNode?: Node | null;

  // For drag "bounds"-like handling
  mapPosition?: ( position: Vector2, radius: number ) => Vector2;
};

export type DraggableVectorNodeOptions = SelfOptions & VectorNodeOptions;

export default class DraggableVectorNode extends VectorNode {

  private readonly disposeDraggableVectorNode: () => void;
  public readonly grabClip: SoundClip;
  public readonly releaseClip: SoundClip;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TProperty<Vector2>,
    basePositionProperty: TReadOnlyProperty<Vector2>,
    scale: number,
    labelText: TReadOnlyProperty<string>,
    providedOptions?: DraggableVectorNodeOptions ) {

    const options = optionize<DraggableVectorNodeOptions, SelfOptions, VectorNodeOptions>()( {
      snapToZero: true,
      minimumMagnitude: 10,
      maxMagnitudeProperty: null,

      soundViewNode: null,
      mapPosition: _.identity
    }, providedOptions );

    super(
      body,
      transformProperty,
      visibleProperty,
      vectorProperty,
      new NumberProperty( 1.3 ),
      options
    );

    const dragClipOptions = {
      initialOutputLevel: 2 * SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    this.grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    this.releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );

    if ( options.soundViewNode ) {
      soundManager.addSoundGenerator( this.grabClip, {
        associatedViewNode: options.soundViewNode
      } );
      soundManager.addSoundGenerator( this.releaseClip, {
        associatedViewNode: options.soundViewNode
      } );
    }

    const circleRadius = 18;
    const circleLineWidth = 3;
    const circleOuterRadius = circleRadius + circleLineWidth / 2;

    const accessibleName = 'Velocity Body ' + ( body.index + 1 );

    // a circle with text (a character) in the center, to help indicate what it represents
    // ("v" for velocity in this sim)
    const grabArea = new InteractivePath( Shape.circle( 0, 0, circleRadius ), {
      lineWidth: circleLineWidth,
      stroke: Color.lightGray,
      cursor: 'pointer',

      // pdom
      tagName: 'div',
      focusable: true,
      ariaLabel: accessibleName, // the screen reader Accessible Name
      innerContent: accessibleName, // needed to make it focusable in the PDOM
      ariaRole: 'application',
      focusHighlight: Shape.circle( 0, 0, circleRadius * 1.3 )
    } );

    const text = new Text( labelText, {
      font: new PhetFont( { size: 22, weight: 'bold' } ),
      fill: Color.gray,
      maxWidth: 25
    } );
    this.tipProperty.link( tip => {
      text.center = tip;
      grabArea.center = tip;
    } );

    this.addChild( grabArea );
    this.addChild( text );

    // This represents the model coordinates of where the 'V' circle appears
    const vectorPositionProperty = new Vector2Property( vectorProperty.value.plus( basePositionProperty.value ) );
    vectorPositionProperty.lazyLink( vectorPosition => {
      const newVelocity = vectorPosition.subtract( basePositionProperty.value );
      if ( newVelocity.magnitude < options.minimumMagnitude ) {
        if ( options.snapToZero ) {
          vectorProperty.value = new Vector2( 0, 0 );
        }
        else {
          vectorProperty.value = newVelocity.withMagnitude( options.minimumMagnitude );
        }
      }
      else if ( options.maxMagnitudeProperty && newVelocity.magnitude > options.maxMagnitudeProperty.value ) {
        vectorProperty.value = newVelocity.withMagnitude( options.maxMagnitudeProperty.value );
      }
      else {
        vectorProperty.value = newVelocity;
      }
    } );

    // Add the drag handler
    const start = () => {
      body.userControlledVelocityProperty.value = true;
      this.grabClip.play();
    };
    const end = () => {
      body.userControlledVelocityProperty.value = false;
      this.releaseClip.play();
    };

    const dragListener = new DragListener( {
      transform: transformProperty,
      mapPosition: point => {
        return options.mapPosition( point, circleOuterRadius );
      },
      positionProperty: vectorPositionProperty,
      canStartPress: () => !body.userControlledVelocityProperty.value,
      start: () => {
        keyboardDragListener.interrupt();
        start();
      },
      end: end
    } );
    grabArea.addInputListener( dragListener );
    // move behind the geometry created by the superclass
    grabArea.moveToBack();
    text.moveToBack();

    const keyboardDragListener = new KeyboardDragListener( {
      positionProperty: vectorProperty,
      transform: transformProperty,
      dragVelocity: 450,
      shiftDragVelocity: 100,
      start: () => {
        dragListener.interrupt();
        start();
      },
      end: end
    } );
    this.addInputListener( keyboardDragListener );

    this.disposeEmitter.addListener( () => {
      dragListener.dispose();
      keyboardDragListener.dispose();
      vectorPositionProperty.dispose();
      grabArea.dispose();
    } );


    // For PhET-iO, when the node does not support input, don't show the drag circle
    const onInputEnabled = ( inputEnabled: boolean ) => {
      grabArea.visible = inputEnabled;
      text.visible = inputEnabled;
    };
    this.inputEnabledProperty.link( onInputEnabled );

    this.disposeDraggableVectorNode = () => {
      text.dispose();

      this.inputEnabledProperty.unlink( onInputEnabled );

      if ( options.soundViewNode ) {
        soundManager.removeSoundGenerator( this.grabClip );
        soundManager.removeSoundGenerator( this.releaseClip );
      }
      this.grabClip.dispose();
      this.releaseClip.dispose();
    };
  }

  public override dispose(): void {
    this.disposeDraggableVectorNode();

    super.dispose();
  }
}

class InteractivePath extends InteractiveHighlighting( Path ) {
    public constructor( shape: Shape, options?: PathOptions ) {
      super( shape, options );
    }
}

solarSystemCommon.register( 'DraggableVectorNode', DraggableVectorNode );