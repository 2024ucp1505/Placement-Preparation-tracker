#include<bits/stdc++.h>
using namespace std;
class car{
    public:
    string brand;
    int speed;
    Car(){}
    
};

int main(){
    car c1;
    car* c2 = new car();
    c1.brand = "BUGGATI";
    cout<<sizeof(c1)<<"\n";
    cout<<sizeof(*c2);
    delete c2;
}