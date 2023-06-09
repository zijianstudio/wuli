// Copyright 2021-2022, University of Colorado Boulder

/**
 * Query parameters for molecules-and-light.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import greenhouseEffect from '../greenhouseEffect.js';
const GreenhouseEffectQueryParameters = QueryStringMachine.getAll({
  // This threshold value is used to decide when an EnergyAbsorbingEmittingLayer is considered to be in equilibrium,
  // meaning that the amount of incoming energy is close to the amount of outgoing energy.  There is another query
  // parameter that controls the amount of time that this must be true.  This value is in Watts per square meter.  See
  // https://github.com/phetsims/greenhouse-effect/issues/137 for more information.
  // TODO: Prior to initial publication, this query parameter should be removed and the value incorporated directly into the code, see https://github.com/phetsims/greenhouse-effect/issues/137
  atEquilibriumThreshold: {
    type: 'number',
    defaultValue: 0.004
  },
  // This value is used in conjunction with atEquilibriumThreshold to decide whether an EnergyAbsorbingEmittingLayer is
  // in energy equilibrium.  To be considered to be in equilibrium, the net different between incoming and radiated
  // energy must be less than the threshold for the at-equilibrium time.  This value is in seconds.  See
  // https://github.com/phetsims/greenhouse-effect/issues/137 for more information.
  // TODO: Prior to initial publication, this query parameter should be removed and the value incorporated directly into the code, see https://github.com/phetsims/greenhouse-effect/issues/137
  atEquilibriumTime: {
    type: 'number',
    defaultValue: 2.0
  },
  // The default temperature units to use, meaning the units that all thermometers will be set to on startup and after a
  // reset.  The valid values represent Kelvin, degrees Celsius, and degrees Fahrenheit.
  defaultTemperatureUnits: {
    type: 'string',
    validValues: ['K', 'C', 'F'],
    defaultValue: 'C'
  },
  // Enables the feature that shows cueing arrows on the flux sensor.  This sets the initial value of
  // GreenhouseEffectOptions.cueingArrowsEnabledProperty.
  cueingArrowsEnabled: {
    type: 'boolean',
    defaultValue: true,
    public: true
  },
  // a flag that starts the launches the sim with the sunlight initially started, for ease of development
  initiallyStarted: {
    type: 'boolean',
    defaultValue: false
  },
  // whether or not to run with customizations for Open Sci Ed
  openSciEd: {
    type: 'flag'
  },
  // Show additional digits on the temperature readout.  This can be useful for fine-tuning of albedo and gas
  // concentration values.
  showAdditionalTemperatureDigits: {
    type: 'flag'
  },
  // show representations of the energy absorbing/emitting layers on the screens where they are usually not visible
  showAllLayers: {
    type: 'flag'
  },
  // show representations of the energy absorbing/emitting layers on the screens where they are usually not visible
  waveGapsEnabled: {
    type: 'boolean',
    defaultValue: false
  }
});
greenhouseEffect.register('GreenhouseEffectQueryParameters', GreenhouseEffectQueryParameters);
export default GreenhouseEffectQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImF0RXF1aWxpYnJpdW1UaHJlc2hvbGQiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiYXRFcXVpbGlicml1bVRpbWUiLCJkZWZhdWx0VGVtcGVyYXR1cmVVbml0cyIsInZhbGlkVmFsdWVzIiwiY3VlaW5nQXJyb3dzRW5hYmxlZCIsInB1YmxpYyIsImluaXRpYWxseVN0YXJ0ZWQiLCJvcGVuU2NpRWQiLCJzaG93QWRkaXRpb25hbFRlbXBlcmF0dXJlRGlnaXRzIiwic2hvd0FsbExheWVycyIsIndhdmVHYXBzRW5hYmxlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIGZvciBtb2xlY3VsZXMtYW5kLWxpZ2h0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuXHJcbmNvbnN0IEdyZWVuaG91c2VFZmZlY3RRdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vIFRoaXMgdGhyZXNob2xkIHZhbHVlIGlzIHVzZWQgdG8gZGVjaWRlIHdoZW4gYW4gRW5lcmd5QWJzb3JiaW5nRW1pdHRpbmdMYXllciBpcyBjb25zaWRlcmVkIHRvIGJlIGluIGVxdWlsaWJyaXVtLFxyXG4gIC8vIG1lYW5pbmcgdGhhdCB0aGUgYW1vdW50IG9mIGluY29taW5nIGVuZXJneSBpcyBjbG9zZSB0byB0aGUgYW1vdW50IG9mIG91dGdvaW5nIGVuZXJneS4gIFRoZXJlIGlzIGFub3RoZXIgcXVlcnlcclxuICAvLyBwYXJhbWV0ZXIgdGhhdCBjb250cm9scyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGlzIG11c3QgYmUgdHJ1ZS4gIFRoaXMgdmFsdWUgaXMgaW4gV2F0dHMgcGVyIHNxdWFyZSBtZXRlci4gIFNlZVxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmVlbmhvdXNlLWVmZmVjdC9pc3N1ZXMvMTM3IGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIC8vIFRPRE86IFByaW9yIHRvIGluaXRpYWwgcHVibGljYXRpb24sIHRoaXMgcXVlcnkgcGFyYW1ldGVyIHNob3VsZCBiZSByZW1vdmVkIGFuZCB0aGUgdmFsdWUgaW5jb3Jwb3JhdGVkIGRpcmVjdGx5IGludG8gdGhlIGNvZGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JlZW5ob3VzZS1lZmZlY3QvaXNzdWVzLzEzN1xyXG4gIGF0RXF1aWxpYnJpdW1UaHJlc2hvbGQ6IHsgdHlwZTogJ251bWJlcicsIGRlZmF1bHRWYWx1ZTogMC4wMDQgfSxcclxuXHJcbiAgLy8gVGhpcyB2YWx1ZSBpcyB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYXRFcXVpbGlicml1bVRocmVzaG9sZCB0byBkZWNpZGUgd2hldGhlciBhbiBFbmVyZ3lBYnNvcmJpbmdFbWl0dGluZ0xheWVyIGlzXHJcbiAgLy8gaW4gZW5lcmd5IGVxdWlsaWJyaXVtLiAgVG8gYmUgY29uc2lkZXJlZCB0byBiZSBpbiBlcXVpbGlicml1bSwgdGhlIG5ldCBkaWZmZXJlbnQgYmV0d2VlbiBpbmNvbWluZyBhbmQgcmFkaWF0ZWRcclxuICAvLyBlbmVyZ3kgbXVzdCBiZSBsZXNzIHRoYW4gdGhlIHRocmVzaG9sZCBmb3IgdGhlIGF0LWVxdWlsaWJyaXVtIHRpbWUuICBUaGlzIHZhbHVlIGlzIGluIHNlY29uZHMuICBTZWVcclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JlZW5ob3VzZS1lZmZlY3QvaXNzdWVzLzEzNyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAvLyBUT0RPOiBQcmlvciB0byBpbml0aWFsIHB1YmxpY2F0aW9uLCB0aGlzIHF1ZXJ5IHBhcmFtZXRlciBzaG91bGQgYmUgcmVtb3ZlZCBhbmQgdGhlIHZhbHVlIGluY29ycG9yYXRlZCBkaXJlY3RseSBpbnRvIHRoZSBjb2RlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyZWVuaG91c2UtZWZmZWN0L2lzc3Vlcy8xMzdcclxuICBhdEVxdWlsaWJyaXVtVGltZTogeyB0eXBlOiAnbnVtYmVyJywgZGVmYXVsdFZhbHVlOiAyLjAgfSxcclxuXHJcbiAgLy8gVGhlIGRlZmF1bHQgdGVtcGVyYXR1cmUgdW5pdHMgdG8gdXNlLCBtZWFuaW5nIHRoZSB1bml0cyB0aGF0IGFsbCB0aGVybW9tZXRlcnMgd2lsbCBiZSBzZXQgdG8gb24gc3RhcnR1cCBhbmQgYWZ0ZXIgYVxyXG4gIC8vIHJlc2V0LiAgVGhlIHZhbGlkIHZhbHVlcyByZXByZXNlbnQgS2VsdmluLCBkZWdyZWVzIENlbHNpdXMsIGFuZCBkZWdyZWVzIEZhaHJlbmhlaXQuXHJcbiAgZGVmYXVsdFRlbXBlcmF0dXJlVW5pdHM6IHtcclxuICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgdmFsaWRWYWx1ZXM6IFsgJ0snLCAnQycsICdGJyBdLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAnQydcclxuICB9LFxyXG5cclxuICAvLyBFbmFibGVzIHRoZSBmZWF0dXJlIHRoYXQgc2hvd3MgY3VlaW5nIGFycm93cyBvbiB0aGUgZmx1eCBzZW5zb3IuICBUaGlzIHNldHMgdGhlIGluaXRpYWwgdmFsdWUgb2ZcclxuICAvLyBHcmVlbmhvdXNlRWZmZWN0T3B0aW9ucy5jdWVpbmdBcnJvd3NFbmFibGVkUHJvcGVydHkuXHJcbiAgY3VlaW5nQXJyb3dzRW5hYmxlZDoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgLy8gYSBmbGFnIHRoYXQgc3RhcnRzIHRoZSBsYXVuY2hlcyB0aGUgc2ltIHdpdGggdGhlIHN1bmxpZ2h0IGluaXRpYWxseSBzdGFydGVkLCBmb3IgZWFzZSBvZiBkZXZlbG9wbWVudFxyXG4gIGluaXRpYWxseVN0YXJ0ZWQ6IHsgdHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0sXHJcblxyXG4gIC8vIHdoZXRoZXIgb3Igbm90IHRvIHJ1biB3aXRoIGN1c3RvbWl6YXRpb25zIGZvciBPcGVuIFNjaSBFZFxyXG4gIG9wZW5TY2lFZDogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gU2hvdyBhZGRpdGlvbmFsIGRpZ2l0cyBvbiB0aGUgdGVtcGVyYXR1cmUgcmVhZG91dC4gIFRoaXMgY2FuIGJlIHVzZWZ1bCBmb3IgZmluZS10dW5pbmcgb2YgYWxiZWRvIGFuZCBnYXNcclxuICAvLyBjb25jZW50cmF0aW9uIHZhbHVlcy5cclxuICBzaG93QWRkaXRpb25hbFRlbXBlcmF0dXJlRGlnaXRzOiB7IHR5cGU6ICdmbGFnJyB9LFxyXG5cclxuICAvLyBzaG93IHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgZW5lcmd5IGFic29yYmluZy9lbWl0dGluZyBsYXllcnMgb24gdGhlIHNjcmVlbnMgd2hlcmUgdGhleSBhcmUgdXN1YWxseSBub3QgdmlzaWJsZVxyXG4gIHNob3dBbGxMYXllcnM6IHsgdHlwZTogJ2ZsYWcnIH0sXHJcblxyXG4gIC8vIHNob3cgcmVwcmVzZW50YXRpb25zIG9mIHRoZSBlbmVyZ3kgYWJzb3JiaW5nL2VtaXR0aW5nIGxheWVycyBvbiB0aGUgc2NyZWVucyB3aGVyZSB0aGV5IGFyZSB1c3VhbGx5IG5vdCB2aXNpYmxlXHJcbiAgd2F2ZUdhcHNFbmFibGVkOiB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdFZhbHVlOiBmYWxzZSB9XHJcbn0gKTtcclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdHcmVlbmhvdXNlRWZmZWN0UXVlcnlQYXJhbWV0ZXJzJywgR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgR3JlZW5ob3VzZUVmZmVjdFF1ZXJ5UGFyYW1ldGVyczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBRXJELE1BQU1DLCtCQUErQixHQUFHQyxrQkFBa0IsQ0FBQ0MsTUFBTSxDQUFFO0VBRWpFO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQUMsc0JBQXNCLEVBQUU7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQU0sQ0FBQztFQUUvRDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0FDLGlCQUFpQixFQUFFO0lBQUVGLElBQUksRUFBRSxRQUFRO0lBQUVDLFlBQVksRUFBRTtFQUFJLENBQUM7RUFFeEQ7RUFDQTtFQUNBRSx1QkFBdUIsRUFBRTtJQUN2QkgsSUFBSSxFQUFFLFFBQVE7SUFDZEksV0FBVyxFQUFFLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUU7SUFDOUJILFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBSSxtQkFBbUIsRUFBRTtJQUNuQkwsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFLElBQUk7SUFDbEJLLE1BQU0sRUFBRTtFQUNWLENBQUM7RUFFRDtFQUNBQyxnQkFBZ0IsRUFBRTtJQUFFUCxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDO0VBRTFEO0VBQ0FPLFNBQVMsRUFBRTtJQUFFUixJQUFJLEVBQUU7RUFBTyxDQUFDO0VBRTNCO0VBQ0E7RUFDQVMsK0JBQStCLEVBQUU7SUFBRVQsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUVqRDtFQUNBVSxhQUFhLEVBQUU7SUFBRVYsSUFBSSxFQUFFO0VBQU8sQ0FBQztFQUUvQjtFQUNBVyxlQUFlLEVBQUU7SUFBRVgsSUFBSSxFQUFFLFNBQVM7SUFBRUMsWUFBWSxFQUFFO0VBQU07QUFDMUQsQ0FBRSxDQUFDO0FBRUhOLGdCQUFnQixDQUFDaUIsUUFBUSxDQUFFLGlDQUFpQyxFQUFFaEIsK0JBQWdDLENBQUM7QUFFL0YsZUFBZUEsK0JBQStCIn0=