// Copyright 2023, University of Colorado Boulder

/**
 * Visible Body Node that draws a sphere with size dependent on the Body's mass.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { Color, DragListener, InteractiveHighlighting, KeyboardDragListener, Node, Rectangle, RectangleOptions, RichText, TextOptions } from '../../../scenery/js/imports.js';
import Utils from '../../../dot/js/Utils.js';
import Body from '../model/Body.js';
import ShadedSphereNode, { ShadedSphereNodeOptions } from '../../../scenery-phet/js/ShadedSphereNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import optionize from '../../../phet-core/js/optionize.js';
import Multilink from '../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import ExplosionNode from './ExplosionNode.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Bodies_Brass_C3_mp3 from '../../sounds/Bodies_Brass_C3_mp3.js';
import Bodies_Flute_g3_mp3 from '../../sounds/Bodies_Flute_g3_mp3.js';
import Bodies_Strings_e3_v2_mp3 from '../../sounds/Bodies_Strings_e3_v2_mp3.js';
import Bodies_Woodwinds_e3_mp3 from '../../sounds/Bodies_Woodwinds_e3_mp3.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import CueingArrowsNode from './CueingArrowsNode.js';


const bodySounds = [
  Bodies_Brass_C3_mp3,
  Bodies_Woodwinds_e3_mp3,
  Bodies_Strings_e3_v2_mp3,
  Bodies_Flute_g3_mp3
];

type SelfOptions = {
  draggable?: boolean;
  mapPosition?: ( position: Vector2, radius: number ) => Vector2;
  valuesVisibleProperty?: TReadOnlyProperty<boolean>;
  rectangleOptions?: RectangleOptions;
  textOptions?: TextOptions;
  useCueingArrows?: boolean;

  showVelocityIndex?: boolean;

  // If a soundViewNode is provided, we'll hook up a soundClip to it and play sounds when it is visible
  soundViewNode?: Node | null;
};

export type BodyNodeOptions = SelfOptions & StrictOmit<ShadedSphereNodeOptions, 'cursor'>;

export default class BodyNode extends InteractiveHighlighting( ShadedSphereNode ) {
  private readonly disposeBodyNode: () => void;

  public readonly soundClip: SoundClip;
  public readonly grabClip: SoundClip;
  public readonly releaseClip: SoundClip;

  public constructor( public readonly body: Body, modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>, providedOptions?: BodyNodeOptions ) {
    const accessibleName = 'Body ' + ( body.index + 1 );

    const options = optionize<BodyNodeOptions, SelfOptions, ShadedSphereNodeOptions>()( {
      draggable: true,

      mainColor: body.colorProperty,

      mapPosition: _.identity,

      valuesVisibleProperty: new BooleanProperty( false ),

      rectangleOptions: {
        cornerRadius: 2,
        fill: new Color( 0, 0, 0, 0.5 )
      },

      soundViewNode: null,

      textOptions: {
        fill: 'white', // Not a colorProperty because it is not dynamic
        maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH,
        font: new PhetFont( 16 )
      },

      useCueingArrows: false,
      showVelocityIndex: true,

      // pdom
      tagName: 'div',
      focusable: true,
      ariaLabel: accessibleName, // the screen reader Accessible Name
      innerContent: accessibleName, // needed to make it focusable in the PDOM
      ariaRole: 'application'
    }, providedOptions );

    options.cursor = options.draggable ? 'pointer' : 'default';

    super( 1, options );

    this.body = body;

    this.soundClip = new SoundClip( bodySounds[ body.index ], {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL,
      loop: true
    } );

    const dragClipOptions = {
      initialOutputLevel: 2 * SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    this.grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    this.releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );

    if ( options.soundViewNode ) {
      soundManager.addSoundGenerator( this.soundClip, {
        associatedViewNode: options.soundViewNode
      } );
      soundManager.addSoundGenerator( this.grabClip, {
        associatedViewNode: options.soundViewNode
      } );
      soundManager.addSoundGenerator( this.releaseClip, {
        associatedViewNode: options.soundViewNode
      } );
    }

    const radiusMultilink = Multilink.multilink(
      [ body.radiusProperty, modelViewTransformProperty ],
      ( radius, modelViewTransform ) => {
        this.radius = modelViewTransform.modelToViewDeltaX( radius );
        // Expand mouse/touch areas to 10 units past
        const area = Shape.circle( 0, 0, this.radius + 10 );
        this.mouseArea = area;
        this.touchArea = area;
        this.focusHighlight = area;
      } );

    const positionMultilink = Multilink.multilink(
      [ body.positionProperty, modelViewTransformProperty ],
      ( position, modelViewTransform ) => {
        this.translation = modelViewTransform.modelToViewPosition( position );

        // If body position is bigger than the provided bounds
        this.body.escapedProperty.value = body.positionProperty.value.magnitude > options.mapPosition( body.positionProperty.value, this.radius ).magnitude;
      } );

    let keyboardDragListener: KeyboardDragListener;

    if ( options.draggable ) {
      const start = () => {
        body.clearPath();
        body.userControlledPositionProperty.value = true;
        this.grabClip.play();
      };
      const end = () => {
        body.userControlledPositionProperty.value = false;
        this.releaseClip.play();
      };
      const map = ( point: Vector2 ) => {
        return options.mapPosition( point, this.radius );
      };

      const bodyDragListener = new DragListener( {
        positionProperty: body.positionProperty,
        canStartPress: () => !body.userControlledPositionProperty.value,
        mapPosition: map,
        transform: modelViewTransformProperty,
        start: start,
        end: end
      } );
      this.addInputListener( bodyDragListener );

      keyboardDragListener = new KeyboardDragListener(
        {
          positionProperty: body.positionProperty,
          transform: modelViewTransformProperty,
          dragVelocity: 450,
          shiftDragVelocity: 100,
          start: start,
          end: end,
          mapPosition: map
        } );
      this.addInputListener( keyboardDragListener );
      this.disposeEmitter.addListener( () => {
        bodyDragListener.dispose();
        keyboardDragListener.dispose();
      } );
    }

    const velocityValueProperty = new DerivedProperty(
      [ this.body.velocityProperty ],
      ( velocity: Vector2 ) => Utils.toFixed(
        velocity.magnitude * SolarSystemCommonConstants.VELOCITY_MULTIPLIER,
        2
      )
    );
    const readoutStringProperty = new PatternStringProperty( SolarSystemCommonStrings.pattern.velocityValueUnitsStringProperty, {
      index: options.showVelocityIndex ? body.index + 1 : '',
      value: velocityValueProperty,
      units: SolarSystemCommonStrings.units.kmsStringProperty
    } );

    const valueNode = new RichText( readoutStringProperty, options.textOptions );

    const valueBackgroundNode = new Rectangle( options.rectangleOptions );

    // Resizes the value background and centers it on the value
    valueNode.boundsProperty.link( bounds => {
      valueBackgroundNode.rectBounds = bounds.dilated( 4 );
    } );

    // Value Container
    const valueContainer = new Node( {
      children: [ valueBackgroundNode, valueNode ],
      visibleProperty: options.valuesVisibleProperty,
      center: new Vector2( 0, 30 )
    } );
    this.addChild( valueContainer );

    const bodyCollisionListener = () => {
      this.interruptSubtreeInput();
      ExplosionNode.explode( this );
    };

    this.body.collidedEmitter.addListener( bodyCollisionListener );

    const cueingVisibleProperty = new DerivedProperty( [ this.body.userControlledProperty ], wasDragged => ( options.draggable && !wasDragged ) );
    const cueingArrowsNode = new CueingArrowsNode( {
      bodyRadius: this.radius,
      fill: options.mainColor,
      visibleProperty: cueingVisibleProperty
    } );

    if ( options.useCueingArrows ) {
      this.addChild( cueingArrowsNode );
    }

    this.disposeBodyNode = () => {
      valueContainer.dispose(); // Because we provide the visibleProperty
      positionMultilink.dispose();
      radiusMultilink.dispose();
      cueingVisibleProperty.dispose();
      cueingArrowsNode.dispose();

      this.body.collidedEmitter.removeListener( bodyCollisionListener );
      readoutStringProperty.dispose();
      velocityValueProperty.dispose();
      valueNode.dispose();
      this.stopSound();
      if ( options.soundViewNode ) {
        soundManager.removeSoundGenerator( this.soundClip );
        soundManager.removeSoundGenerator( this.grabClip );
        soundManager.removeSoundGenerator( this.releaseClip );
      }
      this.soundClip.dispose();
      this.grabClip.dispose();
      this.releaseClip.dispose();
    };
  }

  public playSound(): void {
    if ( this.body.isActiveProperty.value ) {
      this.soundClip.setOutputLevel( this.body.accelerationProperty.value.magnitude / 2000 );
      this.soundClip.play();
    }
    else {
      this.soundClip.stop();
    }
  }

  public stopSound(): void {
    this.soundClip.stop();
  }

  public override dispose(): void {
    this.disposeBodyNode();
    super.dispose();
  }
}

solarSystemCommon.register( 'BodyNode', BodyNode );