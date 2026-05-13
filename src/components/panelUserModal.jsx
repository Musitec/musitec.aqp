import { useEffect, useState } from "react"
import api from "../services/api"
import getErrorMessage from "./getError"

function ShowPanelUserModal({ blocked, onClose, email, finish }) {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const [minutes, setMinutes] = useState("")
    const closeWithAnimation = () => {
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const blockedUser=async()=>{
        setLoading(true)
        setError(null)
        try {
            await api.patch("users-control/block", {
                target_user_email: email,
                block: !blocked,
                minutes: !blocked ? Number(minutes) : undefined
            })
            closeWithAnimation()
            finish()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    return (
        <div
            className="cart-backdrop"
            onClick={!loading ? closeWithAnimation : undefined}
        >
            <div
                className={`cart-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="product-modal-content">
                    <h1>
                        ¿Quieres {blocked ? "desbloquear" : "bloquear"} a este usuario?
                    </h1>
                    {!blocked && (
                        <div className="minutes-input-container">
                            <label>Minutos de bloqueo</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Ej: 30"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}
                    {error && (
                        <div className="err-mess">
                            <p>{error}</p>
                        </div>
                    )}
                    <div className="modal-button-flex">
                        <button
                            className="confirm-button"
                            disabled={
                                loading ||
                                (!blocked && (!minutes || Number(minutes) <= 0))
                            }
                            onClick={blockedUser}
                        >
                            Si
                        </button>
                        <button
                            className="cancel-button"
                            onClick={closeWithAnimation}
                            disabled={loading}
                        >
                            No
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ShowPanelUserModal