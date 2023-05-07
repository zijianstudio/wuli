// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model element that represents a beaker which contains a fluid. The fluid contains energy, which includes energy
 * chunks, and has a temperature.
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import BeakerType from './BeakerType.js';
import EnergyChunkContainerSlice from './EnergyChunkContainerSlice.js';
import energyChunkDistributor from './energyChunkDistributor.js';
import EnergyContainerCategory from './EnergyContainerCategory.js';
import EnergyType from './EnergyType.js';
import HorizontalSurface from './HorizontalSurface.js';
import RectangularThermalMovableModelElement from './RectangularThermalMovableModelElement.js';
import ThermalContactArea from './ThermalContactArea.js';

// constants
const MATERIAL_THICKNESS = 0.001; // In meters.
const NUM_SLICES = 6;
const STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.
const SWITCH_TO_FASTER_ALGORITHM_THRESHOLD = 10; // in milliseconds, empirically determined, see usage for more info
const BeakerTypeEnumerationIO = EnumerationIO(BeakerType);
const BEAKER_COMPOSITION = {};
BEAKER_COMPOSITION[BeakerType.WATER] = {
  fluidColor: EFACConstants.WATER_COLOR_IN_BEAKER,
  steamColor: EFACConstants.WATER_STEAM_COLOR,
  fluidSpecificHeat: EFACConstants.WATER_SPECIFIC_HEAT,
  fluidDensity: EFACConstants.WATER_DENSITY,
  fluidBoilingPoint: EFACConstants.WATER_BOILING_POINT_TEMPERATURE,
  energyContainerCategory: EnergyContainerCategory.WATER
};
BEAKER_COMPOSITION[BeakerType.OLIVE_OIL] = {
  fluidColor: EFACConstants.OLIVE_OIL_COLOR_IN_BEAKER,
  steamColor: EFACConstants.OLIVE_OIL_STEAM_COLOR,
  fluidSpecificHeat: EFACConstants.OLIVE_OIL_SPECIFIC_HEAT,
  fluidDensity: EFACConstants.OLIVE_OIL_DENSITY,
  fluidBoilingPoint: EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
  energyContainerCategory: EnergyContainerCategory.OLIVE_OIL
};

// file variable used for measuring performance during startup, see usage for more information
let performanceMeasurementTaken = false;
class Beaker extends RectangularThermalMovableModelElement {
  /**
   * @param {Vector2} initialPosition - position where center bottom of beaker will be in model space
   * @param {number} width
   * @param {number} height
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor(initialPosition, width, height, energyChunksVisibleProperty, energyChunkGroup, options) {
    options = merge({
      beakerType: BeakerType.WATER,
      majorTickMarkDistance: height * 0.95 / 2,
      // empirically determined
      predistributedEnergyChunkConfigurations: ENERGY_CHUNK_PRESET_CONFIGURATIONS,
      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: Beaker.BeakerIO,
      phetioDocumentation: 'beaker that contains either water or olive oil, and may also contain blocks'
    }, options);

    // calculate the mass of the beaker
    const mass = Math.PI * Math.pow(width / 2, 2) * height * EFACConstants.INITIAL_FLUID_PROPORTION * BEAKER_COMPOSITION[options.beakerType].fluidDensity;
    super(initialPosition, width, height, mass, BEAKER_COMPOSITION[options.beakerType].fluidSpecificHeat, energyChunksVisibleProperty, energyChunkGroup, options);

    // @private
    this.width = width;
    this.height = height;
    this._energyContainerCategory = BEAKER_COMPOSITION[options.beakerType].energyContainerCategory;

    // @public {BeakerType} (read-only)
    this.beakerType = options.beakerType;

    // @public {Color) - the color of the fluid in the beaker
    this.fluidColor = BEAKER_COMPOSITION[options.beakerType].fluidColor;

    // @public {Color) - the color of the steam that comes from the beaker
    this.steamColor = BEAKER_COMPOSITION[options.beakerType].steamColor;

    // @public {number} - the boiling point temperature of the fluid in the beaker
    this.fluidBoilingPoint = BEAKER_COMPOSITION[options.beakerType].fluidBoilingPoint;

    // @public {number} - the distance between major tick marks on the side of the beaker
    this.majorTickMarkDistance = options.majorTickMarkDistance;

    // @public {Property.<number>} - proportion of fluid in the beaker, should only be set in sub-types
    this.fluidProportionProperty = new NumberProperty(EFACConstants.INITIAL_FLUID_PROPORTION, {
      range: new Range(EFACConstants.INITIAL_FLUID_PROPORTION, 1),
      tandem: options.tandem.createTandem('fluidProportionProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the proportion of fluid in the beaker'
    });

    // @public (read-only) {number} - indicator of how much steam is being emitted, ranges from 0 to 1 where 0 is no
    // steam, 1 is the max amount (full boil)
    this.steamingProportion = 0;

    // @public (read-only) - indicates when a reset starts and finished
    this.resetInProgressProperty = new BooleanProperty(false);

    // @private {number} - max height above water where steam still affects the measured temperature
    this.maxSteamHeight = 2 * height;

    // @protected {ThermalContactArea} - see base class for info
    this.thermalContactArea = new ThermalContactArea(new Bounds2(initialPosition.x - this.width / 2, initialPosition.y, initialPosition.x + this.width / 2, initialPosition.y + this.height * this.fluidProportionProperty.get()), true);

    // add position test bounds - left side, bottom, right side (see declaration in base class for more info)
    this.relativePositionTestingBoundsList.push(new Bounds2(-width / 2 - MATERIAL_THICKNESS / 2, 0, -width / 2 + MATERIAL_THICKNESS / 2, height));
    this.relativePositionTestingBoundsList.push(new Bounds2(-width / 2, 0, width / 2, MATERIAL_THICKNESS));
    this.relativePositionTestingBoundsList.push(new Bounds2(width / 2 - MATERIAL_THICKNESS / 2, 0, width / 2 + MATERIAL_THICKNESS / 2, height));
    const bounds = this.getBounds();

    // @public - see base class for description
    this.topSurface = new HorizontalSurface(new Vector2(initialPosition.x, bounds.minY + MATERIAL_THICKNESS), width, this);

    // @public - see base class for description
    this.bottomSurface = new HorizontalSurface(new Vector2(initialPosition.x, bounds.minY), width, this);

    // update internal state when the position changes
    this.positionProperty.link(position => {
      const bounds = this.getBounds();

      // update the positions of the top and bottom surfaces
      this.topSurface.positionProperty.set(new Vector2(position.x, bounds.minY + MATERIAL_THICKNESS));
      this.bottomSurface.positionProperty.set(new Vector2(position.x, bounds.minY));

      // update the thermal contact area
      this.thermalContactArea.setMinMax(position.x - this.width / 2, position.y, position.x + this.width / 2, position.y + this.height * this.fluidProportionProperty.get());
    });

    // update internal state when the fluid level changes
    this.fluidProportionProperty.link((newFluidProportion, oldFluidProportion) => {
      // update the thermal contact area
      const position = this.positionProperty.get();
      this.thermalContactArea.setMinMax(position.x - this.width / 2, position.y, position.x + this.width / 2, position.y + this.height * this.fluidProportionProperty.get());

      // update the bounds of the energy chunk slices
      // When setting PhET-iO state, the slices' height is already updated
      if (oldFluidProportion && !phet.joist.sim.isSettingPhetioStateProperty.value) {
        const multiplier = newFluidProportion / oldFluidProportion;
        this.slices.forEach(slice => {
          slice.updateHeight(multiplier);
        });
      }

      // kick off redistribution of the energy chunks
      this.resetECDistributionCountdown();
    });
  }

  /**
   * step the beaker in time
   * @param {number} dt - delta time (in seconds)
   * @public
   */
  step(dt) {
    const temperature = this.temperatureProperty.get();
    if (temperature > this.fluidBoilingPoint - STEAMING_RANGE) {
      // the fluid is emitting some amount of steam - set the proportionate amount
      this.steamingProportion = Utils.clamp(1 - (this.fluidBoilingPoint - temperature) / STEAMING_RANGE, 0, 1);
    } else {
      this.steamingProportion = 0;
    }
    super.step(dt);
  }

  /**
   * override for adding energy chunks to the beaker
   * @override
   * @protected
   */
  addAndDistributeInitialEnergyChunks(targetNumberOfEnergyChunks) {
    // make a copy of the slice array sorted such that the smallest is first
    let sortedSliceArray = _.sortBy(this.slices.getArray(), slice => {
      return slice.bounds.width * slice.bounds.height;
    });
    const totalSliceArea = this.slices.reduce((accumulator, slice) => {
      return accumulator + slice.bounds.width * slice.bounds.height;
    }, 0);
    const smallOffset = 0.00001; // used so that the ECs don't start on top of each other
    let numberOfEnergyChunksAdded = 0;

    // go through each slice, adding a number of energy chunks based on its proportionate size
    sortedSliceArray.forEach(slice => {
      const sliceArea = slice.bounds.width * slice.bounds.height;
      const sliceCenter = slice.bounds.center;
      _.times(Utils.roundSymmetric(sliceArea / totalSliceArea * targetNumberOfEnergyChunks), index => {
        if (numberOfEnergyChunksAdded < targetNumberOfEnergyChunks) {
          slice.addEnergyChunk(this.energyChunkGroup.createNextElement(EnergyType.THERMAL, sliceCenter.plusXY(smallOffset * index, smallOffset * index), Vector2.ZERO, this.energyChunksVisibleProperty));
          numberOfEnergyChunksAdded++;
        }
      });
    });

    // If the total number of added chunks was not quite enough, work through the list of slices from the biggest to
    // the smallest until they have all been added.
    if (numberOfEnergyChunksAdded < targetNumberOfEnergyChunks) {
      sortedSliceArray = sortedSliceArray.reverse();
      let sliceIndex = 0;
      while (numberOfEnergyChunksAdded < targetNumberOfEnergyChunks) {
        const slice = sortedSliceArray[sliceIndex];
        const sliceCenter = slice.bounds.center;
        slice.addEnergyChunk(this.energyChunkGroup.createNextElement(EnergyType.THERMAL, sliceCenter, Vector2.ZERO, this.energyChunksVisibleProperty));
        numberOfEnergyChunksAdded++;
        sliceIndex = (sliceIndex + 1) % sortedSliceArray.length;
      }
    }

    // clear the distribution timer and do a more thorough distribution below
    this.clearECDistributionCountdown();

    // If this is the water beaker, and it's the first time energy chunks have been added, measure the performance
    // and, if it is found to be low, switch to a higher performance (but visually inferior) algorithm for distributing
    // the energy chunks.  This was found to be necessary on some platforms, see
    // https://github.com/phetsims/energy-forms-and-changes/issues/191.
    if (this.specificHeat === EFACConstants.WATER_SPECIFIC_HEAT && !performanceMeasurementTaken) {
      const startTime = window.performance.now();
      const numberOfIterations = 10; // empirically determined to give a reasonably consistent value
      for (let i = 0; i < numberOfIterations; i++) {
        energyChunkDistributor.updatePositions(this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL);
      }
      const averageIterationTime = (window.performance.now() - startTime) / numberOfIterations;
      if (averageIterationTime > SWITCH_TO_FASTER_ALGORITHM_THRESHOLD) {
        // Performance on this device is poor, switch to the less computationally intenstive distribution algorithm,
        // but only if something else wasn't explicitly specified.
        if (EFACQueryParameters.ecDistribution === null) {
          energyChunkDistributor.setDistributionAlgorithm('spiral');
        }
      }
      performanceMeasurementTaken = true;
    }

    // distribute the initial energy chunks within the container
    for (let i = 0; i < EFACConstants.MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES; i++) {
      const distributed = energyChunkDistributor.updatePositions(this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL);
      if (!distributed) {
        break;
      }
    }
  }

  /**
   * get the area where the temperature of the steam can be sensed
   * @returns {Rectangle}
   * @public
   */
  getSteamArea() {
    // height of steam rectangle is based on beaker height and steamingProportion
    const liquidWaterHeight = this.height * this.fluidProportionProperty.value;
    const position = this.positionProperty.value;
    return new Rectangle(position.x - this.width / 2, position.y + liquidWaterHeight, this.width, this.maxSteamHeight);
  }

  /**
   * get the temperature value above the beaker at the given height
   * @param {number} heightAboveWater
   * @returns {number}
   * @public
   */
  getSteamTemperature(heightAboveWater) {
    const mappingFunction = new LinearFunction(0, this.maxSteamHeight * this.steamingProportion, this.temperatureProperty.value, EFACConstants.ROOM_TEMPERATURE);
    return Math.max(mappingFunction.evaluate(heightAboveWater), EFACConstants.ROOM_TEMPERATURE);
  }

  /**
   * add the initial energy chunk slices, called in super constructor
   * @protected
   * @override
   */
  addEnergyChunkSlices() {
    assert && assert(this.slices.length === 0); // Check that his has not been already called.

    const fluidRect = new Rectangle(this.positionProperty.value.x - this.width / 2, this.positionProperty.value.y, this.width, this.height * EFACConstants.INITIAL_FLUID_PROPORTION);
    const widthYProjection = Math.abs(this.width * EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER);
    for (let i = 0; i < NUM_SLICES; i++) {
      const proportion = (i + 1) * (1 / (NUM_SLICES + 1));

      // The slice width is calculated to fit into the 3D projection. It uses an exponential function that is shifted
      // in order to yield width value proportional to position in Z-space.
      const sliceWidth = (-Math.pow(2 * proportion - 1, 2) + 1) * fluidRect.width;
      const bottomY = fluidRect.minY - widthYProjection / 2 + proportion * widthYProjection;
      const zPosition = -proportion * this.width;
      const sliceBounds = Bounds2.rect(fluidRect.centerX - sliceWidth / 2, bottomY, sliceWidth, fluidRect.height);
      this.slices.push(new EnergyChunkContainerSlice(sliceBounds, zPosition, this.positionProperty, {
        tandem: this.tandem.createTandem(`energyChunkContainerSlice${i}`)
      }));
    }
  }

  /**
   * get the energy container category, which is an enum that is used to determine heat transfer rates
   * @returns {EnergyContainerCategory}
   */
  get energyContainerCategory() {
    return this._energyContainerCategory;
  }

  /**
   * get the beaker energy beyond the max temperature (the boiling point)
   * @public
   * @returns {number}
   */
  getEnergyBeyondMaxTemperature() {
    return Math.max(this.energyProperty.value - this.fluidBoilingPoint * this.mass * this.specificHeat, 0);
  }

  /**
   * get the temperature, but limit it to the boiling point for water (for reaslistic behavior)
   * @returns {number}
   * @override
   * @public
   */
  getTemperature() {
    const temperature = super.getTemperature();
    return Math.min(temperature, this.fluidBoilingPoint);
  }

  /**
   * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
   * slices evenly, and not favor the slices that bump up at the top in order to match the 3D look of the water
   * surface.
   * @param {Vector2} point
   * @override
   * @public
   */
  extractEnergyChunkClosestToPoint(point) {
    let pointIsAboveWaterSurface = true;
    for (let i = 0; i < this.slices.length; i++) {
      if (point.y < this.slices.get(i).bounds.maxY) {
        pointIsAboveWaterSurface = false;
        break;
      }
    }

    // If point is below water surface, call the superclass version.
    if (!pointIsAboveWaterSurface) {
      return super.extractEnergyChunkClosestToPoint(point);
    }

    // Point is above water surface.  Identify the slice with the highest density, since this is where we will get the
    // energy chunk.
    let maxSliceDensity = 0;
    let densestSlice = null;
    this.slices.forEach(slice => {
      const sliceDensity = slice.energyChunkList.length / (slice.bounds.width * slice.bounds.height);
      if (sliceDensity > maxSliceDensity) {
        maxSliceDensity = sliceDensity;
        densestSlice = slice;
      }
    });
    if (densestSlice === null || densestSlice.energyChunkList.length === 0) {
      console.log(' - Warning: No energy chunks in the beaker, can\'t extract any.');
      return null;
    }

    // find the chunk in the chosen slice with the most energy and extract that one
    let highestEnergyChunk = densestSlice.energyChunkList.get(0);
    assert && assert(highestEnergyChunk, 'highestEnergyChunk does not exist');
    densestSlice.energyChunkList.forEach(energyChunk => {
      if (energyChunk.positionProperty.value.y > highestEnergyChunk.positionProperty.value.y) {
        highestEnergyChunk = energyChunk;
      }
    });
    this.removeEnergyChunk(highestEnergyChunk);
    return highestEnergyChunk;
  }

  /**
   * @override
   * @public
   */
  reset() {
    this.resetInProgressProperty.set(true);
    this.fluidProportionProperty.reset();
    super.reset();
    this.resetInProgressProperty.set(false);
  }
}

// Preset data used for fast addition and positioning of energy chunks during reset.  The data contains information
// about the energy chunk slices and energy chunks that are contained within a beaker of a specific size with a specific
// number of energy chunks.  If a match can be found, this data is used to quickly configure the beaker rather than
// using the much more expensive process of inserting and then distributing the energy chunks.  See
// https://github.com/phetsims/energy-forms-and-changes/issues/375.
const ENERGY_CHUNK_PRESET_CONFIGURATIONS = [
// 1st screen water beaker
{
  numberOfSlices: 6,
  totalSliceArea: 0.01816571428571429,
  numberOfEnergyChunks: 34,
  energyChunkPositionsBySlice: [[{
    positionX: 0.15411244536972682,
    positionY: -0.001596201157690377
  }, {
    positionX: 0.14383921119659832,
    positionY: -0.001260263233759202
  }, {
    positionX: 0.14854763957990652,
    positionY: 0.00830833687007631
  }, {
    positionX: 0.13444169054767263,
    positionY: -0.0014006625270237634
  }], [{
    positionX: 0.12733747364166348,
    positionY: 0.006307322179373496
  }, {
    positionX: 0.13653098112389703,
    positionY: 0.014627798547737368
  }, {
    positionX: 0.16435162341152953,
    positionY: 0.014168538445584971
  }, {
    positionX: 0.11931466505878618,
    positionY: 0.0015598813704961255
  }, {
    positionX: 0.17196699261601722,
    positionY: 0.0018462484323476214
  }, {
    positionX: 0.16328922522986383,
    positionY: 0.0029840248926661967
  }], [{
    positionX: 0.10967530710697385,
    positionY: 0.004946701691473413
  }, {
    positionX: 0.18066731295854274,
    positionY: 0.030151905887197336
  }, {
    positionX: 0.1513998312348499,
    positionY: 0.02065394173079762
  }, {
    positionX: 0.12049376099872919,
    positionY: 0.017005245718346496
  }, {
    positionX: 0.18054717913731186,
    positionY: 0.00606404190954684
  }, {
    positionX: 0.17422624544607515,
    positionY: 0.022189193678943488
  }, {
    positionX: 0.10969304238460234,
    positionY: 0.013620569422127976
  }], [{
    positionX: 0.15876462365506805,
    positionY: 0.030152565271325076
  }, {
    positionX: 0.1806506161072284,
    positionY: 0.01572085721843787
  }, {
    positionX: 0.10949017095160922,
    positionY: 0.0335189501208214
  }, {
    positionX: 0.11986679968757023,
    positionY: 0.03067241737522126
  }, {
    positionX: 0.10968480231000388,
    positionY: 0.0235661580930112
  }, {
    positionX: 0.18061385874563657,
    positionY: 0.04070591137030983
  }, {
    positionX: 0.10980600913960631,
    positionY: 0.0419806312520849
  }], [{
    positionX: 0.13441043657486784,
    positionY: 0.028011604802213583
  }, {
    positionX: 0.16200868135223284,
    positionY: 0.0438323010350111
  }, {
    positionX: 0.1690829264258634,
    positionY: 0.03467489643617197
  }, {
    positionX: 0.1198432440386997,
    positionY: 0.04508455550774215
  }, {
    positionX: 0.1284915053227731,
    positionY: 0.03977233053947086
  }, {
    positionX: 0.17155107466312466,
    positionY: 0.04536442546358017
  }], [{
    positionX: 0.14365448174766773,
    positionY: 0.04778775887478084
  }, {
    positionX: 0.15313800764973542,
    positionY: 0.04802268075219778
  }, {
    positionX: 0.13432587784523026,
    positionY: 0.0482263520067694
  }, {
    positionX: 0.14536229693684377,
    positionY: 0.03636622814513492
  }]]
},
// 1st screen olive oil beaker
{
  numberOfSlices: 6,
  totalSliceArea: 0.018165714285714278,
  numberOfEnergyChunks: 8,
  energyChunkPositionsBySlice: [[{
    positionX: 0.24605627438471658,
    positionY: 0.004483938783700345
  }], [{
    positionX: 0.22948250965347144,
    positionY: 0.01135266074270837
  }], [{
    positionX: 0.21287205931111658,
    positionY: 0.014944657983227735
  }, {
    positionX: 0.27050267597978056,
    positionY: 0.01540356272815047
  }], [{
    positionX: 0.25193778046895826,
    positionY: 0.024124778617726085
  }, {
    positionX: 0.21609798058400687,
    positionY: 0.034060410093368784
  }], [{
    positionX: 0.26250244472631645,
    positionY: 0.038454844170679035
  }], [{
    positionX: 0.2391457632103207,
    positionY: 0.041265717223805336
  }]]
},
// 2nd screen water beaker
{
  numberOfSlices: 6,
  totalSliceArea: 0.014142857142857143,
  numberOfEnergyChunks: 20,
  energyChunkPositionsBySlice: [[{
    positionX: -0.005327962195427578,
    positionY: 0.016452296137918262
  }, {
    positionX: 0.005878792977895683,
    positionY: 0.016824467858642923
  }], [{
    positionX: -0.01824245083371954,
    positionY: 0.0194380377241472
  }, {
    positionX: -0.005036590973103385,
    positionY: 0.028944973171205295
  }, {
    positionX: 0.019741565168300078,
    positionY: 0.019279241596617504
  }, {
    positionX: 0.012671290746065678,
    positionY: 0.028710872516212307
  }], [{
    positionX: -0.02069178450187043,
    positionY: 0.031736978154630904
  }, {
    positionX: -0.029717716348298683,
    positionY: 0.023487196795997735
  }, {
    positionX: 0.02956885660028978,
    positionY: 0.024563582772174585
  }, {
    positionX: -0.029712791921195827,
    positionY: 0.037947716659928035
  }], [{
    positionX: -0.029417182256097307,
    positionY: 0.04959850547981442
  }, {
    positionX: 0.028983244342911652,
    positionY: 0.0367018653042737
  }, {
    positionX: 0.0025201526950114975,
    positionY: 0.04204248884226837
  }, {
    positionX: 0.029634091878329008,
    positionY: 0.04910958127835711
  }], [{
    positionX: -0.01228742259426627,
    positionY: 0.04419195535993875
  }, {
    positionX: -0.019066861676811125,
    positionY: 0.05395731390665523
  }, {
    positionX: 0.016355533191846593,
    positionY: 0.04268223621783737
  }, {
    positionX: 0.019084554783501864,
    positionY: 0.05413406883802284
  }], [{
    positionX: -0.005392624572061245,
    positionY: 0.0565126251872509
  }, {
    positionX: 0.005826167710765314,
    positionY: 0.056391565199538224
  }]]
}];
Beaker.BeakerIO = new IOType('BeakerIO', {
  valueType: Beaker,
  toStateObject: beaker => ({
    beakerType: BeakerTypeEnumerationIO.toStateObject(beaker.beakerType)
  }),
  stateSchema: {
    beakerType: BeakerTypeEnumerationIO
  }
});
energyFormsAndChanges.register('Beaker', Beaker);
export default Beaker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiUmVjdGFuZ2xlIiwiVXRpbHMiLCJWZWN0b3IyIiwibWVyZ2UiLCJUYW5kZW0iLCJFbnVtZXJhdGlvbklPIiwiSU9UeXBlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRUZBQ0NvbnN0YW50cyIsIkVGQUNRdWVyeVBhcmFtZXRlcnMiLCJCZWFrZXJUeXBlIiwiRW5lcmd5Q2h1bmtDb250YWluZXJTbGljZSIsImVuZXJneUNodW5rRGlzdHJpYnV0b3IiLCJFbmVyZ3lDb250YWluZXJDYXRlZ29yeSIsIkVuZXJneVR5cGUiLCJIb3Jpem9udGFsU3VyZmFjZSIsIlJlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQiLCJUaGVybWFsQ29udGFjdEFyZWEiLCJNQVRFUklBTF9USElDS05FU1MiLCJOVU1fU0xJQ0VTIiwiU1RFQU1JTkdfUkFOR0UiLCJTV0lUQ0hfVE9fRkFTVEVSX0FMR09SSVRITV9USFJFU0hPTEQiLCJCZWFrZXJUeXBlRW51bWVyYXRpb25JTyIsIkJFQUtFUl9DT01QT1NJVElPTiIsIldBVEVSIiwiZmx1aWRDb2xvciIsIldBVEVSX0NPTE9SX0lOX0JFQUtFUiIsInN0ZWFtQ29sb3IiLCJXQVRFUl9TVEVBTV9DT0xPUiIsImZsdWlkU3BlY2lmaWNIZWF0IiwiV0FURVJfU1BFQ0lGSUNfSEVBVCIsImZsdWlkRGVuc2l0eSIsIldBVEVSX0RFTlNJVFkiLCJmbHVpZEJvaWxpbmdQb2ludCIsIldBVEVSX0JPSUxJTkdfUE9JTlRfVEVNUEVSQVRVUkUiLCJlbmVyZ3lDb250YWluZXJDYXRlZ29yeSIsIk9MSVZFX09JTCIsIk9MSVZFX09JTF9DT0xPUl9JTl9CRUFLRVIiLCJPTElWRV9PSUxfU1RFQU1fQ09MT1IiLCJPTElWRV9PSUxfU1BFQ0lGSUNfSEVBVCIsIk9MSVZFX09JTF9ERU5TSVRZIiwiT0xJVkVfT0lMX0JPSUxJTkdfUE9JTlRfVEVNUEVSQVRVUkUiLCJwZXJmb3JtYW5jZU1lYXN1cmVtZW50VGFrZW4iLCJCZWFrZXIiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxQb3NpdGlvbiIsIndpZHRoIiwiaGVpZ2h0IiwiZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5IiwiZW5lcmd5Q2h1bmtHcm91cCIsIm9wdGlvbnMiLCJiZWFrZXJUeXBlIiwibWFqb3JUaWNrTWFya0Rpc3RhbmNlIiwicHJlZGlzdHJpYnV0ZWRFbmVyZ3lDaHVua0NvbmZpZ3VyYXRpb25zIiwiRU5FUkdZX0NIVU5LX1BSRVNFVF9DT05GSUdVUkFUSU9OUyIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhldGlvVHlwZSIsIkJlYWtlcklPIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIm1hc3MiLCJNYXRoIiwiUEkiLCJwb3ciLCJJTklUSUFMX0ZMVUlEX1BST1BPUlRJT04iLCJfZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnkiLCJmbHVpZFByb3BvcnRpb25Qcm9wZXJ0eSIsInJhbmdlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5Iiwic3RlYW1pbmdQcm9wb3J0aW9uIiwicmVzZXRJblByb2dyZXNzUHJvcGVydHkiLCJtYXhTdGVhbUhlaWdodCIsInRoZXJtYWxDb250YWN0QXJlYSIsIngiLCJ5IiwiZ2V0IiwicmVsYXRpdmVQb3NpdGlvblRlc3RpbmdCb3VuZHNMaXN0IiwicHVzaCIsImJvdW5kcyIsImdldEJvdW5kcyIsInRvcFN1cmZhY2UiLCJtaW5ZIiwiYm90dG9tU3VyZmFjZSIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwicG9zaXRpb24iLCJzZXQiLCJzZXRNaW5NYXgiLCJuZXdGbHVpZFByb3BvcnRpb24iLCJvbGRGbHVpZFByb3BvcnRpb24iLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJtdWx0aXBsaWVyIiwic2xpY2VzIiwiZm9yRWFjaCIsInNsaWNlIiwidXBkYXRlSGVpZ2h0IiwicmVzZXRFQ0Rpc3RyaWJ1dGlvbkNvdW50ZG93biIsInN0ZXAiLCJkdCIsInRlbXBlcmF0dXJlIiwidGVtcGVyYXR1cmVQcm9wZXJ0eSIsImNsYW1wIiwiYWRkQW5kRGlzdHJpYnV0ZUluaXRpYWxFbmVyZ3lDaHVua3MiLCJ0YXJnZXROdW1iZXJPZkVuZXJneUNodW5rcyIsInNvcnRlZFNsaWNlQXJyYXkiLCJfIiwic29ydEJ5IiwiZ2V0QXJyYXkiLCJ0b3RhbFNsaWNlQXJlYSIsInJlZHVjZSIsImFjY3VtdWxhdG9yIiwic21hbGxPZmZzZXQiLCJudW1iZXJPZkVuZXJneUNodW5rc0FkZGVkIiwic2xpY2VBcmVhIiwic2xpY2VDZW50ZXIiLCJjZW50ZXIiLCJ0aW1lcyIsInJvdW5kU3ltbWV0cmljIiwiaW5kZXgiLCJhZGRFbmVyZ3lDaHVuayIsImNyZWF0ZU5leHRFbGVtZW50IiwiVEhFUk1BTCIsInBsdXNYWSIsIlpFUk8iLCJyZXZlcnNlIiwic2xpY2VJbmRleCIsImxlbmd0aCIsImNsZWFyRUNEaXN0cmlidXRpb25Db3VudGRvd24iLCJzcGVjaWZpY0hlYXQiLCJzdGFydFRpbWUiLCJ3aW5kb3ciLCJwZXJmb3JtYW5jZSIsIm5vdyIsIm51bWJlck9mSXRlcmF0aW9ucyIsImkiLCJ1cGRhdGVQb3NpdGlvbnMiLCJTSU1fVElNRV9QRVJfVElDS19OT1JNQUwiLCJhdmVyYWdlSXRlcmF0aW9uVGltZSIsImVjRGlzdHJpYnV0aW9uIiwic2V0RGlzdHJpYnV0aW9uQWxnb3JpdGhtIiwiTUFYX05VTUJFUl9PRl9JTklUSUFMSVpBVElPTl9ESVNUUklCVVRJT05fQ1lDTEVTIiwiZGlzdHJpYnV0ZWQiLCJnZXRTdGVhbUFyZWEiLCJsaXF1aWRXYXRlckhlaWdodCIsImdldFN0ZWFtVGVtcGVyYXR1cmUiLCJoZWlnaHRBYm92ZVdhdGVyIiwibWFwcGluZ0Z1bmN0aW9uIiwiUk9PTV9URU1QRVJBVFVSRSIsIm1heCIsImV2YWx1YXRlIiwiYWRkRW5lcmd5Q2h1bmtTbGljZXMiLCJhc3NlcnQiLCJmbHVpZFJlY3QiLCJ3aWR0aFlQcm9qZWN0aW9uIiwiYWJzIiwiWl9UT19ZX09GRlNFVF9NVUxUSVBMSUVSIiwicHJvcG9ydGlvbiIsInNsaWNlV2lkdGgiLCJib3R0b21ZIiwielBvc2l0aW9uIiwic2xpY2VCb3VuZHMiLCJyZWN0IiwiY2VudGVyWCIsImdldEVuZXJneUJleW9uZE1heFRlbXBlcmF0dXJlIiwiZW5lcmd5UHJvcGVydHkiLCJnZXRUZW1wZXJhdHVyZSIsIm1pbiIsImV4dHJhY3RFbmVyZ3lDaHVua0Nsb3Nlc3RUb1BvaW50IiwicG9pbnQiLCJwb2ludElzQWJvdmVXYXRlclN1cmZhY2UiLCJtYXhZIiwibWF4U2xpY2VEZW5zaXR5IiwiZGVuc2VzdFNsaWNlIiwic2xpY2VEZW5zaXR5IiwiZW5lcmd5Q2h1bmtMaXN0IiwiY29uc29sZSIsImxvZyIsImhpZ2hlc3RFbmVyZ3lDaHVuayIsImVuZXJneUNodW5rIiwicmVtb3ZlRW5lcmd5Q2h1bmsiLCJyZXNldCIsIm51bWJlck9mU2xpY2VzIiwibnVtYmVyT2ZFbmVyZ3lDaHVua3MiLCJlbmVyZ3lDaHVua1Bvc2l0aW9uc0J5U2xpY2UiLCJwb3NpdGlvblgiLCJwb3NpdGlvblkiLCJ2YWx1ZVR5cGUiLCJ0b1N0YXRlT2JqZWN0IiwiYmVha2VyIiwic3RhdGVTY2hlbWEiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJlYWtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBhIGJlYWtlciB3aGljaCBjb250YWlucyBhIGZsdWlkLiBUaGUgZmx1aWQgY29udGFpbnMgZW5lcmd5LCB3aGljaCBpbmNsdWRlcyBlbmVyZ3lcclxuICogY2h1bmtzLCBhbmQgaGFzIGEgdGVtcGVyYXR1cmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9FbnVtZXJhdGlvbklPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVGQUNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vRUZBQ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCZWFrZXJUeXBlIGZyb20gJy4vQmVha2VyVHlwZS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua0NvbnRhaW5lclNsaWNlIGZyb20gJy4vRW5lcmd5Q2h1bmtDb250YWluZXJTbGljZS5qcyc7XHJcbmltcG9ydCBlbmVyZ3lDaHVua0Rpc3RyaWJ1dG9yIGZyb20gJy4vZW5lcmd5Q2h1bmtEaXN0cmlidXRvci5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDb250YWluZXJDYXRlZ29yeSBmcm9tICcuL0VuZXJneUNvbnRhaW5lckNhdGVnb3J5LmpzJztcclxuaW1wb3J0IEVuZXJneVR5cGUgZnJvbSAnLi9FbmVyZ3lUeXBlLmpzJztcclxuaW1wb3J0IEhvcml6b250YWxTdXJmYWNlIGZyb20gJy4vSG9yaXpvbnRhbFN1cmZhY2UuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJUaGVybWFsTW92YWJsZU1vZGVsRWxlbWVudCBmcm9tICcuL1JlY3Rhbmd1bGFyVGhlcm1hbE1vdmFibGVNb2RlbEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgVGhlcm1hbENvbnRhY3RBcmVhIGZyb20gJy4vVGhlcm1hbENvbnRhY3RBcmVhLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVRFUklBTF9USElDS05FU1MgPSAwLjAwMTsgLy8gSW4gbWV0ZXJzLlxyXG5jb25zdCBOVU1fU0xJQ0VTID0gNjtcclxuY29uc3QgU1RFQU1JTkdfUkFOR0UgPSAxMDsgLy8gTnVtYmVyIG9mIGRlZ3JlZXMgS2VsdmluIG92ZXIgd2hpY2ggc3RlYW0gaXMgZW1pdHRlZC5cclxuY29uc3QgU1dJVENIX1RPX0ZBU1RFUl9BTEdPUklUSE1fVEhSRVNIT0xEID0gMTA7IC8vIGluIG1pbGxpc2Vjb25kcywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgc2VlIHVzYWdlIGZvciBtb3JlIGluZm9cclxuY29uc3QgQmVha2VyVHlwZUVudW1lcmF0aW9uSU8gPSBFbnVtZXJhdGlvbklPKCBCZWFrZXJUeXBlICk7XHJcblxyXG5jb25zdCBCRUFLRVJfQ09NUE9TSVRJT04gPSB7fTtcclxuQkVBS0VSX0NPTVBPU0lUSU9OWyBCZWFrZXJUeXBlLldBVEVSIF0gPSB7XHJcbiAgZmx1aWRDb2xvcjogRUZBQ0NvbnN0YW50cy5XQVRFUl9DT0xPUl9JTl9CRUFLRVIsXHJcbiAgc3RlYW1Db2xvcjogRUZBQ0NvbnN0YW50cy5XQVRFUl9TVEVBTV9DT0xPUixcclxuICBmbHVpZFNwZWNpZmljSGVhdDogRUZBQ0NvbnN0YW50cy5XQVRFUl9TUEVDSUZJQ19IRUFULFxyXG4gIGZsdWlkRGVuc2l0eTogRUZBQ0NvbnN0YW50cy5XQVRFUl9ERU5TSVRZLFxyXG4gIGZsdWlkQm9pbGluZ1BvaW50OiBFRkFDQ29uc3RhbnRzLldBVEVSX0JPSUxJTkdfUE9JTlRfVEVNUEVSQVRVUkUsXHJcbiAgZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnk6IEVuZXJneUNvbnRhaW5lckNhdGVnb3J5LldBVEVSXHJcbn07XHJcbkJFQUtFUl9DT01QT1NJVElPTlsgQmVha2VyVHlwZS5PTElWRV9PSUwgXSA9IHtcclxuICBmbHVpZENvbG9yOiBFRkFDQ29uc3RhbnRzLk9MSVZFX09JTF9DT0xPUl9JTl9CRUFLRVIsXHJcbiAgc3RlYW1Db2xvcjogRUZBQ0NvbnN0YW50cy5PTElWRV9PSUxfU1RFQU1fQ09MT1IsXHJcbiAgZmx1aWRTcGVjaWZpY0hlYXQ6IEVGQUNDb25zdGFudHMuT0xJVkVfT0lMX1NQRUNJRklDX0hFQVQsXHJcbiAgZmx1aWREZW5zaXR5OiBFRkFDQ29uc3RhbnRzLk9MSVZFX09JTF9ERU5TSVRZLFxyXG4gIGZsdWlkQm9pbGluZ1BvaW50OiBFRkFDQ29uc3RhbnRzLk9MSVZFX09JTF9CT0lMSU5HX1BPSU5UX1RFTVBFUkFUVVJFLFxyXG4gIGVuZXJneUNvbnRhaW5lckNhdGVnb3J5OiBFbmVyZ3lDb250YWluZXJDYXRlZ29yeS5PTElWRV9PSUxcclxufTtcclxuXHJcbi8vIGZpbGUgdmFyaWFibGUgdXNlZCBmb3IgbWVhc3VyaW5nIHBlcmZvcm1hbmNlIGR1cmluZyBzdGFydHVwLCBzZWUgdXNhZ2UgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxubGV0IHBlcmZvcm1hbmNlTWVhc3VyZW1lbnRUYWtlbiA9IGZhbHNlO1xyXG5cclxuY2xhc3MgQmVha2VyIGV4dGVuZHMgUmVjdGFuZ3VsYXJUaGVybWFsTW92YWJsZU1vZGVsRWxlbWVudCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFBvc2l0aW9uIC0gcG9zaXRpb24gd2hlcmUgY2VudGVyIGJvdHRvbSBvZiBiZWFrZXIgd2lsbCBiZSBpbiBtb2RlbCBzcGFjZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtFbmVyZ3lDaHVua0dyb3VwfSBlbmVyZ3lDaHVua0dyb3VwXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9zaXRpb24sIHdpZHRoLCBoZWlnaHQsIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwgZW5lcmd5Q2h1bmtHcm91cCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgYmVha2VyVHlwZTogQmVha2VyVHlwZS5XQVRFUixcclxuICAgICAgbWFqb3JUaWNrTWFya0Rpc3RhbmNlOiBoZWlnaHQgKiAwLjk1IC8gMiwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICBwcmVkaXN0cmlidXRlZEVuZXJneUNodW5rQ29uZmlndXJhdGlvbnM6IEVORVJHWV9DSFVOS19QUkVTRVRfQ09ORklHVVJBVElPTlMsXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxyXG4gICAgICBwaGV0aW9UeXBlOiBCZWFrZXIuQmVha2VySU8sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdiZWFrZXIgdGhhdCBjb250YWlucyBlaXRoZXIgd2F0ZXIgb3Igb2xpdmUgb2lsLCBhbmQgbWF5IGFsc28gY29udGFpbiBibG9ja3MnXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBtYXNzIG9mIHRoZSBiZWFrZXJcclxuICAgIGNvbnN0IG1hc3MgPSBNYXRoLlBJICogTWF0aC5wb3coIHdpZHRoIC8gMiwgMiApICogaGVpZ2h0ICogRUZBQ0NvbnN0YW50cy5JTklUSUFMX0ZMVUlEX1BST1BPUlRJT04gKlxyXG4gICAgICAgICAgICAgICAgIEJFQUtFUl9DT01QT1NJVElPTlsgb3B0aW9ucy5iZWFrZXJUeXBlIF0uZmx1aWREZW5zaXR5O1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICBpbml0aWFsUG9zaXRpb24sXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHQsXHJcbiAgICAgIG1hc3MsXHJcbiAgICAgIEJFQUtFUl9DT01QT1NJVElPTlsgb3B0aW9ucy5iZWFrZXJUeXBlIF0uZmx1aWRTcGVjaWZpY0hlYXQsXHJcbiAgICAgIGVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgZW5lcmd5Q2h1bmtHcm91cCxcclxuICAgICAgb3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB0aGlzLl9lbmVyZ3lDb250YWluZXJDYXRlZ29yeSA9IEJFQUtFUl9DT01QT1NJVElPTlsgb3B0aW9ucy5iZWFrZXJUeXBlIF0uZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QmVha2VyVHlwZX0gKHJlYWQtb25seSlcclxuICAgIHRoaXMuYmVha2VyVHlwZSA9IG9wdGlvbnMuYmVha2VyVHlwZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDb2xvcikgLSB0aGUgY29sb3Igb2YgdGhlIGZsdWlkIGluIHRoZSBiZWFrZXJcclxuICAgIHRoaXMuZmx1aWRDb2xvciA9IEJFQUtFUl9DT01QT1NJVElPTlsgb3B0aW9ucy5iZWFrZXJUeXBlIF0uZmx1aWRDb2xvcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtDb2xvcikgLSB0aGUgY29sb3Igb2YgdGhlIHN0ZWFtIHRoYXQgY29tZXMgZnJvbSB0aGUgYmVha2VyXHJcbiAgICB0aGlzLnN0ZWFtQ29sb3IgPSBCRUFLRVJfQ09NUE9TSVRJT05bIG9wdGlvbnMuYmVha2VyVHlwZSBdLnN0ZWFtQ29sb3I7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIHRoZSBib2lsaW5nIHBvaW50IHRlbXBlcmF0dXJlIG9mIHRoZSBmbHVpZCBpbiB0aGUgYmVha2VyXHJcbiAgICB0aGlzLmZsdWlkQm9pbGluZ1BvaW50ID0gQkVBS0VSX0NPTVBPU0lUSU9OWyBvcHRpb25zLmJlYWtlclR5cGUgXS5mbHVpZEJvaWxpbmdQb2ludDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gdGhlIGRpc3RhbmNlIGJldHdlZW4gbWFqb3IgdGljayBtYXJrcyBvbiB0aGUgc2lkZSBvZiB0aGUgYmVha2VyXHJcbiAgICB0aGlzLm1ham9yVGlja01hcmtEaXN0YW5jZSA9IG9wdGlvbnMubWFqb3JUaWNrTWFya0Rpc3RhbmNlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIHByb3BvcnRpb24gb2YgZmx1aWQgaW4gdGhlIGJlYWtlciwgc2hvdWxkIG9ubHkgYmUgc2V0IGluIHN1Yi10eXBlc1xyXG4gICAgdGhpcy5mbHVpZFByb3BvcnRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggRUZBQ0NvbnN0YW50cy5JTklUSUFMX0ZMVUlEX1BST1BPUlRJT04sIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggRUZBQ0NvbnN0YW50cy5JTklUSUFMX0ZMVUlEX1BST1BPUlRJT04sIDEgKSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmbHVpZFByb3BvcnRpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd0aGUgcHJvcG9ydGlvbiBvZiBmbHVpZCBpbiB0aGUgYmVha2VyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBpbmRpY2F0b3Igb2YgaG93IG11Y2ggc3RlYW0gaXMgYmVpbmcgZW1pdHRlZCwgcmFuZ2VzIGZyb20gMCB0byAxIHdoZXJlIDAgaXMgbm9cclxuICAgIC8vIHN0ZWFtLCAxIGlzIHRoZSBtYXggYW1vdW50IChmdWxsIGJvaWwpXHJcbiAgICB0aGlzLnN0ZWFtaW5nUHJvcG9ydGlvbiA9IDA7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGluZGljYXRlcyB3aGVuIGEgcmVzZXQgc3RhcnRzIGFuZCBmaW5pc2hlZFxyXG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBtYXggaGVpZ2h0IGFib3ZlIHdhdGVyIHdoZXJlIHN0ZWFtIHN0aWxsIGFmZmVjdHMgdGhlIG1lYXN1cmVkIHRlbXBlcmF0dXJlXHJcbiAgICB0aGlzLm1heFN0ZWFtSGVpZ2h0ID0gMiAqIGhlaWdodDtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtUaGVybWFsQ29udGFjdEFyZWF9IC0gc2VlIGJhc2UgY2xhc3MgZm9yIGluZm9cclxuICAgIHRoaXMudGhlcm1hbENvbnRhY3RBcmVhID0gbmV3IFRoZXJtYWxDb250YWN0QXJlYShcclxuICAgICAgbmV3IEJvdW5kczIoXHJcbiAgICAgICAgaW5pdGlhbFBvc2l0aW9uLnggLSB0aGlzLndpZHRoIC8gMixcclxuICAgICAgICBpbml0aWFsUG9zaXRpb24ueSxcclxuICAgICAgICBpbml0aWFsUG9zaXRpb24ueCArIHRoaXMud2lkdGggLyAyLFxyXG4gICAgICAgIGluaXRpYWxQb3NpdGlvbi55ICsgdGhpcy5oZWlnaHQgKiB0aGlzLmZsdWlkUHJvcG9ydGlvblByb3BlcnR5LmdldCgpXHJcbiAgICAgICksXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRkIHBvc2l0aW9uIHRlc3QgYm91bmRzIC0gbGVmdCBzaWRlLCBib3R0b20sIHJpZ2h0IHNpZGUgKHNlZSBkZWNsYXJhdGlvbiBpbiBiYXNlIGNsYXNzIGZvciBtb3JlIGluZm8pXHJcbiAgICB0aGlzLnJlbGF0aXZlUG9zaXRpb25UZXN0aW5nQm91bmRzTGlzdC5wdXNoKCBuZXcgQm91bmRzMihcclxuICAgICAgLXdpZHRoIC8gMiAtIE1BVEVSSUFMX1RISUNLTkVTUyAvIDIsXHJcbiAgICAgIDAsXHJcbiAgICAgIC13aWR0aCAvIDIgKyBNQVRFUklBTF9USElDS05FU1MgLyAyLFxyXG4gICAgICBoZWlnaHRcclxuICAgICkgKTtcclxuICAgIHRoaXMucmVsYXRpdmVQb3NpdGlvblRlc3RpbmdCb3VuZHNMaXN0LnB1c2goIG5ldyBCb3VuZHMyKFxyXG4gICAgICAtd2lkdGggLyAyLFxyXG4gICAgICAwLFxyXG4gICAgICB3aWR0aCAvIDIsXHJcbiAgICAgIE1BVEVSSUFMX1RISUNLTkVTU1xyXG4gICAgKSApO1xyXG4gICAgdGhpcy5yZWxhdGl2ZVBvc2l0aW9uVGVzdGluZ0JvdW5kc0xpc3QucHVzaCggbmV3IEJvdW5kczIoXHJcbiAgICAgIHdpZHRoIC8gMiAtIE1BVEVSSUFMX1RISUNLTkVTUyAvIDIsXHJcbiAgICAgIDAsXHJcbiAgICAgIHdpZHRoIC8gMiArIE1BVEVSSUFMX1RISUNLTkVTUyAvIDIsXHJcbiAgICAgIGhlaWdodFxyXG4gICAgKSApO1xyXG4gICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gc2VlIGJhc2UgY2xhc3MgZm9yIGRlc2NyaXB0aW9uXHJcbiAgICB0aGlzLnRvcFN1cmZhY2UgPSBuZXcgSG9yaXpvbnRhbFN1cmZhY2UoXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBpbml0aWFsUG9zaXRpb24ueCwgYm91bmRzLm1pblkgKyBNQVRFUklBTF9USElDS05FU1MgKSxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIHRoaXNcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHNlZSBiYXNlIGNsYXNzIGZvciBkZXNjcmlwdGlvblxyXG4gICAgdGhpcy5ib3R0b21TdXJmYWNlID0gbmV3IEhvcml6b250YWxTdXJmYWNlKFxyXG4gICAgICBuZXcgVmVjdG9yMiggaW5pdGlhbFBvc2l0aW9uLngsIGJvdW5kcy5taW5ZICksXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICB0aGlzXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBpbnRlcm5hbCBzdGF0ZSB3aGVuIHRoZSBwb3NpdGlvbiBjaGFuZ2VzXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG5cclxuICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcG9zaXRpb25zIG9mIHRoZSB0b3AgYW5kIGJvdHRvbSBzdXJmYWNlc1xyXG4gICAgICB0aGlzLnRvcFN1cmZhY2UucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBwb3NpdGlvbi54LCBib3VuZHMubWluWSArIE1BVEVSSUFMX1RISUNLTkVTUyApICk7XHJcbiAgICAgIHRoaXMuYm90dG9tU3VyZmFjZS5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHBvc2l0aW9uLngsIGJvdW5kcy5taW5ZICkgKTtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgdGhlcm1hbCBjb250YWN0IGFyZWFcclxuICAgICAgdGhpcy50aGVybWFsQ29udGFjdEFyZWEuc2V0TWluTWF4KFxyXG4gICAgICAgIHBvc2l0aW9uLnggLSB0aGlzLndpZHRoIC8gMixcclxuICAgICAgICBwb3NpdGlvbi55LFxyXG4gICAgICAgIHBvc2l0aW9uLnggKyB0aGlzLndpZHRoIC8gMixcclxuICAgICAgICBwb3NpdGlvbi55ICsgdGhpcy5oZWlnaHQgKiB0aGlzLmZsdWlkUHJvcG9ydGlvblByb3BlcnR5LmdldCgpXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGludGVybmFsIHN0YXRlIHdoZW4gdGhlIGZsdWlkIGxldmVsIGNoYW5nZXNcclxuICAgIHRoaXMuZmx1aWRQcm9wb3J0aW9uUHJvcGVydHkubGluayggKCBuZXdGbHVpZFByb3BvcnRpb24sIG9sZEZsdWlkUHJvcG9ydGlvbiApID0+IHtcclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgdGhlcm1hbCBjb250YWN0IGFyZWFcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIHRoaXMudGhlcm1hbENvbnRhY3RBcmVhLnNldE1pbk1heChcclxuICAgICAgICBwb3NpdGlvbi54IC0gdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgICAgcG9zaXRpb24ueSxcclxuICAgICAgICBwb3NpdGlvbi54ICsgdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgICAgcG9zaXRpb24ueSArIHRoaXMuaGVpZ2h0ICogdGhpcy5mbHVpZFByb3BvcnRpb25Qcm9wZXJ0eS5nZXQoKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBib3VuZHMgb2YgdGhlIGVuZXJneSBjaHVuayBzbGljZXNcclxuICAgICAgLy8gV2hlbiBzZXR0aW5nIFBoRVQtaU8gc3RhdGUsIHRoZSBzbGljZXMnIGhlaWdodCBpcyBhbHJlYWR5IHVwZGF0ZWRcclxuICAgICAgaWYgKCBvbGRGbHVpZFByb3BvcnRpb24gJiYgIXBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IG5ld0ZsdWlkUHJvcG9ydGlvbiAvIG9sZEZsdWlkUHJvcG9ydGlvbjtcclxuICAgICAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgICAgICBzbGljZS51cGRhdGVIZWlnaHQoIG11bHRpcGxpZXIgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGtpY2sgb2ZmIHJlZGlzdHJpYnV0aW9uIG9mIHRoZSBlbmVyZ3kgY2h1bmtzXHJcbiAgICAgIHRoaXMucmVzZXRFQ0Rpc3RyaWJ1dGlvbkNvdW50ZG93bigpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCB0aGUgYmVha2VyIGluIHRpbWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBkZWx0YSB0aW1lIChpbiBzZWNvbmRzKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlID0gdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LmdldCgpO1xyXG4gICAgaWYgKCB0ZW1wZXJhdHVyZSA+IHRoaXMuZmx1aWRCb2lsaW5nUG9pbnQgLSBTVEVBTUlOR19SQU5HRSApIHtcclxuXHJcbiAgICAgIC8vIHRoZSBmbHVpZCBpcyBlbWl0dGluZyBzb21lIGFtb3VudCBvZiBzdGVhbSAtIHNldCB0aGUgcHJvcG9ydGlvbmF0ZSBhbW91bnRcclxuICAgICAgdGhpcy5zdGVhbWluZ1Byb3BvcnRpb24gPSBVdGlscy5jbGFtcCggMSAtICggdGhpcy5mbHVpZEJvaWxpbmdQb2ludCAtIHRlbXBlcmF0dXJlICkgLyBTVEVBTUlOR19SQU5HRSwgMCwgMSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuc3RlYW1pbmdQcm9wb3J0aW9uID0gMDtcclxuICAgIH1cclxuICAgIHN1cGVyLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBvdmVycmlkZSBmb3IgYWRkaW5nIGVuZXJneSBjaHVua3MgdG8gdGhlIGJlYWtlclxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBhZGRBbmREaXN0cmlidXRlSW5pdGlhbEVuZXJneUNodW5rcyggdGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MgKSB7XHJcblxyXG4gICAgLy8gbWFrZSBhIGNvcHkgb2YgdGhlIHNsaWNlIGFycmF5IHNvcnRlZCBzdWNoIHRoYXQgdGhlIHNtYWxsZXN0IGlzIGZpcnN0XHJcbiAgICBsZXQgc29ydGVkU2xpY2VBcnJheSA9IF8uc29ydEJ5KCB0aGlzLnNsaWNlcy5nZXRBcnJheSgpLCBzbGljZSA9PiB7XHJcbiAgICAgIHJldHVybiBzbGljZS5ib3VuZHMud2lkdGggKiBzbGljZS5ib3VuZHMuaGVpZ2h0O1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRvdGFsU2xpY2VBcmVhID0gdGhpcy5zbGljZXMucmVkdWNlKCAoIGFjY3VtdWxhdG9yLCBzbGljZSApID0+IHtcclxuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yICsgc2xpY2UuYm91bmRzLndpZHRoICogc2xpY2UuYm91bmRzLmhlaWdodDtcclxuICAgIH0sIDAgKTtcclxuXHJcbiAgICBjb25zdCBzbWFsbE9mZnNldCA9IDAuMDAwMDE7IC8vIHVzZWQgc28gdGhhdCB0aGUgRUNzIGRvbid0IHN0YXJ0IG9uIHRvcCBvZiBlYWNoIG90aGVyXHJcbiAgICBsZXQgbnVtYmVyT2ZFbmVyZ3lDaHVua3NBZGRlZCA9IDA7XHJcblxyXG4gICAgLy8gZ28gdGhyb3VnaCBlYWNoIHNsaWNlLCBhZGRpbmcgYSBudW1iZXIgb2YgZW5lcmd5IGNodW5rcyBiYXNlZCBvbiBpdHMgcHJvcG9ydGlvbmF0ZSBzaXplXHJcbiAgICBzb3J0ZWRTbGljZUFycmF5LmZvckVhY2goIHNsaWNlID0+IHtcclxuICAgICAgY29uc3Qgc2xpY2VBcmVhID0gc2xpY2UuYm91bmRzLndpZHRoICogc2xpY2UuYm91bmRzLmhlaWdodDtcclxuICAgICAgY29uc3Qgc2xpY2VDZW50ZXIgPSBzbGljZS5ib3VuZHMuY2VudGVyO1xyXG4gICAgICBfLnRpbWVzKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCBzbGljZUFyZWEgLyB0b3RhbFNsaWNlQXJlYSApICogdGFyZ2V0TnVtYmVyT2ZFbmVyZ3lDaHVua3MgKSwgaW5kZXggPT4ge1xyXG4gICAgICAgIGlmICggbnVtYmVyT2ZFbmVyZ3lDaHVua3NBZGRlZCA8IHRhcmdldE51bWJlck9mRW5lcmd5Q2h1bmtzICkge1xyXG4gICAgICAgICAgc2xpY2UuYWRkRW5lcmd5Q2h1bmsoIHRoaXMuZW5lcmd5Q2h1bmtHcm91cC5jcmVhdGVOZXh0RWxlbWVudChcclxuICAgICAgICAgICAgRW5lcmd5VHlwZS5USEVSTUFMLFxyXG4gICAgICAgICAgICBzbGljZUNlbnRlci5wbHVzWFkoIHNtYWxsT2Zmc2V0ICogaW5kZXgsIHNtYWxsT2Zmc2V0ICogaW5kZXggKSxcclxuICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgbnVtYmVyT2ZFbmVyZ3lDaHVua3NBZGRlZCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIHRoZSB0b3RhbCBudW1iZXIgb2YgYWRkZWQgY2h1bmtzIHdhcyBub3QgcXVpdGUgZW5vdWdoLCB3b3JrIHRocm91Z2ggdGhlIGxpc3Qgb2Ygc2xpY2VzIGZyb20gdGhlIGJpZ2dlc3QgdG9cclxuICAgIC8vIHRoZSBzbWFsbGVzdCB1bnRpbCB0aGV5IGhhdmUgYWxsIGJlZW4gYWRkZWQuXHJcbiAgICBpZiAoIG51bWJlck9mRW5lcmd5Q2h1bmtzQWRkZWQgPCB0YXJnZXROdW1iZXJPZkVuZXJneUNodW5rcyApIHtcclxuICAgICAgc29ydGVkU2xpY2VBcnJheSA9IHNvcnRlZFNsaWNlQXJyYXkucmV2ZXJzZSgpO1xyXG4gICAgICBsZXQgc2xpY2VJbmRleCA9IDA7XHJcbiAgICAgIHdoaWxlICggbnVtYmVyT2ZFbmVyZ3lDaHVua3NBZGRlZCA8IHRhcmdldE51bWJlck9mRW5lcmd5Q2h1bmtzICkge1xyXG4gICAgICAgIGNvbnN0IHNsaWNlID0gc29ydGVkU2xpY2VBcnJheVsgc2xpY2VJbmRleCBdO1xyXG4gICAgICAgIGNvbnN0IHNsaWNlQ2VudGVyID0gc2xpY2UuYm91bmRzLmNlbnRlcjtcclxuICAgICAgICBzbGljZS5hZGRFbmVyZ3lDaHVuayggdGhpcy5lbmVyZ3lDaHVua0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KFxyXG4gICAgICAgICAgRW5lcmd5VHlwZS5USEVSTUFMLFxyXG4gICAgICAgICAgc2xpY2VDZW50ZXIsXHJcbiAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICB0aGlzLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBudW1iZXJPZkVuZXJneUNodW5rc0FkZGVkKys7XHJcbiAgICAgICAgc2xpY2VJbmRleCA9ICggc2xpY2VJbmRleCArIDEgKSAlIHNvcnRlZFNsaWNlQXJyYXkubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgdGhlIGRpc3RyaWJ1dGlvbiB0aW1lciBhbmQgZG8gYSBtb3JlIHRob3JvdWdoIGRpc3RyaWJ1dGlvbiBiZWxvd1xyXG4gICAgdGhpcy5jbGVhckVDRGlzdHJpYnV0aW9uQ291bnRkb3duKCk7XHJcblxyXG4gICAgLy8gSWYgdGhpcyBpcyB0aGUgd2F0ZXIgYmVha2VyLCBhbmQgaXQncyB0aGUgZmlyc3QgdGltZSBlbmVyZ3kgY2h1bmtzIGhhdmUgYmVlbiBhZGRlZCwgbWVhc3VyZSB0aGUgcGVyZm9ybWFuY2VcclxuICAgIC8vIGFuZCwgaWYgaXQgaXMgZm91bmQgdG8gYmUgbG93LCBzd2l0Y2ggdG8gYSBoaWdoZXIgcGVyZm9ybWFuY2UgKGJ1dCB2aXN1YWxseSBpbmZlcmlvcikgYWxnb3JpdGhtIGZvciBkaXN0cmlidXRpbmdcclxuICAgIC8vIHRoZSBlbmVyZ3kgY2h1bmtzLiAgVGhpcyB3YXMgZm91bmQgdG8gYmUgbmVjZXNzYXJ5IG9uIHNvbWUgcGxhdGZvcm1zLCBzZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzE5MS5cclxuICAgIGlmICggdGhpcy5zcGVjaWZpY0hlYXQgPT09IEVGQUNDb25zdGFudHMuV0FURVJfU1BFQ0lGSUNfSEVBVCAmJiAhcGVyZm9ybWFuY2VNZWFzdXJlbWVudFRha2VuICkge1xyXG4gICAgICBjb25zdCBzdGFydFRpbWUgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgIGNvbnN0IG51bWJlck9mSXRlcmF0aW9ucyA9IDEwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGdpdmUgYSByZWFzb25hYmx5IGNvbnNpc3RlbnQgdmFsdWVcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZJdGVyYXRpb25zOyBpKysgKSB7XHJcbiAgICAgICAgZW5lcmd5Q2h1bmtEaXN0cmlidXRvci51cGRhdGVQb3NpdGlvbnMoIHRoaXMuc2xpY2VzLnNsaWNlKCksIEVGQUNDb25zdGFudHMuU0lNX1RJTUVfUEVSX1RJQ0tfTk9STUFMICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgYXZlcmFnZUl0ZXJhdGlvblRpbWUgPSAoIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSApIC8gbnVtYmVyT2ZJdGVyYXRpb25zO1xyXG4gICAgICBpZiAoIGF2ZXJhZ2VJdGVyYXRpb25UaW1lID4gU1dJVENIX1RPX0ZBU1RFUl9BTEdPUklUSE1fVEhSRVNIT0xEICkge1xyXG5cclxuICAgICAgICAvLyBQZXJmb3JtYW5jZSBvbiB0aGlzIGRldmljZSBpcyBwb29yLCBzd2l0Y2ggdG8gdGhlIGxlc3MgY29tcHV0YXRpb25hbGx5IGludGVuc3RpdmUgZGlzdHJpYnV0aW9uIGFsZ29yaXRobSxcclxuICAgICAgICAvLyBidXQgb25seSBpZiBzb21ldGhpbmcgZWxzZSB3YXNuJ3QgZXhwbGljaXRseSBzcGVjaWZpZWQuXHJcbiAgICAgICAgaWYgKCBFRkFDUXVlcnlQYXJhbWV0ZXJzLmVjRGlzdHJpYnV0aW9uID09PSBudWxsICkge1xyXG4gICAgICAgICAgZW5lcmd5Q2h1bmtEaXN0cmlidXRvci5zZXREaXN0cmlidXRpb25BbGdvcml0aG0oICdzcGlyYWwnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBlcmZvcm1hbmNlTWVhc3VyZW1lbnRUYWtlbiA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGlzdHJpYnV0ZSB0aGUgaW5pdGlhbCBlbmVyZ3kgY2h1bmtzIHdpdGhpbiB0aGUgY29udGFpbmVyXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBFRkFDQ29uc3RhbnRzLk1BWF9OVU1CRVJfT0ZfSU5JVElBTElaQVRJT05fRElTVFJJQlVUSU9OX0NZQ0xFUzsgaSsrICkge1xyXG4gICAgICBjb25zdCBkaXN0cmlidXRlZCA9IGVuZXJneUNodW5rRGlzdHJpYnV0b3IudXBkYXRlUG9zaXRpb25zKCB0aGlzLnNsaWNlcy5zbGljZSgpLCBFRkFDQ29uc3RhbnRzLlNJTV9USU1FX1BFUl9USUNLX05PUk1BTCApO1xyXG4gICAgICBpZiAoICFkaXN0cmlidXRlZCApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSBhcmVhIHdoZXJlIHRoZSB0ZW1wZXJhdHVyZSBvZiB0aGUgc3RlYW0gY2FuIGJlIHNlbnNlZFxyXG4gICAqIEByZXR1cm5zIHtSZWN0YW5nbGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFN0ZWFtQXJlYSgpIHtcclxuXHJcbiAgICAvLyBoZWlnaHQgb2Ygc3RlYW0gcmVjdGFuZ2xlIGlzIGJhc2VkIG9uIGJlYWtlciBoZWlnaHQgYW5kIHN0ZWFtaW5nUHJvcG9ydGlvblxyXG4gICAgY29uc3QgbGlxdWlkV2F0ZXJIZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMuZmx1aWRQcm9wb3J0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKCBwb3NpdGlvbi54IC0gdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgIHBvc2l0aW9uLnkgKyBsaXF1aWRXYXRlckhlaWdodCxcclxuICAgICAgdGhpcy53aWR0aCxcclxuICAgICAgdGhpcy5tYXhTdGVhbUhlaWdodCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSB0ZW1wZXJhdHVyZSB2YWx1ZSBhYm92ZSB0aGUgYmVha2VyIGF0IHRoZSBnaXZlbiBoZWlnaHRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0QWJvdmVXYXRlclxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFN0ZWFtVGVtcGVyYXR1cmUoIGhlaWdodEFib3ZlV2F0ZXIgKSB7XHJcbiAgICBjb25zdCBtYXBwaW5nRnVuY3Rpb24gPSBuZXcgTGluZWFyRnVuY3Rpb24oXHJcbiAgICAgIDAsXHJcbiAgICAgIHRoaXMubWF4U3RlYW1IZWlnaHQgKiB0aGlzLnN0ZWFtaW5nUHJvcG9ydGlvbixcclxuICAgICAgdGhpcy50ZW1wZXJhdHVyZVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBFRkFDQ29uc3RhbnRzLlJPT01fVEVNUEVSQVRVUkVcclxuICAgICk7XHJcbiAgICByZXR1cm4gTWF0aC5tYXgoIG1hcHBpbmdGdW5jdGlvbi5ldmFsdWF0ZSggaGVpZ2h0QWJvdmVXYXRlciApLCBFRkFDQ29uc3RhbnRzLlJPT01fVEVNUEVSQVRVUkUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFkZCB0aGUgaW5pdGlhbCBlbmVyZ3kgY2h1bmsgc2xpY2VzLCBjYWxsZWQgaW4gc3VwZXIgY29uc3RydWN0b3JcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgYWRkRW5lcmd5Q2h1bmtTbGljZXMoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNsaWNlcy5sZW5ndGggPT09IDAgKTsgLy8gQ2hlY2sgdGhhdCBoaXMgaGFzIG5vdCBiZWVuIGFscmVhZHkgY2FsbGVkLlxyXG5cclxuICAgIGNvbnN0IGZsdWlkUmVjdCA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54IC0gdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55LFxyXG4gICAgICB0aGlzLndpZHRoLFxyXG4gICAgICB0aGlzLmhlaWdodCAqIEVGQUNDb25zdGFudHMuSU5JVElBTF9GTFVJRF9QUk9QT1JUSU9OXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHdpZHRoWVByb2plY3Rpb24gPSBNYXRoLmFicyggdGhpcy53aWR0aCAqIEVGQUNDb25zdGFudHMuWl9UT19ZX09GRlNFVF9NVUxUSVBMSUVSICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOVU1fU0xJQ0VTOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHByb3BvcnRpb24gPSAoIGkgKyAxICkgKiAoIDEgLyAoIE5VTV9TTElDRVMgKyAxICkgKTtcclxuXHJcbiAgICAgIC8vIFRoZSBzbGljZSB3aWR0aCBpcyBjYWxjdWxhdGVkIHRvIGZpdCBpbnRvIHRoZSAzRCBwcm9qZWN0aW9uLiBJdCB1c2VzIGFuIGV4cG9uZW50aWFsIGZ1bmN0aW9uIHRoYXQgaXMgc2hpZnRlZFxyXG4gICAgICAvLyBpbiBvcmRlciB0byB5aWVsZCB3aWR0aCB2YWx1ZSBwcm9wb3J0aW9uYWwgdG8gcG9zaXRpb24gaW4gWi1zcGFjZS5cclxuICAgICAgY29uc3Qgc2xpY2VXaWR0aCA9ICggLU1hdGgucG93KCAoIDIgKiBwcm9wb3J0aW9uIC0gMSApLCAyICkgKyAxICkgKiBmbHVpZFJlY3Qud2lkdGg7XHJcbiAgICAgIGNvbnN0IGJvdHRvbVkgPSBmbHVpZFJlY3QubWluWSAtICggd2lkdGhZUHJvamVjdGlvbiAvIDIgKSArICggcHJvcG9ydGlvbiAqIHdpZHRoWVByb2plY3Rpb24gKTtcclxuXHJcbiAgICAgIGNvbnN0IHpQb3NpdGlvbiA9IC1wcm9wb3J0aW9uICogdGhpcy53aWR0aDtcclxuICAgICAgY29uc3Qgc2xpY2VCb3VuZHMgPSBCb3VuZHMyLnJlY3QoIGZsdWlkUmVjdC5jZW50ZXJYIC0gc2xpY2VXaWR0aCAvIDIsIGJvdHRvbVksIHNsaWNlV2lkdGgsIGZsdWlkUmVjdC5oZWlnaHQgKTtcclxuXHJcbiAgICAgIHRoaXMuc2xpY2VzLnB1c2goIG5ldyBFbmVyZ3lDaHVua0NvbnRhaW5lclNsaWNlKCBzbGljZUJvdW5kcywgelBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYGVuZXJneUNodW5rQ29udGFpbmVyU2xpY2Uke2l9YCApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSBlbmVyZ3kgY29udGFpbmVyIGNhdGVnb3J5LCB3aGljaCBpcyBhbiBlbnVtIHRoYXQgaXMgdXNlZCB0byBkZXRlcm1pbmUgaGVhdCB0cmFuc2ZlciByYXRlc1xyXG4gICAqIEByZXR1cm5zIHtFbmVyZ3lDb250YWluZXJDYXRlZ29yeX1cclxuICAgKi9cclxuICBnZXQgZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZW5lcmd5Q29udGFpbmVyQ2F0ZWdvcnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGJlYWtlciBlbmVyZ3kgYmV5b25kIHRoZSBtYXggdGVtcGVyYXR1cmUgKHRoZSBib2lsaW5nIHBvaW50KVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEVuZXJneUJleW9uZE1heFRlbXBlcmF0dXJlKCkge1xyXG4gICAgcmV0dXJuIE1hdGgubWF4KCB0aGlzLmVuZXJneVByb3BlcnR5LnZhbHVlIC0gKCB0aGlzLmZsdWlkQm9pbGluZ1BvaW50ICogdGhpcy5tYXNzICogdGhpcy5zcGVjaWZpY0hlYXQgKSwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSB0ZW1wZXJhdHVyZSwgYnV0IGxpbWl0IGl0IHRvIHRoZSBib2lsaW5nIHBvaW50IGZvciB3YXRlciAoZm9yIHJlYXNsaXN0aWMgYmVoYXZpb3IpXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VGVtcGVyYXR1cmUoKSB7XHJcbiAgICBjb25zdCB0ZW1wZXJhdHVyZSA9IHN1cGVyLmdldFRlbXBlcmF0dXJlKCk7XHJcbiAgICByZXR1cm4gTWF0aC5taW4oIHRlbXBlcmF0dXJlLCB0aGlzLmZsdWlkQm9pbGluZ1BvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIG92ZXJyaWRlIGhhbmRsZXMgdGhlIGNhc2Ugd2hlcmUgdGhlIHBvaW50IGlzIGFib3ZlIHRoZSBiZWFrZXIuICBJbiB0aGlzIGNhc2UsIHdlIHdhbnQgdG8gcHVsbCBmcm9tIGFsbFxyXG4gICAqIHNsaWNlcyBldmVubHksIGFuZCBub3QgZmF2b3IgdGhlIHNsaWNlcyB0aGF0IGJ1bXAgdXAgYXQgdGhlIHRvcCBpbiBvcmRlciB0byBtYXRjaCB0aGUgM0QgbG9vayBvZiB0aGUgd2F0ZXJcclxuICAgKiBzdXJmYWNlLlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZXh0cmFjdEVuZXJneUNodW5rQ2xvc2VzdFRvUG9pbnQoIHBvaW50ICkge1xyXG4gICAgbGV0IHBvaW50SXNBYm92ZVdhdGVyU3VyZmFjZSA9IHRydWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNsaWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBwb2ludC55IDwgdGhpcy5zbGljZXMuZ2V0KCBpICkuYm91bmRzLm1heFkgKSB7XHJcbiAgICAgICAgcG9pbnRJc0Fib3ZlV2F0ZXJTdXJmYWNlID0gZmFsc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBwb2ludCBpcyBiZWxvdyB3YXRlciBzdXJmYWNlLCBjYWxsIHRoZSBzdXBlcmNsYXNzIHZlcnNpb24uXHJcbiAgICBpZiAoICFwb2ludElzQWJvdmVXYXRlclN1cmZhY2UgKSB7XHJcbiAgICAgIHJldHVybiBzdXBlci5leHRyYWN0RW5lcmd5Q2h1bmtDbG9zZXN0VG9Qb2ludCggcG9pbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQb2ludCBpcyBhYm92ZSB3YXRlciBzdXJmYWNlLiAgSWRlbnRpZnkgdGhlIHNsaWNlIHdpdGggdGhlIGhpZ2hlc3QgZGVuc2l0eSwgc2luY2UgdGhpcyBpcyB3aGVyZSB3ZSB3aWxsIGdldCB0aGVcclxuICAgIC8vIGVuZXJneSBjaHVuay5cclxuICAgIGxldCBtYXhTbGljZURlbnNpdHkgPSAwO1xyXG4gICAgbGV0IGRlbnNlc3RTbGljZSA9IG51bGw7XHJcbiAgICB0aGlzLnNsaWNlcy5mb3JFYWNoKCBzbGljZSA9PiB7XHJcbiAgICAgIGNvbnN0IHNsaWNlRGVuc2l0eSA9IHNsaWNlLmVuZXJneUNodW5rTGlzdC5sZW5ndGggLyAoIHNsaWNlLmJvdW5kcy53aWR0aCAqIHNsaWNlLmJvdW5kcy5oZWlnaHQgKTtcclxuICAgICAgaWYgKCBzbGljZURlbnNpdHkgPiBtYXhTbGljZURlbnNpdHkgKSB7XHJcbiAgICAgICAgbWF4U2xpY2VEZW5zaXR5ID0gc2xpY2VEZW5zaXR5O1xyXG4gICAgICAgIGRlbnNlc3RTbGljZSA9IHNsaWNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBkZW5zZXN0U2xpY2UgPT09IG51bGwgfHwgZGVuc2VzdFNsaWNlLmVuZXJneUNodW5rTGlzdC5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnIC0gV2FybmluZzogTm8gZW5lcmd5IGNodW5rcyBpbiB0aGUgYmVha2VyLCBjYW5cXCd0IGV4dHJhY3QgYW55LicgKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCB0aGUgY2h1bmsgaW4gdGhlIGNob3NlbiBzbGljZSB3aXRoIHRoZSBtb3N0IGVuZXJneSBhbmQgZXh0cmFjdCB0aGF0IG9uZVxyXG4gICAgbGV0IGhpZ2hlc3RFbmVyZ3lDaHVuayA9IGRlbnNlc3RTbGljZS5lbmVyZ3lDaHVua0xpc3QuZ2V0KCAwICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoaWdoZXN0RW5lcmd5Q2h1bmssICdoaWdoZXN0RW5lcmd5Q2h1bmsgZG9lcyBub3QgZXhpc3QnICk7XHJcbiAgICBkZW5zZXN0U2xpY2UuZW5lcmd5Q2h1bmtMaXN0LmZvckVhY2goIGVuZXJneUNodW5rID0+IHtcclxuICAgICAgaWYgKCBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPiBoaWdoZXN0RW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICkge1xyXG4gICAgICAgIGhpZ2hlc3RFbmVyZ3lDaHVuayA9IGVuZXJneUNodW5rO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZW1vdmVFbmVyZ3lDaHVuayggaGlnaGVzdEVuZXJneUNodW5rICk7XHJcbiAgICByZXR1cm4gaGlnaGVzdEVuZXJneUNodW5rO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIHRoaXMuZmx1aWRQcm9wb3J0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLnJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFByZXNldCBkYXRhIHVzZWQgZm9yIGZhc3QgYWRkaXRpb24gYW5kIHBvc2l0aW9uaW5nIG9mIGVuZXJneSBjaHVua3MgZHVyaW5nIHJlc2V0LiAgVGhlIGRhdGEgY29udGFpbnMgaW5mb3JtYXRpb25cclxuLy8gYWJvdXQgdGhlIGVuZXJneSBjaHVuayBzbGljZXMgYW5kIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgY29udGFpbmVkIHdpdGhpbiBhIGJlYWtlciBvZiBhIHNwZWNpZmljIHNpemUgd2l0aCBhIHNwZWNpZmljXHJcbi8vIG51bWJlciBvZiBlbmVyZ3kgY2h1bmtzLiAgSWYgYSBtYXRjaCBjYW4gYmUgZm91bmQsIHRoaXMgZGF0YSBpcyB1c2VkIHRvIHF1aWNrbHkgY29uZmlndXJlIHRoZSBiZWFrZXIgcmF0aGVyIHRoYW5cclxuLy8gdXNpbmcgdGhlIG11Y2ggbW9yZSBleHBlbnNpdmUgcHJvY2VzcyBvZiBpbnNlcnRpbmcgYW5kIHRoZW4gZGlzdHJpYnV0aW5nIHRoZSBlbmVyZ3kgY2h1bmtzLiAgU2VlXHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktZm9ybXMtYW5kLWNoYW5nZXMvaXNzdWVzLzM3NS5cclxuY29uc3QgRU5FUkdZX0NIVU5LX1BSRVNFVF9DT05GSUdVUkFUSU9OUyA9IFtcclxuXHJcbiAgLy8gMXN0IHNjcmVlbiB3YXRlciBiZWFrZXJcclxuICB7XHJcbiAgICBudW1iZXJPZlNsaWNlczogNixcclxuICAgIHRvdGFsU2xpY2VBcmVhOiAwLjAxODE2NTcxNDI4NTcxNDI5LFxyXG4gICAgbnVtYmVyT2ZFbmVyZ3lDaHVua3M6IDM0LFxyXG4gICAgZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlOiBbXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTU0MTEyNDQ1MzY5NzI2ODIsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IC0wLjAwMTU5NjIwMTE1NzY5MDM3N1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjE0MzgzOTIxMTE5NjU5ODMyLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAtMC4wMDEyNjAyNjMyMzM3NTkyMDJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xNDg1NDc2Mzk1Nzk5MDY1MixcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMDgzMDgzMzY4NzAwNzYzMVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEzNDQ0MTY5MDU0NzY3MjYzLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAtMC4wMDE0MDA2NjI1MjcwMjM3NjM0XHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEyNzMzNzQ3MzY0MTY2MzQ4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAwNjMwNzMyMjE3OTM3MzQ5NlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEzNjUzMDk4MTEyMzg5NzAzLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAxNDYyNzc5ODU0NzczNzM2OFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjE2NDM1MTYyMzQxMTUyOTUzLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAxNDE2ODUzODQ0NTU4NDk3MVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjExOTMxNDY2NTA1ODc4NjE4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAwMTU1OTg4MTM3MDQ5NjEyNTVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xNzE5NjY5OTI2MTYwMTcyMixcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMDE4NDYyNDg0MzIzNDc2MjE0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTYzMjg5MjI1MjI5ODYzODMsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDAyOTg0MDI0ODkyNjY2MTk2N1xyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xMDk2NzUzMDcxMDY5NzM4NSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMDQ5NDY3MDE2OTE0NzM0MTNcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xODA2NjczMTI5NTg1NDI3NCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMzAxNTE5MDU4ODcxOTczMzZcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xNTEzOTk4MzEyMzQ4NDk5LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAyMDY1Mzk0MTczMDc5NzYyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTIwNDkzNzYwOTk4NzI5MTksXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDE3MDA1MjQ1NzE4MzQ2NDk2XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTgwNTQ3MTc5MTM3MzExODYsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDA2MDY0MDQxOTA5NTQ2ODRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xNzQyMjYyNDU0NDYwNzUxNSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMjIxODkxOTM2Nzg5NDM0ODhcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xMDk2OTMwNDIzODQ2MDIzNCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMTM2MjA1Njk0MjIxMjc5NzZcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTU4NzY0NjIzNjU1MDY4MDUsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDMwMTUyNTY1MjcxMzI1MDc2XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTgwNjUwNjE2MTA3MjI4NCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMTU3MjA4NTcyMTg0Mzc4N1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEwOTQ5MDE3MDk1MTYwOTIyLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAzMzUxODk1MDEyMDgyMTRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xMTk4NjY3OTk2ODc1NzAyMyxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMzA2NzI0MTczNzUyMjEyNlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEwOTY4NDgwMjMxMDAwMzg4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAyMzU2NjE1ODA5MzAxMTJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xODA2MTM4NTg3NDU2MzY1NyxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wNDA3MDU5MTEzNzAzMDk4M1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjEwOTgwNjAwOTEzOTYwNjMxLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0MTk4MDYzMTI1MjA4NDlcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTM0NDEwNDM2NTc0ODY3ODQsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDI4MDExNjA0ODAyMjEzNTgzXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTYyMDA4NjgxMzUyMjMyODQsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDQzODMyMzAxMDM1MDExMVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjE2OTA4MjkyNjQyNTg2MzQsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDM0Njc0ODk2NDM2MTcxOTdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xMTk4NDMyNDQwMzg2OTk3LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0NTA4NDU1NTUwNzc0MjE1XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTI4NDkxNTA1MzIyNzczMSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMzk3NzIzMzA1Mzk0NzA4NlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjE3MTU1MTA3NDY2MzEyNDY2LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0NTM2NDQyNTQ2MzU4MDE3XHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjE0MzY1NDQ4MTc0NzY2NzczLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0Nzc4Nzc1ODg3NDc4MDg0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTUzMTM4MDA3NjQ5NzM1NDIsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDQ4MDIyNjgwNzUyMTk3NzhcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4xMzQzMjU4Nzc4NDUyMzAyNixcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wNDgyMjYzNTIwMDY3Njk0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMTQ1MzYyMjk2OTM2ODQzNzcsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDM2MzY2MjI4MTQ1MTM0OTJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyAxc3Qgc2NyZWVuIG9saXZlIG9pbCBiZWFrZXJcclxuICB7XHJcbiAgICBudW1iZXJPZlNsaWNlczogNixcclxuICAgIHRvdGFsU2xpY2VBcmVhOiAwLjAxODE2NTcxNDI4NTcxNDI3OCxcclxuICAgIG51bWJlck9mRW5lcmd5Q2h1bmtzOiA4LFxyXG4gICAgZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlOiBbXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMjQ2MDU2Mjc0Mzg0NzE2NTgsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDA0NDgzOTM4NzgzNzAwMzQ1XHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjIyOTQ4MjUwOTY1MzQ3MTQ0LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAxMTM1MjY2MDc0MjcwODM3XHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjIxMjg3MjA1OTMxMTExNjU4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAxNDk0NDY1Nzk4MzIyNzczNVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjI3MDUwMjY3NTk3OTc4MDU2LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAxNTQwMzU2MjcyODE1MDQ3XHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjI1MTkzNzc4MDQ2ODk1ODI2LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAyNDEyNDc3ODYxNzcyNjA4NVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAwLjIxNjA5Nzk4MDU4NDAwNjg3LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAzNDA2MDQxMDA5MzM2ODc4NFxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4yNjI1MDI0NDQ3MjYzMTY0NSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMzg0NTQ4NDQxNzA2NzkwMzVcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMjM5MTQ1NzYzMjEwMzIwNyxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wNDEyNjU3MTcyMjM4MDUzMzZcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIF1cclxuICB9LFxyXG5cclxuICAvLyAybmQgc2NyZWVuIHdhdGVyIGJlYWtlclxyXG4gIHtcclxuICAgIG51bWJlck9mU2xpY2VzOiA2LFxyXG4gICAgdG90YWxTbGljZUFyZWE6IDAuMDE0MTQyODU3MTQyODU3MTQzLFxyXG4gICAgbnVtYmVyT2ZFbmVyZ3lDaHVua3M6IDIwLFxyXG4gICAgZW5lcmd5Q2h1bmtQb3NpdGlvbnNCeVNsaWNlOiBbXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IC0wLjAwNTMyNzk2MjE5NTQyNzU3OCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMTY0NTIyOTYxMzc5MTgyNjJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMDU4Nzg3OTI5Nzc4OTU2ODMsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDE2ODI0NDY3ODU4NjQyOTIzXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAtMC4wMTgyNDI0NTA4MzM3MTk1NCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMTk0MzgwMzc3MjQxNDcyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IC0wLjAwNTAzNjU5MDk3MzEwMzM4NSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMjg5NDQ5NzMxNzEyMDUyOTVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMTk3NDE1NjUxNjgzMDAwNzgsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDE5Mjc5MjQxNTk2NjE3NTA0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMDEyNjcxMjkwNzQ2MDY1Njc4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAyODcxMDg3MjUxNjIxMjMwN1xyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogLTAuMDIwNjkxNzg0NTAxODcwNDMsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDMxNzM2OTc4MTU0NjMwOTA0XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IC0wLjAyOTcxNzcxNjM0ODI5ODY4MyxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMjM0ODcxOTY3OTU5OTc3MzVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMjk1Njg4NTY2MDAyODk3OCxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wMjQ1NjM1ODI3NzIxNzQ1ODVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogLTAuMDI5NzEyNzkxOTIxMTk1ODI3LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAzNzk0NzcxNjY1OTkyODAzNVxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogLTAuMDI5NDE3MTgyMjU2MDk3MzA3LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0OTU5ODUwNTQ3OTgxNDQyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMDI4OTgzMjQ0MzQyOTExNjUyLFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjAzNjcwMTg2NTMwNDI3MzdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMDI1MjAxNTI2OTUwMTE0OTc1LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0MjA0MjQ4ODg0MjI2ODM3XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMDI5NjM0MDkxODc4MzI5MDA4LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA0OTEwOTU4MTI3ODM1NzExXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAtMC4wMTIyODc0MjI1OTQyNjYyNyxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wNDQxOTE5NTUzNTk5Mzg3NVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcG9zaXRpb25YOiAtMC4wMTkwNjY4NjE2NzY4MTExMjUsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDUzOTU3MzEzOTA2NjU1MjNcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMTYzNTU1MzMxOTE4NDY1OTMsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDQyNjgyMjM2MjE3ODM3MzdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHBvc2l0aW9uWDogMC4wMTkwODQ1NTQ3ODM1MDE4NjQsXHJcbiAgICAgICAgICBwb3NpdGlvblk6IDAuMDU0MTM0MDY4ODM4MDIyODRcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IC0wLjAwNTM5MjYyNDU3MjA2MTI0NSxcclxuICAgICAgICAgIHBvc2l0aW9uWTogMC4wNTY1MTI2MjUxODcyNTA5XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwb3NpdGlvblg6IDAuMDA1ODI2MTY3NzEwNzY1MzE0LFxyXG4gICAgICAgICAgcG9zaXRpb25ZOiAwLjA1NjM5MTU2NTE5OTUzODIyNFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgXVxyXG4gIH1cclxuXTtcclxuXHJcbkJlYWtlci5CZWFrZXJJTyA9IG5ldyBJT1R5cGUoICdCZWFrZXJJTycsIHtcclxuICB2YWx1ZVR5cGU6IEJlYWtlcixcclxuICB0b1N0YXRlT2JqZWN0OiBiZWFrZXIgPT4gKCB7IGJlYWtlclR5cGU6IEJlYWtlclR5cGVFbnVtZXJhdGlvbklPLnRvU3RhdGVPYmplY3QoIGJlYWtlci5iZWFrZXJUeXBlICkgfSApLFxyXG4gIHN0YXRlU2NoZW1hOiB7XHJcbiAgICBiZWFrZXJUeXBlOiBCZWFrZXJUeXBlRW51bWVyYXRpb25JT1xyXG4gIH1cclxufSApO1xyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnQmVha2VyJywgQmVha2VyICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJlYWtlcjtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FB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LEVBQUU7RUFDYixDQUFDLEVBQ0Q7SUFDRUQsU0FBUyxFQUFFLG1CQUFtQjtJQUM5QkMsU0FBUyxFQUFFO0VBQ2IsQ0FBQyxFQUNEO0lBQ0VELFNBQVMsRUFBRSxtQkFBbUI7SUFDOUJDLFNBQVMsRUFBRTtFQUNiLENBQUMsRUFDRDtJQUNFRCxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxTQUFTLEVBQUU7RUFDYixDQUFDLEVBQ0Q7SUFDRUQsU0FBUyxFQUFFLG1CQUFtQjtJQUM5QkMsU0FBUyxFQUFFO0VBQ2IsQ0FBQyxDQUNGLEVBQ0QsQ0FDRTtJQUNFRCxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxTQUFTLEVBQUU7RUFDYixDQUFDLEVBQ0Q7SUFDRUQsU0FBUyxFQUFFLGtCQUFrQjtJQUM3QkMsU0FBUyxFQUFFO0VBQ2IsQ0FBQyxFQUNEO0lBQ0VELFNBQVMsRUFBRSxtQkFBbUI7SUFDOUJDLFNBQVMsRUFBRTtFQUNiLENBQUMsRUFDRDtJQUNFRCxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxTQUFTLEVBQUU7RUFDYixDQUFDLEVBQ0Q7SUFDRUQsU0FBUyxFQUFFLG1CQUFtQjtJQUM5QkMsU0FBUyxFQUFFO0VBQ2IsQ0FBQyxFQUNEO0lBQ0VELFNBQVMsRUFBRSxtQkFBbUI7SUFDOUJDLFNBQVMsRUFBRTtFQUNiLENBQUMsRUFDRDtJQUNFRCxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxTQUFTLEVBQUU7RUFDYixDQUFDLENBQ0YsRUFDRCxDQUNFO0lBQ0VELFNBQVMsRUFBRSxtQkFBbUI7SUFDOUJDLFNBQVMsRUFBRTtFQUNiLENBQUMsRUFDRDtJQUNFRCxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCQyxTQUFTLEVBQUU7RUFDYixDQUFDLEVBQ0Q7SUFDRUQsU0FBUyxFQUFFLGtCQUFrQjtJQUM3QkMsU0FBUyxFQUFFO0VBQ2IsQ0FBQyxFQUNEO0lBQ0VELFNBQVMsRUFBRSxrQkFBa0I7SUFDN0JDLFNBQVMsRUFBRTtFQUNiLENBQUMsRUFDRDtJQUNFRCxTQUFTLEVBQUUsa0JBQWtCO0lBQzdCQyxTQUFT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