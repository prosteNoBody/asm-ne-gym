#include <iostream>
#include "CNetwork.hpp"

void CNetwork::registerNode(std::function<double(double)> activation_function, ENeuronType type) {
    m_neurons.emplace_back(activation_function);
    size_t neuron_index = m_neurons.size() - 1;
    if (type == ENeuronType::INPUT)
        m_in_neurons.emplace_back(neuron_index);
    else if (type == ENeuronType::OUTPUT)
        m_out_neurons.emplace_back(neuron_index);
}

void CNetwork::registerConnection(size_t from, size_t to, double weight) {
    m_neurons[to].registerConnection(weight, from);
}

std::vector<double> CNetwork::forward(const std::vector<double>& params) {
    // reset values
    for (auto& neuron : m_neurons)
        neuron.clearValue();

    // set initial values
    for (size_t i = 0; i < params.size(); i++)
        m_neurons[m_in_neurons[i]].setValue(params[i]);

    // calculate all output nodes with recursive algorithm (with dynamic programming for acceleration)
    std::vector<double> results;
    for (size_t i = 0; i < m_out_neurons.size(); i++)
        results.emplace_back(m_neurons[m_out_neurons[i]].getValue(m_neurons));

    return results;
}