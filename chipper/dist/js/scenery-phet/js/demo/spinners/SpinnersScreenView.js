// Copyright 2020-2022, University of Colorado Boulder

/**
 * Demonstration of various spinners.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import sceneryPhet from '../../sceneryPhet.js';
import demoFineCoarseSpinner from './demoFineCoarseSpinner.js';
export default class SpinnersScreenView extends DemosScreenView {
  constructor(providedOptions) {
    const options = optionize()({
      // nothing for now
    }, providedOptions);

    // To add a demo, add an entry here of type SunDemo.
    const demos = [{
      label: 'FineCoarseSpinner',
      createNode: demoFineCoarseSpinner
    }];
    super(demos, options);
  }
}
sceneryPhet.register('SpinnersScreenView', SpinnersScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJEZW1vc1NjcmVlblZpZXciLCJzY2VuZXJ5UGhldCIsImRlbW9GaW5lQ29hcnNlU3Bpbm5lciIsIlNwaW5uZXJzU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImRlbW9zIiwibGFiZWwiLCJjcmVhdGVOb2RlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTcGlubmVyc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVtb25zdHJhdGlvbiBvZiB2YXJpb3VzIHNwaW5uZXJzLlxyXG4gKiBEZW1vcyBhcmUgc2VsZWN0ZWQgZnJvbSBhIGNvbWJvIGJveCwgYW5kIGFyZSBpbnN0YW50aWF0ZWQgb24gZGVtYW5kLlxyXG4gKiBVc2UgdGhlICdjb21wb25lbnQnIHF1ZXJ5IHBhcmFtZXRlciB0byBzZXQgdGhlIGluaXRpYWwgc2VsZWN0aW9uIG9mIHRoZSBjb21ibyBib3guXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcsIHsgRGVtb3NTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBkZW1vRmluZUNvYXJzZVNwaW5uZXIgZnJvbSAnLi9kZW1vRmluZUNvYXJzZVNwaW5uZXIuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbnR5cGUgU3Bpbm5lcnNTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERlbW9zU2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwaW5uZXJzU2NyZWVuVmlldyBleHRlbmRzIERlbW9zU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTcGlubmVyc1NjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3Bpbm5lcnNTY3JlZW5WaWV3T3B0aW9ucywgU2VsZk9wdGlvbnMsIERlbW9zU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gbm90aGluZyBmb3Igbm93XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBUbyBhZGQgYSBkZW1vLCBhZGQgYW4gZW50cnkgaGVyZSBvZiB0eXBlIFN1bkRlbW8uXHJcbiAgICBjb25zdCBkZW1vcyA9IFtcclxuICAgICAgeyBsYWJlbDogJ0ZpbmVDb2Fyc2VTcGlubmVyJywgY3JlYXRlTm9kZTogZGVtb0ZpbmVDb2Fyc2VTcGlubmVyIH1cclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIGRlbW9zLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1NwaW5uZXJzU2NyZWVuVmlldycsIFNwaW5uZXJzU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyxlQUFlLE1BQWtDLDRDQUE0QztBQUNwRyxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUs5RCxlQUFlLE1BQU1DLGtCQUFrQixTQUFTSCxlQUFlLENBQUM7RUFFdkRJLFdBQVdBLENBQUVDLGVBQTBDLEVBQUc7SUFFL0QsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQWlFLENBQUMsQ0FBRTtNQUMzRjtJQUFBLENBQ0QsRUFBRU0sZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNRSxLQUFLLEdBQUcsQ0FDWjtNQUFFQyxLQUFLLEVBQUUsbUJBQW1CO01BQUVDLFVBQVUsRUFBRVA7SUFBc0IsQ0FBQyxDQUNsRTtJQUVELEtBQUssQ0FBRUssS0FBSyxFQUFFRCxPQUFRLENBQUM7RUFDekI7QUFDRjtBQUVBTCxXQUFXLENBQUNTLFFBQVEsQ0FBRSxvQkFBb0IsRUFBRVAsa0JBQW1CLENBQUMifQ==