// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialRecoveryWallet{
    address public owner; //此 Wallet 的帳戶擁有者
    uint public totalDepositAmount ; //帳戶總金額（wei 單位）
    uint public threshold; //閾值，要多少 guardian 同意
    bool public isRecovering; // 現在是否是在“帳戶恢復”階段
    uint public currRecoveryRound; // 現在已經是第幾次的恢復
    address[] public guardians;
    /*
    如果此 guardian 已經被刪除，那 value 則為 false
    如果此 guardian 已經被加入，那 value 則為 true
    */
    struct RecoverInfo {
        uint recoveryRound; // 當前是第幾輪
        address newOwnerAddr; // 將要轉移給哪個新 Owner 的地址
        bool used; // 這位 Guardian 對這輪 Recover 之同意已經被使用過了，則設為 true
                   // 也就是當 executeRecovery 執行後，無論該輪 Recovery 成功與否都會設為 true
                   // 此次表態之後便不能再用了
    }
    mapping(address => bool) isGuardian; //紀錄哪些其他帳戶是此 Wallet 的監護人
    mapping(address => uint256) public guardianRemovalPeriod; // 紀錄每個監護人何時會被移除
    mapping(address => RecoverInfo) public guardianToRecovery; // 監護人所發出的“恢復”資訊
    

    modifier onlyOwner() { //檢查是不是 sender 是否等於 owner address (因為有權限只有 owner 能做)
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    modifier onlyGuardian() { //檢查是不是 sender 是否等於 guardian address  (因為有權限只有 guardian 能做)
        require(isGuardian[msg.sender] == true, "Only guardians can perform this action");
        _;
    }
    modifier onlyInRecovery() { //檢查現在是在帳戶恢復狀態
        require(isRecovering == true, "Only during the recovery process");
        _;
    }
    event RecoveryStart(address contractAddress, address initator,  uint currentRecoveryRound, uint threshold);
    event GuardianSupportRecovery(address contractAddress, uint currentRecoveryRound, address guardianAddr, address newOwnerAddr);
    event RecoverySuccess(address contractAddress, address oldOwnerAddr, address newOwnerAddr);
    event RemoveGuardianSuccess(address contractAddress, address removeOldGuardian, address AddNewGuardian);
    event DepositMoneySuccess(address contractAddress, uint totalether, uint deposit);
    event WithdrawMoneySuccess(address contractAddress, uint totalether, uint withdraw);

    constructor(uint _threshold, address[] memory _initialGuardians) {
        owner = msg.sender; //部署合約者是初始 Wallet 的帳戶擁有者
        threshold = _threshold; // 輸入進去的閾值，就是有多少閾值的 Guardian 同意，即可以改變 owner 變數
        require(_initialGuardians.length >= _threshold,"Initial guardian amount can't less than threshold number");
        // 設置初始的 guardian
        for (uint i = 0; i < _initialGuardians.length; i++) {
            address guardian = _initialGuardians[i];
            guardians.push(_initialGuardians[i]);
            isGuardian[guardian] = true;
        }
        totalDepositAmount = 0;
    }
    function depositMoney() external payable onlyOwner{
        require(!isRecovering, "Cannot send transaction during recovery process");
        totalDepositAmount += msg.value;
        emit DepositMoneySuccess(address(this), totalDepositAmount, msg.value);
    }
    function withdrawMoney(uint withdrawValue) external payable onlyOwner{
        require(!isRecovering, "Cannot send transaction during recovery process");
        require(totalDepositAmount>=withdrawValue, "Cannot not withdraw more than total deposit amount");
        totalDepositAmount -= withdrawValue;
        payable(owner).transfer(withdrawValue);
        emit WithdrawMoneySuccess(address(this), totalDepositAmount, withdrawValue);
    }
    function getBalance() external view returns(uint balance){
        return(totalDepositAmount);
    }
    function getAllGuardianList() external view returns(address[] memory){
        return(guardians);
    }
    function getGuardianRemovalPeriod(address guardian) external view returns(uint){
        return(guardianRemovalPeriod[guardian]);
    }
    function removeGuardian(address removingGuardian) external onlyOwner {
        // 將 Removal Period 設定為當前 timestamp + 1 Days (86400)
        // 測試用: 將 Removal Period 設定為當前 timestamp + 10 秒
        uint256 currentTimestamp = block.timestamp;
        guardianRemovalPeriod[removingGuardian] = currentTimestamp + 10;
    }
    function executeGuardianRemoval(address removingGuardian, address newGuardian) external onlyOwner {
        // 確認 oldGuardian 正在移除的排程中
        require(guardianRemovalPeriod[removingGuardian] != 0, "Guardian removal not scheduled");
        // 確認 Removal Period 已經過了
        uint256 currentTimestamp = block.timestamp;
        require(currentTimestamp > guardianRemovalPeriod[removingGuardian], "Guardian removal period not passed");
        // 檢查 new Guardian  尚未加入過
        require(isGuardian[newGuardian]==false, "New guardian was already been guardian before");
        // 重置 Removal Period Timestamp 為 0 (means not in Removal Period)
        guardianRemovalPeriod[removingGuardian] = 0;
        // 設定 Guardian Data Structures
        isGuardian[removingGuardian] = false;
        isGuardian[newGuardian] = true;
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == removingGuardian) {
                // 將最後一個元素移到要移除的元素位置，然後縮減數組長度
                guardians[i] = guardians[guardians.length - 1];
                guardians.pop();
            }
        }
        guardians.push(newGuardian);
        emit RemoveGuardianSuccess(address(this), removingGuardian, newGuardian);
    }
    function cancelGuardianRemoval(address removingGuardian) onlyOwner external {
        // 重置 Removal Period Timestamp 為 0 (means not in Removal Period)
        guardianRemovalPeriod[removingGuardian] = 0;
    }
    function transferGuardian(address newGuardian) external onlyGuardian{
       // 確認當前帳戶狀態並非正在 Recovery Period
       require(!isRecovering, "Cannot transfer guardian during recovery process");
       // 確認 msg.sender（被轉移的 Guardian） 並非處在 Removal Period
       require(guardianRemovalPeriod[msg.sender] == 0, "Guardian is in removal period");
       // 設定 Guardian Data Structures
       isGuardian[newGuardian] = true;
       isGuardian[msg.sender] = false;
       for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == msg.sender) {
                // 將最後一個元素移到要移除的元素位置，然後縮減數組長度
                guardians[i] = guardians[guardians.length - 1];
                guardians.pop();
            }
        }
        guardians.push(newGuardian);
    }
    // Guardian 發起一輪新的 Recovery
    function initiateRecovery(address _newOwnerAddr) onlyGuardian external {
       // 檢查當前並不在 Recovering（check isRecovering == false）
       require(isRecovering == false,"Already in the recovery process");
       // 輪次加一
       currRecoveryRound += 1;
       // 現在進入恢復階段
       isRecovering = true;
       // 設定 guardianToRecovery[msg.sender] 的資料內容
       guardianToRecovery[msg.sender] = RecoverInfo(currRecoveryRound, _newOwnerAddr, false);
       emit RecoveryStart(address(this), msg.sender,  currRecoveryRound, threshold);
    }
    // Guardian 對當前的 Recovery 表態支持
    function supportRecovery(address _newOwnerAddr) onlyGuardian onlyInRecovery external {
       // 設定 guardianToRecovery[msg.sender] 的資料內容
       guardianToRecovery[msg.sender].recoveryRound = currRecoveryRound;
       guardianToRecovery[msg.sender].newOwnerAddr = _newOwnerAddr;
       guardianToRecovery[msg.sender].used = false;
       emit GuardianSupportRecovery(address(this), currRecoveryRound, msg.sender, _newOwnerAddr);
    }
    // Owner 擁有絕對的帳戶控制權，因此他可以隨時取消 Recovery 的行為
    function cancelRecovery() onlyOwner onlyInRecovery external {
        // 取消“恢復”變數
        isRecovering = false;
    }
    // 執行 Recovery
    function executeRecovery(address newOwner, address[] calldata guardianList) onlyGuardian onlyInRecovery external {
        // 確認 guardianList 長度大於 threshold
        require(guardianList.length >= threshold, "Insufficient guardians");
        address oldOwner = owner;
        uint supportCount = 0;
        bool somethingWrong = false;
        uint index = 0;
        for (uint i = 0; i < guardianList.length; i++) {
            address guardian = guardianList[i];
            // 確認每一個傳入的地址真的是 Guardian
            if(isGuardian[guardian]==true){
                // 確認該 Guardian 的當前表態尚未被使用過，檢查 used == false
                if(!guardianToRecovery[guardian].used){
                    // 確認該 Guardian 有對「這輪」進行表態，檢查 RecoveryRound == currRecoveryRound
                    if(guardianToRecovery[guardian].recoveryRound == currRecoveryRound){
                        // 確認該 Guardian 有對「這個新擁有者地址」進行表態，檢查 newOwnerAddr == newOwner
                        if(guardianToRecovery[guardian].newOwnerAddr == newOwner){
                            // 設定該 Guardian 的當前表態為已經使用過，設 used = true
                            guardianToRecovery[guardian].used = true;
                            supportCount++;
                        }else{
                            index = i;
                            somethingWrong = true;
                            break;
                        }
                    }else{
                        index = i;
                        somethingWrong = true;
                        break;
                    }
                }else{
                    index = i;
                    somethingWrong = true;
                    break;
                }
            }else{
                index = i;
                somethingWrong = true;
                break;
            }
        }
        if(somethingWrong){
            for (uint i = 0; i < index; i++) {
                address guardian = guardianList[i];
                guardianToRecovery[guardian].used = false;
            }
        }
        require(supportCount >= threshold, "Insufficient support");
        // 以上遍歷過程如果出現錯誤就會 Revert，如果能執行至此表示通過該輪 Recovery
        isRecovering = false;
        // 改變 Owner 的變數
        owner = newOwner;
        emit RecoverySuccess(address(this), oldOwner, newOwner);
    }
    function getIsGuardianOrNot(address guardian) external view returns(bool isGuard){
        isGuard = isGuardian[guardian];
        return(isGuard);
    }
    function getGuardianSupportNewOwner(address guardian) external view returns(address newOwner){
        return(guardianToRecovery[guardian].newOwnerAddr);
    }
}


// 以下寫法可能的攻擊手法
/*
    function executeRecovery(address newOwner, address[] calldata guardianList) onlyGuardian onlyInRecovery external {
        // 確認 guardianList 長度大於 threshold
        require(guardianList.length >= threshold, "Insufficient guardians");
        uint supportCount = 0;
        for (uint i = 0; i < guardianList.length; i++) {
            address guardian = guardianList[i];
            // 確認每一個傳入的地址真的是 Guardian
            require(isGuardian[guardian], "Invalid guardian");
            // 確認該 Guardian 的當前表態尚未被使用過，檢查 used == false
            require(!guardianToRecovery[guardian].used, "Recovery support already used");
            // 確認該 Guardian 有對「這輪」進行表態，檢查 RecoveryRound == currRecoveryRound
            require(guardianToRecovery[guardian].recoveryRound == currRecoveryRound, "Invalid recovery round");
            // 確認該 Guardian 有對「這個新擁有者地址」進行表態，檢查 newOwnerAddr == newOwner
            require(guardianToRecovery[guardian].newOwnerAddr == newOwner, "Invalid new owner address");
            // 設定該 Guardian 的當前表態為已經使用過，設 used = true
            guardianToRecovery[guardian].used = true;
            supportCount++;
        }
        require(supportCount >= threshold, "Insufficient support");
        // 以上遍歷過程如果出現錯誤就會 Revert，如果能執行至此表示通過該輪 Recovery
        isRecovering = false;
        // 改變 Owner 的變數
        owner = newOwner;
    }
*/
// 惡意 guardian 即使只有一個人，他也可以阻止 owner 變數被改變
// 攻擊方法： 他可以將善意 guardians 所提交的 Support，放入自己 address 陣列的靠前面元素
//          並且在要提交的 addree 陣列中的 threshold - 1 位置的元素放上自己的錯誤 Support
//          這樣當 for 迴圈檢查到第threshold - 1 位置時就會報錯回傳，至於之前元素已經被修正為使用過
//          等於善意 guardian 不斷提交正確 owner 變數，但是惡意 guardian 不斷將其消耗但又不過閾值的方法攻擊

// 解決方案：
//       改成以下方案後，雖然 gas 變貴，但是可以有效制止以上攻擊，暫少數的惡意 Guardian 即便用此消耗也沒用，反而還賠上許多 gas 費用




