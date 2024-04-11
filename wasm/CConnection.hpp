#pragma once

#include <vector>
#include <cstddef>

class CNeuron;

class CConnection {
private:
    double m_weight;
    size_t m_from;
public:
    CConnection(double, size_t);
    double getValue(std::vector<CNeuron>&);
};