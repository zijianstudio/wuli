// Copyright 2015-2022, University of Colorado Boulder

/**
 * Visual representation of space object's property checkbox.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { colorProfileProperty, HBox, Image, SceneryConstants, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import iconMass_png from '../../../images/iconMass_png.js';
import pathIcon_png from '../../../images/pathIcon_png.js';
import pathIconProjector_png from '../../../images/pathIconProjector_png.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsStrings from '../../GravityAndOrbitsStrings.js';
import GravityAndOrbitsColors from '../GravityAndOrbitsColors.js';
import GridNode from '../../../../scenery-phet/js/GridNode.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';

// constants
const FONT = new PhetFont(18);
const ARROW_Y_COORDINATE = -10;
const CHECKBOX_OPTIONS = {
  scale: 0.8,
  checkboxColor: GravityAndOrbitsColors.foregroundProperty,
  checkboxColorBackground: GravityAndOrbitsColors.backgroundProperty
};
const TEXT_OPTIONS = {
  font: FONT,
  fill: GravityAndOrbitsColors.foregroundProperty
};
const SPACING = 10;
const HBOX_OPTIONS = {
  maxWidth: 240,
  spacing: SPACING
};
class CheckboxPanel extends VerticalCheckboxGroup {
  constructor(model, providedOptions) {
    const items = [{
      property: model.showGravityForceProperty,
      createNode: tandem => new HBox(merge({
        children: [new Text(GravityAndOrbitsStrings.gravityForceStringProperty, combineOptions({
          tandem: tandem.createTandem('labelText')
        }, TEXT_OPTIONS)), new ArrowNode(135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, {
          fill: '#4380C2'
        })]
      }, HBOX_OPTIONS)),
      tandemName: 'gravityForceCheckbox',
      options: CHECKBOX_OPTIONS
    }, {
      // velocity checkbox
      property: model.showVelocityProperty,
      createNode: tandem => new HBox(merge({
        children: [new Text(GravityAndOrbitsStrings.velocityStringProperty, combineOptions({
          tandem: tandem.createTandem('labelText')
        }, TEXT_OPTIONS)), new ArrowNode(95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, {
          fill: PhetColorScheme.VELOCITY
        })]
      }, HBOX_OPTIONS)),
      tandemName: 'velocityCheckbox',
      options: CHECKBOX_OPTIONS
    }];

    // mass checkbox
    if (model.showMassCheckbox) {
      items.push({
        property: model.showMassProperty,
        tandemName: 'massCheckbox',
        createNode: tandem => new HBox(merge({
          children: [new Text(GravityAndOrbitsStrings.massStringProperty, combineOptions({
            tandem: tandem.createTandem('labelText')
          }, TEXT_OPTIONS)), new Image(iconMass_png, {
            scale: 0.8
          })]
        }, HBOX_OPTIONS)),
        options: CHECKBOX_OPTIONS
      });
    }
    const pathIconImageNode = new Image(pathIcon_png, {
      scale: 0.25
    });
    colorProfileProperty.lazyLink(profileName => {
      assert && assert(profileName === SceneryConstants.DEFAULT_COLOR_PROFILE || profileName === SceneryConstants.PROJECTOR_COLOR_PROFILE);
      pathIconImageNode.setImage(profileName === SceneryConstants.PROJECTOR_COLOR_PROFILE ? pathIconProjector_png : pathIcon_png);
    });

    // path checkbox
    items.push({
      property: model.showPathProperty,
      tandemName: 'pathCheckbox',
      createNode: tandem => new HBox(merge({
        children: [new Text(GravityAndOrbitsStrings.pathStringProperty, combineOptions({
          tandem: tandem.createTandem('labelText')
        }, TEXT_OPTIONS)), pathIconImageNode]
      }, HBOX_OPTIONS)),
      options: CHECKBOX_OPTIONS
    });

    // grid checkbox
    items.push({
      property: model.showGridProperty,
      tandemName: 'gridCheckbox',
      createNode: tandem => new HBox(merge({
        children: [new Text(GravityAndOrbitsStrings.gridStringProperty, combineOptions({
          tandem: tandem.createTandem('labelText')
        }, TEXT_OPTIONS)), new GridNode(new Property(ModelViewTransform2.createIdentity()), 10, new Vector2(0, 0), 1, {
          stroke: GravityAndOrbitsColors.gridIconStrokeColorProperty,
          lineWidth: 1.5
        })]
      }, HBOX_OPTIONS)),
      options: CHECKBOX_OPTIONS
    });

    // measuring tape checkbox
    if (model.showMeasuringTape) {
      const measuringTapeIcon = MeasuringTapeNode.createIcon({
        scale: 0.4
      });
      items.push({
        property: model.showMeasuringTapeProperty,
        tandemName: 'measuringTapeCheckbox',
        createNode: tandem => new HBox(combineOptions({
          align: 'top',
          children: [new Text(GravityAndOrbitsStrings.measuringTapeStringProperty, combineOptions({
            tandem: tandem.createTandem('labelText')
          }, TEXT_OPTIONS)), measuringTapeIcon]
        }, HBOX_OPTIONS)),
        options: CHECKBOX_OPTIONS
      });
    }
    const options = optionize()({
      spacing: SPACING,
      align: 'left',
      bottom: -12,
      tandem: Tandem.REQUIRED
    }, providedOptions);
    super(items, options);
  }
}
gravityAndOrbits.register('CheckboxPanel', CheckboxPanel);
export default CheckboxPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJBcnJvd05vZGUiLCJNZWFzdXJpbmdUYXBlTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiY29sb3JQcm9maWxlUHJvcGVydHkiLCJIQm94IiwiSW1hZ2UiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVGV4dCIsIlRhbmRlbSIsImljb25NYXNzX3BuZyIsInBhdGhJY29uX3BuZyIsInBhdGhJY29uUHJvamVjdG9yX3BuZyIsImdyYXZpdHlBbmRPcmJpdHMiLCJHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncyIsIkdyYXZpdHlBbmRPcmJpdHNDb2xvcnMiLCJHcmlkTm9kZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiVmVydGljYWxDaGVja2JveEdyb3VwIiwiRk9OVCIsIkFSUk9XX1lfQ09PUkRJTkFURSIsIkNIRUNLQk9YX09QVElPTlMiLCJzY2FsZSIsImNoZWNrYm94Q29sb3IiLCJmb3JlZ3JvdW5kUHJvcGVydHkiLCJjaGVja2JveENvbG9yQmFja2dyb3VuZCIsImJhY2tncm91bmRQcm9wZXJ0eSIsIlRFWFRfT1BUSU9OUyIsImZvbnQiLCJmaWxsIiwiU1BBQ0lORyIsIkhCT1hfT1BUSU9OUyIsIm1heFdpZHRoIiwic3BhY2luZyIsIkNoZWNrYm94UGFuZWwiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwiaXRlbXMiLCJwcm9wZXJ0eSIsInNob3dHcmF2aXR5Rm9yY2VQcm9wZXJ0eSIsImNyZWF0ZU5vZGUiLCJ0YW5kZW0iLCJjaGlsZHJlbiIsImdyYXZpdHlGb3JjZVN0cmluZ1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwidGFuZGVtTmFtZSIsIm9wdGlvbnMiLCJzaG93VmVsb2NpdHlQcm9wZXJ0eSIsInZlbG9jaXR5U3RyaW5nUHJvcGVydHkiLCJWRUxPQ0lUWSIsInNob3dNYXNzQ2hlY2tib3giLCJwdXNoIiwic2hvd01hc3NQcm9wZXJ0eSIsIm1hc3NTdHJpbmdQcm9wZXJ0eSIsInBhdGhJY29uSW1hZ2VOb2RlIiwibGF6eUxpbmsiLCJwcm9maWxlTmFtZSIsImFzc2VydCIsIkRFRkFVTFRfQ09MT1JfUFJPRklMRSIsIlBST0pFQ1RPUl9DT0xPUl9QUk9GSUxFIiwic2V0SW1hZ2UiLCJzaG93UGF0aFByb3BlcnR5IiwicGF0aFN0cmluZ1Byb3BlcnR5Iiwic2hvd0dyaWRQcm9wZXJ0eSIsImdyaWRTdHJpbmdQcm9wZXJ0eSIsImNyZWF0ZUlkZW50aXR5Iiwic3Ryb2tlIiwiZ3JpZEljb25TdHJva2VDb2xvclByb3BlcnR5IiwibGluZVdpZHRoIiwic2hvd01lYXN1cmluZ1RhcGUiLCJtZWFzdXJpbmdUYXBlSWNvbiIsImNyZWF0ZUljb24iLCJzaG93TWVhc3VyaW5nVGFwZVByb3BlcnR5IiwiYWxpZ24iLCJtZWFzdXJpbmdUYXBlU3RyaW5nUHJvcGVydHkiLCJib3R0b20iLCJSRVFVSVJFRCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hlY2tib3hQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaXN1YWwgcmVwcmVzZW50YXRpb24gb2Ygc3BhY2Ugb2JqZWN0J3MgcHJvcGVydHkgY2hlY2tib3guXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IE1lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBjb2xvclByb2ZpbGVQcm9wZXJ0eSwgSEJveCwgSEJveE9wdGlvbnMsIEltYWdlLCBTY2VuZXJ5Q29uc3RhbnRzLCBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBpY29uTWFzc19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2ljb25NYXNzX3BuZy5qcyc7XHJcbmltcG9ydCBwYXRoSWNvbl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3BhdGhJY29uX3BuZy5qcyc7XHJcbmltcG9ydCBwYXRoSWNvblByb2plY3Rvcl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3BhdGhJY29uUHJvamVjdG9yX3BuZy5qcyc7XHJcbmltcG9ydCBncmF2aXR5QW5kT3JiaXRzIGZyb20gJy4uLy4uL2dyYXZpdHlBbmRPcmJpdHMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MgZnJvbSAnLi4vLi4vR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c0NvbG9ycyBmcm9tICcuLi9HcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmpzJztcclxuaW1wb3J0IEdyaWROb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmlkTm9kZS5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzTW9kZWwgZnJvbSAnLi4vbW9kZWwvR3Jhdml0eUFuZE9yYml0c01vZGVsLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVmVydGljYWxDaGVja2JveEdyb3VwLCB7IFZlcnRpY2FsQ2hlY2tib3hHcm91cEl0ZW0sIFZlcnRpY2FsQ2hlY2tib3hHcm91cE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVmVydGljYWxDaGVja2JveEdyb3VwLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGT05UID0gbmV3IFBoZXRGb250KCAxOCApO1xyXG5jb25zdCBBUlJPV19ZX0NPT1JESU5BVEUgPSAtMTA7XHJcbmNvbnN0IENIRUNLQk9YX09QVElPTlMgPSB7XHJcbiAgc2NhbGU6IDAuOCxcclxuICBjaGVja2JveENvbG9yOiBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmZvcmVncm91bmRQcm9wZXJ0eSxcclxuICBjaGVja2JveENvbG9yQmFja2dyb3VuZDogR3Jhdml0eUFuZE9yYml0c0NvbG9ycy5iYWNrZ3JvdW5kUHJvcGVydHlcclxufTtcclxuY29uc3QgVEVYVF9PUFRJT05TID0ge1xyXG4gIGZvbnQ6IEZPTlQsXHJcbiAgZmlsbDogR3Jhdml0eUFuZE9yYml0c0NvbG9ycy5mb3JlZ3JvdW5kUHJvcGVydHlcclxufTtcclxuXHJcbmNvbnN0IFNQQUNJTkcgPSAxMDtcclxuXHJcbmNvbnN0IEhCT1hfT1BUSU9OUyA9IHtcclxuICBtYXhXaWR0aDogMjQwLFxyXG4gIHNwYWNpbmc6IFNQQUNJTkdcclxufTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBDaGVja2JveFBhbmVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgVmVydGljYWxDaGVja2JveEdyb3VwT3B0aW9ucztcclxuXHJcbmNsYXNzIENoZWNrYm94UGFuZWwgZXh0ZW5kcyBWZXJ0aWNhbENoZWNrYm94R3JvdXAge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBHcmF2aXR5QW5kT3JiaXRzTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IENoZWNrYm94UGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGl0ZW1zOiBWZXJ0aWNhbENoZWNrYm94R3JvdXBJdGVtW10gPSBbIHtcclxuICAgICAgcHJvcGVydHk6IG1vZGVsLnNob3dHcmF2aXR5Rm9yY2VQcm9wZXJ0eSxcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBIQm94KCBtZXJnZSgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgVGV4dCggR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MuZ3Jhdml0eUZvcmNlU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPiggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICkgfSwgVEVYVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgIG5ldyBBcnJvd05vZGUoIDEzNSwgQVJST1dfWV9DT09SRElOQVRFLCAxODAsIEFSUk9XX1lfQ09PUkRJTkFURSwgeyBmaWxsOiAnIzQzODBDMicgfSApXHJcbiAgICAgICAgXVxyXG4gICAgICB9LCBIQk9YX09QVElPTlMgKSApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAnZ3Jhdml0eUZvcmNlQ2hlY2tib3gnLFxyXG4gICAgICBvcHRpb25zOiBDSEVDS0JPWF9PUFRJT05TXHJcbiAgICB9LCB7XHJcblxyXG4gICAgICAvLyB2ZWxvY2l0eSBjaGVja2JveFxyXG4gICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd1ZlbG9jaXR5UHJvcGVydHksXHJcbiAgICAgIGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgSEJveCggbWVyZ2UoIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IFRleHQoIEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLnZlbG9jaXR5U3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPiggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICkgfSwgVEVYVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgIG5ldyBBcnJvd05vZGUoIDk1LCBBUlJPV19ZX0NPT1JESU5BVEUsIDE0MCwgQVJST1dfWV9DT09SRElOQVRFLCB7IGZpbGw6IFBoZXRDb2xvclNjaGVtZS5WRUxPQ0lUWSB9IClcclxuICAgICAgICBdXHJcbiAgICAgIH0sIEhCT1hfT1BUSU9OUyApICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICd2ZWxvY2l0eUNoZWNrYm94JyxcclxuICAgICAgb3B0aW9uczogQ0hFQ0tCT1hfT1BUSU9OU1xyXG4gICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBtYXNzIGNoZWNrYm94XHJcbiAgICBpZiAoIG1vZGVsLnNob3dNYXNzQ2hlY2tib3ggKSB7XHJcbiAgICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd01hc3NQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnbWFzc0NoZWNrYm94JyxcclxuICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IEhCb3goIG1lcmdlKCB7XHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICBuZXcgVGV4dCggR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MubWFzc1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApIH0sIFRFWFRfT1BUSU9OUyApICksXHJcbiAgICAgICAgICAgIG5ldyBJbWFnZSggaWNvbk1hc3NfcG5nLCB7IHNjYWxlOiAwLjggfSApXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSwgSEJPWF9PUFRJT05TICkgKSxcclxuICAgICAgICBvcHRpb25zOiBDSEVDS0JPWF9PUFRJT05TXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXRoSWNvbkltYWdlTm9kZSA9IG5ldyBJbWFnZSggcGF0aEljb25fcG5nLCB7IHNjYWxlOiAwLjI1IH0gKTtcclxuICAgIGNvbG9yUHJvZmlsZVByb3BlcnR5LmxhenlMaW5rKCAoIHByb2ZpbGVOYW1lOiBzdHJpbmcgKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb2ZpbGVOYW1lID09PSBTY2VuZXJ5Q29uc3RhbnRzLkRFRkFVTFRfQ09MT1JfUFJPRklMRSB8fCBwcm9maWxlTmFtZSA9PT0gU2NlbmVyeUNvbnN0YW50cy5QUk9KRUNUT1JfQ09MT1JfUFJPRklMRSApO1xyXG4gICAgICBwYXRoSWNvbkltYWdlTm9kZS5zZXRJbWFnZSggcHJvZmlsZU5hbWUgPT09IFNjZW5lcnlDb25zdGFudHMuUFJPSkVDVE9SX0NPTE9SX1BST0ZJTEUgPyBwYXRoSWNvblByb2plY3Rvcl9wbmcgOiBwYXRoSWNvbl9wbmcgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwYXRoIGNoZWNrYm94XHJcbiAgICBpdGVtcy5wdXNoKCB7XHJcbiAgICAgIHByb3BlcnR5OiBtb2RlbC5zaG93UGF0aFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW1OYW1lOiAncGF0aENoZWNrYm94JyxcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBIQm94KCBtZXJnZSgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgVGV4dCggR3Jhdml0eUFuZE9yYml0c1N0cmluZ3MucGF0aFN0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApIH0sIFRFWFRfT1BUSU9OUyApICksXHJcbiAgICAgICAgICBwYXRoSWNvbkltYWdlTm9kZVxyXG4gICAgICAgIF1cclxuICAgICAgfSwgSEJPWF9PUFRJT05TICkgKSxcclxuICAgICAgb3B0aW9uczogQ0hFQ0tCT1hfT1BUSU9OU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGdyaWQgY2hlY2tib3hcclxuICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgcHJvcGVydHk6IG1vZGVsLnNob3dHcmlkUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdncmlkQ2hlY2tib3gnLFxyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IEhCb3goIG1lcmdlKCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBUZXh0KCBHcmF2aXR5QW5kT3JiaXRzU3RyaW5ncy5ncmlkU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPiggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICkgfSwgVEVYVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgIG5ldyBHcmlkTm9kZSggbmV3IFByb3BlcnR5KCBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCkgKSwgMTAsIG5ldyBWZWN0b3IyKCAwLCAwICksIDEsIHtcclxuICAgICAgICAgICAgc3Ryb2tlOiBHcmF2aXR5QW5kT3JiaXRzQ29sb3JzLmdyaWRJY29uU3Ryb2tlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiAxLjVcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIF1cclxuICAgICAgfSwgSEJPWF9PUFRJT05TICkgKSxcclxuICAgICAgb3B0aW9uczogQ0hFQ0tCT1hfT1BUSU9OU1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1lYXN1cmluZyB0YXBlIGNoZWNrYm94XHJcbiAgICBpZiAoIG1vZGVsLnNob3dNZWFzdXJpbmdUYXBlICkge1xyXG4gICAgICBjb25zdCBtZWFzdXJpbmdUYXBlSWNvbiA9IE1lYXN1cmluZ1RhcGVOb2RlLmNyZWF0ZUljb24oIHsgc2NhbGU6IDAuNCB9ICk7XHJcbiAgICAgIGl0ZW1zLnB1c2goIHtcclxuICAgICAgICBwcm9wZXJ0eTogbW9kZWwuc2hvd01lYXN1cmluZ1RhcGVQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnbWVhc3VyaW5nVGFwZUNoZWNrYm94JyxcclxuICAgICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gbmV3IEhCb3goIGNvbWJpbmVPcHRpb25zPEhCb3hPcHRpb25zPigge1xyXG4gICAgICAgICAgYWxpZ246ICd0b3AnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IFRleHQoIEdyYXZpdHlBbmRPcmJpdHNTdHJpbmdzLm1lYXN1cmluZ1RhcGVTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKSB9LCBURVhUX09QVElPTlMgKSApLFxyXG4gICAgICAgICAgICBtZWFzdXJpbmdUYXBlSWNvblxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0sIEhCT1hfT1BUSU9OUyApICksXHJcbiAgICAgICAgb3B0aW9uczogQ0hFQ0tCT1hfT1BUSU9OU1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDaGVja2JveFBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFZlcnRpY2FsQ2hlY2tib3hHcm91cE9wdGlvbnM+KCkoIHtcclxuICAgICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgYm90dG9tOiAtMTIsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBpdGVtcywgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ0NoZWNrYm94UGFuZWwnLCBDaGVja2JveFBhbmVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94UGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsaUJBQWlCLE1BQU0sa0RBQWtEO0FBQ2hGLE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxvQkFBb0IsRUFBRUMsSUFBSSxFQUFlQyxLQUFLLEVBQUVDLGdCQUFnQixFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUN2SSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFlBQVksTUFBTSxpQ0FBaUM7QUFDMUQsT0FBT0MsWUFBWSxNQUFNLGlDQUFpQztBQUMxRCxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFP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