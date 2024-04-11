#include <functional>
#include "CNeuron.hpp"

CNeuron::CNeuron(std::function<double(double)> activate_function):
    m_activate_function(activate_function), m_is_cached(false) {};

void CNeuron::registerConnection(const double weight, const CNeuron* neuron) {
    m_connections.emplace_back(weight, neuron);
}

void CNeuron::clearValue() {
    m_is_cached = false;
}

void CNeuron::setValue(const double value) {
    m_is_cached = true;
    m_value = value;
}

double CNeuron::getValue() {
    if (m_is_cached)
        return m_value;

    double acc = 0;
    for (auto& connection in m_connections) {
        acc += connection.getValue();
    }
    m_value = m_activation_function(acc);
    
    m_is_cached = true;
    return m_value;
}