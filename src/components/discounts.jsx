import { useEffect, useRef, useState } from "react"
import "./discount.css"
import ShowError from "./error"
function ProssessDiscounts({products, onClickProduct}){
    const SLIDE_TIME = 5000
    const remainingTimeRef = useRef(SLIDE_TIME)
    const lastTickRef = useRef(Date.now())
    const wasPausedRef = useRef(false)
    const [progress, setProgress] = useState(100)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [times, setTimes] = useState([])
    const [paused, setPaused] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    useEffect(() => {
        if (products.length > 0) {
            setTimes(products.map(p => p.timeLeft))
        }
    }, [products])
    useEffect(() => {
        if (times.length === 0) return
        const timer = setInterval(() => {
            setTimes(prev =>
                prev.map(t => {
                    if (t <= 1) {
                        window.location.reload()
                    }
                return t - 1
            })
            )
        }, 1000)
        return () => clearInterval(timer)
    }, [times])
    useEffect(() => {
        if (products.length <= 1) return
        if (wasPausedRef.current && !paused) {
            lastTickRef.current = Date.now()
        }
        wasPausedRef.current = paused
        if (paused) {
            lastTickRef.current = Date.now()
            return
        }
        const interval = setInterval(() => {
            const now = Date.now()
            const delta = now - lastTickRef.current
            lastTickRef.current = now
            remainingTimeRef.current -= delta
            if (remainingTimeRef.current <= 0) {
                remainingTimeRef.current = SLIDE_TIME
                setTransitioning(true)
                setTimeout(() => {
                    setCurrentIndex(prev =>
                        prev + 1 >= products.length ? 0 : prev + 1
                    )
                    setTransitioning(false)
                }, 300)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [paused, products.length])
    const currentProduct = {
        ...products[currentIndex],
        timeLeft: times[currentIndex]
    }
    useEffect(() => {
        if (paused) return
        const bar = setInterval(() => {
            const percent =
                (remainingTimeRef.current / SLIDE_TIME) * 100

            setProgress(Math.max(0, percent))
        }, 100)
        return () => clearInterval(bar)
    }, [paused])
    return(
        <ShowDiscount product={currentProduct} onClickProduct={onClickProduct} progress={progress} onHover={setPaused} transitioning={transitioning}/>
    )
}
const discountAdjust=(price,discount)=>{
    const Dis=price*discount/100
    return price-Dis
}
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function TimeAtjust({timeLeft}){
    const seconds=timeLeft%60
    const minutes=Math.floor(timeLeft/60)%60
    const hours=Math.floor(timeLeft/3600)%24
    const days=Math.floor(timeLeft/(24*3600))
    return(
        <div className="dis-time-cont">
            <div className="dis-time">
                <p>DD</p>
                <p>{days.toString().padStart(2,'0')}</p>
            </div>
            <p>:</p>
            <div className="dis-time">
                <p>HH</p>
                <p>{hours.toString().padStart(2,'0')}</p>
            </div>
            <p>:</p>
            <div className="dis-time">
                <p>MM</p>
                <p>{minutes.toString().padStart(2,'0')}</p>
            </div>
            <p>:</p>
            <div className="dis-time">
                <p>SS</p>
                <p>{seconds.toString().padStart(2,'0')}</p>
            </div>
        </div>
    )
}
function ShowDiscount({product,onClickProduct,progress,onHover,transitioning}){
    const images=product.images
    const [index,setIndex]=useState(0)
    const [fade, setFade] = useState(true)
    const image=images[index].url
    const changeImage = (ind) => {
        if (ind === index) return;
        setFade(false);
        setTimeout(() => {
            setIndex(ind);
            setFade(true);
        }, 150);
    };
    return(
        <div className={`scroll-container ${transitioning ? "fade-out" : "fade-in"}`} onClick={onHover} onMouseEnter={()=>onHover(true)} onMouseLeave={()=>onHover(false)}>
            <div className="show-discount-container" onMouseLeave={()=>changeImage(0)}>
                <div className="discount-image-controller">
                    <div className="discount-image-viewer">
                       <img className={`discount-image ${fade ? "show" : "hide"}`} src={image} alt={product.name} />
                       <p className="discount-info">Dsto: {product.discount}%</p>
                        {(product.stock>0&&product.stock<=10)&&<div className="discount-stock"><p>Solo quedan: {product.stock}</p></div>}
                    </div>
                    <div className="discout-bubbles-container">
                        {images.map((imgs,bub)=>{
                            return(
                                <div key={imgs.url}
                                onClick={()=>changeImage(bub)}
                                onMouseEnter={()=>changeImage(bub)}
                                className={`discout-bubble ${(bub===index)?"active":""}`}></div>
                            )
                        })}
                    </div>
                </div>
                <div className="discount-information">
                    <h3>{product.name}</h3>
                    <div className="discount-prices">
                        <p className="normal-price">S/{product.price.toFixed(2)}</p>
                        <p className="discount-price">S/{discountAdjust(product.price,product.discount).toFixed(2)}</p>
                    </div>
                    <p>{truncateText(product.description,200)}</p>
                    <button className="discount-click" onClick={()=>onClickProduct(product._id)}>Aprovecha la oferta</button>
                    <div className="discount-time-display">
                        <h3>Tiempo restante</h3>
                        <TimeAtjust timeLeft={product.timeLeft}/>
                    </div>
                </div>
            </div>
            <div className="discount-progress">
                <div className="discount-progress-bar" style={{ width: `${progress}%` }}/>
            </div>
        </div>
    )
}
function Discounts({products,loading,error,onClickProduct}){
    if(loading){
        return(
            <ShowError error={"Cargando.."}/>
        )
    }
    if(error){
        return(
            <ShowError error={error}/>
        )
    }
    if(products.length<=0){
        return(
            <ShowError error={"No hay descuentos disponibles, recarga la página"}/>
        )
    }
    return(
        <ProssessDiscounts products={products} onClickProduct={onClickProduct}/>
    )
}
export default Discounts