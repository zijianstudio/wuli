// Copyright 2020-2022, University of Colorado Boulder

/**
 * Class responsible for formulating description strings specific to the both-hands interaction and associated
 * description (like in the screen summary and PDOMNode).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../../RatioAndProportionStrings.js';
import HandPositionsDescriber from './HandPositionsDescriber.js';
import DistanceResponseType from './DistanceResponseType.js';
import optionize from '../../../../../phet-core/js/optionize.js';
const ratioDistancePositionContextResponsePatternStringProperty = RatioAndProportionStrings.a11y.ratio.distancePositionContextResponseStringProperty;
class BothHandsDescriber {
  constructor(ratioTupleProperty, enabledRatioTermsRangeProperty, ratioLockedProperty, tickMarkViewProperty, inProportionProperty, ratioDescriber, tickMarkDescriber) {
    this.ratioTupleProperty = ratioTupleProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.ratioLockedProperty = ratioLockedProperty;
    this.handPositionsDescriber = new HandPositionsDescriber(ratioTupleProperty, tickMarkDescriber, inProportionProperty, enabledRatioTermsRangeProperty, this.ratioLockedProperty);
  }
  getBothHandsContextResponse(recentlyMovedRatioTerm, providedOptions) {
    const options = optionize()({
      supportGoBeyondEdgeResponses: true
    }, providedOptions);
    if (options.supportGoBeyondEdgeResponses) {
      const ratioLockedEdgeResponse = this.handPositionsDescriber.getGoBeyondContextResponse(this.ratioTupleProperty.value, recentlyMovedRatioTerm);
      if (ratioLockedEdgeResponse) {
        return ratioLockedEdgeResponse;
      }
    }

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn(ratioDistancePositionContextResponsePatternStringProperty, {
      distance: this.handPositionsDescriber.getBothHandsDistance(true, options),
      position: this.getBothHandsPosition()
    });
  }

  /**
   * Similar to getBothHandsContextResponse, but without extra logic for edges and distance-progress.
   */
  getBothHandsDynamicDescription() {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn(ratioDistancePositionContextResponsePatternStringProperty, {
      distance: this.handPositionsDescriber.getBothHandsDistance(true, {
        distanceResponseType: DistanceResponseType.DISTANCE_REGION
      }),
      position: this.getBothHandsPosition()
    });
  }

  /**
   * When each hand in different region, "left hand . . . , right hand . . ." otherwise "both hands . . ."
   * Used for both hands interaction, and with individual hands when the ratio is locked
   */
  getBothHandsPosition() {
    const tickMarkView = this.tickMarkViewProperty.value;
    const currentTuple = this.ratioTupleProperty.value;
    const leftPosition = this.handPositionsDescriber.getHandPositionDescription(currentTuple.antecedent, tickMarkView);
    const rightPosition = this.handPositionsDescriber.getHandPositionDescription(currentTuple.consequent, tickMarkView);

    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    if (leftPosition === rightPosition) {
      return StringUtils.fillIn(RatioAndProportionStrings.a11y.bothHands.equalObjectResponseAlertStringProperty, {
        inPosition: leftPosition
      });
    } else {
      return StringUtils.fillIn(RatioAndProportionStrings.a11y.bothHands.eachObjectResponseAlertStringProperty, {
        leftPosition: leftPosition,
        rightPosition: rightPosition
      });
    }
  }
  getBothHandsObjectResponse() {
    return this.ratioDescriber.getProximityToChallengeRatio();
  }
  reset() {
    this.handPositionsDescriber.reset();
  }
}
ratioAndProportion.register('BothHandsDescriber', BothHandsDescriber);
export default BothHandsDescriber;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsInJhdGlvQW5kUHJvcG9ydGlvbiIsIlJhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MiLCJIYW5kUG9zaXRpb25zRGVzY3JpYmVyIiwiRGlzdGFuY2VSZXNwb25zZVR5cGUiLCJvcHRpb25pemUiLCJyYXRpb0Rpc3RhbmNlUG9zaXRpb25Db250ZXh0UmVzcG9uc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJhMTF5IiwicmF0aW8iLCJkaXN0YW5jZVBvc2l0aW9uQ29udGV4dFJlc3BvbnNlU3RyaW5nUHJvcGVydHkiLCJCb3RoSGFuZHNEZXNjcmliZXIiLCJjb25zdHJ1Y3RvciIsInJhdGlvVHVwbGVQcm9wZXJ0eSIsImVuYWJsZWRSYXRpb1Rlcm1zUmFuZ2VQcm9wZXJ0eSIsInJhdGlvTG9ja2VkUHJvcGVydHkiLCJ0aWNrTWFya1ZpZXdQcm9wZXJ0eSIsImluUHJvcG9ydGlvblByb3BlcnR5IiwicmF0aW9EZXNjcmliZXIiLCJ0aWNrTWFya0Rlc2NyaWJlciIsImhhbmRQb3NpdGlvbnNEZXNjcmliZXIiLCJnZXRCb3RoSGFuZHNDb250ZXh0UmVzcG9uc2UiLCJyZWNlbnRseU1vdmVkUmF0aW9UZXJtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInN1cHBvcnRHb0JleW9uZEVkZ2VSZXNwb25zZXMiLCJyYXRpb0xvY2tlZEVkZ2VSZXNwb25zZSIsImdldEdvQmV5b25kQ29udGV4dFJlc3BvbnNlIiwidmFsdWUiLCJmaWxsSW4iLCJkaXN0YW5jZSIsImdldEJvdGhIYW5kc0Rpc3RhbmNlIiwicG9zaXRpb24iLCJnZXRCb3RoSGFuZHNQb3NpdGlvbiIsImdldEJvdGhIYW5kc0R5bmFtaWNEZXNjcmlwdGlvbiIsImRpc3RhbmNlUmVzcG9uc2VUeXBlIiwiRElTVEFOQ0VfUkVHSU9OIiwidGlja01hcmtWaWV3IiwiY3VycmVudFR1cGxlIiwibGVmdFBvc2l0aW9uIiwiZ2V0SGFuZFBvc2l0aW9uRGVzY3JpcHRpb24iLCJhbnRlY2VkZW50IiwicmlnaHRQb3NpdGlvbiIsImNvbnNlcXVlbnQiLCJib3RoSGFuZHMiLCJlcXVhbE9iamVjdFJlc3BvbnNlQWxlcnRTdHJpbmdQcm9wZXJ0eSIsImluUG9zaXRpb24iLCJlYWNoT2JqZWN0UmVzcG9uc2VBbGVydFN0cmluZ1Byb3BlcnR5IiwiZ2V0Qm90aEhhbmRzT2JqZWN0UmVzcG9uc2UiLCJnZXRQcm94aW1pdHlUb0NoYWxsZW5nZVJhdGlvIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJvdGhIYW5kc0Rlc2NyaWJlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyByZXNwb25zaWJsZSBmb3IgZm9ybXVsYXRpbmcgZGVzY3JpcHRpb24gc3RyaW5ncyBzcGVjaWZpYyB0byB0aGUgYm90aC1oYW5kcyBpbnRlcmFjdGlvbiBhbmQgYXNzb2NpYXRlZFxyXG4gKiBkZXNjcmlwdGlvbiAobGlrZSBpbiB0aGUgc2NyZWVuIHN1bW1hcnkgYW5kIFBET01Ob2RlKS5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgcmF0aW9BbmRQcm9wb3J0aW9uIGZyb20gJy4uLy4uLy4uL3JhdGlvQW5kUHJvcG9ydGlvbi5qcyc7XHJcbmltcG9ydCBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzIGZyb20gJy4uLy4uLy4uL1JhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSQVBSYXRpb1R1cGxlIGZyb20gJy4uLy4uL21vZGVsL1JBUFJhdGlvVHVwbGUuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJhdGlvRGVzY3JpYmVyIGZyb20gJy4vUmF0aW9EZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgSGFuZFBvc2l0aW9uc0Rlc2NyaWJlciwgeyBIYW5kQ29udGV4dFJlc3BvbnNlT3B0aW9ucyB9IGZyb20gJy4vSGFuZFBvc2l0aW9uc0Rlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBUaWNrTWFya1ZpZXcgZnJvbSAnLi4vVGlja01hcmtWaWV3LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGlja01hcmtEZXNjcmliZXIgZnJvbSAnLi9UaWNrTWFya0Rlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBEaXN0YW5jZVJlc3BvbnNlVHlwZSBmcm9tICcuL0Rpc3RhbmNlUmVzcG9uc2VUeXBlLmpzJztcclxuaW1wb3J0IFJhdGlvSW5wdXRNb2RhbGl0eSBmcm9tICcuL1JhdGlvSW5wdXRNb2RhbGl0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuXHJcbmNvbnN0IHJhdGlvRGlzdGFuY2VQb3NpdGlvbkNvbnRleHRSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IFJhdGlvQW5kUHJvcG9ydGlvblN0cmluZ3MuYTExeS5yYXRpby5kaXN0YW5jZVBvc2l0aW9uQ29udGV4dFJlc3BvbnNlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jbGFzcyBCb3RoSGFuZHNEZXNjcmliZXIge1xyXG5cclxuICBwcml2YXRlIHJhdGlvVHVwbGVQcm9wZXJ0eTogUHJvcGVydHk8UkFQUmF0aW9UdXBsZT47XHJcbiAgcHJpdmF0ZSBlbmFibGVkUmF0aW9UZXJtc1JhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPjtcclxuICBwcml2YXRlIHRpY2tNYXJrVmlld1Byb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PFRpY2tNYXJrVmlldz47XHJcbiAgcHJpdmF0ZSByYXRpb0Rlc2NyaWJlcjogUmF0aW9EZXNjcmliZXI7XHJcbiAgcHJpdmF0ZSBoYW5kUG9zaXRpb25zRGVzY3JpYmVyOiBIYW5kUG9zaXRpb25zRGVzY3JpYmVyO1xyXG4gIHByaXZhdGUgcmF0aW9Mb2NrZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmF0aW9UdXBsZVByb3BlcnR5OiBQcm9wZXJ0eTxSQVBSYXRpb1R1cGxlPiwgZW5hYmxlZFJhdGlvVGVybXNSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICByYXRpb0xvY2tlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGlja01hcmtWaWV3UHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8VGlja01hcmtWaWV3PixcclxuICAgICAgICAgICAgICAgICAgICAgIGluUHJvcG9ydGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHJhdGlvRGVzY3JpYmVyOiBSYXRpb0Rlc2NyaWJlciwgdGlja01hcmtEZXNjcmliZXI6IFRpY2tNYXJrRGVzY3JpYmVyICkge1xyXG5cclxuICAgIHRoaXMucmF0aW9UdXBsZVByb3BlcnR5ID0gcmF0aW9UdXBsZVByb3BlcnR5O1xyXG4gICAgdGhpcy5lbmFibGVkUmF0aW9UZXJtc1JhbmdlUHJvcGVydHkgPSBlbmFibGVkUmF0aW9UZXJtc1JhbmdlUHJvcGVydHk7XHJcbiAgICB0aGlzLnRpY2tNYXJrVmlld1Byb3BlcnR5ID0gdGlja01hcmtWaWV3UHJvcGVydHk7XHJcbiAgICB0aGlzLnJhdGlvRGVzY3JpYmVyID0gcmF0aW9EZXNjcmliZXI7XHJcbiAgICB0aGlzLnJhdGlvTG9ja2VkUHJvcGVydHkgPSByYXRpb0xvY2tlZFByb3BlcnR5O1xyXG4gICAgdGhpcy5oYW5kUG9zaXRpb25zRGVzY3JpYmVyID0gbmV3IEhhbmRQb3NpdGlvbnNEZXNjcmliZXIoIHJhdGlvVHVwbGVQcm9wZXJ0eSwgdGlja01hcmtEZXNjcmliZXIsXHJcbiAgICAgIGluUHJvcG9ydGlvblByb3BlcnR5LCBlbmFibGVkUmF0aW9UZXJtc1JhbmdlUHJvcGVydHksIHRoaXMucmF0aW9Mb2NrZWRQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEJvdGhIYW5kc0NvbnRleHRSZXNwb25zZSggcmVjZW50bHlNb3ZlZFJhdGlvVGVybTogUmF0aW9JbnB1dE1vZGFsaXR5LCBwcm92aWRlZE9wdGlvbnM/OiBIYW5kQ29udGV4dFJlc3BvbnNlT3B0aW9ucyApOiBzdHJpbmcge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGFuZENvbnRleHRSZXNwb25zZU9wdGlvbnMsIFN0cmljdE9taXQ8SGFuZENvbnRleHRSZXNwb25zZU9wdGlvbnMsICdkaXN0YW5jZVJlc3BvbnNlVHlwZSc+PigpKCB7XHJcbiAgICAgIHN1cHBvcnRHb0JleW9uZEVkZ2VSZXNwb25zZXM6IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5zdXBwb3J0R29CZXlvbmRFZGdlUmVzcG9uc2VzICkge1xyXG4gICAgICBjb25zdCByYXRpb0xvY2tlZEVkZ2VSZXNwb25zZSA9IHRoaXMuaGFuZFBvc2l0aW9uc0Rlc2NyaWJlci5nZXRHb0JleW9uZENvbnRleHRSZXNwb25zZShcclxuICAgICAgICB0aGlzLnJhdGlvVHVwbGVQcm9wZXJ0eS52YWx1ZSwgcmVjZW50bHlNb3ZlZFJhdGlvVGVybSApO1xyXG5cclxuICAgICAgaWYgKCByYXRpb0xvY2tlZEVkZ2VSZXNwb25zZSApIHtcclxuICAgICAgICByZXR1cm4gcmF0aW9Mb2NrZWRFZGdlUmVzcG9uc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgd2hlbiB0aW1lLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcmF0aW8tYW5kLXByb3BvcnRpb24vaXNzdWVzLzQ5OVxyXG4gICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggcmF0aW9EaXN0YW5jZVBvc2l0aW9uQ29udGV4dFJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGRpc3RhbmNlOiB0aGlzLmhhbmRQb3NpdGlvbnNEZXNjcmliZXIuZ2V0Qm90aEhhbmRzRGlzdGFuY2UoIHRydWUsIG9wdGlvbnMgKSxcclxuICAgICAgcG9zaXRpb246IHRoaXMuZ2V0Qm90aEhhbmRzUG9zaXRpb24oKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2ltaWxhciB0byBnZXRCb3RoSGFuZHNDb250ZXh0UmVzcG9uc2UsIGJ1dCB3aXRob3V0IGV4dHJhIGxvZ2ljIGZvciBlZGdlcyBhbmQgZGlzdGFuY2UtcHJvZ3Jlc3MuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdGhIYW5kc0R5bmFtaWNEZXNjcmlwdGlvbigpOiBzdHJpbmcge1xyXG4gICAgLy8gVE9ETzogUGF0dGVyblN0cmluZ1Byb3BlcnR5IHdoZW4gdGltZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3JhdGlvLWFuZC1wcm9wb3J0aW9uL2lzc3Vlcy80OTlcclxuICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHJhdGlvRGlzdGFuY2VQb3NpdGlvbkNvbnRleHRSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBkaXN0YW5jZTogdGhpcy5oYW5kUG9zaXRpb25zRGVzY3JpYmVyLmdldEJvdGhIYW5kc0Rpc3RhbmNlKCB0cnVlLCB7XHJcbiAgICAgICAgZGlzdGFuY2VSZXNwb25zZVR5cGU6IERpc3RhbmNlUmVzcG9uc2VUeXBlLkRJU1RBTkNFX1JFR0lPTlxyXG4gICAgICB9ICksXHJcbiAgICAgIHBvc2l0aW9uOiB0aGlzLmdldEJvdGhIYW5kc1Bvc2l0aW9uKClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZW4gZWFjaCBoYW5kIGluIGRpZmZlcmVudCByZWdpb24sIFwibGVmdCBoYW5kIC4gLiAuICwgcmlnaHQgaGFuZCAuIC4gLlwiIG90aGVyd2lzZSBcImJvdGggaGFuZHMgLiAuIC5cIlxyXG4gICAqIFVzZWQgZm9yIGJvdGggaGFuZHMgaW50ZXJhY3Rpb24sIGFuZCB3aXRoIGluZGl2aWR1YWwgaGFuZHMgd2hlbiB0aGUgcmF0aW8gaXMgbG9ja2VkXHJcbiAgICovXHJcbiAgcHVibGljIGdldEJvdGhIYW5kc1Bvc2l0aW9uKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCB0aWNrTWFya1ZpZXcgPSB0aGlzLnRpY2tNYXJrVmlld1Byb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRUdXBsZSA9IHRoaXMucmF0aW9UdXBsZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgbGVmdFBvc2l0aW9uID0gdGhpcy5oYW5kUG9zaXRpb25zRGVzY3JpYmVyLmdldEhhbmRQb3NpdGlvbkRlc2NyaXB0aW9uKCBjdXJyZW50VHVwbGUuYW50ZWNlZGVudCwgdGlja01hcmtWaWV3ICk7XHJcbiAgICBjb25zdCByaWdodFBvc2l0aW9uID0gdGhpcy5oYW5kUG9zaXRpb25zRGVzY3JpYmVyLmdldEhhbmRQb3NpdGlvbkRlc2NyaXB0aW9uKCBjdXJyZW50VHVwbGUuY29uc2VxdWVudCwgdGlja01hcmtWaWV3ICk7XHJcblxyXG4gICAgLy8gVE9ETzogUGF0dGVyblN0cmluZ1Byb3BlcnR5IHdoZW4gdGltZSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3JhdGlvLWFuZC1wcm9wb3J0aW9uL2lzc3Vlcy80OTlcclxuICAgIGlmICggbGVmdFBvc2l0aW9uID09PSByaWdodFBvc2l0aW9uICkge1xyXG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzLmExMXkuYm90aEhhbmRzLmVxdWFsT2JqZWN0UmVzcG9uc2VBbGVydFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgaW5Qb3NpdGlvbjogbGVmdFBvc2l0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBSYXRpb0FuZFByb3BvcnRpb25TdHJpbmdzLmExMXkuYm90aEhhbmRzLmVhY2hPYmplY3RSZXNwb25zZUFsZXJ0U3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBsZWZ0UG9zaXRpb246IGxlZnRQb3NpdGlvbixcclxuICAgICAgICByaWdodFBvc2l0aW9uOiByaWdodFBvc2l0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRCb3RoSGFuZHNPYmplY3RSZXNwb25zZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMucmF0aW9EZXNjcmliZXIuZ2V0UHJveGltaXR5VG9DaGFsbGVuZ2VSYXRpbygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5oYW5kUG9zaXRpb25zRGVzY3JpYmVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5yYXRpb0FuZFByb3BvcnRpb24ucmVnaXN0ZXIoICdCb3RoSGFuZHNEZXNjcmliZXInLCBCb3RoSGFuZHNEZXNjcmliZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgQm90aEhhbmRzRGVzY3JpYmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFdBQVcsTUFBTSxrREFBa0Q7QUFDMUUsT0FBT0Msa0JBQWtCLE1BQU0sZ0NBQWdDO0FBQy9ELE9BQU9DLHlCQUF5QixNQUFNLHVDQUF1QztBQUs3RSxPQUFPQyxzQkFBc0IsTUFBc0MsNkJBQTZCO0FBS2hHLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUU1RCxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBR2hFLE1BQU1DLHlEQUF5RCxHQUFHSix5QkFBeUIsQ0FBQ0ssSUFBSSxDQUFDQyxLQUFLLENBQUNDLDZDQUE2QztBQUVwSixNQUFNQyxrQkFBa0IsQ0FBQztFQVNoQkMsV0FBV0EsQ0FBRUMsa0JBQTJDLEVBQUVDLDhCQUF3RCxFQUNyR0MsbUJBQXNDLEVBQUVDLG9CQUF1RCxFQUMvRkMsb0JBQWdELEVBQ2hEQyxjQUE4QixFQUFFQyxpQkFBb0MsRUFBRztJQUV6RixJQUFJLENBQUNOLGtCQUFrQixHQUFHQSxrQkFBa0I7SUFDNUMsSUFBSSxDQUFDQyw4QkFBOEIsR0FBR0EsOEJBQThCO0lBQ3BFLElBQUksQ0FBQ0Usb0JBQW9CLEdBQUdBLG9CQUFvQjtJQUNoRCxJQUFJLENBQUNFLGNBQWMsR0FBR0EsY0FBYztJQUNwQyxJQUFJLENBQUNILG1CQUFtQixHQUFHQSxtQkFBbUI7SUFDOUMsSUFBSSxDQUFDSyxzQkFBc0IsR0FBRyxJQUFJaEIsc0JBQXNCLENBQUVTLGtCQUFrQixFQUFFTSxpQkFBaUIsRUFDN0ZGLG9CQUFvQixFQUFFSCw4QkFBOEIsRUFBRSxJQUFJLENBQUNDLG1CQUFvQixDQUFDO0VBQ3BGO0VBRU9NLDJCQUEyQkEsQ0FBRUMsc0JBQTBDLEVBQUVDLGVBQTRDLEVBQVc7SUFFckksTUFBTUMsT0FBTyxHQUFH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