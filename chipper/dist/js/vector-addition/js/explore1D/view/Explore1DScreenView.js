// Copyright 2019-2023, University of Colorado Boulder

/**
 * Explore1DScreenView is the view for the 'Explore 1D' screen.
 *
 * @author Martin Veillette
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import GraphOrientations from '../../common/model/GraphOrientations.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import SceneNode from '../../common/view/SceneNode.js';
import VectorAdditionScreenView from '../../common/view/VectorAdditionScreenView.js';
import vectorAddition from '../../vectorAddition.js';
import Explore1DModel from '../model/Explore1DModel.js';
import Explore1DGraphControlPanel from './Explore1DGraphControlPanel.js';
import Explore1DVectorCreatorPanel from './Explore1DVectorCreatorPanel.js';
import Explore1DViewProperties from './Explore1DViewProperties.js';
import GraphOrientationRadioButtonGroup from './GraphOrientationRadioButtonGroup.js';
export default class Explore1DScreenView extends VectorAdditionScreenView {
  /**
   * @param {Explore1DModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    assert && assert(model instanceof Explore1DModel, `invalid model: ${model}`);
    assert && assert(tandem instanceof Tandem, `invalid tandem: ${tandem}`);
    super(model, tandem);

    // @private view-specific Properties
    this.viewProperties = new Explore1DViewProperties();
    const graphViewBounds = model.verticalGraph.graphViewBounds;

    // Controls for the graph, at upper right
    const graphControlPanel = new Explore1DGraphControlPanel(model.horizontalGraph.vectorSet, model.verticalGraph.vectorSet, this.viewProperties, {
      right: VectorAdditionConstants.SCREEN_VIEW_BOUNDS.right - VectorAdditionConstants.SCREEN_VIEW_X_MARGIN,
      top: graphViewBounds.top
    });
    this.addChild(graphControlPanel);

    // Graph Orientation radio buttons, at lower right
    const graphOrientationRadioButtonGroup = new GraphOrientationRadioButtonGroup(this.viewProperties.graphOrientationProperty, {
      left: graphControlPanel.left,
      bottom: this.resetAllButton.bottom
    });
    //this.addChild( graphOrientationRadioButtonGroup );

    // Create and add the Scene Nodes and Vector Creator Panels for each graph
    [/*model.verticalGraph,*/model.horizontalGraph].forEach(graph => {
      // Create the scene node
      const sceneNode = new SceneNode(graph, this.viewProperties, model.componentStyleProperty, {
        vectorValuesAccordionBoxOptions: {
          isExpandedInitially: false
        }
      });

      // Vector symbols depend on graph orientation
      const vectorSymbols = graph.orientation === GraphOrientations.HORIZONTAL ? VectorAdditionConstants.VECTOR_SYMBOLS_GROUP_1 : VectorAdditionConstants.VECTOR_SYMBOLS_GROUP_2;

      // Add the vector creator panel
      /*sceneNode.addVectorCreatorPanel( new Explore1DVectorCreatorPanel( graph, sceneNode, vectorSymbols, {
        left: graphOrientationRadioButtonGroup.left,
        bottom: graphOrientationRadioButtonGroup.top - VectorAdditionConstants.RADIO_BUTTONS_Y_SPACING
      } ) );*/

      // Switch between scenes to match graph orientation.
      // unlink is unnecessary, exists for the lifetime of the sim.
      this.viewProperties.graphOrientationProperty.link(graphOrientation => {
        this.interruptSubtreeInput(); // cancel interactions when switching scenes
        sceneNode.visible = graphOrientation === graph.orientation;
      });

      // Add the scene node
      this.addChild(sceneNode);
    });
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.viewProperties.reset();
  }
}
vectorAddition.register('Explore1DScreenView', Explore1DScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJHcmFwaE9yaWVudGF0aW9ucyIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiU2NlbmVOb2RlIiwiVmVjdG9yQWRkaXRpb25TY3JlZW5WaWV3IiwidmVjdG9yQWRkaXRpb24iLCJFeHBsb3JlMURNb2RlbCIsIkV4cGxvcmUxREdyYXBoQ29udHJvbFBhbmVsIiwiRXhwbG9yZTFEVmVjdG9yQ3JlYXRvclBhbmVsIiwiRXhwbG9yZTFEVmlld1Byb3BlcnRpZXMiLCJHcmFwaE9yaWVudGF0aW9uUmFkaW9CdXR0b25Hcm91cCIsIkV4cGxvcmUxRFNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwiYXNzZXJ0Iiwidmlld1Byb3BlcnRpZXMiLCJncmFwaFZpZXdCb3VuZHMiLCJ2ZXJ0aWNhbEdyYXBoIiwiZ3JhcGhDb250cm9sUGFuZWwiLCJob3Jpem9udGFsR3JhcGgiLCJ2ZWN0b3JTZXQiLCJyaWdodCIsIlNDUkVFTl9WSUVXX0JPVU5EUyIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwidG9wIiwiYWRkQ2hpbGQiLCJncmFwaE9yaWVudGF0aW9uUmFkaW9CdXR0b25Hcm91cCIsImdyYXBoT3JpZW50YXRpb25Qcm9wZXJ0eSIsImxlZnQiLCJib3R0b20iLCJyZXNldEFsbEJ1dHRvbiIsImZvckVhY2giLCJncmFwaCIsInNjZW5lTm9kZSIsImNvbXBvbmVudFN0eWxlUHJvcGVydHkiLCJ2ZWN0b3JWYWx1ZXNBY2NvcmRpb25Cb3hPcHRpb25zIiwiaXNFeHBhbmRlZEluaXRpYWxseSIsInZlY3RvclN5bWJvbHMiLCJvcmllbnRhdGlvbiIsIkhPUklaT05UQUwiLCJWRUNUT1JfU1lNQk9MU19HUk9VUF8xIiwiVkVDVE9SX1NZTUJPTFNfR1JPVVBfMiIsImxpbmsiLCJncmFwaE9yaWVudGF0aW9uIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwidmlzaWJsZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBsb3JlMURTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEV4cGxvcmUxRFNjcmVlblZpZXcgaXMgdGhlIHZpZXcgZm9yIHRoZSAnRXhwbG9yZSAxRCcgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR3JhcGhPcmllbnRhdGlvbnMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0dyYXBoT3JpZW50YXRpb25zLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9WZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTY2VuZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uU2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9WZWN0b3JBZGRpdGlvblNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgRXhwbG9yZTFETW9kZWwgZnJvbSAnLi4vbW9kZWwvRXhwbG9yZTFETW9kZWwuanMnO1xyXG5pbXBvcnQgRXhwbG9yZTFER3JhcGhDb250cm9sUGFuZWwgZnJvbSAnLi9FeHBsb3JlMURHcmFwaENvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBFeHBsb3JlMURWZWN0b3JDcmVhdG9yUGFuZWwgZnJvbSAnLi9FeHBsb3JlMURWZWN0b3JDcmVhdG9yUGFuZWwuanMnO1xyXG5pbXBvcnQgRXhwbG9yZTFEVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9FeHBsb3JlMURWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHcmFwaE9yaWVudGF0aW9uUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuL0dyYXBoT3JpZW50YXRpb25SYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGxvcmUxRFNjcmVlblZpZXcgZXh0ZW5kcyBWZWN0b3JBZGRpdGlvblNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0V4cGxvcmUxRE1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCBpbnN0YW5jZW9mIEV4cGxvcmUxRE1vZGVsLCBgaW52YWxpZCBtb2RlbDogJHttb2RlbH1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YW5kZW0gaW5zdGFuY2VvZiBUYW5kZW0sIGBpbnZhbGlkIHRhbmRlbTogJHt0YW5kZW19YCApO1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbCwgdGFuZGVtICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgdmlldy1zcGVjaWZpYyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnZpZXdQcm9wZXJ0aWVzID0gbmV3IEV4cGxvcmUxRFZpZXdQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgY29uc3QgZ3JhcGhWaWV3Qm91bmRzID0gbW9kZWwudmVydGljYWxHcmFwaC5ncmFwaFZpZXdCb3VuZHM7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgZm9yIHRoZSBncmFwaCwgYXQgdXBwZXIgcmlnaHRcclxuICAgIGNvbnN0IGdyYXBoQ29udHJvbFBhbmVsID0gbmV3IEV4cGxvcmUxREdyYXBoQ29udHJvbFBhbmVsKFxyXG4gICAgICBtb2RlbC5ob3Jpem9udGFsR3JhcGgudmVjdG9yU2V0LFxyXG4gICAgICBtb2RlbC52ZXJ0aWNhbEdyYXBoLnZlY3RvclNldCxcclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcywge1xyXG4gICAgICAgIHJpZ2h0OiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TQ1JFRU5fVklFV19CT1VORFMucmlnaHQgLSBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgICB0b3A6IGdyYXBoVmlld0JvdW5kcy50b3BcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ3JhcGhDb250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAvLyBHcmFwaCBPcmllbnRhdGlvbiByYWRpbyBidXR0b25zLCBhdCBsb3dlciByaWdodFxyXG4gICAgY29uc3QgZ3JhcGhPcmllbnRhdGlvblJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgR3JhcGhPcmllbnRhdGlvblJhZGlvQnV0dG9uR3JvdXAoXHJcbiAgICAgIHRoaXMudmlld1Byb3BlcnRpZXMuZ3JhcGhPcmllbnRhdGlvblByb3BlcnR5LCB7XHJcbiAgICAgICAgbGVmdDogZ3JhcGhDb250cm9sUGFuZWwubGVmdCxcclxuICAgICAgICBib3R0b206IHRoaXMucmVzZXRBbGxCdXR0b24uYm90dG9tXHJcbiAgICAgIH0gKTtcclxuICAgIC8vdGhpcy5hZGRDaGlsZCggZ3JhcGhPcmllbnRhdGlvblJhZGlvQnV0dG9uR3JvdXAgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgU2NlbmUgTm9kZXMgYW5kIFZlY3RvciBDcmVhdG9yIFBhbmVscyBmb3IgZWFjaCBncmFwaFxyXG4gICAgWyAvKm1vZGVsLnZlcnRpY2FsR3JhcGgsKi8gbW9kZWwuaG9yaXpvbnRhbEdyYXBoIF0uZm9yRWFjaCggZ3JhcGggPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBzY2VuZSBub2RlXHJcbiAgICAgIGNvbnN0IHNjZW5lTm9kZSA9IG5ldyBTY2VuZU5vZGUoIGdyYXBoLCB0aGlzLnZpZXdQcm9wZXJ0aWVzLCBtb2RlbC5jb21wb25lbnRTdHlsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgdmVjdG9yVmFsdWVzQWNjb3JkaW9uQm94T3B0aW9uczoge1xyXG4gICAgICAgICAgaXNFeHBhbmRlZEluaXRpYWxseTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFZlY3RvciBzeW1ib2xzIGRlcGVuZCBvbiBncmFwaCBvcmllbnRhdGlvblxyXG4gICAgICBjb25zdCB2ZWN0b3JTeW1ib2xzID0gKCBncmFwaC5vcmllbnRhdGlvbiA9PT0gR3JhcGhPcmllbnRhdGlvbnMuSE9SSVpPTlRBTCApID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9TWU1CT0xTX0dST1VQXzEgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX1NZTUJPTFNfR1JPVVBfMjtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgdmVjdG9yIGNyZWF0b3IgcGFuZWxcclxuICAgICAgLypzY2VuZU5vZGUuYWRkVmVjdG9yQ3JlYXRvclBhbmVsKCBuZXcgRXhwbG9yZTFEVmVjdG9yQ3JlYXRvclBhbmVsKCBncmFwaCwgc2NlbmVOb2RlLCB2ZWN0b3JTeW1ib2xzLCB7XHJcbiAgICAgICAgbGVmdDogZ3JhcGhPcmllbnRhdGlvblJhZGlvQnV0dG9uR3JvdXAubGVmdCxcclxuICAgICAgICBib3R0b206IGdyYXBoT3JpZW50YXRpb25SYWRpb0J1dHRvbkdyb3VwLnRvcCAtIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlJBRElPX0JVVFRPTlNfWV9TUEFDSU5HXHJcbiAgICAgIH0gKSApOyovXHJcblxyXG4gICAgICAvLyBTd2l0Y2ggYmV0d2VlbiBzY2VuZXMgdG8gbWF0Y2ggZ3JhcGggb3JpZW50YXRpb24uXHJcbiAgICAgIC8vIHVubGluayBpcyB1bm5lY2Vzc2FyeSwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbS5cclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcy5ncmFwaE9yaWVudGF0aW9uUHJvcGVydHkubGluayggZ3JhcGhPcmllbnRhdGlvbiA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTsgLy8gY2FuY2VsIGludGVyYWN0aW9ucyB3aGVuIHN3aXRjaGluZyBzY2VuZXNcclxuICAgICAgICBzY2VuZU5vZGUudmlzaWJsZSA9ICggZ3JhcGhPcmllbnRhdGlvbiA9PT0gZ3JhcGgub3JpZW50YXRpb24gKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBzY2VuZSBub2RlXHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHNjZW5lTm9kZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICAgIHRoaXMudmlld1Byb3BlcnRpZXMucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnZlY3RvckFkZGl0aW9uLnJlZ2lzdGVyKCAnRXhwbG9yZTFEU2NyZWVuVmlldycsIEV4cGxvcmUxRFNjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxpQkFBaUIsTUFBTSx5Q0FBeUM7QUFDdkUsT0FBT0MsdUJBQXVCLE1BQU0seUNBQXlDO0FBQzdFLE9BQU9DLFNBQVMsTUFBTSxnQ0FBZ0M7QUFDdEQsT0FBT0Msd0JBQXdCLE1BQU0sK0NBQStDO0FBQ3BGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLDRCQUE0QjtBQUN2RCxPQUFPQywwQkFBMEIsTUFBTSxpQ0FBaUM7QUFDeEUsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBQzFFLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUNsRSxPQUFPQyxnQ0FBZ0MsTUFBTSx1Q0FBdUM7QUFFcEYsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU1Asd0JBQXdCLENBQUM7RUFFeEU7QUFDRjtBQUNBO0FBQ0E7RUFDRVEsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFFM0JDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRixLQUFLLFlBQVlQLGNBQWMsRUFBRyxrQkFBaUJPLEtBQU0sRUFBRSxDQUFDO0lBQzlFRSxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsTUFBTSxZQUFZZCxNQUFNLEVBQUcsbUJBQWtCYyxNQUFPLEVBQUUsQ0FBQztJQUV6RSxLQUFLLENBQUVELEtBQUssRUFBRUMsTUFBTyxDQUFDOztJQUV0QjtJQUNBLElBQUksQ0FBQ0UsY0FBYyxHQUFHLElBQUlQLHVCQUF1QixDQUFDLENBQUM7SUFFbkQsTUFBTVEsZUFBZSxHQUFHSixLQUFLLENBQUNLLGFBQWEsQ0FBQ0QsZUFBZTs7SUFFM0Q7SUFDQSxNQUFNRSxpQkFBaUIsR0FBRyxJQUFJWiwwQkFBMEIsQ0FDdERNLEtBQUssQ0FBQ08sZUFBZSxDQUFDQyxTQUFTLEVBQy9CUixLQUFLLENBQUNLLGFBQWEsQ0FBQ0csU0FBUyxFQUM3QixJQUFJLENBQUNMLGNBQWMsRUFBRTtNQUNuQk0sS0FBSyxFQUFFcEIsdUJBQXVCLENBQUNxQixrQkFBa0IsQ0FBQ0QsS0FBSyxHQUFHcEIsdUJBQXVCLENBQUNzQixvQkFBb0I7TUFDdEdDLEdBQUcsRUFBRVIsZUFBZSxDQUFDUTtJQUN2QixDQUFFLENBQUM7SUFDTCxJQUFJLENBQUNDLFFBQVEsQ0FBRVAsaUJBQWtCLENBQUM7O0lBRWxDO0lBQ0EsTUFBTVEsZ0NBQWdDLEdBQUcsSUFBSWpCLGdDQUFnQyxDQUMzRSxJQUFJLENBQUNNLGNBQWMsQ0FBQ1ksd0JBQXdCLEVBQUU7TUFDNUNDLElBQUksRUFBRVYsaUJBQWlCLENBQUNVLElBQUk7TUFDNUJDLE1BQU0sRUFBRSxJQUFJLENBQUNDLGNBQWMsQ0FBQ0Q7SUFDOUIsQ0FBRSxDQUFDO0lBQ0w7O0lBRUE7SUFDQSxDQUFFLHdCQUF5QmpCLEtBQUssQ0FBQ08sZUFBZSxDQUFFLENBQUNZLE9BQU8sQ0FBRUMsS0FBSyxJQUFJO01BRW5FO01BQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUkvQixTQUFTLENBQUU4QixLQUFLLEVBQUUsSUFBSSxDQUFDakIsY0FBYyxFQUFFSCxLQUFLLENBQUNzQixzQkFBc0IsRUFBRTtRQUN6RkMsK0JBQStCLEVBQUU7VUFDL0JDLG1CQUFtQixFQUFFO1FBQ3ZCO01BQ0YsQ0FBRSxDQUFDOztNQUVIO01BQ0EsTUFBTUMsYUFBYSxHQUFLTCxLQUFLLENBQUNNLFdBQVcsS0FBS3RDLGlCQUFpQixDQUFDdUMsVUFBVSxHQUNwRHRDLHVCQUF1QixDQUFDdUMsc0JBQXNCLEdBQzlDdkMsdUJBQXVCLENBQUN3QyxzQkFBc0I7O01BRXBFO01BQ0E7QUFDTjtBQUNBO0FBQ0E7O01BRU07TUFDQTtNQUNBLElBQUksQ0FBQzFCLGNBQWMsQ0FBQ1ksd0JBQXdCLENBQUNlLElBQUksQ0FBRUMsZ0JBQWdCLElBQUk7UUFDckUsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QlgsU0FBUyxDQUFDWSxPQUFPLEdBQUtGLGdCQUFnQixLQUFLWCxLQUFLLENBQUNNLFdBQWE7TUFDaEUsQ0FBRSxDQUFDOztNQUVIO01BQ0EsSUFBSSxDQUFDYixRQUFRLENBQUVRLFNBQVUsQ0FBQztJQUM1QixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFYSxLQUFLQSxDQUFBLEVBQUc7SUFDTixLQUFLLENBQUNBLEtBQUssQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDL0IsY0FBYyxDQUFDK0IsS0FBSyxDQUFDLENBQUM7RUFDN0I7QUFDRjtBQUVBMUMsY0FBYyxDQUFDMkMsUUFBUSxDQUFFLHFCQUFxQixFQUFFckMsbUJBQW9CLENBQUMifQ==