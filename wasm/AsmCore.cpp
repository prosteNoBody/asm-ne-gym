#ifdef EMSCRIPTEN
// emscripten library
#include <emscripten/bind.h>
#endif

#include <string>
#include <memory>
#include <vector>
#include "CNeuroevolutionBase.hpp"

// algorithm libraries
#include "Algorithms/Neat.hpp"

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
    std::string initialPopulation(const std::vector<double>& config) {
        return algorithm->initialPopulation(config);
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

#ifdef EMSCRIPTEN
EMSCRIPTEN_BINDINGS(asm_core) {
    emscripten::class_<AsmCore>("AsmCore")
        .constructor<const std::string&>()
        .function("initialPopulation", &AsmCore::initialPopulation)
        .function("generateGeneration", &AsmCore::generateGeneration)
        .function("buildGenome", &AsmCore::buildGenome)
        .function("forward", &AsmCore::forward);

    emscripten::register_vector<double>("VectorDouble");
}
#endif