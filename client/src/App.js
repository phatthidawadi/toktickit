import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { checkSystem } from "./api.js";
export default function App() {
    const [state, setState] = useState("idle");
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    async function handleCheck() {
        setState("loading");
        setErrorMessage("");
        try {
            const result = await checkSystem();
            setCategories(result.categories);
            setState("success");
        }
        catch (err) {
            setErrorMessage(err?.message ?? "Unable to connect to TokTickIT API");
            setState("error");
        }
    }
    return (_jsxs("div", { className: "container py-5", style: { maxWidth: 640 }, children: [_jsxs("h1", { className: "h3 mb-4", children: ["TokTickIT ", _jsx("span", { className: "text-success", children: "IT Service Desk" })] }), _jsx("button", { className: "btn btn-success mb-4", onClick: handleCheck, disabled: state === "loading", children: state === "loading" ? "Loading…" : "Check System" }), state === "success" && (_jsxs("div", { className: "mt-3", children: [_jsxs("p", { className: "fw-bold mb-3", children: ["System Status: ", _jsx("span", { className: "text-success", children: "Online" })] }), _jsx("p", { className: "fw-semibold mb-2", children: "Supported Request Categories:" }), _jsx("ol", { className: "list-group list-group-numbered", children: categories.map((cat) => (_jsx("li", { className: "list-group-item", children: cat.name }, cat.id))) })] })), state === "error" && (_jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "fw-bold text-danger mb-2", children: "System Status: Offline" }), _jsx("div", { className: "alert alert-danger", role: "alert", children: errorMessage || "Unable to connect to TokTickIT API" })] }))] }));
}
