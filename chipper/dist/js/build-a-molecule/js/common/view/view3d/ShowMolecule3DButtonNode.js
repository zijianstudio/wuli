// Copyright 2020-2022, University of Colorado Boulder

/**
 * Button responsible for showing a 3D representation of the molecule.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import ButtonNode from '../../../../../sun/js/buttons/ButtonNode.js';
import nullSoundPlayer from '../../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
import buildAMolecule from '../../../buildAMolecule.js';
import BuildAMoleculeStrings from '../../../BuildAMoleculeStrings.js';
import BAMConstants from '../../BAMConstants.js';
class ShowMolecule3DButtonNode extends RectangularPushButton {
  /**
   * @param {CompleteMolecule} completeMolecule
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor(completeMolecule, showDialogCallback, options) {
    const content = new Text(BuildAMoleculeStrings.threeD, {
      font: new PhetFont({
        size: 12,
        weight: 'bold'
      }),
      fill: 'white',
      maxWidth: BAMConstants.TEXT_MAX_WIDTH / 4
    });
    super(merge({
      listener: () => {
        showDialogCallback(completeMolecule);
      },
      content: content,
      baseColor: 'rgb( 112, 177, 84 )',
      xMargin: 3,
      yMargin: 3,
      cursor: 'pointer',
      soundPlayer: nullSoundPlayer,
      cornerRadius: content.height > 8 ? 4 : 0,
      buttonAppearanceStrategy: content.height > 8 ? RectangularPushButton.ThreeDAppearanceStrategy : ButtonNode.FlatAppearanceStrategy
    }, options));
  }
}
buildAMolecule.register('ShowMolecule3DButtonNode', ShowMolecule3DButtonNode);
export default ShowMolecule3DButtonNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkJ1dHRvbk5vZGUiLCJudWxsU291bmRQbGF5ZXIiLCJidWlsZEFNb2xlY3VsZSIsIkJ1aWxkQU1vbGVjdWxlU3RyaW5ncyIsIkJBTUNvbnN0YW50cyIsIlNob3dNb2xlY3VsZTNEQnV0dG9uTm9kZSIsImNvbnN0cnVjdG9yIiwiY29tcGxldGVNb2xlY3VsZSIsInNob3dEaWFsb2dDYWxsYmFjayIsIm9wdGlvbnMiLCJjb250ZW50IiwidGhyZWVEIiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJmaWxsIiwibWF4V2lkdGgiLCJURVhUX01BWF9XSURUSCIsImxpc3RlbmVyIiwiYmFzZUNvbG9yIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjdXJzb3IiLCJzb3VuZFBsYXllciIsImNvcm5lclJhZGl1cyIsImhlaWdodCIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSIsIlRocmVlREFwcGVhcmFuY2VTdHJhdGVneSIsIkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNob3dNb2xlY3VsZTNEQnV0dG9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCdXR0b24gcmVzcG9uc2libGUgZm9yIHNob3dpbmcgYSAzRCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9sZWN1bGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgQnV0dG9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5pbXBvcnQgYnVpbGRBTW9sZWN1bGUgZnJvbSAnLi4vLi4vLi4vYnVpbGRBTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgQnVpbGRBTW9sZWN1bGVTdHJpbmdzIGZyb20gJy4uLy4uLy4uL0J1aWxkQU1vbGVjdWxlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQU1Db25zdGFudHMgZnJvbSAnLi4vLi4vQkFNQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFNob3dNb2xlY3VsZTNEQnV0dG9uTm9kZSBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb21wbGV0ZU1vbGVjdWxlfSBjb21wbGV0ZU1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gc2hvd0RpYWxvZ0NhbGxiYWNrXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb21wbGV0ZU1vbGVjdWxlLCBzaG93RGlhbG9nQ2FsbGJhY2ssIG9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFRleHQoIEJ1aWxkQU1vbGVjdWxlU3RyaW5ncy50aHJlZUQsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgc2l6ZTogMTIsXHJcbiAgICAgICAgd2VpZ2h0OiAnYm9sZCdcclxuICAgICAgfSApLFxyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBtYXhXaWR0aDogQkFNQ29uc3RhbnRzLlRFWFRfTUFYX1dJRFRIIC8gNFxyXG4gICAgfSApO1xyXG4gICAgc3VwZXIoIG1lcmdlKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgc2hvd0RpYWxvZ0NhbGxiYWNrKCBjb21wbGV0ZU1vbGVjdWxlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXHJcbiAgICAgIGJhc2VDb2xvcjogJ3JnYiggMTEyLCAxNzcsIDg0ICknLFxyXG4gICAgICB4TWFyZ2luOiAzLFxyXG4gICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgc291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllcixcclxuICAgICAgY29ybmVyUmFkaXVzOiBjb250ZW50LmhlaWdodCA+IDggPyA0IDogMCxcclxuICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBjb250ZW50LmhlaWdodCA+IDggPyBSZWN0YW5ndWxhclB1c2hCdXR0b24uVGhyZWVEQXBwZWFyYW5jZVN0cmF0ZWd5IDogQnV0dG9uTm9kZS5GbGF0QXBwZWFyYW5jZVN0cmF0ZWd5XHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU1vbGVjdWxlLnJlZ2lzdGVyKCAnU2hvd01vbGVjdWxlM0RCdXR0b25Ob2RlJywgU2hvd01vbGVjdWxlM0RCdXR0b25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNob3dNb2xlY3VsZTNEQnV0dG9uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsU0FBU0MsSUFBSSxRQUFRLHNDQUFzQztBQUMzRCxPQUFPQyxxQkFBcUIsTUFBTSx3REFBd0Q7QUFDMUYsT0FBT0MsVUFBVSxNQUFNLDZDQUE2QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0saUVBQWlFO0FBQzdGLE9BQU9DLGNBQWMsTUFBTSw0QkFBNEI7QUFDdkQsT0FBT0MscUJBQXFCLE1BQU0sbUNBQW1DO0FBQ3JFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFFaEQsTUFBTUMsd0JBQXdCLFNBQVNOLHFCQUFxQixDQUFDO0VBQzNEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRU8sV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLGtCQUFrQixFQUFFQyxPQUFPLEVBQUc7SUFDM0QsTUFBTUMsT0FBTyxHQUFHLElBQUlaLElBQUksQ0FBRUsscUJBQXFCLENBQUNRLE1BQU0sRUFBRTtNQUN0REMsSUFBSSxFQUFFLElBQUlmLFFBQVEsQ0FBRTtRQUNsQmdCLElBQUksRUFBRSxFQUFFO1FBQ1JDLE1BQU0sRUFBRTtNQUNWLENBQUUsQ0FBQztNQUNIQyxJQUFJLEVBQUUsT0FBTztNQUNiQyxRQUFRLEVBQUVaLFlBQVksQ0FBQ2EsY0FBYyxHQUFHO0lBQzFDLENBQUUsQ0FBQztJQUNILEtBQUssQ0FBRXJCLEtBQUssQ0FBRTtNQUNac0IsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFDZFYsa0JBQWtCLENBQUVELGdCQUFpQixDQUFDO01BQ3hDLENBQUM7TUFDREcsT0FBTyxFQUFFQSxPQUFPO01BQ2hCUyxTQUFTLEVBQUUscUJBQXFCO01BQ2hDQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxPQUFPLEVBQUUsQ0FBQztNQUNWQyxNQUFNLEVBQUUsU0FBUztNQUNqQkMsV0FBVyxFQUFFdEIsZUFBZTtNQUM1QnVCLFlBQVksRUFBRWQsT0FBTyxDQUFDZSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO01BQ3hDQyx3QkFBd0IsRUFBRWhCLE9BQU8sQ0FBQ2UsTUFBTSxHQUFHLENBQUMsR0FBRzFCLHFCQUFxQixDQUFDNEIsd0JBQXdCLEdBQUczQixVQUFVLENBQUM0QjtJQUM3RyxDQUFDLEVBQUVuQixPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFQLGNBQWMsQ0FBQzJCLFFBQVEsQ0FBRSwwQkFBMEIsRUFBRXhCLHdCQUF5QixDQUFDO0FBQy9FLGVBQWVBLHdCQUF3QiJ9