import { useEffect, useState } from "react"
import getErrorMessage from "./getError"
import api from "../services/api"
import "./productModal.css"
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function ProductModal({product,mode,onClose,onFinish}){
    const [error, setError] = useState(null)
    const [loading, setLoading]=useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const closeWithAnimation=()=>{
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const title=()=>{
        if(mode==="bloqued"){
            if(product.is_blocked){
                return "¿Quieres desbloquear este producto?"
            }else{
                return "¿Quieres bloquear este producto?"
            }                
        }else{
            if(product.is_active){
                return "¿Quieres desactivar este producto?"
            }else{
                return "¿Quieres activar este producto?"
            } 
        }
    }
    const h1title=title()
    const sendState=async()=>{
        setLoading(true)
        setError(null)
        try {
            if(mode==="bloqued"){
                if(product.is_blocked){
                    await api.patch(`product-control/product/${product.id}/unblock`)
                }else{
                    await api.patch(`product-control/product/${product.id}/block`)
                }
            }else{
                if(product.is_active){
                   await api.patch(`product-control/product/${product.id}/deactivate`)
                }else{
                    await api.patch(`product-control/product/${product.id}/activate`)
                }
            }
            closeWithAnimation()
            onFinish()
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
                    <h1>{h1title}</h1>
                    <p style={{fontSize:"30px"}}><strong>Nombre del producto:</strong> {truncateText(product.name,30)}</p>
                    {error&&<p className="error-order">{error}.</p>}
                    <div className="modal-button-flex">
                        <button className="confirm-button" onClick={sendState} disabled={loading}>Si</button>
                        <button className="cancel-button" onClick={closeWithAnimation} disabled={loading}>No</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ProductModal