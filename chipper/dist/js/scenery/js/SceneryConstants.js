// Copyright 2021-2022, University of Colorado Boulder

/**
 * SceneryConstants is a collection of constants used throughout scenery.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { scenery } from './imports.js';
const SceneryConstants = {
  // Opacity that is typically applied to a UI component in its disabled state, to make it look grayed out.
  // This was moved here from SunConstants because it's needed by FlowBox.
  // See https://github.com/phetsims/scenery/issues/1153
  DISABLED_OPACITY: 0.45,
  // The name of the color profile used by default.
  // NOTE: Duplicated in initialize-globals.js.  Duplicated because scenery doesn't include initialize-globals in its
  // standalone build.
  DEFAULT_COLOR_PROFILE: 'default',
  // The name of the color profile used for projector mode
  PROJECTOR_COLOR_PROFILE: 'projector'
};
scenery.register('SceneryConstants', SceneryConstants);
export default SceneryConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2VuZXJ5IiwiU2NlbmVyeUNvbnN0YW50cyIsIkRJU0FCTEVEX09QQUNJVFkiLCJERUZBVUxUX0NPTE9SX1BST0ZJTEUiLCJQUk9KRUNUT1JfQ09MT1JfUFJPRklMRSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2NlbmVyeUNvbnN0YW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5Q29uc3RhbnRzIGlzIGEgY29sbGVjdGlvbiBvZiBjb25zdGFudHMgdXNlZCB0aHJvdWdob3V0IHNjZW5lcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgc2NlbmVyeSB9IGZyb20gJy4vaW1wb3J0cy5qcyc7XHJcblxyXG5jb25zdCBTY2VuZXJ5Q29uc3RhbnRzID0ge1xyXG5cclxuICAvLyBPcGFjaXR5IHRoYXQgaXMgdHlwaWNhbGx5IGFwcGxpZWQgdG8gYSBVSSBjb21wb25lbnQgaW4gaXRzIGRpc2FibGVkIHN0YXRlLCB0byBtYWtlIGl0IGxvb2sgZ3JheWVkIG91dC5cclxuICAvLyBUaGlzIHdhcyBtb3ZlZCBoZXJlIGZyb20gU3VuQ29uc3RhbnRzIGJlY2F1c2UgaXQncyBuZWVkZWQgYnkgRmxvd0JveC5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzExNTNcclxuICBESVNBQkxFRF9PUEFDSVRZOiAwLjQ1LFxyXG5cclxuICAvLyBUaGUgbmFtZSBvZiB0aGUgY29sb3IgcHJvZmlsZSB1c2VkIGJ5IGRlZmF1bHQuXHJcbiAgLy8gTk9URTogRHVwbGljYXRlZCBpbiBpbml0aWFsaXplLWdsb2JhbHMuanMuICBEdXBsaWNhdGVkIGJlY2F1c2Ugc2NlbmVyeSBkb2Vzbid0IGluY2x1ZGUgaW5pdGlhbGl6ZS1nbG9iYWxzIGluIGl0c1xyXG4gIC8vIHN0YW5kYWxvbmUgYnVpbGQuXHJcbiAgREVGQVVMVF9DT0xPUl9QUk9GSUxFOiAnZGVmYXVsdCcsXHJcblxyXG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBjb2xvciBwcm9maWxlIHVzZWQgZm9yIHByb2plY3RvciBtb2RlXHJcbiAgUFJPSkVDVE9SX0NPTE9SX1BST0ZJTEU6ICdwcm9qZWN0b3InXHJcbn07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU2NlbmVyeUNvbnN0YW50cycsIFNjZW5lcnlDb25zdGFudHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgU2NlbmVyeUNvbnN0YW50czsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsT0FBTyxRQUFRLGNBQWM7QUFFdEMsTUFBTUMsZ0JBQWdCLEdBQUc7RUFFdkI7RUFDQTtFQUNBO0VBQ0FDLGdCQUFnQixFQUFFLElBQUk7RUFFdEI7RUFDQTtFQUNBO0VBQ0FDLHFCQUFxQixFQUFFLFNBQVM7RUFFaEM7RUFDQUMsdUJBQXVCLEVBQUU7QUFDM0IsQ0FBQztBQUVESixPQUFPLENBQUNLLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRUosZ0JBQWlCLENBQUM7QUFDeEQsZUFBZUEsZ0JBQWdCIn0=