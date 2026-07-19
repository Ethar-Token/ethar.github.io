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
        .select("account_balance, tickets, tickets_entered, total_tickets_entered, ethar_balance")
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

    const totalTicketsEntered =
        document.getElementById("totalTicketsEntered");

    if(totalTicketsEntered){
        totalTicketsEntered.textContent =
             data.total_tickets_entered.toLocaleString();
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
    .select("prize_amount, total_tickets, ends_at, starts_at, status")
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

let countdown;

function startCountdown(endTime){

    clearInterval(countdown);

    countdown = setInterval(() => {

        let diff = endTime - new Date();

        if(diff < 0){
            diff = 0;
        }

        const hours = String(Math.floor(diff / 3600000)).padStart(2,"0");
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2,"0");
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2,"0");

        // Dashboard countdown
        const c = document.getElementById("c");
        if(c){
            c.textContent = `${hours}:${minutes}:${seconds}`;
        }

        // Dashboard circle countdown
        const cc = document.getElementById("cc");
        if(cc){
            cc.textContent = `${hours}:${minutes}:${seconds}`;
        }

        // Homepage countdown
        const endsAt = document.getElementById("endsAt");
        if(endsAt){
            endsAt.textContent = `${hours}:${minutes}:${seconds}`;
        }

    },1000);

}

async function loadReferrals(){

    const {
        data:{user}
    } = await client.auth.getUser();

    if(!user) return;

    // Get my referral information
    const { data: profile, error: profileError } = await client
        .from("profiles")
        .select(`
            referral_code,
            total_referral_earnings
        `)
        .eq("id", user.id)
        .single();

    if(profileError){
        console.log(profileError);
        return;
    }

    // Referral code
    const code = document.getElementById("referralCode");
    if(code){
        code.textContent = profile.referral_code;
    }

    // Referral link
    const link =
        "https://ethartoken.com/?ref=" + profile.referral_code;

    const referralLink =
        document.getElementById("referralLink");

    if(referralLink){
        referralLink.textContent = link;
    }

    // Total referral earnings
    const earnings =
        document.getElementById("totalReferralEarnings");

    if(earnings){
        earnings.textContent =
            "$" + Number(profile.total_referral_earnings).toFixed(2);
    }

    // Load referrals
    const { data, error } = await client
        .from("referrals")
        .select(`
            created_at,
            profiles!referrals_referred_id_fkey(
                first_name,
                total_won
            )
        `)
        .eq("referrer_id", user.id);

    if(error){
        console.log(error);
        return;
    }

    // Total referrals
    const total =
        document.getElementById("totalReferrals");

    if(total){
        total.textContent = data.length;
    }

    const tbody =
        document.getElementById("referralTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(data.length === 0){

        tbody.innerHTML = `
        <tr>
            <td colspan="3" style="text-align:center;color:#999;">
                You haven't referred anyone yet.
            </td>
        </tr>`;

        return;

    }

    data.forEach(r=>{

        tbody.innerHTML += `
        <tr>

            <td>${r.profiles.first_name}</td>

            <td>${new Date(r.created_at).toLocaleDateString()}</td>

            <td>$${Number(r.profiles.total_won).toFixed(2)}</td>

        </tr>`;
    });

    // Update Copy/Share buttons with the real link
    window.referralLink = link;

}

async function loadWithdrawals(){

    const {
        data:{user}
    } = await client.auth.getUser();

    if(!user) return;

    const { data, error } = await client
        .from("withdrawals")
        .select(`
            requested_at,
            method,
            amount,
            status
        `)
        .eq("user_id", user.id)
        .order("requested_at",{ascending:false})
        .limit(10);

    if(error){
        console.log(error);
        return;
    }

    const tbody = document.getElementById("withdrawalTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(data.length === 0){

        tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;color:#999;">
                No transaction history.
            </td>
        </tr>`;

        return;

    }

    data.forEach(w=>{

        tbody.innerHTML += `
        <tr>

            <td>${new Date(w.requested_at).toLocaleDateString()}</td>

            <td>Withdrawal</td>

            <td>${w.method}</td>

            <td>$${Number(w.amount).toFixed(2)}</td>

            <td>${w.status}</td>

        </tr>`;
    });

}

async function loadWinners(){

    const { data, error } = await client
        .from("draw_winners")
        .select(`
            prize,
            profiles!draw_winners_user_id_fkey(
                first_name,
                email
            )
        `)
        .order("id");

    if(error){
        console.log(error);
        return;
    }

    const tbody = document.getElementById("winnersTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    if(data.length === 0){

        tbody.innerHTML = `
        <tr>
            <td colspan="3" style="text-align:center;color:#999;">
                No winners yet.
            </td>
        </tr>`;

        return;
    }

    data.forEach(w=>{

        const email = w.profiles.email;
        const parts = email.split("@");

        const hiddenEmail =
            parts[0].substring(0,3) +
            "****@" +
            parts[1];

        tbody.innerHTML += `
        <tr>

            <td>${w.profiles.first_name}</td>

            <td>${hiddenEmail}</td>

            <td>$${Number(w.prize).toFixed(2)}</td>

        </tr>`;
    });

}

async function loadProfile(){

    const {
        data:{user}
    } = await client.auth.getUser();

    if(!user) return;

    const {data,error} = await client
        .from("profiles")
        .select(`
            first_name,
            last_name,
            email,
            phone,
            dob,
            country,
            kyc_status
        `)
        .eq("id",user.id)
        .single();

    if(error){
        console.log(error);
        return;
    }

    document.getElementById("firstName").value = data.first_name || "";
    document.getElementById("lastName").value = data.last_name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("dob").value = data.dob || "";
    document.getElementById("country").value = data.country || "";
    document.getElementById("kycStatus").value = data.kyc_status || "Not Verified";

}

async function logout(){

    await client.auth.signOut();

    window.location.href="login.html";

}

function deleteAccount(){

    if(!confirm(
        "Delete your account permanently?"
    )) return;

    alert(
        "Please contact support to permanently delete your account."
    );

}

const saveBtn = document.getElementById("saveProfile");

if (saveBtn) {
    saveBtn.addEventListener("click", saveProfile);
}

async function saveProfile(){

    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const email     = document.getElementById("email").value.trim();
    const phone     = document.getElementById("phone").value.trim();
    const dob       = document.getElementById("dob").value;
    const country   = document.getElementById("country").value;

    if(
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !dob ||
        !country
    ){
        alert("Please complete all fields.");
        return;
    }

    const { data, error } = await client.rpc("update_profile",{

        p_first_name:firstName,
        p_last_name:lastName,
        p_email:email,
        p_phone:phone,
        p_dob:dob,
        p_country:country

    });

    if(error){

        alert(error.message);
        return;

    }

    switch(data){

        case "SUCCESS":
            alert("Profile updated successfully.");
            break;

        case "VERIFIED":
            alert("Your account has already been verified. Please contact support if you need to update your personal details.");
            break;

        case "EMAIL_EXISTS":
            alert("That email address is already in use.");
            break;

        case "PHONE_EXISTS":
            alert("That phone number is already in use.");
            break;

        default:
            alert("Something went wrong.");

    }

}

const updatePasswordBtn = document.getElementById("updatePassword");

if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener("click", updatePassword);
}

async function updatePassword(){

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if(!currentPassword || !newPassword || !confirmPassword){
        alert("Please complete all password fields.");
        return;
    }

    if(newPassword !== confirmPassword){
        alert("New passwords do not match.");
        return;
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;

    if(!passwordRegex.test(newPassword)){
        alert(
`Password Requirements

✔ At least 8 characters
✔ One uppercase letter
✔ One lowercase letter
✔ One number
✔ One special character`
        );
        return;
    }

    // Verify current password
    const {
        data:{user}
    } = await client.auth.getUser();

    const { error: loginError } =
        await client.auth.signInWithPassword({

            email: user.email,
            password: currentPassword

        });

    if(loginError){
        alert("Current password is incorrect.");
        return;
    }

    const { error } =
        await client.auth.updateUser({

            password: newPassword

        });

    if(error){
        alert(error.message);
        return;
    }

    alert("Password updated successfully.");

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";

}

document
.getElementById("notificationIcon")
.addEventListener("click", async () => {

    const menu =
        document.getElementById("notificationMenu");

    if(menu.style.display === "block"){

        menu.style.display = "none";
        return;

    }

    await loadNotifications();

});

async function loadNotifications(){

    const {
        data:{user}
    } = await client.auth.getUser();

    if(!user) return;

    const { data } = await client
        .from("notifications")
        .select("*")
        .eq("user_id",user.id)
        .order("is_read",{ascending:true})
        .order("created_at",{ascending:false});

    const list =
        document.getElementById("notificationList");

    list.innerHTML="";

    if(data.length===0){

        list.innerHTML=
        "<div class='notificationItem'>No notifications.</div>";

    }else{

        data.forEach(n=>{

            list.innerHTML+=`

            <div class="notificationItem ${!n.is_read ? "notificationUnread":""}">

                <div class="notificationTitle">
                    ${n.title}
                </div>

                <div class="notificationMessage">
                    ${n.message}
                </div>

                <div class="notificationTime">
                    ${new Date(n.created_at).toLocaleString()}
                </div>

            </div>

            `;

        });

    }


    await client.rpc("mark_notifications_read");

    document
    .getElementById("notificationDot")
    .style.display="none";

}

async function checkNotifications(){

    const {
        data:{user}
    } = await client.auth.getUser();

    if(!user) return;

    const { count } = await client
        .from("notifications")
        .select("*",{
            count:"exact",
            head:true
        })
        .eq("user_id",user.id)
        .eq("is_read",false);

    document
        .getElementById("notificationDot")
        .style.display =
            count > 0 ? "block" : "none";

}

async function sendTicketEmail(){

    const {
        data:{user}
    } = await client.auth.getUser();

    const {
        data:{session}
    } = await client.auth.getSession();

    const { data: draw } = await client
        .from("draws")
        .select("id")
        .eq("status","live")
        .single();

    const { data: tickets } = await client
        .from("draw_tickets")
        .select("ticket_number")
        .eq("draw_id", draw.id)
        .eq("user_id", user.id)
        .order("ticket_number");

    await fetch("https://ynohexdhktetiepmbwnx.supabase.co/functions/v1/sendTicketEmail",{

        method:"POST",

        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },

        body:JSON.stringify({
            user_id:user.id,
            tickets:tickets
        })

    });
}
