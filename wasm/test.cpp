#include <iostream>
#include <vector>
#include "AsmCore.cpp"

// this file is constipated as testing raw c++ without wasm
int main () {
    AsmCore asmCore("CNE");
    std::vector<double> hyperParams = {1, 1, 1, 0.5, 1, 1};
    std::string initPop = asmCore.initialPopulation(hyperParams);
    std::cout << "inital population: " << initPop << std::endl;
    std::cout << "new generation: " << asmCore.generateGeneration(hyperParams, { 5 }, initPop) << std::endl;
    asmCore.buildGenome("3;2;4;2-1.000000;1.000000;-0.460000;1.000000;1.000000;1.000000;0.620000;0.718000;0.383000;0.571000;1.000000;1.000000;0.356000;1.000000;1.000000;1.000000;1.000000;1.000000;-0.656000;0.548000;1.000000;1.000000;0.994000;0.567000;1.000000;-0.851000;1.000000;1.000000;1.000000;1.000000;1.000000;1.000000;0.784000;1.000000;0.886000;0.880000");
    std::vector<double> result = asmCore.forward({ -230000, -230000, -230000 });
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value << " ";
    std::cout << std::endl;

/*     std::cout << asmCore.generateGeneration({ 23 }, { 23 }, "") << std::endl;
    std::cout << asmCore.buildGenome("3;2;4;2-1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1") << std::endl;

    std::vector<double> params = { 1 };
    std::vector<double> result = asmCore.forward(params);
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value;
    std::cout << std::endl; */
}