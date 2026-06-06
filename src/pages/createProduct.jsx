import { useRef, useState } from "react"
import api from "../services/api"
import getErrorMessage from "../components/getError"
import "./createProduct.css"
const MAX_IMAGES = 5
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
    handleDragOverImage
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
        </div>
    )
}

function CreateProduct(){
    const inputRef=useRef(null)
    const [images, setImages]=useState([])
    const [dragIndex, setDragIndex] = useState(null)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [catalog, setCatalog] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [options, setOptions] = useState([])
    const [variantsData, setVariantsData] = useState({})
    const [specifications, setSpecifications] = useState("")
    const [optionInput, setOptionInput] = useState("")
    const [error, setError]=useState(null)
    const [loading, setLoading]=useState(false)
    const openGallery=()=>{
        inputRef.current.click()
    }
    const handleDrop = (e) => {
        e.preventDefault()
        const internalDrag = e.dataTransfer.getData("text/plain")
        if (internalDrag !== "") return
        const files = Array.from(e.dataTransfer.files)
        if (!files.length) return
        const previews = files.map(file => ({
            file: file,
            url: URL.createObjectURL(file)
        }))
        setImages(prev => {
            const total = [...prev, ...previews]
            if (total.length > MAX_IMAGES) {
                setError("Máximo 5 imágenes")
                return total.slice(0, MAX_IMAGES)
            }
            return total
        })
    }
    const handleDragOver = (e) => {
        e.preventDefault()
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
                if (!key) {
                    throw new Error(`Clave vacía en ${line}`)
                }

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
    const handleChange = (e) => {
        const files = Array.from(e.target.files)
        const previews = files.map(file => ({
            file: file,
            url: URL.createObjectURL(file)
        }))
        setImages(prev => {
            const total = [...prev, ...previews]
            if(total.length > MAX_IMAGES){
                setError("Máximo 5 imágenes")
                return total.slice(0, MAX_IMAGES)
            }
            return total
        })
    }
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }
    const handleDragStart = (index) => {
        setDragIndex(index)
    }
    const handleDragOverImage = (e) => {
        e.preventDefault()
    }
    const handleDropImage = (e, index) => {
        e.preventDefault()
        e.stopPropagation()
        if (dragIndex === null || dragIndex === index) return
        setImages(prev => {
            const newImages = [...prev]
            const dragged = newImages[dragIndex]
            newImages.splice(dragIndex, 1)
            newImages.splice(index, 0, dragged)
            return newImages
        })
        setDragIndex(null)
    }
    const addOption = () => {
        const value = optionInput.trim()
        if (!value) return
        setOptions(prev => {
            const normalized = value.toLowerCase()
            const exists = prev.some(opt => opt.toLowerCase() === normalized)
            if (exists) return prev
            setVariantsData(prevData => {
            const keys = Object.keys(prevData)
            if (keys.length > 0) {
                const lastKey = keys[keys.length - 1]
                const last = prevData[lastKey]
                    return {
                        ...prevData,
                        [value]: {
                            stock: last.stock,
                            price: last.price
                        }
                    }
                }
                const newData = {
                    ...prevData,
                    [value]: {
                        stock: 0,
                        price: Number(price) || 0
                    }
                }
                setPrice("")
                return newData
            })
            return [...prev, value]
        })
        setOptionInput("")
    }
    const sendProduct=async()=>{
        setLoading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append("product_name", name.trim())
            formData.append("description", description.trim())
            formData.append("catalog", catalog.trim())
            if (options.length === 0) {
                formData.append("price", Number(price))
                formData.append("stock", stock)
            } else {
                const variants = options.map(opt => ({
                    option: opt,
                    stock: Number(variantsData[opt]?.stock || 0),
                    price: Number(variantsData[opt]?.price || 0)
                }))
                formData.append("variants", JSON.stringify(variants))
            }
            let parsedSpecs = {}
            if(specifications.trim()){
                try{
                    parsedSpecs = parseSpecifications(specifications)
                }catch(err){
                    setError(err.message)
                    setLoading(false)
                    return
                }
                formData.append(
                    "specifications",
                    JSON.stringify(parsedSpecs)
                )
            }
            images.forEach(img => {
                formData.append("files", img.file)
            })
            await api.post(
                "product-control/product",
                formData,
                {
                    headers:{
                        "Content-Type":"multipart/form-data"
                    }
                }
            )
            setImages([])
            setName("")
            setDescription("")
            setCatalog("")
            setPrice("")
            setStock("")
            setOptions([])
            setSpecifications("")
            setVariantsData({})
            alert("Producto creado correctamente")
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    return(
        <div className="create-product-cont">
            <h1>Crear producto</h1>
            <div className="create-product-flex">
                <ProductImage
                    images={images}
                    inputRef={inputRef}
                    removeImage={removeImage}
                    openGallery={openGallery}
                    handleChange={handleChange}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    handleDragStart={handleDragStart}
                    handleDropImage={handleDropImage}
                    handleDragOverImage={handleDragOverImage}
                />
                <div className="create-product-data">
                    <input
                        type="text"
                        style={{fontSize:"40px"}}
                        placeholder="Nombre del producto"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Catálogo"
                        style={{fontSize:"25px", alignSelf: "flex-start"}}
                        value={catalog}
                        onChange={(e)=>setCatalog(e.target.value)}
                    />
                    {options.length === 0 && (
                        <input
                            className="create-product-price"
                            type="number"
                            placeholder="Precio"
                            value={price}
                            onChange={(e)=>setPrice(e.target.value)}
                        />
                    )}
                    <div className="options-container">
                        <strong>No puedes ingresar opciones repetidas:</strong>
                        <div className="options-list">
                            {options.map((opt,i)=>(
                                <div key={i} className="option-item">
                                    <span>{opt}</span>
                                    <button onClick={()=>{
                                        const optToRemove = options[i]
                                        setOptions(prev => prev.filter((_,index)=>index!==i))
                                        setVariantsData(prev => {
                                            const copy = {...prev}
                                            const removed = prev[optToRemove]
                                            delete copy[optToRemove]
                                            if (Object.keys(copy).length === 0) {
                                                setPrice(removed?.price || "")
                                                setStock(removed?.stock || "")
                                            }
                                            return copy
                                        })
                                    }}>
                                        X
                                    </button>
                                </div>
                            ))}
                            <div className="aggregate-option">
                                <input
                                    type="text"
                                    placeholder="Añadir opción"
                                    value={optionInput}
                                    onChange={(e)=>setOptionInput(e.target.value)}
                                    onKeyDown={(e)=>{
                                        if(e.key === "Enter"){
                                            e.preventDefault()
                                            addOption()
                                        }
                                    }}
                                />
                                <button onClick={()=>{
                                    addOption()
                                }}>
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    {options.length === 0 ? (
                        <input
                            className="create-product-stock"
                            type="number"
                            placeholder="Stock"
                            value={stock}
                            onChange={(e)=>setStock(e.target.value)}
                        />
                    ) : (
                        <div className="stock-by-option">
                            {options.map((opt, i) => (
                                <div key={i} className="stock-option-item">
                                    <span>{opt}</span>
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={variantsData[opt]?.stock ?? ""}
                                        onChange={(e)=>{
                                            const value = e.target.value
                                            setVariantsData(prev => ({
                                                ...prev,
                                                [opt]: {
                                                    ...prev[opt],
                                                    stock: value
                                                }
                                            }))
                                        }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Precio"
                                        value={variantsData[opt]?.price ?? ""}
                                        onChange={(e)=>{
                                            const value = e.target.value
                                            setVariantsData(prev => ({
                                                ...prev,
                                                [opt]: {
                                                    ...prev[opt],
                                                    price: value
                                                }
                                            }))
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <h3>Descripción:</h3>
            <textarea
                className="product-description"
                placeholder="Descripción"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
            />
            <div className="specifications-editor">
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
            </div>
            {error&&<p className="create-error">{error}.</p>}
            <div className="create-button">
                <button 
                    disabled={
                        images.length === 0 ||
                        !name.trim() ||
                        !catalog.trim() ||
                        (
                            options.length === 0
                                ? !price || !stock
                                : options.some(opt =>
                                    !variantsData[opt] ||
                                    variantsData[opt].stock === "" ||
                                    variantsData[opt].price === ""
                                )
                        ) ||
                        loading
                    }
                    onClick={sendProduct}
                >
                    {loading ? "Creando..." : "Crear"}
                </button>
            </div>
        </div>
    )
}
export default CreateProduct