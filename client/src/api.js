const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
export async function checkSystem() {
    const healthRes = await fetch(`${API_URL}/api/health`);
    if (!healthRes.ok) {
        throw new Error("Unable to connect to TokTickIT API");
    }
    const categoriesRes = await fetch(`${API_URL}/api/categories`);
    if (!categoriesRes.ok) {
        throw new Error("Unable to connect to TokTickIT API");
    }
    const categories = await categoriesRes.json();
    return { online: true, categories };
}
