// Copyright 2023, University of Colorado Boulder

/**
 * A pair of QuadrilateralVertex or QuadrilateralSide that has some relationship. For example,
 * they could be adjacent or opposite to eachother
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
class UnorderedComponentPair {
  constructor(component1, component2) {
    this.component1 = component1;
    this.component2 = component2;
  }

  /**
   * Does this pair equal the other?
   */
  equals(otherPair) {
    return this.component1 === otherPair.component1 && this.component2 === otherPair.component2 || this.component2 === otherPair.component1 && this.component1 === otherPair.component2;
  }

  /**
   * Does this pair include the provided component?
   */
  includesComponent(component) {
    return this.component1 === component || this.component2 === component;
  }
}
quadrilateral.register('UnorderedComponentPair', UnorderedComponentPair);
export default UnorderedComponentPair;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJxdWFkcmlsYXRlcmFsIiwiVW5vcmRlcmVkQ29tcG9uZW50UGFpciIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50MSIsImNvbXBvbmVudDIiLCJlcXVhbHMiLCJvdGhlclBhaXIiLCJpbmNsdWRlc0NvbXBvbmVudCIsImNvbXBvbmVudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVW5vcmRlcmVkQ29tcG9uZW50UGFpci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBwYWlyIG9mIFF1YWRyaWxhdGVyYWxWZXJ0ZXggb3IgUXVhZHJpbGF0ZXJhbFNpZGUgdGhhdCBoYXMgc29tZSByZWxhdGlvbnNoaXAuIEZvciBleGFtcGxlLFxyXG4gKiB0aGV5IGNvdWxkIGJlIGFkamFjZW50IG9yIG9wcG9zaXRlIHRvIGVhY2hvdGhlclxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgcXVhZHJpbGF0ZXJhbCBmcm9tICcuLi8uLi9xdWFkcmlsYXRlcmFsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxNb3ZhYmxlIGZyb20gJy4vUXVhZHJpbGF0ZXJhbE1vdmFibGUuanMnO1xyXG5cclxuY2xhc3MgVW5vcmRlcmVkQ29tcG9uZW50UGFpcjxUIGV4dGVuZHMgUXVhZHJpbGF0ZXJhbE1vdmFibGU+IHtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9uZW50MTogVDtcclxuICBwdWJsaWMgcmVhZG9ubHkgY29tcG9uZW50MjogVDtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBjb21wb25lbnQxOiBULCBjb21wb25lbnQyOiBUICkge1xyXG4gICAgdGhpcy5jb21wb25lbnQxID0gY29tcG9uZW50MTtcclxuICAgIHRoaXMuY29tcG9uZW50MiA9IGNvbXBvbmVudDI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoaXMgcGFpciBlcXVhbCB0aGUgb3RoZXI/XHJcbiAgICovXHJcbiAgcHVibGljIGVxdWFscyggb3RoZXJQYWlyOiBVbm9yZGVyZWRDb21wb25lbnRQYWlyPFQ+ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggdGhpcy5jb21wb25lbnQxID09PSBvdGhlclBhaXIuY29tcG9uZW50MSAmJiB0aGlzLmNvbXBvbmVudDIgPT09IG90aGVyUGFpci5jb21wb25lbnQyICkgfHxcclxuICAgICAgICAgICAoIHRoaXMuY29tcG9uZW50MiA9PT0gb3RoZXJQYWlyLmNvbXBvbmVudDEgJiYgdGhpcy5jb21wb25lbnQxID09PSBvdGhlclBhaXIuY29tcG9uZW50MiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG9lcyB0aGlzIHBhaXIgaW5jbHVkZSB0aGUgcHJvdmlkZWQgY29tcG9uZW50P1xyXG4gICAqL1xyXG4gIHB1YmxpYyBpbmNsdWRlc0NvbXBvbmVudCggY29tcG9uZW50OiBUICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50MSA9PT0gY29tcG9uZW50IHx8IHRoaXMuY29tcG9uZW50MiA9PT0gY29tcG9uZW50O1xyXG4gIH1cclxufVxyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ1Vub3JkZXJlZENvbXBvbmVudFBhaXInLCBVbm9yZGVyZWRDb21wb25lbnRQYWlyICk7XHJcbmV4cG9ydCBkZWZhdWx0IFVub3JkZXJlZENvbXBvbmVudFBhaXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGFBQWEsTUFBTSx3QkFBd0I7QUFHbEQsTUFBTUMsc0JBQXNCLENBQWlDO0VBSWpEQyxXQUFXQSxDQUFFQyxVQUFhLEVBQUVDLFVBQWEsRUFBRztJQUNwRCxJQUFJLENBQUNELFVBQVUsR0FBR0EsVUFBVTtJQUM1QixJQUFJLENBQUNDLFVBQVUsR0FBR0EsVUFBVTtFQUM5Qjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsTUFBTUEsQ0FBRUMsU0FBb0MsRUFBWTtJQUM3RCxPQUFTLElBQUksQ0FBQ0gsVUFBVSxLQUFLRyxTQUFTLENBQUNILFVBQVUsSUFBSSxJQUFJLENBQUNDLFVBQVUsS0FBS0UsU0FBUyxDQUFDRixVQUFVLElBQ3BGLElBQUksQ0FBQ0EsVUFBVSxLQUFLRSxTQUFTLENBQUNILFVBQVUsSUFBSSxJQUFJLENBQUNBLFVBQVUsS0FBS0csU0FBUyxDQUFDRixVQUFZO0VBQ2pHOztFQUVBO0FBQ0Y7QUFDQTtFQUNTRyxpQkFBaUJBLENBQUVDLFNBQVksRUFBWTtJQUNoRCxPQUFPLElBQUksQ0FBQ0wsVUFBVSxLQUFLSyxTQUFTLElBQUksSUFBSSxDQUFDSixVQUFVLEtBQUtJLFNBQVM7RUFDdkU7QUFDRjtBQUVBUixhQUFhLENBQUNTLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRVIsc0JBQXVCLENBQUM7QUFDMUUsZUFBZUEsc0JBQXNCIn0=