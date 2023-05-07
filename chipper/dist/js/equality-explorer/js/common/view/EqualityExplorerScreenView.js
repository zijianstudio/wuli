// Copyright 2017-2022, University of Colorado Boulder

/**
 * Abstract base type for ScreenViews in the Equality Explorer sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';
import optionize from '../../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
export default class EqualityExplorerScreenView extends ScreenView {
  // Each ScreenView has its own state for accordion boxes,
  // see https://github.com/phetsims/equality-explorer/issues/124

  // a Node for each scene

  constructor(model, tandem, providedOptions) {
    const options = optionize()({
      // ScreenViewOptions
      layoutBounds: EqualityExplorerConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      preventFit: EqualityExplorerConstants.SCREEN_VIEW_PREVENT_FIT,
      tandem: tandem
    }, providedOptions);
    super(options);
    this.equationAccordionBoxExpandedProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('equationAccordionBoxExpandedProperty'),
      phetioDocumentation: 'Applies to the "Equation or Inequality" accordion box for all scenes'
    });
    this.snapshotsAccordionBoxExpandedProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('snapshotsAccordionBoxExpandedProperty'),
      phetioDocumentation: 'Applies to the "Snapshots" accordion box for all scenes'
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        phet.log && phet.log('ResetAllButton pressed');
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - EqualityExplorerConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - EqualityExplorerConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // If there is more than 1 scene, organize them under a 'sceneNodes' tandem.
    const sceneNodesTandem = model.scenes.length === 1 ? options.tandem : options.tandem.createTandem('sceneNodes');

    // Create a Node for each scene.
    this.sceneNodes = [];
    model.scenes.forEach(scene => {
      const sceneNodeTandem = sceneNodesTandem.createTandem(`${scene.tandem.name}Node`);
      const sceneNode = this.createSceneNode(scene, this.equationAccordionBoxExpandedProperty, this.snapshotsAccordionBoxExpandedProperty, this.layoutBounds, {
        visibleProperty: new DerivedProperty([model.sceneProperty], selectedScene => scene === selectedScene, {
          tandem: sceneNodeTandem.createTandem('visibleProperty'),
          phetioValueType: BooleanIO
        }),
        tandem: sceneNodeTandem
      });
      this.sceneNodes.push(sceneNode);
      this.addChild(sceneNode);
    });

    // If there is more than 1 scene, create radio buttons for selecting a scene.
    if (model.scenes.length > 1) {
      const sceneRadioButtonGroup = new SceneRadioButtonGroup(model.scenes, model.sceneProperty, {
        tandem: options.tandem.createTandem('sceneRadioButtonGroup')
      });
      this.addChild(sceneRadioButtonGroup);

      // Centered under Snapshots accordion box
      const snapshotsAccordionBox = this.sceneNodes[0].snapshotsAccordionBox;
      sceneRadioButtonGroup.boundsProperty.link(bounds => {
        sceneRadioButtonGroup.centerX = snapshotsAccordionBox.centerX;
        sceneRadioButtonGroup.centerY = snapshotsAccordionBox.bottom + (resetAllButton.top - snapshotsAccordionBox.bottom) / 2;
      });
    }
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.equationAccordionBoxExpandedProperty.reset();
    this.snapshotsAccordionBoxExpandedProperty.reset();
    this.sceneNodes.forEach(sceneNode => sceneNode.reset());
  }

  /**
   * Animates the view.
   * @param dt - elapsed time, in seconds
   */
  step(dt) {
    super.step(dt);

    // animate the view for the selected scene
    for (let i = 0; i < this.sceneNodes.length; i++) {
      const sceneNode = this.sceneNodes[i];
      if (sceneNode.visible) {
        sceneNode.step(dt);
        break;
      }
    }
  }

  /**
   * Creates the Node for this scene.
   */
}

equalityExplorer.register('EqualityExplorerScreenView', EqualityExplorerScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJTY3JlZW5WaWV3IiwiUmVzZXRBbGxCdXR0b24iLCJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsIlNjZW5lUmFkaW9CdXR0b25Hcm91cCIsIm9wdGlvbml6ZSIsIkRlcml2ZWRQcm9wZXJ0eSIsIkJvb2xlYW5JTyIsIkVxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsYXlvdXRCb3VuZHMiLCJTQ1JFRU5fVklFV19MQVlPVVRfQk9VTkRTIiwicHJldmVudEZpdCIsIlNDUkVFTl9WSUVXX1BSRVZFTlRfRklUIiwiZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwicGhldCIsImxvZyIsInJlc2V0IiwicmlnaHQiLCJtYXhYIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJib3R0b20iLCJtYXhZIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJhZGRDaGlsZCIsInNjZW5lTm9kZXNUYW5kZW0iLCJzY2VuZXMiLCJsZW5ndGgiLCJzY2VuZU5vZGVzIiwiZm9yRWFjaCIsInNjZW5lIiwic2NlbmVOb2RlVGFuZGVtIiwibmFtZSIsInNjZW5lTm9kZSIsImNyZWF0ZVNjZW5lTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInNjZW5lUHJvcGVydHkiLCJzZWxlY3RlZFNjZW5lIiwicGhldGlvVmFsdWVUeXBlIiwicHVzaCIsInNjZW5lUmFkaW9CdXR0b25Hcm91cCIsInNuYXBzaG90c0FjY29yZGlvbkJveCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsImNlbnRlclgiLCJjZW50ZXJZIiwidG9wIiwiZGlzcG9zZSIsImFzc2VydCIsInN0ZXAiLCJkdCIsImkiLCJ2aXNpYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIHR5cGUgZm9yIFNjcmVlblZpZXdzIGluIHRoZSBFcXVhbGl0eSBFeHBsb3JlciBzaW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJNb2RlbCBmcm9tICcuLi9tb2RlbC9FcXVhbGl0eUV4cGxvcmVyTW9kZWwuanMnO1xyXG5pbXBvcnQgU2NlbmVSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vU2NlbmVSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSBmcm9tICcuLi9tb2RlbC9FcXVhbGl0eUV4cGxvcmVyU2NlbmUuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlLCB7IEVxdWFsaXR5RXhwbG9yZXJTY2VuZU5vZGVPcHRpb25zIH0gZnJvbSAnLi9FcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgRXF1YWxpdHlFeHBsb3JlclNjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvLyBFYWNoIFNjcmVlblZpZXcgaGFzIGl0cyBvd24gc3RhdGUgZm9yIGFjY29yZGlvbiBib3hlcyxcclxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy8xMjRcclxuICBwcml2YXRlIHJlYWRvbmx5IGVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gYSBOb2RlIGZvciBlYWNoIHNjZW5lXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzY2VuZU5vZGVzOiBFcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlW107XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggbW9kZWw6IEVxdWFsaXR5RXhwbG9yZXJNb2RlbCwgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3T3B0aW9ucywgU2VsZk9wdGlvbnMsIFNjcmVlblZpZXdPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTY3JlZW5WaWV3T3B0aW9uc1xyXG4gICAgICBsYXlvdXRCb3VuZHM6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUyxcclxuICAgICAgcHJldmVudEZpdDogRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5TQ1JFRU5fVklFV19QUkVWRU5UX0ZJVCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5lcXVhdGlvbkFjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQXBwbGllcyB0byB0aGUgXCJFcXVhdGlvbiBvciBJbmVxdWFsaXR5XCIgYWNjb3JkaW9uIGJveCBmb3IgYWxsIHNjZW5lcydcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBcHBsaWVzIHRvIHRoZSBcIlNuYXBzaG90c1wiIGFjY29yZGlvbiBib3ggZm9yIGFsbCBzY2VuZXMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJ1Jlc2V0QWxsQnV0dG9uIHByZXNzZWQnICk7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gMSBzY2VuZSwgb3JnYW5pemUgdGhlbSB1bmRlciBhICdzY2VuZU5vZGVzJyB0YW5kZW0uXHJcbiAgICBjb25zdCBzY2VuZU5vZGVzVGFuZGVtID0gKCBtb2RlbC5zY2VuZXMubGVuZ3RoID09PSAxICkgPyBvcHRpb25zLnRhbmRlbSA6IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NjZW5lTm9kZXMnICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgTm9kZSBmb3IgZWFjaCBzY2VuZS5cclxuICAgIHRoaXMuc2NlbmVOb2RlcyA9IFtdO1xyXG4gICAgbW9kZWwuc2NlbmVzLmZvckVhY2goIHNjZW5lID0+IHtcclxuICAgICAgY29uc3Qgc2NlbmVOb2RlVGFuZGVtID0gc2NlbmVOb2Rlc1RhbmRlbS5jcmVhdGVUYW5kZW0oIGAke3NjZW5lLnRhbmRlbS5uYW1lfU5vZGVgICk7XHJcbiAgICAgIGNvbnN0IHNjZW5lTm9kZSA9IHRoaXMuY3JlYXRlU2NlbmVOb2RlKCBzY2VuZSxcclxuICAgICAgICB0aGlzLmVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLnNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgICAgdGhpcy5sYXlvdXRCb3VuZHMsIHtcclxuICAgICAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgICAgICAgWyBtb2RlbC5zY2VuZVByb3BlcnR5IF0sXHJcbiAgICAgICAgICAgIHNlbGVjdGVkU2NlbmUgPT4gc2NlbmUgPT09IHNlbGVjdGVkU2NlbmUsIHtcclxuICAgICAgICAgICAgICB0YW5kZW06IHNjZW5lTm9kZVRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU9cclxuICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgdGFuZGVtOiBzY2VuZU5vZGVUYW5kZW1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIHRoaXMuc2NlbmVOb2Rlcy5wdXNoKCBzY2VuZU5vZGUgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggc2NlbmVOb2RlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWYgdGhlcmUgaXMgbW9yZSB0aGFuIDEgc2NlbmUsIGNyZWF0ZSByYWRpbyBidXR0b25zIGZvciBzZWxlY3RpbmcgYSBzY2VuZS5cclxuICAgIGlmICggbW9kZWwuc2NlbmVzLmxlbmd0aCA+IDEgKSB7XHJcblxyXG4gICAgICBjb25zdCBzY2VuZVJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgU2NlbmVSYWRpb0J1dHRvbkdyb3VwKCBtb2RlbC5zY2VuZXMsIG1vZGVsLnNjZW5lUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NjZW5lUmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHNjZW5lUmFkaW9CdXR0b25Hcm91cCApO1xyXG5cclxuICAgICAgLy8gQ2VudGVyZWQgdW5kZXIgU25hcHNob3RzIGFjY29yZGlvbiBib3hcclxuICAgICAgY29uc3Qgc25hcHNob3RzQWNjb3JkaW9uQm94ID0gdGhpcy5zY2VuZU5vZGVzWyAwIF0uc25hcHNob3RzQWNjb3JkaW9uQm94O1xyXG4gICAgICBzY2VuZVJhZGlvQnV0dG9uR3JvdXAuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgICBzY2VuZVJhZGlvQnV0dG9uR3JvdXAuY2VudGVyWCA9IHNuYXBzaG90c0FjY29yZGlvbkJveC5jZW50ZXJYO1xyXG4gICAgICAgIHNjZW5lUmFkaW9CdXR0b25Hcm91cC5jZW50ZXJZID0gc25hcHNob3RzQWNjb3JkaW9uQm94LmJvdHRvbSArICggcmVzZXRBbGxCdXR0b24udG9wIC0gc25hcHNob3RzQWNjb3JkaW9uQm94LmJvdHRvbSApIC8gMjtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2NlbmVOb2Rlcy5mb3JFYWNoKCBzY2VuZU5vZGUgPT4gc2NlbmVOb2RlLnJlc2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGVzIHRoZSB2aWV3LlxyXG4gICAqIEBwYXJhbSBkdCAtIGVsYXBzZWQgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIHN1cGVyLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgLy8gYW5pbWF0ZSB0aGUgdmlldyBmb3IgdGhlIHNlbGVjdGVkIHNjZW5lXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNjZW5lTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNjZW5lTm9kZSA9IHRoaXMuc2NlbmVOb2Rlc1sgaSBdO1xyXG4gICAgICBpZiAoIHNjZW5lTm9kZS52aXNpYmxlICkge1xyXG4gICAgICAgIHNjZW5lTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBOb2RlIGZvciB0aGlzIHNjZW5lLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVTY2VuZU5vZGUoIHNjZW5lOiBFcXVhbGl0eUV4cGxvcmVyU2NlbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXRCb3VuZHM6IEJvdW5kczIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBFcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlT3B0aW9ucyApOiBFcXVhbGl0eUV4cGxvcmVyU2NlbmVOb2RlO1xyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnRXF1YWxpdHlFeHBsb3JlclNjcmVlblZpZXcnLCBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFVBQVUsTUFBNkIsb0NBQW9DO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFFbEYsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHlCQUF5QixNQUFNLGlDQUFpQztBQUV2RSxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFJOUQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFHbkYsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sMENBQTBDO0FBTWhFLGVBQWUsTUFBZUMsMEJBQTBCLFNBQVNSLFVBQVUsQ0FBQztFQUUxRTtFQUNBOztFQUlBOztFQUdVUyxXQUFXQSxDQUFFQyxLQUE0QixFQUFFQyxNQUFjLEVBQUVDLGVBQW1ELEVBQUc7SUFFekgsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQW9FLENBQUMsQ0FBRTtNQUU5RjtNQUNBUyxZQUFZLEVBQUVYLHlCQUF5QixDQUFDWSx5QkFBeUI7TUFDakVDLFVBQVUsRUFBRWIseUJBQXlCLENBQUNjLHVCQUF1QjtNQUM3RE4sTUFBTSxFQUFFQTtJQUNWLENBQUMsRUFBRUMsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVDLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNLLG9DQUFvQyxHQUFHLElBQUluQixlQUFlLENBQUUsSUFBSSxFQUFFO01BQ3JFWSxNQUFNLEVBQUVFLE9BQU8sQ0FBQ0YsTUFBTSxDQUFDUSxZQUFZLENBQUUsc0NBQXVDLENBQUM7TUFDN0VDLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0MscUNBQXFDLEdBQUcsSUFBSXRCLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDdkVZLE1BQU0sRUFBRUUsT0FBTyxDQUFDRixNQUFNLENBQUNRLFlBQVksQ0FBRSx1Q0FBd0MsQ0FBQztNQUM5RUMsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDO0lBRUgsTUFBTUUsY0FBYyxHQUFHLElBQUlyQixjQUFjLENBQUU7TUFDekNzQixRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkQyxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUUsd0JBQXlCLENBQUM7UUFDaERmLEtBQUssQ0FBQ2dCLEtBQUssQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDQSxLQUFLLENBQUMsQ0FBQztNQUNkLENBQUM7TUFDREMsS0FBSyxFQUFFLElBQUksQ0FBQ2IsWUFBWSxDQUFDYyxJQUFJLEdBQUd6Qix5QkFBeUIsQ0FBQzBCLG9CQUFvQjtNQUM5RUMsTUFBTSxFQUFFLElBQUksQ0FBQ2hCLFlBQVksQ0FBQ2lCLElBQUksR0FBRzVCLHlCQUF5QixDQUFDNkIsb0JBQW9CO01BQy9FckIsTUFBTSxFQUFFRSxPQUFPLENBQUNGLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLGdCQUFpQjtJQUN4RCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNjLFFBQVEsQ0FBRVgsY0FBZSxDQUFDOztJQUUvQjtJQUNBLE1BQU1ZLGdCQUFnQixHQUFLeEIsS0FBSyxDQUFDeUIsTUFBTSxDQUFDQyxNQUFNLEtBQUssQ0FBQyxHQUFLdkIsT0FBTyxDQUFDRixNQUFNLEdBQUdFLE9BQU8sQ0FBQ0YsTUFBTSxDQUFDUSxZQUFZLENBQUUsWUFBYSxDQUFDOztJQUVySDtJQUNBLElBQUksQ0FBQ2tCLFVBQVUsR0FBRyxFQUFFO0lBQ3BCM0IsS0FBSyxDQUFDeUIsTUFBTSxDQUFDRyxPQUFPLENBQUVDLEtBQUssSUFBSTtNQUM3QixNQUFNQyxlQUFlLEdBQUdOLGdCQUFnQixDQUFDZixZQUFZLENBQUcsR0FBRW9CLEtBQUssQ0FBQzVCLE1BQU0sQ0FBQzhCLElBQUssTUFBTSxDQUFDO01BQ25GLE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUNDLGVBQWUsQ0FBRUosS0FBSyxFQUMzQyxJQUFJLENBQUNyQixvQ0FBb0MsRUFDekMsSUFBSSxDQUFDRyxxQ0FBcUMsRUFDMUMsSUFBSSxDQUFDUCxZQUFZLEVBQUU7UUFDakI4QixlQUFlLEVBQUUsSUFBSXRDLGVBQWUsQ0FDbEMsQ0FBRUksS0FBSyxDQUFDbUMsYUFBYSxDQUFFLEVBQ3ZCQyxhQUFhLElBQUlQLEtBQUssS0FBS08sYUFBYSxFQUFFO1VBQ3hDbkMsTUFBTSxFQUFFNkIsZUFBZSxDQUFDckIsWUFBWSxDQUFFLGlCQUFrQixDQUFDO1VBQ3pENEIsZUFBZSxFQUFFeEM7UUFDbkIsQ0FBRSxDQUFDO1FBQ0xJLE1BQU0sRUFBRTZCO01BQ1YsQ0FBRSxDQUFDO01BQ0wsSUFBSSxDQUFDSCxVQUFVLENBQUNXLElBQUksQ0FBRU4sU0FBVSxDQUFDO01BQ2pDLElBQUksQ0FBQ1QsUUFBUSxDQUFFUyxTQUFVLENBQUM7SUFDNUIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBS2hDLEtBQUssQ0FBQ3lCLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLENBQUMsRUFBRztNQUU3QixNQUFNYSxxQkFBcUIsR0FBRyxJQUFJN0MscUJBQXFCLENBQUVNLEtBQUssQ0FBQ3lCLE1BQU0sRUFBRXpCLEtBQUssQ0FBQ21DLGFBQWEsRUFBRTtRQUMxRmxDLE1BQU0sRUFBRUUsT0FBTyxDQUFDRixNQUFNLENBQUNRLFlBQVksQ0FBRSx1QkFBd0I7TUFDL0QsQ0FBRSxDQUFDO01BQ0gsSUFBSSxDQUFDYyxRQUFRLENBQUVnQixxQkFBc0IsQ0FBQzs7TUFFdEM7TUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJLENBQUNiLFVBQVUsQ0FBRSxDQUFDLENBQUUsQ0FBQ2EscUJBQXFCO01BQ3hFRCxxQkFBcUIsQ0FBQ0UsY0FBYyxDQUFDQyxJQUFJLENBQUVDLE1BQU0sSUFBSTtRQUNuREoscUJBQXFCLENBQUNLLE9BQU8sR0FBR0oscUJBQXFCLENBQUNJLE9BQU87UUFDN0RMLHFCQUFxQixDQUFDTSxPQUFPLEdBQUdMLHFCQUFxQixDQUFDcEIsTUFBTSxHQUFHLENBQUVSLGNBQWMsQ0FBQ2tDLEdBQUcsR0FBR04scUJBQXFCLENBQUNwQixNQUFNLElBQUssQ0FBQztNQUMxSCxDQUFFLENBQUM7SUFDTDtFQUNGO0VBRWdCMkIsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtFQUVPL0IsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ1Isb0NBQW9DLENBQUNRLEtBQUssQ0FBQyxDQUFDO0lBQ2pELElBQUksQ0FBQ0wscUNBQXFDLENBQUNLLEtBQUssQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQ1csVUFBVSxDQUFDQyxPQUFPLENBQUVJLFNBQVMsSUFBSUEsU0FBUyxDQUFDaEIsS0FBSyxDQUFDLENBQUUsQ0FBQztFQUMzRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNrQmlDLElBQUlBLENBQUVDLEVBQVUsRUFBUztJQUV2QyxLQUFLLENBQUNELElBQUksQ0FBRUMsRUFBRyxDQUFDOztJQUVoQjtJQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ3hCLFVBQVUsQ0FBQ0QsTUFBTSxFQUFFeUIsQ0FBQyxFQUFFLEVBQUc7TUFDakQsTUFBTW5CLFNBQVMsR0FBRyxJQUFJLENBQUNMLFVBQVUsQ0FBRXdCLENBQUMsQ0FBRTtNQUN0QyxJQUFLbkIsU0FBUyxDQUFDb0IsT0FBTyxFQUFHO1FBQ3ZCcEIsU0FBUyxDQUFDaUIsSUFBSSxDQUFFQyxFQUFHLENBQUM7UUFDcEI7TUFDRjtJQUNGO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBTUE7O0FBRUExRCxnQkFBZ0IsQ0FBQzZELFFBQVEsQ0FBRSw0QkFBNEIsRUFBRXZELDBCQUEyQixDQUFDIn0=