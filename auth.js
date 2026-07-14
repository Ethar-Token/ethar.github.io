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
        .select("account_balance, tickets, tickets_entered, ethar_balance")
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
    
    const ticket = document.getElementById("ticketBalance");
    if(ticket){

       ticket.textContent = data.tickets;

    }

    const entered = document.getElementById("ticketsEntered");
    if(entered){
        entered.textContent = data.tickets_entered;
    }

    const ethar = document.getElementById("etharBalance");
    if(ethar){
        ethar.textContent =
            Number(data.ethar_balance).toFixed(2) + " ETHAR";

    }
}


async function loadCurrentDraw(){

    const { data, error } = await client
    .from("draws")
    .select("prize_amount, total_tickets, ends_at")
    .eq("status","live")
    .single();

    if(error){

        console.log(error);
        return;

    }

    const prize = document.getElementById("prizeAmount");
    if(prize){
        prize.textContent =
        "$" + Number(data.prize_amount).toFixed(2);
    }


    const totalTickets = document.getElementById("totalTickets");
    if(totalTickets){
        totalTickets.textContent =
        data.total_tickets.toLocaleString();
    }

    const end = new Date(data.ends_at);

    const drawDate = document.getElementById("drawDate");

    if(drawDate){
        drawDate.textContent =
        end.toUTCString().split(" ").slice(0,4).join(" ");

    }

    const drawTime = document.getElementById("drawTime");

    if(drawTime){
        drawTime.textContent =
        end.toUTCString().split(" ")[4] + " UTC";

    }

    if(typeof startCountdown === "function"){
        
        startCountdown(end);
    }

}
