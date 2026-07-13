const supabaseUrl = "https://ynohexdhktetiepmbwnx.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlub2hleGRoa3RldGllcG1id254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDU5ODcsImV4cCI6MjA5OTI4MTk4N30.bOgCv0UJxYvNSXDxCFs9_6lWfm-h5RipjLzqFIC7Miw";

const client = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

async function requireLogin() {

    const { data, error } = await client.auth.getSession();

    if (error || !data.session) {

        window.location.href = "login.html";
        return;

    }

    return data.session;

}

async function loadBalances() {

    const {
        data: { user }
    } = await client.auth.getUser();

    if (!user) return;

    const { data, error } = await client
        .from("profiles")
        .select("account_balance, tickets, ethar_balance")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    document.getElementById("accountBalance").textContent =
        "$" + Number(data.account_balance).toFixed(2);

    document.getElementById("ticketBalance").textContent =
        data.tickets;

    document.getElementById("etharBalance").textContent =
        Number(data.ethar_balance).toFixed(1) + " ETHAR";

}

loadBalances();
