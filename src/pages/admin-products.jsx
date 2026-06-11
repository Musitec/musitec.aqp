import { useNavigate, useSearchParams } from "react-router-dom"
import api from "../services/api"
import { useEffect, useRef, useState } from "react"
import getErrorMessage from "../components/getError"
import ShowOptions from "../components/showOptions"
import ProductModal from "../components/productModal"
import "./admin-products.css"
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function ShowProducts({showButton, goTo, products, onEditClick, onCreateDiscountClick, onChangeStockClick, reloadProducts}){
    const [openModal, setOpenModal]=useState(false)
    const [mode, setMode]=useState(null)
    const [productSelected, setProductSelected]=useState(null)
    const setBloquedProduct=(product)=>{
        setProductSelected(product)
        setMode("bloqued")
        setOpenModal(true)
    }
    const setDeactivateProduct=(product)=>{
        setProductSelected(product)
        setMode("active")
        setOpenModal(true)
    }
    const closeModal=()=>{
        setOpenModal(false)
        setProductSelected(null)
        setMode(null)
    }
    const finish=()=>{
        setOpenModal(false)
        setProductSelected(null)
        setMode(null)
        reloadProducts()
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
    return(
        <>
        <div className="products-grid">
            {showButton&&(
                <div 
                    className="product-editor create-product-button"
                    onClick={() => goTo("/create-product")}
                >
                    <p className="create-icon">+</p>
                    <p>Crear producto</p>
                </div>
            )}
            {products.map((prod)=>{
                const img=prod.images[0]
                return(
                    <div key={prod.id} className="product-editor">
                        <div className="product-editor-img-container">
                            {prod.discount>0&&<p className="product-discount">Dsto: {prod.discount}%</p>}
                            <img src={img.url} alt={prod.name} />
                        </div>
                        <h3>{truncateText(prod.name,20)}</h3>
                        <p> <strong>Puntos de popularidad:</strong> {prod.popularity}</p>
                        <p> <strong>Stock disponible:</strong> {prod.stock}</p>
                        <div className="buttons-product-flex">
                            <div className="buttons-flex-container">
                                <button className="edit-product" onClick={()=>onEditClick(prod.id)}><strong>Editar</strong></button>
                                {(prod.discount===0&&prod.is_active&&!prod.is_blocked)&&<button className="put-discounts-product" onClick={()=>onCreateDiscountClick(prod.id)}><strong>Poner descuento</strong></button>}
                            </div>
                            <button className="agregate-stock" onClick={()=>onChangeStockClick(prod.id)}>Agregar stock</button>
                            <div className="buttons-flex-container">
                                <button className="alert-product-button" onClick={()=>{setDeactivateProduct(prod)}}><strong>{prod.is_active?"Desactivar":"Activar"}</strong></button>
                                <button className="alert-product-button" onClick={()=>{setBloquedProduct(prod)}}><strong>{prod.is_blocked?"Desbloquear":"Bloquear"}</strong></button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
        {openModal&&<ProductModal product={productSelected} mode={mode} onClose={closeModal} onFinish={finish}/>}
        </>
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
                placeholder="Buscar productos..."
                value={text||""}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit"><i className="bi bi-search"></i></button>
        </form>
    )
}
function ShowInteractions({active,onChangeActive,blocked,onChangeBlocked,stock,onChangeStock,order,onChangeOrder,text}){
    const activeValues=[true,false]
    const activeLabels=["Si","No"]
    const blockedValues=[true,false]
    const blockedLabels=["Si","No"]
    const stockValues=["all","low","out"]
    const stockLabels=["Todos","Bajo stock","Sin stock"]
    const orderValues=["popular","oldest","newest","stock_desc","stock_asc","price_desc","price_asc"]
    const orderLabels=["Popularidad","Mayor a menor edad","Menor a mayor edad","Mayor a menor stock","Mayor a menor precio","Menor a mayor precio"]
    const filtersRef=useRef(null)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if(
                filtersRef.current &&
                !filtersRef.current.contains(e.target)
            ){
                setShowFilters(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
    return(
        <>
        <div className="filters">
            <ShowOptions
                title={"Activados"}
                labels={activeLabels}
                values={activeValues}
                option={active}
                onChangeOption={onChangeActive}
                text={text}
            />
            <ShowOptions
                title={"Bloqueados"}
                labels={blockedLabels}
                values={blockedValues}
                option={blocked}
                onChangeOption={onChangeBlocked}
                text={text}
            />
            <ShowOptions
                title={"Stock"}
                labels={stockLabels}
                values={stockValues}
                option={stock}
                onChangeOption={onChangeStock}
                text={text}
            />
            <ShowOptions
                title={"Orden"}
                labels={orderLabels}
                values={orderValues}
                option={order}
                onChangeOption={onChangeOrder}
                text={text}
            />
        </div>
        <div className="mobile-filters-container" ref={filtersRef}>

        </div>
        </>
    )
}
function ShowDashboardProducts(){
    const navigate=useNavigate()
    const [searchParams,setSearchParams]=useSearchParams()
    const pageFromUrl=Number(searchParams.get("page")) || 0
    const pageSizeFromUrl=Number(searchParams.get("page_size")) || 8
    const blockedFromUrl = searchParams.get("blocked") === "true"
    const activeFromUrl = searchParams.get("active") !== "false"
    const lowStockFromUrl = searchParams.get("low_stock") === "true"
    const outOfStockFromUrl = searchParams.get("out_of_stock") === "true"
    const withDiscountFromUrl = searchParams.get("with_discount") === "true"
    const orderFromUrl=searchParams.get("order")||"popular"
    const searchFromUrl=searchParams.get("search")||null
    const [page, setPage]=useState(pageFromUrl)
    const [pageSize, setPageSize]=useState(pageSizeFromUrl)
    const [blocked, setBlocked]=useState(blockedFromUrl)
    const [active, setActive]=useState(activeFromUrl)
    const [lowStock, setLowStock]=useState(lowStockFromUrl)
    const [outOfStock, setOutOfStock]=useState(outOfStockFromUrl)
    const [withDiscount, setWithDiscount]=useState(withDiscountFromUrl)
    const [order, setOrder]=useState(orderFromUrl)
    const [search, setSearch]=useState(searchFromUrl)
    const [error, setError]=useState(null)
    const [loading, setLoading]=useState(false)
    const [stock, setStock]=useState(null)
    const [maxPages,setMaxPages]=useState(0)
    const [products,setProducts]=useState([])
    const [maxProducts,setMaxProducts]=useState(1)
    const goTo = (route) => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
        navigate(route)
    }
    const updateProductNavigate=(id)=>{
        goTo(`/product-edit/${id}`)
    }
    const createDiscountNavigate=(id)=>{
        goTo(`/create-discount/${id}`)
    }
    const changeStockNavigate=(id)=>{
        goTo(`/change-stock/${id}`)
    }
    const stockValues=(value)=>{
        if(value==="all"){
            setLowStock(false)
            setOutOfStock(false)
        }else if(value==="low"){
            setLowStock(true)
            setOutOfStock(false)
        }else if(value==="out"){
            setLowStock(false)
            setOutOfStock(true)
        }
    }
    const fetchProducts=async()=>{
        const hasSearch=Boolean(search && search.trim())
        if(!lowStock&&!outOfStock){
            setStock("all")
        }else if(lowStock&&!outOfStock){
            setStock("low")
        }else if(!lowStock&&outOfStock){
            setStock("out")
        }
        setSearchParams({
            page,
            page_size: pageSize,
            blocked,
            active,
            low_stock: lowStock,
            out_of_stock: outOfStock,
            with_discount: withDiscount,
            order,
            ...(hasSearch ? { search: search } : {})
        })
        setError(null)
        setLoading(true)
        try {
            const res = await api.get("product-control/product/dashboard",{
                params:{
                    page,
                    page_size: pageSize,
                    blocked,
                    active,
                    low_stock: lowStock,
                    out_of_stock: outOfStock,
                    with_discount: withDiscount,
                    order,
                    ...(hasSearch ? { search: search } : {})
                }
            })
            setProducts(res.data.products||[])
            setMaxPages(res.data.total_pages||1)
            setMaxProducts(res.data.total||1)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchProducts()
    },[page,pageSize,blocked,active,lowStock,outOfStock,withDiscount,order,search])
    const firstPageSize = pageSize - 1
    let start
    let end
    if (page === 0) {
        start = maxProducts > 0 ? 1 : 0
        end = Math.min(firstPageSize, maxProducts)
    } else {
        start = firstPageSize + (pageSize * (page - 1)) + 1
        end = Math.min(start + pageSize - 1, maxProducts)
    }
    return(
        <>
            <SearchBar
                value={search}
                onSearch={(value) => {
                    setSearch(value)
                    setPage(0)
                    setPageSize(8)
                }}
            />
            <ShowInteractions
                active={active}
                onChangeActive={setActive}
                blocked={blocked}
                onChangeBlocked={setBlocked}
                stock={stock}
                onChangeStock={stockValues}
                order={order}
                onChangeOrder={setOrder}
                text={search}
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
                <>
                    <ShowProducts showButton={page===0} goTo={goTo} products={products} onEditClick={updateProductNavigate} onCreateDiscountClick={createDiscountNavigate} onChangeStockClick={changeStockNavigate} reloadProducts={fetchProducts}/>
                    <div className="pagination">
                        <div className="page-buttons">
                            <button disabled={page<=0} onClick={()=>setPage(0)}>{"<<"}</button>
                            <button disabled={page<=0} onClick={()=>setPage((p)=>{return p-1})}>{"<"}</button>
                            <p>Pag. {page+1} de {maxPages}</p>
                            <button disabled={page>=maxPages-1} onClick={()=>setPage((p)=>{return p+1})}>{">"}</button>
                            <button disabled={page>=maxPages-1} onClick={()=>setPage(maxPages-1)}>{">>"}</button>
                        </div>
                        <p>{start}-{end} de {maxProducts}</p>
                    </div>
                </>
            )}
        </>
    )
}
export default ShowDashboardProducts