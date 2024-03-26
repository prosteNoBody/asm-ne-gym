# asm-ne-gym
Library for implementation of c++ algorithms for neuroevolation and connection to javascript environment.
Library aim for best performance and plug-in implementation of your own environment or neuroevolution algorithm.
Core parts of this project are parallel computation and webassembly evaluation of NNs. Because of these two concept and primitive API there are more room for you to experiment with your environment or your algorithm, instead of making your own evalution process.

Structure
----
`src/` - contains key components of library \
`src/element-engine` - our engine which is optional to use and not required, but can save you some time creating environment. TODO - explain that engine already have build in api interface for core \
`build/` - output which can be use by you in your own application \
`demo/` - showcase of example where we have existing environments and neuroevolution algorithm connected to library
