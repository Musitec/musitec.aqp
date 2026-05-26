import { useState } from "react"
import "./showOptions.css"

function ShowOptions({
    title,
    labels,
    values,
    option,
    onChangeOption,
    text
}) {
    const [open, setOpen] = useState(false)
    const handleSelect = (value) => {
        onChangeOption(value)
        setOpen(false)
    }
    return (
        <div className="bar-container">
            <h2>{title} {open?option:""}:</h2>
            <div className="custom-select">
                <div
                    className="selected-box"
                    onClick={() => !text && setOpen(!open)}
                >
                    {
                        option
                            ? labels[values.indexOf(option)]
                            : "Selecciona una opción"
                    }
                </div>
                <div className={`options-container ${open ? "open" : ""}`}>
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