import "./showOptions.css"

function ShowOptions({ title, labels, values, option, onChangeOption, text }) {
    return (
        <div className="bar-container">
            <h2>{title}:</h2>
            <select
                className="selected-options"
                value={option || ""}
                disabled={text !== null}
                onChange={(e) => onChangeOption(e.target.value)}
            >
                <option value="" disabled>
                    Selecciona una opción
                </option>
                {labels.map((label, index) => {
                    const value = values[index]
                    return (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    )
                })}
            </select>
        </div>
    )
}

export default ShowOptions