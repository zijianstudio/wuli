// Copyright 2019-2023, University of Colorado Boulder

/**
 * LabScreen is the 'Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { HBox, Image, VBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import bunnyBrownFurFloppyEarsLongTeeth_png from '../../images/bunnyBrownFurFloppyEarsLongTeeth_png.js';
import bunnyBrownFurFloppyEarsShortTeeth_png from '../../images/bunnyBrownFurFloppyEarsShortTeeth_png.js';
import bunnyBrownFurStraightEarsLongTeeth_png from '../../images/bunnyBrownFurStraightEarsLongTeeth_png.js';
import bunnyBrownFurStraightEarsShortTeeth_png from '../../images/bunnyBrownFurStraightEarsShortTeeth_png.js';
import bunnyWhiteFurFloppyEarsLongTeeth_png from '../../images/bunnyWhiteFurFloppyEarsLongTeeth_png.js';
import bunnyWhiteFurFloppyEarsShortTeeth_png from '../../images/bunnyWhiteFurFloppyEarsShortTeeth_png.js';
import bunnyWhiteFurStraightEarsLongTeeth_png from '../../images/bunnyWhiteFurStraightEarsLongTeeth_png.js';
import bunnyWhiteFurStraightEarsShortTeeth_png from '../../images/bunnyWhiteFurStraightEarsShortTeeth_png.js';
import NaturalSelectionColors from '../common/NaturalSelectionColors.js';
import naturalSelection from '../naturalSelection.js';
import NaturalSelectionStrings from '../NaturalSelectionStrings.js';
import LabModel from './model/LabModel.js';
import LabScreenView from './view/LabScreenView.js';
export default class LabScreen extends Screen {
  constructor(tandem) {
    const options = {
      // Screen options
      name: NaturalSelectionStrings.screen.labStringProperty,
      homeScreenIcon: createScreenIcon(),
      backgroundColorProperty: new Property(NaturalSelectionColors.SCREEN_VIEW_BACKGROUND, {
        tandem: Tandem.OPT_OUT
      }),
      // phet-io
      tandem: tandem
    };
    super(() => new LabModel(tandem.createTandem('model')), model => new LabScreenView(model, tandem.createTandem('view')), options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Creates the icon for this screen.
 */
function createScreenIcon() {
  const SPACING = 20;
  return new ScreenIcon(new VBox({
    spacing: SPACING,
    children: [
    // row 1
    new HBox({
      spacing: SPACING,
      children: [new Image(bunnyBrownFurStraightEarsShortTeeth_png), new Image(bunnyWhiteFurStraightEarsShortTeeth_png), new Image(bunnyBrownFurFloppyEarsShortTeeth_png), new Image(bunnyWhiteFurFloppyEarsShortTeeth_png)]
    }),
    // row 2
    new HBox({
      spacing: SPACING,
      children: [new Image(bunnyWhiteFurStraightEarsLongTeeth_png), new Image(bunnyBrownFurStraightEarsLongTeeth_png), new Image(bunnyWhiteFurFloppyEarsLongTeeth_png), new Image(bunnyBrownFurFloppyEarsLongTeeth_png)]
    })]
  }), {
    fill: NaturalSelectionColors.SCREEN_VIEW_BACKGROUND
  });
}
naturalSelection.register('LabScreen', LabScreen);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNjcmVlbkljb24iLCJIQm94IiwiSW1hZ2UiLCJWQm94IiwiVGFuZGVtIiwiYnVubnlCcm93bkZ1ckZsb3BweUVhcnNMb25nVGVldGhfcG5nIiwiYnVubnlCcm93bkZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZyIsImJ1bm55QnJvd25GdXJTdHJhaWdodEVhcnNMb25nVGVldGhfcG5nIiwiYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIiwiYnVubnlXaGl0ZUZ1ckZsb3BweUVhcnNMb25nVGVldGhfcG5nIiwiYnVubnlXaGl0ZUZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZyIsImJ1bm55V2hpdGVGdXJTdHJhaWdodEVhcnNMb25nVGVldGhfcG5nIiwiYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIiwiTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyIsIkxhYk1vZGVsIiwiTGFiU2NyZWVuVmlldyIsIkxhYlNjcmVlbiIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsIm5hbWUiLCJzY3JlZW4iLCJsYWJTdHJpbmdQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwiY3JlYXRlU2NyZWVuSWNvbiIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiU0NSRUVOX1ZJRVdfQkFDS0dST1VORCIsIk9QVF9PVVQiLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJTUEFDSU5HIiwic3BhY2luZyIsImNoaWxkcmVuIiwiZmlsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiU2NyZWVuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIExhYlNjcmVlbiBpcyB0aGUgJ0xhYicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSW1hZ2UsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYnVubnlCcm93bkZ1ckZsb3BweUVhcnNMb25nVGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueUJyb3duRnVyRmxvcHB5RWFyc0xvbmdUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlCcm93bkZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvYnVubnlCcm93bkZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZy5qcyc7XHJcbmltcG9ydCBidW5ueUJyb3duRnVyU3RyYWlnaHRFYXJzTG9uZ1RlZXRoX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc0xvbmdUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueUJyb3duRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlXaGl0ZUZ1ckZsb3BweUVhcnNMb25nVGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueVdoaXRlRnVyRmxvcHB5RWFyc0xvbmdUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlXaGl0ZUZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvYnVubnlXaGl0ZUZ1ckZsb3BweUVhcnNTaG9ydFRlZXRoX3BuZy5qcyc7XHJcbmltcG9ydCBidW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzTG9uZ1RlZXRoX3BuZyBmcm9tICcuLi8uLi9pbWFnZXMvYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc0xvbmdUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uL2ltYWdlcy9idW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvbkNvbG9ycyBmcm9tICcuLi9jb21tb24vTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5qcyc7XHJcbmltcG9ydCBuYXR1cmFsU2VsZWN0aW9uIGZyb20gJy4uL25hdHVyYWxTZWxlY3Rpb24uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MgZnJvbSAnLi4vTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTGFiTW9kZWwgZnJvbSAnLi9tb2RlbC9MYWJNb2RlbC5qcyc7XHJcbmltcG9ydCBMYWJTY3JlZW5WaWV3IGZyb20gJy4vdmlldy9MYWJTY3JlZW5WaWV3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYlNjcmVlbiBleHRlbmRzIFNjcmVlbjxMYWJNb2RlbCwgTGFiU2NyZWVuVmlldz4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcblxyXG4gICAgICAvLyBTY3JlZW4gb3B0aW9uc1xyXG4gICAgICBuYW1lOiBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5zY3JlZW4ubGFiU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBjcmVhdGVTY3JlZW5JY29uKCksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoIE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuU0NSRUVOX1ZJRVdfQkFDS0dST1VORCwge1xyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfSApLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IExhYk1vZGVsKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9kZWwnICkgKSxcclxuICAgICAgbW9kZWwgPT4gbmV3IExhYlNjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSBpY29uIGZvciB0aGlzIHNjcmVlbi5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVNjcmVlbkljb24oKTogU2NyZWVuSWNvbiB7XHJcblxyXG4gIGNvbnN0IFNQQUNJTkcgPSAyMDtcclxuXHJcbiAgcmV0dXJuIG5ldyBTY3JlZW5JY29uKCBuZXcgVkJveCgge1xyXG4gICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAvLyByb3cgMVxyXG4gICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IFNQQUNJTkcsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBJbWFnZSggYnVubnlCcm93bkZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nICksIG5ldyBJbWFnZSggYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nICksXHJcbiAgICAgICAgICBuZXcgSW1hZ2UoIGJ1bm55QnJvd25GdXJGbG9wcHlFYXJzU2hvcnRUZWV0aF9wbmcgKSwgbmV3IEltYWdlKCBidW5ueVdoaXRlRnVyRmxvcHB5RWFyc1Nob3J0VGVldGhfcG5nIClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIC8vIHJvdyAyXHJcbiAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IEltYWdlKCBidW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzTG9uZ1RlZXRoX3BuZyApLCBuZXcgSW1hZ2UoIGJ1bm55QnJvd25GdXJTdHJhaWdodEVhcnNMb25nVGVldGhfcG5nICksXHJcbiAgICAgICAgICBuZXcgSW1hZ2UoIGJ1bm55V2hpdGVGdXJGbG9wcHlFYXJzTG9uZ1RlZXRoX3BuZyApLCBuZXcgSW1hZ2UoIGJ1bm55QnJvd25GdXJGbG9wcHlFYXJzTG9uZ1RlZXRoX3BuZyApXHJcbiAgICAgICAgXVxyXG4gICAgICB9IClcclxuICAgIF1cclxuICB9ICksIHtcclxuICAgIGZpbGw6IE5hdHVyYWxTZWxlY3Rpb25Db2xvcnMuU0NSRUVOX1ZJRVdfQkFDS0dST1VORFxyXG4gIH0gKTtcclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ0xhYlNjcmVlbicsIExhYlNjcmVlbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw2QkFBNkI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxTQUFTQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxRQUFRLGdDQUFnQztBQUNsRSxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLG9DQUFvQyxNQUFNLHNEQUFzRDtBQUN2RyxPQUFPQyxxQ0FBcUMsTUFBTSx1REFBdUQ7QUFDekcsT0FBT0Msc0NBQXNDLE1BQU0sd0RBQXdEO0FBQzNHLE9BQU9DLHVDQUF1QyxNQUFNLHlEQUF5RDtBQUM3RyxPQUFPQyxvQ0FBb0MsTUFBTSxzREFBc0Q7QUFDdkcsT0FBT0MscUNBQXFDLE1BQU0sdURBQXVEO0FBQ3pHLE9BQU9DLHNDQUFzQyxNQUFNLHdEQUF3RDtBQUMzRyxPQUFPQyx1Q0FBdUMsTUFBTSx5REFBeUQ7QUFDN0csT0FBT0Msc0JBQXNCLE1BQU0scUNBQXFDO0FBQ3hFLE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsUUFBUSxNQUFNLHFCQUFxQjtBQUMxQyxPQUFPQyxhQUFhLE1BQU0seUJBQXlCO0FBRW5ELGVBQWUsTUFBTUMsU0FBUyxTQUFTbkIsTUFBTSxDQUEwQjtFQUU5RG9CLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQyxNQUFNQyxPQUFPLEdBQUc7TUFFZDtNQUNBQyxJQUFJLEVBQUVQLHVCQUF1QixDQUFDUSxNQUFNLENBQUNDLGlCQUFpQjtNQUN0REMsY0FBYyxFQUFFQyxnQkFBZ0IsQ0FBQyxDQUFDO01BQ2xDQyx1QkFBdUIsRUFBRSxJQUFJN0IsUUFBUSxDQUFFZSxzQkFBc0IsQ0FBQ2Usc0JBQXNCLEVBQUU7UUFDcEZSLE1BQU0sRUFBRWhCLE1BQU0sQ0FBQ3lCO01BQ2pCLENBQUUsQ0FBQztNQUVIO01BQ0FULE1BQU0sRUFBRUE7SUFDVixDQUFDO0lBRUQsS0FBSyxDQUNILE1BQU0sSUFBSUosUUFBUSxDQUFFSSxNQUFNLENBQUNVLFlBQVksQ0FBRSxPQUFRLENBQUUsQ0FBQyxFQUNwREMsS0FBSyxJQUFJLElBQUlkLGFBQWEsQ0FBRWMsS0FBSyxFQUFFWCxNQUFNLENBQUNVLFlBQVksQ0FBRSxNQUFPLENBQUUsQ0FBQyxFQUNsRVQsT0FDRixDQUFDO0VBQ0g7RUFFZ0JXLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTTixnQkFBZ0JBLENBQUEsRUFBZTtFQUV0QyxNQUFNUSxPQUFPLEdBQUcsRUFBRTtFQUVsQixPQUFPLElBQUlsQyxVQUFVLENBQUUsSUFBSUcsSUFBSSxDQUFFO0lBQy9CZ0MsT0FBTyxFQUFFRCxPQUFPO0lBQ2hCRSxRQUFRLEVBQUU7SUFFUjtJQUNBLElBQUluQyxJQUFJLENBQUU7TUFDUmtDLE9BQU8sRUFBRUQsT0FBTztNQUNoQkUsUUFBUSxFQUFFLENBQ1IsSUFBSWxDLEtBQUssQ0FBRU0sdUNBQXdDLENBQUMsRUFBRSxJQUFJTixLQUFLLENBQUVVLHVDQUF3QyxDQUFDLEVBQzFHLElBQUlWLEtBQUssQ0FBRUkscUNBQXNDLENBQUMsRUFBRSxJQUFJSixLQUFLLENBQUVRLHFDQUFzQyxDQUFDO0lBRTFHLENBQUUsQ0FBQztJQUVIO0lBQ0EsSUFBSVQsSUFBSSxDQUFFO01BQ1JrQyxPQUFPLEVBQUVELE9BQU87TUFDaEJFLFFBQVEsRUFBRSxDQUNSLElBQUlsQyxLQUFLLENBQUVTLHNDQUF1QyxDQUFDLEVBQUUsSUFBSVQsS0FBSyxDQUFFSyxzQ0FBdUMsQ0FBQyxFQUN4RyxJQUFJTCxLQUFLLENBQUVPLG9DQUFxQyxDQUFDLEVBQUUsSUFBSVAsS0FBSyxDQUFFRyxvQ0FBcUMsQ0FBQztJQUV4RyxDQUFFLENBQUM7RUFFUCxDQUFFLENBQUMsRUFBRTtJQUNIZ0MsSUFBSSxFQUFFeEIsc0JBQXNCLENBQUNlO0VBQy9CLENBQUUsQ0FBQztBQUNMO0FBRUFkLGdCQUFnQixDQUFDd0IsUUFBUSxDQUFFLFdBQVcsRUFBRXBCLFNBQVUsQ0FBQyJ9