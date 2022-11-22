const form = document.getElementById('login-form');
const errorDiv = document.getElementById('error')
const forgetPass = document.querySelector('.pass');

form.addEventListener('submit' , login)
forgetPass.addEventListener('click' , forgetPassword)

async function login(e){
    e.preventDefault() ;
    errorDiv.innerHTML =''
    try {
        
        let loginDetails = {
            email:e.target.email.value,
            password:e.target.password.value
        }

        const response = await axios.post("http://34.201.40.23:3000/user/login", loginDetails)
        if(response.status === 200){
            
            alert("User login sucessful")
            localStorage.setItem('user' , response.data.isPremium)
            localStorage.setItem('token' , response.data.token)
            window.location.href = '../expense/expense.html'
        }else{
            e.target.password.value='';
            console.log('error')
        }

    } catch (err) {
        e.target.password.value='';
        error.innerHTML = `<div style="color:red;text-align:center;padding:10px;margin-bottom:-30px">${err}</div>`
    }
}

function forgetPassword(e){
    e.preventDefault();
    window.location.href = '../forgetPassword/forgetPassword.html'
}