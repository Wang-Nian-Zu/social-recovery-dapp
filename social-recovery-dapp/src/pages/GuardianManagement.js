import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Table, Form, Row, Col, Modal, Button } from "react-bootstrap";
import Web3 from 'web3';
import RemovalGuardianButton from './components/removalGuardianButton.js';
import CancelRemovalGuardianButton from './components/cancelRemovalGuardianButton.js';
import ExecuteRemovalGuardianButton from './components/executeRemovalGuardianButton.js';
const GuardianManagement = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [guardians, setGuardians] = useState([]);
    const [isGuardian, setIsGuardian] = useState([]);
    const [contractList, setContractList] = useState();
    const [isloaded, setIsloaded] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [contentVisiable, setContentVisiable] = useState(false);
    const [statusArray, setStatusArray] = useState([]);
    const [data, setData] = useState({deposit:0,withdraw:0});
    const [show, setShow] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(() => {
        const load = async() =>{
            if (isloaded) {
                return;
            }
            const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            // Instantiate smart contract using ABI and address.
            const contractListResult = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContractList(contractListResult);
            const ownerResult = await contractListResult.methods.owner().call();
            const guardiansResult = await contractListResult.methods.getAllGuardianList().call();
            const isGuardianResult = await contractListResult.methods.getIsGuardianOrNot(accounts[0]).call();
            const isRecoveringResult = await contractListResult.methods.isRecovering().call();
            setOwner(ownerResult);
            setGuardians(guardiansResult);
            const statusArray = await Promise.all(guardiansResult.map(guardian => findGuardianInRemovalOrNot(guardian)));
            setStatusArray(statusArray);
            setIsGuardian(isGuardianResult);
            setIsRecovering(isRecoveringResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    },[isloaded])
    const handleClick = (e) => {
        setShow(true);
    };
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const handleClose = (e) => {
        setShow(false);
        setIsError(false);
        setErrorMsg("");
        setData({newGuardian:"",removingGuardian:""});
    };
    const transferPermission = async(e) =>{
        e.preventDefault();
        if(isRecovering){
            setIsError(true);
            setErrorMsg("錯誤：現在此帳戶正在“恢復“過程中，不能轉移權限");
            return;
        }
        const sendData = {
            newGuardian: data.newGuardian
        };
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.transferGuardian(sendData.newGuardian).send({ from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    }
    const findGuardianInRemovalOrNot = async(guardian) =>{
        const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
        const contractListResult = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
        const removaltime = await contractListResult.methods.getGuardianRemovalPeriod(guardian).call();
        var currTimestamp = Math.round(Date.now() / 1000);
        console.log(removaltime)
        if (removaltime === "0"){
            return 1;
        }else if(removaltime > currTimestamp){
            return 2;
        }else if(removaltime < currTimestamp){
            return 3;
        }
        return 0;
    }
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
                {
                    contentVisiable && (
                        <div id="content" >
                            <h2 className="text-center" > 監護人管理 </h2>
                            <Row>
                                {
                                    (isGuardian)&&
                                    (<Col><Button size="md" className="btn btn-dark" onClick={handleClick}> 轉移監護人權限 </Button></Col>)
                                }
                            </Row>

                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="guardiansResults">
                                    {
                                        (owner===account)&&(guardians.map((guardian, index) => {
                                            const status = statusArray[index];
                                            return(
                                            <tr key={`${guardian}-${index}`}>
                                                <td>{index}</td>
                                                <td>{guardian}</td>
                                                <td>{
                                                    (status===1)?(<p style={{ color: 'green' }}>任期中</p>)
                                                    :(status===2)?(<p style={{ color: 'blue' }}>等待中</p>)
                                                    :(status===3)?(<p style={{ color: 'red' }}>可刪除</p>)  
                                                    :<p></p>
                                                }</td>
                                                <td>
                                                    {
                                                    (status===1)
                                                    ?(<RemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>)
                                                    :
                                                    (status===2)
                                                    ?(<CancelRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                    isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                    setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>)
                                                    :
                                                    (status===3)?(
                                                    <>
                                                        <ExecuteRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable} data={data} setData={setData}/>
                                                        <CancelRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>
                                                    </>
                                                    ):(<p></p>)}
                                                </td>
                                            </tr>
                                            )}))                                     
                                    }
                                </tbody>
                                
                            </Table>
                            {
                                (owner!==account)&&(
                                    <div>
                                        <br/><hr/>
                                        <h5 style={{ color: 'red' }}> 注意：只有帳戶擁有人有權限管理監護人 </h5>
                                    </div>
                                )
                            }
                            <Modal
                                show={show}
                                size="lg"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered>
                                <Modal.Header>
                                    <Modal.Title> 轉移監護人權限 </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <form onSubmit={transferPermission}>
                                        <div className='row d-flex w-100'>
                                            <Col sm={4}>
                                                <h5><span styles={{ color: '#d78559' }}>| </span> 新監護人地址 </h5>
                                            </Col>
                                            <Col>
                                                <Form.Control className="form-control mb-3" placeholder={`Add new guardian address...`} type="text"
                                                    onChange={handleChange} name="newGuardian" value={data.newGuardian}></Form.Control>
                                            </Col>
                                        </div>
                                        <div className='row d-flex w-100'>
                                            <button type="submit" className="btn btn-dark">確定轉移</button>
                                        </div>
                                    </form>
                                </Modal.Body>
                                <Modal.Footer>
                                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    )
                }
             </div>
        </div>
    )
}
export default GuardianManagement; 