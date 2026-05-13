import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import getErrorMessage from "../components/getError"
import api from "../services/api"

function formatDateTime(date){
    if (!date) return "-"
    const d = new Date(date)
    return new Intl.DateTimeFormat("es-PE",{
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        hour12:false
    }).format(d)
}

const statusTraductor = (sta) => {
    if(sta==="pending_payment") return "Esperando pago"
    if(sta==="paid") return "Pagado"
    if(sta==="ready_pick_up") return "Listo para recoger"
    if(sta==="delivered") return "Entregado"
    if(sta==="cancelled") return "Cancelado"
    if(sta==="erased") return "Eliminado"
    if(sta==="restored") return "Restaurado"
    return sta
}

function ShowOrderHistorial(){
    const {code} = useParams()
    const [order, setOrder]=useState({})
    const [error, setError]=useState(null)
    const [loading, setLoading]=useState(true)
    useEffect(()=>{
        const getOrderHistorial=async()=>{
            setLoading(true)
            setError(null)
            try {
                const res = await api.get(`checkout/${code}/view`)
                console.log(res.data)
                setOrder(res.data)
            } catch (error) {
                setError(getErrorMessage(error))   
            }finally{
                setLoading(false)
            }
        }
        getOrderHistorial()
    },[code])
    if(loading){
        return(
            <div className="err-mess">
                <p>Cargando...</p>
            </div>
        )
    }
    if(error){
        return(
            <div className="err-mess">
                <p>{error}.</p>
            </div>
        )
    }
    return (
    <div className="watch-reclamation-content">
        <h1>Pedido #{order.code}</h1>
        <div className="watch-reclamation-main">
            <div className="user-details">
                <h2>Detalle del pedido</h2>
                <p><strong>Estado actual:</strong> {statusTraductor(order.status)}</p>
                <p><strong>Fecha de creación:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Actualizado:</strong> {order.updated_at}</p>
            </div>
            <div className="claim-details">
                <h3>Productos</h3>
                <ul className="order-products-content">
                    {order.items?.map((item, index) => (
                        <li key={index} className="order-item">
                            <p><strong>Nombre:</strong> {item.name}</p>
                            <p><strong>Cantidad:</strong> {item.quantity}</p>
                            <p><strong>Precio unitario:</strong> S/{item.unit_price}</p>
                            <p><strong>Descuento:</strong> {item.discount}%</p>
                            <p><strong>Opción:</strong> {item.selected_option || "Ninguna"}</p>
                        </li>
                    ))}
                </ul>
                <div>
                    <h3>Totales</h3>
                    <p><strong>Sin descuento:</strong> S/{order.total_raw}</p>
                    <p><strong>Con descuento:</strong> S/{order.total_discounted}</p>
                </div>
            </div>
        </div>
        <div className="claim-history">
            <h3>Historial</h3>
            {!order.history || order.history.length === 0 ? (
                    <p>Esta orden aún no fue revisada.</p>
                ):(
                    <ul>
                        {order.history?.map((h, index) => (
                            <li key={index}>
                                <p><strong>Estado:</strong> {statusTraductor(h.status)}</p>
                                <p><strong>Por:</strong> {h.by}</p>
                                <p><strong>Fecha:</strong> {new Date(h.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    </div>
    )
}
export default ShowOrderHistorial