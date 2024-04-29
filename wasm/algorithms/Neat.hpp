#include <string>
#include "../Utils.hpp"
#include "../CNeuroevolutionBase.hpp"

class Neat: public CNeuroevolutionBase {
public:
    std::string getName() const override { return "NEAT"; };
    std::string initialPopulation(const std::vector<double>& hyperparameters) const override {
        return "&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1";
    };
    std::string generateGeneration(const std::vector<double>& hyperparameters, const std::string& population) const override {
        return "&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1";
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