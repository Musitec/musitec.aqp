import { useState } from "react"
import "./popular.css"
const priceDiscounted=(price,discount)=>{
    const DB=price*discount/100
    return price-DB
}
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function ShowPopular({product,onClickProduct}){
    const images=product.images
    const [index,setIndex]=useState(0)
    const [fade, setFade] = useState(true)
    const [touchStart, setTouchStart] = useState(null)
    const image=images[index].url
    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchEnd = (e) => {
        if (touchStart === null) return
        const touchEnd = e.changedTouches[0].clientX
        const distance = touchStart - touchEnd
        if (Math.abs(distance) < 50) {
            setTouchStart(null)
            return
        }
        if (distance > 0) {
            changeImage(
                index === images.length - 1 
                ? 0 
                : index + 1
            )
        } else {
            changeImage(
                index === 0 
                ? images.length - 1 
                : index - 1
            )
        }
        setTouchStart(null)
    }
    const changeImage = (ind) => {
        if (ind === index) return
        setFade(false)
        setTimeout(() => {
            setIndex(ind)
            setFade(true)
        }, 150);
    }
    const getDisplayPrice = (product) => {
        if (product.variants && product.variants.length > 0) {
            return Math.min(...product.variants.map(v => v.price))
        }
        return product.price ?? 0
    }
    const basePrice = getDisplayPrice(product)
    const getTotalStock = (product) => {
        if (product.variants && product.variants.length > 0) {
            return product.variants.reduce((acc, v) => acc + v.stock, 0)
        }
        return product.stock ?? 0
    }
    const totalStock = getTotalStock(product)
    return(
        <div className="product-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onMouseLeave={()=>changeImage(0)} onClick={()=>onClickProduct(product._id)}>
            <div className="product-image-viewer">
                <img className={`product-image ${fade ? "show" : "hide"}`} src={image} alt={product.name} />
                {product.discount>0&&<p className="product-discount">Dsto: {product.discount}%</p>}
                {(totalStock>0&&totalStock<10)&&<p className="product-stock">Solo quedan {totalStock}.</p>}
                {totalStock===0&&<p className="product-empty">Agotado</p>}
            </div>
            <div className="product-bubbles-container">
                {images.map((imgs,bub)=>{
                    return(
                        <div key={imgs.url}
                        onClick={()=>changeImage(bub)}
                        onMouseEnter={()=>changeImage(bub)}
                        className={`product-bubble ${(bub===index)?"active":""}`}></div>
                    )
                })}
            </div>
            <h2>{truncateText(product.name,20)}</h2>
            <div className="product-prices-container">
                <p>Precio:</p>
                <div className="product-prices">
                    {product.discount>0&&<p className="product-price-old">S/{basePrice.toFixed(2)}</p>}
                    <p className="product-price-new">S/{priceDiscounted(basePrice,product.discount).toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}
function Popular({products,error,loading,onClickProduct}){
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
    if(products.length===0){
        return(
            <div className="err-mess">
                <p>No se encontraron productos.</p>
            </div>
        )
    }
    return(
        <div className="products-container">
            {products.map((product)=>{
                return(
                    <ShowPopular key={product._id} product={product} onClickProduct={onClickProduct}/>
                )
            })}
        </div>
    )
}
export default Popular