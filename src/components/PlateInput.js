import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
/** Campo de placa desenhado como uma placa Mercosul: é o campo de verdade, não uma imagem. */
export function PlateInput({ value, onChange, label, hint }) {
    const id = useId();
    return (_jsxs("div", { className: "plate-field", children: [_jsx("label", { htmlFor: id, children: label }), _jsxs("div", { className: "plate", children: [_jsx("span", { className: "plate-band", "aria-hidden": "true", children: "BRASIL" }), _jsx("input", { id: id, className: "plate-input", value: value, maxLength: 7, placeholder: "ABC1D23", autoCapitalize: "characters", autoComplete: "off", spellCheck: false, "aria-describedby": hint ? `${id}-hint` : undefined, onChange: (e) => onChange(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()) })] }), hint && _jsx("small", { id: `${id}-hint`, children: hint })] }));
}
