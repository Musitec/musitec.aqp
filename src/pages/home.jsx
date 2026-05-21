import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
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
    const [searchParams,setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const queryTextFromUrl = searchParams.get("query_text") || null
    const [discounts,setDiscounts]=useState([])
    const [loadingDiscount,setLoadingDiscount]=useState(true)
    const [errorDiscount, setErrorDiscount]=useState(null)
    const [page, setPage] = useState(pageFromUrl)
    const [maxPages, setMaxPages] = useState(0)
    const [totalProducts, setTotalProducts]=useState(0)
    const [queryText,setQueryText] = useState(queryTextFromUrl)
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
        }
        fetchData()
    },[])
    useEffect(()=>{
        const hasSearch = Boolean(queryText && queryText.trim())
        setSearchParams({
            page,
            ...(hasSearch ? { query_text: queryText } : {})
        })
        const fetchCatalog = async () => {
            setLoadingPopular(true)
            try {
                const res = await api.get("products/catalog", {
                    params: {
                        page,
                        ...(hasSearch ? { query_text: queryText } : {})
                    }
                })
                setPopular(res.data.products || [])
                setMaxPages(res.data.max_pages)
                setTotalProducts(res.data.total_products)
            } catch (error) {
                setErrorPopular(getErrorMessage(error))
            } finally {
                setLoadingPopular(false)
            }
        }
        fetchCatalog()
    },[page, queryText])
    return(
        <>
        <SearchBar
            value={queryText}
                onSearch={(value) => {
                setQueryText(value)
                setPage(0)
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
                <h1>Productos de la busqueda</h1>
                <Popular loading={loadingPopular} error={errorPopular} products={popular} onClickProduct={productClickHome}/>
            </div>
        </div>
        <div className="pagination">
            <div className="page-buttons">
                <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                <p>Pag. {page+1} de {maxPages}</p>
                <button disabled={page>=maxPages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                <button disabled={page>=maxPages-1} onClick={()=>setPage(maxPages-1)}>{">>"}</button>
            </div>
            <p>{8*page+1}-{totalProducts>8*(page+1)?(8*(page+1)):totalProducts} de {totalProducts}</p>
        </div>
        </>
    )
}
export default Home