
export async function fetchAttachments(commentId) {
    const response = await fetch(`/api/comments/${commentId}/attachments`);
    if (!response.ok) {
        throw new Error("Failed to load attachments.");
    }

    return response.json();
}

export async function uploadAttachment(commentId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/comments/${commentId}/attachments`, {
        method:"POST",
        body: formData,
    });

    if(!response.ok){
        let message = "Failed to upload attachment.";

        try {
            const data = await response.json();
            console.log("Upload attachment error: ", data);

            if(data?.error) {
                message = data.error;
            } else if (data?.error) {
                message = data.detail;
            } else if (data?.title) {
                message = data.title;
            }
        } catch (e) {
            console.error("Error parsing upload error: ", e);
            //TODO:
        }

        throw new Error(message);
    }

    return await response.json();
}

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
    sortBy = "createdAt",
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

    return response.json(); // { items, page, pageSize, totalCount }
}

export async function fetchCommentsTree() {
    const response = await fetch("/api/Comments/all");

    if(!response.ok){
        throw new Error("Failed to load comments");
    }

    return response.json();
}

export async function createComment(payload) {
    
        const response = await fetch("/api/Comments", {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let message = "Failed to create comment.";

            try {
                const data = await response.json();

                // TODO: to be deleted
                console.log("Create comment error response:", data);
                if(data?.error){
                    message = data.error;
                } else if (data?.detail){
                    message = data.detail;
                } else if (data?.title){
                    message = data.title;
                }

                if (data?.errors) {
                    const allErrors = Object.values(data.errors).flat();
                    if(allErrors.length > 0){
                        message = allErrors[0];
                    }
                }

                // if(data?.error){
                //     message = data.error;
                // }            
            } catch (e) {
                console.error("Error paesing error response: ", e)                
            }

        throw new Error(message);
    }

    return await response.json(); // { id: ... }            
}