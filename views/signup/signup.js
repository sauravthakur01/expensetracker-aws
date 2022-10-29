const form  = document.getElementById('signup-form')
const errorDiv = document.getElementById('error')

form.addEventListener('submit' , signup)

async function signup(e){
    
    e.preventDefault();
    errorDiv.innerHTML =''
    try {
        
        const signupDetails ={
            name:e.target.name.value,
            email:e.target.email.value,
            password:e.target.password.value
        }

        const response = await axios.post("http://54.174.108.24:3000/user/signup" , signupDetails)
        if (response.status === 201){
            console.log('success');
            alert('signup sucessfull')
            window.location.href='../login/login.html'
        }else{
            e.target.password.value='';
            console.log('bye')
        }
        

    } catch (err) {
        e.target.password.value='';
        error.innerHTML = `<div style="color:red;text-align:center;padding:10px;margin-bottom:-30px">${err}</div>`
    }
    
}