// Copyright 2020-2022, University of Colorado Boulder

/**
 * Base class ScreenView which creates view components that all screens use. This includes the central ratio "scene" which
 * has two RatioHalf instances and supports showing tick marks and their labels. There is a RadioButtonGroup to control
 * the tick mark view too. Subtypes are responsible for creating a control for changing the model's targetRatioProperty.
 *
 * This type creates its own layout function, because the ratio interaction is inherently quite vertical. This type
 * maximizes the vertical space of a layout and extends the ratio to a vertical aspect ratio when possible. It also
 * supports scaling up UI controls (on the right) to match the aspect ratio. See this.topScalingUILayerNode and
 * this.bottomScalingUILayerNode for more details.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Color, ParallelDOM, VBox, Voicing, voicingUtteranceQueue } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import BothHandsPDOMNode, { BothHandsPDOMNodeOptions } from './BothHandsPDOMNode.js';
import CueArrowsState from './CueArrowsState.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkDescriber from './describers/TickMarkDescriber.js';
import RAPColors from './RAPColors.js';
import RAPTickMarkLabelsNode from './RAPTickMarkLabelsNode.js';
import RatioHalf from './RatioHalf.js';
import InProportionSoundGenerator from './sound/InProportionSoundGenerator.js';
import MovingInProportionSoundGenerator from './sound/MovingInProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './sound/StaccatoFrequencySoundGenerator.js';
import TickMarkView from './TickMarkView.js';
import TickMarkViewRadioButtonGroup from './TickMarkViewRadioButtonGroup.js';
import RAPModel from '../model/RAPModel.js';
import CueDisplay from './CueDisplay.js';
import RAPPositionRegionsLayer from './RAPPositionRegionsLayer.js';
import BackgroundColorHandler from './BackgroundColorHandler.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import RAPMediaPipe from './RAPMediaPipe.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import RatioInputModality from './describers/RatioInputModality.js';
import RatioAndProportionBluetoothButton from './RatioAndProportionBluetoothButton.js';
import DistanceResponseType from './describers/DistanceResponseType.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import MediaPipeQueryParameters from '../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MAX_RATIO_HEIGHT = LAYOUT_BOUNDS.width * 2; // relatively arbitrary, but good to set a max, so it can't get too skinny
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * 0.25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;
const RATIO_HALF_SPACING = 10;

// Percentage of the layout bounds width that is taken up by the ratio (including margins) rather than the control
// area on the right.
const RATIO_SECTION_WIDTH = 2 / 3;

const uiScaleFunction = new LinearFunction( LAYOUT_BOUNDS.height, MAX_RATIO_HEIGHT, 1, 1.5, true );
const uiPositionFunction = new LinearFunction( 1, 1.5, LAYOUT_BOUNDS.height * 0.15, -LAYOUT_BOUNDS.height * 0.2, true );

type SelfOptions = {
  leftHandColorProperty?: TReadOnlyProperty<Color>;
  rightHandColorProperty?: TReadOnlyProperty<Color>;
  bothHandsPDOMNodeOptions?: Partial<BothHandsPDOMNodeOptions>; // Because all the required pieces are added by this type
};

type RAPScreenViewOptions = SelfOptions & ScreenViewOptions;

class RAPScreenView extends ScreenView {

  protected tickMarkViewProperty: EnumerationProperty<TickMarkView>;

  // What is the unit value of the tick marks. Value reads as "1/x of the view height."
  protected tickMarkRangeProperty: NumberProperty;
  protected readonly ratioDescriber: RatioDescriber;
  private backgroundColorHandler: BackgroundColorHandler;
  private readonly antecedentRatioHalf: RatioHalf;
  private readonly consequentRatioHalf: RatioHalf;

  // SoundGenerators that sonify different aspects of the model
  private readonly inProportionSoundGenerator: InProportionSoundGenerator;
  private readonly movingInProportionSoundGenerator: MovingInProportionSoundGenerator;
  private readonly staccatoFrequencySoundGenerator: StaccatoFrequencySoundGenerator;

  // Keep a separate layer for "control-panel-esque"  UI on the right. This allows them to be scaled
  // to maximize their size within the horizontal space in vertical aspect ratios, see https://github.com/phetsims/ratio-and-proportion/issues/79
  // These are two separate containers so that scaling them can take away space in between them while keeping each
  // positioned based on the corners of the layout.
  protected topScalingUILayerNode = new VBox( { align: 'right', spacing: 20 } );
  protected bottomScalingUILayerNode = new VBox( { align: 'right', spacing: 20 } );

  private readonly layoutRAPScreeView: ( currentScreenViewCoordinates: Bounds2 ) => void;
  private readonly mediaPipe: RAPMediaPipe | null;

  private stepEmitter = new Emitter<[ number ]>( { parameters: [ { valueType: 'number' } ] } );
  private readonly labelsNode: RAPTickMarkLabelsNode;

  public constructor( model: RAPModel, backgroundColorProperty: Property<Color>, providedOptions?: RAPScreenViewOptions ) {

    const options = optionize<RAPScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      layoutBounds: LAYOUT_BOUNDS,

      // Properties that control the color of each hand
      leftHandColorProperty: new Property( Color.BLACK ),
      rightHandColorProperty: new Property( Color.BLACK ),

      // Passed through to BothHandsPDOMNode
      bothHandsPDOMNodeOptions: {}
    }, providedOptions );

    super( options );

    // for ease at usage sites
    const ratio = model.ratio;

    this.tickMarkViewProperty = new EnumerationProperty( TickMarkView.NONE, {
      tandem: options.tandem.createTandem( 'tickMarkViewProperty' )
    } );

    this.tickMarkRangeProperty = new NumberProperty( 10, { tandem: options.tandem.createTandem( 'tickMarkRangeProperty' ) } );

    this.backgroundColorHandler = new BackgroundColorHandler( model, backgroundColorProperty );

    this.ratioDescriber = new RatioDescriber( model );

    // A collection of properties that keep track of which cues should be displayed for both the antecedent and consequent hands.
    const cueArrowsState = new CueArrowsState();

    const tickMarksAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => Color.interpolateRGBA(
        RAPColors.tickMarksAndLabelsOutOfFitnessProperty.value,
        RAPColors.tickMarksAndLabelsInFitnessProperty.value, fitness
      ) );

    // Tick mark sounds get played when ratio isn't locked, and when staccato sounds aren't playing
    const playTickMarkBumpSoundProperty: TReadOnlyProperty<boolean> = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => !model.ratio.lockedProperty.value && fitness === rapConstants.RATIO_FITNESS_RANGE.min );

    // by default, the keyboard step size should be half of one default tick mark width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    // NOTE: do not change this without changing the copied constant in getKeyboardInputSnappingMapperTests.js
    const keyboardStep = 1 / 2 / this.tickMarkRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ model.unclampedFitnessProperty, this.tickMarkViewProperty, this.tickMarkRangeProperty, model.targetRatioProperty ];

    this.antecedentRatioHalf = new RatioHalf( {

      ratio: ratio,
      ratioTerm: RatioTerm.ANTECEDENT,
      displayBothHandsCueProperty: cueArrowsState.bothHands.antecedentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: ( isJumping: boolean ) => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),

      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT ),
      inProportionProperty: model.inProportionProperty,

      handColorProperty: options.leftHandColorProperty,
      accessibleName: RatioAndProportionStrings.a11y.leftHandStringProperty,
      a11yDependencies: a11yDependencies,
      bothHandsCueDisplay: CueDisplay.W_S,
      isRight: false, // this way we get a left hand

      // Added to the antecedent for ease, but it applies to both RatioHalfs in the PDOM
      helpText: RatioAndProportionStrings.a11y.individualHandsHelpTextStringProperty,

      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,

      // phet-io
      tandem: options.tandem.createTandem( 'antecedentRatioHalf' )
    } );

    this.consequentRatioHalf = new RatioHalf( {

      ratio: ratio,
      ratioTerm: RatioTerm.CONSEQUENT,
      displayBothHandsCueProperty: cueArrowsState.bothHands.consequentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: ( isJumping: boolean ) => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),

      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.CONSEQUENT ),
      inProportionProperty: model.inProportionProperty,

      handColorProperty: options.rightHandColorProperty,
      accessibleName: RatioAndProportionStrings.a11y.rightHandStringProperty,
      a11yDependencies: a11yDependencies,

      // phet-io
      tandem: options.tandem.createTandem( 'consequentRatioHalf' )
    } );

    // TODO: how to handle this merge? It seems like PHET_CORE/merge is the best case for this, we are &ing the two arguments into BothHandsPDOMNode, https://github.com/phetsims/chipper/issues/1128
    const bothHandsPDOMNode = new BothHandsPDOMNode( merge( {
        ratioTupleProperty: ratio.tupleProperty,
        enabledRatioTermsRangeProperty: ratio.enabledRatioTermsRangeProperty,
        cueArrowsState: cueArrowsState,
        keyboardStep: keyboardStep,
        tickMarkViewProperty: this.tickMarkViewProperty,
        tickMarkRangeProperty: this.tickMarkRangeProperty,
        unclampedFitnessProperty: model.unclampedFitnessProperty,
        ratioDescriber: this.ratioDescriber,
        playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,
        ratioLockedProperty: model.ratio.lockedProperty,
        targetRatioProperty: model.targetRatioProperty,
        getIdealTerm: model.getIdealValueForTerm.bind( model ),
        inProportionProperty: model.inProportionProperty,

        interactiveNodeOptions: {
          children: [ this.antecedentRatioHalf, this.consequentRatioHalf ]
        }
      }, options.bothHandsPDOMNodeOptions )
    );

    this.mediaPipe = null;
    if ( MediaPipeQueryParameters.cameraInput === 'hands' ) {
      const mediaPipeBothHandsDescriber = new BothHandsDescriber(
        ratio.tupleProperty,
        ratio.enabledRatioTermsRangeProperty,
        ratio.lockedProperty,
        this.tickMarkViewProperty,
        model.inProportionProperty,
        this.ratioDescriber,
        new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty )
      );

      const mediaPipeVoicingEndDragUtterance = new Utterance( {
        alert: new ResponsePacket( {
          objectResponse: () => mediaPipeBothHandsDescriber.getBothHandsObjectResponse(),
          contextResponse: () => mediaPipeBothHandsDescriber.getBothHandsContextResponse( RatioInputModality.BOTH_HANDS, {
            distanceResponseType: DistanceResponseType.DISTANCE_REGION
          } )
        } ),
        priority: Utterance.MEDIUM_PRIORITY // Should interrupt the dragging Utterance
      } );

      const mediaPipeVoicingDragUtterance = new Utterance( {
        alert: new ResponsePacket( {
          objectResponse: () => mediaPipeBothHandsDescriber.getBothHandsObjectResponse(),
          contextResponse: () => {
            return mediaPipeBothHandsDescriber.getBothHandsContextResponse( RatioInputModality.BOTH_HANDS, {
              distanceResponseType: DistanceResponseType.DISTANCE_PROGRESS
            } );
          }
        } )
      } );

      // So that this Utterance does not announce unless the ScreenView is visible and voicingVisible.
      Voicing.registerUtteranceToNode( mediaPipeVoicingEndDragUtterance, this );
      Voicing.registerUtteranceToNode( mediaPipeVoicingDragUtterance, this );

      this.mediaPipe = new RAPMediaPipe( model.ratio.tupleProperty,
        model.ratio.lockedProperty,
        this.antecedentRatioHalf.viewSounds,
        this.consequentRatioHalf.viewSounds, {
          isBeingInteractedWithProperty: model.mediaPipeInteractedWithProperty,
          tandem: options.tandem.createTandem( 'mediaPipe' )
        } );

      this.mediaPipe.isBeingInteractedWithProperty.lazyLink( ( interactedWithMarkers: boolean ) => {
        if ( interactedWithMarkers ) {
          cueArrowsState.interactedWithMouseProperty.value = true;
        }
      } );

      this.mediaPipe.oHandGestureProperty.lazyLink( oHandGestureDetected => {

        if ( oHandGestureDetected ) {
          Voicing.alertUtterance( mediaPipeVoicingEndDragUtterance );
        }
        else {
          voicingUtteranceQueue.cancelUtterance( mediaPipeVoicingEndDragUtterance );
        }
      } );

      this.stepEmitter.addListener( () => {
        this.mediaPipe!.step();
      } );

      this.mediaPipe.handsStationaryProperty.lazyLink( isStationary => {

        if ( isStationary ) {
          Voicing.alertUtterance( mediaPipeVoicingDragUtterance );
        }
        else {
          voicingUtteranceQueue.cancelUtterance( mediaPipeVoicingDragUtterance );
        }
      } );
    }

    const bluetoothInteractedWithProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'bluetoothInteractedWithProperty' )
    } );

    const soundGeneratorEnabledProperty = DerivedProperty.or( [
      this.antecedentRatioHalf.isBeingInteractedWithProperty,
      this.consequentRatioHalf.isBeingInteractedWithProperty,
      bothHandsPDOMNode.isBeingInteractedWithProperty,
      this.mediaPipe ? this.mediaPipe.isBeingInteractedWithProperty : new BooleanProperty( false ),
      bluetoothInteractedWithProperty
    ] );

    this.inProportionSoundGenerator = new InProportionSoundGenerator( model, soundGeneratorEnabledProperty );
    this.movingInProportionSoundGenerator = new MovingInProportionSoundGenerator( model, {
      enableControlProperties: [ soundGeneratorEnabledProperty ]
    } );
    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( model.ratioFitnessProperty, rapConstants.RATIO_FITNESS_RANGE,
      model.inProportionProperty, {
        enableControlProperties: [ soundGeneratorEnabledProperty ]
      } );

    soundManager.addSoundGenerator( this.staccatoFrequencySoundGenerator );
    soundManager.addSoundGenerator( this.inProportionSoundGenerator );
    soundManager.addSoundGenerator( this.movingInProportionSoundGenerator );

    // these dimensions are just temporary, and will be recomputed below in the layout function
    this.labelsNode = new RAPTickMarkLabelsNode( this.tickMarkViewProperty, this.tickMarkRangeProperty, 1000, tickMarksAndLabelsColorProperty );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        cueArrowsState.reset();
        bothHandsPDOMNode.reset();
        this.mediaPipe && this.mediaPipe.reset();
        this.reset();
      },
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );

    if ( RAPQueryParameters.bluetooth ) {
      const antecedentConnectionButton = new RatioAndProportionBluetoothButton( model.ratio.tupleProperty, RatioTerm.ANTECEDENT, {
        tandem: options.tandem.createTandem( 'antecedentConnectionButton' )
      } );
      const consequentConnectionButton = new RatioAndProportionBluetoothButton( model.ratio.tupleProperty, RatioTerm.CONSEQUENT, {
        tandem: options.tandem.createTandem( 'consequentConnectionButton' )
      } );

      this.stepEmitter.addListener( () => {
        antecedentConnectionButton.step();
        consequentConnectionButton.step();
      } );

      Multilink.multilink( [ antecedentConnectionButton.isBeingInteractedWithProperty,
          consequentConnectionButton.isBeingInteractedWithProperty ],
        ( antecedentInteractedWith, consequentInteractedWith ) => {
          bluetoothInteractedWithProperty.value = antecedentInteractedWith && consequentInteractedWith;
        } );

      bluetoothInteractedWithProperty.lazyLink( ( interactedWithMarkers: boolean ) => {
        if ( interactedWithMarkers ) {
          cueArrowsState.interactedWithMouseProperty.value = true;
        }
      } );

      // bluetooth is stationary if both inputs are stationary
      const bluetoothStationaryProperty = DerivedProperty.and( [ antecedentConnectionButton.isStationaryProperty,
        consequentConnectionButton.isStationaryProperty ] );

      const bluetoothBothHandsDescriber = new BothHandsDescriber(
        ratio.tupleProperty,
        ratio.enabledRatioTermsRangeProperty,
        ratio.lockedProperty,
        this.tickMarkViewProperty,
        model.inProportionProperty,
        this.ratioDescriber,
        new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty )
      );

      const bluetoothVoicingDragUtterance = new Utterance( {
        alert: new ResponsePacket( {
          objectResponse: () => bluetoothBothHandsDescriber.getBothHandsObjectResponse(),
          contextResponse: () => {
            return bluetoothBothHandsDescriber.getBothHandsContextResponse( RatioInputModality.BOTH_HANDS, {
              distanceResponseType: DistanceResponseType.DISTANCE_PROGRESS
            } );
          }
        } )
      } );

      bluetoothStationaryProperty.lazyLink( isStationary => {
        if ( isStationary ) {
          Voicing.alertUtterance( bluetoothVoicingDragUtterance );
        }
        else {
          voicingUtteranceQueue.cancelUtterance( bluetoothVoicingDragUtterance );
        }
      } );

      const bluetoothButtonBox = new VBox( {
        children: [ antecedentConnectionButton, consequentConnectionButton ],
        spacing: 5,
        align: 'right'
      } );
      this.bottomScalingUILayerNode.addChild( bluetoothButtonBox );
    }

    const tickMarkViewRadioButtonGroup = new TickMarkViewRadioButtonGroup( this.tickMarkViewProperty, {
      tandem: options.tandem.createTandem( 'tickMarkViewRadioButtonGroup' )
    } );

    // add this Node to the layer that is scaled up to support vertical aspect ratios
    this.topScalingUILayerNode.addChild( tickMarkViewRadioButtonGroup );
    this.bottomScalingUILayerNode.addChild( resetAllButton );

    let positionRegionsNode: RAPPositionRegionsLayer | null = null;
    if ( RAPQueryParameters.showPositionRegions ) {
      positionRegionsNode = new RAPPositionRegionsLayer();
    }

    this.children = [
      this.labelsNode,

      // UI
      this.topScalingUILayerNode,
      this.bottomScalingUILayerNode,

      // Main ratio on top
      bothHandsPDOMNode
    ];
    positionRegionsNode && this.addChild( positionRegionsNode );

    // accessible order (ratio first in nav order)
    this.pdomPlayAreaNode.pdomOrder = [
      bothHandsPDOMNode,
      tickMarkViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.pdomOrder = [
      resetAllButton
    ];

    // Dynamic layout if any controls change (like for dynamic locale switching)
    this.topScalingUILayerNode.boundsProperty.link( () => {
      this.topScalingUILayerNode.right = this.layoutBounds.maxX - rapConstants.SCREEN_VIEW_X_MARGIN;
      this.scaleControls( this.antecedentRatioHalf.rectHeight, this.getRatioWidth() );
    } );
    this.bottomScalingUILayerNode.boundsProperty.link( () => {
      this.bottomScalingUILayerNode.right = this.layoutBounds.maxX - rapConstants.SCREEN_VIEW_X_MARGIN;
      this.bottomScalingUILayerNode.bottom = this.layoutBounds.height - rapConstants.SCREEN_VIEW_Y_MARGIN;
      this.scaleControls( this.antecedentRatioHalf.rectHeight, this.getRatioWidth() );
    } );

    this.layoutRAPScreeView = newRatioHalfBounds => {

      // between 0 and 1, 0 is the min height, 1 is the max height
      const heightScalar = Utils.clamp( ( newRatioHalfBounds.height - LAYOUT_BOUNDS.height ) / ( MAX_RATIO_HEIGHT - LAYOUT_BOUNDS.height ), 0, 1 );

      this.antecedentRatioHalf.layout( newRatioHalfBounds, heightScalar );
      this.consequentRatioHalf.layout( newRatioHalfBounds, heightScalar );

      const ratioHalfDraggableArea = newRatioHalfBounds.height - ( 2 * this.antecedentRatioHalf.framingRectangleHeight );

      // subtract the top and bottom rectangles from the tick marks height
      this.labelsNode.layout( ratioHalfDraggableArea );

      const ratioWidth = this.getRatioWidth();

      this.scaleControls( newRatioHalfBounds.height, this.getRatioWidth() );

      this.antecedentRatioHalf.left = ( Math.max( RATIO_SECTION_WIDTH * this.layoutBounds.width, ratioWidth ) - ratioWidth ) / 2;

      this.labelsNode.left = this.antecedentRatioHalf.right + RATIO_HALF_SPACING;
      this.consequentRatioHalf.left = this.labelsNode.right + RATIO_HALF_SPACING;

      this.antecedentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );
      this.consequentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );

      // offset the bottom so that the center of the text is right on the tick mark
      this.labelsNode.bottom = this.layoutBounds.bottom - this.antecedentRatioHalf.framingRectangleHeight + this.labelsNode.labelHeight / 2;

      if ( positionRegionsNode ) {
        const ratioHalvesWidth = this.antecedentRatioHalf.width + this.consequentRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + this.labelsNode.width;
        positionRegionsNode.layout( ratioHalvesWidth, ratioHalfDraggableArea );
        positionRegionsNode.left = this.antecedentRatioHalf.left;
        positionRegionsNode.bottom = this.layoutBounds.bottom - this.antecedentRatioHalf.framingRectangleHeight + ( positionRegionsNode.labelsHeight / 2 );
      }

      assert && assert( Math.min( this.topScalingUILayerNode.left, this.bottomScalingUILayerNode.left ) >
                        this.consequentRatioHalf.right,
        'controls are too wide for ratio width to fit.' );

      assert && assert( this.antecedentRatioHalf.width + this.consequentRatioHalf.width +
                        Math.max( this.topScalingUILayerNode.width, this.bottomScalingUILayerNode.width ) < LAYOUT_BOUNDS.width,
        'everything should fit inside layout bounds' );
    };
    this.layoutRAPScreeView( defaultRatioHalfBounds );
  }

  private getRatioWidth(): number {
    const inBetweenRatioWidth = ( 2 * RATIO_HALF_SPACING ) + this.labelsNode.width;
    return this.antecedentRatioHalf.width + this.consequentRatioHalf.width + inBetweenRatioWidth;
  }

  // Scale the UI controls on the right side of the ScreenView
  private scaleControls( height: number, ratioWidth: number ): void {

    // Ideal scale
    const desiredScaleFromHeight = uiScaleFunction.evaluate( height );

    const unscaledWidth = Math.max( this.topScalingUILayerNode.localBoundsProperty.value.width,
      this.bottomScalingUILayerNode.localBoundsProperty.value.width );
    const availableWidth = this.layoutBounds.width - ratioWidth - 2 * rapConstants.SCREEN_VIEW_X_MARGIN;
    assert && assert( unscaledWidth < availableWidth, 'availableWidth should always be greater than width of component' );

    // If the controls are too big, scale less than desired as to not overlap with ratio
    const actualScale = Math.min( desiredScaleFromHeight, availableWidth / unscaledWidth );

    this.topScalingUILayerNode.setScaleMagnitude( actualScale );
    this.bottomScalingUILayerNode.setScaleMagnitude( actualScale );
    this.topScalingUILayerNode.top = uiPositionFunction.evaluate( actualScale );
  }

  /**
   * Layout Nodes part of ethe screen viw. To accomplish, much of this was copied from ScreenView.layout, with
   * minor tweaks for this specific case. Also note Projectile Motion uses almost the exact same algorithm.
   */
  public override layout( viewBounds: Bounds2 ): void {

    this.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, viewBounds, { verticalAlign: 'bottom' } );
    this.visibleBoundsProperty.value = this.parentToLocalBounds( viewBounds );

    const ratioHeight = Math.min( this.visibleBoundsProperty.value.height, MAX_RATIO_HEIGHT );
    this.layoutRAPScreeView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, ratioHeight ) );
  }

  public reset(): void {
    this.tickMarkRangeProperty.reset();
    this.tickMarkViewProperty.reset();
    this.antecedentRatioHalf.reset();
    this.consequentRatioHalf.reset();
    this.staccatoFrequencySoundGenerator.reset();
    this.inProportionSoundGenerator.reset();
    this.movingInProportionSoundGenerator.reset();
  }

  public override step( dt: number ): void {

    this.stepEmitter.emit( dt );
    this.inProportionSoundGenerator.step( dt );
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'RAPScreenView', RAPScreenView );
export default RAPScreenView;