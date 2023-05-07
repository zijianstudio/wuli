// Copyright 2014-2022, University of Colorado Boulder

/**
 * The first (model) screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import MoleculeShapesColors from '../common/view/MoleculeShapesColors.js';
import ScreenIconNode from '../common/view/ScreenIconNode.js';
import moleculeShapes from '../moleculeShapes.js';
import MoleculeShapesStrings from '../MoleculeShapesStrings.js';
import ModelMoleculesModel from './ModelMoleculesModel.js';
import ModelMoleculesScreenView from './ModelMoleculesScreenView.js';
class ModelMoleculesScreen extends Screen {
  /**
   * Creates the model and view for the ModelMoleculesScreen
   *
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   * @param {Tandem} tandem
   */
  constructor(isBasicsVersion, tandem) {
    const options = {
      name: MoleculeShapesStrings.screen.modelStringProperty,
      backgroundColorProperty: MoleculeShapesColors.backgroundProperty,
      homeScreenIcon: new ScreenIcon(new ScreenIconNode(true, isBasicsVersion), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      }),
      tandem: tandem
    };
    super(() => new ModelMoleculesModel(isBasicsVersion, tandem.createTandem('model')), model => new ModelMoleculesScreenView(model, tandem.createTandem('view')), options);
  }
}
moleculeShapes.register('ModelMoleculesScreen', ModelMoleculesScreen);
export default ModelMoleculesScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW4iLCJTY3JlZW5JY29uIiwiTW9sZWN1bGVTaGFwZXNDb2xvcnMiLCJTY3JlZW5JY29uTm9kZSIsIm1vbGVjdWxlU2hhcGVzIiwiTW9sZWN1bGVTaGFwZXNTdHJpbmdzIiwiTW9kZWxNb2xlY3VsZXNNb2RlbCIsIk1vZGVsTW9sZWN1bGVzU2NyZWVuVmlldyIsIk1vZGVsTW9sZWN1bGVzU2NyZWVuIiwiY29uc3RydWN0b3IiLCJpc0Jhc2ljc1ZlcnNpb24iLCJ0YW5kZW0iLCJvcHRpb25zIiwibmFtZSIsInNjcmVlbiIsIm1vZGVsU3RyaW5nUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImJhY2tncm91bmRQcm9wZXJ0eSIsImhvbWVTY3JlZW5JY29uIiwibWF4SWNvbldpZHRoUHJvcG9ydGlvbiIsIm1heEljb25IZWlnaHRQcm9wb3J0aW9uIiwiY3JlYXRlVGFuZGVtIiwibW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vZGVsTW9sZWN1bGVzU2NyZWVuLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBmaXJzdCAobW9kZWwpIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuSWNvbi5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc0NvbG9ycyBmcm9tICcuLi9jb21tb24vdmlldy9Nb2xlY3VsZVNoYXBlc0NvbG9ycy5qcyc7XHJcbmltcG9ydCBTY3JlZW5JY29uTm9kZSBmcm9tICcuLi9jb21tb24vdmlldy9TY3JlZW5JY29uTm9kZS5qcyc7XHJcbmltcG9ydCBtb2xlY3VsZVNoYXBlcyBmcm9tICcuLi9tb2xlY3VsZVNoYXBlcy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZVNoYXBlc1N0cmluZ3MgZnJvbSAnLi4vTW9sZWN1bGVTaGFwZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1vZGVsTW9sZWN1bGVzTW9kZWwgZnJvbSAnLi9Nb2RlbE1vbGVjdWxlc01vZGVsLmpzJztcclxuaW1wb3J0IE1vZGVsTW9sZWN1bGVzU2NyZWVuVmlldyBmcm9tICcuL01vZGVsTW9sZWN1bGVzU2NyZWVuVmlldy5qcyc7XHJcblxyXG5jbGFzcyBNb2RlbE1vbGVjdWxlc1NjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIG1vZGVsIGFuZCB2aWV3IGZvciB0aGUgTW9kZWxNb2xlY3VsZXNTY3JlZW5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNCYXNpY3NWZXJzaW9uIC0gV2hldGhlciB0aGlzIGlzIHRoZSBCYXNpY3Mgc2ltIG9yIG5vdFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaXNCYXNpY3NWZXJzaW9uLCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0ge1xyXG4gICAgICBuYW1lOiBNb2xlY3VsZVNoYXBlc1N0cmluZ3Muc2NyZWVuLm1vZGVsU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBNb2xlY3VsZVNoYXBlc0NvbG9ycy5iYWNrZ3JvdW5kUHJvcGVydHksXHJcbiAgICAgIGhvbWVTY3JlZW5JY29uOiBuZXcgU2NyZWVuSWNvbiggbmV3IFNjcmVlbkljb25Ob2RlKCB0cnVlLCBpc0Jhc2ljc1ZlcnNpb24gKSwge1xyXG4gICAgICAgIG1heEljb25XaWR0aFByb3BvcnRpb246IDEsXHJcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgKCkgPT4gbmV3IE1vZGVsTW9sZWN1bGVzTW9kZWwoIGlzQmFzaWNzVmVyc2lvbiwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vZGVsJyApICksXHJcbiAgICAgIG1vZGVsID0+IG5ldyBNb2RlbE1vbGVjdWxlc1NjcmVlblZpZXcoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlldycgKSApLFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdNb2RlbE1vbGVjdWxlc1NjcmVlbicsIE1vZGVsTW9sZWN1bGVzU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsTW9sZWN1bGVzU2NyZWVuOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sNkJBQTZCO0FBQ2hELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFDeEQsT0FBT0Msb0JBQW9CLE1BQU0sd0NBQXdDO0FBQ3pFLE9BQU9DLGNBQWMsTUFBTSxrQ0FBa0M7QUFDN0QsT0FBT0MsY0FBYyxNQUFNLHNCQUFzQjtBQUNqRCxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFDL0QsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLHdCQUF3QixNQUFNLCtCQUErQjtBQUVwRSxNQUFNQyxvQkFBb0IsU0FBU1IsTUFBTSxDQUFDO0VBRXhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLE1BQU0sRUFBRztJQUNyQyxNQUFNQyxPQUFPLEdBQUc7TUFDZEMsSUFBSSxFQUFFUixxQkFBcUIsQ0FBQ1MsTUFBTSxDQUFDQyxtQkFBbUI7TUFDdERDLHVCQUF1QixFQUFFZCxvQkFBb0IsQ0FBQ2Usa0JBQWtCO01BQ2hFQyxjQUFjLEVBQUUsSUFBSWpCLFVBQVUsQ0FBRSxJQUFJRSxjQUFjLENBQUUsSUFBSSxFQUFFTyxlQUFnQixDQUFDLEVBQUU7UUFDM0VTLHNCQUFzQixFQUFFLENBQUM7UUFDekJDLHVCQUF1QixFQUFFO01BQzNCLENBQUUsQ0FBQztNQUNIVCxNQUFNLEVBQUVBO0lBQ1YsQ0FBQztJQUVELEtBQUssQ0FDSCxNQUFNLElBQUlMLG1CQUFtQixDQUFFSSxlQUFlLEVBQUVDLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFLE9BQVEsQ0FBRSxDQUFDLEVBQ2hGQyxLQUFLLElBQUksSUFBSWYsd0JBQXdCLENBQUVlLEtBQUssRUFBRVgsTUFBTSxDQUFDVSxZQUFZLENBQUUsTUFBTyxDQUFFLENBQUMsRUFDN0VULE9BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVIsY0FBYyxDQUFDbUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFZixvQkFBcUIsQ0FBQztBQUN2RSxlQUFlQSxvQkFBb0IifQ==