// Copyright 2014-2023, University of Colorado Boulder

/**
 * Factory functions for creating specific chemical reactions.
 *
 * Note that the function names all have a specific format.
 * For example, the function for creating reaction '2C + O2 -> 2CO' is named Reaction_2C_O2__2CO.
 * Underscore is substituted for '+'.
 * Double underscore is substituted for '->'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import C2H2Node from '../../../../nitroglycerin/js/nodes/C2H2Node.js';
import C2H4Node from '../../../../nitroglycerin/js/nodes/C2H4Node.js';
import C2H5ClNode from '../../../../nitroglycerin/js/nodes/C2H5ClNode.js';
import C2H5OHNode from '../../../../nitroglycerin/js/nodes/C2H5OHNode.js';
import C2H6Node from '../../../../nitroglycerin/js/nodes/C2H6Node.js';
import CH2ONode from '../../../../nitroglycerin/js/nodes/CH2ONode.js';
import CH3OHNode from '../../../../nitroglycerin/js/nodes/CH3OHNode.js';
import CH4Node from '../../../../nitroglycerin/js/nodes/CH4Node.js';
import Cl2Node from '../../../../nitroglycerin/js/nodes/Cl2Node.js';
import CNode from '../../../../nitroglycerin/js/nodes/CNode.js';
import CO2Node from '../../../../nitroglycerin/js/nodes/CO2Node.js';
import CONode from '../../../../nitroglycerin/js/nodes/CONode.js';
import CS2Node from '../../../../nitroglycerin/js/nodes/CS2Node.js';
import F2Node from '../../../../nitroglycerin/js/nodes/F2Node.js';
import H2Node from '../../../../nitroglycerin/js/nodes/H2Node.js';
import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import H2SNode from '../../../../nitroglycerin/js/nodes/H2SNode.js';
import HClNode from '../../../../nitroglycerin/js/nodes/HClNode.js';
import HFNode from '../../../../nitroglycerin/js/nodes/HFNode.js';
import N2Node from '../../../../nitroglycerin/js/nodes/N2Node.js';
import N2ONode from '../../../../nitroglycerin/js/nodes/N2ONode.js';
import NH3Node from '../../../../nitroglycerin/js/nodes/NH3Node.js';
import NO2Node from '../../../../nitroglycerin/js/nodes/NO2Node.js';
import NONode from '../../../../nitroglycerin/js/nodes/NONode.js';
import O2Node from '../../../../nitroglycerin/js/nodes/O2Node.js';
import OF2Node from '../../../../nitroglycerin/js/nodes/OF2Node.js';
import P4Node from '../../../../nitroglycerin/js/nodes/P4Node.js';
import PCl3Node from '../../../../nitroglycerin/js/nodes/PCl3Node.js';
import PCl5Node from '../../../../nitroglycerin/js/nodes/PCl5Node.js';
import PF3Node from '../../../../nitroglycerin/js/nodes/PF3Node.js';
import PH3Node from '../../../../nitroglycerin/js/nodes/PH3Node.js';
import SNode from '../../../../nitroglycerin/js/nodes/SNode.js';
import SO2Node from '../../../../nitroglycerin/js/nodes/SO2Node.js';
import SO3Node from '../../../../nitroglycerin/js/nodes/SO3Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import RPALConstants from '../RPALConstants.js';
import RPALSymbols from '../RPALSymbols.js';
import Reaction from './Reaction.js';
import Substance from './Substance.js';

const MOLECULE_NODE_OPTIONS = RPALConstants.MOLECULE_NODE_OPTIONS; // to improve readability

const ReactionFactory = {

  //---------------------------------------------------------------------------------------
  // Single-product reactions
  //---------------------------------------------------------------------------------------

  // 2H2 + O2 -> 2H2O (Make Water)
  makeWater( tandem = Tandem.OPT_OUT ): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      {
        nameProperty: ReactantsProductsAndLeftoversStrings.makeWaterStringProperty,
        tandem: tandem
      } );
  },

  // N2 + 3H2 -> 2NH3 (Make Ammonia)
  makeAmmonia( tandem = Tandem.OPT_OUT ): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.N2, new N2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.NH3, new NH3Node( MOLECULE_NODE_OPTIONS ) ) ],
      {
        nameProperty: ReactantsProductsAndLeftoversStrings.makeAmmoniaStringProperty,
        tandem: tandem
      } );
  },

  // H2 + F2 -> 2HF
  Reaction_H2_F2__2HF(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.F2, new F2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.HF, new HFNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // H2 + Cl2 -> 2HCl
  Reaction_H2_Cl2__2HCl(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.Cl2, new Cl2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.HCl, new HClNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // CO + 2H2 -> CH3OH
  Reaction_CO_2H2__CH3OH(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CO, new CONode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CH3OH, new CH3OHNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // CH2O + H2 -> CH3OH
  Reaction_CH2O_H2__CH3OH(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CH2O, new CH2ONode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CH3OH, new CH3OHNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C2H4 + H2 -> C2H6
  Reaction_C2H4_H2__C2H6(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C2H4, new C2H4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.C2H6, new C2H6Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C2H2 + 2H2 -> C2H6
  Reaction_C2H2_2H2__C2H6(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C2H2, new C2H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.C2H6, new C2H6Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C + O2 -> CO2
  Reaction_C_O2__CO2(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C, new CNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2C + O2 -> 2CO
  Reaction_2C_O2__2CO(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.C, new CNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.CO, new CONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2CO + O2 -> 2CO2
  Reaction_2CO_O2__2CO2(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.CO, new CONode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C + CO2 -> 2CO
  Reaction_C_CO2__2CO(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C, new CNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.CO, new CONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C + 2S -> CS2
  Reaction_C_2S__CS2(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C, new CNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.S, new SNode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CS2, new CS2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // N2 + O2 -> 2NO
  Reaction_N2_O2__2NO(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.N2, new N2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.NO, new NONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2NO + O2 -> 2NO2
  Reaction_2NO_O2__2NO2(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.NO, new NONode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.NO2, new NO2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2N2 + O2 -> 2N2O
  Reaction_2N2_O2__2N2O(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.N2, new N2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.N2O, new N2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // P4 + 6H2 -> 4PH3
  Reaction_P4_6H2__4PH3(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.P4, new P4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.PH3, new PH3Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // P4 + 6F2 -> 4PF3
  Reaction_P4_6F2__4PF3(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.P4, new P4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.F2, new F2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.PF3, new PF3Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // P4 + 6Cl2 -> 4PCl3
  Reaction_P4_6Cl2__4PCl3(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.P4, new P4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.Cl2, new Cl2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.PCl3, new PCl3Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // PCl3 + Cl2 -> PCl5
  Reaction_PCl3_Cl2__PCl5(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.PCl3, new PCl3Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.Cl2, new Cl2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.PCl5, new PCl5Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2SO2 + O2 -> 2SO3
  Reaction_2SO2_O2__2SO3(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.SO2, new SO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.SO3, new SO3Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  //---------------------------------------------------------------------------------------
  // Two-product reactions
  //---------------------------------------------------------------------------------------

  // CH4 + 2 O2 -> CO2 + 2 H2O (Combust Methane)
  combustMethane( tandem = Tandem.OPT_OUT ): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CH4, new CH4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      {
        nameProperty: ReactantsProductsAndLeftoversStrings.combustMethaneStringProperty,
        tandem: tandem
      } );
  },

  // 2C + 2H2O -> CH4 + CO2
  Reaction_2C_2H2O__CH4_CO2(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.C, new CNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CH4, new CH4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // CH4 + H2O -> 3H2 + CO
  Reaction_CH4_H2O__3H2_CO(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CH4, new CH4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 3, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.CO, new CONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2C2H6 + 7O2 -> 4CO2 + 6H2O
  Reaction_2C2H6_7O2__4CO2_6H2O(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.C2H6, new C2H6Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 7, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C2H4 + 3O2 -> 2CO2 + 2H2O
  Reaction_C2H4_3O2__2CO2_2H2O(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C2H4, new C2H4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2C2H2 + 5O2 -> 4CO2 + 2H2O
  Reaction_2C2H2_5O2__4CO2_2H2O(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.C2H2, new C2H2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 5, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C2H5OH + 3O2 -> 2CO2 + 3H2O
  Reaction_C2H5OH_3O2__2CO2_3H2O(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C2H5OH, new C2H5OHNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // C2H6 + Cl2 -> C2H5Cl + HCl
  Reaction_C2H6_Cl2__C2H5Cl_HCl(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.C2H6, new C2H6Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.Cl2, new Cl2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.C2H5Cl, new C2H5ClNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.HCl, new HClNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // CH4 + 4S -> CS2 + 2H2S
  Reaction_CH4_4S__CS2_2H2S(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CH4, new CH4Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 4, RPALSymbols.S, new SNode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CS2, new CS2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2S, new H2SNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // CS2 + 3O2 -> CO2 + 2SO2
  Reaction_CS2_3O2__CO2_2SO2(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.CS2, new CS2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.CO2, new CO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.SO2, new SO2Node( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 4NH3 + 3O2 -> 2N2 + 6H2O
  Reaction_4NH3_3O2__2N2_6H2O(): Reaction {
    return new Reaction(
      [ new Substance( 4, RPALSymbols.NH3, new NH3Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 2, RPALSymbols.N2, new N2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 4NH3 + 5O2 -> 4NO + 6H2O
  Reaction_4NH3_5O2__4NO_6H2O(): Reaction {
    return new Reaction(
      [ new Substance( 4, RPALSymbols.NH3, new NH3Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 5, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.NO, new NONode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 4NH3 + 7O2 -> 4NO2 + 6H2O
  Reaction_4NH3_7O2__4NO2_6H2O(): Reaction {
    return new Reaction(
      [ new Substance( 4, RPALSymbols.NH3, new NH3Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 7, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 4, RPALSymbols.NO2, new NO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 4NH3 + 6NO -> 5N2 + 6H2O
  Reaction_4NH3_6NO__5N2_6H2O(): Reaction {
    return new Reaction(
      [ new Substance( 4, RPALSymbols.NH3, new NH3Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.NO, new NONode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 5, RPALSymbols.N2, new N2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 6, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // SO2 + 2H2 -> S + 2H2O
  Reaction_SO2_2H2__S_2H2O(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.SO2, new SO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.S, new SNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // SO2 + 3H2 -> H2S + 2H2O
  Reaction_SO2_3H2__H2S_2H2O(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.SO2, new SO2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 3, RPALSymbols.H2, new H2Node( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.H2S, new H2SNode( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // 2F2 + H2O -> OF2 + 2HF
  Reaction_2F2_H2O__OF2_2HF(): Reaction {
    return new Reaction(
      [ new Substance( 2, RPALSymbols.F2, new F2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.OF2, new OF2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.HF, new HFNode( MOLECULE_NODE_OPTIONS ) ) ] );
  },

  // OF2 + H2O -> O2 + 2HF
  Reaction_OF2_H2O__O2_2HF(): Reaction {
    return new Reaction(
      [ new Substance( 1, RPALSymbols.OF2, new OF2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 1, RPALSymbols.H2O, new H2ONode( MOLECULE_NODE_OPTIONS ) ) ],
      [ new Substance( 1, RPALSymbols.O2, new O2Node( MOLECULE_NODE_OPTIONS ) ),
        new Substance( 2, RPALSymbols.HF, new HFNode( MOLECULE_NODE_OPTIONS ) ) ] );
  }
};

reactantsProductsAndLeftovers.register( 'ReactionFactory', ReactionFactory );
export default ReactionFactory;