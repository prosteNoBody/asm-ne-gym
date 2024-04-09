#include "CConnection.hpp"

CConnection::CConnection(double weight, CNeuron* from): m_weight(weight), m_from(from) {};

double CConnection::getValue() {
    return m_from->getValue() * m_weight;
}