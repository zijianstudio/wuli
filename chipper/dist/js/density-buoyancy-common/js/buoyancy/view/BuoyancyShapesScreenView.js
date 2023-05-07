// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main view for the Shapes screen of the Buoyancy simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { AlignBox, HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import Material from '../../common/model/Material.js';
import DensityControlNode from '../../common/view/DensityControlNode.js';
import DisplayOptionsNode from '../../common/view/DisplayOptionsNode.js';
import PrimarySecondaryPanelsNode from '../../common/view/PrimarySecondaryPanelsNode.js';
import SecondaryMassScreenView from '../../common/view/SecondaryMassScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityReadoutListNode from './DensityReadoutListNode.js';
import ShapeSizeControlNode from './ShapeSizeControlNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
export default class BuoyancyShapesScreenView extends SecondaryMassScreenView {
  constructor(model, options) {
    const tandem = options.tandem;
    super(model, combineOptions({
      cameraLookAt: DensityBuoyancyCommonConstants.BUOYANCY_CAMERA_LOOK_AT
    }, options));
    const densityControlPanel = new Panel(new DensityControlNode(model.liquidMaterialProperty, [Material.GASOLINE, Material.OIL, Material.WATER, Material.SEAWATER, Material.HONEY, Material.MERCURY, Material.DENSITY_C, Material.DENSITY_D], this.popupLayer, tandem.createTandem('densityControlNode')), DensityBuoyancyCommonConstants.PANEL_OPTIONS);
    this.addChild(new AlignBox(densityControlPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'bottom',
      margin: MARGIN
    }));
    const displayOptionsNode = new DisplayOptionsNode(model);
    const densityContainer = new VBox({
      spacing: 0,
      children: [new HStrut(displayOptionsNode.width - 10),
      // Same internal size as displayOptionsNode
      new DensityReadoutListNode([new Property(Material.WOOD, {
        tandem: Tandem.OPT_OUT
      })])]
    });
    const densityBox = new AccordionBox(densityContainer, combineOptions({
      titleNode: new Text(DensityBuoyancyCommonStrings.densityStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 160
      }),
      expandedProperty: model.densityExpandedProperty
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS));
    this.addChild(new AlignBox(new VBox({
      spacing: 10,
      children: [densityBox, new Panel(displayOptionsNode, DensityBuoyancyCommonConstants.PANEL_OPTIONS)]
    }), {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'left',
      yAlign: 'bottom',
      margin: MARGIN
    }));
    this.rightBox = new PrimarySecondaryPanelsNode(new ShapeSizeControlNode(model.primaryShapeProperty, model.primaryWidthRatioProperty, model.primaryHeightRatioProperty, new DynamicProperty(model.primaryMassProperty, {
      derive: 'volumeProperty'
    }), this.popupLayer, {
      labelNode: PrimarySecondaryPanelsNode.getPrimaryLabelNode()
    }), new ShapeSizeControlNode(model.secondaryShapeProperty, model.secondaryWidthRatioProperty, model.secondaryHeightRatioProperty, new DynamicProperty(model.secondaryMassProperty, {
      derive: 'volumeProperty'
    }), this.popupLayer, {
      labelNode: PrimarySecondaryPanelsNode.getSecondaryLabelNode(),
      visibleProperty: new DynamicProperty(model.secondaryMassProperty, {
        derive: 'internalVisibleProperty'
      })
    }));
    this.addChild(new AlignBox(this.rightBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    }));

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    this.rightBarrierViewPointProperty.value = new DerivedProperty([this.rightBox.boundsProperty, this.visibleBoundsProperty], (boxBounds, visibleBounds) => {
      // We might not have a box, see https://github.com/phetsims/density/issues/110
      return new Vector2(isFinite(boxBounds.left) ? boxBounds.left : visibleBounds.right, visibleBounds.centerY);
    });
    this.addSecondMassControl(model.modeProperty);
    this.addChild(this.popupLayer);
  }
}
densityBuoyancyCommon.register('BuoyancyShapesScreenView', BuoyancyShapesScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJBbGlnbkJveCIsIkhTdHJ1dCIsIlRleHQiLCJWQm94IiwiQWNjb3JkaW9uQm94IiwiUGFuZWwiLCJUYW5kZW0iLCJEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMiLCJNYXRlcmlhbCIsIkRlbnNpdHlDb250cm9sTm9kZSIsIkRpc3BsYXlPcHRpb25zTm9kZSIsIlByaW1hcnlTZWNvbmRhcnlQYW5lbHNOb2RlIiwiU2Vjb25kYXJ5TWFzc1NjcmVlblZpZXciLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIiwiRGVuc2l0eVJlYWRvdXRMaXN0Tm9kZSIsIlNoYXBlU2l6ZUNvbnRyb2xOb2RlIiwiY29tYmluZU9wdGlvbnMiLCJNQVJHSU4iLCJCdW95YW5jeVNoYXBlc1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwib3B0aW9ucyIsInRhbmRlbSIsImNhbWVyYUxvb2tBdCIsIkJVT1lBTkNZX0NBTUVSQV9MT09LX0FUIiwiZGVuc2l0eUNvbnRyb2xQYW5lbCIsImxpcXVpZE1hdGVyaWFsUHJvcGVydHkiLCJHQVNPTElORSIsIk9JTCIsIldBVEVSIiwiU0VBV0FURVIiLCJIT05FWSIsIk1FUkNVUlkiLCJERU5TSVRZX0MiLCJERU5TSVRZX0QiLCJwb3B1cExheWVyIiwiY3JlYXRlVGFuZGVtIiwiUEFORUxfT1BUSU9OUyIsImFkZENoaWxkIiwiYWxpZ25Cb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInhBbGlnbiIsInlBbGlnbiIsIm1hcmdpbiIsImRpc3BsYXlPcHRpb25zTm9kZSIsImRlbnNpdHlDb250YWluZXIiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJ3aWR0aCIsIldPT0QiLCJPUFRfT1VUIiwiZGVuc2l0eUJveCIsInRpdGxlTm9kZSIsImRlbnNpdHlTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJUSVRMRV9GT05UIiwibWF4V2lkdGgiLCJleHBhbmRlZFByb3BlcnR5IiwiZGVuc2l0eUV4cGFuZGVkUHJvcGVydHkiLCJBQ0NPUkRJT05fQk9YX09QVElPTlMiLCJyaWdodEJveCIsInByaW1hcnlTaGFwZVByb3BlcnR5IiwicHJpbWFyeVdpZHRoUmF0aW9Qcm9wZXJ0eSIsInByaW1hcnlIZWlnaHRSYXRpb1Byb3BlcnR5IiwicHJpbWFyeU1hc3NQcm9wZXJ0eSIsImRlcml2ZSIsImxhYmVsTm9kZSIsImdldFByaW1hcnlMYWJlbE5vZGUiLCJzZWNvbmRhcnlTaGFwZVByb3BlcnR5Iiwic2Vjb25kYXJ5V2lkdGhSYXRpb1Byb3BlcnR5Iiwic2Vjb25kYXJ5SGVpZ2h0UmF0aW9Qcm9wZXJ0eSIsInNlY29uZGFyeU1hc3NQcm9wZXJ0eSIsImdldFNlY29uZGFyeUxhYmVsTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInJpZ2h0QmFycmllclZpZXdQb2ludFByb3BlcnR5IiwidmFsdWUiLCJib3VuZHNQcm9wZXJ0eSIsImJveEJvdW5kcyIsInZpc2libGVCb3VuZHMiLCJpc0Zpbml0ZSIsImxlZnQiLCJyaWdodCIsImNlbnRlclkiLCJhZGRTZWNvbmRNYXNzQ29udHJvbCIsIm1vZGVQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQnVveWFuY3lTaGFwZXNTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBtYWluIHZpZXcgZm9yIHRoZSBTaGFwZXMgc2NyZWVuIG9mIHRoZSBCdW95YW5jeSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEeW5hbWljUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EeW5hbWljUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIEhTdHJ1dCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3gsIHsgQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1hdGVyaWFsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NYXRlcmlhbC5qcyc7XHJcbmltcG9ydCBEZW5zaXR5Q29udHJvbE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRGVuc2l0eUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IERpc3BsYXlPcHRpb25zTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9EaXNwbGF5T3B0aW9uc05vZGUuanMnO1xyXG5pbXBvcnQgUHJpbWFyeVNlY29uZGFyeVBhbmVsc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUHJpbWFyeVNlY29uZGFyeVBhbmVsc05vZGUuanMnO1xyXG5pbXBvcnQgU2Vjb25kYXJ5TWFzc1NjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2Vjb25kYXJ5TWFzc1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eVJlYWRvdXRMaXN0Tm9kZSBmcm9tICcuL0RlbnNpdHlSZWFkb3V0TGlzdE5vZGUuanMnO1xyXG5pbXBvcnQgU2hhcGVTaXplQ29udHJvbE5vZGUgZnJvbSAnLi9TaGFwZVNpemVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCBCdW95YW5jeVNoYXBlc01vZGVsIGZyb20gJy4uL21vZGVsL0J1b3lhbmN5U2hhcGVzTW9kZWwuanMnO1xyXG5pbXBvcnQgeyBEZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0RlbnNpdHlCdW95YW5jeVNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BUkdJTiA9IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5NQVJHSU47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdW95YW5jeVNoYXBlc1NjcmVlblZpZXcgZXh0ZW5kcyBTZWNvbmRhcnlNYXNzU2NyZWVuVmlldzxCdW95YW5jeVNoYXBlc01vZGVsPiB7XHJcblxyXG4gIHByb3RlY3RlZCByaWdodEJveDogTm9kZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogQnVveWFuY3lTaGFwZXNNb2RlbCwgb3B0aW9uczogRGVuc2l0eUJ1b3lhbmN5U2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgdGFuZGVtID0gb3B0aW9ucy50YW5kZW07XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLCBjb21iaW5lT3B0aW9uczxEZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3T3B0aW9ucz4oIHtcclxuICAgICAgY2FtZXJhTG9va0F0OiBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuQlVPWUFOQ1lfQ0FNRVJBX0xPT0tfQVRcclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGRlbnNpdHlDb250cm9sUGFuZWwgPSBuZXcgUGFuZWwoIG5ldyBEZW5zaXR5Q29udHJvbE5vZGUoIG1vZGVsLmxpcXVpZE1hdGVyaWFsUHJvcGVydHksIFtcclxuICAgICAgTWF0ZXJpYWwuR0FTT0xJTkUsXHJcbiAgICAgIE1hdGVyaWFsLk9JTCxcclxuICAgICAgTWF0ZXJpYWwuV0FURVIsXHJcbiAgICAgIE1hdGVyaWFsLlNFQVdBVEVSLFxyXG4gICAgICBNYXRlcmlhbC5IT05FWSxcclxuICAgICAgTWF0ZXJpYWwuTUVSQ1VSWSxcclxuICAgICAgTWF0ZXJpYWwuREVOU0lUWV9DLFxyXG4gICAgICBNYXRlcmlhbC5ERU5TSVRZX0RcclxuICAgIF0sIHRoaXMucG9wdXBMYXllciwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RlbnNpdHlDb250cm9sTm9kZScgKSApLCBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuUEFORUxfT1BUSU9OUyApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBBbGlnbkJveCggZGVuc2l0eUNvbnRyb2xQYW5lbCwge1xyXG4gICAgICBhbGlnbkJvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgeEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJyxcclxuICAgICAgbWFyZ2luOiBNQVJHSU5cclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IGRpc3BsYXlPcHRpb25zTm9kZSA9IG5ldyBEaXNwbGF5T3B0aW9uc05vZGUoIG1vZGVsICk7XHJcblxyXG4gICAgY29uc3QgZGVuc2l0eUNvbnRhaW5lciA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDAsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IEhTdHJ1dCggZGlzcGxheU9wdGlvbnNOb2RlLndpZHRoIC0gMTAgKSwgLy8gU2FtZSBpbnRlcm5hbCBzaXplIGFzIGRpc3BsYXlPcHRpb25zTm9kZVxyXG4gICAgICAgIG5ldyBEZW5zaXR5UmVhZG91dExpc3ROb2RlKCBbIG5ldyBQcm9wZXJ0eSggTWF0ZXJpYWwuV09PRCwge1xyXG4gICAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgICAgIH0gKSBdIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGRlbnNpdHlCb3ggPSBuZXcgQWNjb3JkaW9uQm94KCBkZW5zaXR5Q29udGFpbmVyLCBjb21iaW5lT3B0aW9uczxBY2NvcmRpb25Cb3hPcHRpb25zPigge1xyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmRlbnNpdHlTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIGZvbnQ6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiAxNjBcclxuICAgICAgfSApLFxyXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiBtb2RlbC5kZW5zaXR5RXhwYW5kZWRQcm9wZXJ0eVxyXG4gICAgfSwgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfT1BUSU9OUyApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBkZW5zaXR5Qm94LFxyXG4gICAgICAgIG5ldyBQYW5lbCggZGlzcGxheU9wdGlvbnNOb2RlLCBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuUEFORUxfT1BUSU9OUyApXHJcbiAgICAgIF1cclxuICAgIH0gKSwge1xyXG4gICAgICBhbGlnbkJvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgeEFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHlBbGlnbjogJ2JvdHRvbScsXHJcbiAgICAgIG1hcmdpbjogTUFSR0lOXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0Qm94ID0gbmV3IFByaW1hcnlTZWNvbmRhcnlQYW5lbHNOb2RlKFxyXG4gICAgICBuZXcgU2hhcGVTaXplQ29udHJvbE5vZGUoXHJcbiAgICAgICAgbW9kZWwucHJpbWFyeVNoYXBlUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwucHJpbWFyeVdpZHRoUmF0aW9Qcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5wcmltYXJ5SGVpZ2h0UmF0aW9Qcm9wZXJ0eSxcclxuICAgICAgICBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5wcmltYXJ5TWFzc1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBkZXJpdmU6ICd2b2x1bWVQcm9wZXJ0eSdcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgdGhpcy5wb3B1cExheWVyLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGxhYmVsTm9kZTogUHJpbWFyeVNlY29uZGFyeVBhbmVsc05vZGUuZ2V0UHJpbWFyeUxhYmVsTm9kZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICApLFxyXG4gICAgICBuZXcgU2hhcGVTaXplQ29udHJvbE5vZGUoXHJcbiAgICAgICAgbW9kZWwuc2Vjb25kYXJ5U2hhcGVQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5zZWNvbmRhcnlXaWR0aFJhdGlvUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuc2Vjb25kYXJ5SGVpZ2h0UmF0aW9Qcm9wZXJ0eSxcclxuICAgICAgICBuZXcgRHluYW1pY1Byb3BlcnR5KCBtb2RlbC5zZWNvbmRhcnlNYXNzUHJvcGVydHksIHtcclxuICAgICAgICAgIGRlcml2ZTogJ3ZvbHVtZVByb3BlcnR5J1xyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB0aGlzLnBvcHVwTGF5ZXIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbGFiZWxOb2RlOiBQcmltYXJ5U2Vjb25kYXJ5UGFuZWxzTm9kZS5nZXRTZWNvbmRhcnlMYWJlbE5vZGUoKSxcclxuICAgICAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IER5bmFtaWNQcm9wZXJ0eSggbW9kZWwuc2Vjb25kYXJ5TWFzc1Byb3BlcnR5LCB7IGRlcml2ZTogJ2ludGVybmFsVmlzaWJsZVByb3BlcnR5JyB9IClcclxuICAgICAgICB9XHJcbiAgICAgIClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCB0aGlzLnJpZ2h0Qm94LCB7XHJcbiAgICAgIGFsaWduQm91bmRzUHJvcGVydHk6IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB4QWxpZ246ICdyaWdodCcsXHJcbiAgICAgIHlBbGlnbjogJ3RvcCcsXHJcbiAgICAgIG1hcmdpbjogTUFSR0lOXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBEZXJpdmVkUHJvcGVydHkgZG9lc24ndCBuZWVkIGRpc3Bvc2FsLCBzaW5jZSBldmVyeXRoaW5nIGhlcmUgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgdGhpcy5yaWdodEJhcnJpZXJWaWV3UG9pbnRQcm9wZXJ0eS52YWx1ZSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5yaWdodEJveC5ib3VuZHNQcm9wZXJ0eSwgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkgXSwgKCBib3hCb3VuZHMsIHZpc2libGVCb3VuZHMgKSA9PiB7XHJcbiAgICAgIC8vIFdlIG1pZ2h0IG5vdCBoYXZlIGEgYm94LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RlbnNpdHkvaXNzdWVzLzExMFxyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGlzRmluaXRlKCBib3hCb3VuZHMubGVmdCApID8gYm94Qm91bmRzLmxlZnQgOiB2aXNpYmxlQm91bmRzLnJpZ2h0LCB2aXNpYmxlQm91bmRzLmNlbnRlclkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZFNlY29uZE1hc3NDb250cm9sKCBtb2RlbC5tb2RlUHJvcGVydHkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBvcHVwTGF5ZXIgKTtcclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ0J1b3lhbmN5U2hhcGVzU2NyZWVuVmlldycsIEJ1b3lhbmN5U2hhcGVzU2NyZWVuVmlldyApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxRQUFRLEVBQUVDLE1BQU0sRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RGLE9BQU9DLFlBQVksTUFBK0Isb0NBQW9DO0FBQ3RGLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyw4QkFBOEIsTUFBTSxnREFBZ0Q7QUFDM0YsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQyxrQkFBa0IsTUFBTSx5Q0FBeUM7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