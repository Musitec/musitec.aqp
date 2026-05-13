import { useNavigate } from "react-router-dom"
import "./footer.css"
function Footer({user}){
    const navigate=useNavigate()
    const reloadPage=(route)=>{
        navigate(route),
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
    const reclamationBook=()=>{
        if(user===null){
            reloadPage("/reclamation")
        }else if(user?.role==="client"){
            reloadPage("/reclamation-user")
        }else{
            reloadPage("/reclamation-staff")
        }
    }
    return(
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <h3>RUC: 10481821211</h3>
                </div>
                <div className="footer-section links">
                    <h4>Enlaces útiles</h4>
                    <button onClick={()=>reloadPage("/")}>Inicio</button>
                    <button onClick={()=>reloadPage("/products")}>Catálogo</button>
                    <button onClick={()=>reloadPage("/about-us")}>Sobre nosotros</button>
                    <button onClick={()=>reloadPage("/contact-us")}>Contactanos</button>
                    <button onClick={reclamationBook}>
                        <i className="bi bi-book"></i>
                        <p>Libro de reclamaciones</p>
                    </button>
                </div>
                <div className="footer-section social">
                    <h4>Nuestras redes</h4>
                    <div className="social-links">
                        <a href="https://www.facebook.com/musitecaqpstore?locale=es_LA" target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook"></i></a>
                        <a href="https://www.instagram.com/musitecaqp/" target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
                        <a href="https://www.tiktok.com/@musitecstore" target="_blank" rel="noopener noreferrer"><i className="bi bi-tiktok"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Musitec AQP. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
export default Footer