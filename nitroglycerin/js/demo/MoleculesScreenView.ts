// Copyright 2022-2023, University of Colorado Boulder

/**
 * MoleculesScreenView demonstrates the various molecule nodes that live in nitroglycerin/js/nodes/.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView, { ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import WithOptional from '../../../phet-core/js/types/WithOptional.js';
import { GridBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import C2H2Node from '../nodes/C2H2Node.js';
import C2H4Node from '../nodes/C2H4Node.js';
import C2H5ClNode from '../nodes/C2H5ClNode.js';
import C2H5OHNode from '../nodes/C2H5OHNode.js';
import C2H6Node from '../nodes/C2H6Node.js';
import CH2ONode from '../nodes/CH2ONode.js';
import CH3OHNode from '../nodes/CH3OHNode.js';
import CH4Node from '../nodes/CH4Node.js';
import Cl2Node from '../nodes/Cl2Node.js';
import CNode from '../nodes/CNode.js';
import CO2Node from '../nodes/CO2Node.js';
import CONode from '../nodes/CONode.js';
import CS2Node from '../nodes/CS2Node.js';
import F2Node from '../nodes/F2Node.js';
import H2Node from '../nodes/H2Node.js';
import H2ONode from '../nodes/H2ONode.js';
import H2SNode from '../nodes/H2SNode.js';
import HClNode from '../nodes/HClNode.js';
import HFNode from '../nodes/HFNode.js';
import N2Node from '../nodes/N2Node.js';
import N2ONode from '../nodes/N2ONode.js';
import NH3Node from '../nodes/NH3Node.js';
import NO2Node from '../nodes/NO2Node.js';
import NONode from '../nodes/NONode.js';
import O2Node from '../nodes/O2Node.js';
import OF2Node from '../nodes/OF2Node.js';
import P4Node from '../nodes/P4Node.js';
import PCl3Node from '../nodes/PCl3Node.js';
import PCl5Node from '../nodes/PCl5Node.js';
import PF3Node from '../nodes/PF3Node.js';
import PH3Node from '../nodes/PH3Node.js';
import SNode from '../nodes/SNode.js';
import SO2Node from '../nodes/SO2Node.js';
import SO3Node from '../nodes/SO3Node.js';
import nitroglycerin from '../nitroglycerin.js';

type SelfOptions = EmptySelfOptions;
export type MoleculesScreenViewOptions = SelfOptions & WithOptional<StrictOmit<ScreenViewOptions, 'children'>, 'tandem'>;

export default class MoleculesScreenView extends ScreenView {

  public constructor( providedOptions?: MoleculesScreenViewOptions ) {

    super( optionize<MoleculesScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      tandem: Tandem.OPT_OUT
    }, providedOptions ) );

    const gridBox = new GridBox( {
      spacing: 20,
      rows: [
        [ new C2H2Node(), new C2H4Node(), new C2H5ClNode(), new C2H5OHNode(), new C2H6Node(), new CH2ONode() ],
        [ new CH3OHNode(), new CH4Node(), new Cl2Node(), new CNode(), new CO2Node(), new CONode() ],
        [ new CS2Node(), new F2Node(), new H2Node(), new H2ONode(), new H2SNode(), new HClNode() ],
        [ new HFNode(), new N2Node(), new N2ONode(), new NH3Node(), new NO2Node(), new NONode() ],
        [ new O2Node(), new OF2Node(), new P4Node(), new PCl3Node(), new PCl5Node(), new PF3Node() ],
        [ new PH3Node(), new SNode(), new SO2Node(), new SO3Node() ]
      ],
      center: this.layoutBounds.center,
      scale: 1.5
    } );

    this.children = [ gridBox ];
  }
}

nitroglycerin.register( 'MoleculesScreenView', MoleculesScreenView );