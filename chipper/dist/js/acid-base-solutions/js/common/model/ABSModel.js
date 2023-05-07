// Copyright 2014-2022, University of Colorado Boulder

/**
 * ABSModel is the base class for models in the 'Acid-Base Solutions' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import Beaker from './Beaker.js';
import ConcentrationGraph from './ConcentrationGraph.js';
import ConductivityTester from './ConductivityTester.js';
import MagnifyingGlass from './MagnifyingGlass.js';
import PHMeter from './PHMeter.js';
import PHPaper from './PHPaper.js';
export default class ABSModel {
  // type of solution that is currently selected

  // for looking up solution by SolutionType

  // pH of the selected solution

  constructor(solutions, defaultSolutionType, tandem) {
    assert && assert(_.uniqBy(solutions, solution => solution.solutionType).length === solutions.length, 'every solution must have a unique solutionType');
    this.solutionTypeProperty = new StringUnionProperty(defaultSolutionType, {
      validValues: solutions.map(solution => solution.solutionType),
      tandem: tandem.createTandem('solutionTypeProperty')
    });
    this.solutionsMap = new Map();
    solutions.forEach(solution => {
      this.solutionsMap.set(solution.solutionType, solution);
    });
    this.pHProperty = DerivedProperty.deriveAny([this.solutionTypeProperty, ...solutions.map(solution => solution.pHProperty)], () => this.solutionsMap.get(this.solutionTypeProperty.value).pHProperty.value, {
      tandem: tandem.createTandem('pHProperty'),
      phetioValueType: NumberIO
    });
    this.beaker = new Beaker();
    this.magnifyingGlass = new MagnifyingGlass(this.beaker, this.solutionsMap, this.solutionTypeProperty, tandem.createTandem('magnifyingGlass'));
    this.graph = new ConcentrationGraph(this.beaker, this.solutionsMap, this.solutionTypeProperty);
    this.pHMeter = new PHMeter(this.beaker, this.pHProperty, tandem.createTandem('pHMeter'));
    this.pHPaper = new PHPaper(this.beaker, this.pHProperty, this.solutionTypeProperty, tandem.createTandem('pHPaper'));
    this.conductivityTester = new ConductivityTester(this.beaker, this.pHProperty, tandem.createTandem('conductivityTester'));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.solutionTypeProperty.reset();
    this.solutionsMap.forEach((solution, solutionType) => solution.reset());
    this.pHMeter.reset();
    this.pHPaper.reset();
    this.conductivityTester.reset();
  }
}
acidBaseSolutions.register('ABSModel', ABSModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdVbmlvblByb3BlcnR5IiwiTnVtYmVySU8iLCJhY2lkQmFzZVNvbHV0aW9ucyIsIkJlYWtlciIsIkNvbmNlbnRyYXRpb25HcmFwaCIsIkNvbmR1Y3Rpdml0eVRlc3RlciIsIk1hZ25pZnlpbmdHbGFzcyIsIlBITWV0ZXIiLCJQSFBhcGVyIiwiQUJTTW9kZWwiLCJjb25zdHJ1Y3RvciIsInNvbHV0aW9ucyIsImRlZmF1bHRTb2x1dGlvblR5cGUiLCJ0YW5kZW0iLCJhc3NlcnQiLCJfIiwidW5pcUJ5Iiwic29sdXRpb24iLCJzb2x1dGlvblR5cGUiLCJsZW5ndGgiLCJzb2x1dGlvblR5cGVQcm9wZXJ0eSIsInZhbGlkVmFsdWVzIiwibWFwIiwiY3JlYXRlVGFuZGVtIiwic29sdXRpb25zTWFwIiwiTWFwIiwiZm9yRWFjaCIsInNldCIsInBIUHJvcGVydHkiLCJkZXJpdmVBbnkiLCJnZXQiLCJ2YWx1ZSIsInBoZXRpb1ZhbHVlVHlwZSIsImJlYWtlciIsIm1hZ25pZnlpbmdHbGFzcyIsImdyYXBoIiwicEhNZXRlciIsInBIUGFwZXIiLCJjb25kdWN0aXZpdHlUZXN0ZXIiLCJkaXNwb3NlIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFCU01vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFCU01vZGVsIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBtb2RlbHMgaW4gdGhlICdBY2lkLUJhc2UgU29sdXRpb25zJyBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVE1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1RNb2RlbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgYWNpZEJhc2VTb2x1dGlvbnMgZnJvbSAnLi4vLi4vYWNpZEJhc2VTb2x1dGlvbnMuanMnO1xyXG5pbXBvcnQgeyBTb2x1dGlvblR5cGUgfSBmcm9tICcuL1NvbHV0aW9uVHlwZS5qcyc7XHJcbmltcG9ydCBCZWFrZXIgZnJvbSAnLi9CZWFrZXIuanMnO1xyXG5pbXBvcnQgQ29uY2VudHJhdGlvbkdyYXBoIGZyb20gJy4vQ29uY2VudHJhdGlvbkdyYXBoLmpzJztcclxuaW1wb3J0IENvbmR1Y3Rpdml0eVRlc3RlciBmcm9tICcuL0NvbmR1Y3Rpdml0eVRlc3Rlci5qcyc7XHJcbmltcG9ydCBNYWduaWZ5aW5nR2xhc3MgZnJvbSAnLi9NYWduaWZ5aW5nR2xhc3MuanMnO1xyXG5pbXBvcnQgUEhNZXRlciBmcm9tICcuL1BITWV0ZXIuanMnO1xyXG5pbXBvcnQgUEhQYXBlciBmcm9tICcuL1BIUGFwZXIuanMnO1xyXG5pbXBvcnQgQXF1ZW91c1NvbHV0aW9uIGZyb20gJy4vc29sdXRpb25zL0FxdWVvdXNTb2x1dGlvbi5qcyc7XHJcblxyXG5leHBvcnQgdHlwZSBTb2x1dGlvbk1hcCA9IE1hcDxTb2x1dGlvblR5cGUsIEFxdWVvdXNTb2x1dGlvbj47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBQlNNb2RlbCBpbXBsZW1lbnRzIFRNb2RlbCB7XHJcblxyXG4gIC8vIHR5cGUgb2Ygc29sdXRpb24gdGhhdCBpcyBjdXJyZW50bHkgc2VsZWN0ZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgc29sdXRpb25UeXBlUHJvcGVydHk6IFByb3BlcnR5PFNvbHV0aW9uVHlwZT47XHJcblxyXG4gIC8vIGZvciBsb29raW5nIHVwIHNvbHV0aW9uIGJ5IFNvbHV0aW9uVHlwZVxyXG4gIHB1YmxpYyByZWFkb25seSBzb2x1dGlvbnNNYXA6IFNvbHV0aW9uTWFwO1xyXG5cclxuICAvLyBwSCBvZiB0aGUgc2VsZWN0ZWQgc29sdXRpb25cclxuICBwdWJsaWMgcmVhZG9ubHkgcEhQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgYmVha2VyOiBCZWFrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1hZ25pZnlpbmdHbGFzczogTWFnbmlmeWluZ0dsYXNzO1xyXG4gIHB1YmxpYyByZWFkb25seSBncmFwaDogQ29uY2VudHJhdGlvbkdyYXBoO1xyXG4gIHB1YmxpYyByZWFkb25seSBwSE1ldGVyOiBQSE1ldGVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBwSFBhcGVyOiBQSFBhcGVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBjb25kdWN0aXZpdHlUZXN0ZXI6IENvbmR1Y3Rpdml0eVRlc3RlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzb2x1dGlvbnM6IEFxdWVvdXNTb2x1dGlvbltdLCBkZWZhdWx0U29sdXRpb25UeXBlOiBTb2x1dGlvblR5cGUsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8udW5pcUJ5KCBzb2x1dGlvbnMsIHNvbHV0aW9uID0+IHNvbHV0aW9uLnNvbHV0aW9uVHlwZSApLmxlbmd0aCA9PT0gc29sdXRpb25zLmxlbmd0aCxcclxuICAgICAgJ2V2ZXJ5IHNvbHV0aW9uIG11c3QgaGF2ZSBhIHVuaXF1ZSBzb2x1dGlvblR5cGUnICk7XHJcblxyXG4gICAgdGhpcy5zb2x1dGlvblR5cGVQcm9wZXJ0eSA9IG5ldyBTdHJpbmdVbmlvblByb3BlcnR5KCBkZWZhdWx0U29sdXRpb25UeXBlLCB7XHJcbiAgICAgIHZhbGlkVmFsdWVzOiBzb2x1dGlvbnMubWFwKCBzb2x1dGlvbiA9PiBzb2x1dGlvbi5zb2x1dGlvblR5cGUgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29sdXRpb25UeXBlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNvbHV0aW9uc01hcCA9IG5ldyBNYXA8U29sdXRpb25UeXBlLCBBcXVlb3VzU29sdXRpb24+KCk7XHJcbiAgICBzb2x1dGlvbnMuZm9yRWFjaCggc29sdXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnNvbHV0aW9uc01hcC5zZXQoIHNvbHV0aW9uLnNvbHV0aW9uVHlwZSwgc29sdXRpb24gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBIUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KFxyXG4gICAgICBbIHRoaXMuc29sdXRpb25UeXBlUHJvcGVydHksIC4uLnNvbHV0aW9ucy5tYXAoIHNvbHV0aW9uID0+IHNvbHV0aW9uLnBIUHJvcGVydHkgKSBdLFxyXG4gICAgICAoKSA9PiB0aGlzLnNvbHV0aW9uc01hcC5nZXQoIHRoaXMuc29sdXRpb25UeXBlUHJvcGVydHkudmFsdWUgKSEucEhQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BIUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5iZWFrZXIgPSBuZXcgQmVha2VyKCk7XHJcbiAgICB0aGlzLm1hZ25pZnlpbmdHbGFzcyA9IG5ldyBNYWduaWZ5aW5nR2xhc3MoIHRoaXMuYmVha2VyLCB0aGlzLnNvbHV0aW9uc01hcCwgdGhpcy5zb2x1dGlvblR5cGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hZ25pZnlpbmdHbGFzcycgKSApO1xyXG4gICAgdGhpcy5ncmFwaCA9IG5ldyBDb25jZW50cmF0aW9uR3JhcGgoIHRoaXMuYmVha2VyLCB0aGlzLnNvbHV0aW9uc01hcCwgdGhpcy5zb2x1dGlvblR5cGVQcm9wZXJ0eSApO1xyXG4gICAgdGhpcy5wSE1ldGVyID0gbmV3IFBITWV0ZXIoIHRoaXMuYmVha2VyLCB0aGlzLnBIUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwSE1ldGVyJyApICk7XHJcbiAgICB0aGlzLnBIUGFwZXIgPSBuZXcgUEhQYXBlciggdGhpcy5iZWFrZXIsIHRoaXMucEhQcm9wZXJ0eSwgdGhpcy5zb2x1dGlvblR5cGVQcm9wZXJ0eSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BIUGFwZXInICkgKTtcclxuICAgIHRoaXMuY29uZHVjdGl2aXR5VGVzdGVyID0gbmV3IENvbmR1Y3Rpdml0eVRlc3RlciggdGhpcy5iZWFrZXIsIHRoaXMucEhQcm9wZXJ0eSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbmR1Y3Rpdml0eVRlc3RlcicgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc29sdXRpb25UeXBlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc29sdXRpb25zTWFwLmZvckVhY2goICggc29sdXRpb24sIHNvbHV0aW9uVHlwZSApID0+IHNvbHV0aW9uLnJlc2V0KCkgKTtcclxuICAgIHRoaXMucEhNZXRlci5yZXNldCgpO1xyXG4gICAgdGhpcy5wSFBhcGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbmR1Y3Rpdml0eVRlc3Rlci5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuYWNpZEJhc2VTb2x1dGlvbnMucmVnaXN0ZXIoICdBQlNNb2RlbCcsIEFCU01vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxPQUFPQyxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFHNUUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFFMUQsT0FBT0MsTUFBTSxNQUFNLGFBQWE7QUFDaEMsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBS2xDLGVBQWUsTUFBTUMsUUFBUSxDQUFtQjtFQUU5Qzs7RUFHQTs7RUFHQTs7RUFVT0MsV0FBV0EsQ0FBRUMsU0FBNEIsRUFBRUMsbUJBQWlDLEVBQUVDLE1BQWMsRUFBRztJQUVwR0MsTUFBTSxJQUFJQSxNQUFNLENBQUVDLENBQUMsQ0FBQ0MsTUFBTSxDQUFFTCxTQUFTLEVBQUVNLFFBQVEsSUFBSUEsUUFBUSxDQUFDQyxZQUFhLENBQUMsQ0FBQ0MsTUFBTSxLQUFLUixTQUFTLENBQUNRLE1BQU0sRUFDcEcsZ0RBQWlELENBQUM7SUFFcEQsSUFBSSxDQUFDQyxvQkFBb0IsR0FBRyxJQUFJcEIsbUJBQW1CLENBQUVZLG1CQUFtQixFQUFFO01BQ3hFUyxXQUFXLEVB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