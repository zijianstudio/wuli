// Copyright 2020-2022, University of Colorado Boulder

/**
 * PDOM view for interacting with both hands at the same time. This adds a custom interaction, as well as PDOM
 * formatting like adding the "application" role to support alternative input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { Node, NodeOptions, ParallelDOM, PDOMBehaviorFunction, PDOMValueType, Voicing, VoicingOptions } from '../../../../scenery/js/imports.js';
import AriaLiveAnnouncer from '../../../../utterance-queue/js/AriaLiveAnnouncer.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import BothHandsInteractionListener, { getIdealTermType } from './BothHandsInteractionListener.js';
import ViewSounds from './sound/ViewSounds.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import Range from '../../../../dot/js/Range.js';
import CueArrowsState from './CueArrowsState.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkView from './TickMarkView.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TickMarkDescriber from './describers/TickMarkDescriber.js';
import RatioInputModality from './describers/RatioInputModality.js';
import Multilink from '../../../../axon/js/Multilink.js';
import StringProperty from '../../../../axon/js/StringProperty.js';

// constants
const OBJECT_RESPONSE_DELAY = 500;

const accessibleNameBehavior: PDOMBehaviorFunction = ( node, options, accessibleName ) => {
  options.innerContent = accessibleName;
  options.ariaLabel = accessibleName;
  return options;
};

type SelfOptions = {
  ratioTupleProperty: Property<RAPRatioTuple>;
  enabledRatioTermsRangeProperty: Property<Range>;
  cueArrowsState: CueArrowsState;
  keyboardStep: number;
  tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  tickMarkRangeProperty: Property<number>;
  unclampedFitnessProperty: TReadOnlyProperty<number>;
  ratioDescriber: RatioDescriber;
  playTickMarkBumpSoundProperty: Property<boolean>;
  ratioLockedProperty: Property<boolean>;
  targetRatioProperty: Property<number>;
  getIdealTerm: getIdealTermType;
  inProportionProperty: Property<boolean>; // is the model in proportion right now

  // help text to be displayed on devices supporting gesture description
  // (see `Sim.supportsGestureDescription`). When null, this will be the same as the default helpText.
  gestureDescriptionHelpText?: PDOMValueType | null;
  interactiveNodeOptions?: VoicingOptions & NodeOptions;
};

type BothHandsPDOMNodeOptions = SelfOptions & StrictOmit<NodeOptions, 'pdomOrder'>;

class BothHandsPDOMNode extends Node {

  // BothHandsDescriber holds state information that changes based on requests for content, so have a separate type per modality, see https://github.com/phetsims/ratio-and-proportion/issues/416
  private descriptionBothHandsDescriber: BothHandsDescriber;
  private voicingBothHandsDescriber: BothHandsDescriber;

  // To support proper cue arrow logic
  private readonly antecedentInteractedWithProperty: Property<boolean>;
  private readonly consequentInteractedWithProperty: Property<boolean>;
  private readonly bothHandsFocusedProperty: Property<boolean>;

  private readonly viewSounds: ViewSounds;
  private readonly objectResponseUtterance: Utterance;

  // just to fire on focus, make this polite for https://github.com/phetsims/ratio-and-proportion/issues/347
  private readonly objectResponseOnFocusUtterance: Utterance;
  private readonly contextResponseUtterance: Utterance;
  private readonly ratioUnlockedFromBothHandsUtterance: Utterance;

  // Two references to the same Property allows for a public, readonly interface, while still editable in this file.
  public readonly isBeingInteractedWithProperty: TReadOnlyProperty<boolean>;
  private readonly _isBeingInteractedWithProperty: Property<boolean>;

  private readonly bothHandsInteractionListener: BothHandsInteractionListener;

  public constructor( providedOptions: BothHandsPDOMNodeOptions ) {

    const options = optionize<BothHandsPDOMNodeOptions, SelfOptions, StrictOmit<NodeOptions, 'pdomOrder'>>()( {

      gestureDescriptionHelpText: null,

      // pdom
      tagName: 'div',
      interactiveNodeOptions: {
        helpText: RatioAndProportionStrings.a11y.bothHands.bothHandsHelpTextStringProperty, // overridden by options.gestureDescriptionHelpText when supported
        helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
        ariaRole: 'application',
        focusable: true,
        tagName: 'div',

        // just the initial value, this is set dynamically below.
        accessibleName: RatioAndProportionStrings.a11y.bothHands.bothHandsStringProperty,

        accessibleNameBehavior: accessibleNameBehavior,
        voicingObjectResponse: () => this.voicingBothHandsDescriber.getBothHandsObjectResponse(),
        interactiveHighlight: 'invisible'
      }
    }, providedOptions );

    super();

    if ( phet.joist.sim.supportsGestureDescription && options.gestureDescriptionHelpText ) {
      options.interactiveNodeOptions.helpText = options.gestureDescriptionHelpText;
    }

    const tickMarkDescriber = new TickMarkDescriber( options.tickMarkRangeProperty, options.tickMarkViewProperty );

    this.descriptionBothHandsDescriber = new BothHandsDescriber(
      options.ratioTupleProperty,
      options.enabledRatioTermsRangeProperty,
      options.ratioLockedProperty,
      options.tickMarkViewProperty,
      options.inProportionProperty,
      options.ratioDescriber,
      tickMarkDescriber
    );

    this.voicingBothHandsDescriber = new BothHandsDescriber(
      options.ratioTupleProperty,
      options.enabledRatioTermsRangeProperty,
      options.ratioLockedProperty,
      options.tickMarkViewProperty,
      options.inProportionProperty,
      options.ratioDescriber,
      tickMarkDescriber
    );

    this.antecedentInteractedWithProperty = new BooleanProperty( false );
    this.consequentInteractedWithProperty = new BooleanProperty( false );
    this.bothHandsFocusedProperty = new BooleanProperty( false );

    this.viewSounds = new ViewSounds( options.tickMarkRangeProperty, options.tickMarkViewProperty, options.playTickMarkBumpSoundProperty );

    Multilink.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty
    ], ( antecedentInteractedWith, consequentInteractedWith ) => {
      options.cueArrowsState.bothHands.interactedWithProperty.value = antecedentInteractedWith || consequentInteractedWith;

      // If both hands have been interacted with, then no need for individual cues either
      if ( antecedentInteractedWith && consequentInteractedWith ) {
        options.cueArrowsState.interactedWithKeyboardProperty.value = true;
      }
    } );
    Multilink.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty,
      this.bothHandsFocusedProperty
    ], ( antecedentInteractedWith, consequentInteractedWith, bothHandsFocused ) => {
      options.cueArrowsState.bothHands.antecedentCueDisplayedProperty.value = !antecedentInteractedWith && bothHandsFocused;
      options.cueArrowsState.bothHands.consequentCueDisplayedProperty.value = !consequentInteractedWith && bothHandsFocused;
    } );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    const interactiveNode = new VoicingNode( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    const handLockedStringProperty = new PatternStringProperty( RatioAndProportionStrings.a11y.handLockedPatternStringProperty, {
      hand: RatioAndProportionStrings.a11y.bothHands.bothHandsStringProperty
    } );

    options.ratioLockedProperty.link( locked => {
      const newAccessibleNameStringProperty = !locked ?
                                              RatioAndProportionStrings.a11y.bothHands.bothHandsStringProperty :
                                              handLockedStringProperty;
      interactiveNode.accessibleName = newAccessibleNameStringProperty;
      interactiveNode.voicingNameResponse = newAccessibleNameStringProperty;
    } );


    // Make sure that any children inside the both hands interaction (like individual hands) come before the both hands interaction in the PDOM.
    this.pdomOrder = [ dynamicDescription, ...interactiveNode.children, null ];

    interactiveNode.setPDOMAttribute( 'aria-roledescription', SceneryPhetStrings.a11y.grabDrag.movableStringProperty );

    const originalContextResponseStringProperty = new StringProperty( '' );
    const voicingContextResponsePatternStringProperty = new PatternStringProperty( RatioAndProportionStrings.a11y.ratioNoLongerLockedPatternStringProperty, {
      noLongerLocked: RatioAndProportionStrings.a11y.ratioNoLongerLockedStringProperty,
      originalContextResponse: originalContextResponseStringProperty
    } );

    this.bothHandsInteractionListener = new BothHandsInteractionListener( {
      targetNode: interactiveNode,
      ratioTupleProperty: options.ratioTupleProperty,
      antecedentInteractedWithProperty: this.antecedentInteractedWithProperty,
      consequentInteractedWithProperty: this.consequentInteractedWithProperty,
      enabledRatioTermsRangeProperty: options.enabledRatioTermsRangeProperty,
      tickMarkRangeProperty: options.tickMarkRangeProperty,
      keyboardStep: options.keyboardStep,
      boundarySoundClip: this.viewSounds.boundarySoundClip,
      tickMarkBumpSoundClip: this.viewSounds.tickMarkBumpSoundClip,
      ratioLockedProperty: options.ratioLockedProperty,
      targetRatioProperty: options.targetRatioProperty,
      getIdealTerm: options.getIdealTerm,
      inProportionProperty: options.inProportionProperty,
      onInput: ( ratioInputModality, knockedOutOfLock? ) => {

        ///////////
        // Description
        if ( knockedOutOfLock ) {
          this.alertDescriptionUtterance( this.ratioUnlockedFromBothHandsUtterance );
        }
        this.alertBothHandsDescriptionContextResponse( ratioInputModality, knockedOutOfLock );
        //////////

        //////////
        // Voicing
        originalContextResponseStringProperty.value = this.voicingBothHandsDescriber.getBothHandsContextResponse( ratioInputModality );
        interactiveNode.voicingSpeakFullResponse( { // just object and context response
          nameResponse: null,
          hintResponse: null,

          // ratioInputModality is needed for the context response so we can't set that through voicingContextResponse
          contextResponse: knockedOutOfLock ? voicingContextResponsePatternStringProperty :
                           originalContextResponseStringProperty
        } );
        ///////////
      }
    } );

    interactiveNode.addInputListener( this.bothHandsInteractionListener );
    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( true );
        this.viewSounds.grabSoundClip.play();
        this.bothHandsFocusedProperty.value = true;
      },
      blur: () => {
        this.viewSounds.releaseSoundClip.play();
        this.bothHandsFocusedProperty.value = false;

        // This only works because the bothHandsInteractionListener needs alt-input control resetting
        this.bothHandsInteractionListener.reset();
      },
      down: () => {
        this.bothHandsFocusedProperty.value = false;
        this.bothHandsInteractionListener.reset();
      }
    } );

    this.objectResponseUtterance = new Utterance( {
      alertStableDelay: OBJECT_RESPONSE_DELAY,
      announcerOptions: {

        // This "object response" is meant to act more like aria-valuetext than a traditional, polite alert. We want
        // this to cut off any other alert. This fixes alert-build-up described in https://github.com/phetsims/ratio-and-proportion/issues/214
        ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE
      }
    } );

    this.objectResponseOnFocusUtterance = new Utterance( {
      alertStableDelay: 50
    } );

    this.contextResponseUtterance = new Utterance( { alertStableDelay: 2000 } );
    this.ratioUnlockedFromBothHandsUtterance = new Utterance( {
      alert: RatioAndProportionStrings.a11y.ratioNoLongerLockedStringProperty,

      // slightly longer than the object response so that we make sure it comes after that assertive alert. This is
      // because we don't want it interrupted like it was originally in https://github.com/phetsims/ratio-and-proportion/issues/227#issuecomment-740173738
      alertStableDelay: OBJECT_RESPONSE_DELAY + 10
    } );

    this._isBeingInteractedWithProperty = this.bothHandsInteractionListener.isBeingInteractedWithProperty;
    this.isBeingInteractedWithProperty = this._isBeingInteractedWithProperty;

    // Though most cases are covered by just listening to fitness, there are certain cases when Property values can change,
    // but the fitness doesn't. See https://github.com/phetsims/ratio-and-proportion/issues/222 as an example.
    Multilink.multilink( [
      options.tickMarkViewProperty,
      options.tickMarkRangeProperty,
      options.ratioTupleProperty,
      options.unclampedFitnessProperty
    ], () => {

      dynamicDescription.innerContent = this.descriptionBothHandsDescriber.getBothHandsDynamicDescription();

      if ( this.bothHandsInteractionListener.isBeingInteractedWithProperty.value ) {
        this.alertBothHandsObjectResponse();
      }
    } );

    // emit this utterance immediately, so that it comes before the object response above.
    this.bothHandsInteractionListener.jumpToZeroWhileLockedEmitter.addListener( () => {

      const cannotJumpToZeroWhenLockedProperty = RatioAndProportionStrings.a11y.bothHands.cannotJumpToZeroWhenLockedStringProperty;
      this.alertDescriptionUtterance( cannotJumpToZeroWhenLockedProperty.value );
      this.contextResponseUtterance.alert = this.descriptionBothHandsDescriber.getBothHandsObjectResponse();

      this.alertDescriptionUtterance( this.contextResponseUtterance );
    } );

    this.mutate( options );
  }

  public reset(): void {
    this.descriptionBothHandsDescriber.reset();
    this.voicingBothHandsDescriber.reset();
    this.antecedentInteractedWithProperty.reset();
    this.consequentInteractedWithProperty.reset();
    this.bothHandsFocusedProperty.reset();
    this.bothHandsInteractionListener.reset();
    this.objectResponseUtterance.reset();
    this.contextResponseUtterance.reset();
    this.ratioUnlockedFromBothHandsUtterance.reset();
    this.viewSounds.reset();
  }

  private alertBothHandsObjectResponse( onFocus = false ): void {
    const utterance = onFocus ? this.objectResponseOnFocusUtterance : this.objectResponseUtterance;
    utterance.alert = this.descriptionBothHandsDescriber.getBothHandsObjectResponse();

    this.alertDescriptionUtterance( utterance );
  }

  // Just for description, not voicing
  private alertBothHandsDescriptionContextResponse( ratioInputModality: RatioInputModality, knockedOutOfLock?: boolean ): void {
    if ( knockedOutOfLock ) {
      this.contextResponseUtterance.alert = this.descriptionBothHandsDescriber.getBothHandsObjectResponse();
    }
    else {
      this.contextResponseUtterance.alert = this.descriptionBothHandsDescriber.getBothHandsContextResponse( ratioInputModality );
    }

    this.alertDescriptionUtterance( this.contextResponseUtterance );
  }
}

class VoicingNode extends Voicing( Node ) {}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export type { BothHandsPDOMNodeOptions };
export default BothHandsPDOMNode;