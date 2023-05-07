// Copyright 2021-2023, University of Colorado Boulder

/**
 * DiscreteCalipersNode is the base class for tools used to measure a horizontal dimension of a harmonic in
 * the 'Discrete' screen. DiscreteCalipersNode's origin is at the tip of the caliper's left jaw.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import merge from '../../../../phet-core/js/merge.js';
import EmphasizedHarmonics from '../../common/model/EmphasizedHarmonics.js';
import CalipersNode from '../../common/view/CalipersNode.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import DiscreteMeasurementTool from '../model/DiscreteMeasurementTool.js';
import DiscreteMeasurementToolNode from './DiscreteMeasurementToolNode.js';
export default class DiscreteCalipersNode extends DiscreteMeasurementToolNode {
  /**
   * @param {DiscreteMeasurementTool} tool
   * @param {Harmonic[]} harmonics
   * @param {EmphasizedHarmonics} emphasizedHarmonics
   * @param {ChartTransform} chartTransform - transform for the Harmonics chart
   * @param {EnumerationProperty.<Domain>} domainProperty
   * @param {Domain[]} relevantDomains - the Domain values that are relevant for this tool
   * @param {function(harmonic:Harmonic):number} getModelValue - gets the quantity of the harmonic that is being measured
   * @param {Object} [options]
   */
  constructor(tool, harmonics, emphasizedHarmonics, chartTransform, domainProperty, relevantDomains, getModelValue, options) {
    assert && assert(tool instanceof DiscreteMeasurementTool);
    assert && assert(Array.isArray(harmonics));
    assert && assert(emphasizedHarmonics instanceof EmphasizedHarmonics);
    assert && assert(chartTransform instanceof ChartTransform);
    assert && assert(domainProperty instanceof EnumerationProperty);
    assert && assert(Array.isArray(relevantDomains));
    assert && assert(typeof getModelValue === 'function');
    options = merge({}, options);

    // {DerivedProperty.<Harmonic>} The harmonic associated with this tool.
    const harmonicProperty = new DerivedProperty([tool.orderProperty], order => harmonics[order - 1]);

    // Use CalipersNode via composition.
    const calipersNode = new CalipersNode();
    Multilink.multilink([tool.symbolStringProperty, harmonicProperty], (symbol, harmonic) => calipersNode.setLabel(`${symbol}<sub>${harmonic.order}</sub>`));
    assert && assert(!options.children, 'DiscreteCalipersNode sets children');
    options.children = [calipersNode];
    super(tool, harmonicProperty, emphasizedHarmonics, domainProperty, relevantDomains, options);
    const update = harmonic => {
      // Compute the value in view coordinates
      const modelValue = getModelValue(harmonic);
      const viewValue = chartTransform.modelToViewDeltaX(modelValue);
      calipersNode.setMeasuredWidth(viewValue);
      calipersNode.setBeamAndJawsFill(harmonic.colorProperty);

      // Do not adjust position. We want the left jaw of the caliper to remain where it was, since that is
      // the jaw that the user should be positioning in order to measure the width of something.
    };

    // Update to match the selected harmonic.
    harmonicProperty.link(harmonic => update(harmonic));

    // Update when the range of the associated axis changes.
    chartTransform.changedEmitter.addListener(() => update(harmonicProperty.value));
  }
}
fourierMakingWaves.register('DiscreteCalipersNode', DiscreteCalipersNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiTXVsdGlsaW5rIiwiQ2hhcnRUcmFuc2Zvcm0iLCJtZXJnZSIsIkVtcGhhc2l6ZWRIYXJtb25pY3MiLCJDYWxpcGVyc05vZGUiLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJEaXNjcmV0ZU1lYXN1cmVtZW50VG9vbCIsIkRpc2NyZXRlTWVhc3VyZW1lbnRUb29sTm9kZSIsIkRpc2NyZXRlQ2FsaXBlcnNOb2RlIiwiY29uc3RydWN0b3IiLCJ0b29sIiwiaGFybW9uaWNzIiwiZW1waGFzaXplZEhhcm1vbmljcyIsImNoYXJ0VHJhbnNmb3JtIiwiZG9tYWluUHJvcGVydHkiLCJyZWxldmFudERvbWFpbnMiLCJnZXRNb2RlbFZhbHVlIiwib3B0aW9ucyIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsImhhcm1vbmljUHJvcGVydHkiLCJvcmRlclByb3BlcnR5Iiwib3JkZXIiLCJjYWxpcGVyc05vZGUiLCJtdWx0aWxpbmsiLCJzeW1ib2xTdHJpbmdQcm9wZXJ0eSIsInN5bWJvbCIsImhhcm1vbmljIiwic2V0TGFiZWwiLCJjaGlsZHJlbiIsInVwZGF0ZSIsIm1vZGVsVmFsdWUiLCJ2aWV3VmFsdWUiLCJtb2RlbFRvVmlld0RlbHRhWCIsInNldE1lYXN1cmVkV2lkdGgiLCJzZXRCZWFtQW5kSmF3c0ZpbGwiLCJjb2xvclByb3BlcnR5IiwibGluayIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ2YWx1ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzY3JldGVDYWxpcGVyc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzY3JldGVDYWxpcGVyc05vZGUgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIHRvb2xzIHVzZWQgdG8gbWVhc3VyZSBhIGhvcml6b250YWwgZGltZW5zaW9uIG9mIGEgaGFybW9uaWMgaW5cclxuICogdGhlICdEaXNjcmV0ZScgc2NyZWVuLiBEaXNjcmV0ZUNhbGlwZXJzTm9kZSdzIG9yaWdpbiBpcyBhdCB0aGUgdGlwIG9mIHRoZSBjYWxpcGVyJ3MgbGVmdCBqYXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgQ2hhcnRUcmFuc2Zvcm0gZnJvbSAnLi4vLi4vLi4vLi4vYmFtYm9vL2pzL0NoYXJ0VHJhbnNmb3JtLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBFbXBoYXNpemVkSGFybW9uaWNzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbXBoYXNpemVkSGFybW9uaWNzLmpzJztcclxuaW1wb3J0IENhbGlwZXJzTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9DYWxpcGVyc05vZGUuanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBEaXNjcmV0ZU1lYXN1cmVtZW50VG9vbCBmcm9tICcuLi9tb2RlbC9EaXNjcmV0ZU1lYXN1cmVtZW50VG9vbC5qcyc7XHJcbmltcG9ydCBEaXNjcmV0ZU1lYXN1cmVtZW50VG9vbE5vZGUgZnJvbSAnLi9EaXNjcmV0ZU1lYXN1cmVtZW50VG9vbE5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzY3JldGVDYWxpcGVyc05vZGUgZXh0ZW5kcyBEaXNjcmV0ZU1lYXN1cmVtZW50VG9vbE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Rpc2NyZXRlTWVhc3VyZW1lbnRUb29sfSB0b29sXHJcbiAgICogQHBhcmFtIHtIYXJtb25pY1tdfSBoYXJtb25pY3NcclxuICAgKiBAcGFyYW0ge0VtcGhhc2l6ZWRIYXJtb25pY3N9IGVtcGhhc2l6ZWRIYXJtb25pY3NcclxuICAgKiBAcGFyYW0ge0NoYXJ0VHJhbnNmb3JtfSBjaGFydFRyYW5zZm9ybSAtIHRyYW5zZm9ybSBmb3IgdGhlIEhhcm1vbmljcyBjaGFydFxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25Qcm9wZXJ0eS48RG9tYWluPn0gZG9tYWluUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge0RvbWFpbltdfSByZWxldmFudERvbWFpbnMgLSB0aGUgRG9tYWluIHZhbHVlcyB0aGF0IGFyZSByZWxldmFudCBmb3IgdGhpcyB0b29sXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbihoYXJtb25pYzpIYXJtb25pYyk6bnVtYmVyfSBnZXRNb2RlbFZhbHVlIC0gZ2V0cyB0aGUgcXVhbnRpdHkgb2YgdGhlIGhhcm1vbmljIHRoYXQgaXMgYmVpbmcgbWVhc3VyZWRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRvb2wsIGhhcm1vbmljcywgZW1waGFzaXplZEhhcm1vbmljcywgY2hhcnRUcmFuc2Zvcm0sIGRvbWFpblByb3BlcnR5LCByZWxldmFudERvbWFpbnMsIGdldE1vZGVsVmFsdWUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdG9vbCBpbnN0YW5jZW9mIERpc2NyZXRlTWVhc3VyZW1lbnRUb29sICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBoYXJtb25pY3MgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZW1waGFzaXplZEhhcm1vbmljcyBpbnN0YW5jZW9mIEVtcGhhc2l6ZWRIYXJtb25pY3MgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoYXJ0VHJhbnNmb3JtIGluc3RhbmNlb2YgQ2hhcnRUcmFuc2Zvcm0gKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbWFpblByb3BlcnR5IGluc3RhbmNlb2YgRW51bWVyYXRpb25Qcm9wZXJ0eSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggcmVsZXZhbnREb21haW5zICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBnZXRNb2RlbFZhbHVlID09PSAnZnVuY3Rpb24nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHtEZXJpdmVkUHJvcGVydHkuPEhhcm1vbmljPn0gVGhlIGhhcm1vbmljIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHRvb2wuXHJcbiAgICBjb25zdCBoYXJtb25pY1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0b29sLm9yZGVyUHJvcGVydHkgXSwgb3JkZXIgPT4gaGFybW9uaWNzWyBvcmRlciAtIDEgXSApO1xyXG5cclxuICAgIC8vIFVzZSBDYWxpcGVyc05vZGUgdmlhIGNvbXBvc2l0aW9uLlxyXG4gICAgY29uc3QgY2FsaXBlcnNOb2RlID0gbmV3IENhbGlwZXJzTm9kZSgpO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0b29sLnN5bWJvbFN0cmluZ1Byb3BlcnR5LCBoYXJtb25pY1Byb3BlcnR5IF0sXHJcbiAgICAgICggc3ltYm9sLCBoYXJtb25pYyApID0+IGNhbGlwZXJzTm9kZS5zZXRMYWJlbCggYCR7c3ltYm9sfTxzdWI+JHtoYXJtb25pYy5vcmRlcn08L3N1Yj5gICkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ0Rpc2NyZXRlQ2FsaXBlcnNOb2RlIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBjYWxpcGVyc05vZGUgXTtcclxuXHJcbiAgICBzdXBlciggdG9vbCwgaGFybW9uaWNQcm9wZXJ0eSwgZW1waGFzaXplZEhhcm1vbmljcywgZG9tYWluUHJvcGVydHksIHJlbGV2YW50RG9tYWlucywgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHVwZGF0ZSA9IGhhcm1vbmljID0+IHtcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgdGhlIHZhbHVlIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgICAgY29uc3QgbW9kZWxWYWx1ZSA9IGdldE1vZGVsVmFsdWUoIGhhcm1vbmljICk7XHJcbiAgICAgIGNvbnN0IHZpZXdWYWx1ZSA9IGNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBtb2RlbFZhbHVlICk7XHJcblxyXG4gICAgICBjYWxpcGVyc05vZGUuc2V0TWVhc3VyZWRXaWR0aCggdmlld1ZhbHVlICk7XHJcbiAgICAgIGNhbGlwZXJzTm9kZS5zZXRCZWFtQW5kSmF3c0ZpbGwoIGhhcm1vbmljLmNvbG9yUHJvcGVydHkgKTtcclxuXHJcbiAgICAgIC8vIERvIG5vdCBhZGp1c3QgcG9zaXRpb24uIFdlIHdhbnQgdGhlIGxlZnQgamF3IG9mIHRoZSBjYWxpcGVyIHRvIHJlbWFpbiB3aGVyZSBpdCB3YXMsIHNpbmNlIHRoYXQgaXNcclxuICAgICAgLy8gdGhlIGphdyB0aGF0IHRoZSB1c2VyIHNob3VsZCBiZSBwb3NpdGlvbmluZyBpbiBvcmRlciB0byBtZWFzdXJlIHRoZSB3aWR0aCBvZiBzb21ldGhpbmcuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0byBtYXRjaCB0aGUgc2VsZWN0ZWQgaGFybW9uaWMuXHJcbiAgICBoYXJtb25pY1Byb3BlcnR5LmxpbmsoIGhhcm1vbmljID0+IHVwZGF0ZSggaGFybW9uaWMgKSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB3aGVuIHRoZSByYW5nZSBvZiB0aGUgYXNzb2NpYXRlZCBheGlzIGNoYW5nZXMuXHJcbiAgICBjaGFydFRyYW5zZm9ybS5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdXBkYXRlKCBoYXJtb25pY1Byb3BlcnR5LnZhbHVlICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0Rpc2NyZXRlQ2FsaXBlcnNOb2RlJywgRGlzY3JldGVDYWxpcGVyc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx5Q0FBeUM7QUFDcEUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxtQkFBbUIsTUFBTSwyQ0FBMkM7QUFDM0UsT0FBT0MsWUFBWSxNQUFNLG1DQUFtQztBQUM1RCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsdUJBQXVCLE1BQU0scUNBQXFDO0FBQ3pFLE9BQU9DLDJCQUEyQixNQUFNLGtDQUFrQztBQUUxRSxlQUFlLE1BQU1DLG9CQUFvQixTQUFTRCwyQkFBMkIsQ0FBQztFQUU1RTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsbUJBQW1CLEVBQUVDLGNBQWMsRUFBRUMsY0FBYyxFQUFFQyxlQUFlLEVBQUVDLGFBQWEsRUFBRUMsT0FBTyxFQUFHO0lBRTNIQyxNQUFNLElBQUlBLE1BQU0sQ0FBRVIsSUFBSSxZQUFZSix1QkFBd0IsQ0FBQztJQUMzRFksTUFBTSxJQUFJQSxNQUFNLENBQUVDLEtBQUssQ0FBQ0MsT0FBTyxDQUFFVCxTQUFVLENBQUUsQ0FBQztJQUM5Q08sTUFBTSxJQUFJQSxNQUFNLENBQUVOLG1CQUFtQixZQUFZVCxtQkFBb0IsQ0FBQztJQUN0RWUsTUFBTSxJQUFJQSxNQUFNLENBQUVMLGNBQWMsWUFBWVosY0FBZSxDQUFDO0lBQzVEaUIsTUFBTSxJQUFJQSxNQUFNLENBQUVKLGNBQWMsWUFBWWYsbUJBQW9CLENBQUM7SUFDakVtQixNQUFNLElBQUlBLE1BQU0sQ0FBRUMsS0FBSyxDQUFDQyxPQUFPLENBQUVMLGVBQWdCLENBQUUsQ0FBQztJQUNwREcsTUFBTSxJQUFJQSxNQUFNLENBQUUsT0FBT0YsYUFBYSxLQUFLLFVBQVcsQ0FBQztJQUV2REMsT0FBTyxHQUFHZixLQUFLLENBQUUsQ0FBQyxDQUFDLEVBQUVlLE9BQVEsQ0FBQzs7SUFFOUI7SUFDQSxNQUFNSSxnQkFBZ0IsR0FBRyxJQUFJdkIsZUFBZSxDQUFFLENBQUVZLElBQUksQ0FBQ1ksYUFBYSxDQUFFLEVBQUVDLEtBQUssSUFBSVosU0FBUyxDQUFFWSxLQUFLLEdBQUcsQ0FBQyxDQUFHLENBQUM7O0lBRXZHO0lBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUlwQixZQUFZLENBQUMsQ0FBQztJQUN2Q0osU0FBUyxDQUFDeUIsU0FBUyxDQUFFLENBQUVmLElBQUksQ0FBQ2dCLG9CQUFvQixFQUFFTCxnQkFBZ0IsQ0FBRSxFQUNsRSxDQUFFTSxNQUFNLEVBQUVDLFFBQVEsS0FBTUosWUFBWSxDQUFDSyxRQUFRLENBQUcsR0FBRUYsTUFBTyxRQUFPQyxRQUFRLENBQUNMLEtBQU0sUUFBUSxDQUFFLENBQUM7SUFFNUZMLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNELE9BQU8sQ0FBQ2EsUUFBUSxFQUFFLG9DQUFxQyxDQUFDO0lBQzNFYixPQUFPLENBQUNhLFFBQVEsR0FBRyxDQUFFTixZQUFZLENBQUU7SUFFbkMsS0FBSyxDQUFFZCxJQUFJLEVBQUVXLGdCQUFnQixFQUFFVCxtQkFBbUIsRUFBRUUsY0FBYyxFQUFFQyxlQUFlLEVBQUVFLE9BQVEsQ0FBQztJQUU5RixNQUFNYyxNQUFNLEdBQUdILFFBQVEsSUFBSTtNQUV6QjtNQUNBLE1BQU1JLFVBQVUsR0FBR2hCLGFBQWEsQ0FBRVksUUFBUyxDQUFDO01BQzVDLE1BQU1LLFNBQVMsR0FBR3BCLGNBQWMsQ0FBQ3FCLGlCQUFpQixDQUFFRixVQUFXLENBQUM7TUFFaEVSLFlBQVksQ0FBQ1csZ0JBQWdCLENBQUVGLFNBQVUsQ0FBQztNQUMxQ1QsWUFBWSxDQUFDWSxrQkFBa0IsQ0FBRVIsUUFBUSxDQUFDUyxhQUFjLENBQUM7O01BRXpEO01BQ0E7SUFDRixDQUFDOztJQUVEO0lBQ0FoQixnQkFBZ0IsQ0FBQ2lCLElBQUksQ0FBRVYsUUFBUSxJQUFJRyxNQUFNLENBQUVILFFBQVMsQ0FBRSxDQUFDOztJQUV2RDtJQUNBZixjQUFjLENBQUMwQixjQUFjLENBQUNDLFdBQVcsQ0FBRSxNQUFNVCxNQUFNLENBQUVWLGdCQUFnQixDQUFDb0IsS0FBTSxDQUFFLENBQUM7RUFDckY7QUFDRjtBQUVBcEMsa0JBQWtCLENBQUNxQyxRQUFRLENBQUUsc0JBQXNCLEVBQUVsQyxvQkFBcUIsQ0FBQyJ9