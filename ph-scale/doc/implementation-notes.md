# pH Scale - Implementation Notes

This document contains notes related to the implementation of pH Scale. 
This is not an exhaustive description of the implementation.  The intention is 
to provide a high-level overview, and to supplement the internal documentation 
(source code comments) and external documentation (design documents). 

Before reading this document, please read:
* [model.md](https://github.com/phetsims/ph-scale/blob/master/doc/model.md), a high-level description of the simulation model
 
## Core Model

All core model computations are
in [PHModel.ts](https://github.com/phetsims/ph-scale/blob/master/js/common/model/PHModel.ts).

[SolutionDerivedProperties.ts](https://github.com/phetsims/ph-scale/blob/master/js/common/model/SolutionDerivedProperties.ts)
models Properties of a solution that are derived from pH and volume. It is separated from the solution model so that it
can be used in different solution models via composition. Read the documentation for more details.
