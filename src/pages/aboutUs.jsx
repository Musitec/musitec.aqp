import logo from "../logo/logo.jpg"
import "./aboutUs.css"
function AboutUs(){
    return(
        <section className="about-container">
            <div className="about-content">
                <div className="about-text">
                    <h1>Sobre Nosotros</h1>
                    <p>
                        En <strong>Musitec</strong> nos apasiona ofrecer productos de calidad
                        con un servicio confiable, claro y transparente. Desde nuestros inicios,
                        trabajamos para brindar una experiencia de compra sencilla,
                        rápida y segura.
                    </p>
                    <p>
                        Nuestro objetivo es acercar la tecnología y los productos útiles
                        a todas las personas, ofreciendo siempre una excelente relación
                        entre calidad y precio.
                    </p>
                </div>
                <div className="about-img">
                    <img src={logo} alt="logo"/>
                </div>
            </div>
            <div className="about-values">
                <h2>Nuestros valores</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <h3>Calidad</h3>
                        <p>
                            Seleccionamos cuidadosamente cada producto para asegurar
                            su durabilidad y buen rendimiento.
                        </p>
                    </div>
                    <div className="value-card">
                        <h3>Accesibilidad</h3>
                        <p>
                            Creemos que todos deben tener acceso a productos
                            útiles y tecnología a precios justos.
                        </p>
                    </div>
                    <div className="value-card">
                        <h3>Compromiso</h3>
                        <p>
                            Trabajamos constantemente para mejorar la atención
                            y fortalecer la confianza de nuestros clientes.
                        </p>
                    </div>
                </div>
            </div>
        </section>

    )
}
export default AboutUs