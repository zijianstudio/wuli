// Copyright 2017-2022, University of Colorado Boulder

/**
 * The 'Numbers' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import EqualityExplorerScreen from '../common/EqualityExplorerScreen.js';
import equalityExplorer from '../equalityExplorer.js';
import EqualityExplorerStrings from '../EqualityExplorerStrings.js';
import NumbersModel from './model/NumbersModel.js';
import NumbersScreenView from './view/NumbersScreenView.js';
import HaloNode from '../common/view/HaloNode.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Fraction from '../../../phetcommon/js/model/Fraction.js';
import EqualityExplorerColors from '../common/EqualityExplorerColors.js';
import ConstantTermNode from '../common/view/ConstantTermNode.js';
import { Node } from '../../../scenery/js/imports.js';
export default class NumbersScreen extends EqualityExplorerScreen {
  constructor(providedOptions) {
    const options = optionize()({
      // EqualityExplorerScreenOptions
      name: EqualityExplorerStrings.screen.numbersStringProperty,
      backgroundColorProperty: new Property(EqualityExplorerColors.NUMBERS_SCREEN_BACKGROUND),
      homeScreenIcon: createScreenIcon()
    }, providedOptions);
    super(() => new NumbersModel(options.tandem.createTandem('model')), model => new NumbersScreenView(model, options.tandem.createTandem('view')), options);
  }
}

/**
 * Creates the icon for this screen: 1 and -1 overlapping
 */
function createScreenIcon() {
  // 1
  const positiveOneNode = ConstantTermNode.createInteractiveTermNode(Fraction.fromInteger(1));

  // -1
  const negativeOneNode = ConstantTermNode.createInteractiveTermNode(Fraction.fromInteger(-1));

  // -1 overlaps 1
  negativeOneNode.left = positiveOneNode.right - 10;
  negativeOneNode.bottom = positiveOneNode.centerY + 10;

  // halos
  const haloRadius = 0.85 * positiveOneNode.width;
  const positiveOneHaloNode = new HaloNode(haloRadius, {
    center: positiveOneNode.center
  });
  const negativeOneHaloNode = new HaloNode(haloRadius, {
    center: negativeOneNode.center
  });
  const iconNode = new Node({
    children: [positiveOneHaloNode, negativeOneHaloNode, positiveOneNode, negativeOneNode]
  });
  return new ScreenIcon(iconNode, {
    fill: EqualityExplorerColors.NUMBERS_SCREEN_BACKGROUND
  });
}
equalityExplorer.register('NumbersScreen', NumbersScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIkVxdWFsaXR5RXhwbG9yZXJTY3JlZW4iLCJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlclN0cmluZ3MiLCJOdW1iZXJzTW9kZWwiLCJOdW1iZXJzU2NyZWVuVmlldyIsIkhhbG9Ob2RlIiwiU2NyZWVuSWNvbiIsIkZyYWN0aW9uIiwiRXF1YWxpdHlFeHBsb3JlckNvbG9ycyIsIkNvbnN0YW50VGVybU5vZGUiLCJOb2RlIiwiTnVtYmVyc1NjcmVlbiIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJudW1iZXJzU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIk5VTUJFUlNfU0NSRUVOX0JBQ0tHUk9VTkQiLCJob21lU2NyZWVuSWNvbiIsImNyZWF0ZVNjcmVlbkljb24iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInBvc2l0aXZlT25lTm9kZSIsImNyZWF0ZUludGVyYWN0aXZlVGVybU5vZGUiLCJmcm9tSW50ZWdlciIsIm5lZ2F0aXZlT25lTm9kZSIsImxlZnQiLCJyaWdodCIsImJvdHRvbSIsImNlbnRlclkiLCJoYWxvUmFkaXVzIiwid2lkdGgiLCJwb3NpdGl2ZU9uZUhhbG9Ob2RlIiwiY2VudGVyIiwibmVnYXRpdmVPbmVIYWxvTm9kZSIsImljb25Ob2RlIiwiY2hpbGRyZW4iLCJmaWxsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJzU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSAnTnVtYmVycycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuLCB7IEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5PcHRpb25zIH0gZnJvbSAnLi4vY29tbW9uL0VxdWFsaXR5RXhwbG9yZXJTY3JlZW4uanMnO1xyXG5pbXBvcnQgZXF1YWxpdHlFeHBsb3JlciBmcm9tICcuLi9lcXVhbGl0eUV4cGxvcmVyLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzIGZyb20gJy4uL0VxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLmpzJztcclxuaW1wb3J0IE51bWJlcnNNb2RlbCBmcm9tICcuL21vZGVsL051bWJlcnNNb2RlbC5qcyc7XHJcbmltcG9ydCBOdW1iZXJzU2NyZWVuVmlldyBmcm9tICcuL3ZpZXcvTnVtYmVyc1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgSGFsb05vZGUgZnJvbSAnLi4vY29tbW9uL3ZpZXcvSGFsb05vZGUuanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IEZyYWN0aW9uIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24uanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlckNvbG9ycyBmcm9tICcuLi9jb21tb24vRXF1YWxpdHlFeHBsb3JlckNvbG9ycy5qcyc7XHJcbmltcG9ydCBDb25zdGFudFRlcm1Ob2RlIGZyb20gJy4uL2NvbW1vbi92aWV3L0NvbnN0YW50VGVybU5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBOdW1iZXJzU2NyZWVuT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5PcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdW1iZXJzU2NyZWVuIGV4dGVuZHMgRXF1YWxpdHlFeHBsb3JlclNjcmVlbjxOdW1iZXJzTW9kZWwsIE51bWJlcnNTY3JlZW5WaWV3PiB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBOdW1iZXJzU2NyZWVuT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE51bWJlcnNTY3JlZW5PcHRpb25zLCBTZWxmT3B0aW9ucywgRXF1YWxpdHlFeHBsb3JlclNjcmVlbk9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5PcHRpb25zXHJcbiAgICAgIG5hbWU6IEVxdWFsaXR5RXhwbG9yZXJTdHJpbmdzLnNjcmVlbi5udW1iZXJzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIEVxdWFsaXR5RXhwbG9yZXJDb2xvcnMuTlVNQkVSU19TQ1JFRU5fQkFDS0dST1VORCApLFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogY3JlYXRlU2NyZWVuSWNvbigpXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IE51bWJlcnNNb2RlbCggb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IE51bWJlcnNTY3JlZW5WaWV3KCBtb2RlbCwgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoaXMgc2NyZWVuOiAxIGFuZCAtMSBvdmVybGFwcGluZ1xyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlU2NyZWVuSWNvbigpOiBTY3JlZW5JY29uIHtcclxuXHJcbiAgLy8gMVxyXG4gIGNvbnN0IHBvc2l0aXZlT25lTm9kZSA9IENvbnN0YW50VGVybU5vZGUuY3JlYXRlSW50ZXJhY3RpdmVUZXJtTm9kZSggRnJhY3Rpb24uZnJvbUludGVnZXIoIDEgKSApO1xyXG5cclxuICAvLyAtMVxyXG4gIGNvbnN0IG5lZ2F0aXZlT25lTm9kZSA9IENvbnN0YW50VGVybU5vZGUuY3JlYXRlSW50ZXJhY3RpdmVUZXJtTm9kZSggRnJhY3Rpb24uZnJvbUludGVnZXIoIC0xICkgKTtcclxuXHJcbiAgLy8gLTEgb3ZlcmxhcHMgMVxyXG4gIG5lZ2F0aXZlT25lTm9kZS5sZWZ0ID0gcG9zaXRpdmVPbmVOb2RlLnJpZ2h0IC0gMTA7XHJcbiAgbmVnYXRpdmVPbmVOb2RlLmJvdHRvbSA9IHBvc2l0aXZlT25lTm9kZS5jZW50ZXJZICsgMTA7XHJcblxyXG4gIC8vIGhhbG9zXHJcbiAgY29uc3QgaGFsb1JhZGl1cyA9IDAuODUgKiBwb3NpdGl2ZU9uZU5vZGUud2lkdGg7XHJcbiAgY29uc3QgcG9zaXRpdmVPbmVIYWxvTm9kZSA9IG5ldyBIYWxvTm9kZSggaGFsb1JhZGl1cywge1xyXG4gICAgY2VudGVyOiBwb3NpdGl2ZU9uZU5vZGUuY2VudGVyXHJcbiAgfSApO1xyXG4gIGNvbnN0IG5lZ2F0aXZlT25lSGFsb05vZGUgPSBuZXcgSGFsb05vZGUoIGhhbG9SYWRpdXMsIHtcclxuICAgIGNlbnRlcjogbmVnYXRpdmVPbmVOb2RlLmNlbnRlclxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgaWNvbk5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgY2hpbGRyZW46IFsgcG9zaXRpdmVPbmVIYWxvTm9kZSwgbmVnYXRpdmVPbmVIYWxvTm9kZSwgcG9zaXRpdmVPbmVOb2RlLCBuZWdhdGl2ZU9uZU5vZGUgXVxyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBTY3JlZW5JY29uKCBpY29uTm9kZSwge1xyXG4gICAgZmlsbDogRXF1YWxpdHlFeHBsb3JlckNvbG9ycy5OVU1CRVJTX1NDUkVFTl9CQUNLR1JPVU5EXHJcbiAgfSApO1xyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnTnVtYmVyc1NjcmVlbicsIE51bWJlcnNTY3JlZW4gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxTQUFTLE1BQTRCLG9DQUFvQztBQUVoRixPQUFPQyxzQkFBc0IsTUFBeUMscUNBQXFDO0FBQzNHLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLHlCQUF5QjtBQUNsRCxPQUFPQyxpQkFBaUIsTUFBTSw2QkFBNkI7QUFDM0QsT0FBT0MsUUFBUSxNQUFNLDRCQUE0QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSwwQ0FBMEM7QUFDL0QsT0FBT0Msc0JBQXNCLE1BQU0scUNBQXFDO0FBQ3hFLE9BQU9DLGdCQUFnQixNQUFNLG9DQUFvQztBQUNqRSxTQUFTQyxJQUFJLFFBQVEsZ0NBQWdDO0FBTXJELGVBQWUsTUFBTUMsYUFBYSxTQUFTWCxzQkFBc0IsQ0FBa0M7RUFFMUZZLFdBQVdBLENBQUVDLGVBQXFDLEVBQUc7SUFFMUQsTUFBTUMsT0FBTyxHQUFHZixTQUFTLENBQW1FLENBQUMsQ0FBRTtNQUU3RjtNQUNBZ0IsSUFBSSxFQUFFYix1QkFBdUIsQ0FBQ2MsTUFBTSxDQUFDQyxxQkFBcUI7TUFDMURDLHVCQUF1QixFQUFFLElBQUlwQixRQUFRLENBQUVVLHNCQUFzQixDQUFDVyx5QkFBMEIsQ0FBQztNQUN6RkMsY0FBYyxFQUFFQyxnQkFBZ0IsQ0FBQztJQUNuQyxDQUFDLEVBQUVSLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUNILE1BQU0sSUFBSVYsWUFBWSxDQUFFVyxPQUFPLENBQUNRLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ2hFQyxLQUFLLElBQUksSUFBSXBCLGlCQUFpQixDQUFFb0IsS0FBSyxFQUFFVixPQUFPLENBQUNRLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLE1BQU8sQ0FBRSxDQUFDLEVBQzlFVCxPQUNGLENBQUM7RUFDSDtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVNPLGdCQUFnQkEsQ0FBQSxFQUFlO0VBRXRDO0VBQ0EsTUFBTUksZUFBZSxHQUFHaEIsZ0JBQWdCLENBQUNpQix5QkFBeUIsQ0FBRW5CLFFBQVEsQ0FBQ29CLFdBQVcsQ0FBRSxDQUFFLENBQUUsQ0FBQzs7RUFFL0Y7RUFDQSxNQUFNQyxlQUFlLEdBQUduQixnQkFBZ0IsQ0FBQ2lCLHlCQUF5QixDQUFFbkIsUUFBUSxDQUFDb0IsV0FBVyxDQUFFLENBQUMsQ0FBRSxDQUFFLENBQUM7O0VBRWhHO0VBQ0FDLGVBQWUsQ0FBQ0MsSUFBSSxHQUFHSixlQUFlLENBQUNLLEtBQUssR0FBRyxFQUFFO0VBQ2pERixlQUFlLENBQUNHLE1BQU0sR0FBR04sZUFBZSxDQUFDTyxPQUFPLEdBQUcsRUFBRTs7RUFFckQ7RUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSSxHQUFHUixlQUFlLENBQUNTLEtBQUs7RUFDL0MsTUFBTUMsbUJBQW1CLEdBQUcsSUFBSTlCLFFBQVEsQ0FBRTRCLFVBQVUsRUFBRTtJQUNwREcsTUFBTSxFQUFFWCxlQUFlLENBQUNXO0VBQzFCLENBQUUsQ0FBQztFQUNILE1BQU1DLG1CQUFtQixHQUFHLElBQUloQyxRQUFRLENBQUU0QixVQUFVLEVBQUU7SUFDcERHLE1BQU0sRUFBRVIsZUFBZSxDQUFDUTtFQUMxQixDQUFFLENBQUM7RUFFSCxNQUFNRSxRQUFRLEdBQUcsSUFBSTVCLElBQUksQ0FBRTtJQUN6QjZCLFFBQVEsRUFBRSxDQUFFSixtQkFBbUIsRUFBRUUsbUJBQW1CLEVBQUVaLGVBQWUsRUFBRUcsZUFBZTtFQUN4RixDQUFFLENBQUM7RUFFSCxPQUFPLElBQUl0QixVQUFVLENBQUVnQyxRQUFRLEVBQUU7SUFDL0JFLElBQUksRUFBRWhDLHNCQUFzQixDQUFDVztFQUMvQixDQUFFLENBQUM7QUFDTDtBQUVBbEIsZ0JBQWdCLENBQUN3QyxRQUFRLENBQUUsZUFBZSxFQUFFOUIsYUFBYyxDQUFDIn0=