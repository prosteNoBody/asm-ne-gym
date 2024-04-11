#pragma once

#include <cmath>

class ActivationFunctions {
public:
    static double SIGM (double x) {
        return 1 / (1 + exp(-x));
    };
    static double TANH (double x) {
        return tanh(x);
    };
    static double RELU (double x) {
        return x > 0 ? x : 0;
    };
    static double LRELU (double x) {
        return x > 0 ? x : (0.01 * x);
    };
    static double GELU (double x) {
        return 0.5 * x * (1 + tanh(std::sqrt(2 / M_PI) * (x + 0.044715 * std::pow(x, 3))));
    };
    static double SIN (double x) {
        return sin(x);
    };
    static double COS (double x) {
        return cos(x);
    };
    static double ABS (double x) {
        return abs(x);
    };
    static double GAUS (double x) {
        return (1 / std::sqrt(2 * M_PI)) * exp(-0.5 * std::pow(x, 2));
    };
    static double IDENTITY (double x) {
        return x;
    };
    static double QUAD (double x) {
        return x * x;
    }
};