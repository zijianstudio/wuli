// Copyright 2017-2022, University of Colorado Boulder

/**
 * Manages a collection of Snapshots.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import equalityExplorer from '../../equalityExplorer.js';
export default class SnapshotsCollection extends PhetioObject {
  // a Property for each possible snapshot, null means no snapshot

  // the selected snapshot, null means no selection

  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      numberOfSnapshots: 5,
      // PhetioObjectOptions
      phetioState: false,
      phetioDocumentation: 'Collection of snapshots that appear in the Snapshots accordion box'
    }, providedOptions);
    assert && assert(Number.isInteger(options.numberOfSnapshots) && options.numberOfSnapshots > 0);
    super(options);
    this.snapshotProperties = [];
    for (let i = 0; i < options.numberOfSnapshots; i++) {
      this.snapshotProperties.push(new Property(null, {
        //TODO https://github.com/phetsims/equality-explorer/issues/200 add these options after creating SnapshotIO
        //tandem: options.tandem.createTandem( `snapshot${i}Property` ),
        //phetioValueType: NullableIO( SnapshotIO ),
        //phetioDocumentation: `The snapshot that occupies row ${i} in the Snapshots accordion box. null means no snapshot.`
      }));
    }
    this.selectedSnapshotProperty = new Property(null, {
      // a valid snapshot is null or the value of one of the snapshotProperties' values
      isValidValue: snapshot => {
        return snapshot === null || _.some(this.snapshotProperties, snapshotProperty => snapshotProperty.value === snapshot);
      }
      //TODO https://github.com/phetsims/equality-explorer/issues/200 add these options after creating SnapshotIO
      //tandem: options.tandem.createTandem( 'selectedSnapshotProperty' ),
      //phetioValueType: NullableIO( SnapshotIO ),
      //phetioDocumentation: 'The snapshot that is selected in the Snapshots accordion box. null means no snapshot is selected.'
    });
  }

  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    // Reset the selected snapshot.
    this.selectedSnapshotProperty.reset();

    // Dispose of all snapshots.
    for (let i = 0; i < this.snapshotProperties.length; i++) {
      const snapshot = this.snapshotProperties[i].value;
      if (snapshot !== null) {
        snapshot.dispose();
        this.snapshotProperties[i].value = null;
      }
    }
  }

  /**
   * Restores the selected snapshot.
   */
  restoreSelectedSnapshot() {
    const snapshot = this.selectedSnapshotProperty.value;
    assert && assert(snapshot);
    snapshot.restore();
  }

  /**
   * Deletes the selected snapshot.
   */
  deleteSelectedSnapshot() {
    const selectedSnapshot = this.selectedSnapshotProperty.value;
    assert && assert(selectedSnapshot, 'no selected snapshot');

    // Clear the selection.
    this.selectedSnapshotProperty.value = null;

    // Clear the Property that corresponds to the selected snapshot.
    const snapshotProperty = _.find(this.snapshotProperties, p => p.value === selectedSnapshot);
    assert && assert(snapshotProperty);
    snapshotProperty.value = null;

    // Dispose of the selected snapshot.
    selectedSnapshot.dispose();
  }
}
equalityExplorer.register('SnapshotsCollection', SnapshotsCollection);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsImVxdWFsaXR5RXhwbG9yZXIiLCJTbmFwc2hvdHNDb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibnVtYmVyT2ZTbmFwc2hvdHMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJzbmFwc2hvdFByb3BlcnRpZXMiLCJpIiwicHVzaCIsInNlbGVjdGVkU25hcHNob3RQcm9wZXJ0eSIsImlzVmFsaWRWYWx1ZSIsInNuYXBzaG90IiwiXyIsInNvbWUiLCJzbmFwc2hvdFByb3BlcnR5IiwidmFsdWUiLCJkaXNwb3NlIiwicmVzZXQiLCJsZW5ndGgiLCJyZXN0b3JlU2VsZWN0ZWRTbmFwc2hvdCIsInJlc3RvcmUiLCJkZWxldGVTZWxlY3RlZFNuYXBzaG90Iiwic2VsZWN0ZWRTbmFwc2hvdCIsImZpbmQiLCJwIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTbmFwc2hvdHNDb2xsZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1hbmFnZXMgYSBjb2xsZWN0aW9uIG9mIFNuYXBzaG90cy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi8uLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IFNuYXBzaG90IGZyb20gJy4vU25hcHNob3QuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBudW1iZXJPZlNuYXBzaG90cz86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgU25hcHNob3RzQ29sbGVjdGlvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbmFwc2hvdHNDb2xsZWN0aW9uIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gYSBQcm9wZXJ0eSBmb3IgZWFjaCBwb3NzaWJsZSBzbmFwc2hvdCwgbnVsbCBtZWFucyBubyBzbmFwc2hvdFxyXG4gIHB1YmxpYyByZWFkb25seSBzbmFwc2hvdFByb3BlcnRpZXM6IFByb3BlcnR5PFNuYXBzaG90IHwgbnVsbD5bXTtcclxuXHJcbiAgLy8gdGhlIHNlbGVjdGVkIHNuYXBzaG90LCBudWxsIG1lYW5zIG5vIHNlbGVjdGlvblxyXG4gIHB1YmxpYyByZWFkb25seSBzZWxlY3RlZFNuYXBzaG90UHJvcGVydHk6IFByb3BlcnR5PFNuYXBzaG90IHwgbnVsbD47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTbmFwc2hvdHNDb2xsZWN0aW9uT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNuYXBzaG90c0NvbGxlY3Rpb25PcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbnVtYmVyT2ZTbmFwc2hvdHM6IDUsXHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NvbGxlY3Rpb24gb2Ygc25hcHNob3RzIHRoYXQgYXBwZWFyIGluIHRoZSBTbmFwc2hvdHMgYWNjb3JkaW9uIGJveCdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG9wdGlvbnMubnVtYmVyT2ZTbmFwc2hvdHMgKSAmJiBvcHRpb25zLm51bWJlck9mU25hcHNob3RzID4gMCApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zbmFwc2hvdFByb3BlcnRpZXMgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9wdGlvbnMubnVtYmVyT2ZTbmFwc2hvdHM7IGkrKyApIHtcclxuICAgICAgdGhpcy5zbmFwc2hvdFByb3BlcnRpZXMucHVzaCggbmV3IFByb3BlcnR5PFNuYXBzaG90IHwgbnVsbD4oIG51bGwsIHtcclxuICAgICAgICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8yMDAgYWRkIHRoZXNlIG9wdGlvbnMgYWZ0ZXIgY3JlYXRpbmcgU25hcHNob3RJT1xyXG4gICAgICAgIC8vdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBzbmFwc2hvdCR7aX1Qcm9wZXJ0eWAgKSxcclxuICAgICAgICAvL3BoZXRpb1ZhbHVlVHlwZTogTnVsbGFibGVJTyggU25hcHNob3RJTyApLFxyXG4gICAgICAgIC8vcGhldGlvRG9jdW1lbnRhdGlvbjogYFRoZSBzbmFwc2hvdCB0aGF0IG9jY3VwaWVzIHJvdyAke2l9IGluIHRoZSBTbmFwc2hvdHMgYWNjb3JkaW9uIGJveC4gbnVsbCBtZWFucyBubyBzbmFwc2hvdC5gXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWRTbmFwc2hvdFByb3BlcnR5ID0gbmV3IFByb3BlcnR5PFNuYXBzaG90IHwgbnVsbD4oIG51bGwsIHtcclxuXHJcbiAgICAgIC8vIGEgdmFsaWQgc25hcHNob3QgaXMgbnVsbCBvciB0aGUgdmFsdWUgb2Ygb25lIG9mIHRoZSBzbmFwc2hvdFByb3BlcnRpZXMnIHZhbHVlc1xyXG4gICAgICBpc1ZhbGlkVmFsdWU6IHNuYXBzaG90ID0+IHtcclxuICAgICAgICByZXR1cm4gKCBzbmFwc2hvdCA9PT0gbnVsbCApIHx8XHJcbiAgICAgICAgICAgICAgIF8uc29tZSggdGhpcy5zbmFwc2hvdFByb3BlcnRpZXMsIHNuYXBzaG90UHJvcGVydHkgPT4gKCBzbmFwc2hvdFByb3BlcnR5LnZhbHVlID09PSBzbmFwc2hvdCApICk7XHJcbiAgICAgIH1cclxuICAgICAgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMjAwIGFkZCB0aGVzZSBvcHRpb25zIGFmdGVyIGNyZWF0aW5nIFNuYXBzaG90SU9cclxuICAgICAgLy90YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbGVjdGVkU25hcHNob3RQcm9wZXJ0eScgKSxcclxuICAgICAgLy9waGV0aW9WYWx1ZVR5cGU6IE51bGxhYmxlSU8oIFNuYXBzaG90SU8gKSxcclxuICAgICAgLy9waGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHNuYXBzaG90IHRoYXQgaXMgc2VsZWN0ZWQgaW4gdGhlIFNuYXBzaG90cyBhY2NvcmRpb24gYm94LiBudWxsIG1lYW5zIG5vIHNuYXBzaG90IGlzIHNlbGVjdGVkLidcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHNlbGVjdGVkIHNuYXBzaG90LlxyXG4gICAgdGhpcy5zZWxlY3RlZFNuYXBzaG90UHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBEaXNwb3NlIG9mIGFsbCBzbmFwc2hvdHMuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNuYXBzaG90UHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc25hcHNob3QgPSB0aGlzLnNuYXBzaG90UHJvcGVydGllc1sgaSBdLnZhbHVlO1xyXG4gICAgICBpZiAoIHNuYXBzaG90ICE9PSBudWxsICkge1xyXG4gICAgICAgIHNuYXBzaG90LmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLnNuYXBzaG90UHJvcGVydGllc1sgaSBdLnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZXMgdGhlIHNlbGVjdGVkIHNuYXBzaG90LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXN0b3JlU2VsZWN0ZWRTbmFwc2hvdCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5zZWxlY3RlZFNuYXBzaG90UHJvcGVydHkudmFsdWUhO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc25hcHNob3QgKTtcclxuICAgIHNuYXBzaG90LnJlc3RvcmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIHNuYXBzaG90LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkZWxldGVTZWxlY3RlZFNuYXBzaG90KCk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdGVkU25hcHNob3QgPSB0aGlzLnNlbGVjdGVkU25hcHNob3RQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlbGVjdGVkU25hcHNob3QsICdubyBzZWxlY3RlZCBzbmFwc2hvdCcgKTtcclxuXHJcbiAgICAvLyBDbGVhciB0aGUgc2VsZWN0aW9uLlxyXG4gICAgdGhpcy5zZWxlY3RlZFNuYXBzaG90UHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBQcm9wZXJ0eSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBzZWxlY3RlZCBzbmFwc2hvdC5cclxuICAgIGNvbnN0IHNuYXBzaG90UHJvcGVydHkgPSBfLmZpbmQoIHRoaXMuc25hcHNob3RQcm9wZXJ0aWVzLCBwID0+ICggcC52YWx1ZSA9PT0gc2VsZWN0ZWRTbmFwc2hvdCApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzbmFwc2hvdFByb3BlcnR5ICk7XHJcbiAgICBzbmFwc2hvdFByb3BlcnR5IS52YWx1ZSA9IG51bGw7XHJcblxyXG4gICAgLy8gRGlzcG9zZSBvZiB0aGUgc2VsZWN0ZWQgc25hcHNob3QuXHJcbiAgICBzZWxlY3RlZFNuYXBzaG90IS5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnU25hcHNob3RzQ29sbGVjdGlvbicsIFNuYXBzaG90c0NvbGxlY3Rpb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELE9BQU9DLFlBQVksTUFBK0IsdUNBQXVDO0FBQ3pGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQVN4RCxlQUFlLE1BQU1DLG1CQUFtQixTQUFTRixZQUFZLENBQUM7RUFFNUQ7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