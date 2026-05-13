import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import getErrorMessage from "../components/getError"
import api from "../services/api"
import "./clientReclamationBook.css"

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

function ShowReclams({reclams}){
    const navigate=useNavigate()
    const statusTraductor=(sta)=>{
        if(sta==="open"){
            return "Abierto"
        }else if(sta==="in_review"){
            return "En revisión"
        }else if(sta==="resolved"){
            return "Resuelto"
        }else{
            return "Rechazado"
        }
    }
    return(
        <div className="reclams-grid">
            <div 
                className="reclam-container create-reclam"
                onClick={() => navigate("/reclamation")}
            >
                <p className="create-icon">+</p>
                <p>Crear reclamo</p>
            </div>
            {reclams.map((reclam)=>{
                const products = reclam.products
                const maxToShow = 4
                const visibleProducts = products!==null?(products.slice(0, maxToShow)):0
                const remaining = products!==null?(products.length - maxToShow):0
                return(
                    <div key={reclam.code} className="reclam-container">
                        <p><strong>Código:</strong> {reclam.code}</p>
                        <p><strong>Estado:</strong> {statusTraductor(reclam.current_status)}</p>
                        {products===null?
                            <div>
                                <strong> Reclamo general:</strong>
                                <p className="empty-products-claim">Abarca toda la orden</p>
                            </div>
                            :
                            <div className="products-claim">
                                <strong>Productos del reclamo:</strong>
                                <ul className="product-list">
                                    {visibleProducts.map((product) => (
                                        <li key={product.product_id}>
                                            {product.name}{" "}
                                            {product.selected_option !== null
                                                ? `(${product.selected_option})`
                                                : ""}
                                        </li>
                                    ))}
                                </ul>
                                {remaining > 0 && (
                                    <p>y {remaining} producto{remaining > 1 ? "s" : ""} más</p>
                                )}
                            </div>
                        }
                        <p>
                            <strong>Creado en:</strong> {new Date(reclam.created_at).toLocaleString()}
                        </p>
                        <p>
                            <strong>Disponible hasta:</strong> {new Date(reclam.due_date).toLocaleString()}
                        </p>
                        <button className="view-historial" onClick={()=>navigate(`/claim/${reclam.id}`)}>Ver historial</button>
                    </div>
                )
            })}
        </div>
    )
}

function ShowMyReclamations({}){
    const [searchParams,setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const [page, setPage] = useState(pageFromUrl)
    const [maxPages, setMaxPages] = useState(0)
    const [totalReclams, setTotalReclams] = useState(0)
    const [reclams, setReclams] = useState([])
    const [loading,setLoading]=useState(true)
    const [error, setError]=useState(null)
    useEffect(()=>{
        setSearchParams({
            page
        })
        const getReclams=async()=>{
            setLoading(true)
            setError(null)
            try {
                const res = await api.get("reclamations/reclamations/user",{
                    params:{
                        page
                    }
                })
                setReclams(res.data.data)
                setTotalReclams(res.data.total)
                setMaxPages(res.data.pages)
                setPage(res.data.page)
            } catch (error) {
                setError(getErrorMessage(error)||"Error en el servidor")
            }finally{
                setLoading(false)
            }
        }
        getReclams()
    },[page])
    const firstPageSize = 7
    let start
    let end
    if (page === 0) {
        start = totalReclams > 0 ? 1 : 0
        end = Math.min(firstPageSize, totalReclams)
    } else {
        start = firstPageSize + (8 * (page - 1)) + 1
        end = Math.min(start + 8 - 1, totalReclams)
    }
    return(
        <div className="reclamations-container">
            <h1>Tus reclamos:</h1>
            {loading&&
               <div className="err-mess">
                    <p>Cargando...</p>
                </div>
            }
            {!loading && error && (
                <div className="err-mess">
                    <p>{error}</p>
                </div>
            )}
            {!loading && !error &&(
                <div style={{width:"100%"}}>
                    <ShowReclams reclams={reclams}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {maxPages}</p>
                            <button disabled={page>=maxPages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=maxPages-1} onClick={()=>setPage(maxPages-1)}>{">>"}</button>
                        </div>
                        <p>{start}-{end} de {totalReclams}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
export default ShowMyReclamations