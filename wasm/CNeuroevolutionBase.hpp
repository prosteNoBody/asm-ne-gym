#pragma once

#include <string>
#include <vector>
#include "CNetwork.hpp"

class CNeuroevolutionBase {
protected:
    CNetwork m_network;
public:
    virtual ~CNeuroevolutionBase() {};

    // name
    virtual std::string getName() const = 0;

    // managing population
    virtual std::string initialPopulation(const std::vector<double>&) const = 0;
    virtual std::string generateGeneration(const std::vector<double>&, const std::string&) const = 0;
    
    // network managment
    virtual int buildGenome(const std::string& genome) = 0;
    std::vector<double> forward(const std::vector<double>& inputs) {
        return m_network.forward(inputs);
    };
};