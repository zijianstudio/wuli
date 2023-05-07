// Copyright 2015-2022, University of Colorado Boulder

/**
 * MPPreferencesNode is the user interface for sim-specific preferences, accessed via the Preferences dialog.
 * These preferences are global, and affect all screens.
 *
 * The Preferences dialog is created on demand by joist, using a PhetioCapsule. So MPPreferencesNode must
 * implement dispose, and all elements of MPPreferencesNode that have tandems must be disposed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { VBox } from '../../../../scenery/js/imports.js';
import moleculePolarity from '../../moleculePolarity.js';
import MPPreferences from '../model/MPPreferences.js';
import MPQueryParameters from '../MPQueryParameters.js';
import DipoleDirectionControl from './DipoleDirectionControl.js';
import SurfaceColorControl from './SurfaceColorControl.js';
export default class MPPreferencesNode extends VBox {
  constructor(providedOptions) {
    const options = optionize()({
      // VBoxOptions
      align: 'left',
      spacing: 25
    }, providedOptions);
    const dipoleDirectionControl = new DipoleDirectionControl(MPPreferences.dipoleDirectionProperty, {
      tandem: options.tandem.createTandem('dipoleDirectionControl')
    });
    const surfaceColorControl = new SurfaceColorControl(MPPreferences.surfaceColorProperty, {
      tandem: options.tandem.createTandem('surfaceColorControl')
    });

    //TODO https://github.com/phetsims/molecule-polarity/issues/32
    // Hide the Surface Color option until the Real Molecules screen is implemented.
    // In the meantime, support testing via the realMolecules query parameter.
    surfaceColorControl.visible = MPQueryParameters.realMolecules;
    options.children = [dipoleDirectionControl, surfaceColorControl];
    super(options);
    this.disposeMPPreferencesNode = () => {
      dipoleDirectionControl.dispose();
      surfaceColorControl.dispose();
    };
  }
  dispose() {
    this.disposeMPPreferencesNode();
    super.dispose();
  }
}
moleculePolarity.register('MPPreferencesNode', MPPreferencesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJWQm94IiwibW9sZWN1bGVQb2xhcml0eSIsIk1QUHJlZmVyZW5jZXMiLCJNUFF1ZXJ5UGFyYW1ldGVycyIsIkRpcG9sZURpcmVjdGlvbkNvbnRyb2wiLCJTdXJmYWNlQ29sb3JDb250cm9sIiwiTVBQcmVmZXJlbmNlc05vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJkaXBvbGVEaXJlY3Rpb25Db250cm9sIiwiZGlwb2xlRGlyZWN0aW9uUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdXJmYWNlQ29sb3JDb250cm9sIiwic3VyZmFjZUNvbG9yUHJvcGVydHkiLCJ2aXNpYmxlIiwicmVhbE1vbGVjdWxlcyIsImNoaWxkcmVuIiwiZGlzcG9zZU1QUHJlZmVyZW5jZXNOb2RlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTVBQcmVmZXJlbmNlc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTVBQcmVmZXJlbmNlc05vZGUgaXMgdGhlIHVzZXIgaW50ZXJmYWNlIGZvciBzaW0tc3BlY2lmaWMgcHJlZmVyZW5jZXMsIGFjY2Vzc2VkIHZpYSB0aGUgUHJlZmVyZW5jZXMgZGlhbG9nLlxyXG4gKiBUaGVzZSBwcmVmZXJlbmNlcyBhcmUgZ2xvYmFsLCBhbmQgYWZmZWN0IGFsbCBzY3JlZW5zLlxyXG4gKlxyXG4gKiBUaGUgUHJlZmVyZW5jZXMgZGlhbG9nIGlzIGNyZWF0ZWQgb24gZGVtYW5kIGJ5IGpvaXN0LCB1c2luZyBhIFBoZXRpb0NhcHN1bGUuIFNvIE1QUHJlZmVyZW5jZXNOb2RlIG11c3RcclxuICogaW1wbGVtZW50IGRpc3Bvc2UsIGFuZCBhbGwgZWxlbWVudHMgb2YgTVBQcmVmZXJlbmNlc05vZGUgdGhhdCBoYXZlIHRhbmRlbXMgbXVzdCBiZSBkaXNwb3NlZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IE1QUHJlZmVyZW5jZXMgZnJvbSAnLi4vbW9kZWwvTVBQcmVmZXJlbmNlcy5qcyc7XHJcbmltcG9ydCBNUFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9NUFF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBEaXBvbGVEaXJlY3Rpb25Db250cm9sIGZyb20gJy4vRGlwb2xlRGlyZWN0aW9uQ29udHJvbC5qcyc7XHJcbmltcG9ydCBTdXJmYWNlQ29sb3JDb250cm9sIGZyb20gJy4vU3VyZmFjZUNvbG9yQ29udHJvbC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTVBQcmVmZXJlbmNlc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8VkJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1QUHJlZmVyZW5jZXNOb2RlIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZU1QUHJlZmVyZW5jZXNOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogTVBQcmVmZXJlbmNlc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TVBQcmVmZXJlbmNlc05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgVkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFZCb3hPcHRpb25zXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IDI1XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBkaXBvbGVEaXJlY3Rpb25Db250cm9sID0gbmV3IERpcG9sZURpcmVjdGlvbkNvbnRyb2woIE1QUHJlZmVyZW5jZXMuZGlwb2xlRGlyZWN0aW9uUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXBvbGVEaXJlY3Rpb25Db250cm9sJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3VyZmFjZUNvbG9yQ29udHJvbCA9IG5ldyBTdXJmYWNlQ29sb3JDb250cm9sKCBNUFByZWZlcmVuY2VzLnN1cmZhY2VDb2xvclByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VyZmFjZUNvbG9yQ29udHJvbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtcG9sYXJpdHkvaXNzdWVzLzMyXHJcbiAgICAvLyBIaWRlIHRoZSBTdXJmYWNlIENvbG9yIG9wdGlvbiB1bnRpbCB0aGUgUmVhbCBNb2xlY3VsZXMgc2NyZWVuIGlzIGltcGxlbWVudGVkLlxyXG4gICAgLy8gSW4gdGhlIG1lYW50aW1lLCBzdXBwb3J0IHRlc3RpbmcgdmlhIHRoZSByZWFsTW9sZWN1bGVzIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgIHN1cmZhY2VDb2xvckNvbnRyb2wudmlzaWJsZSA9IE1QUXVlcnlQYXJhbWV0ZXJzLnJlYWxNb2xlY3VsZXM7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFtcclxuICAgICAgZGlwb2xlRGlyZWN0aW9uQ29udHJvbCxcclxuICAgICAgc3VyZmFjZUNvbG9yQ29udHJvbFxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZU1QUHJlZmVyZW5jZXNOb2RlID0gKCkgPT4ge1xyXG4gICAgICBkaXBvbGVEaXJlY3Rpb25Db250cm9sLmRpc3Bvc2UoKTtcclxuICAgICAgc3VyZmFjZUNvbG9yQ29udHJvbC5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VNUFByZWZlcmVuY2VzTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ01QUHJlZmVyZW5jZXNOb2RlJywgTVBQcmVmZXJlbmNlc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixTQUFTQyxJQUFJLFFBQXFCLG1DQUFtQztBQUNyRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsYUFBYSxNQUFNLDJCQUEyQjtBQUNyRCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQU0xRCxlQUFlLE1BQU1DLGlCQUFpQixTQUFTTixJQUFJLENBQUM7RUFJM0NPLFdBQVdBLENBQUVDLGVBQXlDLEVBQUc7SUFFOUQsTUFBTUMsT0FBTyxHQUFHVixTQUFTLENBQXFELENBQUMsQ0FBRTtNQUUvRTtNQUNBVyxLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVILGVBQWdCLENBQUM7SUFFcEIsTUFBTUksc0JBQXNCLEdBQUcsSUFBSVIsc0JBQXNCLENBQUVGLGFBQWEsQ0FBQ1csdUJBQXVCLEVBQUU7TUFDaEdDLE1BQU0sRUFBRUwsT0FBTyxDQUFDSyxNQUFNLENBQUNDLFlBQVksQ0FBRSx3QkFBeUI7SUFDaEUsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSVgsbUJBQW1CLENBQUVILGFBQWEsQ0FBQ2Usb0JBQW9CLEVBQUU7TUFDdkZILE1BQU0sRUFBRUwsT0FBTyxDQUFDSyxNQUFNLENBQUNDLFlBQVksQ0FBRSxxQkFBc0I7SUFDN0QsQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQTtJQUNBQyxtQkFBbUIsQ0FBQ0UsT0FBTyxHQUFHZixpQkFBaUIsQ0FBQ2dCLGFBQWE7SUFFN0RWLE9BQU8sQ0FBQ1csUUFBUSxHQUFHLENBQ2pCUixzQkFBc0IsRUFDdEJJLG1CQUFtQixDQUNwQjtJQUVELEtBQUssQ0FBRVAsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ1ksd0JBQXdCLEdBQUcsTUFBTTtNQUNwQ1Qsc0JBQXNCLENBQUNVLE9BQU8sQ0FBQyxDQUFDO01BQ2hDTixtQkFBbUIsQ0FBQ00sT0FBTyxDQUFDLENBQUM7SUFDL0IsQ0FBQztFQUNIO0VBRWdCQSxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDRCx3QkFBd0IsQ0FBQyxDQUFDO0lBQy9CLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBckIsZ0JBQWdCLENBQUNzQixRQUFRLENBQUUsbUJBQW1CLEVBQUVqQixpQkFBa0IsQ0FBQyJ9