import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import getErrorMessage from "../components/getError"
import api from "../services/api"
import "./update-historial-claim.css"

const MAX_FILES = 5

function EvidenceUploader({ files, setFiles, setError }) {
    const inputRef = useRef(null)
    const [dragIndex, setDragIndex] = useState(null)
    const openGallery = () => inputRef.current.click()
    const addFiles = (newFiles) => {
        const previews = newFiles.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }))
        setFiles(prev => {
            const total = [...prev, ...previews]
            if (total.length > MAX_FILES) {
                setError("Máximo 5 imágenes")
                return total.slice(0, MAX_FILES)
            }
            return total
        })
    }
    const handleChange = (e) => {
        addFiles(Array.from(e.target.files))
    }
    const handleDrop = (e) => {
        e.preventDefault()
        addFiles(Array.from(e.dataTransfer.files))
    }
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }
    const handleDragStart = (index) => setDragIndex(index)
    const handleDropImage = (e, index) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === index) return
        setFiles(prev => {
            const arr = [...prev]
            const item = arr[dragIndex]
            arr.splice(dragIndex, 1)
            arr.splice(index, 0, item)
            return arr
        })
        setDragIndex(null)
    }
    return (
        <div className="drop-zone" onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()}>
            <div className="preview-container">
                {files.map((img, i) => (
                    <div
                        key={i}
                        className="preview-image"
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e)=>e.preventDefault()}
                        onDrop={(e)=>handleDropImage(e, i)}
                    >
                        <button onClick={() => removeFile(i)}>X</button>
                        <img src={img.url} alt="preview" draggable={false}/>
                    </div>
                ))}
                {files.length < MAX_FILES && (
                    <>
                        <button onClick={openGallery}>
                            Añadir imágenes
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={inputRef}
                            style={{ display: "none" }}
                            onChange={handleChange}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

function UpdateHistorial(){
    const {id}=useParams()
    const [loading, setLoading]=useState(true)
    const [error, setError]=useState(null)
    const [errorUpdate, setErrorUpdate]=useState(null)
    const [claim, setClaim]=useState(null)
    const [newStatus, setNewStatus] = useState("")
    const [message, setMessage] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [files, setFiles] = useState([])
    useEffect(()=>{
        const getClaim=async()=>{
            setLoading(true)
            setError(null)
            try {
                const res = await api.get(`reclamations/reclamation/${id}`)
                setClaim(res.data)
                setNewStatus(res.data.current_status)
            } catch (error) {
                setError(getErrorMessage(error))
            }finally{
                setLoading(false)
            }
        }
        getClaim()
    },[id])
    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!newStatus) {
            setErrorUpdate("Debes seleccionar un estado")
            return
        }
        if (!claim.close && !message.trim()) {
            setErrorUpdate("Debes escribir un mensaje")
            return
        }
        setSubmitting(true)
        setErrorUpdate(null)
        try {
            if (claim.close) {
                await api.patch(`reclamations/reclamation/${id}/reopen`, {
                    status: newStatus
                })
            } else {
                const formData = new FormData()
                formData.append("data", JSON.stringify({
                    status: newStatus,
                    message: message.trim()
                }))
                files.forEach(f => {
                    formData.append("files", f.file)
                })
                await api.patch(
                    `reclamations/reclamation/${id}/status`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                )
            }
            const res = await api.get(`reclamations/reclamation/${id}`)
            setClaim(res.data)
            setNewStatus(res.data.current_status)
            setMessage("")
            setFiles([])
        } catch (error) {
            setErrorUpdate(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }
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
                    ):(<p>Este reclamo aún no fue atendido.</p>)}
                    <p><strong>Estado:</strong> {statusTraductor(claim.current_status)}</p>
                    <p><strong>Tipo:</strong> {claim.type}</p>
                    <p><strong>Razón:</strong> {claim.reason}</p>
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
                {!claim.accepted_terms&&(
                    <form onSubmit={handleUpdate}>
                        <div className="historial-form">
                            <div className="historial-selector">
                                <label><strong>Estado:</strong></label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                >
                                    <option value="open">Abierto</option>
                                    <option value="in_review">En revisión</option>
                                    <option value="resolved">Resuelto</option>
                                    <option value="rejected">Rechazado</option>
                                </select>
                            </div>
                                {claim.close ? (
                                    <p>Este reclamo está cerrado. Puedes reabrirlo.</p>
                                ) : null}
                                {!claim.close && (
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Escribe una actualización del reclamo..."
                                        required
                                    />
                                )}
                            <button type="submit" disabled={submitting}>
                                {!claim.close?submitting ? "Actualizando..." : "Actualizar":submitting ? "Reabriendo..." : "Reabrir"}
                            </button>
                            {errorUpdate&&<p className="create-error">{errorUpdate}.</p>}
                        </div>
                        <div className="provess-content">
                            <h2>Pruebas</h2>
                            <EvidenceUploader 
                                files={files}
                                setFiles={setFiles}
                                setError={setErrorUpdate}
                            />
                        </div>
                    </form>
                    )}
                {!claim.history || claim.history.length === 0 ? (
                    ""
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
    )
}
export default UpdateHistorial