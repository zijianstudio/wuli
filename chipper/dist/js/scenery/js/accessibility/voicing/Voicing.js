// Copyright 2021-2023, University of Colorado Boulder

/**
 * A trait for Node that supports the Voicing feature, under accessibility. Allows you to define responses for the Node
 * and make requests to speak that content using HTML5 SpeechSynthesis and the UtteranceQueue. Voicing content is
 * organized into four categories which are responsible for describing different things. Responses are stored on the
 * composed type: "ResponsePacket." See that file for details about what responses it stores. Output of this content
 * can be controlled by the responseCollector. Responses are defined as the following. . .
 *
 * - "Name" response: The name of the object that uses Voicing. Similar to the "Accessible Name" in web accessibility.
 * - "Object" response: The state information about the object that uses Voicing.
 * - "Context" response: The contextual changes that result from interaction with the Node that uses Voicing.
 * - "Hint" response: A supporting hint that guides the user toward a desired interaction with this Node.
 *
 * See ResponsePacket, as well as the property and setter documentation for each of these responses for more
 * information.
 *
 * Once this content is set, you can make a request to speak it using an UtteranceQueue with one of the provided
 * functions in this Trait. It is up to you to call one of these functions when you wish for speech to be made. The only
 * exception is on the 'focus' event. Every Node that composes Voicing will speak its responses by when it
 * receives focus.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import inheritance from '../../../../phet-core/js/inheritance.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import { DelayedMutate, InteractiveHighlighting, Node, scenery, voicingUtteranceQueue } from '../../imports.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import responseCollector from '../../../../utterance-queue/js/responseCollector.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// Helps enforce that the utterance is defined.
function assertUtterance(utterance) {
  if (!(utterance instanceof Utterance)) {
    throw new Error('utterance is not an Utterance');
  }
}

// An implementation class for Voicing.ts, only used in this class so that we know if we own the Utterance and can
// therefore dispose it.
class OwnedVoicingUtterance extends Utterance {
  constructor(providedOptions) {
    super(providedOptions);
  }
}

// options that are supported by Voicing.js. Added to mutator keys so that Voicing properties can be set with mutate.
const VOICING_OPTION_KEYS = ['voicingNameResponse', 'voicingObjectResponse', 'voicingContextResponse', 'voicingHintResponse', 'voicingUtterance', 'voicingResponsePatternCollection', 'voicingIgnoreVoicingManagerProperties', 'voicingFocusListener'];
const Voicing = Type => {
  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

  assert && assert(_.includes(inheritance(Type), Node), 'Only Node subtypes should compose Voicing');
  const VoicingClass = DelayedMutate('Voicing', VOICING_OPTION_KEYS, class VoicingClass extends InteractiveHighlighting(Type) {
    // ResponsePacket that holds all the supported responses to be Voiced

    // The utterance that all responses are spoken through.

    // Called when this node is focused.

    // Indicates whether this Node can speak. A Node can speak if self and all of its ancestors are visible and
    // voicingVisible.
    // A counter that keeps track of visible and voicingVisible Instances of this Node.
    // As long as this value is greater than zero, this Node can speak. See onInstanceVisibilityChange
    // and onInstanceVoicingVisibilityChange for more implementation details.
    // Called when `canVoiceEmitter` emits for an Instance.
    // Whenever an Instance of this Node is added or removed, add/remove listeners that will update the
    // canSpeakProperty.
    // Input listener that speaks content on focus. This is the only input listener added
    // by Voicing, but it is the one that is consistent for all Voicing nodes. On focus, speak the name, object
    // response, and interaction hint.
    constructor(...args) {
      super(...args);

      // Bind the listeners on construction to be added to observables on initialize and removed on clean/dispose.
      // Instances are updated asynchronously in updateDisplay. The bind creates a new function and we need the
      // reference to persist through the completion of initialize and disposal.
      this._boundInstanceCanVoiceChangeListener = this.onInstanceCanVoiceChange.bind(this);
      this._voicingUtterance = null;

      // We only want to call this method, not any subtype implementation
      VoicingClass.prototype.initialize.call(this);
    }

    // Separate from the constructor to support cases where Voicing is used in Poolable Nodes.
    // ...args: IntentionalAny[] because things like RichTextLink need to provide arguments to initialize, and TS complains
    // otherwise
    initialize(...args) {
      // @ts-expect-error
      super.initialize && super.initialize(args);
      this._voicingCanSpeakProperty = new TinyProperty(true);
      this._voicingResponsePacket = new ResponsePacket();
      this._voicingFocusListener = this.defaultFocusListener;

      // Sets the default voicingUtterance and makes this.canSpeakProperty a dependency on its ability to announce.
      this.setVoicingUtterance(new OwnedVoicingUtterance());
      this._voicingCanSpeakCount = 0;
      this._boundInstancesChangedListener = this.addOrRemoveInstanceListeners.bind(this);
      this.changedInstanceEmitter.addListener(this._boundInstancesChangedListener);
      this._speakContentOnFocusListener = {
        focus: event => {
          this._voicingFocusListener && this._voicingFocusListener(event);
        }
      };
      this.addInputListener(this._speakContentOnFocusListener);
      return this;
    }

    /**
     * Speak all responses assigned to this Node. Options allow you to override a responses for this particular
     * speech request. Each response is only spoken if the associated Property of responseCollector is true. If
     * all are Properties are false, nothing will be spoken.
     */
    voicingSpeakFullResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({}, providedOptions);

      // Lazily formulate strings only as needed
      if (!options.hasOwnProperty('nameResponse')) {
        options.nameResponse = this._voicingResponsePacket.nameResponse;
      }
      if (!options.hasOwnProperty('objectResponse')) {
        options.objectResponse = this._voicingResponsePacket.objectResponse;
      }
      if (!options.hasOwnProperty('contextResponse')) {
        options.contextResponse = this._voicingResponsePacket.contextResponse;
      }
      if (!options.hasOwnProperty('hintResponse')) {
        options.hintResponse = this._voicingResponsePacket.hintResponse;
      }
      this.collectAndSpeakResponse(options);
    }

    /**
     * Speak ONLY the provided responses that you pass in with options. This will NOT speak the name, object,
     * context, or hint responses assigned to this node by default. But it allows for clarity at usages so it is
     * clear that you are only requesting certain responses. If you want to speak all of the responses assigned
     * to this Node, use voicingSpeakFullResponse().
     *
     * Each response will only be spoken if the Properties of responseCollector are true. If all of those are false,
     * nothing will be spoken.
     */
    voicingSpeakResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({
        nameResponse: null,
        objectResponse: null,
        contextResponse: null,
        hintResponse: null
      }, providedOptions);
      this.collectAndSpeakResponse(options);
    }

    /**
     * By default, speak the name response. But accepts all other responses through options. Respects responseCollector
     * Properties, so the name response may not be spoken if responseCollector.nameResponseEnabledProperty is false.
     */
    voicingSpeakNameResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({}, providedOptions);

      // Lazily formulate strings only as needed
      if (!options.hasOwnProperty('nameResponse')) {
        options.nameResponse = this._voicingResponsePacket.nameResponse;
      }
      this.collectAndSpeakResponse(options);
    }

    /**
     * By default, speak the object response. But accepts all other responses through options. Respects responseCollector
     * Properties, so the object response may not be spoken if responseCollector.objectResponseEnabledProperty is false.
     */
    voicingSpeakObjectResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({}, providedOptions);

      // Lazily formulate strings only as needed
      if (!options.hasOwnProperty('objectResponse')) {
        options.objectResponse = this._voicingResponsePacket.objectResponse;
      }
      this.collectAndSpeakResponse(options);
    }

    /**
     * By default, speak the context response. But accepts all other responses through options. Respects
     * responseCollector Properties, so the context response may not be spoken if
     * responseCollector.contextResponseEnabledProperty is false.
     */
    voicingSpeakContextResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({}, providedOptions);

      // Lazily formulate strings only as needed
      if (!options.hasOwnProperty('contextResponse')) {
        options.contextResponse = this._voicingResponsePacket.contextResponse;
      }
      this.collectAndSpeakResponse(options);
    }

    /**
     * By default, speak the hint response. But accepts all other responses through options. Respects
     * responseCollector Properties, so the hint response may not be spoken if
     * responseCollector.hintResponseEnabledProperty is false.
     */
    voicingSpeakHintResponse(providedOptions) {
      // options are passed along to collectAndSpeakResponse, see that function for additional options
      const options = combineOptions({}, providedOptions);

      // Lazily formulate strings only as needed
      if (!options.hasOwnProperty('hintResponse')) {
        options.hintResponse = this._voicingResponsePacket.hintResponse;
      }
      this.collectAndSpeakResponse(options);
    }

    /**
     * Collect responses with the responseCollector and speak the output with an UtteranceQueue.
     */
    collectAndSpeakResponse(providedOptions) {
      this.speakContent(this.collectResponse(providedOptions));
    }

    /**
     * Combine all types of response into a single alertable, potentially depending on the current state of
     * responseCollector Properties (filtering what kind of responses to present in the resolved response).
     */
    collectResponse(providedOptions) {
      const options = combineOptions({
        ignoreProperties: this._voicingResponsePacket.ignoreProperties,
        responsePatternCollection: this._voicingResponsePacket.responsePatternCollection,
        utterance: this.voicingUtterance
      }, providedOptions);
      let response = responseCollector.collectResponses(options);
      if (options.utterance) {
        options.utterance.alert = response;
        response = options.utterance;
      }
      return response;
    }

    /**
     * Use the provided function to create content to speak in response to input. The content is then added to the
     * back of the voicing UtteranceQueue.
     */
    speakContent(content) {
      const notPhetioArchetype = !Tandem.PHET_IO_ENABLED || !this.isInsidePhetioArchetype();

      // don't send to utteranceQueue if response is empty
      // don't send to utteranceQueue for PhET-iO dynamic element archetypes, https://github.com/phetsims/joist/issues/817
      if (content && notPhetioArchetype) {
        voicingUtteranceQueue.addToBack(content); // eslint-disable-line bad-sim-text
      }
    }

    /**
     * Sets the voicingNameResponse for this Node. This is usually the label of the element and is spoken
     * when the object receives input. When requesting speech, this will only be spoken if
     * responseCollector.nameResponsesEnabledProperty is set to true.
     */
    setVoicingNameResponse(response) {
      this._voicingResponsePacket.nameResponse = response;
    }
    set voicingNameResponse(response) {
      this.setVoicingNameResponse(response);
    }
    get voicingNameResponse() {
      return this.getVoicingNameResponse();
    }

    /**
     * Get the voicingNameResponse for this Node.
     */
    getVoicingNameResponse() {
      return this._voicingResponsePacket.nameResponse;
    }

    /**
     * Set the object response for this Node. This is usually the state information associated with this Node, such
     * as its current input value. When requesting speech, this will only be heard when
     * responseCollector.objectResponsesEnabledProperty is set to true.
     */
    setVoicingObjectResponse(response) {
      this._voicingResponsePacket.objectResponse = response;
    }
    set voicingObjectResponse(response) {
      this.setVoicingObjectResponse(response);
    }
    get voicingObjectResponse() {
      return this.getVoicingObjectResponse();
    }

    /**
     * Gets the object response for this Node.
     */
    getVoicingObjectResponse() {
      return this._voicingResponsePacket.objectResponse;
    }

    /**
     * Set the context response for this Node. This is usually the content that describes what has happened in
     * the surrounding application in response to interaction with this Node. When requesting speech, this will
     * only be heard if responseCollector.contextResponsesEnabledProperty is set to true.
     */
    setVoicingContextResponse(response) {
      this._voicingResponsePacket.contextResponse = response;
    }
    set voicingContextResponse(response) {
      this.setVoicingContextResponse(response);
    }
    get voicingContextResponse() {
      return this.getVoicingContextResponse();
    }

    /**
     * Gets the context response for this Node.
     */
    getVoicingContextResponse() {
      return this._voicingResponsePacket.contextResponse;
    }

    /**
     * Sets the hint response for this Node. This is usually a response that describes how to interact with this Node.
     * When requesting speech, this will only be spoken when responseCollector.hintResponsesEnabledProperty is set to
     * true.
     */
    setVoicingHintResponse(response) {
      this._voicingResponsePacket.hintResponse = response;
    }
    set voicingHintResponse(response) {
      this.setVoicingHintResponse(response);
    }
    get voicingHintResponse() {
      return this.getVoicingHintResponse();
    }

    /**
     * Gets the hint response for this Node.
     */
    getVoicingHintResponse() {
      return this._voicingResponsePacket.hintResponse;
    }

    /**
     * Set whether or not all responses for this Node will ignore the Properties of responseCollector. If false,
     * all responses will be spoken regardless of responseCollector Properties, which are generally set in user
     * preferences.
     */
    setVoicingIgnoreVoicingManagerProperties(ignoreProperties) {
      this._voicingResponsePacket.ignoreProperties = ignoreProperties;
    }
    set voicingIgnoreVoicingManagerProperties(ignoreProperties) {
      this.setVoicingIgnoreVoicingManagerProperties(ignoreProperties);
    }
    get voicingIgnoreVoicingManagerProperties() {
      return this.getVoicingIgnoreVoicingManagerProperties();
    }

    /**
     * Get whether or not responses are ignoring responseCollector Properties.
     */
    getVoicingIgnoreVoicingManagerProperties() {
      return this._voicingResponsePacket.ignoreProperties;
    }

    /**
     * Sets the collection of patterns to use for voicing responses, controlling the order, punctuation, and
     * additional content for each combination of response. See ResponsePatternCollection.js if you wish to use
     * a collection of string patterns that are not the default.
     */
    setVoicingResponsePatternCollection(patterns) {
      this._voicingResponsePacket.responsePatternCollection = patterns;
    }
    set voicingResponsePatternCollection(patterns) {
      this.setVoicingResponsePatternCollection(patterns);
    }
    get voicingResponsePatternCollection() {
      return this.getVoicingResponsePatternCollection();
    }

    /**
     * Get the ResponsePatternCollection object that this Voicing Node is using to collect responses.
     */
    getVoicingResponsePatternCollection() {
      return this._voicingResponsePacket.responsePatternCollection;
    }

    /**
     * Sets the utterance through which voicing associated with this Node will be spoken. By default on initialize,
     * one will be created, but a custom one can optionally be provided.
     */
    setVoicingUtterance(utterance) {
      if (this._voicingUtterance !== utterance) {
        if (this._voicingUtterance) {
          this.cleanVoicingUtterance();
        }
        Voicing.registerUtteranceToVoicingNode(utterance, this);
        this._voicingUtterance = utterance;
      }
    }
    set voicingUtterance(utterance) {
      this.setVoicingUtterance(utterance);
    }
    get voicingUtterance() {
      return this.getVoicingUtterance();
    }

    /**
     * Gets the utterance through which voicing associated with this Node will be spoken.
     */
    getVoicingUtterance() {
      assertUtterance(this._voicingUtterance);
      return this._voicingUtterance;
    }

    /**
     * Get the Property indicating that this Voicing Node can speak. True when this Voicing Node and all of its
     * ancestors are visible and voicingVisible.
     */
    getVoicingCanSpeakProperty() {
      return this._voicingCanSpeakProperty;
    }
    get voicingCanSpeakProperty() {
      return this.getVoicingCanSpeakProperty();
    }

    /**
     * Called whenever this Node is focused.
     */
    setVoicingFocusListener(focusListener) {
      this._voicingFocusListener = focusListener;
    }
    set voicingFocusListener(focusListener) {
      this.setVoicingFocusListener(focusListener);
    }
    get voicingFocusListener() {
      return this.getVoicingFocusListener();
    }

    /**
     * Gets the utteranceQueue through which voicing associated with this Node will be spoken.
     */
    getVoicingFocusListener() {
      return this._voicingFocusListener;
    }

    /**
     * The default focus listener attached to this Node during initialization.
     */
    defaultFocusListener() {
      this.voicingSpeakFullResponse({
        contextResponse: null
      });
    }

    /**
     * Whether a Node composes Voicing.
     */
    get isVoicing() {
      return true;
    }

    /**
     * Detaches references that ensure this components of this Trait are eligible for garbage collection.
     */
    dispose() {
      this.removeInputListener(this._speakContentOnFocusListener);
      this.changedInstanceEmitter.removeListener(this._boundInstancesChangedListener);
      if (this._voicingUtterance) {
        this.cleanVoicingUtterance();
        this._voicingUtterance = null;
      }
      super.dispose();
    }
    clean() {
      this.removeInputListener(this._speakContentOnFocusListener);
      this.changedInstanceEmitter.removeListener(this._boundInstancesChangedListener);
      if (this._voicingUtterance) {
        this.cleanVoicingUtterance();
        this._voicingUtterance = null;
      }

      // @ts-expect-error
      super.clean && super.clean();
    }

    /***********************************************************************************************************/
    // PRIVATE METHODS
    /***********************************************************************************************************/

    /**
     * When visibility and voicingVisibility change such that the Instance can now speak, update the counting
     * variable that tracks how many Instances of this VoicingNode can speak. To speak the Instance must be globally\
     * visible and voicingVisible.
     */
    onInstanceCanVoiceChange(canSpeak) {
      if (canSpeak) {
        this._voicingCanSpeakCount++;
      } else {
        this._voicingCanSpeakCount--;
      }
      assert && assert(this._voicingCanSpeakCount >= 0, 'the voicingCanSpeakCount should not go below zero');
      assert && assert(this._voicingCanSpeakCount <= this.instances.length, 'The voicingCanSpeakCount cannot be greater than the number of Instances.');
      this._voicingCanSpeakProperty.value = this._voicingCanSpeakCount > 0;
    }

    /**
     * Update the canSpeakProperty and counting variable in response to an Instance of this Node being added or
     * removed.
     */
    handleInstancesChanged(instance, added) {
      const isVisible = instance.visible && instance.voicingVisible;
      if (isVisible) {
        // If the added Instance was visible and voicingVisible it should increment the counter. If the removed
        // instance is NOT visible/voicingVisible it would not have contributed to the counter so we should not
        // decrement in that case.
        this._voicingCanSpeakCount = added ? this._voicingCanSpeakCount + 1 : this._voicingCanSpeakCount - 1;
      }
      this._voicingCanSpeakProperty.value = this._voicingCanSpeakCount > 0;
    }

    /**
     * Add or remove listeners on an Instance watching for changes to visible or voicingVisible that will modify
     * the voicingCanSpeakCount. See documentation for voicingCanSpeakCount for details about how this controls the
     * voicingCanSpeakProperty.
     */
    addOrRemoveInstanceListeners(instance, added) {
      assert && assert(instance.canVoiceEmitter, 'Instance must be initialized.');
      if (added) {
        // @ts-expect-error - Emitters in Instance need typing
        instance.canVoiceEmitter.addListener(this._boundInstanceCanVoiceChangeListener);
      } else {
        // @ts-expect-error - Emitters in Instance need typing
        instance.canVoiceEmitter.removeListener(this._boundInstanceCanVoiceChangeListener);
      }

      // eagerly update the canSpeakProperty and counting variables in addition to adding change listeners
      this.handleInstancesChanged(instance, added);
    }

    /**
     * Clean this._voicingUtterance, disposing if we own it or unregistering it if we do not.
     */
    cleanVoicingUtterance() {
      assert && assert(this._voicingUtterance, 'A voicingUtterance must be available to clean.');
      if (this._voicingUtterance instanceof OwnedVoicingUtterance) {
        this._voicingUtterance.dispose();
      } else if (this._voicingUtterance && !this._voicingUtterance.isDisposed) {
        Voicing.unregisterUtteranceToVoicingNode(this._voicingUtterance, this);
      }
    }
    mutate(options) {
      return super.mutate(options);
    }
  });

  /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */
  VoicingClass.prototype._mutatorKeys = VOICING_OPTION_KEYS.concat(VoicingClass.prototype._mutatorKeys);
  assert && assert(VoicingClass.prototype._mutatorKeys.length === _.uniq(VoicingClass.prototype._mutatorKeys).length, 'duplicate mutator keys in Voicing');
  return VoicingClass;
};
Voicing.VOICING_OPTION_KEYS = VOICING_OPTION_KEYS;

/**
 * Alert an Utterance to the voicingUtteranceQueue. The Utterance must have voicingCanAnnounceProperties and hopefully
 * at least one of the Properties is a VoicingNode's canAnnounceProperty so that this Utterance is only announced
 * when the VoicingNode is globally visible and voicingVisible.
 * @static
 */
Voicing.alertUtterance = utterance => {
  assert && assert(utterance.voicingCanAnnounceProperties.length > 0, 'voicingCanAnnounceProperties required, this Utterance might not be connected to Node in the scene graph.');
  voicingUtteranceQueue.addToBack(utterance); // eslint-disable-line bad-sim-text
};

/**
 * Assign the voicingNode's voicingCanSpeakProperty to the Utterance so that the Utterance can only be announced
 * if the voicingNode is globally visible and voicingVisible in the display.
 * @static
 */
Voicing.registerUtteranceToVoicingNode = (utterance, voicingNode) => {
  const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
  if (!existingCanAnnounceProperties.includes(voicingNode.voicingCanSpeakProperty)) {
    utterance.voicingCanAnnounceProperties = existingCanAnnounceProperties.concat([voicingNode.voicingCanSpeakProperty]);
  }
};

/**
 * Remove a voicingNode's voicingCanSpeakProperty from the Utterance.
 * @static
 */
Voicing.unregisterUtteranceToVoicingNode = (utterance, voicingNode) => {
  const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
  const index = existingCanAnnounceProperties.indexOf(voicingNode.voicingCanSpeakProperty);
  assert && assert(index > -1, 'voicingNode.voicingCanSpeakProperty is not on the Utterance, was it not registered?');
  utterance.voicingCanAnnounceProperties = existingCanAnnounceProperties.splice(index, 1);
};

/**
 * Assign the Node's voicingVisibleProperty and visibleProperty to the Utterance so that the Utterance can only be
 * announced if the Node is visible and voicingVisible. This is LOCAL visibility and does not care about ancestors.
 * This should rarely be used, in general you should be registering an Utterance to a VoicingNode and its
 * voicingCanSpeakProperty.
 * @static
 */
Voicing.registerUtteranceToNode = (utterance, node) => {
  const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
  if (!existingCanAnnounceProperties.includes(node.visibleProperty)) {
    utterance.voicingCanAnnounceProperties = utterance.voicingCanAnnounceProperties.concat([node.visibleProperty]);
  }
  if (!existingCanAnnounceProperties.includes(node.voicingVisibleProperty)) {
    utterance.voicingCanAnnounceProperties = utterance.voicingCanAnnounceProperties.concat([node.voicingVisibleProperty]);
  }
};

/**
 * Remove a Node's voicingVisibleProperty and visibleProperty from the voicingCanAnnounceProperties of the Utterance.
 * @static
 */
Voicing.unregisterUtteranceToNode = (utterance, node) => {
  const existingCanAnnounceProperties = utterance.voicingCanAnnounceProperties;
  assert && assert(existingCanAnnounceProperties.includes(node.visibleProperty) && existingCanAnnounceProperties.includes(node.voicingVisibleProperty), 'visibleProperty and voicingVisibleProperty were not on the Utterance, was it not registered to the node?');
  const visiblePropertyIndex = existingCanAnnounceProperties.indexOf(node.visibleProperty);
  const withoutVisibleProperty = existingCanAnnounceProperties.splice(visiblePropertyIndex, 1);
  const voicingVisiblePropertyIndex = withoutVisibleProperty.indexOf(node.voicingVisibleProperty);
  const withoutBothProperties = existingCanAnnounceProperties.splice(voicingVisiblePropertyIndex, 1);
  utterance.voicingCanAnnounceProperties = withoutBothProperties;
};

// Export a type that lets you check if your Node is composed with Voicing.
const wrapper = () => Voicing(Node);
scenery.register('Voicing', Voicing);
export default Voicing;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIlJlc3BvbnNlUGFja2V0IiwiVXR0ZXJhbmNlIiwiRGVsYXllZE11dGF0ZSIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiTm9kZSIsInNjZW5lcnkiLCJ2b2ljaW5nVXR0ZXJhbmNlUXVldWUiLCJjb21iaW5lT3B0aW9ucyIsInJlc3BvbnNlQ29sbGVjdG9yIiwiVGlueVByb3BlcnR5IiwiVGFuZGVtIiwiYXNzZXJ0VXR0ZXJhbmNlIiwidXR0ZXJhbmNlIiwiRXJyb3IiLCJPd25lZFZvaWNpbmdVdHRlcmFuY2UiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIlZPSUNJTkdfT1BUSU9OX0tFWVMiLCJWb2ljaW5nIiwiVHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsIlZvaWNpbmdDbGFzcyIsImFyZ3MiLCJfYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXIiLCJvbkluc3RhbmNlQ2FuVm9pY2VDaGFuZ2UiLCJiaW5kIiwiX3ZvaWNpbmdVdHRlcmFuY2UiLCJwcm90b3R5cGUiLCJpbml0aWFsaXplIiwiY2FsbCIsIl92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSIsIl92b2ljaW5nUmVzcG9uc2VQYWNrZXQiLCJfdm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJkZWZhdWx0Rm9jdXNMaXN0ZW5lciIsInNldFZvaWNpbmdVdHRlcmFuY2UiLCJfdm9pY2luZ0NhblNwZWFrQ291bnQiLCJfYm91bmRJbnN0YW5jZXNDaGFuZ2VkTGlzdGVuZXIiLCJhZGRPclJlbW92ZUluc3RhbmNlTGlzdGVuZXJzIiwiY2hhbmdlZEluc3RhbmNlRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX3NwZWFrQ29udGVudE9uRm9jdXNMaXN0ZW5lciIsImZvY3VzIiwiZXZlbnQiLCJhZGRJbnB1dExpc3RlbmVyIiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwib3B0aW9ucyIsImhhc093blByb3BlcnR5IiwibmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSIsInZvaWNpbmdTcGVha1Jlc3BvbnNlIiwidm9pY2luZ1NwZWFrTmFtZVJlc3BvbnNlIiwidm9pY2luZ1NwZWFrT2JqZWN0UmVzcG9uc2UiLCJ2b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UiLCJ2b2ljaW5nU3BlYWtIaW50UmVzcG9uc2UiLCJzcGVha0NvbnRlbnQiLCJjb2xsZWN0UmVzcG9uc2UiLCJpZ25vcmVQcm9wZXJ0aWVzIiwicmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInZvaWNpbmdVdHRlcmFuY2UiLCJyZXNwb25zZSIsImNvbGxlY3RSZXNwb25zZXMiLCJhbGVydCIsImNvbnRlbnQiLCJub3RQaGV0aW9BcmNoZXR5cGUiLCJQSEVUX0lPX0VOQUJMRUQiLCJpc0luc2lkZVBoZXRpb0FyY2hldHlwZSIsImFkZFRvQmFjayIsInNldFZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwiZ2V0Vm9pY2luZ05hbWVSZXNwb25zZSIsInNldFZvaWNpbmdPYmplY3RSZXNwb25zZSIsInZvaWNpbmdPYmplY3RSZXNwb25zZSIsImdldFZvaWNpbmdPYmplY3RSZXNwb25zZSIsInNldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSIsInNldFZvaWNpbmdIaW50UmVzcG9uc2UiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0hpbnRSZXNwb25zZSIsInNldFZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMiLCJ2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzIiwiZ2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyIsInNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwicGF0dGVybnMiLCJ2b2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsImdldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlIiwicmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlIiwiZ2V0Vm9pY2luZ1V0dGVyYW5jZSIsImdldFZvaWNpbmdDYW5TcGVha1Byb3BlcnR5Iiwidm9pY2luZ0NhblNwZWFrUHJvcGVydHkiLCJzZXRWb2ljaW5nRm9jdXNMaXN0ZW5lciIsImZvY3VzTGlzdGVuZXIiLCJ2b2ljaW5nRm9jdXNMaXN0ZW5lciIsImdldFZvaWNpbmdGb2N1c0xpc3RlbmVyIiwiaXNWb2ljaW5nIiwiZGlzcG9zZSIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImNsZWFuIiwiY2FuU3BlYWsiLCJpbnN0YW5jZXMiLCJsZW5ndGgiLCJ2YWx1ZSIsImhhbmRsZUluc3RhbmNlc0NoYW5nZWQiLCJpbnN0YW5jZSIsImFkZGVkIiwiaXNWaXNpYmxlIiwidmlzaWJsZSIsInZvaWNpbmdWaXNpYmxlIiwiY2FuVm9pY2VFbWl0dGVyIiwiaXNEaXNwb3NlZCIsInVucmVnaXN0ZXJVdHRlcmFuY2VUb1ZvaWNpbmdOb2RlIiwibXV0YXRlIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwidW5pcSIsImFsZXJ0VXR0ZXJhbmNlIiwidm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcyIsInZvaWNpbmdOb2RlIiwiZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMiLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJyZWdpc3RlclV0dGVyYW5jZVRvTm9kZSIsIm5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJ2b2ljaW5nVmlzaWJsZVByb3BlcnR5IiwidW5yZWdpc3RlclV0dGVyYW5jZVRvTm9kZSIsInZpc2libGVQcm9wZXJ0eUluZGV4Iiwid2l0aG91dFZpc2libGVQcm9wZXJ0eSIsInZvaWNpbmdWaXNpYmxlUHJvcGVydHlJbmRleCIsIndpdGhvdXRCb3RoUHJvcGVydGllcyIsIndyYXBwZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZvaWNpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSB0cmFpdCBmb3IgTm9kZSB0aGF0IHN1cHBvcnRzIHRoZSBWb2ljaW5nIGZlYXR1cmUsIHVuZGVyIGFjY2Vzc2liaWxpdHkuIEFsbG93cyB5b3UgdG8gZGVmaW5lIHJlc3BvbnNlcyBmb3IgdGhlIE5vZGVcclxuICogYW5kIG1ha2UgcmVxdWVzdHMgdG8gc3BlYWsgdGhhdCBjb250ZW50IHVzaW5nIEhUTUw1IFNwZWVjaFN5bnRoZXNpcyBhbmQgdGhlIFV0dGVyYW5jZVF1ZXVlLiBWb2ljaW5nIGNvbnRlbnQgaXNcclxuICogb3JnYW5pemVkIGludG8gZm91ciBjYXRlZ29yaWVzIHdoaWNoIGFyZSByZXNwb25zaWJsZSBmb3IgZGVzY3JpYmluZyBkaWZmZXJlbnQgdGhpbmdzLiBSZXNwb25zZXMgYXJlIHN0b3JlZCBvbiB0aGVcclxuICogY29tcG9zZWQgdHlwZTogXCJSZXNwb25zZVBhY2tldC5cIiBTZWUgdGhhdCBmaWxlIGZvciBkZXRhaWxzIGFib3V0IHdoYXQgcmVzcG9uc2VzIGl0IHN0b3Jlcy4gT3V0cHV0IG9mIHRoaXMgY29udGVudFxyXG4gKiBjYW4gYmUgY29udHJvbGxlZCBieSB0aGUgcmVzcG9uc2VDb2xsZWN0b3IuIFJlc3BvbnNlcyBhcmUgZGVmaW5lZCBhcyB0aGUgZm9sbG93aW5nLiAuIC5cclxuICpcclxuICogLSBcIk5hbWVcIiByZXNwb25zZTogVGhlIG5hbWUgb2YgdGhlIG9iamVjdCB0aGF0IHVzZXMgVm9pY2luZy4gU2ltaWxhciB0byB0aGUgXCJBY2Nlc3NpYmxlIE5hbWVcIiBpbiB3ZWIgYWNjZXNzaWJpbGl0eS5cclxuICogLSBcIk9iamVjdFwiIHJlc3BvbnNlOiBUaGUgc3RhdGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG9iamVjdCB0aGF0IHVzZXMgVm9pY2luZy5cclxuICogLSBcIkNvbnRleHRcIiByZXNwb25zZTogVGhlIGNvbnRleHR1YWwgY2hhbmdlcyB0aGF0IHJlc3VsdCBmcm9tIGludGVyYWN0aW9uIHdpdGggdGhlIE5vZGUgdGhhdCB1c2VzIFZvaWNpbmcuXHJcbiAqIC0gXCJIaW50XCIgcmVzcG9uc2U6IEEgc3VwcG9ydGluZyBoaW50IHRoYXQgZ3VpZGVzIHRoZSB1c2VyIHRvd2FyZCBhIGRlc2lyZWQgaW50ZXJhY3Rpb24gd2l0aCB0aGlzIE5vZGUuXHJcbiAqXHJcbiAqIFNlZSBSZXNwb25zZVBhY2tldCwgYXMgd2VsbCBhcyB0aGUgcHJvcGVydHkgYW5kIHNldHRlciBkb2N1bWVudGF0aW9uIGZvciBlYWNoIG9mIHRoZXNlIHJlc3BvbnNlcyBmb3IgbW9yZVxyXG4gKiBpbmZvcm1hdGlvbi5cclxuICpcclxuICogT25jZSB0aGlzIGNvbnRlbnQgaXMgc2V0LCB5b3UgY2FuIG1ha2UgYSByZXF1ZXN0IHRvIHNwZWFrIGl0IHVzaW5nIGFuIFV0dGVyYW5jZVF1ZXVlIHdpdGggb25lIG9mIHRoZSBwcm92aWRlZFxyXG4gKiBmdW5jdGlvbnMgaW4gdGhpcyBUcmFpdC4gSXQgaXMgdXAgdG8geW91IHRvIGNhbGwgb25lIG9mIHRoZXNlIGZ1bmN0aW9ucyB3aGVuIHlvdSB3aXNoIGZvciBzcGVlY2ggdG8gYmUgbWFkZS4gVGhlIG9ubHlcclxuICogZXhjZXB0aW9uIGlzIG9uIHRoZSAnZm9jdXMnIGV2ZW50LiBFdmVyeSBOb2RlIHRoYXQgY29tcG9zZXMgVm9pY2luZyB3aWxsIHNwZWFrIGl0cyByZXNwb25zZXMgYnkgd2hlbiBpdFxyXG4gKiByZWNlaXZlcyBmb2N1cy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2luaGVyaXRhbmNlLmpzJztcclxuaW1wb3J0IFJlc3BvbnNlUGFja2V0LCB7IFJlc29sdmVkUmVzcG9uc2UsIFNwZWFrYWJsZVJlc29sdmVkT3B0aW9ucywgVm9pY2luZ1Jlc3BvbnNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcclxuaW1wb3J0IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24uanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlLCB7IFRBbGVydGFibGUsIFV0dGVyYW5jZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IHsgRGVsYXllZE11dGF0ZSwgSW5zdGFuY2UsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ09wdGlvbnMsIE5vZGUsIHNjZW5lcnksIFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uLCB2b2ljaW5nVXR0ZXJhbmNlUXVldWUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgcmVzcG9uc2VDb2xsZWN0b3IgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL3Jlc3BvbnNlQ29sbGVjdG9yLmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcblxyXG4vLyBIZWxwcyBlbmZvcmNlIHRoYXQgdGhlIHV0dGVyYW5jZSBpcyBkZWZpbmVkLlxyXG5mdW5jdGlvbiBhc3NlcnRVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlIHwgbnVsbCApOiBhc3NlcnRzIHV0dGVyYW5jZSBpcyBVdHRlcmFuY2Uge1xyXG4gIGlmICggISggdXR0ZXJhbmNlIGluc3RhbmNlb2YgVXR0ZXJhbmNlICkgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd1dHRlcmFuY2UgaXMgbm90IGFuIFV0dGVyYW5jZScgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIEFuIGltcGxlbWVudGF0aW9uIGNsYXNzIGZvciBWb2ljaW5nLnRzLCBvbmx5IHVzZWQgaW4gdGhpcyBjbGFzcyBzbyB0aGF0IHdlIGtub3cgaWYgd2Ugb3duIHRoZSBVdHRlcmFuY2UgYW5kIGNhblxyXG4vLyB0aGVyZWZvcmUgZGlzcG9zZSBpdC5cclxuY2xhc3MgT3duZWRWb2ljaW5nVXR0ZXJhbmNlIGV4dGVuZHMgVXR0ZXJhbmNlIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFV0dGVyYW5jZU9wdGlvbnMgKSB7XHJcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBvcHRpb25zIHRoYXQgYXJlIHN1cHBvcnRlZCBieSBWb2ljaW5nLmpzLiBBZGRlZCB0byBtdXRhdG9yIGtleXMgc28gdGhhdCBWb2ljaW5nIHByb3BlcnRpZXMgY2FuIGJlIHNldCB3aXRoIG11dGF0ZS5cclxuY29uc3QgVk9JQ0lOR19PUFRJT05fS0VZUyA9IFtcclxuICAndm9pY2luZ05hbWVSZXNwb25zZScsXHJcbiAgJ3ZvaWNpbmdPYmplY3RSZXNwb25zZScsXHJcbiAgJ3ZvaWNpbmdDb250ZXh0UmVzcG9uc2UnLFxyXG4gICd2b2ljaW5nSGludFJlc3BvbnNlJyxcclxuICAndm9pY2luZ1V0dGVyYW5jZScsXHJcbiAgJ3ZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uJyxcclxuICAndm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcycsXHJcbiAgJ3ZvaWNpbmdGb2N1c0xpc3RlbmVyJ1xyXG5dO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZVxyXG4gIHZvaWNpbmdOYW1lUmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XHJcblxyXG4gIC8vIHNlZSBSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZVxyXG4gIHZvaWNpbmdPYmplY3RSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcclxuXHJcbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0LmNvbnRleHRSZXNwb25zZVxyXG4gIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XHJcblxyXG4gIC8vIHNlZSBSZXNwb25zZVBhY2tldC5oaW50UmVzcG9uc2VcclxuICB2b2ljaW5nSGludFJlc3BvbnNlPzogVm9pY2luZ1Jlc3BvbnNlO1xyXG5cclxuICAvLyBzZWUgUmVzcG9uc2VQYWNrZXQucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvblxyXG4gIHZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uPzogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjtcclxuXHJcbiAgLy8gc2VlIFJlc3BvbnNlUGFja2V0Lmlnbm9yZVByb3BlcnRpZXNcclxuICB2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBOb2RlIGlzIGZvY3VzZWQgdG8gc3BlYWsgdm9pY2luZyByZXNwb25zZXMgb24gZm9jdXMuIFNlZSBWb2ljaW5nLmRlZmF1bHRGb2N1c0xpc3RlbmVyIGZvciBkZWZhdWx0XHJcbiAgLy8gbGlzdGVuZXIuXHJcbiAgdm9pY2luZ0ZvY3VzTGlzdGVuZXI/OiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB8IG51bGw7XHJcblxyXG4gIC8vIFRoZSB1dHRlcmFuY2UgdG8gdXNlIGlmIHlvdSB3YW50IHRoaXMgcmVzcG9uc2UgdG8gYmUgbW9yZSBjb250cm9sbGVkIGluIHRoZSBVdHRlcmFuY2VRdWV1ZS4gVGhpcyBVdHRlcmFuY2Ugd2lsbCBiZVxyXG4gIC8vIHVzZWQgYnkgYWxsIHJlc3BvbnNlcyBzcG9rZW4gYnkgdGhpcyBjbGFzcy4gTnVsbCB0byBub3QgdXNlIGFuIFV0dGVyYW5jZS5cclxuICB2b2ljaW5nVXR0ZXJhbmNlPzogVXR0ZXJhbmNlIHwgbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFZvaWNpbmdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ09wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBTcGVha2luZ09wdGlvbnMgPSB7XHJcbiAgdXR0ZXJhbmNlPzogU2VsZk9wdGlvbnNbJ3ZvaWNpbmdVdHRlcmFuY2UnXTtcclxufSAmIFNwZWFrYWJsZVJlc29sdmVkT3B0aW9ucztcclxuXHJcbmNvbnN0IFZvaWNpbmcgPSA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I8Tm9kZT4+KCBUeXBlOiBTdXBlclR5cGUgKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlc1xyXG5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggVHlwZSApLCBOb2RlICksICdPbmx5IE5vZGUgc3VidHlwZXMgc2hvdWxkIGNvbXBvc2UgVm9pY2luZycgKTtcclxuXHJcbiAgY29uc3QgVm9pY2luZ0NsYXNzID0gRGVsYXllZE11dGF0ZSggJ1ZvaWNpbmcnLCBWT0lDSU5HX09QVElPTl9LRVlTLCBjbGFzcyBWb2ljaW5nQ2xhc3MgZXh0ZW5kcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggVHlwZSApIHtcclxuXHJcbiAgICAvLyBSZXNwb25zZVBhY2tldCB0aGF0IGhvbGRzIGFsbCB0aGUgc3VwcG9ydGVkIHJlc3BvbnNlcyB0byBiZSBWb2ljZWRcclxuICAgIHByb3RlY3RlZCBfdm9pY2luZ1Jlc3BvbnNlUGFja2V0ITogUmVzcG9uc2VQYWNrZXQ7XHJcblxyXG4gICAgLy8gVGhlIHV0dGVyYW5jZSB0aGF0IGFsbCByZXNwb25zZXMgYXJlIHNwb2tlbiB0aHJvdWdoLlxyXG4gICAgcHJvdGVjdGVkIF92b2ljaW5nVXR0ZXJhbmNlOiBVdHRlcmFuY2UgfCBudWxsO1xyXG5cclxuICAgIC8vIENhbGxlZCB3aGVuIHRoaXMgbm9kZSBpcyBmb2N1c2VkLlxyXG4gICAgcHJpdmF0ZSBfdm9pY2luZ0ZvY3VzTGlzdGVuZXIhOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB8IG51bGw7XHJcblxyXG4gICAgLy8gSW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBOb2RlIGNhbiBzcGVhay4gQSBOb2RlIGNhbiBzcGVhayBpZiBzZWxmIGFuZCBhbGwgb2YgaXRzIGFuY2VzdG9ycyBhcmUgdmlzaWJsZSBhbmRcclxuICAgIC8vIHZvaWNpbmdWaXNpYmxlLlxyXG4gICAgcHJpdmF0ZSBfdm9pY2luZ0NhblNwZWFrUHJvcGVydHkhOiBUaW55UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gICAgLy8gQSBjb3VudGVyIHRoYXQga2VlcHMgdHJhY2sgb2YgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUgSW5zdGFuY2VzIG9mIHRoaXMgTm9kZS5cclxuICAgIC8vIEFzIGxvbmcgYXMgdGhpcyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gemVybywgdGhpcyBOb2RlIGNhbiBzcGVhay4gU2VlIG9uSW5zdGFuY2VWaXNpYmlsaXR5Q2hhbmdlXHJcbiAgICAvLyBhbmQgb25JbnN0YW5jZVZvaWNpbmdWaXNpYmlsaXR5Q2hhbmdlIGZvciBtb3JlIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXHJcbiAgICBwcml2YXRlIF92b2ljaW5nQ2FuU3BlYWtDb3VudCE6IG51bWJlcjtcclxuXHJcbiAgICAvLyBDYWxsZWQgd2hlbiBgY2FuVm9pY2VFbWl0dGVyYCBlbWl0cyBmb3IgYW4gSW5zdGFuY2UuXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9ib3VuZEluc3RhbmNlQ2FuVm9pY2VDaGFuZ2VMaXN0ZW5lcjogKCBjYW5TcGVhazogYm9vbGVhbiApID0+IHZvaWQ7XHJcblxyXG4gICAgLy8gV2hlbmV2ZXIgYW4gSW5zdGFuY2Ugb2YgdGhpcyBOb2RlIGlzIGFkZGVkIG9yIHJlbW92ZWQsIGFkZC9yZW1vdmUgbGlzdGVuZXJzIHRoYXQgd2lsbCB1cGRhdGUgdGhlXHJcbiAgICAvLyBjYW5TcGVha1Byb3BlcnR5LlxyXG4gICAgcHJpdmF0ZSBfYm91bmRJbnN0YW5jZXNDaGFuZ2VkTGlzdGVuZXIhOiAoIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xyXG5cclxuICAgIC8vIElucHV0IGxpc3RlbmVyIHRoYXQgc3BlYWtzIGNvbnRlbnQgb24gZm9jdXMuIFRoaXMgaXMgdGhlIG9ubHkgaW5wdXQgbGlzdGVuZXIgYWRkZWRcclxuICAgIC8vIGJ5IFZvaWNpbmcsIGJ1dCBpdCBpcyB0aGUgb25lIHRoYXQgaXMgY29uc2lzdGVudCBmb3IgYWxsIFZvaWNpbmcgbm9kZXMuIE9uIGZvY3VzLCBzcGVhayB0aGUgbmFtZSwgb2JqZWN0XHJcbiAgICAvLyByZXNwb25zZSwgYW5kIGludGVyYWN0aW9uIGhpbnQuXHJcbiAgICBwcml2YXRlIF9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIhOiB7IGZvY3VzOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxGb2N1c0V2ZW50PiB9O1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcclxuICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgIC8vIEJpbmQgdGhlIGxpc3RlbmVycyBvbiBjb25zdHJ1Y3Rpb24gdG8gYmUgYWRkZWQgdG8gb2JzZXJ2YWJsZXMgb24gaW5pdGlhbGl6ZSBhbmQgcmVtb3ZlZCBvbiBjbGVhbi9kaXNwb3NlLlxyXG4gICAgICAvLyBJbnN0YW5jZXMgYXJlIHVwZGF0ZWQgYXN5bmNocm9ub3VzbHkgaW4gdXBkYXRlRGlzcGxheS4gVGhlIGJpbmQgY3JlYXRlcyBhIG5ldyBmdW5jdGlvbiBhbmQgd2UgbmVlZCB0aGVcclxuICAgICAgLy8gcmVmZXJlbmNlIHRvIHBlcnNpc3QgdGhyb3VnaCB0aGUgY29tcGxldGlvbiBvZiBpbml0aWFsaXplIGFuZCBkaXNwb3NhbC5cclxuICAgICAgdGhpcy5fYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXIgPSB0aGlzLm9uSW5zdGFuY2VDYW5Wb2ljZUNoYW5nZS5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgICB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIFdlIG9ubHkgd2FudCB0byBjYWxsIHRoaXMgbWV0aG9kLCBub3QgYW55IHN1YnR5cGUgaW1wbGVtZW50YXRpb25cclxuICAgICAgVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5pbml0aWFsaXplLmNhbGwoIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXBhcmF0ZSBmcm9tIHRoZSBjb25zdHJ1Y3RvciB0byBzdXBwb3J0IGNhc2VzIHdoZXJlIFZvaWNpbmcgaXMgdXNlZCBpbiBQb29sYWJsZSBOb2Rlcy5cclxuICAgIC8vIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gYmVjYXVzZSB0aGluZ3MgbGlrZSBSaWNoVGV4dExpbmsgbmVlZCB0byBwcm92aWRlIGFyZ3VtZW50cyB0byBpbml0aWFsaXplLCBhbmQgVFMgY29tcGxhaW5zXHJcbiAgICAvLyBvdGhlcndpc2VcclxuICAgIHB1YmxpYyBpbml0aWFsaXplKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICk6IHRoaXMge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBzdXBlci5pbml0aWFsaXplICYmIHN1cGVyLmluaXRpYWxpemUoIGFyZ3MgKTtcclxuXHJcbiAgICAgIHRoaXMuX3ZvaWNpbmdDYW5TcGVha1Byb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxib29sZWFuPiggdHJ1ZSApO1xyXG4gICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQgPSBuZXcgUmVzcG9uc2VQYWNrZXQoKTtcclxuICAgICAgdGhpcy5fdm9pY2luZ0ZvY3VzTGlzdGVuZXIgPSB0aGlzLmRlZmF1bHRGb2N1c0xpc3RlbmVyO1xyXG5cclxuICAgICAgLy8gU2V0cyB0aGUgZGVmYXVsdCB2b2ljaW5nVXR0ZXJhbmNlIGFuZCBtYWtlcyB0aGlzLmNhblNwZWFrUHJvcGVydHkgYSBkZXBlbmRlbmN5IG9uIGl0cyBhYmlsaXR5IHRvIGFubm91bmNlLlxyXG4gICAgICB0aGlzLnNldFZvaWNpbmdVdHRlcmFuY2UoIG5ldyBPd25lZFZvaWNpbmdVdHRlcmFuY2UoKSApO1xyXG5cclxuICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgPSAwO1xyXG5cclxuICAgICAgdGhpcy5fYm91bmRJbnN0YW5jZXNDaGFuZ2VkTGlzdGVuZXIgPSB0aGlzLmFkZE9yUmVtb3ZlSW5zdGFuY2VMaXN0ZW5lcnMuYmluZCggdGhpcyApO1xyXG4gICAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2JvdW5kSW5zdGFuY2VzQ2hhbmdlZExpc3RlbmVyICk7XHJcblxyXG4gICAgICB0aGlzLl9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIgPSB7XHJcbiAgICAgICAgZm9jdXM6IGV2ZW50ID0+IHtcclxuICAgICAgICAgIHRoaXMuX3ZvaWNpbmdGb2N1c0xpc3RlbmVyICYmIHRoaXMuX3ZvaWNpbmdGb2N1c0xpc3RlbmVyKCBldmVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlYWsgYWxsIHJlc3BvbnNlcyBhc3NpZ25lZCB0byB0aGlzIE5vZGUuIE9wdGlvbnMgYWxsb3cgeW91IHRvIG92ZXJyaWRlIGEgcmVzcG9uc2VzIGZvciB0aGlzIHBhcnRpY3VsYXJcclxuICAgICAqIHNwZWVjaCByZXF1ZXN0LiBFYWNoIHJlc3BvbnNlIGlzIG9ubHkgc3Bva2VuIGlmIHRoZSBhc3NvY2lhdGVkIFByb3BlcnR5IG9mIHJlc3BvbnNlQ29sbGVjdG9yIGlzIHRydWUuIElmXHJcbiAgICAgKiBhbGwgYXJlIFByb3BlcnRpZXMgYXJlIGZhbHNlLCBub3RoaW5nIHdpbGwgYmUgc3Bva2VuLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIGFyZSBwYXNzZWQgYWxvbmcgdG8gY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UsIHNlZSB0aGF0IGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIG9wdGlvbnNcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFNwZWFraW5nT3B0aW9ucz4oIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAgIC8vIExhemlseSBmb3JtdWxhdGUgc3RyaW5ncyBvbmx5IGFzIG5lZWRlZFxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnbmFtZVJlc3BvbnNlJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMubmFtZVJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnb2JqZWN0UmVzcG9uc2UnICkgKSB7XHJcbiAgICAgICAgb3B0aW9ucy5vYmplY3RSZXNwb25zZSA9IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnY29udGV4dFJlc3BvbnNlJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMuY29udGV4dFJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmNvbnRleHRSZXNwb25zZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnaGludFJlc3BvbnNlJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMuaGludFJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlYWsgT05MWSB0aGUgcHJvdmlkZWQgcmVzcG9uc2VzIHRoYXQgeW91IHBhc3MgaW4gd2l0aCBvcHRpb25zLiBUaGlzIHdpbGwgTk9UIHNwZWFrIHRoZSBuYW1lLCBvYmplY3QsXHJcbiAgICAgKiBjb250ZXh0LCBvciBoaW50IHJlc3BvbnNlcyBhc3NpZ25lZCB0byB0aGlzIG5vZGUgYnkgZGVmYXVsdC4gQnV0IGl0IGFsbG93cyBmb3IgY2xhcml0eSBhdCB1c2FnZXMgc28gaXQgaXNcclxuICAgICAqIGNsZWFyIHRoYXQgeW91IGFyZSBvbmx5IHJlcXVlc3RpbmcgY2VydGFpbiByZXNwb25zZXMuIElmIHlvdSB3YW50IHRvIHNwZWFrIGFsbCBvZiB0aGUgcmVzcG9uc2VzIGFzc2lnbmVkXHJcbiAgICAgKiB0byB0aGlzIE5vZGUsIHVzZSB2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UoKS5cclxuICAgICAqXHJcbiAgICAgKiBFYWNoIHJlc3BvbnNlIHdpbGwgb25seSBiZSBzcG9rZW4gaWYgdGhlIFByb3BlcnRpZXMgb2YgcmVzcG9uc2VDb2xsZWN0b3IgYXJlIHRydWUuIElmIGFsbCBvZiB0aG9zZSBhcmUgZmFsc2UsXHJcbiAgICAgKiBub3RoaW5nIHdpbGwgYmUgc3Bva2VuLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdm9pY2luZ1NwZWFrUmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkIHtcclxuXHJcbiAgICAgIC8vIG9wdGlvbnMgYXJlIHBhc3NlZCBhbG9uZyB0byBjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSwgc2VlIHRoYXQgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgb3B0aW9uc1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8U3BlYWtpbmdPcHRpb25zPigge1xyXG4gICAgICAgIG5hbWVSZXNwb25zZTogbnVsbCxcclxuICAgICAgICBvYmplY3RSZXNwb25zZTogbnVsbCxcclxuICAgICAgICBjb250ZXh0UmVzcG9uc2U6IG51bGwsXHJcbiAgICAgICAgaGludFJlc3BvbnNlOiBudWxsXHJcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnkgZGVmYXVsdCwgc3BlYWsgdGhlIG5hbWUgcmVzcG9uc2UuIEJ1dCBhY2NlcHRzIGFsbCBvdGhlciByZXNwb25zZXMgdGhyb3VnaCBvcHRpb25zLiBSZXNwZWN0cyByZXNwb25zZUNvbGxlY3RvclxyXG4gICAgICogUHJvcGVydGllcywgc28gdGhlIG5hbWUgcmVzcG9uc2UgbWF5IG5vdCBiZSBzcG9rZW4gaWYgcmVzcG9uc2VDb2xsZWN0b3IubmFtZVJlc3BvbnNlRW5hYmxlZFByb3BlcnR5IGlzIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdm9pY2luZ1NwZWFrTmFtZVJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIGFyZSBwYXNzZWQgYWxvbmcgdG8gY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UsIHNlZSB0aGF0IGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIG9wdGlvbnNcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFNwZWFraW5nT3B0aW9ucz4oIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAgIC8vIExhemlseSBmb3JtdWxhdGUgc3RyaW5ncyBvbmx5IGFzIG5lZWRlZFxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnbmFtZVJlc3BvbnNlJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMubmFtZVJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnkgZGVmYXVsdCwgc3BlYWsgdGhlIG9iamVjdCByZXNwb25zZS4gQnV0IGFjY2VwdHMgYWxsIG90aGVyIHJlc3BvbnNlcyB0aHJvdWdoIG9wdGlvbnMuIFJlc3BlY3RzIHJlc3BvbnNlQ29sbGVjdG9yXHJcbiAgICAgKiBQcm9wZXJ0aWVzLCBzbyB0aGUgb2JqZWN0IHJlc3BvbnNlIG1heSBub3QgYmUgc3Bva2VuIGlmIHJlc3BvbnNlQ29sbGVjdG9yLm9iamVjdFJlc3BvbnNlRW5hYmxlZFByb3BlcnR5IGlzIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdm9pY2luZ1NwZWFrT2JqZWN0UmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkIHtcclxuXHJcbiAgICAgIC8vIG9wdGlvbnMgYXJlIHBhc3NlZCBhbG9uZyB0byBjb2xsZWN0QW5kU3BlYWtSZXNwb25zZSwgc2VlIHRoYXQgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgb3B0aW9uc1xyXG4gICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8U3BlYWtpbmdPcHRpb25zPigge30sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgICAgLy8gTGF6aWx5IGZvcm11bGF0ZSBzdHJpbmdzIG9ubHkgYXMgbmVlZGVkXHJcbiAgICAgIGlmICggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdvYmplY3RSZXNwb25zZScgKSApIHtcclxuICAgICAgICBvcHRpb25zLm9iamVjdFJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm9iamVjdFJlc3BvbnNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlKCBvcHRpb25zICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCeSBkZWZhdWx0LCBzcGVhayB0aGUgY29udGV4dCByZXNwb25zZS4gQnV0IGFjY2VwdHMgYWxsIG90aGVyIHJlc3BvbnNlcyB0aHJvdWdoIG9wdGlvbnMuIFJlc3BlY3RzXHJcbiAgICAgKiByZXNwb25zZUNvbGxlY3RvciBQcm9wZXJ0aWVzLCBzbyB0aGUgY29udGV4dCByZXNwb25zZSBtYXkgbm90IGJlIHNwb2tlbiBpZlxyXG4gICAgICogcmVzcG9uc2VDb2xsZWN0b3IuY29udGV4dFJlc3BvbnNlRW5hYmxlZFByb3BlcnR5IGlzIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdm9pY2luZ1NwZWFrQ29udGV4dFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogdm9pZCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIGFyZSBwYXNzZWQgYWxvbmcgdG8gY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UsIHNlZSB0aGF0IGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIG9wdGlvbnNcclxuICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFNwZWFraW5nT3B0aW9ucz4oIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAgIC8vIExhemlseSBmb3JtdWxhdGUgc3RyaW5ncyBvbmx5IGFzIG5lZWRlZFxyXG4gICAgICBpZiAoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAnY29udGV4dFJlc3BvbnNlJyApICkge1xyXG4gICAgICAgIG9wdGlvbnMuY29udGV4dFJlc3BvbnNlID0gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmNvbnRleHRSZXNwb25zZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jb2xsZWN0QW5kU3BlYWtSZXNwb25zZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQnkgZGVmYXVsdCwgc3BlYWsgdGhlIGhpbnQgcmVzcG9uc2UuIEJ1dCBhY2NlcHRzIGFsbCBvdGhlciByZXNwb25zZXMgdGhyb3VnaCBvcHRpb25zLiBSZXNwZWN0c1xyXG4gICAgICogcmVzcG9uc2VDb2xsZWN0b3IgUHJvcGVydGllcywgc28gdGhlIGhpbnQgcmVzcG9uc2UgbWF5IG5vdCBiZSBzcG9rZW4gaWZcclxuICAgICAqIHJlc3BvbnNlQ29sbGVjdG9yLmhpbnRSZXNwb25zZUVuYWJsZWRQcm9wZXJ0eSBpcyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHZvaWNpbmdTcGVha0hpbnRSZXNwb25zZSggcHJvdmlkZWRPcHRpb25zPzogU3BlYWtpbmdPcHRpb25zICk6IHZvaWQge1xyXG5cclxuICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIGFsb25nIHRvIGNvbGxlY3RBbmRTcGVha1Jlc3BvbnNlLCBzZWUgdGhhdCBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBvcHRpb25zXHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTcGVha2luZ09wdGlvbnM+KCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgICAvLyBMYXppbHkgZm9ybXVsYXRlIHN0cmluZ3Mgb25seSBhcyBuZWVkZWRcclxuICAgICAgaWYgKCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2hpbnRSZXNwb25zZScgKSApIHtcclxuICAgICAgICBvcHRpb25zLmhpbnRSZXNwb25zZSA9IHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5oaW50UmVzcG9uc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UoIG9wdGlvbnMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbGxlY3QgcmVzcG9uc2VzIHdpdGggdGhlIHJlc3BvbnNlQ29sbGVjdG9yIGFuZCBzcGVhayB0aGUgb3V0cHV0IHdpdGggYW4gVXR0ZXJhbmNlUXVldWUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29sbGVjdEFuZFNwZWFrUmVzcG9uc2UoIHByb3ZpZGVkT3B0aW9ucz86IFNwZWFraW5nT3B0aW9ucyApOiB2b2lkIHtcclxuICAgICAgdGhpcy5zcGVha0NvbnRlbnQoIHRoaXMuY29sbGVjdFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnMgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tYmluZSBhbGwgdHlwZXMgb2YgcmVzcG9uc2UgaW50byBhIHNpbmdsZSBhbGVydGFibGUsIHBvdGVudGlhbGx5IGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCBzdGF0ZSBvZlxyXG4gICAgICogcmVzcG9uc2VDb2xsZWN0b3IgUHJvcGVydGllcyAoZmlsdGVyaW5nIHdoYXQga2luZCBvZiByZXNwb25zZXMgdG8gcHJlc2VudCBpbiB0aGUgcmVzb2x2ZWQgcmVzcG9uc2UpLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY29sbGVjdFJlc3BvbnNlKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2luZ09wdGlvbnMgKTogVEFsZXJ0YWJsZSB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTcGVha2luZ09wdGlvbnM+KCB7XHJcbiAgICAgICAgaWdub3JlUHJvcGVydGllczogdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lmlnbm9yZVByb3BlcnRpZXMsXHJcbiAgICAgICAgcmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbjogdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24sXHJcbiAgICAgICAgdXR0ZXJhbmNlOiB0aGlzLnZvaWNpbmdVdHRlcmFuY2VcclxuICAgICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgICBsZXQgcmVzcG9uc2U6IFRBbGVydGFibGUgPSByZXNwb25zZUNvbGxlY3Rvci5jb2xsZWN0UmVzcG9uc2VzKCBvcHRpb25zICk7XHJcblxyXG4gICAgICBpZiAoIG9wdGlvbnMudXR0ZXJhbmNlICkge1xyXG4gICAgICAgIG9wdGlvbnMudXR0ZXJhbmNlLmFsZXJ0ID0gcmVzcG9uc2U7XHJcbiAgICAgICAgcmVzcG9uc2UgPSBvcHRpb25zLnV0dGVyYW5jZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGNyZWF0ZSBjb250ZW50IHRvIHNwZWFrIGluIHJlc3BvbnNlIHRvIGlucHV0LiBUaGUgY29udGVudCBpcyB0aGVuIGFkZGVkIHRvIHRoZVxyXG4gICAgICogYmFjayBvZiB0aGUgdm9pY2luZyBVdHRlcmFuY2VRdWV1ZS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHNwZWFrQ29udGVudCggY29udGVudDogVEFsZXJ0YWJsZSApOiB2b2lkIHtcclxuXHJcbiAgICAgIGNvbnN0IG5vdFBoZXRpb0FyY2hldHlwZSA9ICFUYW5kZW0uUEhFVF9JT19FTkFCTEVEIHx8ICF0aGlzLmlzSW5zaWRlUGhldGlvQXJjaGV0eXBlKCk7XHJcblxyXG4gICAgICAvLyBkb24ndCBzZW5kIHRvIHV0dGVyYW5jZVF1ZXVlIGlmIHJlc3BvbnNlIGlzIGVtcHR5XHJcbiAgICAgIC8vIGRvbid0IHNlbmQgdG8gdXR0ZXJhbmNlUXVldWUgZm9yIFBoRVQtaU8gZHluYW1pYyBlbGVtZW50IGFyY2hldHlwZXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODE3XHJcbiAgICAgIGlmICggY29udGVudCAmJiBub3RQaGV0aW9BcmNoZXR5cGUgKSB7XHJcbiAgICAgICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggY29udGVudCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSB0aGUgbGFiZWwgb2YgdGhlIGVsZW1lbnQgYW5kIGlzIHNwb2tlblxyXG4gICAgICogd2hlbiB0aGUgb2JqZWN0IHJlY2VpdmVzIGlucHV0LiBXaGVuIHJlcXVlc3Rpbmcgc3BlZWNoLCB0aGlzIHdpbGwgb25seSBiZSBzcG9rZW4gaWZcclxuICAgICAqIHJlc3BvbnNlQ29sbGVjdG9yLm5hbWVSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQubmFtZVJlc3BvbnNlID0gcmVzcG9uc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nTmFtZVJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICkgeyB0aGlzLnNldFZvaWNpbmdOYW1lUmVzcG9uc2UoIHJlc3BvbnNlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZvaWNpbmdOYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdOYW1lUmVzcG9uc2UoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlIGZvciB0aGlzIE5vZGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRWb2ljaW5nTmFtZVJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm5hbWVSZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgb2JqZWN0IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSB0aGUgc3RhdGUgaW5mb3JtYXRpb24gYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZSwgc3VjaFxyXG4gICAgICogYXMgaXRzIGN1cnJlbnQgaW5wdXQgdmFsdWUuIFdoZW4gcmVxdWVzdGluZyBzcGVlY2gsIHRoaXMgd2lsbCBvbmx5IGJlIGhlYXJkIHdoZW5cclxuICAgICAqIHJlc3BvbnNlQ29sbGVjdG9yLm9iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSBpcyBzZXQgdG8gdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFZvaWNpbmdPYmplY3RSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkIHtcclxuICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0Lm9iamVjdFJlc3BvbnNlID0gcmVzcG9uc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nT2JqZWN0UmVzcG9uc2UoIHJlc3BvbnNlOiBWb2ljaW5nUmVzcG9uc2UgKSB7IHRoaXMuc2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlKCByZXNwb25zZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCB2b2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdPYmplY3RSZXNwb25zZSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBvYmplY3QgcmVzcG9uc2UgZm9yIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFZvaWNpbmdPYmplY3RSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5vYmplY3RSZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgY29udGV4dCByZXNwb25zZSBmb3IgdGhpcyBOb2RlLiBUaGlzIGlzIHVzdWFsbHkgdGhlIGNvbnRlbnQgdGhhdCBkZXNjcmliZXMgd2hhdCBoYXMgaGFwcGVuZWQgaW5cclxuICAgICAqIHRoZSBzdXJyb3VuZGluZyBhcHBsaWNhdGlvbiBpbiByZXNwb25zZSB0byBpbnRlcmFjdGlvbiB3aXRoIHRoaXMgTm9kZS4gV2hlbiByZXF1ZXN0aW5nIHNwZWVjaCwgdGhpcyB3aWxsXHJcbiAgICAgKiBvbmx5IGJlIGhlYXJkIGlmIHJlc3BvbnNlQ29sbGVjdG9yLmNvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuY29udGV4dFJlc3BvbnNlID0gcmVzcG9uc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nQ29udGV4dFJlc3BvbnNlKCByZXNwb25zZTogVm9pY2luZ1Jlc3BvbnNlICkgeyB0aGlzLnNldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UoIHJlc3BvbnNlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZvaWNpbmdDb250ZXh0UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgY29udGV4dCByZXNwb25zZSBmb3IgdGhpcyBOb2RlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSgpOiBSZXNvbHZlZFJlc3BvbnNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5jb250ZXh0UmVzcG9uc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBoaW50IHJlc3BvbnNlIGZvciB0aGlzIE5vZGUuIFRoaXMgaXMgdXN1YWxseSBhIHJlc3BvbnNlIHRoYXQgZGVzY3JpYmVzIGhvdyB0byBpbnRlcmFjdCB3aXRoIHRoaXMgTm9kZS5cclxuICAgICAqIFdoZW4gcmVxdWVzdGluZyBzcGVlY2gsIHRoaXMgd2lsbCBvbmx5IGJlIHNwb2tlbiB3aGVuIHJlc3BvbnNlQ29sbGVjdG9yLmhpbnRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkgaXMgc2V0IHRvXHJcbiAgICAgKiB0cnVlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0Vm9pY2luZ0hpbnRSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkIHtcclxuICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZSA9IHJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgdm9pY2luZ0hpbnRSZXNwb25zZSggcmVzcG9uc2U6IFZvaWNpbmdSZXNwb25zZSApIHsgdGhpcy5zZXRWb2ljaW5nSGludFJlc3BvbnNlKCByZXNwb25zZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCB2b2ljaW5nSGludFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2UgeyByZXR1cm4gdGhpcy5nZXRWb2ljaW5nSGludFJlc3BvbnNlKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGhpbnQgcmVzcG9uc2UgZm9yIHRoaXMgTm9kZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFZvaWNpbmdIaW50UmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuaGludFJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHdoZXRoZXIgb3Igbm90IGFsbCByZXNwb25zZXMgZm9yIHRoaXMgTm9kZSB3aWxsIGlnbm9yZSB0aGUgUHJvcGVydGllcyBvZiByZXNwb25zZUNvbGxlY3Rvci4gSWYgZmFsc2UsXHJcbiAgICAgKiBhbGwgcmVzcG9uc2VzIHdpbGwgYmUgc3Bva2VuIHJlZ2FyZGxlc3Mgb2YgcmVzcG9uc2VDb2xsZWN0b3IgUHJvcGVydGllcywgd2hpY2ggYXJlIGdlbmVyYWxseSBzZXQgaW4gdXNlclxyXG4gICAgICogcHJlZmVyZW5jZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRWb2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzKCBpZ25vcmVQcm9wZXJ0aWVzOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQuaWdub3JlUHJvcGVydGllcyA9IGlnbm9yZVByb3BlcnRpZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzKCBpZ25vcmVQcm9wZXJ0aWVzOiBib29sZWFuICkgeyB0aGlzLnNldFZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMoIGlnbm9yZVByb3BlcnRpZXMgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcygpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgd2hldGhlciBvciBub3QgcmVzcG9uc2VzIGFyZSBpZ25vcmluZyByZXNwb25zZUNvbGxlY3RvciBQcm9wZXJ0aWVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Vm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcygpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5pZ25vcmVQcm9wZXJ0aWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgY29sbGVjdGlvbiBvZiBwYXR0ZXJucyB0byB1c2UgZm9yIHZvaWNpbmcgcmVzcG9uc2VzLCBjb250cm9sbGluZyB0aGUgb3JkZXIsIHB1bmN0dWF0aW9uLCBhbmRcclxuICAgICAqIGFkZGl0aW9uYWwgY29udGVudCBmb3IgZWFjaCBjb21iaW5hdGlvbiBvZiByZXNwb25zZS4gU2VlIFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24uanMgaWYgeW91IHdpc2ggdG8gdXNlXHJcbiAgICAgKiBhIGNvbGxlY3Rpb24gb2Ygc3RyaW5nIHBhdHRlcm5zIHRoYXQgYXJlIG5vdCB0aGUgZGVmYXVsdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJuczogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiApOiB2b2lkIHtcclxuXHJcbiAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uID0gcGF0dGVybnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiggcGF0dGVybnM6IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gKSB7IHRoaXMuc2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oIHBhdHRlcm5zICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk6IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24geyByZXR1cm4gdGhpcy5nZXRWb2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gb2JqZWN0IHRoYXQgdGhpcyBWb2ljaW5nIE5vZGUgaXMgdXNpbmcgdG8gY29sbGVjdCByZXNwb25zZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRWb2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdXR0ZXJhbmNlIHRocm91Z2ggd2hpY2ggdm9pY2luZyBhc3NvY2lhdGVkIHdpdGggdGhpcyBOb2RlIHdpbGwgYmUgc3Bva2VuLiBCeSBkZWZhdWx0IG9uIGluaXRpYWxpemUsXHJcbiAgICAgKiBvbmUgd2lsbCBiZSBjcmVhdGVkLCBidXQgYSBjdXN0b20gb25lIGNhbiBvcHRpb25hbGx5IGJlIHByb3ZpZGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0Vm9pY2luZ1V0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcbiAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSAhPT0gdXR0ZXJhbmNlICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgKSB7XHJcbiAgICAgICAgICB0aGlzLmNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHV0dGVyYW5jZSwgdGhpcyApO1xyXG4gICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgPSB1dHRlcmFuY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHZvaWNpbmdVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICkgeyB0aGlzLnNldFZvaWNpbmdVdHRlcmFuY2UoIHV0dGVyYW5jZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCB2b2ljaW5nVXR0ZXJhbmNlKCk6IFV0dGVyYW5jZSB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdVdHRlcmFuY2UoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgdXR0ZXJhbmNlIHRocm91Z2ggd2hpY2ggdm9pY2luZyBhc3NvY2lhdGVkIHdpdGggdGhpcyBOb2RlIHdpbGwgYmUgc3Bva2VuLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Vm9pY2luZ1V0dGVyYW5jZSgpOiBVdHRlcmFuY2Uge1xyXG4gICAgICBhc3NlcnRVdHRlcmFuY2UoIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIFByb3BlcnR5IGluZGljYXRpbmcgdGhhdCB0aGlzIFZvaWNpbmcgTm9kZSBjYW4gc3BlYWsuIFRydWUgd2hlbiB0aGlzIFZvaWNpbmcgTm9kZSBhbmQgYWxsIG9mIGl0c1xyXG4gICAgICogYW5jZXN0b3JzIGFyZSB2aXNpYmxlIGFuZCB2b2ljaW5nVmlzaWJsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldFZvaWNpbmdDYW5TcGVha1Byb3BlcnR5KCk6IFRpbnlQcm9wZXJ0eTxib29sZWFuPiB7XHJcbiAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZvaWNpbmdDYW5TcGVha1Byb3BlcnR5KCkgeyByZXR1cm4gdGhpcy5nZXRWb2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbmV2ZXIgdGhpcyBOb2RlIGlzIGZvY3VzZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRWb2ljaW5nRm9jdXNMaXN0ZW5lciggZm9jdXNMaXN0ZW5lcjogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248Rm9jdXNFdmVudD4gfCBudWxsICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl92b2ljaW5nRm9jdXNMaXN0ZW5lciA9IGZvY3VzTGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2b2ljaW5nRm9jdXNMaXN0ZW5lciggZm9jdXNMaXN0ZW5lcjogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248Rm9jdXNFdmVudD4gfCBudWxsICkgeyB0aGlzLnNldFZvaWNpbmdGb2N1c0xpc3RlbmVyKCBmb2N1c0xpc3RlbmVyICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHZvaWNpbmdGb2N1c0xpc3RlbmVyKCk6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uPEZvY3VzRXZlbnQ+IHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFZvaWNpbmdGb2N1c0xpc3RlbmVyKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHV0dGVyYW5jZVF1ZXVlIHRocm91Z2ggd2hpY2ggdm9pY2luZyBhc3NvY2lhdGVkIHdpdGggdGhpcyBOb2RlIHdpbGwgYmUgc3Bva2VuLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIoKTogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248Rm9jdXNFdmVudD4gfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdGb2N1c0xpc3RlbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlZmF1bHQgZm9jdXMgbGlzdGVuZXIgYXR0YWNoZWQgdG8gdGhpcyBOb2RlIGR1cmluZyBpbml0aWFsaXphdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRlZmF1bHRGb2N1c0xpc3RlbmVyKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSgge1xyXG4gICAgICAgIGNvbnRleHRSZXNwb25zZTogbnVsbFxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGEgTm9kZSBjb21wb3NlcyBWb2ljaW5nLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGlzVm9pY2luZygpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRhY2hlcyByZWZlcmVuY2VzIHRoYXQgZW5zdXJlIHRoaXMgY29tcG9uZW50cyBvZiB0aGlzIFRyYWl0IGFyZSBlbGlnaWJsZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9zcGVha0NvbnRlbnRPbkZvY3VzTGlzdGVuZXIgKTtcclxuICAgICAgdGhpcy5jaGFuZ2VkSW5zdGFuY2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9ib3VuZEluc3RhbmNlc0NoYW5nZWRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlICkge1xyXG4gICAgICAgIHRoaXMuY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlKCk7XHJcbiAgICAgICAgdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSA9IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xlYW4oKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fc3BlYWtDb250ZW50T25Gb2N1c0xpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMuY2hhbmdlZEluc3RhbmNlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fYm91bmRJbnN0YW5jZXNDaGFuZ2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSApIHtcclxuICAgICAgICB0aGlzLmNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpO1xyXG4gICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIHN1cGVyLmNsZWFuICYmIHN1cGVyLmNsZWFuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgLy8gUFJJVkFURSBNRVRIT0RTXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIHZpc2liaWxpdHkgYW5kIHZvaWNpbmdWaXNpYmlsaXR5IGNoYW5nZSBzdWNoIHRoYXQgdGhlIEluc3RhbmNlIGNhbiBub3cgc3BlYWssIHVwZGF0ZSB0aGUgY291bnRpbmdcclxuICAgICAqIHZhcmlhYmxlIHRoYXQgdHJhY2tzIGhvdyBtYW55IEluc3RhbmNlcyBvZiB0aGlzIFZvaWNpbmdOb2RlIGNhbiBzcGVhay4gVG8gc3BlYWsgdGhlIEluc3RhbmNlIG11c3QgYmUgZ2xvYmFsbHlcXFxyXG4gICAgICogdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgb25JbnN0YW5jZUNhblZvaWNlQ2hhbmdlKCBjYW5TcGVhazogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICAgIGlmICggY2FuU3BlYWsgKSB7XHJcbiAgICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudC0tO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudCA+PSAwLCAndGhlIHZvaWNpbmdDYW5TcGVha0NvdW50IHNob3VsZCBub3QgZ28gYmVsb3cgemVybycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgPD0gdGhpcy5pbnN0YW5jZXMubGVuZ3RoLFxyXG4gICAgICAgICdUaGUgdm9pY2luZ0NhblNwZWFrQ291bnQgY2Fubm90IGJlIGdyZWF0ZXIgdGhhbiB0aGUgbnVtYmVyIG9mIEluc3RhbmNlcy4nICk7XHJcblxyXG4gICAgICB0aGlzLl92b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50ID4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSB0aGUgY2FuU3BlYWtQcm9wZXJ0eSBhbmQgY291bnRpbmcgdmFyaWFibGUgaW4gcmVzcG9uc2UgdG8gYW4gSW5zdGFuY2Ugb2YgdGhpcyBOb2RlIGJlaW5nIGFkZGVkIG9yXHJcbiAgICAgKiByZW1vdmVkLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhhbmRsZUluc3RhbmNlc0NoYW5nZWQoIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IGluc3RhbmNlLnZpc2libGUgJiYgaW5zdGFuY2Uudm9pY2luZ1Zpc2libGU7XHJcbiAgICAgIGlmICggaXNWaXNpYmxlICkge1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgYWRkZWQgSW5zdGFuY2Ugd2FzIHZpc2libGUgYW5kIHZvaWNpbmdWaXNpYmxlIGl0IHNob3VsZCBpbmNyZW1lbnQgdGhlIGNvdW50ZXIuIElmIHRoZSByZW1vdmVkXHJcbiAgICAgICAgLy8gaW5zdGFuY2UgaXMgTk9UIHZpc2libGUvdm9pY2luZ1Zpc2libGUgaXQgd291bGQgbm90IGhhdmUgY29udHJpYnV0ZWQgdG8gdGhlIGNvdW50ZXIgc28gd2Ugc2hvdWxkIG5vdFxyXG4gICAgICAgIC8vIGRlY3JlbWVudCBpbiB0aGF0IGNhc2UuXHJcbiAgICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrQ291bnQgPSBhZGRlZCA/IHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50ICsgMSA6IHRoaXMuX3ZvaWNpbmdDYW5TcGVha0NvdW50IC0gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fdm9pY2luZ0NhblNwZWFrUHJvcGVydHkudmFsdWUgPSB0aGlzLl92b2ljaW5nQ2FuU3BlYWtDb3VudCA+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgb3IgcmVtb3ZlIGxpc3RlbmVycyBvbiBhbiBJbnN0YW5jZSB3YXRjaGluZyBmb3IgY2hhbmdlcyB0byB2aXNpYmxlIG9yIHZvaWNpbmdWaXNpYmxlIHRoYXQgd2lsbCBtb2RpZnlcclxuICAgICAqIHRoZSB2b2ljaW5nQ2FuU3BlYWtDb3VudC4gU2VlIGRvY3VtZW50YXRpb24gZm9yIHZvaWNpbmdDYW5TcGVha0NvdW50IGZvciBkZXRhaWxzIGFib3V0IGhvdyB0aGlzIGNvbnRyb2xzIHRoZVxyXG4gICAgICogdm9pY2luZ0NhblNwZWFrUHJvcGVydHkuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYWRkT3JSZW1vdmVJbnN0YW5jZUxpc3RlbmVycyggaW5zdGFuY2U6IEluc3RhbmNlLCBhZGRlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UuY2FuVm9pY2VFbWl0dGVyLCAnSW5zdGFuY2UgbXVzdCBiZSBpbml0aWFsaXplZC4nICk7XHJcblxyXG4gICAgICBpZiAoIGFkZGVkICkge1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBFbWl0dGVycyBpbiBJbnN0YW5jZSBuZWVkIHR5cGluZ1xyXG4gICAgICAgIGluc3RhbmNlLmNhblZvaWNlRW1pdHRlciEuYWRkTGlzdGVuZXIoIHRoaXMuX2JvdW5kSW5zdGFuY2VDYW5Wb2ljZUNoYW5nZUxpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEVtaXR0ZXJzIGluIEluc3RhbmNlIG5lZWQgdHlwaW5nXHJcbiAgICAgICAgaW5zdGFuY2UuY2FuVm9pY2VFbWl0dGVyIS5yZW1vdmVMaXN0ZW5lciggdGhpcy5fYm91bmRJbnN0YW5jZUNhblZvaWNlQ2hhbmdlTGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZWFnZXJseSB1cGRhdGUgdGhlIGNhblNwZWFrUHJvcGVydHkgYW5kIGNvdW50aW5nIHZhcmlhYmxlcyBpbiBhZGRpdGlvbiB0byBhZGRpbmcgY2hhbmdlIGxpc3RlbmVyc1xyXG4gICAgICB0aGlzLmhhbmRsZUluc3RhbmNlc0NoYW5nZWQoIGluc3RhbmNlLCBhZGRlZCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYW4gdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSwgZGlzcG9zaW5nIGlmIHdlIG93biBpdCBvciB1bnJlZ2lzdGVyaW5nIGl0IGlmIHdlIGRvIG5vdC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpOiB2b2lkIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSwgJ0Egdm9pY2luZ1V0dGVyYW5jZSBtdXN0IGJlIGF2YWlsYWJsZSB0byBjbGVhbi4nICk7XHJcbiAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSBpbnN0YW5jZW9mIE93bmVkVm9pY2luZ1V0dGVyYW5jZSApIHtcclxuICAgICAgICB0aGlzLl92b2ljaW5nVXR0ZXJhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSAmJiAhdGhpcy5fdm9pY2luZ1V0dGVyYW5jZS5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAgIFZvaWNpbmcudW5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUoIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UsIHRoaXMgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBTZWxmT3B0aW9ucyAmIFBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPFN1cGVyVHlwZT5bICdtdXRhdGUnIF0+WyAwIF0gKTogdGhpcyB7XHJcbiAgICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBOb2RlLm11dGF0ZSggb3B0aW9ucyApLCBpblxyXG4gICAqIHRoZSBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkLlxyXG4gICAqXHJcbiAgICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXHJcbiAgICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXHJcbiAgICovXHJcbiAgVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBWT0lDSU5HX09QVElPTl9LRVlTLmNvbmNhdCggVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBWb2ljaW5nQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cy5sZW5ndGggPT09IF8udW5pcSggVm9pY2luZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgbXV0YXRvciBrZXlzIGluIFZvaWNpbmcnICk7XHJcblxyXG4gIHJldHVybiBWb2ljaW5nQ2xhc3M7XHJcbn07XHJcblxyXG5Wb2ljaW5nLlZPSUNJTkdfT1BUSU9OX0tFWVMgPSBWT0lDSU5HX09QVElPTl9LRVlTO1xyXG5cclxuLyoqXHJcbiAqIEFsZXJ0IGFuIFV0dGVyYW5jZSB0byB0aGUgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLiBUaGUgVXR0ZXJhbmNlIG11c3QgaGF2ZSB2b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzIGFuZCBob3BlZnVsbHlcclxuICogYXQgbGVhc3Qgb25lIG9mIHRoZSBQcm9wZXJ0aWVzIGlzIGEgVm9pY2luZ05vZGUncyBjYW5Bbm5vdW5jZVByb3BlcnR5IHNvIHRoYXQgdGhpcyBVdHRlcmFuY2UgaXMgb25seSBhbm5vdW5jZWRcclxuICogd2hlbiB0aGUgVm9pY2luZ05vZGUgaXMgZ2xvYmFsbHkgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUuXHJcbiAqIEBzdGF0aWNcclxuICovXHJcblZvaWNpbmcuYWxlcnRVdHRlcmFuY2UgPSAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICkgPT4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLmxlbmd0aCA+IDAsICd2b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzIHJlcXVpcmVkLCB0aGlzIFV0dGVyYW5jZSBtaWdodCBub3QgYmUgY29ubmVjdGVkIHRvIE5vZGUgaW4gdGhlIHNjZW5lIGdyYXBoLicgKTtcclxuICB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB1dHRlcmFuY2UgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBc3NpZ24gdGhlIHZvaWNpbmdOb2RlJ3Mgdm9pY2luZ0NhblNwZWFrUHJvcGVydHkgdG8gdGhlIFV0dGVyYW5jZSBzbyB0aGF0IHRoZSBVdHRlcmFuY2UgY2FuIG9ubHkgYmUgYW5ub3VuY2VkXHJcbiAqIGlmIHRoZSB2b2ljaW5nTm9kZSBpcyBnbG9iYWxseSB2aXNpYmxlIGFuZCB2b2ljaW5nVmlzaWJsZSBpbiB0aGUgZGlzcGxheS5cclxuICogQHN0YXRpY1xyXG4gKi9cclxuVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUgPSAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCB2b2ljaW5nTm9kZTogVm9pY2luZ05vZGUgKSA9PiB7XHJcbiAgY29uc3QgZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcztcclxuICBpZiAoICFleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggdm9pY2luZ05vZGUudm9pY2luZ0NhblNwZWFrUHJvcGVydHkgKSApIHtcclxuICAgIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuY29uY2F0KCBbIHZvaWNpbmdOb2RlLnZvaWNpbmdDYW5TcGVha1Byb3BlcnR5IF0gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGEgdm9pY2luZ05vZGUncyB2b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eSBmcm9tIHRoZSBVdHRlcmFuY2UuXHJcbiAqIEBzdGF0aWNcclxuICovXHJcblZvaWNpbmcudW5yZWdpc3RlclV0dGVyYW5jZVRvVm9pY2luZ05vZGUgPSAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCB2b2ljaW5nTm9kZTogVm9pY2luZ05vZGUgKSA9PiB7XHJcbiAgY29uc3QgZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcztcclxuICBjb25zdCBpbmRleCA9IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLmluZGV4T2YoIHZvaWNpbmdOb2RlLnZvaWNpbmdDYW5TcGVha1Byb3BlcnR5ICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPiAtMSwgJ3ZvaWNpbmdOb2RlLnZvaWNpbmdDYW5TcGVha1Byb3BlcnR5IGlzIG5vdCBvbiB0aGUgVXR0ZXJhbmNlLCB3YXMgaXQgbm90IHJlZ2lzdGVyZWQ/JyApO1xyXG4gIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFzc2lnbiB0aGUgTm9kZSdzIHZvaWNpbmdWaXNpYmxlUHJvcGVydHkgYW5kIHZpc2libGVQcm9wZXJ0eSB0byB0aGUgVXR0ZXJhbmNlIHNvIHRoYXQgdGhlIFV0dGVyYW5jZSBjYW4gb25seSBiZVxyXG4gKiBhbm5vdW5jZWQgaWYgdGhlIE5vZGUgaXMgdmlzaWJsZSBhbmQgdm9pY2luZ1Zpc2libGUuIFRoaXMgaXMgTE9DQUwgdmlzaWJpbGl0eSBhbmQgZG9lcyBub3QgY2FyZSBhYm91dCBhbmNlc3RvcnMuXHJcbiAqIFRoaXMgc2hvdWxkIHJhcmVseSBiZSB1c2VkLCBpbiBnZW5lcmFsIHlvdSBzaG91bGQgYmUgcmVnaXN0ZXJpbmcgYW4gVXR0ZXJhbmNlIHRvIGEgVm9pY2luZ05vZGUgYW5kIGl0c1xyXG4gKiB2b2ljaW5nQ2FuU3BlYWtQcm9wZXJ0eS5cclxuICogQHN0YXRpY1xyXG4gKi9cclxuVm9pY2luZy5yZWdpc3RlclV0dGVyYW5jZVRvTm9kZSA9ICggdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIG5vZGU6IE5vZGUgKSA9PiB7XHJcbiAgY29uc3QgZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcztcclxuICBpZiAoICFleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggbm9kZS52aXNpYmxlUHJvcGVydHkgKSApIHtcclxuICAgIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuY29uY2F0KCBbIG5vZGUudmlzaWJsZVByb3BlcnR5IF0gKTtcclxuICB9XHJcbiAgaWYgKCAhZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuaW5jbHVkZXMoIG5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eSApICkge1xyXG4gICAgdXR0ZXJhbmNlLnZvaWNpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcy5jb25jYXQoIFsgbm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5IF0gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogUmVtb3ZlIGEgTm9kZSdzIHZvaWNpbmdWaXNpYmxlUHJvcGVydHkgYW5kIHZpc2libGVQcm9wZXJ0eSBmcm9tIHRoZSB2b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzIG9mIHRoZSBVdHRlcmFuY2UuXHJcbiAqIEBzdGF0aWNcclxuICovXHJcblZvaWNpbmcudW5yZWdpc3RlclV0dGVyYW5jZVRvTm9kZSA9ICggdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIG5vZGU6IE5vZGUgKSA9PiB7XHJcbiAgY29uc3QgZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMgPSB1dHRlcmFuY2Uudm9pY2luZ0NhbkFubm91bmNlUHJvcGVydGllcztcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggbm9kZS52aXNpYmxlUHJvcGVydHkgKSAmJiBleGlzdGluZ0NhbkFubm91bmNlUHJvcGVydGllcy5pbmNsdWRlcyggbm9kZS52b2ljaW5nVmlzaWJsZVByb3BlcnR5ICksXHJcbiAgICAndmlzaWJsZVByb3BlcnR5IGFuZCB2b2ljaW5nVmlzaWJsZVByb3BlcnR5IHdlcmUgbm90IG9uIHRoZSBVdHRlcmFuY2UsIHdhcyBpdCBub3QgcmVnaXN0ZXJlZCB0byB0aGUgbm9kZT8nICk7XHJcblxyXG4gIGNvbnN0IHZpc2libGVQcm9wZXJ0eUluZGV4ID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuaW5kZXhPZiggbm9kZS52aXNpYmxlUHJvcGVydHkgKTtcclxuICBjb25zdCB3aXRob3V0VmlzaWJsZVByb3BlcnR5ID0gZXhpc3RpbmdDYW5Bbm5vdW5jZVByb3BlcnRpZXMuc3BsaWNlKCB2aXNpYmxlUHJvcGVydHlJbmRleCwgMSApO1xyXG5cclxuICBjb25zdCB2b2ljaW5nVmlzaWJsZVByb3BlcnR5SW5kZXggPSB3aXRob3V0VmlzaWJsZVByb3BlcnR5LmluZGV4T2YoIG5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eSApO1xyXG4gIGNvbnN0IHdpdGhvdXRCb3RoUHJvcGVydGllcyA9IGV4aXN0aW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzLnNwbGljZSggdm9pY2luZ1Zpc2libGVQcm9wZXJ0eUluZGV4LCAxICk7XHJcblxyXG4gIHV0dGVyYW5jZS52b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0aWVzID0gd2l0aG91dEJvdGhQcm9wZXJ0aWVzO1xyXG59O1xyXG5cclxuLy8gRXhwb3J0IGEgdHlwZSB0aGF0IGxldHMgeW91IGNoZWNrIGlmIHlvdXIgTm9kZSBpcyBjb21wb3NlZCB3aXRoIFZvaWNpbmcuXHJcbmNvbnN0IHdyYXBwZXIgPSAoKSA9PiBWb2ljaW5nKCBOb2RlICk7XHJcbmV4cG9ydCB0eXBlIFZvaWNpbmdOb2RlID0gSW5zdGFuY2VUeXBlPFJldHVyblR5cGU8dHlwZW9mIHdyYXBwZXI+PjtcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdWb2ljaW5nJywgVm9pY2luZyApO1xyXG5leHBvcnQgZGVmYXVsdCBWb2ljaW5nO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxjQUFjLE1BQXVFLGtEQUFrRDtBQUU5SSxPQUFP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