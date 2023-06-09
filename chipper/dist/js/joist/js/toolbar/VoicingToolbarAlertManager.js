// Copyright 2021-2023, University of Colorado Boulder

/**
 * Abstract class that creates alert content for the VoicingToolbarItem. Buttons in that item will call these
 * functions to create content that is spoken using speech synthesis. Extend this class and implement these
 * functions. Then pass this as an entry to the PreferencesModel when creating a Sim.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
class VoicingToolbarAlertManager {
  // The active Screen for the simulation, to generate Voicing descriptions that are related to the active screen.

  /**
   * @param screenProperty - indicates the active screen
   */
  constructor(screenProperty) {
    this.screenProperty = screenProperty;
  }

  /**
   * Create the alert content for the simulation overview for the "Overview" button.
   */
  createOverviewContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert(screenView, 'view needs to be inititalized for voicing toolbar content');
    return screenView.getVoicingOverviewContent();
  }

  /**
   * Creates the alert content for the simulation details when the "Current Details"
   * button is pressed.
   */
  createDetailsContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert(screenView, 'view needs to be inititalized for voicing toolbar content');
    return screenView.getVoicingDetailsContent();
  }

  /**
   * Creates the alert content for an interaction hint when the "Hint" button is pressed.
   */
  createHintContent() {
    const screenView = this.screenProperty.value.view;
    assert && assert(screenView, 'view needs to be inititalized for voicing toolbar content');
    return this.screenProperty.value.view.getVoicingHintContent();
  }
}
joist.register('VoicingToolbarAlertManager', VoicingToolbarAlertManager);
export default VoicingToolbarAlertManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJqb2lzdCIsIlZvaWNpbmdUb29sYmFyQWxlcnRNYW5hZ2VyIiwiY29uc3RydWN0b3IiLCJzY3JlZW5Qcm9wZXJ0eSIsImNyZWF0ZU92ZXJ2aWV3Q29udGVudCIsInNjcmVlblZpZXciLCJ2YWx1ZSIsInZpZXciLCJhc3NlcnQiLCJnZXRWb2ljaW5nT3ZlcnZpZXdDb250ZW50IiwiY3JlYXRlRGV0YWlsc0NvbnRlbnQiLCJnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQiLCJjcmVhdGVIaW50Q29udGVudCIsImdldFZvaWNpbmdIaW50Q29udGVudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVm9pY2luZ1Rvb2xiYXJBbGVydE1hbmFnZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWJzdHJhY3QgY2xhc3MgdGhhdCBjcmVhdGVzIGFsZXJ0IGNvbnRlbnQgZm9yIHRoZSBWb2ljaW5nVG9vbGJhckl0ZW0uIEJ1dHRvbnMgaW4gdGhhdCBpdGVtIHdpbGwgY2FsbCB0aGVzZVxyXG4gKiBmdW5jdGlvbnMgdG8gY3JlYXRlIGNvbnRlbnQgdGhhdCBpcyBzcG9rZW4gdXNpbmcgc3BlZWNoIHN5bnRoZXNpcy4gRXh0ZW5kIHRoaXMgY2xhc3MgYW5kIGltcGxlbWVudCB0aGVzZVxyXG4gKiBmdW5jdGlvbnMuIFRoZW4gcGFzcyB0aGlzIGFzIGFuIGVudHJ5IHRvIHRoZSBQcmVmZXJlbmNlc01vZGVsIHdoZW4gY3JlYXRpbmcgYSBTaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcclxuaW1wb3J0IHsgQW55U2NyZWVuIH0gZnJvbSAnLi4vU2NyZWVuLmpzJztcclxuXHJcbmNsYXNzIFZvaWNpbmdUb29sYmFyQWxlcnRNYW5hZ2VyIHtcclxuXHJcbiAgLy8gVGhlIGFjdGl2ZSBTY3JlZW4gZm9yIHRoZSBzaW11bGF0aW9uLCB0byBnZW5lcmF0ZSBWb2ljaW5nIGRlc2NyaXB0aW9ucyB0aGF0IGFyZSByZWxhdGVkIHRvIHRoZSBhY3RpdmUgc2NyZWVuLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NyZWVuUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEFueVNjcmVlbj47XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBzY3JlZW5Qcm9wZXJ0eSAtIGluZGljYXRlcyB0aGUgYWN0aXZlIHNjcmVlblxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEFueVNjcmVlbj4gKSB7XHJcbiAgICB0aGlzLnNjcmVlblByb3BlcnR5ID0gc2NyZWVuUHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGFsZXJ0IGNvbnRlbnQgZm9yIHRoZSBzaW11bGF0aW9uIG92ZXJ2aWV3IGZvciB0aGUgXCJPdmVydmlld1wiIGJ1dHRvbi5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlT3ZlcnZpZXdDb250ZW50KCk6IFNwZWFrYWJsZVJlc29sdmVkUmVzcG9uc2Uge1xyXG4gICAgY29uc3Qgc2NyZWVuVmlldyA9IHRoaXMuc2NyZWVuUHJvcGVydHkudmFsdWUudmlldztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjcmVlblZpZXcsICd2aWV3IG5lZWRzIHRvIGJlIGluaXRpdGFsaXplZCBmb3Igdm9pY2luZyB0b29sYmFyIGNvbnRlbnQnICk7XHJcbiAgICByZXR1cm4gc2NyZWVuVmlldy5nZXRWb2ljaW5nT3ZlcnZpZXdDb250ZW50KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBhbGVydCBjb250ZW50IGZvciB0aGUgc2ltdWxhdGlvbiBkZXRhaWxzIHdoZW4gdGhlIFwiQ3VycmVudCBEZXRhaWxzXCJcclxuICAgKiBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlRGV0YWlsc0NvbnRlbnQoKTogU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSB7XHJcbiAgICBjb25zdCBzY3JlZW5WaWV3ID0gdGhpcy5zY3JlZW5Qcm9wZXJ0eS52YWx1ZS52aWV3O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuVmlldywgJ3ZpZXcgbmVlZHMgdG8gYmUgaW5pdGl0YWxpemVkIGZvciB2b2ljaW5nIHRvb2xiYXIgY29udGVudCcgKTtcclxuICAgIHJldHVybiBzY3JlZW5WaWV3LmdldFZvaWNpbmdEZXRhaWxzQ29udGVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgYWxlcnQgY29udGVudCBmb3IgYW4gaW50ZXJhY3Rpb24gaGludCB3aGVuIHRoZSBcIkhpbnRcIiBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlSGludENvbnRlbnQoKTogU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSB7XHJcbiAgICBjb25zdCBzY3JlZW5WaWV3ID0gdGhpcy5zY3JlZW5Qcm9wZXJ0eS52YWx1ZS52aWV3O1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuVmlldywgJ3ZpZXcgbmVlZHMgdG8gYmUgaW5pdGl0YWxpemVkIGZvciB2b2ljaW5nIHRvb2xiYXIgY29udGVudCcgKTtcclxuICAgIHJldHVybiB0aGlzLnNjcmVlblByb3BlcnR5LnZhbHVlLnZpZXcuZ2V0Vm9pY2luZ0hpbnRDb250ZW50KCk7XHJcbiAgfVxyXG59XHJcblxyXG5qb2lzdC5yZWdpc3RlciggJ1ZvaWNpbmdUb29sYmFyQWxlcnRNYW5hZ2VyJywgVm9pY2luZ1Rvb2xiYXJBbGVydE1hbmFnZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgVm9pY2luZ1Rvb2xiYXJBbGVydE1hbmFnZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxLQUFLLE1BQU0sYUFBYTtBQUcvQixNQUFNQywwQkFBMEIsQ0FBQztFQUUvQjs7RUFHQTtBQUNGO0FBQ0E7RUFDU0MsV0FBV0EsQ0FBRUMsY0FBNEMsRUFBRztJQUNqRSxJQUFJLENBQUNBLGNBQWMsR0FBR0EsY0FBYztFQUN0Qzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MscUJBQXFCQSxDQUFBLEVBQThCO0lBQ3hELE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNGLGNBQWMsQ0FBQ0csS0FBSyxDQUFDQyxJQUFJO0lBQ2pEQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsVUFBVSxFQUFFLDJEQUE0RCxDQUFDO0lBQzNGLE9BQU9BLFVBQVUsQ0FBQ0kseUJBQXlCLENBQUMsQ0FBQztFQUMvQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTQyxvQkFBb0JBLENBQUEsRUFBOEI7SUFDdkQsTUFBTUwsVUFBVSxHQUFHLElBQUksQ0FBQ0YsY0FBYyxDQUFDRyxLQUFLLENBQUNDLElBQUk7SUFDakRDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCxVQUFVLEVBQUUsMkRBQTRELENBQUM7SUFDM0YsT0FBT0EsVUFBVSxDQUFDTSx3QkFBd0IsQ0FBQyxDQUFDO0VBQzlDOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxpQkFBaUJBLENBQUEsRUFBOEI7SUFDcEQsTUFBTVAsVUFBVSxHQUFHLElBQUksQ0FBQ0YsY0FBYyxDQUFDRyxLQUFLLENBQUNDLElBQUk7SUFDakRDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSCxVQUFVLEVBQUUsMkRBQTRELENBQUM7SUFDM0YsT0FBTyxJQUFJLENBQUNGLGNBQWMsQ0FBQ0csS0FBSyxDQUFDQyxJQUFJLENBQUNNLHFCQUFxQixDQUFDLENBQUM7RUFDL0Q7QUFDRjtBQUVBYixLQUFLLENBQUNjLFFBQVEsQ0FBRSw0QkFBNEIsRUFBRWIsMEJBQTJCLENBQUM7QUFDMUUsZUFBZUEsMEJBQTBCIn0=