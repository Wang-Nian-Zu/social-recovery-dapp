import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Form, Col, Modal, Button } from "react-bootstrap";
import Web3 from 'web3';
const GuardianManagement = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [contractList, setContractList] = useState();
    const [isloaded, setIsloaded] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const [contentVisiable, setContentVisiable] = useState(false);
    const [data, setData] = useState({deposit:0,withdraw:0});
    
    useEffect(() => {
        const load = async() =>{
            if (isloaded) {
                return;
            }
            const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            // Instantiate smart contract using ABI and address.
            const contractList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContractList(contractList);
            const ownerResult = await contractList.methods.owner().call();
            const isGuardianResult = await contractList.methods.isGuardian().call();
            
            setOwner(ownerResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    },[])
    

    return(
        <div className="container" style={{ width: "650px" }}>
             <div className="row">
                {
                    isloading && (
                        <div id="loader" className="text-center">
                            <p className="text-center">Loading...</p>
                        </div>
                    )
                }
             </div>
        </div>
    )
}
export default GuardianManagement; 