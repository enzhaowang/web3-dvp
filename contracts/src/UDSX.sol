// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract USDX is ERC20 {
    constructor() ERC20("USDX", "USDX") {
        _mint(msg.sender, 1_000_000 ether);
    }
}
