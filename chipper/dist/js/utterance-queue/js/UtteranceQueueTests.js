// Copyright 2022-2023, University of Colorado Boulder

/**
 * QUnit tests for Utterance and UtteranceQueue that use voicingManager as the Announcer.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import stepTimer from '../../axon/js/stepTimer.js';
import { Display, voicingManager } from '../../scenery/js/imports.js';
import responseCollector from './responseCollector.js';
import Utterance from './Utterance.js';
import UtteranceQueue from './UtteranceQueue.js';
import SpeechSynthesisAnnouncer from './SpeechSynthesisAnnouncer.js';
const queryParameters = QueryStringMachine.getAll({
  manualInput: {
    type: 'flag'
  }
});

// See VOICING_UTTERANCE_INTERVAL in voicingManager for why this is necessary. We need to wait this long before
// checking on the utteranceQueue state when working with voicing.
const VOICING_UTTERANCE_INTERVAL = 125;

// When we want to add a little time to make that an interval has completed.
const TIMING_BUFFER = VOICING_UTTERANCE_INTERVAL + 50;

// @ts-expect-error we don't want to expose the constructor of this singleton just for unit tests.
const testVoicingManager = new voicingManager.constructor();
const testVoicingUtteranceQueue = new UtteranceQueue(testVoicingManager);
const setDefaultVoice = async () => {
  return new Promise(resolve => {
    const setIt = () => {
      testVoicingManager.voiceProperty.value = testVoicingManager.voicesProperty.value[0] || null;
      resolve();
    };
    if (testVoicingManager.voicesProperty.value.length > 0) {
      setIt();
    } else {
      testVoicingManager.voicesProperty.lazyLink(() => {
        setIt();
      });
    }
  });
};
testVoicingManager.initialize(Display.userGestureEmitter);
testVoicingManager.enabledProperty.value = true;

// helper es6 functions from  https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout/33292942
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); // eslint-disable-line bad-sim-text
}

let alerts = [];

// Utterance options that will have no cancellation from cancelSelf and cancelOther
const noCancelOptions = {
  cancelSelf: false,
  cancelOther: false
};
const timeUtterance = utterance => {
  return new Promise(resolve => {
    const startTime = Date.now();
    testVoicingUtteranceQueue.addToBack(utterance);
    testVoicingManager.announcementCompleteEmitter.addListener(function toRemove(completeUtterance) {
      if (completeUtterance === utterance) {
        resolve(Date.now() - startTime);
        testVoicingManager.announcementCompleteEmitter.removeListener(toRemove);
      }
    });
  });
};

// Reach into the testVoicingManager and get a reference to the Utterance that is currently being spoken for tests.
// Returns null if the Announcer doesn't have a currentlySpeakingUtterance
const getSpeakingUtterance = () => {
  return testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'] ? testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'].utterance : null;
};
const firstUtterance = new Utterance({
  alert: 'This is the first utterance',
  alertStableDelay: 0,
  announcerOptions: noCancelOptions
});
const secondUtterance = new Utterance({
  alert: 'This is the second utterance',
  alertStableDelay: 0,
  announcerOptions: noCancelOptions
});
const thirdUtterance = new Utterance({
  alert: 'This is the third utterance',
  alertStableDelay: 0,
  announcerOptions: noCancelOptions
});
let timeForFirstUtterance;
let timeForSecondUtterance;
let timeForThirdUtterance;
let intervalID;
QUnit.module('UtteranceQueue', {
  before: async () => {
    // timer step in seconds, stepped 60 times per second
    const timerInterval = 1 / 60;

    // step the timer, because utteranceQueue runs on timer
    let previousTime = Date.now(); // in ms

    intervalID = window.setInterval(() => {
      // eslint-disable-line bad-sim-text

      // in ms
      const currentTime = Date.now();
      const elapsedTime = currentTime - previousTime;
      stepTimer.emit(elapsedTime / 1000); // step timer in seconds

      previousTime = currentTime;
    }, timerInterval * 1000);

    // whenever announcing, get a callback and populate the alerts array
    testVoicingManager.announcementCompleteEmitter.addListener(utterance => {
      alerts.unshift(utterance);
    });
    if (queryParameters.manualInput) {
      // This seems long, but gives us time to click into the browser before the first test. The following
      // timeUtterance calls can run almost instantly and if you don't click into the sim before they start
      // the tests can break. We try to verify that you clicked into the browser with the following error, but
      // it won't catch everyting. If you click into the browser halfway through speaking the first utterance,
      // the time for the first utterance may be greater than 2000 ms but the timings will still be off.
      await timeout(3000);
      timeForFirstUtterance = await timeUtterance(firstUtterance);
      timeForSecondUtterance = await timeUtterance(secondUtterance);
      timeForThirdUtterance = await timeUtterance(thirdUtterance);

      // Make sure that speech synthesis is enabled and the Utterances are long enough for timing tests to be
      // consistent. Note that speech is faster or slower depending on your browser. Currently the test
      // utterances take ~1400 ms on Safari and ~2000 ms on Chrome.
      if (timeForFirstUtterance < 1200 || timeForSecondUtterance < 1200 || timeForThirdUtterance < 1200) {
        console.log(`timeForFirstUtterance: ${timeForFirstUtterance}, timeForThirdUtterance: ${timeForSecondUtterance}, timeForThirdUtterane: ${timeForThirdUtterance}`);
        throw new Error('time for Utterances is too short, did you click in the window before the first test started?');
      }
    }
    alerts = [];

    // Set a default voice
    await setDefaultVoice();
  },
  beforeEach: async () => {
    testVoicingUtteranceQueue.cancel();

    // all have default priority for the next test
    firstUtterance.priorityProperty.value = 1;
    secondUtterance.priorityProperty.value = 1;
    thirdUtterance.priorityProperty.value = 1;

    // Give plenty of time for the Announcer to be ready to speak again. For some reason this needs to be a really
    // large number to get tests to pass consistently. I am starting to have a hunch that QUnit tries to run
    // async tests in parallel...
    await timeout(TIMING_BUFFER * 3);

    // From debugging, I am not convinced that setInterval is called consistently while we wait for timeouts. Stepping
    // the timer here improves consistency and gets certain tests passing. Specifically, I want to make sure that
    // timing variables related to waiting for voicingManager to be readyToAnnounce have enough time to reset
    stepTimer.emit(TIMING_BUFFER * 3);
    responseCollector.reset();

    // clear the alerts before each new test
    alerts = [];
  },
  after() {
    clearInterval(intervalID);
  }
});
QUnit.test('Welcome to UtteranceQueueTests!', async assert => {
  assert.ok(true, 'UtteranceQueue tests take time, run with ?manualInput and click in the window before the first test');
});
QUnit.test('has voices', async assert => {
  const voices = testVoicingManager.voicesProperty.value;
  assert.ok(voices.length > 0, 'At least one voice expected in all browsers.');
});
QUnit.test('prioritize utterances on add to back', async assert => {
  const utterance1 = new Utterance({
    alert: '1',
    priority: 5
  });
  const utterance2 = new Utterance({
    alert: '2',
    priority: 1
  });
  const utterance3 = new Utterance({
    alert: '3',
    priority: 1
  });
  const utterance4 = new Utterance({
    alert: '4',
    priority: 1,
    announcerOptions: {
      cancelOther: false
    }
  });
  const utterance5 = new Utterance({
    alert: '5',
    priority: 1,
    announcerOptions: {
      cancelOther: false
    }
  });
  const speechSynthesisAnnouncer = new SpeechSynthesisAnnouncer();
  speechSynthesisAnnouncer.hasSpoken = true; // HAX

  const utteranceQueue = new UtteranceQueue(speechSynthesisAnnouncer);
  assert.ok(utteranceQueue['queue'].length === 0, 'nothing man');
  utteranceQueue.addToBack(utterance1);
  assert.ok(utteranceQueue['queue'].length === 1, 'one add to back');
  utteranceQueue.addToBack(utterance2);
  assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
  utteranceQueue.addToBack(utterance3);
  assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
  assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
  assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
  utteranceQueue.addToBack(utterance4);
  assert.ok(utteranceQueue['queue'].length === 3, 'one add to back');
  assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
  assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
  assert.ok(utteranceQueue['queue'][2].utterance === utterance4, 'utterance4 does not removed utterance3 because cancelOther:true');
  utteranceQueue.addToBack(utterance5);
  assert.ok(utteranceQueue['queue'].length === 4, 'one add to back');
  assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
  assert.ok(utteranceQueue['queue'][1].utterance === utterance3, 'utterance3 removed utterance1 because cancelOther:true');
  assert.ok(utteranceQueue['queue'][2].utterance === utterance4, 'utterance4 does not removed utterance3 because cancelOther:true');
  assert.ok(utteranceQueue['queue'][3].utterance === utterance5, 'utterance4 does not removed utterance3 because cancelOther:true');

  /**
   * UtteranceQueue.prioritizeUtterances() handles prioritizing utterances before AND after the changed utterance. We want
   * to test here that it can handle that when both need updating in the same call. Thus, don't notify for one case,
   * and let the prioritization of the queue occur all during one priority listener call.
   *
   * HAX alert - please make this value between the utterance4 value below and also lower than utterance1.
   */
  utterance5.priorityProperty['setPropertyValue'](3);
  utterance4.priorityProperty.value = 2;
  assert.ok(utteranceQueue['queue'].length === 2, 'one add to back');
  assert.ok(utteranceQueue['queue'][0].utterance === utterance1, 'one add to back');
  assert.ok(utteranceQueue['queue'][1].utterance === utterance5, 'utterance5 kicked utterance4 outta the park.');
});
QUnit.test('utterance.announcerOptions.voice', async assert => {
  const done = assert.async();
  testVoicingManager.voiceProperty.value = null;
  const voice = testVoicingManager.voicesProperty.value[0];
  const utterance = new Utterance({
    alert: 'one',
    announcerOptions: {
      voice: voice
    }
  });
  testVoicingManager.endSpeakingEmitter.addListener(function myListener() {
    const x = testVoicingManager['speakingSpeechSynthesisUtteranceWrapper'];
    assert.ok(x, 'we should have one');
    assert.ok(x.speechSynthesisUtterance.voice === voice, 'voice should match the provided utterance\'s');
    testVoicingManager.endSpeakingEmitter.removeListener(myListener);
    done();
  });
  testVoicingManager.speakIgnoringEnabled(utterance);
  testVoicingManager.voiceProperty.value = voice;
});
if (queryParameters.manualInput) {
  QUnit.test('Basic UtteranceQueue test', async assert => {
    // basic test, we should hear all three Utterances
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    await timeout(timeForFirstUtterance + timeForSecondUtterance + timeForThirdUtterance + TIMING_BUFFER * 3);
    assert.ok(alerts.length === 3, 'Three basic Utterances went through the queue');
  });
  QUnit.test('cancelUtterance tests', async assert => {
    // Test that cancelUtterance will not introduce a memory leak with multiple listeners on the Property
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    await timeout(timeForFirstUtterance / 2);
    testVoicingUtteranceQueue.cancelUtterance(firstUtterance);

    // Make sure that we handle the `end` event happening asynchronously from the cancel, this should not crash
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance was cancelled');
    assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'There is one Utterance in the queue');
  });
  QUnit.test('PriorityProperty interruption', async assert => {
    // Add all 3 to back
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    assert.ok(testVoicingUtteranceQueue['queue'].length === 3, 'All three utterances in the queue');

    // make the third Utterance high priority, it should remove the other two Utterances
    thirdUtterance.priorityProperty.value = 2;
    assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'Only the one Utterance remains');
    assert.ok(testVoicingUtteranceQueue['queue'][0].utterance === thirdUtterance, 'Only the third Utterance remains');
  });
  QUnit.test('Announced Utterance can also be in queue and interruption during announcement', async assert => {
    // while an Utterance is being announced, make sure that we can add the same Utterance to the queue and that
    // priorityProperty is still observed
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    await timeout(timeForFirstUtterance / 2);
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    await timeout(timeForFirstUtterance); // Time to get halfway through second announcement of firstUtterance

    // reduce priorityProperty of firstUtterance while it is being announced, secondUtterance should interrupt
    firstUtterance.priorityProperty.value = 0;
    await timeout(timeForSecondUtterance / 2);
    assert.ok(getSpeakingUtterance() === secondUtterance, 'Utterance being announced still observes priorityProperty');
    assert.ok(testVoicingUtteranceQueue['queue'].length === 0, 'queue empty after interruption and sending secondUtterance to Announcer');
  });
  QUnit.test('Higher priority removes earlier Utterances from queue', async assert => {
    // Unit test cases taken from examples that demonstrated the priorityProperty feature in
    // https://github.com/phetsims/utterance-queue/issues/50
    //------------------------------------------------------------------------------------------------------------------

    // Add all 3 to back
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    assert.ok(testVoicingUtteranceQueue['queue'].length === 3, 'All three utterances in the queue');
    secondUtterance.priorityProperty.value = 2;

    // enough time for the secondUtterance to start speaking while the firstUtterance was just removed from the queue
    await timeout(timeForSecondUtterance / 2);
    assert.ok(getSpeakingUtterance() === secondUtterance, 'The secondUtterance interrupted the firstUtterance because it is higher priority.');

    // enough time to finish the secondUtterance and start speaking the thirdUtterance
    await timeout(timeForSecondUtterance / 2 + timeForThirdUtterance / 2);
    assert.ok(alerts[0] === secondUtterance, 'secondUtterance spoken in full');
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken after secondUtterance finished');
    //------------------------------------------------------------------------------------------------------------------
  });

  QUnit.test('Utterance removed because of self priority reduction before another is added to queue', async assert => {
    firstUtterance.priorityProperty.value = 10;
    testVoicingUtteranceQueue.addToBack(firstUtterance);

    // reduce priorityProperty before adding thirdUtterance to queue
    firstUtterance.priorityProperty.value = 0;
    testVoicingUtteranceQueue.addToBack(thirdUtterance);

    // enough time to start speaking either the first or third Utterances
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken because firstUtterance.priorityProperty was reduced before adding thirdUtterance to the queue');
  });
  QUnit.test('Utterance removed because of self priority reduction after another is added to queue', async assert => {
    firstUtterance.priorityProperty.value = 10;
    testVoicingUtteranceQueue.addToBack(firstUtterance);

    // reduce priorityProperty AFTER adding thirdUtterance to queue
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    firstUtterance.priorityProperty.value = 0;

    // enough time to start speaking either the first or third Utterances
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken because firstUtterance.priorityProperty was reduced after adding thirdUtterance to the queue');
  });
  QUnit.test('Utterance interruption because self priority reduced while being announced', async assert => {
    firstUtterance.priorityProperty.value = 10;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance);

    // reducing priority below third utterance should interrupt firstUtterance for thirdUtterance
    firstUtterance.priorityProperty.value = 0;

    // not enough time for firstUtterance to finish in full, but enough time to verify that it was interrupted
    await timeout(timeForFirstUtterance / 4);
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance was interrupted because its priority was reduced while it was being announced');

    // enough time for thirdUtterance to start speaking
    await timeout(timeForThirdUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after interrupting firstUtterance');
  });
  QUnit.test('Utterance interruption during annoumcement because another in the queue made higher priority', async assert => {
    firstUtterance.priorityProperty.value = 0;
    thirdUtterance.priorityProperty.value = 0;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance, 'firstUtterance being announced');

    // increasing priority of thirdUtterance in the queue should interrupt firstUtterance being announced
    thirdUtterance.priorityProperty.value = 3;

    // not enough time for firstUtterance to finish, but enough to make sure that it was interrupted
    await timeout(timeForFirstUtterance / 4);
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance was interrupted because an Utterance in the queue was made higher priority');

    // enough time for thirdUtterance to start speaking
    await timeout(timeForThirdUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after interrupting firstUtterance');
  });
  QUnit.test('Utterance NOT interrupted because self priority still relatively higher', async assert => {
    firstUtterance.priorityProperty.value = 10;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);
    await timeout(timeForFirstUtterance / 2);

    // we should still hear both Utterances in full, new priority for firstUtterance is higher than thirdUtterance
    firstUtterance.priorityProperty.value = 5;

    // not enough time for firstUtterance to finish, but enough to make sure that it was not interrupted
    await timeout(timeForFirstUtterance / 10);
    assert.ok(alerts.length === 0, 'firstUtterance was not interrupted because priority was set to a value higher than next utterance in queue');

    // enough time for thirdUtterance to start speaking after firstUtterance finishes
    await timeout(timeForThirdUtterance / 2 + timeForFirstUtterance / 2);
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance finished being announced');
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance being announced after waiting for firstUtterance');
  });
  QUnit.test('announceImmediately', async assert => {
    testVoicingUtteranceQueue.announceImmediately(firstUtterance);
    assert.ok(testVoicingUtteranceQueue['queue'].length === 0, 'announceImmediately should be synchronous with voicingManager for an empty queue');
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance, 'first utterance spoken immediately');
  });
  QUnit.test('announceImmediately reduces duplicate Utterances in queue', async assert => {
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.addToBack(thirdUtterance);

    // now speak the first utterance immediately
    testVoicingUtteranceQueue.announceImmediately(firstUtterance);
    await timeout(timeForFirstUtterance / 2);
    assert.ok(testVoicingUtteranceQueue['queue'].length === 2, 'announcing firstUtterance immediately should remove the duplicate firstUtterance in the queue');
    assert.ok(getSpeakingUtterance() === firstUtterance, 'first utterance is being spoken after announceImmediately');
  });
  QUnit.test('announceImmediately does nothing when Utterance has low priority relative to queued Utterances', async assert => {
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    firstUtterance.priorityProperty.value = 2;
    thirdUtterance.priorityProperty.value = 1;
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);

    // thirdUtterance is lower priority than next item in the queue, it should not be spoken and should not be
    // in the queue at all
    assert.ok(testVoicingUtteranceQueue['queue'].length === 2, 'only first and second utterances in the queue');
    assert.ok(!testVoicingUtteranceQueue.hasUtterance(thirdUtterance), 'thirdUtterance not in queue after announceImmediately');
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance);
    assert.ok(alerts[0] !== thirdUtterance, 'thirdUtterance was not spoken with announceImmediately');
  });
  QUnit.test('anounceImmediatelety does nothing when Utterance has low priority relative to announcing Utterance', async assert => {
    firstUtterance.priorityProperty.value = 1;
    thirdUtterance.priorityProperty.value = 1;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    firstUtterance.priorityProperty.value = 2;
    thirdUtterance.priorityProperty.value = 1;
    await timeout(timeForFirstUtterance / 2);
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);

    // thirdUtterance is lower priority than what is currently being spoken so it should NOT be heard
    await timeout(timeForFirstUtterance / 4); // less than remaining time for firstUtterance checking for interruption
    assert.ok(getSpeakingUtterance() !== thirdUtterance, 'announceImmediately should not interrupt a higher priority utterance');
    assert.ok(!testVoicingUtteranceQueue.hasUtterance(thirdUtterance), 'lower priority thirdUtterance should be dropped from the queue');
  });
  QUnit.test('Utterance spoken with announceImmediately should be interrupted if priority is reduced', async assert => {
    //--------------------------------------------------------------------------------------------------
    // The Utterance spoken with announceImmediately should be interrupted if its priority is reduced
    // below another item in the queue
    //--------------------------------------------------------------------------------------------------
    firstUtterance.priorityProperty.value = 2;
    thirdUtterance.priorityProperty.value = 2;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
    await timeout(timeForThirdUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance is announced immediately');
    thirdUtterance.priorityProperty.value = 1;

    // the priority of the thirdUtterance is reduced while being spoken from announceImmediately, it should be
    // interrupted and the next item in the queue should be spoken
    await timeout(timeForThirdUtterance / 4); // less than the remaining time for third utterance for interruption
    assert.ok(alerts[0] === thirdUtterance, 'third utterance was interrupted by reducing its priority');
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance, 'moved on to next utterance in queue');
  });
  QUnit.test('Utterance spoken by announceImmediately is interrupted by raising priority of queued utterance', async assert => {
    firstUtterance.priorityProperty.value = 1;
    thirdUtterance.priorityProperty.value = 1;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
    await timeout(timeForThirdUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance is announced immediately');
    firstUtterance.priorityProperty.value = 2;

    // the priority of firstUtterance is increased so the utterance of announceImmediately should be interrupted
    await timeout(timeForThirdUtterance / 4); // less than remaining time for third utterance for interruption
    assert.ok(alerts[0] === thirdUtterance, 'third utterance was interrupted by the next Utterance increasing priority');
    await timeout(timeForFirstUtterance / 2);
    assert.ok(getSpeakingUtterance() === firstUtterance, 'moved on to higher priority utterance in queue');
  });
  QUnit.test('announceImmediately interrupts another Utterance if new Utterance is high priority', async assert => {
    firstUtterance.priorityProperty.value = 1;
    thirdUtterance.priorityProperty.value = 2;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    await timeout(timeForFirstUtterance / 2);
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
    await timeout(timeForFirstUtterance / 4); // should not be enough time for firstUtterance to finish
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance interrupted because it had lower priority');
    await timeout(timeForThirdUtterance / 2);
    assert.ok(getSpeakingUtterance() === thirdUtterance, 'thirdUtterance spoken immediately');
  });
  QUnit.test('announceImmediately will not interrupt Utterance of equal or lesser priority ', async assert => {
    firstUtterance.priorityProperty.value = 1;
    thirdUtterance.priorityProperty.value = 1;
    testVoicingUtteranceQueue.addToBack(firstUtterance);
    testVoicingUtteranceQueue.addToBack(secondUtterance);
    await timeout(timeForFirstUtterance / 2);
    testVoicingUtteranceQueue.announceImmediately(thirdUtterance);
    await timeout(timeForFirstUtterance / 4);
    assert.ok(getSpeakingUtterance() === firstUtterance, 'firstUtterance not interrupted, it has equal priority');
    assert.ok(testVoicingUtteranceQueue['queue'][0].utterance === secondUtterance, 'thirdUtterance was added to the front of the queue');
    assert.ok(testVoicingUtteranceQueue['queue'].length === 1, 'thirdUtterance was not added to queue and will never be announced');
    await timeout(timeForFirstUtterance / 4 + timeForThirdUtterance / 2);
    assert.ok(alerts[0] === firstUtterance, 'firstUtterance spoken in full');
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJEaXNwbGF5Iiwidm9pY2luZ01hbmFnZXIiLCJyZXNwb25zZUNvbGxlY3RvciIsIlV0dGVyYW5jZSIsIlV0dGVyYW5jZVF1ZXVlIiwiU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIiwicXVlcnlQYXJhbWV0ZXJzIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwibWFudWFsSW5wdXQiLCJ0eXBlIiwiVk9JQ0lOR19VVFRFUkFOQ0VfSU5URVJWQUwiLCJUSU1JTkdfQlVGRkVSIiwidGVzdFZvaWNpbmdNYW5hZ2VyIiwiY29uc3RydWN0b3IiLCJ0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlIiwic2V0RGVmYXVsdFZvaWNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRJdCIsInZvaWNlUHJvcGVydHkiLCJ2YWx1ZSIsInZvaWNlc1Byb3BlcnR5IiwibGVuZ3RoIiwibGF6eUxpbmsiLCJpbml0aWFsaXplIiwidXNlckdlc3R1cmVFbWl0dGVyIiwiZW5hYmxlZFByb3BlcnR5IiwidGltZW91dCIsIm1zIiwic2V0VGltZW91dCIsImFsZXJ0cyIsIm5vQ2FuY2VsT3B0aW9ucyIsImNhbmNlbFNlbGYiLCJjYW5jZWxPdGhlciIsInRpbWVVdHRlcmFuY2UiLCJ1dHRlcmFuY2UiLCJzdGFydFRpbWUiLCJEYXRlIiwibm93IiwiYWRkVG9CYWNrIiwiYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ0b1JlbW92ZSIsImNvbXBsZXRlVXR0ZXJhbmNlIiwicmVtb3ZlTGlzdGVuZXIiLCJnZXRTcGVha2luZ1V0dGVyYW5jZSIsImZpcnN0VXR0ZXJhbmNlIiwiYWxlcnQiLCJhbGVydFN0YWJsZURlbGF5IiwiYW5ub3VuY2VyT3B0aW9ucyIsInNlY29uZFV0dGVyYW5jZSIsInRoaXJkVXR0ZXJhbmNlIiwidGltZUZvckZpcnN0VXR0ZXJhbmNlIiwidGltZUZvclNlY29uZFV0dGVyYW5jZSIsInRpbWVGb3JUaGlyZFV0dGVyYW5jZSIsImludGVydmFsSUQiLCJRVW5pdCIsIm1vZHVsZSIsImJlZm9yZSIsInRpbWVySW50ZXJ2YWwiLCJwcmV2aW91c1RpbWUiLCJ3aW5kb3ciLCJzZXRJbnRlcnZhbCIsImN1cnJlbnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJlbWl0IiwidW5zaGlmdCIsImNvbnNvbGUiLCJsb2ciLCJFcnJvciIsImJlZm9yZUVhY2giLCJjYW5jZWwiLCJwcmlvcml0eVByb3BlcnR5IiwicmVzZXQiLCJhZnRlciIsImNsZWFySW50ZXJ2YWwiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siLCJ2b2ljZXMiLCJ1dHRlcmFuY2UxIiwicHJpb3JpdHkiLCJ1dHRlcmFuY2UyIiwidXR0ZXJhbmNlMyIsInV0dGVyYW5jZTQiLCJ1dHRlcmFuY2U1Iiwic3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyIiwiaGFzU3Bva2VuIiwidXR0ZXJhbmNlUXVldWUiLCJkb25lIiwiYXN5bmMiLCJ2b2ljZSIsImVuZFNwZWFraW5nRW1pdHRlciIsIm15TGlzdGVuZXIiLCJ4Iiwic3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlIiwic3BlYWtJZ25vcmluZ0VuYWJsZWQiLCJjYW5jZWxVdHRlcmFuY2UiLCJhbm5vdW5jZUltbWVkaWF0ZWx5IiwiaGFzVXR0ZXJhbmNlIl0sInNvdXJjZXMiOlsiVXR0ZXJhbmNlUXVldWVUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRVW5pdCB0ZXN0cyBmb3IgVXR0ZXJhbmNlIGFuZCBVdHRlcmFuY2VRdWV1ZSB0aGF0IHVzZSB2b2ljaW5nTWFuYWdlciBhcyB0aGUgQW5ub3VuY2VyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBEaXNwbGF5LCB2b2ljaW5nTWFuYWdlciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCByZXNwb25zZUNvbGxlY3RvciBmcm9tICcuL3Jlc3BvbnNlQ29sbGVjdG9yLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuL1V0dGVyYW5jZS5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2VRdWV1ZSBmcm9tICcuL1V0dGVyYW5jZVF1ZXVlLmpzJztcclxuaW1wb3J0IFNwZWVjaFN5bnRoZXNpc0Fubm91bmNlciBmcm9tICcuL1NwZWVjaFN5bnRoZXNpc0Fubm91bmNlci5qcyc7XHJcblxyXG5jb25zdCBxdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcbiAgbWFudWFsSW5wdXQ6IHtcclxuICAgIHR5cGU6ICdmbGFnJ1xyXG4gIH1cclxufSApO1xyXG5cclxuLy8gU2VlIFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMIGluIHZvaWNpbmdNYW5hZ2VyIGZvciB3aHkgdGhpcyBpcyBuZWNlc3NhcnkuIFdlIG5lZWQgdG8gd2FpdCB0aGlzIGxvbmcgYmVmb3JlXHJcbi8vIGNoZWNraW5nIG9uIHRoZSB1dHRlcmFuY2VRdWV1ZSBzdGF0ZSB3aGVuIHdvcmtpbmcgd2l0aCB2b2ljaW5nLlxyXG5jb25zdCBWT0lDSU5HX1VUVEVSQU5DRV9JTlRFUlZBTCA9IDEyNTtcclxuXHJcbi8vIFdoZW4gd2Ugd2FudCB0byBhZGQgYSBsaXR0bGUgdGltZSB0byBtYWtlIHRoYXQgYW4gaW50ZXJ2YWwgaGFzIGNvbXBsZXRlZC5cclxuY29uc3QgVElNSU5HX0JVRkZFUiA9IFZPSUNJTkdfVVRURVJBTkNFX0lOVEVSVkFMICsgNTA7XHJcblxyXG4vLyBAdHMtZXhwZWN0LWVycm9yIHdlIGRvbid0IHdhbnQgdG8gZXhwb3NlIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGlzIHNpbmdsZXRvbiBqdXN0IGZvciB1bml0IHRlc3RzLlxyXG5jb25zdCB0ZXN0Vm9pY2luZ01hbmFnZXIgPSBuZXcgdm9pY2luZ01hbmFnZXIuY29uc3RydWN0b3IoKTtcclxuY29uc3QgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggdGVzdFZvaWNpbmdNYW5hZ2VyICk7XHJcblxyXG5jb25zdCBzZXREZWZhdWx0Vm9pY2UgPSBhc3luYyAoKSA9PiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCByZXNvbHZlID0+IHtcclxuICAgIGNvbnN0IHNldEl0ID0gKCkgPT4ge1xyXG4gICAgICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VQcm9wZXJ0eS52YWx1ZSA9IHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS52YWx1ZVsgMCBdIHx8IG51bGw7XHJcbiAgICAgIHJlc29sdmUoKTtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkudmFsdWUubGVuZ3RoID4gMCApIHtcclxuICAgICAgc2V0SXQoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgICBzZXRJdCgpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG59O1xyXG5cclxudGVzdFZvaWNpbmdNYW5hZ2VyLmluaXRpYWxpemUoIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyICk7XHJcbnRlc3RWb2ljaW5nTWFuYWdlci5lbmFibGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuLy8gaGVscGVyIGVzNiBmdW5jdGlvbnMgZnJvbSAgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzMyODk3MjYvY29tYmluYXRpb24tb2YtYXN5bmMtZnVuY3Rpb24tYXdhaXQtc2V0dGltZW91dC8zMzI5Mjk0MlxyXG5mdW5jdGlvbiB0aW1lb3V0KCBtczogbnVtYmVyICk6IFByb21pc2U8dW5rbm93bj4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiBzZXRUaW1lb3V0KCByZXNvbHZlLCBtcyApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbn1cclxuXHJcbmxldCBhbGVydHM6IFV0dGVyYW5jZVtdID0gW107XHJcblxyXG4vLyBVdHRlcmFuY2Ugb3B0aW9ucyB0aGF0IHdpbGwgaGF2ZSBubyBjYW5jZWxsYXRpb24gZnJvbSBjYW5jZWxTZWxmIGFuZCBjYW5jZWxPdGhlclxyXG5jb25zdCBub0NhbmNlbE9wdGlvbnMgPSB7XHJcbiAgY2FuY2VsU2VsZjogZmFsc2UsXHJcbiAgY2FuY2VsT3RoZXI6IGZhbHNlXHJcbn07XHJcblxyXG5jb25zdCB0aW1lVXR0ZXJhbmNlID0gKCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApOiBQcm9taXNlPG51bWJlcj4gPT4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XHJcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZSApO1xyXG5cclxuICAgIHRlc3RWb2ljaW5nTWFuYWdlci5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIHRvUmVtb3ZlKCBjb21wbGV0ZVV0dGVyYW5jZTogVXR0ZXJhbmNlICkge1xyXG4gICAgICBpZiAoIGNvbXBsZXRlVXR0ZXJhbmNlID09PSB1dHRlcmFuY2UgKSB7XHJcbiAgICAgICAgcmVzb2x2ZSggRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSApO1xyXG4gICAgICAgIHRlc3RWb2ljaW5nTWFuYWdlci5hbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRvUmVtb3ZlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9ICk7XHJcbn07XHJcblxyXG4vLyBSZWFjaCBpbnRvIHRoZSB0ZXN0Vm9pY2luZ01hbmFnZXIgYW5kIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgVXR0ZXJhbmNlIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIHNwb2tlbiBmb3IgdGVzdHMuXHJcbi8vIFJldHVybnMgbnVsbCBpZiB0aGUgQW5ub3VuY2VyIGRvZXNuJ3QgaGF2ZSBhIGN1cnJlbnRseVNwZWFraW5nVXR0ZXJhbmNlXHJcbmNvbnN0IGdldFNwZWFraW5nVXR0ZXJhbmNlID0gKCk6IFV0dGVyYW5jZSB8IG51bGwgPT4ge1xyXG4gIHJldHVybiB0ZXN0Vm9pY2luZ01hbmFnZXJbICdzcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXInIF0gPyB0ZXN0Vm9pY2luZ01hbmFnZXJbICdzcGVha2luZ1NwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZVdyYXBwZXInIF0udXR0ZXJhbmNlIDogbnVsbDtcclxufTtcclxuXHJcbmNvbnN0IGZpcnN0VXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gIGFsZXJ0OiAnVGhpcyBpcyB0aGUgZmlyc3QgdXR0ZXJhbmNlJyxcclxuICBhbGVydFN0YWJsZURlbGF5OiAwLFxyXG4gIGFubm91bmNlck9wdGlvbnM6IG5vQ2FuY2VsT3B0aW9uc1xyXG59ICk7XHJcbmNvbnN0IHNlY29uZFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcclxuICBhbGVydDogJ1RoaXMgaXMgdGhlIHNlY29uZCB1dHRlcmFuY2UnLFxyXG4gIGFsZXJ0U3RhYmxlRGVsYXk6IDAsXHJcbiAgYW5ub3VuY2VyT3B0aW9uczogbm9DYW5jZWxPcHRpb25zXHJcbn0gKTtcclxuXHJcbmNvbnN0IHRoaXJkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gIGFsZXJ0OiAnVGhpcyBpcyB0aGUgdGhpcmQgdXR0ZXJhbmNlJyxcclxuICBhbGVydFN0YWJsZURlbGF5OiAwLFxyXG4gIGFubm91bmNlck9wdGlvbnM6IG5vQ2FuY2VsT3B0aW9uc1xyXG59ICk7XHJcblxyXG5cclxubGV0IHRpbWVGb3JGaXJzdFV0dGVyYW5jZTogbnVtYmVyO1xyXG5sZXQgdGltZUZvclNlY29uZFV0dGVyYW5jZTogbnVtYmVyO1xyXG5sZXQgdGltZUZvclRoaXJkVXR0ZXJhbmNlOiBudW1iZXI7XHJcblxyXG5sZXQgaW50ZXJ2YWxJRDogbnVtYmVyO1xyXG5RVW5pdC5tb2R1bGUoICdVdHRlcmFuY2VRdWV1ZScsIHtcclxuICBiZWZvcmU6IGFzeW5jICgpID0+IHtcclxuXHJcbiAgICAvLyB0aW1lciBzdGVwIGluIHNlY29uZHMsIHN0ZXBwZWQgNjAgdGltZXMgcGVyIHNlY29uZFxyXG4gICAgY29uc3QgdGltZXJJbnRlcnZhbCA9IDEgLyA2MDtcclxuXHJcbiAgICAvLyBzdGVwIHRoZSB0aW1lciwgYmVjYXVzZSB1dHRlcmFuY2VRdWV1ZSBydW5zIG9uIHRpbWVyXHJcbiAgICBsZXQgcHJldmlvdXNUaW1lID0gRGF0ZS5ub3coKTsgLy8gaW4gbXNcclxuXHJcbiAgICBpbnRlcnZhbElEID0gd2luZG93LnNldEludGVydmFsKCAoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcblxyXG4gICAgICAvLyBpbiBtc1xyXG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIGNvbnN0IGVsYXBzZWRUaW1lID0gY3VycmVudFRpbWUgLSBwcmV2aW91c1RpbWU7XHJcblxyXG4gICAgICBzdGVwVGltZXIuZW1pdCggZWxhcHNlZFRpbWUgLyAxMDAwICk7IC8vIHN0ZXAgdGltZXIgaW4gc2Vjb25kc1xyXG5cclxuICAgICAgcHJldmlvdXNUaW1lID0gY3VycmVudFRpbWU7XHJcbiAgICB9LCB0aW1lckludGVydmFsICogMTAwMCApO1xyXG5cclxuICAgIC8vIHdoZW5ldmVyIGFubm91bmNpbmcsIGdldCBhIGNhbGxiYWNrIGFuZCBwb3B1bGF0ZSB0aGUgYWxlcnRzIGFycmF5XHJcbiAgICB0ZXN0Vm9pY2luZ01hbmFnZXIuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICkgPT4ge1xyXG4gICAgICBhbGVydHMudW5zaGlmdCggdXR0ZXJhbmNlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBxdWVyeVBhcmFtZXRlcnMubWFudWFsSW5wdXQgKSB7XHJcblxyXG4gICAgICAvLyBUaGlzIHNlZW1zIGxvbmcsIGJ1dCBnaXZlcyB1cyB0aW1lIHRvIGNsaWNrIGludG8gdGhlIGJyb3dzZXIgYmVmb3JlIHRoZSBmaXJzdCB0ZXN0LiBUaGUgZm9sbG93aW5nXHJcbiAgICAgIC8vIHRpbWVVdHRlcmFuY2UgY2FsbHMgY2FuIHJ1biBhbG1vc3QgaW5zdGFudGx5IGFuZCBpZiB5b3UgZG9uJ3QgY2xpY2sgaW50byB0aGUgc2ltIGJlZm9yZSB0aGV5IHN0YXJ0XHJcbiAgICAgIC8vIHRoZSB0ZXN0cyBjYW4gYnJlYWsuIFdlIHRyeSB0byB2ZXJpZnkgdGhhdCB5b3UgY2xpY2tlZCBpbnRvIHRoZSBicm93c2VyIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvciwgYnV0XHJcbiAgICAgIC8vIGl0IHdvbid0IGNhdGNoIGV2ZXJ5dGluZy4gSWYgeW91IGNsaWNrIGludG8gdGhlIGJyb3dzZXIgaGFsZndheSB0aHJvdWdoIHNwZWFraW5nIHRoZSBmaXJzdCB1dHRlcmFuY2UsXHJcbiAgICAgIC8vIHRoZSB0aW1lIGZvciB0aGUgZmlyc3QgdXR0ZXJhbmNlIG1heSBiZSBncmVhdGVyIHRoYW4gMjAwMCBtcyBidXQgdGhlIHRpbWluZ3Mgd2lsbCBzdGlsbCBiZSBvZmYuXHJcbiAgICAgIGF3YWl0IHRpbWVvdXQoIDMwMDAgKTtcclxuXHJcbiAgICAgIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSA9IGF3YWl0IHRpbWVVdHRlcmFuY2UoIGZpcnN0VXR0ZXJhbmNlICk7XHJcbiAgICAgIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgPSBhd2FpdCB0aW1lVXR0ZXJhbmNlKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgICAgdGltZUZvclRoaXJkVXR0ZXJhbmNlID0gYXdhaXQgdGltZVV0dGVyYW5jZSggdGhpcmRVdHRlcmFuY2UgKTtcclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHNwZWVjaCBzeW50aGVzaXMgaXMgZW5hYmxlZCBhbmQgdGhlIFV0dGVyYW5jZXMgYXJlIGxvbmcgZW5vdWdoIGZvciB0aW1pbmcgdGVzdHMgdG8gYmVcclxuICAgICAgLy8gY29uc2lzdGVudC4gTm90ZSB0aGF0IHNwZWVjaCBpcyBmYXN0ZXIgb3Igc2xvd2VyIGRlcGVuZGluZyBvbiB5b3VyIGJyb3dzZXIuIEN1cnJlbnRseSB0aGUgdGVzdFxyXG4gICAgICAvLyB1dHRlcmFuY2VzIHRha2UgfjE0MDAgbXMgb24gU2FmYXJpIGFuZCB+MjAwMCBtcyBvbiBDaHJvbWUuXHJcbiAgICAgIGlmICggdGltZUZvckZpcnN0VXR0ZXJhbmNlIDwgMTIwMCB8fCB0aW1lRm9yU2Vjb25kVXR0ZXJhbmNlIDwgMTIwMCB8fCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgPCAxMjAwICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgdGltZUZvckZpcnN0VXR0ZXJhbmNlOiAke3RpbWVGb3JGaXJzdFV0dGVyYW5jZX0sIHRpbWVGb3JUaGlyZFV0dGVyYW5jZTogJHt0aW1lRm9yU2Vjb25kVXR0ZXJhbmNlfSwgdGltZUZvclRoaXJkVXR0ZXJhbmU6ICR7dGltZUZvclRoaXJkVXR0ZXJhbmNlfWAgKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICd0aW1lIGZvciBVdHRlcmFuY2VzIGlzIHRvbyBzaG9ydCwgZGlkIHlvdSBjbGljayBpbiB0aGUgd2luZG93IGJlZm9yZSB0aGUgZmlyc3QgdGVzdCBzdGFydGVkPycgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFsZXJ0cyA9IFtdO1xyXG5cclxuICAgIC8vIFNldCBhIGRlZmF1bHQgdm9pY2VcclxuICAgIGF3YWl0IHNldERlZmF1bHRWb2ljZSgpO1xyXG4gIH0sXHJcbiAgYmVmb3JlRWFjaDogYXN5bmMgKCkgPT4ge1xyXG5cclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuY2FuY2VsKCk7XHJcblxyXG4gICAgLy8gYWxsIGhhdmUgZGVmYXVsdCBwcmlvcml0eSBmb3IgdGhlIG5leHQgdGVzdFxyXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICBzZWNvbmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICB0aGlyZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcclxuXHJcbiAgICAvLyBHaXZlIHBsZW50eSBvZiB0aW1lIGZvciB0aGUgQW5ub3VuY2VyIHRvIGJlIHJlYWR5IHRvIHNwZWFrIGFnYWluLiBGb3Igc29tZSByZWFzb24gdGhpcyBuZWVkcyB0byBiZSBhIHJlYWxseVxyXG4gICAgLy8gbGFyZ2UgbnVtYmVyIHRvIGdldCB0ZXN0cyB0byBwYXNzIGNvbnNpc3RlbnRseS4gSSBhbSBzdGFydGluZyB0byBoYXZlIGEgaHVuY2ggdGhhdCBRVW5pdCB0cmllcyB0byBydW5cclxuICAgIC8vIGFzeW5jIHRlc3RzIGluIHBhcmFsbGVsLi4uXHJcbiAgICBhd2FpdCB0aW1lb3V0KCBUSU1JTkdfQlVGRkVSICogMyApO1xyXG5cclxuICAgIC8vIEZyb20gZGVidWdnaW5nLCBJIGFtIG5vdCBjb252aW5jZWQgdGhhdCBzZXRJbnRlcnZhbCBpcyBjYWxsZWQgY29uc2lzdGVudGx5IHdoaWxlIHdlIHdhaXQgZm9yIHRpbWVvdXRzLiBTdGVwcGluZ1xyXG4gICAgLy8gdGhlIHRpbWVyIGhlcmUgaW1wcm92ZXMgY29uc2lzdGVuY3kgYW5kIGdldHMgY2VydGFpbiB0ZXN0cyBwYXNzaW5nLiBTcGVjaWZpY2FsbHksIEkgd2FudCB0byBtYWtlIHN1cmUgdGhhdFxyXG4gICAgLy8gdGltaW5nIHZhcmlhYmxlcyByZWxhdGVkIHRvIHdhaXRpbmcgZm9yIHZvaWNpbmdNYW5hZ2VyIHRvIGJlIHJlYWR5VG9Bbm5vdW5jZSBoYXZlIGVub3VnaCB0aW1lIHRvIHJlc2V0XHJcbiAgICBzdGVwVGltZXIuZW1pdCggVElNSU5HX0JVRkZFUiAqIDMgKTtcclxuXHJcbiAgICByZXNwb25zZUNvbGxlY3Rvci5yZXNldCgpO1xyXG5cclxuICAgIC8vIGNsZWFyIHRoZSBhbGVydHMgYmVmb3JlIGVhY2ggbmV3IHRlc3RcclxuICAgIGFsZXJ0cyA9IFtdO1xyXG4gIH0sXHJcbiAgYWZ0ZXIoKSB7XHJcbiAgICBjbGVhckludGVydmFsKCBpbnRlcnZhbElEICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnV2VsY29tZSB0byBVdHRlcmFuY2VRdWV1ZVRlc3RzIScsIGFzeW5jIGFzc2VydCA9PiB7XHJcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnVXR0ZXJhbmNlUXVldWUgdGVzdHMgdGFrZSB0aW1lLCBydW4gd2l0aCA/bWFudWFsSW5wdXQgYW5kIGNsaWNrIGluIHRoZSB3aW5kb3cgYmVmb3JlIHRoZSBmaXJzdCB0ZXN0JyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAnaGFzIHZvaWNlcycsIGFzeW5jIGFzc2VydCA9PiB7XHJcbiAgY29uc3Qgdm9pY2VzID0gdGVzdFZvaWNpbmdNYW5hZ2VyLnZvaWNlc1Byb3BlcnR5LnZhbHVlO1xyXG4gIGFzc2VydC5vayggdm9pY2VzLmxlbmd0aCA+IDAsICdBdCBsZWFzdCBvbmUgdm9pY2UgZXhwZWN0ZWQgaW4gYWxsIGJyb3dzZXJzLicgKTtcclxufSApO1xyXG5cclxuUVVuaXQudGVzdCggJ3ByaW9yaXRpemUgdXR0ZXJhbmNlcyBvbiBhZGQgdG8gYmFjaycsIGFzeW5jIGFzc2VydCA9PiB7XHJcbiAgY29uc3QgdXR0ZXJhbmNlMSA9IG5ldyBVdHRlcmFuY2UoIHtcclxuICAgIGFsZXJ0OiAnMScsXHJcbiAgICBwcmlvcml0eTogNVxyXG4gIH0gKTtcclxuICBjb25zdCB1dHRlcmFuY2UyID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gICAgYWxlcnQ6ICcyJyxcclxuICAgIHByaW9yaXR5OiAxXHJcbiAgfSApO1xyXG4gIGNvbnN0IHV0dGVyYW5jZTMgPSBuZXcgVXR0ZXJhbmNlKCB7XHJcbiAgICBhbGVydDogJzMnLFxyXG4gICAgcHJpb3JpdHk6IDFcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHV0dGVyYW5jZTQgPSBuZXcgVXR0ZXJhbmNlKCB7XHJcbiAgICBhbGVydDogJzQnLFxyXG4gICAgcHJpb3JpdHk6IDEsXHJcbiAgICBhbm5vdW5jZXJPcHRpb25zOiB7XHJcbiAgICAgIGNhbmNlbE90aGVyOiBmYWxzZVxyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgdXR0ZXJhbmNlNSA9IG5ldyBVdHRlcmFuY2UoIHtcclxuICAgIGFsZXJ0OiAnNScsXHJcbiAgICBwcmlvcml0eTogMSxcclxuICAgIGFubm91bmNlck9wdGlvbnM6IHtcclxuICAgICAgY2FuY2VsT3RoZXI6IGZhbHNlXHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBzcGVlY2hTeW50aGVzaXNBbm5vdW5jZXIgPSBuZXcgU3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyKCk7XHJcbiAgc3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyLmhhc1Nwb2tlbiA9IHRydWU7IC8vIEhBWFxyXG5cclxuICBjb25zdCB1dHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggc3BlZWNoU3ludGhlc2lzQW5ub3VuY2VyICk7XHJcblxyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDAsICdub3RoaW5nIG1hbicgKTtcclxuICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZTEgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ29uZSBhZGQgdG8gYmFjaycgKTtcclxuICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZTIgKTtcclxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnb25lIGFkZCB0byBiYWNrJyApO1xyXG4gIHV0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggdXR0ZXJhbmNlMyApO1xyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDIsICdvbmUgYWRkIHRvIGJhY2snICk7XHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAwIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2UxLCAnb25lIGFkZCB0byBiYWNrJyApO1xyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMSBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlMywgJ3V0dGVyYW5jZTMgcmVtb3ZlZCB1dHRlcmFuY2UxIGJlY2F1c2UgY2FuY2VsT3RoZXI6dHJ1ZScgKTtcclxuICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZTQgKTtcclxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAzLCAnb25lIGFkZCB0byBiYWNrJyApO1xyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMCBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlMSwgJ29uZSBhZGQgdG8gYmFjaycgKTtcclxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDEgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTMsICd1dHRlcmFuY2UzIHJlbW92ZWQgdXR0ZXJhbmNlMSBiZWNhdXNlIGNhbmNlbE90aGVyOnRydWUnICk7XHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAyIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2U0LCAndXR0ZXJhbmNlNCBkb2VzIG5vdCByZW1vdmVkIHV0dGVyYW5jZTMgYmVjYXVzZSBjYW5jZWxPdGhlcjp0cnVlJyApO1xyXG5cclxuICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHV0dGVyYW5jZTUgKTtcclxuXHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gNCwgJ29uZSBhZGQgdG8gYmFjaycgKTtcclxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDAgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTEsICdvbmUgYWRkIHRvIGJhY2snICk7XHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAxIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2UzLCAndXR0ZXJhbmNlMyByZW1vdmVkIHV0dGVyYW5jZTEgYmVjYXVzZSBjYW5jZWxPdGhlcjp0cnVlJyApO1xyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMiBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlNCwgJ3V0dGVyYW5jZTQgZG9lcyBub3QgcmVtb3ZlZCB1dHRlcmFuY2UzIGJlY2F1c2UgY2FuY2VsT3RoZXI6dHJ1ZScgKTtcclxuICBhc3NlcnQub2soIHV0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDMgXS51dHRlcmFuY2UgPT09IHV0dGVyYW5jZTUsICd1dHRlcmFuY2U0IGRvZXMgbm90IHJlbW92ZWQgdXR0ZXJhbmNlMyBiZWNhdXNlIGNhbmNlbE90aGVyOnRydWUnICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFV0dGVyYW5jZVF1ZXVlLnByaW9yaXRpemVVdHRlcmFuY2VzKCkgaGFuZGxlcyBwcmlvcml0aXppbmcgdXR0ZXJhbmNlcyBiZWZvcmUgQU5EIGFmdGVyIHRoZSBjaGFuZ2VkIHV0dGVyYW5jZS4gV2Ugd2FudFxyXG4gICAqIHRvIHRlc3QgaGVyZSB0aGF0IGl0IGNhbiBoYW5kbGUgdGhhdCB3aGVuIGJvdGggbmVlZCB1cGRhdGluZyBpbiB0aGUgc2FtZSBjYWxsLiBUaHVzLCBkb24ndCBub3RpZnkgZm9yIG9uZSBjYXNlLFxyXG4gICAqIGFuZCBsZXQgdGhlIHByaW9yaXRpemF0aW9uIG9mIHRoZSBxdWV1ZSBvY2N1ciBhbGwgZHVyaW5nIG9uZSBwcmlvcml0eSBsaXN0ZW5lciBjYWxsLlxyXG4gICAqXHJcbiAgICogSEFYIGFsZXJ0IC0gcGxlYXNlIG1ha2UgdGhpcyB2YWx1ZSBiZXR3ZWVuIHRoZSB1dHRlcmFuY2U0IHZhbHVlIGJlbG93IGFuZCBhbHNvIGxvd2VyIHRoYW4gdXR0ZXJhbmNlMS5cclxuICAgKi9cclxuICAoIHV0dGVyYW5jZTUucHJpb3JpdHlQcm9wZXJ0eSBhcyB1bmtub3duIGFzIFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiApWyAnc2V0UHJvcGVydHlWYWx1ZScgXSggMyApO1xyXG4gIHV0dGVyYW5jZTQucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDI7XHJcblxyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXS5sZW5ndGggPT09IDIsICdvbmUgYWRkIHRvIGJhY2snICk7XHJcbiAgYXNzZXJ0Lm9rKCB1dHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAwIF0udXR0ZXJhbmNlID09PSB1dHRlcmFuY2UxLCAnb25lIGFkZCB0byBiYWNrJyApO1xyXG4gIGFzc2VydC5vayggdXR0ZXJhbmNlUXVldWVbICdxdWV1ZScgXVsgMSBdLnV0dGVyYW5jZSA9PT0gdXR0ZXJhbmNlNSwgJ3V0dGVyYW5jZTUga2lja2VkIHV0dGVyYW5jZTQgb3V0dGEgdGhlIHBhcmsuJyApO1xyXG59ICk7XHJcblxyXG5RVW5pdC50ZXN0KCAndXR0ZXJhbmNlLmFubm91bmNlck9wdGlvbnMudm9pY2UnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICBjb25zdCBkb25lID0gYXNzZXJ0LmFzeW5jKCk7XHJcblxyXG4gIHRlc3RWb2ljaW5nTWFuYWdlci52b2ljZVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuXHJcbiAgY29uc3Qgdm9pY2UgPSB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VzUHJvcGVydHkudmFsdWVbIDAgXTtcclxuICBjb25zdCB1dHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCB7XHJcbiAgICBhbGVydDogJ29uZScsXHJcbiAgICBhbm5vdW5jZXJPcHRpb25zOiB7XHJcbiAgICAgIHZvaWNlOiB2b2ljZVxyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgdGVzdFZvaWNpbmdNYW5hZ2VyLmVuZFNwZWFraW5nRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gbXlMaXN0ZW5lcigpIHtcclxuXHJcbiAgICBjb25zdCB4ID0gdGVzdFZvaWNpbmdNYW5hZ2VyWyAnc3BlYWtpbmdTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2VXcmFwcGVyJyBdITtcclxuICAgIGFzc2VydC5vayggeCwgJ3dlIHNob3VsZCBoYXZlIG9uZScgKTtcclxuICAgIGFzc2VydC5vayggeC5zcGVlY2hTeW50aGVzaXNVdHRlcmFuY2Uudm9pY2UgPT09IHZvaWNlLCAndm9pY2Ugc2hvdWxkIG1hdGNoIHRoZSBwcm92aWRlZCB1dHRlcmFuY2VcXCdzJyApO1xyXG4gICAgdGVzdFZvaWNpbmdNYW5hZ2VyLmVuZFNwZWFraW5nRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbXlMaXN0ZW5lciApO1xyXG4gICAgZG9uZSgpO1xyXG4gIH0gKTtcclxuICB0ZXN0Vm9pY2luZ01hbmFnZXIuc3BlYWtJZ25vcmluZ0VuYWJsZWQoIHV0dGVyYW5jZSApO1xyXG5cclxuICB0ZXN0Vm9pY2luZ01hbmFnZXIudm9pY2VQcm9wZXJ0eS52YWx1ZSA9IHZvaWNlO1xyXG59ICk7XHJcblxyXG5pZiAoIHF1ZXJ5UGFyYW1ldGVycy5tYW51YWxJbnB1dCApIHtcclxuXHJcbiAgUVVuaXQudGVzdCggJ0Jhc2ljIFV0dGVyYW5jZVF1ZXVlIHRlc3QnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIC8vIGJhc2ljIHRlc3QsIHdlIHNob3VsZCBoZWFyIGFsbCB0aHJlZSBVdHRlcmFuY2VzXHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSArIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgKyB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgKyBUSU1JTkdfQlVGRkVSICogMyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHMubGVuZ3RoID09PSAzLCAnVGhyZWUgYmFzaWMgVXR0ZXJhbmNlcyB3ZW50IHRocm91Z2ggdGhlIHF1ZXVlJyApO1xyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ2NhbmNlbFV0dGVyYW5jZSB0ZXN0cycsIGFzeW5jIGFzc2VydCA9PiB7XHJcblxyXG4gICAgLy8gVGVzdCB0aGF0IGNhbmNlbFV0dGVyYW5jZSB3aWxsIG5vdCBpbnRyb2R1Y2UgYSBtZW1vcnkgbGVhayB3aXRoIG11bHRpcGxlIGxpc3RlbmVycyBvbiB0aGUgUHJvcGVydHlcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5jYW5jZWxVdHRlcmFuY2UoIGZpcnN0VXR0ZXJhbmNlICk7XHJcblxyXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgd2UgaGFuZGxlIHRoZSBgZW5kYCBldmVudCBoYXBwZW5pbmcgYXN5bmNocm9ub3VzbHkgZnJvbSB0aGUgY2FuY2VsLCB0aGlzIHNob3VsZCBub3QgY3Jhc2hcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSB3YXMgY2FuY2VsbGVkJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAxLCAnVGhlcmUgaXMgb25lIFV0dGVyYW5jZSBpbiB0aGUgcXVldWUnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnUHJpb3JpdHlQcm9wZXJ0eSBpbnRlcnJ1cHRpb24nLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIC8vIEFkZCBhbGwgMyB0byBiYWNrXHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMywgJ0FsbCB0aHJlZSB1dHRlcmFuY2VzIGluIHRoZSBxdWV1ZScgKTtcclxuXHJcbiAgICAvLyBtYWtlIHRoZSB0aGlyZCBVdHRlcmFuY2UgaGlnaCBwcmlvcml0eSwgaXQgc2hvdWxkIHJlbW92ZSB0aGUgb3RoZXIgdHdvIFV0dGVyYW5jZXNcclxuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAxLCAnT25seSB0aGUgb25lIFV0dGVyYW5jZSByZW1haW5zJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF1bIDAgXS51dHRlcmFuY2UgPT09IHRoaXJkVXR0ZXJhbmNlLCAnT25seSB0aGUgdGhpcmQgVXR0ZXJhbmNlIHJlbWFpbnMnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnQW5ub3VuY2VkIFV0dGVyYW5jZSBjYW4gYWxzbyBiZSBpbiBxdWV1ZSBhbmQgaW50ZXJydXB0aW9uIGR1cmluZyBhbm5vdW5jZW1lbnQnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIC8vIHdoaWxlIGFuIFV0dGVyYW5jZSBpcyBiZWluZyBhbm5vdW5jZWQsIG1ha2Ugc3VyZSB0aGF0IHdlIGNhbiBhZGQgdGhlIHNhbWUgVXR0ZXJhbmNlIHRvIHRoZSBxdWV1ZSBhbmQgdGhhdFxyXG4gICAgLy8gcHJpb3JpdHlQcm9wZXJ0eSBpcyBzdGlsbCBvYnNlcnZlZFxyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSApOyAvLyBUaW1lIHRvIGdldCBoYWxmd2F5IHRocm91Z2ggc2Vjb25kIGFubm91bmNlbWVudCBvZiBmaXJzdFV0dGVyYW5jZVxyXG5cclxuICAgIC8vIHJlZHVjZSBwcmlvcml0eVByb3BlcnR5IG9mIGZpcnN0VXR0ZXJhbmNlIHdoaWxlIGl0IGlzIGJlaW5nIGFubm91bmNlZCwgc2Vjb25kVXR0ZXJhbmNlIHNob3VsZCBpbnRlcnJ1cHRcclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAwO1xyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclNlY29uZFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gc2Vjb25kVXR0ZXJhbmNlLCAnVXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCBzdGlsbCBvYnNlcnZlcyBwcmlvcml0eVByb3BlcnR5JyApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAwLCAncXVldWUgZW1wdHkgYWZ0ZXIgaW50ZXJydXB0aW9uIGFuZCBzZW5kaW5nIHNlY29uZFV0dGVyYW5jZSB0byBBbm5vdW5jZXInICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnSGlnaGVyIHByaW9yaXR5IHJlbW92ZXMgZWFybGllciBVdHRlcmFuY2VzIGZyb20gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIC8vIFVuaXQgdGVzdCBjYXNlcyB0YWtlbiBmcm9tIGV4YW1wbGVzIHRoYXQgZGVtb25zdHJhdGVkIHRoZSBwcmlvcml0eVByb3BlcnR5IGZlYXR1cmUgaW5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzUwXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEFkZCBhbGwgMyB0byBiYWNrXHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAzLCAnQWxsIHRocmVlIHV0dGVyYW5jZXMgaW4gdGhlIHF1ZXVlJyApO1xyXG5cclxuICAgIHNlY29uZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMjtcclxuXHJcbiAgICAvLyBlbm91Z2ggdGltZSBmb3IgdGhlIHNlY29uZFV0dGVyYW5jZSB0byBzdGFydCBzcGVha2luZyB3aGlsZSB0aGUgZmlyc3RVdHRlcmFuY2Ugd2FzIGp1c3QgcmVtb3ZlZCBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclNlY29uZFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gc2Vjb25kVXR0ZXJhbmNlLCAnVGhlIHNlY29uZFV0dGVyYW5jZSBpbnRlcnJ1cHRlZCB0aGUgZmlyc3RVdHRlcmFuY2UgYmVjYXVzZSBpdCBpcyBoaWdoZXIgcHJpb3JpdHkuJyApO1xyXG5cclxuICAgIC8vIGVub3VnaCB0aW1lIHRvIGZpbmlzaCB0aGUgc2Vjb25kVXR0ZXJhbmNlIGFuZCBzdGFydCBzcGVha2luZyB0aGUgdGhpcmRVdHRlcmFuY2VcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JTZWNvbmRVdHRlcmFuY2UgLyAyICsgdGltZUZvclRoaXJkVXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gc2Vjb25kVXR0ZXJhbmNlLCAnc2Vjb25kVXR0ZXJhbmNlIHNwb2tlbiBpbiBmdWxsJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIHNwb2tlbiBhZnRlciBzZWNvbmRVdHRlcmFuY2UgZmluaXNoZWQnICk7XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ1V0dGVyYW5jZSByZW1vdmVkIGJlY2F1c2Ugb2Ygc2VsZiBwcmlvcml0eSByZWR1Y3Rpb24gYmVmb3JlIGFub3RoZXIgaXMgYWRkZWQgdG8gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxMDtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG5cclxuICAgIC8vIHJlZHVjZSBwcmlvcml0eVByb3BlcnR5IGJlZm9yZSBhZGRpbmcgdGhpcmRVdHRlcmFuY2UgdG8gcXVldWVcclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAwO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgLy8gZW5vdWdoIHRpbWUgdG8gc3RhcnQgc3BlYWtpbmcgZWl0aGVyIHRoZSBmaXJzdCBvciB0aGlyZCBVdHRlcmFuY2VzXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2Ugc3Bva2VuIGJlY2F1c2UgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eSB3YXMgcmVkdWNlZCBiZWZvcmUgYWRkaW5nIHRoaXJkVXR0ZXJhbmNlIHRvIHRoZSBxdWV1ZScgKTtcclxuICB9ICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdVdHRlcmFuY2UgcmVtb3ZlZCBiZWNhdXNlIG9mIHNlbGYgcHJpb3JpdHkgcmVkdWN0aW9uIGFmdGVyIGFub3RoZXIgaXMgYWRkZWQgdG8gcXVldWUnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxMDtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG5cclxuICAgIC8vIHJlZHVjZSBwcmlvcml0eVByb3BlcnR5IEFGVEVSIGFkZGluZyB0aGlyZFV0dGVyYW5jZSB0byBxdWV1ZVxyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMDtcclxuXHJcbiAgICAvLyBlbm91Z2ggdGltZSB0byBzdGFydCBzcGVha2luZyBlaXRoZXIgdGhlIGZpcnN0IG9yIHRoaXJkIFV0dGVyYW5jZXNcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSBzcG9rZW4gYmVjYXVzZSBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5IHdhcyByZWR1Y2VkIGFmdGVyIGFkZGluZyB0aGlyZFV0dGVyYW5jZSB0byB0aGUgcXVldWUnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIGludGVycnVwdGlvbiBiZWNhdXNlIHNlbGYgcHJpb3JpdHkgcmVkdWNlZCB3aGlsZSBiZWluZyBhbm5vdW5jZWQnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxMDtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSApO1xyXG5cclxuICAgIC8vIHJlZHVjaW5nIHByaW9yaXR5IGJlbG93IHRoaXJkIHV0dGVyYW5jZSBzaG91bGQgaW50ZXJydXB0IGZpcnN0VXR0ZXJhbmNlIGZvciB0aGlyZFV0dGVyYW5jZVxyXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcblxyXG4gICAgLy8gbm90IGVub3VnaCB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSB0byBmaW5pc2ggaW4gZnVsbCwgYnV0IGVub3VnaCB0aW1lIHRvIHZlcmlmeSB0aGF0IGl0IHdhcyBpbnRlcnJ1cHRlZFxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gNCApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSB3YXMgaW50ZXJydXB0ZWQgYmVjYXVzZSBpdHMgcHJpb3JpdHkgd2FzIHJlZHVjZWQgd2hpbGUgaXQgd2FzIGJlaW5nIGFubm91bmNlZCcgKTtcclxuXHJcbiAgICAvLyBlbm91Z2ggdGltZSBmb3IgdGhpcmRVdHRlcmFuY2UgdG8gc3RhcnQgc3BlYWtpbmdcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSBiZWluZyBhbm5vdW5jZWQgYWZ0ZXIgaW50ZXJydXB0aW5nIGZpcnN0VXR0ZXJhbmNlJyApO1xyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ1V0dGVyYW5jZSBpbnRlcnJ1cHRpb24gZHVyaW5nIGFubm91bWNlbWVudCBiZWNhdXNlIGFub3RoZXIgaW4gdGhlIHF1ZXVlIG1hZGUgaGlnaGVyIHByaW9yaXR5JywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuXHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAwO1xyXG5cclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0VXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCcgKTtcclxuXHJcbiAgICAvLyBpbmNyZWFzaW5nIHByaW9yaXR5IG9mIHRoaXJkVXR0ZXJhbmNlIGluIHRoZSBxdWV1ZSBzaG91bGQgaW50ZXJydXB0IGZpcnN0VXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZFxyXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDM7XHJcblxyXG4gICAgLy8gbm90IGVub3VnaCB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSB0byBmaW5pc2gsIGJ1dCBlbm91Z2ggdG8gbWFrZSBzdXJlIHRoYXQgaXQgd2FzIGludGVycnVwdGVkXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyA0ICk7XHJcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0VXR0ZXJhbmNlIHdhcyBpbnRlcnJ1cHRlZCBiZWNhdXNlIGFuIFV0dGVyYW5jZSBpbiB0aGUgcXVldWUgd2FzIG1hZGUgaGlnaGVyIHByaW9yaXR5JyApO1xyXG5cclxuICAgIC8vIGVub3VnaCB0aW1lIGZvciB0aGlyZFV0dGVyYW5jZSB0byBzdGFydCBzcGVha2luZ1xyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclRoaXJkVXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIGJlaW5nIGFubm91bmNlZCBhZnRlciBpbnRlcnJ1cHRpbmcgZmlyc3RVdHRlcmFuY2UnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnVXR0ZXJhbmNlIE5PVCBpbnRlcnJ1cHRlZCBiZWNhdXNlIHNlbGYgcHJpb3JpdHkgc3RpbGwgcmVsYXRpdmVseSBoaWdoZXInLCBhc3luYyBhc3NlcnQgPT4ge1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxMDtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXJkVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG5cclxuICAgIC8vIHdlIHNob3VsZCBzdGlsbCBoZWFyIGJvdGggVXR0ZXJhbmNlcyBpbiBmdWxsLCBuZXcgcHJpb3JpdHkgZm9yIGZpcnN0VXR0ZXJhbmNlIGlzIGhpZ2hlciB0aGFuIHRoaXJkVXR0ZXJhbmNlXHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gNTtcclxuXHJcbiAgICAvLyBub3QgZW5vdWdoIHRpbWUgZm9yIGZpcnN0VXR0ZXJhbmNlIHRvIGZpbmlzaCwgYnV0IGVub3VnaCB0byBtYWtlIHN1cmUgdGhhdCBpdCB3YXMgbm90IGludGVycnVwdGVkXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAxMCApO1xyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHMubGVuZ3RoID09PSAwLCAnZmlyc3RVdHRlcmFuY2Ugd2FzIG5vdCBpbnRlcnJ1cHRlZCBiZWNhdXNlIHByaW9yaXR5IHdhcyBzZXQgdG8gYSB2YWx1ZSBoaWdoZXIgdGhhbiBuZXh0IHV0dGVyYW5jZSBpbiBxdWV1ZScgKTtcclxuXHJcbiAgICAvLyBlbm91Z2ggdGltZSBmb3IgdGhpcmRVdHRlcmFuY2UgdG8gc3RhcnQgc3BlYWtpbmcgYWZ0ZXIgZmlyc3RVdHRlcmFuY2UgZmluaXNoZXNcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKyB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0VXR0ZXJhbmNlIGZpbmlzaGVkIGJlaW5nIGFubm91bmNlZCcgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSBiZWluZyBhbm5vdW5jZWQgYWZ0ZXIgd2FpdGluZyBmb3IgZmlyc3RVdHRlcmFuY2UnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnYW5ub3VuY2VJbW1lZGlhdGVseScsIGFzeW5jIGFzc2VydCA9PiB7XHJcblxyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAwLCAnYW5ub3VuY2VJbW1lZGlhdGVseSBzaG91bGQgYmUgc3luY2hyb25vdXMgd2l0aCB2b2ljaW5nTWFuYWdlciBmb3IgYW4gZW1wdHkgcXVldWUnICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0IHV0dGVyYW5jZSBzcG9rZW4gaW1tZWRpYXRlbHknICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnYW5ub3VuY2VJbW1lZGlhdGVseSByZWR1Y2VzIGR1cGxpY2F0ZSBVdHRlcmFuY2VzIGluIHF1ZXVlJywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuXHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIC8vIG5vdyBzcGVhayB0aGUgZmlyc3QgdXR0ZXJhbmNlIGltbWVkaWF0ZWx5XHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIGZpcnN0VXR0ZXJhbmNlICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnYW5ub3VuY2luZyBmaXJzdFV0dGVyYW5jZSBpbW1lZGlhdGVseSBzaG91bGQgcmVtb3ZlIHRoZSBkdXBsaWNhdGUgZmlyc3RVdHRlcmFuY2UgaW4gdGhlIHF1ZXVlJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0IHV0dGVyYW5jZSBpcyBiZWluZyBzcG9rZW4gYWZ0ZXIgYW5ub3VuY2VJbW1lZGlhdGVseScgKTtcclxuICB9ICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdhbm5vdW5jZUltbWVkaWF0ZWx5IGRvZXMgbm90aGluZyB3aGVuIFV0dGVyYW5jZSBoYXMgbG93IHByaW9yaXR5IHJlbGF0aXZlIHRvIHF1ZXVlZCBVdHRlcmFuY2VzJywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFubm91bmNlSW1tZWRpYXRlbHkoIHRoaXJkVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgLy8gdGhpcmRVdHRlcmFuY2UgaXMgbG93ZXIgcHJpb3JpdHkgdGhhbiBuZXh0IGl0ZW0gaW4gdGhlIHF1ZXVlLCBpdCBzaG91bGQgbm90IGJlIHNwb2tlbiBhbmQgc2hvdWxkIG5vdCBiZVxyXG4gICAgLy8gaW4gdGhlIHF1ZXVlIGF0IGFsbFxyXG4gICAgYXNzZXJ0Lm9rKCB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlWyAncXVldWUnIF0ubGVuZ3RoID09PSAyLCAnb25seSBmaXJzdCBhbmQgc2Vjb25kIHV0dGVyYW5jZXMgaW4gdGhlIHF1ZXVlJyApO1xyXG4gICAgYXNzZXJ0Lm9rKCAhdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5oYXNVdHRlcmFuY2UoIHRoaXJkVXR0ZXJhbmNlICksICd0aGlyZFV0dGVyYW5jZSBub3QgaW4gcXVldWUgYWZ0ZXIgYW5ub3VuY2VJbW1lZGlhdGVseScgKTtcclxuXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IGZpcnN0VXR0ZXJhbmNlICk7XHJcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdICE9PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkVXR0ZXJhbmNlIHdhcyBub3Qgc3Bva2VuIHdpdGggYW5ub3VuY2VJbW1lZGlhdGVseScgKTtcclxuICB9ICk7XHJcblxyXG4gIFFVbml0LnRlc3QoICdhbm91bmNlSW1tZWRpYXRlbGV0eSBkb2VzIG5vdGhpbmcgd2hlbiBVdHRlcmFuY2UgaGFzIGxvdyBwcmlvcml0eSByZWxhdGl2ZSB0byBhbm5vdW5jaW5nIFV0dGVyYW5jZScsIGFzeW5jIGFzc2VydCA9PiB7XHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcclxuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG5cclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIC8vIHRoaXJkVXR0ZXJhbmNlIGlzIGxvd2VyIHByaW9yaXR5IHRoYW4gd2hhdCBpcyBjdXJyZW50bHkgYmVpbmcgc3Bva2VuIHNvIGl0IHNob3VsZCBOT1QgYmUgaGVhcmRcclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKTsgLy8gbGVzcyB0aGFuIHJlbWFpbmluZyB0aW1lIGZvciBmaXJzdFV0dGVyYW5jZSBjaGVja2luZyBmb3IgaW50ZXJydXB0aW9uXHJcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgIT09IHRoaXJkVXR0ZXJhbmNlLCAnYW5ub3VuY2VJbW1lZGlhdGVseSBzaG91bGQgbm90IGludGVycnVwdCBhIGhpZ2hlciBwcmlvcml0eSB1dHRlcmFuY2UnICk7XHJcbiAgICBhc3NlcnQub2soICF0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmhhc1V0dGVyYW5jZSggdGhpcmRVdHRlcmFuY2UgKSwgJ2xvd2VyIHByaW9yaXR5IHRoaXJkVXR0ZXJhbmNlIHNob3VsZCBiZSBkcm9wcGVkIGZyb20gdGhlIHF1ZXVlJyApO1xyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ1V0dGVyYW5jZSBzcG9rZW4gd2l0aCBhbm5vdW5jZUltbWVkaWF0ZWx5IHNob3VsZCBiZSBpbnRlcnJ1cHRlZCBpZiBwcmlvcml0eSBpcyByZWR1Y2VkJywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBUaGUgVXR0ZXJhbmNlIHNwb2tlbiB3aXRoIGFubm91bmNlSW1tZWRpYXRlbHkgc2hvdWxkIGJlIGludGVycnVwdGVkIGlmIGl0cyBwcmlvcml0eSBpcyByZWR1Y2VkXHJcbiAgICAvLyBiZWxvdyBhbm90aGVyIGl0ZW0gaW4gdGhlIHF1ZXVlXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMjtcclxuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG5cclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gdGhpcmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSBpcyBhbm5vdW5jZWQgaW1tZWRpYXRlbHknICk7XHJcblxyXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcblxyXG4gICAgLy8gdGhlIHByaW9yaXR5IG9mIHRoZSB0aGlyZFV0dGVyYW5jZSBpcyByZWR1Y2VkIHdoaWxlIGJlaW5nIHNwb2tlbiBmcm9tIGFubm91bmNlSW1tZWRpYXRlbHksIGl0IHNob3VsZCBiZVxyXG4gICAgLy8gaW50ZXJydXB0ZWQgYW5kIHRoZSBuZXh0IGl0ZW0gaW4gdGhlIHF1ZXVlIHNob3VsZCBiZSBzcG9rZW5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JUaGlyZFV0dGVyYW5jZSAvIDQgKTsgLy8gbGVzcyB0aGFuIHRoZSByZW1haW5pbmcgdGltZSBmb3IgdGhpcmQgdXR0ZXJhbmNlIGZvciBpbnRlcnJ1cHRpb25cclxuICAgIGFzc2VydC5vayggYWxlcnRzWyAwIF0gPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmQgdXR0ZXJhbmNlIHdhcyBpbnRlcnJ1cHRlZCBieSByZWR1Y2luZyBpdHMgcHJpb3JpdHknICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ21vdmVkIG9uIHRvIG5leHQgdXR0ZXJhbmNlIGluIHF1ZXVlJyApO1xyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ1V0dGVyYW5jZSBzcG9rZW4gYnkgYW5ub3VuY2VJbW1lZGlhdGVseSBpcyBpbnRlcnJ1cHRlZCBieSByYWlzaW5nIHByaW9yaXR5IG9mIHF1ZXVlZCB1dHRlcmFuY2UnLCBhc3luYyBhc3NlcnQgPT4ge1xyXG4gICAgZmlyc3RVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcbiAgICB0aGlyZFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcclxuXHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggZmlyc3RVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBzZWNvbmRVdHRlcmFuY2UgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYW5ub3VuY2VJbW1lZGlhdGVseSggdGhpcmRVdHRlcmFuY2UgKTtcclxuXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2UgaXMgYW5ub3VuY2VkIGltbWVkaWF0ZWx5JyApO1xyXG5cclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG5cclxuICAgIC8vIHRoZSBwcmlvcml0eSBvZiBmaXJzdFV0dGVyYW5jZSBpcyBpbmNyZWFzZWQgc28gdGhlIHV0dGVyYW5jZSBvZiBhbm5vdW5jZUltbWVkaWF0ZWx5IHNob3VsZCBiZSBpbnRlcnJ1cHRlZFxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvclRoaXJkVXR0ZXJhbmNlIC8gNCApOyAvLyBsZXNzIHRoYW4gcmVtYWluaW5nIHRpbWUgZm9yIHRoaXJkIHV0dGVyYW5jZSBmb3IgaW50ZXJydXB0aW9uXHJcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdID09PSB0aGlyZFV0dGVyYW5jZSwgJ3RoaXJkIHV0dGVyYW5jZSB3YXMgaW50ZXJydXB0ZWQgYnkgdGhlIG5leHQgVXR0ZXJhbmNlIGluY3JlYXNpbmcgcHJpb3JpdHknICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgYXNzZXJ0Lm9rKCBnZXRTcGVha2luZ1V0dGVyYW5jZSgpID09PSBmaXJzdFV0dGVyYW5jZSwgJ21vdmVkIG9uIHRvIGhpZ2hlciBwcmlvcml0eSB1dHRlcmFuY2UgaW4gcXVldWUnICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC50ZXN0KCAnYW5ub3VuY2VJbW1lZGlhdGVseSBpbnRlcnJ1cHRzIGFub3RoZXIgVXR0ZXJhbmNlIGlmIG5ldyBVdHRlcmFuY2UgaXMgaGlnaCBwcmlvcml0eScsIGFzeW5jIGFzc2VydCA9PiB7XHJcbiAgICBmaXJzdFV0dGVyYW5jZS5wcmlvcml0eVByb3BlcnR5LnZhbHVlID0gMTtcclxuICAgIHRoaXJkVXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAyO1xyXG5cclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYWRkVG9CYWNrKCBmaXJzdFV0dGVyYW5jZSApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHNlY29uZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDIgKTtcclxuICAgIHRlc3RWb2ljaW5nVXR0ZXJhbmNlUXVldWUuYW5ub3VuY2VJbW1lZGlhdGVseSggdGhpcmRVdHRlcmFuY2UgKTtcclxuXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yRmlyc3RVdHRlcmFuY2UgLyA0ICk7IC8vIHNob3VsZCBub3QgYmUgZW5vdWdoIHRpbWUgZm9yIGZpcnN0VXR0ZXJhbmNlIHRvIGZpbmlzaFxyXG4gICAgYXNzZXJ0Lm9rKCBhbGVydHNbIDAgXSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSBpbnRlcnJ1cHRlZCBiZWNhdXNlIGl0IGhhZCBsb3dlciBwcmlvcml0eScgKTtcclxuXHJcbiAgICBhd2FpdCB0aW1lb3V0KCB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGdldFNwZWFraW5nVXR0ZXJhbmNlKCkgPT09IHRoaXJkVXR0ZXJhbmNlLCAndGhpcmRVdHRlcmFuY2Ugc3Bva2VuIGltbWVkaWF0ZWx5JyApO1xyXG4gIH0gKTtcclxuXHJcbiAgUVVuaXQudGVzdCggJ2Fubm91bmNlSW1tZWRpYXRlbHkgd2lsbCBub3QgaW50ZXJydXB0IFV0dGVyYW5jZSBvZiBlcXVhbCBvciBsZXNzZXIgcHJpb3JpdHkgJywgYXN5bmMgYXNzZXJ0ID0+IHtcclxuICAgIGZpcnN0VXR0ZXJhbmNlLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPSAxO1xyXG4gICAgdGhpcmRVdHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZSA9IDE7XHJcblxyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIGZpcnN0VXR0ZXJhbmNlICk7XHJcbiAgICB0ZXN0Vm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmFkZFRvQmFjayggc2Vjb25kVXR0ZXJhbmNlICk7XHJcblxyXG4gICAgYXdhaXQgdGltZW91dCggdGltZUZvckZpcnN0VXR0ZXJhbmNlIC8gMiApO1xyXG4gICAgdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5hbm5vdW5jZUltbWVkaWF0ZWx5KCB0aGlyZFV0dGVyYW5jZSApO1xyXG5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKTtcclxuICAgIGFzc2VydC5vayggZ2V0U3BlYWtpbmdVdHRlcmFuY2UoKSA9PT0gZmlyc3RVdHRlcmFuY2UsICdmaXJzdFV0dGVyYW5jZSBub3QgaW50ZXJydXB0ZWQsIGl0IGhhcyBlcXVhbCBwcmlvcml0eScgKTtcclxuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdWyAwIF0udXR0ZXJhbmNlID09PSBzZWNvbmRVdHRlcmFuY2UsICd0aGlyZFV0dGVyYW5jZSB3YXMgYWRkZWQgdG8gdGhlIGZyb250IG9mIHRoZSBxdWV1ZScgKTtcclxuICAgIGFzc2VydC5vayggdGVzdFZvaWNpbmdVdHRlcmFuY2VRdWV1ZVsgJ3F1ZXVlJyBdLmxlbmd0aCA9PT0gMSwgJ3RoaXJkVXR0ZXJhbmNlIHdhcyBub3QgYWRkZWQgdG8gcXVldWUgYW5kIHdpbGwgbmV2ZXIgYmUgYW5ub3VuY2VkJyApO1xyXG5cclxuICAgIGF3YWl0IHRpbWVvdXQoIHRpbWVGb3JGaXJzdFV0dGVyYW5jZSAvIDQgKyB0aW1lRm9yVGhpcmRVdHRlcmFuY2UgLyAyICk7XHJcbiAgICBhc3NlcnQub2soIGFsZXJ0c1sgMCBdID09PSBmaXJzdFV0dGVyYW5jZSwgJ2ZpcnN0VXR0ZXJhbmNlIHNwb2tlbiBpbiBmdWxsJyApO1xyXG4gIH0gKTtcclxufVxyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sNEJBQTRCO0FBRWxELFNBQVNDLE9BQU8sRUFBRUMsY0FBYyxRQUFRLDZCQUE2QjtBQUNyRSxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsU0FBUyxNQUFNLGdCQUFnQjtBQUN0QyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLHdCQUF3QixNQUFNLCtCQUErQjtBQUVwRSxNQUFNQyxlQUFlLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7RUFDakRDLFdBQVcsRUFBRTtJQUNYQyxJQUFJLEVBQUU7RUFDUjtBQUNGLENBQUUsQ0FBQzs7QUFFSDtBQUNBO0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsR0FBRzs7QUFFdEM7QUFDQSxNQUFNQyxhQUFhLEdBQUdELDBCQUEwQixHQUFHLEVBQUU7O0FBRXJEO0FBQ0EsTUFBTUUsa0JBQWtCLEdBQUcsSUFBSVosY0FBYyxDQUFDYSxXQUFXLENBQUMsQ0FBQztBQUMzRCxNQUFNQyx5QkFBeUIsR0FBRyxJQUFJWCxjQUFjLENBQUVTLGtCQUFtQixDQUFDO0FBRTFFLE1BQU1HLGVBQWUsR0FBRyxNQUFBQSxDQUFBLEtBQVk7RUFDbEMsT0FBTyxJQUFJQyxPQUFPLENBQVFDLE9BQU8sSUFBSTtJQUNuQyxNQUFNQyxLQUFLLEdBQUdBLENBQUEsS0FBTTtNQUNsQk4sa0JBQWtCLENBQUNPLGFBQWEsQ0FB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