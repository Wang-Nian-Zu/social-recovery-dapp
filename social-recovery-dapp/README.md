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

## 部署 SocialRecoveryWallet.sol 智能合約到本地 Ganache 上
```bash
truffle migrate --network development
```

## 測試智能合約
```bash
truffle test
```

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