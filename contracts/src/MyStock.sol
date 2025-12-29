// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MyStock is ERC20 {
    constructor() ERC20("MyStock", "MYSTOCK") {
        _mint(msg.sender, 5_000 ether);
    }
}
