// Copyright 2015-2022, University of Colorado Boulder

/**
 * AppliedForceVectorNode is the vector representation of applied force (F).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawColors from '../HookesLawColors.js';
import HookesLawConstants from '../HookesLawConstants.js';
import ForceVectorNode from './ForceVectorNode.js';
export default class AppliedForceVectorNode extends ForceVectorNode {
  constructor(appliedForceProperty, valueVisibleProperty, providedOptions) {
    const options = optionize()({
      // ForceVectorNodeOptions
      fill: HookesLawColors.APPLIED_FORCE,
      decimalPlaces: HookesLawConstants.APPLIED_FORCE_DECIMAL_PLACES
    }, providedOptions);
    super(appliedForceProperty, valueVisibleProperty, options);
  }
}
hookesLaw.register('AppliedForceVectorNode', AppliedForceVectorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJob29rZXNMYXciLCJIb29rZXNMYXdDb2xvcnMiLCJIb29rZXNMYXdDb25zdGFudHMiLCJGb3JjZVZlY3Rvck5vZGUiLCJBcHBsaWVkRm9yY2VWZWN0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJhcHBsaWVkRm9yY2VQcm9wZXJ0eSIsInZhbHVlVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpbGwiLCJBUFBMSUVEX0ZPUkNFIiwiZGVjaW1hbFBsYWNlcyIsIkFQUExJRURfRk9SQ0VfREVDSU1BTF9QTEFDRVMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFwcGxpZWRGb3JjZVZlY3Rvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXBwbGllZEZvcmNlVmVjdG9yTm9kZSBpcyB0aGUgdmVjdG9yIHJlcHJlc2VudGF0aW9uIG9mIGFwcGxpZWQgZm9yY2UgKEYpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBob29rZXNMYXcgZnJvbSAnLi4vLi4vaG9va2VzTGF3LmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbG9ycyBmcm9tICcuLi9Ib29rZXNMYXdDb2xvcnMuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29uc3RhbnRzIGZyb20gJy4uL0hvb2tlc0xhd0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGb3JjZVZlY3Rvck5vZGUsIHsgRm9yY2VWZWN0b3JOb2RlT3B0aW9ucyB9IGZyb20gJy4vRm9yY2VWZWN0b3JOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBBcHBsaWVkRm9yY2VWZWN0b3JOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRm9yY2VWZWN0b3JOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcGxpZWRGb3JjZVZlY3Rvck5vZGUgZXh0ZW5kcyBGb3JjZVZlY3Rvck5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFwcGxpZWRGb3JjZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWVWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBBcHBsaWVkRm9yY2VWZWN0b3JOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFwcGxpZWRGb3JjZVZlY3Rvck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgRm9yY2VWZWN0b3JOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gRm9yY2VWZWN0b3JOb2RlT3B0aW9uc1xyXG4gICAgICBmaWxsOiBIb29rZXNMYXdDb2xvcnMuQVBQTElFRF9GT1JDRSxcclxuICAgICAgZGVjaW1hbFBsYWNlczogSG9va2VzTGF3Q29uc3RhbnRzLkFQUExJRURfRk9SQ0VfREVDSU1BTF9QTEFDRVNcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBhcHBsaWVkRm9yY2VQcm9wZXJ0eSwgdmFsdWVWaXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ0FwcGxpZWRGb3JjZVZlY3Rvck5vZGUnLCBBcHBsaWVkRm9yY2VWZWN0b3JOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFDekQsT0FBT0MsZUFBZSxNQUFrQyxzQkFBc0I7QUFNOUUsZUFBZSxNQUFNQyxzQkFBc0IsU0FBU0QsZUFBZSxDQUFDO0VBRTNERSxXQUFXQSxDQUFFQyxvQkFBK0MsRUFDL0NDLG9CQUFnRCxFQUNoREMsZUFBOEMsRUFBRztJQUVuRSxNQUFNQyxPQUFPLEdBQUdWLFNBQVMsQ0FBcUUsQ0FBQyxDQUFFO01BRS9GO01BQ0FXLElBQUksRUFBRVQsZUFBZSxDQUFDVSxhQUFhO01BQ25DQyxhQUFhLEVBQUVWLGtCQUFrQixDQUFDVztJQUNwQyxDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFRixvQkFBb0IsRUFBRUMsb0JBQW9CLEVBQUVFLE9BQVEsQ0FBQztFQUM5RDtBQUNGO0FBRUFULFNBQVMsQ0FBQ2MsUUFBUSxDQUFFLHdCQUF3QixFQUFFVixzQkFBdUIsQ0FBQyJ9