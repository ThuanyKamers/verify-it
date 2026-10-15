import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Lista de dados com linha pontilhada entre o nome e o valor, como num documento. */
export function Leaders({ rows }) {
    return (_jsx("dl", { className: "leaders", children: rows.map((row) => (_jsxs("div", { children: [_jsx("dt", { children: row.label }), _jsx("span", { className: "fill", "aria-hidden": "true" }), _jsx("dd", { children: row.value })] }, row.label))) }));
}
