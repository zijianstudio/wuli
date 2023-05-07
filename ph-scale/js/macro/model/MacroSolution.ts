// Copyright 2022, University of Colorado Boulder

/**
 * MacroSolution is the solution model used in the Macro screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Solute from '../../common/model/Solute.js';
import Solution, { SolutionOptions } from '../../common/model/Solution.js';
import phScale from '../../phScale.js';

type SelfOptions = EmptySelfOptions;

type MacroSolutionOptions = SelfOptions & SolutionOptions;

export default class MacroSolution extends Solution {

  public constructor( soluteProperty: Property<Solute>, providedOptions: MacroSolutionOptions ) {
    super( soluteProperty, providedOptions );
  }
}

phScale.register( 'MacroSolution', MacroSolution );