#include <string>
#include <sstream>
#include <random>
#include "../Utils.hpp"
#include "../CNeuroevolutionBase.hpp"

#define BEST_PERCENTAGE_NEAT 0.15

class Neat: public CNeuroevolutionBase {
private:
    struct Connection {
        int from;
        int to;
        double weight;
        int disabled;
        int historical_marking;
        Connection(int from, int to, double weight, int disabled, int historical_marking)
            : from(from), to(to), weight(weight), disabled(disabled), historical_marking(historical_marking) {};
    };
    struct Neuron {
        ENeuronType type;
        std::vector<int> inputs;
        Neuron(ENeuronType type): type(type) {};
    };
    struct Network {
        int historical_marking = -1;
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

        // connections
        for (const auto& neuronType : parts[0]) {
            switch (neuronType) {
                case 'I':
                    network.neurons.emplace_back(ENeuronType::INPUT);
                    break;
                case 'H':
                    network.neurons.emplace_back(ENeuronType::HIDDEN);
                    break;
                case 'O':
                    network.neurons.emplace_back(ENeuronType::OUTPUT);
                    break;
            }
        }

        // connections
        std::istringstream iss_connections(parts[1]);
        while (std::getline(iss_connections, tmp, ';')) {
            std::string tmp2;
            std::vector<std::string> connection_params;
            std::istringstream iss_connection(tmp);
            while (std::getline(iss_connection, tmp2, ','))
                connection_params.emplace_back(tmp2);

            int from = std::stoi(connection_params[0]);
            int to = std::stoi(connection_params[1]);
            double weight = std::stod(connection_params[2]);
            int historical_marking = std::stoi(connection_params[3]);
            int disabled = std::stoi(connection_params[4]);

            network.connections.emplace_back(from, to, weight, disabled, historical_marking);
        }

        // get maximum historical marking
        for (const auto& connection : network.connections)
            if (connection.historical_marking > network.historical_marking)
                network.historical_marking = connection.historical_marking;
        network.historical_marking++;

        // load input to neuron
        for (const auto& connection : network.connections)
            network.neurons[connection.to].inputs.emplace_back(connection.from);

        return network;
    }
    std::string network2genome(const Network& network) const {
        std::string genome;

        // neurons
        for (const auto& neuron : network.neurons) {
            switch (neuron.type) {
                case ENeuronType::INPUT:
                    genome += "I";
                    break;
                case ENeuronType::HIDDEN:
                    genome += "H";
                    break;
                case ENeuronType::OUTPUT:
                    genome += "O";
                    break;
            }
        }

        // connections
        genome += "|";
        for (const auto& connection : network.connections) {
            genome += std::to_string(connection.from) + ',';
            genome += std::to_string(connection.to) + ',';
            genome += std::to_string(connection.weight) + ',';
            genome += std::to_string(connection.historical_marking) + ',';
            genome += std::to_string(connection.disabled);
            genome += ';';
        }
        genome.pop_back();

        return genome;
    }

    Network crossover(const Network& ntw_winner, const Network& ntw_loser, int* hist_mark) const {
        Network offspring;
        // copy from fitter parent
        offspring.neurons = ntw_winner.neurons;
        offspring.historical_marking = *hist_mark;

        // copy connections
        auto win_conn_it = ntw_winner.connections.begin();
        auto los_conn_it = ntw_loser.connections.begin();

        while (true) {
            if (win_conn_it == ntw_winner.connections.end() || los_conn_it == ntw_loser.connections.end())
                break;
            
            int win_hist_mark = win_conn_it->historical_marking;
            int los_hist_mark = los_conn_it->historical_marking;

            // same genope - pick randomly from one parent
            if (win_hist_mark == los_hist_mark) {
                bool takeWin = (std::rand() % 2) == 0;
                if (takeWin)
                    offspring.connections.emplace_back(
                        los_conn_it->from, los_conn_it->to, los_conn_it->weight, los_conn_it->disabled, los_conn_it->historical_marking
                    );
                else
                    offspring.connections.emplace_back(
                        win_conn_it->from, win_conn_it->to, win_conn_it->weight, win_conn_it->disabled, win_conn_it->historical_marking
                    );

                win_conn_it++;
                los_conn_it++;
                continue;
            }

            // add winner disjunctive genome
            if (win_hist_mark < los_hist_mark) {
                offspring.connections.emplace_back(
                    win_conn_it->from, win_conn_it->to, win_conn_it->weight, win_conn_it->disabled, win_conn_it->historical_marking
                );
                win_conn_it++;
                continue;
            }

            // skip losser disjunctive genome
            if (win_hist_mark > los_hist_mark) {
                los_conn_it++;
                continue;
            }
        }

        // copy exceed connection from winner
        while (win_conn_it != ntw_winner.connections.end()) {
            offspring.connections.emplace_back(
                win_conn_it->from, win_conn_it->to, win_conn_it->weight, win_conn_it->disabled, win_conn_it->historical_marking
            );
            win_conn_it++;
        }

        return offspring;
    }
    void mutate(Network& network, int* hist_mark) const {
        int mutation = std::rand() % 100;
        if (mutation < 83)
            mutateConnection(network);
        else if (mutation < 97)
            addConnection(network, hist_mark);
        else
            addNode(network, hist_mark);
    }
    void mutateConnection(Network& network) const {
        double newWeight = (static_cast<double>(std::rand()) / RAND_MAX) * 20 - 10;
        int randomConnection = std::rand() % network.connections.size();

        network.connections[randomConnection].weight = newWeight;
    }
    void addNode(Network& network, int* hist_mark) const {
        int randomConnection = std::rand() % network.connections.size();

        // add hidden neuron + disable connection
        network.connections[randomConnection].disabled = 1;
        network.neurons.emplace_back(ENeuronType::HIDDEN);
        network.neurons[network.neurons.size() - 1].inputs.emplace_back(network.connections[randomConnection].from);

        // add new connections
        size_t neuron_index = network.neurons.size() - 1;
        int from = network.connections[randomConnection].from;
        int to = network.connections[randomConnection].to;
        network.connections.emplace_back(from, neuron_index, 1, 0, *hist_mark);
        (*hist_mark)++;
        network.connections.emplace_back(neuron_index, to, 1, 0, *hist_mark);
        (*hist_mark)++;
    }
    void addConnection(Network& network, int* hist_mark) const {
        // `i` attempts to add connection
        for (int i = 0; i < 5; i++) {
            int from = std::rand() % network.neurons.size();
            int to = std::rand() % network.neurons.size();

            if (network.neurons[to].type == ENeuronType::INPUT || network.neurons[from].type == ENeuronType::OUTPUT)
                continue;

            if (isCyclicConnection(network, from ,to))
                continue;
            
            network.connections.emplace_back(from, to, 1, 0, *hist_mark);
            (*hist_mark)++;
            break;
        }
    }
    bool isCyclicConnection(Network& network, int from, int to) const {
        if (from == to) return true;

        if (network.neurons[from].type == ENeuronType::INPUT)
            return false;
        
        for (auto input_neurons_index : network.neurons[from].inputs) {
            if (isCyclicConnection(network, input_neurons_index, to)) return true;
        }

        return false;
    }
public:
    std::string getName() const override { return "NEAT"; };

    // hyperparameters
    // [0] - input neurons
    // [1] - output neurons
    // [2] - population size
    // [3] - mutation rate
    //
    // genome contains neurons with their type (input, output, hidden)
    // after that, there are connections, which have disabled parameter and historical marking
    // nodes and connections are separed by '|'
    // example genotype - `IHO|0,1,0.5,0,1;1,2,0.5,1,1`
    std::string initialPopulation(const std::vector<double>& hyperparameters) const override {
        int inputNeurons = hyperparameters[0];
        int outputNeurons = hyperparameters[1];
        int populationSize = hyperparameters[2];

        // create minimal inital genome
        Network fenotype;
        for (int i = 0; i < inputNeurons; i++)
            fenotype.neurons.emplace_back(ENeuronType::INPUT);
        for (int i = 0; i < outputNeurons; i++)
            fenotype.neurons.emplace_back(ENeuronType::OUTPUT);

        int historical_marking = 0;
        for (int i = 0; i < inputNeurons; i++) {
            for (int j = 0; j < outputNeurons; j++) {
                fenotype.connections.emplace_back(i, inputNeurons + j, 1, 1, historical_marking++);
            }
        }
        std::string genome = network2genome(fenotype);

        // multiply genome to create generation
        std::string population;
        for (int i = 0; i < populationSize; i++)
            population += "&" + genome;
        return population;
    };
    std::string generateGeneration(const std::vector<double>& hyperparameters, const std::vector<double>& fitness, const std::string& population) const override {
        std::string tmp;
        std::istringstream iss_population(population);
        iss_population.ignore(1);

        // hyperparametrs
        int populationSize = hyperparameters[2];
        double mutationRate = hyperparameters[3];

        // split population to genomes
        std::vector<std::string> genomes;
        while (std::getline(iss_population, tmp, '&'))
            genomes.emplace_back(tmp);

        // keep only best genomes
        size_t bestCnt = std::ceil(genomes.size() * BEST_PERCENTAGE_NEAT);
        genomes.erase(genomes.begin() + bestCnt, genomes.end());

        // convert to fenotype
        std::vector<Network> fenotypes;
        for (std::string genome : genomes)
            fenotypes.emplace_back(genome2network(genome));

        int historical_mark = -1;
        for (auto& fenotype : fenotypes)
            if (fenotype.historical_marking > historical_mark)
                historical_mark = fenotype.historical_marking;

        // generate new generation
        std::string generation;
        // random dist
        std::random_device rd;
        std::mt19937 gen(rd());
        std::discrete_distribution dist(fitness.begin(), fitness.begin() + bestCnt);
        for (int i = 0; i < populationSize; i++) {
            // select parents
            int p1_index = dist(gen);
            int p2_index = dist(gen);
            if (p1_index < p2_index) {
                int tmp = p1_index;
                p1_index = p2_index;
                p2_index = tmp;
            }
            Network& parent1 = fenotypes.at(p1_index);
            Network& parent2 = fenotypes.at(p2_index);

            // create offspring
            Network offspring = crossover(parent1, parent2, &historical_mark);

            // apply mutation
            bool doesMutate = (std::rand() % static_cast<int>(std::ceil(1 / mutationRate))) == 0;
            if (doesMutate)
                mutate(offspring, &historical_mark);

            generation += "&" + network2genome(offspring);
        }

        return generation;
    }


    int buildGenome(const std::string& genome) override {
        Network network = genome2network(genome);

        for (const auto& neurons : network.neurons)
            m_network.registerNode(ActivationFunctions::SIGM, neurons.type);

        for (const auto& connection : network.connections)
            if (!connection.disabled)
                m_network.registerConnection(connection.from, connection.to, connection.weight);

        return 0;
    }
};