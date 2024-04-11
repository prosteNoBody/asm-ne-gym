#include <vector>
#include "ENeuronType.hpp"
#include "CNeuron.hpp"

class CNetwork {
private:
    std::vector<CNeuron> m_neurons;
    std::vector<CNeuron*> m_in_neurons;
    std::vector<CNeuron*> m_out_neurons;
public:
    void registerNode(std::function<double(double)>, const ENeuronType);
    void registerConnection(const int, const int, const double);
    std::vector<double> forward(const std::vector<double>&);
};