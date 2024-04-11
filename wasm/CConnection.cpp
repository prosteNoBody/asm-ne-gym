#include "CConnection.hpp"
#include "CNeuron.hpp"

CConnection::CConnection(double weight, size_t from): m_weight(weight), m_from(from) {};

double CConnection::getValue(std::vector<CNeuron>& neurons) {
    return neurons[m_from].getValue(neurons) * m_weight;
}