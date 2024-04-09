#include <vector>
#include <functional>
#include <cmath>
#include "CConnection.hpp"

enum ENeuronType {
    INPUT,
    HIDDEN,
    OUTPUT,
};

class CNeuron {
private:
    ENeuronType m_type;
    bool m_is_cached;
    double m_value;
    std::vector<CConnection> m_connections;
    std::function<double(double)> m_activation_function;
    double calculateNeuronValue ();
public:
    CNeuron(std::function<double(double)>, ENeuronType);
    void registerConnection(double weight, CNeuron*);
    void clearValue();
    double getValue();
    void setValue(double);
};