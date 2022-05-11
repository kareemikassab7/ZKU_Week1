const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");


function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        // pass a as 1 and b as 2 to the hello world circuit. the output proof is stored in proof and the output of the circuit signal is in public Signals
        console.log('1x2 =',publicSignals[0]);
        // prints "1x2= [result]" and the result here shall be 2
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // this is usually used to be able to visualize the actual numbers because libraries handle them in formats that are not desirable to us. here we convert from string to big int.
        const editedProof = unstringifyBigInts(proof);
        // we do same unstringify but to proof
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        // solidity uses big ints, and now we take our 2 values in their big int formats as call data.
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        //  separate elements, replace brackets with none, and convert to strings
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        // put each value in a variable respectively
        // this is where it checks if its s
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2", "c": "3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        //print on the screen 1x2x3 = 6
        console.log('1x2x3 =',publicSignals[0]);

        //unstringifyBigInts to convert to big int for the calldata of solidity
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];        
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
        
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});

///////////////////////////////////////////////////////////////////////////////////////

describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier__plonk");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2", "c": "3"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_plonk_js/Multiplier3_plonk.wasm","contracts/circuits/Multiplier3_plonk/Multiplier3_plonk.zkey");
        //print on the screen 1x2x3 = 6
        console.log('1x2x3 =',publicSignals[0]);

        // unstringifyBigInts to convert to big int for the calldata of solidity
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);


        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        calldataSplit = calldata.split(',');
        const proofFormatted = calldataSplit[0]
const publicSignalsFormatted = JSON.parse(calldataSplit[1]).map(x => BigInt(x).toString())

expect(await verifier.verifyProof(proofFormatted, publicSignalsFormatted)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x00';
        let b = ['0'];
        expect(await verifier.verifyProof(a, b)).to.be.false;
        /*let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;*/
    });
});