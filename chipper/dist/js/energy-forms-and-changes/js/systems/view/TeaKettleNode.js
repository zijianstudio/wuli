// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery Node that depicts a tea kettle on a burner
 *
 * @author John Blanco
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import HeaterCoolerBack from '../../../../scenery-phet/js/HeaterCoolerBack.js';
import HeaterCoolerFront from '../../../../scenery-phet/js/HeaterCoolerFront.js';
import { Image, Node } from '../../../../scenery/js/imports.js';
import gasPipeSystemsLong_png from '../../../images/gasPipeSystemsLong_png.js';
import gasPipeSystemsShort_png from '../../../images/gasPipeSystemsShort_png.js';
import teaKettle_png from '../../../images/teaKettle_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import BurnerStandNode from '../../common/view/BurnerStandNode.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';
import TeaKettleSteamCanvasNode from './TeaKettleSteamCanvasNode.js';

// constants
const BURNER_MODEL_BOUNDS = new Bounds2(-0.037, -0.0075, 0.037, 0.0525); // in meters
const BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
const HEATER_COOLER_NODE_SCALE = 0.85; // empirically determined for best look

class TeaKettleNode extends MoveFadeModelElementNode {
  /**
   * @param {TeaKettle} teaKettle
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(teaKettle, energyChunksVisibleProperty, modelViewTransform, tandem) {
    super(teaKettle, modelViewTransform, tandem);
    const teaKettleNode = new Image(teaKettle_png, {
      right: 114,
      bottom: 53
    });

    // create a mapping between the slider position and the steam proportion, which prevents very small values
    this.heaterSettingProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: tandem.createTandem('heaterSettingProperty')
    });
    this.heaterSettingProperty.link(setting => {
      const mappedSetting = setting === 0 ? 0 : 0.25 + setting * 0.75;
      teaKettle.heatProportionProperty.set(mappedSetting);
    });

    // node for heater-cooler bucket - front and back are added separately to support layering of energy chunks
    const heaterCoolerBack = new HeaterCoolerBack(this.heaterSettingProperty, {
      scale: HEATER_COOLER_NODE_SCALE
    });
    const heaterCoolerFront = new HeaterCoolerFront(this.heaterSettingProperty, {
      snapToZero: false,
      coolEnabled: false,
      scale: HEATER_COOLER_NODE_SCALE,
      linkHeaterCoolerBack: heaterCoolerBack,
      tandem: tandem.createTandem('heaterCoolerNode'),
      heaterCoolerBack: heaterCoolerBack
    });

    // burner stand node
    const burnerSize = modelViewTransform.modelToViewShape(BURNER_MODEL_BOUNDS);
    const burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
    const burnerStandNode = new BurnerStandNode(burnerSize, burnerProjection);
    burnerStandNode.centerTop = teaKettleNode.centerBottom.plus(new Vector2(0, -teaKettleNode.height / 4));
    heaterCoolerBack.centerX = burnerStandNode.centerX;
    heaterCoolerBack.bottom = burnerStandNode.bottom - burnerProjection / 2;
    heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();
    const gasPipeScale = 0.9;

    // create the left part of the gas pipe that connects to the heater cooler node. while it appears to be one pipe,
    // it's created as two separate nodes so that once part is behind the burner stand and one part is in front of the
    // the burner stand (to avoid splitting the burner stand into even more pieces). this is the part that's behind the
    // front of the burner stand. See https://github.com/phetsims/energy-forms-and-changes/issues/311
    const leftGasPipe = new Image(gasPipeSystemsLong_png, {
      right: heaterCoolerFront.left - 30,
      // empirically determined
      bottom: heaterCoolerFront.bottom - 20,
      // empirically determined
      scale: gasPipeScale
    });

    // create the right part of the gas pipe that connects to the heater cooler node. this is a shorter segment that
    // goes in front of the burner stand but behind the heater cooler node.
    const rightGasPipe = new Image(gasPipeSystemsShort_png, {
      left: leftGasPipe.right - 1,
      centerY: leftGasPipe.centerY,
      scale: gasPipeScale
    });

    // since the gas pipes are part of the heater/coolers, link their NodeIO Properties to listen to the heater/cooler's
    // NodeIO Properties
    heaterCoolerFront.opacityProperty.lazyLink(() => {
      leftGasPipe.opacity = heaterCoolerFront.opacity;
      rightGasPipe.opacity = heaterCoolerFront.opacity;
    });
    heaterCoolerFront.pickableProperty.lazyLink(() => {
      leftGasPipe.pickable = heaterCoolerFront.pickable;
      rightGasPipe.pickable = heaterCoolerFront.pickable;
    });
    heaterCoolerFront.visibleProperty.lazyLink(() => {
      leftGasPipe.visible = heaterCoolerFront.visible;
      rightGasPipe.visible = heaterCoolerFront.visible;
    });
    const energyChunkLayer = new EnergyChunkLayer(teaKettle.energyChunkList, modelViewTransform, {
      parentPositionProperty: teaKettle.positionProperty
    });

    // create steam node
    const spoutExitPosition = new Vector2(teaKettleNode.bounds.maxX - 4.5, teaKettleNode.bounds.minY + 16);
    this.steamCanvasNode = new TeaKettleSteamCanvasNode(spoutExitPosition, teaKettle.energyProductionRateProperty, EFACConstants.MAX_ENERGY_PRODUCTION_RATE, {
      canvasBounds: new Bounds2(-EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2, -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY, EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2, EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY)
    });
    this.addChild(heaterCoolerBack);
    this.addChild(energyChunkLayer);
    this.addChild(leftGasPipe);

    // create a separate layer for the tea kettle, stand, and steam, which all become transparent when energy chunks
    // are turned on. the steam canvas node does not like its opacity to be set when it's not rendering anything, but
    // setting the opacity of its parent node is allowed.
    const kettleAndStand = new Node();
    kettleAndStand.addChild(burnerStandNode);
    kettleAndStand.addChild(this.steamCanvasNode);
    kettleAndStand.addChild(teaKettleNode);
    this.addChild(kettleAndStand);
    this.addChild(rightGasPipe);
    this.addChild(heaterCoolerFront);

    // make the tea kettle, stand, and steam transparent when energy chunks are visible
    energyChunksVisibleProperty.link(chunksVisible => {
      kettleAndStand.setOpacity(chunksVisible ? 0.7 : 1);
    });

    // reset the heater slider and clear the steam node when the tea kettle is deactivated
    teaKettle.activeProperty.link(active => {
      if (!active) {
        this.heaterSettingProperty.reset();
        this.steamCanvasNode.reset();
      }
    });
  }

  /**
   * step function for the steam
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.steamCanvasNode.step(dt);
  }

  /**
   * @public
   */
  reset() {
    this.steamCanvasNode.reset();
  }
}
energyFormsAndChanges.register('TeaKettleNode', TeaKettleNode);
export default TeaKettleNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIlZlY3RvcjIiLCJIZWF0ZXJDb29sZXJCYWNrIiwiSGVhdGVyQ29vbGVyRnJvbnQiLCJJbWFnZSIsIk5vZGUiLCJnYXNQaXBlU3lzdGVtc0xvbmdfcG5nIiwiZ2FzUGlwZVN5c3RlbXNTaG9ydF9wbmciLCJ0ZWFLZXR0bGVfcG5nIiwiRUZBQ0NvbnN0YW50cyIsIkJ1cm5lclN0YW5kTm9kZSIsIkVuZXJneUNodW5rTGF5ZXIiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJNb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUiLCJUZWFLZXR0bGVTdGVhbUNhbnZhc05vZGUiLCJCVVJORVJfTU9ERUxfQk9VTkRTIiwiQlVSTkVSX0VER0VfVE9fSEVJR0hUX1JBVElPIiwiSEVBVEVSX0NPT0xFUl9OT0RFX1NDQUxFIiwiVGVhS2V0dGxlTm9kZSIsImNvbnN0cnVjdG9yIiwidGVhS2V0dGxlIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidGFuZGVtIiwidGVhS2V0dGxlTm9kZSIsInJpZ2h0IiwiYm90dG9tIiwiaGVhdGVyU2V0dGluZ1Byb3BlcnR5IiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJsaW5rIiwic2V0dGluZyIsIm1hcHBlZFNldHRpbmciLCJoZWF0UHJvcG9ydGlvblByb3BlcnR5Iiwic2V0IiwiaGVhdGVyQ29vbGVyQmFjayIsInNjYWxlIiwiaGVhdGVyQ29vbGVyRnJvbnQiLCJzbmFwVG9aZXJvIiwiY29vbEVuYWJsZWQiLCJsaW5rSGVhdGVyQ29vbGVyQmFjayIsImJ1cm5lclNpemUiLCJtb2RlbFRvVmlld1NoYXBlIiwiYnVybmVyUHJvamVjdGlvbiIsIndpZHRoIiwiYnVybmVyU3RhbmROb2RlIiwiY2VudGVyVG9wIiwiY2VudGVyQm90dG9tIiwicGx1cyIsImhlaWdodCIsImNlbnRlclgiLCJsZWZ0VG9wIiwiZ2V0SGVhdGVyRnJvbnRQb3NpdGlvbiIsImdhc1BpcGVTY2FsZSIsImxlZnRHYXNQaXBlIiwibGVmdCIsInJpZ2h0R2FzUGlwZSIsImNlbnRlclkiLCJvcGFjaXR5UHJvcGVydHkiLCJsYXp5TGluayIsIm9wYWNpdHkiLCJwaWNrYWJsZVByb3BlcnR5IiwicGlja2FibGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJ2aXNpYmxlIiwiZW5lcmd5Q2h1bmtMYXllciIsImVuZXJneUNodW5rTGlzdCIsInBhcmVudFBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvblByb3BlcnR5Iiwic3BvdXRFeGl0UG9zaXRpb24iLCJib3VuZHMiLCJtYXhYIiwibWluWSIsInN0ZWFtQ2FudmFzTm9kZSIsImVuZXJneVByb2R1Y3Rpb25SYXRlUHJvcGVydHkiLCJNQVhfRU5FUkdZX1BST0RVQ1RJT05fUkFURSIsImNhbnZhc0JvdW5kcyIsIlNDUkVFTl9MQVlPVVRfQk9VTkRTIiwibWF4WSIsImFkZENoaWxkIiwia2V0dGxlQW5kU3RhbmQiLCJjaHVua3NWaXNpYmxlIiwic2V0T3BhY2l0eSIsImFjdGl2ZVByb3BlcnR5IiwiYWN0aXZlIiwicmVzZXQiLCJzdGVwIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRlYUtldHRsZU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSBTY2VuZXJ5IE5vZGUgdGhhdCBkZXBpY3RzIGEgdGVhIGtldHRsZSBvbiBhIGJ1cm5lclxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBIZWF0ZXJDb29sZXJCYWNrIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9IZWF0ZXJDb29sZXJCYWNrLmpzJztcclxuaW1wb3J0IEhlYXRlckNvb2xlckZyb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9IZWF0ZXJDb29sZXJGcm9udC5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdhc1BpcGVTeXN0ZW1zTG9uZ19wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2dhc1BpcGVTeXN0ZW1zTG9uZ19wbmcuanMnO1xyXG5pbXBvcnQgZ2FzUGlwZVN5c3RlbXNTaG9ydF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2dhc1BpcGVTeXN0ZW1zU2hvcnRfcG5nLmpzJztcclxuaW1wb3J0IHRlYUtldHRsZV9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL3RlYUtldHRsZV9wbmcuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCdXJuZXJTdGFuZE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQnVybmVyU3RhbmROb2RlLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rTGF5ZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRW5lcmd5Q2h1bmtMYXllci5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuaW1wb3J0IE1vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZSBmcm9tICcuL01vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZS5qcyc7XHJcbmltcG9ydCBUZWFLZXR0bGVTdGVhbUNhbnZhc05vZGUgZnJvbSAnLi9UZWFLZXR0bGVTdGVhbUNhbnZhc05vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEJVUk5FUl9NT0RFTF9CT1VORFMgPSBuZXcgQm91bmRzMiggLTAuMDM3LCAtMC4wMDc1LCAwLjAzNywgMC4wNTI1ICk7IC8vIGluIG1ldGVyc1xyXG5jb25zdCBCVVJORVJfRURHRV9UT19IRUlHSFRfUkFUSU8gPSAwLjI7IC8vIG11bHRpcGxpZXIgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBmb3IgYmVzdCBsb29rXHJcbmNvbnN0IEhFQVRFUl9DT09MRVJfTk9ERV9TQ0FMRSA9IDAuODU7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgZm9yIGJlc3QgbG9va1xyXG5cclxuY2xhc3MgVGVhS2V0dGxlTm9kZSBleHRlbmRzIE1vdmVGYWRlTW9kZWxFbGVtZW50Tm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGVhS2V0dGxlfSB0ZWFLZXR0bGVcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRlYUtldHRsZSwgZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB0ZWFLZXR0bGUsIG1vZGVsVmlld1RyYW5zZm9ybSwgdGFuZGVtICk7XHJcblxyXG4gICAgY29uc3QgdGVhS2V0dGxlTm9kZSA9IG5ldyBJbWFnZSggdGVhS2V0dGxlX3BuZywgeyByaWdodDogMTE0LCBib3R0b206IDUzIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBtYXBwaW5nIGJldHdlZW4gdGhlIHNsaWRlciBwb3NpdGlvbiBhbmQgdGhlIHN0ZWFtIHByb3BvcnRpb24sIHdoaWNoIHByZXZlbnRzIHZlcnkgc21hbGwgdmFsdWVzXHJcbiAgICB0aGlzLmhlYXRlclNldHRpbmdQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hlYXRlclNldHRpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5oZWF0ZXJTZXR0aW5nUHJvcGVydHkubGluayggc2V0dGluZyA9PiB7XHJcbiAgICAgIGNvbnN0IG1hcHBlZFNldHRpbmcgPSBzZXR0aW5nID09PSAwID8gMCA6IDAuMjUgKyAoIHNldHRpbmcgKiAwLjc1ICk7XHJcbiAgICAgIHRlYUtldHRsZS5oZWF0UHJvcG9ydGlvblByb3BlcnR5LnNldCggbWFwcGVkU2V0dGluZyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG5vZGUgZm9yIGhlYXRlci1jb29sZXIgYnVja2V0IC0gZnJvbnQgYW5kIGJhY2sgYXJlIGFkZGVkIHNlcGFyYXRlbHkgdG8gc3VwcG9ydCBsYXllcmluZyBvZiBlbmVyZ3kgY2h1bmtzXHJcbiAgICBjb25zdCBoZWF0ZXJDb29sZXJCYWNrID0gbmV3IEhlYXRlckNvb2xlckJhY2soIHRoaXMuaGVhdGVyU2V0dGluZ1Byb3BlcnR5LCB7IHNjYWxlOiBIRUFURVJfQ09PTEVSX05PREVfU0NBTEUgfSApO1xyXG4gICAgY29uc3QgaGVhdGVyQ29vbGVyRnJvbnQgPSBuZXcgSGVhdGVyQ29vbGVyRnJvbnQoIHRoaXMuaGVhdGVyU2V0dGluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHNuYXBUb1plcm86IGZhbHNlLFxyXG4gICAgICBjb29sRW5hYmxlZDogZmFsc2UsXHJcbiAgICAgIHNjYWxlOiBIRUFURVJfQ09PTEVSX05PREVfU0NBTEUsXHJcbiAgICAgIGxpbmtIZWF0ZXJDb29sZXJCYWNrOiBoZWF0ZXJDb29sZXJCYWNrLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdoZWF0ZXJDb29sZXJOb2RlJyApLFxyXG4gICAgICBoZWF0ZXJDb29sZXJCYWNrOiBoZWF0ZXJDb29sZXJCYWNrXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYnVybmVyIHN0YW5kIG5vZGVcclxuICAgIGNvbnN0IGJ1cm5lclNpemUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggQlVSTkVSX01PREVMX0JPVU5EUyApO1xyXG4gICAgY29uc3QgYnVybmVyUHJvamVjdGlvbiA9IGJ1cm5lclNpemUud2lkdGggKiBCVVJORVJfRURHRV9UT19IRUlHSFRfUkFUSU87XHJcbiAgICBjb25zdCBidXJuZXJTdGFuZE5vZGUgPSBuZXcgQnVybmVyU3RhbmROb2RlKCBidXJuZXJTaXplLCBidXJuZXJQcm9qZWN0aW9uICk7XHJcblxyXG4gICAgYnVybmVyU3RhbmROb2RlLmNlbnRlclRvcCA9IHRlYUtldHRsZU5vZGUuY2VudGVyQm90dG9tLnBsdXMoIG5ldyBWZWN0b3IyKCAwLCAtdGVhS2V0dGxlTm9kZS5oZWlnaHQgLyA0ICkgKTtcclxuICAgIGhlYXRlckNvb2xlckJhY2suY2VudGVyWCA9IGJ1cm5lclN0YW5kTm9kZS5jZW50ZXJYO1xyXG4gICAgaGVhdGVyQ29vbGVyQmFjay5ib3R0b20gPSBidXJuZXJTdGFuZE5vZGUuYm90dG9tIC0gYnVybmVyUHJvamVjdGlvbiAvIDI7XHJcbiAgICBoZWF0ZXJDb29sZXJGcm9udC5sZWZ0VG9wID0gaGVhdGVyQ29vbGVyQmFjay5nZXRIZWF0ZXJGcm9udFBvc2l0aW9uKCk7XHJcblxyXG4gICAgY29uc3QgZ2FzUGlwZVNjYWxlID0gMC45O1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgbGVmdCBwYXJ0IG9mIHRoZSBnYXMgcGlwZSB0aGF0IGNvbm5lY3RzIHRvIHRoZSBoZWF0ZXIgY29vbGVyIG5vZGUuIHdoaWxlIGl0IGFwcGVhcnMgdG8gYmUgb25lIHBpcGUsXHJcbiAgICAvLyBpdCdzIGNyZWF0ZWQgYXMgdHdvIHNlcGFyYXRlIG5vZGVzIHNvIHRoYXQgb25jZSBwYXJ0IGlzIGJlaGluZCB0aGUgYnVybmVyIHN0YW5kIGFuZCBvbmUgcGFydCBpcyBpbiBmcm9udCBvZiB0aGVcclxuICAgIC8vIHRoZSBidXJuZXIgc3RhbmQgKHRvIGF2b2lkIHNwbGl0dGluZyB0aGUgYnVybmVyIHN0YW5kIGludG8gZXZlbiBtb3JlIHBpZWNlcykuIHRoaXMgaXMgdGhlIHBhcnQgdGhhdCdzIGJlaGluZCB0aGVcclxuICAgIC8vIGZyb250IG9mIHRoZSBidXJuZXIgc3RhbmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8zMTFcclxuICAgIGNvbnN0IGxlZnRHYXNQaXBlID0gbmV3IEltYWdlKCBnYXNQaXBlU3lzdGVtc0xvbmdfcG5nLCB7XHJcbiAgICAgIHJpZ2h0OiBoZWF0ZXJDb29sZXJGcm9udC5sZWZ0IC0gMzAsIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgYm90dG9tOiBoZWF0ZXJDb29sZXJGcm9udC5ib3R0b20gLSAyMCwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICBzY2FsZTogZ2FzUGlwZVNjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSByaWdodCBwYXJ0IG9mIHRoZSBnYXMgcGlwZSB0aGF0IGNvbm5lY3RzIHRvIHRoZSBoZWF0ZXIgY29vbGVyIG5vZGUuIHRoaXMgaXMgYSBzaG9ydGVyIHNlZ21lbnQgdGhhdFxyXG4gICAgLy8gZ29lcyBpbiBmcm9udCBvZiB0aGUgYnVybmVyIHN0YW5kIGJ1dCBiZWhpbmQgdGhlIGhlYXRlciBjb29sZXIgbm9kZS5cclxuICAgIGNvbnN0IHJpZ2h0R2FzUGlwZSA9IG5ldyBJbWFnZSggZ2FzUGlwZVN5c3RlbXNTaG9ydF9wbmcsIHtcclxuICAgICAgbGVmdDogbGVmdEdhc1BpcGUucmlnaHQgLSAxLFxyXG4gICAgICBjZW50ZXJZOiBsZWZ0R2FzUGlwZS5jZW50ZXJZLFxyXG4gICAgICBzY2FsZTogZ2FzUGlwZVNjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc2luY2UgdGhlIGdhcyBwaXBlcyBhcmUgcGFydCBvZiB0aGUgaGVhdGVyL2Nvb2xlcnMsIGxpbmsgdGhlaXIgTm9kZUlPIFByb3BlcnRpZXMgdG8gbGlzdGVuIHRvIHRoZSBoZWF0ZXIvY29vbGVyJ3NcclxuICAgIC8vIE5vZGVJTyBQcm9wZXJ0aWVzXHJcbiAgICBoZWF0ZXJDb29sZXJGcm9udC5vcGFjaXR5UHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgbGVmdEdhc1BpcGUub3BhY2l0eSA9IGhlYXRlckNvb2xlckZyb250Lm9wYWNpdHk7XHJcbiAgICAgIHJpZ2h0R2FzUGlwZS5vcGFjaXR5ID0gaGVhdGVyQ29vbGVyRnJvbnQub3BhY2l0eTtcclxuICAgIH0gKTtcclxuICAgIGhlYXRlckNvb2xlckZyb250LnBpY2thYmxlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgbGVmdEdhc1BpcGUucGlja2FibGUgPSBoZWF0ZXJDb29sZXJGcm9udC5waWNrYWJsZTtcclxuICAgICAgcmlnaHRHYXNQaXBlLnBpY2thYmxlID0gaGVhdGVyQ29vbGVyRnJvbnQucGlja2FibGU7XHJcbiAgICB9ICk7XHJcbiAgICBoZWF0ZXJDb29sZXJGcm9udC52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgbGVmdEdhc1BpcGUudmlzaWJsZSA9IGhlYXRlckNvb2xlckZyb250LnZpc2libGU7XHJcbiAgICAgIHJpZ2h0R2FzUGlwZS52aXNpYmxlID0gaGVhdGVyQ29vbGVyRnJvbnQudmlzaWJsZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlbmVyZ3lDaHVua0xheWVyID0gbmV3IEVuZXJneUNodW5rTGF5ZXIoXHJcbiAgICAgIHRlYUtldHRsZS5lbmVyZ3lDaHVua0xpc3QsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgeyBwYXJlbnRQb3NpdGlvblByb3BlcnR5OiB0ZWFLZXR0bGUucG9zaXRpb25Qcm9wZXJ0eSB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBzdGVhbSBub2RlXHJcbiAgICBjb25zdCBzcG91dEV4aXRQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCB0ZWFLZXR0bGVOb2RlLmJvdW5kcy5tYXhYIC0gNC41LCB0ZWFLZXR0bGVOb2RlLmJvdW5kcy5taW5ZICsgMTYgKTtcclxuICAgIHRoaXMuc3RlYW1DYW52YXNOb2RlID0gbmV3IFRlYUtldHRsZVN0ZWFtQ2FudmFzTm9kZShcclxuICAgICAgc3BvdXRFeGl0UG9zaXRpb24sXHJcbiAgICAgIHRlYUtldHRsZS5lbmVyZ3lQcm9kdWN0aW9uUmF0ZVByb3BlcnR5LFxyXG4gICAgICBFRkFDQ29uc3RhbnRzLk1BWF9FTkVSR1lfUFJPRFVDVElPTl9SQVRFLCB7XHJcbiAgICAgICAgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMihcclxuICAgICAgICAgIC1FRkFDQ29uc3RhbnRzLlNDUkVFTl9MQVlPVVRfQk9VTkRTLm1heFggLyAyLFxyXG4gICAgICAgICAgLUVGQUNDb25zdGFudHMuU0NSRUVOX0xBWU9VVF9CT1VORFMubWF4WSxcclxuICAgICAgICAgIEVGQUNDb25zdGFudHMuU0NSRUVOX0xBWU9VVF9CT1VORFMubWF4WCAvIDIsXHJcbiAgICAgICAgICBFRkFDQ29uc3RhbnRzLlNDUkVFTl9MQVlPVVRfQk9VTkRTLm1heFlcclxuICAgICAgICApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBoZWF0ZXJDb29sZXJCYWNrICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlbmVyZ3lDaHVua0xheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsZWZ0R2FzUGlwZSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIHNlcGFyYXRlIGxheWVyIGZvciB0aGUgdGVhIGtldHRsZSwgc3RhbmQsIGFuZCBzdGVhbSwgd2hpY2ggYWxsIGJlY29tZSB0cmFuc3BhcmVudCB3aGVuIGVuZXJneSBjaHVua3NcclxuICAgIC8vIGFyZSB0dXJuZWQgb24uIHRoZSBzdGVhbSBjYW52YXMgbm9kZSBkb2VzIG5vdCBsaWtlIGl0cyBvcGFjaXR5IHRvIGJlIHNldCB3aGVuIGl0J3Mgbm90IHJlbmRlcmluZyBhbnl0aGluZywgYnV0XHJcbiAgICAvLyBzZXR0aW5nIHRoZSBvcGFjaXR5IG9mIGl0cyBwYXJlbnQgbm9kZSBpcyBhbGxvd2VkLlxyXG4gICAgY29uc3Qga2V0dGxlQW5kU3RhbmQgPSBuZXcgTm9kZSgpO1xyXG4gICAga2V0dGxlQW5kU3RhbmQuYWRkQ2hpbGQoIGJ1cm5lclN0YW5kTm9kZSApO1xyXG4gICAga2V0dGxlQW5kU3RhbmQuYWRkQ2hpbGQoIHRoaXMuc3RlYW1DYW52YXNOb2RlICk7XHJcbiAgICBrZXR0bGVBbmRTdGFuZC5hZGRDaGlsZCggdGVhS2V0dGxlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCgga2V0dGxlQW5kU3RhbmQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJpZ2h0R2FzUGlwZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggaGVhdGVyQ29vbGVyRnJvbnQgKTtcclxuXHJcbiAgICAvLyBtYWtlIHRoZSB0ZWEga2V0dGxlLCBzdGFuZCwgYW5kIHN0ZWFtIHRyYW5zcGFyZW50IHdoZW4gZW5lcmd5IGNodW5rcyBhcmUgdmlzaWJsZVxyXG4gICAgZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGNodW5rc1Zpc2libGUgPT4ge1xyXG4gICAgICBrZXR0bGVBbmRTdGFuZC5zZXRPcGFjaXR5KCBjaHVua3NWaXNpYmxlID8gMC43IDogMSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJlc2V0IHRoZSBoZWF0ZXIgc2xpZGVyIGFuZCBjbGVhciB0aGUgc3RlYW0gbm9kZSB3aGVuIHRoZSB0ZWEga2V0dGxlIGlzIGRlYWN0aXZhdGVkXHJcbiAgICB0ZWFLZXR0bGUuYWN0aXZlUHJvcGVydHkubGluayggYWN0aXZlID0+IHtcclxuICAgICAgaWYgKCAhYWN0aXZlICkge1xyXG4gICAgICAgIHRoaXMuaGVhdGVyU2V0dGluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5zdGVhbUNhbnZhc05vZGUucmVzZXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCBmdW5jdGlvbiBmb3IgdGhlIHN0ZWFtXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5zdGVhbUNhbnZhc05vZGUuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuc3RlYW1DYW52YXNOb2RlLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdUZWFLZXR0bGVOb2RlJywgVGVhS2V0dGxlTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBUZWFLZXR0bGVOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGdCQUFnQixNQUFNLGlEQUFpRDtBQUM5RSxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLHNCQUFzQixNQUFNLDJD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