// Copyright 2019-2022, University of Colorado Boulder

/**
 * EnergyLevelsViewProperties defines Properties that are specific to the view in the 'Energy Levels' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import MOTHAViewProperties from '../../common/view/MOTHAViewProperties.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
export default class EnergyLevelsViewProperties extends MOTHAViewProperties {
  //  is the Electron Energy Level accordion box expanded?

  constructor(providedOptions) {
    super(providedOptions);
    this.electronEnergyLevelExpandedProperty = new BooleanProperty(false, {
      tandem: providedOptions.tandem.createTandem('electronEnergyLevelExpandedProperty')
    });
  }
  reset() {
    super.reset();
    this.electronEnergyLevelExpandedProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('EnergyLevelsViewProperties', EnergyLevelsViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNT1RIQVZpZXdQcm9wZXJ0aWVzIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJFbmVyZ3lMZXZlbHNWaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwiZWxlY3Ryb25FbmVyZ3lMZXZlbEV4cGFuZGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJyZXNldCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUxldmVsc1ZpZXdQcm9wZXJ0aWVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVuZXJneUxldmVsc1ZpZXdQcm9wZXJ0aWVzIGRlZmluZXMgUHJvcGVydGllcyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGUgdmlldyBpbiB0aGUgJ0VuZXJneSBMZXZlbHMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBNT1RIQVZpZXdQcm9wZXJ0aWVzLCB7IE1PVEhBVmlld1Byb3BlcnRpZXNPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTU9USEFWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgRW5lcmd5TGV2ZWxzVmlld1Byb3BlcnRpZXNPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBNT1RIQVZpZXdQcm9wZXJ0aWVzT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuZXJneUxldmVsc1ZpZXdQcm9wZXJ0aWVzIGV4dGVuZHMgTU9USEFWaWV3UHJvcGVydGllcyB7XHJcblxyXG4gIC8vICBpcyB0aGUgRWxlY3Ryb24gRW5lcmd5IExldmVsIGFjY29yZGlvbiBib3ggZXhwYW5kZWQ/XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZWN0cm9uRW5lcmd5TGV2ZWxFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEVuZXJneUxldmVsc1ZpZXdQcm9wZXJ0aWVzT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uRW5lcmd5TGV2ZWxFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uRW5lcmd5TGV2ZWxFeHBhbmRlZFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGVjdHJvbkVuZXJneUxldmVsRXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnRW5lcmd5TGV2ZWxzVmlld1Byb3BlcnRpZXMnLCBFbmVyZ3lMZXZlbHNWaWV3UHJvcGVydGllcyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBR3BFLE9BQU9DLG1CQUFtQixNQUFzQywwQ0FBMEM7QUFDMUcsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBTXRFLGVBQWUsTUFBTUMsMEJBQTBCLFNBQVNGLG1CQUFtQixDQUFDO0VBRTFFOztFQUdPRyxXQUFXQSxDQUFFQyxlQUFrRCxFQUFHO0lBQ3ZFLEtBQUssQ0FBRUEsZUFBZ0IsQ0FBQztJQUV4QixJQUFJLENBQUNDLG1DQUFtQyxHQUFHLElBQUlOLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDckVPLE1BQU0sRUFBRUYsZUFBZSxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxxQ0FBc0M7SUFDckYsQ0FBRSxDQUFDO0VBQ0w7RUFFZ0JDLEtBQUtBLENBQUEsRUFBUztJQUM1QixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDSCxtQ0FBbUMsQ0FBQ0csS0FBSyxDQUFDLENBQUM7RUFDbEQ7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBUix1QkFBdUIsQ0FBQ1UsUUFBUSxDQUFFLDRCQUE0QixFQUFFVCwwQkFBMkIsQ0FBQyJ9