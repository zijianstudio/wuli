// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import neuron from '../../neuron.js';
const NeuronQueryParameters = QueryStringMachine.getAll({
  // turn on the Neuron-specific profiler
  neuronProfiler: {
    type: 'number',
    defaultValue: -1
  }
});
neuron.register('NeuronQueryParameters', NeuronQueryParameters);
export default NeuronQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJOZXVyb25RdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJuZXVyb25Qcm9maWxlciIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5ldXJvblF1ZXJ5UGFyYW1ldGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbWV0ZXJzIHN1cHBvcnRlZCBieSB0aGlzIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcblxyXG5jb25zdCBOZXVyb25RdWVyeVBhcmFtZXRlcnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcblxyXG4gIC8vIHR1cm4gb24gdGhlIE5ldXJvbi1zcGVjaWZpYyBwcm9maWxlclxyXG4gIG5ldXJvblByb2ZpbGVyOiB7IHR5cGU6ICdudW1iZXInLCBkZWZhdWx0VmFsdWU6IC0xIH1cclxufSApO1xyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnTmV1cm9uUXVlcnlQYXJhbWV0ZXJzJywgTmV1cm9uUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXVyb25RdWVyeVBhcmFtZXRlcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE1BQU0sTUFBTSxpQkFBaUI7QUFFcEMsTUFBTUMscUJBQXFCLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7RUFFdkQ7RUFDQUMsY0FBYyxFQUFFO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUU7QUFDckQsQ0FBRSxDQUFDO0FBRUhOLE1BQU0sQ0FBQ08sUUFBUSxDQUFFLHVCQUF1QixFQUFFTixxQkFBc0IsQ0FBQztBQUVqRSxlQUFlQSxxQkFBcUIifQ==