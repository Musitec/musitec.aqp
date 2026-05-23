import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import Discounts from "../components/discounts"
import Popular from "../components/popular"
import Proyects from "../components/proyects"
import getErrorMessage from "../components/getError"
import "./home.css"

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
                placeholder="Buscar productos..."
                value={text||""}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit"><i className="bi bi-search"></i></button>
        </form>
    )
}

function Home({onClickProduct,session}){
    const [discounts,setDiscounts]=useState([])
    const [loadingDiscount,setLoadingDiscount]=useState(true)
    const [errorDiscount, setErrorDiscount]=useState(null)
    const [queryText,setQueryText] = useState(null)
    const [popular,setPopular]=useState([])
    const [loadingPopular,setLoadingPopular]=useState(true)
    const [errorPopular,setErrorPopular]=useState(null)
    const navigate = useNavigate()
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
        }
        const getTop = async ()=> {
            try {
                const res = await api.get("products/top/8")
                setPopular(res.data.products || [])
            } catch (error) {
                setErrorPopular(getErrorMessage(error))
            }finally{
                setLoadingPopular(false)
            }
        }
        fetchData()
        getTop()
    },[])
    return(
        <>
        <SearchBar
            value={queryText}
                onSearch={(value) => {
                setQueryText(value)
                if(value){
                    navigate(`/products?query_text=${encodeURIComponent(value)}&page=0`)
                }
            }}
        />
        <div className="container">
            <Proyects/>
            <h1>Nuestros descuentos para ti</h1>
            {session===false&&
                <p className="discount-message-home">Solo valido para usuarios registrados.</p>
            }
            <div className="discount">
                <Discounts loading={loadingDiscount} error={errorDiscount} products={discounts} onClickProduct={productClickHome} session={session}/>
            </div>
            <div className="popular">
                <h1>Productos top</h1>
                <Popular loading={loadingPopular} error={errorPopular} products={popular} onClickProduct={productClickHome}/>
            </div>
        </div>
        </>
    )
}
export default Home