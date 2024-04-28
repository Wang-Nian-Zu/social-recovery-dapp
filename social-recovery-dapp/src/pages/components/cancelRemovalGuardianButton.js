import React, { useState} from 'react';
import { Col, Modal, Button } from "react-bootstrap";
const CancelRemovalGuardianButton = (props) =>{
    const {id} = props;
    const {owner} = props;
    const {account} = props;
    const {contractList} = props;
    const {isError} = props;
    const {setIsError} = props;
    const {errorMsg} = props;
    const {setErrorMsg} = props;
    const [show, setShow] = useState(false);
    const {setIsloading} = props;
    const {setContentVisiable} = props;
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClose = (e) => {
        setShow(false);
        setIsError(false);
        setErrorMsg("");
    };
    const cancelProcess = async(e) => {
        e.preventDefault();
        if(owner !== account){
            setIsError(true);
            setErrorMsg("錯誤：此操作只有帳戶擁有人能操作");
            return;
        }
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.cancelGuardianRemoval(id).send({from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    }
    return(
        <div>
            <Button variant="secondary" onClick={handleClick}>取消</Button>
            <Modal
                show={show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
            <Modal.Header>
                <Modal.Title> 取消監護人的刪除排程 </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <form onSubmit={cancelProcess}>
                        <div className='row d-flex w-100'>
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 欲取消之監護人地址 </h5>
                            </Col>
                            <Col>
                                <h6>{id}</h6>
                            </Col>
                        </div>
                        <div className='row d-flex w-100'>
                            <button type="submit" className="btn btn-dark">確定取消</button>
                        </div>   
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                </Modal.Footer>
            </Modal>
        </div>
        
    );
}

export default CancelRemovalGuardianButton;