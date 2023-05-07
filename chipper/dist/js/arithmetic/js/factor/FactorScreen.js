// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Factor' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author John Blanco, Andrey Zelenkov (MLearner)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import arithmetic from '../arithmetic.js';
import ArithmeticStrings from '../ArithmeticStrings.js';
import ArithmeticConstants from '../common/ArithmeticConstants.js';
import FactorModel from './model/FactorModel.js';
import FactorScreenIconNode from './view/FactorScreenIconNode.js';
import FactorView from './view/FactorView.js';
class FactorScreen extends Screen {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      name: ArithmeticStrings.factorStringProperty,
      homeScreenIcon: new ScreenIcon(new FactorScreenIconNode(), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      backgroundColorProperty: new Property(ArithmeticConstants.BACKGROUND_COLOR),
      tandem: Tandem.REQUIRED
    }, options);
    super(() => new FactorModel(options.tandem.createTandem('model')), model => new FactorView(model), options);
  }
}
arithmetic.register('FactorScreen', FactorScreen);
export default FactorScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJtZXJnZSIsIlRhbmRlbSIsImFyaXRobWV0aWMiLCJBcml0aG1ldGljU3RyaW5ncyIsIkFyaXRobWV0aWNDb25zdGFudHMiLCJGYWN0b3JNb2RlbCIsIkZhY3RvclNjcmVlbkljb25Ob2RlIiwiRmFjdG9yVmlldyIsIkZhY3RvclNjcmVlbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJmYWN0b3JTdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJCQUNLR1JPVU5EX0NPTE9SIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFjdG9yU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnRmFjdG9yJyBzY3JlZW4uIENvbmZvcm1zIHRvIHRoZSBjb250cmFjdCBzcGVjaWZpZWQgaW4gam9pc3QvU2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvLCBBbmRyZXkgWmVsZW5rb3YgKE1MZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBhcml0aG1ldGljIGZyb20gJy4uL2FyaXRobWV0aWMuanMnO1xyXG5pbXBvcnQgQXJpdGhtZXRpY1N0cmluZ3MgZnJvbSAnLi4vQXJpdGhtZXRpY1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQXJpdGhtZXRpY0NvbnN0YW50cyBmcm9tICcuLi9jb21tb24vQXJpdGhtZXRpY0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGYWN0b3JNb2RlbCBmcm9tICcuL21vZGVsL0ZhY3Rvck1vZGVsLmpzJztcclxuaW1wb3J0IEZhY3RvclNjcmVlbkljb25Ob2RlIGZyb20gJy4vdmlldy9GYWN0b3JTY3JlZW5JY29uTm9kZS5qcyc7XHJcbmltcG9ydCBGYWN0b3JWaWV3IGZyb20gJy4vdmlldy9GYWN0b3JWaWV3LmpzJztcclxuXHJcbmNsYXNzIEZhY3RvclNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbmFtZTogQXJpdGhtZXRpY1N0cmluZ3MuZmFjdG9yU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IEZhY3RvclNjcmVlbkljb25Ob2RlKCksIHtcclxuICAgICAgICBtYXhJY29uV2lkdGhQcm9wb3J0aW9uOiAxLFxyXG4gICAgICAgIG1heEljb25IZWlnaHRQcm9wb3J0aW9uOiAxXHJcbiAgICAgIH0gKSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggQXJpdGhtZXRpY0NvbnN0YW50cy5CQUNLR1JPVU5EX0NPTE9SICksXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBGYWN0b3JNb2RlbCggb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IEZhY3RvclZpZXcoIG1vZGVsICksXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5hcml0aG1ldGljLnJlZ2lzdGVyKCAnRmFjdG9yU2NyZWVuJywgRmFjdG9yU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZhY3RvclNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLFVBQVUsTUFBTSxrQkFBa0I7QUFDekMsT0FBT0MsaUJBQWlCLE1BQU0seUJBQXlCO0FBQ3ZELE9BQU9DLG1CQUFtQixNQUFNLGtDQUFrQztBQUNsRSxPQUFPQyxXQUFXLE1BQU0sd0JBQXdCO0FBQ2hELE9BQU9DLG9CQUFvQixNQUFNLGdDQUFnQztBQUNqRSxPQUFPQyxVQUFVLE1BQU0sc0JBQXNCO0FBRTdDLE1BQU1DLFlBQVksU0FBU1YsTUFBTSxDQUFDO0VBRWhDO0FBQ0Y7QUFDQTtFQUNFVyxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR1YsS0FBSyxDQUFFO01BQ2ZXLElBQUksRUFBRVIsaUJBQWlCLENBQUNTLG9CQUFvQjtNQUM1Q0MsY0FBYyxFQUFFLElBQUlkLFVBQVUsQ0FBRSxJQUFJTyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUU7UUFDMURRLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIQyx1QkFBdUIsRUFBRSxJQUFJbkIsUUFBUSxDQUFFTyxtQkFBbUIsQ0FBQ2EsZ0JBQWlCLENBQUM7TUFDN0VDLE1BQU0sRUFBRWpCLE1BQU0sQ0FBQ2tCO0lBQ2pCLENBQUMsRUFBRVQsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUNILE1BQU0sSUFBSUwsV0FBVyxDQUFFSyxPQUFPLENBQUNRLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQy9EQyxLQUFLLElBQUksSUFBSWQsVUFBVSxDQUFFYyxLQUFNLENBQUMsRUFDaENYLE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVIsVUFBVSxDQUFDb0IsUUFBUSxDQUFFLGNBQWMsRUFBRWQsWUFBYSxDQUFDO0FBQ25ELGVBQWVBLFlBQVkifQ==