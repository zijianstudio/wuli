// Copyright 2020-2022, University of Colorado Boulder

/**
 * ScreenView (root view class) for the Layer Model screen.
 *
 * @author John Blanco
 */

import GreenhouseEffectScreenView from '../../common/view/GreenhouseEffectScreenView.js';
import LayerModelObservationWindow from '../../common/view/LayerModelObservationWindow.js';
import LayersModelTimeControlNode from '../../common/view/LayersModelTimeControlNode.js';
import MorePhotonsCheckbox from '../../common/view/MorePhotonsCheckbox.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import LayersControl from './LayersControl.js';
import SunAndReflectionControl from './SunAndReflectionControl.js';
import TemperatureUnitsSelector from './TemperatureUnitsSelector.js';
class LayerModelScreenView extends GreenhouseEffectScreenView {
  constructor(model, tandem) {
    // Create the observation window that will depict the layers and photons.
    const observationWindow = new LayerModelObservationWindow(model, {
      tandem: tandem.createTandem('observationWindow')
    });
    const timeControlNode = new LayersModelTimeControlNode(model, {
      tandem: tandem.createTandem('timeControlNode')
    });
    super(model, observationWindow, timeControlNode, {
      // Frame the observation window so that the photons appear to stay within it.
      useClippingFrame: true,
      // phet-io
      tandem: tandem
    });
    const temperatureUnitsSelector = new TemperatureUnitsSelector(model.temperatureUnitsProperty, tandem.createTandem('temperatureUnitsSelector'));
    this.addChild(temperatureUnitsSelector);
    const morePhotonsCheckbox = new MorePhotonsCheckbox(model.photonCollection.showAllSimulatedPhotonsInViewProperty, tandem.createTandem('morePhotonsCheckbox'));
    this.addChild(morePhotonsCheckbox);

    // layout
    temperatureUnitsSelector.left = this.observationWindow.left;
    temperatureUnitsSelector.top = this.observationWindow.bottom + 3;
    morePhotonsCheckbox.left = this.observationWindow.left;
    morePhotonsCheckbox.top = temperatureUnitsSelector.bottom + 12;

    // controls on the side
    const sunAndReflectionControl = new SunAndReflectionControl(this.energyLegend.width, model, tandem.createTandem('sunAndReflectionControl'));
    this.legendAndControlsVBox.addChild(sunAndReflectionControl);
    const layersControl = new LayersControl(this.energyLegend.width, model, tandem.createTandem('layersControl'));
    this.legendAndControlsVBox.addChild(layersControl);

    // pdom - override the pdomOrders for the supertype to insert subtype components
    this.pdomPlayAreaNode.pdomOrder = [this.observationWindow, sunAndReflectionControl, layersControl, observationWindow.showThermometerCheckbox, ...observationWindow.atmosphereLayerNodes, observationWindow.instrumentVisibilityControls, observationWindow.fluxMeterNode];
    this.pdomControlAreaNode.pdomOrder = [temperatureUnitsSelector, morePhotonsCheckbox, this.timeControlNode, this.resetAllButton];
  }
}
greenhouseEffect.register('LayerModelScreenView', LayerModelScreenView);
export default LayerModelScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlldyIsIkxheWVyTW9kZWxPYnNlcnZhdGlvbldpbmRvdyIsIkxheWVyc01vZGVsVGltZUNvbnRyb2xOb2RlIiwiTW9yZVBob3RvbnNDaGVja2JveCIsImdyZWVuaG91c2VFZmZlY3QiLCJMYXllcnNDb250cm9sIiwiU3VuQW5kUmVmbGVjdGlvbkNvbnRyb2wiLCJUZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IiLCJMYXllck1vZGVsU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJvYnNlcnZhdGlvbldpbmRvdyIsImNyZWF0ZVRhbmRlbSIsInRpbWVDb250cm9sTm9kZSIsInVzZUNsaXBwaW5nRnJhbWUiLCJ0ZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IiLCJ0ZW1wZXJhdHVyZVVuaXRzUHJvcGVydHkiLCJhZGRDaGlsZCIsIm1vcmVQaG90b25zQ2hlY2tib3giLCJwaG90b25Db2xsZWN0aW9uIiwic2hvd0FsbFNpbXVsYXRlZFBob3RvbnNJblZpZXdQcm9wZXJ0eSIsImxlZnQiLCJ0b3AiLCJib3R0b20iLCJzdW5BbmRSZWZsZWN0aW9uQ29udHJvbCIsImVuZXJneUxlZ2VuZCIsIndpZHRoIiwibGVnZW5kQW5kQ29udHJvbHNWQm94IiwibGF5ZXJzQ29udHJvbCIsInBkb21QbGF5QXJlYU5vZGUiLCJwZG9tT3JkZXIiLCJzaG93VGhlcm1vbWV0ZXJDaGVja2JveCIsImF0bW9zcGhlcmVMYXllck5vZGVzIiwiaW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scyIsImZsdXhNZXRlck5vZGUiLCJwZG9tQ29udHJvbEFyZWFOb2RlIiwicmVzZXRBbGxCdXR0b24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxheWVyTW9kZWxTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgKHJvb3QgdmlldyBjbGFzcykgZm9yIHRoZSBMYXllciBNb2RlbCBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvR3JlZW5ob3VzZUVmZmVjdFNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTGF5ZXJNb2RlbE9ic2VydmF0aW9uV2luZG93IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xheWVyTW9kZWxPYnNlcnZhdGlvbldpbmRvdy5qcyc7XHJcbmltcG9ydCBMYXllcnNNb2RlbFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MYXllcnNNb2RlbFRpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCBNb3JlUGhvdG9uc0NoZWNrYm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L01vcmVQaG90b25zQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IExheWVyTW9kZWxNb2RlbCBmcm9tICcuLi9tb2RlbC9MYXllck1vZGVsTW9kZWwuanMnO1xyXG5pbXBvcnQgTGF5ZXJzQ29udHJvbCBmcm9tICcuL0xheWVyc0NvbnRyb2wuanMnO1xyXG5pbXBvcnQgU3VuQW5kUmVmbGVjdGlvbkNvbnRyb2wgZnJvbSAnLi9TdW5BbmRSZWZsZWN0aW9uQ29udHJvbC5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IgZnJvbSAnLi9UZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IuanMnO1xyXG5cclxuY2xhc3MgTGF5ZXJNb2RlbFNjcmVlblZpZXcgZXh0ZW5kcyBHcmVlbmhvdXNlRWZmZWN0U2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IExheWVyTW9kZWxNb2RlbCwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3cgdGhhdCB3aWxsIGRlcGljdCB0aGUgbGF5ZXJzIGFuZCBwaG90b25zLlxyXG4gICAgY29uc3Qgb2JzZXJ2YXRpb25XaW5kb3cgPSBuZXcgTGF5ZXJNb2RlbE9ic2VydmF0aW9uV2luZG93KCBtb2RlbCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvYnNlcnZhdGlvbldpbmRvdycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBMYXllcnNNb2RlbFRpbWVDb250cm9sTm9kZSggbW9kZWwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLCBvYnNlcnZhdGlvbldpbmRvdywgdGltZUNvbnRyb2xOb2RlLCB7XHJcblxyXG4gICAgICAvLyBGcmFtZSB0aGUgb2JzZXJ2YXRpb24gd2luZG93IHNvIHRoYXQgdGhlIHBob3RvbnMgYXBwZWFyIHRvIHN0YXkgd2l0aGluIGl0LlxyXG4gICAgICB1c2VDbGlwcGluZ0ZyYW1lOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlVW5pdHNTZWxlY3RvciA9IG5ldyBUZW1wZXJhdHVyZVVuaXRzU2VsZWN0b3IoXHJcbiAgICAgIG1vZGVsLnRlbXBlcmF0dXJlVW5pdHNQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlbXBlcmF0dXJlVW5pdHNTZWxlY3RvcicgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRlbXBlcmF0dXJlVW5pdHNTZWxlY3RvciApO1xyXG5cclxuICAgIGNvbnN0IG1vcmVQaG90b25zQ2hlY2tib3ggPSBuZXcgTW9yZVBob3RvbnNDaGVja2JveChcclxuICAgICAgbW9kZWwucGhvdG9uQ29sbGVjdGlvbi5zaG93QWxsU2ltdWxhdGVkUGhvdG9uc0luVmlld1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9yZVBob3RvbnNDaGVja2JveCcgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG1vcmVQaG90b25zQ2hlY2tib3ggKTtcclxuXHJcbiAgICAvLyBsYXlvdXRcclxuICAgIHRlbXBlcmF0dXJlVW5pdHNTZWxlY3Rvci5sZWZ0ID0gdGhpcy5vYnNlcnZhdGlvbldpbmRvdy5sZWZ0O1xyXG4gICAgdGVtcGVyYXR1cmVVbml0c1NlbGVjdG9yLnRvcCA9IHRoaXMub2JzZXJ2YXRpb25XaW5kb3cuYm90dG9tICsgMztcclxuICAgIG1vcmVQaG90b25zQ2hlY2tib3gubGVmdCA9IHRoaXMub2JzZXJ2YXRpb25XaW5kb3cubGVmdDtcclxuICAgIG1vcmVQaG90b25zQ2hlY2tib3gudG9wID0gdGVtcGVyYXR1cmVVbml0c1NlbGVjdG9yLmJvdHRvbSArIDEyO1xyXG5cclxuICAgIC8vIGNvbnRyb2xzIG9uIHRoZSBzaWRlXHJcbiAgICBjb25zdCBzdW5BbmRSZWZsZWN0aW9uQ29udHJvbCA9IG5ldyBTdW5BbmRSZWZsZWN0aW9uQ29udHJvbChcclxuICAgICAgdGhpcy5lbmVyZ3lMZWdlbmQud2lkdGgsXHJcbiAgICAgIG1vZGVsLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VuQW5kUmVmbGVjdGlvbkNvbnRyb2wnIClcclxuICAgICk7XHJcbiAgICB0aGlzLmxlZ2VuZEFuZENvbnRyb2xzVkJveC5hZGRDaGlsZCggc3VuQW5kUmVmbGVjdGlvbkNvbnRyb2wgKTtcclxuXHJcbiAgICBjb25zdCBsYXllcnNDb250cm9sID0gbmV3IExheWVyc0NvbnRyb2woXHJcbiAgICAgIHRoaXMuZW5lcmd5TGVnZW5kLndpZHRoLFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xheWVyc0NvbnRyb2wnIClcclxuICAgICk7XHJcbiAgICB0aGlzLmxlZ2VuZEFuZENvbnRyb2xzVkJveC5hZGRDaGlsZCggbGF5ZXJzQ29udHJvbCApO1xyXG5cclxuICAgIC8vIHBkb20gLSBvdmVycmlkZSB0aGUgcGRvbU9yZGVycyBmb3IgdGhlIHN1cGVydHlwZSB0byBpbnNlcnQgc3VidHlwZSBjb21wb25lbnRzXHJcbiAgICB0aGlzLnBkb21QbGF5QXJlYU5vZGUucGRvbU9yZGVyID0gW1xyXG4gICAgICB0aGlzLm9ic2VydmF0aW9uV2luZG93LFxyXG4gICAgICBzdW5BbmRSZWZsZWN0aW9uQ29udHJvbCxcclxuICAgICAgbGF5ZXJzQ29udHJvbCxcclxuICAgICAgb2JzZXJ2YXRpb25XaW5kb3cuc2hvd1RoZXJtb21ldGVyQ2hlY2tib3gsXHJcbiAgICAgIC4uLm9ic2VydmF0aW9uV2luZG93LmF0bW9zcGhlcmVMYXllck5vZGVzLFxyXG4gICAgICBvYnNlcnZhdGlvbldpbmRvdy5pbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzLFxyXG4gICAgICBvYnNlcnZhdGlvbldpbmRvdy5mbHV4TWV0ZXJOb2RlXHJcbiAgICBdO1xyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLnBkb21PcmRlciA9IFtcclxuICAgICAgdGVtcGVyYXR1cmVVbml0c1NlbGVjdG9yLFxyXG4gICAgICBtb3JlUGhvdG9uc0NoZWNrYm94LFxyXG4gICAgICB0aGlzLnRpbWVDb250cm9sTm9kZSxcclxuICAgICAgdGhpcy5yZXNldEFsbEJ1dHRvblxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdMYXllck1vZGVsU2NyZWVuVmlldycsIExheWVyTW9kZWxT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