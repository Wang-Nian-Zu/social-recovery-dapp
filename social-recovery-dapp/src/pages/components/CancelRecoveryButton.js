import React, { useState} from 'react';
import { Col, Modal, Button } from "react-bootstrap";
const CancelRecoveryButton = (props) =>{
    const {owner} = props;
    const {account} = props;
    const {currRecoveryRound} = props;
    const {contractList} = props;
    const {setIsloading} = props;
    const {setContentVisiable} = props;
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg]= useState("");
    const [show, setShow] = useState(false);
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClose = (e) => {
        setShow(false);
        setIsError(false);
        setErrorMsg("");
    };
    const cancelRecovery = async(e) => {
        if(owner !== account){
            setIsError(true);
            setErrorMsg("錯誤：此操作只有帳戶擁有人可以執行");
            return;
        }
        e.preventDefault();
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.cancelRecovery().send({from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    }
    return(
        <Col>
            <Button size="md" className="btn btn-danger" onClick={handleClick}> 取消恢復流程 </Button>
            <Modal
                show={show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
            <Modal.Header>
                <Modal.Title> 取消恢復流程 </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <form onSubmit={cancelRecovery}>
                        <div className='row d-flex w-100'>
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 注意 </h5>
                            </Col>
                            <Col>
                                 <h5>確定要取消第{currRecoveryRound}次恢復流程?</h5>
                            </Col>
                        </div>
                        <div className='row d-flex w-100'>
                            <button type="submit" className="btn btn-dark">確定</button>
                        </div>   
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                </Modal.Footer>
            </Modal>
        </Col>
        
    );
}
export default CancelRecoveryButton;