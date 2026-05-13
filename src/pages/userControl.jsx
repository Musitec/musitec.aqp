import api from "../services/api"
import getErrorMessage from "../components/getError"
import ShowOptions from "../components/showOptions"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import "./userControl.css"
const LIMIT = 8
function ShowUser({user, myUser}){
    const navigate=useNavigate()
    const myUserEmail=myUser?.email
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-PE", {
            timeZone: "UTC"
        })
    }
    const viewUserData=(id)=>{
        navigate(`/show-user/${id}`)
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
    return(
        <div className="user-control-content">
            <i className="bi bi-person-circle"></i>
            <p>{user?.email === myUserEmail ? "Tú" : user?.email || "Sin correo"}</p>
            <p><strong>Fecha de nacimiento:</strong> {formatDateOnly(user.date)}</p>
            <p><strong>Creado en:</strong> {new Date(user.created_at).toLocaleString()}</p>
            <button onClick={()=>viewUserData(user.id)}>Revisar usuario</button>
        </div>
    )
}

function ShowUsers({users, myUser}){
    if(users.length<=0){
        return(
            <div className="err-mess">
                <p>No se encontraron usuarios.</p>
            </div>
        )
    }
    return(
        <div className="products-container">
            {users.map((user)=>{
                return(
                    <ShowUser key={user.id} user={user} myUser={myUser}/>
                )
            })}
        </div>
    )
}

function SearchBar({ value, onSearch }) {
    const [text, setText] = useState(value)
    useEffect(() => {
        setText(value)
    }, [value])
    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch(text.trim() || null)
    }
    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Buscar por correo..."
                value={text||""}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Buscar</button>
        </form>
    )
}

function RenderFilters({
    isBlocked,
    role,
    onChangeIsBlocked,
    onChangeRole,
    text
}) {
    const isBlockedValue = isBlocked === null ? "all" : String(isBlocked)
    const roleValue = role === null ? "all" : role
    const isBlockedValues = ["all", "true", "false"]
    const isBlockedLabels = ["Todos", "Bloqueados", "Desbloqueados"]
    const roleValues = ["all", "admin", "moderator", "client"]
    const roleLabels = ["Todos", "Administradores", "Moderadores", "Clientes"]
    const handleIsBlockedChange = (value) => {
        if (value === "all") return onChangeIsBlocked(null)
        return onChangeIsBlocked(value === "true")
    }
    const handleRoleChange = (value) => {
        if (value === "all") return onChangeRole(null)
        return onChangeRole(value)
    }
    return (
        <>
            <ShowOptions
                title={"Filtrar por estado"}
                labels={isBlockedLabels}
                values={isBlockedValues}
                option={isBlockedValue}
                onChangeOption={handleIsBlockedChange}
                text={text}
            />

            <ShowOptions
                title={"Filtrar por rol"}
                labels={roleLabels}
                values={roleValues}
                option={roleValue}
                onChangeOption={handleRoleChange}
                text={text}
            />
        </>
    )
}

function UserControlPannel({myUser}){
    const [searchParams, setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const searchFromUrl = searchParams.get("search") || null
    const roleFromUrl = searchParams.get("role") || null
    const isBlockedParam = searchParams.get("is_blocked")
    const isBlockedFromUrl =
        isBlockedParam === null ? null : isBlockedParam === "true"
    const [page, setPage]=useState(pageFromUrl)
    const [search, setSearch]=useState(searchFromUrl)
    const [isBlocked, setIsBlocked]=useState(isBlockedFromUrl)
    const [role, setRole]=useState(roleFromUrl)
    const [loading,setLoading]=useState(true)
    const [error, setError]=useState(null)
    const [users, setUsers]=useState([])
    const [pages, setPages]=useState(0)
    const [totalUsers, setTotalUsers]=useState(0)
    const onChangeIsBlocked=(value)=>{
        setIsBlocked(value)
        setPage(0)
    }
    const onChangeRole=(value)=>{
        setRole(value)
        setPage(0)
    }
    useEffect(()=>{
        const hasSearch = Boolean(search && search.trim())
        const hasIsBlocked = isBlocked !== null
        const hasRole = Boolean(role && role.trim())
        setSearchParams({
            page,
            ...(hasSearch?{search}:{}),
            ...(hasIsBlocked?{is_blocked:isBlocked}:{}),
            ...(hasRole?{role}:{})
        })
        const getUsers=async()=>{
            setLoading(true)
            setError(null)
            try {
                const res = await api.get("users-control/users",{
                    params:{
                        page,
                        ...(hasSearch?{search}:{}),
                        ...(hasIsBlocked?{is_blocked:isBlocked}:{}),
                        ...(hasRole?{role}:{})
                    }
                })
                setUsers(res.data.data)
                setPages(res.data.pages)
                setTotalUsers(res.data.total)
            } catch (error) {
                setError(getErrorMessage(error))
            }finally{
                setLoading(false)
            }
        }
        getUsers()
    },[page,search,isBlocked,role])
    return(
        <>
            <div className="users-filters-content">
                <div className="users-selector">
                    <RenderFilters isBlocked={isBlocked} role={role} onChangeIsBlocked={onChangeIsBlocked} onChangeRole={onChangeRole} text={search}/>
                </div>
                <div className="users-searcher">
                    <SearchBar
                    value={search}
                        onSearch={(value) => {
                            setSearch(value)
                            setPage(0)
                        }}
                    />
                </div>
            </div>
            {loading&&
               <div className="err-mess">
                    <p>Cargando...</p>
                </div>
            }
            {!loading && error && (
                <div className="err-mess">
                    <p>{error}</p>
                </div>
            )}
            {!loading && !error &&(
                <div className="product-content">
                    <ShowUsers users={users} myUser={myUser}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {pages}</p>
                            <button disabled={page>=pages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=pages-1} onClick={()=>setPage(pages-1)}>{">>"}</button>
                        </div>
                        {totalUsers > 0 ? (
                            <p>
                                {LIMIT * page + 1} - {Math.min(LIMIT * (page + 1), totalUsers)} de {totalUsers}
                            </p>
                        ) : (
                            <p>0 resultados</p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
export default UserControlPannel