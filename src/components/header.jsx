import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import EditUserPanel from "./editPanel"
import logo from "../logo/Robot.png"
import LoginModal from "./login"
import api from "../services/api"
import "./header.css"
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function Header({annonimousOrder,user, onEnterSession, onLogout, setLoading,showLogin,setShowLogin,updateUser}){
    const [open, setOpen] = useState(false)
    const userRef = useRef(null)
    const navigate = useNavigate()
    const location=useLocation()
    const [showAnnonimousMenu,setShowAnnonimousMenu]=useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showLogoutPanel, setShowLogoutPanel] = useState(false)
    const [showEditPanel, setShowEditPanel] = useState(false)
    const goTo = (route) => {
        navigate(route)
        setOpen(false)
        setShowLogoutPanel(false)
        setShowUserMenu(false)
    }
    const reclamationBook=()=>{
        if(user===null){
            goTo("/reclamation")
        }else if(user?.role==="client"){
            goTo("/reclamation-user")
        }else{
            goTo("/reclamation-staff")
        }
    }
    const logout = async () => {
        setLoading(true)
        try {
            await api.post("auth/logout")
            onLogout()
            navigate("/")
        } finally {
            setLoading(false)
            setShowLogoutPanel(false)
            setShowUserMenu(false)
        }
    }
    const logoutAll = async () => {
        setLoading(true)
        try {
            await api.post("auth/logout-all")
            onLogout()
            navigate("/")
        } finally {
            setLoading(false)
            setShowLogoutPanel(false)
            setShowUserMenu(false)
        }
    }
    const openEditPanel=()=>{
        setShowEditPanel(true)
        setShowLogoutPanel(false)
        setShowUserMenu(false)
    }
    useEffect(()=>{
         const handleClickOutside = (e) => {
            if (userRef.current && !userRef.current.contains(e.target)) {
                setShowUserMenu(false)
                setShowLogoutPanel(false)
                setShowAnnonimousMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    },[])
    return(
        <header>
            <div className="upper-header">
                <img src={logo} alt="Musitec"/>
                {user===null?
                    <div className="anon-wrapper" ref={userRef}>
                        <div
                            className="anon-container"
                            onClick={() => setShowAnnonimousMenu(prev => !prev)}
                        >
                            <i className="bi bi-person-circle"></i>
                        </div>
                        <div className={`anon-menu desktop ${showAnnonimousMenu ? "open" : ""}`}>
                            <div className="user-menu-header">
                                <p className="hello">Bienvenido</p>
                                <p className="username">Invitado</p>
                            </div>
                            <div className="user-divider"/>
                            <button onClick={() => {
                                setShowLogin(true)
                                setShowAnnonimousMenu(false)
                            }}>
                                Iniciar sesión
                            </button>
                            <button onClick={() => {
                                goTo("/shopping-car")
                                setShowAnnonimousMenu(false)
                            }}>
                                Ver carrito
                            </button>
                        </div>
                        <div className={`anon-menu mobile ${showAnnonimousMenu ? "open" : ""}`}>
                            <div className="user-menu-header">
                                <p className="hello">Bienvenido</p>
                                <p className="username">Invitado</p>
                            </div>

                            <div className="user-divider" />
                            <button className="submenu-toggle" onClick={() => {
                                setShowLogin(true)
                                setShowAnnonimousMenu(false)
                            }}>
                                Iniciar sesión
                            </button>
                            <button className="submenu-toggle" onClick={() => {
                                goTo("/shopping-car")
                                setShowAnnonimousMenu(false)
                            }}>
                                Ver carrito
                            </button>
                        </div>
                    </div>
                :
                <div className="user-wrapper" ref={userRef}>
                    <div
                    className="user-container"
                    onClick={() => setShowUserMenu(prev => !prev)}
                    >
                        <i className="bi bi-person-circle" style={{fontSize:"50px"}}></i>
                        <div className="user-data">
                            <p>Hola: <strong>{truncateText(user.email, 15)}</strong></p>
                            <p>Edad: {user.age} años</p>
                            <p>Sexo: {user.sex === "male" ? "Masculino" : "Femenino"}</p>
                        </div>
                    </div>
                    <div className={`user-menu desktop ${showUserMenu ? "open" : ""}`}>
                        <div className="user-menu-header">
                            <p className="hello">Hola</p>
                            <p className="username">{user.name}</p>
                        </div>
                        <div className="user-divider"/>
                        {user.role==="client"&&
                            <>
                                <button onClick={()=>goTo("/shopping-car")}>Ver carrito</button>
                                <button onClick={()=>goTo("/orders")}>Ver pedidos</button>
                            </>
                        }
                        {(user.role==="admin"||user.role==="moderator")&&
                            <>
                                <button className="submenu-toggle" onClick={()=>goTo("/admin-orders")}>Ordenes</button>
                                <button className="submenu-toggle" onClick={()=>goTo("/admin-products")}>Productos</button>
                                {user.role==="moderator"&&
                                <>
                                    <button className="submenu-toggle" onClick={()=>goTo("/users-control")}>Usuarios</button>
                                </>}
                            </>
                        }
                        <button onClick={openEditPanel}>Editar perfil</button>
                        <div className="logout-wrapper">
                            <button onClick={(e) => {
                                e.stopPropagation()
                                setShowLogoutPanel(prev => !prev)
                            }}>
                                Cerrar sesión
                            </button>
                            <div className={`logout-submenu desktop ${showLogoutPanel ? "open" : ""}`}>
                                <button onClick={logout}>Esta sesión</button>
                                <button onClick={logoutAll} className="danger">Todas las sesiones</button>
                            </div>
                        </div>
                    </div>
                    <div className={`user-menu mobile ${showUserMenu ? "open" : ""}`}>
                        <div className="user-menu-header">
                            <p className="hello">Hola</p>
                            <p className="username">{user.name}</p>
                        </div>
                        <div className="user-divider" />
                        {user.role==="client"&&
                            <>
                                <button className="submenu-toggle" onClick={()=>goTo("/shopping-car")}>Ver carrito</button>
                                <button className="submenu-toggle" onClick={()=>goTo("/orders")}>Ver pedidos</button>
                            </>
                        }
                        {(user.role==="admin"||user.role==="moderator")&&
                            <>
                                <button className="submenu-toggle" onClick={()=>goTo("/admin-orders")}>Ordenes</button>
                                <button className="submenu-toggle" onClick={()=>goTo("/admin-products")}>Productos</button>
                                {user.role==="moderator"&&
                                <>
                                    <button className="submenu-toggle" onClick={()=>goTo("/users-control")}>Usuarios</button>
                                </>}
                            </>
                        }
                        <button className="submenu-toggle" onClick={openEditPanel}>Editar perfil</button>
                        <button
                            className="submenu-toggle"
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowLogoutPanel(prev => !prev)
                            }}
                        >
                            Cerrar sesión
                            <span className={`arrow ${showLogoutPanel ? "open" : ""}`}>⌄</span>
                        </button>
                        <div className={`logout-submenu mobile ${showLogoutPanel ? "open" : ""}`}>
                            <button onClick={logout}>Esta sesión</button>
                            <button onClick={logoutAll} className="danger">Todas las sesiones</button>
                        </div>
                    </div>
                </div>
                }
            </div>
            <div className="burger-container">
                <button
                    className={`burger ${open ? "open" : ""}`}
                    onClick={() => setOpen(prev => !prev)}
                    aria-label="Menú"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <div className={`menu ${open ? "open" : ""}`}>
                <nav className="menu-container">
                    <ul>
                        <li><button onClick={()=>goTo("/")} disabled={location.pathname==="/"}>Inicio</button></li>
                        <li><button onClick={()=>goTo("/products")} disabled={location.pathname==="/products"}>Productos</button></li>
                        <li><button onClick={()=>goTo("/about-us")} disabled={location.pathname==="/about-us"}>Sobre nosotros</button></li>
                        <li><button onClick={()=>goTo("/contact-us")} disabled={location.pathname==="/contact-us"}>Contactanos</button></li>
                    </ul>
                </nav>    
            </div>
            {showLogin && <LoginModal annonimousOrder={annonimousOrder} onClose={() => setShowLogin(false)} onEnterSession={onEnterSession}/>}
            {showEditPanel && <EditUserPanel onClose={()=>setShowEditPanel(false)} updateUser={updateUser}/>}
        </header>
    )
}
export default Header