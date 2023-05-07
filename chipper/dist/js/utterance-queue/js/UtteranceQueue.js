// Copyright 2019-2023, University of Colorado Boulder

/**
 * Manages a queue of Utterances that are read in order by assistive technology (AT). This queue typically reads
 * things in a first-in-first-out manner, but it is possible to send an alert directly to the front of
 * the queue. Items in the queue are sent to AT front to back, driven by AXON/timer.
 *
 * An Utterance instance is used as a unique value to the UtteranceQueue. If you add an Utterance a second time to the,
 * queue, the queue will remove the previous instance, and treat the new addition as if the Utterance has been in the
 * queue the entire time, but in the new position.
 *
 * AT are inconsistent in the way that they order alerts, some use last-in-first-out order,
 * others use first-in-first-out order, others just read the last alert that was provided. This queue
 * manages order and improves consistency.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import stepTimer from '../../axon/js/stepTimer.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import AriaLiveAnnouncer from './AriaLiveAnnouncer.js';
import Utterance from './Utterance.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
import UtteranceWrapper from './UtteranceWrapper.js';
class UtteranceQueue extends PhetioObject {
  // Sends browser requests to announce either through aria-live with a screen reader or
  // SpeechSynthesis with Web Speech API (respectively), or any method that implements this interface. Use with caution,
  // and only with the understanding that you know what Announcer this UtteranceQueue instance uses.

  // Initialization is like utteranceQueue's constructor. No-ops all around if not
  // initialized (cheers). See constructor()
  // array of UtteranceWrappers, see private class for details. Announced
  // first in first out (fifo). Earlier utterances will be lower in the Array.
  // whether Utterances moving through the queue are read by a screen reader
  // whether the UtterancesQueue is alerting, and if you can add/remove utterances
  // Maps the Utterance to a listener on its priorityProperty that will
  // update the queue when priority changes. The map lets us remove the listener when the Utterance gets
  // removed from the queue. Only Utterances that are in the queue should be added to this. For handling
  // priority-listening while an Utterance is being announced, see this.announcingUtteranceWrapper.
  // A reference to an UtteranceWrapper that contains the Utterance that is provided to
  // the Announcer when we actually call announcer.announce(). While the Announcer is announcing this Utterance,
  // a listener needs to remain on the Utterance.priorityProperty so that we can reprioritize Utterances or
  // interrupt this Utterance if priorityProperty changes. A separate reference to this UtteranceWrapper supports
  // having a listener on an Utterance in the queue with utteranceToPriorityListenerMap while the announcer is
  // announcing that Utterance at the same time. See https://github.com/phetsims/utterance-queue/issues/46.
  // See doc for options.featureSpecificAnnouncingControlPropertyName
  // only null when UtteranceQueue is not initialized
  /**
   * @param announcer - The output implementation for the utteranceQueue, must implement an announce function
   *                             which requests speech in some way (such as the Web Speech API or aria-live)
   * @param [providedOptions]
   */
  constructor(announcer, providedOptions) {
    const options = optionize()({
      debug: false,
      initialize: true,
      featureSpecificAnnouncingControlPropertyName: null
    }, providedOptions);
    super(options);
    this.announcer = announcer;
    this._initialized = options.initialize;
    this.featureSpecificAnnouncingControlPropertyName = options.featureSpecificAnnouncingControlPropertyName;
    this.queue = [];
    this._muted = false;
    this._enabled = true;
    this.utteranceToPriorityListenerMap = new Map();
    this.announcingUtteranceWrapper = null;
    this.debug = options.debug;

    // When the Announcer is done with an Utterance, remove priority listeners and remove from the
    // utteranceToPriorityListenerMap.
    this.announcer.announcementCompleteEmitter.addListener(utterance => {
      // Multiple UtteranceQueues may use the same Announcer, so we need to make sure that we are responding
      // to an announcement completion for the right Utterance.
      if (this.announcingUtteranceWrapper && utterance === this.announcingUtteranceWrapper.utterance) {
        assert && assert(this.announcingUtteranceWrapper.announcingUtterancePriorityListener, 'announcingUtterancePriorityListener should be set on this.announcingUtteranceWrapper');
        const announcingUtterancePriorityListener = this.announcingUtteranceWrapper.announcingUtterancePriorityListener;

        // It is possible that this.announcer is also used by a different UtteranceQueue so when
        // announcementCompleteEmitter emits, it may not be for this UtteranceWrapper. this.announcingUtteranceWrapper
        // and its announcingUtterancePriorityListener could only have been set by this queue, so this check ensures
        // that we are removing the priorityProperty listener from the correct Utterance.
        if (this.announcingUtteranceWrapper.utterance.priorityProperty.hasListener(announcingUtterancePriorityListener)) {
          this.announcingUtteranceWrapper.utterance.priorityProperty.unlink(announcingUtterancePriorityListener);
          this.announcingUtteranceWrapper.announcingUtterancePriorityListener = null;
          this.announcingUtteranceWrapper = null;
        }
      }
    });
    this.stepQueueListener = null;
    if (this._initialized) {
      this.stepQueueListener = this.stepQueue.bind(this);

      // begin stepping the queue
      stepTimer.addListener(this.stepQueueListener);
    }
  }
  get length() {
    return this.queue.length;
  }

  /**
   * Add an utterance ot the end of the queue.  If the utterance has a type of alert which
   * is already in the queue, the older alert will be immediately removed.
   */
  addToBack(utterance) {
    // No-op if the utteranceQueue is disabled
    if (!this.initializedAndEnabled) {
      return;
    }
    if (!this.announcer.hasSpoken) {
      // We haven't successfully spoken with the technology of the Announcer yet, keep trying
      // to speak synchronously to be compatible with browser limitations that the first usage
      // of speech needs to come from a synchronous request form the user. See https://github.com/phetsims/utterance-queue/issues/65
      this.announceImmediately(utterance);
    } else {
      // Remove identical Utterances from the queue and wrap with a class that will manage timing variables.
      const utteranceWrapper = this.prepareUtterance(utterance);

      // Add to the queue before prioritizing so that we know which Utterances to prioritize against
      this.queue.push(utteranceWrapper);
      this.debug && console.log('addToBack');

      // Add listeners that will re-prioritize the queue when the priorityProperty changes
      this.addPriorityListenerAndPrioritizeQueue(utteranceWrapper);
    }
  }

  /**
   * Add an utterance to the front of the queue to be read immediately.
   * @deprecated
   */
  addToFront(utterance) {
    deprecationWarning('`addToFront()` has been deprecated because it is confusing, and most of the time doesn\'t do what ' + 'is expected, because Utterances are announced based on time-in-queue first, and then position ' + 'in the queue. It is recommended to use addToBack, and then timing variables on Utterances, ' + 'or instead call queue.clear() before adding a more important alert to the queue.');

    // No-op function if the utteranceQueue is disabled
    if (!this.initializedAndEnabled) {
      return;
    }
    const utteranceWrapper = this.prepareUtterance(utterance);
    this.queue.unshift(utteranceWrapper);
  }

  /**
   * Adds a listener to the priorityProperty of an Utterance, and puts the listener on a map so it
   * can easily be removed later. Finally, re-prioritizes Utterances in the queue based on the
   * priority of the new utterance.
   *
   * You must add the utteranceWrapper to the queue before calling this function.
   */
  addPriorityListenerAndPrioritizeQueue(utteranceWrapper) {
    assert && assert(!this.utteranceToPriorityListenerMap.has(utteranceWrapper.utterance), 'About to add the priority listener twice and only one should exist on the Utterance. The listener should have been removed by removeOthersAndUpdateUtteranceWrapper.');
    const priorityListener = () => {
      this.prioritizeUtterances(utteranceWrapper);
    };
    utteranceWrapper.utterance.priorityProperty.lazyLink(priorityListener);
    this.utteranceToPriorityListenerMap.set(utteranceWrapper.utterance, priorityListener);
    this.prioritizeUtterances(utteranceWrapper);
  }

  /**
   * Create an Utterance for the queue in case of string and clears the queue of duplicate utterances. This will also
   * remove duplicates in the queue, and update to the most recent timeInQueue variable.
   */
  prepareUtterance(utterance) {
    if (!(utterance instanceof Utterance)) {
      utterance = new Utterance({
        alert: utterance
      });
    }
    const utteranceWrapper = new UtteranceWrapper(utterance);

    // If there are any other items in the queue of the same type, remove them immediately because the added
    // utterance is meant to replace it
    this.removeOthersAndUpdateUtteranceWrapper(utteranceWrapper);

    // Reset the time watching utterance stability since it has been added to the queue.
    utteranceWrapper.stableTime = 0;
    return utteranceWrapper;
  }

  /**
   * Remove an Utterance from the queue. This function is only able to remove `Utterance` instances, and cannot remove
   * other TAlertable types.
   */
  removeUtterance(utterance) {
    const utteranceWrapperToUtteranceMapper = utteranceWrapper => utteranceWrapper.utterance === utterance;
    assert && assert(_.find(this.queue, utteranceWrapperToUtteranceMapper), 'utterance to be removed not found in queue');

    // remove all occurrences, if applicable
    const removedUtteranceWrappers = _.remove(this.queue, utteranceWrapperToUtteranceMapper);
    this.removePriorityListeners(removedUtteranceWrappers);
  }

  /**
   * Remove earlier Utterances from the queue if the Utterance is important enough. This will also interrupt
   * the utterance that is in the process of being announced by the Announcer.
   */
  prioritizeUtterances(utteranceWrapperToPrioritize) {
    let utteranceWrapperIndex = this.queue.indexOf(utteranceWrapperToPrioritize);

    // If this funciton is called from addToBack(), then utteranceWrapperToPrioritize will be the last utterance in the queue.
    const utteranceWrapperInQueue = utteranceWrapperIndex >= 0;

    // utteranceWrapperToPrioritize will only affect other Utterances that are "ahead" of it in the queue
    let traverseToFrontStartIndex;
    if (utteranceWrapperInQueue) {
      // The utterance is in the queue already, we need to walk back to the front of the queue to remove
      // Utterances that have a lower priority.
      traverseToFrontStartIndex = utteranceWrapperIndex - 1;
    } else {
      // If not in the queue, priority will be managed by the announcer.
      traverseToFrontStartIndex = -1;
    }

    // Update the queue before letting the Announcer know that priority is changing, since that could stop current
    // speech and possibly start the next utterance to be announced.
    for (let i = traverseToFrontStartIndex; i >= 0; i--) {
      const otherUtteranceWrapper = this.queue[i];
      if (this.shouldUtteranceCancelOther(utteranceWrapperToPrioritize.utterance, otherUtteranceWrapper.utterance)) {
        this.removeUtterance(otherUtteranceWrapper.utterance);
      }
    }

    // Now look backwards to determine if the utteranceWrapper should be removed because an utterance behind it
    // has a higher priority. The only utterance that we have to check is the next one in the queue because
    // any utterance further back MUST be of lower priority. The next Utterance after
    // utteranceWrapperToPrioritize.utterance would have been removed when the higher priority utterances further
    // back were added.
    if (utteranceWrapperInQueue) {
      utteranceWrapperIndex = this.queue.indexOf(utteranceWrapperToPrioritize);
      assert && assert(utteranceWrapperIndex > -1, 'utteranceWrapper is not in queue?');
      const otherUtteranceWrapper = this.queue[utteranceWrapperIndex + 1];
      if (otherUtteranceWrapper && this.shouldUtteranceCancelOther(otherUtteranceWrapper.utterance, utteranceWrapperToPrioritize.utterance)) {
        this.removeUtterance(utteranceWrapperToPrioritize.utterance);
      }
    }

    // Let the Announcer know that priority has changed so that it can do work such as cancel the currently speaking
    // utterance if it has become low priority
    if (this.queue.length > 0) {
      this.announcer.onUtterancePriorityChange(this.queue[0].utterance);
    }
  }

  /**
   * Given one utterance, should it cancel the other? The priority is used to determine if
   * one Utterance should cancel another, but the Announcer may override with its own logic.
   */
  shouldUtteranceCancelOther(utterance, utteranceToCancel) {
    return this.announcer.shouldUtteranceCancelOther(utterance, utteranceToCancel);
  }
  removeOthersAndUpdateUtteranceWrapper(utteranceWrapper) {
    const times = [];

    // we need all the times, in case there are more than one wrapper instance already in the Queue.
    for (let i = 0; i < this.queue.length; i++) {
      const currentUtteranceWrapper = this.queue[i];
      if (currentUtteranceWrapper.utterance === utteranceWrapper.utterance) {
        times.push(currentUtteranceWrapper.timeInQueue);
      }
    }

    // This side effect is to make sure that the timeInQueue is transferred between adding the same Utterance.
    if (times.length >= 1) {
      utteranceWrapper.timeInQueue = Math.max(...times);
    }

    // remove all occurrences, if applicable.
    const removedWrappers = _.remove(this.queue, currentUtteranceWrapper => currentUtteranceWrapper.utterance === utteranceWrapper.utterance);
    this.removePriorityListeners(removedWrappers);
  }

  /**
   * Returns true if the UtteranceQueue is running and moving through Utterances.
   */
  get initializedAndEnabled() {
    return this._enabled && this._initialized;
  }

  /**
   * Get the next utterance to alert if one is ready and "stable". If there are no utterances or no utterance is
   * ready to be announced, will return null.
   */
  getNextUtterance() {
    // find the next item to announce - generally the next item in the queue, unless it has a delay specified that
    // is greater than the amount of time that the utterance has been sitting in the queue
    let nextUtteranceWrapper = null;
    for (let i = 0; i < this.queue.length; i++) {
      const utteranceWrapper = this.queue[i];

      // if we have waited long enough for the utterance to become "stable" or the utterance has been in the queue
      // for longer than the maximum delay override, it will be announced
      if (utteranceWrapper.stableTime > utteranceWrapper.utterance.alertStableDelay || utteranceWrapper.timeInQueue > utteranceWrapper.utterance.alertMaximumDelay) {
        nextUtteranceWrapper = utteranceWrapper;
        break;
      }
    }
    return nextUtteranceWrapper;
  }

  /**
   * Returns true if the utterances is in this queue.
   */
  hasUtterance(utterance) {
    for (let i = 0; i < this.queue.length; i++) {
      const utteranceWrapper = this.queue[i];
      if (utterance === utteranceWrapper.utterance) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clear the utteranceQueue of all Utterances, any Utterances remaining in the queue will
   * not be announced by the screen reader.
   */
  clear() {
    this.debug && console.log('UttearnceQueue.clear()');

    // Removes all priority listeners from the queue.
    this.removePriorityListeners(this.queue);
    this.queue.length = 0;
  }

  /**
   * Cancel the provided Utterance if it is being spoken by the Announcer. Removes the Utterance from the queue if
   * it is not being spoken by the announcer. Does nothing to other Utterances. The Announcer implements the behavior
   * to stop speech.
   */
  cancelUtterance(utterance) {
    this.announcer.cancelUtterance(utterance);
    if (this.hasUtterance(utterance)) {
      this.removeUtterance(utterance);
    }
  }

  /**
   * Clears all Utterances from the queue and cancels announcement of any Utterances that are being
   * announced by the Announcer.
   */
  cancel() {
    this.debug && console.log('UtteranceQueue.cancel()');
    this.clear();
    this.announcer.cancel();
  }

  /**
   * Removes the listeners on Utterance Priority for all provided UtteranceWrappers.
   */
  removePriorityListeners(utteranceWrappers) {
    utteranceWrappers.forEach(utteranceWrapper => this.removePriorityListener(utteranceWrapper.utterance));
  }
  removePriorityListener(utterance) {
    const listener = this.utteranceToPriorityListenerMap.get(utterance);

    // The same Utterance may exist multiple times in the queue if we are removing duplicates from the array,
    // so the listener may have already been removed.
    if (listener) {
      utterance.priorityProperty.unlink(listener);
      this.utteranceToPriorityListenerMap.delete(utterance);
    }
  }

  /**
   * Set whether or not the utterance queue is muted.  When muted, Utterances will still
   * move through the queue, but nothing will be sent to assistive technology.
   */
  setMuted(isMuted) {
    this._muted = isMuted;
  }
  set muted(isMuted) {
    this.setMuted(isMuted);
  }
  get muted() {
    return this.getMuted();
  }

  /**
   * Get whether or not the utteranceQueue is muted.  When muted, Utterances will still
   * move through the queue, but nothing will be read by asistive technology.
   */
  getMuted() {
    return this._muted;
  }

  /**
   * Set whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
   * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
   */
  setEnabled(isEnabled) {
    this._enabled = isEnabled;
  }
  set enabled(isEnabled) {
    this.setEnabled(isEnabled);
  }
  get enabled() {
    return this.isEnabled();
  }

  /**
   * Get whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
   * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
   */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Step the queue, called by the timer.
   * @param dt - time since last step, in seconds
   */
  stepQueue(dt) {
    // No-op function if the utteranceQueue is disabled
    if (!this._enabled) {
      return;
    }
    dt *= 1000; // convert to ms

    if (this.queue.length > 0) {
      for (let i = 0; i < this.queue.length; i++) {
        const utteranceWrapper = this.queue[i];
        utteranceWrapper.timeInQueue += dt;
        utteranceWrapper.stableTime += dt;
      }
      const nextUtteranceWrapper = this.getNextUtterance();
      if (nextUtteranceWrapper) {
        this.attemptToAnnounce(nextUtteranceWrapper);
      }
    }
  }

  /**
   * Immediately announce the provided Utterance. If the Announcer is ready to announce, the Utterance will be announced
   * synchronously with this call. Otherwise, the Utterance will be added to the front of the queue to be announced
   * as soon as the Announcer is ready.
   *
   * This function should generally not be used. Use addToBack() in correlation with priorityProperty and timing variables
   * to control the flow of Utterances. This function can be useful when you need an Utterance to be announced
   * synchronously with user input (for example, due to browser constraints on initializing SpeechSynthesis).
   *
   * Any duplicate instance of the provided Utterance that is already in the queue will be removed, matching the
   * behavior of addToBack().
   *
   * announceImmediately() respects Utterance.priorityProperty. A provided Utterance with a priority equal to or lower
   * than what is being announced will not interrupt and will never be announced. If an Utterance at the front of the
   * queue has a higher priority than the provided Utterance, the provided Utterance will never be announced. If the
   * provided Utterance has a higher priority than what is at the front of the queue or what is being announced, it will
   * be announced immediately and interrupt the announcer. Otherwise, it will never be announced.
   */
  announceImmediately(utterance) {
    // No-op if the utteranceQueue is disabled
    if (!this.initializedAndEnabled) {
      return;
    }
    this.debug && console.log('announceImmediately');

    // Don't call prepareUtterance because we want to bypass queue operations.
    if (!(utterance instanceof Utterance)) {
      utterance = new Utterance({
        alert: utterance
      });
    }

    // The utterance can only be announced with announceImmediately if there is no announcing Utterance, or if the
    // Announcer allows cancel of the announcing Utterance (checking relative priorityProperty or other things)
    if (this.announcingUtteranceWrapper === null || this.announcer.shouldUtteranceCancelOther(utterance, this.announcingUtteranceWrapper.utterance)) {
      // Remove identical Utterances from the queue and wrap with a class that will manage timing variables.
      const utteranceWrapper = this.prepareUtterance(utterance);

      // set timing variables such that the utterance is ready to announce immediately
      utteranceWrapper.stableTime = Number.POSITIVE_INFINITY;
      utteranceWrapper.timeInQueue = Number.POSITIVE_INFINITY;

      // addPriorityListenerAndPrioritizeQueue assumes the UtteranceWrapper is in the queue, add first
      this.queue.unshift(utteranceWrapper);
      this.addPriorityListenerAndPrioritizeQueue(utteranceWrapper);

      // Prioritization may have determined that this utterance should not be announced, and so was
      // quickly removed from the queue.
      if (this.queue.includes(utteranceWrapper)) {
        // Attempt to announce the Utterance immediately (synchronously) - if the announcer is not ready
        // yet, it will still be at the front of the queue and will be next to be announced as soon as possible
        this.attemptToAnnounce(utteranceWrapper);
      }
    }
  }
  attemptToAnnounce(utteranceWrapper) {
    const utterance = utteranceWrapper.utterance;

    // only query and remove the next utterance if the announcer indicates it is ready for speech
    if (this.announcer.readyToAnnounce) {
      const announceText = utterance.getAlertText(this.announcer.respectResponseCollectorProperties);
      this.debug && console.log('ready to announce in attemptToAnnounce(): ', announceText);

      // featureSpecificAnnouncingControlPropertyName is opt in, so support if it is not supplied
      const featureSpecificAnnouncePermitted = !this.featureSpecificAnnouncingControlPropertyName || utterance[this.featureSpecificAnnouncingControlPropertyName].value;

      // Utterance allows announcing if canAnnounceProperty is true, predicate returns true, and any feature-specific
      // control Property that this UtteranceQueue has opted into is also true.
      const utterancePermitsAnnounce = utterance.canAnnounceProperty.value && utterance.predicate() && featureSpecificAnnouncePermitted;

      // only announce the utterance if not muted, the utterance permits announcing, and the utterance text is not empty
      if (!this._muted && utterancePermitsAnnounce && announceText !== '') {
        assert && assert(this.announcingUtteranceWrapper === null, 'announcingUtteranceWrapper and its priorityProperty listener should have been disposed');

        // Save a reference to the UtteranceWrapper and its priorityProperty listener while the Announcer is announcing
        // it so that it can be removed at the end of announcement.
        this.announcingUtteranceWrapper = utteranceWrapper;
        this.announcingUtteranceWrapper.announcingUtterancePriorityListener = () => {
          this.prioritizeUtterances(utteranceWrapper);
        };
        utteranceWrapper.utterance.priorityProperty.link(this.announcingUtteranceWrapper.announcingUtterancePriorityListener);
        this.debug && console.log('announcing: ', announceText);
        this.announcer.announce(announceText, utterance, utterance.announcerOptions);
      } else {
        this.debug && console.log('announcer readyToAnnounce but utterance cannot announce, will not be spoken: ', announceText);
      }

      // Announcer.announce may remove this Utterance as a side effect in a listener eagerly (for example
      // if we try to clear the queue when this Utterance ends, but it ends immediately because the browser
      // is not ready for speech). See https://github.com/phetsims/utterance-queue/issues/45.
      // But generally, the Utterance should still be in the queue and should now be removed.
      this.queue.includes(utteranceWrapper) && this.removeUtterance(utteranceWrapper.utterance);
    } else {
      this.debug && console.log('announcer not readyToAnnounce');
    }
  }
  dispose() {
    // only remove listeners if they were added in initialize
    if (this._initialized) {
      assert && assert(this.stepQueueListener);
      stepTimer.removeListener(this.stepQueueListener);
    }
    super.dispose();
  }

  /**
   * Simple factory to wire up all steps for using UtteranceQueue for aria-live alerts. This accomplishes the three items
   * needed for UtteranceQueue to run:
   * 1. Step phet.axon.stepTimer on animation frame (passing it elapsed time in seconds)
   * 2. Add UtteranceQueue's aria-live elements to the document
   * 3. Create the UtteranceQueue instance
   */
  static fromFactory() {
    const ariaLiveAnnouncer = new AriaLiveAnnouncer();
    const utteranceQueue = new UtteranceQueue(ariaLiveAnnouncer);
    const container = ariaLiveAnnouncer.ariaLiveContainer;

    // gracefully support if there is no body
    document.body ? document.body.appendChild(container) : document.children[0].appendChild(container);
    let previousTime = 0;
    const step = elapsedTime => {
      const dt = elapsedTime - previousTime;
      previousTime = elapsedTime;

      // time takes seconds
      phet.axon.stepTimer.emit(dt / 1000);
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
    return utteranceQueue;
  }
}
utteranceQueueNamespace.register('UtteranceQueue', UtteranceQueue);
export default UtteranceQueue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJkZXByZWNhdGlvbldhcm5pbmciLCJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJBcmlhTGl2ZUFubm91bmNlciIsIlV0dGVyYW5jZSIsInV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIiwiVXR0ZXJhbmNlV3JhcHBlciIsIlV0dGVyYW5jZVF1ZXVlIiwiY29uc3RydWN0b3IiLCJhbm5vdW5jZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZGVidWciLCJpbml0aWFsaXplIiwiZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUiLCJfaW5pdGlhbGl6ZWQiLCJxdWV1ZSIsIl9tdXRlZCIsIl9lbmFibGVkIiwidXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwIiwiTWFwIiwiYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIiLCJhbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInV0dGVyYW5jZSIsImFzc2VydCIsImFubm91bmNpbmdVdHRlcmFuY2VQcmlvcml0eUxpc3RlbmVyIiwicHJpb3JpdHlQcm9wZXJ0eSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwic3RlcFF1ZXVlTGlzdGVuZXIiLCJzdGVwUXVldWUiLCJiaW5kIiwibGVuZ3RoIiwiYWRkVG9CYWNrIiwiaW5pdGlhbGl6ZWRBbmRFbmFibGVkIiwiaGFzU3Bva2VuIiwiYW5ub3VuY2VJbW1lZGlhdGVseSIsInV0dGVyYW5jZVdyYXBwZXIiLCJwcmVwYXJlVXR0ZXJhbmNlIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJhZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlIiwiYWRkVG9Gcm9udCIsInVuc2hpZnQiLCJoYXMiLCJwcmlvcml0eUxpc3RlbmVyIiwicHJpb3JpdGl6ZVV0dGVyYW5jZXMiLCJsYXp5TGluayIsInNldCIsImFsZXJ0IiwicmVtb3ZlT3RoZXJzQW5kVXBkYXRlVXR0ZXJhbmNlV3JhcHBlciIsInN0YWJsZVRpbWUiLCJyZW1vdmVVdHRlcmFuY2UiLCJ1dHRlcmFuY2VXcmFwcGVyVG9VdHRlcmFuY2VNYXBwZXIiLCJfIiwiZmluZCIsInJlbW92ZWRVdHRlcmFuY2VXcmFwcGVycyIsInJlbW92ZSIsInJlbW92ZVByaW9yaXR5TGlzdGVuZXJzIiwidXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZSIsInV0dGVyYW5jZVdyYXBwZXJJbmRleCIsImluZGV4T2YiLCJ1dHRlcmFuY2VXcmFwcGVySW5RdWV1ZSIsInRyYXZlcnNlVG9Gcm9udFN0YXJ0SW5kZXgiLCJpIiwib3RoZXJVdHRlcmFuY2VXcmFwcGVyIiwic2hvdWxkVXR0ZXJhbmNlQ2FuY2VsT3RoZXIiLCJvblV0dGVyYW5jZVByaW9yaXR5Q2hhbmdlIiwidXR0ZXJhbmNlVG9DYW5jZWwiLCJ0aW1lcyIsImN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyIiwidGltZUluUXVldWUiLCJNYXRoIiwibWF4IiwicmVtb3ZlZFdyYXBwZXJzIiwiZ2V0TmV4dFV0dGVyYW5jZSIsIm5leHRVdHRlcmFuY2VXcmFwcGVyIiwiYWxlcnRTdGFibGVEZWxheSIsImFsZXJ0TWF4aW11bURlbGF5IiwiaGFzVXR0ZXJhbmNlIiwiY2xlYXIiLCJjYW5jZWxVdHRlcmFuY2UiLCJjYW5jZWwiLCJ1dHRlcmFuY2VXcmFwcGVycyIsImZvckVhY2giLCJyZW1vdmVQcmlvcml0eUxpc3RlbmVyIiwibGlzdGVuZXIiLCJnZXQiLCJkZWxldGUiLCJzZXRNdXRlZCIsImlzTXV0ZWQiLCJtdXRlZCIsImdldE11dGVkIiwic2V0RW5hYmxlZCIsImlzRW5hYmxlZCIsImVuYWJsZWQiLCJkdCIsImF0dGVtcHRUb0Fubm91bmNlIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJpbmNsdWRlcyIsInJlYWR5VG9Bbm5vdW5jZSIsImFubm91bmNlVGV4dCIsImdldEFsZXJ0VGV4dCIsInJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMiLCJmZWF0dXJlU3BlY2lmaWNBbm5vdW5jZVBlcm1pdHRlZCIsInZhbHVlIiwidXR0ZXJhbmNlUGVybWl0c0Fubm91bmNlIiwiY2FuQW5ub3VuY2VQcm9wZXJ0eSIsInByZWRpY2F0ZSIsImxpbmsiLCJhbm5vdW5jZSIsImFubm91bmNlck9wdGlvbnMiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJmcm9tRmFjdG9yeSIsImFyaWFMaXZlQW5ub3VuY2VyIiwidXR0ZXJhbmNlUXVldWUiLCJjb250YWluZXIiLCJhcmlhTGl2ZUNvbnRhaW5lciIsImRvY3VtZW50IiwiYm9keSIsImFwcGVuZENoaWxkIiwiY2hpbGRyZW4iLCJwcmV2aW91c1RpbWUiLCJzdGVwIiwiZWxhcHNlZFRpbWUiLCJwaGV0IiwiYXhvbiIsImVtaXQiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlV0dGVyYW5jZVF1ZXVlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgYSBxdWV1ZSBvZiBVdHRlcmFuY2VzIHRoYXQgYXJlIHJlYWQgaW4gb3JkZXIgYnkgYXNzaXN0aXZlIHRlY2hub2xvZ3kgKEFUKS4gVGhpcyBxdWV1ZSB0eXBpY2FsbHkgcmVhZHNcclxuICogdGhpbmdzIGluIGEgZmlyc3QtaW4tZmlyc3Qtb3V0IG1hbm5lciwgYnV0IGl0IGlzIHBvc3NpYmxlIHRvIHNlbmQgYW4gYWxlcnQgZGlyZWN0bHkgdG8gdGhlIGZyb250IG9mXHJcbiAqIHRoZSBxdWV1ZS4gSXRlbXMgaW4gdGhlIHF1ZXVlIGFyZSBzZW50IHRvIEFUIGZyb250IHRvIGJhY2ssIGRyaXZlbiBieSBBWE9OL3RpbWVyLlxyXG4gKlxyXG4gKiBBbiBVdHRlcmFuY2UgaW5zdGFuY2UgaXMgdXNlZCBhcyBhIHVuaXF1ZSB2YWx1ZSB0byB0aGUgVXR0ZXJhbmNlUXVldWUuIElmIHlvdSBhZGQgYW4gVXR0ZXJhbmNlIGEgc2Vjb25kIHRpbWUgdG8gdGhlLFxyXG4gKiBxdWV1ZSwgdGhlIHF1ZXVlIHdpbGwgcmVtb3ZlIHRoZSBwcmV2aW91cyBpbnN0YW5jZSwgYW5kIHRyZWF0IHRoZSBuZXcgYWRkaXRpb24gYXMgaWYgdGhlIFV0dGVyYW5jZSBoYXMgYmVlbiBpbiB0aGVcclxuICogcXVldWUgdGhlIGVudGlyZSB0aW1lLCBidXQgaW4gdGhlIG5ldyBwb3NpdGlvbi5cclxuICpcclxuICogQVQgYXJlIGluY29uc2lzdGVudCBpbiB0aGUgd2F5IHRoYXQgdGhleSBvcmRlciBhbGVydHMsIHNvbWUgdXNlIGxhc3QtaW4tZmlyc3Qtb3V0IG9yZGVyLFxyXG4gKiBvdGhlcnMgdXNlIGZpcnN0LWluLWZpcnN0LW91dCBvcmRlciwgb3RoZXJzIGp1c3QgcmVhZCB0aGUgbGFzdCBhbGVydCB0aGF0IHdhcyBwcm92aWRlZC4gVGhpcyBxdWV1ZVxyXG4gKiBtYW5hZ2VzIG9yZGVyIGFuZCBpbXByb3ZlcyBjb25zaXN0ZW5jeS5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBBbm5vdW5jZXIgZnJvbSAnLi9Bbm5vdW5jZXIuanMnO1xyXG5pbXBvcnQgQXJpYUxpdmVBbm5vdW5jZXIgZnJvbSAnLi9BcmlhTGl2ZUFubm91bmNlci5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UsIHsgRmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eSwgVEFsZXJ0YWJsZSB9IGZyb20gJy4vVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IHV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIGZyb20gJy4vdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlV3JhcHBlciBmcm9tICcuL1V0dGVyYW5jZVdyYXBwZXIuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gYWRkIGV4dHJhIGxvZ2dpbmcsIGhlbHBmdWwgZHVyaW5nIGRlYnVnZ2luZ1xyXG4gIGRlYnVnPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gQnkgZGVmYXVsdCwgaW5pdGlhbGl6ZSB0aGUgVXR0ZXJhbmNlUXVldWUgZnVsbHksIHdpdGggYWxsIGZlYXR1cmVzLCBpZiBmYWxzZSwgZWFjaCBmdW5jdGlvbiBvZiB0aGlzIHR5cGUgd2lsbCBuby1vcFxyXG4gIGluaXRpYWxpemU/OiBib29sZWFuO1xyXG5cclxuICAvLyBCeSBkZWZhdWx0IHRoZSBVdHRlcmFuY2VRdWV1ZSB3aWxsIHF1ZXJ5IFV0dGVyYW5jZS5jYW5Bbm5vdW5jZVByb3BlcnR5IHRvIGRldGVybWluZSBpZiB0aGUgVXR0ZXJhbmNlIGNhbiBiZVxyXG4gIC8vIGFubm91bmNlZCB0byB0aGUgQW5ub3VuY2VyLiBXaXRoIHRoaXMgb3B0aW9uLCB0aGUgcXVldWUgd2lsbCBhbHNvIGNoZWNrIG9uIGEgZmVhdHVyZS1zcGVjaWZpYyBQcm9wZXJ0eSAobGlrZSBmb3JcclxuICAvLyB2b2ljaW5nIG9yIGRlc2NyaXB0aW9uKSB0byBkZXRlcm1pbmUgaWYgdGhlIFV0dGVyYW5jZSBjYW4gYmUgYW5ub3VuY2VkLlxyXG4gIGZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lPzogRmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eSB8IG51bGw7XHJcbn07XHJcbnR5cGUgVXR0ZXJhbmNlUXVldWVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaGV0aW9PYmplY3RPcHRpb25zO1xyXG5cclxuXHJcbmNsYXNzIFV0dGVyYW5jZVF1ZXVlPEEgZXh0ZW5kcyBBbm5vdW5jZXIgPSBBbm5vdW5jZXI+IGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gU2VuZHMgYnJvd3NlciByZXF1ZXN0cyB0byBhbm5vdW5jZSBlaXRoZXIgdGhyb3VnaCBhcmlhLWxpdmUgd2l0aCBhIHNjcmVlbiByZWFkZXIgb3JcclxuICAvLyBTcGVlY2hTeW50aGVzaXMgd2l0aCBXZWIgU3BlZWNoIEFQSSAocmVzcGVjdGl2ZWx5KSwgb3IgYW55IG1ldGhvZCB0aGF0IGltcGxlbWVudHMgdGhpcyBpbnRlcmZhY2UuIFVzZSB3aXRoIGNhdXRpb24sXHJcbiAgLy8gYW5kIG9ubHkgd2l0aCB0aGUgdW5kZXJzdGFuZGluZyB0aGF0IHlvdSBrbm93IHdoYXQgQW5ub3VuY2VyIHRoaXMgVXR0ZXJhbmNlUXVldWUgaW5zdGFuY2UgdXNlcy5cclxuICBwdWJsaWMgcmVhZG9ubHkgYW5ub3VuY2VyOiBBO1xyXG5cclxuICAvLyBJbml0aWFsaXphdGlvbiBpcyBsaWtlIHV0dGVyYW5jZVF1ZXVlJ3MgY29uc3RydWN0b3IuIE5vLW9wcyBhbGwgYXJvdW5kIGlmIG5vdFxyXG4gIC8vIGluaXRpYWxpemVkIChjaGVlcnMpLiBTZWUgY29uc3RydWN0b3IoKVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2luaXRpYWxpemVkOiBib29sZWFuO1xyXG5cclxuICAvLyBhcnJheSBvZiBVdHRlcmFuY2VXcmFwcGVycywgc2VlIHByaXZhdGUgY2xhc3MgZm9yIGRldGFpbHMuIEFubm91bmNlZFxyXG4gIC8vIGZpcnN0IGluIGZpcnN0IG91dCAoZmlmbykuIEVhcmxpZXIgdXR0ZXJhbmNlcyB3aWxsIGJlIGxvd2VyIGluIHRoZSBBcnJheS5cclxuICBwcml2YXRlIHJlYWRvbmx5IHF1ZXVlOiBVdHRlcmFuY2VXcmFwcGVyW107XHJcblxyXG4gIC8vIHdoZXRoZXIgVXR0ZXJhbmNlcyBtb3ZpbmcgdGhyb3VnaCB0aGUgcXVldWUgYXJlIHJlYWQgYnkgYSBzY3JlZW4gcmVhZGVyXHJcbiAgcHJpdmF0ZSBfbXV0ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIHdoZXRoZXIgdGhlIFV0dGVyYW5jZXNRdWV1ZSBpcyBhbGVydGluZywgYW5kIGlmIHlvdSBjYW4gYWRkL3JlbW92ZSB1dHRlcmFuY2VzXHJcbiAgcHJpdmF0ZSBfZW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gTWFwcyB0aGUgVXR0ZXJhbmNlIHRvIGEgbGlzdGVuZXIgb24gaXRzIHByaW9yaXR5UHJvcGVydHkgdGhhdCB3aWxsXHJcbiAgLy8gdXBkYXRlIHRoZSBxdWV1ZSB3aGVuIHByaW9yaXR5IGNoYW5nZXMuIFRoZSBtYXAgbGV0cyB1cyByZW1vdmUgdGhlIGxpc3RlbmVyIHdoZW4gdGhlIFV0dGVyYW5jZSBnZXRzXHJcbiAgLy8gcmVtb3ZlZCBmcm9tIHRoZSBxdWV1ZS4gT25seSBVdHRlcmFuY2VzIHRoYXQgYXJlIGluIHRoZSBxdWV1ZSBzaG91bGQgYmUgYWRkZWQgdG8gdGhpcy4gRm9yIGhhbmRsaW5nXHJcbiAgLy8gcHJpb3JpdHktbGlzdGVuaW5nIHdoaWxlIGFuIFV0dGVyYW5jZSBpcyBiZWluZyBhbm5vdW5jZWQsIHNlZSB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyLlxyXG4gIHByaXZhdGUgdXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwOiBNYXA8VXR0ZXJhbmNlLCAoKSA9PiB2b2lkPjtcclxuXHJcbiAgLy8gQSByZWZlcmVuY2UgdG8gYW4gVXR0ZXJhbmNlV3JhcHBlciB0aGF0IGNvbnRhaW5zIHRoZSBVdHRlcmFuY2UgdGhhdCBpcyBwcm92aWRlZCB0b1xyXG4gIC8vIHRoZSBBbm5vdW5jZXIgd2hlbiB3ZSBhY3R1YWxseSBjYWxsIGFubm91bmNlci5hbm5vdW5jZSgpLiBXaGlsZSB0aGUgQW5ub3VuY2VyIGlzIGFubm91bmNpbmcgdGhpcyBVdHRlcmFuY2UsXHJcbiAgLy8gYSBsaXN0ZW5lciBuZWVkcyB0byByZW1haW4gb24gdGhlIFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5IHNvIHRoYXQgd2UgY2FuIHJlcHJpb3JpdGl6ZSBVdHRlcmFuY2VzIG9yXHJcbiAgLy8gaW50ZXJydXB0IHRoaXMgVXR0ZXJhbmNlIGlmIHByaW9yaXR5UHJvcGVydHkgY2hhbmdlcy4gQSBzZXBhcmF0ZSByZWZlcmVuY2UgdG8gdGhpcyBVdHRlcmFuY2VXcmFwcGVyIHN1cHBvcnRzXHJcbiAgLy8gaGF2aW5nIGEgbGlzdGVuZXIgb24gYW4gVXR0ZXJhbmNlIGluIHRoZSBxdWV1ZSB3aXRoIHV0dGVyYW5jZVRvUHJpb3JpdHlMaXN0ZW5lck1hcCB3aGlsZSB0aGUgYW5ub3VuY2VyIGlzXHJcbiAgLy8gYW5ub3VuY2luZyB0aGF0IFV0dGVyYW5jZSBhdCB0aGUgc2FtZSB0aW1lLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNDYuXHJcbiAgcHJpdmF0ZSBhbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlcjogVXR0ZXJhbmNlV3JhcHBlciB8IG51bGw7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVidWc6IGJvb2xlYW47XHJcblxyXG4gIC8vIFNlZSBkb2MgZm9yIG9wdGlvbnMuZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWVcclxuICBwcml2YXRlIHJlYWRvbmx5IGZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lOiBGZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5IHwgbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdGVwUXVldWVMaXN0ZW5lcjogKCAoIGR0OiBudW1iZXIgKSA9PiB2b2lkICkgfCBudWxsOyAvLyBvbmx5IG51bGwgd2hlbiBVdHRlcmFuY2VRdWV1ZSBpcyBub3QgaW5pdGlhbGl6ZWRcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGFubm91bmNlciAtIFRoZSBvdXRwdXQgaW1wbGVtZW50YXRpb24gZm9yIHRoZSB1dHRlcmFuY2VRdWV1ZSwgbXVzdCBpbXBsZW1lbnQgYW4gYW5ub3VuY2UgZnVuY3Rpb25cclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpY2ggcmVxdWVzdHMgc3BlZWNoIGluIHNvbWUgd2F5IChzdWNoIGFzIHRoZSBXZWIgU3BlZWNoIEFQSSBvciBhcmlhLWxpdmUpXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbm5vdW5jZXI6IEEsIHByb3ZpZGVkT3B0aW9ucz86IFV0dGVyYW5jZVF1ZXVlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFV0dGVyYW5jZVF1ZXVlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgZGVidWc6IGZhbHNlLFxyXG4gICAgICBpbml0aWFsaXplOiB0cnVlLFxyXG4gICAgICBmZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZTogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFubm91bmNlciA9IGFubm91bmNlcjtcclxuXHJcbiAgICB0aGlzLl9pbml0aWFsaXplZCA9IG9wdGlvbnMuaW5pdGlhbGl6ZTtcclxuXHJcbiAgICB0aGlzLmZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lID0gb3B0aW9ucy5mZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZTtcclxuXHJcbiAgICB0aGlzLnF1ZXVlID0gW107XHJcblxyXG4gICAgdGhpcy5fbXV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLnV0dGVyYW5jZVRvUHJpb3JpdHlMaXN0ZW5lck1hcCA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBBbm5vdW5jZXIgaXMgZG9uZSB3aXRoIGFuIFV0dGVyYW5jZSwgcmVtb3ZlIHByaW9yaXR5IGxpc3RlbmVycyBhbmQgcmVtb3ZlIGZyb20gdGhlXHJcbiAgICAvLyB1dHRlcmFuY2VUb1ByaW9yaXR5TGlzdGVuZXJNYXAuXHJcbiAgICB0aGlzLmFubm91bmNlci5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKSA9PiB7XHJcblxyXG4gICAgICAvLyBNdWx0aXBsZSBVdHRlcmFuY2VRdWV1ZXMgbWF5IHVzZSB0aGUgc2FtZSBBbm5vdW5jZXIsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgd2UgYXJlIHJlc3BvbmRpbmdcclxuICAgICAgLy8gdG8gYW4gYW5ub3VuY2VtZW50IGNvbXBsZXRpb24gZm9yIHRoZSByaWdodCBVdHRlcmFuY2UuXHJcbiAgICAgIGlmICggdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciAmJiB1dHRlcmFuY2UgPT09IHRoaXMuYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIuYW5ub3VuY2luZ1V0dGVyYW5jZVByaW9yaXR5TGlzdGVuZXIsICdhbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciBzaG91bGQgYmUgc2V0IG9uIHRoaXMuYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXInICk7XHJcbiAgICAgICAgY29uc3QgYW5ub3VuY2luZ1V0dGVyYW5jZVByaW9yaXR5TGlzdGVuZXIgPSB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyLmFubm91bmNpbmdVdHRlcmFuY2VQcmlvcml0eUxpc3RlbmVyITtcclxuXHJcbiAgICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCB0aGlzLmFubm91bmNlciBpcyBhbHNvIHVzZWQgYnkgYSBkaWZmZXJlbnQgVXR0ZXJhbmNlUXVldWUgc28gd2hlblxyXG4gICAgICAgIC8vIGFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlciBlbWl0cywgaXQgbWF5IG5vdCBiZSBmb3IgdGhpcyBVdHRlcmFuY2VXcmFwcGVyLiB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyXHJcbiAgICAgICAgLy8gYW5kIGl0cyBhbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciBjb3VsZCBvbmx5IGhhdmUgYmVlbiBzZXQgYnkgdGhpcyBxdWV1ZSwgc28gdGhpcyBjaGVjayBlbnN1cmVzXHJcbiAgICAgICAgLy8gdGhhdCB3ZSBhcmUgcmVtb3ZpbmcgdGhlIHByaW9yaXR5UHJvcGVydHkgbGlzdGVuZXIgZnJvbSB0aGUgY29ycmVjdCBVdHRlcmFuY2UuXHJcbiAgICAgICAgaWYgKCB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBhbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciApICkge1xyXG4gICAgICAgICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS51bmxpbmsoIGFubm91bmNpbmdVdHRlcmFuY2VQcmlvcml0eUxpc3RlbmVyICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlci5hbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciA9IG51bGw7XHJcbiAgICAgICAgICB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnN0ZXBRdWV1ZUxpc3RlbmVyID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuX2luaXRpYWxpemVkICkge1xyXG5cclxuICAgICAgdGhpcy5zdGVwUXVldWVMaXN0ZW5lciA9IHRoaXMuc3RlcFF1ZXVlLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICAgIC8vIGJlZ2luIHN0ZXBwaW5nIHRoZSBxdWV1ZVxyXG4gICAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHRoaXMuc3RlcFF1ZXVlTGlzdGVuZXIgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYW4gdXR0ZXJhbmNlIG90IHRoZSBlbmQgb2YgdGhlIHF1ZXVlLiAgSWYgdGhlIHV0dGVyYW5jZSBoYXMgYSB0eXBlIG9mIGFsZXJ0IHdoaWNoXHJcbiAgICogaXMgYWxyZWFkeSBpbiB0aGUgcXVldWUsIHRoZSBvbGRlciBhbGVydCB3aWxsIGJlIGltbWVkaWF0ZWx5IHJlbW92ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFRvQmFjayggdXR0ZXJhbmNlOiBUQWxlcnRhYmxlICk6IHZvaWQge1xyXG5cclxuICAgIC8vIE5vLW9wIGlmIHRoZSB1dHRlcmFuY2VRdWV1ZSBpcyBkaXNhYmxlZFxyXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZEFuZEVuYWJsZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICF0aGlzLmFubm91bmNlci5oYXNTcG9rZW4gKSB7XHJcblxyXG4gICAgICAvLyBXZSBoYXZlbid0IHN1Y2Nlc3NmdWxseSBzcG9rZW4gd2l0aCB0aGUgdGVjaG5vbG9neSBvZiB0aGUgQW5ub3VuY2VyIHlldCwga2VlcCB0cnlpbmdcclxuICAgICAgLy8gdG8gc3BlYWsgc3luY2hyb25vdXNseSB0byBiZSBjb21wYXRpYmxlIHdpdGggYnJvd3NlciBsaW1pdGF0aW9ucyB0aGF0IHRoZSBmaXJzdCB1c2FnZVxyXG4gICAgICAvLyBvZiBzcGVlY2ggbmVlZHMgdG8gY29tZSBmcm9tIGEgc3luY2hyb25vdXMgcmVxdWVzdCBmb3JtIHRoZSB1c2VyLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNjVcclxuICAgICAgdGhpcy5hbm5vdW5jZUltbWVkaWF0ZWx5KCB1dHRlcmFuY2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGlkZW50aWNhbCBVdHRlcmFuY2VzIGZyb20gdGhlIHF1ZXVlIGFuZCB3cmFwIHdpdGggYSBjbGFzcyB0aGF0IHdpbGwgbWFuYWdlIHRpbWluZyB2YXJpYWJsZXMuXHJcbiAgICAgIGNvbnN0IHV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnByZXBhcmVVdHRlcmFuY2UoIHV0dGVyYW5jZSApO1xyXG5cclxuICAgICAgLy8gQWRkIHRvIHRoZSBxdWV1ZSBiZWZvcmUgcHJpb3JpdGl6aW5nIHNvIHRoYXQgd2Uga25vdyB3aGljaCBVdHRlcmFuY2VzIHRvIHByaW9yaXRpemUgYWdhaW5zdFxyXG4gICAgICB0aGlzLnF1ZXVlLnB1c2goIHV0dGVyYW5jZVdyYXBwZXIgKTtcclxuXHJcbiAgICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdhZGRUb0JhY2snICk7XHJcblxyXG4gICAgICAvLyBBZGQgbGlzdGVuZXJzIHRoYXQgd2lsbCByZS1wcmlvcml0aXplIHRoZSBxdWV1ZSB3aGVuIHRoZSBwcmlvcml0eVByb3BlcnR5IGNoYW5nZXNcclxuICAgICAgdGhpcy5hZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlKCB1dHRlcmFuY2VXcmFwcGVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYW4gdXR0ZXJhbmNlIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWUgdG8gYmUgcmVhZCBpbW1lZGlhdGVseS5cclxuICAgKiBAZGVwcmVjYXRlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRUb0Zyb250KCB1dHRlcmFuY2U6IFRBbGVydGFibGUgKTogdm9pZCB7XHJcbiAgICBkZXByZWNhdGlvbldhcm5pbmcoICdgYWRkVG9Gcm9udCgpYCBoYXMgYmVlbiBkZXByZWNhdGVkIGJlY2F1c2UgaXQgaXMgY29uZnVzaW5nLCBhbmQgbW9zdCBvZiB0aGUgdGltZSBkb2VzblxcJ3QgZG8gd2hhdCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2lzIGV4cGVjdGVkLCBiZWNhdXNlIFV0dGVyYW5jZXMgYXJlIGFubm91bmNlZCBiYXNlZCBvbiB0aW1lLWluLXF1ZXVlIGZpcnN0LCBhbmQgdGhlbiBwb3NpdGlvbiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luIHRoZSBxdWV1ZS4gSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIGFkZFRvQmFjaywgYW5kIHRoZW4gdGltaW5nIHZhcmlhYmxlcyBvbiBVdHRlcmFuY2VzLCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ29yIGluc3RlYWQgY2FsbCBxdWV1ZS5jbGVhcigpIGJlZm9yZSBhZGRpbmcgYSBtb3JlIGltcG9ydGFudCBhbGVydCB0byB0aGUgcXVldWUuJyApO1xyXG5cclxuXHJcbiAgICAvLyBOby1vcCBmdW5jdGlvbiBpZiB0aGUgdXR0ZXJhbmNlUXVldWUgaXMgZGlzYWJsZWRcclxuICAgIGlmICggIXRoaXMuaW5pdGlhbGl6ZWRBbmRFbmFibGVkICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucHJlcGFyZVV0dGVyYW5jZSggdXR0ZXJhbmNlICk7XHJcbiAgICB0aGlzLnF1ZXVlLnVuc2hpZnQoIHV0dGVyYW5jZVdyYXBwZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaXN0ZW5lciB0byB0aGUgcHJpb3JpdHlQcm9wZXJ0eSBvZiBhbiBVdHRlcmFuY2UsIGFuZCBwdXRzIHRoZSBsaXN0ZW5lciBvbiBhIG1hcCBzbyBpdFxyXG4gICAqIGNhbiBlYXNpbHkgYmUgcmVtb3ZlZCBsYXRlci4gRmluYWxseSwgcmUtcHJpb3JpdGl6ZXMgVXR0ZXJhbmNlcyBpbiB0aGUgcXVldWUgYmFzZWQgb24gdGhlXHJcbiAgICogcHJpb3JpdHkgb2YgdGhlIG5ldyB1dHRlcmFuY2UuXHJcbiAgICpcclxuICAgKiBZb3UgbXVzdCBhZGQgdGhlIHV0dGVyYW5jZVdyYXBwZXIgdG8gdGhlIHF1ZXVlIGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhZGRQcmlvcml0eUxpc3RlbmVyQW5kUHJpb3JpdGl6ZVF1ZXVlKCB1dHRlcmFuY2VXcmFwcGVyOiBVdHRlcmFuY2VXcmFwcGVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMudXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwLmhhcyggdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSxcclxuICAgICAgJ0Fib3V0IHRvIGFkZCB0aGUgcHJpb3JpdHkgbGlzdGVuZXIgdHdpY2UgYW5kIG9ubHkgb25lIHNob3VsZCBleGlzdCBvbiB0aGUgVXR0ZXJhbmNlLiBUaGUgbGlzdGVuZXIgc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkIGJ5IHJlbW92ZU90aGVyc0FuZFVwZGF0ZVV0dGVyYW5jZVdyYXBwZXIuJyApO1xyXG4gICAgY29uc3QgcHJpb3JpdHlMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdGhpcy5wcmlvcml0aXplVXR0ZXJhbmNlcyggdXR0ZXJhbmNlV3JhcHBlciApO1xyXG4gICAgfTtcclxuICAgIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkubGF6eUxpbmsoIHByaW9yaXR5TGlzdGVuZXIgKTtcclxuICAgIHRoaXMudXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwLnNldCggdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UsIHByaW9yaXR5TGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLnByaW9yaXRpemVVdHRlcmFuY2VzKCB1dHRlcmFuY2VXcmFwcGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gVXR0ZXJhbmNlIGZvciB0aGUgcXVldWUgaW4gY2FzZSBvZiBzdHJpbmcgYW5kIGNsZWFycyB0aGUgcXVldWUgb2YgZHVwbGljYXRlIHV0dGVyYW5jZXMuIFRoaXMgd2lsbCBhbHNvXHJcbiAgICogcmVtb3ZlIGR1cGxpY2F0ZXMgaW4gdGhlIHF1ZXVlLCBhbmQgdXBkYXRlIHRvIHRoZSBtb3N0IHJlY2VudCB0aW1lSW5RdWV1ZSB2YXJpYWJsZS5cclxuICAgKi9cclxuICBwcml2YXRlIHByZXBhcmVVdHRlcmFuY2UoIHV0dGVyYW5jZTogVEFsZXJ0YWJsZSApOiBVdHRlcmFuY2VXcmFwcGVyIHtcclxuICAgIGlmICggISggdXR0ZXJhbmNlIGluc3RhbmNlb2YgVXR0ZXJhbmNlICkgKSB7XHJcbiAgICAgIHV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHsgYWxlcnQ6IHV0dGVyYW5jZSB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IG5ldyBVdHRlcmFuY2VXcmFwcGVyKCB1dHRlcmFuY2UgKTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBhcmUgYW55IG90aGVyIGl0ZW1zIGluIHRoZSBxdWV1ZSBvZiB0aGUgc2FtZSB0eXBlLCByZW1vdmUgdGhlbSBpbW1lZGlhdGVseSBiZWNhdXNlIHRoZSBhZGRlZFxyXG4gICAgLy8gdXR0ZXJhbmNlIGlzIG1lYW50IHRvIHJlcGxhY2UgaXRcclxuICAgIHRoaXMucmVtb3ZlT3RoZXJzQW5kVXBkYXRlVXR0ZXJhbmNlV3JhcHBlciggdXR0ZXJhbmNlV3JhcHBlciApO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSB0aW1lIHdhdGNoaW5nIHV0dGVyYW5jZSBzdGFiaWxpdHkgc2luY2UgaXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIHF1ZXVlLlxyXG4gICAgdXR0ZXJhbmNlV3JhcHBlci5zdGFibGVUaW1lID0gMDtcclxuXHJcbiAgICByZXR1cm4gdXR0ZXJhbmNlV3JhcHBlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbiBVdHRlcmFuY2UgZnJvbSB0aGUgcXVldWUuIFRoaXMgZnVuY3Rpb24gaXMgb25seSBhYmxlIHRvIHJlbW92ZSBgVXR0ZXJhbmNlYCBpbnN0YW5jZXMsIGFuZCBjYW5ub3QgcmVtb3ZlXHJcbiAgICogb3RoZXIgVEFsZXJ0YWJsZSB0eXBlcy5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVyVG9VdHRlcmFuY2VNYXBwZXIgPSAoIHV0dGVyYW5jZVdyYXBwZXI6IFV0dGVyYW5jZVdyYXBwZXIgKSA9PiB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZmluZCggdGhpcy5xdWV1ZSwgdXR0ZXJhbmNlV3JhcHBlclRvVXR0ZXJhbmNlTWFwcGVyICksICd1dHRlcmFuY2UgdG8gYmUgcmVtb3ZlZCBub3QgZm91bmQgaW4gcXVldWUnICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIGFsbCBvY2N1cnJlbmNlcywgaWYgYXBwbGljYWJsZVxyXG4gICAgY29uc3QgcmVtb3ZlZFV0dGVyYW5jZVdyYXBwZXJzID0gXy5yZW1vdmUoIHRoaXMucXVldWUsIHV0dGVyYW5jZVdyYXBwZXJUb1V0dGVyYW5jZU1hcHBlciApO1xyXG4gICAgdGhpcy5yZW1vdmVQcmlvcml0eUxpc3RlbmVycyggcmVtb3ZlZFV0dGVyYW5jZVdyYXBwZXJzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgZWFybGllciBVdHRlcmFuY2VzIGZyb20gdGhlIHF1ZXVlIGlmIHRoZSBVdHRlcmFuY2UgaXMgaW1wb3J0YW50IGVub3VnaC4gVGhpcyB3aWxsIGFsc28gaW50ZXJydXB0XHJcbiAgICogdGhlIHV0dGVyYW5jZSB0aGF0IGlzIGluIHRoZSBwcm9jZXNzIG9mIGJlaW5nIGFubm91bmNlZCBieSB0aGUgQW5ub3VuY2VyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcHJpb3JpdGl6ZVV0dGVyYW5jZXMoIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemU6IFV0dGVyYW5jZVdyYXBwZXIgKTogdm9pZCB7XHJcblxyXG4gICAgbGV0IHV0dGVyYW5jZVdyYXBwZXJJbmRleCA9IHRoaXMucXVldWUuaW5kZXhPZiggdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZSApO1xyXG5cclxuICAgIC8vIElmIHRoaXMgZnVuY2l0b24gaXMgY2FsbGVkIGZyb20gYWRkVG9CYWNrKCksIHRoZW4gdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZSB3aWxsIGJlIHRoZSBsYXN0IHV0dGVyYW5jZSBpbiB0aGUgcXVldWUuXHJcbiAgICBjb25zdCB1dHRlcmFuY2VXcmFwcGVySW5RdWV1ZSA9IHV0dGVyYW5jZVdyYXBwZXJJbmRleCA+PSAwO1xyXG5cclxuICAgIC8vIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUgd2lsbCBvbmx5IGFmZmVjdCBvdGhlciBVdHRlcmFuY2VzIHRoYXQgYXJlIFwiYWhlYWRcIiBvZiBpdCBpbiB0aGUgcXVldWVcclxuICAgIGxldCB0cmF2ZXJzZVRvRnJvbnRTdGFydEluZGV4O1xyXG4gICAgaWYgKCB1dHRlcmFuY2VXcmFwcGVySW5RdWV1ZSApIHtcclxuXHJcbiAgICAgIC8vIFRoZSB1dHRlcmFuY2UgaXMgaW4gdGhlIHF1ZXVlIGFscmVhZHksIHdlIG5lZWQgdG8gd2FsayBiYWNrIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWUgdG8gcmVtb3ZlXHJcbiAgICAgIC8vIFV0dGVyYW5jZXMgdGhhdCBoYXZlIGEgbG93ZXIgcHJpb3JpdHkuXHJcbiAgICAgIHRyYXZlcnNlVG9Gcm9udFN0YXJ0SW5kZXggPSB1dHRlcmFuY2VXcmFwcGVySW5kZXggLSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBJZiBub3QgaW4gdGhlIHF1ZXVlLCBwcmlvcml0eSB3aWxsIGJlIG1hbmFnZWQgYnkgdGhlIGFubm91bmNlci5cclxuICAgICAgdHJhdmVyc2VUb0Zyb250U3RhcnRJbmRleCA9IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgcXVldWUgYmVmb3JlIGxldHRpbmcgdGhlIEFubm91bmNlciBrbm93IHRoYXQgcHJpb3JpdHkgaXMgY2hhbmdpbmcsIHNpbmNlIHRoYXQgY291bGQgc3RvcCBjdXJyZW50XHJcbiAgICAvLyBzcGVlY2ggYW5kIHBvc3NpYmx5IHN0YXJ0IHRoZSBuZXh0IHV0dGVyYW5jZSB0byBiZSBhbm5vdW5jZWQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IHRyYXZlcnNlVG9Gcm9udFN0YXJ0SW5kZXg7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBjb25zdCBvdGhlclV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnF1ZXVlWyBpIF07XHJcbiAgICAgIGlmICggdGhpcy5zaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZS51dHRlcmFuY2UsIG90aGVyVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSApIHtcclxuICAgICAgICB0aGlzLnJlbW92ZVV0dGVyYW5jZSggb3RoZXJVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm93IGxvb2sgYmFja3dhcmRzIHRvIGRldGVybWluZSBpZiB0aGUgdXR0ZXJhbmNlV3JhcHBlciBzaG91bGQgYmUgcmVtb3ZlZCBiZWNhdXNlIGFuIHV0dGVyYW5jZSBiZWhpbmQgaXRcclxuICAgIC8vIGhhcyBhIGhpZ2hlciBwcmlvcml0eS4gVGhlIG9ubHkgdXR0ZXJhbmNlIHRoYXQgd2UgaGF2ZSB0byBjaGVjayBpcyB0aGUgbmV4dCBvbmUgaW4gdGhlIHF1ZXVlIGJlY2F1c2VcclxuICAgIC8vIGFueSB1dHRlcmFuY2UgZnVydGhlciBiYWNrIE1VU1QgYmUgb2YgbG93ZXIgcHJpb3JpdHkuIFRoZSBuZXh0IFV0dGVyYW5jZSBhZnRlclxyXG4gICAgLy8gdXR0ZXJhbmNlV3JhcHBlclRvUHJpb3JpdGl6ZS51dHRlcmFuY2Ugd291bGQgaGF2ZSBiZWVuIHJlbW92ZWQgd2hlbiB0aGUgaGlnaGVyIHByaW9yaXR5IHV0dGVyYW5jZXMgZnVydGhlclxyXG4gICAgLy8gYmFjayB3ZXJlIGFkZGVkLlxyXG4gICAgaWYgKCB1dHRlcmFuY2VXcmFwcGVySW5RdWV1ZSApIHtcclxuICAgICAgdXR0ZXJhbmNlV3JhcHBlckluZGV4ID0gdGhpcy5xdWV1ZS5pbmRleE9mKCB1dHRlcmFuY2VXcmFwcGVyVG9Qcmlvcml0aXplICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHV0dGVyYW5jZVdyYXBwZXJJbmRleCA+IC0xLCAndXR0ZXJhbmNlV3JhcHBlciBpcyBub3QgaW4gcXVldWU/JyApO1xyXG4gICAgICBjb25zdCBvdGhlclV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnF1ZXVlWyB1dHRlcmFuY2VXcmFwcGVySW5kZXggKyAxIF07XHJcbiAgICAgIGlmICggb3RoZXJVdHRlcmFuY2VXcmFwcGVyICYmIHRoaXMuc2hvdWxkVXR0ZXJhbmNlQ2FuY2VsT3RoZXIoIG90aGVyVXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UsIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUudXR0ZXJhbmNlICkgKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVVdHRlcmFuY2UoIHV0dGVyYW5jZVdyYXBwZXJUb1ByaW9yaXRpemUudXR0ZXJhbmNlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBMZXQgdGhlIEFubm91bmNlciBrbm93IHRoYXQgcHJpb3JpdHkgaGFzIGNoYW5nZWQgc28gdGhhdCBpdCBjYW4gZG8gd29yayBzdWNoIGFzIGNhbmNlbCB0aGUgY3VycmVudGx5IHNwZWFraW5nXHJcbiAgICAvLyB1dHRlcmFuY2UgaWYgaXQgaGFzIGJlY29tZSBsb3cgcHJpb3JpdHlcclxuICAgIGlmICggdGhpcy5xdWV1ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICB0aGlzLmFubm91bmNlci5vblV0dGVyYW5jZVByaW9yaXR5Q2hhbmdlKCB0aGlzLnF1ZXVlWyAwIF0udXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBvbmUgdXR0ZXJhbmNlLCBzaG91bGQgaXQgY2FuY2VsIHRoZSBvdGhlcj8gVGhlIHByaW9yaXR5IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmXHJcbiAgICogb25lIFV0dGVyYW5jZSBzaG91bGQgY2FuY2VsIGFub3RoZXIsIGJ1dCB0aGUgQW5ub3VuY2VyIG1heSBvdmVycmlkZSB3aXRoIGl0cyBvd24gbG9naWMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIHV0dGVyYW5jZVRvQ2FuY2VsOiBVdHRlcmFuY2UgKTogYm9vbGVhbiB7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuYW5ub3VuY2VyLnNob3VsZFV0dGVyYW5jZUNhbmNlbE90aGVyKCB1dHRlcmFuY2UsIHV0dGVyYW5jZVRvQ2FuY2VsICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZU90aGVyc0FuZFVwZGF0ZVV0dGVyYW5jZVdyYXBwZXIoIHV0dGVyYW5jZVdyYXBwZXI6IFV0dGVyYW5jZVdyYXBwZXIgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgdGltZXMgPSBbXTtcclxuXHJcbiAgICAvLyB3ZSBuZWVkIGFsbCB0aGUgdGltZXMsIGluIGNhc2UgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgd3JhcHBlciBpbnN0YW5jZSBhbHJlYWR5IGluIHRoZSBRdWV1ZS5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyID0gdGhpcy5xdWV1ZVsgaSBdO1xyXG4gICAgICBpZiAoIGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKSB7XHJcbiAgICAgICAgdGltZXMucHVzaCggY3VycmVudFV0dGVyYW5jZVdyYXBwZXIudGltZUluUXVldWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgc2lkZSBlZmZlY3QgaXMgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHRpbWVJblF1ZXVlIGlzIHRyYW5zZmVycmVkIGJldHdlZW4gYWRkaW5nIHRoZSBzYW1lIFV0dGVyYW5jZS5cclxuICAgIGlmICggdGltZXMubGVuZ3RoID49IDEgKSB7XHJcbiAgICAgIHV0dGVyYW5jZVdyYXBwZXIudGltZUluUXVldWUgPSBNYXRoLm1heCggLi4udGltZXMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgYWxsIG9jY3VycmVuY2VzLCBpZiBhcHBsaWNhYmxlLlxyXG4gICAgY29uc3QgcmVtb3ZlZFdyYXBwZXJzID0gXy5yZW1vdmUoIHRoaXMucXVldWUsIGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyID0+IGN1cnJlbnRVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2UgKTtcclxuICAgIHRoaXMucmVtb3ZlUHJpb3JpdHlMaXN0ZW5lcnMoIHJlbW92ZWRXcmFwcGVycyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBVdHRlcmFuY2VRdWV1ZSBpcyBydW5uaW5nIGFuZCBtb3ZpbmcgdGhyb3VnaCBVdHRlcmFuY2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgaW5pdGlhbGl6ZWRBbmRFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQgJiYgdGhpcy5faW5pdGlhbGl6ZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG5leHQgdXR0ZXJhbmNlIHRvIGFsZXJ0IGlmIG9uZSBpcyByZWFkeSBhbmQgXCJzdGFibGVcIi4gSWYgdGhlcmUgYXJlIG5vIHV0dGVyYW5jZXMgb3Igbm8gdXR0ZXJhbmNlIGlzXHJcbiAgICogcmVhZHkgdG8gYmUgYW5ub3VuY2VkLCB3aWxsIHJldHVybiBudWxsLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0TmV4dFV0dGVyYW5jZSgpOiBVdHRlcmFuY2VXcmFwcGVyIHwgbnVsbCB7XHJcblxyXG4gICAgLy8gZmluZCB0aGUgbmV4dCBpdGVtIHRvIGFubm91bmNlIC0gZ2VuZXJhbGx5IHRoZSBuZXh0IGl0ZW0gaW4gdGhlIHF1ZXVlLCB1bmxlc3MgaXQgaGFzIGEgZGVsYXkgc3BlY2lmaWVkIHRoYXRcclxuICAgIC8vIGlzIGdyZWF0ZXIgdGhhbiB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGUgdXR0ZXJhbmNlIGhhcyBiZWVuIHNpdHRpbmcgaW4gdGhlIHF1ZXVlXHJcbiAgICBsZXQgbmV4dFV0dGVyYW5jZVdyYXBwZXIgPSBudWxsO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdXR0ZXJhbmNlV3JhcHBlciA9IHRoaXMucXVldWVbIGkgXTtcclxuXHJcbiAgICAgIC8vIGlmIHdlIGhhdmUgd2FpdGVkIGxvbmcgZW5vdWdoIGZvciB0aGUgdXR0ZXJhbmNlIHRvIGJlY29tZSBcInN0YWJsZVwiIG9yIHRoZSB1dHRlcmFuY2UgaGFzIGJlZW4gaW4gdGhlIHF1ZXVlXHJcbiAgICAgIC8vIGZvciBsb25nZXIgdGhhbiB0aGUgbWF4aW11bSBkZWxheSBvdmVycmlkZSwgaXQgd2lsbCBiZSBhbm5vdW5jZWRcclxuICAgICAgaWYgKCB1dHRlcmFuY2VXcmFwcGVyLnN0YWJsZVRpbWUgPiB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZS5hbGVydFN0YWJsZURlbGF5IHx8XHJcbiAgICAgICAgICAgdXR0ZXJhbmNlV3JhcHBlci50aW1lSW5RdWV1ZSA+IHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLmFsZXJ0TWF4aW11bURlbGF5ICkge1xyXG4gICAgICAgIG5leHRVdHRlcmFuY2VXcmFwcGVyID0gdXR0ZXJhbmNlV3JhcHBlcjtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV4dFV0dGVyYW5jZVdyYXBwZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHV0dGVyYW5jZXMgaXMgaW4gdGhpcyBxdWV1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzVXR0ZXJhbmNlKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiBib29sZWFuIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnF1ZXVlWyBpIF07XHJcbiAgICAgIGlmICggdXR0ZXJhbmNlID09PSB1dHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgdGhlIHV0dGVyYW5jZVF1ZXVlIG9mIGFsbCBVdHRlcmFuY2VzLCBhbnkgVXR0ZXJhbmNlcyByZW1haW5pbmcgaW4gdGhlIHF1ZXVlIHdpbGxcclxuICAgKiBub3QgYmUgYW5ub3VuY2VkIGJ5IHRoZSBzY3JlZW4gcmVhZGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdVdHRlYXJuY2VRdWV1ZS5jbGVhcigpJyApO1xyXG5cclxuICAgIC8vIFJlbW92ZXMgYWxsIHByaW9yaXR5IGxpc3RlbmVycyBmcm9tIHRoZSBxdWV1ZS5cclxuICAgIHRoaXMucmVtb3ZlUHJpb3JpdHlMaXN0ZW5lcnMoIHRoaXMucXVldWUgKTtcclxuXHJcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYW5jZWwgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZSBpZiBpdCBpcyBiZWluZyBzcG9rZW4gYnkgdGhlIEFubm91bmNlci4gUmVtb3ZlcyB0aGUgVXR0ZXJhbmNlIGZyb20gdGhlIHF1ZXVlIGlmXHJcbiAgICogaXQgaXMgbm90IGJlaW5nIHNwb2tlbiBieSB0aGUgYW5ub3VuY2VyLiBEb2VzIG5vdGhpbmcgdG8gb3RoZXIgVXR0ZXJhbmNlcy4gVGhlIEFubm91bmNlciBpbXBsZW1lbnRzIHRoZSBiZWhhdmlvclxyXG4gICAqIHRvIHN0b3Agc3BlZWNoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYW5jZWxVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQge1xyXG4gICAgdGhpcy5hbm5vdW5jZXIuY2FuY2VsVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaGFzVXR0ZXJhbmNlKCB1dHRlcmFuY2UgKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVVdHRlcmFuY2UoIHV0dGVyYW5jZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIGFsbCBVdHRlcmFuY2VzIGZyb20gdGhlIHF1ZXVlIGFuZCBjYW5jZWxzIGFubm91bmNlbWVudCBvZiBhbnkgVXR0ZXJhbmNlcyB0aGF0IGFyZSBiZWluZ1xyXG4gICAqIGFubm91bmNlZCBieSB0aGUgQW5ub3VuY2VyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYW5jZWwoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRlYnVnICYmIGNvbnNvbGUubG9nKCAnVXR0ZXJhbmNlUXVldWUuY2FuY2VsKCknICk7XHJcbiAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICB0aGlzLmFubm91bmNlci5jYW5jZWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIGxpc3RlbmVycyBvbiBVdHRlcmFuY2UgUHJpb3JpdHkgZm9yIGFsbCBwcm92aWRlZCBVdHRlcmFuY2VXcmFwcGVycy5cclxuICAgKi9cclxuICBwcml2YXRlIHJlbW92ZVByaW9yaXR5TGlzdGVuZXJzKCB1dHRlcmFuY2VXcmFwcGVyczogVXR0ZXJhbmNlV3JhcHBlcltdICk6IHZvaWQge1xyXG4gICAgdXR0ZXJhbmNlV3JhcHBlcnMuZm9yRWFjaCggdXR0ZXJhbmNlV3JhcHBlciA9PiB0aGlzLnJlbW92ZVByaW9yaXR5TGlzdGVuZXIoIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICkgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcmVtb3ZlUHJpb3JpdHlMaXN0ZW5lciggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcbiAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMudXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwLmdldCggdXR0ZXJhbmNlICk7XHJcblxyXG4gICAgLy8gVGhlIHNhbWUgVXR0ZXJhbmNlIG1heSBleGlzdCBtdWx0aXBsZSB0aW1lcyBpbiB0aGUgcXVldWUgaWYgd2UgYXJlIHJlbW92aW5nIGR1cGxpY2F0ZXMgZnJvbSB0aGUgYXJyYXksXHJcbiAgICAvLyBzbyB0aGUgbGlzdGVuZXIgbWF5IGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQuXHJcbiAgICBpZiAoIGxpc3RlbmVyICkge1xyXG4gICAgICB1dHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS51bmxpbmsoIGxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMudXR0ZXJhbmNlVG9Qcmlvcml0eUxpc3RlbmVyTWFwLmRlbGV0ZSggdXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgd2hldGhlciBvciBub3QgdGhlIHV0dGVyYW5jZSBxdWV1ZSBpcyBtdXRlZC4gIFdoZW4gbXV0ZWQsIFV0dGVyYW5jZXMgd2lsbCBzdGlsbFxyXG4gICAqIG1vdmUgdGhyb3VnaCB0aGUgcXVldWUsIGJ1dCBub3RoaW5nIHdpbGwgYmUgc2VudCB0byBhc3Npc3RpdmUgdGVjaG5vbG9neS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0TXV0ZWQoIGlzTXV0ZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLl9tdXRlZCA9IGlzTXV0ZWQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IG11dGVkKCBpc011dGVkOiBib29sZWFuICkgeyB0aGlzLnNldE11dGVkKCBpc011dGVkICk7IH1cclxuXHJcbiAgcHVibGljIGdldCBtdXRlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0TXV0ZWQoKTsgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgd2hldGhlciBvciBub3QgdGhlIHV0dGVyYW5jZVF1ZXVlIGlzIG11dGVkLiAgV2hlbiBtdXRlZCwgVXR0ZXJhbmNlcyB3aWxsIHN0aWxsXHJcbiAgICogbW92ZSB0aHJvdWdoIHRoZSBxdWV1ZSwgYnV0IG5vdGhpbmcgd2lsbCBiZSByZWFkIGJ5IGFzaXN0aXZlIHRlY2hub2xvZ3kuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE11dGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX211dGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHdoZXRoZXIgb3Igbm90IHRoZSB1dHRlcmFuY2UgcXVldWUgaXMgZW5hYmxlZC4gIFdoZW4gZW5hYmxlZCwgVXR0ZXJhbmNlcyBjYW5ub3QgYmUgYWRkZWQgdG9cclxuICAgKiB0aGUgcXVldWUsIGFuZCB0aGUgUXVldWUgY2Fubm90IGJlIGNsZWFyZWQuIEFsc28gbm90aGluZyB3aWxsIGJlIHNlbnQgdG8gYXNzaXN0aXZlIHRlY2hub2xvZ3kuXHJcbiAgICovXHJcbiAgcHVibGljIHNldEVuYWJsZWQoIGlzRW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMuX2VuYWJsZWQgPSBpc0VuYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0IGVuYWJsZWQoIGlzRW5hYmxlZDogYm9vbGVhbiApIHsgdGhpcy5zZXRFbmFibGVkKCBpc0VuYWJsZWQgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRW5hYmxlZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgdXR0ZXJhbmNlIHF1ZXVlIGlzIGVuYWJsZWQuICBXaGVuIGVuYWJsZWQsIFV0dGVyYW5jZXMgY2Fubm90IGJlIGFkZGVkIHRvXHJcbiAgICogdGhlIHF1ZXVlLCBhbmQgdGhlIFF1ZXVlIGNhbm5vdCBiZSBjbGVhcmVkLiBBbHNvIG5vdGhpbmcgd2lsbCBiZSBzZW50IHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgdGhlIHF1ZXVlLCBjYWxsZWQgYnkgdGhlIHRpbWVyLlxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc2luY2UgbGFzdCBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGVwUXVldWUoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gTm8tb3AgZnVuY3Rpb24gaWYgdGhlIHV0dGVyYW5jZVF1ZXVlIGlzIGRpc2FibGVkXHJcbiAgICBpZiAoICF0aGlzLl9lbmFibGVkICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZHQgKj0gMTAwMDsgLy8gY29udmVydCB0byBtc1xyXG5cclxuICAgIGlmICggdGhpcy5xdWV1ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnF1ZXVlWyBpIF07XHJcbiAgICAgICAgdXR0ZXJhbmNlV3JhcHBlci50aW1lSW5RdWV1ZSArPSBkdDtcclxuICAgICAgICB1dHRlcmFuY2VXcmFwcGVyLnN0YWJsZVRpbWUgKz0gZHQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG5leHRVdHRlcmFuY2VXcmFwcGVyID0gdGhpcy5nZXROZXh0VXR0ZXJhbmNlKCk7XHJcbiAgICAgIGlmICggbmV4dFV0dGVyYW5jZVdyYXBwZXIgKSB7XHJcbiAgICAgICAgdGhpcy5hdHRlbXB0VG9Bbm5vdW5jZSggbmV4dFV0dGVyYW5jZVdyYXBwZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW1tZWRpYXRlbHkgYW5ub3VuY2UgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZS4gSWYgdGhlIEFubm91bmNlciBpcyByZWFkeSB0byBhbm5vdW5jZSwgdGhlIFV0dGVyYW5jZSB3aWxsIGJlIGFubm91bmNlZFxyXG4gICAqIHN5bmNocm9ub3VzbHkgd2l0aCB0aGlzIGNhbGwuIE90aGVyd2lzZSwgdGhlIFV0dGVyYW5jZSB3aWxsIGJlIGFkZGVkIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWUgdG8gYmUgYW5ub3VuY2VkXHJcbiAgICogYXMgc29vbiBhcyB0aGUgQW5ub3VuY2VyIGlzIHJlYWR5LlxyXG4gICAqXHJcbiAgICogVGhpcyBmdW5jdGlvbiBzaG91bGQgZ2VuZXJhbGx5IG5vdCBiZSB1c2VkLiBVc2UgYWRkVG9CYWNrKCkgaW4gY29ycmVsYXRpb24gd2l0aCBwcmlvcml0eVByb3BlcnR5IGFuZCB0aW1pbmcgdmFyaWFibGVzXHJcbiAgICogdG8gY29udHJvbCB0aGUgZmxvdyBvZiBVdHRlcmFuY2VzLiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VmdWwgd2hlbiB5b3UgbmVlZCBhbiBVdHRlcmFuY2UgdG8gYmUgYW5ub3VuY2VkXHJcbiAgICogc3luY2hyb25vdXNseSB3aXRoIHVzZXIgaW5wdXQgKGZvciBleGFtcGxlLCBkdWUgdG8gYnJvd3NlciBjb25zdHJhaW50cyBvbiBpbml0aWFsaXppbmcgU3BlZWNoU3ludGhlc2lzKS5cclxuICAgKlxyXG4gICAqIEFueSBkdXBsaWNhdGUgaW5zdGFuY2Ugb2YgdGhlIHByb3ZpZGVkIFV0dGVyYW5jZSB0aGF0IGlzIGFscmVhZHkgaW4gdGhlIHF1ZXVlIHdpbGwgYmUgcmVtb3ZlZCwgbWF0Y2hpbmcgdGhlXHJcbiAgICogYmVoYXZpb3Igb2YgYWRkVG9CYWNrKCkuXHJcbiAgICpcclxuICAgKiBhbm5vdW5jZUltbWVkaWF0ZWx5KCkgcmVzcGVjdHMgVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkuIEEgcHJvdmlkZWQgVXR0ZXJhbmNlIHdpdGggYSBwcmlvcml0eSBlcXVhbCB0byBvciBsb3dlclxyXG4gICAqIHRoYW4gd2hhdCBpcyBiZWluZyBhbm5vdW5jZWQgd2lsbCBub3QgaW50ZXJydXB0IGFuZCB3aWxsIG5ldmVyIGJlIGFubm91bmNlZC4gSWYgYW4gVXR0ZXJhbmNlIGF0IHRoZSBmcm9udCBvZiB0aGVcclxuICAgKiBxdWV1ZSBoYXMgYSBoaWdoZXIgcHJpb3JpdHkgdGhhbiB0aGUgcHJvdmlkZWQgVXR0ZXJhbmNlLCB0aGUgcHJvdmlkZWQgVXR0ZXJhbmNlIHdpbGwgbmV2ZXIgYmUgYW5ub3VuY2VkLiBJZiB0aGVcclxuICAgKiBwcm92aWRlZCBVdHRlcmFuY2UgaGFzIGEgaGlnaGVyIHByaW9yaXR5IHRoYW4gd2hhdCBpcyBhdCB0aGUgZnJvbnQgb2YgdGhlIHF1ZXVlIG9yIHdoYXQgaXMgYmVpbmcgYW5ub3VuY2VkLCBpdCB3aWxsXHJcbiAgICogYmUgYW5ub3VuY2VkIGltbWVkaWF0ZWx5IGFuZCBpbnRlcnJ1cHQgdGhlIGFubm91bmNlci4gT3RoZXJ3aXNlLCBpdCB3aWxsIG5ldmVyIGJlIGFubm91bmNlZC5cclxuICAgKi9cclxuICBwdWJsaWMgYW5ub3VuY2VJbW1lZGlhdGVseSggdXR0ZXJhbmNlOiBUQWxlcnRhYmxlICk6IHZvaWQge1xyXG5cclxuICAgIC8vIE5vLW9wIGlmIHRoZSB1dHRlcmFuY2VRdWV1ZSBpcyBkaXNhYmxlZFxyXG4gICAgaWYgKCAhdGhpcy5pbml0aWFsaXplZEFuZEVuYWJsZWQgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRlYnVnICYmIGNvbnNvbGUubG9nKCAnYW5ub3VuY2VJbW1lZGlhdGVseScgKTtcclxuXHJcbiAgICAvLyBEb24ndCBjYWxsIHByZXBhcmVVdHRlcmFuY2UgYmVjYXVzZSB3ZSB3YW50IHRvIGJ5cGFzcyBxdWV1ZSBvcGVyYXRpb25zLlxyXG4gICAgaWYgKCAhKCB1dHRlcmFuY2UgaW5zdGFuY2VvZiBVdHRlcmFuY2UgKSApIHtcclxuICAgICAgdXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSggeyBhbGVydDogdXR0ZXJhbmNlIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgdXR0ZXJhbmNlIGNhbiBvbmx5IGJlIGFubm91bmNlZCB3aXRoIGFubm91bmNlSW1tZWRpYXRlbHkgaWYgdGhlcmUgaXMgbm8gYW5ub3VuY2luZyBVdHRlcmFuY2UsIG9yIGlmIHRoZVxyXG4gICAgLy8gQW5ub3VuY2VyIGFsbG93cyBjYW5jZWwgb2YgdGhlIGFubm91bmNpbmcgVXR0ZXJhbmNlIChjaGVja2luZyByZWxhdGl2ZSBwcmlvcml0eVByb3BlcnR5IG9yIG90aGVyIHRoaW5ncylcclxuICAgIGlmICggdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciA9PT0gbnVsbCB8fCB0aGlzLmFubm91bmNlci5zaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciggdXR0ZXJhbmNlLCB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyLnV0dGVyYW5jZSApICkge1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGlkZW50aWNhbCBVdHRlcmFuY2VzIGZyb20gdGhlIHF1ZXVlIGFuZCB3cmFwIHdpdGggYSBjbGFzcyB0aGF0IHdpbGwgbWFuYWdlIHRpbWluZyB2YXJpYWJsZXMuXHJcbiAgICAgIGNvbnN0IHV0dGVyYW5jZVdyYXBwZXIgPSB0aGlzLnByZXBhcmVVdHRlcmFuY2UoIHV0dGVyYW5jZSApO1xyXG5cclxuICAgICAgLy8gc2V0IHRpbWluZyB2YXJpYWJsZXMgc3VjaCB0aGF0IHRoZSB1dHRlcmFuY2UgaXMgcmVhZHkgdG8gYW5ub3VuY2UgaW1tZWRpYXRlbHlcclxuICAgICAgdXR0ZXJhbmNlV3JhcHBlci5zdGFibGVUaW1lID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICB1dHRlcmFuY2VXcmFwcGVyLnRpbWVJblF1ZXVlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG5cclxuICAgICAgLy8gYWRkUHJpb3JpdHlMaXN0ZW5lckFuZFByaW9yaXRpemVRdWV1ZSBhc3N1bWVzIHRoZSBVdHRlcmFuY2VXcmFwcGVyIGlzIGluIHRoZSBxdWV1ZSwgYWRkIGZpcnN0XHJcbiAgICAgIHRoaXMucXVldWUudW5zaGlmdCggdXR0ZXJhbmNlV3JhcHBlciApO1xyXG4gICAgICB0aGlzLmFkZFByaW9yaXR5TGlzdGVuZXJBbmRQcmlvcml0aXplUXVldWUoIHV0dGVyYW5jZVdyYXBwZXIgKTtcclxuXHJcbiAgICAgIC8vIFByaW9yaXRpemF0aW9uIG1heSBoYXZlIGRldGVybWluZWQgdGhhdCB0aGlzIHV0dGVyYW5jZSBzaG91bGQgbm90IGJlIGFubm91bmNlZCwgYW5kIHNvIHdhc1xyXG4gICAgICAvLyBxdWlja2x5IHJlbW92ZWQgZnJvbSB0aGUgcXVldWUuXHJcbiAgICAgIGlmICggdGhpcy5xdWV1ZS5pbmNsdWRlcyggdXR0ZXJhbmNlV3JhcHBlciApICkge1xyXG5cclxuICAgICAgICAvLyBBdHRlbXB0IHRvIGFubm91bmNlIHRoZSBVdHRlcmFuY2UgaW1tZWRpYXRlbHkgKHN5bmNocm9ub3VzbHkpIC0gaWYgdGhlIGFubm91bmNlciBpcyBub3QgcmVhZHlcclxuICAgICAgICAvLyB5ZXQsIGl0IHdpbGwgc3RpbGwgYmUgYXQgdGhlIGZyb250IG9mIHRoZSBxdWV1ZSBhbmQgd2lsbCBiZSBuZXh0IHRvIGJlIGFubm91bmNlZCBhcyBzb29uIGFzIHBvc3NpYmxlXHJcbiAgICAgICAgdGhpcy5hdHRlbXB0VG9Bbm5vdW5jZSggdXR0ZXJhbmNlV3JhcHBlciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGF0dGVtcHRUb0Fubm91bmNlKCB1dHRlcmFuY2VXcmFwcGVyOiBVdHRlcmFuY2VXcmFwcGVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgdXR0ZXJhbmNlID0gdXR0ZXJhbmNlV3JhcHBlci51dHRlcmFuY2U7XHJcblxyXG4gICAgLy8gb25seSBxdWVyeSBhbmQgcmVtb3ZlIHRoZSBuZXh0IHV0dGVyYW5jZSBpZiB0aGUgYW5ub3VuY2VyIGluZGljYXRlcyBpdCBpcyByZWFkeSBmb3Igc3BlZWNoXHJcbiAgICBpZiAoIHRoaXMuYW5ub3VuY2VyLnJlYWR5VG9Bbm5vdW5jZSApIHtcclxuXHJcbiAgICAgIGNvbnN0IGFubm91bmNlVGV4dCA9IHV0dGVyYW5jZS5nZXRBbGVydFRleHQoIHRoaXMuYW5ub3VuY2VyLnJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXMgKTtcclxuICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ3JlYWR5IHRvIGFubm91bmNlIGluIGF0dGVtcHRUb0Fubm91bmNlKCk6ICcsIGFubm91bmNlVGV4dCApO1xyXG5cclxuICAgICAgLy8gZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUgaXMgb3B0IGluLCBzbyBzdXBwb3J0IGlmIGl0IGlzIG5vdCBzdXBwbGllZFxyXG4gICAgICBjb25zdCBmZWF0dXJlU3BlY2lmaWNBbm5vdW5jZVBlcm1pdHRlZCA9ICF0aGlzLmZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXR0ZXJhbmNlWyB0aGlzLmZlYXR1cmVTcGVjaWZpY0Fubm91bmNpbmdDb250cm9sUHJvcGVydHlOYW1lIF0udmFsdWU7XHJcblxyXG4gICAgICAvLyBVdHRlcmFuY2UgYWxsb3dzIGFubm91bmNpbmcgaWYgY2FuQW5ub3VuY2VQcm9wZXJ0eSBpcyB0cnVlLCBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLCBhbmQgYW55IGZlYXR1cmUtc3BlY2lmaWNcclxuICAgICAgLy8gY29udHJvbCBQcm9wZXJ0eSB0aGF0IHRoaXMgVXR0ZXJhbmNlUXVldWUgaGFzIG9wdGVkIGludG8gaXMgYWxzbyB0cnVlLlxyXG4gICAgICBjb25zdCB1dHRlcmFuY2VQZXJtaXRzQW5ub3VuY2UgPSB1dHRlcmFuY2UuY2FuQW5ub3VuY2VQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dHRlcmFuY2UucHJlZGljYXRlKCkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZVNwZWNpZmljQW5ub3VuY2VQZXJtaXR0ZWQ7XHJcblxyXG5cclxuICAgICAgLy8gb25seSBhbm5vdW5jZSB0aGUgdXR0ZXJhbmNlIGlmIG5vdCBtdXRlZCwgdGhlIHV0dGVyYW5jZSBwZXJtaXRzIGFubm91bmNpbmcsIGFuZCB0aGUgdXR0ZXJhbmNlIHRleHQgaXMgbm90IGVtcHR5XHJcbiAgICAgIGlmICggIXRoaXMuX211dGVkICYmIHV0dGVyYW5jZVBlcm1pdHNBbm5vdW5jZSAmJiBhbm5vdW5jZVRleHQgIT09ICcnICkge1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFubm91bmNpbmdVdHRlcmFuY2VXcmFwcGVyID09PSBudWxsLCAnYW5ub3VuY2luZ1V0dGVyYW5jZVdyYXBwZXIgYW5kIGl0cyBwcmlvcml0eVByb3BlcnR5IGxpc3RlbmVyIHNob3VsZCBoYXZlIGJlZW4gZGlzcG9zZWQnICk7XHJcblxyXG4gICAgICAgIC8vIFNhdmUgYSByZWZlcmVuY2UgdG8gdGhlIFV0dGVyYW5jZVdyYXBwZXIgYW5kIGl0cyBwcmlvcml0eVByb3BlcnR5IGxpc3RlbmVyIHdoaWxlIHRoZSBBbm5vdW5jZXIgaXMgYW5ub3VuY2luZ1xyXG4gICAgICAgIC8vIGl0IHNvIHRoYXQgaXQgY2FuIGJlIHJlbW92ZWQgYXQgdGhlIGVuZCBvZiBhbm5vdW5jZW1lbnQuXHJcbiAgICAgICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlciA9IHV0dGVyYW5jZVdyYXBwZXI7XHJcbiAgICAgICAgdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlci5hbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucHJpb3JpdGl6ZVV0dGVyYW5jZXMoIHV0dGVyYW5jZVdyYXBwZXIgKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkubGluayggdGhpcy5hbm5vdW5jaW5nVXR0ZXJhbmNlV3JhcHBlci5hbm5vdW5jaW5nVXR0ZXJhbmNlUHJpb3JpdHlMaXN0ZW5lciApO1xyXG5cclxuICAgICAgICB0aGlzLmRlYnVnICYmIGNvbnNvbGUubG9nKCAnYW5ub3VuY2luZzogJywgYW5ub3VuY2VUZXh0ICk7XHJcbiAgICAgICAgdGhpcy5hbm5vdW5jZXIuYW5ub3VuY2UoIGFubm91bmNlVGV4dCwgdXR0ZXJhbmNlLCB1dHRlcmFuY2UuYW5ub3VuY2VyT3B0aW9ucyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZGVidWcgJiYgY29uc29sZS5sb2coICdhbm5vdW5jZXIgcmVhZHlUb0Fubm91bmNlIGJ1dCB1dHRlcmFuY2UgY2Fubm90IGFubm91bmNlLCB3aWxsIG5vdCBiZSBzcG9rZW46ICcsIGFubm91bmNlVGV4dCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBbm5vdW5jZXIuYW5ub3VuY2UgbWF5IHJlbW92ZSB0aGlzIFV0dGVyYW5jZSBhcyBhIHNpZGUgZWZmZWN0IGluIGEgbGlzdGVuZXIgZWFnZXJseSAoZm9yIGV4YW1wbGVcclxuICAgICAgLy8gaWYgd2UgdHJ5IHRvIGNsZWFyIHRoZSBxdWV1ZSB3aGVuIHRoaXMgVXR0ZXJhbmNlIGVuZHMsIGJ1dCBpdCBlbmRzIGltbWVkaWF0ZWx5IGJlY2F1c2UgdGhlIGJyb3dzZXJcclxuICAgICAgLy8gaXMgbm90IHJlYWR5IGZvciBzcGVlY2gpLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNDUuXHJcbiAgICAgIC8vIEJ1dCBnZW5lcmFsbHksIHRoZSBVdHRlcmFuY2Ugc2hvdWxkIHN0aWxsIGJlIGluIHRoZSBxdWV1ZSBhbmQgc2hvdWxkIG5vdyBiZSByZW1vdmVkLlxyXG4gICAgICB0aGlzLnF1ZXVlLmluY2x1ZGVzKCB1dHRlcmFuY2VXcmFwcGVyICkgJiYgdGhpcy5yZW1vdmVVdHRlcmFuY2UoIHV0dGVyYW5jZVdyYXBwZXIudXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmxvZyggJ2Fubm91bmNlciBub3QgcmVhZHlUb0Fubm91bmNlJyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gb25seSByZW1vdmUgbGlzdGVuZXJzIGlmIHRoZXkgd2VyZSBhZGRlZCBpbiBpbml0aWFsaXplXHJcbiAgICBpZiAoIHRoaXMuX2luaXRpYWxpemVkICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnN0ZXBRdWV1ZUxpc3RlbmVyICk7XHJcbiAgICAgIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggdGhpcy5zdGVwUXVldWVMaXN0ZW5lciEgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW1wbGUgZmFjdG9yeSB0byB3aXJlIHVwIGFsbCBzdGVwcyBmb3IgdXNpbmcgVXR0ZXJhbmNlUXVldWUgZm9yIGFyaWEtbGl2ZSBhbGVydHMuIFRoaXMgYWNjb21wbGlzaGVzIHRoZSB0aHJlZSBpdGVtc1xyXG4gICAqIG5lZWRlZCBmb3IgVXR0ZXJhbmNlUXVldWUgdG8gcnVuOlxyXG4gICAqIDEuIFN0ZXAgcGhldC5heG9uLnN0ZXBUaW1lciBvbiBhbmltYXRpb24gZnJhbWUgKHBhc3NpbmcgaXQgZWxhcHNlZCB0aW1lIGluIHNlY29uZHMpXHJcbiAgICogMi4gQWRkIFV0dGVyYW5jZVF1ZXVlJ3MgYXJpYS1saXZlIGVsZW1lbnRzIHRvIHRoZSBkb2N1bWVudFxyXG4gICAqIDMuIENyZWF0ZSB0aGUgVXR0ZXJhbmNlUXVldWUgaW5zdGFuY2VcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGZyb21GYWN0b3J5KCk6IFV0dGVyYW5jZVF1ZXVlIHtcclxuICAgIGNvbnN0IGFyaWFMaXZlQW5ub3VuY2VyID0gbmV3IEFyaWFMaXZlQW5ub3VuY2VyKCk7XHJcbiAgICBjb25zdCB1dHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggYXJpYUxpdmVBbm5vdW5jZXIgKTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBhcmlhTGl2ZUFubm91bmNlci5hcmlhTGl2ZUNvbnRhaW5lcjtcclxuXHJcbiAgICAvLyBncmFjZWZ1bGx5IHN1cHBvcnQgaWYgdGhlcmUgaXMgbm8gYm9keVxyXG4gICAgZG9jdW1lbnQuYm9keSA/IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGNvbnRhaW5lciApIDogZG9jdW1lbnQuY2hpbGRyZW5bIDAgXS5hcHBlbmRDaGlsZCggY29udGFpbmVyICk7XHJcblxyXG4gICAgbGV0IHByZXZpb3VzVGltZSA9IDA7XHJcbiAgICBjb25zdCBzdGVwID0gKCBlbGFwc2VkVGltZTogbnVtYmVyICkgPT4ge1xyXG4gICAgICBjb25zdCBkdCA9IGVsYXBzZWRUaW1lIC0gcHJldmlvdXNUaW1lO1xyXG4gICAgICBwcmV2aW91c1RpbWUgPSBlbGFwc2VkVGltZTtcclxuXHJcbiAgICAgIC8vIHRpbWUgdGFrZXMgc2Vjb25kc1xyXG4gICAgICBwaGV0LmF4b24uc3RlcFRpbWVyLmVtaXQoIGR0IC8gMTAwMCApO1xyXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBzdGVwICk7XHJcbiAgICB9O1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggc3RlcCApO1xyXG4gICAgcmV0dXJuIHV0dGVyYW5jZVF1ZXVlO1xyXG4gIH1cclxufVxyXG5cclxudXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UucmVnaXN0ZXIoICdVdHRlcmFuY2VRdWV1ZScsIFV0dGVyYW5jZVF1ZXVlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFV0dGVyYW5jZVF1ZXVlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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