import { useEffect, useState } from "react"
import api from "../services/api"
import getErrorMessage from "./getError"

function AcceptModal({id, onClose, finish}){
    const [error, setError] = useState(null)
    const [loading, setLoading]=useState(false)
    const [open, setOpen] = useState(false)
    const [closing, setClosing]=useState(false)
    const closeWithAnimation=()=>{
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const sendAccept=async()=>{
        setLoading(true)
        setError(null)
        try {
            await api.patch(`reclamations/reclamation/${id}/accept`)
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    return(
        <div className="order_backdrop" onClick={!loading?closeWithAnimation:undefined}>
            <div className={`order-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="product-modal-content">
                    <h1>¿Quieres aceptar el resultado del reclamo?</h1>
                    <p>Si aceptas ya no podrás seguir con este reclamo</p>
                    {error&&<p className="error-order">{error}.</p>}
                    <div className="modal-button-flex">
                        <button className="confirm-button" onClick={sendAccept} disabled={loading}>Si</button>
                        <button className="cancel-button" onClick={closeWithAnimation} disabled={loading}>No</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AcceptModal