// Copyright 2014-2021, University of Colorado Boulder

/**
 * This class provides the interaction strength value between a number of
 * different pairs of atoms.  To do them all would be too much, so this is a
 * sparse table.  Feel free to fill them in as more are needed.
 *
 * The value provided by this table is generally designated as "epsilon" in
 * Lennard-Jones potential calculations.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import AtomType from './AtomType.js';

// constants
const DEFAULT_ADJUSTABLE_INTERACTION_POTENTIAL = SOMConstants.MAX_EPSILON / 2;

// static object (no constructor)
const InteractionStrengthTable = {
  /**
   * Get the interaction potential between two atoms.  Units are such that
   * the value divided by k-boltzmann is in Kelvin.  This is apparently how
   * it is generally done.  Note that this value is used as the "epsilon"
   * parameter in Lennard-Jones potential calculations.
   * @public
   * @param {AtomType} atomType1
   * @param {AtomType} atomType2
   * @returns {number}
   */
  getInteractionPotential: (atomType1, atomType2) => {
    if (atomType1 === atomType2) {
      // Heterogeneous pair of atoms.
      if (atomType1 === AtomType.NEON) {
        // Source: Hansen & McDouald, Theory of Simple Liquids, obtained from the web
        return 35.8;
      } else if (atomType1 === AtomType.ARGON) {
        // Source: F. Cuadros, I. Cachadina, and W. Ahamuda, Molc. Engineering, 6, 319 (1996), provided
        // in the original spec for the SOM simulation.
        return 111.84;
      } else if (atomType1 === AtomType.OXYGEN) {
        //  "Hollywooded" value to be larger than other values, but not really as big as bonded oxygen
        return 1000;
      } else if (atomType1 === AtomType.ADJUSTABLE) {
        return DEFAULT_ADJUSTABLE_INTERACTION_POTENTIAL;
      } else {
        assert && assert(false, `Interaction potential not available for requested atom: ${atomType1}`);
        return SOMConstants.MAX_EPSILON / 2; // In the real world, default to an arbitrary value.
      }
    } else {
      if (atomType1 === AtomType.NEON && atomType2 === AtomType.ARGON || atomType1 === AtomType.ARGON && atomType2 === AtomType.NEON) {
        // Source: Noah P, who got it from Robert Parsons.
        return 59.5;
      } else if (atomType1 === AtomType.NEON && atomType2 === AtomType.OXYGEN || atomType1 === AtomType.OXYGEN && atomType2 === AtomType.NEON) {
        // Source: Noah P, who got it from Robert Parsons.
        return 51;
      } else if (atomType1 === AtomType.ARGON && atomType2 === AtomType.OXYGEN || atomType1 === AtomType.OXYGEN && atomType2 === AtomType.ARGON) {
        // Source: Noah P, who got it from Robert Parsons.
        return 85;
      } else if (atomType1 === AtomType.ADJUSTABLE || atomType2 === AtomType.ADJUSTABLE) {
        // In this case, where one of the atoms is adjustable, we just use a default value.
        return (SOMConstants.MAX_EPSILON - SOMConstants.MIN_EPSILON) / 2;
      } else {
        assert && assert(false, 'Error: No data for this combination of molecules');
        return (SOMConstants.MAX_EPSILON - SOMConstants.MIN_EPSILON) / 2;
      }
    }
  }
};
statesOfMatter.register('InteractionStrengthTable', InteractionStrengthTable);
export default InteractionStrengthTable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGF0ZXNPZk1hdHRlciIsIlNPTUNvbnN0YW50cyIsIkF0b21UeXBlIiwiREVGQVVMVF9BREpVU1RBQkxFX0lOVEVSQUNUSU9OX1BPVEVOVElBTCIsIk1BWF9FUFNJTE9OIiwiSW50ZXJhY3Rpb25TdHJlbmd0aFRhYmxlIiwiZ2V0SW50ZXJhY3Rpb25Qb3RlbnRpYWwiLCJhdG9tVHlwZTEiLCJhdG9tVHlwZTIiLCJORU9OIiwiQVJHT04iLCJPWFlHRU4iLCJBREpVU1RBQkxFIiwiYXNzZXJ0IiwiTUlOX0VQU0lMT04iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludGVyYWN0aW9uU3RyZW5ndGhUYWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIHByb3ZpZGVzIHRoZSBpbnRlcmFjdGlvbiBzdHJlbmd0aCB2YWx1ZSBiZXR3ZWVuIGEgbnVtYmVyIG9mXHJcbiAqIGRpZmZlcmVudCBwYWlycyBvZiBhdG9tcy4gIFRvIGRvIHRoZW0gYWxsIHdvdWxkIGJlIHRvbyBtdWNoLCBzbyB0aGlzIGlzIGFcclxuICogc3BhcnNlIHRhYmxlLiAgRmVlbCBmcmVlIHRvIGZpbGwgdGhlbSBpbiBhcyBtb3JlIGFyZSBuZWVkZWQuXHJcbiAqXHJcbiAqIFRoZSB2YWx1ZSBwcm92aWRlZCBieSB0aGlzIHRhYmxlIGlzIGdlbmVyYWxseSBkZXNpZ25hdGVkIGFzIFwiZXBzaWxvblwiIGluXHJcbiAqIExlbm5hcmQtSm9uZXMgcG90ZW50aWFsIGNhbGN1bGF0aW9ucy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzXHJcbiAqIEBhdXRob3IgQ2hhbmRyYXNoZWthciBCZW1hZ29uaSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKi9cclxuXHJcbmltcG9ydCBzdGF0ZXNPZk1hdHRlciBmcm9tICcuLi8uLi9zdGF0ZXNPZk1hdHRlci5qcyc7XHJcbmltcG9ydCBTT01Db25zdGFudHMgZnJvbSAnLi4vU09NQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEF0b21UeXBlIGZyb20gJy4vQXRvbVR5cGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfQURKVVNUQUJMRV9JTlRFUkFDVElPTl9QT1RFTlRJQUwgPSBTT01Db25zdGFudHMuTUFYX0VQU0lMT04gLyAyO1xyXG5cclxuLy8gc3RhdGljIG9iamVjdCAobm8gY29uc3RydWN0b3IpXHJcbmNvbnN0IEludGVyYWN0aW9uU3RyZW5ndGhUYWJsZSA9IHtcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBpbnRlcmFjdGlvbiBwb3RlbnRpYWwgYmV0d2VlbiB0d28gYXRvbXMuICBVbml0cyBhcmUgc3VjaCB0aGF0XHJcbiAgICogdGhlIHZhbHVlIGRpdmlkZWQgYnkgay1ib2x0em1hbm4gaXMgaW4gS2VsdmluLiAgVGhpcyBpcyBhcHBhcmVudGx5IGhvd1xyXG4gICAqIGl0IGlzIGdlbmVyYWxseSBkb25lLiAgTm90ZSB0aGF0IHRoaXMgdmFsdWUgaXMgdXNlZCBhcyB0aGUgXCJlcHNpbG9uXCJcclxuICAgKiBwYXJhbWV0ZXIgaW4gTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgY2FsY3VsYXRpb25zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge0F0b21UeXBlfSBhdG9tVHlwZTFcclxuICAgKiBAcGFyYW0ge0F0b21UeXBlfSBhdG9tVHlwZTJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEludGVyYWN0aW9uUG90ZW50aWFsOiAoIGF0b21UeXBlMSwgYXRvbVR5cGUyICkgPT4ge1xyXG4gICAgaWYgKCBhdG9tVHlwZTEgPT09IGF0b21UeXBlMiApIHtcclxuICAgICAgLy8gSGV0ZXJvZ2VuZW91cyBwYWlyIG9mIGF0b21zLlxyXG4gICAgICBpZiAoIGF0b21UeXBlMSA9PT0gQXRvbVR5cGUuTkVPTiApIHtcclxuICAgICAgICAvLyBTb3VyY2U6IEhhbnNlbiAmIE1jRG91YWxkLCBUaGVvcnkgb2YgU2ltcGxlIExpcXVpZHMsIG9idGFpbmVkIGZyb20gdGhlIHdlYlxyXG4gICAgICAgIHJldHVybiAzNS44O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBhdG9tVHlwZTEgPT09IEF0b21UeXBlLkFSR09OICkge1xyXG4gICAgICAgIC8vIFNvdXJjZTogRi4gQ3VhZHJvcywgSS4gQ2FjaGFkaW5hLCBhbmQgVy4gQWhhbXVkYSwgTW9sYy4gRW5naW5lZXJpbmcsIDYsIDMxOSAoMTk5NiksIHByb3ZpZGVkXHJcbiAgICAgICAgLy8gaW4gdGhlIG9yaWdpbmFsIHNwZWMgZm9yIHRoZSBTT00gc2ltdWxhdGlvbi5cclxuICAgICAgICByZXR1cm4gMTExLjg0O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBhdG9tVHlwZTEgPT09IEF0b21UeXBlLk9YWUdFTiApIHtcclxuICAgICAgICAvLyAgXCJIb2xseXdvb2RlZFwiIHZhbHVlIHRvIGJlIGxhcmdlciB0aGFuIG90aGVyIHZhbHVlcywgYnV0IG5vdCByZWFsbHkgYXMgYmlnIGFzIGJvbmRlZCBveHlnZW5cclxuICAgICAgICByZXR1cm4gMTAwMDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggYXRvbVR5cGUxID09PSBBdG9tVHlwZS5BREpVU1RBQkxFICkge1xyXG4gICAgICAgIHJldHVybiBERUZBVUxUX0FESlVTVEFCTEVfSU5URVJBQ1RJT05fUE9URU5USUFMO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBgSW50ZXJhY3Rpb24gcG90ZW50aWFsIG5vdCBhdmFpbGFibGUgZm9yIHJlcXVlc3RlZCBhdG9tOiAke2F0b21UeXBlMX1gICk7XHJcbiAgICAgICAgcmV0dXJuIFNPTUNvbnN0YW50cy5NQVhfRVBTSUxPTiAvIDI7ICAvLyBJbiB0aGUgcmVhbCB3b3JsZCwgZGVmYXVsdCB0byBhbiBhcmJpdHJhcnkgdmFsdWUuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoICggKCBhdG9tVHlwZTEgPT09IEF0b21UeXBlLk5FT04gKSAmJiAoIGF0b21UeXBlMiA9PT0gQXRvbVR5cGUuQVJHT04gKSApIHx8XHJcbiAgICAgICAgICAgKCBhdG9tVHlwZTEgPT09IEF0b21UeXBlLkFSR09OICkgJiYgKCBhdG9tVHlwZTIgPT09IEF0b21UeXBlLk5FT04gKSApIHtcclxuICAgICAgICAvLyBTb3VyY2U6IE5vYWggUCwgd2hvIGdvdCBpdCBmcm9tIFJvYmVydCBQYXJzb25zLlxyXG4gICAgICAgIHJldHVybiA1OS41O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAoICggYXRvbVR5cGUxID09PSBBdG9tVHlwZS5ORU9OICkgJiYgKCBhdG9tVHlwZTIgPT09IEF0b21UeXBlLk9YWUdFTiApICkgfHxcclxuICAgICAgICAgICAgICAgICggYXRvbVR5cGUxID09PSBBdG9tVHlwZS5PWFlHRU4gKSAmJiAoIGF0b21UeXBlMiA9PT0gQXRvbVR5cGUuTkVPTiApICkge1xyXG4gICAgICAgIC8vIFNvdXJjZTogTm9haCBQLCB3aG8gZ290IGl0IGZyb20gUm9iZXJ0IFBhcnNvbnMuXHJcbiAgICAgICAgcmV0dXJuIDUxO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAoICggYXRvbVR5cGUxID09PSBBdG9tVHlwZS5BUkdPTiApICYmICggYXRvbVR5cGUyID09PSBBdG9tVHlwZS5PWFlHRU4gKSApIHx8XHJcbiAgICAgICAgICAgICAgICAoIGF0b21UeXBlMSA9PT0gQXRvbVR5cGUuT1hZR0VOICkgJiYgKCBhdG9tVHlwZTIgPT09IEF0b21UeXBlLkFSR09OICkgKSB7XHJcbiAgICAgICAgLy8gU291cmNlOiBOb2FoIFAsIHdobyBnb3QgaXQgZnJvbSBSb2JlcnQgUGFyc29ucy5cclxuICAgICAgICByZXR1cm4gODU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoICggYXRvbVR5cGUxID09PSBBdG9tVHlwZS5BREpVU1RBQkxFICkgfHwgKCBhdG9tVHlwZTIgPT09IEF0b21UeXBlLkFESlVTVEFCTEUgKSApIHtcclxuICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIHdoZXJlIG9uZSBvZiB0aGUgYXRvbXMgaXMgYWRqdXN0YWJsZSwgd2UganVzdCB1c2UgYSBkZWZhdWx0IHZhbHVlLlxyXG4gICAgICAgIHJldHVybiAoIFNPTUNvbnN0YW50cy5NQVhfRVBTSUxPTiAtIFNPTUNvbnN0YW50cy5NSU5fRVBTSUxPTiApIC8gMjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0Vycm9yOiBObyBkYXRhIGZvciB0aGlzIGNvbWJpbmF0aW9uIG9mIG1vbGVjdWxlcycgKTtcclxuICAgICAgICByZXR1cm4gKCBTT01Db25zdGFudHMuTUFYX0VQU0lMT04gLSBTT01Db25zdGFudHMuTUlOX0VQU0lMT04gKSAvIDI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5zdGF0ZXNPZk1hdHRlci5yZWdpc3RlciggJ0ludGVyYWN0aW9uU3RyZW5ndGhUYWJsZScsIEludGVyYWN0aW9uU3RyZW5ndGhUYWJsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgSW50ZXJhY3Rpb25TdHJlbmd0aFRhYmxlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxRQUFRLE1BQU0sZUFBZTs7QUFFcEM7QUFDQSxNQUFNQyx3Q0FBd0MsR0FBR0YsWUFBWSxDQUFDRyxXQUFXLEdBQUcsQ0FBQzs7QUFFN0U7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRztFQUUvQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyx1QkFBdUIsRUFBRUEsQ0FBRUMsU0FBUyxFQUFFQyxTQUFTLEtBQU07SUFDbkQsSUFBS0QsU0FBUyxLQUFLQyxTQUFTLEVBQUc7TUFDN0I7TUFDQSxJQUFLRCxTQUFTLEtBQUtMLFFBQVEsQ0FBQ08sSUFBSSxFQUFHO1FBQ2pDO1FBQ0EsT0FBTyxJQUFJO01BQ2IsQ0FBQyxNQUNJLElBQUtGLFNBQVMsS0FBS0wsUUFBUSxDQUFDUSxLQUFLLEVBQUc7UUFDdkM7UUFDQTtRQUNBLE9BQU8sTUFBTTtNQUNmLENBQUMsTUFDSSxJQUFLSCxTQUFTLEtBQUtMLFFBQVEsQ0FBQ1MsTUFBTSxFQUFHO1FBQ3hDO1FBQ0EsT0FBTyxJQUFJO01BQ2IsQ0FBQyxNQUNJLElBQUtKLFNBQVMsS0FBS0wsUUFBUSxDQUFDVSxVQUFVLEVBQUc7UUFDNUMsT0FBT1Qsd0NBQXdDO01BQ2pELENBQUMsTUFDSTtRQUNIVSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUcsMkRBQTBETixTQUFVLEVBQUUsQ0FBQztRQUNqRyxPQUFPTixZQUFZLENBQUNHLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBRTtNQUN4QztJQUNGLENBQUMsTUFDSTtNQUNILElBQVNHLFNBQVMsS0FBS0wsUUFBUSxDQUFDTyxJQUFJLElBQVFELFNBQVMsS0FBS04sUUFBUSxDQUFDUSxLQUFPLElBQ25FSCxTQUFTLEtBQUtMLFFBQVEsQ0FBQ1EsS0FBSyxJQUFRRixTQUFTLEtBQUtOLFFBQVEsQ0FBQ08sSUFBTSxFQUFHO1FBQ3pFO1FBQ0EsT0FBTyxJQUFJO01BQ2IsQ0FBQyxNQUNJLElBQVNGLFNBQVMsS0FBS0wsUUFBUSxDQUFDTyxJQUFJLElBQVFELFNBQVMsS0FBS04sUUFBUSxDQUFDUyxNQUFRLElBQ3BFSixTQUFTLEtBQUtMLFFBQVEsQ0FBQ1MsTUFBTSxJQUFRSCxTQUFTLEtBQUtOLFFBQVEsQ0FBQ08sSUFBTSxFQUFHO1FBQy9FO1FBQ0EsT0FBTyxFQUFFO01BQ1gsQ0FBQyxNQUNJLElBQVNGLFNBQVMsS0FBS0wsUUFBUSxDQUFDUSxLQUFLLElBQVFGLFNBQVMsS0FBS04sUUFBUSxDQUFDUyxNQUFRLElBQ3JFSixTQUFTLEtBQUtMLFFBQVEsQ0FBQ1MsTUFBTSxJQUFRSCxTQUFTLEtBQUtOLFFBQVEsQ0FBQ1EsS0FBTyxFQUFHO1FBQ2hGO1FBQ0EsT0FBTyxFQUFFO01BQ1gsQ0FBQyxNQUNJLElBQU9ILFNBQVMsS0FBS0wsUUFBUSxDQUFDVSxVQUFVLElBQVFKLFNBQVMsS0FBS04sUUFBUSxDQUFDVSxVQUFZLEVBQUc7UUFDekY7UUFDQSxPQUFPLENBQUVYLFlBQVksQ0FBQ0csV0FBVyxHQUFHSCxZQUFZLENBQUNhLFdBQVcsSUFBSyxDQUFDO01BQ3BFLENBQUMsTUFDSTtRQUNIRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsa0RBQW1ELENBQUM7UUFDN0UsT0FBTyxDQUFFWixZQUFZLENBQUNHLFdBQVcsR0FBR0gsWUFBWSxDQUFDYSxXQUFXLElBQUssQ0FBQztNQUNwRTtJQUNGO0VBQ0Y7QUFDRixDQUFDO0FBRURkLGNBQWMsQ0FBQ2UsUUFBUSxDQUFFLDBCQUEwQixFQUFFVix3QkFBeUIsQ0FBQztBQUUvRSxlQUFlQSx3QkFBd0IifQ==