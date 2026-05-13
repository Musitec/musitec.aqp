import { useState, useEffect } from "react"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import { useNavigate, useParams } from "react-router-dom"
function EditStockPanel({ product }) {
    const navigate = useNavigate()
    const variants = product.variants || []
    const image = product.images[0].url
    const [stock, setStock] = useState(
        variants.length === 0 ? 0 : {}
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    useEffect(() => {
        if (variants.length > 0) {
            const initial = {}
            variants.forEach((v) => {
                initial[v.option] = 0
            })
            setStock(initial)
        }
    }, [variants])
    const cantUpdate = () => {
        if (variants.length === 0) {
            return stock !== null && stock !== "" && Number(stock) !== 0
        } else {
            const values = Object.values(stock)
            const hasValid = values.some(v => Number(v) !== 0)
            return hasValid
        }
    }
    const buildPayload = () => {
        if (variants.length === 0) {
            return Number(stock)
        } else {
            return variants
                .map(v => ({
                    option: v.option,
                    delta: Number(stock[v.option] || 0)
                }))
                .filter(item => item.delta !== 0)
        }
    }
    const updateProduct=async()=>{
        setLoading(true)
        setError(null)
        try {
            const finalStock = buildPayload()
            await api.patch(`product-control/product/${product._id}/stock`,{
                stock:finalStock
            })
            alert("Stock actualizado correctamente")
            navigate("/admin-products")
        } catch (error) {
            alert(`Error al actualizar stock: ${getErrorMessage(error)}`)
        }finally{
            setLoading(false)
        }
    }
    return (
        <div className="create-product-cont">
            <h1>Panel de stock de productos</h1>
            <div className="create-product-flex">
                <div className="drop-zone">
                    <div className="main-image">
                        <img src={image} alt={product.name} />
                    </div>
                </div>
                <div className="create-product-data">
                    <p style={{ fontSize: "40px" }}>
                        <strong>Nombre:</strong> {product.name}
                    </p>
                    <p style={{ fontSize: "30px" }}>
                        <strong>Catálogo:</strong> {product.catalog}
                    </p>
                    {variants.length === 0 ? (
                        <input
                            className="create-product-stock"
                            placeholder="+ / - cantidad"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    ) : (
                        <div className="stock-by-option">
                            {variants.map((v, i) => (
                                <div key={i} className="stock-option-item">
                                    <span>{v.option} (Actual: {v.stock})</span>
                                    <input
                                        placeholder="+ / - cantidad"
                                        type="number"
                                        value={stock[v.option] ?? ""}
                                        onChange={(e) => {
                                            const value = Number(e.target.value)
                                            setStock(prev => ({
                                                ...prev,
                                                [v.option]: value
                                            }))
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <p className="create-error">{error}</p>
                    )}
                    <div className="create-button">
                            <button
                                disabled={!cantUpdate()||loading}
                                onClick={updateProduct}
                            >{loading?"Actualizando":"Añadir stock"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
function ChangeStockView(){
    const {id}=useParams()
    const [loading, setLoading]=useState(true)
    const [error, setError]=useState(null)
    const [product, setProduct]=useState(null)
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
        <EditStockPanel product={product}/>
    )
}
export default ChangeStockView