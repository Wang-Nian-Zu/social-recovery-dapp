import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Form, Col, Modal, Button } from "react-bootstrap";
import Web3 from 'web3';
import RemovalGuardianButton from './components/removalGuardianButton.js';
import CancelRemovalGuardianButton from './components/cancelRemovalGuardianButton.js';
import ExecuteRemovalGuardianButton from './components/executeRemovalGuardianButton.js';
const GuardianManagement = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [guardians, setGuardians] = useState([]);
    const [isGuardian, setIsGuardian] = useState([]);
    const [guardianRemovalPeriod, setGuardianRemovalPeriod] = useState([]);
    const [currTimestamp, setCurrTimeStamp]=useState(0);
    const [contractList, setContractList] = useState();
    const [isloaded, setIsloaded] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [contentVisiable, setContentVisiable] = useState(false);
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
            const contractList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContractList(contractList);
            const ownerResult = await contractList.methods.owner().call();
            const guardiansResult = await contractList.methods.guardians().call();
            const isGuardianResult = await contractList.methods.getIsGuardianOrNot(accounts[0]).call();
            const isRecoveringResult = await contractList.methods.isRecovering().call();
            const guardianRemovalPeriodResult = await contractList.methods.guardianRemovalPeriod().call();
            var timestamp = Math.round(Date.now() / 1000);
            setOwner(ownerResult);
            setGuardians(guardiansResult);
            setIsGuardian(isGuardianResult);
            setIsRecovering(isRecoveringResult);
            setCurrTimeStamp(timestamp);
            setGuardianRemovalPeriod(guardianRemovalPeriodResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    },[])
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClick2 = (e) => {
        setShow2(true);
    };
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const handleClose = (e) => {
        setShow(false);
        setShow2(false);
        setIsError(false);
        setErrorMsg("");
        setData({newGuardian:"",removingGuardian:""});
    };
    const transferPermission = async() =>{
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
                                        (owner==account)&&(Object.keys(guardians).map((guardian, index) => (
                                            <tr key={`${tasks[index].name}-${index}`}>
                                                <td>{index}</td>
                                                <td>{guardian}</td>
                                                <td>{
                                                    (guardianRemovalPeriod[guardian]===0)&&(<p style={{ color: 'green' }}>現任中</p>)
                                                    (guardianRemovalPeriod[guardian]!==0)&&(guardianRemovalPeriod[guardian]<currTimestamp)&&(<p style={{ color: 'yellow' }}>等待刪除中</p>)
                                                    (guardianRemovalPeriod[guardian]!==0)&&(guardianRemovalPeriod[guardian]>currTimestamp)&&(<p style={{ color: 'red' }}>可刪除</p>)   
                                                }</td>
                                                <td>
                                                    {
                                                    (guardianRemovalPeriod[guardian]===0)
                                                    &&(<RemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>)
                                                    
                                                    (guardianRemovalPeriod[guardian]!==0)&&(guardianRemovalPeriod[guardian]<currTimestamp)
                                                    &&(<CancelRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                    isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                    setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>)
                                                    
                                                    (guardianRemovalPeriod[guardian]!==0)&&(guardianRemovalPeriod[guardian]>currTimestamp)&&(
                                                    <div>
                                                        <ExecuteRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable} data={data} setData={setData}/>
                                                        <CancelRemovalGuardianButton id={guardian} owner={owner} account={account} contractList={contractList}
                                                        isError={isError} setIsError={setIsError} errorMsg={errorMsg} setErrorMsg={setErrorMsg}
                                                        setIsloading={setIsloading} setContentVisiable={setContentVisiable}/>
                                                    </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )))                                          
                                    }
                                </tbody>
                            </Table>

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