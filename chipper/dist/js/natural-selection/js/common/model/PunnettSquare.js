// Copyright 2020-2022, University of Colorado Boulder

/**
 * A Punnett square predicts the possible genotypes (genetic cross) that result from breeding two bunnies.
 * The square consists of 4 cells, which describe the ways that 2 pairs of alleles may be crossed. For example, here's
 * a Punnett square that shows the 4 possible crosses of 2 bunnies that are heterozygous ('Ff') for the fur gene:
 *
 *        F    f
 *   F | FF | Ff |
 *   f | Ff | ff |
 *
 *  This sim uses a Punnett square to model Mendelian inheritance and the Law of Segregation. The order of cells is
 *  shuffled to satisfy Mendel's Law of Independence, which states that individual traits are inherited independently.
 *
 *  See also the 'Reproduction' section of model.md at
 *  https://github.com/phetsims/natural-selection/blob/master/doc/model.md#reproduction
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import naturalSelection from '../../naturalSelection.js';
export default class PunnettSquare {
  constructor(fatherGenePair, motherGenePair) {
    this.cells = dotRandom.shuffle([new Cell(fatherGenePair.fatherAllele, motherGenePair.fatherAllele), new Cell(fatherGenePair.fatherAllele, motherGenePair.motherAllele), new Cell(fatherGenePair.motherAllele, motherGenePair.fatherAllele), new Cell(fatherGenePair.motherAllele, motherGenePair.motherAllele)]);
  }

  /**
   * Gets a cell by index. Note that the cells are stored in random order.
   */
  getCell(index) {
    assert && assert(index >= 0 && index < this.cells.length, `invalid index: ${index}`);
    return this.cells[index];
  }

  /**
   * Gets a random cell.
   */
  getRandomCell() {
    return this.cells[dotRandom.nextIntBetween(0, this.cells.length - 1)];
  }

  /**
   * Gets the number of cells.
   */
  get length() {
    return this.cells.length;
  }

  /**
   * Gets the cell in the Punnett square to use for an additional offspring. This is used to create a 5th offspring
   * when a recessive mutant mates eagerly. If the Punnett square contains a homozygous mutation, that genotype is
   * returned. Second choice is a dominant genotype, and a random selection is the last resort.
   */
  getAdditionalCell(mutantAllele, dominantAllele) {
    let cell = null;

    // Look for homozygous mutation
    for (let i = 0; i < this.length && !cell; i++) {
      const currentCell = this.getCell(i);
      if (currentCell.fatherAllele === mutantAllele && currentCell.motherAllele === mutantAllele) {
        cell = currentCell;
      }
    }

    // Fallback to dominant genotype
    if (!cell && dominantAllele) {
      for (let i = 0; i < this.length && !cell; i++) {
        const currentCell = this.getCell(i);
        if (currentCell.fatherAllele === dominantAllele || currentCell.motherAllele === dominantAllele) {
          cell = currentCell;
        }
      }
    }

    // Fallback to random selection
    if (!cell) {
      cell = this.getRandomCell();
    }
    assert && assert(cell, 'cell not found');
    return cell;
  }
}

/**
 * A cell in the Punnett square describes one specific cross (combination of father and mother alleles).
 */
class Cell {
  constructor(fatherAllele, motherAllele) {
    this.fatherAllele = fatherAllele;
    this.motherAllele = motherAllele;
  }
}
naturalSelection.register('PunnettSquare', PunnettSquare);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJuYXR1cmFsU2VsZWN0aW9uIiwiUHVubmV0dFNxdWFyZSIsImNvbnN0cnVjdG9yIiwiZmF0aGVyR2VuZVBhaXIiLCJtb3RoZXJHZW5lUGFpciIsImNlbGxzIiwic2h1ZmZsZSIsIkNlbGwiLCJmYXRoZXJBbGxlbGUiLCJtb3RoZXJBbGxlbGUiLCJnZXRDZWxsIiwiaW5kZXgiLCJhc3NlcnQiLCJsZW5ndGgiLCJnZXRSYW5kb21DZWxsIiwibmV4dEludEJldHdlZW4iLCJnZXRBZGRpdGlvbmFsQ2VsbCIsIm11dGFudEFsbGVsZSIsImRvbWluYW50QWxsZWxlIiwiY2VsbCIsImkiLCJjdXJyZW50Q2VsbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHVubmV0dFNxdWFyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFB1bm5ldHQgc3F1YXJlIHByZWRpY3RzIHRoZSBwb3NzaWJsZSBnZW5vdHlwZXMgKGdlbmV0aWMgY3Jvc3MpIHRoYXQgcmVzdWx0IGZyb20gYnJlZWRpbmcgdHdvIGJ1bm5pZXMuXHJcbiAqIFRoZSBzcXVhcmUgY29uc2lzdHMgb2YgNCBjZWxscywgd2hpY2ggZGVzY3JpYmUgdGhlIHdheXMgdGhhdCAyIHBhaXJzIG9mIGFsbGVsZXMgbWF5IGJlIGNyb3NzZWQuIEZvciBleGFtcGxlLCBoZXJlJ3NcclxuICogYSBQdW5uZXR0IHNxdWFyZSB0aGF0IHNob3dzIHRoZSA0IHBvc3NpYmxlIGNyb3NzZXMgb2YgMiBidW5uaWVzIHRoYXQgYXJlIGhldGVyb3p5Z291cyAoJ0ZmJykgZm9yIHRoZSBmdXIgZ2VuZTpcclxuICpcclxuICogICAgICAgIEYgICAgZlxyXG4gKiAgIEYgfCBGRiB8IEZmIHxcclxuICogICBmIHwgRmYgfCBmZiB8XHJcbiAqXHJcbiAqICBUaGlzIHNpbSB1c2VzIGEgUHVubmV0dCBzcXVhcmUgdG8gbW9kZWwgTWVuZGVsaWFuIGluaGVyaXRhbmNlIGFuZCB0aGUgTGF3IG9mIFNlZ3JlZ2F0aW9uLiBUaGUgb3JkZXIgb2YgY2VsbHMgaXNcclxuICogIHNodWZmbGVkIHRvIHNhdGlzZnkgTWVuZGVsJ3MgTGF3IG9mIEluZGVwZW5kZW5jZSwgd2hpY2ggc3RhdGVzIHRoYXQgaW5kaXZpZHVhbCB0cmFpdHMgYXJlIGluaGVyaXRlZCBpbmRlcGVuZGVudGx5LlxyXG4gKlxyXG4gKiAgU2VlIGFsc28gdGhlICdSZXByb2R1Y3Rpb24nIHNlY3Rpb24gb2YgbW9kZWwubWQgYXRcclxuICogIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9ibG9iL21hc3Rlci9kb2MvbW9kZWwubWQjcmVwcm9kdWN0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBBbGxlbGUgZnJvbSAnLi9BbGxlbGUuanMnO1xyXG5pbXBvcnQgR2VuZVBhaXIgZnJvbSAnLi9HZW5lUGFpci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdW5uZXR0U3F1YXJlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjZWxsczogQ2VsbFtdO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZhdGhlckdlbmVQYWlyOiBHZW5lUGFpciwgbW90aGVyR2VuZVBhaXI6IEdlbmVQYWlyICkge1xyXG5cclxuICAgIHRoaXMuY2VsbHMgPSBkb3RSYW5kb20uc2h1ZmZsZSggW1xyXG4gICAgICBuZXcgQ2VsbCggZmF0aGVyR2VuZVBhaXIuZmF0aGVyQWxsZWxlLCBtb3RoZXJHZW5lUGFpci5mYXRoZXJBbGxlbGUgKSxcclxuICAgICAgbmV3IENlbGwoIGZhdGhlckdlbmVQYWlyLmZhdGhlckFsbGVsZSwgbW90aGVyR2VuZVBhaXIubW90aGVyQWxsZWxlICksXHJcbiAgICAgIG5ldyBDZWxsKCBmYXRoZXJHZW5lUGFpci5tb3RoZXJBbGxlbGUsIG1vdGhlckdlbmVQYWlyLmZhdGhlckFsbGVsZSApLFxyXG4gICAgICBuZXcgQ2VsbCggZmF0aGVyR2VuZVBhaXIubW90aGVyQWxsZWxlLCBtb3RoZXJHZW5lUGFpci5tb3RoZXJBbGxlbGUgKVxyXG4gICAgXSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIGNlbGwgYnkgaW5kZXguIE5vdGUgdGhhdCB0aGUgY2VsbHMgYXJlIHN0b3JlZCBpbiByYW5kb20gb3JkZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENlbGwoIGluZGV4OiBudW1iZXIgKTogQ2VsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5jZWxscy5sZW5ndGgsIGBpbnZhbGlkIGluZGV4OiAke2luZGV4fWAgKTtcclxuICAgIHJldHVybiB0aGlzLmNlbGxzWyBpbmRleCBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIHJhbmRvbSBjZWxsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRSYW5kb21DZWxsKCk6IENlbGwge1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHNbIGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggMCwgdGhpcy5jZWxscy5sZW5ndGggLSAxICkgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBjZWxscy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuY2VsbHMubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2VsbCBpbiB0aGUgUHVubmV0dCBzcXVhcmUgdG8gdXNlIGZvciBhbiBhZGRpdGlvbmFsIG9mZnNwcmluZy4gVGhpcyBpcyB1c2VkIHRvIGNyZWF0ZSBhIDV0aCBvZmZzcHJpbmdcclxuICAgKiB3aGVuIGEgcmVjZXNzaXZlIG11dGFudCBtYXRlcyBlYWdlcmx5LiBJZiB0aGUgUHVubmV0dCBzcXVhcmUgY29udGFpbnMgYSBob21venlnb3VzIG11dGF0aW9uLCB0aGF0IGdlbm90eXBlIGlzXHJcbiAgICogcmV0dXJuZWQuIFNlY29uZCBjaG9pY2UgaXMgYSBkb21pbmFudCBnZW5vdHlwZSwgYW5kIGEgcmFuZG9tIHNlbGVjdGlvbiBpcyB0aGUgbGFzdCByZXNvcnQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFkZGl0aW9uYWxDZWxsKCBtdXRhbnRBbGxlbGU6IEFsbGVsZSwgZG9taW5hbnRBbGxlbGU6IEFsbGVsZSB8IG51bGwgKTogQ2VsbCB7XHJcblxyXG4gICAgbGV0IGNlbGwgPSBudWxsO1xyXG5cclxuICAgIC8vIExvb2sgZm9yIGhvbW96eWdvdXMgbXV0YXRpb25cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmICFjZWxsOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRDZWxsID0gdGhpcy5nZXRDZWxsKCBpICk7XHJcbiAgICAgIGlmICggY3VycmVudENlbGwuZmF0aGVyQWxsZWxlID09PSBtdXRhbnRBbGxlbGUgJiYgY3VycmVudENlbGwubW90aGVyQWxsZWxlID09PSBtdXRhbnRBbGxlbGUgKSB7XHJcbiAgICAgICAgY2VsbCA9IGN1cnJlbnRDZWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmFsbGJhY2sgdG8gZG9taW5hbnQgZ2Vub3R5cGVcclxuICAgIGlmICggIWNlbGwgJiYgZG9taW5hbnRBbGxlbGUgKSB7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoICYmICFjZWxsOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudENlbGwgPSB0aGlzLmdldENlbGwoIGkgKTtcclxuICAgICAgICBpZiAoIGN1cnJlbnRDZWxsLmZhdGhlckFsbGVsZSA9PT0gZG9taW5hbnRBbGxlbGUgfHwgY3VycmVudENlbGwubW90aGVyQWxsZWxlID09PSBkb21pbmFudEFsbGVsZSApIHtcclxuICAgICAgICAgIGNlbGwgPSBjdXJyZW50Q2VsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBGYWxsYmFjayB0byByYW5kb20gc2VsZWN0aW9uXHJcbiAgICBpZiAoICFjZWxsICkge1xyXG4gICAgICBjZWxsID0gdGhpcy5nZXRSYW5kb21DZWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbCwgJ2NlbGwgbm90IGZvdW5kJyApO1xyXG4gICAgcmV0dXJuIGNlbGw7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBjZWxsIGluIHRoZSBQdW5uZXR0IHNxdWFyZSBkZXNjcmliZXMgb25lIHNwZWNpZmljIGNyb3NzIChjb21iaW5hdGlvbiBvZiBmYXRoZXIgYW5kIG1vdGhlciBhbGxlbGVzKS5cclxuICovXHJcbmNsYXNzIENlbGwge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZmF0aGVyQWxsZWxlOiBBbGxlbGU7XHJcbiAgcHVibGljIHJlYWRvbmx5IG1vdGhlckFsbGVsZTogQWxsZWxlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGZhdGhlckFsbGVsZTogQWxsZWxlLCBtb3RoZXJBbGxlbGU6IEFsbGVsZSApIHtcclxuICAgIHRoaXMuZmF0aGVyQWxsZWxlID0gZmF0aGVyQWxsZWxlO1xyXG4gICAgdGhpcy5tb3RoZXJBbGxlbGUgPSBtb3RoZXJBbGxlbGU7XHJcbiAgfVxyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnUHVubmV0dFNxdWFyZScsIFB1bm5ldHRTcXVhcmUgKTsiXSwibWFwcGluZ3Mi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