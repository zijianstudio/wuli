// Copyright 2019-2023, University of Colorado Boulder

/**
 * LabScreenView is the view for the 'Lab' screen.
 *
 * @author Martin Veillette
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import CoordinateSnapRadioButtonGroup from '../../common/view/CoordinateSnapRadioButtonGroup.js';
import SceneNode from '../../common/view/SceneNode.js';
import VectorAdditionScreenView from '../../common/view/VectorAdditionScreenView.js';
import VectorAdditionViewProperties from '../../common/view/VectorAdditionViewProperties.js';
import vectorAddition from '../../vectorAddition.js';
import LabModel from '../model/LabModel.js';
import LabGraphControlPanel from './LabGraphControlPanel.js';
import LabVectorCreatorPanel from './LabVectorCreatorPanel.js';
export default class LabScreenView extends VectorAdditionScreenView {
  /**
   * @param {LabModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    assert && assert(model instanceof LabModel, `invalid model: ${model}`);
    assert && assert(tandem instanceof Tandem, `invalid tandem: ${tandem}`);
    super(model, tandem);

    // @private view-specific Properties
    this.viewProperties = new VectorAdditionViewProperties();

    // Controls for the graph, at upper right
    const graphControlPanel = new LabGraphControlPanel(model.cartesianGraph, model.polarGraph, model.componentStyleProperty, model.sumVisibleProperty1, model.sumVisibleProperty2, this.viewProperties, {
      right: VectorAdditionConstants.SCREEN_VIEW_BOUNDS.right - VectorAdditionConstants.SCREEN_VIEW_X_MARGIN,
      top: VectorAdditionConstants.SCREEN_VIEW_BOUNDS.top + VectorAdditionConstants.SCREEN_VIEW_Y_MARGIN
    });
    this.addChild(graphControlPanel);

    // Coordinate Snap radio buttons, at lower right
    const coordinateSnapRadioButtonGroup = new CoordinateSnapRadioButtonGroup(this.viewProperties.coordinateSnapModeProperty, model.cartesianVectorColorPalette1, model.polarVectorColorPalette1, {
      left: graphControlPanel.left,
      bottom: this.resetAllButton.bottom
    });
    this.addChild(coordinateSnapRadioButtonGroup);

    // Create and add the Scene Nodes and Vector Creator Panels for each graph
    [model.polarGraph, model.cartesianGraph].forEach(graph => {
      const sceneNode = new SceneNode(graph, this.viewProperties, model.componentStyleProperty);

      // Add the vector creator panel
      sceneNode.addVectorCreatorPanel(new LabVectorCreatorPanel(graph, sceneNode, {
        left: coordinateSnapRadioButtonGroup.left,
        bottom: coordinateSnapRadioButtonGroup.top - VectorAdditionConstants.RADIO_BUTTONS_Y_SPACING
      }));

      // Switch between scenes to match coordinate snap mode.
      // unlink is unnecessary, exists for the lifetime of the sim.
      this.viewProperties.coordinateSnapModeProperty.link(coordinateSnapMode => {
        this.interruptSubtreeInput(); // cancel interactions when switching scenes
        sceneNode.visible = coordinateSnapMode === graph.coordinateSnapMode;
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
vectorAddition.register('LabScreenView', LabScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJWZWN0b3JBZGRpdGlvbkNvbnN0YW50cyIsIkNvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cCIsIlNjZW5lTm9kZSIsIlZlY3RvckFkZGl0aW9uU2NyZWVuVmlldyIsIlZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMiLCJ2ZWN0b3JBZGRpdGlvbiIsIkxhYk1vZGVsIiwiTGFiR3JhcGhDb250cm9sUGFuZWwiLCJMYWJWZWN0b3JDcmVhdG9yUGFuZWwiLCJMYWJTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImFzc2VydCIsInZpZXdQcm9wZXJ0aWVzIiwiZ3JhcGhDb250cm9sUGFuZWwiLCJjYXJ0ZXNpYW5HcmFwaCIsInBvbGFyR3JhcGgiLCJjb21wb25lbnRTdHlsZVByb3BlcnR5Iiwic3VtVmlzaWJsZVByb3BlcnR5MSIsInN1bVZpc2libGVQcm9wZXJ0eTIiLCJyaWdodCIsIlNDUkVFTl9WSUVXX0JPVU5EUyIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwidG9wIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJhZGRDaGlsZCIsImNvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cCIsImNvb3JkaW5hdGVTbmFwTW9kZVByb3BlcnR5IiwiY2FydGVzaWFuVmVjdG9yQ29sb3JQYWxldHRlMSIsInBvbGFyVmVjdG9yQ29sb3JQYWxldHRlMSIsImxlZnQiLCJib3R0b20iLCJyZXNldEFsbEJ1dHRvbiIsImZvckVhY2giLCJncmFwaCIsInNjZW5lTm9kZSIsImFkZFZlY3RvckNyZWF0b3JQYW5lbCIsIlJBRElPX0JVVFRPTlNfWV9TUEFDSU5HIiwibGluayIsImNvb3JkaW5hdGVTbmFwTW9kZSIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInZpc2libGUiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMYWJTY3JlZW5WaWV3IGlzIHRoZSB2aWV3IGZvciB0aGUgJ0xhYicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICovXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Db29yZGluYXRlU25hcFJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgU2NlbmVOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvblNjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVmVjdG9yQWRkaXRpb25TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBMYWJNb2RlbCBmcm9tICcuLi9tb2RlbC9MYWJNb2RlbC5qcyc7XHJcbmltcG9ydCBMYWJHcmFwaENvbnRyb2xQYW5lbCBmcm9tICcuL0xhYkdyYXBoQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IExhYlZlY3RvckNyZWF0b3JQYW5lbCBmcm9tICcuL0xhYlZlY3RvckNyZWF0b3JQYW5lbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYWJTY3JlZW5WaWV3IGV4dGVuZHMgVmVjdG9yQWRkaXRpb25TY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtMYWJNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWwgaW5zdGFuY2VvZiBMYWJNb2RlbCwgYGludmFsaWQgbW9kZWw6ICR7bW9kZWx9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFuZGVtIGluc3RhbmNlb2YgVGFuZGVtLCBgaW52YWxpZCB0YW5kZW06ICR7dGFuZGVtfWAgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHZpZXctc3BlY2lmaWMgUHJvcGVydGllc1xyXG4gICAgdGhpcy52aWV3UHJvcGVydGllcyA9IG5ldyBWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgZm9yIHRoZSBncmFwaCwgYXQgdXBwZXIgcmlnaHRcclxuICAgIGNvbnN0IGdyYXBoQ29udHJvbFBhbmVsID0gbmV3IExhYkdyYXBoQ29udHJvbFBhbmVsKFxyXG4gICAgICBtb2RlbC5jYXJ0ZXNpYW5HcmFwaCxcclxuICAgICAgbW9kZWwucG9sYXJHcmFwaCxcclxuICAgICAgbW9kZWwuY29tcG9uZW50U3R5bGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc3VtVmlzaWJsZVByb3BlcnR5MSxcclxuICAgICAgbW9kZWwuc3VtVmlzaWJsZVByb3BlcnR5MixcclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcywge1xyXG4gICAgICAgIHJpZ2h0OiBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TQ1JFRU5fVklFV19CT1VORFMucmlnaHQgLSBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgICB0b3A6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlNDUkVFTl9WSUVXX0JPVU5EUy50b3AgKyBWZWN0b3JBZGRpdGlvbkNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTlxyXG4gICAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBncmFwaENvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIENvb3JkaW5hdGUgU25hcCByYWRpbyBidXR0b25zLCBhdCBsb3dlciByaWdodFxyXG4gICAgY29uc3QgY29vcmRpbmF0ZVNuYXBSYWRpb0J1dHRvbkdyb3VwID0gbmV3IENvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cChcclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcy5jb29yZGluYXRlU25hcE1vZGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuY2FydGVzaWFuVmVjdG9yQ29sb3JQYWxldHRlMSxcclxuICAgICAgbW9kZWwucG9sYXJWZWN0b3JDb2xvclBhbGV0dGUxLCB7XHJcbiAgICAgICAgbGVmdDogZ3JhcGhDb250cm9sUGFuZWwubGVmdCxcclxuICAgICAgICBib3R0b206IHRoaXMucmVzZXRBbGxCdXR0b24uYm90dG9tXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cCApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBTY2VuZSBOb2RlcyBhbmQgVmVjdG9yIENyZWF0b3IgUGFuZWxzIGZvciBlYWNoIGdyYXBoXHJcbiAgICBbIG1vZGVsLnBvbGFyR3JhcGgsIG1vZGVsLmNhcnRlc2lhbkdyYXBoIF0uZm9yRWFjaCggZ3JhcGggPT4ge1xyXG5cclxuICAgICAgY29uc3Qgc2NlbmVOb2RlID0gbmV3IFNjZW5lTm9kZSggZ3JhcGgsIHRoaXMudmlld1Byb3BlcnRpZXMsIG1vZGVsLmNvbXBvbmVudFN0eWxlUHJvcGVydHkgKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgdmVjdG9yIGNyZWF0b3IgcGFuZWxcclxuICAgICAgc2NlbmVOb2RlLmFkZFZlY3RvckNyZWF0b3JQYW5lbCggbmV3IExhYlZlY3RvckNyZWF0b3JQYW5lbCggZ3JhcGgsIHNjZW5lTm9kZSwge1xyXG4gICAgICAgIGxlZnQ6IGNvb3JkaW5hdGVTbmFwUmFkaW9CdXR0b25Hcm91cC5sZWZ0LFxyXG4gICAgICAgIGJvdHRvbTogY29vcmRpbmF0ZVNuYXBSYWRpb0J1dHRvbkdyb3VwLnRvcCAtIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlJBRElPX0JVVFRPTlNfWV9TUEFDSU5HXHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgICAgLy8gU3dpdGNoIGJldHdlZW4gc2NlbmVzIHRvIG1hdGNoIGNvb3JkaW5hdGUgc25hcCBtb2RlLlxyXG4gICAgICAvLyB1bmxpbmsgaXMgdW5uZWNlc3NhcnksIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICAgIHRoaXMudmlld1Byb3BlcnRpZXMuY29vcmRpbmF0ZVNuYXBNb2RlUHJvcGVydHkubGluayggY29vcmRpbmF0ZVNuYXBNb2RlID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgaW50ZXJhY3Rpb25zIHdoZW4gc3dpdGNoaW5nIHNjZW5lc1xyXG4gICAgICAgIHNjZW5lTm9kZS52aXNpYmxlID0gKCBjb29yZGluYXRlU25hcE1vZGUgPT09IGdyYXBoLmNvb3JkaW5hdGVTbmFwTW9kZSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHNjZW5lIG5vZGVcclxuICAgICAgdGhpcy5hZGRDaGlsZCggc2NlbmVOb2RlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gICAgdGhpcy52aWV3UHJvcGVydGllcy5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxudmVjdG9yQWRkaXRpb24ucmVnaXN0ZXIoICdMYWJTY3JlZW5WaWV3JywgTGFiU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLHVCQUF1QixNQUFNLHlDQUF5QztBQUM3RSxPQUFPQyw4QkFBOEIsTUFBTSxxREFBcUQ7QUFDaEcsT0FBT0MsU0FBUyxNQUFNLGdDQUFnQztBQUN0RCxPQUFPQyx3QkFBd0IsTUFBTSwrQ0FBK0M7QUFDcEYsT0FBT0MsNEJBQTRCLE1BQU0sbURBQW1EO0FBQzVGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLHNCQUFzQjtBQUMzQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBRTlELGVBQWUsTUFBTUMsYUFBYSxTQUFTTix3QkFBd0IsQ0FBQztFQUVsRTtBQUNGO0FBQ0E7QUFDQTtFQUNFTyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUUzQkMsTUFBTSxJQUFJQSxNQUFNLENBQUVGLEtBQUssWUFBWUwsUUFBUSxFQUFHLGtCQUFpQkssS0FBTSxFQUFFLENBQUM7SUFDeEVFLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxNQUFNLFlBQVliLE1BQU0sRUFBRyxtQkFBa0JhLE1BQU8sRUFBRSxDQUFDO0lBRXpFLEtBQUssQ0FBRUQsS0FBSyxFQUFFQyxNQUFPLENBQUM7O0lBRXRCO0lBQ0EsSUFBSSxDQUFDRSxjQUFjLEdBQUcsSUFBSVYsNEJBQTRCLENBQUMsQ0FBQzs7SUFFeEQ7SUFDQSxNQUFNVyxpQkFBaUIsR0FBRyxJQUFJUixvQkFBb0IsQ0FDaERJLEtBQUssQ0FBQ0ssY0FBYyxFQUNwQkwsS0FBSyxDQUFDTSxVQUFVLEVBQ2hCTixLQUFLLENBQUNPLHNCQUFzQixFQUM1QlAsS0FBSyxDQUFDUSxtQkFBbUIsRUFDekJSLEtBQUssQ0FBQ1MsbUJBQW1CLEVBQ3pCLElBQUksQ0FBQ04sY0FBYyxFQUFFO01BQ25CTyxLQUFLLEVBQUVyQix1QkFBdUIsQ0FBQ3NCLGtCQUFrQixDQUFDRCxLQUFLLEdBQUdyQix1QkFBdUIsQ0FBQ3VCLG9CQUFvQjtNQUN0R0MsR0FBRyxFQUFFeEIsdUJBQXVCLENBQUNzQixrQkFBa0IsQ0FBQ0UsR0FBRyxHQUFHeEIsdUJBQXVCLENBQUN5QjtJQUNoRixDQUFFLENBQUM7SUFDTCxJQUFJLENBQUNDLFFBQVEsQ0FBRVgsaUJBQWtCLENBQUM7O0lBRWxDO0lBQ0EsTUFBTVksOEJBQThCLEdBQUcsSUFBSTFCLDhCQUE4QixDQUN2RSxJQUFJLENBQUNhLGNBQWMsQ0FBQ2MsMEJBQTBCLEVBQzlDakIsS0FBSyxDQUFDa0IsNEJBQTRCLEVBQ2xDbEIsS0FBSyxDQUFDbUIsd0JBQXdCLEVBQUU7TUFDOUJDLElBQUksRUFBRWhCLGlCQUFpQixDQUFDZ0IsSUFBSTtNQUM1QkMsTUFBTSxFQUFFLElBQUksQ0FBQ0MsY0FBYyxDQUFDRDtJQUM5QixDQUFFLENBQUM7SUFDTCxJQUFJLENBQUNOLFFBQVEsQ0FBRUMsOEJBQStCLENBQUM7O0lBRS9DO0lBQ0EsQ0FBRWhCLEtBQUssQ0FBQ00sVUFBVSxFQUFFTixLQUFLLENBQUNLLGNBQWMsQ0FBRSxDQUFDa0IsT0FBTyxDQUFFQyxLQUFLLElBQUk7TUFFM0QsTUFBTUMsU0FBUyxHQUFHLElBQUlsQyxTQUFTLENBQUVpQyxLQUFLLEVBQUUsSUFBSSxDQUFDckIsY0FBYyxFQUFFSCxLQUFLLENBQUNPLHNCQUF1QixDQUFDOztNQUUzRjtNQUNBa0IsU0FBUyxDQUFDQyxxQkFBcUIsQ0FBRSxJQUFJN0IscUJBQXFCLENBQUUyQixLQUFLLEVBQUVDLFNBQVMsRUFBRTtRQUM1RUwsSUFBSSxFQUFFSiw4QkFBOEIsQ0FBQ0ksSUFBSTtRQUN6Q0MsTUFBTSxFQUFFTCw4QkFBOEIsQ0FBQ0gsR0FBRyxHQUFHeEIsdUJBQXVCLENBQUNzQztNQUN2RSxDQUFFLENBQUUsQ0FBQzs7TUFFTDtNQUNBO01BQ0EsSUFBSSxDQUFDeEIsY0FBYyxDQUFDYywwQkFBMEIsQ0FBQ1csSUFBSSxDQUFFQyxrQkFBa0IsSUFBSTtRQUN6RSxJQUFJLENBQUNDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCTCxTQUFTLENBQUNNLE9BQU8sR0FBS0Ysa0JBQWtCLEtBQUtMLEtBQUssQ0FBQ0ssa0JBQW9CO01BQ3pFLENBQUUsQ0FBQzs7TUFFSDtNQUNBLElBQUksQ0FBQ2QsUUFBUSxDQUFFVSxTQUFVLENBQUM7SUFDNUIsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRU8sS0FBS0EsQ0FBQSxFQUFHO0lBQ04sS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQzdCLGNBQWMsQ0FBQzZCLEtBQUssQ0FBQyxDQUFDO0VBQzdCO0FBQ0Y7QUFFQXRDLGNBQWMsQ0FBQ3VDLFFBQVEsQ0FBRSxlQUFlLEVBQUVuQyxhQUFjLENBQUMifQ==