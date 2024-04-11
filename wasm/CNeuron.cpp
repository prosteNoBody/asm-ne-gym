#include <functional>
#include "CNeuron.hpp"

CNeuron::CNeuron(std::function<double(double)> activate_function):
                m_is_cached(false), m_activation_function(activate_function) {};

void CNeuron::registerConnection(double weight, size_t neuron_index) {
    m_connections.emplace_back(weight, neuron_index);
}

void CNeuron::clearValue() {
    m_is_cached = false;
}

void CNeuron::setValue(double value) {
    m_is_cached = true;
    m_value = value;
}

double CNeuron::getValue(std::vector<CNeuron>& neurons) {
    if (m_is_cached)
        return m_value;

    double acc = 0;
    for (auto& connection : m_connections)
        acc += connection.getValue(neurons);
    m_value = m_activation_function(acc);
    
    m_is_cached = true;
    return m_value;
}