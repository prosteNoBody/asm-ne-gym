#include "CConnection.hpp"

CConnection::CConnection(const double weight, const CNeuron* from): m_weight(weight), m_from(from) {};

double CConnection::getValue() {
    return m_from->getValue() * m_weight;
}