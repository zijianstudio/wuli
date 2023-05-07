// Copyright 2020-2022, University of Colorado Boulder

/**
 * Button that refills the kit buckets with the initial atoms.
 *
 * @author Denzell Barnett
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import replySolidShape from '../../../../sherpa/js/fontawesome-5/replySolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';

// constants
const OFFSET = 3;
class RefillButton extends RectangularPushButton {
  /**
   * @param {function} buttonListener
   * @param {Object} [options]
   */
  constructor(buttonListener, options) {
    const replyIcon = new Path(replySolidShape, {
      fill: 'black',
      // "safety orange", according to Wikipedia
      scale: 0.05
    });
    const sphereBucket = new SphereBucket({
      sphereRadius: 1,
      size: new Dimension2(130, 60),
      baseColor: 'rgb(222,222,222)' // Light-gray color
    });

    const bucketView = {
      bucketFront: new BucketFront(sphereBucket, BAMConstants.MODEL_VIEW_TRANSFORM),
      bucketHole: new BucketHole(sphereBucket, BAMConstants.MODEL_VIEW_TRANSFORM)
    };
    const contentNode = new Node({
      children: [replyIcon, bucketView.bucketHole, bucketView.bucketFront],
      scale: 0.60
    });

    // Placement adjustments and arrow rotation
    replyIcon.rotate(-Math.PI / 4);
    replyIcon.centerX = contentNode.centerX;
    bucketView.bucketHole.centerX = replyIcon.centerX;
    bucketView.bucketFront.centerX = bucketView.bucketHole.centerX;
    bucketView.bucketHole.top = replyIcon.bottom - OFFSET * 2;
    bucketView.bucketFront.top = bucketView.bucketHole.bottom - OFFSET;
    options = merge({
      yMargin: 5,
      content: contentNode,
      listener: buttonListener,
      baseColor: 'rgb(234,225,88)',
      soundPlayer: nullSoundPlayer
    }, options);
    super(options);
  }
}
buildAMolecule.register('RefillButton', RefillButton);
export default RefillButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJTcGhlcmVCdWNrZXQiLCJCdWNrZXRGcm9udCIsIkJ1Y2tldEhvbGUiLCJOb2RlIiwiUGF0aCIsInJlcGx5U29saWRTaGFwZSIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIm51bGxTb3VuZFBsYXllciIsImJ1aWxkQU1vbGVjdWxlIiwiQkFNQ29uc3RhbnRzIiwiT0ZGU0VUIiwiUmVmaWxsQnV0dG9uIiwiY29uc3RydWN0b3IiLCJidXR0b25MaXN0ZW5lciIsIm9wdGlvbnMiLCJyZXBseUljb24iLCJmaWxsIiwic2NhbGUiLCJzcGhlcmVCdWNrZXQiLCJzcGhlcmVSYWRpdXMiLCJzaXplIiwiYmFzZUNvbG9yIiwiYnVja2V0VmlldyIsImJ1Y2tldEZyb250IiwiTU9ERUxfVklFV19UUkFOU0ZPUk0iLCJidWNrZXRIb2xlIiwiY29udGVudE5vZGUiLCJjaGlsZHJlbiIsInJvdGF0ZSIsIk1hdGgiLCJQSSIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJ5TWFyZ2luIiwiY29udGVudCIsImxpc3RlbmVyIiwic291bmRQbGF5ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlZmlsbEJ1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCdXR0b24gdGhhdCByZWZpbGxzIHRoZSBraXQgYnVja2V0cyB3aXRoIHRoZSBpbml0aWFsIGF0b21zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dFxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTcGhlcmVCdWNrZXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9TcGhlcmVCdWNrZXQuanMnO1xyXG5pbXBvcnQgQnVja2V0RnJvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1Y2tldC9CdWNrZXRGcm9udC5qcyc7XHJcbmltcG9ydCBCdWNrZXRIb2xlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idWNrZXQvQnVja2V0SG9sZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcmVwbHlTb2xpZFNoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L3JlcGx5U29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQkFNQ29uc3RhbnRzIGZyb20gJy4uL0JBTUNvbnN0YW50cy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgT0ZGU0VUID0gMztcclxuXHJcbmNsYXNzIFJlZmlsbEJ1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gYnV0dG9uTGlzdGVuZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJ1dHRvbkxpc3RlbmVyLCBvcHRpb25zICkge1xyXG4gICAgY29uc3QgcmVwbHlJY29uID0gbmV3IFBhdGgoIHJlcGx5U29saWRTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snLCAvLyBcInNhZmV0eSBvcmFuZ2VcIiwgYWNjb3JkaW5nIHRvIFdpa2lwZWRpYVxyXG4gICAgICBzY2FsZTogMC4wNVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc3BoZXJlQnVja2V0ID0gbmV3IFNwaGVyZUJ1Y2tldCgge1xyXG4gICAgICBzcGhlcmVSYWRpdXM6IDEsXHJcbiAgICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCAxMzAsIDYwICksXHJcbiAgICAgIGJhc2VDb2xvcjogJ3JnYigyMjIsMjIyLDIyMiknIC8vIExpZ2h0LWdyYXkgY29sb3JcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGJ1Y2tldFZpZXcgPSB7XHJcbiAgICAgIGJ1Y2tldEZyb250OiBuZXcgQnVja2V0RnJvbnQoIHNwaGVyZUJ1Y2tldCwgQkFNQ29uc3RhbnRzLk1PREVMX1ZJRVdfVFJBTlNGT1JNICksXHJcbiAgICAgIGJ1Y2tldEhvbGU6IG5ldyBCdWNrZXRIb2xlKCBzcGhlcmVCdWNrZXQsIEJBTUNvbnN0YW50cy5NT0RFTF9WSUVXX1RSQU5TRk9STSApXHJcbiAgICB9O1xyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyByZXBseUljb24sIGJ1Y2tldFZpZXcuYnVja2V0SG9sZSwgYnVja2V0Vmlldy5idWNrZXRGcm9udCBdLFxyXG4gICAgICBzY2FsZTogMC42MFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFBsYWNlbWVudCBhZGp1c3RtZW50cyBhbmQgYXJyb3cgcm90YXRpb25cclxuICAgIHJlcGx5SWNvbi5yb3RhdGUoIC1NYXRoLlBJIC8gNCApO1xyXG4gICAgcmVwbHlJY29uLmNlbnRlclggPSBjb250ZW50Tm9kZS5jZW50ZXJYO1xyXG4gICAgYnVja2V0Vmlldy5idWNrZXRIb2xlLmNlbnRlclggPSByZXBseUljb24uY2VudGVyWDtcclxuICAgIGJ1Y2tldFZpZXcuYnVja2V0RnJvbnQuY2VudGVyWCA9IGJ1Y2tldFZpZXcuYnVja2V0SG9sZS5jZW50ZXJYO1xyXG4gICAgYnVja2V0Vmlldy5idWNrZXRIb2xlLnRvcCA9IHJlcGx5SWNvbi5ib3R0b20gLSBPRkZTRVQgKiAyO1xyXG4gICAgYnVja2V0Vmlldy5idWNrZXRGcm9udC50b3AgPSBidWNrZXRWaWV3LmJ1Y2tldEhvbGUuYm90dG9tIC0gT0ZGU0VUO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICBjb250ZW50OiBjb250ZW50Tm9kZSxcclxuICAgICAgbGlzdGVuZXI6IGJ1dHRvbkxpc3RlbmVyLFxyXG4gICAgICBiYXNlQ29sb3I6ICdyZ2IoMjM0LDIyNSw4OCknLFxyXG4gICAgICBzb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdSZWZpbGxCdXR0b24nLCBSZWZpbGxCdXR0b24gKTtcclxuZXhwb3J0IGRlZmF1bHQgUmVmaWxsQnV0dG9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLGlEQUFpRDtBQUMxRSxPQUFPQyxXQUFXLE1BQU0sbURBQW1EO0FBQzNFLE9BQU9DLFVBQVUsTUFBTSxrREFBa0Q7QUFDekUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLGVBQWUsTUFBTSx3REFBd0Q7QUFDcEYsT0FBT0MscUJBQXFCLE1BQU0scURBQXFEO0FBQ3ZGLE9BQU9DLGVBQWUsTUFBTSw4REFBOEQ7QUFDMUYsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9COztBQUU3QztBQUNBLE1BQU1DLE1BQU0sR0FBRyxDQUFDO0FBRWhCLE1BQU1DLFlBQVksU0FBU0wscUJBQXFCLENBQUM7RUFDL0M7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsY0FBYyxFQUFFQyxPQUFPLEVBQUc7SUFDckMsTUFBTUMsU0FBUyxHQUFHLElBQUlYLElBQUksQ0FBRUMsZUFBZSxFQUFFO01BQzNDVyxJQUFJLEVBQUUsT0FBTztNQUFFO01BQ2ZDLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBQztJQUNILE1BQU1DLFlBQVksR0FBRyxJQUFJbEIsWUFBWSxDQUFFO01BQ3JDbUIsWUFBWSxFQUFFLENBQUM7TUFDZkMsSUFBSSxFQUFFLElBQUl0QixVQUFVLENBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQztNQUMvQnVCLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQztJQUNoQyxDQUFFLENBQUM7O0lBQ0gsTUFBTUMsVUFBVSxHQUFHO01BQ2pCQyxXQUFXLEVBQUUsSUFBSXRCLFdBQVcsQ0FBRWlCLFlBQVksRUFBRVQsWUFBWSxDQUFDZSxvQkFBcUIsQ0FBQztNQUMvRUMsVUFBVSxFQUFFLElBQUl2QixVQUFVLENBQUVnQixZQUFZLEVBQUVULFlBQVksQ0FBQ2Usb0JBQXFCO0lBQzlFLENBQUM7SUFDRCxNQUFNRSxXQUFXLEdBQUcsSUFBSXZCLElBQUksQ0FBRTtNQUM1QndCLFFBQVEsRUFBRSxDQUFFWixTQUFTLEVBQUVPLFVBQVUsQ0FBQ0csVUFBVSxFQUFFSCxVQUFVLENBQUNDLFdBQVcsQ0FBRTtNQUN0RU4sS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDOztJQUVIO0lBQ0FGLFNBQVMsQ0FBQ2EsTUFBTSxDQUFFLENBQUNDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUUsQ0FBQztJQUNoQ2YsU0FBUyxDQUFDZ0IsT0FBTyxHQUFHTCxXQUFXLENBQUNLLE9BQU87SUFDdkNULFVBQVUsQ0FBQ0csVUFBVSxDQUFDTSxPQUFPLEdBQUdoQixTQUFTLENBQUNnQixPQUFPO0lBQ2pEVCxVQUFVLENBQUNDLFdBQVcsQ0FBQ1EsT0FBTyxHQUFHVCxVQUFVLENBQUNHLFVBQVUsQ0FBQ00sT0FBTztJQUM5RFQsVUFBVSxDQUFDRyxVQUFVLENBQUNPLEdBQUcsR0FBR2pCLFNBQVMsQ0FBQ2tCLE1BQU0sR0FBR3ZCLE1BQU0sR0FBRyxDQUFDO0lBQ3pEWSxVQUFVLENBQUNDLFdBQVcsQ0FBQ1MsR0FBRyxHQUFHVixVQUFVLENBQUNHLFVBQVUsQ0FBQ1EsTUFBTSxHQUFHdkIsTUFBTTtJQUVsRUksT0FBTyxHQUFHZixLQUFLLENBQUU7TUFDZm1DLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLE9BQU8sRUFBRVQsV0FBVztNQUNwQlUsUUFBUSxFQUFFdkIsY0FBYztNQUN4QlEsU0FBUyxFQUFFLGlCQUFpQjtNQUM1QmdCLFdBQVcsRUFBRTlCO0lBQ2YsQ0FBQyxFQUFFTyxPQUFRLENBQUM7SUFDWixLQUFLLENBQUVBLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFOLGNBQWMsQ0FBQzhCLFFBQVEsQ0FBRSxjQUFjLEVBQUUzQixZQUFhLENBQUM7QUFDdkQsZUFBZUEsWUFBWSJ9