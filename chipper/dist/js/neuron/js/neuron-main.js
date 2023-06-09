// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the neuron sim.
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import NeuronProfiler from './neuron/common/NeuronProfiler.js';
import NeuronQueryParameters from './neuron/common/NeuronQueryParameters.js';
import NeuronScreen from './neuron/view/NeuronScreen.js';
import NeuronStrings from './NeuronStrings.js';
const neuronTitleStringProperty = NeuronStrings.neuron.titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'Noah Podolefsky, Amanda McGarry',
    softwareDevelopment: 'John Blanco, Sharfudeen Ashraf',
    team: 'Wendy Adams, Fanny (Benay) Bentley, Janet Casagrand, Mike Klymkowsky, Ariel Paul, Katherine Perkins',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Elise Morgan, Oliver Orejola, Bryan Yoelin',
    thanks: 'Conversion of this simulation to HTML5 was funded in part by the Ghent University.'
  },
  webgl: true
};
simLauncher.launch(() => {
  // create and start the sim
  const sim = new Sim(neuronTitleStringProperty, [new NeuronScreen()], simOptions);
  sim.start();

  // This sim has some sim-specific profiling that can be done.  If the query parameter checked below is present,
  // the profiler is instantiated and made available.  There are several different profiling operations that can be
  // set through the query parameter, please see the NeuronProfiler.js file for details on these.
  if (NeuronQueryParameters.neuronProfiler >= 1) {
    // create and hook up the neuron profiler
    window.phet.neuron.profiler = new NeuronProfiler(sim, NeuronQueryParameters.neuronProfiler);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW0iLCJzaW1MYXVuY2hlciIsIk5ldXJvblByb2ZpbGVyIiwiTmV1cm9uUXVlcnlQYXJhbWV0ZXJzIiwiTmV1cm9uU2NyZWVuIiwiTmV1cm9uU3RyaW5ncyIsIm5ldXJvblRpdGxlU3RyaW5nUHJvcGVydHkiLCJuZXVyb24iLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwic29mdHdhcmVEZXZlbG9wbWVudCIsInRlYW0iLCJxdWFsaXR5QXNzdXJhbmNlIiwidGhhbmtzIiwid2ViZ2wiLCJsYXVuY2giLCJzaW0iLCJzdGFydCIsIm5ldXJvblByb2ZpbGVyIiwid2luZG93IiwicGhldCIsInByb2ZpbGVyIl0sInNvdXJjZXMiOlsibmV1cm9uLW1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBlbnRyeSBwb2ludCBmb3IgdGhlIG5ldXJvbiBzaW0uXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNpbSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgTmV1cm9uUHJvZmlsZXIgZnJvbSAnLi9uZXVyb24vY29tbW9uL05ldXJvblByb2ZpbGVyLmpzJztcclxuaW1wb3J0IE5ldXJvblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuL25ldXJvbi9jb21tb24vTmV1cm9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IE5ldXJvblNjcmVlbiBmcm9tICcuL25ldXJvbi92aWV3L05ldXJvblNjcmVlbi5qcyc7XHJcbmltcG9ydCBOZXVyb25TdHJpbmdzIGZyb20gJy4vTmV1cm9uU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBuZXVyb25UaXRsZVN0cmluZ1Byb3BlcnR5ID0gTmV1cm9uU3RyaW5ncy5uZXVyb24udGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJ05vYWggUG9kb2xlZnNreSwgQW1hbmRhIE1jR2FycnknLFxyXG4gICAgc29mdHdhcmVEZXZlbG9wbWVudDogJ0pvaG4gQmxhbmNvLCBTaGFyZnVkZWVuIEFzaHJhZicsXHJcbiAgICB0ZWFtOiAnV2VuZHkgQWRhbXMsIEZhbm55IChCZW5heSkgQmVudGxleSwgSmFuZXQgQ2FzYWdyYW5kLCBNaWtlIEtseW1rb3dza3ksIEFyaWVsIFBhdWwsIEthdGhlcmluZSBQZXJraW5zJyxcclxuICAgIHF1YWxpdHlBc3N1cmFuY2U6ICdTdGVlbGUgRGFsdG9uLCBBbWFuZGEgRGF2aXMsIEJyeWNlIEdyaWViZW5vdywgRXRoYW4gSm9obnNvbiwgRWxpc2UgTW9yZ2FuLCBPbGl2ZXIgT3Jlam9sYSwgQnJ5YW4gWW9lbGluJyxcclxuICAgIHRoYW5rczogJ0NvbnZlcnNpb24gb2YgdGhpcyBzaW11bGF0aW9uIHRvIEhUTUw1IHdhcyBmdW5kZWQgaW4gcGFydCBieSB0aGUgR2hlbnQgVW5pdmVyc2l0eS4nXHJcbiAgfSxcclxuICB3ZWJnbDogdHJ1ZVxyXG59O1xyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIC8vIGNyZWF0ZSBhbmQgc3RhcnQgdGhlIHNpbVxyXG4gIGNvbnN0IHNpbSA9IG5ldyBTaW0oIG5ldXJvblRpdGxlU3RyaW5nUHJvcGVydHksIFsgbmV3IE5ldXJvblNjcmVlbigpIF0sIHNpbU9wdGlvbnMgKTtcclxuICBzaW0uc3RhcnQoKTtcclxuXHJcbiAgLy8gVGhpcyBzaW0gaGFzIHNvbWUgc2ltLXNwZWNpZmljIHByb2ZpbGluZyB0aGF0IGNhbiBiZSBkb25lLiAgSWYgdGhlIHF1ZXJ5IHBhcmFtZXRlciBjaGVja2VkIGJlbG93IGlzIHByZXNlbnQsXHJcbiAgLy8gdGhlIHByb2ZpbGVyIGlzIGluc3RhbnRpYXRlZCBhbmQgbWFkZSBhdmFpbGFibGUuICBUaGVyZSBhcmUgc2V2ZXJhbCBkaWZmZXJlbnQgcHJvZmlsaW5nIG9wZXJhdGlvbnMgdGhhdCBjYW4gYmVcclxuICAvLyBzZXQgdGhyb3VnaCB0aGUgcXVlcnkgcGFyYW1ldGVyLCBwbGVhc2Ugc2VlIHRoZSBOZXVyb25Qcm9maWxlci5qcyBmaWxlIGZvciBkZXRhaWxzIG9uIHRoZXNlLlxyXG4gIGlmICggTmV1cm9uUXVlcnlQYXJhbWV0ZXJzLm5ldXJvblByb2ZpbGVyID49IDEgKSB7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBob29rIHVwIHRoZSBuZXVyb24gcHJvZmlsZXJcclxuICAgIHdpbmRvdy5waGV0Lm5ldXJvbi5wcm9maWxlciA9IG5ldyBOZXVyb25Qcm9maWxlciggc2ltLCBOZXVyb25RdWVyeVBhcmFtZXRlcnMubmV1cm9uUHJvZmlsZXIgKTtcclxuICB9XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxHQUFHLE1BQU0sdUJBQXVCO0FBQ3ZDLE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MsWUFBWSxNQUFNLCtCQUErQjtBQUN4RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBRTlDLE1BQU1DLHlCQUF5QixHQUFHRCxhQUFhLENBQUNFLE1BQU0sQ0FBQ0MsbUJBQW1CO0FBRTFFLE1BQU1DLFVBQVUsR0FBRztFQUNqQkMsT0FBTyxFQUFFO0lBQ1BDLFVBQVUsRUFBRSxpQ0FBaUM7SUFDN0NDLG1CQUFtQixFQUFFLGdDQUFnQztJQUNyREMsSUFBSSxFQUFFLHFHQUFxRztJQUMzR0MsZ0JBQWdCLEVBQUUseUdBQXlHO0lBQzNIQyxNQUFNLEVBQUU7RUFDVixDQUFDO0VBQ0RDLEtBQUssRUFBRTtBQUNULENBQUM7QUFFRGYsV0FBVyxDQUFDZ0IsTUFBTSxDQUFFLE1BQU07RUFFeEI7RUFDQSxNQUFNQyxHQUFHLEdBQUcsSUFBSWxCLEdBQUcsQ0FBRU0seUJBQXlCLEVBQUUsQ0FBRSxJQUFJRixZQUFZLENBQUMsQ0FBQyxDQUFFLEVBQUVLLFVBQVcsQ0FBQztFQUNwRlMsR0FBRyxDQUFDQyxLQUFLLENBQUMsQ0FBQzs7RUFFWDtFQUNBO0VBQ0E7RUFDQSxJQUFLaEIscUJBQXFCLENBQUNpQixjQUFjLElBQUksQ0FBQyxFQUFHO0lBRS9DO0lBQ0FDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDZixNQUFNLENBQUNnQixRQUFRLEdBQUcsSUFBSXJCLGNBQWMsQ0FBRWdCLEdBQUcsRUFBRWYscUJBQXFCLENBQUNpQixjQUFlLENBQUM7RUFDL0Y7QUFDRixDQUFFLENBQUMifQ==