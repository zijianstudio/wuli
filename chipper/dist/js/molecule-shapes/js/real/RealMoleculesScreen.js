// Copyright 2014-2022, University of Colorado Boulder

/**
 * The second (real molecules) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import MoleculeShapesStrings from '../MoleculeShapesStrings.js';
import RealMoleculesModel from './RealMoleculesModel.js';
import RealMoleculesScreenView from './RealMoleculesScreenView.js';
class RealMoleculesScreen extends Screen {
  /**
   * Creates the model and view for the RealMoleculesScreen
   *
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   * @param {Tandem} tandem
   */
  constructor(isBasicsVersion, tandem) {
    const options = {
      name: MoleculeShapesStrings.screen.realMoleculesStringProperty,
      backgroundColorProperty: MoleculeShapesColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon(new ScreenIconNode(false, isBasicsVersion), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new RealMoleculesModel(isBasicsVersion, tandem.createTandem('model')), model => new RealMoleculesScreenView(model, tandem.createTandem('view')), options);
  }
}
moleculeShapes.register('RealMoleculesScreen', RealMoleculesScreen);
export default RealMoleculesScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiTW9sZWN1bGVTaGFwZXNDb2xvcnMiLCJTY3JlZW5JY29uTm9kZSIsIm1vbGVjdWxlU2hhcGVzIiwiTW9sZWN1bGVTaGFwZXNTdHJpbmdzIiwiUmVhbE1vbGVjdWxlc01vZGVsIiwiUmVhbE1vbGVjdWxlc1NjcmVlblZpZXciLCJSZWFsTW9sZWN1bGVzU2NyZWVuIiwiY29uc3RydWN0b3IiLCJpc0Jhc2ljc1ZlcnNpb24iLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsInJlYWxNb2xlY3VsZXNTdHJpbmdQcm9wZXJ0eSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiYmFja2dyb3VuZFByb3BlcnR5IiwiaG9tZVNjcmVlbkljb24iLCJtYXhJY29uV2lkdGhQcm9wb3J0aW9uIiwibWF4SWNvbkhlaWdodFByb3BvcnRpb24iLCJjcmVhdGVUYW5kZW0iLCJtb2RlbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVhbE1vbGVjdWxlc1NjcmVlbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgc2Vjb25kIChyZWFsIG1vbGVjdWxlcykgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuSWNvbiBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5JY29uLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzQ29sb3JzIGZyb20gJy4uL2NvbW1vbi92aWV3L01vbGVjdWxlU2hhcGVzQ29sb3JzLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb25Ob2RlIGZyb20gJy4uL2NvbW1vbi92aWV3L1NjcmVlbkljb25Ob2RlLmpzJztcclxuaW1wb3J0IG1vbGVjdWxlU2hhcGVzIGZyb20gJy4uL21vbGVjdWxlU2hhcGVzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlU2hhcGVzU3RyaW5ncyBmcm9tICcuLi9Nb2xlY3VsZVNoYXBlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgUmVhbE1vbGVjdWxlc01vZGVsIGZyb20gJy4vUmVhbE1vbGVjdWxlc01vZGVsLmpzJztcclxuaW1wb3J0IFJlYWxNb2xlY3VsZXNTY3JlZW5WaWV3IGZyb20gJy4vUmVhbE1vbGVjdWxlc1NjcmVlblZpZXcuanMnO1xyXG5cclxuY2xhc3MgUmVhbE1vbGVjdWxlc1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIG1vZGVsIGFuZCB2aWV3IGZvciB0aGUgUmVhbE1vbGVjdWxlc1NjcmVlblxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0Jhc2ljc1ZlcnNpb24gLSBXaGV0aGVyIHRoaXMgaXMgdGhlIEJhc2ljcyBzaW0gb3Igbm90XHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpc0Jhc2ljc1ZlcnNpb24sIHRhbmRlbSApIHtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcbiAgICAgIG5hbWU6IE1vbGVjdWxlU2hhcGVzU3RyaW5ncy5zY3JlZW4ucmVhbE1vbGVjdWxlc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogTW9sZWN1bGVTaGFwZXNDb2xvcnMuYmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBob21lU2NyZWVuSWNvbjogbmV3IFNjcmVlbkljb24oIG5ldyBTY3JlZW5JY29uTm9kZSggZmFsc2UsIGlzQmFzaWNzVmVyc2lvbiApLCB7XHJcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcclxuICAgICAgICBtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbjogMVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICAoKSA9PiBuZXcgUmVhbE1vbGVjdWxlc01vZGVsKCBpc0Jhc2ljc1ZlcnNpb24sIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb2RlbCcgKSApLFxyXG4gICAgICBtb2RlbCA9PiBuZXcgUmVhbE1vbGVjdWxlc1NjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdSZWFsTW9sZWN1bGVzU2NyZWVuJywgUmVhbE1vbGVjdWxlc1NjcmVlbiApO1xyXG5leHBvcnQgZGVmYXVsdCBSZWFsTW9sZWN1bGVzU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0Msb0JBQW9CLE1BQU0sd0NBQXdDO0FBQ3pFLE9BQU9DLGNBQWMsTUFBTSxrQ0FBa0M7QUFDN0QsT0FBT0MsY0FBYyxNQUFNLHNCQUFzQjtBQUNqRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUVsRSxNQUFNQyxtQkFBbUIsU0FBU1IsTUFBTSxDQUFDO0VBRXZDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLE1BQU0sRUFBRztJQUNyQyxNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFUixxQkFBcUIsQ0FBQ1MsTUFBTSxDQUFDQywyQkFBMkI7TUFDOURDLHVCQUF1QixFQUFFZCxvQkFBb0IsQ0FBQ2Usa0JBQWtCO01BQ2hFQyxjQUFjLEVBQUUsSUFBSWpCLFVBQVUsQ0FBRSxJQUFJRSxjQUFjLENBQUUsS0FBSyxFQUFFTyxlQUFnQixDQUFDLEVBQUU7UUFDNUVTLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIVCxNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlMLGtCQUFrQixDQUFFSSxlQUFlLEVBQUVDLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQy9FQyxLQUFLLElBQUksSUFBSWYsdUJBQXVCLENBQUVlLEtBQUssRUFBRVgsTUFBTSxDQUFDVSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDNUVULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVIsY0FBYyxDQUFDbUIsUUFBUSxDQUFFLHFCQUFxQixFQUFFZixtQkFBb0IsQ0FBQztBQUNyRSxlQUFlQSxtQkFBbUIifQ==