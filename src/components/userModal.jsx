import { useEffect, useState } from "react"
import getErrorMessage from "./getError"
import api from "../services/api"
import "./userModal.css"
import { useNavigate } from "react-router-dom"
function UserModal({cart,finish,onClose,mode}){
    const [error, setError] = useState(null)
    const [loading, setLoading]=useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const navigate=useNavigate()
    const [user,setUser] = useState({
        name:"",
        email:"",
        phone:""      
    })
    const closeWithAnimation=()=>{
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const handleChange=(e)=>{
        setUser({
            ...user,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const formattedItems = cart.items.map(item => ({
                product_id: item._id,
                quantity: item.quantity,
                selected_option: item.selected_option
            }))
            const res = await api.post("checkout/anonymous",{
                user_name: user.name,
                user_email: user.email,
                user_phone: user.phone,
                items: formattedItems
            })
            closeWithAnimation()
            finish(res.data.order)
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
    const buildCartWhatsAppMessage = (cart) => {
        let message = "Hola, quiero hacer una compra rápida:\n\n"
        cart.items.forEach(item => {
            message += `• ${item.name}`
            if (item.selected_option) {
                message += ` (${item.selected_option})`
            }
            message += `\nCantidad: ${item.quantity}\n`
            message += `Subtotal: S/${(item.price * item.quantity).toFixed(2)}\n\n`
        })
        message += `Total: S/${cart.total_raw.toFixed(2)}`
        message += `\n\nQuisiera coordinar la compra por este medio.`
        return encodeURIComponent(message)
    }
    const finishWhatsAppCart = () => {
    if (!cart?.items?.length) return
    const phone = "51974321655"
    const message = buildCartWhatsAppMessage(cart)
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    localStorage.removeItem("cart")
    closeWithAnimation()
    navigate("/")
    }
    return(
        <div className="cart-backdrop" onClick={!loading?closeWithAnimation:undefined}>
            <div className={`cart-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button type="button" className="cancel" onClick={!loading ? closeWithAnimation : undefined}>X</button>
                {mode==="buy cart"&&(
                    <form onSubmit={handleSubmit}>
                        <div className="user-form-content">
                            <h2>Ingresa tus datos</h2>
                            <input 
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Nombre"
                                value={user.name}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Correo electronico"
                                value={user.email}
                                onChange={handleChange}
                                required
                            />
                            <input 
                                id="phone"
                                type="text"
                                name="phone"
                                placeholder="Número de telefono"
                                value={user.phone}
                                onChange={handleChange}
                                required
                            />
                            {error&&<p className="error_modal">{error}.</p>}
                        </div>
                        <div className="send-cart-content">
                            <button  type="submit" disabled={loading}>{loading?"Enviando":"Enviar"}</button>
                        </div>
                    </form>
                )}
                {mode==="buy-whatsapp"&&(
                    <div className="whatsapp-options">
                        <h2>¿Quieres hacer la compra rápida?</h2>
                        <p>La orden no se registrará y no podrás realizar ningun reclamo.</p>
                        <div className="buttons-whatsapp-container">
                            <button onClick={finishWhatsAppCart} className="buy-whatsapp-confirm">Si</button>
                            <button onClick={closeWithAnimation} className="buy-whatsapp-deny">No</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default UserModal