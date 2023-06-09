// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a fraction with up/down spinners for both the numerator and denominator.
 *
 * @author Michael Moorer (Berea College)
 * @author Vincent Davis (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PropertyFractionNode from '../../../../scenery-phet/js/PropertyFractionNode.js';
import { HBox, VBox } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';
import RoundNumberSpinner from './RoundNumberSpinner.js';
class AdjustableFractionNode extends HBox {
  /**
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
   * @param {NumberProperty} containerCountProperty
   * @param {Object} [options]
   */
  constructor(numeratorProperty, denominatorProperty, containerCountProperty, options) {
    options = merge({
      // {PropertyFractionNode.DisplayType}
      type: PropertyFractionNode.DisplayType.IMPROPER,
      // {boolean} - If false, the spinners will be to the left
      spinnersOnRight: true
    }, options);

    // convenience variable
    const properties = [numeratorProperty, denominatorProperty, containerCountProperty];
    const fractionNode = new PropertyFractionNode(numeratorProperty, denominatorProperty, {
      type: options.type,
      scale: 3,
      maxNumerator: numeratorProperty.range.max,
      maxDenominator: denominatorProperty.range.max
    });
    const spinnersNode = new VBox({
      spacing: 30,
      children: [
      // Numerator
      new RoundNumberSpinner(numeratorProperty, new DerivedProperty(properties, (numerator, denominator, containerCount) => {
        return (numerator + 1) / denominator <= containerCount;
      }), new DerivedProperty(properties, (numerator, denominator, containerCount) => {
        return numerator - 1 >= 0;
      })),
      // Denominator
      new RoundNumberSpinner(denominatorProperty, new DerivedProperty(properties, (numerator, denominator, containerCount) => {
        return denominator + 1 <= denominatorProperty.range.max;
      }), new DerivedProperty(properties, (numerator, denominator, containerCount) => {
        return denominator - 1 >= denominatorProperty.range.min && numerator / (denominator - 1) <= containerCount;
      }))]
    });
    super(merge({
      spacing: 10,
      children: options.spinnersOnRight ? [fractionNode, spinnersNode] : [spinnersNode, fractionNode]
    }, options));
  }
}
fractionsCommon.register('AdjustableFractionNode', AdjustableFractionNode);
export default AdjustableFractionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsIlByb3BlcnR5RnJhY3Rpb25Ob2RlIiwiSEJveCIsIlZCb3giLCJmcmFjdGlvbnNDb21tb24iLCJSb3VuZE51bWJlclNwaW5uZXIiLCJBZGp1c3RhYmxlRnJhY3Rpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJudW1lcmF0b3JQcm9wZXJ0eSIsImRlbm9taW5hdG9yUHJvcGVydHkiLCJjb250YWluZXJDb3VudFByb3BlcnR5Iiwib3B0aW9ucyIsInR5cGUiLCJEaXNwbGF5VHlwZSIsIklNUFJPUEVSIiwic3Bpbm5lcnNPblJpZ2h0IiwicHJvcGVydGllcyIsImZyYWN0aW9uTm9kZSIsInNjYWxlIiwibWF4TnVtZXJhdG9yIiwicmFuZ2UiLCJtYXgiLCJtYXhEZW5vbWluYXRvciIsInNwaW5uZXJzTm9kZSIsInNwYWNpbmciLCJjaGlsZHJlbiIsIm51bWVyYXRvciIsImRlbm9taW5hdG9yIiwiY29udGFpbmVyQ291bnQiLCJtaW4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFkanVzdGFibGVGcmFjdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzcGxheXMgYSBmcmFjdGlvbiB3aXRoIHVwL2Rvd24gc3Bpbm5lcnMgZm9yIGJvdGggdGhlIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBNb29yZXIgKEJlcmVhIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgVmluY2VudCBEYXZpcyAoQmVyZWEgQ29sbGVnZSlcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5RnJhY3Rpb25Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Qcm9wZXJ0eUZyYWN0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZnJhY3Rpb25zQ29tbW9uIGZyb20gJy4uLy4uL2ZyYWN0aW9uc0NvbW1vbi5qcyc7XHJcbmltcG9ydCBSb3VuZE51bWJlclNwaW5uZXIgZnJvbSAnLi9Sb3VuZE51bWJlclNwaW5uZXIuanMnO1xyXG5cclxuY2xhc3MgQWRqdXN0YWJsZUZyYWN0aW9uTm9kZSBleHRlbmRzIEhCb3gge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IG51bWVyYXRvclByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtOdW1iZXJQcm9wZXJ0eX0gZGVub21pbmF0b3JQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUHJvcGVydHl9IGNvbnRhaW5lckNvdW50UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWVyYXRvclByb3BlcnR5LCBkZW5vbWluYXRvclByb3BlcnR5LCBjb250YWluZXJDb3VudFByb3BlcnR5LCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIC8vIHtQcm9wZXJ0eUZyYWN0aW9uTm9kZS5EaXNwbGF5VHlwZX1cclxuICAgICAgdHlwZTogUHJvcGVydHlGcmFjdGlvbk5vZGUuRGlzcGxheVR5cGUuSU1QUk9QRVIsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBJZiBmYWxzZSwgdGhlIHNwaW5uZXJzIHdpbGwgYmUgdG8gdGhlIGxlZnRcclxuICAgICAgc3Bpbm5lcnNPblJpZ2h0OiB0cnVlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gY29udmVuaWVuY2UgdmFyaWFibGVcclxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBbIG51bWVyYXRvclByb3BlcnR5LCBkZW5vbWluYXRvclByb3BlcnR5LCBjb250YWluZXJDb3VudFByb3BlcnR5IF07XHJcblxyXG4gICAgY29uc3QgZnJhY3Rpb25Ob2RlID0gbmV3IFByb3BlcnR5RnJhY3Rpb25Ob2RlKCBudW1lcmF0b3JQcm9wZXJ0eSwgZGVub21pbmF0b3JQcm9wZXJ0eSwge1xyXG4gICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXHJcbiAgICAgIHNjYWxlOiAzLFxyXG5cclxuICAgICAgbWF4TnVtZXJhdG9yOiBudW1lcmF0b3JQcm9wZXJ0eS5yYW5nZS5tYXgsXHJcbiAgICAgIG1heERlbm9taW5hdG9yOiBkZW5vbWluYXRvclByb3BlcnR5LnJhbmdlLm1heFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNwaW5uZXJzTm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDMwLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIC8vIE51bWVyYXRvclxyXG4gICAgICAgIG5ldyBSb3VuZE51bWJlclNwaW5uZXIoXHJcbiAgICAgICAgICBudW1lcmF0b3JQcm9wZXJ0eSxcclxuICAgICAgICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIHByb3BlcnRpZXMsICggbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgY29udGFpbmVyQ291bnQgKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIG51bWVyYXRvciArIDEgKSAvIGRlbm9taW5hdG9yIDw9IGNvbnRhaW5lckNvdW50O1xyXG4gICAgICAgICAgfSApLFxyXG4gICAgICAgICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggcHJvcGVydGllcywgKCBudW1lcmF0b3IsIGRlbm9taW5hdG9yLCBjb250YWluZXJDb3VudCApID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuICggbnVtZXJhdG9yIC0gMSApID49IDA7XHJcbiAgICAgICAgICB9IClcclxuICAgICAgICApLFxyXG4gICAgICAgIC8vIERlbm9taW5hdG9yXHJcbiAgICAgICAgbmV3IFJvdW5kTnVtYmVyU3Bpbm5lcihcclxuICAgICAgICAgIGRlbm9taW5hdG9yUHJvcGVydHksXHJcbiAgICAgICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBwcm9wZXJ0aWVzLCAoIG51bWVyYXRvciwgZGVub21pbmF0b3IsIGNvbnRhaW5lckNvdW50ICkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKCBkZW5vbWluYXRvciArIDEgKSA8PSBkZW5vbWluYXRvclByb3BlcnR5LnJhbmdlLm1heDtcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIHByb3BlcnRpZXMsICggbnVtZXJhdG9yLCBkZW5vbWluYXRvciwgY29udGFpbmVyQ291bnQgKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoIGRlbm9taW5hdG9yIC0gMSApID49IGRlbm9taW5hdG9yUHJvcGVydHkucmFuZ2UubWluICYmIG51bWVyYXRvciAvICggZGVub21pbmF0b3IgLSAxICkgPD0gY29udGFpbmVyQ291bnQ7XHJcbiAgICAgICAgICB9IClcclxuICAgICAgICApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggbWVyZ2UoIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNoaWxkcmVuOiBvcHRpb25zLnNwaW5uZXJzT25SaWdodCA/IFtcclxuICAgICAgICBmcmFjdGlvbk5vZGUsXHJcbiAgICAgICAgc3Bpbm5lcnNOb2RlXHJcbiAgICAgIF0gOiBbXHJcbiAgICAgICAgc3Bpbm5lcnNOb2RlLFxyXG4gICAgICAgIGZyYWN0aW9uTm9kZVxyXG4gICAgICBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZyYWN0aW9uc0NvbW1vbi5yZWdpc3RlciggJ0FkanVzdGFibGVGcmFjdGlvbk5vZGUnLCBBZGp1c3RhYmxlRnJhY3Rpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFkanVzdGFibGVGcmFjdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0Msb0JBQW9CLE1BQU0scURBQXFEO0FBQ3RGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUV4RCxNQUFNQyxzQkFBc0IsU0FBU0osSUFBSSxDQUFDO0VBQ3hDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxpQkFBaUIsRUFBRUMsbUJBQW1CLEVBQUVDLHNCQUFzQixFQUFFQyxPQUFPLEVBQUc7SUFDckZBLE9BQU8sR0FBR1gsS0FBSyxDQUFFO01BQ2Y7TUFDQVksSUFBSSxFQUFFWCxvQkFBb0IsQ0FBQ1ksV0FBVyxDQUFDQyxRQUFRO01BRS9DO01BQ0FDLGVBQWUsRUFBRTtJQUNuQixDQUFDLEVBQUVKLE9BQVEsQ0FBQzs7SUFFWjtJQUNBLE1BQU1LLFVBQVUsR0FBRyxDQUFFUixpQkFBaUIsRUFBRUMsbUJBQW1CLEVBQUVDLHNCQUFzQixDQUFFO0lBRXJGLE1BQU1PLFlBQVksR0FBRyxJQUFJaEIsb0JBQW9CLENBQUVPLGlCQUFpQixFQUFFQyxtQkFBbUIsRUFBRTtNQUNyRkcsSUFBSSxFQUFFRCxPQUFPLENBQUNDLElBQUk7TUFDbEJNLEtBQUssRUFBRSxDQUFDO01BRVJDLFlBQVksRUFBRVgsaUJBQWlCLENBQUNZLEtBQUssQ0FBQ0MsR0FBRztNQUN6Q0MsY0FBYyxFQUFFYixtQkFBbUIsQ0FBQ1csS0FBSyxDQUFDQztJQUM1QyxDQUFFLENBQUM7SUFFSCxNQUFNRSxZQUFZLEdBQUcsSUFBSXBCLElBQUksQ0FBRTtNQUM3QnFCLE9BQU8sRUFBRSxFQUFFO01BQ1hDLFFBQVEsRUFBRTtNQUNSO01BQ0EsSUFBSXBCLGtCQUFrQixDQUNwQkcsaUJBQWlCLEVBQ2pCLElBQUlULGVBQWUsQ0FBRWlCLFVBQVUsRUFBRSxDQUFFVSxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsY0FBYyxLQUFNO1FBQzdFLE9BQU8sQ0FBRUYsU0FBUyxHQUFHLENBQUMsSUFBS0MsV0FBVyxJQUFJQyxjQUFjO01BQzFELENBQUUsQ0FBQyxFQUNILElBQUk3QixlQUFlLENBQUVpQixVQUFVLEVBQUUsQ0FBRVUsU0FBUyxFQUFFQyxXQUFXLEVBQUVDLGNBQWMsS0FBTTtRQUM3RSxPQUFTRixTQUFTLEdBQUcsQ0FBQyxJQUFNLENBQUM7TUFDL0IsQ0FBRSxDQUNKLENBQUM7TUFDRDtNQUNBLElBQUlyQixrQkFBa0IsQ0FDcEJJLG1CQUFtQixFQUNuQixJQUFJVixlQUFlLENBQUVpQixVQUFVLEVBQUUsQ0FBRVUsU0FBUyxFQUFFQyxXQUFXLEVBQUVDLGNBQWMsS0FBTTtRQUM3RSxPQUFTRCxXQUFXLEdBQUcsQ0FBQyxJQUFNbEIsbUJBQW1CLENBQUNXLEtBQUssQ0FBQ0MsR0FBRztNQUM3RCxDQUFFLENBQUMsRUFDSCxJQUFJdEIsZUFBZSxDQUFFaUIsVUFBVSxFQUFFLENBQUVVLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxjQUFjLEtBQU07UUFDN0UsT0FBU0QsV0FBVyxHQUFHLENBQUMsSUFBTWxCLG1CQUFtQixDQUFDVyxLQUFLLENBQUNTLEdBQUcsSUFBSUgsU0FBUyxJQUFLQyxXQUFXLEdBQUcsQ0FBQyxDQUFFLElBQUlDLGNBQWM7TUFDbEgsQ0FBRSxDQUNKLENBQUM7SUFFTCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUU1QixLQUFLLENBQUU7TUFDWndCLE9BQU8sRUFBRSxFQUFFO01BQ1hDLFFBQVEsRUFBRWQsT0FBTyxDQUFDSSxlQUFlLEdBQUcsQ0FDbENFLFlBQVksRUFDWk0sWUFBWSxDQUNiLEdBQUcsQ0FDRkEsWUFBWSxFQUNaTixZQUFZO0lBRWhCLENBQUMsRUFBRU4sT0FBUSxDQUFFLENBQUM7RUFDaEI7QUFDRjtBQUVBUCxlQUFlLENBQUMwQixRQUFRLENBQUUsd0JBQXdCLEVBQUV4QixzQkFBdUIsQ0FBQztBQUM1RSxlQUFlQSxzQkFBc0IifQ==