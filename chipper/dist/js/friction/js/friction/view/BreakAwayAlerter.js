// Copyright 2018-2023, University of Colorado Boulder

/**
 * Describer responsible for handling the appropriate alert when atoms shear off, or "break away" from the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import AriaLiveAnnouncer from '../../../../utterance-queue/js/AriaLiveAnnouncer.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const capitalizedVeryHotString = FrictionStrings.a11y.temperature.capitalizedVeryHot;
const breakAwaySentenceFirstString = FrictionStrings.a11y.breakAwaySentenceFirst;
const breakAwaySentenceAgainString = FrictionStrings.a11y.breakAwaySentenceAgain;
const breakAwayNoneLeftString = FrictionStrings.a11y.breakAwayNoneLeft;

// break away sentences
const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn(breakAwaySentenceFirstString, {
  temp: capitalizedVeryHotString
});
const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn(breakAwaySentenceAgainString, {
  temp: capitalizedVeryHotString
});
const BREAK_AWAY_NONE_LEFT = StringUtils.fillIn(breakAwayNoneLeftString, {
  temp: capitalizedVeryHotString
});

// time in between "break away sessions". This is the minimum amount of time to wait before hearing a subsequent break
// away alert
const ALERT_TIME_DELAY = 2000;
const SHEARING_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.shearingLimit;
class BreakAwayAlerter extends Alerter {
  /**
   * Responsible for alerting when the temperature increases
   * @param {NumberProperty} vibrationAmplitudeProperty
   * @param {NumberProperty} numberOfAtomsShearedOffProperty
   * @param {Object} [options]
   */
  constructor(vibrationAmplitudeProperty, numberOfAtomsShearedOffProperty, options) {
    super(options);

    // @private
    this.vibrationAmplitudeProperty = vibrationAmplitudeProperty;
    this.numberOfAtomsShearedOffProperty = numberOfAtomsShearedOffProperty;

    // @private - (a11y) true if there has already been an alert about atoms breaking away
    this.alertedBreakAwayProperty = new BooleanProperty(false);

    // @private
    this.tooSoonForNextAlert = false;

    // @private
    this.utterance = new Utterance({
      alert: new ResponsePacket(),
      priority: Utterance.HIGH_PRIORITY,
      announcerOptions: {
        ariaLivePriority: AriaLiveAnnouncer.AriaLive.ASSERTIVE
      }
    });

    // @private
    this.amplitudeListener = (amplitude, oldAmplitude) => {
      // Handle the alert when amplitude is high enough to begin shearing
      if (!this.tooSoonForNextAlert &&
      // alert only separate "break away events"
      amplitude > SHEARING_LIMIT && oldAmplitude < SHEARING_LIMIT) {
        // just hit shearing limit
        this.alertAtShearingThreshold();
      }
    };

    // exists for the lifetime of the sim, no need to dispose
    this.vibrationAmplitudeProperty.link(this.amplitudeListener);
  }

  /**
   * Alert when the temperature has just reached the point where atoms begin to break away
   * @public
   */
  alertAtShearingThreshold() {
    let alertContent = null;

    // If there aren't any more atoms to break away, but don't let this be the first alert we hear
    if (this.alertedBreakAwayProperty.value && this.numberOfAtomsShearedOffProperty.value >= FrictionModel.NUMBER_OF_SHEARABLE_ATOMS) {
      alertContent = BREAK_AWAY_NONE_LEFT;
    } else {
      alertContent = this.alertedBreakAwayProperty.value ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST;
    }
    this.utterance.alert.contextResponse = alertContent;
    this.alert(this.utterance);
    this.alertedBreakAwayProperty.value = true;
    this.tooSoonForNextAlert = true;
    stepTimer.setTimeout(() => {
      this.tooSoonForNextAlert = false;
    }, ALERT_TIME_DELAY);
  }

  /**
   * @public
   */
  reset() {
    this.alertedBreakAwayProperty.reset(); // get the "first time" break away alert on reset
  }
}

friction.register('BreakAwayAlerter', BreakAwayAlerter);
export default BreakAwayAlerter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJzdGVwVGltZXIiLCJTdHJpbmdVdGlscyIsIkFsZXJ0ZXIiLCJBcmlhTGl2ZUFubm91bmNlciIsIlJlc3BvbnNlUGFja2V0IiwiVXR0ZXJhbmNlIiwiZnJpY3Rpb24iLCJGcmljdGlvblN0cmluZ3MiLCJGcmljdGlvbk1vZGVsIiwiY2FwaXRhbGl6ZWRWZXJ5SG90U3RyaW5nIiwiYTExeSIsInRlbXBlcmF0dXJlIiwiY2FwaXRhbGl6ZWRWZXJ5SG90IiwiYnJlYWtBd2F5U2VudGVuY2VGaXJzdFN0cmluZyIsImJyZWFrQXdheVNlbnRlbmNlRmlyc3QiLCJicmVha0F3YXlTZW50ZW5jZUFnYWluU3RyaW5nIiwiYnJlYWtBd2F5U2VudGVuY2VBZ2FpbiIsImJyZWFrQXdheU5vbmVMZWZ0U3RyaW5nIiwiYnJlYWtBd2F5Tm9uZUxlZnQiLCJCUkVBS19BV0FZX1RIUkVTSE9MRF9GSVJTVCIsImZpbGxJbiIsInRlbXAiLCJCUkVBS19BV0FZX1RIUkVTSE9MRF9BR0FJTiIsIkJSRUFLX0FXQVlfTk9ORV9MRUZUIiwiQUxFUlRfVElNRV9ERUxBWSIsIlNIRUFSSU5HX0xJTUlUIiwiTUFHTklGSUVEX0FUT01TX0lORk8iLCJzaGVhcmluZ0xpbWl0IiwiQnJlYWtBd2F5QWxlcnRlciIsImNvbnN0cnVjdG9yIiwidmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkiLCJudW1iZXJPZkF0b21zU2hlYXJlZE9mZlByb3BlcnR5Iiwib3B0aW9ucyIsImFsZXJ0ZWRCcmVha0F3YXlQcm9wZXJ0eSIsInRvb1Nvb25Gb3JOZXh0QWxlcnQiLCJ1dHRlcmFuY2UiLCJhbGVydCIsInByaW9yaXR5IiwiSElHSF9QUklPUklUWSIsImFubm91bmNlck9wdGlvbnMiLCJhcmlhTGl2ZVByaW9yaXR5IiwiQXJpYUxpdmUiLCJBU1NFUlRJVkUiLCJhbXBsaXR1ZGVMaXN0ZW5lciIsImFtcGxpdHVkZSIsIm9sZEFtcGxpdHVkZSIsImFsZXJ0QXRTaGVhcmluZ1RocmVzaG9sZCIsImxpbmsiLCJhbGVydENvbnRlbnQiLCJ2YWx1ZSIsIk5VTUJFUl9PRl9TSEVBUkFCTEVfQVRPTVMiLCJjb250ZXh0UmVzcG9uc2UiLCJzZXRUaW1lb3V0IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJyZWFrQXdheUFsZXJ0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVzY3JpYmVyIHJlc3BvbnNpYmxlIGZvciBoYW5kbGluZyB0aGUgYXBwcm9wcmlhdGUgYWxlcnQgd2hlbiBhdG9tcyBzaGVhciBvZmYsIG9yIFwiYnJlYWsgYXdheVwiIGZyb20gdGhlIHRvcCBib29rLlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEFsZXJ0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2FjY2Vzc2liaWxpdHkvZGVzY3JpYmVycy9BbGVydGVyLmpzJztcclxuaW1wb3J0IEFyaWFMaXZlQW5ub3VuY2VyIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9BcmlhTGl2ZUFubm91bmNlci5qcyc7XHJcbmltcG9ydCBSZXNwb25zZVBhY2tldCBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgZnJpY3Rpb24gZnJvbSAnLi4vLi4vZnJpY3Rpb24uanMnO1xyXG5pbXBvcnQgRnJpY3Rpb25TdHJpbmdzIGZyb20gJy4uLy4uL0ZyaWN0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBGcmljdGlvbk1vZGVsIGZyb20gJy4uL21vZGVsL0ZyaWN0aW9uTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IGNhcGl0YWxpemVkVmVyeUhvdFN0cmluZyA9IEZyaWN0aW9uU3RyaW5ncy5hMTF5LnRlbXBlcmF0dXJlLmNhcGl0YWxpemVkVmVyeUhvdDtcclxuY29uc3QgYnJlYWtBd2F5U2VudGVuY2VGaXJzdFN0cmluZyA9IEZyaWN0aW9uU3RyaW5ncy5hMTF5LmJyZWFrQXdheVNlbnRlbmNlRmlyc3Q7XHJcbmNvbnN0IGJyZWFrQXdheVNlbnRlbmNlQWdhaW5TdHJpbmcgPSBGcmljdGlvblN0cmluZ3MuYTExeS5icmVha0F3YXlTZW50ZW5jZUFnYWluO1xyXG5jb25zdCBicmVha0F3YXlOb25lTGVmdFN0cmluZyA9IEZyaWN0aW9uU3RyaW5ncy5hMTF5LmJyZWFrQXdheU5vbmVMZWZ0O1xyXG5cclxuLy8gYnJlYWsgYXdheSBzZW50ZW5jZXNcclxuY29uc3QgQlJFQUtfQVdBWV9USFJFU0hPTERfRklSU1QgPSBTdHJpbmdVdGlscy5maWxsSW4oIGJyZWFrQXdheVNlbnRlbmNlRmlyc3RTdHJpbmcsIHsgdGVtcDogY2FwaXRhbGl6ZWRWZXJ5SG90U3RyaW5nIH0gKTtcclxuY29uc3QgQlJFQUtfQVdBWV9USFJFU0hPTERfQUdBSU4gPSBTdHJpbmdVdGlscy5maWxsSW4oIGJyZWFrQXdheVNlbnRlbmNlQWdhaW5TdHJpbmcsIHsgdGVtcDogY2FwaXRhbGl6ZWRWZXJ5SG90U3RyaW5nIH0gKTtcclxuY29uc3QgQlJFQUtfQVdBWV9OT05FX0xFRlQgPSBTdHJpbmdVdGlscy5maWxsSW4oIGJyZWFrQXdheU5vbmVMZWZ0U3RyaW5nLCB7IHRlbXA6IGNhcGl0YWxpemVkVmVyeUhvdFN0cmluZyB9ICk7XHJcblxyXG4vLyB0aW1lIGluIGJldHdlZW4gXCJicmVhayBhd2F5IHNlc3Npb25zXCIuIFRoaXMgaXMgdGhlIG1pbmltdW0gYW1vdW50IG9mIHRpbWUgdG8gd2FpdCBiZWZvcmUgaGVhcmluZyBhIHN1YnNlcXVlbnQgYnJlYWtcclxuLy8gYXdheSBhbGVydFxyXG5jb25zdCBBTEVSVF9USU1FX0RFTEFZID0gMjAwMDtcclxuY29uc3QgU0hFQVJJTkdfTElNSVQgPSBGcmljdGlvbk1vZGVsLk1BR05JRklFRF9BVE9NU19JTkZPLnNoZWFyaW5nTGltaXQ7XHJcblxyXG5jbGFzcyBCcmVha0F3YXlBbGVydGVyIGV4dGVuZHMgQWxlcnRlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3BvbnNpYmxlIGZvciBhbGVydGluZyB3aGVuIHRoZSB0ZW1wZXJhdHVyZSBpbmNyZWFzZXNcclxuICAgKiBAcGFyYW0ge051bWJlclByb3BlcnR5fSB2aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IG51bWJlck9mQXRvbXNTaGVhcmVkT2ZmUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHZpYnJhdGlvbkFtcGxpdHVkZVByb3BlcnR5LCBudW1iZXJPZkF0b21zU2hlYXJlZE9mZlByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkgPSB2aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eTtcclxuICAgIHRoaXMubnVtYmVyT2ZBdG9tc1NoZWFyZWRPZmZQcm9wZXJ0eSA9IG51bWJlck9mQXRvbXNTaGVhcmVkT2ZmUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSAoYTExeSkgdHJ1ZSBpZiB0aGVyZSBoYXMgYWxyZWFkeSBiZWVuIGFuIGFsZXJ0IGFib3V0IGF0b21zIGJyZWFraW5nIGF3YXlcclxuICAgIHRoaXMuYWxlcnRlZEJyZWFrQXdheVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy50b29Tb29uRm9yTmV4dEFsZXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgge1xyXG4gICAgICBhbGVydDogbmV3IFJlc3BvbnNlUGFja2V0KCksXHJcbiAgICAgIHByaW9yaXR5OiBVdHRlcmFuY2UuSElHSF9QUklPUklUWSxcclxuICAgICAgYW5ub3VuY2VyT3B0aW9uczoge1xyXG4gICAgICAgIGFyaWFMaXZlUHJpb3JpdHk6IEFyaWFMaXZlQW5ub3VuY2VyLkFyaWFMaXZlLkFTU0VSVElWRVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYW1wbGl0dWRlTGlzdGVuZXIgPSAoIGFtcGxpdHVkZSwgb2xkQW1wbGl0dWRlICkgPT4ge1xyXG5cclxuICAgICAgLy8gSGFuZGxlIHRoZSBhbGVydCB3aGVuIGFtcGxpdHVkZSBpcyBoaWdoIGVub3VnaCB0byBiZWdpbiBzaGVhcmluZ1xyXG4gICAgICBpZiAoICF0aGlzLnRvb1Nvb25Gb3JOZXh0QWxlcnQgJiYgLy8gYWxlcnQgb25seSBzZXBhcmF0ZSBcImJyZWFrIGF3YXkgZXZlbnRzXCJcclxuICAgICAgICAgICBhbXBsaXR1ZGUgPiBTSEVBUklOR19MSU1JVCAmJiBvbGRBbXBsaXR1ZGUgPCBTSEVBUklOR19MSU1JVCApIHsgLy8ganVzdCBoaXQgc2hlYXJpbmcgbGltaXRcclxuICAgICAgICB0aGlzLmFsZXJ0QXRTaGVhcmluZ1RocmVzaG9sZCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0sIG5vIG5lZWQgdG8gZGlzcG9zZVxyXG4gICAgdGhpcy52aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eS5saW5rKCB0aGlzLmFtcGxpdHVkZUxpc3RlbmVyICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQWxlcnQgd2hlbiB0aGUgdGVtcGVyYXR1cmUgaGFzIGp1c3QgcmVhY2hlZCB0aGUgcG9pbnQgd2hlcmUgYXRvbXMgYmVnaW4gdG8gYnJlYWsgYXdheVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhbGVydEF0U2hlYXJpbmdUaHJlc2hvbGQoKSB7XHJcbiAgICBsZXQgYWxlcnRDb250ZW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYW55IG1vcmUgYXRvbXMgdG8gYnJlYWsgYXdheSwgYnV0IGRvbid0IGxldCB0aGlzIGJlIHRoZSBmaXJzdCBhbGVydCB3ZSBoZWFyXHJcbiAgICBpZiAoIHRoaXMuYWxlcnRlZEJyZWFrQXdheVByb3BlcnR5LnZhbHVlICYmIHRoaXMubnVtYmVyT2ZBdG9tc1NoZWFyZWRPZmZQcm9wZXJ0eS52YWx1ZSA+PSBGcmljdGlvbk1vZGVsLk5VTUJFUl9PRl9TSEVBUkFCTEVfQVRPTVMgKSB7XHJcbiAgICAgIGFsZXJ0Q29udGVudCA9IEJSRUFLX0FXQVlfTk9ORV9MRUZUO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFsZXJ0Q29udGVudCA9IHRoaXMuYWxlcnRlZEJyZWFrQXdheVByb3BlcnR5LnZhbHVlID8gQlJFQUtfQVdBWV9USFJFU0hPTERfQUdBSU4gOiBCUkVBS19BV0FZX1RIUkVTSE9MRF9GSVJTVDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnV0dGVyYW5jZS5hbGVydC5jb250ZXh0UmVzcG9uc2UgPSBhbGVydENvbnRlbnQ7XHJcblxyXG4gICAgdGhpcy5hbGVydCggdGhpcy51dHRlcmFuY2UgKTtcclxuXHJcbiAgICB0aGlzLmFsZXJ0ZWRCcmVha0F3YXlQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB0aGlzLnRvb1Nvb25Gb3JOZXh0QWxlcnQgPSB0cnVlO1xyXG4gICAgc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHsgdGhpcy50b29Tb29uRm9yTmV4dEFsZXJ0ID0gZmFsc2U7IH0sIEFMRVJUX1RJTUVfREVMQVkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYWxlcnRlZEJyZWFrQXdheVByb3BlcnR5LnJlc2V0KCk7IC8vIGdldCB0aGUgXCJmaXJzdCB0aW1lXCIgYnJlYWsgYXdheSBhbGVydCBvbiByZXNldFxyXG4gIH1cclxufVxyXG5cclxuZnJpY3Rpb24ucmVnaXN0ZXIoICdCcmVha0F3YXlBbGVydGVyJywgQnJlYWtBd2F5QWxlcnRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBCcmVha0F3YXlBbGVydGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsT0FBTyxNQUFNLGlFQUFpRTtBQUNyRixPQUFPQyxpQkFBaUIsTUFBTSxxREFBcUQ7QUFDbkYsT0FBT0MsY0FBYyxNQUFNLGtEQUFrRDtBQUM3RSxPQUFPQyxTQUFTLE1BQU0sNkNBQTZDO0FBQ25FLE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxhQUFhLE1BQU0sMkJBQTJCOztBQUVyRDtBQUNBLE1BQU1DLHdCQUF3QixHQUFHRixlQUFlLENBQUNHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxr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