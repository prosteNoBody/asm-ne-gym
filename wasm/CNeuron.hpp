#include <vector>
#include <functional>
#include "CConnection.hpp"

class CConnection;

class CNeuron {
private:
    bool m_is_cached;
    double m_value;
    std::vector<CConnection> m_connections;
    std::function<double(double)> m_activation_function;
public:
    CNeuron(std::function<double(double)>);
    void registerConnection(const double weight, const CNeuron*);
    void clearValue();
    double getValue();
    void setValue(const double);
};