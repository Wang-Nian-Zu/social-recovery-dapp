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

## 安裝 @truffle/hdwallet-provider
- HD Wallet-enabled Web3 provider. Use it to sign transactions for addresses derived from a 12 or 24 word mnemonic.

```bash
npm install @truffle/hdwallet-provider
```

## 確認 contracts/truffle-config.js 正確設置，以便能連線 Testnet
- Ganache 的預設是 host: "127.0.0.1" port: 7545

## 確認 console 是導向正確的路徑
```bash
social-recovery-dapp/social-recovery-dapp/contract
```

## 部署 SocialRecoveryWallet.sol 智能合約到 本地 Ganache上
```bash
truffle migrate --network development
```

## Deploy on the ropsten network
```bash
truffle migrate --network ropsten
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

## 啟動 dapp
```bash
npm start
```


