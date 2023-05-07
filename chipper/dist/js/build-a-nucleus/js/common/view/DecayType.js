// Copyright 2022, University of Colorado Boulder

/**
 * DecayType identifies the decay types of nuclides.
 *
 * @author Luisa Vargas
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import buildANucleus from '../../buildANucleus.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../BANColors.js';
class DecayType extends EnumerationValue {
  static ALPHA_DECAY = new DecayType(BuildANucleusStrings.alphaDecay, BANColors.alphaColorProperty);
  static BETA_MINUS_DECAY = new DecayType(BuildANucleusStrings.betaMinusDecay, BANColors.betaMinusColorProperty);
  static BETA_PLUS_DECAY = new DecayType(BuildANucleusStrings.betaPlusDecay, BANColors.betaPlusColorProperty);
  static PROTON_EMISSION = new DecayType(BuildANucleusStrings.protonEmission, BANColors.protonEmissionColorProperty);
  static NEUTRON_EMISSION = new DecayType(BuildANucleusStrings.neutronEmission, BANColors.neutronEmissionColorProperty);
  static enumeration = new Enumeration(DecayType);
  constructor(label, colorProperty) {
    super();
    this.label = label;
    this.colorProperty = colorProperty;
  }
}
buildANucleus.register('DecayType', DecayType);
export default DecayType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblZhbHVlIiwiYnVpbGRBTnVjbGV1cyIsIkVudW1lcmF0aW9uIiwiQnVpbGRBTnVjbGV1c1N0cmluZ3MiLCJCQU5Db2xvcnMiLCJEZWNheVR5cGUiLCJBTFBIQV9ERUNBWSIsImFscGhhRGVjYXkiLCJhbHBoYUNvbG9yUHJvcGVydHkiLCJCRVRBX01JTlVTX0RFQ0FZIiwiYmV0YU1pbnVzRGVjYXkiLCJiZXRhTWludXNDb2xvclByb3BlcnR5IiwiQkVUQV9QTFVTX0RFQ0FZIiwiYmV0YVBsdXNEZWNheSIsImJldGFQbHVzQ29sb3JQcm9wZXJ0eSIsIlBST1RPTl9FTUlTU0lPTiIsInByb3RvbkVtaXNzaW9uIiwicHJvdG9uRW1pc3Npb25Db2xvclByb3BlcnR5IiwiTkVVVFJPTl9FTUlTU0lPTiIsIm5ldXRyb25FbWlzc2lvbiIsIm5ldXRyb25FbWlzc2lvbkNvbG9yUHJvcGVydHkiLCJlbnVtZXJhdGlvbiIsImNvbnN0cnVjdG9yIiwibGFiZWwiLCJjb2xvclByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZWNheVR5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlY2F5VHlwZSBpZGVudGlmaWVzIHRoZSBkZWNheSB0eXBlcyBvZiBudWNsaWRlcy5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBidWlsZEFOdWNsZXVzIGZyb20gJy4uLy4uL2J1aWxkQU51Y2xldXMuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IEJ1aWxkQU51Y2xldXNTdHJpbmdzIGZyb20gJy4uLy4uL0J1aWxkQU51Y2xldXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IHsgUHJvZmlsZUNvbG9yUHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQkFOQ29sb3JzIGZyb20gJy4uL0JBTkNvbG9ycy5qcyc7XHJcblxyXG5jbGFzcyBEZWNheVR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBTFBIQV9ERUNBWSA9IG5ldyBEZWNheVR5cGUoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLmFscGhhRGVjYXksIEJBTkNvbG9ycy5hbHBoYUNvbG9yUHJvcGVydHkgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCRVRBX01JTlVTX0RFQ0FZID0gbmV3IERlY2F5VHlwZSggQnVpbGRBTnVjbGV1c1N0cmluZ3MuYmV0YU1pbnVzRGVjYXksIEJBTkNvbG9ycy5iZXRhTWludXNDb2xvclByb3BlcnR5ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQkVUQV9QTFVTX0RFQ0FZID0gbmV3IERlY2F5VHlwZSggQnVpbGRBTnVjbGV1c1N0cmluZ3MuYmV0YVBsdXNEZWNheSwgQkFOQ29sb3JzLmJldGFQbHVzQ29sb3JQcm9wZXJ0eSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBST1RPTl9FTUlTU0lPTiA9IG5ldyBEZWNheVR5cGUoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLnByb3RvbkVtaXNzaW9uLCBCQU5Db2xvcnMucHJvdG9uRW1pc3Npb25Db2xvclByb3BlcnR5ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTkVVVFJPTl9FTUlTU0lPTiA9IG5ldyBEZWNheVR5cGUoIEJ1aWxkQU51Y2xldXNTdHJpbmdzLm5ldXRyb25FbWlzc2lvbiwgQkFOQ29sb3JzLm5ldXRyb25FbWlzc2lvbkNvbG9yUHJvcGVydHkgKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggRGVjYXlUeXBlICk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBsYWJlbDogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb2xvclByb3BlcnR5OiBQcm9maWxlQ29sb3JQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYWJlbDogc3RyaW5nLCBjb2xvclByb3BlcnR5OiBQcm9maWxlQ29sb3JQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5sYWJlbCA9IGxhYmVsO1xyXG4gICAgdGhpcy5jb2xvclByb3BlcnR5ID0gY29sb3JQcm9wZXJ0eTtcclxuXHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFOdWNsZXVzLnJlZ2lzdGVyKCAnRGVjYXlUeXBlJywgRGVjYXlUeXBlICk7XHJcbmV4cG9ydCBkZWZhdWx0IERlY2F5VHlwZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFFaEUsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUV2QyxNQUFNQyxTQUFTLFNBQVNMLGdCQUFnQixDQUFDO0VBRXZDLE9BQXVCTSxXQUFXLEdBQUcsSUFBSUQsU0FBUyxDQUFFRixvQkFBb0IsQ0FBQ0ksVUFBVSxFQUFFSCxTQUFTLENBQUNJLGtCQUFtQixDQUFDO0VBRW5ILE9BQXVCQyxnQkFBZ0IsR0FBRyxJQUFJSixTQUFTLENBQUVGLG9CQUFvQixDQUFDTyxjQUFjLEVBQUVOLFNBQVMsQ0FBQ08sc0JBQXVCLENBQUM7RUFFaEksT0FBdUJDLGVBQWUsR0FBRyxJQUFJUCxTQUFTLENBQUVGLG9CQUFvQixDQUFDVSxhQUFhLEVBQUVULFNBQVMsQ0FBQ1UscUJBQXNCLENBQUM7RUFFN0gsT0FBdUJDLGVBQWUsR0FBRyxJQUFJVixTQUFTLENBQUVGLG9CQUFvQixDQUFDYSxjQUFjLEVBQUVaLFNBQVMsQ0FBQ2EsMkJBQTRCLENBQUM7RUFFcEksT0FBdUJDLGdCQUFnQixHQUFHLElBQUliLFNBQVMsQ0FBRUYsb0JBQW9CLENBQUNnQixlQUFlLEVBQUVmLFNBQVMsQ0FBQ2dCLDRCQUE2QixDQUFDO0VBRXZJLE9BQXVCQyxXQUFXLEdBQUcsSUFBSW5CLFdBQVcsQ0FBRUcsU0FBVSxDQUFDO0VBSzFEaUIsV0FBV0EsQ0FBRUMsS0FBYSxFQUFFQyxhQUFtQyxFQUFHO0lBQ3ZFLEtBQUssQ0FBQyxDQUFDO0lBRVAsSUFBSSxDQUFDRCxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDQyxhQUFhLEdBQUdBLGFBQWE7RUFFcEM7QUFDRjtBQUVBdkIsYUFBYSxDQUFDd0IsUUFBUSxDQUFFLFdBQVcsRUFBRXBCLFNBQVUsQ0FBQztBQUNoRCxlQUFlQSxTQUFTIn0=