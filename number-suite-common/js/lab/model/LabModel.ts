// Copyright 2019-2023, University of Colorado Boulder

/**
 * Model class for the 'Lab' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import TModel from '../../../../joist/js/TModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CountingArea from '../../common/model/CountingArea.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TenFrame from './TenFrame.js';

// constants
const HIGHEST_COUNT = 20;

class LabModel implements TModel {
  public readonly tenFrames: ObservableArray<TenFrame>;
  public readonly onesCountingArea: CountingArea;
  public readonly dogCountingArea: CountingArea;
  public readonly appleCountingArea: CountingArea;
  public readonly butterflyCountingArea: CountingArea;
  public readonly ballCountingArea: CountingArea;
  public readonly selectedTenFrameProperty: TProperty<TenFrame | null>;

  public constructor( tandem: Tandem ) {

    this.tenFrames = createObservableArray();
    this.selectedTenFrameProperty = new Property<TenFrame | null>( null );

    // create five different kinds of countingAreas
    this.dogCountingArea = new CountingArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ), {
        tenFrames: this.tenFrames
      } );
    this.appleCountingArea = new CountingArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ), {
        tenFrames: this.tenFrames
      } );
    this.butterflyCountingArea = new CountingArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ), {
        tenFrames: this.tenFrames
      } );
    this.ballCountingArea = new CountingArea(
      HIGHEST_COUNT,
      new BooleanProperty( false ), {
        tenFrames: this.tenFrames
      } );
    this.onesCountingArea = new CountingArea(
      HIGHEST_COUNT,
      new BooleanProperty( true ), {
        tenFrames: this.tenFrames
      } );

    this.tenFrames.addItemRemovedListener( tenFrame => {
      tenFrame.dispose();
    } );
  }

  /**
   * Called when the user drags a ten frame from a stack.
   */
  public dragTenFrameFromIcon( tenFrame: TenFrame ): void {
    this.tenFrames.push( tenFrame );
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    this.dogCountingArea.reset();
    this.appleCountingArea.reset();
    this.butterflyCountingArea.reset();
    this.ballCountingArea.reset();
    this.onesCountingArea.reset();
    this.tenFrames.clear();
  }
}

numberSuiteCommon.register( 'LabModel', LabModel );
export default LabModel;