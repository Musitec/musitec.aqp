import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import ShowModalCart from "../components/modalCart"
import UserModal from "../components/userModal"
import "./shopping_car.css"
const renderReason=(reason)=>{
    if(reason==="not_found"){
        return "Producto no encontrado"
    }
    if(reason==="blocked"){
        return "Producto bloqueado"
    }
    if(reason==="inactive"){
        return "Producto no disponible"
    }
    if(reason==="out_of_stock"){
        return "Producto agotado"
    }
    if(reason==="insufficient_stock"){
        return "Cantidad insuficiente"
    }
}
const truncateText=(text,characters)=>{
    if(!text){
        return "";
    }
    return text.length>characters?text.slice(0,characters)+"...":text;
}
function ShowProducts({
    user,
    products = [],
    shoppingCart,
    removedProducts = [],
    totalDiscount,
    total,
    reload,
    loading,
    error,
    checkout,
    finishAnnonimous
}){
    const navigate=useNavigate()
    const [showModal, setShowModal]=useState(false)
    const [productSelected,setProductSelected]=useState([])
    const [showUserModal, setUserModal]=useState(false)
    const [mode,setMode]=useState("")
    const [userMode,setUserMode]=useState("")
    const updateQuantity=(productSel)=>{
        setMode("edit-quantity")
        setProductSelected(productSel)
        setShowModal(true)
    }
    const deleteProd=(productSel)=>{
        setMode("clear-prod-modal")
        setProductSelected(productSel)
        setShowModal(true)
    }
    const finish=()=>{
        setProductSelected([])
        setShowModal(false)
        setMode("")
        reload()
    }
    const onClose=()=>{
        setProductSelected([])
        setShowModal(false)
        setUserModal(false)
        setMode("")
        setUserMode("")
    }
    const deleteCart=()=>{
        setMode("clear-cart-modal")
        setProductSelected()
        setShowModal(true)
    }
    const checkoutCart=()=>{
        if(user){
            checkout()
        }else{
            setUserMode("buy cart")
            setUserModal(true)
        }
    }
    const buyWhatsapp=()=>{
        setUserMode("buy-whatsapp")
        setUserModal(true)
    }
    if(products.length===0&&removedProducts.length===0){
        return(
            <div className="err-mess">
                <p>El carrito esta vacio.</p>
                <button onClick={()=>{navigate("/products")}}>Llenar carrito</button>
            </div>
        )
    }
    return(
        <>
            <div className="shopping-car-container">
                <div className="shopping-items-container">
                    {products.length>0&&(
                        <>
                            {products.map((prod,i)=>{
                                return(
                                    <div key={i} className="shopping-item-container">
                                        <div className="shopping-product-img">
                                            <img src={prod?.images[0].url} alt={prod?.name}/>
                                            {prod?.discount>0&&<p className="shopping-product-discount">Dsto: {prod?.discount}%</p>}
                                        </div>
                                        <div className="inter-data"></div>
                                        <div className="shopping-item-data">
                                            <p className="shopping-item-name"><strong>Nombre:</strong> {truncateText(prod?.name,14)}</p>
                                            {prod?.selected_option&&<p className="shopping-item-name"><strong>Modelo:</strong> {prod?.selected_option}</p>}
                                            <p className="shopping-item-prices"><strong>Precio:</strong> S/{prod?.price.toFixed(2)}</p>
                                            <p className="shopping-item-quantity"><strong>Cantidad:</strong> {prod?.quantity}</p>
                                            <p className="shopping-item-price"><strong>Subtotal:</strong> S/{
                                                user
                                                  ? prod?.subtotal_raw?.toFixed(2)
                                                  : (prod.price * prod.quantity).toFixed(2)
                                            }</p>
                                            {user ? (
                                                <p><strong>Con descuento:</strong> S/{prod?.subtotal_discounted.toFixed(2)}</p>
                                            ) : (
                                                <p><strong>Subtotal:</strong> S/{(prod.price * prod.quantity).toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="inter-data"></div>
                                        <div className="shopping-buttons-options">
                                            <button className="update-quantity-product" onClick={()=>updateQuantity(prod)}><i className="bi bi-arrow-clockwise"></i>Cambiar cifra</button>
                                            <button className="delete-product-cart" onClick={()=>deleteProd(prod)}><i className="bi bi-trash2-fill"></i>Borrar producto</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                    {removedProducts.length>0&&(
                        <>
                            <h2>Lo sentimos, productos no disponibles</h2>
                            {removedProducts.map((rev)=>{
                                return(
                                    <div key={rev?.product_id} className="removed-product-flex">
                                        <div className="removed-product-img">
                                            <img src={rev?.images[0].url} alt={rev?.name}/>
                                        </div>
                                        <div className="removed-product-data">
                                            <p className="removed-item-name"><strong>Nombre:</strong> {truncateText(rev?.name,14)}</p>
                                            <p className="remove-item-reason"><strong>Razon:</strong> {renderReason(rev?.reason)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
                <div className="shopping-prices-container">
                    <h2>Precio total</h2>
                    <p><strong>Total:</strong> S/{total.toFixed(2)}</p>
                    {user && (
                        <p><strong>Con descuento:</strong> S/{totalDiscount.toFixed(2)}</p>
                    )}
                    {error && <p className="error_modal">{error}</p>}
                    <button disabled={products.length===0} onClick={()=>deleteCart()} className="delete-product-cart"><i className="bi bi-trash2-fill"></i> Vaciar carrito</button>
                    <button disabled={products.length===0||loading} onClick={()=>checkoutCart()} className="create-order"><i className="bi bi-credit-card-2-back-fill"></i> Realizar compra</button>
                    {!user&&<button onClick={buyWhatsapp} className="buy-whatsapp-button"><i className='bi bi-whatsapp'></i> Comprar desde whatsapp</button>}
                </div>
            </div>
            {showModal&&<ShowModalCart 
                mode={mode}
                finish={finish}
                product={productSelected}
                onClose={onClose}
                user={user}
                />
            }
            {showUserModal&&<UserModal
                finish={finishAnnonimous}
                cart={shoppingCart}
                onClose={onClose}
                mode={userMode}
            />}
        </>
    )
}
function ShowShoppingCar({user,finishAnnonimous}){
    const navigate=useNavigate()
    const [shoppingCart,setShoppingCart]=useState([])
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState(null)
    const [loadingOrder,setLoadingOrder]=useState(false)
    const [errorOrder,setErrorOrder]=useState(null)
    const buildWhatsAppMessage = (order) => {
        let message = "Hola, acabo de realizar un pedido:\n\n"
        order.items.forEach(item => {
            message += `• ${item.name}`
            message += `\nCantidad: ${item.quantity}\n`
            message += `Subtotal: S/${item.subtotal_discounted?.toFixed(2) || item.subtotal_raw?.toFixed(2)}\n\n`
        })
        message += `Total: S/${order.total_discounted?.toFixed(2) || order.total_raw.toFixed(2)}\n`
        message += `Código de orden: ${order.code}`
        return encodeURIComponent(message)
    }
    const openWhatsApp = (order) => {
        const phone = "51974321655"
        const message = buildWhatsAppMessage(order)
        const url = `https://wa.me/${phone}?text=${message}`
        window.open(url, "_blank")
    }
    const getShoppingCar = async () => {
        setLoading(true)
        try {
            if (user) {
                const res = await api.get("cart/my-cart")
                setShoppingCart(res.data)
            } else {
                const localCart = JSON.parse(localStorage.getItem("cart")) || { items: [] }
                setShoppingCart({
                    items: localCart.items,
                    removed_items: [],
                    total_raw: localCart.total || 0,
                    total_discounted: localCart.total || 0
                })
            }
        } catch (err) {
            setError(getErrorMessage(err) || "Error en la conexión")
        } finally {
            setLoading(false)
        }
    }
    const checkout=async()=>{
        if(user===null){
            return
        }
        setLoadingOrder(true)
        setErrorOrder(null)
        try {
            const res = await api.post("checkout")
            openWhatsApp(res.data.order)
            navigate("/orders")
        } catch (error) {
            setErrorOrder(getErrorMessage(error)||"Error en la conexión")
        }finally{
            setLoadingOrder(false)
        }
    }
    const finishAnnonimousWhatsapp=(order)=>{
        openWhatsApp(order)
        finishAnnonimous()
    }
    useEffect(()=>{
        getShoppingCar()
    },[])
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
    return(
        <ShowProducts
            user={user}
            products={shoppingCart.items}
            totalDiscount={shoppingCart.total_discounted}
            removedProducts={shoppingCart.removed_items}
            total={shoppingCart.total_raw}
            reload={getShoppingCar}
            loading={loadingOrder}
            error={errorOrder}
            checkout={checkout}
            shoppingCart={shoppingCart}
            finishAnnonimous={finishAnnonimousWhatsapp}
            />
    )
}
export default ShowShoppingCar