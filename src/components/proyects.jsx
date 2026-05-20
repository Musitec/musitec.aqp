import { useEffect, useState } from "react"
import "./proyects.css"
function Proyects(){
    const [showFirst,setShowFirst]=useState(true)
    useEffect(()=>{
        const interval=setInterval(()=>{
            setShowFirst(prev=>!prev)
        },5000)
        return () => clearInterval(interval);
    },[])
    return(
        <div className="hero">
            <div className={`bg bg1 ${showFirst ? "visible" : "hidden"}`}></div>
            <div className={`bg bg2 ${showFirst ? "hidden" : "visible"}`}></div>
            <div className="hero-content">
                <h2>¿Tienes una idea? Nosotros te ayudamos a construirla</h2>
                <p>Desarrollamos proyectos electrónicos personalizados paso a paso contigo.</p>
                <div className="link-content">
                    <a
                        href={`https://wa.me/51974321655?text=${encodeURIComponent(
                            "Hola, tengo una idea de proyecto y me gustaría recibir información."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Escríbenos por WhatsApp <i className='bi bi-whatsapp'></i></a>
                </div>
            </div>
        </div>
    )
}
export default Proyects