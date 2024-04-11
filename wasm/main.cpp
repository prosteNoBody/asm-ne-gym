#include <iostream>
#include <vector>
#include "CNetwork.hpp"
#include "Utils.hpp"

int main () {
    CNetwork network;
    network.registerNode(ActivationFunctions::SIGM, INPUT);
    network.registerNode(ActivationFunctions::SIGM, OUTPUT);
    network.registerConnection(0, 1, 0.5);
    std::vector<double> result = network.forward({ 1 });
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value;
    std::cout << std::endl;
}