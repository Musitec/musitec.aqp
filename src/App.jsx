import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/home"
import Footer from "./components/footer"
import Header from "./components/header"
import Catalog from "./pages/catalog"
import Product from "./pages/product"
import AboutUs from "./pages/aboutUs"
import Contact from "./pages/contact"
import FullLoader from "./components/FullLoader"
import ShowShoppingCar from "./pages/shopping_car"
import ShowOrders from "./pages/orders"
import OrdersAdmin from "./pages/orders-admin"
import ShowDashboardProducts from "./pages/admin-products"
import CreateProduct from "./pages/createProduct"
import EditProduct from "./pages/editProduct"
import CreateDiscount from "./pages/createDiscounts"
import ChangeStockView from "./pages/changeStock"
import FormReclamation from "./pages/formReclamationBook"
import ShowMyReclamations from "./pages/clientReclamationBook"
import WatchReclamation from "./pages/watchReclamation"
import ShowAdminReclamations from "./pages/adminReclamationBook"
import UpdateHistorial from "./pages/update-historial-claim"
import ShowOrderHistorial from "./pages/orderHistorial"
import UserControlPannel from "./pages/userControl"
import ShowUser from "./pages/showUser"
import { useState,useEffect } from "react"
import getErrorMessage from "./components/getError"
import api from "./services/api"
function App() {
  const navigate= useNavigate()
  const [loadingSession, setLoadingSession] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [error,setError]=useState(null)
  const [annonimousOrder,setAnnonimousOrder]=useState(false)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })
  const isStaff = user?.role === "admin" || user?.role === "moderator"
  const getUser=(myUser)=>{
    localStorage.setItem("user", JSON.stringify(myUser))
    setUser(myUser)
  }
  const onClickProduct=(id,popularUp)=>{
    navigate(`/product/${id}?from_search=${popularUp}`)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    })
  }
  const onLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }
  const getLocalCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart"))
    return cart || { items: [], total: 0 }
  }
  const saveLocalCart = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }
  const calculateTotal = (items) => {
    return items.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
  }
  const getStock = (product, selected_option) => {
    if (Array.isArray(product.stock)) {
      if (selected_option === null || selected_option === undefined) {
        return 0
      }
      return product.stock[selected_option] ?? 0
    }
    return product.stock ?? 0
  }
  const onBuyClick = async (product, quantity, variantSelected) => {
    if (!user) {
      const cart = getLocalCart()
      const selected_option = variantSelected?.option ?? null
      const stockAvailable = variantSelected
        ? variantSelected.stock
      : product.stock ?? 0
      const price = variantSelected
        ? variantSelected.price
        : product.price??0
      const existingIndex = cart.items.findIndex(item =>
        item._id === product._id &&
        item.selected_option === selected_option
      )
      if (existingIndex !== -1) {
        const newQuantity = cart.items[existingIndex].quantity + quantity
        cart.items[existingIndex].quantity =
          newQuantity > stockAvailable ? stockAvailable : newQuantity
      } else {
        cart.items.push({
          _id: product._id,
          name: product.name,
          price: price,
          quantity: Math.min(quantity, stockAvailable),
          images: product.images,
          selected_option,
          stock: stockAvailable
        })
      }
      cart.total = calculateTotal(cart.items)
      saveLocalCart(cart)
      navigate("/shopping-car")
      return
    }
    const payload = {
      product_id: product._id,
      quantity
    }
    if (variantSelected?.option) {
      payload.selected_option = variantSelected.option
    }
    try {
      await api.post("cart/items", payload)
      navigate("/shopping-car")
    } catch (error) {
      setError(getErrorMessage(error) || "Error en la conexion")
    }
  }
  const onEnterSession = async () => {
    try {
      setLoadingSession(true)
      const res = await api.get("auth/me")
      getUser(res.data)
      setAnnonimousOrder(false)
      navigate("/")
    } catch (err) {
      console.error("Error en auth/me", err)
      setUser(null)
      try {
        await api.post("auth/logout/")
        onLogout()
        navigate("/")
      } catch (err) {
        console.error("Error al cerrar sesión", err)
      }
    } finally {
      setLoadingSession(false)
    }
  }
  const restoreSession = async () => {
    try {
      setLoadingSession(true)
      const res = await api.get("auth/me")
      getUser(res.data)
    } catch (err) {
      onLogout()
    } finally {
      setLoadingSession(false)
    }
  }
  const finishAnnonimous=()=>{
    navigate("/")
    setShowLogin(true)
    setAnnonimousOrder(true)
    localStorage.removeItem("cart")
  }
  useEffect(() => {
    if (localStorage.getItem("user")) {
      restoreSession()
    }
  }, [])
  return (
    <>
      {loadingSession && <FullLoader />}
      {error &&(
        <div className="modal-backdrop">
          <div className={"modal error"}>
            <h3>
              Error
            </h3>
            <p>{error}.</p>
            <button
              onClick={() => {
                setError(null)
                }
              }
            >
              Cerrar
            </button>
          </div>
        </div>)
      }
      <div className="app">
        <Header annonimousOrder={annonimousOrder} user={user} onEnterSession={onEnterSession} onLogout={onLogout} setLoading={setLoadingSession} showLogin={showLogin} setShowLogin={setShowLogin} updateUser={restoreSession}/>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home onClickProduct={onClickProduct} session={user!==null}/>}/>
            <Route path="/products" element={<Catalog onClickProduct={onClickProduct}/>}/>
            <Route path="/product/:id" element={<Product onBuyClick={onBuyClick} onClickProduct={onClickProduct} isStaff={isStaff} session={user!==null}/>}/>
            <Route path="/about-us" element={<AboutUs/>}/>
            <Route path="/contact-us" element={<Contact/>}/>
            <Route path="/shopping-car" element={<ShowShoppingCar user={user} finishAnnonimous={finishAnnonimous}/>}/>
            <Route path="/orders" element={<ShowOrders/>}/>
            <Route path="/admin-orders" element={<OrdersAdmin/>}/>
            <Route path="/admin-products" element={<ShowDashboardProducts/>}/>
            <Route path="/change-stock/:id" element={<ChangeStockView/>}/>
            <Route path="/create-product" element={<CreateProduct/>}/>
            <Route path="/product-edit/:id" element={<EditProduct/>}/>
            <Route path="/create-discount/:id" element={<CreateDiscount/>}/>
            <Route path="/reclamation" element={<FormReclamation/>}/>
            <Route path="/reclamation-user" element={<ShowMyReclamations/>}/>
            <Route path="/reclamation-staff" element={<ShowAdminReclamations/>}/>
            <Route path="/claim/:id" element={<WatchReclamation/>}/>
            <Route path="/update-claim/:id/" element={<UpdateHistorial/>}/>
            <Route path="/order/:code" element={<ShowOrderHistorial/>}/>
            <Route path="/users-control" element={<UserControlPannel myUser={user}/>}/>
            <Route path="show-user/:id" element={<ShowUser myUser={user}/>}/>
          </Routes>
        </main>
        <a href={`https://wa.me/51974321655?text=${encodeURIComponent(
          "Hola. Quisiera más información, por favor."
        )}`} target="_blank" rel="noopener noreferrer"className="whatsapp-btn">
          <i className='bi bi-whatsapp'></i></a>
        <Footer user={user}/>
      </div>
    </>
  )
}

export default App