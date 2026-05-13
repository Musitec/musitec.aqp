import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import AcceptModal from "../components/reclamationModal"
import getErrorMessage from "../components/getError"
import api from "../services/api"
import "./watchReclamation.css"

function WatchReclamation(){
    const {id}=useParams()
    const [loading, setLoading]=useState(true)
    const [error, setError]=useState(null)
    const [claim, setClaim]=useState(null)
    const [open, setOpen]=useState(false)
    const getClaim=async()=>{
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`reclamations/reclamation/${id}`)
            setClaim(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        getClaim()
    },[id])
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
    const finish=async()=>{
        await getClaim()
    }
    const onClose=()=>{
        setOpen(false)
    }
    const downloadPDF = async () => {
        try {
            const res = await api.get(`reclamations/reclamation/${id}/pdf`, {
                responseType: "blob"
            })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `reclamo-${claim.code}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            alert("Error al descargar PDF")
        }
    }
    return(
        <>
        <div className="watch-reclamation-content">
            <div className="header-reclamation">
                <div className="header-left">
                    <h1>Reclamo #{claim.code}</h1>
                    <p className="header-subtitle">Consulta y descarga tu constancia</p>
                </div>
                <button className="btn-pdf" onClick={downloadPDF}>
                    Descargar PDF
                </button>
            </div>
            <h2>{claim.company.name}</h2>
            <p><strong>RUC:</strong> #{claim.company.ruc}</p>
            <p><strong>Direccion:</strong> {claim.company.address}</p>
            <p><strong>Canal de respuesta:</strong> {claim.response_channel}</p>
            <p><strong>Canal de soporte:</strong> {claim.support_channel}</p>
            <p>Este establecimiento cuenta con Libro de Reclamaciones conforme a ley</p>
            <div className="watch-reclamation-main">
                <div className="user-details">
                    <h2>Datos del usuario</h2>
                    <p><strong>Apellidos y nombres:</strong> {claim.user.name} {claim.user.lastname}</p>
                    <p> <strong>Tipo de documento:</strong> {claim.user.document_type}</p>
                    <p><strong>Documento:</strong> {claim.user.document_number}</p>
                    <p><strong>Correo electrónico:</strong> {claim.user.email}</p>
                    <p><strong>Dirección:</strong> {claim.user.address}</p>
                    <p><strong>Teléfono:</strong> {claim.user.phone}</p>
                </div>
                <div className="claim-details">
                    <h2>Datos del reclamo</h2>
                    {claim.attended_by!==null?(
                        <p><strong>Atendido por:</strong> {claim.attended_by}</p>
                    ):(<p><strong>Su reclamo sea atendido con tiempo,</strong> agradecemos la paciencia.</p>)}
                    <p><strong>Estado:</strong> {statusTraductor(claim.current_status)}</p>
                    <p><strong>Tipo:</strong> {claim.type}</p>
                    <p><strong>Razón:</strong> {claim.reason}</p>
                    <p><strong>Pedido del cliente:</strong> {claim.customer_request}</p>
                    {claim.claimed_amount!==null&&(
                        <p><strong>Monto sugerido</strong> S/{claim.claimed_amount.toFixed(2)}</p>
                    )}
                    <p><strong>Código de la orden:</strong> {claim.order}</p>
                    <p>
                        <strong>Fecha de creación:</strong> {new Date(claim.created_at).toLocaleString()}
                    </p>
                    {claim.accepted_terms&&(
                        <p><strong>Fecha de aceptación:</strong> {new Date(claim.accepted_at).toLocaleString()}</p>
                    )}
                    <p>
                        <strong>Fecha limite de respuesta:</strong> {new Date(claim.due_date).toLocaleString()}
                    </p>
                </div>
            </div>
            {((claim.current_status==="resolved"||claim.current_status==="rejected")&&!claim.accepted_terms)&&(
                <div>
                    <button className="accept-button" onClick={()=>setOpen(true)}>Aceptar resultado</button>
                </div>
            )}
            {claim.products && claim.products.length > 0 && (
            <div className="claim-history">
                <h2>Productos afectados:</h2>
                    <ul>
                        {claim.products.map((p, index) => (
                            <li key={index}>
                                {p.name}
                                {p.selected_option && (
                                    <span> ({p.selected_option})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="claim-history">
                <h2>Historial del reclamo:</h2>
                {!claim.history || claim.history.length === 0 ? (
                    <p>Tu reclamo será atendido en breve. Gracias por tu paciencia.</p>
                ) : (
                    <ul>
                        {claim.history.map((item, index) => (
                            <li key={index}>
                                <p><strong>Fecha:</strong> {new Date(item.date).toLocaleString()}</p>
                                <p><strong>Mensaje:</strong> {item.message}</p>
                                <p>
                                    <strong>Estado:</strong> {statusTraductor(item.old_status)} → {statusTraductor(item.new_status)}
                                </p>
                                <p><strong>Por:</strong> {item.changed_by}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        {open && <AcceptModal id={id} onClose={onClose} finish={finish}/>}
        </>
    )
}
export default WatchReclamation