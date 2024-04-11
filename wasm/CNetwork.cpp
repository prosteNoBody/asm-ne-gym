#include "CNetwork.hpp"

void CNetwork::registerNode(std::function<double(double)> activation_function, const ENeuronType type) {
    m_neurons.emplace_back(activation_function);
    CNeuron* neuron_ptr = &m_neurons[m_neurons.size() - 1]
    if (type == INPUT) {
        m_in_neurons.emplace_back(neuron_ptr);
    } else if (type == OUTPUT) {
        m_out_neurons.emplace_back(neuron_ptr);
    }
}

void CNetwrok::registerConnection(int from, int to, double weight) {
    m_connections.emplace_back(from, to, weight);
    m_neurons[to].registerConnection(weight, &m_neurons[from]);
}

std::vector<double> CNetwork::forward(const std::vector<double>& params) {
    // reset values
    for (auto& neuron : m_neurons) {
        neuron.clearValue();
    }

    // set initial values
    for (int i = 0; i < params.size(); i++)
        m_in_neurons[i]->setValue(params[i]);

    // calculate all output nodes with recursive algorithm (with dynamic programming for acceleration)
    std::vector<double> results;
    for (int i = 0; i < m_out_neurons.size(); i++)
        results.emplace_back(m_out_neurons[i]->getValue());

    return results;
}