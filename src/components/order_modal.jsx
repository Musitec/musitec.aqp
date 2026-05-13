import { useEffect, useRef, useState } from "react"
import getErrorMessage from "./getError"
import api from "../services/api"
import "./order_modal.css"
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function RenderButton({status,id,changeStatus, loading}){
    if(status==="cancelled"||status==="delivered"){
        return null
    }
    let buttonText=""
    let newStatus=""
    if(status==="pending_payment"){
        buttonText="Confirmar pago"
        newStatus="paid"
    }else if(status==="paid"){
        buttonText="Alistar pedido"
        newStatus="ready_pick_up"
    }else if(status==="ready_pick_up"){
        buttonText="Confirmar entrega"
        newStatus="delivered"
    }
    return(
        <button className="change-status" disabled={loading} onClick={()=>changeStatus(id,newStatus)}><strong>{buttonText}</strong></button>
    )
}
function ShowOrderModal({order,onClose,finish,mode}){
    const [error, setError] = useState(null)
    const [loading, setLoading]=useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const scrollRef = useRef(null)
    const startY = useRef(0)
    const scrollTopStart = useRef(0)
    const items=order.items
    const closeWithAnimation=()=>{
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const deleteOrder=async(id)=>{
        setLoading(true)
        setError(null)
        try {
            if(mode==="erase"){
                await api.delete(`checkout/${id}/delete`)
            }else if(mode==="cancel"){
                await api.patch(`checkout/${id}/cancel`)
            }
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    const getNewStatus=(old_status)=>{
        if(old_status==="pending_payment"){
            return "paid"
        }else if(old_status==="paid"){
            return "reary_pick_up"
        }else{
            return 
        }
    }
    const changeStatus=async(id,newStatus)=>{
        setLoading(true)
        setError(null)
        try {
            await api.patch(`checkout/${id}/status`,{
                status:newStatus
            })
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    const restoreOrder=async(id)=>{
        setLoading(true)
        setError(null)
        try {
            await api.patch(`checkout/${id}/restore`)
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    const handleMouseDown = (e) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        startY.current = e.pageY - scrollRef.current.offsetTop
        scrollTopStart.current = scrollRef.current.scrollTop
    }
    const handleMouseLeave = () => setIsDragging(false)
    const handleMouseUp = () => setIsDragging(false)
    const handleMouseMove = (e) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const y = e.pageY - scrollRef.current.offsetTop
        const walk = (y - startY.current) * 1.5
        scrollRef.current.scrollTop = scrollTopStart.current - walk
    }
    console.log(order)
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    return(
        <div className="order_backdrop" onClick={!loading?closeWithAnimation:undefined}>
            <div className={`order-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="cancel" onClick={!loading ? closeWithAnimation : undefined}>X</button>
                    {(mode==="erase"||mode==="cancel")&&
                        <>
                            <h2>¿Estas seguro que quieres {mode==="erase"?"borrar":"cancelar"} este pedido?</h2>
                            <p>Identificación: <strong>{order.code}</strong></p>
                            <h3>Productos:</h3>
                            <div className="modar-items-data-type">
                                <p>Imagen</p>
                                <p>Nombre</p>
                                <p>Cant.</p>
                                <p>Precio sin descuento.</p>
                                <p>Precio con descuento.</p>
                            </div>
                            {items.slice(0,3).map((item)=>{
                                const img=item.image
                                return(
                                    <div key={item.product_id} className="modal-item-container">
                                        <img src={img} alt={item.name}/>
                                        <p>{truncateText(item.name,30)}</p>
                                        <p>{item.quantity}</p>
                                        <p className="order-price">S/{item.subtotal_raw.toFixed(2)}</p>
                                        <p className="order-price-discounted">S/{item.subtotal_discounted.toFixed(2)}</p>
                                    </div>
                                )
                            })}
                            {items.length > 3 && (
                                <p className="more-items">{items.length - 3} productos más</p>
                            )}
                            {error && <p className="error-order">{error}.</p>}
                            <button className="erase-order-button" onClick={()=>deleteOrder(order.code)} disabled={loading}>{mode==="erase"?"borrar":"cancelar"}</button>
                        </>
                    }
                    {mode==="admin"&&
                        <>
                            <h2>Orden:</h2>
                            <p>Identificación: <strong>{order.code}</strong></p>
                            <h3>Productos:</h3>
                            <div className="modar-items-data-type">
                                <p>Imagen</p>
                                <p>Nombre</p>
                                <p>Cant.</p>
                                <p>Precio sin descuento.</p>
                                <p>Precio con descuento.</p>
                            </div>
                            <div className="scroll-wrapper">
                                <div className="admin-items-scroll"
                                    ref={scrollRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseLeave={handleMouseLeave}
                                    onMouseUp={handleMouseUp}
                                    onMouseMove={handleMouseMove}
                                >
                                    {items.map((item) => {
                                        const img = item.image
                                        return (
                                            <div key={item.product_id} className="modal-item-container">
                                                <img src={img} alt={item.name}/>
                                                <p>{truncateText(item.name,30)}</p>
                                                <p>{item.quantity}</p>
                                                <p className="order-price">
                                                    S/{item.subtotal_raw.toFixed(2)}
                                                </p>
                                                <p className="order-price-discounted">
                                                    S/{item.subtotal_discounted.toFixed(2)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            {error && <p className="error-order">{error}.</p>}
                            {!order.is_erased&&<RenderButton status={order.status} id={order.code} changeStatus={changeStatus} loading={loading}/>}
                            {order.is_erased&&<button className="change-status" onClick={()=>restoreOrder(order.code)} disabled={loading} >Restaurar</button>}
                        </>
                    }
            </div>
        </div>
    )
}
export default ShowOrderModal