export async function fetchCaptcha() {
    const result = await fetch("/api/Captcha");
    if(!result.ok){
        const text = await result.text();
        console.error("Captcha error:", result.status, text);
        throw new Error("Failed to load captcha");
    }
    return result.json();
}

export async function fetchComments(
    page = 1,
    pageSize = 25,
    sortBy = "ceatedAt",
    sortDirection = "desc"
) {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDirection
    });

    const response = await fetch(`/api/Comments?${params.toString()}`);

    if(!response.ok){
        throw new Error("Failed to load comments");
    }

    return response.json();
}