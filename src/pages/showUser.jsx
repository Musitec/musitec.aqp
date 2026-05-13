import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import ShowOptions from "../components/showOptions"
import ShowPanelUserModal from "../components/panelUserModal"
import "./showUser.css"

const email = import.meta.env.VITE_SUPPORT_EMAIL

const roleTraductor=(role)=>{
        if(role==="client"){
            return "cliente"
        }else if(role==="moderator"){
            return "moderador"
        }else{
            return "administrador"
        }
    }   

function UserHistory({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="err-mess">
                <p>Sin historial.</p>
            </div>
        )
    }

    return (
        <ul className="user-history">
            {history.map((item, index) => (
                <li key={index} className="history-item">
                    <p><strong>Mensaje:</strong> {item.message}</p>
                    <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(item.made_at).toLocaleString("es-PE")}
                    </p>
                    <p><strong>Rol:</strong> {roleTraductor(item.role)}</p>
                </li>
            ))}
        </ul>
    )
}

function UserPanel({user,myUser, reloadUser}){
    const [openModal, setOpenModal]=useState(false)
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-PE", {
            timeZone: "UTC"
        })
    }
    const [newRole,setNewRole]=useState(user.role)
    const roleValues=["admin", "moderator", "client"]
    const roleLabels=["Administrador", "Moderador", "Cliente"]
    const [loading, setLoading]=useState(false)
    const [error, setError]=useState(null)
    const openUserModal=()=>{
        setOpenModal(true)
    }
    const onChangeOption=(value)=>{
        setNewRole(value)
    }
    const onClose=()=>{
        setOpenModal(false)
    }
    const finish=async()=>{
        await reloadUser()
    }
    const updateRoleUser=async()=>{
        setLoading(true)
        setError(null)
        try {
            await api.patch("users-control/role",{
                target_user_email: user.email,
                new_role: newRole
            })
            await reloadUser()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    return(
        <>
        <div className="user-panel">
            <h1>Panel de control de usuario</h1>
            <div className="user-data-main">
                <div className="user-logo">
                    <i className="bi bi-person-circle"></i>
                </div>
                <div className="user-panel-data">
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Número de teléfono:</strong> {user.phone}</p>
                    <p><strong>Correo:</strong> {user.email}</p>
                    <p><strong>Rol:</strong> {roleTraductor(user.role)}</p>
                    <p><strong>Sexo:</strong> {user.sex==="male"?"hombre":"mujer"}</p>
                    <p><strong>Fecha de creación:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    <p><strong>Fecha de nacimiento:</strong> {formatDateOnly(user.date)}</p>
                    {user.is_blocked&&<p><strong>Bloqueado en:</strong> {new Date(user.blocked_until).toLocaleString()}</p>}
                </div>
            </div>
            {(user.email!==email&&user.email!==myUser.email)&&(
                <div className="change-user-data">
                    <div className="change-user-role">
                        <ShowOptions 
                            title={"Elegir nuevo rol"}
                            labels={roleLabels}
                            values={roleValues}
                            option={newRole}
                            onChangeOption={onChangeOption}
                            text={null}
                        />
                        <button onClick={()=>updateRoleUser()} disabled={newRole===null||newRole===user.role}>Cambiar rol</button>
                    </div>
                    <div className="block-user">
                        <button onClick={()=>openUserModal()}> {user.is_blocked?"Desbloquear":"Bloquear"}</button>
                    </div>
                </div>
            )}
            {error && (
                <p className="create-error">{error}</p>
            )}
            <UserHistory history={user.history} />
        </div>
        {openModal&&<ShowPanelUserModal blocked={user.is_blocked} onClose={onClose} email={user.email} finish={finish}/>}
        </>
    )
}
function ShowUser({myUser}){
    const {id}=useParams()
    const [user, setUser]=useState(null)
    const [loading, setLoading]=useState(true)
    const [error, setError]=useState(null)
    const getUser=async()=>{
        setLoading(true)
        setError(null)
        try {
            const res=await api.get(`users-control/user/${id}`)
            setUser(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        getUser()
    },[id])
    if(loading){
        return(
            <div className="err-mess">
                <p>Cargando...</p>
            </div>
        )
    }
    if(error){
        return(
            <div className="err-mess">
                <p>{error}.</p>
            </div>
        )
    }
    return(
        <>
            <UserPanel user={user} myUser={myUser} reloadUser={getUser}/>
        </>
    )
}
export default ShowUser