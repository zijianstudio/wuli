// Copyright 2023, University of Colorado Boulder

/**
 * A superclass for movable components of the QuadrilateralNode. Namely, QuadrilateralVertexNode and QuadrilateralSideNode.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { KeyboardListener, Node, NodeOptions, PaintableNode, Voicing, VoicingOptions } from '../../../../scenery/js/imports.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import optionize from '../../../../phet-core/js/optionize.js';
import QuadrilateralMovable from '../model/QuadrilateralMovable.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import WrappedAudioBuffer from '../../../../tambo/js/WrappedAudioBuffer.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import quadShapeCollision_mp3 from '../../../sounds/quadShapeCollision_mp3.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';

// constants
const blockedByInnerShapeStringProperty = QuadrilateralStrings.a11y.voicing.blockedByInnerShapeStringProperty;

type SelfOptions = {

  // a11y - name of this component for both PDOM and Voicing
  nameResponse?: TReadOnlyProperty<string> | null;

  // sound - sound to play when the movable becomes grabbed
  grabbedSound: WrappedAudioBuffer;
  grabbedSoundOutputLevel?: number;
};

type ParentOptions = VoicingOptions & NodeOptions;

// QuadrilateralVertexNode sets these properties explicitly from the nameResponse option
export type QuadrilateralMovableNodeOptions = SelfOptions & StrictOmit<ParentOptions, 'voicingNameResponse' | 'innerContent'> & PickRequired<NodeOptions, 'tandem'>;

export default class QuadrilateralMovableNode extends Voicing( Node ) {
  private readonly model: QuadrilateralMovable;

  // Deltas used by movables for keyboard input - amount of motion per key press in view coordinates.
  public readonly largeViewDragDelta: number;
  public readonly smallViewDragDelta: number;

  // The actual visual PaintableNode for this view component, added as a child of this Node.
  public readonly paintableNode: PaintableNode;

  // voicing - Responses related to this Node being blocked for movement have higher Priority so that it is not
  // interrupted by context responses during shape changes.
  public readonly blockedUtterance = new Utterance( {
    priority: Utterance.MEDIUM_PRIORITY
  } );

  public constructor( model: QuadrilateralMovable, modelViewTransform: ModelViewTransform2, paintableNode: PaintableNode, providedOptions: QuadrilateralMovableNodeOptions ) {
    const options = optionize<QuadrilateralMovableNodeOptions, SelfOptions, ParentOptions>()( {
      cursor: 'pointer',
      tagName: 'div',
      ariaRole: 'application',
      focusable: true,
      nameResponse: null,
      grabbedSoundOutputLevel: 0.6
    }, providedOptions );

    super( options );
    this.model = model;

    this.voicingNameResponse = options.nameResponse;
    this.innerContent = options.nameResponse;
    this.paintableNode = paintableNode;

    assert && assert( this.paintableNode.fill === null && this.paintableNode.stroke === null,
      'QuadrilateralMovableNode sets default stroke and fill for the Paintable' );
    paintableNode.fill = QuadrilateralColors.quadrilateralShapeColorProperty;
    paintableNode.stroke = QuadrilateralColors.quadrilateralShapeStrokeColorProperty;
    this.addChild( paintableNode );

    // calculate step sizes in view coordinates based on input modes from query parameters
    const reducedStepSize = QuadrilateralQueryParameters.reducedStepSize;
    const largeModelDelta = reducedStepSize ? QuadrilateralConstants.MAJOR_REDUCED_SIZE_VERTEX_INTERVAL : QuadrilateralQueryParameters.majorVertexInterval;
    const smallModelDelta = reducedStepSize ? QuadrilateralConstants.MINOR_REDUCED_SIZE_VERTEX_INTERVAL : QuadrilateralQueryParameters.minorVertexInterval;
    this.largeViewDragDelta = modelViewTransform.modelToViewDeltaX( largeModelDelta );
    this.smallViewDragDelta = modelViewTransform.modelToViewDeltaX( smallModelDelta );

    this.addInputListener( {
      focus: () => {
        this.model.isPressedProperty.value = true;
      },
      blur: () => {
        this.model.isPressedProperty.value = false;
      }
    } );

    // Voicing - speak all content about this component when you press enter or spacebar
    this.addInputListener( new KeyboardListener( {
      keys: [ 'enter', 'space' ],
      callback: ( event, listener ) => {
        this.voicingSpeakFullResponse();
      }
    } ) );

    // Sound - the grab sound is played on press but there is no release sound for this component since there is
    // no behavioral relevance to the release. The 'release' sound is used instead of 'grab' to distinguish sides
    // from vertices
    const pressedSoundPlayer = new SoundClip( providedOptions.grabbedSound, {
      initialOutputLevel: options.grabbedSoundOutputLevel
    } );
    soundManager.addSoundGenerator( pressedSoundPlayer );
    model.isPressedProperty.lazyLink( isPressed => {
      if ( isPressed ) {
        pressedSoundPlayer.play();
      }
    } );

    const blockedByShapeSoundClip = new SoundClip( quadShapeCollision_mp3, {
      initialOutputLevel: 0.5
    } );
    soundManager.addSoundGenerator( blockedByShapeSoundClip );
    model.movementBlockedByShapeProperty.lazyLink( blocked => {
      if ( blocked ) {
        blockedByShapeSoundClip.play();
        this.voicingSpeakResponse( {
          contextResponse: blockedByInnerShapeStringProperty,
          utterance: this.blockedUtterance
        } );
      }
    } );

    // Custom utterance for blocked state should only be spoken when Node is visible and voicingVisible.
    Voicing.registerUtteranceToVoicingNode( this.blockedUtterance, this );
  }

  /**
   * Update Properties in response to input indicating that the component was blocked from moving for some reason.
   */
  public updateBlockedState( isBlockedByShape: boolean, isBlockedByBounds: boolean ): void {
    this.model.movementBlockedByShapeProperty.value = isBlockedByShape;
    this.model.movementBlockedByBoundsProperty.value = isBlockedByBounds;
  }
}

quadrilateral.register( 'QuadrilateralMovableNode', QuadrilateralMovableNode );
