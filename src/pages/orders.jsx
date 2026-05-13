import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import getErrorMessage from "../components/getError"
import ShowOrderModal from "../components/order_modal"
import api from "../services/api"
import "./orders.css"

const statusTraductor=(sta)=>{
        if(sta==="pending_payment"){
            return "Esperando pago"
        }else if(sta==="paid"){
            return "Pagado"
        }else if(sta==="reary_pick_up"){
            return "Listo para recoger"
        }else if(sta==="delivered"){
            return "Entregado"
        }else{
            return "Cancelado"
        }
    }

function formatDateTime(isoString){
    if (!isoString) return "-"
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return "-"
    return new Intl.DateTimeFormat("es-PE",{
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        hour12:false
    }).format(date)
}

const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}

function Orders({orders, setPage, getOrders, viewOrderHistorial}){
    const [mode, setMode]=useState("")
    const [selectedOrder, setSelectedOrder]=useState({})
    const [open, setOpen]=useState(false)
    const cancelOrder=(order)=>{
        setMode("cancel")
        setSelectedOrder(order)
        setOpen(true)
    }
    const eraseOrder=(order)=>{
        setMode("erase")
        setSelectedOrder(order)
        setOpen(true) 
    }
    const onClose=()=>{
        setOpen(false)
        setMode("")
        setSelectedOrder({})
    }
    const finish=()=>{
        setOpen(false)
        setMode("")
        setSelectedOrder({})
        setPage(0)
        getOrders()
    }
    return(
        <>
            <div className="orders-grid">
                {orders.map((order)=>{
                    const items = order.items || []
                    const visibleItems = items.slice(0, 2)
                    const remaining = items.length - visibleItems.length
                    return(
                        <div className="order-data-client" key={order.id} onClick={()=>viewOrderHistorial(order.code)}>
                            {(order.status==="delivered"||order.status==="cancelled")&&
                            <button onClick={(e)=>{
                                e.stopPropagation()
                                eraseOrder(order)}
                                } className="trash-order"><i className="bi bi-trash3-fill"></i>
                            </button>}
                            {(order.status==="pending_payment")&&
                            <button onClick={(e)=>{
                                e.stopPropagation()
                                cancelOrder(order)}
                                }className="trash-order">X
                            </button>}
                            <p><strong>Código:</strong> {order.code}</p>
                            <p><strong>Estado:</strong> {statusTraductor(order.status)}</p>
                            <div className="products-claim">
                                <strong>Productos:</strong>
                                <ul className="product-list-order">
                                    {visibleItems.map((item, idx) => (
                                        <li key={idx}>
                                            {truncateText(item.name,26)} x {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                                {remaining > 0 && (
                                    <p>y {remaining} más...</p>
                                )}
                            </div>
                            <p><strong>Sin descuento:</strong> S/{order.total_raw.toFixed(2)}</p>
                            <p><strong>Con descuento:</strong> S/{order.total_discounted.toFixed(2)}</p>
                            <p>
                                <strong>Creado en:</strong> {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                    )
                })}
            </div>
            {open&&<ShowOrderModal order={selectedOrder} onClose={onClose} mode={mode} finish={finish}/>}
        </>
        
    )
}
function ShowOrders(){
    const [searchParams, setSearchParams] = useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(null)
    const [page, setPage] = useState(pageFromUrl)
    const [pageSize, setPageSize] = useState(0)
    const [returned, setReturned] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [orders, setOrders] = useState([])
    const navigate=useNavigate()
    const viewOrderHistorial=(code)=>{
        navigate(`/order/${code}`)
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
    const getOrders=async()=>{
        setLoading(true)
        setError(null)
        try {
            const res = await api.get("checkout/my",{
                params:{
                    page
                }
            })
            setOrders(res.data.orders)
            setPageSize(res.data.pagination.page||0)
            setReturned(res.data.pagination.returned||0)
            setTotalOrders(res.data.pagination.total_orders||0)
            setTotalPages(res.data.pagination.total_pages)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        setSearchParams({
            page
        })
        getOrders()
    },[page])
    return(
        <>
            {loading&&(
                <div className="err-mess">
                    <p>Cargando...</p>
                </div>
            )}
            {(!loading && error) && (
                <div className="err-mess">
                    <p>{error}.</p>
                </div>
            )}
            {(!loading && !error && orders.length===0) && (
                <div className="err-mess">
                    <p>No tienes pedidos registrados.</p>
                </div>
            )}
            {(!loading && !error && orders.length>0) && (
                <div className="product-content">
                    <Orders orders={orders} setPage={setPage} getOrders={getOrders} viewOrderHistorial={viewOrderHistorial}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {totalPages}</p>
                            <button disabled={page>=totalPages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=totalPages-1} onClick={()=>setPage(totalPages-1)}>{">>"}</button>
                        </div>
                        <p>{8*page+1}-{totalOrders>8*(page+1)?(8*(page+1)):totalOrders} de {totalOrders}</p>
                    </div>
                </div>
            )}
        </>
    )
}
export default ShowOrders