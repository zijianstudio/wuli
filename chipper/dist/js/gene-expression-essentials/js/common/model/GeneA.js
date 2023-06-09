// Copyright 2015-2021, University of Colorado Boulder

/**
 * Specific instance of a gene.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import Range from '../../../../dot/js/Range.js';
import { Color } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import ProteinA from '../../manual-gene-expression/model/ProteinA.js';
import Gene from './Gene.js';
import TranscriptionFactor from './TranscriptionFactor.js';

// constants
const REGULATORY_REGION_COLOR = new Color(216, 191, 216);
const TRANSCRIBED_REGION_COLOR = new Color(255, 165, 79, 150);
const NUM_BASE_PAIRS_IN_REGULATORY_REGION = 16;
const NUM_BASE_PAIRS_IN_TRANSCRIBED_REGION = 100;
const MRNA_WINDING_ALGORITHM_NUMBER = 4;
class GeneA extends Gene {
  /**
   * Constructor.
   *
   * @param {DnaMolecule} dnaMolecule - The DNA molecule within which this gene exists.
   * @param {number} initialBasePair - Position on the DNA strand where this gene starts.
   */
  constructor(dnaMolecule, initialBasePair) {
    super(dnaMolecule, new Range(initialBasePair, initialBasePair + NUM_BASE_PAIRS_IN_REGULATORY_REGION), REGULATORY_REGION_COLOR, new Range(initialBasePair + NUM_BASE_PAIRS_IN_REGULATORY_REGION + 1, initialBasePair + NUM_BASE_PAIRS_IN_REGULATORY_REGION + 1 + NUM_BASE_PAIRS_IN_TRANSCRIBED_REGION), TRANSCRIBED_REGION_COLOR, MRNA_WINDING_ALGORITHM_NUMBER);

    // Add transcription factors that are specific to this gene. Position is withing the regulatory region, and the
    // negative factor should overlap, and thus block, the positive factor(s).
    this.addTranscriptionFactorPosition(5, TranscriptionFactor.TRANSCRIPTION_FACTOR_CONFIG_GENE_1_POS);
    this.addTranscriptionFactorPosition(2, TranscriptionFactor.TRANSCRIPTION_FACTOR_CONFIG_GENE_1_NEG);
  }

  /**
   * @override
   * @returns {ProteinA}
   * @public
   */
  getProteinPrototype() {
    return new ProteinA();
  }
}
GeneA.NUM_BASE_PAIRS = NUM_BASE_PAIRS_IN_REGULATORY_REGION + NUM_BASE_PAIRS_IN_TRANSCRIBED_REGION;
geneExpressionEssentials.register('GeneA', GeneA);
export default GeneA;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIkNvbG9yIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiUHJvdGVpbkEiLCJHZW5lIiwiVHJhbnNjcmlwdGlvbkZhY3RvciIsIlJFR1VMQVRPUllfUkVHSU9OX0NPTE9SIiwiVFJBTlNDUklCRURfUkVHSU9OX0NPTE9SIiwiTlVNX0JBU0VfUEFJUlNfSU5fUkVHVUxBVE9SWV9SRUdJT04iLCJOVU1fQkFTRV9QQUlSU19JTl9UUkFOU0NSSUJFRF9SRUdJT04iLCJNUk5BX1dJTkRJTkdfQUxHT1JJVEhNX05VTUJFUiIsIkdlbmVBIiwiY29uc3RydWN0b3IiLCJkbmFNb2xlY3VsZSIsImluaXRpYWxCYXNlUGFpciIsImFkZFRyYW5zY3JpcHRpb25GYWN0b3JQb3NpdGlvbiIsIlRSQU5TQ1JJUFRJT05fRkFDVE9SX0NPTkZJR19HRU5FXzFfUE9TIiwiVFJBTlNDUklQVElPTl9GQUNUT1JfQ09ORklHX0dFTkVfMV9ORUciLCJnZXRQcm90ZWluUHJvdG90eXBlIiwiTlVNX0JBU0VfUEFJUlMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdlbmVBLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNwZWNpZmljIGluc3RhbmNlIG9mIGEgZ2VuZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IFByb3RlaW5BIGZyb20gJy4uLy4uL21hbnVhbC1nZW5lLWV4cHJlc3Npb24vbW9kZWwvUHJvdGVpbkEuanMnO1xyXG5pbXBvcnQgR2VuZSBmcm9tICcuL0dlbmUuanMnO1xyXG5pbXBvcnQgVHJhbnNjcmlwdGlvbkZhY3RvciBmcm9tICcuL1RyYW5zY3JpcHRpb25GYWN0b3IuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFJFR1VMQVRPUllfUkVHSU9OX0NPTE9SID0gbmV3IENvbG9yKCAyMTYsIDE5MSwgMjE2ICk7XHJcbmNvbnN0IFRSQU5TQ1JJQkVEX1JFR0lPTl9DT0xPUiA9IG5ldyBDb2xvciggMjU1LCAxNjUsIDc5LCAxNTAgKTtcclxuY29uc3QgTlVNX0JBU0VfUEFJUlNfSU5fUkVHVUxBVE9SWV9SRUdJT04gPSAxNjtcclxuY29uc3QgTlVNX0JBU0VfUEFJUlNfSU5fVFJBTlNDUklCRURfUkVHSU9OID0gMTAwO1xyXG5jb25zdCBNUk5BX1dJTkRJTkdfQUxHT1JJVEhNX05VTUJFUiA9IDQ7XHJcblxyXG5jbGFzcyBHZW5lQSBleHRlbmRzIEdlbmUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3Rvci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RG5hTW9sZWN1bGV9IGRuYU1vbGVjdWxlIC0gVGhlIEROQSBtb2xlY3VsZSB3aXRoaW4gd2hpY2ggdGhpcyBnZW5lIGV4aXN0cy5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbEJhc2VQYWlyIC0gUG9zaXRpb24gb24gdGhlIEROQSBzdHJhbmQgd2hlcmUgdGhpcyBnZW5lIHN0YXJ0cy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZG5hTW9sZWN1bGUsIGluaXRpYWxCYXNlUGFpciApIHtcclxuICAgIHN1cGVyKCBkbmFNb2xlY3VsZSxcclxuICAgICAgbmV3IFJhbmdlKCBpbml0aWFsQmFzZVBhaXIsIGluaXRpYWxCYXNlUGFpciArIE5VTV9CQVNFX1BBSVJTX0lOX1JFR1VMQVRPUllfUkVHSU9OICksXHJcbiAgICAgIFJFR1VMQVRPUllfUkVHSU9OX0NPTE9SLFxyXG4gICAgICBuZXcgUmFuZ2UoXHJcbiAgICAgICAgaW5pdGlhbEJhc2VQYWlyICsgTlVNX0JBU0VfUEFJUlNfSU5fUkVHVUxBVE9SWV9SRUdJT04gKyAxLFxyXG4gICAgICAgIGluaXRpYWxCYXNlUGFpciArIE5VTV9CQVNFX1BBSVJTX0lOX1JFR1VMQVRPUllfUkVHSU9OICsgMSArIE5VTV9CQVNFX1BBSVJTX0lOX1RSQU5TQ1JJQkVEX1JFR0lPTlxyXG4gICAgICApLFxyXG4gICAgICBUUkFOU0NSSUJFRF9SRUdJT05fQ09MT1IsXHJcbiAgICAgIE1STkFfV0lORElOR19BTEdPUklUSE1fTlVNQkVSXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEFkZCB0cmFuc2NyaXB0aW9uIGZhY3RvcnMgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhpcyBnZW5lLiBQb3NpdGlvbiBpcyB3aXRoaW5nIHRoZSByZWd1bGF0b3J5IHJlZ2lvbiwgYW5kIHRoZVxyXG4gICAgLy8gbmVnYXRpdmUgZmFjdG9yIHNob3VsZCBvdmVybGFwLCBhbmQgdGh1cyBibG9jaywgdGhlIHBvc2l0aXZlIGZhY3RvcihzKS5cclxuICAgIHRoaXMuYWRkVHJhbnNjcmlwdGlvbkZhY3RvclBvc2l0aW9uKCA1LCBUcmFuc2NyaXB0aW9uRmFjdG9yLlRSQU5TQ1JJUFRJT05fRkFDVE9SX0NPTkZJR19HRU5FXzFfUE9TICk7XHJcbiAgICB0aGlzLmFkZFRyYW5zY3JpcHRpb25GYWN0b3JQb3NpdGlvbiggMiwgVHJhbnNjcmlwdGlvbkZhY3Rvci5UUkFOU0NSSVBUSU9OX0ZBQ1RPUl9DT05GSUdfR0VORV8xX05FRyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHJldHVybnMge1Byb3RlaW5BfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQcm90ZWluUHJvdG90eXBlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm90ZWluQSgpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbkdlbmVBLk5VTV9CQVNFX1BBSVJTID0gTlVNX0JBU0VfUEFJUlNfSU5fUkVHVUxBVE9SWV9SRUdJT04gKyBOVU1fQkFTRV9QQUlSU19JTl9UUkFOU0NSSUJFRF9SRUdJT047XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdHZW5lQScsIEdlbmVBICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHZW5lQTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLFFBQVEsTUFBTSxnREFBZ0Q7QUFDckUsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCOztBQUUxRDtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLElBQUlMLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztBQUMxRCxNQUFNTSx3QkFBd0IsR0FBRyxJQUFJTixLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBSSxDQUFDO0FBQy9ELE1BQU1PLG1DQUFtQyxHQUFHLEVBQUU7QUFDOUMsTUFBTUMsb0NBQW9DLEdBQUcsR0FBRztBQUNoRCxNQUFNQyw2QkFBNkIsR0FBRyxDQUFDO0FBRXZDLE1BQU1DLEtBQUssU0FBU1AsSUFBSSxDQUFDO0VBRXZCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLGVBQWUsRUFBRztJQUMxQyxLQUFLLENBQUVELFdBQVcsRUFDaEIsSUFBSWIsS0FBSyxDQUFFYyxlQUFlLEVBQUVBLGVBQWUsR0FBR04sbUNBQW9DLENBQUMsRUFDbkZGLHVCQUF1QixFQUN2QixJQUFJTixLQUFLLENBQ1BjLGVBQWUsR0FBR04sbUNBQW1DLEdBQUcsQ0FBQyxFQUN6RE0sZUFBZSxHQUFHTixtQ0FBbUMsR0FBRyxDQUFDLEdBQUdDLG9DQUM5RCxDQUFDLEVBQ0RGLHdCQUF3QixFQUN4QkcsNkJBQ0YsQ0FBQzs7SUFFRDtJQUNBO0lBQ0EsSUFBSSxDQUFDSyw4QkFBOEIsQ0FBRSxDQUFDLEVBQUVWLG1CQUFtQixDQUFDVyxzQ0FBdUMsQ0FBQztJQUNwRyxJQUFJLENBQUNELDhCQUE4QixDQUFFLENBQUMsRUFBRVYsbUJBQW1CLENBQUNZLHNDQUF1QyxDQUFDO0VBQ3RHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsbUJBQW1CQSxDQUFBLEVBQUc7SUFDcEIsT0FBTyxJQUFJZixRQUFRLENBQUMsQ0FBQztFQUN2QjtBQUVGO0FBRUFRLEtBQUssQ0FBQ1EsY0FBYyxHQUFHWCxtQ0FBbUMsR0FBR0Msb0NBQW9DO0FBRWpHUCx3QkFBd0IsQ0FBQ2tCLFFBQVEsQ0FBRSxPQUFPLEVBQUVULEtBQU0sQ0FBQztBQUVuRCxlQUFlQSxLQUFLIn0=