#ifdef EMSCRIPTEN
// emscripten library
#include <emscripten/bind.h>
#endif

#include <string>
#include <memory>
#include <vector>
#include "CNeuroevolutionBase.hpp"

// algorithm libraries
#include "algorithms/Neat.hpp"
#include "algorithms/CNE.hpp"

class AsmCore {
private:
    std::unique_ptr<CNeuroevolutionBase> algorithm;
public:
    // Algorithm register
    AsmCore(const std::string& algorithmType) {
        if (Neat().getName() == algorithmType)
            algorithm = std::make_unique<Neat>();
        else if (CNE().getName() == algorithmType)
            algorithm = std::make_unique<CNE>();
    };

    // wrapper functions
    std::string initialPopulation(const std::vector<double>& hyperparameters) {
        return algorithm->initialPopulation(hyperparameters);
    }
    std::string generateGeneration(
        const std::vector<double>& hyperparameters, const std::vector<double>& fitness, const std::string& population, const std::string& seed
    ) {
        return algorithm->generateGeneration(hyperparameters, fitness, population, seed);
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
        .function("forward", &AsmCore::forward)
        ;

    emscripten::register_vector<double>("Vector");
}
#endif