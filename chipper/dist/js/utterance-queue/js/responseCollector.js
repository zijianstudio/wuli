// Copyright 2021-2023, University of Colorado Boulder

/**
 * Manages output of responses for the Voicing feature. First, see SCENERY/Voicing.ts for a description of what that includes.
 * This singleton is responsible for controlling when responses of each category are spoken when speech is
 * requested for a Node composed with Voicing.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
import ResponsePacket from './ResponsePacket.js';
import ResponsePatternCollection from './ResponsePatternCollection.js';
import { optionize3 } from '../../phet-core/js/optionize.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
class ResponseCollector extends PhetioObject {
  constructor(options) {
    super();

    // whether component names are read as input lands on various components
    this.nameResponsesEnabledProperty = new BooleanProperty(true);

    // whether "Object Responses" are read as interactive components change
    this.objectResponsesEnabledProperty = new BooleanProperty(false);

    // whether "Context Responses" are read as inputs receive interaction
    this.contextResponsesEnabledProperty = new BooleanProperty(false);

    // whether "Hints" are read to the user in response to certain input
    this.hintResponsesEnabledProperty = new BooleanProperty(false);
  }
  reset() {
    this.nameResponsesEnabledProperty.reset();
    this.objectResponsesEnabledProperty.reset();
    this.contextResponsesEnabledProperty.reset();
    this.hintResponsesEnabledProperty.reset();
  }

  /**
   * Prepares final output with an object response, a context response, and a hint. Each response
   * will only be added to the final string if that response type is included by the user. Rather than using
   * unique utterances, we use string interpolation so that the highlight around the abject being spoken
   * about stays lit for the entire combination of responses.
   */
  collectResponses(providedOptions) {
    // see ResponsePacket for supported options
    const options = optionize3()({}, ResponsePacket.DEFAULT_OPTIONS, providedOptions);
    assert && assert(options.responsePatternCollection instanceof ResponsePatternCollection);
    const usesNames = !!(options.nameResponse && (this.nameResponsesEnabledProperty.get() || options.ignoreProperties));
    const usesObjectChanges = !!(options.objectResponse && (this.objectResponsesEnabledProperty.get() || options.ignoreProperties));
    const usesContextChanges = !!(options.contextResponse && (this.contextResponsesEnabledProperty.get() || options.ignoreProperties));
    const usesInteractionHints = !!(options.hintResponse && (this.hintResponsesEnabledProperty.get() || options.ignoreProperties));
    const responseKey = ResponsePatternCollection.createPatternKey(usesNames, usesObjectChanges, usesContextChanges, usesInteractionHints);
    let finalResponse = '';
    if (responseKey) {
      // graceful if the responseKey is empty, but if we formed some key, it should
      // be defined in responsePatternCollection
      const patternString = options.responsePatternCollection.getResponsePattern(responseKey);
      finalResponse = StringUtils.fillIn(patternString, {
        NAME: options.nameResponse,
        OBJECT: options.objectResponse,
        CONTEXT: options.contextResponse,
        HINT: options.hintResponse
      });
    }
    return finalResponse;
  }
}
const responseCollector = new ResponseCollector();
utteranceQueueNamespace.register('responseCollector', responseCollector);
export default responseCollector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTdHJpbmdVdGlscyIsInV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIiwiUmVzcG9uc2VQYWNrZXQiLCJSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uIiwib3B0aW9uaXplMyIsIlBoZXRpb09iamVjdCIsIlJlc3BvbnNlQ29sbGVjdG9yIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZVJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSIsIm9iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSIsImNvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkiLCJoaW50UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5IiwicmVzZXQiLCJjb2xsZWN0UmVzcG9uc2VzIiwicHJvdmlkZWRPcHRpb25zIiwiREVGQVVMVF9PUFRJT05TIiwiYXNzZXJ0IiwicmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbiIsInVzZXNOYW1lcyIsIm5hbWVSZXNwb25zZSIsImdldCIsImlnbm9yZVByb3BlcnRpZXMiLCJ1c2VzT2JqZWN0Q2hhbmdlcyIsIm9iamVjdFJlc3BvbnNlIiwidXNlc0NvbnRleHRDaGFuZ2VzIiwiY29udGV4dFJlc3BvbnNlIiwidXNlc0ludGVyYWN0aW9uSGludHMiLCJoaW50UmVzcG9uc2UiLCJyZXNwb25zZUtleSIsImNyZWF0ZVBhdHRlcm5LZXkiLCJmaW5hbFJlc3BvbnNlIiwicGF0dGVyblN0cmluZyIsImdldFJlc3BvbnNlUGF0dGVybiIsImZpbGxJbiIsIk5BTUUiLCJPQkpFQ1QiLCJDT05URVhUIiwiSElOVCIsInJlc3BvbnNlQ29sbGVjdG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJyZXNwb25zZUNvbGxlY3Rvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYW5hZ2VzIG91dHB1dCBvZiByZXNwb25zZXMgZm9yIHRoZSBWb2ljaW5nIGZlYXR1cmUuIEZpcnN0LCBzZWUgU0NFTkVSWS9Wb2ljaW5nLnRzIGZvciBhIGRlc2NyaXB0aW9uIG9mIHdoYXQgdGhhdCBpbmNsdWRlcy5cclxuICogVGhpcyBzaW5nbGV0b24gaXMgcmVzcG9uc2libGUgZm9yIGNvbnRyb2xsaW5nIHdoZW4gcmVzcG9uc2VzIG9mIGVhY2ggY2F0ZWdvcnkgYXJlIHNwb2tlbiB3aGVuIHNwZWVjaCBpc1xyXG4gKiByZXF1ZXN0ZWQgZm9yIGEgTm9kZSBjb21wb3NlZCB3aXRoIFZvaWNpbmcuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIGZyb20gJy4vdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UuanMnO1xyXG5pbXBvcnQgUmVzcG9uc2VQYWNrZXQsIHsgU3BlYWthYmxlTnVsbGFibGVSZXNvbHZlZE9wdGlvbnMgfSBmcm9tICcuL1Jlc3BvbnNlUGFja2V0LmpzJztcclxuaW1wb3J0IFJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gZnJvbSAnLi9SZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBvcHRpb25pemUzIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5cclxudHlwZSBSZXNwb25zZUNvbGxlY3Rvck9wdGlvbnMgPSBQaGV0aW9PYmplY3RPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmNsYXNzIFJlc3BvbnNlQ29sbGVjdG9yIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuICBwdWJsaWMgbmFtZVJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIG9iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIGNvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyBoaW50UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogUmVzcG9uc2VDb2xsZWN0b3JPcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIGNvbXBvbmVudCBuYW1lcyBhcmUgcmVhZCBhcyBpbnB1dCBsYW5kcyBvbiB2YXJpb3VzIGNvbXBvbmVudHNcclxuICAgIHRoaXMubmFtZVJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIFwiT2JqZWN0IFJlc3BvbnNlc1wiIGFyZSByZWFkIGFzIGludGVyYWN0aXZlIGNvbXBvbmVudHMgY2hhbmdlXHJcbiAgICB0aGlzLm9iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gd2hldGhlciBcIkNvbnRleHQgUmVzcG9uc2VzXCIgYXJlIHJlYWQgYXMgaW5wdXRzIHJlY2VpdmUgaW50ZXJhY3Rpb25cclxuICAgIHRoaXMuY29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gd2hldGhlciBcIkhpbnRzXCIgYXJlIHJlYWQgdG8gdGhlIHVzZXIgaW4gcmVzcG9uc2UgdG8gY2VydGFpbiBpbnB1dFxyXG4gICAgdGhpcy5oaW50UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMubmFtZVJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5vYmplY3RSZXNwb25zZXNFbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5oaW50UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmVwYXJlcyBmaW5hbCBvdXRwdXQgd2l0aCBhbiBvYmplY3QgcmVzcG9uc2UsIGEgY29udGV4dCByZXNwb25zZSwgYW5kIGEgaGludC4gRWFjaCByZXNwb25zZVxyXG4gICAqIHdpbGwgb25seSBiZSBhZGRlZCB0byB0aGUgZmluYWwgc3RyaW5nIGlmIHRoYXQgcmVzcG9uc2UgdHlwZSBpcyBpbmNsdWRlZCBieSB0aGUgdXNlci4gUmF0aGVyIHRoYW4gdXNpbmdcclxuICAgKiB1bmlxdWUgdXR0ZXJhbmNlcywgd2UgdXNlIHN0cmluZyBpbnRlcnBvbGF0aW9uIHNvIHRoYXQgdGhlIGhpZ2hsaWdodCBhcm91bmQgdGhlIGFiamVjdCBiZWluZyBzcG9rZW5cclxuICAgKiBhYm91dCBzdGF5cyBsaXQgZm9yIHRoZSBlbnRpcmUgY29tYmluYXRpb24gb2YgcmVzcG9uc2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb2xsZWN0UmVzcG9uc2VzKCBwcm92aWRlZE9wdGlvbnM/OiBTcGVha2FibGVOdWxsYWJsZVJlc29sdmVkT3B0aW9ucyApOiBzdHJpbmcge1xyXG5cclxuICAgIC8vIHNlZSBSZXNwb25zZVBhY2tldCBmb3Igc3VwcG9ydGVkIG9wdGlvbnNcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemUzPFNwZWFrYWJsZU51bGxhYmxlUmVzb2x2ZWRPcHRpb25zPigpKCB7fSwgUmVzcG9uc2VQYWNrZXQuREVGQVVMVF9PUFRJT05TLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb24gaW5zdGFuY2VvZiBSZXNwb25zZVBhdHRlcm5Db2xsZWN0aW9uICk7XHJcblxyXG4gICAgY29uc3QgdXNlc05hbWVzID0gISEoIG9wdGlvbnMubmFtZVJlc3BvbnNlICYmICggdGhpcy5uYW1lUmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5LmdldCgpIHx8IG9wdGlvbnMuaWdub3JlUHJvcGVydGllcyApICk7XHJcbiAgICBjb25zdCB1c2VzT2JqZWN0Q2hhbmdlcyA9ICEhKCBvcHRpb25zLm9iamVjdFJlc3BvbnNlICYmICggdGhpcy5vYmplY3RSZXNwb25zZXNFbmFibGVkUHJvcGVydHkuZ2V0KCkgfHwgb3B0aW9ucy5pZ25vcmVQcm9wZXJ0aWVzICkgKTtcclxuICAgIGNvbnN0IHVzZXNDb250ZXh0Q2hhbmdlcyA9ICEhKCBvcHRpb25zLmNvbnRleHRSZXNwb25zZSAmJiAoIHRoaXMuY29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eS5nZXQoKSB8fCBvcHRpb25zLmlnbm9yZVByb3BlcnRpZXMgKSApO1xyXG4gICAgY29uc3QgdXNlc0ludGVyYWN0aW9uSGludHMgPSAhISggb3B0aW9ucy5oaW50UmVzcG9uc2UgJiYgKCB0aGlzLmhpbnRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkuZ2V0KCkgfHwgb3B0aW9ucy5pZ25vcmVQcm9wZXJ0aWVzICkgKTtcclxuICAgIGNvbnN0IHJlc3BvbnNlS2V5ID0gUmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5jcmVhdGVQYXR0ZXJuS2V5KCB1c2VzTmFtZXMsIHVzZXNPYmplY3RDaGFuZ2VzLCB1c2VzQ29udGV4dENoYW5nZXMsIHVzZXNJbnRlcmFjdGlvbkhpbnRzICk7XHJcblxyXG4gICAgbGV0IGZpbmFsUmVzcG9uc2UgPSAnJztcclxuICAgIGlmICggcmVzcG9uc2VLZXkgKSB7XHJcblxyXG4gICAgICAvLyBncmFjZWZ1bCBpZiB0aGUgcmVzcG9uc2VLZXkgaXMgZW1wdHksIGJ1dCBpZiB3ZSBmb3JtZWQgc29tZSBrZXksIGl0IHNob3VsZFxyXG4gICAgICAvLyBiZSBkZWZpbmVkIGluIHJlc3BvbnNlUGF0dGVybkNvbGxlY3Rpb25cclxuICAgICAgY29uc3QgcGF0dGVyblN0cmluZyA9IG9wdGlvbnMucmVzcG9uc2VQYXR0ZXJuQ29sbGVjdGlvbi5nZXRSZXNwb25zZVBhdHRlcm4oIHJlc3BvbnNlS2V5ICk7XHJcblxyXG4gICAgICBmaW5hbFJlc3BvbnNlID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgTkFNRTogb3B0aW9ucy5uYW1lUmVzcG9uc2UsXHJcbiAgICAgICAgT0JKRUNUOiBvcHRpb25zLm9iamVjdFJlc3BvbnNlLFxyXG4gICAgICAgIENPTlRFWFQ6IG9wdGlvbnMuY29udGV4dFJlc3BvbnNlLFxyXG4gICAgICAgIEhJTlQ6IG9wdGlvbnMuaGludFJlc3BvbnNlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmluYWxSZXNwb25zZTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IHJlc3BvbnNlQ29sbGVjdG9yID0gbmV3IFJlc3BvbnNlQ29sbGVjdG9yKCk7XHJcblxyXG51dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZS5yZWdpc3RlciggJ3Jlc3BvbnNlQ29sbGVjdG9yJywgcmVzcG9uc2VDb2xsZWN0b3IgKTtcclxuZXhwb3J0IGRlZmF1bHQgcmVzcG9uc2VDb2xsZWN0b3I7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLGtDQUFrQztBQUM5RCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUNsRSxPQUFPQyxjQUFjLE1BQTRDLHFCQUFxQjtBQUN0RixPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFFdEUsU0FBU0MsVUFBVSxRQUFRLGlDQUFpQztBQUM1RCxPQUFPQyxZQUFZLE1BQStCLGlDQUFpQztBQUtuRixNQUFNQyxpQkFBaUIsU0FBU0QsWUFBWSxDQUFDO0VBTXBDRSxXQUFXQSxDQUFFQyxPQUFrQyxFQUFHO0lBQ3ZELEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQyw0QkFBNEIsR0FBRyxJQUFJVixlQUFlLENBQUUsSUFBSyxDQUFDOztJQUUvRDtJQUNBLElBQUksQ0FBQ1csOEJBQThCLEdBQUcsSUFBSVgsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFbEU7SUFDQSxJQUFJLENBQUNZLCtCQUErQixHQUFHLElBQUlaLGVBQWUsQ0FBRSxLQUFNLENBQUM7O0lBRW5FO0lBQ0EsSUFBSSxDQUFDYSw0QkFBNEIsR0FBRyxJQUFJYixlQUFlLENBQUUsS0FBTSxDQUFDO0VBQ2xFO0VBRU9jLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNKLDRCQUE0QixDQUFDSSxLQUFLLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUNILDhCQUE4QixDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUNGLCtCQUErQixDQUFDRSxLQUFLLENBQUMsQ0FBQztJQUM1QyxJQUFJLENBQUNELDRCQUE0QixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUMzQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0MsZ0JBQWdCQSxDQUFFQyxlQUFrRCxFQUFXO0lBRXBGO0lBQ0EsTUFBTVAsT0FBTyxHQUFHSixVQUFVLENBQW1DLENBQUMsQ0FBRSxDQUFDLENBQUMsRUFBRUYsY0FBYyxDQUFDYyxlQUFlLEVBQUVELGVBQWdCLENBQUM7SUFFckhFLE1BQU0sSUFBSUEsTUFBTSxDQUFFVCxPQUFPLENBQUNVLHlCQUF5QixZQUFZZix5QkFBMEIsQ0FBQztJQUUxRixNQUFNZ0IsU0FBUyxHQUFHLENBQUMsRUFBR1gsT0FBTyxDQUFDWSxZQUFZLEtBQU0sSUFBSSxDQUFDWCw0QkFBNEIsQ0FBQ1ksR0FBRyxDQUFDLENBQUMsSUFBSWIsT0FBTyxDQUFDYyxnQkFBZ0IsQ0FBRSxDQUFFO0lBQ3ZILE1BQU1DLGlCQUFpQixHQUFHLENBQUMsRUFBR2YsT0FBTyxDQUFDZ0IsY0FBYyxLQUFNLElBQUksQ0FBQ2QsOEJBQThCLENBQUNXLEdBQUcsQ0FBQyxDQUFDLElBQUliLE9BQU8sQ0FBQ2MsZ0JBQWdCLENBQUUsQ0FBRTtJQUNuSSxNQUFNRyxrQkFBa0IsR0FBRyxDQUFDLEVBQUdqQixPQUFPLENBQUNrQixlQUFlLEtBQU0sSUFBSSxDQUFDZiwrQkFBK0IsQ0FBQ1UsR0FBRyxDQUFDLENBQUMsSUFBSWIsT0FBTyxDQUFDYyxnQkFBZ0IsQ0FBRSxDQUFFO0lBQ3RJLE1BQU1LLG9CQUFvQixHQUFHLENBQUMsRUFBR25CLE9BQU8sQ0FBQ29CLFlBQVksS0FBTSxJQUFJLENBQUNoQiw0QkFBNEIsQ0FBQ1MsR0FBRyxDQUFDLENBQUMsSUFBSWIsT0FBTyxDQUFDYyxnQkFBZ0IsQ0FBRSxDQUFFO0lBQ2xJLE1BQU1PLFdBQVcsR0FBRzFCLHlCQUF5QixDQUFDMkIsZ0JBQWdCLENBQUVYLFNBQVMsRUFBRUksaUJBQWlCLEVBQUVFLGtCQUFrQixFQUFFRSxvQkFBcUIsQ0FBQztJQUV4SSxJQUFJSSxhQUFhLEdBQUcsRUFBRTtJQUN0QixJQUFLRixXQUFXLEVBQUc7TUFFakI7TUFDQTtNQUNBLE1BQU1HLGFBQWEsR0FBR3hCLE9BQU8sQ0FBQ1UseUJBQXlCLENBQUNlLGtCQUFrQixDQUFFSixXQUFZLENBQUM7TUFFekZFLGFBQWEsR0FBRy9CLFdBQVcsQ0FBQ2tDLE1BQU0sQ0FBRUYsYUFBYSxFQUFFO1FBQ2pERyxJQUFJLEVBQUUzQixPQUFPLENBQUNZLFlBQVk7UUFDMUJnQixNQUFNLEVBQUU1QixPQUFPLENBQUNnQixjQUFjO1FBQzlCYSxPQUFPLEVBQUU3QixPQUFPLENBQUNrQixlQUFlO1FBQ2hDWSxJQUFJLEVBQUU5QixPQUFPLENBQUNvQjtNQUNoQixDQUFFLENBQUM7SUFDTDtJQUVBLE9BQU9HLGFBQWE7RUFDdEI7QUFDRjtBQUVBLE1BQU1RLGlCQUFpQixHQUFHLElBQUlqQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRWpETCx1QkFBdUIsQ0FBQ3VDLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRUQsaUJBQWtCLENBQUM7QUFDMUUsZUFBZUEsaUJBQWlCIn0=