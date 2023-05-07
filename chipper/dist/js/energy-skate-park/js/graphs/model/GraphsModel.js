// Copyright 2018-2022, University of Colorado Boulder

/**
 * Model for the Graphs screen in Energy Skate Park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import EnergySkateParkTrackSetModel from '../../common/model/EnergySkateParkTrackSetModel.js';
import PremadeTracks from '../../common/model/PremadeTracks.js';
import SkaterState from '../../common/model/SkaterState.js';
import energySkatePark from '../../energySkatePark.js';
import GraphsConstants from '../GraphsConstants.js';
class GraphsModel extends EnergySkateParkTrackSetModel {
  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   */
  constructor(preferencesModel, tandem) {
    // all tracks in the Graphs screen are configurable
    const tracksConfigurable = true;

    // all tracks in graphs screen are bound by these dimensions (in meters)
    const trackHeight = GraphsConstants.TRACK_HEIGHT;
    const trackWidth = GraphsConstants.TRACK_WIDTH;

    // track set model with no friction
    super(preferencesModel, tandem.createTandem('graphsModel'), {
      // the Graphs screen contains a parabola and double well premade track
      trackTypes: [PremadeTracks.TrackType.PARABOLA, PremadeTracks.TrackType.DOUBLE_WELL],
      // the Graphs screen has a double well and parabola track, but they look and act a bit different from the other
      // screens, these options define the differences
      initializePremadeTracksOptions: {
        doubleWellControlPointOptions: {
          trackHeight: 4,
          trackWidth: 10,
          trackMidHeight: 1.5,
          p1Visible: false,
          p5Visible: false,
          // limit vertical bounds for points 1 and 5 so that the track can never overlap with other UI components, including
          // when it is bumped above ground
          p1UpSpacing: 0,
          p1DownSpacing: 0,
          p5UpSpacing: 0,
          p5DownSpacing: 0,
          // spacing for the limiting drag bounds of the third control point
          p3UpSpacing: 2.5,
          p3DownSpacing: 1.5
        },
        doubleWellTrackOptions: {
          configurable: tracksConfigurable,
          tandem: tandem.createTandem('doubleWellTrack'),
          phetioState: false
        },
        parabolaControlPointOptions: {
          trackHeight: trackHeight,
          trackWidth: trackWidth,
          p1Visible: false,
          p3Visible: false
        },
        parabolaTrackOptions: {
          configurable: tracksConfigurable,
          tandem: tandem.createTandem('parabolaTrack'),
          phetioState: false
        }
      },
      // limited reference height range for this Screen because the graph takes up so much space
      skaterOptions: {
        referenceHeightRange: new Range(0, 4.5)
      },
      // premade tracks can be modified
      tracksConfigurable: tracksConfigurable,
      // interval at which we save skater samples
      saveSampleInterval: 0.01,
      // graph samples will fade more quickly, partly because it looks nicer, but mostly because
      // it is better for performance to have fewer transparent points
      sampleFadeDecay: 0.5,
      // to prevent a memory leak if we run for a long time without clearing
      maxNumberOfSamples: 1000
    });

    // @public - properties for visibility and settings for the graph
    this.kineticEnergyDataVisibleProperty = new BooleanProperty(true);
    this.potentialEnergyDataVisibleProperty = new BooleanProperty(true);
    this.thermalEnergyDataVisibleProperty = new BooleanProperty(true);
    this.totalEnergyDataVisibleProperty = new BooleanProperty(true);

    // @private - index pointing to the range plotted on the energy plot, see GraphsConstants.PLOT_RANGES
    this.energyPlotScaleIndexProperty = new NumberProperty(11, {
      range: new Range(0, GraphsConstants.PLOT_RANGES.length - 1)
    });

    // @public - sets the independent variable for the graph display
    this.independentVariableProperty = new EnumerationDeprecatedProperty(GraphsModel.IndependentVariable, GraphsModel.IndependentVariable.POSITION);

    // @public - whether or not the energy plot is visible
    this.energyPlotVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('energyPlotVisibleProperty')
    });

    // existing data fades away before removal when the skater direction changes
    this.skater.directionProperty.link(direction => {
      if (this.independentVariableProperty.get() === GraphsModel.IndependentVariable.POSITION) {
        this.initiateSampleRemoval();
      }
    });

    // there are far more points required for the Energy vs Time plot, so we don't limit the number of
    // saved samples in this case
    this.independentVariableProperty.link(independentVariable => {
      this.limitNumberOfSamples = independentVariable === GraphsModel.IndependentVariable.POSITION;
    });

    // clear all data when the track changes
    this.sceneProperty.link(scene => {
      this.clearEnergyData();
    });
    this.skater.draggingProperty.link(isDragging => {
      if (this.independentVariableProperty.get() === GraphsModel.IndependentVariable.POSITION) {
        // if plotting against position don't save any skater samples while dragging, but if plotting against time
        // it is still useful to see data as potential energy changes
        this.clearEnergyData();
        this.preventSampleSave = isDragging;
      } else {
        // if plotting against time, it is still useful to see changing data as potential energy changes, but prevent
        // sample saving while paused and dragging so that we don't add data while paused, but still save data
        // while manually stepping
        this.preventSampleSave = isDragging && this.pausedProperty.get();
      }
    });

    // clear old samples if we are plotting for longer than the range
    this.sampleTimeProperty.link(time => {
      const plottingTime = this.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME;
      const overTime = time > GraphsConstants.MAX_PLOTTED_TIME;
      if (plottingTime && overTime) {
        // clear all samples prior to time - maxTime (the horizontal range of the data)
        const samplesToRemove = [];
        const minSavedTime = time - GraphsConstants.MAX_PLOTTED_TIME;
        for (let i = 0; i < this.dataSamples.length; i++) {
          if (this.dataSamples.get(i).time < minSavedTime) {
            samplesToRemove.push(this.dataSamples.get(i));
          } else {
            break;
          }
        }
        this.batchRemoveSamples(samplesToRemove);
        assert && assert(this.dataSamples.get(0).time >= minSavedTime, 'data still exists that is less than plot min');
      }
    });

    // if any of the UserControlledPropertySet changes, the user is changing something that would modify the
    // physical system and changes everything in saved EnergySkateParkDataSamples
    Multilink.lazyMultilink(this.userControlledPropertySet.properties, () => {
      if (this.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME) {
        if (this.dataSamples.length > 0) {
          // only remove data if the cursor time is earlier than the last saved sample
          if (this.sampleTimeProperty.get() < this.dataSamples.get(this.dataSamples.length - 1).time) {
            const closestSample = this.getClosestSkaterSample(this.sampleTimeProperty.get());
            const indexOfSample = this.dataSamples.indexOf(closestSample);
            assert && assert(indexOfSample >= 0, 'time of cursor needs to align with a skater sample');
            this.batchRemoveSamples(this.dataSamples.slice(indexOfSample));
          }
        }
      }
    });

    // if plotting against position we want to clear data when skater returns, but it is useful to
    // see previous data when plotting against time so don't clear in that case
    this.skater.returnedEmitter.addListener(() => {
      if (this.independentVariableProperty.get() === GraphsModel.IndependentVariable.POSITION) {
        this.clearEnergyData();
      }
    });
  }

  /**
   * Resets the screen and Properties specific to this model.
   *
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.energyPlotVisibleProperty.reset();
    this.kineticEnergyDataVisibleProperty.reset();
    this.potentialEnergyDataVisibleProperty.reset();
    this.thermalEnergyDataVisibleProperty.reset();
    this.totalEnergyDataVisibleProperty.reset();
    this.energyPlotScaleIndexProperty.reset();
    this.independentVariableProperty.reset();
    this.clearEnergyData();

    // after reset, restart timer for next saved state
    this.timeSinceSkaterSaved = 0;
  }

  /**
   * @public
   * @override
   * @param {number} dt - in seconds
   */
  step(dt) {
    super.step(dt);

    // for the "Graphs" screen we want to update energies while dragging so that they are recorded on the graph
    if (this.skater.draggingProperty.get() && !this.pausedProperty.get()) {
      const initialStateCopy = new SkaterState(this.skater);
      this.stepModel(dt, initialStateCopy);
    }
  }

  /**
   * Custom stepModel for the SaveSampleModel. If the sampleTimeProperty is *older* than the most recent saved
   * sample, we are playing back through saved data and stepping through saved samples rather than stepping
   * the model. If we are actually stepping the model physics, we are also recording new EnergySkateParkDataSamples
   * in the supertype function.
   * @override
   * @public
   *
   * @param {number} dt - in seconds
   * @param {SkaterState} skaterState
   * @returns {SkaterState}
   */
  stepModel(dt, skaterState) {
    const hasData = this.dataSamples.length > 0;

    // only if we have data, so that we don't try to get a data sample if length is 0
    const cursorOlderThanNewestSample = hasData && this.sampleTimeProperty.get() < this.dataSamples.get(this.dataSamples.length - 1).time;
    const plottingTime = this.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME;

    // we are playing back through data if plotting against time and the cursor is older than the
    if (cursorOlderThanNewestSample && plottingTime) {
      // skater samples are updated not by step, but by setting model to closest skater sample at time
      const closestSample = this.getClosestSkaterSample(this.sampleTimeProperty.get());
      this.setFromSample(closestSample);
      this.skater.updatedEmitter.emit();
      this.sampleTimeProperty.set(this.sampleTimeProperty.get() + dt);
      this.stopwatch.step(dt);
      return closestSample.skaterState;
    } else {
      return super.stepModel(dt, skaterState);
    }
  }

  /**
   * Get the closest SkaterState that was saved at the time provided.
   * @public
   *
   * @param {number} time (in seconds)
   * @returns {EnergySkateParkDataSample}
   */
  getClosestSkaterSample(time) {
    assert && assert(this.dataSamples.length > 0, 'model has no saved EnergySkateParkDataSamples to retrieve');
    let nearestIndex = _.sortedIndexBy(this.dataSamples, {
      time: time
    }, entry => entry.time);
    nearestIndex = Utils.clamp(nearestIndex, 0, this.dataSamples.length - 1);
    return this.dataSamples.get(nearestIndex);
  }

  /**
   * Create the custom set of tracks for the "graphs" screen. The "graphs" screen includes a parabola and a
   * double well with unique shapes where only certain control points are draggable.
   * @public
   *
   * @param {Tandem} tandem
   * @returns {Track[]}
   */
  createGraphsTrackSet(tandem) {
    // all tracks in graphs screen are bound by these dimensions (in meters)
    const trackHeight = GraphsConstants.TRACK_HEIGHT;
    const trackWidth = GraphsConstants.TRACK_WIDTH;
    const parabolaControlPoints = PremadeTracks.createParabolaControlPoints(this, {
      trackHeight: trackHeight,
      trackWidth: trackWidth,
      p1Visible: false,
      p3Visible: false
    });
    const parabolaTrack = PremadeTracks.createTrack(this, parabolaControlPoints, {
      configurable: this.tracksConfigurable,
      tandem: tandem.createTandem('parabolaTrack'),
      phetioState: false
    });
    const doubleWellControlPoints = PremadeTracks.createDoubleWellControlPoints(this, {
      trackHeight: 4,
      trackWidth: 10,
      trackMidHeight: 1.5,
      p1Visible: false,
      p5Visible: false,
      // limit vertical bounds for points 1 and 5 so that the track can never overlap with other UI components, including
      // when it is bumped above ground
      p1UpSpacing: 0,
      p1DownSpacing: 0,
      p5UpSpacing: 0,
      p5DownSpacing: 0,
      // spacing for the limiting drag bounds of the third control point
      p3UpSpacing: 2.5,
      p3DownSpacing: 1.5
    });
    const doubleWellTrack = PremadeTracks.createTrack(this, doubleWellControlPoints, {
      configurable: this.tracksConfigurable,
      tandem: tandem.createTandem('doubleWellTrack'),
      phetioState: false
    });
    return [parabolaTrack, doubleWellTrack];
  }
}
GraphsModel.IndependentVariable = EnumerationDeprecated.byKeys(['POSITION', 'TIME']);
energySkatePark.register('GraphsModel', GraphsModel);
export default GraphsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIk51bWJlclByb3BlcnR5IiwiUmFuZ2UiLCJVdGlscyIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIkVuZXJneVNrYXRlUGFya1RyYWNrU2V0TW9kZWwiLCJQcmVtYWRlVHJhY2tzIiwiU2thdGVyU3RhdGUiLCJlbmVyZ3lTa2F0ZVBhcmsiLCJHcmFwaHNDb25zdGFudHMiLCJHcmFwaHNNb2RlbCIsImNvbnN0cnVjdG9yIiwicHJlZmVyZW5jZXNNb2RlbCIsInRhbmRlbSIsInRyYWNrc0NvbmZpZ3VyYWJsZSIsInRyYWNrSGVpZ2h0IiwiVFJBQ0tfSEVJR0hUIiwidHJhY2tXaWR0aCIsIlRSQUNLX1dJRFRIIiwiY3JlYXRlVGFuZGVtIiwidHJhY2tUeXBlcyIsIlRyYWNrVHlwZSIsIlBBUkFCT0xBIiwiRE9VQkxFX1dFTEwiLCJpbml0aWFsaXplUHJlbWFkZVRyYWNrc09wdGlvbnMiLCJkb3VibGVXZWxsQ29udHJvbFBvaW50T3B0aW9ucyIsInRyYWNrTWlkSGVpZ2h0IiwicDFWaXNpYmxlIiwicDVWaXNpYmxlIiwicDFVcFNwYWNpbmciLCJwMURvd25TcGFjaW5nIiwicDVVcFNwYWNpbmciLCJwNURvd25TcGFjaW5nIiwicDNVcFNwYWNpbmciLCJwM0Rvd25TcGFjaW5nIiwiZG91YmxlV2VsbFRyYWNrT3B0aW9ucyIsImNvbmZpZ3VyYWJsZSIsInBoZXRpb1N0YXRlIiwicGFyYWJvbGFDb250cm9sUG9pbnRPcHRpb25zIiwicDNWaXNpYmxlIiwicGFyYWJvbGFUcmFja09wdGlvbnMiLCJza2F0ZXJPcHRpb25zIiwicmVmZXJlbmNlSGVpZ2h0UmFuZ2UiLCJzYXZlU2FtcGxlSW50ZXJ2YWwiLCJzYW1wbGVGYWRlRGVjYXkiLCJtYXhOdW1iZXJPZlNhbXBsZXMiLCJraW5ldGljRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSIsInBvdGVudGlhbEVuZXJneURhdGFWaXNpYmxlUHJvcGVydHkiLCJ0aGVybWFsRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSIsInRvdGFsRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSIsImVuZXJneVBsb3RTY2FsZUluZGV4UHJvcGVydHkiLCJyYW5nZSIsIlBMT1RfUkFOR0VTIiwibGVuZ3RoIiwiaW5kZXBlbmRlbnRWYXJpYWJsZVByb3BlcnR5IiwiSW5kZXBlbmRlbnRWYXJpYWJsZSIsIlBPU0lUSU9OIiwiZW5lcmd5UGxvdFZpc2libGVQcm9wZXJ0eSIsInNrYXRlciIsImRpcmVjdGlvblByb3BlcnR5IiwibGluayIsImRpcmVjdGlvbiIsImdldCIsImluaXRpYXRlU2FtcGxlUmVtb3ZhbCIsImluZGVwZW5kZW50VmFyaWFibGUiLCJsaW1pdE51bWJlck9mU2FtcGxlcyIsInNjZW5lUHJvcGVydHkiLCJzY2VuZSIsImNsZWFyRW5lcmd5RGF0YSIsImRyYWdnaW5nUHJvcGVydHkiLCJpc0RyYWdnaW5nIiwicHJldmVudFNhbXBsZVNhdmUiLCJwYXVzZWRQcm9wZXJ0eSIsInNhbXBsZVRpbWVQcm9wZXJ0eSIsInRpbWUiLCJwbG90dGluZ1RpbWUiLCJUSU1FIiwib3ZlclRpbWUiLCJNQVhfUExPVFRFRF9USU1FIiwic2FtcGxlc1RvUmVtb3ZlIiwibWluU2F2ZWRUaW1lIiwiaSIsImRhdGFTYW1wbGVzIiwicHVzaCIsImJhdGNoUmVtb3ZlU2FtcGxlcyIsImFzc2VydCIsImxhenlNdWx0aWxpbmsiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5U2V0IiwicHJvcGVydGllcyIsImNsb3Nlc3RTYW1wbGUiLCJnZXRDbG9zZXN0U2thdGVyU2FtcGxlIiwiaW5kZXhPZlNhbXBsZSIsImluZGV4T2YiLCJzbGljZSIsInJldHVybmVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVzZXQiLCJ0aW1lU2luY2VTa2F0ZXJTYXZlZCIsInN0ZXAiLCJkdCIsImluaXRpYWxTdGF0ZUNvcHkiLCJzdGVwTW9kZWwiLCJza2F0ZXJTdGF0ZSIsImhhc0RhdGEiLCJjdXJzb3JPbGRlclRoYW5OZXdlc3RTYW1wbGUiLCJzZXRGcm9tU2FtcGxlIiwidXBkYXRlZEVtaXR0ZXIiLCJlbWl0Iiwic2V0Iiwic3RvcHdhdGNoIiwibmVhcmVzdEluZGV4IiwiXyIsInNvcnRlZEluZGV4QnkiLCJlbnRyeSIsImNsYW1wIiwiY3JlYXRlR3JhcGhzVHJhY2tTZXQiLCJwYXJhYm9sYUNvbnRyb2xQb2ludHMiLCJjcmVhdGVQYXJhYm9sYUNvbnRyb2xQb2ludHMiLCJwYXJhYm9sYVRyYWNrIiwiY3JlYXRlVHJhY2siLCJkb3VibGVXZWxsQ29udHJvbFBvaW50cyIsImNyZWF0ZURvdWJsZVdlbGxDb250cm9sUG9pbnRzIiwiZG91YmxlV2VsbFRyYWNrIiwiYnlLZXlzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmFwaHNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIEdyYXBocyBzY3JlZW4gaW4gRW5lcmd5IFNrYXRlIFBhcmsuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25EZXByZWNhdGVkLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya1RyYWNrU2V0TW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VuZXJneVNrYXRlUGFya1RyYWNrU2V0TW9kZWwuanMnO1xyXG5pbXBvcnQgUHJlbWFkZVRyYWNrcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUHJlbWFkZVRyYWNrcy5qcyc7XHJcbmltcG9ydCBTa2F0ZXJTdGF0ZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU2thdGVyU3RhdGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBHcmFwaHNDb25zdGFudHMgZnJvbSAnLi4vR3JhcGhzQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIEdyYXBoc01vZGVsIGV4dGVuZHMgRW5lcmd5U2thdGVQYXJrVHJhY2tTZXRNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5U2thdGVQYXJrUHJlZmVyZW5jZXNNb2RlbH0gcHJlZmVyZW5jZXNNb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcHJlZmVyZW5jZXNNb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIGFsbCB0cmFja3MgaW4gdGhlIEdyYXBocyBzY3JlZW4gYXJlIGNvbmZpZ3VyYWJsZVxyXG4gICAgY29uc3QgdHJhY2tzQ29uZmlndXJhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBhbGwgdHJhY2tzIGluIGdyYXBocyBzY3JlZW4gYXJlIGJvdW5kIGJ5IHRoZXNlIGRpbWVuc2lvbnMgKGluIG1ldGVycylcclxuICAgIGNvbnN0IHRyYWNrSGVpZ2h0ID0gR3JhcGhzQ29uc3RhbnRzLlRSQUNLX0hFSUdIVDtcclxuICAgIGNvbnN0IHRyYWNrV2lkdGggPSBHcmFwaHNDb25zdGFudHMuVFJBQ0tfV0lEVEg7XHJcblxyXG4gICAgLy8gdHJhY2sgc2V0IG1vZGVsIHdpdGggbm8gZnJpY3Rpb25cclxuICAgIHN1cGVyKCBwcmVmZXJlbmNlc01vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JhcGhzTW9kZWwnICksIHtcclxuXHJcbiAgICAgIC8vIHRoZSBHcmFwaHMgc2NyZWVuIGNvbnRhaW5zIGEgcGFyYWJvbGEgYW5kIGRvdWJsZSB3ZWxsIHByZW1hZGUgdHJhY2tcclxuICAgICAgdHJhY2tUeXBlczogW1xyXG4gICAgICAgIFByZW1hZGVUcmFja3MuVHJhY2tUeXBlLlBBUkFCT0xBLFxyXG4gICAgICAgIFByZW1hZGVUcmFja3MuVHJhY2tUeXBlLkRPVUJMRV9XRUxMXHJcbiAgICAgIF0sXHJcblxyXG4gICAgICAvLyB0aGUgR3JhcGhzIHNjcmVlbiBoYXMgYSBkb3VibGUgd2VsbCBhbmQgcGFyYWJvbGEgdHJhY2ssIGJ1dCB0aGV5IGxvb2sgYW5kIGFjdCBhIGJpdCBkaWZmZXJlbnQgZnJvbSB0aGUgb3RoZXJcclxuICAgICAgLy8gc2NyZWVucywgdGhlc2Ugb3B0aW9ucyBkZWZpbmUgdGhlIGRpZmZlcmVuY2VzXHJcbiAgICAgIGluaXRpYWxpemVQcmVtYWRlVHJhY2tzT3B0aW9uczoge1xyXG4gICAgICAgIGRvdWJsZVdlbGxDb250cm9sUG9pbnRPcHRpb25zOiB7XHJcbiAgICAgICAgICB0cmFja0hlaWdodDogNCxcclxuICAgICAgICAgIHRyYWNrV2lkdGg6IDEwLFxyXG4gICAgICAgICAgdHJhY2tNaWRIZWlnaHQ6IDEuNSxcclxuXHJcbiAgICAgICAgICBwMVZpc2libGU6IGZhbHNlLFxyXG4gICAgICAgICAgcDVWaXNpYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAvLyBsaW1pdCB2ZXJ0aWNhbCBib3VuZHMgZm9yIHBvaW50cyAxIGFuZCA1IHNvIHRoYXQgdGhlIHRyYWNrIGNhbiBuZXZlciBvdmVybGFwIHdpdGggb3RoZXIgVUkgY29tcG9uZW50cywgaW5jbHVkaW5nXHJcbiAgICAgICAgICAvLyB3aGVuIGl0IGlzIGJ1bXBlZCBhYm92ZSBncm91bmRcclxuICAgICAgICAgIHAxVXBTcGFjaW5nOiAwLFxyXG4gICAgICAgICAgcDFEb3duU3BhY2luZzogMCxcclxuICAgICAgICAgIHA1VXBTcGFjaW5nOiAwLFxyXG4gICAgICAgICAgcDVEb3duU3BhY2luZzogMCxcclxuXHJcbiAgICAgICAgICAvLyBzcGFjaW5nIGZvciB0aGUgbGltaXRpbmcgZHJhZyBib3VuZHMgb2YgdGhlIHRoaXJkIGNvbnRyb2wgcG9pbnRcclxuICAgICAgICAgIHAzVXBTcGFjaW5nOiAyLjUsXHJcbiAgICAgICAgICBwM0Rvd25TcGFjaW5nOiAxLjVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRvdWJsZVdlbGxUcmFja09wdGlvbnM6IHtcclxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJhY2tzQ29uZmlndXJhYmxlLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZG91YmxlV2VsbFRyYWNrJyApLFxyXG4gICAgICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgcGFyYWJvbGFDb250cm9sUG9pbnRPcHRpb25zOiB7XHJcbiAgICAgICAgICB0cmFja0hlaWdodDogdHJhY2tIZWlnaHQsXHJcbiAgICAgICAgICB0cmFja1dpZHRoOiB0cmFja1dpZHRoLFxyXG4gICAgICAgICAgcDFWaXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgIHAzVmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhcmFib2xhVHJhY2tPcHRpb25zOiB7XHJcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRyYWNrc0NvbmZpZ3VyYWJsZSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcmFib2xhVHJhY2snICksXHJcbiAgICAgICAgICBwaGV0aW9TdGF0ZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBsaW1pdGVkIHJlZmVyZW5jZSBoZWlnaHQgcmFuZ2UgZm9yIHRoaXMgU2NyZWVuIGJlY2F1c2UgdGhlIGdyYXBoIHRha2VzIHVwIHNvIG11Y2ggc3BhY2VcclxuICAgICAgc2thdGVyT3B0aW9uczoge1xyXG4gICAgICAgIHJlZmVyZW5jZUhlaWdodFJhbmdlOiBuZXcgUmFuZ2UoIDAsIDQuNSApXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwcmVtYWRlIHRyYWNrcyBjYW4gYmUgbW9kaWZpZWRcclxuICAgICAgdHJhY2tzQ29uZmlndXJhYmxlOiB0cmFja3NDb25maWd1cmFibGUsXHJcblxyXG4gICAgICAvLyBpbnRlcnZhbCBhdCB3aGljaCB3ZSBzYXZlIHNrYXRlciBzYW1wbGVzXHJcbiAgICAgIHNhdmVTYW1wbGVJbnRlcnZhbDogMC4wMSxcclxuXHJcbiAgICAgIC8vIGdyYXBoIHNhbXBsZXMgd2lsbCBmYWRlIG1vcmUgcXVpY2tseSwgcGFydGx5IGJlY2F1c2UgaXQgbG9va3MgbmljZXIsIGJ1dCBtb3N0bHkgYmVjYXVzZVxyXG4gICAgICAvLyBpdCBpcyBiZXR0ZXIgZm9yIHBlcmZvcm1hbmNlIHRvIGhhdmUgZmV3ZXIgdHJhbnNwYXJlbnQgcG9pbnRzXHJcbiAgICAgIHNhbXBsZUZhZGVEZWNheTogMC41LFxyXG5cclxuICAgICAgLy8gdG8gcHJldmVudCBhIG1lbW9yeSBsZWFrIGlmIHdlIHJ1biBmb3IgYSBsb25nIHRpbWUgd2l0aG91dCBjbGVhcmluZ1xyXG4gICAgICBtYXhOdW1iZXJPZlNhbXBsZXM6IDEwMDBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gcHJvcGVydGllcyBmb3IgdmlzaWJpbGl0eSBhbmQgc2V0dGluZ3MgZm9yIHRoZSBncmFwaFxyXG4gICAgdGhpcy5raW5ldGljRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIHRoaXMucG90ZW50aWFsRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIHRoaXMudGhlcm1hbEVuZXJneURhdGFWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLnRvdGFsRW5lcmd5RGF0YVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGluZGV4IHBvaW50aW5nIHRvIHRoZSByYW5nZSBwbG90dGVkIG9uIHRoZSBlbmVyZ3kgcGxvdCwgc2VlIEdyYXBoc0NvbnN0YW50cy5QTE9UX1JBTkdFU1xyXG4gICAgdGhpcy5lbmVyZ3lQbG90U2NhbGVJbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxMSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBHcmFwaHNDb25zdGFudHMuUExPVF9SQU5HRVMubGVuZ3RoIC0gMSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHNldHMgdGhlIGluZGVwZW5kZW50IHZhcmlhYmxlIGZvciB0aGUgZ3JhcGggZGlzcGxheVxyXG4gICAgdGhpcy5pbmRlcGVuZGVudFZhcmlhYmxlUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIEdyYXBoc01vZGVsLkluZGVwZW5kZW50VmFyaWFibGUsIEdyYXBoc01vZGVsLkluZGVwZW5kZW50VmFyaWFibGUuUE9TSVRJT04gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gd2hldGhlciBvciBub3QgdGhlIGVuZXJneSBwbG90IGlzIHZpc2libGVcclxuICAgIHRoaXMuZW5lcmd5UGxvdFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5UGxvdFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGV4aXN0aW5nIGRhdGEgZmFkZXMgYXdheSBiZWZvcmUgcmVtb3ZhbCB3aGVuIHRoZSBza2F0ZXIgZGlyZWN0aW9uIGNoYW5nZXNcclxuICAgIHRoaXMuc2thdGVyLmRpcmVjdGlvblByb3BlcnR5LmxpbmsoIGRpcmVjdGlvbiA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5pbmRlcGVuZGVudFZhcmlhYmxlUHJvcGVydHkuZ2V0KCkgPT09IEdyYXBoc01vZGVsLkluZGVwZW5kZW50VmFyaWFibGUuUE9TSVRJT04gKSB7XHJcbiAgICAgICAgdGhpcy5pbml0aWF0ZVNhbXBsZVJlbW92YWwoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRoZXJlIGFyZSBmYXIgbW9yZSBwb2ludHMgcmVxdWlyZWQgZm9yIHRoZSBFbmVyZ3kgdnMgVGltZSBwbG90LCBzbyB3ZSBkb24ndCBsaW1pdCB0aGUgbnVtYmVyIG9mXHJcbiAgICAvLyBzYXZlZCBzYW1wbGVzIGluIHRoaXMgY2FzZVxyXG4gICAgdGhpcy5pbmRlcGVuZGVudFZhcmlhYmxlUHJvcGVydHkubGluayggaW5kZXBlbmRlbnRWYXJpYWJsZSA9PiB7XHJcbiAgICAgIHRoaXMubGltaXROdW1iZXJPZlNhbXBsZXMgPSBpbmRlcGVuZGVudFZhcmlhYmxlID09PSBHcmFwaHNNb2RlbC5JbmRlcGVuZGVudFZhcmlhYmxlLlBPU0lUSU9OO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBkYXRhIHdoZW4gdGhlIHRyYWNrIGNoYW5nZXNcclxuICAgIHRoaXMuc2NlbmVQcm9wZXJ0eS5saW5rKCBzY2VuZSA9PiB7XHJcbiAgICAgIHRoaXMuY2xlYXJFbmVyZ3lEYXRhKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5za2F0ZXIuZHJhZ2dpbmdQcm9wZXJ0eS5saW5rKCBpc0RyYWdnaW5nID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmluZGVwZW5kZW50VmFyaWFibGVQcm9wZXJ0eS5nZXQoKSA9PT0gR3JhcGhzTW9kZWwuSW5kZXBlbmRlbnRWYXJpYWJsZS5QT1NJVElPTiApIHtcclxuXHJcbiAgICAgICAgLy8gaWYgcGxvdHRpbmcgYWdhaW5zdCBwb3NpdGlvbiBkb24ndCBzYXZlIGFueSBza2F0ZXIgc2FtcGxlcyB3aGlsZSBkcmFnZ2luZywgYnV0IGlmIHBsb3R0aW5nIGFnYWluc3QgdGltZVxyXG4gICAgICAgIC8vIGl0IGlzIHN0aWxsIHVzZWZ1bCB0byBzZWUgZGF0YSBhcyBwb3RlbnRpYWwgZW5lcmd5IGNoYW5nZXNcclxuICAgICAgICB0aGlzLmNsZWFyRW5lcmd5RGF0YSgpO1xyXG4gICAgICAgIHRoaXMucHJldmVudFNhbXBsZVNhdmUgPSBpc0RyYWdnaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBpZiBwbG90dGluZyBhZ2FpbnN0IHRpbWUsIGl0IGlzIHN0aWxsIHVzZWZ1bCB0byBzZWUgY2hhbmdpbmcgZGF0YSBhcyBwb3RlbnRpYWwgZW5lcmd5IGNoYW5nZXMsIGJ1dCBwcmV2ZW50XHJcbiAgICAgICAgLy8gc2FtcGxlIHNhdmluZyB3aGlsZSBwYXVzZWQgYW5kIGRyYWdnaW5nIHNvIHRoYXQgd2UgZG9uJ3QgYWRkIGRhdGEgd2hpbGUgcGF1c2VkLCBidXQgc3RpbGwgc2F2ZSBkYXRhXHJcbiAgICAgICAgLy8gd2hpbGUgbWFudWFsbHkgc3RlcHBpbmdcclxuICAgICAgICB0aGlzLnByZXZlbnRTYW1wbGVTYXZlID0gaXNEcmFnZ2luZyAmJiB0aGlzLnBhdXNlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2xlYXIgb2xkIHNhbXBsZXMgaWYgd2UgYXJlIHBsb3R0aW5nIGZvciBsb25nZXIgdGhhbiB0aGUgcmFuZ2VcclxuICAgIHRoaXMuc2FtcGxlVGltZVByb3BlcnR5LmxpbmsoIHRpbWUgPT4ge1xyXG4gICAgICBjb25zdCBwbG90dGluZ1RpbWUgPSB0aGlzLmluZGVwZW5kZW50VmFyaWFibGVQcm9wZXJ0eS5nZXQoKSA9PT0gR3JhcGhzTW9kZWwuSW5kZXBlbmRlbnRWYXJpYWJsZS5USU1FO1xyXG4gICAgICBjb25zdCBvdmVyVGltZSA9IHRpbWUgPiBHcmFwaHNDb25zdGFudHMuTUFYX1BMT1RURURfVElNRTtcclxuICAgICAgaWYgKCBwbG90dGluZ1RpbWUgJiYgb3ZlclRpbWUgKSB7XHJcblxyXG4gICAgICAgIC8vIGNsZWFyIGFsbCBzYW1wbGVzIHByaW9yIHRvIHRpbWUgLSBtYXhUaW1lICh0aGUgaG9yaXpvbnRhbCByYW5nZSBvZiB0aGUgZGF0YSlcclxuICAgICAgICBjb25zdCBzYW1wbGVzVG9SZW1vdmUgPSBbXTtcclxuICAgICAgICBjb25zdCBtaW5TYXZlZFRpbWUgPSB0aW1lIC0gR3JhcGhzQ29uc3RhbnRzLk1BWF9QTE9UVEVEX1RJTUU7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5kYXRhU2FtcGxlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGlmICggdGhpcy5kYXRhU2FtcGxlcy5nZXQoIGkgKS50aW1lIDwgbWluU2F2ZWRUaW1lICkge1xyXG4gICAgICAgICAgICBzYW1wbGVzVG9SZW1vdmUucHVzaCggdGhpcy5kYXRhU2FtcGxlcy5nZXQoIGkgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5iYXRjaFJlbW92ZVNhbXBsZXMoIHNhbXBsZXNUb1JlbW92ZSApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGF0YVNhbXBsZXMuZ2V0KCAwICkudGltZSA+PSBtaW5TYXZlZFRpbWUsICdkYXRhIHN0aWxsIGV4aXN0cyB0aGF0IGlzIGxlc3MgdGhhbiBwbG90IG1pbicgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGlmIGFueSBvZiB0aGUgVXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldCBjaGFuZ2VzLCB0aGUgdXNlciBpcyBjaGFuZ2luZyBzb21ldGhpbmcgdGhhdCB3b3VsZCBtb2RpZnkgdGhlXHJcbiAgICAvLyBwaHlzaWNhbCBzeXN0ZW0gYW5kIGNoYW5nZXMgZXZlcnl0aGluZyBpbiBzYXZlZCBFbmVyZ3lTa2F0ZVBhcmtEYXRhU2FtcGxlc1xyXG4gICAgTXVsdGlsaW5rLmxhenlNdWx0aWxpbmsoIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldC5wcm9wZXJ0aWVzLCAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5pbmRlcGVuZGVudFZhcmlhYmxlUHJvcGVydHkuZ2V0KCkgPT09IEdyYXBoc01vZGVsLkluZGVwZW5kZW50VmFyaWFibGUuVElNRSApIHtcclxuICAgICAgICBpZiAoIHRoaXMuZGF0YVNhbXBsZXMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgICAgICAvLyBvbmx5IHJlbW92ZSBkYXRhIGlmIHRoZSBjdXJzb3IgdGltZSBpcyBlYXJsaWVyIHRoYW4gdGhlIGxhc3Qgc2F2ZWQgc2FtcGxlXHJcbiAgICAgICAgICBpZiAoIHRoaXMuc2FtcGxlVGltZVByb3BlcnR5LmdldCgpIDwgdGhpcy5kYXRhU2FtcGxlcy5nZXQoIHRoaXMuZGF0YVNhbXBsZXMubGVuZ3RoIC0gMSApLnRpbWUgKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsb3Nlc3RTYW1wbGUgPSB0aGlzLmdldENsb3Nlc3RTa2F0ZXJTYW1wbGUoIHRoaXMuc2FtcGxlVGltZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4T2ZTYW1wbGUgPSB0aGlzLmRhdGFTYW1wbGVzLmluZGV4T2YoIGNsb3Nlc3RTYW1wbGUgKTtcclxuXHJcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4T2ZTYW1wbGUgPj0gMCwgJ3RpbWUgb2YgY3Vyc29yIG5lZWRzIHRvIGFsaWduIHdpdGggYSBza2F0ZXIgc2FtcGxlJyApO1xyXG4gICAgICAgICAgICB0aGlzLmJhdGNoUmVtb3ZlU2FtcGxlcyggdGhpcy5kYXRhU2FtcGxlcy5zbGljZSggaW5kZXhPZlNhbXBsZSApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaWYgcGxvdHRpbmcgYWdhaW5zdCBwb3NpdGlvbiB3ZSB3YW50IHRvIGNsZWFyIGRhdGEgd2hlbiBza2F0ZXIgcmV0dXJucywgYnV0IGl0IGlzIHVzZWZ1bCB0b1xyXG4gICAgLy8gc2VlIHByZXZpb3VzIGRhdGEgd2hlbiBwbG90dGluZyBhZ2FpbnN0IHRpbWUgc28gZG9uJ3QgY2xlYXIgaW4gdGhhdCBjYXNlXHJcbiAgICB0aGlzLnNrYXRlci5yZXR1cm5lZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmluZGVwZW5kZW50VmFyaWFibGVQcm9wZXJ0eS5nZXQoKSA9PT0gR3JhcGhzTW9kZWwuSW5kZXBlbmRlbnRWYXJpYWJsZS5QT1NJVElPTiApIHtcclxuICAgICAgICB0aGlzLmNsZWFyRW5lcmd5RGF0YSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIHNjcmVlbiBhbmQgUHJvcGVydGllcyBzcGVjaWZpYyB0byB0aGlzIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmVuZXJneVBsb3RWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLmtpbmV0aWNFbmVyZ3lEYXRhVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvdGVudGlhbEVuZXJneURhdGFWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGhlcm1hbEVuZXJneURhdGFWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudG90YWxFbmVyZ3lEYXRhVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5lbmVyZ3lQbG90U2NhbGVJbmRleFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmluZGVwZW5kZW50VmFyaWFibGVQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuY2xlYXJFbmVyZ3lEYXRhKCk7XHJcblxyXG4gICAgLy8gYWZ0ZXIgcmVzZXQsIHJlc3RhcnQgdGltZXIgZm9yIG5leHQgc2F2ZWQgc3RhdGVcclxuICAgIHRoaXMudGltZVNpbmNlU2thdGVyU2F2ZWQgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIGluIHNlY29uZHNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHN1cGVyLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgLy8gZm9yIHRoZSBcIkdyYXBoc1wiIHNjcmVlbiB3ZSB3YW50IHRvIHVwZGF0ZSBlbmVyZ2llcyB3aGlsZSBkcmFnZ2luZyBzbyB0aGF0IHRoZXkgYXJlIHJlY29yZGVkIG9uIHRoZSBncmFwaFxyXG4gICAgaWYgKCB0aGlzLnNrYXRlci5kcmFnZ2luZ1Byb3BlcnR5LmdldCgpICYmICF0aGlzLnBhdXNlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBjb25zdCBpbml0aWFsU3RhdGVDb3B5ID0gbmV3IFNrYXRlclN0YXRlKCB0aGlzLnNrYXRlciApO1xyXG4gICAgICB0aGlzLnN0ZXBNb2RlbCggZHQsIGluaXRpYWxTdGF0ZUNvcHkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEN1c3RvbSBzdGVwTW9kZWwgZm9yIHRoZSBTYXZlU2FtcGxlTW9kZWwuIElmIHRoZSBzYW1wbGVUaW1lUHJvcGVydHkgaXMgKm9sZGVyKiB0aGFuIHRoZSBtb3N0IHJlY2VudCBzYXZlZFxyXG4gICAqIHNhbXBsZSwgd2UgYXJlIHBsYXlpbmcgYmFjayB0aHJvdWdoIHNhdmVkIGRhdGEgYW5kIHN0ZXBwaW5nIHRocm91Z2ggc2F2ZWQgc2FtcGxlcyByYXRoZXIgdGhhbiBzdGVwcGluZ1xyXG4gICAqIHRoZSBtb2RlbC4gSWYgd2UgYXJlIGFjdHVhbGx5IHN0ZXBwaW5nIHRoZSBtb2RlbCBwaHlzaWNzLCB3ZSBhcmUgYWxzbyByZWNvcmRpbmcgbmV3IEVuZXJneVNrYXRlUGFya0RhdGFTYW1wbGVzXHJcbiAgICogaW4gdGhlIHN1cGVydHlwZSBmdW5jdGlvbi5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBpbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtIHtTa2F0ZXJTdGF0ZX0gc2thdGVyU3RhdGVcclxuICAgKiBAcmV0dXJucyB7U2thdGVyU3RhdGV9XHJcbiAgICovXHJcbiAgc3RlcE1vZGVsKCBkdCwgc2thdGVyU3RhdGUgKSB7XHJcbiAgICBjb25zdCBoYXNEYXRhID0gdGhpcy5kYXRhU2FtcGxlcy5sZW5ndGggPiAwO1xyXG5cclxuICAgIC8vIG9ubHkgaWYgd2UgaGF2ZSBkYXRhLCBzbyB0aGF0IHdlIGRvbid0IHRyeSB0byBnZXQgYSBkYXRhIHNhbXBsZSBpZiBsZW5ndGggaXMgMFxyXG4gICAgY29uc3QgY3Vyc29yT2xkZXJUaGFuTmV3ZXN0U2FtcGxlID0gaGFzRGF0YSAmJiAoIHRoaXMuc2FtcGxlVGltZVByb3BlcnR5LmdldCgpIDwgdGhpcy5kYXRhU2FtcGxlcy5nZXQoIHRoaXMuZGF0YVNhbXBsZXMubGVuZ3RoIC0gMSApLnRpbWUgKTtcclxuICAgIGNvbnN0IHBsb3R0aW5nVGltZSA9IHRoaXMuaW5kZXBlbmRlbnRWYXJpYWJsZVByb3BlcnR5LmdldCgpID09PSBHcmFwaHNNb2RlbC5JbmRlcGVuZGVudFZhcmlhYmxlLlRJTUU7XHJcblxyXG4gICAgLy8gd2UgYXJlIHBsYXlpbmcgYmFjayB0aHJvdWdoIGRhdGEgaWYgcGxvdHRpbmcgYWdhaW5zdCB0aW1lIGFuZCB0aGUgY3Vyc29yIGlzIG9sZGVyIHRoYW4gdGhlXHJcbiAgICBpZiAoIGN1cnNvck9sZGVyVGhhbk5ld2VzdFNhbXBsZSAmJiBwbG90dGluZ1RpbWUgKSB7XHJcblxyXG4gICAgICAvLyBza2F0ZXIgc2FtcGxlcyBhcmUgdXBkYXRlZCBub3QgYnkgc3RlcCwgYnV0IGJ5IHNldHRpbmcgbW9kZWwgdG8gY2xvc2VzdCBza2F0ZXIgc2FtcGxlIGF0IHRpbWVcclxuICAgICAgY29uc3QgY2xvc2VzdFNhbXBsZSA9IHRoaXMuZ2V0Q2xvc2VzdFNrYXRlclNhbXBsZSggdGhpcy5zYW1wbGVUaW1lUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgdGhpcy5zZXRGcm9tU2FtcGxlKCBjbG9zZXN0U2FtcGxlICk7XHJcbiAgICAgIHRoaXMuc2thdGVyLnVwZGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgIHRoaXMuc2FtcGxlVGltZVByb3BlcnR5LnNldCggdGhpcy5zYW1wbGVUaW1lUHJvcGVydHkuZ2V0KCkgKyBkdCApO1xyXG4gICAgICB0aGlzLnN0b3B3YXRjaC5zdGVwKCBkdCApO1xyXG5cclxuICAgICAgcmV0dXJuIGNsb3Nlc3RTYW1wbGUuc2thdGVyU3RhdGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHN1cGVyLnN0ZXBNb2RlbCggZHQsIHNrYXRlclN0YXRlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGNsb3Nlc3QgU2thdGVyU3RhdGUgdGhhdCB3YXMgc2F2ZWQgYXQgdGhlIHRpbWUgcHJvdmlkZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWUgKGluIHNlY29uZHMpXHJcbiAgICogQHJldHVybnMge0VuZXJneVNrYXRlUGFya0RhdGFTYW1wbGV9XHJcbiAgICovXHJcbiAgZ2V0Q2xvc2VzdFNrYXRlclNhbXBsZSggdGltZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGF0YVNhbXBsZXMubGVuZ3RoID4gMCwgJ21vZGVsIGhhcyBubyBzYXZlZCBFbmVyZ3lTa2F0ZVBhcmtEYXRhU2FtcGxlcyB0byByZXRyaWV2ZScgKTtcclxuXHJcbiAgICBsZXQgbmVhcmVzdEluZGV4ID0gXy5zb3J0ZWRJbmRleEJ5KCB0aGlzLmRhdGFTYW1wbGVzLCB7IHRpbWU6IHRpbWUgfSwgZW50cnkgPT4gZW50cnkudGltZSApO1xyXG4gICAgbmVhcmVzdEluZGV4ID0gVXRpbHMuY2xhbXAoIG5lYXJlc3RJbmRleCwgMCwgdGhpcy5kYXRhU2FtcGxlcy5sZW5ndGggLSAxICk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVNhbXBsZXMuZ2V0KCBuZWFyZXN0SW5kZXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSB0aGUgY3VzdG9tIHNldCBvZiB0cmFja3MgZm9yIHRoZSBcImdyYXBoc1wiIHNjcmVlbi4gVGhlIFwiZ3JhcGhzXCIgc2NyZWVuIGluY2x1ZGVzIGEgcGFyYWJvbGEgYW5kIGFcclxuICAgKiBkb3VibGUgd2VsbCB3aXRoIHVuaXF1ZSBzaGFwZXMgd2hlcmUgb25seSBjZXJ0YWluIGNvbnRyb2wgcG9pbnRzIGFyZSBkcmFnZ2FibGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEByZXR1cm5zIHtUcmFja1tdfVxyXG4gICAqL1xyXG4gIGNyZWF0ZUdyYXBoc1RyYWNrU2V0KCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gYWxsIHRyYWNrcyBpbiBncmFwaHMgc2NyZWVuIGFyZSBib3VuZCBieSB0aGVzZSBkaW1lbnNpb25zIChpbiBtZXRlcnMpXHJcbiAgICBjb25zdCB0cmFja0hlaWdodCA9IEdyYXBoc0NvbnN0YW50cy5UUkFDS19IRUlHSFQ7XHJcbiAgICBjb25zdCB0cmFja1dpZHRoID0gR3JhcGhzQ29uc3RhbnRzLlRSQUNLX1dJRFRIO1xyXG5cclxuICAgIGNvbnN0IHBhcmFib2xhQ29udHJvbFBvaW50cyA9IFByZW1hZGVUcmFja3MuY3JlYXRlUGFyYWJvbGFDb250cm9sUG9pbnRzKCB0aGlzLCB7XHJcbiAgICAgIHRyYWNrSGVpZ2h0OiB0cmFja0hlaWdodCxcclxuICAgICAgdHJhY2tXaWR0aDogdHJhY2tXaWR0aCxcclxuICAgICAgcDFWaXNpYmxlOiBmYWxzZSxcclxuICAgICAgcDNWaXNpYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBhcmFib2xhVHJhY2sgPSBQcmVtYWRlVHJhY2tzLmNyZWF0ZVRyYWNrKCB0aGlzLCBwYXJhYm9sYUNvbnRyb2xQb2ludHMsIHtcclxuICAgICAgY29uZmlndXJhYmxlOiB0aGlzLnRyYWNrc0NvbmZpZ3VyYWJsZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFyYWJvbGFUcmFjaycgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZG91YmxlV2VsbENvbnRyb2xQb2ludHMgPSBQcmVtYWRlVHJhY2tzLmNyZWF0ZURvdWJsZVdlbGxDb250cm9sUG9pbnRzKCB0aGlzLCB7XHJcbiAgICAgIHRyYWNrSGVpZ2h0OiA0LFxyXG4gICAgICB0cmFja1dpZHRoOiAxMCxcclxuICAgICAgdHJhY2tNaWRIZWlnaHQ6IDEuNSxcclxuXHJcbiAgICAgIHAxVmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHA1VmlzaWJsZTogZmFsc2UsXHJcblxyXG4gICAgICAvLyBsaW1pdCB2ZXJ0aWNhbCBib3VuZHMgZm9yIHBvaW50cyAxIGFuZCA1IHNvIHRoYXQgdGhlIHRyYWNrIGNhbiBuZXZlciBvdmVybGFwIHdpdGggb3RoZXIgVUkgY29tcG9uZW50cywgaW5jbHVkaW5nXHJcbiAgICAgIC8vIHdoZW4gaXQgaXMgYnVtcGVkIGFib3ZlIGdyb3VuZFxyXG4gICAgICBwMVVwU3BhY2luZzogMCxcclxuICAgICAgcDFEb3duU3BhY2luZzogMCxcclxuICAgICAgcDVVcFNwYWNpbmc6IDAsXHJcbiAgICAgIHA1RG93blNwYWNpbmc6IDAsXHJcblxyXG4gICAgICAvLyBzcGFjaW5nIGZvciB0aGUgbGltaXRpbmcgZHJhZyBib3VuZHMgb2YgdGhlIHRoaXJkIGNvbnRyb2wgcG9pbnRcclxuICAgICAgcDNVcFNwYWNpbmc6IDIuNSxcclxuICAgICAgcDNEb3duU3BhY2luZzogMS41XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBkb3VibGVXZWxsVHJhY2sgPSBQcmVtYWRlVHJhY2tzLmNyZWF0ZVRyYWNrKCB0aGlzLCBkb3VibGVXZWxsQ29udHJvbFBvaW50cywge1xyXG4gICAgICBjb25maWd1cmFibGU6IHRoaXMudHJhY2tzQ29uZmlndXJhYmxlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkb3VibGVXZWxsVHJhY2snICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiBbIHBhcmFib2xhVHJhY2ssIGRvdWJsZVdlbGxUcmFjayBdO1xyXG4gIH1cclxufVxyXG5cclxuR3JhcGhzTW9kZWwuSW5kZXBlbmRlbnRWYXJpYWJsZSA9IEVudW1lcmF0aW9uRGVwcmVjYXRlZC5ieUtleXMoIFsgJ1BPU0lUSU9OJywgJ1RJTUUnIF0gKTtcclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ0dyYXBoc01vZGVsJywgR3JhcGhzTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgR3JhcGhzTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsNkJBQTZCLE1BQU0sc0RBQXNEO0FBQ2hHLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MscUJBQXFCLE1BQU0sbURBQW1EO0FBQ3JGLE9BQU9DLDRCQUE0QixNQUFNLG9EQUFvRDtBQUM3RixPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBRW5ELE1BQU1DLFdBQVcsU0FBU0wsNEJBQTRCLENBQUM7RUFFckQ7QUFDRjtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsZ0JBQWdCLEVBQUVDLE1BQU0sRUFBRztJQUV0QztJQUNBLE1BQU1DLGtCQUFrQixHQUFHLElBQUk7O0lBRS9CO0lBQ0EsTUFBTUMsV0FBVyxHQUFHTixlQUFlLENBQUNPLFlBQVk7SUFDaEQsTUFBTUMsVUFBVSxHQUFHUixlQUFlLENBQUNTLFdBQVc7O0lBRTlDO0lBQ0EsS0FBSyxDQUFFTixnQkFBZ0IsRUFBRUMsTUFBTSxDQUFDTSxZQUFZLENBQUUsYUFBYyxDQUFDLEVBQUU7TUFFN0Q7TUFDQUMsVUFBVSxFQUFFLENBQ1ZkLGFBQWEsQ0FBQ2UsU0FBUyxDQUFDQyxRQUFRLEVBQ2hDaEIsYUFBYSxDQUFDZSxTQUFTLENBQUNFLFdBQVcsQ0FDcEM7TUFFRDtNQUNBO01BQ0FDLDhCQUE4QixFQUFFO1FBQzlCQyw2QkFBNkIsRUFBRTtVQUM3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