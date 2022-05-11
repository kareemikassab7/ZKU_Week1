pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template LessThan10() {
    signal input in; //take one input
    signal output out;

    component lt = LessThan(32); 

    lt.in[0] <== in; // give the template instace our template's input
    lt.in[1] <== 10; // 

    out <== lt.out;
}