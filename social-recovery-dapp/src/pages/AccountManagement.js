import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Form } from "react-bootstrap";
import Web3 from 'web3';
const AccountManagement = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [contactList, setContactList] = useState();
    const [isloaded, setIsloaded] = useState(false);
    const [accountBalances, setAccountBalances] = useState([]);
    const [isloading, setIsloading] = useState(false);
    const [contentVisiable, setContentVisiable] = useState(false);
    useEffect(() => {
        const load = async() =>{
            if (isloaded) {
                return;
            }
            const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            // Instantiate smart contract using ABI and address.
            const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContactList(contactList);
            const ownerResult = await contactList.methods.owner().call();
            const balanceResult = await contactList.methods.totalDepositAmount().call();
            setOwner(ownerResult);
            setAccountBalances(balanceResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    }, [])
    return(
        <div className="container" style={{ width: "650px" }}>
             <div className="row">
                {
                    isloading && (
                        <div id="loader" class="text-center">
                            <p class="text-center">Loading...</p>
                        </div>
                    )
                }
                {
                    contentVisiable && (
                        <div className="content col-lg-12">
                            <h1 className="text-center">帳戶擁有者地址: {owner} </h1>
                            <hr />
                            <br />
                            <p>帳戶總金額：{accountBalances}</p>
                        </div>
                    )
                }
             </div>
        </div>
    )
}
export default AccountManagement; 