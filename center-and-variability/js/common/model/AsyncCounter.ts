// Copyright 2022-2023, University of Colorado Boulder

/**
 * Fire a final event when all child events have completed.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
import centerAndVariability from '../../centerAndVariability.js';

export default class AsyncCounter {
  private index: number;
  private complete: boolean;
  private readonly count: number;
  private readonly callback: () => void;

  public constructor( count: number, callback: () => void ) {
    this.index = 0;
    this.complete = false;
    this.count = count;
    this.callback = callback;
  }

  public increment(): void {
    this.index++;

    if ( this.index >= this.count ) {
      assert && assert( !this.complete, 'Too many completions' );

      this.complete = true;
      this.callback();
    }
  }
}

centerAndVariability.register( 'AsyncCounter', AsyncCounter );