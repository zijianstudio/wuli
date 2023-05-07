// Copyright 2015-2023, University of Colorado Boulder

/**
 * The "Intro" screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../joist/js/Screen.js';
import HookesLawIconFactory from '../common/view/HookesLawIconFactory.js';
import hookesLaw from '../hookesLaw.js';
import HookesLawStrings from '../HookesLawStrings.js';
import IntroModel from './model/IntroModel.js';
import IntroScreenView from './view/IntroScreenView.js';
import HookesLawColors from '../common/HookesLawColors.js';
export default class IntroScreen extends Screen {
  constructor(tandem) {
    const options = {
      name: HookesLawStrings.introStringProperty,
      backgroundColorProperty: HookesLawColors.SCREEN_VIEW_BACKGROUND,
      homeScreenIcon: HookesLawIconFactory.createIntroScreenIcon(),
      tandem: tandem
    };
    super(() => new IntroModel(tandem.createTandem('model')), model => new IntroScreenView(model, tandem.createTandem('view')), options);
  }
}
hookesLaw.register('IntroScreen', IntroScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJIb29rZXNMYXdJY29uRmFjdG9yeSIsImhvb2tlc0xhdyIsIkhvb2tlc0xhd1N0cmluZ3MiLCJJbnRyb01vZGVsIiwiSW50cm9TY3JlZW5WaWV3IiwiSG9va2VzTGF3Q29sb3JzIiwiSW50cm9TY3JlZW4iLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsIm9wdGlvbnMiLCJuYW1lIiwiaW50cm9TdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiU0NSRUVOX1ZJRVdfQkFDS0dST1VORCIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlSW50cm9TY3JlZW5JY29uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludHJvU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBcIkludHJvXCIgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0ljb25GYWN0b3J5IGZyb20gJy4uL2NvbW1vbi92aWV3L0hvb2tlc0xhd0ljb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IGhvb2tlc0xhdyBmcm9tICcuLi9ob29rZXNMYXcuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3U3RyaW5ncyBmcm9tICcuLi9Ib29rZXNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IEludHJvTW9kZWwgZnJvbSAnLi9tb2RlbC9JbnRyb01vZGVsLmpzJztcclxuaW1wb3J0IEludHJvU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvSW50cm9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IEhvb2tlc0xhd0NvbG9ycyBmcm9tICcuLi9jb21tb24vSG9va2VzTGF3Q29sb3JzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludHJvU2NyZWVuIGV4dGVuZHMgU2NyZWVuPEludHJvTW9kZWwsIEludHJvU2NyZWVuVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IEhvb2tlc0xhd1N0cmluZ3MuaW50cm9TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IEhvb2tlc0xhd0NvbG9ycy5TQ1JFRU5fVklFV19CQUNLR1JPVU5ELFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogSG9va2VzTGF3SWNvbkZhY3RvcnkuY3JlYXRlSW50cm9TY3JlZW5JY29uKCksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgSW50cm9Nb2RlbCggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBJbnRyb1NjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnSW50cm9TY3JlZW4nLCBJbnRyb1NjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLG9CQUFvQixNQUFNLHdDQUF3QztBQUN6RSxPQUFPQyxTQUFTLE1BQU0saUJBQWlCO0FBQ3ZDLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyxVQUFVLE1BQU0sdUJBQXVCO0FBQzlDLE9BQU9DLGVBQWUsTUFBTSwyQkFBMkI7QUFDdkQsT0FBT0MsZUFBZSxNQUFNLDhCQUE4QjtBQUcxRCxlQUFlLE1BQU1DLFdBQVcsU0FBU1AsTUFBTSxDQUE4QjtFQUVwRVEsV0FBV0EsQ0FBRUMsTUFBYyxFQUFHO0lBRW5DLE1BQU1DLE9BQU8sR0FBRztNQUNkQyxJQUFJLEVBQUVSLGdCQUFnQixDQUFDUyxtQkFBbUI7TUFDMUNDLHVCQUF1QixFQUFFUCxlQUFlLENBQUNRLHNCQUFzQjtNQUMvREMsY0FBYyxFQUFFZCxvQkFBb0IsQ0FBQ2UscUJBQXFCLENBQUMsQ0FBQztNQUM1RFAsTUFBTSxFQUFFQTtJQUNWLENBQUM7SUFFRCxLQUFLLENBQ0gsTUFBTSxJQUFJTCxVQUFVLENBQUVLLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ3REQyxLQUFLLElBQUksSUFBSWIsZUFBZSxDQUFFYSxLQUFLLEVBQUVULE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQ3BFUCxPQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFSLFNBQVMsQ0FBQ2lCLFFBQVEsQ0FBRSxhQUFhLEVBQUVaLFdBQVksQ0FBQyJ9