// Copyright 2022, University of Colorado Boulder

/**
 * MPPreferences is the model for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import moleculePolarity from '../../moleculePolarity.js';
import MPQueryParameters from '../MPQueryParameters.js';
import { DipoleDirectionValues } from './DipoleDirection.js';
import { SurfaceColorValues } from './SurfaceColor.js';
const MPPreferences = {
  dipoleDirectionProperty: new StringUnionProperty(MPQueryParameters.dipoleDirection, {
    validValues: DipoleDirectionValues,
    tandem: Tandem.PREFERENCES.createTandem('dipoleDirectionProperty')
  }),
  surfaceColorProperty: new StringUnionProperty(MPQueryParameters.surfaceColor, {
    validValues: SurfaceColorValues,
    //TODO see https://github.com/phetsims/molecule-polarity/issues/32
    // Until the 'Real Molecules' screen is fully implemented, opt out of PhET-iO instrumentation.
    // In the meantime, support testing via the realMolecules query parameter.
    tandem: MPQueryParameters.realMolecules ? Tandem.PREFERENCES.createTandem('surfaceColorProperty') : Tandem.OPT_OUT.createTandem('surfaceColorProperty'),
    phetioDocumentation: 'color scheme for the Electrostatic Potential surface in the Real Molecules screen'
  })
};
moleculePolarity.register('MPPreferences', MPPreferences);
export default MPPreferences;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdVbmlvblByb3BlcnR5IiwiVGFuZGVtIiwibW9sZWN1bGVQb2xhcml0eSIsIk1QUXVlcnlQYXJhbWV0ZXJzIiwiRGlwb2xlRGlyZWN0aW9uVmFsdWVzIiwiU3VyZmFjZUNvbG9yVmFsdWVzIiwiTVBQcmVmZXJlbmNlcyIsImRpcG9sZURpcmVjdGlvblByb3BlcnR5IiwiZGlwb2xlRGlyZWN0aW9uIiwidmFsaWRWYWx1ZXMiLCJ0YW5kZW0iLCJQUkVGRVJFTkNFUyIsImNyZWF0ZVRhbmRlbSIsInN1cmZhY2VDb2xvclByb3BlcnR5Iiwic3VyZmFjZUNvbG9yIiwicmVhbE1vbGVjdWxlcyIsIk9QVF9PVVQiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNUFByZWZlcmVuY2VzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNUFByZWZlcmVuY2VzIGlzIHRoZSBtb2RlbCBmb3Igc2ltLXNwZWNpZmljIHByZWZlcmVuY2VzLCBhY2Nlc3NlZCB2aWEgdGhlIFByZWZlcmVuY2VzIGRpYWxvZy5cclxuICogVGhlc2UgcHJlZmVyZW5jZXMgYXJlIGdsb2JhbCwgYW5kIGFmZmVjdCBhbGwgc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IE1QUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL01QUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IHsgRGlwb2xlRGlyZWN0aW9uLCBEaXBvbGVEaXJlY3Rpb25WYWx1ZXMgfSBmcm9tICcuL0RpcG9sZURpcmVjdGlvbi5qcyc7XHJcbmltcG9ydCB7IFN1cmZhY2VDb2xvciwgU3VyZmFjZUNvbG9yVmFsdWVzIH0gZnJvbSAnLi9TdXJmYWNlQ29sb3IuanMnO1xyXG5cclxuY29uc3QgTVBQcmVmZXJlbmNlcyA9IHtcclxuXHJcbiAgZGlwb2xlRGlyZWN0aW9uUHJvcGVydHk6IG5ldyBTdHJpbmdVbmlvblByb3BlcnR5PERpcG9sZURpcmVjdGlvbj4oXHJcbiAgICBNUFF1ZXJ5UGFyYW1ldGVycy5kaXBvbGVEaXJlY3Rpb24gYXMgRGlwb2xlRGlyZWN0aW9uLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBEaXBvbGVEaXJlY3Rpb25WYWx1ZXMsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlBSRUZFUkVOQ0VTLmNyZWF0ZVRhbmRlbSggJ2RpcG9sZURpcmVjdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICksXHJcblxyXG4gIHN1cmZhY2VDb2xvclByb3BlcnR5OiBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eTxTdXJmYWNlQ29sb3I+KFxyXG4gICAgTVBRdWVyeVBhcmFtZXRlcnMuc3VyZmFjZUNvbG9yIGFzIFN1cmZhY2VDb2xvciwge1xyXG4gICAgICB2YWxpZFZhbHVlczogU3VyZmFjZUNvbG9yVmFsdWVzLFxyXG5cclxuICAgICAgLy9UT0RPIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtcG9sYXJpdHkvaXNzdWVzLzMyXHJcbiAgICAgIC8vIFVudGlsIHRoZSAnUmVhbCBNb2xlY3VsZXMnIHNjcmVlbiBpcyBmdWxseSBpbXBsZW1lbnRlZCwgb3B0IG91dCBvZiBQaEVULWlPIGluc3RydW1lbnRhdGlvbi5cclxuICAgICAgLy8gSW4gdGhlIG1lYW50aW1lLCBzdXBwb3J0IHRlc3RpbmcgdmlhIHRoZSByZWFsTW9sZWN1bGVzIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgICAgdGFuZGVtOiAoIE1QUXVlcnlQYXJhbWV0ZXJzLnJlYWxNb2xlY3VsZXMgKSA/XHJcbiAgICAgICAgICAgICAgVGFuZGVtLlBSRUZFUkVOQ0VTLmNyZWF0ZVRhbmRlbSggJ3N1cmZhY2VDb2xvclByb3BlcnR5JyApIDpcclxuICAgICAgICAgICAgICBUYW5kZW0uT1BUX09VVC5jcmVhdGVUYW5kZW0oICdzdXJmYWNlQ29sb3JQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NvbG9yIHNjaGVtZSBmb3IgdGhlIEVsZWN0cm9zdGF0aWMgUG90ZW50aWFsIHN1cmZhY2UgaW4gdGhlIFJlYWwgTW9sZWN1bGVzIHNjcmVlbidcclxuICAgIH0gKVxyXG59O1xyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ01QUHJlZmVyZW5jZXMnLCBNUFByZWZlcmVuY2VzICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1QUHJlZmVyZW5jZXM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxTQUEwQkMscUJBQXFCLFFBQVEsc0JBQXNCO0FBQzdFLFNBQXVCQyxrQkFBa0IsUUFBUSxtQkFBbUI7QUFFcEUsTUFBTUMsYUFBYSxHQUFHO0VBRXBCQyx1QkFBdUIsRUFBRSxJQUFJUCxtQkFBbUIsQ0FDOUNHLGlCQUFpQixDQUFDSyxlQUFlLEVBQXFCO0lBQ3BEQyxXQUFXLEVBQUVMLHFCQUFxQjtJQUNsQ00sTUFBTSxFQUFFVCxNQUFNLENBQUNVLFdBQVcsQ0FBQ0MsWUFBWSxDQUFFLHlCQUEwQjtFQUNyRSxDQUFFLENBQUM7RUFFTEMsb0JBQW9CLEVBQUUsSUFBSWIsbUJBQW1CLENBQzNDRyxpQkFBaUIsQ0FBQ1csWUFBWSxFQUFrQjtJQUM5Q0wsV0FBVyxFQUFFSixrQkFBa0I7SUFFL0I7SUFDQTtJQUNBO0lBQ0FLLE1BQU0sRUFBSVAsaUJBQWlCLENBQUNZLGFBQWEsR0FDakNkLE1BQU0sQ0FBQ1UsV0FBVyxDQUFDQyxZQUFZLENBQUUsc0JBQXVCLENBQUMsR0FDekRYLE1BQU0sQ0FBQ2UsT0FBTyxDQUFDSixZQUFZLENBQUUsc0JBQXVCLENBQUM7SUFDN0RLLG1CQUFtQixFQUFFO0VBQ3ZCLENBQUU7QUFDTixDQUFDO0FBRURmLGdCQUFnQixDQUFDZ0IsUUFBUSxDQUFFLGVBQWUsRUFBRVosYUFBYyxDQUFDO0FBQzNELGVBQWVBLGFBQWEifQ==