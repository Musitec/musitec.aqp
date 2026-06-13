import getErrorMessage from "../components/getError"
import api from "../services/api"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import "./editProduct.css"
function ChangeLog({ logs }) {
    if (!logs || logs.length === 0) {
        return <p>No hay cambios registrados</p>
    }
    const renderValue = (value) => {
        if (Array.isArray(value) && value.length > 0 && value[0]?.url) {
            return (
                <div className="change-images">
                    {value.map((img, i) => (
                        <img
                            key={i}
                            src={img.url}
                            alt="change"
                            className="change-log-image"
                        />
                    ))}
                </div>
            )
        }
        return <span>{JSON.stringify(value)}</span>
    }
    return (
        <div className="change-log">
            <h3>Historial de cambios</h3>
            {[...logs].reverse().map((log, index) => (
                <div key={index} className="change-log-item">
                    <p>
                        <strong>{log.field}</strong>
                    </p>
                    <div className="change-values">
                        <div className="old-value">
                            {renderValue(log.old)}
                        </div>
                        <span className="arrow">→</span>
                        <div className="new-value">
                            {renderValue(log.new)}
                        </div>
                    </div>
                    <small>
                        {new Date(log.created_at).toLocaleString()}
                    </small>
                    <p className="change-user">
                        Por: {log.user_email || "Desconocido"}
                    </p>
                </div>
            ))}
        </div>
    )
}

function ProductImage({
    images,
    inputRef,
    removeImage,
    openGallery,
    handleChange,
    handleDrop,
    handleDragOver,
    handleDragStart,
    handleDropImage,
    handleDragOverImage,
    removeAllImages
}){
    return(
        <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="main-image">
                {images.length > 0 ?(
                    <img src={images[0].url} alt="main"/>
                ):(
                    <p>+</p>
                )}
            </div>
            <div className="preview-container">
                {images.map((img, i) => (
                    <div 
                        key={i}
                        className="preview-image"
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e)=>handleDragOverImage(e)}
                        onDrop={(e) => handleDropImage(e, i)}
                    >
                        <button onClick={()=>removeImage(i)}>X</button>
                        <img src={img.url} alt="preview" draggable={false}/>
                    </div>
                ))}
                {images.length < 5 &&
                    <>
                        <button onClick={openGallery}>
                            Añadir imagenes
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={inputRef}
                            style={{display:"none"}}
                            onChange={handleChange}
                        />
                    </>
                }
            </div>
            {images.length > 0 && (
                <button
                    onClick={removeAllImages}
                    className="remove-all-images"
                >
                    Eliminar todas las imagenes
                </button>
            )}
        </div>
    )
}

function EditPanel({ product, catalogs, onReloadProduct }) {
    const [productCopy, setProductCopy] = useState(null)
    const [imagesList, setImagesList] = useState([])
    const [removedImages, setRemovedImages] = useState([])
    const [loading,setLoading]=useState(false)
    const inputRef = useRef(null)
    const [dragIndex, setDragIndex] = useState(null)
    const [variants, setVariants] = useState([])
    const [variantsData, setVariantsData] = useState({})
    const [stock, setStock] = useState("")
    const [optionInput, setOptionInput] = useState("")
    const [specifications, setSpecifications] = useState("")
    const [allImagesErrased, setAllImagesErrased] = useState(false)
    const [error, setError] = useState(null)
    const [showCatalogs, setShowCatalogs] = useState(false)
    const originalSpecs = useRef(null)
    const originalProduct = useRef(null)
    const specsToText = (obj, level = 0) => {
        let result = ""
        for (const [key, value] of Object.entries(obj || {})) {
            if (
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
            ) {
                result += `.${key}: (\n`
                result += specsToText(value, level + 1)
                result += `)\n`
            } else {
                result += `.${key}: ${value}\n`
            }
        }
        return result
    }
    useEffect(() => {
        if (product) {
            originalProduct.current = JSON.parse(JSON.stringify(product))
            const copy = JSON.parse(JSON.stringify(product))
            setProductCopy(copy)
            setImagesList(copy.images || [])
            if (copy.variants?.length > 0) {
                setVariants(copy.variants.map(v => ({
                    option: v.option,
                    stock: v.stock ?? 0,
                    price: v.price ?? 0
                })))
            } else {
                setStock(String(copy.stock ?? ""))
            }
            originalSpecs.current = copy.specifications || {}
            setSpecifications(specsToText(copy.specifications || {}))
        }
    }, [product])
    if (!productCopy) {
        return (
            <div className="err-mess">
                <p>Cargando editor...</p>
            </div>
        )
    }
    const parseSpecifications = (text) => {
        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "")
        let index = 0
        const parseBlock = () => {
            const result = {}
            while (index < lines.length) {
                const line = lines[index]
                if (line === ")") {
                    index++
                    break
                }
                if (!line.startsWith(".")) {
                    throw new Error(`Formato inválido: ${line}`)
                }
                const content = line.slice(1)
                const separator = content.indexOf(":")
                if (separator === -1) {
                    throw new Error(`Falta ':' en ${line}`)
                }
                const key = content.slice(0, separator).trim()
                const value = content.slice(separator + 1).trim()
                if (value === "(") {
                    index++
                    result[key] = parseBlock()
                } else {
                    result[key] = value
                    index++
                }
            }
            return result
        }
        return parseBlock()
    }
    const hasChanges = () => {
        if (!productCopy || !originalProduct.current) return false
        const original = originalProduct.current
        if (productCopy.name !== original.name) return true
        if (productCopy.description !== original.description) return true
        if (productCopy.catalog !== original.catalog) return true
        if (productCopy.price !== original.price) return true
        if (JSON.stringify(variants) !== JSON.stringify(original.variants || [])) {
            return true
        }
        if (variants.length === 0) {
            if (String(stock) !== String(original.stock)) return true
        } else {
            const current = variants.map(v => ({
                option: v.option,
                stock: Number(v.stock || 0),
                price: Number(v.price || 0)
            }))
            const originalVariants = (originalProduct.current.variants || []).map(v => ({
                option: v.option,
                stock: Number(v.stock || 0),
                price: Number(v.price || 0)
            }))
            if (JSON.stringify(current) !== JSON.stringify(originalVariants)) return true
        }
        let parsedSpecs = {}
        try {
            parsedSpecs = specifications.trim()
                ? parseSpecifications(specifications)
                : {}
        } catch {
            return true
        }
        if (JSON.stringify(parsedSpecs) !== JSON.stringify(originalSpecs.current)){
            return true
        }
        if (removedImages.length > 0) return true
        if (imagesList.some(img => img.isNew)) return true
        const currentOrder = imagesList
            .filter(img => !img.isNew)
            .map(img => img.public_id)
        const originalOrder = (original.images || []).map(img => img.public_id)
        if (JSON.stringify(currentOrder) !== JSON.stringify(originalOrder)) return true
        return false
    }
    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
    const removeAllImages = () => {
        const toRemove = imagesList.filter(img => !img.isNew).map(img => img.public_id)
        setRemovedImages(prev => [...prev, ...toRemove])
        setImagesList([])
        setAllImagesErrased(true)
    }
    const buildImagesPayload = () => {
        const formData = new FormData()
        imagesList.forEach(img => {
            if (img.isNew) {
                formData.append("files", img.file)
                formData.append("tempIds", img.tempId)
            }
        })
        if (removedImages.length > 0) {
            formData.append("remove_images", JSON.stringify(removedImages))
        }
        const order = imagesList.map(img => img.isNew ? img.tempId : img.public_id)
        if (order.length > 0) {
            formData.append("image_order", JSON.stringify(order))
        }
        if (allImagesErrased) {
            formData.append("replace_images", true)
        }
        return formData
    }
    const buildFullPayload = () => {
        const formData = buildImagesPayload()
        const original = originalProduct.current
        if (productCopy.name !== product.name)
            formData.append("name", productCopy.name)
        if (productCopy.description !== product.description)
            formData.append("description", productCopy.description)
        if (productCopy.catalog !== product.catalog)
            formData.append("catalog", productCopy.catalog)
        if (productCopy.price !== product.price)
            formData.append("price", productCopy.price)
        if (variants.length === 0) {
            formData.append("stock", stock)
            formData.append("price", productCopy.price)
        } else {
            const payload = variants.map(v => ({
                option: v.option,
                stock: Number(v.stock || 0),
                price: Number(v.price || 0)
            }))
            formData.append("variants", JSON.stringify(payload))
        }
        const parsedSpecs = specifications.trim()? parseSpecifications(specifications):{}
        if (!isEqual(parsedSpecs, product.specifications || {})) {
            formData.append(
                "specifications",
                JSON.stringify(parsedSpecs)
            )
        }
        return formData
    }
    const hasEmptyJson = (text) => {
        try {
            const parsed = parseSpecifications(text)
            const check = (obj) => {
                if (
                    typeof obj === "object" &&
                    obj !== null &&
                    !Array.isArray(obj)
                ) {
                    if (Object.keys(obj).length === 0) {
                        return true
                    }
                    return Object.values(obj).some(check)
                }
                return false
            }
            return check(parsed)
        } catch {
            return false
        }
    }
    const handleUpdate = async () => {
        setLoading(true)
        try {
            setError(null)
            if (hasEmptyJson(specifications)) {
                setError("No puedes enviar objetos vacíos en specifications")
                setLoading(false)
                return
            }
            const invalidVariant = variants.some(
                v => !v.option.trim()
            )
            if (invalidVariant) {
                setError("Todas las opciones deben tener un nombre")
                return
            }
            const formData = buildFullPayload()
            await api.put(
                `product-control/product/${product._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )
            alert("Producto actualizado correctamente")
            onReloadProduct()
        } catch (err) {
            setError(getErrorMessage(err))
        }finally{
            setLoading(false)
        }
    }
    const addVariant = () => {
        const value = optionInput.trim()
        if (!value) return
        setVariants(prev => {
            const exists = prev.some(
                v => v.option.toLowerCase() === value.toLowerCase()
            )
            if (exists) return prev
            return [
                ...prev,
                {
                    option: value,
                    stock: 0,
                    price: Number(productCopy.price) || 0
                }
            ]
        })
        setOptionInput("")
    }
    const removeOption = (index) => {
        setVariants(prev => {
            const removed = prev[index]
            const updated = prev.filter((_, i) => i !== index)
            if (updated.length === 0) {
                setProductCopy(p => ({
                    ...p,
                    price: removed?.price || 0
                }))
                setStock(String(removed?.stock || 0))
            }
            return updated
        })
    }
    const handleOptionChange = (index, newValue) => {
        const trimmed = newValue.trim()
        setVariants(prev => {
            const exists = prev.some(
                (v, i) =>
                    i !== index &&
                    v.option.toLowerCase() === trimmed.toLowerCase()
            )
            if (exists) return prev
            const updated = [...prev]
                updated[index] = {
                ...updated[index],
                option: trimmed
            }
            return updated
        })
    }
    const removeImage = (index) => {
        setImagesList(prev => {
            const img = prev[index]
            if (!img.isNew) {
                setRemovedImages(r => [...r, img.public_id])
            }
            return prev.filter((_, i) => i !== index)
        })
    }
    const openGallery = () => {
        inputRef.current.click()
    }
    const handleChange = (e) => {
        const files = Array.from(e.target.files)
        const mapped = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            isNew: true,
            tempId: crypto.randomUUID()
        }))
        setImagesList(prev => [...prev, ...mapped])
    }
    const handleDrop = (e) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        const mapped = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            isNew: true,
            tempId: crypto.randomUUID()
        }))
        setImagesList(prev => [...prev, ...mapped])
    }
    const handleDragOver = (e) => {
        e.preventDefault()
    }
    const handleDragStart = (index) => {
        setDragIndex(index)
    }
    const handleDropImage = (e, index) => {
        e.preventDefault()
        const newList = [...imagesList]
        const dragged = newList[dragIndex]
        newList.splice(dragIndex, 1)
        newList.splice(index, 0, dragged)
        setImagesList(newList)
    }
    const handleDragOverImage = (e) => {
        e.preventDefault()
    }
    const deleteAllVariants = () => {
        const oldVariants = [...variants]
        setVariants([])
        setProductCopy(prev => ({
            ...prev,
            price: oldVariants[0]?.price || 0
        }))
        setStock(String(
            oldVariants.reduce(
                (acc,v)=>acc + Number(v.stock || 0),
                0
            )
        ))
    }
    return (
        <div className="create-product-cont">
            <h1>Actualizar producto</h1>
            <div className="create-product-flex">
                <ProductImage
                    images={imagesList}
                    inputRef={inputRef}
                    removeImage={removeImage}
                    openGallery={openGallery}
                    handleChange={handleChange}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragStart={handleDragStart}
                    handleDropImage={handleDropImage}
                    handleDragOverImage={handleDragOverImage}
                    removeAllImages={removeAllImages}
                />
                <div className="create-product-data">
                    <input
                        style={{fontSize:"40px"}}
                        value={productCopy.name || ""}
                        onChange={(e) =>
                            setProductCopy(prev => ({
                                ...prev,
                                name: e.target.value
                            }))
                        }
                        placeholder="Nombre del producto"
                    />
                    <div className="catalog-selector">
                        <div className="catalog-input-container">
                            <input
                                type="text"
                                placeholder="Catálogo"
                                value={productCopy.catalog || ""}
                                onChange={(e) =>
                                    setProductCopy(prev => ({
                                        ...prev,
                                        catalog: e.target.value
                                    }))
                                }
                            />
                            <button
                                className="button-catalog"
                                type="button"
                                onClick={() => setShowCatalogs(prev => !prev)}
                            >
                                ▼
                            </button>
                        </div>
                        {showCatalogs && (
                            <div className="catalog-dropdown">
                                <button
                                    type="button"
                                    className="catalog-option"
                                    onClick={() => {
                                        setProductCopy(prev => ({
                                            ...prev,
                                            catalog: ""
                                        }))
                                        setShowCatalogs(false)
                                    }}
                                >
                                    + Nuevo catálogo
                                </button>
                                {catalogs?.map((cat, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="catalog-option"
                                        onClick={() => {
                                            setProductCopy(prev => ({
                                                ...prev,
                                                catalog: cat
                                            }))
                                            setShowCatalogs(false)
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="edit-options-container">
                        <strong>Variantes:</strong>
                        {variants.length > 0 ? (
                            <div className="edit-options-grid">
                                {variants.map((v,i)=>(
                                    <div 
                                        key={i}
                                        className="variant-row"
                                    >
                                        <div>
                                            <label>Nombre</label>
                                            <input
                                                type="text"
                                                value={v.option}
                                                onChange={(e)=>
                                                    handleOptionChange(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label>Valor / Stock</label>
                                            <input
                                                type="number"
                                                value={v.stock}
                                                onChange={(e)=>{
                                                    const copy=[...variants]
                                                    copy[i]={
                                                        ...copy[i],
                                                        stock:e.target.value
                                                    }
                                                    setVariants(copy)
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label>Precio</label>
                                            <input
                                                type="number"
                                                value={v.price}
                                                onChange={(e)=>{
                                                    const copy=[...variants]
                                                    copy[i]={
                                                        ...copy[i],
                                                        price:e.target.value
                                                    }
                                                    setVariants(copy)
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={()=>removeOption(i)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ):(
                            <p>No hay variantes</p>
                        )}
                        <div className="aggregate-option">
                            <input
                                type="text"
                                placeholder="Nueva variante"
                                value={optionInput}
                                onChange={(e)=>
                                    setOptionInput(e.target.value)
                                }
                                onKeyDown={(e)=>{
                                    if(e.key==="Enter"){
                                        e.preventDefault()
                                        addVariant()
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addVariant}
                            >
                                Añadir variante
                            </button>
                        </div>
                    </div>
                    {variants.length === 0 && (
                        <>
                            <input
                                className="create-product-price"
                                type="number"
                                placeholder="Precio"
                                value={productCopy.price}
                                onChange={(e) =>
                                    setProductCopy(prev => ({
                                        ...prev,
                                        price: Number(e.target.value)
                                    }))
                                }
                            />
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="Stock"
                            />
                        </>
                    )}
                    {variants.length > 0 && (
                        <button
                            className="erase-options-button"
                            type="button"
                            onClick={deleteAllVariants}
                        >
                            Eliminar todas
                        </button>
                    )}
                </div>
            </div>
            <textarea
                className="product-description"
                placeholder="Descripción"
                value={productCopy.description || ""}
                onChange={(e) =>
                    setProductCopy(prev => ({
                        ...prev,
                        description: e.target.value
                    }))
                }
            />
            <h3>Especificaciones:</h3>
            <textarea
                className="product-specifications"
                placeholder={`.Marca: Arduino
.Modelo: Uno R3
.Microcontrolador: ATmega328P
.Especificaciones: (
.Voltaje de operación: 5V
.Entradas analógicas: 6
.Pines digitales: 14
.Memoria Flash: 32KB
)
.Conexión: USB Tipo B`}
                value={specifications}
                onChange={(e)=>setSpecifications(e.target.value)}
            />
            {error && (
                <p className="create-error">{error}</p>
            )}
            <div className="create-button">
                <button 
                    className="update-product-btn"
                    onClick={handleUpdate}
                    disabled={loading || !hasChanges() || imagesList.length === 0}
                >
                    {loading?"Guardando":"Guardar cambios"}
                </button>
            </div>
        </div>
    )
}
function EditProduct(){
    const {id}=useParams()
    const [product,setProduct]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState(null)
    const [catalogs, setCatalogs]=useState([])
    const getProduct=async()=>{
        setLoading(true)
        setError(null)
        try {
            const res = await api.get(`product-control/product-get/${id}`)
            setProduct(res.data)
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false) 
        } 
    }
    const getCatalogs=async()=>{
        try {
            const res=await api.get("product-control/product/catalogs")
            setCatalogs(res.data.catalogs || [])
        } catch (err) {
            setError(getErrorMessage(err))
        }finally{
            setError("")
        }
    }
    useEffect(()=>{
        getCatalogs()
        getProduct()
    },[id])
    const onReloadProduct=async()=>{
        getProduct()
        getCatalogs()
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        })
    }
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
        <>
            <EditPanel product={product} catalogs={catalogs} onReloadProduct={onReloadProduct}/>
            <ChangeLog logs={product.changeLog} />
        </>
    )
}
export default EditProduct