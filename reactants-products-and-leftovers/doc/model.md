# Reactants, Products and Leftovers - model description

A chemical reaction is a process that leads to the transformation of one set of
chemical substances (reactants) to another (products).  We refer to the reactants
that do not transform to products as "leftovers".

Each reactant and product has a coefficient, given by the chemical equation.
The coefficients describe the quantities of reactants required, and the
quantities of products that will be produced.

Before a reaction takes place, we start with some quantities of reactants.
After the reaction runs to completion, some quantities of products are produced,
and some quantities of leftover reactants remain.

The model implemented in this simulation starts with the reactant quantities,
and computes the quantities of products and leftovers.

We start by determining the number of reactions that will take place.
For each reactant, we divide its quantity by its coefficient.
The smallest such value determines the number of reactions N that will occur.

The quantity Q of product P with coefficient C1: Q = N * C1

The leftovers L of reactant R with coefficient C2: L = ( initial quantity of R ) - ( N * C2 )

The "Sandwiches" analogy treats a sandwich recipe as a single-product reaction, and
in fact uses the same model as the "Molecules" screen. Sandwich ingredients are reactants,
and the completed sandwich is the product.
