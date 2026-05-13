import { useEffect, useState } from "react"
import api from "../services/api"
import Discounts from "../components/discounts"
import Popular from "../components/popular"
import Proyects from "../components/proyects"
import "./home.css"
import getErrorMessage from "../components/getError"
function Home({onClickProduct,session}){
    const [discounts,setDiscounts]=useState([])
    const [loadingDiscount,setLoadingDiscount]=useState(true)
    const [errorDiscount, setErrorDiscount]=useState(null)
    const [popular,setPopular]=useState([])
    const [loadingPopular,setLoadingPopular]=useState(true)
    const [errorPopular,setErrorPopular]=useState(null)
    const productClickHome=(id)=>{
        onClickProduct(id,false)
    }
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await api.get("products/discounts")
                setDiscounts(res.data.products || [])
            } catch (error) {
                setErrorDiscount(getErrorMessage(error))
            } finally {
                setLoadingDiscount(false)
            }
            try {
                const top = await api.get("products/top/8")
                setPopular(top.data.products||[])
            } catch (error) {
                setErrorPopular(getErrorMessage(error))
            }finally{
                setLoadingPopular(false)
            }
        }
        fetchData()
    },[])
    return(
    <div className="container">
        <Proyects/>
        <h1>Nuestros descuentos para ti</h1>
        {session===false&&
            <p style={{fontSize:"16px", margin: "5px 40px"}}>Solo valido para usuarios registrados.</p>
        }
        <div className="discount">
            <Discounts loading={loadingDiscount} error={errorDiscount} products={discounts} onClickProduct={productClickHome} session={session}/>
        </div>
        <h1>Los productos top</h1>
        <div className="popular">
            <Popular loading={loadingPopular} error={errorPopular} products={popular} onClickProduct={productClickHome}/>
        </div>
    </div>
    )
}
export default Home