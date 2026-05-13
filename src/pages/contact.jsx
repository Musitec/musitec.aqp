import { useState, useEffect } from "react"
import api from "../services/api"
import Confetti from "react-confetti"
import "./contact.css"
import getErrorMessage from "../components/getError"
function Contact(){
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("success")
    const [modalMessage, setModalMessage] = useState("")
    const [great,setGreat] = useState(false)
    const [form, setForm]=useState({
        name:"",
        email:"",
        subject:"",
        message:""
    })
    const handleChange=(e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        try {
            await api.post("contact/send-request",form)
            setForm({
                name:"",
                email:"",
                subject:"",
                message:""
            })
            setModalType("success")
            setModalMessage("Tu mensaje fue enviado correctamente.")
            setShowModal(true)
        } catch (err) {
            const msg = getErrorMessage(err)
            setModalType("error")
            setModalMessage(msg)
            setShowModal(true)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        if (!great) return
            const timer = setTimeout(() => {
                setGreat(false)
            }, 4000)
        return () => clearTimeout(timer)
    }, [great])
    return(
        <>
            <section className="contact-section">
                <div className="contact-div">
                    <div className="presentation">
                        <div className="pres">
                            <h1>Contáctanos</h1>
                            <p>
                                ¿Tienes dudas, sugerencias o necesitas ayuda con un pedido?
                                En <strong>Musitec</strong> estamos aquí para escucharte.  
                                Completa el formulario o comunícate por nuestras redes.
                            </p>
                        </div>
                        <div className="options">
                            <h2>Información de la tienda</h2>
                            <p><strong>RUC:</strong> 10481821211</p>
                            <p><strong>Dirección:</strong> Calle Pizarro 341 segundo piso tienda 103</p>
                            <p><strong>Teléfono:</strong> +51 974 321 655</p>
                            <p><strong>Correo:</strong> musitec.aqp.peru@gmail.com</p>
                            <p><strong>Horario:</strong> Lunes a Sábado, 10:00AM - 8:00PM</p>
                        </div>
                    </div>
                </div>
                <div className="map-container">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d956.857992916296!2d-71.53379803049651!3d-16.40287341249841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91424a5637694df5%3A0xeffe22781ccf99c!2sPizarro%20341%2C%20Arequipa%2004001!5e0!3m2!1ses-419!2spe!4v1760463900845!5m2!1ses-419!2spe" width="100%" height="450"  allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <h2>¿Tienes una consulta?</h2>
                    <p>Completa el formulario y te responderemos</p>
                    <div className="form-group">
                        <label htmlFor="name">Nombre:</label>
                        <input 
                            id="name"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico:</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Asunto:</label>
                        <input
                            id="subject" 
                            type="text"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Mensaje:</label>
                        <textarea
                            id="message"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="contact-btn" type="submit" disabled={loading}>{loading?"Enviando...":"Enviar"}</button>
                </form>
            </section>
            {showModal && (
                <div className="modal-backdrop">
                    <div className={`modal ${modalType}`}>
                        <h3>
                            {modalType === "success" ? "¡Éxito!" : "Error"}
                        </h3>
                        <p>{modalMessage}</p>
                        <button
                            onClick={() => {
                                setShowModal(false)

                                if (modalType === "success") {
                                    setGreat(true)
                                }
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
            {great && (
                <div className="confetti-layer">
                    <Confetti />
                </div>
            )}
        </>
    )
}
export default Contact