#pragma once

#include <vector>
#include "CNeuron.hpp"
#include "ENeuronType.hpp"

class CNetwork {
private:
    std::vector<CNeuron> m_neurons;
    std::vector<size_t> m_in_neurons;
    std::vector<size_t> m_out_neurons;
public:
    void registerNode(std::function<double(double)>, ENeuronType);
    void registerConnection(size_t, size_t, double);
    std::vector<double> forward(const std::vector<double>&);
};