import logo from "../logo/logo.jpg"
import "./aboutUs.css"
function AboutUs(){
    return(
        <section className="about-container">
            <div className="about-content">
                <div className="about-text">
                    <h1>Sobre Nosotros</h1>
                    <p>
                        En Musitec creemos en hacer que la tecnología y las novedades estén al
                        alcance de todos. Trabajamos constantemente para ofrecer productos modernos,
                        útiles e innovadores, adaptándonos a las nuevas tendencias y a las 
                        necesidades de cada persona.
                    </p>
                    <p>
                        Desde nuestros inicios, nuestro objetivo ha sido brindar una experiencia de
                        compra sencilla, rápida y segura, con atención clara y transparente en cada paso.
                        Buscamos acercar la tecnología a más personas, ofreciendo siempre una excelente
                        relación entre innovación, funcionalidad y precio.
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
                        <h3>Innovación</h3>
                        <p>
                            Apostamos por la innovación en cada uno de nuestros productos,
                            buscando siempre ofrecer soluciones modernas,
                            eficientes y funcionales.
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