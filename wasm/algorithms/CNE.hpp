#include <string>
#include <sstream>
#include <random>
#include "../Utils.hpp"
#include "../CNeuroevolutionBase.hpp"

#define BEST_PERCENTAGE_CNE 0.15

class CNE: public CNeuroevolutionBase {
private:
    struct Connection {
        int from;
        int to;
        double weight;
        Connection(int from, int to, double weight): from(from), to(to), weight(weight) {};
    };
    struct Neuron {
        ENeuronType type;
        Neuron(ENeuronType type): type(type) {};
    };
    struct Network {
        std::vector<int> architecture;
        std::vector<Neuron> neurons;
        std::vector<Connection> connections;
    };

    Network genome2network(const std::string& genome) const {
        Network network;
        std::string tmp;
        std::vector<std::string> parts;
        std::istringstream iss_parts(genome);

        while (std::getline(iss_parts, tmp, '|'))
            parts.emplace_back(tmp);

        // load architecture parameters
        std::istringstream iss_architecture(parts[0]);
        while (std::getline(iss_architecture, tmp, ';'))
            network.architecture.emplace_back(std::stoi(tmp));

        // create neurons
        for (int i = 0; i < network.architecture[0]; i++)
            network.neurons.emplace_back(ENeuronType::INPUT);
        for (int i = 0; i < network.architecture[2]*network.architecture[3]; i++)
            network.neurons.emplace_back(ENeuronType::HIDDEN);
        for (int i = 0; i < network.architecture[1]; i++)
            network.neurons.emplace_back(ENeuronType::OUTPUT);

        // create connections
        // input nodes
        for (int i = 0; i < network.architecture[0]; i++) {
            for (int j = network.architecture[0]; j < network.architecture[0] + network.architecture[2]; j++) {
                network.connections.emplace_back(i, j, 0);
            }
        }
        // hidden nodes
        for (int l = 0; l < network.architecture[3] - 1; l++) {
            for (int i = network.architecture[0]; i < network.architecture[0] + network.architecture[2]; i++) {
                for (int j = network.architecture[0] + network.architecture[2]; j < network.architecture[0] + 2*network.architecture[2]; j++) {
                    network.connections.emplace_back(i + l*network.architecture[2], j + l*network.architecture[2], 0);
                }
            }
        }
        // output nodes
        for (int i = network.architecture[0] + network.architecture[2] * (network.architecture[3] - 1);i < network.architecture[0] + network.architecture[2] * network.architecture[3]; i++) {
            for (int j = network.architecture[0] + network.architecture[2]*network.architecture[3]; j < network.architecture[0] + network.architecture[2]*network.architecture[3] + network.architecture[1]; j++) {
                network.connections.emplace_back(i, j, 0);
            }
        }

        // fill connections weights
        std::istringstream iss_weights(parts[1]);
        std::vector<double> weights;
        while (std::getline(iss_weights, tmp, ';'))
            weights.emplace_back(std::stod(tmp));
        
        for (size_t i = 0; i < weights.size(); i++)
            network.connections[i].weight = weights[i];

        return network;
    }

    std::string network2genome(const Network& network) const {
        std::string genome;

        // neurons
        genome += std::to_string(network.architecture[0]) + ";";
        genome += std::to_string(network.architecture[1]) + ";";
        genome += std::to_string(network.architecture[2]) + ";";
        genome += std::to_string(network.architecture[3]) + "|";

        // input connections
        for (const auto& connection : network.connections)
            genome += std::to_string(connection.weight) + ';';
        genome.pop_back();

        return genome;
    }
public:
    std::string getName() const override { return "CNE"; };

    // hyperparameters
    // [0] - input neurons
    // [1] - output neurons
    // [2] - population size
    // [3] - mutation rate
    // [4] - number of neruons in layers
    // [5] - number of layers
    std::string initialPopulation(const std::vector<double>& hyperparameters) const override {
        int inputNeurons = hyperparameters[0];
        int outputNeurons = hyperparameters[1];
        int neuronsPerLayer = hyperparameters[4];
        int numOfLayers = hyperparameters[5];

        // multiply genome to create generation
        std::string population;
        for (int i = 0; i < hyperparameters[2]; i++) {
            std::string genome;

            // neurons
            genome += std::to_string(inputNeurons) + ";";
            genome += std::to_string(outputNeurons) + ";";
            genome += std::to_string(neuronsPerLayer) + ";";
            genome += std::to_string(numOfLayers) + "|";

            // input connections
            int numOfConnections = inputNeurons*neuronsPerLayer + neuronsPerLayer*neuronsPerLayer*(numOfLayers - 1) + neuronsPerLayer*outputNeurons;
            for (int i = 0; i < numOfConnections; i++)
                genome += "1;";
            genome.pop_back();

            population += "&" + genome;
        }
        return population;
    };
    std::string generateGeneration(
        const std::vector<double>& hyperparameters, const std::vector<double>& fitness, const std::string& population, const std::string& seed
    ) const override {
        std::string tmp;
        std::istringstream iss_population(population);
        iss_population.ignore(1);

        // split population to genomes
        std::vector<std::string> genomes;
        while (std::getline(iss_population, tmp, '&'))
            genomes.emplace_back(tmp);

        // keep only best genomes
        size_t bestCnt = std::ceil(genomes.size() * BEST_PERCENTAGE_CNE);
        genomes.erase(genomes.begin() + bestCnt, genomes.end());

        // convert to fenotype
        std::vector<Network> fenotypes;
        for (std::string genome : genomes)
            fenotypes.emplace_back(genome2network(genome));

        // generate new generation
        std::string generation;
        int populationSize = hyperparameters[2];
        double mutationRate = hyperparameters[3];

        // random dist
        std::hash<std::string> hash_seed;
        std::mt19937 gen(hash_seed(seed));
        std::discrete_distribution dist(fitness.begin(), fitness.begin() + bestCnt);
        std::uniform_real_distribution<double> uniform_dist(-10.0, 10.0);
        for (int i = 0; i < populationSize; i++) {
            Network& parent1 = fenotypes.at(dist(gen));
            Network& parent2 = fenotypes.at(dist(gen));

            Network offspring;
            offspring.architecture = parent1.architecture;
            offspring.neurons = parent1.neurons;
            offspring.connections = parent1.connections;

            // copy connections
            for (size_t i = 0; i < parent1.connections.size(); i++) {
                bool doesMutate = (gen() % static_cast<int>(std::ceil(1 / mutationRate))) == 0;
                bool firstParent = (gen() % 2) == 0;
                double newWeight;
                if (doesMutate)
                    newWeight = uniform_dist(gen);
                else if (firstParent)
                    newWeight = parent1.connections[i].weight;
                else
                    newWeight = parent2.connections[i].weight;

                offspring.connections[i].weight = newWeight;
            }

            generation += "&" + network2genome(offspring);
        }

        return generation;
    }
    int buildGenome(const std::string& genome) override {
        Network fenotype = genome2network(genome);

        for (const auto& neuron : fenotype.neurons)
            m_network.registerNode(ActivationFunctions::SIGM, neuron.type);
        for (const auto& connection : fenotype.connections)
            m_network.registerConnection(connection.from, connection.to, connection.weight);

        return 37;
    }
};