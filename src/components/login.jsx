import { useEffect, useRef, useState } from "react"
import "./login.css"
import api from "../services/api"

function LoginModal({ annonimousOrder,onClose, onEnterSession }) {
    const [form, setForm] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword,setShowConfirmPassword]=useState(false)
    const [closing, setClosing] = useState(false)
    const [open, setOpen] = useState(false)
    const [loading,setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [mode, setMode] = useState("login")
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [passwordForm, setPasswordForm] = useState({
        password: "",
        confirmPassword: ""
    })
    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        })
    }
    const inputsRef = useRef([])
    const passwordRules = {
        minLength: passwordForm.password.length >= 8,
        hasNumber: /\d/.test(passwordForm.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.password),
        noSpaces: !/\s/.test(passwordForm.password)
    }
    const isPasswordValid = Object.values(passwordRules).every(Boolean)
    const handleCodeChange = (index, value) => {
        if (!/^\d?$/.test(value)) return
        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }
        if (newCode.every(d => d !== "")) {
            submitCode(newCode.join(""))
        }
    }
    const handleCodeKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (code[index] === "" && index > 0) {
                inputsRef.current[index - 1]?.focus()
            }
        }
    }
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text").slice(0, 6)
        if (!/^\d+$/.test(paste)) return
        const newCode = paste.split("").slice(0, 6)
        setCode(newCode)
        const lastIndex = newCode.length - 1
        inputsRef.current[lastIndex]?.focus()
        if (newCode.length === 6) {
            submitCode(newCode.join(""))
        }
    }
    const submitCode = async (pin) => {
        try {
            setLoading(true)
            setError(null)
            const email = registerForm.email || form.email
            if(mode==="register-step-2"){
                await api.post("auth/verify-pin", {
                    email: email,
                    pin
                })
                setMode("register-step-3")
            }else if(mode==="set-password-step2"){
                await api.post("auth/verify-reset-pin", {
                    email: email,
                    pin
                })
                setMode("set-password-step3")
            }
        } catch (error) {
            setError(error.response?.data?.detail || "Código incorrecto")
            setCode(["", "", "", "", "", ""])
            inputsRef.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }
    const [registerForm, setRegisterForm] = useState({
        name: "",
        email: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
        sex: "male",
        phone: ""
    })
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
    }
    const closeWithAnimation = () => {
        setOpen(false)
        setClosing(true)
        setTimeout(() => {
            onClose()
        }, 250)
    }
    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if(mode==="login"){
                await api.post("auth/login/", {
                    email: form.email,
                    password: form.password
                })
                closeWithAnimation()
                await onEnterSession()
            }else if(mode==="register-step-1"){
                const { birthDay, birthMonth, birthYear } = registerForm
                const birth_date = `${birthYear.padStart(4, "0")}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`
                await api.post("auth/register",{
                    name: registerForm.name,
                    email: registerForm.email,
                    phone: registerForm.phone,
                    birth_date: birth_date,
                    sex: registerForm.sex
                })
                setMode("register-step-2")
            }else if(mode==="request-reg-step-2"){
                await api.post("auth/resend-pin",{
                    email: registerForm.email
                })
                setMode("register-step-2")
            }else if(mode==="set-password-step1"){
                await api.post("auth/start-change",{
                    email: registerForm.email
                })
                setMode("set-password-step2")
            }else if(mode==="request-cha-step-2"){
                await api.post("auth/resend-change",{
                    email: registerForm.email
                })
                setMode("set-password-step2")
            }
        } catch (error) {
            const data = error.response?.data
            if (Array.isArray(data?.detail)) {
                const messages = data.detail.map(err => {
                    const field = err.loc?.[1] || "campo"
                    const msg = err.msg || "Error de validación"
                    return `El campo "${field}" ${msg === "Field required" ? "es obligatorio" : msg}`
                })
                setError(messages.join(". "))
            } else {
                setError(data?.detail || "Ocurrió un error, intenta nuevamente")
            }
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        const t = setTimeout(() => setOpen(true), 10)
        return () => clearTimeout(t)
    }, [])
    return (
        <div className="login-backdrop" onClick={(mode === "login" || mode === "register-step-1" || mode==="set-password-step1")?closeWithAnimation:undefined}>
            <div className={`login-modal ${open ? "open" : ""} ${closing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
                {(mode === "login" || mode === "register-step-1" || mode==="set-password-step1")&&
                <button type="button" className="cancel" onClick={!loading ? closeWithAnimation : undefined}>
                    X
                </button>}
                <form className="modal-form" onSubmit={handleSubmit}>
                    {mode === "login" && (
                    <>
                        {annonimousOrder&&<p><strong>¿Quieres ver tu orden?</strong> Accede a tu cuenta</p>}
                        <h2>Iniciar sesión</h2>
                        <input 
                            type="email"
                            name="email"
                            placeholder="Correo electrónico" 
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="password-field">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password"
                            >
                                <i className={showPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                            </div>
                        </div>
                        {error && <p className="error_modal">{error}.</p>}
                        <div className="change-password-button">
                            <button type="button" onClick={()=> setMode("set-password-step1")}>
                                ¿No tienes o no te acuerdas de tu contraseña?
                            </button>
                        </div>
                        <div className="actions-container">
                            <button disabled={loading} type="submit">
                                {loading ? "Entrando..." : "Entrar"}
                            </button>
                            <div className="register-action">
                                <p>¿Todavía no tienes una cuenta?</p>
                                <button type="button" onClick={() => setMode("register-step-1")}>
                                    Registrarse
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {mode === "register-step-1" && (
                    <>
                        <h3>Registro</h3>
                        <div className="input-flex">
                            <div className="input-column">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nombre completo"
                                    value={registerForm.name}
                                    onChange={handleRegisterChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>
                            <div className="input-column">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Número de teléfono"
                                    value={registerForm.phone}
                                    onChange={handleRegisterChange}
                                    required
                                />
                                <select
                                    name="sex"
                                    value={registerForm.sex}
                                    onChange={handleRegisterChange}
                                    required
                                >
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                </select>
                            </div>
                        </div>
                        <p>Fecha de nacimiento:</p>
                        <div className="birthdate-inputs">
                            <input
                                type="number"
                                name="birthDay"
                                placeholder="Día"
                                min="1"
                                max="31"
                                value={registerForm.birthDay}
                                onChange={handleRegisterChange}
                                required
                            />
                            <input
                                type="number"
                                name="birthMonth"
                                placeholder="Mes"
                                min="1"
                                max="12"
                                value={registerForm.birthMonth}
                                onChange={handleRegisterChange}
                                required
                            />
                            <input
                                type="number"
                                name="birthYear"
                                placeholder="Año"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={registerForm.birthYear}
                                onChange={handleRegisterChange}
                                required
                            />
                        </div>
                        {error && <p className="error_modal">{error}.</p>}
                        <div className="actions-container">
                            <div className="actions-flex">
                                <button type="button" onClick={() => setMode("login")}>
                                    Volver
                                </button>
                                <button type="submit" disabled={loading}>
                                    {loading?"Espera":"Continuar"}
                                </button>
                            </div>
                            <div className="retry-actions">
                                <p>¿Ya completaste el primer paso?</p>
                                <button type="button" onClick={()=> setMode("request-reg-step-2")}>
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {mode === "request-reg-step-2" &&
                    <>
                        <h3>Ingresa tu correo</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            required
                        />
                        {error && <p className="error_modal">{error}.</p>}
                        <div className="resend-actions">
                            <div className="actions-flex">
                                <button type="button" onClick={()=>setMode("register-step-1")}>Volver</button>
                                <button type="submit" disabled={loading}>
                                    {loading?"Espera":"Continuar"}
                                </button>
                            </div>
                        </div>
                    </>
                }
                {mode === "register-step-2" && (
                    <>
                        <h3>Verifica tu correo</h3>
                        <p>Ingresa el código de 6 dígitos que te enviamos</p>
                        <div className="code-container" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputsRef.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    className="code-input"
                                />
                            ))}
                        </div>
                        {error && <p className="error_modal">{error}</p>}
                        <div className="resend-actions">
                            <button type="button" onClick={() => setMode("register-step-1")}>
                                Volver
                            </button>
                            <button type="button"
                            disabled={loading}
                            onClick={async () => {
                                try {
                                    setLoading(true)
                                    await api.post("auth/resend-pin", { email: registerForm.email || form.email })
                                } catch {
                                    setError("No se pudo reenviar el código")
                                } finally {
                                    setLoading(false)
                                }
                            }}>{loading?"Reenviando":"Reenviar"}</button>
                        </div>
                    </>
                )}
                {mode === "register-step-3" && (
                    <>
                        <h3>Crea tu contraseña</h3>
                        <div className="password-field">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={passwordForm.password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password"
                            >
                                <i className={showPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                            </div>
                        </div>
                        <div className="password-rules">
                            <p className={passwordRules.noSpaces ? "rule-ok" : "rule-bad"}>
                                • No debe contener espacios
                            </p>
                            <p className={passwordRules.minLength ? "rule-ok" : "rule-bad"}>
                                • Mínimo 8 caracteres
                            </p>
                            <p className={passwordRules.hasNumber ? "rule-ok" : "rule-bad"}>
                                • Al menos un número
                            </p>
                            <p className={passwordRules.hasSpecial ? "rule-ok" : "rule-bad"}>
                                • Al menos un carácter especial
                            </p>
                        </div>
                        <div className="password-field">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Repite la contraseña"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="toggle-password"
                            >
                                <i className={showConfirmPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                            </div>
                        </div>
                        {passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword && (
                            <p className="error_modal">Las contraseñas no coinciden</p>
                        )}
                        <div className="actions-container">
                            <button type="button" onClick={() => setMode("register-step-2")}>
                                Volver
                            </button>
                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !isPasswordValid ||
                                    passwordForm.password !== passwordForm.confirmPassword
                                }
                                onClick={async () => {
                                    try {
                                        setLoading(true)
                                        setError(null)
                                        await api.post("auth/set-password", {
                                            email: registerForm.email,
                                            password: passwordForm.password,
                                            confirm_password: passwordForm.confirmPassword
                                        })
                                        closeWithAnimation()
                                        await onEnterSession()
                                    } catch (err) {
                                        setError("No se pudo crear la contraseña")
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            >
                                {loading ? "Guardando..." : "Finalizar registro"}
                            </button>
                        </div>
                    </>
                )}
                {mode==="set-password-step1"&&
                    <>
                        <h3>Ingresa tu correo</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            required
                        />
                        {error && <p className="error_modal">{error}.</p>}
                        <div className="actions-container">
                            <div className="actions-flex">
                                <button type="button" onClick={() => setMode("login")}>
                                    Volver
                                </button>
                                <button type="submit" disabled={loading}>
                                    {loading?"Espera":"Continuar"}
                                </button>
                            </div>
                            <div className="retry-actions">
                                <p>¿Ya completaste el primer paso?</p>
                                <button type="button" onClick={()=> setMode("request-cha-step-2")}>
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </>
                }
                {mode==="request-cha-step-2"&&
                    <>
                        <h3>Ingresa tu correo</h3>
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            required
                        />
                        {error && <p className="error_modal">{error}.</p>}
                        <div className="resend-actions">
                            <div className="actions-flex">
                                <button type="button" onClick={()=>setMode("set-password-step1")}>Volver</button>
                                <button type="submit" disabled={loading}>
                                    {loading?"Espera":"Continuar"}
                                </button>
                            </div>
                        </div>
                    </>
                }
                {mode === "set-password-step2" && (
                    <>
                        <h3>Verifica tu correo</h3>
                        <p>Ingresa el código de 6 dígitos que te enviamos</p>
                        <div className="code-container" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputsRef.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    className="code-input"
                                />
                            ))}
                        </div>
                        {error && <p className="error_modal">{error}</p>}
                        <div className="resend-actions">
                            <button type="button" onClick={() => setMode("set-password-step1")}>
                                Volver
                            </button>
                            <button type="button"
                            disabled={loading}
                            onClick={async () => {
                                try {
                                    setLoading(true)
                                    await api.post("auth/resend-change", { email: registerForm.email || form.email })
                                } catch {
                                    setError("No se pudo reenviar el código")
                                } finally {
                                    setLoading(false)
                                }
                            }}>{loading?"Reenviando":"Reenviar"}</button>
                        </div>
                    </>
                )}
                {mode === "set-password-step3" && (
                    <>
                        <h3>Crea tu contraseña</h3>
                        <div className="password-field">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Contraseña"
                                value={passwordForm.password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password"
                            >
                                <i className={showPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                            </div>
                        </div>
                        <div className="password-rules">
                            <p className={passwordRules.noSpaces ? "rule-ok" : "rule-bad"}>
                                • No debe contener espacios
                            </p>
                            <p className={passwordRules.minLength ? "rule-ok" : "rule-bad"}>
                                • Mínimo 8 caracteres
                            </p>
                            <p className={passwordRules.hasNumber ? "rule-ok" : "rule-bad"}>
                                • Al menos un número
                            </p>
                            <p className={passwordRules.hasSpecial ? "rule-ok" : "rule-bad"}>
                                • Al menos un carácter especial
                            </p>
                        </div>
                        <div className="password-field">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Repite la contraseña"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="toggle-password"
                            >
                                <i className={showConfirmPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                            </div>
                        </div>
                        {passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword && (
                            <p className="error_modal">Las contraseñas no coinciden</p>
                        )}
                        <div className="actions-container">
                            <button type="button" onClick={() => setMode("set-password-step2")}>
                                Volver
                            </button>
                            <button
                                type="button"
                                disabled={
                                    loading ||
                                    !isPasswordValid ||
                                    passwordForm.password !== passwordForm.confirmPassword
                                }
                                onClick={async () => {
                                    try {
                                        setLoading(true)
                                        setError(null)
                                        await api.post("auth/change-password", {
                                            email: registerForm.email,
                                            password: passwordForm.password,
                                            confirm_password: passwordForm.confirmPassword
                                        })
                                        closeWithAnimation()
                                        await onEnterSession()
                                    } catch (err) {
                                        setError("No se pudo crear la contraseña")
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            >
                                {loading ? "Guardando..." : "Finalizar cambio"}
                            </button>
                        </div>
                    </>
                )}
                </form>
            </div>
        </div>
    )
}
export default LoginModal