// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for a panel that all types of creator nodes use for styling.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';

type SelfOptions = EmptySelfOptions;
export type NumberSuiteCommonPanelOptions = SelfOptions & Pick<PanelOptions, 'xMargin'>;

class NumberSuiteCommonPanel extends Panel {

  public constructor( content: Node, providedOptions?: NumberSuiteCommonPanelOptions ) {

    const options = optionize<NumberSuiteCommonPanelOptions, SelfOptions, PanelOptions>()( {
      stroke: 'rgb(201,203,203)',
      xMargin: 8,
      yMargin: 8
    }, providedOptions );

    super( content, options );
  }
}

numberSuiteCommon.register( 'NumberSuiteCommonPanel', NumberSuiteCommonPanel );
export default NumberSuiteCommonPanel;
