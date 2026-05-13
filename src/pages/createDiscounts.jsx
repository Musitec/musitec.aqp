import { useEffect, useState } from "react"
import api from "../services/api"
import { useNavigate, useParams } from "react-router-dom"
import getErrorMessage from "../components/getError"
function ShowPanelDiscount({product}){
    const image=product.images[0].url
    const [error, setError]=useState(null)
    const [loading, setLoading]=useState(false)
    const [discount, setDiscount]=useState(null)
    const [days, setDays]=useState(null)
    const [hours, setHours]=useState(null)
    const [minutes, setMinutes]=useState(null)
    const navigate=useNavigate()
    const createDiscount=async()=>{
        setError(null)
        setLoading(true)
        try {
            await api.patch(`product-control/product/${product._id}/discount`,{
                discount,
                days,
                hours,
                minutes
            })
            alert("Descuento creado correctamente")
            navigate("/admin-products")
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        setError(null)
        if(discount<=0 && discount!==null){
            setError("Descuento debe ser mayor a 0")
        }
        if(discount>40){
            setError("Descuento no puede ser mayor a 40")
        }
        if(days<0){
            setError("Dias no puede ser negativo")
        }
        if(days>7){
            setError("Dias no puede ser mayor a 7")
        }
        if(hours<0){
            setError("Horas no puede ser negativo")
        }
        if(hours>23){
            setError("Horas no puede ser mayor a 23")
        }
        if(minutes<0){
            setError("Minutos no puede ser negativo")
        }
        if(minutes>59){
            setError("Minutos no puede ser mayor a 59")
        }
        if(Number(days) === 0 && Number(hours) === 0 && Number(minutes) === 0 && days!==null && hours!==null && minutes!==null){
            setError("El descuento debe durar al menos un minuto")
        }
    },[discount, days, hours, minutes])
    return(
        <div className="create-product-cont">
            <h1>Panel de descuentos</h1>
            <div className="create-product-flex">
                <div className="drop-zone">
                    <div className="main-image">
                        <img src={image} alt={product.name} />
                    </div>
                </div>
                <div className="create-product-data">
                    <p style={{fontSize:"40px"}}><strong>Nombre:</strong> {product.name}</p>
                    <p style={{fontSize:"30px"}}><strong>Catálogo:</strong> {product.catalog}</p>
                    <div className="create-discount-container">
                        <div className="discount-percent">
                            <strong style={{fontSize:"30px"}}>Porcentaje:</strong>
                            <input 
                                type="number"
                                placeholder="Descuento"
                                min={1}
                                max={40}
                                value={discount}
                                onChange={(e)=>setDiscount(e.target.value)}
                            />
                        </div>
                        <strong style={{fontSize:"30px"}}>Duración del descuento:</strong>
                        <div className="discount-time-adjust">
                            <input
                                type="number"
                                placeholder="Dias"
                                min={0}
                                max={7}
                                value={days}
                                onChange={(e)=>{setDays(e.target.value)}}
                            />
                            <p>:</p>
                            <input 
                                type="number"
                                placeholder="Horas"
                                min={0}
                                max={23}
                                value={hours}
                                onChange={(e)=>{setHours(e.target.value)}}
                            />
                            <p>:</p>
                            <input
                                type="number"
                                placeholder="Minutos"
                                min={0}
                                max={59}
                                value={minutes}
                                onChange={(e)=>{setMinutes(e.target.value)}}
                            />
                        </div>
                        {error && (
                            <p className="create-error">{error}</p>
                        )}
                        <div className="create-button">
                            <button
                                disabled={
                                    loading||
                                    !discount||
                                    discount<=0||
                                    days===null||
                                    days<0||
                                    hours===null||
                                    hours<0||
                                    minutes===null||
                                    minutes<0||
                                    (Number(days) === 0 && Number(hours) === 0 && Number(minutes) === 0)
                                }
                                onClick={createDiscount}
                            >{loading?"Creando...":"Crear descuento"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
function CreateDiscount(){
    const {id}=useParams()
    const [product,setProduct]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(null)
    const getProduct=async()=>{
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`product-control/product-get/${id}`)
            setProduct(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false) 
        } 
    }
    useEffect(()=>{
        getProduct()
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
        <ShowPanelDiscount product={product}/>
    )
}
export default CreateDiscount