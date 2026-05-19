import { useEffect, useRef, useState } from "react"
import api from "../services/api"
import { useSearchParams } from "react-router-dom"
import Popular from "../components/popular"
import getErrorMessage from "../components/getError"
import ShowOptions from "../components/showOptions"
import "./catalog.css"
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
function RenderFilters({order, discounts, onChangeOrder, onChangeDiscount, text}){  
    const orderValues=["popular","newest","price_desc","price_asc"]
    const orderLabels=["Popular","Mas recientes","Mayor a menor precio","Menor a mayor precio"]
    const discountValues=["all","with","without"]
    const discountLabels=["Normal","Con descuento","Sin descuento"]
    return(
        <>
            <ShowOptions
                title={"Ordenar por"}
                labels={orderLabels}
                values={orderValues}
                option={order}
                onChangeOption={onChangeOrder}
                text={null}
            />
            <ShowOptions
                title={"Modo descuento"}
                labels={discountLabels}
                values={discountValues}
                option={discounts}
                onChangeOption={onChangeDiscount}
                text={text}
            />
        </>
    )
}
function RenderCatalog({catalogs,catalog,onChangeCatalog,text}){
    const values = ["all", ...catalogs]
    const labels = ["Todos", ...catalogs]
    return(
        <ShowOptions
            title="Categorias"
            labels={labels}
            values={values}
            option={catalog}
            onChangeOption={onChangeCatalog}
            text={text}
        />
    )
}
function Catalog({onClickProduct}){
    const [searchParams, setSearchParams]=useSearchParams()
    const pageFromUrl = Number(searchParams.get("page")) || 0
    const catalogFromUrl = searchParams.get("catalog") || "all"
    const orderFromUrl = searchParams.get("order") || "popular"
    const discountFromUrl = searchParams.get("discount") || "all"
    const queryTextFromUrl = searchParams.get("query_text") || null
    const [page, setPage] = useState(pageFromUrl)
    const [queryText,setQueryText] = useState(queryTextFromUrl)
    const [maxPages, setMaxPages] = useState(0)
    const [totalProducts, setTotalProducts]=useState(0)
    const [discount,setDiscount]=useState(discountFromUrl)
    const [catalog, setCatalog] = useState(catalogFromUrl)
    const [order,setOrder] = useState(orderFromUrl)
    const [catalogs,setCatalogs]=useState([])
    const [products,setProducts]=useState([])
    const [loading,setLoading]=useState(true)
    const [error, setError]=useState(null)
    useEffect(()=>{
        const hasSearch = Boolean(queryText && queryText.trim())
        setSearchParams({
            page,
            catalog,
            order,
            discount,
            ...(hasSearch ? { query_text: queryText } : {})
        })
        const fetchProducts = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await api.get("products/catalog", {
                    params: {
                        page,
                        catalog,
                        order,
                        discount,
                        ...(hasSearch ? { query_text: queryText } : {})
                    }
                })
                setCatalogs(res.data.catalogs)
                setProducts(res.data.products)
                setMaxPages(res.data.max_pages)
                setTotalProducts(res.data.total_products)
            } catch (err) {
                setError(getErrorMessage(err)||"Error en el servidor")
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    },[page, catalog, order, discount, queryText])
    const productClickHome=(id)=>{
        onClickProduct(id,queryText!==null)
    }
    return(
        <>
            {catalogs.length>0&&
                <div className="filters">
                    <RenderCatalog 
                        catalogs={catalogs} catalog={catalog} 
                        onChangeCatalog={(cat) => {
                            setCatalog(cat);
                            setPage(0);
                        }}
                        text={queryText}
                    />
                    <RenderFilters
                        order={order}
                        discounts={discount}
                        onChangeOrder={(value) => {
                            setOrder(value);
                            setPage(0);
                        }}
                        onChangeDiscount={(value) => {
                            setDiscount(value);
                            setPage(0);
                        }}
                        text={queryText}
                    />
                </div>
            }
            <SearchBar
                value={queryText}
                onSearch={(value) => {
                    setQueryText(value)
                    setPage(0)
                }}
            />
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
                    <Popular products={products} onClickProduct={productClickHome}/>
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
                </div>
            )}
        </>
    )
}
export default Catalog