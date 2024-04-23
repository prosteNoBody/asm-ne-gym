#include <iostream>
#include <vector>
#include "AsmCore.cpp"

// this file is constipated as testing raw c++ without wasm
int main () {
    AsmCore asmCore("NEAT");
    std::cout << asmCore.initialPopulation({23, 23}) << std::endl;
    std::cout << asmCore.generateGeneration({ 23 }, "") << std::endl;
    std::cout << asmCore.buildGenome("") << std::endl;

    std::vector<double> params = { 1, 2 };
    std::vector<double> result = asmCore.forward(params);
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value;
    std::cout << std::endl;
}