const form = document.getElementById('expense-form')
const expenseDiv = document.getElementById('expense-div');
const leaderboardDiv = document.getElementById('right'); 
const pagination = document.getElementById('pagination');
const perpage = document.getElementById('perpage');

let itemsPerPage = Number(localStorage.getItem('itemsperpage')) ;

let token = localStorage.getItem('token');

window.addEventListener('DOMContentLoaded' , loadScreen);


    function changetheme(){
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        document.getElementsByClassName('center')[0].classList.remove('light');
        document.getElementsByClassName('center')[0].classList.add('dark');
        document.getElementById('expense-div').classList.remove('light');
        document.getElementById('expense-div').classList.add('dark');
        document.getElementById('left').classList.remove('light');
        document.getElementById('left').classList.add('dark');
        document.getElementsByTagName('input')[0].classList.add('dark');
        document.getElementById('right').style = 'display:block'
        document.getElementById('premium').style = 'display:none'
        document.getElementById('report').style = 'display:block'
    }

async function loadScreen(e){

    e.preventDefault();
 
    localStorage.removeItem('clickedUser')
    let usertype = localStorage.getItem('user');
    console.log(usertype == "true")
    if(usertype == "true"){
        changetheme()
        getPremiumLeaderboard()
    }

    let page = 1  ;
   
    getLoadExpenses(page , itemsPerPage) ;
    
}

async function getLoadExpenses(page , itemsPerPage){
    try {
        let response = await axios.post(`http://54.174.108.24:3000/expense/${page}` ,{itemsPerPage:itemsPerPage}  , {headers:{"Authorization" : token}})
        // console.log(response.data.info)
        showExpenseOnScreen(response.data.data)
        showPagination(response.data.info)
    } catch (error) {
        console.log(error);
    }
}

function showExpenseOnScreen(data){

    expenseDiv.innerHTML =''

    data.map(data=>{ 
    const child = `<li class="list" id=${data.id}>
        <span class="expense-info"> ₹ ${data.amount} -${data.description} - ${data.category}</span>
        <span class="btns">
            
            <button onclick="remove('${data.id}')">Delete</button>
        </span>
    </li>`

    expenseDiv.innerHTML += child
    })
}

perpage.addEventListener('submit' , (e)=>{
    e.preventDefault();
    console.log(typeof(+e.target.itemsPerPage.value));
    localStorage.setItem('itemsperpage' , +e.target.itemsPerPage.value )
    itemsPerPage = localStorage.getItem('itemsperpage')
    getLoadExpenses(1 , +e.target.itemsPerPage.value);
})

function showPagination({currentPage,hasNextPage,hasPreviousPage,nextPage,previousPage,lastPage}){
    
    pagination.innerHTML ='';
    
    if(hasPreviousPage){
        const button1 = document.createElement('button');
        button1.innerHTML = previousPage ;
        button1.addEventListener('click' , ()=>getLoadExpenses(previousPage , itemsPerPage))
        pagination.appendChild(button1)
    }
    
    const button2 = document.createElement('button');
    button2.classList.add('active')
    button2.innerHTML = currentPage ;
    button2.addEventListener('click' , ()=>getLoadExpenses(currentPage , itemsPerPage))
    pagination.appendChild(button2)

    if(hasNextPage){
        const button3 = document.createElement('button');
        button3.innerHTML = nextPage ;
        button3.addEventListener('click' , ()=>getLoadExpenses(nextPage , itemsPerPage))
        pagination.appendChild(button3)
    }

    if( currentPage!=lastPage && nextPage!=lastPage && lastPage != 0){
        const button3 = document.createElement('button');
        button3.innerHTML = lastPage ;
        button3.addEventListener('click' , ()=>getLoadExpenses(lastPage , itemsPerPage))
        pagination.appendChild(button3)
    }
}

form.addEventListener('submit' , addExpense)

async function addExpense(e){
    e.preventDefault() ;
    
    try {
        const expenseDetails = {
            amount:e.target.amount.value ,
            description: e.target.description.value ,
            category:e.target.category.value
        }
        
        let response = await axios.post("http://54.174.108.24:3000/expense/add-expense", expenseDetails, {headers : {'Authorization': token}})
        if(response.status === 201){
            // console.log(response.data.data)
            addExpenseOnscreen(response.data.data)
        }else{
            throw new Error ('unavle to add Expense')
        }
        
    } catch (error) {
        console.log(error);
    }  
}

function addExpenseOnscreen(data){
    const child = `<li class="list" id=${data.id}>
        <span class="expense-info"> ₹ ${data.amount} -${data.description} - ${data.category}</span>
        <span class="btns">
            
            <button onclick="remove('${data.id}')">Delete</button>
        </span>
    </li>`

    expenseDiv.innerHTML += child ;
}


async function remove (id){
    try {
        await axios.delete(`http://54.174.108.24:3000/expense/delete-expense/${id}` , {headers : {'Authorization': token}} )
        removeFromScreen(id)
    } catch (error) {
        console.log(error);
    }
}

function removeFromScreen(id){
    let child = document.getElementById(id);
    if(child){
        expenseDiv.removeChild(child);
    }
}

document.getElementById('premium').onclick = async function(e){
    var x =0;
    try {
        const response = await axios.post('http://54.174.108.24:3000/payment/premiummembership', x, {headers : {'Authorization': token}})

        checkout(response.data);
    } catch (error) {
        console.log(error)
    }
}

async function getPremiumLeaderboard(){
    try {
        const response = await axios.get('http://54.174.108.24:3000/expense/premium-leaderboard', {headers : {'Authorization': token}} )
        
        if(response.data.success){
            if(response.data.data.length>0){
                response.data.data.sort((a,b)=>{
                    return b.totalExpense - a.totalExpense;
                });
                
                response.data.data.map((user , id)=>{
                    showLeaderboard(user , id);
                })
                
            }
        }
        
    } catch (err) {
        console.log(err)
    }
    
}

function showLeaderboard(user , id){
    let child = `<li class="leaderboardList">
            <p class="sno">${id+1} </p>
            <p class="name" id="user" onclick="openUserExpenses('${user.user.id}')">${user.user.name}</p>
            <p class="name">${user.totalExpense}</p>
    </li>`
    
    leaderboardDiv.innerHTML += child
}

function openUserExpenses(user){
    console.log(user)
    localStorage.setItem('clickedUser' , user)
    window.location.href = '../leaderboard/leaderboard.html'
}

function checkout(order){

    // console.log(order);
    // console.log(order.order.id)

    var options = {
        "key" : order.key_id,
        "amount": order.order.amount,
        "currency": "INR",
        "order_id": order.order.id,
        "handler": function (response) {
            
            alert(`Payment successfull . Payment Id:- ${response.razorpay_payment_id} ` );
            
            // console.log(response.razorpay_payment_id);
            // console.log(response.razorpay_order_id);
            // console.log(response.razorpay_signature);

            axios.post('http://54.174.108.24:3000/payment/updatestatus', response,
             {headers : {'Authorization': token}})
            .then(res => {
                console.log("done");
                console.log(res);
                alert("You are a premium user now");
                localStorage.setItem('user' , "true")
                premiumUser();
                getPremiumLeaderboard()
            })
            .catch(err => console.log(err));
        },
        "prefill": {
            "name": "Test User",
            "email": "test.user@example.com",
            "contact": "7003442036"
          },
        "theme": {
            "color": "#3399cc",
        },

        "callback_url": "expense.html"
    }

    var razorpay_1 = new Razorpay(options);

    razorpay_1.on('payment.failed', function(res) {
        alert(res.error.code);
        alert(res.error.description);
    });

    razorpay_1.open();
}

function premiumUser(){
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        document.getElementsByClassName('center')[0].classList.remove('light');
        document.getElementsByClassName('center')[0].classList.add('dark');
        document.getElementById('expense-div').classList.remove('light');
        document.getElementById('expense-div').classList.add('dark');
        document.getElementById('left').classList.remove('light');
        document.getElementById('left').classList.add('dark');
        document.getElementsByTagName('input')[0].classList.add('dark');
        document.getElementById('right').style = 'display:block'
}

document.getElementById('logout').onclick = function(e){
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '../login/login.html'
}

document.getElementById('report').onclick = function(e){
    
    let usertype = localStorage.getItem('user');
    console.log(usertype == "true")
    if(usertype == "true"){
        window.location.href = '../downloadreports/reports.html'
    }
}
