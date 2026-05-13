import { useEffect, useState } from "react"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import "./formReclamationBook.css"
import { useNavigate } from "react-router-dom"
function CircleSelector({active}){
    return(
        <span className="circle-container">
            {active&&(
                <span className="circle-selected"></span>
            )}
        </span>
    )
}
function FormReclamation(){
    const [loading, setLoading]=useState(false)
    const [loadingProducts, setLoadingProducts]=useState(false)
    const [error, setError]=useState(null)
    const [availableProducts, setAvailableProducts] = useState([]) 
    const [showProductSelector, setShowProductSelector] = useState(false)
    const [isGeneral, setIsGeneral] = useState(true)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [form, setForm] = useState({
        name: "",
        lastname: "",
        user_email: "",
        document_type: "dni",
        reclamation_type: "reclamo",
        document_number: "",
        address: "",
        phone: "",
        claimed_amount: "",
        customer_request: "",
        code: "",
        products: [],
        reason: ""
    })
    const navigate = useNavigate()
    const openWhatsApp = (reclamation) => {
        if (!reclamation) return
        let message = `*Nuevo Reclamo*\n\n`
        message += `Código: ${reclamation.code}\n`
        message += `Cliente: ${reclamation.user?.name}\n`
        message += `Orden: ${reclamation.order}\n`
        message += `Tipo: ${reclamation.type}\n\n`
        if (!reclamation.products || reclamation.products.length === 0) {
            message += `Aplica a: Toda la orden\n\n`
        } else {
            message += `Productos:\n`
            reclamation.products.forEach(p => {
                message += `• ${p.name}`
                if (p.selected_option) {
                    message += ` (${p.selected_option})`
                }
                message += `\n`
            })
            message += `\n`
        }
        message += `Motivo:\n${reclamation.reason}`
        message += `Dirección: ${reclamation.user?.address}\n`
        message += `Teléfono: ${reclamation.user?.phone}\n`
        if (reclamation.claimed_amount) {
            message += `Monto reclamado: S/ ${reclamation.claimed_amount}\n`
        }
        message += `\nSolicitud del cliente:\n${reclamation.customer_request}\n\n`
        const encodedMessage = encodeURIComponent(message)
        const phone = "51974321655"
        const url = `https://wa.me/${phone}?text=${encodedMessage}`
        window.open(url, "_blank")
    }
    const getProducts=async()=>{
        setLoadingProducts(true)
        setError(null)
        try {
            const res = await api.get(`reclamations/order/${form.code}/items`, {
                params:{
                    user_email: form.user_email
                }
            })
            setShowProductSelector(true)
            setAvailableProducts(res.data || [])
        } catch (error) {
            setAvailableProducts([])
            setError(getErrorMessage(error)||"Error en la conexion")
        }finally{
            setLoadingProducts(false)
        }
    }
    const addProduct = (product) => {
        const exists = form.products.some(p => 
            p.product_id === product.product_id &&
            p.selected_option === product.selected_option
        )
        if (exists) {
            setError("Este producto ya fue agregado")
            setTimeout(() => setError(null), 3000)
            return
        }
        setForm(prev => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    product_id: product.product_id,
                    selected_option: product.selected_option || null
                }
            ]
        }))
    }
    const removeProduct = (index) => {
        setForm(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }))
    }
    const reclamationTypes = [
        { label: "Reclamo", value: "reclamo", description: "Cuando no se cumplió con lo ofrecido" },
        { label: "Queja", value: "queja", description: "Cuando hay inconformidad con el servicio" }
    ]
    const handleChange=(e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        })
    }
    const documentTypes = [
        { label: "DNI", value: "dni" },
        { label: "CE", value: "ce" },
        { label: "PASAPORTE", value: "pasaporte" },
        { label: "RUC", value: "ruc" },
        { label: "BREVETE", value: "brevete" }
    ]
    const handleDocumentTypeChange = (e) => {
        setForm({
            ...form,
            document_type: e.target.value
        })
    }
    const handleReclamationTypeChange = (e) => {
        setForm({
            ...form,
            reclamation_type: e.target.value
        })
    }
    const handleSelectGeneral = () => {
        setIsGeneral(true)
        setSelectedProducts([])
        setForm(prev => ({
            ...prev,
            products: []
        }))
    }
    const handleToggleProduct = (product) => {
        setIsGeneral(false)
        setSelectedProducts(prev => {
            const exists = prev.some(p => 
                p.product_id === product.product_id &&
                p.selected_option === product.selected_option
            )
            let updated
            if (exists) {
                updated = prev.filter(p => !(
                    p.product_id === product.product_id &&
                    p.selected_option === product.selected_option
                ))
            } else {
                updated = [
                    ...prev,
                    {
                        product_id: product.product_id,
                        selected_option: product.selected_option || null
                    }
                ]
            }
            if (updated.length === 0) {
                setIsGeneral(true)
            }
            setForm(prevForm => ({
                ...prevForm,
                products: updated
            }))
            return updated
        })
    }
    useEffect(() => {
        setIsGeneral(true)
        setSelectedProducts([])
        setAvailableProducts([])
        setShowProductSelector(false)
        setForm(prev => ({
            ...prev,
            products: []
        }))
    }, [form.code])
    const isValidOrderCode = (code) => {
        return /^ORD-\d{4}-\d{6}$/i.test(code)
    }
    useEffect(() => {
        const timeout = setTimeout(() => {
            const validEmail = form.user_email.includes("@")
            const validOrder = form.code && isValidOrderCode(form.code)
            if (validEmail && validOrder) {
                getProducts()
            }
        }, 800) 
        return () => clearTimeout(timeout)
    }, [form.code, form.user_email])
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const payload = {
                ...form,
                claimed_amount: !isNaN(Number(form.claimed_amount)) && form.claimed_amount !== ""
                    ? Number(form.claimed_amount)
                    : null
            }
            const res = await api.post("reclamations/reclamation", payload)
            const reclamation = res.data?.data
            openWhatsApp(reclamation)
            setForm({
                name: "",
                lastname: "",
                user_email: "",
                document_type: "dni",
                reclamation_type: "reclamo",
                document_number: "",
                address: "",
                phone: "",
                claimed_amount: "",
                customer_request: "",
                code: "",
                products: [],
                reason: ""
            })
            navigate("/")
        } catch (error) {
            setError(getErrorMessage(error) || "Error al enviar el reclamo")
        }finally{
            setLoading(false)
        }
    }
    return(
        <div className="create-reclam-container">
            <h1>¿Tienes alguna queja o reclamo?</h1>
            <form onSubmit={handleSubmit}>
                <div className="reclam-form">
                    <div className="user-form">
                        <h2>Datos del Usuario</h2>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Tu nombre"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="text"
                            name="lastname"
                            id="lastname"
                            placeholder="Tu apellido"
                            value={form.lastname}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="email"
                            name="user_email"
                            id="email"
                            placeholder="Tu correo"
                            value={form.user_email}
                            onChange={handleChange}
                            required
                        />
                        <div className="document">
                            <select 
                                id="document_type"
                                value={form.document_type}
                                onChange={handleDocumentTypeChange}
                                required
                            >
                                {documentTypes.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="middle"></div>
                            <input 
                                type="text"
                                name="document_number"
                                id="document_number"
                                placeholder="Tu documento"
                                value={form.document_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <input 
                            type="text"
                            name="address"
                            placeholder="Dirección"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="text"
                            name="phone"
                            placeholder="Teléfono"
                            pattern="^\+?\d{6,20}$"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="order-reclam-info">
                        <h2>Información de la Orden</h2>
                        <input 
                            type="text"
                            name="code"
                            id="code"
                            placeholder="ID de la orden"
                            value={form.code}
                            onChange={handleChange}
                            required
                        />
                       <select 
                            value={form.reclamation_type}
                            onChange={handleReclamationTypeChange}
                            required
                        >
                            {reclamationTypes.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label} - {option.description}
                                </option>
                            ))}
                        </select>
                        <div className="selectors-container">
                            <h3>Especifica tu queja y/o reclamo</h3>
                            <div onClick={handleSelectGeneral} className="selector-container">
                                <CircleSelector active={isGeneral} />
                                General (engloba la orden completa)
                            </div>
                            {(!showProductSelector&&!loadingProducts)&&<p style={{fontSize:"12px",padding: "0 10px"}}>Ingresa tu correo y el ID de tu orden</p>}
                            {loadingProducts && <p style={{fontSize:"12px",padding: "0 10px"}}>Cargando productos...</p>}
                            {showProductSelector && availableProducts.length === 0 && (
                                <p style={{fontSize:"12px",padding: "0 10px"}}>No se encontraron productos</p>
                            )}
                            {availableProducts.map((product, idx) => {
                                const isSelected = selectedProducts.some(p =>
                                    p.product_id === product.product_id &&
                                    p.selected_option === product.selected_option
                                )
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => handleToggleProduct(product)}
                                        className="selector-container"
                                    >
                                        <CircleSelector active={isSelected} />
                                        {product.quantity} {product.quantity > 1 ? "unidades" : "unidad"} de {product.name}
                                        {product.selected_option && (
                                            <span> ({product.selected_option})</span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <textarea
                            id="reason"
                            name="reason"
                            placeholder="Escribe tu inquietud"
                            value={form.reason}
                            onChange={handleChange}
                            required
                        />
                        <textarea
                            name="customer_request"
                            placeholder="Ej: Solicito devolución del dinero / cambio del producto / solución al problema"
                            value={form.customer_request}
                            onChange={handleChange}
                            required
                        />
                        <input 
                            type="number"
                            name="claimed_amount"
                            placeholder="Monto reclamado (opcional)"
                            value={form.claimed_amount}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                {error&&<p className="create-error">{error}.</p>}
                <button type="submit" disabled={loading}>{loading?"Enviando...":"Enviar"}</button>
            </form>
            <p>Este establecimiento cuenta con Libro de Reclamaciones conforme a ley</p>
        </div>
    )
}
export default FormReclamation