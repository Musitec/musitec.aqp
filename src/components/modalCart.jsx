import { useEffect, useState } from "react"
import getErrorMessage from "./getError"
import api from "../services/api"
import "./modalCart.css"

function ShowModalCart({ mode, finish, onClose, product, user }) {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(1)
    const getLocalCart = () => {
        const cart = JSON.parse(localStorage.getItem("cart"))
        return cart || { items: [], total: 0 }
    }
    const saveLocalCart = (cart) => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    const calculateTotal = (items) => {
        return items.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0)
    }
    const closeWithAnimation = () => {
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const getVariantStock = (product) => {
        if (product?.variants?.length) {
            return product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
        }
        return product?.stock || 0
    }
    const deleteProd = async (product) => {
        setLoading(true)
        setError(null)
        try {
            if (user) {
                await api.delete(`cart/items/${product.product_id}`, {
                    data: {
                        selected_option: product.selected_option || null
                    }
                })
            } else {
                const cart = getLocalCart()

                cart.items = cart.items.filter(item =>
                    !(
                        item._id === product._id &&
                        (item.selected_option || null) === (product.selected_option || null)
                    )
                )

                cart.total = calculateTotal(cart.items)
                saveLocalCart(cart)
            }
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }
    const deleteCart = async () => {
        setLoading(true)
        setError(null)
        try {
            if (user) {
                await api.delete("cart/clear")
            } else {
                saveLocalCart({ items: [], total: 0 })
            }
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const payload = {
                product_id: product.product_id,
                quantity: value,
                selected_option: product?.selected_option || null
            }
            if (user) {
                await api.patch("cart/items", payload)
            } else {
                const cart = getLocalCart()
                const index = cart.items.findIndex(item =>
                    item._id === product._id &&
                    (item.selected_option || null) === (product.selected_option || null)
                )

                if (index !== -1) {
                    cart.items[index].quantity = value
                }

                cart.total = calculateTotal(cart.items)
                saveLocalCart(cart)
            }
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    const maxStock = getVariantStock(product)
    return (
        <div className="cart-backdrop" onClick={!loading ? closeWithAnimation : undefined}>
            <div
                className={`cart-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="cancel"
                    onClick={!loading ? closeWithAnimation : undefined}
                >
                    X
                </button>
                {mode === "edit-quantity" && (
                    <div className="cart-modal-gap">
                        <h2>Actualizar cantidad</h2>
                        <form className="cart-form" onSubmit={handleSubmit}>
                            <div className="cart-content">
                                <div className="cart-form-image">
                                    <img
                                        src={product?.images?.[0]?.url}
                                        alt={product?.name || "Producto"}
                                    />
                                    {user && product?.discount > 0 && (
                                        <p className="cart-form-discount">
                                            Dsto: {product?.discount}%
                                        </p>
                                    )}
                                </div>
                                <div className="cart-form-data">
                                    <p><strong>Nombre:</strong> {product?.name}</p>
                                    <div className="cart-quantity-content">
                                        <b>Cantidad que desea comprar:</b>
                                        <input
                                            type="number"
                                            min={1}
                                            max={maxStock}
                                            value={value}
                                            onChange={(e) => {
                                                let v = Number(e.target.value)

                                                if (v < 1) v = 1
                                                if (v > maxStock) v = maxStock

                                                setValue(v)
                                            }}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                                    e.preventDefault()
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {error && <p className="error_modal">{error}</p>}
                            <button type="submit" disabled={loading}>
                                {loading ? "Actualizando" : "Actualizar"}
                            </button>
                        </form>
                    </div>
                )}
                {mode === "clear-prod-modal" && (
                    <div className="cart-modal-gap">
                        <h2>¿Estas seguro que quieres borrar este producto?</h2>
                        <div className="cart-content">
                            <div className="cart-form-image">
                                <img
                                    src={product?.images?.[0]?.url}
                                    alt={product?.name}
                                />
                                {product?.discount > 0 && (
                                    <p className="cart-form-discount">
                                        Dsto: {product.discount}%
                                    </p>
                                )}
                            </div>

                            <div className="cart-form-data">
                                <p><strong>Nombre:</strong> {product?.name}</p>
                                <p><strong>Cantidad:</strong> {product?.quantity}</p>
                            </div>
                        </div>
                        <button
                            className="delete-prod-modal"
                            onClick={() => deleteProd(product)}
                            disabled={loading}
                        >
                            {loading ? "Eliminando" : "Eliminar"}
                        </button>
                    </div>
                )}
                {mode === "clear-cart-modal" && (
                    <div className="cart-modal-gap">
                        <h2>¿Estas seguro que quieres vaciar el carrito?</h2>

                        <button
                            className="delete-prod-modal"
                            onClick={deleteCart}
                            disabled={loading}
                        >
                            {loading ? "Vaciando" : "Vaciar"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
export default ShowModalCart