// Copyright 2014-2023, University of Colorado Boulder

/**
 * An arrow that points from left to right, used in equations to point from reactants to products.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
export default class RightArrowNode extends ArrowNode {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      length: 70,
      // ArrowNodeOptions
      tailWidth: 15,
      headWidth: 35,
      headHeight: 30
    }, providedOptions);
    super(0, 0, options.length, 0, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
reactantsProductsAndLeftovers.register('RightArrowNode', RightArrowNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJBcnJvd05vZGUiLCJyZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyIsIlJpZ2h0QXJyb3dOb2RlIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibGVuZ3RoIiwidGFpbFdpZHRoIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJpZ2h0QXJyb3dOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIGFycm93IHRoYXQgcG9pbnRzIGZyb20gbGVmdCB0byByaWdodCwgdXNlZCBpbiBlcXVhdGlvbnMgdG8gcG9pbnQgZnJvbSByZWFjdGFudHMgdG8gcHJvZHVjdHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSwgeyBBcnJvd05vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMgZnJvbSAnLi4vLi4vcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBsZW5ndGg/OiBudW1iZXI7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSaWdodEFycm93Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJlxyXG4gIFBpY2tPcHRpb25hbDxBcnJvd05vZGVPcHRpb25zLCAnZmlsbCcgfCAnc3Ryb2tlJyB8ICdzY2FsZScgfCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSaWdodEFycm93Tm9kZSBleHRlbmRzIEFycm93Tm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUmlnaHRBcnJvd05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmlnaHRBcnJvd05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgQXJyb3dOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbGVuZ3RoOiA3MCxcclxuXHJcbiAgICAgIC8vIEFycm93Tm9kZU9wdGlvbnNcclxuICAgICAgdGFpbFdpZHRoOiAxNSxcclxuICAgICAgaGVhZFdpZHRoOiAzNSxcclxuICAgICAgaGVhZEhlaWdodDogMzBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCAwLCAwLCBvcHRpb25zLmxlbmd0aCwgMCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLnJlZ2lzdGVyKCAnUmlnaHRBcnJvd05vZGUnLCBSaWdodEFycm93Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELE9BQU9DLFNBQVMsTUFBNEIsMENBQTBDO0FBRXRGLE9BQU9DLDZCQUE2QixNQUFNLHdDQUF3QztBQVNsRixlQUFlLE1BQU1DLGNBQWMsU0FBU0YsU0FBUyxDQUFDO0VBRTdDRyxXQUFXQSxDQUFFQyxlQUF1QyxFQUFHO0lBRTVELE1BQU1DLE9BQU8sR0FBR04sU0FBUyxDQUF1RCxDQUFDLENBQUU7TUFFakY7TUFDQU8sTUFBTSxFQUFFLEVBQUU7TUFFVjtNQUNBQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxTQUFTLEVBQUUsRUFBRTtNQUNiQyxVQUFVLEVBQUU7SUFDZCxDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVDLE9BQU8sQ0FBQ0MsTUFBTSxFQUFFLENBQUMsRUFBRUQsT0FBUSxDQUFDO0VBQzNDO0VBRWdCSyxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQVQsNkJBQTZCLENBQUNXLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRVYsY0FBZSxDQUFDIn0=