// Copyright 2016-2022, University of Colorado Boulder

/**
 * main view for the 'Systems' screen of the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import SkyNode from '../../common/view/SkyNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import BeakerHeaterNode from './BeakerHeaterNode.js';
import BeltNode from './BeltNode.js';
import BikerNode from './BikerNode.js';
import EnergyChunkLegend from './EnergyChunkLegend.js';
import EnergySystemElementSelector from './EnergySystemElementSelector.js';
import FanNode from './FanNode.js';
import FaucetAndWaterNode from './FaucetAndWaterNode.js';
import GeneratorNode from './GeneratorNode.js';
import LightBulbNode from './LightBulbNode.js';
import SolarPanelNode from './SolarPanelNode.js';
import SunNode from './SunNode.js';
import TeaKettleNode from './TeaKettleNode.js';
const energySymbolsString = EnergyFormsAndChangesStrings.energySymbols;

// constants
const EDGE_INSET = 10; // screen edge padding, in screen coordinates
const SELECTOR_SPACING = 82; // space between energy system selector panel, in screen coordinates
const BOTTOM_CONTROL_PANEL_HEIGHT = 49; // manually coordinated to match similar panel on 1st screen

class SystemsScreenView extends ScreenView {
  /**
   * @param {SystemsModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // tandems to nest energy systems in Studio
    const energySourcesTandem = tandem.createTandem('energySources');
    const energyConvertersTandem = tandem.createTandem('energyConverters');
    const energyUsersTandem = tandem.createTandem('energyUsers');

    // @private {SystemsModel}
    this.model = model;

    // pdom - the screen summary to be read by assistive technology
    this.addChild(new Node({
      tagName: 'div',
      innerContent: EnergyFormsAndChangesStrings.a11y.systemsScreenInteractionHint,
      descriptionContent: EnergyFormsAndChangesStrings.a11y.systemsScreenSummaryDescription
    }));

    // pdom - a description of the current configuration of the energy system to be read by assistive technology
    const energySystemConfigDescription = new Node({
      tagName: 'h3',
      innerContent: EnergyFormsAndChangesStrings.a11y.energySystem,
      descriptionContent: EnergyFormsAndChangesStrings.a11y.energySystemHelpText
    });
    this.addChild(energySystemConfigDescription);

    // update the a11y description as the selected element changes
    Multilink.multilink([model.energySourcesCarousel.targetElementNameProperty, model.energyConvertersCarousel.targetElementNameProperty, model.energyUsersCarousel.targetElementNameProperty], () => {
      const energySource = model.energySourcesCarousel.getSelectedElement();
      const energyConverter = model.energyConvertersCarousel.getSelectedElement();
      const energyUser = model.energyUsersCarousel.getSelectedElement();
      assert && assert(energySource.a11yName, 'the selected element has no accessibility name specified');
      energySystemConfigDescription.descriptionContent = StringUtils.fillIn(EnergyFormsAndChangesStrings.a11y.energySystemHelpText, {
        producer: energySource.a11yName,
        converter: energyConverter.a11yName,
        user: energyUser.a11yName
      });
    });

    // convenience variable
    const layoutBounds = this.layoutBounds;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is on the
    // middle of the screen above the counter as located in the view. Final arg is zoom factor from original Java sim -
    // smaller zooms out, larger zooms in.
    const mvtOriginX = Utils.roundSymmetric(layoutBounds.width * 0.5);
    const mvtOriginY = Utils.roundSymmetric(layoutBounds.height * 0.475);
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(mvtOriginX, mvtOriginY), EFACConstants.SYSTEMS_MVT_SCALE_FACTOR);

    // create the energy user nodes

    // @private
    this.beakerHeaterNode = new BeakerHeaterNode(model.beakerHeater, model.energyChunksVisibleProperty, modelViewTransform, energyUsersTandem.createTandem('beakerHeaterNode'));
    const incandescentBulbNode = new LightBulbNode(model.incandescentBulb, model.energyChunksVisibleProperty, modelViewTransform, {
      bulbType: 'incandescent',
      tandem: energyUsersTandem.createTandem('incandescentBulbNode')
    });
    const fluorescentBulbNode = new LightBulbNode(model.fluorescentBulb, model.energyChunksVisibleProperty, modelViewTransform, {
      bulbType: 'fluorescent',
      tandem: energyUsersTandem.createTandem('fluorescentBulbNode')
    });
    const fanNode = new FanNode(model.fan, model.energyChunksVisibleProperty, modelViewTransform, energyUsersTandem.createTandem('fanNode'));
    this.addChild(this.beakerHeaterNode);
    this.addChild(incandescentBulbNode);
    this.addChild(fluorescentBulbNode);
    this.addChild(fanNode);

    // create the energy converter nodes
    const generatorNode = new GeneratorNode(model.generator, modelViewTransform, {
      addMechanicalEnergyChunkLayer: false,
      tandem: energyConvertersTandem.createTandem('generatorNode')
    });
    const beltNode = new BeltNode(model.belt, modelViewTransform, {
      tandem: energyConvertersTandem.createTandem('beltNode'),
      phetioReadOnly: true
    });
    const solarPanelNode = new SolarPanelNode(model.solarPanel, modelViewTransform, energyConvertersTandem.createTandem('solarPanelNode'));
    this.addChild(generatorNode);
    this.addChild(beltNode);
    this.addChild(solarPanelNode);

    // @private
    this.faucetAndWaterNode = new FaucetAndWaterNode(model.faucetAndWater, model.energyChunksVisibleProperty, modelViewTransform, energySourcesTandem.createTandem('faucetAndWaterNode'));
    this.addChild(this.faucetAndWaterNode);

    // get the mechanical energy chunk layer from the generator and add it after the faucet has been created. this is
    // desirable because the water from the faucet appears on top of the generator wheel, but the energy chunks that
    // are traveling on top of the falling water now remain in front of the water once the generator owns them.
    this.addChild(generatorNode.getMechanicalEnergyChunkLayer());

    // create the rest of the energy source nodes
    const sunNode = new SunNode(model.sun, model.energyChunksVisibleProperty, modelViewTransform, energySourcesTandem.createTandem('sunNode'));

    // @private
    this.teaKettleNode = new TeaKettleNode(model.teaKettle, model.energyChunksVisibleProperty, modelViewTransform, energySourcesTandem.createTandem('teaKettleNode'));
    const bikerNode = new BikerNode(model.biker, model.energyChunksVisibleProperty, modelViewTransform, energySourcesTandem.createTandem('bikerNode'));
    this.addChild(sunNode);
    this.addChild(bikerNode);
    this.addChild(this.teaKettleNode);

    // use this Tandem for the checkbox, too, so it appears as a child of the panel
    const controlPanelTandem = tandem.createTandem('controlPanel');

    // create the checkbox that controls the visibility of the energy chunks
    // The EnergyChunk that is created in here is not going to be used in the simulation, it is only needed in the
    // EnergyChunkNode that is displayed in the show/hide energy chunks toggle.
    const showEnergyChunksCheckbox = new Checkbox(model.energyChunksVisibleProperty, new HBox({
      children: [new Text(energySymbolsString, {
        font: new PhetFont(20),
        maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
      }), new EnergyChunkNode(new EnergyChunk(EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, new BooleanProperty(true), {
        tandem: Tandem.OPT_OUT
      }), modelViewTransform)],
      spacing: 5
    }), {
      tandem: controlPanelTandem.createTandem('showEnergySymbolsCheckbox'),
      phetioDocumentation: 'checkbox that shows the energy symbols'
    });
    showEnergyChunksCheckbox.touchArea = showEnergyChunksCheckbox.localBounds.dilatedY(EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION);

    // add the checkbox that controls the visibility of the energy chunks to a panel
    const controlPanel = new Panel(showEnergyChunksCheckbox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS,
      right: layoutBounds.maxX - EDGE_INSET,
      top: EDGE_INSET,
      minWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_MIN_WIDTH,
      tandem: controlPanelTandem,
      phetioDocumentation: 'panel in the upper right corner of the screen'
    });
    this.addChild(controlPanel);

    // add the energy chunk legend
    const energyChunkLegend = new EnergyChunkLegend(modelViewTransform, {
      right: layoutBounds.maxX - EDGE_INSET,
      top: controlPanel.bottom + 10
    });
    this.addChild(energyChunkLegend);

    // only show the energy chunk legend when energy chunks are visible
    model.energyChunksVisibleProperty.linkAttribute(energyChunkLegend, 'visible');

    // create a background rectangle at the bottom of the screen where the play/pause controls will reside
    const bottomPanel = new Rectangle(0, 0, layoutBounds.width * 2,
    // wide enough that users are unlikely to see the edge
    layoutBounds.height,
    // tall enough that users are unlikely to see the bottom
    {
      centerX: layoutBounds.centerX,
      top: layoutBounds.maxY - BOTTOM_CONTROL_PANEL_HEIGHT,
      fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR
    });
    this.addChild(bottomPanel);

    // add the reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.beakerHeaterNode.reset();
        this.teaKettleNode.reset();
      },
      radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
      right: layoutBounds.maxX - EDGE_INSET,
      centerY: (bottomPanel.top + layoutBounds.maxY) / 2,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // add the play/pause and step buttons
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => model.manualStep()
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    });
    this.addChild(timeControlNode);
    timeControlNode.center = new Vector2(layoutBounds.centerX, resetAllButton.centerY);

    // add the energy system element selectors, which are sets of radio buttons
    const energySourceSelector = new EnergySystemElementSelector(model.energySourcesCarousel, {
      left: EDGE_INSET,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem('energySourceSelectorPanel')
    });
    const energyConverterSelector = new EnergySystemElementSelector(model.energyConvertersCarousel, {
      left: energySourceSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem('energyConverterSelectorPanel')
    });
    const energyUserSelector = new EnergySystemElementSelector(model.energyUsersCarousel, {
      left: energyConverterSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem('energyUserSelectorPanel')
    });
    this.addChild(energySourceSelector);
    this.addChild(energyConverterSelector);
    this.addChild(energyUserSelector);

    // add a floating sky high above the sim
    const skyNode = new SkyNode(this.layoutBounds, modelViewTransform.modelToViewY(EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT) + EFACConstants.ENERGY_CHUNK_WIDTH);
    this.addChild(skyNode);

    // listen to the manualStepEmitter in the model
    model.manualStepEmitter.addListener(dt => {
      this.manualStep(dt);
    });
  }

  /**
   * step this view element, called by the framework
   * @param dt - time step, in seconds
   * @public
   */
  step(dt) {
    if (this.model.isPlayingProperty.get()) {
      this.stepView(dt);
    }
  }

  /**
   * step forward by one fixed nominal frame time
   * @param dt - time step, in seconds
   * @public
   */
  manualStep(dt) {
    this.stepView(dt);
  }

  /**
   * update the state of the non-model associated view elements for a given time amount
   * @param dt - time step, in seconds
   * @public
   */
  stepView(dt) {
    this.teaKettleNode.step(dt);
    this.beakerHeaterNode.step(dt);
    this.faucetAndWaterNode.step(dt);
  }

  /**
   * Custom layout function for this view so that it floats to the bottom of the window.
   *
   * @param {Bounds2} viewBounds
   * @override
   * @public
   */
  layout(viewBounds) {
    this.resetTransform();
    const scale = this.getLayoutScale(viewBounds);
    const width = viewBounds.width;
    const height = viewBounds.height;
    this.setScaleMagnitude(scale);
    let dx = 0;
    let offsetY = 0;

    // Move to bottom vertically (custom for this sim)
    if (scale === width / this.layoutBounds.width) {
      offsetY = height / scale - this.layoutBounds.height;
    }

    // center horizontally (default behavior for ScreenView)
    else if (scale === height / this.layoutBounds.height) {
      dx = (width - this.layoutBounds.width * scale) / 2 / scale;
    }
    this.translate(dx + viewBounds.left / scale, offsetY + viewBounds.top / scale);

    // update the visible bounds of the screen view
    this.visibleBoundsProperty.set(new Bounds2(-dx, -offsetY, width / scale - dx, height / scale - offsetY));
  }
}
energyFormsAndChanges.register('SystemsScreenView', SystemsScreenView);
export default SystemsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlN0cmluZ1V0aWxzIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJUaW1lQ29udHJvbE5vZGUiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJDaGVja2JveCIsIlBhbmVsIiwiVGFuZGVtIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rIiwiRW5lcmd5VHlwZSIsIkVuZXJneUNodW5rTm9kZSIsIlNreU5vZGUiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIiwiQmVha2VySGVhdGVyTm9kZSIsIkJlbHROb2RlIiwiQmlrZXJOb2RlIiwiRW5lcmd5Q2h1bmtMZWdlbmQiLCJFbmVyZ3lTeXN0ZW1FbGVtZW50U2VsZWN0b3IiLCJGYW5Ob2RlIiwiRmF1Y2V0QW5kV2F0ZXJOb2RlIiwiR2VuZXJhdG9yTm9kZSIsIkxpZ2h0QnVsYk5vZGUiLCJTb2xhclBhbmVsTm9kZSIsIlN1bk5vZGUiLCJUZWFLZXR0bGVOb2RlIiwiZW5lcmd5U3ltYm9sc1N0cmluZyIsImVuZXJneVN5bWJvbHMiLCJFREdFX0lOU0VUIiwiU0VMRUNUT1JfU1BBQ0lORyIsIkJPVFRPTV9DT05UUk9MX1BBTkVMX0hFSUdIVCIsIlN5c3RlbXNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImVuZXJneVNvdXJjZXNUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJlbmVyZ3lDb252ZXJ0ZXJzVGFuZGVtIiwiZW5lcmd5VXNlcnNUYW5kZW0iLCJhZGRDaGlsZCIsInRhZ05hbWUiLCJpbm5lckNvbnRlbnQiLCJhMTF5Iiwic3lzdGVtc1NjcmVlbkludGVyYWN0aW9uSGludCIsImRlc2NyaXB0aW9uQ29udGVudCIsInN5c3RlbXNTY3JlZW5TdW1tYXJ5RGVzY3JpcHRpb24iLCJlbmVyZ3lTeXN0ZW1Db25maWdEZXNjcmlwdGlvbiIsImVuZXJneVN5c3RlbSIsImVuZXJneVN5c3RlbUhlbHBUZXh0IiwibXVsdGlsaW5rIiwiZW5lcmd5U291cmNlc0Nhcm91c2VsIiwidGFyZ2V0RWxlbWVudE5hbWVQcm9wZXJ0eSIsImVuZXJneUNvbnZlcnRlcnNDYXJvdXNlbCIsImVuZXJneVVzZXJzQ2Fyb3VzZWwiLCJlbmVyZ3lTb3VyY2UiLCJnZXRTZWxlY3RlZEVsZW1lbnQiLCJlbmVyZ3lDb252ZXJ0ZXIiLCJlbmVyZ3lVc2VyIiwiYXNzZXJ0IiwiYTExeU5hbWUiLCJmaWxsSW4iLCJwcm9kdWNlciIsImNvbnZlcnRlciIsInVzZXIiLCJsYXlvdXRCb3VuZHMiLCJtdnRPcmlnaW5YIiwicm91bmRTeW1tZXRyaWMiLCJ3aWR0aCIsIm12dE9yaWdpblkiLCJoZWlnaHQiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJTWVNURU1TX01WVF9TQ0FMRV9GQUNUT1IiLCJiZWFrZXJIZWF0ZXJOb2RlIiwiYmVha2VySGVhdGVyIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwiaW5jYW5kZXNjZW50QnVsYk5vZGUiLCJpbmNhbmRlc2NlbnRCdWxiIiwiYnVsYlR5cGUiLCJmbHVvcmVzY2VudEJ1bGJOb2RlIiwiZmx1b3Jlc2NlbnRCdWxiIiwiZmFuTm9kZSIsImZhbiIsImdlbmVyYXRvck5vZGUiLCJnZW5lcmF0b3IiLCJhZGRNZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciIsImJlbHROb2RlIiwiYmVsdCIsInBoZXRpb1JlYWRPbmx5Iiwic29sYXJQYW5lbE5vZGUiLCJzb2xhclBhbmVsIiwiZmF1Y2V0QW5kV2F0ZXJOb2RlIiwiZmF1Y2V0QW5kV2F0ZXIiLCJnZXRNZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciIsInN1bk5vZGUiLCJzdW4iLCJ0ZWFLZXR0bGVOb2RlIiwidGVhS2V0dGxlIiwiYmlrZXJOb2RlIiwiYmlrZXIiLCJjb250cm9sUGFuZWxUYW5kZW0iLCJzaG93RW5lcmd5Q2h1bmtzQ2hlY2tib3giLCJjaGlsZHJlbiIsImZvbnQiLCJtYXhXaWR0aCIsIkVORVJHWV9TWU1CT0xTX1BBTkVMX1RFWFRfTUFYX1dJRFRIIiwiVEhFUk1BTCIsIk9QVF9PVVQiLCJzcGFjaW5nIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFkiLCJFTkVSR1lfU1lNQk9MU19QQU5FTF9DSEVDS0JPWF9ZX0RJTEFUSU9OIiwiY29udHJvbFBhbmVsIiwiZmlsbCIsIkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUiIsInN0cm9rZSIsIkNPTlRST0xfUEFORUxfT1VUTElORV9TVFJPS0UiLCJsaW5lV2lkdGgiLCJDT05UUk9MX1BBTkVMX09VVExJTkVfTElORV9XSURUSCIsImNvcm5lclJhZGl1cyIsIkVORVJHWV9TWU1CT0xTX1BBTkVMX0NPUk5FUl9SQURJVVMiLCJyaWdodCIsIm1heFgiLCJ0b3AiLCJtaW5XaWR0aCIsIkVORVJHWV9TWU1CT0xTX1BBTkVMX01JTl9XSURUSCIsImVuZXJneUNodW5rTGVnZW5kIiwiYm90dG9tIiwibGlua0F0dHJpYnV0ZSIsImJvdHRvbVBhbmVsIiwiY2VudGVyWCIsIm1heFkiLCJDTE9DS19DT05UUk9MX0JBQ0tHUk9VTkRfQ09MT1IiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJyYWRpdXMiLCJSRVNFVF9BTExfQlVUVE9OX1JBRElVUyIsImNlbnRlclkiLCJ0aW1lQ29udHJvbE5vZGUiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zIiwic3RlcEZvcndhcmRCdXR0b25PcHRpb25zIiwibWFudWFsU3RlcCIsImNlbnRlciIsImVuZXJneVNvdXJjZVNlbGVjdG9yIiwibGVmdCIsImVuZXJneUNvbnZlcnRlclNlbGVjdG9yIiwiZW5lcmd5VXNlclNlbGVjdG9yIiwic2t5Tm9kZSIsIm1vZGVsVG9WaWV3WSIsIlNZU1RFTVNfU0NSRUVOX0VORVJHWV9DSFVOS19NQVhfVFJBVkVMX0hFSUdIVCIsIkVORVJHWV9DSFVOS19XSURUSCIsIm1hbnVhbFN0ZXBFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkdCIsInN0ZXAiLCJnZXQiLCJzdGVwVmlldyIsImxheW91dCIsInZpZXdCb3VuZHMiLCJyZXNldFRyYW5zZm9ybSIsInNjYWxlIiwiZ2V0TGF5b3V0U2NhbGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImR4Iiwib2Zmc2V0WSIsInRyYW5zbGF0ZSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3lzdGVtc1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbWFpbiB2aWV3IGZvciB0aGUgJ1N5c3RlbXMnIHNjcmVlbiBvZiB0aGUgRW5lcmd5IEZvcm1zIGFuZCBDaGFuZ2VzIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lDaHVuay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lUeXBlLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbmVyZ3lDaHVua05vZGUuanMnO1xyXG5pbXBvcnQgU2t5Tm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Ta3lOb2RlLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyBmcm9tICcuLi8uLi9FbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJlYWtlckhlYXRlck5vZGUgZnJvbSAnLi9CZWFrZXJIZWF0ZXJOb2RlLmpzJztcclxuaW1wb3J0IEJlbHROb2RlIGZyb20gJy4vQmVsdE5vZGUuanMnO1xyXG5pbXBvcnQgQmlrZXJOb2RlIGZyb20gJy4vQmlrZXJOb2RlLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rTGVnZW5kIGZyb20gJy4vRW5lcmd5Q2h1bmtMZWdlbmQuanMnO1xyXG5pbXBvcnQgRW5lcmd5U3lzdGVtRWxlbWVudFNlbGVjdG9yIGZyb20gJy4vRW5lcmd5U3lzdGVtRWxlbWVudFNlbGVjdG9yLmpzJztcclxuaW1wb3J0IEZhbk5vZGUgZnJvbSAnLi9GYW5Ob2RlLmpzJztcclxuaW1wb3J0IEZhdWNldEFuZFdhdGVyTm9kZSBmcm9tICcuL0ZhdWNldEFuZFdhdGVyTm9kZS5qcyc7XHJcbmltcG9ydCBHZW5lcmF0b3JOb2RlIGZyb20gJy4vR2VuZXJhdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBMaWdodEJ1bGJOb2RlIGZyb20gJy4vTGlnaHRCdWxiTm9kZS5qcyc7XHJcbmltcG9ydCBTb2xhclBhbmVsTm9kZSBmcm9tICcuL1NvbGFyUGFuZWxOb2RlLmpzJztcclxuaW1wb3J0IFN1bk5vZGUgZnJvbSAnLi9TdW5Ob2RlLmpzJztcclxuaW1wb3J0IFRlYUtldHRsZU5vZGUgZnJvbSAnLi9UZWFLZXR0bGVOb2RlLmpzJztcclxuXHJcbmNvbnN0IGVuZXJneVN5bWJvbHNTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmVuZXJneVN5bWJvbHM7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRURHRV9JTlNFVCA9IDEwOyAvLyBzY3JlZW4gZWRnZSBwYWRkaW5nLCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgU0VMRUNUT1JfU1BBQ0lORyA9IDgyOyAvLyBzcGFjZSBiZXR3ZWVuIGVuZXJneSBzeXN0ZW0gc2VsZWN0b3IgcGFuZWwsIGluIHNjcmVlbiBjb29yZGluYXRlc1xyXG5jb25zdCBCT1RUT01fQ09OVFJPTF9QQU5FTF9IRUlHSFQgPSA0OTsgLy8gbWFudWFsbHkgY29vcmRpbmF0ZWQgdG8gbWF0Y2ggc2ltaWxhciBwYW5lbCBvbiAxc3Qgc2NyZWVuXHJcblxyXG5jbGFzcyBTeXN0ZW1zU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1N5c3RlbXNNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRhbmRlbXMgdG8gbmVzdCBlbmVyZ3kgc3lzdGVtcyBpbiBTdHVkaW9cclxuICAgIGNvbnN0IGVuZXJneVNvdXJjZXNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5U291cmNlcycgKTtcclxuICAgIGNvbnN0IGVuZXJneUNvbnZlcnRlcnNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q29udmVydGVycycgKTtcclxuICAgIGNvbnN0IGVuZXJneVVzZXJzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVVzZXJzJyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtTeXN0ZW1zTW9kZWx9XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gcGRvbSAtIHRoZSBzY3JlZW4gc3VtbWFyeSB0byBiZSByZWFkIGJ5IGFzc2lzdGl2ZSB0ZWNobm9sb2d5XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgaW5uZXJDb250ZW50OiBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuc3lzdGVtc1NjcmVlbkludGVyYWN0aW9uSGludCxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuc3lzdGVtc1NjcmVlblN1bW1hcnlEZXNjcmlwdGlvblxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gcGRvbSAtIGEgZGVzY3JpcHRpb24gb2YgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBvZiB0aGUgZW5lcmd5IHN5c3RlbSB0byBiZSByZWFkIGJ5IGFzc2lzdGl2ZSB0ZWNobm9sb2d5XHJcbiAgICBjb25zdCBlbmVyZ3lTeXN0ZW1Db25maWdEZXNjcmlwdGlvbiA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdoMycsXHJcbiAgICAgIGlubmVyQ29udGVudDogRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5hMTF5LmVuZXJneVN5c3RlbSxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmExMXkuZW5lcmd5U3lzdGVtSGVscFRleHRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVuZXJneVN5c3RlbUNvbmZpZ0Rlc2NyaXB0aW9uICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBhMTF5IGRlc2NyaXB0aW9uIGFzIHRoZSBzZWxlY3RlZCBlbGVtZW50IGNoYW5nZXNcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFtcclxuICAgICAgICBtb2RlbC5lbmVyZ3lTb3VyY2VzQ2Fyb3VzZWwudGFyZ2V0RWxlbWVudE5hbWVQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5lbmVyZ3lDb252ZXJ0ZXJzQ2Fyb3VzZWwudGFyZ2V0RWxlbWVudE5hbWVQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5lbmVyZ3lVc2Vyc0Nhcm91c2VsLnRhcmdldEVsZW1lbnROYW1lUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVuZXJneVNvdXJjZSA9IG1vZGVsLmVuZXJneVNvdXJjZXNDYXJvdXNlbC5nZXRTZWxlY3RlZEVsZW1lbnQoKTtcclxuICAgICAgICBjb25zdCBlbmVyZ3lDb252ZXJ0ZXIgPSBtb2RlbC5lbmVyZ3lDb252ZXJ0ZXJzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcbiAgICAgICAgY29uc3QgZW5lcmd5VXNlciA9IG1vZGVsLmVuZXJneVVzZXJzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZW5lcmd5U291cmNlLmExMXlOYW1lLCAndGhlIHNlbGVjdGVkIGVsZW1lbnQgaGFzIG5vIGFjY2Vzc2liaWxpdHkgbmFtZSBzcGVjaWZpZWQnICk7XHJcbiAgICAgICAgZW5lcmd5U3lzdGVtQ29uZmlnRGVzY3JpcHRpb24uZGVzY3JpcHRpb25Db250ZW50ID0gU3RyaW5nVXRpbHMuZmlsbEluKFxyXG4gICAgICAgICAgRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5hMTF5LmVuZXJneVN5c3RlbUhlbHBUZXh0LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBwcm9kdWNlcjogZW5lcmd5U291cmNlLmExMXlOYW1lLFxyXG4gICAgICAgICAgICBjb252ZXJ0ZXI6IGVuZXJneUNvbnZlcnRlci5hMTF5TmFtZSxcclxuICAgICAgICAgICAgdXNlcjogZW5lcmd5VXNlci5hMTF5TmFtZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gY29udmVuaWVuY2UgdmFyaWFibGVcclxuICAgIGNvbnN0IGxheW91dEJvdW5kcyA9IHRoaXMubGF5b3V0Qm91bmRzO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbW9kZWwtdmlldyB0cmFuc2Zvcm0uICBUaGUgcHJpbWFyeSB1bml0cyB1c2VkIGluIHRoZSBtb2RlbCBhcmUgbWV0ZXJzLCBzbyBzaWduaWZpY2FudCB6b29tIGlzIHVzZWQuXHJcbiAgICAvLyBUaGUgbXVsdGlwbGllcnMgZm9yIHRoZSAybmQgcGFyYW1ldGVyIGNhbiBiZSB1c2VkIHRvIGFkanVzdCB3aGVyZSB0aGUgcG9pbnQgKDAsIDApIGluIHRoZSBtb2RlbCwgd2hpY2ggaXMgb24gdGhlXHJcbiAgICAvLyBtaWRkbGUgb2YgdGhlIHNjcmVlbiBhYm92ZSB0aGUgY291bnRlciBhcyBsb2NhdGVkIGluIHRoZSB2aWV3LiBGaW5hbCBhcmcgaXMgem9vbSBmYWN0b3IgZnJvbSBvcmlnaW5hbCBKYXZhIHNpbSAtXHJcbiAgICAvLyBzbWFsbGVyIHpvb21zIG91dCwgbGFyZ2VyIHpvb21zIGluLlxyXG4gICAgY29uc3QgbXZ0T3JpZ2luWCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBsYXlvdXRCb3VuZHMud2lkdGggKiAwLjUgKTtcclxuICAgIGNvbnN0IG12dE9yaWdpblkgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuNDc1ICk7XHJcbiAgICBjb25zdCBtb2RlbFZpZXdUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxyXG4gICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBtdnRPcmlnaW5YLCBtdnRPcmlnaW5ZICksXHJcbiAgICAgIEVGQUNDb25zdGFudHMuU1lTVEVNU19NVlRfU0NBTEVfRkFDVE9SXHJcbiAgICApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZW5lcmd5IHVzZXIgbm9kZXNcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5iZWFrZXJIZWF0ZXJOb2RlID0gbmV3IEJlYWtlckhlYXRlck5vZGUoXHJcbiAgICAgIG1vZGVsLmJlYWtlckhlYXRlcixcclxuICAgICAgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIGVuZXJneVVzZXJzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JlYWtlckhlYXRlck5vZGUnIClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3QgaW5jYW5kZXNjZW50QnVsYk5vZGUgPSBuZXcgTGlnaHRCdWxiTm9kZShcclxuICAgICAgbW9kZWwuaW5jYW5kZXNjZW50QnVsYixcclxuICAgICAgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICBidWxiVHlwZTogJ2luY2FuZGVzY2VudCcsXHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lVc2Vyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNhbmRlc2NlbnRCdWxiTm9kZScgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY29uc3QgZmx1b3Jlc2NlbnRCdWxiTm9kZSA9IG5ldyBMaWdodEJ1bGJOb2RlKFxyXG4gICAgICBtb2RlbC5mbHVvcmVzY2VudEJ1bGIsXHJcbiAgICAgIG1vZGVsLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgYnVsYlR5cGU6ICdmbHVvcmVzY2VudCcsXHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lVc2Vyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdmbHVvcmVzY2VudEJ1bGJOb2RlJyApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBjb25zdCBmYW5Ob2RlID0gbmV3IEZhbk5vZGUoXHJcbiAgICAgIG1vZGVsLmZhbixcclxuICAgICAgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIGVuZXJneVVzZXJzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Zhbk5vZGUnIClcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJlYWtlckhlYXRlck5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGluY2FuZGVzY2VudEJ1bGJOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmbHVvcmVzY2VudEJ1bGJOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmYW5Ob2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBlbmVyZ3kgY29udmVydGVyIG5vZGVzXHJcbiAgICBjb25zdCBnZW5lcmF0b3JOb2RlID0gbmV3IEdlbmVyYXRvck5vZGUoXHJcbiAgICAgIG1vZGVsLmdlbmVyYXRvcixcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgYWRkTWVjaGFuaWNhbEVuZXJneUNodW5rTGF5ZXI6IGZhbHNlLFxyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5Q29udmVydGVyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdnZW5lcmF0b3JOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuICAgIGNvbnN0IGJlbHROb2RlID0gbmV3IEJlbHROb2RlKFxyXG4gICAgICBtb2RlbC5iZWx0LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICB0YW5kZW06IGVuZXJneUNvbnZlcnRlcnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYmVsdE5vZGUnICksXHJcbiAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzb2xhclBhbmVsTm9kZSA9IG5ldyBTb2xhclBhbmVsTm9kZShcclxuICAgICAgbW9kZWwuc29sYXJQYW5lbCxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBlbmVyZ3lDb252ZXJ0ZXJzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvbGFyUGFuZWxOb2RlJyApXHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ2VuZXJhdG9yTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmVsdE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNvbGFyUGFuZWxOb2RlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZmF1Y2V0QW5kV2F0ZXJOb2RlID0gbmV3IEZhdWNldEFuZFdhdGVyTm9kZShcclxuICAgICAgbW9kZWwuZmF1Y2V0QW5kV2F0ZXIsXHJcbiAgICAgIG1vZGVsLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBlbmVyZ3lTb3VyY2VzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZhdWNldEFuZFdhdGVyTm9kZScgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZmF1Y2V0QW5kV2F0ZXJOb2RlICk7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBtZWNoYW5pY2FsIGVuZXJneSBjaHVuayBsYXllciBmcm9tIHRoZSBnZW5lcmF0b3IgYW5kIGFkZCBpdCBhZnRlciB0aGUgZmF1Y2V0IGhhcyBiZWVuIGNyZWF0ZWQuIHRoaXMgaXNcclxuICAgIC8vIGRlc2lyYWJsZSBiZWNhdXNlIHRoZSB3YXRlciBmcm9tIHRoZSBmYXVjZXQgYXBwZWFycyBvbiB0b3Agb2YgdGhlIGdlbmVyYXRvciB3aGVlbCwgYnV0IHRoZSBlbmVyZ3kgY2h1bmtzIHRoYXRcclxuICAgIC8vIGFyZSB0cmF2ZWxpbmcgb24gdG9wIG9mIHRoZSBmYWxsaW5nIHdhdGVyIG5vdyByZW1haW4gaW4gZnJvbnQgb2YgdGhlIHdhdGVyIG9uY2UgdGhlIGdlbmVyYXRvciBvd25zIHRoZW0uXHJcbiAgICB0aGlzLmFkZENoaWxkKCBnZW5lcmF0b3JOb2RlLmdldE1lY2hhbmljYWxFbmVyZ3lDaHVua0xheWVyKCkgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHJlc3Qgb2YgdGhlIGVuZXJneSBzb3VyY2Ugbm9kZXNcclxuICAgIGNvbnN0IHN1bk5vZGUgPSBuZXcgU3VuTm9kZShcclxuICAgICAgbW9kZWwuc3VuLFxyXG4gICAgICBtb2RlbC5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgZW5lcmd5U291cmNlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzdW5Ob2RlJyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnRlYUtldHRsZU5vZGUgPSBuZXcgVGVhS2V0dGxlTm9kZShcclxuICAgICAgbW9kZWwudGVhS2V0dGxlLFxyXG4gICAgICBtb2RlbC5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgZW5lcmd5U291cmNlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZWFLZXR0bGVOb2RlJyApXHJcbiAgICApO1xyXG4gICAgY29uc3QgYmlrZXJOb2RlID0gbmV3IEJpa2VyTm9kZShcclxuICAgICAgbW9kZWwuYmlrZXIsXHJcbiAgICAgIG1vZGVsLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBlbmVyZ3lTb3VyY2VzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Jpa2VyTm9kZScgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN1bk5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJpa2VyTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50ZWFLZXR0bGVOb2RlICk7XHJcblxyXG4gICAgLy8gdXNlIHRoaXMgVGFuZGVtIGZvciB0aGUgY2hlY2tib3gsIHRvbywgc28gaXQgYXBwZWFycyBhcyBhIGNoaWxkIG9mIHRoZSBwYW5lbFxyXG4gICAgY29uc3QgY29udHJvbFBhbmVsVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGNoZWNrYm94IHRoYXQgY29udHJvbHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGVuZXJneSBjaHVua3NcclxuICAgIC8vIFRoZSBFbmVyZ3lDaHVuayB0aGF0IGlzIGNyZWF0ZWQgaW4gaGVyZSBpcyBub3QgZ29pbmcgdG8gYmUgdXNlZCBpbiB0aGUgc2ltdWxhdGlvbiwgaXQgaXMgb25seSBuZWVkZWQgaW4gdGhlXHJcbiAgICAvLyBFbmVyZ3lDaHVua05vZGUgdGhhdCBpcyBkaXNwbGF5ZWQgaW4gdGhlIHNob3cvaGlkZSBlbmVyZ3kgY2h1bmtzIHRvZ2dsZS5cclxuICAgIGNvbnN0IHNob3dFbmVyZ3lDaHVua3NDaGVja2JveCA9IG5ldyBDaGVja2JveCggbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCBlbmVyZ3lTeW1ib2xzU3RyaW5nLCB7XHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgICAgICAgICBtYXhXaWR0aDogRUZBQ0NvbnN0YW50cy5FTkVSR1lfU1lNQk9MU19QQU5FTF9URVhUX01BWF9XSURUSFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICBuZXcgRW5lcmd5Q2h1bmtOb2RlKFxyXG4gICAgICAgICAgbmV3IEVuZXJneUNodW5rKCBFbmVyZ3lUeXBlLlRIRVJNQUwsIFZlY3RvcjIuWkVSTywgVmVjdG9yMi5aRVJPLCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICksXHJcbiAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgICAgICApXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDVcclxuICAgIH0gKSwge1xyXG4gICAgICB0YW5kZW06IGNvbnRyb2xQYW5lbFRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93RW5lcmd5U3ltYm9sc0NoZWNrYm94JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnY2hlY2tib3ggdGhhdCBzaG93cyB0aGUgZW5lcmd5IHN5bWJvbHMnXHJcbiAgICB9ICk7XHJcbiAgICBzaG93RW5lcmd5Q2h1bmtzQ2hlY2tib3gudG91Y2hBcmVhID1cclxuICAgICAgc2hvd0VuZXJneUNodW5rc0NoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRZKCBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX0NIRUNLQk9YX1lfRElMQVRJT04gKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGNoZWNrYm94IHRoYXQgY29udHJvbHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGVuZXJneSBjaHVua3MgdG8gYSBwYW5lbFxyXG4gICAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IFBhbmVsKCBzaG93RW5lcmd5Q2h1bmtzQ2hlY2tib3gsIHtcclxuICAgICAgZmlsbDogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIHN0cm9rZTogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX09VVExJTkVfU1RST0tFLFxyXG4gICAgICBsaW5lV2lkdGg6IEVGQUNDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9PVVRMSU5FX0xJTkVfV0lEVEgsXHJcbiAgICAgIGNvcm5lclJhZGl1czogRUZBQ0NvbnN0YW50cy5FTkVSR1lfU1lNQk9MU19QQU5FTF9DT1JORVJfUkFESVVTLFxyXG4gICAgICByaWdodDogbGF5b3V0Qm91bmRzLm1heFggLSBFREdFX0lOU0VULFxyXG4gICAgICB0b3A6IEVER0VfSU5TRVQsXHJcbiAgICAgIG1pbldpZHRoOiBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX01JTl9XSURUSCxcclxuICAgICAgdGFuZGVtOiBjb250cm9sUGFuZWxUYW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwYW5lbCBpbiB0aGUgdXBwZXIgcmlnaHQgY29ybmVyIG9mIHRoZSBzY3JlZW4nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGVuZXJneSBjaHVuayBsZWdlbmRcclxuICAgIGNvbnN0IGVuZXJneUNodW5rTGVnZW5kID0gbmV3IEVuZXJneUNodW5rTGVnZW5kKCBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHtcclxuICAgICAgICByaWdodDogbGF5b3V0Qm91bmRzLm1heFggLSBFREdFX0lOU0VULFxyXG4gICAgICAgIHRvcDogY29udHJvbFBhbmVsLmJvdHRvbSArIDEwXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVuZXJneUNodW5rTGVnZW5kICk7XHJcblxyXG4gICAgLy8gb25seSBzaG93IHRoZSBlbmVyZ3kgY2h1bmsgbGVnZW5kIHdoZW4gZW5lcmd5IGNodW5rcyBhcmUgdmlzaWJsZVxyXG4gICAgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIGVuZXJneUNodW5rTGVnZW5kLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBiYWNrZ3JvdW5kIHJlY3RhbmdsZSBhdCB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4gd2hlcmUgdGhlIHBsYXkvcGF1c2UgY29udHJvbHMgd2lsbCByZXNpZGVcclxuICAgIGNvbnN0IGJvdHRvbVBhbmVsID0gbmV3IFJlY3RhbmdsZShcclxuICAgICAgMCxcclxuICAgICAgMCxcclxuICAgICAgbGF5b3V0Qm91bmRzLndpZHRoICogMiwgLy8gd2lkZSBlbm91Z2ggdGhhdCB1c2VycyBhcmUgdW5saWtlbHkgdG8gc2VlIHRoZSBlZGdlXHJcbiAgICAgIGxheW91dEJvdW5kcy5oZWlnaHQsIC8vIHRhbGwgZW5vdWdoIHRoYXQgdXNlcnMgYXJlIHVubGlrZWx5IHRvIHNlZSB0aGUgYm90dG9tXHJcbiAgICAgIHtcclxuICAgICAgICBjZW50ZXJYOiBsYXlvdXRCb3VuZHMuY2VudGVyWCxcclxuICAgICAgICB0b3A6IGxheW91dEJvdW5kcy5tYXhZIC0gQk9UVE9NX0NPTlRST0xfUEFORUxfSEVJR0hULFxyXG4gICAgICAgIGZpbGw6IEVGQUNDb25zdGFudHMuQ0xPQ0tfQ09OVFJPTF9CQUNLR1JPVU5EX0NPTE9SXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBib3R0b21QYW5lbCApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcmVzZXQgYWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5iZWFrZXJIZWF0ZXJOb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy50ZWFLZXR0bGVOb2RlLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJhZGl1czogRUZBQ0NvbnN0YW50cy5SRVNFVF9BTExfQlVUVE9OX1JBRElVUyxcclxuICAgICAgcmlnaHQ6IGxheW91dEJvdW5kcy5tYXhYIC0gRURHRV9JTlNFVCxcclxuICAgICAgY2VudGVyWTogKCBib3R0b21QYW5lbC50b3AgKyBsYXlvdXRCb3VuZHMubWF4WSApIC8gMixcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBwbGF5L3BhdXNlIGFuZCBzdGVwIGJ1dHRvbnNcclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc3RlcEZvcndhcmRCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4gbW9kZWwubWFudWFsU3RlcCgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVDb250cm9sTm9kZSApO1xyXG4gICAgdGltZUNvbnRyb2xOb2RlLmNlbnRlciA9IG5ldyBWZWN0b3IyKCBsYXlvdXRCb3VuZHMuY2VudGVyWCwgcmVzZXRBbGxCdXR0b24uY2VudGVyWSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgZW5lcmd5IHN5c3RlbSBlbGVtZW50IHNlbGVjdG9ycywgd2hpY2ggYXJlIHNldHMgb2YgcmFkaW8gYnV0dG9uc1xyXG4gICAgY29uc3QgZW5lcmd5U291cmNlU2VsZWN0b3IgPSBuZXcgRW5lcmd5U3lzdGVtRWxlbWVudFNlbGVjdG9yKCBtb2RlbC5lbmVyZ3lTb3VyY2VzQ2Fyb3VzZWwsIHtcclxuICAgICAgbGVmdDogRURHRV9JTlNFVCxcclxuICAgICAgYm90dG9tOiBib3R0b21QYW5lbC50b3AgLSBFREdFX0lOU0VULFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lTb3VyY2VTZWxlY3RvclBhbmVsJyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBlbmVyZ3lDb252ZXJ0ZXJTZWxlY3RvciA9IG5ldyBFbmVyZ3lTeXN0ZW1FbGVtZW50U2VsZWN0b3IoIG1vZGVsLmVuZXJneUNvbnZlcnRlcnNDYXJvdXNlbCwge1xyXG4gICAgICBsZWZ0OiBlbmVyZ3lTb3VyY2VTZWxlY3Rvci5yaWdodCArIFNFTEVDVE9SX1NQQUNJTkcsXHJcbiAgICAgIGJvdHRvbTogYm90dG9tUGFuZWwudG9wIC0gRURHRV9JTlNFVCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q29udmVydGVyU2VsZWN0b3JQYW5lbCcgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZW5lcmd5VXNlclNlbGVjdG9yID0gbmV3IEVuZXJneVN5c3RlbUVsZW1lbnRTZWxlY3RvciggbW9kZWwuZW5lcmd5VXNlcnNDYXJvdXNlbCwge1xyXG4gICAgICBsZWZ0OiBlbmVyZ3lDb252ZXJ0ZXJTZWxlY3Rvci5yaWdodCArIFNFTEVDVE9SX1NQQUNJTkcsXHJcbiAgICAgIGJvdHRvbTogYm90dG9tUGFuZWwudG9wIC0gRURHRV9JTlNFVCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5VXNlclNlbGVjdG9yUGFuZWwnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVuZXJneVNvdXJjZVNlbGVjdG9yICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlbmVyZ3lDb252ZXJ0ZXJTZWxlY3RvciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZW5lcmd5VXNlclNlbGVjdG9yICk7XHJcblxyXG4gICAgLy8gYWRkIGEgZmxvYXRpbmcgc2t5IGhpZ2ggYWJvdmUgdGhlIHNpbVxyXG4gICAgY29uc3Qgc2t5Tm9kZSA9IG5ldyBTa3lOb2RlKFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggRUZBQ0NvbnN0YW50cy5TWVNURU1TX1NDUkVFTl9FTkVSR1lfQ0hVTktfTUFYX1RSQVZFTF9IRUlHSFQgKSArIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1dJRFRIXHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2t5Tm9kZSApO1xyXG5cclxuICAgIC8vIGxpc3RlbiB0byB0aGUgbWFudWFsU3RlcEVtaXR0ZXIgaW4gdGhlIG1vZGVsXHJcbiAgICBtb2RlbC5tYW51YWxTdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggZHQgPT4ge1xyXG4gICAgICB0aGlzLm1hbnVhbFN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoaXMgdmlldyBlbGVtZW50LCBjYWxsZWQgYnkgdGhlIGZyYW1ld29ya1xyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5tb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5zdGVwVmlldyggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgZm9yd2FyZCBieSBvbmUgZml4ZWQgbm9taW5hbCBmcmFtZSB0aW1lXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5zdGVwVmlldyggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIG5vbi1tb2RlbCBhc3NvY2lhdGVkIHZpZXcgZWxlbWVudHMgZm9yIGEgZ2l2ZW4gdGltZSBhbW91bnRcclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcFZpZXcoIGR0ICkge1xyXG4gICAgdGhpcy50ZWFLZXR0bGVOb2RlLnN0ZXAoIGR0ICk7XHJcbiAgICB0aGlzLmJlYWtlckhlYXRlck5vZGUuc3RlcCggZHQgKTtcclxuICAgIHRoaXMuZmF1Y2V0QW5kV2F0ZXJOb2RlLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDdXN0b20gbGF5b3V0IGZ1bmN0aW9uIGZvciB0aGlzIHZpZXcgc28gdGhhdCBpdCBmbG9hdHMgdG8gdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSB2aWV3Qm91bmRzXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGxheW91dCggdmlld0JvdW5kcyApIHtcclxuICAgIHRoaXMucmVzZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuZ2V0TGF5b3V0U2NhbGUoIHZpZXdCb3VuZHMgKTtcclxuICAgIGNvbnN0IHdpZHRoID0gdmlld0JvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XHJcblxyXG4gICAgbGV0IGR4ID0gMDtcclxuICAgIGxldCBvZmZzZXRZID0gMDtcclxuXHJcbiAgICAvLyBNb3ZlIHRvIGJvdHRvbSB2ZXJ0aWNhbGx5IChjdXN0b20gZm9yIHRoaXMgc2ltKVxyXG4gICAgaWYgKCBzY2FsZSA9PT0gd2lkdGggLyB0aGlzLmxheW91dEJvdW5kcy53aWR0aCApIHtcclxuICAgICAgb2Zmc2V0WSA9ICggaGVpZ2h0IC8gc2NhbGUgLSB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5IChkZWZhdWx0IGJlaGF2aW9yIGZvciBTY3JlZW5WaWV3KVxyXG4gICAgZWxzZSBpZiAoIHNjYWxlID09PSBoZWlnaHQgLyB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKSB7XHJcbiAgICAgIGR4ID0gKCB3aWR0aCAtIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogc2NhbGUgKSAvIDIgLyBzY2FsZTtcclxuICAgIH1cclxuICAgIHRoaXMudHJhbnNsYXRlKCBkeCArIHZpZXdCb3VuZHMubGVmdCAvIHNjYWxlLCBvZmZzZXRZICsgdmlld0JvdW5kcy50b3AgLyBzY2FsZSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdmlzaWJsZSBib3VuZHMgb2YgdGhlIHNjcmVlbiB2aWV3XHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5zZXQoIG5ldyBCb3VuZHMyKCAtZHgsIC1vZmZzZXRZLCB3aWR0aCAvIHNjYWxlIC0gZHgsIGhlaWdodCAvIHNjYWxlIC0gb2Zmc2V0WSApICk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdTeXN0ZW1zU2NyZWVuVmlldycsIFN5c3RlbXNTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN5c3RlbXNTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFD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