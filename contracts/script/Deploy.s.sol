// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {USDX} from "../src/UDSX.sol";
import {MyStock} from "../src/MyStock.sol";

contract Deploy is Script {
    function run() external {

        address buyer = vm.envAddress("BUYER");
        address seller = vm.envAddress("SELLER");

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        USDX usdx = new USDX();
        MyStock stock = new MyStock();

        // Distribute
        usdx.transfer(buyer, 1000 ether);
        stock.transfer(seller, 5000 ether);

        vm.stopBroadcast();

        console2.log("USDX:", address(usdx));
        console2.log("MyStock:", address(stock));
        console2.log("Buyer:", buyer);
        console2.log("Seller:", seller);
    }
}
