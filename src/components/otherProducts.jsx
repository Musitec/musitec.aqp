import { useRef, useState } from "react"
import "./otherProducts.css"
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
function ShowProduct({product,onProductClick}){
    const images=product.images
    const [index,setIndex]=useState(0)
    const [fade, setFade] = useState(true)
    const image=images[index].url
    const changeImage = (ind) => {
        if (ind === index) return;
        setFade(false);
        setTimeout(() => {
            setIndex(ind)
            setFade(true)
        }, 150);
    }
    return(
        <div className="other-product-viewer" onMouseLeave={()=>changeImage(0)} onClick={()=>onProductClick(product._id)}>
            <div className="other-product-img">
                <img className={`other-product-image ${fade ? "show" : "hide"}`} src={image} alt={product.name}/>
                {product.discount>0&&<p className="other-product-discount">Dsto: {product.discount}%</p>}
                {product.stock>0&&product.stock<10&&<p className="other-product-stock">Solo quedan {product.stock}</p>}
                {product.stock===0&&<p className="other-product-empty">Agotado</p>}
            </div>
            <div className="other-product-bubbles">
                {images.map((img,ind)=>{
                    return(
                        <div key={`${img.url}-${ind}`}
                        className={`other-bubble ${(ind===index)?"active":""}`}
                        onClick={()=>changeImage(ind)}
                        onMouseEnter={()=>changeImage(ind)}></div>
                    )
                })}
            </div>
            <h3>{truncateText(product.name,20)}</h3>
            <div className="other-product-price-content">
                <p>Precio:</p>
                <div className="other-product-price-container">
                    {product.discount>0&&<p className="other-product-old-price">S/{product.price.toFixed(2)}</p>}
                    <p className="other-product-new-price">S/{priceDiscounted(product.price,product.discount).toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}
function OtherProducts({products,onProductClick}){
    const barRef=useRef(null)
    const [isDown, setIsDown] = useState(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)
    const handleWheel = (e) => {
        if (!barRef.current) return
        barRef.current.scrollLeft += e.deltaY
    }
    const handleMouseDown = (e) => {
        setIsDown(true)
        startX.current = e.pageX - barRef.current.offsetLeft
        scrollLeft.current = barRef.current.scrollLeft
    }
    const handleMouseLeave = () => setIsDown(false)
    const handleMouseUp = () => setIsDown(false)
    const handleMouseMove = (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - barRef.current.offsetLeft
        const walk = (x - startX.current) * 1.5
        barRef.current.scrollLeft = scrollLeft.current - walk
    }
    return(
        <div className="bar-container">
            <h2>Otros Productos</h2>
            <div className="bar">
                <div className="bar-scroll"
                    ref={barRef} 
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}>
                    <div className="bar-buttons">
                        {products.map((prod)=>{
                            return(
                                <ShowProduct key={prod._id} product={prod} onProductClick={onProductClick}/>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default OtherProducts