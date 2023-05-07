// Copyright 2016-2021, University of Colorado Boulder

/**
 * Model for the Rutherford Atom space, responsible for atoms of the model.
 *
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import AtomSpace from '../../common/model/AtomSpace.js';
import rutherfordScattering from '../../rutherfordScattering.js';
import RutherfordAtom from './RutherfordAtom.js';

// constants
const DEFLECTION_WIDTH = 30;
class RutherfordAtomSpace extends AtomSpace {
  /**
   * @param {Property.<number>} protonCountProperty
   * @param {Bounds2} bounds
   */
  constructor(protonCountProperty, bounds) {
    super(protonCountProperty, bounds, {
      atomWidth: DEFLECTION_WIDTH
    });

    // factor out for readability
    const atomWidth = this.bounds.width / 2; // bounds of the entire atom, including electron radii
    const halfAtomWidth = atomWidth / 2;

    // create the atoms
    const atom1 = new RutherfordAtom(this.particleRemovedFromAtomEmitter, protonCountProperty, new Vector2(-halfAtomWidth, +halfAtomWidth), DEFLECTION_WIDTH);
    const atom2 = new RutherfordAtom(this.particleRemovedFromAtomEmitter, protonCountProperty, new Vector2(+halfAtomWidth, +halfAtomWidth), DEFLECTION_WIDTH);
    const atom3 = new RutherfordAtom(this.particleRemovedFromAtomEmitter, protonCountProperty, new Vector2(0, -halfAtomWidth), DEFLECTION_WIDTH);
    const atom4 = new RutherfordAtom(this.particleRemovedFromAtomEmitter, protonCountProperty, new Vector2(-atomWidth, -halfAtomWidth), DEFLECTION_WIDTH);
    const atom5 = new RutherfordAtom(this.particleRemovedFromAtomEmitter, protonCountProperty, new Vector2(atomWidth, -halfAtomWidth), DEFLECTION_WIDTH);
    this.atoms.push(atom1, atom2, atom3, atom4, atom5);

    // make sure that atom bounds do not overlap
    this.checkAtomBounds();
  }
}
rutherfordScattering.register('RutherfordAtomSpace', RutherfordAtomSpace);
export default RutherfordAtomSpace;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiQXRvbVNwYWNlIiwicnV0aGVyZm9yZFNjYXR0ZXJpbmciLCJSdXRoZXJmb3JkQXRvbSIsIkRFRkxFQ1RJT05fV0lEVEgiLCJSdXRoZXJmb3JkQXRvbVNwYWNlIiwiY29uc3RydWN0b3IiLCJwcm90b25Db3VudFByb3BlcnR5IiwiYm91bmRzIiwiYXRvbVdpZHRoIiwid2lkdGgiLCJoYWxmQXRvbVdpZHRoIiwiYXRvbTEiLCJwYXJ0aWNsZVJlbW92ZWRGcm9tQXRvbUVtaXR0ZXIiLCJhdG9tMiIsImF0b20zIiwiYXRvbTQiLCJhdG9tNSIsImF0b21zIiwicHVzaCIsImNoZWNrQXRvbUJvdW5kcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUnV0aGVyZm9yZEF0b21TcGFjZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlIFJ1dGhlcmZvcmQgQXRvbSBzcGFjZSwgcmVzcG9uc2libGUgZm9yIGF0b21zIG9mIHRoZSBtb2RlbC5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBBdG9tU3BhY2UgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0F0b21TcGFjZS5qcyc7XHJcbmltcG9ydCBydXRoZXJmb3JkU2NhdHRlcmluZyBmcm9tICcuLi8uLi9ydXRoZXJmb3JkU2NhdHRlcmluZy5qcyc7XHJcbmltcG9ydCBSdXRoZXJmb3JkQXRvbSBmcm9tICcuL1J1dGhlcmZvcmRBdG9tLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZMRUNUSU9OX1dJRFRIID0gMzA7XHJcblxyXG5jbGFzcyBSdXRoZXJmb3JkQXRvbVNwYWNlIGV4dGVuZHMgQXRvbVNwYWNlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gcHJvdG9uQ291bnRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gYm91bmRzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHByb3RvbkNvdW50UHJvcGVydHksIGJvdW5kcyApIHtcclxuXHJcbiAgICBzdXBlciggcHJvdG9uQ291bnRQcm9wZXJ0eSwgYm91bmRzLCB7XHJcbiAgICAgIGF0b21XaWR0aDogREVGTEVDVElPTl9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGZhY3RvciBvdXQgZm9yIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBhdG9tV2lkdGggPSB0aGlzLmJvdW5kcy53aWR0aCAvIDI7IC8vIGJvdW5kcyBvZiB0aGUgZW50aXJlIGF0b20sIGluY2x1ZGluZyBlbGVjdHJvbiByYWRpaVxyXG4gICAgY29uc3QgaGFsZkF0b21XaWR0aCA9IGF0b21XaWR0aCAvIDI7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBhdG9tc1xyXG4gICAgY29uc3QgYXRvbTEgPSBuZXcgUnV0aGVyZm9yZEF0b20oIHRoaXMucGFydGljbGVSZW1vdmVkRnJvbUF0b21FbWl0dGVyLCBwcm90b25Db3VudFByb3BlcnR5LCBuZXcgVmVjdG9yMiggLWhhbGZBdG9tV2lkdGgsICtoYWxmQXRvbVdpZHRoICksIERFRkxFQ1RJT05fV0lEVEggKTtcclxuICAgIGNvbnN0IGF0b20yID0gbmV3IFJ1dGhlcmZvcmRBdG9tKCB0aGlzLnBhcnRpY2xlUmVtb3ZlZEZyb21BdG9tRW1pdHRlciwgcHJvdG9uQ291bnRQcm9wZXJ0eSwgbmV3IFZlY3RvcjIoICtoYWxmQXRvbVdpZHRoLCAraGFsZkF0b21XaWR0aCApLCBERUZMRUNUSU9OX1dJRFRIICk7XHJcbiAgICBjb25zdCBhdG9tMyA9IG5ldyBSdXRoZXJmb3JkQXRvbSggdGhpcy5wYXJ0aWNsZVJlbW92ZWRGcm9tQXRvbUVtaXR0ZXIsIHByb3RvbkNvdW50UHJvcGVydHksIG5ldyBWZWN0b3IyKCAwLCAtaGFsZkF0b21XaWR0aCApLCBERUZMRUNUSU9OX1dJRFRIICk7XHJcbiAgICBjb25zdCBhdG9tNCA9IG5ldyBSdXRoZXJmb3JkQXRvbSggdGhpcy5wYXJ0aWNsZVJlbW92ZWRGcm9tQXRvbUVtaXR0ZXIsIHByb3RvbkNvdW50UHJvcGVydHksIG5ldyBWZWN0b3IyKCAtYXRvbVdpZHRoLCAtaGFsZkF0b21XaWR0aCApLCBERUZMRUNUSU9OX1dJRFRIICk7XHJcbiAgICBjb25zdCBhdG9tNSA9IG5ldyBSdXRoZXJmb3JkQXRvbSggdGhpcy5wYXJ0aWNsZVJlbW92ZWRGcm9tQXRvbUVtaXR0ZXIsIHByb3RvbkNvdW50UHJvcGVydHksIG5ldyBWZWN0b3IyKCBhdG9tV2lkdGgsIC1oYWxmQXRvbVdpZHRoICksIERFRkxFQ1RJT05fV0lEVEggKTtcclxuXHJcbiAgICB0aGlzLmF0b21zLnB1c2goIGF0b20xLCBhdG9tMiwgYXRvbTMsIGF0b200LCBhdG9tNSApO1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGF0b20gYm91bmRzIGRvIG5vdCBvdmVybGFwXHJcbiAgICB0aGlzLmNoZWNrQXRvbUJvdW5kcygpO1xyXG4gIH1cclxufVxyXG5cclxucnV0aGVyZm9yZFNjYXR0ZXJpbmcucmVnaXN0ZXIoICdSdXRoZXJmb3JkQXRvbVNwYWNlJywgUnV0aGVyZm9yZEF0b21TcGFjZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUnV0aGVyZm9yZEF0b21TcGFjZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxjQUFjLE1BQU0scUJBQXFCOztBQUVoRDtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLEVBQUU7QUFFM0IsTUFBTUMsbUJBQW1CLFNBQVNKLFNBQVMsQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxtQkFBbUIsRUFBRUMsTUFBTSxFQUFHO0lBRXpDLEtBQUssQ0FBRUQsbUJBQW1CLEVBQUVDLE1BQU0sRUFBRTtNQUNsQ0MsU0FBUyxFQUFFTDtJQUNiLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1LLFNBQVMsR0FBRyxJQUFJLENBQUNELE1BQU0sQ0FBQ0UsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLE1BQU1DLGFBQWEsR0FBR0YsU0FBUyxHQUFHLENBQUM7O0lBRW5DO0lBQ0EsTUFBTUcsS0FBSyxHQUFHLElBQUlULGNBQWMsQ0FBRSxJQUFJLENBQUNVLDhCQUE4QixFQUFFTixtQkFBbUIsRUFBRSxJQUFJUCxPQUFPLENBQUUsQ0FBQ1csYUFBYSxFQUFFLENBQUNBLGFBQWMsQ0FBQyxFQUFFUCxnQkFBaUIsQ0FBQztJQUM3SixNQUFNVSxLQUFLLEdBQUcsSUFBSVgsY0FBYyxDQUFFLElBQUksQ0FBQ1UsOEJBQThCLEVBQUVOLG1CQUFtQixFQUFFLElBQUlQLE9BQU8sQ0FBRSxDQUFDVyxhQUFhLEVBQUUsQ0FBQ0EsYUFBYyxDQUFDLEVBQUVQLGdCQUFpQixDQUFDO0lBQzdKLE1BQU1XLEtBQUssR0FBRyxJQUFJWixjQUFjLENBQUUsSUFBSSxDQUFDVSw4QkFBOEIsRUFBRU4sbUJBQW1CLEVBQUUsSUFBSVAsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDVyxhQUFjLENBQUMsRUFBRVAsZ0JBQWlCLENBQUM7SUFDaEosTUFBTVksS0FBSyxHQUFHLElBQUliLGNBQWMsQ0FBRSxJQUFJLENBQUNVLDhCQUE4QixFQUFFTixtQkFBbUIsRUFBRSxJQUFJUCxPQUFPLENBQUUsQ0FBQ1MsU0FBUyxFQUFFLENBQUNFLGFBQWMsQ0FBQyxFQUFFUCxnQkFBaUIsQ0FBQztJQUN6SixNQUFNYSxLQUFLLEdBQUcsSUFBSWQsY0FBYyxDQUFFLElBQUksQ0FBQ1UsOEJBQThCLEVBQUVOLG1CQUFtQixFQUFFLElBQUlQLE9BQU8sQ0FBRVMsU0FBUyxFQUFFLENBQUNFLGFBQWMsQ0FBQyxFQUFFUCxnQkFBaUIsQ0FBQztJQUV4SixJQUFJLENBQUNjLEtBQUssQ0FBQ0MsSUFBSSxDQUFFUCxLQUFLLEVBQUVFLEtBQUssRUFBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLEtBQU0sQ0FBQzs7SUFFcEQ7SUFDQSxJQUFJLENBQUNHLGVBQWUsQ0FBQyxDQUFDO0VBQ3hCO0FBQ0Y7QUFFQWxCLG9CQUFvQixDQUFDbUIsUUFBUSxDQUFFLHFCQUFxQixFQUFFaEIsbUJBQW9CLENBQUM7QUFFM0UsZUFBZUEsbUJBQW1CIn0=