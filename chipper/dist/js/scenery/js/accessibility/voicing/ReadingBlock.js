// Copyright 2021-2023, University of Colorado Boulder

/**
 * A trait that extends Voicing, adding support for "Reading Blocks" of the voicing feature. "Reading Blocks" are
 * UI components in the application that have unique functionality with respect to Voicing.
 *
 *  - Reading Blocks are generally around graphical objects that are not otherwise interactive (like Text).
 *  - They have a unique focus highlight to indicate they can be clicked on to hear voiced content.
 *  - When activated with press or click readingBlockNameResponse is spoken.
 *  - ReadingBlock content is always spoken if the voicingManager is enabled, ignoring Properties of responseCollector.
 *  - While speaking, a yellow highlight will appear over the Node composed with ReadingBlock.
 *  - While voicing is enabled, reading blocks will be added to the focus order.
 *
 * This trait is to be composed with Nodes and assumes that the Node is composed with ParallelDOM.  It uses Node to
 * support mouse/touch input and ParallelDOM to support being added to the focus order and alternative input.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import ResponsePatternCollection from '../../../../utterance-queue/js/ResponsePatternCollection.js';
import { DelayedMutate, Focus, Node, PDOMInstance, ReadingBlockHighlight, ReadingBlockUtterance, scenery, Voicing, voicingManager } from '../../imports.js';
import memoize from '../../../../phet-core/js/memoize.js';
const READING_BLOCK_OPTION_KEYS = ['readingBlockTagName', 'readingBlockNameResponse', 'readingBlockHintResponse', 'readingBlockResponsePatternCollection', 'readingBlockActiveHighlight'];
// Use an assertion signature to narrow the type to ReadingBlockUtterance
function assertReadingBlockUtterance(utterance) {
  if (!(utterance instanceof ReadingBlockUtterance)) {
    assert && assert(false, 'utterance is not a ReadinBlockUtterance');
  }
}

// An implementation class for ReadingBlock.ts, only used in this class so that we know if we own the Utterance and can
// therefore dispose it.
class OwnedReadingBlockUtterance extends ReadingBlockUtterance {
  constructor(focus, providedOptions) {
    super(focus, providedOptions);
  }
}
const DEFAULT_CONTENT_HINT_PATTERN = new ResponsePatternCollection({
  nameHint: '{{NAME}}. {{HINT}}'
});
const ReadingBlock = memoize(Type => {
  const ReadingBlockClass = DelayedMutate('ReadingBlock', READING_BLOCK_OPTION_KEYS, class ReadingBlockClass extends Voicing(Type) {
    // The tagName used for the ReadingBlock when "Voicing" is enabled, default
    // of button so that it is added to the focus order and can receive 'click' events. You may wish to set this
    // to some other tagName or set to null to remove the ReadingBlock from the focus order. If this is changed,
    // be sure that the ReadingBlock will still respond to `click` events when enabled.

    // The tagName to apply to the Node when voicing is disabled.

    // The highlight that surrounds this ReadingBlock when it is "active" and
    // the Voicing framework is speaking the content associated with this Node. By default, a semi-transparent
    // yellow highlight surrounds this Node's bounds.
    // (scenery-internal) - Sends a message when the highlight for the ReadingBlock changes. Used
    // by the HighlightOverlay to redraw it if it changes while the highlight is active.
    // Updates the hit bounds of this Node when the local bounds change.
    // Triggers activation of the ReadingBlock, requesting speech of its content.
    // Controls whether the ReadingBlock should be interactive and focusable. At the time of this writing, that is true
    // for all ReadingBlocks when the voicingManager is fully enabled and can speak.
    constructor(...args) {
      super(...args);
      this._readingBlockTagName = 'button';
      this._readingBlockDisabledTagName = 'p';
      this._readingBlockActiveHighlight = null;
      this.readingBlockActiveHighlightChangedEmitter = new TinyEmitter();
      this.readingBlockResponsePatternCollection = DEFAULT_CONTENT_HINT_PATTERN;
      this._localBoundsChangedListener = this._onLocalBoundsChanged.bind(this);
      this.localBoundsProperty.link(this._localBoundsChangedListener);
      this._readingBlockInputListener = {
        focus: event => this._speakReadingBlockContentListener(event),
        up: event => this._speakReadingBlockContentListener(event),
        click: event => this._speakReadingBlockContentListener(event)
      };
      this._readingBlockFocusableChangeListener = this._onReadingBlockFocusableChanged.bind(this);
      voicingManager.speechAllowedAndFullyEnabledProperty.link(this._readingBlockFocusableChangeListener);

      // All ReadingBlocks have a ReadingBlockHighlight, a focus highlight that is black to indicate it has
      // a different behavior.
      this.focusHighlight = new ReadingBlockHighlight(this);

      // All ReadingBlocks use a ReadingBlockUtterance with Focus and Trail data to this Node so that it can be
      // highlighted in the FocusOverlay when this Utterance is being announced.
      this.voicingUtterance = new OwnedReadingBlockUtterance(null);
    }

    /**
     * Whether a Node composes ReadingBlock.
     */
    get isReadingBlock() {
      return true;
    }

    /**
     * Set the tagName for the node composing ReadingBlock. This is the tagName (of ParallelDOM) that will be applied
     * to this Node when Reading Blocks are enabled.
     */
    setReadingBlockTagName(tagName) {
      this._readingBlockTagName = tagName;
      this._onReadingBlockFocusableChanged(voicingManager.speechAllowedAndFullyEnabledProperty.value);
    }
    set readingBlockTagName(tagName) {
      this.setReadingBlockTagName(tagName);
    }
    get readingBlockTagName() {
      return this.getReadingBlockTagName();
    }

    /**
     * Get the tagName for this Node (of ParallelDOM) when Reading Blocks are enabled.
     */
    getReadingBlockTagName() {
      return this._readingBlockTagName;
    }

    /**
     * Sets the content that should be read whenever the ReadingBlock receives input that initiates speech.
     */
    setReadingBlockNameResponse(content) {
      this._voicingResponsePacket.nameResponse = content;
    }
    set readingBlockNameResponse(content) {
      this.setReadingBlockNameResponse(content);
    }
    get readingBlockNameResponse() {
      return this.getReadingBlockNameResponse();
    }

    /**
     * Gets the content that is spoken whenever the ReadingBLock receives input that would initiate speech.
     */
    getReadingBlockNameResponse() {
      return this._voicingResponsePacket.nameResponse;
    }

    /**
     * Sets the hint response for this ReadingBlock. This is only spoken if "Helpful Hints" are enabled by the user.
     */
    setReadingBlockHintResponse(content) {
      this._voicingResponsePacket.hintResponse = content;
    }
    set readingBlockHintResponse(content) {
      this.setReadingBlockHintResponse(content);
    }
    get readingBlockHintResponse() {
      return this.getReadingBlockHintResponse();
    }

    /**
     * Get the hint response for this ReadingBlock. This is additional content that is only read if "Helpful Hints"
     * are enabled.
     */
    getReadingBlockHintResponse() {
      return this._voicingResponsePacket.hintResponse;
    }

    /**
     * Sets the collection of patterns to use for voicing responses, controlling the order, punctuation, and
     * additional content for each combination of response. See ResponsePatternCollection.js if you wish to use
     * a collection of string patterns that are not the default.
     */
    setReadingBlockResponsePatternCollection(patterns) {
      this._voicingResponsePacket.responsePatternCollection = patterns;
    }
    set readingBlockResponsePatternCollection(patterns) {
      this.setReadingBlockResponsePatternCollection(patterns);
    }
    get readingBlockResponsePatternCollection() {
      return this.getReadingBlockResponsePatternCollection();
    }

    /**
     * Get the ResponsePatternCollection object that this ReadingBlock Node is using to collect responses.
     */
    getReadingBlockResponsePatternCollection() {
      return this._voicingResponsePacket.responsePatternCollection;
    }

    /**
     * ReadingBlock must take a ReadingBlockUtterance for its voicingUtterance. You generally shouldn't be using this.
     * But if you must, you are responsible for setting the ReadingBlockUtterance.readingBlockFocus when this
     * ReadingBlock is activated so that it gets highlighted correctly. See how the default readingBlockFocus is set.
     */
    setVoicingUtterance(utterance) {
      super.setVoicingUtterance(utterance);
    }
    set voicingUtterance(utterance) {
      super.voicingUtterance = utterance;
    }
    get voicingUtterance() {
      return this.getVoicingUtterance();
    }
    getVoicingUtterance() {
      const utterance = super.getVoicingUtterance();
      assertReadingBlockUtterance(utterance);
      return utterance;
    }
    setVoicingNameResponse() {
      assert && assert(false, 'ReadingBlocks only support setting the name response via readingBlockNameResponse');
    }
    getVoicingNameResponse() {
      assert && assert(false, 'ReadingBlocks only support getting the name response via readingBlockNameResponse');
    }
    setVoicingObjectResponse() {
      assert && assert(false, 'ReadingBlocks do not support setting object response');
    }
    getVoicingObjectResponse() {
      assert && assert(false, 'ReadingBlocks do not support setting object response');
    }
    setVoicingContextResponse() {
      assert && assert(false, 'ReadingBlocks do not support setting context response');
    }
    getVoicingContextResponse() {
      assert && assert(false, 'ReadingBlocks do not support setting context response');
    }
    setVoicingHintResponse() {
      assert && assert(false, 'ReadingBlocks only support setting the hint response via readingBlockHintResponse.');
    }
    getVoicingHintResponse() {
      assert && assert(false, 'ReadingBlocks only support getting the hint response via readingBlockHintResponse.');
    }
    setVoicingResponsePatternCollection() {
      assert && assert(false, 'ReadingBlocks only support setting the response patterns via readingBlockResponsePatternCollection.');
    }
    getVoicingResponsePatternCollection() {
      assert && assert(false, 'ReadingBlocks only support getting the response patterns via readingBlockResponsePatternCollection.');
    }

    /**
     * Sets the highlight used to surround this Node while the Voicing framework is speaking this content.
     * If a Node is provided, do not add this Node to the scene graph, it is added and made visible by the HighlightOverlay.
     */
    setReadingBlockActiveHighlight(readingBlockActiveHighlight) {
      if (this._readingBlockActiveHighlight !== readingBlockActiveHighlight) {
        this._readingBlockActiveHighlight = readingBlockActiveHighlight;
        this.readingBlockActiveHighlightChangedEmitter.emit();
      }
    }
    set readingBlockActiveHighlight(readingBlockActiveHighlight) {
      this.setReadingBlockActiveHighlight(readingBlockActiveHighlight);
    }
    get readingBlockActiveHighlight() {
      return this._readingBlockActiveHighlight;
    }

    /**
     * Returns the highlight used to surround this Node when the Voicing framework is reading its
     * content.
     */
    getReadingBlockActiveHighlight() {
      return this._readingBlockActiveHighlight;
    }

    /**
     * Returns true if this ReadingBlock is "activated", indicating that it has received interaction
     * and the Voicing framework is speaking its content.
     */
    isReadingBlockActivated() {
      let activated = false;
      const trailIds = Object.keys(this.displays);
      for (let i = 0; i < trailIds.length; i++) {
        const pointerFocus = this.displays[trailIds[i]].focusManager.readingBlockFocusProperty.value;
        if (pointerFocus && pointerFocus.trail.lastNode() === this) {
          activated = true;
          break;
        }
      }
      return activated;
    }
    get readingBlockActivated() {
      return this.isReadingBlockActivated();
    }

    /**
     * When this Node becomes focusable (because Reading Blocks have just been enabled or disabled), either
     * apply or remove the readingBlockTagName.
     *
     * @param focusable - whether ReadingBlocks should be focusable
     */
    _onReadingBlockFocusableChanged(focusable) {
      this.focusable = focusable;
      if (focusable) {
        this.tagName = this._readingBlockTagName;

        // don't add the input listener if we are already active, we may just be updating the tagName in this case
        if (!this.hasInputListener(this._readingBlockInputListener)) {
          this.addInputListener(this._readingBlockInputListener);
        }
      } else {
        this.tagName = this._readingBlockDisabledTagName;
        if (this.hasInputListener(this._readingBlockInputListener)) {
          this.removeInputListener(this._readingBlockInputListener);
        }
      }
    }

    /**
     * Update the hit areas for this Node whenever the bounds change.
     */
    _onLocalBoundsChanged(localBounds) {
      this.mouseArea = localBounds;
      this.touchArea = localBounds;
    }

    /**
     * Speak the content associated with the ReadingBlock. Sets the readingBlockFocusProperties on
     * the displays so that HighlightOverlays know to activate a highlight while the voicingManager
     * is reading about this Node.
     */
    _speakReadingBlockContentListener(event) {
      const displays = this.getConnectedDisplays();
      const readingBlockUtterance = this.voicingUtterance;
      const content = this.collectResponse({
        nameResponse: this.getReadingBlockNameResponse(),
        hintResponse: this.getReadingBlockHintResponse(),
        ignoreProperties: this.voicingIgnoreVoicingManagerProperties,
        responsePatternCollection: this._voicingResponsePacket.responsePatternCollection,
        utterance: readingBlockUtterance
      });
      if (content) {
        for (let i = 0; i < displays.length; i++) {
          if (!this.getDescendantsUseHighlighting(event.trail)) {
            // the SceneryEvent might have gone through a descendant of this Node
            const rootToSelf = event.trail.subtrailTo(this);

            // the trail to a Node may be discontinuous for PDOM events due to pdomOrder,
            // this finds the actual visual trail to use
            const visualTrail = PDOMInstance.guessVisualTrail(rootToSelf, displays[i].rootNode);
            const focus = new Focus(displays[i], visualTrail);
            readingBlockUtterance.readingBlockFocus = focus;
            this.speakContent(content);
          }
        }
      }
    }

    /**
     * If we created and own the voicingUtterance we can fully dispose of it.
     */
    cleanVoicingUtterance() {
      if (this._voicingUtterance instanceof OwnedReadingBlockUtterance) {
        this._voicingUtterance.dispose();
      }
      super.cleanVoicingUtterance();
    }
    dispose() {
      voicingManager.speechAllowedAndFullyEnabledProperty.unlink(this._readingBlockFocusableChangeListener);
      this.localBoundsProperty.unlink(this._localBoundsChangedListener);

      // remove the input listener that activates the ReadingBlock, only do this if the listener is attached while
      // the ReadingBlock is enabled
      if (this.hasInputListener(this._readingBlockInputListener)) {
        this.removeInputListener(this._readingBlockInputListener);
      }
      super.dispose();
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
  ReadingBlockClass.prototype._mutatorKeys = READING_BLOCK_OPTION_KEYS.concat(ReadingBlockClass.prototype._mutatorKeys);
  assert && assert(ReadingBlockClass.prototype._mutatorKeys.length === _.uniq(ReadingBlockClass.prototype._mutatorKeys).length, 'x mutator keys in ReadingBlock');
  return ReadingBlockClass;
});

// Export a type that lets you check if your Node is composed with ReadingBlock
const wrapper = () => ReadingBlock(Node);
scenery.register('ReadingBlock', ReadingBlock);
export default ReadingBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJEZWxheWVkTXV0YXRlIiwiRm9jdXMiLCJOb2RlIiwiUERPTUluc3RhbmNlIiwiUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0IiwiUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIiwic2NlbmVyeSIsIlZvaWNpbmciLCJ2b2ljaW5nTWFuYWdlciIsIm1lbW9pemUiLCJSRUFESU5HX0JMT0NLX09QVElPTl9LRVlTIiwiYXNzZXJ0UmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIiwidXR0ZXJhbmNlIiwiYXNzZXJ0IiwiT3duZWRSZWFkaW5nQmxvY2tVdHRlcmFuY2UiLCJjb25zdHJ1Y3RvciIsImZvY3VzIiwicHJvdmlkZWRPcHRpb25zIiwiREVGQVVMVF9DT05URU5UX0hJTlRfUEFUVEVSTiIsIm5hbWVIaW50IiwiUmVhZGluZ0Jsb2NrIiwiVHlwZSIsIlJlYWRpbmdCbG9ja0NsYXNzIiwiYXJncyIsIl9yZWFkaW5nQmxvY2tUYWdOYW1lIiwiX3JlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZSIsIl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJyZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlciIsInJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJfbG9jYWxCb3VuZHNDaGFuZ2VkTGlzdGVuZXIiLCJfb25Mb2NhbEJvdW5kc0NoYW5nZWQiLCJiaW5kIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJfcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciIsImV2ZW50IiwiX3NwZWFrUmVhZGluZ0Jsb2NrQ29udGVudExpc3RlbmVyIiwidXAiLCJjbGljayIsIl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciIsIl9vblJlYWRpbmdCbG9ja0ZvY3VzYWJsZUNoYW5nZWQiLCJzcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkiLCJmb2N1c0hpZ2hsaWdodCIsInZvaWNpbmdVdHRlcmFuY2UiLCJpc1JlYWRpbmdCbG9jayIsInNldFJlYWRpbmdCbG9ja1RhZ05hbWUiLCJ0YWdOYW1lIiwidmFsdWUiLCJyZWFkaW5nQmxvY2tUYWdOYW1lIiwiZ2V0UmVhZGluZ0Jsb2NrVGFnTmFtZSIsInNldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSIsImNvbnRlbnQiLCJfdm9pY2luZ1Jlc3BvbnNlUGFja2V0IiwibmFtZVJlc3BvbnNlIiwicmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlIiwiZ2V0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlIiwic2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlIiwiaGludFJlc3BvbnNlIiwicmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlIiwiZ2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlIiwic2V0UmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInBhdHRlcm5zIiwicmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsImdldFJlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJzZXRWb2ljaW5nVXR0ZXJhbmNlIiwiZ2V0Vm9pY2luZ1V0dGVyYW5jZSIsInNldFZvaWNpbmdOYW1lUmVzcG9uc2UiLCJnZXRWb2ljaW5nTmFtZVJlc3BvbnNlIiwic2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ09iamVjdFJlc3BvbnNlIiwic2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSIsImdldFZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJzZXRWb2ljaW5nSGludFJlc3BvbnNlIiwiZ2V0Vm9pY2luZ0hpbnRSZXNwb25zZSIsInNldFZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwiZ2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24iLCJzZXRSZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJyZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJlbWl0IiwiZ2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0IiwiaXNSZWFkaW5nQmxvY2tBY3RpdmF0ZWQiLCJhY3RpdmF0ZWQiLCJ0cmFpbElkcyIsIk9iamVjdCIsImtleXMiLCJkaXNwbGF5cyIsImkiLCJsZW5ndGgiLCJwb2ludGVyRm9jdXMiLCJmb2N1c01hbmFnZXIiLCJyZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5IiwidHJhaWwiLCJsYXN0Tm9kZSIsInJlYWRpbmdCbG9ja0FjdGl2YXRlZCIsImZvY3VzYWJsZSIsImhhc0lucHV0TGlzdGVuZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImxvY2FsQm91bmRzIiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwiZ2V0Q29ubmVjdGVkRGlzcGxheXMiLCJyZWFkaW5nQmxvY2tVdHRlcmFuY2UiLCJjb2xsZWN0UmVzcG9uc2UiLCJpZ25vcmVQcm9wZXJ0aWVzIiwidm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyIsImdldERlc2NlbmRhbnRzVXNlSGlnaGxpZ2h0aW5nIiwicm9vdFRvU2VsZiIsInN1YnRyYWlsVG8iLCJ2aXN1YWxUcmFpbCIsImd1ZXNzVmlzdWFsVHJhaWwiLCJyb290Tm9kZSIsInJlYWRpbmdCbG9ja0ZvY3VzIiwic3BlYWtDb250ZW50IiwiY2xlYW5Wb2ljaW5nVXR0ZXJhbmNlIiwiX3ZvaWNpbmdVdHRlcmFuY2UiLCJkaXNwb3NlIiwidW5saW5rIiwibXV0YXRlIiwib3B0aW9ucyIsInByb3RvdHlwZSIsIl9tdXRhdG9yS2V5cyIsImNvbmNhdCIsIl8iLCJ1bmlxIiwid3JhcHBlciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVhZGluZ0Jsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgdHJhaXQgdGhhdCBleHRlbmRzIFZvaWNpbmcsIGFkZGluZyBzdXBwb3J0IGZvciBcIlJlYWRpbmcgQmxvY2tzXCIgb2YgdGhlIHZvaWNpbmcgZmVhdHVyZS4gXCJSZWFkaW5nIEJsb2Nrc1wiIGFyZVxyXG4gKiBVSSBjb21wb25lbnRzIGluIHRoZSBhcHBsaWNhdGlvbiB0aGF0IGhhdmUgdW5pcXVlIGZ1bmN0aW9uYWxpdHkgd2l0aCByZXNwZWN0IHRvIFZvaWNpbmcuXHJcbiAqXHJcbiAqICAtIFJlYWRpbmcgQmxvY2tzIGFyZSBnZW5lcmFsbHkgYXJvdW5kIGdyYXBoaWNhbCBvYmplY3RzIHRoYXQgYXJlIG5vdCBvdGhlcndpc2UgaW50ZXJhY3RpdmUgKGxpa2UgVGV4dCkuXHJcbiAqICAtIFRoZXkgaGF2ZSBhIHVuaXF1ZSBmb2N1cyBoaWdobGlnaHQgdG8gaW5kaWNhdGUgdGhleSBjYW4gYmUgY2xpY2tlZCBvbiB0byBoZWFyIHZvaWNlZCBjb250ZW50LlxyXG4gKiAgLSBXaGVuIGFjdGl2YXRlZCB3aXRoIHByZXNzIG9yIGNsaWNrIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSBpcyBzcG9rZW4uXHJcbiAqICAtIFJlYWRpbmdCbG9jayBjb250ZW50IGlzIGFsd2F5cyBzcG9rZW4gaWYgdGhlIHZvaWNpbmdNYW5hZ2VyIGlzIGVuYWJsZWQsIGlnbm9yaW5nIFByb3BlcnRpZXMgb2YgcmVzcG9uc2VDb2xsZWN0b3IuXHJcbiAqICAtIFdoaWxlIHNwZWFraW5nLCBhIHllbGxvdyBoaWdobGlnaHQgd2lsbCBhcHBlYXIgb3ZlciB0aGUgTm9kZSBjb21wb3NlZCB3aXRoIFJlYWRpbmdCbG9jay5cclxuICogIC0gV2hpbGUgdm9pY2luZyBpcyBlbmFibGVkLCByZWFkaW5nIGJsb2NrcyB3aWxsIGJlIGFkZGVkIHRvIHRoZSBmb2N1cyBvcmRlci5cclxuICpcclxuICogVGhpcyB0cmFpdCBpcyB0byBiZSBjb21wb3NlZCB3aXRoIE5vZGVzIGFuZCBhc3N1bWVzIHRoYXQgdGhlIE5vZGUgaXMgY29tcG9zZWQgd2l0aCBQYXJhbGxlbERPTS4gIEl0IHVzZXMgTm9kZSB0b1xyXG4gKiBzdXBwb3J0IG1vdXNlL3RvdWNoIGlucHV0IGFuZCBQYXJhbGxlbERPTSB0byBzdXBwb3J0IGJlaW5nIGFkZGVkIHRvIHRoZSBmb2N1cyBvcmRlciBhbmQgYWx0ZXJuYXRpdmUgaW5wdXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5qcyc7XHJcbmltcG9ydCB7IERlbGF5ZWRNdXRhdGUsIEZvY3VzLCBIaWdobGlnaHQsIE5vZGUsIFBET01JbnN0YW5jZSwgUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0LCBSZWFkaW5nQmxvY2tVdHRlcmFuY2UsIFJlYWRpbmdCbG9ja1V0dGVyYW5jZU9wdGlvbnMsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVm9pY2luZywgdm9pY2luZ01hbmFnZXIsIFZvaWNpbmdPcHRpb25zIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUSW5wdXRMaXN0ZW5lciBmcm9tICcuLi8uLi9pbnB1dC9USW5wdXRMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCB7IFJlc29sdmVkUmVzcG9uc2UsIFZvaWNpbmdSZXNwb25zZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9SZXNwb25zZVBhY2tldC5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xyXG5cclxuY29uc3QgUkVBRElOR19CTE9DS19PUFRJT05fS0VZUyA9IFtcclxuICAncmVhZGluZ0Jsb2NrVGFnTmFtZScsXHJcbiAgJ3JlYWRpbmdCbG9ja05hbWVSZXNwb25zZScsXHJcbiAgJ3JlYWRpbmdCbG9ja0hpbnRSZXNwb25zZScsXHJcbiAgJ3JlYWRpbmdCbG9ja1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24nLFxyXG4gICdyZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQnXHJcbl07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHJlYWRpbmdCbG9ja1RhZ05hbWU/OiBzdHJpbmcgfCBudWxsO1xyXG4gIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZT86IFZvaWNpbmdSZXNwb25zZTtcclxuICByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2U/OiBWb2ljaW5nUmVzcG9uc2U7XHJcbiAgcmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbj86IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb247XHJcbiAgcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0PzogbnVsbCB8IFNoYXBlIHwgTm9kZTtcclxufTtcclxuXHJcbnR5cGUgVW5zdXBwb3J0ZWRWb2ljaW5nT3B0aW9ucyA9XHJcbiAgJ3ZvaWNpbmdOYW1lUmVzcG9uc2UnIHxcclxuICAndm9pY2luZ09iamVjdFJlc3BvbnNlJyB8XHJcbiAgJ3ZvaWNpbmdDb250ZXh0UmVzcG9uc2UnIHxcclxuICAndm9pY2luZ0hpbnRSZXNwb25zZScgfFxyXG4gICd2b2ljaW5nVXR0ZXJhbmNlJyB8XHJcbiAgJ3ZvaWNpbmdSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uJztcclxuXHJcbmV4cG9ydCB0eXBlIFJlYWRpbmdCbG9ja09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgU3RyaWN0T21pdDxWb2ljaW5nT3B0aW9ucywgVW5zdXBwb3J0ZWRWb2ljaW5nT3B0aW9ucz47XHJcblxyXG4vLyBVc2UgYW4gYXNzZXJ0aW9uIHNpZ25hdHVyZSB0byBuYXJyb3cgdGhlIHR5cGUgdG8gUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlXHJcbmZ1bmN0aW9uIGFzc2VydFJlYWRpbmdCbG9ja1V0dGVyYW5jZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogYXNzZXJ0cyB1dHRlcmFuY2UgaXMgUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIHtcclxuICBpZiAoICEoIHV0dGVyYW5jZSBpbnN0YW5jZW9mIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSApICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd1dHRlcmFuY2UgaXMgbm90IGEgUmVhZGluQmxvY2tVdHRlcmFuY2UnICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBBbiBpbXBsZW1lbnRhdGlvbiBjbGFzcyBmb3IgUmVhZGluZ0Jsb2NrLnRzLCBvbmx5IHVzZWQgaW4gdGhpcyBjbGFzcyBzbyB0aGF0IHdlIGtub3cgaWYgd2Ugb3duIHRoZSBVdHRlcmFuY2UgYW5kIGNhblxyXG4vLyB0aGVyZWZvcmUgZGlzcG9zZSBpdC5cclxuY2xhc3MgT3duZWRSZWFkaW5nQmxvY2tVdHRlcmFuY2UgZXh0ZW5kcyBSZWFkaW5nQmxvY2tVdHRlcmFuY2Uge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZm9jdXM6IEZvY3VzIHwgbnVsbCwgcHJvdmlkZWRPcHRpb25zPzogUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBmb2N1cywgcHJvdmlkZWRPcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuY29uc3QgREVGQVVMVF9DT05URU5UX0hJTlRfUEFUVEVSTiA9IG5ldyBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCB7XHJcbiAgbmFtZUhpbnQ6ICd7e05BTUV9fS4ge3tISU5UfX0nXHJcbn0gKTtcclxuXHJcbmNvbnN0IFJlYWRpbmdCbG9jayA9IG1lbW9pemUoIDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIFR5cGU6IFN1cGVyVHlwZSApID0+IHtcclxuXHJcbiAgY29uc3QgUmVhZGluZ0Jsb2NrQ2xhc3MgPSBEZWxheWVkTXV0YXRlKCAnUmVhZGluZ0Jsb2NrJywgUkVBRElOR19CTE9DS19PUFRJT05fS0VZUywgY2xhc3MgUmVhZGluZ0Jsb2NrQ2xhc3MgZXh0ZW5kcyBWb2ljaW5nKCBUeXBlICkge1xyXG5cclxuICAgIC8vIFRoZSB0YWdOYW1lIHVzZWQgZm9yIHRoZSBSZWFkaW5nQmxvY2sgd2hlbiBcIlZvaWNpbmdcIiBpcyBlbmFibGVkLCBkZWZhdWx0XHJcbiAgICAvLyBvZiBidXR0b24gc28gdGhhdCBpdCBpcyBhZGRlZCB0byB0aGUgZm9jdXMgb3JkZXIgYW5kIGNhbiByZWNlaXZlICdjbGljaycgZXZlbnRzLiBZb3UgbWF5IHdpc2ggdG8gc2V0IHRoaXNcclxuICAgIC8vIHRvIHNvbWUgb3RoZXIgdGFnTmFtZSBvciBzZXQgdG8gbnVsbCB0byByZW1vdmUgdGhlIFJlYWRpbmdCbG9jayBmcm9tIHRoZSBmb2N1cyBvcmRlci4gSWYgdGhpcyBpcyBjaGFuZ2VkLFxyXG4gICAgLy8gYmUgc3VyZSB0aGF0IHRoZSBSZWFkaW5nQmxvY2sgd2lsbCBzdGlsbCByZXNwb25kIHRvIGBjbGlja2AgZXZlbnRzIHdoZW4gZW5hYmxlZC5cclxuICAgIHByaXZhdGUgX3JlYWRpbmdCbG9ja1RhZ05hbWU6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gICAgLy8gVGhlIHRhZ05hbWUgdG8gYXBwbHkgdG8gdGhlIE5vZGUgd2hlbiB2b2ljaW5nIGlzIGRpc2FibGVkLlxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgLy8gVGhlIGhpZ2hsaWdodCB0aGF0IHN1cnJvdW5kcyB0aGlzIFJlYWRpbmdCbG9jayB3aGVuIGl0IGlzIFwiYWN0aXZlXCIgYW5kXHJcbiAgICAvLyB0aGUgVm9pY2luZyBmcmFtZXdvcmsgaXMgc3BlYWtpbmcgdGhlIGNvbnRlbnQgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZS4gQnkgZGVmYXVsdCwgYSBzZW1pLXRyYW5zcGFyZW50XHJcbiAgICAvLyB5ZWxsb3cgaGlnaGxpZ2h0IHN1cnJvdW5kcyB0aGlzIE5vZGUncyBib3VuZHMuXHJcbiAgICBwcml2YXRlIF9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodDtcclxuXHJcbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgLSBTZW5kcyBhIG1lc3NhZ2Ugd2hlbiB0aGUgaGlnaGxpZ2h0IGZvciB0aGUgUmVhZGluZ0Jsb2NrIGNoYW5nZXMuIFVzZWRcclxuICAgIC8vIGJ5IHRoZSBIaWdobGlnaHRPdmVybGF5IHRvIHJlZHJhdyBpdCBpZiBpdCBjaGFuZ2VzIHdoaWxlIHRoZSBoaWdobGlnaHQgaXMgYWN0aXZlLlxyXG4gICAgcHVibGljIHJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgICAvLyBVcGRhdGVzIHRoZSBoaXQgYm91bmRzIG9mIHRoaXMgTm9kZSB3aGVuIHRoZSBsb2NhbCBib3VuZHMgY2hhbmdlLlxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbG9jYWxCb3VuZHNDaGFuZ2VkTGlzdGVuZXI6IE9taXRUaGlzUGFyYW1ldGVyPCggbG9jYWxCb3VuZHM6IEJvdW5kczIgKSA9PiB2b2lkPjtcclxuXHJcbiAgICAvLyBUcmlnZ2VycyBhY3RpdmF0aW9uIG9mIHRoZSBSZWFkaW5nQmxvY2ssIHJlcXVlc3Rpbmcgc3BlZWNoIG9mIGl0cyBjb250ZW50LlxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lcjogVElucHV0TGlzdGVuZXI7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgd2hldGhlciB0aGUgUmVhZGluZ0Jsb2NrIHNob3VsZCBiZSBpbnRlcmFjdGl2ZSBhbmQgZm9jdXNhYmxlLiBBdCB0aGUgdGltZSBvZiB0aGlzIHdyaXRpbmcsIHRoYXQgaXMgdHJ1ZVxyXG4gICAgLy8gZm9yIGFsbCBSZWFkaW5nQmxvY2tzIHdoZW4gdGhlIHZvaWNpbmdNYW5hZ2VyIGlzIGZ1bGx5IGVuYWJsZWQgYW5kIGNhbiBzcGVhay5cclxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3JlYWRpbmdCbG9ja0ZvY3VzYWJsZUNoYW5nZUxpc3RlbmVyOiBPbWl0VGhpc1BhcmFtZXRlcjwoIGZvY3VzYWJsZTogYm9vbGVhbiApID0+IHZvaWQ+O1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcclxuICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgIHRoaXMuX3JlYWRpbmdCbG9ja1RhZ05hbWUgPSAnYnV0dG9uJztcclxuICAgICAgdGhpcy5fcmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lID0gJ3AnO1xyXG4gICAgICB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgPSBudWxsO1xyXG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICAgIHRoaXMucmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiA9IERFRkFVTFRfQ09OVEVOVF9ISU5UX1BBVFRFUk47XHJcblxyXG4gICAgICB0aGlzLl9sb2NhbEJvdW5kc0NoYW5nZWRMaXN0ZW5lciA9IHRoaXMuX29uTG9jYWxCb3VuZHNDaGFuZ2VkLmJpbmQoIHRoaXMgKTtcclxuICAgICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoIHRoaXMuX2xvY2FsQm91bmRzQ2hhbmdlZExpc3RlbmVyICk7XHJcblxyXG4gICAgICB0aGlzLl9yZWFkaW5nQmxvY2tJbnB1dExpc3RlbmVyID0ge1xyXG4gICAgICAgIGZvY3VzOiBldmVudCA9PiB0aGlzLl9zcGVha1JlYWRpbmdCbG9ja0NvbnRlbnRMaXN0ZW5lciggZXZlbnQgKSxcclxuICAgICAgICB1cDogZXZlbnQgPT4gdGhpcy5fc3BlYWtSZWFkaW5nQmxvY2tDb250ZW50TGlzdGVuZXIoIGV2ZW50ICksXHJcbiAgICAgICAgY2xpY2s6IGV2ZW50ID0+IHRoaXMuX3NwZWFrUmVhZGluZ0Jsb2NrQ29udGVudExpc3RlbmVyKCBldmVudCApXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB0aGlzLl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuX29uUmVhZGluZ0Jsb2NrRm9jdXNhYmxlQ2hhbmdlZC5iaW5kKCB0aGlzICk7XHJcbiAgICAgIHZvaWNpbmdNYW5hZ2VyLnNwZWVjaEFsbG93ZWRBbmRGdWxseUVuYWJsZWRQcm9wZXJ0eS5saW5rKCB0aGlzLl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gQWxsIFJlYWRpbmdCbG9ja3MgaGF2ZSBhIFJlYWRpbmdCbG9ja0hpZ2hsaWdodCwgYSBmb2N1cyBoaWdobGlnaHQgdGhhdCBpcyBibGFjayB0byBpbmRpY2F0ZSBpdCBoYXNcclxuICAgICAgLy8gYSBkaWZmZXJlbnQgYmVoYXZpb3IuXHJcbiAgICAgIHRoaXMuZm9jdXNIaWdobGlnaHQgPSBuZXcgUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCB0aGlzICk7XHJcblxyXG4gICAgICAvLyBBbGwgUmVhZGluZ0Jsb2NrcyB1c2UgYSBSZWFkaW5nQmxvY2tVdHRlcmFuY2Ugd2l0aCBGb2N1cyBhbmQgVHJhaWwgZGF0YSB0byB0aGlzIE5vZGUgc28gdGhhdCBpdCBjYW4gYmVcclxuICAgICAgLy8gaGlnaGxpZ2h0ZWQgaW4gdGhlIEZvY3VzT3ZlcmxheSB3aGVuIHRoaXMgVXR0ZXJhbmNlIGlzIGJlaW5nIGFubm91bmNlZC5cclxuICAgICAgdGhpcy52b2ljaW5nVXR0ZXJhbmNlID0gbmV3IE93bmVkUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlKCBudWxsICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGEgTm9kZSBjb21wb3NlcyBSZWFkaW5nQmxvY2suXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgaXNSZWFkaW5nQmxvY2soKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0YWdOYW1lIGZvciB0aGUgbm9kZSBjb21wb3NpbmcgUmVhZGluZ0Jsb2NrLiBUaGlzIGlzIHRoZSB0YWdOYW1lIChvZiBQYXJhbGxlbERPTSkgdGhhdCB3aWxsIGJlIGFwcGxpZWRcclxuICAgICAqIHRvIHRoaXMgTm9kZSB3aGVuIFJlYWRpbmcgQmxvY2tzIGFyZSBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0UmVhZGluZ0Jsb2NrVGFnTmFtZSggdGFnTmFtZTogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcclxuICAgICAgdGhpcy5fcmVhZGluZ0Jsb2NrVGFnTmFtZSA9IHRhZ05hbWU7XHJcbiAgICAgIHRoaXMuX29uUmVhZGluZ0Jsb2NrRm9jdXNhYmxlQ2hhbmdlZCggdm9pY2luZ01hbmFnZXIuc3BlZWNoQWxsb3dlZEFuZEZ1bGx5RW5hYmxlZFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tUYWdOYW1lKCB0YWdOYW1lOiBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldFJlYWRpbmdCbG9ja1RhZ05hbWUoIHRhZ05hbWUgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcmVhZGluZ0Jsb2NrVGFnTmFtZSgpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0UmVhZGluZ0Jsb2NrVGFnTmFtZSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIHRhZ05hbWUgZm9yIHRoaXMgTm9kZSAob2YgUGFyYWxsZWxET00pIHdoZW4gUmVhZGluZyBCbG9ja3MgYXJlIGVuYWJsZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRSZWFkaW5nQmxvY2tUYWdOYW1lKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICByZXR1cm4gdGhpcy5fcmVhZGluZ0Jsb2NrVGFnTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGNvbnRlbnQgdGhhdCBzaG91bGQgYmUgcmVhZCB3aGVuZXZlciB0aGUgUmVhZGluZ0Jsb2NrIHJlY2VpdmVzIGlucHV0IHRoYXQgaW5pdGlhdGVzIHNwZWVjaC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggY29udGVudDogVm9pY2luZ1Jlc3BvbnNlICk6IHZvaWQge1xyXG4gICAgICB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQubmFtZVJlc3BvbnNlID0gY29udGVudDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggY29udGVudDogVm9pY2luZ1Jlc3BvbnNlICkgeyB0aGlzLnNldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSggY29udGVudCApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7IHJldHVybiB0aGlzLmdldFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBjb250ZW50IHRoYXQgaXMgc3Bva2VuIHdoZW5ldmVyIHRoZSBSZWFkaW5nQkxvY2sgcmVjZWl2ZXMgaW5wdXQgdGhhdCB3b3VsZCBpbml0aWF0ZSBzcGVlY2guXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2UoKTogUmVzb2x2ZWRSZXNwb25zZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQubmFtZVJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgaGludCByZXNwb25zZSBmb3IgdGhpcyBSZWFkaW5nQmxvY2suIFRoaXMgaXMgb25seSBzcG9rZW4gaWYgXCJIZWxwZnVsIEhpbnRzXCIgYXJlIGVuYWJsZWQgYnkgdGhlIHVzZXIuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRSZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoIGNvbnRlbnQ6IFZvaWNpbmdSZXNwb25zZSApOiB2b2lkIHtcclxuICAgICAgdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZSA9IGNvbnRlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoIGNvbnRlbnQ6IFZvaWNpbmdSZXNwb25zZSApIHsgdGhpcy5zZXRSZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoIGNvbnRlbnQgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2UgeyByZXR1cm4gdGhpcy5nZXRSZWFkaW5nQmxvY2tIaW50UmVzcG9uc2UoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBoaW50IHJlc3BvbnNlIGZvciB0aGlzIFJlYWRpbmdCbG9jay4gVGhpcyBpcyBhZGRpdGlvbmFsIGNvbnRlbnQgdGhhdCBpcyBvbmx5IHJlYWQgaWYgXCJIZWxwZnVsIEhpbnRzXCJcclxuICAgICAqIGFyZSBlbmFibGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlKCk6IFJlc29sdmVkUmVzcG9uc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5fdm9pY2luZ1Jlc3BvbnNlUGFja2V0LmhpbnRSZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGNvbGxlY3Rpb24gb2YgcGF0dGVybnMgdG8gdXNlIGZvciB2b2ljaW5nIHJlc3BvbnNlcywgY29udHJvbGxpbmcgdGhlIG9yZGVyLCBwdW5jdHVhdGlvbiwgYW5kXHJcbiAgICAgKiBhZGRpdGlvbmFsIGNvbnRlbnQgZm9yIGVhY2ggY29tYmluYXRpb24gb2YgcmVzcG9uc2UuIFNlZSBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLmpzIGlmIHlvdSB3aXNoIHRvIHVzZVxyXG4gICAgICogYSBjb2xsZWN0aW9uIG9mIHN0cmluZyBwYXR0ZXJucyB0aGF0IGFyZSBub3QgdGhlIGRlZmF1bHQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRSZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJuczogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiApOiB2b2lkIHtcclxuXHJcbiAgICAgIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uID0gcGF0dGVybnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCByZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJuczogUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiApIHsgdGhpcy5zZXRSZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCBwYXR0ZXJucyApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk6IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24geyByZXR1cm4gdGhpcy5nZXRSZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCB0aGUgUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiBvYmplY3QgdGhhdCB0aGlzIFJlYWRpbmdCbG9jayBOb2RlIGlzIHVzaW5nIHRvIGNvbGxlY3QgcmVzcG9uc2VzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdSZXNwb25zZVBhY2tldC5yZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVhZGluZ0Jsb2NrIG11c3QgdGFrZSBhIFJlYWRpbmdCbG9ja1V0dGVyYW5jZSBmb3IgaXRzIHZvaWNpbmdVdHRlcmFuY2UuIFlvdSBnZW5lcmFsbHkgc2hvdWxkbid0IGJlIHVzaW5nIHRoaXMuXHJcbiAgICAgKiBCdXQgaWYgeW91IG11c3QsIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgdGhlIFJlYWRpbmdCbG9ja1V0dGVyYW5jZS5yZWFkaW5nQmxvY2tGb2N1cyB3aGVuIHRoaXNcclxuICAgICAqIFJlYWRpbmdCbG9jayBpcyBhY3RpdmF0ZWQgc28gdGhhdCBpdCBnZXRzIGhpZ2hsaWdodGVkIGNvcnJlY3RseS4gU2VlIGhvdyB0aGUgZGVmYXVsdCByZWFkaW5nQmxvY2tGb2N1cyBpcyBzZXQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFJlYWRpbmdCbG9ja1V0dGVyYW5jZSApOiB2b2lkIHtcclxuICAgICAgc3VwZXIuc2V0Vm9pY2luZ1V0dGVyYW5jZSggdXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHNldCB2b2ljaW5nVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFJlYWRpbmdCbG9ja1V0dGVyYW5jZSApIHsgc3VwZXIudm9pY2luZ1V0dGVyYW5jZSA9IHV0dGVyYW5jZTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXQgdm9pY2luZ1V0dGVyYW5jZSgpOiBSZWFkaW5nQmxvY2tVdHRlcmFuY2UgeyByZXR1cm4gdGhpcy5nZXRWb2ljaW5nVXR0ZXJhbmNlKCk7IH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ1V0dGVyYW5jZSgpOiBSZWFkaW5nQmxvY2tVdHRlcmFuY2Uge1xyXG4gICAgICBjb25zdCB1dHRlcmFuY2UgPSBzdXBlci5nZXRWb2ljaW5nVXR0ZXJhbmNlKCk7XHJcbiAgICAgIGFzc2VydFJlYWRpbmdCbG9ja1V0dGVyYW5jZSggdXR0ZXJhbmNlICk7XHJcbiAgICAgIHJldHVybiB1dHRlcmFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIHNldFZvaWNpbmdOYW1lUmVzcG9uc2UoKTogdm9pZCB7IGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUmVhZGluZ0Jsb2NrcyBvbmx5IHN1cHBvcnQgc2V0dGluZyB0aGUgbmFtZSByZXNwb25zZSB2aWEgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlJyApOyB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIGdldFZvaWNpbmdOYW1lUmVzcG9uc2UoKTogSW50ZW50aW9uYWxBbnkgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3Mgb25seSBzdXBwb3J0IGdldHRpbmcgdGhlIG5hbWUgcmVzcG9uc2UgdmlhIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZScgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogdm9pZCB7IGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUmVhZGluZ0Jsb2NrcyBkbyBub3Qgc3VwcG9ydCBzZXR0aW5nIG9iamVjdCByZXNwb25zZScgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nT2JqZWN0UmVzcG9uc2UoKTogSW50ZW50aW9uYWxBbnkgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3MgZG8gbm90IHN1cHBvcnQgc2V0dGluZyBvYmplY3QgcmVzcG9uc2UnICk7IH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgc2V0Vm9pY2luZ0NvbnRleHRSZXNwb25zZSgpOiB2b2lkIHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIGRvIG5vdCBzdXBwb3J0IHNldHRpbmcgY29udGV4dCByZXNwb25zZScgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nQ29udGV4dFJlc3BvbnNlKCk6IEludGVudGlvbmFsQW55IHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIGRvIG5vdCBzdXBwb3J0IHNldHRpbmcgY29udGV4dCByZXNwb25zZScgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nSGludFJlc3BvbnNlKCk6IHZvaWQgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3Mgb25seSBzdXBwb3J0IHNldHRpbmcgdGhlIGhpbnQgcmVzcG9uc2UgdmlhIHJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZS4nICk7IH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ0hpbnRSZXNwb25zZSgpOiBJbnRlbnRpb25hbEFueSB7IGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnUmVhZGluZ0Jsb2NrcyBvbmx5IHN1cHBvcnQgZ2V0dGluZyB0aGUgaGludCByZXNwb25zZSB2aWEgcmVhZGluZ0Jsb2NrSGludFJlc3BvbnNlLicgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBzZXRWb2ljaW5nUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbigpOiB2b2lkIHsgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdSZWFkaW5nQmxvY2tzIG9ubHkgc3VwcG9ydCBzZXR0aW5nIHRoZSByZXNwb25zZSBwYXR0ZXJucyB2aWEgcmVhZGluZ0Jsb2NrUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi4nICk7IH1cclxuXHJcbiAgICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ1Jlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24oKTogSW50ZW50aW9uYWxBbnkgeyBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1JlYWRpbmdCbG9ja3Mgb25seSBzdXBwb3J0IGdldHRpbmcgdGhlIHJlc3BvbnNlIHBhdHRlcm5zIHZpYSByZWFkaW5nQmxvY2tSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLicgKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgaGlnaGxpZ2h0IHVzZWQgdG8gc3Vycm91bmQgdGhpcyBOb2RlIHdoaWxlIHRoZSBWb2ljaW5nIGZyYW1ld29yayBpcyBzcGVha2luZyB0aGlzIGNvbnRlbnQuXHJcbiAgICAgKiBJZiBhIE5vZGUgaXMgcHJvdmlkZWQsIGRvIG5vdCBhZGQgdGhpcyBOb2RlIHRvIHRoZSBzY2VuZSBncmFwaCwgaXQgaXMgYWRkZWQgYW5kIG1hZGUgdmlzaWJsZSBieSB0aGUgSGlnaGxpZ2h0T3ZlcmxheS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCggcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgKTogdm9pZCB7XHJcbiAgICAgIGlmICggdGhpcy5fcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0ICE9PSByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQgKSB7XHJcbiAgICAgICAgdGhpcy5fcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0ID0gcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLnJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodCApIHsgdGhpcy5zZXRSZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQoIHJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodCApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQoKTogSGlnaGxpZ2h0IHsgcmV0dXJuIHRoaXMuX3JlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodDsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaGlnaGxpZ2h0IHVzZWQgdG8gc3Vycm91bmQgdGhpcyBOb2RlIHdoZW4gdGhlIFZvaWNpbmcgZnJhbWV3b3JrIGlzIHJlYWRpbmcgaXRzXHJcbiAgICAgKiBjb250ZW50LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodCB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBSZWFkaW5nQmxvY2sgaXMgXCJhY3RpdmF0ZWRcIiwgaW5kaWNhdGluZyB0aGF0IGl0IGhhcyByZWNlaXZlZCBpbnRlcmFjdGlvblxyXG4gICAgICogYW5kIHRoZSBWb2ljaW5nIGZyYW1ld29yayBpcyBzcGVha2luZyBpdHMgY29udGVudC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGlzUmVhZGluZ0Jsb2NrQWN0aXZhdGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCB0cmFpbElkcyA9IE9iamVjdC5rZXlzKCB0aGlzLmRpc3BsYXlzICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRyYWlsSWRzLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgICBjb25zdCBwb2ludGVyRm9jdXMgPSB0aGlzLmRpc3BsYXlzWyB0cmFpbElkc1sgaSBdIF0uZm9jdXNNYW5hZ2VyLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaWYgKCBwb2ludGVyRm9jdXMgJiYgcG9pbnRlckZvY3VzLnRyYWlsLmxhc3ROb2RlKCkgPT09IHRoaXMgKSB7XHJcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCByZWFkaW5nQmxvY2tBY3RpdmF0ZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzUmVhZGluZ0Jsb2NrQWN0aXZhdGVkKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gdGhpcyBOb2RlIGJlY29tZXMgZm9jdXNhYmxlIChiZWNhdXNlIFJlYWRpbmcgQmxvY2tzIGhhdmUganVzdCBiZWVuIGVuYWJsZWQgb3IgZGlzYWJsZWQpLCBlaXRoZXJcclxuICAgICAqIGFwcGx5IG9yIHJlbW92ZSB0aGUgcmVhZGluZ0Jsb2NrVGFnTmFtZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZm9jdXNhYmxlIC0gd2hldGhlciBSZWFkaW5nQmxvY2tzIHNob3VsZCBiZSBmb2N1c2FibGVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfb25SZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VkKCBmb2N1c2FibGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZm9jdXNhYmxlID0gZm9jdXNhYmxlO1xyXG5cclxuICAgICAgaWYgKCBmb2N1c2FibGUgKSB7XHJcbiAgICAgICAgdGhpcy50YWdOYW1lID0gdGhpcy5fcmVhZGluZ0Jsb2NrVGFnTmFtZTtcclxuXHJcbiAgICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBpbnB1dCBsaXN0ZW5lciBpZiB3ZSBhcmUgYWxyZWFkeSBhY3RpdmUsIHdlIG1heSBqdXN0IGJlIHVwZGF0aW5nIHRoZSB0YWdOYW1lIGluIHRoaXMgY2FzZVxyXG4gICAgICAgIGlmICggIXRoaXMuaGFzSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApICkge1xyXG4gICAgICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9yZWFkaW5nQmxvY2tJbnB1dExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMudGFnTmFtZSA9IHRoaXMuX3JlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZTtcclxuICAgICAgICBpZiAoIHRoaXMuaGFzSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApICkge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9yZWFkaW5nQmxvY2tJbnB1dExpc3RlbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGUgdGhlIGhpdCBhcmVhcyBmb3IgdGhpcyBOb2RlIHdoZW5ldmVyIHRoZSBib3VuZHMgY2hhbmdlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9vbkxvY2FsQm91bmRzQ2hhbmdlZCggbG9jYWxCb3VuZHM6IEJvdW5kczIgKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubW91c2VBcmVhID0gbG9jYWxCb3VuZHM7XHJcbiAgICAgIHRoaXMudG91Y2hBcmVhID0gbG9jYWxCb3VuZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVhayB0aGUgY29udGVudCBhc3NvY2lhdGVkIHdpdGggdGhlIFJlYWRpbmdCbG9jay4gU2V0cyB0aGUgcmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0aWVzIG9uXHJcbiAgICAgKiB0aGUgZGlzcGxheXMgc28gdGhhdCBIaWdobGlnaHRPdmVybGF5cyBrbm93IHRvIGFjdGl2YXRlIGEgaGlnaGxpZ2h0IHdoaWxlIHRoZSB2b2ljaW5nTWFuYWdlclxyXG4gICAgICogaXMgcmVhZGluZyBhYm91dCB0aGlzIE5vZGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NwZWFrUmVhZGluZ0Jsb2NrQ29udGVudExpc3RlbmVyKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xyXG5cclxuICAgICAgY29uc3QgZGlzcGxheXMgPSB0aGlzLmdldENvbm5lY3RlZERpc3BsYXlzKCk7XHJcblxyXG4gICAgICBjb25zdCByZWFkaW5nQmxvY2tVdHRlcmFuY2UgPSB0aGlzLnZvaWNpbmdVdHRlcmFuY2U7XHJcblxyXG4gICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5jb2xsZWN0UmVzcG9uc2UoIHtcclxuICAgICAgICBuYW1lUmVzcG9uc2U6IHRoaXMuZ2V0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlKCksXHJcbiAgICAgICAgaGludFJlc3BvbnNlOiB0aGlzLmdldFJlYWRpbmdCbG9ja0hpbnRSZXNwb25zZSgpLFxyXG4gICAgICAgIGlnbm9yZVByb3BlcnRpZXM6IHRoaXMudm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyxcclxuICAgICAgICByZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uOiB0aGlzLl92b2ljaW5nUmVzcG9uc2VQYWNrZXQucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbixcclxuICAgICAgICB1dHRlcmFuY2U6IHJlYWRpbmdCbG9ja1V0dGVyYW5jZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIGlmICggY29udGVudCApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgICAgICBpZiAoICF0aGlzLmdldERlc2NlbmRhbnRzVXNlSGlnaGxpZ2h0aW5nKCBldmVudC50cmFpbCApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gdGhlIFNjZW5lcnlFdmVudCBtaWdodCBoYXZlIGdvbmUgdGhyb3VnaCBhIGRlc2NlbmRhbnQgb2YgdGhpcyBOb2RlXHJcbiAgICAgICAgICAgIGNvbnN0IHJvb3RUb1NlbGYgPSBldmVudC50cmFpbC5zdWJ0cmFpbFRvKCB0aGlzICk7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGUgdHJhaWwgdG8gYSBOb2RlIG1heSBiZSBkaXNjb250aW51b3VzIGZvciBQRE9NIGV2ZW50cyBkdWUgdG8gcGRvbU9yZGVyLFxyXG4gICAgICAgICAgICAvLyB0aGlzIGZpbmRzIHRoZSBhY3R1YWwgdmlzdWFsIHRyYWlsIHRvIHVzZVxyXG4gICAgICAgICAgICBjb25zdCB2aXN1YWxUcmFpbCA9IFBET01JbnN0YW5jZS5ndWVzc1Zpc3VhbFRyYWlsKCByb290VG9TZWxmLCBkaXNwbGF5c1sgaSBdLnJvb3ROb2RlICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmb2N1cyA9IG5ldyBGb2N1cyggZGlzcGxheXNbIGkgXSwgdmlzdWFsVHJhaWwgKTtcclxuICAgICAgICAgICAgcmVhZGluZ0Jsb2NrVXR0ZXJhbmNlLnJlYWRpbmdCbG9ja0ZvY3VzID0gZm9jdXM7XHJcbiAgICAgICAgICAgIHRoaXMuc3BlYWtDb250ZW50KCBjb250ZW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB3ZSBjcmVhdGVkIGFuZCBvd24gdGhlIHZvaWNpbmdVdHRlcmFuY2Ugd2UgY2FuIGZ1bGx5IGRpc3Bvc2Ugb2YgaXQuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvdmVycmlkZSBjbGVhblZvaWNpbmdVdHRlcmFuY2UoKTogdm9pZCB7XHJcbiAgICAgIGlmICggdGhpcy5fdm9pY2luZ1V0dGVyYW5jZSBpbnN0YW5jZW9mIE93bmVkUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlICkge1xyXG4gICAgICAgIHRoaXMuX3ZvaWNpbmdVdHRlcmFuY2UuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHN1cGVyLmNsZWFuVm9pY2luZ1V0dGVyYW5jZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgICB2b2ljaW5nTWFuYWdlci5zcGVlY2hBbGxvd2VkQW5kRnVsbHlFbmFibGVkUHJvcGVydHkudW5saW5rKCB0aGlzLl9yZWFkaW5nQmxvY2tGb2N1c2FibGVDaGFuZ2VMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLl9sb2NhbEJvdW5kc0NoYW5nZWRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIHRoZSBpbnB1dCBsaXN0ZW5lciB0aGF0IGFjdGl2YXRlcyB0aGUgUmVhZGluZ0Jsb2NrLCBvbmx5IGRvIHRoaXMgaWYgdGhlIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHdoaWxlXHJcbiAgICAgIC8vIHRoZSBSZWFkaW5nQmxvY2sgaXMgZW5hYmxlZFxyXG4gICAgICBpZiAoIHRoaXMuaGFzSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcmVhZGluZ0Jsb2NrSW5wdXRMaXN0ZW5lciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IFNlbGZPcHRpb25zICYgUGFyYW1ldGVyczxJbnN0YW5jZVR5cGU8U3VwZXJUeXBlPlsgJ211dGF0ZScgXT5bIDAgXSApOiB0aGlzIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgLyoqXHJcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IE5vZGUubXV0YXRlKCBvcHRpb25zICksIGluXHJcbiAgICogdGhlIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQuXHJcbiAgICpcclxuICAgKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICAgKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cclxuICAgKi9cclxuICBSZWFkaW5nQmxvY2tDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gUkVBRElOR19CTE9DS19PUFRJT05fS0VZUy5jb25jYXQoIFJlYWRpbmdCbG9ja0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBSZWFkaW5nQmxvY2tDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzLmxlbmd0aCA9PT0gXy51bmlxKCBSZWFkaW5nQmxvY2tDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzICkubGVuZ3RoLFxyXG4gICAgJ3ggbXV0YXRvciBrZXlzIGluIFJlYWRpbmdCbG9jaycgKTtcclxuXHJcbiAgcmV0dXJuIFJlYWRpbmdCbG9ja0NsYXNzO1xyXG59ICk7XHJcblxyXG4vLyBFeHBvcnQgYSB0eXBlIHRoYXQgbGV0cyB5b3UgY2hlY2sgaWYgeW91ciBOb2RlIGlzIGNvbXBvc2VkIHdpdGggUmVhZGluZ0Jsb2NrXHJcbmNvbnN0IHdyYXBwZXIgPSAoKSA9PiBSZWFkaW5nQmxvY2soIE5vZGUgKTtcclxuZXhwb3J0IHR5cGUgUmVhZGluZ0Jsb2NrTm9kZSA9IEluc3RhbmNlVHlwZTxSZXR1cm5UeXBlPHR5cGVvZiB3cmFwcGVyPj47XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVhZGluZ0Jsb2NrJywgUmVhZGluZ0Jsb2NrICk7XHJcbmV4cG9ydCBkZWZhdWx0IFJlYWRpbmdCbG9jaztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sb0NBQW9DO0FBTTVELE9BQU9DLHlCQUF5QixNQUFNLDZEQUE2RDtBQUNuRyxTQUFTQyxhQUFhLEVBQUVDLEtBQUssRUFBYUMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLHFCQUFxQixFQUFFQyxxQkFBcUIsRUFBZ0NDLE9BQU8sRUFBZ0JDLE9BQU8sRUFBRUMsY0FBYyxRQUF3QixrQkFBa0I7QUFLbE8sT0FBT0MsT0FBTyxNQUFNLHFDQUFxQztBQUV6RCxNQUFNQyx5QkFBeUIsR0FBRyxDQUNoQyxxQkFBcUIsRUFDckIsMEJBQTBCLEVBQzFCLDBCQUEwQixFQUMxQix1Q0FBdUMsRUFDdkMsNkJBQTZCLENBQzlCO0FBcUJEO0FBQ0EsU0FBU0MsMkJBQTJCQSxDQUFFQyxTQUFvQixFQUErQztFQUN2RyxJQUFLLEVBQUdBLFNBQVMsWUFBWVAscUJBQXFCLENBQUUsRUFBRztJQUNyRFEs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