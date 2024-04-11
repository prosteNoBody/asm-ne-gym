#include <iostream>
#include <vector>
#include "CNetwork.hpp"
#include "Utils.hpp"

int main () {
    CNetwork network;
    network.registerNode(ActivationFunctions::SIGM, INPUT);
    network.registerNode(ActivationFunctions::SIGM, INPUT);
    network.registerNode(ActivationFunctions::SIGM, HIDDEN);
    network.registerNode(ActivationFunctions::SIGM, OUTPUT);
    network.registerConnection(0, 2, 1);
    network.registerConnection(1, 2, 1);
    network.registerConnection(2, 3, 1);
    std::vector<double> params = { 1, 2 };
    std::vector<double> result = network.forward(params);
    std::cout << "Result: ";
    for (auto value : result)
        std::cout << value;
    std::cout << std::endl;
}