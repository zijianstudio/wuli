// Copyright 2020-2022, University of Colorado Boulder

/**
 * MicroSolution is the solution model used in the Micro screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Solute from '../../common/model/Solute.js';
import SolutionDerivedProperties from '../../common/model/SolutionDerivedProperties.js';
import Solution, { SolutionOptions } from '../../common/model/Solution.js';
import phScale from '../../phScale.js';

type SelfOptions = EmptySelfOptions;

type MicroSolutionOptions = SelfOptions & SolutionOptions;

export default class MicroSolution extends Solution {

  public readonly derivedProperties: SolutionDerivedProperties;

  public constructor( soluteProperty: Property<Solute>, providedOptions: MicroSolutionOptions ) {

    super( soluteProperty, providedOptions );

    this.derivedProperties = new SolutionDerivedProperties( this.pHProperty, this.totalVolumeProperty, {

      // Properties created by SolutionDerivedProperties should appear as if they are children of MicroSolution.
      tandem: providedOptions.tandem
    } );
  }
}

phScale.register( 'MicroSolution', MicroSolution );