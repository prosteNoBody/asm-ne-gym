class CNeuron;

class CConnection {
private:
    double m_weight;
    CNeuron* m_from;
public:
    CConnection(const double, const CNeuron*);
    double getValue();
};