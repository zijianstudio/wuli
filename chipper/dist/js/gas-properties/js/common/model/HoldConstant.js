// Copyright 2019-2022, University of Colorado Boulder

/**
 * HoldConstant is string union that identifies which quantity should be held constant when applying
 * the Ideal Gas Law, PV = NkT, where:
 *
 * P = pressure
 * V = volume
 * N = number of particles
 * T = temperature
 * k = Boltzmann constant
 *
 * This enumeration was named by consensus, see https://github.com/phetsims/gas-properties/issues/105
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

export const HoldConstantValues = ['nothing',
// change N, T, or V => change P
'volume',
// change N or T => change P
'temperature',
// change N or V => change P
'pressureV',
// change N or T => change V
'pressureT' // change N or V => change T
];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIb2xkQ29uc3RhbnRWYWx1ZXMiXSwic291cmNlcyI6WyJIb2xkQ29uc3RhbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSG9sZENvbnN0YW50IGlzIHN0cmluZyB1bmlvbiB0aGF0IGlkZW50aWZpZXMgd2hpY2ggcXVhbnRpdHkgc2hvdWxkIGJlIGhlbGQgY29uc3RhbnQgd2hlbiBhcHBseWluZ1xyXG4gKiB0aGUgSWRlYWwgR2FzIExhdywgUFYgPSBOa1QsIHdoZXJlOlxyXG4gKlxyXG4gKiBQID0gcHJlc3N1cmVcclxuICogViA9IHZvbHVtZVxyXG4gKiBOID0gbnVtYmVyIG9mIHBhcnRpY2xlc1xyXG4gKiBUID0gdGVtcGVyYXR1cmVcclxuICogayA9IEJvbHR6bWFubiBjb25zdGFudFxyXG4gKlxyXG4gKiBUaGlzIGVudW1lcmF0aW9uIHdhcyBuYW1lZCBieSBjb25zZW5zdXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2FzLXByb3BlcnRpZXMvaXNzdWVzLzEwNVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBIb2xkQ29uc3RhbnRWYWx1ZXMgPSBbXHJcbiAgJ25vdGhpbmcnLCAgICAgIC8vIGNoYW5nZSBOLCBULCBvciBWID0+IGNoYW5nZSBQXHJcbiAgJ3ZvbHVtZScsICAgICAgIC8vIGNoYW5nZSBOIG9yIFQgPT4gY2hhbmdlIFBcclxuICAndGVtcGVyYXR1cmUnLCAgLy8gY2hhbmdlIE4gb3IgViA9PiBjaGFuZ2UgUFxyXG4gICdwcmVzc3VyZVYnLCAgICAvLyBjaGFuZ2UgTiBvciBUID0+IGNoYW5nZSBWXHJcbiAgJ3ByZXNzdXJlVCcgICAgIC8vIGNoYW5nZSBOIG9yIFYgPT4gY2hhbmdlIFRcclxuXSBhcyBjb25zdDtcclxuZXhwb3J0IHR5cGUgSG9sZENvbnN0YW50ID0gKCB0eXBlb2YgSG9sZENvbnN0YW50VmFsdWVzIClbbnVtYmVyXTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTyxNQUFNQSxrQkFBa0IsR0FBRyxDQUNoQyxTQUFTO0FBQU87QUFDaEIsUUFBUTtBQUFRO0FBQ2hCLGFBQWE7QUFBRztBQUNoQixXQUFXO0FBQUs7QUFDaEIsV0FBVyxDQUFLO0FBQUEsQ0FDUiJ9