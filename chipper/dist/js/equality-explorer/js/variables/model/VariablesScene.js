// Copyright 2017-2022, University of Colorado Boulder

/**
 * The sole scene in the 'Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ConstantTermCreator from '../../common/model/ConstantTermCreator.js';
import EqualityExplorerScene from '../../common/model/EqualityExplorerScene.js';
import Variable from '../../common/model/Variable.js';
import VariableTermCreator from '../../common/model/VariableTermCreator.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerStrings from '../../EqualityExplorerStrings.js';
export default class VariablesScene extends EqualityExplorerScene {
  constructor(tandem) {
    const variablesTandem = tandem.createTandem('variables');
    const x = new Variable(EqualityExplorerStrings.xStringProperty, {
      tandem: variablesTandem.createTandem('x')
    });
    const createLeftTermCreators = (lockedProperty, tandem) => createTermCreators(x, lockedProperty, tandem);
    const createRightTermCreators = (lockedProperty, tandem) => createTermCreators(x, lockedProperty, tandem);
    super(createLeftTermCreators, createRightTermCreators, {
      variables: [x],
      tandem: tandem
    });
  }
}

/**
 * Creates the term creators for this scene.
 */
function createTermCreators(x, lockedProperty, parentTandem) {
  return [
  // x and -x
  new VariableTermCreator(x, {
    lockedProperty: lockedProperty,
    tandem: parentTandem.createTandem('xTermCreator')
  }),
  // 1 and -1
  new ConstantTermCreator({
    lockedProperty: lockedProperty,
    tandem: parentTandem.createTandem('constantTermCreator')
  })];
}
equalityExplorer.register('VariablesScene', VariablesScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25zdGFudFRlcm1DcmVhdG9yIiwiRXF1YWxpdHlFeHBsb3JlclNjZW5lIiwiVmFyaWFibGUiLCJWYXJpYWJsZVRlcm1DcmVhdG9yIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzIiwiVmFyaWFibGVzU2NlbmUiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInZhcmlhYmxlc1RhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIngiLCJ4U3RyaW5nUHJvcGVydHkiLCJjcmVhdGVMZWZ0VGVybUNyZWF0b3JzIiwibG9ja2VkUHJvcGVydHkiLCJjcmVhdGVUZXJtQ3JlYXRvcnMiLCJjcmVhdGVSaWdodFRlcm1DcmVhdG9ycyIsInZhcmlhYmxlcyIsInBhcmVudFRhbmRlbSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFyaWFibGVzU2NlbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIHNvbGUgc2NlbmUgaW4gdGhlICdWYXJpYWJsZXMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDb25zdGFudFRlcm1DcmVhdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Db25zdGFudFRlcm1DcmVhdG9yLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRXF1YWxpdHlFeHBsb3JlclNjZW5lLmpzJztcclxuaW1wb3J0IFRlcm1DcmVhdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9UZXJtQ3JlYXRvci5qcyc7XHJcbmltcG9ydCBWYXJpYWJsZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVmFyaWFibGUuanMnO1xyXG5pbXBvcnQgVmFyaWFibGVUZXJtQ3JlYXRvciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvVmFyaWFibGVUZXJtQ3JlYXRvci5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MgZnJvbSAnLi4vLi4vRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGVzU2NlbmUgZXh0ZW5kcyBFcXVhbGl0eUV4cGxvcmVyU2NlbmUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IHZhcmlhYmxlc1RhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2YXJpYWJsZXMnICk7XHJcblxyXG4gICAgY29uc3QgeCA9IG5ldyBWYXJpYWJsZSggRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MueFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogdmFyaWFibGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjcmVhdGVMZWZ0VGVybUNyZWF0b3JzID0gKCBsb2NrZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsLCB0YW5kZW06IFRhbmRlbSApID0+XHJcbiAgICAgIGNyZWF0ZVRlcm1DcmVhdG9ycyggeCwgbG9ja2VkUHJvcGVydHksIHRhbmRlbSApO1xyXG5cclxuICAgIGNvbnN0IGNyZWF0ZVJpZ2h0VGVybUNyZWF0b3JzID0gKCBsb2NrZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsLCB0YW5kZW06IFRhbmRlbSApID0+XHJcbiAgICAgIGNyZWF0ZVRlcm1DcmVhdG9ycyggeCwgbG9ja2VkUHJvcGVydHksIHRhbmRlbSApO1xyXG5cclxuICAgIHN1cGVyKCBjcmVhdGVMZWZ0VGVybUNyZWF0b3JzLCBjcmVhdGVSaWdodFRlcm1DcmVhdG9ycywge1xyXG4gICAgICB2YXJpYWJsZXM6IFsgeCBdLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIHRlcm0gY3JlYXRvcnMgZm9yIHRoaXMgc2NlbmUuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVUZXJtQ3JlYXRvcnMoIHg6IFZhcmlhYmxlLCBsb2NrZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsLCBwYXJlbnRUYW5kZW06IFRhbmRlbSApOiBUZXJtQ3JlYXRvcltdIHtcclxuXHJcbiAgcmV0dXJuIFtcclxuXHJcbiAgICAvLyB4IGFuZCAteFxyXG4gICAgbmV3IFZhcmlhYmxlVGVybUNyZWF0b3IoIHgsIHtcclxuICAgICAgbG9ja2VkUHJvcGVydHk6IGxvY2tlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICd4VGVybUNyZWF0b3InIClcclxuICAgIH0gKSxcclxuXHJcbiAgICAvLyAxIGFuZCAtMVxyXG4gICAgbmV3IENvbnN0YW50VGVybUNyZWF0b3IoIHtcclxuICAgICAgbG9ja2VkUHJvcGVydHk6IGxvY2tlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHBhcmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25zdGFudFRlcm1DcmVhdG9yJyApXHJcbiAgICB9IClcclxuICBdO1xyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnVmFyaWFibGVzU2NlbmUnLCBWYXJpYWJsZXNTY2VuZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFJQSxPQUFPQSxtQkFBbUIsTUFBTSwyQ0FBMkM7QUFDM0UsT0FBT0MscUJBQXFCLE1BQU0sNkNBQTZDO0FBRS9FLE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsbUJBQW1CLE1BQU0sMkNBQTJDO0FBQzNFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFFdEUsZUFBZSxNQUFNQyxjQUFjLFNBQVNMLHFCQUFxQixDQUFDO0VBRXpETSxXQUFXQSxDQUFFQyxNQUFjLEVBQUc7SUFFbkMsTUFBTUMsZUFBZSxHQUFHRCxNQUFNLENBQUNFLFlBQVksQ0FBRSxXQUFZLENBQUM7SUFFMUQsTUFBTUMsQ0FBQyxHQUFHLElBQUlULFFBQVEsQ0FBRUcsdUJBQXVCLENBQUNPLGVBQWUsRUFBRTtNQUMvREosTUFBTSxFQUFFQyxlQUFlLENBQUNDLFlBQVksQ0FBRSxHQUFJO0lBQzVDLENBQUUsQ0FBQztJQUVILE1BQU1HLHNCQUFzQixHQUFHQSxDQUFFQyxjQUF3QyxFQUFFTixNQUFjLEtBQ3ZGTyxrQkFBa0IsQ0FBRUosQ0FBQyxFQUFFRyxjQUFjLEVBQUVOLE1BQU8sQ0FBQztJQUVqRCxNQUFNUSx1QkFBdUIsR0FBR0EsQ0FBRUYsY0FBd0MsRUFBRU4sTUFBYyxLQUN4Rk8sa0JBQWtCLENBQUVKLENBQUMsRUFBRUcsY0FBYyxFQUFFTixNQUFPLENBQUM7SUFFakQsS0FBSyxDQUFFSyxzQkFBc0IsRUFBRUcsdUJBQXVCLEVBQUU7TUFDdERDLFNBQVMsRUFBRSxDQUFFTixDQUFDLENBQUU7TUFDaEJILE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7RUFDTDtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVNPLGtCQUFrQkEsQ0FBRUosQ0FBVyxFQUFFRyxjQUF3QyxFQUFFSSxZQUFvQixFQUFrQjtFQUV4SCxPQUFPO0VBRUw7RUFDQSxJQUFJZixtQkFBbUIsQ0FBRVEsQ0FBQyxFQUFFO0lBQzFCRyxjQUFjLEVBQUVBLGNBQWM7SUFDOUJOLE1BQU0sRUFBRVUsWUFBWSxDQUFDUixZQUFZLENBQUUsY0FBZTtFQUNwRCxDQUFFLENBQUM7RUFFSDtFQUNBLElBQUlWLG1CQUFtQixDQUFFO0lBQ3ZCYyxjQUFjLEVBQUVBLGNBQWM7SUFDOUJOLE1BQU0sRUFBRVUsWUFBWSxDQUFDUixZQUFZLENBQUUscUJBQXNCO0VBQzNELENBQUUsQ0FBQyxDQUNKO0FBQ0g7QUFFQU4sZ0JBQWdCLENBQUNlLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRWIsY0FBZSxDQUFDIn0=