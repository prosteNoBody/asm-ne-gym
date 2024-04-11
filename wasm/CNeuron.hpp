#pragma once

#include <vector>
#include <functional>
#include "CConnection.hpp"

class CNeuron {
private:
    bool m_is_cached;
    double m_value;
    std::vector<CConnection> m_connections;
    std::function<double(double)> m_activation_function;
public:
    CNeuron(std::function<double(double)>);
    void registerConnection(double, size_t);
    void clearValue();
    double getValue(std::vector<CNeuron>&);
    void setValue(double);
};