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

    const balance = "$" + Number(data.account_balance).toFixed(2);

    const wallet = document.getElementById("accountBalance");
    if (wallet) wallet.textContent = balance;

    const header = document.getElementById("headerBalance");
    if (header) header.textContent = balance;
    
    document.getElementById("ticketBalance").textContent =
        data.tickets;

    document.getElementById("etharBalance").textContent =
        Number(data.ethar_balance).toFixed(2) + " ETHAR";

}

loadBalances();

async function loadCurrentDraw(){

    const { data, error } = await client
    .from("draws")
    .select("*")
    .eq("status","live")
    .single();

    if(error){

        console.log(error);
        return;

    }

    document.getElementById("prizeAmount").textContent =
        "$" + Number(data.prize).toFixed(2);

    document.getElementById("totalTickets").textContent =
        data.total_tickets.toLocaleString();

    const end = new Date(data.ends_at);

    document.getElementById("endsAt").textContent =
        end.toUTCString().split(" ").slice(0,4).join(" ");

    document.getElementById("endsAt").textContent =
        end.toUTCString().split(" ")[4] + " UTC";

    startCountdown(end);

}
