#include <string>
#include <sstream>
#include "../Utils.hpp"
#include "../CNeuroevolutionBase.hpp"

class Neat: public CNeuroevolutionBase {
private:
    class Neuron {
    public:
            Neuron() {};
    };
public:
    std::string getName() const override { return "NEAT"; };

    // hyperparameters
    // [0] - input neurons
    // [1] - output neurons
    // [2] - population size
    // [3] - mutation rate
    std::string initialPopulation(const std::vector<double>& hyperparameters) const override {
        return "&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1";
    };
    std::string generateGeneration(const std::vector<double>& hyperparameters, const std::vector<double>& fitness, const std::string& population) const override {
        return "&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1&N0S;N0S;N1S;N3S;C0,2,1;C1,2,1;C2,3,1";
    }

    // genome contains neurons with their type (input, output, hidden)
    // after that, there are connections, which have disabled parameter
    // nodes and connections are separed by '-'
    // example "IHO-0,1,0.5,1,0;1,2,1,1,1"
    int buildGenome(const std::string& genome) override {
        std::istringstream iss(genome);
        std::string part;
        std::vector<std::string> parts;

        // split neurons and connections
        while (std::getline(iss, part, '-'))
            parts.push_back(part);

        // create neurons
        for (size_t i = 0; i < parts[0].length(); i++) {
            ENeuronType type;
            switch(parts[0][i]) {
                case 'I': type = ENeuronType::INPUT; break;
                case 'H': type = ENeuronType::HIDDEN; break;
                case 'O': default: type = ENeuronType::OUTPUT; break;
            }
            m_network.registerNode(ActivationFunctions::SIGM, type);
        }

        // add connections
        std::istringstream connections(parts[1]);
        while (std::getline(connections, part, ';')) {
            std::istringstream connection(part);
            std::vector<std::string> data;
            while (std::getline(connection, part, ','))
                data.push_back(part);

            // check if connection is active
            if (std::stoi(data[3]))
                m_network.registerConnection(std::stoi(data[0]), std::stoi(data[1]), std::stod(data[2]));
        }

        return 0;
    }
};