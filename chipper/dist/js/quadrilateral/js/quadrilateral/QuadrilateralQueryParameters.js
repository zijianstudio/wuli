// Copyright 2021-2023, University of Colorado Boulder

/**
 * Query parameters for this simulation.
 *
 * A few of these are marked as `public` for teacher use. The rest are intended for internal use/testing/debugging.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../quadrilateral.js';
const QuadrilateralQueryParameters = QueryStringMachine.getAll({
  // The tolerance interval for the angle calculations which determine when sides opposite sides are parallel.
  // This is in radians, so it is limited between 0 and 2 PI. If maximum value, the quadrilateral will always
  // be a parallelogram.
  parallelAngleToleranceInterval: {
    type: 'number',
    isValidValue: value => value <= 2 * Math.PI && value >= 0,
    defaultValue: 0.0005
  },
  // The default value for the angle tolerance that will be used for single comparisons of one angle against
  // another. Mostly, this is used to determine the quadrilateral shape name. This must be different from
  // the parallelAngleToleranceInterval, which has complex behavior depending on mode of interaction.
  interAngleToleranceInterval: {
    type: 'number',
    isValidValue: value => value <= 2 * Math.PI && value >= 0,
    defaultValue: 0.0001
  },
  // A tolerance interval when comparing an angle to a constant of some kind, such as Math.PI or Math.PI / 2 when
  // determining when angles are right or the shape is concave. This needs to be a separate value from
  // interAngleToleranceInterval because that value involves sums of values and errors get compounded.
  staticAngleToleranceInterval: {
    type: 'number',
    isValidValue: value => value <= 2 * Math.PI && value >= 0,
    defaultValue: 0.0005
  },
  // A tolerance interval for comparing the lengths of two sides.
  interLengthToleranceInterval: {
    type: 'number',
    defaultValue: 0.00095
  },
  // When provided, user has fine control of vertex positions instead of snapping to a coarse grid. More freedom
  // of movement but named shapes will be more difficult to find.
  reducedStepSize: {
    type: 'flag',
    public: true
  },
  // A scale factor to apply to all tolerance intervals when the using ?reducedStepSize.
  // Should be less than one because we want the tolerance intervals to be smaller when using "reduced step size".
  // See https://github.com/phetsims/quadrilateral/issues/197#issuecomment-1258194919
  reducedStepSizeToleranceIntervalScaleFactor: {
    type: 'number',
    isValidValue: value => value < 1,
    defaultValue: 0.05 // makes tolerances intervals 5 percent of the value when "reduced step size" enabled
  },

  // A scale factor applied to all tolerances when connected to a tangible device so that it is easier to find and
  // maintain shapes and important shape Properties for the more macroscopic motion inherent to a physical device.
  // Compounds with reducedStepSizeToleranceIntervalScaleFactor.
  connectedToleranceIntervalScaleFactor: {
    type: 'number',
    defaultValue: 5
  },
  // If provided, some extra things will be done in the simulation to facilitate communication with the hardware/device.
  deviceConnection: {
    type: 'flag'
  },
  // For debugging, shows a panel with the model values
  showModelValues: {
    type: 'flag'
  },
  // If provided, include experimental bluetooth features to connect to an external device that will control
  // the simulation with BLE communication.
  bluetooth: {
    type: 'flag'
  },
  // If provided, include experimental serial communication, and a button to send values to a prototype tangible
  // device.
  serial: {
    type: 'flag'
  },
  // How many values to save when smoothing vertex positions when connected to a bluetooth device. Note that
  // this has no impact on the OpenCV prototype input. Only Bluetooth/Serial connections.
  smoothingLength: {
    type: 'number',
    defaultValue: 5,
    isValidValue: value => value > 0
  },
  // How frequently to update the sim from values provided with a bluetooth device, in seconds. Increasing this
  // may help reduce noise if random values come quickly into the simulation.
  bluetoothUpdateInterval: {
    type: 'number',
    defaultValue: 0.1,
    isValidValue: value => value > 0
  },
  // Sets the initial sound design on startup. This sim has two sound designs that the user can select from.
  // It can be set at runtime from Preferences or on load with this query parameter. Query parameter
  // maps to one of the supported sound designs at https://github.com/phetsims/quadrilateral/blob/7a012e768b3ffd480af1651536119b4650cbb14b/js/quadrilateral/model/QuadrilateralSoundOptionsModel.ts#L18-L23
  // shapeLayer -> TRACKS_LAYER sound design
  // shapeUnique -> TRACKS_UNIQUE sound design
  soundDesign: {
    type: 'string',
    public: true,
    defaultValue: 'shapeLayer',
    validValues: ['shapeLayer', 'shapeUnique']
  },
  // When present, the "layer" sound design is modified to include trapezoid sounds for shapes that inherit
  // geometric properties of the trapezoid. Teachers may not want to indicate that child shapes are actually
  // inclusive of trapezoid properties, so this is only added by request. See
  // https://github.com/phetsims/quadrilateral/issues/420
  inheritTrapezoidSound: {
    type: 'flag',
    public: true
  },
  /**
   * Controls the interval that the QuadrilateralVertex will be constrained to
   */
  majorVertexInterval: {
    type: 'number',
    defaultValue: 0.25,
    isValidValue: value => value > 0
  },
  /**
   * Controls the "minor" vertex interval. This acts as the smaller keyboard step size for keyboard input. Note
   * that the default uses the same value as majorVertexInterval.
   */
  minorVertexInterval: {
    type: 'number',
    defaultValue: 0.0625,
    isValidValue: value => value > 0
  },
  // A query parameter to control the deviceGridSpacingProperty - constrains the vertex positions to intervals of this
  // value. Useful when connected to a device with noisy sensors because it requires larger changes in value to
  // update a vertex position. Default value matches minorVertexInterval so the vertices snap to the minor grid
  // lines.
  deviceGridSpacing: {
    type: 'number',
    defaultValue: 0.0625,
    isValidValue: value => value <= 5 * 0.05
  }
});
quadrilateral.register('QuadrilateralQueryParameters', QuadrilateralQueryParameters);
export default QuadrilateralQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsInBhcmFsbGVsQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCIsInR5cGUiLCJpc1ZhbGlkVmFsdWUiLCJ2YWx1ZSIsIk1hdGgiLCJQSSIsImRlZmF1bHRWYWx1ZSIsImludGVyQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCIsInN0YXRpY0FuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwiLCJpbnRlckxlbmd0aFRvbGVyYW5jZUludGVydmFsIiwicmVkdWNlZFN0ZXBTaXplIiwicHVibGljIiwicmVkdWNlZFN0ZXBTaXplVG9sZXJhbmNlSW50ZXJ2YWxTY2FsZUZhY3RvciIsImNvbm5lY3RlZFRvbGVyYW5jZUludGVydmFsU2NhbGVGYWN0b3IiLCJkZXZpY2VDb25uZWN0aW9uIiwic2hvd01vZGVsVmFsdWVzIiwiYmx1ZXRvb3RoIiwic2VyaWFsIiwic21vb3RoaW5nTGVuZ3RoIiwiYmx1ZXRvb3RoVXBkYXRlSW50ZXJ2YWwiLCJzb3VuZERlc2lnbiIsInZhbGlkVmFsdWVzIiwiaW5oZXJpdFRyYXBlem9pZFNvdW5kIiwibWFqb3JWZXJ0ZXhJbnRlcnZhbCIsIm1pbm9yVmVydGV4SW50ZXJ2YWwiLCJkZXZpY2VHcmlkU3BhY2luZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGlzIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEEgZmV3IG9mIHRoZXNlIGFyZSBtYXJrZWQgYXMgYHB1YmxpY2AgZm9yIHRlYWNoZXIgdXNlLiBUaGUgcmVzdCBhcmUgaW50ZW5kZWQgZm9yIGludGVybmFsIHVzZS90ZXN0aW5nL2RlYnVnZ2luZy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHF1YWRyaWxhdGVyYWwgZnJvbSAnLi4vcXVhZHJpbGF0ZXJhbC5qcyc7XHJcblxyXG5jb25zdCBRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldEFsbCgge1xyXG5cclxuICAvLyBUaGUgdG9sZXJhbmNlIGludGVydmFsIGZvciB0aGUgYW5nbGUgY2FsY3VsYXRpb25zIHdoaWNoIGRldGVybWluZSB3aGVuIHNpZGVzIG9wcG9zaXRlIHNpZGVzIGFyZSBwYXJhbGxlbC5cclxuICAvLyBUaGlzIGlzIGluIHJhZGlhbnMsIHNvIGl0IGlzIGxpbWl0ZWQgYmV0d2VlbiAwIGFuZCAyIFBJLiBJZiBtYXhpbXVtIHZhbHVlLCB0aGUgcXVhZHJpbGF0ZXJhbCB3aWxsIGFsd2F5c1xyXG4gIC8vIGJlIGEgcGFyYWxsZWxvZ3JhbS5cclxuICBwYXJhbGxlbEFuZ2xlVG9sZXJhbmNlSW50ZXJ2YWw6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA8PSAoIDIgKiBNYXRoLlBJICkgJiYgdmFsdWUgPj0gMCxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4wMDA1XHJcbiAgfSxcclxuXHJcbiAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBhbmdsZSB0b2xlcmFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHNpbmdsZSBjb21wYXJpc29ucyBvZiBvbmUgYW5nbGUgYWdhaW5zdFxyXG4gIC8vIGFub3RoZXIuIE1vc3RseSwgdGhpcyBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgcXVhZHJpbGF0ZXJhbCBzaGFwZSBuYW1lLiBUaGlzIG11c3QgYmUgZGlmZmVyZW50IGZyb21cclxuICAvLyB0aGUgcGFyYWxsZWxBbmdsZVRvbGVyYW5jZUludGVydmFsLCB3aGljaCBoYXMgY29tcGxleCBiZWhhdmlvciBkZXBlbmRpbmcgb24gbW9kZSBvZiBpbnRlcmFjdGlvbi5cclxuICBpbnRlckFuZ2xlVG9sZXJhbmNlSW50ZXJ2YWw6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA8PSAoIDIgKiBNYXRoLlBJICkgJiYgdmFsdWUgPj0gMCxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4wMDAxXHJcbiAgfSxcclxuXHJcbiAgLy8gQSB0b2xlcmFuY2UgaW50ZXJ2YWwgd2hlbiBjb21wYXJpbmcgYW4gYW5nbGUgdG8gYSBjb25zdGFudCBvZiBzb21lIGtpbmQsIHN1Y2ggYXMgTWF0aC5QSSBvciBNYXRoLlBJIC8gMiB3aGVuXHJcbiAgLy8gZGV0ZXJtaW5pbmcgd2hlbiBhbmdsZXMgYXJlIHJpZ2h0IG9yIHRoZSBzaGFwZSBpcyBjb25jYXZlLiBUaGlzIG5lZWRzIHRvIGJlIGEgc2VwYXJhdGUgdmFsdWUgZnJvbVxyXG4gIC8vIGludGVyQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCBiZWNhdXNlIHRoYXQgdmFsdWUgaW52b2x2ZXMgc3VtcyBvZiB2YWx1ZXMgYW5kIGVycm9ycyBnZXQgY29tcG91bmRlZC5cclxuICBzdGF0aWNBbmdsZVRvbGVyYW5jZUludGVydmFsOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gdmFsdWUgPD0gKCAyICogTWF0aC5QSSApICYmIHZhbHVlID49IDAsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMDAwNVxyXG4gIH0sXHJcblxyXG4gIC8vIEEgdG9sZXJhbmNlIGludGVydmFsIGZvciBjb21wYXJpbmcgdGhlIGxlbmd0aHMgb2YgdHdvIHNpZGVzLlxyXG4gIGludGVyTGVuZ3RoVG9sZXJhbmNlSW50ZXJ2YWw6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjAwMDk1XHJcbiAgfSxcclxuXHJcbiAgLy8gV2hlbiBwcm92aWRlZCwgdXNlciBoYXMgZmluZSBjb250cm9sIG9mIHZlcnRleCBwb3NpdGlvbnMgaW5zdGVhZCBvZiBzbmFwcGluZyB0byBhIGNvYXJzZSBncmlkLiBNb3JlIGZyZWVkb21cclxuICAvLyBvZiBtb3ZlbWVudCBidXQgbmFtZWQgc2hhcGVzIHdpbGwgYmUgbW9yZSBkaWZmaWN1bHQgdG8gZmluZC5cclxuICByZWR1Y2VkU3RlcFNpemU6IHtcclxuICAgIHR5cGU6ICdmbGFnJyxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vIEEgc2NhbGUgZmFjdG9yIHRvIGFwcGx5IHRvIGFsbCB0b2xlcmFuY2UgaW50ZXJ2YWxzIHdoZW4gdGhlIHVzaW5nID9yZWR1Y2VkU3RlcFNpemUuXHJcbiAgLy8gU2hvdWxkIGJlIGxlc3MgdGhhbiBvbmUgYmVjYXVzZSB3ZSB3YW50IHRoZSB0b2xlcmFuY2UgaW50ZXJ2YWxzIHRvIGJlIHNtYWxsZXIgd2hlbiB1c2luZyBcInJlZHVjZWQgc3RlcCBzaXplXCIuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWFkcmlsYXRlcmFsL2lzc3Vlcy8xOTcjaXNzdWVjb21tZW50LTEyNTgxOTQ5MTlcclxuICByZWR1Y2VkU3RlcFNpemVUb2xlcmFuY2VJbnRlcnZhbFNjYWxlRmFjdG9yOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gdmFsdWUgPCAxLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjA1IC8vIG1ha2VzIHRvbGVyYW5jZXMgaW50ZXJ2YWxzIDUgcGVyY2VudCBvZiB0aGUgdmFsdWUgd2hlbiBcInJlZHVjZWQgc3RlcCBzaXplXCIgZW5hYmxlZFxyXG4gIH0sXHJcblxyXG4gIC8vIEEgc2NhbGUgZmFjdG9yIGFwcGxpZWQgdG8gYWxsIHRvbGVyYW5jZXMgd2hlbiBjb25uZWN0ZWQgdG8gYSB0YW5naWJsZSBkZXZpY2Ugc28gdGhhdCBpdCBpcyBlYXNpZXIgdG8gZmluZCBhbmRcclxuICAvLyBtYWludGFpbiBzaGFwZXMgYW5kIGltcG9ydGFudCBzaGFwZSBQcm9wZXJ0aWVzIGZvciB0aGUgbW9yZSBtYWNyb3Njb3BpYyBtb3Rpb24gaW5oZXJlbnQgdG8gYSBwaHlzaWNhbCBkZXZpY2UuXHJcbiAgLy8gQ29tcG91bmRzIHdpdGggcmVkdWNlZFN0ZXBTaXplVG9sZXJhbmNlSW50ZXJ2YWxTY2FsZUZhY3Rvci5cclxuICBjb25uZWN0ZWRUb2xlcmFuY2VJbnRlcnZhbFNjYWxlRmFjdG9yOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogNVxyXG4gIH0sXHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCBzb21lIGV4dHJhIHRoaW5ncyB3aWxsIGJlIGRvbmUgaW4gdGhlIHNpbXVsYXRpb24gdG8gZmFjaWxpdGF0ZSBjb21tdW5pY2F0aW9uIHdpdGggdGhlIGhhcmR3YXJlL2RldmljZS5cclxuICBkZXZpY2VDb25uZWN0aW9uOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBGb3IgZGVidWdnaW5nLCBzaG93cyBhIHBhbmVsIHdpdGggdGhlIG1vZGVsIHZhbHVlc1xyXG4gIHNob3dNb2RlbFZhbHVlczoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgLy8gSWYgcHJvdmlkZWQsIGluY2x1ZGUgZXhwZXJpbWVudGFsIGJsdWV0b290aCBmZWF0dXJlcyB0byBjb25uZWN0IHRvIGFuIGV4dGVybmFsIGRldmljZSB0aGF0IHdpbGwgY29udHJvbFxyXG4gIC8vIHRoZSBzaW11bGF0aW9uIHdpdGggQkxFIGNvbW11bmljYXRpb24uXHJcbiAgYmx1ZXRvb3RoOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgaW5jbHVkZSBleHBlcmltZW50YWwgc2VyaWFsIGNvbW11bmljYXRpb24sIGFuZCBhIGJ1dHRvbiB0byBzZW5kIHZhbHVlcyB0byBhIHByb3RvdHlwZSB0YW5naWJsZVxyXG4gIC8vIGRldmljZS5cclxuICBzZXJpYWw6IHtcclxuICAgIHR5cGU6ICdmbGFnJ1xyXG4gIH0sXHJcblxyXG4gIC8vIEhvdyBtYW55IHZhbHVlcyB0byBzYXZlIHdoZW4gc21vb3RoaW5nIHZlcnRleCBwb3NpdGlvbnMgd2hlbiBjb25uZWN0ZWQgdG8gYSBibHVldG9vdGggZGV2aWNlLiBOb3RlIHRoYXRcclxuICAvLyB0aGlzIGhhcyBubyBpbXBhY3Qgb24gdGhlIE9wZW5DViBwcm90b3R5cGUgaW5wdXQuIE9ubHkgQmx1ZXRvb3RoL1NlcmlhbCBjb25uZWN0aW9ucy5cclxuICBzbW9vdGhpbmdMZW5ndGg6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA1LFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA+IDBcclxuICB9LFxyXG5cclxuICAvLyBIb3cgZnJlcXVlbnRseSB0byB1cGRhdGUgdGhlIHNpbSBmcm9tIHZhbHVlcyBwcm92aWRlZCB3aXRoIGEgYmx1ZXRvb3RoIGRldmljZSwgaW4gc2Vjb25kcy4gSW5jcmVhc2luZyB0aGlzXHJcbiAgLy8gbWF5IGhlbHAgcmVkdWNlIG5vaXNlIGlmIHJhbmRvbSB2YWx1ZXMgY29tZSBxdWlja2x5IGludG8gdGhlIHNpbXVsYXRpb24uXHJcbiAgYmx1ZXRvb3RoVXBkYXRlSW50ZXJ2YWw6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjEsXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlID4gMFxyXG4gIH0sXHJcblxyXG4gIC8vIFNldHMgdGhlIGluaXRpYWwgc291bmQgZGVzaWduIG9uIHN0YXJ0dXAuIFRoaXMgc2ltIGhhcyB0d28gc291bmQgZGVzaWducyB0aGF0IHRoZSB1c2VyIGNhbiBzZWxlY3QgZnJvbS5cclxuICAvLyBJdCBjYW4gYmUgc2V0IGF0IHJ1bnRpbWUgZnJvbSBQcmVmZXJlbmNlcyBvciBvbiBsb2FkIHdpdGggdGhpcyBxdWVyeSBwYXJhbWV0ZXIuIFF1ZXJ5IHBhcmFtZXRlclxyXG4gIC8vIG1hcHMgdG8gb25lIG9mIHRoZSBzdXBwb3J0ZWQgc291bmQgZGVzaWducyBhdCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVhZHJpbGF0ZXJhbC9ibG9iLzdhMDEyZTc2OGIzZmZkNDgwYWYxNjUxNTM2MTE5YjQ2NTBjYmIxNGIvanMvcXVhZHJpbGF0ZXJhbC9tb2RlbC9RdWFkcmlsYXRlcmFsU291bmRPcHRpb25zTW9kZWwudHMjTDE4LUwyM1xyXG4gIC8vIHNoYXBlTGF5ZXIgLT4gVFJBQ0tTX0xBWUVSIHNvdW5kIGRlc2lnblxyXG4gIC8vIHNoYXBlVW5pcXVlIC0+IFRSQUNLU19VTklRVUUgc291bmQgZGVzaWduXHJcbiAgc291bmREZXNpZ246IHtcclxuICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAnc2hhcGVMYXllcicsXHJcbiAgICB2YWxpZFZhbHVlczogWyAnc2hhcGVMYXllcicsICdzaGFwZVVuaXF1ZScgXVxyXG4gIH0sXHJcblxyXG4gIC8vIFdoZW4gcHJlc2VudCwgdGhlIFwibGF5ZXJcIiBzb3VuZCBkZXNpZ24gaXMgbW9kaWZpZWQgdG8gaW5jbHVkZSB0cmFwZXpvaWQgc291bmRzIGZvciBzaGFwZXMgdGhhdCBpbmhlcml0XHJcbiAgLy8gZ2VvbWV0cmljIHByb3BlcnRpZXMgb2YgdGhlIHRyYXBlem9pZC4gVGVhY2hlcnMgbWF5IG5vdCB3YW50IHRvIGluZGljYXRlIHRoYXQgY2hpbGQgc2hhcGVzIGFyZSBhY3R1YWxseVxyXG4gIC8vIGluY2x1c2l2ZSBvZiB0cmFwZXpvaWQgcHJvcGVydGllcywgc28gdGhpcyBpcyBvbmx5IGFkZGVkIGJ5IHJlcXVlc3QuIFNlZVxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWFkcmlsYXRlcmFsL2lzc3Vlcy80MjBcclxuICBpbmhlcml0VHJhcGV6b2lkU291bmQ6IHtcclxuICAgIHR5cGU6ICdmbGFnJyxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnRyb2xzIHRoZSBpbnRlcnZhbCB0aGF0IHRoZSBRdWFkcmlsYXRlcmFsVmVydGV4IHdpbGwgYmUgY29uc3RyYWluZWQgdG9cclxuICAgKi9cclxuICBtYWpvclZlcnRleEludGVydmFsOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4yNSxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gdmFsdWUgPiAwXHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29udHJvbHMgdGhlIFwibWlub3JcIiB2ZXJ0ZXggaW50ZXJ2YWwuIFRoaXMgYWN0cyBhcyB0aGUgc21hbGxlciBrZXlib2FyZCBzdGVwIHNpemUgZm9yIGtleWJvYXJkIGlucHV0LiBOb3RlXHJcbiAgICogdGhhdCB0aGUgZGVmYXVsdCB1c2VzIHRoZSBzYW1lIHZhbHVlIGFzIG1ham9yVmVydGV4SW50ZXJ2YWwuXHJcbiAgICovXHJcbiAgbWlub3JWZXJ0ZXhJbnRlcnZhbDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMDYyNSxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gdmFsdWUgPiAwXHJcbiAgfSxcclxuXHJcbiAgLy8gQSBxdWVyeSBwYXJhbWV0ZXIgdG8gY29udHJvbCB0aGUgZGV2aWNlR3JpZFNwYWNpbmdQcm9wZXJ0eSAtIGNvbnN0cmFpbnMgdGhlIHZlcnRleCBwb3NpdGlvbnMgdG8gaW50ZXJ2YWxzIG9mIHRoaXNcclxuICAvLyB2YWx1ZS4gVXNlZnVsIHdoZW4gY29ubmVjdGVkIHRvIGEgZGV2aWNlIHdpdGggbm9pc3kgc2Vuc29ycyBiZWNhdXNlIGl0IHJlcXVpcmVzIGxhcmdlciBjaGFuZ2VzIGluIHZhbHVlIHRvXHJcbiAgLy8gdXBkYXRlIGEgdmVydGV4IHBvc2l0aW9uLiBEZWZhdWx0IHZhbHVlIG1hdGNoZXMgbWlub3JWZXJ0ZXhJbnRlcnZhbCBzbyB0aGUgdmVydGljZXMgc25hcCB0byB0aGUgbWlub3IgZ3JpZFxyXG4gIC8vIGxpbmVzLlxyXG4gIGRldmljZUdyaWRTcGFjaW5nOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4wNjI1LFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA8PSA1ICogMC4wNVxyXG4gIH1cclxufSApO1xyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ1F1YWRyaWxhdGVyYWxRdWVyeVBhcmFtZXRlcnMnLCBRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzICk7XHJcbmV4cG9ydCBkZWZhdWx0IFF1YWRyaWxhdGVyYWxRdWVyeVBhcmFtZXRlcnM7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFNLHFCQUFxQjtBQUUvQyxNQUFNQyw0QkFBNEIsR0FBR0Msa0JBQWtCLENBQUNDLE1BQU0sQ0FBRTtFQUU5RDtFQUNBO0VBQ0E7RUFDQUMsOEJBQThCLEVBQUU7SUFDOUJDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBSUMsS0FBYSxJQUFNQSxLQUFLLElBQU0sQ0FBQyxHQUFHQyxJQUFJLENBQUNDLEVBQUksSUFBSUYsS0FBSyxJQUFJLENBQUM7SUFDekVHLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQTtFQUNBO0VBQ0FDLDJCQUEyQixFQUFFO0lBQzNCTixJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUlDLEtBQWEsSUFBTUEsS0FBSyxJQUFNLENBQUMsR0FBR0MsSUFBSSxDQUFDQyxFQUFJLElBQUlGLEtBQUssSUFBSSxDQUFDO0lBQ3pFRyxZQUFZLEVBQUU7RUFDaEIsQ0FBQztFQUVEO0VBQ0E7RUFDQTtFQUNBRSw0QkFBNEIsRUFBRTtJQUM1QlAsSUFBSSxFQUFFLFFBQVE7SUFDZEMsWUFBWSxFQUFJQyxLQUFhLElBQU1BLEtBQUssSUFBTSxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsRUFBSSxJQUFJRixLQUFLLElBQUksQ0FBQztJQUN6RUcsWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBRyw0QkFBNEIsRUFBRTtJQUM1QlIsSUFBSSxFQUFFLFFBQVE7SUFDZEssWUFBWSxFQUFFO0VBQ2hCLENBQUM7RUFFRDtFQUNBO0VBQ0FJLGVBQWUsRUFBRTtJQUNmVCxJQUFJLEVBQUUsTUFBTTtJQUNaVSxNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQTtFQUNBO0VBQ0FDLDJDQUEyQyxFQUFFO0lBQzNDWCxJQUFJLEVBQUUsUUFBUTtJQUNkQyxZQUFZLEVBQUlDLEtBQWEsSUFBTUEsS0FBSyxHQUFHLENBQUM7SUFDNUNHLFlBQVksRUFBRSxJQUFJLENBQUM7RUFDckIsQ0FBQzs7RUFFRDtFQUNBO0VBQ0E7RUFDQU8scUNBQXFDLEVBQUU7SUFDckNaLElBQUksRUFBRSxRQUFRO0lBQ2RLLFlBQVksRUFBRTtFQUNoQixDQUFDO0VBRUQ7RUFDQVEsZ0JBQWdCLEVBQUU7SUFDaEJiLElBQUksRUFBRTtFQUNSLENBQUM7RUFFRDtFQUNBYyxlQUFlLEVBQUU7SUFDZmQsSUFBSSxFQUFFO0VBQ1IsQ0FBQztFQUVEO0VBQ0E7RUFDQWUsU0FBUyxFQUFFO0lBQ1RmLElBQUksRUFBRTtFQUNSLENBQUM7RUFFRDtFQUNBO0VBQ0FnQixNQUFNLEVBQUU7SUFDTmhCLElBQUksRUFBRTtFQUNSLENBQUM7RUFFRDtFQUNBO0VBQ0FpQixlQUFlLEVBQUU7SUFDZmpCLElBQUksRUFBRSxRQUFRO0lBQ2RLLFlBQVksRUFBRSxDQUFDO0lBQ2ZKLFlBQVksRUFBSUMsS0FBYSxJQUFNQSxLQUFLLEdBQUc7RUFDN0MsQ0FBQztFQUVEO0VBQ0E7RUFDQWdCLHVCQUF1QixFQUFFO0lBQ3ZCbEIsSUFBSSxFQUFFLFFBQVE7SUFDZEssWUFBWSxFQUFFLEdBQUc7SUFDakJKLFlBQVksRUFBSUMsS0FBYSxJQUFNQSxLQUFLLEdBQUc7RUFDN0MsQ0FBQztFQUVEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQWlCLFdBQVcsRUFBRTtJQUNYbkIsSUFBSSxFQUFFLFFBQVE7SUFDZFUsTUFBTSxFQUFFLElBQUk7SUFDWkwsWUFBWSxFQUFFLFlBQVk7SUFDMUJlLFdBQVcsRUFBRSxDQUFFLFlBQVksRUFBRSxhQUFhO0VBQzVDLENBQUM7RUFFRDtFQUNBO0VBQ0E7RUFDQTtFQUNBQyxxQkFBcUIsRUFBRTtJQUNyQnJCLElBQUksRUFBRSxNQUFNO0lBQ1pVLE1BQU0sRUFBRTtFQUNWLENBQUM7RUFFRDtBQUNGO0FBQ0E7RUFDRVksbUJBQW1CLEVBQUU7SUFDbkJ0QixJQUFJLEVBQUUsUUFBUTtJQUNkSyxZQUFZLEVBQUUsSUFBSTtJQUNsQkosWUFBWSxFQUFJQyxLQUFhLElBQU1BLEtBQUssR0FBRztFQUM3QyxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRXFCLG1CQUFtQixFQUFFO0lBQ25CdkIsSUFBSSxFQUFFLFFBQVE7SUFDZEssWUFBWSxFQUFFLE1BQU07SUFDcEJKLFlBQVksRUFBSUMsS0FBYSxJQUFNQSxLQUFLLEdBQUc7RUFDN0MsQ0FBQztFQUVEO0VBQ0E7RUFDQTtFQUNBO0VBQ0FzQixpQkFBaUIsRUFBRTtJQUNqQnhCLElBQUksRUFBRSxRQUFRO0lBQ2RLLFlBQVksRUFBRSxNQUFNO0lBQ3BCSixZQUFZLEVBQUlDLEtBQWEsSUFBTUEsS0FBSyxJQUFJLENBQUMsR0FBRztFQUNsRDtBQUNGLENBQUUsQ0FBQztBQUVIUCxhQUFhLENBQUM4QixRQUFRLENBQUUsOEJBQThCLEVBQUU3Qiw0QkFBNkIsQ0FBQztBQUN0RixlQUFlQSw0QkFBNEIifQ==