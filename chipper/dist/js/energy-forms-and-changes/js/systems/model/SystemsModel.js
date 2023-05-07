// Copyright 2016-2022, University of Colorado Boulder

/**
 * model for the 'Systems' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerHeater from './BeakerHeater.js';
import Belt from './Belt.js';
import Biker from './Biker.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import EnergySystemElementCarousel from './EnergySystemElementCarousel.js';
import Fan from './Fan.js';
import FaucetAndWater from './FaucetAndWater.js';
import FluorescentBulb from './FluorescentBulb.js';
import Generator from './Generator.js';
import IncandescentBulb from './IncandescentBulb.js';
import SolarPanel from './SolarPanel.js';
import SunEnergySource from './SunEnergySource.js';
import TeaKettle from './TeaKettle.js';

// constants
const OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2(0, -0.4); // in meters
const ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2(-0.15, 0); // in meters
const ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2(-0.025, 0); // in meters

class SystemsModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // tandems to nest energy systems in Studio
    const energySourcesTandem = tandem.createTandem('energySources');
    const energyConvertersTandem = tandem.createTandem('energyConverters');
    const energyUsersTandem = tandem.createTandem('energyUsers');

    // @public {BooleanProperty} - see in EFACIntroModel for doc
    this.energyChunksVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('energyChunksVisibleProperty'),
      phetioDocumentation: 'whether the energy chunks are visible'
    });

    // @public (read-only) {BooleanProperty} - is the sim running or paused?
    this.isPlayingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('isPlayingProperty'),
      phetioDocumentation: 'whether the screen is playing or paused'
    });

    // @private - For PhET-iO support. This type is responsible for creating and destroying all EnergyChunks in this model.
    this.energyChunkGroup = new EnergyChunkGroup(this.energyChunksVisibleProperty, {
      tandem: tandem.createTandem('energyChunkGroup')
    });

    // @private - For PhET-iO support. This type is responsible for creating and destroying all EnergyChunkPathMover
    // instances in this model.
    this.energyChunkPathMoverGroup = new EnergyChunkPathMoverGroup(this.energyChunkGroup, {
      tandem: tandem.createTandem('energyChunkPathMoverGroup')
    });

    // @public (read-only) energy converters
    this.generator = new Generator(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyConvertersTandem.createTandem('generator')
    });
    this.solarPanel = new SolarPanel(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyConvertersTandem.createTandem('solarPanel')
    });

    // @public (read-only) energy sources
    this.biker = new Biker(this.energyChunksVisibleProperty, this.generator.activeProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energySourcesTandem.createTandem('biker')
    });
    this.faucetAndWater = new FaucetAndWater(this.energyChunksVisibleProperty, this.generator.activeProperty, this.energyChunkGroup, {
      tandem: energySourcesTandem.createTandem('faucetAndWater')
    });
    this.sun = new SunEnergySource(this.solarPanel, this.isPlayingProperty, this.energyChunksVisibleProperty, this.energyChunkGroup, {
      tandem: energySourcesTandem.createTandem('sun')
    });
    this.teaKettle = new TeaKettle(this.energyChunksVisibleProperty, this.generator.activeProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energySourcesTandem.createTandem('teaKettle')
    });
    const wheel1Center = ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION.plus(Biker.CENTER_OF_BACK_WHEEL_OFFSET);
    const wheel2Center = ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION.plus(Generator.WHEEL_CENTER_OFFSET);

    // @public (read-only) belt that connects biker to generator, which is not on a carousel
    this.belt = new Belt(Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center);

    // // @public (read-only) energy users
    this.fan = new Fan(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyUsersTandem.createTandem('fan')
    });
    this.incandescentBulb = new IncandescentBulb(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyUsersTandem.createTandem('incandescentBulb')
    });
    this.fluorescentBulb = new FluorescentBulb(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyUsersTandem.createTandem('fluorescentBulb')
    });
    this.beakerHeater = new BeakerHeater(this.energyChunksVisibleProperty, this.energyChunkGroup, this.energyChunkPathMoverGroup, {
      tandem: energyUsersTandem.createTandem('beakerHeater')
    });

    // @public (read-only) carousels that control the positions of the energy sources, converters, and users
    this.energySourcesCarousel = new EnergySystemElementCarousel([this.biker, this.faucetAndWater, this.sun, this.teaKettle], EnumerationDeprecated.byKeys(['BIKER', 'FAUCET', 'SUN', 'TEA_KETTLE']), ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION, OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL, tandem.createTandem('energySourcesCarousel'));
    this.energyConvertersCarousel = new EnergySystemElementCarousel([this.generator, this.solarPanel], EnumerationDeprecated.byKeys(['GENERATOR', 'SOLAR_PANEL']), ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION, OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL, tandem.createTandem('energyConvertersCarousel'));
    this.energyUsersCarousel = new EnergySystemElementCarousel([this.beakerHeater, this.incandescentBulb, this.fluorescentBulb, this.fan], EnumerationDeprecated.byKeys(['BEAKER_HEATER', 'INCANDESCENT_BULB', 'FLUORESCENT_BULB', 'FAN']), new Vector2(0.09, 0), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL, tandem.createTandem('energyUsersCarousel'));

    // @private {EnergySystemElementCarousel[]}
    this.carousels = [this.energySourcesCarousel, this.energyConvertersCarousel, this.energyUsersCarousel];

    // @public - used to notify the view that a manual step was called
    this.manualStepEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });

    // set isActive = true for the first element in each carousel
    this.carousels.forEach(carousel => {
      carousel.managedElements[0].activate();
    });

    // adds the functionality to show/hide the belt that interconnects the biker and the generator
    const beltVisibilityUpdated = isAnimating => {
      const bikerAndGeneratorSelected = !isAnimating && this.biker.activeProperty.value && this.generator.activeProperty.value;
      this.belt.isVisibleProperty.set(bikerAndGeneratorSelected);
      this.generator.directCouplingModeProperty.set(bikerAndGeneratorSelected);
    };
    this.energySourcesCarousel.animationInProgressProperty.link(beltVisibilityUpdated);
    this.energyConvertersCarousel.animationInProgressProperty.link(beltVisibilityUpdated);

    // monitor the visibility of the energy chunks and make sure they are in the right places when this changes
    this.energyChunksVisibleProperty.link(energyChunksVisible => {
      // When setting PhET-iO state, energy chunks are positioned based on the state.
      if (energyChunksVisible && !phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.preloadEnergyChunks();
      }
    });
  }

  /**
   * restore the initial state
   * @public
   */
  reset() {
    this.energyChunksVisibleProperty.reset();
    this.isPlayingProperty.reset();
    this.carousels.forEach(carousel => {
      carousel.getSelectedElement().deactivate();
      carousel.targetElementNameProperty.reset();
      carousel.getSelectedElement().activate();
    });
  }

  /**
   * step the sim forward by one fixed nominal frame time
   * @public
   */
  manualStep() {
    this.stepModel(EFACConstants.SIM_TIME_PER_TICK_NORMAL);
    this.manualStepEmitter.emit(EFACConstants.SIM_TIME_PER_TICK_NORMAL); // notify the view
  }

  /**
   * step function or this model, automatically called by joist
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step(dt) {
    // elements managed by carousels need to be scrollable/selectable regardless of play/pause state
    this.carousels.forEach(carousel => {
      carousel.step(dt);
    });
    if (this.isPlayingProperty.get()) {
      this.stepModel(dt);
    }
  }

  /**
   * step the model in time
   * @param  {number} dt - time step in seconds
   * @public
   */
  stepModel(dt) {
    const source = this.energySourcesCarousel.getSelectedElement();
    const converter = this.energyConvertersCarousel.getSelectedElement();
    const user = this.energyUsersCarousel.getSelectedElement();

    // {Energy} - step the currently selected energy system elements and transfer energy chunks in between each step
    const energyFromSource = source.step(dt);
    converter.injectEnergyChunks(source.extractOutgoingEnergyChunks());
    const energyFromConverter = converter.step(dt, energyFromSource);
    user.injectEnergyChunks(converter.extractOutgoingEnergyChunks());
    user.step(dt, energyFromConverter);
  }

  /**
   * Pre-load the currently active energy system elements with energy chunks so that the energy chunks are fully
   * propagated into the elements.
   * @private
   */
  preloadEnergyChunks() {
    const source = this.energySourcesCarousel.getSelectedElement();
    const converter = this.energyConvertersCarousel.getSelectedElement();
    const user = this.energyUsersCarousel.getSelectedElement();
    source.preloadEnergyChunks();
    converter.preloadEnergyChunks(source.getEnergyOutputRate());
    user.preloadEnergyChunks(converter.getEnergyOutputRate());
  }
}
energyFormsAndChanges.register('SystemsModel', SystemsModel);
export default SystemsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiVmVjdG9yMiIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIkVGQUNDb25zdGFudHMiLCJFbmVyZ3lDaHVua0dyb3VwIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiQmVha2VySGVhdGVyIiwiQmVsdCIsIkJpa2VyIiwiRW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCIsIkVuZXJneVN5c3RlbUVsZW1lbnRDYXJvdXNlbCIsIkZhbiIsIkZhdWNldEFuZFdhdGVyIiwiRmx1b3Jlc2NlbnRCdWxiIiwiR2VuZXJhdG9yIiwiSW5jYW5kZXNjZW50QnVsYiIsIlNvbGFyUGFuZWwiLCJTdW5FbmVyZ3lTb3VyY2UiLCJUZWFLZXR0bGUiLCJPRkZTRVRfQkVUV0VFTl9FTEVNRU5UU19PTl9DQVJPVVNFTCIsIkVORVJHWV9TT1VSQ0VTX0NBUk9VU0VMX1NFTEVDVEVEX0VMRU1FTlRfUE9TSVRJT04iLCJFTkVSR1lfQ09OVkVSVEVSU19DQVJPVVNFTF9TRUxFQ1RFRF9FTEVNRU5UX1BPU0lUSU9OIiwiU3lzdGVtc01vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJlbmVyZ3lTb3VyY2VzVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZW5lcmd5Q29udmVydGVyc1RhbmRlbSIsImVuZXJneVVzZXJzVGFuZGVtIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImlzUGxheWluZ1Byb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsImVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAiLCJnZW5lcmF0b3IiLCJzb2xhclBhbmVsIiwiYmlrZXIiLCJhY3RpdmVQcm9wZXJ0eSIsImZhdWNldEFuZFdhdGVyIiwic3VuIiwidGVhS2V0dGxlIiwid2hlZWwxQ2VudGVyIiwicGx1cyIsIkNFTlRFUl9PRl9CQUNLX1dIRUVMX09GRlNFVCIsIndoZWVsMkNlbnRlciIsIldIRUVMX0NFTlRFUl9PRkZTRVQiLCJiZWx0IiwiUkVBUl9XSEVFTF9SQURJVVMiLCJXSEVFTF9SQURJVVMiLCJmYW4iLCJpbmNhbmRlc2NlbnRCdWxiIiwiZmx1b3Jlc2NlbnRCdWxiIiwiYmVha2VySGVhdGVyIiwiZW5lcmd5U291cmNlc0Nhcm91c2VsIiwiYnlLZXlzIiwiZW5lcmd5Q29udmVydGVyc0Nhcm91c2VsIiwiZW5lcmd5VXNlcnNDYXJvdXNlbCIsImNhcm91c2VscyIsIm1hbnVhbFN0ZXBFbWl0dGVyIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsImZvckVhY2giLCJjYXJvdXNlbCIsIm1hbmFnZWRFbGVtZW50cyIsImFjdGl2YXRlIiwiYmVsdFZpc2liaWxpdHlVcGRhdGVkIiwiaXNBbmltYXRpbmciLCJiaWtlckFuZEdlbmVyYXRvclNlbGVjdGVkIiwidmFsdWUiLCJpc1Zpc2libGVQcm9wZXJ0eSIsInNldCIsImRpcmVjdENvdXBsaW5nTW9kZVByb3BlcnR5IiwiYW5pbWF0aW9uSW5Qcm9ncmVzc1Byb3BlcnR5IiwibGluayIsImVuZXJneUNodW5rc1Zpc2libGUiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwicHJlbG9hZEVuZXJneUNodW5rcyIsInJlc2V0IiwiZ2V0U2VsZWN0ZWRFbGVtZW50IiwiZGVhY3RpdmF0ZSIsInRhcmdldEVsZW1lbnROYW1lUHJvcGVydHkiLCJtYW51YWxTdGVwIiwic3RlcE1vZGVsIiwiU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMIiwiZW1pdCIsInN0ZXAiLCJkdCIsImdldCIsInNvdXJjZSIsImNvbnZlcnRlciIsInVzZXIiLCJlbmVyZ3lGcm9tU291cmNlIiwiaW5qZWN0RW5lcmd5Q2h1bmtzIiwiZXh0cmFjdE91dGdvaW5nRW5lcmd5Q2h1bmtzIiwiZW5lcmd5RnJvbUNvbnZlcnRlciIsImdldEVuZXJneU91dHB1dFJhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN5c3RlbXNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBtb2RlbCBmb3IgdGhlICdTeXN0ZW1zJyBzY3JlZW4gb2YgdGhlIEVuZXJneSBGb3JtcyBBbmQgQ2hhbmdlcyBzaW11bGF0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBFRkFDQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rR3JvdXAgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneUNodW5rR3JvdXAuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBCZWFrZXJIZWF0ZXIgZnJvbSAnLi9CZWFrZXJIZWF0ZXIuanMnO1xyXG5pbXBvcnQgQmVsdCBmcm9tICcuL0JlbHQuanMnO1xyXG5pbXBvcnQgQmlrZXIgZnJvbSAnLi9CaWtlci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwIGZyb20gJy4vRW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cC5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTeXN0ZW1FbGVtZW50Q2Fyb3VzZWwgZnJvbSAnLi9FbmVyZ3lTeXN0ZW1FbGVtZW50Q2Fyb3VzZWwuanMnO1xyXG5pbXBvcnQgRmFuIGZyb20gJy4vRmFuLmpzJztcclxuaW1wb3J0IEZhdWNldEFuZFdhdGVyIGZyb20gJy4vRmF1Y2V0QW5kV2F0ZXIuanMnO1xyXG5pbXBvcnQgRmx1b3Jlc2NlbnRCdWxiIGZyb20gJy4vRmx1b3Jlc2NlbnRCdWxiLmpzJztcclxuaW1wb3J0IEdlbmVyYXRvciBmcm9tICcuL0dlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBJbmNhbmRlc2NlbnRCdWxiIGZyb20gJy4vSW5jYW5kZXNjZW50QnVsYi5qcyc7XHJcbmltcG9ydCBTb2xhclBhbmVsIGZyb20gJy4vU29sYXJQYW5lbC5qcyc7XHJcbmltcG9ydCBTdW5FbmVyZ3lTb3VyY2UgZnJvbSAnLi9TdW5FbmVyZ3lTb3VyY2UuanMnO1xyXG5pbXBvcnQgVGVhS2V0dGxlIGZyb20gJy4vVGVhS2V0dGxlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBPRkZTRVRfQkVUV0VFTl9FTEVNRU5UU19PTl9DQVJPVVNFTCA9IG5ldyBWZWN0b3IyKCAwLCAtMC40ICk7IC8vIGluIG1ldGVyc1xyXG5jb25zdCBFTkVSR1lfU09VUkNFU19DQVJPVVNFTF9TRUxFQ1RFRF9FTEVNRU5UX1BPU0lUSU9OID0gbmV3IFZlY3RvcjIoIC0wLjE1LCAwICk7IC8vIGluIG1ldGVyc1xyXG5jb25zdCBFTkVSR1lfQ09OVkVSVEVSU19DQVJPVVNFTF9TRUxFQ1RFRF9FTEVNRU5UX1BPU0lUSU9OID0gbmV3IFZlY3RvcjIoIC0wLjAyNSwgMCApOyAvLyBpbiBtZXRlcnNcclxuXHJcbmNsYXNzIFN5c3RlbXNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIC8vIHRhbmRlbXMgdG8gbmVzdCBlbmVyZ3kgc3lzdGVtcyBpbiBTdHVkaW9cclxuICAgIGNvbnN0IGVuZXJneVNvdXJjZXNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5U291cmNlcycgKTtcclxuICAgIGNvbnN0IGVuZXJneUNvbnZlcnRlcnNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5Q29udmVydGVycycgKTtcclxuICAgIGNvbnN0IGVuZXJneVVzZXJzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVVzZXJzJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBzZWUgaW4gRUZBQ0ludHJvTW9kZWwgZm9yIGRvY1xyXG4gICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBlbmVyZ3kgY2h1bmtzIGFyZSB2aXNpYmxlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0Jvb2xlYW5Qcm9wZXJ0eX0gLSBpcyB0aGUgc2ltIHJ1bm5pbmcgb3IgcGF1c2VkP1xyXG4gICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNQbGF5aW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBzY3JlZW4gaXMgcGxheWluZyBvciBwYXVzZWQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBGb3IgUGhFVC1pTyBzdXBwb3J0LiBUaGlzIHR5cGUgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGFuZCBkZXN0cm95aW5nIGFsbCBFbmVyZ3lDaHVua3MgaW4gdGhpcyBtb2RlbC5cclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCA9IG5ldyBFbmVyZ3lDaHVua0dyb3VwKCB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmVyZ3lDaHVua0dyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBGb3IgUGhFVC1pTyBzdXBwb3J0LiBUaGlzIHR5cGUgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGFuZCBkZXN0cm95aW5nIGFsbCBFbmVyZ3lDaHVua1BhdGhNb3ZlclxyXG4gICAgLy8gaW5zdGFuY2VzIGluIHRoaXMgbW9kZWwuXHJcbiAgICB0aGlzLmVuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAgPSBuZXcgRW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCggdGhpcy5lbmVyZ3lDaHVua0dyb3VwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneUNodW5rUGF0aE1vdmVyR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGVuZXJneSBjb252ZXJ0ZXJzXHJcbiAgICB0aGlzLmdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IoXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAsXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5Q29udmVydGVyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdnZW5lcmF0b3InIClcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5zb2xhclBhbmVsID0gbmV3IFNvbGFyUGFuZWwoXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAsXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5Q29udmVydGVyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzb2xhclBhbmVsJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGVuZXJneSBzb3VyY2VzXHJcbiAgICB0aGlzLmJpa2VyID0gbmV3IEJpa2VyKFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5nZW5lcmF0b3IuYWN0aXZlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLCB7XHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lTb3VyY2VzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Jpa2VyJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmZhdWNldEFuZFdhdGVyID0gbmV3IEZhdWNldEFuZFdhdGVyKFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5nZW5lcmF0b3IuYWN0aXZlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5U291cmNlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdmYXVjZXRBbmRXYXRlcicgKVxyXG4gICAgICB9ICk7XHJcbiAgICB0aGlzLnN1biA9IG5ldyBTdW5FbmVyZ3lTb3VyY2UoXHJcbiAgICAgIHRoaXMuc29sYXJQYW5lbCxcclxuICAgICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5U291cmNlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzdW4nIClcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy50ZWFLZXR0bGUgPSBuZXcgVGVhS2V0dGxlKFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5nZW5lcmF0b3IuYWN0aXZlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLCB7XHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lTb3VyY2VzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlYUtldHRsZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgd2hlZWwxQ2VudGVyID0gRU5FUkdZX1NPVVJDRVNfQ0FST1VTRUxfU0VMRUNURURfRUxFTUVOVF9QT1NJVElPTi5wbHVzKCBCaWtlci5DRU5URVJfT0ZfQkFDS19XSEVFTF9PRkZTRVQgKTtcclxuICAgIGNvbnN0IHdoZWVsMkNlbnRlciA9IEVORVJHWV9DT05WRVJURVJTX0NBUk9VU0VMX1NFTEVDVEVEX0VMRU1FTlRfUE9TSVRJT04ucGx1cyggR2VuZXJhdG9yLldIRUVMX0NFTlRFUl9PRkZTRVQgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGJlbHQgdGhhdCBjb25uZWN0cyBiaWtlciB0byBnZW5lcmF0b3IsIHdoaWNoIGlzIG5vdCBvbiBhIGNhcm91c2VsXHJcbiAgICB0aGlzLmJlbHQgPSBuZXcgQmVsdCggQmlrZXIuUkVBUl9XSEVFTF9SQURJVVMsIHdoZWVsMUNlbnRlciwgR2VuZXJhdG9yLldIRUVMX1JBRElVUywgd2hlZWwyQ2VudGVyICk7XHJcblxyXG4gICAgLy8gLy8gQHB1YmxpYyAocmVhZC1vbmx5KSBlbmVyZ3kgdXNlcnNcclxuICAgIHRoaXMuZmFuID0gbmV3IEZhbihcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLCB7XHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lVc2Vyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdmYW4nIClcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5pbmNhbmRlc2NlbnRCdWxiID0gbmV3IEluY2FuZGVzY2VudEJ1bGIoXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAsXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5VXNlcnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5jYW5kZXNjZW50QnVsYicgKVxyXG4gICAgICB9ICk7XHJcbiAgICB0aGlzLmZsdW9yZXNjZW50QnVsYiA9IG5ldyBGbHVvcmVzY2VudEJ1bGIoXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rR3JvdXAsXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtQYXRoTW92ZXJHcm91cCwge1xyXG4gICAgICAgIHRhbmRlbTogZW5lcmd5VXNlcnNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnZmx1b3Jlc2NlbnRCdWxiJyApXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYmVha2VySGVhdGVyID0gbmV3IEJlYWtlckhlYXRlciggdGhpcy5lbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAgdGhpcy5lbmVyZ3lDaHVua1BhdGhNb3Zlckdyb3VwLCB7XHJcbiAgICAgICAgdGFuZGVtOiBlbmVyZ3lVc2Vyc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdiZWFrZXJIZWF0ZXInIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgY2Fyb3VzZWxzIHRoYXQgY29udHJvbCB0aGUgcG9zaXRpb25zIG9mIHRoZSBlbmVyZ3kgc291cmNlcywgY29udmVydGVycywgYW5kIHVzZXJzXHJcbiAgICB0aGlzLmVuZXJneVNvdXJjZXNDYXJvdXNlbCA9IG5ldyBFbmVyZ3lTeXN0ZW1FbGVtZW50Q2Fyb3VzZWwoXHJcbiAgICAgIFsgdGhpcy5iaWtlciwgdGhpcy5mYXVjZXRBbmRXYXRlciwgdGhpcy5zdW4sIHRoaXMudGVhS2V0dGxlIF0sXHJcbiAgICAgIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ0JJS0VSJywgJ0ZBVUNFVCcsICdTVU4nLCAnVEVBX0tFVFRMRScgXSApLFxyXG4gICAgICBFTkVSR1lfU09VUkNFU19DQVJPVVNFTF9TRUxFQ1RFRF9FTEVNRU5UX1BPU0lUSU9OLFxyXG4gICAgICBPRkZTRVRfQkVUV0VFTl9FTEVNRU5UU19PTl9DQVJPVVNFTCxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVNvdXJjZXNDYXJvdXNlbCcgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZW5lcmd5Q29udmVydGVyc0Nhcm91c2VsID0gbmV3IEVuZXJneVN5c3RlbUVsZW1lbnRDYXJvdXNlbChcclxuICAgICAgWyB0aGlzLmdlbmVyYXRvciwgdGhpcy5zb2xhclBhbmVsIF0sXHJcbiAgICAgIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ0dFTkVSQVRPUicsICdTT0xBUl9QQU5FTCcgXSApLFxyXG4gICAgICBFTkVSR1lfQ09OVkVSVEVSU19DQVJPVVNFTF9TRUxFQ1RFRF9FTEVNRU5UX1BPU0lUSU9OLFxyXG4gICAgICBPRkZTRVRfQkVUV0VFTl9FTEVNRU5UU19PTl9DQVJPVVNFTCxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneUNvbnZlcnRlcnNDYXJvdXNlbCcgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZW5lcmd5VXNlcnNDYXJvdXNlbCA9IG5ldyBFbmVyZ3lTeXN0ZW1FbGVtZW50Q2Fyb3VzZWwoXHJcbiAgICAgIFsgdGhpcy5iZWFrZXJIZWF0ZXIsIHRoaXMuaW5jYW5kZXNjZW50QnVsYiwgdGhpcy5mbHVvcmVzY2VudEJ1bGIsIHRoaXMuZmFuIF0sXHJcbiAgICAgIEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ0JFQUtFUl9IRUFURVInLCAnSU5DQU5ERVNDRU5UX0JVTEInLCAnRkxVT1JFU0NFTlRfQlVMQicsICdGQU4nIF0gKSxcclxuXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLjA5LCAwICksXHJcbiAgICAgIE9GRlNFVF9CRVRXRUVOX0VMRU1FTlRTX09OX0NBUk9VU0VMLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5VXNlcnNDYXJvdXNlbCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RW5lcmd5U3lzdGVtRWxlbWVudENhcm91c2VsW119XHJcbiAgICB0aGlzLmNhcm91c2VscyA9IFtcclxuICAgICAgdGhpcy5lbmVyZ3lTb3VyY2VzQ2Fyb3VzZWwsXHJcbiAgICAgIHRoaXMuZW5lcmd5Q29udmVydGVyc0Nhcm91c2VsLFxyXG4gICAgICB0aGlzLmVuZXJneVVzZXJzQ2Fyb3VzZWxcclxuICAgIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHVzZWQgdG8gbm90aWZ5IHRoZSB2aWV3IHRoYXQgYSBtYW51YWwgc3RlcCB3YXMgY2FsbGVkXHJcbiAgICB0aGlzLm1hbnVhbFN0ZXBFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ251bWJlcicgfSBdIH0gKTtcclxuXHJcbiAgICAvLyBzZXQgaXNBY3RpdmUgPSB0cnVlIGZvciB0aGUgZmlyc3QgZWxlbWVudCBpbiBlYWNoIGNhcm91c2VsXHJcbiAgICB0aGlzLmNhcm91c2Vscy5mb3JFYWNoKCBjYXJvdXNlbCA9PiB7XHJcbiAgICAgIGNhcm91c2VsLm1hbmFnZWRFbGVtZW50c1sgMCBdLmFjdGl2YXRlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkcyB0aGUgZnVuY3Rpb25hbGl0eSB0byBzaG93L2hpZGUgdGhlIGJlbHQgdGhhdCBpbnRlcmNvbm5lY3RzIHRoZSBiaWtlciBhbmQgdGhlIGdlbmVyYXRvclxyXG4gICAgY29uc3QgYmVsdFZpc2liaWxpdHlVcGRhdGVkID0gaXNBbmltYXRpbmcgPT4ge1xyXG4gICAgICBjb25zdCBiaWtlckFuZEdlbmVyYXRvclNlbGVjdGVkID0gKCAhaXNBbmltYXRpbmcgJiYgdGhpcy5iaWtlci5hY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRvci5hY3RpdmVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICB0aGlzLmJlbHQuaXNWaXNpYmxlUHJvcGVydHkuc2V0KCBiaWtlckFuZEdlbmVyYXRvclNlbGVjdGVkICk7XHJcbiAgICAgIHRoaXMuZ2VuZXJhdG9yLmRpcmVjdENvdXBsaW5nTW9kZVByb3BlcnR5LnNldCggYmlrZXJBbmRHZW5lcmF0b3JTZWxlY3RlZCApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmVuZXJneVNvdXJjZXNDYXJvdXNlbC5hbmltYXRpb25JblByb2dyZXNzUHJvcGVydHkubGluayggYmVsdFZpc2liaWxpdHlVcGRhdGVkICk7XHJcbiAgICB0aGlzLmVuZXJneUNvbnZlcnRlcnNDYXJvdXNlbC5hbmltYXRpb25JblByb2dyZXNzUHJvcGVydHkubGluayggYmVsdFZpc2liaWxpdHlVcGRhdGVkICk7XHJcblxyXG4gICAgLy8gbW9uaXRvciB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZW5lcmd5IGNodW5rcyBhbmQgbWFrZSBzdXJlIHRoZXkgYXJlIGluIHRoZSByaWdodCBwbGFjZXMgd2hlbiB0aGlzIGNoYW5nZXNcclxuICAgIHRoaXMuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGVuZXJneUNodW5rc1Zpc2libGUgPT4ge1xyXG5cclxuICAgICAgLy8gV2hlbiBzZXR0aW5nIFBoRVQtaU8gc3RhdGUsIGVuZXJneSBjaHVua3MgYXJlIHBvc2l0aW9uZWQgYmFzZWQgb24gdGhlIHN0YXRlLlxyXG4gICAgICBpZiAoIGVuZXJneUNodW5rc1Zpc2libGUgJiYgIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5wcmVsb2FkRW5lcmd5Q2h1bmtzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlc3RvcmUgdGhlIGluaXRpYWwgc3RhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuY2Fyb3VzZWxzLmZvckVhY2goIGNhcm91c2VsID0+IHtcclxuICAgICAgY2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCkuZGVhY3RpdmF0ZSgpO1xyXG4gICAgICBjYXJvdXNlbC50YXJnZXRFbGVtZW50TmFtZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIGNhcm91c2VsLmdldFNlbGVjdGVkRWxlbWVudCgpLmFjdGl2YXRlKCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoZSBzaW0gZm9yd2FyZCBieSBvbmUgZml4ZWQgbm9taW5hbCBmcmFtZSB0aW1lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBNb2RlbCggRUZBQ0NvbnN0YW50cy5TSU1fVElNRV9QRVJfVElDS19OT1JNQUwgKTtcclxuICAgIHRoaXMubWFudWFsU3RlcEVtaXR0ZXIuZW1pdCggRUZBQ0NvbnN0YW50cy5TSU1fVElNRV9QRVJfVElDS19OT1JNQUwgKTsgLy8gbm90aWZ5IHRoZSB2aWV3XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIGZ1bmN0aW9uIG9yIHRoaXMgbW9kZWwsIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IGpvaXN0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBlbGVtZW50cyBtYW5hZ2VkIGJ5IGNhcm91c2VscyBuZWVkIHRvIGJlIHNjcm9sbGFibGUvc2VsZWN0YWJsZSByZWdhcmRsZXNzIG9mIHBsYXkvcGF1c2Ugc3RhdGVcclxuICAgIHRoaXMuY2Fyb3VzZWxzLmZvckVhY2goIGNhcm91c2VsID0+IHtcclxuICAgICAgY2Fyb3VzZWwuc3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNQbGF5aW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMuc3RlcE1vZGVsKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCB0aGUgbW9kZWwgaW4gdGltZVxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSB0aW1lIHN0ZXAgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwTW9kZWwoIGR0ICkge1xyXG4gICAgY29uc3Qgc291cmNlID0gdGhpcy5lbmVyZ3lTb3VyY2VzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSB0aGlzLmVuZXJneUNvbnZlcnRlcnNDYXJvdXNlbC5nZXRTZWxlY3RlZEVsZW1lbnQoKTtcclxuICAgIGNvbnN0IHVzZXIgPSB0aGlzLmVuZXJneVVzZXJzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcblxyXG4gICAgLy8ge0VuZXJneX0gLSBzdGVwIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZW5lcmd5IHN5c3RlbSBlbGVtZW50cyBhbmQgdHJhbnNmZXIgZW5lcmd5IGNodW5rcyBpbiBiZXR3ZWVuIGVhY2ggc3RlcFxyXG4gICAgY29uc3QgZW5lcmd5RnJvbVNvdXJjZSA9IHNvdXJjZS5zdGVwKCBkdCApO1xyXG4gICAgY29udmVydGVyLmluamVjdEVuZXJneUNodW5rcyggc291cmNlLmV4dHJhY3RPdXRnb2luZ0VuZXJneUNodW5rcygpICk7XHJcbiAgICBjb25zdCBlbmVyZ3lGcm9tQ29udmVydGVyID0gY29udmVydGVyLnN0ZXAoIGR0LCBlbmVyZ3lGcm9tU291cmNlICk7XHJcbiAgICB1c2VyLmluamVjdEVuZXJneUNodW5rcyggY29udmVydGVyLmV4dHJhY3RPdXRnb2luZ0VuZXJneUNodW5rcygpICk7XHJcbiAgICB1c2VyLnN0ZXAoIGR0LCBlbmVyZ3lGcm9tQ29udmVydGVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmUtbG9hZCB0aGUgY3VycmVudGx5IGFjdGl2ZSBlbmVyZ3kgc3lzdGVtIGVsZW1lbnRzIHdpdGggZW5lcmd5IGNodW5rcyBzbyB0aGF0IHRoZSBlbmVyZ3kgY2h1bmtzIGFyZSBmdWxseVxyXG4gICAqIHByb3BhZ2F0ZWQgaW50byB0aGUgZWxlbWVudHMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwcmVsb2FkRW5lcmd5Q2h1bmtzKCkge1xyXG4gICAgY29uc3Qgc291cmNlID0gdGhpcy5lbmVyZ3lTb3VyY2VzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSB0aGlzLmVuZXJneUNvbnZlcnRlcnNDYXJvdXNlbC5nZXRTZWxlY3RlZEVsZW1lbnQoKTtcclxuICAgIGNvbnN0IHVzZXIgPSB0aGlzLmVuZXJneVVzZXJzQ2Fyb3VzZWwuZ2V0U2VsZWN0ZWRFbGVtZW50KCk7XHJcblxyXG4gICAgc291cmNlLnByZWxvYWRFbmVyZ3lDaHVua3MoKTtcclxuICAgIGNvbnZlcnRlci5wcmVsb2FkRW5lcmd5Q2h1bmtzKCBzb3VyY2UuZ2V0RW5lcmd5T3V0cHV0UmF0ZSgpICk7XHJcbiAgICB1c2VyLnByZWxvYWRFbmVyZ3lDaHVua3MoIGNvbnZlcnRlci5nZXRFbmVyZ3lPdXRwdXRSYXRlKCkgKTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ1N5c3RlbXNNb2RlbCcsIFN5c3RlbXNNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBTeXN0ZW1zTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLHFCQUFxQixNQUFNLG1EQUFtRDtBQUNyRixPQUFPQyxhQUFhLE1BQU0sK0JBQStCO0FBQ3pELE9BQU9DLGdCQUFnQixNQUFNLHdDQUF3QztBQUNyRSxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxJQUFJLE1BQU0sV0FBVztBQUM1QixPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFDdEUsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBQzFFLE9BQU9DLEdBQUcsTUFBTSxVQUFVO0FBQzFCLE9B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