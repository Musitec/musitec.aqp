import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import ShowOptions from "../components/showOptions"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import "./adminReclamationBook.css"

function SearchBars({ userEmail, employeeEmail, code, onSearch }) {
    const [user, setUser] = useState(userEmail)
    const [employee, setEmployee] = useState(employeeEmail)
    const [myCode, setMyCode] = useState(code)
    useEffect(() => {
        setUser(userEmail)
        setEmployee(employeeEmail)
        setMyCode(code)
    }, [userEmail, employeeEmail, code])
    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch({
            userEmail: user?.trim() || null,
            employeeEmail: employee?.trim() || null,
            code: myCode?.trim() || null
        })
    }
    return (
        <form className="search-bars" onSubmit={handleSubmit}>
            <div className="inputs-content">
                <input
                    type="text"
                    placeholder="Correo del usuario"
                    value={user || ""}
                    onChange={(e) => setUser(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Correo del empleado"
                    value={employee || ""}
                    onChange={(e) => setEmployee(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Código de la orden"
                    value={myCode || ""}
                    onChange={(e) => setMyCode(e.target.value)}
                />
            </div>
            <div className="search-button-content">
                <button type="submit"><i className="bi bi-search"></i></button>
            </div>
        </form>
    )
}

function formatDateTime(isoString){
    if (!isoString) return "-"
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return "-"
    return new Intl.DateTimeFormat("es-PE",{
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        hour12:false
    }).format(date)
}

function ShowFilters({status, onChangeStatus, text}){
    const statusLabels = ["Todos", "Abiertos", "En revisión", "Resueltos", "Rechazados"]
    const statusValues = ["all", "open", "in_review", "resolved", "rejected"]
    return(
        <>
            <ShowOptions
                title={"Estado"}
                labels={statusLabels}
                values={statusValues}
                option={status}
                onChangeOption={onChangeStatus}
                text={text}
            />
        </>
    )
}

function ShowClaims({claims,onUpdateClick}){
    if(claims.length===0){
        return(
            <div className="err-mess">
                <p>No se encontraron ordenes.</p>
            </div>
        )
    }
    const statusTraductor=(sta)=>{
        if(sta==="open"){
            return "Abierto"
        }else if(sta==="in_review"){
            return "En revisión"
        }else if(sta==="resolved"){
            return "Resuelto"
        }else{
            return "Rechazado"
        }
    }
    return(
        <div className="reclams-grid">
            {claims.map((claim)=>{
                const products = claim.products
                const maxToShow = 4
                const visibleProducts = products!==null?(products.slice(0, maxToShow)):0
                const remaining = products!==null?(products.length - maxToShow):0
                return(
                    <div key={claim.id} className="reclam-container">
                        <p><strong>Código:</strong> {claim.code}</p>
                        <p><strong>Estado:</strong> {statusTraductor(claim.current_status)}</p>
                        {products===null?
                            <div>
                                <strong> Reclamo general:</strong>
                                <p className="empty-products-claim">Abarca toda la orden</p>
                            </div>
                            :
                            <div className="products-claim">
                                <strong>Productos del reclamo:</strong>
                                <ul className="product-list">
                                    {visibleProducts.map((product) => (
                                        <li key={product.product_id}>
                                            {product.name}{" "}
                                            {product.selected_option !== null
                                                ? `(${product.selected_option})`
                                                : ""}
                                        </li>
                                    ))}
                                </ul>
                                {remaining > 0 && (
                                    <p>y {remaining} producto{remaining > 1 ? "s" : ""} más</p>
                                )}
                            </div>
                        }
                        <p>
                            <strong>Creado en:</strong> {formatDateTime(claim.created_at)}
                        </p>
                        <p>
                            <strong>Disponible hasta:</strong> {formatDateTime(claim.due_date)}
                        </p>
                        <button className="update-button" onClick={()=>onUpdateClick(claim.id)}>Actualizar</button>
                    </div>
                )
            })}
        </div>
    )
}

function ShowAdminReclamations(){
    const navigate = useNavigate()
    const [searchParams,setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const userEmailFromUrl = searchParams.get("user_email") || null
    const employeeEmailFromUrl = searchParams.get("employee_email") || null
    const statusFromUrl = searchParams.get("status") || "all"
    const codeFromUrl = searchParams.get("code")||null
    const [page, setPage] = useState(pageFromUrl)
    const [userEmail, setUserEmail] = useState(userEmailFromUrl)
    const [employeeEmail, setEmployeeEmail] = useState(employeeEmailFromUrl)
    const [status, setStatus] = useState(statusFromUrl)
    const [code, setCode] = useState(codeFromUrl)
    const [claims, setClaims] = useState([])
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] =useState(null)
    const handleSearch = ({
        newUserEmail = userEmail,
        newEmployeeEmail = employeeEmail,
        newCode = code
    }) => {
        setUserEmail(newUserEmail)
        setEmployeeEmail(newEmployeeEmail)
        setCode(newCode)
        setPage(0)
    }
    const onUpdateHistorial=(id)=>{
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
        navigate(`/update-claim/${id}/`)
    }
    useEffect(()=>{
        const hasUserSearch = Boolean(userEmail && userEmail.trim())
        const hasEmployeeSearch = Boolean(employeeEmail && employeeEmail.trim())
        const hasCodeSearch = Boolean(code && code.trim())
        setSearchParams({
            page,
            ...(status ? { status } : {}),
            ...(hasUserSearch ? { user_email: userEmail } : {}),
            ...(hasEmployeeSearch ? { employee_email: employeeEmail } : {}),
            ...(hasCodeSearch ? { code } : {})
            
        })
        const getClaims=async()=>{
            setLoading(true)
            setError(null)
            try {
                const res = await api.get("reclamations/reclamations/staff", {
                    params: {
                        page,
                        ...(status!=="all" && { status }),
                        ...(hasUserSearch && { user_email: userEmail }),
                        ...(hasEmployeeSearch && { employee_email: employeeEmail }),
                        ...(hasCodeSearch && { code })
                    }
                })
                setClaims(res.data.data||[])
                setTotal(res.data.total||0)
                setPages(res.data.pages||0)
            } catch (error) {
                setError(getErrorMessage(error))
            }finally{
                setLoading(false)
            }
        }
        getClaims()
    },[page, userEmail, employeeEmail, status, code])
    return(
        <div className="claim-admin-content">
            <div className="claim-admin-inputs">
                <div className="claim-admin-selector">
                    <ShowFilters
                        status={status}
                        onChangeStatus={(sta)=>{
                            setStatus(sta)
                            setPage(0)
                        }}
                        text={userEmail||employeeEmail||code}
                    />
                </div>
                <SearchBars
                    userEmail={userEmail}
                    employeeEmail={employeeEmail}
                    code={code}
                    onSearch={({ userEmail, employeeEmail, code }) => {
                        setUserEmail(userEmail)
                        setEmployeeEmail(employeeEmail)
                        setCode(code)
                        setPage(0)
                    }}
                />
            </div>
            {loading&&(
                <div className="err-mess">
                    <p>Cargando...</p>
                </div>
            )}
            {(!loading && error) && (
                <div className="err-mess">
                    <p>{error}.</p>
                </div>
            )}
            {(!loading && !error) && (
                <div>
                    <ShowClaims claims={claims} onUpdateClick={onUpdateHistorial}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {pages}</p>
                            <button disabled={page>=pages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=pages-1} onClick={()=>setPage(pages-1)}>{">>"}</button>
                        </div>
                        <p>{8*page+1}-{total>8*(page+1)?(8*(page+1)):total} de {total}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShowAdminReclamations