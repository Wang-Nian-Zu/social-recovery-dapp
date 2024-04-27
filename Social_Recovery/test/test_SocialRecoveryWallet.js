// https://medium.com/fluidity/standing-the-time-of-test-b906fcc374a9
const helper = require('./utils/utils.js');
const SocialRecoveryWallet = artifacts.require("SocialRecoveryWallet");

contract("SocialRecoveryWallet", (accounts) => {
  let socialRecoveryWalletInstance;
  let snapshotId;
  let owner = accounts[0];
  let guardian1 = accounts[1];
  let guardian2 = accounts[2];
  let guardian3 = accounts[3];
  let newOwner = accounts[4];
  let initialGuardians = [guardian1,guardian2,guardian3];

  before('deploy SocialRecoveryWallet', async()=>{
    // 部署合约
    socialRecoveryWalletInstance = await SocialRecoveryWallet.new(2,initialGuardians); // 2 作為閾值
  });
  // 在每個测試運行之前都會執行 beforeEach
  beforeEach(async () => {
    snapShot = await helper.takeSnapshot();
    snapshotId = snapShot['result']
  });
  afterEach(async () => {
    // 恢復快照
    await helper.revertToSnapShot(snapshotId);
  });
  it("should initiate recovery process", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    const recoveryInfo = await socialRecoveryWalletInstance.guardianToRecovery(guardian1);
    assert.equal(recoveryInfo.newOwnerAddr, newOwner, "Recovery initiation failed");
  });
  it("should support recovery process", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    const recoveryInfo = await socialRecoveryWalletInstance.guardianToRecovery(guardian2);
    assert.equal(recoveryInfo.newOwnerAddr, newOwner, "Recovery support failed");
  });
  it("should execute recovery process", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian1, guardian2], { from: guardian1 });
    const walletOwner = await socialRecoveryWalletInstance.owner();
    assert.equal(walletOwner, newOwner, "Recovery execution failed");
  });
  it("should not allow recovery initiation if already in recovery process", async () => {
    // guardian1 初始化 recovery
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1});
    // 再次嘗試初始化 recovery，應該會拋出錯誤
    try{
      await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian2});
      assert.fail("should not allow recovery initiation if already in recovery process");
    }catch(error){
      assert(error.message.includes("Already in the recovery process"), "Unexpected error message");
    }
  });
  it("should prevent non-guardians from initiating recovery", async () => {
    try {
      await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: owner });
      assert.fail("Initiated recovery by non-guardian");
    } catch (error) {
      assert(error.message.includes("Only guardians can perform this action"), "Unexpected error message");
    }
  });
  it("should prevent non-guardians from supporting recovery", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    try {
      await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: owner });
      assert.fail("Supported recovery by non-guardian");
    } catch (error) {
      assert(error.message.includes("Only guardians can perform this action"), "Unexpected error message");
    }
  });
  it("should prevent non-guardians from executing recovery", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    try {
      await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian1, guardian2], { from: owner });
      assert.fail("Executed recovery by non-guardian");
    } catch (error) {
      assert(error.message.includes("Only guardians can perform this action"), "Unexpected error message");
    }
  });
  it("should prevent recovery if threshold not met", async () => {
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    try {
      await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian1], { from: guardian1 });
      assert.fail("Executed recovery without meeting threshold");
    } catch (error) {
      assert(error.message.includes("Insufficient guardians"), "Unexpected error message");
    }
  });
  it("should allow only owner to remove guardian", async () => {
    const nonOwner = accounts[1]; // 假設這個帳戶不是 owner
    const guardianToRemove = accounts[2];
    // 部署合約時已經將帳戶0設為所有者，這裡嘗試用帳戶1刪除守護者
    try {
      await socialRecoveryWalletInstance.removeGuardian(guardianToRemove, { from: nonOwner })
      assert.fail("should allow only owner to remove guardian");
    } catch (error) {
      assert(error.message.includes("Only owner can perform this action"), "Unexpected error message");
    }
  });
  it("should allow guardian removal if removal period was passed", async() => {
    // 假設要被移除的守護者
    let guardianToRemove = accounts[1];
    let guardianToAdd = accounts[4];
    // 假設帳戶 0 是所有者，設定守護者移除排程
    await socialRecoveryWalletInstance.removeGuardian(guardianToRemove,{from: owner});
    // 驗證移除排程時間未過時無法執行守護者移除
    await helper.advanceTimeAndBlock(86401);
    await socialRecoveryWalletInstance.executeGuardianRemoval(guardianToRemove, guardianToAdd,{from: owner});
    const isGuardian = await socialRecoveryWalletInstance.getIsGuardianOrNot(guardianToRemove);
    assert.equal(isGuardian, false, "The guardian is not removed yet");
  });
  it("should prevent guardian removal if removal period not passed", async () => {
    // 假設要被移除的守護者
    let guardianToRemove = accounts[1];
    let guardianToAdd = accounts[4];
    // 假設帳戶0是所有者，設定守護者移除排程
    await socialRecoveryWalletInstance.removeGuardian(guardianToRemove,{from: owner});
    // 驗證移除排程時間未過時無法執行守護者移除
    try {
      await socialRecoveryWalletInstance.executeGuardianRemoval(guardianToRemove, guardianToAdd,{from: owner});
      assert.fail("should prevent guardian removal if removal period not passed");
    } catch (error) {
      assert(error.message.includes("Guardian removal period not passed"), "Unexpected error message");
    }
  });
  it("should allow only guardians to transfer guardian status", async () => {
    const nonGuardian = accounts[4]; // 假設這個帳戶不是守護者
    // 部署合約時已經將帳戶0設為守護者，這裡嘗試用帳戶1轉移守護者身份
    try {
      await socialRecoveryWalletInstance.transferGuardian(accounts[0], { from: nonGuardian });
      assert.fail("Should allow only guardians to transfer guardian status");
    } catch (error) {
      assert(error.message.includes("Only guardians can perform this action"), "Unexpected error message");
    }
  });
  it("should prevent transferring guardian during recovery process", async () => {
    // 假設合約處於恢復狀態
    await socialRecoveryWalletInstance.initiateRecovery(accounts[4],{from: guardian1});
    try {
      // 驗證在恢復狀態下無法轉移守護者身份
      await socialRecoveryWalletInstance.transferGuardian(accounts[5], {from: guardian2});
      assert.fail("Should prevent transferring guardian during recovery process");
    } catch (error) {
      assert(error.message.includes("Cannot transfer guardian during recovery process"), "Unexpected error message");
    }
  });
  it("should successfully transfer guardian status", async () => {
    // 驗證原先帳戶4不是守護者
    let isGuardian = await socialRecoveryWalletInstance.getIsGuardianOrNot(accounts[4]);
    assert.equal(isGuardian,false, "Account4 should not be a guardian before");
    // 轉移守護者身份
    await socialRecoveryWalletInstance.transferGuardian(accounts[4], { from: guardian1 });
    // 驗證帳戶4已成為守護者
    isGuardian = await socialRecoveryWalletInstance.getIsGuardianOrNot(accounts[4]);
    assert.equal(isGuardian,true, "Account4 should be a guardian");
    isGuardian = await socialRecoveryWalletInstance.getIsGuardianOrNot(accounts[1]);
    assert.equal(isGuardian,false, "Account1 should not be a guardian");
  });
  it("should not allow recovery initiation if already in recovery process", async () => {
    // guardian1 初始化 recovery
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    // 再次嘗試初始化 recovery，應該會拋出錯誤
    try {
      await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian2 });
      assert.fail("should not allow recovery initiation if already in recovery process");
    } catch (error) {
      assert(error.message.includes("Already in the recovery process"), "Unexpected error message");
    }
  });
  it("should not allow recovery execution without sufficient support", async () => {
    // guardian1 owner 初始化 recovery
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    // guardian2 表態支持 recovery，但 guardian3 不支持
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    try {
      await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian2, guardian3], {from: guardian2});
      assert.fail("should not allow recovery execution without sufficient support");
    } catch (error) {
      assert(error.message.includes("Insufficient support"), "Unexpected error message");
    }
  });
  it("should not allow recovery execution with wrong guardian address amount", async () => {
    // guardian1 owner 初始化 recovery
    await socialRecoveryWalletInstance.initiateRecovery(newOwner, { from: guardian1 });
    // guardian2 和 guardian3 表態支持 recovery
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian2 });
    await socialRecoveryWalletInstance.supportRecovery(newOwner, { from: guardian3 });
    try {
      await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian2],{from: guardian2});
      assert.fail("should not allow recovery execution with wrong guardian address");
    } catch (error) {
      assert(error.message.includes("Insufficient guardians"), "Unexpected error message");
    }
  });
  it("should not allow recovery execution if not in recovery process", async () => {
    // 嘗試在非恢復過程中執行 recovery，應該會拋出錯誤
    try {
      await socialRecoveryWalletInstance.executeRecovery(newOwner, [guardian2, guardian3],{from: guardian1});
      assert.fail("should not allow recovery execution if not in recovery process");
    } catch (error) {
      assert(error.message.includes("Only during the recovery process"), "Unexpected error message");
    }
  });
});


