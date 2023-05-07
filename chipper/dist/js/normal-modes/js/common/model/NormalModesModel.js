// Copyright 2021-2022, University of Colorado Boulder

/**
 * NormalModesModel is the base class for the model in both screens.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import normalModes from '../../normalModes.js';
import NormalModesConstants from '../NormalModesConstants.js';
import AmplitudeDirection from './AmplitudeDirection.js';
class NormalModesModel {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      numberOfMasses: 3,
      tandem: Tandem.REQUIRED
    }, options);

    // @public {number} Accumulated delta-time
    this.dt = 0;

    // @public {Property.<number>} the current time
    this.timeProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('timeProperty')
    });

    // @public {Property.<boolean>} determines whether the sim is in a play/pause state
    this.playingProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('playingProperty')
    });

    // @public used by the time control to select a speed
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      validValues: [TimeSpeed.NORMAL, TimeSpeed.SLOW]
    });

    // @private {DerivedProperty.<number>} multiplier for dt used in step
    this.timeScaleProperty = new DerivedProperty([this.timeSpeedProperty], timeSpeed => timeSpeed === TimeSpeed.NORMAL ? NormalModesConstants.NORMAL_SPEED : NormalModesConstants.SLOW_SPEED);

    // @public {Property.<boolean>} determines visibility of the springs
    this.springsVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('springsVisibleProperty')
    });

    // @public {Property.<number>} the current number of visible masses
    //TODO this is actually the number of masses per row. In the 'Two Dimensions' screen, the number of masses is this value squared.
    this.numberOfMassesProperty = new NumberProperty(options.numberOfMasses, {
      numberType: 'Integer',
      range: NormalModesConstants.NUMBER_OF_MASSES_RANGE,
      tandem: options.tandem.createTandem('numberOfMassesProperty')
    });

    // @public the current direction of motion of the visible masses
    this.amplitudeDirectionProperty = new EnumerationProperty(AmplitudeDirection.VERTICAL, {
      tandem: options.tandem.createTandem('amplitudeDirectionProperty')
    });

    // @public {Property.<boolean>} determines visibility of the arrows on the masses
    this.arrowsVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('arrowsVisibleProperty')
    });
  }

  /**
   * @public
   */
  reset() {
    this.dt = 0;
    this.playingProperty.reset();
    this.timeSpeedProperty.reset();
    this.springsVisibleProperty.reset();
    this.numberOfMassesProperty.reset();
    this.amplitudeDirectionProperty.reset();
    this.arrowsVisibleProperty.reset();
  }
}
normalModes.register('NormalModesModel', NormalModesModel);
export default NormalModesModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJtZXJnZSIsIlRpbWVTcGVlZCIsIlRhbmRlbSIsIm5vcm1hbE1vZGVzIiwiTm9ybWFsTW9kZXNDb25zdGFudHMiLCJBbXBsaXR1ZGVEaXJlY3Rpb24iLCJOb3JtYWxNb2Rlc01vZGVsIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibnVtYmVyT2ZNYXNzZXMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImR0IiwidGltZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGxheWluZ1Byb3BlcnR5IiwidGltZVNwZWVkUHJvcGVydHkiLCJOT1JNQUwiLCJ2YWxpZFZhbHVlcyIsIlNMT1ciLCJ0aW1lU2NhbGVQcm9wZXJ0eSIsInRpbWVTcGVlZCIsIk5PUk1BTF9TUEVFRCIsIlNMT1dfU1BFRUQiLCJzcHJpbmdzVmlzaWJsZVByb3BlcnR5IiwibnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJyYW5nZSIsIk5VTUJFUl9PRl9NQVNTRVNfUkFOR0UiLCJhbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eSIsIlZFUlRJQ0FMIiwiYXJyb3dzVmlzaWJsZVByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5vcm1hbE1vZGVzTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9ybWFsTW9kZXNNb2RlbCBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgdGhlIG1vZGVsIGluIGJvdGggc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBUaGlhZ28gZGUgTWVuZG9uw6dhIE1pbGRlbWJlcmdlciAoVVRGUFIpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgVGltZVNwZWVkIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lU3BlZWQuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbm9ybWFsTW9kZXMgZnJvbSAnLi4vLi4vbm9ybWFsTW9kZXMuanMnO1xyXG5pbXBvcnQgTm9ybWFsTW9kZXNDb25zdGFudHMgZnJvbSAnLi4vTm9ybWFsTW9kZXNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQW1wbGl0dWRlRGlyZWN0aW9uIGZyb20gJy4vQW1wbGl0dWRlRGlyZWN0aW9uLmpzJztcclxuXHJcbmNsYXNzIE5vcm1hbE1vZGVzTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG51bWJlck9mTWFzc2VzOiAzLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gQWNjdW11bGF0ZWQgZGVsdGEtdGltZVxyXG4gICAgdGhpcy5kdCA9IDA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHRoZSBjdXJyZW50IHRpbWVcclxuICAgIHRoaXMudGltZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNpbSBpcyBpbiBhIHBsYXkvcGF1c2Ugc3RhdGVcclxuICAgIHRoaXMucGxheWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYXlpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgdXNlZCBieSB0aGUgdGltZSBjb250cm9sIHRvIHNlbGVjdCBhIHNwZWVkXHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFRpbWVTcGVlZC5OT1JNQUwsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgVGltZVNwZWVkLk5PUk1BTCwgVGltZVNwZWVkLlNMT1cgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtEZXJpdmVkUHJvcGVydHkuPG51bWJlcj59IG11bHRpcGxpZXIgZm9yIGR0IHVzZWQgaW4gc3RlcFxyXG4gICAgdGhpcy50aW1lU2NhbGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy50aW1lU3BlZWRQcm9wZXJ0eSBdLFxyXG4gICAgICB0aW1lU3BlZWQgPT4gKCB0aW1lU3BlZWQgPT09IFRpbWVTcGVlZC5OT1JNQUwgKSA/IE5vcm1hbE1vZGVzQ29uc3RhbnRzLk5PUk1BTF9TUEVFRCA6IE5vcm1hbE1vZGVzQ29uc3RhbnRzLlNMT1dfU1BFRURcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHZpc2liaWxpdHkgb2YgdGhlIHNwcmluZ3NcclxuICAgIHRoaXMuc3ByaW5nc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcHJpbmdzVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IHRoZSBjdXJyZW50IG51bWJlciBvZiB2aXNpYmxlIG1hc3Nlc1xyXG4gICAgLy9UT0RPIHRoaXMgaXMgYWN0dWFsbHkgdGhlIG51bWJlciBvZiBtYXNzZXMgcGVyIHJvdy4gSW4gdGhlICdUd28gRGltZW5zaW9ucycgc2NyZWVuLCB0aGUgbnVtYmVyIG9mIG1hc3NlcyBpcyB0aGlzIHZhbHVlIHNxdWFyZWQuXHJcbiAgICB0aGlzLm51bWJlck9mTWFzc2VzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMubnVtYmVyT2ZNYXNzZXMsIHtcclxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICByYW5nZTogTm9ybWFsTW9kZXNDb25zdGFudHMuTlVNQkVSX09GX01BU1NFU19SQU5HRSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZk1hc3Nlc1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB0aGUgY3VycmVudCBkaXJlY3Rpb24gb2YgbW90aW9uIG9mIHRoZSB2aXNpYmxlIG1hc3Nlc1xyXG4gICAgdGhpcy5hbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBBbXBsaXR1ZGVEaXJlY3Rpb24uVkVSVElDQUwsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIHRoZSBhcnJvd3Mgb24gdGhlIG1hc3Nlc1xyXG4gICAgdGhpcy5hcnJvd3NWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXJyb3dzVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmR0ID0gMDtcclxuICAgIHRoaXMucGxheWluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwcmluZ3NWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubnVtYmVyT2ZNYXNzZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hbXBsaXR1ZGVEaXJlY3Rpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hcnJvd3NWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbm5vcm1hbE1vZGVzLnJlZ2lzdGVyKCAnTm9ybWFsTW9kZXNNb2RlbCcsIE5vcm1hbE1vZGVzTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTm9ybWFsTW9kZXNNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFB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