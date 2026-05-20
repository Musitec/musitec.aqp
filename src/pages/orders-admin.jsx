import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import ShowOrderModal from "../components/order_modal"
import ShowOptions from "../components/showOptions"
import "./orders-admin.css"

function SetStatus({status}){
    if (!status) return null
    let sta = "Cancelado"
    if (status === "pending_payment") {
        sta = "Pago pendiente"
    } else if (status === "paid") {
        sta = "Pagado"
    } else if (status === "reary_pick_up") {
        sta = "Listo para recoger"
    } else if (status === "delivered") {
        sta = "Entregado"
    }
    return(
        <p><strong>Estado:</strong> {sta}</p>
    )
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

function Options({erasedMode,onErasedClick,text}){
    const values=["all","normal","erased"]
    const labels=["Todos","Normales","Eliminados"]
    return(
        <div className="filters">
            <ShowOptions
                title={"Filtrar por"}
                labels={labels}
                values={values}
                option={erasedMode}
                onChangeOption={onErasedClick}
                text={text}
            />
        </div>
    )
}
function ShowOrders({orders,reload, viewHistorial}){
    const [orderSelected, setOrderSelected]=useState(null)
    const [showModal, setShowModal]=useState(false)
    const openModal=(order)=>{
        setOrderSelected(order)
        setShowModal(true)
    }
    const closeModal=()=>{
        setOrderSelected(null)
        setShowModal(false)
    }
    const finish=()=>{
        setOrderSelected(null)
        setShowModal(false)
        reload()
    }
    if(orders.length===0){
        return(
            <div className="err-mess">
                <p>No se encontraron ordenes.</p>
            </div>
        )
    }
    return(
        <>
        <div className="orders-grid">
            {orders.map((order) => {
                return (
                    <div
                        className="order-data"
                        onClick={() => openModal(order)}
                        key={order.id}
                    >
                        <i className="bi bi-person-circle"></i>
                        {order.is_erased&&<div className="erased">Eliminado</div>}
                        <p><strong>Código:</strong> {order.code}</p>
                        <p><strong>Correo:</strong> {order.email}</p>
                        {order.created_at && (
                            <p>
                                <strong>Creado en:</strong> {formatDateTime(order.created_at)}
                            </p>
                        )}
                        <button className="view-historial-product" onClick={(e)=>{
                            e.stopPropagation()
                            viewHistorial(order.code)
                        }}>Ver historial</button>
                        <SetStatus status={order.status} />
                    </div>
                )
            })}
        </div>
        {showModal&&<ShowOrderModal order={orderSelected} onClose={closeModal} finish={finish} mode={"admin"}/>}
        </>
    )
}
function SearchBars({ userEmail, code, onSearch }) {
    const [user, setUser] = useState(userEmail)
    const [myCode, setMyCode] = useState(code)
    useEffect(() => {
        setUser(userEmail)
        setMyCode(code)
    }, [userEmail, code])
    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch({
            userEmail: user?.trim() || null,
            code: myCode?.trim() || null
        })
    }
    return (
        <form className="orders-search-bars" onSubmit={handleSubmit}>
            <div className="inputs-content">
                <input
                    type="text"
                    placeholder="Correo del usuario"
                    value={user || ""}
                    onChange={(e) => setUser(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Código de la orden"
                    value={myCode || ""}
                    onChange={(e) => setMyCode(e.target.value)}
                />
            </div>
            <div className="search-button-content">
                <button type="submit"><i className="bi bi-search"></i></button>
            </div>
        </form>
    )
}
function OrdersAdmin(){
    const [searchParams,setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const emailUserFromUrl = searchParams.get("email_user")||null
    const codeFromUrl = searchParams.get("code")||null
    const erasedFromUrl = searchParams.get("erased")||"all"
    const [page,setPage]=useState(pageFromUrl)
    const [erased,setErased]=useState(erasedFromUrl)
    const [emailUser,setEmailUser]=useState(emailUserFromUrl)
    const [code,setCode]=useState(codeFromUrl)
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState(null)
    const [orders,setOrders]=useState([])
    const [ordersNumber,setOrdersNumber]=useState(0)
    const [pages,setPages]=useState(0)
    const [pageSize,setPageSize]=useState(0)
    const navigate = useNavigate()
    const viewOrderHistorial=(code)=>{
        navigate(`/order/${code}`)
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
    const fetchOrders = async()=>{
        const hasSearchUser=Boolean(emailUser && emailUser.trim())
        const hasOrderId=Boolean(code && code.trim())
        setSearchParams({
            page,
            erased,
            ...(hasSearchUser ? { email_user: emailUser } : {}),
            ...(hasOrderId ? { code: code } : {})
        })
        setLoading(true)
        setError(null)
        try {
            const res = await api.get("checkout/orders",{
                params:{
                    page,
                    erased,
                    ...(hasSearchUser ? { email_user: emailUser } : {}),
                    ...(hasOrderId ? { code: code } : {})
                }
            })
            setOrders(res.data.orders||[])
            setPages(res.data.pagination.total_pages||1)
            setOrdersNumber(res.data.pagination.total_orders||0)
            setPageSize(res.data.pagination.page_size)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchOrders()
    },[page, emailUser, code, erased])
    return(
        <>
            <div className="inputs-container">
                <Options erasedMode={erased} onErasedClick={(era) => 
                    { 
                        setErased(era) 
                        setPage(0) 
                    }} text={code} 
                />
                <SearchBars 
                    userEmail={emailUser}
                    code={code}
                    onSearch={({ userEmail, code })=>{
                        setEmailUser(userEmail)
                        setCode(code)
                    }}
                />
            </div>
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
            {(!loading && !error) && (
                <div className="orders-content">
                    <ShowOrders orders={orders} reload={fetchOrders} viewHistorial={viewOrderHistorial}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {pages}</p>
                            <button disabled={page>=pages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=pages-1} onClick={()=>setPage(pages-1)}>{">>"}</button>
                        </div>
                        <p>{pageSize*page+1}-{ordersNumber>pageSize*(page+1)?(pageSize*(page+1)):ordersNumber} de {ordersNumber}</p>
                    </div>
                </div>
            )}
        </>
    )
}
export default OrdersAdmin