import { useRef, useState } from "react"
import "./showOptions.css"

function ShowOptions({
    title,
    labels,
    values,
    option,
    onChangeOption,
    text
}) {
    const optionsRef=useRef(null)
    const [open, setOpen] = useState(false)
    const handleSelect = (value) => {
        onChangeOption(value)
        setOpen(false)
    }
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [scrollTop, setScrollTop] = useState(0)
    const handleMouseDown = (e) => {
        setIsDragging(true)
        setStartY(e.pageY - optionsRef.current.offsetTop)
        setScrollTop(optionsRef.current.scrollTop)
    }
    const handleMouseMove = (e) => {
        if(!isDragging) return
        e.preventDefault()
        const y = e.pageY - optionsRef.current.offsetTop
        const walk = (y - startY) * 1.5
        optionsRef.current.scrollTop = scrollTop - walk
    }
    const handleMouseUp = () => {
        setIsDragging(false)
    }
    return (
        <div className="bar-container">
            <div style={{"display":"flex","alignItems":"center"}}><strong style={{"fontSize":"24px"}}>{title}</strong><p style={{"fontSize":"16px"}}>{open?"":"/"+labels[values.indexOf(option)]}</p></div>
            <div className="custom-select">
                <div
                    className="selected-box"
                    onClick={() => !text && setOpen(!open)}
                >
                    {
                        option
                            ? labels[values.indexOf(option)]
                            : ""
                    }
                </div>
                <div 
                    ref={optionsRef}
                    className={`options-container ${open ? "open" : ""}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                    onMouseUp={handleMouseUp}
                >
                    {
                        labels.map((label, index) => {
                            const value = values[index]
                            return (
                                <div
                                    key={value}
                                    className="option-item"
                                    onClick={() => handleSelect(value)}
                                >
                                    {label}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ShowOptions