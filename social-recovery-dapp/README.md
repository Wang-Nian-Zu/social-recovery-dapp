# Development Environment

- **Operating System:** MacOS Ventura v13.5.1
- **Node.js Version:** v18.17.1

## Installing Truffle

```bash
npm install -g truffle@5.11.2
```

## 安裝 Ganache GUI / Ganache CLI
- 官方網址：https://archive.trufflesuite.com/ganache/
- 確保啟用 Ganache 
- 如果是 MacOs 就開啟 Ganache Application, 選擇 QuickStart

## 以下連結安裝 MetaMask Chrome Plugin
- https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

## 確認 contracts/truffle-config.js 正確設置，以便能連線 Testnet
- Ganache 的預設是 host: "127.0.0.1" port: 7545

## 確認 console 是導向正確的路徑
```bash
social-recovery-dapp/social-recovery-dapp/contract
```

## 先設定初始社交認證的複數帳戶
- 修改 `social-recovery-dapp/social-recovery-dapp/contract/migrations/1_deploy_contracts` 的 `threshold` 以及 `initialGuardians`
- `threshold` : 資料型態，整數，設定要多少監護人支持才可以更改合約擁有人
- `initialGuardians` : 資料型態，陣列，設定初始監護人有哪些，傳入他們的地址
   - 可以使用預設的，預設`threshold`=2，`initialGuardians`將從 testnet 中的前三個帳戶地址作為初始化的監護人們

## 測試智能合約
```bash
truffle test
```

## 部署 SocialRecoveryWallet.sol 智能合約到本地 Ganache 上
```bash
truffle migrate --network development
```

## 合約部署完成後，必須將「合約地址」與「合約的 ABI」傳遞給 React.js
- 找到 `social-recovery-dapp/contract/build/contracts/SocialRecoveryWallet.json` 後，需要將其中兩個值複製到 `social-recovery-dapp/src/pages/abi/SocialRecoveryConfig.js`中
- 首先是「合約地址」，到`social-recovery-dapp/contract/build/contracts/SocialRecoveryWallet.json` 中使用 Ctrl+F 查找 `"address":` 就可以複製該 address 的值，例如以下就複製`"0xDE116b7427AE7d11175BBe0ADf16c7B476A01475"`
```
   ...
   "networks": {
    "5777": {
      "events": {},
      "links": {},
      "address": "0xDE116b7427AE7d11175BBe0ADf16c7B476A01475",
      "transactionHash": "0x0fd2ae2487ed05b67ea86512c0fa439f3fc3759ee6ebf431948d5588750e2434"
    }
  },
  ...
```
- 到 `social-recovery-dapp/src/pages/abi/SocialRecoveryConfig.js`中的 `export const CONTACT_ADDRESS = `後貼上
```
export const CONTACT_ADDRESS = "0xDE116b7427AE7d11175BBe0ADf16c7B476A01475";
```
- 再者是「合約ABI」，到`social-recovery-dapp/contract/build/contracts/SocialRecoveryWallet.json` 中使用 Ctrl+F 查找 `"abi":` 就可以複製該 abi 的值
- 同樣到 `social-recovery-dapp/src/pages/abi/SocialRecoveryConfig.js`中的 `export const CONTACT_ABI = `後貼上

## 確認 console 是導向正確的路徑
```bash
cd social-recovery-dapp/social-recovery-dapp/
```

## 安裝 package.json 的所有依賴項
```bash
npm install
```

## 在 localhost:3000 啟動 dapp
```bash
npm start
```
## 因為 Ropsten 測試網路在 2022 年宣布棄用，因此這邊就沒有實作上鏈至 Ropsten 測試網路
- https://news.cnyes.com/news/id/4898763