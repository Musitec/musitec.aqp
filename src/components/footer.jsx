import { useNavigate } from "react-router-dom"
import "./footer.css"
function Footer({user, isChristmas}){
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
            {isChristmas && (
                <div className="chistmas-lights-content">
                    <div className="christmas-lights">
                        <svg className="lights-cable" viewBox="0 0 1000 40" preserveAspectRatio="none">
                            <path
                                d="
                                    M 0 0
                                    Q 62.5 34 125 0
                                    Q 187.5 34 250 0
                                    Q 312.5 34 375 0
                                    Q 437.5 34 500 0
                                    Q 562.5 34 625 0
                                    Q 687.5 34 750 0
                                    Q 812.5 34 875 0
                                    Q 937.5 34 1000 0
                                "
                                fill="none"
                                stroke="#263c2d"
                                strokeWidth="2.5"
                            />
                        </svg>
                        {Array.from({ length: 9 }).map((_, index) => (
                            <span key={`support-${index}`} className="cable-support" style={{ left: `${index * 12.5}%` }}/>
                        ))}
                        {Array.from({ length: 18 }).map((_, index) => {
                            const x = 2.5 + index * 5.5;
                            const t = (x / 12.5) % 1;
                            const cableY = 68 * t * (1 - t);
                            return (
                                <span
                                    key={`bulb-${index}`}
                                    className={`christmas-bulb bulb-${index % 4}`}
                                    style={{
                                        left: `${x}%`,
                                        top: `${cableY + 3}px`,
                                        transform: `rotate(${index % 2 === 0 ? -12 : 12}deg)`
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
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