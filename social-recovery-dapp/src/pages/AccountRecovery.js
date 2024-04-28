import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Table, Col, Button } from "react-bootstrap";
import Web3 from 'web3';
import InitialRecoveryButton from './components/InitialRecoveryButton.js';
import SupportRecoveryButton from './components/SupportRecoveryButton.js';
import CancelRecoveryButton from './components/CancelRecoveryButton.js';
import ExecuteRecoveryButton from './components/ExecuteRecoveryButton.js';
const AccountRecovery = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [guardians, setGuardians] = useState([]);
    const [isGuardian, setIsGuardian] = useState([]);
    const [newOwnerArray, setNewOwnerArray] = useState([]);
    const [contractList, setContractList] = useState();
    const [isRecovering, setIsRecovering] = useState(false);
    const [currRecoveryRound, setCurrRecoveryRound] = useState(0);
    const [isloaded, setIsloaded] = useState(false);
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
            const contractList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContractList(contractList);
            const ownerResult = await contractListResult.methods.owner().call();
            const guardiansResult = await contractListResult.methods.getAllGuardianList().call();
            const isGuardianResult = await contractListResult.methods.getIsGuardianOrNot(accounts[0]).call();
            const isRecoveringResult = await contractListResult.methods.isRecovering().call();
            const currRecoveryRoundResult = await contractListResult.methods.currRecoveryRound().call();
            setOwner(ownerResult);
            setGuardians(guardiansResult);
            const newOwnerArrayResult = await Promise.all(guardiansResult.map(guardian => findGuardianSupportNewOwner(guardian)));
            setNewOwnerArray(newOwnerArrayResult);
            setIsGuardian(isGuardianResult);
            setIsRecovering(isRecoveringResult);
            setCurrRecoveryRound(currRecoveryRoundResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    }, [isloaded]);
    const findGuardianSupportNewOwner = async(guardian) =>{
        const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
        const contractListResult = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        const result = await contractListResult.methods.getGuardianSupportNewOwner(guardian).call();
        if (result === "0x0000000000000000000000000000000000000000"){
            result = "None";
        }
        return(result);
    }
    return(
        <div className="container" style={{ width: "850px" }}>
            <div className="row">
                {
                    isloading && (
                        <div id="loader" className="text-center">
                            <p className="text-center">Loading...</p>
                        </div>
                    )
                }
                {
                    contentVisiable && (
                        <div id="content" >
                            <h2 className="text-center" > 帳戶恢復 </h2>
                            <h4>此帳戶第 {currRecoveryRound} 次恢復流程</h4>
                            <h5> 帳戶狀態 : {(isRecovering)
                            ?(<p styles={{color:"red"}}>恢復中</p>)
                            :(<p styles={{color:"green"}}>正常</p>)}</h5>
                            <Row>
                                {
                                    (!isRecovering && isGuardian)?
                                    (<InitialRecoveryButton id={guardian} owner={owner} account={account} contractList={contractList}
                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable} />)
                                    :(isRecovering && isGuardian)?
                                    (
                                        <>
                                       <SupportRecoveryButton id={guardian} owner={owner} account={account} contractList={contractList}
                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>
                                       <ExecuteRecoveryButton id={guardian} owner={owner} account={account} contractList={contractList}
                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>
                                        </>
                                    ):(<Col></Col>)
                                    (isRecovering && owner===account)&&(<CancelRecoveryButton id={guardian} owner={owner} account={account} 
                                        contractList={contractList} currRecoveryRound={currRecoveryRound}
                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>)
                                }
                            </Row>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Support new Owner</th>
                                    </tr>
                                </thead>
                                <tbody id="guardiansResults">
                                    {
                                        (guardians.map((guardian, index) => {
                                        const newOwner = newOwnerArray[index];
                                        return(
                                            <tr key={`${guardian}-${index}`}>
                                                <td>{index}</td>
                                                <td>{guardian}</td>
                                                <td>{newOwner}</td>
                                            </tr>
                                        )}))
                                    }
                                </tbody>
                            </Table>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
export default AccountRecovery; 