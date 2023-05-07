// Copyright 2014-2023, University of Colorado Boulder

/**
 * Abstraction for timed-event series that helps with variable frame-rates. Useful for things that need to happen at a
 * specific rate real-time regardless of the frame-rate.
 *
 * An EventTimer is created with a specific event "model" that determines when events occur, and a callback that will
 * be triggered for each event (with its time elapsed since it should have occurred). Thus, each callback basically
 * says:
 * - "an event happened <timeElapsed> ago"
 *
 * To have the EventTimer step forward in time (firing callbacks for every event that would have occurred over that
 * time frame, if any), call step( realTimeElapsed ).
 *
 * -----------------------------------------
 *
 * For example, create a timer with a constant rate that will fire events every 1 time units:
 *
 * var timer = new phet.phetCore.EventTimer( new phetCore.EventTimer.ConstantEventModel( 1 ), function( timeElapsed ) {
 *   console.log( 'event with timeElapsed: ' + timeElapsed );
 * } );
 *
 * Stepping once for 1.5 time units will fire once (0.5 seconds since the "end" of the step), and will be 0.5 seconds
 * from the next step:
 *
 * timer.step( 1.5 );
 * > event with timeElapsed: 0.5
 *
 * The 0.5 above is because after 1.5 seconds of time, the event will have happened 0.5 seconds ago:
 *
 *           step 1.5
 * |------------------------>|
 * |                *        |          *                     *    <- constant time of 1 between each event
 * |                <--------|
 *                 0.5 seconds past the event now
 *
 * Stepping for a longer time will result in more events:
 *
 * timer.step( 6 );
 * > event with timeElapsed: 5.5
 * > event with timeElapsed: 4.5
 * > event with timeElapsed: 3.5
 * > event with timeElapsed: 2.5
 * > event with timeElapsed: 1.5
 * > event with timeElapsed: 0.5
 *
 *       step 1.5                                  step 6                                 step 0   step 1.5
 * |---------------->|---------------------------------------------------------------------->|---------------->|
 * |           *           *           *           *           *           *           *           *           *
 * |           <-----|     <-----------------------------------------------------------------|     <-----------|
 * |          0.5         5.5          <-----------------------------------------------------|     1           0
 * |           ^           ^          4.5          <-----------------------------------------|              event at
 * |           |           |                      3.5          <-----------------------------|              current
 * |           |           |                                  2.5          <-----------------|              time
 * |     callback( t ) called, etc.                                       1.5          <-----|
 * |
 *
 * A step with zero time will trigger no events:
 *
 * timer.step( 0 );
 *
 * The timer will fire an event once it reaches the exact point in time:
 *
 * timer.step( 1.5 );
 * > event with timeElapsed: 1
 * > event with timeElapsed: 0
 *
 * NOTE:
 * If your timer callbacks create model objects that would also get stepped forward, make sure to step forward objects
 * before calling eventTimer.step(), so that objects don't get stepped twice. Usually the callback will have:
 * - var modelElement = new ModelElement();
 * - modelElement.step( callbackTimeElapsed );
 * And you don't want to apply step( dt ) to it directly afterwards.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import phetCore from './phetCore.js';
export default class EventTimer {
  /*
   * Create an event timer with a specific model (determines the time between events), and a callback to be called
   * for events.
   *
   * @param eventModel: getPeriodBeforeNextEvent() will be called at
   *    the start and after every event to determine the time required to pass by before the next event occurs.
   * @param eventCallback - Will be called for every event. The timeElapsed passed in as the
   *    only argument denotes the time elapsed since the event would have occurred. E.g. if we step for 5 seconds and
   *    our event would have occurred 1 second into that step, the timeElapsed will be 4 seconds, since after the end
   *    of the 5 seconds the event would have happened 4 seconds ago.
   */
  constructor(eventModel, eventCallback) {
    this.eventModel = eventModel;
    this.eventCallback = eventCallback;
    this.period = this.eventModel.getPeriodBeforeNextEvent();
    this.timeBeforeNextEvent = this.period;
  }

  /**
   * Steps the timer forward by a certain amount of time. This may cause 0 or more events to actually occur.
   */
  step(dt) {
    while (dt >= this.timeBeforeNextEvent) {
      dt -= this.timeBeforeNextEvent;
      this.period = this.eventModel.getPeriodBeforeNextEvent();
      this.timeBeforeNextEvent = this.period;

      // how much time has elapsed since this event began
      this.eventCallback(dt);
    }

    // use up the remaining DT
    this.timeBeforeNextEvent -= dt;
  }

  /**
   * Returns how far we are to the next event firing (where 0 is an event "just" fired, and 1 is the next event
   * firing).
   *
   * @returns In the range [0,1). Is inclusive for 0, but exclusive for 1.
   */
  getRatio() {
    return (this.period - this.timeBeforeNextEvent) / this.period;
  }
  static ConstantEventModel = class ConstantEventModel {
    /*
     * Event model that will fire events at a constant rate. An event will occur every 1/rate time units.
     */
    constructor(rate) {
      this.rate = rate;
      assert && assert(rate > 0, 'We need to have a strictly positive rate in order to prevent infinite loops.');
    }
    getPeriodBeforeNextEvent() {
      return 1 / this.rate;
    }
  };
  static UniformEventModel = class UniformEventModel {
    /*
     * Event model that will fire events averaging a certain rate, but with the time between events being uniformly
     * random.
     *
     * The pseudoRandomNumberSource, when called, should generate uniformly distributed random numbers in the range [0,1).
     */
    constructor(rate, pseudoRandomNumberSource) {
      this.rate = rate;
      this.pseudoRandomNumberSource = pseudoRandomNumberSource;
      assert && assert(rate > 0, 'We need to have a strictly positive rate in order to prevent infinite loops.');
    }
    getPeriodBeforeNextEvent() {
      const uniformRandomNumber = this.pseudoRandomNumberSource();
      assert && assert(uniformRandomNumber >= 0 && uniformRandomNumber < 1, `Our uniform random number is outside of its expected range with a value of ${uniformRandomNumber}`);

      // sample the exponential distribution
      return uniformRandomNumber * 2 / this.rate;
    }
  };
  static PoissonEventModel = class PoissonEventModel {
    /*
     * Event model that will fire events corresponding to a Poisson process with the specified rate.
     * The pseudoRandomNumberSource, when called, should generate uniformly distributed random numbers in the range [0,1).
     */
    constructor(rate, pseudoRandomNumberSource) {
      this.rate = rate;
      this.pseudoRandomNumberSource = pseudoRandomNumberSource;
      assert && assert(rate > 0, 'We need to have a strictly positive poisson rate in order to prevent infinite loops.');
    }
    getPeriodBeforeNextEvent() {
      // A poisson process can be described as having an independent exponential distribution for the time between
      // consecutive events.
      // see http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates and
      // http://en.wikipedia.org/wiki/Poisson_process

      const uniformRandomNumber = this.pseudoRandomNumberSource();
      assert && assert(uniformRandomNumber >= 0 && uniformRandomNumber < 1, `Our uniform random number is outside of its expected range with a value of ${uniformRandomNumber}`);

      // sample the exponential distribution
      return -Math.log(uniformRandomNumber) / this.rate;
    }
  };
}
phetCore.register('EventTimer', EventTimer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsIkV2ZW50VGltZXIiLCJjb25zdHJ1Y3RvciIsImV2ZW50TW9kZWwiLCJldmVudENhbGxiYWNrIiwicGVyaW9kIiwiZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50IiwidGltZUJlZm9yZU5leHRFdmVudCIsInN0ZXAiLCJkdCIsImdldFJhdGlvIiwiQ29uc3RhbnRFdmVudE1vZGVsIiwicmF0ZSIsImFzc2VydCIsIlVuaWZvcm1FdmVudE1vZGVsIiwicHNldWRvUmFuZG9tTnVtYmVyU291cmNlIiwidW5pZm9ybVJhbmRvbU51bWJlciIsIlBvaXNzb25FdmVudE1vZGVsIiwiTWF0aCIsImxvZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXZlbnRUaW1lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdGlvbiBmb3IgdGltZWQtZXZlbnQgc2VyaWVzIHRoYXQgaGVscHMgd2l0aCB2YXJpYWJsZSBmcmFtZS1yYXRlcy4gVXNlZnVsIGZvciB0aGluZ3MgdGhhdCBuZWVkIHRvIGhhcHBlbiBhdCBhXHJcbiAqIHNwZWNpZmljIHJhdGUgcmVhbC10aW1lIHJlZ2FyZGxlc3Mgb2YgdGhlIGZyYW1lLXJhdGUuXHJcbiAqXHJcbiAqIEFuIEV2ZW50VGltZXIgaXMgY3JlYXRlZCB3aXRoIGEgc3BlY2lmaWMgZXZlbnQgXCJtb2RlbFwiIHRoYXQgZGV0ZXJtaW5lcyB3aGVuIGV2ZW50cyBvY2N1ciwgYW5kIGEgY2FsbGJhY2sgdGhhdCB3aWxsXHJcbiAqIGJlIHRyaWdnZXJlZCBmb3IgZWFjaCBldmVudCAod2l0aCBpdHMgdGltZSBlbGFwc2VkIHNpbmNlIGl0IHNob3VsZCBoYXZlIG9jY3VycmVkKS4gVGh1cywgZWFjaCBjYWxsYmFjayBiYXNpY2FsbHlcclxuICogc2F5czpcclxuICogLSBcImFuIGV2ZW50IGhhcHBlbmVkIDx0aW1lRWxhcHNlZD4gYWdvXCJcclxuICpcclxuICogVG8gaGF2ZSB0aGUgRXZlbnRUaW1lciBzdGVwIGZvcndhcmQgaW4gdGltZSAoZmlyaW5nIGNhbGxiYWNrcyBmb3IgZXZlcnkgZXZlbnQgdGhhdCB3b3VsZCBoYXZlIG9jY3VycmVkIG92ZXIgdGhhdFxyXG4gKiB0aW1lIGZyYW1lLCBpZiBhbnkpLCBjYWxsIHN0ZXAoIHJlYWxUaW1lRWxhcHNlZCApLlxyXG4gKlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKlxyXG4gKiBGb3IgZXhhbXBsZSwgY3JlYXRlIGEgdGltZXIgd2l0aCBhIGNvbnN0YW50IHJhdGUgdGhhdCB3aWxsIGZpcmUgZXZlbnRzIGV2ZXJ5IDEgdGltZSB1bml0czpcclxuICpcclxuICogdmFyIHRpbWVyID0gbmV3IHBoZXQucGhldENvcmUuRXZlbnRUaW1lciggbmV3IHBoZXRDb3JlLkV2ZW50VGltZXIuQ29uc3RhbnRFdmVudE1vZGVsKCAxICksIGZ1bmN0aW9uKCB0aW1lRWxhcHNlZCApIHtcclxuICogICBjb25zb2xlLmxvZyggJ2V2ZW50IHdpdGggdGltZUVsYXBzZWQ6ICcgKyB0aW1lRWxhcHNlZCApO1xyXG4gKiB9ICk7XHJcbiAqXHJcbiAqIFN0ZXBwaW5nIG9uY2UgZm9yIDEuNSB0aW1lIHVuaXRzIHdpbGwgZmlyZSBvbmNlICgwLjUgc2Vjb25kcyBzaW5jZSB0aGUgXCJlbmRcIiBvZiB0aGUgc3RlcCksIGFuZCB3aWxsIGJlIDAuNSBzZWNvbmRzXHJcbiAqIGZyb20gdGhlIG5leHQgc3RlcDpcclxuICpcclxuICogdGltZXIuc3RlcCggMS41ICk7XHJcbiAqID4gZXZlbnQgd2l0aCB0aW1lRWxhcHNlZDogMC41XHJcbiAqXHJcbiAqIFRoZSAwLjUgYWJvdmUgaXMgYmVjYXVzZSBhZnRlciAxLjUgc2Vjb25kcyBvZiB0aW1lLCB0aGUgZXZlbnQgd2lsbCBoYXZlIGhhcHBlbmVkIDAuNSBzZWNvbmRzIGFnbzpcclxuICpcclxuICogICAgICAgICAgIHN0ZXAgMS41XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0+fFxyXG4gKiB8ICAgICAgICAgICAgICAgICogICAgICAgIHwgICAgICAgICAgKiAgICAgICAgICAgICAgICAgICAgICogICAgPC0gY29uc3RhbnQgdGltZSBvZiAxIGJldHdlZW4gZWFjaCBldmVudFxyXG4gKiB8ICAgICAgICAgICAgICAgIDwtLS0tLS0tLXxcclxuICogICAgICAgICAgICAgICAgIDAuNSBzZWNvbmRzIHBhc3QgdGhlIGV2ZW50IG5vd1xyXG4gKlxyXG4gKiBTdGVwcGluZyBmb3IgYSBsb25nZXIgdGltZSB3aWxsIHJlc3VsdCBpbiBtb3JlIGV2ZW50czpcclxuICpcclxuICogdGltZXIuc3RlcCggNiApO1xyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDUuNVxyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDQuNVxyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDMuNVxyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDIuNVxyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDEuNVxyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDAuNVxyXG4gKlxyXG4gKiAgICAgICBzdGVwIDEuNSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwIDYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwIDAgICBzdGVwIDEuNVxyXG4gKiB8LS0tLS0tLS0tLS0tLS0tLT58LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLT58LS0tLS0tLS0tLS0tLS0tLT58XHJcbiAqIHwgICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICogICAgICAgICAgICpcclxuICogfCAgICAgICAgICAgPC0tLS0tfCAgICAgPC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfCAgICAgPC0tLS0tLS0tLS0tfFxyXG4gKiB8ICAgICAgICAgIDAuNSAgICAgICAgIDUuNSAgICAgICAgICA8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18ICAgICAxICAgICAgICAgICAwXHJcbiAqIHwgICAgICAgICAgIF4gICAgICAgICAgIF4gICAgICAgICAgNC41ICAgICAgICAgIDwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgICAgICAgICAgICAgIGV2ZW50IGF0XHJcbiAqIHwgICAgICAgICAgIHwgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgMy41ICAgICAgICAgIDwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwgICAgICAgICAgICAgIGN1cnJlbnRcclxuICogfCAgICAgICAgICAgfCAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyLjUgICAgICAgICAgPC0tLS0tLS0tLS0tLS0tLS0tfCAgICAgICAgICAgICAgdGltZVxyXG4gKiB8ICAgICBjYWxsYmFjayggdCApIGNhbGxlZCwgZXRjLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEuNSAgICAgICAgICA8LS0tLS18XHJcbiAqIHxcclxuICpcclxuICogQSBzdGVwIHdpdGggemVybyB0aW1lIHdpbGwgdHJpZ2dlciBubyBldmVudHM6XHJcbiAqXHJcbiAqIHRpbWVyLnN0ZXAoIDAgKTtcclxuICpcclxuICogVGhlIHRpbWVyIHdpbGwgZmlyZSBhbiBldmVudCBvbmNlIGl0IHJlYWNoZXMgdGhlIGV4YWN0IHBvaW50IGluIHRpbWU6XHJcbiAqXHJcbiAqIHRpbWVyLnN0ZXAoIDEuNSApO1xyXG4gKiA+IGV2ZW50IHdpdGggdGltZUVsYXBzZWQ6IDFcclxuICogPiBldmVudCB3aXRoIHRpbWVFbGFwc2VkOiAwXHJcbiAqXHJcbiAqIE5PVEU6XHJcbiAqIElmIHlvdXIgdGltZXIgY2FsbGJhY2tzIGNyZWF0ZSBtb2RlbCBvYmplY3RzIHRoYXQgd291bGQgYWxzbyBnZXQgc3RlcHBlZCBmb3J3YXJkLCBtYWtlIHN1cmUgdG8gc3RlcCBmb3J3YXJkIG9iamVjdHNcclxuICogYmVmb3JlIGNhbGxpbmcgZXZlbnRUaW1lci5zdGVwKCksIHNvIHRoYXQgb2JqZWN0cyBkb24ndCBnZXQgc3RlcHBlZCB0d2ljZS4gVXN1YWxseSB0aGUgY2FsbGJhY2sgd2lsbCBoYXZlOlxyXG4gKiAtIHZhciBtb2RlbEVsZW1lbnQgPSBuZXcgTW9kZWxFbGVtZW50KCk7XHJcbiAqIC0gbW9kZWxFbGVtZW50LnN0ZXAoIGNhbGxiYWNrVGltZUVsYXBzZWQgKTtcclxuICogQW5kIHlvdSBkb24ndCB3YW50IHRvIGFwcGx5IHN0ZXAoIGR0ICkgdG8gaXQgZGlyZWN0bHkgYWZ0ZXJ3YXJkcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50VGltZXIge1xyXG5cclxuICBwcml2YXRlIHBlcmlvZDogbnVtYmVyO1xyXG4gIHByaXZhdGUgdGltZUJlZm9yZU5leHRFdmVudDogbnVtYmVyO1xyXG5cclxuICAvKlxyXG4gICAqIENyZWF0ZSBhbiBldmVudCB0aW1lciB3aXRoIGEgc3BlY2lmaWMgbW9kZWwgKGRldGVybWluZXMgdGhlIHRpbWUgYmV0d2VlbiBldmVudHMpLCBhbmQgYSBjYWxsYmFjayB0byBiZSBjYWxsZWRcclxuICAgKiBmb3IgZXZlbnRzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGV2ZW50TW9kZWw6IGdldFBlcmlvZEJlZm9yZU5leHRFdmVudCgpIHdpbGwgYmUgY2FsbGVkIGF0XHJcbiAgICogICAgdGhlIHN0YXJ0IGFuZCBhZnRlciBldmVyeSBldmVudCB0byBkZXRlcm1pbmUgdGhlIHRpbWUgcmVxdWlyZWQgdG8gcGFzcyBieSBiZWZvcmUgdGhlIG5leHQgZXZlbnQgb2NjdXJzLlxyXG4gICAqIEBwYXJhbSBldmVudENhbGxiYWNrIC0gV2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IGV2ZW50LiBUaGUgdGltZUVsYXBzZWQgcGFzc2VkIGluIGFzIHRoZVxyXG4gICAqICAgIG9ubHkgYXJndW1lbnQgZGVub3RlcyB0aGUgdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBldmVudCB3b3VsZCBoYXZlIG9jY3VycmVkLiBFLmcuIGlmIHdlIHN0ZXAgZm9yIDUgc2Vjb25kcyBhbmRcclxuICAgKiAgICBvdXIgZXZlbnQgd291bGQgaGF2ZSBvY2N1cnJlZCAxIHNlY29uZCBpbnRvIHRoYXQgc3RlcCwgdGhlIHRpbWVFbGFwc2VkIHdpbGwgYmUgNCBzZWNvbmRzLCBzaW5jZSBhZnRlciB0aGUgZW5kXHJcbiAgICogICAgb2YgdGhlIDUgc2Vjb25kcyB0aGUgZXZlbnQgd291bGQgaGF2ZSBoYXBwZW5lZCA0IHNlY29uZHMgYWdvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJpdmF0ZSByZWFkb25seSBldmVudE1vZGVsOiB7IGdldFBlcmlvZEJlZm9yZU5leHRFdmVudDogKCkgPT4gbnVtYmVyIH0sIHByaXZhdGUgcmVhZG9ubHkgZXZlbnRDYWxsYmFjazogKCB0aW1lRWxhcHNlZDogbnVtYmVyICkgPT4gdm9pZCApIHtcclxuICAgIHRoaXMucGVyaW9kID0gdGhpcy5ldmVudE1vZGVsLmdldFBlcmlvZEJlZm9yZU5leHRFdmVudCgpO1xyXG4gICAgdGhpcy50aW1lQmVmb3JlTmV4dEV2ZW50ID0gdGhpcy5wZXJpb2Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgdGltZXIgZm9yd2FyZCBieSBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUuIFRoaXMgbWF5IGNhdXNlIDAgb3IgbW9yZSBldmVudHMgdG8gYWN0dWFsbHkgb2NjdXIuXHJcbiAgICovXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB3aGlsZSAoIGR0ID49IHRoaXMudGltZUJlZm9yZU5leHRFdmVudCApIHtcclxuICAgICAgZHQgLT0gdGhpcy50aW1lQmVmb3JlTmV4dEV2ZW50O1xyXG4gICAgICB0aGlzLnBlcmlvZCA9IHRoaXMuZXZlbnRNb2RlbC5nZXRQZXJpb2RCZWZvcmVOZXh0RXZlbnQoKTtcclxuICAgICAgdGhpcy50aW1lQmVmb3JlTmV4dEV2ZW50ID0gdGhpcy5wZXJpb2Q7XHJcblxyXG4gICAgICAvLyBob3cgbXVjaCB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoaXMgZXZlbnQgYmVnYW5cclxuICAgICAgdGhpcy5ldmVudENhbGxiYWNrKCBkdCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVzZSB1cCB0aGUgcmVtYWluaW5nIERUXHJcbiAgICB0aGlzLnRpbWVCZWZvcmVOZXh0RXZlbnQgLT0gZHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGhvdyBmYXIgd2UgYXJlIHRvIHRoZSBuZXh0IGV2ZW50IGZpcmluZyAod2hlcmUgMCBpcyBhbiBldmVudCBcImp1c3RcIiBmaXJlZCwgYW5kIDEgaXMgdGhlIG5leHQgZXZlbnRcclxuICAgKiBmaXJpbmcpLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgSW4gdGhlIHJhbmdlIFswLDEpLiBJcyBpbmNsdXNpdmUgZm9yIDAsIGJ1dCBleGNsdXNpdmUgZm9yIDEuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFJhdGlvKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKCB0aGlzLnBlcmlvZCAtIHRoaXMudGltZUJlZm9yZU5leHRFdmVudCApIC8gdGhpcy5wZXJpb2Q7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENvbnN0YW50RXZlbnRNb2RlbCA9IGNsYXNzIENvbnN0YW50RXZlbnRNb2RlbCB7XHJcblxyXG4gICAgLypcclxuICAgICAqIEV2ZW50IG1vZGVsIHRoYXQgd2lsbCBmaXJlIGV2ZW50cyBhdCBhIGNvbnN0YW50IHJhdGUuIEFuIGV2ZW50IHdpbGwgb2NjdXIgZXZlcnkgMS9yYXRlIHRpbWUgdW5pdHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJpdmF0ZSByZWFkb25seSByYXRlOiBudW1iZXIgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhdGUgPiAwLCAnV2UgbmVlZCB0byBoYXZlIGEgc3RyaWN0bHkgcG9zaXRpdmUgcmF0ZSBpbiBvcmRlciB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzLicgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50KCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiAxIC8gdGhpcy5yYXRlO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVW5pZm9ybUV2ZW50TW9kZWwgPSBjbGFzcyBVbmlmb3JtRXZlbnRNb2RlbCB7XHJcbiAgICBcclxuICAgIC8qXHJcbiAgICAgKiBFdmVudCBtb2RlbCB0aGF0IHdpbGwgZmlyZSBldmVudHMgYXZlcmFnaW5nIGEgY2VydGFpbiByYXRlLCBidXQgd2l0aCB0aGUgdGltZSBiZXR3ZWVuIGV2ZW50cyBiZWluZyB1bmlmb3JtbHlcclxuICAgICAqIHJhbmRvbS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgcHNldWRvUmFuZG9tTnVtYmVyU291cmNlLCB3aGVuIGNhbGxlZCwgc2hvdWxkIGdlbmVyYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCByYW5kb20gbnVtYmVycyBpbiB0aGUgcmFuZ2UgWzAsMSkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJpdmF0ZSByZWFkb25seSByYXRlOiBudW1iZXIsIHByaXZhdGUgcmVhZG9ubHkgcHNldWRvUmFuZG9tTnVtYmVyU291cmNlOiAoKSA9PiBudW1iZXIgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhdGUgPiAwLCAnV2UgbmVlZCB0byBoYXZlIGEgc3RyaWN0bHkgcG9zaXRpdmUgcmF0ZSBpbiBvcmRlciB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzLicgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0UGVyaW9kQmVmb3JlTmV4dEV2ZW50KCk6IG51bWJlciB7XHJcbiAgICAgIGNvbnN0IHVuaWZvcm1SYW5kb21OdW1iZXIgPSB0aGlzLnBzZXVkb1JhbmRvbU51bWJlclNvdXJjZSgpO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB1bmlmb3JtUmFuZG9tTnVtYmVyID49IDAgJiYgdW5pZm9ybVJhbmRvbU51bWJlciA8IDEsXHJcbiAgICAgICAgYE91ciB1bmlmb3JtIHJhbmRvbSBudW1iZXIgaXMgb3V0c2lkZSBvZiBpdHMgZXhwZWN0ZWQgcmFuZ2Ugd2l0aCBhIHZhbHVlIG9mICR7dW5pZm9ybVJhbmRvbU51bWJlcn1gICk7XHJcblxyXG4gICAgICAvLyBzYW1wbGUgdGhlIGV4cG9uZW50aWFsIGRpc3RyaWJ1dGlvblxyXG4gICAgICByZXR1cm4gdW5pZm9ybVJhbmRvbU51bWJlciAqIDIgLyB0aGlzLnJhdGU7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQb2lzc29uRXZlbnRNb2RlbCA9IGNsYXNzIFBvaXNzb25FdmVudE1vZGVsIHtcclxuXHJcbiAgICAvKlxyXG4gICAgICogRXZlbnQgbW9kZWwgdGhhdCB3aWxsIGZpcmUgZXZlbnRzIGNvcnJlc3BvbmRpbmcgdG8gYSBQb2lzc29uIHByb2Nlc3Mgd2l0aCB0aGUgc3BlY2lmaWVkIHJhdGUuXHJcbiAgICAgKiBUaGUgcHNldWRvUmFuZG9tTnVtYmVyU291cmNlLCB3aGVuIGNhbGxlZCwgc2hvdWxkIGdlbmVyYXRlIHVuaWZvcm1seSBkaXN0cmlidXRlZCByYW5kb20gbnVtYmVycyBpbiB0aGUgcmFuZ2UgWzAsMSkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJpdmF0ZSByZWFkb25seSByYXRlOiBudW1iZXIsIHByaXZhdGUgcmVhZG9ubHkgcHNldWRvUmFuZG9tTnVtYmVyU291cmNlOiAoKSA9PiBudW1iZXIgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhdGUgPiAwLFxyXG4gICAgICAgICdXZSBuZWVkIHRvIGhhdmUgYSBzdHJpY3RseSBwb3NpdGl2ZSBwb2lzc29uIHJhdGUgaW4gb3JkZXIgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wcy4nICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBlcmlvZEJlZm9yZU5leHRFdmVudCgpOiBudW1iZXIge1xyXG5cclxuICAgICAgLy8gQSBwb2lzc29uIHByb2Nlc3MgY2FuIGJlIGRlc2NyaWJlZCBhcyBoYXZpbmcgYW4gaW5kZXBlbmRlbnQgZXhwb25lbnRpYWwgZGlzdHJpYnV0aW9uIGZvciB0aGUgdGltZSBiZXR3ZWVuXHJcbiAgICAgIC8vIGNvbnNlY3V0aXZlIGV2ZW50cy5cclxuICAgICAgLy8gc2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXhwb25lbnRpYWxfZGlzdHJpYnV0aW9uI0dlbmVyYXRpbmdfZXhwb25lbnRpYWxfdmFyaWF0ZXMgYW5kXHJcbiAgICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9pc3Nvbl9wcm9jZXNzXHJcblxyXG4gICAgICBjb25zdCB1bmlmb3JtUmFuZG9tTnVtYmVyID0gdGhpcy5wc2V1ZG9SYW5kb21OdW1iZXJTb3VyY2UoKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdW5pZm9ybVJhbmRvbU51bWJlciA+PSAwICYmIHVuaWZvcm1SYW5kb21OdW1iZXIgPCAxLFxyXG4gICAgICAgIGBPdXIgdW5pZm9ybSByYW5kb20gbnVtYmVyIGlzIG91dHNpZGUgb2YgaXRzIGV4cGVjdGVkIHJhbmdlIHdpdGggYSB2YWx1ZSBvZiAke3VuaWZvcm1SYW5kb21OdW1iZXJ9YCApO1xyXG5cclxuICAgICAgLy8gc2FtcGxlIHRoZSBleHBvbmVudGlhbCBkaXN0cmlidXRpb25cclxuICAgICAgcmV0dXJuIC1NYXRoLmxvZyggdW5pZm9ybVJhbmRvbU51bWJlciApIC8gdGhpcy5yYXRlO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAnRXZlbnRUaW1lcicsIEV2ZW50VGltZXIgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGVBQWU7QUFFcEMsZUFBZSxNQUFNQyxVQUFVLENBQUM7RUFLOUI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTQyxXQUFXQSxDQUFtQkMsVUFBc0QsRUFBbUJDLGFBQThDLEVBQUc7SUFBQSxLQUExSEQsVUFBc0QsR0FBdERBLFVBQXNEO0lBQUEsS0FB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