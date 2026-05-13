import { useState,useEffect } from "react"
import api from "../services/api"
import "./editPanel.css"
function EditUserPanel({onClose,updateUser}){
    const [error, setError] = useState(null)
    const [loading, setLoading]=useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const [form,setForm]=useState({
        name:"",
        phone:"",
        sex:"male"
    })
    const handleChange=(e)=>{
        setForm({...form, [e.target.name]: e.target.value})
    }
    const closeWithAnimation=()=>{
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        setError(null)
        const payload = {}
        if (form.name.trim() !== "") payload.name = form.name
        if (form.phone.trim() !== "") payload.phone = form.phone
        if (form.sex) payload.sex = form.sex
        try {
            await api.patch("auth/users/me/",payload)
            closeWithAnimation()
            updateUser()
        } catch (error) {
            const data = error.response?.data
            if (Array.isArray(data?.detail)) {
                const messages = data.detail.map(err => {
                    const field = err.loc?.[1] || "campo"
                    const msg = err.msg || "Error de validación"
                    return `El campo "${field}" ${msg === "Field required" ? "es obligatorio" : msg}`
                })
                setError(messages.join(". "))
            } else {
                setError(data?.detail || "Ocurrió un error, intenta nuevamente")
            }
            console.log(error)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    return(
        <div className="edit-backdrop" onClick={!loading?closeWithAnimation:undefined}>
            <div className={`edit-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="cancel" onClick={!loading ? closeWithAnimation : undefined}>
                    X
                </button>
                <h2>Editar Perfil</h2>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        name="name"
                        placeholder="Nombre:" 
                        value={form.name}
                        onChange={handleChange}
                    />
                    <input 
                        type="tel"
                        name="phone"
                        placeholder="Número de telefono:" 
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <select
                        name="sex"
                        value={form.sex}
                        onChange={handleChange}
                    >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                    {error && <p className="error_modal">{error}.</p>}
                    <button type="submit">{loading?"Actualizando":"Actualizar"}</button>
                </form>
            </div>
        </div>
    )
}
export default EditUserPanel