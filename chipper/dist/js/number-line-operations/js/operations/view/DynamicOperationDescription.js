// Copyright 2020-2023, University of Colorado Boulder

/**
 * DynamicOperationDescription instances are used to provide a textual description of a number line operation BEFORE it
 * becomes active on the number line.  It updates, fades in and out, and animates as the user prepares and ultimately
 * adds the operation to the number line.  Instances of this class position themselves in view space based on what the
 * user is doing with an operation, so they are not meant to be positioned by the client. This class is very specific to
 * the Number Line Operation simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import Operation from '../../common/model/Operation.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

// constants
const FADE_TIME = 0.25; // in seconds
const TRAVEL_TIME = 0.7; // in seconds
const FONT = new PhetFont(22);
class DynamicOperationDescription extends Text {
  /**
   * @param {BooleanProperty} operationDescriptionsVisibleProperty - general viz param, the label will never be shown
   * when this is false
   * @param {Vector2} inactivePosition
   * @param {Vector2} activePosition
   * @param {NumberLineOperation} operation
   * @param {number} operationIDNumber - number that is used in conjunction with the selected selectedOperationIDProperty
   * to determine if this is the operation that the user is manipulating
   * @param {NumberProperty} selectedOperationIDProperty - the ID number of the operation that the user is manipulating
   * @param {OperationTrackingNumberLine} numberLine - the number line on which this operation is affiliated
   * @param {BooleanProperty} resetInProgressProperty - used to distinguish changes due to user interaction from those
   * caused by a reset
   * @param {BooleanProperty} operationEntryCarouselInFocusProperty - used to prevent this from being shown when
   * user actions from outside the operation entry carousels, such as an erase, causes changes to the operation
   * @param {Object} [options]
   */
  constructor(operationDescriptionsVisibleProperty, inactivePosition, activePosition, operation, operationIDNumber, selectedOperationIDProperty, numberLine, resetInProgressProperty, operationEntryCarouselInFocusProperty, options) {
    // This is intended to be constructed prior to the operation becoming active.
    assert && assert(!operation.isActiveProperty.value, 'operation must be inactive when this node is constructed');

    // Construct with no initial text and in the inactive position.
    super('', merge({
      font: FONT,
      center: inactivePosition,
      visible: false,
      opacity: 0
    }, options));

    // @private - location to which the description will animate when becoming active on the number line
    this.activePosition = activePosition;

    // Control overall visibility, unlink not needed.
    operationDescriptionsVisibleProperty.linkAttribute(this, 'visible');

    // Update the text as the attributes of the operation change.
    Multilink.multilink([operation.amountProperty, operation.operationTypeProperty], (amount, operationType) => {
      if (amount === 0) {
        this.string = StringUtils.fillIn(NumberLineOperationsStrings.addRemoveZeroCurrencyPattern, {
          addOrRemove: operationType === Operation.ADDITION ? NumberLineOperationsStrings.add : NumberLineOperationsStrings.remove,
          currencyUnits: NumberLineOperationsStrings.currencyUnits
        });
      } else {
        this.string = StringUtils.fillIn(NumberLineOperationsStrings.addRemoveAssetDebtPattern, {
          addOrRemove: operationType === Operation.ADDITION ? NumberLineOperationsStrings.add : NumberLineOperationsStrings.remove,
          assetOrDebt: amount > 0 ? NumberLineOperationsStrings.asset : NumberLineOperationsStrings.debt,
          currencyUnits: NumberLineOperationsStrings.currencyUnits,
          value: Math.abs(amount)
        });
      }
      this.center = inactivePosition;
    });

    // Listen for changes to the attributes of the operation and, if the other conditions check out, initiate a fade-in
    // when changes occur.
    Multilink.lazyMultilink([operationDescriptionsVisibleProperty, operation.amountProperty, operation.operationTypeProperty], () => {
      if (!resetInProgressProperty.value && operationDescriptionsVisibleProperty.value && operationEntryCarouselInFocusProperty.value && selectedOperationIDProperty.value === operationIDNumber && !operation.isActiveProperty.value && this.opacity === 0) {
        this.initiateFadeIn();
      }
    });

    // Handle changes to the selected operation.  No unlink is necessary.
    selectedOperationIDProperty.lazyLink(selectedOperationID => {
      if (!operation.isActiveProperty.value && operationEntryCarouselInFocusProperty.value) {
        // Fade out if visible and a different operation gets selected, fade in if this one becomes selected.
        if (selectedOperationID !== operationIDNumber && this.opacity > 0) {
          this.initiateFadeOut();
        } else if (selectedOperationID === operationIDNumber && this.opacity === 0) {
          this.initiateFadeIn();
        }
      }
    });

    // Fade out if visible and the focus moves away from the operation entry controls.  No unlink needed.
    operationEntryCarouselInFocusProperty.link(operationEntryCarouselInFocus => {
      if (this.opacity > 0 && !operationEntryCarouselInFocus) {
        this.initiateFadeOut();
      }
    });

    // Handle changes to the 'isActive' state of the operation.  The description for active operations is shown near the
    // operation, whereas the description for inactive operations are shown in a different position or not at all.  No
    // unlink is needed.  No unlink is necessary.
    operation.isActiveProperty.lazyLink(isActive => {
      if (isActive) {
        if (this.opacity !== 1) {
          // If the operation becomes active while invisible or fading in, instantly make it fully visible.
          this.cancelInProgressAnimations();
          this.opacity = 1;
        }

        // Head to the "active" position.
        this.initiateMovementToActivePosition();
      } else {
        // Go back to the inactive position (without animation).
        this.center = inactivePosition;

        // If the focus is on the carousel, that indicates that the operation was erased from the number line using the
        // operation entry control.  In this case, fade in.
        if (operationEntryCarouselInFocusProperty.value) {
          this.initiateFadeIn();
        } else {
          // The operation was cleared due to a reset or external erase by the user, so this should be invisible.
          this.opacity = 0;
        }
      }
    });

    // Go instantly invisible on a reset, unlink not needed.
    resetInProgressProperty.lazyLink(resetInProgress => {
      if (resetInProgress) {
        this.cancelInProgressAnimations();
        this.opacity = 0;
      }
    });

    // @private {Animation|null} - animations that are used to fade and move this node, null when inactive
    this.movementAnimation = null;
    this.fadeAnimation = null;
  }

  /**
   * @private
   */
  initiateFadeIn(preFadeInDelay = 0) {
    this.cancelInProgressAnimations();

    // Create and start the fade-in animation.
    this.fadeAnimation = new Animation({
      duration: FADE_TIME,
      delay: preFadeInDelay,
      targets: [{
        object: this,
        attribute: 'opacity',
        from: this.opacity,
        to: 1,
        easing: Easing.LINEAR
      }]
    });
    this.fadeAnimation.finishEmitter.addListener(() => {
      this.fadeAnimation = null;
    });
    this.fadeAnimation.start();
  }

  /**
   * Cancel the fade animation if it exists, do nothing if it doesn't.
   * @private
   */
  cancelInProgressAnimations() {
    if (this.fadeAnimation) {
      this.fadeAnimation.stop();
    }
    if (this.movementAnimation) {
      this.movementAnimation.stop();
    }
  }

  /**
   * @private
   */
  initiateFadeOut() {
    this.cancelInProgressAnimations();

    // Create and start the fade-out animation.
    this.fadeAnimation = new Animation({
      duration: FADE_TIME,
      targets: [{
        object: this,
        attribute: 'opacity',
        from: this.opacity,
        to: 0,
        easing: Easing.LINEAR
      }]
    });
    this.fadeAnimation.finishEmitter.addListener(() => {
      this.fadeAnimation = null;
    });
    this.fadeAnimation.start();
  }

  /**
   * @private
   */
  initiateMovementToActivePosition() {
    // If the node is already on its way, there is no need to re-initiate.
    if (!this.movementAnimation) {
      // Create and start the fade-out animation.
      this.movementAnimation = new Animation({
        duration: TRAVEL_TIME,
        targets: [{
          object: this,
          attribute: 'centerY',
          from: this.centerY,
          to: this.activePosition.y,
          easing: Easing.QUINTIC_IN
        }]
      });
      this.movementAnimation.finishEmitter.addListener(() => {
        this.movementAnimation = null;
        this.initiateFadeOut();
      });
      this.movementAnimation.start();
    }
  }
}
numberLineOperations.register('DynamicOperationDescription', DynamicOperationDescription);
export default DynamicOperationDescription;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiUGhldEZvbnQiLCJUZXh0IiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiT3BlcmF0aW9uIiwibnVtYmVyTGluZU9wZXJhdGlvbnMiLCJOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MiLCJGQURFX1RJTUUiLCJUUkFWRUxfVElNRSIsIkZPTlQiLCJEeW5hbWljT3BlcmF0aW9uRGVzY3JpcHRpb24iLCJjb25zdHJ1Y3RvciIsIm9wZXJhdGlvbkRlc2NyaXB0aW9uc1Zpc2libGVQcm9wZXJ0eSIsImluYWN0aXZlUG9zaXRpb24iLCJhY3RpdmVQb3NpdGlvbiIsIm9wZXJhdGlvbiIsIm9wZXJhdGlvbklETnVtYmVyIiwic2VsZWN0ZWRPcGVyYXRpb25JRFByb3BlcnR5IiwibnVtYmVyTGluZSIsInJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5Iiwib3BlcmF0aW9uRW50cnlDYXJvdXNlbEluRm9jdXNQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJpc0FjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJmb250IiwiY2VudGVyIiwidmlzaWJsZSIsIm9wYWNpdHkiLCJsaW5rQXR0cmlidXRlIiwibXVsdGlsaW5rIiwiYW1vdW50UHJvcGVydHkiLCJvcGVyYXRpb25UeXBlUHJvcGVydHkiLCJhbW91bnQiLCJvcGVyYXRpb25UeXBlIiwic3RyaW5nIiwiZmlsbEluIiwiYWRkUmVtb3ZlWmVyb0N1cnJlbmN5UGF0dGVybiIsImFkZE9yUmVtb3ZlIiwiQURESVRJT04iLCJhZGQiLCJyZW1vdmUiLCJjdXJyZW5jeVVuaXRzIiwiYWRkUmVtb3ZlQXNzZXREZWJ0UGF0dGVybiIsImFzc2V0T3JEZWJ0IiwiYXNzZXQiLCJkZWJ0IiwiTWF0aCIsImFicyIsImxhenlNdWx0aWxpbmsiLCJpbml0aWF0ZUZhZGVJbiIsImxhenlMaW5rIiwic2VsZWN0ZWRPcGVyYXRpb25JRCIsImluaXRpYXRlRmFkZU91dCIsImxpbmsiLCJvcGVyYXRpb25FbnRyeUNhcm91c2VsSW5Gb2N1cyIsImlzQWN0aXZlIiwiY2FuY2VsSW5Qcm9ncmVzc0FuaW1hdGlvbnMiLCJpbml0aWF0ZU1vdmVtZW50VG9BY3RpdmVQb3NpdGlvbiIsInJlc2V0SW5Qcm9ncmVzcyIsIm1vdmVtZW50QW5pbWF0aW9uIiwiZmFkZUFuaW1hdGlvbiIsInByZUZhZGVJbkRlbGF5IiwiZHVyYXRpb24iLCJkZWxheSIsInRhcmdldHMiLCJvYmplY3QiLCJhdHRyaWJ1dGUiLCJmcm9tIiwidG8iLCJlYXNpbmciLCJMSU5FQVIiLCJmaW5pc2hFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJzdGFydCIsInN0b3AiLCJjZW50ZXJZIiwieSIsIlFVSU5USUNfSU4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkR5bmFtaWNPcGVyYXRpb25EZXNjcmlwdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEeW5hbWljT3BlcmF0aW9uRGVzY3JpcHRpb24gaW5zdGFuY2VzIGFyZSB1c2VkIHRvIHByb3ZpZGUgYSB0ZXh0dWFsIGRlc2NyaXB0aW9uIG9mIGEgbnVtYmVyIGxpbmUgb3BlcmF0aW9uIEJFRk9SRSBpdFxyXG4gKiBiZWNvbWVzIGFjdGl2ZSBvbiB0aGUgbnVtYmVyIGxpbmUuICBJdCB1cGRhdGVzLCBmYWRlcyBpbiBhbmQgb3V0LCBhbmQgYW5pbWF0ZXMgYXMgdGhlIHVzZXIgcHJlcGFyZXMgYW5kIHVsdGltYXRlbHlcclxuICogYWRkcyB0aGUgb3BlcmF0aW9uIHRvIHRoZSBudW1iZXIgbGluZS4gIEluc3RhbmNlcyBvZiB0aGlzIGNsYXNzIHBvc2l0aW9uIHRoZW1zZWx2ZXMgaW4gdmlldyBzcGFjZSBiYXNlZCBvbiB3aGF0IHRoZVxyXG4gKiB1c2VyIGlzIGRvaW5nIHdpdGggYW4gb3BlcmF0aW9uLCBzbyB0aGV5IGFyZSBub3QgbWVhbnQgdG8gYmUgcG9zaXRpb25lZCBieSB0aGUgY2xpZW50LiBUaGlzIGNsYXNzIGlzIHZlcnkgc3BlY2lmaWMgdG9cclxuICogdGhlIE51bWJlciBMaW5lIE9wZXJhdGlvbiBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBPcGVyYXRpb24gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09wZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lT3BlcmF0aW9ucyBmcm9tICcuLi8uLi9udW1iZXJMaW5lT3BlcmF0aW9ucy5qcyc7XHJcbmltcG9ydCBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MgZnJvbSAnLi4vLi4vTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGQURFX1RJTUUgPSAwLjI1OyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IFRSQVZFTF9USU1FID0gMC43OyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IEZPTlQgPSBuZXcgUGhldEZvbnQoIDIyICk7XHJcblxyXG5jbGFzcyBEeW5hbWljT3BlcmF0aW9uRGVzY3JpcHRpb24gZXh0ZW5kcyBUZXh0IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IG9wZXJhdGlvbkRlc2NyaXB0aW9uc1Zpc2libGVQcm9wZXJ0eSAtIGdlbmVyYWwgdml6IHBhcmFtLCB0aGUgbGFiZWwgd2lsbCBuZXZlciBiZSBzaG93blxyXG4gICAqIHdoZW4gdGhpcyBpcyBmYWxzZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5hY3RpdmVQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gYWN0aXZlUG9zaXRpb25cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVPcGVyYXRpb259IG9wZXJhdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcGVyYXRpb25JRE51bWJlciAtIG51bWJlciB0aGF0IGlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUgc2VsZWN0ZWQgc2VsZWN0ZWRPcGVyYXRpb25JRFByb3BlcnR5XHJcbiAgICogdG8gZGV0ZXJtaW5lIGlmIHRoaXMgaXMgdGhlIG9wZXJhdGlvbiB0aGF0IHRoZSB1c2VyIGlzIG1hbmlwdWxhdGluZ1xyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IHNlbGVjdGVkT3BlcmF0aW9uSURQcm9wZXJ0eSAtIHRoZSBJRCBudW1iZXIgb2YgdGhlIG9wZXJhdGlvbiB0aGF0IHRoZSB1c2VyIGlzIG1hbmlwdWxhdGluZ1xyXG4gICAqIEBwYXJhbSB7T3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lfSBudW1iZXJMaW5lIC0gdGhlIG51bWJlciBsaW5lIG9uIHdoaWNoIHRoaXMgb3BlcmF0aW9uIGlzIGFmZmlsaWF0ZWRcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gcmVzZXRJblByb2dyZXNzUHJvcGVydHkgLSB1c2VkIHRvIGRpc3Rpbmd1aXNoIGNoYW5nZXMgZHVlIHRvIHVzZXIgaW50ZXJhY3Rpb24gZnJvbSB0aG9zZVxyXG4gICAqIGNhdXNlZCBieSBhIHJlc2V0XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IG9wZXJhdGlvbkVudHJ5Q2Fyb3VzZWxJbkZvY3VzUHJvcGVydHkgLSB1c2VkIHRvIHByZXZlbnQgdGhpcyBmcm9tIGJlaW5nIHNob3duIHdoZW5cclxuICAgKiB1c2VyIGFjdGlvbnMgZnJvbSBvdXRzaWRlIHRoZSBvcGVyYXRpb24gZW50cnkgY2Fyb3VzZWxzLCBzdWNoIGFzIGFuIGVyYXNlLCBjYXVzZXMgY2hhbmdlcyB0byB0aGUgb3BlcmF0aW9uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgb3BlcmF0aW9uRGVzY3JpcHRpb25zVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgaW5hY3RpdmVQb3NpdGlvbixcclxuICAgIGFjdGl2ZVBvc2l0aW9uLFxyXG4gICAgb3BlcmF0aW9uLFxyXG4gICAgb3BlcmF0aW9uSUROdW1iZXIsXHJcbiAgICBzZWxlY3RlZE9wZXJhdGlvbklEUHJvcGVydHksXHJcbiAgICBudW1iZXJMaW5lLFxyXG4gICAgcmVzZXRJblByb2dyZXNzUHJvcGVydHksXHJcbiAgICBvcGVyYXRpb25FbnRyeUNhcm91c2VsSW5Gb2N1c1Byb3BlcnR5LFxyXG4gICAgb3B0aW9uc1xyXG4gICkge1xyXG5cclxuICAgIC8vIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgY29uc3RydWN0ZWQgcHJpb3IgdG8gdGhlIG9wZXJhdGlvbiBiZWNvbWluZyBhY3RpdmUuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkudmFsdWUsICdvcGVyYXRpb24gbXVzdCBiZSBpbmFjdGl2ZSB3aGVuIHRoaXMgbm9kZSBpcyBjb25zdHJ1Y3RlZCcgKTtcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3Qgd2l0aCBubyBpbml0aWFsIHRleHQgYW5kIGluIHRoZSBpbmFjdGl2ZSBwb3NpdGlvbi5cclxuICAgIHN1cGVyKCAnJywgbWVyZ2UoIHtcclxuICAgICAgZm9udDogRk9OVCxcclxuICAgICAgY2VudGVyOiBpbmFjdGl2ZVBvc2l0aW9uLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBsb2NhdGlvbiB0byB3aGljaCB0aGUgZGVzY3JpcHRpb24gd2lsbCBhbmltYXRlIHdoZW4gYmVjb21pbmcgYWN0aXZlIG9uIHRoZSBudW1iZXIgbGluZVxyXG4gICAgdGhpcy5hY3RpdmVQb3NpdGlvbiA9IGFjdGl2ZVBvc2l0aW9uO1xyXG5cclxuICAgIC8vIENvbnRyb2wgb3ZlcmFsbCB2aXNpYmlsaXR5LCB1bmxpbmsgbm90IG5lZWRlZC5cclxuICAgIG9wZXJhdGlvbkRlc2NyaXB0aW9uc1Zpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHRleHQgYXMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG9wZXJhdGlvbiBjaGFuZ2UuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eSwgb3BlcmF0aW9uLm9wZXJhdGlvblR5cGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGFtb3VudCwgb3BlcmF0aW9uVHlwZSApID0+IHtcclxuICAgICAgICBpZiAoIGFtb3VudCA9PT0gMCApIHtcclxuICAgICAgICAgIHRoaXMuc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuYWRkUmVtb3ZlWmVyb0N1cnJlbmN5UGF0dGVybiwge1xyXG4gICAgICAgICAgICBhZGRPclJlbW92ZTogb3BlcmF0aW9uVHlwZSA9PT0gT3BlcmF0aW9uLkFERElUSU9OID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5hZGQgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLnJlbW92ZSxcclxuICAgICAgICAgICAgY3VycmVuY3lVbml0czogTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmN1cnJlbmN5VW5pdHNcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmFkZFJlbW92ZUFzc2V0RGVidFBhdHRlcm4sIHtcclxuICAgICAgICAgICAgYWRkT3JSZW1vdmU6IG9wZXJhdGlvblR5cGUgPT09IE9wZXJhdGlvbi5BRERJVElPTiA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuYWRkIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5yZW1vdmUsXHJcbiAgICAgICAgICAgIGFzc2V0T3JEZWJ0OiBhbW91bnQgPiAwID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlckxpbmVPcGVyYXRpb25zU3RyaW5ncy5hc3NldCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBOdW1iZXJMaW5lT3BlcmF0aW9uc1N0cmluZ3MuZGVidCxcclxuICAgICAgICAgICAgY3VycmVuY3lVbml0czogTnVtYmVyTGluZU9wZXJhdGlvbnNTdHJpbmdzLmN1cnJlbmN5VW5pdHMsXHJcbiAgICAgICAgICAgIHZhbHVlOiBNYXRoLmFicyggYW1vdW50IClcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gaW5hY3RpdmVQb3NpdGlvbjtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBMaXN0ZW4gZm9yIGNoYW5nZXMgdG8gdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG9wZXJhdGlvbiBhbmQsIGlmIHRoZSBvdGhlciBjb25kaXRpb25zIGNoZWNrIG91dCwgaW5pdGlhdGUgYSBmYWRlLWluXHJcbiAgICAvLyB3aGVuIGNoYW5nZXMgb2NjdXIuXHJcbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayhcclxuICAgICAgWyBvcGVyYXRpb25EZXNjcmlwdGlvbnNWaXNpYmxlUHJvcGVydHksIG9wZXJhdGlvbi5hbW91bnRQcm9wZXJ0eSwgb3BlcmF0aW9uLm9wZXJhdGlvblR5cGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhcmVzZXRJblByb2dyZXNzUHJvcGVydHkudmFsdWUgJiYgb3BlcmF0aW9uRGVzY3JpcHRpb25zVmlzaWJsZVByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICAgICBvcGVyYXRpb25FbnRyeUNhcm91c2VsSW5Gb2N1c1Byb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbklEUHJvcGVydHkudmFsdWUgPT09IG9wZXJhdGlvbklETnVtYmVyICYmICFvcGVyYXRpb24uaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgdGhpcy5vcGFjaXR5ID09PSAwICkge1xyXG4gICAgICAgICAgdGhpcy5pbml0aWF0ZUZhZGVJbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY2hhbmdlcyB0byB0aGUgc2VsZWN0ZWQgb3BlcmF0aW9uLiAgTm8gdW5saW5rIGlzIG5lY2Vzc2FyeS5cclxuICAgIHNlbGVjdGVkT3BlcmF0aW9uSURQcm9wZXJ0eS5sYXp5TGluayggc2VsZWN0ZWRPcGVyYXRpb25JRCA9PiB7XHJcblxyXG4gICAgICBpZiAoICFvcGVyYXRpb24uaXNBY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJiBvcGVyYXRpb25FbnRyeUNhcm91c2VsSW5Gb2N1c1Byb3BlcnR5LnZhbHVlICkge1xyXG5cclxuICAgICAgICAvLyBGYWRlIG91dCBpZiB2aXNpYmxlIGFuZCBhIGRpZmZlcmVudCBvcGVyYXRpb24gZ2V0cyBzZWxlY3RlZCwgZmFkZSBpbiBpZiB0aGlzIG9uZSBiZWNvbWVzIHNlbGVjdGVkLlxyXG4gICAgICAgIGlmICggc2VsZWN0ZWRPcGVyYXRpb25JRCAhPT0gb3BlcmF0aW9uSUROdW1iZXIgJiYgdGhpcy5vcGFjaXR5ID4gMCApIHtcclxuICAgICAgICAgIHRoaXMuaW5pdGlhdGVGYWRlT3V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBzZWxlY3RlZE9wZXJhdGlvbklEID09PSBvcGVyYXRpb25JRE51bWJlciAmJiB0aGlzLm9wYWNpdHkgPT09IDAgKSB7XHJcbiAgICAgICAgICB0aGlzLmluaXRpYXRlRmFkZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRmFkZSBvdXQgaWYgdmlzaWJsZSBhbmQgdGhlIGZvY3VzIG1vdmVzIGF3YXkgZnJvbSB0aGUgb3BlcmF0aW9uIGVudHJ5IGNvbnRyb2xzLiAgTm8gdW5saW5rIG5lZWRlZC5cclxuICAgIG9wZXJhdGlvbkVudHJ5Q2Fyb3VzZWxJbkZvY3VzUHJvcGVydHkubGluayggb3BlcmF0aW9uRW50cnlDYXJvdXNlbEluRm9jdXMgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMub3BhY2l0eSA+IDAgJiYgIW9wZXJhdGlvbkVudHJ5Q2Fyb3VzZWxJbkZvY3VzICkge1xyXG4gICAgICAgIHRoaXMuaW5pdGlhdGVGYWRlT3V0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgY2hhbmdlcyB0byB0aGUgJ2lzQWN0aXZlJyBzdGF0ZSBvZiB0aGUgb3BlcmF0aW9uLiAgVGhlIGRlc2NyaXB0aW9uIGZvciBhY3RpdmUgb3BlcmF0aW9ucyBpcyBzaG93biBuZWFyIHRoZVxyXG4gICAgLy8gb3BlcmF0aW9uLCB3aGVyZWFzIHRoZSBkZXNjcmlwdGlvbiBmb3IgaW5hY3RpdmUgb3BlcmF0aW9ucyBhcmUgc2hvd24gaW4gYSBkaWZmZXJlbnQgcG9zaXRpb24gb3Igbm90IGF0IGFsbC4gIE5vXHJcbiAgICAvLyB1bmxpbmsgaXMgbmVlZGVkLiAgTm8gdW5saW5rIGlzIG5lY2Vzc2FyeS5cclxuICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LmxhenlMaW5rKCBpc0FjdGl2ZSA9PiB7XHJcblxyXG4gICAgICBpZiAoIGlzQWN0aXZlICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMub3BhY2l0eSAhPT0gMSApIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgb3BlcmF0aW9uIGJlY29tZXMgYWN0aXZlIHdoaWxlIGludmlzaWJsZSBvciBmYWRpbmcgaW4sIGluc3RhbnRseSBtYWtlIGl0IGZ1bGx5IHZpc2libGUuXHJcbiAgICAgICAgICB0aGlzLmNhbmNlbEluUHJvZ3Jlc3NBbmltYXRpb25zKCk7XHJcbiAgICAgICAgICB0aGlzLm9wYWNpdHkgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSGVhZCB0byB0aGUgXCJhY3RpdmVcIiBwb3NpdGlvbi5cclxuICAgICAgICB0aGlzLmluaXRpYXRlTW92ZW1lbnRUb0FjdGl2ZVBvc2l0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIEdvIGJhY2sgdG8gdGhlIGluYWN0aXZlIHBvc2l0aW9uICh3aXRob3V0IGFuaW1hdGlvbikuXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBpbmFjdGl2ZVBvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgZm9jdXMgaXMgb24gdGhlIGNhcm91c2VsLCB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBvcGVyYXRpb24gd2FzIGVyYXNlZCBmcm9tIHRoZSBudW1iZXIgbGluZSB1c2luZyB0aGVcclxuICAgICAgICAvLyBvcGVyYXRpb24gZW50cnkgY29udHJvbC4gIEluIHRoaXMgY2FzZSwgZmFkZSBpbi5cclxuICAgICAgICBpZiAoIG9wZXJhdGlvbkVudHJ5Q2Fyb3VzZWxJbkZvY3VzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICB0aGlzLmluaXRpYXRlRmFkZUluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBvcGVyYXRpb24gd2FzIGNsZWFyZWQgZHVlIHRvIGEgcmVzZXQgb3IgZXh0ZXJuYWwgZXJhc2UgYnkgdGhlIHVzZXIsIHNvIHRoaXMgc2hvdWxkIGJlIGludmlzaWJsZS5cclxuICAgICAgICAgIHRoaXMub3BhY2l0eSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gR28gaW5zdGFudGx5IGludmlzaWJsZSBvbiBhIHJlc2V0LCB1bmxpbmsgbm90IG5lZWRlZC5cclxuICAgIHJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5LmxhenlMaW5rKCByZXNldEluUHJvZ3Jlc3MgPT4ge1xyXG4gICAgICBpZiAoIHJlc2V0SW5Qcm9ncmVzcyApIHtcclxuICAgICAgICB0aGlzLmNhbmNlbEluUHJvZ3Jlc3NBbmltYXRpb25zKCk7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gMDtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBbmltYXRpb258bnVsbH0gLSBhbmltYXRpb25zIHRoYXQgYXJlIHVzZWQgdG8gZmFkZSBhbmQgbW92ZSB0aGlzIG5vZGUsIG51bGwgd2hlbiBpbmFjdGl2ZVxyXG4gICAgdGhpcy5tb3ZlbWVudEFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICB0aGlzLmZhZGVBbmltYXRpb24gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpbml0aWF0ZUZhZGVJbiggcHJlRmFkZUluRGVsYXkgPSAwICkge1xyXG5cclxuICAgIHRoaXMuY2FuY2VsSW5Qcm9ncmVzc0FuaW1hdGlvbnMoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIHN0YXJ0IHRoZSBmYWRlLWluIGFuaW1hdGlvbi5cclxuICAgIHRoaXMuZmFkZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgZHVyYXRpb246IEZBREVfVElNRSxcclxuICAgICAgZGVsYXk6IHByZUZhZGVJbkRlbGF5LFxyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgb2JqZWN0OiB0aGlzLFxyXG4gICAgICAgICAgYXR0cmlidXRlOiAnb3BhY2l0eScsXHJcbiAgICAgICAgICBmcm9tOiB0aGlzLm9wYWNpdHksXHJcbiAgICAgICAgICB0bzogMSxcclxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5mYWRlQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5mYWRlQW5pbWF0aW9uID0gbnVsbDtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZmFkZUFuaW1hdGlvbi5zdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FuY2VsIHRoZSBmYWRlIGFuaW1hdGlvbiBpZiBpdCBleGlzdHMsIGRvIG5vdGhpbmcgaWYgaXQgZG9lc24ndC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNhbmNlbEluUHJvZ3Jlc3NBbmltYXRpb25zKCkge1xyXG4gICAgaWYgKCB0aGlzLmZhZGVBbmltYXRpb24gKSB7XHJcbiAgICAgIHRoaXMuZmFkZUFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMubW92ZW1lbnRBbmltYXRpb24gKSB7XHJcbiAgICAgIHRoaXMubW92ZW1lbnRBbmltYXRpb24uc3RvcCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpbml0aWF0ZUZhZGVPdXQoKSB7XHJcblxyXG4gICAgdGhpcy5jYW5jZWxJblByb2dyZXNzQW5pbWF0aW9ucygpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgc3RhcnQgdGhlIGZhZGUtb3V0IGFuaW1hdGlvbi5cclxuICAgIHRoaXMuZmFkZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgZHVyYXRpb246IEZBREVfVElNRSxcclxuICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG9iamVjdDogdGhpcyxcclxuICAgICAgICAgIGF0dHJpYnV0ZTogJ29wYWNpdHknLFxyXG4gICAgICAgICAgZnJvbTogdGhpcy5vcGFjaXR5LFxyXG4gICAgICAgICAgdG86IDAsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuZmFkZUFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuZmFkZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZhZGVBbmltYXRpb24uc3RhcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaW5pdGlhdGVNb3ZlbWVudFRvQWN0aXZlUG9zaXRpb24oKSB7XHJcblxyXG4gICAgLy8gSWYgdGhlIG5vZGUgaXMgYWxyZWFkeSBvbiBpdHMgd2F5LCB0aGVyZSBpcyBubyBuZWVkIHRvIHJlLWluaXRpYXRlLlxyXG4gICAgaWYgKCAhdGhpcy5tb3ZlbWVudEFuaW1hdGlvbiApIHtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgc3RhcnQgdGhlIGZhZGUtb3V0IGFuaW1hdGlvbi5cclxuICAgICAgdGhpcy5tb3ZlbWVudEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICBkdXJhdGlvbjogVFJBVkVMX1RJTUUsXHJcbiAgICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBvYmplY3Q6IHRoaXMsXHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZTogJ2NlbnRlclknLFxyXG4gICAgICAgICAgICBmcm9tOiB0aGlzLmNlbnRlclksXHJcbiAgICAgICAgICAgIHRvOiB0aGlzLmFjdGl2ZVBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVSU5USUNfSU5cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5tb3ZlbWVudEFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb3ZlbWVudEFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pbml0aWF0ZUZhZGVPdXQoKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLm1vdmVtZW50QW5pbWF0aW9uLnN0YXJ0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lT3BlcmF0aW9ucy5yZWdpc3RlciggJ0R5bmFtaWNPcGVyYXRpb25EZXNjcmlwdGlvbicsIER5bmFtaWNPcGVyYXRpb25EZXNjcmlwdGlvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBEeW5hbWljT3BlcmF0aW9uRGVzY3JpcHRpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9D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