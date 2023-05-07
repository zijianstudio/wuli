# pH Scale - Model Description

This document is a high-level description of the model used in PhET's _pH Scale_ simulation.

See [PHModel.ts](https://github.com/phetsims/ph-scale/blob/master/js/common/model/PHModel.ts) for implementation.

## Definitions

* H<sub>2</sub>O = water
* H<sub>3</sub>O<sup>+</sup> = hydronium
* OH<sup>-</sup> = hydroxide
* N<sub>A</sub> = Avogadro's constant, 6.023 x 10<sup>23</sup>
* V = volume
* [<i>X</i>] = the concentration of <i>X</i>

## Units

* Quantity: moles (mol)
* Volume: literes (L)
* Concentration: moles per liter (mol/L)

## Computations

#### Volume

If two volumes of liquid 1 & 2 are added, the total volume is V<sub>T</sub> = V<sub>1</sub> + V<sub>2</sub>

#### Concentration

Concentration of hydronium is [H<sub>3</sub>O<sup>+</sup>] = 10<sup>-pH</sup>

Concentration of hydroxide is [OH] = 10<sup>pH-14</sup>

Concentration of water is [H<sub>2</sub>O] = 55

#### Quantity

Number of moles of _X_ = [_X_] * V<sub>T</sub>

Number of molecules of _X_ = ( Number of moles of _X_ ) * N<sub>A</sub>

#### pH

If combining 2 acids (or acid and water), then pH = -log( ( 10<sup>-pH<sub>1</sub></sup> * V<sub>1</sub> + 10<sup>-pH<sub>2</sub></sup> * V<sub>2</sub> ) / V<sub>T</sub>)

If combining 2 bases (or base and water), then pH = 14 + log( ( 10<sup>pH<sub>1</sub>-14</sup> * V<sub>1</sub> + 10<sup>14-pH<sub>2</sub></sup> *V <sub>2</sub> ) / V<sub>T</sub> )

If concentration of H<sub>3</sub>O<sup>+</sup> is changed, then pH = -log( [H<sub>3</sub>O<sup>+</sup>] )

If concentration of OH is changed, then pH = 14 + log( [OH] )

If #moles of H<sub>3</sub>O<sup>+</sup> is changed, then pH = -log( (#moles H<sub>3</sub>O<sup>+</sup>) / V<sub>T</sub> )

If #moles of OH is changed,, then pH = 14 + log( (#moles OH) / V<sub>T</sub>))

## Limits

* pH range = [-1, 15]
* volume range = [0, 1.2] L
