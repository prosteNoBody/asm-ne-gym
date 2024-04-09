#include "CConnection.hpp"
#include "CNeuron.hpp"
#include <vector>

class CNetwork {
private:
    std::vector<CNeuron> m_neurons;
    std::vector<CNeuron*> m_in_neurons;
    std::vector<CNeuron*> m_out_neurons;
public:
    void registerNode();
    void forward();
};