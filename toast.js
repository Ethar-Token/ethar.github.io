function showToast(message, type = "success") {

    const old = document.getElementById("etharToast");

    if (old) {
        old.remove();
    }

    const toast = document.createElement("div");

    toast.id = "etharToast";

    toast.innerHTML = `
        <span class="toastIcon">
            ${type === "success" ? "✔" : "✖"}
        </span>

        <span class="toastText">
            ${message}
        </span>
    `;

    toast.className = "etharToast";

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        },300);

    },3000);

}
