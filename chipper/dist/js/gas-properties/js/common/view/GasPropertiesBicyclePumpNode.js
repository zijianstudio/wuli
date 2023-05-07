// Copyright 2018-2022, University of Colorado Boulder

/**
 * GasPropertiesBicyclePumpNode is a specialization of BicyclePumpNode for this sim.
 * It is used to add particles to the container.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BicyclePumpNode from '../../../../scenery-phet/js/BicyclePumpNode.js';
import gasProperties from '../../gasProperties.js';
export default class GasPropertiesBicyclePumpNode extends BicyclePumpNode {
  constructor(numberOfParticlesProperty, providedOptions) {
    const options = optionize()({
      // BicyclePumpNodeOptions
      height: 230,
      bodyTopFill: 'white',
      hoseCurviness: 0.75,
      dragListenerOptions: {
        numberOfParticlesPerPumpAction: 50,
        addParticlesOneAtATime: false
      }
    }, providedOptions);
    super(numberOfParticlesProperty, new Property(numberOfParticlesProperty.range), options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('GasPropertiesBicyclePumpNode', GasPropertiesBicyclePumpNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIkJpY3ljbGVQdW1wTm9kZSIsImdhc1Byb3BlcnRpZXMiLCJHYXNQcm9wZXJ0aWVzQmljeWNsZVB1bXBOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImhlaWdodCIsImJvZHlUb3BGaWxsIiwiaG9zZUN1cnZpbmVzcyIsImRyYWdMaXN0ZW5lck9wdGlvbnMiLCJudW1iZXJPZlBhcnRpY2xlc1BlclB1bXBBY3Rpb24iLCJhZGRQYXJ0aWNsZXNPbmVBdEFUaW1lIiwicmFuZ2UiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHYXNQcm9wZXJ0aWVzQmljeWNsZVB1bXBOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdhc1Byb3BlcnRpZXNCaWN5Y2xlUHVtcE5vZGUgaXMgYSBzcGVjaWFsaXphdGlvbiBvZiBCaWN5Y2xlUHVtcE5vZGUgZm9yIHRoaXMgc2ltLlxyXG4gKiBJdCBpcyB1c2VkIHRvIGFkZCBwYXJ0aWNsZXMgdG8gdGhlIGNvbnRhaW5lci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBCaWN5Y2xlUHVtcE5vZGUsIHsgQmljeWNsZVB1bXBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CaWN5Y2xlUHVtcE5vZGUuanMnO1xyXG5pbXBvcnQgZ2FzUHJvcGVydGllcyBmcm9tICcuLi8uLi9nYXNQcm9wZXJ0aWVzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgR2FzUHJvcGVydGllc0JpY3ljbGVQdW1wTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEJpY3ljbGVQdW1wTm9kZU9wdGlvbnMgJlxyXG4gIFBpY2tSZXF1aXJlZDxCaWN5Y2xlUHVtcE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYXNQcm9wZXJ0aWVzQmljeWNsZVB1bXBOb2RlIGV4dGVuZHMgQmljeWNsZVB1bXBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSwgcHJvdmlkZWRPcHRpb25zOiBHYXNQcm9wZXJ0aWVzQmljeWNsZVB1bXBOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdhc1Byb3BlcnRpZXNCaWN5Y2xlUHVtcE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgQmljeWNsZVB1bXBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQmljeWNsZVB1bXBOb2RlT3B0aW9uc1xyXG4gICAgICBoZWlnaHQ6IDIzMCxcclxuICAgICAgYm9keVRvcEZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIGhvc2VDdXJ2aW5lc3M6IDAuNzUsXHJcbiAgICAgIGRyYWdMaXN0ZW5lck9wdGlvbnM6IHtcclxuICAgICAgICBudW1iZXJPZlBhcnRpY2xlc1BlclB1bXBBY3Rpb246IDUwLFxyXG4gICAgICAgIGFkZFBhcnRpY2xlc09uZUF0QVRpbWU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LCBuZXcgUHJvcGVydHkoIG51bWJlck9mUGFydGljbGVzUHJvcGVydHkucmFuZ2UgKSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdHYXNQcm9wZXJ0aWVzQmljeWNsZVB1bXBOb2RlJywgR2FzUHJvcGVydGllc0JpY3ljbGVQdW1wTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsZUFBZSxNQUFrQyxnREFBZ0Q7QUFDeEcsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQU9sRCxlQUFlLE1BQU1DLDRCQUE0QixTQUFTRixlQUFlLENBQUM7RUFFakVHLFdBQVdBLENBQUVDLHlCQUF5QyxFQUFFQyxlQUFvRCxFQUFHO0lBRXBILE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUEyRSxDQUFDLENBQUU7TUFFckc7TUFDQVEsTUFBTSxFQUFFLEdBQUc7TUFDWEMsV0FBVyxFQUFFLE9BQU87TUFDcEJDLGFBQWEsRUFBRSxJQUFJO01BQ25CQyxtQkFBbUIsRUFBRTtRQUNuQkMsOEJBQThCLEVBQUUsRUFBRTtRQUNsQ0Msc0JBQXNCLEVBQUU7TUFDMUI7SUFDRixDQUFDLEVBQUVQLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFRCx5QkFBeUIsRUFBRSxJQUFJTixRQUFRLENBQUVNLHlCQUF5QixDQUFDUyxLQUFNLENBQUMsRUFBRVAsT0FBUSxDQUFDO0VBQzlGO0VBRWdCUSxPQUFPQSxDQUFBLEVBQVM7SUFDOUJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSw4REFBK0QsQ0FBQztJQUN6RixLQUFLLENBQUNELE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQWIsYUFBYSxDQUFDZSxRQUFRLENBQUUsOEJBQThCLEVBQUVkLDRCQUE2QixDQUFDIn0=