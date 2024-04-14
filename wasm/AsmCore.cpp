// emscripten library
// #include <emscripten/bind.h>

// algorithm libraries
#include "Algorithms/Neat.hpp"

#include <string>
#include <memory>
#include <vector>
#include "CNeuroevolutionBase.hpp"

// Algorithm string enum
class AlgorithmType {
public:
    static const std::string NEAT;
};
const std::string AlgorithmType::NEAT = "NEAT";

class AsmCore {
private:
    std::unique_ptr<CNeuroevolutionBase> algorithm;
public:
    // Algorithm register
    AsmCore(const std::string& algorithmType) {
        if (algorithmType == AlgorithmType::NEAT)
            algorithm = std::make_unique<Neat>();
    };
    // wrapper functions
    std::string initalPopulation() {
        return algorithm->initalPopulation();
    }
    std::string generateGeneration(const std::string& population) {
        return algorithm->generateGeneration(population);
    }
    int buildGenome(const std::string& genome) {
        return algorithm->buildGenome(genome);
    }
    std::vector<double> forward(const std::vector<double> inputs) {
        return algorithm->forward(inputs);
    }
};

/*EMSCRIPTEN_BINDINGS(asm_core) {
    class_<AsmCore>("AsmCore")
        .constructor<const std::string&>()
        .function("initalPopulation", &AsmCore::initalPopulation);
        .function("generateGeneration", &AsmCore::generateGeneration);
        .function("buildGenome", &AsmCore::buildGenome);
        .function("froward", &AsmCore::froward);
}*/