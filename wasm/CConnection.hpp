#include "CNeuron.hpp"

class CConnection {
private:
    double m_weight;
    CNeuron* m_from;
public:
    CConnection(double, CNeuron*);
    double getValue();
};