// Copyright 2015-2021, University of Colorado Boulder

/**
 * Primary model for the Multiple Cells screen.
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Random from '../../../../dot/js/Random.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import Cell from './Cell.js';
import CellProteinSynthesisSimulator from './CellProteinSynthesisSimulator.js';

// constants
const MAX_CELLS = 90;
const NOMINAL_TIME_STEP = 1 / 60; // standard frame rate of browsers

const boundingShapeWidth = Cell.DefaultCellSize.width * 20;
const boundingShapeHeight = boundingShapeWidth * 0.35;
const bounds = new Bounds2(-boundingShapeWidth / 2, -boundingShapeHeight / 2, -boundingShapeWidth / 2 + boundingShapeWidth, -boundingShapeHeight / 2 + boundingShapeHeight);

// Seeds for the random number generators.  Values chosen empirically.
const POSITION_RANDOMIZER_SEED = 226;
const SIZE_AND_ORIENTATION_RANDOMIZER_SEED = 25214903912;
class MultipleCellsModel {
  /**
   */
  constructor() {
    this.clockRunningProperty = new Property(true); // @public

    // List of all cells that are being simulated. Some of these cells will be visible to the user at any given time,
    // but some may not. All are clocked and their parameters are kept the same in order to keep them "in sync" with the
    // visible cells. This prevents large discontinuities in the protein level when the user adds or removes cells.
    this.cellList = []; // @public

    // List of cells in the model that should be visible to the user and that are being used in the average protein
    // level calculation. It is observable so that the view can track them coming and going.
    this.visibleCellList = createObservableArray(); // @public

    // Property that controls the number of cells that are visible and that are being included in the calculation of the
    // average protein level. This is intended to be set by clients, such as the view.
    this.numberOfVisibleCellsProperty = new Property(1); // @public

    // Properties used to control the rate at which protein is synthesized and degraded in the cells. These are intended
    // to be set by clients, such as the view.
    // @public
    this.transcriptionFactorLevelProperty = new Property(CellProteinSynthesisSimulator.DefaultTranscriptionFactorCount, {
      reentrant: true
    });
    this.proteinDegradationRateProperty = new Property(CellProteinSynthesisSimulator.DefaultProteinDegradationRate);
    this.transcriptionFactorAssociationProbabilityProperty = new Property(CellProteinSynthesisSimulator.DefaultTFAssociationProbability, {
      reentrant: true
    });
    this.polymeraseAssociationProbabilityProperty = new Property(CellProteinSynthesisSimulator.DefaultPolymeraseAssociationProbability);
    this.mRnaDegradationRateProperty = new Property(CellProteinSynthesisSimulator.DefaultMRNADegradationRate, {
      reentrant: true
    });

    // Property that tracks the average protein level of all the cells.
    this.averageProteinLevelProperty = new Property(0.0); // @public( read-only )

    // Random number generators, used to vary the shape and position of the cells. Seeds are chosen empirically.
    // @private
    this.sizeAndRotationRandomizer = new Random({
      seed: SIZE_AND_ORIENTATION_RANDOMIZER_SEED
    });
    this.positionRandomizer = new Random({
      seed: POSITION_RANDOMIZER_SEED
    });

    // Add the max number of cells to the list of invisible cells.
    while (this.cellList.length < MAX_CELLS) {
      let newCell;
      if (this.cellList.length === 0) {
        // The first cell is centered and level.
        newCell = new Cell(0);
        newCell.positionX = 0;
        newCell.positionY = 0;
      } else {
        newCell = new Cell(Math.PI * 2 * this.sizeAndRotationRandomizer.nextDouble());
        this.placeCellInOpenPosition(newCell);
      }
      this.cellList.push(newCell);
    }

    // Hook up the property that controls the number of visible cells.
    this.numberOfVisibleCellsProperty.link(numVisibleCells => {
      assert && assert(numVisibleCells >= 1 && numVisibleCells <= MAX_CELLS);
      this.setNumVisibleCells(Math.floor(numVisibleCells));
    });

    // Hook up the cell property parameters to the individual cells so that changes are propagated.
    this.transcriptionFactorLevelProperty.link(transcriptionFactorLevel => {
      this.cellList.forEach(cell => {
        cell.setTranscriptionFactorCount(transcriptionFactorLevel);
      });
    });
    this.polymeraseAssociationProbabilityProperty.link(polymeraseAssociationProbability => {
      this.cellList.forEach(cell => {
        cell.setPolymeraseAssociationRate(polymeraseAssociationProbability);
      });
    });
    this.transcriptionFactorAssociationProbabilityProperty.link(transcriptionFactorAssociationProbability => {
      this.cellList.forEach(cell => {
        cell.setGeneTranscriptionFactorAssociationRate(transcriptionFactorAssociationProbability);
      });
    });
    this.proteinDegradationRateProperty.link(proteinDegradationRate => {
      this.cellList.forEach(cell => {
        cell.setProteinDegradationRate(proteinDegradationRate);
      });
    });
    this.mRnaDegradationRateProperty.link(mRnaDegradationRate => {
      this.cellList.forEach(cell => {
        cell.setMRnaDegradationRate(mRnaDegradationRate);
      });
    });

    // Get the protein levels to steady state before depicting them to the user so that they don't start at zero.
    this.stepToSteadyState();
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    if (this.clockRunningProperty.get()) {
      this.stepInTime(dt);
    }
  }

  /**
   * @param {number} dt
   * @public
   */
  stepInTime(dt) {
    // Step each of the cells.
    // Update the average protein level. Note that only the visible cells are used for this calculation. This helps
    // convey the concept that the more cells there are, the more even the average level is.

    let totalProteinCount = 0;
    this.cellList.forEach(cell => {
      cell.step(dt);
      if (this.visibleCellList.includes(cell)) {
        totalProteinCount += cell.proteinCount.get();
      }
    });
    this.averageProteinLevelProperty.set(totalProteinCount / this.visibleCellList.length);
  }

  /**
   * @public
   */
  reset() {
    // Reset all the cell control parameters.
    this.numberOfVisibleCellsProperty.reset();
    this.transcriptionFactorLevelProperty.reset();
    this.proteinDegradationRateProperty.reset();
    this.transcriptionFactorAssociationProbabilityProperty.reset();
    this.polymeraseAssociationProbabilityProperty.reset();
    this.mRnaDegradationRateProperty.reset();
    this.clockRunningProperty.reset();
    this.setNumVisibleCells(this.numberOfVisibleCellsProperty.get());
    this.stepToSteadyState();
  }

  /**
   * Step the model a number of times in order to allow it to reach a steady state.
   * @private
   */
  stepToSteadyState() {
    // The number of times that are needed for the model to reach steady state was empirically determined.
    for (let i = 0; i < 1000; i++) {
      this.step(NOMINAL_TIME_STEP);
    }
  }

  /**
   * Set the number of cells that should be visible to the user and that are included in the calculation of average
   * protein level.
   * @param numCells - target number of cells.
   * @public
   */
  setNumVisibleCells(numCells) {
    assert && assert(numCells > 0 && numCells <= MAX_CELLS); // Bounds checking.

    if (this.visibleCellList.length < numCells) {
      // Add cells to the visible list.
      while (this.visibleCellList.length < numCells) {
        this.visibleCellList.add(this.cellList[this.visibleCellList.length]);
      }
    } else if (this.visibleCellList.length > numCells) {
      // Remove cells from the visible list.  Take them off the end.
      while (this.visibleCellList.length > numCells) {
        this.visibleCellList.pop();
      }
    }
  }

  /**
   * find a position for the given cell that doesn't overlap with other cells on the list
   * @private
   */
  placeCellInOpenPosition(cell) {
    // Loop, randomly generating positions of increasing distance from the center, until the cell is positioned in a
    // place that does not overlap with the existing cells. The overall bounding shape of the collection of cells is
    // elliptical, not circular.
    for (let i = 0; i < Math.ceil(Math.sqrt(this.cellList.length)); i++) {
      const radius = (i + 1) * Cell.DefaultCellSize.width * (this.positionRandomizer.nextDouble() / 2 + 0.75);
      for (let j = 0; j < radius * Math.PI / (Cell.DefaultCellSize.height * 2); j++) {
        const angle = this.positionRandomizer.nextDouble() * 2 * Math.PI;
        cell.positionX = radius * Math.cos(angle);
        cell.positionY = radius * Math.sin(angle);
        if (!bounds.containsCoordinates(cell.positionX, cell.positionY)) {
          // Not in bounds.
          continue;
        }
        let overlapDetected = false;
        for (let k = 0; k < this.cellList.length; k++) {
          const existingCell = this.cellList[k];
          // new bounds
          if (cell.bounds.shiftedXY(cell.positionX, cell.positionY).intersectsBounds(existingCell.bounds.shiftedXY(existingCell.positionX, existingCell.positionY))) {
            overlapDetected = true;
            break;
          }
        }
        if (!overlapDetected) {
          // Found an open spot.
          return;
        }
      }
    }
    assert && assert(false, 'exited placement loop without having found open position');
  }
}

// statics
MultipleCellsModel.MaxCells = MAX_CELLS;
geneExpressionEssentials.register('MultipleCellsModel', MultipleCellsModel);
export default MultipleCellsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5kb20iLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJDZWxsIiwiQ2VsbFByb3RlaW5TeW50aGVzaXNTaW11bGF0b3IiLCJNQVhfQ0VMTFMiLCJOT01JTkFMX1RJTUVfU1RFUCIsImJvdW5kaW5nU2hhcGVXaWR0aCIsIkRlZmF1bHRDZWxsU2l6ZSIsIndpZHRoIiwiYm91bmRpbmdTaGFwZUhlaWdodCIsImJvdW5kcyIsIlBPU0lUSU9OX1JBTkRPTUlaRVJfU0VFRCIsIlNJWkVfQU5EX09SSUVOVEFUSU9OX1JBTkRPTUlaRVJfU0VFRCIsIk11bHRpcGxlQ2VsbHNNb2RlbCIsImNvbnN0cnVjdG9yIiwiY2xvY2tSdW5uaW5nUHJvcGVydHkiLCJjZWxsTGlzdCIsInZpc2libGVDZWxsTGlzdCIsIm51bWJlck9mVmlzaWJsZUNlbGxzUHJvcGVydHkiLCJ0cmFuc2NyaXB0aW9uRmFjdG9yTGV2ZWxQcm9wZXJ0eSIsIkRlZmF1bHRUcmFuc2NyaXB0aW9uRmFjdG9yQ291bnQiLCJyZWVudHJhbnQiLCJwcm90ZWluRGVncmFkYXRpb25SYXRlUHJvcGVydHkiLCJEZWZhdWx0UHJvdGVpbkRlZ3JhZGF0aW9uUmF0ZSIsInRyYW5zY3JpcHRpb25GYWN0b3JBc3NvY2lhdGlvblByb2JhYmlsaXR5UHJvcGVydHkiLCJEZWZhdWx0VEZBc3NvY2lhdGlvblByb2JhYmlsaXR5IiwicG9seW1lcmFzZUFzc29jaWF0aW9uUHJvYmFiaWxpdHlQcm9wZXJ0eSIsIkRlZmF1bHRQb2x5bWVyYXNlQXNzb2NpYXRpb25Qcm9iYWJpbGl0eSIsIm1SbmFEZWdyYWRhdGlvblJhdGVQcm9wZXJ0eSIsIkRlZmF1bHRNUk5BRGVncmFkYXRpb25SYXRlIiwiYXZlcmFnZVByb3RlaW5MZXZlbFByb3BlcnR5Iiwic2l6ZUFuZFJvdGF0aW9uUmFuZG9taXplciIsInNlZWQiLCJwb3NpdGlvblJhbmRvbWl6ZXIiLCJsZW5ndGgiLCJuZXdDZWxsIiwicG9zaXRpb25YIiwicG9zaXRpb25ZIiwiTWF0aCIsIlBJIiwibmV4dERvdWJsZSIsInBsYWNlQ2VsbEluT3BlblBvc2l0aW9uIiwicHVzaCIsImxpbmsiLCJudW1WaXNpYmxlQ2VsbHMiLCJhc3NlcnQiLCJzZXROdW1WaXNpYmxlQ2VsbHMiLCJmbG9vciIsInRyYW5zY3JpcHRpb25GYWN0b3JMZXZlbCIsImZvckVhY2giLCJjZWxsIiwic2V0VHJhbnNjcmlwdGlvbkZhY3RvckNvdW50IiwicG9seW1lcmFzZUFzc29jaWF0aW9uUHJvYmFiaWxpdHkiLCJzZXRQb2x5bWVyYXNlQXNzb2NpYXRpb25SYXRlIiwidHJhbnNjcmlwdGlvbkZhY3RvckFzc29jaWF0aW9uUHJvYmFiaWxpdHkiLCJzZXRHZW5lVHJhbnNjcmlwdGlvbkZhY3RvckFzc29jaWF0aW9uUmF0ZSIsInByb3RlaW5EZWdyYWRhdGlvblJhdGUiLCJzZXRQcm90ZWluRGVncmFkYXRpb25SYXRlIiwibVJuYURlZ3JhZGF0aW9uUmF0ZSIsInNldE1SbmFEZWdyYWRhdGlvblJhdGUiLCJzdGVwVG9TdGVhZHlTdGF0ZSIsInN0ZXAiLCJkdCIsImdldCIsInN0ZXBJblRpbWUiLCJ0b3RhbFByb3RlaW5Db3VudCIsImluY2x1ZGVzIiwicHJvdGVpbkNvdW50Iiwic2V0IiwicmVzZXQiLCJpIiwibnVtQ2VsbHMiLCJhZGQiLCJwb3AiLCJjZWlsIiwic3FydCIsInJhZGl1cyIsImoiLCJoZWlnaHQiLCJhbmdsZSIsImNvcyIsInNpbiIsImNvbnRhaW5zQ29vcmRpbmF0ZXMiLCJvdmVybGFwRGV0ZWN0ZWQiLCJrIiwiZXhpc3RpbmdDZWxsIiwic2hpZnRlZFhZIiwiaW50ZXJzZWN0c0JvdW5kcyIsIk1heENlbGxzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNdWx0aXBsZUNlbGxzTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHJpbWFyeSBtb2RlbCBmb3IgdGhlIE11bHRpcGxlIENlbGxzIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgQ2VsbCBmcm9tICcuL0NlbGwuanMnO1xyXG5pbXBvcnQgQ2VsbFByb3RlaW5TeW50aGVzaXNTaW11bGF0b3IgZnJvbSAnLi9DZWxsUHJvdGVpblN5bnRoZXNpc1NpbXVsYXRvci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX0NFTExTID0gOTA7XHJcbmNvbnN0IE5PTUlOQUxfVElNRV9TVEVQID0gMSAvIDYwOyAvLyBzdGFuZGFyZCBmcmFtZSByYXRlIG9mIGJyb3dzZXJzXHJcblxyXG5jb25zdCBib3VuZGluZ1NoYXBlV2lkdGggPSBDZWxsLkRlZmF1bHRDZWxsU2l6ZS53aWR0aCAqIDIwO1xyXG5jb25zdCBib3VuZGluZ1NoYXBlSGVpZ2h0ID0gYm91bmRpbmdTaGFwZVdpZHRoICogMC4zNTtcclxuY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgLWJvdW5kaW5nU2hhcGVXaWR0aCAvIDIsXHJcbiAgLWJvdW5kaW5nU2hhcGVIZWlnaHQgLyAyLFxyXG4gIC1ib3VuZGluZ1NoYXBlV2lkdGggLyAyICsgYm91bmRpbmdTaGFwZVdpZHRoLFxyXG4gIC1ib3VuZGluZ1NoYXBlSGVpZ2h0IC8gMiArIGJvdW5kaW5nU2hhcGVIZWlnaHRcclxuKTtcclxuXHJcbi8vIFNlZWRzIGZvciB0aGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzLiAgVmFsdWVzIGNob3NlbiBlbXBpcmljYWxseS5cclxuY29uc3QgUE9TSVRJT05fUkFORE9NSVpFUl9TRUVEID0gMjI2O1xyXG5jb25zdCBTSVpFX0FORF9PUklFTlRBVElPTl9SQU5ET01JWkVSX1NFRUQgPSAyNTIxNDkwMzkxMjtcclxuXHJcbmNsYXNzIE11bHRpcGxlQ2VsbHNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5jbG9ja1J1bm5pbmdQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gTGlzdCBvZiBhbGwgY2VsbHMgdGhhdCBhcmUgYmVpbmcgc2ltdWxhdGVkLiBTb21lIG9mIHRoZXNlIGNlbGxzIHdpbGwgYmUgdmlzaWJsZSB0byB0aGUgdXNlciBhdCBhbnkgZ2l2ZW4gdGltZSxcclxuICAgIC8vIGJ1dCBzb21lIG1heSBub3QuIEFsbCBhcmUgY2xvY2tlZCBhbmQgdGhlaXIgcGFyYW1ldGVycyBhcmUga2VwdCB0aGUgc2FtZSBpbiBvcmRlciB0byBrZWVwIHRoZW0gXCJpbiBzeW5jXCIgd2l0aCB0aGVcclxuICAgIC8vIHZpc2libGUgY2VsbHMuIFRoaXMgcHJldmVudHMgbGFyZ2UgZGlzY29udGludWl0aWVzIGluIHRoZSBwcm90ZWluIGxldmVsIHdoZW4gdGhlIHVzZXIgYWRkcyBvciByZW1vdmVzIGNlbGxzLlxyXG4gICAgdGhpcy5jZWxsTGlzdCA9IFtdOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gTGlzdCBvZiBjZWxscyBpbiB0aGUgbW9kZWwgdGhhdCBzaG91bGQgYmUgdmlzaWJsZSB0byB0aGUgdXNlciBhbmQgdGhhdCBhcmUgYmVpbmcgdXNlZCBpbiB0aGUgYXZlcmFnZSBwcm90ZWluXHJcbiAgICAvLyBsZXZlbCBjYWxjdWxhdGlvbi4gSXQgaXMgb2JzZXJ2YWJsZSBzbyB0aGF0IHRoZSB2aWV3IGNhbiB0cmFjayB0aGVtIGNvbWluZyBhbmQgZ29pbmcuXHJcbiAgICB0aGlzLnZpc2libGVDZWxsTGlzdCA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gUHJvcGVydHkgdGhhdCBjb250cm9scyB0aGUgbnVtYmVyIG9mIGNlbGxzIHRoYXQgYXJlIHZpc2libGUgYW5kIHRoYXQgYXJlIGJlaW5nIGluY2x1ZGVkIGluIHRoZSBjYWxjdWxhdGlvbiBvZiB0aGVcclxuICAgIC8vIGF2ZXJhZ2UgcHJvdGVpbiBsZXZlbC4gVGhpcyBpcyBpbnRlbmRlZCB0byBiZSBzZXQgYnkgY2xpZW50cywgc3VjaCBhcyB0aGUgdmlldy5cclxuICAgIHRoaXMubnVtYmVyT2ZWaXNpYmxlQ2VsbHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMSApOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gUHJvcGVydGllcyB1c2VkIHRvIGNvbnRyb2wgdGhlIHJhdGUgYXQgd2hpY2ggcHJvdGVpbiBpcyBzeW50aGVzaXplZCBhbmQgZGVncmFkZWQgaW4gdGhlIGNlbGxzLiBUaGVzZSBhcmUgaW50ZW5kZWRcclxuICAgIC8vIHRvIGJlIHNldCBieSBjbGllbnRzLCBzdWNoIGFzIHRoZSB2aWV3LlxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yTGV2ZWxQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggQ2VsbFByb3RlaW5TeW50aGVzaXNTaW11bGF0b3IuRGVmYXVsdFRyYW5zY3JpcHRpb25GYWN0b3JDb3VudCwgeyByZWVudHJhbnQ6IHRydWUgfSApO1xyXG4gICAgdGhpcy5wcm90ZWluRGVncmFkYXRpb25SYXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIENlbGxQcm90ZWluU3ludGhlc2lzU2ltdWxhdG9yLkRlZmF1bHRQcm90ZWluRGVncmFkYXRpb25SYXRlICk7XHJcbiAgICB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JBc3NvY2lhdGlvblByb2JhYmlsaXR5UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoXHJcbiAgICAgIENlbGxQcm90ZWluU3ludGhlc2lzU2ltdWxhdG9yLkRlZmF1bHRURkFzc29jaWF0aW9uUHJvYmFiaWxpdHksIHtcclxuICAgICAgICByZWVudHJhbnQ6IHRydWVcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMucG9seW1lcmFzZUFzc29jaWF0aW9uUHJvYmFiaWxpdHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eShcclxuICAgICAgQ2VsbFByb3RlaW5TeW50aGVzaXNTaW11bGF0b3IuRGVmYXVsdFBvbHltZXJhc2VBc3NvY2lhdGlvblByb2JhYmlsaXR5XHJcbiAgICApO1xyXG4gICAgdGhpcy5tUm5hRGVncmFkYXRpb25SYXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIENlbGxQcm90ZWluU3ludGhlc2lzU2ltdWxhdG9yLkRlZmF1bHRNUk5BRGVncmFkYXRpb25SYXRlLCB7IHJlZW50cmFudDogdHJ1ZSB9ICk7XHJcblxyXG4gICAgLy8gUHJvcGVydHkgdGhhdCB0cmFja3MgdGhlIGF2ZXJhZ2UgcHJvdGVpbiBsZXZlbCBvZiBhbGwgdGhlIGNlbGxzLlxyXG4gICAgdGhpcy5hdmVyYWdlUHJvdGVpbkxldmVsUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAuMCApOyAvLyBAcHVibGljKCByZWFkLW9ubHkgKVxyXG5cclxuICAgIC8vIFJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycywgdXNlZCB0byB2YXJ5IHRoZSBzaGFwZSBhbmQgcG9zaXRpb24gb2YgdGhlIGNlbGxzLiBTZWVkcyBhcmUgY2hvc2VuIGVtcGlyaWNhbGx5LlxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuc2l6ZUFuZFJvdGF0aW9uUmFuZG9taXplciA9IG5ldyBSYW5kb20oIHtcclxuICAgICAgc2VlZDogU0laRV9BTkRfT1JJRU5UQVRJT05fUkFORE9NSVpFUl9TRUVEXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUmFuZG9taXplciA9IG5ldyBSYW5kb20oIHtcclxuICAgICAgc2VlZDogUE9TSVRJT05fUkFORE9NSVpFUl9TRUVEXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBtYXggbnVtYmVyIG9mIGNlbGxzIHRvIHRoZSBsaXN0IG9mIGludmlzaWJsZSBjZWxscy5cclxuICAgIHdoaWxlICggdGhpcy5jZWxsTGlzdC5sZW5ndGggPCBNQVhfQ0VMTFMgKSB7XHJcbiAgICAgIGxldCBuZXdDZWxsO1xyXG4gICAgICBpZiAoIHRoaXMuY2VsbExpc3QubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgIC8vIFRoZSBmaXJzdCBjZWxsIGlzIGNlbnRlcmVkIGFuZCBsZXZlbC5cclxuICAgICAgICBuZXdDZWxsID0gbmV3IENlbGwoIDAgKTtcclxuICAgICAgICBuZXdDZWxsLnBvc2l0aW9uWCA9IDA7XHJcbiAgICAgICAgbmV3Q2VsbC5wb3NpdGlvblkgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5ld0NlbGwgPSBuZXcgQ2VsbCggTWF0aC5QSSAqIDIgKiB0aGlzLnNpemVBbmRSb3RhdGlvblJhbmRvbWl6ZXIubmV4dERvdWJsZSgpICk7XHJcbiAgICAgICAgdGhpcy5wbGFjZUNlbGxJbk9wZW5Qb3NpdGlvbiggbmV3Q2VsbCApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2VsbExpc3QucHVzaCggbmV3Q2VsbCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvb2sgdXAgdGhlIHByb3BlcnR5IHRoYXQgY29udHJvbHMgdGhlIG51bWJlciBvZiB2aXNpYmxlIGNlbGxzLlxyXG4gICAgdGhpcy5udW1iZXJPZlZpc2libGVDZWxsc1Byb3BlcnR5LmxpbmsoIG51bVZpc2libGVDZWxscyA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bVZpc2libGVDZWxscyA+PSAxICYmIG51bVZpc2libGVDZWxscyA8PSBNQVhfQ0VMTFMgKTtcclxuICAgICAgdGhpcy5zZXROdW1WaXNpYmxlQ2VsbHMoIE1hdGguZmxvb3IoIG51bVZpc2libGVDZWxscyApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgY2VsbCBwcm9wZXJ0eSBwYXJhbWV0ZXJzIHRvIHRoZSBpbmRpdmlkdWFsIGNlbGxzIHNvIHRoYXQgY2hhbmdlcyBhcmUgcHJvcGFnYXRlZC5cclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckxldmVsUHJvcGVydHkubGluayggdHJhbnNjcmlwdGlvbkZhY3RvckxldmVsID0+IHtcclxuICAgICAgdGhpcy5jZWxsTGlzdC5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgICBjZWxsLnNldFRyYW5zY3JpcHRpb25GYWN0b3JDb3VudCggdHJhbnNjcmlwdGlvbkZhY3RvckxldmVsICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBvbHltZXJhc2VBc3NvY2lhdGlvblByb2JhYmlsaXR5UHJvcGVydHkubGluayggcG9seW1lcmFzZUFzc29jaWF0aW9uUHJvYmFiaWxpdHkgPT4ge1xyXG4gICAgICB0aGlzLmNlbGxMaXN0LmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICAgIGNlbGwuc2V0UG9seW1lcmFzZUFzc29jaWF0aW9uUmF0ZSggcG9seW1lcmFzZUFzc29jaWF0aW9uUHJvYmFiaWxpdHkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckFzc29jaWF0aW9uUHJvYmFiaWxpdHlQcm9wZXJ0eS5saW5rKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXNzb2NpYXRpb25Qcm9iYWJpbGl0eSA9PiB7XHJcbiAgICAgIHRoaXMuY2VsbExpc3QuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgY2VsbC5zZXRHZW5lVHJhbnNjcmlwdGlvbkZhY3RvckFzc29jaWF0aW9uUmF0ZSggdHJhbnNjcmlwdGlvbkZhY3RvckFzc29jaWF0aW9uUHJvYmFiaWxpdHkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucHJvdGVpbkRlZ3JhZGF0aW9uUmF0ZVByb3BlcnR5LmxpbmsoIHByb3RlaW5EZWdyYWRhdGlvblJhdGUgPT4ge1xyXG4gICAgICB0aGlzLmNlbGxMaXN0LmZvckVhY2goIGNlbGwgPT4ge1xyXG4gICAgICAgIGNlbGwuc2V0UHJvdGVpbkRlZ3JhZGF0aW9uUmF0ZSggcHJvdGVpbkRlZ3JhZGF0aW9uUmF0ZSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tUm5hRGVncmFkYXRpb25SYXRlUHJvcGVydHkubGluayggbVJuYURlZ3JhZGF0aW9uUmF0ZSA9PiB7XHJcbiAgICAgIHRoaXMuY2VsbExpc3QuZm9yRWFjaCggY2VsbCA9PiB7XHJcbiAgICAgICAgY2VsbC5zZXRNUm5hRGVncmFkYXRpb25SYXRlKCBtUm5hRGVncmFkYXRpb25SYXRlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHByb3RlaW4gbGV2ZWxzIHRvIHN0ZWFkeSBzdGF0ZSBiZWZvcmUgZGVwaWN0aW5nIHRoZW0gdG8gdGhlIHVzZXIgc28gdGhhdCB0aGV5IGRvbid0IHN0YXJ0IGF0IHplcm8uXHJcbiAgICB0aGlzLnN0ZXBUb1N0ZWFkeVN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBpZiAoIHRoaXMuY2xvY2tSdW5uaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMuc3RlcEluVGltZSggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwSW5UaW1lKCBkdCApIHtcclxuICAgIC8vIFN0ZXAgZWFjaCBvZiB0aGUgY2VsbHMuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGF2ZXJhZ2UgcHJvdGVpbiBsZXZlbC4gTm90ZSB0aGF0IG9ubHkgdGhlIHZpc2libGUgY2VsbHMgYXJlIHVzZWQgZm9yIHRoaXMgY2FsY3VsYXRpb24uIFRoaXMgaGVscHNcclxuICAgIC8vIGNvbnZleSB0aGUgY29uY2VwdCB0aGF0IHRoZSBtb3JlIGNlbGxzIHRoZXJlIGFyZSwgdGhlIG1vcmUgZXZlbiB0aGUgYXZlcmFnZSBsZXZlbCBpcy5cclxuXHJcbiAgICBsZXQgdG90YWxQcm90ZWluQ291bnQgPSAwO1xyXG4gICAgdGhpcy5jZWxsTGlzdC5mb3JFYWNoKCBjZWxsID0+IHtcclxuICAgICAgY2VsbC5zdGVwKCBkdCApO1xyXG4gICAgICBpZiAoIHRoaXMudmlzaWJsZUNlbGxMaXN0LmluY2x1ZGVzKCBjZWxsICkgKSB7XHJcbiAgICAgICAgdG90YWxQcm90ZWluQ291bnQgKz0gY2VsbC5wcm90ZWluQ291bnQuZ2V0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYXZlcmFnZVByb3RlaW5MZXZlbFByb3BlcnR5LnNldCggdG90YWxQcm90ZWluQ291bnQgLyB0aGlzLnZpc2libGVDZWxsTGlzdC5sZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgdGhlIGNlbGwgY29udHJvbCBwYXJhbWV0ZXJzLlxyXG4gICAgdGhpcy5udW1iZXJPZlZpc2libGVDZWxsc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JMZXZlbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnByb3RlaW5EZWdyYWRhdGlvblJhdGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXNzb2NpYXRpb25Qcm9iYWJpbGl0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnBvbHltZXJhc2VBc3NvY2lhdGlvblByb2JhYmlsaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubVJuYURlZ3JhZGF0aW9uUmF0ZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNsb2NrUnVubmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNldE51bVZpc2libGVDZWxscyggdGhpcy5udW1iZXJPZlZpc2libGVDZWxsc1Byb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgdGhpcy5zdGVwVG9TdGVhZHlTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcCB0aGUgbW9kZWwgYSBudW1iZXIgb2YgdGltZXMgaW4gb3JkZXIgdG8gYWxsb3cgaXQgdG8gcmVhY2ggYSBzdGVhZHkgc3RhdGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGVwVG9TdGVhZHlTdGF0ZSgpIHtcclxuXHJcbiAgICAvLyBUaGUgbnVtYmVyIG9mIHRpbWVzIHRoYXQgYXJlIG5lZWRlZCBmb3IgdGhlIG1vZGVsIHRvIHJlYWNoIHN0ZWFkeSBzdGF0ZSB3YXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKyApIHtcclxuICAgICAgdGhpcy5zdGVwKCBOT01JTkFMX1RJTUVfU1RFUCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBudW1iZXIgb2YgY2VsbHMgdGhhdCBzaG91bGQgYmUgdmlzaWJsZSB0byB0aGUgdXNlciBhbmQgdGhhdCBhcmUgaW5jbHVkZWQgaW4gdGhlIGNhbGN1bGF0aW9uIG9mIGF2ZXJhZ2VcclxuICAgKiBwcm90ZWluIGxldmVsLlxyXG4gICAqIEBwYXJhbSBudW1DZWxscyAtIHRhcmdldCBudW1iZXIgb2YgY2VsbHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldE51bVZpc2libGVDZWxscyggbnVtQ2VsbHMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1DZWxscyA+IDAgJiYgbnVtQ2VsbHMgPD0gTUFYX0NFTExTICk7ICAvLyBCb3VuZHMgY2hlY2tpbmcuXHJcblxyXG4gICAgaWYgKCB0aGlzLnZpc2libGVDZWxsTGlzdC5sZW5ndGggPCBudW1DZWxscyApIHtcclxuICAgICAgLy8gQWRkIGNlbGxzIHRvIHRoZSB2aXNpYmxlIGxpc3QuXHJcbiAgICAgIHdoaWxlICggdGhpcy52aXNpYmxlQ2VsbExpc3QubGVuZ3RoIDwgbnVtQ2VsbHMgKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbExpc3QuYWRkKCB0aGlzLmNlbGxMaXN0WyB0aGlzLnZpc2libGVDZWxsTGlzdC5sZW5ndGggXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy52aXNpYmxlQ2VsbExpc3QubGVuZ3RoID4gbnVtQ2VsbHMgKSB7XHJcbiAgICAgIC8vIFJlbW92ZSBjZWxscyBmcm9tIHRoZSB2aXNpYmxlIGxpc3QuICBUYWtlIHRoZW0gb2ZmIHRoZSBlbmQuXHJcbiAgICAgIHdoaWxlICggdGhpcy52aXNpYmxlQ2VsbExpc3QubGVuZ3RoID4gbnVtQ2VsbHMgKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbExpc3QucG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpbmQgYSBwb3NpdGlvbiBmb3IgdGhlIGdpdmVuIGNlbGwgdGhhdCBkb2Vzbid0IG92ZXJsYXAgd2l0aCBvdGhlciBjZWxscyBvbiB0aGUgbGlzdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcGxhY2VDZWxsSW5PcGVuUG9zaXRpb24oIGNlbGwgKSB7XHJcblxyXG4gICAgLy8gTG9vcCwgcmFuZG9tbHkgZ2VuZXJhdGluZyBwb3NpdGlvbnMgb2YgaW5jcmVhc2luZyBkaXN0YW5jZSBmcm9tIHRoZSBjZW50ZXIsIHVudGlsIHRoZSBjZWxsIGlzIHBvc2l0aW9uZWQgaW4gYVxyXG4gICAgLy8gcGxhY2UgdGhhdCBkb2VzIG5vdCBvdmVybGFwIHdpdGggdGhlIGV4aXN0aW5nIGNlbGxzLiBUaGUgb3ZlcmFsbCBib3VuZGluZyBzaGFwZSBvZiB0aGUgY29sbGVjdGlvbiBvZiBjZWxscyBpc1xyXG4gICAgLy8gZWxsaXB0aWNhbCwgbm90IGNpcmN1bGFyLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTWF0aC5jZWlsKCBNYXRoLnNxcnQoIHRoaXMuY2VsbExpc3QubGVuZ3RoICkgKTsgaSsrICkge1xyXG4gICAgICBjb25zdCByYWRpdXMgPSAoIGkgKyAxICkgKiBDZWxsLkRlZmF1bHRDZWxsU2l6ZS53aWR0aCAqICggdGhpcy5wb3NpdGlvblJhbmRvbWl6ZXIubmV4dERvdWJsZSgpIC8gMiArIDAuNzUgKTtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgcmFkaXVzICogTWF0aC5QSSAvICggQ2VsbC5EZWZhdWx0Q2VsbFNpemUuaGVpZ2h0ICogMiApOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgYW5nbGUgPSB0aGlzLnBvc2l0aW9uUmFuZG9taXplci5uZXh0RG91YmxlKCkgKiAyICogTWF0aC5QSTtcclxuICAgICAgICBjZWxsLnBvc2l0aW9uWCA9IHJhZGl1cyAqIE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgICAgIGNlbGwucG9zaXRpb25ZID0gcmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICk7XHJcbiAgICAgICAgaWYgKCAhYm91bmRzLmNvbnRhaW5zQ29vcmRpbmF0ZXMoIGNlbGwucG9zaXRpb25YLCBjZWxsLnBvc2l0aW9uWSApICkge1xyXG4gICAgICAgICAgLy8gTm90IGluIGJvdW5kcy5cclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb3ZlcmxhcERldGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5jZWxsTGlzdC5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGV4aXN0aW5nQ2VsbCA9IHRoaXMuY2VsbExpc3RbIGsgXTtcclxuICAgICAgICAgIC8vIG5ldyBib3VuZHNcclxuICAgICAgICAgIGlmICggY2VsbC5ib3VuZHMuc2hpZnRlZFhZKCBjZWxsLnBvc2l0aW9uWCwgY2VsbC5wb3NpdGlvblkgKVxyXG4gICAgICAgICAgICAuaW50ZXJzZWN0c0JvdW5kcyggZXhpc3RpbmdDZWxsLmJvdW5kcy5zaGlmdGVkWFkoIGV4aXN0aW5nQ2VsbC5wb3NpdGlvblgsIGV4aXN0aW5nQ2VsbC5wb3NpdGlvblkgKSApICkge1xyXG4gICAgICAgICAgICBvdmVybGFwRGV0ZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCAhb3ZlcmxhcERldGVjdGVkICkge1xyXG4gICAgICAgICAgLy8gRm91bmQgYW4gb3BlbiBzcG90LlxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdleGl0ZWQgcGxhY2VtZW50IGxvb3Agd2l0aG91dCBoYXZpbmcgZm91bmQgb3BlbiBwb3NpdGlvbicgKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuLy8gc3RhdGljc1xyXG5NdWx0aXBsZUNlbGxzTW9kZWwuTWF4Q2VsbHMgPSBNQVhfQ0VMTFM7XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdNdWx0aXBsZUNlbGxzTW9kZWwnLCBNdWx0aXBs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