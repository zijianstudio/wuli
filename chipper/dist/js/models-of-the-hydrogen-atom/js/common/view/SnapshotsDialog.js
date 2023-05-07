// Copyright 2016-2022, University of Colorado Boulder

//TODO reuse 1 instance of SnapshotsDialog for PhET-iO
/**
 * SnapshotsDialog is a dialog that displays spectrometer snapshots.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { VBox } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import MOTHAColors from '../MOTHAColors.js';
import SnapshotNode from './SnapshotNode.js';
export default class SnapshotsDialog extends Dialog {
  constructor(numberOfSnapshotsProperty, providedOptions) {
    const options = optionize()({
      // DialogOptions
      fill: MOTHAColors.snapshotsDialogFillProperty,
      topMargin: 15,
      bottomMargin: 15,
      leftMargin: 15
    }, providedOptions);
    const content = new VBox({
      spacing: 10,
      children: createSnapshotNodes(numberOfSnapshotsProperty)
    });
    super(content, options);

    //TODO remove a specific snapshot, rather than rebuilding them all
    const numberOfSnapshotsObserver = numberOfSnapshots => {
      if (numberOfSnapshots === 0) {
        this.hide();
      } else {
        content.children = createSnapshotNodes(numberOfSnapshotsProperty);
      }
    };
    numberOfSnapshotsProperty.lazyLink(numberOfSnapshotsObserver);
    this.disposeSnapshotsDialog = () => {
      numberOfSnapshotsProperty.unlink(numberOfSnapshotsObserver);
    };
  }

  //TODO verify whether this gets called and whether it works correctly, because Dialog.dispose has been suspect
  //TODO should we not dispose, and reuse this Dialog, for PhET-iO?
  dispose() {
    this.disposeSnapshotsDialog();
    super.dispose();
  }
}

/**
 * Creates the snapshots.
 */
function createSnapshotNodes(numberOfSnapshotsProperty) {
  const snapshots = [];
  for (let i = 0; i < numberOfSnapshotsProperty.value; i++) {
    snapshots.push(new SnapshotNode(numberOfSnapshotsProperty, {
      scale: 0.75
    }));
  }
  return snapshots;
}
modelsOfTheHydrogenAtom.register('SnapshotsDialog', SnapshotsDialog);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJWQm94IiwiRGlhbG9nIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJNT1RIQUNvbG9ycyIsIlNuYXBzaG90Tm9kZSIsIlNuYXBzaG90c0RpYWxvZyIsImNvbnN0cnVjdG9yIiwibnVtYmVyT2ZTbmFwc2hvdHNQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsIiwic25hcHNob3RzRGlhbG9nRmlsbFByb3BlcnR5IiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibGVmdE1hcmdpbiIsImNvbnRlbnQiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjcmVhdGVTbmFwc2hvdE5vZGVzIiwibnVtYmVyT2ZTbmFwc2hvdHNPYnNlcnZlciIsIm51bWJlck9mU25hcHNob3RzIiwiaGlkZSIsImxhenlMaW5rIiwiZGlzcG9zZVNuYXBzaG90c0RpYWxvZyIsInVubGluayIsImRpc3Bvc2UiLCJzbmFwc2hvdHMiLCJpIiwidmFsdWUiLCJwdXNoIiwic2NhbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNuYXBzaG90c0RpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8vVE9ETyByZXVzZSAxIGluc3RhbmNlIG9mIFNuYXBzaG90c0RpYWxvZyBmb3IgUGhFVC1pT1xyXG4vKipcclxuICogU25hcHNob3RzRGlhbG9nIGlzIGEgZGlhbG9nIHRoYXQgZGlzcGxheXMgc3BlY3Ryb21ldGVyIHNuYXBzaG90cy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgRGlhbG9nLCB7IERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcclxuaW1wb3J0IG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIGZyb20gJy4uLy4uL21vZGVsc09mVGhlSHlkcm9nZW5BdG9tLmpzJztcclxuaW1wb3J0IE1PVEhBQ29sb3JzIGZyb20gJy4uL01PVEhBQ29sb3JzLmpzJztcclxuaW1wb3J0IFNuYXBzaG90Tm9kZSBmcm9tICcuL1NuYXBzaG90Tm9kZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgU25hcHNob3RzRGlhbG9nT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERpYWxvZ09wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNuYXBzaG90c0RpYWxvZyBleHRlbmRzIERpYWxvZyB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNuYXBzaG90c0RpYWxvZzogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogU25hcHNob3RzRGlhbG9nT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNuYXBzaG90c0RpYWxvZ09wdGlvbnMsIFNlbGZPcHRpb25zLCBEaWFsb2dPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBEaWFsb2dPcHRpb25zXHJcbiAgICAgIGZpbGw6IE1PVEhBQ29sb3JzLnNuYXBzaG90c0RpYWxvZ0ZpbGxQcm9wZXJ0eSxcclxuICAgICAgdG9wTWFyZ2luOiAxNSxcclxuICAgICAgYm90dG9tTWFyZ2luOiAxNSxcclxuICAgICAgbGVmdE1hcmdpbjogMTVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IGNyZWF0ZVNuYXBzaG90Tm9kZXMoIG51bWJlck9mU25hcHNob3RzUHJvcGVydHkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBjb250ZW50LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy9UT0RPIHJlbW92ZSBhIHNwZWNpZmljIHNuYXBzaG90LCByYXRoZXIgdGhhbiByZWJ1aWxkaW5nIHRoZW0gYWxsXHJcbiAgICBjb25zdCBudW1iZXJPZlNuYXBzaG90c09ic2VydmVyID0gKCBudW1iZXJPZlNuYXBzaG90czogbnVtYmVyICkgPT4ge1xyXG4gICAgICBpZiAoIG51bWJlck9mU25hcHNob3RzID09PSAwICkge1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnRlbnQuY2hpbGRyZW4gPSBjcmVhdGVTbmFwc2hvdE5vZGVzKCBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5LmxhenlMaW5rKCBudW1iZXJPZlNuYXBzaG90c09ic2VydmVyICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU25hcHNob3RzRGlhbG9nID0gKCkgPT4ge1xyXG4gICAgICBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5LnVubGluayggbnVtYmVyT2ZTbmFwc2hvdHNPYnNlcnZlciApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vVE9ETyB2ZXJpZnkgd2hldGhlciB0aGlzIGdldHMgY2FsbGVkIGFuZCB3aGV0aGVyIGl0IHdvcmtzIGNvcnJlY3RseSwgYmVjYXVzZSBEaWFsb2cuZGlzcG9zZSBoYXMgYmVlbiBzdXNwZWN0XHJcbiAgLy9UT0RPIHNob3VsZCB3ZSBub3QgZGlzcG9zZSwgYW5kIHJldXNlIHRoaXMgRGlhbG9nLCBmb3IgUGhFVC1pTz9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVNuYXBzaG90c0RpYWxvZygpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIHNuYXBzaG90cy5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVNuYXBzaG90Tm9kZXMoIG51bWJlck9mU25hcHNob3RzUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+ICk6IFNuYXBzaG90Tm9kZVtdIHtcclxuICBjb25zdCBzbmFwc2hvdHMgPSBbXTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5LnZhbHVlOyBpKysgKSB7XHJcbiAgICBzbmFwc2hvdHMucHVzaCggbmV3IFNuYXBzaG90Tm9kZSggbnVtYmVyT2ZTbmFwc2hvdHNQcm9wZXJ0eSwge1xyXG4gICAgICBzY2FsZTogMC43NVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG4gIHJldHVybiBzbmFwc2hvdHM7XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnU25hcHNob3RzRGlhbG9nJywgU25hcHNob3RzRGlhbG9nICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxNQUFNLE1BQXlCLDhCQUE4QjtBQUNwRSxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBTTVDLGVBQWUsTUFBTUMsZUFBZSxTQUFTSixNQUFNLENBQUM7RUFJM0NLLFdBQVdBLENBQUVDLHlCQUE0QyxFQUFFQyxlQUF3QyxFQUFHO0lBRTNHLE1BQU1DLE9BQU8sR0FBR1YsU0FBUyxDQUFxRCxDQUFDLENBQUU7TUFFL0U7TUFDQVcsSUFBSSxFQUFFUCxXQUFXLENBQUNRLDJCQUEyQjtNQUM3Q0MsU0FBUyxFQUFFLEVBQUU7TUFDYkMsWUFBWSxFQUFFLEVBQUU7TUFDaEJDLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFBRU4sZUFBZ0IsQ0FBQztJQUVwQixNQUFNTyxPQUFPLEdBQUcsSUFBSWYsSUFBSSxDQUFFO01BQ3hCZ0IsT0FBTyxFQUFFLEVBQUU7TUFDWEMsUUFBUSxFQUFFQyxtQkFBbUIsQ0FBRVgseUJBQTBCO0lBQzNELENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRVEsT0FBTyxFQUFFTixPQUFRLENBQUM7O0lBRXpCO0lBQ0EsTUFBTVUseUJBQXlCLEdBQUtDLGlCQUF5QixJQUFNO01BQ2pFLElBQUtBLGlCQUFpQixLQUFLLENBQUMsRUFBRztRQUM3QixJQUFJLENBQUNDLElBQUksQ0FBQyxDQUFDO01BQ2IsQ0FBQyxNQUNJO1FBQ0hOLE9BQU8sQ0FBQ0UsUUFBUSxHQUFHQyxtQkFBbUIsQ0FBRVgseUJBQTBCLENBQUM7TUFDckU7SUFDRixDQUFDO0lBQ0RBLHlCQUF5QixDQUFDZSxRQUFRLENBQUVILHlCQUEwQixDQUFDO0lBRS9ELElBQUksQ0FBQ0ksc0JBQXNCLEdBQUcsTUFBTTtNQUNsQ2hCLHlCQUF5QixDQUFDaUIsTUFBTSxDQUFFTCx5QkFBMEIsQ0FBQztJQUMvRCxDQUFDO0VBQ0g7O0VBRUE7RUFDQTtFQUNnQk0sT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0Ysc0JBQXNCLENBQUMsQ0FBQztJQUM3QixLQUFLLENBQUNFLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBU1AsbUJBQW1CQSxDQUFFWCx5QkFBNEMsRUFBbUI7RUFDM0YsTUFBTW1CLFNBQVMsR0FBRyxFQUFFO0VBQ3BCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHcEIseUJBQXlCLENBQUNxQixLQUFLLEVBQUVELENBQUMsRUFBRSxFQUFHO0lBQzFERCxTQUFTLENBQUNHLElBQUksQ0FBRSxJQUFJekIsWUFBWSxDQUFFRyx5QkFBeUIsRUFBRTtNQUMzRHVCLEtBQUssRUFBRTtJQUNULENBQUUsQ0FBRSxDQUFDO0VBQ1A7RUFDQSxPQUFPSixTQUFTO0FBQ2xCO0FBRUF4Qix1QkFBdUIsQ0FBQzZCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRTFCLGVBQWdCLENBQUMifQ==