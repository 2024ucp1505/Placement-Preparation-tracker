#include<bits/stdc++.h>
using namespace std;

class Fraction{
    public:
        virtual void func1(){
            cout<<"Base";
        }
};

class Derived : public Fraction{
    public:
        void func1() override{
            cout<<"Dervied";
        }
};

class ComplexNum{
    private:
        int r , i;
    public:
        // ComplexNum(int r , int i = 0):r(r) , i(i) {}
        // ComplexNum operator+(const ComplexNum& other){
        //     return ComplexNum(this->r+other.r , this->i+other.i);
        // }
        friend istream& operator>>(istream& os , ComplexNum& num);
};

istream& operator>>(istream& os , ComplexNum& num){
    os>>num.r>>num.i;
    return os;
}

class B{
    public:
        int x;
        virtual void func(){cout<<"BASE\n";}
};

class D: public B{
    public:
        int y;
        void func() override {cout<<"DER\n";}
};


class Temp {
public:
    Temp()            { cout << "C "; }
    Temp(const Temp&) { cout << "CC "; }
    ~Temp()           { cout << "D "; }
};

Temp createTemp() {
    Temp t;
    return t;
}

int main() {
    Temp t = createTemp();
    cout << "END ";
    return 0;
}
