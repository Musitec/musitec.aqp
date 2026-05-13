import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import api from "../services/api"
import ProductSelected from "../components/productSelected"
import OtherProducts from "../components/otherProducts"
import getErrorMessage from "../components/getError"
function Product({onClickProduct,onBuyClick,isStaff,session}){
    const {id} = useParams()
    const [searchParams] = useSearchParams()
    const [product,setProduct] = useState([])
    const [otherProducts,setOtherProducts]=useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)
    const fromSearch = searchParams.get("from_search") === "true"
    const productClickProd=(id)=>{
        onClickProduct(id,false)
    }
    useEffect(()=>{
        setLoading(true)
        const fetchProduct = async () => {
            try {
                const res = await api.post(`products/${id}`, {
                    from_search: fromSearch
                })
                setOtherProducts(res.data.similar_products)
                setProduct(res.data.product)
            } catch (err) {
                setError(getErrorMessage(err)||"Error en la conexion")
            }finally {
                setLoading(false)
            }
        }
        fetchProduct()
    },[id,fromSearch])
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
        <div className="product-viewer-container">
            <ProductSelected product={product} onBuyClick={onBuyClick} isStaff={isStaff} session={session}/>
            <OtherProducts products={otherProducts} onProductClick={productClickProd}/>
        </div>
    )
}
export default Product