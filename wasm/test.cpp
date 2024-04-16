#include <iostream>
#include <vector>
#include "AsmCore.cpp"

int main () {
    AsmCore asmCore(AlgorithmType::NEAT);
    std::cout << asmCore.initalPopulation() << std::endl;
    std::cout << asmCore.generateGeneration("") << std::endl;
    std::cout << asmCore.buildGenome("") << std::endl;

    std::vector<double> params = { 1, 2 };
    std::vector<double> result = asmCore.forward(params);
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value;
    std::cout << std::endl;
}