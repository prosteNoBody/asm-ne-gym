#include <string>
#include "../Utils.hpp"
#include "../CNeuroevolutionBase.hpp"

class Neat: public CNeuroevolutionBase {
public:
    std::string initalPopulation() override {
        return "initalized population";
    };
    std::string generateGeneration(const std::string& population) override {
        return "generated generation";
    }
    int buildGenome(const std::string& genome) override {
        m_network.registerNode(ActivationFunctions::SIGM, ENeuronType::INPUT);
        m_network.registerNode(ActivationFunctions::SIGM, ENeuronType::INPUT);
        m_network.registerNode(ActivationFunctions::SIGM, ENeuronType::HIDDEN);
        m_network.registerNode(ActivationFunctions::SIGM, ENeuronType::OUTPUT);
        m_network.registerConnection(0, 2, 1);
        m_network.registerConnection(1, 2, 1);
        m_network.registerConnection(2, 3, 1);
        return 37;
    }
};