import { useEffect, useState } from "react"
import "./productSelected.css"

const discountAdjust = (price, discount) => {
    const Dis = price * discount / 100
    return price - Dis
}

function TimeAdjust({ timeLeft }) {
    const seconds = timeLeft % 60
    const minutes = Math.floor(timeLeft / 60) % 60
    const hours = Math.floor(timeLeft / 3600) % 24
    const days = Math.floor(timeLeft / (24 * 3600))

    return (
        <div className="dis-time-cont">
            <div className="dis-time"><p>DD</p><p>{days.toString().padStart(2, '0')}</p></div>
            <p>:</p>
            <div className="dis-time"><p>HH</p><p>{hours.toString().padStart(2, '0')}</p></div>
            <p>:</p>
            <div className="dis-time"><p>MM</p><p>{minutes.toString().padStart(2, '0')}</p></div>
            <p>:</p>
            <div className="dis-time"><p>SS</p><p>{seconds.toString().padStart(2, '0')}</p></div>
        </div>
    )
}

function Especifies({ specifies }) {
    if (!specifies || typeof specifies !== "object") return null

    const isNumericKey = (key) => Number.isInteger(Number(key))

    return (
        <ul className="spec-list">
            {Object.entries(specifies).map(([key, value]) => (
                <li key={key} className="spec-item">
                    {!isNumericKey(key) && <strong>{key}: </strong>}
                    {typeof value === "object"
                        ? <Especifies specifies={value} />
                        : <span>{value}</span>}
                </li>
            ))}
        </ul>
    )
}

function ProductSelected({ product, onBuyClick, isStaff, session }) {
    const images = product.images
    const [index, setIndex] = useState(0)
    const [fade, setFade] = useState(true)
    const [value, setValue] = useState(1)
    const [timeLeft, setTimeLeft] = useState(product.timeLeft)
    const image = images[index].url
    const variants = product.variants || []
    const [variantSelected, setVariantSelected] = useState(variants[0] || null)
    const hasVariants = variants.length > 0
    const currentVariant = hasVariants
        ? variantSelected
        : null
    const currentPrice = hasVariants
        ? currentVariant?.price ?? 0
        : product.price ?? 0
    const currentStock = hasVariants
        ? currentVariant?.stock ?? 0
        : product.stock ?? 0
    const changeImage = (ind) => {
        if (ind === index) return
        setFade(false)
        setTimeout(() => {
            setIndex(ind)
            setFade(true)
        }, 150)
    }
    useEffect(() => {
        if (product.discount <= 0) return
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer)
                    window.location.reload()
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [product.discount])
    return (
        <div className="product-selected-container">
            <h2>{product.name}</h2>
            <div className="product-selected-viewer">
                <div className="product-selected-principal">
                    <div className="product-selected-principal-image">
                        <img
                            className={`product-selected-image ${fade ? "show" : "hide"}`}
                            src={image}
                            alt={product.name}
                        />
                        {product.discount > 0 &&
                            <p className="product-selected-discount">
                                Dsto: {product.discount}%
                            </p>
                        }
                        {!hasVariants && currentStock < 10 && currentStock > 0 &&
                            <p className="product-selected-stock">
                                Solo quedan {currentStock}
                            </p>
                        }
                        {!hasVariants && currentStock === 0 &&
                            <p className="product-selected-empty">Agotado</p>
                        }
                    </div>
                    <div className="bar-images" onMouseLeave={() => changeImage(0)}>
                        {images.map((img, ind) => (
                            <div
                                key={img._id || img.url || ind}
                                onMouseEnter={() => changeImage(ind)}
                                className={`image-container ${ind === index ? "selected" : ""}`}
                            >
                                <img src={img.url} alt={product.name} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="product-selected-secondary">
                    <p style={{ fontSize: "25px" }}>
                        <strong>Catalogo:</strong> {product.catalog}
                    </p>
                    <h3>Precio:</h3>
                    <div className="product-selected-price-container">
                        {product.discount > 0 &&
                            <p className="selected-old-price">
                                S/{currentPrice.toFixed(2)}
                            </p>
                        }
                        <p className="selected-new-price">
                            S/{discountAdjust(currentPrice, product.discount).toFixed(2)}
                        </p>
                    </div>
                    {hasVariants &&
                        <div className="options-grid">
                            {variants
                                .slice()
                                .sort((a, b) => a.price - b.price)
                                .map((v) => (
                                    <button
                                        key={v.option}
                                        onClick={() => setVariantSelected(v)}
                                        disabled={v.option === variantSelected?.option}
                                    >
                                        {v.option}
                                    </button>
                                ))
                            }
                        </div>
                    }
                    <div className="product-number-container">
                        <b>Cantidad que desea comprar:</b>
                        <input
                            type="number"
                            min={1}
                            max={currentStock}
                            value={value}
                            onChange={(e) => {
                                let v = Number(e.target.value)
                                if (v < 1) v = 1
                                if (v > currentStock) v = currentStock
                                setValue(v)
                            }}
                        />
                    </div>
                    {product.discount > 0 &&
                        <>
                            <div className="discount-time-display">
                                <h3>Tiempo restante:</h3>
                                <TimeAdjust timeLeft={timeLeft} />
                            </div>

                            {session === false &&
                                <p style={{ fontSize: "16px" }}>
                                    Solo válido para usuarios registrados.
                                </p>
                            }
                        </>
                    }
                    <button
                        className="buy-button"
                        disabled={currentStock === 0 || isStaff}
                        onClick={() => onBuyClick(product, value, variantSelected)}
                    >
                        Añadir al carrito
                    </button>
                </div>
            </div>
            <div className="product-selected-data">
                {product.description?.trim() && (
                    <>
                        <h3>Descripción:</h3>
                        <p>{product.description}</p>
                    </>
                )}
                {product.specifications &&
                    Object.keys(product.specifications).length > 0 && (
                        <>
                            <h3>Especificaciones:</h3>
                            <Especifies specifies={product.specifications} />
                        </>
                    )
                }
            </div>
        </div>
    )
}
export default ProductSelected