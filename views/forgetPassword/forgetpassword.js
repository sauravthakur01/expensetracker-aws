const forgetPass = document.getElementById('forgetPassword-form');

forgetPass.addEventListener('submit' , sendEmail);

async function sendEmail(e){
    e.preventDefault();
    // let email = e.target.email.value
    const form = new FormData(e.target);

    const userDetails = {
        email: form.get("email"),
    }
    console.log(userDetails);

    try {
        let response = await axios.post('http://54.174.108.24:3000/password/forgotpassword' , userDetails)
        if(response.status === 202){
            document.body.innerHTML += '<div style="color:red;text-align:center;margin-top:70px;">Mail Successfuly sent <div>'
        }else {
            throw new Error('Something went wrong!!!')
        }
    } catch (err) {
        document.body.innerHTML += `<div style="color:red;text-align:center;margin-top:70px;">${err} <div>`;
    }
}