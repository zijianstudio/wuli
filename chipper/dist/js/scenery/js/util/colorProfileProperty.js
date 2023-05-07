// Copyright 2021-2022, University of Colorado Boulder

/**
 * Singleton Property<string> which chooses between the available color profiles of a simulation, such as 'default',
 * 'project', 'basics', etc.
 *
 * The color profile names available to a simulation are specified in package.json under phet.colorProfiles (or, if not
 * specified, defaults to [ "default" ].  The first color profile that is listed will appear in the sim on startup,
 * unless overridden by the sim or the colorProfile query parameter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import StringProperty from '../../../axon/js/StringProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { scenery, SceneryConstants } from '../imports.js';

// Use the color profile specified in query parameters, or default to 'default'
const initialProfileName = _.hasIn(window, 'phet.chipper.queryParameters.colorProfile') ? phet.chipper.queryParameters.colorProfile : SceneryConstants.DEFAULT_COLOR_PROFILE;

// List of all supported colorProfiles for this simulation
const colorProfiles = _.hasIn(window, 'phet.chipper.colorProfiles') ? phet.chipper.colorProfiles : [SceneryConstants.DEFAULT_COLOR_PROFILE];

// @public {Property.<string>}
// The current profile name. Change this Property's value to change which profile is currently active.
const colorProfileProperty = new StringProperty(initialProfileName, {
  tandem: Tandem.GENERAL_VIEW.createTandem('colorProfileProperty'),
  phetioFeatured: true,
  validValues: colorProfiles
});
scenery.register('colorProfileProperty', colorProfileProperty);
export default colorProfileProperty;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlRhbmRlbSIsInNjZW5lcnkiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiaW5pdGlhbFByb2ZpbGVOYW1lIiwiXyIsImhhc0luIiwid2luZG93IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJjb2xvclByb2ZpbGUiLCJERUZBVUxUX0NPTE9SX1BST0ZJTEUiLCJjb2xvclByb2ZpbGVzIiwiY29sb3JQcm9maWxlUHJvcGVydHkiLCJ0YW5kZW0iLCJHRU5FUkFMX1ZJRVciLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9GZWF0dXJlZCIsInZhbGlkVmFsdWVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJjb2xvclByb2ZpbGVQcm9wZXJ0eS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaW5nbGV0b24gUHJvcGVydHk8c3RyaW5nPiB3aGljaCBjaG9vc2VzIGJldHdlZW4gdGhlIGF2YWlsYWJsZSBjb2xvciBwcm9maWxlcyBvZiBhIHNpbXVsYXRpb24sIHN1Y2ggYXMgJ2RlZmF1bHQnLFxyXG4gKiAncHJvamVjdCcsICdiYXNpY3MnLCBldGMuXHJcbiAqXHJcbiAqIFRoZSBjb2xvciBwcm9maWxlIG5hbWVzIGF2YWlsYWJsZSB0byBhIHNpbXVsYXRpb24gYXJlIHNwZWNpZmllZCBpbiBwYWNrYWdlLmpzb24gdW5kZXIgcGhldC5jb2xvclByb2ZpbGVzIChvciwgaWYgbm90XHJcbiAqIHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gWyBcImRlZmF1bHRcIiBdLiAgVGhlIGZpcnN0IGNvbG9yIHByb2ZpbGUgdGhhdCBpcyBsaXN0ZWQgd2lsbCBhcHBlYXIgaW4gdGhlIHNpbSBvbiBzdGFydHVwLFxyXG4gKiB1bmxlc3Mgb3ZlcnJpZGRlbiBieSB0aGUgc2ltIG9yIHRoZSBjb2xvclByb2ZpbGUgcXVlcnkgcGFyYW1ldGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgeyBzY2VuZXJ5LCBTY2VuZXJ5Q29uc3RhbnRzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBVc2UgdGhlIGNvbG9yIHByb2ZpbGUgc3BlY2lmaWVkIGluIHF1ZXJ5IHBhcmFtZXRlcnMsIG9yIGRlZmF1bHQgdG8gJ2RlZmF1bHQnXHJcbmNvbnN0IGluaXRpYWxQcm9maWxlTmFtZSA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuY29sb3JQcm9maWxlJyApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb2xvclByb2ZpbGUgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBTY2VuZXJ5Q29uc3RhbnRzLkRFRkFVTFRfQ09MT1JfUFJPRklMRTtcclxuXHJcbi8vIExpc3Qgb2YgYWxsIHN1cHBvcnRlZCBjb2xvclByb2ZpbGVzIGZvciB0aGlzIHNpbXVsYXRpb25cclxuY29uc3QgY29sb3JQcm9maWxlcyA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5jb2xvclByb2ZpbGVzJyApID8gcGhldC5jaGlwcGVyLmNvbG9yUHJvZmlsZXMgOiBbIFNjZW5lcnlDb25zdGFudHMuREVGQVVMVF9DT0xPUl9QUk9GSUxFIF07XHJcblxyXG4vLyBAcHVibGljIHtQcm9wZXJ0eS48c3RyaW5nPn1cclxuLy8gVGhlIGN1cnJlbnQgcHJvZmlsZSBuYW1lLiBDaGFuZ2UgdGhpcyBQcm9wZXJ0eSdzIHZhbHVlIHRvIGNoYW5nZSB3aGljaCBwcm9maWxlIGlzIGN1cnJlbnRseSBhY3RpdmUuXHJcbmNvbnN0IGNvbG9yUHJvZmlsZVByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCBpbml0aWFsUHJvZmlsZU5hbWUsIHtcclxuICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnY29sb3JQcm9maWxlUHJvcGVydHknICksXHJcbiAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXHJcbiAgdmFsaWRWYWx1ZXM6IGNvbG9yUHJvZmlsZXNcclxufSApO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ2NvbG9yUHJvZmlsZVByb3BlcnR5JywgY29sb3JQcm9maWxlUHJvcGVydHkgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbG9yUHJvZmlsZVByb3BlcnR5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPQSxjQUFjLE1BQU0sb0NBQW9DO0FBQy9ELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsU0FBU0MsT0FBTyxFQUFFQyxnQkFBZ0IsUUFBUSxlQUFlOztBQUV6RDtBQUNBLE1BQU1DLGtCQUFrQixHQUFHQyxDQUFDLENBQUNDLEtBQUssQ0FBRUMsTUFBTSxFQUFFLDJDQUE0QyxDQUFDLEdBQzlEQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxZQUFZLEdBQ3pDUixnQkFBZ0IsQ0FBQ1MscUJBQXFCOztBQUVqRTtBQUNBLE1BQU1DLGFBQWEsR0FBR1IsQ0FBQyxDQUFDQyxLQUFLLENBQUVDLE1BQU0sRUFBRSw0QkFBNkIsQ0FBQyxHQUFHQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0ksYUFBYSxHQUFHLENBQUVWLGdCQUFnQixDQUFDUyxxQkFBcUIsQ0FBRTs7QUFFL0k7QUFDQTtBQUNBLE1BQU1FLG9CQUFvQixHQUFHLElBQUlkLGNBQWMsQ0FBRUksa0JBQWtCLEVBQUU7RUFDbkVXLE1BQU0sRUFBRWQsTUFBTSxDQUFDZSxZQUFZLENBQUNDLFlBQVksQ0FBRSxzQkFBdUIsQ0FBQztFQUNsRUMsY0FBYyxFQUFFLElBQUk7RUFDcEJDLFdBQVcsRUFBRU47QUFDZixDQUFFLENBQUM7QUFFSFgsT0FBTyxDQUFDa0IsUUFBUSxDQUFFLHNCQUFzQixFQUFFTixvQkFBcUIsQ0FBQztBQUVoRSxlQUFlQSxvQkFBb0IifQ==