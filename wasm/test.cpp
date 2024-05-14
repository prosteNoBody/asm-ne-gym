#include <iostream>
#include <vector>
#include "AsmCore.cpp"

// this file is constipated as testing raw c++ without wasm
int main () {
    AsmCore asmCore("NEAT");
    asmCore.buildGenome("IHO|0,1,0.5,0,1;1,2,0.5,1,1");

    std::cout << "forward: " << std::endl;
    std::vector<double> results = asmCore.forward({ 1 });
    for (auto res : results)
        std::cout << res << ", ";
    std::cout << std::endl;

    std::vector<double> hyperparams = { 3, 2, 1000, 0.5, 2, 2 };

    std::string population = asmCore.initialPopulation(hyperparams);


    std::vector<double> fitness;
    for (int i = 0; i < hyperparams[2]; i++)
        fitness.emplace_back((hyperparams[2] - i) * 10);
    for (int i = 0; i < 1000; i++) {
        population = asmCore.generateGeneration(hyperparams, fitness, population);
    }
}