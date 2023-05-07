// Copyright 2018-2023, University of Colorado Boulder

/**
 * The Screen Summary for Resistance in a Wire. This summary is at the top of the document, and is the first thing
 * that a screen reader user reads when using the sim. It provides overview information about the resistance
 * equation, visualization of the circuit, and the controls in the interface.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireStrings from '../../ResistanceInAWireStrings.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';
const summarySimString = ResistanceInAWireStrings.a11y.summary.sim;
const summaryCurrentlyString = ResistanceInAWireStrings.a11y.summary.currently;
const summaryResistancePatternString = ResistanceInAWireStrings.a11y.summary.resistancePattern;
const summaryResistivityPatternString = ResistanceInAWireStrings.a11y.summary.resistivityPattern;
const summaryLengthPatternString = ResistanceInAWireStrings.a11y.summary.lengthPattern;
const summaryAreaPatternString = ResistanceInAWireStrings.a11y.summary.areaPattern;
const summaryInteractionHintString = ResistanceInAWireStrings.a11y.summary.interactionHint;
class ResistanceInAWireScreenSummaryNode extends Node {
  // constants
  constructor(model) {
    super();

    // main summary for this sim - this content never changes
    this.addChild(new Node({
      tagName: 'p',
      innerContent: summarySimString
    }));

    // indicates that the summary updates with model changes
    this.addChild(new Node({
      tagName: 'p',
      innerContent: summaryCurrentlyString
    }));

    // list that updates according to model Properties
    const listNode = new Node({
      tagName: 'ul'
    });
    const resistanceItemNode = new Node({
      tagName: 'li'
    });
    const resistivityItemNode = new Node({
      tagName: 'li'
    });
    const lengthItemNode = new Node({
      tagName: 'li'
    });
    const areaItemNode = new Node({
      tagName: 'li'
    });
    this.addChild(listNode);
    listNode.children = [resistanceItemNode, resistivityItemNode, lengthItemNode, areaItemNode];

    // hint to look for other elements in the UI
    this.addChild(new Node({
      tagName: 'p',
      innerContent: summaryInteractionHintString
    }));

    // add listeners - add all values to a list so we can easily iterate and add listeners to update descriptions
    // with each property
    [{
      property: model.resistivityProperty,
      patternString: summaryResistivityPatternString,
      node: resistivityItemNode,
      precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
    }, {
      property: model.lengthProperty,
      patternString: summaryLengthPatternString,
      node: lengthItemNode,
      precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
    }, {
      property: model.areaProperty,
      patternString: summaryAreaPatternString,
      node: areaItemNode,
      precision: ResistanceInAWireConstants.SLIDER_READOUT_DECIMALS
    }, {
      property: model.resistanceProperty,
      patternString: summaryResistancePatternString,
      node: resistanceItemNode,
      precision: ResistanceInAWireConstants.getResistanceDecimals
    }].forEach(item => {
      // register listeners that update the labels in the screen summary - this summary exists for life of sim,
      // no need to dispose
      item.property.link(value => {
        // the precision might change during interaction, get precision if property is a function
        const precision = typeof item.precision === 'number' ? item.precision : item.precision(value);
        item.node.innerContent = StringUtils.fillIn(item.patternString, {
          value: Utils.toFixed(value, precision)
        });
      });
    });
  }
}
resistanceInAWire.register('ResistanceInAWireScreenSummaryNode', ResistanceInAWireScreenSummaryNode);
export default ResistanceInAWireScreenSummaryNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlN0cmluZ1V0aWxzIiwiTm9kZSIsInJlc2lzdGFuY2VJbkFXaXJlIiwiUmVzaXN0YW5jZUluQVdpcmVTdHJpbmdzIiwiUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMiLCJzdW1tYXJ5U2ltU3RyaW5nIiwiYTExeSIsInN1bW1hcnkiLCJzaW0iLCJzdW1tYXJ5Q3VycmVudGx5U3RyaW5nIiwiY3VycmVudGx5Iiwic3VtbWFyeVJlc2lzdGFuY2VQYXR0ZXJuU3RyaW5nIiwicmVzaXN0YW5jZVBhdHRlcm4iLCJzdW1tYXJ5UmVzaXN0aXZpdHlQYXR0ZXJuU3RyaW5nIiwicmVzaXN0aXZpdHlQYXR0ZXJuIiwic3VtbWFyeUxlbmd0aFBhdHRlcm5TdHJpbmciLCJsZW5ndGhQYXR0ZXJuIiwic3VtbWFyeUFyZWFQYXR0ZXJuU3RyaW5nIiwiYXJlYVBhdHRlcm4iLCJzdW1tYXJ5SW50ZXJhY3Rpb25IaW50U3RyaW5nIiwiaW50ZXJhY3Rpb25IaW50IiwiUmVzaXN0YW5jZUluQVdpcmVTY3JlZW5TdW1tYXJ5Tm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJhZGRDaGlsZCIsInRhZ05hbWUiLCJpbm5lckNvbnRlbnQiLCJsaXN0Tm9kZSIsInJlc2lzdGFuY2VJdGVtTm9kZSIsInJlc2lzdGl2aXR5SXRlbU5vZGUiLCJsZW5ndGhJdGVtTm9kZSIsImFyZWFJdGVtTm9kZSIsImNoaWxkcmVuIiwicHJvcGVydHkiLCJyZXNpc3Rpdml0eVByb3BlcnR5IiwicGF0dGVyblN0cmluZyIsIm5vZGUiLCJwcmVjaXNpb24iLCJTTElERVJfUkVBRE9VVF9ERUNJTUFMUyIsImxlbmd0aFByb3BlcnR5IiwiYXJlYVByb3BlcnR5IiwicmVzaXN0YW5jZVByb3BlcnR5IiwiZ2V0UmVzaXN0YW5jZURlY2ltYWxzIiwiZm9yRWFjaCIsIml0ZW0iLCJsaW5rIiwidmFsdWUiLCJmaWxsSW4iLCJ0b0ZpeGVkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJSZXNpc3RhbmNlSW5BV2lyZVNjcmVlblN1bW1hcnlOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBTY3JlZW4gU3VtbWFyeSBmb3IgUmVzaXN0YW5jZSBpbiBhIFdpcmUuIFRoaXMgc3VtbWFyeSBpcyBhdCB0aGUgdG9wIG9mIHRoZSBkb2N1bWVudCwgYW5kIGlzIHRoZSBmaXJzdCB0aGluZ1xyXG4gKiB0aGF0IGEgc2NyZWVuIHJlYWRlciB1c2VyIHJlYWRzIHdoZW4gdXNpbmcgdGhlIHNpbS4gSXQgcHJvdmlkZXMgb3ZlcnZpZXcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlc2lzdGFuY2VcclxuICogZXF1YXRpb24sIHZpc3VhbGl6YXRpb24gb2YgdGhlIGNpcmN1aXQsIGFuZCB0aGUgY29udHJvbHMgaW4gdGhlIGludGVyZmFjZS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJlc2lzdGFuY2VJbkFXaXJlIGZyb20gJy4uLy4uL3Jlc2lzdGFuY2VJbkFXaXJlLmpzJztcclxuaW1wb3J0IFJlc2lzdGFuY2VJbkFXaXJlU3RyaW5ncyBmcm9tICcuLi8uLi9SZXNpc3RhbmNlSW5BV2lyZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMgZnJvbSAnLi4vUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuanMnO1xyXG5cclxuY29uc3Qgc3VtbWFyeVNpbVN0cmluZyA9IFJlc2lzdGFuY2VJbkFXaXJlU3RyaW5ncy5hMTF5LnN1bW1hcnkuc2ltO1xyXG5jb25zdCBzdW1tYXJ5Q3VycmVudGx5U3RyaW5nID0gUmVzaXN0YW5jZUluQVdpcmVTdHJpbmdzLmExMXkuc3VtbWFyeS5jdXJyZW50bHk7XHJcbmNvbnN0IHN1bW1hcnlSZXNpc3RhbmNlUGF0dGVyblN0cmluZyA9IFJlc2lzdGFuY2VJbkFXaXJlU3RyaW5ncy5hMTF5LnN1bW1hcnkucmVzaXN0YW5jZVBhdHRlcm47XHJcbmNvbnN0IHN1bW1hcnlSZXNpc3Rpdml0eVBhdHRlcm5TdHJpbmcgPSBSZXNpc3RhbmNlSW5BV2lyZVN0cmluZ3MuYTExeS5zdW1tYXJ5LnJlc2lzdGl2aXR5UGF0dGVybjtcclxuY29uc3Qgc3VtbWFyeUxlbmd0aFBhdHRlcm5TdHJpbmcgPSBSZXNpc3RhbmNlSW5BV2lyZVN0cmluZ3MuYTExeS5zdW1tYXJ5Lmxlbmd0aFBhdHRlcm47XHJcbmNvbnN0IHN1bW1hcnlBcmVhUGF0dGVyblN0cmluZyA9IFJlc2lzdGFuY2VJbkFXaXJlU3RyaW5ncy5hMTF5LnN1bW1hcnkuYXJlYVBhdHRlcm47XHJcbmNvbnN0IHN1bW1hcnlJbnRlcmFjdGlvbkhpbnRTdHJpbmcgPSBSZXNpc3RhbmNlSW5BV2lyZVN0cmluZ3MuYTExeS5zdW1tYXJ5LmludGVyYWN0aW9uSGludDtcclxuXHJcbmNsYXNzIFJlc2lzdGFuY2VJbkFXaXJlU2NyZWVuU3VtbWFyeU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvLyBjb25zdGFudHNcclxuICBjb25zdHJ1Y3RvciggbW9kZWwgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIG1haW4gc3VtbWFyeSBmb3IgdGhpcyBzaW0gLSB0aGlzIGNvbnRlbnQgbmV2ZXIgY2hhbmdlc1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IE5vZGUoIHtcclxuICAgICAgdGFnTmFtZTogJ3AnLFxyXG4gICAgICBpbm5lckNvbnRlbnQ6IHN1bW1hcnlTaW1TdHJpbmdcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIGluZGljYXRlcyB0aGF0IHRoZSBzdW1tYXJ5IHVwZGF0ZXMgd2l0aCBtb2RlbCBjaGFuZ2VzXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTm9kZSggeyB0YWdOYW1lOiAncCcsIGlubmVyQ29udGVudDogc3VtbWFyeUN1cnJlbnRseVN0cmluZyB9ICkgKTtcclxuXHJcbiAgICAvLyBsaXN0IHRoYXQgdXBkYXRlcyBhY2NvcmRpbmcgdG8gbW9kZWwgUHJvcGVydGllc1xyXG4gICAgY29uc3QgbGlzdE5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAndWwnIH0gKTtcclxuICAgIGNvbnN0IHJlc2lzdGFuY2VJdGVtTm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdsaScgfSApO1xyXG4gICAgY29uc3QgcmVzaXN0aXZpdHlJdGVtTm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdsaScgfSApO1xyXG4gICAgY29uc3QgbGVuZ3RoSXRlbU5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnbGknIH0gKTtcclxuICAgIGNvbnN0IGFyZWFJdGVtTm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdsaScgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGlzdE5vZGUgKTtcclxuICAgIGxpc3ROb2RlLmNoaWxkcmVuID0gWyByZXNpc3RhbmNlSXRlbU5vZGUsIHJlc2lzdGl2aXR5SXRlbU5vZGUsIGxlbmd0aEl0ZW1Ob2RlLCBhcmVhSXRlbU5vZGUgXTtcclxuXHJcbiAgICAvLyBoaW50IHRvIGxvb2sgZm9yIG90aGVyIGVsZW1lbnRzIGluIHRoZSBVSVxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnLCBpbm5lckNvbnRlbnQ6IHN1bW1hcnlJbnRlcmFjdGlvbkhpbnRTdHJpbmcgfSApICk7XHJcblxyXG4gICAgLy8gYWRkIGxpc3RlbmVycyAtIGFkZCBhbGwgdmFsdWVzIHRvIGEgbGlzdCBzbyB3ZSBjYW4gZWFzaWx5IGl0ZXJhdGUgYW5kIGFkZCBsaXN0ZW5lcnMgdG8gdXBkYXRlIGRlc2NyaXB0aW9uc1xyXG4gICAgLy8gd2l0aCBlYWNoIHByb3BlcnR5XHJcbiAgICBbXHJcbiAgICAgIHtcclxuICAgICAgICBwcm9wZXJ0eTogbW9kZWwucmVzaXN0aXZpdHlQcm9wZXJ0eSxcclxuICAgICAgICBwYXR0ZXJuU3RyaW5nOiBzdW1tYXJ5UmVzaXN0aXZpdHlQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIG5vZGU6IHJlc2lzdGl2aXR5SXRlbU5vZGUsXHJcbiAgICAgICAgcHJlY2lzaW9uOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5TTElERVJfUkVBRE9VVF9ERUNJTUFMU1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcHJvcGVydHk6IG1vZGVsLmxlbmd0aFByb3BlcnR5LFxyXG4gICAgICAgIHBhdHRlcm5TdHJpbmc6IHN1bW1hcnlMZW5ndGhQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIG5vZGU6IGxlbmd0aEl0ZW1Ob2RlLFxyXG4gICAgICAgIHByZWNpc2lvbjogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuU0xJREVSX1JFQURPVVRfREVDSU1BTFNcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHByb3BlcnR5OiBtb2RlbC5hcmVhUHJvcGVydHksXHJcbiAgICAgICAgcGF0dGVyblN0cmluZzogc3VtbWFyeUFyZWFQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIG5vZGU6IGFyZWFJdGVtTm9kZSxcclxuICAgICAgICBwcmVjaXNpb246IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLlNMSURFUl9SRUFET1VUX0RFQ0lNQUxTXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBwcm9wZXJ0eTogbW9kZWwucmVzaXN0YW5jZVByb3BlcnR5LFxyXG4gICAgICAgIHBhdHRlcm5TdHJpbmc6IHN1bW1hcnlSZXNpc3RhbmNlUGF0dGVyblN0cmluZyxcclxuICAgICAgICBub2RlOiByZXNpc3RhbmNlSXRlbU5vZGUsXHJcbiAgICAgICAgcHJlY2lzaW9uOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5nZXRSZXNpc3RhbmNlRGVjaW1hbHNcclxuICAgICAgfVxyXG4gICAgXS5mb3JFYWNoKCBpdGVtID0+IHtcclxuXHJcbiAgICAgIC8vIHJlZ2lzdGVyIGxpc3RlbmVycyB0aGF0IHVwZGF0ZSB0aGUgbGFiZWxzIGluIHRoZSBzY3JlZW4gc3VtbWFyeSAtIHRoaXMgc3VtbWFyeSBleGlzdHMgZm9yIGxpZmUgb2Ygc2ltLFxyXG4gICAgICAvLyBubyBuZWVkIHRvIGRpc3Bvc2VcclxuICAgICAgaXRlbS5wcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBwcmVjaXNpb24gbWlnaHQgY2hhbmdlIGR1cmluZyBpbnRlcmFjdGlvbiwgZ2V0IHByZWNpc2lvbiBpZiBwcm9wZXJ0eSBpcyBhIGZ1bmN0aW9uXHJcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uID0gdHlwZW9mIGl0ZW0ucHJlY2lzaW9uID09PSAnbnVtYmVyJyA/IGl0ZW0ucHJlY2lzaW9uIDogaXRlbS5wcmVjaXNpb24oIHZhbHVlICk7XHJcbiAgICAgICAgaXRlbS5ub2RlLmlubmVyQ29udGVudCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggaXRlbS5wYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICB2YWx1ZTogVXRpbHMudG9GaXhlZCggdmFsdWUsIHByZWNpc2lvbiApXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5yZXNpc3RhbmNlSW5BV2lyZS5yZWdpc3RlciggJ1Jlc2lzdGFuY2VJbkFXaXJlU2NyZWVuU3VtbWFyeU5vZGUnLCBSZXNpc3RhbmNlSW5BV2lyZVNjcmVlblN1bW1hcnlOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFJlc2lzdGFuY2VJ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